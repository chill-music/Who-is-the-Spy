// --- Global Configuration Constants ---
// This file contains shared constants for UI, Systems, and Features.
//
// NOTE: The live browser app does NOT load this file. Entry HTML uses src/01-config.js
// only. Treat this as a reference copy or for a future bundler setup — keep it in sync
// manually if you care about duplicate definitions.

// 🎯 Z-INDEX CONSTANTS - Layer Management
var Z = {
    MODAL:      10000,
    MODAL_HIGH: 12000,
    MODAL_TOP:  15000,
    FORCED:     25000,
    OVERLAY:    99999,
    TOOLTIP:    999999,
};

// 🎨 GRADIENT CONSTANTS - Reusable styles
var GR = {
    DARK_CARD:  'linear-gradient(135deg, rgba(15,15,35,0.95), rgba(25,25,50,0.95))',
    NEON:       'linear-gradient(135deg, rgba(0,242,255,0.15), rgba(112,0,255,0.15))',
    GOLD:       'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,140,0,0.15))',
    GOLD_SOFT:  'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,140,0,0.08))',
    CYAN_SOFT:  'linear-gradient(135deg, rgba(0,242,255,0.08), rgba(112,0,255,0.08))',
};

// 🧧 RED PACKETS SYSTEM CONFIG
var RED_PACKETS_CONFIG = [
    { id: 'rp_600', amount: 600, emoji: '🧧', name_ar: 'مغلف 600', name_en: 'Red Packet 600', color: '#ef4444', glow: 'rgba(239,68,68,0.6)', bg: 'linear-gradient(135deg,rgba(239,68,68,0.18),rgba(185,28,28,0.12))', border: 'rgba(239,68,68,0.4)', imageURL: null, maxClaims: 5, desc_ar: 'مغلف أحمر صغير — يوزع على 5 أشخاص', desc_en: 'Small red packet — shared among 5 people' },
    { id: 'rp_1800', amount: 1800, emoji: '🧧', name_ar: 'مغلف 1800', name_en: 'Red Packet 1800', color: '#f97316', glow: 'rgba(249,115,22,0.6)', bg: 'linear-gradient(135deg,rgba(249,115,22,0.18),rgba(194,65,12,0.12))', border: 'rgba(249,115,22,0.4)', imageURL: null, maxClaims: 8, desc_ar: 'مغلف أحمر متوسط — يوزع على 8 أشخاص', desc_en: 'Medium red packet — shared among 8 people' },
    { id: 'rp_3000', amount: 3000, emoji: '🧧', name_ar: 'مغلف 3000', name_en: 'Red Packet 3000', color: '#fbbf24', glow: 'rgba(251,191,36,0.6)', bg: 'linear-gradient(135deg,rgba(251,191,36,0.18),rgba(180,83,9,0.12))', border: 'rgba(251,191,36,0.4)', imageURL: null, maxClaims: 10, desc_ar: 'مغلف ذهبي — يوزع على 10 أشخاص', desc_en: 'Golden packet — shared among 10 people' },
    { id: 'rp_10000', amount: 10000, emoji: '🧧', name_ar: 'مغلف 10000', name_en: 'Red Packet 10K', color: '#a78bfa', glow: 'rgba(167,139,250,0.7)', bg: 'linear-gradient(135deg,rgba(167,139,250,0.18),rgba(109,40,217,0.12))', border: 'rgba(167,139,250,0.4)', imageURL: null, maxClaims: 15, desc_ar: 'مغلف ملكي — يوزع على 15 شخص', desc_en: 'Royal packet — shared among 15 people' },
    { id: 'rp_50000', amount: 50000, emoji: '🧧', name_ar: 'مغلف 50000', name_en: 'Red Packet 50K', color: '#00f2ff', glow: 'rgba(0,242,255,0.8)', bg: 'linear-gradient(135deg,rgba(0,242,255,0.18),rgba(112,0,255,0.12))', border: 'rgba(0,242,255,0.4)', imageURL: null, maxClaims: 20, desc_ar: 'مغلف أسطوري — يوزع على 20 شخص', desc_en: 'Legendary packet — shared among 20 people' },
];

