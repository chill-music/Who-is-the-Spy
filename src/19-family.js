// ════════════════════════════════════════════════════════
// 📸 FRIENDS MOMENTS MODAL
// 🏠 FAMILY SYSTEM — Complete Clan/Family System V2
// File: 19-family.js
// ════════════════════════════════════════════════════════
// familiesCollection — defined in 01-config.js

// ════════════════════════════════════════════════════════
// ⚙️  FAMILY CONFIG — Levels, Sign Levels, Tasks
// ════════════════════════════════════════════════════════
var FAMILY_CREATE_COST = 500;

// ══ Family levels now based on TOTAL activeness (not XP) ══
// 'activeness' field used for level-up (cumulative)
// ── imageURL: ضع رابط الصورة هنا لكل مستوى (تدعم GIF والصور العادية) ──
// ── اتركها null لو مش عايز صورة لهذا المستوى ──
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

// ════ FAMILY SIGN LEVELS — Based on Weekly Activeness ════
// These thresholds mirror FAMILY_SIGN_IMAGES in 01-config.js
var FAMILY_SIGN_LEVELS = [
    { level:1, threshold:1000,   name_ar:'ساين المستوى 1',  name_en:'Sign Level 1',  color:'#6b7280', glow:'rgba(107,114,128,0.3)', defaultIcon:'🏠', bg:'rgba(107,114,128,0.15)' },
    { level:2, threshold:10000,  name_ar:'ساين المستوى 2',  name_en:'Sign Level 2',  color:'#22d3ee', glow:'rgba(34,211,238,0.4)',  defaultIcon:'⚔️', bg:'rgba(34,211,238,0.15)' },
    { level:3, threshold:30000,  name_ar:'ساين المستوى 3',  name_en:'Sign Level 3',  color:'#fbbf24', glow:'rgba(251,191,36,0.4)',  defaultIcon:'🛡️', bg:'rgba(251,191,36,0.15)' },
    { level:4, threshold:100000, name_ar:'ساين المستوى 4',  name_en:'Sign Level 4',  color:'#f97316', glow:'rgba(249,115,22,0.55)', defaultIcon:'👑', bg:'rgba(249,115,22,0.15)',  hasGlow:true },
    { level:5, threshold:300000, name_ar:'ساين المستوى 5',  name_en:'Sign Level 5',  color:'#ef4444', glow:'rgba(239,68,68,0.65)',  defaultIcon:'🌟', bg:'rgba(239,68,68,0.15)',   hasGlow:true },
];

// Get sign image URL from config (FAMILY_SIGN_IMAGES defined in 01-config.js)
var getFamilySignImage = (level) => {
    if (typeof FAMILY_SIGN_IMAGES === 'undefined') return null;
    const cfg = FAMILY_SIGN_IMAGES.find(s => s.level === level);
    return cfg?.imageURL || null;
};

// Use WEEKLY activeness to determine sign level
var getFamilySignLevelData = (weeklyActiveness = 0) => {
    let cfg = null; // start with no sign
    for (let i = FAMILY_SIGN_LEVELS.length - 1; i >= 0; i--) {
        if (weeklyActiveness >= FAMILY_SIGN_LEVELS[i].threshold) { cfg = FAMILY_SIGN_LEVELS[i]; break; }
    }
    if (!cfg) return null; // no sign earned yet
    return { ...cfg, imageURL: getFamilySignImage(cfg.level) };
};
var getFamilySignProgress = (weeklyActiveness = 0) => {
    const cur = getFamilySignLevelData(weeklyActiveness);
    if (!cur) {
        const first = FAMILY_SIGN_LEVELS[0];
        return Math.min(99, Math.round((weeklyActiveness / first.threshold) * 100));
    }
    const next = FAMILY_SIGN_LEVELS.find(s => s.level === cur.level + 1);
    if (!next) return 100;
    return Math.min(100, Math.round(((weeklyActiveness - cur.threshold) / (next.threshold - cur.threshold)) * 100));
};

var getFamilyLevel = (activeness = 0) => {
    let cfg = FAMILY_LEVEL_CONFIG[0];
    for (let i = FAMILY_LEVEL_CONFIG.length - 1; i >= 0; i--) {
        if (activeness >= FAMILY_LEVEL_CONFIG[i].activeness) { cfg = FAMILY_LEVEL_CONFIG[i]; break; }
    }
    return cfg;
};
var getFamilyLevelProgress = (activeness = 0) => {
    const cur = getFamilyLevel(activeness);
    const next = FAMILY_LEVEL_CONFIG.find(c => c.level === cur.level + 1);
    if (!next) return 100;
    return Math.min(100, Math.round(((activeness - cur.activeness) / (next.activeness - cur.activeness)) * 100));
};

// ════ UPDATED TASKS — Triple Currency: Intel + XP + Family Coins ════
var FAMILY_TASKS_CONFIG = [
    { id:'ft1', icon:'🎮', title_en:'Play 5 Games',        title_ar:'العب 5 ألعاب',        sub_en:'Play 5 spy games this week',      sub_ar:'العب 5 ألعاب جاسوس هذا الأسبوع', target:5,   daily:false, reward:{ intel:50,  xp:200,  coins:5,  icon:'🏅' } },
    { id:'ft2', icon:'🏆', title_en:'Win 3 Games',         title_ar:'اكسب 3 ألعاب',        sub_en:'Win 3 games to earn rewards',     sub_ar:'اكسب 3 ألعاب للحصول على المكافآت', target:3,  daily:false, reward:{ intel:100, xp:400,  coins:10, icon:'🏅' } },
    { id:'ft3', icon:'💰', title_en:'Donate 500 Intel',    title_ar:'تبرع بـ 500 إنتل',     sub_en:'Donate 500 Intel to family fund', sub_ar:'تبرع بـ 500 إنتل لصندوق العائلة', target:500, daily:false, reward:{ intel:80,  xp:300,  coins:8,  icon:'🏅' } },
    { id:'ft4', icon:'📅', title_en:'Daily Check-in',      title_ar:'تسجيل الحضور',         sub_en:'Check in to the family today',    sub_ar:'سجّل حضورك في العائلة اليوم',     target:1,   daily:true,  reward:{ intel:30,  xp:100,  coins:3,  icon:'🏅' } },
    { id:'ft5', icon:'🎁', title_en:'Send 3 Gifts',        title_ar:'أرسل 3 هدايا',         sub_en:'Send 3 gifts to any players',     sub_ar:'أرسل 3 هدايا لأي لاعبين',        target:3,   daily:false, reward:{ intel:120, xp:500,  coins:12, icon:'🏅' } },
    { id:'ft6', icon:'💬', title_en:'Chat (10 messages)',  title_ar:'الشات (10 رسائل)',      sub_en:'Send 10 messages in family chat', sub_ar:'أرسل 10 رسائل في شات العائلة',   target:10,  daily:false, reward:{ intel:60,  xp:250,  coins:6,  icon:'🏅' } },
    { id:'ft7', icon:'❤️', title_en:'Daily Like Mission',  title_ar:'مهمة الإعجاب اليومي',  sub_en:'Like 3 clanmates profiles/posts', sub_ar:'أعجب بـ 3 منشورات/بروفايلات أعضاء', target:3, daily:true,  reward:{ intel:40,  xp:150,  coins:4,  icon:'🏅' } },
];

