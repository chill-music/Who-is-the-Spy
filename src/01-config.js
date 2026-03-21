// ==========================================

var { useState, useEffect, useRef, useCallback, useMemo } = React;
// ðŸŽ¯ Z-INDEX CONSTANTS - Layer Management
var Z = {
    MODAL:      10000,  // Standard modals
    MODAL_HIGH: 12000,  // FunPass, BrowseRooms
    MODAL_TOP:  15000,  // SelfChat, Notifications
    FORCED:     25000,  // Forced logout warning
    OVERLAY:    99999,  // Full overlays
    TOOLTIP:    999999, // Tooltips & dropdowns
};

// ðŸŽ¨ GRADIENT CONSTANTS - Reusable styles
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
// â”€â”€ Collections added from scattered files (centralized here) â”€â”€
var familiesCollection        = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('families');
var couplesCollection         = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('couples');
var groupsCollection          = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('group_chats');
var staffLogCollection        = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('staff_activity_log');
var ticketsCollection         = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('support_tickets');

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ§§ RED PACKETS SYSTEM CONFIG
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var RED_PACKETS_CONFIG = [
    {
        id: 'rp_600',
        amount: 600,
        emoji: 'ðŸ§§',
        name_ar: 'Ù…ØºÙ„Ù 600',
        name_en: 'Red Packet 600',
        color: '#ef4444',
        glow: 'rgba(239,68,68,0.6)',
        bg: 'linear-gradient(135deg,rgba(239,68,68,0.18),rgba(185,28,28,0.12))',
        border: 'rgba(239,68,68,0.4)',
        imageURL: null, // â† Ø¶Ø¹ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ø§Ù„Ù…ØºÙ„Ù Ù‡Ù†Ø§
        maxClaims: 5,   // Ø¹Ø¯Ø¯ Ø§Ù„Ø£Ø´Ø®Ø§Øµ Ø§Ù„Ù„ÙŠ ÙŠÙ‚Ø¯Ø±ÙˆØ§ ÙŠØ³ØªÙ„Ù…ÙˆØ§ Ù…Ù†Ù‡
        desc_ar: 'Ù…ØºÙ„Ù Ø£Ø­Ù…Ø± ØµØºÙŠØ± â€” ÙŠÙˆØ²Ø¹ Ø¹Ù„Ù‰ 5 Ø£Ø´Ø®Ø§Øµ',
        desc_en: 'Small red packet â€” shared among 5 people',
    },
    {
        id: 'rp_1800',
        amount: 1800,
        emoji: 'ðŸ§§',
        name_ar: 'Ù…ØºÙ„Ù 1800',
        name_en: 'Red Packet 1800',
        color: '#f97316',
        glow: 'rgba(249,115,22,0.6)',
        bg: 'linear-gradient(135deg,rgba(249,115,22,0.18),rgba(194,65,12,0.12))',
        border: 'rgba(249,115,22,0.4)',
        imageURL: null,
        maxClaims: 8,
        desc_ar: 'Ù…ØºÙ„Ù Ø£Ø­Ù…Ø± Ù…ØªÙˆØ³Ø· â€” ÙŠÙˆØ²Ø¹ Ø¹Ù„Ù‰ 8 Ø£Ø´Ø®Ø§Øµ',
        desc_en: 'Medium red packet â€” shared among 8 people',
    },
    {
        id: 'rp_3000',
        amount: 3000,
        emoji: 'ðŸ§§',
        name_ar: 'Ù…ØºÙ„Ù 3000',
        name_en: 'Red Packet 3000',
        color: '#fbbf24',
        glow: 'rgba(251,191,36,0.6)',
        bg: 'linear-gradient(135deg,rgba(251,191,36,0.18),rgba(180,83,9,0.12))',
        border: 'rgba(251,191,36,0.4)',
        imageURL: null,
        maxClaims: 10,
        desc_ar: 'Ù…ØºÙ„Ù Ø°Ù‡Ø¨ÙŠ â€” ÙŠÙˆØ²Ø¹ Ø¹Ù„Ù‰ 10 Ø£Ø´Ø®Ø§Øµ',
        desc_en: 'Golden packet â€” shared among 10 people',
    },
    {
        id: 'rp_10000',
        amount: 10000,
        emoji: 'ðŸ§§',
        name_ar: 'Ù…ØºÙ„Ù 10000',
        name_en: 'Red Packet 10K',
        color: '#a78bfa',
        glow: 'rgba(167,139,250,0.7)',
        bg: 'linear-gradient(135deg,rgba(167,139,250,0.18),rgba(109,40,217,0.12))',
        border: 'rgba(167,139,250,0.4)',
        imageURL: null,
        maxClaims: 15,
        desc_ar: 'Ù…ØºÙ„Ù Ù…Ù„ÙƒÙŠ â€” ÙŠÙˆØ²Ø¹ Ø¹Ù„Ù‰ 15 Ø´Ø®Øµ',
        desc_en: 'Royal packet â€” shared among 15 people',
    },
    {
        id: 'rp_50000',
        amount: 50000,
        emoji: 'ðŸ§§',
        name_ar: 'Ù…ØºÙ„Ù 50000',
        name_en: 'Red Packet 50K',
        color: '#00f2ff',
        glow: 'rgba(0,242,255,0.8)',
        bg: 'linear-gradient(135deg,rgba(0,242,255,0.18),rgba(112,0,255,0.12))',
        border: 'rgba(0,242,255,0.4)',
        imageURL: null,
        maxClaims: 20,
        desc_ar: 'Ù…ØºÙ„Ù Ø£Ø³Ø·ÙˆØ±ÙŠ â€” ÙŠÙˆØ²Ø¹ Ø¹Ù„Ù‰ 20 Ø´Ø®Øµ',
        desc_en: 'Legendary packet â€” shared among 20 people',
    },
];

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ¤ BFF SYSTEM CONFIG
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var BFF_CONFIG = {
    freeSlots: 3,           // Ø¹Ø¯Ø¯ Ø§Ù„Ø¹Ù„Ø§Ù‚Ø§Øª Ø§Ù„Ù…Ø¬Ø§Ù†ÙŠØ©
    extraSlotCost: 1000,    // ØªÙƒÙ„ÙØ© ÙØªØ­ Ø®Ø§Ù†Ø© Ø¥Ø¶Ø§ÙÙŠØ© Ø¨Ø§Ù„Ø¹Ù…Ù„Ø©
    // ØµÙˆØ± Ø§Ù„ÙƒØ§Ø±Øª Ø§Ù„Ø®Ù„ÙÙŠ Ù„ÙƒÙ„ Ù†ÙˆØ¹ Ø¹Ù„Ø§Ù‚Ø© â€” Ø¶Ø¹ Ø±ÙˆØ§Ø¨Ø· ØµÙˆØ± Ù‡Ù†Ø§
    cardImages: {
        paper_plane: null,  // â† Ø¶Ø¹ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ø§Ù„ÙƒØ§Ø±Øª Ù„Ù„Ø·ÙŠØ§Ø±Ø© Ø§Ù„ÙˆØ±Ù‚ÙŠØ©
        airplane:    null,  // â† Ø¶Ø¹ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ø§Ù„ÙƒØ§Ø±Øª Ù„Ù„Ø·ÙŠØ§Ø±Ø©
        house:       null,  // â† Ø¶Ø¹ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ø§Ù„ÙƒØ§Ø±Øª Ù„Ù„Ø¨ÙŠØª
        car:         null,  // â† Ø¶Ø¹ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ø§Ù„ÙƒØ§Ø±Øª Ù„Ù„Ø¹Ø±Ø¨ÙŠØ©
        yacht:       null,  // â† Ø¶Ø¹ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ø§Ù„ÙƒØ§Ø±Øª Ù„Ù„ÙŠØ®Øª
        castle:      null,  // â† Ø¶Ø¹ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ø§Ù„ÙƒØ§Ø±Øª Ù„Ù„Ù‚Ù„Ø¹Ø©
        default:     null,  // â† Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠØ© Ù„Ù„ÙƒØ§Ø±Øª Ù„Ùˆ Ù…Ø§ ÙÙŠ Ù†ÙˆØ¹ Ù…Ø­Ø¯Ø¯
    },
};

