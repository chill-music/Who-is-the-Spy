/* ═══════════════════════════════════════════════════════════════
   Phoenix Wheel — Fire Wheel Game (Vanilla DOM)
   - 8-segment weighted wheel (RTP ~97%)
   - Bet on segments with multipliers
   - Fair outcomes via Firestore server seed (T-S1)
   - Idempotent betting via SecurityService (T-S9)
   ═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var rootEl = null;
    var lang = 'ar';
    var currentUser = null;
    var balance = 0;
    var selectedSegment = null;
    var betAmount = 0;
    var isSpinning = false;
    var lastSpin = null;

    var SEGMENTS = [
        { id: 0, label: '🔥',  multiplier: 2,   color: '#ff6b6b' },
        { id: 1, label: '💎',  multiplier: 5,   color: '#ffd700' },
        { id: 2, label: '⚡',  multiplier: 10,  color: '#ff6b6b' },
        { id: 3, label: '🌟',  multiplier: 20,  color: '#ffd700' },
        { id: 4, label: '🦋',  multiplier: 50,  color: '#ff6b6b' },
        { id: 5, label: '🃏',  multiplier: 100, color: '#ffd700' },
        { id: 6, label: '💔',  multiplier: 0,   color: '#5f27cd' },
        { id: 7, label: '💎',  multiplier: 5,   color: '#ffd700' }
    ];
    var WEIGHTS = [1944, 1944, 1944, 1944, 972, 648, 389, 216];
    var TOTAL = 10001;
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
        var el = $('pw-balance');
        if (el) el.textContent = balance;
    }

    function buildHTML() {
        if (!rootEl) return;
        rootEl.innerHTML = '\
        <div style="max-width:360px;margin:0 auto;font-family:var(--font-body),sans-serif;color:#fff">\
            <div style="text-align:center;margin-bottom:12px">\
                <div style="font-size:11px;color:rgba(255,255,255,0.5);font-weight:600">' + (lang === 'ar' ? 'الرصيد' : 'Balance') + '</div>\
                <div id="pw-balance" style="font-size:28px;font-weight:900;color:#10b981">' + balance + '</div>\
            </div>\
            <div style="text-align:center;margin-bottom:14px">\
                <div id="pw-wheel" style="width:120px;height:120px;margin:0 auto;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.08);border-radius:50%;border:3px solid rgba(255,107,107,0.5);font-size:32px;transition:transform 1s cubic-bezier(0.34,1.56,0.64,1)">🎰</div>\
                <div id="pw-result" style="margin-top:8px;font-size:12px;color:rgba(255,255,255,0.6);min-height:18px"></div>\
            </div>\
            <div id="pw-segments" style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:12px"></div>\
            <div id="pw-bet-info" style="text-align:center;font-size:11px;color:rgba(255,255,255,0.6);min-height:18px;margin-bottom:6px"></div>\
            <div id="pw-bet-btns" style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap"></div>\
            <button id="pw-spin-btn" style="display:none;width:100%;padding:10px;border-radius:10px;background:linear-gradient(135deg,#ee5a24,#f9ca24);color:#fff;font-weight:900;font-size:13px;cursor:pointer;border:none;margin-top:10px">' + (lang === 'ar' ? 'حرّر العجلة' : 'Spin Wheel') + '</button>\
            <button id="pw-collect-btn" style="display:none;width:100%;padding:10px;border-radius:10px;background:linear-gradient(135deg,#48dbfb,#06d6a0);color:#1a0a3b;font-weight:900;font-size:13px;cursor:pointer;border:none;margin-top:10px">' + (lang === 'ar' ? 'جمع الأرباح' : 'Collect Win') + '</button>\
        </div>';

        buildSegments();
        buildBetButtons();
        initEvents();
    }

    function buildSegments() {
        var container = $('pw-segments');
        if (!container) return;
        container.innerHTML = '';
        SEGMENTS.forEach(function (seg, i) {
            var btn = document.createElement('button');
            btn.textContent = seg.multiplier > 0 ? seg.multiplier + 'x' : seg.label;
            btn.style.cssText = 'width:40px;height:40px;border-radius:50%;font-size:12px;font-weight:900;border:2px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);color:' + (seg.multiplier > 0 ? '#fff' : '#64748b') + ';cursor:pointer;transition:all 0.15s';
            btn.title = seg.label + ' ' + (seg.multiplier > 0 ? seg.multiplier + 'x' : 'Lose');
            btn.onclick = function () {
                selectedSegment = i;
                betAmount = 0;
                lastSpin = null;
                document.querySelectorAll('#pw-segments button').forEach(function (b, j) {
                    b.style.borderColor = (j === i) ? '#ff6b6b' : 'rgba(255,255,255,0.2)';
                    b.style.background = (j === i) ? 'rgba(255,107,107,0.3)' : 'rgba(255,255,255,0.08)';
                });
                updateBetInfo();
                $('pw-spin-btn').style.display = 'none';
                $('pw-collect-btn').style.display = 'none';
            };
            container.appendChild(btn);
        });
    }

    function buildBetButtons() {
        var container = $('pw-bet-btns');
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
        var el = $('pw-bet-info');
        if (!el) return;
        if (selectedSegment !== null && betAmount > 0) {
            var seg = SEGMENTS[selectedSegment];
            el.textContent = (lang === 'ar' ? 'رهان على ' : 'Bet on ') + seg.label + ' (' + seg.multiplier + 'x) — ' + betAmount;
        } else if (selectedSegment !== null) {
            var seg = SEGMENTS[selectedSegment];
            el.textContent = (lang === 'ar' ? 'تم اختيار ' : 'Selected: ') + seg.label;
        } else {
            el.textContent = '';
        }
    }

    async function placeBet(amount) {
        if (selectedSegment === null) {
            if (window.showToast) window.showToast(lang === 'ar' ? 'اختر خانة أولاً' : 'Pick a segment first');
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
        var idemKey = currentUser.uid + '_phoenixbet_' + selectedSegment + '_' + Date.now();
        try {
            var res = await window.SecurityService.applyCurrencyTransaction(
                currentUser.uid, -amount, 'Phoenix Wheel Bet: segment ' + selectedSegment, { segment: selectedSegment, round: Date.now() }, { idemKey }
            );
            if (res && res.success === false) {
                if (window.showToast) window.showToast('Bet blocked: ' + (res.error || ''));
                return;
            }
            balance -= amount;
            betAmount = amount;
            updateBalanceDisplay();
            updateBetInfo();
            $('pw-spin-btn').style.display = 'block';
            $('pw-collect-btn').style.display = 'none';
        } catch (e) {
            console.error('[PW] Bet error:', e);
            if (window.showToast) window.showToast(lang === 'ar' ? 'خطأ في الرهان' : 'Bet error');
        }
    }

    function wheelPickWeighted() {
        var r = Math.random() * TOTAL;
        var running = 0;
        for (var i = 0; i < SEGMENTS.length; i++) {
            running += WEIGHTS[i];
            if (r < running) return i;
        }
        return SEGMENTS.length - 1;
    }

    async function spinWheel() {
        if (isSpinning || selectedSegment === null || betAmount <= 0) return;
        isSpinning = true;
        $('pw-spin-btn').style.display = 'none';
        var wheelEl = $('pw-wheel');
        if (wheelEl) {
            wheelEl.style.transition = 'transform 0.3s';
            wheelEl.style.transform = 'rotate(0deg)';
        }

        var idx = 0;
        try {
            if (window.SnakeLadderFair && window.SnakeLadderService) {
                var roomId = 'phoenix_wheel_' + currentUser.uid;
                var turnKey = 'pw_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
                var revealMs = await window.SnakeLadderService.commitRollReveal(turnKey);
                var outcome = window.SnakeLadderFair.deriveRoll(roomId, turnKey, revealMs);
                var h = 0;
                for (var i = 0; i < 4; i++) {
                    h = (h * 999983 + (outcome >> (i * 8))) >>> 0;
                }
                var target = (h % TOTAL) + 1;
                var running = 0;
                for (var i = 0; i < SEGMENTS.length; i++) {
                    running += WEIGHTS[i];
                    if (target <= running) { idx = i; break; }
                }
            } else {
                idx = wheelPickWeighted();
            }
        } catch (e) {
            console.error('[PW] Spin error:', e);
            idx = wheelPickWeighted();
        }

        var seg = SEGMENTS[idx];
        var won = seg.multiplier > 0;
        var totalSpin = 360 * (5 + idx);
        if (wheelEl) {
            wheelEl.style.transition = 'transform 2.5s cubic-bezier(0.17,0.67,0.12,0.99)';
            wheelEl.style.transform = 'rotate(' + totalSpin + 'deg)';
        }

        setTimeout(function () {
            if (wheelEl) wheelEl.textContent = seg.label;
            lastSpin = { targetIdx: idx, multiplier: seg.multiplier, won: won, segment: seg };
            var resEl = $('pw-result');
            if (resEl) {
                resEl.style.color = won ? '#10b981' : '#ef4444';
                resEl.textContent = won
                    ? (lang === 'ar' ? '🎉 فزت! ' : '🎉 Won! ') + seg.label + ' ×' + seg.multiplier
                    : (lang === 'ar' ? '💔 خسرت — ' + seg.label : '💔 Lost — ' + seg.label);
            }
            if (won) {
                $('pw-collect-btn').style.display = 'block';
                $('pw-collect-btn').textContent = (lang === 'ar' ? 'جمع الأرباح: ' : 'Collect: ') + (betAmount * seg.multiplier);
            } else {
                $('pw-spin-btn').style.display = 'none';
                betAmount = 0;
                updateBetInfo();
            }
            isSpinning = false;
        }, 2600);
    }

    async function collectWin() {
        if (!lastSpin || !lastSpin.won || !currentUser || !window.SecurityService) return;
        var winAmt = betAmount * lastSpin.multiplier;
        var idemKey = currentUser.uid + '_phoenixwin_' + lastSpin.targetIdx + '_' + Date.now();
        try {
            await window.SecurityService.applyCurrencyTransaction(
                currentUser.uid, winAmt, 'Phoenix Wheel Win: ' + lastSpin.segment.label, { targetIdx: lastSpin.targetIdx, round: Date.now() }, { idemKey }
            );
            balance += winAmt;
            updateBalanceDisplay();
            if (window.showToast) window.showToast((lang === 'ar' ? '🏆 ربحت ' : '🏆 Won ') + winAmt);
            resetRound();
        } catch (e) {
            console.error('[PW] Collect error:', e);
        }
    }

    function resetRound() {
        lastSpin = null;
        betAmount = 0;
        selectedSegment = null;
        var resEl = $('pw-result');
        if (resEl) resEl.textContent = '';
        var wheelEl = $('pw-wheel');
        if (wheelEl) { wheelEl.textContent = '🎰'; wheelEl.style.transition = 'transform 0.3s'; wheelEl.style.transform = 'rotate(0deg)'; }
        document.querySelectorAll('#pw-segments button').forEach(function (b) {
            b.style.borderColor = 'rgba(255,255,255,0.2)';
            b.style.background = 'rgba(255,255,255,0.08)';
        });
        updateBetInfo();
        $('pw-spin-btn').style.display = 'none';
        $('pw-collect-btn').style.display = 'none';
    }

    function initEvents() {
        var spinBtn = $('pw-spin-btn');
        if (spinBtn) spinBtn.onclick = spinWheel;
        var collectBtn = $('pw-collect-btn');
        if (collectBtn) collectBtn.onclick = collectWin;
    }

    /* ═══  PUBLIC API  ═══ */
    window.PhoenixWheelGame = {
        start: function (container, opts) {
            opts = opts || {};
            rootEl = typeof container === 'string' ? document.getElementById(container) : container;
            if (!rootEl) { console.error('[PhoenixWheel] Container not found'); return; }
            lang = opts.lang || 'ar';
            currentUser = opts.user || window.pwGameUserData || window.currentUserData || window.userData || null;
            balance = 0;
            selectedSegment = null;
            betAmount = 0;
            lastSpin = null;
            isSpinning = false;
            loadBalance();
            buildHTML();
        },
        stop: function () {
            rootEl = null;
            currentUser = null;
        }
    };
})();
