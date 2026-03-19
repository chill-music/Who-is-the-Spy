// ==========================================

const { useState, useEffect, useRef, useCallback, useMemo } = React;
// 🎯 Z-INDEX CONSTANTS - Layer Management
const Z = {
    MODAL:      10000,  // Standard modals
    MODAL_HIGH: 12000,  // FunPass, BrowseRooms
    MODAL_TOP:  15000,  // SelfChat, Notifications
    FORCED:     25000,  // Forced logout warning
    OVERLAY:    99999,  // Full overlays
    TOOLTIP:    999999, // Tooltips & dropdowns
};

// 🎨 GRADIENT CONSTANTS - Reusable styles
const GR = {
    DARK_CARD:  'linear-gradient(135deg, rgba(15,15,35,0.95), rgba(25,25,50,0.95))',
    NEON:       'linear-gradient(135deg, rgba(0,242,255,0.15), rgba(112,0,255,0.15))',
    GOLD:       'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,140,0,0.15))',
    GOLD_SOFT:  'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,140,0,0.08))',
    CYAN_SOFT:  'linear-gradient(135deg, rgba(0,242,255,0.08), rgba(112,0,255,0.08))',
};

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

// COLLECTIONS
const usersCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('users');
const guestsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('guests');
const reportsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('reports');
const chatsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('private_chats');
const roomsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('rooms');
const historyCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('game_history');
const notificationsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('notifications');
const giftsLogCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('gifts_log');
const guardLogCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('guard_log');
const momentsCollection         = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('moments');
const vip10RequestsCollection   = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('vip10_requests');
const vip10IdRequestsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('vip10_id_requests');
const bffCollection             = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('bff_relationships');
const botChatsCollection        = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('bot_chats');
const redPacketsCollection      = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('red_packets');
const publicChatCollection      = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('public_chat');
const helpFaqCollection         = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('help_faq');
const feedbackCollection        = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('feedback');
// ── Collections added from scattered files (centralized here) ──
const familiesCollection        = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('families');
const couplesCollection         = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('couples');
const groupsCollection          = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('group_chats');
const staffLogCollection        = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('staff_activity_log');
const ticketsCollection         = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('support_tickets');

// ════════════════════════════════════════════════════════
// 🧧 RED PACKETS SYSTEM CONFIG
// ════════════════════════════════════════════════════════
const RED_PACKETS_CONFIG = [
    {
        id: 'rp_600',
        amount: 600,
        emoji: '🧧',
        name_ar: 'مغلف 600',
        name_en: 'Red Packet 600',
        color: '#ef4444',
        glow: 'rgba(239,68,68,0.6)',
        bg: 'linear-gradient(135deg,rgba(239,68,68,0.18),rgba(185,28,28,0.12))',
        border: 'rgba(239,68,68,0.4)',
        imageURL: null, // ← ضع رابط صورة المغلف هنا
        maxClaims: 5,   // عدد الأشخاص اللي يقدروا يستلموا منه
        desc_ar: 'مغلف أحمر صغير — يوزع على 5 أشخاص',
        desc_en: 'Small red packet — shared among 5 people',
    },
    {
        id: 'rp_1800',
        amount: 1800,
        emoji: '🧧',
        name_ar: 'مغلف 1800',
        name_en: 'Red Packet 1800',
        color: '#f97316',
        glow: 'rgba(249,115,22,0.6)',
        bg: 'linear-gradient(135deg,rgba(249,115,22,0.18),rgba(194,65,12,0.12))',
        border: 'rgba(249,115,22,0.4)',
        imageURL: null,
        maxClaims: 8,
        desc_ar: 'مغلف أحمر متوسط — يوزع على 8 أشخاص',
        desc_en: 'Medium red packet — shared among 8 people',
    },
    {
        id: 'rp_3000',
        amount: 3000,
        emoji: '🧧',
        name_ar: 'مغلف 3000',
        name_en: 'Red Packet 3000',
        color: '#fbbf24',
        glow: 'rgba(251,191,36,0.6)',
        bg: 'linear-gradient(135deg,rgba(251,191,36,0.18),rgba(180,83,9,0.12))',
        border: 'rgba(251,191,36,0.4)',
        imageURL: null,
        maxClaims: 10,
        desc_ar: 'مغلف ذهبي — يوزع على 10 أشخاص',
        desc_en: 'Golden packet — shared among 10 people',
    },
    {
        id: 'rp_10000',
        amount: 10000,
        emoji: '🧧',
        name_ar: 'مغلف 10000',
        name_en: 'Red Packet 10K',
        color: '#a78bfa',
        glow: 'rgba(167,139,250,0.7)',
        bg: 'linear-gradient(135deg,rgba(167,139,250,0.18),rgba(109,40,217,0.12))',
        border: 'rgba(167,139,250,0.4)',
        imageURL: null,
        maxClaims: 15,
        desc_ar: 'مغلف ملكي — يوزع على 15 شخص',
        desc_en: 'Royal packet — shared among 15 people',
    },
    {
        id: 'rp_50000',
        amount: 50000,
        emoji: '🧧',
        name_ar: 'مغلف 50000',
        name_en: 'Red Packet 50K',
        color: '#00f2ff',
        glow: 'rgba(0,242,255,0.8)',
        bg: 'linear-gradient(135deg,rgba(0,242,255,0.18),rgba(112,0,255,0.12))',
        border: 'rgba(0,242,255,0.4)',
        imageURL: null,
        maxClaims: 20,
        desc_ar: 'مغلف أسطوري — يوزع على 20 شخص',
        desc_en: 'Legendary packet — shared among 20 people',
    },
];

