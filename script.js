// ==========================================
// PRO SPY - COMPLETE SCRIPT - PART 1
// All Improvements + Notifications + Chat + Gifts
// + Animated Images Support + Multiple Badges
// ==========================================

const { useState, useEffect, useRef, useCallback, useMemo } = React;

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

// --- Constants ---
const CURRENCY_NAME = "Intel";
const CURRENCY_ICON = "🧠";
const MAX_ROUNDS = 3;
const MAX_BADGES = 10; // NEW: Maximum number of badges

// ==========================================
// NEW: ANIMATED IMAGE DETECTION
// ==========================================
const isAnimatedImage = (item) => {
    // 1. If manually specified
    if (item?.isAnimated === true) return true;
    if (item?.isAnimated === false) return false;
    
    // 2. Check preview URL for GIF
    if (item?.preview && typeof item.preview === 'string') {
        return item.preview.toLowerCase().endsWith('.gif');
    }
    
    // 3. Check imageUrl for GIF
    if (item?.imageUrl && typeof item.imageUrl === 'string') {
        return item.imageUrl.toLowerCase().endsWith('.gif');
    }
    
    return false;
};

// ==========================================
// CHARISMA LEVELS - 21 Levels with Images
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

// --- Random Cashback Generator ---
const generateRandomCashback = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ==========================================
// SHOP ITEMS - WITH IMAGE URL SUPPORT
// ==========================================
const SHOP_ITEMS = {
    frames: [
        { id: 'frame_gold', name_en: "Gold Frame", name_ar: "إطار ذهبي", cost: 500, type: 'frames', preview: 'linear-gradient(45deg, #f7ff00, #db9700)' },
        { id: 'frame_neon', name_en: "Neon Frame", name_ar: "إطار نيون", cost: 300, type: 'frames', preview: 'linear-gradient(45deg, #00f2ff, #7000ff)' },
        { id: 'frame_fire', name_en: "Fire Frame", name_ar: "إطار نار", cost: 400, type: 'frames', preview: 'linear-gradient(45deg, #ff0055, #ff8800)' },
        { id: 'frame_img', name_en: "Image Frame", name_ar: "إطار صورة", cost: 100, type: 'frames', preview: 'https://i.ibb.co/mVQTLr2D/Untitled-3.png' },
        { id: 'frame_gif', name_en: "GIF Frame", name_ar: "إطار متحرك", cost: 0, type: 'frames', preview: 'https://i.ibb.co/1tvtgmD8/ezgif-com-optimize.gif', isAnimated: true },
        { id: 'shehab', name_en: "Shehab Frame", name_ar: "إطار شهاب", cost: 100, type: 'frames', preview: 'https://i.ibb.co/n8Bj9dSk/ezgif-com-animated-gif-maker-1.gif', isAnimated: true },
        { id: 'frame_rainbow', name_en: "Rainbow Frame", name_ar: "إطار قوس قزح", cost: 600, type: 'frames', preview: 'https://i.ibb.co/1tvtgmD8/ezgif-com-optimize.gif', isAnimated: true },
        { id: 'frame_ice', name_en: "Ice Frame", name_ar: "إطار جليد", cost: 350, type: 'frames', preview: 'linear-gradient(45deg, #00d4ff, #ffffff, #00d4ff)' },
    ],
    // Titles with imageUrl support - if imageUrl exists, show as image; otherwise show as text with background
    titles: [
        { id: 'title_spy', name_en: "Mr. Spy", name_ar: "سيد جاسوس", cost: 600, type: 'titles', preview: '🕵️', imageUrl: '' },
        { id: 'title_hunter', name_en: "Hunter", name_ar: "صياد", cost: 450, type: 'titles', preview: '🎯', imageUrl: '' },
        { id: 'title_ghost', name_en: "Ghost", name_ar: "شبح", cost: 800, type: 'titles', preview: '👻', imageUrl: '' },
        { id: 'title_legend', name_en: "Legend", name_ar: "أسطورة", cost: 1500, type: 'titles', preview: '👑', imageUrl: '' },
        { id: 'title_pro', name_en: "Pro Player", name_ar: "محترف", cost: 1000, type: 'titles', preview: '⭐', imageUrl: '' },
        { id: 'title_shadow', name_en: "Shadow", name_ar: "ظل", cost: 700, type: 'titles', preview: '', imageUrl: 'https://i.ibb.co/xqk8md71/122222.png' },
    ],
    // Badges with imageUrl support
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
        { id: 'theme_forest', name_en: "Forest", name_ar: "غابة", cost: 300, type: 'themes' },
    ],
    // Gifts with full details
    gifts: [
        { id: 'gift_rose', name_en: "Rose", name_ar: "وردة", cost: 1, type: 'gifts', charisma: 10, minCashback: 1, maxCashback: 50, desc_ar: "عبّر عن مشاعرك", desc_en: "Express your feelings", emoji: "🌹", imageUrl: "" },
        { id: 'gift_candy', name_en: "Candy", name_ar: "حلوى", cost: 2, type: 'gifts', charisma: 20, minCashback: 1, maxCashback: 100, desc_ar: "حلاوة تُفرح القلب", desc_en: "Sweetness for the heart", emoji: "🍬", imageUrl: "" },
        { id: 'gift_cookie', name_en: "Cookie", name_ar: "بسكويت", cost: 3, type: 'gifts', charisma: 30, minCashback: 1, maxCashback: 150, desc_ar: "بسكويت لذيذ", desc_en: "Delicious cookie", emoji: "🍪", imageUrl: "" },
        { id: 'gift_chocolate', name_en: "Chocolate", name_ar: "شوكولاتة", cost: 5, type: 'gifts', charisma: 55, minCashback: 1, maxCashback: 250, desc_ar: "شوكولاتة فاخرة", desc_en: "Premium chocolate", emoji: "🍫", imageUrl: "" },
        { id: 'gift_icecream', name_en: "Ice Cream", name_ar: "آيس كريم", cost: 5, type: 'gifts', charisma: 55, minCashback: 1, maxCashback: 250, desc_ar: "برّد على قلبك", desc_en: "Cool down your heart", emoji: "🍦", imageUrl: "" },
        { id: 'gift_coffee', name_en: "Coffee", name_ar: "قهوة", cost: 8, type: 'gifts', charisma: 80, minCashback: 1, maxCashback: 400, desc_ar: "قهوة صباحية", desc_en: "Morning coffee", emoji: "☕", imageUrl: "" },
        { id: 'gift_heart', name_en: "Heart", name_ar: "قلب", cost: 10, type: 'gifts', charisma: 120, minCashback: 1, maxCashback: 500, desc_ar: "نبض الحب", desc_en: "Pulse of love", emoji: "❤️", imageUrl: "" },
        { id: 'gift_cake', name_en: "Cake", name_ar: "كيكة", cost: 15, type: 'gifts', charisma: 180, minCashback: 1, maxCashback: 750, desc_ar: "كيكة للاحتفال", desc_en: "Celebration cake", emoji: "🎂", imageUrl: "" },
        { id: 'gift_flower', name_en: "Bouquet", name_ar: "باقة ورد", cost: 20, type: 'gifts', charisma: 250, minCashback: 1, maxCashback: 1000, desc_ar: "باقة جميلة", desc_en: "Beautiful bouquet", emoji: "💐", imageUrl: "" },
        { id: 'gift_pizza', name_en: "Pizza", name_ar: "بيتزا", cost: 20, type: 'gifts', charisma: 250, minCashback: 1, maxCashback: 1000, desc_ar: "وليمة لذيذة", desc_en: "Delicious feast", emoji: "🍕", imageUrl: "" },
        { id: 'gift_burger', name_en: "Burger", name_ar: "برجر", cost: 25, type: 'gifts', charisma: 300, minCashback: 1, maxCashback: 1250, desc_ar: "برجر شهي", desc_en: "Juicy burger", emoji: "🍔", imageUrl: "" },
        { id: 'gift_teddy', name_en: "Teddy Bear", name_ar: "دب Teddy", cost: 30, type: 'gifts', charisma: 350, minCashback: 1, maxCashback: 1500, desc_ar: "دب قطني ناعم", desc_en: "Soft teddy bear", emoji: "🧸", imageUrl: "" },
        { id: 'gift_donut', name_en: "Donut", name_ar: "دونات", cost: 40, type: 'gifts', charisma: 450, minCashback: 1, maxCashback: 2000, desc_ar: "دونات محلاة", desc_en: "Glazed donut", emoji: "🍩", imageUrl: "" },
        { id: 'gift_star', name_en: "Star", name_ar: "نجمة", cost: 50, type: 'gifts', charisma: 600, minCashback: 1, maxCashback: 2500, desc_ar: "نجمة ساطعة", desc_en: "Shining star", emoji: "⭐", imageUrl: "" },
        { id: 'gift_gem', name_en: "Gem", name_ar: "جوهرة", cost: 75, type: 'gifts', charisma: 900, minCashback: 1, maxCashback: 3750, desc_ar: "جوهرة ثمينة", desc_en: "Precious gem", emoji: "💎", imageUrl: "" },
        { id: 'gift_crown', name_en: "Crown", name_ar: "تاج", cost: 80, type: 'gifts', charisma: 1000, minCashback: 1, maxCashback: 4000, desc_ar: "تاج ملكي", desc_en: "Royal crown", emoji: "👑", imageUrl: "" },
        { id: 'gift_trophy', name_en: "Trophy", name_ar: "كأس", cost: 100, type: 'gifts', charisma: 1200, minCashback: 1, maxCashback: 5000, desc_ar: "كأس الفوز", desc_en: "Victory trophy", emoji: "🏆", imageUrl: "" },
        { id: 'gift_ring', name_en: "Ring", name_ar: "خاتم", cost: 100, type: 'gifts', charisma: 1200, minCashback: 1, maxCashback: 5000, desc_ar: "خاتم الأناقة", desc_en: "Elegant ring", emoji: "💍", imageUrl: "" },
        { id: 'gift_rocket', name_en: "Rocket", name_ar: "صاروخ", cost: 150, type: 'gifts', charisma: 1800, minCashback: 1, maxCashback: 7500, desc_ar: "انطلق للنجوم", desc_en: "Launch to stars", emoji: "🚀", imageUrl: "" },
        { id: 'gift_robot', name_en: "Robot", name_ar: "روبوت", cost: 200, type: 'gifts', charisma: 2400, minCashback: 1, maxCashback: 10000, desc_ar: "روبوت ذكي", desc_en: "Smart robot", emoji: "🤖", imageUrl: "" },
        { id: 'gift_unicorn', name_en: "Unicorn", name_ar: "يونيكورن", cost: 250, type: 'gifts', charisma: 3200, minCashback: 1, maxCashback: 12000, desc_ar: "حصان سحري", desc_en: "Magical unicorn", emoji: "🦄", imageUrl: "" },
        { id: 'gift_motorbike', name_en: "Motorbike", name_ar: "موتوسيكل", cost: 250, type: 'gifts', charisma: 3200, minCashback: 1, maxCashback: 12000, desc_ar: "سرعة وكاريزما", desc_en: "Speed and charisma", emoji: "🏍️", imageUrl: "" },
        { id: 'gift_crystal', name_en: "Crystal", name_ar: "كريستال", cost: 300, type: 'gifts', charisma: 4000, minCashback: 1, maxCashback: 15000, desc_ar: "كريستال نادر", desc_en: "Rare crystal", emoji: "🔮", imageUrl: "" },
        { id: 'gift_racecar', name_en: "Race Car", name_ar: "سيارة سباق", cost: 500, type: 'gifts', charisma: 7000, minCashback: 1, maxCashback: 25000, desc_ar: "انطلق كالمحترفين", desc_en: "Race like a pro", emoji: "🏎️", imageUrl: "" },
        { id: 'gift_castle', name_en: "Castle", name_ar: "قصر", cost: 750, type: 'gifts', charisma: 10000, minCashback: 1, maxCashback: 37500, desc_ar: "قصر ملكي فخم", desc_en: "Luxury castle", emoji: "🏰", imageUrl: "" },
        { id: 'gift_yacht', name_en: "Yacht", name_ar: "يخت", cost: 1000, type: 'gifts', charisma: 15000, minCashback: 1, maxCashback: 50000, desc_ar: "فخامة الملوك", desc_en: "Royal luxury", emoji: "🛥️", imageUrl: "" },
        { id: 'gift_diamond', name_en: "Diamond", name_ar: "ماسة", cost: 1500, type: 'gifts', charisma: 20000, minCashback: 1, maxCashback: 75000, desc_ar: "ماسة نادرة", desc_en: "Rare diamond", emoji: "💠", imageUrl: "" },
        { id: 'gift_spaceship', name_en: "Spaceship", name_ar: "مركبة فضائية", cost: 2000, type: 'gifts', charisma: 30000, minCashback: 1, maxCashback: 100000, desc_ar: "استكشف الفضاء", desc_en: "Explore space", emoji: "🛸", imageUrl: "" },
        { id: 'gift_jet', name_en: "Private Jet", name_ar: "طائرة خاصة", cost: 5000, type: 'gifts', charisma: 85000, minCashback: 1, maxCashback: 120000, desc_ar: "حلّق في سماء الكاريزما", desc_en: "Soar in charisma skies", emoji: "✈️", imageUrl: "" },
        { id: 'gift_island', name_en: "Private Island", name_ar: "جزيرة خاصة", cost: 10000, type: 'gifts', charisma: 180000, minCashback: 1, maxCashback: 120000, desc_ar: "أمتلك عالمك الخاص", desc_en: "Own your world", emoji: "🏝️", imageUrl: "" },
        { id: 'gift_planet', name_en: "Planet", name_ar: "كوكب", cost: 10000, type: 'gifts', charisma: 200000, minCashback: 1, maxCashback: 120000, desc_ar: "كوكب خاص بك", desc_en: "Your own planet", emoji: "🪐", imageUrl: "" },
        { id: 'gift_galaxy', name_en: "Galaxy", name_ar: "مجرة", cost: 10000, type: 'gifts', charisma: 220000, minCashback: 1, maxCashback: 120000, desc_ar: "مجرة كاملة ملكك", desc_en: "Your own galaxy", emoji: "🌌", imageUrl: "" },
        { id: 'gift_dragon', name_en: "Dragon", name_ar: "تنين", cost: 10000, type: 'gifts', charisma: 210000, minCashback: 1, maxCashback: 120000, desc_ar: "تنين أسطوري", desc_en: "Legendary dragon", emoji: "🐉", imageUrl: "" },
        { id: 'gift_moon', name_en: "Moon", name_ar: "قمر", cost: 50000, type: 'gifts', charisma: 700000, minCashback: 1, maxCashback: 120000, desc_ar: "قمر خاص بك", desc_en: "Your own moon", emoji: "🌙", imageUrl: "" },
        { id: 'gift_sun', name_en: "Sun", name_ar: "شمس", cost: 50000, type: 'gifts', charisma: 750000, minCashback: 1, maxCashback: 120000, desc_ar: "شمس ساطعة", desc_en: "Shining sun", emoji: "☀️", imageUrl: "" },
        { id: 'gift_ocean', name_en: "Ocean", name_ar: "محيط", cost: 80000, type: 'gifts', charisma: 1200000, minCashback: 1, maxCashback: 120000, desc_ar: "محيط واسع", desc_en: "Boundless ocean", emoji: "🌊", imageUrl: "" },
        { id: 'gift_world', name_en: "World", name_ar: "عالم", cost: 100000, type: 'gifts', charisma: 1700000, minCashback: 1, maxCashback: 120000, desc_ar: "عالم كامل ملكك", desc_en: "Your own world", emoji: "🌍", imageUrl: "" },
        { id: 'gift_universe', name_en: "Universe", name_ar: "كون", cost: 100000, type: 'gifts', charisma: 1900000, minCashback: 1, maxCashback: 120000, desc_ar: "كون كامل ملكك", desc_en: "Your own universe", emoji: "🌌", imageUrl: "" },
        { id: 'gift_multiverse', name_en: "Multiverse", name_ar: "متعدد أكوان", cost: 150000, type: 'gifts', charisma: 2500000, minCashback: 1, maxCashback: 120000, desc_ar: "متعدد أكوان خاص", desc_en: "Your multiverse", emoji: "🪐", imageUrl: "" },
        { id: 'gift_ultimate', name_en: "Ultimate Gift", name_ar: "الهدية المطلقة", cost: 150000, type: 'gifts', charisma: 3500000, minCashback: 1, maxCashback: 120000, desc_ar: "أعظم هدية", desc_en: "The ultimate gift", emoji: "🏆", imageUrl: "" },
    ]
};

