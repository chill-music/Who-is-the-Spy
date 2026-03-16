// ═══════════════════════════════════════════════════════════════════════
// ⏳ ITEM EXPIRY SYSTEM — دالة الوقت لكل آيتم في الإنفنتري
// ═══════════════════════════════════════════════════════════════════════
//
// 📖 كيفية الاستخدام في الشوب أو الفان باس:
//   1. كل آيتم عنده حقل "durationDays" — لو null يعني أبدي، لو رقم يعني يوم
//   2. لما تضيف آيتم للإنفنتري، اكتب معه "expiresAt" في Firestore:
//      expiresAt = Date.now() + (item.durationDays * 24 * 60 * 60 * 1000)
//   3. الدالة "isItemExpired" تتحقق منه كل مرة
//
// ✅ مثال إضافة آيتم بوقت:
//   await usersCollection.doc(uid).update({
//     [`inventory.frames`]: firebase.firestore.FieldValue.arrayUnion(item.id),
//     [`inventory.expiry.${item.id}`]: item.durationDays
//         ? Date.now() + item.durationDays * 86400000
//         : null,
//   });
//
// ✅ التحقق:
//   const expired = isItemExpired(userData?.inventory?.expiry?.[item.id]);
//   if (expired) { /* خذ الآيتم من الإنفنتري */ }
// ═══════════════════════════════════════════════════════════════════════

// Returns true if the item has expired
const isItemExpired = (expiryTimestamp) => {
    if (!expiryTimestamp) return false; // null = permanent
    return Date.now() > expiryTimestamp;
};

// Returns days remaining (null = permanent, 0 = expired)
const getItemDaysLeft = (expiryTimestamp) => {
    if (!expiryTimestamp) return null;
    const ms = expiryTimestamp - Date.now();
    if (ms <= 0) return 0;
    return Math.ceil(ms / 86400000);
};