// 🤝 BFF SYSTEM CONFIG
var BFF_CONFIG = {
    freeSlots: 3,
    extraSlotCost: 1000,
    cardImages: {
        paper_plane: null,
        airplane:    null,
        house:       null,
        car:         null,
        yacht:       null,
        castle:      null,
        default:     null,
    },
};

var BFF_TOKEN_ITEMS = [
    { id:'bff_paper_plane', emoji:'✈️', name_en:'Paper Plane Relationship', name_ar:'علاقة طيارة ورق',   cost:500,  rarity:'Common',    cardType:'paper_plane', imageURL: null, color:'#60a5fa', glow:'rgba(96,165,250,0.5)',  desc_en:'A simple, sweet bond.',        desc_ar:'رابطة بسيطة وحلوة.' },
    { id:'bff_airplane',    emoji:'🛫', name_en:'Airplane Relationship',    name_ar:'علاقة طيارة',       cost:1000, rarity:'Uncommon',  cardType:'airplane',    imageURL: null, color:'#4ade80', glow:'rgba(74,222,128,0.5)',  desc_en:'Soaring friendship.',          desc_ar:'صداقة تحلق في السماء.' },
    { id:'bff_house',       emoji:'🏠', name_en:'House Relationship',       name_ar:'علاقة بيت',         cost:1500, rarity:'Rare',      cardType:'house',       imageURL: null, color:'#f59e0b', glow:'rgba(245,158,11,0.5)',  desc_en:'A warm, homey bond.',          desc_ar:'رابطة دائفة كالبيت.' },
    { id:'bff_car',         emoji:'🚗', name_en:'Car Relationship',         name_ar:'علاقة عربية',       cost:2500, rarity:'Epic',      cardType:'car',         imageURL: null, color:'#a78bfa', glow:'rgba(167,139,250,0.5)', desc_en:'Fast and exciting.',           desc_ar:'سريعة ومثيرة.' },
    { id:'bff_yacht',       emoji:'🛥️', name_en:'Royal Yacht Relationship', name_ar:'علاقة يخت ملكي',   cost:5000, rarity:'Legendary', cardType:'yacht',       imageURL: null, color:'#ffd700', glow:'rgba(255,215,0,0.6)',   desc_en:'Luxury friendship at sea.',    desc_ar:'صداقة فاخرة على البحر.' },
    { id:'bff_castle',      emoji:'🏰', name_en:'Friends Castle',           name_ar:'قلعة الأصدقاء',     cost:8000, rarity:'Mythic',    cardType:'castle',      imageURL: null, color:'#f0abfc', glow:'rgba(240,171,252,0.7)', desc_en:'An unbreakable legendary bond.', desc_ar:'رابطة أسطورية لا تنكسر.' },
];

var BOT_CHATS_CONFIG = [
    { id: 'detective_bot', name_ar: 'المحقق', name_en: 'The Detective', emoji: '🕵️', description_ar: 'نظام البلاغات الرسمي — البلاغات والردود', description_en: 'Official report system — reports & responses', color: '#00d4ff', glow: 'rgba(0,212,255,0.4)', photoURL: null, official: true, readOnly: true },
    { id: 'love_bot', name_ar: 'بوت دواء', name_en: 'Dawa Bot', emoji: '💌', description_ar: 'إشعارات الزواج وعلاقات BFF الرسمية', description_en: 'Official wedding & BFF notifications', color: '#f9a8d4', glow: 'rgba(249,168,212,0.4)', photoURL: null, official: true, readOnly: true },
];

var OWNER_UID = 'fE9630YfAAd3qC9L0WJbW48J1yP2'; // Your UID
var ADMIN_UIDS = [
    'fE9630YfAAd3qC9L0WJbW48J1yP2', // Owner
    'fL6R06T6X3X6',               // Admin 1
    'fL6R06T6Y4Y7'                // Admin 2
];