// BFF Token items â€” ØªÙØ¶Ø§Ù Ù„Ù„Ø´ÙˆØ¨ ÙˆØªÙØ³ØªØ®Ø¯Ù… Ù„Ø¥Ù†Ø´Ø§Ø¡ Ø¹Ù„Ø§Ù‚Ø©
var BFF_TOKEN_ITEMS = [
    { id:'bff_paper_plane', emoji:'âœˆï¸', name_en:'Paper Plane Relationship', name_ar:'Ø¹Ù„Ø§Ù‚Ø© Ø·ÙŠØ§Ø±Ø© ÙˆØ±Ù‚',   cost:500,  rarity:'Common',    cardType:'paper_plane', imageURL: null, color:'#60a5fa', glow:'rgba(96,165,250,0.5)',  desc_en:'A simple, sweet bond.',        desc_ar:'Ø±Ø§Ø¨Ø·Ø© Ø¨Ø³ÙŠØ·Ø© ÙˆØ­Ù„ÙˆØ©.' },
    { id:'bff_airplane',    emoji:'ðŸ›«', name_en:'Airplane Relationship',    name_ar:'Ø¹Ù„Ø§Ù‚Ø© Ø·ÙŠØ§Ø±Ø©',       cost:1000, rarity:'Uncommon',  cardType:'airplane',    imageURL: null, color:'#4ade80', glow:'rgba(74,222,128,0.5)',  desc_en:'Soaring friendship.',          desc_ar:'ØµØ¯Ø§Ù‚Ø© ØªØ­Ù„Ù‚ ÙÙŠ Ø§Ù„Ø³Ù…Ø§Ø¡.' },
    { id:'bff_house',       emoji:'ðŸ ', name_en:'House Relationship',       name_ar:'Ø¹Ù„Ø§Ù‚Ø© Ø¨ÙŠØª',         cost:1500, rarity:'Rare',      cardType:'house',       imageURL: null, color:'#f59e0b', glow:'rgba(245,158,11,0.5)',  desc_en:'A warm, homey bond.',          desc_ar:'Ø±Ø§Ø¨Ø·Ø© Ø¯Ø§ÙØ¦Ø© ÙƒØ§Ù„Ø¨ÙŠØª.' },
    { id:'bff_car',         emoji:'ðŸš—', name_en:'Car Relationship',         name_ar:'Ø¹Ù„Ø§Ù‚Ø© Ø¹Ø±Ø¨ÙŠØ©',       cost:2500, rarity:'Epic',      cardType:'car',         imageURL: null, color:'#a78bfa', glow:'rgba(167,139,250,0.5)', desc_en:'Fast and exciting.',           desc_ar:'Ø³Ø±ÙŠØ¹Ø© ÙˆÙ…Ø«ÙŠØ±Ø©.' },
    { id:'bff_yacht',       emoji:'ðŸ›¥ï¸', name_en:'Royal Yacht Relationship', name_ar:'Ø¹Ù„Ø§Ù‚Ø© ÙŠØ®Øª Ù…Ù„ÙƒÙŠ',   cost:5000, rarity:'Legendary', cardType:'yacht',       imageURL: null, color:'#ffd700', glow:'rgba(255,215,0,0.6)',   desc_en:'Luxury friendship at sea.',    desc_ar:'ØµØ¯Ø§Ù‚Ø© ÙØ§Ø®Ø±Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø¨Ø­Ø±.' },
    { id:'bff_castle',      emoji:'ðŸ°', name_en:'Friends Castle',           name_ar:'Ù‚Ù„Ø¹Ø© Ø§Ù„Ø£ØµØ¯Ù‚Ø§Ø¡',     cost:8000, rarity:'Mythic',    cardType:'castle',      imageURL: null, color:'#f0abfc', glow:'rgba(240,171,252,0.7)', desc_en:'An unbreakable legendary bond.', desc_ar:'Ø±Ø§Ø¨Ø·Ø© Ø£Ø³Ø·ÙˆØ±ÙŠØ© Ù„Ø§ ØªÙ†ÙƒØ³Ø±.' },
];

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ¤– OFFICIAL BOT CHATS CONFIG
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var BOT_CHATS_CONFIG = [
    {
        id: 'detective_bot',
        name_ar: 'Ø§Ù„Ù…Ø­Ù‚Ù‚',
        name_en: 'The Detective',
        emoji: 'ðŸ•µï¸',
        description_ar: 'Ù†Ø¸Ø§Ù… Ø§Ù„Ø¨Ù„Ø§ØºØ§Øª Ø§Ù„Ø±Ø³Ù…ÙŠ â€” Ø§Ù„Ø¨Ù„Ø§ØºØ§Øª ÙˆØ§Ù„Ø±Ø¯ÙˆØ¯',
        description_en: 'Official report system â€” reports & responses',
        color: '#00d4ff',
        glow: 'rgba(0,212,255,0.4)',
        photoURL: null, // â† Ø¶Ø¹ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ø§Ù„Ù…Ø­Ù‚Ù‚ Ù‡Ù†Ø§ (Ø§Ù„Ø£ÙˆÙ†Ø± ÙÙ‚Ø· ÙŠØºÙŠØ±Ù‡Ø§)
        official: true,
        readOnly: true, // Ù„Ø§ ÙŠÙ…ÙƒÙ† Ù„Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø§Ù„ÙƒØªØ§Ø¨Ø©
    },
    {
        id: 'love_bot',
        name_ar: 'Ø¨ÙˆØª Ø¯ÙˆØ§Ø¡',
        name_en: 'Dawa Bot',
        emoji: 'ðŸ’Œ',
        description_ar: 'Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ø§Ù„Ø²ÙˆØ§Ø¬ ÙˆØ¹Ù„Ø§Ù‚Ø§Øª BFF Ø§Ù„Ø±Ø³Ù…ÙŠØ©',
        description_en: 'Official wedding & BFF notifications',
        color: '#f9a8d4',
        glow: 'rgba(249,168,212,0.4)',
        photoURL: null, // â† Ø¶Ø¹ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ø§Ù„Ø¨ÙˆØª Ù‡Ù†Ø§ (Ø§Ù„Ø£ÙˆÙ†Ø± ÙÙ‚Ø· ÙŠØºÙŠØ±Ù‡Ø§)
        official: true,
        readOnly: true,
    },
];

