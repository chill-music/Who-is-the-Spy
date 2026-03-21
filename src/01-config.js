// ==========================================

var { useState, useEffect, useRef, useCallback, useMemo } = React;
// � Z-INDEX CONSTANTS - Layer Management
var Z = {
    MODAL:      10000,  // Standard modals
    MODAL_HIGH: 12000,  // FunPass, BrowseRooms
    MODAL_TOP:  15000,  // SelfChat, Notifications
    FORCED:     25000,  // Forced logout warning
    OVERLAY:    99999,  // Full overlays
    TOOLTIP:    999999, // Tooltips & dropdowns
};

// � GRADIENT CONSTANTS - Reusable styles
var GR = {
    DARK_CARD:  'linear-gradient(135deg, rgba(15,15,35,0.95), rgba(25,25,50,0.95))',
    NEON:       'linear-gradient(135deg, rgba(0,242,255,0.15), rgba(112,0,255,0.15))',
    GOLD:       'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,140,0,0.15))',
    GOLD_SOFT:  'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,140,0,0.08))',
    CYAN_SOFT:  'linear-gradient(135deg, rgba(0,242,255,0.08), rgba(112,0,255,0.08))',
};

var createPortal = ReactDOM.createPortal;

// Portal helper - renders children on document.body to escape backdrop-filter stacking context
var PortalModal = ({ children }) => {
    const el = useRef(document.createElement('div'));
    useEffect(() => {
        document.body.appendChild(el.current);
        return () => { if (el.current.parentNode) el.current.parentNode.removeChild(el.current); };
    }, []);
    return createPortal(children, el.current);
};

