// ==========================================
// PRO SPY - SCRIPT V12 - COMPLETE OPTIMIZED
// الجزء الأول: الإعدادات + الدوال المساعدة + الترجمات
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
// 🔊 AUDIO SYSTEM - SINGLETON PATTERN
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
    if (!userData) return false;
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

const getCharismaLevel = (charisma = 0) => {
    let currentLevel = CHARISMA_LEVELS[0];
    let nextLevel = null;
    const safeCharisma = charisma || 0;
    for (let i = CHARISMA_LEVELS.length - 1; i >= 0; i--) {
        if (safeCharisma >= CHARISMA_LEVELS[i].threshold) {
            currentLevel = CHARISMA_LEVELS[i];
            nextLevel = CHARISMA_LEVELS[i + 1] || null;
            break;
        }
    }
    return { currentLevel, nextLevel };
};

const getCharismaProgress = (charisma = 0) => {
    const { currentLevel, nextLevel } = getCharismaLevel(charisma);
    if (!nextLevel || currentLevel.isMaxLevel) return 100;
    const safeCharisma = charisma || 0;
    const progress = ((safeCharisma - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100;
    return Math.min(100, Math.max(0, progress));
};

// ==========================================
// SHOP ITEMS - GIFTS WITH BONUS
// ==========================================
const SHOP_ITEMS = {
    frames: [
        { id: 'frame_gold', name_en: "Gold Frame", name_ar: "إطار ذهبي", cost: 500, type: 'frames', preview: 'linear-gradient(45deg, #f7ff00, #db9700)' },
        { id: 'frame_neon', name_en: "Neon Frame", name_ar: "إطار نيون", cost: 300, type: 'frames', preview: 'linear-gradient(45deg, #00f2ff, #7000ff)' },
        { id: 'frame_fire', name_en: "Fire Frame", name_ar: "إطار نار", cost: 400, type: 'frames', preview: 'linear-gradient(45deg, #ff0055, #ff8800)' },
        { id: 'frame_img', name_en: "Image Frame", name_ar: "إطار صورة", cost: 100, type: 'frames', preview: 'https://i.ibb.co/mVQTLr2D/Untitled-3.png' },
        { id: 'frame_1', name_en: "Animated Frame", name_ar: "إطار متحرك", cost: 0, type: 'frames', preview: 'https://i.ibb.co/4Rj8jzWS/0202.png' },
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
        { id: 'gift_jet', name_en: "Private Jet", name_ar: "طائرة خاصة", cost: 5000, type: 'gifts', charisma: 85000, minBonus: 1, maxBonus: 250000, desc_ar: "حلّق في سماء الكاريزما", desc_en: "Soar in charisma skies", emoji: "✈️", imageUrl: "" },
        { id: 'gift_island', name_en: "Private Island", name_ar: "جزيرة خاصة", cost: 10000, type: 'gifts', charisma: 180000, minBonus: 1, maxBonus: 500000, desc_ar: "أمتلك عالمك الخاص", desc_en: "Own your world", emoji: "🏝️", imageUrl: "" },
        { id: 'gift_planet', name_en: "Planet", name_ar: "كوكب", cost: 10000, type: 'gifts', charisma: 200000, minBonus: 1, maxBonus: 500000, desc_ar: "كوكب خاص بك", desc_en: "Your own planet", emoji: "🪐", imageUrl: "" },
        { id: 'gift_galaxy', name_en: "Galaxy", name_ar: "مجرة", cost: 10000, type: 'gifts', charisma: 220000, minBonus: 1, maxBonus: 500000, desc_ar: "مجرة كاملة ملكك", desc_en: "Your own galaxy", emoji: "🌌", imageUrl: "" },
        { id: 'gift_dragon', name_en: "Dragon", name_ar: "تنين", cost: 10000, type: 'gifts', charisma: 210000, minBonus: 1, maxBonus: 500000, desc_ar: "تنين أسطوري", desc_en: "Legendary dragon", emoji: "🐉", imageUrl: "" },
        { id: 'gift_moon', name_en: "Moon", name_ar: "قمر", cost: 50000, type: 'gifts', charisma: 700000, minBonus: 1, maxBonus: 500000, desc_ar: "قمر خاص بك", desc_en: "Your own moon", emoji: "🌙", imageUrl: "" },
        { id: 'gift_sun', name_en: "Sun", name_ar: "شمس", cost: 50000, type: 'gifts', charisma: 750000, minBonus: 1, maxBonus: 500000, desc_ar: "شمس ساطعة", desc_en: "Shining sun", emoji: "☀️", imageUrl: "" },
        { id: 'gift_world', name_en: "World", name_ar: "عالم", cost: 100000, type: 'gifts', charisma: 1700000, minBonus: 1, maxBonus: 500000, desc_ar: "عالم كامل ملكك", desc_en: "Your own world", emoji: "🌍", imageUrl: "" },
        { id: 'gift_universe', name_en: "Universe", name_ar: "كون", cost: 100000, type: 'gifts', charisma: 1900000, minBonus: 1, maxBonus: 500000, desc_ar: "كون كامل ملكك", desc_en: "Your own universe", emoji: "🌌", imageUrl: "" },
        { id: 'gift_multiverse', name_en: "Multiverse", name_ar: "متعدد أكوان", cost: 150000, type: 'gifts', charisma: 2500000, minBonus: 1, maxBonus: 500000, desc_ar: "متعدد أكوان خاص", desc_en: "Your multiverse", emoji: "🪐", imageUrl: "" },
        { id: 'gift_ultimate', name_en: "Ultimate Gift", name_ar: "الهدية المطلقة", cost: 150000, type: 'gifts', charisma: 3500000, minBonus: 1, maxBonus: 500000, desc_ar: "أعظم هدية", desc_en: "The ultimate gift", emoji: "🏆", imageUrl: "" },
    ]
};

// ==========================================
// ACHIEVEMENTS SYSTEM
// ==========================================
const ACHIEVEMENTS = [
    { id: 'ach_first_gift', nameKey: 'achFirstGift', descKey: 'achFirstGiftDesc', icon: '🎁', imageUrl: '', condition: { type: 'gifts_received', value: 1 } },
    { id: 'ach_gift_collector', nameKey: 'achGiftCollector', descKey: 'achGiftCollectorDesc', icon: '💝', imageUrl: '', condition: { type: 'gifts_received', value: 10 } },
    { id: 'ach_gift_master', nameKey: 'achGiftMaster', descKey: 'achGiftMasterDesc', icon: '💎', imageUrl: '', condition: { type: 'gifts_received', value: 50 } },
    { id: 'ach_gift_legend', nameKey: 'achGiftLegend', descKey: 'achGiftLegendDesc', icon: '👑', imageUrl: '', condition: { type: 'gifts_received', value: 100 } },
    { id: 'ach_gift_king', nameKey: 'achGiftKing', descKey: 'achGiftKingDesc', icon: '🏆', imageUrl: '', condition: { type: 'gifts_received', value: 500 } },
    { id: 'ach_first_win', nameKey: 'achFirstWin', descKey: 'achFirstWinDesc', icon: '🏆', imageUrl: '', condition: { type: 'wins', value: 1 } },
    { id: 'ach_veteran', nameKey: 'achVeteran', descKey: 'achVeteranDesc', icon: '🎖️', imageUrl: '', condition: { type: 'games_played', value: 10 } },
    { id: 'ach_pro', nameKey: 'achPro', descKey: 'achProDesc', icon: '⭐', imageUrl: '', condition: { type: 'games_played', value: 25 } },
    { id: 'ach_master', nameKey: 'achMaster', descKey: 'achMasterDesc', icon: '🌟', imageUrl: '', condition: { type: 'games_played', value: 50 } },
    { id: 'ach_legend_player', nameKey: 'achLegendPlayer', descKey: 'achLegendPlayerDesc', icon: '🏅', imageUrl: '', condition: { type: 'games_played', value: 100 } },
    { id: 'ach_win_streak_5', nameKey: 'achWinStreak5', descKey: 'achWinStreak5Desc', icon: '🔥', imageUrl: '', condition: { type: 'win_streak', value: 5 } },
    { id: 'ach_win_streak_10', nameKey: 'achWinStreak10', descKey: 'achWinStreak10Desc', icon: '💥', imageUrl: '', condition: { type: 'win_streak', value: 10 } },
    { id: 'ach_week_streak', nameKey: 'achWeekStreak', descKey: 'achWeekStreakDesc', icon: '🔥', imageUrl: '', condition: { type: 'login_streak', value: 7 } },
    { id: 'ach_month_streak', nameKey: 'achMonthStreak', descKey: 'achMonthStreakDesc', icon: '📅', imageUrl: '', condition: { type: 'total_logins', value: 30 } },
    { id: 'ach_dedicated', nameKey: 'achDedicated', descKey: 'achDedicatedDesc', icon: '💎', imageUrl: '', condition: { type: 'total_logins', value: 100 } },
    { id: 'ach_first_spy', nameKey: 'achFirstSpy', descKey: 'achFirstSpyDesc', icon: '🕵️', imageUrl: '', condition: { type: 'spy_wins', value: 1 } },
    { id: 'ach_spy_master', nameKey: 'achSpyMaster', descKey: 'achSpyMasterDesc', icon: '🥷', imageUrl: '', condition: { type: 'spy_wins', value: 10 } },
    { id: 'ach_spy_legend', nameKey: 'achSpyLegend', descKey: 'achSpyLegendDesc', icon: '👤', imageUrl: '', condition: { type: 'spy_wins', value: 25 } },
    { id: 'ach_agent_pro', nameKey: 'achAgentPro', descKey: 'achAgentProDesc', icon: '🤵', imageUrl: '', condition: { type: 'agent_wins', value: 10 } },
    { id: 'ach_agent_legend', nameKey: 'achAgentLegend', descKey: 'achAgentLegendDesc', icon: '🛡️', imageUrl: '', condition: { type: 'agent_wins', value: 25 } },
    { id: 'ach_social', nameKey: 'achSocial', descKey: 'achSocialDesc', icon: '🦋', imageUrl: '', condition: { type: 'friends', value: 10 } },
    { id: 'ach_popular', nameKey: 'achPopular', descKey: 'achPopularDesc', icon: '⭐', imageUrl: '', condition: { type: 'friends', value: 25 } },
    { id: 'ach_generous', nameKey: 'achGenerous', descKey: 'achGenerousDesc', icon: '💌', imageUrl: '', condition: { type: 'gifts_sent', value: 10 } },
    { id: 'ach_santa', nameKey: 'achSanta', descKey: 'achSantaDesc', icon: '🎅', imageUrl: '', condition: { type: 'gifts_sent', value: 50 } },
    { id: 'ach_charisma_10k', nameKey: 'achCharisma10k', descKey: 'achCharisma10kDesc', icon: '✨', imageUrl: '', condition: { type: 'charisma', value: 10000 } },
    { id: 'ach_charisma_100k', nameKey: 'achCharisma100k', descKey: 'achCharisma100kDesc', icon: '🌟', imageUrl: '', condition: { type: 'charisma', value: 100000 } },
    { id: 'ach_charisma_1m', nameKey: 'achCharisma1m', descKey: 'achCharisma1mDesc', icon: '💫', imageUrl: '', condition: { type: 'charisma', value: 1000000 } },
];

// ==========================================
// SCENARIOS - DEFINED ONCE
// ==========================================
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
// EMOJI CATEGORIES
// ==========================================
const EMOJI_CATEGORIES = {
    smiles: ['😀', '😂', '😍', '🤔', '😎', '🤫', '😡', '🤢', '😴', '🤯', '😤', '🥺', '😱', '🤬', '💀', '👻', '👾', '🤖', '💩', '😈'],
    gestures: ['👁️', '🧠', '🦷', '🦴', '👀', '👊', '✌️', '🤞', '🤟', '👌', '🤙', '👈', '👉', '☝️', '👆', '👇', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏'],
    hearts: ['💪', '❤️', '💔', '💕', '💖', '💗', '💘', '💝', '💞', '💟', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎'],
    objects: ['🔥', '⭐', '🌟', '✨', '💫', '🎉', '🎊', '🎁', '🎈', '🎀', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🎮', '🎲', '🎯', '🎵', '🎶', '🎤', '🎧', '📷', '💻', '📱', '💰', '💵', '💎', '👑', '🎩'],
    nature: ['🚀', '✈️', '🛸', '🌹', '🌸', '🌺', '🌻', '🌼', '🌷', '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃']
};

const EMOJI_LIST = Object.values(EMOJI_CATEGORIES).flat();

// ==========================================
// HELPER FUNCTIONS - WITH NULL SAFETY
// ==========================================
const generateUID = () => Math.floor(100000 + Math.random() * 900000).toString();
const calculateLevel = (xp = 0) => Math.floor(xp / 100) + 1;
const getChatId = (id1, id2) => [id1, id2].sort().join('_');

const formatTime = (timestamp) => { 
    if (!timestamp) return ''; 
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp); 
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); 
    } catch {
        return '';
    }
};

const formatDate = (timestamp) => { 
    if (!timestamp) return ''; 
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp); 
        return date.toLocaleDateString(); 
    } catch {
        return '';
    }
};

