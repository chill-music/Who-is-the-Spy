// ==========================================
// PRO SPY - COMPLETE SCRIPT - PART 1
// All Improvements + Notifications + Chat + Gifts
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
        { id: 'frame_gif', name_en: "gif Frame", name_ar: "إطار صورة", cost: 0, type: 'frames', preview: 'https://i.ibb.co/1tvtgmD8/ezgif-com-optimize.gif' },
        { id: 'shehab', name_en: "sh", name_ar: "إطار صورة", cost: 100, type: 'frames', preview: 'https://i.ibb.co/n8Bj9dSk/ezgif-com-animated-gif-maker-1.gif' },
        { id: 'frame_rainbow', name_en: "Rainbow Frame", name_ar: "إطار قوس قزح", cost: 600, type: 'frames', preview: 'https://i.ibb.co/1tvtgmD8/ezgif-com-optimize.gif' },
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
        // Notification sound - pleasant chime
        osc.frequency.value = 880;
        osc.type = 'sine';
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(1100, audioCtx.currentTime + 0.1);
        osc.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'message') {
        // Message sound - soft ping
        osc.frequency.value = 600;
        osc.type = 'sine';
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    }
};

// Play notification sound for new notifications
const playNotificationSound = () => {
    playSound('notification');
};

// Play message sound for new messages
const playMessageSound = () => {
    playSound('message');
};

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
    } 
};