// --- Constants ---
var MAX_BADGES = 10;

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ”’ ADMIN SYSTEM â€” Ø¶Ø¹ Firebase UID Ø¨ØªØ§Ø¹Ùƒ Ù‡Ù†Ø§
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var ADMIN_UIDS = [
    'PfZAViU4swQdbBZOfqJDnPZSs9l2', // â† Ø¶Ø¹ Ø§Ù„Ù€ UID Ø¨ØªØ§Ø¹Ùƒ Ù‡Ù†Ø§ (Owner)
];
// Owner = Ø£ÙˆÙ„ UID ÙÙŠ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© â€” ØµÙ„Ø§Ø­ÙŠØ§Øª ÙƒØ§Ù…Ù„Ø© Ù„Ø§ ØªÙÙ†ØªØ²Ø¹
var OWNER_UID = ADMIN_UIDS[0];
var isAdmin = (uid) => uid && ADMIN_UIDS.includes(uid);

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ‘‘ STAFF ROLE SYSTEM
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Ø§Ù„Ù‡ÙŠÙƒÙ„ ÙÙŠ Firestore: user.staffRole = { role: 'admin'|'moderator', assignedBy, assignedAt }
//
// Ø§Ù„ØªØ³Ù„Ø³Ù„ Ø§Ù„Ù‡Ø±Ù…ÙŠ:
//   owner      â†’ ÙŠØ¹ÙŠÙ‘Ù† admin Ø£Ùˆ moderator
//   admin      â†’ ÙŠØ¹ÙŠÙ‘Ù† moderator ÙÙ‚Ø·
//   moderator  â†’ Ù„Ø§ ÙŠØ¹ÙŠÙ‘Ù† Ø£Ø­Ø¯
//
// Owner Ù…Ø­Ø¯Ø¯ Ø¨Ù€ OWNER_UID (hardcoded) â€” Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø¥Ø²Ø§Ù„ØªÙ‡

var OLE_CONFIG = {
    owner: {
        label_ar: 'Ø§Ù„Ù…Ø§Ù„Ùƒ',
        label_en: 'Owner',
        icon: 'ðŸ‘‘',
        color: '#ffd700',
        glow: 'rgba(255,215,0,0.8)',
        bg: 'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,140,0,0.12))',
        border: 'rgba(255,215,0,0.55)',
        badgeClass: 'role-badge-owner',
    },
    admin: {
        label_ar: 'Ø£Ø¯Ù…Ù†',
        label_en: 'Admin',
        icon: 'ðŸ›¡ï¸',
        color: '#ef4444',
        glow: 'rgba(239,68,68,0.7)',
        bg: 'linear-gradient(135deg,rgba(239,68,68,0.18),rgba(185,28,28,0.12))',
        border: 'rgba(239,68,68,0.5)',
        badgeClass: 'role-badge-admin',
    },
    moderator: {
        label_ar: 'Ù…Ø´Ø±Ù',
        label_en: 'Mod',
        icon: 'ðŸ”°',
        color: '#3b82f6',
        glow: 'rgba(59,130,246,0.6)',
        bg: 'linear-gradient(135deg,rgba(59,130,246,0.18),rgba(29,78,216,0.12))',
        border: 'rgba(59,130,246,0.5)',
        badgeClass: 'role-badge-mod',
    },
};

// ÙŠØ±Ø¬Ø¹ 'owner' | 'admin' | 'moderator' | null
var getUserRole = (userData, uid) => {
    if (!uid && !userData) return null;
    var checkUid = uid || userData?.uid || userData?.id;
    if (checkUid && checkUid === OWNER_UID) return 'owner';
    var role = userData?.staffRole?.role;
    if (role === 'admin' || role === 'moderator') return role;
    return null;
};

// Ù‡Ù„ ÙŠÙ‚Ø¯Ø± ÙŠØ¯ÙŠØ± Ø§Ù„Ø±ØªØ¨ØŸ (owner Ø£Ùˆ admin)
var canManageRoles = (viewerData, viewerUID) => {
    var role = getUserRole(viewerData, viewerUID);
    return role === 'owner' || role === 'admin';
};

