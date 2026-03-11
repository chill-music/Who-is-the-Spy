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
    'PfZAViU4swQdbBZOfqJDnPZSs9l2', // ← ضع الـ UID بتاعك هنا
];
const isAdmin = (uid) => uid && ADMIN_UIDS.includes(uid);

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

// 🔊 AUDIO SYSTEM