// --- Achievements ---
const ACHIEVEMENTS = [ 
    { id: 'first_win', name_en: "First Blood", name_ar: "أول دم", icon: "🩸", desc_en: "Win your first game.", desc_ar: "افوز اول لعبة لك.", hidden: false }, 
    { id: 'wins_5', name_en: "Rookie Spy", name_ar: "جاسوس مبتدئ", icon: "🔰", desc_en: "Win 5 games.", desc_ar: "افوز 5 مرات.", hidden: false },
    { id: 'wins_10', name_en: "Field Agent", name_ar: "عميل ميداني", icon: "🔫", desc_en: "Win 10 games.", desc_ar: "افوز 10 مرات.", hidden: false }, 
    { id: 'wins_20', name_en: "Master of Disguise", name_ar: "سيد التنكر", icon: "🎭", desc_en: "Win 20 games.", desc_ar: "افوز 20 مرة.", hidden: false }, 
    { id: 'wins_50', name_en: "Shadow Legend", name_ar: "أسطورة الظل", icon: "👁️", desc_en: "Win 50 games.", desc_ar: "افوز 50 مرة.", hidden: false }, 
    { id: 'wins_100', name_en: "Immortal", name_ar: "خالد", icon: "👑", special: true, desc_en: "Win 100 games.", desc_ar: "افوز 100 مرة.", hidden: false },
    { id: 'level_5', name_en: "Rising Star", name_ar: "نجم صاعد", icon: "⭐", desc_en: "Reach Level 5.", desc_ar: "الوصول للمستوى 5.", hidden: false },
    { id: 'level_10', name_en: "Veteran", name_ar: "محارب قديم", icon: "🛡️", desc_en: "Reach Level 10.", desc_ar: "الوصول للمستوى 10.", hidden: false },
    { id: 'ghost_protocol', name_en: "Ghost Protocol", name_ar: "بروتوكول الشبح", icon: "👻", desc_en: "Win a game without anyone voting for you.", desc_ar: "اربح لعبة دون أن يصوت عليك أحد.", hidden: true },
    { id: 'mr_white_lucky', name_en: "Lucky Guess", name_ar: "تخمين محظوظ", icon: "🎲", desc_en: "Win as Mr. White by guessing correctly.", desc_ar: "اربح كالسيد أبيض عن طريق التخمين الصحيح.", hidden: true },
    { id: 'charisma_1000', name_en: "Charming", name_ar: "ساحر", icon: "✨", desc_en: "Reach 1000 Charisma.", desc_ar: "الوصول لـ 1000 كاريزما.", hidden: false },
    { id: 'charisma_10000', name_en: "Celebrity", name_ar: "مشهور", icon: "🌟", desc_en: "Reach 10000 Charisma.", desc_ar: "الوصول لـ 10000 كاريزما.", hidden: false },
    { id: 'charisma_100000', name_en: "Icon", name_ar: "أيقونة", icon: "💎", desc_en: "Reach 100000 Charisma.", desc_ar: "الوصول لـ 100000 كاريزما.", hidden: false },
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

const EMOJI_LIST = ['😀', '😂', '😍', '🤔', '😎', '🤫', '😡', '🤢', '😴', '🤯', '😤', '🥺', '😱', '🤬', '💀', '👻', '👾', '🤖', '💩', '😈', '👁️', '🧠', '🦷', '🦴', '👀', '👊', '✌️', '🤞', '🤟', '👌', '🤙', '👈', '👉', '☝️', '👆', '👇', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏', '💪', '❤️', '💔', '💕', '💖', '💗', '💘', '💝', '💞', '💟', '🔥', '⭐', '🌟', '✨', '💫', '🎉', '🎊', '🎁', '🎈', '🎀', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🎮', '🎲', '🎯', '🎵', '🎶', '🎤', '🎧', '📷', '💻', '📱', '💰', '💵', '💎', '👑', '🎩', '🚀', '✈️', '🛸'];

// --- Helper Functions ---
const generateUID = () => Math.floor(100000 + Math.random() * 900000).toString();
const calculateLevel = (xp) => Math.floor(xp / 100) + 1;
const calculateXPProgress = (xp) => (xp % 100);
const getChatId = (id1, id2) => [id1, id2].sort().join('_');
const formatTime = (timestamp) => { if (!timestamp) return ''; const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp); return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
const formatDate = (timestamp) => { if (!timestamp) return 'N/A'; const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp); return date.toLocaleDateString() + ' ' + date.toLocaleTimeString(); };
const formatDuration = (ms) => { const totalSeconds = Math.floor(ms / 1000); const minutes = Math.floor(totalSeconds / 60); const seconds = totalSeconds % 60; return `${minutes}m ${seconds}s`; };
const formatCharisma = (num) => { if (num === undefined || num === null) return '0'; if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'; if (num >= 1000) return (num / 1000).toFixed(1) + 'K'; return num.toString(); };

// --- Email Masking Function ---
const maskEmail = (email) => {
    if (!email) return 'N/A';
    const [localPart, domain] = email.split('@');
    if (!domain) return email;
    const visibleChars = Math.min(2, localPart.length);
    const maskedPart = localPart.substring(0, visibleChars) + '***';
    return `${maskedPart}@${domain}`;
};

// --- Audio System ---
const AudioCtx = window.AudioContext || window.webkitAudioContext; 
let audioCtx = null;

const initAudio = () => { if (!audioCtx) audioCtx = new AudioCtx(); };

const playSound = (type) => { 
    if (!audioCtx) return; 
    if (audioCtx.state === 'suspended') audioCtx.resume(); 
    const osc = audioCtx.createOscillator(); 
    const gainNode = audioCtx.createGain(); 
    osc.connect(gainNode); 
    gainNode.connect(audioCtx.destination); 
    
    if (type === 'click') { 
        osc.frequency.value = 800; 
        osc.type = 'sine'; 
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); 
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1); 
        osc.start(); 
        osc.stop(audioCtx.currentTime + 0.1); 
    } else if (type === 'success') { 
        osc.frequency.value = 600; 
        osc.type = 'sine'; 
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); 
        osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.15); 
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3); 
        osc.start(); 
        osc.stop(audioCtx.currentTime + 0.3); 
    } else if (type === 'gift') {
        osc.frequency.value = 523;
        osc.type = 'sine';
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(784, audioCtx.currentTime + 0.15);
        osc.frequency.linearRampToValueAtTime(1047, audioCtx.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'notification') {
        osc.frequency.value = 880;
        osc.type = 'sine';
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(1100, audioCtx.currentTime + 0.1);
        osc.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'message') {
        osc.frequency.value = 600;
        osc.type = 'sine';
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    }
};

const playNotificationSound = () => { playSound('notification'); };
const playMessageSound = () => { playSound('message'); };

