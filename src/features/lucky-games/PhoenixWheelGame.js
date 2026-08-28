;(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════
  // PHOENIX WHEEL — Pro Spy Casino Game Module
  // Single self-contained file. No imports. No external deps.
  // ═══════════════════════════════════════════════════════════════════

  // ── State ──────────────────────────────────────────────────────────
  var container = null;
  var options = null;
  var currentLang = 'en';
  var balance = 0;
  var currentBet = 100;
  var isSpinning = false;
  var currentAngle = 0;
  var winAmount = 0;
  var winMultiplier = 0;
  var activeRoundTag = 0;
  var rafId = null;
  var timers = [];
  var listeners = [];
  var canvas = null;
  var ctx = null;
  var canvasSize = 300;
  var segmentAngle = (2 * Math.PI) / 8;
  var pointerAngle = -Math.PI / 2;

  // ── Jackpot / Help modal state ────────────────────────────────────
  var activeJackpot = 0;        // live pool amount (PhoenixWheel-only)
  var jackpotProgress = 0;      // cumulative collected Intel toward auto-claim
  var jackpotPending = false;
  var jackpotWinInfo = null;
  var topExplorers = [];
  var lastSpinBet = 0;
  var dbUnsubs = [];            // Firestore listeners to close on stop()
  var seenBroadcastTs = 0;
  var showJackpotModal = false;
  var showHelpModal = false;

  // ── Segment Definitions (8 segments) ──────────────────────────────
  // Weights (total 10,000) set genuinely rare high multipliers:
  //   25x = 0.08% (1 in 1250), 50x = 0.02% (1 in 5000).
  //   RTP = 9,620 / 10,000 = 96.2% (house edge 3.8%).
  var segments = [
    { label: '0x',  mult: 0,    color: '#2d0a0a', weight: 4920 },
    { label: '1.5x', mult: 1.5, color: '#ee5a24', weight: 3800 },
    { label: '2x',   mult: 2,   color: '#ff6b6b', weight: 850 },
    { label: '3x',   mult: 3,   color: '#e74c3c', weight: 240 },
    { label: '5x',   mult: 5,   color: '#c0392b', weight: 120 },
    { label: '10x',  mult: 10,  color: '#ff8c00', weight: 60 },
    { label: '25x',  mult: 25,  color: '#ffd700', weight: 8 },
    { label: '50x',  mult: 50,  color: '#fff8dc', weight: 2 }
  ];

  // ── Labels (EN / AR) ──────────────────────────────────────────────
  var LABELS = {
    en: {
      title: 'PHOENIX WHEEL \uD83D\uDD25',
      spin: 'SPIN \uD83D\uDD25',
      collect: 'COLLECT',
      intel: 'Intel',
      bet: 'Bet',
      maxWin: 'Max Win',
      youWin: 'YOU WIN',
      burned: 'BURNED!',
      betInfo: function(b, m) { return 'Bet: ' + b + ' \uD83E\uDDE0 | Max Win: ' + m + ' \uD83E\uDDE0'; },
      howTo: 'HOW TO PLAY',
      jackpot: 'JACKPOT',
      helpTitle: 'PHOENIX WHEEL \u2014 HOW TO PLAY',
      totalPool: 'Total Prize Pool',
      topExplorers: 'Top Explorers',
      noRecords: 'No records yet',
      shares: 'Payout Shares (by round bet)',
      rules1: '0.5% of every bet feeds the pool.',
      rules2: 'Hits 1,000,000 Intel collected \u2192 auto-claims a tier.',
      rules3: 'Your tier depends on that round\u2019s bet size.',
      rtpNote: 'RTP {rtp} \u2014 every segment below is shown with its true probability.',
      jpWinTitle: 'JACKPOT WIN!',
      jpWinNote: 'Auto-credited to your balance',
      ok: 'NICE!',
      closeT: 'Close'
    },
    ar: {
      title: '\u0639\u062C\u0644\u0629 \u0627\u0644\u0641\u064A\u0646\u064A\u0642 \uD83D\uDD25',
      spin: '\u062F\u0648\u0631\u0627\u0646 \uD83D\uDD25',
      collect: '\u0627\u062C\u0645\u0639',
      intel: '\u0625\u0646\u062A\u0644',
      bet: '\u0627\u0644\u0631\u0647\u0627\u0646',
      maxWin: '\u0623\u0642\u0635\u0649 \u0631\u0628\u062D',
      youWin: '\u0641\u0632\u062A',
      burned: '\u0627\u062D\u062A\u0631\u0642!',
      betInfo: function(b, m) { return '\u0627\u0644\u0631\u0647\u0627\u0646: ' + b + ' \uD83E\uDDE0 | \u0623\u0642\u0635\u0649 \u0631\u0628\u062D: ' + m + ' \uD83E\uDDE0'; },
      howTo: '\u0643\u064A\u0641\u064A\u0629 \u0627\u0644\u0644\u0639\u0628',
      jackpot: '\u0627\u0644\u062C\u0627\u0626\u0632\u0629 \u0627\u0644\u0643\u0628\u0631\u0649',
      helpTitle: '\u0639\u062C\u0644\u0629 \u0627\u0644\u0641\u064A\u0646\u064A\u0642 \u2014 \u0643\u064A\u0641\u064A\u0629 \u0627\u0644\u0644\u0639\u0628',
      totalPool: '\u0625\u062C\u0645\u0627\u0644\u064A \u0645\u062C\u0645\u0648\u0639 \u0627\u0644\u062C\u0648\u0627\u0626\u0632',
      topExplorers: '\u0643\u0628\u0627\u0631 \u0627\u0644\u0645\u0633\u062A\u0643\u0634\u0641\u064A\u0646',
      noRecords: '\u0644\u0627 \u062A\u0648\u062C\u062F \u0633\u062C\u0644\u0627\u062A \u0628\u0639\u062F',
      shares: '\u062D\u0635\u0635 \u0627\u0644\u062F\u0641\u0639 (\u062D\u0633\u0628 \u0631\u0647\u0627\u0646 \u0627\u0644\u062C\u0648\u0644\u0629)',
      rules1: '\u064A\u062A\u063A\u0630\u0649 \u0627\u0644\u0645\u062C\u0645\u0648\u0639 \u0645\u0646 \u0646\u0633\u0628\u0629 0.5% \u0645\u0646 \u0643\u0644 \u0631\u0647\u0627\u0646.',
      rules2: '\u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0640 1,000,000 \u0625\u0646\u062A\u0644 \u0645\u062C\u0645\u0639 \u2192 \u0641\u0648\u0632 \u062A\u0644\u0642\u0627\u0626\u064A \u0628\u0641\u0626\u0629.',
      rules3: '\u0641\u0626\u062A\u0643 \u062A\u0639\u062A\u0645\u062F \u0639\u0644\u0649 \u062D\u062C\u0645 \u0631\u0647\u0627\u0646 \u062A\u0644\u0643 \u0627\u0644\u062C\u0648\u0644\u0629.',
      rtpNote: 'RTP {rtp} \u2014 \u0643\u0644 \u0642\u0637\u0627\u0639 \u0623\u062F\u0646\u0627\u0647 \u0645\u0639\u0631\u0648\u0636 \u0628\u0627\u062D\u062A\u0645\u0627\u0644\u064A\u062A\u0647 \u0627\u0644\u062D\u0642\u064A\u0642\u064A\u0629.',
      jpWinTitle: '\u0641\u0648\u0632 \u0628\u0627\u0644\u062C\u0627\u0626\u0632\u0629 \u0627\u0644\u0643\u0628\u0631\u0649!',
      jpWinNote: '\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u062A\u0644\u0642\u0627\u0626\u064A \u0644\u0631\u0635\u064A\u062F\u0643',
      ok: '\u0631\u0627\u0626\u0639!',
      closeT: '\u0625\u063A\u0644\u0627\u0642'
    }
  };

  var BET_CHIPS = [100, 500, 1000, 5000, 10000, 50000];
  var CHIP_LABELS = ['100', '500', '1K', '5K', '10K', '50K'];

  // ── Utilities ──────────────────────────────────────────────────────
  function fmtNum(n) {
    if (typeof window.fmtNum === 'function') return window.fmtNum(n);
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }

  function fmtNumFull(n) {
    return n.toLocaleString('en-US');
  }

  function l() { return LABELS[currentLang] || LABELS.en; }

  function pickWeightedSegment() {
    var totalWeight = 0;
    for (var i = 0; i < segments.length; i++) totalWeight += segments[i].weight;
    var r = Math.random() * totalWeight;
    var acc = 0;
    for (var j = 0; j < segments.length; j++) {
      acc += segments[j].weight;
      if (r < acc) return j;
    }
    return 0;
  }

  // ── REAL CURRENCY (SecurityService) ──────────────────────────────
  function currentUser() {
    return (options && options.user) ||
      window.pwGameUserData || window.cdGameUserData || window.currentUserData || window.userData ||
      null;
  }

  function uidOf() {
    var u = currentUser();
    if (u && u.uid) return u.uid;
    if (window.firebase && window.firebase.auth && window.firebase.auth().currentUser) return window.firebase.auth().currentUser.uid;
    return null;
  }

  function showMsg(msg) {
    if (window.showToast) window.showToast(msg, 'error');
    else console.warn('[PhoenixWheel]', msg);
  }

  function realBet(amount) {
    var uid = uidOf();
    if (!uid) return Promise.resolve({ success: false, error: 'Sign in required' });
    activeRoundTag = Date.now();
    return window.SecurityService.applyCurrencyTransaction(
      uid, -amount, 'Phoenix Wheel Bet: spin',
      { game: 'PhoenixWheel' },
      { idemKey: uid + '_pwspin_' + activeRoundTag }
    );
  }

  function realWin(amount) {
    var uid = uidOf();
    if (!uid) return Promise.resolve({ success: false, error: 'Sign in required' });
    return window.SecurityService.applyCurrencyTransaction(
      uid, amount, 'Phoenix Wheel Win: x' + winMultiplier,
      { game: 'PhoenixWheel', multiplier: winMultiplier, roundTag: activeRoundTag },
      { idemKey: uid + '_pwwin_' + activeRoundTag }
    );
  }

  function el(id) { return container ? container.querySelector('#' + id) : null; }

  function updateBalanceDisplay() {
    var e = el('pw-balance');
    if (!e) return;
    e.innerHTML = '\uD83E\uDDE0 <span class="pw-balance-amt">' + fmtNum(balance) + '</span> ' + l().intel;
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHOENIX WHEEL JACKPOT (isolated: artifacts/.../phoenix_wheel/*)
  // - Pool doc stores { amount }, seeded 500,000, grows by 0.5% of
  //   every bet, decremented on a payout.
  // - Per-user progress phoenix_jackpot_prog = cumulative collected
  //   Intel (armed via SecurityGuard group 'phoenixjp', rules-bounded).
  // - Crossing 1,000,000 Intel auto-claims the pool share matching
  //   that round's bet: 100-1K -> 10%, 1K-10K -> 30%, >=10K -> 70%.
  // - The payout is granted via SecurityService (idempotent per round);
  //   no raw currency writes anywhere.
  // ═══════════════════════════════════════════════════════════════════
  var JP_SEED = 500000;
  var JP_THRESHOLD = 1000000;
  var JP_COL = 'phoenix_wheel';

  function jpDB() {
    return (window.db) || (window.firebase && window.firebase.firestore && window.firebase.firestore()) || null;
  }

  function jpInc() {
    var f = window.firebase && window.firebase.firestore && window.firebase.firestore.FieldValue;
    return (f && f.increment) ? f.increment : null;
  }

  function jpSrvTs() {
    var f = window.firebase && window.firebase.firestore && window.firebase.firestore.FieldValue;
    return (f && f.serverTimestamp) ? f.serverTimestamp() : Date.now();
  }

  function jpCol(name) {
    var db = jpDB();
    if (!db) return null;
    return db.collection('artifacts').doc(window.appId || 'pro_spy_v25_final_fix_complete')
      .collection('public').doc('data').collection(JP_COL).doc(name);
  }

  function jpSub(name, sub) {
    var col = jpCol(name);
    return col ? col.collection(sub) : null;
  }

  function renderJackpotPill() {
    var pill = el('pw-jp-pill');
    if (!pill) return;
    pill.innerHTML = '\uD83D\uDD25 ' + l().jackpot + '  ' + fmtNumFull(Math.round(activeJackpot));
  }

  function startJackpotListeners() {
    if (!jpDB() || dbUnsubs.length) return;
    var poolRef = jpCol('jackpot');
    if (!poolRef) return;
    dbUnsubs.push(poolRef.onSnapshot(function(doc) {
      if (!doc.exists) {
        poolRef.set({ amount: JP_SEED }).catch(function() {});
        activeJackpot = JP_SEED;
      } else {
        activeJackpot = Number(doc.data().amount || 0);
      }
      renderJackpotPill();
    }));

    var topRef = jpSub('leaderboard', 'top_explorers');
    if (topRef) {
      dbUnsubs.push(topRef.orderBy('multiplier', 'desc').limit(3).onSnapshot(function(snap) {
        topExplorers = [];
        snap.forEach(function(d) { var x = d.data(); x.uid = d.id; topExplorers.push(x); });
        if (showJackpotModal) renderExplorersList();
      }, function() {}));
    }

    var bcCol = jpSub('broadcasts', 'list');
    if (bcCol) {
      dbUnsubs.push(bcCol.orderBy('timestamp', 'desc').limit(5).onSnapshot(function(snap) {
        var list = [];
        snap.forEach(function(d) { list.push(d.data()); });
        for (var i = 0; i < list.length; i++) {
          var ts = list[i] && list[i].timestamp;
          var ms = ts && ts.toMillis ? ts.toMillis() : (typeof ts === 'number' ? ts : 0);
          if (ms && ms > seenBroadcastTs && (Date.now() - ms) < 60000) {
            seenBroadcastTs = ms;
            if (window.showToast) {
              window.showToast('\uD83D\uDD25 ' + (list[i].name || 'Player') +
                (currentLang === 'ar' ? ' \u0641\u0627\u0632 \u0628\u0627\u0644\u062C\u0627\u0626\u0632\u0629 \u0627\u0644\u0643\u0628\u0631\u0649 +' : ' won the Phoenix Jackpot +') +
                fmtNumFull(list[i].amount || 0) + ' \uD83E\uDDE0');
            }
          }
        }
      }, function() {}));
    }
    renderJackpotPill();
  }

  function contributeToJackpot(bet) {
    var incF = jpInc();
    if (!bet || bet <= 0) return;
    var ref = jpCol('jackpot');
    if (!ref || !incF) return;
    ref.update({ amount: incF(Math.max(1, Math.round(bet * 0.005))) })
      .then(function() {}, function() {});
  }

  function upsertExplorer(uid, mult) {
    if (!uid || !mult || !jpDB()) return;
    var meRef = jpSub('leaderboard', 'top_explorers');
    if (!meRef) return;
    meRef.doc(uid).get().then(function(doc) {
      var best = doc.exists ? Number(doc.data().multiplier || 0) : 0;
      if (mult > best) {
        var u = currentUser() || {};
        meRef.doc(uid).set({
          multiplier: mult,
          displayName: u.displayName || u.username || 'Player',
          photoURL: u.photoURL || u.photo || '',
          timestamp: Date.now()
        }, { merge: true }).then(function() {}, function() {});
      }
    }).then(function() {}, function() {});
  }

  function triggerJackpot(uid, bet) {
    var poolRef = jpCol('jackpot');
    var roundTag = activeRoundTag || Date.now();
    jackpotWinInfo = null;
    if (!poolRef || !jpDB()) return;
    poolRef.get().then(function(doc) {
      if (!doc || !doc.exists) { jackpotPending = false; return; }
      var totalJp = Number(doc.data().amount || 0);
      if (totalJp <= 0) { jackpotPending = false; return; }
      var share = 0.1;
      if (bet >= 10000) share = 0.7;
      else if (bet >= 1000) share = 0.3;
      var winAmount2 = Math.round(totalJp * share);
      jackpotWinInfo = { amount: winAmount2, share: share };

      if (!window.SecurityService) { jackpotPending = false; return; }
      window.SecurityService.applyCurrencyTransaction(
        uid, winAmount2, 'Phoenix Wheel Jackpot Payout',
        { game: 'PhoenixWheel', share: share, poolAtWin: totalJp, roundTag: roundTag },
        { idemKey: uid + '_pwjp_' + roundTag }
      ).then(function(res) {
        if (!res || !res.success) {
          var code = res && res.error;
          showMsg((code && code === 'insufficient_funds') ? (currentLang === 'ar' ? '\u0631\u0635\u064A\u062F \u063A\u064A\u0631 \u0643\u0627\u0641' : 'Insufficient balance') : ((code || '') + ' (jackpot)'));
          return; // keep jackpotPending; retried on the next collect
        }
        var release = window.SecurityGuard ? window.SecurityGuard.arm('phoenixjp') : null;
        window.usersCollection.doc(uid).update({ phoenix_jackpot_prog: 0 })
          .then(function() { if (release) release(); }, function() { if (release) release(); });
        poolRef.update({ amount: jpInc() ? jpInc()(-winAmount2) : -winAmount2 })
          .then(function() {}, function() {});
        var bc = jpSub('broadcasts', 'list');
        if (bc) {
          bc.add({
            uid: uid,
            name: (currentUser() && (currentUser().displayName || currentUser().username)) || 'Player',
            amount: winAmount2,
            timestamp: jpSrvTs()
          }).then(function() {}, function() {});
        }
        jackpotPending = false;
        jackpotProgress = 0;
        renderJackpotPill();
        showJackpotWinOverlay();
      }, function() {});
    }, function() {});
  }

  // ── Top Explorers list (inside the open jackpot modal) ────────────
  function renderExplorersList() {
    var listEl = el('pw-jp-list');
    if (!listEl) return;
    if (!topExplorers.length) {
      listEl.innerHTML = '<div class="pw-jp-name" style="color:rgba(255,255,255,0.4)">' + l().noRecords + '</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < topExplorers.length; i++) {
      var lb = topExplorers[i];
      html += '<div class="pw-jp-row" data-u="' + (lb.uid || '') + '">' +
        '<span class="pw-jp-rank">' + (i + 1) + '</span>' +
        (lb.photoURL
          ? '<img class="pw-jp-avat" src="' + lb.photoURL + '" alt="" onerror="this.style.display=\'none\'">'
          : '<span class="pw-jp-avat pw-jp-avat-ph"></span>') +
        '<span class="pw-jp-name">' + (lb.displayName || 'Player') + '</span>' +
        '<span class="pw-jp-mult">' + fmtNum(lb.multiplier || 0) + 'x</span>' +
        '</div>';
    }
    listEl.innerHTML = html;
    var rows = listEl.querySelectorAll('.pw-jp-row');
    for (var j = 0; j < rows.length; j++) {
      rows[j].addEventListener('click', function() {
        var uid = this.getAttribute('data-u');
        if (uid && window.openLuckyGamesMiniProfile) window.openLuckyGamesMiniProfile(uid);
      });
    }
  }

  function openJackpotModal() {
    if (!container) return;
    var overlay = document.createElement('div');
    overlay.className = 'pw-game pw-jp-modal';
    overlay.id = 'pw-jp-modal';
    overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.85);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;';
    var card = document.createElement('div');
    card.className = 'pw-jp-card';
    card.innerHTML =
      '<div class="pw-jp-head"><span>\uD83D\uDD25 ' + l().jackpot + '</span>' +
      '<button class="pw-jp-close">\u2715</button></div>' +
      '<div class="pw-jp-body">' +
        '<div class="pw-jp-pool">' + fmtNumFull(Math.round(activeJackpot)) + '</div>' +
        '<div class="pw-jp-pool-label">' + l().totalPool + '</div>' +
        '<div class="pw-jp-section">' +
          '<div class="pw-jp-sec-title">\uD83C\uDFC6 ' + l().topExplorers + '</div>' +
          '<div id="pw-jp-list"></div>' +
        '</div>' +
        '<div class="pw-jp-sec-title">' + l().shares + '</div>' +
        '<div class="pw-tier"><span>100 \u2013 1K</span><span class="pw-tier-share" style="color:#4ade80">10%</span></div>' +
        '<div class="pw-tier"><span>1K \u2013 10K</span><span class="pw-tier-share" style="color:#38bdf8">30%</span></div>' +
        '<div class="pw-tier"><span>\u2265 10K</span><span class="pw-tier-share" style="color:#a78bfa">70%</span></div>' +
        '<ul class="pw-jp-rules">' +
          '<li>\u2022 ' + l().rules1 + '</li>' +
          '<li>\u2022 ' + l().rules2 + '</li>' +
          '<li>\u2022 ' + l().rules3 + '</li>' +
        '</ul>' +
      '</div>';
    overlay.appendChild(card);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay || e.target.className === 'pw-jp-close') closeJackpotModal();
    });
    container.appendChild(overlay);
    setTimeout(function() {
      overlay.style.animation = 'pw-jp-pop 0.25s ease-out';
      card.style.animation = 'pw-jp-pop 0.25s ease-out';
    }, 10);
    renderExplorersList();
  }

  function closeJackpotModal() {
    var m = el('pw-jp-modal');
    if (m && m.parentNode) m.parentNode.removeChild(m);
  }

  function showJackpotWinOverlay() {
    if (!container || !jackpotWinInfo) return;
    var info = jackpotWinInfo;
    var overlay = document.createElement('div');
    overlay.className = 'pw-game pw-jp-win';
    overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.8);z-index:320;display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML =
      '<div class="pw-jp-win-card">' +
        '<div class="pw-jp-win-title">\uD83D\uDD25 ' + l().jpWinTitle + '</div>' +
        '<div class="pw-jp-win-amt">+' + fmtNumFull(info.amount) + ' \uD83E\uDDE0</div>' +
        '<div class="pw-jp-win-note">' + l().jpWinNote + ' (' + Math.round(info.share * 100) + '%)</div>' +
        '<button class="pw-jp-win-ok">' + l().ok + '</button>' +
      '</div>';
    container.appendChild(overlay);
    var ok = overlay.querySelector('.pw-jp-win-ok');
    if (ok) ok.addEventListener('click', function() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    });
    spawnConfetti(45);
    spawnPhoenixRise();
    var t = setTimeout(function() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 8000);
    timers.push(t);
  }

  // ── HOW TO PLAY (payout table + jackpot rules) ─────────────────────
  function payoutTable(rtp) {
    var totalW = 0;
    for (var i = 0; i < segments.length; i++) totalW += segments[i].weight;
    var rows = '';
    for (var j = 0; j < segments.length; j++) {
      var seg = segments[j];
      var pct = (seg.weight / totalW) * 100;
      var prob = (pct % 1 === 0)
        ? pct.toFixed(0) + '%'
        : (pct < 0.1 ? pct.toFixed(2) : pct.toFixed(2)).replace(/0+$/, '').replace(/\.$/, '') + '%';
      rows += '<div class="pw-help-row"><span>' + seg.label + '</span><span class="pw-help-prob">' + prob + '</span></div>';
    }
    return {
      rows: rows,
      rtp: rtp
    };
  }

  function openHelpModal() {
    if (!container) return;
    var totalW = 0, contrib = 0;
    for (var i = 0; i < segments.length; i++) { totalW += segments[i].weight; contrib += segments[i].weight * segments[i].mult; }
    var rtpPct = ((contrib / totalW) * 100).toFixed(2) + '%';
    var pt = payoutTable(rtpPct);
    var overlay = document.createElement('div');
    overlay.className = 'pw-game pw-help-modal';
    overlay.id = 'pw-help-modal';
    overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.85);z-index:310;display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML =
      '<div class="pw-help-card">' +
        '<div class="pw-help-head"><span>' + l().helpTitle + '</span>' +
        '<button class="pw-jp-close">\u2715</button></div>' +
        '<div class="pw-help-body">' +
          '<div class="pw-help-sub">' + (currentLang === 'ar' ? '\u062C\u062F\u0648\u0644 \u0627\u0644\u062F\u0641\u0639' : 'Payout Table') + '</div>' +
          pt.rows +
          '<div class="pw-help-note">' + l().rtpNote.replace('{rtp}', rtpPct) + '</div>' +
          '<div class="pw-help-sub">\uD83D\uDD25 ' + l().jackpot + '</div>' +
          '<div class="pw-help-text">' +
            '\u2022 ' + l().rules1 + '<br>' +
            '\u2022 ' + l().rules2 + '<br>' +
            '\u2022 ' + l().rules3 +
          '</div>' +
        '</div>' +
      '</div>';
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay || e.target.className === 'pw-jp-close') {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }
    });
    container.appendChild(overlay);
    setTimeout(function() {
      var card = overlay.querySelector('.pw-help-card');
      if (card) card.style.animation = 'pw-jp-pop 0.25s ease-out';
    }, 10);
  }

  // ── CSS (scoped under .pw-game) ────────────────────────────────────
  function getCSS() {
    return [
      '.pw-game {',
      '  position: relative;',
      '  width: 100%;',
      '  min-height: 100vh;',
      '  background: linear-gradient(180deg, #1a0505 0%, #2d0a0a 30%, #3d1510 50%, #1a0805 100%);',
      '  font-family: "Outfit", sans-serif;',
      '  color: #fff;',
      '  overflow: hidden;',
      '  box-sizing: border-box;',
      '  padding: 0 0 24px 0;',
      '  direction: ltr;',
      '}',
      '.pw-game *, .pw-game *::before, .pw-game *::after { box-sizing: border-box; margin: 0; padding: 0; }',
      '',
      '/* Magma glow at bottom */',
      '.pw-game::before {',
      '  content: "";',
      '  position: absolute;',
      '  bottom: -40px;',
      '  left: 50%;',
      '  transform: translateX(-50%);',
      '  width: 140%;',
      '  height: 320px;',
      '  background: radial-gradient(ellipse at center, rgba(238,90,36,0.22) 0%, rgba(192,57,43,0.10) 40%, transparent 72%);',
      '  pointer-events: none;',
      '  z-index: 0;',
      '}',
      '/* Heat-haze overlay */',
      '.pw-game::after {',
      '  content: "";',
      '  position: absolute;',
      '  inset: 0;',
      '  background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,107,107,0.015) 3px, rgba(255,107,107,0.015) 4px);',
      '  pointer-events: none;',
      '  z-index: 0;',
      '}',
      '',
      '/* Top bar */',
      '.pw-game .pw-topbar {',
      '  position: relative;',
      '  z-index: 10;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  padding: 14px 16px 6px 16px;',
      '}',
      '.pw-game .pw-title {',
      '  font-size: 20px;',
      '  font-weight: 900;',
      '  letter-spacing: 2px;',
      '  background: linear-gradient(135deg, #ff6b6b, #ffd700);',
      '  -webkit-background-clip: text;',
      '  -webkit-text-fill-color: transparent;',
      '  background-clip: text;',
      '}',
      '.pw-game .pw-avatar-wrap {',
      '  cursor: pointer;',
      '  width: 56px;',
      '  height: 56px;',
      '  border-radius: 50%;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  flex-shrink: 0;',
      '}',
      '.pw-game .pw-avatar-wrap img {',
      '  width: 100%;',
      '  height: 100%;',
      '  object-fit: cover;',
      '  display: block;',
      '  border-radius: 50%;',
      '}',
      '.pw-game .pw-accent-line {',
      '  height: 2px;',
      '  margin: 0 16px 10px 16px;',
      '  background: linear-gradient(90deg, transparent, #ee5a24, #ff6b6b, #ee5a24, transparent);',
      '  position: relative;',
      '  z-index: 10;',
      '}',
      '',
      '/* Wheel area */',
      '.pw-game .pw-wheel-area {',
      '  position: relative;',
      '  z-index: 5;',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  padding: 8px 0 4px 0;',
      '}',
      '.pw-game .pw-wheel-container {',
      '  position: relative;',
      '  width: 300px;',
      '  height: 300px;',
      '  box-shadow: 0 0 30px rgba(238,90,36,0.4);',
      '  border-radius: 50%;',
      '  animation: pw-glow-pulse 3s ease-in-out infinite;',
      '}',
      '.pw-game .pw-wheel-container canvas {',
      '  display: block;',
      '  width: 300px;',
      '  height: 300px;',
      '}',
      '/* Pointer triangle */',
      '.pw-game .pw-pointer {',
      '  position: absolute;',
      '  top: -14px;',
      '  left: 50%;',
      '  transform: translateX(-50%);',
      '  width: 0;',
      '  height: 0;',
      '  border-left: 16px solid transparent;',
      '  border-right: 16px solid transparent;',
      '  border-top: 28px solid #ffd700;',
      '  filter: drop-shadow(0 0 6px rgba(255,215,0,0.6));',
      '  z-index: 20;',
      '}',
      '.pw-game .pw-pointer::after {',
      '  content: "";',
      '  position: absolute;',
      '  top: -30px;',
      '  left: -14px;',
      '  width: 0;',
      '  height: 0;',
      '  border-left: 14px solid transparent;',
      '  border-right: 14px solid transparent;',
      '  border-top: 26px solid #b8860b;',
      '}',
      '',
      '/* Bet chips */',
      '.pw-game .pw-bet-section {',
      '  position: relative;',
      '  z-index: 10;',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  gap: 10px;',
      '  padding: 10px 12px 0 12px;',
      '}',
      '.pw-game .pw-chips-row {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  justify-content: center;',
      '  gap: 8px;',
      '}',
      '.pw-game .pw-chip {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 4px;',
      '  padding: 8px 14px;',
      '  border-radius: 20px;',
      '  background: rgba(238,90,36,0.15);',
      '  border: 1.5px solid rgba(238,90,36,0.4);',
      '  color: #ff6b6b;',
      '  font-size: 13px;',
      '  font-weight: 700;',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '  font-family: "Outfit", sans-serif;',
      '  user-select: none;',
      '}',
      '.pw-game .pw-chip:hover {',
      '  transform: translateY(-2px);',
      '  box-shadow: 0 4px 12px rgba(238,90,36,0.3);',
      '}',
      '.pw-game .pw-chip.pw-chip-active {',
      '  background: linear-gradient(135deg, #ff6b6b, #ee5a24);',
      '  color: #fff;',
      '  border-color: #ee5a24;',
      '  box-shadow: 0 0 12px rgba(238,90,36,0.5);',
      '}',
      '.pw-game .pw-chip:disabled {',
      '  opacity: 0.4;',
      '  cursor: not-allowed;',
      '  transform: none;',
      '  box-shadow: none;',
      '}',
      '',
      '/* Spin button */',
      '.pw-game .pw-spin-btn {',
      '  background: linear-gradient(135deg, #ff6b6b, #ee5a24);',
      '  color: #fff;',
      '  font-weight: 900;',
      '  font-size: 18px;',
      '  padding: 14px 48px;',
      '  border-radius: 25px;',
      '  border: none;',
      '  cursor: pointer;',
      '  letter-spacing: 1px;',
      '  text-transform: uppercase;',
      '  font-family: "Outfit", sans-serif;',
      '  transition: all 0.2s ease;',
      '  animation: pw-fire-pulse 2.5s ease-in-out infinite;',
      '  position: relative;',
      '  z-index: 10;',
      '}',
      '.pw-game .pw-spin-btn:hover:not(:disabled) {',
      '  transform: translateY(-3px) scale(1.03);',
      '  box-shadow: 0 8px 24px rgba(238,90,36,0.5);',
      '}',
      '.pw-game .pw-spin-btn:active:not(:disabled) {',
      '  transform: translateY(0) scale(0.98);',
      '}',
      '.pw-game .pw-spin-btn:disabled {',
      '  opacity: 0.5;',
      '  cursor: not-allowed;',
      '  transform: none;',
      '  box-shadow: none;',
      '  animation: none;',
      '}',
      '',
      '/* Result display */',
      '.pw-game .pw-result-area {',
      '  position: relative;',
      '  z-index: 10;',
      '  text-align: center;',
      '  min-height: 60px;',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  justify-content: center;',
      '  padding: 8px 16px;',
      '}',
      '.pw-game .pw-result-win {',
      '  font-size: 22px;',
      '  font-weight: 900;',
      '  color: #ffd700;',
      '  text-shadow: 0 0 16px rgba(255,215,0,0.5);',
      '  animation: pw-result-pop 0.4s ease-out;',
      '}',
      '.pw-game .pw-result-burn {',
      '  font-size: 22px;',
      '  font-weight: 900;',
      '  color: #c0392b;',
      '  animation: pw-burn-fade 1.5s ease-out forwards;',
      '}',
      '.pw-game .pw-mult-badge {',
      '  display: inline-block;',
      '  padding: 4px 14px;',
      '  border-radius: 10px;',
      '  background: linear-gradient(135deg, #ffd700, #ff8c00);',
      '  color: #1a0505;',
      '  font-size: 20px;',
      '  font-weight: 900;',
      '  margin-bottom: 4px;',
      '  box-shadow: 0 0 16px rgba(255,215,0,0.5);',
      '}',
      '',
      '/* Collect button */',
      '.pw-game .pw-collect-btn {',
      '  background: linear-gradient(90deg, #10b981, #22c55e);',
      '  color: #fff;',
      '  border: none;',
      '  border-radius: 20px;',
      '  padding: 10px 32px;',
      '  font-weight: 700;',
      '  font-size: 15px;',
      '  cursor: pointer;',
      '  font-family: "Outfit", sans-serif;',
      '  margin-top: 6px;',
      '  transition: all 0.2s ease;',
      '  z-index: 10;',
      '  position: relative;',
      '}',
      '.pw-game .pw-collect-btn:hover {',
      '  transform: translateY(-2px);',
      '  box-shadow: 0 4px 16px rgba(16,185,129,0.4);',
      '}',
      '',
      '/* Bet info */',
      '.pw-game .pw-bet-info {',
      '  text-align: center;',
      '  color: rgba(255,255,255,0.55);',
      '  font-size: 12px;',
      '  padding: 2px 16px;',
      '  position: relative;',
      '  z-index: 10;',
      '}',
      '',
      '/* Balance bar */',
      '.pw-game .pw-balance-bar {',
      '  position: relative;',
      '  z-index: 10;',
      '  display: flex;',
      '  justify-content: center;',
      '  padding: 14px 16px 6px 16px;',
      '}',
      '.pw-game #pw-balance {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 5px;',
      '  border-radius: 20px;',
      '  background: linear-gradient(135deg, rgba(0,242,255,0.12), rgba(112,0,255,0.10));',
      '  border: 1px solid rgba(0,242,255,0.25);',
      '  box-shadow: 0 0 8px rgba(0,242,255,0.12);',
      '  padding: 6px 16px;',
      '  font-size: 12px;',
      '  color: rgba(255,255,255,0.7);',
      '}',
      '.pw-game .pw-balance-amt {',
      '  color: #00f2ff;',
      '  font-weight: 900;',
      '  letter-spacing: 0.3px;',
      '}',
      '',
      '/* Ember particles */',
      '.pw-game .pw-ember {',
      '  position: absolute;',
      '  border-radius: 50%;',
      '  pointer-events: none;',
      '  z-index: 1;',
      '  animation: pw-ember linear infinite;',
      '}',
      '',
      '/* Confetti particles */',
      '.pw-game .pw-confetti {',
      '  position: absolute;',
      '  pointer-events: none;',
      '  z-index: 50;',
      '  animation: pw-confetti-fall ease-out forwards;',
      '}',
      '',
      '/* Phoenix rise for high wins */',
      '.pw-game .pw-phoenix-rise {',
      '  position: absolute;',
      '  left: 50%;',
      '  top: 40%;',
      '  transform: translate(-50%, -50%) scale(0);',
      '  font-size: 64px;',
      '  z-index: 60;',
      '  pointer-events: none;',
      '  animation: pw-phoenix-emerge 1.8s ease-out forwards;',
      '}',
      '',
      '/* Screen flash for high wins */',
      '.pw-game .pw-screen-flash {',
      '  position: absolute;',
      '  inset: 0;',
      '  background: radial-gradient(ellipse at center, rgba(238,90,36,0.45) 0%, transparent 70%);',
      '  z-index: 55;',
      '  pointer-events: none;',
      '  animation: pw-flash-fade 1s ease-out forwards;',
      '}',
      '',
      '/* Flame burst glow */',
      '.pw-game .pw-flame-burst {',
      '  position: absolute;',
      '  left: 50%;',
      '  top: 50%;',
      '  transform: translate(-50%, -50%);',
      '  width: 340px;',
      '  height: 340px;',
      '  border-radius: 50%;',
      '  background: radial-gradient(circle, rgba(255,215,0,0.35) 0%, rgba(238,90,36,0.15) 40%, transparent 70%);',
      '  z-index: 4;',
      '  pointer-events: none;',
'  animation: pw-flame-burst-anim 0.8s ease-out forwards;',
      '}',

      '/* Top-right helper buttons */',
      '.pw-game .pw-top-right { display: flex; align-items: center; gap: 8px; }',
      '.pw-game .pw-help-btn {',
      '  width: 30px; height: 30px;',
      '  border-radius: 50%;',
      '  background: rgba(255,255,255,0.08);',
      '  border: 1px solid rgba(255,255,255,0.18);',
      '  color: #ffd700;',
      '  font-weight: 900;',
      '  font-size: 14px;',
      '  cursor: pointer;',
      '  font-family: "Outfit", sans-serif;',
      '}',
      '.pw-game .pw-jp-pill {',
      '  margin: 0 16px 10px 16px;',
      '  cursor: pointer;',
      '  background: linear-gradient(90deg,#7c1d0e,#c2410c 40%,#ee5a24 50%,#c2410c 60%,#7c1d0e);',
      '  border: 1px solid rgba(249,115,22,0.6);',
      '  border-radius: 7px;',
      '  padding: 5px 0;',
      '  text-align: center;',
      '  color: #fde047;',
      '  font-weight: 700;',
      '  font-size: 13px;',
      '  letter-spacing: 1.5px;',
      '  font-family: "Orbitron", monospace;',
      '  text-shadow: 0 0 10px rgba(253,224,71,0.6);',
      '  box-shadow: 0 0 14px rgba(249,115,22,0.3);',
      '  position: relative;',
      '  z-index: 10;',
      '}',

      '/* Jackpot modal */',
      '.pw-game .pw-jp-card {',
      '  width: 100%; max-width: 380px;',
      '  background: linear-gradient(160deg,#2a0c1f,#120313);',
      '  border-radius: 18px;',
      '  border: 2px solid rgba(249,115,22,0.4);',
      '  box-shadow: 0 0 40px rgba(238,90,36,0.25);',
      '  max-height: 90%; overflow-y: auto;',
      '}',
      '.pw-game .pw-jp-head {',
      '  background: linear-gradient(90deg,#ea580c,#c2410c);',
      '  padding: 13px 16px;',
      '  display: flex; justify-content: space-between; align-items: center;',
      '  border-top-left-radius: 16px; border-top-right-radius: 16px;',
      '  color: #fff; font-family: "Orbitron", monospace; font-weight: 700; font-size: 15px; letter-spacing: 1px;',
      '}',
      '.pw-game .pw-jp-close {',
      '  background: rgba(255,255,255,0.18);',
      '  border: 1.5px solid rgba(255,255,255,0.3);',
      '  border-radius: 7px; color: #fff; cursor: pointer;',
      '  padding: 2px 10px; font-size: 16px; font-weight: 700;',
      '}',
      '.pw-game .pw-jp-body { padding: 20px; color: #fff; }',
      '.pw-game .pw-jp-pool {',
      '  text-align: center; font-size: 32px; font-weight: 900; color: #fde047;',
      '  font-family: "Orbitron", monospace; letter-spacing: 2px; margin-bottom: 5px;',
      '  text-shadow: 0 0 16px rgba(253,224,71,0.5);',
      '}',
      '.pw-game .pw-jp-pool-label { font-size: 12px; color: rgba(255,255,255,0.5); text-align: center; margin-bottom: 20px; letter-spacing: 1px; }',
      '.pw-game .pw-jp-section { background: rgba(0,0,0,0.3); border-radius: 10px; padding: 14px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 20px; }',
      '.pw-game .pw-jp-sec-title { color: #fde047; font-size: 13px; font-family: "Orbitron", monospace; margin-bottom: 10px; }',
      '.pw-game .pw-jp-row {',
      '  display: flex; align-items: center; gap: 8px;',
      '  background: rgba(255,255,255,0.04); padding: 8px 12px; border-radius: 10px; margin-bottom: 8px;',
      '  cursor: pointer; border: 1px solid rgba(255,255,255,0.03);',
      '}',
      '.pw-game .pw-jp-rank { font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 900; width: 18px; }',
      '.pw-game .pw-jp-avat { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }',
      '.pw-game .pw-jp-avat-ph { background: rgba(255,255,255,0.1); }',
      '.pw-game .pw-jp-name { font-size: 12px; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
      '.pw-game .pw-jp-mult { font-weight: 800; color: #4ade80; font-size: 13px; }',
      '.pw-game .pw-tier {',
      '  display: flex; align-items: center; justify-content: space-between;',
      '  background: rgba(255,255,255,0.04); padding: 8px 12px; border-radius: 10px; margin-bottom: 8px; font-size: 12px;',
      '}',
      '.pw-game .pw-tier .pw-tier-share { font-weight: 900; font-size: 14px; }',
      '.pw-game .pw-jp-rules { font-size: 12px; color: rgba(255,255,255,0.75); line-height: 1.7; padding: 8px 0 0 0; margin: 0; list-style: none; }',
      '.pw-game .pw-jp-rules li { margin-bottom: 6px; }',

      '/* Jackpot win overlay */',
      '.pw-game .pw-jp-win-card {',
      '  text-align: center;',
      '  background: linear-gradient(160deg,#2a0c1f,#120313);',
      '  max-width: 340px; width: 100%; border-radius: 18px; padding: 26px 20px;',
      '  border: 2px solid rgba(255,215,0,0.5);',
      '  box-shadow: 0 0 50px rgba(238,90,36,0.35);',
      '  animation: pw-jp-pop 0.3s ease-out;',
      '}',
      '.pw-game .pw-jp-win-title { font-size: 20px; font-weight: 900; color: #fde047; font-family: "Orbitron", monospace; letter-spacing: 1px; }',
      '.pw-game .pw-jp-win-amt { font-size: 34px; font-weight: 900; color: #ffd700; margin: 8px 0 4px; text-shadow: 0 0 18px rgba(255,215,0,0.6); }',
      '.pw-game .pw-jp-win-note { font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 18px; }',
      '.pw-game .pw-jp-win-ok { background: linear-gradient(135deg,#ff6b6b,#ee5a24); color: #fff; border: none; border-radius: 20px; padding: 10px 34px; font-weight: 800; font-size: 14px; cursor: pointer; letter-spacing: 1px; font-family: "Outfit", sans-serif; }',

      '/* Help modal */',
      '.pw-game .pw-help-card {',
      '  width: 100%; max-width: 380px;',
      '  background: linear-gradient(160deg,#1a0a0a,#0d0505);',
      '  border-radius: 18px;',
      '  border: 2px solid rgba(238,90,36,0.35);',
      '  box-shadow: 0 0 40px rgba(238,90,36,0.2);',
      '  max-height: 90%; overflow-y: auto;',
      '}',
      '.pw-game .pw-help-head {',
      '  background: linear-gradient(90deg,#ee5a24,#c2410c);',
      '  padding: 13px 16px;',
      '  display: flex; justify-content: space-between; align-items: center;',
      '  border-top-left-radius: 16px; border-top-right-radius: 16px;',
      '  color: #fff; font-family: "Orbitron", monospace; font-weight: 700; font-size: 14px; letter-spacing: 1px;',
      '}',
      '.pw-game .pw-help-body { padding: 20px; color: #fff; }',
      '.pw-game .pw-help-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 2px; border-bottom: 1px dashed rgba(255,255,255,0.08); font-size: 13px; }',
      '.pw-game .pw-help-row .pw-help-prob { color: #ffd700; font-weight: 700; }',
      '.pw-game .pw-help-note { font-size: 11px; color: rgba(255,255,255,0.55); margin-top: 10px; line-height: 1.6; }',
      '.pw-game .pw-help-sub { font-size: 13px; font-weight: 800; color: #ffd700; margin: 14px 0 6px; }',
      '.pw-game .pw-help-text { font-size: 12px; color: rgba(255,255,255,0.75); line-height: 1.7; }',

      '/* Keyframes */',
      '@keyframes pw-glow-pulse {',
      '  0%, 100% { box-shadow: 0 0 30px rgba(238,90,36,0.4); }',
      '  50% { box-shadow: 0 0 50px rgba(238,90,36,0.65); }',
      '}',
      '@keyframes pw-fire-pulse {',
      '  0%, 100% { box-shadow: 0 4px 16px rgba(238,90,36,0.3); }',
      '  50% { box-shadow: 0 6px 28px rgba(255,107,107,0.55); }',
      '}',
      '@keyframes pw-ember {',
      '  0% { transform: translateY(600px); opacity: 0; }',
      '  10% { opacity: 0.6; }',
      '  80% { opacity: 0.3; }',
      '  100% { transform: translateY(-20px); opacity: 0; }',
      '}',
      '@keyframes pw-confetti-fall {',
      '  0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }',
      '  100% { transform: translateY(-220px) rotate(720deg) scale(0.2); opacity: 0; }',
      '}',
      '@keyframes pw-result-pop {',
      '  0% { transform: scale(0.3); opacity: 0; }',
      '  60% { transform: scale(1.15); }',
      '  100% { transform: scale(1); opacity: 1; }',
      '}',
      '@keyframes pw-burn-fade {',
      '  0% { transform: scale(0.5); opacity: 1; }',
      '  30% { transform: scale(1.1); opacity: 1; }',
      '  100% { transform: scale(0.9); opacity: 0; }',
      '}',
      '@keyframes pw-phoenix-emerge {',
      '  0% { transform: translate(-50%, -50%) scale(0) rotate(-20deg); opacity: 0; }',
      '  40% { transform: translate(-50%, -50%) scale(1.4) rotate(10deg); opacity: 1; }',
      '  70% { transform: translate(-50%, -50%) scale(1.2) rotate(0deg); opacity: 1; }',
      '  100% { transform: translate(-50%, -60%) scale(0.8); opacity: 0; }',
      '}',
      '@keyframes pw-flash-fade {',
      '  0% { opacity: 1; }',
      '  100% { opacity: 0; }',
      '}',
      '@keyframes pw-flame-burst-anim {',
      '  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }',
      '  100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }',
      '}',
      '@keyframes pw-jp-pop {',
      '  0% { transform: scale(0.85); opacity: 0; }',
      '  100% { transform: scale(1); opacity: 1; }',
      '}'
    ].join('\n');
  }

  // ── Draw Wheel on Canvas ───────────────────────────────────────────
  function drawWheel(angle) {
    if (!ctx) return;
    var dpr = window.devicePixelRatio || 1;
    var cx = canvasSize / 2;
    var cy = canvasSize / 2;
    var outerR = canvasSize / 2 - 4;
    var innerR = 32;

    ctx.clearRect(0, 0, canvasSize * dpr, canvasSize * dpr);
    ctx.save();
    ctx.scale(dpr, dpr);

    // Outer rim glow ring
    ctx.beginPath();
    ctx.arc(cx, cy, outerR + 2, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw segments (rotated)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    for (var i = 0; i < 8; i++) {
      var startA = i * segmentAngle - Math.PI / 2;
      var endA = startA + segmentAngle;
      var seg = segments[i];

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, outerR - 3, startA, endA);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();

      // Radial depth overlay (darken toward edges)
      var grad = ctx.createRadialGradient(0, 0, innerR, 0, 0, outerR - 3);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, outerR - 3, startA, endA);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Gold segment separator line
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(startA) * (outerR - 3), Math.sin(startA) * (outerR - 3));
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Multiplier text
      var midA = startA + segmentAngle / 2;
      var textR = outerR * 0.62;
      ctx.save();
      ctx.translate(Math.cos(midA) * textR, Math.sin(midA) * textR);
      ctx.rotate(midA + Math.PI / 2);
      ctx.fillStyle = seg.mult === 0 ? '#666' : (i >= 6 ? '#1a0505' : '#fff');
      ctx.font = '900 ' + (i >= 6 ? '18' : '15') + 'px Outfit';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = seg.mult === 0 ? 'transparent' : 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 3;
      ctx.fillText(seg.label, 0, 0);
      ctx.shadowBlur = 0;
      ctx.restore();

      // Special glow on 50x segment
      if (i === 7) {
        ctx.beginPath();
        ctx.arc(0, 0, outerR - 3, startA, endA);
        ctx.closePath();
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 14;
        ctx.strokeStyle = 'rgba(255,215,0,0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore(); // un-rotate

    // Inner dark circle
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
    var innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
    innerGrad.addColorStop(0, '#3d1510');
    innerGrad.addColorStop(1, '#1a0505');
    ctx.fillStyle = innerGrad;
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Phoenix fire emoji center
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\uD83D\uDD25', cx, cy);

    ctx.restore(); // un-scale
  }

  // ── Spin Animation ─────────────────────────────────────────────────
  function spinWheel() {
    if (isSpinning) return;
    if (balance < currentBet) { showMsg(currentLang === 'ar' ? 'رصيد غير كافٍ' : 'Insufficient balance'); return; }

    isSpinning = true;
    setBettingEnabled(false);

    // Clear previous result
    var resultEl = el('pw-result');
    if (resultEl) resultEl.innerHTML = '';
    var collectEl = el('pw-collect-btn');
    if (collectEl) collectEl.style.display = 'none';

    // Real bet debit (rejects server-side if balance is insufficient)
    realBet(currentBet).then(function(res) {
      if (!res || !res.success) {
        isSpinning = false;
        setBettingEnabled(true);
        showMsg((res && res.error) ? (res.error === 'insufficient_funds' ? (currentLang === 'ar' ? 'رصيد غير كافٍ' : 'Insufficient balance') : res.error) : 'Spin failed');
        return;
      }
      balance -= currentBet;
      updateBalanceDisplay();
      lastSpinBet = currentBet;
      contributeToJackpot(currentBet);

      // Pick target segment
      var targetIdx = pickWeightedSegment();
      var seg = segments[targetIdx];
      winMultiplier = seg.mult;
      winAmount = currentBet * seg.mult;

      // Calculate target angle so pointer lands on target segment
      var segCenter = targetIdx * segmentAngle + segmentAngle / 2;
      var randomOffset = (Math.random() - 0.5) * segmentAngle * 0.7;
      var targetAngle = -(segCenter + randomOffset);
      targetAngle = ((targetAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      // Add 5-7 full rotations
      var fullSpins = (5 + Math.floor(Math.random() * 3)) * 2 * Math.PI;
      var totalRotation = fullSpins + targetAngle - (currentAngle % (2 * Math.PI));
      if (totalRotation < fullSpins) totalRotation += 2 * Math.PI;

      var startAngle = currentAngle;
      var endAngle = startAngle + totalRotation;
      var duration = 4500 + Math.random() * 1500;
      var startTime = null;
      var lastSegIdx = -1;

      function animate(ts) {
        if (!startTime) startTime = ts;
        var elapsed = ts - startTime;
        var progress = Math.min(elapsed / duration, 1);

        // Cubic ease-out
        var eased = 1 - Math.pow(1 - progress, 3);

        var angle = startAngle + totalRotation * eased;
        currentAngle = angle;
        drawWheel(angle);

        // Tick pulse when crossing segment boundaries
        var normAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        var currentSegAtPointer = Math.floor(normAngle / segmentAngle) % 8;
        if (currentSegAtPointer !== lastSegIdx && lastSegIdx !== -1) {
          var wc = container.querySelector('.pw-wheel-container');
          if (wc) {
            wc.style.boxShadow = '0 0 50px rgba(255,215,0,0.6)';
            setTimeout(function() { if (wc) wc.style.boxShadow = ''; }, 80);
          }
        }
        lastSegIdx = currentSegAtPointer;

        if (progress < 1) {
          rafId = requestAnimationFrame(animate);
        } else {
          onSpinComplete(targetIdx);
        }
      }

      rafId = requestAnimationFrame(animate);
    });
  }

  // ── On Spin Complete ───────────────────────────────────────────────
  function onSpinComplete(segIdx) {
    isSpinning = false;
    var seg = segments[segIdx];

    // Flash the wheel
    var wc = container.querySelector('.pw-wheel-container');
    if (wc) {
      wc.style.boxShadow = '0 0 60px rgba(255,215,0,0.7)';
      setTimeout(function() { if (wc) wc.style.boxShadow = ''; }, 600);
    }

    // Flame burst
    showFlameBurst();

    var resultEl = el('pw-result');
    if (!resultEl) return;

    if (seg.mult > 0) {
      var winAmtStr = fmtNumFull(winAmount);
      resultEl.innerHTML =
        '<div class="pw-mult-badge">' + seg.label + '</div>' +
        '<div class="pw-result-win">' + l().youWin + ' +' + winAmtStr + ' \uD83E\uDDE0</div>';

      var collectEl = el('pw-collect-btn');
      if (collectEl) collectEl.style.display = 'inline-block';

      spawnConfetti(30);

      // High multiplier special effects (10x+)
      if (seg.mult >= 10) {
        spawnScreenFlash();
        spawnPhoenixRise();
        setTimeout(function() { spawnConfetti(25); }, 300);
      }

      // Auto-dim result after 3s
      var t = setTimeout(function() {
        if (resultEl) {
          var rw = resultEl.querySelector('.pw-result-win');
          var mb = resultEl.querySelector('.pw-mult-badge');
          if (rw) rw.style.opacity = '0.5';
          if (mb) mb.style.opacity = '0.5';
        }
      }, 3000);
      timers.push(t);
    } else {
      resultEl.innerHTML = '<div class="pw-result-burn">' + l().burned + '</div>';
      var t2 = setTimeout(function() { if (resultEl) resultEl.innerHTML = ''; }, 2000);
      timers.push(t2);
    }

    setBettingEnabled(true);
  }

  // ── Celebration Effects ────────────────────────────────────────────
  function spawnConfetti(count) {
    if (!container) return;
    var colors = ['#ff6b6b', '#ee5a24', '#ffd700', '#ff8c00', '#e74c3c', '#fff8dc', '#ff4757'];
    var rect = container.getBoundingClientRect();
    for (var i = 0; i < count; i++) {
      var el = document.createElement('div');
      el.className = 'pw-game pw-confetti';
      var size = 4 + Math.random() * 6;
      var isCircle = Math.random() > 0.5;
      el.style.cssText =
        'width:' + size + 'px;' +
        'height:' + (isCircle ? size : size * 2.5) + 'px;' +
        'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
        'border-radius:' + (isCircle ? '50%' : '2px') + ';' +
        'left:' + (rect.width * 0.3 + Math.random() * rect.width * 0.4) + 'px;' +
        'top:' + (rect.height * 0.35 + Math.random() * rect.height * 0.15) + 'px;' +
        'animation-duration:' + (1.2 + Math.random() * 1.0) + 's;' +
        'animation-delay:' + (Math.random() * 0.3) + 's;';
      container.appendChild(el);
      (function(e) {
        var t = setTimeout(function() { if (e.parentNode) e.parentNode.removeChild(e); }, 2500);
        timers.push(t);
      })(el);
    }
  }

  function showFlameBurst() {
    if (!container) return;
    var el = document.createElement('div');
    el.className = 'pw-game pw-flame-burst';
    container.appendChild(el);
    var t = setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 900);
    timers.push(t);
  }

  function spawnScreenFlash() {
    if (!container) return;
    var el = document.createElement('div');
    el.className = 'pw-game pw-screen-flash';
    container.appendChild(el);
    var t = setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 1100);
    timers.push(t);
  }

  function spawnPhoenixRise() {
    if (!container) return;
    var el = document.createElement('div');
    el.className = 'pw-game pw-phoenix-rise';
    el.textContent = '\uD83D\uDC51\uD83D\uDD25';
    container.appendChild(el);
    var t = setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 2000);
    timers.push(t);
  }

  function createEmbers() {
    if (!container) return;
    var colors = ['#ff6b6b', '#ee5a24', '#ffd700'];
    for (var i = 0; i < 18; i++) {
      var el = document.createElement('div');
      el.className = 'pw-game pw-ember';
      var size = 2 + Math.random() * 2.5;
      el.style.cssText =
        'width:' + size + 'px;' +
        'height:' + size + 'px;' +
        'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
        'left:' + (Math.random() * 100) + '%;' +
        'animation-duration:' + (6 + Math.random() * 6) + 's;' +
        'animation-delay:' + (Math.random() * 8) + 's;';
      container.appendChild(el);
    }
  }

  // ── Betting State ──────────────────────────────────────────────────
  function setBettingEnabled(enabled) {
    var chips = container.querySelectorAll('.pw-chip');
    for (var i = 0; i < chips.length; i++) chips[i].disabled = !enabled;
    var spinBtn = el('pw-spin-btn');
    if (spinBtn) spinBtn.disabled = !enabled;
  }

  function updateBetInfo() {
    var betInfoEl = el('pw-bet-info');
    if (!betInfoEl) return;
    var maxWin = currentBet * 50;
    betInfoEl.textContent = l().betInfo(fmtNumFull(currentBet), fmtNumFull(maxWin));
  }

  function selectChip(idx) {
    currentBet = BET_CHIPS[idx];
    var chips = container.querySelectorAll('.pw-chip');
    for (var i = 0; i < chips.length; i++) {
      chips[i].classList.toggle('pw-chip-active', i === idx);
    }
    updateBetInfo();
  }

  // ── Collect Handler ────────────────────────────────────────────────
  function onCollect() {
    if (winAmount <= 0) return;
    var amt = winAmount;
    var mult = winMultiplier;
    realWin(amt).then(function(res) {
      if (!res || !res.success) {
        showMsg((res && res.error) ? (res.error === 'insufficient_funds' ? (currentLang === 'ar' ? 'رصيد غير كافٍ' : 'Insufficient balance') : res.error) : 'Collect failed');
        return; // keep pending so the user can retry
      }
      balance += amt;
      updateBalanceDisplay();
      winAmount = 0;
      winMultiplier = 0;
      var collectEl = el('pw-collect-btn');
      if (collectEl) collectEl.style.display = 'none';
      var resultEl = el('pw-result');
      if (resultEl) resultEl.innerHTML = '';

      // Jackpot progress = cumulative collected Intel (armed, rules-bounded).
      var uid = uidOf();
      var incF = jpInc();
      if (uid && jpDB() && incF && window.usersCollection) {
        var release = window.SecurityGuard ? window.SecurityGuard.arm('phoenixjp') : null;
        window.usersCollection.doc(uid).update({ phoenix_jackpot_prog: incF(Math.round(amt)) })
          .then(function() { if (release) release(); }, function() { if (release) release(); });
        upsertExplorer(uid, mult);
        var prev = jackpotProgress;
        jackpotProgress += Math.round(amt);
        if (jackpotProgress >= JP_THRESHOLD) {
          if (prev < JP_THRESHOLD) jackpotPending = true;
          if (jackpotPending) triggerJackpot(uid, lastSpinBet || currentBet);
        }
      }
    });
  }

  // ── Avatar Click (Mini Profile) ────────────────────────────────────
  function onAvatarClick() {
    var uid = uidOf();
    if (!uid) return;
    if (typeof window.openLuckyGamesMiniProfile === 'function') {
      window.openLuckyGamesMiniProfile(uid);
    } else if (typeof window.openMiniProfile === 'function') {
      window.openMiniProfile(uid);
    } else if (typeof window.setMiniProfileUID !== 'undefined') {
      window.setMiniProfileUID(uid);
      window.setShowMiniProfile(true);
    }
  }

  // ── Avatar Render (real photo + equipped frame) ───────────────────
  function mountAvatar(mountEl) {
    if (!mountEl) return;
    var user = currentUser();
    var photoURL = (user && (user.photoURL || user.photo)) || '';
    if (window.ReactDOM && window.React && window.AvatarWithFrameV11) {
      window.ReactDOM.render(
        window.React.createElement(window.AvatarWithFrameV11, {
          photoURL: photoURL,
          equipped: user ? user.equipped : null,
          size: 'sm',
          isOnline: user ? !!user.online : undefined,
          banData: user ? user.banData : undefined,
          lang: currentLang
        }),
        mountEl
      );
    } else {
      var img = document.createElement('img');
      img.alt = 'avatar';
      img.src = photoURL || 'https://ui-avatars.com/api/?name=User&background=1e293b&color=fff&size=96';
      img.onerror = function() {
        this.src = 'https://ui-avatars.com/api/?name=User&background=1e293b&color=fff&size=96';
      };
      mountEl.appendChild(img);
    }
  }

  // ── Build DOM ──────────────────────────────────────────────────────
  function buildDOM() {
    if (!container) return;
    var isRTL = currentLang === 'ar';

    container.innerHTML = '';
    container.className = 'pw-game';
    container.dir = isRTL ? 'rtl' : 'ltr';

    // Inject scoped style
    var styleEl = document.createElement('style');
    styleEl.textContent = getCSS();
    container.appendChild(styleEl);

    // Top bar
    var topbar = document.createElement('div');
    topbar.className = 'pw-topbar';

    var titleDiv = document.createElement('div');
    titleDiv.className = 'pw-title';
    titleDiv.textContent = l().title;
    topbar.appendChild(titleDiv);

    var topRight = document.createElement('div');
    topRight.className = 'pw-top-right';

    var helpBtn = document.createElement('button');
    helpBtn.className = 'pw-help-btn';
    helpBtn.type = 'button';
    helpBtn.title = l().howTo;
    helpBtn.textContent = '?';
    helpBtn.addEventListener('click', openHelpModal);
    listeners.push({ el: helpBtn, evt: 'click', fn: openHelpModal });
    topRight.appendChild(helpBtn);

    var avatarWrap = document.createElement('div');
    avatarWrap.className = 'pw-avatar-wrap';
    mountAvatar(avatarWrap);
    avatarWrap.addEventListener('click', onAvatarClick);
    listeners.push({ el: avatarWrap, evt: 'click', fn: onAvatarClick });
    topRight.appendChild(avatarWrap);

    topbar.appendChild(topRight);

    container.appendChild(topbar);

    // Accent line
    var accentLine = document.createElement('div');
    accentLine.className = 'pw-accent-line';
    container.appendChild(accentLine);

    // Jackpot pill (Fire theme)
    var jpPill = document.createElement('button');
    jpPill.id = 'pw-jp-pill';
    jpPill.className = 'pw-jp-pill';
    jpPill.type = 'button';
    jpPill.addEventListener('click', openJackpotModal);
    listeners.push({ el: jpPill, evt: 'click', fn: openJackpotModal });
    container.appendChild(jpPill);
    renderJackpotPill();

    // Wheel area
    var wheelArea = document.createElement('div');
    wheelArea.className = 'pw-wheel-area';
    wheelArea.id = 'pw-wheel';

    var wheelContainer = document.createElement('div');
    wheelContainer.className = 'pw-wheel-container';

    // Canvas
    canvas = document.createElement('canvas');
    canvas.id = 'pw-segments';
    var dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = canvasSize + 'px';
    canvas.style.height = canvasSize + 'px';
    ctx = canvas.getContext('2d');
    wheelContainer.appendChild(canvas);

    // Pointer
    var pointer = document.createElement('div');
    pointer.className = 'pw-pointer';
    wheelContainer.appendChild(pointer);

    wheelArea.appendChild(wheelContainer);
    container.appendChild(wheelArea);

    // Draw initial wheel
    drawWheel(currentAngle);

    // Bet section
    var betSection = document.createElement('div');
    betSection.className = 'pw-bet-section';

    // Chips
    var chipsRow = document.createElement('div');
    chipsRow.className = 'pw-chips-row';
    chipsRow.id = 'pw-bet-btns';
    for (var i = 0; i < BET_CHIPS.length; i++) {
      (function(idx) {
        var chip = document.createElement('button');
        chip.className = 'pw-chip' + (idx === 0 ? ' pw-chip-active' : '');
        chip.innerHTML = '\uD83E\uDDE0 ' + CHIP_LABELS[idx];
        chip.addEventListener('click', function() { selectChip(idx); });
        listeners.push({ el: chip, evt: 'click', fn: function() { selectChip(idx); } });
        chipsRow.appendChild(chip);
      })(i);
    }
    betSection.appendChild(chipsRow);

    // Spin button
    var spinBtn = document.createElement('button');
    spinBtn.id = 'pw-spin-btn';
    spinBtn.className = 'pw-spin-btn';
    spinBtn.textContent = l().spin;
    spinBtn.addEventListener('click', spinWheel);
    listeners.push({ el: spinBtn, evt: 'click', fn: spinWheel });
    betSection.appendChild(spinBtn);

    container.appendChild(betSection);

    // Result area
    var resultArea = document.createElement('div');
    resultArea.className = 'pw-result-area';
    var resultDiv = document.createElement('div');
    resultDiv.id = 'pw-result';
    resultArea.appendChild(resultDiv);

    // Collect button
    var collectBtn = document.createElement('button');
    collectBtn.id = 'pw-collect-btn';
    collectBtn.className = 'pw-collect-btn';
    collectBtn.textContent = l().collect;
    collectBtn.style.display = 'none';
    collectBtn.addEventListener('click', onCollect);
    listeners.push({ el: collectBtn, evt: 'click', fn: onCollect });
    resultArea.appendChild(collectBtn);

    container.appendChild(resultArea);

    // Bet info
    var betInfoDiv = document.createElement('div');
    betInfoDiv.className = 'pw-bet-info';
    betInfoDiv.id = 'pw-bet-info';
    container.appendChild(betInfoDiv);
    updateBetInfo();

    // Balance bar
    var balanceBar = document.createElement('div');
    balanceBar.className = 'pw-balance-bar';
    var balanceEl = document.createElement('div');
    balanceEl.id = 'pw-balance';
    balanceEl.innerHTML = '\uD83E\uDDE0 <span class="pw-balance-amt">' + fmtNum(balance) + '</span> ' + l().intel;
    balanceBar.appendChild(balanceEl);
    container.appendChild(balanceBar);

    // Ambient embers
    createEmbers();
  }

  // ── PUBLIC API ─────────────────────────────────────────────────────
  function start(c, opts) {
    container = c;
    options = opts || {};
    currentLang = (opts && opts.lang) || 'en';
    var user = currentUser();
    balance = (user && user.currency != null) ? Number(user.currency) : 0;
    currentBet = 100;
    currentAngle = 0;
    isSpinning = false;
    winAmount = 0;
    winMultiplier = 0;
    activeRoundTag = 0;
    jackpotProgress = Number((user && user.phoenix_jackpot_prog) || 0);
    jackpotPending = false;
    jackpotWinInfo = null;
    lastSpinBet = 0;
    showJackpotModal = false;
    showHelpModal = false;
    startJackpotListeners();
    // Fresh read of the real Firestore progress (in case the cached user doc is stale)
    var refreshUid = uidOf();
    if (refreshUid && window.usersCollection) {
      window.usersCollection.doc(refreshUid).get().then(function(d) {
        if (d.exists && d.data().phoenix_jackpot_prog != null) {
          jackpotProgress = Number(d.data().phoenix_jackpot_prog) || 0;
        }
      }).then(function() {}, function() {});
    }
    canvas = null;
    ctx = null;
    buildDOM();
  }

  function stop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    for (var j = 0; j < listeners.length; j++) {
      listeners[j].el.removeEventListener(listeners[j].evt, listeners[j].fn);
    }
    listeners = [];
    for (var k = 0; k < dbUnsubs.length; k++) { try { dbUnsubs[k](); } catch (e) {} }
    dbUnsubs = [];
    if (container) container.innerHTML = '';
    container = null;
    options = null;
    canvas = null;
    ctx = null;
  }

  function setLanguage(lang) {
    if (!lang) return;
    currentLang = lang;
    if (!container) return;
    var savedAngle = currentAngle;
    buildDOM();
    currentAngle = savedAngle;
    if (ctx) drawWheel(currentAngle);
  }

  // ── Export ──────────────────────────────────────────────────────────
  window.PhoenixWheelGame = { start: start, stop: stop, setLanguage: setLanguage };

})();