const formatCharisma = (num) => { 
    if (num === undefined || num === null || isNaN(num)) return '0'; 
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'; 
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'; 
    return num.toString(); 
};

const maskEmail = (email) => { 
    if (!email) return 'N/A'; 
    const [localPart, domain] = email.split('@'); 
    if (!domain) return email; 
    const visibleChars = Math.min(2, localPart.length); 
    return localPart.substring(0, visibleChars) + '***@' + domain; 
};

const generateRandomBonus = (min, max) => {
    const safeMin = Math.max(1, min || 1);
    const safeMax = Math.max(safeMin, max || safeMin);
    return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
};

const getDefaultPhoto = (uData, name = 'User') => {
    return uData?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`;
};

// ==========================================
// TRANSLATIONS - COMPLETE
// ==========================================
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
        settings: "Settings", blockUser: "Block User", unblock: "Unblock", blockedUsers: "Blocked Users", noBlockedUsers: "No blocked users.", blockSuccess: "User blocked!", unblockSuccess: "User unblocked!",
        sound: "Sound", soundOn: "ON", soundOff: "OFF",
        charismaRank: "Charisma Rank", topCharisma: "Top Charisma", rank: "Rank", firstPlace: "1st", secondPlace: "2nd", thirdPlace: "3rd",
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
        settings: "الإعدادات", blockUser: "حظر المستخدم", unblock: "إلغاء الحظر", blockedUsers: "المحظورين", noBlockedUsers: "لا يوجد مستخدمين محظورين.", blockSuccess: "تم حظر المستخدم!", unblockSuccess: "تم إلغاء الحظر!",
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
// نهاية الجزء الأول
// ==========================================
// ==========================================
// PRO SPY - SCRIPT V12 - الجزء الثاني
// المكونات الأساسية (UI Components)
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
const GuestBanner = ({ lang = 'en' }) => { 
    const t = TRANSLATIONS[lang] || TRANSLATIONS['en']; 
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
        if (message) { 
            const timer = setTimeout(() => { onClose?.(); }, 2500); 
            return () => clearTimeout(timer); 
        } 
    }, [message, onClose]);
    
    if(!message) return null;
    
    return (
        <div className="notification-toast">
            <div className="notification-content">
                <span className="notification-icon">🎉</span>
                <span className="notification-text">{message}</span>
                <button onClick={() => onClose?.()} className="notification-close">&times;</button>
            </div>
        </div>
    );
};

// Modal Close Button
const ModalCloseBtn = ({ onClose }) => (
    <button onClick={() => onClose?.()} className="modal-close-btn" aria-label="Close">&times;</button>
);

// Charisma Display
const CharismaDisplay = ({ charisma = 0, lang = 'en', showDetails = true }) => {
    const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    const safeCharisma = charisma || 0;
    
    const { currentLevel, nextLevel } = useMemo(() => getCharismaLevel(safeCharisma), [safeCharisma]);
    const progress = useMemo(() => getCharismaProgress(safeCharisma), [safeCharisma]);
    
    const neededForNext = nextLevel ? nextLevel.threshold - safeCharisma : 0;
    const isMaxLevel = currentLevel?.isMaxLevel;
    const hasGlow = currentLevel?.hasGlow;
    
    const renderIcon = useCallback(() => {
        if (currentLevel?.iconType === 'image' && currentLevel.iconUrl) {
            return <img src={currentLevel.iconUrl} alt="level" className={`w-5 h-5 ${hasGlow ? 'animate-pulse' : ''}`} style={hasGlow ? {filter: 'drop-shadow(0 0 8px #ff6600)'} : {}} />;
        }
        return <span className="charisma-icon">{currentLevel?.icon || '⭐'}</span>;
    }, [currentLevel, hasGlow]);
    
    return (
        <div className={`charisma-container ${hasGlow ? 'has-glow' : ''}`}>
            <div className="charisma-header">
                <span className="charisma-label">{renderIcon()}{t.charisma}</span>
                <span className={`charisma-level-badge ${currentLevel?.badge_class || ''} ${hasGlow ? 'glow-badge' : ''}`} style={hasGlow ? {boxShadow: '0 0 15px ' + (currentLevel?.color || '#ffd700')} : {}}>
                    {renderIcon()} Lv.{currentLevel?.level || 1}
                </span>
            </div>
            <div className="charisma-bar-bg">
                <div className="charisma-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="charisma-info">
                <span className="charisma-current">{formatCharisma(safeCharisma)}</span>
                {isMaxLevel ? <span className="charisma-next text-yellow-400 font-bold">{t.maxLevel}</span> : nextLevel && showDetails ? <span className="charisma-next">{t.nextLevel}: {formatCharisma(neededForNext)}</span> : null}
            </div>
        </div>
    );
};

// K/D Circle
const KDCircle = ({ wins = 0, losses = 0, lang = 'en' }) => { 
    const t = TRANSLATIONS[lang] || TRANSLATIONS['en']; 
    const safeWins = wins || 0;
    const safeLosses = losses || 0;
    const total = safeWins + safeLosses; 
    const ratio = total > 0 ? safeWins / total : 0; 
    const percentage = Math.round(ratio * 100); 
    const size = 100; strokeWidth = 6; 
    const radius = (size - strokeWidth) / 2; 
    const circumference = 2 * Math.PI * radius; 
    const offset = circumference - (ratio * circumference); 
    
    return ( 
        <div className="kd-circle-container" style={{ width: size, height: size }}> 
            <svg width={size} height={size}> 
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--secondary)" />
                        <stop offset="100%" stopColor="var(--primary)" />
                    </linearGradient>
                </defs> 
                <circle className="kd-circle-bg" cx={size/2} cy={size/2} r={radius} /> 
                <circle className="kd-circle-progress" cx={size/2} cy={size/2} r={radius} strokeDasharray={circumference} strokeDashoffset={offset} /> 
            </svg> 
            <div className="kd-text">
                <span className="kd-rate">{percentage}%</span>
                <span className="kd-label">{t.winRate}</span>
            </div>
        </div> 
    ); 
};

// Avatar With Frame
const AvatarWithFrame = ({ photoURL, equipped, size = 'md', onClick }) => {
    const sizeConfig = { sm: { wrapper: 52, avatar: 30, mask: 32 }, md: { wrapper: 72, avatar: 40, mask: 42 }, lg: { wrapper: 110, avatar: 60, mask: 62 }, xl: { wrapper: 140, avatar: 80, mask: 82 } };
    const config = sizeConfig[size] || sizeConfig.md;
    const frameItem = SHOP_ITEMS.frames.find(f => f.id === equipped?.frames);
    
    const renderFrame = useCallback(() => {
        if (!frameItem) return null;
        if (frameItem.preview?.startsWith('http')) {
            return (
                <div style={{ position: 'absolute', top: 0, left: 0, width: config.wrapper + 'px', height: config.wrapper + 'px', borderRadius: '50%', overflow: 'hidden', zIndex: 1 }}>
                    <img src={frameItem.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="frame" />
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: config.mask + 'px', height: config.mask + 'px', borderRadius: '50%', background: 'var(--bg-dark)' }} />
                </div>
            );
        }
        return (
            <div style={{ position: 'absolute', top: 0, left: 0, width: config.wrapper + 'px', height: config.wrapper + 'px', borderRadius: '50%', background: frameItem.preview, zIndex: 1 }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: config.mask + 'px', height: config.mask + 'px', borderRadius: '50%', background: 'var(--bg-dark)' }} />
            </div>
        );
    }, [frameItem, config]);
    
    const avatarUrl = photoURL || `https://ui-avatars.com/api/?name=User&background=random`;
    
    return (
        <div style={{ position: 'relative', width: config.wrapper + 'px', height: config.wrapper + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: onClick ? 'pointer' : 'default', flexShrink: 0 }} onClick={onClick}>
            {renderFrame()}
            <img src={avatarUrl} style={{ width: config.avatar + 'px', height: config.avatar + 'px', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, border: '2px solid rgba(0,0,0,0.5)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} alt="avatar" />
        </div>
    );
};

// Render Title
const renderTitle = (titleId, lang = 'en') => {
    if (!titleId) return null;
    const titleItem = SHOP_ITEMS.titles.find(t => t.id === titleId);
    if (!titleItem) return null;
    
    if (titleItem.imageUrl && titleItem.imageUrl.trim() !== '') {
        return <div className="profile-title-image"><img src={titleItem.imageUrl} alt={titleItem.name_en} /></div>;
    }
    
    const name = lang === 'ar' ? titleItem.name_ar : titleItem.name_en;
    return <div className="profile-title-text"><span>{titleItem.preview || '🏷️'}</span><span>{name}</span></div>;
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
                
                if (badgeItem.imageUrl && badgeItem.imageUrl.trim() !== '') {
                    return <img key={index} src={badgeItem.imageUrl} alt={badgeItem.name_en} className="profile-badge-img" style={{ width: size + 'px', height: size + 'px' }} />;
                }
                return <span key={index} className="profile-badge" style={{ fontSize: size + 'px' }}>{badgeItem.preview || '🏅'}</span>;
            })}
        </div>
    );
};