// --- Translations ---
const TRANSLATIONS = { 
    en: { 
        appName: "PRO SPY", tagline: "COVERT ARENA", nickname: "OPERATOR NAME", create: "CREATE GAME", join: "JOIN OPS", browse: "BROWSE ROOMS", players: "OPERATIVES", start: "LAUNCH MISSION", langBtn: "العربية", loading: "PROCESSING...", you: "YOU", statusSpy: "SPY", statusAgent: "AGENT", statusInformant: "INFORMANT", statusMrWhite: "MR. WHITE", statusGhost: "GHOST", round: "ROUND", skip: "SKIP TURN", vote: "VOTE TO EJECT", chatPlaceholder: "Type message...", send: "SEND", waiting: "Awaiting host...", location: "LOCATION", spectator: "SPECTATOR", confirm: "CONFIRM VOTE", spyWin: "SPY WINS!", agentsWin: "AGENTS WIN!", mrWhiteWin: "MR. WHITE WINS!", playAgain: "PLAY AGAIN", connecting: "Connecting...", startVoting: "START VOTING", votingStarted: "VOTING INITIATED", voteRequestTitle: "VOTING REQUEST", voteRequestDesc: "wants to start voting.", agree: "AGREE", decline: "DECLINE", endVoting: "END VOTING NOW", votesTitle: "VOTES:", roundsFormat: (c, m) => `ROUND ${c}/${m}`, wordSelectionTitle: "SELECT KEYWORD", wordSelectionDesc: "Choose a keyword for this round", finishSelection: "FINISH SELECTION", selectedWord: "Selected Keyword", loginGoogle: "Login with Google", myAccount: "My Account", logout: "Logout", profile: "Profile", guest: "Guest", linkGuessCard: "GUESS MY CARD", level: "Level", wins: "Wins", losses: "Losses", winRate: "Win Rate", totalGames: "Games", achievements: "Achievements", id: "ID", enterCodeError: "Please enter a room code.", changeName: "Change Name", nameChangeLimit: "Once a month", copied: "Copied!", save: "Save", or: "OR", needPlayers: "Minimum players not met!", ok: "OK", tabLobby: "Lobby", tabLeaderboard: "Leaderboard", tabFriends: "Friends", addFriend: "Add Friend", friendIdPlaceholder: "Enter Friend ID", online: "Online", offline: "Offline", noFriends: "No friends yet.", friendAdded: "Friend Added!", friendNotFound: "User not found.", requestSent: "Request Sent!", incomingRequests: "Incoming Requests", noRequests: "No pending requests.", accept: "Accept", reject: "Reject", sendMessage: "Send", inviteBtn: "Invite", invitedYou: "invited you to play.", joinInvite: "Join?", inviteFriends: "Invite Friends", accountInfo: "Account Information", email: "Email", memberSince: "Member Since", nameChangeCountdown: "Name Change In", canChangeNow: "Can change now!", selectEmoji: "Emoji", guestTitle: "GUEST ACCOUNT", guestDesc: "Register to save progress and add friends.", kd: "K/D Ratio", stats: "Stats", noPermission: "Feature unavailable for guests.", normalMode: "NORMAL MODE", advancedMode: "ADVANCED MODE (6+)", modeNormalDesc: "Classic Spy vs Agents. 3-10 Players.", modeAdvDesc: "Special Roles included! 6-10 Players.", privateRoom: "Private Room", password: "Password", publicRoom: "Public Room", noRooms: "No active games found.", lobbyTitle: "GAME LOBBY", mrWhiteInstruction: "Guess the location to win!", informantInstruction: "You know a neighbor!", ghostInstruction: "You are now a Ghost. You can watch but cannot act.", guessLocation: "GUESS LOCATION", leaveRoom: "LEAVE", closeRoom: "CLOSE ROOM", showPassword: "Show Password", guestAccountLabel: "GUEST ACCOUNT", guestProfileMsg: "Guests cannot receive friend requests.", reportUser: "Report User", reportSent: "Report sent successfully!", reportTitle: "Report User", reportDesc: "Please select a reason for reporting this user.", reportReasonAbusive: "Abusive Behavior", reportReasonCheating: "Cheating", reportReasonSpam: "Spam", reportReasonOther: "Other", reportSubmit: "Submit Report", reportCancel: "Cancel", privateRoomError: "Private rooms require a password.",
        shop: "Shop", currency: "Intel", buy: "Buy", owned: "Owned", equip: "Equip", equipped: "Equipped", unequip: "UnEquip", inventory: "Inventory", frames: "Frames", titles: "Titles", themes: "Themes", badges: "Badges", purchaseSuccess: "Purchase Successful!", purchaseFail: "Not enough Intel!", alreadyOwned: "Already Owned",
        tutorialTitle: "Welcome, Agent", tutorialStep1: "Your goal is to find the Spy (or blend in if you are the Spy).", tutorialStep2: "Each round, discuss and vote to eject a suspect.", tutorialStep3: "Win matches to earn Intel and buy items in the Shop!", skipTutorial: "Skip", next: "Next", startGame: "Start Game",
        matchSummary: "Match Summary", matchDuration: "Duration", mvp: "MVP", correctVotes: "Correct Votes", summaryTitle: "Game Over!",
        notifTitle: "Notification", achUnlock: "Achievement Unlocked!", newFriend: "New Friend Added!", hiddenAch: "Hidden Achievement", tabMain: "Main", tabInv: "Inventory", tabAch: "Achievements",
        charisma: "Charisma", charismaDesc: "Your influence in the arena", gifts: "Gifts", sendGift: "Send Gift", giftSent: "Gift Sent!", giftReceived: "You received a gift!", selectGift: "Select a Gift", giftPreview: "Gift Preview", cashback: "Cashback", willReceive: "You'll receive", charismaGain: "Charisma Gain", playerLeft: "Player Left", spyLeftAgentsWin: "Spy left! Agents Win!", agentLeftSpyWins: "Agent left! Spy Wins!", myGifts: "My Gifts", receivedGifts: "Received Gifts", noGifts: "No gifts yet.", fromPlayer: "From", toPlayer: "To", buyGift: "Buy Gift", sendToFriend: "Send to Friend",
        notifications: "Notifications", clearAll: "Clear All", noNotifications: "No notifications", friendRequest: "sent you a friend request", friendRequestAccepted: "accepted your friend request", giftNotification: "sent you a gift", messageNotification: "sent you a message", nextLevel: "Next level", close: "Close",
        sendTo: "Send to", noFriendsToSend: "No friends to send gifts to.", selectFriend: "Select a friend", myInventory: "My Inventory", maxLevel: "MAX LEVEL",
        privateChat: "Private Chat", typeMessage: "Type a message...", noMessages: "No messages yet.",
        codePlaceholder: "CODE",
        luckyCashback: "Lucky Cashback", luckBonus: "Luck Bonus",
        loginRequired: "Login Required",
        showEmail: "Show", hideEmail: "Hide", accountType: "Account Type", googleAccount: "Google Account", guestAccount: "Guest Account",
        playAsGuest: "Play as Guest", continueAsGuest: "Continue as Guest",
        sendGiftToFriend: "Send Gift", giftCharisma: "Charisma", giftCashbackRange: "Cashback",
        maxBadgesReached: "Maximum 10 badges equipped", removeBadgeFirst: "Remove a badge first",
    }, 
    ar: { 
        appName: "برو جاسوس", tagline: "ساحة العمليات", nickname: "اسم العميل", create: "إنشاء لعبة", join: "انضمام", browse: "استعراض الغرف", players: "العملاء", start: "بدء المهمة", langBtn: "English", loading: "جاري التحميل...", you: "أنت", statusSpy: "جاسوس", statusAgent: "عميل", statusInformant: "المخبر", statusMrWhite: "السيد", statusGhost: "شبح", round: "الجولة", skip: "تخطي الدور", vote: "تصويت للطرد", chatPlaceholder: "اكتب رسالة...", send: "إرسال", waiting: "بانتظار المضيف...", location: "الموقع", spectator: "مشاهد", confirm: "تأكيد التصويت", spyWin: "فاز الجاسوس!", agentsWin: "فاز العملاء!", mrWhiteWin: "فاز السيد!", playAgain: "لعب مجدداً", connecting: "جاري التأمين...", startVoting: "بدء التصويت", votingStarted: "بدأ التصويت", voteRequestTitle: "طلب تصويت", voteRequestDesc: "يريد بدء التصويت.", agree: "موافق", decline: "رفض", endVoting: "إنهاء التصويت الآن", votesTitle: "الأصوات:", roundsFormat: (c, m) => `الجولة ${c}/${m}`, wordSelectionTitle: "اختر كلمة السر", wordSelectionDesc: "اختر كلمة سر لهذه الجولة", finishSelection: "إنهاء الاختيار", selectedWord: "كلمة السر", loginGoogle: "تسجيل بواسطة جوجل", myAccount: "حسابي", logout: "تسجيل الخروج", profile: "الملف الشخصي", guest: "زائر", linkGuessCard: "خمن كرتي", level: "المستوى", wins: "فوز", losses: "خسارة", winRate: "نسبة الفوز", totalGames: "المباريات", achievements: "الإنجازات", id: "الرقم", enterCodeError: "برجاء إدخال كود الغرفة.", changeName: "تغيير الاسم", nameChangeLimit: "مرة شهرياً", copied: "تم النسخ!", save: "حفظ", or: "أو", needPlayers: "اللاعبين غير كافيين!", ok: "حسناً", tabLobby: "الرئيسية", tabLeaderboard: "المتصدرين", tabFriends: "الأصدقاء", addFriend: "أضافة صديق", friendIdPlaceholder: "أدخل ID الصديق", online: "متصل", offline: "غير متصل", noFriends: "لا يوجد أصدقاء.", friendAdded: "تمت الإضافة!", friendNotFound: "المستخدم غير موجود.", requestSent: "تم إرسال الطلب!", incomingRequests: "طلبات الصداقة", noRequests: "لا توجد طلبات.", accept: "قبول", reject: "رفض", sendMessage: "إرسال", inviteBtn: "دعوة", invitedYou: "دعاك للعب.", joinInvite: "انضمام؟", inviteFriends: "دعوة أصدقاء", accountInfo: "معلومات الحساب", email: "البريد الإلكتروني", memberSince: "عضو منذ", nameChangeCountdown: "تغيير الاسم بعد", canChangeNow: "يمكن التغيير الآن!", selectEmoji: "إيموجي", guestTitle: "حساب زائر", guestDesc: "سجل لحفظ تقدمك وإضافة أصدقاء.", kd: "نسبة الـ KD", stats: "الإحصائيات", noPermission: "غير متاح للزوار.", normalMode: "الوضع العادي", advancedMode: "الوضع المتقدم (6+)", modeNormalDesc: "جاسوس ضد عملاء. 3-10 لاعبين.", modeAdvDesc: "أدوار خاصة! 6-10 لاعبين.", privateRoom: "غرفة خاصة", password: "كلمة السر", publicRoom: "غرفة عامة", noRooms: "لا توجد ألعاب نشطة.", lobbyTitle: "غرفة الانتظار", mrWhiteInstruction: "خمن المكان لتفوز!", informantInstruction: "تعرف على جارك!", ghostInstruction: "أنت الآن شبح. يمكنك المشاهدة فقط.", guessLocation: "خمن المكان", leaveRoom: "خروج", closeRoom: "إغلاق الغرفة", showPassword: "إظهار الباسورد", guestAccountLabel: "حساب زائر", guestProfileMsg: "لا يمكن إرسال طلبات صداقة للحسابات الزائرة.", reportUser: "إبلاغ عن المستخدم", reportSent: "تم إرسال البلاغ بنجاح!", reportTitle: "الإبلاغ عن مستخدم", reportDesc: "برجاء اختيار سبب الإبلاغ.", reportReasonAbusive: "سلوك مسيء", reportReasonCheating: "غش", reportReasonSpam: "بريد مزعج", reportReasonOther: "سبب آخر", reportSubmit: "إرسال البلاغ", reportCancel: "إلغاء", privateRoomError: "الغرف الخاصة تتطلب كلمة سر!",
        shop: "المتجر", currency: "إنتل", buy: "شراء", owned: "مملوك", equip: "تزيين", equipped: "مُزين", unequip: "إزالة", inventory: "المخزون", frames: "إطارات", titles: "ألقاب", themes: "سمات", badges: "شارات", purchaseSuccess: "تم الشراء!", purchaseFail: "لا تملك إنتل كافي!", alreadyOwned: "مملوك مسبقاً",
        tutorialTitle: "مرحباً أيها العميل", tutorialStep1: "هدفك هو العثور على الجاسوس (أو التخفي إن كنت الجاسوس).", tutorialStep2: "في كل جولة، ناقش وصوّت لطرد المشتبه به.", tutorialStep3: "اربح المباريات لتحصل على إنتل واشتري من المتجر!", skipTutorial: "تخطي", next: "التالي", startGame: "ابدأ اللعبة",
        matchSummary: "ملخص المباراة", matchDuration: "المدة", mvp: "الأفضل", correctVotes: "أصوات صحيحة", summaryTitle: "انتهت اللعبة!",
        notifTitle: "إشعار", achUnlock: "تم فتح إنجاز!", newFriend: "صديق جديد!", hiddenAch: "إنجاز سري", tabMain: "الرئيسية", tabInv: "المخزون", tabAch: "الإنجازات",
        charisma: "الكاريزما", charismaDesc: "تأثيرك في الساحة", gifts: "الهدايا", sendGift: "إرسال هدية", giftSent: "تم إرسال الهدية!", giftReceived: "لقد استلمت هدية!", selectGift: "اختر هدية", giftPreview: "معاينة الهدية", cashback: "استرداد", willReceive: "ستستلم", charismaGain: "زيادة الكاريزما", playerLeft: "لاعب غادر", spyLeftAgentsWin: "الجاسوس غادر! فاز العملاء!", agentLeftSpyWins: "عميل غادر! فاز الجاسوس!", myGifts: "هداياي", receivedGifts: "الهدايا المستلمة", noGifts: "لا توجد هدايا بعد.", fromPlayer: "من", toPlayer: "إلى", buyGift: "شراء هدية", sendToFriend: "إرسال لصديق",
        notifications: "الإشعارات", clearAll: "حذف الكل", noNotifications: "لا توجد إشعارات", friendRequest: "أرسل لك طلب صداقة", friendRequestAccepted: "قبل طلب صداقتك", giftNotification: "أرسل لك هدية", messageNotification: "أرسل لك رسالة", nextLevel: "المستوى التالي", close: "إغلاق",
        sendTo: "إرسال إلى", noFriendsToSend: "لا يوجد أصدقاء لإرسال الهدايا.", selectFriend: "اختر صديق", myInventory: "مخزوني", maxLevel: "المستوى الأقصى",
        privateChat: "محادثة خاصة", typeMessage: "اكتب رسالة...", noMessages: "لا توجد رسائل بعد.",
        codePlaceholder: "كود",
        luckyCashback: "كاش باك محظوظ", luckBonus: "مكافأة الحظ",
        loginRequired: "تسجيل الدخول مطلوب",
        showEmail: "إظهار", hideEmail: "إخفاء", accountType: "نوع الحساب", googleAccount: "حساب جوجل", guestAccount: "حساب زائر",
        playAsGuest: "العب كزائر", continueAsGuest: "المتابعة كزائر",
        sendGiftToFriend: "إرسال هدية", giftCharisma: "كاريزما", giftCashbackRange: "كاش باك",
        maxBadgesReached: "تم الوصول للحد الأقصى (10 شارات)", removeBadgeFirst: "أزل شارة أولاً",
    } 
};

// Continue in Part 2...

// ==========================================
// PART 2 - COMPONENTS
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
    return ( 
        <div className="guest-banner"> 
            <h3 className="guest-banner-title">{t.guestTitle}</h3> 
            <p className="guest-banner-desc">{t.guestDesc}</p> 
        </div> 
    ); 
};