// ════════════════════════════════════════════════════════
// 🤝 BFF SYSTEM CONFIG
// ════════════════════════════════════════════════════════
const BFF_CONFIG = {
    freeSlots: 3,           // عدد العلاقات المجانية
    extraSlotCost: 1000,    // تكلفة فتح خانة إضافية بالعملة
    // صور الكارت الخلفي لكل نوع علاقة — ضع روابط صور هنا
    cardImages: {
        paper_plane: null,  // ← ضع رابط صورة الكارت للطيارة الورقية
        airplane:    null,  // ← ضع رابط صورة الكارت للطيارة
        house:       null,  // ← ضع رابط صورة الكارت للبيت
        car:         null,  // ← ضع رابط صورة الكارت للعربية
        yacht:       null,  // ← ضع رابط صورة الكارت لليخت
        castle:      null,  // ← ضع رابط صورة الكارت للقلعة
        default:     null,  // ← الصورة الافتراضية للكارت لو ما في نوع محدد
    },
};

// BFF Token items — تُضاف للشوب وتُستخدم لإنشاء علاقة
const BFF_TOKEN_ITEMS = [
    { id:'bff_paper_plane', emoji:'✈️', name_en:'Paper Plane Relationship', name_ar:'علاقة طيارة ورق',   cost:500,  rarity:'Common',    cardType:'paper_plane', imageURL: null, color:'#60a5fa', glow:'rgba(96,165,250,0.5)',  desc_en:'A simple, sweet bond.',        desc_ar:'رابطة بسيطة وحلوة.' },
    { id:'bff_airplane',    emoji:'🛫', name_en:'Airplane Relationship',    name_ar:'علاقة طيارة',       cost:1000, rarity:'Uncommon',  cardType:'airplane',    imageURL: null, color:'#4ade80', glow:'rgba(74,222,128,0.5)',  desc_en:'Soaring friendship.',          desc_ar:'صداقة تحلق في السماء.' },
    { id:'bff_house',       emoji:'🏠', name_en:'House Relationship',       name_ar:'علاقة بيت',         cost:1500, rarity:'Rare',      cardType:'house',       imageURL: null, color:'#f59e0b', glow:'rgba(245,158,11,0.5)',  desc_en:'A warm, homey bond.',          desc_ar:'رابطة دافئة كالبيت.' },
    { id:'bff_car',         emoji:'🚗', name_en:'Car Relationship',         name_ar:'علاقة عربية',       cost:2500, rarity:'Epic',      cardType:'car',         imageURL: null, color:'#a78bfa', glow:'rgba(167,139,250,0.5)', desc_en:'Fast and exciting.',           desc_ar:'سريعة ومثيرة.' },
    { id:'bff_yacht',       emoji:'🛥️', name_en:'Royal Yacht Relationship', name_ar:'علاقة يخت ملكي',   cost:5000, rarity:'Legendary', cardType:'yacht',       imageURL: null, color:'#ffd700', glow:'rgba(255,215,0,0.6)',   desc_en:'Luxury friendship at sea.',    desc_ar:'صداقة فاخرة على البحر.' },
    { id:'bff_castle',      emoji:'🏰', name_en:'Friends Castle',           name_ar:'قلعة الأصدقاء',     cost:8000, rarity:'Mythic',    cardType:'castle',      imageURL: null, color:'#f0abfc', glow:'rgba(240,171,252,0.7)', desc_en:'An unbreakable legendary bond.', desc_ar:'رابطة أسطورية لا تنكسر.' },
];

