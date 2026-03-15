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

// --- Constants ---
const CURRENCY_NAME = "Intel";
const CURRENCY_ICON = "🧠";
const MAX_ROUNDS = 3;
const MAX_BADGES = 10;
const MAX_GIFT_LOG_DISPLAY = 10;

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

// Family Shop Items — purchasable ONLY with Family Coins
const FAMILY_SHOP_ITEMS = [
    { id:'fs1', emoji:'🎖️', name_en:'Warrior Badge',   name_ar:'شارة المحارب',    cost:30,  type:'badge',  rarity:'rare',       desc_en:'Exclusive family warrior badge', desc_ar:'شارة محارب حصرية للعائلة' },
    { id:'fs2', emoji:'🛡️', name_en:'Shield Badge',    name_ar:'شارة الدرع',      cost:50,  type:'badge',  rarity:'rare',       desc_en:'Honor shield badge',             desc_ar:'شارة درع الشرف' },
    { id:'fs3', emoji:'👑', name_en:'Crown Badge',     name_ar:'شارة التاج',      cost:100, type:'badge',  rarity:'epic',       desc_en:'Royal crown clan badge',         desc_ar:'شارة تاج ملكي' },
    { id:'fs4', emoji:'🔥', name_en:'Flame Badge',     name_ar:'شارة اللهب',      cost:40,  type:'badge',  rarity:'rare',       desc_en:'Blazing fire badge',             desc_ar:'شارة اللهب المشتعل' },
    { id:'fs5', emoji:'⚡', name_en:'Thunder Badge',   name_ar:'شارة الرعد',      cost:40,  type:'badge',  rarity:'rare',       desc_en:'Lightning thunder badge',        desc_ar:'شارة صاعقة الرعد' },
    { id:'fs6', emoji:'🌟', name_en:'Star Badge',      name_ar:'شارة النجمة',     cost:75,  type:'badge',  rarity:'epic',       desc_en:'Shining star clan badge',        desc_ar:'شارة نجمة عائلة مضيئة' },
    { id:'fs7', emoji:'💎', name_en:'Diamond Badge',   name_ar:'شارة الألماس',    cost:150, type:'badge',  rarity:'legendary',  desc_en:'Legendary diamond badge',        desc_ar:'شارة ألماس أسطورية' },
    { id:'fs8', emoji:'🏆', name_en:'Trophy Badge',    name_ar:'شارة الكأس',      cost:200, type:'badge',  rarity:'legendary',  desc_en:'Champion trophy badge',          desc_ar:'شارة كأس البطولة' },
    { id:'fs9', emoji:'🐉', name_en:'Dragon Title',    name_ar:'لقب التنين',       cost:300, type:'title',  rarity:'legendary',  desc_en:'Exclusive dragon clan title',    desc_ar:'لقب التنين الحصري للعائلة' },
    { id:'fs10', emoji:'🦁', name_en:'Lion Title',     name_ar:'لقب الأسد',        cost:250, type:'title',  rarity:'epic',       desc_en:'Pride of the clan lion title',   desc_ar:'لقب أسد فخر العائلة' },
];

// ════════════════════════════════════════════════════════
// 🪪 ID ICON CONFIG — أيقونة قبل رقم الـ ID في البروفايل
// ════════════════════════════════════════════════════════
// الأيقونة الافتراضية لكل المستخدمين (ضع رابط صورة/GIF أو null لاستخدام 🪪)
const ID_ICON_IMAGE_URL = null; // ← ضع رابط الصورة العامة هنا (لكل المستخدمين)

// أيقونات مميزة حصرية لـ VIP 6 → 10
// هذه تُضاف أيضاً في VIP_CONFIG داخل 17-vip.js بنفس الحقل idIconImageUrl
// لكن يمكنك تعيينها هنا مركزياً للرجوع إليها بسهولة
const VIP_ID_ICONS = {
    6:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/download.jpg', // ← VIP 6:  ضع رابط الأيقونة الذهبية هنا
    7:  null, // ← VIP 7:  ضع رابط الأيقونة المميزة هنا
    8:  null, // ← VIP 8:  ضع رابط الأيقونة المميزة هنا
    9:  null, // ← VIP 9:  ضع رابط الأيقونة الأنيمشن هنا
    10: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/download.jpg', // ← VIP 10: ضع رابط الأيقونة الأسطورية هنا
};
// دالة مساعدة للحصول على أيقونة الـ ID حسب مستوى VIP
const getIdIconForVIP = (vipLevel) => {
    if (!vipLevel || vipLevel < 6) return ID_ICON_IMAGE_URL;
    return VIP_ID_ICONS[vipLevel] || ID_ICON_IMAGE_URL;
};

// 🔊 AUDIO SYSTEM`