// Notification Toast
const NotificationToast = ({ message, onClose }) => {
    useEffect(() => {
        if (message) { const timer = setTimeout(() => { onClose(); }, 2500); return () => clearTimeout(timer); }
    }, [message, onClose]);
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
const ModalCloseBtn = ({ onClose }) => (
    <button onClick={onClose} className="modal-close-btn" aria-label="Close">&times;</button>
);

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
                <span className={`charisma-level-badge ${currentLevel.badge_class} ${hasGlow ? 'glow-badge' : ''}`} style={hasGlow ? {boxShadow: '0 0 15px ' + currentLevel.color} : {}}>
                    {renderIcon()} Lv.{currentLevel.level}
                </span>
            </div>
            <div className="charisma-bar-bg">
                <div className="charisma-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
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

// ==========================================
// AVATAR WITH FRAME - UPDATED FOR ANIMATED GIF
// ==========================================
const AvatarWithFrame = ({ photoURL, equipped, size = 'md', onClick }) => {
    const sizeConfig = {
        sm: { wrapper: 52, avatar: 30, mask: 34 },
        md: { wrapper: 72, avatar: 40, mask: 44 },
        lg: { wrapper: 110, avatar: 60, mask: 64 },
        xl: { wrapper: 140, avatar: 80, mask: 84 }
    };
    const config = sizeConfig[size] || sizeConfig.md;
    const frameStyle = equipped?.frames || null;
    const frameItem = SHOP_ITEMS.frames.find(f => f.id === frameStyle);
    
    // Check if frame is animated (GIF)
    const isAnimated = frameItem ? isAnimatedImage(frameItem) : false;
    
    const wrapperStyle = {
        position: 'relative',
        width: config.wrapper + 'px',
        height: config.wrapper + 'px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0
    };
    
    const avatarStyle = {
        width: config.avatar + 'px',
        height: config.avatar + 'px',
        borderRadius: '50%',
        objectFit: 'cover',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        border: '2px solid rgba(0,0,0,0.5)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    };
    
    const renderFrame = () => {
        if (!frameItem) return null;
        
        // For animated GIF frames - render with transparent mask
        if (isAnimated && frameItem.preview.startsWith('http')) {
            return (
                <div className="avatar-frame-animated">
                    <img 
                        src={frameItem.preview} 
                        alt="frame" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {/* Transparent center mask */}
                    <div 
                        className="avatar-frame-animated-mask"
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: config.mask + 'px',
                            height: config.mask + 'px',
                            borderRadius: '50%',
                            background: 'var(--bg-dark)'
                        }}
                    />
                </div>
            );
        }
        
        // For regular image frames (PNG/JPG)
        if (frameItem.preview.startsWith('http')) {
            return (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: config.wrapper + 'px',
                    height: config.wrapper + 'px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    zIndex: 1
                }}>
                    <img 
                        src={frameItem.preview} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        alt="frame" 
                    />
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: config.mask + 'px',
                        height: config.mask + 'px',
                        borderRadius: '50%',
                        background: 'var(--bg-dark)'
                    }} />
                </div>
            );
        }
        
        // For gradient frames
        return (
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: config.wrapper + 'px',
                height: config.wrapper + 'px',
                borderRadius: '50%',
                background: frameItem.preview,
                zIndex: 1
            }}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: config.mask + 'px',
                    height: config.mask + 'px',
                    borderRadius: '50%',
                    background: 'var(--bg-dark)'
                }} />
            </div>
        );
    };
    
    return (
        <div style={wrapperStyle} onClick={onClick}>
            {renderFrame()}
            <img 
                src={photoURL || `https://ui-avatars.com/api/?name=User&background=random`} 
                style={avatarStyle} 
                alt="avatar" 
            />
        </div>
    );
};

// ==========================================
// RENDER TITLE - UPDATED FOR ANIMATED
// ==========================================
const renderTitle = (titleId, lang) => {
    const titleItem = SHOP_ITEMS.titles.find(t => t.id === titleId);
    if (!titleItem) return null;
    
    // Check if animated
    const isAnimated = isAnimatedImage(titleItem);
    
    // If imageUrl exists and is not empty
    if (titleItem.imageUrl && titleItem.imageUrl.trim() !== '') {
        return (
            <div className={isAnimated ? "profile-title-animated" : "profile-title-image"}>
                <img src={titleItem.imageUrl} alt={titleItem.name_en} />
            </div>
        );
    }
    
    // Otherwise show as text WITH purple background
    const name = lang === 'ar' ? titleItem.name_ar : titleItem.name_en;
    return (
        <div className="profile-title-text">
            <span>{titleItem.preview}</span>
            <span>{name}</span>
        </div>
    );
};

// ==========================================
// RENDER BADGE - UPDATED FOR ANIMATED (SINGLE)
// ==========================================
const renderBadge = (badgeId, size = 28) => {
    const badgeItem = SHOP_ITEMS.badges.find(b => b.id === badgeId);
    if (!badgeItem) return null;
    
    const isAnimated = isAnimatedImage(badgeItem);
    
    if (badgeItem.imageUrl && badgeItem.imageUrl.trim() !== '') {
        return (
            <span className={isAnimated ? "profile-badge-animated" : ""}>
                <img 
                    src={badgeItem.imageUrl} 
                    alt={badgeItem.name_en} 
                    className="profile-badge-img" 
                    style={{ width: size + 'px', height: size + 'px' }} 
                />
            </span>
        );
    }
    return <span className="profile-badge" style={{ fontSize: size + 'px' }}>{badgeItem.preview}</span>;
};

// ==========================================
// NEW: RENDER MULTIPLE BADGES (UP TO 10)
// ==========================================
const renderBadges = (badges, lang, maxDisplay = 10) => {
    if (!badges || badges.length === 0) return null;
    
    // Handle both array and single string
    const badgeArray = Array.isArray(badges) ? badges : [badges];
    const displayBadges = badgeArray.slice(0, maxDisplay);
    
    if (displayBadges.length === 0) return null;
    
    if (displayBadges.length === 1) {
        return (
            <div className="profile-badge-container">
                {renderBadge(displayBadges[0], 28)}
            </div>
        );
    }
    
    return (
        <div className="profile-badges-container">
            {displayBadges.map((badgeId, index) => (
                <span key={badgeId || index} className="profile-badge-animated">
                    {renderBadge(badgeId, 24)}
                </span>
            ))}
        </div>
    );
};