// Continue in Part 2...
// ==========================================
// PRO SPY - COMPLETE SCRIPT - PART 2
// Components + Notifications + Chat
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
// AVATAR WITH FRAME - FIXED (BIGGER FRAME)
// ==========================================
const AvatarWithFrame = ({ photoURL, equipped, size = 'md', onClick }) => {
    const sizeConfig = {
        sm: { wrapper: 52, avatar: 30, mask: 32 },
        md: { wrapper: 72, avatar: 40, mask: 42 },
        lg: { wrapper: 110, avatar: 60, mask: 62 },
        xl: { wrapper: 140, avatar: 80, mask: 82 }
    };
    const config = sizeConfig[size] || sizeConfig.md;
    const frameStyle = equipped?.frames || null;
    const frameItem = SHOP_ITEMS.frames.find(f => f.id === frameStyle);
    
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
        } else {
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
        }
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
// RENDER TITLE - IMAGE OR TEXT WITH BACKGROUND
// ==========================================
const renderTitle = (titleId, lang) => {
    const titleItem = SHOP_ITEMS.titles.find(t => t.id === titleId);
    if (!titleItem) return null;
    
    // If imageUrl exists and is not empty - show as image WITHOUT background
    if (titleItem.imageUrl && titleItem.imageUrl.trim() !== '') {
        return (
            <div className="profile-title-image">
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

// Render Badge with imageUrl support
const renderBadge = (badgeId, size = 28) => {
    const badgeItem = SHOP_ITEMS.badges.find(b => b.id === badgeId);
    if (!badgeItem) return null;
    
    if (badgeItem.imageUrl && badgeItem.imageUrl.trim() !== '') {
        return <img src={badgeItem.imageUrl} alt={badgeItem.name_en} className="profile-badge-img" style={{ width: size + 'px', height: size + 'px' }} />;
    }
    return <span className="profile-badge" style={{ fontSize: size + 'px' }}>{badgeItem.preview}</span>;
};

// ==========================================
// NOTIFICATION DROPDOWN - NEW
// ==========================================
const NotificationDropdown = ({ show, onClose, notifications, onMarkRead, onClearAll, onNotificationClick, lang }) => {
    const t = TRANSLATIONS[lang];
    const bellRef = useRef(null);
    
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
// GIFT PREVIEW MODAL - WITH DETAILS
// ==========================================
const GiftPreviewModal = ({ show, onClose, gift, lang, onBuy, currency, isSending = false, isFromInventory = false, onSendFromInventory, friendsData }) => { 
    const t = TRANSLATIONS[lang]; 
    const [previewCashback, setPreviewCashback] = useState(null);
    const [showFriendSelect, setShowFriendSelect] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    
    // Check if this is actually a gift item
    const isGiftItem = gift?.type === 'gifts';
    
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
                return <img src={gift.preview} alt={gift.name_en} className="w-20 h-20 rounded-full object-cover mx-auto" />;
            }
            return <div className="w-20 h-20 rounded-full mx-auto" style={{ background: gift.preview }}></div>;
        }
        if (gift.type === 'badges') {
            if (gift.imageUrl && gift.imageUrl.trim() !== '') {
                return <img src={gift.imageUrl} alt={gift.name_en} className="w-16 h-16 object-contain mx-auto" />;
            }
            return <div className="text-6xl mb-3">{gift.preview}</div>;
        }
        if (gift.type === 'titles') {
            if (gift.imageUrl && gift.imageUrl.trim() !== '') {
                return <img src={gift.imageUrl} alt={gift.name_en} className="h-10 object-contain mx-auto" />;
            }
            return <div className="text-4xl mb-3">{gift.preview}</div>;
        }
        // Gift type
        if (gift.imageUrl && gift.imageUrl.trim() !== '') {
            return <img src={gift.imageUrl} alt={gift.name_en} className="w-16 h-16 object-contain mx-auto" />;
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
                    
                    {/* Gift Details - Only for gifts */}
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

// ==========================================
// PRIVATE CHAT MODAL - IMPROVED WITH EMOJI & GIFTS
// ==========================================
const PrivateChatModal = ({ show, onClose, friend, currentUser, user, lang, onSendNotification, onSendGift, currency }) => {
    const t = TRANSLATIONS[lang];
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [sending, setSending] = useState(false);
    const [showGiftModal, setShowGiftModal] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    
    const chatId = friend && user ? getChatId(user.uid, friend.uid) : null;
    
    useEffect(() => {
        if (!show || !chatId) return;
        const unsub = chatsCollection.doc(chatId).collection('messages')
            .onSnapshot(snap => {
                let msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                msgs.sort((a, b) => {
                    const timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds || 0;
                    const timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds || 0;
                    return timeA - timeB;
                });
                setMessages(msgs);
                chatsCollection.doc(chatId).update({ [`unread.${user.uid}`]: 0 }).catch(() => {});
            });
        return unsub;
    }, [show, chatId, user?.uid]);
    
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
    
    const handleSend = async () => {
        if (!newMsg.trim() || sending) return;
        setSending(true);
        try {
            const msgData = { senderId: user.uid, senderName: currentUser?.displayName || 'User', senderPhoto: currentUser?.photoURL || null, text: newMsg.trim(), timestamp: firebase.firestore.FieldValue.serverTimestamp() };
            await chatsCollection.doc(chatId).collection('messages').add(msgData);
            await chatsCollection.doc(chatId).set({ members: [user.uid, friend.uid], lastMessage: newMsg.trim(), timestamp: firebase.firestore.FieldValue.serverTimestamp(), [`unread.${friend.uid}`]: firebase.firestore.FieldValue.increment(1) }, { merge: true });
            // Create notification for the receiver
            if (onSendNotification) {
                await onSendNotification(friend.uid, 'message', `${currentUser?.displayName || 'User'}: ${newMsg.trim().substring(0, 50)}${newMsg.trim().length > 50 ? '...' : ''}`, user.uid, currentUser?.displayName || 'User');
            }
            setNewMsg('');
            playSound('click');
        } catch (e) { console.error('Send message error:', e); }
        setSending(false);
    };
    
    const handleSendGiftToChat = async (gift, targetUser) => {
        if (!onSendGift) return;
        await onSendGift(gift, targetUser);
        // Send gift message to chat
        const giftMsgData = { 
            senderId: user.uid, 
            senderName: currentUser?.displayName || 'User', 
            senderPhoto: currentUser?.photoURL || null, 
            type: 'gift',
            giftId: gift.id,
            giftName: lang === 'ar' ? gift.name_ar : gift.name_en,
            giftEmoji: gift.emoji,
            giftCharisma: gift.charisma,
            text: `🎁 ${lang === 'ar' ? 'أرسل هدية' : 'Sent a gift'}: ${gift.emoji} ${lang === 'ar' ? gift.name_ar : gift.name_en}`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp() 
        };
        try {
            await chatsCollection.doc(chatId).collection('messages').add(giftMsgData);
            await chatsCollection.doc(chatId).set({ 
                members: [user.uid, friend.uid], 
                lastMessage: `🎁 ${lang === 'ar' ? 'هدية' : 'Gift'}`, 
                timestamp: firebase.firestore.FieldValue.serverTimestamp(), 
                [`unread.${friend.uid}`]: firebase.firestore.FieldValue.increment(1) 
            }, { merge: true });
        } catch (e) { console.error('Gift message error:', e); }
        setShowGiftModal(false);
    };
    
    const addEmoji = (emoji) => {
        setNewMsg(prev => prev + emoji);
        inputRef.current?.focus();
    };
    
    if (!show || !friend) return null;
    
    // Show limited emojis
    const displayEmojis = EMOJI_LIST.slice(0, 30);
    
    const renderMessageContent = (msg) => {
        if (msg.type === 'gift') {
            return (
                <div className="gift-message-content">
                    <div className="gift-message-icon text-4xl">{msg.giftEmoji || '🎁'}</div>
                    <div className="gift-message-name">{msg.giftName || 'Gift'}</div>
                    <div className="gift-message-details">
                        <span className="gift-charisma-badge">+{formatCharisma(msg.giftCharisma)} {lang === 'ar' ? 'كاريزما' : 'Charisma'}</span>
                    </div>
                </div>
            );
        }
        return <div className="chat-message-bubble">{msg.text}</div>;
    };
    
    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="chat-modal-content animate-pop" onClick={e => e.stopPropagation()}>
                    {/* Chat Header */}
                    <div className="chat-header-bar">
                        <AvatarWithFrame photoURL={friend.photoURL} equipped={friend.equipped} size="sm" />
                        <div className="chat-header-info">
                            <div className="chat-header-name">{friend.displayName}</div>
                            <div className="chat-header-status">{t.online}</div>
                        </div>
                        {/* Gift Button */}
                        <button onClick={() => setShowGiftModal(true)} className="gift-chat-btn" title={t.sendGift}>
                            🎁
                        </button>
                        <ModalCloseBtn onClose={onClose} />
                    </div>
                    
                    {/* Messages */}
                    <div className="chat-messages-container">
                        {messages.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">{t.noMessages}</div>
                        ) : (
                            messages.map(msg => {
                                const isMine = msg.senderId === user?.uid;
                                const isGift = msg.type === 'gift';
                                return (
                                    <div key={msg.id} className={`chat-message-row ${isMine ? 'mine' : ''} ${isGift ? 'gift-message' : ''}`}>
                                        {!isMine && (
                                            <AvatarWithFrame 
                                                photoURL={msg.senderPhoto || friend.photoURL} 
                                                equipped={friend.equipped} 
                                                size="sm" 
                                            />
                                        )}
                                        <div className="chat-message-content">
                                            <div className="chat-message-sender">{isMine ? (currentUser?.displayName || 'You') : msg.senderName}</div>
                                            {renderMessageContent(msg)}
                                            <div className="chat-message-time">{formatTime(msg.timestamp)}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Input Area with Emoji */}
                    <div className="chat-input-container">
                        {/* Emoji Picker */}
                        <div className="emoji-picker-container">
                            {displayEmojis.map((emoji, i) => (
                                <button key={i} className="emoji-picker-btn" onClick={() => addEmoji(emoji)}>{emoji}</button>
                            ))}
                        </div>
                        
                        <div className="chat-input-row">
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
                </div>
            </div>
            
            {/* Gift Modal */}
            {showGiftModal && (
                <SendGiftModal 
                    show={showGiftModal} 
                    onClose={() => setShowGiftModal(false)} 
                    targetUser={friend} 
                    currentUser={currentUser} 
                    lang={lang} 
                    onSendGift={handleSendGiftToChat} 
                    currency={currency || 0} 
                />
            )}
        </>
    );
};

// Continue in Part 3...
// ==========================================
// PRO SPY - COMPLETE SCRIPT - PART 3
// Shop + Inventory + Profile + Main App
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
        if (gift.imageUrl && gift.imageUrl.trim() !== '') {
            return <img src={gift.imageUrl} alt={gift.name_en} className="gift-icon-img" />;
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
// SHOP MODAL - WITH GIFT DETAILS
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
    const isEquipped = (item) => equipped[item.type] === item.id;
    
    const renderPreview = (item) => {
        if (item.type === 'frames') {
            if (item.preview.startsWith('http')) {
                return <img src={item.preview} alt={item.name_en} className="w-12 h-12 rounded-full object-cover" />;
            }
            return <div className="w-12 h-12 rounded-full" style={{ background: item.preview }}></div>;
        } else if (item.type === 'badges') {
            if (item.imageUrl && item.imageUrl.trim() !== '') {
                return <img src={item.imageUrl} alt={item.name_en} className="w-10 h-10 object-contain" />;
            }
            return <span className="text-3xl">{item.preview}</span>;
        } else if (item.type === 'titles') {
            if (item.imageUrl && item.imageUrl.trim() !== '') {
                return <img src={item.imageUrl} alt={item.name_en} className="w-8 h-8 object-contain" />;
            }
            return <span className="text-2xl">{item.preview}</span>;
        } else if (item.type === 'gifts') {
            if (item.imageUrl && item.imageUrl.trim() !== '') {
                return <img src={item.imageUrl} alt={item.name_en} className="w-10 h-10 object-contain" />;
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
                                
                                return (
                                    <div key={item.id} className={`inventory-item ${equippedItem ? 'equipped' : ''}`} onClick={() => { setSelectedItem(item); setShowPreview(true); }}>
                                        <div className="inventory-item-preview">{renderPreview(item)}</div>
                                        <div className="inventory-item-name">{lang === 'ar' ? item.name_ar : item.name_en}</div>
                                        {owned ? (
                                            equippedItem ? (
                                                <button onClick={(e) => { e.stopPropagation(); handleUnequip(item.type); }} className="btn-unequip w-full">{t.unequip}</button>
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
// INVENTORY MODAL - WITH SEND GIFT BUTTON
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
    
    const isEquipped = (item) => equipped[item.type] === item.id;
    
    const renderPreview = (item) => {
        if (item.type === 'frames') {
            if (item.preview.startsWith('http')) return <img src={item.preview} alt={item.name_en} className="w-12 h-12 rounded-full object-cover" />;
            return <div className="w-12 h-12 rounded-full" style={{ background: item.preview }}></div>;
        } else if (item.type === 'badges') {
            if (item.imageUrl && item.imageUrl.trim() !== '') return <img src={item.imageUrl} alt={item.name_en} className="w-10 h-10 object-contain" />;
            return <span className="text-3xl">{item.preview}</span>;
        } else if (item.type === 'titles') {
            if (item.imageUrl && item.imageUrl.trim() !== '') return <img src={item.imageUrl} alt={item.name_en} className="w-8 h-8 object-contain" />;
            return <span className="text-2xl">{item.preview}</span>;
        } else if (item.type === 'gifts') {
            if (item.imageUrl && item.imageUrl.trim() !== '') return <img src={item.imageUrl} alt={item.name_en} className="w-10 h-10 object-contain" />;
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
                                        
                                        if (activeTab === 'gifts') {
                                            return (
                                                <div key={item.id} className="inventory-item">
                                                    <div className="inventory-item-preview">{renderPreview(item)}</div>
                                                    <div className="inventory-item-name">{lang === 'ar' ? item.name_ar : item.name_en}</div>
                                                    <button onClick={() => { setSelectedGift(item); setShowGiftPreview(true); }} className="btn-gold w-full text-xs py-1 rounded mt-1">{t.sendGiftToFriend}</button>
                                                </div>
                                            );
                                        }
                                        
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
// USER PROFILE MODAL - IMPROVED
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
    
    // Check friend status
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
                                    
                                    {/* Title - using renderTitle function */}
                                    {targetData.equipped?.titles && (
                                        <div className="profile-title-container">
                                            {renderTitle(targetData.equipped.titles, lang)}
                                        </div>
                                    )}
                                    
                                    {/* Badge */}
                                    {targetData.equipped?.badges && (
                                        <div className="profile-badge-container">
                                            {renderBadge(targetData.equipped.badges, 28)}
                                        </div>
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

// ==========================================
// MAIN APP COMPONENT - SEE PART 4
// ==========================================
// Continue in Part 4...
// ==========================================
// PRO SPY - COMPLETE SCRIPT - PART 4
// Main App Component with Notifications
// ==========================================

function App() {
    const [lang, setLang] = useState('en');
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
    const [chatFriend, setChatFriend] = useState(null);
    const [showLoginAlert, setShowLoginAlert] = useState(false);
    const [guestData, setGuestData] = useState(null);
    const [showEmail, setShowEmail] = useState(false);
    
    // NEW: Notification System
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const notificationBellRef = useRef(null);
    
    const t = TRANSLATIONS[lang];
    
    const isLoggedIn = useMemo(() => user && !user.isAnonymous, [user]);
    const isGuest = useMemo(() => guestData !== null, [guestData]);
    const isNotLoggedIn = useMemo(() => user === null && guestData === null, [user, guestData]);
    
    const currentUID = useMemo(() => {
        if (user && !user.isAnonymous) return user.uid;
        if (guestData) return guestData.uid;
        return null;
    }, [user, guestData]);
    
    const currentUserData = useMemo(() => {
        if (isLoggedIn) return userData;
        if (isGuest) return guestData;
        return null;
    }, [isLoggedIn, userData, isGuest, guestData]);

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
                setUser(u); 
                setGuestData(null);
                const userRef = usersCollection.doc(u.uid); 
                const doc = await userRef.get();
                if (!doc.exists) { 
                    const newUserData = { uid: u.uid, email: u.email || null, displayName: u.displayName || u.uid.substring(0,5), photoURL: u.photoURL || null, customId: generateUID(), stats: { wins: 0, losses: 0, xp: 0 }, achievements: [], friends: [], friendRequests: [], createdAt: firebase.firestore.FieldValue.serverTimestamp(), lastChangedName: null, lastActive: firebase.firestore.FieldValue.serverTimestamp(), isAnonymous: false, currency: 100, inventory: {frames: [], titles: [], themes: [], gifts: [], badges: []}, equipped: {}, charisma: 0 }; 
                    await userRef.set(newUserData); 
                    setUserData(newUserData); 
                    if (u.displayName) setNickname(u.displayName); 
                } else {
                    const existingData = doc.data();
                    setUserData(existingData);
                    if (existingData.displayName) setNickname(existingData.displayName);
                    const unsubSnap = userRef.onSnapshot(snap => { if (snap.exists) { setUserData(snap.data()); if (snap.data().displayName) setNickname(snap.data().displayName); } });
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

    // Notifications Listener with Sound (Works without index)
    useEffect(() => {
        if (!user || !isLoggedIn) return;
        
        let previousCount = -1; // Start with -1 to detect first load
        
        // Use simple query without orderBy to avoid index requirement
        const unsub = notificationsCollection
            .where('toUserId', '==', user.uid)
            .limit(50)
            .onSnapshot(
                snap => {
                    let notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    // Sort manually by timestamp
                    notifs.sort((a, b) => {
                        const timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds || 0;
                        const timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds || 0;
                        return timeB - timeA;
                    });
                    
                    const newUnread = notifs.filter(n => !n.read).length;
                    
                    // Play sound if new notification arrived (not on first load)
                    if (previousCount !== -1 && newUnread > previousCount) {
                        playNotificationSound();
                        // Ring the bell
                        if (notificationBellRef.current) {
                            notificationBellRef.current.classList.add('ringing');
                            setTimeout(() => notificationBellRef.current?.classList.remove('ringing'), 500);
                        }
                    }
                    
                    previousCount = newUnread;
                    setNotifications(notifs);
                    setUnreadNotifications(newUnread);
                },
                error => {
                    console.error('Notifications listener error:', error);
                }
            );
        
        return () => unsub();
    }, [user, isLoggedIn]);

    // Room Listener
    useEffect(() => { if (!roomId) return; const unsub = roomsCollection.doc(roomId).onSnapshot(async doc => { if (doc.exists) { const data = doc.data(); setRoom(data); if(data.status?.includes('finished') && !data.summaryShown) { setShowSummary(true); historyCollection.add({ ...data, finishedAt: firebase.firestore.FieldValue.serverTimestamp() }); roomsCollection.doc(roomId).update({summaryShown: true}); } } else { setRoom(null); setRoomId(''); } }); return unsub; }, [roomId]);

    // Leaderboard
    useEffect(() => { if (activeView === 'leaderboard') { usersCollection.limit(100).get().then(snap => { let data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => !d.isAnonymous); data.sort((a, b) => (b.stats?.wins || 0) - (a.stats?.wins || 0)); setLeaderboardData(data); }); } }, [activeView]);
    
    // Friends
    useEffect(() => { if (activeView === 'friends' && userData && user && isLoggedIn) { if (userData.friends?.length > 0) { const unsub = usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', userData.friends).onSnapshot(snap => { setFriendsData(snap.docs.map(d => ({ id: d.id, ...d.data() }))); }); return unsub; } else { setFriendsData([]); } } }, [activeView, userData?.friends, user, isLoggedIn]);
    
    // Friend Requests
    useEffect(() => { if (userData && user && isLoggedIn) { if (userData.friendRequests?.length > 0) { const unsub = usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', userData.friendRequests).onSnapshot(snap => { setFriendRequests(snap.docs.map(d => ({ id: d.id, ...d.data() }))); }); return unsub; } else { setFriendRequests([]); } } }, [userData?.friendRequests, user, isLoggedIn]);
    
    // Chats Meta
    useEffect(() => { if (!user || !isLoggedIn) return; const unsub = chatsCollection.where('members', 'array-contains', user.uid).onSnapshot(snap => { let total = 0; const meta = {}; snap.docs.forEach(doc => { const d = doc.data(); meta[doc.id] = d; const myUnread = d.unread?.[user.uid] || 0; total += myUnread; }); setChatsMeta(meta); setTotalUnread(total); }); return unsub; }, [user, isLoggedIn]);
    
    // Timers
    useEffect(() => { if (room?.status === 'discussing' && room?.turnEndTime) { const interval = setInterval(() => { const remaining = Math.max(0, Math.floor((room.turnEndTime - Date.now()) / 1000)); setTurnTimer(remaining); if (remaining <= 0) { handleSkipTurn(true); clearInterval(interval); } }, 1000); return () => clearInterval(interval); } else setTurnTimer(30); }, [room?.status, room?.turnEndTime]);
    useEffect(() => { if (room?.status === 'voting' && room?.votingEndTime) { const interval = setInterval(() => { const remaining = Math.max(0, Math.floor((room.votingEndTime - Date.now()) / 1000)); setVotingTimer(remaining); if (remaining <= 0) { clearInterval(interval); } }, 1000); return () => clearInterval(interval); } else setVotingTimer(30); }, [room?.status, room?.votingEndTime]);
    useEffect(() => { if (room?.status === 'word_selection' && room?.wordSelEndTime) { const interval = setInterval(() => { const remaining = Math.max(0, Math.floor((room.wordSelEndTime - Date.now()) / 1000)); setWordSelTimer(remaining); if (remaining <= 0) { clearInterval(interval); } }, 1000); return () => clearInterval(interval); } else setWordSelTimer(30); }, [room?.status, room?.wordSelEndTime]);

    // Auth Functions
    const handleGoogleLogin = useCallback(async () => { const provider = new firebase.auth.GoogleAuthProvider(); try { await auth.signInWithPopup(provider); setShowDropdown(false); } catch (e) { console.error('Google login error:', e); } }, []);
    
    const handleLogout = useCallback(async () => { if (user) await auth.signOut(); setShowDropdown(false); setNickname(''); setGuestData(null); localStorage.removeItem('pro_spy_guest_uid'); localStorage.removeItem('pro_spy_nick'); }, [user]);

    // Guest System - Auto Create
    useEffect(() => {
        const initGuest = async () => {
            if (authLoading) return;
            if (user && !user.isAnonymous) return;
            
            const savedGuestUID = localStorage.getItem('pro_spy_guest_uid');
            if (savedGuestUID) {
                try {
                    const doc = await guestsCollection.doc(savedGuestUID).get();
                    if (doc.exists) {
                        setGuestData({ id: doc.id, ...doc.data() });
                        if (doc.data().displayName) setNickname(doc.data().displayName);
                        return;
                    }
                } catch (e) { console.error('Error loading guest:', e); }
            }
            
            const savedNick = localStorage.getItem('pro_spy_nick');
            const guestNick = savedNick || ('Player_' + Math.random().toString(36).substring(2, 6));
            const guestUID = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
            
            const newGuestData = {
                uid: guestUID, displayName: guestNick, photoURL: null, customId: generateUID(),
                stats: { wins: 0, losses: 0, xp: 0 }, currency: 0, charisma: 0, equipped: {},
                inventory: { frames: [], titles: [], themes: [], badges: [], gifts: [] },
                isAnonymous: true, isGuest: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastActive: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            try {
                await guestsCollection.doc(guestUID).set(newGuestData);
                setGuestData(newGuestData);
                setNickname(guestNick);
                localStorage.setItem('pro_spy_guest_uid', guestUID);
                localStorage.setItem('pro_spy_nick', guestNick);
            } catch (e) { console.error('Auto guest creation error:', e); }
        };
        
        initGuest();
    }, [authLoading, user]);
    
    useEffect(() => {
        if (!guestData?.uid) return;
        const unsub = guestsCollection.doc(guestData.uid).onSnapshot(snap => { if (snap.exists) setGuestData({ id: snap.id, ...snap.data() }); });
        return unsub;
    }, [guestData?.uid]);
    
    const getDefaultPhoto = useCallback((uData, name) => uData?.photoURL || `https://ui-avatars.com/api/?name=${name || 'Guest'}&background=random`, []);

    // Notification Functions
    const createNotification = useCallback(async (toUserId, type, message, fromUserId, fromName, giftData = null) => {
        try {
            await notificationsCollection.add({ 
                toUserId, fromUserId, fromName, type, message, giftData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(), 
                read: false 
            });
        } catch (e) { console.error('Notification error:', e); }
    }, []);

    const markNotificationRead = useCallback(async (notifId) => { try { await notificationsCollection.doc(notifId).update({ read: true }); } catch (e) { console.error('Mark read error:', e); } }, []);

    const clearAllNotifications = useCallback(async () => {
        try {
            const batch = db.batch();
            notifications.forEach(n => { batch.delete(notificationsCollection.doc(n.id)); });
            await batch.commit();
            setNotifications([]);
            setUnreadNotifications(0);
        } catch (e) { console.error('Clear notifications error:', e); }
    }, [notifications]);

    // Handle notification click
    const handleNotificationClick = useCallback((notif) => {
        if (notif.type === 'friend_request') {
            setActiveView('friends');
        } else if (notif.type === 'gift') {
            setNotification(notif.message);
        } else if (notif.type === 'message') {
            // Open chat with sender
            if (notif.fromUserId && notif.fromName) {
                const friend = { uid: notif.fromUserId, displayName: notif.fromName, photoURL: notif.fromPhoto };
                setChatFriend(friend);
                setShowPrivateChat(true);
            }
        }
    }, []);

    // Room Functions
    const handleCreateGame = useCallback(async () => { 
        if (!nickname.trim()) return; 
        if (isPrivate && !password.trim()) { setAlertMessage(t.privateRoomError); return; }
        playSound('click'); 
        setLoading(true); 
        
        const uid = currentUID;
        const tempUserData = currentUserData;
        
        if (!uid) { setLoading(false); setAlertMessage(lang === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'Error occurred, try again'); return; } 
        
        const id = Math.random().toString(36).substring(2, 7).toUpperCase(); 
        await roomsCollection.doc(id).set({ 
            id, admin: uid, status: 'waiting', 
            players: [{ uid: uid, name: nickname, status: 'active', photo: getDefaultPhoto(tempUserData, nickname), role: null, equipped: tempUserData?.equipped || {} }], 
            scenario: null, spyId: null, currentTurnUID: null, turnEndTime: null, votingEndTime: null, currentRound: 0, 
            messages: [], votes: {}, usedLocations: [], wordVotes: {}, chosenWord: null, wordSelEndTime: null, votingRequest: null, 
            mode: setupMode, isPrivate: isPrivate, password: isPrivate ? password : null, startedAt: null, summaryShown: false 
        }); 
        setRoomId(id); 
        setLoading(false); 
        setShowSetupModal(false); 
        setActiveView('lobby'); 
    }, [nickname, isPrivate, password, currentUID, currentUserData, setupMode, t, lang, getDefaultPhoto]);
    
    const handleJoinGame = useCallback(async (id, pwd) => {
        if (!id || id.trim() === "") { setJoinError(t.enterCodeError); return; }
        if (!nickname.trim()) return;
        playSound('click'); 
        setLoading(true); 
        setJoinError(''); 
        
        const uid = currentUID;
        const tempUserData = currentUserData;
        
        if (!uid) { setLoading(false); setAlertMessage(lang === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'Error occurred, try again'); return; } 
        
        const ref = roomsCollection.doc(id.toUpperCase()); 
        const snap = await ref.get(); 
        if (snap.exists) { 
            const data = snap.data(); 
            if(data.isPrivate && data.password !== pwd) { setJoinError("Incorrect Password"); setLoading(false); return; } 
            const exists = data.players.find(p => p.uid === uid); 
            if (!exists) { 
                await ref.update({ 
                    players: [...data.players, { uid: uid, name: nickname, status: 'active', photo: getDefaultPhoto(tempUserData, nickname), role: null, equipped: tempUserData?.equipped || {} }] 
                }); 
            } 
            setRoomId(id.toUpperCase()); 
            setActiveView('lobby'); 
        } else { setJoinError("Room not found"); } 
        setLoading(false); 
    }, [nickname, currentUID, currentUserData, t, lang, getDefaultPhoto]);
    
    const handleLeaveRoom = useCallback(async () => { 
        if (!room || !currentUID) return; 
        playSound('click'); 
        const isAdmin = room.admin === currentUID;
        if (isAdmin) { await roomsCollection.doc(roomId).delete(); } 
        else { await roomsCollection.doc(roomId).update({ players: room.players.filter(p => p.uid !== currentUID) }); }
        setRoom(null); 
        setRoomId(''); 
        setShowSummary(false); 
    }, [room, currentUID, roomId]);

    // Game Logic Functions (abbreviated for space - same as before)
    const startGame = useCallback(async () => { if (room.admin !== currentUID) return; playSound('success'); const activePlayers = room.players.filter(p => p.status === 'active'); const playerCount = activePlayers.length; if (room.mode === 'advanced' && playerCount < 6) { setAlertMessage("Advanced mode requires 6+ players!"); return; } if (playerCount < 3) { setAlertMessage(t.needPlayers); return; } if (playerCount > 10) { setAlertMessage("Max 10 players allowed."); return; } const used = room.usedLocations || []; const avail = SCENARIOS.filter(s => !used.includes(s.loc_en)); const scenario = (avail.length > 0 ? avail : SCENARIOS)[Math.floor(Math.random() * (avail.length || SCENARIOS.length))]; const spy = activePlayers[Math.floor(Math.random() * activePlayers.length)]; let roles = {}; if (room.mode === 'advanced') { roles[spy.uid] = 'spy'; let potentialWhites = activePlayers.filter(p => p.uid !== spy.uid); if(potentialWhites.length > 0) { const mrWhite = potentialWhites[Math.floor(Math.random() * potentialWhites.length)]; roles[mrWhite.uid] = 'mrwhite'; potentialWhites = potentialWhites.filter(p => p.uid !== mrWhite.uid); } if(potentialWhites.length > 0) { const informant = potentialWhites[Math.floor(Math.random() * potentialWhites.length)]; roles[informant.uid] = 'informant'; } activePlayers.forEach(p => { if(!roles[p.uid]) roles[p.uid] = 'agent'; }); } else { activePlayers.forEach(p => roles[p.uid] = p.uid === spy.uid ? 'spy' : 'agent'); } let potentialStarters = activePlayers.filter(p => roles[p.uid] !== 'spy'); if (potentialStarters.length === 0) potentialStarters = activePlayers; const firstPlayer = potentialStarters[Math.floor(Math.random() * potentialStarters.length)]; await roomsCollection.doc(roomId).update({ status: 'word_selection', scenario, spyId: spy.uid, currentTurnUID: firstPlayer.uid, turnEndTime: null, currentRound: 1, players: room.players.map(p => ({ ...p, vote: null, role: roles[p.uid] || 'agent' })), usedLocations: firebase.firestore.FieldValue.arrayUnion(scenario.loc_en), messages: [], votes: {}, wordVotes: {}, chosenWord: null, wordSelEndTime: Date.now() + 30000, votingRequest: null, startedAt: firebase.firestore.FieldValue.serverTimestamp() }); }, [room, currentUID, roomId, t]);

    const submitWordVote = useCallback(async (word) => { if (!currentUID || !room || room.status !== 'word_selection') return; playSound('click'); const voteUpdate = {}; voteUpdate[`wordVotes.${currentUID}`] = word; await roomsCollection.doc(roomId).update(voteUpdate); }, [currentUID, room, roomId]);
    
    const finishWordSelection = useCallback(async () => { if (!room || room.status !== 'word_selection') return; const freshSnap = await roomsCollection.doc(roomId).get(); const freshData = freshSnap.data(); const counts = {}; Object.values(freshData.wordVotes || {}).forEach(v => counts[v] = (counts[v] || 0) + 1); let maxCount = 0; let chosenWord = (lang === 'ar' ? freshData.scenario.words_ar[0] : freshData.scenario.words_en[0]); for (const w in counts) { if (counts[w] > maxCount) { maxCount = counts[w]; chosenWord = w; } } await roomsCollection.doc(roomId).update({ status: 'discussing', turnEndTime: Date.now() + 30000, chosenWord: chosenWord, wordSelEndTime: null }); }, [room, roomId, lang]);
    
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
    
    const openPrivateChat = useCallback((friend) => { setChatFriend(friend); setShowPrivateChat(true); if (user) { const cId = getChatId(user.uid, friend.uid); setOpenChatId(cId); chatsCollection.doc(cId).update({ [`unread.${user.uid}`]: 0 }).catch(() => {}); } }, [user]);
    
    const closePrivateChat = useCallback(() => { setShowPrivateChat(false); setChatFriend(null); setOpenChatId(null); }, []);
    
    const handleSendRequest = useCallback(async (targetUid) => { if (!targetUid || !isLoggedIn) return; const friendUid = targetUid; if (userData.friends?.includes(friendUid)) return; if (userData.friendRequests?.includes(friendUid)) return; await usersCollection.doc(friendUid).update({ friendRequests: firebase.firestore.FieldValue.arrayUnion(user.uid) });
        await createNotification(friendUid, 'friend_request', `${userData.displayName} ${t.friendRequest}`, user.uid, userData.displayName);
    }, [userData, user, isLoggedIn, t, createNotification]);
    
    const handleAddFriendById = useCallback(async () => {
        if (!addFriendId.trim() || !isLoggedIn) return;
        setFriendSearchMsg('');
        const userQuery = await usersCollection.where('customId', '==', addFriendId.trim()).get();
        if (userQuery.empty) {
            const uidQuery = await usersCollection.where(firebase.firestore.FieldPath.documentId(), '>=', addFriendId.trim()).where(firebase.firestore.FieldPath.documentId(), '<=', addFriendId.trim() + '\uf8ff').get();
            if (uidQuery.empty) { setFriendSearchMsg(t.friendNotFound); return; }
            const targetDoc = uidQuery.docs[0];
            const targetUid = targetDoc.id;
            if (targetUid === user.uid) { setFriendSearchMsg(lang === 'ar' ? 'لا يمكنك إضافة نفسك' : 'Cannot add yourself'); return; }
            if (userData.friends?.includes(targetUid)) { setFriendSearchMsg(lang === 'ar' ? 'صديق بالفعل' : 'Already a friend'); return; }
            await handleSendRequest(targetUid);
            setFriendSearchMsg(t.requestSent);
            setAddFriendId('');
            return;
        }
        const targetDoc = userQuery.docs[0];
        const targetUid = targetDoc.id;
        if (targetUid === user.uid) { setFriendSearchMsg(lang === 'ar' ? 'لا يمكنك إضافة نفسك' : 'Cannot add yourself'); return; }
        if (userData.friends?.includes(targetUid)) { setFriendSearchMsg(lang === 'ar' ? 'صديق بالفعل' : 'Already a friend'); return; }
        if (userData.friendRequests?.includes(targetUid)) { setFriendSearchMsg(lang === 'ar' ? 'لديك طلب من هذا المستخدم بالفعل' : 'You already have a request from this user'); return; }
        await handleSendRequest(targetUid);
        setFriendSearchMsg(t.requestSent);
        setAddFriendId('');
    }, [addFriendId, isLoggedIn, userData, user, t, lang, handleSendRequest]);
    
    const handleAcceptRequest = useCallback(async (fromUid) => {
        if (!user || !isLoggedIn) return;
        await usersCollection.doc(user.uid).update({ friends: firebase.firestore.FieldValue.arrayUnion(fromUid), friendRequests: firebase.firestore.FieldValue.arrayRemove(fromUid) });
        await usersCollection.doc(fromUid).update({ friends: firebase.firestore.FieldValue.arrayUnion(user.uid) });
        // Send notification to the person who sent the request
        await createNotification(fromUid, 'friend_request_accepted', `${userData.displayName} ${lang === 'ar' ? 'قبل طلب صداقتك!' : 'accepted your friend request!'}`, user.uid, userData.displayName);
        setNotification(t.friendAdded);
    }, [user, isLoggedIn, t, userData, createNotification, lang]);
    
    const handleRejectRequest = useCallback(async (fromUid) => {
        if (!user || !isLoggedIn) return;
        await usersCollection.doc(user.uid).update({ friendRequests: firebase.firestore.FieldValue.arrayRemove(fromUid) });
    }, [user, isLoggedIn]);

    // Gift Functions
    const handleSendGiftToUser = useCallback(async (gift, targetUser) => {
        const currency = userData?.currency || 0;
        if (currency < gift.cost) return;
        
        const minBack = gift.minCashback || 1;
        const maxBack = gift.maxCashback || Math.floor(gift.cost * 0.1);
        const cashbackForSender = generateRandomCashback(minBack, maxBack);
        const cashbackForReceiver = generateRandomCashback(minBack, maxBack);
        
        const newCurrency = currency - gift.cost + cashbackForSender;
        
        try {
            await usersCollection.doc(user.uid).update({ currency: newCurrency });
            await usersCollection.doc(targetUser.uid).update({ 
                charisma: firebase.firestore.FieldValue.increment(gift.charisma),
                currency: firebase.firestore.FieldValue.increment(cashbackForReceiver)
            });
            await createNotification(targetUser.uid, 'gift', `${userData.displayName} ${t.giftNotification}: ${gift.emoji} (+${cashbackForReceiver.toLocaleString()} 💰)`, user.uid, userData.displayName, { giftId: gift.id, giftName: lang === 'ar' ? gift.name_ar : gift.name_en, charisma: gift.charisma, cashback: cashbackForReceiver });
            playSound('gift');
            setNotification(`${t.giftSent} +${cashbackForSender.toLocaleString()} 💰`);
        } catch (error) { console.error("Gift error:", error); }
    }, [userData, user, t, lang, createNotification]);

    // Shop Functions
    const handlePurchase = useCallback(async (item) => {
        if (!user || !isLoggedIn) { setShowLoginAlert(true); return; }
        const currency = userData?.currency || 0;
        if (currency < item.cost) { setNotification(t.purchaseFail); return; }
        const inventory = userData?.inventory || { frames: [], titles: [], themes: [], badges: [], gifts: [] };
        if (inventory[item.type]?.includes(item.id)) { setNotification(t.alreadyOwned); return; }
        try {
            const newCurrency = currency - item.cost;
            const newInventory = { ...inventory };
            newInventory[item.type] = [...(newInventory[item.type] || []), item.id];
            await usersCollection.doc(user.uid).update({ currency: newCurrency, inventory: newInventory });
            playSound('success');
            setNotification(t.purchaseSuccess);
        } catch (error) { console.error('Purchase error:', error); }
    }, [user, userData, isLoggedIn, t]);
    
    const handleEquip = useCallback(async (item) => {
        if (!user || !isLoggedIn) return;
        try {
            const equipped = userData?.equipped || {};
            const newEquipped = { ...equipped, [item.type]: item.id };
            await usersCollection.doc(user.uid).update({ equipped: newEquipped });
            playSound('click');
            setNotification(lang === 'ar' ? 'تم التزيين!' : 'Equipped!');
        } catch (error) { console.error('Equip error:', error); }
    }, [user, userData, isLoggedIn, lang]);
    
    const handleUnequip = useCallback(async (type) => {
        if (!user || !isLoggedIn) return;
        try {
            const equipped = userData?.equipped || {};
            const newEquipped = { ...equipped };
            delete newEquipped[type];
            await usersCollection.doc(user.uid).update({ equipped: newEquipped });
            playSound('click');
            setNotification(lang === 'ar' ? 'تمت الإزالة!' : 'Unequipped!');
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

    // RENDER
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl animate-bounce mb-4">🕵️</div>
                    <div className="text-lg font-bold">{t.loading}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-wrapper" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <NotificationToast message={notification} onClose={() => setNotification(null)} />
            
            {/* Login Alert */}
            {showLoginAlert && (
                <div className="modal-overlay" onClick={() => setShowLoginAlert(false)}>
                    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '320px' }}>
                        <div className="modal-header"><h2 className="modal-title">{t.loginRequired}</h2><ModalCloseBtn onClose={() => setShowLoginAlert(false)} /></div>
                        <div className="modal-body text-center">
                            <div className="text-4xl mb-4">🔐</div>
                            <p className="text-sm text-gray-300 mb-4">{t.guestDesc}</p>
                            <button onClick={() => { setShowLoginAlert(false); handleGoogleLogin(); }} className="btn-google w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                {t.loginGoogle}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <TutorialModal show={showTutorial} onClose={() => { setShowTutorial(false); localStorage.setItem('pro_spy_tutorial_v2', 'true'); }} lang={lang} />
            
            {/* Match Summary */}
            {showSummary && room && (
                <div className="modal-overlay" onClick={() => setShowSummary(false)}>
                    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2 className="modal-title">{t.summaryTitle}</h2><ModalCloseBtn onClose={() => setShowSummary(false)} /></div>
                        <div className="modal-body text-center">
                            <div className="text-4xl mb-4">{room.status === 'finished_spy_caught' ? '🎉' : '🕵️'}</div>
                            <h2 className="text-xl font-bold mb-4">{room.status === 'finished_spy_caught' ? t.agentsWin : t.spyWin}</h2>
                        </div>
                        <div className="modal-footer">
                            {room.admin === currentUID && (<button onClick={resetGame} className="btn-neon w-full py-2 rounded-lg text-sm font-bold mb-2">{t.playAgain}</button>)}
                            <button onClick={handleLeaveRoom} className="btn-ghost w-full py-2 rounded-lg text-sm">{t.leaveRoom}</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Shop */}
            {showShop && <ShopModal show={showShop} onClose={() => setShowShop(false)} userData={isLoggedIn ? userData : guestData} lang={lang} onPurchase={handlePurchase} onEquip={handleEquip} onUnequip={handleUnequip} />}
            
            {/* Inventory */}
            {showInventory && <InventoryModal show={showInventory} onClose={() => setShowInventory(false)} userData={isLoggedIn ? userData : guestData} lang={lang} onEquip={handleEquip} onUnequip={handleUnequip} onSendGift={handleSendGiftToUser} friendsData={friendsData} isLoggedIn={isLoggedIn} />}
            
            {/* My Account */}
            {showMyAccount && (
                <div className="modal-overlay" onClick={() => setShowMyAccount(false)}>
                    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2 className="modal-title">{t.myAccount}</h2><ModalCloseBtn onClose={() => setShowMyAccount(false)} /></div>
                        <div className="modal-body">
                            <div className="profile-header">
                                <div className="profile-avatar-section">
                                    <div className="profile-avatar-container">
                                        <AvatarWithFrame photoURL={currentUserData?.photoURL} equipped={currentUserData?.equipped} size="lg" />
                                    </div>
                                    <h3 className="profile-name">{currentUserData?.displayName || 'User'}</h3>
                                    {currentUserData?.equipped?.titles && <div className="profile-title-container">{renderTitle(currentUserData.equipped.titles, lang)}</div>}
                                    {currentUserData?.equipped?.badges && <div className="profile-badge-container">{renderBadge(currentUserData.equipped.badges, 28)}</div>}
                                    {isGuest && <div className="profile-account-type guest">{t.guestAccount}</div>}
                                    <div className="profile-id" onClick={() => { navigator.clipboard.writeText(currentUserData?.customId || ''); }}>
                                        <span>ID: {currentUserData?.customId || 'N/A'}</span>
                                        <span className="text-[10px]">📋</span>
                                    </div>
                                </div>
                            </div>
                            {isLoggedIn && (
                                <div className="bg-white/5 rounded-lg p-3 mb-3">
                                    <h4 className="text-xs font-bold text-gray-400 mb-2">{t.accountInfo}</h4>
                                    <div className="flex items-center justify-between mb-2 p-2 bg-black/20 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">📧</span>
                                            <span className="text-sm">{showEmail ? (user?.email || 'N/A') : maskEmail(user?.email)}</span>
                                        </div>
                                        <button onClick={() => setShowEmail(!showEmail)} className="text-xs bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition">{showEmail ? t.hideEmail : t.showEmail}</button>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
                                        <div className="flex items-center gap-2"><span className="text-gray-400">📅</span><span className="text-sm">{t.memberSince}</span></div>
                                        <span className="text-xs text-gray-300">{currentUserData?.createdAt?.toDate?.() ? currentUserData.createdAt.toDate().toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                            )}
                            <CharismaDisplay charisma={currentUserData?.charisma} lang={lang} />
                            <div className="profile-stats">
                                <div className="profile-stat"><div className="profile-stat-value">{currentUserData?.stats?.wins || 0}</div><div className="profile-stat-label">{t.wins}</div></div>
                                <div className="profile-stat"><div className="profile-stat-value">{currentUserData?.stats?.losses || 0}</div><div className="profile-stat-label">{t.losses}</div></div>
                                <div className="profile-stat"><div className="profile-stat-value">{calculateLevel(currentUserData?.stats?.xp || 0)}</div><div className="profile-stat-label">{t.level}</div></div>
                            </div>
                            <KDCircle wins={currentUserData?.stats?.wins || 0} losses={currentUserData?.stats?.losses || 0} lang={lang} />
                            <div className="flex items-center justify-center gap-2 mb-4 p-2 bg-yellow-500/10 rounded-lg">
                                <span className="text-2xl">🧠</span>
                                <span className="text-lg font-bold text-yellow-400">{(currentUserData?.currency || 0).toLocaleString()} {CURRENCY_NAME}</span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            {isLoggedIn && (
                                <div className="flex gap-2 mb-2">
                                    <button onClick={() => { setShowMyAccount(false); setShowShop(true); }} className="btn-gold flex-1 py-2 rounded-lg text-sm font-bold">🛒 {t.shop}</button>
                                    <button onClick={() => { setShowMyAccount(false); setShowInventory(true); }} className="btn-neon flex-1 py-2 rounded-lg text-sm font-bold">📦 {t.inventory}</button>
                                </div>
                            )}
                            {isLoggedIn ? (
                                <button onClick={handleLogout} className="btn-danger w-full py-2 rounded-lg text-sm">{t.logout}</button>
                            ) : isGuest ? (
                                <div className="flex gap-2">
                                    <button onClick={handleLogout} className="btn-ghost flex-1 py-2 rounded-lg text-sm">{t.logout}</button>
                                    <button onClick={() => { setShowMyAccount(false); handleGoogleLogin(); }} className="btn-neon flex-1 py-2 rounded-lg text-sm">{t.loginGoogle}</button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
            
            {/* User Profile */}
            {showUserProfile && <UserProfileModal show={showUserProfile} onClose={() => setShowUserProfile(false)} targetUID={targetProfileUID} lang={lang} currentUserUID={currentUID} onSendFriendRequest={handleSendRequest} onSendGift={handleSendGiftToUser} userData={currentUserData} currentUserFriends={userData?.friends} currentUserFriendRequests={userData?.friendRequests} />}
            
            {/* Browse Rooms */}
            {showBrowseRooms && (
                <div className="modal-overlay" onClick={() => setShowBrowseRooms(false)}>
                    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header"><h2 className="modal-title">{t.browse}</h2><ModalCloseBtn onClose={() => setShowBrowseRooms(false)} /></div>
                        <div className="modal-body"><div className="text-center py-8 text-gray-400">{t.noRooms}</div></div>
                    </div>
                </div>
            )}
            
            {/* Private Chat */}
            {showPrivateChat && chatFriend && user && <PrivateChatModal show={showPrivateChat} onClose={closePrivateChat} friend={chatFriend} currentUser={currentUserData} user={user} lang={lang} onSendNotification={createNotification} onSendGift={handleSendGiftToUser} currency={userData?.currency || 0} />}
            
            {/* Alert */}
            {alertMessage && ( 
                <div className="alert-modal" onClick={() => setAlertMessage(null)}> 
                    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><span></span><ModalCloseBtn onClose={() => setAlertMessage(null)} /></div>
                        <div className="modal-body text-center"><div className="text-2xl mb-2">🚫</div><p className="font-bold mb-4">{alertMessage}</p><button onClick={() => setAlertMessage(null)} className="btn-ghost px-4 py-2 rounded-lg text-sm">{t.ok}</button></div>
                    </div> 
                </div> 
            )}
            
            {/* Setup Modal */}
            {showSetupModal && ( 
                <div className="modal-overlay" onClick={()=>setShowSetupModal(false)}> 
                    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}> 
                        <div className="modal-header"><h2 className="modal-title">{t.create}</h2><ModalCloseBtn onClose={() => setShowSetupModal(false)} /></div>
                        <div className="modal-body">
                            <div className="space-y-3"> 
                                <div><label className="text-[10px] text-gray-400 block mb-1">{t.nickname}</label><input className="input-dark w-full p-2 rounded font-bold text-sm" value={nickname} onChange={e => { setNickname(e.target.value); localStorage.setItem('pro_spy_nick', e.target.value); }} placeholder={t.nickname} /></div>
                                <div className="flex gap-2">
                                    <button onClick={() => setSetupMode('normal')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${setupMode === 'normal' ? 'btn-neon' : 'btn-ghost'}`}>{t.normalMode}</button>
                                    <button onClick={() => setSetupMode('advanced')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${setupMode === 'advanced' ? 'btn-neon' : 'btn-ghost'}`}>{t.advancedMode}</button>
                                </div>
                                <p className="text-[10px] text-gray-400 text-center">{setupMode === 'normal' ? t.modeNormalDesc : t.modeAdvDesc}</p>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} id="privateCheck" />
                                    <label htmlFor="privateCheck" className="text-xs">{t.privateRoom}</label>
                                </div>
                                {isPrivate && (
                                    <div className="relative">
                                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={t.password} className="input-dark w-full p-2 pr-10 rounded text-sm" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">{showPassword ? '🙈' : '👁️'}</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer"><button onClick={handleCreateGame} disabled={loading || !nickname.trim()} className="btn-neon w-full py-2 rounded-lg text-sm font-bold">{loading ? t.loading : t.create}</button></div>
                    </div> 
                </div> 
            )}
            
            {/* Header */}
            <header className="site-header">
                <div className="flex items-center gap-2">
                    <div className="logo-container"><div className="logo-border"></div><span className="text-xl">🕵️</span></div>
                    <div><h1 className="game-title text-lg font-tech">{t.appName}</h1><p className="text-[8px] text-gray-500 uppercase tracking-wider">{t.tagline}</p></div>
                </div>
                <div className="header-actions">
                    <div className="currency-display" onClick={() => { if(isLoggedIn) setShowShop(true); else setShowLoginAlert(true); }}>
                        <span className="currency-icon">🧠</span>
                        <span className="currency-value">{(currentUserData?.currency || 0).toLocaleString()}</span>
                    </div>
                    <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="text-xs bg-white/10 px-2 py-1 rounded">{t.langBtn}</button>
                    
                    {/* Notification Bell */}
                    {isLoggedIn && (
                        <div className="notification-center">
                            <div ref={notificationBellRef} className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
                                <span className="notification-bell-icon">🔔</span>
                                {unreadNotifications > 0 && <span className="notification-badge">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>}
                            </div>
                            <NotificationDropdown 
                                show={showNotifications} 
                                onClose={() => setShowNotifications(false)}
                                notifications={notifications}
                                onMarkRead={markNotificationRead}
                                onClearAll={clearAllNotifications}
                                onNotificationClick={handleNotificationClick}
                                lang={lang}
                            />
                        </div>
                    )}
                    
                    {/* User Menu */}
                    <div className="relative">
                        <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
                            {isLoggedIn || isGuest ? (
                                <>
                                    <AvatarWithFrame photoURL={currentUserData?.photoURL} equipped={currentUserData?.equipped} size="sm" />
                                    <span className="text-[10px] text-gray-300 max-w-[60px] truncate">{currentUserData?.displayName}</span>
                                </>
                            ) : (
                                <span className="text-xs px-2 py-1">{t.loginGoogle}</span>
                            )}
                        </button>
                        {showDropdown && (
                            <div className="dropdown-menu glass-panel rounded-lg p-1 min-w-[160px]">
                                {isLoggedIn || isGuest ? (
                                    <>
                                        <button onClick={() => { setShowMyAccount(true); setShowDropdown(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2"><span>👤</span> {t.myAccount}</button>
                                        {isLoggedIn && (
                                            <>
                                                <button onClick={() => { setShowShop(true); setShowDropdown(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2"><span>🛒</span> {t.shop}</button>
                                                <button onClick={() => { setShowInventory(true); setShowDropdown(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2"><span>📦</span> {t.inventory}</button>
                                            </>
                                        )}
                                        <button onClick={() => { handleLogout(); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2 text-red-400"><span>🚪</span> {t.logout}</button>
                                    </>
                                ) : (
                                    <button onClick={() => { handleGoogleLogin(); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2"><span>🔑</span> {t.loginGoogle}</button>
                                )}
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
                        <button onClick={() => { if(isLoggedIn) setActiveView('friends'); else requireLogin(); }} className={`tab-button relative ${activeView === 'friends' ? 'active' : ''}`}>
                            {t.tabFriends}
                            {totalFriendsUnread > 0 && <span className="friends-tab-badge">{totalFriendsUnread > 9 ? '9+' : totalFriendsUnread}</span>}
                        </button>
                    </div>
                    
                    {activeView === 'lobby' && (
                        <div className="card-container">
                            {isGuest && <GuestBanner lang={lang} />}
                            <div className="space-y-3">
                                <div><label className="text-[10px] text-gray-400 block mb-1">{t.nickname}</label><input className="input-dark w-full p-3 rounded-lg font-bold" value={nickname} onChange={e => { setNickname(e.target.value); localStorage.setItem('pro_spy_nick', e.target.value); }} placeholder={t.nickname} /></div>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowSetupModal(true)} disabled={!nickname.trim()} className="btn-neon flex-1 py-3 rounded-lg font-bold text-sm">{t.create}</button>
                                    <button onClick={() => setShowBrowseRooms(true)} className="btn-ghost px-4 py-3 rounded-lg text-sm">{t.browse}</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input className="input-dark flex-1 p-3 rounded-lg text-center font-mono uppercase tracking-wider" value={inputCode} onChange={e => setInputCode(e.target.value.toUpperCase())} placeholder={t.codePlaceholder} maxLength={6} />
                                    <button onClick={() => handleJoinGame(inputCode, '')} disabled={loading || !inputCode.trim() || !nickname.trim()} className="btn-neon px-4 py-3 rounded-lg font-bold text-sm">{loading ? '...' : t.join}</button>
                                </div>
                                {joinError && <p className="text-xs text-red-400 text-center">{joinError}</p>}
                            </div>
                        </div>
                    )}
                    
                    {activeView === 'leaderboard' && (
                        <div className="card-container">
                            <div className="overflow-y-auto max-h-[60vh]">
                                {leaderboardData.map((player, i) => (
                                    <div key={player.id} onClick={() => openProfile(player.id)} className="leaderboard-row cursor-pointer">
                                        <span className="w-6 text-xs font-bold text-gray-500">{i + 1}</span>
                                        <AvatarWithFrame photoURL={player.photoURL} equipped={player.equipped} size="sm" />
                                        <span className="flex-1 text-sm font-medium truncate">{player.displayName}</span>
                                        <div className="text-right"><div className="text-xs font-bold text-primary">{player.stats?.wins || 0} {t.wins}</div></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {activeView === 'friends' && (
                        <div className="card-container friends-container">
                            <div className="add-friend-section">
                                <div className="add-friend-title">{t.addFriend}</div>
                                <div className="add-friend-input-row">
                                    <input type="text" className="add-friend-input" value={addFriendId} onChange={e => setAddFriendId(e.target.value)} placeholder={t.friendIdPlaceholder} />
                                    <button onClick={handleAddFriendById} disabled={!addFriendId.trim()} className="btn-neon px-4 py-2 rounded-lg text-xs">{t.addFriend}</button>
                                </div>
                                {friendSearchMsg && <p className={`text-xs mt-2 text-center ${friendSearchMsg.includes('تم') || friendSearchMsg.includes('Sent') ? 'text-green-400' : 'text-red-400'}`}>{friendSearchMsg}</p>}
                            </div>
                            {friendRequests.length > 0 && (
                                <div className="friend-requests-section">
                                    <div className="friend-requests-header">{t.incomingRequests}</div>
                                    {friendRequests.map(req => (
                                        <div key={req.id} className="friend-request-item">
                                            <AvatarWithFrame photoURL={req.photoURL} equipped={req.equipped} size="sm" />
                                            <div className="friend-request-info"><div className="friend-request-name">{req.displayName}</div></div>
                                            <div className="friend-request-actions">
                                                <button onClick={() => handleAcceptRequest(req.id)} className="btn-success px-3 py-1 rounded text-xs">{t.accept}</button>
                                                <button onClick={() => handleRejectRequest(req.id)} className="btn-danger px-3 py-1 rounded text-xs">{t.reject}</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="friends-list-section">
                                <div className="friends-list-header">{t.tabFriends} ({friendsData.length})</div>
                                {friendsData.length === 0 ? (
                                    <div className="no-friends-message"><div className="text-4xl mb-2">👥</div><p>{t.noFriends}</p></div>
                                ) : (
                                    friendsData.map(friend => (
                                        <div key={friend.id} className="friend-item">
                                            <AvatarWithFrame photoURL={friend.photoURL} equipped={friend.equipped} size="sm" />
                                            <div className="friend-info">
                                                <div className="friend-name">{friend.displayName}</div>
                                                <div className="friend-status">{friend.lastActive && (Date.now() - friend.lastActive.toDate?.() < 300000) ? <span className="text-green-400">{t.online}</span> : <span className="text-gray-500">{t.offline}</span>}</div>
                                            </div>
                                            <div className="friend-actions">
                                                <button onClick={() => openPrivateChat(friend)} className="btn-ghost px-2 py-1 rounded text-xs">💬</button>
                                                <button onClick={() => openProfile(friend.id)} className="btn-ghost px-2 py-1 rounded text-xs">👤</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </main>
            )}
            
            {/* Room View */}
            {room && (
                <main className="main-content">
                    <div className="glass-panel rounded-lg p-2 mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button onClick={handleCopy} className="bg-white/10 px-2 py-1 rounded text-xs font-mono">{copied ? t.copied : roomId}</button>
                            {room.isPrivate && <span className="text-[10px] text-yellow-400">🔒</span>}
                        </div>
                        <div className="text-xs text-gray-400">{t.roundsFormat(room.currentRound || 0, MAX_ROUNDS)}</div>
                    </div>
                    
                    {room.status === 'waiting' && (
                        <div className="card-container">
                            <h3 className="text-sm font-bold mb-3 text-center">{t.lobbyTitle}</h3>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {room.players.map(p => (
                                    <div key={p.uid} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg cursor-pointer hover:bg-white/10" onClick={() => openProfile(p.uid)}>
                                        <AvatarWithFrame photoURL={p.photo} equipped={p.equipped} size="sm" />
                                        <span className="text-xs truncate">{p.name}</span>
                                        {p.uid === room.admin && <span className="text-[8px] bg-yellow-500/20 text-yellow-400 px-1 rounded">HOST</span>}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                {room.admin === currentUID ? (<button onClick={startGame} className="btn-neon flex-1 py-2 rounded-lg text-sm font-bold">{t.start}</button>) : (<p className="text-xs text-gray-400 text-center flex-1">{t.waiting}</p>)}
                                <button onClick={handleLeaveRoom} className="btn-danger px-4 py-2 rounded-lg text-sm">{t.leaveRoom}</button>
                            </div>
                        </div>
                    )}
                    
                    {room.status === 'word_selection' && !isSpectator && (
                        <div className="card-container">
                            <h3 className="text-sm font-bold mb-2 text-center">{t.wordSelectionTitle}</h3>
                            <p className="text-xs text-gray-400 text-center mb-3">{t.wordSelectionDesc}</p>
                            <div className="text-center text-xs text-yellow-400 mb-3">⏱️ {wordSelTimer}s</div>
                            <div className="grid grid-cols-2 gap-2">
                                {(lang === 'ar' ? room.scenario?.words_ar : room.scenario?.words_en)?.map((word, i) => (
                                    <button key={i} onClick={() => submitWordVote(word)} className={`word-vote-card ${hasVotedWord === word ? 'selected' : ''}`}><span className="font-bold">{word}</span></button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {room.status === 'discussing' && (
                        <div className="flex-1 flex flex-col gap-2">
                            <div className="card-container">
                                <div className="grid grid-cols-3 gap-2">
                                    {room.players.filter(p => p.status === 'active').map(p => (
                                        <div key={p.uid} className={`player-card ${room.currentTurnUID === p.uid ? 'active' : ''} ${p.uid === currentUID ? 'border-primary' : ''}`} onClick={() => openProfile(p.uid)}>
                                            <AvatarWithFrame photoURL={p.photo} equipped={p.equipped} size="sm" />
                                            <span className="text-[10px] truncate mt-1">{p.name}</span>
                                            {room.currentTurnUID === p.uid && <span className="text-[8px] text-primary">Speaking</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {!isSpectator && me && (
                                <div className={`identity-square identity-${myRole === 'spy' ? 'spy' : myRole === 'mrwhite' ? 'mrwhite' : myRole === 'informant' ? 'informant' : 'agent'}`}>
                                    <div className="text-4xl mb-2">{myRole === 'spy' ? '🕵️' : myRole === 'mrwhite' ? '👻' : myRole === 'informant' ? '👁️' : '🤵'}</div>
                                    <div className="text-lg font-bold">{myRole === 'spy' ? t.statusSpy : myRole === 'mrwhite' ? t.statusMrWhite : myRole === 'informant' ? t.statusInformant : t.statusAgent}</div>
                                    {myRole === 'spy' && (<div className="text-xs text-gray-300 mt-1">{t.location}: {lang === 'ar' ? room.scenario?.loc_ar : room.scenario?.loc_en}</div>)}
                                    {myRole !== 'spy' && room.chosenWord && (<div className="text-xs text-gray-300 mt-1">{t.selectedWord}: {room.chosenWord}</div>)}
                                </div>
                            )}
                            <div className="card-container">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="timer-bar-container"><div className="timer-bar-fill" style={{ width: `${(turnTimer / 30) * 100}%` }}></div></div>
                                    <span className="text-xs text-gray-400">{turnTimer}s</span>
                                </div>
                                <div className="flex gap-2">
                                    {isMyTurn && (<button onClick={() => handleSkipTurn()} className="btn-ghost flex-1 py-2 rounded-lg text-xs">{t.skip}</button>)}
                                    <button onClick={requestVoting} className="btn-vote flex-1 py-2 rounded-lg text-xs font-bold">{t.vote}</button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {room.status === 'voting' && (
                        <div className="card-container">
                            <h3 className="text-sm font-bold mb-2 text-center">{t.vote}</h3>
                            <div className="text-center text-xs text-yellow-400 mb-3">⏱️ {votingTimer}s</div>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {room.players.filter(p => p.status === 'active').map(p => (
                                    <button key={p.uid} onClick={() => submitVote(p.uid)} disabled={hasVoted} className={`player-card ${hasVoted === p.uid ? 'border-primary bg-primary/10' : ''}`}>
                                        <AvatarWithFrame photoURL={p.photo} equipped={p.equipped} size="sm" />
                                        <span className="text-xs truncate mt-1">{p.name}</span>
                                    </button>
                                ))}
                            </div>
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

// Wrap with ErrorBoundary
const AppWithErrorBoundary = () => (
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppWithErrorBoundary />);
