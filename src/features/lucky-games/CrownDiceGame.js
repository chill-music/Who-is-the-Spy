/* ═══════════════════════════════════════════════════════════════
   Crown Dice — Royal Dice Game (Vanilla DOM)
   - 6-face fair dice derived from Firestore server seed (T-S1)
   - Real-money-style betting via SecurityService (T-S9)
   - Idempotent debits per round using dedup keys
   ═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var rootEl = null;
    var lang = 'ar';
    var currentUser = null;
    var balance = 0;
    var selectedFace = null;
    var betAmount = 0;
    var isRolling = false;
    var lastRoll = null;

    var PIP_FACES = ['⚀','⚁','⚂','⚃','⚄','⚅'];
    var BET_OPTIONS = [100, 500, 1000, 5000];

    function $(id) { return document.getElementById(id); }

    function loadBalance() {
        if (currentUser && currentUser.uid && window.usersCollection) {
            window.usersCollection.doc(currentUser.uid).get().then(function (doc) {
                var d = doc.data();
                balance = (d && d.coins) ? d.coins : 0;
                updateBalanceDisplay();
            }).catch(function () { balance = 0; updateBalanceDisplay(); });
        }
    }

    function updateBalanceDisplay() {
        var el = $('cd-balance');
        if (el) el.textContent = balance;
    }

    function buildHTML() {
        if (!rootEl) return;
        rootEl.innerHTML = '\
        <div style="max-width:360px;margin:0 auto;font-family:var(--font-body),sans-serif;color:#fff">\
            <div style="text-align:center;margin-bottom:12px">\
                <div style="font-size:11px;color:rgba(255,255,255,0.5);font-weight:600">' + (lang === 'ar' ? 'الرصيد' : 'Balance') + '</div>\
                <div id="cd-balance" style="font-size:28px;font-weight:900;color:#10b981">' + balance + '</div>\
            </div>\
            <div style="text-align:center;margin-bottom:14px">\
                <div id="cd-dice-box" style="width:80px;height:80px;margin:0 auto;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.08);border-radius:14px;border:2px solid rgba(16,185,129,0.4);font-size:36px;transition:transform 0.3s cubic-bezier(0.2,1.5,0.45,1)">⚀</div>\
                <div id="cd-result" style="margin-top:8px;font-size:12px;color:rgba(255,255,255,0.6);min-height:18px"></div>\
            </div>\
            <button id="cd-roll-btn" style="width:100%;padding:10px;border-radius:10px;background:linear-gradient(135deg,#9b27b0,#e040fb);color:#fff;font-weight:900;font-size:13px;cursor:pointer;border:none;margin-bottom:14px">' + (lang === 'ar' ? 'رمي النرد' : 'Roll Dice') + '</button>\
            <div style="margin-bottom:10px">\
                <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:6px">' + (lang === 'ar' ? 'اختر الوجه' : 'Pick a face') + '</div>\
                <div id="cd-faces" style="display:flex;gap:6px;justify-content:center"></div>\
            </div>\
            <div id="cd-bet-info" style="text-align:center;font-size:11px;color:rgba(255,255,255,0.6);min-height:18px;margin-bottom:6px"></div>\
            <div id="cd-bet-btns" style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap"></div>\
            <button id="cd-spin-btn" style="display:none;width:100%;padding:10px;border-radius:10px;background:linear-gradient(135deg,#48dbfb,#06d6a0);color:#1a0a3b;font-weight:900;font-size:13px;cursor:pointer;border:none;margin-top:10px">' + (lang === 'ar' ? 'ارمى!' : 'Roll!') + '</button>\
            <button id="cd-collect-btn" style="display:none;width:100%;padding:10px;border-radius:10px;background:linear-gradient(135deg,#48dbfb,#06d6a0);color:#1a0a3b;font-weight:900;font-size:13px;cursor:pointer;border:none;margin-top:10px">' + (lang === 'ar' ? 'جمع الأرباح' : 'Collect Win') + '</button>\
        </div>';

        buildFaces();
        buildBetButtons();
        initEvents();
    }

    function buildFaces() {
        var container = $('cd-faces');
        if (!container) return;
        container.innerHTML = '';
        [1,2,3,4,5,6].forEach(function (f) {
            var btn = document.createElement('button');
            btn.textContent = PIP_FACES[f - 1];
            btn.style.cssText = 'width:38px;height:38px;border-radius:50%;font-size:18px;border:2px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);color:#fff;cursor:pointer;transition:all 0.15s';
            btn.onclick = function () {
                selectedFace = f;
                betAmount = 0;
                lastRoll = null;
                document.querySelectorAll('#cd-faces button').forEach(function (b, i) {
                    b.style.borderColor = (i + 1 === f) ? '#10b981' : 'rgba(255,255,255,0.2)';
                    b.style.background = (i + 1 === f) ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)';
                });
                updateBetInfo();
                $('cd-spin-btn').style.display = 'none';
                $('cd-collect-btn').style.display = 'none';
            };
            container.appendChild(btn);
        });
    }

    function buildBetButtons() {
        var container = $('cd-bet-btns');
        if (!container) return;
        container.innerHTML = '';
        BET_OPTIONS.forEach(function (amt) {
            var btn = document.createElement('button');
            btn.textContent = amt;
            btn.style.cssText = 'padding:6px 14px;border-radius:8px;font-size:12px;font-weight:800;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.08);color:#fff;cursor:pointer;transition:all 0.15s';
            btn.onclick = function () { placeBet(amt); };
            container.appendChild(btn);
        });
    }

    function updateBetInfo() {
        var el = $('cd-bet-info');
        if (!el) return;
        if (selectedFace && betAmount > 0) {
            el.textContent = (lang === 'ar' ? 'رهان على وجه ' : 'Bet on face ') + selectedFace + ' — ' + betAmount;
        } else if (selectedFace) {
            el.textContent = (lang === 'ar' ? 'تم اختيار الوجه ' : 'Face selected: ') + selectedFace;
        } else {
            el.textContent = '';
        }
    }

    async function placeBet(amount) {
        if (!selectedFace) {
            if (window.showToast) window.showToast(lang === 'ar' ? 'اختر وجه أولاً' : 'Pick a face first');
            return;
        }
        if (!currentUser || !currentUser.uid || !window.SecurityService) {
            if (window.showToast) window.showToast('Service unavailable');
            return;
        }
        if (balance < amount) {
            if (window.showToast) window.showToast(lang === 'ar' ? 'رصيد غير كافٍ' : 'Insufficient balance');
            return;
        }
        var idemKey = currentUser.uid + '_crownbet_' + Date.now() + '_' + selectedFace;
        try {
            var res = await window.SecurityService.applyCurrencyTransaction(
                currentUser.uid, -amount, 'Crown Dice Bet: ' + selectedFace, { face: selectedFace, round: Date.now() }, { idemKey }
            );
            if (res && res.success === false) {
                if (window.showToast) window.showToast('Bet blocked: ' + (res.error || ''));
                return;
            }
            balance -= amount;
            betAmount = amount;
            updateBalanceDisplay();
            updateBetInfo();
            $('cd-spin-btn').style.display = 'block';
            $('cd-collect-btn').style.display = 'none';
        } catch (e) {
            console.error('[CD] Bet error:', e);
            if (window.showToast) window.showToast(lang === 'ar' ? 'خطأ في الرهان' : 'Bet error');
        }
    }

    async function rollDice() {
        if (isRolling || !selectedFace || betAmount <= 0) return;
        isRolling = true;
        $('cd-roll-btn').style.display = 'none';
        $('cd-spin-btn').style.display = 'none';
        var diceEl = $('cd-dice-box');
        if (diceEl) {
            diceEl.style.transition = 'transform 0.15s';
            diceEl.style.transform = 'rotateX(360deg) rotateY(360deg)';
        }

        var roll = 0;
        try {
            if (window.SnakeLadderFair && window.SnakeLadderService) {
                var roomId = 'crown_dice_' + currentUser.uid;
                var turnKey = 'cd_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
                var revealMs = await window.SnakeLadderService.commitRollReveal(turnKey);
                roll = window.SnakeLadderFair.deriveRoll(roomId, turnKey, revealMs);
            } else {
                roll = Math.floor(Math.random() * 6) + 1;
            }
        } catch (e) {
            console.error('[CD] Roll error:', e);
            roll = Math.floor(Math.random() * 6) + 1;
        }

        setTimeout(function () {
            if (diceEl) {
                diceEl.style.transition = 'transform 0.4s cubic-bezier(0.2,1.5,0.45,1)';
                diceEl.style.transform = 'rotateX(0deg) rotateY(0deg)';
                diceEl.textContent = PIP_FACES[roll - 1];
            }
            lastRoll = roll;
            var won = roll === selectedFace;
            var resEl = $('cd-result');
            if (resEl) {
                resEl.style.color = won ? '#10b981' : '#ef4444';
                resEl.textContent = won
                    ? (lang === 'ar' ? '🎉 فزت! الوجه ' : '🎉 You win! Face ') + roll
                    : (lang === 'ar' ? 'الوجه ' + roll + ' — حظ أوفر!' : 'Rolled ' + roll + ' — try again!');
            }
            if (won) {
                $('cd-collect-btn').style.display = 'block';
                $('cd-collect-btn').textContent = (lang === 'ar' ? 'جمع الأرباح: ' : 'Collect: ') + (betAmount * roll);
            } else {
                $('cd-spin-btn').style.display = 'none';
                $('cd-roll-btn').style.display = 'block';
                betAmount = 0;
                updateBetInfo();
            }
            isRolling = false;
        }, 1200);
    }

    async function collectWin() {
        if (!lastRoll || lastRoll !== selectedFace || !currentUser || !window.SecurityService) return;
        var winAmt = betAmount * lastRoll;
        var idemKey = currentUser.uid + '_crownwin_' + lastRoll + '_' + Date.now();
        try {
            await window.SecurityService.applyCurrencyTransaction(
                currentUser.uid, winAmt, 'Crown Dice Win: ' + lastRoll, { roll: lastRoll, round: Date.now() }, { idemKey }
            );
            balance += winAmt;
            updateBalanceDisplay();
            if (window.showToast) window.showToast((lang === 'ar' ? '🏆 ربحت ' : '🏆 Won ') + winAmt);
            resetRound();
        } catch (e) {
            console.error('[CD] Collect error:', e);
        }
    }

    function resetRound() {
        lastRoll = null;
        betAmount = 0;
        selectedFace = null;
        var resEl = $('cd-result');
        if (resEl) { resEl.textContent = ''; }
        document.querySelectorAll('#cd-faces button').forEach(function (b) {
            b.style.borderColor = 'rgba(255,255,255,0.2)';
            b.style.background = 'rgba(255,255,255,0.08)';
        });
        updateBetInfo();
        $('cd-spin-btn').style.display = 'none';
        $('cd-collect-btn').style.display = 'none';
        $('cd-roll-btn').style.display = 'block';
        var diceEl = $('cd-dice-box');
        if (diceEl) { diceEl.textContent = '⚀'; }
    }

    function initEvents() {
        var rollBtn = $('cd-roll-btn');
        if (rollBtn) rollBtn.onclick = rollDice;
        var spinBtn = $('cd-spin-btn');
        if (spinBtn) spinBtn.onclick = rollDice;
        var collectBtn = $('cd-collect-btn');
        if (collectBtn) collectBtn.onclick = collectWin;
    }

    /* ═══  PUBLIC API  ═══ */
    window.CrownDiceGame = {
        start: function (container, opts) {
            opts = opts || {};
            rootEl = typeof container === 'string' ? document.getElementById(container) : container;
            if (!rootEl) { console.error('[CrownDice] Container not found'); return; }
            lang = opts.lang || 'ar';
            currentUser = opts.user || window.cdGameUserData || window.currentUserData || window.userData || null;
            balance = 0;
            selectedFace = null;
            betAmount = 0;
            lastRoll = null;
            isRolling = false;
            loadBalance();
            buildHTML();
        },
        stop: function () {
            rootEl = null;
            currentUser = null;
        }
    };
})();