// ==========================================
// NOTIFICATION DROPDOWN
// ==========================================
const NotificationDropdown = ({ show, onClose, notifications, onMarkRead, onClearAll, onNotificationClick, lang }) => {
    const t = TRANSLATIONS[lang];
    
    if (!show) return null;
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    const getNotificationIcon = (type) => {
        switch(type) {
            case 'friend_request': return '👥';
            case 'gift': return '🎁';
            case 'message': return '💬';
            case 'friend_request_accepted': return '✅';
            case 'achievement': return '🏆';
            default: return '🔔';
        }
    };
    
    const handleNotificationClick = (notif) => {
        onMarkRead(notif.id);
        onNotificationClick(notif);
        onClose();
    };
    
    return (
        <div className="notification-dropdown animate-pop">
            <div className="notification-dropdown-header">
                <span className="notification-dropdown-title">{t.notifications} {unreadCount > 0 && `(${unreadCount})`}</span>
                {notifications.length > 0 && (
                    <button onClick={onClearAll} className="notification-clear-all">{t.clearAll}</button>
                )}
            </div>
            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="notification-empty">
                        <div className="text-3xl mb-2">🔔</div>
                        <p>{t.noNotifications}</p>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div 
                            key={notif.id} 
                            className={`notification-item ${!notif.read ? 'unread' : ''}`}
                            onClick={() => handleNotificationClick(notif)}
                        >
                            <span className="notification-item-icon">{getNotificationIcon(notif.type)}</span>
                            <div className="notification-item-content">
                                <div className="notification-item-title">{notif.fromName || 'System'}</div>
                                <div className="notification-item-message">{notif.message}</div>
                                <div className="notification-item-time">{formatTime(notif.timestamp)}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// ==========================================
// GIFT PREVIEW MODAL - UPDATED FOR ANIMATED
// ==========================================
const GiftPreviewModal = ({ show, onClose, gift, lang, onBuy, currency, isSending = false, isFromInventory = false, onSendFromInventory, friendsData }) => { 
    const t = TRANSLATIONS[lang]; 
    const [previewCashback, setPreviewCashback] = useState(null);
    const [showFriendSelect, setShowFriendSelect] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    
    const isGiftItem = gift?.type === 'gifts';
    const isAnimated = gift ? isAnimatedImage(gift) : false;
    
    useEffect(() => {
        if (gift && show && isGiftItem) {
            const minBack = gift.minCashback || 1;
            const maxBack = gift.maxCashback || Math.floor(gift.cost * 0.1);
            const sample = generateRandomCashback(minBack, maxBack);
            setPreviewCashback(sample);
        }
    }, [gift, show, isGiftItem]);
    
    if(!show || !gift) return null; 
    
    const renderGiftIcon = () => {
        if (gift.type === 'frames') {
            if (gift.preview && gift.preview.startsWith('http')) {
                return <img src={gift.preview} alt={gift.name_en} className={`w-20 h-20 rounded-full object-cover mx-auto ${isAnimated ? 'animate-float' : ''}`} />;
            }
            return <div className="w-20 h-20 rounded-full mx-auto" style={{ background: gift.preview }}></div>;
        }
        if (gift.type === 'badges') {
            if (gift.imageUrl && gift.imageUrl.trim() !== '') {
                return <img src={gift.imageUrl} alt={gift.name_en} className={`w-16 h-16 object-contain mx-auto ${isAnimated ? 'animate-pulse' : ''}`} />;
            }
            return <div className="text-6xl mb-3">{gift.preview}</div>;
        }
        if (gift.type === 'titles') {
            if (gift.imageUrl && gift.imageUrl.trim() !== '') {
                return <img src={gift.imageUrl} alt={gift.name_en} className={`h-10 object-contain mx-auto ${isAnimated ? 'animate-float' : ''}`} />;
            }
            return <div className="text-4xl mb-3">{gift.preview}</div>;
        }
        // Gift type
        if (gift.imageUrl && gift.imageUrl.trim() !== '') {
            return <img src={gift.imageUrl} alt={gift.name_en} className={`w-16 h-16 object-contain mx-auto ${isAnimated ? 'animate-pulse' : ''}`} />;
        }
        return <div className="text-6xl mb-3">{gift.emoji}</div>;
    };
    
    const handleSendFromInventory = () => {
        if (selectedFriend && onSendFromInventory) {
            onSendFromInventory(gift, selectedFriend);
            onClose();
        }
    };
    
    return ( 
        <div className="modal-overlay" onClick={onClose}> 
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '350px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">{isGiftItem ? t.giftPreview : (lang === 'ar' ? gift.name_ar : gift.name_en)}</h2>
                    <ModalCloseBtn onClose={onClose} />
                </div>
                <div className="modal-body text-center">
                    {renderGiftIcon()}
                    <h3 className="text-lg font-bold text-white mb-1">{lang === 'ar' ? gift.name_ar : gift.name_en}</h3> 
                    {isGiftItem && (gift.desc_ar || gift.desc_en) && (
                        <p className="text-xs text-gray-400 mb-4">{lang === 'ar' ? gift.desc_ar : gift.desc_en}</p>
                    )}
                    
                    {isGiftItem && (
                        <>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                                    <div className="text-[10px] text-gray-400">{t.giftCharisma}</div>
                                    <div className="text-xl font-bold text-purple-400">+{formatCharisma(gift.charisma)}</div>
                                </div>
                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                    <div className="text-[10px] text-gray-400">{t.giftCashbackRange}</div>
                                    <div className="text-sm font-bold text-green-400">{gift.minCashback || 1} - {gift.maxCashback || gift.cost}</div>
                                </div>
                            </div>
                            
                            {!isFromInventory && (
                                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-2 mb-3">
                                    <div className="text-[10px] text-gray-400">{t.luckBonus}</div>
                                    <div className="text-xl font-bold text-yellow-400 animate-pulse">+{previewCashback?.toLocaleString() || 0} 🧠</div>
                                </div>
                            )}
                        </>
                    )}
                    
                    {showFriendSelect && friendsData && (
                        <div className="mb-4 p-2 bg-white/5 rounded-lg max-h-32 overflow-y-auto">
                            <div className="text-xs text-gray-400 mb-2">{t.selectFriend}</div>
                            {friendsData.map(friend => (
                                <div 
                                    key={friend.id}
                                    onClick={() => setSelectedFriend(friend)}
                                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition ${selectedFriend?.id === friend.id ? 'bg-primary/20 border border-primary' : 'hover:bg-white/5'}`}
                                >
                                    <AvatarWithFrame photoURL={friend.photoURL} equipped={friend.equipped} size="sm" />
                                    <span className="text-sm">{friend.displayName}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    {isFromInventory ? (
                        showFriendSelect ? (
                            <div className="flex gap-2">
                                <button onClick={() => setShowFriendSelect(false)} className="btn-ghost flex-1 py-2 rounded-lg text-sm">{t.close}</button>
                                <button onClick={handleSendFromInventory} disabled={!selectedFriend} className="btn-gold flex-1 py-2 rounded-lg text-sm font-bold">{t.sendGift}</button>
                            </div>
                        ) : (
                            <button onClick={() => setShowFriendSelect(true)} className="btn-gold w-full py-2 rounded-lg text-sm font-bold">{t.sendGiftToFriend}</button>
                        )
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={onClose} className="btn-ghost flex-1 py-2 rounded-lg text-sm">{t.reportCancel}</button> 
                            <button onClick={() => onBuy(gift)} disabled={currency < gift.cost} className={`flex-1 py-2 rounded-lg text-sm font-bold ${currency >= gift.cost ? 'btn-gold' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>{isSending ? t.sendToFriend : t.buy} ({gift.cost} 🧠)</button> 
                        </div>
                    )}
                </div>
            </div>
        </div> 
    ); 
};

// Continue in Part 3...

// ==========================================
// PART 3 - SHOP & INVENTORY
// ==========================================
// Tutorial Modal
const TutorialModal = ({ show, onClose, lang }) => {
    const t = TRANSLATIONS[lang];
    const [step, setStep] = useState(0);
    if(!show) return null;
    const steps = [ { text: t.tutorialStep1, img: "🕵️" }, { text: t.tutorialStep2, img: "🗳️" }, { text: t.tutorialStep3, img: "🛒" } ];
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '360px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">{t.tutorialTitle}</h2>
                    <ModalCloseBtn onClose={onClose} />
                </div>
                <div className="modal-body text-center">
                    <div className="text-6xl mb-6 animate-bounce">{steps[step].img}</div>
                    <p className="text-base mb-6 text-gray-200">{steps[step].text}</p>
                    <div className="flex justify-center gap-2 mb-4"> 
                        {steps.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full transition ${i === step ? 'bg-cyan-400 w-4' : 'bg-gray-600'}`}></div>)} 
                    </div>
                    <div className="flex gap-3">
                        {step > 0 && <button onClick={() => setStep(s => s-1)} className="btn-ghost flex-1 py-2 rounded-lg text-sm">Back</button>}
                        {step < steps.length - 1 ? ( <button onClick={() => setStep(s => s+1)} className="btn-neon flex-1 py-2 rounded-lg text-sm">{t.next}</button> ) : ( <button onClick={onClose} className="btn-neon flex-1 py-2 rounded-lg text-sm">{t.startGame}</button> )}
                    </div>
                    <button onClick={onClose} className="text-xs text-gray-500 mt-4 hover:text-white">{t.skipTutorial}</button>
                </div>
            </div>
        </div>
    );
};

// Send Gift Modal
const SendGiftModal = ({ show, onClose, targetUser, currentUser, lang, onSendGift, currency }) => { 
    const t = TRANSLATIONS[lang]; 
    const [selectedGift, setSelectedGift] = useState(null); 
    const [showPreview, setShowPreview] = useState(false); 
    if(!show || !targetUser) return null; 
    const gifts = SHOP_ITEMS.gifts; 
    
    const handleSend = async (gift) => { 
        if (onSendGift) { await onSendGift(gift, targetUser); } 
        onClose(); 
    }; 
    
    const renderGiftIcon = (gift) => {
        const isAnimated = isAnimatedImage(gift);
        if (gift.imageUrl && gift.imageUrl.trim() !== '') {
            return <img src={gift.imageUrl} alt={gift.name_en} className={`gift-icon-img ${isAnimated ? 'animate-pulse' : ''}`} />;
        }
        return <span className="gift-icon">{gift.emoji}</span>;
    };
    
    return ( 
        <> 
            <div className="modal-overlay" onClick={onClose}> 
                <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                    <div className="modal-header"><h2 className="modal-title">{t.sendGift}</h2><ModalCloseBtn onClose={onClose} /></div> 
                    <div className="modal-body">
                        <div className="flex items-center gap-2 mb-3 p-2 bg-white/5 rounded-lg"> 
                            <AvatarWithFrame photoURL={targetUser.photoURL} equipped={targetUser.equipped} size="sm" />
                            <div><div className="font-bold text-sm">{targetUser.displayName}</div><div className="text-[10px] text-gray-400">{t.charisma}: {formatCharisma(targetUser.charisma || 0)}</div></div> 
                        </div> 
                        <div className="flex items-center gap-2 mb-3 text-xs text-yellow-400"><span>🧠 {currency} {CURRENCY_NAME}</span></div> 
                        <div className="grid grid-cols-4 gap-2 max-h-[250px] overflow-y-auto"> 
                            {gifts.map(gift => ( 
                                <button key={gift.id} onClick={() => { setSelectedGift(gift); setShowPreview(true); }} disabled={currency < gift.cost} className={`gift-card flex flex-col items-center justify-center p-2 rounded-lg transition ${currency >= gift.cost ? 'hover:border-yellow-400 hover:bg-yellow-500/10' : 'opacity-40 cursor-not-allowed'}`}> 
                                    {renderGiftIcon(gift)}
                                    <span className="text-[10px] font-bold text-yellow-400">{gift.cost}</span>
                                    <span className="text-[8px] text-gray-400">+{gift.charisma}</span>
                                </button> 
                            ))} 
                        </div>
                    </div> 
                </div> 
            </div> 
            <GiftPreviewModal show={showPreview} onClose={() => setShowPreview(false)} gift={selectedGift} lang={lang} onBuy={(gift) => handleSend(gift)} currency={currency} isSending={true} /> 
        </> 
    ); 
};

// ==========================================
// SHOP MODAL - UPDATED FOR ANIMATED + MULTIPLE BADGES
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
    
    const handlePurchase = (item) => {
        if (currency >= item.cost) {
            onPurchase(item);
            setShowPreview(false);
            setSelectedItem(null);
        }
    };
    
    const isOwned = (item) => inventory[item.type]?.includes(item.id);
    
    // UPDATED: Check if badge is equipped (now supports multiple)
    const isEquipped = (item) => {
        if (item.type === 'badges') {
            const equippedBadges = equipped.badges || [];
            return Array.isArray(equippedBadges) 
                ? equippedBadges.includes(item.id)
                : equippedBadges === item.id;
        }
        return equipped[item.type] === item.id;
    };
    
    // UPDATED: Check if can equip more badges
    const canEquipMoreBadges = () => {
        const equippedBadges = equipped.badges || [];
        const badgeCount = Array.isArray(equippedBadges) ? equippedBadges.length : (equippedBadges ? 1 : 0);
        return badgeCount < MAX_BADGES;
    };
    
    const renderPreview = (item) => {
        const isAnimated = isAnimatedImage(item);
        
        if (item.type === 'frames') {
            if (item.preview.startsWith('http')) {
                return <img src={item.preview} alt={item.name_en} className={`w-12 h-12 rounded-full object-cover ${isAnimated ? 'animate-pulse' : ''}`} />;
            }
            return <div className="w-12 h-12 rounded-full" style={{ background: item.preview }}></div>;
        } else if (item.type === 'badges') {
            if (item.imageUrl && item.imageUrl.trim() !== '') {
                return <img src={item.imageUrl} alt={item.name_en} className={`w-10 h-10 object-contain ${isAnimated ? 'animate-pulse' : ''}`} />;
            }
            return <span className="text-3xl">{item.preview}</span>;
        } else if (item.type === 'titles') {
            if (item.imageUrl && item.imageUrl.trim() !== '') {
                return <img src={item.imageUrl} alt={item.name_en} className={`w-8 h-8 object-contain ${isAnimated ? 'animate-float' : ''}`} />;
            }
            return <span className="text-2xl">{item.preview}</span>;
        } else if (item.type === 'gifts') {
            if (item.imageUrl && item.imageUrl.trim() !== '') {
                return <img src={item.imageUrl} alt={item.name_en} className={`w-10 h-10 object-contain ${isAnimated ? 'animate-pulse' : ''}`} />;
            }
            return <span className="text-3xl">{item.emoji}</span>;
        }
        return <span className="text-2xl">🎨</span>;
    };
    
    const tabs = ['frames', 'titles', 'badges', 'gifts'];
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', maxHeight: '90vh' }}>
                <div className="modal-header">
                    <h2 className="modal-title">{t.shop}</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-yellow-400 font-bold text-sm">🧠 {currency.toLocaleString()}</span>
                        <ModalCloseBtn onClose={onClose} />
                    </div>
                </div>
                
                <div className="modal-body" style={{ padding: 0 }}>
                    <div className="shop-tabs-container" style={{ margin: '12px', marginBottom: 0 }}>
                        {tabs.map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`shop-tab ${activeTab === tab ? 'active' : ''}`}>{t[tab]}</button>
                        ))}
                    </div>
                    
                    <div className="p-3">
                        <div className="inventory-grid">
                            {SHOP_ITEMS[activeTab]?.map(item => {
                                const owned = isOwned(item);
                                const equippedItem = isEquipped(item);
                                const isAnimated = isAnimatedImage(item);
                                
                                if (activeTab === 'gifts') {
                                    return (
                                        <div key={item.id} className="gift-card" onClick={() => { setSelectedItem(item); setShowPreview(true); }}>
                                            <div className="inventory-item-preview">{renderPreview(item)}</div>
                                            <div className="gift-details">
                                                <span className="gift-charisma">+{item.charisma} {t.giftCharisma}</span>
                                                <span className="gift-cashback">{item.minCashback}-{item.maxCashback} {t.giftCashbackRange}</span>
                                            </div>
                                            <div className="flex items-center justify-center gap-1 text-yellow-400 font-bold text-sm mt-1">
                                                <span>{item.cost}</span><span>🧠</span>
                                            </div>
                                        </div>
                                    );
                                }
                                
                                // UPDATED: Badge-specific logic for multiple badges
                                if (activeTab === 'badges') {
                                    return (
                                        <div 
                                            key={item.id} 
                                            className={`inventory-item ${equippedItem ? 'equipped' : ''}`} 
                                            onClick={() => { setSelectedItem(item); setShowPreview(true); }}
                                        >
                                            <div className="inventory-item-preview">{renderPreview(item)}</div>
                                            <div className="inventory-item-name">{lang === 'ar' ? item.name_ar : item.name_en}</div>
                                            {owned ? (
                                                equippedItem ? (
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            onUnequip('badges', item.id); 
                                                        }} 
                                                        className="btn-unequip w-full"
                                                    >
                                                        {t.unequip}
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            if (canEquipMoreBadges()) {
                                                                onEquip(item); 
                                                            }
                                                        }} 
                                                        className={`btn-success w-full text-xs py-1 rounded ${!canEquipMoreBadges() ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        disabled={!canEquipMoreBadges()}
                                                    >
                                                        {canEquipMoreBadges() ? t.equip : t.maxBadgesReached}
                                                    </button>
                                                )
                                            ) : (
                                                <div className="flex items-center justify-center gap-1 text-yellow-400 font-bold text-sm">
                                                    <span>{item.cost}</span><span>🧠</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                                
                                // Other items (frames, titles)
                                return (
                                    <div key={item.id} className={`inventory-item ${equippedItem ? 'equipped' : ''}`} onClick={() => { setSelectedItem(item); setShowPreview(true); }}>
                                        <div className="inventory-item-preview">{renderPreview(item)}</div>
                                        <div className="inventory-item-name">{lang === 'ar' ? item.name_ar : item.name_en}</div>
                                        {owned ? (
                                            equippedItem ? (
                                                <button onClick={(e) => { e.stopPropagation(); onUnequip(item.type); }} className="btn-unequip w-full">{t.unequip}</button>
                                            ) : (
                                                <button onClick={(e) => { e.stopPropagation(); onEquip(item); }} className="btn-success w-full text-xs py-1 rounded">{t.equip}</button>
                                            )
                                        ) : (
                                            <div className="flex items-center justify-center gap-1 text-yellow-400 font-bold text-sm">
                                                <span>{item.cost}</span><span>🧠</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                
                {showPreview && selectedItem && (
                    <GiftPreviewModal show={showPreview} onClose={() => setShowPreview(false)} gift={selectedItem} lang={lang} onBuy={handlePurchase} currency={currency} />
                )}
            </div>
        </div>
    );
};

// ==========================================
// INVENTORY MODAL - UPDATED FOR MULTIPLE BADGES
// ==========================================
const InventoryModal = ({ show, onClose, userData, lang, onEquip, onUnequip, onSendGift, friendsData, isLoggedIn }) => {
    const t = TRANSLATIONS[lang];
    const [activeTab, setActiveTab] = useState('frames');
    const [selectedGift, setSelectedGift] = useState(null);
    const [showGiftPreview, setShowGiftPreview] = useState(false);
    
    if (!show) return null;
    
    const inventory = userData?.inventory || { frames: [], titles: [], themes: [], badges: [], gifts: [] };
    const equipped = userData?.equipped || {};
    
    const getOwnedItems = (type) => {
        const ownedIds = inventory[type] || [];
        return SHOP_ITEMS[type]?.filter(item => ownedIds.includes(item.id)) || [];
    };
    
    // UPDATED: Check if badge is equipped (supports multiple)
    const isEquipped = (item) => {
        if (item.type === 'badges') {
            const equippedBadges = equipped.badges || [];
            return Array.isArray(equippedBadges) 
                ? equippedBadges.includes(item.id)
                : equippedBadges === item.id;
        }
        return equipped[item.type] === item.id;
    };
    
    const canEquipMoreBadges = () => {
        const equippedBadges = equipped.badges || [];
        const badgeCount = Array.isArray(equippedBadges) ? equippedBadges.length : (equippedBadges ? 1 : 0);
        return badgeCount < MAX_BADGES;
    };
    
    const renderPreview = (item) => {
        const isAnimated = isAnimatedImage(item);
        
        if (item.type === 'frames') {
            if (item.preview.startsWith('http')) return <img src={item.preview} alt={item.name_en} className={`w-12 h-12 rounded-full object-cover ${isAnimated ? 'animate-pulse' : ''}`} />;
            return <div className="w-12 h-12 rounded-full" style={{ background: item.preview }}></div>;
        } else if (item.type === 'badges') {
            if (item.imageUrl && item.imageUrl.trim() !== '') return <img src={item.imageUrl} alt={item.name_en} className={`w-10 h-10 object-contain ${isAnimated ? 'animate-pulse' : ''}`} />;
            return <span className="text-3xl">{item.preview}</span>;
        } else if (item.type === 'titles') {
            if (item.imageUrl && item.imageUrl.trim() !== '') return <img src={item.imageUrl} alt={item.name_en} className={`w-8 h-8 object-contain ${isAnimated ? 'animate-float' : ''}`} />;
            return <span className="text-2xl">{item.preview}</span>;
        } else if (item.type === 'gifts') {
            if (item.imageUrl && item.imageUrl.trim() !== '') return <img src={item.imageUrl} alt={item.name_en} className={`w-10 h-10 object-contain ${isAnimated ? 'animate-pulse' : ''}`} />;
            return <span className="text-3xl">{item.emoji}</span>;
        }
        return <span className="text-2xl">🎨</span>;
    };
    
    const tabs = ['frames', 'titles', 'badges', 'gifts'];
    const ownedItems = getOwnedItems(activeTab);
    
    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', maxHeight: '90vh' }}>
                    <div className="modal-header">
                        <h2 className="modal-title">{t.myInventory}</h2>
                        <ModalCloseBtn onClose={onClose} />
                    </div>
                    
                    <div className="modal-body" style={{ padding: 0 }}>
                        <div className="shop-tabs-container" style={{ margin: '12px', marginBottom: 0 }}>
                            {tabs.map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`shop-tab ${activeTab === tab ? 'active' : ''}`}>{t[tab]} ({getOwnedItems(tab).length})</button>
                            ))}
                        </div>
                        
                        <div className="p-3">
                            {ownedItems.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <div className="text-4xl mb-2">📦</div>
                                    <p>{t.owned}: 0</p>
                                </div>
                            ) : (
                                <div className="inventory-grid">
                                    {ownedItems.map(item => {
                                        const equippedItem = isEquipped(item);
                                        const isAnimated = isAnimatedImage(item);
                                        
                                        if (activeTab === 'gifts') {
                                            return (
                                                <div key={item.id} className="inventory-item">
                                                    <div className="inventory-item-preview">{renderPreview(item)}</div>
                                                    <div className="inventory-item-name">{lang === 'ar' ? item.name_ar : item.name_en}</div>
                                                    <button onClick={() => { setSelectedGift(item); setShowGiftPreview(true); }} className="btn-gold w-full text-xs py-1 rounded mt-1">{t.sendGiftToFriend}</button>
                                                </div>
                                            );
                                        }
                                        
                                        // UPDATED: Badge-specific logic
                                        if (activeTab === 'badges') {
                                            return (
                                                <div key={item.id} className={`inventory-item ${equippedItem ? 'equipped' : ''}`}>
                                                    <div className="inventory-item-preview">{renderPreview(item)}</div>
                                                    <div className="inventory-item-name">{lang === 'ar' ? item.name_ar : item.name_en}</div>
                                                    {equippedItem ? (
                                                        <button 
                                                            onClick={() => onUnequip('badges', item.id)} 
                                                            className="btn-unequip w-full"
                                                        >
                                                            {t.unequip}
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => {
                                                                if (canEquipMoreBadges()) {
                                                                    onEquip(item);
                                                                }
                                                            }} 
                                                            className={`btn-success w-full text-xs py-1 rounded ${!canEquipMoreBadges() ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            disabled={!canEquipMoreBadges()}
                                                        >
                                                            {canEquipMoreBadges() ? t.equip : t.maxBadgesReached}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        }
                                        
                                        // Other items
                                        return (
                                            <div key={item.id} className={`inventory-item ${equippedItem ? 'equipped' : ''}`}>
                                                <div className="inventory-item-preview">{renderPreview(item)}</div>
                                                <div className="inventory-item-name">{lang === 'ar' ? item.name_ar : item.name_en}</div>
                                                {equippedItem ? (
                                                    <button onClick={() => onUnequip(item.type)} className="btn-unequip w-full">{t.unequip}</button>
                                                ) : (
                                                    <button onClick={() => onEquip(item)} className="btn-success w-full text-xs py-1 rounded">{t.equip}</button>
                                                )}
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
                />
            )}
        </>
    );
};

// ==========================================
// USER PROFILE MODAL - UPDATED FOR MULTIPLE BADGES
// ==========================================
const UserProfileModal = ({ show, onClose, targetUID, lang, currentUserUID, onSendFriendRequest, onSendGift, userData, currentUserFriends, currentUserFriendRequests }) => {
    const t = TRANSLATIONS[lang];
    const [targetData, setTargetData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    
    useEffect(() => {
        if (!show || !targetUID) { setLoading(true); return; }
        setLoading(true);
        setRequestSent(false);
        
        usersCollection.doc(targetUID).get().then(doc => {
            if (doc.exists) {
                setTargetData({ id: doc.id, ...doc.data(), isGuest: false });
                setLoading(false);
            } else {
                guestsCollection.doc(targetUID).get().then(guestDoc => {
                    if (guestDoc.exists) {
                        setTargetData({ id: guestDoc.id, ...guestDoc.data(), isGuest: true });
                    } else { setTargetData(null); }
                    setLoading(false);
                }).catch(() => { setTargetData(null); setLoading(false); });
            }
        }).catch(() => { setLoading(false); setTargetData(null); });
    }, [show, targetUID]);
    
    if (!show) return null;
    
    const isOwnProfile = targetUID === currentUserUID;
    const isTargetGuest = targetData?.isGuest || targetData?.isAnonymous;
    
    const isAlreadyFriend = currentUserFriends?.includes(targetUID);
    const hasPendingRequest = currentUserFriendRequests?.includes(targetUID) || requestSent;
    
    const handleAddFriend = async () => {
        if (isAlreadyFriend || hasPendingRequest) return;
        await onSendFriendRequest(targetUID);
        setRequestSent(true);
    };
    
    const getFriendButton = () => {
        if (isAlreadyFriend) {
            return (
                <button disabled className="btn-success flex-1 py-2 rounded-lg text-sm opacity-80">
                    ✅ {lang === 'ar' ? 'أصدقاء بالفعل' : 'Already Friends'}
                </button>
            );
        }
        if (hasPendingRequest) {
            return (
                <button disabled className="btn-ghost flex-1 py-2 rounded-lg text-sm opacity-80">
                    ⏳ {lang === 'ar' ? 'تم إرسال الطلب' : 'Request Sent'}
                </button>
            );
        }
        return (
            <button onClick={handleAddFriend} className="btn-neon flex-1 py-2 rounded-lg text-sm">
                👥 {t.addFriend}
            </button>
        );
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{t.profile}</h2>
                    <ModalCloseBtn onClose={onClose} />
                </div>
                
                <div className="modal-body">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="text-2xl animate-pulse">⏳</div>
                            <p className="text-gray-400 mt-2">{t.loading}</p>
                        </div>
                    ) : !targetData ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-2">❌</div>
                            <p className="text-gray-400">{t.friendNotFound}</p>
                        </div>
                    ) : (
                        <div className="profile-container">
                            <div className="profile-header">
                                <div className="profile-avatar-section">
                                    <div className="profile-avatar-container">
                                        <AvatarWithFrame photoURL={targetData.photoURL} equipped={targetData.equipped} size="lg" />
                                    </div>
                                    <h3 className="profile-name">{targetData.displayName || 'Unknown'}</h3>
                                    
                                    {/* Title */}
                                    {targetData.equipped?.titles && (
                                        <div className="profile-title-container">
                                            {renderTitle(targetData.equipped.titles, lang)}
                                        </div>
                                    )}
                                    
                                    {/* UPDATED: Multiple Badges */}
                                    {targetData.equipped?.badges && (
                                        renderBadges(targetData.equipped.badges, lang)
                                    )}
                                    
                                    {isTargetGuest && <div className="profile-account-type guest">{t.guestAccount}</div>}
                                    
                                    <div className="profile-id" onClick={() => { navigator.clipboard.writeText(targetData.customId || targetData.uid); }}>
                                        <span>ID: {targetData.customId || targetData.uid?.substring(0, 8)}</span>
                                        <span className="text-[10px]">📋</span>
                                    </div>
                                </div>
                            </div>
                            
                            <CharismaDisplay charisma={targetData.charisma} lang={lang} />
                            
                            <div className="profile-stats">
                                <div className="profile-stat"><div className="profile-stat-value">{targetData.stats?.wins || 0}</div><div className="profile-stat-label">{t.wins}</div></div>
                                <div className="profile-stat"><div className="profile-stat-value">{targetData.stats?.losses || 0}</div><div className="profile-stat-label">{t.losses}</div></div>
                                <div className="profile-stat"><div className="profile-stat-value">{calculateLevel(targetData.stats?.xp || 0)}</div><div className="profile-stat-label">{t.level}</div></div>
                            </div>
                            
                            <KDCircle wins={targetData.stats?.wins || 0} losses={targetData.stats?.losses || 0} lang={lang} />
                            
                            {!isOwnProfile && !isTargetGuest && (
                                <div className="flex gap-2 mt-4">
                                    {getFriendButton()}
                                    <button onClick={() => setShowGiftModal(true)} className="btn-gold flex-1 py-2 rounded-lg text-sm">🎁 {t.sendGift}</button>
                                </div>
                            )}
                            
                            {isTargetGuest && !isOwnProfile && (
                                <div className="text-center text-gray-400 text-xs mt-4 p-2 bg-white/5 rounded-lg">{t.guestProfileMsg}</div>
                            )}
                        </div>
                    )}
                </div>
                
                {showGiftModal && targetData && (
                    <SendGiftModal show={showGiftModal} onClose={() => setShowGiftModal(false)} targetUser={targetData} currentUser={userData} lang={lang} onSendGift={onSendGift} currency={userData?.currency || 0} />
                )}
            </div>
        </div>
    );
};

// Continue in Part 4...

// ==========================================
// PART 5 - GAME ROOM COMPONENTS
// ==========================================
// Player Card Component
const PlayerCard = ({ player, isCurrentPlayer, showRole, onVote, hasVoted, voteCount, lang, currentUserUID, onProfileClick }) => {
    const t = TRANSLATIONS[lang];
    const isAnimated = player.equipped?.frameAnimated;
    
    return (
        <div className={`player-card ${!player.isAlive ? 'dead' : ''} ${isCurrentPlayer ? 'current' : ''}`}>
            <div className="player-card-header" onClick={() => onProfileClick && onProfileClick(player.id)}>
                <AvatarWithFrame 
                    photoURL={player.photoURL} 
                    equipped={player.equipped} 
                    size="md"
                    isAnimated={isAnimated}
                />
                <div className="player-info">
                    <div className="player-name">{player.displayName}</div>
                    {showRole && (
                        <div className="player-role" style={{ color: getRoleColor(player.role) }}>
                            {getRoleName(player.role, lang)}
                        </div>
                    )}
                </div>
            </div>
            
            {player.isAlive && onVote && !hasVoted && player.id !== currentUserUID && (
                <button onClick={() => onVote(player.id)} className="btn-vote">
                    🗳️ {t.vote}
                </button>
            )}
            
            {voteCount > 0 && (
                <div className="vote-count">
                    🗳️ {voteCount}
                </div>
            )}
            
            {!player.isAlive && (
                <div className="dead-overlay">
                    <span>💀</span>
                </div>
            )}
        </div>
    );
};

// Game Chat Component
const GameChat = ({ messages, currentUserUID, lang, onSendMessage, disabled }) => {
    const t = TRANSLATIONS[lang];
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleSend = () => {
        if (input.trim() && onSendMessage) {
            onSendMessage(input.trim());
            setInput('');
        }
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
    return (
        <div className="game-chat-container">
            <div className="game-chat-messages">
                {messages && messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.senderId === currentUserUID ? 'own' : ''}`}>
                            <div className="chat-message-sender">{msg.senderName}</div>
                            <div className="chat-message-text">{msg.text}</div>
                            <div className="chat-message-time">
                                {msg.timestamp ? new Date(msg.timestamp.toDate ? msg.timestamp.toDate() : msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="chat-empty">{t.noMessages}</div>
                )}
                <div ref={chatEndRef} />
            </div>
            
            <div className="game-chat-input-container">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t.typeMessage}
                    disabled={disabled}
                    className="game-chat-input"
                />
                <button 
                    onClick={handleSend} 
                    disabled={disabled || !input.trim()}
                    className="game-chat-send"
                >
                    📤
                </button>
            </div>
        </div>
    );
};

// Phase Indicator Component
const PhaseIndicator = ({ phase, timeLeft, lang }) => {
    const t = TRANSLATIONS[lang];
    
    const phaseInfo = {
        'lobby': { icon: '🏠', label: t.lobby, color: '#6b7280' },
        'role-reveal': { icon: '🎭', label: t.roleReveal, color: '#a855f7' },
        'night': { icon: '🌙', label: t.nightPhase, color: '#1e3a5f' },
        'day': { icon: '☀️', label: t.dayPhase, color: '#fbbf24' },
        'voting': { icon: '🗳️', label: t.votingPhase, color: '#ef4444' },
        'results': { icon: '📊', label: t.results, color: '#22c55e' },
        'game-over': { icon: '🏆', label: t.gameOver, color: '#00d4ff' }
    };
    
    const info = phaseInfo[phase] || phaseInfo['lobby'];
    
    return (
        <div className="phase-indicator" style={{ backgroundColor: info.color + '20', borderColor: info.color }}>
            <span className="phase-icon">{info.icon}</span>
            <span className="phase-label">{info.label}</span>
            {timeLeft !== null && timeLeft !== undefined && (
                <span className="phase-timer">{formatSeconds(timeLeft)}</span>
            )}
        </div>
    );
};

// Format Seconds (seconds to mm:ss) - renamed to avoid conflict with formatTime
const formatSeconds = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Role Reveal Modal
const RoleRevealModal = ({ show, role, onClose, lang }) => {
    const t = TRANSLATIONS[lang];
    const [showRole, setShowRole] = useState(false);
    
    if (!show || !role) return null;
    
    return (
        <div className="modal-overlay">
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '320px' }}>
                <div className="modal-body text-center">
                    <h2 className="text-2xl font-bold mb-4">{t.yourRole}</h2>
                    
                    {!showRole ? (
                        <button 
                            onClick={() => setShowRole(true)}
                            className="btn-neon py-4 px-8 rounded-lg text-lg"
                        >
                            🎭 {t.revealRole}
                        </button>
                    ) : (
                        <div className="animate-pop">
                            <div className="text-6xl mb-4">
                                {role === 'spy' ? '🕵️' : 
                                 role === 'mafia' ? '🔫' :
                                 role === 'godfather' ? '🎩' :
                                 role === 'detective' ? '🔍' :
                                 role === 'doctor' ? '💉' :
                                 '👤'}
                            </div>
                            <div className="text-2xl font-bold mb-2" style={{ color: getRoleColor(role) }}>
                                {getRoleName(role, lang)}
                            </div>
                            <p className="text-gray-400 text-sm mb-4">
                                {role === 'spy' && t.spyDescription}
                                {role === 'mafia' && t.mafiaDescription}
                                {role === 'godfather' && t.godfatherDescription}
                                {role === 'detective' && t.detectiveDescription}
                                {role === 'doctor' && t.doctorDescription}
                                {role === 'citizen' && t.citizenDescription}
                            </p>
                            <button onClick={onClose} className="btn-success py-2 px-6 rounded-lg">
                                ✓ {t.ready}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Game Over Modal
const GameOverModal = ({ show, winner, players, onLeave, lang, currentUserUID }) => {
    const t = TRANSLATIONS[lang];
    
    if (!show) return null;
    
    const isMafiaWin = winner === 'mafia';
    const currentPlayer = players?.find(p => p.id === currentUserUID);
    const isWinner = currentPlayer && (
        (isMafiaWin && ['mafia', 'godfather'].includes(currentPlayer.role)) ||
        (!isMafiaWin && !['mafia', 'godfather'].includes(currentPlayer.role))
    );
    
    return (
        <div className="modal-overlay">
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                <div className="modal-body text-center">
                    <div className="text-6xl mb-4">
                        {isMafiaWin ? '🔫' : '🏆'}
                    </div>
                    <h2 className={`text-3xl font-bold mb-2 ${isMafiaWin ? 'text-red-400' : 'text-green-400'}`}>
                        {isMafiaWin ? t.mafiaWins : t.citizensWin}
                    </h2>
                    
                    {currentPlayer && (
                        <div className={`mb-4 p-3 rounded-lg ${isWinner ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            <span className={isWinner ? 'text-green-400' : 'text-red-400'}>
                                {isWinner ? '🎉 ' + t.youWin : '😢 ' + t.youLose}
                            </span>
                        </div>
                    )}
                    
                    <div className="mb-4">
                        <h3 className="text-lg font-bold mb-2">{t.rolesRevealed}</h3>
                        <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                            {players?.map(player => (
                                <div key={player.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                                    <span>{player.isAlive ? '✓' : '💀'}</span>
                                    <span className="text-sm truncate">{player.displayName}</span>
                                    <span className="text-xs" style={{ color: getRoleColor(player.role) }}>
                                        {getRoleName(player.role, lang)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <button onClick={onLeave} className="btn-neon py-3 px-8 rounded-lg w-full">
                        🚪 {t.leaveRoom}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Night Action Panel
const NightActionPanel = ({ role, players, onAction, hasActed, lang, currentUserUID }) => {
    const t = TRANSLATIONS[lang];
    const [selectedTarget, setSelectedTarget] = useState(null);
    
    const alivePlayers = players?.filter(p => p.isAlive && p.id !== currentUserUID) || [];
    
    const getActionInfo = () => {
        switch (role) {
            case 'mafia':
            case 'godfather':
                return { icon: '🔫', title: t.selectTarget, action: t.kill };
            case 'detective':
                return { icon: '🔍', title: t.selectInvestigate, action: t.investigate };
            case 'doctor':
                return { icon: '💉', title: t.selectSave, action: t.save };
            default:
                return null;
        }
    };
    
    const info = getActionInfo();
    
    if (!info) {
        return (
            <div className="night-action-panel">
                <div className="text-center text-gray-400">
                    <span className="text-4xl mb-2 block">😴</span>
                    <p>{t.waitNight}</p>
                </div>
            </div>
        );
    }
    
    if (hasActed) {
        return (
            <div className="night-action-panel">
                <div className="text-center text-cyan-400">
                    <span className="text-4xl mb-2 block">✓</span>
                    <p>{t.actionSubmitted}</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="night-action-panel">
            <h3 className="text-lg font-bold mb-3">{info.icon} {info.title}</h3>
            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto mb-4">
                {alivePlayers.map(player => (
                    <div 
                        key={player.id}
                        onClick={() => setSelectedTarget(player.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition ${
                            selectedTarget === player.id ? 'bg-red-500/30 border border-red-400' : 'bg-white/5 hover:bg-white/10'
                        }`}
                    >
                        <AvatarWithFrame photoURL={player.photoURL} equipped={player.equipped} size="sm" />
                        <span className="text-sm truncate">{player.displayName}</span>
                    </div>
                ))}
            </div>
            <button 
                onClick={() => onAction(selectedTarget)}
                disabled={!selectedTarget}
                className={`btn-neon w-full py-2 rounded-lg ${!selectedTarget ? 'opacity-50' : ''}`}
            >
                {info.action}
            </button>
        </div>
    );
};

// Create Room Modal
const CreateRoomModal = ({ show, onClose, onCreate, lang, userData }) => {
    const t = TRANSLATIONS[lang];
    const [roomName, setRoomName] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(8);
    const [isPrivate, setIsPrivate] = useState(false);
    const [loading, setLoading] = useState(false);
    
    if (!show) return null;
    
    const handleCreate = async () => {
        if (!roomName.trim()) return;
        setLoading(true);
        try {
            await onCreate({
                name: roomName.trim(),
                maxPlayers,
                isPrivate
            });
            setRoomName('');
            onClose();
        } catch (error) {
            console.error('Error creating room:', error);
        }
        setLoading(false);
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '360px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">{t.createRoom}</h2>
                    <ModalCloseBtn onClose={onClose} />
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">{t.roomName}</label>
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder={t.enterRoomName}
                            className="form-input"
                            maxLength={30}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">{t.maxPlayers}: {maxPlayers}</label>
                        <input
                            type="range"
                            min={4}
                            max={16}
                            value={maxPlayers}
                            onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                            className="w-full"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span>🔒 {t.privateRoom}</span>
                        </label>
                    </div>
                    
                    <button 
                        onClick={handleCreate}
                        disabled={!roomName.trim() || loading}
                        className={`btn-neon w-full py-3 rounded-lg mt-4 ${loading ? 'opacity-50' : ''}`}
                    >
                        {loading ? '⏳ ' + t.creating : '🏠 ' + t.create}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Join Room Modal
const JoinRoomModal = ({ show, onClose, onJoin, lang, rooms }) => {
    const t = TRANSLATIONS[lang];
    const [roomCode, setRoomCode] = useState('');
    const [loading, setLoading] = useState(false);
    
    if (!show) return null;
    
    const handleJoin = async () => {
        if (!roomCode.trim()) return;
        setLoading(true);
        try {
            await onJoin(roomCode.trim().toUpperCase());
            setRoomCode('');
            onClose();
        } catch (error) {
            console.error('Error joining room:', error);
        }
        setLoading(false);
    };
    
    const availableRooms = rooms?.filter(r => r.status === 'lobby' && r.players?.length < r.maxPlayers) || [];
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">{t.joinRoom}</h2>
                    <ModalCloseBtn onClose={onClose} />
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">{t.enterRoomCode}</label>
                        <input
                            type="text"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            placeholder="XXXXXX"
                            className="form-input text-center text-xl tracking-widest"
                            maxLength={6}
                        />
                    </div>
                    
                    <button 
                        onClick={handleJoin}
                        disabled={!roomCode.trim() || loading}
                        className={`btn-neon w-full py-3 rounded-lg mb-4 ${loading ? 'opacity-50' : ''}`}
                    >
                        {loading ? '⏳ ' + t.joining : '🚪 ' + t.join}
                    </button>
                    
                    {availableRooms.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 mb-2">{t.availableRooms}</h3>
                            <div className="max-h-[200px] overflow-y-auto">
                                {availableRooms.map(room => (
                                    <div 
                                        key={room.id}
                                        onClick={() => onJoin(room.id)}
                                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg mb-2 cursor-pointer hover:bg-white/10 transition"
                                    >
                                        <div>
                                            <div className="font-bold">{room.name}</div>
                                            <div className="text-xs text-gray-400">{room.players?.length || 0}/{room.maxPlayers}</div>
                                        </div>
                                        <div className="text-cyan-400">→</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Continue in Part 6...

// ==========================================
// PART 6 - MAIN APP
// ==========================================
// Main App Component
const App = () => {
    // Auth State
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    
    // Modal States
    const [showTutorial, setShowTutorial] = useState(false);
    const [showShop, setShowShop] = useState(false);
    const [showInventory, setShowInventory] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showFriends, setShowFriends] = useState(false);
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [showJoinRoom, setShowJoinRoom] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(null);
    
    // Game States
    const [currentRoom, setCurrentRoom] = useState(null);
    const [roomData, setRoomData] = useState(null);
    const [rooms, setRooms] = useState([]);
    
    // Friend States
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    
    const t = TRANSLATIONS[lang];
    
    // Auth Listener
    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged(async (authUser) => {
            if (authUser) {
                setUser(authUser);
                
                // Listen to user data
                usersCollection.doc(authUser.uid).onSnapshot((doc) => {
                    if (doc.exists) {
                        const data = doc.data();
                        setUserData({ uid: authUser.uid, email: authUser.email, ...data });
                        
                        // Load friends data
                        if (data.friends && data.friends.length > 0) {
                            loadFriendsData(data.friends);
                        }
                        
                        // Load friend requests
                        if (data.friendRequests && data.friendRequests.length > 0) {
                            loadFriendRequests(data.friendRequests);
                        }
                    }
                    setLoading(false);
                });
                
            } else {
                setUser(null);
                setUserData(null);
                setLoading(false);
            }
        });
        
        return () => unsubscribe();
    }, []);
    
    // Load Rooms
    useEffect(() => {
        if (!user) return;
        
        const unsubscribe = roomsCollection
            .where('status', '==', 'lobby')
            .where('isPrivate', '==', false)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .onSnapshot((snapshot) => {
                const roomsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRooms(roomsData);
            });
        
        return () => unsubscribe();
    }, [user]);
    
    // Load Friends Data
    const loadFriendsData = async (friendIds) => {
        try {
            const friendsData = await Promise.all(
                friendIds.map(async (fid) => {
                    const doc = await usersCollection.doc(fid).get();
                    if (doc.exists) {
                        return { id: doc.id, ...doc.data() };
                    }
                    return null;
                })
            );
            setFriends(friendsData.filter(f => f !== null));
        } catch (error) {
            console.error('Error loading friends:', error);
        }
    };
    
    // Load Friend Requests
    const loadFriendRequests = async (requestIds) => {
        try {
            const requestsData = await Promise.all(
                requestIds.map(async (rid) => {
                    const doc = await usersCollection.doc(rid).get();
                    if (doc.exists) {
                        return { id: doc.id, ...doc.data() };
                    }
                    return null;
                })
            );
            setFriendRequests(requestsData.filter(r => r !== null));
        } catch (error) {
            console.error('Error loading friend requests:', error);
        }
    };
    
    // Guest Login
    const handleGuestLogin = async () => {
        try {
            const result = await firebase.auth().signInAnonymously();
            const guestUser = result.user;
            
            const guestData = {
                displayName: 'Guest_' + guestUser.uid.substring(0, 6),
                photoURL: null,
                currency: 100,
                charisma: 0,
                stats: { wins: 0, losses: 0, xp: 0 },
                inventory: { frames: [], titles: [], badges: [], gifts: [] },
                equipped: {},
                friends: [],
                friendRequests: [],
                isGuest: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await guestsCollection.doc(guestUser.uid).set(guestData);
            setUserData({ uid: guestUser.uid, ...guestData });
            
        } catch (error) {
            console.error('Guest login error:', error);
            alert(t.loginError);
        }
    };
    
    // Google Login
    const handleGoogleLogin = async () => {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await firebase.auth().signInWithPopup(provider);
            const authUser = result.user;
            
            const userDoc = await usersCollection.doc(authUser.uid).get();
            
            if (!userDoc.exists) {
                const newUserData = {
                    displayName: authUser.displayName || 'Player',
                    photoURL: authUser.photoURL,
                    email: authUser.email,
                    currency: 500,
                    charisma: 0,
                    stats: { wins: 0, losses: 0, xp: 0 },
                    inventory: { frames: [], titles: [], badges: [], gifts: [] },
                    equipped: {},
                    friends: [],
                    friendRequests: [],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                await usersCollection.doc(authUser.uid).set(newUserData);
            }
            
        } catch (error) {
            console.error('Google login error:', error);
            alert(t.loginError);
        }
    };
    
    // Logout
    const handleLogout = async () => {
        try {
            await firebase.auth().signOut();
            setUser(null);
            setUserData(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };
    
    // Purchase Item
    const handlePurchase = async (item) => {
        if (!userData || userData.currency < item.cost) return;
        
        try {
            const userRef = usersCollection.doc(userData.uid);
            
            await userRef.update({
                currency: firebase.firestore.FieldValue.increment(-item.cost),
                [`inventory.${item.type}`]: firebase.firestore.FieldValue.arrayUnion(item.id)
            });
            
        } catch (error) {
            console.error('Purchase error:', error);
        }
    };
    
    // Equip Item - UPDATED FOR MULTIPLE BADGES
    const handleEquip = async (item) => {
        if (!userData) return;
        
        try {
            const userRef = usersCollection.doc(userData.uid);
            const equipped = userData.equipped || {};
            
            if (item.type === 'badges') {
                // Handle multiple badges
                const currentBadges = equipped.badges || [];
                let newBadges;
                
                if (Array.isArray(currentBadges)) {
                    newBadges = [...currentBadges, item.id];
                } else {
                    // Convert from old single badge format
                    newBadges = currentBadges ? [currentBadges, item.id] : [item.id];
                }
                
                // Limit to MAX_BADGES
                if (newBadges.length > MAX_BADGES) {
                    newBadges = newBadges.slice(-MAX_BADGES);
                }
                
                await userRef.update({
                    'equipped.badges': newBadges
                });
            } else {
                // Handle other items normally
                await userRef.update({
                    [`equipped.${item.type}`]: item.id
                });
            }
            
        } catch (error) {
            console.error('Equip error:', error);
        }
    };
    
    // Unequip Item - UPDATED FOR MULTIPLE BADGES
    const handleUnequip = async (type, itemId = null) => {
        if (!userData) return;
        
        try {
            const userRef = usersCollection.doc(userData.uid);
            
            if (type === 'badges' && itemId) {
                // Remove specific badge from array
                const currentBadges = userData.equipped?.badges || [];
                let newBadges;
                
                if (Array.isArray(currentBadges)) {
                    newBadges = currentBadges.filter(id => id !== itemId);
                } else {
                    // Old format - clear if matches
                    newBadges = currentBadges === itemId ? [] : [currentBadges];
                }
                
                await userRef.update({
                    'equipped.badges': newBadges
                });
            } else {
                // Handle other items
                await userRef.update({
                    [`equipped.${type}`]: firebase.firestore.FieldValue.delete()
                });
            }
            
        } catch (error) {
            console.error('Unequip error:', error);
        }
    };
    
    // Send Gift
    const handleSendGift = async (gift, targetUser) => {
        if (!userData || !gift) return;
        
        try {
            // Calculate cashback
            const cashbackPercent = Math.floor(Math.random() * (gift.maxCashback - gift.minCashback + 1)) + gift.minCashback;
            const cashbackAmount = Math.floor(gift.cost * cashbackPercent / 100);
            
            // Update sender
            const senderRef = usersCollection.doc(userData.uid);
            await senderRef.update({
                [`inventory.gifts`]: firebase.firestore.FieldValue.arrayRemove(gift.id),
                currency: firebase.firestore.FieldValue.increment(cashbackAmount)
            });
            
            // Update receiver
            const receiverRef = usersCollection.doc(targetUser.id);
            await receiverRef.update({
                charisma: firebase.firestore.FieldValue.increment(gift.charisma)
            });
            
            // Add to gifts received
            await receiverRef.collection('giftsReceived').add({
                fromId: userData.uid,
                fromName: userData.displayName,
                giftId: gift.id,
                giftName: lang === 'ar' ? gift.name_ar : gift.name_en,
                charisma: gift.charisma,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
        } catch (error) {
            console.error('Send gift error:', error);
        }
    };
    
    // Send Friend Request
    const handleSendFriendRequest = async (targetUID) => {
        if (!userData || !targetUID) return;
        
        try {
            const targetRef = usersCollection.doc(targetUID);
            await targetRef.update({
                friendRequests: firebase.firestore.FieldValue.arrayUnion(userData.uid)
            });
        } catch (error) {
            console.error('Friend request error:', error);
        }
    };
    
    // Accept Friend Request
    const handleAcceptFriend = async (requesterUID) => {
        if (!userData || !requesterUID) return;
        
        try {
            const userRef = usersCollection.doc(userData.uid);
            const requesterRef = usersCollection.doc(requesterUID);
            
            // Add to both friends lists
            await userRef.update({
                friendRequests: firebase.firestore.FieldValue.arrayRemove(requesterUID),
                friends: firebase.firestore.FieldValue.arrayUnion(requesterUID)
            });
            
            await requesterRef.update({
                friends: firebase.firestore.FieldValue.arrayUnion(userData.uid)
            });
            
        } catch (error) {
            console.error('Accept friend error:', error);
        }
    };
    
    // Decline Friend Request
    const handleDeclineFriend = async (requesterUID) => {
        if (!userData || !requesterUID) return;
        
        try {
            const userRef = usersCollection.doc(userData.uid);
            await userRef.update({
                friendRequests: firebase.firestore.FieldValue.arrayRemove(requesterUID)
            });
        } catch (error) {
            console.error('Decline friend error:', error);
        }
    };
    
    // Create Room
    const handleCreateRoom = async (roomConfig) => {
        if (!userData) return;
        
        try {
            const roomCode = generateRoomCode();
            const roomData = {
                name: roomConfig.name,
                code: roomCode,
                hostId: userData.uid,
                hostName: userData.displayName,
                maxPlayers: roomConfig.maxPlayers,
                isPrivate: roomConfig.isPrivate,
                status: 'lobby',
                players: [{
                    id: userData.uid,
                    displayName: userData.displayName,
                    photoURL: userData.photoURL,
                    equipped: userData.equipped,
                    isAlive: true,
                    role: null
                }],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const docRef = await roomsCollection.add(roomData);
            setCurrentRoom(docRef.id);
            
        } catch (error) {
            console.error('Create room error:', error);
        }
    };
    
    // Join Room
    const handleJoinRoom = async (roomIdOrCode) => {
        if (!userData) return;
        
        try {
            // Find room by ID or code
            let roomDoc;
            
            // Try by ID first
            roomDoc = await roomsCollection.doc(roomIdOrCode).get();
            
            // If not found, try by code
            if (!roomDoc.exists) {
                const snapshot = await roomsCollection.where('code', '==', roomIdOrCode).limit(1).get();
                if (!snapshot.empty) {
                    roomDoc = snapshot.docs[0];
                }
            }
            
            if (!roomDoc.exists) {
                alert(t.roomNotFound);
                return;
            }
            
            const roomData = roomDoc.data();
            
            // Check if room is full
            if (roomData.players && roomData.players.length >= roomData.maxPlayers) {
                alert(t.roomFull);
                return;
            }
            
            // Check if already in room
            if (roomData.players && roomData.players.find(p => p.id === userData.uid)) {
                setCurrentRoom(roomDoc.id);
                return;
            }
            
            // Add player to room
            await roomsCollection.doc(roomDoc.id).update({
                players: firebase.firestore.FieldValue.arrayUnion({
                    id: userData.uid,
                    displayName: userData.displayName,
                    photoURL: userData.photoURL,
                    equipped: userData.equipped,
                    isAlive: true,
                    role: null
                })
            });
            
            setCurrentRoom(roomDoc.id);
            
        } catch (error) {
            console.error('Join room error:', error);
        }
    };
    
    // Leave Room
    const handleLeaveRoom = async () => {
        if (!userData || !currentRoom) return;
        
        try {
            const roomDoc = await roomsCollection.doc(currentRoom).get();
            if (roomDoc.exists) {
                const roomData = roomDoc.data();
                const updatedPlayers = roomData.players.filter(p => p.id !== userData.uid);
                
                if (updatedPlayers.length === 0) {
                    // Delete room if empty
                    await roomsCollection.doc(currentRoom).delete();
                } else {
                    // Update room
                    await roomsCollection.doc(currentRoom).update({
                        players: updatedPlayers,
                        hostId: roomData.hostId === userData.uid ? updatedPlayers[0].id : roomData.hostId,
                        hostName: roomData.hostId === userData.uid ? updatedPlayers[0].displayName : roomData.hostName
                    });
                }
            }
            
            setCurrentRoom(null);
            setRoomData(null);
            
        } catch (error) {
            console.error('Leave room error:', error);
        }
    };
    
    // Listen to current room
    useEffect(() => {
        if (!currentRoom) return;
        
        const unsubscribe = roomsCollection.doc(currentRoom).onSnapshot((doc) => {
            if (doc.exists) {
                setRoomData({ id: doc.id, ...doc.data() });
            } else {
                setCurrentRoom(null);
                setRoomData(null);
            }
        });
        
        return () => unsubscribe();
    }, [currentRoom]);
    
    // Language Change
    const handleLanguageChange = (newLang) => {
        setLang(newLang);
        localStorage.setItem('lang', newLang);
    };
    
    // Theme Change
    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };
    
    // Loading Screen
    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <div className="loading-logo">🕵️</div>
                    <div className="loading-title">PRO SPY</div>
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }
    
    // Login Screen
    if (!user) {
        return (
            <div className="login-screen">
                <div className="login-content">
                    <div className="login-logo">🕵️</div>
                    <h1 className="login-title">PRO SPY</h1>
                    <p className="login-subtitle">{t.gameTagline}</p>
                    
                    <div className="login-buttons">
                        <button onClick={handleGoogleLogin} className="btn-google">
                            <span>🔴</span> {t.loginWithGoogle}
                        </button>
                        <button onClick={handleGuestLogin} className="btn-guest">
                            <span>👻</span> {t.playAsGuest}
                        </button>
                    </div>
                    
                    <div className="login-footer">
                        <button onClick={() => handleLanguageChange(lang === 'en' ? 'ar' : 'ar')} className="lang-btn">
                            🌐 {lang === 'en' ? 'العربية' : 'English'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    // Main App Render
    return (
        <div className="app-container">
            {/* Header */}
            <header className="app-header">
                <div className="header-left">
                    <div className="app-logo">🕵️ PRO SPY</div>
                </div>
                
                <div className="header-center">
                    <div className="currency-display">
                        <span>🧠</span>
                        <span>{userData?.currency?.toLocaleString() || 0}</span>
                    </div>
                    <div className="charisma-mini">
                        <span>💎</span>
                        <span>{formatCharisma(userData?.charisma || 0)}</span>
                    </div>
                </div>
                
                <div className="header-right">
                    <button onClick={() => setShowShop(true)} className="header-btn">🛒</button>
                    <button onClick={() => setShowInventory(true)} className="header-btn">🎒</button>
                    <button onClick={() => setShowFriends(true)} className="header-btn">👥</button>
                    <button onClick={() => setShowSettings(true)} className="header-btn">⚙️</button>
                    <div onClick={() => setShowProfile(true)} className="header-avatar">
                        <AvatarWithFrame photoURL={userData?.photoURL} equipped={userData?.equipped} size="sm" />
                    </div>
                </div>
            </header>
            
            {/* Main Content */}
            <main className="app-main">
                {!currentRoom ? (
                    // Lobby View
                    <div className="lobby-container">
                        <div className="lobby-header">
                            <h2>{t.welcome}, {userData?.displayName}!</h2>
                            <p className="text-gray-400">{t.chooseGameMode}</p>
                        </div>
                        
                        <div className="lobby-actions">
                            <button onClick={() => setShowCreateRoom(true)} className="lobby-btn create">
                                <span className="lobby-btn-icon">🏠</span>
                                <span className="lobby-btn-text">{t.createRoom}</span>
                            </button>
                            
                            <button onClick={() => setShowJoinRoom(true)} className="lobby-btn join">
                                <span className="lobby-btn-icon">🚪</span>
                                <span className="lobby-btn-text">{t.joinRoom}</span>
                            </button>
                        </div>
                        
                        <div className="lobby-rooms">
                            <h3 className="text-lg font-bold mb-3">{t.publicRooms}</h3>
                            {rooms.length > 0 ? (
                                <div className="rooms-grid">
                                    {rooms.map(room => (
                                        <div key={room.id} className="room-card" onClick={() => handleJoinRoom(room.id)}>
                                            <div className="room-name">{room.name}</div>
                                            <div className="room-info">
                                                <span>{room.players?.length || 0}/{room.maxPlayers}</span>
                                                <span className="room-host">{room.hostName}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-rooms">
                                    <span className="text-4xl mb-2">🎮</span>
                                    <p>{t.noRooms}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // Game Room View
                    <div className="game-container">
                        <PhaseIndicator phase={roomData?.status || 'lobby'} lang={lang} />
                        
                        <div className="game-players">
                            {roomData?.players?.map(player => (
                                <PlayerCard
                                    key={player.id}
                                    player={player}
                                    isCurrentPlayer={player.id === userData.uid}
                                    showRole={roomData?.status !== 'lobby'}
                                    lang={lang}
                                    currentUserUID={userData.uid}
                                    onProfileClick={setShowUserProfile}
                                />
                            ))}
                        </div>
                        
                        <div className="game-actions">
                            {roomData?.hostId === userData.uid && roomData?.status === 'lobby' && (
                                <button className="btn-neon py-3 px-8 rounded-lg">
                                    🎮 {t.startGame}
                                </button>
                            )}
                            
                            <button onClick={handleLeaveRoom} className="btn-danger py-2 px-6 rounded-lg">
                                🚪 {t.leaveRoom}
                            </button>
                        </div>
                        
                        <GameChat messages={roomData?.messages || []} currentUserUID={userData.uid} lang={lang} />
                    </div>
                )}
            </main>
            
            {/* Modals */}
            <TutorialModal show={showTutorial} onClose={() => setShowTutorial(false)} lang={lang} />
            <ShopModal show={showShop} onClose={() => setShowShop(false)} userData={userData} lang={lang} onPurchase={handlePurchase} onEquip={handleEquip} onUnequip={handleUnequip} />
            <InventoryModal show={showInventory} onClose={() => setShowInventory(false)} userData={userData} lang={lang} onEquip={handleEquip} onUnequip={handleUnequip} onSendGift={handleSendGift} friendsData={friends} isLoggedIn={!!user} />
            <SettingsModal show={showSettings} onClose={() => setShowSettings(false)} lang={lang} onLanguageChange={handleLanguageChange} onThemeChange={handleThemeChange} onLogout={handleLogout} theme={theme} />
            <FriendsModal show={showFriends} onClose={() => setShowFriends(false)} lang={lang} friends={friends} friendRequests={friendRequests} onAcceptFriend={handleAcceptFriend} onDeclineFriend={handleDeclineFriend} onProfileClick={setShowUserProfile} />
            <CreateRoomModal show={showCreateRoom} onClose={() => setShowCreateRoom(false)} lang={lang} onCreate={handleCreateRoom} userData={userData} />
            <JoinRoomModal show={showJoinRoom} onClose={() => setShowJoinRoom(false)} lang={lang} onJoin={handleJoinRoom} rooms={rooms} />
            
            {showUserProfile && (
                <UserProfileModal
                    show={!!showUserProfile}
                    onClose={() => setShowUserProfile(null)}
                    targetUID={showUserProfile}
                    lang={lang}
                    currentUserUID={userData?.uid}
                    onSendFriendRequest={handleSendFriendRequest}
                    onSendGift={handleSendGift}
                    userData={userData}
                    currentUserFriends={userData?.friends}
                    currentUserFriendRequests={userData?.friendRequests}
                />
            )}
        </div>
    );
};

// ==========================================
// RENDER APP
// ==========================================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