// --- Firebase Configuration ---
var firebaseConfig = {
    apiKey: "AIzaSyApAJaNfF0YHupunLRlK3jRYvttxczWShY",
    authDomain: "who-is-the-spy-919b9.firebaseapp.com",
    projectId: "who-is-the-spy-919b9",
    storageBucket: "who-is-the-spy-919b9.firebasestorage.app",
    messagingSenderId: "607075438373",
    appId: "1:607075438373:web:a03e9fb8b243cd993e14cc"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();
var db = firebase.firestore();
var appId = 'pro_spy_v25_final_fix_complete';

// COLLECTIONS
var usersCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('users');
var guestsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('guests');
var reportsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('reports');
var chatsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('private_chats');
var roomsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('rooms');
var historyCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('game_history');
var notificationsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('notifications');
var giftsLogCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('gifts_log');
var guardLogCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('guard_log');
var momentsCollection         = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('moments');
var vip10RequestsCollection   = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('vip10_requests');
var vip10IdRequestsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('vip10_id_requests');
var bffCollection             = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('bff_relationships');
var botChatsCollection        = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('bot_chats');
var redPacketsCollection      = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('red_packets');
var publicChatCollection      = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('public_chat');
var helpFaqCollection         = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('help_faq');
var feedbackCollection        = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('feedback');
// �� Collections added from scattered files (centralized here) ��
var familiesCollection        = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('families');
var couplesCollection         = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('couples');
var groupsCollection          = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('group_chats');
var staffLogCollection        = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('staff_activity_log');
var ticketsCollection         = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('support_tickets');

// ��������������������������������������������������������
// � RED PACKETS SYSTEM CONFIG
// ��������������������������������������������������������
var RED_PACKETS_CONFIG = [
    {
        id: 'rp_600',
        amount: 600,
        emoji: '�',
        name_ar: '�غ�ف 600',
        name_en: 'Red Packet 600',
        color: '#ef4444',
        glow: 'rgba(239,68,68,0.6)',
        bg: 'linear-gradient(135deg,rgba(239,68,68,0.18),rgba(185,28,28,0.12))',
        border: 'rgba(239,68,68,0.4)',
        imageURL: null, // � ضع رابط ص�رة ا��غ�ف ��ا
        maxClaims: 5,   // عدد ا�أشخاص ا��� ��در�ا �ست���ا ���
        desc_ar: '�غ�ف أح�ر صغ�ر � ��زع ع�� 5 أشخاص',
        desc_en: 'Small red packet � shared among 5 people',
    },
    {
        id: 'rp_1800',
        amount: 1800,
        emoji: '�',
        name_ar: '�غ�ف 1800',
        name_en: 'Red Packet 1800',
        color: '#f97316',
        glow: 'rgba(249,115,22,0.6)',
        bg: 'linear-gradient(135deg,rgba(249,115,22,0.18),rgba(194,65,12,0.12))',
        border: 'rgba(249,115,22,0.4)',
        imageURL: null,
        maxClaims: 8,
        desc_ar: '�غ�ف أح�ر �ت�سط � ��زع ع�� 8 أشخاص',
        desc_en: 'Medium red packet � shared among 8 people',
    },
    {
        id: 'rp_3000',
        amount: 3000,
        emoji: '�',
        name_ar: '�غ�ف 3000',
        name_en: 'Red Packet 3000',
        color: '#fbbf24',
        glow: 'rgba(251,191,36,0.6)',
        bg: 'linear-gradient(135deg,rgba(251,191,36,0.18),rgba(180,83,9,0.12))',
        border: 'rgba(251,191,36,0.4)',
        imageURL: null,
        maxClaims: 10,
        desc_ar: '�غ�ف ذ�ب� � ��زع ع�� 10 أشخاص',
        desc_en: 'Golden packet � shared among 10 people',
    },
    {
        id: 'rp_10000',
        amount: 10000,
        emoji: '�',
        name_ar: '�غ�ف 10000',
        name_en: 'Red Packet 10K',
        color: '#a78bfa',
        glow: 'rgba(167,139,250,0.7)',
        bg: 'linear-gradient(135deg,rgba(167,139,250,0.18),rgba(109,40,217,0.12))',
        border: 'rgba(167,139,250,0.4)',
        imageURL: null,
        maxClaims: 15,
        desc_ar: '�غ�ف ���� � ��زع ع�� 15 شخص',
        desc_en: 'Royal packet � shared among 15 people',
    },
    {
        id: 'rp_50000',
        amount: 50000,
        emoji: '�',
        name_ar: '�غ�ف 50000',
        name_en: 'Red Packet 50K',
        color: '#00f2ff',
        glow: 'rgba(0,242,255,0.8)',
        bg: 'linear-gradient(135deg,rgba(0,242,255,0.18),rgba(112,0,255,0.12))',
        border: 'rgba(0,242,255,0.4)',
        imageURL: null,
        maxClaims: 20,
        desc_ar: '�غ�ف أسط�ر� � ��زع ع�� 20 شخص',
        desc_en: 'Legendary packet � shared among 20 people',
    },
];

// ��������������������������������������������������������
// � BFF SYSTEM CONFIG
// ��������������������������������������������������������
var BFF_CONFIG = {
    freeSlots: 3,           // عدد ا�ع�ا�ات ا��جا��ة
    extraSlotCost: 1000,    // ت��فة فتح خا�ة إضاف�ة با�ع��ة
    // ص�ر ا��ارت ا�خ�ف� ��� ��ع ع�ا�ة � ضع ر�ابط ص�ر ��ا
    cardImages: {
        paper_plane: null,  // � ضع رابط ص�رة ا��ارت ��ط�ارة ا��ر��ة
        airplane:    null,  // � ضع رابط ص�رة ا��ارت ��ط�ارة
        house:       null,  // � ضع رابط ص�رة ا��ارت ��ب�ت
        car:         null,  // � ضع رابط ص�رة ا��ارت ��عرب�ة
        yacht:       null,  // � ضع رابط ص�رة ا��ارت ���خت
        castle:      null,  // � ضع رابط ص�رة ا��ارت ����عة
        default:     null,  // � ا�ص�رة ا�افتراض�ة ���ارت �� �ا ف� ��ع �حدد
    },
};

// BFF Token items � تُضاف ��ش�ب �تُستخد� �إ�شاء ع�ا�ة
var BFF_TOKEN_ITEMS = [
    { id:'bff_paper_plane', emoji:'�️', name_en:'Paper Plane Relationship', name_ar:'ع�ا�ة ط�ارة �ر�',   cost:500,  rarity:'Common',    cardType:'paper_plane', imageURL: null, color:'#60a5fa', glow:'rgba(96,165,250,0.5)',  desc_en:'A simple, sweet bond.',        desc_ar:'رابطة بس�طة �ح��ة.' },
    { id:'bff_airplane',    emoji:'�', name_en:'Airplane Relationship',    name_ar:'ع�ا�ة ط�ارة',       cost:1000, rarity:'Uncommon',  cardType:'airplane',    imageURL: null, color:'#4ade80', glow:'rgba(74,222,128,0.5)',  desc_en:'Soaring friendship.',          desc_ar:'صدا�ة تح�� ف� ا�س�اء.' },
    { id:'bff_house',       emoji:'���', name_en:'House Relationship',       name_ar:'ع�ا�ة ب�ت',         cost:1500, rarity:'Rare',      cardType:'house',       imageURL: null, color:'#f59e0b', glow:'rgba(245,158,11,0.5)',  desc_en:'A warm, homey bond.',          desc_ar:'رابطة دافئة �ا�ب�ت.' },
    { id:'bff_car',         emoji:'�', name_en:'Car Relationship',         name_ar:'ع�ا�ة عرب�ة',       cost:2500, rarity:'Epic',      cardType:'car',         imageURL: null, color:'#a78bfa', glow:'rgba(167,139,250,0.5)', desc_en:'Fast and exciting.',           desc_ar:'سر�عة ��ث�رة.' },
    { id:'bff_yacht',       emoji:'�️', name_en:'Royal Yacht Relationship', name_ar:'ع�ا�ة �خت ����',   cost:5000, rarity:'Legendary', cardType:'yacht',       imageURL: null, color:'#ffd700', glow:'rgba(255,215,0,0.6)',   desc_en:'Luxury friendship at sea.',    desc_ar:'صدا�ة فاخرة ع�� ا�بحر.' },
    { id:'bff_castle',      emoji:'���', name_en:'Friends Castle',           name_ar:'��عة ا�أصد�اء',     cost:8000, rarity:'Mythic',    cardType:'castle',      imageURL: null, color:'#f0abfc', glow:'rgba(240,171,252,0.7)', desc_en:'An unbreakable legendary bond.', desc_ar:'رابطة أسط�ر�ة �ا ت��سر.' },
];

// ��������������������������������������������������������
// � OFFICIAL BOT CHATS CONFIG
// ��������������������������������������������������������
var BOT_CHATS_CONFIG = [
    {
        id: 'detective_bot',
        name_ar: 'ا��ح��',
        name_en: 'The Detective',
        emoji: '�️',
        description_ar: '�ظا� ا�ب�اغات ا�رس�� � ا�ب�اغات �ا�رد�د',
        description_en: 'Official report system � reports & responses',
        color: '#00d4ff',
        glow: 'rgba(0,212,255,0.4)',
        photoURL: null, // � ضع رابط ص�رة ا��ح�� ��ا (ا�أ��ر ف�ط �غ�ر�ا)
        official: true,
        readOnly: true, // �ا ���� ���ستخد��� ا��تابة
    },
    {
        id: 'love_bot',
        name_ar: 'ب�ت د�اء',
        name_en: 'Dawa Bot',
        emoji: '�',
        description_ar: 'إشعارات ا�ز�اج �ع�ا�ات BFF ا�رس��ة',
        description_en: 'Official wedding & BFF notifications',
        color: '#f9a8d4',
        glow: 'rgba(249,168,212,0.4)',
        photoURL: null, // � ضع رابط ص�رة ا�ب�ت ��ا (ا�أ��ر ف�ط �غ�ر�ا)
        official: true,
        readOnly: true,
    },
];

// --- Constants ---
var MAX_BADGES = 10;

// ��������������������������������������������������������
// � ADMIN SYSTEM � ضع Firebase UID بتاع� ��ا
// ��������������������������������������������������������
var ADMIN_UIDS = [
    'PfZAViU4swQdbBZOfqJDnPZSs9l2', // � ضع ا�� UID بتاع� ��ا (Owner)
];
// Owner = أ�� UID ف� ا��ائ�ة � ص�اح�ات �ا��ة �ا تُ�تزع
var OWNER_UID = ADMIN_UIDS[0];
var isAdmin = (uid) => uid && ADMIN_UIDS.includes(uid);

// ��������������������������������������������������������
// � STAFF ROLE SYSTEM
// ��������������������������������������������������������
// ا����� ف� Firestore: user.staffRole = { role: 'admin'|'moderator', assignedBy, assignedAt }
//
// ا�تس�س� ا��ر��:
//   owner      � �ع��� admin أ� moderator
//   admin      � �ع��� moderator ف�ط
//   moderator  � �ا �ع��� أحد
//
// Owner �حدد ب� OWNER_UID (hardcoded) � �ا ���� إزا�ت�

var OLE_CONFIG = {
    owner: {
        label_ar: 'ا��ا��',
        label_en: 'Owner',
        icon: '�',
        color: '#ffd700',
        glow: 'rgba(255,215,0,0.8)',
        bg: 'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,140,0,0.12))',
        border: 'rgba(255,215,0,0.55)',
        badgeClass: 'role-badge-owner',
    },
    admin: {
        label_ar: 'أد��',
        label_en: 'Admin',
        icon: '�️',
        color: '#ef4444',
        glow: 'rgba(239,68,68,0.7)',
        bg: 'linear-gradient(135deg,rgba(239,68,68,0.18),rgba(185,28,28,0.12))',
        border: 'rgba(239,68,68,0.5)',
        badgeClass: 'role-badge-admin',
    },
    moderator: {
        label_ar: '�شرف',
        label_en: 'Mod',
        icon: '�',
        color: '#3b82f6',
        glow: 'rgba(59,130,246,0.6)',
        bg: 'linear-gradient(135deg,rgba(59,130,246,0.18),rgba(29,78,216,0.12))',
        border: 'rgba(59,130,246,0.5)',
        badgeClass: 'role-badge-mod',
    },
};

// �رجع 'owner' | 'admin' | 'moderator' | null
var getUserRole = (userData, uid) => {
    if (!uid && !userData) return null;
    var checkUid = uid || userData?.uid || userData?.id;
    if (checkUid && checkUid === OWNER_UID) return 'owner';
    var role = userData?.staffRole?.role;
    if (role === 'admin' || role === 'moderator') return role;
    return null;
};

// �� ��در �د�ر ا�رتب� (owner أ� admin)
var canManageRoles = (viewerData, viewerUID) => {
    var role = getUserRole(viewerData, viewerUID);
    return role === 'owner' || role === 'admin';
};

// أ�ص� رتبة ��در ا�� viewer �ع����ا
var getAssignableRoles = (viewerData, viewerUID) => {
    var role = getUserRole(viewerData, viewerUID);
    if (role === 'owner') return ['admin', 'moderator'];
    if (role === 'admin') return ['moderator'];
    return [];
};

// ��������������������������������������������������������
// � BAN SYSTEM HELPERS
// ��������������������������������������������������������
var isBannedUser = (userData) => {
    var ban = userData?.ban;
    if (!ban?.isBanned) return false;
    if (!ban.expiresAt) return true; // permanent
    var expiry = ban.expiresAt?.toDate?.() || new Date(ban.expiresAt);
    return new Date() < expiry;
};

var getBanExpiry = (userData) => {
    var ban = userData?.ban;
    if (!ban?.expiresAt) return null;
    return ban.expiresAt?.toDate?.() || new Date(ban.expiresAt);
};

var formatBanExpiry = (userData, lang) => {
    var expiry = getBanExpiry(userData);
    if (!expiry) return lang === 'ar' ? 'حظر دائ�' : 'Permanent';
    return expiry.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

// ��������������������������������������������������������
// �� FAMILY ECONOMY CONFIG � Centralized Constants
// ��������������������������������������������������������
var FAMILY_COINS_SYMBOL = '��'; // Family Coins currency icon

// ��������������������������������������������������������
// ��� FAMILY SIGN IMAGES CONFIG � ضع رابط ص�رة �� سا�� ��ا
// ��������������������������������������������������������
// threshold = ا�حد ا�أد�� �� ا��شاط ا�أسب�ع� ��حص�� ع�� �ذا ا�سا��
var FAMILY_SIGN_IMAGES = [
    { level: 1, threshold: 1000,   imageURL: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Family%20Sign1.png' }, // � ضع رابط ص�رة ا��ست�� 1 ��ا
    { level: 2, threshold: 10000,  imageURL: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Family%20Sign2.png' }, // � ضع رابط ص�رة ا��ست�� 2 ��ا
    { level: 3, threshold: 30000,  imageURL: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Family%20Sign3.png' }, // � ضع رابط ص�رة ا��ست�� 3 ��ا
    { level: 4, threshold: 100000, imageURL: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Family%20Sign4.png' }, // � ضع رابط ص�رة ا��ست�� 4 ��ا
    { level: 5, threshold: 300000, imageURL: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Family%20Sign5.png' }, // � ضع رابط ص�رة ا��ست�� 5 ��ا
];

// ��������������������������������������������������������
// � FAMILY CHEST REWARDS CONFIG
// ��������������������������������������������������������
var CHEST_CONFIG = {
    normal: {
        name_en:'Normal Chest', name_ar:'ص�د�� عاد�', icon:'�', color:'#4ade80',
        rewards: [
            { type:'currency',  amount:1000, icon:'�', label_en:'1000 Intel',        label_ar:'1000 إ�ت�' },
            { type:'coins',     amount:1000, icon:'��', label_en:'1000 Family Coins', label_ar:'1000 ع��ة �ب��ة' },
            { type:'gift',      giftId:'gift_cake',   qty:1, icon:'�', label_en:'Gift (Cake)', label_ar:'���ة' },
            { type:'gift',      giftId:'gift_rose',   qty:9, icon:'�', label_en:'9� Rose',label_ar:'9� �ردة' },
        ],
    },
    advanced: {
        name_en:'Advanced Chest', name_ar:'ص�د�� �ت�د�', icon:'��', color:'#60a5fa',
        rewards: [
            { type:'frame', frameId:'frame_neon',     duration:3,  icon:'�️', label_en:'Neon Frame 3d',  label_ar:'إطار ���� 3d' },
            { type:'frame', frameId:'frame_fire',     duration:7,  icon:'�️', label_en:'Fire Frame 7d',  label_ar:'إطار �ار 7d' },
            { type:'gift',  giftId:'gift_racecar',    qty:2, icon:'��️', label_en:'2� Race Car', label_ar:'2� س�ارة' },
            { type:'gift',  giftId:'gift_crown',      qty:2, icon:'�', label_en:'2� Crown',  label_ar:'2� تاج' },
        ],
    },
    rare: {
        name_en:'Rare Chest', name_ar:'ص�د�� �ادر', icon:'�', color:'#a78bfa',
        rewards: [
            { type:'frame', frameId:'frame_gold',     duration:7,  icon:'�️', label_en:'Gold Frame 7d',  label_ar:'إطار ذ�ب� 7d' },
            { type:'frame', frameId:'frame_ice',      duration:3,  icon:'�️', label_en:'Ice Frame 3d',  label_ar:'إطار ج��د 3d' },
            { type:'frame', frameId:'frame_rainbow',  duration:15, icon:'�️', label_en:'Rainbow Frame 15d', label_ar:'إطار ��س �زح 15d' },
            { type:'gift',  giftId:'gift_ring',       qty:1, icon:'��', label_en:'Diamond Ring', label_ar:'خات� أ��اس' },
            { type:'gift',  giftId:'gift_coffee',     qty:2, icon:'�', label_en:'2� Coffee',  label_ar:'2� ���ة' },
            { type:'gift',  giftId:'gift_racecar',    qty:2, icon:'��️', label_en:'2� Race Car', label_ar:'2� س�ارة' },
            { type:'currency', amount:7800, icon:'�', label_en:'7800 Intel',        label_ar:'7800 إ�ت�' },
            { type:'coins',    amount:7800, icon:'��', label_en:'7800 Coins',        label_ar:'7800 ع��ة' },
        ],
    },
    epic: {
        name_en:'Epic Chest', name_ar:'ص�د�� ��ح��', icon:'�', color:'#ffd700',
        rewards: [
            { type:'currency', amount:10000, icon:'�', label_en:'10K Intel',         label_ar:'10K إ�ت�' },
            { type:'coins',    amount:10000, icon:'��', label_en:'10K Coins',         label_ar:'10K ع��ة' },
            { type:'gift',  giftId:'gift_ring',       qty:2, icon:'��', label_en:'2� Diamond Ring', label_ar:'2� خات� أ��اس' },
            { type:'gift',  giftId:'gift_ultimate',   qty:1, icon:'��', label_en:'Ultimate Gift', label_ar:'ا��د�ة ا��ط��ة' },
            { type:'frame', frameId:'fp_frame_neon',  duration:7,  qty:3, icon:'�️', label_en:'3� Neon Frame 7d', label_ar:'3� إطار ���� 7d' },
            { type:'frame', frameId:'fp_frame_gold',  duration:30, qty:1, icon:'�️', label_en:'Gold Frame 30d',   label_ar:'إطار ذ�ب� 30d' },
        ],
    },
    super: {
        name_en:'Super Chest', name_ar:'ص�د�� أسط�ر�', icon:'�', color:'#f97316',
        rewards: [
            { type:'currency', amount:10000, icon:'�', label_en:'10K Intel',         label_ar:'10K إ�ت�' },
            { type:'coins',    amount:10000, icon:'��', label_en:'10K Coins',         label_ar:'10K ع��ة' },
            { type:'gift',  giftId:'gift_ring',       qty:2, icon:'��', label_en:'2� Diamond Ring', label_ar:'2� خات� أ��اس' },
            { type:'frame', frameId:'fp_frame_mythic',duration:7,  qty:3, icon:'�️', label_en:'3� Mythic Frame 7d', label_ar:'3� إطار خراف� 7d' },
            { type:'frame', frameId:'fp_frame_gold',  duration:30, qty:1, icon:'�️', label_en:'Gold Frame 30d',   label_ar:'إطار ذ�ب� 30d' },
        ],
    },
};

// ��������������������������������������������������������
// � FAMILY GACHA CONFIG - LEVEL BASED
// ��������������������������������������������������������
var GACHA_CONFIG_BASIC = {
    paidCostPerSpin: 200, maxPaidSpinsDaily: 50,
    rewards: [
        // Level 1-4: Basic rewards (Family Gold, Coins, Normal Chests)
        { weight: 200, type: 'currency', amount: 50, rarity: 'common', icon: '�', label_en: '+50 Intel', label_ar: '+50 إ�ت�', rateDisplay: '20%' },
        { weight: 150, type: 'currency', amount: 200, rarity: 'uncommon', icon: '�', label_en: '+200 Intel', label_ar: '+200 إ�ت�', rateDisplay: '15%' },
        { weight: 200, type: 'coins', amount: 50, rarity: 'common', icon: '��', label_en: '+50 Coins', label_ar: '+50 ع��ة', rateDisplay: '20%' },
        { weight: 150, type: 'coins', amount: 150, rarity: 'uncommon', icon: '��', label_en: '+150 Coins', label_ar: '+150 ع��ة', rateDisplay: '15%' },
        { weight: 100, type: 'gift', giftId: 'gift_rose', qty: 5, rarity: 'common', icon: '�', label_en: '5x Rose', label_ar: '5x �ردة', rateDisplay: '10%' },
        { weight: 100, type: 'gift', giftId: 'gift_coffee', qty: 1, rarity: 'uncommon', icon: '�', label_en: 'Coffee', label_ar: '���ة', rateDisplay: '10%' },
        { weight: 80, type: 'gift', giftId: 'gift_cake', qty: 1, rarity: 'rare', icon: '�', label_en: 'Cake', label_ar: '���ة', rateDisplay: '8%' },
        { weight: 18, type: 'frame', frameId: 'frame_neon', duration: 1, rarity: 'rare', icon: '�️', label_en: 'Neon Frame 1d', label_ar: 'إطار ���� 1 ���', rateDisplay: '1.8%' },
        // Strict 0.2% Normal Chest
        { weight: 2, type: 'chest', chestType: 'normal', rarity: 'legendary', icon: '�', label_en: 'Normal Chest', label_ar: 'ص�د�� عاد�', rateDisplay: '0.2%' }
    ] // sum weights = 1000
};

var GACHA_CONFIG_PREMIUM = {
    paidCostPerSpin: 200, maxPaidSpinsDaily: 50,
    rewards: [
        // Level 5+: Add Ring and Advanced/Rare chests
        { weight: 200, type: 'currency', amount: 150, rarity: 'common', icon: '�', label_en: '+150 Intel', label_ar: '+150 إ�ت�', rateDisplay: '20%' },
        { weight: 100, type: 'currency', amount: 500, rarity: 'uncommon', icon: '�', label_en: '+500 Intel', label_ar: '+500 إ�ت�', rateDisplay: '10%' },
        { weight: 200, type: 'coins', amount: 150, rarity: 'common', icon: '��', label_en: '+150 Coins', label_ar: '+150 ع��ة', rateDisplay: '20%' },
        { weight: 100, type: 'coins', amount: 300, rarity: 'uncommon', icon: '��', label_en: '+300 Coins', label_ar: '+300 ع��ة', rateDisplay: '10%' },
        { weight: 150, type: 'gift', giftId: 'gift_cake', qty: 1, rarity: 'uncommon', icon: '�', label_en: 'Cake', label_ar: '���ة', rateDisplay: '15%' },
        { weight: 100, type: 'gift', giftId: 'gift_crown', qty: 1, rarity: 'rare', icon: '�', label_en: 'Crown', label_ar: 'تاج', rateDisplay: '10%' },
        { weight: 90, type: 'gift', giftId: 'gift_racecar', qty: 1, rarity: 'epic', icon: '��️', label_en: 'Race Car', label_ar: 'س�ارة', rateDisplay: '9%' },
        { weight: 50, type: 'frame', frameId: 'frame_gold', duration: 3, rarity: 'epic', icon: '�️', label_en: 'Gold Frame 3d', label_ar: 'إطار ذ�ب� 3 أ�ا�', rateDisplay: '5%' },
        { weight: 4, type: 'chest', chestType: 'normal', rarity: 'rare', icon: '�', label_en: 'Normal Chest', label_ar: 'ص�د�� عاد�', rateDisplay: '0.4%' },
        // Strict 0.2% Advanced Chest
        { weight: 2, type: 'chest', chestType: 'advanced', rarity: 'legendary', icon: '��', label_en: 'Advanced Chest', label_ar: 'ص�د�� �ت�د�', rateDisplay: '0.2%' },
        // Strict 0.2% Rare Chest
        { weight: 2, type: 'chest', chestType: 'rare', rarity: 'legendary', icon: '�', label_en: 'Rare Chest', label_ar: 'ص�د�� �ادر', rateDisplay: '0.2%' },
        // Strict 0.2% Ring (04-data-game.js gift_ring)
        { weight: 2, type: 'gift', giftId: 'gift_ring', qty: 1, rarity: 'mythic', icon: '��', label_en: 'Diamond Ring', label_ar: 'خات� أ��اس', rateDisplay: '0.2%' }
    ] // sum weights = 1000
};

// ��������������������������������������������������������
// �� DAILY TASKS CHEST MILESTONES
// ��������������������������������������������������������
var DAILY_TASKS_MILESTONES = [
    { points: 20,  rewards: [ {type:'currency', id:'currency', qty:5}, {type:'coins', id:'coins', qty:5}, {type:'gift', id:'gift_rose', qty:5} ] },
    { points: 60,  rewards: [ {type:'currency', id:'currency', qty:10},{type:'coins', id:'coins', qty:10},{type:'gift', id:'gift_rose', qty:10} ] },
    { points: 100, rewards: [ {type:'currency', id:'currency', qty:15},{type:'coins', id:'coins', qty:15},{type:'gift', id:'gift_rose', qty:15} ] }
];

var GACHA_RARITY_COLORS = {
    common: '#9ca3af', uncommon: '#4ade80', rare: '#60a5fa',
    epic: '#a78bfa', legendary: '#fbbf24',
};

// ��������������������������������������������������������
// �� ACTIVENESS MILESTONES (Chests for leveling up)
// ��������������������������������������������������������
var ACTIVENESS_MILESTONES = [
    { threshold:8000,   chestType:'normal',   icon:'�', imageURL: null, name_en:'Normal Chest',   name_ar:'ص�د�� عاد�' },
    { threshold:24000,  chestType:'advanced', icon:'��', imageURL: null, name_en:'Advanced Chest', name_ar:'ص�د�� �ت�د�' },
    { threshold:60000,  chestType:'rare',     icon:'�', imageURL: null, name_en:'Rare Chest',     name_ar:'ص�د�� �ادر' },
    { threshold:120000, chestType:'epic',     icon:'�', imageURL: null, name_en:'Epic Chest',     name_ar:'ص�د�� ��ح��' },
    { threshold:280000, chestType:'super',    icon:'�', imageURL: null, name_en:'Super Chest',    name_ar:'ص�د�� أسط�ر�' },
];

// Family Shop Items � purchasable ONLY with Family Coins
var FAMILY_SHOP_ITEMS = [
    { id:'fs1', emoji:'�️', name_en:'Warrior Badge',   name_ar:'شارة ا��حارب',    cost:30,  type:'badge',  rarity:'rare',       durationDays:7, desc_en:'Exclusive family warrior badge', desc_ar:'شارة �حارب حصر�ة ��عائ�ة' },
    { id:'fs2', emoji:'�️', name_en:'Shield Badge',    name_ar:'شارة ا�درع',      cost:50,  type:'badge',  rarity:'rare',       durationDays:7, desc_en:'Honor shield badge',             desc_ar:'شارة درع ا�شرف' },
    { id:'fs3', emoji:'�', name_en:'Crown Badge',     name_ar:'شارة ا�تاج',      cost:100, type:'badge',  rarity:'epic',       durationDays:7, desc_en:'Royal crown clan badge',         desc_ar:'شارة تاج ����' },
    { id:'fs4', emoji:'�', name_en:'Flame Badge',     name_ar:'شارة ا���ب',      cost:40,  type:'badge',  rarity:'rare',       durationDays:7, desc_en:'Blazing fire badge',             desc_ar:'شارة ا���ب ا��شتع�' },
    { id:'fs5', emoji:'�', name_en:'Thunder Badge',   name_ar:'شارة ا�رعد',      cost:40,  type:'badge',  rarity:'rare',       durationDays:7, desc_en:'Lightning thunder badge',        desc_ar:'شارة صاع�ة ا�رعد' },
    { id:'fs6', emoji:'�', name_en:'Star Badge',      name_ar:'شارة ا��ج�ة',     cost:75,  type:'badge',  rarity:'epic',       durationDays:7, desc_en:'Shining star clan badge',        desc_ar:'شارة �ج�ة عائ�ة �ض�ئة' },
    { id:'fs7', emoji:'�', name_en:'Diamond Badge',   name_ar:'شارة ا�أ��اس',    cost:150, type:'badge',  rarity:'legendary',  durationDays:7, desc_en:'Legendary diamond badge',        desc_ar:'شارة أ��اس أسط�ر�ة' },
    { id:'fs8', emoji:'��', name_en:'Trophy Badge',    name_ar:'شارة ا��أس',      cost:200, type:'badge',  rarity:'legendary',  durationDays:7, desc_en:'Champion trophy badge',          desc_ar:'شارة �أس ا�بط��ة' },
    { id:'fs9', emoji:'�', name_en:'Dragon Title',    name_ar:'��ب ا�ت���',       cost:300, type:'title',  rarity:'legendary',  durationDays:7, desc_en:'Exclusive dragon clan title',    desc_ar:'��ب ا�ت��� ا�حصر� ��عائ�ة' },
    { id:'fs10', emoji:'�', name_en:'Lion Title',     name_ar:'��ب ا�أسد',        cost:250, type:'title',  rarity:'epic',       durationDays:7, desc_en:'Pride of the clan lion title',   desc_ar:'��ب أسد فخر ا�عائ�ة' },
];

// ��������������������������������������������������������
// � ID ICON CONFIG � أ����ة �ب� ر�� ا�� ID ف� ا�بر�فا��
// ��������������������������������������������������������
// ا�أ����ة ا�افتراض�ة ��� ا��ستخد��� (ضع رابط ص�رة/GIF أ� null �استخدا� �)
var ID_ICON_IMAGE_URL = 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idon.png'; // � ضع رابط ا�ص�رة ا�عا�ة ��ا (��� ا��ستخد���)

// أ����ات ���زة حصر�ة �� VIP 6 � 10
// �ذ� تُضاف أ�ضا� ف� VIP_CONFIG داخ� 17-vip.js ب�فس ا�ح�� idIconImageUrl
// ��� ����� تع����ا ��ا �ر�ز�ا� ��رج�ع إ���ا بس���ة
var VIP_ID_ICONS = {
    6:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idvip.png', // � VIP 6:  ضع رابط ا�أ����ة ا�ذ�ب�ة ��ا
    7:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idvip6.png', // � VIP 7:  ضع رابط ا�أ����ة ا����زة ��ا
    8:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idvip7.png', // � VIP 8:  ضع رابط ا�أ����ة ا����زة ��ا
    9:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idvip8.png', // � VIP 9:  ضع رابط ا�أ����ة ا�أ���ش� ��ا
    10: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idvip10.png', // � VIP 10: ضع رابط ا�أ����ة ا�أسط�ر�ة ��ا
};
// ��������������������������������������������������������
// � fmtNum � دا�ة ��حدة �ت�س�� ا�أر�ا� (K / M)
// ا�استخدا�: fmtNum(1500) � '1.5K' | fmtNum(2000000) � '2.0M'
// ��������������������������������������������������������
var fmtNum = (n) => {
    if (n === undefined || n === null) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
    return String(n);
};

// ��������������������������������������������������������
// ��� getFamilySignURL � دا�ة ��حدة �ج�ب ص�رة سا�� ا�عائ�ة
// ا�استخدا�: getFamilySignURL(userData) � URL | null
// تح� �ح� 7 أ�ا�� ت�رار ��فس ا���ط� عبر ا���د
// ��������������������������������������������������������
var getFamilySignURL = (data) => {
    if (!data) return null;
    if (data.familySignImageURL) return data.familySignImageURL;
    var level = data.familySignLevel;
    if (!level || typeof FAMILY_SIGN_IMAGES === 'undefined') return null;
    var cfg = FAMILY_SIGN_IMAGES.find(s => s.level === level);
    return cfg?.imageURL || null;
};

// ��������������������������������������������������������
// � getVIPConfig � دا�ة ��حدة �ج�ب إعدادات VIP
// بد�ا� ��: VIP_CONFIG[Math.min(vipLevel-1, VIP_CONFIG.length-1)]
// ا�استخدا�: const vipCfg = getVIPConfig(vipLevel)
// ��������������������������������������������������������
var getVIPConfig = (vipLevel) => {
    if (!vipLevel || vipLevel <= 0 || typeof VIP_CONFIG === 'undefined') return null;
    return VIP_CONFIG[Math.min(vipLevel - 1, VIP_CONFIG.length - 1)] || null;
};

// ��������������������������������������������������������
// ⏱️ TS � اختصار �� firebase.firestore.FieldValue.serverTimestamp()
// ا�استخدا�: createdAt: TS()
// ��������������������������������������������������������
var TS = () => firebase.firestore.FieldValue.serverTimestamp();

// ��������������������������������������������������������
// � fetchMiniProfileData � دا�ة ��حدة �ج�ب ب�ا�ات ا����� بر�فا��
// تح� �ح� 4 �سخ �تطاب�ة ف�: 09, 13, 14, 19
//
// ا�استخدا�:
//   const data = await fetchMiniProfileData(uid, myFriendsList);
//   if (data) setMiniProfile(data);
//
// myFriendsList � �صف�فة ا�� UIDs ا��� ا��ستخد� أصد�اؤ�� (اخت�ار�)
// ��������������������������������������������������������
var fetchMiniProfileData = async (uid, myFriendsList = []) => {
    if (!uid) return null;
    try {
        var doc = await usersCollection.doc(uid).get();
        if (!doc.exists) return null;
        var d = doc.data();
        var stats   = d.stats || {};
        var wins    = stats.wins    || 0;
        var losses  = stats.losses  || 0;
        var total   = wins + losses;
        var winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

        var unlockedBadgeIds = Array.isArray(d.achievements)
            ? d.achievements.map(a => typeof a === 'string' ? a : a?.id).filter(Boolean)
            : ((d.achievements?.badges) || []).map(b => b?.id || b).filter(Boolean);
        var topBadges = typeof ACHIEVEMENTS !== 'undefined'
            ? ACHIEVEMENTS.filter(a => unlockedBadgeIds.includes(a.id))
                .sort((a, b) => (b.tier || 0) - (a.tier || 0))
                .slice(0, 3)
            : [];

        var vipLevel = typeof getVIPLevel === 'function' ? (getVIPLevel(d) || 0) : 0;
        var vipCfg   = getVIPConfig(vipLevel);

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

// � AUDIO SYSTEM`

