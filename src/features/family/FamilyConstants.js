(function() {
    /**
     * FamilyConstants.js - Shared constants for the Family System.
     */

    var FAMILY_CREATE_COST = 500;

    var FAMILY_LEVEL_CONFIG = [
        { level: 1, activeness: 0, name_en: 'Rookie', name_ar: 'مبتدئة', color: '#4ade80', maxMembers: 20, icon: '🌱', upgradeCost: 0, imageURL: null },
        { level: 2, activeness: 8000, name_en: 'Rising', name_ar: 'صاعدة', color: '#22d3ee', maxMembers: 25, icon: '⬆️', upgradeCost: 1000, imageURL: null },
        { level: 3, activeness: 24000, name_en: 'Established', name_ar: 'راسخة', color: '#60a5fa', maxMembers: 30, icon: '🏕️', upgradeCost: 2000, imageURL: null },
        { level: 4, activeness: 60000, name_en: 'Warriors', name_ar: 'محاربون', color: '#fbbf24', maxMembers: 40, icon: '⚔️', upgradeCost: 3000, imageURL: null },
        { level: 5, activeness: 120000, name_en: 'Guardians', name_ar: 'حراس', color: '#f97316', maxMembers: 50, icon: '🛡️', upgradeCost: 5000, imageURL: null },
        { level: 6, activeness: 280000, name_en: 'Elite', name_ar: 'نخبة', color: '#a78bfa', maxMembers: 60, icon: '💎', upgradeCost: 8000, imageURL: null },
        { level: 7, activeness: 500000, name_en: 'Champions', name_ar: 'أبطال', color: '#ffd700', maxMembers: 80, icon: '🏆', upgradeCost: 12000, imageURL: null },
        { level: 8, activeness: 800000, name_en: 'Legends', name_ar: 'أساطير', color: '#ef4444', maxMembers: 100, icon: '🔥', upgradeCost: 18000, imageURL: null },
        { level: 9, activeness: 1200000, name_en: 'Dynasty', name_ar: 'سلالة', color: '#818cf8', maxMembers: 120, icon: '👑', upgradeCost: 25000, imageURL: null },
        { level: 10, activeness: 2000000, name_en: 'GOAT', name_ar: 'الأعظم', color: '#00d4ff', maxMembers: 160, icon: '🌌', upgradeCost: 0, imageURL: null },
    ];

    var FAMILY_SIGN_LEVELS = [
        { level: 1, threshold: 0,      name_ar: 'ساين المستوى 1', name_en: 'Sign Level 1', color: '#6b7280', glow: 'rgba(107,114,128,0.3)', defaultIcon: '🏠', bg: 'rgba(107,114,128,0.15)', imageURL: 'icos/Family Sign1.png' },
        { level: 2, threshold: 10000,  name_ar: 'ساين المستوى 2', name_en: 'Sign Level 2', color: '#22d3ee', glow: 'rgba(34,211,238,0.4)',  defaultIcon: '⚔️', bg: 'rgba(34,211,238,0.15)',  imageURL: 'icos/Family Sign2.png' },
        { level: 3, threshold: 50000,  name_ar: 'ساين المستوى 3', name_en: 'Sign Level 3', color: '#fbbf24', glow: 'rgba(251,191,36,0.4)',  defaultIcon: '🛡️', bg: 'rgba(251,191,36,0.15)',  imageURL: 'icos/Family Sign3.png' },
        { level: 4, threshold: 150000, name_ar: 'ساين المستوى 4', name_en: 'Sign Level 4', color: '#f97316', glow: 'rgba(249,115,22,0.55)', defaultIcon: '👑', bg: 'rgba(249,115,22,0.15)', imageURL: 'icos/Family Sign4.png', hasGlow: true },
        { level: 5, threshold: 300000, name_ar: 'ساين المستوى 5', name_en: 'Sign Level 5', color: '#ef4444', glow: 'rgba(239,68,68,0.65)',  defaultIcon: '🌟', bg: 'rgba(239,68,68,0.15)',  imageURL: 'icos/Family Sign5.png', hasGlow: true },
    ];

    var SIGN_FALLBACK = { level: 0, color: '#4b5563', name_ar: 'بدون شارة', name_en: 'No Sign', threshold: 0 };

    var FAMILY_ROLE_CONFIG = {
        owner: { label_en: 'Owner', label_ar: 'المالك', color: '#ffd700', bg: 'rgba(255,215,0,0.18)', border: 'rgba(255,215,0,0.45)', icon: '👑' },
        admin: { label_en: 'Admin', label_ar: 'أدمن', color: '#ef4444', bg: 'rgba(239,68,68,0.18)', border: 'rgba(239,68,68,0.45)', icon: '🛡️' },
        moderator: { label_en: 'Mod', label_ar: 'مشرف', color: '#3b82f6', bg: 'rgba(59,130,246,0.18)', border: 'rgba(59,130,246,0.45)', icon: '🔰' },
        member: { label_en: 'Member', label_ar: 'عضو', color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.3)', icon: '👤' },
    };

    var FAMILY_TASKS_CONFIG = [
        {
            id: 'ft1',
            icon: '📅',
            title_en: 'Daily Check-in',
            title_ar: 'تسجيل الحضور اليومي',
            sub_en: 'Check in to the family today',
            sub_ar: 'سجّل حضورك في العائلة اليوم',
            target: 1,
            daily: true,
            points: 20,
            reward: { intel: 30, xp: 100, coins: 3, icon: '🏅' },
            action: null,
        },
        {
            id: 'ft2',
            icon: '❤️',
            title_en: 'Daily Like',
            title_ar: 'إعجاب يومي',
            sub_en: 'Like a clan member\'s post or profile',
            sub_ar: 'أعجب بمنشور أو بروفايل عضو في القبيلة',
            target: 1,
            daily: true,
            points: 10,
            reward: { intel: 20, xp: 80, coins: 2, icon: '🏅' },
            action: 'like',
        },
        {
            id: 'ft3',
            icon: '💰',
            title_en: 'Donate to Clan',
            title_ar: 'تبرع للقبيلة',
            sub_en: 'Donate any Intel to the family treasury',
            sub_ar: 'تبرع بأي كمية إنتل للخزينة',
            target: 1,
            daily: true,
            points: 20,
            reward: { intel: 50, xp: 200, coins: 5, icon: '🏅' },
            action: 'donate',
        },
        {
            id: 'ft4',
            icon: '🎁',
            title_en: 'Send 3 Gifts',
            title_ar: 'أرسل 3 هدايا',
            sub_en: 'Send 3 gifts to any players',
            sub_ar: 'أرسل 3 هدايا لأي لاعبين',
            target: 3,
            daily: true,
            points: 20,
            reward: { intel: 80, xp: 300, coins: 8, icon: '🏅' },
            action: 'gifts',
        },
        {
            id: 'ft5',
            icon: '🎀',
            title_en: 'Send 10 Gifts',
            title_ar: 'أرسل 10 هدايا',
            sub_en: 'Send 10 gifts to players today',
            sub_ar: 'أرسل 10 هدايا للاعبين اليوم',
            target: 10,
            daily: true,
            points: 30,
            reward: { intel: 150, xp: 600, coins: 15, icon: '🏅' },
            action: 'gifts',
        },
        {
            id: 'ft6',
            icon: '🎮',
            title_en: 'Play 5 Games',
            title_ar: 'العب 5 ألعاب',
            sub_en: 'Play 5 spy games today',
            sub_ar: 'العب 5 ألعاب جاسوس اليوم',
            target: 5,
            daily: true,
            points: 20,
            reward: { intel: 60, xp: 250, coins: 6, icon: '🏅' },
            action: 'games',
        },
        {
            id: 'ft7',
            icon: '🏆',
            title_en: 'Win 3 Games',
            title_ar: 'اكسب 3 ألعاب',
            sub_en: 'Win 3 games today',
            sub_ar: 'اكسب 3 ألعاب اليوم',
            target: 3,
            daily: true,
            points: 30,
            reward: { intel: 120, xp: 480, coins: 12, icon: '🏅' },
            action: 'games',
        },
    ];

    var DAILY_TASKS_MILESTONES = [
        {
            points: 20,
            intel: 50,
            rewards: [
                { type: 'currency', amount: 50 },
                { type: 'coins', amount: 30 },
            ],
        },
        {
            points: 60,
            intel: 120,
            rewards: [
                { type: 'currency', amount: 120 },
                { type: 'coins', amount: 80 },
            ],
        },
        {
            points: 100,
            intel: 250,
            rewards: [
                { type: 'currency', amount: 250 },
                { type: 'coins', amount: 150 },
            ],
        },
    ];

    var getFamilyLevelConfig = (lvl) => FAMILY_LEVEL_CONFIG.find(c => c.level === lvl) || FAMILY_LEVEL_CONFIG[0];
    var getFamilyRole = (family, uid) => {
        if (!family || !uid) return 'member';
        if (family.createdBy === uid) return 'owner';
        var roles = family.memberRoles || {};
        return roles[uid] || 'member';
    };
    var getFamilySignLevelData = (activeness) => {
        var reversed = [...FAMILY_SIGN_LEVELS].sort((a, b) => b.threshold - a.threshold);
        return reversed.find(s => activeness >= s.threshold) || null;
    };
    var getFamilySignLevelDataByLevel = (level) => {
        return FAMILY_SIGN_LEVELS.find(s => s.level === level) || FAMILY_SIGN_LEVELS[0];
    };
    var getFamilySignImage = (activeness = 0, level = null) => {
        var signLevel = (level !== null && level !== undefined) ? level : (getFamilySignLevelData(activeness)?.level || 1);
        var entry = FAMILY_SIGN_LEVELS.find(s => s.level === signLevel) || FAMILY_SIGN_LEVELS[0];
        return entry?.imageURL || null;
    };
    var FAMILY_EMBLEMS = ['🏠', '⚔️', '🛡️', '👑', '🔥', '💎', '🚀', '🌌', '🍀', '🏆'];

    // Global access for legacy scripts
    window.FamilyConstants = Object.assign(window.FamilyConstants || {}, {
        FAMILY_CREATE_COST,
        FAMILY_LEVEL_CONFIG,
        FAMILY_SIGN_LEVELS,
        FAMILY_ROLE_CONFIG,
        FAMILY_TASKS_CONFIG,
        FAMILY_EMBLEMS,
        DAILY_TASKS_MILESTONES,
        getFamilyLevelConfig,
        getFamilyRole,
        getFamilySignLevelData,
        getFamilySignLevelDataByLevel,
        getFamilySignImage,
        SIGN_FALLBACK,
    });
})();
