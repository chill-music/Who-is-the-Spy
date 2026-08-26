/* ═══════════════════════════════════════════════════════════════
   Crown Dice — Royal Dice Game
   - 6-face fair dice derived from Firestore server seed (T-S1)
   - Real-money-style betting via SecurityService (T-S9)
   - Idempotent debits per round using dedup keys
   ═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var { useState, useEffect, useRef, useCallback } = React;

    /* ── Game state ── */
    var CDGame = function (props) {
        var user = props.user;
        var lang = props.lang || 'ar';
        var onClose = props.onClose;

        var [balance, setBalance] = useState(0);
        var [lastRoll, setLastRoll] = useState(null); // { roll, target, won }
        var [isRolling, setIsRolling] = useState(false);
        var [showBetModal, setShowBetModal] = useState(false);
        var [selectedFace, setSelectedFace] = useState(null); // 1..6
        var [betAmount, setBetAmount] = useState(0);

        /* Load balance once */
        useEffect(function () {
            if (user && user.uid && window.usersCollection) {
                window.usersCollection.doc(user.uid).get().then(function (doc) {
                    var d = doc.data();
                    setBalance(d && d.coins ? d.coins : 0);
                }).catch(function () { setBalance(0); });
            }
        }, [user && user.uid]);

        /* Place bet — idempotent debit */
        var placeBet = async function (face, amount) {
            if (!user || !user.uid || !window.SecurityService) {
                if (window.showToast) window.showToast('Service unavailable');
                return;
            }
            if (balance < amount) {
                if (window.showToast) window.showToast('?? ??? ???'); // Insufficient balance
                return;
            }
            var idemKey = `${user.uid}_crownbet_${Date.now()}_${face}`;
            try {
                var res = await window.SecurityService.applyCurrencyTransaction(
                    user.uid, -amount, 'Crown Dice Bet: ' + face, { face: face, round: Date.now() }, { idemKey }
                );
                if (res && res.success === false) {
                    if (window.showToast) window.showToast('Bet blocked: ' + (res.error || ''));
                    return;
                }
                setBalance(prev => prev + amount); // debit already applied by service; adjust UI
                setBetAmount(amount);
                setSelectedFace(face);
                setShowBetModal(false);
            } catch (e) {
                console.error('[CD] Bet error:', e);
                if (window.showToast) window.showToast('?? ???!');
            }
        };

        /* Roll dice — fair derive from server */
        var rollDice = async function () {
            if (isRolling || !selectedFace || !window.SnakeLadderFair) return;
            setIsRolling(true);

            /* T-S1: deriveRoll uses roomId + turnKey + revealMs.
               For Crown Dice we use a simple per-round commit-reveal: */
            if (window.SnakeLadderFair && window.db) {
                try {
                    var roomId = 'crown_dice_' + user.uid;
                    var turnKey = 'cd_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
                    var revealMs = await window.SnakeLadderService.commitRollReveal(turnKey);
                    var roll = window.SnakeLadderFair.deriveRoll(roomId, turnKey, revealMs);
                    setLastRoll({ roll: roll, target: selectedFace, won: roll === selectedFace });
                    setTimeout(function () { setIsRolling(false); }, 1200);
                } catch (e) {
                    console.error('[CD] Roll error:', e);
                    setIsRolling(false);
                }
            } else {
                /* Offline fallback: fair Math.random */
                var roll = Math.floor(Math.random() * 6) + 1;
                setLastRoll({ roll: roll, target: selectedFace, won: roll === selectedFace });
                setTimeout(function () { setIsRolling(false); }, 800);
            }
        };

        /* Cash out win */
        var collectWin = async function () {
            if (!lastRoll || !lastRoll.won || !user || !window.SecurityService) return;
            var winAmt = betAmount * lastRoll.roll; /* simple payout: bet * rolled value */
            var idemKey = `${user.uid}_crownwin_${lastRoll.roll}_${Date.now()}`;
            try {
                await window.SecurityService.applyCurrencyTransaction(
                    user.uid, winAmt, 'Crown Dice Win: ' + lastRoll.roll, { roll: lastRoll.roll, round: Date.now() }, { idemKey }
                );
                setBalance(prev => prev + winAmt);
                if (window.showToast) window.showToast('?? ???? ' + winAmt);
                setLastRoll(null);
                setBetAmount(0);
                setSelectedFace(null);
            } catch (e) {
                console.error('[CD] Collect error:', e);
            }
        };

        /* ── JSX ───────────────────────────────────────────────────── */
        var diceFaces = [
            { pips: '⚀', value: 1, rotateX: 0, rotateY: 0 },
            { pips: '⚁', value: 2, rotateX: 0, rotateY: -90 },
            { pips: '⚂', value: 3, rotateX: -90, rotateY: 0 },
            { pips: '⚃', value: 4, rotateX: 90, rotateY: 0 },
            { pips: '⚄', value: 5, rotateX: 0, rotateY: 90 },
            { pips: '⚅', value: 6, rotateX: 0, rotateY: 180 }
        ];

        var renderDice = function () {
            if (!isRolling && lastRoll) {
                var rollInfo = lastRoll;
                var faceData = diceFaces[rollInfo.roll - 1];
                var style = {
                    transform: 'rotateX(' + faceData.rotateX + 'deg) rotateY(' + faceData.rotateY + 'deg)',
                    transition: 'transform 0.3s cubic-bezier(0.2, 1.5, 0.45, 1)'
                };
                return React.createElement('div', { className: 'cd-dice-visual', style: style }, faceData.pips);
            }
            /* While rolling: show animated cube (simplified – use CSS tumble later) */
            return React.createElement('div', { className: 'cd-dice-visual' }, '⚀');
        };

        return React.createElement('div', null,
            /* Balance display */
            React.createElement('div', { style: { marginBottom: '12px', textAlign: 'center' } },
                React.createElement('div', { style: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 } }, lang === 'ar' ? 'الرصيد' : 'Balance'),
                React.createElement('div', { style: { fontSize: '28px', fontWeight: 900, color: '#10b981' } }, balance)
            ),

            /* Dice display */
            React.createElement('div', {
                style: {
                    width: '80px', height: '80px', margin: '0 auto 16px',
                    background: 'rgba(255,255,255,0.08)', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid rgba(16,185,129,0.4)',
                    transition: 'transform 0.3s'
                }
            }, renderDice()),

            /* Roll button */
            !isRolling && React.createElement('button', {
                onClick: rollDice,
                style: {
                    width: '100%', padding: '8px', borderRadius: '8px',
                    background: 'linear-gradient(135deg,#9b27b0,#e040fb)',
                    color: '#fff', fontWeight: 900, fontSize: '12px',
                    cursor: 'pointer', border: 'none', marginBottom: '12px'
                }
            }, lang === 'ar' ? 'رمي النرد' : 'Roll Dice'),

            /* Bet panel (show when a face is selected or always visible) */
            React.createElement('div', { style: { marginTop: '12px' } },
                React.createElement('div', { style: { fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' } },
                    lang === 'ar' ? 'راهن علىface' : 'Bet on face'
                ),
                React.createElement('div', { style: { display: 'flex', gap: '6px', justifyContent: 'center' } },
                    [1, 2, 3, 4, 5, 6].map(function (f) {
                        var isSelected = selectedFace === f;
                        return React.createElement('button', {
                            key: f,
                            onClick: function () { setSelectedFace(f); },
                            style: {
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: isSelected ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)',
                                border: '2px solid ' + (isSelected ? '#10b981' : 'rgba(255,255,255,0.2)'),
                                color: '#fff', fontWeight: 900, fontSize: '14px',
                                cursor: 'pointer', transition: 'all 0.15s'
                            }
                        }, f);
                    })
                ),
                selectedFace && React.createElement('div', {
                    style: { marginTop: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.7)' },
                    lang === 'ar' ? 'تم الرهان على الوجه ' + selectedFace : 'Bet placed on face ' + selectedFace
                }),
                selectedFace && betAmount && React.createElement('button', {
                    onClick: function () { collectWin(); },
                    style: {
                        marginTop: '8px', width: '100%', padding: '8px', borderRadius: '8px',
                        background: 'linear-gradient(135deg,#48dbfb,#06d6a0)', color: '#1a0a3b',
                        fontWeight: 900, fontSize: '12px', cursor: 'pointer', border: 'none'
                    }
                }, lang === 'ar' ? 'جمع الأرباح' : 'Collect Win')
            )
        );
    };

    window.CrownDiceGame = CDGame;
})();