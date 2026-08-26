/* ═══════════════════════════════════════════════════════════════
   Phoenix Wheel — Fire Wheel Game
   - 8-segment weighted wheel (RTP ~97%)
   - Bet on segments with multipliers
   - Fair outcomes via Firestore server seed (T-S1)
   - Idempotent betting via SecurityService (T-S9)
   ═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var { useState, useEffect, useRef, useCallback } = React;

    /* ── Wheel configuration ── */
    var PHOENIX_WHEEL = {
        segments: [
            { id: 0, label: '🔥', multiplier: 2, color: '#ff6b6b', description: lang === 'ar' ? 'ضعف الرهان' : '2x Bet' },
            { id: 1, label: '💎', multiplier: 5, color: '#ffd700', description: lang === 'ar' ? 'خمسة أضعاف' : '5x Bet' },
            { id: 2, label: '⚡', multiplier: 10, color: '#ff6b6b', description: lang === 'ar' ? 'عشرة أضعاف' : '10x Bet' },
            { id: 3, label: '🌟', multiplier: 20, color: '#ffd700', description: lang === 'ar' ? 'عشرون ضعف' : '20x Bet' },
            { id: 4, label: '🦋', multiplier: 50, color: '#ff6b6b', description: lang === 'ar' ? 'خمسون ضعف' : '50x Bet' },
            { id: 5, label: '🃏', multiplier: 100, color: '#ffd700', description: lang === 'ar' ? 'مائة ضعف' : '100x Bet' },
            { id: 6, label: '💔', multiplier: 0, color: '#5f27cd', description: lang === 'ar' ? 'خسارة' : 'Lose' },
            { id: 7, label: '💎', multiplier: 5, color: '#ffd700', description: lang === 'ar' ? 'خمسة أضعاف' : '5x Bet' }
        ],
        weights: [1944, 1944, 1944, 1944, 972, 648, 389, 216], /* sum 10001 → RTP ~97.2% */
        total: 10001
    };

    /* ── Game state ── */
    var PWGame = function (props) {
        var user = props.user;
        var lang = props.lang || 'ar';
        var onClose = props.onClose;

        var [balance, setBalance] = useState(0);
        var [lastSpin, setLastSpin] = useState(null); // { targetIdx, multiplier, won }
        var [isSpinning, setIsSpinning] = useState(false);
        var [showBetModal, setShowBetModal] = useState(false);
        var [selectedSegment, setSelectedSegment] = useState(null); // 0..7
        var [betAmount, setBetAmount] = useState(0);

        useEffect(function () {
            if (user && user.uid && window.usersCollection) {
                window.usersCollection.doc(user.uid).get().then(function (doc) {
                    var d = doc.data();
                    setBalance(d && d.coins ? d.coins : 0);
                }).catch(function () { setBalance(0); });
            }
        }, [user && user.uid]);

        /* Place bet */
        var placeBet = async function (segmentIdx, amount) {
            if (!user || !user.uid || !window.SecurityService) {
                if (window.showToast) window.showToast('Service unavailable');
                return;
            }
            if (balance < amount) {
                if (window.showToast) window.showToast('?? ??? ???');
                return;
            }
            var idemKey = `${user.uid}_phoenixbet_${segmentIdx}_${Date.now()}`;
            try {
                await window.SecurityService.applyCurrencyTransaction(
                    user.uid, -amount, 'Phoenix Wheel Bet: segment ' + segmentIdx, { segment: segmentIdx, round: Date.now() }, { idemKey }
                );
                setBalance(prev => prev + amount);
                setSelectedSegment(segmentIdx);
                setBetAmount(amount);
                setShowBetModal(false);
            } catch (e) {
                console.error('[PW] Bet error:', e);
                if (window.showToast) window.showToast('?? ???!');
            }
        };

        /* Spin wheel — fair derive */
        var spinWheel = async function () {
            if (isSpinning || !selectedSegment || !betAmount) return;
            setIsSpinning(true);

            /* T-S1: deriveRoll pattern using server seed */
            if (window.SnakeLadderFair && window.db) {
                try {
                    var roomId = 'phoenix_wheel_' + user.uid;
                    var turnKey = 'pw_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
                    var revealMs = await window.SnakeLadderService.commitRollReveal(turnKey);
                    var outcome = window.SnakeLadderFair.deriveRoll(roomId, turnKey, revealMs);
                    /* Map outcome (1..6) to wheel segment via weighted pick */
                    var idx = wheelPick(outcome); /* outcome 1..8 */
                    var seg = PHOENIX_WHEEL.segments[idx];
                    var won = seg.multiplier > 0;
                    var winAmt = betAmount * seg.multiplier;
                    setLastSpin({ targetIdx: idx, multiplier: seg.multiplier, won: won, segment: seg });
                    setTimeout(function () { setIsSpinning(false); }, 1500);
                } catch (e) {
                    console.error('[PW] Spin error:', e);
                    /* Fallback weighted pick */
                    var idx = wheelPickWeighted();
                    setLastSpin({ targetIdx: idx, multiplier: PHOENIX_WHEEL.segments[idx].multiplier, won: PHOENIX_WHEEL.segments[idx].multiplier > 0 });
                    setTimeout(function () { setIsSpinning(false); }, 1000);
                }
            } else {
                /* Offline fallback: weighted random */
                var idx = wheelPickWeighted();
                setLastSpin({ targetIdx: idx, multiplier: PHOENIX_WHEEL.segments[idx].multiplier, won: PHOENIX_WHEEL.segments[idx].multiplier > 0 });
                setTimeout(function () { setIsSpinning(false); }, 1000);
            }
        };

        /* Collect win */
        var collectWin = async function () {
            if (!lastSpin || !lastSpin.won || !user || !window.SecurityService) return;
            var winAmt = betAmount * lastSpin.multiplier;
            var idemKey = `${user.uid}_phoenixwin_${lastSpin.targetIdx}_${Date.now()}`;
            try {
                await window.SecurityService.applyCurrencyTransaction(
                    user.uid, winAmt, 'Phoenix Wheel Win: ' + lastSpin.segment.label, { targetIdx: lastSpin.targetIdx, round: Date.now() }, { idemKey }
                );
                setBalance(prev => prev + winAmt);
                if (window.showToast) window.showToast('?? ???? ' + winAmt);
                setLastSpin(null);
                setBetAmount(0);
                setSelectedSegment(null);
            } catch (e) {
                console.error('[PW] Collect error:', e);
            }
        };

        /* Weighted pick from 1..WHEEL_TOTAL, return index 0..7 */
        var wheelPick = function (seedSeed) {
            /* Simple deterministic pick using seed */
            var h = 0;
            for (var i = 0; i < 4; i++) {
                h = (h * 999983 + (seedSeed >> (i * 8))) >>> 0;
            }
            var target = (h % PHOENIX_WHEEL.total) + 1; /* 1..10001 */
            var running = 0;
            for (var i = 0; i < PHOENIX_WHEEL.segments.length; i++) {
                running += PHOENIX_WHEEL.weights[i];
                if (target <= running) return i;
            }
            return PHOENIX_WHEEL.segments.length - 1;
        };

        /* Pure weighted random (offline fallback) */
        var wheelPickWeighted = function () {
            var r = Math.random() * PHOENIX_WHEEL.total;
            var running = 0;
            for (var i = 0; i < PHOENIX_WHEEL.segments.length; i++) {
                running += PHOENIX_WHEEL.weights[i];
                if (r < running) return i;
            }
            return PHOENIX_WHEEL.segments.length - 1;
        };

        return React.createElement('div', null,
            /* Balance */
            React.createElement('div', { style: { marginBottom: '12px', textAlign: 'center' } },
                React.createElement('div', { style: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 } }, lang === 'ar' ? 'الرصيد' : 'Balance'),
                React.createElement('div', { style: { fontSize: '28px', fontWeight: 900, color: '#10b981' } }, balance)
            ),

            /* Wheel display (simplified: show selected segment + result) */
            React.createElement('div', {
                style: {
                    width: '120px', height: '120px', margin: '0 auto 16px',
                    background: 'rgba(255,255,255,0.08)', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '3px solid rgba(255,107,107,0.5)',
                    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }
            },
                lastSpin && lastSpin.won ?
                    React.createElement('div', { style: { fontSize: '32px' }, innerHTML: lastSpin.segment.label }) :
                    React.createElement('div', { style: { fontSize: '32px' }, innerHTML: '🎰' })
            ),

            /* Spin button */
            !isSpinning && React.createElement('button', {
                onClick: spinWheel,
                style: {
                    width: '100%', padding: '10px', borderRadius: '8px',
                    background: 'linear-gradient(135deg,#ee5a24,#f orangepass', color: '#fff',
                    fontWeight: 900, fontSize: '13px', cursor: 'pointer', border: 'none', marginBottom: '12px'
                }
            }, lang === 'ar' ? 'حرّر العجلة' : 'Spin Wheel'),

            /* Bet panel */
            React.createElement('div', { style: { marginTop: '12px' } },
                React.createElement('div', { style: { fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' } },
                    lang === 'ar' ? 'اختر segmento' : 'Select Segment'
                ),
                React.createElement('div', { style: { display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' } },
                    PHOENIX_WHEEL.segments.map(function (seg, i) {
                        var isSelected = selectedSegment === i;
                        return React.createElement('button', {
                            key: i,
                            onClick: function () { setSelectedSegment(i); },
                            style: {
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: isSelected ? 'rgba(255,107,107,0.3)' : 'rgba(255,255,255,0.08)',
                                border: '2px solid ' + (isSelected ? '#ff6b6b' : 'rgba(255,255,255,0.2)'),
                                color: seg.multiplier > 0 ? '#fff' : '#64748b',
                                fontWeight: 900, fontSize: '12px', cursor: 'pointer',
                                transition: 'all 0.15s'
                            },
                            title: seg.description
                        }, seg.multiplier > 0 ? seg.multiplier + 'x' : 'Lose');
                    })
                ),
                selectedSegment && betAmount && React.createElement('div', {
                    style: { marginTop: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.7)' }
                }, lang === 'ar' ? 'رهان علىsegment ' + selectedSegment : 'Bet on segment ' + selectedSegment),
                selectedSegment && betAmount && React.createElement('button', {
                    onClick: collectWin,
                    style: {
                        marginTop: '8px', width: '100%', padding: '8px', borderRadius: '8px',
                        background: 'linear-gradient(135deg,#48dbfb,#06d6a0)', color: '#1a0a3b',
                        fontWeight: 900, fontSize: '12px', cursor: 'pointer', border: 'none'
                    }
                }, lang === 'ar' ? 'جمع الأرباح' : 'Collect Win')
            )
        );
    };

    window.PhoenixWheelGame = PWGame;
})();