// ── imageURL: ضع رابط صورة/GIF للصندوق (يدعم GIF متحرك) — اتركه null لو عايز الإيموجي فقط ──
var ACTIVENESS_MILESTONES = [
    { threshold:8000,   chestType:'normal',   icon:'📦', imageURL: null, name_en:'Normal Chest',   name_ar:'صندوق عادي' },
    { threshold:24000,  chestType:'advanced', icon:'🎁', imageURL: null, name_en:'Advanced Chest', name_ar:'صندوق متقدم' },
    { threshold:60000,  chestType:'rare',     icon:'💠', imageURL: null, name_en:'Rare Chest',     name_ar:'صندوق نادر' },
    { threshold:120000, chestType:'epic',     icon:'💎', imageURL: null, name_en:'Epic Chest',     name_ar:'صندوق ملحمي' },
    { threshold:280000, chestType:'super',    icon:'👑', imageURL: null, name_en:'Super Chest',    name_ar:'صندوق أسطوري' },
];

// ══ CHEST REWARDS CONFIG ══
var CHEST_CONFIG = {
    normal: {
        name_en:'Normal Chest', name_ar:'صندوق عادي', icon:'📦', color:'#4ade80',
        rewards: [
            { type:'currency',  amount:1000, icon:'🧠', label_en:'1000 Intel',        label_ar:'1000 إنتل' },
            { type:'coins',     amount:1000, icon:'🏅', label_en:'1000 Family Coins', label_ar:'1000 عملة قبيلة' },
            { type:'gift',      giftId:'gift_cake',   qty:1, icon:'🎂', label_en:'Gift (200 Intel)', label_ar:'هدية (200 إنتل)' },
            { type:'gift',      giftId:'gift_rose',   qty:9, icon:'🌹', label_en:'9× Gift (30 Intel)',label_ar:'9× هدية (30 إنتل)' },
        ],
    },
    advanced: {
        name_en:'Advanced Chest', name_ar:'صندوق متقدم', icon:'🎁', color:'#60a5fa',
        rewards: [
            { type:'frame', frameId:'frame_temp_3d',  duration:3,  icon:'🖼️', label_en:'Frame 3 Days',  label_ar:'إطار 3 أيام' },
            { type:'frame', frameId:'frame_temp_7d',  duration:7,  icon:'🖼️', label_en:'Frame 7 Days',  label_ar:'إطار 7 أيام' },
            { type:'gift',  giftId:'gift_racecar',    qty:2, icon:'🏎️', label_en:'2× Gift (2000 Intel)', label_ar:'2× هدية (2000 إنتل)' },
            { type:'gift',  giftId:'gift_crown',      qty:2, icon:'👑', label_en:'2× Gift (520 Intel)',  label_ar:'2× هدية (520 إنتل)' },
        ],
    },
    rare: {
        name_en:'Rare Chest', name_ar:'صندوق نادر', icon:'💠', color:'#a78bfa',
        rewards: [
            { type:'frame', frameId:'frame_temp_7d',  duration:7,  icon:'🖼️', label_en:'Frame 7 Days',  label_ar:'إطار 7 أيام' },
            { type:'frame', frameId:'frame_temp_3d',  duration:3,  icon:'🖼️', label_en:'Frame 3 Days',  label_ar:'إطار 3 أيام' },
            { type:'frame', frameId:'frame_temp_15d', duration:15, icon:'🖼️', label_en:'Frame 15 Days', label_ar:'إطار 15 يوم' },
            { type:'charisma', amount:20000, icon:'⭐', label_en:'20K Charisma Ring', label_ar:'خاتم كاريزما 20K' },
            { type:'gift', giftId:'gift_coffee',  qty:2, icon:'☕', label_en:'2× Gift (120 Intel)',  label_ar:'2× هدية (120 إنتل)' },
            { type:'gift', giftId:'gift_racecar', qty:2, icon:'🏎️', label_en:'2× Gift (2000 Intel)', label_ar:'2× هدية (2000 إنتل)' },
            { type:'currency', amount:7800, icon:'🧠', label_en:'7800 Intel',        label_ar:'7800 إنتل' },
            { type:'coins',    amount:7800, icon:'🏅', label_en:'7800 Family Coins', label_ar:'7800 عملة قبيلة' },
        ],
    },
    epic: {
        name_en:'Epic Chest', name_ar:'صندوق ملحمي', icon:'💎', color:'#ffd700',
        rewards: [
            { type:'currency', amount:10000, icon:'🧠', label_en:'10K Intel',         label_ar:'10K إنتل' },
            { type:'coins',    amount:10000, icon:'🏅', label_en:'10K Family Coins',  label_ar:'10K عملة قبيلة' },
            { type:'charisma', amount:40000, icon:'⭐', label_en:'40K Charisma Ring', label_ar:'خاتم كاريزما 40K' },
            { type:'charisma', amount:10000, icon:'⭐', label_en:'10K Charisma Ring', label_ar:'خاتم كاريزما 10K' },
            { type:'frame', frameId:'frame_temp_7d',  duration:7,  qty:3, icon:'🖼️', label_en:'3× Frame 7 Days', label_ar:'3× إطار 7 أيام' },
            { type:'frame', frameId:'frame_temp_30d', duration:30, qty:1, icon:'🖼️', label_en:'Frame 30 Days',   label_ar:'إطار 30 يوم' },
        ],
    },
    super: {
        name_en:'Super Chest', name_ar:'صندوق أسطوري', icon:'👑', color:'#f97316',
        rewards: [
            { type:'currency', amount:10000, icon:'🧠', label_en:'10K Intel',         label_ar:'10K إنتل' },
            { type:'coins',    amount:10000, icon:'🏅', label_en:'10K Family Coins',  label_ar:'10K عملة قبيلة' },
            { type:'charisma', amount:40000, icon:'⭐', label_en:'40K Charisma Ring', label_ar:'خاتم كاريزما 40K' },
            { type:'frame', frameId:'frame_temp_7d',  duration:7,  qty:3, icon:'🖼️', label_en:'3× Frame 7 Days', label_ar:'3× إطار 7 أيام' },
            { type:'frame', frameId:'frame_temp_30d', duration:30, qty:1, icon:'🖼️', label_en:'Frame 30 Days',   label_ar:'إطار 30 يوم' },
        ],
    },
};

