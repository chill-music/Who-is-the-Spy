// ==========================================
// PRO SPY - SCRIPT V10 - COMPLETE FILE
// All-in-one: Config + Components + App
// Changes: Gift System (Bonus only, NO Cashback), Gift Log, Improved Chat, Friend Selection Fix
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
        appName: "PRO SPY", tagline: "COVERT ARENA", nickname: "OPERATOR NAME", create: "CREATE GAME", join: "JOIN OPS", browse: "BROWSE ROOMS", players: "OPERATIVES", start: "LAUNCH MISSION", langBtn: "العربية", loading: "PROCESSING...", you: "YOU", statusSpy: "SPY", statusAgent: "AGENT", statusInformant: "INFORMANT", statusMrWhite: "MR. WHITE", statusGhost: "GHOST", round: "ROUND", skip: "SKIP TURN", vote: "VOTE TO EJECT", chatPlaceholder: "Type message...", send: "SEND", waiting: "Awaiting host...", location: "LOCATION", spectator: "SPECTATOR", confirm: "CONFIRM VOTE", spyWin: "SPY WINS!", agentsWin: "AGENTS WIN!", mrWhiteWin: "MR. WHITE WINS!", playAgain: "PLAY AGAIN", connecting: "Connecting...", startVoting: "START VOTING", votingStarted: "VOTING INITIATED", voteRequestTitle: "VOTING REQUEST", voteRequestDesc: "wants to start voting.", agree: "AGREE", decline: "DECLINE", endVoting: "END VOTING NOW", votesTitle: "VOTES:", roundsFormat: (c, m) => `ROUND ${c}/${m}`, wordSelectionTitle: "SELECT KEYWORD", wordSelectionDesc: "Choose a keyword for this round", finishSelection: "FINISH SELECTION", selectedWord: "Selected Keyword", loginGoogle: "Login with Google", myAccount: "My Account", logout: "Logout", profile: "Profile", guest: "Guest", linkGuessCard: "GUESS MY CARD", level: "Level", wins: "Wins", losses: "Losses", winRate: "Win Rate", totalGames: "Games", achievements: "Achievements", id: "ID", enterCodeError: "Please enter a room code.", changeName: "Change Name", nameChangeLimit: "Once a month", copied: "Copied!", save: "Save", or: "OR", needPlayers: "Minimum players not met!", ok: "OK", tabLobby: "Lobby", tabLeaderboard: "Leaderboard", tabFriends: "Friends", addFriend: "Add Friend", friendIdPlaceholder: "Enter Friend ID", online: "Online", offline: "Offline", noFriends: "No friends yet.", friendAdded: "Friend Added!", friendNotFound: "User not found.", requestSent: "Request Sent!", incomingRequests: "Incoming Requests", noRequests: "No pending requests.", accept: "Accept", reject: "Reject", sendMessage: "Send", inviteBtn: "Invite", invitedYou: "invited you to play.", joinInvite: "Join?", inviteFriends: "Invite Friends", accountInfo: "Account Information", email: "Email", memberSince: "Member Since", nameChangeCountdown: "Name Change In", canChangeNow: "Can change now!", selectEmoji: "Emoji", guestTitle: "GUEST ACCOUNT", guestDesc: "Register to save progress and add friends.", kd: "K/D Ratio", stats: "Stats", noPermission: "Feature unavailable for guests.", normalMode: "NORMAL MODE", advancedMode: "ADVANCED MODE (6+)", modeNormalDesc: "Classic Spy vs Agents. 3-10 Players.", modeAdvDesc: "Special Roles included! 6-10 Players.", privateRoom: "Private Room", password: "Password", publicRoom: "Public Room", noRooms: "No active games found.", lobbyTitle: "GAME LOBBY", mrWhiteInstruction: "Guess the location to win!", informantInstruction: "You know a neighbor!", ghostInstruction: "You are now a Ghost. You can watch but cannot act.", guessLocation: "GUESS LOCATION", leaveRoom: "LEAVE", closeRoom: "CLOSE ROOM", showPassword: "Show Password", guestAccountLabel: "GUEST ACCOUNT", guestProfileMsg: "Guests cannot receive friend requests.", reportUser: "Report User", reportSent: "Report sent successfully!", reportTitle: "Report User", reportDesc: "Please select a reason for reporting this user.", reportReasonAbusive: "Abusive Behavior", reportReasonCheating: "Cheating", reportReasonSpam: "Spam", reportReasonOther: "Other", reportSubmit: "Submit Report", reportCancel: "Cancel", privateRoomError: "Private rooms require a password.",
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
        appName: "برو جاسوس", tagline: "ساحة العمليات", nickname: "اسم العميل", create: "إنشاء لعبة", join: "انضمام", browse: "استعراض الغرف", players: "العملاء", start: "بدء المهمة", langBtn: "English", loading: "جاري التحميل...", you: "أنت", statusSpy: "جاسوس", statusAgent: "عميل", statusInformant: "المخبر", statusMrWhite: "السيد", statusGhost: "شبح", round: "الجولة", skip: "تخطي الدور", vote: "تصويت للطرد", chatPlaceholder: "اكتب رسالة...", send: "إرسال", waiting: "بانتظار المضيف...", location: "الموقع", spectator: "مشاهد", confirm: "تأكيد التصويت", spyWin: "فاز الجاسوس!", agentsWin: "فاز العملاء!", mrWhiteWin: "فاز السيد!", playAgain: "لعب مجدداً", connecting: "جاري التأمين...", startVoting: "بدء التصويت", votingStarted: "بدأ التصويت", voteRequestTitle: "طلب تصويت", voteRequestDesc: "يريد بدء التصويت.", agree: "موافق", decline: "رفض", endVoting: "إنهاء التصويت الآن", votesTitle: "الأصوات:", roundsFormat: (c, m) => `الجولة ${c}/${m}`, wordSelectionTitle: "اختر كلمة السر", wordSelectionDesc: "اختر كلمة سر لهذه الجولة", finishSelection: "إنهاء الاختيار", selectedWord: "كلمة السر", loginGoogle: "تسجيل بواسطة جوجل", myAccount: "حسابي", logout: "تسجيل الخروج", profile: "الملف الشخصي", guest: "زائر", linkGuessCard: "خمن كرتي", level: "المستوى", wins: "فوز", losses: "خسارة", winRate: "نسبة الفوز", totalGames: "المباريات", achievements: "الإنجازات", id: "الرقم", enterCodeError: "برجاء إدخال كود الغرفة.", changeName: "تغيير الاسم", nameChangeLimit: "مرة شهرياً", copied: "تم النسخ!", save: "حفظ", or: "أو", needPlayers: "اللاعبين غير كافيين!", ok: "حسناً", tabLobby: "الرئيسية", tabLeaderboard: "المتصدرين", tabFriends: "الأصدقاء", addFriend: "أضافة صديق", friendIdPlaceholder: "أدخل ID الصديق", online: "متصل", offline: "غير متصل", noFriends: "لا يوجد أصدقاء.", friendAdded: "تمت الإضافة!", friendNotFound: "المستخدم غير موجود.", requestSent: "تم إرسال الطلب!", incomingRequests: "طلبات الصداقة", noRequests: "لا توجد طلبات.", accept: "قبول", reject: "رفض", sendMessage: "إرسال", inviteBtn: "دعوة", invitedYou: "دعاك للعب.", joinInvite: "انضمام؟", inviteFriends: "دعوة أصدقاء", accountInfo: "معلومات الحساب", email: "البريد الإلكتروني", memberSince: "عضو منذ", nameChangeCountdown: "تغيير الاسم بعد", canChangeNow: "يمكن التغيير الآن!", selectEmoji: "إيموجي", guestTitle: "حساب زائر", guestDesc: "سجل لحفظ تقدمك وإضافة أصدقاء.", kd: "نسبة الـ KD", stats: "الإحصائيات", noPermission: "غير متاح للزوار.", normalMode: "الوضع العادي", advancedMode: "الوضع المتقدم (6+)", modeNormalDesc: "جاسوس ضد عملاء. 3-10 لاعبين.", modeAdvDesc: "أدوار خاصة! 6-10 لاعبين.", privateRoom: "غرفة خاصة", password: "كلمة السر", publicRoom: "غرفة عامة", noRooms: "لا توجد ألعاب نشطة.", lobbyTitle: "غرفة الانتظار", mrWhiteInstruction: "خمن المكان لتفوز!", informantInstruction: "تعرف على جارك!", ghostInstruction: "أنت الآن شبح. يمكنك المشاهدة فقط.", guessLocation: "خمن المكان", leaveRoom: "خروج", closeRoom: "إغلاق الغرفة", showPassword: "إظهار الباسورد", guestAccountLabel: "حساب زائر", guestProfileMsg: "لا يمكن إرسال طلبات صداقة للحسابات الزائرة.", reportUser: "إبلاغ عن المستخدم", reportSent: "تم إرسال البلاغ بنجاح!", reportTitle: "الإبلاغ عن مستخدم", reportDesc: "برجاء اختيار سبب الإبلاغ.", reportReasonAbusive: "سلوك مسيء", reportReasonCheating: "غش", reportReasonSpam: "بريد مزعج", reportReasonOther: "سبب آخر", reportSubmit: "إرسال البلاغ", reportCancel: "إلغاء", privateRoomError: "الغرف الخاصة تتطلب كلمة سر!",
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
const EmojiPicker = ({ show, onClose, onSelect, lang }) => {
    const t = TRANSLATIONS[lang];
    const [activeCategory, setActiveCategory] = useState('smiles');
    
    if (!show) return null;
    
    const categories = [
        { id: 'smiles', icon: '😀', label: 'Faces' },
        { id: 'gestures', icon: '👋', label: 'Gestures' },
        { id: 'hearts', icon: '❤️', label: 'Hearts' },
        { id: 'objects', icon: '🎉', label: 'Objects' },
        { id: 'nature', icon: '🌸', label: 'Nature' },
    ];
    
    return (
        <div className="emoji-picker-modal animate-slide-up">
            <div className="emoji-picker-header">
                <span className="emoji-picker-title">{t.selectEmojis}</span>
                <button className="emoji-picker-close" onClick={onClose}>✕</button>
            </div>
            <div className="emoji-picker-grid">
                {(EMOJI_CATEGORIES[activeCategory] || EMOJI_LIST.slice(0, 40)).map((emoji, i) => (
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
                            {SHOP_ITEMS.gifts.map(gift => ( 
                                <button key={gift.id} onClick={() => { setSelectedGift(gift); setShowPreview(true); }} disabled={currency < gift.cost} className={`flex flex-col items-center p-1.5 rounded transition ${currency >= gift.cost ? 'hover:bg-yellow-500/10 border border-transparent hover:border-yellow-500/50' : 'opacity-40 cursor-not-allowed'}`}> 
                                    <span className="text-lg">{gift.emoji}</span>
                                    <span className="text-[9px] font-bold text-yellow-400">{gift.cost}</span>
                                </button> 
                            ))} 
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
                                if (activeTab === 'gifts') return (<div key={item.id} className="gift-card" onClick={() => { setSelectedItem(item); setShowPreview(true); }}>{item.imageUrl ? <img src={item.imageUrl} alt={item.name_en} className="gift-icon-img" /> : <div className="text-xl mb-1">{item.emoji}</div>}<div className="gift-details"><div className="text-[10px] font-bold text-yellow-400">{item.cost}🧠</div><div className="gift-charisma">+{formatCharisma(item.charisma)} ⭐</div></div></div>);
                                return (
                                    <div key={item.id} className={`inventory-item ${equippedItem ? 'equipped' : ''}`} onClick={() => { setSelectedItem(item); setShowPreview(true); }}>
                                        <div className="inventory-item-preview">{renderPreview(item)}</div>
                                        <div className="inventory-item-name">{lang === 'ar' ? item.name_ar : item.name_en}</div>
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
    
    const isOwnProfile = targetUID === currentUserUID;
    const isTargetGuest = targetData?.isGuest || targetData?.isAnonymous;
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
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{t.profile}</h2>
                    <div className="flex items-center gap-2">
                        {!isOwnProfile && !isTargetGuest && (
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
                                            <button onClick={() => setShowBlockConfirm(true)} className="option-item block">
                                                <span>🚫</span>
                                                <span>{t.blockUser}</span>
                                            </button>
                                        )}
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
                            
                            {!isOwnProfile && !isTargetGuest && !isBlocked && !blockedByTarget && (
                                <div className="flex gap-2 mt-4">
                                    {isAlreadyFriend ? <button disabled className="btn-success flex-1 py-2 rounded-lg text-sm opacity-80">✅ {lang === 'ar' ? 'أصدقاء' : 'Friends'}</button> : hasPendingRequest ? <button disabled className="btn-ghost flex-1 py-2 rounded-lg text-sm opacity-80">⏳ {lang === 'ar' ? 'تم الإرسال' : 'Sent'}</button> : <button onClick={handleAddFriend} className="btn-neon flex-1 py-2 rounded-lg text-sm">👥 {t.addFriend}</button>}
                                    <button onClick={() => setShowGiftModal(true)} className="btn-gold flex-1 py-2 rounded-lg text-sm">🎁 {t.sendGift}</button>
                                </div>
                            )}
                            {isTargetGuest && !isOwnProfile && <div className="text-center text-gray-400 text-xs mt-4 p-2 bg-white/5 rounded-lg">{t.guestProfileMsg}</div>}
                        </div>
                    )}
                </div>

                {/* Block Confirmation Modal */}
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
            </div>
        </div>
    );
};

// ==========================================
// 💬 PRIVATE CHAT MODAL - IMPROVED WITH AVATARS
// ==========================================
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
                    <div className="chat-input-container">
                        {!(isBlocked || blockedByTarget) && (
                            <>
                                <div style={{ position: 'relative' }}>
                                    <button 
                                        className="emoji-picker-btn"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        style={{ fontSize: '24px' }}
                                    >
                                        😀
                                    </button>
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
                            </>
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
    
    if (!show) return null;
    
    const loginData = userData?.loginRewards || { currentDay: 0, lastClaimDate: null, streak: 0, totalClaims: 0 };
    const today = new Date().toDateString();
    const lastClaim = loginData.lastClaimDate?.toDate?.()?.toDateString() || loginData.lastClaimDate;
    const canClaimToday = lastClaim !== today;
    const currentDay = loginData.currentDay || 0;
    const currentReward = LOGIN_REWARDS[currentDay];
    
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
                                    <div key={dayNum} title={getRewardName(reward)} style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: `2px solid ${borderColor}`, background: bgColor, padding: '4px', gap: '2px', position: 'relative', cursor: 'pointer', transition: 'all 0.2s ease', ...extraStyles }}>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: textColor, lineHeight: 1 }}>{dayNum}</span>
                                        <span style={{ fontSize: '14px', lineHeight: 1 }}>{renderRewardIcon(reward, 14)}</span>
                                        {isClaimed && <span style={{ position: 'absolute', top: '1px', right: '2px', fontSize: '8px', color: '#10b981' }}>✓</span>}
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
                        <button onClick={handleClaim} disabled={!canClaimToday || claiming} style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: canClaimToday && !claiming ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease', background: canClaimToday ? 'linear-gradient(135deg, #ffd700, #ff8800)' : 'rgba(107, 114, 128, 0.5)', color: canClaimToday ? '#000' : 'rgba(255, 255, 255, 0.5)', marginTop: '12px' }}>
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
const SettingsModal = ({ show, onClose, lang, userData, user, onNotification }) => {
    const t = TRANSLATIONS[lang];
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [blockInput, setBlockInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [soundMutedLocal, setSoundMutedLocal] = useState(() => localStorage.getItem('pro_spy_sound_muted') === 'true');

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

                    {/* Achievements Section */}
                    <div className="settings-section">
                        <div className="settings-section-title">
                            <span>🏆</span>
                            <span>{t.achievements}</span>
                        </div>
                        <AchievementsDisplay userData={userData} lang={lang} showAll={true} />
                    </div>

                    {/* Block Users Section */}
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
// 🎮 MAIN APP COMPONENT
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
    const [chatFriend, setChatFriend] = useState(null);
    const [showLoginAlert, setShowLoginAlert] = useState(false);
    const [guestData, setGuestData] = useState(null);
    const [showEmail, setShowEmail] = useState(false);
    const [showLoginRewards, setShowLoginRewards] = useState(false);
    const [sessionClaimedToday, setSessionClaimedToday] = useState(false); // Track if claimed in this session
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
                    const newUserData = { uid: u.uid, email: u.email || null, displayName: u.displayName || u.uid.substring(0,5), photoURL: u.photoURL || null, customId: Math.floor(100000 + Math.random() * 900000).toString(), stats: { wins: 0, losses: 0, xp: 0 }, achievements: [], friends: [], friendRequests: [], createdAt: firebase.firestore.FieldValue.serverTimestamp(), lastChangedName: null, lastActive: firebase.firestore.FieldValue.serverTimestamp(), isAnonymous: false, currency: 100, inventory: {frames: [], titles: [], themes: [], badges: [], gifts: []}, equipped: { badges: [] }, charisma: 0, loginRewards: { currentDay: 0, lastClaimDate: null, streak: 0, totalClaims: 0, cycleMonth: getCurrentCycleMonth() } }; 
                    await userRef.set(newUserData); setUserData(newUserData); if (u.displayName) setNickname(u.displayName); 
                    setAuthLoading(false);
                } else {
                    const existingData = doc.data();
                    setUserData(existingData);
                    if (existingData.displayName) setNickname(existingData.displayName);
                    if (checkLoginRewardsCycle(existingData)) {
                        await userRef.update({ 'loginRewards.currentDay': 0, 'loginRewards.streak': 0, 'loginRewards.cycleMonth': getCurrentCycleMonth() });
                    }
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

    // Check for login rewards
    useEffect(() => {
        if (isLoggedIn && userData && !sessionClaimedToday) {
            const loginData = userData.loginRewards || { currentDay: 0, lastClaimDate: null };
            const today = new Date().toDateString();
            const lastClaim = loginData.lastClaimDate?.toDate?.()?.toDateString() || loginData.lastClaimDate;
            if (lastClaim !== today && loginData.currentDay < 30) setShowLoginRewards(true);
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
    useEffect(() => { 
        if (activeView === 'friends' && userData && user && isLoggedIn) { 
            if (userData.friends?.length > 0) { 
                const unsub = usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', userData.friends).onSnapshot(snap => { 
                    const friends = snap.docs.map(d => { 
                        const data = d.data();
                        const lastActive = data.lastActive?.toDate?.() || new Date(0);
                        const isOnline = (Date.now() - lastActive.getTime()) < 300000; // 5 minutes
                        return { id: d.id, ...data, isOnline };
                    });
                    setFriendsData(friends); 
                }); 
                return unsub; 
            } else { setFriendsData([]); } 
        } 
    }, [activeView, userData?.friends, user, isLoggedIn]);
    
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
            <SettingsModal show={showSettings} onClose={() => setShowSettings(false)} lang={lang} userData={userData} user={user} onNotification={setNotification} />
            
            {showMyAccount && (
                <div className="modal-overlay" onClick={() => setShowMyAccount(false)}>
                    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2 className="modal-title">{t.myAccount}</h2><ModalCloseBtn onClose={() => setShowMyAccount(false)} /></div>
                        <div className="modal-body">
                            <div className="profile-header">
                                <div className="profile-avatar-section">
                                    <div className="profile-avatar-container"><AvatarWithFrame photoURL={currentUserData?.photoURL} equipped={currentUserData?.equipped} size="lg" /></div>
                                    <h3 className="profile-name">{currentUserData?.displayName || 'User'}</h3>
                                    {currentUserData?.equipped?.titles && <div className="profile-title-container">{renderTitle(currentUserData.equipped.titles, lang)}</div>}
                                    {currentUserData?.equipped?.badges && renderBadges(currentUserData.equipped.badges, 28)}
                                    {isGuest && <div className="profile-account-type guest">{t.guestAccount}</div>}
                                    <div className="profile-id" onClick={() => { navigator.clipboard.writeText(currentUserData?.customId || ''); }}><span>ID: {currentUserData?.customId || 'N/A'}</span><span className="text-[10px]">📋</span></div>
                                </div>
                            </div>
                            {isLoggedIn && (<div className="bg-white/5 rounded-lg p-3 mb-3"><div className="text-xs font-bold text-gray-400 mb-2">{t.accountInfo}</div><div className="flex items-center justify-between mb-2 p-2 bg-black/20 rounded-lg"><div className="flex items-center gap-2"><span className="text-gray-400">📧</span><span className="text-sm">{showEmail ? (user?.email || 'N/A') : maskEmail(user?.email)}</span></div><button onClick={() => setShowEmail(!showEmail)} className="text-xs bg-white/10 px-2 py-1 rounded">{showEmail ? t.hideEmail : t.showEmail}</button></div><div className="flex items-center justify-between p-2 bg-black/20 rounded-lg"><span className="text-sm">{t.memberSince}</span><span className="text-xs text-gray-300">{currentUserData?.createdAt?.toDate?.() ? currentUserData.createdAt.toDate().toLocaleDateString() : 'N/A'}</span></div></div>)}
                            <CharismaDisplay charisma={currentUserData?.charisma} lang={lang} />
                            <div className="profile-stats">
                                <div className="profile-stat"><div className="profile-stat-value">{currentUserData?.stats?.wins || 0}</div><div className="profile-stat-label">{t.wins}</div></div>
                                <div className="profile-stat"><div className="profile-stat-value">{currentUserData?.stats?.losses || 0}</div><div className="profile-stat-label">{t.losses}</div></div>
                                <div className="profile-stat"><div className="profile-stat-value">{Math.floor((currentUserData?.stats?.xp || 0) / 100) + 1}</div><div className="profile-stat-label">{t.level}</div></div>
                            </div>
                            <KDCircle wins={currentUserData?.stats?.wins || 0} losses={currentUserData?.stats?.losses || 0} lang={lang} />
                            <div className="flex items-center justify-center gap-2 mb-4 p-2 bg-yellow-500/10 rounded-lg"><span className="text-2xl">🧠</span><span className="text-lg font-bold text-yellow-400">{(currentUserData?.currency || 0).toLocaleString()} {CURRENCY_NAME}</span></div>
                            {isLoggedIn && (<button onClick={() => { if(!sessionClaimedToday) setShowLoginRewards(true); }} className={`btn-gold w-full py-2 rounded-lg text-sm font-bold mb-2 ${sessionClaimedToday ? 'opacity-50' : ''}`}>🎁 {t.loginRewards} {sessionClaimedToday && <span className="text-[10px] text-green-400">✓</span>}</button>)}
                        </div>
                        <div className="modal-footer">
                            {isLoggedIn && (<div className="flex gap-2 mb-2"><button onClick={() => { setShowMyAccount(false); setShowShop(true); }} className="btn-gold flex-1 py-2 rounded-lg text-sm font-bold">🛒 {t.shop}</button><button onClick={() => { setShowMyAccount(false); setShowInventory(true); }} className="btn-neon flex-1 py-2 rounded-lg text-sm font-bold">📦 {t.inventory}</button></div>)}
                            <button onClick={() => { setShowMyAccount(false); setShowSettings(true); }} className="btn-ghost w-full py-2 rounded-lg text-sm font-bold mb-2">⚙️ {t.settings}</button>
                            {isLoggedIn ? (<button onClick={handleLogout} className="btn-danger w-full py-2 rounded-lg text-sm">{t.logout}</button>) : isGuest ? (<div className="flex gap-2"><button onClick={handleLogout} className="btn-ghost flex-1 py-2 rounded-lg text-sm">{t.logout}</button><button onClick={() => { setShowMyAccount(false); handleGoogleLogin(); }} className="btn-neon flex-1 py-2 rounded-lg text-sm">{t.loginGoogle}</button></div>) : null}
                        </div>
                    </div>
                </div>
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
                    <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="text-xs bg-white/10 px-2 py-1 rounded">{t.langBtn}</button>
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
                                <div className="friends-list-header">{t.tabFriends} ({friendsData.length})</div>
                                {friendsData.length === 0 ? <div className="text-center py-6"><div className="text-4xl mb-2">👥</div><p className="text-gray-400">{t.noFriends}</p></div> : friendsData.map(friend => (
                                    <div key={friend.id} className="friend-item">
                                        <AvatarWithFrame photoURL={friend.photoURL} equipped={friend.equipped} size="sm" />
                                        <div className="friend-info"><div className="friend-name">{friend.displayName}</div><div className="friend-status">{friend.isOnline ? <span className="text-green-400">{t.online}</span> : <span className="text-gray-500">{t.offline}</span>}</div></div>
                                        <div className="friend-actions"><button onClick={() => openPrivateChat(friend)} className="btn-ghost px-2 py-1 rounded text-xs">💬</button><button onClick={() => openProfile(friend.id)} className="btn-ghost px-2 py-1 rounded text-xs">👤</button></div>
                                    </div>
                                ))}
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
        <div className="profile-winrate-circle" style={{ background: gradient }}>
            <div className="profile-winrate-content">
                <span className="profile-winrate-value" style={{ color: getColor(rate) }}>{rate}%</span>
                <span className="profile-winrate-label">{lang === 'ar' ? 'معدل' : 'Win Rate'}</span>
            </div>
        </div>
    );
};

// 🎁 GIFT WALL COMPONENT V11 - IMPROVED WITH SENDER PHOTOS
const GiftWallV11 = ({ gifts, lang }) => {
    const [activeTab, setActiveTab] = useState('wall');
    const totalGifts = gifts?.length || 0;

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

    const displayGifts = SHOP_ITEMS.gifts.slice(0, 20);

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

                        return (
                            <div 
                                key={gift.id} 
                                className={`profile-gift-slot ${unlocked ? 'unlocked' : 'locked'}`}
                                title={unlocked ? `${lang === 'ar' ? gift.name_ar : gift.name_en} x${count}` : (lang === 'ar' ? 'لم تُستلم بعد' : 'Not received')}
                            >
                                {/* Show sender photo if received */}
                                {unlocked && lastSender && (
                                    <img 
                                        src={lastSender.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(lastSender.name || 'User')}&background=ffd700&color=000&size=24`}
                                        alt=""
                                        className="profile-gift-sender-avatar"
                                    />
                                )}
                                
                                {/* Gift icon/emoji */}
                                <span className="profile-gift-icon">
                                    {gift.emoji || '🎁'}
                                </span>
                                
                                {/* Count badge */}
                                {count > 0 && (
                                    <span className="profile-gift-count-badge">×{count}</span>
                                )}
                                
                                {/* Glow effect for unlocked gifts */}
                                {unlocked && <div className="profile-gift-glow"></div>}
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'log' && (
                <div className="profile-gift-log">
                    {gifts && gifts.length > 0 ? (
                        gifts.slice(0, 10).map((gift, idx) => (
                            <div key={idx} className="profile-gift-log-item">
                                <img 
                                    src={gift.senderPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(gift.senderName || 'User')}&background=6366f1&color=fff`} 
                                    alt="" 
                                    className="profile-gift-log-avatar"
                                />
                                <div className="profile-gift-log-content">
                                    <div className="profile-gift-log-sender">{gift.senderName || 'Unknown'}</div>
                                    <div className="profile-gift-log-details">
                                        <span className="profile-gift-log-emoji">{gift.giftEmoji || '🎁'}</span>
                                        <span className="profile-gift-log-name">
                                            {lang === 'ar' ? (gift.giftNameAr || 'هدية') : (gift.giftNameEn || 'Gift')}
                                        </span>
                                    </div>
                                </div>
                                <div className="profile-gift-log-stats">
                                    <div className="profile-gift-log-charisma">+{gift.charisma || 0}</div>
                                    <div className="profile-gift-log-time">
                                        {gift.timestamp?.toDate ? formatTime(gift.timestamp) : ''}
                                    </div>
                                </div>
                            </div>
                        ))
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

    const displayAchievements = showAll ? sortedAchievements : sortedAchievements.slice(0, 12);

    return (
        <div className="profile-achievements-section">
            <div className="profile-achievements-header">
                <span className="profile-achievements-title">
                    🏆 {lang === 'ar' ? 'الإنجازات' : 'Achievements'}
                </span>
                <span className="profile-achievements-count">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
            </div>
            
            <div className="profile-achievements-scroll-container">
                {canScrollLeft && (
                    <button className="profile-achievements-scroll-btn left" onClick={() => scroll('left')}>
                        ◀
                    </button>
                )}
                
                <div className="profile-achievements-grid" ref={scrollRef}>
                    {displayAchievements.map((ach) => {
                        const isUnlocked = unlockedAchievements.includes(ach.id);
                        const progress = getProgress(ach);

                        return (
                            <div 
                                key={ach.id} 
                                className={`profile-achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`}
                                title={TRANSLATIONS[lang]?.[ach.nameKey] || ach.id}
                            >
                                <span className="profile-achievement-icon" style={{ 
                                    fontSize: '20px',
                                    filter: isUnlocked ? 'none' : 'grayscale(100%)',
                                    opacity: isUnlocked ? 1 : 0.4
                                }}>
                                    {ach.icon || '🏅'}
                                </span>
                                {isUnlocked && (
                                    <span className="profile-achievement-badge">✓</span>
                                )}
                                {!isUnlocked && progress > 0 && (
                                    <div className="profile-achievement-progress">
                                        <div className="profile-achievement-progress-fill" style={{ width: `${progress}%` }}></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                {canScrollRight && (
                    <button className="profile-achievements-scroll-btn right" onClick={() => scroll('right')}>
                        ▶
                    </button>
                )}
            </div>
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

// 🎖️ USER BADGES COMPONENT V11
const UserBadgesV11 = ({ equipped, lang }) => {
    const badges = equipped?.badges || [];
    if (badges.length === 0) return null;

    return (
        <div className="profile-badges-row">
            {badges.slice(0, 3).map((badgeId, idx) => {
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

// 👤 AVATAR WITH FRAME V11 - FIXED
const AvatarWithFrameV11 = ({ photoURL, equipped, size = 'lg', isOnline }) => {
    const sizeMap = {
        sm: { wrapper: 52, avatar: 30, mask: 32 },
        md: { wrapper: 72, avatar: 40, mask: 42 },
        lg: { wrapper: 96, avatar: 56, mask: 60 },
        xl: { wrapper: 140, avatar: 80, mask: 88 }
    };

    const s = sizeMap[size] || sizeMap.lg;
    const frame = equipped?.frames;
    const frameStyle = frame ? SHOP_ITEMS.frames.find(f => f.id === frame) : null;

    return (
        <div className="profile-avatar-container" style={{ position: 'relative' }}>
            {/* Frame layer - rendered first (below avatar) */}
            {frameStyle && frameStyle.preview && (
                <div 
                    className="avatar-frame-ring" 
                    style={{ 
                        borderRadius: size === 'lg' ? 24 : '50%',
                        position: 'absolute',
                        top: -4,
                        left: -4,
                        right: -4,
                        bottom: -4,
                        zIndex: 1
                    }}
                >
                    {frameStyle.preview.startsWith('http') ? (
                        <img src={frameStyle.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                    ) : (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            background: frameStyle.preview,
                            borderRadius: 'inherit'
                        }} />
                    )}
                </div>
            )}
            
            {/* Avatar image - rendered second (above frame) */}
            <img 
                src={photoURL || `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=${s.avatar * 2}`}
                alt=""
                className="profile-avatar"
                style={{ 
                    width: s.avatar, 
                    height: s.avatar,
                    borderRadius: size === 'lg' ? 16 : '50%',
                    position: 'relative',
                    zIndex: 10,
                    border: '3px solid var(--bg-dark)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                }}
            />
            
            {isOnline !== undefined && (
                <div className={`profile-status-dot ${isOnline ? '' : 'offline'}`}></div>
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
    friendsData 
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

    const wins = targetData?.stats?.wins || 0;
    const losses = targetData?.stats?.losses || 0;
    const level = Math.floor((targetData?.stats?.xp || 0) / 100) + 1;

    // Calculate charisma rank
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="profile-glass-card animate-pop" onClick={e => e.stopPropagation()}>
                
                {/* Profile Header Bar - Contains X and Three Dots */}
                <div className="profile-header-bar">
                    <button 
                        onClick={onClose}
                        className="profile-close-btn"
                    >
                        ✕
                    </button>
                    
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
                                        <button onClick={() => setShowBlockConfirm(true)} className="profile-options-item block">
                                            <span>🚫</span>
                                            <span>{lang === 'ar' ? 'حظر' : 'Block'}</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <CharismaDisplay charisma={targetData?.charisma} lang={lang} />

                <div className="profile-cover">
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
                                <h1 className="profile-name">{targetData?.displayName || 'Unknown'}</h1>
                            </div>
                            
                            <UserBadgesV11 equipped={targetData?.equipped} lang={lang} />
                            
                            <span 
                                className="profile-id-display"
                                onClick={() => {
                                    navigator.clipboard.writeText(targetData?.customId || targetData?.uid?.substring(0, 8));
                                }}
                            >
                                ID: {targetData?.customId || targetData?.uid?.substring(0, 8)} 📋
                            </span>
                        </div>

                        <div className="profile-stats-dashboard">
                            <div className="profile-stats-grid">
                                <div className="profile-stat-box">
                                    <span className="profile-stat-value wins">{wins}</span>
                                    <span className="profile-stat-label">{lang === 'ar' ? 'فوز' : 'Wins'}</span>
                                </div>
                                <div className="profile-stat-box">
                                    <span className="profile-stat-value losses">{losses}</span>
                                    <span className="profile-stat-label">{lang === 'ar' ? 'خسارة' : 'Losses'}</span>
                                </div>
                            </div>
                            
                            <WinRateCircleV11 wins={wins} losses={losses} lang={lang} />
                            
                            <div className="profile-stats-grid">
                                <div className="profile-stat-box">
                                    <span className="profile-stat-value rank">#{charismaRank || '--'}</span>
                                    <span className="profile-stat-label">{lang === 'ar' ? 'الترتيب' : 'Rank'}</span>
                                </div>
                                <div className="profile-stat-box">
                                    <span className="profile-stat-value" style={{ color: '#a78bfa' }}>{level}</span>
                                    <span className="profile-stat-label">{lang === 'ar' ? 'المستوى' : 'Level'}</span>
                                </div>
                            </div>
                        </div>

                        <GiftWallV11 gifts={gifts} lang={lang} />

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
                                    <button disabled className="profile-action-btn friends">
                                        <span>✓</span>
                                        <span>{lang === 'ar' ? 'أصدقاء' : 'Friends'}</span>
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
                    </>
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
        </div>
    );
};

// Make ProfileV11 available globally
window.ProfileV11 = ProfileV11;

// Wrap with ErrorBoundary
const AppWithErrorBoundary = () => (<ErrorBoundary><App /></ErrorBoundary>);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppWithErrorBoundary />);