var ROLE_CONFIG = {
    owner: { label_ar: 'المالك', label_en: 'Owner', icon: '👑', color: '#ffd700', glow: 'rgba(255,215,0,0.8)', bg: 'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,140,0,0.12))', border: 'rgba(255,215,0,0.55)', badgeClass: 'role-badge-owner' },
    admin: { label_ar: 'أدمن', label_en: 'Admin', icon: '🛡️', color: '#ef4444', glow: 'rgba(239,68,68,0.7)', bg: 'linear-gradient(135deg,rgba(239,68,68,0.18),rgba(185,28,28,0.12))', border: 'rgba(239,68,68,0.5)', badgeClass: 'role-badge-admin' },
    moderator: { label_ar: 'مشرف', label_en: 'Mod', icon: '🔰', color: '#3b82f6', glow: 'rgba(59,130,246,0.6)', bg: 'linear-gradient(135deg,rgba(59,130,246,0.18),rgba(29,78,216,0.12))', border: 'rgba(59,130,246,0.5)', badgeClass: 'role-badge-mod' },
};


var GACHA_CONFIG_BASIC = {
    paidCostPerSpin: 200, maxPaidSpinsDaily: 50,
    rewards: [
        { weight: 200, type: 'currency', amount: 50, rarity: 'common', icon: '🧠', label_en: '+50 Intel', label_ar: '+50 إنتل', rateDisplay: '20%' },
        { weight: 150, type: 'currency', amount: 200, rarity: 'uncommon', icon: '🧠', label_en: '+200 Intel', label_ar: '+200 إنتل', rateDisplay: '15%' },
        { weight: 200, type: 'coins', amount: 50, rarity: 'common', icon: '🏅', label_en: '+50 Coins', label_ar: '+50 عملة', rateDisplay: '20%' },
        { weight: 150, type: 'coins', amount: 150, rarity: 'uncommon', icon: '🏅', label_en: '+150 Coins', label_ar: '+150 عملة', rateDisplay: '15%' },
        { weight: 100, type: 'gift', giftId: 'gift_rose', qty: 5, rarity: 'common', icon: '🌹', label_en: '5x Rose', label_ar: '5x وردة', rateDisplay: '10%' },
        { weight: 100, type: 'gift', giftId: 'gift_coffee', qty: 1, rarity: 'uncommon', icon: '☕', label_en: 'Coffee', label_ar: 'قهوة', rateDisplay: '10%' },
        { weight: 80, type: 'gift', giftId: 'gift_cake', qty: 1, rarity: 'rare', icon: '🎂', label_en: 'Cake', label_ar: 'كيكة', rateDisplay: '8%' },
        { weight: 18, type: 'frame', frameId: 'frame_neon', duration: 1, rarity: 'rare', icon: '🖼️', label_en: 'Neon Frame 1d', label_ar: 'إطار نيون 1 يوم', rateDisplay: '1.8%' },
        { weight: 2, type: 'chest', chestType: 'normal', rarity: 'legendary', icon: '📦', label_en: 'Normal Chest', label_ar: 'صندوق عادي', rateDisplay: '0.2%' }
    ]
};