// ════════════════════════════════════════════════════════
// 🤖 OFFICIAL BOT CHATS CONFIG
// ════════════════════════════════════════════════════════
const BOT_CHATS_CONFIG = [
    {
        id: 'detective_bot',
        name_ar: 'المحقق',
        name_en: 'The Detective',
        emoji: '🕵️',
        description_ar: 'نظام البلاغات الرسمي — البلاغات والردود',
        description_en: 'Official report system — reports & responses',
        color: '#00d4ff',
        glow: 'rgba(0,212,255,0.4)',
        photoURL: null, // ← ضع رابط صورة المحقق هنا (الأونر فقط يغيرها)
        official: true,
        readOnly: true, // لا يمكن للمستخدمين الكتابة
    },
    {
        id: 'love_bot',
        name_ar: 'بوت دواء',
        name_en: 'Dawa Bot',
        emoji: '💌',
        description_ar: 'إشعارات الزواج وعلاقات BFF الرسمية',
        description_en: 'Official wedding & BFF notifications',
        color: '#f9a8d4',
        glow: 'rgba(249,168,212,0.4)',
        photoURL: null, // ← ضع رابط صورة البوت هنا (الأونر فقط يغيرها)
        official: true,
        readOnly: true,
    },
];

// --- Constants ---
const MAX_BADGES = 10;

// ════════════════════════════════════════════════════════
// 🔒 ADMIN SYSTEM — ضع Firebase UID بتاعك هنا
// ════════════════════════════════════════════════════════
const ADMIN_UIDS = [
    'PfZAViU4swQdbBZOfqJDnPZSs9l2', // ← ضع الـ UID بتاعك هنا (Owner)
];
// Owner = أول UID في القائمة — صلاحيات كاملة لا تُنتزع
const OWNER_UID = ADMIN_UIDS[0];
const isAdmin = (uid) => uid && ADMIN_UIDS.includes(uid);

// ════════════════════════════════════════════════════════
// 👑 STAFF ROLE SYSTEM
// ════════════════════════════════════════════════════════
// الهيكل في Firestore: user.staffRole = { role: 'admin'|'moderator', assignedBy, assignedAt }
//
// التسلسل الهرمي:
//   owner      → يعيّن admin أو moderator
//   admin      → يعيّن moderator فقط
//   moderator  → لا يعيّن أحد
//
// Owner محدد بـ OWNER_UID (hardcoded) — لا يمكن إزالته

const ROLE_CONFIG = {
    owner: {
        label_ar: 'المالك',
        label_en: 'Owner',
        icon: '👑',
        color: '#ffd700',
        glow: 'rgba(255,215,0,0.8)',
        bg: 'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,140,0,0.12))',
        border: 'rgba(255,215,0,0.55)',
        badgeClass: 'role-badge-owner',
    },
    admin: {
        label_ar: 'أدمن',
        label_en: 'Admin',
        icon: '🛡️',
        color: '#ef4444',
        glow: 'rgba(239,68,68,0.7)',
        bg: 'linear-gradient(135deg,rgba(239,68,68,0.18),rgba(185,28,28,0.12))',
        border: 'rgba(239,68,68,0.5)',
        badgeClass: 'role-badge-admin',
    },
    moderator: {
        label_ar: 'مشرف',
        label_en: 'Mod',
        icon: '🔰',
        color: '#3b82f6',
        glow: 'rgba(59,130,246,0.6)',
        bg: 'linear-gradient(135deg,rgba(59,130,246,0.18),rgba(29,78,216,0.12))',
        border: 'rgba(59,130,246,0.5)',
        badgeClass: 'role-badge-mod',
    },
};

// يرجع 'owner' | 'admin' | 'moderator' | null
const getUserRole = (userData, uid) => {
    if (!uid && !userData) return null;
    const checkUid = uid || userData?.uid || userData?.id;
    if (checkUid && checkUid === OWNER_UID) return 'owner';
    const role = userData?.staffRole?.role;
    if (role === 'admin' || role === 'moderator') return role;
    return null;
};

// هل يقدر يدير الرتب؟ (owner أو admin)
const canManageRoles = (viewerData, viewerUID) => {
    const role = getUserRole(viewerData, viewerUID);
    return role === 'owner' || role === 'admin';
};

// أقصى رتبة يقدر الـ viewer يعيّنها
const getAssignableRoles = (viewerData, viewerUID) => {
    const role = getUserRole(viewerData, viewerUID);
    if (role === 'owner') return ['admin', 'moderator'];
    if (role === 'admin') return ['moderator'];
    return [];
};

// ════════════════════════════════════════════════════════
// 🚫 BAN SYSTEM HELPERS
// ════════════════════════════════════════════════════════
const isBannedUser = (userData) => {
    const ban = userData?.ban;
    if (!ban?.isBanned) return false;
    if (!ban.expiresAt) return true; // permanent
    const expiry = ban.expiresAt?.toDate?.() || new Date(ban.expiresAt);
    return new Date() < expiry;
};