// ══ GACHA CONFIG ══
// freeDailyCost: 0 (مجانية مرة يومياً)
// paidCostPerSpin: 200 Intel من رصيد اللاعب (مش من الخزينة)
// maxPaidSpinsDaily: 50 سحبة مدفوعة يومياً
//
// ── لتغيير صورة أي جائزة: غير imageURL من null لرابط صورة/GIF ──
// ── لتغيير نسبة الظهور: غير weight (الإجمالي ~10000) ──
var GACHA_CONFIG = {
    paidCostPerSpin: 200, // Intel من رصيد اللاعب لكل سحبة مدفوعة
    maxPaidSpinsDaily: 50,
    rewards: [
        // ── خاتم كاريزما — نادر جداً ──
        { weight:20,   type:'charisma', amount:20000, rarity:'legendary', icon:'💍', imageURL: null,
          label_en:'+20K Charisma Ring', label_ar:'خاتم كاريزما 20K',
          rateDisplay:'0.2%' },

        // ── إطارات عادية (تدعم GIF) ──
        // imageURL: ضع رابط صورة/GIF للإطار هنا
        { weight:300,  type:'frame', frameId:'frame_temp_1d',  duration:1,  rarity:'rare', icon:'🖼️', imageURL: null,
          label_en:'Frame 1 Day', label_ar:'إطار يوم واحد', rateDisplay:'3%' },
        { weight:200,  type:'frame', frameId:'frame_temp_3d',  duration:3,  rarity:'rare', icon:'🖼️', imageURL: null,
          label_en:'Frame 3 Days', label_ar:'إطار 3 أيام', rateDisplay:'2%' },
        { weight:150,  type:'frame', frameId:'frame_temp_7d',  duration:7,  rarity:'epic', icon:'🖼️', imageURL: null,
          label_en:'Frame 7 Days', label_ar:'إطار 7 أيام', rateDisplay:'1.5%' },

        // ── إطارات متحركة GIF ──
        // imageURL: ضع رابط GIF للإطار المتحرك هنا
        { weight:200,  type:'frame_anim', frameId:'frame_anim_1d', duration:1,  rarity:'rare', icon:'✨', imageURL: null,
          label_en:'Animated Frame 1 Day', label_ar:'إطار متحرك يوم', rateDisplay:'2%' },
        { weight:150,  type:'frame_anim', frameId:'frame_anim_3d', duration:3,  rarity:'epic', icon:'✨', imageURL: null,
          label_en:'Animated Frame 3 Days', label_ar:'إطار متحرك 3 أيام', rateDisplay:'1.5%' },
        { weight:100,  type:'frame_anim', frameId:'frame_anim_7d', duration:7,  rarity:'legendary', icon:'✨', imageURL: null,
          label_en:'Animated Frame 7 Days', label_ar:'إطار متحرك 7 أيام', rateDisplay:'1%' },

        // ── هدايا ──
        { weight:200,  type:'gift', giftId:'gift_racecar', qty:1, rarity:'epic', icon:'🏎️', imageURL: null,
          label_en:'Gift 2000 Intel', label_ar:'هدية 2000 إنتل', rateDisplay:'2%' },
        { weight:500,  type:'gift', giftId:'gift_crown',   qty:1, rarity:'rare', icon:'👑', imageURL: null,
          label_en:'Gift 520 Intel', label_ar:'هدية 520 إنتل', rateDisplay:'5%' },
        { weight:1000, type:'gift', giftId:'gift_cake',    qty:1, rarity:'uncommon', icon:'🎂', imageURL: null,
          label_en:'Gift 200 Intel', label_ar:'هدية 200 إنتل', rateDisplay:'10%' },
        { weight:1200, type:'gift', giftId:'gift_coffee',  qty:1, rarity:'uncommon', icon:'☕', imageURL: null,
          label_en:'Gift 120 Intel', label_ar:'هدية 120 إنتل', rateDisplay:'12%' },
        { weight:1500, type:'gift', giftId:'gift_teddy',   qty:1, rarity:'common', icon:'🧸', imageURL: null,
          label_en:'Gift 50 Intel', label_ar:'هدية 50 إنتل', rateDisplay:'15%' },

        // ── عملة الموقع Intel ──
        { weight:1500, type:'currency', amount:30,   rarity:'common',   icon:'🧠', imageURL: null,
          label_en:'+30 Intel', label_ar:'+30 إنتل', rateDisplay:'15%' },
        { weight:800,  type:'currency', amount:555,  rarity:'uncommon', icon:'🧠', imageURL: null,
          label_en:'+555 Intel', label_ar:'+555 إنتل', rateDisplay:'8%' },
        { weight:300,  type:'currency', amount:1688, rarity:'rare',     icon:'🧠', imageURL: null,
          label_en:'+1688 Intel', label_ar:'+1688 إنتل', rateDisplay:'3%' },

        // ── عملة القبيلة ──
        { weight:1000, type:'coins', amount:30,   rarity:'common',   icon:'🏅', imageURL: null,
          label_en:'+30 Coins', label_ar:'+30 عملة قبيلة', rateDisplay:'10%' },
        { weight:500,  type:'coins', amount:50,   rarity:'uncommon', icon:'🏅', imageURL: null,
          label_en:'+50 Coins', label_ar:'+50 عملة قبيلة', rateDisplay:'5%' },
        { weight:300,  type:'coins', amount:88,   rarity:'rare',     icon:'🏅', imageURL: null,
          label_en:'+88 Coins', label_ar:'+88 عملة قبيلة', rateDisplay:'3%' },
        { weight:100,  type:'coins', amount:1688, rarity:'legendary',icon:'🏅', imageURL: null,
          label_en:'+1688 Coins', label_ar:'+1688 عملة قبيلة', rateDisplay:'1%' },

        // ── صناديق القبيلة (نادرة جداً) ──
        { weight:33, type:'chest', chestType:'normal',   rarity:'legendary', icon:'📦', imageURL: null,
          label_en:'Normal Chest', label_ar:'صندوق عادي', rateDisplay:'0.33%' },
        { weight:33, type:'chest', chestType:'advanced', rarity:'legendary', icon:'🎁', imageURL: null,
          label_en:'Advanced Chest', label_ar:'صندوق متقدم', rateDisplay:'0.33%' },
        { weight:34, type:'chest', chestType:'rare',     rarity:'legendary', icon:'💠', imageURL: null,
          label_en:'Rare Chest', label_ar:'صندوق نادر', rateDisplay:'0.34%' },
    ],
};

// ── ألوان نادرية الجاتشه ──
var GACHA_RARITY_COLORS = {
    common: '#9ca3af', uncommon: '#4ade80', rare: '#60a5fa',
    epic: '#a78bfa', legendary: '#fbbf24',
};

// ── Role Config ──
var FAMILY_ROLE_CONFIG = {
    owner:     { label_en:'Owner',  label_ar:'المالك', color:'#ffd700', bg:'rgba(255,215,0,0.18)',    border:'rgba(255,215,0,0.45)',    icon:'👑' },
    admin:     { label_en:'Admin',  label_ar:'أدمن',   color:'#ef4444', bg:'rgba(239,68,68,0.18)',    border:'rgba(239,68,68,0.45)',    icon:'🛡️' },
    moderator: { label_en:'Mod',    label_ar:'مشرف',   color:'#3b82f6', bg:'rgba(59,130,246,0.18)',   border:'rgba(59,130,246,0.45)',   icon:'🔰' },
    member:    { label_en:'Member', label_ar:'عضو',    color:'#6b7280', bg:'rgba(107,114,128,0.12)',  border:'rgba(107,114,128,0.3)',   icon:'👤' },
};
var getFamilyRole = (family, uid) => {
    if (!family || !uid) return 'member';
    if (family.createdBy === uid) return 'owner';
    const roles = family.memberRoles || {};
    return roles[uid] || 'member';
};
var canManageFamily = (family, uid) => {
    const role = getFamilyRole(family, uid);
    return role === 'owner' || role === 'admin';
};

// ── Emblem Options ──
var FAMILY_EMBLEMS = ['🏠','⚔️','🛡️','🔥','🌊','⚡','🌙','🌟','💎','👑','🐉','🦁','🐺','🦅','🦋','🌹','🏹','🎯','🌈','💫'];

// ── Helpers ──
var fmtFamilyNum = (n = 0) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
};
var fmtFamilyTime = (ts, lang) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return lang === 'ar' ? 'الآن' : 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}${lang === 'ar' ? 'د' : 'm'}`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}${lang === 'ar' ? 'س' : 'h'}`;
    return `${Math.floor(diff / 86400000)}${lang === 'ar' ? 'ي' : 'd'}`;
};

// ── Components ──
var FamilyRoleBadge = window.FamilyRoleBadge || (function() { return null; });

// Enhanced FamilySignBadge — image with tag overlaid, matches ProfileFamilySignBadge
var FamilySignBadge = window.FamilySignBadge || (function() { return null; });

