/* ============================================================
   Super777Game.js  –  Super 777 Slots  v1.0  (Site-Integrated)
   - Currency : reads/writes window.usersCollection (field: currency)
   - Avatar   : loads real photo from useAuthState; click → openMiniProfile
   - Session  : logged to lucky_games_sessions on stop()
   - Pattern  : mirrors LuckyFruitGame.js exactly
   - Max-width: 480px  (matches LuckyGamesHub modal)
   ============================================================ */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════
     1. TRANSLATIONS
  ══════════════════════════════════════════════════════════ */
  var i18n = {
    en: {
      balance: 'Balance', bet: 'Bet', todayWin: "Today's Win", lastWin: 'Last Win',
      auto: 'AUTO', spin: 'SPIN', totalBet: 'TOTAL BET',
      winTitle: 'YOU WIN!', notEnough: 'Not enough coins!',
      round: 'Round #', betTxt: 'Bet: ', noHistory: 'No spin history yet',
      history: 'Spin History', paytable: 'Paytable', anyPos: 'Any Position',
      won: 'Won', lost: 'Lost',
    },
    ar: {
      balance: 'الرصيد', bet: 'الرهان', todayWin: 'أرباح اليوم', lastWin: 'آخر فوز',
      auto: 'تلقائي', spin: 'دوران', totalBet: 'إجمالي الرهان',
      winTitle: 'مبروك الفوز!', notEnough: 'رصيد غير كافٍ!',
      round: 'جولة #', betTxt: 'رهان: ', noHistory: 'لا يوجد سجل حتى الآن',
      history: 'سجل الجولات', paytable: 'جدول الأرباح', anyPos: 'أي موضع',
      won: 'ربح', lost: 'خسارة',
    }
  };

  function T(key) {
    var l = lang || 'en';
    return (i18n[l] && i18n[l][key] !== undefined) ? i18n[l][key] : (i18n['en'][key] || key);
  }

  /* ══════════════════════════════════════════════════════════
     2. GAME CONSTANTS
  ══════════════════════════════════════════════════════════ */
  var SYMBOLS = [
    { id: '7',      emoji: null,  name: 'Seven',      mult3: 200 },
    { id: 'bell',   emoji: '🔔',  name: 'Bell',       mult3: 60  },
    { id: 'gem',    emoji: '💎',  name: 'Diamond',    mult3: 20  },
    { id: 'wm',     emoji: '🍉',  name: 'Watermelon', mult3: 10  },
    { id: 'grape',  emoji: '🍇',  name: 'Grape',      mult3: 6   },
    { id: 'mango',  emoji: '🥭',  name: 'Mango',      mult3: 3   },
    { id: 'cherry', emoji: '🍒',  name: 'Cherry',     mult3: 1, mult2: 0.6 },
  ];

  /* Weighted reel strip – cherry appears most often */
  var REEL_STRIP = [
    '7','bell','gem','wm','grape','mango','cherry',
    'cherry','mango','grape','wm','cherry','mango','grape',
    'cherry','wm','gem','cherry','mango','grape','cherry',
    'mango','grape','cherry','mango','cherry'
  ];

  /* 5 paylines: 3 rows + 2 diagonals
     Each entry is [[row,col],[row,col],[row,col]] */
  var PAYLINES = [
    [[0,0],[0,1],[0,2]],  // 0 top row
    [[1,0],[1,1],[1,2]],  // 1 middle row
    [[2,0],[2,1],[2,2]],  // 2 bottom row
    [[0,0],[1,1],[2,2]],  // 3 diagonal ↘
    [[2,0],[1,1],[0,2]],  // 4 diagonal ↗
  ];

  var BET_OPTIONS = [10, 20, 50, 100, 200, 500, 1000, 5000];

  /* ══════════════════════════════════════════════════════════
     3. STATE
  ══════════════════════════════════════════════════════════ */
  var lang             = 'en';
  var rootEl           = null;
  var coins            = 0;       /* mirrors site currency */
  var betIdx           = 3;       /* default: 100 */
  var bet              = BET_OPTIONS[betIdx];
  var isSpinning       = false;
  var isAuto           = false;
  var autoTimer        = null;
  var todayWin         = 0;
  var roundNum         = 10024;
  var outcomes         = [];
  var soundEnabled     = true;
  var grid             = [
    ['bell','cherry','cherry'],
    ['gem', 'cherry','7'    ],
    ['7',   'wm',   'grape' ],
  ];
  var currencyUnsub    = null;
  var audioCtx         = null;
  var spinIntervalAudio= null;
  var sessionCoinsSpent= 0;
  var sessionCoinsWon  = 0;
  var sessionSpins     = 0;

  /* ══════════════════════════════════════════════════════════
     4. HELPERS
  ══════════════════════════════════════════════════════════ */
  function $id(id) { return document.getElementById(id); }

  function findSymbol(id) {
    for (var i = 0; i < SYMBOLS.length; i++) if (SYMBOLS[i].id === id) return SYMBOLS[i];
    return null;
  }

  function randomStrip() {
    return REEL_STRIP[Math.floor(Math.random() * REEL_STRIP.length)];
  }

  function renderSymbol(id) {
    if (id === '7') return '<span class="s7-sym7">7</span>';
    var s = findSymbol(id);
    return s ? s.emoji : '?';
  }

  /* ══════════════════════════════════════════════════════════
     5. CURRENCY SYNC  (identical pattern to LuckyFruitGame.js)
  ══════════════════════════════════════════════════════════ */
  function subscribeUserCurrency() {
    unsubscribeUserCurrency();
    try {
      var stateObj = window.s7GameUserData || window.userData || window.currentUserData;
      var authUser = window.firebase && window.firebase.auth && window.firebase.auth().currentUser;
      var uid = (stateObj && stateObj.uid) ? stateObj.uid : (authUser ? authUser.uid : null);

      if (!uid || !window.usersCollection) {
        if (stateObj && typeof stateObj.currency === 'number') {
          coins = stateObj.currency;
          updateBalanceDisplay();
        }
        return;
      }

      currencyUnsub = window.usersCollection.doc(uid).onSnapshot(function (snap) {
        if (snap.exists) {
          var d = snap.data();
          if (typeof d.currency === 'number') {
            /* 🛡️ SECURITY: Only sync from Firestore when NOT spinning to avoid race conditions */
            if (!isSpinning) {
              coins = d.currency;
              updateBalanceDisplay();
            }
            /* Disable spin if not enough */
            var spinBtn = $id('s7-spinBtn');
            if (spinBtn) spinBtn.disabled = isSpinning || (coins < bet);
          }
        }
      });
    } catch (e) { console.error('[PRO SPY ERROR] subscribeUserCurrency failed:', e); }
  }

  function unsubscribeUserCurrency() {
    if (currencyUnsub) { try { currencyUnsub(); } catch (e) { console.error('[PRO SPY ERROR] unsubscribeUserCurrency failed:', e); } currencyUnsub = null; }
  }

  async function incrementUserCurrency(amount) {
    if (amount === 0) return;
    try {
      var stateObj = window.s7GameUserData || window.userData || window.currentUserData;
      var authUser = window.firebase && window.firebase.auth && window.firebase.auth().currentUser;
      var uid = (stateObj && stateObj.uid) ? stateObj.uid : (authUser ? authUser.uid : null);

      if (uid && window.SecurityService) {
        await window.SecurityService.applyCurrencyTransaction(uid, amount, 'Super 777: Win', { round: roundNum });
      } else {
        coins += amount;
        if (window.AppState && typeof window.AppState.setCoins === 'function') {
          window.AppState.setCoins(coins);
        }
        updateBalanceDisplay();
      }
    } catch (e) { console.error('[PRO SPY ERROR] incrementUserCurrency failed:', e); }
  }

  /* ══════════════════════════════════════════════════════════
     6. SESSION LOG
  ══════════════════════════════════════════════════════════ */
  async function logSession() {
    try {
      var authUser = window.firebase && window.firebase.auth && window.firebase.auth().currentUser;
      var uid = authUser ? authUser.uid : null;
      if (!uid || !window.db || !window.appId) return;
      await window.db.collection('artifacts').doc(window.appId)
        .collection('public').doc('data')
        .collection('lucky_games_sessions').add({
          uid:        uid,
          gameId:     'super_777',
          coinsSpent: sessionCoinsSpent,
          coinsWon:   sessionCoinsWon,
          spinCount:  sessionSpins,
          timestamp:  (window.firebase && window.firebase.firestore)
                        ? window.firebase.firestore.FieldValue.serverTimestamp()
                        : null
        });
    } catch (e) { console.error('[PRO SPY ERROR] logSession:', e); }
  }

  /* ══════════════════════════════════════════════════════════
     7. SOUND ENGINE
  ══════════════════════════════════════════════════════════ */
  function initAudio() {
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }

  function playSound(type) {
    if (!soundEnabled || !audioCtx) return;
    var t = audioCtx.currentTime;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'tick') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + Math.random() * 200, t);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.start(t); osc.stop(t + 0.05);
    } else if (type === 'clack') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(100, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.start(t); osc.stop(t + 0.1);
    } else if (type === 'win') {
      [440, 554, 659].forEach(function (freq) {
        var o = audioCtx.createOscillator(); var g = audioCtx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.1, t);
        g.gain.linearRampToValueAtTime(0.2, t + 0.1);
        g.gain.exponentialRampToValueAtTime(0.01, t + 1.5);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(t); o.stop(t + 1.5);
      });
    } else if (type === 'coin') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(2000, t + 0.1);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      osc.start(t); osc.stop(t + 0.3);
    }
  }

  function startSpinAudio() {
    if (!soundEnabled) return;
    initAudio();
    if (spinIntervalAudio) clearInterval(spinIntervalAudio);
    spinIntervalAudio = setInterval(function () { playSound('tick'); }, 80);
  }

  function stopSpinAudio() {
    if (spinIntervalAudio) { clearInterval(spinIntervalAudio); spinIntervalAudio = null; }
  }

  /* ══════════════════════════════════════════════════════════
     8. CSS INJECTION  (injected on start, removed on stop)
  ══════════════════════════════════════════════════════════ */
  var STYLE_ID = 's7-injected-style';

  function injectCSS() {
    if ($id(STYLE_ID)) return;
    var el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = [
      /* ── wrapper ── */
      '.s7-game{display:flex;flex-direction:column;background:linear-gradient(180deg,#0a0414 0%,#050208 100%);width:100%;font-family:"Cairo",sans-serif;color:#e0e0e0;user-select:none;-webkit-user-select:none;}',

      /* ── top nav ── */
      '.s7-top-nav{display:flex;align-items:center;gap:8px;padding:10px 14px 6px;border-bottom:1px solid rgba(212,175,55,0.12);}',
      '.s7-avatar{width:40px;height:40px;position:relative;cursor:pointer;flex-shrink:0;}',
      '.s7-avatar-photo{width:40px;height:40px;border-radius:50%;border:2px solid rgba(212,175,55,0.6);overflow:hidden;background:linear-gradient(135deg,#D4AF37,#FF8C00);position:relative;z-index:1;}',
      '.s7-avatar-frame{position:absolute;top:-6px;left:-6px;width:52px;height:52px;object-fit:contain;pointer-events:none;z-index:2;}',
      '.s7-username{flex:1;font-size:13px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.s7-balance-chip{display:flex;align-items:center;gap:5px;background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.25);border-radius:20px;padding:4px 10px;}',
      '.s7-balance-chip span:first-child{font-size:14px;}',
      '.s7-bal-val{font-size:13px;font-weight:900;color:#FFDF73;font-family:"Orbitron",monospace;direction:ltr;}',
      '.s7-nav-btn{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#aaa;font-size:15px;width:34px;height:34px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;}',
      '.s7-nav-btn:hover{border-color:rgba(212,175,55,0.5);color:#D4AF37;}',

      /* ── logo ── */
      '.s7-logo{text-align:center;padding:8px 0 4px;}',
      '.s7-logo-super{font-size:11px;font-weight:800;letter-spacing:8px;color:#D4AF37;text-transform:uppercase;display:block;}',
      '.s7-logo-777{font-family:"Orbitron",monospace;font-size:54px;font-weight:900;background:linear-gradient(110deg,#D4AF37 0%,#FFDF73 20%,#fff 30%,#FFDF73 40%,#D4AF37 60%,#D4AF37 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:s7-shine 3.5s linear infinite,s7-glow 2s ease-in-out infinite alternate;direction:ltr;display:inline-block;}',
      '@keyframes s7-shine{to{background-position:-200% center;}}',
      '@keyframes s7-glow{from{filter:drop-shadow(0 0 8px rgba(212,175,55,.3));}to{filter:drop-shadow(0 0 18px rgba(255,223,115,.7)) drop-shadow(0 0 28px rgba(217,22,54,.4));}}',
      '.s7-logo-line{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:2px;}',
      '.s7-logo-line .line{flex:1;max-width:50px;height:1px;background:linear-gradient(to right,transparent,#D4AF37,transparent);}',
      '.s7-logo-line .star{color:#D4AF37;font-size:10px;}',

      /* ── slot machine ── */
      '.s7-slot-wrap{margin:8px 14px;}',
      '.s7-slot-frame{background:linear-gradient(145deg,#1A1A24,#0D0D14);border:2px solid #D4AF37;border-radius:16px;padding:8px;box-shadow:0 0 35px rgba(212,175,55,0.28),0 0 70px rgba(212,175,55,0.10),0 16px 40px rgba(0,0,0,.8),inset 0 0 24px rgba(0,0,0,.9);}',
      '@keyframes s7-glow-border{0%,100%{box-shadow:0 0 20px rgba(212,175,55,0.2),0 16px 40px rgba(0,0,0,.8),inset 0 0 24px rgba(0,0,0,.9);}50%{box-shadow:0 0 45px rgba(212,175,55,0.45),0 0 80px rgba(255,223,115,0.15),0 16px 40px rgba(0,0,0,.8),inset 0 0 24px rgba(0,0,0,.9);}}' ,
      '.s7-reels-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;border-radius:10px;overflow:hidden;background:#000;border:1px solid rgba(212,175,55,.3);position:relative;}',
      '.s7-reel{background:linear-gradient(180deg,#050505 0%,#15151A 50%,#050505 100%);height:220px;overflow:hidden;position:relative;}',
      '.s7-reel::before,.s7-reel::after{content:"";position:absolute;left:0;right:0;height:45px;z-index:3;pointer-events:none;}',
      '.s7-reel::before{top:0;background:linear-gradient(180deg,rgba(0,0,0,.9),transparent);}',
      '.s7-reel::after{bottom:0;background:linear-gradient(0deg,rgba(0,0,0,.9),transparent);}',
      '.s7-reel-inner{display:flex;flex-direction:column;transition:filter .1s ease-in-out;}',
      '.s7-reel-inner.blur{filter:blur(2px);}',
      '.s7-cell{height:73px;display:flex;align-items:center;justify-content:center;font-size:40px;flex-shrink:0;position:relative;}',
      '.s7-cell::after{content:"";position:absolute;bottom:0;left:15%;right:15%;height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,.1),transparent);}',
      '.s7-sym7{font-family:"Orbitron",monospace;font-size:46px;font-weight:900;background:linear-gradient(180deg,#FF6B6B 0%,#D91636 40%,#8A001A 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 3px 6px rgba(0,0,0,.8)) drop-shadow(0 0 8px rgba(217,22,54,.4));line-height:1;}',
      '.s7-reel-sep{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(212,175,55,.4),transparent);pointer-events:none;z-index:2;}',
      '.s7-sep1{top:72px;} .s7-sep2{top:145px;}',

      /* win overlay */
      '.s7-win-overlay{position:absolute;inset:0;pointer-events:none;z-index:5;}',
      '.s7-win-line{position:absolute;left:0;right:0;height:73px;display:none;border-top:2px solid #D4AF37;border-bottom:2px solid #D4AF37;background:rgba(212,175,55,.12);animation:s7-wglow .8s ease-in-out infinite alternate;}',
      '.s7-wl-top{top:0px;} .s7-wl-mid{top:73px;} .s7-wl-bot{top:146px;}',
      '@keyframes s7-wglow{from{opacity:.7;box-shadow:0 0 12px rgba(212,175,55,.2);}to{opacity:1;box-shadow:0 0 32px rgba(212,175,55,.6);}}',

      /* ── stats row ── */
      '.s7-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:8px 14px;}',
      '.s7-stat{background:rgba(20,20,28,.7);border:1px solid rgba(212,175,55,.12);border-radius:10px;padding:8px 6px;text-align:center;}',
      '.s7-stat-lbl{color:#D4AF37;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px;}',
      '.s7-stat-val{color:#fff;font-size:15px;font-weight:900;font-family:"Orbitron",monospace;display:block;direction:ltr;}',

      /* ── buttons ── */
      '.s7-btns{display:grid;grid-template-columns:1fr 1fr 1fr 1.8fr;gap:8px;margin:0 14px 14px;}',
      '.s7-btn{border:none;border-radius:12px;cursor:pointer;font-family:"Cairo",sans-serif;font-size:11px;font-weight:900;padding:12px 4px;display:flex;flex-direction:column;align-items:center;gap:3px;box-shadow:0 4px 14px rgba(0,0,0,.5);text-transform:uppercase;transition:all .2s;}',
      '.s7-btn:active{transform:translateY(2px);box-shadow:0 1px 6px rgba(0,0,0,.5);}',
      '.s7-btn-bet{background:linear-gradient(180deg,#2A2A35,#111118);color:#E0E0E0;border:1px solid rgba(255,255,255,.1);}',
      '.s7-btn-bet:hover{background:linear-gradient(180deg,#3A3A45,#1A1A25);border-color:#997A15;}',
      '.s7-btn-bet .lbl{font-size:15px;font-weight:900;font-family:"Orbitron",monospace;}',
      '.s7-btn-auto{background:linear-gradient(180deg,#2A2A35,#111118);color:#E0E0E0;border:1px solid rgba(255,255,255,.1);justify-content:center;font-size:12px;}',
      '.s7-btn-auto.on{background:linear-gradient(180deg,#1B3B2B,#0A1A10);color:#00E676;border-color:#00E676;box-shadow:0 0 16px rgba(0,230,118,.2);}',
      '.s7-btn-spin{background:linear-gradient(180deg,#FFDF73 0%,#D4AF37 40%,#997A15 100%);color:#111;font-size:20px;border:1px solid #fff;box-shadow:0 6px 20px rgba(212,175,55,.4),inset 0 2px 4px rgba(255,255,255,.8);justify-content:center;}',
      '.s7-btn-spin:hover{filter:brightness(1.1);}',
      '.s7-btn-spin.spinning{filter:grayscale(.8) brightness(.7);cursor:not-allowed;}',

      /* ── win popup ── */
      '.s7-win-popup{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:500;pointer-events:none;opacity:0;transform:scale(.9);transition:all .4s cubic-bezier(.175,.885,.32,1.275);background:radial-gradient(circle at center,rgba(212,175,55,.15) 0%,transparent 70%);}',
      '.s7-win-popup.show{opacity:1;transform:scale(1);pointer-events:auto;}',
      '.s7-win-card{background:linear-gradient(180deg,#111,#000);border:2px solid #D4AF37;border-radius:24px;padding:28px 48px;text-align:center;box-shadow:0 16px 50px rgba(0,0,0,.9),0 0 40px rgba(212,175,55,.3);position:relative;overflow:hidden;}',
      '.s7-win-card::before{content:"";position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:conic-gradient(transparent,rgba(212,175,55,.25),transparent 30%);animation:s7-rotLight 4s linear infinite;z-index:0;}',
      '@keyframes s7-rotLight{100%{transform:rotate(360deg);}}',
      '.s7-win-content{position:relative;z-index:1;}',
      '.s7-win-title{font-size:18px;font-weight:900;color:#D4AF37;margin-bottom:8px;}',
      '.s7-win-amount{font-family:"Orbitron",monospace;font-size:48px;font-weight:900;background:linear-gradient(180deg,#fff 0%,#FFDF73 40%,#D4AF37 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;direction:ltr;line-height:1;}',

      /* ── coin particles ── */
      '.s7-coin-particle{position:fixed;pointer-events:none;z-index:600;font-size:24px;animation:s7-coinfall 1.5s ease-in forwards;}',
      '@keyframes s7-coinfall{0%{opacity:1;transform:translateY(-40px) rotate(0deg) scale(.5);}50%{transform:translateY(25vh) rotate(180deg) scale(1.2);}100%{opacity:0;transform:translateY(90vh) rotate(360deg) scale(1);}}',

      /* ── shimmer keyframe used by hub card ── */
      '@keyframes lg-shimmer{0%{left:-100%;}100%{left:200%;}}',

      /* ── overlay modals (paytable + history) ── */
      '.s7-ov{position:fixed;inset:0;z-index:20000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.82);backdrop-filter:blur(6px);}',
      '.s7-ov-box{background:linear-gradient(180deg,#13111c,#08060f);border:1.5px solid #D4AF37;border-radius:20px;width:92%;max-width:360px;max-height:80vh;overflow:hidden;display:flex;flex-direction:column;}',
      '.s7-ov-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px;border-bottom:1px solid rgba(212,175,55,0.2);flex-shrink:0;}',
      '.s7-ov-title{color:#D4AF37;font-size:15px;font-weight:900;font-family:"Cairo",sans-serif;}',
      '.s7-ov-close{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#aaa;font-size:14px;width:28px;height:28px;cursor:pointer;line-height:1;flex-shrink:0;}',

      /* paytable grid */
      '.s7-pt-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:12px;overflow-y:auto;}',
      '.s7-pt-cell{background:rgba(255,255,255,0.03);border:1px solid rgba(212,175,55,0.13);border-radius:11px;padding:9px 10px;display:flex;align-items:center;justify-content:space-between;gap:6px;}',
      '.s7-pt-syms{display:flex;align-items:center;gap:1px;font-size:20px;line-height:1;}',
      '.s7-pt-7{font-family:"Orbitron",monospace;font-size:22px;font-weight:900;color:#D91636;line-height:1;text-shadow:0 0 10px rgba(217,22,54,0.6);}',
      '.s7-pt-mult{color:#FFDF73;font-size:12px;font-weight:900;font-family:"Orbitron",monospace;direction:ltr;flex-shrink:0;}',
      '.s7-pt-anypos{font-size:8px;color:rgba(255,255,255,0.4);margin-top:2px;text-align:center;}',

      /* history list */
      '.s7-hist-scroll{overflow-y:auto;flex:1;}',
      '.s7-hist-item{display:flex;align-items:center;gap:8px;padding:9px 14px;border-bottom:1px solid rgba(255,255,255,0.05);}',
      '.s7-hist-item:last-child{border-bottom:none;}',
      '.s7-hist-ico{font-size:15px;flex-shrink:0;}',
      '.s7-hist-info{flex:1;font-size:11px;color:#aaa;}',
      '.s7-hist-rnd{font-size:10px;color:rgba(255,255,255,0.3);display:block;margin-bottom:2px;}',
      '.s7-hist-prize{font-family:"Orbitron",monospace;font-size:12px;font-weight:900;color:#4ade80;flex-shrink:0;}',
      '.s7-hist-prize.loss{color:#ef4444;}',
      '.s7-no-hist{text-align:center;padding:28px 16px;color:rgba(255,255,255,0.25);font-size:12px;}',

      /* in-game toast */
      '.s7-toast{position:fixed;top:80px;left:50%;transform:translateX(-50%) translateY(-20px);z-index:21000;background:linear-gradient(135deg,#3b1a1a,#1a0808);border:1px solid #ef4444;border-radius:12px;padding:10px 20px;color:#ff6b6b;font-size:13px;font-weight:700;font-family:"Cairo",sans-serif;pointer-events:none;opacity:0;transition:all .3s;white-space:nowrap;}',
      '.s7-toast.show{opacity:1;transform:translateX(-50%) translateY(0);}',
    ].join('');
    document.head.appendChild(el);
  }

  function removeCSS() {
    var el = $id(STYLE_ID);
    if (el) el.remove();
  }

  /* ══════════════════════════════════════════════════════════
     9. BUILD HTML
  ══════════════════════════════════════════════════════════ */
  function buildHTML() {
    return [
      '<div class="s7-game" id="s7-app">',

        /* ── top nav ── */
        '<div class="s7-top-nav">',
          '<div id="s7-avatar" class="s7-avatar"></div>',
          '<div class="s7-username" id="s7-username">—</div>',
          '<div class="s7-balance-chip">',
            '<span>🧠</span>',
            '<span class="s7-bal-val" id="s7-balanceDisplay">0</span>',
          '</div>',
          '<button class="s7-nav-btn" id="s7-historyBtn" title="' + T('history') + '">📜</button>',
          '<button class="s7-nav-btn" id="s7-infoBtn" title="' + T('paytable') + '">❕</button>',
          '<button class="s7-nav-btn" id="s7-muteBtn" title="Mute">🔊</button>',
        '</div>',

        /* ── logo ── */
        '<div class="s7-logo">',
          '<span class="s7-logo-super">SUPER</span>',
          '<span class="s7-logo-777">777</span>',
          '<div class="s7-logo-line">',
            '<div class="line"></div>',
            '<span class="star">✦</span>',
            '<span class="star" style="font-size:13px">✦</span>',
            '<span class="star">✦</span>',
            '<div class="line"></div>',
          '</div>',
        '</div>',

        /* ── slot machine ── */
        '<div class="s7-slot-wrap">',
          '<div class="s7-slot-frame">',
            '<div class="s7-reels-grid" id="s7-reelsGrid">',
              /* Reel 0 */
              '<div class="s7-reel" id="s7-reel0">',
                '<div class="s7-reel-sep s7-sep1"></div>',
                '<div class="s7-reel-sep s7-sep2"></div>',
                '<div class="s7-reel-inner" id="s7-reelInner0"></div>',
              '</div>',
              /* Reel 1 */
              '<div class="s7-reel" id="s7-reel1">',
                '<div class="s7-reel-sep s7-sep1"></div>',
                '<div class="s7-reel-sep s7-sep2"></div>',
                '<div class="s7-reel-inner" id="s7-reelInner1"></div>',
              '</div>',
              /* Reel 2 */
              '<div class="s7-reel" id="s7-reel2">',
                '<div class="s7-reel-sep s7-sep1"></div>',
                '<div class="s7-reel-sep s7-sep2"></div>',
                '<div class="s7-reel-inner" id="s7-reelInner2"></div>',
              '</div>',
              /* Win overlay */
              '<div class="s7-win-overlay">',
                '<div class="s7-win-line s7-wl-top" id="s7-wlTop"></div>',
                '<div class="s7-win-line s7-wl-mid" id="s7-wlMid"></div>',
                '<div class="s7-win-line s7-wl-bot" id="s7-wlBot"></div>',
              '</div>',
            '</div>',
          '</div>',
        '</div>',

        /* ── stats ── */
        '<div class="s7-stats">',
          '<div class="s7-stat"><span class="s7-stat-lbl">' + T('bet') + '</span><span class="s7-stat-val" id="s7-betDisplay">100</span></div>',
          '<div class="s7-stat"><span class="s7-stat-lbl">' + T('todayWin') + '</span><span class="s7-stat-val" id="s7-todayWinDisplay" style="color:#FFDF73">0</span></div>',
          '<div class="s7-stat"><span class="s7-stat-lbl">' + T('lastWin') + '</span><span class="s7-stat-val" id="s7-lastWinDisplay" style="color:#00E676">0</span></div>',
        '</div>',

        /* ── buttons ── */
        '<div class="s7-btns">',
          '<button class="s7-btn s7-btn-bet" id="s7-betMinusBtn">' + T('bet') + ' <span class="lbl">−</span></button>',
          '<button class="s7-btn s7-btn-bet" id="s7-betPlusBtn">'  + T('bet') + ' <span class="lbl">+</span></button>',
          '<button class="s7-btn s7-btn-auto" id="s7-autoBtn">' + T('auto') + '</button>',
          '<button class="s7-btn s7-btn-spin" id="s7-spinBtn">' + T('spin') + '</button>',
        '</div>',

        /* ── win popup (positioned inside game container) ── */
        '<div class="s7-win-popup" id="s7-winPopup">',
          '<div class="s7-win-card">',
            '<div class="s7-win-content">',
              '<div class="s7-win-title" id="s7-winTitle">' + T('winTitle') + '</div>',
              '<div class="s7-win-amount" id="s7-winAmount"></div>',
            '</div>',
          '</div>',
        '</div>',

        /* ── In-game toast ── */
        '<div class="s7-toast" id="s7-toast"></div>',

        /* ── Paytable Modal ── */
        '<div class="s7-ov" id="s7-paytable" style="display:none">',
          '<div class="s7-ov-box">',
            '<div class="s7-ov-hdr">',
              '<span class="s7-ov-title" id="s7-pt-title">' + T('paytable') + '</span>',
              '<button class="s7-ov-close" id="s7-paytable-close">✕</button>',
            '</div>',
            '<div class="s7-pt-grid">',
              '<div class="s7-pt-cell"><div class="s7-pt-syms"><span class="s7-pt-7">7</span><span class="s7-pt-7">7</span><span class="s7-pt-7">7</span></div><span class="s7-pt-mult">×200</span></div>',
              '<div class="s7-pt-cell"><div class="s7-pt-syms">🔔🔔🔔</div><span class="s7-pt-mult">×60</span></div>',
              '<div class="s7-pt-cell"><div class="s7-pt-syms">💎💎💎</div><span class="s7-pt-mult">×20</span></div>',
              '<div class="s7-pt-cell"><div class="s7-pt-syms">🍉🍉🍉</div><span class="s7-pt-mult">×10</span></div>',
              '<div class="s7-pt-cell"><div class="s7-pt-syms">🍇🍇🍇</div><span class="s7-pt-mult">×6</span></div>',
              '<div class="s7-pt-cell"><div class="s7-pt-syms">🥭🥭🥭</div><span class="s7-pt-mult">×3</span></div>',
              '<div class="s7-pt-cell"><div class="s7-pt-syms">🍒🍒🍒</div><span class="s7-pt-mult">×1</span></div>',
              '<div class="s7-pt-cell"><div><div class="s7-pt-syms">🍒🍒</div><div class="s7-pt-anypos" id="s7-pt-anypos">' + T('anyPos') + '</div></div><span class="s7-pt-mult">×0.6</span></div>',
            '</div>',
          '</div>',
        '</div>',

        /* ── Spin History Modal ── */
        '<div class="s7-ov" id="s7-history" style="display:none">',
          '<div class="s7-ov-box">',
            '<div class="s7-ov-hdr">',
              '<span class="s7-ov-title">📜 ' + T('history') + '</span>',
              '<button class="s7-ov-close" id="s7-history-close">✕</button>',
            '</div>',
            '<div class="s7-hist-scroll" id="s7-history-list"></div>',
          '</div>',
        '</div>',

      '</div>', /* end .s7-game */
    ].join('');
  }

  /* ══════════════════════════════════════════════════════════
     10. RENDER REELS
  ══════════════════════════════════════════════════════════ */
  function renderReels() {
    for (var col = 0; col < 3; col++) {
      var inner = $id('s7-reelInner' + col);
      if (!inner) continue;
      inner.innerHTML = '';
      for (var row = 0; row < 3; row++) {
        var cell = document.createElement('div');
        cell.className = 's7-cell';
        cell.id = 's7-cell_' + row + '_' + col;
        cell.innerHTML = renderSymbol(grid[row][col]);
        inner.appendChild(cell);
      }
    }
  }

  /* ══════════════════════════════════════════════════════════
     11. SPIN LOGIC
  ══════════════════════════════════════════════════════════ */
  async function spin() {
    initAudio();
    if (isSpinning) return;

    if (window._firestoreOnline === false) {
      showInGameToast(typeof lang !== 'undefined' && lang === 'ar' ? '⚠️ لا يوجد اتصال' : '⚠️ No connection');
      if (typeof isAuto !== 'undefined' && isAuto) stopAutoSpin();
      return;
    }

    if (coins < bet) {
      showInGameToast(T('notEnough'));
      if (isAuto) stopAutoSpin();
      return;
    }

    isSpinning = true;
    roundNum++;
    sessionSpins++;
    closeHistory(); closePaytable();

    /* Deduct locally first for instant feedback */
    coins -= bet;
    updateBalanceDisplay();
    sessionCoinsSpent += bet;

    /* 🛡️ SECURITY: Use centralized service for spin deduction */
    await (async function () {
      try {
        var sObj = window.s7GameUserData || window.userData || window.currentUserData;
        var aUser = window.firebase && window.firebase.auth && window.firebase.auth().currentUser;
        var uid_ = (sObj && sObj.uid) ? sObj.uid : (aUser ? aUser.uid : null);
        if (uid_ && window.SecurityService) {
          try {
            await window.SecurityService.applyCurrencyTransaction(uid_, -bet, 'Super 777: Spin Cost', { round: roundNum });
          } catch (e) {
            console.error('[PRO SPY ERROR] spin deduction (SecurityService):', e);
            /* Rollback on critical failure */
            coins += bet;
            updateBalanceDisplay();
          }
        }
      } catch (e) { console.error('[PRO SPY ERROR] spin logic wrapper:', e); }
    })();

    updateUI();

    var spinBtn = $id('s7-spinBtn');
    if (spinBtn) { spinBtn.classList.add('spinning'); spinBtn.disabled = true; }

    /* Reset last win display */
    var lastWinEl = $id('s7-lastWinDisplay');
    if (lastWinEl) lastWinEl.textContent = '0';

    startSpinAudio();
    var newGrid = generateGrid();

    /* Staggered reel stops */
    animateReel(0, newGrid, 600, function () {
      playSound('clack');
      animateReel(1, newGrid, 800, function () {
        playSound('clack');
        animateReel(2, newGrid, 1000, function () {
          playSound('clack');
          stopSpinAudio();

          grid = newGrid;
          var result = evaluateWins(grid, bet);

          showWinLines(result.winLines);

          if (result.prize > 0) {
            /* Add winnings locally first */
            coins += result.prize;
            updateBalanceDisplay();
            todayWin += result.prize;
            sessionCoinsWon += result.prize;
            /* Persist winnings to Firestore */
            incrementUserCurrency(result.prize);
            showWinPopup(result.prize);
            spawnCoins();
          }

          outcomes.unshift({ round: roundNum, bet: bet, prize: result.prize });
          if (outcomes.length > 50) outcomes.pop();

          if (lastWinEl) lastWinEl.textContent = result.prize.toLocaleString();
          updateUI();

          if (spinBtn) { spinBtn.classList.remove('spinning'); spinBtn.disabled = false; }
          isSpinning = false;

          if (isAuto) autoTimer = setTimeout(spin, 1600);
        });
      });
    });
  }

  function generateGrid() {
    var g = [];
    for (var r = 0; r < 3; r++) {
      var row = [];
      for (var c = 0; c < 3; c++) row.push(randomStrip());
      g.push(row);
    }
    return g;
  }

  function animateReel(col, finalGrid, duration, callback) {
    var inner = $id('s7-reelInner' + col);
    if (!inner) { if (typeof callback === 'function') callback(); return; }
    var totalFrames = Math.floor(duration / 40);
    var frame = 0;
    inner.classList.add('blur');
    var iv = setInterval(function () {
      var ch = inner.children;
      for (var r = 0; r < 3; r++) {
        if (ch[r]) ch[r].innerHTML = renderSymbol(randomStrip());
      }
      frame++;
      if (frame >= totalFrames) {
        clearInterval(iv);
        inner.classList.remove('blur');
        for (var r2 = 0; r2 < 3; r2++) {
          if (ch[r2]) ch[r2].innerHTML = renderSymbol(finalGrid[r2][col]);
        }
        if (typeof callback === 'function') callback();
      }
    }, 40);
  }

  /* ══════════════════════════════════════════════════════════
     12. WIN EVALUATION  (all 3 bugs from v1 fixed)
  ══════════════════════════════════════════════════════════ */
  function evaluateWins(g, betAmt) {
    var totalPrize = 0;
    var winLines   = [];

    /* --- 3-of-a-kind on each payline --- */
    for (var i = 0; i < PAYLINES.length; i++) {
      var line = PAYLINES[i];
      var s0 = g[line[0][0]][line[0][1]];
      var s1 = g[line[1][0]][line[1][1]];
      var s2 = g[line[2][0]][line[2][1]];
      if (s0 === s1 && s1 === s2) {
        var sym = findSymbol(s0);
        if (sym && sym.mult3 > 0) {
          totalPrize += betAmt * sym.mult3;
          winLines.push(i);
        }
      }
    }

    /* FIX: Cherry "any position" — 2 cherries anywhere in grid (not just per-payline)
       Only award if no 3-cherry payline already won */
    var cherryLineWon = false;
    for (var w = 0; w < winLines.length; w++) {
      var wl = PAYLINES[winLines[w]];
      if (g[wl[0][0]][wl[0][1]] === 'cherry') { cherryLineWon = true; break; }
    }
    if (!cherryLineWon) {
      var cherryCount = 0;
      for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) if (g[r][c] === 'cherry') cherryCount++;
      if (cherryCount === 2) totalPrize += betAmt * 0.6;
    }

    return { prize: Math.floor(totalPrize), winLines: winLines };
  }

  /* FIX: Diagonal paylines (3 & 4) now show all 3 rows lit */
  function showWinLines(winLines) {
    var top = $id('s7-wlTop'); var mid = $id('s7-wlMid'); var bot = $id('s7-wlBot');
    if (!top) return;
    top.style.display = 'none'; mid.style.display = 'none'; bot.style.display = 'none';

    for (var i = 0; i < winLines.length; i++) {
      var idx = winLines[i];
      if (idx === 0)              top.style.display = 'block';
      if (idx === 1)              mid.style.display = 'block';
      if (idx === 2)              bot.style.display = 'block';
      if (idx === 3 || idx === 4) {
        top.style.display = 'block';
        mid.style.display = 'block';
        bot.style.display = 'block';
      }
    }

    setTimeout(function () {
      if (top) top.style.display = 'none';
      if (mid) mid.style.display = 'none';
      if (bot) bot.style.display = 'none';
    }, 2200);
  }

  /* ══════════════════════════════════════════════════════════
     13. WIN POPUP & PARTICLES
  ══════════════════════════════════════════════════════════ */
  function showWinPopup(prize) {
    playSound('win');
    var popup = $id('s7-winPopup');
    var title = $id('s7-winTitle');
    var amount = $id('s7-winAmount');
    if (!popup) return;
    if (title) title.textContent = T('winTitle');
    if (amount) amount.textContent = '+' + prize.toLocaleString();
    popup.classList.add('show');
    setTimeout(function () { if (popup) popup.classList.remove('show'); }, 2500);
  }

  function spawnCoins() {
    var icons = ['🪙','💰','💎'];
    for (var i = 0; i < 12; i++) {
      (function (idx) {
        setTimeout(function () {
          playSound('coin');
          var el = document.createElement('div');
          el.className = 's7-coin-particle';
          el.textContent = icons[Math.floor(Math.random() * icons.length)];
          el.style.left = (10 + Math.random() * 80) + 'vw';
          el.style.top = '20vh';
          document.body.appendChild(el);
          setTimeout(function () { if (el.parentNode) el.remove(); }, 1600);
        }, idx * 100);
      })(i);
    }
  }

  /* ══════════════════════════════════════════════════════════
     14. AUTO SPIN
  ══════════════════════════════════════════════════════════ */
  function stopAutoSpin() {
    isAuto = false;
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
    var btn = $id('s7-autoBtn');
    if (btn) btn.classList.remove('on');
  }

  /* ══════════════════════════════════════════════════════════
     15. UI UPDATES
  ══════════════════════════════════════════════════════════ */
  function updateBalanceDisplay() {
    var el = $id('s7-balanceDisplay');
    if (el) el.textContent = coins.toLocaleString();
  }

  function updateUI() {
    updateBalanceDisplay();
    var betEl = $id('s7-betDisplay'); if (betEl) betEl.textContent = bet.toLocaleString();
    var twEl  = $id('s7-todayWinDisplay'); if (twEl) twEl.textContent = todayWin.toLocaleString();
  }

  /* ══════════════════════════════════════════════════════════
     16. AVATAR SYNC  (identical pattern to LuckyFruitGame.js)
  ══════════════════════════════════════════════════════════ */
  function syncAvatar() {
    try {
      var stateObj  = window.s7GameUserData || window.userData || window.currentUserData;
      var authUser  = window.firebase && window.firebase.auth && window.firebase.auth().currentUser;
      var uid       = (authUser && authUser.uid) ? authUser.uid : (stateObj ? stateObj.uid : null);
      var photoURL  = (stateObj && stateObj.photoURL) ? stateObj.photoURL : (authUser ? authUser.photoURL : null);
      var displayName = (stateObj && stateObj.displayName) ? stateObj.displayName
                        : (authUser ? authUser.displayName : null) || 'U';

      /* Update username label */
      var unEl = $id('s7-username');
      if (unEl) unEl.textContent = displayName;

      var avatarEl = $id('s7-avatar');
      if (!avatarEl) return;

      /* Build avatar photo HTML */
      var photoInner = photoURL
        ? '<img src="' + photoURL + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt=""/>'
        : '<span style="font-size:14px;font-weight:900;color:#fff;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">' + displayName.charAt(0).toUpperCase() + '</span>';

      /* Resolve frame src */
      var frameSrc = null;
      if (stateObj && stateObj.equipped && stateObj.equipped.frame && stateObj.equipped.frame !== 'none') {
        frameSrc = stateObj.equipped.frame;
        if (!frameSrc.startsWith('http') && !frameSrc.startsWith('/') && !frameSrc.startsWith('data:')) {
          var frameItem = (window.SHOP_ITEMS && window.SHOP_ITEMS.frames || []).find(function(f) { return f.id === frameSrc; });
          frameSrc = frameItem ? (frameItem.preview || frameItem.imageUrl) : null;
        }
      }

      /* Render into avatar container */
      avatarEl.innerHTML =
        '<div class="s7-avatar-photo">' + photoInner + '</div>' +
        (frameSrc ? '<img class="s7-avatar-frame" src="' + frameSrc + '" alt="" onerror="this.style.display=\'none\'"/>' : '');

      /* Click → MiniProfile */
      if (typeof window.openLuckyGamesMiniProfile === 'function') {
        avatarEl.onclick = function () { if (uid) window.openLuckyGamesMiniProfile(uid); };
      } else if (typeof window.openMiniProfile === 'function') {
        avatarEl.onclick = function () { if (uid) window.openMiniProfile(uid); };
      } else if (typeof window.setMiniProfileUID !== 'undefined') {
        avatarEl.onclick = function () {
          if (uid) {
            window.setMiniProfileUID(uid);
            if (window.setShowMiniProfile) window.setShowMiniProfile(true);
          }
        };
      }
    } catch (e) { console.warn('[Super777] Avatar error:', e); }
  }

  /* ══════════════════════════════════════════════════════════
     16b. PAYTABLE / HISTORY / TOAST
  ══════════════════════════════════════════════════════════ */
  function showInGameToast(msg) {
    var el = $id('s7-toast');
    if (!el) return;
    el.textContent = '⚠️ ' + msg;
    el.classList.add('show');
    setTimeout(function() { el.classList.remove('show'); }, 2800);
  }

  function showPaytable() {
    var el = $id('s7-paytable'); if (el) el.style.display = 'flex';
  }
  function closePaytable() {
    var el = $id('s7-paytable'); if (el) el.style.display = 'none';
  }

  function renderHistory() {
    var list = $id('s7-history-list');
    if (!list) return;
    if (!outcomes.length) {
      list.innerHTML = '<div class="s7-no-hist">' + T('noHistory') + '</div>';
      return;
    }
    list.innerHTML = outcomes.slice(0, 40).map(function(o) {
      var isWin = o.prize > 0;
      return '<div class="s7-hist-item">' +
        '<span class="s7-hist-ico">' + (isWin ? '💚' : '💔') + '</span>' +
        '<div class="s7-hist-info">' +
          '<span class="s7-hist-rnd">' + T('round') + o.round + '</span>' +
          T('betTxt') + o.bet.toLocaleString() +
        '</div>' +
        '<span class="s7-hist-prize' + (isWin ? '' : ' loss') + '">' +
          (isWin ? '+' + o.prize.toLocaleString() : '-' + o.bet.toLocaleString()) +
        '</span>' +
        '</div>';
    }).join('');
  }
  function showHistory() {
    renderHistory();
    var el = $id('s7-history'); if (el) el.style.display = 'flex';
  }
  function closeHistory() {
    var el = $id('s7-history'); if (el) el.style.display = 'none';
  }

  /* ══════════════════════════════════════════════════════════
     17. CONTROLS WIRING
  ══════════════════════════════════════════════════════════ */
  function wireControls() {
    var spinBtn = $id('s7-spinBtn');
    if (spinBtn) spinBtn.onclick = spin;

    var autoBtn = $id('s7-autoBtn');
    if (autoBtn) autoBtn.onclick = function () {
      initAudio();
      isAuto = !isAuto;
      autoBtn.classList.toggle('on', isAuto);
      if (isAuto && !isSpinning) spin();
      if (!isAuto && autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
    };

    var betMinusBtn = $id('s7-betMinusBtn');
    if (betMinusBtn) betMinusBtn.onclick = function () {
      initAudio(); playSound('coin');
      betIdx = Math.max(0, betIdx - 1);
      bet = BET_OPTIONS[betIdx];
      updateUI();
    };

    var betPlusBtn = $id('s7-betPlusBtn');
    if (betPlusBtn) betPlusBtn.onclick = function () {
      initAudio(); playSound('coin');
      betIdx = Math.min(BET_OPTIONS.length - 1, betIdx + 1);
      bet = BET_OPTIONS[betIdx];
      updateUI();
    };

    var muteBtn = $id('s7-muteBtn');
    if (muteBtn) muteBtn.onclick = function () {
      soundEnabled = !soundEnabled;
      muteBtn.textContent = soundEnabled ? '🔊' : '🔇';
      if (soundEnabled) { initAudio(); playSound('coin'); }
    };

    var infoBtn = $id('s7-infoBtn');
    if (infoBtn) infoBtn.onclick = function() { initAudio(); showPaytable(); };

    var histBtn = $id('s7-historyBtn');
    if (histBtn) histBtn.onclick = function() { initAudio(); showHistory(); };

    var ptClose = $id('s7-paytable-close');
    if (ptClose) ptClose.onclick = closePaytable;

    var histClose = $id('s7-history-close');
    if (histClose) histClose.onclick = closeHistory;

    /* Close overlays on backdrop click */
    var ptOv = $id('s7-paytable');
    if (ptOv) ptOv.onclick = function(e) { if (e.target === ptOv) closePaytable(); };
    var histOv = $id('s7-history');
    if (histOv) histOv.onclick = function(e) { if (e.target === histOv) closeHistory(); };

    /* Init audio on first interaction */
    if (rootEl) rootEl.addEventListener('click', initAudio, { once: true });
  }

  /* ══════════════════════════════════════════════════════════
     18. START / STOP  (public API — matches LuckyFruitGame.js)
  ══════════════════════════════════════════════════════════ */
  function start(containerIdOrEl, initialUserData) {
    if (initialUserData) window.s7GameUserData = initialUserData;

    rootEl = typeof containerIdOrEl === 'string'
      ? document.getElementById(containerIdOrEl)
      : containerIdOrEl;
    if (!rootEl) { console.error('[Super777] Container not found:', containerIdOrEl); return; }

    /* Reset session */
    sessionCoinsSpent = 0; sessionCoinsWon = 0; sessionSpins = 0;
    todayWin = 0; isAuto = false; isSpinning = false;
    betIdx = 3; bet = BET_OPTIONS[betIdx];

    /* Detect language from user account setting (highest priority) */
    lang = 'en';
    var stateForLang = window.s7GameUserData || window.userData || window.currentUserData;
    if (stateForLang && stateForLang.lang) {
      lang = stateForLang.lang;
    } else if (window.AppState && window.AppState.language) {
      lang = window.AppState.language;
    } else if (document.documentElement.lang) {
      lang = document.documentElement.lang.split('-')[0];
    }

    injectCSS();
    
    rootEl.innerHTML = '';
    var template = document.createElement('template');
    template.innerHTML = buildHTML();
    rootEl.appendChild(template.content);
    
    renderReels();
    subscribeUserCurrency();
    syncAvatar();
    wireControls();
    updateUI();
  }

  function stop() {
    if (isAuto) stopAutoSpin();
    stopSpinAudio();
    unsubscribeUserCurrency();
    logSession();
    /* Unmount React avatar if rendered */
    try {
      var av = $id('s7-avatar');
      if (av && window.ReactDOM) window.ReactDOM.unmountComponentAtNode(av);
    } catch (e) {}
    if (rootEl) { rootEl.innerHTML = ''; rootEl = null; }
  }

  function setLanguage(newLang) {
    lang = newLang;
    if (rootEl) { var el = rootEl; stop(); start(el); }
  }

  /* ══════════════════════════════════════════════════════════
     19. PUBLIC API
  ══════════════════════════════════════════════════════════ */
  window.Super777Game = {
    start:       start,
    stop:        stop,
    setLanguage: setLanguage,
    getCoins:    function () { return coins; },
    setCoins:    function (n) { coins = n; updateBalanceDisplay(); }
  };

})();
