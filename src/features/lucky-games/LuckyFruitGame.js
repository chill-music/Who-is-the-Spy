/* ============================================================
   LuckyFruitGame.js  –  Lucky Fruit Slots  v2.1  (Site-Integrated)
   - Coins: reads/writes window.useAuthState() + Firestore usersCollection
   - Avatar: loads real photo from useAuthState; click → openMiniProfile
   - lf-coinPlus REMOVED (real balance only)
   - Session logged to lucky_games_sessions on stop()
   ============================================================ */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════
     1. TRANSLATIONS
  ══════════════════════════════════════════════════════════ */
  window.LuckyFruitTranslations = window.LuckyFruitTranslations || {
    en: {
      SLOTS:'SLOTS', JACKPOT:'JACKPOT', WIN:'WIN', SPIN:'SPIN',
      TOTAL_COSTS:'TOTAL COSTS', COSTS:'COSTS', LINES:'LINES',
      QUICK:'QUICK', AUTO:'AUTO', UP_TO_10:'UP TO 10',
      FREE_SPINS:'FREE SPINS', SPINS_LEFT:'spins remaining!',
      COLLECT:'COLLECT!', BIG_WIN:'BIG WIN!', MEGA_WIN:'MEGA WIN!',
      JACKPOT_WIN:'JACKPOT!!', JACKPOT_MSG:'You hit the ultimate jackpot!',
      BONUS_TITLE:'BONUS GAME!', BONUS_PICK:'Pick a treasure chest to win!',
      BONUS_WIN:'BONUS WIN!', BONUS_REWARD:'Bonus game reward!',
      YOU_WON:'You won', COINS:'coins!', GOT_IT:'GOT IT! \u2713',
      RULES:'RULES', REG_SYMBOLS:'REGULAR SYMBOLS', SPEC_SYMBOLS:'SPECIAL SYMBOLS',
      HOW_TO_WIN:'HOW TO WIN',
      WILD_DESC:'Substitutes for all regular symbols in any winning combination.',
      SCATTER_DESC:'3 scatters = 10 free spins | 4 = 15 | 5 = 20. Appears in any position.',
      BONUS_DESC:'3 or more Bonus symbols anywhere trigger the Bonus Game.',
      JACKPOT_DESC:'5 Jackpot symbols = JACKPOT! Higher bet = higher chance.',
      HOW_DESC:'Matching symbols must appear left-to-right on an active payline. WILD substitutes for regular symbols. Up to 50 paylines active.',
      NOT_ENOUGH:'Not enough coins!'
    },
    ar: {
      SLOTS:'سلوتس', JACKPOT:'جاكبوت', WIN:'ربحت', SPIN:'دوران',
      TOTAL_COSTS:'إجمالي التكلفة', COSTS:'تكلفة', LINES:'خطوط',
      QUICK:'سريع', AUTO:'تلقائي', UP_TO_10:'حتى 10',
      FREE_SPINS:'لفات مجانية', SPINS_LEFT:'لفة متبقية!',
      COLLECT:'استلم!', BIG_WIN:'فوز كبير!', MEGA_WIN:'فوز ضخم!',
      JACKPOT_WIN:'جاكبوت!!', JACKPOT_MSG:'ضربت الجاكبوت الأسطوري!',
      BONUS_TITLE:'لعبة البونص!', BONUS_PICK:'اختار صندوق كنز لتفوز!',
      BONUS_WIN:'فوز البونص!', BONUS_REWARD:'مكافأة لعبة البونص!',
      YOU_WON:'ربحت', COINS:'كوينز!', GOT_IT:'فهمت! \u2713',
      RULES:'القواعد', REG_SYMBOLS:'الرموز العادية', SPEC_SYMBOLS:'الرموز الخاصة',
      HOW_TO_WIN:'كيف تفوز',
      WILD_DESC:'يحل محل كل الرموز العادية في أي تركيبة فائزة.',
      SCATTER_DESC:'3 سكاتر = 10 لفات مجانية | 4 = 15 | 5 = 20.',
      BONUS_DESC:'3 رموز بونص أو أكثر في أي مكان تفعّل لعبة البونص.',
      JACKPOT_DESC:'5 رموز جاكبوت = جاكبوت! الرهان الأعلى = فرصة أكبر.',
      HOW_DESC:'يجب أن تظهر الرموز المتطابقة من اليسار إلى اليمين على خط فائز نشط.',
      NOT_ENOUGH:'رصيد غير كافٍ!'
    }
  };

  function T(key) {
    var lang = 'en';
    if (window.AppState && window.AppState.language) lang = window.AppState.language;
    else if (document.documentElement.lang) lang = document.documentElement.lang.split('-')[0];
    var map = window.LuckyFruitTranslations[lang] || window.LuckyFruitTranslations['en'];
    return map[key] !== undefined ? map[key] : (window.LuckyFruitTranslations['en'][key] || key);
  }

  /* ══════════════════════════════════════════════════════════
     2. HTML TEMPLATE  (lf-coinPlus REMOVED)
  ══════════════════════════════════════════════════════════ */
  function buildHTML() {
    return [
      '<div class="lf-game" id="lf-app">',

      /* TOP NAV */
      '<div class="lf-top-nav">',
        '<button class="lf-nav-btn" id="lf-muteBtn">&#128266;</button>',
        '<button class="lf-nav-btn" id="lf-rulesBtn">&#9776;</button>',
        '<div class="lf-coin-display">',
          '<span class="lf-coin-star">🧠</span>',
          '<span id="lf-coins">1000</span>',
        '</div>',
        /* Avatar — photo loaded dynamically */
        '<div class="lf-avatar-box" id="lf-avatar" style="cursor:pointer;position:relative;"></div>',
      '</div>',

      /* FREE SPINS BANNER */
      '<div class="lf-fs-banner" id="lf-fsBanner">',
        '&#127808; ' + T('FREE_SPINS') + '! <span id="lf-fsCount">0</span> ' + T('SPINS_LEFT'),
      '</div>',

      /* TITLE */
      '<div class="lf-title-area">',
        '<div class="lf-slots-bg"><span class="lf-slots-title">' + T('SLOTS') + '</span></div>',
        '<div class="lf-jackpot-bar">',
          '<span class="lf-jackpot-label">' + T('JACKPOT') + '</span>',
          '<span class="lf-jackpot-val" id="lf-jackpotVal">1033921</span>',
        '</div>',
      '</div>',

      /* PROGRESS */
      '<div class="lf-progress-row">',
        '<div class="lf-progress-avatar">&#129488;</div>',
        '<div class="lf-progress-bar-wrap"><div class="lf-progress-fill" id="lf-progressFill"></div></div>',
        '<span class="lf-progress-text" id="lf-progressText">0/1000</span>',
        '<span class="lf-chest-icon">&#127922;</span>',
        '<span class="lf-upto-text">' + T('UP_TO_10') + '</span>',
      '</div>',

      /* MACHINE */
      '<div class="lf-machine">',
        '<div class="lf-reel-container">',
          '<div class="lf-reels-grid" id="lf-reelsGrid"></div>',
          '<canvas class="lf-win-overlay" id="lf-winCanvas"></canvas>',
        '</div>',
        '<div class="lf-win-display"><div class="lf-win-text" id="lf-winText">' + T('WIN') + ' 0</div></div>',
      '</div>',

      /* COINS AREA */
      '<div class="lf-coins-area" id="lf-coinsArea"></div>',

      /* CONTROLS */
      '<div class="lf-controls">',
        '<div class="lf-control-row">',
          '<div class="lf-adj-group">',
            '<button class="lf-adj-btn" id="lf-costMinus">\u2212</button>',
            '<div class="lf-adj-mid">',
              '<span class="lf-adj-val" id="lf-costVal">2</span>',
              '<span class="lf-adj-lbl">' + T('COSTS') + '</span>',
            '</div>',
            '<button class="lf-adj-btn" id="lf-costPlus">+</button>',
          '</div>',
        '</div>',
        '<div class="lf-spin-area">',
          '<div class="lf-adj-group" style="max-width:170px">',
            '<button class="lf-adj-btn" id="lf-linesMinus">\u2212</button>',
            '<div class="lf-adj-mid">',
              '<span class="lf-adj-val" id="lf-linesVal">50</span>',
              '<span class="lf-adj-lbl">' + T('LINES') + '</span>',
            '</div>',
            '<button class="lf-adj-btn" id="lf-linesPlus">+</button>',
          '</div>',
          '<div style="flex:1">',
            '<button class="lf-spin-btn" id="lf-spinBtn">',
              T('SPIN') + '<span class="lf-spin-sub" id="lf-totalCosts">' + T('TOTAL_COSTS') + ' 100</span>',
            '</button>',
            '<div class="lf-opts">',
              '<div class="lf-opt-btn" id="lf-quickBtn"><div class="lf-opt-check" id="lf-quickCheck"></div>' + T('QUICK') + '</div>',
              '<div class="lf-opt-btn" id="lf-autoBtn"><div class="lf-opt-check" id="lf-autoCheck"></div>' + T('AUTO') + '</div>',
            '</div>',
          '</div>',
        '</div>',
      '</div>',
      '</div>', /* end .lf-game */

      /* WIN OVERLAY */
      '<div class="lf-overlay" id="lf-winOverlay">',
        '<div class="lf-overlay-box">',
          '<div class="lf-overlay-title" id="lf-overlayTitle">' + T('BIG_WIN') + '</div>',
          '<div class="lf-overlay-amount" id="lf-overlayAmount">0</div>',
          '<div class="lf-overlay-msg" id="lf-overlayMsg"></div>',
          '<button class="lf-overlay-close" id="lf-overlayClose">' + T('COLLECT') + '</button>',
        '</div>',
      '</div>',

      /* BONUS OVERLAY */
      '<div class="lf-bonus-overlay" id="lf-bonusOverlay">',
        '<div class="lf-bonus-box">',
          '<h2>&#127873; ' + T('BONUS_TITLE') + '</h2>',
          '<div class="lf-bonus-msg">' + T('BONUS_PICK') + '</div>',
          '<div class="lf-chests-grid" id="lf-chestsGrid"></div>',
          '<div class="lf-bonus-msg" id="lf-bonusResult"></div>',
        '</div>',
      '</div>',

      /* RULES OVERLAY */
      '<div class="lf-rules-overlay" id="lf-rulesOverlay">',
        '<div class="lf-rules-box">',
          '<div class="lf-rules-title">' + T('RULES') + '</div>',
          '<div class="lf-rules-section">| ' + T('REG_SYMBOLS') + '</div>',
          '<div class="lf-sym-grid">',
            '<div class="lf-sym-row"><div class="lf-sym-icon">&#127826;</div><div class="lf-sym-pays">3 <span>\u00d75</span><br>4 <span>\u00d720</span><br>5 <span>\u00d775</span></div></div>',
            '<div class="lf-sym-row"><div class="lf-sym-icon">&#127815;</div><div class="lf-sym-pays">3 <span>\u00d77</span><br>4 <span>\u00d725</span><br>5 <span>\u00d7100</span></div></div>',
            '<div class="lf-sym-row"><div class="lf-sym-icon">&#127819;</div><div class="lf-sym-pays">3 <span>\u00d710</span><br>4 <span>\u00d730</span><br>5 <span>\u00d7125</span></div></div>',
            '<div class="lf-sym-row"><div class="lf-sym-icon">&#129373;</div><div class="lf-sym-pays">3 <span>\u00d715</span><br>4 <span>\u00d740</span><br>5 <span>\u00d7150</span></div></div>',
            '<div class="lf-sym-row"><div class="lf-sym-icon">&#128142;</div><div class="lf-sym-pays">3 <span>\u00d720</span><br>4 <span>\u00d750</span><br>5 <span>\u00d7200</span></div></div>',
            '<div class="lf-sym-row"><div class="lf-sym-icon">&#127818;</div><div class="lf-sym-pays">2 <span>\u00d73</span><br>3 <span>\u00d725</span><br>4 <span>\u00d760</span><br>5 <span>\u00d7250</span></div></div>',
            '<div class="lf-sym-row"><div class="lf-sym-icon">&#128286;</div><div class="lf-sym-pays">2 <span>\u00d74</span><br>3 <span>\u00d730</span><br>4 <span>\u00d780</span><br>5 <span>\u00d7300</span></div></div>',
            '<div class="lf-sym-row"><div class="lf-sym-icon">&#128081;</div><div class="lf-sym-pays">2 <span>\u00d75</span><br>3 <span>\u00d740</span><br>4 <span>\u00d7100</span><br>5 <span>\u00d7400</span></div></div>',
          '</div>',
          '<div class="lf-rules-section">| ' + T('SPEC_SYMBOLS') + '</div>',
          '<div class="lf-special-row"><div class="lf-special-icon">&#127183;</div><div class="lf-special-info"><h4>WILD</h4><p>' + T('WILD_DESC') + '</p></div></div>',
          '<div class="lf-special-row"><div class="lf-special-icon">&#127808;</div><div class="lf-special-info"><h4>SCATTER</h4><p>' + T('SCATTER_DESC') + '</p></div></div>',
          '<div class="lf-special-row"><div class="lf-special-icon">&#128230;</div><div class="lf-special-info"><h4>BONUS</h4><p>' + T('BONUS_DESC') + '</p></div></div>',
          '<div class="lf-special-row"><div class="lf-special-icon">&#127942;</div><div class="lf-special-info"><h4>JACKPOT</h4><p>' + T('JACKPOT_DESC') + '</p></div></div>',
          '<div class="lf-rules-section">| ' + T('HOW_TO_WIN') + '</div>',
          '<p class="lf-rules-body-text">' + T('HOW_DESC') + '</p>',
          '<button class="lf-rules-close" id="lf-rulesClose">' + T('GOT_IT') + '</button>',
        '</div>',
      '</div>'
    ].join('');
  }

  /* ══════════════════════════════════════════════════════════
     3. SYMBOLS CONFIG
  ══════════════════════════════════════════════════════════ */
  var SYMBOLS = [
    { id:'cherry',  emoji:'\uD83C\uDF52', cls:'', weight:14, minMatch:3, pays:{3:5,  4:20, 5:75}  },
    { id:'plum',    emoji:'\uD83C\uDF47', cls:'', weight:13, minMatch:3, pays:{3:7,  4:25, 5:100} },
    { id:'lemon',   emoji:'\uD83C\uDF4B', cls:'', weight:12, minMatch:3, pays:{3:10, 4:30, 5:125} },
    { id:'kiwi',    emoji:'\uD83E\uDD5D', cls:'', weight:11, minMatch:3, pays:{3:15, 4:40, 5:150} },
    { id:'diamond', emoji:'\uD83D\uDC8E', cls:'', weight:10, minMatch:3, pays:{3:20, 4:50, 5:200} },
    { id:'orange',  emoji:'\uD83C\uDF4A', cls:'', weight:9,  minMatch:2, pays:{2:3,  3:25, 4:60,  5:250} },
    { id:'bell',    emoji:'\uD83D\uDD14', cls:'', weight:8,  minMatch:2, pays:{2:4,  3:30, 4:80,  5:300} },
    { id:'crown',   emoji:'\uD83D\uDC51', cls:'', weight:7,  minMatch:2, pays:{2:5,  3:40, 4:100, 5:400} },
    { id:'wild',    emoji:'\uD83C\uDCCF', cls:'', weight:4,  special:'wild',    label:'WILD'    },
    { id:'scatter', emoji:'\uD83C\uDF40', cls:'', weight:3,  special:'scatter', label:'SCATTER' },
    { id:'bonus',   emoji:'\uD83D\uDCE6', cls:'', weight:3,  special:'bonus',   label:'BONUS'   },
    { id:'jackpot', emoji:'\uD83C\uDFC6', cls:'', weight:2,  special:'jackpot', label:'JACKPOT' }
  ];

  var REEL_POOL = [];
  for (var _si = 0; _si < SYMBOLS.length; _si++) {
    for (var _wi = 0; _wi < SYMBOLS[_si].weight; _wi++) REEL_POOL.push(SYMBOLS[_si].id);
  }

  /* ══════════════════════════════════════════════════════════
     4. PAYLINES (50 lines)
  ══════════════════════════════════════════════════════════ */
  var PAYLINES = [
    [1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],
    [0,1,2,1,0],[2,1,0,1,2],
    [0,0,1,2,2],[2,2,1,0,0],
    [1,0,0,0,1],[1,2,2,2,1],
    [0,1,0,1,0],[2,1,2,1,2],
    [1,0,1,0,1],[1,2,1,2,1],
    [0,0,0,1,2],[2,2,2,1,0],
    [0,1,1,1,0],[2,1,1,1,2],
    [1,1,0,1,1],[1,1,2,1,1],
    [0,0,1,0,0],[2,2,1,2,2],
    [1,0,1,2,1],[1,2,1,0,1],
    [0,1,2,2,2],[2,1,0,0,0],
    [0,2,0,2,0],[2,0,2,0,2],
    [0,1,0,1,2],[2,1,2,1,0],
    [1,0,2,0,1],[1,2,0,2,1],
    [0,0,2,0,0],[2,2,0,2,2],
    [0,2,1,0,2],[2,0,1,2,0],
    [1,1,0,0,1],[1,1,2,2,1],
    [0,0,1,1,2],[2,2,1,1,0],
    [1,0,0,1,2],[1,2,2,1,0],
    [0,2,2,0,1],[2,0,0,2,1],
    [1,1,1,0,0],[1,1,1,2,2],
    [0,1,2,1,1],[2,1,0,1,1],
    [0,0,0,2,1],[2,2,2,0,1],
    [1,0,2,1,0]
  ];

  /* ══════════════════════════════════════════════════════════
     5. STATE
  ══════════════════════════════════════════════════════════ */
  var coins        = 0;
  var cost         = 2;
  var lines        = 50;
  var jackpot      = 1033921;
  var spinning     = false;
  var quickMode    = false;
  var autoMode     = false;
  var autoTimer    = null;
  var freeSpins    = 0;
  var progressVal  = 0;
  var grid         = [[],[],[],[],[]];
  var soundOn      = true;
  var rootEl       = null;
  var jackpotTicker = null;
  var jackpotUnsub  = null;   /* Firestore listener */
  var sessionCoinsSpent = 0;
  var sessionCoinsWon   = 0;
  var sessionSpins      = 0;
  var JACKPOT_DOC = 'lucky_fruit_jackpot'; /* shared Firestore doc key */
  var FREE_SPIN_KEY = 'lf_free_spin_date'; /* localStorage key for daily free spin */

  /* ══════════════════════════════════════════════════════════
     6. COIN SYNC — reads/writes real user balance
  ══════════════════════════════════════════════════════════ */
  var currencyUnsub = null;

  function subscribeUserCurrency() {
    unsubscribeUserCurrency();
    try {
      var stateObj = window.lfGameUserData || window.userData || window.currentUserData;
      var authUser = null;
      if (window.useAuthState && typeof window.useAuthState === 'function') {
        var authSt = window.useAuthState();
        authUser = authSt ? authSt.user || authSt : null;
      }
      var uid = stateObj?.uid || authUser?.uid;
      
      if (!uid || !window.usersCollection) {
        if (stateObj && typeof stateObj.currency === 'number') {
          coins = stateObj.currency; updateCoinsDisplay(); 
        }
        return;
      }
      
      currencyUnsub = window.usersCollection.doc(uid).onSnapshot(function(snap) {
        if (snap.exists) {
          var d = snap.data();
          if (typeof d.currency === 'number') {
            coins = d.currency;
            updateCoinsDisplay();
            /* Re-check buttons if coins changed */
            if (document.getElementById('lf-spinBtn')) {
              var totalCost = cost * lines;
              if (freeSpins > 0) totalCost = 0;
              document.getElementById('lf-spinBtn').disabled = spinning || (coins < totalCost);
            }
          }
        }
      });
    } catch(e){}
  }

  function unsubscribeUserCurrency() {
    if (currencyUnsub) { try { currencyUnsub(); }catch(e){} currencyUnsub=null; }
  }

  function incrementUserCurrency(amount) {
    if (amount === 0) return;
    try {
      var stateObj = window.lfGameUserData || window.userData || window.currentUserData;
      var authUser = null;
      if (window.useAuthState && typeof window.useAuthState === 'function') {
        var authSt = window.useAuthState();
        authUser = authSt ? authSt.user || authSt : null;
      }
      var uid = stateObj?.uid || authUser?.uid;
      
      if (uid && window.usersCollection && window.firebase && window.firebase.firestore) {
        window.usersCollection.doc(uid).update({ 
          currency: window.firebase.firestore.FieldValue.increment(amount) 
        }).catch(function() {});
      } else {
        /* Fallback if db unavailable */
        coins += amount;
        if (window.AppState && typeof window.AppState.setCoins === 'function') {
           window.AppState.setCoins(coins);
        }
        updateCoinsDisplay();
      }
    } catch (e) {}
  }

  /* ══ JACKPOT FIRESTORE SYNC ══════════════════════════════════ */
  function getJpRef() {
    try {
      if (window.db && window.appId) {
        return window.db.collection('artifacts').doc(window.appId)
          .collection('public').doc('data').collection('lucky_fruit_jackpot').doc('jackpot');
      }
    } catch(e){}
    return null;
  }

  function subscribeJackpot() {
    var ref = getJpRef();
    if (!ref) return;
    jackpotUnsub = ref.onSnapshot(function(snap) {
      if (snap.exists) {
        var d = snap.data();
        if (typeof d.value === 'number') { jackpot = d.value; updateJackpot(); }
      } else {
        /* initialise doc with a starting value */
        ref.set({ value: 1033921 }).catch(function(){});
      }
    }, function() {});
  }

  function unsubscribeJackpot() {
    if (jackpotUnsub) { try { jackpotUnsub(); } catch(e){} jackpotUnsub = null; }
  }

  /* increment jackpot in Firestore (called per spin + wins) */
  function incrementJackpotFirestore(amount) {
    var ref = getJpRef();
    if (!ref) { jackpot += amount; updateJackpot(); return; }
    var FieldValue = null;
    try {
      if (window.firebase && window.firebase.firestore) FieldValue = window.firebase.firestore.FieldValue;
    } catch(e){}
    if (FieldValue) {
      ref.update({ value: FieldValue.increment(amount) }).catch(function(){
        jackpot += amount; updateJackpot();
      });
    } else {
      ref.get().then(function(snap){
        var cur = snap.exists ? (snap.data().value || 1033921) : 1033921;
        ref.set({ value: cur + amount }).catch(function(){});
      }).catch(function(){});
    }
  }

  /* reset jackpot to base on jackpot win */
  function resetJackpotFirestore() {
    jackpot = 1000000;
    var ref = getJpRef();
    if (ref) ref.set({ value: 1000000 }).catch(function(){});
    updateJackpot();
  }

  /* ══ DAILY FREE SPIN — stored in Firestore ═══════════════════ */
  function checkGrantDailyFreeSpin() {
    var today = new Date().toDateString();
    try {
      var uid = null;
      if (window.useAuthState && typeof window.useAuthState === 'function') {
        var st = window.useAuthState();
        uid = st && st.uid ? st.uid : null;
      }
      if (uid && window.usersCollection) {
        /* Read lastFreeSpin from Firestore */
        window.usersCollection.doc(uid).get().then(function(snap) {
          var last = snap.exists ? (snap.data().luckyGames || {}).lastFreeSpin : null;
          if (last !== today) {
            /* Grant 1 free spin and save today's date */
            window.usersCollection.doc(uid).set({
              luckyGames: { lastFreeSpin: today }
            }, { merge: true }).catch(function() {});
            freeSpins = Math.max(freeSpins, 1);
            updateFSBanner();
          }
        }).catch(function() {
          /* Firestore read failed — silent fail, no free spin */
        });
        return;
      }
    } catch(e) {}
    /* Not logged in: no free spin (tied to account only) */
  }

  /* ══════════════════════════════════════════════════════════
     7. SESSION LOG — writes to lucky_games_sessions on stop
  ══════════════════════════════════════════════════════════ */
  function logSession() {
    try {
      var uid = null;
      if (window.useAuthState && typeof window.useAuthState === 'function') {
        var st = window.useAuthState();
        uid = st && st.uid ? st.uid : null;
      }
      if (!uid || !window.db || !window.appId) return;
      window.db.collection('artifacts').doc(window.appId)
        .collection('public').doc('data')
        .collection('lucky_games_sessions').add({
          uid:          uid,
          gameId:       'lucky_fruit',
          coinsSpent:   sessionCoinsSpent,
          coinsWon:     sessionCoinsWon,
          spinCount:    sessionSpins,
          jackpotHit:   false,
          timestamp:    window.firebase && window.firebase.firestore ? window.firebase.firestore.FieldValue.serverTimestamp() : null
        }).catch(function() {});
    } catch (e) {}
  }

  /* ══════════════════════════════════════════════════════════
     8. SOUND ENGINE
  ══════════════════════════════════════════════════════════ */
  var audioCtx = null;
  var reelTickInterval = null;

  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playTone(freq, type, dur, vol, startTime, dest) {
    if (!soundOn) return;
    vol = vol || 0.3; startTime = startTime || 0;
    try {
      var ctx = getAudioCtx();
      var osc = ctx.createOscillator(); var gain = ctx.createGain();
      osc.type = type; osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + dur);
      osc.connect(gain); gain.connect(dest || ctx.destination);
      osc.start(ctx.currentTime + startTime); osc.stop(ctx.currentTime + startTime + dur + 0.05);
    } catch (e) {}
  }

  function playNoise(dur, vol, freq, q) {
    if (!soundOn) return;
    vol = vol || 0.05; freq = freq || 800; q = q || 1;
    try {
      var ctx = getAudioCtx();
      var bufSize = Math.floor(ctx.sampleRate * dur);
      var buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
      var src = ctx.createBufferSource(); src.buffer = buf;
      var filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = freq; filt.Q.value = q;
      var gain = ctx.createGain();
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
      src.start(); src.stop(ctx.currentTime + dur + 0.05);
    } catch (e) {}
  }

  function soundSpinStart() {
    if (!soundOn) return;
    try {
      var ctx = getAudioCtx(); var osc = ctx.createOscillator(); var gain = ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.45);
    } catch (e) {}
    playNoise(0.2, 0.04, 400, 2);
  }

  function soundReelTick() { playNoise(0.04, 0.03, 1200 + Math.random() * 400, 8); }
  function soundReelStop(col) { playTone(120 - col * 8, 'sine', 0.12, 0.25); playNoise(0.08, 0.08, 300, 3); }
  function soundCoinWin() { var n=[523,659,784,1047]; for(var i=0;i<n.length;i++) playTone(n[i],'sine',0.18,0.22,i*0.07); }
  function soundBigWin() {
    var m=[523,659,784,1047,784,1047,1319];
    for(var i=0;i<m.length;i++){playTone(m[i],'sine',0.25,0.3,i*0.1);playTone(m[i]/2,'triangle',0.2,0.12,i*0.1);}
    for(var j=0;j<8;j++) playNoise(0.06,0.07,200,2);
  }
  function soundJackpot() {
    var b=[261,329,392,523,659,784,1047,1319];
    for(var i=0;i<b.length;i++){playTone(b[i],'sine',1.5,0.2,i*0.06);playTone(b[i]*2,'triangle',1.2,0.1,i*0.06+0.02);}
    playTone(60,'sine',0.8,0.5); for(var j=0;j<12;j++) playTone(1000+j*200,'sine',0.3,0.15,j*0.1); playNoise(0.5,0.2,500,1);
  }
  function soundFreeSpins() { for(var i=0;i<10;i++) playTone(800+i*150,'sine',0.2,0.15,i*0.06); }
  function soundBonus() { var n=[392,494,587,740,587,740,880]; for(var i=0;i<n.length;i++){playTone(n[i],'square',0.18,0.18,i*0.09);playTone(n[i],'sine',0.15,0.22,i*0.09+0.01);} }
  function soundChestOpen() { playTone(440,'sine',0.3,0.3); playTone(660,'sine',0.25,0.25,0.1); playTone(880,'sine',0.2,0.2,0.2); playNoise(0.15,0.06,800,4); }
  function soundClick() { playTone(600,'sine',0.05,0.12); playNoise(0.04,0.04,1000,10); }

  function startReelTicks() { reelTickInterval = setInterval(soundReelTick, 70); }
  function stopReelTicks()  { clearInterval(reelTickInterval); reelTickInterval = null; }

  /* ══════════════════════════════════════════════════════════
     9. DOM HELPERS
  ══════════════════════════════════════════════════════════ */
  function $(id) { return document.getElementById(id); }
  function getSymbol(id) { for(var i=0;i<SYMBOLS.length;i++) if(SYMBOLS[i].id===id) return SYMBOLS[i]; return SYMBOLS[0]; }
  function randomSymbol() { return REEL_POOL[Math.floor(Math.random()*REEL_POOL.length)]; }

  /* ══════════════════════════════════════════════════════════
     10. BUILD REELS
  ══════════════════════════════════════════════════════════ */
  function buildReels() {
    var container = $('lf-reelsGrid'); container.innerHTML = '';
    for (var col = 0; col < 5; col++) {
      var reel = document.createElement('div'); reel.className = 'lf-reel'; reel.id = 'lf-reel' + col;
      for (var row = 0; row < 3; row++) {
        var cell = document.createElement('div'); cell.className = 'lf-cell'; cell.id = 'lf-cell' + col + '_' + row;
        cell.innerHTML = '<span class="lf-cell-symbol">\uD83C\uDF52</span>';
        reel.appendChild(cell);
      }
      container.appendChild(reel);
    }
    resizeCanvas();
  }

  function resizeCanvas() {
    var gridEl = $('lf-reelsGrid'); var canvas = $('lf-winCanvas');
    if (!gridEl || !canvas) return;
    canvas.width = gridEl.offsetWidth; canvas.height = gridEl.offsetHeight;
  }

  function renderGrid() {
    for (var col = 0; col < 5; col++) {
      for (var row = 0; row < 3; row++) {
        var cell = $('lf-cell' + col + '_' + row); var sym = getSymbol(grid[col][row]);
        cell.className = 'lf-cell' + (sym.cls ? ' ' + sym.cls : '');
        cell.innerHTML = '<span class="lf-cell-symbol">' + sym.emoji + '</span>';
        if (sym.label) cell.innerHTML += '<span class="lf-cell-label">' + sym.label + '</span>';
      }
    }
  }

  /* ══════════════════════════════════════════════════════════
     11. SPIN
  ══════════════════════════════════════════════════════════ */
  function spin() {
    if (spinning) return;
    
    var totalCost = cost * lines;
    if (freeSpins > 0) totalCost = 0;

    if (coins < totalCost) {
      if (!autoMode) {
        var msg = lang === 'ar' ? 'عذراً، لا تملك عملات كافية!' : 'Sorry, insufficient coins!';
        alert(msg);
      } else {
        stopAutoSpin();
      }
      return;
    }
    
    if (freeSpins <= 0) {
      incrementUserCurrency(-totalCost);
      sessionCoinsSpent += totalCost;
    } else { freeSpins--; updateFSBanner(); }
    sessionSpins++;

    spinning = true;
    $('lf-spinBtn').disabled = true;
    $('lf-winText').textContent = T('WIN') + ' 0';
    clearHighlights(); clearWinLines();
    soundSpinStart(); startReelTicks();

    jackpot += Math.floor(Math.random() * 50) + cost;
    incrementJackpotFirestore(Math.floor(Math.random() * 50) + cost);
    // local display is kept in sync via Firestore listener; updateJackpot() called there

    var delay = quickMode ? 30 : 80;
    var stopTimes = [0,1,2,3,4].map(function(i){ return (quickMode?200:350) + i*(quickMode?80:120); });
    var maxTime = stopTimes[4] + (quickMode ? 100 : 200);

    var spinInterval = setInterval(function() {
      for (var col = 0; col < 5; col++) {
        for (var row = 0; row < 3; row++) {
          var cell = $('lf-cell' + col + '_' + row);
          if (!cell.classList.contains('stopped')) {
            var s = getSymbol(randomSymbol());
            cell.innerHTML = '<span class="lf-cell-symbol">' + s.emoji + '</span>';
            if (s.label) cell.innerHTML += '<span class="lf-cell-label">' + s.label + '</span>';
            cell.classList.add('spinning');
          }
        }
      }
    }, delay);

    stopTimes.forEach(function(t, col) {
      setTimeout(function() {
        soundReelStop(col);
        var newCol = [randomSymbol(), randomSymbol(), randomSymbol()];
        grid[col] = newCol;
        for (var row = 0; row < 3; row++) {
          var cell = $('lf-cell' + col + '_' + row); var s = getSymbol(newCol[row]);
          cell.className = 'lf-cell' + (s.cls ? ' ' + s.cls : '') + ' stopped';
          cell.innerHTML = '<span class="lf-cell-symbol">' + s.emoji + '</span>';
          if (s.label) cell.innerHTML += '<span class="lf-cell-label">' + s.label + '</span>';
        }
      }, t);
    });

    setTimeout(function() {
      clearInterval(spinInterval); stopReelTicks();
      for (var col = 0; col < 5; col++) {
        for (var row = 0; row < 3; row++) {
          var c = $('lf-cell' + col + '_' + row); c.classList.remove('stopped', 'spinning');
        }
      }
      checkWins(); spinning = false; $('lf-spinBtn').disabled = false;
      updateCoinsDisplay();
      if (autoMode && freeSpins <= 0) autoTimer = setTimeout(spin, quickMode ? 400 : 900);
      if (freeSpins > 0 && !autoMode) setTimeout(spin, quickMode ? 400 : 800);
    }, maxTime);
  }

  /* ══════════════════════════════════════════════════════════
     12. WIN DETECTION
  ══════════════════════════════════════════════════════════ */
  function checkWins() {
    var totalWin = 0; var winningCells = {}; var winningLines = [];

    var scatterCount = 0;
    for (var c = 0; c < 5; c++) for (var r = 0; r < 3; r++) if (grid[c][r] === 'scatter') scatterCount++;
    if (scatterCount >= 3) { var fs = scatterCount===3?10:scatterCount===4?15:20; freeSpins+=fs; updateFSBanner(); soundFreeSpins(); }

    var bonusCount = 0;
    for (var c2 = 0; c2 < 5; c2++) for (var r2 = 0; r2 < 3; r2++) if (grid[c2][r2] === 'bonus') bonusCount++;
    if (bonusCount >= 3) setTimeout(function(){ soundBonus(); startBonus(); }, 800);

    var jpCount = 0;
    for (var c3 = 0; c3 < 5; c3++) for (var r3 = 0; r3 < 3; r3++) if (grid[c3][r3] === 'jackpot') jpCount++;
    if (jpCount >= 5) {
      var jpWin = Math.floor(jackpot * (cost / 10)); totalWin += jpWin;
      setTimeout(function() {
        soundJackpot(); showWinOverlay(T('JACKPOT_WIN'), jpWin, T('JACKPOT_MSG'));
        launchConfetti(80); resetJackpotFirestore();
      }, 500);
    }

    var activeLines = PAYLINES.slice(0, lines);
    for (var li = 0; li < activeLines.length; li++) {
      var line = activeLines[li]; var syms = [];
      for (var ci = 0; ci < 5; ci++) syms.push(grid[ci][line[ci]]);
      var nonWild = [];
      for (var si = 0; si < syms.length; si++) {
        if (syms[si]!=='wild'&&syms[si]!=='scatter'&&syms[si]!=='bonus'&&syms[si]!=='jackpot') nonWild.push(syms[si]);
      }
      if (!nonWild.length) continue;
      var target = nonWild[0]; var sym = getSymbol(target);
      if (!sym || sym.special) continue;
      var count = 0;
      for (var col = 0; col < 5; col++) {
        if (grid[col][line[col]]===target || grid[col][line[col]]==='wild') count++;
        else break;
      }
      var minM = sym.minMatch || 3;
      if (count >= minM && sym.pays && sym.pays[count]) {
        var lineWin = sym.pays[count] * cost; totalWin += lineWin;
        for (var wc = 0; wc < count; wc++) winningCells[wc+'_'+line[wc]] = true;
        winningLines.push({ line:line, count:count, sym:sym, lineWin:lineWin });
      }
    }

    if (totalWin > 0) {
      incrementUserCurrency(totalWin);
      sessionCoinsWon += totalWin;
      highlightCells(winningCells); drawWinLines(winningLines); spawnCoins(); updateProgress(totalWin);
      if (totalWin >= cost*lines*20) soundBigWin(); else soundCoinWin();
      var wt = $('lf-winText');
      wt.textContent = T('WIN') + ' ' + totalWin; wt.classList.add('big-win');
      setTimeout(function(){ wt.classList.remove('big-win'); }, 600);
      if (totalWin >= cost*lines*20) {
        var title = totalWin >= cost*lines*50 ? T('MEGA_WIN') : T('BIG_WIN');
        setTimeout(function(){ showWinOverlay(title, totalWin); launchConfetti(50); }, 400);
      }
      $('lf-jackpotVal').classList.add('pulse');
      setTimeout(function(){ $('lf-jackpotVal').classList.remove('pulse'); }, 400);
    }
  }

  /* ══════════════════════════════════════════════════════════
     13. WIN LINES CANVAS
  ══════════════════════════════════════════════════════════ */
  function highlightCells(cells) { for(var key in cells){ var p=key.split('_'); var el=$('lf-cell'+p[0]+'_'+p[1]); if(el) el.classList.add('highlight'); } }
  function clearHighlights() { var els=document.querySelectorAll('.lf-cell.highlight'); for(var i=0;i<els.length;i++) els[i].classList.remove('highlight'); }
  function drawWinLines(winLines) {
    var canvas=$('lf-winCanvas'); if(!canvas) return;
    var ctx=canvas.getContext('2d'); resizeCanvas(); ctx.clearRect(0,0,canvas.width,canvas.height);
    if(!winLines.length) return;
    var colW=canvas.width/5, rowH=canvas.height/3;
    var colors=['#FFD700','#00FF88','#FF69B4','#00CFFF','#FF8C00'];
    var max=Math.min(winLines.length,5);
    for(var i=0;i<max;i++){
      var wl=winLines[i]; ctx.strokeStyle=colors[i%colors.length];
      ctx.lineWidth=3; ctx.shadowColor=colors[i%colors.length]; ctx.shadowBlur=8; ctx.globalAlpha=0.85;
      ctx.beginPath();
      for(var col=0;col<wl.count;col++){ var x=col*colW+colW/2, y=wl.line[col]*rowH+rowH/2; if(col===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }
      ctx.stroke();
    }
    ctx.globalAlpha=1; ctx.shadowBlur=0;
  }
  function clearWinLines() { var canvas=$('lf-winCanvas'); if(!canvas) return; canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height); }

  /* ══════════════════════════════════════════════════════════
     14. BONUS GAME
  ══════════════════════════════════════════════════════════ */
  function startBonus() {
    var gridEl=$('lf-chestsGrid'); var res=$('lf-bonusResult');
    gridEl.innerHTML=''; res.textContent='';
    var prizes=[];
    for(var i=0;i<6;i++) prizes.push(Math.floor((Math.random()*500+50)*cost));
    prizes.forEach(function(prize){
      var btn=document.createElement('button'); btn.className='lf-chest-btn'; btn.innerHTML='\uD83D\uDCE6';
      btn.onclick=function(){
        if(btn.classList.contains('opened')) return;
        btn.classList.add('opened'); btn.innerHTML='\uD83C\uDF81<span class="lf-chest-prize">+'+prize+'</span>';
        soundChestOpen(); incrementUserCurrency(prize);
        sessionCoinsWon += prize;
        updateCoinsDisplay(); res.textContent=T('YOU_WON')+' '+prize+' '+T('COINS');
        $('lf-bonusOverlay').classList.remove('show');
        showWinOverlay(T('BONUS_WIN'),prize,T('BONUS_REWARD')); launchConfetti(30);
      };
      gridEl.appendChild(btn);
    });
    $('lf-bonusOverlay').classList.add('show');
  }

  /* ══════════════════════════════════════════════════════════
     15. UI UPDATES
  ══════════════════════════════════════════════════════════ */
  function updateCoinsDisplay() { $('lf-coins').textContent = coins.toLocaleString(); }
  function updateJackpot()      { $('lf-jackpotVal').textContent = jackpot.toLocaleString(); }
  function updateTotalCost()    { $('lf-totalCosts').textContent = T('TOTAL_COSTS') + ' ' + (cost * lines); }
  function updateFSBanner() {
    var banner = document.getElementById('lf-fsBanner');
    var count  = document.getElementById('lf-fsCount');
    if (freeSpins > 0) {
      if (count) count.textContent = freeSpins + ' remaining!';
      if (banner) {
        banner.innerHTML = '&#127808; ' + T('FREE_SPINS') + '! <span id="lf-fsCount">' + freeSpins + ' ' + (lang === 'ar' ? 'متبقية!' : 'remaining!') + '</span>';
        banner.classList.add('show');
      }
    } else {
      if (banner) {
        banner.classList.remove('show');
      }
    }
  }
  function updateProgress(win) {
    progressVal = Math.min(progressVal + win, 1000);
    var pct = progressVal / 10;
    var fill = document.getElementById('lf-progressFill');
    var txt  = document.getElementById('lf-progressText');
    if (fill) fill.style.width = pct + '%';
    if (txt)  txt.textContent = Math.floor(progressVal) + '/1000';
    if (progressVal >= 1000) {
      progressVal = 0;
      if (fill) fill.style.width = '0%';
      if (txt)  txt.textContent = '0/1000';
      /* Reward: grant 10 free spins */
      freeSpins += 10;
      updateFSBanner();
      soundFreeSpins();
    }
  }
  function showMsg(txt) { console.log('[LuckyFruit]', txt); }
  function showWinOverlay(title, amount, msg) {
    $('lf-overlayTitle').textContent=title;
    $('lf-overlayAmount').textContent='+'+amount.toLocaleString();
    $('lf-overlayMsg').textContent=msg||'';
    $('lf-winOverlay').classList.add('show');
  }

  function spawnCoins() {
    var area=$('lf-coinsArea');
    for(var i=0;i<8;i++){
      (function(idx){
        setTimeout(function(){
          var c=document.createElement('div'); c.className='lf-coin-particle'; c.textContent='\uD83E\uDE99';
          c.style.left=Math.random()*90+'%'; c.style.animationDuration=(0.8+Math.random()*0.8)+'s';
          area.appendChild(c); setTimeout(function(){ c.remove(); }, 1600);
        }, idx*80);
      })(i);
    }
  }

  function launchConfetti(count) {
    var colors=['#FFD700','#FF3366','#00FF88','#00CFFF','#FF69B4','#FF8C00'];
    for(var i=0;i<count;i++){
      (function(idx){
        setTimeout(function(){
          var c=document.createElement('div'); c.className='lf-confetti-piece';
          c.style.left=Math.random()*100+'vw';
          c.style.background=colors[Math.floor(Math.random()*colors.length)];
          c.style.animationDuration=(1.5+Math.random()*2)+'s';
          c.style.width=c.style.height=(8+Math.random()*10)+'px';
          c.style.transform='rotate('+(Math.random()*360)+'deg)';
          document.body.appendChild(c); setTimeout(function(){ c.remove(); },3500);
        }, idx*40);
      })(i);
    }
  }

  /* ══════════════════════════════════════════════════════════
     16. CONTROLS WIRING
  ══════════════════════════════════════════════════════════ */
  function wireControls() {
    var LINE_VALS = [1,5,10,20,25,30,40,50];

    $('lf-costMinus').onclick = function(){ soundClick(); if(cost>1){cost=Math.max(1,cost-1);$('lf-costVal').textContent=cost;updateTotalCost();} };
    $('lf-costPlus').onclick  = function(){ soundClick(); if(cost<100){cost=Math.min(100,cost+1);$('lf-costVal').textContent=cost;updateTotalCost();} };
    $('lf-linesMinus').onclick = function(){
      soundClick(); var idx=LINE_VALS.indexOf(lines);
      if(idx>0){lines=LINE_VALS[idx-1];$('lf-linesVal').textContent=lines;updateTotalCost();}
    };
    $('lf-linesPlus').onclick = function(){
      soundClick(); var idx=LINE_VALS.indexOf(lines);
      if(idx<LINE_VALS.length-1){lines=LINE_VALS[idx+1];$('lf-linesVal').textContent=lines;updateTotalCost();}
    };
    $('lf-spinBtn').onclick = spin;
    $('lf-quickBtn').onclick = function(){ soundClick(); quickMode=!quickMode; $('lf-quickCheck').classList.toggle('on',quickMode); };
    $('lf-autoBtn').onclick  = function(){
      soundClick(); autoMode=!autoMode; $('lf-autoCheck').classList.toggle('on',autoMode);
      if(autoMode&&!spinning) spin();
      if(!autoMode&&autoTimer){clearTimeout(autoTimer);autoTimer=null;}
    };
    $('lf-muteBtn').onclick = function(){
      soundOn=!soundOn; $('lf-muteBtn').textContent=soundOn?'\uD83D\uDD0A':'\uD83D\uDD07';
      if(soundOn) soundClick();
    };
    $('lf-rulesBtn').onclick  = function(){ soundClick(); $('lf-rulesOverlay').classList.add('show'); };
    $('lf-rulesClose').onclick = function(){ $('lf-rulesOverlay').classList.remove('show'); };
    $('lf-overlayClose').onclick = function(){ $('lf-winOverlay').classList.remove('show'); };

    window.lfCloseOverlay = function(){ $('lf-winOverlay').classList.remove('show'); };
    window.lfCloseRules   = function(){ $('lf-rulesOverlay').classList.remove('show'); };
    window.addEventListener('resize', resizeCanvas);
  }

  /* ══════════════════════════════════════════════════════════
     17. AVATAR SYNC — photo + name + frame + MiniProfilePopup on click
  ══════════════════════════════════════════════════════════ */
  function syncAvatar() {
    try {
      var state = window.lfGameUserData || window.userData || window.currentUserData;
      var authUser = null;
      if (window.useAuthState && typeof window.useAuthState === 'function') {
        var authSt = window.useAuthState();
        authUser = authSt ? authSt.user || authSt : null;
      }

      var avatarEl = document.getElementById('lf-avatar');
      if (!avatarEl) return;

      var photoURL = state?.photoURL || authUser?.photoURL;
      var displayName = state?.displayName || authUser?.displayName || 'U';
      var frameId = state?.equipped?.frames;

      /* Base avatar inner HTML */
      var inner = "";
      if (photoURL) {
        inner = '<img src="' + photoURL + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;position:relative;z-index:2;" alt="" />';
      } else {
        avatarEl.style.backgroundImage = 'none';
        inner = '<span style="font-size:16px;font-weight:900;color:#fff;position:relative;z-index:2;display:flex;align-items:center;justify-content:center;width:100%;height:100%">' + displayName.charAt(0).toUpperCase() + '</span>';
      }

      /* Apply frame if has one */
      if (frameId && window.SHOP_ITEMS && window.SHOP_ITEMS.frames) {
        var frameObj = window.SHOP_ITEMS.frames.find(function(f) { return f.id === frameId; });
        if (frameObj && frameObj.preview) {
           var frameSrc = frameObj.preview;
           if (frameSrc.startsWith('http')) {
             inner += '<img src="' + frameSrc + '" style="position:absolute;width:150%;height:150%;top:-25%;left:-25%;z-index:3;pointer-events:none;" alt="" />';
           } else {
             /* color/gradient frame */
             inner += '<div style="position:absolute;inset:-4px;background:'+frameSrc+';border-radius:50%;z-index:1;pointer-events:none;"></div>';
           }
           avatarEl.style.border = 'none';
        }
      }
      avatarEl.innerHTML = inner;

      /* Click → open MiniProfilePopup (not full profile page) */
      avatarEl.onclick = function() {
        var uid = state?.uid || authUser?.uid;
        if (!uid) return;
        
        if (window.openMiniProfile) {
          window.openMiniProfile(uid);
        } else if (window.setMiniProfileUID) {
          window.setMiniProfileUID(uid);
          if (window.setShowMiniProfile) window.setShowMiniProfile(true);
        } else {
          if (window.setShowMyAccount) window.setShowMyAccount(true);
        }
      };
    } catch (e) {}
  }

  /* ══════════════════════════════════════════════════════════
     18. START / STOP
  ══════════════════════════════════════════════════════════ */
  function start(containerIdOrEl, initialUserData) {
    if (initialUserData) window.lfGameUserData = initialUserData;
    
    rootEl = typeof containerIdOrEl === 'string'
      ? document.getElementById(containerIdOrEl)
      : containerIdOrEl;
    if (!rootEl) { console.error('[LuckyFruit] Container not found:', containerIdOrEl); return; }

    /* Reset session counters */
    sessionCoinsSpent = 0; sessionCoinsWon = 0; sessionSpins = 0;
    progressVal = 0; freeSpins = 0; jackpot = 1033921;

    rootEl.innerHTML = buildHTML();
    subscribeUserCurrency();
    buildReels();
    for (var col = 0; col < 5; col++) grid[col] = [randomSymbol(), randomSymbol(), randomSymbol()];
    renderGrid();

    /* Subscribe to Firestore jackpot (real shared value) */
    subscribeJackpot();

    /* Grant 1 daily free spin */
    checkGrantDailyFreeSpin();

    updateCoinsDisplay(); updateJackpot(); updateTotalCost();
    document.getElementById('lf-muteBtn').textContent = '\uD83D\uDD0A';

    wireControls();
    syncAvatar();

    rootEl.addEventListener('click', function(){
      if(soundOn){ try{ getAudioCtx(); }catch(e){} }
    }, { once: true });
  }

  function stop() {
    if (jackpotTicker){ clearInterval(jackpotTicker); jackpotTicker=null; }
    if (autoTimer)    { clearTimeout(autoTimer); autoTimer=null; }
    stopReelTicks();
    unsubscribeUserCurrency();
    unsubscribeJackpot();
    logSession();
    if (rootEl){ rootEl.innerHTML=''; rootEl=null; }
  }

  function setLanguage(lang) {
    if (window.AppState) window.AppState.language = lang;
    else document.documentElement.lang = lang;
    if (rootEl){ var el=rootEl; stop(); start(el); }
  }

  /* ══════════════════════════════════════════════════════════
     19. PUBLIC API
  ══════════════════════════════════════════════════════════ */
  window.LuckyFruitGame = {
    start:       start,
    stop:        stop,
    setLanguage: setLanguage,
    getCoins:    function(){ return coins; },
    setCoins:    function(n){ writeCoinsToAppState(n); updateCoinsDisplay(); }
  };

})();