var GACHA_CONFIG_PREMIUM = {
    paidCostPerSpin: 200, maxPaidSpinsDaily: 50,
    rewards: [
        { weight: 200, type: 'currency', amount: 150, rarity: 'common', icon: '🧠', label_en: '+150 Intel', label_ar: '+150 إنتل', rateDisplay: '20%' },
        { weight: 100, type: 'currency', amount: 500, rarity: 'uncommon', icon: '🧠', label_en: '+500 Intel', label_ar: '+500 إنتل', rateDisplay: '10%' },
        { weight: 200, type: 'coins', amount: 150, rarity: 'common', icon: '🏅', label_en: '+150 Coins', label_ar: '+150 عملة', rateDisplay: '20%' },
        { weight: 100, type: 'coins', amount: 300, rarity: 'uncommon', icon: '🏅', label_en: '+300 Coins', label_ar: '+300 عملة', rateDisplay: '10%' },
        { weight: 150, type: 'gift', giftId: 'gift_cake', qty: 1, rarity: 'uncommon', icon: '🎂', label_en: 'Cake', label_ar: 'كيكة', rateDisplay: '15%' },
        { weight: 100, type: 'gift', giftId: 'gift_crown', qty: 1, rarity: 'rare', icon: '👑', label_en: 'Crown', label_ar: 'تاج', rateDisplay: '10%' },
        { weight: 90, type: 'gift', giftId: 'gift_racecar', qty: 1, rarity: 'epic', icon: '🏎️', label_en: 'Race Car', label_ar: 'سيارة', rateDisplay: '9%' },
        { weight: 50, type: 'frame', frameId: 'frame_gold', duration: 3, rarity: 'epic', icon: '🖼️', label_en: 'Gold Frame 3d', label_ar: 'إطار ذهبي 3 أيام', rateDisplay: '5%' },
        { weight: 4, type: 'chest', chestType: 'normal', rarity: 'rare', icon: '📦', label_en: 'Normal Chest', label_ar: 'صندوق عادي', rateDisplay: '0.4%' },
        { weight: 2, type: 'chest', chestType: 'advanced', rarity: 'legendary', icon: '🎁', label_en: 'Advanced Chest', label_ar: 'صندوق متقدم', rateDisplay: '0.2%' },
        { weight: 2, type: 'chest', chestType: 'rare', rarity: 'legendary', icon: '💠', label_en: 'Rare Chest', label_ar: 'صندوق نادر', rateDisplay: '0.2%' },
        { weight: 2, type: 'gift', giftId: 'gift_ring', qty: 1, rarity: 'mythic', icon: '💍', label_en: 'Diamond Ring', label_ar: 'خاتم ألماس', rateDisplay: '0.2%' }
    ]
};

var GACHA_RARITY_COLORS = {
    common: '#9ca3af', uncommon: '#4ade80', rare: '#60a5fa',
    epic: '#a78bfa', legendary: '#fbbf24',
};

var DAILY_TASKS_MILESTONES = [
    { points: 20,  rewards: [ {type:'currency', id:'currency', qty:5}, {type:'coins', id:'coins', qty:5}, {type:'gift', id:'gift_rose', qty:5} ] },
    { points: 60,  rewards: [ {type:'currency', id:'currency', qty:10},{type:'coins', id:'coins', qty:10},{type:'gift', id:'gift_rose', qty:10} ] },
    { points: 100, rewards: [ {type:'currency', id:'currency', qty:15},{type:'coins', id:'coins', qty:15},{type:'gift', id:'gift_rose', qty:15} ] }
];