const getBanExpiry = (userData) => {
    const ban = userData?.ban;
    if (!ban?.expiresAt) return null;
    return ban.expiresAt?.toDate?.() || new Date(ban.expiresAt);
};

const formatBanExpiry = (userData, lang) => {
    const expiry = getBanExpiry(userData);
    if (!expiry) return lang === 'ar' ? 'حظر دائم' : 'Permanent';
    return expiry.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

// ════════════════════════════════════════════════════════
// 🏅 FAMILY ECONOMY CONFIG — Centralized Constants
// ════════════════════════════════════════════════════════
const FAMILY_COINS_SYMBOL = '🏅'; // Family Coins currency icon

// ════════════════════════════════════════════════════════
// 🏴 FAMILY SIGN IMAGES CONFIG — ضع رابط صورة كل ساين هنا
// ════════════════════════════════════════════════════════
// threshold = الحد الأدنى من النشاط الأسبوعي للحصول على هذا الساين
const FAMILY_SIGN_IMAGES = [
    { level: 1, threshold: 1000,   imageURL: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Family%20Sign1.png' }, // ← ضع رابط صورة المستوى 1 هنا
    { level: 2, threshold: 10000,  imageURL: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Family%20Sign2.png' }, // ← ضع رابط صورة المستوى 2 هنا
    { level: 3, threshold: 30000,  imageURL: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Family%20Sign3.png' }, // ← ضع رابط صورة المستوى 3 هنا
    { level: 4, threshold: 100000, imageURL: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Family%20Sign4.png' }, // ← ضع رابط صورة المستوى 4 هنا
    { level: 5, threshold: 300000, imageURL: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Family%20Sign5.png' }, // ← ضع رابط صورة المستوى 5 هنا
];

// ════════════════════════════════════════════════════════
// 📦 FAMILY CHEST REWARDS CONFIG
// ════════════════════════════════════════════════════════
const CHEST_CONFIG = {
    normal: {
        name_en:'Normal Chest', name_ar:'صندوق عادي', icon:'📦', color:'#4ade80',
        rewards: [
            { type:'currency',  amount:1000, icon:'🧠', label_en:'1000 Intel',        label_ar:'1000 إنتل' },
            { type:'coins',     amount:1000, icon:'🏅', label_en:'1000 Family Coins', label_ar:'1000 عملة قبيلة' },
            { type:'gift',      giftId:'gift_cake',   qty:1, icon:'🎂', label_en:'Gift (Cake)', label_ar:'كيكة' },
            { type:'gift',      giftId:'gift_rose',   qty:9, icon:'🌹', label_en:'9× Rose',label_ar:'9× وردة' },
        ],
    },
    advanced: {
        name_en:'Advanced Chest', name_ar:'صندوق متقدم', icon:'🎁', color:'#60a5fa',
        rewards: [
            { type:'frame', frameId:'frame_neon',     duration:3,  icon:'🖼️', label_en:'Neon Frame 3d',  label_ar:'إطار نيون 3d' },
            { type:'frame', frameId:'frame_fire',     duration:7,  icon:'🖼️', label_en:'Fire Frame 7d',  label_ar:'إطار نار 7d' },
            { type:'gift',  giftId:'gift_racecar',    qty:2, icon:'🏎️', label_en:'2× Race Car', label_ar:'2× سيارة' },
            { type:'gift',  giftId:'gift_crown',      qty:2, icon:'👑', label_en:'2× Crown',  label_ar:'2× تاج' },
        ],
    },
    rare: {
        name_en:'Rare Chest', name_ar:'صندوق نادر', icon:'💠', color:'#a78bfa',
        rewards: [
            { type:'frame', frameId:'frame_gold',     duration:7,  icon:'🖼️', label_en:'Gold Frame 7d',  label_ar:'إطار ذهبي 7d' },
            { type:'frame', frameId:'frame_ice',      duration:3,  icon:'🖼️', label_en:'Ice Frame 3d',  label_ar:'إطار جليد 3d' },
            { type:'frame', frameId:'frame_rainbow',  duration:15, icon:'🖼️', label_en:'Rainbow Frame 15d', label_ar:'إطار قوس قزح 15d' },
            { type:'gift',  giftId:'gift_ring',       qty:1, icon:'💍', label_en:'Diamond Ring', label_ar:'خاتم ألماس' },
            { type:'gift',  giftId:'gift_coffee',     qty:2, icon:'☕', label_en:'2× Coffee',  label_ar:'2× قهوة' },
            { type:'gift',  giftId:'gift_racecar',    qty:2, icon:'🏎️', label_en:'2× Race Car', label_ar:'2× سيارة' },
            { type:'currency', amount:7800, icon:'🧠', label_en:'7800 Intel',        label_ar:'7800 إنتل' },
            { type:'coins',    amount:7800, icon:'🏅', label_en:'7800 Coins',        label_ar:'7800 عملة' },
        ],
    },
    epic: {
        name_en:'Epic Chest', name_ar:'صندوق ملحمي', icon:'💎', color:'#ffd700',
        rewards: [
            { type:'currency', amount:10000, icon:'🧠', label_en:'10K Intel',         label_ar:'10K إنتل' },
            { type:'coins',    amount:10000, icon:'🏅', label_en:'10K Coins',         label_ar:'10K عملة' },
            { type:'gift',  giftId:'gift_ring',       qty:2, icon:'💍', label_en:'2× Diamond Ring', label_ar:'2× خاتم ألماس' },
            { type:'gift',  giftId:'gift_ultimate',   qty:1, icon:'🏆', label_en:'Ultimate Gift', label_ar:'الهدية المطلقة' },
            { type:'frame', frameId:'fp_frame_neon',  duration:7,  qty:3, icon:'🖼️', label_en:'3× Neon Frame 7d', label_ar:'3× إطار نيون 7d' },
            { type:'frame', frameId:'fp_frame_gold',  duration:30, qty:1, icon:'🖼️', label_en:'Gold Frame 30d',   label_ar:'إطار ذهبي 30d' },
        ],
    },
    super: {
        name_en:'Super Chest', name_ar:'صندوق أسطوري', icon:'👑', color:'#f97316',
        rewards: [
            { type:'currency', amount:10000, icon:'🧠', label_en:'10K Intel',         label_ar:'10K إنتل' },
            { type:'coins',    amount:10000, icon:'🏅', label_en:'10K Coins',         label_ar:'10K عملة' },
            { type:'gift',  giftId:'gift_ring',       qty:2, icon:'💍', label_en:'2× Diamond Ring', label_ar:'2× خاتم ألماس' },
            { type:'frame', frameId:'fp_frame_mythic',duration:7,  qty:3, icon:'🖼️', label_en:'3× Mythic Frame 7d', label_ar:'3× إطار خرافي 7d' },
            { type:'frame', frameId:'fp_frame_gold',  duration:30, qty:1, icon:'🖼️', label_en:'Gold Frame 30d',   label_ar:'إطار ذهبي 30d' },
        ],
    },
};

// ════════════════════════════════════════════════════════
// 🎰 FAMILY GACHA CONFIG - LEVEL BASED
// ════════════════════════════════════════════════════════
const GACHA_CONFIG_BASIC = {
    paidCostPerSpin: 200, maxPaidSpinsDaily: 50,
    rewards: [
        // Level 1-4: Basic rewards (Family Gold, Coins, Normal Chests)
        { weight: 200, type: 'currency', amount: 50, rarity: 'common', icon: '🧠', label_en: '+50 Intel', label_ar: '+50 إنتل', rateDisplay: '20%' },
        { weight: 150, type: 'currency', amount: 200, rarity: 'uncommon', icon: '🧠', label_en: '+200 Intel', label_ar: '+200 إنتل', rateDisplay: '15%' },
        { weight: 200, type: 'coins', amount: 50, rarity: 'common', icon: '🏅', label_en: '+50 Coins', label_ar: '+50 عملة', rateDisplay: '20%' },
        { weight: 150, type: 'coins', amount: 150, rarity: 'uncommon', icon: '🏅', label_en: '+150 Coins', label_ar: '+150 عملة', rateDisplay: '15%' },
        { weight: 100, type: 'gift', giftId: 'gift_rose', qty: 5, rarity: 'common', icon: '🌹', label_en: '5x Rose', label_ar: '5x وردة', rateDisplay: '10%' },
        { weight: 100, type: 'gift', giftId: 'gift_coffee', qty: 1, rarity: 'uncommon', icon: '☕', label_en: 'Coffee', label_ar: 'قهوة', rateDisplay: '10%' },
        { weight: 80, type: 'gift', giftId: 'gift_cake', qty: 1, rarity: 'rare', icon: '🎂', label_en: 'Cake', label_ar: 'كيكة', rateDisplay: '8%' },
        { weight: 18, type: 'frame', frameId: 'frame_neon', duration: 1, rarity: 'rare', icon: '🖼️', label_en: 'Neon Frame 1d', label_ar: 'إطار نيون 1 يوم', rateDisplay: '1.8%' },
        // Strict 0.2% Normal Chest
        { weight: 2, type: 'chest', chestType: 'normal', rarity: 'legendary', icon: '📦', label_en: 'Normal Chest', label_ar: 'صندوق عادي', rateDisplay: '0.2%' }
    ] // sum weights = 1000
};

const GACHA_CONFIG_PREMIUM = {
    paidCostPerSpin: 200, maxPaidSpinsDaily: 50,
    rewards: [
        // Level 5+: Add Ring and Advanced/Rare chests
        { weight: 200, type: 'currency', amount: 150, rarity: 'common', icon: '🧠', label_en: '+150 Intel', label_ar: '+150 إنتل', rateDisplay: '20%' },
        { weight: 100, type: 'currency', amount: 500, rarity: 'uncommon', icon: '🧠', label_en: '+500 Intel', label_ar: '+500 إنتل', rateDisplay: '10%' },
        { weight: 200, type: 'coins', amount: 150, rarity: 'common', icon: '🏅', label_en: '+150 Coins', label_ar: '+150 عملة', rateDisplay: '20%' },
        { weight: 100, type: 'coins', amount: 300, rarity: 'uncommon', icon: '🏅', label_en: '+300 Coins', label_ar: '+300 عملة', rateDisplay: '10%' },
        { weight: 150, type: 'gift', giftId: 'gift_cake', qty: 1, rarity: 'uncommon', icon: '🎂', label_en: 'Cake', label_ar: 'كيكة', rateDisplay: '15%' },
        { weight: 100, type: 'gift', giftId: 'gift_crown', qty: 1, rarity: 'rare', icon: '👑', label_en: 'Crown', label_ar: 'تاج', rateDisplay: '10%' },
        { weight: 90, type: 'gift', giftId: 'gift_racecar', qty: 1, rarity: 'epic', icon: '🏎️', label_en: 'Race Car', label_ar: 'سيارة', rateDisplay: '9%' },
        { weight: 50, type: 'frame', frameId: 'frame_gold', duration: 3, rarity: 'epic', icon: '🖼️', label_en: 'Gold Frame 3d', label_ar: 'إطار ذهبي 3 أيام', rateDisplay: '5%' },
        { weight: 4, type: 'chest', chestType: 'normal', rarity: 'rare', icon: '📦', label_en: 'Normal Chest', label_ar: 'صندوق عادي', rateDisplay: '0.4%' },
        // Strict 0.2% Advanced Chest
        { weight: 2, type: 'chest', chestType: 'advanced', rarity: 'legendary', icon: '🎁', label_en: 'Advanced Chest', label_ar: 'صندوق متقدم', rateDisplay: '0.2%' },
        // Strict 0.2% Rare Chest
        { weight: 2, type: 'chest', chestType: 'rare', rarity: 'legendary', icon: '💠', label_en: 'Rare Chest', label_ar: 'صندوق نادر', rateDisplay: '0.2%' },
        // Strict 0.2% Ring (04-data-game.js gift_ring)
        { weight: 2, type: 'gift', giftId: 'gift_ring', qty: 1, rarity: 'mythic', icon: '💍', label_en: 'Diamond Ring', label_ar: 'خاتم ألماس', rateDisplay: '0.2%' }
    ] // sum weights = 1000
};

// ════════════════════════════════════════════════════════
// 🏅 DAILY TASKS CHEST MILESTONES
// ════════════════════════════════════════════════════════
const DAILY_TASKS_MILESTONES = [
    { points: 20,  rewards: [ {type:'currency', id:'currency', qty:5}, {type:'coins', id:'coins', qty:5}, {type:'gift', id:'gift_rose', qty:5} ] },
    { points: 60,  rewards: [ {type:'currency', id:'currency', qty:10},{type:'coins', id:'coins', qty:10},{type:'gift', id:'gift_rose', qty:10} ] },
    { points: 100, rewards: [ {type:'currency', id:'currency', qty:15},{type:'coins', id:'coins', qty:15},{type:'gift', id:'gift_rose', qty:15} ] }
];

const GACHA_RARITY_COLORS = {
    common: '#9ca3af', uncommon: '#4ade80', rare: '#60a5fa',
    epic: '#a78bfa', legendary: '#fbbf24',
};

// ════════════════════════════════════════════════════════
// 🏅 ACTIVENESS MILESTONES (Chests for leveling up)
// ════════════════════════════════════════════════════════
const ACTIVENESS_MILESTONES = [
    { threshold:8000,   chestType:'normal',   icon:'📦', imageURL: null, name_en:'Normal Chest',   name_ar:'صندوق عادي' },
    { threshold:24000,  chestType:'advanced', icon:'🎁', imageURL: null, name_en:'Advanced Chest', name_ar:'صندوق متقدم' },
    { threshold:60000,  chestType:'rare',     icon:'💠', imageURL: null, name_en:'Rare Chest',     name_ar:'صندوق نادر' },
    { threshold:120000, chestType:'epic',     icon:'💎', imageURL: null, name_en:'Epic Chest',     name_ar:'صندوق ملحمي' },
    { threshold:280000, chestType:'super',    icon:'👑', imageURL: null, name_en:'Super Chest',    name_ar:'صندوق أسطوري' },
];

// Family Shop Items — purchasable ONLY with Family Coins
const FAMILY_SHOP_ITEMS = [
    { id:'fs1', emoji:'🎖️', name_en:'Warrior Badge',   name_ar:'شارة المحارب',    cost:30,  type:'badge',  rarity:'rare',       durationDays:7, desc_en:'Exclusive family warrior badge', desc_ar:'شارة محارب حصرية للعائلة' },
    { id:'fs2', emoji:'🛡️', name_en:'Shield Badge',    name_ar:'شارة الدرع',      cost:50,  type:'badge',  rarity:'rare',       durationDays:7, desc_en:'Honor shield badge',             desc_ar:'شارة درع الشرف' },
    { id:'fs3', emoji:'👑', name_en:'Crown Badge',     name_ar:'شارة التاج',      cost:100, type:'badge',  rarity:'epic',       durationDays:7, desc_en:'Royal crown clan badge',         desc_ar:'شارة تاج ملكي' },
    { id:'fs4', emoji:'🔥', name_en:'Flame Badge',     name_ar:'شارة اللهب',      cost:40,  type:'badge',  rarity:'rare',       durationDays:7, desc_en:'Blazing fire badge',             desc_ar:'شارة اللهب المشتعل' },
    { id:'fs5', emoji:'⚡', name_en:'Thunder Badge',   name_ar:'شارة الرعد',      cost:40,  type:'badge',  rarity:'rare',       durationDays:7, desc_en:'Lightning thunder badge',        desc_ar:'شارة صاعقة الرعد' },
    { id:'fs6', emoji:'🌟', name_en:'Star Badge',      name_ar:'شارة النجمة',     cost:75,  type:'badge',  rarity:'epic',       durationDays:7, desc_en:'Shining star clan badge',        desc_ar:'شارة نجمة عائلة مضيئة' },
    { id:'fs7', emoji:'💎', name_en:'Diamond Badge',   name_ar:'شارة الألماس',    cost:150, type:'badge',  rarity:'legendary',  durationDays:7, desc_en:'Legendary diamond badge',        desc_ar:'شارة ألماس أسطورية' },
    { id:'fs8', emoji:'🏆', name_en:'Trophy Badge',    name_ar:'شارة الكأس',      cost:200, type:'badge',  rarity:'legendary',  durationDays:7, desc_en:'Champion trophy badge',          desc_ar:'شارة كأس البطولة' },
    { id:'fs9', emoji:'🐉', name_en:'Dragon Title',    name_ar:'لقب التنين',       cost:300, type:'title',  rarity:'legendary',  durationDays:7, desc_en:'Exclusive dragon clan title',    desc_ar:'لقب التنين الحصري للعائلة' },
    { id:'fs10', emoji:'🦁', name_en:'Lion Title',     name_ar:'لقب الأسد',        cost:250, type:'title',  rarity:'epic',       durationDays:7, desc_en:'Pride of the clan lion title',   desc_ar:'لقب أسد فخر العائلة' },
];

// ════════════════════════════════════════════════════════
// 🪪 ID ICON CONFIG — أيقونة قبل رقم الـ ID في البروفايل
// ════════════════════════════════════════════════════════
// الأيقونة الافتراضية لكل المستخدمين (ضع رابط صورة/GIF أو null لاستخدام 🪪)
const ID_ICON_IMAGE_URL = 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idon.png'; // ← ضع رابط الصورة العامة هنا (لكل المستخدمين)

// أيقونات مميزة حصرية لـ VIP 6 → 10
// هذه تُضاف أيضاً في VIP_CONFIG داخل 17-vip.js بنفس الحقل idIconImageUrl
// لكن يمكنك تعيينها هنا مركزياً للرجوع إليها بسهولة
const VIP_ID_ICONS = {
    6:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idvip.png', // ← VIP 6:  ضع رابط الأيقونة الذهبية هنا
    7:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idvip6.png', // ← VIP 7:  ضع رابط الأيقونة المميزة هنا
    8:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idvip7.png', // ← VIP 8:  ضع رابط الأيقونة المميزة هنا
    9:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idvip8.png', // ← VIP 9:  ضع رابط الأيقونة الأنيمشن هنا
    10: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idvip10.png', // ← VIP 10: ضع رابط الأيقونة الأسطورية هنا
};
// ════════════════════════════════════════════════════════
// 🔢 fmtNum — دالة موحدة لتنسيق الأرقام (K / M)
// الاستخدام: fmtNum(1500) → '1.5K' | fmtNum(2000000) → '2.0M'
// ════════════════════════════════════════════════════════
const fmtNum = (n) => {
    if (n === undefined || n === null) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
    return String(n);
};

// ════════════════════════════════════════════════════════
// 🏴 getFamilySignURL — دالة موحدة لجلب صورة ساين العائلة
// الاستخدام: getFamilySignURL(userData) → URL | null
// تحل محل 7 أماكن تكرار لنفس المنطق عبر الكود
// ════════════════════════════════════════════════════════
const getFamilySignURL = (data) => {
    if (!data) return null;
    if (data.familySignImageURL) return data.familySignImageURL;
    const level = data.familySignLevel;
    if (!level || typeof FAMILY_SIGN_IMAGES === 'undefined') return null;
    const cfg = FAMILY_SIGN_IMAGES.find(s => s.level === level);
    return cfg?.imageURL || null;
};

// ════════════════════════════════════════════════════════
// 👑 getVIPConfig — دالة موحدة لجلب إعدادات VIP
// بدلاً من: VIP_CONFIG[Math.min(vipLevel-1, VIP_CONFIG.length-1)]
// الاستخدام: const vipCfg = getVIPConfig(vipLevel)
// ════════════════════════════════════════════════════════
const getVIPConfig = (vipLevel) => {
    if (!vipLevel || vipLevel <= 0 || typeof VIP_CONFIG === 'undefined') return null;
    return VIP_CONFIG[Math.min(vipLevel - 1, VIP_CONFIG.length - 1)] || null;
};

// ════════════════════════════════════════════════════════
// ⏱️ TS — اختصار لـ firebase.firestore.FieldValue.serverTimestamp()
// الاستخدام: createdAt: TS()
// ════════════════════════════════════════════════════════
const TS = () => firebase.firestore.FieldValue.serverTimestamp();

// ════════════════════════════════════════════════════════
// 👤 fetchMiniProfileData — دالة موحدة لجلب بيانات الميني بروفايل
// تحل محل 4 نسخ متطابقة في: 09, 13, 14, 19
//
// الاستخدام:
//   const data = await fetchMiniProfileData(uid, myFriendsList);
//   if (data) setMiniProfile(data);
//
// myFriendsList — مصفوفة الـ UIDs اللي المستخدم أصدقاؤهم (اختياري)
// ════════════════════════════════════════════════════════
const fetchMiniProfileData = async (uid, myFriendsList = []) => {
    if (!uid) return null;
    try {
        const doc = await usersCollection.doc(uid).get();
        if (!doc.exists) return null;
        const d = doc.data();
        const stats   = d.stats || {};
        const wins    = stats.wins    || 0;
        const losses  = stats.losses  || 0;
        const total   = wins + losses;
        const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

        const unlockedBadgeIds = Array.isArray(d.achievements)
            ? d.achievements.map(a => typeof a === 'string' ? a : a?.id).filter(Boolean)
            : ((d.achievements?.badges) || []).map(b => b?.id || b).filter(Boolean);
        const topBadges = typeof ACHIEVEMENTS !== 'undefined'
            ? ACHIEVEMENTS.filter(a => unlockedBadgeIds.includes(a.id))
                .sort((a, b) => (b.tier || 0) - (a.tier || 0))
                .slice(0, 3)
            : [];

        const vipLevel = typeof getVIPLevel === 'function' ? (getVIPLevel(d) || 0) : 0;
        const vipCfg   = getVIPConfig(vipLevel);

        return {
            uid,
            name:               d.displayName            || 'User',
            photo:              d.photoURL                || null,
            customId:           d.customId               || null,
            bannerUrl:          d.profileBanner || d.bannerUrl || d.banner || d.profileBannerUrl || null,
            gender:             d.gender                 || null,
            charisma:           d.charisma               || 0,
            isFriend:           myFriendsList.includes(uid),
            familyTag:          d.familyTag              || null,
            familyName:         d.familyName             || null,
            familySignLevel:    d.familySignLevel        || null,
            familySignColor:    d.familySignColor        || null,
            familySignImageURL: getFamilySignURL(d),
            equippedFrame:      d.equipped?.frames       || null,
            coupleRingEmoji:    d.coupleRingEmoji         || null,
            coupleRingImageUrl: d.coupleRingImageUrl      || null,
            gamesPlayed:        total,
            winRate,
            topBadges,
            vipLevel,
            vipCfg,
            loading: false,
        };
    } catch(e) {
        return null;
    }
};

// 🔊 AUDIO SYSTEM`