// ════════════════════════════════════════════════════════
// 📸 FRIENDS MOMENTS MODAL
// ════════════════════════════════════════════════════════
var FriendsMomentsModal = window.FriendsMomentsModal || (function() { return null; });


// ════════════════════════════════════════════════════════
// 💬 FAMILY CHAT MODAL — Standalone chat accessible from Chat tab
// ════════════════════════════════════════════════════════
var CHAT_EMOJIS_FAM = ['😀','😂','❤️','👍','🔥','⭐','💎','🎁','🎉','😎','🤩','💪','✨','🙏','😊','👑','💖','🥳','🏆','🎯','😍','🤣','😭','😱','🫡','💯','🌹','🎮','🕵️','🏅'];

var FamilyChatModal = window.FamilyChatModal || (function() { return null; });


// ════════════════════════════════════════════════════════
// 🏆 FAMILY RANKING INLINE — Used in ranking tab
// ════════════════════════════════════════════════════════
var FamilyRankingInline = window.FamilyRankingInline || (function() { return null; });

// ════════════════════════════════════════════════════════
// 👤 FamilyMemberQuickCard — Lightweight inline popup
//    position:absolute داخل modal (مش fixed)
//    يظهر عند الضغط على اسم عضو في chat العائلة
// ════════════════════════════════════════════════════════
var FamilyMemberQuickCard = window.FamilyMemberQuickCard || (function() { return null; });

