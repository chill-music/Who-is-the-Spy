// �����������������������������������������������������������������������
// ⏳ ITEM EXPIRY SYSTEM � دا�ة ا���ت ��� آ�ت� ف� ا�إ�ف�تر�
// �����������������������������������������������������������������������
//
// � ��ف�ة ا�استخدا� ف� ا�ش�ب أ� ا�فا� باس:
//   1. �� آ�ت� ع�د� ح�� "durationDays" � �� null �ع�� أبد�� �� ر�� �ع�� ���
//   2. ��ا تض�ف آ�ت� ��إ�ف�تر�� ا�تب �ع� "expiresAt" ف� Firestore:
//      expiresAt = Date.now() + (item.durationDays * 24 * 60 * 60 * 1000)
//   3. ا�دا�ة "isItemExpired" تتح�� ��� �� �رة
//
// � �ثا� إضافة آ�ت� ب��ت (frames/badges/titles):
//   await usersCollection.doc(uid).update({
//     [`inventory.frames`]: firebase.firestore.FieldValue.arrayUnion(item.id),
//     [`inventory.expiry.${item.id}`]: item.durationDays
//         ? Date.now() + item.durationDays * 86400000
//         : null,
//   });
//
// � �ثا� إضافة �د�ة ب��ت (gifts):
//   await usersCollection.doc(uid).update({
//     'inventory.gifts': firebase.firestore.FieldValue.arrayUnion(item.id),
//     [`inventory.giftCounts.${item.id}`]: currentCount + 1,
//     [`inventory.expiry.${item.id}`]: buildItemExpiresAt(item.durationDays),
//   });
//
// � ا�تح�� �� ا�ا�ت�اء:
//   const expired = isItemExpired(userData?.inventory?.expiry?.[item.id]);
//   if (expired) { /* حذف ا�آ�ت� �� ا�إ�ف�تر� */ }
// �����������������������������������������������������������������������

// Returns true if the item has expired
var sItemExpired = (expiryTimestamp) => {
    if (!expiryTimestamp) return false; // null = permanent
    return Date.now() > expiryTimestamp;
};

// Build expiresAt timestamp when buying/awarding an item
var uildItemExpiresAt = (durationDays) => {
    if (!durationDays) return null;
    return Date.now() + durationDays * 86400000;
};

var AILY_TASKS_CONFIG = [
    { id: 1, label_en: '1 min',   label_ar: '١ د���ة',   duration: 60000,   reward: { type:'currency', amount:50,  icon:'�'}, comingSoon: false },
    { id: 2, label_en: '5 min',   label_ar: '٥ د�ائ�',   duration: 300000,  reward: { type:'currency', amount:100, icon:'�'}, comingSoon: false },
    { id: 3, label_en: '10 min',  label_ar: '١٠ د�ائ�',  duration: 600000,  reward: { type:'currency', amount:150, icon:'�'}, comingSoon: false },
    { id: 4, label_en: 'VIP',     label_ar: 'VIP',        duration: null,    reward: { type:'currency', amount:300, icon:'�'}, comingSoon: true  },
    { id: 5, label_en: '20 min',  label_ar: '٢٠ د���ة',  duration: 1200000, reward: { type:'currency', amount:200, icon:'�'}, comingSoon: false },
    { id: 6, label_en: '30 min',  label_ar: '٣٠ د���ة',  duration: 1800000, reward: { type:'currency', amount:300, icon:'�'}, comingSoon: false },
    { id: 7, label_en: '60 min',  label_ar: '٦٠ د���ة',  duration: 3600000, reward: { type:'currency', amount:500, icon:'�'}, comingSoon: false },
    { id: 8, label_en: 'VIP',     label_ar: 'VIP',        duration: null,    reward: { type:'currency', amount:800, icon:'�'}, comingSoon: true  },
];

