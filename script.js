// ==========================================
// PRO SPY - SCRIPT V10 - COMPLETE FILE
// All-in-one: Config + Components + App
// Changes: Gift System (Bonus only, NO Cashback), Gift Log, Improved Chat, Friend Selection Fix
// ==========================================

const { useState, useEffect, useRef, useCallback, useMemo } = React;
const createPortal = ReactDOM.createPortal;

// Portal helper - renders children on document.body to escape backdrop-filter stacking context
const PortalModal = ({ children }) => {
    const el = useRef(document.createElement('div'));
    useEffect(() => {
        document.body.appendChild(el.current);
        return () => { if (el.current.parentNode) el.current.parentNode.removeChild(el.current); };
    }, []);
    return createPortal(children, el.current);
};

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyApAJaNfF0YHupunLRlK3jRYvttxczWShY",
    authDomain: "who-is-the-spy-919b9.firebaseapp.com",
    projectId: "who-is-the-spy-919b9",
    storageBucket: "who-is-the-spy-919b9.firebasestorage.app",
    messagingSenderId: "607075438373",
    appId: "1:607075438373:web:a03e9fb8b243cd993e14cc"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const appId = 'pro_spy_v25_final_fix_complete';

// ==========================================
// COLLECTIONS
// ==========================================
const usersCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('users');
const guestsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('guests');
const reportsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('reports');
const chatsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('private_chats');
const roomsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('rooms');
const historyCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('game_history');
const notificationsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('notifications');
const giftsLogCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('gifts_log');
const momentsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('moments');

// --- Constants ---
const CURRENCY_NAME = "Intel";
const CURRENCY_ICON = "🧠";
const MAX_ROUNDS = 3;
const MAX_BADGES = 10;
const MAX_GIFT_LOG_DISPLAY = 10;

// ==========================================
// 🔊 AUDIO SYSTEM
// ==========================================
let audioContext = null;
let isAudioInitialized = false;

const initAudioContext = () => {
    if (audioContext) return audioContext;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        isAudioInitialized = true;
        console.log('🔊 Audio system initialized');
        return audioContext;
    } catch (e) {
        console.error('Audio initialization failed:', e);
        return null;
    }
};

const playSound = (type) => {
    try {
        // Check if sound is muted
        if (typeof window !== 'undefined' && window.proSpySoundMuted) return;
        if (localStorage.getItem('pro_spy_sound_muted') === 'true') return;
        
        if (!audioContext) audioContext = initAudioContext();
        if (!audioContext) return;
        if (audioContext.state === 'suspended') audioContext.resume();
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        const now = audioContext.currentTime;
        
        switch(type) {
            case 'click':
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
            case 'success':
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.type = 'sine';
                oscillator.frequency.linearRampToValueAtTime(1200, now + 0.15);
                gainNode.gain.setValueAtTime(0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;
            case 'gift':
                oscillator.frequency.setValueAtTime(523, now);
                oscillator.type = 'sine';
                oscillator.frequency.linearRampToValueAtTime(784, now + 0.15);
                oscillator.frequency.linearRampToValueAtTime(1047, now + 0.3);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                oscillator.start(now);
                oscillator.stop(now + 0.4);
                break;
            case 'notification':
                oscillator.frequency.setValueAtTime(880, now);
                oscillator.type = 'sine';
                oscillator.frequency.linearRampToValueAtTime(1100, now + 0.1);
                oscillator.frequency.linearRampToValueAtTime(880, now + 0.2);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;
            case 'reward':
                oscillator.frequency.setValueAtTime(440, now);
                oscillator.type = 'sine';
                oscillator.frequency.linearRampToValueAtTime(554, now + 0.1);
                oscillator.frequency.linearRampToValueAtTime(659, now + 0.2);
                oscillator.frequency.linearRampToValueAtTime(880, now + 0.3);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                oscillator.start(now);
                oscillator.stop(now + 0.5);
                break;
            case 'message':
                oscillator.frequency.setValueAtTime(660, now);
                oscillator.type = 'triangle';
                oscillator.frequency.linearRampToValueAtTime(880, now + 0.08);
                gainNode.gain.setValueAtTime(0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;
        }
    } catch (e) {
        console.error('Sound play error:', e);
    }
};

const initAudioOnFirstInteraction = () => {
    if (!isAudioInitialized) {
        initAudioContext();
        playSound('click');
    }
};

// Initialize sound mute state from localStorage
if (typeof window !== 'undefined') {
    window.proSpySoundMuted = localStorage.getItem('pro_spy_sound_muted') === 'true';
}

if (typeof window !== 'undefined') {
    const initEvents = ['click', 'touchstart', 'keydown'];
    const initHandler = () => {
        initAudioOnFirstInteraction();
        initEvents.forEach(event => document.removeEventListener(event, initHandler));
    };
    initEvents.forEach(event => document.addEventListener(event, initHandler, { once: true }));
}

const playNotificationSound = () => playSound('notification');
const playRewardSound = () => playSound('reward');
const playMessageSound = () => playSound('message');
const playGiftSound = () => playSound('gift');

// ============================================================
// 🎫 FUN PASS SYSTEM - 50 levels, daily/weekly missions
// ============================================================
const FUN_PASS_PRICE = 2000; // Cost in Intel to buy Fun Pass

const FUN_PASS_LEVELS = [
  // level, xpRequired, free reward, premium reward
  // free: {type, icon, name_en, name_ar, amount?, itemId?, rarity?}
  // premium: {type, icon, name_en, name_ar, amount?, itemId?, rarity?}
  { level:1,  xp:0,    free:{type:'currency',icon:'🧠',iconUrl:'https://i.ibb.co/YTj22zWy/awaw.png',name_en:'200 Intel',name_ar:'200 إنتل',amount:200},                           premium:{type:'currency',icon:'🧠',name_en:'500 Intel',name_ar:'500 إنتل',amount:500} },
  { level:2,  xp:100,  free:{type:'currency',icon:'🧠',name_en:'250 Intel',name_ar:'250 إنتل',amount:250},                           premium:{type:'badge',icon:'🔰',name_en:'Rookie Badge',name_ar:'شارة مبتدئ',itemId:'fp_badge_rookie',rarity:'Common'} },
  { level:3,  xp:250,  free:{type:'currency',icon:'🧠',name_en:'300 Intel',name_ar:'300 إنتل',amount:300},                           premium:{type:'currency',icon:'🧠',name_en:'700 Intel',name_ar:'700 إنتل',amount:700} },
  { level:4,  xp:450,  free:{type:'badge',icon:'⚡',name_en:'Speed Badge',name_ar:'شارة السرعة',itemId:'fp_badge_speed',rarity:'Common'}, premium:{type:'currency',icon:'🧠',name_en:'900 Intel',name_ar:'900 إنتل',amount:900} },
  { level:5,  xp:700,  free:{type:'currency',icon:'🧠',name_en:'400 Intel',name_ar:'400 إنتل',amount:400},                           premium:{type:'frame',icon:'🖼️',name_en:'Neon Frame',name_ar:'إطار نيون',itemId:'fp_frame_neon',rarity:'Rare'} },
  { level:6,  xp:1000, free:{type:'currency',icon:'🧠',name_en:'450 Intel',name_ar:'450 إنتل',amount:450},                           premium:{type:'currency',icon:'🧠',name_en:'1000 Intel',name_ar:'1000 إنتل',amount:1000} },
  { level:7,  xp:1400, free:{type:'title',icon:'🕵️',name_en:'Agent Title',name_ar:'لقب عميل',itemId:'fp_title_agent',rarity:'Rare'},  premium:{type:'currency',icon:'🧠',name_en:'1100 Intel',name_ar:'1100 إنتل',amount:1100} },
  { level:8,  xp:1850, free:{type:'currency',icon:'🧠',name_en:'500 Intel',name_ar:'500 إنتل',amount:500},                           premium:{type:'badge',icon:'💎',name_en:'Diamond Badge',name_ar:'شارة ألماس',itemId:'fp_badge_diamond',rarity:'Epic'} },
  { level:9,  xp:2350, free:{type:'currency',icon:'🧠',name_en:'550 Intel',name_ar:'550 إنتل',amount:550},                           premium:{type:'currency',icon:'🧠',name_en:'1200 Intel',name_ar:'1200 إنتل',amount:1200} },
  { level:10, xp:2900, free:{type:'frame',icon:'🌟',name_en:'Star Frame',name_ar:'إطار نجمة',itemId:'fp_frame_star',rarity:'Epic'},    premium:{type:'title',icon:'🌟',name_en:'Star Title',name_ar:'لقب نجمة',itemId:'fp_title_star',rarity:'Epic'} },
  { level:11, xp:3500, free:{type:'currency',icon:'🧠',name_en:'600 Intel',name_ar:'600 إنتل',amount:600},                           premium:{type:'currency',icon:'🧠',name_en:'1300 Intel',name_ar:'1300 إنتل',amount:1300} },
  { level:12, xp:4200, free:{type:'badge',icon:'🔥',name_en:'Fire Badge',name_ar:'شارة النار',itemId:'fp_badge_fire',rarity:'Epic'},   premium:{type:'currency',icon:'🧠',name_en:'1400 Intel',name_ar:'1400 إنتل',amount:1400} },
  { level:13, xp:5000, free:{type:'currency',icon:'🧠',name_en:'700 Intel',name_ar:'700 إنتل',amount:700},                           premium:{type:'frame',icon:'💠',name_en:'Crystal Frame',name_ar:'إطار كريستال',itemId:'fp_frame_crystal',rarity:'Epic'} },
  { level:14, xp:5900, free:{type:'currency',icon:'🧠',name_en:'750 Intel',name_ar:'750 إنتل',amount:750},                           premium:{type:'currency',icon:'🧠',name_en:'1500 Intel',name_ar:'1500 إنتل',amount:1500} },
  { level:15, xp:6900, free:{type:'title',icon:'⚔️',name_en:'Warrior Title',name_ar:'لقب محارب',itemId:'fp_title_warrior',rarity:'Epic'}, premium:{type:'badge',icon:'🏆',name_en:'Champion Badge',name_ar:'شارة بطل',itemId:'fp_badge_champion',rarity:'Epic'} },
  { level:16, xp:8000, free:{type:'currency',icon:'🧠',name_en:'800 Intel',name_ar:'800 إنتل',amount:800},                           premium:{type:'currency',icon:'🧠',name_en:'1700 Intel',name_ar:'1700 إنتل',amount:1700} },
  { level:17, xp:9200, free:{type:'currency',icon:'🧠',name_en:'850 Intel',name_ar:'850 إنتل',amount:850},                           premium:{type:'frame',icon:'🌀',name_en:'Vortex Frame',name_ar:'إطار دوامة',itemId:'fp_frame_vortex',rarity:'Epic'} },
  { level:18, xp:10500,free:{type:'badge',icon:'🎯',name_en:'Sniper Badge',name_ar:'شارة القناص',itemId:'fp_badge_sniper',rarity:'Epic'}, premium:{type:'currency',icon:'🧠',name_en:'1800 Intel',name_ar:'1800 إنتل',amount:1800} },
  { level:19, xp:12000,free:{type:'currency',icon:'🧠',name_en:'900 Intel',name_ar:'900 إنتل',amount:900},                           premium:{type:'title',icon:'👁️',name_en:'Eye Title',name_ar:'لقب العين',itemId:'fp_title_eye',rarity:'Epic'} },
  { level:20, xp:13700,free:{type:'frame',icon:'👑',name_en:'Gold Frame',name_ar:'إطار ذهبي',itemId:'fp_frame_gold',rarity:'Legendary'}, premium:{type:'currency',icon:'🧠',name_en:'2000 Intel',name_ar:'2000 إنتل',amount:2000} },
  { level:21, xp:15600,free:{type:'currency',icon:'🧠',name_en:'950 Intel',name_ar:'950 إنتل',amount:950},                           premium:{type:'badge',icon:'⭐',name_en:'Legend Badge',name_ar:'شارة أسطورية',itemId:'fp_badge_legend',rarity:'Legendary'} },
  { level:22, xp:17600,free:{type:'currency',icon:'🧠',name_en:'1000 Intel',name_ar:'1000 إنتل',amount:1000},                        premium:{type:'frame',icon:'🌙',name_en:'Moon Frame',name_ar:'إطار القمر',itemId:'fp_frame_moon',rarity:'Legendary'} },
  { level:23, xp:19800,free:{type:'title',icon:'🌙',name_en:'Shadow Title',name_ar:'لقب الظل',itemId:'fp_title_shadow',rarity:'Legendary'}, premium:{type:'currency',icon:'🧠',name_en:'2200 Intel',name_ar:'2200 إنتل',amount:2200} },
  { level:24, xp:22200,free:{type:'currency',icon:'🧠',name_en:'1100 Intel',name_ar:'1100 إنتل',amount:1100},                        premium:{type:'badge',icon:'🌌',name_en:'Galaxy Badge',name_ar:'شارة المجرة',itemId:'fp_badge_galaxy',rarity:'Legendary'} },
  { level:25, xp:24800,free:{type:'badge',icon:'🏅',name_en:'Gold Badge',name_ar:'شارة ذهبية',itemId:'fp_badge_gold',rarity:'Legendary'}, premium:{type:'title',icon:'🏅',name_en:'Gold Title',name_ar:'لقب ذهبي',itemId:'fp_title_gold',rarity:'Legendary'} },
  { level:26, xp:27600,free:{type:'currency',icon:'🧠',name_en:'1200 Intel',name_ar:'1200 إنتل',amount:1200},                        premium:{type:'frame',icon:'🔥',name_en:'Inferno Frame',name_ar:'إطار جهنم',itemId:'fp_frame_inferno',rarity:'Legendary'} },
  { level:27, xp:30600,free:{type:'currency',icon:'🧠',name_en:'1300 Intel',name_ar:'1300 إنتل',amount:1300},                        premium:{type:'currency',icon:'🧠',name_en:'2500 Intel',name_ar:'2500 إنتل',amount:2500} },
  { level:28, xp:33800,free:{type:'frame',icon:'⚡',name_en:'Thunder Frame',name_ar:'إطار الرعد',itemId:'fp_frame_thunder',rarity:'Legendary'}, premium:{type:'badge',icon:'⚡',name_en:'Thunder Badge',name_ar:'شارة الرعد',itemId:'fp_badge_thunder',rarity:'Legendary'} },
  { level:29, xp:37200,free:{type:'currency',icon:'🧠',name_en:'1400 Intel',name_ar:'1400 إنتل',amount:1400},                        premium:{type:'title',icon:'🌊',name_en:'Ocean Title',name_ar:'لقب المحيط',itemId:'fp_title_ocean',rarity:'Legendary'} },
  { level:30, xp:40800,free:{type:'title',icon:'👑',name_en:'King Title',name_ar:'لقب الملك',itemId:'fp_title_king',rarity:'Legendary'}, premium:{type:'frame',icon:'💀',name_en:'Skull Frame',name_ar:'إطار الجمجمة',itemId:'fp_frame_skull',rarity:'Legendary'} },
  { level:31, xp:44600,free:{type:'currency',icon:'🧠',name_en:'1500 Intel',name_ar:'1500 إنتل',amount:1500},                        premium:{type:'currency',icon:'🧠',name_en:'2800 Intel',name_ar:'2800 إنتل',amount:2800} },
  { level:32, xp:48600,free:{type:'badge',icon:'🔮',name_en:'Mystic Badge',name_ar:'شارة غامضة',itemId:'fp_badge_mystic',rarity:'Legendary'}, premium:{type:'frame',icon:'🔮',name_en:'Mystic Frame',name_ar:'إطار غامض',itemId:'fp_frame_mystic',rarity:'Legendary'} },
  { level:33, xp:52900,free:{type:'currency',icon:'🧠',name_en:'1600 Intel',name_ar:'1600 إنتل',amount:1600},                        premium:{type:'title',icon:'🔥',name_en:'Flame Title',name_ar:'لقب اللهب',itemId:'fp_title_flame',rarity:'Legendary'} },
  { level:34, xp:57400,free:{type:'currency',icon:'🧠',name_en:'1700 Intel',name_ar:'1700 إنتل',amount:1700},                        premium:{type:'badge',icon:'💥',name_en:'Blast Badge',name_ar:'شارة الانفجار',itemId:'fp_badge_blast',rarity:'Legendary'} },
  { level:35, xp:62200,free:{type:'frame',icon:'🌈',name_en:'Rainbow Frame',name_ar:'إطار قوس قزح',itemId:'fp_frame_rainbow',rarity:'Legendary'}, premium:{type:'title',icon:'🌈',name_en:'Rainbow Title',name_ar:'لقب قوس قزح',itemId:'fp_title_rainbow',rarity:'Legendary'} },
  { level:36, xp:67200,free:{type:'currency',icon:'🧠',name_en:'1800 Intel',name_ar:'1800 إنتل',amount:1800},                        premium:{type:'currency',icon:'🧠',name_en:'3000 Intel',name_ar:'3000 إنتل',amount:3000} },
  { level:37, xp:72500,free:{type:'badge',icon:'🌑',name_en:'Dark Badge',name_ar:'شارة الظلام',itemId:'fp_badge_dark',rarity:'Legendary'}, premium:{type:'frame',icon:'🌑',name_en:'Dark Frame',name_ar:'إطار الظلام',itemId:'fp_frame_dark',rarity:'Legendary'} },
  { level:38, xp:78100,free:{type:'currency',icon:'🧠',name_en:'2000 Intel',name_ar:'2000 إنتل',amount:2000},                        premium:{type:'title',icon:'👁️',name_en:'Watcher Title',name_ar:'لقب الراصد',itemId:'fp_title_watcher',rarity:'Legendary'} },
  { level:39, xp:84000,free:{type:'currency',icon:'🧠',name_en:'2100 Intel',name_ar:'2100 إنتل',amount:2100},                        premium:{type:'badge',icon:'🏹',name_en:'Arrow Badge',name_ar:'شارة السهم',itemId:'fp_badge_arrow',rarity:'Legendary'} },
  { level:40, xp:90200,free:{type:'title',icon:'🔮',name_en:'Mystic Title',name_ar:'لقب الغموض',itemId:'fp_title_mystic',rarity:'Mythic'}, premium:{type:'frame',icon:'🔮',name_en:'Mythic Frame',name_ar:'إطار خرافي',itemId:'fp_frame_mythic',rarity:'Mythic'} },
  { level:41, xp:96800,free:{type:'currency',icon:'🧠',name_en:'2200 Intel',name_ar:'2200 إنتل',amount:2200},                        premium:{type:'currency',icon:'🧠',name_en:'3500 Intel',name_ar:'3500 إنتل',amount:3500} },
  { level:42, xp:103700,free:{type:'badge',icon:'💠',name_en:'Prism Badge',name_ar:'شارة المنشور',itemId:'fp_badge_prism',rarity:'Mythic'}, premium:{type:'frame',icon:'💠',name_en:'Prism Frame',name_ar:'إطار المنشور',itemId:'fp_frame_prism',rarity:'Mythic'} },
  { level:43, xp:110900,free:{type:'currency',icon:'🧠',name_en:'2400 Intel',name_ar:'2400 إنتل',amount:2400},                       premium:{type:'title',icon:'💠',name_en:'Prism Title',name_ar:'لقب المنشور',itemId:'fp_title_prism',rarity:'Mythic'} },
  { level:44, xp:118500,free:{type:'currency',icon:'🧠',name_en:'2600 Intel',name_ar:'2600 إنتل',amount:2600},                       premium:{type:'badge',icon:'🌀',name_en:'Void Badge',name_ar:'شارة الفراغ',itemId:'fp_badge_void',rarity:'Mythic'} },
  { level:45, xp:126500,free:{type:'frame',icon:'🌀',name_en:'Void Frame',name_ar:'إطار الفراغ',itemId:'fp_frame_void',rarity:'Mythic'}, premium:{type:'title',icon:'🌀',name_en:'Void Title',name_ar:'لقب الفراغ',itemId:'fp_title_void',rarity:'Mythic'} },
  { level:46, xp:134900,free:{type:'currency',icon:'🧠',name_en:'2800 Intel',name_ar:'2800 إنتل',amount:2800},                       premium:{type:'currency',icon:'🧠',name_en:'4000 Intel',name_ar:'4000 إنتل',amount:4000} },
  { level:47, xp:143700,free:{type:'badge',icon:'🔥',name_en:'Phoenix Badge',name_ar:'شارة الفينيكس',itemId:'fp_badge_phoenix',rarity:'Mythic'}, premium:{type:'frame',icon:'🔥',name_en:'Phoenix Frame',name_ar:'إطار الفينيكس',itemId:'fp_frame_phoenix',rarity:'Mythic'} },
  { level:48, xp:152900,free:{type:'currency',icon:'🧠',name_en:'3000 Intel',name_ar:'3000 إنتل',amount:3000},                       premium:{type:'title',icon:'🔥',name_en:'Phoenix Title',name_ar:'لقب الفينيكس',itemId:'fp_title_phoenix',rarity:'Mythic'} },
  { level:49, xp:162600,free:{type:'currency',icon:'🧠',name_en:'3200 Intel',name_ar:'3200 إنتل',amount:3200},                       premium:{type:'badge',icon:'🌟',name_en:'Nova Badge',name_ar:'شارة النجم المتفجر',itemId:'fp_badge_nova',rarity:'Mythic'} },
  { level:50, xp:172700,free:{type:'frame',icon:'🌟',name_en:'Nova Frame',name_ar:'إطار النجم المتفجر',itemId:'fp_frame_nova',rarity:'Mythic'}, premium:{type:'title',icon:'🔱',name_en:'GOD Title',name_ar:'لقب الإله',itemId:'fp_title_god',rarity:'Mythic'} },
];

const FUN_PASS_DAILY_MISSIONS = [
  { id:'d1', icon:'🎮', name_en:'Play 1 game',       name_ar:'العب لعبة واحدة',    xp:30  },
  { id:'d2', icon:'🏆', name_en:'Win 1 game',        name_ar:'اربح لعبة واحدة',    xp:60  },
  { id:'d3', icon:'🕵️', name_en:'Play as Spy',      name_ar:'العب كجاسوس',        xp:50  },
  { id:'d4', icon:'💬', name_en:'Send a gift',       name_ar:'أرسل هدية',          xp:40  },
  { id:'d5', icon:'👥', name_en:'Add a friend',      name_ar:'أضف صديق',           xp:35  },
  { id:'d6', icon:'📸', name_en:'Post a moment',     name_ar:'انشر لحظة',          xp:45  },
  { id:'d7', icon:'🗨️', name_en:'Comment on moment',name_ar:'علق على لحظة',       xp:25  },
];

const FUN_PASS_WEEKLY_MISSIONS = [
  { id:'w1', icon:'🎮', name_en:'Play 10 games',     name_ar:'العب 10 ألعاب',      xp:200 },
  { id:'w2', icon:'🏆', name_en:'Win 5 games',       name_ar:'اربح 5 ألعاب',       xp:300 },
  { id:'w3', icon:'🎁', name_en:'Send 5 gifts',      name_ar:'أرسل 5 هدايا',       xp:250 },
  { id:'w4', icon:'📸', name_en:'Post 3 moments',    name_ar:'انشر 3 لحظات',       xp:220 },
  { id:'w5', icon:'👥', name_en:'Chat with 3 friends',name_ar:'كلم 3 أصدقاء',     xp:180 },
];
// ==========================================
// LOGIN REWARDS - 30 DAYS
// ==========================================
const LOGIN_REWARDS = [
    { day: 1, type: 'currency', amount: 100, icon: '🧠', iconUrl: '', name_en: '100 Intel', name_ar: '100 إنتل' },
    { day: 2, type: 'currency', amount: 150, icon: '🧠', iconUrl: '', name_en: '150 Intel', name_ar: '150 إنتل' },
    { day: 3, type: 'currency', amount: 200, icon: '🧠', iconUrl: '', name_en: '200 Intel', name_ar: '200 إنتل' },
    { day: 4, type: 'currency', amount: 250, icon: '🧠', iconUrl: '', name_en: '250 Intel', name_ar: '250 إنتل' },
    { day: 5, type: 'currency', amount: 300, icon: '🧠', iconUrl: '', name_en: '300 Intel', name_ar: '300 إنتل' },
    { day: 6, type: 'currency', amount: 400, icon: '🧠', iconUrl: '', name_en: '400 Intel', name_ar: '400 إنتل' },
    { day: 7, type: 'badge', itemId: 'badge_vip', icon: '⭐', iconUrl: '', name_en: 'VIP Badge', name_ar: 'شارة VIP', special: true },
    { day: 8, type: 'currency', amount: 350, icon: '🧠', iconUrl: '', name_en: '350 Intel', name_ar: '350 إنتل' },
    { day: 9, type: 'currency', amount: 400, icon: '🧠', iconUrl: '', name_en: '400 Intel', name_ar: '400 إنتل' },
    { day: 10, type: 'currency', amount: 450, icon: '🧠', iconUrl: '', name_en: '450 Intel', name_ar: '450 إنتل' },
    { day: 11, type: 'currency', amount: 500, icon: '🧠', iconUrl: '', name_en: '500 Intel', name_ar: '500 إنتل' },
    { day: 12, type: 'currency', amount: 550, icon: '🧠', iconUrl: '', name_en: '550 Intel', name_ar: '550 إنتل' },
    { day: 13, type: 'currency', amount: 600, icon: '🧠', iconUrl: '', name_en: '600 Intel', name_ar: '600 إنتل' },
    { day: 14, type: 'frame', itemId: 'frame_neon', icon: '🖼️', iconUrl: '', name_en: 'Neon Frame', name_ar: 'إطار نيون', special: true },
    { day: 15, type: 'currency', amount: 700, icon: '🧠', iconUrl: '', name_en: '700 Intel', name_ar: '700 إنتل' },
    { day: 16, type: 'currency', amount: 750, icon: '🧠', iconUrl: '', name_en: '750 Intel', name_ar: '750 إنتل' },
    { day: 17, type: 'currency', amount: 800, icon: '🧠', iconUrl: '', name_en: '800 Intel', name_ar: '800 إنتل' },
    { day: 18, type: 'currency', amount: 850, icon: '🧠', iconUrl: '', name_en: '850 Intel', name_ar: '850 إنتل' },
    { day: 19, type: 'currency', amount: 900, icon: '🧠', iconUrl: '', name_en: '900 Intel', name_ar: '900 إنتل' },
    { day: 20, type: 'currency', amount: 950, icon: '🧠', iconUrl: '', name_en: '950 Intel', name_ar: '950 إنتل' },
    { day: 21, type: 'title', itemId: 'title_spy', icon: '🕵️', iconUrl: '', name_en: 'Mr. Spy Title', name_ar: 'لقب سيد جاسوس', special: true },
    { day: 22, type: 'currency', amount: 1000, icon: '🧠', iconUrl: '', name_en: '1000 Intel', name_ar: '1000 إنتل' },
    { day: 23, type: 'currency', amount: 1100, icon: '🧠', iconUrl: '', name_en: '1100 Intel', name_ar: '1100 إنتل' },
    { day: 24, type: 'currency', amount: 1200, icon: '🧠', iconUrl: '', name_en: '1200 Intel', name_ar: '1200 إنتل' },
    { day: 25, type: 'currency', amount: 1300, icon: '🧠', iconUrl: '', name_en: '1300 Intel', name_ar: '1300 إنتل' },
    { day: 26, type: 'currency', amount: 1400, icon: '🧠', iconUrl: '', name_en: '1400 Intel', name_ar: '1400 إنتل' },
    { day: 27, type: 'currency', amount: 1500, icon: '🧠', iconUrl: '', name_en: '1500 Intel', name_ar: '1500 إنتل' },
    { day: 28, type: 'badge', itemId: 'badge_pro', icon: '🏆', iconUrl: '', name_en: 'Pro Badge', name_ar: 'شارة محترف', special: true },
    { day: 29, type: 'currency', amount: 2500, icon: '🧠', iconUrl: '', name_en: '2500 Intel', name_ar: '2500 إنتل' },
    { day: 30, type: 'frame', itemId: 'frame_gold', icon: '👑', iconUrl: '', name_en: 'Gold Frame', name_ar: 'إطار ذهبي', special: true, final: true },
];

const LOGIN_REWARDS_CONFIG = {
    currentCycleStart: '2025-01',
    autoResetMonthly: true,
};

const checkLoginRewardsCycle = (userData) => {
    const config = LOGIN_REWARDS_CONFIG;
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (config.autoResetMonthly) {
        const cycleStartMonth = config.currentCycleStart;
        if (currentMonth !== cycleStartMonth) {
            LOGIN_REWARDS_CONFIG.currentCycleStart = currentMonth;
            return true;
        }
    }
    const lastClaimDate = userData?.loginRewards?.lastClaimDate?.toDate?.() || new Date(userData?.loginRewards?.lastClaimDate || 0);
    const lastClaimMonth = `${lastClaimDate.getFullYear()}-${String(lastClaimDate.getMonth() + 1).padStart(2, '0')}`;
    if (currentMonth !== lastClaimMonth && config.autoResetMonthly) return true;
    return false;
};

const getCurrentCycleMonth = () => LOGIN_REWARDS_CONFIG.currentCycleStart;

// ==========================================
// CHARISMA LEVELS - 21 Levels
// ==========================================
const CHARISMA_LEVELS = [
    { level: 1, threshold: 0, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/3mhcggzc/star3.png', name_en: 'Rising Star', name_ar: 'نجم صاعد', color: '#ffd700', badge_class: 'level-1-3' },
    { level: 2, threshold: 4000, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/k2Dk82C7/star2.png', name_en: 'Shining Star', name_ar: 'نجم ساطع', color: '#ffd700', badge_class: 'level-1-3' },
    { level: 3, threshold: 12000, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/Z1KXXLtZ/star1.png', name_en: 'Bright Star', name_ar: 'نجم مضيء', color: '#ffd700', badge_class: 'level-1-3' },
    { level: 4, threshold: 30000, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/k61VC46r/1d.png', name_en: 'Diamond I', name_ar: 'ماسة 1', color: '#3b82f6', badge_class: 'level-4-6' },
    { level: 5, threshold: 80000, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/Swdv3r1M/4d.png', name_en: 'Diamond II', name_ar: 'ماسة 2', color: '#3b82f6', badge_class: 'level-4-6' },
    { level: 6, threshold: 160000, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/qT7bpPd/2d.png', name_en: 'Diamond III', name_ar: 'ماسة 3', color: '#3b82f6', badge_class: 'level-4-6' },
    { level: 7, threshold: 300000, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/hJ2Hp3Cy/Crown1.png', name_en: 'Crown I', name_ar: 'تاج 1', color: '#ffd700', badge_class: 'level-7-9' },
    { level: 8, threshold: 500000, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/23GPzJtf/Crown2.png', name_en: 'Crown II', name_ar: 'تاج 2', color: '#ffd700', badge_class: 'level-7-9' },
    { level: 9, threshold: 1000000, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/nMVBQm81/Crown3.png', name_en: 'Crown III', name_ar: 'تاج 3', color: '#ffd700', badge_class: 'level-7-9' },
    { level: 10, threshold: 2000000, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/RkkYs5vG/Royal-Crown1.png', name_en: 'Royal Crown I', name_ar: 'تاج ملكي 1', color: '#f97316', badge_class: 'level-10-12' },
    { level: 11, threshold: 3500000, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/1tR926T8/Royal-Crown2.png', name_en: 'Royal Crown II', name_ar: 'تاج ملكي 2', color: '#f97316', badge_class: 'level-10-12' },
    { level: 12, threshold: 6000000, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/zWHtQjpd/Royal-Crown3.png', name_en: 'Royal Crown III', name_ar: 'تاج ملكي 3', color: '#f97316', badge_class: 'level-10-12' },
    { level: 13, threshold: 8500000, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/TMCmvV9R/Purple-Crown3.png', name_en: 'Purple Crown I', name_ar: 'تاج بنفسجي 1', color: '#8b5cf6', badge_class: 'level-13-15' },
    { level: 14, threshold: 12000000, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/jPGjKX2W/Purple-Crown1.png', name_en: 'Purple Crown II', name_ar: 'تاج بنفسجي 2', color: '#8b5cf6', badge_class: 'level-13-15' },
    { level: 15, threshold: 16000000, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/p6kc4FsB/Purple-Crown2.png', name_en: 'Purple Crown III', name_ar: 'تاج بنفسجي 3', color: '#8b5cf6', badge_class: 'level-13-15' },
    { level: 16, threshold: 26000000, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/HffPHNFB/Legend1.png', name_en: 'Legend I', name_ar: 'أسطورة 1', color: '#f97316', badge_class: 'level-16-21', hasGlow: true },
    { level: 17, threshold: 48000000, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/TxpvYhSs/Legend2.png', name_en: 'Legend II', name_ar: 'أسطورة 2', color: '#f97316', badge_class: 'level-16-21', hasGlow: true },
    { level: 18, threshold: 86000000, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/Xxq70xpH/Legend3.png', name_en: 'Legend III', name_ar: 'أسطورة 3', color: '#f97316', badge_class: 'level-16-21', hasGlow: true },
    { level: 19, threshold: 120000000, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/sfym0nX/Legend4.png', name_en: 'Legend IV', name_ar: 'أسطورة 4', color: '#f97316', badge_class: 'level-16-21', hasGlow: true },
    { level: 20, threshold: 240000000, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/zhVKzJ9P/Legend5.png', name_en: 'Legend V', name_ar: 'أسطورة 5', color: '#f97316', badge_class: 'level-16-21', hasGlow: true },
    { level: 21, threshold: 360000000, icon: '', iconType: 'image', iconUrl: 'https://i.ibb.co/xtJfj64X/max.png', name_en: 'Ultimate Legend', name_ar: 'الأسطورة المطلقة', color: '#ff0055', badge_class: 'level-16-21', isMaxLevel: true, hasGlow: true },
];

const getCharismaLevel = (charisma) => {
    let currentLevel = CHARISMA_LEVELS[0];
    let nextLevel = null;
    for (let i = CHARISMA_LEVELS.length - 1; i >= 0; i--) {
        if (charisma >= CHARISMA_LEVELS[i].threshold) {
            currentLevel = CHARISMA_LEVELS[i];
            nextLevel = CHARISMA_LEVELS[i + 1] || null;
            break;
        }
    }
    return { currentLevel, nextLevel };
};

const getCharismaProgress = (charisma) => {
    const { currentLevel, nextLevel } = getCharismaLevel(charisma);
    if (!nextLevel || currentLevel.isMaxLevel) return 100;
    const progress = ((charisma - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100;
    return Math.min(100, Math.max(0, progress));
};

// ==========================================
// SHOP ITEMS - GIFTS WITH BONUS (NO CASHBACK)
// ==========================================
const SHOP_ITEMS = {
    frames: [
        { id: 'frame_gold', name_en: "Gold Frame", name_ar: "إطار ذهبي", cost: 500, type: 'frames', preview: 'linear-gradient(45deg, #f7ff00, #db9700)' },
        { id: 'frame_neon', name_en: "Neon Frame", name_ar: "إطار نيون", cost: 300, type: 'frames', preview: 'linear-gradient(45deg, #00f2ff, #7000ff)' },
        { id: 'frame_fire', name_en: "Fire Frame", name_ar: "إطار نار", cost: 400, type: 'frames', preview: 'linear-gradient(45deg, #ff0055, #ff8800)' },
        { id: 'frame_img', name_en: "Image Frame", name_ar: "إطار صورة", cost: 100, type: 'frames', preview: 'https://i.ibb.co/mVQTLr2D/Untitled-3.png' },
        { id: 'frame_1', name_en: " Frame", name_ar: "إطار متحرك", cost: 0, type: 'frames', preview: 'https://i.ibb.co/4Rj8jzWS/0202.png' },
        { id: 'frame_rainbow', name_en: "Rainbow Frame", name_ar: "إطار قوس قزح", cost: 600, type: 'frames', preview: 'https://i.ibb.co/1tvtgmD8/ezgif-com-optimize.gif' },
        { id: 'frame_ice', name_en: "Ice Frame", name_ar: "إطار جليد", cost: 350, type: 'frames', preview: 'linear-gradient(45deg, #00d4ff, #ffffff, #00d4ff)' },
    ],
    titles: [
        { id: 'title_spy', name_en: "Mr. Spy", name_ar: "سيد جاسوس", cost: 600, type: 'titles', preview: '🕵️', imageUrl: '' },
        { id: 'title_hunter', name_en: "Hunter", name_ar: "صياد", cost: 450, type: 'titles', preview: '🎯', imageUrl: '' },
        { id: 'title_ghost', name_en: "Ghost", name_ar: "شبح", cost: 800, type: 'titles', preview: '👻', imageUrl: '' },
        { id: 'title_legend', name_en: "Legend", name_ar: "أسطورة", cost: 1500, type: 'titles', preview: '👑', imageUrl: '' },
        { id: 'title_pro', name_en: "Pro Player", name_ar: "محترف", cost: 1000, type: 'titles', preview: '⭐', imageUrl: '' },
        { id: 'title_shadow', name_en: "Shadow", name_ar: "ظل", cost: 700, type: 'titles', preview: '', imageUrl: 'https://i.ibb.co/xqk8md71/122222.png' },
    ],
    badges: [
        { id: 'badge_vip', name_en: "VIP Badge", name_ar: "شارة VIP", cost: 1000, type: 'badges', preview: '⭐', imageUrl: '' },
        { id: 'badge_love', name_en: "Love Badge", name_ar: "شارة حب", cost: 800, type: 'badges', preview: '💕', imageUrl: '' },
        { id: 'badge_pro', name_en: "Pro Badge", name_ar: "شارة محترف", cost: 1500, type: 'badges', preview: '🏆', imageUrl: '' },
        { id: 'badge_legend', name_en: "Legend Badge", name_ar: "شارة أسطورة", cost: 5000, type: 'badges', preview: '👑', imageUrl: '' },
        { id: 'badge_star', name_en: "Star Badge", name_ar: "شارة نجم", cost: 2000, type: 'badges', preview: '🌟', imageUrl: '' },
        { id: 'badge_fire', name_en: "Fire Badge", name_ar: "شارة نار", cost: 1200, type: 'badges', preview: '🔥', imageUrl: '' },
        { id: 'badge_ice', name_en: "Ice Badge", name_ar: "شارة جليد", cost: 1200, type: 'badges', preview: '❄️', imageUrl: '' },
        { id: 'badge_diamond', name_en: "Diamond Badge", name_ar: "شارة ماسة", cost: 3000, type: 'badges', preview: '', imageUrl: 'https://i.ibb.co/ZR2rv0s3/awaw.png' },
    ],
    themes: [
        { id: 'theme_dark', name_en: "Midnight", name_ar: "منتصف الليل", cost: 200, type: 'themes' },
        { id: 'theme_ocean', name_en: "Ocean Blue", name_ar: "أزرق محيطي", cost: 300, type: 'themes' },
    ],
    // ✅ GIFTS - WITH BONUS ONLY (NO CASHBACK FOR SENDER)
    gifts: [
        { id: 'gift_rose', name_en: "Rose", name_ar: "وردة", cost: 1, type: 'gifts', charisma: 10, minBonus: 1, maxBonus: 50, desc_ar: "عبّر عن مشاعرك", desc_en: "Express your feelings", emoji: "🌹", imageUrl: "" },
        { id: 'gift_candy', name_en: "Candy", name_ar: "حلوى", cost: 2, type: 'gifts', charisma: 20, minBonus: 1, maxBonus: 100, desc_ar: "حلاوة تُفرح القلب", desc_en: "Sweetness for the heart", emoji: "🍬", imageUrl: "" },
        { id: 'gift_cookie', name_en: "Cookie", name_ar: "بسكويت", cost: 3, type: 'gifts', charisma: 30, minBonus: 1, maxBonus: 150, desc_ar: "بسكويت لذيذ", desc_en: "Delicious cookie", emoji: "🍪", imageUrl: "" },
        { id: 'gift_chocolate', name_en: "Chocolate", name_ar: "شوكولاتة", cost: 5, type: 'gifts', charisma: 55, minBonus: 1, maxBonus: 250, desc_ar: "شوكولاتة فاخرة", desc_en: "Premium chocolate", emoji: "🍫", imageUrl: "" },
        { id: 'gift_icecream', name_en: "Ice Cream", name_ar: "آيس كريم", cost: 5, type: 'gifts', charisma: 55, minBonus: 1, maxBonus: 250, desc_ar: "برّد على قلبك", desc_en: "Cool down your heart", emoji: "🍦", imageUrl: "" },
        { id: 'gift_coffee', name_en: "Coffee", name_ar: "قهوة", cost: 8, type: 'gifts', charisma: 80, minBonus: 1, maxBonus: 400, desc_ar: "قهوة صباحية", desc_en: "Morning coffee", emoji: "☕", imageUrl: "" },
        { id: 'gift_heart', name_en: "Heart", name_ar: "قلب", cost: 10, type: 'gifts', charisma: 120, minBonus: 1, maxBonus: 500, desc_ar: "نبض الحب", desc_en: "Pulse of love", emoji: "❤️", imageUrl: "" },
        { id: 'gift_cake', name_en: "Cake", name_ar: "كيكة", cost: 15, type: 'gifts', charisma: 180, minBonus: 1, maxBonus: 750, desc_ar: "كيكة للاحتفال", desc_en: "Celebration cake", emoji: "🎂", imageUrl: "" },
        { id: 'gift_flower', name_en: "Bouquet", name_ar: "باقة ورد", cost: 20, type: 'gifts', charisma: 250, minBonus: 1, maxBonus: 1000, desc_ar: "باقة جميلة", desc_en: "Beautiful bouquet", emoji: "💐", imageUrl: "" },
        { id: 'gift_pizza', name_en: "Pizza", name_ar: "بيتزا", cost: 20, type: 'gifts', charisma: 250, minBonus: 1, maxBonus: 1000, desc_ar: "وليمة لذيذة", desc_en: "Delicious feast", emoji: "🍕", imageUrl: "" },
        { id: 'gift_burger', name_en: "Burger", name_ar: "برجر", cost: 25, type: 'gifts', charisma: 300, minBonus: 1, maxBonus: 1250, desc_ar: "برجر شهي", desc_en: "Juicy burger", emoji: "🍔", imageUrl: "" },
        { id: 'gift_teddy', name_en: "Teddy Bear", name_ar: "دب Teddy", cost: 30, type: 'gifts', charisma: 350, minBonus: 1, maxBonus: 1500, desc_ar: "دب قطني ناعم", desc_en: "Soft teddy bear", emoji: "🧸", imageUrl: "" },
        { id: 'gift_donut', name_en: "Donut", name_ar: "دونات", cost: 40, type: 'gifts', charisma: 450, minBonus: 1, maxBonus: 2000, desc_ar: "دونات محلاة", desc_en: "Glazed donut", emoji: "🍩", imageUrl: "" },
        { id: 'gift_star', name_en: "Star", name_ar: "نجمة", cost: 50, type: 'gifts', charisma: 600, minBonus: 1, maxBonus: 2500, desc_ar: "نجمة ساطعة", desc_en: "Shining star", emoji: "⭐", imageUrl: "" },
        { id: 'gift_gem', name_en: "Gem", name_ar: "جوهرة", cost: 75, type: 'gifts', charisma: 900, minBonus: 1, maxBonus: 3750, desc_ar: "جوهرة ثمينة", desc_en: "Precious gem", emoji: "💎", imageUrl: "" },
        { id: 'gift_crown', name_en: "Crown", name_ar: "تاج", cost: 80, type: 'gifts', charisma: 1000, minBonus: 1, maxBonus: 4000, desc_ar: "تاج ملكي", desc_en: "Royal crown", emoji: "👑", imageUrl: "" },
        { id: 'gift_trophy', name_en: "Trophy", name_ar: "كأس", cost: 100, type: 'gifts', charisma: 1200, minBonus: 1, maxBonus: 5000, desc_ar: "كأس الفوز", desc_en: "Victory trophy", emoji: "🏆", imageUrl: "" },
        { id: 'gift_ring', name_en: "Ring", name_ar: "خاتم", cost: 100, type: 'gifts', charisma: 1200, minBonus: 1, maxBonus: 5000, desc_ar: "خاتم الأناقة", desc_en: "Elegant ring", emoji: "💍", imageUrl: "" },
        { id: 'gift_rocket', name_en: "Rocket", name_ar: "صاروخ", cost: 150, type: 'gifts', charisma: 1800, minBonus: 1, maxBonus: 7500, desc_ar: "انطلق للنجوم", desc_en: "Launch to stars", emoji: "🚀", imageUrl: "" },
        { id: 'gift_robot', name_en: "Robot", name_ar: "روبوت", cost: 200, type: 'gifts', charisma: 2400, minBonus: 1, maxBonus: 10000, desc_ar: "روبوت ذكي", desc_en: "Smart robot", emoji: "🤖", imageUrl: "" },
        { id: 'gift_unicorn', name_en: "Unicorn", name_ar: "يونيكورن", cost: 250, type: 'gifts', charisma: 3200, minBonus: 1, maxBonus: 12000, desc_ar: "حصان سحري", desc_en: "Magical unicorn", emoji: "🦄", imageUrl: "" },
        { id: 'gift_motorbike', name_en: "Motorbike", name_ar: "موتوسيكل", cost: 250, type: 'gifts', charisma: 3200, minBonus: 1, maxBonus: 12000, desc_ar: "سرعة وكاريزما", desc_en: "Speed and charisma", emoji: "🏍️", imageUrl: "" },
        { id: 'gift_crystal', name_en: "Crystal", name_ar: "كريستال", cost: 300, type: 'gifts', charisma: 4000, minBonus: 1, maxBonus: 15000, desc_ar: "كريستال نادر", desc_en: "Rare crystal", emoji: "🔮", imageUrl: "" },
        { id: 'gift_racecar', name_en: "Race Car", name_ar: "سيارة سباق", cost: 500, type: 'gifts', charisma: 7000, minBonus: 1, maxBonus: 25000, desc_ar: "انطلق كالمحترفين", desc_en: "Race like a pro", emoji: "🏎️", imageUrl: "" },
        { id: 'gift_castle', name_en: "Castle", name_ar: "قصر", cost: 750, type: 'gifts', charisma: 10000, minBonus: 1, maxBonus: 37500, desc_ar: "قصر ملكي فخم", desc_en: "Luxury castle", emoji: "🏰", imageUrl: "" },
        { id: 'gift_yacht', name_en: "Yacht", name_ar: "يخت", cost: 1000, type: 'gifts', charisma: 15000, minBonus: 1, maxBonus: 50000, desc_ar: "فخامة الملوك", desc_en: "Royal luxury", emoji: "🛥️", imageUrl: "" },
        { id: 'gift_diamond', name_en: "Diamond", name_ar: "ماسة", cost: 1500, type: 'gifts', charisma: 20000, minBonus: 1, maxBonus: 75000, desc_ar: "ماسة نادرة", desc_en: "Rare diamond", emoji: "💠", imageUrl: "" },
        { id: 'gift_spaceship', name_en: "Spaceship", name_ar: "مركبة فضائية", cost: 2000, type: 'gifts', charisma: 30000, minBonus: 1, maxBonus: 100000, desc_ar: "استكشف الفضاء", desc_en: "Explore space", emoji: "🛸", imageUrl: "" },
        { id: 'gift_jet', name_en: "Private Jet", name_ar: "طائرة خاصة", cost: 5000, type: 'gifts', charisma: 85000, minBonus: 1, maxBonus: 120000, desc_ar: "حلّق في سماء الكاريزما", desc_en: "Soar in charisma skies", emoji: "✈️", imageUrl: "" },
        { id: 'gift_island', name_en: "Private Island", name_ar: "جزيرة خاصة", cost: 10000, type: 'gifts', charisma: 180000, minBonus: 1, maxBonus: 120000, desc_ar: "أمتلك عالمك الخاص", desc_en: "Own your world", emoji: "🏝️", imageUrl: "" },
        { id: 'gift_planet', name_en: "Planet", name_ar: "كوكب", cost: 10000, type: 'gifts', charisma: 200000, minBonus: 1, maxBonus: 120000, desc_ar: "كوكب خاص بك", desc_en: "Your own planet", emoji: "🪐", imageUrl: "" },
        { id: 'gift_galaxy', name_en: "Galaxy", name_ar: "مجرة", cost: 10000, type: 'gifts', charisma: 220000, minBonus: 1, maxBonus: 120000, desc_ar: "مجرة كاملة ملكك", desc_en: "Your own galaxy", emoji: "🌌", imageUrl: "" },
        { id: 'gift_dragon', name_en: "Dragon", name_ar: "تنين", cost: 10000, type: 'gifts', charisma: 210000, minBonus: 1, maxBonus: 120000, desc_ar: "تنين أسطوري", desc_en: "Legendary dragon", emoji: "🐉", imageUrl: "" },
        { id: 'gift_moon', name_en: "Moon", name_ar: "قمر", cost: 50000, type: 'gifts', charisma: 700000, minBonus: 1, maxBonus: 120000, desc_ar: "قمر خاص بك", desc_en: "Your own moon", emoji: "🌙", imageUrl: "" },
        { id: 'gift_sun', name_en: "Sun", name_ar: "شمس", cost: 50000, type: 'gifts', charisma: 750000, minBonus: 1, maxBonus: 120000, desc_ar: "شمس ساطعة", desc_en: "Shining sun", emoji: "☀️", imageUrl: "" },
        { id: 'gift_world', name_en: "World", name_ar: "عالم", cost: 100000, type: 'gifts', charisma: 1700000, minBonus: 1, maxBonus: 120000, desc_ar: "عالم كامل ملكك", desc_en: "Your own world", emoji: "🌍", imageUrl: "" },
        { id: 'gift_universe', name_en: "Universe", name_ar: "كون", cost: 100000, type: 'gifts', charisma: 1900000, minBonus: 1, maxBonus: 120000, desc_ar: "كون كامل ملكك", desc_en: "Your own universe", emoji: "🌌", imageUrl: "" },
        { id: 'gift_multiverse', name_en: "Multiverse", name_ar: "متعدد أكوان", cost: 150000, type: 'gifts', charisma: 2500000, minBonus: 1, maxBonus: 120000, desc_ar: "متعدد أكوان خاص", desc_en: "Your multiverse", emoji: "🪐", imageUrl: "" },
        { id: 'gift_ultimate', name_en: "Ultimate Gift", name_ar: "الهدية المطلقة", cost: 150000, type: 'gifts', charisma: 3500000, minBonus: 1, maxBonus: 120000, desc_ar: "أعظم هدية", desc_en: "The ultimate gift", emoji: "🏆", imageUrl: "" },
    ]
};

// ==========================================
// 🎨 GIFT RARITY SYSTEM
// ==========================================
const RARITY_CONFIG = {
    Common:    { name_en: 'Common',    name_ar: 'عادي',    color: '#9ca3af', bg: 'rgba(156,163,175,0.07)', border: 'rgba(156,163,175,0.25)', glow: false,  icon: '⚪', order: 0 },
    Epic:      { name_en: 'Epic',      name_ar: 'ملحمي',   color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)',  border: 'rgba(139,92,246,0.45)',  glow: false,  icon: '💜', order: 1 },
    Legendary: { name_en: 'Legendary', name_ar: 'أسطوري',  color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.50)',  glow: true,   icon: '⭐', order: 2 },
    Mythic:    { name_en: 'Mythic',    name_ar: 'خرافي',   color: '#ff0055', bg: 'rgba(255,0,85,0.12)',    border: 'rgba(255,0,85,0.60)',    glow: true,   icon: '🔮', order: 3, special: true },
};


const getItemRarity = (item) => {
    if (!item) return 'Common';
    if (item.rarity) return item.rarity;
    const cost = item.cost || 0;
    if (cost >= 5000) return 'Mythic';
    if (cost >= 500)  return 'Legendary';
    if (cost >= 100)  return 'Epic';
    return 'Common';
};

const getGiftRarity = (cost) => {
    if (cost >= 10000) return 'Mythic';
    if (cost >= 500)   return 'Legendary';
    if (cost >= 50)    return 'Epic';
    return 'Common';
};

// ==========================================
// 🏆 ACHIEVEMENTS SYSTEM
// ==========================================
const ACHIEVEMENTS = [
    // Gift Achievements
    { id: 'ach_first_gift', nameKey: 'achFirstGift', descKey: 'achFirstGiftDesc', icon: '🎁', imageUrl: '', condition: { type: 'gifts_received', value: 1 } },
    { id: 'ach_gift_collector', nameKey: 'achGiftCollector', descKey: 'achGiftCollectorDesc', icon: '💝', imageUrl: '', condition: { type: 'gifts_received', value: 10 } },
    { id: 'ach_gift_master', nameKey: 'achGiftMaster', descKey: 'achGiftMasterDesc', icon: '💎', imageUrl: '', condition: { type: 'gifts_received', value: 50 } },
    { id: 'ach_gift_legend', nameKey: 'achGiftLegend', descKey: 'achGiftLegendDesc', icon: '👑', imageUrl: '', condition: { type: 'gifts_received', value: 100 } },
    { id: 'ach_gift_king', nameKey: 'achGiftKing', descKey: 'achGiftKingDesc', icon: '🏆', imageUrl: '', condition: { type: 'gifts_received', value: 500 } },
    
    // Game Achievements
    { id: 'ach_first_win', nameKey: 'achFirstWin', descKey: 'achFirstWinDesc', icon: '🏆', imageUrl: '', condition: { type: 'wins', value: 1 } },
    { id: 'ach_veteran', nameKey: 'achVeteran', descKey: 'achVeteranDesc', icon: '🎖️', imageUrl: '', condition: { type: 'games_played', value: 10 } },
    { id: 'ach_pro', nameKey: 'achPro', descKey: 'achProDesc', icon: '⭐', imageUrl: '', condition: { type: 'games_played', value: 25 } },
    { id: 'ach_master', nameKey: 'achMaster', descKey: 'achMasterDesc', icon: '🌟', imageUrl: '', condition: { type: 'games_played', value: 50 } },
    { id: 'ach_legend_player', nameKey: 'achLegendPlayer', descKey: 'achLegendPlayerDesc', icon: '🏅', imageUrl: '', condition: { type: 'games_played', value: 100 } },
    { id: 'ach_win_streak_5', nameKey: 'achWinStreak5', descKey: 'achWinStreak5Desc', icon: '🔥', imageUrl: '', condition: { type: 'win_streak', value: 5 } },
    { id: 'ach_win_streak_10', nameKey: 'achWinStreak10', descKey: 'achWinStreak10Desc', icon: '💥', imageUrl: '', condition: { type: 'win_streak', value: 10 } },
    
    // Login Achievements
    { id: 'ach_week_streak', nameKey: 'achWeekStreak', descKey: 'achWeekStreakDesc', icon: '🔥', imageUrl: '', condition: { type: 'login_streak', value: 7 } },
    { id: 'ach_month_streak', nameKey: 'achMonthStreak', descKey: 'achMonthStreakDesc', icon: '📅', imageUrl: '', condition: { type: 'total_logins', value: 30 } },
    { id: 'ach_dedicated', nameKey: 'achDedicated', descKey: 'achDedicatedDesc', icon: '💎', imageUrl: '', condition: { type: 'total_logins', value: 100 } },
    
    // Role Achievements
    { id: 'ach_first_spy', nameKey: 'achFirstSpy', descKey: 'achFirstSpyDesc', icon: '🕵️', imageUrl: '', condition: { type: 'spy_wins', value: 1 } },
    { id: 'ach_spy_master', nameKey: 'achSpyMaster', descKey: 'achSpyMasterDesc', icon: '🥷', imageUrl: '', condition: { type: 'spy_wins', value: 10 } },
    { id: 'ach_spy_legend', nameKey: 'achSpyLegend', descKey: 'achSpyLegendDesc', icon: '👤', imageUrl: '', condition: { type: 'spy_wins', value: 25 } },
    { id: 'ach_agent_pro', nameKey: 'achAgentPro', descKey: 'achAgentProDesc', icon: '🤵', imageUrl: '', condition: { type: 'agent_wins', value: 10 } },
    { id: 'ach_agent_legend', nameKey: 'achAgentLegend', descKey: 'achAgentLegendDesc', icon: '🛡️', imageUrl: '', condition: { type: 'agent_wins', value: 25 } },
    
    // Social Achievements
    { id: 'ach_social', nameKey: 'achSocial', descKey: 'achSocialDesc', icon: '🦋', imageUrl: '', condition: { type: 'friends', value: 10 } },
    { id: 'ach_popular', nameKey: 'achPopular', descKey: 'achPopularDesc', icon: '⭐', imageUrl: '', condition: { type: 'friends', value: 25 } },
    { id: 'ach_generous', nameKey: 'achGenerous', descKey: 'achGenerousDesc', icon: '💌', imageUrl: '', condition: { type: 'gifts_sent', value: 10 } },
    { id: 'ach_santa', nameKey: 'achSanta', descKey: 'achSantaDesc', icon: '🎅', imageUrl: '', condition: { type: 'gifts_sent', value: 50 } },
    
    // Charisma Achievements
    { id: 'ach_charisma_10k', nameKey: 'achCharisma10k', descKey: 'achCharisma10kDesc', icon: '✨', imageUrl: '', condition: { type: 'charisma', value: 10000 } },
    { id: 'ach_charisma_100k', nameKey: 'achCharisma100k', descKey: 'achCharisma100kDesc', icon: '🌟', imageUrl: '', condition: { type: 'charisma', value: 100000 } },
    { id: 'ach_charisma_1m', nameKey: 'achCharisma1m', descKey: 'achCharisma1mDesc', icon: '💫', imageUrl: '', condition: { type: 'charisma', value: 1000000 } },
];

// --- Scenarios ---
const SCENARIOS = [ 
    { loc_ar: "محطة فضاء", words_ar: ["فضاء", "صاروخ", "zero-g", "قمر"], loc_en: "Space Station", words_en: ["Space", "Rocket", "Zero-g", "Moon"] }, 
    { loc_ar: "غواصة نووية", words_ar: ["عمق", "ماء", "ضغط", "سونار"], loc_en: "Nuclear Submarine", words_en: ["Depth", "Water", "Pressure", "Sonar"] }, 
    { loc_ar: "قصر ملكي", words_ar: ["تاج", "حراس", "عروش", "خدم"], loc_en: "Royal Palace", words_en: ["Crown", "Guards", "Throne", "Servants"] }, 
    { loc_ar: "بنك مركزي", words_ar: ["خزنة", "مال", "رصاص", "مفتاح"], loc_en: "Central Bank", words_en: ["Vault", "Money", "Lead", "Key"] }, 
    { loc_ar: "مستشفى مهجور", words_ar: ["أشباح", "أطباء", "ظلام", "حقن"], loc_en: "Abandoned Hospital", words_en: ["Ghosts", "Doctors", "Dark", "Syringe"] }, 
    { loc_ar: "قطار ليلي", words_ar: ["درجات", "تذاكر", "نوم", "ممر"], loc_en: "Night Train", words_en: ["Bunks", "Tickets", "Sleep", "Aisle"] }, 
    { loc_ar: "جزيرة كنز", words_ar: ["خريطة", "حفر", "ذهب", "قراصنة"], loc_en: "Treasure Island", words_en: ["Map", "Dig", "Gold", "Pirates"] }, 
    { loc_ar: "مصنع روبوتات", words_ar: ["أسلاك", "صيانة", "برمجة", "معادن"], loc_en: "Robot Factory", words_en: ["Wires", "Maintenance", "Coding", "Metal"] } 
];

// ==========================================
// EMOJI CATEGORIES FOR PROFESSIONAL PICKER
// ==========================================
const EMOJI_CATEGORIES = {
    smiles: ['😀', '😂', '😍', '🤔', '😎', '🤫', '😡', '🤢', '😴', '🤯', '😤', '🥺', '😱', '🤬', '💀', '👻', '👾', '🤖', '💩', '😈'],
    gestures: ['👁️', '🧠', '🦷', '🦴', '👀', '👊', '✌️', '🤞', '🤟', '👌', '🤙', '👈', '👉', '☝️', '👆', '👇', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏'],
    hearts: ['💪', '❤️', '💔', '💕', '💖', '💗', '💘', '💝', '💞', '💟', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎'],
    objects: ['🔥', '⭐', '🌟', '✨', '💫', '🎉', '🎊', '🎁', '🎈', '🎀', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🎮', '🎲', '🎯', '🎵', '🎶', '🎤', '🎧', '📷', '💻', '📱', '💰', '💵', '💎', '👑', '🎩'],
    nature: ['🚀', '✈️', '🛸', '🌹', '🌸', '🌺', '🌻', '🌼', '🌷', '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃']
};

const EMOJI_LIST = Object.values(EMOJI_CATEGORIES).flat();

// --- Helper Functions ---
const generateUID = () => Math.floor(100000 + Math.random() * 900000).toString();
const calculateLevel = (xp) => Math.floor(xp / 100) + 1;
const getChatId = (id1, id2) => [id1, id2].sort().join('_');
const formatTime = (timestamp) => { if (!timestamp) return ''; const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp); return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
const formatDate = (timestamp) => { if (!timestamp) return ''; const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp); return date.toLocaleDateString(); };
const formatCharisma = (num) => { if (num === undefined || num === null) return '0'; if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'; if (num >= 1000) return (num / 1000).toFixed(1) + 'K'; return num.toString(); };
const maskEmail = (email) => { if (!email) return 'N/A'; const [localPart, domain] = email.split('@'); if (!domain) return email; const visibleChars = Math.min(2, localPart.length); return localPart.substring(0, visibleChars) + '***@' + domain; };
const generateRandomBonus = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- Translations ---
const TRANSLATIONS = { 
    en: { 
        appName: "PRO SPY", tagline: "COVERT ARENA", nickname: "OPERATOR NAME", create: "CREATE GAME", join: "JOIN OPS", browse: "BROWSE ROOMS", players: "OPERATIVES", start: "LAUNCH MISSION", langBtn: "العربية", loading: "PROCESSING...", you: "YOU", statusSpy: "SPY", statusAgent: "AGENT", statusInformant: "INFORMANT", statusMrWhite: "MR. WHITE", statusGhost: "GHOST", round: "ROUND", skip: "SKIP TURN", vote: "VOTE TO EJECT", chatPlaceholder: "Type message...", send: "SEND", waiting: "Awaiting host...", location: "LOCATION", spectator: "SPECTATOR", confirm: "CONFIRM VOTE", spyWin: "SPY WINS!", agentsWin: "AGENTS WIN!", mrWhiteWin: "MR. WHITE WINS!", playAgain: "PLAY AGAIN", connecting: "Connecting...", startVoting: "START VOTING", votingStarted: "VOTING INITIATED", voteRequestTitle: "VOTING REQUEST", voteRequestDesc: "wants to start voting.", agree: "AGREE", decline: "DECLINE", endVoting: "END VOTING NOW", votesTitle: "VOTES:", roundsFormat: (c, m) => `ROUND ${c}/${m}`, wordSelectionTitle: "SELECT KEYWORD", wordSelectionDesc: "Choose a keyword for this round", finishSelection: "FINISH SELECTION", selectedWord: "Selected Keyword", loginGoogle: "Login with Google", myAccount: "Profile", logout: "Logout", profile: "Profile", guest: "Guest", linkGuessCard: "GUESS MY CARD", level: "Level", wins: "Wins", losses: "Losses", winRate: "Win Rate", totalGames: "Games", achievements: "Achievements", id: "ID", enterCodeError: "Please enter a room code.", changeName: "Change Name", nameChangeLimit: "Once a month", copied: "Copied!", save: "Save", or: "OR", needPlayers: "Minimum players not met!", ok: "OK", tabLobby: "Lobby", tabLeaderboard: "Leaderboard", tabFriends: "Friends", addFriend: "Add Friend", friendIdPlaceholder: "Enter Friend ID", online: "Online", offline: "Offline", noFriends: "No friends yet.", friendAdded: "Friend Added!", friendNotFound: "User not found.", requestSent: "Request Sent!", incomingRequests: "Incoming Requests", noRequests: "No pending requests.", accept: "Accept", reject: "Reject", sendMessage: "Send", inviteBtn: "Invite", invitedYou: "invited you to play.", joinInvite: "Join?", inviteFriends: "Invite Friends", accountInfo: "Account Information", email: "Email", memberSince: "Member Since", nameChangeCountdown: "Name Change In", canChangeNow: "Can change now!", selectEmoji: "Emoji", guestTitle: "GUEST ACCOUNT", guestDesc: "Register to save progress and add friends.", kd: "K/D Ratio", stats: "Stats", noPermission: "Feature unavailable for guests.", normalMode: "NORMAL MODE", advancedMode: "ADVANCED MODE (6+)", modeNormalDesc: "Classic Spy vs Agents. 3-10 Players.", modeAdvDesc: "Special Roles included! 6-10 Players.", privateRoom: "Private Room", password: "Password", publicRoom: "Public Room", noRooms: "No active games found.", lobbyTitle: "GAME LOBBY", mrWhiteInstruction: "Guess the location to win!", informantInstruction: "You know a neighbor!", ghostInstruction: "You are now a Ghost. You can watch but cannot act.", guessLocation: "GUESS LOCATION", leaveRoom: "LEAVE", closeRoom: "CLOSE ROOM", showPassword: "Show Password", guestAccountLabel: "GUEST ACCOUNT", guestProfileMsg: "Guests cannot receive friend requests.", reportUser: "Report User", reportSent: "Report sent successfully!", reportTitle: "Report User", reportDesc: "Please select a reason for reporting this user.", reportReasonAbusive: "Abusive Behavior", reportReasonCheating: "Cheating", reportReasonSpam: "Spam", reportReasonOther: "Other", reportSubmit: "Submit Report", reportCancel: "Cancel", privateRoomError: "Private rooms require a password.",
        shop: "Shop", currency: "Intel", buy: "Buy", owned: "Owned", equip: "Equip", equipped: "Equipped", unequip: "UnEquip", inventory: "Inventory", frames: "Frames", titles: "Titles", themes: "Themes", badges: "Badges", purchaseSuccess: "Purchase Successful!", purchaseFail: "Not enough Intel!", alreadyOwned: "Already Owned",
        tutorialTitle: "Welcome, Agent", tutorialStep1: "Your goal is to find the Spy (or blend in if you are the Spy).", tutorialStep2: "Each round, discuss and vote to eject a suspect.", tutorialStep3: "Win matches to earn Intel and buy items in the Shop!", skipTutorial: "Skip", next: "Next", startGame: "Start Game",
        matchSummary: "Match Summary", matchDuration: "Duration", mvp: "MVP", correctVotes: "Correct Votes", summaryTitle: "Game Over!",
        notifTitle: "Notification", achUnlock: "Achievement Unlocked!", newFriend: "New Friend Added!", hiddenAch: "Hidden Achievement", tabMain: "Main", tabInv: "Inventory", tabAch: "Achievements",
        charisma: "Charisma", charismaDesc: "Your influence in the arena", gifts: "Gifts", sendGift: "Send Gift", giftSent: "Gift Sent!", giftReceived: "You received a gift!", selectGift: "Select a Gift", giftPreview: "Gift Preview", bonus: "Bonus", willReceive: "Receiver gets", charismaGain: "Charisma Gain", playerLeft: "Player Left", spyLeftAgentsWin: "Spy left! Agents Win!", agentLeftSpyWins: "Agent left! Spy Wins!", myGifts: "My Gifts", receivedGifts: "Received Gifts", noGifts: "No gifts yet.", fromPlayer: "From", toPlayer: "To", buyGift: "Buy Gift", sendToFriend: "Send to Friend",
        notifications: "Notifications", clearAll: "Clear All", noNotifications: "No notifications", friendRequest: "sent you a friend request", friendRequestAccepted: "accepted your friend request", giftNotification: "sent you a gift", messageNotification: "sent you a message", nextLevel: "Next level", close: "Close",
        sendTo: "Send to", noFriendsToSend: "No friends to send gifts to.", selectFriend: "Select a friend", myInventory: "My Inventory", maxLevel: "MAX LEVEL",
        privateChat: "Private Chat", typeMessage: "Type a message...", noMessages: "No messages yet.", codePlaceholder: "CODE",
        luckyBonus: "Lucky Bonus", luckBonus: "Bonus", loginRequired: "Login Required",
        showEmail: "Show", hideEmail: "Hide", accountType: "Account Type", googleAccount: "Google Account", guestAccount: "Guest Account",
        playAsGuest: "Play as Guest", continueAsGuest: "Continue as Guest", sendGiftToFriend: "Send Gift", giftCharisma: "Charisma", giftBonusRange: "Bonus",
        loginRewards: "Login Rewards", dailyStreak: "Day Streak", claimReward: "Claim Reward", alreadyClaimed: "Claimed Today", comeBackTomorrow: "Come back tomorrow!", days: "Days",
        sendToSelf: "Send to Myself", sendToOthers: "Send to Others",
        copyCode: "Copy Code", codeCopied: "Code Copied!", showPasswordLabel: "Show Password", hidePasswordLabel: "Hide Password",
        newCycleStarted: "New monthly cycle started!",
        giftLog: "Received Gifts", giftLogEmpty: "No gifts received yet.", viewAll: "View All", collapse: "Collapse",
        selectEmojis: "Select Emoji", recentEmojis: "Recent", allEmojis: "All",
        sentAGift: "sent a gift",
        giftWall: "Gift Wall", giftBadge: "Gift Badge", comingSoon: "Coming Soon", receivedGiftsCount: "received gifts",
        // Settings & Block
        settings: "Settings", blockUser: "Block User", unblock: "Unblock", blockedUsers: "Blocked Users", noBlockedUsers: "No blocked users.", blockSuccess: "User blocked!", unblockSuccess: "User unblocked!",
        // Sound
        sound: "Sound", soundOn: "ON", soundOff: "OFF",
        // Charisma Rank
        charismaRank: "Charisma Rank", topCharisma: "Top Charisma", rank: "Rank", firstPlace: "1st", secondPlace: "2nd", thirdPlace: "3rd",
        // Achievements
        achievementUnlocked: "Achievement Unlocked!", achievementProgress: "Progress", howToUnlock: "How to unlock", achievementsList: "Achievements",
        achFirstGift: "First Gift", achFirstGiftDesc: "Receive your first gift",
        achGiftCollector: "Gift Collector", achGiftCollectorDesc: "Receive 10 gifts",
        achGiftMaster: "Gift Master", achGiftMasterDesc: "Receive 50 gifts",
        achGiftLegend: "Gift Legend", achGiftLegendDesc: "Receive 100 gifts",
        achFirstWin: "First Victory", achFirstWinDesc: "Win your first game",
        achVeteran: "Veteran", achVeteranDesc: "Play 10 games",
        achPro: "Pro Player", achProDesc: "Play 25 games",
        achMaster: "Game Master", achMasterDesc: "Play 50 games",
        achWeekStreak: "Week Warrior", achWeekStreakDesc: "Login 7 days in a row",
        achMonthStreak: "Dedicated", achMonthStreakDesc: "Login 30 days total",
        achFirstSpy: "Sneaky Spy", achFirstSpyDesc: "Win as the Spy",
        achSpyMaster: "Spy Master", achSpyMasterDesc: "Win 10 times as Spy",
        achAgentPro: "Agent Pro", achAgentProDesc: "Win 10 times as Agent",
        achSocial: "Social Butterfly", achSocialDesc: "Add 10 friends",
        achGenerous: "Generous", achGenerousDesc: "Send 10 gifts",
        // New Achievements
        achGiftKing: "Gift King", achGiftKingDesc: "Receive 500 gifts",
        achLegendPlayer: "Legend Player", achLegendPlayerDesc: "Play 100 games",
        achWinStreak5: "Hot Streak", achWinStreak5Desc: "Win 5 games in a row",
        achWinStreak10: "Unstoppable", achWinStreak10Desc: "Win 10 games in a row",
        achDedicated: "Dedicated", achDedicatedDesc: "Login 100 days total",
        achSpyLegend: "Spy Legend", achSpyLegendDesc: "Win 25 times as Spy",
        achAgentLegend: "Agent Legend", achAgentLegendDesc: "Win 25 times as Agent",
        achPopular: "Popular", achPopularDesc: "Add 25 friends",
        achSanta: "Santa", achSantaDesc: "Send 50 gifts",
        achCharisma10k: "Rising Star", achCharisma10kDesc: "Reach 10,000 charisma",
        achCharisma100k: "Charisma Master", achCharisma100kDesc: "Reach 100,000 charisma",
        achCharisma1m: "Charisma Legend", achCharisma1mDesc: "Reach 1,000,000 charisma",
    }, 
    ar: { 
        appName: "برو جاسوس", tagline: "ساحة العمليات", nickname: "اسم العميل", create: "إنشاء لعبة", join: "انضمام", browse: "استعراض الغرف", players: "العملاء", start: "بدء المهمة", langBtn: "English", loading: "جاري التحميل...", you: "أنت", statusSpy: "جاسوس", statusAgent: "عميل", statusInformant: "المخبر", statusMrWhite: "السيد", statusGhost: "شبح", round: "الجولة", skip: "تخطي الدور", vote: "تصويت للطرد", chatPlaceholder: "اكتب رسالة...", send: "إرسال", waiting: "بانتظار المضيف...", location: "الموقع", spectator: "مشاهد", confirm: "تأكيد التصويت", spyWin: "فاز الجاسوس!", agentsWin: "فاز العملاء!", mrWhiteWin: "فاز السيد!", playAgain: "لعب مجدداً", connecting: "جاري التأمين...", startVoting: "بدء التصويت", votingStarted: "بدأ التصويت", voteRequestTitle: "طلب تصويت", voteRequestDesc: "يريد بدء التصويت.", agree: "موافق", decline: "رفض", endVoting: "إنهاء التصويت الآن", votesTitle: "الأصوات:", roundsFormat: (c, m) => `الجولة ${c}/${m}`, wordSelectionTitle: "اختر كلمة السر", wordSelectionDesc: "اختر كلمة سر لهذه الجولة", finishSelection: "إنهاء الاختيار", selectedWord: "كلمة السر", loginGoogle: "تسجيل بواسطة جوجل", myAccount: "بروفايل", logout: "تسجيل الخروج", profile: "الملف الشخصي", guest: "زائر", linkGuessCard: "خمن كرتي", level: "المستوى", wins: "فوز", losses: "خسارة", winRate: "نسبة الفوز", totalGames: "المباريات", achievements: "الإنجازات", id: "الرقم", enterCodeError: "برجاء إدخال كود الغرفة.", changeName: "تغيير الاسم", nameChangeLimit: "مرة شهرياً", copied: "تم النسخ!", save: "حفظ", or: "أو", needPlayers: "اللاعبين غير كافيين!", ok: "حسناً", tabLobby: "الرئيسية", tabLeaderboard: "المتصدرين", tabFriends: "الأصدقاء", addFriend: "أضافة صديق", friendIdPlaceholder: "أدخل ID الصديق", online: "متصل", offline: "غير متصل", noFriends: "لا يوجد أصدقاء.", friendAdded: "تمت الإضافة!", friendNotFound: "المستخدم غير موجود.", requestSent: "تم إرسال الطلب!", incomingRequests: "طلبات الصداقة", noRequests: "لا توجد طلبات.", accept: "قبول", reject: "رفض", sendMessage: "إرسال", inviteBtn: "دعوة", invitedYou: "دعاك للعب.", joinInvite: "انضمام؟", inviteFriends: "دعوة أصدقاء", accountInfo: "معلومات الحساب", email: "البريد الإلكتروني", memberSince: "عضو منذ", nameChangeCountdown: "تغيير الاسم بعد", canChangeNow: "يمكن التغيير الآن!", selectEmoji: "إيموجي", guestTitle: "حساب زائر", guestDesc: "سجل لحفظ تقدمك وإضافة أصدقاء.", kd: "نسبة الـ KD", stats: "الإحصائيات", noPermission: "غير متاح للزوار.", normalMode: "الوضع العادي", advancedMode: "الوضع المتقدم (6+)", modeNormalDesc: "جاسوس ضد عملاء. 3-10 لاعبين.", modeAdvDesc: "أدوار خاصة! 6-10 لاعبين.", privateRoom: "غرفة خاصة", password: "كلمة السر", publicRoom: "غرفة عامة", noRooms: "لا توجد ألعاب نشطة.", lobbyTitle: "غرفة الانتظار", mrWhiteInstruction: "خمن المكان لتفوز!", informantInstruction: "تعرف على جارك!", ghostInstruction: "أنت الآن شبح. يمكنك المشاهدة فقط.", guessLocation: "خمن المكان", leaveRoom: "خروج", closeRoom: "إغلاق الغرفة", showPassword: "إظهار الباسورد", guestAccountLabel: "حساب زائر", guestProfileMsg: "لا يمكن إرسال طلبات صداقة للحسابات الزائرة.", reportUser: "إبلاغ عن المستخدم", reportSent: "تم إرسال البلاغ بنجاح!", reportTitle: "الإبلاغ عن مستخدم", reportDesc: "برجاء اختيار سبب الإبلاغ.", reportReasonAbusive: "سلوك مسيء", reportReasonCheating: "غش", reportReasonSpam: "بريد مزعج", reportReasonOther: "سبب آخر", reportSubmit: "إرسال البلاغ", reportCancel: "إلغاء", privateRoomError: "الغرف الخاصة تتطلب كلمة سر!",
        shop: "المتجر", currency: "إنتل", buy: "شراء", owned: "مملوك", equip: "تزيين", equipped: "مُزين", unequip: "إزالة", inventory: "المخزون", frames: "إطارات", titles: "ألقاب", themes: "سمات", badges: "شارات", purchaseSuccess: "تم الشراء!", purchaseFail: "لا تملك إنتل كافي!", alreadyOwned: "مملوك مسبقاً",
        tutorialTitle: "مرحباً أيها العميل", tutorialStep1: "هدفك هو العثور على الجاسوس (أو التخفي إن كنت الجاسوس).", tutorialStep2: "في كل جولة، ناقش وصوّت لطرد المشتبه به.", tutorialStep3: "اربح المباريات لتحصل على إنتل واشتري من المتجر!", skipTutorial: "تخطي", next: "التالي", startGame: "ابدأ اللعبة",
        matchSummary: "ملخص المباراة", matchDuration: "المدة", mvp: "الأفضل", correctVotes: "أصوات صحيحة", summaryTitle: "انتهت اللعبة!",
        notifTitle: "إشعار", achUnlock: "تم فتح إنجاز!", newFriend: "صديق جديد!", hiddenAch: "إنجاز سري", tabMain: "الرئيسية", tabInv: "المخزون", tabAch: "الإنجازات",
        charisma: "الكاريزما", charismaDesc: "تأثيرك في الساحة", gifts: "الهدايا", sendGift: "إرسال هدية", giftSent: "تم إرسال الهدية!", giftReceived: "لقد استلمت هدية!", selectGift: "اختر هدية", giftPreview: "معاينة الهدية", bonus: "بونص", willReceive: "سيستقبل", charismaGain: "زيادة الكاريزما", playerLeft: "لاعب غادر", spyLeftAgentsWin: "الجاسوس غادر! فاز العملاء!", agentLeftSpyWins: "عميل غادر! فاز الجاسوس!", myGifts: "هداياي", receivedGifts: "الهدايا المستلمة", noGifts: "لا توجد هدايا بعد.", fromPlayer: "من", toPlayer: "إلى", buyGift: "شراء هدية", sendToFriend: "إرسال لصديق",
        notifications: "الإشعارات", clearAll: "حذف الكل", noNotifications: "لا توجد إشعارات", friendRequest: "أرسل لك طلب صداقة", friendRequestAccepted: "قبل طلب صداقتك", giftNotification: "أرسل لك هدية", messageNotification: "أرسل لك رسالة", nextLevel: "المستوى التالي", close: "إغلاق",
        sendTo: "إرسال إلى", noFriendsToSend: "لا يوجد أصدقاء لإرسال الهدايا.", selectFriend: "اختر صديق", myInventory: "مخزوني", maxLevel: "المستوى الأقصى",
        privateChat: "محادثة خاصة", typeMessage: "اكتب رسالة...", noMessages: "لا توجد رسائل بعد.", codePlaceholder: "كود",
        luckyBonus: "بونص محظوظ", luckBonus: "بونص", loginRequired: "تسجيل الدخول مطلوب",
        showEmail: "إظهار", hideEmail: "إخفاء", accountType: "نوع الحساب", googleAccount: "حساب جوجل", guestAccount: "حساب زائر",
        playAsGuest: "العب كزائر", continueAsGuest: "المتابعة كزائر", sendGiftToFriend: "إرسال هدية", giftCharisma: "كاريزما", giftBonusRange: "بونص",
        loginRewards: "مكافآت تسجيل الدخول", dailyStreak: "يوم متتالي", claimReward: "الحصول على المكافأة", alreadyClaimed: "تم الاستلام اليوم", comeBackTomorrow: "عد غداً!", days: "أيام",
        sendToSelf: "إرسال لنفسي", sendToOthers: "إرسال للآخرين",
        copyCode: "نسخ الكود", codeCopied: "تم نسخ الكود!", showPasswordLabel: "إظهار كلمة السر", hidePasswordLabel: "إخفاء كلمة السر",
        newCycleStarted: "بدأت دورة شهرية جديدة!",
        giftLog: "الهدايا المستلمة", giftLogEmpty: "لا توجد هدايا مستلمة بعد.", viewAll: "عرض الكل", collapse: "طي",
        selectEmojis: "اختر إيموجي", recentEmojis: "الأخيرة", allEmojis: "الكل",
        sentAGift: "أرسل هدية",
        giftWall: "جدار الهدايا", giftBadge: "شارة الهدايا", comingSoon: "قريباً", receivedGiftsCount: "هدية مستلمة",
        // Settings & Block
        settings: "الإعدادات", blockUser: "حظر المستخدم", unblock: "إلغاء الحظر", blockedUsers: "المحظورين", noBlockedUsers: "لا يوجد مستخدمين محظورين.", blockSuccess: "تم حظر المستخدم!", unblockSuccess: "تم إلغاء الحظر!",
        // Sound
        sound: "الصوت", soundOn: "تشغيل", soundOff: "كتم",
        achFirstGift: "أول هدية", achFirstGiftDesc: "استقبل هديتك الأولى",
        achGiftCollector: "جامع الهدايا", achGiftCollectorDesc: "استقبل 10 هدايا",
        achGiftMaster: "سيد الهدايا", achGiftMasterDesc: "استقبل 50 هدية",
        achGiftLegend: "أسطورة الهدايا", achGiftLegendDesc: "استقبل 100 هدية",
        achFirstWin: "أول انتصار", achFirstWinDesc: "افوز بأول لعبة",
        achVeteran: "مخضرم", achVeteranDesc: "العب 10 ألعاب",
        achPro: "لاعب محترف", achProDesc: "العب 25 لعبة",
        achMaster: "سيد اللعبة", achMasterDesc: "العب 50 لعبة",
        achWeekStreak: "محارب الأسبوع", achWeekStreakDesc: "سجل دخول 7 أيام متتالية",
        achMonthStreak: "مخلص", achMonthStreakDesc: "سجل دخول 30 يوم",
        achFirstSpy: "جاسوس متخفي", achFirstSpyDesc: "افوز كجاسوس",
        achSpyMaster: "سيد الجاسوسية", achSpyMasterDesc: "افوز 10 مرات كجاسوس",
        achAgentPro: "عميل محترف", achAgentProDesc: "افوز 10 مرات كعميل",
        achSocial: "فراشة اجتماعية", achSocialDesc: "أضف 10 أصدقاء",
        achGenerous: "كريم", achGenerousDesc: "أرسل 10 هدايا",
        // New Achievements Arabic
        achGiftKing: "ملك الهدايا", achGiftKingDesc: "استقبل 500 هدية",
        achLegendPlayer: "لاعب أسطورة", achLegendPlayerDesc: "العب 100 لعبة",
        achWinStreak5: "سلسلة حارة", achWinStreak5Desc: "افوز 5 ألعاب متتالية",
        achWinStreak10: "لا يُقهر", achWinStreak10Desc: "افوز 10 ألعاب متتالية",
        achDedicated: "مخلص", achDedicatedDesc: "سجل دخول 100 يوم",
        achSpyLegend: "أسطورة الجاسوسية", achSpyLegendDesc: "افوز 25 مرة كجاسوس",
        achAgentLegend: "أسطورة العملاء", achAgentLegendDesc: "افوز 25 مرة كعميل",
        achPopular: "مشهور", achPopularDesc: "أضف 25 صديق",
        achSanta: "بابا نويل", achSantaDesc: "أرسل 50 هدية",
        achCharisma10k: "نجم صاعد", achCharisma10kDesc: "اصل إلى 10,000 كاريزما",
        achCharisma100k: "سيد الكاريزما", achCharisma100kDesc: "اصل إلى 100,000 كاريزما",
        achCharisma1m: "أسطورة الكاريزما", achCharisma1mDesc: "اصل إلى 1,000,000 كاريزما",
    } 
};

// ==========================================
// UI COMPONENTS
// ==========================================

// Error Boundary
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) { console.error('Error caught:', error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="glass-panel rounded-xl p-6 text-center max-w-md">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
                        <p className="text-sm text-gray-400 mb-4">Please refresh the page</p>
                        <button onClick={() => window.location.reload()} className="btn-neon px-6 py-2 rounded-lg">Refresh</button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// Guest Banner
const GuestBanner = ({ lang }) => { 
    const t = TRANSLATIONS[lang]; 
    return ( <div className="guest-banner"> <h3 className="guest-banner-title">{t.guestTitle}</h3> <p className="guest-banner-desc">{t.guestDesc}</p> </div> ); 
};

// Notification Toast
const NotificationToast = ({ message, onClose }) => {
    useEffect(() => { if (message) { const timer = setTimeout(() => { onClose(); }, 2500); return () => clearTimeout(timer); } }, [message, onClose]);
    if(!message) return null;
    return (
        <div className="notification-toast">
            <div className="notification-content">
                <span className="notification-icon">🎉</span>
                <span className="notification-text">{message}</span>
                <button onClick={onClose} className="notification-close">&times;</button>
            </div>
        </div>
    );
};

// Modal Close Button
const ModalCloseBtn = ({ onClose }) => (<button onClick={onClose} className="modal-close-btn" aria-label="Close">&times;</button>);

// Charisma Display
const CharismaDisplay = ({ charisma, lang, showDetails = true }) => {
    const t = TRANSLATIONS[lang];
    const { currentLevel, nextLevel } = getCharismaLevel(charisma || 0);
    const progress = getCharismaProgress(charisma || 0);
    const neededForNext = nextLevel ? nextLevel.threshold - (charisma || 0) : 0;
    const isMaxLevel = currentLevel.isMaxLevel;
    const hasGlow = currentLevel.hasGlow;
    
    const renderIcon = () => {
        if (currentLevel.iconType === 'image' && currentLevel.iconUrl) {
            return <img src={currentLevel.iconUrl} alt="level" className={`w-5 h-5 ${hasGlow ? 'animate-pulse' : ''}`} style={hasGlow ? {filter: 'drop-shadow(0 0 8px #ff6600)'} : {}} />;
        }
        return <span className="charisma-icon">{currentLevel.icon}</span>;
    };
    
    return (
        <div className={`charisma-container ${hasGlow ? 'has-glow' : ''}`}>
            <div className="charisma-header">
                <span className="charisma-label">{renderIcon()}{t.charisma}</span>
                <span className={`charisma-level-badge ${currentLevel.badge_class} ${hasGlow ? 'glow-badge' : ''}`} style={hasGlow ? {boxShadow: '0 0 15px ' + currentLevel.color} : {}}>{renderIcon()} Lv.{currentLevel.level}</span>
            </div>
            <div className="charisma-bar-bg"><div className="charisma-bar-fill" style={{ width: `${progress}%` }}></div></div>
            <div className="charisma-info">
                <span className="charisma-current">{formatCharisma(charisma || 0)}</span>
                {isMaxLevel ? <span className="charisma-next text-yellow-400 font-bold">{t.maxLevel}</span> : nextLevel && showDetails && <span className="charisma-next">{t.nextLevel}: {formatCharisma(neededForNext)}</span>}
            </div>
        </div>
    );
};

// K/D Circle
const KDCircle = ({ wins, losses, lang }) => { 
    const t = TRANSLATIONS[lang]; 
    const total = wins + losses; 
    const ratio = total > 0 ? wins / total : 0; 
    const percentage = Math.round(ratio * 100); 
    const size = 100; const strokeWidth = 6; 
    const radius = (size - strokeWidth) / 2; 
    const circumference = 2 * Math.PI * radius; 
    const offset = circumference - (ratio * circumference); 
    return ( 
        <div className="kd-circle-container" style={{ width: size, height: size }}> 
            <svg width={size} height={size}> 
                <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="var(--secondary)" /><stop offset="100%" stopColor="var(--primary)" /></linearGradient></defs> 
                <circle className="kd-circle-bg" cx={size/2} cy={size/2} r={radius} /> 
                <circle className="kd-circle-progress" cx={size/2} cy={size/2} r={radius} strokeDasharray={circumference} strokeDashoffset={offset} /> 
            </svg> 
            <div className="kd-text"><span className="kd-rate">{percentage}%</span><span className="kd-label">{t.winRate}</span></div>
        </div> 
    ); 
};

// Avatar With Frame
const AvatarWithFrame = ({ photoURL, equipped, size = 'md', onClick }) => {
    const sizeConfig = { sm: { wrapper: 52, avatar: 30, mask: 32 }, md: { wrapper: 72, avatar: 40, mask: 42 }, lg: { wrapper: 110, avatar: 60, mask: 62 }, xl: { wrapper: 140, avatar: 80, mask: 82 } };
    const config = sizeConfig[size] || sizeConfig.md;
    const frameItem = SHOP_ITEMS.frames.find(f => f.id === equipped?.frames);
    
    const renderFrame = () => {
        if (!frameItem) return null;
        if (frameItem.preview.startsWith('http')) {
            return (<div style={{ position: 'absolute', top: 0, left: 0, width: config.wrapper + 'px', height: config.wrapper + 'px', borderRadius: '50%', overflow: 'hidden', zIndex: 1 }}><img src={frameItem.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="frame" /><div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: config.mask + 'px', height: config.mask + 'px', borderRadius: '50%', background: 'var(--bg-dark)' }} /></div>);
        }
        return (<div style={{ position: 'absolute', top: 0, left: 0, width: config.wrapper + 'px', height: config.wrapper + 'px', borderRadius: '50%', background: frameItem.preview, zIndex: 1 }}><div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: config.mask + 'px', height: config.mask + 'px', borderRadius: '50%', background: 'var(--bg-dark)' }} /></div>);
    };
    
    return (
        <div style={{ position: 'relative', width: config.wrapper + 'px', height: config.wrapper + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: onClick ? 'pointer' : 'default', flexShrink: 0 }} onClick={onClick}>
            {renderFrame()}
            <img src={photoURL || `https://ui-avatars.com/api/?name=User&background=random`} style={{ width: config.avatar + 'px', height: config.avatar + 'px', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, border: '2px solid rgba(0,0,0,0.5)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} alt="avatar" />
        </div>
    );
};

// Render Title
const renderTitle = (titleId, lang) => {
    const titleItem = SHOP_ITEMS.titles.find(t => t.id === titleId);
    if (!titleItem) return null;
    if (titleItem.imageUrl && titleItem.imageUrl.trim() !== '') return <div className="profile-title-image"><img src={titleItem.imageUrl} alt={titleItem.name_en} /></div>;
    const name = lang === 'ar' ? titleItem.name_ar : titleItem.name_en;
    return <div className="profile-title-text"><span>{titleItem.preview}</span><span>{name}</span></div>;
};

// Render Badges
const renderBadges = (badgeIds, size = 28) => {
    if (!badgeIds) return null;
    const badgeArray = Array.isArray(badgeIds) ? badgeIds : [badgeIds];
    return (
        <div className="profile-badge-container">
            {badgeArray.slice(0, MAX_BADGES).map((badgeId, index) => {
                const badgeItem = SHOP_ITEMS.badges.find(b => b.id === badgeId);
                if (!badgeItem) return null;
                if (badgeItem.imageUrl && badgeItem.imageUrl.trim() !== '') return <img key={index} src={badgeItem.imageUrl} alt={badgeItem.name_en} className="profile-badge-img" style={{ width: size + 'px', height: size + 'px' }} />;
                return <span key={index} className="profile-badge" style={{ fontSize: size + 'px' }}>{badgeItem.preview}</span>;
            })}
        </div>
    );
};

// Notification Dropdown
const NotificationDropdown = ({ show, onClose, notifications, onMarkRead, onClearAll, onNotificationClick, lang }) => {
    const t = TRANSLATIONS[lang];
    if (!show) return null;
    const unreadCount = notifications.filter(n => !n.read).length;
    const getNotificationIcon = (type) => { switch(type) { case 'friend_request': return '👥'; case 'gift': return '🎁'; case 'message': return '💬'; case 'friend_request_accepted': return '✅'; case 'achievement': return '🏆'; default: return '🔔'; } };
    
    return (
        <div className="notification-dropdown animate-pop">
            <div className="notification-dropdown-header">
                <span className="notification-dropdown-title">{t.notifications} {unreadCount > 0 && `(${unreadCount})`}</span>
                {notifications.length > 0 && <button onClick={onClearAll} className="notification-clear-all">{t.clearAll}</button>}
            </div>
            <div className="notification-list">
                {notifications.length === 0 ? <div className="notification-empty"><div className="text-3xl mb-2">🔔</div><p>{t.noNotifications}</p></div> : notifications.map(notif => (
                    <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`} onClick={() => { onMarkRead(notif.id); onNotificationClick(notif); onClose(); }}>
                        <span className="notification-item-icon">{getNotificationIcon(notif.type)}</span>
                        <div className="notification-item-content">
                            <div className="notification-item-title">{notif.fromName || 'System'}</div>
                            <div className="notification-item-message">{notif.message}</div>
                            <div className="notification-item-time">{formatTime(notif.timestamp)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ==========================================
// 🎁 GIFT LOG COMPONENT - REDESIGNED WITH 3 TABS
// ==========================================
const GiftLog = ({ show, onClose, targetUID, lang, onOpenProfile, isOwnProfile }) => {
    const t = TRANSLATIONS[lang];
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('wall'); // 'wall', 'badge', 'received'
    const [giftCounts, setGiftCounts] = useState({});
    const [lastSenders, setLastSenders] = useState({});
    const [totalGifts, setTotalGifts] = useState(0);
    const [rotatingGiftIndex, setRotatingGiftIndex] = useState(0);
    
    // Fetch gifts without orderBy to avoid index requirement
    useEffect(() => {
        if (!show || !targetUID) return;
        setLoading(true);
        
        const unsub = giftsLogCollection
            .where('receiverId', '==', targetUID)
            .limit(50)
            .onSnapshot(snap => {
                const giftsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Sort in memory instead of query
                giftsData.sort((a, b) => {
                    const timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds || 0;
                    const timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds || 0;
                    return timeB - timeA;
                });
                setGifts(giftsData);
                setTotalGifts(giftsData.length);
                
                // Calculate gift counts and last senders
                const counts = {};
                const senders = {};
                giftsData.forEach(gift => {
                    const giftId = gift.giftId;
                    counts[giftId] = (counts[giftId] || 0) + 1;
                    if (!senders[giftId]) {
                        senders[giftId] = {
                            name: gift.senderName,
                            photo: gift.senderPhoto,
                            uid: gift.senderId
                        };
                    }
                });
                setGiftCounts(counts);
                setLastSenders(senders);
                setLoading(false);
            }, error => {
                console.error('Gift log error:', error);
                setLoading(false);
            });
        
        return unsub;
    }, [show, targetUID]);
    
    // Auto-rotate gifts in the mini display
    useEffect(() => {
        if (gifts.length === 0) return;
        const interval = setInterval(() => {
            setRotatingGiftIndex(prev => (prev + 1) % Math.min(3, gifts.length));
        }, 2000);
        return () => clearInterval(interval);
    }, [gifts.length]);
    
    if (!show) return null;
    
    // Get last 3 gifts for mini display
    const lastThreeGifts = gifts.slice(0, 3);
    
    // Get unique gifts for Gift Wall
    const uniqueGifts = SHOP_ITEMS.gifts.map(gift => ({
        ...gift,
        count: giftCounts[gift.id] || 0,
        lastSender: lastSenders[gift.id] || null,
        received: giftCounts[gift.id] > 0
    }));
    
    return (
        <div className="gift-log-container-v2">
            {/* Mini Gift Display - Shows rotating gifts */}
            <div className="gift-mini-display" onClick={() => setActiveTab('wall')}>
                <div className="gift-mini-images">
                    {lastThreeGifts.length > 0 ? (
                        lastThreeGifts.map((gift, idx) => (
                            <div 
                                key={gift.id} 
                                className={`gift-mini-item ${idx === rotatingGiftIndex && lastThreeGifts.length > 1 ? 'active' : ''}`}
                            >
                                {gift.giftImageUrl ? (
                                    <img src={gift.giftImageUrl} alt={gift.giftName} className="gift-mini-img" />
                                ) : (
                                    <span className="gift-mini-emoji">{gift.giftEmoji}</span>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="gift-mini-empty">🎁</div>
                    )}
                </div>
                <div className="gift-mini-info">
                    <span className="gift-mini-count">{totalGifts}</span>
                    <span className="gift-mini-label">{t.receivedGiftsCount}</span>
                </div>
            </div>
            
            {/* Tab Buttons */}
            <div className="gift-log-tabs">
                <button 
                    className={`gift-log-tab ${activeTab === 'wall' ? 'active' : ''}`}
                    onClick={() => setActiveTab('wall')}
                >
                    🎁 {t.giftWall}
                </button>
                <button 
                    className={`gift-log-tab ${activeTab === 'badge' ? 'active' : ''}`}
                    onClick={() => setActiveTab('badge')}
                >
                    🏅 {t.giftBadge}
                </button>
                <button 
                    className={`gift-log-tab ${activeTab === 'received' ? 'active' : ''}`}
                    onClick={() => setActiveTab('received')}
                >
                    📬 {t.giftLog}
                </button>
            </div>
            
            {/* Tab Content */}
            <div className="gift-log-content">
                {loading ? (
                    <div className="gift-log-loading">{t.loading}</div>
                ) : activeTab === 'wall' ? (
                    /* GIFT WALL - All gifts with received indicator */
                    <div className="gift-wall-grid">
                        {uniqueGifts.map(gift => (
                            <div 
                                key={gift.id} 
                                className={`gift-wall-item ${gift.received ? 'received' : 'not-received'}`}
                                onClick={() => gift.lastSender && onOpenProfile && onOpenProfile(gift.lastSender.uid)}
                            >
                                {gift.imageUrl ? (
                                    <img src={gift.imageUrl} alt={gift.name_en} className="gift-wall-img" />
                                ) : (
                                    <span className="gift-wall-emoji">{gift.emoji}</span>
                                )}
                                {gift.received && (
                                    <>
                                        <span className="gift-wall-count">×{gift.count}</span>
                                        {gift.lastSender && (
                                            <img 
                                                src={gift.lastSender.photo || `https://ui-avatars.com/api/?name=${gift.lastSender.name}&background=random`}
                                                alt={gift.lastSender.name}
                                                className="gift-wall-sender"
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'badge' ? (
                    /* GIFT BADGE - Coming Soon */
                    <div className="gift-badge-section">
                        <div className="coming-soon-badge">
                            <span className="coming-soon-icon">🏅</span>
                            <span className="coming-soon-text">{t.comingSoon}</span>
                        </div>
                    </div>
                ) : (
                    /* RECEIVED GIFTS - Last 10 */
                    <div className="gift-log-list">
                        {gifts.length === 0 ? (
                            <div className="gift-log-empty">{t.giftLogEmpty}</div>
                        ) : (
                            gifts.slice(0, 10).map(gift => (
                                <div 
                                    key={gift.id} 
                                    className="gift-log-item"
                                    onClick={() => onOpenProfile && onOpenProfile(gift.senderId)}
                                >
                                    <img 
                                        src={gift.senderPhoto || `https://ui-avatars.com/api/?name=${gift.senderName}&background=random`} 
                                        alt={gift.senderName} 
                                        className="gift-log-item-avatar"
                                    />
                                    <div className="gift-log-item-content">
                                        <div className="gift-log-item-sender">{gift.senderName}</div>
                                        <div className="gift-log-item-details">
                                            {gift.giftImageUrl ? (
                                                <img src={gift.giftImageUrl} alt={gift.giftName} className="gift-log-item-img" />
                                            ) : (
                                                <span className="gift-log-item-emoji">{gift.giftEmoji}</span>
                                            )}
                                            <span className="gift-log-item-name">{lang === 'ar' ? gift.giftNameAr : gift.giftNameEn}</span>
                                        </div>
                                    </div>
                                    <div className="gift-log-item-stats">
                                        <span className="gift-log-item-charisma">+{formatCharisma(gift.charisma)}</span>
                                        {gift.bonus > 0 && <span className="gift-log-item-bonus">+{gift.bonus} 💰</span>}
                                        <span className="gift-log-item-time">{formatTime(gift.timestamp)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ==========================================
// 🏆 ACHIEVEMENTS DISPLAY COMPONENT
// ==========================================
const AchievementsDisplay = ({ userData, lang, showAll = false }) => {
    const t = TRANSLATIONS[lang];
    const [selectedAch, setSelectedAch] = useState(null);
    
    const userAchievements = userData?.achievements || [];
    const stats = userData?.stats || {};
    const gamesPlayed = (stats.wins || 0) + (stats.losses || 0);
    const giftsReceived = userData?.giftsReceived || 0;
    const giftsSent = userData?.giftsSent || 0;
    const friendsCount = userData?.friends?.length || 0;
    const loginStreak = userData?.loginRewards?.streak || 0;
    const totalLogins = userData?.loginRewards?.totalClaims || 0;
    const spyWins = userData?.spyWins || 0;
    const agentWins = userData?.agentWins || 0;
    
    const getProgress = (achievement) => {
        const type = achievement.condition.type;
        const target = achievement.condition.value;
        let current = 0;
        
        switch (type) {
            case 'gifts_received': current = giftsReceived; break;
            case 'gifts_sent': current = giftsSent; break;
            case 'wins': current = stats.wins || 0; break;
            case 'games_played': current = gamesPlayed; break;
            case 'login_streak': current = loginStreak; break;
            case 'total_logins': current = totalLogins; break;
            case 'friends': current = friendsCount; break;
            case 'spy_wins': current = spyWins; break;
            case 'agent_wins': current = agentWins; break;
        }
        
        return { current, target, percent: Math.min(100, (current / target) * 100) };
    };
    
    const isUnlocked = (achievement) => userAchievements.includes(achievement.id);
    
    const displayAchievements = showAll ? ACHIEVEMENTS : ACHIEVEMENTS.slice(0, 6);
    
    return (
        <div className="achievements-container">
            <div className="achievements-grid">
                {displayAchievements.map(ach => {
                    const unlocked = isUnlocked(ach);
                    const progress = getProgress(ach);
                    
                    return (
                        <div
                            key={ach.id}
                            className={`achievement-item ${unlocked ? 'unlocked' : 'locked'}`}
                            onClick={() => setSelectedAch(ach)}
                        >
                            {ach.imageUrl ? (
                                <img src={ach.imageUrl} alt={t[ach.nameKey]} className="achievement-icon-img" />
                            ) : (
                                <span className="achievement-icon">{ach.icon}</span>
                            )}
                            {unlocked && <span className="achievement-badge">✓</span>}
                            {!unlocked && progress.current > 0 && (
                                <div className="achievement-progress-mini">
                                    <div 
                                        className="achievement-progress-fill"
                                        style={{ width: `${progress.percent}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* Achievement Detail Modal */}
            {selectedAch && (
                <div className="modal-overlay" onClick={() => setSelectedAch(null)}>
                    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '320px' }}>
                        <div className="modal-body text-center py-4">
                            <div className="text-4xl mb-3">
                                {selectedAch.imageUrl ? (
                                    <img src={selectedAch.imageUrl} alt={t[selectedAch.nameKey]} className="w-16 h-16 mx-auto" />
                                ) : selectedAch.icon}
                            </div>
                            <h3 className="font-bold text-lg mb-1">{t[selectedAch.nameKey]}</h3>
                            <p className="text-sm text-gray-400 mb-3">{t[selectedAch.descKey]}</p>
                            
                            {!isUnlocked(selectedAch) && (
                                <div className="achievement-progress-bar">
                                    <div className="achievement-progress-text">
                                        {t.achievementProgress}: {getProgress(selectedAch).current}/{getProgress(selectedAch).target}
                                    </div>
                                    <div className="achievement-progress-track">
                                        <div
                                            className="achievement-progress-fill-bar"
                                            style={{ width: `${getProgress(selectedAch).percent}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {isUnlocked(selectedAch) && (
                                <div className="text-green-400 font-bold">✓ {t.achievementUnlocked}</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==========================================
// 🎨 PROFESSIONAL EMOJI PICKER - NEW
// ==========================================
const EmojiPicker = ({ show, onClose, onSelect, lang, inline = false }) => {
    const t = TRANSLATIONS[lang];
    const [activeCategory, setActiveCategory] = useState('smiles');
    
    if (!show) return null;
    
    const categories = [
        { id: 'smiles',   icon: '😀', label_ar: 'وجوه',   label_en: 'Faces' },
        { id: 'gestures', icon: '👋', label_ar: 'إيماءات', label_en: 'Gestures' },
        { id: 'hearts',   icon: '❤️', label_ar: 'قلوب',   label_en: 'Hearts' },
        { id: 'objects',  icon: '🎉', label_ar: 'أشياء',   label_en: 'Objects' },
        { id: 'nature',   icon: '🌸', label_ar: 'طبيعة',  label_en: 'Nature' },
    ];

    const wrapperStyle = inline ? {} : undefined;
    
    return (
        <div className={inline ? '' : 'emoji-picker-modal animate-slide-up'} style={wrapperStyle}>
            {!inline && (
                <div className="emoji-picker-header">
                    <span className="emoji-picker-title">{t.selectEmojis || 'Emoji'}</span>
                    <button className="emoji-picker-close" onClick={onClose}>✕</button>
                </div>
            )}
            <div className="emoji-categories" style={{marginBottom:'6px'}}>
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        className={`emoji-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                        title={lang==='ar'?cat.label_ar:cat.label_en}
                    >
                        {cat.icon}
                    </button>
                ))}
            </div>
            <div className="emoji-picker-grid">
                {(EMOJI_CATEGORIES[activeCategory] || []).map((emoji, i) => (
                    <button 
                        key={i} 
                        className="emoji-picker-item" 
                        onClick={() => { onSelect(emoji); }}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
            <div className="emoji-categories">
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        className={`emoji-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                        title={cat.label}
                    >
                        {cat.icon}
                    </button>
                ))}
            </div>
        </div>
    );
};

// ==========================================
// 🎁 GIFT PREVIEW MODAL - IMPROVED
// Shows details for both sender and receiver
// ==========================================
const GiftPreviewModal = ({ show, onClose, gift, lang, onBuy, currency, isSending = false, isFromInventory = false, onSendFromInventory, friendsData, sendToSelf = false, currentUserData, user, directTarget = null }) => { 
    const t = TRANSLATIONS[lang]; 
    const [showFriendSelect, setShowFriendSelect] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [sendMode, setSendMode] = useState(directTarget ? 'direct' : 'self');
    const [previewBonus, setPreviewBonus] = useState(0);
    const isGiftItem = gift?.type === 'gifts';
    
    useEffect(() => {
        if (show && gift) {
            setSelectedFriend(directTarget || null);
            setSendMode(directTarget ? 'direct' : 'self');
            setShowFriendSelect(false);
            // Generate preview bonus
            if (gift.minBonus && gift.maxBonus) {
                setPreviewBonus(generateRandomBonus(gift.minBonus, gift.maxBonus));
            }
        }
    }, [show, gift, directTarget]);
    
    if(!show || !gift) return null; 
    
    const renderGiftIcon = () => {
        if (gift.type === 'frames') { return gift.preview.startsWith('http') ? <img src={gift.preview} alt={gift.name_en} className="w-14 h-14 rounded-full object-cover mx-auto" /> : <div className="w-14 h-14 rounded-full mx-auto" style={{ background: gift.preview }}></div>; }
        if (gift.type === 'badges') { return gift.imageUrl ? <img src={gift.imageUrl} alt={gift.name_en} className="w-12 h-12 object-contain mx-auto" /> : <div className="text-4xl mb-2">{gift.preview}</div>; }
        if (gift.type === 'titles') { return gift.imageUrl ? <img src={gift.imageUrl} alt={gift.name_en} className="h-8 object-contain mx-auto" /> : <div className="text-3xl mb-2">{gift.preview}</div>; }
        return gift.imageUrl ? <img src={gift.imageUrl} alt={gift.name_en} className="w-12 h-12 object-contain mx-auto" /> : <div className="text-4xl mb-2">{gift.emoji}</div>;
    };
    
    const handleSendFromInventory = () => {
        if (!onSendFromInventory) return;
        if (directTarget) {
            onSendFromInventory(gift, directTarget);
            onClose();
        } else if (sendMode === 'self') {
            onSendFromInventory(gift, { uid: user?.uid || 'self', displayName: currentUserData?.displayName || 'Me', photoURL: currentUserData?.photoURL });
            onClose();
        } else if (selectedFriend) {
            onSendFromInventory(gift, selectedFriend);
            onClose();
        }
    };
    
    const handleBuy = () => {
        if (!onBuy) return;
        if (directTarget) {
            onBuy(gift, directTarget);
        } else if (sendMode === 'self') {
            onBuy(gift, { uid: 'self', displayName: currentUserData?.displayName || 'Me' });
        } else if (selectedFriend) {
            onBuy(gift, selectedFriend);
        }
    };
    
    return ( 
        <div className="modal-overlay" onClick={onClose}> 
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '340px' }}>
                <div className="modal-header"><h2 className="modal-title">{isGiftItem ? t.giftPreview : (lang === 'ar' ? gift.name_ar : gift.name_en)}</h2><ModalCloseBtn onClose={onClose} /></div>
                <div className="modal-body text-center py-3">
                    {renderGiftIcon()}
                    <h3 className="text-base font-bold text-white mb-1">{lang === 'ar' ? gift.name_ar : gift.name_en}</h3> 
                    {isGiftItem && (gift.desc_ar || gift.desc_en) && <p className="text-[10px] text-gray-400 mb-2">{lang === 'ar' ? gift.desc_ar : gift.desc_en}</p>}
                    
                    {isGiftItem && (
                        <div className="gift-preview-details">
                            <div className="gift-preview-stat">
                                <div className="gift-preview-stat-label">{t.giftCharisma}</div>
                                <div className="gift-preview-stat-value charisma">+{formatCharisma(gift.charisma)}</div>
                            </div>
                            <div className="gift-preview-stat">
                                <div className="gift-preview-stat-label">{t.luckyBonus}</div>
                                <div className="gift-preview-stat-value bonus">+{previewBonus} 🧠</div>
                            </div>
                        </div>
                    )}
                    
                    {/* Show target info if direct target */}
                    {directTarget && (
                        <div className="flex items-center gap-2 mb-2 p-2 bg-yellow-500/10 rounded-lg">
                            <AvatarWithFrame photoURL={directTarget.photoURL} equipped={directTarget.equipped} size="sm" />
                            <div className="text-left">
                                <div className="font-bold text-xs">{lang === 'ar' ? 'إرسال إلى' : 'Sending to'}</div>
                                <div className="text-[10px] text-primary">{directTarget.displayName}</div>
                            </div>
                        </div>
                    )}
                    
                    {/* Only show self/others toggle if no direct target */}
                    {isGiftItem && !directTarget && (
                        <div className="flex gap-1 mb-2">
                            <button 
                                onClick={() => setSendMode('self')} 
                                className={`flex-1 py-1.5 rounded text-[10px] font-bold transition ${sendMode === 'self' ? 'bg-primary text-black' : 'bg-white/10 text-white'}`}
                            >
                                🎁 {t.sendToSelf}
                            </button>
                            <button 
                                onClick={() => { setSendMode('others'); setShowFriendSelect(true); }} 
                                className={`flex-1 py-1.5 rounded text-[10px] font-bold transition ${sendMode === 'others' ? 'bg-primary text-black' : 'bg-white/10 text-white'}`}
                            >
                                👥 {t.sendToOthers}
                            </button>
                        </div>
                    )}
                    
                    {sendMode === 'others' && showFriendSelect && !directTarget && (
                        <div className="friend-select-list">
                            <div className="text-[10px] text-gray-400 p-2 border-b border-white/5">{t.selectFriend}</div>
                            {friendsData && friendsData.length > 0 ? (
                                friendsData.map(friend => (
                                    <div 
                                        key={friend.id} 
                                        onClick={() => setSelectedFriend(friend)} 
                                        className={`friend-select-item ${selectedFriend?.id === friend.id ? 'selected' : ''}`}
                                    >
                                        <AvatarWithFrame photoURL={friend.photoURL} equipped={friend.equipped} size="sm" />
                                        <div className="friend-select-info">
                                            <div className="friend-select-name">{friend.displayName}</div>
                                            <div className={`friend-select-status ${friend.isOnline ? 'online' : ''}`}>
                                                {friend.isOnline ? t.online : t.offline}
                                            </div>
                                        </div>
                                        {selectedFriend?.id === friend.id && <span className="text-primary">✓</span>}
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 text-center text-gray-400 text-xs">{t.noFriendsToSend}</div>
                            )}
                        </div>
                    )}
                </div>
                <div className="modal-footer py-2">
                    {isFromInventory ? (
                        <div className="flex gap-2">
                            <button onClick={onClose} className="btn-ghost flex-1 py-1.5 rounded text-xs">{t.close}</button>
                            <button 
                                onClick={handleSendFromInventory} 
                                disabled={!directTarget && sendMode === 'others' && !selectedFriend}
                                className={`flex-1 py-1.5 rounded text-xs font-bold ${!directTarget && sendMode === 'others' && !selectedFriend ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'btn-gold'}`}
                            >
                                {t.sendGift}
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={onClose} className="btn-ghost flex-1 py-1.5 rounded text-xs">{t.reportCancel}</button> 
                            <button 
                                onClick={handleBuy} 
                                disabled={currency < gift.cost || (!directTarget && sendMode === 'others' && !selectedFriend && isGiftItem)} 
                                className={`flex-1 py-1.5 rounded text-xs font-bold ${currency >= gift.cost ? 'btn-gold' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                            >
                                {isSending || directTarget ? t.sendGift : t.buy} ({gift.cost}🧠)
                            </button> 
                        </div>
                    )}
                </div>
            </div>
        </div> 
    ); 
};

// ==========================================
// 🎁 SEND GIFT MODAL - IMPROVED WITH DIRECT TARGET
// ==========================================
const SendGiftModal = ({ show, onClose, targetUser, currentUser, lang, onSendGift, currency, friendsData }) => { 
    const t = TRANSLATIONS[lang]; 
    const [selectedGift, setSelectedGift] = useState(null); 
    const [showPreview, setShowPreview] = useState(false);
    
    if(!show) return null; 
    
    // Determine if we have a direct target (from profile)
    const hasDirectTarget = targetUser && targetUser.uid !== 'self';
    
    return ( 
        <> 
            <div className="modal-overlay" onClick={onClose}> 
                <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                    <div className="modal-header"><h2 className="modal-title">{t.sendGift}</h2><ModalCloseBtn onClose={onClose} /></div> 
                    <div className="modal-body py-3">
                        {hasDirectTarget && (
                            <div className="flex items-center gap-2 mb-2 p-1.5 bg-white/5 rounded"> 
                                <AvatarWithFrame photoURL={targetUser.photoURL} equipped={targetUser.equipped} size="sm" />
                                <div><div className="font-bold text-xs">{targetUser.displayName}</div><div className="text-[9px] text-gray-400">{t.charisma}: {formatCharisma(targetUser.charisma || 0)}</div></div> 
                            </div> 
                        )}
                        <div className="flex items-center gap-2 mb-2 text-[10px] text-yellow-400"><span>🧠 {currency} {CURRENCY_NAME}</span></div> 
                        <div className="grid grid-cols-5 gap-1 max-h-[180px] overflow-y-auto">
                            {SHOP_ITEMS.gifts.map(gift => {
                                const rKey = getGiftRarity(gift.cost);
                                const rarity = RARITY_CONFIG[rKey];
                                return (
                                    <button key={gift.id} onClick={() => { setSelectedGift(gift); setShowPreview(true); }} disabled={currency < gift.cost}
                                        className="flex flex-col items-center p-1 rounded transition"
                                        style={{ border: `1.5px solid ${currency >= gift.cost ? rarity.border : 'rgba(255,255,255,0.05)'}`, background: currency >= gift.cost ? rarity.bg : 'transparent', opacity: currency < gift.cost ? 0.4 : 1, cursor: currency < gift.cost ? 'not-allowed' : 'pointer', position: 'relative' }}
                                    >
                                        <span style={{fontSize:'18px'}}>{gift.emoji}</span>
                                        <span style={{fontSize:'8px', fontWeight:'bold', color: rarity.color}}>{lang === 'ar' ? rarity.name_ar : rarity.name_en}</span>
                                        <span style={{fontSize:'9px', fontWeight:'bold', color:'#facc15'}}>{gift.cost}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div> 
                </div> 
            </div> 
            <GiftPreviewModal 
                show={showPreview} 
                onClose={() => setShowPreview(false)} 
                gift={selectedGift} 
                lang={lang} 
                onBuy={(gift, target) => { onSendGift(gift, target); onClose(); }} 
                currency={currency} 
                isSending={true} 
                directTarget={hasDirectTarget ? targetUser : null}
                friendsData={friendsData}
                user={{ uid: currentUser?.uid }}
                currentUserData={currentUser}
            /> 
        </> 
    ); 
};

// ==========================================
// 🛒 SHOP MODAL
// ==========================================
const ShopModal = ({ show, onClose, userData, lang, onPurchase, onEquip, onUnequip }) => {
    const t = TRANSLATIONS[lang];
    const [activeTab, setActiveTab] = useState('frames');
    const [selectedItem, setSelectedItem] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    
    if (!show) return null;
    
    const currency = userData?.currency || 0;
    const inventory = userData?.inventory || { frames: [], titles: [], themes: [], badges: [], gifts: [] };
    const equipped = userData?.equipped || {};
    
    const isOwned = (item) => inventory[item.type]?.includes(item.id);
    const isEquipped = (item) => { if (item.type === 'badges') { const eb = equipped.badges || []; return Array.isArray(eb) ? eb.includes(item.id) : equipped.badges === item.id; } return equipped[item.type] === item.id; };
    const getEquippedBadgeCount = () => { const eb = equipped.badges || []; return Array.isArray(eb) ? eb.length : (equipped.badges ? 1 : 0); };
    
    const renderPreview = (item) => {
        if (item.type === 'frames') return item.preview.startsWith('http') ? <img src={item.preview} alt={item.name_en} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full" style={{ background: item.preview }}></div>;
        if (item.type === 'badges') return item.imageUrl ? <img src={item.imageUrl} alt={item.name_en} className="w-8 h-8 object-contain" /> : <span className="text-2xl">{item.preview}</span>;
        if (item.type === 'titles') return item.imageUrl ? <img src={item.imageUrl} alt={item.name_en} className="w-6 h-6 object-contain" /> : <span className="text-xl">{item.preview}</span>;
        if (item.type === 'gifts') return item.imageUrl ? <img src={item.imageUrl} alt={item.name_en} className="w-8 h-8 object-contain" /> : <span className="text-2xl">{item.emoji}</span>;
        return <span className="text-xl">🎨</span>;
    };
    
    const tabs = ['frames', 'titles', 'badges', 'gifts'];
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', maxHeight: '85vh' }}>
                <div className="modal-header">
                    <h2 className="modal-title">{t.shop}</h2>
                    <div className="flex items-center gap-2"><span className="text-yellow-400 font-bold text-xs">🧠 {currency.toLocaleString()}</span><ModalCloseBtn onClose={onClose} /></div>
                </div>
                <div className="modal-body" style={{ padding: '8px' }}>
                    <div className="shop-tabs-container" style={{ margin: '4px', marginBottom: 0 }}>{tabs.map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`shop-tab ${activeTab === tab ? 'active' : ''}`}>{t[tab]}</button>)}</div>
                    <div className="p-2">
                        <div className="inventory-grid">
                            {SHOP_ITEMS[activeTab]?.map(item => {
                                const owned = isOwned(item);
                                const equippedItem = isEquipped(item);
                                if (activeTab === 'gifts') {
                                    const rKey = getGiftRarity(item.cost);
                                    const rarity = RARITY_CONFIG[rKey];
                                    return (
                                        <div key={item.id} className="gift-card" onClick={() => { setSelectedItem(item); setShowPreview(true); }}
                                            style={{ border: `1.5px solid ${rarity.border}`, background: rarity.bg, boxShadow: rarity.glow && rKey === 'Mythic' ? `0 0 14px rgba(255,0,85,0.7), 0 0 30px rgba(255,0,85,0.3)` : rarity.glow ? `0 0 8px ${rarity.color}55` : 'none', position:'relative', animation: rKey==='Mythic' ? 'mythic-pulse 2s ease-in-out infinite' : 'none' }}
                                        >
                                            <span className="gift-rarity-badge" style={{ background: rarity.color }}>{rarity.icon}</span>
                                            {item.imageUrl ? <img src={item.imageUrl} alt={item.name_en} className="gift-icon-img" /> : <div className="text-xl mb-1">{item.emoji}</div>}
                                            <div className="gift-details">
                                                <div className="text-[9px] font-bold mb-0.5" style={{color: rarity.color}}>{lang === 'ar' ? rarity.name_ar : rarity.name_en}</div>
                                                <div className="text-[10px] font-bold text-yellow-400">{item.cost}🧠</div>
                                                <div className="gift-charisma">+{formatCharisma(item.charisma)} ⭐</div>
                                            </div>
                                        </div>
                                    );
                                }
                                const rKey2 = getItemRarity(item);
                                const rarity2 = RARITY_CONFIG[rKey2];
                                return (
                                    <div key={item.id} className={`inventory-item ${equippedItem ? 'equipped' : ''}`}
                                        style={{ border: `1.5px solid ${rarity2.border}`, background: rarity2.bg, boxShadow: rarity2.glow ? `0 0 8px ${rarity2.color}44` : 'none', position:'relative' }}
                                        onClick={() => { setSelectedItem(item); setShowPreview(true); }}
                                    >
                                        <span className="gift-rarity-badge" style={{ background: rarity2.color }}>{rarity2.icon}</span>
                                        <div className="inventory-item-preview">{renderPreview(item)}</div>
                                        <div className="inventory-item-name" style={{fontSize:'9px'}}>{lang === 'ar' ? item.name_ar : item.name_en}</div>
                                        <div style={{fontSize:'8px', color: rarity2.color, fontWeight:700, marginBottom:'2px'}}>{lang==='ar'?rarity2.name_ar:rarity2.name_en}</div>
                                        {owned ? (equippedItem ? <button onClick={(e) => { e.stopPropagation(); onUnequip(item.type, item.id); }} className="btn-unequip w-full">{t.unequip}</button> : <button onClick={(e) => { e.stopPropagation(); onEquip(item); }} className="btn-success w-full text-[10px] py-0.5 rounded">{t.equip}</button>) : (<div className="text-yellow-400 font-bold text-xs">{item.cost}🧠</div>)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                {showPreview && selectedItem && (
                    <GiftPreviewModal 
                        show={showPreview} 
                        onClose={() => setShowPreview(false)} 
                        gift={selectedItem} 
                        lang={lang} 
                        onBuy={(item, target) => { 
                            if (currency >= item.cost) { 
                                onPurchase(item, target); 
                                setShowPreview(false); 
                            }
                        }} 
                        currency={currency} 
                        friendsData={[]}
                        user={{ uid: userData?.uid }}
                        currentUserData={userData}
                    />
                )}
            </div>
        </div>
    );
};

// ==========================================
// 📦 INVENTORY MODAL
// ==========================================
const InventoryModal = ({ show, onClose, userData, lang, onEquip, onUnequip, onSendGift, friendsData, isLoggedIn, currentUserData, user }) => {
    const t = TRANSLATIONS[lang];
    const [activeTab, setActiveTab] = useState('frames');
    const [selectedGift, setSelectedGift] = useState(null);
    const [showGiftPreview, setShowGiftPreview] = useState(false);
    
    if (!show) return null;
    
    const inventory = userData?.inventory || { frames: [], titles: [], themes: [], badges: [], gifts: [] };
    const equipped = userData?.equipped || {};
    const getOwnedItems = (type) => { const ownedIds = inventory[type] || []; return SHOP_ITEMS[type]?.filter(item => ownedIds.includes(item.id)) || []; };
    const isEquipped = (item) => { if (item.type === 'badges') { const eb = equipped.badges || []; return Array.isArray(eb) ? eb.includes(item.id) : equipped.badges === item.id; } return equipped[item.type] === item.id; };
    const getEquippedBadgeCount = () => { const eb = equipped.badges || []; return Array.isArray(eb) ? eb.length : (equipped.badges ? 1 : 0); };
    
    const renderPreview = (item) => {
        if (item.type === 'frames') return item.preview.startsWith('http') ? <img src={item.preview} alt={item.name_en} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full" style={{ background: item.preview }}></div>;
        if (item.type === 'badges') return item.imageUrl ? <img src={item.imageUrl} alt={item.name_en} className="w-8 h-8 object-contain" /> : <span className="text-2xl">{item.preview}</span>;
        if (item.type === 'titles') return item.imageUrl ? <img src={item.imageUrl} alt={item.name_en} className="w-6 h-6 object-contain" /> : <span className="text-xl">{item.preview}</span>;
        if (item.type === 'gifts') return item.imageUrl ? <img src={item.imageUrl} alt={item.name_en} className="w-8 h-8 object-contain" /> : <span className="text-2xl">{item.emoji}</span>;
        return <span className="text-xl">🎨</span>;
    };
    
    const tabs = ['frames', 'titles', 'badges', 'gifts'];
    const ownedItems = getOwnedItems(activeTab);
    
    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', maxHeight: '85vh' }}>
                    <div className="modal-header">
                        <h2 className="modal-title">{t.myInventory}</h2>
                        {activeTab === 'badges' && <span className="text-[10px] text-gray-400">{getEquippedBadgeCount()}/{MAX_BADGES}</span>}
                        <ModalCloseBtn onClose={onClose} />
                    </div>
                    <div className="modal-body" style={{ padding: '8px' }}>
                        <div className="shop-tabs-container" style={{ margin: '4px', marginBottom: 0 }}>{tabs.map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`shop-tab ${activeTab === tab ? 'active' : ''}`}>{t[tab]} ({getOwnedItems(tab).length})</button>)}</div>
                        <div className="p-2">
                            {ownedItems.length === 0 ? <div className="text-center py-6 text-gray-400"><div className="text-3xl mb-2">📦</div><p>{t.owned}: 0</p></div> : (
                                <div className="inventory-grid">
                                    {ownedItems.map(item => {
                                        const equippedItem = isEquipped(item);
                                        if (activeTab === 'gifts') return (
                                            <div key={item.id} className="inventory-item">
                                                <div className="inventory-item-preview">{renderPreview(item)}</div>
                                                <div className="inventory-item-name">{lang === 'ar' ? item.name_ar : item.name_en}</div>
                                                <button 
                                                    onClick={() => { 
                                                        setSelectedGift(item); 
                                                        setShowGiftPreview(true); 
                                                    }} 
                                                    className="btn-gold w-full text-[10px] py-0.5 rounded mt-1"
                                                >
                                                    {t.sendGiftToFriend}
                                                </button>
                                            </div>
                                        );
                                        return (
                                            <div key={item.id} className={`inventory-item ${equippedItem ? 'equipped' : ''}`}>
                                                <div className="inventory-item-preview">{renderPreview(item)}</div>
                                                <div className="inventory-item-name">{lang === 'ar' ? item.name_ar : item.name_en}</div>
                                                {equippedItem ? 
                                                    <button onClick={() => onUnequip(item.type, item.id)} className="btn-unequip w-full">{t.unequip}</button> : 
                                                    <button 
                                                        onClick={() => onEquip(item)} 
                                                        disabled={activeTab === 'badges' && getEquippedBadgeCount() >= MAX_BADGES} 
                                                        className={`btn-success w-full text-[10px] py-0.5 rounded ${(activeTab === 'badges' && getEquippedBadgeCount() >= MAX_BADGES) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {t.equip}
                                                    </button>
                                                }
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {showGiftPreview && selectedGift && (
                <GiftPreviewModal 
                    show={showGiftPreview} 
                    onClose={() => setShowGiftPreview(false)} 
                    gift={selectedGift} 
                    lang={lang} 
                    onBuy={() => {}} 
                    currency={userData?.currency || 0} 
                    isFromInventory={true} 
                    onSendFromInventory={onSendGift} 
                    friendsData={friendsData} 
                    currentUserData={currentUserData}
                    user={user}
                />
            )}
        </>
    );
};

// ==========================================
// 👤 USER PROFILE MODAL - WITH GIFT LOG
// ==========================================
const UserProfileModal = ({ show, onClose, targetUID, lang, currentUserUID, onSendFriendRequest, onSendGift, userData, currentUserFriends, currentUserFriendRequests, friendsData }) => {
    const t = TRANSLATIONS[lang];
    const [targetData, setTargetData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [blockedByTarget, setBlockedByTarget] = useState(false);
    const [showBlockConfirm, setShowBlockConfirm] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportSending, setReportSending] = useState(false);
    
    useEffect(() => {
        if (!show || !targetUID) { setLoading(true); return; }
        setLoading(true); setRequestSent(false); setShowOptionsMenu(false);
        usersCollection.doc(targetUID).get().then(doc => {
            if (doc.exists) { 
                const data = doc.data();
                setTargetData({ id: doc.id, ...data, isGuest: false });
                // Check if target has blocked current user
                const theirBlockedUsers = data.blockedUsers || [];
                setBlockedByTarget(theirBlockedUsers.includes(currentUserUID));
                setLoading(false); 
            }
            else { guestsCollection.doc(targetUID).get().then(guestDoc => { if (guestDoc.exists) { setTargetData({ id: guestDoc.id, ...guestDoc.data(), isGuest: true }); } else { setTargetData(null); } setLoading(false); }).catch(() => { setTargetData(null); setLoading(false); }); }
        }).catch(() => { setLoading(false); setTargetData(null); });
    }, [show, targetUID, currentUserUID]);

    // Check if user is blocked
    useEffect(() => {
        if (userData && targetUID) {
            const blocked = userData.blockedUsers || [];
            setIsBlocked(blocked.includes(targetUID));
        }
    }, [userData, targetUID]);
    
    if (!show) return null;
    
    const isOwnProfile = isOwnProfileOverride || targetUID === currentUserUID;
    const isTargetGuest = targetData?.isGuest || targetData?.isAnonymous;
    const isGuestViewer = isGuestProp === true; // current user viewing is a guest
    const isAlreadyFriend = currentUserFriends?.includes(targetUID);
    const hasPendingRequest = currentUserFriendRequests?.includes(targetUID) || requestSent;
    
    const handleAddFriend = async () => { if (isAlreadyFriend || hasPendingRequest) return; await onSendFriendRequest(targetUID); setRequestSent(true); };

    const handleBlockUser = async () => {
        if (!userData || !targetUID) return;
        try {
            await usersCollection.doc(currentUserUID).update({
                blockedUsers: firebase.firestore.FieldValue.arrayUnion(targetUID)
            });
            setIsBlocked(true);
            setShowBlockConfirm(false);
            setShowOptionsMenu(false);
        } catch (error) {
            console.error('Block error:', error);
        }
    };

    const handleUnblockUser = async () => {
        if (!userData || !targetUID) return;
        try {
            await usersCollection.doc(currentUserUID).update({
                blockedUsers: firebase.firestore.FieldValue.arrayRemove(targetUID)
            });
            setIsBlocked(false);
            setShowOptionsMenu(false);
        } catch (error) {
            console.error('Unblock error:', error);
        }
    };

    const handleSendReport = async () => {
        if (!reportReason || !currentUserUID || !targetUID) return;
        setReportSending(true);
        try {
            await reportsCollection.add({
                reportedUID: targetUID,
                reportedName: targetData?.displayName || 'Unknown',
                reporterUID: currentUserUID,
                reason: reportReason,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            });
            setShowReportModal(false);
            setReportReason('');
            setShowOptionsMenu(false);
        } catch(e) { console.error('Report error:', e); }
        setReportSending(false);
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{t.profile}</h2>
                    <div className="flex items-center gap-2">
                        {!isOwnProfile && !isTargetGuest && !isGuestViewer && (
                            <div className="relative">
                                <button 
                                    onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                                    className="profile-options-btn"
                                >
                                    ⋮
                                </button>
                                {showOptionsMenu && (
                                    <div className="profile-options-menu">
                                        {isBlocked ? (
                                            <button onClick={handleUnblockUser} className="option-item unblock">
                                                <span>🔓</span>
                                                <span>{t.unblock}</span>
                                            </button>
                                        ) : (
                                            <button onClick={() => { setShowBlockConfirm(true); setShowOptionsMenu(false); }} className="option-item block">
                                                <span>🚫</span>
                                                <span>{t.blockUser}</span>
                                            </button>
                                        )}
                                        <button onClick={() => { setShowReportModal(true); setShowOptionsMenu(false); }} className="option-item" style={{color:'#f87171', borderTop:'1px solid rgba(255,255,255,0.07)'}}>
                                            <span>🚨</span>
                                            <span>{lang === 'ar' ? 'إبلاغ' : 'Report'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        <ModalCloseBtn onClose={onClose} />
                    </div>
                </div>
                <div className="modal-body">
                    {loading ? <div className="text-center py-8"><div className="text-2xl animate-pulse">⏳</div><p className="text-gray-400 mt-2">{t.loading}</p></div> : !targetData ? <div className="text-center py-8"><div className="text-4xl mb-2">❌</div><p className="text-gray-400">{t.friendNotFound}</p></div> : (
                        <div className="profile-container">
                            <div className="profile-header">
                                <div className="profile-avatar-section">
                                    <div className="profile-avatar-container"><AvatarWithFrame photoURL={targetData.photoURL} equipped={targetData.equipped} size="lg" /></div>
                                    <h3 className="profile-name">{targetData.displayName || 'Unknown'}</h3>
                                    {targetData.equipped?.titles && <div className="profile-title-container">{renderTitle(targetData.equipped.titles, lang)}</div>}
                                    {targetData.equipped?.badges && renderBadges(targetData.equipped.badges, 28)}
                                    {isTargetGuest && <div className="profile-account-type guest">{t.guestAccount}</div>}
                                    <div className="profile-id" onClick={() => { navigator.clipboard.writeText(targetData.customId || targetData.uid); }}><span>ID: {targetData.customId || targetData.uid?.substring(0, 8)}</span><span className="text-[10px]">📋</span></div>
                                </div>
                            </div>
                            <CharismaDisplay charisma={targetData.charisma} lang={lang} />
                            <div className="profile-stats">
                                <div className="profile-stat"><div className="profile-stat-value">{targetData.stats?.wins || 0}</div><div className="profile-stat-label">{t.wins}</div></div>
                                <div className="profile-stat"><div className="profile-stat-value">{targetData.stats?.losses || 0}</div><div className="profile-stat-label">{t.losses}</div></div>
                                <div className="profile-stat"><div className="profile-stat-value">{Math.floor((targetData.stats?.xp || 0) / 100) + 1}</div><div className="profile-stat-label">{t.level}</div></div>
                            </div>
                            <KDCircle wins={targetData.stats?.wins || 0} losses={targetData.stats?.losses || 0} lang={lang} />
                            
                            {/* Achievements Display */}
                            <AchievementsDisplay userData={targetData} lang={lang} showAll={false} />
                            
                            {/* Gift Log - REDESIGNED */}
                            <GiftLog 
                                show={true} 
                                targetUID={targetUID} 
                                lang={lang} 
                                onOpenProfile={(uid) => {
                                    // Could open another profile modal
                                }}
                                isOwnProfile={isOwnProfile}
                            />
                            
                            {/* Blocked User Notice */}
                            {isBlocked && !isOwnProfile && (
                                <div className="blocked-notice">
                                    <span>🚫</span>
                                    <span>{lang === 'ar' ? 'لقد حظرت هذا المستخدم' : 'You have blocked this user'}</span>
                                </div>
                            )}
                            
                            {/* Blocked By Target Notice */}
                            {blockedByTarget && !isOwnProfile && (
                                <div className="blocked-notice blocked-by-other">
                                    <span>🚫</span>
                                    <span>{lang === 'ar' ? 'هذا المستخدم قد حظرك. لا يمكنك إرسال هدايا أو طلبات صداقة.' : 'This user has blocked you. You cannot send gifts or friend requests.'}</span>
                                </div>
                            )}
                            
                            {!isOwnProfile && !isTargetGuest && !isBlocked && !blockedByTarget && !isGuestViewer && (
                                <div className="flex gap-2 mt-4">
                                    {isAlreadyFriend ? <button disabled className="btn-success flex-1 py-2 rounded-lg text-sm opacity-80">✅ {lang === 'ar' ? 'أصدقاء' : 'Friends'}</button> : hasPendingRequest ? <button disabled className="btn-ghost flex-1 py-2 rounded-lg text-sm opacity-80">⏳ {lang === 'ar' ? 'تم الإرسال' : 'Sent'}</button> : <button onClick={handleAddFriend} className="btn-neon flex-1 py-2 rounded-lg text-sm">👥 {t.addFriend}</button>}
                                    <button onClick={() => setShowGiftModal(true)} className="btn-gold flex-1 py-2 rounded-lg text-sm">🎁 {t.sendGift}</button>
                                </div>
                            )}
                            {!isOwnProfile && isGuestViewer && !isTargetGuest && (
                                <div style={{marginTop:'14px', padding:'12px 14px', borderRadius:'12px', background:'linear-gradient(135deg,rgba(112,0,255,0.08),rgba(0,242,255,0.05))', border:'1px solid rgba(0,242,255,0.15)', textAlign:'center'}}>
                                    <div style={{fontSize:'20px', marginBottom:'6px'}}>🔒</div>
                                    <div style={{fontSize:'11px', color:'#e2e8f0', fontWeight:700, marginBottom:'4px'}}>
                                        {lang === 'ar' ? 'سجّل دخولك للتفاعل' : 'Login to interact'}
                                    </div>
                                    <div style={{fontSize:'10px', color:'#6b7280'}}>
                                        {lang === 'ar' ? 'لإرسال هدايا وطلبات صداقة' : 'To send gifts & friend requests'}
                                    </div>
                                </div>
                            )}
                            {isTargetGuest && !isOwnProfile && <div className="text-center text-gray-400 text-xs mt-4 p-2 bg-white/5 rounded-lg">{t.guestProfileMsg}</div>}
                        </div>
                    )}
                </div>

                {/* Report Modal */}
                {showReportModal && (
                    <div className="confirm-overlay" onClick={() => setShowReportModal(false)}>
                        <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                            <div className="confirm-icon">🚨</div>
                            <div className="confirm-title">{lang === 'ar' ? 'إبلاغ عن مستخدم' : 'Report User'}</div>
                            <div className="confirm-message" style={{fontSize:'11px', color:'#9ca3af', marginBottom:'12px'}}>
                                {lang === 'ar' ? 'اختر سبب الإبلاغ:' : 'Select a reason:'}
                            </div>
                            <div style={{display:'flex', flexDirection:'column', gap:'6px', marginBottom:'14px'}}>
                                {[
                                    {key:'abusive', ar:'سلوك مسيء', en:'Abusive Behavior'},
                                    {key:'cheating', ar:'غش',        en:'Cheating'},
                                    {key:'spam',     ar:'سبام',       en:'Spam'},
                                    {key:'other',    ar:'سبب آخر',   en:'Other'}
                                ].map(r => (
                                    <button
                                        key={r.key}
                                        onClick={() => setReportReason(r.key)}
                                        className={reportReason === r.key ? 'btn-neon' : 'btn-ghost'}
                                        style={{padding:'8px 12px', borderRadius:'8px', fontSize:'12px', textAlign:'start'}}
                                    >
                                        {lang === 'ar' ? r.ar : r.en}
                                    </button>
                                ))}
                            </div>
                            <div className="confirm-actions">
                                <button onClick={() => { setShowReportModal(false); setReportReason(''); }} className="btn-ghost">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                                <button onClick={handleSendReport} disabled={!reportReason || reportSending} className="btn-danger" style={{opacity: (!reportReason || reportSending) ? 0.5 : 1}}>
                                    {reportSending ? '...' : (lang === 'ar' ? 'إرسال' : 'Submit')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Block Confirmation Modal */}
                {/* Report Modal */}
                {showReportModal && (
                    <div className="confirm-overlay" onClick={() => setShowReportModal(false)}>
                        <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                            <div className="confirm-icon">🚨</div>
                            <div className="confirm-title">{lang === 'ar' ? 'إبلاغ عن مستخدم' : 'Report User'}</div>
                            <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'10px', textAlign:'center'}}>
                                {lang === 'ar' ? 'اختر سبب الإبلاغ:' : 'Select a reason:'}
                            </div>
                            <div style={{display:'flex', flexDirection:'column', gap:'6px', marginBottom:'14px'}}>
                                {[
                                    {key:'abusive', ar:'سلوك مسيء', en:'Abusive Behavior'},
                                    {key:'cheating', ar:'غش', en:'Cheating'},
                                    {key:'spam', ar:'سبام', en:'Spam'},
                                    {key:'other', ar:'سبب آخر', en:'Other'}
                                ].map(r => (
                                    <button key={r.key} onClick={() => setReportReason(r.key)}
                                        style={{padding:'9px 12px', borderRadius:'8px', fontSize:'12px', textAlign:'start', cursor:'pointer', fontWeight:600,
                                            background: reportReason === r.key ? 'rgba(112,0,255,0.3)' : 'rgba(255,255,255,0.05)',
                                            border: reportReason === r.key ? '1.5px solid #7000ff' : '1px solid rgba(255,255,255,0.1)',
                                            color: reportReason === r.key ? 'white' : '#9ca3af'
                                        }}>
                                        {lang === 'ar' ? r.ar : r.en}
                                    </button>
                                ))}
                            </div>
                            <div className="confirm-actions">
                                <button onClick={() => { setShowReportModal(false); setReportReason(''); }} className="btn-ghost">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                                <button onClick={handleSendReport} disabled={!reportReason || reportSending} className="btn-danger"
                                    style={{opacity: (!reportReason || reportSending) ? 0.5 : 1}}>
                                    {reportSending ? '...' : (lang === 'ar' ? 'إرسال' : 'Submit')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showBlockConfirm && (
                    <div className="confirm-overlay" onClick={() => setShowBlockConfirm(false)}>
                        <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                            <div className="confirm-icon">🚫</div>
                            <div className="confirm-title">{t.blockUser}</div>
                            <div className="confirm-message">
                                {lang === 'ar' 
                                    ? `هل أنت متأكد من حظر ${targetData?.displayName || 'هذا المستخدم'}؟ لن يتمكن من إرسال رسائل أو هدايا لك.`
                                    : `Are you sure you want to block ${targetData?.displayName || 'this user'}? They won't be able to send you messages or gifts.`
                                }
                            </div>
                            <div className="confirm-actions">
                                <button onClick={() => setShowBlockConfirm(false)} className="btn-ghost">{t.reportCancel}</button>
                                <button onClick={handleBlockUser} className="btn-danger">{t.blockUser}</button>
                            </div>
                        </div>
                    </div>
                )}

                {showGiftModal && targetData && (
                    <SendGiftModal 
                        show={showGiftModal} 
                        onClose={() => setShowGiftModal(false)} 
                        targetUser={targetData} 
                        currentUser={userData} 
                        lang={lang} 
                        onSendGift={onSendGift} 
                        currency={userData?.currency || 0}
                        friendsData={friendsData}
                    />
                )}

                {/* Self Gift Modal */}
                {showSelfGiftModal && (
                    <SendGiftModal
                        show={showSelfGiftModal}
                        onClose={() => setShowSelfGiftModal(false)}
                        targetUser={{ uid: targetUID, displayName: targetData?.displayName || 'You', photoURL: targetData?.photoURL }}
                        currentUser={userData}
                        lang={lang}
                        onSendGift={async (gift, targetUser) => {
                            if (onSendGift) await onSendGift(gift, targetUser);
                            setShowSelfGiftModal(false);
                        }}
                        currency={userData?.currency || 0}
                        friendsData={[]}
                    />
                )}

                {/* Own Profile Footer Actions */}
                {isOwnProfile && (isLoggedInProp !== undefined) && (
                    <div className="profile-own-footer">
                        {isLoggedInProp && (
                            <div style={{display:'flex',gap:'6px',width:'100%'}}>
                                <button onClick={() => { if(!sessionClaimedToday) onOpenLoginRewards?.(); }} className={`btn-gold flex-1 py-2 rounded-lg text-sm font-bold ${sessionClaimedToday ? 'opacity-50' : ''}`}>
                                    🎁 {TRANSLATIONS[lang]?.loginRewards || 'Login Reward'} {sessionClaimedToday && <span style={{fontSize:'9px', color:'#4ade80'}}>✓</span>}
                                </button>
                                <button onClick={() => setShowSelfGiftModal(true)} className="btn-gold flex-1 py-2 rounded-lg text-sm font-bold" style={{background:'linear-gradient(135deg,#7000ff,#00f2ff)'}}>
                                    🎁 {lang==='ar'?'هدية لنفسك':'Gift Yourself'}
                                </button>
                            </div>
                        )}
                        <div style={{display:'flex', gap:'6px', width:'100%'}}>
                            {isLoggedInProp && (<><button onClick={onOpenShop} className="btn-gold flex-1 py-2 rounded-lg text-sm font-bold">🛒 {TRANSLATIONS[lang]?.shop || 'Shop'}</button><button onClick={onOpenInventory} className="btn-neon flex-1 py-2 rounded-lg text-sm font-bold">📦 {TRANSLATIONS[lang]?.inventory || 'Inventory'}</button></>)}
                        </div>
                        <button onClick={onOpenSettings} className="btn-ghost w-full py-2 rounded-lg text-sm font-bold">⚙️ {TRANSLATIONS[lang]?.settings || 'Settings'}</button>
                        {isLoggedInProp
                            ? <button onClick={onLogout} className="btn-danger w-full py-2 rounded-lg text-sm">{TRANSLATIONS[lang]?.logout || 'Logout'}</button>
                            : isGuestProp
                                ? <div style={{display:'flex', gap:'6px', width:'100%'}}><button onClick={onLogout} className="btn-ghost flex-1 py-2 rounded-lg text-sm">{TRANSLATIONS[lang]?.logout || 'Logout'}</button><button onClick={onLoginGoogle} className="btn-neon flex-1 py-2 rounded-lg text-sm">{TRANSLATIONS[lang]?.loginGoogle || 'Google Login'}</button></div>
                                : null
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

// ==========================================
// 💬 PRIVATE CHAT MODAL - IMPROVED WITH AVATARS
// ==========================================

// ============================================================
// 💬 SELF CHAT MODAL - Personal notepad + gift history
// ============================================================
const SelfChatModal = ({ show, onClose, currentUser, userData, lang, currency }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);

    const uid = currentUser?.uid || null;
    const selfChatId = uid ? `${uid}_self` : null;
    const displayName = currentUser?.displayName || userData?.displayName || (lang==='ar'?'أنا':'Me');
    const photoURL = currentUser?.photoURL || userData?.photoURL || null;

    useEffect(() => {
        if (!show || !selfChatId) return;
        const unsub = chatsCollection
            .doc(selfChatId)
            .collection('messages')
            .orderBy('timestamp', 'asc')
            .limit(100)
            .onSnapshot(snap => {
                setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            });
        return () => unsub();
    }, [show, selfChatId]);

    const sendNote = async () => {
        if (!inputText.trim() || !selfChatId || sending || !uid) return;
        setSending(true);
        try {
            const chatRef = chatsCollection.doc(selfChatId);
            // Fix: never pass undefined - use explicit null for missing fields
            await chatRef.set({
                participants: [uid, uid],
                type: 'self',
                lastMessage: inputText.trim(),
                lastAt: firebase.firestore.FieldValue.serverTimestamp(),
                ownerUID: uid,
                ownerName: displayName,
                ownerPhoto: photoURL || null
            }, { merge: true });
            await chatRef.collection('messages').add({
                text: inputText.trim(),
                senderId: uid,
                senderName: displayName,
                senderPhoto: photoURL || null,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                type: 'note'
            });
            setInputText('');
        } catch(e) { console.error('Send error:', e); }
        setSending(false);
    };

    const formatMsgTime = (ts) => {
        if (!ts?.toDate) return '';
        const d = ts.toDate();
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{zIndex:15000}}>
            <div
                className="animate-pop"
                onClick={e => e.stopPropagation()}
                style={{
                    background:'linear-gradient(180deg,#1a1a2e,#0f0f1a)',
                    border:'1px solid rgba(0,242,255,0.2)',
                    borderRadius:'18px',
                    width:'100%',
                    maxWidth:'400px',
                    maxHeight:'88vh',
                    display:'flex',
                    flexDirection:'column',
                    overflow:'hidden',
                    boxShadow:'0 20px 60px rgba(0,0,0,0.9)'
                }}
            >
                {/* Header - like a real chat with profile photo */}
                <div style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'12px 14px',
                    background:'linear-gradient(135deg,rgba(0,10,30,0.9),rgba(20,0,40,0.9))',
                    borderBottom:'1px solid rgba(255,255,255,0.06)'
                }}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <div style={{position:'relative'}}>
                            <img
                                src={photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=7000ff&color=fff&size=80`}
                                alt=""
                                style={{width:'42px',height:'42px',borderRadius:'50%',objectFit:'cover',border:'2px solid rgba(0,242,255,0.4)'}}
                            />
                            <div style={{position:'absolute',bottom:'1px',right:'1px',width:'10px',height:'10px',borderRadius:'50%',background:'#4ade80',border:'2px solid #0f0f1a'}}/>
                        </div>
                        <div>
                            <div style={{fontSize:'14px', fontWeight:800, color:'white'}}>
                                {displayName}
                            </div>
                            <div style={{fontSize:'10px', color:'#4ade80', fontWeight:600}}>
                                {lang==='ar' ? '● شاتي الشخصي' : '● My Personal Chat'}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{background:'rgba(255,255,255,0.07)',border:'none',borderRadius:'8px',color:'#9ca3af',fontSize:'16px',width:'30px',height:'30px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
                </div>

                {/* Messages */}
                <div style={{flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:'10px', background:'rgba(0,0,0,0.2)'}}>
                    {messages.length === 0 && (
                        <div style={{textAlign:'center', marginTop:'50px', color:'#4b5563'}}>
                            <div style={{fontSize:'40px', marginBottom:'8px'}}>💬</div>
                            <div style={{fontSize:'12px', color:'#6b7280'}}>{lang==='ar' ? 'ابدأ محادثتك...' : 'Start chatting...'}</div>
                        </div>
                    )}
                    {messages.map(msg => (
                        <div key={msg.id} style={{display:'flex', justifyContent:'flex-end'}}>
                            {msg.type === 'gift' ? (
                                /* Gift notification bubble */
                                <div style={{
                                    background:'linear-gradient(135deg,rgba(255,215,0,0.12),rgba(255,136,0,0.08))',
                                    border:'1px solid rgba(255,215,0,0.3)',
                                    borderRadius:'14px 14px 4px 14px',
                                    padding:'10px 14px',
                                    maxWidth:'85%'
                                }}>
                                    <div style={{fontSize:'9px', color:'#fbbf24', fontWeight:700, marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px'}}>
                                        🎁 {lang==='ar' ? 'هدية لنفسك' : 'Self Gift'}
                                    </div>
                                    <div style={{fontSize:'20px', marginBottom:'4px'}}>{msg.giftEmoji || '🎁'}</div>
                                    <div style={{fontSize:'12px', color:'#f3f4f6', fontWeight:700}}>{msg.giftName}</div>
                                    <div style={{fontSize:'10px', color:'#9ca3af', marginTop:'2px'}}>{lang==='ar'?'تكلفة:':'Cost:'} {msg.giftCost} 🧠</div>
                                    <div style={{fontSize:'10px', color:'#9ca3af'}}>{lang==='ar'?'كاريزما:':'Charisma:'} +{msg.charismaGain}</div>
                                    <div style={{fontSize:'9px', color:'#4b5563', marginTop:'4px', textAlign:'right'}}>{formatMsgTime(msg.timestamp)}</div>
                                </div>
                            ) : (
                                /* Regular note bubble */
                                <div style={{
                                    background:'linear-gradient(135deg,rgba(0,242,255,0.1),rgba(112,0,255,0.1))',
                                    border:'1px solid rgba(0,242,255,0.2)',
                                    borderRadius:'14px 14px 4px 14px',
                                    padding:'10px 14px',
                                    maxWidth:'85%'
                                }}>
                                    <div style={{fontSize:'13px', color:'#e2e8f0', lineHeight:1.5}}>{msg.text}</div>
                                    <div style={{fontSize:'9px', color:'#4b5563', marginTop:'4px', textAlign:'right'}}>{formatMsgTime(msg.timestamp)}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div style={{
                    display:'flex', gap:'8px', padding:'12px 14px',
                    borderTop:'1px solid rgba(255,255,255,0.07)',
                    background:'rgba(0,0,0,0.2)'
                }}>
                    <input
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendNote(); } }}
                        placeholder={lang==='ar' ? 'اكتب ملاحظة...' : 'Write a note...'}
                        style={{
                            flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
                            borderRadius:'10px', padding:'10px 12px', color:'white', fontSize:'13px', outline:'none'
                        }}
                    />
                    <button
                        onClick={sendNote}
                        disabled={!inputText.trim() || sending}
                        style={{
                            padding:'10px 14px', borderRadius:'10px', fontSize:'14px', cursor:'pointer', border:'none',
                            background: inputText.trim() ? 'linear-gradient(135deg,#00f2ff,#7000ff)' : 'rgba(255,255,255,0.06)',
                            color: inputText.trim() ? '#000' : '#4b5563',
                            fontWeight:800, transition:'all 0.2s',
                            opacity: sending ? 0.6 : 1
                        }}
                    >
                        {sending ? '...' : '➤'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// ============================================================
// 🎫 FUN PASS MODAL COMPONENT
// ============================================================
const FunPassModal = ({ show, onClose, userData, user, lang, onNotification }) => {
    const [activeTab, setActiveTab] = useState('pass'); // 'pass' | 'missions'
    const [buying, setBuying] = useState(false);
    const [claiming, setClaiming] = useState(null);

    // All hooks before early return
    const fp = userData?.funPass || {};
    const hasPremium = fp.premium === true;
    const currentXP = fp.xp || 0;
    const claimedFree = fp.claimedFree || [];
    const claimedPremium = fp.claimedPremium || [];
    const currency = userData?.currency || 0;

    // Find current level (last level where xp >= xpRequired)
    const currentLevel = FUN_PASS_LEVELS.reduce((acc, lv) => (currentXP >= lv.xp ? lv.level : acc), 0);
    const nextLevel = FUN_PASS_LEVELS.find(lv => lv.level === currentLevel + 1);
    const xpForNext = nextLevel ? nextLevel.xp : null;
    const progressPct = xpForNext ? Math.min(100, Math.round(((currentXP - (FUN_PASS_LEVELS[currentLevel - 1]?.xp || 0)) / (xpForNext - (FUN_PASS_LEVELS[currentLevel - 1]?.xp || 0))) * 100)) : 100;

    if (!show) return null;

    const handleBuyPremium = async () => {
        if (!user || hasPremium || buying) return;
        if (currency < FUN_PASS_PRICE) { onNotification(lang==='ar'?'إنتل غير كافٍ!':'Not enough Intel!'); return; }
        setBuying(true);
        try {
            await usersCollection.doc(user.uid).update({
                currency: firebase.firestore.FieldValue.increment(-FUN_PASS_PRICE),
                'funPass.premium': true
            });
            onNotification(lang==='ar'?'🎫 تم شراء Fun Pass!':'🎫 Fun Pass purchased!');
        } catch(e) { console.error(e); onNotification(lang==='ar'?'خطأ':'Error'); }
        setBuying(false);
    };

    const handleClaim = async (level, type) => {
        if (!user || claiming) return;
        const key = `${type}_${level}`;
        const alreadyClaimed = type === 'free' ? claimedFree.includes(level) : claimedPremium.includes(level);
        if (alreadyClaimed) return;
        if (type === 'premium' && !hasPremium) { onNotification(lang==='ar'?'اشترِ Fun Pass أولاً':'Buy Fun Pass first'); return; }
        if (currentLevel < level) { onNotification(lang==='ar'?'لم تصل لهذا المستوى بعد':'Level not reached yet'); return; }
        const lvData = FUN_PASS_LEVELS.find(l => l.level === level);
        const reward = type === 'free' ? lvData.free : lvData.premium;
        setClaiming(key);
        try {
            const updates = {};
            if (reward.type === 'currency') {
                updates.currency = firebase.firestore.FieldValue.increment(reward.amount);
            } else if (reward.type === 'frame') {
                updates['inventory.frames'] = firebase.firestore.FieldValue.arrayUnion(reward.itemId);
            } else if (reward.type === 'badge') {
                updates['inventory.badges'] = firebase.firestore.FieldValue.arrayUnion(reward.itemId);
            } else if (reward.type === 'title') {
                updates['inventory.titles'] = firebase.firestore.FieldValue.arrayUnion(reward.itemId);
            }
            if (type === 'free') {
                updates['funPass.claimedFree'] = firebase.firestore.FieldValue.arrayUnion(level);
            } else {
                updates['funPass.claimedPremium'] = firebase.firestore.FieldValue.arrayUnion(level);
            }
            await usersCollection.doc(user.uid).update(updates);
            onNotification(`${lang==='ar'?'تم استلام':'Claimed'} ${lang==='ar'?reward.name_ar:reward.name_en}! 🎉`);
        } catch(e) { console.error(e); }
        setClaiming(null);
    };

    const getRarityStyle = (rarity) => {
        const r = RARITY_CONFIG[rarity] || RARITY_CONFIG['Common'];
        return { border: `1px solid ${r.border}`, background: r.bg, color: r.color };
    };
    const isMythic = (rarity) => rarity === 'Mythic';

    return (
        <div className="modal-overlay" onClick={onClose} style={{zIndex:12000}}>
            <div className="animate-pop" onClick={e => e.stopPropagation()} style={{
                background:'linear-gradient(180deg,#0a0a1a,#0f0f1e)',
                border:'1px solid rgba(255,215,0,0.25)',
                borderRadius:'18px', width:'100%', maxWidth:'420px',
                maxHeight:'90vh', display:'flex', flexDirection:'column', overflow:'hidden',
                boxShadow:'0 20px 60px rgba(0,0,0,0.9), 0 0 40px rgba(255,215,0,0.05)'
            }}>
                {/* Header */}
                <div style={{
                    padding:'14px 16px',
                    background:'linear-gradient(135deg,rgba(255,215,0,0.12),rgba(255,136,0,0.08))',
                    borderBottom:'1px solid rgba(255,215,0,0.15)',
                    display:'flex', alignItems:'center', justifyContent:'space-between'
                }}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <div style={{fontSize:'28px'}}>🎫</div>
                        <div>
                            <div style={{fontSize:'16px', fontWeight:900, background:'linear-gradient(135deg,#ffd700,#ff8800)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
                                FUN PASS
                            </div>
                            <div style={{fontSize:'9px', color:'#6b7280'}}>
                                {lang==='ar'?'مستوى':'Level'} {currentLevel}/50 · {currentXP} XP
                            </div>
                        </div>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        {!hasPremium && (
                            <button onClick={handleBuyPremium} disabled={buying || currency < FUN_PASS_PRICE} style={{
                                padding:'6px 12px', borderRadius:'8px', fontSize:'11px', fontWeight:800, cursor:'pointer', border:'none',
                                background: currency >= FUN_PASS_PRICE ? 'linear-gradient(135deg,#ffd700,#ff8800)' : 'rgba(100,100,100,0.2)',
                                color: currency >= FUN_PASS_PRICE ? '#000' : '#6b7280',
                                opacity: buying ? 0.6 : 1
                            }}>
                                {buying ? '...' : `🎫 ${FUN_PASS_PRICE}🧠`}
                            </button>
                        )}
                        {hasPremium && (
                            <div style={{background:'linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,136,0,0.15))', border:'1px solid rgba(255,215,0,0.4)', borderRadius:'8px', padding:'4px 10px', fontSize:'11px', color:'#ffd700', fontWeight:800}}>
                                ✓ PREMIUM
                            </div>
                        )}
                        <button onClick={onClose} style={{background:'rgba(255,255,255,0.07)',border:'none',borderRadius:'8px',color:'#9ca3af',fontSize:'16px',width:'28px',height:'28px',cursor:'pointer'}}>✕</button>
                    </div>
                </div>

                {/* XP Progress Bar */}
                <div style={{padding:'8px 16px', background:'rgba(0,0,0,0.3)', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'9px', color:'#6b7280', marginBottom:'4px'}}>
                        <span>XP: {currentXP}</span>
                        <span>{xpForNext ? `${lang==='ar'?'التالي:':'Next:'} ${xpForNext} XP` : (lang==='ar'?'المستوى الأقصى!':'Max Level!')}</span>
                    </div>
                    <div style={{height:'6px', background:'rgba(255,255,255,0.08)', borderRadius:'3px', overflow:'hidden'}}>
                        <div style={{
                            height:'100%', borderRadius:'3px', transition:'width 0.5s ease',
                            width:`${xpForNext ? progressPct : 100}%`,
                            background:'linear-gradient(90deg,#ffd700,#ff8800)'
                        }}/>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
                    {[
                        {id:'pass',     icon:'🎫', ar:'التمرير',  en:'Pass'},
                        {id:'missions', icon:'📋', ar:'المهمات',  en:'Missions'},
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                            flex:1, padding:'10px', fontSize:'12px', fontWeight:700, cursor:'pointer', border:'none',
                            background: activeTab===tab.id ? 'rgba(255,215,0,0.1)' : 'transparent',
                            color: activeTab===tab.id ? '#ffd700' : '#6b7280',
                            borderBottom: activeTab===tab.id ? '2px solid #ffd700' : '2px solid transparent'
                        }}>
                            {tab.icon} {lang==='ar'?tab.ar:tab.en}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{flex:1, overflowY:'auto', padding:'10px 12px', display:'flex', flexDirection:'column', gap:'8px'}}>
                    {activeTab === 'pass' && (
                        <>
                            {/* Legend */}
                            <div style={{display:'flex', gap:'10px', padding:'6px 0', fontSize:'9px', color:'#6b7280'}}>
                                <span>⬆️ {lang==='ar'?'مجاني':'Free'}</span>
                                <span style={{color:'#ffd700'}}>🎫 {lang==='ar'?'بريميوم':'Premium'}</span>
                                <span style={{color:'#4ade80'}}>✓ {lang==='ar'?'مستلم':'Claimed'}</span>
                                <span style={{color:'#3b82f6'}}>🔵 {lang==='ar'?'حالي':'Current'}</span>
                            </div>
                            {FUN_PASS_LEVELS.map(lv => {
                                const isReached = currentLevel >= lv.level;
                                const isCurrent = currentLevel === lv.level - 1 && lv.level <= 50;
                                const freeClaimable = isReached && !claimedFree.includes(lv.level);
                                const premClaimable = isReached && hasPremium && !claimedPremium.includes(lv.level);
                                const freeKey = `free_${lv.level}`;
                                const premKey = `premium_${lv.level}`;
                                const freeRarity = lv.free.rarity || 'Common';
                                const premRarity = lv.premium.rarity || 'Common';

                                return (
                                    <div key={lv.level} style={{
                                        display:'flex', gap:'6px', alignItems:'stretch',
                                        opacity: (!isReached && !isCurrent) ? 0.55 : 1
                                    }}>
                                        {/* Level badge */}
                                        <div style={{
                                            width:'32px', minWidth:'32px', display:'flex', flexDirection:'column',
                                            alignItems:'center', justifyContent:'center', gap:'2px'
                                        }}>
                                            <div style={{
                                                width:'28px', height:'28px', borderRadius:'50%',
                                                background: isCurrent ? 'rgba(59,130,246,0.3)' : isReached ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
                                                border: isCurrent ? '2px solid #3b82f6' : isReached ? '2px solid rgba(255,215,0,0.5)' : '1px solid rgba(255,255,255,0.08)',
                                                display:'flex', alignItems:'center', justifyContent:'center',
                                                fontSize:'9px', fontWeight:900,
                                                color: isCurrent ? '#60a5fa' : isReached ? '#ffd700' : '#6b7280',
                                                boxShadow: isCurrent ? '0 0 8px rgba(59,130,246,0.5)' : isReached ? '0 0 6px rgba(255,215,0,0.2)' : 'none'
                                            }}>{lv.level}</div>
                                            {lv.level < 50 && (
                                                <div style={{width:'1px', height:'8px', background:'rgba(255,255,255,0.08)'}}/>
                                            )}
                                        </div>

                                        {/* Free reward box */}
                                        <div style={{
                                            flex:1, padding:'7px 10px', borderRadius:'10px', display:'flex',
                                            alignItems:'center', justifyContent:'space-between', gap:'6px',
                                            ...(freeRarity === 'Mythic' ? {
                                                background:'rgba(255,0,85,0.1)', border:'1px solid rgba(255,0,85,0.4)',
                                                animation:'mythic-pulse 2s ease-in-out infinite'
                                            } : freeRarity === 'Legendary' ? {
                                                background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.35)'
                                            } : freeRarity === 'Epic' ? {
                                                background:'rgba(168,85,247,0.08)', border:'1px solid rgba(168,85,247,0.25)'
                                            } : {
                                                background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)'
                                            })
                                        }}>
                                            <div style={{display:'flex', alignItems:'center', gap:'6px', minWidth:0}}>
                                                {lv.free.imageUrl 
                                    ? <img src={lv.free.imageUrl} alt="" style={{width:'24px',height:'24px',borderRadius:'6px',objectFit:'cover',flexShrink:0}} />
                                    : <span style={{fontSize:'16px', flexShrink:0}}>{lv.free.icon}</span>}
                                                <div style={{minWidth:0}}>
                                                    <div style={{fontSize:'10px', fontWeight:700, color: freeRarity==='Mythic'?'#ff4488':freeRarity==='Legendary'?'#fbbf24':freeRarity==='Epic'?'#c084fc':'#e2e8f0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                                                        {lang==='ar'?lv.free.name_ar:lv.free.name_en}
                                                    </div>
                                                    <div style={{fontSize:'8px', color:'#4ade80', fontWeight:600}}>FREE</div>
                                                </div>
                                            </div>
                                            {claimedFree.includes(lv.level) ? (
                                                <div style={{fontSize:'9px', color:'#4ade80', fontWeight:700, flexShrink:0}}>✓</div>
                                            ) : (
                                                <button onClick={() => handleClaim(lv.level,'free')} disabled={!freeClaimable || claiming===freeKey} style={{
                                                    padding:'3px 8px', borderRadius:'6px', fontSize:'9px', fontWeight:700, cursor: freeClaimable?'pointer':'default', border:'none', flexShrink:0,
                                                    background: freeClaimable ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.04)',
                                                    color: freeClaimable ? '#4ade80' : '#374151',
                                                    opacity: claiming===freeKey ? 0.6 : 1
                                                }}>
                                                    {claiming===freeKey ? '...' : freeClaimable ? (lang==='ar'?'استلم':'Claim') : '🔒'}
                                                </button>
                                            )}
                                        </div>

                                        {/* Premium reward box */}
                                        <div style={{
                                            flex:1, padding:'7px 10px', borderRadius:'10px', display:'flex',
                                            alignItems:'center', justifyContent:'space-between', gap:'6px',
                                            ...(premRarity === 'Mythic' ? {
                                                background:'rgba(255,0,85,0.12)', border:'1px solid rgba(255,0,85,0.5)',
                                                animation:'mythic-pulse 2s ease-in-out infinite'
                                            } : premRarity === 'Legendary' ? {
                                                background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.4)'
                                            } : premRarity === 'Epic' ? {
                                                background:'rgba(168,85,247,0.1)', border:'1px solid rgba(168,85,247,0.3)'
                                            } : {
                                                background: hasPremium ? 'rgba(255,215,0,0.05)' : 'rgba(255,255,255,0.02)',
                                                border: hasPremium ? '1px solid rgba(255,215,0,0.2)' : '1px dashed rgba(255,255,255,0.08)'
                                            })
                                        }}>
                                            <div style={{display:'flex', alignItems:'center', gap:'6px', minWidth:0, opacity: hasPremium ? 1 : 0.4}}>
                                                {hasPremium && lv.premium.imageUrl
                                    ? <img src={lv.premium.imageUrl} alt="" style={{width:'24px',height:'24px',borderRadius:'6px',objectFit:'cover',flexShrink:0}} />
                                    : <span style={{fontSize:'16px', flexShrink:0}}>{hasPremium ? lv.premium.icon : '🔒'}</span>}
                                                <div style={{minWidth:0}}>
                                                    <div style={{fontSize:'10px', fontWeight:700, color: premRarity==='Mythic'?'#ff4488':premRarity==='Legendary'?'#fbbf24':premRarity==='Epic'?'#c084fc':'#9ca3af', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                                                        {hasPremium ? (lang==='ar'?lv.premium.name_ar:lv.premium.name_en) : '???'}
                                                    </div>
                                                    <div style={{fontSize:'8px', color:'#ffd700', fontWeight:600}}>🎫 PASS</div>
                                                </div>
                                            </div>
                                            {claimedPremium.includes(lv.level) ? (
                                                <div style={{fontSize:'9px', color:'#4ade80', fontWeight:700, flexShrink:0}}>✓</div>
                                            ) : (
                                                <button onClick={() => handleClaim(lv.level,'premium')} disabled={!premClaimable || claiming===premKey} style={{
                                                    padding:'3px 8px', borderRadius:'6px', fontSize:'9px', fontWeight:700, cursor: premClaimable?'pointer':'default', border:'none', flexShrink:0,
                                                    background: premClaimable ? 'linear-gradient(135deg,rgba(255,215,0,0.3),rgba(255,136,0,0.2))' : 'rgba(255,255,255,0.03)',
                                                    color: premClaimable ? '#ffd700' : '#374151',
                                                    opacity: claiming===premKey ? 0.6 : 1
                                                }}>
                                                    {claiming===premKey ? '...' : premClaimable ? (lang==='ar'?'استلم':'Claim') : (hasPremium?'🔒':'🎫')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {activeTab === 'missions' && (
                        <>
                            {/* Daily Missions */}
                            <div style={{fontSize:'11px', fontWeight:800, color:'#fbbf24', marginBottom:'4px', display:'flex', alignItems:'center', gap:'6px'}}>
                                <span>☀️</span> {lang==='ar'?'المهمات اليومية':'Daily Missions'}
                            </div>
                            {FUN_PASS_DAILY_MISSIONS.map(m => (
                                <div key={m.id} style={{
                                    display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px',
                                    padding:'9px 12px', borderRadius:'10px',
                                    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)'
                                }}>
                                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                        <span style={{fontSize:'18px'}}>{m.icon}</span>
                                        <div>
                                            <div style={{fontSize:'11px', fontWeight:700, color:'#e2e8f0'}}>{lang==='ar'?m.name_ar:m.name_en}</div>
                                            <div style={{fontSize:'9px', color:'#fbbf24', fontWeight:700}}>+{m.xp} XP</div>
                                        </div>
                                    </div>
                                    <div style={{fontSize:'9px', color:'#4b5563', fontWeight:600, background:'rgba(255,255,255,0.05)', padding:'3px 8px', borderRadius:'5px'}}>
                                        {lang==='ar'?'قريباً':'Soon'}
                                    </div>
                                </div>
                            ))}

                            {/* Weekly Missions */}
                            <div style={{fontSize:'11px', fontWeight:800, color:'#c084fc', marginTop:'8px', marginBottom:'4px', display:'flex', alignItems:'center', gap:'6px'}}>
                                <span>📅</span> {lang==='ar'?'المهمات الأسبوعية':'Weekly Missions'}
                            </div>
                            {FUN_PASS_WEEKLY_MISSIONS.map(m => (
                                <div key={m.id} style={{
                                    display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px',
                                    padding:'9px 12px', borderRadius:'10px',
                                    background:'rgba(168,85,247,0.05)', border:'1px solid rgba(168,85,247,0.15)'
                                }}>
                                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                        <span style={{fontSize:'18px'}}>{m.icon}</span>
                                        <div>
                                            <div style={{fontSize:'11px', fontWeight:700, color:'#e2e8f0'}}>{lang==='ar'?m.name_ar:m.name_en}</div>
                                            <div style={{fontSize:'9px', color:'#c084fc', fontWeight:700}}>+{m.xp} XP</div>
                                        </div>
                                    </div>
                                    <div style={{fontSize:'9px', color:'#4b5563', fontWeight:600, background:'rgba(255,255,255,0.05)', padding:'3px 8px', borderRadius:'5px'}}>
                                        {lang==='ar'?'قريباً':'Soon'}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const PrivateChatModal = ({ show, onClose, friend, currentUser, user, lang, onSendNotification, onSendGift, currency, friendsData, onOpenProfile }) => {
    const t = TRANSLATIONS[lang];
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [sending, setSending] = useState(false);
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [blockedByTarget, setBlockedByTarget] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const chatId = friend && user ? [user.uid, friend.uid].sort().join('_') : null;
    
    // Check if blocked
    useEffect(() => {
        if (!show || !friend || !currentUser) return;
        // Check if current user blocked this friend
        const myBlocked = currentUser.blockedUsers || [];
        setIsBlocked(myBlocked.includes(friend.uid));
        
        // Check if friend blocked current user
        usersCollection.doc(friend.uid).get().then(doc => {
            if (doc.exists) {
                const theirBlocked = doc.data().blockedUsers || [];
                setBlockedByTarget(theirBlocked.includes(user.uid));
            }
        });
    }, [show, friend, currentUser, user?.uid]);
    
    useEffect(() => {
        if (!show || !chatId) return;
        const unsub = chatsCollection.doc(chatId).collection('messages').onSnapshot(snap => {
            let msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            msgs.sort((a, b) => { const timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds || 0; const timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds || 0; return timeA - timeB; });
            setMessages(msgs);
            chatsCollection.doc(chatId).update({ [`unread.${user.uid}`]: 0 }).catch(() => {});
        });
        return unsub;
    }, [show, chatId, user?.uid]);
    
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
    
    const handleSend = async () => {
        if (!newMsg.trim() || sending || isBlocked || blockedByTarget) return;
        setSending(true);
        try {
            await chatsCollection.doc(chatId).collection('messages').add({ 
                senderId: user.uid, 
                senderName: currentUser?.displayName || 'User', 
                senderPhoto: currentUser?.photoURL || null, 
                text: newMsg.trim(), 
                timestamp: firebase.firestore.FieldValue.serverTimestamp() 
            });
            await chatsCollection.doc(chatId).set({ 
                members: [user.uid, friend.uid], 
                lastMessage: newMsg.trim(), 
                timestamp: firebase.firestore.FieldValue.serverTimestamp(), 
                [`unread.${friend.uid}`]: firebase.firestore.FieldValue.increment(1) 
            }, { merge: true });
            if (onSendNotification) await onSendNotification(friend.uid, 'message', `${currentUser?.displayName || 'User'}: ${newMsg.trim().substring(0, 50)}`, user.uid, currentUser?.displayName || 'User');
            setNewMsg('');
            playSound('click');
        } catch (e) { console.error('Send error:', e); }
        setSending(false);
    };
    
    const handleEmojiSelect = (emoji) => {
        setNewMsg(prev => prev + emoji);
        setShowEmojiPicker(false);
        inputRef.current?.focus();
    };
    
    const handleSendGiftToChat = async (gift, targetUser) => {
        if (!onSendGift || isBlocked || blockedByTarget) return;
        await onSendGift(gift, targetUser);
        setShowGiftModal(false);
    };
    
    // Handle profile opening
    const handleOpenProfile = (uid) => {
        if (onOpenProfile) {
            onOpenProfile(uid);
        }
    };
    
    if (!show || !friend) return null;
    
    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="chat-modal-content animate-pop" onClick={e => e.stopPropagation()}>
                    <div className="chat-header-bar">
                        <div 
                            onClick={() => handleOpenProfile(friend.uid)}
                            style={{ cursor: 'pointer' }}
                        >
                            <AvatarWithFrame 
                                photoURL={friend.photoURL} 
                                equipped={friend.equipped} 
                                size="sm" 
                            />
                        </div>
                        <div 
                            className="chat-header-info"
                            onClick={() => handleOpenProfile(friend.uid)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="chat-header-name">{friend.displayName}</div>
                            <div className="chat-header-status">
                                {isBlocked ? (lang === 'ar' ? 'محظور' : 'Blocked') : blockedByTarget ? (lang === 'ar' ? 'تم حظرك' : 'You are blocked') : t.online}
                            </div>
                        </div>
                        <button onClick={() => setShowGiftModal(true)} className="gift-chat-btn" disabled={isBlocked || blockedByTarget} title={t.sendGift}>🎁</button>
                        <ModalCloseBtn onClose={onClose} />
                    </div>
                    
                    {/* Blocked Notice */}
                    {(isBlocked || blockedByTarget) && (
                        <div className="chat-blocked-notice">
                            <span>🚫</span>
                            <span>{isBlocked 
                                ? (lang === 'ar' ? 'لقد حظرت هذا المستخدم. إلغاء الحظر للمراسلة.' : 'You have blocked this user. Unblock to message.')
                                : (lang === 'ar' ? 'هذا المستخدم حظرك. لا يمكنك إرسال رسائل.' : 'This user has blocked you. You cannot send messages.')
                            }</span>
                        </div>
                    )}
                    
                    <div className="chat-messages-container">
                        {messages.length === 0 ? <div className="text-center py-8 text-gray-400 text-sm">{t.noMessages}</div> : messages.map(msg => {
                            const isMine = msg.senderId === user?.uid;
                            const isGift = msg.type === 'gift';
                            return (
                                <div key={msg.id} className={`chat-message-row ${isMine ? 'mine' : ''} ${isGift ? 'gift-message' : ''}`}>
                                    {!isMine && (
                                        <div 
                                            onClick={() => handleOpenProfile(msg.senderId || friend.uid)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <AvatarWithFrame 
                                                photoURL={msg.senderPhoto || friend.photoURL} 
                                                equipped={friend.equipped} 
                                                size="sm" 
                                            />
                                        </div>
                                    )}
                                    <div className="chat-message-content">
                                        <div 
                                            className="chat-message-sender"
                                            onClick={() => handleOpenProfile(isMine ? user.uid : (msg.senderId || friend.uid))}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {isMine ? (currentUser?.displayName || 'You') : msg.senderName}
                                        </div>
                                        {isGift ? (
                                            <div className="gift-message-content">
                                                <div className="gift-message-icon">{msg.giftEmoji || '🎁'}</div>
                                                <div className="gift-message-name">{msg.giftName || 'Gift'}</div>
                                                <div className="gift-message-details">
                                                    <span className="gift-charisma-badge">+{formatCharisma(msg.giftCharisma)} ⭐</span>
                                                    {msg.giftBonus > 0 && <span className="gift-bonus-badge">+{msg.giftBonus} 🧠</span>}
                                                </div>
                                            </div>
                                        ) : <div className="chat-message-bubble">{msg.text}</div>}
                                        <div className="chat-message-time">{formatTime(msg.timestamp)}</div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-input-container" style={{position:'relative'}}>
                        {showEmojiPicker && React.createElement(
                            React.Fragment, null,
                            React.createElement('div', {
                                style: {
                                    position:'absolute', bottom:'calc(100% + 6px)', left:0, right:0,
                                    background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.12)',
                                    borderRadius:'14px', padding:'10px', zIndex:9999,
                                    boxShadow:'0 -14px 40px rgba(0,0,0,0.7)'
                                }
                            },
                                React.createElement('div', {style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'7px',borderBottom:'1px solid rgba(255,255,255,0.08)',paddingBottom:'6px'}},
                                    React.createElement('span', {style:{fontSize:'11px',fontWeight:700,color:'#00f2ff'}}, lang==='ar'?'اختر إيموجي':'Select Emoji'),
                                    React.createElement('button', {onClick:()=>setShowEmojiPicker(false),style:{background:'none',border:'none',color:'#9ca3af',cursor:'pointer',fontSize:'14px',lineHeight:1}}, '✕')
                                ),
                                React.createElement(EmojiPicker, {show:true, onClose:()=>setShowEmojiPicker(false), onSelect:handleEmojiSelect, lang, inline:true})
                            )
                        )}
                        {!(isBlocked || blockedByTarget) && (
                            <div style={{display:'flex',alignItems:'center',gap:'6px',width:'100%'}}>
                                <button 
                                    className="emoji-picker-btn"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    style={{ fontSize: '22px' }}
                                >
                                    😀
                                </button>
                                <div className="chat-input-row" style={{flex:1}}>
                                    <input 
                                        ref={inputRef} 
                                        type="text" 
                                        className="chat-input" 
                                        placeholder={t.typeMessage} 
                                        value={newMsg} 
                                        onChange={e => setNewMsg(e.target.value)} 
                                        onKeyPress={e => e.key === 'Enter' && handleSend()} 
                                    />
                                    <button onClick={handleSend} disabled={sending || !newMsg.trim()} className="chat-send-btn">➤</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showGiftModal && (
                <SendGiftModal 
                    show={showGiftModal} 
                    onClose={() => setShowGiftModal(false)} 
                    targetUser={friend} 
                    currentUser={currentUser} 
                    lang={lang} 
                    onSendGift={handleSendGiftToChat} 
                    currency={currency || 0}
                    friendsData={friendsData}
                />
            )}

        </>
    );
};

// ==========================================
// 📅 LOGIN REWARDS COMPONENT
// ==========================================
const LoginRewards = ({ show, onClose, userData, onClaim, lang }) => {
    const t = TRANSLATIONS[lang];
    const [claiming, setClaiming] = useState(false);
    const [countdown, setCountdown] = useState('');

    // ALL computations before any hooks - Rules of Hooks compliance
    const loginData = userData?.loginRewards || { currentDay: 0, lastClaimDate: null, streak: 0, totalClaims: 0 };
    
    const getLastClaimDate = () => {
        const lcd = loginData.lastClaimDate;
        if (!lcd) return null;
        if (lcd?.toDate) return lcd.toDate();
        if (lcd instanceof Date) return lcd;
        const d = new Date(lcd);
        return isNaN(d.getTime()) ? null : d;
    };
    
    const lastClaimDate = getLastClaimDate();
    const todayStr = new Date().toDateString();
    const lastClaimStr = lastClaimDate ? lastClaimDate.toDateString() : null;
    const canClaimToday = lastClaimStr !== todayStr;
    const currentDay = loginData.currentDay || 0;
    const currentReward = LOGIN_REWARDS[currentDay];
    
    // Countdown timer - MUST be before any conditional returns
    useEffect(() => {
        if (!show || canClaimToday || !lastClaimDate) { setCountdown(''); return; }
        const calcCountdown = () => {
            const now = new Date();
            const nextMidnight = new Date(now);
            nextMidnight.setHours(24, 0, 0, 0);
            const diff = nextMidnight - now;
            if (diff <= 0) { setCountdown(''); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setCountdown(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
        };
        calcCountdown();
        const timer = setInterval(calcCountdown, 1000);
        return () => clearInterval(timer);
    }, [show, canClaimToday, lastClaimDate]);

    // Early return AFTER all hooks
    if (!show) return null;
    
    const handleClaim = async () => { 
        if (!canClaimToday || claiming) return; 
        setClaiming(true); 
        playRewardSound(); 
        await onClaim(currentDay + 1); 
        setClaiming(false); 
    };
    
    const renderRewardIcon = (reward, size = 16) => {
        if (!reward) return <span style={{ fontSize: size + 'px' }}>❓</span>;
        return <span style={{ fontSize: size + 'px' }}>{reward.icon || '🎁'}</span>;
    };
    
    const getRewardName = (reward) => {
        if (!reward) return '';
        return lang === 'ar' ? reward.name_ar : reward.name_en;
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '380px', maxHeight: '90vh', width: '95%' }}>
                <div className="modal-header">
                    <h2 className="modal-title">🎁 {t.loginRewards}</h2>
                    <ModalCloseBtn onClose={onClose} />
                </div>
                <div className="modal-body" style={{ padding: '12px' }}>
                    <div className="login-rewards-container">
                        <div className="login-rewards-header">
                            <span className="login-rewards-title">🔥 {t.dailyStreak}</span>
                            <span className="login-rewards-streak">{currentDay}/30</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', width: '100%', padding: '8px 0' }}>
                            {LOGIN_REWARDS.map((reward, index) => {
                                const dayNum = index + 1;
                                const isClaimed = dayNum <= currentDay;
                                const isCurrent = dayNum === currentDay + 1 && canClaimToday;
                                const isSpecial = reward.special === true;
                                const isFinal = reward.final === true;
                                
                                let bgColor = 'rgba(255, 255, 255, 0.03)';
                                let borderColor = 'rgba(255, 255, 255, 0.1)';
                                let textColor = 'rgba(255, 255, 255, 0.5)';
                                let extraStyles = {};
                                
                                if (isClaimed) {
                                    bgColor = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(34, 197, 94, 0.1))';
                                    borderColor = '#10b981';
                                    textColor = '#10b981';
                                } else if (isCurrent) {
                                    bgColor = 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 136, 0, 0.1))';
                                    borderColor = '#ffd700';
                                    textColor = '#ffd700';
                                    extraStyles = { animation: 'pulse-badge 2s infinite', boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)' };
                                } else if (isSpecial) {
                                    bgColor = 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.1))';
                                    borderColor = '#8b5cf6';
                                    textColor = '#a855f7';
                                } else if (isFinal) {
                                    bgColor = 'linear-gradient(135deg, rgba(255, 0, 85, 0.2), rgba(255, 51, 102, 0.1))';
                                    borderColor = '#ff0055';
                                    textColor = '#ff0055';
                                    extraStyles = { animation: 'glow-pulse 2s infinite' };
                                }
                                
                                return (
                                    <div key={dayNum} title={getRewardName(reward)} style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: `2px solid ${borderColor}`, background: bgColor, padding: '4px', gap: '2px', position: 'relative', cursor: isCurrent ? 'pointer' : 'default', transition: 'all 0.2s ease', ...extraStyles }}>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: textColor, lineHeight: 1 }}>{dayNum}</span>
                                        <span style={{ fontSize: '14px', lineHeight: 1 }}>{renderRewardIcon(reward, 14)}</span>
                                        {/* ✓ claimed overlay */}
                                        {isClaimed && (
                                            <div style={{position:'absolute',inset:0,background:'rgba(16,185,129,0.15)',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                                <span style={{fontSize:'14px',color:'#10b981',fontWeight:900}}>✓</span>
                                            </div>
                                        )}
                                        {/* Current day glow ring */}
                                        {isCurrent && !isClaimed && (
                                            <div style={{position:'absolute',inset:'-2px',borderRadius:'10px',border:'2px solid #ffd700',boxShadow:'0 0 10px rgba(255,215,0,0.5)',pointerEvents:'none'}}/>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {canClaimToday && currentReward && (
                            <div style={{ marginTop: '12px', padding: '12px', background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 136, 0, 0.05))', border: '1px solid rgba(255, 215, 0, 0.3)', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>{lang === 'ar' ? 'مكافأة اليوم' : "Today's Reward"}</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>{renderRewardIcon(currentReward, 18)} {getRewardName(currentReward)}</div>
                                {currentReward.special && <div style={{ fontSize: '10px', color: '#ffd700', marginTop: '4px' }}>⭐ {lang === 'ar' ? 'مكافأة خاصة!' : 'Special Reward!'}</div>}
                            </div>
                        )}
                        {/* Countdown shown when already claimed */}
                        {!canClaimToday && countdown && (
                            <div style={{textAlign:'center', marginTop:'10px', padding:'8px 12px', background:'rgba(0,242,255,0.06)', border:'1px solid rgba(0,242,255,0.15)', borderRadius:'10px'}}>
                                <div style={{fontSize:'9px', color:'#64748b', marginBottom:'3px'}}>
                                    {lang === 'ar' ? '⏳ الوقت المتبقي لليوم التالي' : '⏳ Next reward in'}
                                </div>
                                <div style={{fontSize:'18px', fontWeight:900, color:'#00f2ff', fontFamily:'monospace', letterSpacing:'2px'}}>
                                    {countdown}
                                </div>
                            </div>
                        )}
                        <button onClick={handleClaim} disabled={!canClaimToday || claiming} style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: canClaimToday && !claiming ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease', background: canClaimToday ? 'linear-gradient(135deg, #ffd700, #ff8800)' : 'rgba(107, 114, 128, 0.5)', color: canClaimToday ? '#000' : 'rgba(255, 255, 255, 0.5)', marginTop: '10px' }}>
                            {claiming ? t.loading : canClaimToday ? t.claimReward : t.alreadyClaimed}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 🔧 BROWSE ROOMS MODAL
// ==========================================
const BrowseRoomsModal = ({ show, onClose, onJoin, nickname, currentUID, currentUserData, lang }) => {
    const t = TRANSLATIONS[lang];
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joinPassword, setJoinPassword] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    
    useEffect(() => {
        if (!show) return;
        setLoading(true);
        setPasswordError('');
        const unsub = roomsCollection.where('status', '==', 'waiting').onSnapshot(snap => {
            const roomsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(room => room.players?.length < 10);
            setRooms(roomsData);
            setLoading(false);
        }, error => { console.error('Browse rooms error:', error); setLoading(false); });
        return unsub;
    }, [show]);
    
    if (!show) return null;
    
    const handleJoinClick = (room) => { 
        if (room.isPrivate) { 
            setSelectedRoom(room); 
            setShowPasswordInput(true); 
            setPasswordError(''); 
        } else { 
            onJoin(room.id, ''); 
        } 
    };
    
    const handlePasswordJoin = () => { 
        if (selectedRoom && joinPassword) {
            if (joinPassword !== selectedRoom.password) {
                setPasswordError(lang === 'ar' ? 'كلمة السر غير صحيحة!' : 'Incorrect password!');
                return;
            }
            onJoin(selectedRoom.id, joinPassword); 
            setShowPasswordInput(false); 
            setSelectedRoom(null); 
            setJoinPassword(''); 
            setPasswordError('');
        } 
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="modal-header"><h2 className="modal-title">{t.browse}</h2><ModalCloseBtn onClose={onClose} /></div>
                <div className="modal-body">
                    {loading ? <div className="text-center py-8"><div className="text-2xl animate-pulse">⏳</div><p className="text-gray-400 mt-2">{t.loading}</p></div> : rooms.length === 0 ? <div className="text-center py-8 text-gray-400"><div className="text-4xl mb-2">🔍</div><p>{t.noRooms}</p></div> : (
                        <div className="browse-rooms-container">
                            {rooms.map(room => (
                                <div key={room.id} className="room-card">
                                    <div className="room-card-header"><span className="room-card-code">{room.id}</span><span className="room-card-mode">{room.mode === 'advanced' ? (lang === 'ar' ? 'متقدم' : 'Advanced') : (lang === 'ar' ? 'عادي' : 'Normal')}</span></div>
                                    <div className="room-card-info">
                                        <div className="room-card-players"><span>👥 {room.players?.length || 0}/10</span>{room.isPrivate && <span className="room-card-private ml-2">🔒</span>}</div>
                                        <button onClick={() => handleJoinClick(room)} className="room-card-join-btn">{t.join}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {showPasswordInput && selectedRoom && (
                    <div className="p-3 bg-white/5 border-t border-white/10">
                        <div className="text-xs text-gray-400 mb-2">🔒 {lang === 'ar' ? 'أدخل كلمة السر' : 'Enter password'} - Room: {selectedRoom.id}</div>
                        <div className="flex gap-2">
                            <input type="password" value={joinPassword} onChange={e => { setJoinPassword(e.target.value); setPasswordError(''); }} placeholder={t.password} className="input-dark flex-1 p-2 rounded text-sm" />
                            <button onClick={handlePasswordJoin} className="btn-neon px-4 py-2 rounded text-sm">{t.join}</button>
                            <button onClick={() => { setShowPasswordInput(false); setSelectedRoom(null); setPasswordError(''); }} className="btn-ghost px-3 py-2 rounded text-sm">✕</button>
                        </div>
                        {passwordError && <div className="text-xs text-red-400 mt-2 text-center flex items-center justify-center gap-1"><span>❌</span> {passwordError}</div>}
                    </div>
                )}
            </div>
        </div>
    );
};

// ==========================================
// 📚 TUTORIAL MODAL
// ==========================================
const TutorialModal = ({ show, onClose, lang }) => {
    const t = TRANSLATIONS[lang];
    const [step, setStep] = useState(0);
    if(!show) return null;
    const steps = [ { text: t.tutorialStep1, img: "🕵️" }, { text: t.tutorialStep2, img: "🗳️" }, { text: t.tutorialStep3, img: "🛒" } ];
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '340px' }}>
                <div className="modal-header"><h2 className="modal-title">{t.tutorialTitle}</h2><ModalCloseBtn onClose={onClose} /></div>
                <div className="modal-body text-center">
                    <div className="text-5xl mb-4 animate-bounce">{steps[step].img}</div>
                    <p className="text-sm mb-4 text-gray-200">{steps[step].text}</p>
                    <div className="flex justify-center gap-2 mb-3">{steps.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full transition ${i === step ? 'bg-cyan-400 w-4' : 'bg-gray-600'}`}></div>)}</div>
                    <div className="flex gap-2">
                        {step > 0 && <button onClick={() => setStep(s => s-1)} className="btn-ghost flex-1 py-2 rounded-lg text-sm">Back</button>}
                        {step < steps.length - 1 ? <button onClick={() => setStep(s => s+1)} className="btn-neon flex-1 py-2 rounded-lg text-sm">{t.next}</button> : <button onClick={onClose} className="btn-neon flex-1 py-2 rounded-lg text-sm">{t.startGame}</button>}
                    </div>
                    <button onClick={onClose} className="text-xs text-gray-500 mt-3 hover:text-white">{t.skipTutorial}</button>
                </div>
            </div>
        </div>
    );
};


// ==========================================
// ⚙️ SETTINGS MODAL
// ==========================================
const SettingsModal = ({ show, onClose, lang, userData, user, onNotification, isGuest: isGuestPropForSettings, onLoginGoogle }) => {
    const t = TRANSLATIONS[lang];
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [blockInput, setBlockInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [soundMutedLocal, setSoundMutedLocal] = useState(() => localStorage.getItem('pro_spy_sound_muted') === 'true');
    const [showEmailLocal, setShowEmailLocal] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        if (show && userData) {
            setBlockedUsers(userData.blockedUsers || []);
        }
    }, [show, userData]);

    if (!show) return null;

    const toggleSound = () => {
        const newMuted = !soundMutedLocal;
        setSoundMutedLocal(newMuted);
        localStorage.setItem('pro_spy_sound_muted', String(newMuted));
        // Update global audio state
        if (typeof window !== 'undefined') {
            window.proSpySoundMuted = newMuted;
        }
        onNotification(newMuted ? (lang === 'ar' ? 'تم كتم الصوت' : 'Sound muted') : (lang === 'ar' ? 'تم تشغيل الصوت' : 'Sound enabled'));
    };

    const handleBlockUser = async () => {
        if (!blockInput.trim() || !user) return;
        setLoading(true);
        try {
            // Find user by ID
            const userQuery = await usersCollection.where('customId', '==', blockInput.trim()).get();
            if (userQuery.empty) {
                onNotification(t.friendNotFound);
                setLoading(false);
                return;
            }
            const targetUid = userQuery.docs[0].id;
            if (targetUid === user.uid) {
                onNotification(lang === 'ar' ? 'لا يمكنك حظر نفسك' : 'Cannot block yourself');
                setLoading(false);
                return;
            }
            if (blockedUsers.includes(targetUid)) {
                onNotification(lang === 'ar' ? 'المستخدم محظور بالفعل' : 'User already blocked');
                setLoading(false);
                return;
            }
            // Add to blocked list
            await usersCollection.doc(user.uid).update({
                blockedUsers: firebase.firestore.FieldValue.arrayUnion(targetUid)
            });
            setBlockedUsers([...blockedUsers, targetUid]);
            setBlockInput('');
            onNotification(t.blockSuccess);
        } catch (error) {
            console.error('Block error:', error);
            onNotification(lang === 'ar' ? 'حدث خطأ' : 'An error occurred');
        }
        setLoading(false);
    };

    const handleUnblockUser = async (targetUid) => {
        if (!user) return;
        try {
            await usersCollection.doc(user.uid).update({
                blockedUsers: firebase.firestore.FieldValue.arrayRemove(targetUid)
            });
            setBlockedUsers(blockedUsers.filter(id => id !== targetUid));
            onNotification(t.unblockSuccess);
        } catch (error) {
            console.error('Unblock error:', error);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '360px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">⚙️ {t.settings}</h2>
                    <ModalCloseBtn onClose={onClose} />
                </div>
                <div className="modal-body">
                    {/* Account Info Section - GUEST: show login prompt instead */}
                    {isGuestPropForSettings && (
                        <div className="settings-section">
                            <div className="settings-section-title">
                                <span>👤</span>
                                <span>{lang === 'ar' ? 'معلومات الحساب' : 'Account Info'}</span>
                            </div>
                            <div style={{padding:'16px', borderRadius:'12px', background:'linear-gradient(135deg,rgba(0,10,30,0.6),rgba(20,0,50,0.4))', border:'1px solid rgba(0,242,255,0.15)', textAlign:'center'}}>
                                <div style={{fontSize:'32px', marginBottom:'8px'}}>🔒</div>
                                <div style={{fontSize:'13px', fontWeight:800, color:'white', marginBottom:'4px'}}>
                                    {lang === 'ar' ? 'حساب زائر' : 'Guest Account'}
                                </div>
                                <div style={{fontSize:'11px', color:'#6b7280', marginBottom:'14px'}}>
                                    {lang === 'ar' ? 'سجّل دخولك للوصول لجميع المميزات' : 'Login to access all features'}
                                </div>
                                <button onClick={onLoginGoogle} style={{
                                    display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                                    width:'100%', padding:'10px 16px', borderRadius:'10px', border:'none', cursor:'pointer',
                                    background:'white', color:'#333', fontSize:'13px', fontWeight:700
                                }}>
                                    <img src="https://www.google.com/favicon.ico" alt="G" style={{width:'16px',height:'16px'}} />
                                    {lang === 'ar' ? 'تسجيل الدخول بجوجل' : 'Login with Google'}
                                </button>
                            </div>
                        </div>
                    )}
                    {/* Account Info Section - Logged in users */}
                    {user && !isGuestPropForSettings && (
                        <div className="settings-section">
                            <div className="settings-section-title">
                                <span>👤</span>
                                <span>{lang === 'ar' ? 'معلومات الحساب' : 'Account Info'}</span>
                            </div>
                            {/* Profile Photo */}
                            <div style={{display:'flex', justifyContent:'center', marginBottom:'12px', marginTop:'8px'}}>
                                <div style={{position:'relative', cursor:'pointer'}} onClick={() => document.getElementById('settings-photo-input')?.click()}>
                                    <img
                                        src={userData?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.displayName||'User')}&background=7000ff&color=fff&size=200`}
                                        alt="avatar"
                                        style={{width:'72px', height:'72px', borderRadius:'50%', objectFit:'cover', border:'3px solid rgba(112,0,255,0.5)'}}
                                    />
                                    <div style={{position:'absolute', bottom:'0', right:'0', background:'rgba(112,0,255,0.9)', borderRadius:'50%', width:'22px', height:'22px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', border:'2px solid #0f0f1a'}}>📷</div>
                                </div>
                                <input id="settings-photo-input" type="file" style={{display:'none'}} accept="image/*" onChange={async(e) => {
                                    const file = e.target.files?.[0];
                                    if(!file || !user) return;
                                    const reader = new FileReader();
                                    reader.onload = async(ev) => {
                                        const img = new Image();
                                        img.onload = async() => {
                                            const canvas = document.createElement('canvas');
                                            const MAX = 300;
                                            let w = img.width, h = img.height;
                                            if(w > h){ if(w > MAX){h = Math.round(h*MAX/w); w=MAX;} } else { if(h > MAX){w = Math.round(w*MAX/h); h=MAX;} }
                                            canvas.width=w; canvas.height=h;
                                            canvas.getContext('2d').drawImage(img,0,0,w,h);
                                            const base64 = canvas.toDataURL('image/jpeg', 0.75);
                                            try {
                                                await usersCollection.doc(user.uid).update({photoURL: base64});
                                                onNotification(lang==='ar'?'تم تحديث الصورة!':'Photo updated!');
                                            } catch(err){ console.error(err); }
                                        };
                                        img.src = ev.target.result;
                                    };
                                    reader.readAsDataURL(file);
                                }} />
                            </div>
                            <div className="settings-account-card">
                                <div className="settings-account-row">
                                    <span className="settings-account-label">📧 {lang === 'ar' ? 'البريد' : 'Email'}</span>
                                    <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                                        <span className="settings-account-value">{showEmailLocal ? (user?.email || 'N/A') : maskEmail(user?.email)}</span>
                                        <button onClick={() => setShowEmailLocal(!showEmailLocal)} className="settings-eye-btn">{showEmailLocal ? '🙈' : '👁️'}</button>
                                    </div>
                                </div>
                                <div className="settings-account-row">
                                    <span className="settings-account-label">🪪 ID</span>
                                    <span className="settings-account-value" onClick={() => navigator.clipboard.writeText(userData?.customId || '')} style={{cursor:'pointer'}}>
                                        {userData?.customId || 'N/A'} 📋
                                    </span>
                                </div>
                                <div className="settings-account-row">
                                    <span className="settings-account-label">📅 {lang === 'ar' ? 'عضو منذ' : 'Member Since'}</span>
                                    <span className="settings-account-value">{userData?.createdAt?.toDate?.() ? userData.createdAt.toDate().toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="settings-account-row">
                                    <span className="settings-account-label">🔑 {lang === 'ar' ? 'نوع الحساب' : 'Account Type'}</span>
                                    <span className="settings-account-value" style={{color:'#10b981'}}>Google ✓</span>
                                </div>
                                <div className="settings-account-row">
                                    <span className="settings-account-label">✏️ {lang === 'ar' ? 'الاسم' : 'Name'}</span>
                                    {editingName ? (
                                        <div style={{display:'flex',gap:'4px'}}>
                                            <input className="input-dark" style={{padding:'4px 8px',fontSize:'11px',borderRadius:'6px',width:'120px'}} value={newName} onChange={e => setNewName(e.target.value)} placeholder={userData?.displayName} />
                                            <button className="btn-neon" style={{padding:'2px 8px',fontSize:'10px',borderRadius:'6px'}} onClick={async() => {
                                                if(newName.trim() && user) {
                                                    const now = new Date();
                                                    const lastChange = userData?.lastChangedName?.toDate?.() || new Date(0);
                                                    const diffDays = (now - lastChange) / (1000*60*60*24);
                                                    if(diffDays < 30) { onNotification(lang==='ar'?'يمكن التغيير مرة شهريًا':'Can change once per month'); setEditingName(false); return; }
                                                    await usersCollection.doc(user.uid).update({displayName:newName.trim(), lastChangedName:firebase.firestore.FieldValue.serverTimestamp()});
                                                    onNotification(lang==='ar'?'تم تغيير الاسم!':'Name changed!');
                                                    setEditingName(false);
                                                }
                                            }}>✓</button>
                                            <button className="btn-ghost" style={{padding:'2px 6px',fontSize:'10px',borderRadius:'6px'}} onClick={() => setEditingName(false)}>✕</button>
                                        </div>
                                    ) : (
                                        <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                                            <span className="settings-account-value">{userData?.displayName}</span>
                                            <button onClick={() => { setNewName(userData?.displayName || ''); setEditingName(true); }} className="settings-eye-btn">✏️</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Gender row */}
                            <div className="settings-account-row" style={{marginTop:'4px'}}>
                                <span className="settings-account-label">
                                    {(userData?.gender === 'male') ? '♂️' : (userData?.gender === 'female') ? '♀️' : '👤'}
                                    {' '}{lang === 'ar' ? 'الجنس' : 'Gender'}
                                </span>
                                <div style={{display:'flex', gap:'6px'}}>
                                    <button
                                        onClick={async () => {
                                            if (!user) return;
                                            await usersCollection.doc(user.uid).update({ gender: 'male' });
                                            onNotification(lang === 'ar' ? 'تم الحفظ ✓' : 'Saved ✓');
                                        }}
                                        style={{
                                            padding:'3px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:700, cursor:'pointer',
                                            background: userData?.gender === 'male' ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)',
                                            border: userData?.gender === 'male' ? '1.5px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                                            color: userData?.gender === 'male' ? '#93c5fd' : '#9ca3af'
                                        }}
                                    >♂️ {lang === 'ar' ? 'ذكر' : 'Male'}</button>
                                    <button
                                        onClick={async () => {
                                            if (!user) return;
                                            await usersCollection.doc(user.uid).update({ gender: 'female' });
                                            onNotification(lang === 'ar' ? 'تم الحفظ ✓' : 'Saved ✓');
                                        }}
                                        style={{
                                            padding:'3px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:700, cursor:'pointer',
                                            background: userData?.gender === 'female' ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.05)',
                                            border: userData?.gender === 'female' ? '1.5px solid #ec4899' : '1px solid rgba(255,255,255,0.1)',
                                            color: userData?.gender === 'female' ? '#f9a8d4' : '#9ca3af'
                                        }}
                                    >♀️ {lang === 'ar' ? 'أنثى' : 'Female'}</button>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Sound Toggle */}
                    <div className="settings-section">
                        <div className="settings-row">
                            <div className="settings-label">
                                <span className="settings-icon">🔊</span>
                                <span>{t.sound}</span>
                            </div>
                            <button
                                onClick={toggleSound}
                                className={`settings-toggle ${soundMutedLocal ? 'off' : 'on'}`}
                            >
                                {soundMutedLocal ? t.soundOff : t.soundOn}
                            </button>
                        </div>
                    </div>

                    )} {/* end logged-in account section */}
                    {/* Moments Section - only for logged-in users */}
                    {user && !isGuestPropForSettings && (
                    <div className="settings-section">
                        <div className="settings-section-title">
                            <span>📸</span>
                            <span>{lang === 'ar' ? 'لحظاتي' : 'My Moments'}</span>
                        </div>
                        <MomentsSettingsSection currentUser={user} userData={userData} lang={lang} />
                    </div>
                    )}

                    )} {/* end guest-restricted sections */}
                    {/* Achievements Section */}
                    <div className="settings-section">
                        <div className="settings-section-title">
                            <span>🏆</span>
                            <span>{t.achievements}</span>
                        </div>
                        <AchievementsDisplayV11 userData={userData} lang={lang} showAll={true} />
                    </div>

                    {/* Block Users Section - only for logged-in users */}
                    {user && !isGuestPropForSettings && (
                    <div className="settings-section">
                        <div className="settings-section-title">
                            <span>🚫</span>
                            <span>{t.blockedUsers}</span>
                        </div>
                        <div className="block-input-row">
                            <input
                                type="text"
                                className="input-dark"
                                value={blockInput}
                                onChange={e => setBlockInput(e.target.value)}
                                placeholder={t.friendIdPlaceholder}
                            />
                            <button
                                onClick={handleBlockUser}
                                disabled={loading || !blockInput.trim()}
                                className="btn-danger px-3 py-2 rounded text-xs"
                            >
                                {t.blockUser}
                            </button>
                        </div>
                        <div className="blocked-users-list">
                            {blockedUsers.length === 0 ? (
                                <div className="no-blocked-users">{t.noBlockedUsers}</div>
                            ) : (
                                blockedUsers.map(uid => (
                                    <BlockedUserItem
                                        key={uid}
                                        uid={uid}
                                        onUnblock={() => handleUnblockUser(uid)}
                                        lang={lang}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Blocked User Item Component
const BlockedUserItem = ({ uid, onUnblock, lang }) => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        usersCollection.doc(uid).get().then(doc => {
            if (doc.exists) {
                setUserData({ id: doc.id, ...doc.data() });
            }
        });
    }, [uid]);

    return (
        <div className="blocked-user-item">
            <AvatarWithFrame photoURL={userData?.photoURL} equipped={userData?.equipped} size="sm" />
            <span className="blocked-user-name">{userData?.displayName || uid.substring(0, 8)}</span>
            <button onClick={onUnblock} className="btn-ghost px-2 py-1 rounded text-xs">
                {lang === 'ar' ? 'إلغاء' : 'Unblock'}
            </button>
        </div>
    );
};


// ==========================================
// 🎉 ONBOARDING MODAL - New User Setup
// ==========================================
const OnboardingModal = ({ show, googleUser, onComplete, lang }) => {
    const [displayName, setDisplayName] = useState(googleUser?.displayName || '');
    const [gender, setGender] = useState('');
    const [photoURL, setPhotoURL] = useState(googleUser?.photoURL || null);
    const fileRef = useRef(null);

    if (!show) return null;

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX = 300;
                let w = img.width, h = img.height;
                if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
                else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                setPhotoURL(canvas.toDataURL('image/jpeg', 0.75));
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleComplete = () => {
        if (!displayName.trim() || !gender) return;
        onComplete({ displayName: displayName.trim(), gender, photoURL });
    };

    return (
        <div className="onboarding-overlay" style={{ zIndex: 9999 }}>
            <div className="onboarding-card animate-pop">
                <div className="onboarding-header">
                    <div className="onboarding-spy-icon">🕵️</div>
                    <h2 className="onboarding-title">{lang === 'ar' ? 'مرحباً في PRO SPY!' : 'Welcome to PRO SPY!'}</h2>
                    <p className="onboarding-subtitle">{lang === 'ar' ? 'أكمل ملفك الشخصي للبدء' : 'Complete your profile to start'}</p>
                </div>

                <div className="onboarding-body">
                    {/* Photo Upload */}
                    <div className="onboarding-photo-section">
                        <div className="onboarding-photo-wrapper" onClick={() => fileRef.current?.click()}>
                            <img
                                src={photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=7000ff&color=fff&size=300`}
                                alt="avatar"
                                className="onboarding-photo"
                            />
                            <div className="onboarding-photo-overlay">
                                <span className="onboarding-camera-icon">📷</span>
                            </div>
                        </div>
                        <input type="file" ref={fileRef} style={{ display: 'none' }} accept="image/*" onChange={handlePhotoChange} />
                        <p className="onboarding-photo-hint">{lang === 'ar' ? 'اضغط لتغيير الصورة' : 'Tap to change photo'}</p>
                    </div>

                    {/* Name Input */}
                    <div className="onboarding-field">
                        <label className="onboarding-label">
                            {lang === 'ar' ? '✏️ اسمك في اللعبة' : '✏️ Your display name'}
                        </label>
                        <input
                            className="onboarding-input"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            placeholder={lang === 'ar' ? 'أدخل اسمك...' : 'Enter your name...'}
                            maxLength={20}
                        />
                    </div>

                    {/* Gender Selection */}
                    <div className="onboarding-field">
                        <label className="onboarding-label">
                            {lang === 'ar' ? '👤 الجنس' : '👤 Gender'}
                        </label>
                        <div className="onboarding-gender-row">
                            <button
                                className={`onboarding-gender-btn ${gender === 'male' ? 'active' : ''}`}
                                onClick={() => setGender('male')}
                            >
                                <span style={{fontSize:'28px'}}>👨</span>
                                <span>{lang === 'ar' ? 'ذكر' : 'Male'}</span>
                            </button>
                            <button
                                className={`onboarding-gender-btn ${gender === 'female' ? 'active' : ''}`}
                                onClick={() => setGender('female')}
                            >
                                <span style={{fontSize:'28px'}}>👩</span>
                                <span>{lang === 'ar' ? 'أنثى' : 'Female'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="onboarding-footer">
                    <button
                        onClick={handleComplete}
                        disabled={!displayName.trim() || !gender}
                        className={`onboarding-submit-btn ${(!displayName.trim() || !gender) ? 'disabled' : ''}`}
                    >
                        {lang === 'ar' ? '🚀 ابدأ اللعب!' : '🚀 Start Playing!'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 🎮 MAIN APP COMPONENT
// ==========================================
function App() {
    const [lang, setLang] = useState(() => localStorage.getItem('pro_spy_lang') || 'en');

    // Helper: show login required for guests
    const requireAuth = useCallback((action) => {
        setNotification(lang === 'ar' ? '🔒 سجّل دخولك أولاً للقيام بهذا' : '🔒 Please login to do this');
    }, [lang]);
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [room, setRoom] = useState(null);
    const [roomId, setRoomId] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [nickname, setNickname] = useState(() => localStorage.getItem('pro_spy_nick') || '');
    const [loading, setLoading] = useState(false);
    const [turnTimer, setTurnTimer] = useState(30);
    const [votingTimer, setVotingTimer] = useState(30);
    const [wordSelTimer, setWordSelTimer] = useState(30);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [setupMode, setSetupMode] = useState('normal');
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [activeView, setActiveView] = useState('lobby');
    const [showDropdown, setShowDropdown] = useState(false);
    const [joinError, setJoinError] = useState('');
    const [alertMessage, setAlertMessage] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [charismaLeaderboard, setCharismaLeaderboard] = useState([]);
    const [leaderboardTab, setLeaderboardTab] = useState('wins');
    const [friendsData, setFriendsData] = useState([]);
    const [addFriendId, setAddFriendId] = useState('');
    const [friendSearchMsg, setFriendSearchMsg] = useState('');
    const [friendRequests, setFriendRequests] = useState([]);
    const [showMyAccount, setShowMyAccount] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [targetProfileUID, setTargetProfileUID] = useState(null);
    const [chatsMeta, setChatsMeta] = useState({});
    const [totalUnread, setTotalUnread] = useState(0);
    const [openChatId, setOpenChatId] = useState(null);
    const [showBrowseRooms, setShowBrowseRooms] = useState(false);
    const [copied, setCopied] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [showShop, setShowShop] = useState(false);
    const [showInventory, setShowInventory] = useState(false);
    const [showPrivateChat, setShowPrivateChat] = useState(false);
    const [showSelfChat, setShowSelfChat] = useState(false);
    const [showFunPass, setShowFunPass] = useState(false);
    const [chatFriend, setChatFriend] = useState(null);
    const [showLoginAlert, setShowLoginAlert] = useState(false);
    const [forcedLogoutMsg, setForcedLogoutMsg] = useState(false);
    
    // Single-session token: unique per browser tab/session
    const SESSION_TOKEN = React.useRef(
        (() => { let t = sessionStorage.getItem('pro_spy_st'); if(!t){ t=Math.random().toString(36).slice(2)+Date.now(); sessionStorage.setItem('pro_spy_st',t); } return t; })()
    ).current;
    const [guestData, setGuestData] = useState(null);
    const [showEmail, setShowEmail] = useState(false);
    const [showLoginRewards, setShowLoginRewards] = useState(false);
    const [sessionClaimedToday, setSessionClaimedToday] = useState(false); // Track if claimed in this session
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [onboardingGoogleUser, setOnboardingGoogleUser] = useState(null);
    const [pendingNewUserRef, setPendingNewUserRef] = useState(null);
    const [showLobbyPassword, setShowLobbyPassword] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const notificationBellRef = useRef(null);
    const [showSettings, setShowSettings] = useState(false);
    const [soundMuted, setSoundMuted] = useState(() => localStorage.getItem('pro_spy_sound_muted') === 'true');
    
    // Click outside handler for notification dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showNotifications && notificationBellRef.current && !notificationBellRef.current.contains(e.target)) {
                const dropdown = document.querySelector('.notification-dropdown');
                if (dropdown && !dropdown.contains(e.target)) {
                    setShowNotifications(false);
                }
            }
        };
        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);
    
    const t = TRANSLATIONS[lang];
    const isLoggedIn = useMemo(() => user && !user.isAnonymous, [user]);
    const isGuest = useMemo(() => guestData !== null, [guestData]);
    const isNotLoggedIn = useMemo(() => user === null && guestData === null, [user, guestData]);
    const currentUID = useMemo(() => { if (user && !user.isAnonymous) return user.uid; if (guestData) return guestData.uid; return null; }, [user, guestData]);
    const currentUserData = useMemo(() => { if (isLoggedIn) return userData; if (isGuest) return guestData; return null; }, [isLoggedIn, userData, isGuest, guestData]);

    // Background Animation
    useEffect(() => {
        const canvas = document.getElementById('bg-canvas'); if (!canvas) return;
        const ctx = canvas.getContext('2d'); let width, height, particles = []; let mouse = { x: null, y: null };
        const resize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };
        const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
        window.addEventListener('resize', resize); window.addEventListener('mousemove', handleMouseMove); resize();
        class Particle { constructor() { this.x = Math.random() * width; this.y = Math.random() * height; this.vx = (Math.random() - 0.5) * 0.5; this.vy = (Math.random() - 0.5) * 0.5; this.size = Math.random() * 2; }
            update() { this.x += this.vx; this.y += this.vy; if (this.x < 0 || this.x > width) this.vx *= -1; if (this.y < 0 || this.y > height) this.vy *= -1; if (mouse.x != null) { let dx = mouse.x - this.x; let dy = mouse.y - this.y; let dist = Math.sqrt(dx*dx + dy*dy); if (dist < 150) { const force = (150 - dist) / 150; this.x -= dx * force * 0.02; this.y -= dy * force * 0.02; } } }
            draw() { ctx.fillStyle = 'rgba(0, 242, 255, 0.5)'; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); } }
        for(let i=0; i<40; i++) particles.push(new Particle());
        let animId; const animate = () => { ctx.clearRect(0, 0, width, height); ctx.strokeStyle = 'rgba(112, 0, 255, 0.1)'; ctx.lineWidth = 1;
            for (let i = 0; i < particles.length; i++) { particles[i].update(); particles[i].draw(); for (let j = i; j < particles.length; j++) { let dx = particles[i].x - particles[j].x; let dy = particles[i].y - particles[j].y; let dist = Math.sqrt(dx*dx + dy*dy); if (dist < 120) { ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke(); } } }
            animId = requestAnimationFrame(animate); }; animate();
        return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', handleMouseMove); };
    }, []);

    // Auth State Listener
    useEffect(() => {
        setAuthLoading(true);
        const unsubAuth = auth.onAuthStateChanged(async (u) => {
            if (u && !u.isAnonymous) { 
                setUser(u); setGuestData(null);
                const userRef = usersCollection.doc(u.uid); 
                const doc = await userRef.get();
                if (!doc.exists) {
                    // New user - show onboarding modal
                    setOnboardingGoogleUser(u);
                    setPendingNewUserRef(userRef);
                    setAuthLoading(false);
                    setShowOnboarding(true);
                } else {
                    const existingData = doc.data();
                    setUserData(existingData);
                    if (existingData.displayName) setNickname(existingData.displayName);
                    // Write session token (single-session enforcement)
                    userRef.update({ activeSession: SESSION_TOKEN }).catch(() => {});
                    if (checkLoginRewardsCycle(existingData)) {
                        await userRef.update({ 'loginRewards.currentDay': 0, 'loginRewards.streak': 0, 'loginRewards.cycleMonth': getCurrentCycleMonth() });
                    }
                    const unsubSnap = userRef.onSnapshot(snap => {
                        if (snap.exists) {
                            const d = snap.data();
                            setUserData(d);
                            if (d.displayName) setNickname(d.displayName);
                            // Single-session: if activeSession changed by another device, force logout
                            if (d.activeSession && d.activeSession !== SESSION_TOKEN) {
                                setForcedLogoutMsg(true);
                                auth.signOut();
                            }
                        }
                    });
                    setAuthLoading(false);
                    return () => unsubSnap();
                }
            } else { setUser(null); setUserData(null); }
            setAuthLoading(false);
        }); 
        return unsubAuth;
    }, []);

    useEffect(() => { const tutorialDone = localStorage.getItem('pro_spy_tutorial_v2'); if(!tutorialDone && isLoggedIn) setShowTutorial(true); }, [isLoggedIn]);
    useEffect(() => { if (!user || isGuest) return; const interval = setInterval(() => { usersCollection.doc(user.uid).update({ lastActive: firebase.firestore.FieldValue.serverTimestamp() }); }, 60000); return () => clearInterval(interval); }, [user, isGuest]);

    // Check for login rewards
    useEffect(() => {
        if (isLoggedIn && userData && !sessionClaimedToday) {
            const loginData = userData.loginRewards || { currentDay: 0, lastClaimDate: null };
            const lcd = loginData.lastClaimDate;
            let lastClaimDate = null;
            if (lcd?.toDate) lastClaimDate = lcd.toDate();
            else if (lcd instanceof Date) lastClaimDate = lcd;
            else if (lcd) { const d = new Date(lcd); if (!isNaN(d.getTime())) lastClaimDate = d; }
            const todayStr = new Date().toDateString();
            const lastClaimStr = lastClaimDate ? lastClaimDate.toDateString() : null;
            const canClaim = lastClaimStr !== todayStr;
            if (canClaim && loginData.currentDay < 30) setShowLoginRewards(true);
        }
    }, [isLoggedIn, userData?.loginRewards?.lastClaimDate, sessionClaimedToday]);

    // Notifications Listener
    useEffect(() => {
        if (!user || !isLoggedIn) return;
        let previousCount = -1;
        const unsub = notificationsCollection.where('toUserId', '==', user.uid).limit(50).onSnapshot(snap => {
            let notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            notifs.sort((a, b) => { const timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds || 0; const timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds || 0; return timeB - timeA; });
            const newUnread = notifs.filter(n => !n.read).length;
            if (previousCount !== -1 && newUnread > previousCount) { playNotificationSound(); if (notificationBellRef.current) { notificationBellRef.current.classList.add('ringing'); setTimeout(() => notificationBellRef.current?.classList.remove('ringing'), 500); } }
            previousCount = newUnread;
            setNotifications(notifs);
            setUnreadNotifications(newUnread);
        }, error => { console.error('Notifications error:', error); });
        return () => unsub();
    }, [user, isLoggedIn]);

    // Room Listener
    useEffect(() => { if (!roomId) return; const unsub = roomsCollection.doc(roomId).onSnapshot(async doc => { if (doc.exists) { const data = doc.data(); setRoom(data); if(data.status?.includes('finished') && !data.summaryShown) { setShowSummary(true); historyCollection.add({ ...data, finishedAt: firebase.firestore.FieldValue.serverTimestamp() }); roomsCollection.doc(roomId).update({summaryShown: true}); } } else { setRoom(null); setRoomId(''); } }); return unsub; }, [roomId]);

    // Leaderboard - Real-time
    useEffect(() => { if (activeView === 'leaderboard') { const unsub = usersCollection.orderBy('stats.wins', 'desc').limit(100).onSnapshot(snap => { let data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => !d.isAnonymous); setLeaderboardData(data); }, error => { usersCollection.limit(100).get().then(snap => { let data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => !d.isAnonymous); data.sort((a, b) => (b.stats?.wins || 0) - (a.stats?.wins || 0)); setLeaderboardData(data); }); }); return unsub; } }, [activeView]);
    
    // Charisma Leaderboard - Real-time
    useEffect(() => {
        if (activeView === 'leaderboard' && leaderboardTab === 'charisma') {
            const unsub = usersCollection.orderBy('charisma', 'desc').limit(100).onSnapshot(snap => {
                let data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => !d.isAnonymous);
                setCharismaLeaderboard(data);
            }, error => {
                usersCollection.limit(100).get().then(snap => {
                    let data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => !d.isAnonymous);
                    data.sort((a, b) => (b.charisma || 0) - (a.charisma || 0));
                    setCharismaLeaderboard(data);
                });
            });
            return unsub;
        }
    }, [activeView, leaderboardTab]);
    
    // ✅ FIXED: Friends - Real-time with online status
    // ✅ REALTIME friends - always active (not just when tab is open)
    useEffect(() => { 
        if (userData && user && isLoggedIn) { 
            if (userData.friends?.length > 0) { 
                const unsub = usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', userData.friends).onSnapshot(snap => { 
                    const friends = snap.docs.map(d => { 
                        const data = d.data();
                        const lastActive = data.lastActive?.toDate?.() || new Date(0);
                        const isOnline = (Date.now() - lastActive.getTime()) < 300000;
                        return { id: d.id, ...data, isOnline };
                    });
                    setFriendsData(friends); 
                }); 
                return unsub; 
            } else { setFriendsData([]); } 
        } 
    }, [userData?.friends, user, isLoggedIn]);
    
    // Friend Requests - Real-time
    useEffect(() => { if (userData && user && isLoggedIn) { if (userData.friendRequests?.length > 0) { const unsub = usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', userData.friendRequests).onSnapshot(snap => { setFriendRequests(snap.docs.map(d => ({ id: d.id, ...d.data() }))); }); return unsub; } else { setFriendRequests([]); } } }, [userData?.friendRequests, user, isLoggedIn]);
    
    // Chats Meta - Real-time
    useEffect(() => { if (!user || !isLoggedIn) return; const unsub = chatsCollection.where('members', 'array-contains', user.uid).onSnapshot(snap => { let total = 0; const meta = {}; snap.docs.forEach(doc => { const d = doc.data(); meta[doc.id] = d; const myUnread = d.unread?.[user.uid] || 0; total += myUnread; }); setChatsMeta(meta); setTotalUnread(total); }); return unsub; }, [user, isLoggedIn]);
    
    // Timers
    useEffect(() => { if (room?.status === 'discussing' && room?.turnEndTime) { const interval = setInterval(() => { const remaining = Math.max(0, Math.floor((room.turnEndTime - Date.now()) / 1000)); setTurnTimer(remaining); if (remaining <= 0) { handleSkipTurn(true); clearInterval(interval); } }, 1000); return () => clearInterval(interval); } else setTurnTimer(30); }, [room?.status, room?.turnEndTime]);
    useEffect(() => { if (room?.status === 'voting' && room?.votingEndTime) { const interval = setInterval(() => { const remaining = Math.max(0, Math.floor((room.votingEndTime - Date.now()) / 1000)); setVotingTimer(remaining); if (remaining <= 0) { clearInterval(interval); } }, 1000); return () => clearInterval(interval); } else setVotingTimer(30); }, [room?.status, room?.votingEndTime]);
    useEffect(() => { if (room?.status === 'word_selection' && room?.wordSelEndTime) { const interval = setInterval(() => { const remaining = Math.max(0, Math.floor((room.wordSelEndTime - Date.now()) / 1000)); setWordSelTimer(remaining); if (remaining <= 0) { clearInterval(interval); } }, 1000); return () => clearInterval(interval); } else setWordSelTimer(30); }, [room?.status, room?.wordSelEndTime]);

    // Auth Functions
    const handleGoogleLogin = useCallback(async () => { const provider = new firebase.auth.GoogleAuthProvider(); try { await auth.signInWithPopup(provider); setShowDropdown(false); } catch (e) { console.error('Google login error:', e); } }, []);
    const handleLogout = useCallback(async () => { if (user) await auth.signOut(); setShowDropdown(false); setNickname(''); setGuestData(null); localStorage.removeItem('pro_spy_guest_uid'); localStorage.removeItem('pro_spy_nick'); }, [user]);

    // Onboarding Complete Handler
    const handleOnboardingComplete = useCallback(async ({ displayName, gender, photoURL }) => {
        if (!onboardingGoogleUser || !pendingNewUserRef) return;
        const u = onboardingGoogleUser;
        const finalPhoto = photoURL || u.photoURL || null;
        const newUserData = {
            uid: u.uid,
            email: u.email || null,
            displayName: displayName,
            photoURL: finalPhoto,
            gender: gender,
            customId: Math.floor(100000 + Math.random() * 900000).toString(),
            stats: { wins: 0, losses: 0, xp: 0 },
            achievements: [],
            friends: [],
            friendRequests: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastChangedName: null,
            lastActive: firebase.firestore.FieldValue.serverTimestamp(),
            isAnonymous: false,
            currency: 100,
            inventory: { frames: [], titles: [], themes: [], badges: [], gifts: [] },
            equipped: { badges: [] },
            charisma: 0,
            bannerURL: null,
            loginRewards: { currentDay: 0, lastClaimDate: null, streak: 0, totalClaims: 0, cycleMonth: getCurrentCycleMonth() },
            activeSession: SESSION_TOKEN
        };
        await pendingNewUserRef.set(newUserData);
        setUserData(newUserData);
        setNickname(displayName);
        setUser(u);
        setGuestData(null);
        setShowOnboarding(false);
        setOnboardingGoogleUser(null);
        setPendingNewUserRef(null);
        // Start listening to user doc
        pendingNewUserRef.onSnapshot(snap => {
            if (snap.exists) { setUserData(snap.data()); if (snap.data().displayName) setNickname(snap.data().displayName); }
        });
        playSound('success');
        setNotification(lang === 'ar' ? '🎉 مرحباً بك!' : '🎉 Welcome aboard!');
    }, [onboardingGoogleUser, pendingNewUserRef, lang]);

    // Guest System
    useEffect(() => {
        const initGuest = async () => {
            if (authLoading) return; if (user && !user.isAnonymous) return;
            const savedGuestUID = localStorage.getItem('pro_spy_guest_uid');
            if (savedGuestUID) { try { const doc = await guestsCollection.doc(savedGuestUID).get(); if (doc.exists) { setGuestData({ id: doc.id, ...doc.data() }); if (doc.data().displayName) setNickname(doc.data().displayName); return; } } catch (e) { console.error('Error loading guest:', e); } }
            const savedNick = localStorage.getItem('pro_spy_nick');
            const guestNick = savedNick || ('Player_' + Math.random().toString(36).substring(2, 6));
            const guestUID = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
            const newGuestData = { uid: guestUID, displayName: guestNick, photoURL: null, customId: Math.floor(100000 + Math.random() * 900000).toString(), stats: { wins: 0, losses: 0, xp: 0 }, currency: 0, charisma: 0, equipped: { badges: [] }, inventory: { frames: [], titles: [], themes: [], badges: [], gifts: [] }, isAnonymous: true, isGuest: true, createdAt: firebase.firestore.FieldValue.serverTimestamp(), lastActive: firebase.firestore.FieldValue.serverTimestamp() };
            try { await guestsCollection.doc(guestUID).set(newGuestData); setGuestData(newGuestData); setNickname(guestNick); localStorage.setItem('pro_spy_guest_uid', guestUID); localStorage.setItem('pro_spy_nick', guestNick); } catch (e) { console.error('Auto guest creation error:', e); }
        };
        initGuest();
    }, [authLoading, user]);
    
    useEffect(() => { if (!guestData?.uid) return; const unsub = guestsCollection.doc(guestData.uid).onSnapshot(snap => { if (snap.exists) setGuestData({ id: snap.id, ...snap.data() }); }); return unsub; }, [guestData?.uid]);
    
    const getDefaultPhoto = useCallback((uData, name) => uData?.photoURL || `https://ui-avatars.com/api/?name=${name || 'Guest'}&background=random`, []);

    // Notification Functions
    const createNotification = useCallback(async (toUserId, type, message, fromUserId, fromName, giftData = null) => { try { await notificationsCollection.add({ toUserId, fromUserId, fromName, type, message, giftData, timestamp: firebase.firestore.FieldValue.serverTimestamp(), read: false }); } catch (e) { console.error('Notification error:', e); } }, []);
    const markNotificationRead = useCallback(async (notifId) => { try { await notificationsCollection.doc(notifId).update({ read: true }); } catch (e) { console.error('Mark read error:', e); } }, []);
    const clearAllNotifications = useCallback(async () => { try { const batch = db.batch(); notifications.forEach(n => { batch.delete(notificationsCollection.doc(n.id)); }); await batch.commit(); setNotifications([]); setUnreadNotifications(0); } catch (e) { console.error('Clear notifications error:', e); } }, [notifications]);
    const handleNotificationClick = useCallback((notif) => { if (notif.type === 'friend_request') { setActiveView('friends'); } else if (notif.type === 'gift') { setNotification(notif.message); } else if (notif.type === 'message') { if (notif.fromUserId && notif.fromName) { const friend = { uid: notif.fromUserId, displayName: notif.fromName, photoURL: notif.fromPhoto }; setChatFriend(friend); setShowPrivateChat(true); } } }, []);

    // Claim Login Reward
    const handleClaimLoginReward = useCallback(async (day) => {
        if (!user || !isLoggedIn) return;
        // Safety: re-read current day from Firestore to avoid stale data
        const freshDoc = await usersCollection.doc(user.uid).get();
        const freshData = freshDoc.data();
        const freshLoginData = freshData?.loginRewards || {};
        const freshDay = freshLoginData.currentDay || 0;
        // The next day to claim must match what we expect
        const expectedNextDay = freshDay + 1;
        if (day !== expectedNextDay) {
            console.warn('Day mismatch, using fresh day:', freshDay, '-> claiming day:', expectedNextDay);
            day = expectedNextDay; // Fix stale day
        }
        const reward = LOGIN_REWARDS[day - 1];
        if (!reward) return;
        try {
            const userRef = usersCollection.doc(user.uid);
            const userDoc = await userRef.get();
            const userData = userDoc.data();
            const inventory = userData?.inventory || { frames: [], titles: [], badges: [], gifts: [] };
            const updates = {};
            
            switch (reward.type) {
                case 'currency':
                    updates.currency = firebase.firestore.FieldValue.increment(reward.amount);
                    setNotification(`${lang === 'ar' ? 'حصلت على' : 'You received'} +${reward.amount} 🧠!`);
                    break;
                case 'frame':
                    if (!inventory.frames?.includes(reward.itemId)) { updates['inventory.frames'] = firebase.firestore.FieldValue.arrayUnion(reward.itemId); setNotification(`${lang === 'ar' ? '🎉 حصلت على إطار!' : '🎉 You received a frame!'} ${lang === 'ar' ? reward.name_ar : reward.name_en}`); }
                    else { updates.currency = firebase.firestore.FieldValue.increment(500); setNotification(`${lang === 'ar' ? 'الإطار مملوك! +500 إنتل' : 'Frame owned! +500 Intel'}! 🧠`); }
                    break;
                case 'badge':
                    if (!inventory.badges?.includes(reward.itemId)) { updates['inventory.badges'] = firebase.firestore.FieldValue.arrayUnion(reward.itemId); setNotification(`${lang === 'ar' ? '🎉 حصلت على شارة!' : '🎉 You received a badge!'} ${lang === 'ar' ? reward.name_ar : reward.name_en}`); }
                    else { updates.currency = firebase.firestore.FieldValue.increment(500); setNotification(`${lang === 'ar' ? 'الشارة مملوكة! +500 إنتل' : 'Badge owned! +500 Intel'}! 🧠`); }
                    break;
                case 'title':
                    if (!inventory.titles?.includes(reward.itemId)) { updates['inventory.titles'] = firebase.firestore.FieldValue.arrayUnion(reward.itemId); setNotification(`${lang === 'ar' ? '🎉 حصلت على لقب!' : '🎉 You received a title!'} ${lang === 'ar' ? reward.name_ar : reward.name_en}`); }
                    else { updates.currency = firebase.firestore.FieldValue.increment(500); setNotification(`${lang === 'ar' ? 'اللقب مملوك! +500 إنتل' : 'Title owned! +500 Intel'}! 🧠`); }
                    break;
            }
            updates['loginRewards.currentDay'] = day;
            updates['loginRewards.lastClaimDate'] = firebase.firestore.FieldValue.serverTimestamp();
            updates['loginRewards.streak'] = firebase.firestore.FieldValue.increment(1);
            updates['loginRewards.totalClaims'] = firebase.firestore.FieldValue.increment(1);
            updates['loginRewards.cycleMonth'] = getCurrentCycleMonth();
            await userRef.update(updates);
            playRewardSound();
            setShowLoginRewards(false);
            setSessionClaimedToday(true); // Mark as claimed for this session
        } catch (error) { console.error('Claim reward error:', error); setNotification(lang === 'ar' ? 'حدث خطأ!' : 'An error occurred!'); }
    }, [user, isLoggedIn, lang]);

    // Room Functions
    const handleCreateGame = useCallback(async () => { 
        if (!nickname.trim()) return; 
        if (isPrivate && !password.trim()) { setAlertMessage(t.privateRoomError); return; }
        playSound('click'); setLoading(true); 
        const uid = currentUID; const tempUserData = currentUserData;
        if (!uid) { setLoading(false); setAlertMessage(lang === 'ar' ? 'حدث خطأ' : 'Error'); return; } 
        const id = Math.random().toString(36).substring(2, 7).toUpperCase(); 
        await roomsCollection.doc(id).set({ id, admin: uid, status: 'waiting', players: [{ uid: uid, name: nickname, status: 'active', photo: getDefaultPhoto(tempUserData, nickname), role: null, equipped: tempUserData?.equipped || {} }], scenario: null, spyId: null, currentTurnUID: null, turnEndTime: null, votingEndTime: null, currentRound: 0, messages: [], votes: {}, usedLocations: [], wordVotes: {}, chosenWord: null, wordSelEndTime: null, votingRequest: null, mode: setupMode, isPrivate: isPrivate, password: isPrivate ? password : null, startedAt: null, summaryShown: false }); 
        setRoomId(id); setLoading(false); setShowSetupModal(false); setActiveView('lobby');
        navigator.clipboard.writeText(id); setCopied(true); setTimeout(() => setCopied(false), 2000);
    }, [nickname, isPrivate, password, currentUID, currentUserData, setupMode, t, lang, getDefaultPhoto]);
    
    const handleJoinGame = useCallback(async (id, pwd) => {
        if (!id || id.trim() === "") { setJoinError(t.enterCodeError); return; }
        if (!nickname.trim()) return;
        playSound('click'); setLoading(true); setJoinError(''); 
        const uid = currentUID; const tempUserData = currentUserData;
        if (!uid) { setLoading(false); setAlertMessage(lang === 'ar' ? 'حدث خطأ' : 'Error'); return; } 
        const ref = roomsCollection.doc(id.toUpperCase()); 
        const snap = await ref.get(); 
        if (snap.exists) { 
            const data = snap.data(); 
            if(data.isPrivate && data.password !== pwd) { setJoinError(lang === 'ar' ? 'كلمة السر غير صحيحة' : "Incorrect Password"); setLoading(false); return; } 
            const exists = data.players.find(p => p.uid === uid); 
            if (!exists) { await ref.update({ players: [...data.players, { uid: uid, name: nickname, status: 'active', photo: getDefaultPhoto(tempUserData, nickname), role: null, equipped: tempUserData?.equipped || {} }] }); } 
            setRoomId(id.toUpperCase()); setActiveView('lobby'); setShowBrowseRooms(false);
        } else { setJoinError(lang === 'ar' ? 'الغرفة غير موجودة' : "Room not found"); } 
        setLoading(false); 
    }, [nickname, currentUID, currentUserData, t, lang, getDefaultPhoto]);
    
    const handleLeaveRoom = useCallback(async () => { 
        if (!room || !currentUID) return; 
        playSound('click'); 
        const isAdmin = room.admin === currentUID;
        if (isAdmin) { await roomsCollection.doc(roomId).delete(); } else { await roomsCollection.doc(roomId).update({ players: room.players.filter(p => p.uid !== currentUID) }); }
        setRoom(null); setRoomId(''); setShowSummary(false); 
    }, [room, currentUID, roomId]);

    // Game Logic Functions
    const startGame = useCallback(async () => { if (room.admin !== currentUID) return; playSound('success'); const activePlayers = room.players.filter(p => p.status === 'active'); const playerCount = activePlayers.length; if (room.mode === 'advanced' && playerCount < 6) { setAlertMessage("Advanced mode requires 6+ players!"); return; } if (playerCount < 3) { setAlertMessage(t.needPlayers); return; } if (playerCount > 10) { setAlertMessage("Max 10 players."); return; } const used = room.usedLocations || []; const avail = SCENARIOS.filter(s => !used.includes(s.loc_en)); const scenario = (avail.length > 0 ? avail : SCENARIOS)[Math.floor(Math.random() * (avail.length || SCENARIOS.length))]; const spy = activePlayers[Math.floor(Math.random() * activePlayers.length)]; let roles = {}; if (room.mode === 'advanced') { roles[spy.uid] = 'spy'; let potentialWhites = activePlayers.filter(p => p.uid !== spy.uid); if(potentialWhites.length > 0) { const mrWhite = potentialWhites[Math.floor(Math.random() * potentialWhites.length)]; roles[mrWhite.uid] = 'mrwhite'; potentialWhites = potentialWhites.filter(p => p.uid !== mrWhite.uid); } if(potentialWhites.length > 0) { const informant = potentialWhites[Math.floor(Math.random() * potentialWhites.length)]; roles[informant.uid] = 'informant'; } activePlayers.forEach(p => { if(!roles[p.uid]) roles[p.uid] = 'agent'; }); } else { activePlayers.forEach(p => roles[p.uid] = p.uid === spy.uid ? 'spy' : 'agent'); } let potentialStarters = activePlayers.filter(p => roles[p.uid] !== 'spy'); if (potentialStarters.length === 0) potentialStarters = activePlayers; const firstPlayer = potentialStarters[Math.floor(Math.random() * potentialStarters.length)]; await roomsCollection.doc(roomId).update({ status: 'word_selection', scenario, spyId: spy.uid, currentTurnUID: firstPlayer.uid, turnEndTime: null, currentRound: 1, players: room.players.map(p => ({ ...p, vote: null, role: roles[p.uid] || 'agent' })), usedLocations: firebase.firestore.FieldValue.arrayUnion(scenario.loc_en), messages: [], votes: {}, wordVotes: {}, chosenWord: null, wordSelEndTime: Date.now() + 30000, votingRequest: null, startedAt: firebase.firestore.FieldValue.serverTimestamp() }); }, [room, currentUID, roomId, t]);
    const submitWordVote = useCallback(async (word) => { if (!currentUID || !room || room.status !== 'word_selection') return; playSound('click'); const voteUpdate = {}; voteUpdate[`wordVotes.${currentUID}`] = word; await roomsCollection.doc(roomId).update(voteUpdate); }, [currentUID, room, roomId]);
    const handleSkipTurn = useCallback(async (forced = false) => { if (!room) return; if (!forced && room.currentTurnUID !== currentUID) return; if (forced && room.status !== 'discussing') return; nextTurn(); }, [room, currentUID]);
    const nextTurn = useCallback(async () => { if (!room) return; const activePlayers = room.players.filter(p => p.status === 'active'); const currentIndex = activePlayers.findIndex(p => p.uid === room.currentTurnUID); const nextIndex = (currentIndex + 1) % activePlayers.length; await roomsCollection.doc(roomId).update({ currentTurnUID: activePlayers[nextIndex].uid, turnEndTime: Date.now() + 30000 }); }, [room, roomId]);
    const requestVoting = useCallback(async () => { if (!room || room.status !== 'discussing') return; playSound('click'); if (room.admin === currentUID) { await triggerVoting(); return; } await roomsCollection.doc(roomId).update({ votingRequest: { requestedBy: currentUID, votes: { [currentUID]: true } } }); }, [room, currentUID, roomId]);
    const agreeToVote = useCallback(async () => { if (!room || !room.votingRequest) return; playSound('click'); const currentVotes = room.votingRequest.votes || {}; const newVotes = { ...currentVotes, [currentUID]: true }; const activePlayers = room.players.filter(p => p.status === 'active'); if (currentUID === room.admin) { await triggerVoting(); return; } const agreeCount = Object.values(newVotes).filter(v => v === true).length; const majorityCount = Math.floor(activePlayers.length / 2) + 1; if (agreeCount >= majorityCount) { await triggerVoting(); } else { await roomsCollection.doc(roomId).update({ "votingRequest.votes": newVotes }); } }, [room, currentUID, roomId]);
    const declineVote = useCallback(async () => { if (!room || !room.votingRequest) return; playSound('click'); const currentVotes = room.votingRequest.votes || {}; const newVotes = { ...currentVotes, [currentUID]: false }; const activePlayers = room.players.filter(p => p.status === 'active'); const declineCount = Object.values(newVotes).filter(v => v === false).length; const majorityCount = Math.floor(activePlayers.length / 2) + 1; if (declineCount >= majorityCount) { await roomsCollection.doc(roomId).update({ votingRequest: null }); } else { await roomsCollection.doc(roomId).update({ "votingRequest.votes": newVotes }); } }, [room, currentUID, roomId]);
    const triggerVoting = useCallback(async () => { playSound('click'); const sysMsg = { sender: 'system', name: 'SYSTEM', text: t.votingStarted, time: Date.now() }; await roomsCollection.doc(roomId).update({ status: 'voting', currentTurnUID: null, turnEndTime: null, votingEndTime: Date.now() + 30000, messages: firebase.firestore.FieldValue.arrayUnion(sysMsg), votingRequest: null }); }, [roomId, t]);
    const submitVote = useCallback(async (targetUID) => { if (!targetUID || !currentUID || (room.votes && room.votes[currentUID])) return; playSound('click'); const voteUpdate = {}; voteUpdate[`votes.${currentUID}`] = targetUID; await roomsCollection.doc(roomId).update(voteUpdate); }, [room, currentUID, roomId]);
    const resetGame = useCallback(async () => { playSound('click'); await roomsCollection.doc(roomId).update({ status: 'waiting', scenario: null, spyId: null, currentTurnUID: null, currentRound: 0, votes: {}, messages: [], votingEndTime: null, turnEndTime: null, players: room.players.map(p => ({ uid: p.uid, name: p.name, status: 'active', photo: p.photo, role: null })), wordVotes: {}, chosenWord: null, wordSelEndTime: null, votingRequest: null, startedAt: null, finishedAt: null, summaryShown: false }); setShowSummary(false); }, [room, roomId]);

    // Friend Functions
    const openProfile = useCallback((uid) => { if(!uid) return; setTargetProfileUID(uid); setShowUserProfile(true); }, []);
    const openPrivateChat = useCallback((friend) => { setChatFriend(friend); setShowPrivateChat(true); if (user) { const cId = [user.uid, friend.uid].sort().join('_'); setOpenChatId(cId); chatsCollection.doc(cId).update({ [`unread.${user.uid}`]: 0 }).catch(() => {}); } }, [user]);
    const closePrivateChat = useCallback(() => { setShowPrivateChat(false); setChatFriend(null); setOpenChatId(null); }, []);
    const handleSendRequest = useCallback(async (targetUid) => { if (!targetUid || !isLoggedIn) return; if (userData.friends?.includes(targetUid)) return; if (userData.friendRequests?.includes(targetUid)) return; await usersCollection.doc(targetUid).update({ friendRequests: firebase.firestore.FieldValue.arrayUnion(user.uid) }); await createNotification(targetUid, 'friend_request', `${userData.displayName} ${t.friendRequest}`, user.uid, userData.displayName); }, [userData, user, isLoggedIn, t, createNotification]);
    const handleAddFriendById = useCallback(async () => {
        if (!addFriendId.trim() || !isLoggedIn) return;
        setFriendSearchMsg('');
        const userQuery = await usersCollection.where('customId', '==', addFriendId.trim()).get();
        if (userQuery.empty) { const uidQuery = await usersCollection.where(firebase.firestore.FieldPath.documentId(), '>=', addFriendId.trim()).where(firebase.firestore.FieldPath.documentId(), '<=', addFriendId.trim() + '\uf8ff').get(); if (uidQuery.empty) { setFriendSearchMsg(t.friendNotFound); return; } const targetUid = uidQuery.docs[0].id; if (targetUid === user.uid) { setFriendSearchMsg(lang === 'ar' ? 'لا يمكنك إضافة نفسك' : 'Cannot add yourself'); return; } if (userData.friends?.includes(targetUid)) { setFriendSearchMsg(lang === 'ar' ? 'صديق بالفعل' : 'Already a friend'); return; } await handleSendRequest(targetUid); setFriendSearchMsg(t.requestSent); setAddFriendId(''); return; }
        const targetUid = userQuery.docs[0].id;
        if (targetUid === user.uid) { setFriendSearchMsg(lang === 'ar' ? 'لا يمكنك إضافة نفسك' : 'Cannot add yourself'); return; }
        if (userData.friends?.includes(targetUid)) { setFriendSearchMsg(lang === 'ar' ? 'صديق بالفعل' : 'Already a friend'); return; }
        if (userData.friendRequests?.includes(targetUid)) { setFriendSearchMsg(lang === 'ar' ? 'لديك طلب من هذا المستخدم' : 'You have a request from this user'); return; }
        await handleSendRequest(targetUid);
        setFriendSearchMsg(t.requestSent);
        setAddFriendId('');
    }, [addFriendId, isLoggedIn, userData, user, t, lang, handleSendRequest]);
    const handleAcceptRequest = useCallback(async (fromUid) => {
        if (!user || !isLoggedIn) return;
        await usersCollection.doc(user.uid).update({ friends: firebase.firestore.FieldValue.arrayUnion(fromUid), friendRequests: firebase.firestore.FieldValue.arrayRemove(fromUid) });
        await usersCollection.doc(fromUid).update({ friends: firebase.firestore.FieldValue.arrayUnion(user.uid) });
        await createNotification(fromUid, 'friend_request_accepted', `${userData.displayName} ${lang === 'ar' ? 'قبل طلب صداقتك!' : 'accepted your friend request!'}`, user.uid, userData.displayName);
        setNotification(t.friendAdded);
    }, [user, isLoggedIn, t, userData, createNotification, lang]);
    const handleRejectRequest = useCallback(async (fromUid) => { if (!user || !isLoggedIn) return; await usersCollection.doc(user.uid).update({ friendRequests: firebase.firestore.FieldValue.arrayRemove(fromUid) }); }, [user, isLoggedIn]);

    // ==========================================
    // 🎁 GIFT FUNCTIONS - NO CASHBACK, BONUS FOR RECEIVER ONLY
    // ==========================================
    const handleSendGiftToUser = useCallback(async (gift, targetUser) => {
        const currency = userData?.currency || 0;
        if (currency < gift.cost) return;
        
        // ✅ Generate bonus for RECEIVER only
        const minBonus = gift.minBonus || 1;
        const maxBonus = gift.maxBonus || Math.floor(gift.cost * 0.1);
        const bonusForReceiver = generateRandomBonus(minBonus, maxBonus);
        
        const giftName = lang === 'ar' ? gift.name_ar : gift.name_en;
        
        try {
            // Deduct from sender (NO cashback)
            await usersCollection.doc(user.uid).update({ 
                currency: firebase.firestore.FieldValue.increment(-gift.cost)
            });
            
            if (targetUser?.uid === 'self' || targetUser?.uid === user.uid) {
                // Sending to self
                await usersCollection.doc(user.uid).update({ 
                    charisma: firebase.firestore.FieldValue.increment(gift.charisma),
                    currency: firebase.firestore.FieldValue.increment(bonusForReceiver)
                });
                
                // ✅ Log self-sent gift to gifts_log collection too
                await giftsLogCollection.add({
                    senderId: user.uid,
                    senderName: userData?.displayName || 'User',
                    senderPhoto: userData?.photoURL || null,
                    receiverId: user.uid,
                    receiverName: userData?.displayName || 'User',
                    giftId: gift.id,
                    giftName: giftName,
                    giftNameEn: gift.name_en,
                    giftNameAr: gift.name_ar,
                    giftEmoji: gift.emoji,
                    giftImageUrl: gift.imageUrl || '',
                    charisma: gift.charisma,
                    bonus: bonusForReceiver,
                    cost: gift.cost,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // 📝 Also log gift card to SelfChat
                try {
                    const selfChatId = `${user.uid}_self`;
                    const selfChatRef = chatsCollection.doc(selfChatId);
                    await selfChatRef.set({
                        participants: [user.uid, user.uid],
                        type: 'self',
                        lastMessage: `🎁 ${giftName}`,
                        lastAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                    await selfChatRef.collection('messages').add({
                        type: 'gift',
                        giftEmoji: gift.emoji || '🎁',
                        giftName: `${gift.name_en} / ${gift.name_ar}`,
                        giftCost: gift.cost,
                        charismaGain: gift.charisma,
                        bonusIntel: bonusForReceiver,
                        senderId: user.uid,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } catch(e) { console.warn('SelfChat gift log:', e); }
            } else {
                // Sending to another person - add charisma AND bonus
                await usersCollection.doc(targetUser.uid).update({ 
                    charisma: firebase.firestore.FieldValue.increment(gift.charisma),
                    currency: firebase.firestore.FieldValue.increment(bonusForReceiver)
                });
                
                const chatId = [user.uid, targetUser.uid].sort().join('_');
                
                // Add gift message to chat
                await chatsCollection.doc(chatId).collection('messages').add({
                    senderId: user.uid,
                    senderName: userData?.displayName || 'User',
                    senderPhoto: userData?.photoURL || null,
                    type: 'gift',
                    giftId: gift.id,
                    giftName: giftName,
                    giftNameEn: gift.name_en,
                    giftNameAr: gift.name_ar,
                    giftEmoji: gift.emoji,
                    giftCharisma: gift.charisma,
                    giftBonus: bonusForReceiver,
                    text: `🎁 ${lang === 'ar' ? 'أرسل هدية' : 'Sent a gift'}: ${gift.emoji}`,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Update chat metadata
                await chatsCollection.doc(chatId).set({
                    members: [user.uid, targetUser.uid],
                    lastMessage: `🎁 ${giftName}`,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    [`unread.${targetUser.uid}`]: firebase.firestore.FieldValue.increment(1)
                }, { merge: true });
                
                // ✅ Log gift to gifts_log collection
                await giftsLogCollection.add({
                    senderId: user.uid,
                    senderName: userData?.displayName || 'User',
                    senderPhoto: userData?.photoURL || null,
                    receiverId: targetUser.uid,
                    receiverName: targetUser.displayName || 'User',
                    giftId: gift.id,
                    giftName: giftName,
                    giftNameEn: gift.name_en,
                    giftNameAr: gift.name_ar,
                    giftEmoji: gift.emoji,
                    giftImageUrl: gift.imageUrl || '',
                    charisma: gift.charisma,
                    bonus: bonusForReceiver,
                    cost: gift.cost,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Send notification to receiver
                await createNotification(
                    targetUser.uid, 
                    'gift', 
                    `${userData?.displayName || 'User'} ${t.sentAGift}: ${gift.emoji} (+${formatCharisma(gift.charisma)} ⭐, +${bonusForReceiver} 🧠)`, 
                    user.uid, 
                    userData?.displayName || 'User', 
                    { giftId: gift.id, giftEmoji: gift.emoji, giftName, charisma: gift.charisma, bonus: bonusForReceiver }
                );
            }
            
            playGiftSound();
            setNotification(`${t.giftSent}!`);
        } catch (error) { 
            console.error("Gift error:", error); 
        }
    }, [userData, user, t, createNotification, lang]);

    // Shop Functions
    const handlePurchase = useCallback(async (item, targetUser = null) => {
        if (!user || !isLoggedIn) { setShowLoginAlert(true); return; }
        const currency = userData?.currency || 0;
        if (currency < item.cost) { setNotification(t.purchaseFail); return; }
        const inventory = userData?.inventory || { frames: [], titles: [], themes: [], badges: [], gifts: [] };
        
        if (item.type === 'gifts') {
            await handleSendGiftToUser(item, targetUser || { uid: 'self' });
            return;
        }
        
        if (inventory[item.type]?.includes(item.id)) { setNotification(t.alreadyOwned); return; }
        try { 
            const newInventory = { ...inventory, [item.type]: [...(inventory[item.type] || []), item.id] }; 
            await usersCollection.doc(user.uid).update({ currency: currency - item.cost, inventory: newInventory }); 
            playSound('success'); 
            setNotification(t.purchaseSuccess); 
        } catch (error) { console.error('Purchase error:', error); }
    }, [user, userData, isLoggedIn, t, handleSendGiftToUser]);
    
    const handleEquip = useCallback(async (item) => {
        if (!user || !isLoggedIn) return;
        try {
            const equipped = userData?.equipped || { badges: [] };
            if (item.type === 'badges') {
                let currentBadges = equipped.badges || []; if (!Array.isArray(currentBadges)) currentBadges = currentBadges ? [currentBadges] : [];
                if (currentBadges.length >= MAX_BADGES) { setNotification(lang === 'ar' ? `الحد الأقصى ${MAX_BADGES} شارات` : `Maximum ${MAX_BADGES} badges`); return; }
                if (!currentBadges.includes(item.id)) currentBadges.push(item.id);
                await usersCollection.doc(user.uid).update({ equipped: { ...equipped, badges: currentBadges } });
            } else { await usersCollection.doc(user.uid).update({ equipped: { ...equipped, [item.type]: item.id } }); }
            playSound('click'); setNotification(lang === 'ar' ? 'تم التزيين!' : 'Equipped!');
        } catch (error) { console.error('Equip error:', error); }
    }, [user, userData, isLoggedIn, lang]);
    
    const handleUnequip = useCallback(async (type, itemId) => {
        if (!user || !isLoggedIn) return;
        try {
            const equipped = userData?.equipped || { badges: [] };
            if (type === 'badges') {
                let currentBadges = equipped.badges || []; if (!Array.isArray(currentBadges)) currentBadges = currentBadges ? [currentBadges] : [];
                currentBadges = currentBadges.filter(id => id !== itemId);
                await usersCollection.doc(user.uid).update({ equipped: { ...equipped, badges: currentBadges } });
            } else {
                const newEquipped = { ...equipped }; delete newEquipped[type];
                await usersCollection.doc(user.uid).update({ equipped: newEquipped });
            }
            playSound('click'); setNotification(lang === 'ar' ? 'تمت الإزالة!' : 'Unequipped!');
        } catch (error) { console.error('Unequip error:', error); }
    }, [user, userData, isLoggedIn, lang]);

    // Computed Values
    const isMyTurn = useMemo(() => room?.currentTurnUID === currentUID, [room?.currentTurnUID, currentUID]);
    const me = useMemo(() => room?.players?.find(p => p.uid === currentUID), [room?.players, currentUID]);
    const myRole = me?.role;
    const isSpectator = me?.status === 'spectator' || me?.status === 'ghost';
    const hasVoted = room?.votes?.[currentUID];
    const hasVotedWord = room?.wordVotes?.[currentUID];
    const voteReq = room?.votingRequest;
    const hasIAgreed = voteReq?.votes?.[currentUID] === true;
    const hasIDeclined = voteReq?.votes?.[currentUID] === false;
    const totalFriendsUnread = useMemo(() => totalUnread + (friendRequests?.length || 0), [totalUnread, friendRequests]);
    const handleCopy = useCallback(() => { navigator.clipboard.writeText(roomId); setCopied(true); setTimeout(() => setCopied(false), 2000); }, [roomId]);
    const requireLogin = useCallback(() => { setShowLoginAlert(true); }, []);

    // Scenarios for game
    const SCENARIOS = [
        { loc_ar: "محطة فضاء", words_ar: ["فضاء", "صاروخ", "zero-g", "قمر"], loc_en: "Space Station", words_en: ["Space", "Rocket", "Zero-g", "Moon"] }, 
        { loc_ar: "غواصة نووية", words_ar: ["عمق", "ماء", "ضغط", "سونار"], loc_en: "Nuclear Submarine", words_en: ["Depth", "Water", "Pressure", "Sonar"] }, 
        { loc_ar: "قصر ملكي", words_ar: ["تاج", "حراس", "عروش", "خدم"], loc_en: "Royal Palace", words_en: ["Crown", "Guards", "Throne", "Servants"] }, 
        { loc_ar: "بنك مركزي", words_ar: ["خزنة", "مال", "رصاص", "مفتاح"], loc_en: "Central Bank", words_en: ["Vault", "Money", "Lead", "Key"] }, 
        { loc_ar: "مستشفى مهجور", words_ar: ["أشباح", "أطباء", "ظلام", "حقن"], loc_en: "Abandoned Hospital", words_en: ["Ghosts", "Doctors", "Dark", "Syringe"] }, 
        { loc_ar: "قطار ليلي", words_ar: ["درجات", "تذاكر", "نوم", "ممر"], loc_en: "Night Train", words_en: ["Bunks", "Tickets", "Sleep", "Aisle"] }, 
        { loc_ar: "جزيرة كنز", words_ar: ["خريطة", "حفر", "ذهب", "قراصنة"], loc_en: "Treasure Island", words_en: ["Map", "Dig", "Gold", "Pirates"] }, 
        { loc_ar: "مصنع روبوتات", words_ar: ["أسلاك", "صيانة", "برمجة", "معادن"], loc_en: "Robot Factory", words_en: ["Wires", "Maintenance", "Coding", "Metal"] }
    ];

    // RENDER
    if (authLoading) { return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="text-4xl animate-bounce mb-4">🕵️</div><div className="text-lg font-bold">{t.loading}</div></div></div>; }

    return (
        <div className="main-wrapper" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <NotificationToast message={notification} onClose={() => setNotification(null)} />
            
            {showOnboarding && (
                <OnboardingModal
                    show={showOnboarding}
                    googleUser={onboardingGoogleUser}
                    onComplete={handleOnboardingComplete}
                    lang={lang}
                />
            )}
            
            {forcedLogoutMsg && (
                <div className="modal-overlay" style={{zIndex:25000}}>
                    <div className="animate-pop" onClick={e => e.stopPropagation()} style={{
                        background:'linear-gradient(180deg,#1a0a0a,#0f0f1a)',
                        border:'1px solid rgba(239,68,68,0.4)',
                        borderRadius:'18px', width:'100%', maxWidth:'340px',
                        padding:'28px 24px', textAlign:'center',
                        boxShadow:'0 0 40px rgba(239,68,68,0.2)'
                    }}>
                        <div style={{fontSize:'44px', marginBottom:'12px'}}>⚠️</div>
                        <div style={{fontSize:'15px', fontWeight:900, color:'#ef4444', marginBottom:'8px'}}>
                            {lang === 'ar' ? 'تم تسجيل خروجك' : 'Signed Out'}
                        </div>
                        <div style={{fontSize:'12px', color:'#9ca3af', marginBottom:'20px', lineHeight:1.6}}>
                            {lang === 'ar'
                                ? 'تم فتح حسابك على جهاز آخر. لا يمكن تسجيل الدخول في مكانين في نفس الوقت.'
                                : 'Your account was opened on another device. You cannot be logged in on two devices simultaneously.'}
                        </div>
                        <button onClick={() => setForcedLogoutMsg(false)} style={{
                            background:'linear-gradient(135deg,#7000ff,#00f2ff)',
                            border:'none', borderRadius:'10px', color:'white',
                            fontWeight:700, fontSize:'13px', padding:'10px 24px', cursor:'pointer', width:'100%'
                        }}>
                            {lang === 'ar' ? 'حسناً' : 'OK'}
                        </button>
                    </div>
                </div>
            )}
            {showLoginAlert && (
                <div className="modal-overlay" onClick={() => setShowLoginAlert(false)}>
                    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '320px' }}>
                        <div className="modal-header"><h2 className="modal-title">{t.loginRequired}</h2><ModalCloseBtn onClose={() => setShowLoginAlert(false)} /></div>
                        <div className="modal-body text-center">
                            <div className="text-4xl mb-4">🔐</div>
                            <p className="text-sm text-gray-300 mb-4">{t.guestDesc}</p>
                            <button onClick={() => { setShowLoginAlert(false); handleGoogleLogin(); }} className="btn-google w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />{t.loginGoogle}</button>
                        </div>
                    </div>
                </div>
            )}
            
            <TutorialModal show={showTutorial} onClose={() => { setShowTutorial(false); localStorage.setItem('pro_spy_tutorial_v2', 'true'); }} lang={lang} />
            <LoginRewards show={showLoginRewards} onClose={() => setShowLoginRewards(false)} userData={userData} onClaim={handleClaimLoginReward} lang={lang} />
            
            {showSummary && room && (
                <div className="modal-overlay" onClick={() => setShowSummary(false)}>
                    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2 className="modal-title">{t.summaryTitle}</h2><ModalCloseBtn onClose={() => setShowSummary(false)} /></div>
                        <div className="modal-body text-center"><div className="text-4xl mb-4">{room.status === 'finished_spy_caught' ? '🎉' : '🕵️'}</div><h2 className="text-xl font-bold mb-4">{room.status === 'finished_spy_caught' ? t.agentsWin : t.spyWin}</h2></div>
                        <div className="modal-footer">{room.admin === currentUID && (<button onClick={resetGame} className="btn-neon w-full py-2 rounded-lg text-sm font-bold mb-2">{t.playAgain}</button>)}<button onClick={handleLeaveRoom} className="btn-ghost w-full py-2 rounded-lg text-sm">{t.leaveRoom}</button></div>
                    </div>
                </div>
            )}
            
            <ShopModal show={showShop} onClose={() => setShowShop(false)} userData={isLoggedIn ? userData : guestData} lang={lang} onPurchase={handlePurchase} onEquip={handleEquip} onUnequip={handleUnequip} />
            <InventoryModal show={showInventory} onClose={() => setShowInventory(false)} userData={isLoggedIn ? userData : guestData} lang={lang} onEquip={handleEquip} onUnequip={handleUnequip} onSendGift={handleSendGiftToUser} friendsData={friendsData} isLoggedIn={isLoggedIn} currentUserData={currentUserData} user={user} />
            <SettingsModal show={showSettings} onClose={() => setShowSettings(false)} lang={lang} userData={userData} user={user} onNotification={setNotification} isGuest={isGuest} onLoginGoogle={handleGoogleLogin} />
            
            {showMyAccount && currentUID && (
                <ProfileV11
                    show={showMyAccount}
                    onClose={() => setShowMyAccount(false)}
                    targetUID={currentUID}
                    lang={lang}
                    currentUserUID={currentUID}
                    onSendFriendRequest={handleSendRequest}
                    onSendGift={handleSendGiftToUser}
                    userData={currentUserData}
                    currentUserFriends={userData?.friends}
                    currentUserFriendRequests={userData?.friendRequests}
                    friendsData={friendsData}
                    isOwnProfileOverride={true}
                    onOpenSettings={() => { setShowMyAccount(false); setShowSettings(true); }}
                    onOpenShop={() => { setShowMyAccount(false); setShowShop(true); }}
                    onOpenInventory={() => { setShowMyAccount(false); setShowInventory(true); }}
                    onLogout={handleLogout}
                    onLoginGoogle={() => { setShowMyAccount(false); handleGoogleLogin(); }}
                    isLoggedIn={isLoggedIn}
                    isGuest={isGuest}
                    sessionClaimedToday={sessionClaimedToday}
                    onOpenLoginRewards={() => { if(!sessionClaimedToday) setShowLoginRewards(true); }}
                    currency={currentUserData?.currency || 0}
                    onOpenChat={(target) => {
                        setShowMyAccount(false);
                        if (target === 'self') {
                            setShowSelfChat(true);
                        } else {
                            openPrivateChat(target);
                        }
                    }}
                />
            )}
            
            <ProfileV11 
                show={showUserProfile} 
                onClose={() => setShowUserProfile(false)} 
                targetUID={targetProfileUID} 
                lang={lang} 
                currentUserUID={currentUID} 
                onSendFriendRequest={handleSendRequest} 
                onSendGift={handleSendGiftToUser} 
                userData={currentUserData} 
                currentUserFriends={userData?.friends} 
                currentUserFriendRequests={userData?.friendRequests}
                friendsData={friendsData}
                onOpenChat={(friendData) => {
                    openPrivateChat(friendData);
                    setShowUserProfile(false);
                }}
            />
            <BrowseRoomsModal show={showBrowseRooms} onClose={() => setShowBrowseRooms(false)} onJoin={handleJoinGame} nickname={nickname} currentUID={currentUID} currentUserData={currentUserData} lang={lang} />
            
            {showPrivateChat && chatFriend && user && (
                <PrivateChatModal 
                    show={showPrivateChat} 
                    onClose={closePrivateChat} 
                    friend={chatFriend} 
                    currentUser={currentUserData} 
                    user={user} 
                    lang={lang} 
                    onSendNotification={createNotification} 
                    onSendGift={handleSendGiftToUser} 
                    currency={userData?.currency || 0}
                    friendsData={friendsData}
                    onOpenProfile={openProfile}
                />
            )}
            
            {showSelfChat && user && (
                <SelfChatModal
                    show={showSelfChat}
                    onClose={() => setShowSelfChat(false)}
                    currentUser={currentUserData}
                    userData={currentUserData}
                    lang={lang}
                    currency={userData?.currency || 0}
                />
            )}

            {showFunPass && (
                <FunPassModal
                    show={showFunPass}
                    onClose={() => setShowFunPass(false)}
                    userData={userData || currentUserData}
                    user={user}
                    lang={lang}
                    onNotification={setNotification}
                />
            )}

            {alertMessage && (<div className="alert-modal" onClick={() => setAlertMessage(null)}><div className="modal-content animate-pop" onClick={e => e.stopPropagation()}><div className="modal-header"><span></span><ModalCloseBtn onClose={() => setAlertMessage(null)} /></div><div className="modal-body text-center"><div className="text-2xl mb-2">🚫</div><p className="font-bold mb-4">{alertMessage}</p><button onClick={() => setAlertMessage(null)} className="btn-ghost px-4 py-2 rounded-lg text-sm">{t.ok}</button></div></div></div>)}
            
            {showSetupModal && (
                <div className="modal-overlay" onClick={()=>setShowSetupModal(false)}>
                    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2 className="modal-title">{t.create}</h2><ModalCloseBtn onClose={() => setShowSetupModal(false)} /></div>
                        <div className="modal-body">
                            <div className="space-y-3">
                                <div><label className="text-[10px] text-gray-400 block mb-1">{t.nickname}</label><input className="input-dark w-full p-2 rounded font-bold text-sm" value={nickname} onChange={e => { setNickname(e.target.value); localStorage.setItem('pro_spy_nick', e.target.value); }} placeholder={t.nickname} /></div>
                                <div className="flex gap-2"><button onClick={() => setSetupMode('normal')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${setupMode === 'normal' ? 'btn-neon' : 'btn-ghost'}`}>{t.normalMode}</button><button onClick={() => setSetupMode('advanced')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${setupMode === 'advanced' ? 'btn-neon' : 'btn-ghost'}`}>{t.advancedMode}</button></div>
                                <p className="text-[10px] text-gray-400 text-center">{setupMode === 'normal' ? t.modeNormalDesc : t.modeAdvDesc}</p>
                                <div className="flex items-center gap-2"><input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} id="privateCheck" /><label htmlFor="privateCheck" className="text-xs">{t.privateRoom}</label></div>
                                {isPrivate && (<div className="relative"><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={t.password} className="input-dark w-full p-2 pr-10 rounded text-sm" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? '🙈' : '👁️'}</button></div>)}
                            </div>
                        </div>
                        <div className="modal-footer"><button onClick={handleCreateGame} disabled={loading || !nickname.trim()} className="btn-neon w-full py-2 rounded-lg text-sm font-bold">{loading ? t.loading : t.create}</button></div>
                    </div>
                </div>
            )}
            
            {/* Header */}
            <header className="site-header">
                <div className="logo-container">
                    <div className="logo-icon">🕵️</div>
                    <div>
                        <h1 className="game-title">{t.appName}</h1>
                        <p className="text-[8px] text-gray-400 uppercase tracking-widest">{t.tagline}</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button onClick={() => { if(isLoggedIn) setShowFunPass(true); else requireLogin(); }} title="Fun Pass" style={{background:'linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,136,0,0.15))',border:'1px solid rgba(255,215,0,0.35)',color:'#ffd700',fontWeight:900,borderRadius:'6px',padding:'4px 8px',fontSize:'12px',cursor:'pointer'}}>🎫</button>
                    <button onClick={() => { const nl = lang==='en'?'ar':'en'; setLang(nl); localStorage.setItem('pro_spy_lang', nl); }} className="text-xs bg-white/10 px-2 py-1 rounded">{t.langBtn}</button>
                    {isLoggedIn && (
                        <div className="notification-center">
                            <div ref={notificationBellRef} className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}><span className="notification-bell-icon">🔔</span>{unreadNotifications > 0 && <span className="notification-badge">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>}</div>
                            <NotificationDropdown show={showNotifications} onClose={() => setShowNotifications(false)} notifications={notifications} onMarkRead={markNotificationRead} onClearAll={clearAllNotifications} onNotificationClick={handleNotificationClick} lang={lang} />
                        </div>
                    )}
                    <div className="relative">
                        <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
                            {isLoggedIn || isGuest ? (<><AvatarWithFrame photoURL={currentUserData?.photoURL} equipped={currentUserData?.equipped} size="sm" /><span className="text-[10px] text-gray-300 max-w-[60px] truncate">{currentUserData?.displayName}</span></>) : (<span className="text-xs px-2 py-1">{t.loginGoogle}</span>)}
                        </button>
                        {showDropdown && (
                            <div className="dropdown-menu glass-panel rounded-lg p-1 min-w-[160px]">
                                {isLoggedIn || isGuest ? (<>
                                    <button onClick={() => { setShowMyAccount(true); setShowDropdown(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2"><span>👤</span> {t.myAccount}</button>
                                    {isLoggedIn && (<>
                                        <button onClick={() => { setShowShop(true); setShowDropdown(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2"><span>🛒</span> {t.shop}</button>
                                        <button onClick={() => { setShowInventory(true); setShowDropdown(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2"><span>📦</span> {t.inventory}</button>
                                        <button onClick={() => { if(!sessionClaimedToday) setShowLoginRewards(true); setShowDropdown(false); }} className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2 ${sessionClaimedToday ? 'opacity-50' : ''}`}><span>🎁</span> {t.loginRewards} {sessionClaimedToday && <span className="text-[8px] text-green-400">✓</span>}</button>
                                    </>)}
                                    <button onClick={() => { setShowSettings(true); setShowDropdown(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2"><span>⚙️</span> {t.settings}</button>
                                    <button onClick={() => { handleLogout(); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2 text-red-400"><span>🚪</span> {t.logout}</button>
                                </>) : (<button onClick={() => { handleGoogleLogin(); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2"><span>🔑</span> {t.loginGoogle}</button>)}
                            </div>
                        )}
                    </div>
                </div>
            </header>
            
            {/* Main Content */}
            {!room && (
                <main className="main-content">
                    <div className="tab-container mb-3">
                        <button onClick={() => setActiveView('lobby')} className={`tab-button ${activeView === 'lobby' ? 'active' : ''}`}>{t.tabLobby}</button>
                        <button onClick={() => setActiveView('leaderboard')} className={`tab-button ${activeView === 'leaderboard' ? 'active' : ''}`}>{t.tabLeaderboard}</button>
                        <button onClick={() => { if(isLoggedIn) setActiveView('friends'); else requireLogin(); }} className={`tab-button relative ${activeView === 'friends' ? 'active' : ''}`}>{t.tabFriends}{totalFriendsUnread > 0 && <span className="friends-tab-badge">{totalFriendsUnread > 9 ? '9+' : totalFriendsUnread}</span>}</button>
                    </div>
                    
                    {activeView === 'lobby' && (
                        <div className="card-container">
                            {isGuest && <GuestBanner lang={lang} />}
                            <div className="space-y-3">
                                <div><label className="text-[10px] text-gray-400 block mb-1">{t.nickname}</label><input className="input-dark w-full p-3 rounded-lg font-bold" value={nickname} onChange={e => { setNickname(e.target.value); localStorage.setItem('pro_spy_nick', e.target.value); }} placeholder={t.nickname} /></div>
                                <div className="flex gap-2"><button onClick={() => setShowSetupModal(true)} disabled={!nickname.trim()} className="btn-neon flex-1 py-3 rounded-lg font-bold text-sm">{t.create}</button><button onClick={() => setShowBrowseRooms(true)} className="btn-ghost px-4 py-3 rounded-lg text-sm">{t.browse}</button></div>
                                <div className="flex items-center gap-2"><input className="input-dark flex-1 p-3 rounded-lg text-center font-mono uppercase tracking-wider" value={inputCode} onChange={e => setInputCode(e.target.value.toUpperCase())} placeholder={t.codePlaceholder} maxLength={6} /><button onClick={() => handleJoinGame(inputCode, '')} disabled={loading || !inputCode.trim() || !nickname.trim()} className="btn-neon px-4 py-3 rounded-lg font-bold text-sm">{loading ? '...' : t.join}</button></div>
                                {joinError && <p className="text-xs text-red-400 text-center">{joinError}</p>}
                            </div>
                        </div>
                    )}
                    
                    {activeView === 'leaderboard' && (
                        <div className="card-container">
                            {/* Leaderboard Tabs */}
                            <div className="leaderboard-tabs">
                                <button 
                                    onClick={() => setLeaderboardTab('wins')} 
                                    className={`leaderboard-tab ${leaderboardTab === 'wins' ? 'active' : ''}`}
                                >
                                    🏆 {t.wins}
                                </button>
                                <button 
                                    onClick={() => setLeaderboardTab('charisma')} 
                                    className={`leaderboard-tab gold ${leaderboardTab === 'charisma' ? 'active' : ''}`}
                                >
                                    ⭐ {t.charismaRank}
                                </button>
                            </div>
                            
                            <div className="overflow-y-auto max-h-[60vh]">
                                {(leaderboardTab === 'charisma' ? charismaLeaderboard : leaderboardData).map((player, i) => {
                                    const rank = i + 1;
                                    const isTop3 = rank <= 3;
                                    return (
                                        <div 
                                            key={player.id} 
                                            onClick={() => openProfile(player.id)} 
                                            className={`leaderboard-row cursor-pointer ${isTop3 && leaderboardTab === 'charisma' ? 'rank-' + rank : ''}`}
                                        >
                                            {isTop3 && leaderboardTab === 'charisma' ? (
                                                <div className="charisma-rank-position">
                                                    {rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉'}
                                                </div>
                                            ) : (
                                                <span className="w-6 text-xs font-bold text-gray-500">{rank}</span>
                                            )}
                                            <AvatarWithFrame photoURL={player.photoURL} equipped={player.equipped} size="sm" />
                                            <span className="flex-1 text-sm font-medium truncate">{player.displayName}</span>
                                            <div className="text-right">
                                                {leaderboardTab === 'charisma' ? (
                                                    <div className="text-xs font-bold text-yellow-400">⭐ {formatCharisma(player.charisma || 0)}</div>
                                                ) : (
                                                    <div className="text-xs font-bold text-primary">{player.stats?.wins || 0} {t.wins}</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    
                    {activeView === 'friends' && (
                        <div className="card-container friends-container">
                            <div className="add-friend-section">
                                <div className="add-friend-title">{t.addFriend}</div>
                                <div className="add-friend-input-row"><input type="text" className="add-friend-input" value={addFriendId} onChange={e => setAddFriendId(e.target.value)} placeholder={t.friendIdPlaceholder} /><button onClick={handleAddFriendById} disabled={!addFriendId.trim()} className="btn-neon px-4 py-2 rounded-lg text-xs">{t.addFriend}</button></div>
                                {friendSearchMsg && <p className={`text-xs mt-2 text-center ${friendSearchMsg.includes('تم') || friendSearchMsg.includes('Sent') ? 'text-green-400' : 'text-red-400'}`}>{friendSearchMsg}</p>}
                            </div>
                            {friendRequests.length > 0 && (
                                <div className="friend-requests-section">
                                    <div className="friend-requests-header">{t.incomingRequests}</div>
                                    {friendRequests.map(req => (
                                        <div key={req.id} className="friend-request-item">
                                            <AvatarWithFrame photoURL={req.photoURL} equipped={req.equipped} size="sm" />
                                            <div className="friend-request-info"><div className="friend-request-name">{req.displayName}</div></div>
                                            <div className="friend-request-actions"><button onClick={() => handleAcceptRequest(req.id)} className="btn-success px-3 py-1 rounded text-xs">{t.accept}</button><button onClick={() => handleRejectRequest(req.id)} className="btn-danger px-3 py-1 rounded text-xs">{t.reject}</button></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="friends-list-section">
                                {friendsData.length === 0 ? (
                                    <div className="text-center py-6"><div className="text-4xl mb-2">👥</div><p className="text-gray-400">{t.noFriends}</p></div>
                                ) : (() => {
                                    const online = friendsData.filter(f => f.isOnline);
                                    const offline = friendsData.filter(f => !f.isOnline);
                                    const renderFriend = (friend) => (
                                        <div key={friend.id} className="friend-item">
                                            <AvatarWithFrame photoURL={friend.photoURL} equipped={friend.equipped} size="sm" />
                                            <div className="friend-info">
                                                <div className="friend-name">{friend.displayName}</div>
                                                <div className="friend-status">{friend.isOnline ? <span className="text-green-400">● {t.online}</span> : <span className="text-gray-500">● {t.offline}</span>}</div>
                                            </div>
                                            <div className="friend-actions">
                                                <button onClick={() => openPrivateChat(friend)} className="btn-ghost px-2 py-1 rounded text-xs">💬</button>
                                                <button onClick={() => openProfile(friend.id)} className="btn-ghost px-2 py-1 rounded text-xs">👤</button>
                                            </div>
                                        </div>
                                    );
                                    return (
                                        <>
                                            {online.length > 0 && (
                                                <>
                                                    <div style={{fontSize:'9px',fontWeight:700,color:'#4ade80',textTransform:'uppercase',padding:'4px 0 6px',display:'flex',alignItems:'center',gap:'5px'}}>
                                                        <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#4ade80',display:'inline-block'}}/>
                                                        {t.online} ({online.length})
                                                    </div>
                                                    {online.map(renderFriend)}
                                                </>
                                            )}
                                            {offline.length > 0 && (
                                                <>
                                                    <div style={{fontSize:'9px',fontWeight:700,color:'#6b7280',textTransform:'uppercase',padding:'8px 0 6px',display:'flex',alignItems:'center',gap:'5px',borderTop: online.length ? '1px solid rgba(255,255,255,0.06)' : 'none',marginTop: online.length ? '6px' : 0}}>
                                                        <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#6b7280',display:'inline-block'}}/>
                                                        {t.offline} ({offline.length})
                                                    </div>
                                                    {offline.map(renderFriend)}
                                                </>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </main>
            )}
            
            {/* Room View */}
            {room && (
                <main className="main-content">
                    <div className="glass-panel rounded-lg p-2 mb-2 flex items-center justify-between">
                        <div className="lobby-code-container">
                            <button onClick={handleCopy} className={`lobby-code-btn ${copied ? 'copied' : ''}`}><span className="font-mono">{roomId}</span><span>{copied ? '✓' : '📋'}</span></button>
                            {copied && <span className="text-[10px] text-green-400 ml-1">{t.codeCopied}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            {room.isPrivate && (<button onClick={() => setShowLobbyPassword(!showLobbyPassword)} className="lobby-password-toggle">{showLobbyPassword ? '🙈' : '👁️'}</button>)}
                            {room.isPrivate && showLobbyPassword && <span className="text-xs text-yellow-400 font-mono">{room.password}</span>}
                            <div className="text-xs text-gray-400">{t.roundsFormat(room.currentRound || 0, 3)}</div>
                        </div>
                    </div>
                    
                    {room.status === 'waiting' && (
                        <div className="card-container">
                            <h3 className="text-sm font-bold mb-3 text-center">{t.lobbyTitle}</h3>
                            <div className="grid grid-cols-2 gap-2 mb-4">{room.players.map(p => (<div key={p.uid} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg cursor-pointer hover:bg-white/10" onClick={() => openProfile(p.uid)}><AvatarWithFrame photoURL={p.photo} equipped={p.equipped} size="sm" /><span className="text-xs truncate">{p.name}</span>{p.uid === room.admin && <span className="text-[8px] bg-yellow-500/20 text-yellow-400 px-1 rounded">HOST</span>}</div>))}</div>
                            <div className="flex gap-2">{room.admin === currentUID ? (<button onClick={startGame} className="btn-neon flex-1 py-2 rounded-lg text-sm font-bold">{t.start}</button>) : (<p className="text-xs text-gray-400 text-center flex-1">{t.waiting}</p>)}<button onClick={handleLeaveRoom} className="btn-danger px-4 py-2 rounded-lg text-sm">{t.leaveRoom}</button></div>
                        </div>
                    )}
                    
                    {room.status === 'word_selection' && !isSpectator && (
                        <div className="card-container">
                            <h3 className="text-sm font-bold mb-2 text-center">{t.wordSelectionTitle}</h3>
                            <p className="text-xs text-gray-400 text-center mb-3">{t.wordSelectionDesc}</p>
                            <div className="text-center text-xs text-yellow-400 mb-3">⏱️ {wordSelTimer}s</div>
                            <div className="grid grid-cols-2 gap-2">{(lang === 'ar' ? room.scenario?.words_ar : room.scenario?.words_en)?.map((word, i) => (<button key={i} onClick={() => submitWordVote(word)} className={`word-vote-card ${hasVotedWord === word ? 'selected' : ''}`}><span className="font-bold">{word}</span></button>))}</div>
                        </div>
                    )}
                    
                    {room.status === 'discussing' && (
                        <div className="flex-1 flex flex-col gap-2">
                            <div className="card-container"><div className="grid grid-cols-3 gap-2">{room.players.filter(p => p.status === 'active').map(p => (<div key={p.uid} className={`player-card ${room.currentTurnUID === p.uid ? 'active' : ''} ${p.uid === currentUID ? 'border-primary' : ''}`} onClick={() => openProfile(p.uid)}><AvatarWithFrame photoURL={p.photo} equipped={p.equipped} size="sm" /><span className="text-[10px] truncate mt-1">{p.name}</span>{room.currentTurnUID === p.uid && <span className="text-[8px] text-primary">Speaking</span>}</div>))}</div></div>
                            {!isSpectator && me && (
                                <div className={`identity-square identity-${myRole === 'spy' ? 'spy' : myRole === 'mrwhite' ? 'mrwhite' : myRole === 'informant' ? 'informant' : 'agent'}`}>
                                    <div className="text-4xl mb-2">{myRole === 'spy' ? '🕵️' : myRole === 'mrwhite' ? '👻' : myRole === 'informant' ? '👁️' : '🤵'}</div>
                                    <div className="text-lg font-bold">{myRole === 'spy' ? t.statusSpy : myRole === 'mrwhite' ? t.statusMrWhite : myRole === 'informant' ? t.statusInformant : t.statusAgent}</div>
                                    {myRole === 'spy' && (<div className="text-xs text-gray-300 mt-1">{t.location}: {lang === 'ar' ? room.scenario?.loc_ar : room.scenario?.loc_en}</div>)}
                                    {myRole !== 'spy' && room.chosenWord && (<div className="text-xs text-gray-300 mt-1">{t.selectedWord}: {room.chosenWord}</div>)}
                                </div>
                            )}
                            <div className="card-container">
                                <div className="flex items-center justify-between mb-2"><div className="timer-bar-container"><div className="timer-bar-fill" style={{ width: `${(turnTimer / 30) * 100}%` }}></div></div><span className="text-xs text-gray-400">{turnTimer}s</span></div>
                                <div className="flex gap-2">{isMyTurn && (<button onClick={() => handleSkipTurn()} className="btn-ghost flex-1 py-2 rounded-lg text-xs">{t.skip}</button>)}<button onClick={requestVoting} className="btn-vote flex-1 py-2 rounded-lg text-xs font-bold">{t.vote}</button></div>
                            </div>
                        </div>
                    )}
                    
                    {room.status === 'voting' && (
                        <div className="card-container">
                            <h3 className="text-sm font-bold mb-2 text-center">{t.vote}</h3>
                            <div className="text-center text-xs text-yellow-400 mb-3">⏱️ {votingTimer}s</div>
                            <div className="grid grid-cols-2 gap-2 mb-4">{room.players.filter(p => p.status === 'active').map(p => (<button key={p.uid} onClick={() => submitVote(p.uid)} disabled={hasVoted} className={`player-card ${hasVoted === p.uid ? 'border-primary bg-primary/10' : ''}`}><AvatarWithFrame photoURL={p.photo} equipped={p.equipped} size="sm" /><span className="text-xs truncate mt-1">{p.name}</span></button>))}</div>
                        </div>
                    )}
                    
                    {(room.status === 'finished_spy_caught' || room.status === 'finished_spy_wins' || room.status === 'finished_mrwhite_wins') && (
                        <div className="card-container text-center">
                            <div className="text-4xl mb-4">{room.status === 'finished_spy_caught' ? '🎉' : '🕵️'}</div>
                            <h2 className="text-xl font-bold mb-4">{room.status === 'finished_spy_caught' ? t.agentsWin : t.spyWin}</h2>
                            {room.admin === currentUID && (<button onClick={resetGame} className="btn-neon w-full py-2 rounded-lg text-sm font-bold">{t.playAgain}</button>)}
                            <button onClick={handleLeaveRoom} className="btn-ghost w-full py-2 rounded-lg text-sm mt-2">{t.leaveRoom}</button>
                        </div>
                    )}
                </main>
            )}
            
            {showDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>}
        </div>
    );
}
// ==========================================
// 🎯 PROFILE V11 - NEW PREMIUM DESIGN COMPONENTS
// ==========================================

// 📊 WIN RATE CIRCLE COMPONENT
const WinRateCircleV11 = ({ wins, losses, lang }) => {
    const total = wins + losses;
    const rate = total > 0 ? Math.round((wins / total) * 100) : 0;
    
    const getColor = (percentage) => {
        if (percentage >= 70) return '#10b981';
        if (percentage >= 50) return '#facc15';
        if (percentage >= 30) return '#f97316';
        return '#ef4444';
    };

    const gradient = `conic-gradient(${getColor(rate)} ${rate}%, #1f2937 ${rate}%)`;

    return (
        <div className="profile-winrate-circle" style={{ background: gradient, width:'64px', height:'64px', flexShrink:0 }}>
            <div className="profile-winrate-content">
                <span className="profile-winrate-value" style={{ color: getColor(rate), fontSize:'13px' }}>{rate}%</span>
                <span className="profile-winrate-label" style={{fontSize:'7px'}}>{lang === 'ar' ? 'معدل' : 'Win%'}</span>
            </div>
        </div>
    );
};

// 🎁 GIFT WALL COMPONENT V11 - IMPROVED WITH SENDER PHOTOS
const GiftWallV11 = ({ gifts, lang, onSendGiftToSelf, isOwnProfile, userData }) => {
    const [activeTab, setActiveTab] = useState('wall');
    const totalGifts = gifts?.length || 0;
    const [selectedGiftDetail, setSelectedGiftDetail] = useState(null);
    const [showAllGifts, setShowAllGifts] = useState(false);
    const GIFTS_LIMIT = 24;

    // Calculate gift counts and last sender info
    const giftData = useMemo(() => {
        const counts = {};
        const lastSenders = {};
        
        gifts?.forEach(g => {
            counts[g.giftId] = (counts[g.giftId] || 0) + 1;
            // Keep track of the most recent sender for each gift type
            if (!lastSenders[g.giftId]) {
                lastSenders[g.giftId] = {
                    name: g.senderName,
                    photo: g.senderPhoto,
                    uid: g.senderId
                };
            }
        });
        
        return { counts, lastSenders };
    }, [gifts]);

    const allGifts = SHOP_ITEMS.gifts;
    const displayGifts = showAllGifts ? allGifts : allGifts.slice(0, GIFTS_LIMIT);
    const hasMoreGifts = allGifts.length > GIFTS_LIMIT;

    return (
        <div className="profile-gift-section">
            <div className="profile-gift-header">
                <div className="profile-gift-tabs">
                    <button 
                        className={`profile-gift-tab ${activeTab === 'wall' ? 'active' : ''}`}
                        onClick={() => setActiveTab('wall')}
                    >
                        {lang === 'ar' ? '🎁 الجدار' : '🎁 Wall'}
                    </button>
                    <button 
                        className={`profile-gift-tab ${activeTab === 'log' ? 'active' : ''}`}
                        onClick={() => setActiveTab('log')}
                    >
                        {lang === 'ar' ? '📬 السجل' : '📬 Log'}
                    </button>
                </div>
                <span className="profile-gift-count">{totalGifts} {lang === 'ar' ? 'هدية' : 'gifts'}</span>
            </div>

            {activeTab === 'wall' && (
                <div className="profile-gift-grid">
                    {displayGifts.map((gift) => {
                        const count = giftData.counts[gift.id] || 0;
                        const unlocked = count > 0;
                        const lastSender = giftData.lastSenders[gift.id];

                        const rKey = getGiftRarity(gift.cost);
                        const rarity = RARITY_CONFIG[rKey];
                        return (
                            <div 
                                key={gift.id} 
                                className={`profile-gift-slot ${unlocked ? 'unlocked' : 'locked'}${unlocked && rKey === 'Mythic' ? ' mythic-glow' : ''}`}
                                title={unlocked ? `${lang === 'ar' ? gift.name_ar : gift.name_en} x${count}` : (lang === 'ar' ? 'لم تُستلم بعد' : 'Not received')}
                                style={{ cursor:'pointer', ...(unlocked ? {
                                    border: `1.5px solid ${rarity.border}`,
                                    boxShadow: rKey === 'Mythic' ? `0 0 12px rgba(255,0,85,0.6), 0 0 24px rgba(255,0,85,0.25)` : (rarity.glow ? `0 0 8px ${rarity.color}55` : 'none'),
                                    background: rarity.bg
                                } : {}) }}
                                onClick={() => setSelectedGiftDetail({ gift, count, rarity, rKey, unlocked })}
                            >
                                <span style={{ position:'absolute', top:'2px', right:'2px', fontSize:'9px' }}>{rarity.icon}</span>
                                <span className="profile-gift-icon">{gift.emoji || '🎁'}</span>
                                {count > 0 && <span className="profile-gift-count-badge">{count}</span>}
                                {unlocked && <div className="profile-gift-glow"></div>}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* More / Less gifts button */}
            {activeTab === 'wall' && hasMoreGifts && (
                <button
                    onClick={() => setShowAllGifts(v => !v)}
                    style={{
                        width:'100%', marginTop:'6px', padding:'7px',
                        background:'rgba(0,242,255,0.05)',
                        border:'1px solid rgba(0,242,255,0.15)',
                        borderRadius:'8px', color:'#00f2ff', fontSize:'11px',
                        fontWeight:700, cursor:'pointer', display:'flex',
                        alignItems:'center', justifyContent:'center', gap:'5px'
                    }}
                >
                    {showAllGifts
                        ? (lang==='ar' ? '▲ عرض أقل' : '▲ Show Less')
                        : `▼ ${lang==='ar' ? 'المزيد' : 'More'} (${allGifts.length - GIFTS_LIMIT} ${lang==='ar' ? 'هدية' : 'gifts'})`
                    }
                </button>
            )}

            {/* Gift Detail Popup - PORTAL to escape backdrop-filter */}
            {selectedGiftDetail && (
                <PortalModal>
                <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999999,padding:'16px'}} onClick={() => setSelectedGiftDetail(null)}>
                    <div className="gift-detail-modal animate-pop" onClick={e => e.stopPropagation()}>
                        <button className="gift-detail-close" onClick={() => setSelectedGiftDetail(null)}>✕</button>
                        <div className="gift-detail-emoji">{selectedGiftDetail.gift.emoji || '🎁'}</div>
                        <div className="gift-detail-name">
                            {lang === 'ar' ? selectedGiftDetail.gift.name_ar : selectedGiftDetail.gift.name_en}
                        </div>
                        <div className="gift-detail-rarity" style={{ color: selectedGiftDetail.rarity.color, borderColor: selectedGiftDetail.rarity.border }}>
                            {selectedGiftDetail.rarity.icon} {lang === 'ar' ? selectedGiftDetail.rarity.name_ar : selectedGiftDetail.rarity.name_en}
                        </div>
                        <div className="gift-detail-stats">
                            <div className="gift-detail-stat">
                                <span className="gift-detail-stat-label">⭐ {lang==='ar'?'كاريزما':'Charisma'}</span>
                                <span className="gift-detail-stat-value" style={{color:'#fbbf24'}}>{(selectedGiftDetail.gift.charisma || 0).toLocaleString()}</span>
                            </div>
                            <div className="gift-detail-stat">
                                <span className="gift-detail-stat-label">🍀 {lang==='ar'?'بونص':'Bonus'}</span>
                                <span className="gift-detail-stat-value" style={{color:'#4ade80'}}>
                                    {selectedGiftDetail.gift.minBonus} – {selectedGiftDetail.gift.maxBonus} 🧠
                                </span>
                            </div>
                            <div className="gift-detail-stat">
                                <span className="gift-detail-stat-label">💰 {lang==='ar'?'السعر':'Price'}</span>
                                <span className="gift-detail-stat-value">{selectedGiftDetail.gift.cost} 🧠</span>
                            </div>
                            {selectedGiftDetail.count > 0 && (
                                <div className="gift-detail-stat">
                                    <span className="gift-detail-stat-label">📦 {lang==='ar'?'استلمت':'Received'}</span>
                                    <span className="gift-detail-stat-value" style={{color:selectedGiftDetail.rarity.color}}>×{selectedGiftDetail.count}</span>
                                </div>
                            )}
                        </div>
                        {(lang==='ar'?selectedGiftDetail.gift.desc_ar:selectedGiftDetail.gift.desc_en) && (
                            <div className="gift-detail-desc">
                                {lang==='ar'?selectedGiftDetail.gift.desc_ar:selectedGiftDetail.gift.desc_en}
                            </div>
                        )}

                    </div>
                </div>
                </PortalModal>
            )}

            {activeTab === 'log' && (
                <div className="profile-gift-log">
                    {gifts && gifts.length > 0 ? (
                        gifts.slice(0, 10).map((gift, idx) => {
                            const logRarityKey = getGiftRarity(gift.giftCost || 0);
                            const isMythicLog = logRarityKey === 'Mythic';
                            return (
                            <div key={idx} className={`profile-gift-log-item${isMythicLog ? ' mythic-glow' : ''}`}
                                style={isMythicLog ? {border:'1px solid rgba(255,0,85,0.5)', background:'rgba(255,0,85,0.08)'} : {}}>
                                <img 
                                    src={gift.senderPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(gift.senderName || 'User')}&background=6366f1&color=fff`} 
                                    alt="" 
                                    className="profile-gift-log-avatar"
                                />
                                <div className="profile-gift-log-content">
                                    <div className="profile-gift-log-sender">
                                        {gift.senderName || 'Unknown'}
                                        {isMythicLog && <span style={{marginLeft:'4px',fontSize:'9px',color:'#ff0055'}}>🔮 Mythic</span>}
                                    </div>
                                    <div className="profile-gift-log-details">
                                        <span className="profile-gift-log-emoji">{gift.giftEmoji || '🎁'}</span>
                                        <span className="profile-gift-log-name">
                                            {lang === 'ar' ? (gift.giftNameAr || 'هدية') : (gift.giftNameEn || 'Gift')}
                                        </span>
                                    </div>
                                </div>
                                <div className="profile-gift-log-stats">
                                    <div className="profile-gift-log-charisma" style={isMythicLog ? {color:'#ff0055'} : {}}>+{gift.charisma || 0}</div>
                                    <div className="profile-gift-log-time">
                                        {gift.timestamp?.toDate ? formatTime(gift.timestamp) : ''}
                                    </div>
                                </div>
                            </div>
                            );
                        })
                    ) : (
                        <div className="profile-gift-empty">
                            <span style={{ fontSize: '32px' }}>🎁</span>
                            <span>{lang === 'ar' ? 'لا توجد هدايا بعد' : 'No gifts yet'}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// 🏆 ACHIEVEMENTS DISPLAY V11 - IMPROVED WITH SCROLLING
const AchievementsDisplayV11 = ({ userData, lang, showAll = false }) => {
    const unlockedAchievements = userData?.achievements || [];
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [selectedAchievement, setSelectedAchievement] = useState(null);

    const getProgress = (achievement) => {
        const stats = userData?.stats || {};
        const condition = achievement.condition;
        let current = 0;

        switch (condition.type) {
            case 'wins': current = stats.wins || 0; break;
            case 'losses': current = stats.losses || 0; break;
            case 'games_played': current = (stats.wins || 0) + (stats.losses || 0); break;
            case 'gifts_received': current = userData?.giftsReceived || 0; break;
            case 'gifts_sent': current = userData?.giftsSent || 0; break;
            case 'charisma': current = userData?.charisma || 0; break;
            case 'friends': current = userData?.friends?.length || 0; break;
            default: current = 0;
        }

        return Math.min(100, (current / condition.value) * 100);
    };

    const getCurrentValue = (achievement) => {
        const stats = userData?.stats || {};
        const condition = achievement.condition;
        switch (condition.type) {
            case 'wins': return stats.wins || 0;
            case 'losses': return stats.losses || 0;
            case 'games_played': return (stats.wins || 0) + (stats.losses || 0);
            case 'gifts_received': return userData?.giftsReceived || 0;
            case 'gifts_sent': return userData?.giftsSent || 0;
            case 'charisma': return userData?.charisma || 0;
            case 'friends': return userData?.friends?.length || 0;
            default: return 0;
        }
    };

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    useEffect(() => {
        checkScroll();
        const ref = scrollRef.current;
        if (ref) {
            ref.addEventListener('scroll', checkScroll);
            return () => ref.removeEventListener('scroll', checkScroll);
        }
    }, []);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 200;
            scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    // Show unlocked achievements first, then locked ones
    const sortedAchievements = [...ACHIEVEMENTS].sort((a, b) => {
        const aUnlocked = unlockedAchievements.includes(a.id);
        const bUnlocked = unlockedAchievements.includes(b.id);
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return 0;
    });

    const [showMoreAch, setShowMoreAch] = useState(false);
    const INITIAL_COUNT = 8;
    const displayAchievements = showMoreAch ? sortedAchievements : sortedAchievements.slice(0, INITIAL_COUNT);

    return (
        <div className="profile-achievements-section">
            <div className="profile-achievements-header">
                <span className="profile-achievements-title">
                    🏆 {lang === 'ar' ? 'الإنجازات' : 'Achievements'}
                </span>
                <span className="profile-achievements-count">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
            </div>
            
            <div className="profile-achievements-v2-grid">
                    {displayAchievements.map((ach) => {
                        const isUnlocked = unlockedAchievements.includes(ach.id);
                        const progress = getProgress(ach);

                        const achName = TRANSLATIONS[lang]?.[ach.nameKey] || ach.id;
                        return (
                            <div 
                                key={ach.id} 
                                className={`profile-achievement-v2 ${isUnlocked ? 'unlocked' : 'locked'}`}
                                onClick={() => setSelectedAchievement(ach)}
                            >
                                <span className="profile-achievement-v2-icon" style={{ 
                                    fontSize: '22px',
                                    filter: isUnlocked ? 'none' : 'grayscale(100%)',
                                    opacity: isUnlocked ? 1 : 0.35
                                }}>
                                    {ach.icon || '🏅'}
                                </span>
                                <span className="profile-achievement-v2-name">{achName}</span>
                                {isUnlocked ? (
                                    <span className="profile-achievement-v2-badge">✓</span>
                                ) : progress > 0 ? (
                                    <div className="profile-achievement-v2-progress">
                                        <div className="profile-achievement-v2-fill" style={{ width: `${progress}%` }}></div>
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
            </div>
            {sortedAchievements.length > INITIAL_COUNT && (
                <button 
                    className="profile-achievements-more-btn"
                    onClick={() => setShowMoreAch(!showMoreAch)}
                >
                    {showMoreAch 
                        ? (lang==='ar'?'▲ أقل':'▲ Less')
                        : `▼ ${lang==='ar'?'المزيد':'More'} (${sortedAchievements.length - INITIAL_COUNT})`
                    }
                </button>
            )}

            {/* Achievement Detail Modal - PORTAL to escape backdrop-filter */}
            {selectedAchievement && (
                <PortalModal>
                    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999999,padding:'16px'}} onClick={() => setSelectedAchievement(null)}>
                        <div className="achievement-detail-modal animate-pop" onClick={e => e.stopPropagation()}>
                            <div className="achievement-detail-icon">
                                {selectedAchievement.icon || '🏅'}
                            </div>
                            <div className="achievement-detail-name">
                                {TRANSLATIONS[lang]?.[selectedAchievement.nameKey] || selectedAchievement.id}
                            </div>
                            <div className="achievement-detail-desc">
                                {TRANSLATIONS[lang]?.[selectedAchievement.descKey] || ''}
                            </div>
                            {unlockedAchievements.includes(selectedAchievement.id) ? (
                                <div className="achievement-detail-status unlocked">
                                    <span>✓</span>
                                    <span>{lang === 'ar' ? 'تم فتحه!' : 'Unlocked!'}</span>
                                </div>
                            ) : (
                                <div className="achievement-detail-progress-section">
                                    <div className="achievement-detail-progress-bar">
                                        <div className="achievement-detail-progress-fill" style={{ width: `${getProgress(selectedAchievement)}%` }}></div>
                                    </div>
                                    <div className="achievement-detail-progress-text">
                                        {getCurrentValue(selectedAchievement)} / {selectedAchievement.condition.value}
                                    </div>
                                </div>
                            )}
                            <button className="achievement-detail-close-bottom" onClick={() => setSelectedAchievement(null)}>
                                {lang === 'ar' ? 'إغلاق' : 'Close'} ✕
                            </button>
                        </div>
                    </div>
                </PortalModal>
            )}
        </div>
    );
};

// 👤 USER TITLE COMPONENT V11 - FIXED VISIBILITY
const UserTitleV11 = ({ equipped, lang }) => {
    const titleId = equipped?.titles;
    if (!titleId) return null;

    const title = SHOP_ITEMS.titles.find(t => t.id === titleId);
    if (!title) return null;

    // If title has an image URL, show the image
    if (title.imageUrl && title.imageUrl.trim() !== '') {
        return (
            <div className="profile-user-title has-image">
                <img src={title.imageUrl} alt={title.name_en} />
            </div>
        );
    }

    // Otherwise show text with emoji/preview
    return (
        <span className="profile-user-title">
            {title.preview} {lang === 'ar' ? title.name_ar : title.name_en}
        </span>
    );
};

// 🎖️ USER BADGES COMPONENT V11 - SHOW ALL 10 BADGES
const UserBadgesV11 = ({ equipped, lang }) => {
    const badges = equipped?.badges || [];
    if (badges.length === 0) return null;

    return (
        <div className="profile-badges-row">
            {badges.slice(0, 10).map((badgeId, idx) => {
                const badge = SHOP_ITEMS.badges.find(b => b.id === badgeId);
                if (!badge) return null;

                return (
                    <div key={idx} className="profile-badge-chip">
                        {badge.imageUrl ? (
                            <img src={badge.imageUrl} alt="" style={{ width: 12, height: 12 }} />
                        ) : (
                            <span>{badge.preview}</span>
                        )}
                        <span>{lang === 'ar' ? badge.name_ar : badge.name_en}</span>
                    </div>
                );
            })}
        </div>
    );
};

// 👤 AVATAR WITH FRAME V11 - FIXED CIRCULAR (Frame AROUND Avatar)
const AvatarWithFrameV11 = ({ photoURL, equipped, size = 'lg', isOnline }) => {
    const sizeMap = {
        sm: { wrapper: 64, avatar: 36, frameSize: 56 },
        md: { wrapper: 80, avatar: 48, frameSize: 72 },
        lg: { wrapper: 96, avatar: 58, frameSize: 90 },
        xl: { wrapper: 150, avatar: 90, frameSize: 140 }
    };

    const s = sizeMap[size] || sizeMap.lg;
    const frame = equipped?.frames;
    const frameStyle = frame ? SHOP_ITEMS.frames.find(f => f.id === frame) : null;

    return (
        <div className="profile-avatar-container" style={{ 
            position: 'relative',
            width: s.wrapper,
            height: s.wrapper,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* Frame layer - AROUND the avatar (larger than avatar) */}
            {frameStyle && frameStyle.preview && (
                <div 
                    className="profile-avatar-frame"
                    style={{ 
                        position: 'absolute',
                        width: s.frameSize,
                        height: s.frameSize,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        zIndex: 1
                    }}
                >
                    {frameStyle.preview.startsWith('http') ? (
                        <img src={frameStyle.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            background: frameStyle.preview,
                            borderRadius: '50%'
                        }} />
                    )}
                </div>
            )}
            
            {/* Avatar image - CENTERED inside frame */}
            <img 
                src={photoURL || `https://ui-avatars.com/api/?name=User&background=1e293b&color=fff&size=${s.avatar * 2}`}
                alt=""
                className="profile-avatar"
                style={{ 
                    width: s.avatar, 
                    height: s.avatar,
                    borderRadius: '50%',
                    position: 'relative',
                    zIndex: 10,
                    border: '3px solid #0f172a',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    objectFit: 'cover',
                    background: '#0f172a'
                }}
            />
            
            {isOnline !== undefined && (
                <div className={`profile-status-dot ${isOnline ? '' : 'offline'}`}></div>
            )}
        </div>
    );
};

// ==========================================
// 📸 MOMENTS SYSTEM - Complete Component
// ==========================================

// Max file size: 2MB images, 5MB videos (10 sec max)
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const MAX_VIDEO_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_DURATION = 10;

const AllMomentsModal = ({ show, onClose, moments, ownerName, lang, onSelectMoment }) => {
    if (!show) return null;
    return (
        <div className="modal-overlay" onClick={onClose} style={{zIndex:14000}}>
            <div className="animate-pop" onClick={e => e.stopPropagation()} style={{
                background:'linear-gradient(180deg,#0f0f1e,#0a0a14)',
                border:'1px solid rgba(0,242,255,0.2)',
                borderRadius:'18px', width:'100%', maxWidth:'420px',
                maxHeight:'85vh', display:'flex', flexDirection:'column', overflow:'hidden',
                boxShadow:'0 20px 60px rgba(0,0,0,0.9)'
            }}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <span style={{fontSize:'16px'}}>📸</span>
                        <div>
                            <div style={{fontSize:'13px', fontWeight:800, color:'white'}}>{lang==='ar'?'كل اللحظات':'All Moments'}</div>
                            <div style={{fontSize:'9px', color:'#6b7280'}}>{ownerName} · {moments.length} {lang==='ar'?'لحظة':'moments'}</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{background:'rgba(255,255,255,0.07)',border:'none',borderRadius:'8px',color:'#9ca3af',fontSize:'16px',width:'30px',height:'30px',cursor:'pointer'}}>✕</button>
                </div>
                <div style={{flex:1, overflowY:'auto', padding:'10px 12px'}}>
                    <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px'}}>
                        {moments.map(moment => (
                            <div key={moment.id} onClick={() => { onSelectMoment(moment); onClose(); }} style={{
                                aspectRatio:'1', borderRadius:'10px', overflow:'hidden',
                                background:'linear-gradient(135deg,rgba(0,242,255,0.06),rgba(112,0,255,0.06))',
                                border:'1px solid rgba(0,242,255,0.15)', cursor:'pointer', position:'relative',
                                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px',
                                transition:'transform 0.15s'
                            }}>
                                {moment.type === 'image' && moment.mediaUrl ? (
                                    <img src={moment.mediaUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                                ) : moment.type === 'video' && moment.mediaUrl ? (
                                    <video src={moment.mediaUrl} style={{width:'100%',height:'100%',objectFit:'cover'}} muted />
                                ) : (
                                    <div style={{fontSize:'11px',color:'#e2e8f0',padding:'8px',textAlign:'center',lineHeight:1.3, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:4, WebkitBoxOrient:'vertical'}}>
                                        {moment.content}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MomentsSection = ({ ownerUID, ownerName, currentUser, isOwnProfile, lang }) => {
    const [moments, setMoments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMoment, setSelectedMoment] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAllMoments, setShowAllMoments] = useState(false);
    const PREVIEW_COUNT = 3;

    useEffect(() => {
        if (!ownerUID) return;
        setLoading(true);
        const unsub = momentsCollection
            .where('authorUID', '==', ownerUID)
            .limit(50)
            .onSnapshot(snap => {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                data.sort((a, b) => {
                    const ta = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
                    const tb = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
                    return tb - ta;
                });
                setMoments(data);
                setLoading(false);
            }, () => setLoading(false));
        return unsub;
    }, [ownerUID]);

    const previewMoments = moments.slice(0, PREVIEW_COUNT);
    const hasMore = moments.length > PREVIEW_COUNT;

    return (
        <div style={{
            margin:'8px 12px',
            background:'linear-gradient(135deg,rgba(0,0,0,0.35),rgba(0,0,0,0.2))',
            border:'1px solid rgba(0,242,255,0.12)',
            borderRadius:'14px',
            overflow:'hidden',
            boxShadow:'0 8px 32px rgba(0,0,0,0.3)'
        }}>
            {/* Header */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', borderBottom: moments.length > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none'}}>
                <button
                    onClick={() => moments.length > 0 && setShowAllMoments(true)}
                    style={{
                        display:'flex', alignItems:'center', gap:'6px', background:'none', border:'none',
                        cursor: moments.length > 0 ? 'pointer' : 'default', padding:0
                    }}
                >
                    <span style={{fontSize:'11px'}}>📸</span>
                    <span style={{fontSize:'10px', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.5px'}}>
                        {lang === 'ar' ? 'اللحظات' : 'Moments'}
                    </span>
                    <span style={{
                        fontSize:'9px', fontWeight:800, color:'#00f2ff',
                        background:'rgba(0,242,255,0.1)', border:'1px solid rgba(0,242,255,0.25)',
                        borderRadius:'4px', padding:'1px 5px'
                    }}>{moments.length}</span>
                </button>
                <div style={{display:'flex', gap:'6px', alignItems:'center'}}>
                    {hasMore && (
                        <button
                            onClick={() => setShowAllMoments(true)}
                            style={{fontSize:'9px', color:'#94a3b8', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'6px', padding:'3px 8px', cursor:'pointer', fontWeight:600}}
                        >
                            {lang === 'ar' ? `الكل (${moments.length})` : `All (${moments.length})`}
                        </button>
                    )}
                    {isOwnProfile && currentUser && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{fontSize:'9px', color:'#00f2ff', background:'rgba(0,242,255,0.08)', border:'1px solid rgba(0,242,255,0.25)', borderRadius:'6px', padding:'3px 8px', cursor:'pointer', fontWeight:700}}
                        >
                            + {lang === 'ar' ? 'أضف' : 'Add'}
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div style={{padding:'10px 12px 12px'}}>
            {loading ? (
                <div style={{textAlign:'center', padding:'16px', color:'#64748b', fontSize:'11px'}}>...</div>
            ) : moments.length === 0 ? (
                <div style={{textAlign:'center', padding:'12px', color:'#64748b', fontSize:'11px'}}>
                    {lang === 'ar' ? 'لا توجد لحظات بعد' : 'No moments yet'}
                </div>
            ) : (
                <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'5px'}}>
                    {previewMoments.map(moment => (
                        <div
                            key={moment.id}
                            onClick={() => setSelectedMoment(moment)}
                            style={{
                                aspectRatio:'1', borderRadius:'10px', overflow:'hidden',
                                background:'linear-gradient(135deg,rgba(0,242,255,0.06),rgba(112,0,255,0.06))',
                                border:'1px solid rgba(0,242,255,0.18)',
                                boxShadow:'0 0 8px rgba(0,242,255,0.06)',
                                cursor:'pointer', position:'relative', transition:'transform 0.15s',
                                display:'flex', alignItems:'center', justifyContent:'center'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform='scale(0.97)'}
                            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                        >
                            {/* Moment type indicator */}
                            <div style={{position:'absolute', top:'4px', left:'4px', zIndex:2, fontSize:'8px', background:'rgba(0,0,0,0.6)', borderRadius:'4px', padding:'1px 4px', color:'#00f2ff', fontWeight:700}}>
                                {moment.type === 'text' ? '✏️' : moment.type === 'image' ? '🖼️' : '🎥'}
                            </div>

                            {moment.type === 'text' ? (
                                <div style={{padding:'8px', fontSize:'9px', color:'#e2e8f0', textAlign:'center', wordBreak:'break-word', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:5, WebkitBoxOrient:'vertical'}}>
                                    {moment.content}
                                </div>
                            ) : moment.type === 'image' ? (
                                <img src={moment.mediaUrl} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                            ) : moment.type === 'video' ? (
                                <div style={{width:'100%', height:'100%', position:'relative', background:'#000'}}>
                                    <video src={moment.mediaUrl} style={{width:'100%', height:'100%', objectFit:'cover'}} muted />
                                    <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.25)'}}>
                                        <span style={{fontSize:'22px'}}>▶</span>
                                    </div>
                                </div>
                            ) : null}

                            {/* Likes + comments bottom bar */}
                            <div style={{position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(transparent,rgba(0,0,0,0.75))', padding:'8px 4px 3px', display:'flex', justifyContent:'flex-end', gap:'6px', alignItems:'center'}}>
                                {(moment.likesCount || 0) > 0 && (
                                    <span style={{fontSize:'8px', color:'#f87171', fontWeight:700}}>❤️ {moment.likesCount}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedMoment && (
                <MomentDetailModal
                    moment={selectedMoment}
                    onClose={() => setSelectedMoment(null)}
                    currentUser={currentUser}
                    isOwnProfile={isOwnProfile}
                    lang={lang}
                    onDelete={(id) => {
                        momentsCollection.doc(id).delete();
                        setSelectedMoment(null);
                    }}
                />
            )}

            {showCreateModal && (
                <CreateMomentModal
                    onClose={() => setShowCreateModal(false)}
                    currentUser={currentUser}
                    lang={lang}
                />
            )}
            </div>{/* end content padding */}
            </div>{/* end container box */}

            {showAllMoments && (
                <AllMomentsModal
                    show={showAllMoments}
                    onClose={() => setShowAllMoments(false)}
                    moments={moments}
                    ownerName={ownerName || ''}
                    lang={lang}
                    onSelectMoment={setSelectedMoment}
                />
            )}
    );
};

const MomentDetailModal = ({ moment, onClose, currentUser, isOwnProfile, lang, onDelete }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(moment.likesCount || 0);
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [reportSent, setReportSent] = useState(false);
    const [showReportMomentModal, setShowReportMomentModal] = useState(false);
    const [lastCommentTime, setLastCommentTime] = useState(0);
    const COMMENT_COOLDOWN_MS = 60000; // 1 minute
    const [cooldownTick, setCooldownTick] = useState(0);
    
    // Tick every second to update cooldown display
    useEffect(() => {
        const timer = setInterval(() => setCooldownTick(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);
    
    const cooldownRemaining = Math.max(0, Math.ceil((COMMENT_COOLDOWN_MS - (Date.now() - lastCommentTime)) / 1000));
    const isCoolingDown = cooldownRemaining > 0 && lastCommentTime > 0;
    const [momentReportReason, setMomentReportReason] = useState('');
    const [showReportCommentModal, setShowReportCommentModal] = useState(false);
    const [reportTargetComment, setReportTargetComment] = useState(null);
    const [commentReportReason, setCommentReportReason] = useState('');

    useEffect(() => {
        if (!moment.id) return;
        const unsub = momentsCollection.doc(moment.id).collection('comments')
            .limit(50)
            .onSnapshot(snap => {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                data.sort((a, b) => {
                    const ta = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
                    const tb = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
                    return ta - tb;
                });
                setComments(data);
            });
        if (currentUser) {
            setLiked((moment.likedBy || []).includes(currentUser.uid));
            setLikesCount(moment.likesCount || 0);
        }
        return unsub;
    }, [moment.id]);

    const handleLike = async () => {
        if (!currentUser?.uid) return;
        const docRef = momentsCollection.doc(moment.id);
        if (liked) {
            await docRef.update({ likedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.uid), likesCount: firebase.firestore.FieldValue.increment(-1) });
            setLiked(false); setLikesCount(p => Math.max(0, p - 1));
        } else {
            await docRef.update({ likedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid), likesCount: firebase.firestore.FieldValue.increment(1) });
            setLiked(true); setLikesCount(p => p + 1);
        }
    };

    const handleComment = async () => {
        if (!newComment.trim() || !currentUser || submitting) return;
        // Anti-spam: 1 minute cooldown
        const now = Date.now();
        if (now - lastCommentTime < COMMENT_COOLDOWN_MS) {
            // Just block silently - UI shows cooldown timer
            return;
        }
        setSubmitting(true);
        await momentsCollection.doc(moment.id).collection('comments').add({
            authorUID: currentUser.uid,
            authorName: currentUser.displayName || (lang === 'ar' ? 'مستخدم' : 'User'),
            authorPhoto: currentUser.photoURL || null,
            text: newComment.trim(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        setNewComment(''); setSubmitting(false); setLastCommentTime(Date.now());
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm(lang === 'ar' ? 'حذف هذا التعليق؟' : 'Delete this comment?')) return;
        await momentsCollection.doc(moment.id).collection('comments').doc(commentId).delete();
    };

    const handleReportMoment = async () => {
        if (!currentUser || reportSent || !momentReportReason) return;
        try {
            await reportsCollection.add({
                type: 'moment',
                reason: momentReportReason,
                targetId: moment.id,
                targetOwnerUID: moment.authorUID,
                momentType: moment.type,
                momentContent: moment.type === 'text' ? (moment.content || '') : '',
                momentMediaUrl: (moment.type === 'image' || moment.type === 'video') ? (moment.mediaUrl || '') : '',
                reporterUID: currentUser.uid,
                reporterName: currentUser.displayName || 'User',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            setReportSent(true);
            setShowReportMomentModal(false);
            setMomentReportReason('');
        } catch(e) { console.error(e); }
    };

    const handleReportCommentSubmit = async () => {
        if (!currentUser || !reportTargetComment || !commentReportReason) return;
        try {
            await reportsCollection.add({
                type: 'moment_comment',
                reason: commentReportReason,
                targetId: reportTargetComment.id,
                momentId: moment.id,
                commentText: reportTargetComment.text || '',
                targetOwnerUID: reportTargetComment.authorUID,
                reporterUID: currentUser.uid,
                reporterName: currentUser.displayName || 'User',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            setShowReportCommentModal(false);
            setReportTargetComment(null);
            setCommentReportReason('');
        } catch(e) { console.error(e); }
    };

    const handleReportComment = async (comment) => {
        if (!currentUser) return;
        try {
            await reportsCollection.add({
                type: 'moment_comment',
                targetId: comment.id,
                momentId: moment.id,
                targetOwnerUID: comment.authorUID,
                reporterUID: currentUser.uid,
                reporterName: currentUser.displayName || 'User',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch(e) {}
    };

    return (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99999, padding:'16px'}} onClick={onClose}>
            <div style={{background:'linear-gradient(180deg,#1e293b,#0f172a)', border:'1px solid rgba(0,242,255,0.2)', borderRadius:'16px', width:'100%', maxWidth:'400px', maxHeight:'85vh', overflow:'hidden', display:'flex', flexDirection:'column'}} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        {moment.authorPhoto
                            ? <img src={moment.authorPhoto} alt="" style={{width:'28px', height:'28px', borderRadius:'50%', objectFit:'cover'}} />
                            : <div style={{width:'28px', height:'28px', borderRadius:'50%', background:'#374151', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px'}}>👤</div>
                        }
                        <span style={{fontSize:'12px', fontWeight:700, color:'white'}}>{moment.authorName}</span>
                    </div>
                    <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                        {/* Report button - shown to non-owners */}
                        {currentUser && !isOwnProfile && (
                            <button
                                onClick={() => !reportSent && setShowReportMomentModal(true)}
                                title={lang === 'ar' ? 'إبلاغ' : 'Report'}
                                style={{background: reportSent ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.06)', border: reportSent ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgba(255,255,255,0.1)', borderRadius:'6px', color: reportSent ? '#fbbf24' : '#6b7280', fontSize:'10px', padding:'3px 8px', cursor: reportSent ? 'default' : 'pointer', fontWeight:700}}
                            >
                                {reportSent ? (lang === 'ar' ? '✓ تم' : '✓ Sent') : (lang === 'ar' ? '🚩 إبلاغ' : '🚩 Report')}
                            </button>
                        )}
                        {/* Delete button - shown to owner */}
                        {isOwnProfile && (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                style={{background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'6px', color:'#f87171', fontSize:'10px', padding:'3px 8px', cursor:'pointer', fontWeight:700}}
                            >
                                🗑️
                            </button>
                        )}
                        <button onClick={onClose} style={{background:'rgba(255,255,255,0.08)', border:'none', color:'#9ca3af', fontSize:'16px', cursor:'pointer', borderRadius:'6px', padding:'4px 8px'}}>✕</button>
                    </div>
                </div>

                {/* Content */}
                <div style={{flex:'0 0 auto', padding:'12px 14px', background:'rgba(0,0,0,0.2)'}}>
                    {(moment.type === 'image' || moment.type === 'video') && moment.mediaUrl && (
                        <div style={{marginBottom: moment.content ? '10px' : 0}}>
                            {moment.type === 'image'
                                ? <img src={moment.mediaUrl} alt="" style={{width:'100%', borderRadius:'10px', maxHeight:'250px', objectFit:'cover'}} />
                                : <video src={moment.mediaUrl} controls style={{width:'100%', borderRadius:'10px', maxHeight:'250px'}} />
                            }
                        </div>
                    )}
                    {moment.content ? (
                        <p style={{fontSize:'13px', color:'#e2e8f0', lineHeight:1.6, margin:0}}>{moment.content}</p>
                    ) : null}
                </div>

                {/* Like + stats bar */}
                <div style={{padding:'8px 14px', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    <button
                        onClick={handleLike}
                        style={{
                            background: liked ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.05)',
                            border: liked ? '1px solid rgba(248,113,113,0.4)' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius:'8px', padding:'5px 12px', color: liked ? '#f87171' : '#9ca3af',
                            fontSize:'12px', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'
                        }}
                    >
                        {liked ? '❤️' : '🤍'} {likesCount}
                    </button>
                    <span style={{fontSize:'10px', color:'#64748b'}}>💬 {comments.length}</span>
                </div>

                {/* Comments list */}
                <div style={{flex:1, overflowY:'auto', padding:'8px 14px', display:'flex', flexDirection:'column', gap:'8px'}}>
                    {comments.length === 0 ? (
                        <div style={{textAlign:'center', color:'#64748b', fontSize:'11px', padding:'12px 0'}}>
                            {lang === 'ar' ? 'لا توجد تعليقات' : 'No comments yet'}
                        </div>
                    ) : comments.map(c => {
                        const isMyComment = currentUser?.uid === c.authorUID;
                        const isMomentOwner = isOwnProfile;
                        return (
                            <div key={c.id} style={{display:'flex', gap:'8px', alignItems:'flex-start'}}>
                                {c.authorPhoto
                                    ? <img src={c.authorPhoto} alt="" style={{width:'24px', height:'24px', borderRadius:'50%', objectFit:'cover', flexShrink:0}} />
                                    : <div style={{width:'24px', height:'24px', borderRadius:'50%', background:'#374151', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px'}}>👤</div>
                                }
                                <div style={{background:'rgba(255,255,255,0.05)', borderRadius:'10px', padding:'6px 10px', flex:1, minWidth:0}}>
                                    <div style={{fontSize:'9px', fontWeight:700, color:'#00f2ff', marginBottom:'2px'}}>{c.authorName}</div>
                                    <div style={{fontSize:'11px', color:'#e2e8f0', lineHeight:1.4, wordBreak:'break-word'}}>{c.text}</div>
                                </div>
                                {/* Actions: delete for owner/moment-owner, report for all non-authors */}
                                <div style={{display:'flex', flexDirection:'column', gap:'3px', flexShrink:0}}>
                                    {(isMyComment || isMomentOwner) && (
                                        <button
                                            onClick={() => handleDeleteComment(c.id)}
                                            title={lang === 'ar' ? 'حذف' : 'Delete'}
                                            style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'5px', color:'#f87171', fontSize:'9px', padding:'2px 5px', cursor:'pointer', lineHeight:1}}
                                        >✕</button>
                                    )}
                                    {!isMyComment && currentUser && (
                                        <button
                                            onClick={() => { setReportTargetComment(c); setShowReportCommentModal(true); }}
                                            title={lang === 'ar' ? 'إبلاغ' : 'Report'}
                                            style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'5px', color:'#6b7280', fontSize:'9px', padding:'2px 5px', cursor:'pointer', lineHeight:1}}
                                        >🚩</button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Comment input */}
                {currentUser && (
                    <div style={{padding:'10px 14px', borderTop:'1px solid rgba(255,255,255,0.08)'}}>
                        {isCoolingDown ? (
                            /* Cooldown banner - shown INSIDE modal in place of input */
                            <div style={{
                                display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
                                padding:'10px 14px', borderRadius:'12px',
                                background:'linear-gradient(135deg,rgba(255,136,0,0.12),rgba(255,60,0,0.08))',
                                border:'1px solid rgba(255,136,0,0.3)'
                            }}>
                                <div style={{
                                    width:'36px', height:'36px', borderRadius:'50%', flexShrink:0,
                                    background:'rgba(255,136,0,0.15)', border:'2px solid rgba(255,136,0,0.4)',
                                    display:'flex', alignItems:'center', justifyContent:'center',
                                    fontSize:'16px'
                                }}>⏳</div>
                                <div>
                                    <div style={{fontSize:'11px', fontWeight:700, color:'#fb923c'}}>
                                        {lang === 'ar' ? 'انتظر قبل التعليق التالي' : 'Wait before next comment'}
                                    </div>
                                    <div style={{fontSize:'10px', color:'#9ca3af', marginTop:'2px'}}>
                                        {lang === 'ar' ? `${cooldownRemaining} ثانية` : `${cooldownRemaining}s remaining`}
                                    </div>
                                </div>
                                {/* Progress bar */}
                                <div style={{flex:1, height:'4px', background:'rgba(255,255,255,0.08)', borderRadius:'2px', overflow:'hidden'}}>
                                    <div style={{
                                        height:'100%', borderRadius:'2px',
                                        background:'linear-gradient(90deg,#ff8800,#ff4500)',
                                        width:`${(cooldownRemaining / 60) * 100}%`,
                                        transition:'width 1s linear'
                                    }}/>
                                </div>
                            </div>
                        ) : (
                            <div style={{display:'flex', gap:'8px'}}>
                                <input
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleComment()}
                                    placeholder={lang === 'ar' ? 'اكتب تعليقاً...' : 'Write a comment...'}
                                    style={{flex:1, background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'8px 12px', color:'white', fontSize:'12px', outline:'none', fontFamily:'inherit'}}
                                />
                                <button
                                    onClick={handleComment}
                                    disabled={!newComment.trim() || submitting}
                                    style={{background:'linear-gradient(135deg,#7000ff,#00f2ff)', border:'none', borderRadius:'10px', color:'white', fontSize:'12px', fontWeight:700, padding:'8px 14px', cursor:'pointer', opacity: (!newComment.trim() || submitting) ? 0.5 : 1}}
                                >
                                    {lang === 'ar' ? 'إرسال' : 'Send'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── REPORT MOMENT MODAL ── */}
                {showReportMomentModal && (
                    <PortalModal>
                        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999999,padding:'16px'}} onClick={() => setShowReportMomentModal(false)}>
                            <div style={{background:'linear-gradient(180deg,#1e293b,#0f172a)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'14px',padding:'20px',maxWidth:'300px',width:'100%'}} onClick={e => e.stopPropagation()}>
                                <div style={{fontSize:'22px',textAlign:'center',marginBottom:'6px'}}>🚩</div>
                                <div style={{fontSize:'14px',fontWeight:800,color:'white',textAlign:'center',marginBottom:'4px'}}>
                                    {lang==='ar'?'إبلاغ عن اللحظة':'Report Moment'}
                                </div>
                                <div style={{fontSize:'11px',color:'#9ca3af',textAlign:'center',marginBottom:'14px'}}>
                                    {lang==='ar'?'اختر سبب الإبلاغ:':'Select a reason:'}
                                </div>
                                <div style={{display:'flex',flexDirection:'column',gap:'6px',marginBottom:'14px'}}>
                                    {[
                                        {key:'offensive_image', icon:'🖼️', ar:'صورة مسيئة/مهينة', en:'Offensive Image'},
                                        {key:'verbal_abuse',    icon:'💬', ar:'شتيمة/إهانة',       en:'Verbal Abuse'},
                                        {key:'spam',            icon:'📢', ar:'سبام',               en:'Spam'},
                                        {key:'other',           icon:'❓', ar:'سبب آخر',            en:'Other'}
                                    ].map(r => (
                                        <button key={r.key} onClick={() => setMomentReportReason(r.key)} style={{
                                            padding:'8px 12px', borderRadius:'8px', fontSize:'12px', cursor:'pointer',
                                            display:'flex', alignItems:'center', gap:'8px', fontWeight:600, textAlign:'start',
                                            background: momentReportReason===r.key ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)',
                                            border: momentReportReason===r.key ? '1.5px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
                                            color: momentReportReason===r.key ? '#fca5a5' : '#9ca3af'
                                        }}>
                                            <span>{r.icon}</span><span>{lang==='ar'?r.ar:r.en}</span>
                                        </button>
                                    ))}
                                </div>
                                <div style={{display:'flex',gap:'8px'}}>
                                    <button onClick={() => { setShowReportMomentModal(false); setMomentReportReason(''); }} style={{flex:1,padding:'8px',borderRadius:'8px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'#9ca3af',fontSize:'12px',fontWeight:700,cursor:'pointer'}}>
                                        {lang==='ar'?'إلغاء':'Cancel'}
                                    </button>
                                    <button onClick={handleReportMoment} disabled={!momentReportReason} style={{flex:1,padding:'8px',borderRadius:'8px',background: momentReportReason ? 'rgba(239,68,68,0.2)' : 'rgba(100,100,100,0.1)',border: momentReportReason ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.05)',color: momentReportReason ? '#f87171' : '#4b5563',fontSize:'12px',fontWeight:700,cursor: momentReportReason ? 'pointer' : 'default',opacity: momentReportReason ? 1 : 0.5}}>
                                        {lang==='ar'?'إرسال':'Submit'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </PortalModal>
                )}

                {/* ── REPORT COMMENT MODAL ── */}
                {showReportCommentModal && reportTargetComment && (
                    <PortalModal>
                        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999999,padding:'16px'}} onClick={() => { setShowReportCommentModal(false); setReportTargetComment(null); }}>
                            <div style={{background:'linear-gradient(180deg,#1e293b,#0f172a)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'14px',padding:'20px',maxWidth:'300px',width:'100%'}} onClick={e => e.stopPropagation()}>
                                <div style={{fontSize:'22px',textAlign:'center',marginBottom:'6px'}}>🚩</div>
                                <div style={{fontSize:'14px',fontWeight:800,color:'white',textAlign:'center',marginBottom:'4px'}}>
                                    {lang==='ar'?'إبلاغ عن تعليق':'Report Comment'}
                                </div>
                                {/* Show the comment content */}
                                <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'8px',padding:'8px 10px',marginBottom:'12px',fontSize:'11px',color:'#cbd5e1',maxHeight:'60px',overflow:'hidden',textOverflow:'ellipsis'}}>
                                    💬 {reportTargetComment.text}
                                </div>
                                <div style={{fontSize:'11px',color:'#9ca3af',textAlign:'center',marginBottom:'10px'}}>
                                    {lang==='ar'?'اختر سبب الإبلاغ:':'Select a reason:'}
                                </div>
                                <div style={{display:'flex',flexDirection:'column',gap:'6px',marginBottom:'14px'}}>
                                    {[
                                        {key:'verbal_abuse', icon:'💬', ar:'شتيمة/إهانة',    en:'Verbal Abuse'},
                                        {key:'spam',         icon:'📢', ar:'سبام',            en:'Spam'},
                                        {key:'harassment',   icon:'😡', ar:'مضايقة',          en:'Harassment'},
                                        {key:'other',        icon:'❓', ar:'سبب آخر',         en:'Other'}
                                    ].map(r => (
                                        <button key={r.key} onClick={() => setCommentReportReason(r.key)} style={{
                                            padding:'8px 12px', borderRadius:'8px', fontSize:'12px', cursor:'pointer',
                                            display:'flex', alignItems:'center', gap:'8px', fontWeight:600,
                                            background: commentReportReason===r.key ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)',
                                            border: commentReportReason===r.key ? '1.5px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
                                            color: commentReportReason===r.key ? '#fca5a5' : '#9ca3af'
                                        }}>
                                            <span>{r.icon}</span><span>{lang==='ar'?r.ar:r.en}</span>
                                        </button>
                                    ))}
                                </div>
                                <div style={{display:'flex',gap:'8px'}}>
                                    <button onClick={() => { setShowReportCommentModal(false); setReportTargetComment(null); setCommentReportReason(''); }} style={{flex:1,padding:'8px',borderRadius:'8px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'#9ca3af',fontSize:'12px',fontWeight:700,cursor:'pointer'}}>
                                        {lang==='ar'?'إلغاء':'Cancel'}
                                    </button>
                                    <button onClick={handleReportCommentSubmit} disabled={!commentReportReason} style={{flex:1,padding:'8px',borderRadius:'8px',background: commentReportReason ? 'rgba(239,68,68,0.2)' : 'rgba(100,100,100,0.1)',border: commentReportReason ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.05)',color: commentReportReason ? '#f87171' : '#4b5563',fontSize:'12px',fontWeight:700,cursor: commentReportReason ? 'pointer' : 'default',opacity: commentReportReason ? 1 : 0.5}}>
                                        {lang==='ar'?'إرسال':'Submit'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </PortalModal>
                )}

                {/* Delete confirm - PortalModal to escape overflow:hidden */}
                {showDeleteConfirm && (
                    <PortalModal>
                        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999999, padding:'16px'}} onClick={() => setShowDeleteConfirm(false)}>
                            <div style={{background:'linear-gradient(180deg,#1e293b,#0f172a)', border:'1px solid rgba(239,68,68,0.35)', borderRadius:'14px', padding:'22px 24px', textAlign:'center', maxWidth:'260px', width:'100%'}} onClick={e => e.stopPropagation()}>
                                <div style={{fontSize:'32px', marginBottom:'8px'}}>🗑️</div>
                                <div style={{fontSize:'14px', fontWeight:800, color:'white', marginBottom:'6px'}}>
                                    {lang === 'ar' ? 'حذف اللحظة؟' : 'Delete Moment?'}
                                </div>
                                <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'18px'}}>
                                    {lang === 'ar' ? 'لا يمكن التراجع عن هذا الإجراء' : 'This action cannot be undone'}
                                </div>
                                <div style={{display:'flex', gap:'8px'}}>
                                    <button onClick={() => setShowDeleteConfirm(false)} style={{flex:1, padding:'9px', borderRadius:'8px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'#9ca3af', fontSize:'12px', fontWeight:700, cursor:'pointer'}}>
                                        {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                                    </button>
                                    <button onClick={() => { setShowDeleteConfirm(false); onDelete(moment.id); }} style={{flex:1, padding:'9px', borderRadius:'8px', background:'rgba(239,68,68,0.18)', border:'1px solid rgba(239,68,68,0.4)', color:'#f87171', fontSize:'12px', fontWeight:700, cursor:'pointer'}}>
                                        {lang === 'ar' ? 'حذف' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </PortalModal>
                )}
            </div>
        </div>
    );
};

const CreateMomentModal = ({ onClose, currentUser, lang }) => {
    const [momentType, setMomentType] = useState('text');
    const [textContent, setTextContent] = useState('');  // text content OR caption
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError('');

        if (momentType === 'image') {
            if (file.size > MAX_IMAGE_SIZE) {
                setError(lang === 'ar' ? 'حجم الصورة كبير جداً (الحد 2MB)' : 'Image too large (max 2MB)');
                return;
            }
            // Compress image with canvas to stay under Firestore 1MB doc limit
            const reader = new FileReader();
            reader.onload = ev => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_W = 800, MAX_H = 800;
                    let w = img.width, h = img.height;
                    if (w > MAX_W || h > MAX_H) {
                        const ratio = Math.min(MAX_W / w, MAX_H / h);
                        w = Math.round(w * ratio);
                        h = Math.round(h * ratio);
                    }
                    canvas.width = w; canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    const compressed = canvas.toDataURL('image/jpeg', 0.6);
                    setMediaPreview(compressed);
                    setMediaFile(file);
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        } else if (momentType === 'video') {
            if (file.size > MAX_VIDEO_SIZE) {
                setError(lang === 'ar' ? 'حجم الفيديو كبير جداً (الحد 5MB)' : 'Video too large (max 5MB)');
                return;
            }
            const url = URL.createObjectURL(file);
            const video = document.createElement('video');
            video.src = url;
            video.onloadedmetadata = () => {
                URL.revokeObjectURL(url);
                if (video.duration > MAX_VIDEO_DURATION) {
                    setError(lang === 'ar' ? `الفيديو يجب أن يكون ${MAX_VIDEO_DURATION} ثواني فقط` : `Video must be max ${MAX_VIDEO_DURATION} seconds`);
                    return;
                }
                const reader = new FileReader();
                reader.onload = ev => setMediaPreview(ev.target.result);
                reader.readAsDataURL(file);
                setMediaFile(file);
            };
        }
    };

    const handleSubmit = async () => {
        if (!currentUser) return;
        if (momentType === 'text' && !textContent.trim()) return;
        if ((momentType === 'image' || momentType === 'video') && !mediaFile) return;
        setUploading(true);

        try {
            const momentData = {
                authorUID: currentUser.uid,
                authorName: currentUser.displayName || (lang === 'ar' ? 'مستخدم' : 'User'),
                authorPhoto: currentUser.photoURL || null,
                type: momentType,
                content: textContent.trim(), // caption for image/video, full text for text type
                mediaUrl: (momentType === 'image' || momentType === 'video') ? mediaPreview : null,
                likesCount: 0,
                likedBy: [],
                commentsCount: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            await momentsCollection.add(momentData);
            onClose();
        } catch (e) {
            setError(lang === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'Error occurred, try again');
        }
        setUploading(false);
    };

    return (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99999, padding:'16px'}} onClick={onClose}>
            <div style={{background:'linear-gradient(180deg,#1e293b,#0f172a)', border:'1px solid rgba(0,242,255,0.25)', borderRadius:'16px', width:'100%', maxWidth:'360px', overflow:'hidden'}} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                    <span style={{fontWeight:800, fontSize:'15px', color:'white'}}>{lang === 'ar' ? '📸 لحظة جديدة' : '📸 New Moment'}</span>
                    <button onClick={onClose} style={{background:'rgba(255,255,255,0.1)', border:'none', color:'#9ca3af', fontSize:'16px', cursor:'pointer', borderRadius:'6px', padding:'4px 8px'}}>✕</button>
                </div>

                <div style={{padding:'16px'}}>
                    {/* Type selector */}
                    <div style={{display:'flex', gap:'6px', marginBottom:'14px'}}>
                        {[
                            {id:'text', icon:'✏️', ar:'نص', en:'Text'},
                            {id:'image', icon:'🖼️', ar:'صورة', en:'Image'},
                            {id:'video', icon:'🎥', ar:'فيديو', en:'Video'}
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => { setMomentType(t.id); setMediaFile(null); setMediaPreview(null); setError(''); }}
                                style={{
                                    flex:1, padding:'8px 4px', borderRadius:'10px', fontSize:'11px', fontWeight:700, cursor:'pointer',
                                    background: momentType === t.id ? 'rgba(0,242,255,0.2)' : 'rgba(255,255,255,0.04)',
                                    border: momentType === t.id ? '1.5px solid #00f2ff' : '1px solid rgba(255,255,255,0.1)',
                                    color: momentType === t.id ? '#00f2ff' : '#9ca3af',
                                    display:'flex', alignItems:'center', justifyContent:'center', gap:'4px'
                                }}
                            >
                                {t.icon} {lang === 'ar' ? t.ar : t.en}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    {momentType === 'text' && (
                        <textarea
                            value={textContent}
                            onChange={e => setTextContent(e.target.value)}
                            maxLength={280}
                            placeholder={lang === 'ar' ? 'اكتب لحظتك هنا...' : 'Write your moment here...'}
                            style={{width:'100%', background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'10px 12px', color:'white', fontSize:'13px', fontFamily:'inherit', resize:'none', height:'100px', outline:'none'}}
                        />
                    )}

                    {(momentType === 'image' || momentType === 'video') && (
                        <div>
                            <input ref={fileRef} type="file" accept={momentType === 'image' ? 'image/*' : 'video/*'} onChange={handleFileChange} style={{display:'none'}} />
                            {mediaPreview ? (
                                <div style={{position:'relative', borderRadius:'10px', overflow:'hidden', marginBottom:'8px'}}>
                                    {momentType === 'image'
                                        ? <img src={mediaPreview} alt="" style={{width:'100%', maxHeight:'180px', objectFit:'cover'}} />
                                        : <video src={mediaPreview} controls style={{width:'100%', maxHeight:'180px'}} />
                                    }
                                    <button onClick={() => { setMediaFile(null); setMediaPreview(null); setTextContent(''); }} style={{position:'absolute', top:'6px', right:'6px', background:'rgba(0,0,0,0.7)', border:'none', color:'white', borderRadius:'50%', width:'24px', height:'24px', cursor:'pointer', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center'}}>✕</button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    style={{border:'2px dashed rgba(0,242,255,0.3)', borderRadius:'10px', padding:'24px', textAlign:'center', cursor:'pointer', color:'#64748b', fontSize:'12px'}}
                                >
                                    <div style={{fontSize:'28px', marginBottom:'6px'}}>{momentType === 'image' ? '🖼️' : '🎥'}</div>
                                    <div>{lang === 'ar' ? 'انقر لاختيار ملف' : 'Click to select file'}</div>
                                    <div style={{fontSize:'9px', marginTop:'4px', color:'#475569'}}>
                                        {momentType === 'image' ? (lang === 'ar' ? 'الحد الأقصى 2MB' : 'Max 2MB') : (lang === 'ar' ? 'الحد 10 ثواني / 5MB' : 'Max 10s / 5MB')}
                                    </div>
                                </div>
                            )}
                            {/* Caption field - optional text with image/video */}
                            <textarea
                                value={textContent}
                                onChange={e => setTextContent(e.target.value)}
                                maxLength={200}
                                placeholder={lang === 'ar' ? 'أضف تعليقاً (اختياري)...' : 'Add a caption (optional)...'}
                                style={{width:'100%', marginTop:'8px', background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'8px 12px', color:'white', fontSize:'12px', fontFamily:'inherit', resize:'none', height:'56px', outline:'none'}}
                            />
                        </div>
                    )}

                    {error && <div style={{color:'#f87171', fontSize:'11px', marginTop:'6px', textAlign:'center'}}>{error}</div>}

                    <button
                        onClick={handleSubmit}
                        disabled={uploading || (momentType === 'text' ? !textContent.trim() : !mediaFile)}
                        style={{
                            width:'100%', marginTop:'12px', padding:'12px', borderRadius:'12px',
                            background:'linear-gradient(135deg,#7000ff,#00f2ff)', color:'white',
                            fontSize:'14px', fontWeight:800, border:'none', cursor:'pointer',
                            opacity: (uploading || (momentType === 'text' ? !textContent.trim() : !mediaFile)) ? 0.5 : 1
                        }}
                    >
                        {uploading ? (lang === 'ar' ? 'جارٍ النشر...' : 'Posting...') : (lang === 'ar' ? 'نشر اللحظة 🚀' : 'Post Moment 🚀')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const MomentsSettingsSection = ({ currentUser, userData, lang }) => {
    const [moments, setMoments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedMoment, setSelectedMoment] = useState(null);

    useEffect(() => {
        if (!currentUser?.uid) return;
        const unsub = momentsCollection
            .where('authorUID', '==', currentUser.uid)
            .limit(20)
            .onSnapshot(snap => {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                data.sort((a, b) => {
                    const ta = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
                    const tb = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
                    return tb - ta;
                });
                setMoments(data);
                setLoading(false);
            }, () => setLoading(false));
        return unsub;
    }, [currentUser?.uid]);

    return (
        <div>
            <button
                onClick={() => setShowCreateModal(true)}
                style={{width:'100%', padding:'10px', borderRadius:'10px', background:'linear-gradient(135deg,rgba(0,242,255,0.15),rgba(112,0,255,0.1))', border:'1px solid rgba(0,242,255,0.3)', color:'#00f2ff', fontSize:'13px', fontWeight:800, cursor:'pointer', marginBottom:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}
            >
                <span>📸</span>
                <span>{lang === 'ar' ? 'إضافة لحظة جديدة' : 'Add New Moment'}</span>
            </button>

            {loading ? (
                <div style={{textAlign:'center', padding:'16px', color:'#64748b', fontSize:'12px'}}>...</div>
            ) : moments.length === 0 ? (
                <div style={{textAlign:'center', padding:'20px', color:'#64748b', fontSize:'12px'}}>
                    {lang === 'ar' ? 'لا توجد لحظات بعد. أضف أول لحظة!' : 'No moments yet. Add your first moment!'}
                </div>
            ) : (
                <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'6px'}}>
                    {moments.map(moment => (
                        <div key={moment.id} onClick={() => setSelectedMoment(moment)} style={{aspectRatio:'1', borderRadius:'8px', overflow:'hidden', background:'rgba(31,41,55,0.6)', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', position:'relative', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            {moment.type === 'text' ? (
                                <div style={{padding:'6px', fontSize:'9px', color:'#e2e8f0', textAlign:'center', wordBreak:'break-word', lineHeight:1.4, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:4, WebkitBoxOrient:'vertical'}}>{moment.content}</div>
                            ) : moment.type === 'image' ? (
                                <img src={moment.mediaUrl} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                            ) : (
                                <div style={{width:'100%', height:'100%', position:'relative', background:'#000', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                    <span style={{fontSize:'24px', opacity:0.7}}>🎥</span>
                                </div>
                            )}
                            <div style={{position:'absolute', bottom:'2px', right:'2px', background:'rgba(0,0,0,0.7)', borderRadius:'6px', padding:'1px 5px', fontSize:'8px', color:'#f87171', fontWeight:700}}>
                                ❤️ {moment.likesCount || 0}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && <CreateMomentModal onClose={() => setShowCreateModal(false)} currentUser={currentUser} lang={lang} />}
            {selectedMoment && (
                <MomentDetailModal
                    moment={selectedMoment}
                    onClose={() => setSelectedMoment(null)}
                    currentUser={currentUser}
                    isOwnProfile={true}
                    lang={lang}
                    onDelete={(id) => { momentsCollection.doc(id).delete(); setSelectedMoment(null); }}
                />
            )}
        </div>
    );
};

// ==========================================
// 🎯 PROFILE V11 - MAIN COMPONENT
// ==========================================
const ProfileV11 = ({ 
    show, 
    onClose, 
    targetUID, 
    lang, 
    currentUserUID, 
    onSendFriendRequest, 
    onSendGift, 
    userData, 
    currentUserFriends, 
    currentUserFriendRequests, 
    friendsData,
    isOwnProfileOverride = false,
    onOpenSettings,
    onOpenShop,
    onOpenInventory,
    onLogout,
    onLoginGoogle,
    isLoggedIn: isLoggedInProp,
    isGuest: isGuestProp,
    sessionClaimedToday,
    onOpenLoginRewards,
    currency: currencyProp,
    onOpenChat
}) => {
    const t = TRANSLATIONS[lang] || {};
    
    const [targetData, setTargetData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [blockedByTarget, setBlockedByTarget] = useState(false);
    const [showBlockConfirm, setShowBlockConfirm] = useState(false);
    const [gifts, setGifts] = useState([]);
    const [charismaRank, setCharismaRank] = useState(null);
    const [copiedId, setCopiedId] = useState(false);
    const [bannerURL, setBannerURL] = useState(null);
    const [bannerUploading, setBannerUploading] = useState(false);
    const bannerFileRef = useRef(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportSending, setReportSending] = useState(false);
    const [selfGift, setSelfGift] = useState(null);
    const [showSelfGiftModal, setShowSelfGiftModal] = useState(false);
    
    const optionsRef = useRef(null);

    useEffect(() => {
        if (!show || !targetUID) { 
            setLoading(true); 
            return; 
        }
        
        setLoading(true);
        setRequestSent(false);
        setShowOptionsMenu(false);
        
        usersCollection.doc(targetUID).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                setTargetData({ id: doc.id, ...data, isGuest: false });
                setBannerURL(data.bannerURL || null);
                const theirBlockedUsers = data.blockedUsers || [];
                setBlockedByTarget(theirBlockedUsers.includes(currentUserUID));
                setLoading(false);
            } else {
                guestsCollection.doc(targetUID).get().then(guestDoc => {
                    if (guestDoc.exists) {
                        setTargetData({ id: guestDoc.id, ...guestDoc.data(), isGuest: true });
                    } else {
                        setTargetData(null);
                    }
                    setLoading(false);
                }).catch(() => {
                    setTargetData(null);
                    setLoading(false);
                });
            }
        }).catch(() => {
            setLoading(false);
            setTargetData(null);
        });
    }, [show, targetUID, currentUserUID]);

    useEffect(() => {
        if (userData && targetUID) {
            const blocked = userData.blockedUsers || [];
            setIsBlocked(blocked.includes(targetUID));
        }
    }, [userData, targetUID]);

    // Fetch gifts without orderBy to avoid Firebase index requirement
    useEffect(() => {
        if (!show || !targetUID) return;
        
        const unsub = giftsLogCollection
            .where('receiverId', '==', targetUID)
            .limit(50)
            .onSnapshot(snap => {
                const giftData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // Sort in memory instead of query
                giftData.sort((a, b) => {
                    const timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds || 0;
                    const timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds || 0;
                    return timeB - timeA;
                });
                setGifts(giftData);
            }, error => {
                console.error('Gifts fetch error:', error);
            });
        
        return unsub;
    }, [show, targetUID]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (optionsRef.current && !optionsRef.current.contains(e.target)) {
                setShowOptionsMenu(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calculate charisma rank - must be before early return
    useEffect(() => {
        if (!show || !targetUID || !targetData) return;
        // Get rank from charisma leaderboard
        usersCollection.orderBy('charisma', 'desc').limit(1000).get().then(snap => {
            const users = snap.docs.map((doc, idx) => ({ id: doc.id, rank: idx + 1 }));
            const userRank = users.find(u => u.id === targetUID);
            setCharismaRank(userRank ? userRank.rank : '--');
        }).catch(() => {
            setCharismaRank('--');
        });
    }, [show, targetUID, targetData]);

    if (!show) return null;

    const isOwnProfile = isOwnProfileOverride || targetUID === currentUserUID;
    const isTargetGuest = targetData?.isGuest || targetData?.isAnonymous;
    const isGuestViewer = isGuestProp === true; // current user viewing is a guest
    const isAlreadyFriend = currentUserFriends?.includes(targetUID);
    const hasPendingRequest = currentUserFriendRequests?.includes(targetUID) || requestSent;

    const handleAddFriend = async () => {
        if (isAlreadyFriend || hasPendingRequest) return;
        await onSendFriendRequest(targetUID);
        setRequestSent(true);
    };

    const handleBlockUser = async () => {
        if (!userData || !targetUID) return;
        try {
            await usersCollection.doc(currentUserUID).update({
                blockedUsers: firebase.firestore.FieldValue.arrayUnion(targetUID)
            });
            setIsBlocked(true);
            setShowBlockConfirm(false);
            setShowOptionsMenu(false);
        } catch (error) {
            console.error('Block error:', error);
        }
    };

    const handleUnblockUser = async () => {
        if (!userData || !targetUID) return;
        try {
            await usersCollection.doc(currentUserUID).update({
                blockedUsers: firebase.firestore.FieldValue.arrayRemove(targetUID)
            });
            setIsBlocked(false);
            setShowOptionsMenu(false);
        } catch (error) {
            console.error('Unblock error:', error);
        }
    };

    const handleSendReport = async () => {
        if (!reportReason || !currentUserUID || !targetUID) return;
        setReportSending(true);
        try {
            await reportsCollection.add({
                reportedUID: targetUID,
                reportedName: targetData?.displayName || 'Unknown',
                reporterUID: currentUserUID,
                reason: reportReason,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            });
            setShowReportModal(false);
            setReportReason('');
            setShowOptionsMenu(false);
        } catch (e) {
            console.error('Report error:', e);
        }
        setReportSending(false);
    };

    const wins = targetData?.stats?.wins || 0;
    const losses = targetData?.stats?.losses || 0;
    const level = Math.floor((targetData?.stats?.xp || 0) / 100) + 1;

    return (
        <div className="modal-overlay" onClick={onClose} style={{zIndex: 10000}}>
            <div className="profile-glass-card animate-pop" onClick={e => e.stopPropagation()}>
                
                {/* Profile Header Bar - X button on RIGHT, Three dots on LEFT of X */}
                <div className="profile-header-bar">
                    {/* Spacer on left to push buttons to right */}
                    <div style={{ flex: 1 }}></div>
                    
                    {/* Three dots menu (only for other users) */}
                    {!isOwnProfile && !isTargetGuest && (
                        <div className="profile-options-container" ref={optionsRef}>
                            <button 
                                className="profile-options-btn"
                                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                            >
                                ⋮
                            </button>
                            {showOptionsMenu && (
                                <div className="profile-options-menu">
                                    {isBlocked ? (
                                        <button onClick={handleUnblockUser} className="profile-options-item unblock">
                                            <span>🔓</span>
                                            <span>{lang === 'ar' ? 'إلغاء الحظر' : 'Unblock'}</span>
                                        </button>
                                    ) : (
                                        <button onClick={() => { setShowBlockConfirm(true); setShowOptionsMenu(false); }} className="profile-options-item block">
                                            <span>🚫</span>
                                            <span>{lang === 'ar' ? 'حظر' : 'Block'}</span>
                                        </button>
                                    )}
                                    <button onClick={() => { setShowReportModal(true); setShowOptionsMenu(false); }} className="profile-options-item report" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',width:'100%',textAlign:'center'}}>
                                        <span>🚨</span>
                                        <span>{lang === 'ar' ? 'إبلاغ' : 'Report'}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* X button - ALWAYS on the far right */}
                    <button 
                        onClick={onClose}
                        className="profile-close-btn"
                    >
                        ✕
                    </button>
                </div>

                {/* Banner upload handler */}
                <input
                    type="file"
                    ref={bannerFileRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !isOwnProfile) return;
                        setBannerUploading(true);
                        const reader = new FileReader();
                        reader.onload = async (ev) => {
                            const img = new Image();
                            img.onload = async () => {
                                const canvas = document.createElement('canvas');
                                const W = 800, H = 200;
                                canvas.width = W; canvas.height = H;
                                const ctx = canvas.getContext('2d');
                                const scale = Math.max(W / img.width, H / img.height);
                                const sw = img.width * scale, sh = img.height * scale;
                                ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh);
                                const base64 = canvas.toDataURL('image/jpeg', 0.55);
                                try {
                                    await usersCollection.doc(targetUID).update({ bannerURL: base64 });
                                    setBannerURL(base64);
                                } catch(err) { console.error('Banner upload error:', err); }
                                setBannerUploading(false);
                            };
                            img.src = ev.target.result;
                        };
                        reader.readAsDataURL(file);
                    }}
                />
                {/* Cover with Banner + Avatar */}
                <div
                    className="profile-cover"
                    style={bannerURL ? {
                        backgroundImage: `url(${bannerURL})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    } : {}}
                >
                    {/* Camera icon to change banner - only own profile */}
                    {isOwnProfile && (
                        <button
                            className="profile-banner-camera"
                            onClick={() => bannerFileRef.current?.click()}
                            title={lang === 'ar' ? 'تغيير البنر' : 'Change banner'}
                            disabled={bannerUploading}
                        >
                            {bannerUploading ? '⏳' : '📷'}
                        </button>
                    )}
                    <div className="profile-avatar-wrapper">
                        <AvatarWithFrameV11
                            photoURL={targetData?.photoURL}
                            equipped={targetData?.equipped}
                            size="lg"
                            isOnline={targetData?.isOnline}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="profile-loading">
                        <div className="profile-loading-spinner"></div>
                        <div className="profile-loading-text">{t.loading || 'Loading...'}</div>
                    </div>
                ) : !targetData ? (
                    <div className="profile-loading">
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                        <div className="profile-loading-text">{t.friendNotFound || 'User not found'}</div>
                    </div>
                ) : (
                    <>
                        <div className="profile-identity">
                            <div className="profile-name-row">
                                <UserTitleV11 equipped={targetData?.equipped} lang={lang} />
                                <div style={{display:'flex', alignItems:'center', gap:'5px', justifyContent:'center'}}>
                                    <h1 className="profile-name">{targetData?.displayName || 'Unknown'}</h1>
                                    {targetData?.gender === 'male' && (
                                        <span style={{fontSize:'13px', color:'#60a5fa', fontWeight:700, lineHeight:1}}>♂️</span>
                                    )}
                                    {targetData?.gender === 'female' && (
                                        <span style={{fontSize:'13px', color:'#f472b6', fontWeight:700, lineHeight:1}}>♀️</span>
                                    )}
                                </div>
                            </div>
                            
                            <UserBadgesV11 equipped={targetData?.equipped} lang={lang} />
                            
                            <span 
                                className="profile-id-display"
                                onClick={() => {
                                    navigator.clipboard.writeText(targetData?.customId || targetData?.uid?.substring(0, 8));
                                    setCopiedId(true);
                                    setTimeout(() => setCopiedId(false), 2000);
                                }}
                            >
                                {copiedId 
                                    ? (lang === 'ar' ? '✓ تم النسخ!' : '✓ Copied!') 
                                    : `ID: ${targetData?.customId || targetData?.uid?.substring(0, 8)} 📋`
                                }
                            </span>
                            
                            {/* Charisma Display */}
                            {/* Moments Section - above Charisma */}
                            <MomentsSection
                                ownerUID={targetUID}
                                ownerName={targetData?.displayName || ''}
                                currentUser={userData}
                                isOwnProfile={isOwnProfile}
                                lang={lang}
                            />
                            <CharismaDisplay charisma={targetData?.charisma} lang={lang} />
                        </div>

                        {/* ── STATS ROW ── */}
                        <div style={{
                            display:'flex', alignItems:'center', justifyContent:'space-evenly',
                            width:'100%', padding:'10px 8px', boxSizing:'border-box',
                            background:'rgba(0,0,0,0.15)', borderTop:'1px solid rgba(255,255,255,0.05)',
                            borderBottom:'1px solid rgba(255,255,255,0.05)', margin:'8px 0'
                        }}>
                            {/* Wins */}
                            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flex:'1',minWidth:0}}>
                                <span style={{fontSize:'18px',fontWeight:900,color:'#4ade80',lineHeight:1}}>{wins}</span>
                                <span style={{fontSize:'8px',color:'#6b7280',fontWeight:600,textAlign:'center'}}>🏆 {lang==='ar'?'فوز':'Wins'}</span>
                            </div>
                            {/* Divider */}
                            <div style={{width:'1px',height:'32px',background:'rgba(255,255,255,0.08)',flexShrink:0}}/>
                            {/* Losses */}
                            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flex:'1',minWidth:0}}>
                                <span style={{fontSize:'18px',fontWeight:900,color:'#f87171',lineHeight:1}}>{losses}</span>
                                <span style={{fontSize:'8px',color:'#6b7280',fontWeight:600,textAlign:'center'}}>💀 {lang==='ar'?'خسارة':'Losses'}</span>
                            </div>
                            {/* Divider */}
                            <div style={{width:'1px',height:'32px',background:'rgba(255,255,255,0.08)',flexShrink:0}}/>
                            {/* Win Rate */}
                            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flex:'1.2',minWidth:0}}>
                                <WinRateCircleV11 wins={wins} losses={losses} lang={lang} />
                            </div>
                            {/* Divider */}
                            <div style={{width:'1px',height:'32px',background:'rgba(255,255,255,0.08)',flexShrink:0}}/>
                            {/* Rank */}
                            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flex:'1',minWidth:0}}>
                                <span style={{fontSize:'18px',fontWeight:900,color:'#fbbf24',lineHeight:1}}>#{charismaRank||'--'}</span>
                                <span style={{fontSize:'8px',color:'#6b7280',fontWeight:600,textAlign:'center'}}>🎖️ {lang==='ar'?'رتبة':'Rank'}</span>
                            </div>
                            {/* Divider */}
                            <div style={{width:'1px',height:'32px',background:'rgba(255,255,255,0.08)',flexShrink:0}}/>
                            {/* Level */}
                            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flex:'1',minWidth:0}}>
                                <span style={{fontSize:'18px',fontWeight:900,color:'#a78bfa',lineHeight:1}}>{level}</span>
                                <span style={{fontSize:'8px',color:'#6b7280',fontWeight:600,textAlign:'center'}}>⚡ {lang==='ar'?'مستوى':'Level'}</span>
                            </div>
                        </div>

                        <GiftWallV11 gifts={gifts} lang={lang} isOwnProfile={isOwnProfile} userData={userData} onSendGiftToSelf={(gift) => { setSelfGift(gift); setShowSelfGiftModal(true); }} />

                        <AchievementsDisplayV11 userData={targetData} lang={lang} />

                        {isBlocked && !isOwnProfile && (
                            <div className="profile-blocked-notice">
                                <span>🚫</span>
                                <span>{lang === 'ar' ? 'لقد حظرت هذا المستخدم' : 'You have blocked this user'}</span>
                            </div>
                        )}

                        {blockedByTarget && !isOwnProfile && (
                            <div className="profile-blocked-notice blocked-by-other">
                                <span>🚫</span>
                                <span>{lang === 'ar' ? 'هذا المستخدم قد حظرك' : 'This user has blocked you'}</span>
                            </div>
                        )}

                        {isTargetGuest && !isOwnProfile && (
                            <div className="profile-guest-notice">
                                {lang === 'ar' ? 'هذا حساب ضيف. بعض الميزات غير متاحة.' : 'This is a guest account. Some features are unavailable.'}
                            </div>
                        )}

                        {!isOwnProfile && !isTargetGuest && !isBlocked && !blockedByTarget && (
                            <div className="profile-actions">
                                {isAlreadyFriend ? (
                                    /* Already friends → show Chat button */
                                    <button
                                        onClick={() => {
                                            if (onOpenChat) {
                                                onOpenChat({ uid: targetUID, displayName: targetData?.displayName, photoURL: targetData?.photoURL, equipped: targetData?.equipped, id: targetUID });
                                            }
                                        }}
                                        className="profile-action-btn primary"
                                        style={{background:'linear-gradient(135deg,rgba(0,242,255,0.25),rgba(112,0,255,0.2))', borderColor:'rgba(0,242,255,0.4)'}}
                                    >
                                        <span>💬</span>
                                        <span>{lang === 'ar' ? 'محادثة' : 'Chat'}</span>
                                    </button>
                                ) : hasPendingRequest ? (
                                    <button disabled className="profile-action-btn secondary">
                                        <span>⏳</span>
                                        <span>{lang === 'ar' ? 'تم الإرسال' : 'Sent'}</span>
                                    </button>
                                ) : (
                                    <button onClick={handleAddFriend} className="profile-action-btn primary">
                                        <span>👤</span>
                                        <span>{lang === 'ar' ? 'أضف صديق' : 'Add Friend'}</span>
                                    </button>
                                )}
                                <button onClick={() => setShowGiftModal(true)} className="profile-action-btn secondary">
                                    <span>🎁</span>
                                    <span>{lang === 'ar' ? 'أرسل هدية' : 'Send Gift'}</span>
                                </button>
                            </div>
                        )}

                        {/* Own profile action buttons */}
                        {isOwnProfile && (
                            <div style={{padding:'0 12px 12px', display:'flex', gap:'8px'}}>
                                {/* Personal Notes Chat */}
                                <button
                                    onClick={() => onOpenChat && onOpenChat('self')}
                                    style={{
                                        flex:1, padding:'11px', borderRadius:'12px',
                                        background:'linear-gradient(135deg,rgba(0,242,255,0.12),rgba(112,0,255,0.1))',
                                        border:'1px solid rgba(0,242,255,0.3)', color:'#00f2ff',
                                        fontSize:'12px', fontWeight:800, cursor:'pointer',
                                        display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                                        transition:'all 0.2s'
                                    }}
                                >
                                    <span style={{fontSize:'16px'}}>📝</span>
                                    <span>{lang === 'ar' ? 'ملاحظاتي' : 'My Notes'}</span>
                                </button>
                                {/* Self Gift */}
                                <button
                                    onClick={() => setShowSelfGiftModal(true)}
                                    style={{
                                        flex:1, padding:'11px', borderRadius:'12px',
                                        background:'linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,136,0,0.15))',
                                        border:'1px solid rgba(255,215,0,0.4)', color:'#facc15',
                                        fontSize:'12px', fontWeight:800, cursor:'pointer',
                                        display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                                        transition:'all 0.2s'
                                    }}
                                >
                                    <span style={{fontSize:'16px'}}>🎁</span>
                                    <span>{lang === 'ar' ? 'هدية لنفسي' : 'Gift Myself'}</span>
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Report Modal */}
                {showReportModal && (
                    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:99999,padding:'16px'}} onClick={() => setShowReportModal(false)}>
                        <div className="profile-confirm-modal" onClick={e => e.stopPropagation()} style={{maxWidth:'300px'}}>
                            <div className="profile-confirm-icon">🚨</div>
                            <div className="profile-confirm-title">{lang === 'ar' ? 'إبلاغ عن مستخدم' : 'Report User'}</div>
                            <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'10px', textAlign:'center'}}>
                                {lang === 'ar' ? 'اختر سبب الإبلاغ:' : 'Select a reason:'}
                            </div>
                            <div style={{display:'flex', flexDirection:'column', gap:'6px', marginBottom:'14px'}}>
                                {[
                                    {key:'abusive',       icon:'🤬', ar:'سلوك مسيء',       en:'Abusive Behavior'},
                                    {key:'verbal_abuse',  icon:'💬', ar:'شتيمة لفظية',      en:'Verbal Abuse'},
                                    {key:'cheating',      icon:'🎮', ar:'غش في اللعبة',     en:'Cheating'},
                                    {key:'fraud',         icon:'💰', ar:'احتيال',            en:'Fraud'},
                                    {key:'avatar',        icon:'🖼️', ar:'صورة أفاتار مسيئة', en:'Inappropriate Avatar'},
                                    {key:'spam',          icon:'📢', ar:'سبام',              en:'Spam'},
                                    {key:'other',         icon:'❓', ar:'سبب آخر',           en:'Other'}
                                ].map(r => (
                                    <button
                                        key={r.key}
                                        onClick={() => setReportReason(r.key)}
                                        style={{
                                            padding:'8px 12px', borderRadius:'8px', fontSize:'12px',
                                            textAlign:'start', cursor:'pointer', fontWeight:600,
                                            display:'flex', alignItems:'center', gap:'8px',
                                            background: reportReason === r.key ? 'rgba(112,0,255,0.3)' : 'rgba(255,255,255,0.05)',
                                            border: reportReason === r.key ? '1.5px solid #7000ff' : '1px solid rgba(255,255,255,0.1)',
                                            color: reportReason === r.key ? 'white' : '#9ca3af'
                                        }}
                                    >
                                        <span>{r.icon}</span>
                                        <span>{lang === 'ar' ? r.ar : r.en}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="profile-confirm-actions">
                                <button onClick={() => { setShowReportModal(false); setReportReason(''); }} className="cancel">
                                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button onClick={handleSendReport} disabled={!reportReason || reportSending} className="confirm"
                                    style={{opacity: (!reportReason || reportSending) ? 0.5 : 1, background:'#ef4444'}}>
                                    {reportSending ? '...' : (lang === 'ar' ? 'إرسال' : 'Submit')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showBlockConfirm && (
                    <div className="profile-confirm-overlay" onClick={() => setShowBlockConfirm(false)}>
                        <div className="profile-confirm-modal" onClick={e => e.stopPropagation()}>
                            <div className="profile-confirm-icon">🚫</div>
                            <div className="profile-confirm-title">
                                {lang === 'ar' ? 'حظر المستخدم' : 'Block User'}
                            </div>
                            <div className="profile-confirm-message">
                                {lang === 'ar' 
                                    ? `هل أنت متأكد من حظر ${targetData?.displayName || 'هذا المستخدم'}؟`
                                    : `Are you sure you want to block ${targetData?.displayName || 'this user'}?`}
                            </div>
                            <div className="profile-confirm-actions">
                                <button onClick={() => setShowBlockConfirm(false)} className="cancel">
                                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button onClick={handleBlockUser} className="confirm">
                                    {lang === 'ar' ? 'حظر' : 'Block'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showGiftModal && targetData && (
                <SendGiftModal 
                    show={showGiftModal}
                    onClose={() => setShowGiftModal(false)}
                    targetUser={targetData}
                    currentUser={userData}
                    lang={lang}
                    onSendGift={onSendGift}
                    currency={userData?.currency || 0}
                    friendsData={friendsData}
                />
            )}

            {showSelfGiftModal && userData && (
                <SendGiftModal
                    show={showSelfGiftModal}
                    onClose={() => setShowSelfGiftModal(false)}
                    targetUser={{ uid: userData?.uid, displayName: userData?.displayName || (lang==='ar'?'أنت':'You'), photoURL: userData?.photoURL }}
                    currentUser={userData}
                    lang={lang}
                    onSendGift={async (gift, targetUser) => {
                        if (onSendGift) await onSendGift(gift, targetUser);
                        setShowSelfGiftModal(false);
                    }}
                    currency={userData?.currency || 0}
                    friendsData={[]}
                />
            )}
        </div>
    );
};

// Make ProfileV11 available globally
window.ProfileV11 = ProfileV11;

// Wrap with ErrorBoundary
const AppWithErrorBoundary = () => (<ErrorBoundary><App /></ErrorBoundary>);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppWithErrorBoundary />);