var FAMILY_SHOP_ITEMS = [
    { id:'fs1', emoji:'🎖️', name_en:'Warrior Badge',   name_ar:'شارة المحارب',    cost:30,  type:'badge',  rarity:'rare',       durationDays:7, desc_en:'Exclusive family warrior badge', desc_ar:'شارة محارب حصرية للعائلة' },
    { id:'fs2', emoji:'🛡️', name_en:'Shield Badge',    name_ar:'شارة الدرع',      cost:50,  type:'badge',  rarity:'rare',       durationDays:7, desc_en:'Honor shield badge',             desc_ar:'شارة درع الشرف' },
    { id:'fs3', emoji:'👑', name_en:'Crown Badge',     name_ar:'شارة التاج',      cost:100, type:'badge',  rarity:'epic',       durationDays:7, desc_en:'Royal crown clan badge',         desc_ar:'شارة تاج ملكي' },
    { id:'fs4', emoji:'🔥', name_en:'Flame Badge',     name_ar:'شارة اللهب',      cost:40,  type:'badge',  rarity:'rare',       durationDays:7, desc_en:'Blazing fire badge',             desc_ar:'شارة اللهب المشتعل' },
    { id:'fs5', emoji:'⚡', name_en:'Thunder Badge',   name_ar:'شارة الرعد',      cost:40,  type:'badge',  rarity:'rare',       durationDays:7, desc_en:'Lightning thunder badge',        desc_ar:'شارة صاعقة الرعد' },
    { id:'fs6', emoji:'🌟', name_en:'Star Badge',      name_ar:'شارة النجمة',     cost:75,  type:'badge',  rarity:'epic',       durationDays:7, desc_en:'Shining star clan badge',        desc_ar:'شارة نجمة عائلة مضيئة' },
    { id:'fs7', emoji:'💎', name_en:'Diamond Badge',   name_ar:'شارة الألماس',    cost:150, type:'badge',  rarity:'legendary',  durationDays:7, desc_en:'Legendary diamond badge',        desc_ar:'شارة ألماس أسطورية' },
    { id:'fs8', emoji:'🏆', name_en:'Trophy Badge',    name_ar:'شارة الكأس',      cost:200, type:'badge',  rarity:'legendary',  durationDays:7, desc_en:'Champion trophy badge',          desc_ar:'شارة كأس البطولة' },
    { id:'fs9', emoji:'🐉', name_en:'Dragon Title',    name_ar:'لقب التنين',       cost:300, type:'title',  rarity:'legendary',  durationDays:7, desc_en:'Exclusive dragon clan title',    desc_ar:'لقب التنين الحصري للعائلة' },
    { id:'fs10', emoji:'🦁', name_en:'Lion Title',     name_ar:'لقب الأسد',        cost:250, type:'title',  rarity:'epic',       durationDays:7, desc_en:'Pride of the clan lion title',   desc_ar:'لقب أسد فخر العائلة' },
];