// ════════════════════════════════════════════════════════
// 🏠 FAMILY MODAL — Main Component V2
// ════════════════════════════════════════════════════════
var FamilyModal = ({ show, onClose, currentUser, currentUserData, currentUID, lang, isLoggedIn, onNotification, viewFamilyId, onSendGift, userData }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [family, setFamily] = useState(null);
    const [loadingFamily, setLoadingFamily] = useState(true);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [newsLog, setNewsLog] = useState([]);
    const [donationSort, setDonationSort] = useState('intel');
    const [memberSearch, setMemberSearch] = useState('');
    // Gear menu state for member management
    const [gearMenuUid, setGearMenuUid] = useState(null); // uid of member whose gear is open
    // Tag editing state
    const [editTag, setEditTag] = useState('');
    const [savingTag, setSavingTag] = useState(false);
    const [joinRequesterProfiles, setJoinRequesterProfiles] = useState([]);
    // ── Delete family confirm ──
    const [showDeleteFamilyConfirm, setShowDeleteFamilyConfirm] = useState(false);
    const [deletingFamily, setDeletingFamily] = useState(false);
    // ── Gift modal in chat ──
    const [showFamilyChatGift, setShowFamilyChatGift] = useState(false);
    // ── Mini profile popup in chat ──
    const [miniProfileMember, setMiniProfileMember] = useState(null); // { uid, name, photo, customId }
    // ── Mention @ in chat ──
    const [mentionSearch, setMentionSearch] = useState(''); // query بعد @
    const [showMentionList, setShowMentionList] = useState(false);
    const chatInputRef = useRef(null);

    // Chat state
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [sendingMsg, setSendingMsg] = useState(false);
    const chatEndRef = useRef(null);

    // Donate state
    const [donateAmount, setDonateAmount] = useState('');
    const [donating, setDonating] = useState(false);
    const [showDonatePanel, setShowDonatePanel] = useState(false);

    // Header dots menu
    // header menu state removed (three-dot removed; ranking is now a tab)

    // ── Chest / Treasury ──
    const [showChestModal, setShowChestModal] = useState(false);
    const [selectedChest, setSelectedChest] = useState(null);
    const [claimingChest, setClaimingChest] = useState(false);
    const [chestResult, setChestResult] = useState(null);
    // ── Chest Assign (owner assigns chest to members) ──
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assigningChest, setAssigningChest] = useState(null); // { inventoryIdx, cfg }
    const [assignCount, setAssignCount] = useState(1);
    const [selectedAssignees, setSelectedAssignees] = useState([]);
    const [assigningLoading, setAssigningLoading] = useState(false);
    // ── Gacha free/paid tracking ──
    const [gachaPaidSpinsToday, setGachaPaidSpinsToday] = useState(0);
    const [showGachaTable, setShowGachaTable] = useState(false);
    const [gachaSpinMode, setGachaSpinMode] = useState('free'); // 'free' | 'paid'

    // ── Gacha ──
    const [showGachaModal, setShowGachaModal] = useState(false);
    const [spinningGacha, setSpinningGacha] = useState(false);
    const [gachaResult, setGachaResult] = useState(null);

    // ── Find Family (auto-load all families) ──
    const [allFamilies, setAllFamilies] = useState([]);
    const [loadingAllFamilies, setLoadingAllFamilies] = useState(false);
    const [showRankingModal, setShowRankingModal] = useState(false);

    // Create/Join state
    const [view, setView] = useState('home');
    const [tribeName, setFamilyName] = useState('');
    const [tribeTag, setFamilyTag] = useState('');
    const [tribeDesc, setFamilyDesc] = useState('');
    const [tribeEmblem, setFamilyEmblem] = useState('🏠');
    const [creating, setCreating] = useState(false);
    const [joinSearch, setJoinSearch] = useState('');
    const [joinResults, setJoinResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [joining, setJoining] = useState(false);

    // Manage tab state
    const [editAnnouncement, setEditAnnouncement] = useState('');
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [savingAnn, setSavingAnn] = useState(false);
    const [savingInfo, setSavingInfo] = useState(false);
    const [joinMode, setJoinMode] = useState('open'); // 'open' | 'approval'
    const photoFileRef = useRef(null);
    const signImageFileRef = useRef(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingSign, setUploadingSign] = useState(false);

    // ── Load family (real-time) ── supports viewFamilyId for viewing external families
    useEffect(() => {
        if (!show) { setLoadingFamily(false); return; }
        setLoadingFamily(true);
        // If viewFamilyId passed (from profile badge click), load that family in read-only mode
        const fid = viewFamilyId || currentUserData?.familyId;
        if (!fid) { setFamily(null); setLoadingFamily(false); return; }
        const unsub = familiesCollection.doc(fid).onSnapshot(snap => {
            if (snap.exists) {
                const d = { id: snap.id, ...snap.data() };
                setFamily(d);
                setEditAnnouncement(d.announcement || '');
                setEditName(d.name || '');
                setEditDesc(d.description || '');
                setJoinMode(d.joinMode || 'open');
                setEditTag(d.tag || '');

                // ── Weekly sign reset logic (client-side) ──
                // Every Sunday: save weeklyActiveness as lastWeekActiveness, reset weekly
                if (!viewFamilyId && canManageFamily(d, currentUID)) {
                    const now = new Date();
                    const lastReset = d.lastWeeklyReset;
                    const lastResetDate = lastReset ? (lastReset.toDate ? lastReset.toDate() : new Date(lastReset.seconds * 1000)) : null;
                    const isSunday = now.getDay() === 0;
                    const needsReset = isSunday && (!lastResetDate || lastResetDate.toDateString() !== now.toDateString());
                    if (needsReset) {
                        // Save last week's activeness and reset weekly counter
                        const newSignData = getFamilySignLevelData(d.weeklyActiveness || 0);
                        const updates = {
                            lastWeekActiveness: d.weeklyActiveness || 0,
                            weeklyActiveness: 0,
                            lastWeeklyReset: firebase.firestore.FieldValue.serverTimestamp(),
                        };
                        // Update all members' sign level based on last week
                        familiesCollection.doc(fid).update(updates).catch(() => {});
                        if (newSignData) {
                            for (const uid of (d.members || [])) {
                                usersCollection.doc(uid).update({
                                    familySignLevel: newSignData.level,
                                    familySignColor: newSignData.color,
                                    familySignImageURL: d.signImageURL || null,
                                }).catch(() => {});
                            }
                        } else {
                            // No sign earned — clear members' signs
                            for (const uid of (d.members || [])) {
                                usersCollection.doc(uid).update({
                                    familySignLevel: null,
                                    familySignColor: null,
                                    familySignImageURL: null,
                                }).catch(() => {});
                            }
                        }
                    }
                }
            } else {
                setFamily(null);
                if (!viewFamilyId) {
                    usersCollection.doc(currentUID).update({ familyId: null, familyName: null, familyTag: null }).catch(() => {});
                }
            }
            setLoadingFamily(false);
        }, () => setLoadingFamily(false));
        return () => unsub();
    }, [show, currentUID, currentUserData?.familyId, viewFamilyId]);

    // ── Load chat messages (real-time) ──
    useEffect(() => {
        if (!family?.id || activeTab !== 'chat') return;
        const unsub = familiesCollection.doc(family.id).collection('messages')
            .orderBy('timestamp', 'desc').limit(60)
            .onSnapshot(snap => {
                const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
                setChatMessages(msgs);
            }, () => {});
        return () => unsub();
    }, [family?.id, activeTab]);

    // Auto-scroll chat
    useEffect(() => {
        if (activeTab === 'chat') {
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    }, [chatMessages.length, activeTab]);

    // ── Load member profiles ──
    useEffect(() => {
        if (!family?.members?.length) { setFamilyMembers([]); return; }
        const uids = family.members.slice(0, 30);
        const chunks = [];
        for (let i = 0; i < uids.length; i += 10) chunks.push(uids.slice(i, i + 10));
        Promise.all(chunks.map(chunk =>
            usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', chunk).get().catch(() => ({ docs: [] }))
        )).then(results => {
            const members = [];
            results.forEach(snap => snap.docs.forEach(d => members.push({ id: d.id, ...d.data() })));
            setFamilyMembers(members);
        }).catch(() => {});
    }, [family?.members?.join(',')]);

    // ── Load news ──
    useEffect(() => {
        if (!family?.id || activeTab !== 'news') return;
        const unsub = familiesCollection.doc(family.id).collection('news')
            .orderBy('createdAt', 'desc').limit(30)
            .onSnapshot(snap => setNewsLog(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => {});
        return () => unsub();
    }, [family?.id, activeTab]);

    // ── Load join requester profiles ──
    useEffect(() => {
        const reqs = family?.joinRequests || [];
        if (!reqs.length || activeTab !== 'manage') { setJoinRequesterProfiles([]); return; }
        const chunks = [];
        for (let i = 0; i < reqs.length; i += 10) chunks.push(reqs.slice(i, i + 10));
        Promise.all(chunks.map(chunk =>
            usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', chunk).get().catch(() => ({ docs: [] }))
        )).then(results => {
            const ps = [];
            results.forEach(snap => snap.docs.forEach(d => ps.push({ id: d.id, ...d.data() })));
            setJoinRequesterProfiles(ps);
        }).catch(() => {});
    }, [family?.joinRequests?.join(','), activeTab]);

    if (!show) return null;

    // ─────────────────────────────────────────────
    // HELPERS & ACTIONS
    // ─────────────────────────────────────────────
    const postNews = async (familyId, type, text, amount = 0) => {
        try {
            await familiesCollection.doc(familyId).collection('news').add({
                type, text, amount,
                actorUID: currentUID,
                actorName: currentUserData?.displayName || 'Member',
                actorPhoto: currentUserData?.photoURL || null,
                createdAt: TS(),
            });
        } catch (e) {}
    };

    const postChatMessage = async (familyId, text, type = 'text', extra = {}) => {
        try {
            await familiesCollection.doc(familyId).collection('messages').add({
                senderId: currentUID,
                senderName: currentUserData?.displayName || 'Member',
                senderPhoto: currentUserData?.photoURL || null,
                text, type,
                timestamp: TS(),
                ...extra,
            });
        } catch (e) {}
    };

    const postSystemMessage = async (familyId, text) => {
        try {
            await familiesCollection.doc(familyId).collection('messages').add({
                senderId: 'system',
                senderName: 'SYSTEM',
                text, type: 'system',
                timestamp: TS(),
            });
        } catch (e) {}
    };

    // Update user's sign fields — uses lastWeekActiveness to determine sign level
    const syncUserFamilySign = async (familyId, familyData) => {
        try {
            // Use last week's activeness if available, otherwise current weekly
            const actToCheck = familyData.lastWeekActiveness !== undefined
                ? familyData.lastWeekActiveness
                : (familyData.weeklyActiveness || 0);
            const signD = getFamilySignLevelData(actToCheck);
            await usersCollection.doc(currentUID).update({
                familySignLevel: signD?.level || null,
                familySignColor: signD?.color || null,
                familySignImageURL: familyData.signImageURL || null,
            });
        } catch (e) {}
    };




    // ── حذف العائلة (المالك فقط) ──







    // ── Load all families for Find Family ──
    const loadAllFamilies = async () => {
        setLoadingAllFamilies(true);
        try {
            const snap = await familiesCollection.orderBy('activeness', 'desc').limit(30).get();
            setAllFamilies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch(e) {}
        setLoadingAllFamilies(false);
    };

    // ── Gacha Roll (free once daily / paid 200 Intel per spin up to 50/day) ──

    // ── Claim Chest ──

    // ── Assign chest from treasury inventory to members ──

    // ── Open assigned chest (member claims their prize) ──

    const claimActiveMilestone = async (idx) => {
        if (!family?.id || !canManageFamily(family, currentUID)) return;
        try {
            await familiesCollection.doc(family.id).update({
                activenessClaimedMilestones: firebase.firestore.FieldValue.arrayUnion(idx),
                treasury: firebase.firestore.FieldValue.increment(ACTIVENESS_MILESTONES[idx].reward),
            });
            onNotification(`✅ +${ACTIVENESS_MILESTONES[idx].reward} 🧠 ${lang === 'ar' ? 'للخزينة!' : 'to treasury!'}`);
        } catch (e) {}
    };

    const saveAnnouncement = async () => {
        if (!family?.id || !canManageFamily(family, currentUID)) return;
        setSavingAnn(true);
        try {
            await familiesCollection.doc(family.id).update({ announcement: editAnnouncement });
            onNotification(lang === 'ar' ? '✅ تم الحفظ' : '✅ Saved');
        } catch (e) {}
        setSavingAnn(false);
    };



    const handleSignImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !family?.id || !canManageFamily(family, currentUID)) return;
        setUploadingSign(true);
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                canvas.width = 120; canvas.height = 40;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, 120, 40);
                const scale = Math.min(120 / img.width, 40 / img.height);
                const dw = img.width * scale, dh = img.height * scale;
                ctx.drawImage(img, (120 - dw) / 2, (40 - dh) / 2, dw, dh);
                const base64 = canvas.toDataURL('image/png', 0.8);
                try {
                    await familiesCollection.doc(family.id).update({ signImageURL: base64 });
                    // Update all member user docs
                    for (const uid of (family.members || [])) {
                        await usersCollection.doc(uid).update({ familySignImageURL: base64 }).catch(() => {});
                    }
                    onNotification(lang === 'ar' ? '✅ تم تحديث صورة الشارة' : '✅ Sign image updated');
                } catch (err) {}
                setUploadingSign(false);
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };


    // ─────────────────────────────────────────────
    // STYLES
    // ─────────────────────────────────────────────
    const S = {
        modal: { background:'linear-gradient(180deg,#0d0d1f,#08080f)', border:'1px solid rgba(0,242,255,0.15)', borderRadius:'20px', width:'100%', maxWidth:'460px', height:'92vh', maxHeight:'800px', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,0.95)' },
        header: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0, background:'rgba(0,0,0,0.3)', position:'relative' },
        tabBar: { display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)', background:'rgba(0,0,0,0.35)', flexShrink:0, overflowX:'auto', scrollbarWidth:'none' },
        card: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'14px' },
        sectionTitle: { fontSize:'11px', fontWeight:800, color:'#00f2ff', textTransform:'uppercase', letterSpacing:'1px', paddingLeft:'10px', borderLeft:'3px solid #00f2ff', marginBottom:'12px' },
        input: { width:'100%', padding:'10px 13px', borderRadius:'10px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'white', fontSize:'13px', outline:'none', boxSizing:'border-box' },
        btn: { padding:'10px 18px', borderRadius:'10px', border:'none', fontWeight:800, fontSize:'12px', cursor:'pointer' },
        divider: { height:'1px', background:'rgba(255,255,255,0.06)', margin:'8px 0' },
    };

    // هل المستخدم بيشوف قبيلة من الخارج (مش عضو فيها)؟
    const isExternalView = !!(viewFamilyId && (!currentUserData?.familyId || currentUserData?.familyId !== viewFamilyId));
    const isMemberOfThisFamily = family ? (family.members || []).includes(currentUID) : false;
    const isReadOnly = isExternalView && !isMemberOfThisFamily;

    const TABS = isReadOnly ? [
        { id:'profile',  label_en:'Home',    label_ar:'الرئيسية', icon:'🏠' },
        { id:'members',  label_en:'Members', label_ar:'أعضاء',    icon:'👥' },
    ] : [
        { id:'profile',  label_en:'Home',    label_ar:'الرئيسية', icon:'🏠' },
        { id:'members',  label_en:'Members', label_ar:'أعضاء',    icon:'👥' },
        { id:'tasks',    label_en:'Tasks',   label_ar:'مهام',     icon:'🎯' },
        { id:'shop',     label_en:'Shop',    label_ar:'المتجر',   icon:'🏅' },
        { id:'news',     label_en:'News',    label_ar:'أخبار',    icon:'📰' },
        { id:'manage',   label_en:'Manage',  label_ar:'إدارة',    icon:'⚙️' },
    ];

    const fLvl = family ? getFamilyLevel(family.activeness || 0) : null;
    const fProg = family ? getFamilyLevelProgress(family.activeness || 0) : 0;
    const myRole = family ? getFamilyRole(family, currentUID) : null;
    const canManage = family ? canManageFamily(family, currentUID) : false;
    const weeklyAct = family ? (family.weeklyActiveness || 0) : 0;
    // signData: based on lastWeekActiveness (last week's activity → this week's sign)
    // If lastWeekActiveness not set, use weeklyActiveness as fallback
    const SIGN_FALLBACK = { level: 0, color: '#4b5563', glow: 'rgba(75,85,99,0.3)', defaultIcon: '🏠', bg: 'rgba(75,85,99,0.1)', name_ar: 'بدون ساين', name_en: 'No Sign', threshold: 0 };
    const lastWeekAct = family ? (family.lastWeekActiveness !== undefined ? family.lastWeekActiveness : weeklyAct) : 0;
    const signData = (family ? getFamilySignLevelData(lastWeekAct) : null) || SIGN_FALLBACK;
    const signProg = family ? getFamilySignProgress(lastWeekAct) : 0;

    // ─────────────────────────────────────────────
    // TAB: PROFILE (redesigned to match reference image)
    // ─────────────────────────────────────────────
    const renderProfile = () => {
        if (window.FamilyProfile) return <window.FamilyProfile family={family} currentUID={currentUID} lang={lang} onNotification={onNotification} S={S} myRole={myRole} activeTab={activeTab} setActiveTab={setActiveTab} setFamily={setFamily} view={view} setView={setView} />;
        return <div style={{padding:'20px',color:'white',textAlign:'center'}}>{lang==='ar'?'جاري التحميل...':'Loading...'}</div>;
    };

    // ─────────────────────────────────────────────
    // TAB: CHAT
    // ─────────────────────────────────────────────
    const renderChat = () => {
        if (window.FamilyChatModal) {
            return <window.FamilyChatModal family={family} currentUID={currentUID} lang={lang} onNotification={onNotification} S={S} myRole={myRole} />;
        }
        return <div style={{padding:'20px',color:'white',textAlign:'center'}}>{lang==='ar'?'جاري تحميل الشات...':'Loading Chat...'}</div>;
    };

    // ─────────────────────────────────────────────
    // TAB: MEMBERS
    // ─────────────────────────────────────────────
    const renderMembers = () => {
        if (window.FamilyMembers) return <window.FamilyMembers family={family} currentUID={currentUID} lang={lang} onNotification={onNotification} S={S} myRole={myRole} activeTab={activeTab} setActiveTab={setActiveTab} setFamily={setFamily} view={view} setView={setView} />;
        return <div style={{padding:'20px',color:'white',textAlign:'center'}}>{lang==='ar'?'جاري التحميل...':'Loading...'}</div>;
    };

    // ─────────────────────────────────────────────
    // TAB: TASKS
    // ─────────────────────────────────────────────
    const renderTasks = () => {
        if (window.FamilyTasks) return <window.FamilyTasks family={family} currentUID={currentUID} lang={lang} onNotification={onNotification} S={S} myRole={myRole} activeTab={activeTab} setActiveTab={setActiveTab} setFamily={setFamily} view={view} setView={setView} />;
        return <div style={{padding:'20px',color:'white',textAlign:'center'}}>{lang==='ar'?'جاري التحميل...':'Loading...'}</div>;
    };

    // ─────────────────────────────────────────────
    // TAB: FAMILY SHOP (Family Coins only)
    // ─────────────────────────────────────────────
    const renderShop = () => {
        if (window.FamilyShop) {
            return <window.FamilyShop family={family} currentUID={currentUID} lang={lang} onNotification={onNotification} S={S} />;
        }
        return <div style={{padding:'20px',color:'white',textAlign:'center'}}>{lang==='ar'?'جاري تحميل المتجر...':'Loading Shop...'}</div>;
    };

    // ─────────────────────────────────────────────
    // TAB: RANKING (dedicated tab)
    // ─────────────────────────────────────────────
    const renderRankingTab = () => {
        if (window.FamilyRanking) return <window.FamilyRanking family={family} currentUID={currentUID} lang={lang} onNotification={onNotification} S={S} myRole={myRole} activeTab={activeTab} setActiveTab={setActiveTab} setFamily={setFamily} view={view} setView={setView} />;
        return <div style={{padding:'20px',color:'white',textAlign:'center'}}>{lang==='ar'?'جاري التحميل...':'Loading...'}</div>;
    };

    // ─────────────────────────────────────────────
    // TAB: NEWS
    // ─────────────────────────────────────────────
    const renderNews = () => {
        if (window.FamilyNews) return <window.FamilyNews family={family} currentUID={currentUID} lang={lang} onNotification={onNotification} S={S} myRole={myRole} activeTab={activeTab} setActiveTab={setActiveTab} setFamily={setFamily} view={view} setView={setView} />;
        return <div style={{padding:'20px',color:'white',textAlign:'center'}}>{lang==='ar'?'جاري التحميل...':'Loading...'}</div>;
    };

    // ─────────────────────────────────────────────
    // TAB: MANAGE
    // ─────────────────────────────────────────────
    const renderManage = () => {
        if (window.FamilyManagement) return <window.FamilyManagement family={family} currentUID={currentUID} lang={lang} onNotification={onNotification} S={S} myRole={myRole} activeTab={activeTab} setActiveTab={setActiveTab} setFamily={setFamily} view={view} setView={setView} />;
        return <div style={{padding:'20px',color:'white',textAlign:'center'}}>{lang==='ar'?'جاري التحميل...':'Loading...'}</div>;
    };

    // ─────────────────────────────────────────────
    // HOME / CREATE / JOIN VIEWS
    // ─────────────────────────────────────────────
    const renderHome = () => (
        <div style={{flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'12px'}}>
            <div style={{textAlign:'center', padding:'20px 0 10px'}}>
                <div style={{fontSize:'52px', marginBottom:'10px'}}>🏠</div>
                <div style={{fontSize:'17px', fontWeight:900, color:'white', marginBottom:'6px', fontStyle:'italic'}}>{lang==='ar'?'عالم العائلات':'Family World'}</div>
                <div style={{fontSize:'11px', color:'#6b7280'}}>{lang==='ar'?'أنشئ عائلتك أو انضم لعائلة وتنافس':'Create or join a family and compete'}</div>
            </div>

            {isLoggedIn ? (
                <>
                    <button onClick={()=>setView('create')} style={{padding:'16px', borderRadius:'14px', border:'1px solid rgba(0,242,255,0.25)', background:'linear-gradient(135deg,rgba(0,242,255,0.08),rgba(112,0,255,0.06))', color:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:'14px', textAlign:'left', width:'100%'}}>
                        <span style={{fontSize:'28px'}}>🏗️</span>
                        <div>
                            <div style={{fontSize:'14px', fontWeight:800, color:'#00f2ff', marginBottom:'2px'}}>{lang==='ar'?'إنشاء عائلة':'Create Family'}</div>
                            <div style={{fontSize:'10px', color:'#6b7280'}}>{lang==='ar'?`التكلفة: ${FAMILY_CREATE_COST} إنتل 🧠`:`Cost: ${FAMILY_CREATE_COST} Intel 🧠`}</div>
                        </div>
                        <div style={{marginLeft:'auto', fontSize:'18px', color:'#6b7280'}}>›</div>
                    </button>
                    <button onClick={()=>setView('join')} style={{padding:'16px', borderRadius:'14px', border:'1px solid rgba(167,139,250,0.25)', background:'linear-gradient(135deg,rgba(167,139,250,0.08),rgba(112,0,255,0.06))', color:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:'14px', textAlign:'left', width:'100%'}}>
                        <span style={{fontSize:'28px'}}>🔍</span>
                        <div>
                            <div style={{fontSize:'14px', fontWeight:800, color:'#a78bfa', marginBottom:'2px'}}>{lang==='ar'?'البحث عن عائلة':'Find a Family'}</div>
                            <div style={{fontSize:'10px', color:'#6b7280'}}>{lang==='ar'?'ابحث بالوسم أو الاسم':'Search by tag or name'}</div>
                        </div>
                        <div style={{marginLeft:'auto', fontSize:'18px', color:'#6b7280'}}>›</div>
                    </button>

                </>
            ) : (
                <div style={{textAlign:'center', padding:'24px', color:'#6b7280', fontSize:'13px'}}>
                    <div style={{fontSize:'32px', marginBottom:'8px'}}>🔐</div>
                    {lang==='ar'?'سجّل دخول للانضمام':'Login to join families'}
                </div>
            )}
        </div>
    );

    const renderCreate = () => (
        <div style={{flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'12px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px'}}>
                <button onClick={()=>setView('home')} style={{background:'none', border:'none', color:'#00f2ff', fontSize:'20px', cursor:'pointer', padding:'0 4px'}}>‹</button>
                <span style={{fontSize:'15px', fontWeight:800, color:'white'}}>🏗️ {lang==='ar'?'إنشاء عائلة':'Create Family'}</span>
            </div>
            {/* Emblem picker */}
            <div>
                <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'8px'}}>✨ {lang==='ar'?'شعار العائلة':'Family Emblem'}</div>
                <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
                    {FAMILY_EMBLEMS.map(e => (
                        <button key={e} onClick={()=>setFamilyEmblem(e)} style={{width:'38px', height:'38px', borderRadius:'10px', border:tribeEmblem===e?`2px solid #00f2ff`:'1px solid rgba(255,255,255,0.1)', background:tribeEmblem===e?'rgba(0,242,255,0.15)':'rgba(255,255,255,0.04)', fontSize:'22px', cursor:'pointer'}}>
                            {e}
                        </button>
                    ))}
                </div>
                <div style={{marginTop:'10px', display:'flex', alignItems:'center', gap:'10px', padding:'10px', borderRadius:'12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)'}}>
                    <div style={{width:'48px', height:'48px', borderRadius:'50%', border:`2px solid #00f2ff55`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px'}}>{tribeEmblem}</div>
                    <div>
                        <div style={{fontSize:'13px', fontWeight:800, color:'white', fontStyle:'italic'}}>{tribeName || (lang==='ar'?'اسم العائلة':'Family Name')}</div>
                        {tribeTag && <FamilySignBadge tag={tribeTag} color='#00f2ff' small />}
                    </div>
                </div>
            </div>
            <div>
                <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'6px'}}>🏠 {lang==='ar'?'اسم العائلة *':'Family Name *'}</div>
                <input value={tribeName} onChange={e=>setFamilyName(e.target.value)} maxLength={10} style={S.input} placeholder={lang==='ar'?'اسم مميز...':'Unique name...'} />
            </div>
            <div>
                <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'6px'}}>🏷️ {lang==='ar'?'وسم العائلة * (حروف وأرقام، حتى 6)':'Family Tag * (letters & numbers, max 6)'}</div>
                <input value={tribeTag} onChange={e=>setFamilyTag(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5))} maxLength={5} style={{...S.input, letterSpacing:'3px', fontWeight:800, color:'#00f2ff', fontSize:'15px', border:'1px solid rgba(0,242,255,0.3)'}} placeholder='MYTAG' />
                <div style={{fontSize:'10px', color:'#4b5563', marginTop:'4px'}}>{lang==='ar'?'مثال: CALM أو PRO1':'Example: CALM or PRO1'}</div>
            </div>
            <div>
                <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'6px'}}>📝 {lang==='ar'?'الوصف (اختياري)':'Description (optional)'}</div>
                <textarea value={tribeDesc} onChange={e=>setFamilyDesc(e.target.value)} maxLength={150} rows={3} style={{...S.input, resize:'none', lineHeight:1.5}} placeholder={lang==='ar'?'صف عائلتك...':'Describe your family...'} />
            </div>
            <div style={{padding:'10px 12px', borderRadius:'10px', background:'rgba(255,215,0,0.07)', border:'1px solid rgba(255,215,0,0.2)', fontSize:'11px', color:'#fbbf24'}}>
                💡 {lang==='ar' ? `سيُخصم ${FAMILY_CREATE_COST} إنتل (رصيدك: ${currentUserData?.currency||0} 🧠)` : `${FAMILY_CREATE_COST} Intel will be deducted (Balance: ${currentUserData?.currency||0} 🧠)`}
            </div>
            <button onClick={createFamily} disabled={!tribeName.trim()||!tribeTag.trim()||creating} style={{...S.btn, width:'100%', padding:'13px', fontSize:'13px', background:tribeName.trim()&&tribeTag.trim()&&!creating?'linear-gradient(135deg,#00f2ff,#7000ff)':'rgba(255,255,255,0.06)', color:tribeName.trim()&&tribeTag.trim()?'white':'#4b5563', cursor:tribeName.trim()&&tribeTag.trim()&&!creating?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
                {creating?'⏳🏗️':`🏠 ${lang==='ar'?'إنشاء العائلة':'Create Family'}`}
            </button>
        </div>
    );


    // ─────────────────────────────────────────────
    // MAIN RENDER
    // ─────────────────────────────────────────────
    return (
        <>
        <PortalModal>
            <div className="modal-overlay" onClick={onClose} style={{zIndex: Z.MODAL_HIGH}}>
                <div style={S.modal} onClick={e => e.stopPropagation()}>

                    {/* ── Top Header ── */}
                    <div style={S.header}>
                        {family ? (
                            <div style={{display:'flex', alignItems:'center', gap:'10px', flex:1, minWidth:0}}>
                                <div style={{width:'34px', height:'34px', borderRadius:'50%', border:`2px solid ${fLvl?.color}55`, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0}}>
                                    {family.photoURL ? <img src={family.photoURL} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : (family.emblem||'🏠')}
                                </div>
                                <div style={{flex:1, minWidth:0}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap'}}>
                                        {/* ── اسم القبيلة clickable يفتح الصفحة الرئيسية ── */}
                                        <span
                                            onClick={() => setActiveTab('profile')}
                                            style={{fontSize:'14px', fontWeight:900, color:'white', fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'120px', cursor:'pointer', transition:'color 0.2s'}}
                                            onMouseEnter={e => e.currentTarget.style.color='#00f2ff'}
                                            onMouseLeave={e => e.currentTarget.style.color='white'}
                                            title={lang==='ar'?'انتقل للصفحة الرئيسية':'Go to family home'}
                                        >
                                            {family.name}
                                        </span>
                                        {signData.level > 0 && <FamilySignBadge tag={family.tag} color={signData.color} small signLevel={signData.level} imageURL={family.signImageURL} />}
                                    </div>
                                    <div style={{fontSize:'9px', color:'#6b7280', display:'flex', alignItems:'center', gap:'6px'}}>
                                        <span>{fLvl?.icon} {lang==='ar'?`المستوى ${fLvl?.level}`:`Lv.${fLvl?.level}`}</span>
                                        <span>·</span>
                                        <span>👥 {family.members?.length||0} {lang==='ar'?'عضو':'members'}</span>
                                        {myRole && myRole !== 'owner' && <FamilyRoleBadge role={myRole} lang={lang} small />}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{display:'flex', alignItems:'center', gap:'8px', flex:1}}>
                                <span style={{fontSize:'20px'}}>🏠</span>
                                <span style={{fontSize:'15px', fontWeight:800, color:'white'}}>{lang==='ar'?'العائلة':'Family'}</span>
                            </div>
                        )}

                        <div style={{display:'flex', alignItems:'center', gap:'6px', flexShrink:0}}>
                            {/* Close */}
                            <button onClick={onClose} style={{width:'30px', height:'30px', borderRadius:'8px', border:'none', background:'rgba(255,255,255,0.08)', color:'#9ca3af', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>✕</button>
                        </div>
                    </div>

                    {/* ── Tab Bar (only in family, hidden when profile tab active since it has own nav) ── */}
                    {family && activeTab !== 'profile' && (
                        <div style={S.tabBar}>
                            {TABS.map(tab => (
                                <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
                                    flex:1, padding:'10px 4px 8px', fontSize:'10px', fontWeight:activeTab===tab.id?800:500,
                                    color:activeTab===tab.id?'#00f2ff':'#6b7280', background:'transparent', border:'none',
                                    borderBottom:`2px solid ${activeTab===tab.id?'#00f2ff':'transparent'}`,
                                    cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.2s',
                                    minWidth:'50px', position:'relative',
                                }}>
                                    <div style={{fontSize:'14px', marginBottom:'1px'}}>{tab.icon}</div>
                                    <div>{lang==='ar'?tab.label_ar:tab.label_en}</div>
                                    {tab.id==='manage'&&(family?.joinRequests?.length>0)&&<span style={{position:'absolute', top:'4px', right:'6px', fontSize:'8px', background:'#f97316', color:'white', borderRadius:'50%', width:'14px', height:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900}}>{family.joinRequests.length}</span>}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ── Body ── */}
                    <div style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0}}>
                        {loadingFamily ? (
                            <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#6b7280'}}>⏳</div>
                        ) : !family ? (
                            window.FamilySearch ? <window.FamilySearch view={view} setView={setView} currentUID={currentUID} currentUserData={currentUserData} lang={lang} onNotification={onNotification} onClose={onClose} S={S} /> : <div style={{padding:'20px',color:'white',textAlign:'center'}}>{lang==='ar'?'جاري التحميل...':'Loading...'}</div>
                        ) : (
                            <>
                                {activeTab==='profile'  && renderProfile()}
                                {activeTab==='members'  && renderMembers()}
                                {activeTab==='chat'     && renderChat()}
                                {activeTab==='tasks'    && renderTasks()}
                                {activeTab==='shop'     && renderShop()}
                                {activeTab==='ranking'  && renderRankingTab()}
                                {activeTab==='news'     && renderNews()}
                                {activeTab==='manage'   && renderManage()}
                            </>
                        )}
                    </div>

                    {/* ── Bottom Nav Bar (visible when family exists, profile tab) ── */}
                    {family && activeTab === 'profile' && (
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-around',padding:'8px 16px',background:'rgba(255,255,255,0.04)',borderTop:'1px solid #e5e7eb',flexShrink:0}}>
                            {/* Chat */}
                            <button onClick={()=>setActiveTab('chat')} style={{background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',padding:'4px 12px'}}>
                                <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'rgba(107,114,128,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>💬</div>
                                <span style={{fontSize:'9px',color:'#6b7280',fontWeight:600}}>{lang==='ar'?'شات':'Chat'}</span>
                            </button>
                            {/* Room (go to family chat full modal) */}
                            <button onClick={()=>setActiveTab('chat')} style={{background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',padding:'4px 12px'}}>
                                <div style={{width:'50px',height:'50px',borderRadius:'50%',background:'linear-gradient(135deg,rgba(0,242,255,0.15),rgba(112,0,255,0.15))',border:'2px solid rgba(0,242,255,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px'}}>🏠</div>
                                <span style={{fontSize:'9px',color:'#00f2ff',fontWeight:800}}>{lang==='ar'?'الغرفة':'Room'}</span>
                            </button>
                            {/* Gacha */}
                            <button onClick={()=>setShowGachaModal(true)} style={{background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',padding:'4px 12px'}}>
                                <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'rgba(167,139,250,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>🎰</div>
                                <span style={{fontSize:'9px',color:'#a78bfa',fontWeight:600}}>{lang==='ar'?'جاتشه':'Gacha'}</span>
                            </button>
                            {/* Plus - donate shortcut */}
                            {!isReadOnly && (
                                <button onClick={()=>setShowDonatePanel(v=>!v)} style={{background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',padding:'4px 12px'}}>
                                    <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'rgba(16,185,129,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',fontWeight:900,color:'#10b981'}}>+</div>
                                    <span style={{fontSize:'9px',color:'#10b981',fontWeight:600}}>{lang==='ar'?'تبرع':'Donate'}</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </PortalModal>
        </>
    );
};