// Notification Dropdown
const NotificationDropdown = ({ show, onClose, notifications = [], onMarkRead, onClearAll, onNotificationClick, lang = 'en' }) => {
    const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    if (!show) return null;
    
    const unreadCount = notifications.filter(n => !n?.read).length;
    
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
    
    return (
        <div className="notification-dropdown animate-pop">
            <div className="notification-dropdown-header">
                <span className="notification-dropdown-title">{t.notifications} {unreadCount > 0 && `(${unreadCount})`}</span>
                {notifications.length > 0 && <button onClick={() => onClearAll?.()} className="notification-clear-all">{t.clearAll}</button>}
            </div>
            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="notification-empty"><div className="text-3xl mb-2">🔔</div><p>{t.noNotifications}</p></div>
                ) : (
                    notifications.map(notif => (
                        <div key={notif?.id || Math.random()} className={`notification-item ${!notif?.read ? 'unread' : ''}`} onClick={() => { onMarkRead?.(notif?.id); onNotificationClick?.(notif); onClose?.(); }}>
                            <span className="notification-item-icon">{getNotificationIcon(notif?.type)}</span>
                            <div className="notification-item-content">
                                <div className="notification-item-title">{notif?.fromName || 'System'}</div>
                                <div className="notification-item-message">{notif?.message || ''}</div>
                                <div className="notification-item-time">{formatTime(notif?.timestamp)}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// Gift Log Component
const GiftLog = ({ show, onClose, targetUID, lang = 'en', onOpenProfile, isOwnProfile }) => {
    const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('wall');
    const [giftCounts, setGiftCounts] = useState({});
    const [lastSenders, setLastSenders] = useState({});
    const [totalGifts, setTotalGifts] = useState(0);
    const [rotatingGiftIndex, setRotatingGiftIndex] = useState(0);
    
    useEffect(() => {
        if (!show || !targetUID) { setLoading(false); return; }
        setLoading(true);
        
        const unsub = giftsLogCollection.where('receiverId', '==', targetUID).limit(50).onSnapshot(snap => {
            if (!snap) { setLoading(false); return; }
            
            const giftsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            giftsData.sort((a, b) => {
                const timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds || 0;
                const timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds || 0;
                return timeB - timeA;
            });
            setGifts(giftsData);
            setTotalGifts(giftsData.length);
            
            const counts = {};
            const senders = {};
            giftsData.forEach(gift => {
                const giftId = gift.giftId;
                if (!giftId) return;
                counts[giftId] = (counts[giftId] || 0) + 1;
                if (!senders[giftId]) {
                    senders[giftId] = { name: gift.senderName || 'Unknown', photo: gift.senderPhoto || null, uid: gift.senderId || null };
                }
            });
            setGiftCounts(counts);
            setLastSenders(senders);
            setLoading(false);
        }, error => { console.error('Gift log error:', error); setLoading(false); });
        
        return () => unsub?.();
    }, [show, targetUID]);
    
    useEffect(() => {
        if (gifts.length === 0) return;
        const interval = setInterval(() => { setRotatingGiftIndex(prev => (prev + 1) % Math.min(3, gifts.length)); }, 2000);
        return () => clearInterval(interval);
    }, [gifts.length]);
    
    const handleOpenProfile = useCallback((uid) => { if (uid && onOpenProfile) { onOpenProfile(uid); } }, [onOpenProfile]);
    
    if (!show) return null;
    
    const lastThreeGifts = gifts.slice(0, 3);
    const uniqueGifts = (SHOP_ITEMS.gifts || []).map(gift => ({
        ...gift,
        count: giftCounts[gift?.id] || 0,
        lastSender: lastSenders[gift?.id] || null,
        received: (giftCounts[gift?.id] || 0) > 0
    }));
    
    return (
        <div className="gift-log-container-v2">
            <div className="gift-mini-display" onClick={() => setActiveTab('wall')}>
                <div className="gift-mini-images">
                    {lastThreeGifts.length > 0 ? (
                        lastThreeGifts.map((gift, idx) => (
                            <div key={gift?.id || idx} className={`gift-mini-item ${idx === rotatingGiftIndex && lastThreeGifts.length > 1 ? 'active' : ''}`}>
                                {gift?.giftImageUrl && gift.giftImageUrl.trim() !== '' ? (
                                    <img src={gift.giftImageUrl} alt={gift.giftName || 'Gift'} className="gift-mini-img" />
                                ) : (
                                    <span className="gift-mini-emoji">{gift?.giftEmoji || '🎁'}</span>
                                )}
                            </div>
                        ))
                    ) : (<div className="gift-mini-empty">🎁</div>)}
                </div>
                <div className="gift-mini-info">
                    <span className="gift-mini-count">{totalGifts}</span>
                    <span className="gift-mini-label">{t.receivedGiftsCount}</span>
                </div>
            </div>
            
            <div className="gift-log-tabs">
                <button className={`gift-log-tab ${activeTab === 'wall' ? 'active' : ''}`} onClick={() => setActiveTab('wall')}>🎁 {t.giftWall}</button>
                <button className={`gift-log-tab ${activeTab === 'badge' ? 'active' : ''}`} onClick={() => setActiveTab('badge')}>🏅 {t.giftBadge}</button>
                <button className={`gift-log-tab ${activeTab === 'received' ? 'active' : ''}`} onClick={() => setActiveTab('received')}>📬 {t.giftLog}</button>
            </div>
            
            <div className="gift-log-content">
                {loading ? (
                    <div className="gift-log-loading">{t.loading}</div>
                ) : activeTab === 'wall' ? (
                    <div className="gift-wall-grid">
                        {uniqueGifts.map(gift => (
                            <div key={gift?.id || Math.random()} className={`gift-wall-item ${gift.received ? 'received' : 'not-received'}`} onClick={() => gift.lastSender?.uid && handleOpenProfile(gift.lastSender.uid)}>
                                {gift?.imageUrl && gift.imageUrl.trim() !== '' ? (
                                    <img src={gift.imageUrl} alt={gift.name_en || 'Gift'} className="gift-wall-img" />
                                ) : (
                                    <span className="gift-wall-emoji">{gift?.emoji || '🎁'}</span>
                                )}
                                {gift.received && (
                                    <>
                                        <span className="gift-wall-count">×{gift.count}</span>
                                        {gift.lastSender?.photo && <img src={gift.lastSender.photo} alt={gift.lastSender.name || 'Sender'} className="gift-wall-sender" />}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'badge' ? (
                    <div className="gift-badge-section">
                        <div className="coming-soon-badge">
                            <span className="coming-soon-icon">🏅</span>
                            <span className="coming-soon-text">{t.comingSoon}</span>
                        </div>
                    </div>
                ) : (
                    <div className="gift-log-list">
                        {gifts.length === 0 ? (
                            <div className="gift-log-empty">{t.giftLogEmpty}</div>
                        ) : (
                            gifts.slice(0, 10).map(gift => (
                                <div key={gift?.id || Math.random()} className="gift-log-item" onClick={() => gift?.senderId && handleOpenProfile(gift.senderId)}>
                                    <img src={gift?.senderPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(gift?.senderName || 'User')}&background=random`} alt={gift?.senderName || 'User'} className="gift-log-item-avatar" />
                                    <div className="gift-log-item-content">
                                        <div className="gift-log-item-sender">{gift?.senderName || 'Unknown'}</div>
                                        <div className="gift-log-item-details">
                                            {gift?.giftImageUrl && gift.giftImageUrl.trim() !== '' ? (
                                                <img src={gift.giftImageUrl} alt={gift.giftName || 'Gift'} className="gift-log-item-img" />
                                            ) : (
                                                <span className="gift-log-item-emoji">{gift?.giftEmoji || '🎁'}</span>
                                            )}
                                            <span className="gift-log-item-name">{lang === 'ar' ? (gift?.giftNameAr || gift?.giftName || 'هدية') : (gift?.giftNameEn || gift?.giftName || 'Gift')}</span>
                                        </div>
                                    </div>
                                    <div className="gift-log-item-stats">
                                        <span className="gift-log-item-charisma">+{formatCharisma(gift?.charisma || 0)}</span>
                                        {gift?.bonus > 0 && <span className="gift-log-item-bonus">+{gift.bonus} 🧠</span>}
                                        <span className="gift-log-item-time">{formatTime(gift?.timestamp)}</span>
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

// Achievements Display
const AchievementsDisplay = ({ userData, lang = 'en', showAll = false }) => {
    const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
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
    
    const getProgress = useCallback((achievement) => {
        if (!achievement?.condition) return { current: 0, target: 1, percent: 0 };
        
        const type = achievement.condition.type;
        const target = achievement.condition.value || 1;
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
        
        return { current: current || 0, target: target || 1, percent: Math.min(100, ((current || 0) / (target || 1)) * 100) };
    }, [giftsReceived, giftsSent, stats, gamesPlayed, loginStreak, totalLogins, friendsCount, spyWins, agentWins]);
    
    const isUnlocked = useCallback((achievement) => {
        return userAchievements.includes(achievement?.id);
    }, [userAchievements]);
    
    const displayAchievements = showAll ? ACHIEVEMENTS : ACHIEVEMENTS.slice(0, 6);
    
    return (
        <div className="achievements-container">
            <div className="achievements-grid">
                {(displayAchievements || []).map(ach => {
                    if (!ach) return null;
                    const unlocked = isUnlocked(ach);
                    const progress = getProgress(ach);
                    
                    return (
                        <div key={ach?.id || Math.random()} className={`achievement-item ${unlocked ? 'unlocked' : 'locked'}`} onClick={() => setSelectedAch(ach)}>
                            {ach?.imageUrl && ach.imageUrl.trim() !== '' ? (
                                <img src={ach.imageUrl} alt={t[ach.nameKey] || 'Achievement'} className="achievement-icon-img" />
                            ) : (
                                <span className="achievement-icon">{ach?.icon || '🏆'}</span>
                            )}
                            {unlocked && <span className="achievement-badge">✓</span>}
                            {!unlocked && progress.current > 0 && (
                                <div className="achievement-progress-mini">
                                    <div className="achievement-progress-fill" style={{ width: `${progress.percent}%` }} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {selectedAch && (
                <div className="modal-overlay" onClick={() => setSelectedAch(null)}>
                    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '320px' }}>
                        <div className="modal-body text-center py-4">
                            <div className="text-4xl mb-3">
                                {selectedAch?.imageUrl && selectedAch.imageUrl.trim() !== '' ? (
                                    <img src={selectedAch.imageUrl} alt={t[selectedAch?.nameKey] || 'Achievement'} className="w-16 h-16 mx-auto" />
                                ) : (
                                    selectedAch?.icon || '🏆'
                                )}
                            </div>
                            <h3 className="font-bold text-lg mb-1">{t[selectedAch?.nameKey] || 'Achievement'}</h3>
                            <p className="text-sm text-gray-400 mb-3">{t[selectedAch?.descKey] || ''}</p>
                            
                            {!isUnlocked(selectedAch) && (
                                <div className="achievement-progress-bar">
                                    <div className="achievement-progress-text">{t.achievementProgress}: {getProgress(selectedAch).current}/{getProgress(selectedAch).target}</div>
                                    <div className="achievement-progress-track">
                                        <div className="achievement-progress-fill-bar" style={{ width: `${getProgress(selectedAch).percent}%` }} />
                                    </div>
                                </div>
                            )}
                            
                            {isUnlocked(selectedAch) && <div className="text-green-400 font-bold">✓ {t.achievementUnlocked}</div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Login Rewards Modal
const LoginRewardsModal = ({ show, onClose, userData, onClaim, lang = 'en' }) => {
    const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    if (!show) return null;
    
    const rewards = userData?.loginRewards || {};
    const currentDay = rewards.currentDay || 1;
    const lastClaimDate = rewards.lastClaimDate?.toDate?.() || null;
    const today = new Date();
    const canClaim = !lastClaimDate || (today.toDateString() !== lastClaimDate.toDateString());
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop login-rewards-modal" onClick={e => e.stopPropagation()}>
                <ModalCloseBtn onClose={onClose} />
                <div className="modal-header">
                    <h2 className="modal-title">🎁 {t.loginRewards}</h2>
                    <p className="modal-subtitle">{t.dailyStreak}: {currentDay} {t.days}</p>
                </div>
                <div className="modal-body">
                    <div className="rewards-grid">
                        {LOGIN_REWARDS.map((reward, index) => {
                            const isClaimed = index < currentDay - 1 || (index === currentDay - 1 && !canClaim);
                            const isCurrent = index === currentDay - 1;
                            
                            return (
                                <div key={reward.day} className={`reward-item ${isClaimed ? 'claimed' : ''} ${isCurrent ? 'current' : ''} ${reward.special ? 'special' : ''}`}>
                                    <div className="reward-day">{t.days} {reward.day}</div>
                                    <div className="reward-icon">
                                        {reward.iconUrl && reward.iconUrl.trim() !== '' ? (
                                            <img src={reward.iconUrl} alt={reward.name_en} />
                                        ) : (
                                            reward.icon || '🎁'
                                        )}
                                    </div>
                                    <div className="reward-name">{lang === 'ar' ? reward.name_ar : reward.name_en}</div>
                                    {isClaimed && <div className="reward-claimed-badge">✓</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="modal-footer">
                    {canClaim ? (
                        <button className="btn-neon" onClick={onClaim}>{t.claimReward}</button>
                    ) : (
                        <button className="btn-disabled" disabled>{t.alreadyClaimed}</button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Shop Component
const ShopModal = ({ show, onClose, userData, onBuy, onEquip, lang = 'en' }) => {
    const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    const [activeTab, setActiveTab] = useState('frames');
    
    if (!show) return null;
    
    const currentIntel = userData?.intel || 0;
    const owned = userData?.owned || {};
    const equipped = userData?.equipped || {};
    
    const categories = ['frames', 'titles', 'badges', 'gifts'];
    
    return (
        <div className="modal-overlay shop-modal" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                <ModalCloseBtn onClose={onClose} />
                <div className="modal-header">
                    <h2 className="modal-title">🛒 {t.shop}</h2>
                    <div className="currency-display"><span>{CURRENCY_ICON}</span><span>{currentIntel}</span></div>
                </div>
                
                <div className="shop-tabs">
                    {categories.map(cat => (
                        <button key={cat} className={`shop-tab ${activeTab === cat ? 'active' : ''}`} onClick={() => setActiveTab(cat)}>
                            {t[cat]}
                        </button>
                    ))}
                </div>
                
                <div className="modal-body">
                    <div className="shop-grid">
                        {(SHOP_ITEMS[activeTab] || []).map(item => {
                            const isOwned = owned[activeTab]?.includes(item.id);
                            const isEquipped = equipped[activeTab] === item.id;
                            const canAfford = currentIntel >= (item.cost || 0);
                            
                            return (
                                <div key={item.id} className={`shop-item ${isOwned ? 'owned' : ''} ${isEquipped ? 'equipped' : ''}`}>
                                    <div className="shop-item-preview">
                                        {item.preview?.startsWith('http') ? (
                                            <img src={item.preview} alt={item.name_en} />
                                        ) : item.preview?.startsWith('linear') ? (
                                            <div style={{ width: '100%', height: '100%', background: item.preview, borderRadius: '8px' }} />
                                        ) : (
                                            <span className="shop-item-emoji">{item.preview || item.emoji || '📦'}</span>
                                        )}
                                    </div>
                                    <div className="shop-item-info">
                                        <span className="shop-item-name">{lang === 'ar' ? item.name_ar : item.name_en}</span>
                                        {activeTab === 'gifts' && <span className="shop-item-charisma">+{item.charisma} {t.charisma}</span>}
                                    </div>
                                    <div className="shop-item-actions">
                                        {isOwned ? (
                                            isEquipped ? (
                                                <button className="btn-equipped" disabled>{t.equipped}</button>
                                            ) : (
                                                <button className="btn-equip" onClick={() => onEquip(activeTab, item.id)}>{t.equip}</button>
                                            )
                                        ) : (
                                            <button className={`btn-buy ${!canAfford ? 'disabled' : ''}`} onClick={() => canAfford && onBuy(item)} disabled={!canAfford}>
                                                {item.cost} {CURRENCY_ICON}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Private Chat Component
const PrivateChatModal = ({ show, onClose, friendUID, friendData, currentUser, lang = 'en' }) => {
    const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    
    const chatId = currentUser?.uid && friendUID ? getChatId(currentUser.uid, friendUID) : null;
    
    useEffect(() => {
        if (!show || !chatId) return;
        setLoading(true);
        
        const unsub = chatsCollection.doc(chatId).collection('messages')
            .orderBy('timestamp', 'asc')
            .limitToLast(100)
            .onSnapshot(snap => {
                const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setMessages(msgs);
                setLoading(false);
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, error => { console.error('Chat error:', error); setLoading(false); });
        
        return () => unsub?.();
    }, [show, chatId]);
    
    const sendMessage = useCallback(() => {
        if (!newMessage.trim() || !chatId || !currentUser?.uid) return;
        
        const msgData = {
            text: newMessage.trim(),
            senderId: currentUser.uid,
            senderName: currentUser.displayName || 'User',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        chatsCollection.doc(chatId).collection('messages').add(msgData);
        chatsCollection.doc(chatId).set({
            participants: [currentUser.uid, friendUID],
            lastMessage: newMessage.trim(),
            lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        setNewMessage('');
        playMessageSound();
    }, [newMessage, chatId, currentUser, friendUID]);
    
    if (!show || !friendData) return null;
    
    return (
        <div className="modal-overlay chat-modal" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                <ModalCloseBtn onClose={onClose} />
                <div className="chat-header">
                    <AvatarWithFrame photoURL={friendData?.photoURL} equipped={friendData?.equipped} size="sm" />
                    <div className="chat-friend-info">
                        <span className="chat-friend-name">{friendData?.displayName || 'User'}</span>
                        <span className={`chat-status ${friendData?.isOnline ? 'online' : 'offline'}`}>
                            {friendData?.isOnline ? t.online : t.offline}
                        </span>
                    </div>
                </div>
                
                <div className="chat-messages">
                    {loading ? (
                        <div className="chat-loading">{t.loading}</div>
                    ) : messages.length === 0 ? (
                        <div className="chat-empty">{t.noMessages}</div>
                    ) : (
                        messages.map(msg => (
                            <div key={msg.id} className={`chat-message ${msg.senderId === currentUser?.uid ? 'sent' : 'received'}`}>
                                <div className="message-bubble">{msg.text}</div>
                                <div className="message-time">{formatTime(msg.timestamp)}</div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="chat-input-area">
                    <input
                        type="text"
                        className="chat-input"
                        placeholder={t.typeMessage}
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && sendMessage()}
                    />
                    <button className="chat-send-btn" onClick={sendMessage}>{t.send}</button>
                </div>
            </div>
        </div>
    );
};

// Profile Modal
const ProfileModal = ({ show, onClose, targetUID, currentUser, onSendGift, lang = 'en' }) => {
    const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showGiftLog, setShowGiftLog] = useState(false);
    
    const isOwnProfile = targetUID === currentUser?.uid;
    
    useEffect(() => {
        if (!show || !targetUID) return;
        setLoading(true);
        
        const unsub = usersCollection.doc(targetUID).onSnapshot(doc => {
            if (doc.exists) {
                setProfileData({ uid: targetUID, ...doc.data() });
            }
            setLoading(false);
        }, error => { console.error('Profile error:', error); setLoading(false); });
        
        return () => unsub?.();
    }, [show, targetUID]);
    
    if (!show) return null;
    
    const stats = profileData?.stats || {};
    const equipped = profileData?.equipped || {};
    
    return (
        <div className="modal-overlay profile-modal" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                <ModalCloseBtn onClose={onClose} />
                
                {loading ? (
                    <div className="profile-loading">{t.loading}</div>
                ) : profileData ? (
                    <div className="profile-content">
                        <div className="profile-header">
                            <AvatarWithFrame photoURL={profileData?.photoURL} equipped={equipped} size="lg" />
                            <div className="profile-info">
                                <h2 className="profile-name">{profileData?.displayName || 'User'}</h2>
                                {renderTitle(equipped?.titles, lang)}
                                {renderBadges(profileData?.badges)}
                                <div className="profile-uid">ID: {profileData?.uid?.slice(-6)}</div>
                            </div>
                        </div>
                        
                        <CharismaDisplay charisma={profileData?.charisma} lang={lang} />
                        
                        <div className="profile-stats">
                            <KDCircle wins={stats.wins || 0} losses={stats.losses || 0} lang={lang} />
                            <div className="stats-details">
                                <div className="stat-item"><span className="stat-label">{t.wins}</span><span className="stat-value">{stats.wins || 0}</span></div>
                                <div className="stat-item"><span className="stat-label">{t.losses}</span><span className="stat-value">{stats.losses || 0}</span></div>
                                <div className="stat-item"><span className="stat-label">{t.totalGames}</span><span className="stat-value">{(stats.wins || 0) + (stats.losses || 0)}</span></div>
                            </div>
                        </div>
                        
                        <GiftLog show={showGiftLog} targetUID={targetUID} lang={lang} onOpenProfile={() => {}} isOwnProfile={isOwnProfile} />
                        
                        {!isOwnProfile && (
                            <button className="btn-gift" onClick={() => onSendGift?.(targetUID)}>
                                🎁 {t.sendGift}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="profile-not-found">{t.friendNotFound}</div>
                )}
            </div>
        </div>
    );
};

// ==========================================
// نهاية الجزء الثاني
// ==========================================
// ==========================================
// PRO SPY - SCRIPT V12 - الجزء الثالث
// التطبيق الرئيسي (App Component)
// ==========================================

// Main App Component
function App() {
    // State Management
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lang, setLang] = useState('ar');
    const [screen, setScreen] = useState('main');
    const [notification, setNotification] = useState('');
    const [notifications, setNotifications] = useState([]);
    
    // Game States
    const [room, setRoom] = useState(null);
    const [roomCode, setRoomCode] = useState('');
    const [isHost, setIsHost] = useState(false);
    const [playerRole, setPlayerRole] = useState(null);
    const [gamePhase, setGamePhase] = useState('lobby');
    const [currentRound, setCurrentRound] = useState(1);
    const [votes, setVotes] = useState({});
    const [messages, setMessages] = useState([]);
    const [selectedWord, setSelectedWord] = useState('');
    const [winner, setWinner] = useState(null);
    
    // Modal States
    const [showShop, setShowShop] = useState(false);
    const [showProfile, setShowProfile] = useState(null);
    const [showChat, setShowChat] = useState(null);
    const [showLoginRewards, setShowLoginRewards] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showReport, setShowReport] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    
    // Form States
    const [playerName, setPlayerName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [joinPassword, setJoinPassword] = useState('');
    const [gameMode, setGameMode] = useState('normal');
    const [isPrivate, setIsPrivate] = useState(false);
    const [roomPassword, setRoomPassword] = useState('');
    const [chatMessage, setChatMessage] = useState('');
    
    // Refs
    const messagesEndRef = useRef(null);
    const unsubscribers = useRef({});
    
    const t = TRANSLATIONS[lang] || TRANSLATIONS['ar'];
    
    // ==========================================
    // Auth & User Data
    // ==========================================
    useEffect(() => {
        const unsubAuth = auth.onAuthStateChanged(async (authUser) => {
            if (authUser) {
                setUser(authUser);
                loadUserData(authUser.uid);
            } else {
                // Check for guest
                const guestUID = localStorage.getItem('pro_spy_guest_uid');
                if (guestUID) {
                    setUser({ uid: guestUID, isGuest: true });
                    loadGuestData(guestUID);
                } else {
                    setLoading(false);
                }
            }
        });
        
        return () => unsubAuth?.();
    }, []);
    
    const loadUserData = useCallback(async (uid) => {
        if (!uid) return;
        
        try {
            const unsub = usersCollection.doc(uid).onSnapshot(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    setUserData({ uid, ...data });
                    setPlayerName(data.displayName || '');
                    
                    // Check login rewards
                    if (data.loginRewards?.lastClaimDate) {
                        const lastClaim = data.loginRewards.lastClaimDate.toDate?.() || new Date(data.loginRewards.lastClaimDate);
                        const today = new Date();
                        if (lastClaim.toDateString() !== today.toDateString()) {
                            setShowLoginRewards(true);
                        }
                    } else {
                        setShowLoginRewards(true);
                    }
                }
                setLoading(false);
            });
            
            unsubscribers.current[`user_${uid}`] = unsub;
        } catch (error) {
            console.error('Load user error:', error);
            setLoading(false);
        }
    }, []);
    
    const loadGuestData = useCallback(async (guestUID) => {
        try {
            const unsub = guestsCollection.doc(guestUID).onSnapshot(doc => {
                if (doc.exists) {
                    setUserData({ uid: guestUID, isGuest: true, ...doc.data() });
                    setPlayerName(doc.data()?.displayName || '');
                }
                setLoading(false);
            });
            
            unsubscribers.current[`guest_${guestUID}`] = unsub;
        } catch (error) {
            console.error('Load guest error:', error);
            setLoading(false);
        }
    }, []);
    
    // ==========================================
    // Auth Functions
    // ==========================================
    const loginWithGoogle = useCallback(async () => {
        try {
            playSound('click');
            const provider = new firebase.auth.GoogleAuthProvider();
            await auth.signInWithPopup(provider);
        } catch (error) {
            console.error('Login error:', error);
            setNotification(t.loginRequired);
        }
    }, [t]);
    
    const playAsGuest = useCallback(async () => {
        try {
            playSound('click');
            const guestUID = 'guest_' + generateUID();
            const guestName = 'Guest_' + guestUID.slice(-4);
            
            await guestsCollection.doc(guestUID).set({
                displayName: guestName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                stats: { wins: 0, losses: 0 },
                charisma: 0,
                intel: 100
            });
            
            localStorage.setItem('pro_spy_guest_uid', guestUID);
            setUser({ uid: guestUID, isGuest: true });
            setUserData({ uid: guestUID, isGuest: true, displayName: guestName, stats: { wins: 0, losses: 0 }, charisma: 0, intel: 100 });
        } catch (error) {
            console.error('Guest creation error:', error);
        }
    }, []);
    
    const logout = useCallback(async () => {
        try {
            playSound('click');
            
            // Unsubscribe all listeners
            Object.values(unsubscribers.current).forEach(unsub => unsub?.());
            unsubscribers.current = {};
            
            if (user?.isGuest) {
                localStorage.removeItem('pro_spy_guest_uid');
            } else {
                await auth.signOut();
            }
            
            setUser(null);
            setUserData(null);
            setScreen('main');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, [user]);
    
    // ==========================================
    // Room Functions
    // ==========================================
    const createRoom = useCallback(async () => {
        if (!user?.uid || !playerName.trim()) return;
        
        try {
            playSound('click');
            const code = generateUID();
            const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
            
            const roomData = {
                code,
                hostId: user.uid,
                hostName: playerName,
                players: [{
                    uid: user.uid,
                    name: playerName,
                    photoURL: userData?.photoURL || null,
                    equipped: userData?.equipped || {},
                    isOnline: true,
                    role: null,
                    isGhost: false
                }],
                gameMode,
                isPrivate,
                password: isPrivate ? roomPassword : null,
                status: 'waiting',
                currentRound: 1,
                scenario: scenario,
                location: lang === 'ar' ? scenario.loc_ar : scenario.loc_en,
                words: lang === 'ar' ? scenario.words_ar : scenario.words_en,
                selectedWord: null,
                votes: {},
                messages: [],
                winner: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await roomsCollection.doc(code).set(roomData);
            setRoomCode(code);
            setIsHost(true);
            setScreen('lobby');
        } catch (error) {
            console.error('Create room error:', error);
        }
    }, [user, playerName, userData, gameMode, isPrivate, roomPassword, lang]);
    
    const joinRoom = useCallback(async () => {
        if (!user?.uid || !playerName.trim() || !joinCode.trim()) return;
        
        try {
            playSound('click');
            const roomDoc = await roomsCollection.doc(joinCode).get();
            
            if (!roomDoc.exists) {
                setNotification(t.friendNotFound);
                return;
            }
            
            const roomData = roomDoc.data();
            
            if (roomData.isPrivate && roomData.password !== joinPassword) {
                setNotification(t.privateRoomError);
                return;
            }
            
            if (roomData.status !== 'waiting') {
                setNotification(t.needPlayers);
                return;
            }
            
            // Check if already in room
            const playerIndex = roomData.players.findIndex(p => p.uid === user.uid);
            if (playerIndex === -1) {
                // Add player to room
                await roomsCollection.doc(joinCode).update({
                    players: firebase.firestore.FieldValue.arrayUnion({
                        uid: user.uid,
                        name: playerName,
                        photoURL: userData?.photoURL || null,
                        equipped: userData?.equipped || {},
                        isOnline: true,
                        role: null,
                        isGhost: false
                    })
                });
            }
            
            setRoomCode(joinCode);
            setIsHost(false);
            setScreen('lobby');
        } catch (error) {
            console.error('Join room error:', error);
        }
    }, [user, playerName, joinCode, joinPassword, userData, t]);
    
    const leaveRoom = useCallback(async () => {
        if (!user?.uid || !roomCode) return;
        
        try {
            playSound('click');
            const roomDoc = await roomsCollection.doc(roomCode).get();
            if (roomDoc.exists) {
                const roomData = roomDoc.data();
                const updatedPlayers = roomData.players.filter(p => p.uid !== user.uid);
                
                if (updatedPlayers.length === 0) {
                    await roomsCollection.doc(roomCode).delete();
                } else {
                    await roomsCollection.doc(roomCode).update({
                        players: updatedPlayers,
                        hostId: roomData.hostId === user.uid ? updatedPlayers[0]?.uid : roomData.hostId
                    });
                }
            }
            
            setRoomCode('');
            setRoom(null);
            setIsHost(false);
            setScreen('main');
        } catch (error) {
            console.error('Leave room error:', error);
        }
    }, [user, roomCode]);
    
    // ==========================================
    // Game Functions
    // ==========================================
    const startGame = useCallback(async () => {
        if (!roomCode || !isHost) return;
        
        try {
            playSound('success');
            const roomDoc = await roomsCollection.doc(roomCode).get();
            const roomData = roomDoc.data();
            
            if (roomData.players.length < 3) {
                setNotification(t.needPlayers);
                return;
            }
            
            // Assign roles
            const players = [...roomData.players];
            const spyIndex = Math.floor(Math.random() * players.length);
            players[spyIndex].role = 'spy';
            
            // Advanced mode roles
            if (roomData.gameMode === 'advanced' && players.length >= 6) {
                const remainingIndices = players.map((_, i) => i).filter(i => i !== spyIndex);
                
                // Mr. White
                const mrWhiteIndex = remainingIndices[Math.floor(Math.random() * remainingIndices.length)];
                players[mrWhiteIndex].role = 'mrWhite';
                remainingIndices.splice(remainingIndices.indexOf(mrWhiteIndex), 1);
                
                // Informant
                if (remainingIndices.length > 0) {
                    const informantIndex = remainingIndices[Math.floor(Math.random() * remainingIndices.length)];
                    players[informantIndex].role = 'informant';
                }
            }
            
            // Set all others as agents
            players.forEach(p => {
                if (!p.role) p.role = 'agent';
            });
            
            // Select random word
            const wordIndex = Math.floor(Math.random() * roomData.words.length);
            const selectedWord = roomData.words[wordIndex];
            
            await roomsCollection.doc(roomCode).update({
                players,
                status: 'playing',
                gamePhase: 'wordSelection',
                selectedWord,
                currentRound: 1
            });
            
        } catch (error) {
            console.error('Start game error:', error);
        }
    }, [roomCode, isHost, t]);
    
    const skipTurn = useCallback(async () => {
        if (!user?.uid || !roomCode) return;
        playSound('click');
        // Handle skip turn logic
    }, [user, roomCode]);
    
    const castVote = useCallback(async (targetUID) => {
        if (!user?.uid || !roomCode) return;
        
        try {
            playSound('click');
            const roomDoc = await roomsCollection.doc(roomCode).get();
            const roomData = roomDoc.data();
            
            const updatedVotes = { ...roomData.votes, [user.uid]: targetUID };
            
            // Check if all players voted
            if (Object.keys(updatedVotes).length === roomData.players.filter(p => !p.isGhost).length) {
                // Count votes
                const voteCounts = {};
                Object.values(updatedVotes).forEach(v => {
                    voteCounts[v] = (voteCounts[v] || 0) + 1;
                });
                
                // Find player with most votes
                let maxVotes = 0;
                let ejectedPlayer = null;
                Object.entries(voteCounts).forEach(([uid, count]) => {
                    if (count > maxVotes) {
                        maxVotes = count;
                        ejectedPlayer = uid;
                    }
                });
                
                // Check if spy was ejected
                const ejectedPlayerData = roomData.players.find(p => p.uid === ejectedPlayer);
                if (ejectedPlayerData?.role === 'spy') {
                    await roomsCollection.doc(roomCode).update({
                        votes: updatedVotes,
                        status: 'finished',
                        winner: 'agents'
                    });
                } else {
                    // Continue game or spy wins
                    const alivePlayers = roomData.players.filter(p => !p.isGhost && p.uid !== ejectedPlayer);
                    const spyAlive = alivePlayers.some(p => p.role === 'spy');
                    
                    if (!spyAlive) {
                        await roomsCollection.doc(roomCode).update({
                            votes: updatedVotes,
                            status: 'finished',
                            winner: 'agents'
                        });
                    } else if (alivePlayers.length <= 2) {
                        await roomsCollection.doc(roomCode).update({
                            votes: updatedVotes,
                            status: 'finished',
                            winner: 'spy'
                        });
                    } else {
                        // Mark player as ghost and continue
                        const updatedPlayers = roomData.players.map(p => 
                            p.uid === ejectedPlayer ? { ...p, isGhost: true } : p
                        );
                        await roomsCollection.doc(roomCode).update({
                            players: updatedPlayers,
                            votes: {},
                            currentRound: roomData.currentRound + 1
                        });
                    }
                }
            } else {
                await roomsCollection.doc(roomCode).update({ votes: updatedVotes });
            }
        } catch (error) {
            console.error('Vote error:', error);
        }
    }, [user, roomCode]);
    
    // ==========================================
    // Shop Functions
    // ==========================================
    const buyItem = useCallback(async (item) => {
        if (!user?.uid || !userData) return;
        
        try {
            const currentIntel = userData.intel || 0;
            if (currentIntel < (item.cost || 0)) {
                setNotification(t.purchaseFail);
                return;
            }
            
            playSound('success');
            
            const updatedOwned = { ...userData.owned };
            if (!updatedOwned[item.type]) updatedOwned[item.type] = [];
            updatedOwned[item.type].push(item.id);
            
            await usersCollection.doc(user.uid).update({
                intel: currentIntel - (item.cost || 0),
                owned: updatedOwned
            });
            
            setNotification(t.purchaseSuccess);
        } catch (error) {
            console.error('Buy error:', error);
        }
    }, [user, userData, t]);
    
    const equipItem = useCallback(async (type, itemId) => {
        if (!user?.uid) return;
        
        try {
            playSound('click');
            const updatedEquipped = { ...userData?.equipped, [type]: itemId };
            await usersCollection.doc(user.uid).update({ equipped: updatedEquipped });
        } catch (error) {
            console.error('Equip error:', error);
        }
    }, [user, userData]);
    
    // ==========================================
    // Gift Functions
    // ==========================================
    const sendGift = useCallback(async (targetUID, gift) => {
        if (!user?.uid || !userData || !targetUID) return;
        
        try {
            const currentIntel = userData.intel || 0;
            if (currentIntel < (gift.cost || 0)) {
                setNotification(t.purchaseFail);
                return;
            }
            
            playGiftSound();
            
            const bonus = generateRandomBonus(gift.minBonus, gift.maxBonus);
            
            // Log gift
            await giftsLogCollection.add({
                senderId: user.uid,
                senderName: userData.displayName || 'User',
                senderPhoto: userData.photoURL || null,
                receiverId: targetUID,
                giftId: gift.id,
                giftName: gift.name_en,
                giftNameAr: gift.name_ar,
                giftEmoji: gift.emoji,
                giftImageUrl: gift.imageUrl,
                charisma: gift.charisma,
                bonus,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update receiver
            await usersCollection.doc(targetUID).update({
                charisma: firebase.firestore.FieldValue.increment(gift.charisma || 0),
                intel: firebase.firestore.FieldValue.increment(bonus),
                giftsReceived: firebase.firestore.FieldValue.increment(1)
            });
            
            // Update sender
            await usersCollection.doc(user.uid).update({
                intel: currentIntel - (gift.cost || 0),
                giftsSent: firebase.firestore.FieldValue.increment(1)
            });
            
            // Add notification
            await notificationsCollection.add({
                toUID: targetUID,
                fromUID: user.uid,
                fromName: userData.displayName || 'User',
                type: 'gift',
                message: `${userData.displayName || 'Someone'} ${t.sentAGift}`,
                read: false,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            setNotification(t.giftSent);
        } catch (error) {
            console.error('Gift error:', error);
        }
    }, [user, userData, t]);
    
    // ==========================================
    // Login Rewards
    // ==========================================
    const claimLoginReward = useCallback(async () => {
        if (!user?.uid || !userData) return;
        
        try {
            playRewardSound();
            const rewards = userData.loginRewards || {};
            const currentDay = (rewards.currentDay || 1);
            const reward = LOGIN_REWARDS[currentDay - 1] || LOGIN_REWARDS[0];
            
            let updates = {
                loginRewards: {
                    currentDay: currentDay >= 30 ? 1 : currentDay + 1,
                    lastClaimDate: firebase.firestore.FieldValue.serverTimestamp(),
                    streak: (rewards.streak || 0) + 1,
                    totalClaims: (rewards.totalClaims || 0) + 1
                }
            };
            
            if (reward.type === 'currency') {
                updates.intel = firebase.firestore.FieldValue.increment(reward.amount || 0);
            } else if (reward.type === 'badge' || reward.type === 'frame' || reward.type === 'title') {
                const updatedOwned = { ...userData.owned };
                if (!updatedOwned[reward.type + 's']) updatedOwned[reward.type + 's'] = [];
                updatedOwned[reward.type + 's'].push(reward.itemId);
                updates.owned = updatedOwned;
            }
            
            if (!user.isGuest) {
                await usersCollection.doc(user.uid).update(updates);
            } else {
                await guestsCollection.doc(user.uid).update(updates);
            }
            
            setShowLoginRewards(false);
        } catch (error) {
            console.error('Claim reward error:', error);
        }
    }, [user, userData]);
    
    // ==========================================
    // Room Listener
    // ==========================================
    useEffect(() => {
        if (!roomCode) return;
        
        const unsub = roomsCollection.doc(roomCode).onSnapshot(doc => {
            if (doc.exists) {
                const roomData = doc.data();
                setRoom(roomData);
                setGamePhase(roomData.gamePhase || 'lobby');
                setCurrentRound(roomData.currentRound || 1);
                setVotes(roomData.votes || {});
                setMessages(roomData.messages || []);
                setWinner(roomData.winner);
                
                // Find player role
                const player = roomData.players?.find(p => p.uid === user?.uid);
                if (player) {
                    setPlayerRole(player.role);
                }
            }
        });
        
        unsubscribers.current[`room_${roomCode}`] = unsub;
        
        return () => {
            unsub?.();
            delete unsubscribers.current[`room_${roomCode}`];
        };
    }, [roomCode, user]);
    
    // ==========================================
    // Notifications Listener
    // ==========================================
    useEffect(() => {
        if (!user?.uid || user.isGuest) return;
        
        const unsub = notificationsCollection
            .where('toUID', '==', user.uid)
            .orderBy('timestamp', 'desc')
            .limit(20)
            .onSnapshot(snap => {
                const notifs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setNotifications(notifs);
            });
        
        unsubscribers.current['notifications'] = unsub;
        
        return () => unsub?.();
    }, [user]);
    
    // ==========================================
    // Sound Toggle
    // ==========================================
    const toggleSound = useCallback(() => {
        const newMuted = !window.proSpySoundMuted;
        window.proSpySoundMuted = newMuted;
        localStorage.setItem('pro_spy_sound_muted', newMuted.toString());
        playSound('click');
    }, []);
    
    // ==========================================
    // Render Functions
    // ==========================================
    
    // Loading Screen
    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>{t.loading}</p>
            </div>
        );
    }
    
    // Auth Screen
    if (!user) {
        return (
            <div className="auth-screen">
                <div className="auth-container">
                    <h1 className="auth-title">{t.appName}</h1>
                    <p className="auth-tagline">{t.tagline}</p>
                    
                    <button className="btn-google" onClick={loginWithGoogle}>
                        <span className="google-icon">G</span>
                        {t.loginGoogle}
                    </button>
                    
                    <div className="auth-divider">
                        <span>{t.or}</span>
                    </div>
                    
                    <button className="btn-guest" onClick={playAsGuest}>
                        {t.playAsGuest}
                    </button>
                    
                    <button className="btn-lang" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
                        {t.langBtn}
                    </button>
                </div>
            </div>
        );
    }
    
    // Main Screen
    return (
        <div className="app-container" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <NotificationToast message={notification} onClose={() => setNotification('')} />
            
            {/* Header */}
            <header className="app-header">
                <div className="header-left">
                    <AvatarWithFrame
                        photoURL={userData?.photoURL}
                        equipped={userData?.equipped}
                        size="sm"
                        onClick={() => setShowProfile(user.uid)}
                    />
                    <div className="user-info">
                        <span className="user-name">{userData?.displayName || playerName}</span>
                        <span className="user-currency">{CURRENCY_ICON} {userData?.intel || 0}</span>
                    </div>
                </div>
                
                <div className="header-center">
                    <h1 className="app-title">{t.appName}</h1>
                </div>
                
                <div className="header-right">
                    <button className="btn-icon" onClick={() => setShowNotifications(!showNotifications)}>
                        🔔
                        {notifications.filter(n => !n.read).length > 0 && (
                            <span className="notification-badge">{notifications.filter(n => !n.read).length}</span>
                        )}
                    </button>
                    
                    <button className="btn-icon" onClick={toggleSound}>
                        {window.proSpySoundMuted ? '🔇' : '🔊'}
                    </button>
                    
                    <button className="btn-icon" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
                        {t.langBtn}
                    </button>
                    
                    <button className="btn-icon" onClick={logout}>
                        🚪
                    </button>
                </div>
                
                <NotificationDropdown
                    show={showNotifications}
                    onClose={() => setShowNotifications(false)}
                    notifications={notifications}
                    onMarkRead={(id) => notificationsCollection.doc(id).update({ read: true })}
                    onClearAll={() => {
                        notifications.forEach(n => notificationsCollection.doc(n.id).delete());
                        setNotifications([]);
                    }}
                    lang={lang}
                />
            </header>
            
            {/* Main Content */}
            <main className="app-main">
                {screen === 'main' && (
                    <div className="main-screen">
                        {userData?.isGuest && <GuestBanner lang={lang} />}
                        
                        <div className="player-name-section">
                            <input
                                type="text"
                                className="input-name"
                                placeholder={t.nickname}
                                value={playerName}
                                onChange={e => setPlayerName(e.target.value)}
                            />
                        </div>
                        
                        <CharismaDisplay charisma={userData?.charisma} lang={lang} />
                        
                        <div className="main-buttons">
                            <button className="btn-primary" onClick={() => setScreen('create')}>
                                {t.create}
                            </button>
                            <button className="btn-primary" onClick={() => setScreen('join')}>
                                {t.join}
                            </button>
                            <button className="btn-secondary" onClick={() => setScreen('browse')}>
                                {t.browse}
                            </button>
                            <button className="btn-shop" onClick={() => setShowShop(true)}>
                                🛒 {t.shop}
                            </button>
                        </div>
                        
                        <AchievementsDisplay userData={userData} lang={lang} />
                    </div>
                )}
                
                {screen === 'create' && (
                    <div className="create-screen">
                        <h2>{t.create}</h2>
                        
                        <div className="mode-selection">
                            <button
                                className={`mode-btn ${gameMode === 'normal' ? 'active' : ''}`}
                                onClick={() => setGameMode('normal')}
                            >
                                <span className="mode-title">{t.normalMode}</span>
                                <span className="mode-desc">{t.modeNormalDesc}</span>
                            </button>
                            <button
                                className={`mode-btn ${gameMode === 'advanced' ? 'active' : ''}`}
                                onClick={() => setGameMode('advanced')}
                            >
                                <span className="mode-title">{t.advancedMode}</span>
                                <span className="mode-desc">{t.modeAdvDesc}</span>
                            </button>
                        </div>
                        
                        <div className="private-toggle">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isPrivate}
                                    onChange={e => setIsPrivate(e.target.checked)}
                                />
                                {t.privateRoom}
                            </label>
                        </div>
                        
                        {isPrivate && (
                            <input
                                type="password"
                                className="input-password"
                                placeholder={t.password}
                                value={roomPassword}
                                onChange={e => setRoomPassword(e.target.value)}
                            />
                        )}
                        
                        <div className="create-actions">
                            <button className="btn-back" onClick={() => setScreen('main')}>{t.close}</button>
                            <button className="btn-primary" onClick={createRoom}>{t.create}</button>
                        </div>
                    </div>
                )}
                
                {screen === 'join' && (
                    <div className="join-screen">
                        <h2>{t.join}</h2>
                        
                        <input
                            type="text"
                            className="input-code"
                            placeholder={t.codePlaceholder}
                            value={joinCode}
                            onChange={e => setJoinCode(e.target.value)}
                            maxLength={6}
                        />
                        
                        <input
                            type="password"
                            className="input-password"
                            placeholder={t.password}
                            value={joinPassword}
                            onChange={e => setJoinPassword(e.target.value)}
                        />
                        
                        <div className="join-actions">
                            <button className="btn-back" onClick={() => setScreen('main')}>{t.close}</button>
                            <button className="btn-primary" onClick={joinRoom}>{t.join}</button>
                        </div>
                    </div>
                )}
                
                {screen === 'lobby' && room && (
                    <div className="lobby-screen">
                        <div className="lobby-header">
                            <h2>{t.lobbyTitle}</h2>
                            <div className="room-code">
                                {t.id}: {room.code}
                                <button className="btn-copy" onClick={() => { navigator.clipboard.writeText(room.code); setNotification(t.codeCopied); }}>
                                    📋
                                </button>
                            </div>
                        </div>
                        
                        <div className="players-list">
                            <h3>{t.players} ({room.players?.length || 0}/10)</h3>
                            {room.players?.map((player, index) => (
                                <div key={index} className="player-item" onClick={() => setShowProfile(player.uid)}>
                                    <AvatarWithFrame photoURL={player.photoURL} equipped={player.equipped} size="sm" />
                                    <span className="player-name">{player.name}</span>
                                    {player.uid === user.uid && <span className="you-badge">{t.you}</span>}
                                    {player.uid === room.hostId && <span className="host-badge">👑</span>}
                                </div>
                            ))}
                        </div>
                        
                        <div className="lobby-actions">
                            {isHost ? (
                                <>
                                    <button className="btn-primary" onClick={startGame}>{t.start}</button>
                                    <button className="btn-danger" onClick={leaveRoom}>{t.closeRoom}</button>
                                </>
                            ) : (
                                <button className="btn-danger" onClick={leaveRoom}>{t.leaveRoom}</button>
                            )}
                        </div>
                    </div>
                )}
                
                {screen === 'game' && room && (
                    <div className="game-screen">
                        {/* Game UI would go here */}
                        <div className="game-info">
                            <span>{t.roundsFormat(currentRound, MAX_ROUNDS)}</span>
                            <span>{playerRole ? t[`status${playerRole.charAt(0).toUpperCase() + playerRole.slice(1)}`] : ''}</span>
                        </div>
                        
                        {winner && (
                            <div className="game-over-modal">
                                <h2>{winner === 'spy' ? t.spyWin : winner === 'mrWhite' ? t.mrWhiteWin : t.agentsWin}</h2>
                                <button className="btn-primary" onClick={leaveRoom}>{t.playAgain}</button>
                            </div>
                        )}
                    </div>
                )}
            </main>
            
            {/* Modals */}
            {showShop && (
                <ShopModal
                    show={showShop}
                    onClose={() => setShowShop(false)}
                    userData={userData}
                    onBuy={buyItem}
                    onEquip={equipItem}
                    lang={lang}
                />
            )}
            
            {showLoginRewards && (
                <LoginRewardsModal
                    show={showLoginRewards}
                    onClose={() => setShowLoginRewards(false)}
                    userData={userData}
                    onClaim={claimLoginReward}
                    lang={lang}
                />
            )}
            
            {showProfile && (
                <ProfileModal
                    show={!!showProfile}
                    onClose={() => setShowProfile(null)}
                    targetUID={showProfile}
                    currentUser={user}
                    onSendGift={(uid) => { setShowProfile(null); /* Open gift modal */ }}
                    lang={lang}
                />
            )}
            
            {showChat && (
                <PrivateChatModal
                    show={!!showChat}
                    onClose={() => setShowChat(null)}
                    friendUID={showChat}
                    currentUser={user}
                    lang={lang}
                />
            )}
        </div>
    );
}

// ==========================================
// Render App
// ==========================================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);

// ==========================================
// نهاية الجزء الثالث والأخير
// ==========================================
