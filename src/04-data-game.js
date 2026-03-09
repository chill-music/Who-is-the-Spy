const DAILY_TASKS_CONFIG = [
    { id: 1, label_en: '1 min',   label_ar: '١ دقيقة',   duration: 60000,   reward: { type:'currency', amount:50,  icon:'🧠'}, comingSoon: false },
    { id: 2, label_en: '5 min',   label_ar: '٥ دقائق',   duration: 300000,  reward: { type:'currency', amount:100, icon:'🧠'}, comingSoon: false },
    { id: 3, label_en: '10 min',  label_ar: '١٠ دقائق',  duration: 600000,  reward: { type:'currency', amount:150, icon:'🧠'}, comingSoon: false },
    { id: 4, label_en: 'VIP',     label_ar: 'VIP',        duration: null,    reward: { type:'currency', amount:300, icon:'👑'}, comingSoon: true  },
    { id: 5, label_en: '20 min',  label_ar: '٢٠ دقيقة',  duration: 1200000, reward: { type:'currency', amount:200, icon:'🧠'}, comingSoon: false },
    { id: 6, label_en: '30 min',  label_ar: '٣٠ دقيقة',  duration: 1800000, reward: { type:'currency', amount:300, icon:'🧠'}, comingSoon: false },
    { id: 7, label_en: '60 min',  label_ar: '٦٠ دقيقة',  duration: 3600000, reward: { type:'currency', amount:500, icon:'🧠'}, comingSoon: false },
    { id: 8, label_en: 'VIP',     label_ar: 'VIP',        duration: null,    reward: { type:'currency', amount:800, icon:'👑'}, comingSoon: true  },
];

// CHARISMA LEVELS - 21 Levels
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

