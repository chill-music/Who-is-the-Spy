;(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // SECTION: STATE
  // ═══════════════════════════════════════════════════════════════
  var _container = null;
  var _lang = 'en';
  var _user = null;
  var _balance = 0;
  var _selectedBet = null;   // 'low','high','even','odd','triple'
  var _selectedChip = null;  // number
  var _roundTag = 0;         // shared timestamp for bet/win idempotency keys
  var _isRolling = false;
  var _pendingWinAmount = 0;
  var _pendingWinReason = '';
  var _pendingWinMultiplier = 0;
  var _timers = [];
  var _intervals = [];
  var _rafIds = [];
  var _listeners = [];       // {el, evt, fn}
  var _diceEls = [];
  var _faceCycleInterval = null;
  var _jpActive = 0;          // live pool amount (CrownDice-only)
  var _jpProgress = 0;        // cumulative collected Intel toward auto-claim
  var _jpPending = false;
  var _jpWinInfo = null;
  var _jpTop = [];            // top explorers
  var _lastRollChip = 0;      // chip value of the round being collected
  var _jpUnsubs = [];         // Firestore listeners to close on stop()
  var _jpSeenTs = 0;

  var CHIP_VALUES = [100, 500, 1000, 5000, 10000, 50000];
  var CHIP_LABELS = ['100', '500', '1K', '5K', '10K', '50K'];
  var BET_TYPES = ['low', 'high', 'even', 'odd', 'triple'];
  var DICE_DURATION = [850, 1000, 1150]; // stagger in ms

  // Pip positions in a 3x3 grid (1-indexed cells)
  var PIP_MAP = {
    1: [5],
    2: [3, 7],
    3: [3, 5, 7],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION: LOCALIZATION
  // ═══════════════════════════════════════════════════════════════
  var I18N = {
    title:        { en: 'CROWN DICE ♔', ar: 'نرد التاج ♔' },
    currency:     { en: 'Intel', ar: 'إنتل' },
    roll:         { en: 'ROLL ♔', ar: 'رمي ♔' },
    collect:      { en: 'COLLECT', ar: 'اجمع' },
    youWin:       { en: 'YOU WIN!', ar: 'فزت!' },
    tryAgain:     { en: 'TRY AGAIN', ar: 'حاول مرة أخرى' },
    royalTriple:  { en: 'ROYAL TRIPLE!', ar: 'ثلاثية ملكية!' },
    betLow:       { en: 'LOW', ar: 'منخفض' },
    betHigh:      { en: 'HIGH', ar: 'مرتفع' },
    betEven:      { en: 'EVEN', ar: 'زوجي' },
    betOdd:       { en: 'ODD', ar: 'فردي' },
    betTriple:    { en: 'TRIPLE', ar: 'ثلاثي' },
    infoLow:      { en: 'Low: Sum 3-10', ar: 'منخفض: المجموع 3-10' },
    infoHigh:     { en: 'High: Sum 11-18', ar: 'مرتفع: المجموع 11-18' },
    infoEven:     { en: 'Even: Sum is even', ar: 'زوجي: المجموع زوجي' },
    infoOdd:      { en: 'Odd: Sum is odd', ar: 'فردي: المجموع فردي' },
    infoTriple:   { en: 'Triple: All same (30x)', ar: 'ثلاثي: كل النرد متساوي (30x)' },
    selectBet:    { en: 'Select your bet', ar: 'اختر رهانك' },
    selectChip:   { en: 'Select bet amount', ar: 'اختر مقدار الرهان' },
    howTo:        { en: 'HOW TO PLAY', ar: 'كيفية اللعب' },
    jackpot:      { en: 'JACKPOT', ar: 'الجائزة الكبرى' },
    helpTitle:    { en: 'CROWN DICE — HOW TO PLAY', ar: 'نرد التاج — كيفية اللعب' },
    totalPool:    { en: 'Total Prize Pool', ar: 'إجمالي مجموع الجوائز' },
    topExplorers: { en: 'Top Explorers', ar: 'كبار المستكشفين' },
    noRecords:    { en: 'No records yet', ar: 'لا توجد سجلات بعد' },
    shares:       { en: 'Payout Shares (by round bet)', ar: 'حصص الدفع (حسب رهان الجولة)' },
    rules1:       { en: '0.5% of every bet feeds the pool.', ar: 'يتغذى المجموع من نسبة 0.5% من كل رهان.' },
    rules2:       { en: 'Hits 1,000,000 Intel collected → auto-claims a tier.', ar: 'الوصول لـ 1,000,000 إنتل مجمع → فوز تلقائي بفئة.' },
    rules3:       { en: 'Your tier depends on that round’s bet size.', ar: 'فئتك تعتمد على حجم رهان تلك الجولة.' },
    jpWinTitle:   { en: 'JACKPOT WIN!', ar: 'فوز بالجائزة الكبرى!' },
    jpWinNote:    { en: 'Auto-credited to your balance', ar: 'التسليم تلقائي لرصيدك' },
    ok:           { en: 'ROYAL!', ar: 'ملكي!' }
  };

  function t(key) {
    return (I18N[key] && I18N[key][_lang]) || (I18N[key] && I18N[key].en) || key;
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: HELPERS
  // ═══════════════════════════════════════════════════════════════
  function fmtNum(n) {
    if (typeof window.fmtNum === 'function') return window.fmtNum(n);
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(Math.floor(n));
  }

  function $(id) {
    return _container ? _container.querySelector('#' + id) : null;
  }

  function $cls(cls) {
    return _container ? _container.querySelector('.' + cls) : null;
  }

  function $clsAll(cls) {
    return _container ? _container.querySelectorAll('.' + cls) : [];
  }

  function addListener(el, evt, fn) {
    if (el) { el.addEventListener(evt, fn); _listeners.push({ el: el, evt: evt, fn: fn }); }
  }

  function safeTimeout(fn, ms) {
    var id = setTimeout(fn, ms);
    _timers.push(id);
    return id;
  }

  function safeInterval(fn, ms) {
    var id = setInterval(fn, ms);
    _intervals.push(id);
    return id;
  }

  function clearAllTimers() {
    for (var i = 0; i < _timers.length; i++) clearTimeout(_timers[i]);
    for (var i = 0; i < _intervals.length; i++) clearInterval(_intervals[i]);
    for (var i = 0; i < _rafIds.length; i++) cancelAnimationFrame(_rafIds[i]);
    _timers = [];
    _intervals = [];
    _rafIds = [];
  }

  function removeAllListeners() {
    for (var i = 0; i < _listeners.length; i++) {
      _listeners[i].el.removeEventListener(_listeners[i].evt, _listeners[i].fn);
    }
    _listeners = [];
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: SECURITY SERVICE — REAL CURRENCY
  // Bets are debited and wins credited through the hardened
  // SecurityService.applyCurrencyTransaction (server-side balance read,
  // idempotency keys, quarantine of suspicious credits).
  // ═══════════════════════════════════════════════════════════════
  function currentUserData() {
    return _user || (options && options.user) ||
      (window.cdGameUserData || window.pwGameUserData || window.currentUserData || window.userData) ||
      { uid: '', photoURL: '', currency: 0 };
  }

  function getTxUid() {
    var u = currentUserData();
    if (u && u.uid) return u.uid;
    if (window.firebase && window.firebase.auth && window.firebase.auth().currentUser) return window.firebase.auth().currentUser.uid;
    return null;
  }

  function showGameMsg(msg) {
    if (window.showToast) window.showToast(msg, 'error');
    else console.warn('[CrownDice]', msg);
  }

  function deductBet(amount, betType) {
    var uid = getTxUid();
    if (!uid) return Promise.resolve({ success: false, error: 'Sign in required' });
    _roundTag = Date.now();
    return window.SecurityService.applyCurrencyTransaction(
      uid, -amount, 'Crown Dice Bet: ' + betType,
      { game: 'CrownDice', betType: betType },
      { idemKey: uid + '_crownbet_' + _roundTag }
    );
  }

  function creditWin(amount, multiplier) {
    var uid = getTxUid();
    if (!uid) return Promise.resolve({ success: false, error: 'Sign in required' });
    return window.SecurityService.applyCurrencyTransaction(
      uid, amount, 'Crown Dice Win: x' + multiplier,
      { game: 'CrownDice', betType: _selectedBet, multiplier: multiplier, roundTag: _roundTag },
      { idemKey: uid + '_crownwin_' + _roundTag }
    );
  }

  function getBetLabel() {
    var labels = { low: 'Low', high: 'High', even: 'Even', odd: 'Odd', triple: 'Triple' };
    return labels[_selectedBet] || 'Unknown';
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: CROWN DICE JACKPOT (isolated: artifacts/.../crown_dice/*)
  // - Pool doc stores { amount }, seeded 500,000, grown by 0.5% of
  //   every bet, decremented on a payout.
  // - Per-user progress crown_jackpot_prog = cumulative collected Intel
  //   (armed via SecurityGuard group 'crownjp', rules-bounded).
  // - Crossing 1,000,000 Intel auto-claims the pool share matching
  //   that round's bet: 100-1K -> 10%, 1K-10K -> 30%, >=10K -> 70%.
  // - Payout granted via SecurityService (idempotent per round); no raw
  //   currency writes anywhere.
  // ═══════════════════════════════════════════════════════════════
  var CD_JP_SEED = 500000;
  var CD_JP_THRESHOLD = 1000000;
  var CD_JP_COL = 'crown_dice';

  function cdDB() {
    return (window.db) || (window.firebase && window.firebase.firestore && window.firebase.firestore()) || null;
  }

  function cdInc() {
    var f = window.firebase && window.firebase.firestore && window.firebase.firestore.FieldValue;
    return (f && f.increment) ? f.increment : null;
  }

  function cdSrvTs() {
    var f = window.firebase && window.firebase.firestore && window.firebase.firestore.FieldValue;
    return (f && f.serverTimestamp) ? f.serverTimestamp() : Date.now();
  }

  function cdCol(name) {
    var db = cdDB();
    if (!db) return null;
    return db.collection('artifacts').doc(window.appId || 'pro_spy_v25_final_fix_complete')
      .collection('public').doc('data').collection(CD_JP_COL).doc(name);
  }

  function cdSub(name, sub) {
    var col = cdCol(name);
    return col ? col.collection(sub) : null;
  }

  function cdRenderPill() {
    var pill = $('cd-jp-pill');
    if (!pill) return;
    pill.innerHTML = '\uD83D\uDC51 ' + t('jackpot') + '  ' + fmtNum(Math.round(_jpActive));
  }

  function cdStartListeners() {
    if (!cdDB() || _jpUnsubs.length) return;
    var poolRef = cdCol('jackpot');
    if (!poolRef) return;
    _jpUnsubs.push(poolRef.onSnapshot(function(doc) {
      if (!doc.exists) {
        poolRef.set({ amount: CD_JP_SEED }).then(function() {}, function() {});
        _jpActive = CD_JP_SEED;
      } else {
        _jpActive = Number(doc.data().amount || 0);
      }
      cdRenderPill();
    }));

    var topRef = cdSub('leaderboard', 'top_explorers');
    if (topRef) {
      _jpUnsubs.push(topRef.orderBy('multiplier', 'desc').limit(3).onSnapshot(function(snap) {
        _jpTop = [];
        snap.forEach(function(d) { var x = d.data(); x.uid = d.id; _jpTop.push(x); });
        var listEl = $('cd-jp-list');
        if (listEl) cdRenderTop();
      }, function() {}));
    }

    var bcCol = cdSub('broadcasts', 'list');
    if (bcCol) {
      _jpUnsubs.push(bcCol.orderBy('timestamp', 'desc').limit(5).onSnapshot(function(snap) {
        var list = [];
        snap.forEach(function(d) { list.push(d.data()); });
        for (var i = 0; i < list.length; i++) {
          var ts = list[i] && list[i].timestamp;
          var ms = ts && ts.toMillis ? ts.toMillis() : (typeof ts === 'number' ? ts : 0);
          if (ms && ms > _jpSeenTs && (Date.now() - ms) < 60000) {
            _jpSeenTs = ms;
            if (window.showToast) {
              window.showToast('\uD83D\uDC51 ' + (list[i].name || 'Player') +
                (_lang === 'ar' ? ' \u0641\u0627\u0632 \u0628\u0627\u0644\u062C\u0627\u0626\u0632\u0629 \u0627\u0644\u0643\u0628\u0631\u0649 +' : ' won the Crown Dice Jackpot +') +
                fmtNum(list[i].amount || 0) + ' \uD83E\uDDE0');
            }
          }
        }
      }, function() {}));
    }
    cdRenderPill();
  }

  function cdContribute(bet) {
    var incF = cdInc();
    if (!bet || bet <= 0) return;
    var ref = cdCol('jackpot');
    if (!ref || !incF) return;
    ref.update({ amount: incF(Math.max(1, Math.round(bet * 0.005))) })
      .then(function() {}, function() {});
  }

  function cdUpsertExplorer(uid, mult) {
    if (!uid || !mult || !cdDB()) return;
    var meRef = cdSub('leaderboard', 'top_explorers');
    if (!meRef) return;
    meRef.doc(uid).get().then(function(doc) {
      var best = doc.exists ? Number(doc.data().multiplier || 0) : 0;
      if (mult > best) {
        var u = currentUserData() || {};
        meRef.doc(uid).set({
          multiplier: mult,
          displayName: u.displayName || u.username || 'Player',
          photoURL: u.photoURL || u.photo || '',
          timestamp: Date.now()
        }, { merge: true }).then(function() {}, function() {});
      }
    }).then(function() {}, function() {});
  }

  function cdTriggerJackpot(uid, bet) {
    var poolRef = cdCol('jackpot');
    var roundTag = _roundTag || Date.now();
    _jpWinInfo = null;
    if (!poolRef || !cdDB()) return;
    poolRef.get().then(function(doc) {
      if (!doc || !doc.exists) { _jpPending = false; return; }
      var totalJp = Number(doc.data().amount || 0);
      if (totalJp <= 0) { _jpPending = false; return; }
      var share = 0.1;
      if (bet >= 10000) share = 0.7;
      else if (bet >= 1000) share = 0.3;
      var winAmount2 = Math.round(totalJp * share);
      _jpWinInfo = { amount: winAmount2, share: share };

      if (!window.SecurityService) { _jpPending = false; return; }
      window.SecurityService.applyCurrencyTransaction(
        uid, winAmount2, 'Crown Dice Jackpot Payout',
        { game: 'CrownDice', share: share, poolAtWin: totalJp, roundTag: roundTag },
        { idemKey: uid + '_crownjp_' + roundTag }
      ).then(function(res) {
        if (!res || !res.success) {
          var code = res && res.error;
          showGameMsg((code && code === 'insufficient_funds') ? t('tryAgain') : ((code || '') + ' (jackpot)'));
          return; // keep _jpPending; retried on the next collect
        }
        var release = window.SecurityGuard ? window.SecurityGuard.arm('crownjp') : null;
        window.usersCollection.doc(uid).update({ crown_jackpot_prog: 0 })
          .then(function() { if (release) release(); }, function() { if (release) release(); });
        poolRef.update({ amount: cdInc() ? cdInc()(-winAmount2) : -winAmount2 })
          .then(function() {}, function() {});
        var bc = cdSub('broadcasts', 'list');
        if (bc) {
          bc.add({
            uid: uid,
            name: (currentUserData() && (currentUserData().displayName || currentUserData().username)) || 'Player',
            amount: winAmount2,
            timestamp: cdSrvTs()
          }).then(function() {}, function() {});
        }
        _jpPending = false;
        _jpProgress = 0;
        cdRenderPill();
        cdShowWinOverlay();
      }, function() {});
    }, function() {});
  }

  function cdRenderTop() {
    var listEl = $('cd-jp-list');
    if (!listEl) return;
    if (!_jpTop.length) {
      listEl.innerHTML = '<div class="cd-jp-name" style="color:rgba(255,255,255,0.4)">' + t('noRecords') + '</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < _jpTop.length; i++) {
      var lb = _jpTop[i];
      html += '<div class="cd-jp-row" data-u="' + (lb.uid || '') + '">' +
        '<span class="cd-jp-rank">' + (i + 1) + '</span>' +
        (lb.photoURL
          ? '<img class="cd-jp-avat" src="' + lb.photoURL + '" alt="" onerror="this.style.display=\'none\'">'
          : '<span class="cd-jp-avat cd-jp-avat-ph"></span>') +
        '<span class="cd-jp-name">' + (lb.displayName || 'Player') + '</span>' +
        '<span class="cd-jp-mult">' + fmtNum(lb.multiplier || 0) + 'x</span>' +
        '</div>';
    }
    listEl.innerHTML = html;
    var rows = listEl.querySelectorAll('.cd-jp-row');
    for (var j = 0; j < rows.length; j++) {
      rows[j].addEventListener('click', function() {
        var uid = this.getAttribute('data-u');
        if (uid && window.openLuckyGamesMiniProfile) window.openLuckyGamesMiniProfile(uid);
      });
    }
  }

  function cdOpenJackpotModal() {
    var game = _container ? _container.querySelector('.cd-game') : null;
    if (!game) return;
    var overlay = document.createElement('div');
    overlay.className = 'cd-jp-modal';
    overlay.id = 'cd-jp-modal';
    overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.85);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;';
    var card = document.createElement('div');
    card.className = 'cd-jp-card';
    card.innerHTML =
      '<div class="cd-jp-head"><span>\uD83D\uDC51 ' + t('jackpot') + '</span>' +
      '<button class="cd-jp-close">\u2715</button></div>' +
      '<div class="cd-jp-body">' +
        '<div class="cd-jp-pool">' + fmtNum(Math.round(_jpActive)) + '</div>' +
        '<div class="cd-jp-pool-label">' + t('totalPool') + '</div>' +
        '<div class="cd-jp-section">' +
          '<div class="cd-jp-sec-title">\uD83C\uDFC6 ' + t('topExplorers') + '</div>' +
          '<div id="cd-jp-list"></div>' +
        '</div>' +
        '<div class="cd-jp-sec-title">' + t('shares') + '</div>' +
        '<div class="cd-tier"><span>100 \u2013 1K</span><span class="cd-tier-share" style="color:#4ade80">10%</span></div>' +
        '<div class="cd-tier"><span>1K \u2013 10K</span><span class="cd-tier-share" style="color:#38bdf8">30%</span></div>' +
        '<div class="cd-tier"><span>\u2265 10K</span><span class="cd-tier-share" style="color:#a78bfa">70%</span></div>' +
        '<ul class="cd-jp-rules">' +
          '<li>\u2022 ' + t('rules1') + '</li>' +
          '<li>\u2022 ' + t('rules2') + '</li>' +
          '<li>\u2022 ' + t('rules3') + '</li>' +
        '</ul>' +
      '</div>';
    overlay.appendChild(card);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay || e.target.className === 'cd-jp-close') cdCloseJackpotModal();
    });
    game.appendChild(overlay);
    setTimeout(function() {
      card.style.animation = 'cd-jp-pop 0.25s ease-out';
    }, 10);
    cdRenderTop();
  }

  function cdCloseJackpotModal() {
    var m = $('cd-jp-modal');
    if (m && m.parentNode) m.parentNode.removeChild(m);
  }

  function cdShowWinOverlay() {
    var game = _container ? _container.querySelector('.cd-game') : null;
    if (!game || !_jpWinInfo) return;
    var info = _jpWinInfo;
    var overlay = document.createElement('div');
    overlay.className = 'cd-jp-win';
    overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.8);z-index:320;display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML =
      '<div class="cd-jp-win-card">' +
        '<div class="cd-jp-win-title">\uD83D\uDC51 ' + t('jpWinTitle') + '</div>' +
        '<div class="cd-jp-win-amt">+' + fmtNum(info.amount) + ' \uD83E\uDDE0</div>' +
        '<div class="cd-jp-win-note">' + t('jpWinNote') + ' (' + Math.round(info.share * 100) + '%)</div>' +
        '<button class="cd-jp-win-ok">' + t('ok') + '</button>' +
      '</div>';
    game.appendChild(overlay);
    var ok = overlay.querySelector('.cd-jp-win-ok');
    if (ok) ok.addEventListener('click', function() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    });
    goldFlourish();
    spawnConfetti(true);
    safeTimeout(function() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 8000);
  }

  function cdOpenHelp() {
    var game = _container ? _container.querySelector('.cd-game') : null;
    if (!game) return;
    var pctLow = '50.00%';
    var pctTriple = ((6 / 216) * 100).toFixed(2) + '%';
    var overlay = document.createElement('div');
    overlay.className = 'cd-help-modal';
    overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.85);z-index:310;display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML =
      '<div class="cd-help-card">' +
        '<div class="cd-help-head"><span>' + t('helpTitle') + '</span>' +
        '<button class="cd-jp-close">\u2715</button></div>' +
        '<div class="cd-help-body">' +
          '<div class="cd-help-sub">' + (_lang === 'ar' ? 'جدول الدفع' : 'Payout Table') + '</div>' +
          '<div class="cd-help-row"><span>' + t('betLow') + ' (3-10)</span><span class="cd-help-prob">1.9x \u00B7 ' + pctLow + '</span></div>' +
          '<div class="cd-help-row"><span>' + t('betHigh') + ' (11-18)</span><span class="cd-help-prob">1.9x \u00B7 ' + pctLow + '</span></div>' +
          '<div class="cd-help-row"><span>' + t('betEven') + '</span><span class="cd-help-prob">1.9x \u00B7 ' + pctLow + '</span></div>' +
          '<div class="cd-help-row"><span>' + t('betOdd') + '</span><span class="cd-help-prob">1.9x \u00B7 ' + pctLow + '</span></div>' +
          '<div class="cd-help-row"><span>' + t('betTriple') + '</span><span class="cd-help-prob">30x \u00B7 ' + pctTriple + '</span></div>' +
          '<div class="cd-help-note">' + (_lang === 'ar'
            ? 'RTP 95% للرهانات 1.9x و 83.3% للثلاثي.'
            : 'RTP 95% on the 1.9x bets; 83.3% on Triple.') + '</div>' +
          '<div class="cd-help-sub">\uD83D\uDC51 ' + t('jackpot') + '</div>' +
          '<div class="cd-help-text">' +
            '\u2022 ' + t('rules1') + '<br>' +
            '\u2022 ' + t('rules2') + '<br>' +
            '\u2022 ' + t('rules3') +
          '</div>' +
        '</div>' +
      '</div>';
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay || e.target.className === 'cd-jp-close') {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }
    });
    game.appendChild(overlay);
    setTimeout(function() {
      var card = overlay.querySelector('.cd-help-card');
      if (card) card.style.animation = 'cd-jp-pop 0.25s ease-out';
    }, 10);
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: CSS STYLES (scoped under .cd-game)
  // ═══════════════════════════════════════════════════════════════
  function getStyles() {
    return [
      '/* ══ Crown Dice Game — Scoped Styles ══ */',
      '.cd-game {',
      '  position: relative;',
      '  min-height: 640px;',
      '  background: linear-gradient(180deg, #1a0533 0%, #2d0a3e 30%, #3d1052 50%, #1a0a20 100%);',
      '  font-family: "Outfit", sans-serif;',
      '  color: #fff;',
      '  overflow: hidden;',
      '  border-radius: 16px;',
      '  box-sizing: border-box;',
      '  padding: 16px 12px 20px;',
      '}',

      /* Damask / diamond pattern overlay */
      '.cd-game::before {',
      '  content: "";',
      '  position: absolute;',
      '  top: 0; left: 0; right: 0; bottom: 0;',
      '  background-image:',
      '    linear-gradient(45deg, rgba(255,215,0,0.025) 25%, transparent 25%),',
      '    linear-gradient(-45deg, rgba(255,215,0,0.025) 25%, transparent 25%),',
      '    linear-gradient(45deg, transparent 75%, rgba(255,215,0,0.025) 75%),',
      '    linear-gradient(-45deg, transparent 75%, rgba(255,215,0,0.025) 75%);',
      '  background-size: 40px 40px;',
      '  background-position: 0 0, 0 20px, 20px -20px, -20px 0px;',
      '  pointer-events: none;',
      '  z-index: 0;',
      '}',

      /* Chandelier gold glow */
      '.cd-game::after {',
      '  content: "";',
      '  position: absolute;',
      '  top: -60px; left: 50%;',
      '  transform: translateX(-50%);',
      '  width: 400px; height: 300px;',
      '  background: radial-gradient(ellipse at center, rgba(255,215,0,0.10) 0%, transparent 70%);',
      '  pointer-events: none;',
      '  z-index: 0;',
      '}',

      '.cd-game > * { position: relative; z-index: 2; }',

      /* ── Top Bar ── */
      '.cd-game .cd-top-bar {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  margin-bottom: 4px;',
      '  padding: 0 4px;',
      '}',
      '.cd-game .cd-title {',
      '  font-size: 22px;',
      '  font-weight: 900;',
      '  color: #ffd700;',
      '  letter-spacing: 2px;',
      '  text-shadow: 0 0 12px rgba(255,215,0,0.3), 0 2px 4px rgba(0,0,0,0.5);',
      '  line-height: 1.2;',
      '}',
      '.cd-game .cd-avatar {',
      '  width: 56px; height: 56px;',
      '  border-radius: 50%;',
      '  cursor: pointer;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  flex-shrink: 0;',
      '  transition: transform 0.2s ease;',
      '}',
      '.cd-game .cd-avatar:hover {',
      '  transform: scale(1.08);',
      '}',
      '.cd-game .cd-divider {',
      '  height: 1px;',
      '  background: linear-gradient(90deg, transparent, rgba(255,215,0,0.4), rgba(155,39,176,0.3), rgba(255,215,0,0.4), transparent);',
      '  margin: 8px 0 14px;',
      '}',

      /* ── Dice Area ── */
      '.cd-game .cd-dice-area {',
      '  display: flex;',
      '  justify-content: center;',
      '  align-items: center;',
      '  gap: 20px;',
      '  margin: 10px 0 18px;',
      '  perspective: 600px;',
      '  min-height: 100px;',
      '}',
      '.cd-game .cd-die-wrapper {',
      '  width: 80px; height: 80px;',
      '  perspective: 500px;',
      '}',
      '.cd-game .cd-die {',
      '  width: 80px; height: 80px;',
      '  background: #fffde8;',
      '  border: 2px solid #ffd700;',
      '  border-radius: 12px;',
      '  box-shadow: 0 4px 16px rgba(0,0,0,0.4), 0 0 8px rgba(255,215,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5);',
      '  display: grid;',
      '  grid-template-columns: repeat(3, 1fr);',
      '  grid-template-rows: repeat(3, 1fr);',
      '  padding: 10px;',
      '  box-sizing: border-box;',
      '  transform-style: preserve-3d;',
      '  transition: box-shadow 0.3s ease;',
      '}',
      '.cd-game .cd-die.cd-rolling {',
      '  animation: cd-tumble 1s ease-out forwards;',
      '  box-shadow: 0 4px 16px rgba(0,0,0,0.4), 0 0 24px rgba(255,215,0,0.7), 0 0 48px rgba(155,39,176,0.5);',
      '}',
      '.cd-game .cd-die.cd-landed {',
      '  animation: cd-land-flash 0.4s ease-out;',
      '}',
      '.cd-game .cd-pip-cell {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '}',
      '.cd-game .cd-pip {',
      '  width: 14px; height: 14px;',
      '  border-radius: 50%;',
      '  background: #2d1052;',
      '  box-shadow: inset 0 2px 3px rgba(0,0,0,0.3);',
      '}',

      /* ── Bet Buttons ── */
      '.cd-game .cd-bet-row {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  justify-content: center;',
      '  gap: 8px;',
      '  margin-bottom: 8px;',
      '}',
      '.cd-game .cd-bet-btn {',
      '  border-radius: 20px;',
      '  padding: 8px 16px;',
      '  background: rgba(155, 39, 176, 0.2);',
      '  border: 1px solid rgba(155, 39, 176, 0.4);',
      '  color: #d4a0e0;',
      '  font-family: "Outfit", sans-serif;',
      '  font-size: 13px;',
      '  font-weight: 700;',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '  letter-spacing: 0.5px;',
      '}',
      '.cd-game .cd-bet-btn:hover:not(.cd-active):not(.cd-disabled) {',
      '  border-color: #9b27b0;',
      '  color: #fff;',
      '  transform: translateY(-2px);',
      '  box-shadow: 0 4px 12px rgba(155, 39, 176, 0.3);',
      '}',
      '.cd-game .cd-bet-btn.cd-active {',
      '  background: linear-gradient(135deg, #9b27b0, #c2185b);',
      '  color: #fff;',
      '  border-color: #c2185b;',
      '  box-shadow: 0 0 16px rgba(155, 39, 176, 0.5);',
      '  transform: translateY(-1px);',
      '}',
      '.cd-game .cd-bet-btn.cd-disabled {',
      '  opacity: 0.4;',
      '  cursor: not-allowed;',
      '  pointer-events: none;',
      '}',

      /* ── Bet Info ── */
      '.cd-game .cd-bet-info-text {',
      '  text-align: center;',
      '  font-size: 12px;',
      '  color: #b08cc4;',
      '  margin-bottom: 12px;',
      '  min-height: 18px;',
      '  letter-spacing: 0.3px;',
      '}',

      /* ── Chip Row ── */
      '.cd-game .cd-chip-row {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  justify-content: center;',
      '  gap: 8px;',
      '  margin-bottom: 16px;',
      '}',
      '.cd-game .cd-chip {',
      '  border-radius: 20px;',
      '  padding: 6px 14px;',
      '  background: rgba(255, 215, 0, 0.1);',
      '  border: 1.5px solid rgba(255, 215, 0, 0.4);',
      '  color: #ffd700;',
      '  font-family: "Outfit", sans-serif;',
      '  font-size: 13px;',
      '  font-weight: 700;',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '  white-space: nowrap;',
      '}',
      '.cd-game .cd-chip:hover:not(.cd-active):not(.cd-disabled) {',
      '  transform: translateY(-2px);',
      '  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);',
      '}',
      '.cd-game .cd-chip.cd-active {',
      '  background: linear-gradient(135deg, #FFD700, #FF8C00);',
      '  color: #1a0a3b;',
      '  border-color: #ffd700;',
      '  box-shadow: 0 0 12px rgba(255, 215, 0, 0.4);',
      '}',
      '.cd-game .cd-chip.cd-disabled {',
      '  opacity: 0.4;',
      '  cursor: not-allowed;',
      '  pointer-events: none;',
      '}',

      /* ── Roll Button ── */
      '.cd-game .cd-roll-wrap {',
      '  display: flex;',
      '  justify-content: center;',
      '  margin-bottom: 12px;',
      '}',
      '.cd-game .cd-roll-btn {',
      '  background: linear-gradient(135deg, #FFD700, #FF8C00);',
      '  color: #1a0a3b;',
      '  font-family: "Outfit", sans-serif;',
      '  font-weight: 900;',
      '  font-size: 18px;',
      '  padding: 14px 48px;',
      '  border-radius: 25px;',
      '  border: none;',
      '  cursor: pointer;',
      '  letter-spacing: 1px;',
      '  text-transform: uppercase;',
      '  transition: all 0.2s ease;',
      '  box-shadow: 0 4px 16px rgba(255,215,0,0.3);',
      '}',
      '.cd-game .cd-roll-btn:hover:not(.cd-disabled) {',
      '  transform: translateY(-3px) scale(1.03);',
      '  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.5);',
      '}',
      '.cd-game .cd-roll-btn:active:not(.cd-disabled) {',
      '  transform: translateY(0) scale(0.98);',
      '}',
      '.cd-game .cd-roll-btn.cd-disabled {',
      '  opacity: 0.5;',
      '  cursor: not-allowed;',
      '  transform: none;',
      '  box-shadow: none;',
      '}',

      /* ── Result ── */
      '.cd-game .cd-result-area {',
      '  text-align: center;',
      '  min-height: 48px;',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  justify-content: center;',
      '  margin-bottom: 8px;',
      '}',
      '.cd-game .cd-result-text {',
      '  font-size: 24px;',
      '  font-weight: 900;',
      '  letter-spacing: 1px;',
      '}',
      '.cd-game .cd-result-text.cd-win {',
      '  color: #ffd700;',
      '  text-shadow: 0 0 20px rgba(255,215,0,0.6), 0 0 40px rgba(255,215,0,0.3);',
      '}',
      '.cd-game .cd-result-text.cd-lose {',
      '  color: #8b8b9e;',
      '}',
      '.cd-game .cd-result-amount {',
      '  font-size: 16px;',
      '  font-weight: 700;',
      '  color: #ffd700;',
      '  margin-top: 4px;',
      '}',

      /* ── Collect Button ── */
      '.cd-game .cd-collect-btn {',
      '  background: linear-gradient(90deg, #10b981, #22c55e);',
      '  color: #fff;',
      '  border-radius: 20px;',
      '  padding: 10px 32px;',
      '  font-family: "Outfit", sans-serif;',
      '  font-weight: 700;',
      '  font-size: 15px;',
      '  border: none;',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);',
      '  letter-spacing: 0.5px;',
      '  display: none;',
      '}',
      '.cd-game .cd-collect-btn:hover {',
      '  transform: translateY(-2px) scale(1.03);',
      '  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);',
      '}',
      '.cd-game .cd-collect-btn:active {',
      '  transform: translateY(0) scale(0.97);',
      '}',

      /* ── Balance Bar ── */
      '.cd-game .cd-balance-bar {',
      '  display: flex;',
      '  justify-content: center;',
      '  margin-top: 10px;',
      '}',
      '.cd-game .cd-balance {',
      '  border-radius: 20px;',
      '  background: linear-gradient(135deg, rgba(0,242,255,0.12), rgba(112,0,255,0.10));',
      '  border: 1px solid rgba(0,242,255,0.25);',
      '  box-shadow: 0 0 8px rgba(0,242,255,0.12);',
      '  padding: 6px 16px;',
      '  font-size: 12px;',
      '  font-weight: 900;',
      '  letter-spacing: 0.3px;',
      '  white-space: nowrap;',
      '}',
      '.cd-game .cd-balance .cd-bal-icon { color: inherit; }',
      '.cd-game .cd-balance .cd-bal-amount { color: #00f2ff; }',
      '.cd-game .cd-balance .cd-bal-label { color: rgba(255,255,255,0.6); margin-left: 4px; }',

      /* ── Gold Dust Particles ── */
      '.cd-game .cd-gold-dust {',
      '  position: absolute;',
      '  width: 3px; height: 3px;',
      '  background: #ffd700;',
      '  border-radius: 50%;',
      '  pointer-events: none;',
      '  z-index: 1;',
      '  animation: cd-gold-drift linear infinite;',
      '  opacity: 0;',
      '  box-shadow: 0 0 4px rgba(255,215,0,0.5);',
      '}',

      /* ── Confetti ── */
      '.cd-game .cd-confetti {',
      '  position: absolute;',
      '  pointer-events: none;',
      '  z-index: 100;',
      '  border-radius: 2px;',
      '}',

      /* ── Gold Flourish ── */
      '.cd-game .cd-flourish {',
      '  position: absolute;',
      '  top: 25%; left: 50%;',
      '  transform: translate(-50%, -50%);',
      '  width: 300px; height: 200px;',
      '  background: radial-gradient(ellipse, rgba(255,215,0,0.25) 0%, transparent 70%);',
      '  pointer-events: none;',
      '  z-index: 1;',
      '  animation: cd-flourish-pulse 0.8s ease-out forwards;',
      '}',

      /* ── Crown Float (triple win) ── */
      '.cd-game .cd-crown-float {',
      '  position: absolute;',
      '  top: 30%; left: 50%;',
      '  transform: translate(-50%, -50%) scale(0);',
      '  font-size: 64px;',
      '  pointer-events: none;',
      '  z-index: 101;',
      '  animation: cd-crown-appear 1.5s ease-out forwards;',
      '}',

      /* ── Screen Edge Flash ── */
      '.cd-game .cd-edge-flash {',
      '  position: absolute;',
      '  top: 0; left: 0; right: 0; bottom: 0;',
      '  border: 3px solid rgba(255,215,0,0.6);',
      '  border-radius: 16px;',
      '  pointer-events: none;',
      '  z-index: 99;',
      '  animation: cd-edge-glow 1s ease-out forwards;',
      '}',

      /* ══ KEYFRAMES ══ */
      '@keyframes cd-tumble {',
      '  0%   { transform: rotateX(0deg) rotateZ(0deg) scale(0.85); }',
      '  15%  { transform: rotateX(540deg) rotateZ(270deg) scale(1.1); }',
      '  35%  { transform: rotateX(1260deg) rotateZ(630deg) scale(0.92); }',
      '  55%  { transform: rotateX(1980deg) rotateZ(900deg) scale(1.06); }',
      '  75%  { transform: rotateX(2700deg) rotateZ(1260deg) scale(0.97); }',
      '  88%  { transform: rotateX(3100deg) rotateZ(1440deg) scale(1.02); }',
      '  100% { transform: rotateX(3240deg) rotateZ(1620deg) scale(1); }',
      '}',
      '@keyframes cd-land-flash {',
      '  0%   { box-shadow: 0 4px 16px rgba(0,0,0,0.4), 0 0 30px rgba(255,215,0,0.9), 0 0 60px rgba(155,39,176,0.5); }',
      '  100% { box-shadow: 0 4px 16px rgba(0,0,0,0.4), 0 0 8px rgba(255,215,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5); }',
      '}',
      '@keyframes cd-gold-drift {',
      '  0%   { transform: translateY(-10px); opacity: 0; }',
      '  10%  { opacity: 0.6; }',
      '  90%  { opacity: 0.4; }',
      '  100% { transform: translateY(600px); opacity: 0; }',
      '}',
      '@keyframes cd-flourish-pulse {',
      '  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }',
      '  30%  { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }',
      '  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }',
      '}',
      '@keyframes cd-crown-appear {',
      '  0%   { transform: translate(-50%, -50%) scale(0); opacity: 0; }',
      '  25%  { transform: translate(-50%, -50%) scale(1.4); opacity: 1; }',
      '  60%  { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }',
      '  100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }',
      '}',
      '@keyframes cd-edge-glow {',
      '  0%   { opacity: 1; border-color: rgba(255,215,0,0.8); }',
      '  100% { opacity: 0; border-color: rgba(255,215,0,0); }',
      '}',

      /* Top-right helper buttons */
      '.cd-game .cd-top-right { display: flex; align-items: center; gap: 8px; margin-left: auto; }',
      '.cd-game .cd-help-btn {',
      '  width: 30px; height: 30px;',
      '  border-radius: 50%;',
      '  background: rgba(255,255,255,0.08);',
      '  border: 1px solid rgba(255,215,0,0.4);',
      '  color: #ffd700;',
      '  font-weight: 900;',
      '  font-size: 14px;',
      '  cursor: pointer;',
      '  font-family: "Outfit", sans-serif;',
      '}',
      '.cd-game .cd-jp-pill {',
      '  margin: 4px 0 12px 0;',
      '  cursor: pointer;',
      '  background: linear-gradient(90deg,#5b3a9e,#7b1fa2 35%,#ffd700 50%,#7b1fa2 65%,#5b3a9e);',
      '  border: 1px solid rgba(255,215,0,0.55);',
      '  border-radius: 7px;',
      '  padding: 5px 0;',
      '  text-align: center;',
      '  color: #fff;',
      '  font-weight: 700;',
      '  font-size: 13px;',
      '  letter-spacing: 1.5px;',
      '  font-family: "Orbitron", monospace;',
      '  text-shadow: 0 0 10px rgba(255,215,0,0.6);',
      '  box-shadow: 0 0 14px rgba(255,215,0,0.25);',
      '  position: relative;',
      '  z-index: 10;',
      '  display: block; width: 100%;',
      '}',

      /* Jackpot modal */
      '.cd-game .cd-jp-card {',
      '  width: 100%; max-width: 380px;',
      '  background: linear-gradient(160deg,#2a0c4a,#12032a);',
      '  border-radius: 18px;',
      '  border: 2px solid rgba(255,215,0,0.45);',
      '  box-shadow: 0 0 40px rgba(255,215,0,0.2);',
      '  max-height: 90%; overflow-y: auto;',
      '}',
      '.cd-game .cd-jp-head {',
      '  background: linear-gradient(90deg,#ffd700,#c2185b);',
      '  padding: 13px 16px;',
      '  display: flex; justify-content: space-between; align-items: center;',
      '  border-top-left-radius: 16px; border-top-right-radius: 16px;',
      '  color: #1a0533; font-family: "Orbitron", monospace; font-weight: 700; font-size: 15px; letter-spacing: 1px;',
      '}',
      '.cd-game .cd-jp-close {',
      '  background: rgba(0,0,0,0.25);',
      '  border: 1.5px solid rgba(0,0,0,0.4);',
      '  border-radius: 7px; color: #1a0533; cursor: pointer;',
      '  padding: 2px 10px; font-size: 16px; font-weight: 700;',
      '}',
      '.cd-game .cd-jp-body { padding: 20px; color: #fff; }',
      '.cd-game .cd-jp-pool {',
      '  text-align: center; font-size: 32px; font-weight: 900; color: #ffd700;',
      '  font-family: "Orbitron", monospace; letter-spacing: 2px; margin-bottom: 5px;',
      '  text-shadow: 0 0 16px rgba(255,215,0,0.5);',
      '}',
      '.cd-game .cd-jp-pool-label { font-size: 12px; color: rgba(255,255,255,0.5); text-align: center; margin-bottom: 20px; letter-spacing: 1px; }',
      '.cd-game .cd-jp-section { background: rgba(0,0,0,0.3); border-radius: 10px; padding: 14px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 20px; }',
      '.cd-game .cd-jp-sec-title { color: #ffd700; font-size: 13px; font-family: "Orbitron", monospace; margin-bottom: 10px; }',
      '.cd-game .cd-jp-row {',
      '  display: flex; align-items: center; gap: 8px;',
      '  background: rgba(255,255,255,0.04); padding: 8px 12px; border-radius: 10px; margin-bottom: 8px;',
      '  cursor: pointer; border: 1px solid rgba(255,255,255,0.03);',
      '}',
      '.cd-game .cd-jp-rank { font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 900; width: 18px; }',
      '.cd-game .cd-jp-avat { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }',
      '.cd-game .cd-jp-avat-ph { background: rgba(255,255,255,0.1); }',
      '.cd-game .cd-jp-name { font-size: 12px; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
      '.cd-game .cd-jp-mult { font-weight: 800; color: #4ade80; font-size: 13px; }',
      '.cd-game .cd-tier {',
      '  display: flex; align-items: center; justify-content: space-between;',
      '  background: rgba(255,255,255,0.04); padding: 8px 12px; border-radius: 10px; margin-bottom: 8px; font-size: 12px;',
      '}',
      '.cd-game .cd-tier .cd-tier-share { font-weight: 900; font-size: 14px; }',
      '.cd-game .cd-jp-rules { font-size: 12px; color: rgba(255,255,255,0.75); line-height: 1.7; padding: 8px 0 0 0; margin: 0; list-style: none; }',
      '.cd-game .cd-jp-rules li { margin-bottom: 6px; }',

      /* Jackpot win overlay */
      '.cd-game .cd-jp-win-card {',
      '  text-align: center;',
      '  background: linear-gradient(160deg,#2a0c4a,#12032a);',
      '  max-width: 340px; width: 100%; border-radius: 18px; padding: 26px 20px;',
      '  border: 2px solid rgba(255,215,0,0.5);',
      '  box-shadow: 0 0 50px rgba(255,215,0,0.35);',
      '}',
      '.cd-game .cd-jp-win-title { font-size: 20px; font-weight: 900; color: #ffd700; font-family: "Orbitron", monospace; letter-spacing: 1px; }',
      '.cd-game .cd-jp-win-amt { font-size: 34px; font-weight: 900; color: #ffd700; margin: 8px 0 4px; text-shadow: 0 0 18px rgba(255,215,0,0.6); }',
      '.cd-game .cd-jp-win-note { font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 18px; }',
      '.cd-game .cd-jp-win-ok { background: linear-gradient(135deg,#ffd700,#c2185b); color: #1a0533; border: none; border-radius: 20px; padding: 10px 34px; font-weight: 800; font-size: 14px; cursor: pointer; letter-spacing: 1px; font-family: "Outfit", sans-serif; }',

      /* Help modal */
      '.cd-game .cd-help-card {',
      '  width: 100%; max-width: 380px;',
      '  background: linear-gradient(160deg,#2d0a3e,#12032a);',
      '  border-radius: 18px;',
      '  border: 2px solid rgba(199,81,250,0.35);',
      '  box-shadow: 0 0 40px rgba(199,81,250,0.2);',
      '  max-height: 90%; overflow-y: auto;',
      '}',
      '.cd-game .cd-help-head {',
      '  background: linear-gradient(90deg,#a855f7,#c2185b);',
      '  padding: 13px 16px;',
      '  display: flex; justify-content: space-between; align-items: center;',
      '  border-top-left-radius: 16px; border-top-right-radius: 16px;',
      '  color: #fff; font-family: "Orbitron", monospace; font-weight: 700; font-size: 14px; letter-spacing: 1px;',
      '}',
      '.cd-game .cd-help-body { padding: 20px; color: #fff; }',
      '.cd-game .cd-help-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 2px; border-bottom: 1px dashed rgba(255,255,255,0.08); font-size: 13px; }',
      '.cd-game .cd-help-row .cd-help-prob { color: #ffd700; font-weight: 700; }',
      '.cd-game .cd-help-note { font-size: 11px; color: rgba(255,255,255,0.55); margin-top: 10px; line-height: 1.6; }',
      '.cd-game .cd-help-sub { font-size: 13px; font-weight: 800; color: #ffd700; margin: 14px 0 6px; }',
      '.cd-game .cd-help-text { font-size: 12px; color: rgba(255,255,255,0.75); line-height: 1.7; }',
      '@keyframes cd-jp-pop {',
      '  0% { transform: scale(0.85); opacity: 0; }',
      '  100% { transform: scale(1); opacity: 1; }',
      '}',

      /* RTL adjustments */
      '.cd-game[dir="rtl"] .cd-balance .cd-bal-label { margin-left: 0; margin-right: 4px; }'
    ].join('\n');
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: DICE FACE RENDERING
  // ═══════════════════════════════════════════════════════════════
  function renderDieFace(dieEl, value) {
    var v = Math.max(1, Math.min(6, value));
    var pips = PIP_MAP[v];
    dieEl.innerHTML = '';
    for (var i = 1; i <= 9; i++) {
      var cell = document.createElement('div');
      cell.className = 'cd-pip-cell';
      if (pips.indexOf(i) !== -1) {
        var dot = document.createElement('div');
        dot.className = 'cd-pip';
        cell.appendChild(dot);
      }
      dieEl.appendChild(cell);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: GOLD DUST PARTICLES (ambient)
  // ═══════════════════════════════════════════════════════════════
  function createGoldDust() {
    var game = _container.querySelector('.cd-game');
    if (!game) return;
    for (var i = 0; i < 18; i++) {
      var dot = document.createElement('div');
      dot.className = 'cd-gold-dust';
      var size = 2 + Math.random() * 2;
      dot.style.width = size + 'px';
      dot.style.height = size + 'px';
      dot.style.left = (Math.random() * 100) + '%';
      dot.style.top = '-10px';
      dot.style.animationDuration = (6 + Math.random() * 6) + 's';
      dot.style.animationDelay = (Math.random() * 10) + 's';
      game.appendChild(dot);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: CONFETTI BURST
  // ═══════════════════════════════════════════════════════════════
  function spawnConfetti(isTriple) {
    var game = _container.querySelector('.cd-game');
    if (!game) return;
    var count = isTriple ? 55 : 32;
    var colors = ['#ffd700', '#9b27b0', '#c2185b', '#ffffff', '#ff6b6b', '#7c3aed', '#fbbf24'];
    var particles = [];
    var startTime = Date.now();
    var duration = isTriple ? 3000 : 2200;

    for (var i = 0; i < count; i++) {
      var piece = document.createElement('div');
      piece.className = 'cd-confetti';
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = '50%';
      piece.style.top = '35%';
      var size = 4 + Math.random() * 8;
      piece.style.width = size + 'px';
      piece.style.height = (size * (0.5 + Math.random() * 0.8)) + 'px';
      piece.style.borderRadius = Math.random() > 0.4 ? '50%' : '2px';
      game.appendChild(piece);

      var angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.8;
      var speed = 150 + Math.random() * 300;
      particles.push({
        el: piece,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 200,
        gravity: 500 + Math.random() * 400,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 900
      });
    }

    function animate() {
      var now = Date.now();
      var elapsed = (now - startTime) / 1000;
      var progress = elapsed / (duration / 1000);

      if (progress >= 1) {
        for (var i = 0; i < particles.length; i++) {
          if (particles[i].el.parentNode) particles[i].el.parentNode.removeChild(particles[i].el);
        }
        return;
      }

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var x = p.vx * elapsed;
        var y = p.vy * elapsed + 0.5 * p.gravity * elapsed * elapsed;
        var rot = p.rot + p.rotSpeed * elapsed;
        p.el.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + rot + 'deg)';
        if (progress > 0.6) {
          p.el.style.opacity = Math.max(0, 1 - (progress - 0.6) / 0.4);
        }
      }

      var raf = requestAnimationFrame(animate);
      _rafIds.push(raf);
    }

    var raf = requestAnimationFrame(animate);
    _rafIds.push(raf);
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: GOLD FLOURISH EFFECT
  // ═══════════════════════════════════════════════════════════════
  function goldFlourish() {
    var game = _container.querySelector('.cd-game');
    if (!game) return;
    var glow = document.createElement('div');
    glow.className = 'cd-flourish';
    game.appendChild(glow);
    safeTimeout(function() {
      if (glow.parentNode) glow.parentNode.removeChild(glow);
    }, 900);
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: TRIPLE WIN SPECIAL EFFECTS
  // ═══════════════════════════════════════════════════════════════
  function tripleSpecialEffects() {
    var game = _container.querySelector('.cd-game');
    if (!game) return;

    // Crown float
    var crown = document.createElement('div');
    crown.className = 'cd-crown-float';
    crown.textContent = '👑';
    game.appendChild(crown);
    safeTimeout(function() {
      if (crown.parentNode) crown.parentNode.removeChild(crown);
    }, 1600);

    // Screen edge flash
    var flash = document.createElement('div');
    flash.className = 'cd-edge-flash';
    game.appendChild(flash);
    safeTimeout(function() {
      if (flash.parentNode) flash.parentNode.removeChild(flash);
    }, 1100);

    // Extra confetti burst
    safeTimeout(function() { spawnConfetti(true); }, 300);
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: AVATAR (real photo + equipped frame via AvatarWithFrameV11)
  // ═══════════════════════════════════════════════════════════════
  function mountAvatar(mountEl) {
    if (!mountEl) return;
    var user = currentUserData();
    var photoURL = (user && (user.photoURL || user.photo)) || '';
    if (window.ReactDOM && window.React && window.AvatarWithFrameV11) {
      window.ReactDOM.render(
        window.React.createElement(window.AvatarWithFrameV11, {
          photoURL: photoURL,
          equipped: user ? user.equipped : null,
          size: 'sm',
          isOnline: user ? !!user.online : undefined,
          banData: user ? user.banData : undefined,
          lang: _lang
        }),
        mountEl
      );
    } else {
      var img = document.createElement('img');
      img.alt = 'avatar';
      img.style.cssText = 'width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;';
      img.src = photoURL || 'https://ui-avatars.com/api/?name=User&background=1e293b&color=fff&size=96';
      img.onerror = function() {
        this.src = 'https://ui-avatars.com/api/?name=User&background=1e293b&color=fff&size=96';
      };
      mountEl.appendChild(img);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: BALANCE DISPLAY
  // ═══════════════════════════════════════════════════════════════
  function updateBalanceDisplay() {
    var balEl = $('cd-balance');
    if (!balEl) return;
    var iconSpan = balEl.querySelector('.cd-bal-icon');
    var amtSpan = balEl.querySelector('.cd-bal-amount');
    var lblSpan = balEl.querySelector('.cd-bal-label');
    if (iconSpan) iconSpan.textContent = '\uD83E\uDDE0 ';
    if (amtSpan) amtSpan.textContent = fmtNum(_balance);
    if (lblSpan) lblSpan.textContent = t('currency');
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: BET SELECTION
  // ═══════════════════════════════════════════════════════════════
  function updateBetInfo() {
    var infoEl = $('cd-bet-info');
    if (!infoEl) return;
    if (!_selectedBet) {
      infoEl.textContent = t('selectBet');
      return;
    }
    var key = 'info' + _selectedBet.charAt(0).toUpperCase() + _selectedBet.slice(1);
    infoEl.textContent = t(key);
  }

  function selectBet(type) {
    if (_isRolling) return;
    _selectedBet = type;
    var btns = $clsAll('cd-bet-btn');
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].getAttribute('data-bet') === type) {
        btns[i].classList.add('cd-active');
      } else {
        btns[i].classList.remove('cd-active');
      }
    }
    updateBetInfo();
  }

  function selectChip(value) {
    if (_isRolling) return;
    _selectedChip = value;
    var chips = $clsAll('cd-chip');
    for (var i = 0; i < chips.length; i++) {
      if (parseInt(chips[i].getAttribute('data-value'), 10) === value) {
        chips[i].classList.add('cd-active');
      } else {
        chips[i].classList.remove('cd-active');
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: GAME LOGIC
  // ═══════════════════════════════════════════════════════════════
  function rollDice() {
    if (_isRolling) return;
    if (!_selectedBet) { updateBetInfo(); return; }
    if (!_selectedChip) return;
    if (_balance < _selectedChip) { showGameMsg(t('tryAgain')); return; }

    _isRolling = true;
    setBettingEnabled(false);

    // Hide previous result and collect
    var resultEl = $('cd-result');
    if (resultEl) resultEl.innerHTML = '';
    var collectEl = $('cd-collect-btn');
    if (collectEl) collectEl.style.display = 'none';

    // Real bet debit (rejects server-side if balance is insufficient)
    deductBet(_selectedChip, getBetLabel()).then(function(res) {
      if (!res || !res.success) {
        _isRolling = false;
        setBettingEnabled(true);
        showGameMsg((res && res.error) ? (res.error === 'insufficient_funds' ? t('tryAgain') : res.error) : 'Bet failed');
        return;
      }
      _balance -= _selectedChip;
      updateBalanceDisplay();
      _lastRollChip = _selectedChip;
      cdContribute(_selectedChip);

      // Generate final values
      var d1 = Math.floor(Math.random() * 6) + 1;
      var d2 = Math.floor(Math.random() * 6) + 1;
      var d3 = Math.floor(Math.random() * 6) + 1;
      var finalValues = [d1, d2, d3];

      // Animate dice
      animateDiceRoll(finalValues, function() {
        evaluateResult(finalValues);
      });
    });
  }

  function animateDiceRoll(finalValues, callback) {
    var settled = [false, false, false];
    var settledCount = 0;

    // Start face cycling
    _faceCycleInterval = safeInterval(function() {
      for (var i = 0; i < 3; i++) {
        if (!settled[i] && _diceEls[i]) {
          renderDieFace(_diceEls[i], Math.floor(Math.random() * 6) + 1);
        }
      }
    }, 70);

    for (var i = 0; i < 3; i++) {
      (function(idx) {
        var dieEl = _diceEls[idx];
        if (!dieEl) return;
        dieEl.classList.remove('cd-landed');
        dieEl.classList.add('cd-rolling');
        // Vary animation duration for stagger
        dieEl.style.animationDuration = DICE_DURATION[idx] + 'ms';

        function onEnd() {
          dieEl.removeEventListener('animationend', onEnd);
          settled[idx] = true;
          settledCount++;
          dieEl.classList.remove('cd-rolling');
          renderDieFace(dieEl, finalValues[idx]);
          // Brief landing flash
          dieEl.classList.add('cd-landed');
          safeTimeout(function() { dieEl.classList.remove('cd-landed'); }, 500);

          if (settledCount === 3) {
            clearInterval(_faceCycleInterval);
            _faceCycleInterval = null;
            safeTimeout(callback, 200);
          }
        }
        dieEl.addEventListener('animationend', onEnd);
      })(i);
    }
  }

  function evaluateResult(dice) {
    var sum = dice[0] + dice[1] + dice[2];
    var isTriple = (dice[0] === dice[1] && dice[1] === dice[2]);
    var won = false;
    var multiplier = 0;
    var winAmount = 0;

    switch (_selectedBet) {
      case 'low':
        won = (sum >= 3 && sum <= 10);
        multiplier = 1.9;
        break;
      case 'high':
        won = (sum >= 11 && sum <= 18);
        multiplier = 1.9;
        break;
      case 'even':
        won = (sum % 2 === 0);
        multiplier = 1.9;
        break;
      case 'odd':
        won = (sum % 2 === 1);
        multiplier = 1.9;
        break;
      case 'triple':
        won = isTriple;
        multiplier = 30;
        break;
    }

    if (won) {
      winAmount = _selectedChip * multiplier;
      _pendingWinAmount = winAmount;
      _pendingWinMultiplier = multiplier;
      showResult(true, winAmount, isTriple);
    } else {
      _pendingWinAmount = 0;
      showResult(false, 0, false);
    }
  }

  function showResult(won, amount, isTriple) {
    var resultEl = $('cd-result');
    if (!resultEl) return;
    resultEl.innerHTML = '';

    if (won) {
      var title = isTriple ? t('royalTriple') : t('youWin');
      var titleDiv = document.createElement('div');
      titleDiv.className = 'cd-result-text cd-win';
      titleDiv.textContent = title;
      resultEl.appendChild(titleDiv);

      var amtDiv = document.createElement('div');
      amtDiv.className = 'cd-result-amount';
      amtDiv.textContent = '+' + fmtNum(amount) + ' \uD83E\uDDE0';
      resultEl.appendChild(amtDiv);

      // Animations
      goldFlourish();
      if (isTriple) {
        tripleSpecialEffects();
      } else {
        spawnConfetti(false);
      }

      // Show collect button
      var collectEl = $('cd-collect-btn');
      if (collectEl) {
        collectEl.textContent = t('collect');
        collectEl.style.display = 'inline-block';
      }
    } else {
      var loseDiv = document.createElement('div');
      loseDiv.className = 'cd-result-text cd-lose';
      loseDiv.textContent = t('tryAgain');
      resultEl.appendChild(loseDiv);
    }

    // Auto-fade result text after 3s (but keep collect button)
    safeTimeout(function() {
      var texts = resultEl.querySelectorAll('.cd-result-text');
      for (var i = 0; i < texts.length; i++) {
        texts[i].style.transition = 'opacity 0.5s ease';
        texts[i].style.opacity = '0';
      }
      var amt = resultEl.querySelector('.cd-result-amount');
      if (amt) {
        amt.style.transition = 'opacity 0.5s ease';
        amt.style.opacity = '0';
      }
      safeTimeout(function() { resultEl.innerHTML = ''; }, 600);
    }, 3000);

    // Re-enable betting
    _isRolling = false;
    setBettingEnabled(true);
  }

  function collectWinnings() {
    if (_pendingWinAmount <= 0) return;
    var winAmt = _pendingWinAmount;
    var winMult = _pendingWinMultiplier;
    creditWin(winAmt, winMult).then(function(res) {
      if (!res || !res.success) {
        showGameMsg((res && res.error) ? (res.error === 'insufficient_funds' ? t('tryAgain') : res.error) : 'Collect failed');
        return; // keep pending so the user can retry
      }
      _balance += winAmt;
      updateBalanceDisplay();
      var collectEl = $('cd-collect-btn');
      if (collectEl) collectEl.style.display = 'none';
      _pendingWinAmount = 0;
      _pendingWinMultiplier = 0;

      // Jackpot progress = cumulative collected Intel (armed, rules-bounded).
      var uid = getTxUid();
      var incF = cdInc();
      if (uid && cdDB() && incF && window.usersCollection) {
        var release = window.SecurityGuard ? window.SecurityGuard.arm('crownjp') : null;
        window.usersCollection.doc(uid).update({ crown_jackpot_prog: incF(Math.round(winAmt)) })
          .then(function() { if (release) release(); }, function() { if (release) release(); });
        cdUpsertExplorer(uid, winMult);
        var prev = _jpProgress;
        _jpProgress += Math.round(winAmt);
        if (_jpProgress >= CD_JP_THRESHOLD) {
          if (prev < CD_JP_THRESHOLD) _jpPending = true;
          if (_jpPending) cdTriggerJackpot(uid, _lastRollChip || _selectedChip || 0);
        }
      }
    });
  }

  function setBettingEnabled(enabled) {
    var betBtns = $clsAll('cd-bet-btn');
    for (var i = 0; i < betBtns.length; i++) {
      if (enabled) betBtns[i].classList.remove('cd-disabled');
      else betBtns[i].classList.add('cd-disabled');
    }
    var chips = $clsAll('cd-chip');
    for (var i = 0; i < chips.length; i++) {
      if (enabled) chips[i].classList.remove('cd-disabled');
      else chips[i].classList.add('cd-disabled');
    }
    var rollBtn = $('cd-roll-btn');
    if (rollBtn) {
      if (enabled) rollBtn.classList.remove('cd-disabled');
      else rollBtn.classList.add('cd-disabled');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: DOM BUILDING
  // ═══════════════════════════════════════════════════════════════
  function buildUI() {
    // Inject scoped styles
    var styleEl = document.createElement('style');
    styleEl.textContent = getStyles();
    _container.appendChild(styleEl);

    // Root wrapper
    var game = document.createElement('div');
    game.className = 'cd-game';
    if (_lang === 'ar') game.setAttribute('dir', 'rtl');
    _container.appendChild(game);

    // ── Gold Dust Particles ──
    createGoldDust();

    // ── Top Bar ──
    var topBar = document.createElement('div');
    topBar.className = 'cd-top-bar';

    var titleEl = document.createElement('div');
    titleEl.className = 'cd-title';
    titleEl.textContent = t('title');
    topBar.appendChild(titleEl);

    var avatarMount = document.createElement('div');
    avatarMount.className = 'cd-avatar';
    addListener(avatarMount, 'click', function() {
      var uid = getTxUid();
      if (!uid) return;
      if (typeof window.openLuckyGamesMiniProfile === 'function') window.openLuckyGamesMiniProfile(uid);
      else if (typeof window.openMiniProfile === 'function') window.openMiniProfile(uid);
      else if (typeof window.setMiniProfileUID !== 'undefined') { window.setMiniProfileUID(uid); window.setShowMiniProfile(true); }
    });
    mountAvatar(avatarMount);

    var topRight = document.createElement('div');
    topRight.className = 'cd-top-right';

    var helpBtn = document.createElement('button');
    helpBtn.className = 'cd-help-btn';
    helpBtn.type = 'button';
    helpBtn.title = t('howTo');
    helpBtn.textContent = '?';
    addListener(helpBtn, 'click', cdOpenHelp);
    topRight.appendChild(helpBtn);

    topRight.appendChild(avatarMount);
    topBar.appendChild(topRight);
    game.appendChild(topBar);

    // Divider
    var divider = document.createElement('div');
    divider.className = 'cd-divider';
    game.appendChild(divider);

    // Jackpot pill (Royal theme)
    var jpPill = document.createElement('button');
    jpPill.id = 'cd-jp-pill';
    jpPill.className = 'cd-jp-pill';
    jpPill.type = 'button';
    addListener(jpPill, 'click', cdOpenJackpotModal);
    game.appendChild(jpPill);
    cdRenderPill();

    // ── Dice Area ──
    var diceArea = document.createElement('div');
    diceArea.id = 'cd-faces';
    diceArea.className = 'cd-dice-area';
    _diceEls = [];
    for (var i = 0; i < 3; i++) {
      var wrapper = document.createElement('div');
      wrapper.className = 'cd-die-wrapper';
      var die = document.createElement('div');
      die.className = 'cd-die';
      renderDieFace(die, 1); // initial face
      wrapper.appendChild(die);
      diceArea.appendChild(wrapper);
      _diceEls.push(die);
    }
    game.appendChild(diceArea);

    // ── Bet Type Buttons ──
    var betRow = document.createElement('div');
    betRow.id = 'cd-bet-btns';
    betRow.className = 'cd-bet-row';
    var betKeys = ['low', 'high', 'even', 'odd', 'triple'];
    var betI18nKeys = ['betLow', 'betHigh', 'betEven', 'betOdd', 'betTriple'];
    for (var i = 0; i < betKeys.length; i++) {
      (function(key, i18nKey) {
        var btn = document.createElement('button');
        btn.className = 'cd-bet-btn';
        btn.setAttribute('data-bet', key);
        btn.textContent = t(i18nKey);
        addListener(btn, 'click', function() { selectBet(key); });
        betRow.appendChild(btn);
      })(betKeys[i], betI18nKeys[i]);
    }
    game.appendChild(betRow);

    // ── Bet Info ──
    var betInfo = document.createElement('div');
    betInfo.id = 'cd-bet-info';
    betInfo.className = 'cd-bet-info-text';
    betInfo.textContent = t('selectBet');
    game.appendChild(betInfo);

    // ── Chip Row ──
    var chipRow = document.createElement('div');
    chipRow.className = 'cd-chip-row';
    for (var i = 0; i < CHIP_VALUES.length; i++) {
      (function(val, label) {
        var chip = document.createElement('button');
        chip.className = 'cd-chip';
        chip.setAttribute('data-value', String(val));
        chip.textContent = '\uD83E\uDDE0 ' + label;
        addListener(chip, 'click', function() { selectChip(val); });
        chipRow.appendChild(chip);
      })(CHIP_VALUES[i], CHIP_LABELS[i]);
    }
    game.appendChild(chipRow);

    // ── Roll Button ──
    var rollWrap = document.createElement('div');
    rollWrap.id = 'cd-spin-btn';
    rollWrap.className = 'cd-roll-wrap';
    rollWrap.style.display = 'inline-block';
    var rollBtn = document.createElement('button');
    rollBtn.id = 'cd-roll-btn';
    rollBtn.className = 'cd-roll-btn';
    rollBtn.textContent = t('roll');
    addListener(rollBtn, 'click', rollDice);
    rollWrap.appendChild(rollBtn);
    game.appendChild(rollWrap);

    // ── Result Area ──
    var resultArea = document.createElement('div');
    resultArea.id = 'cd-result';
    resultArea.className = 'cd-result-area';
    game.appendChild(resultArea);

    // ── Collect Button ──
    var collectBtn = document.createElement('button');
    collectBtn.id = 'cd-collect-btn';
    collectBtn.className = 'cd-collect-btn';
    collectBtn.textContent = t('collect');
    addListener(collectBtn, 'click', collectWinnings);
    game.appendChild(collectBtn);

    // ── Balance Bar ──
    var balanceBar = document.createElement('div');
    balanceBar.className = 'cd-balance-bar';
    var balanceEl = document.createElement('div');
    balanceEl.id = 'cd-balance';
    balanceEl.className = 'cd-balance';
    var iconSpan = document.createElement('span');
    iconSpan.className = 'cd-bal-icon';
    iconSpan.textContent = '\uD83E\uDDE0 ';
    var amtSpan = document.createElement('span');
    amtSpan.className = 'cd-bal-amount';
    amtSpan.textContent = fmtNum(_balance);
    var lblSpan = document.createElement('span');
    lblSpan.className = 'cd-bal-label';
    lblSpan.textContent = t('currency');
    balanceEl.appendChild(iconSpan);
    balanceEl.appendChild(amtSpan);
    balanceEl.appendChild(lblSpan);
    balanceBar.appendChild(balanceEl);
    game.appendChild(balanceBar);
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: RE-RENDER LABELS (language switch)
  // ═══════════════════════════════════════════════════════════════
  function reRenderLabels() {
    var game = _container.querySelector('.cd-game');
    if (!game) return;

    if (_lang === 'ar') game.setAttribute('dir', 'rtl');
    else game.removeAttribute('dir');

    // Title
    var titleEl = game.querySelector('.cd-title');
    if (titleEl) titleEl.textContent = t('title');

    // Bet buttons
    var betI18nKeys = ['betLow', 'betHigh', 'betEven', 'betOdd', 'betTriple'];
    var betBtns = game.querySelectorAll('.cd-bet-btn');
    for (var i = 0; i < betBtns.length && i < betI18nKeys.length; i++) {
      betBtns[i].textContent = t(betI18nKeys[i]);
    }

    // Bet info
    updateBetInfo();

    // Roll button
    var rollBtn = $('cd-roll-btn');
    if (rollBtn) rollBtn.textContent = t('roll');

    // Collect button
    var collectBtn = $('cd-collect-btn');
    if (collectBtn && collectBtn.style.display !== 'none') collectBtn.textContent = t('collect');

    // Balance label
    updateBalanceDisplay();
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: PUBLIC API
  // ═══════════════════════════════════════════════════════════════

  /**
   * start(container, options)
   * - container: DOM element (#cd-root-hub)
   * - options: { lang: 'en'|'ar', user: { uid, photoURL, currency } }
   */
  function start(container, options) {
    if (!container) return;
    _container = container;
    _lang = (options && options.lang) || 'en';
    _user = (options && options.user) ||
      window.cdGameUserData || window.pwGameUserData || window.currentUserData || window.userData ||
      { uid: '', photoURL: '', currency: 0 };
    _balance = (_user.currency != null) ? Number(_user.currency) : 0;
    _selectedBet = null;
    _selectedChip = null;
    _roundTag = 0;
    _isRolling = false;
    _pendingWinAmount = 0;
    _pendingWinMultiplier = 0;
    _diceEls = [];
    _jpActive = 0;
    _jpProgress = Number(_user.crown_jackpot_prog || 0);
    _jpPending = false;
    _jpWinInfo = null;
    _jpTop = [];
    _lastRollChip = 0;
    _jpSeenTs = 0;
    cdStartListeners();
    // Fresh read of the real Firestore progress (in case the cached user doc is stale)
    var refreshUid = getTxUid();
    if (refreshUid && window.usersCollection) {
      window.usersCollection.doc(refreshUid).get().then(function(d) {
        if (d.exists && d.data().crown_jackpot_prog != null) {
          _jpProgress = Number(d.data().crown_jackpot_prog) || 0;
        }
      }).then(function() {}, function() {});
    }

    // Clear previous content
    _container.innerHTML = '';

    // Build the full UI
    buildUI();
  }

  /**
   * stop()
   * - Kill all timers/intervals/listeners, wipe container
   */
  function stop() {
    clearAllTimers();
    if (_faceCycleInterval) { clearInterval(_faceCycleInterval); _faceCycleInterval = null; }
    removeAllListeners();
    for (var j = 0; j < _jpUnsubs.length; j++) { try { _jpUnsubs[j](); } catch (e) {} }
    _jpUnsubs = [];
    if (_container) _container.innerHTML = '';
    _container = null;
    _user = null;
    _diceEls = [];
    _selectedBet = null;
    _selectedChip = null;
    _isRolling = false;
    _pendingWinAmount = 0;
    _jpActive = 0;
    _jpProgress = 0;
    _jpPending = false;
    _jpWinInfo = null;
    _jpTop = [];
  }

  /**
   * setLanguage(lang)
   * - lang: 'en' | 'ar'
   * - Re-render all text labels
   */
  function setLanguage(lang) {
    if (!lang || (lang !== 'en' && lang !== 'ar')) return;
    _lang = lang;
    reRenderLabels();
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: MODULE EXPORT
  // ═══════════════════════════════════════════════════════════════
  window.CrownDiceGame = {
    start: start,
    stop: stop,
    setLanguage: setLanguage
  };

})();