var FAMILY_SIGN_IMAGES = [
    { level: 1, threshold: 1000,   imageURL: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Family%20Sign1.png' },
    { level: 2, threshold: 10000,  imageURL: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Family%20Sign2.png' },
    { level: 3, threshold: 30000,  imageURL: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Family%20Sign3.png' },
    { level: 4, threshold: 100000, imageURL: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Family%20Sign4.png' },
    { level: 5, threshold: 300000, imageURL: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Family%20Sign5.png' },
];

var VIP_ID_ICONS = {
    6:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idvip.png',
    7:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idvip6.png',
    8:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idvip7.png',
    9:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idvip8.png',
    10: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idvip10.png',
};

var ID_ICON_IMAGE_URL = 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/idon.png';
var FAMILY_COINS_SYMBOL = '🏅';
var MAX_BADGES = 10;

// 🏰 FAMILY SYSTEM CONFIG
var FAMILY_CREATE_COST = 500;

var FAMILY_LEVEL_CONFIG = [
    { level:1,  activeness:0,       name_en:'Rookie',     name_ar:'مبتدئة',   color:'#4ade80', maxMembers:20,  icon:'🌱', upgradeCost:0,     imageURL: null },
    { level:2,  activeness:8000,    name_en:'Rising',     name_ar:'صاعدة',    color:'#22d3ee', maxMembers:25,  icon:'⬆️', upgradeCost:1000,  imageURL: null },
    { level:3,  activeness:24000,   name_en:'Established',name_ar:'راسخة',    color:'#60a5fa', maxMembers:30,  icon:'🏕️', upgradeCost:2000,  imageURL: null },
    { level:4,  activeness:60000,   name_en:'Warriors',   name_ar:'محاربون',  color:'#fbbf24', maxMembers:40,  icon:'⚔️', upgradeCost:3000,  imageURL: null },
    { level:5,  activeness:120000,  name_en:'Guardians',  name_ar:'حراس',     color:'#f97316', maxMembers:50,  icon:'🛡️', upgradeCost:5000,  imageURL: null },
    { level:6,  activeness:280000,  name_en:'Elite',      name_ar:'نخبة',     color:'#a78bfa', maxMembers:60,  icon:'💎', upgradeCost:8000,  imageURL: null },
    { level:7,  activeness:500000,  name_en:'Champions',  name_ar:'أبطال',    color:'#ffd700', maxMembers:80,  icon:'🏆', upgradeCost:12000, imageURL: null },
    { level:8,  activeness:800000,  name_en:'Legends',    name_ar:'أساطير',   color:'#ef4444', maxMembers:100, icon:'🔥', upgradeCost:18000, imageURL: null },
    { level:9,  activeness:1200000, name_en:'Dynasty',    name_ar:'سلالة',    color:'#818cf8', maxMembers:120, icon:'👑', upgradeCost:25000, imageURL: null },
    { level:10, activeness:2000000, name_en:'GOAT',       name_ar:'الأعظم',   color:'#00d4ff', maxMembers:160, icon:'🌌', upgradeCost:0,     imageURL: null },
];

var FAMILY_SIGN_LEVELS = [
    { level:1, threshold:1000,   name_ar:'ساين المستوى 1',  name_en:'Sign Level 1',  color:'#6b7280', glow:'rgba(107,114,128,0.3)', defaultIcon:'🏠', bg:'rgba(107,114,128,0.15)' },
    { level:2, threshold:10000,  name_ar:'ساين المستوى 2',  name_en:'Sign Level 2',  color:'#22d3ee', glow:'rgba(34,211,238,0.4)',  defaultIcon:'⚔️', bg:'rgba(34,211,238,0.15)' },
    { level:3, threshold:30000,  name_ar:'ساين المستوى 3',  name_en:'Sign Level 3',  color:'#fbbf24', glow:'rgba(251,191,36,0.4)',  defaultIcon:'🛡️', bg:'rgba(251,191,36,0.15)' },
    { level:4, threshold:100000, name_ar:'ساين المستوى 4',  name_en:'Sign Level 4',  color:'#f97316', glow:'rgba(249,115,22,0.55)', defaultIcon:'👑', bg:'rgba(249,115,22,0.15)',  hasGlow:true },
    { level:5, threshold:300000, name_ar:'ساين المستوى 5',  name_en:'Sign Level 5',  color:'#ef4444', glow:'rgba(239,68,68,0.65)',  defaultIcon:'🌟', bg:'rgba(239,68,68,0.15)',   hasGlow:true },
];

var FAMILY_TASKS_CONFIG = [
    { id:'ft1', icon:'🎮', title_en:'Play 5 Games',        title_ar:'العب 5 ألعاب',        sub_en:'Play 5 spy games this week',      sub_ar:'العب 5 ألعاب جاسوس هذا الأسبوع', target:5,   daily:false, reward:{ intel:50,  xp:200,  coins:5,  icon:'🏅' } },
    { id:'ft2', icon:'🏆', title_en:'Win 3 Games',         title_ar:'اكسب 3 ألعاب',        sub_en:'Win 3 games to earn rewards',     sub_ar:'اكسب 3 ألعاب للحصول على المكافآت', target:3,  daily:false, reward:{ intel:100, xp:400,  coins:10, icon:'🏅' } },
    { id:'ft3', icon:'💰', title_en:'Donate 500 Intel',    title_ar:'تبرع بـ 500 إنتل',     sub_en:'Donate 500 Intel to family fund', sub_ar:'تبرع بـ 500 إنتل لصندوق العائلة', target:500, daily:false, reward:{ intel:80,  xp:300,  coins:8,  icon:'🏅' } },
    { id:'ft4', icon:'📅', title_en:'Daily Check-in',      title_ar:'تسجيل الحضور',         sub_en:'Check in to the family today',    sub_ar:'سجّل حضورك في العائلة اليوم',     target:1,   daily:true,  reward:{ intel:30,  xp:100,  coins:3,  icon:'🏅' } },
    { id:'ft5', icon:'🎁', title_en:'Send 3 Gifts',        title_ar:'أرسل 3 هدايا',         sub_en:'Send 3 gifts to any players',     sub_ar:'أرسل 3 هدايا لأي لاعبين',        target:3,   daily:false, reward:{ intel:120, xp:500,  coins:12, icon:'🏅' } },
    { id:'ft6', icon:'💬', title_en:'Chat (10 messages)',  title_ar:'الشات (10 رسائل)',      sub_en:'Send 10 messages in family chat', sub_ar:'أرسل 10 رسائل في شات العائلة',   target:10,  daily:false, reward:{ intel:60,  xp:250,  coins:6,  icon:'🏅' } },
    { id:'ft7', icon:'❤️', title_en:'Daily Like Mission',  title_ar:'مهمة الإعجاب اليومي',  sub_en:'Like 3 clanmates profiles/posts', sub_ar:'أعجب بـ 3 منشورات/بروفايلات أعضاء', target:3, daily:true,  reward:{ intel:40,  xp:150,  coins:4,  icon:'🏅' } },
];

var FAMILY_ROLE_CONFIG = {
    owner:     { label_en:'Owner',  label_ar:'المالك', color:'#ffd700', bg:'rgba(255,215,0,0.18)',    border:'rgba(255,215,0,0.45)',    icon:'👑' },
    admin:     { label_en:'Admin',  label_ar:'أدمن',   color:'#ef4444', bg:'rgba(239,68,68,0.18)',    border:'rgba(239,68,68,0.45)',    icon:'🛡️' },
    moderator: { label_en:'Mod',    label_ar:'مشرف',   color:'#3b82f6', bg:'rgba(59,130,246,0.18)',   border:'rgba(59,130,246,0.45)',   icon:'🔰' },
    member:    { label_en:'Member', label_ar:'عضو',    color:'#6b7280', bg:'rgba(107,114,128,0.12)',  border:'rgba(107,114,128,0.3)',   icon:'👤' },
};

var FAMILY_EMBLEMS = ['🏠','⚔️','🛡️','🔥','🌊','⚡','🌙','🌟','💎','👑','🐉','🦁','🐺','🦅','🦋','🌹','🏹','🎯','🌈','💫'];

// --- UI Helpers ---

// Portal helper - renders children on document.body to escape backdrop-filter stacking context
var PortalModal = ({ children }) => {
    var el = React.useRef(document.createElement('div'));
    React.useEffect(() => {
        document.body.appendChild(el.current);
        return () => { if (el.current.parentNode) el.current.parentNode.removeChild(el.current); };
    }, []);
    return ReactDOM.createPortal(children, el.current);
};

var getFamilySignImage = (activeness = 0) => {
    // Find the highest level where threshold <= activeness
    var signs = [...FAMILY_SIGN_IMAGES].sort((a,b) => b.threshold - a.threshold);
    var matched = signs.find(s => activeness >= s.threshold);
    return matched ? matched.imageURL : null;
};

var getFamilySignLevelData = (activeness = 0) => {
    var levels = [...FAMILY_SIGN_LEVELS].sort((a,b) => b.threshold - a.threshold);
    return levels.find(l => activeness >= l.threshold) || FAMILY_SIGN_LEVELS[0];
};

var getFamilyLevelConfig = (level = 1) => {
    return FAMILY_LEVEL_CONFIG.find(c => c.level === level) || FAMILY_LEVEL_CONFIG[0];
};

// Expose to window
window.FamilyConstants = {
    OWNER_UID, ADMIN_UIDS, ROLE_CONFIG, Z, GACHA_CONFIG_BASIC, GACHA_CONFIG_PREMIUM, 
    DAILY_TASKS_MILESTONES, FAMILY_SHOP_ITEMS, FAMILY_SIGN_IMAGES,
    VIP_ID_ICONS, ID_ICON_IMAGE_URL, FAMILY_COINS_SYMBOL, MAX_BADGES, FAMILY_CREATE_COST,
    FAMILY_LEVEL_CONFIG, FAMILY_SIGN_LEVELS, FAMILY_TASKS_CONFIG, FAMILY_ROLE_CONFIG,
    FAMILY_EMBLEMS, PortalModal, getFamilySignImage, getFamilySignLevelData, getFamilyLevelConfig
};