// Build expiresAt timestamp when buying/awarding an item
const buildItemExpiresAt = (durationDays) => {
    if (!durationDays) return null;
    return Date.now() + durationDays * 86400000;
};

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
    { level: 1, threshold: 0, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/star1.png', name_en: 'Rising Star', name_ar: 'نجم صاعد', color: '#ffd700', badge_class: 'level-1-3' },
    { level: 2, threshold: 4000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/star2.png', name_en: 'Shining Star', name_ar: 'نجم ساطع', color: '#ffd700', badge_class: 'level-1-3' },
    { level: 3, threshold: 12000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/star3.png', name_en: 'Bright Star', name_ar: 'نجم مضيء', color: '#ffd700', badge_class: 'level-1-3' },
    { level: 4, threshold: 30000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/1d.png', name_en: 'Diamond I', name_ar: 'ماسة 1', color: '#3b82f6', badge_class: 'level-4-6' },
    { level: 5, threshold: 80000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/4d.png', name_en: 'Diamond II', name_ar: 'ماسة 2', color: '#3b82f6', badge_class: 'level-4-6' },
    { level: 6, threshold: 160000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/3d.png', name_en: 'Diamond III', name_ar: 'ماسة 3', color: '#3b82f6', badge_class: 'level-4-6' },
    { level: 7, threshold: 300000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Crown1.png', name_en: 'Crown I', name_ar: 'تاج 1', color: '#ffd700', badge_class: 'level-7-9' },
    { level: 8, threshold: 500000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Crown2.png', name_en: 'Crown II', name_ar: 'تاج 2', color: '#ffd700', badge_class: 'level-7-9' },
    { level: 9, threshold: 1000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Crown3.png', name_en: 'Crown III', name_ar: 'تاج 3', color: '#ffd700', badge_class: 'level-7-9' },
    { level: 10, threshold: 2000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Royal%20Crown1.png', name_en: 'Royal Crown I', name_ar: 'تاج ملكي 1', color: '#f97316', badge_class: 'level-10-12' },
    { level: 11, threshold: 3500000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Royal%20Crown2.png', name_en: 'Royal Crown II', name_ar: 'تاج ملكي 2', color: '#f97316', badge_class: 'level-10-12' },
    { level: 12, threshold: 6000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Royal%20Crown3.png', name_en: 'Royal Crown III', name_ar: 'تاج ملكي 3', color: '#f97316', badge_class: 'level-10-12' },
    { level: 13, threshold: 8500000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Purple%20Crown1.png', name_en: 'Purple Crown I', name_ar: 'تاج بنفسجي 1', color: '#8b5cf6', badge_class: 'level-13-15' },
    { level: 14, threshold: 12000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Purple%20Crown2.png', name_en: 'Purple Crown II', name_ar: 'تاج بنفسجي 2', color: '#8b5cf6', badge_class: 'level-13-15' },
    { level: 15, threshold: 16000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Purple%20Crown3.png', name_en: 'Purple Crown III', name_ar: 'تاج بنفسجي 3', color: '#8b5cf6', badge_class: 'level-13-15' },
    { level: 16, threshold: 26000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Legend1.png', name_en: 'Legend I', name_ar: 'أسطورة 1', color: '#f97316', badge_class: 'level-16-21', hasGlow: true },
    { level: 17, threshold: 48000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Legend2.png', name_en: 'Legend II', name_ar: 'أسطورة 2', color: '#f97316', badge_class: 'level-16-21', hasGlow: true },
    { level: 18, threshold: 86000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Legend3.png', name_en: 'Legend III', name_ar: 'أسطورة 3', color: '#f97316', badge_class: 'level-16-21', hasGlow: true },
    { level: 19, threshold: 120000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Legend4.png', name_en: 'Legend IV', name_ar: 'أسطورة 4', color: '#f97316', badge_class: 'level-16-21', hasGlow: true },
    { level: 20, threshold: 240000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Legend5.png', name_en: 'Legend V', name_ar: 'أسطورة 5', color: '#f97316', badge_class: 'level-16-21', hasGlow: true },
    { level: 21, threshold: 360000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/main/icos/Ultimate%20Legend.gif', name_en: 'Ultimate Legend', name_ar: 'الأسطورة المطلقة', color: '#00d4ff', badge_class: 'level-divine', isDivine: true, isMaxLevel: true, hasGlow: true },
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
        { id: 'frame_gold', name_en: "Gold Frame", name_ar: "إطار ذهبي", cost: 500, type: 'frames', preview: 'linear-gradient(45deg, #f7ff00, #db9700)' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_neon', name_en: "Neon Frame", name_ar: "إطار نيون", cost: 300, type: 'frames', preview: 'linear-gradient(45deg, #00f2ff, #7000ff)' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_fire', name_en: "Fire Frame", name_ar: "إطار نار", cost: 400, type: 'frames', preview: 'linear-gradient(45deg, #ff0055, #ff8800)' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_img', name_en: "Image Frame", name_ar: "إطار صورة", cost: 100, type: 'frames', preview: 'https://i.ibb.co/mVQTLr2D/Untitled-3.png' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_1', name_en: " Frame", name_ar: "إطار متحرك", cost: 0, type: 'frames', preview: 'https://i.ibb.co/4Rj8jzWS/0202.png' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_rainbow', name_en: "Rainbow Frame", name_ar: "إطار قوس قزح", cost: 600, type: 'frames', preview: 'https://i.ibb.co/1tvtgmD8/ezgif-com-optimize.gif' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_ice', name_en: "Ice Frame", name_ar: "إطار جليد", cost: 350, type: 'frames', preview: 'linear-gradient(45deg, #00d4ff, #ffffff, #00d4ff)' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_shehab', name_en: "Shehab Frame", name_ar: "إطار قوس قزح", cost: 600, type: 'frames', preview: 'https://i.ibb.co/xKgsYCZ3/shehab.gif' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },

        // ════ UNCOMMON ITEMS — لون أخضر ════
        { id: 'frame_mint', name_en: "Mint Frame", name_ar: "إطار نعناعي", cost: 75, type: 'frames', rarity: 'Uncommon', preview: 'linear-gradient(45deg, #4ade80, #22d3ee)' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // ════ FunPass Exclusive Frames — hidden in shop, from FunPass rewards ════
        { id: 'fp_frame_neon',     name_en: "Neon Frame",     name_ar: "إطار نيون",        cost: 0, type: 'frames', rarity: 'Rare',      preview: 'linear-gradient(45deg,#00f2ff,#7000ff)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_star',     name_en: "Star Frame",     name_ar: "إطار نجمة",        cost: 0, type: 'frames', rarity: 'Epic',      preview: 'linear-gradient(45deg,#ffe066,#ff8800)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_crystal',  name_en: "Crystal Frame",  name_ar: "إطار كريستال",     cost: 0, type: 'frames', rarity: 'Epic',      preview: 'linear-gradient(45deg,#67e8f9,#a5f3fc)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_vortex',   name_en: "Vortex Frame",   name_ar: "إطار دوامة",       cost: 0, type: 'frames', rarity: 'Epic',      preview: 'linear-gradient(45deg,#818cf8,#a78bfa)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_gold',     name_en: "Gold Frame",     name_ar: "إطار ذهبي",        cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#ffd700,#ff8800)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_moon',     name_en: "Moon Frame",     name_ar: "إطار القمر",       cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#1e1b4b,#7c3aed)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_inferno',  name_en: "Inferno Frame",  name_ar: "إطار جهنم",        cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#ef4444,#f97316)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_thunder',  name_en: "Thunder Frame",  name_ar: "إطار الرعد",       cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#fbbf24,#1d4ed8)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_skull',    name_en: "Skull Frame",    name_ar: "إطار الجمجمة",     cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#111827,#374151)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_mystic',   name_en: "Mystic Frame",   name_ar: "إطار غامض",        cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#7c3aed,#4c1d95)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_rainbow',  name_en: "Rainbow Frame",  name_ar: "إطار قوس قزح",     cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(90deg,#f87171,#fb923c,#fbbf24,#4ade80,#60a5fa,#c084fc)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_dark',     name_en: "Dark Frame",     name_ar: "إطار الظلام",      cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#030712,#111827)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_mythic',   name_en: "Mythic Frame",   name_ar: "إطار خرافي",       cost: 0, type: 'frames', rarity: 'Mythic',    preview: 'linear-gradient(45deg,#ff0055,#7c3aed)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_prism',    name_en: "Prism Frame",    name_ar: "إطار المنشور",     cost: 0, type: 'frames', rarity: 'Mythic',    preview: 'linear-gradient(90deg,#00d4ff,#ff0055,#00d4ff)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_void',     name_en: "Void Frame",     name_ar: "إطار الفراغ",      cost: 0, type: 'frames', rarity: 'Mythic',    preview: 'linear-gradient(45deg,#000000,#1e1b4b)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_phoenix',  name_en: "Phoenix Frame",  name_ar: "إطار الفينيكس",    cost: 0, type: 'frames', rarity: 'Mythic',    preview: 'linear-gradient(45deg,#dc2626,#fb923c)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_nova',     name_en: "Nova Frame",     name_ar: "إطار النجم المتفجر", cost: 0, type: 'frames', rarity: 'Mythic', preview: 'linear-gradient(45deg,#fde68a,#fbbf24,#f59e0b)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // ══ SEASON EXCLUSIVE FRAMES ══
        // 🔧 لتغيير السيزون: غيّر season: '1' إلى '2' أو '3' إلخ
        { id: 'frame_s1_celestial', name_en: "Celestial Frame", name_ar: "إطار سماوي", cost: 0, type: 'frames', preview: 'linear-gradient(45deg,#00d4ff,#7c3aed,#00d4ff)', hidden: false, isEvent: false, limitedTime: true, eventOnly: true, durationDays: null, season: '1', rarity: 'Divine' },
    ],
    // ══ PROFILE BANNERS ══
    // 🔧 لإضافة بنرات للمتجر: أضف هنا
    banners: [
        // ══ SEASON EXCLUSIVE BANNERS ══
        // 🔧 لتغيير السيزون: غيّر season: '1' إلى '2' أو '3' إلخ
        { id: 'banner_s1_aurora', name_en: "Aurora Banner", name_ar: "بنر الشفق", cost: 0, type: 'banners', preview: 'linear-gradient(135deg,#0a0a2e,#1a1a4e,#00d4ff22,#7c3aed44)', hidden: false, isEvent: false, limitedTime: true, eventOnly: true, durationDays: null, season: '1', rarity: 'Divine' },
    ],
    titles: [
        { id: 'title_spy', name_en: "Mr. Spy", name_ar: "سيد جاسوس", cost: 600, type: 'titles', preview: '🕵️', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'title_hunter', name_en: "Hunter", name_ar: "صياد", cost: 450, type: 'titles', preview: '🎯', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'title_ghost', name_en: "Ghost", name_ar: "شبح", cost: 800, type: 'titles', preview: '👻', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'title_legend', name_en: "Legend", name_ar: "أسطورة", cost: 1500, type: 'titles', preview: '👑', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'title_pro', name_en: "Pro Player", name_ar: "محترف", cost: 1000, type: 'titles', preview: '⭐', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'title_shadow', name_en: "Shadow", name_ar: "ظل", cost: 700, type: 'titles', preview: '', imageUrl: 'https://i.ibb.co/xqk8md71/122222.png' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // ════ UNCOMMON TITLES ════
        { id: 'title_rookie', name_en: "Rookie", name_ar: "مبتدئ", cost: 80, type: 'titles', rarity: 'Uncommon', preview: '🌱', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'title_scout', name_en: "Scout", name_ar: "كشاف", cost: 120, type: 'titles', rarity: 'Uncommon', preview: '🔭', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // ════ FunPass Exclusive Titles — hidden in shop ════
        { id: 'fp_title_agent',   name_en: "Agent",    name_ar: "عميل",          cost: 0, type: 'titles', rarity: 'Rare',      preview: '🕵️', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_star',    name_en: "Star",     name_ar: "نجمة",          cost: 0, type: 'titles', rarity: 'Epic',      preview: '🌟', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_warrior', name_en: "Warrior",  name_ar: "محارب",         cost: 0, type: 'titles', rarity: 'Epic',      preview: '⚔️', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_eye',     name_en: "The Eye",  name_ar: "العين",         cost: 0, type: 'titles', rarity: 'Epic',      preview: '👁️', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_shadow',  name_en: "Shadow",   name_ar: "الظل",          cost: 0, type: 'titles', rarity: 'Legendary', preview: '🌙', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_gold',    name_en: "Gold",     name_ar: "ذهبي",          cost: 0, type: 'titles', rarity: 'Legendary', preview: '🏅', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_ocean',   name_en: "Ocean",    name_ar: "المحيط",        cost: 0, type: 'titles', rarity: 'Legendary', preview: '🌊', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_king',    name_en: "King",     name_ar: "الملك",         cost: 0, type: 'titles', rarity: 'Legendary', preview: '👑', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_flame',   name_en: "Flame",    name_ar: "اللهب",         cost: 0, type: 'titles', rarity: 'Legendary', preview: '🔥', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_rainbow', name_en: "Rainbow",  name_ar: "قوس قزح",       cost: 0, type: 'titles', rarity: 'Legendary', preview: '🌈', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_watcher', name_en: "Watcher",  name_ar: "الراصد",        cost: 0, type: 'titles', rarity: 'Legendary', preview: '👁️', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_mystic',  name_en: "Mystic",   name_ar: "الغموض",        cost: 0, type: 'titles', rarity: 'Mythic',    preview: '🔮', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_prism',   name_en: "Prism",    name_ar: "المنشور",       cost: 0, type: 'titles', rarity: 'Mythic',    preview: '💠', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_void',    name_en: "Void",     name_ar: "الفراغ",        cost: 0, type: 'titles', rarity: 'Mythic',    preview: '🌀', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_phoenix', name_en: "Phoenix",  name_ar: "الفينيكس",      cost: 0, type: 'titles', rarity: 'Mythic',    preview: '🔥', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_god',     name_en: "GOD",      name_ar: "الإله",         cost: 0, type: 'titles', rarity: 'Mythic',    preview: '🔱', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // ══ SEASON EXCLUSIVE TITLES ══
        // 🔧 لتغيير السيزون: غيّر season: '1' إلى '2' أو '3' إلخ
        { id: 'title_s1_pioneer', name_en: "Season Pioneer", name_ar: "رائد الموسم", cost: 0, type: 'titles', preview: '🌟', imageUrl: '', hidden: false, isEvent: false, limitedTime: true, eventOnly: true, durationDays: null, season: '1', rarity: 'Divine' },
    ],
    badges: [
        { id: 'badge_vip', name_en: "VIP Badge", name_ar: "شارة VIP", cost: 1000, type: 'badges', preview: '⭐', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_love', name_en: "Love Badge", name_ar: "شارة حب", cost: 800, type: 'badges', preview: '💕', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_pro', name_en: "Pro Badge", name_ar: "شارة محترف", cost: 1500, type: 'badges', preview: '🏆', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_legend', name_en: "Legend Badge", name_ar: "شارة أسطورة", cost: 5000, type: 'badges', preview: '👑', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_star', name_en: "Star Badge", name_ar: "شارة نجم", cost: 2000, type: 'badges', preview: '🌟', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_fire', name_en: "Fire Badge", name_ar: "شارة نار", cost: 1200, type: 'badges', preview: '🔥', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_ice', name_en: "Ice Badge", name_ar: "شارة جليد", cost: 1200, type: 'badges', preview: '❄️', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_diamond', name_en: "Diamond Badge", name_ar: "شارة ماسة", cost: 3000, type: 'badges', preview: '', imageUrl: 'https://i.ibb.co/ZR2rv0s3/awaw.png' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // ════ UNCOMMON BADGES ════
        { id: 'badge_leaf', name_en: "Leaf Badge", name_ar: "شارة الورقة", cost: 90, type: 'badges', rarity: 'Uncommon', preview: '🌿', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // ════ FunPass Exclusive Badges — hidden in shop ════
        { id: 'fp_badge_rookie',   name_en: "Rookie Badge",   name_ar: "شارة مبتدئ",       cost: 0, type: 'badges', rarity: 'Common',    preview: '🔰', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_speed',    name_en: "Speed Badge",    name_ar: "شارة السرعة",      cost: 0, type: 'badges', rarity: 'Common',    preview: '⚡', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_diamond',  name_en: "Diamond Badge",  name_ar: "شارة ألماس",       cost: 0, type: 'badges', rarity: 'Epic',      preview: '💎', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_fire',     name_en: "Fire Badge",     name_ar: "شارة النار",       cost: 0, type: 'badges', rarity: 'Epic',      preview: '🔥', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_sniper',   name_en: "Sniper Badge",   name_ar: "شارة القناص",      cost: 0, type: 'badges', rarity: 'Epic',      preview: '🎯', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_legend',   name_en: "Legend Badge",   name_ar: "شارة أسطورية",     cost: 0, type: 'badges', rarity: 'Legendary', preview: '⭐', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_galaxy',   name_en: "Galaxy Badge",   name_ar: "شارة المجرة",      cost: 0, type: 'badges', rarity: 'Legendary', preview: '🌌', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_gold',     name_en: "Gold Badge",     name_ar: "شارة ذهبية",       cost: 0, type: 'badges', rarity: 'Legendary', preview: '🏅', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_thunder',  name_en: "Thunder Badge",  name_ar: "شارة الرعد",       cost: 0, type: 'badges', rarity: 'Legendary', preview: '⚡', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_mystic',   name_en: "Mystic Badge",   name_ar: "شارة غامضة",       cost: 0, type: 'badges', rarity: 'Legendary', preview: '🔮', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_blast',    name_en: "Blast Badge",    name_ar: "شارة الانفجار",    cost: 0, type: 'badges', rarity: 'Legendary', preview: '💥', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_dark',     name_en: "Dark Badge",     name_ar: "شارة الظلام",      cost: 0, type: 'badges', rarity: 'Legendary', preview: '🌑', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_arrow',    name_en: "Arrow Badge",    name_ar: "شارة السهم",       cost: 0, type: 'badges', rarity: 'Legendary', preview: '🏹', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_prism',    name_en: "Prism Badge",    name_ar: "شارة المنشور",     cost: 0, type: 'badges', rarity: 'Mythic',    preview: '💠', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_void',     name_en: "Void Badge",     name_ar: "شارة الفراغ",      cost: 0, type: 'badges', rarity: 'Mythic',    preview: '🌀', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_phoenix',  name_en: "Phoenix Badge",  name_ar: "شارة الفينيكس",    cost: 0, type: 'badges', rarity: 'Mythic',    preview: '🔥', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_nova',     name_en: "Nova Badge",     name_ar: "شارة النجم المتفجر", cost: 0, type: 'badges', rarity: 'Mythic', preview: '🌟', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
    ],
    themes: [
        { id: 'theme_dark', name_en: "Midnight", name_ar: "منتصف الليل", cost: 200, type: 'themes' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'theme_ocean', name_en: "Ocean Blue", name_ar: "أزرق محيطي", cost: 300, type: 'themes' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
    ],
    profileEffects: [
        { id: 'effect_sakura', name_en: "Sakura Petals", name_ar: "زهور الكرز",  cost: 800,  type: 'profileEffects', rarity: 'Rare',      preview: '🌸', particles: [{emoji:'🌸',count:12},{emoji:'🌺',count:8}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_hearts', name_en: "Heart Shower",  name_ar: "دش القلوب",   cost: 900,  type: 'profileEffects', rarity: 'Rare',      preview: '💖', particles: [{emoji:'💖',count:12},{emoji:'💕',count:10},{emoji:'❤️',count:8}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_stars',  name_en: "Star Burst",    name_ar: "انفجار نجوم", cost: 1200, type: 'profileEffects', rarity: 'Epic',      preview: '⭐', particles: [{emoji:'⭐',count:10},{emoji:'✨',count:14},{emoji:'💫',count:8}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_fire',   name_en: "Fire Storm",    name_ar: "عاصفة نارية", cost: 1500, type: 'profileEffects', rarity: 'Epic',      preview: '🔥', particles: [{emoji:'🔥',count:15},{emoji:'💥',count:6}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_ghost',  name_en: "Ghost Mode",    name_ar: "وضع الشبح",   cost: 1800, type: 'profileEffects', rarity: 'Epic',      preview: '👻', particles: [{emoji:'👻',count:8},{emoji:'💀',count:6},{emoji:'🕯️',count:8}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_money',  name_en: "Money Rain",    name_ar: "مطر الأموال", cost: 2000, type: 'profileEffects', rarity: 'Legendary', preview: '💰', particles: [{emoji:'💰',count:10},{emoji:'🧠',count:12},{emoji:'💵',count:8}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_crown',  name_en: "Royal Crown",   name_ar: "تاج ملكي",    cost: 2500, type: 'profileEffects', rarity: 'Legendary', preview: '👑', particles: [{emoji:'👑',count:6},{emoji:'💎',count:8},{emoji:'✨',count:12}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_galaxy', name_en: "Galaxy",        name_ar: "مجرة",        cost: 3000, type: 'profileEffects', rarity: 'Mythic',    preview: '🌌', particles: [{emoji:'🌟',count:8},{emoji:'💫',count:10},{emoji:'🌙',count:6},{emoji:'⭐',count:8}], duration: 2500 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_gif', name_en: "SuperGirl",  name_ar: "سوبر جيرل",  cost: 3000, type: 'profileEffects', rarity: 'Mythic',    preview: 'https://s13.gifyu.com/images/bmv39.gif', imageUrl: 'https://s13.gifyu.com/images/bmv39.gif', particles: [], duration: 2, loopEvery: 9999999, displayDuration: 2000, showOnce: true, opacity: 0.82, blendMode: 'overlay', hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_gif2', name_en: "Glow Burst",      name_ar: "ومضة نيون",    cost: 3500, type: 'profileEffects', rarity: 'Mythic',    preview: 'https://s13.gifyu.com/images/bmvMv.gif', imageUrl: 'https://s13.gifyu.com/images/bmvMv.gif', particles: [], duration: 2, loopEvery: 9999999, displayDuration: 2000, showOnce: true, opacity: 0.88, blendMode: 'screen', hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_gif3', name_en: "Aura Pulse",      name_ar: "نبضة الأورا",  cost: 3500, type: 'profileEffects', rarity: 'Mythic',    preview: 'https://s13.gifyu.com/images/bmvMm.gif', imageUrl: 'https://s13.gifyu.com/images/bmvMm.gif', particles: [], duration: 2, loopEvery: 9999999, displayDuration: 2000, showOnce: true, opacity: 0.88, blendMode: 'screen', hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_test', name_en: "shehabtest",      name_ar: "نبضة الأورا",  cost: 3500, type: 'profileEffects', rarity: 'Mythic',    preview: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/main/icos/Pi7_GIF_CMP.gif', imageUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/main/icos/Pi7_GIF_CMP.gif', particles: [], duration: 2, loopEvery: 9999999, displayDuration: 2000, showOnce: true, opacity: 0.88, blendMode: 'screen', hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },

    ],
    // ✅ BFF TOKENS — purchased to create relationships
    bff_tokens: [], // populated from BFF_TOKEN_ITEMS in 01-config.js at runtime
    // ✅ GIFTS — Charisma & Bonus Formula (v2)
    // 📐 charisma = cost ÷ 5 | maxBonus = charisma × 25 (= cost × 5)
    // 🎯 Min reward = 120 coins | gifts giving <120 coins → charisma only, no coin reward
    // 🏆 Top gift: cost 200,000 → charisma 40,000 → maxBonus 1,000,000
    // 🔧 vipXP = charisma ÷ 20 (min 1)
    gifts: [
        // ── بدون مردود كوين (cost < 25 → maxBonus < 120) ──
        { id: 'gift_rose',      name_en: "Rose",          name_ar: "وردة",         cost: 1,      type: 'gifts', charisma: 1,      vipXP: 1,    minBonus: 0,   maxBonus: 0,         desc_ar: "عبّر عن مشاعرك",           desc_en: "Express your feelings",    emoji: "🌹", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: '30', season: null, maxSendOptions: null },
        { id: 'gift_candy',     name_en: "Poop",         name_ar: "Poop",         cost: 10,      type: 'gifts', charisma: 2,      vipXP: 1,    minBonus: 0,   maxBonus: 0,         desc_ar: "حلاوة تُفرح القلب",        desc_en: "Sweetness for the heart",  emoji: "🍬", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_cookie',    name_en: "Pills",        name_ar: "حبوب",       cost: 10,      type: 'gifts', charisma: 2,      vipXP: 1,    minBonus: 0,   maxBonus: 0,         desc_ar: "بسكويت لذيذ",              desc_en: "Delicious cookie",         emoji: "🍪", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_chocolate', name_en: "Chocolate",     name_ar: "شوكولاتة",     cost: 120,      type: 'gifts', charisma: 24,    vipXP: 5,    minBonus: 1,   maxBonus: 600,         desc_ar: "شوكولاتة فاخرة",           desc_en: "Premium chocolate",        emoji: "🍫", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_icecream',  name_en: "Ice Cream",     name_ar: "آيس كريم",     cost: 120,      type: 'gifts', charisma: 24,      vipXP: 5,    minBonus: 1,   maxBonus: 600,         desc_ar: "برّد على قلبك",             desc_en: "Cool down your heart",     emoji: "🍦", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_coffee',    name_en: "Coffee",        name_ar: "قهوة",         cost: 150,      type: 'gifts', charisma: 30,      vipXP: 7,    minBonus: 1,   maxBonus: 750,         desc_ar: "قهوة صباحية",              desc_en: "Morning coffee",           emoji: "☕", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_heart',     name_en: "Heart",         name_ar: "قلب",          cost: 520,     type: 'gifts', charisma: 104,      vipXP: 11,    minBonus: 1,   maxBonus: 2600,         desc_ar: "نبض الحب",                 desc_en: "Pulse of love",            emoji: "❤️", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_cake',      name_en: "Cake",          name_ar: "كيكة",         cost: 300,     type: 'gifts', charisma: 60,      vipXP: 6,    minBonus: 1,   maxBonus: 1500,         desc_ar: "كيكة للاحتفال",            desc_en: "Celebration cake",         emoji: "🎂", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_flower',    name_en: "Fireworks",     name_ar: "ألعاب نارية",    cost: 2000,    type: 'gifts', charisma: 400,      vipXP: 20,    minBonus: 1,   maxBonus: 10000,         desc_ar: "باقة جميلة",               desc_en: "Beautiful bouquet",        emoji: "💐", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_pizza',     name_en: "Pizza",         name_ar: "بيتزا",        cost: 1200,     type: 'gifts', charisma: 240,      vipXP: 13,    minBonus: 1,   maxBonus: 6000,         desc_ar: "وليمة لذيذة",              desc_en: "Delicious feast",          emoji: "🍕", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        // ── مع مردود كوين (cost ≥ 25 → maxBonus ≥ 120) ──
        { id: 'gift_burger',    name_en: "Burger",        name_ar: "برجر",         cost: 25,     type: 'gifts', charisma: 5,      vipXP: 1,    minBonus: 120, maxBonus: 125,       desc_ar: "برجر شهي",                 desc_en: "Juicy burger",             emoji: "🍔", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_teddy',     name_en: "Teddy Bear",    name_ar: "دب Teddy",     cost: 30,     type: 'gifts', charisma: 6,      vipXP: 1,    minBonus: 120, maxBonus: 150,       desc_ar: "دب قطني ناعم",             desc_en: "Soft teddy bear",          emoji: "🧸", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_donut',     name_en: "Donut",         name_ar: "دونات",        cost: 40,     type: 'gifts', charisma: 8,      vipXP: 1,    minBonus: 120, maxBonus: 200,       desc_ar: "دونات محلاة",              desc_en: "Glazed donut",             emoji: "🍩", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_star',      name_en: "Star",          name_ar: "نجمة",         cost: 50,     type: 'gifts', charisma: 10,     vipXP: 1,    minBonus: 120, maxBonus: 250,       desc_ar: "نجمة ساطعة",               desc_en: "Shining star",             emoji: "⭐", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_gem',       name_en: "Gem",           name_ar: "جوهرة",        cost: 75,     type: 'gifts', charisma: 15,     vipXP: 1,    minBonus: 120, maxBonus: 375,       desc_ar: "جوهرة ثمينة",              desc_en: "Precious gem",             emoji: "💎", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_crown',     name_en: "Crown",         name_ar: "تاج",          cost: 80,     type: 'gifts', charisma: 16,     vipXP: 1,    minBonus: 120, maxBonus: 400,       desc_ar: "تاج ملكي",                 desc_en: "Royal crown",              emoji: "👑", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_trophy',    name_en: "Trophy",        name_ar: "كأس",          cost: 100,    type: 'gifts', charisma: 20,     vipXP: 1,    minBonus: 120, maxBonus: 500,       desc_ar: "كأس الفوز",                desc_en: "Victory trophy",           emoji: "🏆", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_ring',      name_en: "Ring",          name_ar: "خاتم",         cost: 100,    type: 'gifts', charisma: 20,     vipXP: 1,    minBonus: 120, maxBonus: 500,       desc_ar: "خاتم الأناقة",             desc_en: "Elegant ring",             emoji: "💍", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_rocket',    name_en: "Rocket",        name_ar: "صاروخ",        cost: 150,    type: 'gifts', charisma: 30,     vipXP: 2,    minBonus: 120, maxBonus: 750,       desc_ar: "انطلق للنجوم",             desc_en: "Launch to stars",          emoji: "🚀", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_robot',     name_en: "Robot",         name_ar: "روبوت",        cost: 200,    type: 'gifts', charisma: 40,     vipXP: 2,    minBonus: 120, maxBonus: 1000,      desc_ar: "روبوت ذكي",                desc_en: "Smart robot",              emoji: "🤖", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_unicorn',   name_en: "Unicorn",       name_ar: "يونيكورن",     cost: 250,    type: 'gifts', charisma: 50,     vipXP: 2,    minBonus: 120, maxBonus: 1250,      desc_ar: "حصان سحري",                desc_en: "Magical unicorn",          emoji: "🦄", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_motorbike', name_en: "Motorbike",     name_ar: "موتوسيكل",     cost: 250,    type: 'gifts', charisma: 50,     vipXP: 2,    minBonus: 120, maxBonus: 1250,      desc_ar: "سرعة وكاريزما",            desc_en: "Speed and charisma",       emoji: "🏍️", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_crystal',   name_en: "Crystal",       name_ar: "كريستال",      cost: 300,    type: 'gifts', charisma: 60,     vipXP: 3,    minBonus: 120, maxBonus: 1500,      desc_ar: "كريستال نادر",             desc_en: "Rare crystal",             emoji: "🔮", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_racecar',   name_en: "Race Car",      name_ar: "سيارة سباق",   cost: 500,    type: 'gifts', charisma: 100,    vipXP: 5,    minBonus: 120, maxBonus: 2500,      desc_ar: "انطلق كالمحترفين",         desc_en: "Race like a pro",          emoji: "🏎️", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_castle',    name_en: "Castle",        name_ar: "قصر",          cost: 750,    type: 'gifts', charisma: 150,    vipXP: 8,    minBonus: 120, maxBonus: 3750,      desc_ar: "قصر ملكي فخم",             desc_en: "Luxury castle",            emoji: "🏰", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_yacht',     name_en: "Yacht",         name_ar: "يخت",          cost: 1000,   type: 'gifts', charisma: 200,    vipXP: 10,   minBonus: 120, maxBonus: 5000,      desc_ar: "فخامة الملوك",             desc_en: "Royal luxury",             emoji: "🛥️", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_diamond',   name_en: "Diamond",       name_ar: "ماسة",         cost: 1500,   type: 'gifts', charisma: 300,    vipXP: 15,   minBonus: 120, maxBonus: 7500,      desc_ar: "ماسة نادرة",               desc_en: "Rare diamond",             emoji: "💠", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_spaceship', name_en: "Spaceship",     name_ar: "مركبة فضائية", cost: 2000,   type: 'gifts', charisma: 400,    vipXP: 20,   minBonus: 120, maxBonus: 10000,     desc_ar: "استكشف الفضاء",            desc_en: "Explore space",            emoji: "🛸", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_jet',       name_en: "Private Jet",   name_ar: "طائرة خاصة",   cost: 5000,   type: 'gifts', charisma: 1000,   vipXP: 50,   minBonus: 120, maxBonus: 25000,     desc_ar: "حلّق في سماء الكاريزما",   desc_en: "Soar in charisma skies",   emoji: "✈️", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_island',    name_en: "Private Island",name_ar: "جزيرة خاصة",   cost: 10000,  type: 'gifts', charisma: 2000,   vipXP: 100,  minBonus: 120, maxBonus: 50000,     desc_ar: "أمتلك عالمك الخاص",        desc_en: "Own your world",           emoji: "🏝️", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_planet',    name_en: "Planet",        name_ar: "كوكب",         cost: 10000,  type: 'gifts', charisma: 2000,   vipXP: 105,  minBonus: 120, maxBonus: 49995,     desc_ar: "كوكب خاص بك",             desc_en: "Your own planet",          emoji: "🪐", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_galaxy',    name_en: "Galaxy",        name_ar: "مجرة",         cost: 10000,  type: 'gifts', charisma: 2000,   vipXP: 105,  minBonus: 120, maxBonus: 49995,     desc_ar: "مجرة كاملة ملكك",          desc_en: "Your own galaxy",          emoji: "🌌", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_dragon',    name_en: "Dragon",        name_ar: "تنين",         cost: 10000,  type: 'gifts', charisma: 2000,   vipXP: 105,  minBonus: 120, maxBonus: 49995,     desc_ar: "تنين أسطوري",              desc_en: "Legendary dragon",         emoji: "🐉", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_moon',      name_en: "Moon",          name_ar: "قمر",          cost: 19999,  type: 'gifts', charisma: 3999,  vipXP: 205,  minBonus: 120, maxBonus: 99995,    desc_ar: "قمر خاص بك",              desc_en: "Your own moon",            emoji: "🌙", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'Ronnie_gift',    name_en: "Ronnie",        name_ar: "Ronnie",       cost: 19999,  type: 'gifts', charisma: 3999,  vipXP: 205,  minBonus: 120, maxBonus: 99995,    desc_ar: "قمر خاص بك",              desc_en: "Ronnie is the love",       emoji: "", imageUrl: "https://i.ibb.co/JjYM35hb/Ronnie.png", hidden: false, isEvent: true, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1, 3, 5, 10] },
        // ══ MULTI-SEND GIFTS ══
        { id: 'gift_spark',     name_en: "Spark",         name_ar: "شرارة",        cost: 5,      type: 'gifts', charisma: 1,      vipXP: 1,    minBonus: 0,   maxBonus: 0,         desc_ar: "شرارة تشعل الحماس",        desc_en: "A spark of excitement",    emoji: "⚡", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1, 3, 5, 10] },
        { id: 'gift_bomb',      name_en: "Bomb",          name_ar: "قنبلة",        cost: 20,     type: 'gifts', charisma: 4,      vipXP: 1,    minBonus: 0,   maxBonus: 0,         desc_ar: "قنبلة الكاريزما!",         desc_en: "Charisma bomb!",           emoji: "💣", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1, 3, 5, 10] },
        { id: 'gift_sun',       name_en: "Sun",           name_ar: "شمس",          cost: 50000,  type: 'gifts', charisma: 10000,  vipXP: 500,  minBonus: 120, maxBonus: 250000,    desc_ar: "شمس ساطعة",                desc_en: "Shining sun",              emoji: "☀️", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_world',     name_en: "World",         name_ar: "عالم",         cost: 100000, type: 'gifts', charisma: 20000,  vipXP: 1000, minBonus: 120, maxBonus: 500000,    desc_ar: "عالم كامل ملكك",           desc_en: "Your own world",           emoji: "🌍", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_universe',  name_en: "Universe",      name_ar: "كون",          cost: 100000, type: 'gifts', charisma: 20000,  vipXP: 1000, minBonus: 120, maxBonus: 500000,    desc_ar: "كون كامل ملكك",            desc_en: "Your own universe",        emoji: "🌌", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_multiverse',name_en: "Multiverse",    name_ar: "متعدد أكوان", cost: 150000, type: 'gifts', charisma: 30000,  vipXP: 1500, minBonus: 120, maxBonus: 750000,    desc_ar: "متعدد أكوان خاص",          desc_en: "Your multiverse",          emoji: "🪐", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        // 🏆 أعلى هدية — The Ultimate Gift (200,000 cost → 40,000 charisma → maxBonus 1,000,000)
        { id: 'gift_ultimate',  name_en: "Ultimate Gift", name_ar: "الهدية المطلقة", cost: 200000, type: 'gifts', charisma: 40000, vipXP: 2000, minBonus: 120, maxBonus: 1000000, desc_ar: "أعظم هدية على الإطلاق",   desc_en: "The ultimate gift of all", emoji: "🏆", imageUrl: "",  hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        // ════ EVENT GIFTS ════
        { id: 'gift_event_sword',    name_en: "Event Sword",     name_ar: "سيف الحدث",       cost: 500,   type: 'gifts', charisma: 100,  vipXP: 5,   minBonus: 120, maxBonus: 2500,   desc_ar: "هدية حصرية للأحداث",  desc_en: "Exclusive event gift",                       emoji: "⚔️", imageUrl: "", hidden: false, isEvent: true,  limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_limited_crown',  name_en: "Limited Crown",   name_ar: "تاج محدود",        cost: 999,   type: 'gifts', charisma: 200,  vipXP: 10,  minBonus: 120, maxBonus: 5000,   desc_ar: "تاج لمحدود الوقت",    desc_en: "Limited time crown",                         emoji: "👸", imageUrl: "", hidden: false, isEvent: false, limitedTime: true,  eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_event_hidden',   name_en: "Event Only Gift", name_ar: "هدية الحدث فقط",  cost: 1500,  type: 'gifts', charisma: 300,  vipXP: 15,  minBonus: 120, maxBonus: 7500,   desc_ar: "تظهر في الشوب لكن للحدث فقط", desc_en: "Visible but event-only purchase",         emoji: "🗝️", imageUrl: "", hidden: false, isEvent: true,  limitedTime: false, eventOnly: true },
        { id: 'gift_phoenix',        name_en: "Phoenix",         name_ar: "طائر الفينيق",     cost: 25000, type: 'gifts', charisma: 5000, vipXP: 250, minBonus: 120, maxBonus: 125000, desc_ar: "طائر الفينيق الأسطوري — حصري لوقت محدود!", desc_en: "Legendary Phoenix — Limited time exclusive!", emoji: "🦅", imageUrl: "", hidden: false, isEvent: true, limitedTime: true, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10], eventEndsAt: '2025-12-31', rarity: 'Mythic' },
        { id: 'gift_crystal_dragon', name_en: "Crystal Dragon",  name_ar: "تنين الكريستال",   cost: 50000, type: 'gifts', charisma: 10000,vipXP: 500, minBonus: 120, maxBonus: 250000, desc_ar: "تنين الكريستال للنخبة فقط — إيفنت حصري!", desc_en: "Crystal Dragon — Elite exclusive event gift!", emoji: "🐲", imageUrl: "", hidden: false, isEvent: true, limitedTime: true, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10], eventEndsAt: '2025-12-31', rarity: 'Mythic' },
        // ════ 🎫 FUNPASS EXCLUSIVE GIFTS ════
        { id: 'gift_fp_lucky',   name_en: "Lucky Clover", name_ar: "البرسيم المحظوظ", cost: 500,  type: 'gifts', charisma: 100,  vipXP: 5,  minBonus: 120, maxBonus: 2500,  desc_ar: "هدية FunPass حصرية 🍀", desc_en: "Exclusive FunPass gift 🍀", emoji: "🍀", imageUrl: "", hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_fp_crystal', name_en: "FP Crystal",   name_ar: "كريستال FanPass",  cost: 1200, type: 'gifts', charisma: 240,  vipXP: 12, minBonus: 120, maxBonus: 6000,  desc_ar: "هدية FunPass نادرة 💎", desc_en: "Rare FunPass gift 💎",    emoji: "🔷", imageUrl: "", hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: [1,3,5,10] },
    ],
    // 👑 VIP EXCLUSIVE GIFTS — مدمجة مع تاب الهدايا، مقفوله لحين الوصول للمستوى
    // vipGlowType: null | 'aurora' | 'inferno' | 'cosmic' | 'godlike'
    gifts_vip: [
        { id: 'vgift_vip_rose',    name_en: "VIP Rose",      name_ar: "وردة VIP",       cost: 150,    type: 'gifts_vip', charisma: 30,    vipXP: 5,    minBonus: 1, maxBonus: 750,   desc_ar: "وردة حصرية للـ VIP",           desc_en: "Exclusive VIP rose",             emoji: "🌹", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, vipMinLevel: 2,  vipExclusive: true, vipGlowType: null },
        { id: 'vgift_vip_star',    name_en: "VIP Star",      name_ar: "نجمة VIP",       cost: 150,   type: 'gifts_vip', charisma: 2500,   vipXP: 125,   minBonus: 1, maxBonus: 7500,   desc_ar: "نجمة ذهبية حصرية",             desc_en: "Exclusive gold star",            emoji: "⭐", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, vipMinLevel: 2,  vipExclusive: true, vipGlowType: null },
        { id: 'vgift_vip_crown',   name_en: "VIP Crown",     name_ar: "تاج VIP",        cost: 500,   type: 'gifts_vip', charisma: 8000,   vipXP: 400,   minBonus: 1, maxBonus: 25000,  desc_ar: "تاج ملكي حصري",               desc_en: "Exclusive royal crown",          emoji: "👑", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, vipMinLevel: 2,  vipExclusive: true, vipGlowType: null },
        { id: 'vgift_vip_diamond', name_en: "VIP Diamond",   name_ar: "ماسة VIP",       cost: 1000,  type: 'gifts_vip', charisma: 18000,  vipXP: 900,   minBonus: 1, maxBonus: 50000,  desc_ar: "ماسة حصرية للـ VIP",           desc_en: "Exclusive VIP diamond",          emoji: "💠", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, vipMinLevel: 5,  vipExclusive: true, vipGlowType: null },
        { id: 'vgift_vip_dragon',  name_en: "VIP Dragon",    name_ar: "تنين VIP",       cost: 2500,  type: 'gifts_vip', charisma: 40000,  vipXP: 2000,  minBonus: 1, maxBonus: 120000, desc_ar: "تنين أسطوري حصري",             desc_en: "Exclusive legendary dragon",     emoji: "🐉", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, vipMinLevel: 5,  vipExclusive: true, vipGlowType: null },
        // ══ AURORA — VIP 7 — شفق قطبي: أخضر/بنفسجي/فيروزي متموج ══
        { id: 'vgift_aurora',      name_en: "Aurora Gift",   name_ar: "هدية الأورورا",  cost: 5000,  type: 'gifts_vip', charisma: 90000,  vipXP: 4500,  minBonus: 1, maxBonus: 200000, desc_ar: "أضواء الشفق القطبي الخرافية", desc_en: "Mythical northern lights power", emoji: "🌌", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, vipMinLevel: 7,  vipExclusive: true, vipGlowType: 'aurora'  },
        // ══ INFERNO — VIP 8 — جهنم: أحمر/برتقال/أصفر مشتعل متحرك ══
        { id: 'vgift_inferno',     name_en: "Inferno Gift",  name_ar: "هدية الجحيم",    cost: 8000,  type: 'gifts_vip', charisma: 150000, vipXP: 7500,  minBonus: 1, maxBonus: 300000, desc_ar: "نار جهنم تشتعل بين يديك",     desc_en: "Hellfire blazing in your hands", emoji: "🔥", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, vipMinLevel: 8,  vipExclusive: true, vipGlowType: 'inferno' },
        // ══ COSMIC — VIP 9 — فضاء: أزرق عميق/بنفسجي/أبيض pulse كوني ══
        { id: 'vgift_cosmic',      name_en: "Cosmic Gift",   name_ar: "هدية الكون",     cost: 15000, type: 'gifts_vip', charisma: 300000, vipXP: 15000, minBonus: 1, maxBonus: 500000, desc_ar: "قوة الكون المطلقة بين يديك",  desc_en: "The absolute power of the cosmos", emoji: "🌠", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, vipMinLevel: 9,  vipExclusive: true, vipGlowType: 'cosmic'  },
        // ══ GODLIKE — VIP 10 — إله: rainbow shimmer نهائي خرافي ══
        { id: 'vgift_godlike',     name_en: "Godlike Gift",  name_ar: "هدية الإله",     cost: 30000, type: 'gifts_vip', charisma: 700000, vipXP: 35000, minBonus: 1, maxBonus: 999999, desc_ar: "أعظم هدية صنعها الإنسان",     desc_en: "The greatest gift ever crafted", emoji: "⚡", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, vipMinLevel: 10, vipExclusive: true, vipGlowType: 'godlike' },
    ]
};

// 🎨 GIFT RARITY SYSTEM
const RARITY_CONFIG = {
    Common:       { name_en: 'Common',       name_ar: 'عادي',          color: '#9ca3af', bg: 'rgba(156,163,175,0.07)', border: 'rgba(156,163,175,0.25)', glow: false, icon: '⚪', order: 0 },
    Uncommon:     { name_en: 'Uncommon',     name_ar: 'غير شائع',      color: '#4ade80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.35)',  glow: false, icon: '🟢', order: 1 },
    Rare:         { name_en: 'Rare',         name_ar: 'نادر',          color: '#60a5fa', bg: 'rgba(96,165,250,0.09)',  border: 'rgba(96,165,250,0.40)',  glow: false, icon: '🔵', order: 2 },
    Epic:         { name_en: 'Epic',         name_ar: 'ملحمي',         color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)',  border: 'rgba(139,92,246,0.45)',  glow: false, icon: '💜', order: 3 },
    Legendary:    { name_en: 'Legendary',    name_ar: 'أسطوري',        color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.50)',  glow: true,  icon: '⭐', order: 4 },
    Mythic:       { name_en: 'Mythic',       name_ar: 'خرافي',         color: '#ff0055', bg: 'rgba(255,0,85,0.12)',    border: 'rgba(255,0,85,0.60)',    glow: true,  icon: '🔮', order: 5, special: true },
    // ══ 4 TIERS BEYOND MYTHIC ══
    Artifact:     { name_en: 'Artifact',     name_ar: 'أثري',          color: '#c2410c', bg: 'rgba(194,65,12,0.12)',   border: 'rgba(194,65,12,0.65)',   glow: true,  icon: '🏺', order: 6, special: true, cssClass: 'rarity-artifact'     },
    Transcendent: { name_en: 'Transcendent', name_ar: 'متجاوز',        color: '#c026d3', bg: 'rgba(192,38,211,0.13)',  border: 'rgba(192,38,211,0.70)',  glow: true,  icon: '🌀', order: 7, special: true, cssClass: 'rarity-transcendent' },
    Immortal:     { name_en: 'Immortal',     name_ar: 'خالد',          color: '#e2e8f0', bg: 'rgba(226,232,240,0.10)', border: 'rgba(226,232,240,0.70)', glow: true,  icon: '✨', order: 8, special: true, cssClass: 'rarity-immortal'     },
    Divine:       { name_en: 'Divine',       name_ar: 'إلهي',          color: '#00d4ff', bg: 'rgba(0,212,255,0.10)',   border: 'rgba(0,212,255,0.75)',   glow: true,  icon: '💎', order: 9, special: true, cssClass: 'rarity-divine'       },
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
    if (cost >= 15)    return 'Uncommon';
    return 'Common';
};

// 🏆 ACHIEVEMENTS SYSTEM — Leveled (4 tiers per group)
// tier 1: Bronze/Normal | tier 2: Silver/Natural | tier 3: Red/Legendary | tier 4: Multi-color Glow/Ultimate
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
// 🎯 SMART BONUS SYSTEM — بونص ذكي يراعي قيمة الهدية
// ══════════════════════════════════════════════════════
// 🔧 BONUS_CONFIG — عدّل القيم هنا لضبط السلوك:
const BONUS_CONFIG = {
    // الأوزان الرئيسية: [منخفض, متوسط, عالي, جاكبوت]
    // الجمع = 1.0  (مثلاً: 70% + 18% + 9% + 3% = 100%)
    ZONE_WEIGHTS: [0.70, 0.18, 0.09, 0.03],

    // نطاقات كل منطقة كنسبة من maxBonus المعدَّل
    ZONE_RANGES: [
        [0.00, 0.08], // منخفض: 0-8% من maxBonus (70% من الوقت)
        [0.08, 0.22], // متوسط: 8-22% (18% من الوقت)
        [0.22, 0.50], // عالي: 22-50% (9% من الوقت)
        [0.50, 1.00], // 🎰 جاكبوت: 50-100% (3% فقط!)
    ],

    // سقف البونص بحسب فئة سعر الهدية (كنسبة من maxBonus)
    // كلما كانت الهدية أغلى، كلما قَلَّ السقف الطبيعي
    GIFT_COST_CAP: [
        { maxCost: 20,    cap: 1.00 }, // رخيصة جداً: كامل maxBonus
        { maxCost: 100,   cap: 0.40 }, // رخيصة: 40% فقط من maxBonus
        { maxCost: 500,   cap: 0.25 }, // متوسطة: 25% فقط
        { maxCost: 2000,  cap: 0.15 }, // غالية: 15% فقط
        { maxCost: 10000, cap: 0.10 }, // غالية جداً: 10% فقط
        { maxCost: Infinity, cap: 0.06 }, // أسطورية: 6% فقط
    ],

    // استثناء الجاكبوت: يجتاز السقف دائماً؟ (true = نعم)
    JACKPOT_BYPASSES_CAP: true,
};

const generateRandomBonus = (min, max, giftCost = 0) => {
    const { ZONE_WEIGHTS, ZONE_RANGES, GIFT_COST_CAP, JACKPOT_BYPASSES_CAP } = BONUS_CONFIG;

    // احسب السقف بناءً على سعر الهدية
    const capEntry = GIFT_COST_CAP.find(e => giftCost <= e.maxCost) || GIFT_COST_CAP[GIFT_COST_CAP.length - 1];
    const capFactor = capEntry.cap;

    // اختيار المنطقة
    const r = Math.random();
    let zone = ZONE_WEIGHTS.length - 1;
    let cumulative = 0;
    for (let i = 0; i < ZONE_WEIGHTS.length; i++) {
        cumulative += ZONE_WEIGHTS[i];
        if (r < cumulative) { zone = i; break; }
    }

    const isJackpot = zone === ZONE_WEIGHTS.length - 1;
    const [lo, hi] = ZONE_RANGES[zone];

    // طبّق السقف على الجاكبوت أو لا؟
    const effectiveMax = (isJackpot && JACKPOT_BYPASSES_CAP)
        ? max
        : Math.max(min, Math.floor(max * capFactor));

    const range = effectiveMax - min;
    return Math.max(min, Math.min(effectiveMax, Math.floor(min + range * (lo + Math.random() * (hi - lo)))));
};

// --- Translations ---
