/* ══════════════════════════════════════════════════════════════════
   GREEDY CAT – Advanced Integration (Sync Edition)
   Architecture: Clean-State IIFE
   Exposes: window.GreedyCatGame
   ══════════════════════════════════════════════════════════════════ */

;(function () {
  'use strict';
  window.GreedyCatGame = window.GreedyCatGame || {};

  /* ── 1. CONFIGURATION ── */
  var SYMBOLS = [
    { name: 'Tomato',  nameAr: 'طماطم', emoji: '🍅', mult: 5,  id: 'tomato',  cat: 'vegetable' },
    { name: 'Pepper',  nameAr: 'فلفل',  emoji: '🌶️', mult: 5,  id: 'pepper',  cat: 'vegetable' },
    { name: 'Carrot',  nameAr: 'جزر',   emoji: '🥕', mult: 5,  id: 'carrot',  cat: 'vegetable' },
    { name: 'Corn',    nameAr: 'ذرة',   emoji: '🌽', mult: 5,  id: 'corn',    cat: 'vegetable' },
    { name: 'Shrimp',  nameAr: 'جمبري', emoji: '🍤', mult: 10, id: 'shrimp',  cat: 'seafood'   },
    { name: 'Cow',     nameAr: 'بقرة',  emoji: '🐄', mult: 15, id: 'cow',     cat: 'meat'      },
    { name: 'Fish',    nameAr: 'سمك',   emoji: '🐟', mult: 25, id: 'fish',    cat: 'seafood'   },
    { name: 'Chicken', nameAr: 'دجاج',  emoji: '🐔', mult: 45, id: 'chicken', cat: 'meat'      },
  ];

  var COIN_OPTS = [10, 100, 1000, 10000, 100000];
  var MAX_BET   = 1000000;

  /* ── 2. STATE ── */
  var S = {
    balance: 0, selectedCoin: 100, bets: {}, specialBets: {},
    roundId: '---', phase: 'betting', timeLeft: null,
    totalWin: 0, currentUser: null, targetEndTime: 0,
    lastWinningId: null, lastBonusType: null, lastRotationTrigger: 0
  };

  var lang   = 'en';
  var rootEl = null;
  var soundOn = true;
  var unsubscribeSync = null;
  var currencyUnsub = null;
  var resultsUnsub = null;

  /* ── 3. TRANSLATIONS ── */
  var STRINGS = {
    en: {
      ROUND: 'Round', BALANCE: 'BALANCE', WIN_TOTAL: 'WIN TOTAL',
      PLACE_BETS: '🎯 Place your bets!', WAIT: 'Wait for next round!',
      NO_COINS: 'Not enough coins!', MAX_BET: 'Max bet reached!',
      SPINNING: '⏳ Results soon...', WINNER_TITLE: '🏆 {name} wins!',
      HOW_TO_PLAY: 'HOW TO PLAY', MY_RECORD: 'MY RECORD', CLOSE: 'CLOSE', GOT_IT: 'GOT IT!',
      READY: 'Results soon', SALAD: 'Salad', PIZZA: 'Pizza',
      VEG_BONUS: 'VEG BONUS', MEAT_BONUS: 'MEAT BONUS',
      RECORDS_EMPTY: 'No wins yet! Place your bets 🎯',
      BIG_WIN: 'Big Win! 🔥', YOU_WIN: 'You Win!',
      HISTORY: 'HISTORY:', BACK: '← Games',
      WINNERS: 'Winners:', BETTER_LUCK: 'Better luck next time!'
    },
    ar: {
      ROUND: 'الجولة', BALANCE: 'الرصيد', WIN_TOTAL: 'إجمالي الربح',
      PLACE_BETS: '🎯 ضع مراهناتك!', WAIT: 'انتظر الجولة القادمة!',
      NO_COINS: 'لا يوجد رصيد كافٍ!', MAX_BET: 'وصلت للحد الأقصى!',
      SPINNING: '⏳ النتائج قريباً...', WINNER_TITLE: '🏆 فاز {name}!',
      HOW_TO_PLAY: 'كيف تلعب', MY_RECORD: 'سجلي', CLOSE: 'إغلاق', GOT_IT: 'حسناً!',
      READY: 'النتائج قريباً', SALAD: 'سلطة', PIZZA: 'بيتزا',
      VEG_BONUS: 'بونص خضار', MEAT_BONUS: 'بونص لحوم',
      RECORDS_EMPTY: 'لا توجد مكاسب بعد!',
      BIG_WIN: 'فوز كبير! 🔥', YOU_WIN: 'لقد فزت!',
      HISTORY: 'السجل:', BACK: '← الألعاب',
      WINNERS: 'الفائزون:', BETTER_LUCK: 'حظ أوفر المرة القادمة!'
    }
  };
  function T(key) { return (STRINGS[lang] && STRINGS[lang][key]) || (STRINGS.en[key]) || key; }

  /* ── 4. UTILS ── */
  function fmtNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K';
    return n.toLocaleString();
  }
  function $(id) { return document.getElementById(id); }

  /* ── 5. LOCAL RECORD STORAGE (wins only) ── */
  function _recKey() {
    return 'gc_wins_' + (S.currentUser && S.currentUser.uid ? S.currentUser.uid : 'anon');
  }
  function saveWinRecord(rec) {
    try {
      var key = _recKey();
      var arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.unshift(rec);
      if (arr.length > 100) arr = arr.slice(0, 100);
      localStorage.setItem(key, JSON.stringify(arr));
    } catch(e) { console.error('[PRO SPY ERROR] saveWinRecord failed:', e); }
  }
  function getWinRecords() {
    try { return JSON.parse(localStorage.getItem(_recKey()) || '[]'); }
    catch(e) { return []; }
  }

  /* ── 6. SOUND ENGINE ── */
  var audioCtx = null;
  function playSound(type) {
    if (!soundOn) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var now = audioCtx.currentTime;

      if (type === 'click' || type === 'bet') {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(type === 'bet' ? 440 : 800, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(now + 0.1);

      } else if (type === 'win') {
        [523.25, 659.25, 783.99].forEach(function(f, i) {
          var o = audioCtx.createOscillator(); var g = audioCtx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(f, now + i * 0.1);
          g.gain.setValueAtTime(0.1, now + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
          o.connect(g); g.connect(audioCtx.destination);
          o.start(now + i * 0.1); o.stop(now + i * 0.1 + 0.3);
        });

      } else if (type === 'lose') {
        [330, 262, 196].forEach(function(f, i) {
          var o = audioCtx.createOscillator(); var g = audioCtx.createGain();
          o.type = 'sawtooth';
          o.frequency.setValueAtTime(f, now + i * 0.18);
          g.gain.setValueAtTime(0.07, now + i * 0.18);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.35);
          o.connect(g); g.connect(audioCtx.destination);
          o.start(now + i * 0.18); o.stop(now + i * 0.18 + 0.35);
        });
      }
    } catch(e) { console.error('[PRO SPY ERROR] playSound failed:', e); }
  }

  /* ── 7. SYNC ENGINE ── */
  function subscribeSync() {
    if (!window.db) return;
    var sessDoc = window.db.collection('artifacts').doc(window.appId)
      .collection('public').doc('data')
      .collection('lucky_games_sessions').doc('greedy_cat');

    unsubscribeSync = sessDoc.onSnapshot(function(doc) {
      if (!doc.exists) { GreedyCatGame.initNewRound(sessDoc); return; }
      var data = doc.data();
      S.lastWinningId  = data.winningId;
      S.lastBonusType  = data.bonusType;
      S.targetEndTime  = data.endTime && typeof data.endTime.toMillis === 'function'
                         ? data.endTime.toMillis() : 0;
      updateTimerUI();
      if (data.roundId !== S.roundId) startNewClientRound(data.roundId);
      if ($('gc-round-num')) $('gc-round-num').textContent = data.roundId;
    });

    if (!window.GreedyCatGame._ticker) {
      window.GreedyCatGame._ticker = setInterval(function() { updateTimerUI(); }, 1000);
    }

    if (window.usersCollection && S.currentUser && S.currentUser.uid) {
      currencyUnsub = window.usersCollection.doc(S.currentUser.uid).onSnapshot(function(d) {
        if (d.exists) { S.balance = d.data().currency || 0; updateUI(); }
      });
    }

    resultsUnsub = sessDoc.collection('results').orderBy('timestamp', 'desc').limit(10).onSnapshot(function(snap) {
      var list = $('gc-results-list');
      if (!list) return;
      list.innerHTML = '';
      snap.forEach(function(d) {
        var h = d.data();
        var sym = SYMBOLS.find(function(s) { return s.id === h.winningId; });
        var chip = document.createElement('div');
        chip.className = 'gc-result-chip';
        chip.textContent = sym ? sym.emoji : '?';
        chip.title = 'Round #' + h.roundId;
        list.appendChild(chip);
      });
    });
  }

  /* ── 8. TIMER + CAT MOOD ── */
  function updateTimerUI() {
    if (!S.targetEndTime) return;
    var now  = Date.now();
    var diff = Math.floor((S.targetEndTime - now) / 1000);
    S.timeLeft = Math.max(0, diff);

    var badge = $('gc-timer-badge');
    if (!badge) return;
    badge.textContent = S.timeLeft + 's';

    if (S.timeLeft > 5) {
      if (S.phase !== 'betting') {
        S.phase = 'betting';
        if ($('gc-ticker')) $('gc-ticker').textContent = T('PLACE_BETS');
        badge.style.background = 'linear-gradient(135deg,#f6a800,#e0600a)';
        if ($('gc-spin-indicator')) $('gc-spin-indicator').classList.remove('spinning');
      }
      /* Cat mood varies with remaining time */
      var catEl = $('gc-cat');
      if (catEl) {
        if      (S.timeLeft > 18) catEl.textContent = '😺';
        else if (S.timeLeft > 10) catEl.textContent = '😸';
        else                      catEl.textContent = '😬';
      }

    } else if (S.timeLeft <= 5 && S.timeLeft > 0) {
      if (S.phase === 'betting') resolveRound({ roundId: S.roundId, winningId: S.lastWinningId, bonusType: S.lastBonusType });
      S.phase = 'reveal';
      if ($('gc-ticker')) $('gc-ticker').textContent = T('SPINNING');
      badge.style.background = '#e63946';
      if ($('gc-cat')) $('gc-cat').textContent = '🙀';

    } else if (S.timeLeft === 0) {
      if (S.phase === 'betting') resolveRound({ roundId: S.roundId, winningId: S.lastWinningId, bonusType: S.lastBonusType });
      S.phase = 'reveal';
      if ($('gc-ticker')) $('gc-ticker').textContent = T('SPINNING');
      badge.style.background = '#e63946';
      /* Any user can attempt rotation; rate-limited per client, silent on race loss */
      if (S.currentUser && (now - S.lastRotationTrigger > 5000)) {
        var sessDoc = window.db && window.db.collection('artifacts').doc(window.appId)
          .collection('public').doc('data').collection('lucky_games_sessions').doc('greedy_cat');
        if (sessDoc) {
          S.lastRotationTrigger = now;
          GreedyCatGame.initNewRound(sessDoc);
        }
      }
    }
  }

  /* ── 9. INIT NEW ROUND (server-side) ── */
  window.GreedyCatGame.initNewRound = async function(docRef) {
    if (!window.db || !S.currentUser) return;
    /* Any logged-in user can attempt to rotate — first writer wins, others fail silently */
    var now = Date.now();
    try {
      await window.db.runTransaction(async function(t) {
        var doc = await t.get(docRef);
        if (doc.exists) {
          var data  = doc.data();
          var endMs = data.endTime && typeof data.endTime.toMillis === 'function' ? data.endTime.toMillis() : 0;
          if (endMs > (now - 1000)) return; /* round still active – do nothing */
          if (data.winningId) {
            await docRef.collection('results').add({
              winningId: data.winningId, roundId: data.roundId,
              timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
            });
          }
        }
        var nextWin = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        var bonus   = Math.random() < 0.1 ? (Math.random() < 0.5 ? 'salad' : 'pizza') : null;
        t.set(docRef, {
          winningId: nextWin.id, bonusType: bonus,
          endTime:   window.firebase.firestore.Timestamp.fromMillis(now + 30000),
          roundId:   String(Math.floor(now / 1000)).slice(-6),
          timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
        });
      });
    } catch(e) {
      /* Silently ignore permission-denied / failed-precondition – another client won the race or user lacks permission */
    }
  };

  /* ── 10. CLIENT ROUND RESET ── */
  function startNewClientRound(rid) {
    S.roundId    = rid;
    S.bets       = {};
    S.specialBets = {};
    document.querySelectorAll('.gc-slot').forEach(function(sl) {
      sl.classList.remove('winner-flash');
      var betBadge = $('gc-bet-' + sl.dataset.name);
      if (betBadge) { betBadge.textContent = ''; betBadge.style.display = 'none'; }
    });
    if ($('gc-special-salad')) $('gc-special-salad').classList.remove('selected');
    if ($('gc-special-pizza')) $('gc-special-pizza').classList.remove('selected');
    var strip = $('gc-winner-strip');
    if (strip) { strip.innerHTML = ''; strip.style.display = 'none'; }
    updateUI();
  }

  /* ── 11. RESOLVE ROUND ── */
  async function resolveRound(data) {
    S.phase = 'reveal';
    if ($('gc-spin-indicator')) $('gc-spin-indicator').classList.add('spinning');
    if ($('gc-cat')) $('gc-cat').textContent = '🎯';

    setTimeout(async function() {
      var winner = SYMBOLS.find(function(s) { return s.id === data.winningId; });
      if (!winner) return;

      var winSl = document.querySelector('.gc-slot[data-i="' + SYMBOLS.indexOf(winner) + '"]');
      if (winSl) winSl.classList.add('winner-flash');

      var gained  = 0;
      var hasBets = Object.keys(S.bets).length > 0;
      if (S.bets[winner.name]) gained += S.bets[winner.name] * winner.mult;

      if (data.bonusType === 'salad') {
        Object.keys(S.bets).forEach(function(n) {
          var sym = SYMBOLS.find(function(x) { return x.name === n; });
          if (sym && sym.cat === 'vegetable') gained += S.bets[n] * 3;
        });
      } else if (data.bonusType === 'pizza') {
        Object.keys(S.bets).forEach(function(n) {
          var sym = SYMBOLS.find(function(x) { return x.name === n; });
          if (sym && (sym.cat === 'seafood' || sym.cat === 'meat')) gained += S.bets[n] * 3;
        });
      }

      if (gained > 0) {
        /* ── WIN ── */
        playSound('win');
        showWin(winner.emoji, gained);
        if ($('gc-cat')) $('gc-cat').textContent = '😸';
        if (window.SecurityService && S.currentUser && S.currentUser.uid) {
          try {
            await window.SecurityService.applyCurrencyTransaction(
              S.currentUser.uid, gained,
              'GreedyCat Win Round #' + data.roundId,
              { roundId: data.roundId }
            );
          } catch (e) {
            console.error('[PRO SPY ERROR] resolveRound win transaction failed:', e);
          }
        }
        saveWinRecord({ roundId: data.roundId, amount: gained, emoji: winner.emoji, time: Date.now() });
        _writeRoundWinner(data.roundId, gained, winner.emoji);
        setTimeout(function() { _showRoundWinners(data.roundId); }, 800);
        /* Also try saving winner doc – silently skip on permission error */
        /* _writeRoundWinner already has try/catch */

      } else if (hasBets) {
        /* ── LOSS with bets ── */
        playSound('lose');
        showLoss(winner.emoji);
        if ($('gc-cat')) $('gc-cat').textContent = '😿';
        setTimeout(function() {
          if ($('gc-cat')) $('gc-cat').textContent = '😺';
        }, 3500);

      } else {
        /* ── No bets – neutral ── */
        if ($('gc-cat')) $('gc-cat').textContent = '😺';
      }

      if ($('gc-spin-indicator')) $('gc-spin-indicator').classList.remove('spinning');
    }, 3000);
  }

  /* ── 12. WINNER HELPERS ── */
  async function _writeRoundWinner(roundId, amount, emoji) {
    if (!window.db || !S.currentUser || !S.currentUser.uid) return;
    try {
      var sessDoc = window.db.collection('artifacts').doc(window.appId)
        .collection('public').doc('data').collection('lucky_games_sessions').doc('greedy_cat');
      /* Write to round_winners subcollection — rule deployed: uid must match auth.uid */
      await sessDoc.collection('round_winners').add({
        roundId:     roundId,
        uid:         S.currentUser.uid,
        displayName: S.currentUser.displayName || '',
        photoURL:    S.currentUser.photoURL    || '',
        amount:      amount,
        emoji:       emoji,
        timestamp:   window.firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch(e) { console.error('[PRO SPY ERROR] _writeRoundWinner failed:', e); }
  }

  function _showRoundWinners(roundId) {
    var panel = $('gc-results-panel');
    if (!panel) return;

    /* Build panel header */
    panel.innerHTML =
      '<div class="gc-rp-header">' +
      '  <span class="gc-rp-title">' + T('WINNERS') + ' #' + roundId + '</span>' +
      '</div>' +
      '<div id="gc-rp-list"><div class="gc-rp-loading">⏳</div></div>';
    panel.style.display = 'flex';
    /* Close on tap anywhere */
    panel.onclick = function() {
      panel.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
      panel.style.transform  = 'translateY(110%)';
      panel.style.opacity    = '0';
      setTimeout(function() { panel.style.display = 'none'; panel.style.opacity = ''; }, 380);
    };

    /* Animate in */
    panel.style.transform = 'translateY(100%)';
    requestAnimationFrame(function() {
      panel.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
      panel.style.transform  = 'translateY(0)';
    });

    /* Also keep winner-strip updated (backwards compat) */
    var strip = $('gc-winner-strip');

    if (!window.db) {
      /* No Firestore – show current user's local win if it exists */
      _renderLocalWinInPanel(roundId);
      return;
    }

    var sessDoc = window.db.collection('artifacts').doc(window.appId)
      .collection('public').doc('data').collection('lucky_games_sessions').doc('greedy_cat');

    sessDoc.collection('round_winners')
      .where('roundId', '==', roundId)
      .orderBy('amount', 'desc')
      .limit(10)
      .get()
      .then(function(snap) {
        var list = $('gc-rp-list');
        if (!list) return;

        if (snap.empty) {
          _renderLocalWinInPanel(roundId);
          return;
        }

        list.innerHTML = '';
        if (strip) { strip.style.display = 'flex'; strip.innerHTML = ''; }

        snap.forEach(function(d, i) {
          var w = d.data();
          /* --- row in results panel --- */
          var row = document.createElement('div');
          row.className = 'gc-rp-row' + (i === 0 ? ' gc-rp-top' : '');
          row.innerHTML =
            '<span class="gc-rp-rank">' + (i + 1) + '</span>' +
            '<div class="gc-rp-avatar" onclick="window.openLuckyGamesMiniProfile&&window.openLuckyGamesMiniProfile(\'' + w.uid + '\')">' +
            (w.photoURL
              ? '<img src="' + w.photoURL + '" class="gc-rp-photo" onerror="this.outerHTML=\'<div class=\\\"gc-rp-photo\\\" style=\\\"background:#6366f1\\\">' + (w.emoji || '🎖️') + '</div>\'" />'
              : '<div class="gc-rp-photo" style="background:#6366f1;">' + (w.emoji || '🎖️') + '</div>') +
            '</div>' +
            '<div class="gc-rp-info">' +
            '  <div class="gc-rp-name">' + (w.displayName || '---') + '</div>' +
            '  <div class="gc-rp-food">' + (w.emoji || '') + '</div>' +
            '</div>' +
            '<div class="gc-rp-win">+' + fmtNum(w.amount) + '</div>';
          list.appendChild(row);

          /* --- mini chip in the small strip too --- */
          if (strip) {
            var chip = document.createElement('div');
            chip.className = 'gc-winner-chip';
            chip.title     = (w.displayName || '') + ' +' + fmtNum(w.amount);
            chip.onclick   = function() { if (window.openLuckyGamesMiniProfile) window.openLuckyGamesMiniProfile(w.uid); };
            chip.innerHTML =
              (w.photoURL
                ? '<img src="' + w.photoURL + '" class="gc-winner-photo" onerror="this.style.display=\'none\'" />'
                : '<div class="gc-winner-photo" style="background:#6366f1;">😀</div>')
              + '<span class="gc-winner-amount">+' + fmtNum(w.amount) + '</span>';
            strip.appendChild(chip);
          }
        });

        /* Panel stays open until user taps it */
      })
      .catch(function() { _renderLocalWinInPanel(roundId); });
  }

  /* Fallback: show only the current user's local win when Firestore unavailable */
  function _renderLocalWinInPanel(roundId) {
    var list = $('gc-rp-list');
    if (!list) return;
    var recs = getWinRecords();
    var mine = recs.find(function(r) { return r.roundId === roundId; });
    if (mine && S.currentUser) {
      list.innerHTML = '';
      var row = document.createElement('div');
      row.className = 'gc-rp-row gc-rp-top';
      var photo = S.currentUser.photoURL || '';
      row.innerHTML =
        '<span class="gc-rp-rank">🏆</span>' +
        '<div class="gc-rp-avatar">' +
        (photo ? '<img src="' + photo + '" class="gc-rp-photo" />' : '<div class="gc-rp-photo" style="background:#6366f1;">😺</div>') +
        '</div>' +
        '<div class="gc-rp-info">' +
        '  <div class="gc-rp-name">' + (S.currentUser.displayName || T('YOU_WIN')) + '</div>' +
        '  <div class="gc-rp-food">' + (mine.emoji || '') + '</div>' +
        '</div>' +
        '<div class="gc-rp-win">+' + fmtNum(mine.amount) + '</div>';
      list.appendChild(row);
    } else {
      var panel = $('gc-results-panel');
      if (panel) { panel.style.display = 'none'; }
    }
  }

  /* ── 13. HTML BUILDER ── */
  function buildHTML() {
    var isAr = lang === 'ar';
    var htmlContent = [
      '<div id="gc-root-hub">',
      '  <div id="gc-topbar">',
      '    <div style="width:44px;flex-shrink:0;"></div>',
      '    <div id="gc-ticker">' + T('PLACE_BETS') + '</div>',
      '    <div id="gc-avatar-box" onclick="window.openLuckyGamesMiniProfile&&window.openLuckyGamesMiniProfile(\'' + (S.currentUser ? S.currentUser.uid : '') + '\')">',
      '      <div id="gc-avatar-mount" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"></div>',
      '    </div>',
      '  </div>',
      '  <div id="gc-round-id">' + T('ROUND') + ' #<span id="gc-round-num">---</span></div>',
      '  <button id="gc-btn-info">i</button>',
      '  <button id="gc-btn-audio">🔊</button>',
      '  <div id="gc-wheel-scene">',
      '    <div id="gc-stand"></div>',
      '    <div id="gc-wheel">',
      '      <div id="gc-spin-indicator"></div>',
      '      <div id="gc-slots-container"></div>',
      '      <div id="gc-cat">😸</div>',
      '      <div id="gc-timer-box">',
      '        <div id="gc-timer-badge">---</div>',
      '        <div id="gc-timer-label">' + T('READY') + '</div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div id="gc-special-row">',
      '    <div class="gc-special-btn" id="gc-special-salad" onclick="GreedyCatGame.toggleSpecial(\'salad\')">',
      '      <span class="gc-special-icon">🥗</span>',
      '      <div class="gc-special-label">' + T('SALAD') + ' x3</div>',
      '    </div>',
      '    <div class="gc-special-btn" id="gc-special-pizza" onclick="GreedyCatGame.toggleSpecial(\'pizza\')">',
      '      <span class="gc-special-icon">🍕</span>',
      '      <div class="gc-special-label">' + T('PIZZA') + ' x3</div>',
      '    </div>',
      '  </div>',
      '  <div id="gc-bet-panel">',
      '    <div id="gc-bet-label">' + (isAr ? 'اختر القطعة ثم اضغط على الطعام' : 'Pick coin then tap food') + '</div>',
      '    <div id="gc-coin-row"></div>',
      '  </div>',
      '  <div id="gc-bottom-bar">',
      '    <div class="gc-stat-pill">',
      '      <div class="gc-stat-label">' + T('BALANCE') + '</div>',
      '      <div class="gc-stat-val" id="gc-stat-balance">0</div>',
      '    </div>',
      '    <button id="gc-btn-record">' + T('MY_RECORD') + '</button>',
      '    <div class="gc-stat-pill">',
      '      <div class="gc-stat-label">' + T('WIN_TOTAL') + '</div>',
      '      <div class="gc-stat-val" id="gc-stat-win">0</div>',
      '    </div>',
      '  </div>',
      '  <div id="gc-results-strip">',
      '    <div id="gc-results-label">' + T('HISTORY') + '</div>',
      '    <div id="gc-results-list"></div>',
      '  </div>',
      '  <div id="gc-modal-overlay" onclick="GreedyCatGame.closeModal(event)">',
      '    <div class="gc-modal-box" id="gc-modal-content"></div>',
      '  </div>',
      '  <div id="gc-win-announce">',
      '    <div class="gc-win-card">',
      '      <span class="gc-win-emoji" id="gc-win-emoji">🎉</span>',
      '      <div class="gc-win-title" id="gc-win-title">' + T('BIG_WIN') + '</div>',
      '      <div class="gc-win-amount" id="gc-win-amount">+0</div>',
      '    </div>',
      '  </div>',
      '  <div id="gc-loss-announce">',
      '    <div class="gc-loss-card">',
      '      <span class="gc-loss-emoji-big" id="gc-loss-emoji-el">😿</span>',
      '      <div class="gc-loss-title">' + T('BETTER_LUCK') + '</div>',
      '      <div class="gc-loss-sub">' + (isAr ? 'لم يكن يومك اليوم 😿' : 'Not your day today 😿') + '</div>',
      '    </div>',
      '  </div>',
      '  <div id="gc-winner-strip"></div>',
      '  <div id="gc-results-panel"></div>',
      '</div>'
    ].join('\n');
    
    // Modern safe DOM injection using <template> to avoid rootEl.innerHTML direct assignment
    rootEl.innerHTML = ''; 
    var template = document.createElement('template');
    template.innerHTML = htmlContent;
    rootEl.appendChild(template.content);
  }

  /* ── 14. WHEEL BUILDER ── */
  function buildWheel() {
    var wheel = $('gc-wheel');
    if (!wheel) return;
    var cont = $('gc-slots-container');
    if (!cont) return;

    /* Insert spokes BEFORE the slots-container so they sit behind slots in DOM order */
    for (var i = 0; i < 8; i++) {
      var sp = document.createElement('div');
      sp.className       = 'gc-spoke';
      sp.style.transform = 'rotate(' + (i * 45) + 'deg)';
      wheel.insertBefore(sp, cont);   /* spokes go before cont → behind in stacking */
    }

    cont.innerHTML = '';
    SYMBOLS.forEach(function(sym, i) {
      var sl = document.createElement('div');
      sl.className    = 'gc-slot';
      sl.dataset.name = sym.name;
      sl.dataset.i    = i;
      sl.innerHTML    =
        '<span class="gc-slot-emoji">'       + sym.emoji + '</span>' +
        '<span class="gc-slot-mult-badge">x' + sym.mult + '</span>' +
        '<span class="gc-slot-bet-badge" id="gc-bet-' + sym.name + '"></span>';
      sl.onclick = (function(name) {
        return function() { GreedyCatGame.toggleBet(name); };
      })(sym.name);
      cont.appendChild(sl);
    });
  }

  /* ── 15. COIN ROW ── */
  function buildCoins() {
    var row = $('gc-coin-row');
    if (!row) return;
    row.innerHTML = '';
    COIN_OPTS.forEach(function(val) {
      var btn = document.createElement('div');
      btn.className = 'gc-coin-btn' + (S.selectedCoin === val ? ' active' : '');
      btn.innerHTML = '<div class="gc-coin-val">' + fmtNum(val) + '</div>';
      btn.onclick   = function() {
        S.selectedCoin = val;
        document.querySelectorAll('.gc-coin-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        playSound('click');
      };
      row.appendChild(btn);
    });
  }

  /* ── 16. UI UPDATE ── */
  function updateUI() {
    if ($('gc-stat-balance')) $('gc-stat-balance').textContent = fmtNum(S.balance);
    if ($('gc-stat-win'))     $('gc-stat-win').textContent     = fmtNum(S.totalWin);
  }

  /* ── 17. WIN / LOSS CARDS ── */
  function showWin(emoji, amt) {
    var ann = $('gc-win-announce');
    if (!ann) return;
    $('gc-win-emoji').textContent  = emoji;
    $('gc-win-amount').textContent = '+' + fmtNum(amt);
    ann.classList.add('show');
    S.totalWin += amt;
    updateUI();
    setTimeout(function() { ann.classList.remove('show'); }, 4000);
  }

  function showLoss(winnerEmoji) {
    var ann = $('gc-loss-announce');
    if (!ann) return;
    var el = $('gc-loss-emoji-el');
    if (el) el.textContent = winnerEmoji;
    ann.classList.add('show');
    setTimeout(function() { ann.classList.remove('show'); }, 3500);
  }

  /* ── 18. BET ACTIONS ── */
  window.GreedyCatGame.toggleBet = async function(name) {
    if (window._firestoreOnline === false) {
      if (window.showToast) window.showToast(typeof lang !== 'undefined' && lang === 'ar' ? '⚠️ لا يوجد اتصال' : '⚠️ No connection');
      return;
    }
    if (S.phase !== 'betting') return;
    var cost    = S.selectedCoin;
    var current = S.bets[name] || 0;
    if (S.balance < cost) { if (window.showToast) window.showToast(T('NO_COINS')); return; }
    if (current + cost > MAX_BET) { if (window.showToast) window.showToast(T('MAX_BET')); return; }
    if (window.SecurityService && S.currentUser && S.currentUser.uid) {
      var prevBalance = S.balance;
      try {
        var result = await window.SecurityService.applyCurrencyTransaction(
          S.currentUser.uid, -cost, 'GreedyCat Bet: ' + name, { roundId: S.roundId }
        );
        if (result && result.success === false) {
          S.balance = prevBalance; updateUI(); return;
        }
        S.bets[name] = current + cost;
        var badge = $('gc-bet-' + name);
        if (badge) { badge.textContent = fmtNum(S.bets[name]); badge.style.display = 'block'; }
        playSound('bet');
      } catch (e) {
        console.error('[PRO SPY ERROR] toggleBet failed:', e);
        S.balance = prevBalance; updateUI();
      }
    }
  };

  window.GreedyCatGame.toggleSpecial = async function(type) {
    if (S.phase !== 'betting' || S.specialBets[type]) return;
    if (S.balance < 1000) { if (window.showToast) window.showToast(T('NO_COINS')); return; }
    if (window.SecurityService && S.currentUser && S.currentUser.uid) {
      try {
        await window.SecurityService.applyCurrencyTransaction(
          S.currentUser.uid, -1000, 'GreedyCat ' + type + ' Bonus', { roundId: S.roundId }
        );
        S.specialBets[type] = true;
        var btn = $('gc-special-' + type);
        if (btn) btn.classList.add('selected');
        playSound('bet');
      } catch (e) {
        console.error('[PRO SPY ERROR] toggleSpecial failed:', e);
      }
    }
  };

  /* ── 19. MODALS ── */
  window.GreedyCatGame.openRecord = function() {
    var c = $('gc-modal-content');
    if (!c) return;
    c.innerHTML =
      '<div class="gc-modal-title" style="text-align:center;font-family:\'Fredoka One\';margin-bottom:15px;">' + T('MY_RECORD') + '</div>' +
      '<div id="gc-records-list-inner" style="max-height:270px;overflow-y:auto;"></div>' +
      '<button onclick="GreedyCatGame.closeModal()" style="width:100%;margin-top:15px;padding:12px;border:none;border-radius:12px;background:#f6c94e;color:#7a3d00;font-family:\'Fredoka One\';font-size:14px;cursor:pointer;box-shadow:0 4px 0 #c87c1a;">' + T('CLOSE') + '</button>';
    $('gc-modal-overlay').classList.add('open');

    var inner   = $('gc-records-list-inner');
    if (!inner) return;
    var records = getWinRecords();
    if (!records.length) {
      inner.innerHTML = '<div style="text-align:center;padding:30px;opacity:0.6;font-size:13px;">' + T('RECORDS_EMPTY') + '</div>';
      return;
    }
    inner.innerHTML = '';
    records.forEach(function(r) {
      var item = document.createElement('div');
      item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:rgba(255,255,255,0.08);border-radius:12px;margin-bottom:6px;';
      var d       = new Date(r.time || 0);
      var timeStr = r.time ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---';
      item.innerHTML =
        '<span style="font-size:22px">' + (r.emoji || '🍅') + '</span>' +
        '<span style="font-size:10px;color:rgba(255,255,255,0.5);">#' + (r.roundId || '---') + '</span>' +
        '<span style="font-size:10px;color:rgba(255,255,255,0.4);">' + timeStr + '</span>' +
        '<span style="color:#4ade80;font-weight:800;font-family:\'Fredoka One\';font-size:14px;">+' + fmtNum(r.amount) + '</span>';
      inner.appendChild(item);
    });
  };

  window.GreedyCatGame.showHelp = function() {
    var c    = $('gc-modal-content');
    if (!c) return;
    var isAr = lang === 'ar';
    var probs = ['19.4%','19.4%','19.4%','19.4%','9.7%','6.5%','3.9%','2.2%'];
    c.innerHTML =
      '<div style="font-family:\'Nunito\',sans-serif;color:#fff;">' +
      '<h2 style="text-align:center;font-family:\'Fredoka One\';margin-bottom:15px;">' + T('HOW_TO_PLAY') + '</h2>' +
      '<div style="background:rgba(255,255,255,0.1);border-radius:12px;padding:12px;margin-bottom:15px;font-size:12px;line-height:1.6;">' +
      '<ul style="padding-left:18px;margin:0 0 10px;">' +
      '<li>' + (isAr ? 'لديك 30 ثانية لكل جولة لاختيار طعامك والمراهنة.' : 'You have 30s per round to pick food and place bets.') + '</li>' +
      '<li>' + (isAr ? 'الحد الأقصى للمراهنة هو 1,000,000 قطعة.' : 'Max bet per round is 1,000,000 coins.') + '</li>' +
      '</ul>' +
      '<table style="width:100%;border-collapse:collapse;background:rgba(0,0,0,0.2);border-radius:8px;overflow:hidden;text-align:center;font-size:11px;">' +
      '<tr style="background:rgba(255,255,255,0.2);"><th style="padding:6px;">' + (isAr ? 'الطعام' : 'Food') + '</th><th>' + (isAr ? 'الاحتمالية' : 'Probability') + '</th></tr>' +
      SYMBOLS.map(function(s, i) {
        return '<tr><td style="padding:4px;">' + s.emoji + ' ' + (isAr ? s.nameAr : s.name) + '</td>' +
               '<td>' + probs[i] + ' (x' + s.mult + ')</td></tr>';
      }).join('') +
      '</table></div>' +
      '<button onclick="GreedyCatGame.closeModal()" style="width:100%;margin-top:8px;padding:12px;border:none;border-radius:12px;background:#f6c94e;color:#7a3d00;font-family:\'Fredoka One\';font-size:14px;cursor:pointer;box-shadow:0 4px 0 #c87c1a;">' + T('GOT_IT') + '</button>' +
      '</div>';
    $('gc-modal-overlay').classList.add('open');
  };

  window.GreedyCatGame.closeModal = function(e) {
    if (e && e.target && !e.target.classList.contains('gc-modal-overlay') && e.target.id !== 'gc-modal-overlay') return;
    var overlay = $('gc-modal-overlay');
    if (overlay) overlay.classList.remove('open');
  };

  /* ── 20. START / STOP ── */
  window.GreedyCatGame.start = function(containerIdOrEl, options) {
    options   = options || {};
    rootEl = typeof containerIdOrEl === 'string' ? $(containerIdOrEl) : containerIdOrEl;
    if (!rootEl) { console.error('[GreedyCat] Container not found:', containerIdOrEl); return; }
    lang            = options.lang || 'en';
    S.currentUser   = options.user || null;

    buildHTML();
    buildWheel();
    buildCoins();

    $('gc-btn-info').onclick   = function() { GreedyCatGame.showHelp(); };
    $('gc-btn-audio').onclick  = function() {
      soundOn = !soundOn;
      this.textContent = soundOn ? '🔊' : '🔇';
    };
    $('gc-btn-record').onclick = function() { GreedyCatGame.openRecord(); };

    /* Render Avatar — React component */
    syncUserAvatar();

    subscribeSync();
  };

  window.GreedyCatGame.stop = function() {
    if (unsubscribeSync) { unsubscribeSync(); unsubscribeSync = null; }
    if (currencyUnsub) { currencyUnsub(); currencyUnsub = null; }
    if (resultsUnsub) { resultsUnsub(); resultsUnsub = null; }
    if (window.GreedyCatGame._ticker) {
      clearInterval(window.GreedyCatGame._ticker);
      window.GreedyCatGame._ticker = null;
    }
    if (rootEl) rootEl.innerHTML = '';
  };

  function syncUserAvatar() {
    var mount = $('gc-avatar-mount');
    if (!mount) return;
    var photoURL = S.currentUser ? S.currentUser.photoURL : null;
    if (window.ReactDOM && window.React && window.AvatarWithFrameV11) {
      window.ReactDOM.render(
        window.React.createElement(window.AvatarWithFrameV11, {
          photoURL: photoURL,
          equipped: S.currentUser ? S.currentUser.equipped : null,
          size: 'sm',
          lang: lang
        }),
        mount
      );
    } else {
      mount.innerHTML = photoURL 
        ? '<img src="' + photoURL + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />'
        : '<div style="width:100%;height:100%;border-radius:50%;background:#ccc;display:flex;align-items:center;justify-content:center;">😺</div>';
    }
  }

})();
