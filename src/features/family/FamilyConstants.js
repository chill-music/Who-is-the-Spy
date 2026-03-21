/**
 * FamilyConstants.js - Shared constants for the Family System.
 */

const FAMILY_CREATE_COST = 500;

const FAMILY_LEVEL_CONFIG = [
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

const FAMILY_SIGN_LEVELS = [
    { level:1, threshold:1000,   name_ar:'ساين المستوى 1',  name_en:'Sign Level 1',  color:'#6b7280', glow:'rgba(107,114,128,0.3)', defaultIcon:'🏠', bg:'rgba(107,114,128,0.15)' },
    { level:2, threshold:10000,  name_ar:'ساين المستوى 2',  name_en:'Sign Level 2',  color:'#22d3ee', glow:'rgba(34,211,238,0.4)',  defaultIcon:'⚔️', bg:'rgba(34,211,238,0.15)' },
    { level:3, threshold:30000,  name_ar:'ساين المستوى 3',  name_en:'Sign Level 3',  color:'#fbbf24', glow:'rgba(251,191,36,0.4)',  defaultIcon:'🛡️', bg:'rgba(251,191,36,0.15)' },
    { level:4, threshold:100000, name_ar:'ساين المستوى 4',  name_en:'Sign Level 4',  color:'#f97316', glow:'rgba(249,115,22,0.55)', defaultIcon:'👑', bg:'rgba(249,115,22,0.15)',  hasGlow:true },
    { level:5, threshold:300000, name_ar:'ساين المستوى 5',  name_en:'Sign Level 5',  color:'#ef4444', glow:'rgba(239,68,68,0.65)',  defaultIcon:'🌟', bg:'rgba(239,68,68,0.15)',   hasGlow:true },
];

const FAMILY_ROLE_CONFIG = {
    owner:     { label_en:'Owner',  label_ar:'المالك', color:'#ffd700', bg:'rgba(255,215,0,0.18)',    border:'rgba(255,215,0,0.45)',    icon:'👑' },
    admin:     { label_en:'Admin',  label_ar:'أدمن',   color:'#ef4444', bg:'rgba(239,68,68,0.18)',    border:'rgba(239,68,68,0.45)',    icon:'🛡️' },
    moderator: { label_en:'Mod',    label_ar:'مشرف',   color:'#3b82f6', bg:'rgba(59,130,246,0.18)',   border:'rgba(59,130,246,0.45)',   icon:'🔰' },
    member:    { label_en:'Member', label_ar:'عضو',    color:'#6b7280', bg:'rgba(107,114,128,0.12)',  border:'rgba(107,114,128,0.3)',   icon:'👤' },
};

const FAMILY_TASKS_CONFIG = [
    { id:'ft1', icon:'🎮', title_en:'Play 5 Games',        title_ar:'العب 5 ألعاب',        sub_en:'Play 5 spy games this week',      sub_ar:'العب 5 ألعاب جاسوس هذا الأسبوع', target:5,   daily:false, reward:{ intel:50,  xp:200,  coins:5,  icon:'🏅' } },
    { id:'ft2', icon:'🏆', title_en:'Win 3 Games',         title_ar:'اكسب 3 ألعاب',        sub_en:'Win 3 games to earn rewards',     sub_ar:'اكسب 3 ألعاب للحصول على المكافآت', target:3,  daily:false, reward:{ intel:100, xp:400,  coins:10, icon:'🏅' } },
    { id:'ft3', icon:'💰', title_en:'Donate 500 Intel',    title_ar:'تبرع بـ 500 إنتل',     sub_en:'Donate 500 Intel to family fund', sub_ar:'تبرع بـ 500 إنتل لصندوق العائلة', target:500, daily:false, reward:{ intel:80,  xp:300,  coins:8,  icon:'🏅' } },
    { id:'ft4', icon:'📅', title_en:'Daily Check-in',      title_ar:'تسجيل الحضور',         sub_en:'Check in to the family today',    sub_ar:'سجّل حضورك في العائلة اليوم',     target:1,   daily:true,  reward:{ intel:30,  xp:100,  coins:3,  icon:'🏅' } },
    { id:'ft5', icon:'🎁', title_en:'Send 3 Gifts',        title_ar:'أرسل 3 هدايا',         sub_en:'Send 3 gifts to any players',     sub_ar:'أرسل 3 هدايا لأي لاعبين',        target:3,   daily:false, reward:{ intel:120, xp:500,  coins:12, icon:'🏅' } },
    { id:'ft6', icon:'💬', title_en:'Chat (10 messages)',  title_ar:'الشات (10 رسائل)',      sub_en:'Send 10 messages in family chat', sub_ar:'أرسل 10 رسائل في شات العائلة',   target:10,  daily:false, reward:{ intel:60,  xp:250,  coins:6,  icon:'🏅' } },
    { id:'ft7', icon:'❤️', title_en:'Daily Like Mission',  title_ar:'مهمة الإعجاب اليومي',  sub_en:'Like 3 clanmates profiles/posts', sub_ar:'أعجب بـ 3 منشورات/بروفايلات أعضاء', target:3, daily:true,  reward:{ intel:40,  xp:150,  coins:4,  icon:'🏅' } },
];

const DAILY_TASKS_MILESTONES = [
    { points: 20,  rewards: [ {type:'currency', id:'currency', qty:5}, {type:'coins', id:'coins', qty:5}, {type:'gift', id:'gift_rose', qty:5} ] },
    { points: 60,  rewards: [ {type:'currency', id:'currency', qty:10},{type:'coins', id:'coins', qty:10},{type:'gift', id:'gift_rose', qty:10} ] },
    { points: 100, rewards: [ {type:'currency', id:'currency', qty:15},{type:'coins', id:'coins', qty:15},{type:'gift', id:'gift_rose', qty:15} ] }
];

const getFamilyLevelConfig = (lvl) => FAMILY_LEVEL_CONFIG.find(c => c.level === lvl) || FAMILY_LEVEL_CONFIG[0];

const getFamilyRole = (family, uid) => {
    if (!family || !uid) return 'member';
    if (family.ownerId === uid) return 'owner';
    const member = (family.members || []).find(m => m.id === uid);
    return member?.role || 'member';
};

const getFamilySignLevelData = (activeness) => {
    const reversed = [...FAMILY_SIGN_LEVELS].sort((a,b) => b.threshold - a.threshold);
    return reversed.find(s => activeness >= s.threshold) || null;
};

const FAMILY_EMBLEMS = ['🏠', '⚔️', '🛡️', '👑', '🔥', '💎', '🚀', '🌌', '🍀', '🏆'];

// Global access for legacy scripts
window.FamilyConstants = {
    FAMILY_CREATE_COST,
    FAMILY_LEVEL_CONFIG,
    FAMILY_SIGN_LEVELS,
    FAMILY_ROLE_CONFIG,
    FAMILY_TASKS_CONFIG,
    FAMILY_EMBLEMS,
    DAILY_TASKS_MILESTONES,
    getFamilyLevelConfig,
    getFamilyRole,
    getFamilySignLevelData
};