// CHARISMA LEVELS - 21 Levels
var HARISMA_LEVELS = [
    { level: 1, threshold: 0, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/star1.png', name_en: 'Rising Star', name_ar: '�ج� صاعد', color: '#ffd700', badge_class: 'level-1-3' },
    { level: 2, threshold: 4000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/star2.png', name_en: 'Shining Star', name_ar: '�ج� ساطع', color: '#ffd700', badge_class: 'level-1-3' },
    { level: 3, threshold: 12000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/star3.png', name_en: 'Bright Star', name_ar: '�ج� �ض�ء', color: '#ffd700', badge_class: 'level-1-3' },
    { level: 4, threshold: 30000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/1d.png', name_en: 'Diamond I', name_ar: '�اسة 1', color: '#3b82f6', badge_class: 'level-4-6' },
    { level: 5, threshold: 80000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/4d.png', name_en: 'Diamond II', name_ar: '�اسة 2', color: '#3b82f6', badge_class: 'level-4-6' },
    { level: 6, threshold: 160000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/3d.png', name_en: 'Diamond III', name_ar: '�اسة 3', color: '#3b82f6', badge_class: 'level-4-6' },
    { level: 7, threshold: 300000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Crown1.png', name_en: 'Crown I', name_ar: 'تاج 1', color: '#ffd700', badge_class: 'level-7-9' },
    { level: 8, threshold: 500000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Crown2.png', name_en: 'Crown II', name_ar: 'تاج 2', color: '#ffd700', badge_class: 'level-7-9' },
    { level: 9, threshold: 1000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Crown3.png', name_en: 'Crown III', name_ar: 'تاج 3', color: '#ffd700', badge_class: 'level-7-9' },
    { level: 10, threshold: 2000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Royal%20Crown1.png', name_en: 'Royal Crown I', name_ar: 'تاج ���� 1', color: '#f97316', badge_class: 'level-10-12' },
    { level: 11, threshold: 3500000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Royal%20Crown2.png', name_en: 'Royal Crown II', name_ar: 'تاج ���� 2', color: '#f97316', badge_class: 'level-10-12' },
    { level: 12, threshold: 6000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Royal%20Crown3.png', name_en: 'Royal Crown III', name_ar: 'تاج ���� 3', color: '#f97316', badge_class: 'level-10-12' },
    { level: 13, threshold: 8500000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Purple%20Crown1.png', name_en: 'Purple Crown I', name_ar: 'تاج ب�فسج� 1', color: '#8b5cf6', badge_class: 'level-13-15' },
    { level: 14, threshold: 12000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Purple%20Crown2.png', name_en: 'Purple Crown II', name_ar: 'تاج ب�فسج� 2', color: '#8b5cf6', badge_class: 'level-13-15' },
    { level: 15, threshold: 16000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Purple%20Crown3.png', name_en: 'Purple Crown III', name_ar: 'تاج ب�فسج� 3', color: '#8b5cf6', badge_class: 'level-13-15' },
    { level: 16, threshold: 26000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Legend1.png', name_en: 'Legend I', name_ar: 'أسط�رة 1', color: '#f97316', badge_class: 'level-16-21', hasGlow: true },
    { level: 17, threshold: 48000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Legend2.png', name_en: 'Legend II', name_ar: 'أسط�رة 2', color: '#f97316', badge_class: 'level-16-21', hasGlow: true },
    { level: 18, threshold: 86000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Legend3.png', name_en: 'Legend III', name_ar: 'أسط�رة 3', color: '#f97316', badge_class: 'level-16-21', hasGlow: true },
    { level: 19, threshold: 120000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Legend4.png', name_en: 'Legend IV', name_ar: 'أسط�رة 4', color: '#f97316', badge_class: 'level-16-21', hasGlow: true },
    { level: 20, threshold: 240000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Legend5.png', name_en: 'Legend V', name_ar: 'أسط�رة 5', color: '#f97316', badge_class: 'level-16-21', hasGlow: true },
    { level: 21, threshold: 360000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/main/icos/Ultimate%20Legend.gif', name_en: 'Ultimate Legend', name_ar: 'ا�أسط�رة ا��ط��ة', color: '#00d4ff', badge_class: 'level-divine', isDivine: true, isMaxLevel: true, hasGlow: true },
];

var etCharismaLevel = (charisma) => {
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

var etCharismaProgress = (charisma) => {
    const { currentLevel, nextLevel } = getCharismaLevel(charisma);
    if (!nextLevel || currentLevel.isMaxLevel) return 100;
    const progress = ((charisma - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100;
    return Math.min(100, Math.max(0, progress));
};

// SHOP ITEMS - GIFTS WITH BONUS (NO CASHBACK)
var HOP_ITEMS = {
    frames: [
        { id: 'frame_gold', name_en: "Gold Frame", name_ar: "إطار ذ�ب�", cost: 500, type: 'frames', preview: 'linear-gradient(45deg, #f7ff00, #db9700)' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_neon', name_en: "Neon Frame", name_ar: "إطار ����", cost: 300, type: 'frames', preview: 'linear-gradient(45deg, #00f2ff, #7000ff)' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_fire', name_en: "Fire Frame", name_ar: "إطار �ار", cost: 400, type: 'frames', preview: 'linear-gradient(45deg, #ff0055, #ff8800)' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_img', name_en: "Image Frame", name_ar: "إطار ص�رة", cost: 100, type: 'frames', preview: 'https://i.ibb.co/mVQTLr2D/Untitled-3.png' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_1', name_en: " Frame", name_ar: "إطار �تحر�", cost: 0, type: 'frames', preview: 'https://i.ibb.co/4Rj8jzWS/0202.png' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_rainbow', name_en: "Rainbow Frame", name_ar: "إطار ��س �زح", cost: 600, type: 'frames', preview: 'https://i.ibb.co/1tvtgmD8/ezgif-com-optimize.gif' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_ice', name_en: "Ice Frame", name_ar: "إطار ج��د", cost: 350, type: 'frames', preview: 'linear-gradient(45deg, #00d4ff, #ffffff, #00d4ff)' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_shehab', name_en: "Shehab Frame", name_ar: "إطار ��س �زح", cost: 600, type: 'frames', preview: 'https://i.ibb.co/xKgsYCZ3/shehab.gif' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },

        // ���� UNCOMMON ITEMS � ��� أخضر ����
        { id: 'frame_mint', name_en: "Mint Frame", name_ar: "إطار �ع�اع�", cost: 75, type: 'frames', rarity: 'Uncommon', preview: 'linear-gradient(45deg, #4ade80, #22d3ee)' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // ���� FunPass Exclusive Frames � hidden in shop, from FunPass rewards ����
        { id: 'fp_frame_neon',     name_en: "Neon Frame",     name_ar: "إطار ����",        cost: 0, type: 'frames', rarity: 'Rare',      preview: 'linear-gradient(45deg,#00f2ff,#7000ff)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_star',     name_en: "Star Frame",     name_ar: "إطار �ج�ة",        cost: 0, type: 'frames', rarity: 'Epic',      preview: 'linear-gradient(45deg,#ffe066,#ff8800)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_crystal',  name_en: "Crystal Frame",  name_ar: "إطار �ر�ستا�",     cost: 0, type: 'frames', rarity: 'Epic',      preview: 'linear-gradient(45deg,#67e8f9,#a5f3fc)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_vortex',   name_en: "Vortex Frame",   name_ar: "إطار د�ا�ة",       cost: 0, type: 'frames', rarity: 'Epic',      preview: 'linear-gradient(45deg,#818cf8,#a78bfa)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_gold',     name_en: "Gold Frame",     name_ar: "إطار ذ�ب�",        cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#ffd700,#ff8800)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_moon',     name_en: "Moon Frame",     name_ar: "إطار ا���ر",       cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#1e1b4b,#7c3aed)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_inferno',  name_en: "Inferno Frame",  name_ar: "إطار ج���",        cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#ef4444,#f97316)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_thunder',  name_en: "Thunder Frame",  name_ar: "إطار ا�رعد",       cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#fbbf24,#1d4ed8)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_skull',    name_en: "Skull Frame",    name_ar: "إطار ا�ج�ج�ة",     cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#111827,#374151)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_mystic',   name_en: "Mystic Frame",   name_ar: "إطار غا�ض",        cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#7c3aed,#4c1d95)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_rainbow',  name_en: "Rainbow Frame",  name_ar: "إطار ��س �زح",     cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(90deg,#f87171,#fb923c,#fbbf24,#4ade80,#60a5fa,#c084fc)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_dark',     name_en: "Dark Frame",     name_ar: "إطار ا�ظ�ا�",      cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#030712,#111827)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_mythic',   name_en: "Mythic Frame",   name_ar: "إطار خراف�",       cost: 0, type: 'frames', rarity: 'Mythic',    preview: 'linear-gradient(45deg,#ff0055,#7c3aed)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_prism',    name_en: "Prism Frame",    name_ar: "إطار ا���ش�ر",     cost: 0, type: 'frames', rarity: 'Mythic',    preview: 'linear-gradient(90deg,#00d4ff,#ff0055,#00d4ff)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_void',     name_en: "Void Frame",     name_ar: "إطار ا�فراغ",      cost: 0, type: 'frames', rarity: 'Mythic',    preview: 'linear-gradient(45deg,#000000,#1e1b4b)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_phoenix',  name_en: "Phoenix Frame",  name_ar: "إطار ا�ف����س",    cost: 0, type: 'frames', rarity: 'Mythic',    preview: 'linear-gradient(45deg,#dc2626,#fb923c)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_nova',     name_en: "Nova Frame",     name_ar: "إطار ا��ج� ا��تفجر", cost: 0, type: 'frames', rarity: 'Mythic', preview: 'linear-gradient(45deg,#fde68a,#fbbf24,#f59e0b)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // �� SEASON EXCLUSIVE FRAMES ��
        // � �تغ��ر ا�س�ز��: غ��ر season: '1' إ�� '2' أ� '3' إ�خ
        { id: 'frame_s1_celestial', name_en: "Celestial Frame", name_ar: "إطار س�ا��", cost: 0, type: 'frames', preview: 'linear-gradient(45deg,#00d4ff,#7c3aed,#00d4ff)', hidden: false, isEvent: false, limitedTime: true, eventOnly: true, durationDays: null, season: '1', rarity: 'Divine' },
    ],
    // �� PROFILE BANNERS ��
    // � �إضافة ب�رات ���تجر: أضف ��ا
    banners: [
        // �� SEASON EXCLUSIVE BANNERS ��
        // � �تغ��ر ا�س�ز��: غ��ر season: '1' إ�� '2' أ� '3' إ�خ
        { id: 'banner_s1_aurora', name_en: "Aurora Banner", name_ar: "ب�ر ا�شف�", cost: 0, type: 'banners', preview: 'linear-gradient(135deg,#0a0a2e,#1a1a4e,#00d4ff22,#7c3aed44)', hidden: false, isEvent: false, limitedTime: true, eventOnly: true, durationDays: null, season: '1', rarity: 'Divine' },
    ],
    titles: [
        { id: 'title_spy', name_en: "Mr. Spy", name_ar: "س�د جاس�س", cost: 600, type: 'titles', preview: '�️', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'title_hunter', name_en: "Hunter", name_ar: "ص�اد", cost: 450, type: 'titles', preview: '�', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'title_ghost', name_en: "Ghost", name_ar: "شبح", cost: 800, type: 'titles', preview: '�', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'title_legend', name_en: "Legend", name_ar: "أسط�رة", cost: 1500, type: 'titles', preview: '�', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'title_pro', name_en: "Pro Player", name_ar: "�حترف", cost: 1000, type: 'titles', preview: '⭐', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'title_shadow', name_en: "Shadow", name_ar: "ظ�", cost: 700, type: 'titles', preview: '', imageUrl: 'https://i.ibb.co/xqk8md71/122222.png' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // ���� UNCOMMON TITLES ����
        { id: 'title_rookie', name_en: "Rookie", name_ar: "�بتدئ", cost: 80, type: 'titles', rarity: 'Uncommon', preview: '�', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'title_scout', name_en: "Scout", name_ar: "�شاف", cost: 120, type: 'titles', rarity: 'Uncommon', preview: '�', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // ���� FunPass Exclusive Titles � hidden in shop ����
        { id: 'fp_title_agent',   name_en: "Agent",    name_ar: "ع���",          cost: 0, type: 'titles', rarity: 'Rare',      preview: '�️', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_star',    name_en: "Star",     name_ar: "�ج�ة",          cost: 0, type: 'titles', rarity: 'Epic',      preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_warrior', name_en: "Warrior",  name_ar: "�حارب",         cost: 0, type: 'titles', rarity: 'Epic',      preview: '�️', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_eye',     name_en: "The Eye",  name_ar: "ا�ع��",         cost: 0, type: 'titles', rarity: 'Epic',      preview: '��️', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_shadow',  name_en: "Shadow",   name_ar: "ا�ظ�",          cost: 0, type: 'titles', rarity: 'Legendary', preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_gold',    name_en: "Gold",     name_ar: "ذ�ب�",          cost: 0, type: 'titles', rarity: 'Legendary', preview: '��', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_ocean',   name_en: "Ocean",    name_ar: "ا��ح�ط",        cost: 0, type: 'titles', rarity: 'Legendary', preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_king',    name_en: "King",     name_ar: "ا����",         cost: 0, type: 'titles', rarity: 'Legendary', preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_flame',   name_en: "Flame",    name_ar: "ا���ب",         cost: 0, type: 'titles', rarity: 'Legendary', preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_rainbow', name_en: "Rainbow",  name_ar: "��س �زح",       cost: 0, type: 'titles', rarity: 'Legendary', preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_watcher', name_en: "Watcher",  name_ar: "ا�راصد",        cost: 0, type: 'titles', rarity: 'Legendary', preview: '��️', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_mystic',  name_en: "Mystic",   name_ar: "ا�غ��ض",        cost: 0, type: 'titles', rarity: 'Mythic',    preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_prism',   name_en: "Prism",    name_ar: "ا���ش�ر",       cost: 0, type: 'titles', rarity: 'Mythic',    preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_void',    name_en: "Void",     name_ar: "ا�فراغ",        cost: 0, type: 'titles', rarity: 'Mythic',    preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_phoenix', name_en: "Phoenix",  name_ar: "ا�ف����س",      cost: 0, type: 'titles', rarity: 'Mythic',    preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_god',     name_en: "GOD",      name_ar: "ا�إ��",         cost: 0, type: 'titles', rarity: 'Mythic',    preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // �� SEASON EXCLUSIVE TITLES ��
        // � �تغ��ر ا�س�ز��: غ��ر season: '1' إ�� '2' أ� '3' إ�خ
        { id: 'title_s1_pioneer', name_en: "Season Pioneer", name_ar: "رائد ا���س�", cost: 0, type: 'titles', preview: '�', imageUrl: '', hidden: false, isEvent: false, limitedTime: true, eventOnly: true, durationDays: null, season: '1', rarity: 'Divine' },
    ],
    badges: [
        { id: 'badge_vip', name_en: "VIP Badge", name_ar: "شارة VIP", cost: 1000, type: 'badges', preview: '⭐', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_love', name_en: "Love Badge", name_ar: "شارة حب", cost: 800, type: 'badges', preview: '�', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_pro', name_en: "Pro Badge", name_ar: "شارة �حترف", cost: 1500, type: 'badges', preview: '��', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_legend', name_en: "Legend Badge", name_ar: "شارة أسط�رة", cost: 5000, type: 'badges', preview: '�', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_star', name_en: "Star Badge", name_ar: "شارة �ج�", cost: 2000, type: 'badges', preview: '�', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_fire', name_en: "Fire Badge", name_ar: "شارة �ار", cost: 1200, type: 'badges', preview: '�', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_ice', name_en: "Ice Badge", name_ar: "شارة ج��د", cost: 1200, type: 'badges', preview: '�️', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_diamond', name_en: "Diamond Badge", name_ar: "شارة �اسة", cost: 3000, type: 'badges', preview: '', imageUrl: 'https://i.ibb.co/ZR2rv0s3/awaw.png' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // ���� UNCOMMON BADGES ����
        { id: 'badge_leaf', name_en: "Leaf Badge", name_ar: "شارة ا��ر�ة", cost: 90, type: 'badges', rarity: 'Uncommon', preview: '�', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // ���� FunPass Exclusive Badges � hidden in shop ����
        { id: 'fp_badge_rookie',   name_en: "Rookie Badge",   name_ar: "شارة �بتدئ",       cost: 0, type: 'badges', rarity: 'Common',    preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_speed',    name_en: "Speed Badge",    name_ar: "شارة ا�سرعة",      cost: 0, type: 'badges', rarity: 'Common',    preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_diamond',  name_en: "Diamond Badge",  name_ar: "شارة أ��اس",       cost: 0, type: 'badges', rarity: 'Epic',      preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_fire',     name_en: "Fire Badge",     name_ar: "شارة ا��ار",       cost: 0, type: 'badges', rarity: 'Epic',      preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_sniper',   name_en: "Sniper Badge",   name_ar: "شارة ا���اص",      cost: 0, type: 'badges', rarity: 'Epic',      preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_legend',   name_en: "Legend Badge",   name_ar: "شارة أسط�ر�ة",     cost: 0, type: 'badges', rarity: 'Legendary', preview: '⭐', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_galaxy',   name_en: "Galaxy Badge",   name_ar: "شارة ا��جرة",      cost: 0, type: 'badges', rarity: 'Legendary', preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_gold',     name_en: "Gold Badge",     name_ar: "شارة ذ�ب�ة",       cost: 0, type: 'badges', rarity: 'Legendary', preview: '��', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_thunder',  name_en: "Thunder Badge",  name_ar: "شارة ا�رعد",       cost: 0, type: 'badges', rarity: 'Legendary', preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_mystic',   name_en: "Mystic Badge",   name_ar: "شارة غا�ضة",       cost: 0, type: 'badges', rarity: 'Legendary', preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_blast',    name_en: "Blast Badge",    name_ar: "شارة ا�ا�فجار",    cost: 0, type: 'badges', rarity: 'Legendary', preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_dark',     name_en: "Dark Badge",     name_ar: "شارة ا�ظ�ا�",      cost: 0, type: 'badges', rarity: 'Legendary', preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_arrow',    name_en: "Arrow Badge",    name_ar: "شارة ا�س��",       cost: 0, type: 'badges', rarity: 'Legendary', preview: '���', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_prism',    name_en: "Prism Badge",    name_ar: "شارة ا���ش�ر",     cost: 0, type: 'badges', rarity: 'Mythic',    preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_void',     name_en: "Void Badge",     name_ar: "شارة ا�فراغ",      cost: 0, type: 'badges', rarity: 'Mythic',    preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_phoenix',  name_en: "Phoenix Badge",  name_ar: "شارة ا�ف����س",    cost: 0, type: 'badges', rarity: 'Mythic',    preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_nova',     name_en: "Nova Badge",     name_ar: "شارة ا��ج� ا��تفجر", cost: 0, type: 'badges', rarity: 'Mythic', preview: '�', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
    ],
    themes: [
        { id: 'theme_dark', name_en: "Midnight", name_ar: "��تصف ا����", cost: 200, type: 'themes' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'theme_ocean', name_en: "Ocean Blue", name_ar: "أزر� �ح�ط�", cost: 300, type: 'themes' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
    ],
    profileEffects: [
        { id: 'effect_sakura', name_en: "Sakura Petals", name_ar: "ز��ر ا��رز",  cost: 300,  type: 'profileEffects', rarity: 'Rare',      preview: '�', particles: [{emoji:'�',count:12},{emoji:'�',count:8}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_hearts', name_en: "Heart Shower",  name_ar: "دش ا����ب",   cost: 300,  type: 'profileEffects', rarity: 'Rare',      preview: '�', particles: [{emoji:'�',count:12},{emoji:'�',count:10},{emoji:'❤️',count:8}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_stars',  name_en: "Star Burst",    name_ar: "ا�فجار �ج��", cost: 300, type: 'profileEffects', rarity: 'Rare',      preview: '⭐', particles: [{emoji:'⭐',count:10},{emoji:'�',count:14},{emoji:'�',count:8}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_fire',   name_en: "Fire Storm",    name_ar: "عاصفة �ار�ة", cost: 300, type: 'profileEffects', rarity: 'Rare',      preview: '�', particles: [{emoji:'�',count:15},{emoji:'�',count:6}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_ghost',  name_en: "Ghost Mode",    name_ar: "�ضع ا�شبح",   cost: 300, type: 'profileEffects', rarity: 'Rare',      preview: '�', particles: [{emoji:'�',count:8},{emoji:'�',count:6},{emoji:'�️',count:8}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_money',  name_en: "Money Rain",    name_ar: "�طر ا�أ��ا�", cost: 300, type: 'profileEffects', rarity: 'Rare', preview: '�', particles: [{emoji:'�',count:10},{emoji:'�',count:12},{emoji:'�',count:8}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_crown',  name_en: "Royal Crown",   name_ar: "تاج ����",    cost: 300, type: 'profileEffects', rarity: 'Rare', preview: '�', particles: [{emoji:'�',count:6},{emoji:'�',count:8},{emoji:'�',count:12}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_galaxy', name_en: "Galaxy",        name_ar: "�جرة",        cost: 300, type: 'profileEffects', rarity: 'Rare',    preview: '�', particles: [{emoji:'�',count:8},{emoji:'�',count:10},{emoji:'�',count:6},{emoji:'⭐',count:8}], duration: 2500 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_gif', name_en: "SuperGirl",  name_ar: "س�بر ج�ر�",  cost: 3000, type: 'profileEffects', rarity: 'Mythic',    preview: 'https://s13.gifyu.com/images/bmv39.gif', imageUrl: 'https://s13.gifyu.com/images/bmv39.gif', particles: [], duration: 2, loopEvery: 9999999, displayDuration: 2000, showOnce: true, opacity: 0.82, blendMode: 'overlay', hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 3, season: null, maxSendOptions: null },
        { id: 'effect_gif2', name_en: "Glow Burst",      name_ar: "��ضة ����",    cost: 3500, type: 'profileEffects', rarity: 'Mythic',    preview: 'https://s13.gifyu.com/images/bmvMv.gif', imageUrl: 'https://s13.gifyu.com/images/bmvMv.gif', particles: [], duration: 2, loopEvery: 9999999, displayDuration: 2000, showOnce: true, opacity: 0.88, blendMode: 'screen', hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 3, season: null, maxSendOptions: null },
        { id: 'effect_gif3', name_en: "Aura Pulse",      name_ar: "�بضة ا�أ�را",  cost: 3500, type: 'profileEffects', rarity: 'Mythic',    preview: 'https://s13.gifyu.com/images/bmvMm.gif', imageUrl: 'https://s13.gifyu.com/images/bmvMm.gif', particles: [], duration: 2, loopEvery: 9999999, displayDuration: 2000, showOnce: true, opacity: 0.88, blendMode: 'screen', hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 3, season: null, maxSendOptions: null },
        { id: 'Volcano_Woman', name_en: "Volcano Woman",      name_ar: "ا�را� ا�بر�ا�",  cost: 3500, type: 'profileEffects', rarity: 'Mythic',    preview: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/main/icos/profileEffects/Volcano%20Woman.gif', imageUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/main/icos/profileEffects/Volcano%20Woman.gif', particles: [], duration: 2, loopEvery: 9999999, displayDuration: 2000, showOnce: true, opacity: 0.88, blendMode: 'screen', hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 3, season: null, maxSendOptions: null },
        { id: 'fire_Woman', name_en: "fire Woman",      name_ar: "ا�رأة ا��ار",  cost: 3500, type: 'profileEffects', rarity: 'Mythic',    preview: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/main/icos/profileEffects/fire%20Woman.gif', imageUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/main/icos/profileEffects/fire%20Woman.gif', particles: [], duration: 2, loopEvery: 9999999, displayDuration: 2000, showOnce: true, opacity: 0.88, blendMode: 'screen', hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 3, season: null, maxSendOptions: null },
        { id: 'lightning_woman', name_en: "lightning woman",      name_ar: "ا�رأة ا�بر�",  cost: 3500, type: 'profileEffects', rarity: 'Mythic',    preview: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/main/icos/profileEffects/lightning%20woman.gif', imageUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/main/icos/profileEffects/lightning%20woman.gif', particles: [], duration: 2, loopEvery: 9999999, displayDuration: 2000, showOnce: true, opacity: 0.88, blendMode: 'screen', hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 3, season: null, maxSendOptions: null },

    ],
    // � BFF TOKENS � purchased to create relationships
    bff_tokens: [], // populated from BFF_TOKEN_ITEMS in 01-config.js at runtime
    // ������������������������������������������������������������������������
    // �� GIFTS SYSTEM � v3 (30-Day Expiry Edition)
    // ������������������������������������������������������������������������
    //
    // � ا���اعد ا�أساس�ة (�� ا�ص�ر):
    //    � charisma   = cost ÷ 5         (�� 5 ج��د = 1 �ار�ز�ا)
    //    � maxBonus   = cost � 5         (ا��ست�� �حص� حت� 5� ���ة ا��د�ة)
    //    � ب��ص ف�ط �� cost � 100       (أ�� �� 100 �ا ��جد �رد�د ����)
    //    � vipXP      = max(1, charisma ÷ 20)
    //    � durationDays: 30              (�� ا��دا�ا ت�ت�� بعد 30 ���)
    //    � maxSendOptions: [1,3,5,10]   (خ�ارات ا�إرسا� ا��تعدد)
    //
    // �� �ظا� ا��ج�� (Stars):
    //    � 1-9 �دا�ا �ست��ة  � ⭐ 1 �ج�ة
    //    � 10-29             � ⭐⭐ 2 �ج��
    //    � 30+               � ⭐⭐⭐ 3 �ج��
    // ������������������������������������������������������������������������
    gifts: [

        // �� � Common � بد�� �رد�د ���� (cost < 100) ����������������������
        { id: 'gift_rose',     name_en: "Rose",        name_ar: "�ردة",       cost: 10,   type: 'gifts', charisma: 2,    vipXP: 1,   minBonus: 0, maxBonus: 0,      desc_ar: "�ردة ج���ة تعب�ر ع� �شاعر�",     desc_en: "A beautiful rose to express your feelings",  emoji: "�", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_candy',    name_en: "Candy",       name_ar: "ح���",       cost: 20,   type: 'gifts', charisma: 4,    vipXP: 1,   minBonus: 0, maxBonus: 0,      desc_ar: "ح�ا�ة تُفرح ا���ب",               desc_en: "Sweetness that brightens the heart",          emoji: "���", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_teddy',    name_en: "Teddy Bear",  name_ar: "دب �اع�",    cost: 50,   type: 'gifts', charisma: 10,   vipXP: 1,   minBonus: 0, maxBonus: 0,      desc_ar: "دب �ط�� �اع� ���ء با�ح�ا�",       desc_en: "A soft teddy bear full of warmth",            emoji: "�", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },

        // �� � Uncommon � �رد�د حت� 5� (100 � cost < 500) ��������������
        { id: 'gift_coffee',   name_en: "Coffee",      name_ar: "���ة",       cost: 100,  type: 'gifts', charisma: 20,   vipXP: 1,   minBonus: 1, maxBonus: 500,    desc_ar: "���ة صباح�ة تشح� طا�ت�",         desc_en: "Morning coffee to charge your energy",        emoji: "�", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_cake',     name_en: "Cake",        name_ar: "���ة",       cost: 200,  type: 'gifts', charisma: 40,   vipXP: 2,   minBonus: 1, maxBonus: 1000,   desc_ar: "���ة ��احتفا� با���اسبات",        desc_en: "A cake for every celebration",                emoji: "�", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_heart',    name_en: "Heart",       name_ar: "��ب",        cost: 300,  type: 'gifts', charisma: 60,   vipXP: 3,   minBonus: 1, maxBonus: 1500,   desc_ar: "��ب �ح�� �بض ا��حبة",             desc_en: "A heart that carries the pulse of love",      emoji: "❤️", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },

        // �� � Rare � �رد�د حت� 5� (500 � cost < 2000) �����������������
        { id: 'gift_crown',    name_en: "Crown",       name_ar: "تاج",        cost: 500,  type: 'gifts', charisma: 100,  vipXP: 5,   minBonus: 1, maxBonus: 2500,   desc_ar: "تاج ���� �ُت�ِ�ج ا��ار�ز�ا",     desc_en: "A royal crown that tops your charisma",       emoji: "�", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_rocket',   name_en: "Rocket",      name_ar: "صار�خ",      cost: 1000, type: 'gifts', charisma: 200,  vipXP: 10,  minBonus: 1, maxBonus: 5000,   desc_ar: "صار�خ ��ط�� ب� �ح� ا��ج��",       desc_en: "A rocket that launches you to the stars",     emoji: "�", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_crystal',  name_en: "Crystal",     name_ar: "�ر�ستا�",    cost: 1500, type: 'gifts', charisma: 300,  vipXP: 15,  minBonus: 1, maxBonus: 7500,   desc_ar: "�ر�ستا� �ادر �ض�ء طر���",         desc_en: "A rare crystal that lights your path",        emoji: "�", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },

        // �� � Epic � �رد�د حت� 5� (2000 � cost < 10000) ���������������
        { id: 'gift_racecar',  name_en: "Race Car",    name_ar: "س�ارة سبا�", cost: 2000, type: 'gifts', charisma: 400,  vipXP: 20,  minBonus: 1, maxBonus: 10000,  desc_ar: "س�ارة سبا� فار�ة ���خبة",         desc_en: "A racing car for the elite",                  emoji: "��️", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_castle',   name_en: "Castle",      name_ar: "�صر",        cost: 5000, type: 'gifts', charisma: 1000, vipXP: 50,  minBonus: 1, maxBonus: 25000,  desc_ar: "�صر ���� فخ� ��� �ستح�",         desc_en: "A luxury palace for those who deserve it",    emoji: "���", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_yacht',    name_en: "Yacht",       name_ar: "�خت",        cost: 8000, type: 'gifts', charisma: 1600, vipXP: 80,  minBonus: 1, maxBonus: 40000,  desc_ar: "�خت فاخر ف� بحر ا��ار�ز�ا",       desc_en: "A luxury yacht in the sea of charisma",       emoji: "�️", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },

        // �� ⭐ Legendary � �رد�د حت� 5� (10000 � cost < 50000) ����������
        { id: 'gift_jet',      name_en: "Private Jet", name_ar: "طائرة خاصة", cost: 10000, type: 'gifts', charisma: 2000, vipXP: 100, minBonus: 1, maxBonus: 50000,  desc_ar: "طائرة خاصة تح��� ف� س�اء ا��ار�ز�ا", desc_en: "A private jet soaring in charisma skies", emoji: "�️", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_planet',   name_en: "Planet",      name_ar: "���ب",       cost: 25000, type: 'gifts', charisma: 5000, vipXP: 250, minBonus: 1, maxBonus: 125000, desc_ar: "���ب �ا�� �ُ�د� إ���",             desc_en: "An entire planet gifted to you",              emoji: "�", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },

        // �� � Mythic � �رد�د حت� 5� (cost � 50000) ���������������������
        { id: 'gift_universe', name_en: "Universe",    name_ar: "���",        cost: 50000,  type: 'gifts', charisma: 10000, vipXP: 500,  minBonus: 1, maxBonus: 250000,  desc_ar: "��� بأ���� ���� �حد�",            desc_en: "An entire universe that belongs to you",      emoji: "�", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_ultimate', name_en: "Ultimate",    name_ar: "ا��د�ة ا��ط��ة", cost: 100000, type: 'gifts', charisma: 20000, vipXP: 1000, minBonus: 1, maxBonus: 500000, desc_ar: "أعظ� �د�ة ع�� �ج� ا�أرض",         desc_en: "The greatest gift that ever existed",         emoji: "��", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_ring',     name_en: "Diamond Ring",name_ar: "خات� أ��اس", cost: 100000, type: 'gifts', charisma: 20000, vipXP: 1000, minBonus: 1, maxBonus: 500000, desc_ar: "خات� ا��ار�ز�ا ا��ادر �� ا�جاتشا",       desc_en: "Rare charisma ring from Gacha",               emoji: "��", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },

        // �� � FunPass Exclusive (hidden in shop, accessible via FunPass) �
        { id: 'gift_fp_lucky',   name_en: "Lucky Clover",  name_ar: "ا�برس�� ا��حظ�ظ", cost: 500,  type: 'gifts', charisma: 100, vipXP: 5,  minBonus: 1, maxBonus: 2500, desc_ar: "�د�ة FunPass حصر�ة ��", desc_en: "Exclusive FunPass gift ��", emoji: "��", imageUrl: "", hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_fp_crystal', name_en: "FP Crystal",    name_ar: "�ر�ستا� FunPass", cost: 1200, type: 'gifts', charisma: 240, vipXP: 12, minBonus: 1, maxBonus: 6000, desc_ar: "�د�ة FunPass �ادرة �",  desc_en: "Rare FunPass gift �",    emoji: "�", imageUrl: "", hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
    ],

    // ������������������������������������������������������������������������
    // � VIP EXCLUSIVE GIFTS
    // ������������������������������������������������������������������������
    // �فس �عاد�ة ا��ار�ز�ا: charisma = cost ÷ 5 | maxBonus = cost � 5
    // vipGlowType: null | 'aurora' | 'inferno' | 'cosmic' | 'godlike'
    // ������������������������������������������������������������������������
    gifts_vip: [
        // VIP 1+ �����������������������������������������������������������
        { id: 'vgift_vip_star',    name_en: "VIP Star",    name_ar: "�ج�ة VIP",       cost: 500,    type: 'gifts_vip', charisma: 100,   vipXP: 5,    minBonus: 1, maxBonus: 2500,   desc_ar: "�ج�ة ذ�ب�ة حصر�ة �أعضاء VIP",         desc_en: "Exclusive gold star for VIP members",    emoji: "⭐", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, vipMinLevel: 1,  vipExclusive: true, vipGlowType: null     },
        // VIP 3+ �����������������������������������������������������������
        { id: 'vgift_vip_diamond', name_en: "VIP Diamond", name_ar: "�اسة VIP",       cost: 2000,   type: 'gifts_vip', charisma: 400,   vipXP: 20,   minBonus: 1, maxBonus: 10000,  desc_ar: "�اسة بر�� حصر� �� VIP 3 فأ�ثر",       desc_en: "Diamond exclusively for VIP 3+",         emoji: "�", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, vipMinLevel: 3,  vipExclusive: true, vipGlowType: null     },
        // VIP 5+ �����������������������������������������������������������
        { id: 'vgift_vip_dragon',  name_en: "VIP Dragon",  name_ar: "ت��� VIP",       cost: 5000,   type: 'gifts_vip', charisma: 1000,  vipXP: 50,   minBonus: 1, maxBonus: 25000,  desc_ar: "ت��� أسط�ر� حصر� �� VIP 5 فأ�ثر",     desc_en: "Legendary dragon for VIP 5+",            emoji: "�", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, vipMinLevel: 5,  vipExclusive: true, vipGlowType: null     },
        // VIP 7 � Aurora ���������������������������������������������������
        { id: 'vgift_aurora',      name_en: "Aurora",      name_ar: "�د�ة ا�أ�ر�را",  cost: 10000,  type: 'gifts_vip', charisma: 2000,  vipXP: 100,  minBonus: 1, maxBonus: 50000,  desc_ar: "أض�اء ا�شف� ا��طب� � حصر� VIP 7",     desc_en: "Northern lights power � VIP 7 only",     emoji: "�", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, vipMinLevel: 7,  vipExclusive: true, vipGlowType: 'aurora'  },
        // VIP 8 � Inferno ��������������������������������������������������
        { id: 'vgift_inferno',     name_en: "Inferno",     name_ar: "�د�ة ا�جح��",    cost: 20000,  type: 'gifts_vip', charisma: 4000,  vipXP: 200,  minBonus: 1, maxBonus: 100000, desc_ar: "�ار ج��� ا��شتع�ة � حصر� VIP 8",       desc_en: "Hellfire blazing � VIP 8 only",           emoji: "�", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, vipMinLevel: 8,  vipExclusive: true, vipGlowType: 'inferno' },
        // VIP 9 � Cosmic ���������������������������������������������������
        { id: 'vgift_cosmic',      name_en: "Cosmic",      name_ar: "�د�ة ا����",     cost: 50000,  type: 'gifts_vip', charisma: 10000, vipXP: 500,  minBonus: 1, maxBonus: 250000, desc_ar: "��ة ا���� ا��ط��ة � حصر� VIP 9",       desc_en: "Absolute cosmic power � VIP 9 only",     emoji: "�", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, vipMinLevel: 9,  vipExclusive: true, vipGlowType: 'cosmic'  },
        // VIP 10 � Godlike �������������������������������������������������
        { id: 'vgift_godlike',     name_en: "Godlike",     name_ar: "�د�ة ا�إ��",     cost: 100000, type: 'gifts_vip', charisma: 20000, vipXP: 1000, minBonus: 1, maxBonus: 500000, desc_ar: "أعظ� �د�ة ع�� ا�إط�ا� � حصر� VIP 10", desc_en: "The greatest gift ever � VIP 10 only",   emoji: "�", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, vipMinLevel: 10, vipExclusive: true, vipGlowType: 'godlike' },
    ],

    // ������������������������������������������������������������������������
    // ��� FAMILY GIFTS � 5 �دا�ا حصر�ة ��أعضاء ف� �ب��ة
    // ������������������������������������������������������������������������
    // familyMinLevel: ا�حد ا�أد�� ��ست�� ا��ب��ة ا��ط��ب
    // ������������������������������������������������������������������������
    gifts_family: [
        { id: 'fgift_emblem',   name_en: "Clan Emblem",   name_ar: "شعار ا��ب��ة",  cost: 800,   type: 'gifts_family', charisma: 160,  vipXP: 8,   minBonus: 1, maxBonus: 4000,  desc_ar: "شعار �ب��ت� ا�فخ�ر",        desc_en: "Your clan's proud emblem",         emoji: "���", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10], familyMinLevel: 1  },
        { id: 'fgift_sword',    name_en: "Clan Sword",    name_ar: "س�ف ا��ب��ة",   cost: 1500,  type: 'gifts_family', charisma: 300,  vipXP: 15,  minBonus: 1, maxBonus: 7500,  desc_ar: "س�ف ا��حارب�� ا�أشداء",     desc_en: "The sword of mighty warriors",     emoji: "�️", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10], familyMinLevel: 2  },
        { id: 'fgift_shield',   name_en: "Guardian Shield",name_ar: "درع ا�حراسة", cost: 3000,  type: 'gifts_family', charisma: 600,  vipXP: 30,  minBonus: 1, maxBonus: 15000, desc_ar: "درع ا�ح�ا�ة ا�ف��اذ�",      desc_en: "The steel guardian shield",        emoji: "�️", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10], familyMinLevel: 4  },
        { id: 'fgift_throne',   name_en: "Clan Throne",   name_ar: "عرش ا��ب��ة",   cost: 6000,  type: 'gifts_family', charisma: 1200, vipXP: 60,  minBonus: 1, maxBonus: 30000, desc_ar: "عرش ا����� �ا�أبطا�",       desc_en: "The throne of kings and champions", emoji: "�", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10], familyMinLevel: 6  },
        { id: 'fgift_legend',   name_en: "Clan Legend",   name_ar: "أسط�رة ا��ب��ة", cost: 12000, type: 'gifts_family', charisma: 2400, vipXP: 120, minBonus: 1, maxBonus: 60000, desc_ar: "أسط�رة �ا تُ�س� ف� تار�خ ا��ب��ة", desc_en: "A legend never forgotten in clan history", emoji: "�", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10], familyMinLevel: 8  },
    ],

    // ������������������������������������������������������������������������
    // � SPECIAL GIFTS � �دا�ا سب�ش�ا� ب�ظا� ا��ا�ص�ب
    // ������������������������������������������������������������������������
    // specialType: 'lottery' | 'limited' | 'event'
    // possibleRewards: �صف�فة ا�ج�ائز ا�����ة �� ا��ا�ص�ب
    //   �� جائزة: { type: 'frame'|'badge'|'title'|'effect'|'currency', itemId?, amount?, durationDays?, chance }
    // ������������������������������������������������������������������������
    gifts_special: [
        {
            id: 'sgift_lucky_box', name_en: "Lucky Box",  name_ar: "ص�د�� ا�حظ",
            cost: 300, type: 'gifts_special', charisma: 60, vipXP: 3, minBonus: 1, maxBonus: 1500,
            desc_ar: "ص�د�� �ج��� ا��حت�� � أفتح� �ا�تظر ا��فاجأة!",
            desc_en: "Mystery box � open it and wait for the surprise!",
            emoji: "��", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, specialType: 'lottery',
            durationDays: 30, maxSendOptions: [1,3,5,10],
            possibleRewards: [
                { chance: 50, type: 'currency', amount: 200,       desc_en: '200 Intel',      desc_ar: '200 إ�ت�' },
                { chance: 25, type: 'currency', amount: 500,       desc_en: '500 Intel',      desc_ar: '500 إ�ت�' },
                { chance: 15, type: 'badge',    itemId: 'fp_badge_speed', durationDays: 7,  desc_en: 'Speed Badge 7d', desc_ar: 'شارة ا�سرعة 7 أ�ا�' },
                { chance: 8,  type: 'frame',    itemId: 'fp_frame_neon',  durationDays: 7,  desc_en: 'Neon Frame 7d',  desc_ar: 'إطار ���� 7 أ�ا�' },
                { chance: 2,  type: 'frame',    itemId: 'fp_frame_gold',  durationDays: 30, desc_en: 'Gold Frame 30d', desc_ar: 'إطار ذ�ب� 30 ���' },
            ]
        },
        {
            id: 'sgift_mystery_star', name_en: "Mystery Star", name_ar: "�ج�ة ا�غ��ض",
            cost: 800, type: 'gifts_special', charisma: 160, vipXP: 8, minBonus: 1, maxBonus: 4000,
            desc_ar: "�ج�ة سحر�ة �د ت��ح� إطارا� أ� شارة �ادرة",
            desc_en: "A magic star that may grant you a rare frame or badge",
            emoji: "⭐", imageUrl: "", hidden: false, isEvent: true, limitedTime: false, specialType: 'lottery',
            durationDays: 30, maxSendOptions: [1,3,5,10],
            possibleRewards: [
                { chance: 40, type: 'currency', amount: 500,        desc_en: '500 Intel',       desc_ar: '500 إ�ت�' },
                { chance: 25, type: 'badge',    itemId: 'fp_badge_diamond', durationDays: 14, desc_en: 'Diamond Badge 14d', desc_ar: 'شارة أ��اس 14 ���' },
                { chance: 20, type: 'frame',    itemId: 'fp_frame_crystal', durationDays: 14, desc_en: 'Crystal Frame 14d', desc_ar: 'إطار �ر�ستا� 14 ���' },
                { chance: 10, type: 'frame',    itemId: 'fp_frame_inferno', durationDays: 14, desc_en: 'Inferno Frame 14d', desc_ar: 'إطار ج��� 14 ���' },
                { chance: 5,  type: 'frame',    itemId: 'fp_frame_mythic',  durationDays: 7,  desc_en: 'Mythic Frame 7d',   desc_ar: 'إطار خراف� 7 أ�ا�' },
            ]
        },
        {
            id: 'sgift_rainbow_chest', name_en: "Rainbow Chest", name_ar: "ص�د�� ��س �زح",
            cost: 2000, type: 'gifts_special', charisma: 400, vipXP: 20, minBonus: 1, maxBonus: 10000,
            desc_ar: "ص�د�� ا�أ��ا� ا�سبعة � ج�ائز �ادرة با�تظار�",
            desc_en: "The seven-color chest � rare prizes await",
            emoji: "�", imageUrl: "", hidden: false, isEvent: false, limitedTime: true, specialType: 'lottery',
            durationDays: 30, maxSendOptions: [1,3,5,10],
            possibleRewards: [
                { chance: 30, type: 'currency',  amount: 1000,        desc_en: '1000 Intel',      desc_ar: '1000 إ�ت�' },
                { chance: 25, type: 'badge',     itemId: 'fp_badge_galaxy', durationDays: 30, desc_en: 'Galaxy Badge 30d', desc_ar: 'شارة ا��جرة 30 ���' },
                { chance: 20, type: 'frame',     itemId: 'fp_frame_rainbow', durationDays: 30, desc_en: 'Rainbow Frame 30d', desc_ar: 'إطار ��س �زح 30 ���' },
                { chance: 15, type: 'frame',     itemId: 'fp_frame_void',   durationDays: 14, desc_en: 'Void Frame 14d',   desc_ar: 'إطار ا�فراغ 14 ���' },
                { chance: 8,  type: 'frame',     itemId: 'fp_frame_phoenix', durationDays: 30, desc_en: 'Phoenix Frame 30d', desc_ar: 'إطار ا�ف����س 30 ���' },
                { chance: 2,  type: 'frame',     itemId: 'fp_frame_nova',    durationDays: 30, desc_en: 'Nova Frame 30d',   desc_ar: 'إطار ا��ج� 30 ���' },
            ]
        },
    ],

    // ������������������������������������������������������������������������
    // � FLAG GIFTS � �دا�ا ا�أع�ا� �ا�د��
    // ������������������������������������������������������������������������
    gifts_flag: [
        { id: 'flag_sa',  name_en: "Saudi Arabia",  name_ar: "ا�سع�د�ة",    cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "��", imageUrl: "", hidden: false, countryCode: 'SA', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_ae',  name_en: "UAE",            name_ar: "ا�إ�ارات",    cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "��", imageUrl: "", hidden: false, countryCode: 'AE', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_eg',  name_en: "Egypt",          name_ar: "�صر",         cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "��", imageUrl: "", hidden: false, countryCode: 'EG', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_kw',  name_en: "Kuwait",         name_ar: "ا����ت",      cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "��", imageUrl: "", hidden: false, countryCode: 'KW', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_qa',  name_en: "Qatar",          name_ar: "�طر",         cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "��", imageUrl: "", hidden: false, countryCode: 'QA', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_bh',  name_en: "Bahrain",        name_ar: "ا�بحر��",     cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "��", imageUrl: "", hidden: false, countryCode: 'BH', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_om',  name_en: "Oman",           name_ar: "عُ�ا�",       cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "��", imageUrl: "", hidden: false, countryCode: 'OM', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_jo',  name_en: "Jordan",         name_ar: "ا�أرد�",      cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "��", imageUrl: "", hidden: false, countryCode: 'JO', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_iq',  name_en: "Iraq",           name_ar: "ا�عرا�",      cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "��", imageUrl: "", hidden: false, countryCode: 'IQ', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_ma',  name_en: "Morocco",        name_ar: "ا��غرب",      cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "��", imageUrl: "", hidden: false, countryCode: 'MA', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_tn',  name_en: "Tunisia",        name_ar: "ت��س",        cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "��", imageUrl: "", hidden: false, countryCode: 'TN', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_ly',  name_en: "Libya",          name_ar: "��ب�ا",       cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "��", imageUrl: "", hidden: false, countryCode: 'LY', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_sy',  name_en: "Syria",          name_ar: "س�ر�ا",       cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "��", imageUrl: "", hidden: false, countryCode: 'SY', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_lb',  name_en: "Lebanon",        name_ar: "�ب�ا�",       cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "��", imageUrl: "", hidden: false, countryCode: 'LB', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_ps',  name_en: "Palestine",      name_ar: "ف�سط��",      cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "��", imageUrl: "", hidden: false, countryCode: 'PS', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_tr',  name_en: "Turkey",         name_ar: "تر��ا",       cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "��", imageUrl: "", hidden: false, countryCode: 'TR', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_us',  name_en: "USA",            name_ar: "أ�ر��ا",      cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "��", imageUrl: "", hidden: false, countryCode: 'US', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_gb',  name_en: "UK",             name_ar: "بر�طا��ا",    cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "��", imageUrl: "", hidden: false, countryCode: 'GB', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_de',  name_en: "Germany",        name_ar: "أ��ا��ا",     cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "��", imageUrl: "", hidden: false, countryCode: 'DE', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_fr',  name_en: "France",         name_ar: "فر�سا",       cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "��", imageUrl: "", hidden: false, countryCode: 'FR', durationDays: 30, maxSendOptions: [1,3,5,10] },
    ]
};

// � GIFT RARITY SYSTEM
var ARITY_CONFIG = {
    Common:       { name_en: 'Common',       name_ar: 'عاد�',          color: '#9ca3af', bg: 'rgba(156,163,175,0.07)', border: 'rgba(156,163,175,0.25)', glow: false, icon: '�', order: 0 },
    Uncommon:     { name_en: 'Uncommon',     name_ar: 'غ�ر شائع',      color: '#4ade80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.35)',  glow: false, icon: '�', order: 1 },
    Rare:         { name_en: 'Rare',         name_ar: '�ادر',          color: '#60a5fa', bg: 'rgba(96,165,250,0.09)',  border: 'rgba(96,165,250,0.40)',  glow: false, icon: '�', order: 2 },
    Epic:         { name_en: 'Epic',         name_ar: '��ح��',         color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)',  border: 'rgba(139,92,246,0.45)',  glow: false, icon: '�', order: 3 },
    Legendary:    { name_en: 'Legendary',    name_ar: 'أسط�ر�',        color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.50)',  glow: true,  icon: '⭐', order: 4 },
    Mythic:       { name_en: 'Mythic',       name_ar: 'خراف�',         color: '#ff0055', bg: 'rgba(255,0,85,0.12)',    border: 'rgba(255,0,85,0.60)',    glow: true,  icon: '�', order: 5, special: true },
    // �� 4 TIERS BEYOND MYTHIC ��
    Artifact:     { name_en: 'Artifact',     name_ar: 'أثر�',          color: '#c2410c', bg: 'rgba(194,65,12,0.12)',   border: 'rgba(194,65,12,0.65)',   glow: true,  icon: '���', order: 6, special: true, cssClass: 'rarity-artifact'     },
    Transcendent: { name_en: 'Transcendent', name_ar: '�تجا�ز',        color: '#c026d3', bg: 'rgba(192,38,211,0.13)',  border: 'rgba(192,38,211,0.70)',  glow: true,  icon: '�', order: 7, special: true, cssClass: 'rarity-transcendent' },
    Immortal:     { name_en: 'Immortal',     name_ar: 'خا�د',          color: '#e2e8f0', bg: 'rgba(226,232,240,0.10)', border: 'rgba(226,232,240,0.70)', glow: true,  icon: '�', order: 8, special: true, cssClass: 'rarity-immortal'     },
    Divine:       { name_en: 'Divine',       name_ar: 'إ���',          color: '#00d4ff', bg: 'rgba(0,212,255,0.10)',   border: 'rgba(0,212,255,0.75)',   glow: true,  icon: '�', order: 9, special: true, cssClass: 'rarity-divine'       },
};

var etItemRarity = (item) => {
    if (!item) return 'Common';
    if (item.rarity) return item.rarity;
    const cost = item.cost || 0;
    if (cost >= 5000) return 'Mythic';
    if (cost >= 500)  return 'Legendary';
    if (cost >= 100)  return 'Epic';
    return 'Common';
};

var etGiftRarity = (cost) => {
    if (cost >= 10000) return 'Mythic';
    if (cost >= 500)   return 'Legendary';
    if (cost >= 50)    return 'Epic';
    if (cost >= 15)    return 'Uncommon';
    return 'Common';
};

// �� ACHIEVEMENTS SYSTEM � Leveled (4 tiers per group)
// tier 1: Bronze/Normal | tier 2: Silver/Natural | tier 3: Red/Legendary | tier 4: Multi-color Glow/Ultimate
var CHIEVEMENTS = [

    // �� �� GIFTS RECEIVED ��
    { id: 'ach_recv_1', group: 'gifts_recv', tier: 1, nameKey: 'achRecv1', descKey: 'achRecv1Desc', icon: '��', imageUrl: '', condition: { type: 'gifts_received', value: 1 } },
    { id: 'ach_recv_2', group: 'gifts_recv', tier: 2, nameKey: 'achRecv2', descKey: 'achRecv2Desc', icon: '�', imageUrl: '', condition: { type: 'gifts_received', value: 50 } },
    { id: 'ach_recv_3', group: 'gifts_recv', tier: 3, nameKey: 'achRecv3', descKey: 'achRecv3Desc', icon: '�', imageUrl: '', condition: { type: 'gifts_received', value: 200 } },
    { id: 'ach_recv_4', group: 'gifts_recv', tier: 4, nameKey: 'achRecv4', descKey: 'achRecv4Desc', icon: '�', imageUrl: '', condition: { type: 'gifts_received', value: 500 } },

    // �� � GIFTS SENT ��
    { id: 'ach_sent_1', group: 'gifts_sent', tier: 1, nameKey: 'achSent1', descKey: 'achSent1Desc', icon: '�', imageUrl: '', condition: { type: 'gifts_sent', value: 10 } },
    { id: 'ach_sent_2', group: 'gifts_sent', tier: 2, nameKey: 'achSent2', descKey: 'achSent2Desc', icon: '�', imageUrl: '', condition: { type: 'gifts_sent', value: 50 } },
    { id: 'ach_sent_3', group: 'gifts_sent', tier: 3, nameKey: 'achSent3', descKey: 'achSent3Desc', icon: '��', imageUrl: '', condition: { type: 'gifts_sent', value: 150 } },
    { id: 'ach_sent_4', group: 'gifts_sent', tier: 4, nameKey: 'achSent4', descKey: 'achSent4Desc', icon: '�', imageUrl: '', condition: { type: 'gifts_sent', value: 500 } },

    // �� � GAMES PLAYED ��
    { id: 'ach_games_1', group: 'games_played', tier: 1, nameKey: 'achGames1', descKey: 'achGames1Desc', icon: '�', imageUrl: '', condition: { type: 'games_played', value: 10 } },
    { id: 'ach_games_2', group: 'games_played', tier: 2, nameKey: 'achGames2', descKey: 'achGames2Desc', icon: '�️', imageUrl: '', condition: { type: 'games_played', value: 50 } },
    { id: 'ach_games_3', group: 'games_played', tier: 3, nameKey: 'achGames3', descKey: 'achGames3Desc', icon: '⭐', imageUrl: '', condition: { type: 'games_played', value: 200 } },
    { id: 'ach_games_4', group: 'games_played', tier: 4, nameKey: 'achGames4', descKey: 'achGames4Desc', icon: '��', imageUrl: '', condition: { type: 'games_played', value: 500 } },

    // �� �� WINS ��
    { id: 'ach_wins_1', group: 'wins', tier: 1, nameKey: 'achWins1', descKey: 'achWins1Desc', icon: '��', imageUrl: '', condition: { type: 'wins', value: 5 } },
    { id: 'ach_wins_2', group: 'wins', tier: 2, nameKey: 'achWins2', descKey: 'achWins2Desc', icon: '�', imageUrl: '', condition: { type: 'wins', value: 25 } },
    { id: 'ach_wins_3', group: 'wins', tier: 3, nameKey: 'achWins3', descKey: 'achWins3Desc', icon: '�', imageUrl: '', condition: { type: 'wins', value: 100 } },
    { id: 'ach_wins_4', group: 'wins', tier: 4, nameKey: 'achWins4', descKey: 'achWins4Desc', icon: '�', imageUrl: '', condition: { type: 'wins', value: 300 } },

    // �� � WIN STREAK ��
    { id: 'ach_streak_1', group: 'win_streak', tier: 1, nameKey: 'achStreak1', descKey: 'achStreak1Desc', icon: '�', imageUrl: '', condition: { type: 'win_streak', value: 3 } },
    { id: 'ach_streak_2', group: 'win_streak', tier: 2, nameKey: 'achStreak2', descKey: 'achStreak2Desc', icon: '�', imageUrl: '', condition: { type: 'win_streak', value: 5 } },
    { id: 'ach_streak_3', group: 'win_streak', tier: 3, nameKey: 'achStreak3', descKey: 'achStreak3Desc', icon: '�', imageUrl: '', condition: { type: 'win_streak', value: 10 } },
    { id: 'ach_streak_4', group: 'win_streak', tier: 4, nameKey: 'achStreak4', descKey: 'achStreak4Desc', icon: '�️', imageUrl: '', condition: { type: 'win_streak', value: 20 } },

    // �� �️ SPY WINS ��
    { id: 'ach_spy_1', group: 'spy_wins', tier: 1, nameKey: 'achSpy1', descKey: 'achSpy1Desc', icon: '�️', imageUrl: '', condition: { type: 'spy_wins', value: 1 } },
    { id: 'ach_spy_2', group: 'spy_wins', tier: 2, nameKey: 'achSpy2', descKey: 'achSpy2Desc', icon: '�', imageUrl: '', condition: { type: 'spy_wins', value: 10 } },
    { id: 'ach_spy_3', group: 'spy_wins', tier: 3, nameKey: 'achSpy3', descKey: 'achSpy3Desc', icon: '�', imageUrl: '', condition: { type: 'spy_wins', value: 30 } },
    { id: 'ach_spy_4', group: 'spy_wins', tier: 4, nameKey: 'achSpy4', descKey: 'achSpy4Desc', icon: '�', imageUrl: '', condition: { type: 'spy_wins', value: 75 } },

    // �� � AGENT WINS ��
    { id: 'ach_agent_1', group: 'agent_wins', tier: 1, nameKey: 'achAgent1', descKey: 'achAgent1Desc', icon: '�', imageUrl: '', condition: { type: 'agent_wins', value: 1 } },
    { id: 'ach_agent_2', group: 'agent_wins', tier: 2, nameKey: 'achAgent2', descKey: 'achAgent2Desc', icon: '�️', imageUrl: '', condition: { type: 'agent_wins', value: 10 } },
    { id: 'ach_agent_3', group: 'agent_wins', tier: 3, nameKey: 'achAgent3', descKey: 'achAgent3Desc', icon: '�️', imageUrl: '', condition: { type: 'agent_wins', value: 30 } },
    { id: 'ach_agent_4', group: 'agent_wins', tier: 4, nameKey: 'achAgent4', descKey: 'achAgent4Desc', icon: '��️', imageUrl: '', condition: { type: 'agent_wins', value: 75 } },

    // �� � FRIENDS ��
    { id: 'ach_friends_1', group: 'friends', tier: 1, nameKey: 'achFriends1', descKey: 'achFriends1Desc', icon: '�', imageUrl: '', condition: { type: 'friends', value: 5 } },
    { id: 'ach_friends_2', group: 'friends', tier: 2, nameKey: 'achFriends2', descKey: 'achFriends2Desc', icon: '⭐', imageUrl: '', condition: { type: 'friends', value: 15 } },
    { id: 'ach_friends_3', group: 'friends', tier: 3, nameKey: 'achFriends3', descKey: 'achFriends3Desc', icon: '�', imageUrl: '', condition: { type: 'friends', value: 30 } },
    { id: 'ach_friends_4', group: 'friends', tier: 4, nameKey: 'achFriends4', descKey: 'achFriends4Desc', icon: '�', imageUrl: '', condition: { type: 'friends', value: 75 } },

    // �� � LOGIN STREAK (consecutive days) ��
    { id: 'ach_login_str_1', group: 'login_streak', tier: 1, nameKey: 'achLoginStr1', descKey: 'achLoginStr1Desc', icon: '�', imageUrl: '', condition: { type: 'login_streak', value: 7 } },
    { id: 'ach_login_str_2', group: 'login_streak', tier: 2, nameKey: 'achLoginStr2', descKey: 'achLoginStr2Desc', icon: '�', imageUrl: '', condition: { type: 'login_streak', value: 30 } },
    { id: 'ach_login_str_3', group: 'login_streak', tier: 3, nameKey: 'achLoginStr3', descKey: 'achLoginStr3Desc', icon: '�️', imageUrl: '', condition: { type: 'login_streak', value: 100 } },
    { id: 'ach_login_str_4', group: 'login_streak', tier: 4, nameKey: 'achLoginStr4', descKey: 'achLoginStr4Desc', icon: '�️', imageUrl: '', condition: { type: 'login_streak', value: 365 } },

    // �� � TOTAL LOGIN DAYS ��
    { id: 'ach_logins_1', group: 'total_logins', tier: 1, nameKey: 'achLogins1', descKey: 'achLogins1Desc', icon: '�', imageUrl: '', condition: { type: 'total_logins', value: 30 } },
    { id: 'ach_logins_2', group: 'total_logins', tier: 2, nameKey: 'achLogins2', descKey: 'achLogins2Desc', icon: '�', imageUrl: '', condition: { type: 'total_logins', value: 100 } },
    { id: 'ach_logins_3', group: 'total_logins', tier: 3, nameKey: 'achLogins3', descKey: 'achLogins3Desc', icon: '��', imageUrl: '', condition: { type: 'total_logins', value: 300 } },
    { id: 'ach_logins_4', group: 'total_logins', tier: 4, nameKey: 'achLogins4', descKey: 'achLogins4Desc', icon: '�', imageUrl: '', condition: { type: 'total_logins', value: 365 } },

    // �� ⭐ CHARISMA ��
    { id: 'ach_charisma_1', group: 'charisma', tier: 1, nameKey: 'achCharisma1', descKey: 'achCharisma1Desc', icon: '⭐', imageUrl: '', condition: { type: 'charisma', value: 10000 } },
    { id: 'ach_charisma_2', group: 'charisma', tier: 2, nameKey: 'achCharisma2', descKey: 'achCharisma2Desc', icon: '�', imageUrl: '', condition: { type: 'charisma', value: 100000 } },
    { id: 'ach_charisma_3', group: 'charisma', tier: 3, nameKey: 'achCharisma3', descKey: 'achCharisma3Desc', icon: '�', imageUrl: '', condition: { type: 'charisma', value: 500000 } },
    { id: 'ach_charisma_4', group: 'charisma', tier: 4, nameKey: 'achCharisma4', descKey: 'achCharisma4Desc', icon: '�', imageUrl: '', condition: { type: 'charisma', value: 1000000 } },
];

// --- Scenarios ---
var CENARIOS = [
    { loc_ar: "�حطة فضاء", words_ar: ["فضاء", "صار�خ", "zero-g", "��ر"], loc_en: "Space Station", words_en: ["Space", "Rocket", "Zero-g", "Moon"] },
    { loc_ar: "غ�اصة ����ة", words_ar: ["ع��", "�اء", "ضغط", "س��ار"], loc_en: "Nuclear Submarine", words_en: ["Depth", "Water", "Pressure", "Sonar"] },
    { loc_ar: "�صر ����", words_ar: ["تاج", "حراس", "عر�ش", "خد�"], loc_en: "Royal Palace", words_en: ["Crown", "Guards", "Throne", "Servants"] },
    { loc_ar: "ب�� �ر�ز�", words_ar: ["خز�ة", "�ا�", "رصاص", "�فتاح"], loc_en: "Central Bank", words_en: ["Vault", "Money", "Lead", "Key"] },
    { loc_ar: "�ستشف� ��ج�ر", words_ar: ["أشباح", "أطباء", "ظ�ا�", "ح��"], loc_en: "Abandoned Hospital", words_en: ["Ghosts", "Doctors", "Dark", "Syringe"] },
    { loc_ar: "�طار ����", words_ar: ["درجات", "تذا�ر", "���", "��ر"], loc_en: "Night Train", words_en: ["Bunks", "Tickets", "Sleep", "Aisle"] },
    { loc_ar: "جز�رة ��ز", words_ar: ["خر�طة", "حفر", "ذ�ب", "�راص�ة"], loc_en: "Treasure Island", words_en: ["Map", "Dig", "Gold", "Pirates"] },
    { loc_ar: "�ص�ع ر�ب�تات", words_ar: ["أس�ا�", "ص�ا�ة", "بر�جة", "�عاد�"], loc_en: "Robot Factory", words_en: ["Wires", "Maintenance", "Coding", "Metal"] }
];

// EMOJI CATEGORIES FOR PROFESSIONAL PICKER
var MOJI_CATEGORIES = {
    smiles: ['�', '�', '��', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�'],
    gestures: ['��️', '�', '�', '�', '�', '�', '�️', '�', '�', '�', '�', '�', '�', '�️', '�', '�', '�', '�', '�️', '�', '�', '�', '�', '�', '�', '��', '�', '�', '�', '��'],
    hearts: ['�', '❤️', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�'],
    objects: ['�', '⭐', '�', '�', '�', '�', '�', '��', '�', '�', '��', '�', '�', '�', '�', '��', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�'],
    nature: ['�', '�️', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�', '�️', '��', '���', '��', '��']
};

// --- Helper Functions ---
var ormatTime = (timestamp) => { if (!timestamp) return ''; const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp); return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
var ormatCharisma = (num) => { if (num === undefined || num === null) return '0'; if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'; if (num >= 1000) return (num / 1000).toFixed(1) + 'K'; return num.toString(); };
var askEmail = (email) => { if (!email) return 'N/A'; const [localPart, domain] = email.split('@'); if (!domain) return email; const visibleChars = Math.min(2, localPart.length); return localPart.substring(0, visibleChars) + '***@' + domain; };
// � SMART BONUS SYSTEM � ب��ص ذ�� �راع� ���ة ا��د�ة
// ������������������������������������������������������
// � BONUS_CONFIG � عد�� ا���� ��ا �ضبط ا�س���:
var ONUS_CONFIG = {
    // ا�أ�زا� ا�رئ�س�ة: [��خفض, �ت�سط, عا��, جا�ب�ت]
    // ا�ج�ع = 1.0  (�ث�ا�: 70% + 18% + 9% + 3% = 100%)
    ZONE_WEIGHTS: [0.70, 0.18, 0.09, 0.03],

    // �طا�ات �� ��ط�ة ��سبة �� maxBonus ا��عد���
    ZONE_RANGES: [
        [0.00, 0.08], // ��خفض: 0-8% �� maxBonus (70% �� ا���ت)
        [0.08, 0.22], // �ت�سط: 8-22% (18% �� ا���ت)
        [0.22, 0.50], // عا��: 22-50% (9% �� ا���ت)
        [0.50, 1.00], // � جا�ب�ت: 50-100% (3% ف�ط!)
    ],

    // س�ف ا�ب��ص بحسب فئة سعر ا��د�ة (��سبة �� maxBonus)
    // ���ا �ا�ت ا��د�ة أغ��� ���ا ����� ا�س�ف ا�طب�ع�
    GIFT_COST_CAP: [
        { maxCost: 20,    cap: 1.00 }, // رخ�صة جدا�: �ا�� maxBonus
        { maxCost: 100,   cap: 0.40 }, // رخ�صة: 40% ف�ط �� maxBonus
        { maxCost: 500,   cap: 0.25 }, // �ت�سطة: 25% ف�ط
        { maxCost: 2000,  cap: 0.15 }, // غا��ة: 15% ف�ط
        { maxCost: 10000, cap: 0.10 }, // غا��ة جدا�: 10% ف�ط
        { maxCost: Infinity, cap: 0.06 }, // أسط�ر�ة: 6% ف�ط
    ],

    // استث�اء ا�جا�ب�ت: �جتاز ا�س�ف دائ�ا�� (true = �ع�)
    JACKPOT_BYPASSES_CAP: true,
};

var enerateRandomBonus = (min, max, giftCost = 0) => {
    const { ZONE_WEIGHTS, ZONE_RANGES, GIFT_COST_CAP, JACKPOT_BYPASSES_CAP } = BONUS_CONFIG;

    // احسب ا�س�ف ب�اء� ع�� سعر ا��د�ة
    const capEntry = GIFT_COST_CAP.find(e => giftCost <= e.maxCost) || GIFT_COST_CAP[GIFT_COST_CAP.length - 1];
    const capFactor = capEntry.cap;

    // اخت�ار ا���ط�ة
    const r = Math.random();
    let zone = ZONE_WEIGHTS.length - 1;
    let cumulative = 0;
    for (let i = 0; i < ZONE_WEIGHTS.length; i++) {
        cumulative += ZONE_WEIGHTS[i];
        if (r < cumulative) { zone = i; break; }
    }

    const isJackpot = zone === ZONE_WEIGHTS.length - 1;
    const [lo, hi] = ZONE_RANGES[zone];

    // طب�� ا�س�ف ع�� ا�جا�ب�ت أ� �ا�
    const effectiveMax = (isJackpot && JACKPOT_BYPASSES_CAP)
        ? max
        : Math.max(min, Math.floor(max * capFactor));

    const range = effectiveMax - min;
    return Math.max(min, Math.min(effectiveMax, Math.floor(min + range * (lo + Math.random() * (hi - lo)))));
};

// --- Translations ---