// Ø£Ù‚ØµÙ‰ Ø±ØªØ¨Ø© ÙŠÙ‚Ø¯Ø± Ø§Ù„Ù€ viewer ÙŠØ¹ÙŠÙ‘Ù†Ù‡Ø§
var getAssignableRoles = (viewerData, viewerUID) => {
    var role = getUserRole(viewerData, viewerUID);
    if (role === 'owner') return ['admin', 'moderator'];
    if (role === 'admin') return ['moderator'];
    return [];
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸš« BAN SYSTEM HELPERS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
    if (!expiry) return lang === 'ar' ? 'Ø­Ø¸Ø± Ø¯Ø§Ø¦Ù…' : 'Permanent';
    return expiry.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ… FAMILY ECONOMY CONFIG â€” Centralized Constants
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var FAMILY_COINS_SYMBOL = 'ðŸ…'; // Family Coins currency icon

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ´ FAMILY SIGN IMAGES CONFIG â€” Ø¶Ø¹ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© ÙƒÙ„ Ø³Ø§ÙŠÙ† Ù‡Ù†Ø§
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// threshold = Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ø¯Ù†Ù‰ Ù…Ù† Ø§Ù„Ù†Ø´Ø§Ø· Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ÙŠ Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ù‡Ø°Ø§ Ø§Ù„Ø³Ø§ÙŠÙ†
var FAMILY_SIGN_IMAGES = [
    { level: 1, threshold: 1000,   imageURL: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Family%20Sign1.png' }, // â† Ø¶Ø¹ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ø§Ù„Ù…Ø³ØªÙˆÙ‰ 1 Ù‡Ù†Ø§
    { level: 2, threshold: 10000,  imageURL: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Family%20Sign2.png' }, // â† Ø¶Ø¹ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ø§Ù„Ù…Ø³ØªÙˆÙ‰ 2 Ù‡Ù†Ø§
    { level: 3, threshold: 30000,  imageURL: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Family%20Sign3.png' }, // â† Ø¶Ø¹ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ø§Ù„Ù…Ø³ØªÙˆÙ‰ 3 Ù‡Ù†Ø§
    { level: 4, threshold: 100000, imageURL: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Family%20Sign4.png' }, // â† Ø¶Ø¹ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ø§Ù„Ù…Ø³ØªÙˆÙ‰ 4 Ù‡Ù†Ø§
    { level: 5, threshold: 300000, imageURL: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Family%20Sign5.png' }, // â† Ø¶Ø¹ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ø§Ù„Ù…Ø³ØªÙˆÙ‰ 5 Ù‡Ù†Ø§
];

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ“¦ FAMILY CHEST REWARDS CONFIG
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var CHEST_CONFIG = {
    normal: {
        name_en:'Normal Chest', name_ar:'ØµÙ†Ø¯ÙˆÙ‚ Ø¹Ø§Ø¯ÙŠ', icon:'ðŸ“¦', color:'#4ade80',
        rewards: [
            { type:'currency',  amount:1000, icon:'ðŸ§ ', label_en:'1000 Intel',        label_ar:'1000 Ø¥Ù†ØªÙ„' },
            { type:'coins',     amount:1000, icon:'ðŸ…', label_en:'1000 Family Coins', label_ar:'1000 Ø¹Ù…Ù„Ø© Ù‚Ø¨ÙŠÙ„Ø©' },
            { type:'gift',      giftId:'gift_cake',   qty:1, icon:'ðŸŽ‚', label_en:'Gift (Cake)', label_ar:'ÙƒÙŠÙƒØ©' },
            { type:'gift',      giftId:'gift_rose',   qty:9, icon:'ðŸŒ¹', label_en:'9Ã— Rose',label_ar:'9Ã— ÙˆØ±Ø¯Ø©' },
        ],
    },
    advanced: {
        name_en:'Advanced Chest', name_ar:'ØµÙ†Ø¯ÙˆÙ‚ Ù…ØªÙ‚Ø¯Ù…', icon:'ðŸŽ', color:'#60a5fa',
        rewards: [
            { type:'frame', frameId:'frame_neon',     duration:3,  icon:'ðŸ–¼ï¸', label_en:'Neon Frame 3d',  label_ar:'Ø¥Ø·Ø§Ø± Ù†ÙŠÙˆÙ† 3d' },
            { type:'frame', frameId:'frame_fire',     duration:7,  icon:'ðŸ–¼ï¸', label_en:'Fire Frame 7d',  label_ar:'Ø¥Ø·Ø§Ø± Ù†Ø§Ø± 7d' },
            { type:'gift',  giftId:'gift_racecar',    qty:2, icon:'ðŸŽï¸', label_en:'2Ã— Race Car', label_ar:'2Ã— Ø³ÙŠØ§Ø±Ø©' },
            { type:'gift',  giftId:'gift_crown',      qty:2, icon:'ðŸ‘‘', label_en:'2Ã— Crown',  label_ar:'2Ã— ØªØ§Ø¬' },
        ],
    },
    rare: {
        name_en:'Rare Chest', name_ar:'ØµÙ†Ø¯ÙˆÙ‚ Ù†Ø§Ø¯Ø±', icon:'ðŸ’ ', color:'#a78bfa',
        rewards: [
            { type:'frame', frameId:'frame_gold',     duration:7,  icon:'ðŸ–¼ï¸', label_en:'Gold Frame 7d',  label_ar:'Ø¥Ø·Ø§Ø± Ø°Ù‡Ø¨ÙŠ 7d' },
            { type:'frame', frameId:'frame_ice',      duration:3,  icon:'ðŸ–¼ï¸', label_en:'Ice Frame 3d',  label_ar:'Ø¥Ø·Ø§Ø± Ø¬Ù„ÙŠØ¯ 3d' },
            { type:'frame', frameId:'frame_rainbow',  duration:15, icon:'ðŸ–¼ï¸', label_en:'Rainbow Frame 15d', label_ar:'Ø¥Ø·Ø§Ø± Ù‚ÙˆØ³ Ù‚Ø²Ø­ 15d' },
            { type:'gift',  giftId:'gift_ring',       qty:1, icon:'ðŸ’', label_en:'Diamond Ring', label_ar:'Ø®Ø§ØªÙ… Ø£Ù„Ù…Ø§Ø³' },
            { type:'gift',  giftId:'gift_coffee',     qty:2, icon:'â˜•', label_en:'2Ã— Coffee',  label_ar:'2Ã— Ù‚Ù‡ÙˆØ©' },
            { type:'gift',  giftId:'gift_racecar',    qty:2, icon:'ðŸŽï¸', label_en:'2Ã— Race Car', label_ar:'2Ã— Ø³ÙŠØ§Ø±Ø©' },
            { type:'currency', amount:7800, icon:'ðŸ§ ', label_en:'7800 Intel',        label_ar:'7800 Ø¥Ù†ØªÙ„' },
            { type:'coins',    amount:7800, icon:'ðŸ…', label_en:'7800 Coins',        label_ar:'7800 Ø¹Ù…Ù„Ø©' },
        ],
    },
    epic: {
        name_en:'Epic Chest', name_ar:'ØµÙ†Ø¯ÙˆÙ‚ Ù…Ù„Ø­Ù…ÙŠ', icon:'ðŸ’Ž', color:'#ffd700',
        rewards: [
            { type:'currency', amount:10000, icon:'ðŸ§ ', label_en:'10K Intel',         label_ar:'10K Ø¥Ù†ØªÙ„' },
            { type:'coins',    amount:10000, icon:'ðŸ…', label_en:'10K Coins',         label_ar:'10K Ø¹Ù…Ù„Ø©' },
            { type:'gift',  giftId:'gift_ring',       qty:2, icon:'ðŸ’', label_en:'2Ã— Diamond Ring', label_ar:'2Ã— Ø®Ø§ØªÙ… Ø£Ù„Ù…Ø§Ø³' },
            { type:'gift',  giftId:'gift_ultimate',   qty:1, icon:'ðŸ†', label_en:'Ultimate Gift', label_ar:'Ø§Ù„Ù‡Ø¯ÙŠØ© Ø§Ù„Ù…Ø·Ù„Ù‚Ø©' },
            { type:'frame', frameId:'fp_frame_neon',  duration:7,  qty:3, icon:'ðŸ–¼ï¸', label_en:'3Ã— Neon Frame 7d', label_ar:'3Ã— Ø¥Ø·Ø§Ø± Ù†ÙŠÙˆÙ† 7d' },
            { type:'frame', frameId:'fp_frame_gold',  duration:30, qty:1, icon:'ðŸ–¼ï¸', label_en:'Gold Frame 30d',   label_ar:'Ø¥Ø·Ø§Ø± Ø°Ù‡Ø¨ÙŠ 30d' },
        ],
    },
    super: {
        name_en:'Super Chest', name_ar:'ØµÙ†Ø¯ÙˆÙ‚ Ø£Ø³Ø·ÙˆØ±ÙŠ', icon:'ðŸ‘‘', color:'#f97316',
        rewards: [
            { type:'currency', amount:10000, icon:'ðŸ§ ', label_en:'10K Intel',         label_ar:'10K Ø¥Ù†ØªÙ„' },
            { type:'coins',    amount:10000, icon:'ðŸ…', label_en:'10K Coins',         label_ar:'10K Ø¹Ù…Ù„Ø©' },
            { type:'gift',  giftId:'gift_ring',       qty:2, icon:'ðŸ’', label_en:'2Ã— Diamond Ring', label_ar:'2Ã— Ø®Ø§ØªÙ… Ø£Ù„Ù…Ø§Ø³' },
            { type:'frame', frameId:'fp_frame_mythic',duration:7,  qty:3, icon:'ðŸ–¼ï¸', label_en:'3Ã— Mythic Frame 7d', label_ar:'3Ã— Ø¥Ø·Ø§Ø± Ø®Ø±Ø§ÙÙŠ 7d' },
            { type:'frame', frameId:'fp_frame_gold',  duration:30, qty:1, icon:'ðŸ–¼ï¸', label_en:'Gold Frame 30d',   label_ar:'Ø¥Ø·Ø§Ø± Ø°Ù‡Ø¨ÙŠ 30d' },
        ],
    },
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸŽ° FAMILY GACHA CONFIG - LEVEL BASED
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var GACHA_CONFIG_BASIC = {
    paidCostPerSpin: 200, maxPaidSpinsDaily: 50,
    rewards: [
        // Level 1-4: Basic rewards (Family Gold, Coins, Normal Chests)
        { weight: 200, type: 'currency', amount: 50, rarity: 'common', icon: 'ðŸ§ ', label_en: '+50 Intel', label_ar: '+50 Ø¥Ù†ØªÙ„', rateDisplay: '20%' },
        { weight: 150, type: 'currency', amount: 200, rarity: 'uncommon', icon: 'ðŸ§ ', label_en: '+200 Intel', label_ar: '+200 Ø¥Ù†ØªÙ„', rateDisplay: '15%' },
        { weight: 200, type: 'coins', amount: 50, rarity: 'common', icon: 'ðŸ…', label_en: '+50 Coins', label_ar: '+50 Ø¹Ù…Ù„Ø©', rateDisplay: '20%' },
        { weight: 150, type: 'coins', amount: 150, rarity: 'uncommon', icon: 'ðŸ…', label_en: '+150 Coins', label_ar: '+150 Ø¹Ù…Ù„Ø©', rateDisplay: '15%' },
        { weight: 100, type: 'gift', giftId: 'gift_rose', qty: 5, rarity: 'common', icon: 'ðŸŒ¹', label_en: '5x Rose', label_ar: '5x ÙˆØ±Ø¯Ø©', rateDisplay: '10%' },
        { weight: 100, type: 'gift', giftId: 'gift_coffee', qty: 1, rarity: 'uncommon', icon: 'â˜•', label_en: 'Coffee', label_ar: 'Ù‚Ù‡ÙˆØ©', rateDisplay: '10%' },
        { weight: 80, type: 'gift', giftId: 'gift_cake', qty: 1, rarity: 'rare', icon: 'ðŸŽ‚', label_en: 'Cake', label_ar: 'ÙƒÙŠÙƒØ©', rateDisplay: '8%' },
        { weight: 18, type: 'frame', frameId: 'frame_neon', duration: 1, rarity: 'rare', icon: 'ðŸ–¼ï¸', label_en: 'Neon Frame 1d', label_ar: 'Ø¥Ø·Ø§Ø± Ù†ÙŠÙˆÙ† 1 ÙŠÙˆÙ…', rateDisplay: '1.8%' },
        // Strict 0.2% Normal Chest
        { weight: 2, type: 'chest', chestType: 'normal', rarity: 'legendary', icon: 'ðŸ“¦', label_en: 'Normal Chest', label_ar: 'ØµÙ†Ø¯ÙˆÙ‚ Ø¹Ø§Ø¯ÙŠ', rateDisplay: '0.2%' }
    ] // sum weights = 1000
};

var GACHA_CONFIG_PREMIUM = {
    paidCostPerSpin: 200, maxPaidSpinsDaily: 50,
    rewards: [
        // Level 5+: Add Ring and Advanced/Rare chests
        { weight: 200, type: 'currency', amount: 150, rarity: 'common', icon: 'ðŸ§ ', label_en: '+150 Intel', label_ar: '+150 Ø¥Ù†ØªÙ„', rateDisplay: '20%' },
        { weight: 100, type: 'currency', amount: 500, rarity: 'uncommon', icon: 'ðŸ§ ', label_en: '+500 Intel', label_ar: '+500 Ø¥Ù†ØªÙ„', rateDisplay: '10%' },
        { weight: 200, type: 'coins', amount: 150, rarity: 'common', icon: 'ðŸ…', label_en: '+150 Coins', label_ar: '+150 Ø¹Ù…Ù„Ø©', rateDisplay: '20%' },
        { weight: 100, type: 'coins', amount: 300, rarity: 'uncommon', icon: 'ðŸ…', label_en: '+300 Coins', label_ar: '+300 Ø¹Ù…Ù„Ø©', rateDisplay: '10%' },
        { weight: 150, type: 'gift', giftId: 'gift_cake', qty: 1, rarity: 'uncommon', icon: 'ðŸŽ‚', label_en: 'Cake', label_ar: 'ÙƒÙŠÙƒØ©', rateDisplay: '15%' },
        { weight: 100, type: 'gift', giftId: 'gift_crown', qty: 1, rarity: 'rare', icon: 'ðŸ‘‘', label_en: 'Crown', label_ar: 'ØªØ§Ø¬', rateDisplay: '10%' },
        { weight: 90, type: 'gift', giftId: 'gift_racecar', qty: 1, rarity: 'epic', icon: 'ðŸŽï¸', label_en: 'Race Car', label_ar: 'Ø³ÙŠØ§Ø±Ø©', rateDisplay: '9%' },
        { weight: 50, type: 'frame', frameId: 'frame_gold', duration: 3, rarity: 'epic', icon: 'ðŸ–¼ï¸', label_en: 'Gold Frame 3d', label_ar: 'Ø¥Ø·Ø§Ø± Ø°Ù‡Ø¨ÙŠ 3 Ø£ÙŠØ§Ù…', rateDisplay: '5%' },
        { weight: 4, type: 'chest', chestType: 'normal', rarity: 'rare', icon: 'ðŸ“¦', label_en: 'Normal Chest', label_ar: 'ØµÙ†Ø¯ÙˆÙ‚ Ø¹Ø§Ø¯ÙŠ', rateDisplay: '0.4%' },
        // Strict 0.2% Advanced Chest
        { weight: 2, type: 'chest', chestType: 'advanced', rarity: 'legendary', icon: 'ðŸŽ', label_en: 'Advanced Chest', label_ar: 'ØµÙ†Ø¯ÙˆÙ‚ Ù…ØªÙ‚Ø¯Ù…', rateDisplay: '0.2%' },
        // Strict 0.2% Rare Chest
        { weight: 2, type: 'chest', chestType: 'rare', rarity: 'legendary', icon: 'ðŸ’ ', label_en: 'Rare Chest', label_ar: 'ØµÙ†Ø¯ÙˆÙ‚ Ù†Ø§Ø¯Ø±', rateDisplay: '0.2%' },
        // Strict 0.2% Ring (04-data-game.js gift_ring)
        { weight: 2, type: 'gift', giftId: 'gift_ring', qty: 1, rarity: 'mythic', icon: 'ðŸ’', label_en: 'Diamond Ring', label_ar: 'Ø®Ø§ØªÙ… Ø£Ù„Ù…Ø§Ø³', rateDisplay: '0.2%' }
    ] // sum weights = 1000
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ… DAILY TASKS CHEST MILESTONES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var DAILY_TASKS_MILESTONES = [
    { points: 20,  rewards: [ {type:'currency', id:'currency', qty:5}, {type:'coins', id:'coins', qty:5}, {type:'gift', id:'gift_rose', qty:5} ] },
    { points: 60,  rewards: [ {type:'currency', id:'currency', qty:10},{type:'coins', id:'coins', qty:10},{type:'gift', id:'gift_rose', qty:10} ] },
    { points: 100, rewards: [ {type:'currency', id:'currency', qty:15},{type:'coins', id:'coins', qty:15},{type:'gift', id:'gift_rose', qty:15} ] }
];

var GACHA_RARITY_COLORS = {
    common: '#9ca3af', uncommon: '#4ade80', rare: '#60a5fa',
    epic: '#a78bfa', legendary: '#fbbf24',
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ… ACTIVENESS MILESTONES (Chests for leveling up)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var ACTIVENESS_MILESTONES = [
    { threshold:8000,   chestType:'normal',   icon:'ðŸ“¦', imageURL: null, name_en:'Normal Chest',   name_ar:'ØµÙ†Ø¯ÙˆÙ‚ Ø¹Ø§Ø¯ÙŠ' },
    { threshold:24000,  chestType:'advanced', icon:'ðŸŽ', imageURL: null, name_en:'Advanced Chest', name_ar:'ØµÙ†Ø¯ÙˆÙ‚ Ù…ØªÙ‚Ø¯Ù…' },
    { threshold:60000,  chestType:'rare',     icon:'ðŸ’ ', imageURL: null, name_en:'Rare Chest',     name_ar:'ØµÙ†Ø¯ÙˆÙ‚ Ù†Ø§Ø¯Ø±' },
    { threshold:120000, chestType:'epic',     icon:'ðŸ’Ž', imageURL: null, name_en:'Epic Chest',     name_ar:'ØµÙ†Ø¯ÙˆÙ‚ Ù…Ù„Ø­Ù…ÙŠ' },
    { threshold:280000, chestType:'super',    icon:'ðŸ‘‘', imageURL: null, name_en:'Super Chest',    name_ar:'ØµÙ†Ø¯ÙˆÙ‚ Ø£Ø³Ø·ÙˆØ±ÙŠ' },
];

// Family Shop Items â€” purchasable ONLY with Family Coins
var FAMILY_SHOP_ITEMS = [
    { id:'fs1', emoji:'ðŸŽ–ï¸', name_en:'Warrior Badge',   name_ar:'Ø´Ø§Ø±Ø© Ø§Ù„Ù…Ø­Ø§Ø±Ø¨',    cost:30,  type:'badge',  rarity:'rare',       durationDays:7, desc_en:'Exclusive family warrior badge', desc_ar:'Ø´Ø§Ø±Ø© Ù…Ø­Ø§Ø±Ø¨ Ø­ØµØ±ÙŠØ© Ù„Ù„Ø¹Ø§Ø¦Ù„Ø©' },
    { id:'fs2', emoji:'ðŸ›¡ï¸', name_en:'Shield Badge',    name_ar:'Ø´Ø§Ø±Ø© Ø§Ù„Ø¯Ø±Ø¹',      cost:50,  type:'badge',  rarity:'rare',       durationDays:7, desc_en:'Honor shield badge',             desc_ar:'Ø´Ø§Ø±Ø© Ø¯Ø±Ø¹ Ø§Ù„Ø´Ø±Ù' },
    { id:'fs3', emoji:'ðŸ‘‘', name_en:'Crown Badge',     name_ar:'Ø´Ø§Ø±Ø© Ø§Ù„ØªØ§Ø¬',      cost:100, type:'badge',  rarity:'epic',       durationDays:7, desc_en:'Royal crown clan badge',         desc_ar:'Ø´Ø§Ø±Ø© ØªØ§Ø¬ Ù…Ù„ÙƒÙŠ' },
    { id:'fs4', emoji:'ðŸ”¥', name_en:'Flame Badge',     name_ar:'Ø´Ø§Ø±Ø© Ø§Ù„Ù„Ù‡Ø¨',      cost:40,  type:'badge',  rarity:'rare',       durationDays:7, desc_en:'Blazing fire badge',             desc_ar:'Ø´Ø§Ø±Ø© Ø§Ù„Ù„Ù‡Ø¨ Ø§Ù„Ù…Ø´ØªØ¹Ù„' },
    { id:'fs5', emoji:'âš¡', name_en:'Thunder Badge',   name_ar:'Ø´Ø§Ø±Ø© Ø§Ù„Ø±Ø¹Ø¯',      cost:40,  type:'badge',  rarity:'rare',       durationDays:7, desc_en:'Lightning thunder badge',        desc_ar:'Ø´Ø§Ø±Ø© ØµØ§Ø¹Ù‚Ø© Ø§Ù„Ø±Ø¹Ø¯' },
    { id:'fs6', emoji:'ðŸŒŸ', name_en:'Star Badge',      name_ar:'Ø´Ø§Ø±Ø© Ø§Ù„Ù†Ø¬Ù…Ø©',     cost:75,  type:'badge',  rarity:'epic',       durationDays:7, desc_en:'Shining star clan badge',        desc_ar:'Ø´Ø§Ø±Ø© Ù†Ø¬Ù…Ø© Ø¹Ø§Ø¦Ù„Ø© Ù…Ø¶ÙŠØ¦Ø©' },
    { id:'fs7', emoji:'ðŸ’Ž', name_en:'Diamond Badge',   name_ar:'Ø´Ø§Ø±Ø© Ø§Ù„Ø£Ù„Ù…Ø§Ø³',    cost:150, type:'badge',  rarity:'legendary',  durationDays:7, desc_en:'Legendary diamond badge',        desc_ar:'Ø´Ø§Ø±Ø© Ø£Ù„Ù…Ø§Ø³ Ø£Ø³Ø·ÙˆØ±ÙŠØ©' },
    { id:'fs8', emoji:'ðŸ†', name_en:'Trophy Badge',    name_ar:'Ø´Ø§Ø±Ø© Ø§Ù„ÙƒØ£Ø³',      cost:200, type:'badge',  rarity:'legendary',  durationDays:7, desc_en:'Champion trophy badge',          desc_ar:'Ø´Ø§Ø±Ø© ÙƒØ£Ø³ Ø§Ù„Ø¨Ø·ÙˆÙ„Ø©' },
    { id:'fs9', emoji:'ðŸ‰', name_en:'Dragon Title',    name_ar:'Ù„Ù‚Ø¨ Ø§Ù„ØªÙ†ÙŠÙ†',       cost:300, type:'title',  rarity:'legendary',  durationDays:7, desc_en:'Exclusive dragon clan title',    desc_ar:'Ù„Ù‚Ø¨ Ø§Ù„ØªÙ†ÙŠÙ† Ø§Ù„Ø­ØµØ±ÙŠ Ù„Ù„Ø¹Ø§Ø¦Ù„Ø©' },
    { id:'fs10', emoji:'ðŸ¦', name_en:'Lion Title',     name_ar:'Ù„Ù‚Ø¨ Ø§Ù„Ø£Ø³Ø¯',        cost:250, type:'title',  rarity:'epic',       durationDays:7, desc_en:'Pride of the clan lion title',   desc_ar:'Ù„Ù‚Ø¨ Ø£Ø³Ø¯ ÙØ®Ø± Ø§Ù„Ø¹Ø§Ø¦Ù„Ø©' },
];

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸªª ID ICON CONFIG â€” Ø£ÙŠÙ‚ÙˆÙ†Ø© Ù‚Ø¨Ù„ Ø±Ù‚Ù… Ø§Ù„Ù€ ID ÙÙŠ Ø§Ù„Ø¨Ø±ÙˆÙØ§ÙŠÙ„
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Ø§Ù„Ø£ÙŠÙ‚ÙˆÙ†Ø© Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠØ© Ù„ÙƒÙ„ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† (Ø¶Ø¹ Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø©/GIF Ø£Ùˆ null Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… ðŸªª)
var ID_ICON_IMAGE_URL = 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idon.png'; // â† Ø¶Ø¹ Ø±Ø§Ø¨Ø· Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ø¹Ø§Ù…Ø© Ù‡Ù†Ø§ (Ù„ÙƒÙ„ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†)

// Ø£ÙŠÙ‚ÙˆÙ†Ø§Øª Ù…Ù…ÙŠØ²Ø© Ø­ØµØ±ÙŠØ© Ù„Ù€ VIP 6 â†’ 10
// Ù‡Ø°Ù‡ ØªÙØ¶Ø§Ù Ø£ÙŠØ¶Ø§Ù‹ ÙÙŠ VIP_CONFIG Ø¯Ø§Ø®Ù„ 17-vip.js Ø¨Ù†ÙØ³ Ø§Ù„Ø­Ù‚Ù„ idIconImageUrl
// Ù„ÙƒÙ† ÙŠÙ…ÙƒÙ†Ùƒ ØªØ¹ÙŠÙŠÙ†Ù‡Ø§ Ù‡Ù†Ø§ Ù…Ø±ÙƒØ²ÙŠØ§Ù‹ Ù„Ù„Ø±Ø¬ÙˆØ¹ Ø¥Ù„ÙŠÙ‡Ø§ Ø¨Ø³Ù‡ÙˆÙ„Ø©
var VIP_ID_ICONS = {
    6:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idvip.png', // â† VIP 6:  Ø¶Ø¹ Ø±Ø§Ø¨Ø· Ø§Ù„Ø£ÙŠÙ‚ÙˆÙ†Ø© Ø§Ù„Ø°Ù‡Ø¨ÙŠØ© Ù‡Ù†Ø§
    7:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idvip6.png', // â† VIP 7:  Ø¶Ø¹ Ø±Ø§Ø¨Ø· Ø§Ù„Ø£ÙŠÙ‚ÙˆÙ†Ø© Ø§Ù„Ù…Ù…ÙŠØ²Ø© Ù‡Ù†Ø§
    8:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idvip7.png', // â† VIP 8:  Ø¶Ø¹ Ø±Ø§Ø¨Ø· Ø§Ù„Ø£ÙŠÙ‚ÙˆÙ†Ø© Ø§Ù„Ù…Ù…ÙŠØ²Ø© Ù‡Ù†Ø§
    9:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idvip8.png', // â† VIP 9:  Ø¶Ø¹ Ø±Ø§Ø¨Ø· Ø§Ù„Ø£ÙŠÙ‚ÙˆÙ†Ø© Ø§Ù„Ø£Ù†ÙŠÙ…Ø´Ù† Ù‡Ù†Ø§
    10: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idvip10.png', // â† VIP 10: Ø¶Ø¹ Ø±Ø§Ø¨Ø· Ø§Ù„Ø£ÙŠÙ‚ÙˆÙ†Ø© Ø§Ù„Ø£Ø³Ø·ÙˆØ±ÙŠØ© Ù‡Ù†Ø§
};
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ”¢ fmtNum â€” Ø¯Ø§Ù„Ø© Ù…ÙˆØ­Ø¯Ø© Ù„ØªÙ†Ø³ÙŠÙ‚ Ø§Ù„Ø£Ø±Ù‚Ø§Ù… (K / M)
// Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…: fmtNum(1500) â†’ '1.5K' | fmtNum(2000000) â†’ '2.0M'
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var fmtNum = (n) => {
    if (n === undefined || n === null) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
    return String(n);
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ´ getFamilySignURL â€” Ø¯Ø§Ù„Ø© Ù…ÙˆØ­Ø¯Ø© Ù„Ø¬Ù„Ø¨ ØµÙˆØ±Ø© Ø³Ø§ÙŠÙ† Ø§Ù„Ø¹Ø§Ø¦Ù„Ø©
// Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…: getFamilySignURL(userData) â†’ URL | null
// ØªØ­Ù„ Ù…Ø­Ù„ 7 Ø£Ù…Ø§ÙƒÙ† ØªÙƒØ±Ø§Ø± Ù„Ù†ÙØ³ Ø§Ù„Ù…Ù†Ø·Ù‚ Ø¹Ø¨Ø± Ø§Ù„ÙƒÙˆØ¯
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var getFamilySignURL = (data) => {
    if (!data) return null;
    if (data.familySignImageURL) return data.familySignImageURL;
    var level = data.familySignLevel;
    if (!level || typeof FAMILY_SIGN_IMAGES === 'undefined') return null;
    var cfg = FAMILY_SIGN_IMAGES.find(s => s.level === level);
    return cfg?.imageURL || null;
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ‘‘ getVIPConfig â€” Ø¯Ø§Ù„Ø© Ù…ÙˆØ­Ø¯Ø© Ù„Ø¬Ù„Ø¨ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª VIP
// Ø¨Ø¯Ù„Ø§Ù‹ Ù…Ù†: VIP_CONFIG[Math.min(vipLevel-1, VIP_CONFIG.length-1)]
// Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…: const vipCfg = getVIPConfig(vipLevel)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var getVIPConfig = (vipLevel) => {
    if (!vipLevel || vipLevel <= 0 || typeof VIP_CONFIG === 'undefined') return null;
    return VIP_CONFIG[Math.min(vipLevel - 1, VIP_CONFIG.length - 1)] || null;
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// â±ï¸ TS â€” Ø§Ø®ØªØµØ§Ø± Ù„Ù€ firebase.firestore.FieldValue.serverTimestamp()
// Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…: createdAt: TS()
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var TS = () => firebase.firestore.FieldValue.serverTimestamp();

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ‘¤ fetchMiniProfileData â€” Ø¯Ø§Ù„Ø© Ù…ÙˆØ­Ø¯Ø© Ù„Ø¬Ù„Ø¨ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙŠÙ†ÙŠ Ø¨Ø±ÙˆÙØ§ÙŠÙ„
// ØªØ­Ù„ Ù…Ø­Ù„ 4 Ù†Ø³Ø® Ù…ØªØ·Ø§Ø¨Ù‚Ø© ÙÙŠ: 09, 13, 14, 19
//
// Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:
//   const data = await fetchMiniProfileData(uid, myFriendsList);
//   if (data) setMiniProfile(data);
//
// myFriendsList â€” Ù…ØµÙÙˆÙØ© Ø§Ù„Ù€ UIDs Ø§Ù„Ù„ÙŠ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø£ØµØ¯Ù‚Ø§Ø¤Ù‡Ù… (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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

// ðŸ”Š AUDIO SYSTEM`