// SHOP ITEMS - GIFTS WITH BONUS (NO CASHBACK)
const SHOP_ITEMS = {
    frames: [
        { id: 'frame_gold', name_en: "Gold Frame", name_ar: "إطار ذهبي", cost: 500, type: 'frames', preview: 'linear-gradient(45deg, #f7ff00, #db9700)' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'frame_neon', name_en: "Neon Frame", name_ar: "إطار نيون", cost: 300, type: 'frames', preview: 'linear-gradient(45deg, #00f2ff, #7000ff)' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'frame_fire', name_en: "Fire Frame", name_ar: "إطار نار", cost: 400, type: 'frames', preview: 'linear-gradient(45deg, #ff0055, #ff8800)' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'frame_img', name_en: "Image Frame", name_ar: "إطار صورة", cost: 100, type: 'frames', preview: 'https://i.ibb.co/mVQTLr2D/Untitled-3.png' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'frame_1', name_en: " Frame", name_ar: "إطار متحرك", cost: 0, type: 'frames', preview: 'https://i.ibb.co/4Rj8jzWS/0202.png' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'frame_rainbow', name_en: "Rainbow Frame", name_ar: "إطار قوس قزح", cost: 600, type: 'frames', preview: 'https://i.ibb.co/1tvtgmD8/ezgif-com-optimize.gif' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'frame_ice', name_en: "Ice Frame", name_ar: "إطار جليد", cost: 350, type: 'frames', preview: 'linear-gradient(45deg, #00d4ff, #ffffff, #00d4ff)' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
    ],
    titles: [
        { id: 'title_spy', name_en: "Mr. Spy", name_ar: "سيد جاسوس", cost: 600, type: 'titles', preview: '🕵️', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'title_hunter', name_en: "Hunter", name_ar: "صياد", cost: 450, type: 'titles', preview: '🎯', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'title_ghost', name_en: "Ghost", name_ar: "شبح", cost: 800, type: 'titles', preview: '👻', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'title_legend', name_en: "Legend", name_ar: "أسطورة", cost: 1500, type: 'titles', preview: '👑', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'title_pro', name_en: "Pro Player", name_ar: "محترف", cost: 1000, type: 'titles', preview: '⭐', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'title_shadow', name_en: "Shadow", name_ar: "ظل", cost: 700, type: 'titles', preview: '', imageUrl: 'https://i.ibb.co/xqk8md71/122222.png' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
    ],
    badges: [
        { id: 'badge_vip', name_en: "VIP Badge", name_ar: "شارة VIP", cost: 1000, type: 'badges', preview: '⭐', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'badge_love', name_en: "Love Badge", name_ar: "شارة حب", cost: 800, type: 'badges', preview: '💕', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'badge_pro', name_en: "Pro Badge", name_ar: "شارة محترف", cost: 1500, type: 'badges', preview: '🏆', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'badge_legend', name_en: "Legend Badge", name_ar: "شارة أسطورة", cost: 5000, type: 'badges', preview: '👑', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'badge_star', name_en: "Star Badge", name_ar: "شارة نجم", cost: 2000, type: 'badges', preview: '🌟', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'badge_fire', name_en: "Fire Badge", name_ar: "شارة نار", cost: 1200, type: 'badges', preview: '🔥', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'badge_ice', name_en: "Ice Badge", name_ar: "شارة جليد", cost: 1200, type: 'badges', preview: '❄️', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'badge_diamond', name_en: "Diamond Badge", name_ar: "شارة ماسة", cost: 3000, type: 'badges', preview: '', imageUrl: 'https://i.ibb.co/ZR2rv0s3/awaw.png' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
    ],
    themes: [
        { id: 'theme_dark', name_en: "Midnight", name_ar: "منتصف الليل", cost: 200, type: 'themes' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'theme_ocean', name_en: "Ocean Blue", name_ar: "أزرق محيطي", cost: 300, type: 'themes' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
    ],
    profileEffects: [
        { id: 'effect_sakura', name_en: "Sakura Petals", name_ar: "زهور الكرز",  cost: 800,  type: 'profileEffects', rarity: 'Rare',      preview: '🌸', particles: [{emoji:'🌸',count:12},{emoji:'🌺',count:8}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'effect_hearts', name_en: "Heart Shower",  name_ar: "دش القلوب",   cost: 900,  type: 'profileEffects', rarity: 'Rare',      preview: '💖', particles: [{emoji:'💖',count:12},{emoji:'💕',count:10},{emoji:'❤️',count:8}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'effect_stars',  name_en: "Star Burst",    name_ar: "انفجار نجوم", cost: 1200, type: 'profileEffects', rarity: 'Epic',      preview: '⭐', particles: [{emoji:'⭐',count:10},{emoji:'✨',count:14},{emoji:'💫',count:8}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'effect_fire',   name_en: "Fire Storm",    name_ar: "عاصفة نارية", cost: 1500, type: 'profileEffects', rarity: 'Epic',      preview: '🔥', particles: [{emoji:'🔥',count:15},{emoji:'💥',count:6}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'effect_ghost',  name_en: "Ghost Mode",    name_ar: "وضع الشبح",   cost: 1800, type: 'profileEffects', rarity: 'Epic',      preview: '👻', particles: [{emoji:'👻',count:8},{emoji:'💀',count:6},{emoji:'🕯️',count:8}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'effect_money',  name_en: "Money Rain",    name_ar: "مطر الأموال", cost: 2000, type: 'profileEffects', rarity: 'Legendary', preview: '💰', particles: [{emoji:'💰',count:10},{emoji:'🧠',count:12},{emoji:'💵',count:8}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'effect_crown',  name_en: "Royal Crown",   name_ar: "تاج ملكي",    cost: 2500, type: 'profileEffects', rarity: 'Legendary', preview: '👑', particles: [{emoji:'👑',count:6},{emoji:'💎',count:8},{emoji:'✨',count:12}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'effect_galaxy', name_en: "Galaxy",        name_ar: "مجرة",        cost: 3000, type: 'profileEffects', rarity: 'Mythic',    preview: '🌌', particles: [{emoji:'🌟',count:8},{emoji:'💫',count:10},{emoji:'🌙',count:6},{emoji:'⭐',count:8}], duration: 2500 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
    ],
    // ✅ GIFTS - WITH BONUS ONLY (NO CASHBACK FOR SENDER)
    gifts: [
        { id: 'gift_rose', name_en: "Rose", name_ar: "وردة", cost: 1, type: 'gifts', charisma: 10, minBonus: 1, maxBonus: 50, desc_ar: "عبّر عن مشاعرك", desc_en: "Express your feelings", emoji: "🌹", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_candy', name_en: "Candy", name_ar: "حلوى", cost: 2, type: 'gifts', charisma: 20, minBonus: 1, maxBonus: 100, desc_ar: "حلاوة تُفرح القلب", desc_en: "Sweetness for the heart", emoji: "🍬", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_cookie', name_en: "Cookie", name_ar: "بسكويت", cost: 3, type: 'gifts', charisma: 30, minBonus: 1, maxBonus: 150, desc_ar: "بسكويت لذيذ", desc_en: "Delicious cookie", emoji: "🍪", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_chocolate', name_en: "Chocolate", name_ar: "شوكولاتة", cost: 5, type: 'gifts', charisma: 55, minBonus: 1, maxBonus: 250, desc_ar: "شوكولاتة فاخرة", desc_en: "Premium chocolate", emoji: "🍫", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_icecream', name_en: "Ice Cream", name_ar: "آيس كريم", cost: 5, type: 'gifts', charisma: 55, minBonus: 1, maxBonus: 250, desc_ar: "برّد على قلبك", desc_en: "Cool down your heart", emoji: "🍦", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_coffee', name_en: "Coffee", name_ar: "قهوة", cost: 8, type: 'gifts', charisma: 80, minBonus: 1, maxBonus: 400, desc_ar: "قهوة صباحية", desc_en: "Morning coffee", emoji: "☕", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_heart', name_en: "Heart", name_ar: "قلب", cost: 10, type: 'gifts', charisma: 120, minBonus: 1, maxBonus: 500, desc_ar: "نبض الحب", desc_en: "Pulse of love", emoji: "❤️", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_cake', name_en: "Cake", name_ar: "كيكة", cost: 15, type: 'gifts', charisma: 180, minBonus: 1, maxBonus: 750, desc_ar: "كيكة للاحتفال", desc_en: "Celebration cake", emoji: "🎂", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_flower', name_en: "Bouquet", name_ar: "باقة ورد", cost: 20, type: 'gifts', charisma: 250, minBonus: 1, maxBonus: 1000, desc_ar: "باقة جميلة", desc_en: "Beautiful bouquet", emoji: "💐", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_pizza', name_en: "Pizza", name_ar: "بيتزا", cost: 20, type: 'gifts', charisma: 250, minBonus: 1, maxBonus: 1000, desc_ar: "وليمة لذيذة", desc_en: "Delicious feast", emoji: "🍕", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_burger', name_en: "Burger", name_ar: "برجر", cost: 25, type: 'gifts', charisma: 300, minBonus: 1, maxBonus: 1250, desc_ar: "برجر شهي", desc_en: "Juicy burger", emoji: "🍔", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_teddy', name_en: "Teddy Bear", name_ar: "دب Teddy", cost: 30, type: 'gifts', charisma: 350, minBonus: 1, maxBonus: 1500, desc_ar: "دب قطني ناعم", desc_en: "Soft teddy bear", emoji: "🧸", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_donut', name_en: "Donut", name_ar: "دونات", cost: 40, type: 'gifts', charisma: 450, minBonus: 1, maxBonus: 2000, desc_ar: "دونات محلاة", desc_en: "Glazed donut", emoji: "🍩", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_star', name_en: "Star", name_ar: "نجمة", cost: 50, type: 'gifts', charisma: 600, minBonus: 1, maxBonus: 2500, desc_ar: "نجمة ساطعة", desc_en: "Shining star", emoji: "⭐", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_gem', name_en: "Gem", name_ar: "جوهرة", cost: 75, type: 'gifts', charisma: 900, minBonus: 1, maxBonus: 3750, desc_ar: "جوهرة ثمينة", desc_en: "Precious gem", emoji: "💎", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_crown', name_en: "Crown", name_ar: "تاج", cost: 80, type: 'gifts', charisma: 1000, minBonus: 1, maxBonus: 4000, desc_ar: "تاج ملكي", desc_en: "Royal crown", emoji: "👑", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_trophy', name_en: "Trophy", name_ar: "كأس", cost: 100, type: 'gifts', charisma: 1200, minBonus: 1, maxBonus: 5000, desc_ar: "كأس الفوز", desc_en: "Victory trophy", emoji: "🏆", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_ring', name_en: "Ring", name_ar: "خاتم", cost: 100, type: 'gifts', charisma: 1200, minBonus: 1, maxBonus: 5000, desc_ar: "خاتم الأناقة", desc_en: "Elegant ring", emoji: "💍", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_rocket', name_en: "Rocket", name_ar: "صاروخ", cost: 150, type: 'gifts', charisma: 1800, minBonus: 1, maxBonus: 7500, desc_ar: "انطلق للنجوم", desc_en: "Launch to stars", emoji: "🚀", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_robot', name_en: "Robot", name_ar: "روبوت", cost: 200, type: 'gifts', charisma: 2400, minBonus: 1, maxBonus: 10000, desc_ar: "روبوت ذكي", desc_en: "Smart robot", emoji: "🤖", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_unicorn', name_en: "Unicorn", name_ar: "يونيكورن", cost: 250, type: 'gifts', charisma: 3200, minBonus: 1, maxBonus: 12000, desc_ar: "حصان سحري", desc_en: "Magical unicorn", emoji: "🦄", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_motorbike', name_en: "Motorbike", name_ar: "موتوسيكل", cost: 250, type: 'gifts', charisma: 3200, minBonus: 1, maxBonus: 12000, desc_ar: "سرعة وكاريزما", desc_en: "Speed and charisma", emoji: "🏍️", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_crystal', name_en: "Crystal", name_ar: "كريستال", cost: 300, type: 'gifts', charisma: 4000, minBonus: 1, maxBonus: 15000, desc_ar: "كريستال نادر", desc_en: "Rare crystal", emoji: "🔮", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_racecar', name_en: "Race Car", name_ar: "سيارة سباق", cost: 500, type: 'gifts', charisma: 7000, minBonus: 1, maxBonus: 25000, desc_ar: "انطلق كالمحترفين", desc_en: "Race like a pro", emoji: "🏎️", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_castle', name_en: "Castle", name_ar: "قصر", cost: 750, type: 'gifts', charisma: 10000, minBonus: 1, maxBonus: 37500, desc_ar: "قصر ملكي فخم", desc_en: "Luxury castle", emoji: "🏰", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_yacht', name_en: "Yacht", name_ar: "يخت", cost: 1000, type: 'gifts', charisma: 15000, minBonus: 1, maxBonus: 50000, desc_ar: "فخامة الملوك", desc_en: "Royal luxury", emoji: "🛥️", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_diamond', name_en: "Diamond", name_ar: "ماسة", cost: 1500, type: 'gifts', charisma: 20000, minBonus: 1, maxBonus: 75000, desc_ar: "ماسة نادرة", desc_en: "Rare diamond", emoji: "💠", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_spaceship', name_en: "Spaceship", name_ar: "مركبة فضائية", cost: 2000, type: 'gifts', charisma: 30000, minBonus: 1, maxBonus: 100000, desc_ar: "استكشف الفضاء", desc_en: "Explore space", emoji: "🛸", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_jet', name_en: "Private Jet", name_ar: "طائرة خاصة", cost: 5000, type: 'gifts', charisma: 85000, minBonus: 1, maxBonus: 120000, desc_ar: "حلّق في سماء الكاريزما", desc_en: "Soar in charisma skies", emoji: "✈️", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_island', name_en: "Private Island", name_ar: "جزيرة خاصة", cost: 10000, type: 'gifts', charisma: 180000, minBonus: 1, maxBonus: 120000, desc_ar: "أمتلك عالمك الخاص", desc_en: "Own your world", emoji: "🏝️", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_planet', name_en: "Planet", name_ar: "كوكب", cost: 10000, type: 'gifts', charisma: 200000, minBonus: 1, maxBonus: 120000, desc_ar: "كوكب خاص بك", desc_en: "Your own planet", emoji: "🪐", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_galaxy', name_en: "Galaxy", name_ar: "مجرة", cost: 10000, type: 'gifts', charisma: 220000, minBonus: 1, maxBonus: 120000, desc_ar: "مجرة كاملة ملكك", desc_en: "Your own galaxy", emoji: "🌌", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_dragon', name_en: "Dragon", name_ar: "تنين", cost: 10000, type: 'gifts', charisma: 210000, minBonus: 1, maxBonus: 120000, desc_ar: "تنين أسطوري", desc_en: "Legendary dragon", emoji: "🐉", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_moon', name_en: "Moon", name_ar: "قمر", cost: 50000, type: 'gifts', charisma: 700000, minBonus: 1, maxBonus: 120000, desc_ar: "قمر خاص بك", desc_en: "Your own moon", emoji: "🌙", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_sun', name_en: "Sun", name_ar: "شمس", cost: 50000, type: 'gifts', charisma: 750000, minBonus: 1, maxBonus: 120000, desc_ar: "شمس ساطعة", desc_en: "Shining sun", emoji: "☀️", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_world', name_en: "World", name_ar: "عالم", cost: 100000, type: 'gifts', charisma: 1700000, minBonus: 1, maxBonus: 120000, desc_ar: "عالم كامل ملكك", desc_en: "Your own world", emoji: "🌍", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_universe', name_en: "Universe", name_ar: "كون", cost: 100000, type: 'gifts', charisma: 1900000, minBonus: 1, maxBonus: 120000, desc_ar: "كون كامل ملكك", desc_en: "Your own universe", emoji: "🌌", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_multiverse', name_en: "Multiverse", name_ar: "متعدد أكوان", cost: 150000, type: 'gifts', charisma: 2500000, minBonus: 1, maxBonus: 120000, desc_ar: "متعدد أكوان خاص", desc_en: "Your multiverse", emoji: "🪐", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        { id: 'gift_ultimate', name_en: "Ultimate Gift", name_ar: "الهدية المطلقة", cost: 150000, type: 'gifts', charisma: 3500000, minBonus: 1, maxBonus: 120000, desc_ar: "أعظم هدية", desc_en: "The ultimate gift", emoji: "🏆", imageUrl: "" , hidden: false, isEvent: false, limitedTime: false, eventOnly: false },
        // ════ TEST EVENT/LIMITED ITEMS — FOR TESTING ════
        { id: 'gift_event_sword', name_en: "Event Sword", name_ar: "سيف الحدث", cost: 500, type: 'gifts', charisma: 7000, minBonus: 1, maxBonus: 25000, desc_ar: "هدية حصرية للأحداث", desc_en: "Exclusive event gift", emoji: "⚔️", imageUrl: "", hidden: false, isEvent: true, limitedTime: false, eventOnly: false },
        { id: 'gift_limited_crown', name_en: "Limited Crown", name_ar: "تاج محدود", cost: 999, type: 'gifts', charisma: 15000, minBonus: 1, maxBonus: 50000, desc_ar: "تاج لمحدود الوقت", desc_en: "Limited time crown", emoji: "👸", imageUrl: "", hidden: false, isEvent: false, limitedTime: true, eventOnly: false },
        { id: 'gift_event_hidden', name_en: "Event Only Gift", name_ar: "هدية الحدث فقط", cost: 1500, type: 'gifts', charisma: 20000, minBonus: 1, maxBonus: 75000, desc_ar: "تظهر في الشوب لكن للحدث فقط", desc_en: "Visible but event-only purchase", emoji: "🗝️", imageUrl: "", hidden: false, isEvent: true, limitedTime: false, eventOnly: true },
    ],
    // 👑 VIP EXCLUSIVE GIFTS — يظهر فقط لـ VIP Level 2+
    gifts_vip: [
        { id: 'vgift_vip_rose',    name_en: "VIP Rose",     name_ar: "وردة VIP",     cost: 50,   type: 'gifts_vip', charisma: 800,   minBonus: 1, maxBonus: 2500,  desc_ar: "وردة حصرية للـ VIP",      desc_en: "Exclusive VIP rose",    emoji: "🌹", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, vipMinLevel: 2 },
        { id: 'vgift_vip_star',    name_en: "VIP Star",     name_ar: "نجمة VIP",     cost: 150,  type: 'gifts_vip', charisma: 2500,  minBonus: 1, maxBonus: 7500,  desc_ar: "نجمة ذهبية حصرية",       desc_en: "Exclusive gold star",   emoji: "⭐", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, vipMinLevel: 2 },
        { id: 'vgift_vip_crown',   name_en: "VIP Crown",    name_ar: "تاج VIP",      cost: 500,  type: 'gifts_vip', charisma: 8000,  minBonus: 1, maxBonus: 25000, desc_ar: "تاج ملكي حصري",          desc_en: "Exclusive royal crown", emoji: "👑", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, vipMinLevel: 2 },
        { id: 'vgift_vip_diamond', name_en: "VIP Diamond",  name_ar: "ماسة VIP",     cost: 1000, type: 'gifts_vip', charisma: 18000, minBonus: 1, maxBonus: 50000, desc_ar: "ماسة حصرية للـ VIP",     desc_en: "Exclusive VIP diamond", emoji: "💠", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, vipMinLevel: 2 },
        { id: 'vgift_vip_dragon',  name_en: "VIP Dragon",   name_ar: "تنين VIP",     cost: 2500, type: 'gifts_vip', charisma: 40000, minBonus: 1, maxBonus: 120000,desc_ar: "تنين أسطوري حصري",       desc_en: "Exclusive legendary dragon", emoji: "🐉", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, vipMinLevel: 2 },
    ]
};

// 🎨 GIFT RARITY SYSTEM
const RARITY_CONFIG = {
    Common:    { name_en: 'Common',    name_ar: 'عادي',     color: '#9ca3af', bg: 'rgba(156,163,175,0.07)', border: 'rgba(156,163,175,0.25)', glow: false, icon: '⚪', order: 0 },
    Uncommon:  { name_en: 'Uncommon',  name_ar: 'غير شائع', color: '#4ade80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.35)',  glow: false, icon: '🟢', order: 1 },
    Rare:      { name_en: 'Rare',      name_ar: 'نادر',     color: '#60a5fa', bg: 'rgba(96,165,250,0.09)',  border: 'rgba(96,165,250,0.40)',  glow: false, icon: '🔵', order: 2 },
    Epic:      { name_en: 'Epic',      name_ar: 'ملحمي',    color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)',  border: 'rgba(139,92,246,0.45)',  glow: false, icon: '💜', order: 3 },
    Legendary: { name_en: 'Legendary', name_ar: 'أسطوري',   color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.50)',  glow: true,  icon: '⭐', order: 4 },
    Mythic:    { name_en: 'Mythic',    name_ar: 'خرافي',    color: '#ff0055', bg: 'rgba(255,0,85,0.12)',    border: 'rgba(255,0,85,0.60)',    glow: true,  icon: '🔮', order: 5, special: true },
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

// ════════════════════════════════════════════
// PATCH for 04-data-game.js
// REPLACE the entire ACHIEVEMENTS array (from "// 🏆 ACHIEVEMENTS SYSTEM" to the closing "];")
// ════════════════════════════════════════════

// 🏆 ACHIEVEMENTS SYSTEM — Leveled (4 tiers per category)
// Tier 1: Normal | Tier 2: Natural | Tier 3: Red/Legendary | Tier 4: Multi-color Glow
const ACHIEVEMENTS = [

    // ══ 🎁 GIFTS RECEIVED ══
    { id: 'ach_recv_1', group: 'gifts_recv', tier: 1, nameKey: 'achRecv1', descKey: 'achRecv1Desc', icon: '🎁', imageUrl: '', condition: { type: 'gifts_received', value: 1 } },
    { id: 'ach_recv_2', group: 'gifts_recv', tier: 2, nameKey: 'achRecv2', descKey: 'achRecv2Desc', icon: '💝', imageUrl: '', condition: { type: 'gifts_received', value: 50 } },
    { id: 'ach_recv_3', group: 'gifts_recv', tier: 3, nameKey: 'achRecv3', descKey: 'achRecv3Desc', icon: '💎', imageUrl: '', condition: { type: 'gifts_received', value: 200 } },
    { id: 'ach_recv_4', group: 'gifts_recv', tier: 4, nameKey: 'achRecv4', descKey: 'achRecv4Desc', icon: '👑', imageUrl: '', condition: { type: 'gifts_received', value: 500 } },

    // ══ 📤 GIFTS SENT ══
    { id: 'ach_sent_1', group: 'gifts_sent', tier: 1, nameKey: 'achSent1', descKey: 'achSent1Desc', icon: '💌', imageUrl: '', condition: { type: 'gifts_sent', value: 10 } },
    { id: 'ach_sent_2', group: 'gifts_sent', tier: 2, nameKey: 'achSent2', descKey: 'achSent2Desc', icon: '🎅', imageUrl: '', condition: { type: 'gifts_sent', value: 50 } },
    { id: 'ach_sent_3', group: 'gifts_sent', tier: 3, nameKey: 'achSent3', descKey: 'achSent3Desc', icon: '🎁', imageUrl: '', condition: { type: 'gifts_sent', value: 150 } },
    { id: 'ach_sent_4', group: 'gifts_sent', tier: 4, nameKey: 'achSent4', descKey: 'achSent4Desc', icon: '✨', imageUrl: '', condition: { type: 'gifts_sent', value: 500 } },

    // ══ 🎮 GAMES PLAYED ══
    { id: 'ach_games_1', group: 'games_played', tier: 1, nameKey: 'achGames1', descKey: 'achGames1Desc', icon: '🎮', imageUrl: '', condition: { type: 'games_played', value: 10 } },
    { id: 'ach_games_2', group: 'games_played', tier: 2, nameKey: 'achGames2', descKey: 'achGames2Desc', icon: '🎖️', imageUrl: '', condition: { type: 'games_played', value: 50 } },
    { id: 'ach_games_3', group: 'games_played', tier: 3, nameKey: 'achGames3', descKey: 'achGames3Desc', icon: '⭐', imageUrl: '', condition: { type: 'games_played', value: 200 } },
    { id: 'ach_games_4', group: 'games_played', tier: 4, nameKey: 'achGames4', descKey: 'achGames4Desc', icon: '🏆', imageUrl: '', condition: { type: 'games_played', value: 500 } },

    // ══ 🏆 WINS ══
    { id: 'ach_wins_1', group: 'wins', tier: 1, nameKey: 'achWins1', descKey: 'achWins1Desc', icon: '🏆', imageUrl: '', condition: { type: 'wins', value: 5 } },
    { id: 'ach_wins_2', group: 'wins', tier: 2, nameKey: 'achWins2', descKey: 'achWins2Desc', icon: '🥇', imageUrl: '', condition: { type: 'wins', value: 25 } },
    { id: 'ach_wins_3', group: 'wins', tier: 3, nameKey: 'achWins3', descKey: 'achWins3Desc', icon: '💥', imageUrl: '', condition: { type: 'wins', value: 100 } },
    { id: 'ach_wins_4', group: 'wins', tier: 4, nameKey: 'achWins4', descKey: 'achWins4Desc', icon: '⚡', imageUrl: '', condition: { type: 'wins', value: 300 } },

    // ══ 🔥 WIN STREAK ══
    { id: 'ach_streak_1', group: 'win_streak', tier: 1, nameKey: 'achStreak1', descKey: 'achStreak1Desc', icon: '🔥', imageUrl: '', condition: { type: 'win_streak', value: 3 } },
    { id: 'ach_streak_2', group: 'win_streak', tier: 2, nameKey: 'achStreak2', descKey: 'achStreak2Desc', icon: '🌟', imageUrl: '', condition: { type: 'win_streak', value: 5 } },
    { id: 'ach_streak_3', group: 'win_streak', tier: 3, nameKey: 'achStreak3', descKey: 'achStreak3Desc', icon: '💢', imageUrl: '', condition: { type: 'win_streak', value: 10 } },
    { id: 'ach_streak_4', group: 'win_streak', tier: 4, nameKey: 'achStreak4', descKey: 'achStreak4Desc', icon: '🌪️', imageUrl: '', condition: { type: 'win_streak', value: 20 } },

    // ══ 🕵️ SPY WINS ══
    { id: 'ach_spy_1', group: 'spy_wins', tier: 1, nameKey: 'achSpy1', descKey: 'achSpy1Desc', icon: '🕵️', imageUrl: '', condition: { type: 'spy_wins', value: 1 } },
    { id: 'ach_spy_2', group: 'spy_wins', tier: 2, nameKey: 'achSpy2', descKey: 'achSpy2Desc', icon: '🥷', imageUrl: '', condition: { type: 'spy_wins', value: 10 } },
    { id: 'ach_spy_3', group: 'spy_wins', tier: 3, nameKey: 'achSpy3', descKey: 'achSpy3Desc', icon: '👤', imageUrl: '', condition: { type: 'spy_wins', value: 30 } },
    { id: 'ach_spy_4', group: 'spy_wins', tier: 4, nameKey: 'achSpy4', descKey: 'achSpy4Desc', icon: '🌑', imageUrl: '', condition: { type: 'spy_wins', value: 75 } },

    // ══ 🤵 AGENT WINS ══
    { id: 'ach_agent_1', group: 'agent_wins', tier: 1, nameKey: 'achAgent1', descKey: 'achAgent1Desc', icon: '🤵', imageUrl: '', condition: { type: 'agent_wins', value: 1 } },
    { id: 'ach_agent_2', group: 'agent_wins', tier: 2, nameKey: 'achAgent2', descKey: 'achAgent2Desc', icon: '🛡️', imageUrl: '', condition: { type: 'agent_wins', value: 10 } },
    { id: 'ach_agent_3', group: 'agent_wins', tier: 3, nameKey: 'achAgent3', descKey: 'achAgent3Desc', icon: '⚔️', imageUrl: '', condition: { type: 'agent_wins', value: 30 } },
    { id: 'ach_agent_4', group: 'agent_wins', tier: 4, nameKey: 'achAgent4', descKey: 'achAgent4Desc', icon: '🏛️', imageUrl: '', condition: { type: 'agent_wins', value: 75 } },

    // ══ 🦋 FRIENDS ══
    { id: 'ach_friends_1', group: 'friends', tier: 1, nameKey: 'achFriends1', descKey: 'achFriends1Desc', icon: '🦋', imageUrl: '', condition: { type: 'friends', value: 5 } },
    { id: 'ach_friends_2', group: 'friends', tier: 2, nameKey: 'achFriends2', descKey: 'achFriends2Desc', icon: '⭐', imageUrl: '', condition: { type: 'friends', value: 15 } },
    { id: 'ach_friends_3', group: 'friends', tier: 3, nameKey: 'achFriends3', descKey: 'achFriends3Desc', icon: '🌟', imageUrl: '', condition: { type: 'friends', value: 30 } },
    { id: 'ach_friends_4', group: 'friends', tier: 4, nameKey: 'achFriends4', descKey: 'achFriends4Desc', icon: '🌐', imageUrl: '', condition: { type: 'friends', value: 75 } },

    // ══ 🔥 LOGIN STREAK (consecutive days) ══
    { id: 'ach_login_str_1', group: 'login_streak', tier: 1, nameKey: 'achLoginStr1', descKey: 'achLoginStr1Desc', icon: '🔥', imageUrl: '', condition: { type: 'login_streak', value: 7 } },
    { id: 'ach_login_str_2', group: 'login_streak', tier: 2, nameKey: 'achLoginStr2', descKey: 'achLoginStr2Desc', icon: '📅', imageUrl: '', condition: { type: 'login_streak', value: 30 } },
    { id: 'ach_login_str_3', group: 'login_streak', tier: 3, nameKey: 'achLoginStr3', descKey: 'achLoginStr3Desc', icon: '🗓️', imageUrl: '', condition: { type: 'login_streak', value: 100 } },
    { id: 'ach_login_str_4', group: 'login_streak', tier: 4, nameKey: 'achLoginStr4', descKey: 'achLoginStr4Desc', icon: '♾️', imageUrl: '', condition: { type: 'login_streak', value: 365 } },

    // ══ 📅 TOTAL LOGIN DAYS ══
    { id: 'ach_logins_1', group: 'total_logins', tier: 1, nameKey: 'achLogins1', descKey: 'achLogins1Desc', icon: '📅', imageUrl: '', condition: { type: 'total_logins', value: 30 } },
    { id: 'ach_logins_2', group: 'total_logins', tier: 2, nameKey: 'achLogins2', descKey: 'achLogins2Desc', icon: '💎', imageUrl: '', condition: { type: 'total_logins', value: 100 } },
    { id: 'ach_logins_3', group: 'total_logins', tier: 3, nameKey: 'achLogins3', descKey: 'achLogins3Desc', icon: '🏅', imageUrl: '', condition: { type: 'total_logins', value: 300 } },
    { id: 'ach_logins_4', group: 'total_logins', tier: 4, nameKey: 'achLogins4', descKey: 'achLogins4Desc', icon: '👑', imageUrl: '', condition: { type: 'total_logins', value: 365 } },

    // ══ ⭐ CHARISMA ══
    { id: 'ach_charisma_1', group: 'charisma', tier: 1, nameKey: 'achCharisma1', descKey: 'achCharisma1Desc', icon: '⭐', imageUrl: '', condition: { type: 'charisma', value: 10000 } },
    { id: 'ach_charisma_2', group: 'charisma', tier: 2, nameKey: 'achCharisma2', descKey: 'achCharisma2Desc', icon: '💫', imageUrl: '', condition: { type: 'charisma', value: 100000 } },
    { id: 'ach_charisma_3', group: 'charisma', tier: 3, nameKey: 'achCharisma3', descKey: 'achCharisma3Desc', icon: '🌠', imageUrl: '', condition: { type: 'charisma', value: 500000 } },
    { id: 'ach_charisma_4', group: 'charisma', tier: 4, nameKey: 'achCharisma4', descKey: 'achCharisma4Desc', icon: '🌌', imageUrl: '', condition: { type: 'charisma', value: 1000000 } },
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

// EMOJI CATEGORIES FOR PROFESSIONAL PICKER
const EMOJI_CATEGORIES = {
    smiles: ['😀', '😂', '😍', '🤔', '😎', '🤫', '😡', '🤢', '😴', '🤯', '😤', '🥺', '😱', '🤬', '💀', '👻', '👾', '🤖', '💩', '😈'],
    gestures: ['👁️', '🧠', '🦷', '🦴', '👀', '👊', '✌️', '🤞', '🤟', '👌', '🤙', '👈', '👉', '☝️', '👆', '👇', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏'],
    hearts: ['💪', '❤️', '💔', '💕', '💖', '💗', '💘', '💝', '💞', '💟', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎'],
    objects: ['🔥', '⭐', '🌟', '✨', '💫', '🎉', '🎊', '🎁', '🎈', '🎀', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🎮', '🎲', '🎯', '🎵', '🎶', '🎤', '🎧', '📷', '💻', '📱', '💰', '💵', '💎', '👑', '🎩'],
    nature: ['🚀', '✈️', '🛸', '🌹', '🌸', '🌺', '🌻', '🌼', '🌷', '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃']
};

const EMOJI_LIST = Object.values(EMOJI_CATEGORIES).flat();

// --- Helper Functions ---
const formatTime = (timestamp) => { if (!timestamp) return ''; const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp); return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
const formatCharisma = (num) => { if (num === undefined || num === null) return '0'; if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'; if (num >= 1000) return (num / 1000).toFixed(1) + 'K'; return num.toString(); };
const maskEmail = (email) => { if (!email) return 'N/A'; const [localPart, domain] = email.split('@'); if (!domain) return email; const visibleChars = Math.min(2, localPart.length); return localPart.substring(0, visibleChars) + '***@' + domain; };
const generateRandomBonus = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- Translations ---
