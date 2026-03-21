// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// â³ ITEM EXPIRY SYSTEM â€” Ø¯Ø§Ù„Ø© Ø§Ù„ÙˆÙ‚Øª Ù„ÙƒÙ„ Ø¢ÙŠØªÙ… ÙÙŠ Ø§Ù„Ø¥Ù†ÙÙ†ØªØ±ÙŠ
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//
// ðŸ“– ÙƒÙŠÙÙŠØ© Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… ÙÙŠ Ø§Ù„Ø´ÙˆØ¨ Ø£Ùˆ Ø§Ù„ÙØ§Ù† Ø¨Ø§Ø³:
//   1. ÙƒÙ„ Ø¢ÙŠØªÙ… Ø¹Ù†Ø¯Ù‡ Ø­Ù‚Ù„ "durationDays" â€” Ù„Ùˆ null ÙŠØ¹Ù†ÙŠ Ø£Ø¨Ø¯ÙŠØŒ Ù„Ùˆ Ø±Ù‚Ù… ÙŠØ¹Ù†ÙŠ ÙŠÙˆÙ…
//   2. Ù„Ù…Ø§ ØªØ¶ÙŠÙ Ø¢ÙŠØªÙ… Ù„Ù„Ø¥Ù†ÙÙ†ØªØ±ÙŠØŒ Ø§ÙƒØªØ¨ Ù…Ø¹Ù‡ "expiresAt" ÙÙŠ Firestore:
//      expiresAt = Date.now() + (item.durationDays * 24 * 60 * 60 * 1000)
//   3. Ø§Ù„Ø¯Ø§Ù„Ø© "isItemExpired" ØªØªØ­Ù‚Ù‚ Ù…Ù†Ù‡ ÙƒÙ„ Ù…Ø±Ø©
//
// âœ… Ù…Ø«Ø§Ù„ Ø¥Ø¶Ø§ÙØ© Ø¢ÙŠØªÙ… Ø¨ÙˆÙ‚Øª (frames/badges/titles):
//   await usersCollection.doc(uid).update({
//     [`inventory.frames`]: firebase.firestore.FieldValue.arrayUnion(item.id),
//     [`inventory.expiry.${item.id}`]: item.durationDays
//         ? Date.now() + item.durationDays * 86400000
//         : null,
//   });
//
// âœ… Ù…Ø«Ø§Ù„ Ø¥Ø¶Ø§ÙØ© Ù‡Ø¯ÙŠØ© Ø¨ÙˆÙ‚Øª (gifts):
//   await usersCollection.doc(uid).update({
//     'inventory.gifts': firebase.firestore.FieldValue.arrayUnion(item.id),
//     [`inventory.giftCounts.${item.id}`]: currentCount + 1,
//     [`inventory.expiry.${item.id}`]: buildItemExpiresAt(item.durationDays),
//   });
//
// âœ… Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø§Ù†ØªÙ‡Ø§Ø¡:
//   const expired = isItemExpired(userData?.inventory?.expiry?.[item.id]);
//   if (expired) { /* Ø­Ø°Ù Ø§Ù„Ø¢ÙŠØªÙ… Ù…Ù† Ø§Ù„Ø¥Ù†ÙÙ†ØªØ±ÙŠ */ }
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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
    { id: 1, label_en: '1 min',   label_ar: 'Ù¡ Ø¯Ù‚ÙŠÙ‚Ø©',   duration: 60000,   reward: { type:'currency', amount:50,  icon:'ðŸ§ '}, comingSoon: false },
    { id: 2, label_en: '5 min',   label_ar: 'Ù¥ Ø¯Ù‚Ø§Ø¦Ù‚',   duration: 300000,  reward: { type:'currency', amount:100, icon:'ðŸ§ '}, comingSoon: false },
    { id: 3, label_en: '10 min',  label_ar: 'Ù¡Ù  Ø¯Ù‚Ø§Ø¦Ù‚',  duration: 600000,  reward: { type:'currency', amount:150, icon:'ðŸ§ '}, comingSoon: false },
    { id: 4, label_en: 'VIP',     label_ar: 'VIP',        duration: null,    reward: { type:'currency', amount:300, icon:'ðŸ‘‘'}, comingSoon: true  },
    { id: 5, label_en: '20 min',  label_ar: 'Ù¢Ù  Ø¯Ù‚ÙŠÙ‚Ø©',  duration: 1200000, reward: { type:'currency', amount:200, icon:'ðŸ§ '}, comingSoon: false },
    { id: 6, label_en: '30 min',  label_ar: 'Ù£Ù  Ø¯Ù‚ÙŠÙ‚Ø©',  duration: 1800000, reward: { type:'currency', amount:300, icon:'ðŸ§ '}, comingSoon: false },
    { id: 7, label_en: '60 min',  label_ar: 'Ù¦Ù  Ø¯Ù‚ÙŠÙ‚Ø©',  duration: 3600000, reward: { type:'currency', amount:500, icon:'ðŸ§ '}, comingSoon: false },
    { id: 8, label_en: 'VIP',     label_ar: 'VIP',        duration: null,    reward: { type:'currency', amount:800, icon:'ðŸ‘‘'}, comingSoon: true  },
];

// CHARISMA LEVELS - 21 Levels
var HARISMA_LEVELS = [
    { level: 1, threshold: 0, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/star1.png', name_en: 'Rising Star', name_ar: 'Ù†Ø¬Ù… ØµØ§Ø¹Ø¯', color: '#ffd700', badge_class: 'level-1-3' },
    { level: 2, threshold: 4000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/star2.png', name_en: 'Shining Star', name_ar: 'Ù†Ø¬Ù… Ø³Ø§Ø·Ø¹', color: '#ffd700', badge_class: 'level-1-3' },
    { level: 3, threshold: 12000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/star3.png', name_en: 'Bright Star', name_ar: 'Ù†Ø¬Ù… Ù…Ø¶ÙŠØ¡', color: '#ffd700', badge_class: 'level-1-3' },
    { level: 4, threshold: 30000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/1d.png', name_en: 'Diamond I', name_ar: 'Ù…Ø§Ø³Ø© 1', color: '#3b82f6', badge_class: 'level-4-6' },
    { level: 5, threshold: 80000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/4d.png', name_en: 'Diamond II', name_ar: 'Ù…Ø§Ø³Ø© 2', color: '#3b82f6', badge_class: 'level-4-6' },
    { level: 6, threshold: 160000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/3d.png', name_en: 'Diamond III', name_ar: 'Ù…Ø§Ø³Ø© 3', color: '#3b82f6', badge_class: 'level-4-6' },
    { level: 7, threshold: 300000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Crown1.png', name_en: 'Crown I', name_ar: 'ØªØ§Ø¬ 1', color: '#ffd700', badge_class: 'level-7-9' },
    { level: 8, threshold: 500000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Crown2.png', name_en: 'Crown II', name_ar: 'ØªØ§Ø¬ 2', color: '#ffd700', badge_class: 'level-7-9' },
    { level: 9, threshold: 1000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Crown3.png', name_en: 'Crown III', name_ar: 'ØªØ§Ø¬ 3', color: '#ffd700', badge_class: 'level-7-9' },
    { level: 10, threshold: 2000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Royal%20Crown1.png', name_en: 'Royal Crown I', name_ar: 'ØªØ§Ø¬ Ù…Ù„ÙƒÙŠ 1', color: '#f97316', badge_class: 'level-10-12' },
    { level: 11, threshold: 3500000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Royal%20Crown2.png', name_en: 'Royal Crown II', name_ar: 'ØªØ§Ø¬ Ù…Ù„ÙƒÙŠ 2', color: '#f97316', badge_class: 'level-10-12' },
    { level: 12, threshold: 6000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Royal%20Crown3.png', name_en: 'Royal Crown III', name_ar: 'ØªØ§Ø¬ Ù…Ù„ÙƒÙŠ 3', color: '#f97316', badge_class: 'level-10-12' },
    { level: 13, threshold: 8500000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Purple%20Crown1.png', name_en: 'Purple Crown I', name_ar: 'ØªØ§Ø¬ Ø¨Ù†ÙØ³Ø¬ÙŠ 1', color: '#8b5cf6', badge_class: 'level-13-15' },
    { level: 14, threshold: 12000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Purple%20Crown2.png', name_en: 'Purple Crown II', name_ar: 'ØªØ§Ø¬ Ø¨Ù†ÙØ³Ø¬ÙŠ 2', color: '#8b5cf6', badge_class: 'level-13-15' },
    { level: 15, threshold: 16000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Purple%20Crown3.png', name_en: 'Purple Crown III', name_ar: 'ØªØ§Ø¬ Ø¨Ù†ÙØ³Ø¬ÙŠ 3', color: '#8b5cf6', badge_class: 'level-13-15' },
    { level: 16, threshold: 26000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Legend1.png', name_en: 'Legend I', name_ar: 'Ø£Ø³Ø·ÙˆØ±Ø© 1', color: '#f97316', badge_class: 'level-16-21', hasGlow: true },
    { level: 17, threshold: 48000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Legend2.png', name_en: 'Legend II', name_ar: 'Ø£Ø³Ø·ÙˆØ±Ø© 2', color: '#f97316', badge_class: 'level-16-21', hasGlow: true },
    { level: 18, threshold: 86000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Legend3.png', name_en: 'Legend III', name_ar: 'Ø£Ø³Ø·ÙˆØ±Ø© 3', color: '#f97316', badge_class: 'level-16-21', hasGlow: true },
    { level: 19, threshold: 120000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Legend4.png', name_en: 'Legend IV', name_ar: 'Ø£Ø³Ø·ÙˆØ±Ø© 4', color: '#f97316', badge_class: 'level-16-21', hasGlow: true },
    { level: 20, threshold: 240000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/Legend5.png', name_en: 'Legend V', name_ar: 'Ø£Ø³Ø·ÙˆØ±Ø© 5', color: '#f97316', badge_class: 'level-16-21', hasGlow: true },
    { level: 21, threshold: 360000000, icon: '', iconType: 'image', iconUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/main/icos/Ultimate%20Legend.gif', name_en: 'Ultimate Legend', name_ar: 'Ø§Ù„Ø£Ø³Ø·ÙˆØ±Ø© Ø§Ù„Ù…Ø·Ù„Ù‚Ø©', color: '#00d4ff', badge_class: 'level-divine', isDivine: true, isMaxLevel: true, hasGlow: true },
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
        { id: 'frame_gold', name_en: "Gold Frame", name_ar: "Ø¥Ø·Ø§Ø± Ø°Ù‡Ø¨ÙŠ", cost: 500, type: 'frames', preview: 'linear-gradient(45deg, #f7ff00, #db9700)' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_neon', name_en: "Neon Frame", name_ar: "Ø¥Ø·Ø§Ø± Ù†ÙŠÙˆÙ†", cost: 300, type: 'frames', preview: 'linear-gradient(45deg, #00f2ff, #7000ff)' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_fire', name_en: "Fire Frame", name_ar: "Ø¥Ø·Ø§Ø± Ù†Ø§Ø±", cost: 400, type: 'frames', preview: 'linear-gradient(45deg, #ff0055, #ff8800)' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_img', name_en: "Image Frame", name_ar: "Ø¥Ø·Ø§Ø± ØµÙˆØ±Ø©", cost: 100, type: 'frames', preview: 'https://i.ibb.co/mVQTLr2D/Untitled-3.png' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_1', name_en: " Frame", name_ar: "Ø¥Ø·Ø§Ø± Ù…ØªØ­Ø±Ùƒ", cost: 0, type: 'frames', preview: 'https://i.ibb.co/4Rj8jzWS/0202.png' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_rainbow', name_en: "Rainbow Frame", name_ar: "Ø¥Ø·Ø§Ø± Ù‚ÙˆØ³ Ù‚Ø²Ø­", cost: 600, type: 'frames', preview: 'https://i.ibb.co/1tvtgmD8/ezgif-com-optimize.gif' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_ice', name_en: "Ice Frame", name_ar: "Ø¥Ø·Ø§Ø± Ø¬Ù„ÙŠØ¯", cost: 350, type: 'frames', preview: 'linear-gradient(45deg, #00d4ff, #ffffff, #00d4ff)' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'frame_shehab', name_en: "Shehab Frame", name_ar: "Ø¥Ø·Ø§Ø± Ù‚ÙˆØ³ Ù‚Ø²Ø­", cost: 600, type: 'frames', preview: 'https://i.ibb.co/xKgsYCZ3/shehab.gif' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },

        // â•â•â•â• UNCOMMON ITEMS â€” Ù„ÙˆÙ† Ø£Ø®Ø¶Ø± â•â•â•â•
        { id: 'frame_mint', name_en: "Mint Frame", name_ar: "Ø¥Ø·Ø§Ø± Ù†Ø¹Ù†Ø§Ø¹ÙŠ", cost: 75, type: 'frames', rarity: 'Uncommon', preview: 'linear-gradient(45deg, #4ade80, #22d3ee)' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // â•â•â•â• FunPass Exclusive Frames â€” hidden in shop, from FunPass rewards â•â•â•â•
        { id: 'fp_frame_neon',     name_en: "Neon Frame",     name_ar: "Ø¥Ø·Ø§Ø± Ù†ÙŠÙˆÙ†",        cost: 0, type: 'frames', rarity: 'Rare',      preview: 'linear-gradient(45deg,#00f2ff,#7000ff)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_star',     name_en: "Star Frame",     name_ar: "Ø¥Ø·Ø§Ø± Ù†Ø¬Ù…Ø©",        cost: 0, type: 'frames', rarity: 'Epic',      preview: 'linear-gradient(45deg,#ffe066,#ff8800)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_crystal',  name_en: "Crystal Frame",  name_ar: "Ø¥Ø·Ø§Ø± ÙƒØ±ÙŠØ³ØªØ§Ù„",     cost: 0, type: 'frames', rarity: 'Epic',      preview: 'linear-gradient(45deg,#67e8f9,#a5f3fc)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_vortex',   name_en: "Vortex Frame",   name_ar: "Ø¥Ø·Ø§Ø± Ø¯ÙˆØ§Ù…Ø©",       cost: 0, type: 'frames', rarity: 'Epic',      preview: 'linear-gradient(45deg,#818cf8,#a78bfa)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_gold',     name_en: "Gold Frame",     name_ar: "Ø¥Ø·Ø§Ø± Ø°Ù‡Ø¨ÙŠ",        cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#ffd700,#ff8800)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_moon',     name_en: "Moon Frame",     name_ar: "Ø¥Ø·Ø§Ø± Ø§Ù„Ù‚Ù…Ø±",       cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#1e1b4b,#7c3aed)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_inferno',  name_en: "Inferno Frame",  name_ar: "Ø¥Ø·Ø§Ø± Ø¬Ù‡Ù†Ù…",        cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#ef4444,#f97316)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_thunder',  name_en: "Thunder Frame",  name_ar: "Ø¥Ø·Ø§Ø± Ø§Ù„Ø±Ø¹Ø¯",       cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#fbbf24,#1d4ed8)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_skull',    name_en: "Skull Frame",    name_ar: "Ø¥Ø·Ø§Ø± Ø§Ù„Ø¬Ù…Ø¬Ù…Ø©",     cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#111827,#374151)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_mystic',   name_en: "Mystic Frame",   name_ar: "Ø¥Ø·Ø§Ø± ØºØ§Ù…Ø¶",        cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#7c3aed,#4c1d95)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_rainbow',  name_en: "Rainbow Frame",  name_ar: "Ø¥Ø·Ø§Ø± Ù‚ÙˆØ³ Ù‚Ø²Ø­",     cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(90deg,#f87171,#fb923c,#fbbf24,#4ade80,#60a5fa,#c084fc)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_dark',     name_en: "Dark Frame",     name_ar: "Ø¥Ø·Ø§Ø± Ø§Ù„Ø¸Ù„Ø§Ù…",      cost: 0, type: 'frames', rarity: 'Legendary', preview: 'linear-gradient(45deg,#030712,#111827)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_mythic',   name_en: "Mythic Frame",   name_ar: "Ø¥Ø·Ø§Ø± Ø®Ø±Ø§ÙÙŠ",       cost: 0, type: 'frames', rarity: 'Mythic',    preview: 'linear-gradient(45deg,#ff0055,#7c3aed)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_prism',    name_en: "Prism Frame",    name_ar: "Ø¥Ø·Ø§Ø± Ø§Ù„Ù…Ù†Ø´ÙˆØ±",     cost: 0, type: 'frames', rarity: 'Mythic',    preview: 'linear-gradient(90deg,#00d4ff,#ff0055,#00d4ff)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_void',     name_en: "Void Frame",     name_ar: "Ø¥Ø·Ø§Ø± Ø§Ù„ÙØ±Ø§Øº",      cost: 0, type: 'frames', rarity: 'Mythic',    preview: 'linear-gradient(45deg,#000000,#1e1b4b)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_phoenix',  name_en: "Phoenix Frame",  name_ar: "Ø¥Ø·Ø§Ø± Ø§Ù„ÙÙŠÙ†ÙŠÙƒØ³",    cost: 0, type: 'frames', rarity: 'Mythic',    preview: 'linear-gradient(45deg,#dc2626,#fb923c)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_frame_nova',     name_en: "Nova Frame",     name_ar: "Ø¥Ø·Ø§Ø± Ø§Ù„Ù†Ø¬Ù… Ø§Ù„Ù…ØªÙØ¬Ø±", cost: 0, type: 'frames', rarity: 'Mythic', preview: 'linear-gradient(45deg,#fde68a,#fbbf24,#f59e0b)', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // â•â• SEASON EXCLUSIVE FRAMES â•â•
        // ðŸ”§ Ù„ØªØºÙŠÙŠØ± Ø§Ù„Ø³ÙŠØ²ÙˆÙ†: ØºÙŠÙ‘Ø± season: '1' Ø¥Ù„Ù‰ '2' Ø£Ùˆ '3' Ø¥Ù„Ø®
        { id: 'frame_s1_celestial', name_en: "Celestial Frame", name_ar: "Ø¥Ø·Ø§Ø± Ø³Ù…Ø§ÙˆÙŠ", cost: 0, type: 'frames', preview: 'linear-gradient(45deg,#00d4ff,#7c3aed,#00d4ff)', hidden: false, isEvent: false, limitedTime: true, eventOnly: true, durationDays: null, season: '1', rarity: 'Divine' },
    ],
    // â•â• PROFILE BANNERS â•â•
    // ðŸ”§ Ù„Ø¥Ø¶Ø§ÙØ© Ø¨Ù†Ø±Ø§Øª Ù„Ù„Ù…ØªØ¬Ø±: Ø£Ø¶Ù Ù‡Ù†Ø§
    banners: [
        // â•â• SEASON EXCLUSIVE BANNERS â•â•
        // ðŸ”§ Ù„ØªØºÙŠÙŠØ± Ø§Ù„Ø³ÙŠØ²ÙˆÙ†: ØºÙŠÙ‘Ø± season: '1' Ø¥Ù„Ù‰ '2' Ø£Ùˆ '3' Ø¥Ù„Ø®
        { id: 'banner_s1_aurora', name_en: "Aurora Banner", name_ar: "Ø¨Ù†Ø± Ø§Ù„Ø´ÙÙ‚", cost: 0, type: 'banners', preview: 'linear-gradient(135deg,#0a0a2e,#1a1a4e,#00d4ff22,#7c3aed44)', hidden: false, isEvent: false, limitedTime: true, eventOnly: true, durationDays: null, season: '1', rarity: 'Divine' },
    ],
    titles: [
        { id: 'title_spy', name_en: "Mr. Spy", name_ar: "Ø³ÙŠØ¯ Ø¬Ø§Ø³ÙˆØ³", cost: 600, type: 'titles', preview: 'ðŸ•µï¸', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'title_hunter', name_en: "Hunter", name_ar: "ØµÙŠØ§Ø¯", cost: 450, type: 'titles', preview: 'ðŸŽ¯', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'title_ghost', name_en: "Ghost", name_ar: "Ø´Ø¨Ø­", cost: 800, type: 'titles', preview: 'ðŸ‘»', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'title_legend', name_en: "Legend", name_ar: "Ø£Ø³Ø·ÙˆØ±Ø©", cost: 1500, type: 'titles', preview: 'ðŸ‘‘', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'title_pro', name_en: "Pro Player", name_ar: "Ù…Ø­ØªØ±Ù", cost: 1000, type: 'titles', preview: 'â­', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'title_shadow', name_en: "Shadow", name_ar: "Ø¸Ù„", cost: 700, type: 'titles', preview: '', imageUrl: 'https://i.ibb.co/xqk8md71/122222.png' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // â•â•â•â• UNCOMMON TITLES â•â•â•â•
        { id: 'title_rookie', name_en: "Rookie", name_ar: "Ù…Ø¨ØªØ¯Ø¦", cost: 80, type: 'titles', rarity: 'Uncommon', preview: 'ðŸŒ±', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'title_scout', name_en: "Scout", name_ar: "ÙƒØ´Ø§Ù", cost: 120, type: 'titles', rarity: 'Uncommon', preview: 'ðŸ”­', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // â•â•â•â• FunPass Exclusive Titles â€” hidden in shop â•â•â•â•
        { id: 'fp_title_agent',   name_en: "Agent",    name_ar: "Ø¹Ù…ÙŠÙ„",          cost: 0, type: 'titles', rarity: 'Rare',      preview: 'ðŸ•µï¸', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_star',    name_en: "Star",     name_ar: "Ù†Ø¬Ù…Ø©",          cost: 0, type: 'titles', rarity: 'Epic',      preview: 'ðŸŒŸ', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_warrior', name_en: "Warrior",  name_ar: "Ù…Ø­Ø§Ø±Ø¨",         cost: 0, type: 'titles', rarity: 'Epic',      preview: 'âš”ï¸', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_eye',     name_en: "The Eye",  name_ar: "Ø§Ù„Ø¹ÙŠÙ†",         cost: 0, type: 'titles', rarity: 'Epic',      preview: 'ðŸ‘ï¸', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_shadow',  name_en: "Shadow",   name_ar: "Ø§Ù„Ø¸Ù„",          cost: 0, type: 'titles', rarity: 'Legendary', preview: 'ðŸŒ™', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_gold',    name_en: "Gold",     name_ar: "Ø°Ù‡Ø¨ÙŠ",          cost: 0, type: 'titles', rarity: 'Legendary', preview: 'ðŸ…', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_ocean',   name_en: "Ocean",    name_ar: "Ø§Ù„Ù…Ø­ÙŠØ·",        cost: 0, type: 'titles', rarity: 'Legendary', preview: 'ðŸŒŠ', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_king',    name_en: "King",     name_ar: "Ø§Ù„Ù…Ù„Ùƒ",         cost: 0, type: 'titles', rarity: 'Legendary', preview: 'ðŸ‘‘', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_flame',   name_en: "Flame",    name_ar: "Ø§Ù„Ù„Ù‡Ø¨",         cost: 0, type: 'titles', rarity: 'Legendary', preview: 'ðŸ”¥', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_rainbow', name_en: "Rainbow",  name_ar: "Ù‚ÙˆØ³ Ù‚Ø²Ø­",       cost: 0, type: 'titles', rarity: 'Legendary', preview: 'ðŸŒˆ', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_watcher', name_en: "Watcher",  name_ar: "Ø§Ù„Ø±Ø§ØµØ¯",        cost: 0, type: 'titles', rarity: 'Legendary', preview: 'ðŸ‘ï¸', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_mystic',  name_en: "Mystic",   name_ar: "Ø§Ù„ØºÙ…ÙˆØ¶",        cost: 0, type: 'titles', rarity: 'Mythic',    preview: 'ðŸ”®', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_prism',   name_en: "Prism",    name_ar: "Ø§Ù„Ù…Ù†Ø´ÙˆØ±",       cost: 0, type: 'titles', rarity: 'Mythic',    preview: 'ðŸ’ ', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_void',    name_en: "Void",     name_ar: "Ø§Ù„ÙØ±Ø§Øº",        cost: 0, type: 'titles', rarity: 'Mythic',    preview: 'ðŸŒ€', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_phoenix', name_en: "Phoenix",  name_ar: "Ø§Ù„ÙÙŠÙ†ÙŠÙƒØ³",      cost: 0, type: 'titles', rarity: 'Mythic',    preview: 'ðŸ”¥', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_title_god',     name_en: "GOD",      name_ar: "Ø§Ù„Ø¥Ù„Ù‡",         cost: 0, type: 'titles', rarity: 'Mythic',    preview: 'ðŸ”±', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // â•â• SEASON EXCLUSIVE TITLES â•â•
        // ðŸ”§ Ù„ØªØºÙŠÙŠØ± Ø§Ù„Ø³ÙŠØ²ÙˆÙ†: ØºÙŠÙ‘Ø± season: '1' Ø¥Ù„Ù‰ '2' Ø£Ùˆ '3' Ø¥Ù„Ø®
        { id: 'title_s1_pioneer', name_en: "Season Pioneer", name_ar: "Ø±Ø§Ø¦Ø¯ Ø§Ù„Ù…ÙˆØ³Ù…", cost: 0, type: 'titles', preview: 'ðŸŒŸ', imageUrl: '', hidden: false, isEvent: false, limitedTime: true, eventOnly: true, durationDays: null, season: '1', rarity: 'Divine' },
    ],
    badges: [
        { id: 'badge_vip', name_en: "VIP Badge", name_ar: "Ø´Ø§Ø±Ø© VIP", cost: 1000, type: 'badges', preview: 'â­', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_love', name_en: "Love Badge", name_ar: "Ø´Ø§Ø±Ø© Ø­Ø¨", cost: 800, type: 'badges', preview: 'ðŸ’•', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_pro', name_en: "Pro Badge", name_ar: "Ø´Ø§Ø±Ø© Ù…Ø­ØªØ±Ù", cost: 1500, type: 'badges', preview: 'ðŸ†', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_legend', name_en: "Legend Badge", name_ar: "Ø´Ø§Ø±Ø© Ø£Ø³Ø·ÙˆØ±Ø©", cost: 5000, type: 'badges', preview: 'ðŸ‘‘', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_star', name_en: "Star Badge", name_ar: "Ø´Ø§Ø±Ø© Ù†Ø¬Ù…", cost: 2000, type: 'badges', preview: 'ðŸŒŸ', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_fire', name_en: "Fire Badge", name_ar: "Ø´Ø§Ø±Ø© Ù†Ø§Ø±", cost: 1200, type: 'badges', preview: 'ðŸ”¥', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_ice', name_en: "Ice Badge", name_ar: "Ø´Ø§Ø±Ø© Ø¬Ù„ÙŠØ¯", cost: 1200, type: 'badges', preview: 'â„ï¸', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'badge_diamond', name_en: "Diamond Badge", name_ar: "Ø´Ø§Ø±Ø© Ù…Ø§Ø³Ø©", cost: 3000, type: 'badges', preview: '', imageUrl: 'https://i.ibb.co/ZR2rv0s3/awaw.png' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // â•â•â•â• UNCOMMON BADGES â•â•â•â•
        { id: 'badge_leaf', name_en: "Leaf Badge", name_ar: "Ø´Ø§Ø±Ø© Ø§Ù„ÙˆØ±Ù‚Ø©", cost: 90, type: 'badges', rarity: 'Uncommon', preview: 'ðŸŒ¿', imageUrl: '' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        // â•â•â•â• FunPass Exclusive Badges â€” hidden in shop â•â•â•â•
        { id: 'fp_badge_rookie',   name_en: "Rookie Badge",   name_ar: "Ø´Ø§Ø±Ø© Ù…Ø¨ØªØ¯Ø¦",       cost: 0, type: 'badges', rarity: 'Common',    preview: 'ðŸ”°', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_speed',    name_en: "Speed Badge",    name_ar: "Ø´Ø§Ø±Ø© Ø§Ù„Ø³Ø±Ø¹Ø©",      cost: 0, type: 'badges', rarity: 'Common',    preview: 'âš¡', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_diamond',  name_en: "Diamond Badge",  name_ar: "Ø´Ø§Ø±Ø© Ø£Ù„Ù…Ø§Ø³",       cost: 0, type: 'badges', rarity: 'Epic',      preview: 'ðŸ’Ž', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_fire',     name_en: "Fire Badge",     name_ar: "Ø´Ø§Ø±Ø© Ø§Ù„Ù†Ø§Ø±",       cost: 0, type: 'badges', rarity: 'Epic',      preview: 'ðŸ”¥', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_sniper',   name_en: "Sniper Badge",   name_ar: "Ø´Ø§Ø±Ø© Ø§Ù„Ù‚Ù†Ø§Øµ",      cost: 0, type: 'badges', rarity: 'Epic',      preview: 'ðŸŽ¯', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_legend',   name_en: "Legend Badge",   name_ar: "Ø´Ø§Ø±Ø© Ø£Ø³Ø·ÙˆØ±ÙŠØ©",     cost: 0, type: 'badges', rarity: 'Legendary', preview: 'â­', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_galaxy',   name_en: "Galaxy Badge",   name_ar: "Ø´Ø§Ø±Ø© Ø§Ù„Ù…Ø¬Ø±Ø©",      cost: 0, type: 'badges', rarity: 'Legendary', preview: 'ðŸŒŒ', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_gold',     name_en: "Gold Badge",     name_ar: "Ø´Ø§Ø±Ø© Ø°Ù‡Ø¨ÙŠØ©",       cost: 0, type: 'badges', rarity: 'Legendary', preview: 'ðŸ…', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_thunder',  name_en: "Thunder Badge",  name_ar: "Ø´Ø§Ø±Ø© Ø§Ù„Ø±Ø¹Ø¯",       cost: 0, type: 'badges', rarity: 'Legendary', preview: 'âš¡', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_mystic',   name_en: "Mystic Badge",   name_ar: "Ø´Ø§Ø±Ø© ØºØ§Ù…Ø¶Ø©",       cost: 0, type: 'badges', rarity: 'Legendary', preview: 'ðŸ”®', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_blast',    name_en: "Blast Badge",    name_ar: "Ø´Ø§Ø±Ø© Ø§Ù„Ø§Ù†ÙØ¬Ø§Ø±",    cost: 0, type: 'badges', rarity: 'Legendary', preview: 'ðŸ’¥', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_dark',     name_en: "Dark Badge",     name_ar: "Ø´Ø§Ø±Ø© Ø§Ù„Ø¸Ù„Ø§Ù…",      cost: 0, type: 'badges', rarity: 'Legendary', preview: 'ðŸŒ‘', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_arrow',    name_en: "Arrow Badge",    name_ar: "Ø´Ø§Ø±Ø© Ø§Ù„Ø³Ù‡Ù…",       cost: 0, type: 'badges', rarity: 'Legendary', preview: 'ðŸ¹', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_prism',    name_en: "Prism Badge",    name_ar: "Ø´Ø§Ø±Ø© Ø§Ù„Ù…Ù†Ø´ÙˆØ±",     cost: 0, type: 'badges', rarity: 'Mythic',    preview: 'ðŸ’ ', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_void',     name_en: "Void Badge",     name_ar: "Ø´Ø§Ø±Ø© Ø§Ù„ÙØ±Ø§Øº",      cost: 0, type: 'badges', rarity: 'Mythic',    preview: 'ðŸŒ€', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_phoenix',  name_en: "Phoenix Badge",  name_ar: "Ø´Ø§Ø±Ø© Ø§Ù„ÙÙŠÙ†ÙŠÙƒØ³",    cost: 0, type: 'badges', rarity: 'Mythic',    preview: 'ðŸ”¥', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'fp_badge_nova',     name_en: "Nova Badge",     name_ar: "Ø´Ø§Ø±Ø© Ø§Ù„Ù†Ø¬Ù… Ø§Ù„Ù…ØªÙØ¬Ø±", cost: 0, type: 'badges', rarity: 'Mythic', preview: 'ðŸŒŸ', imageUrl: '', hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
    ],
    themes: [
        { id: 'theme_dark', name_en: "Midnight", name_ar: "Ù…Ù†ØªØµÙ Ø§Ù„Ù„ÙŠÙ„", cost: 200, type: 'themes' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
        { id: 'theme_ocean', name_en: "Ocean Blue", name_ar: "Ø£Ø²Ø±Ù‚ Ù…Ø­ÙŠØ·ÙŠ", cost: 300, type: 'themes' , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null },
    ],
    profileEffects: [
        { id: 'effect_sakura', name_en: "Sakura Petals", name_ar: "Ø²Ù‡ÙˆØ± Ø§Ù„ÙƒØ±Ø²",  cost: 300,  type: 'profileEffects', rarity: 'Rare',      preview: 'ðŸŒ¸', particles: [{emoji:'ðŸŒ¸',count:12},{emoji:'ðŸŒº',count:8}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_hearts', name_en: "Heart Shower",  name_ar: "Ø¯Ø´ Ø§Ù„Ù‚Ù„ÙˆØ¨",   cost: 300,  type: 'profileEffects', rarity: 'Rare',      preview: 'ðŸ’–', particles: [{emoji:'ðŸ’–',count:12},{emoji:'ðŸ’•',count:10},{emoji:'â¤ï¸',count:8}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_stars',  name_en: "Star Burst",    name_ar: "Ø§Ù†ÙØ¬Ø§Ø± Ù†Ø¬ÙˆÙ…", cost: 300, type: 'profileEffects', rarity: 'Rare',      preview: 'â­', particles: [{emoji:'â­',count:10},{emoji:'âœ¨',count:14},{emoji:'ðŸ’«',count:8}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_fire',   name_en: "Fire Storm",    name_ar: "Ø¹Ø§ØµÙØ© Ù†Ø§Ø±ÙŠØ©", cost: 300, type: 'profileEffects', rarity: 'Rare',      preview: 'ðŸ”¥', particles: [{emoji:'ðŸ”¥',count:15},{emoji:'ðŸ’¥',count:6}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_ghost',  name_en: "Ghost Mode",    name_ar: "ÙˆØ¶Ø¹ Ø§Ù„Ø´Ø¨Ø­",   cost: 300, type: 'profileEffects', rarity: 'Rare',      preview: 'ðŸ‘»', particles: [{emoji:'ðŸ‘»',count:8},{emoji:'ðŸ’€',count:6},{emoji:'ðŸ•¯ï¸',count:8}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_money',  name_en: "Money Rain",    name_ar: "Ù…Ø·Ø± Ø§Ù„Ø£Ù…ÙˆØ§Ù„", cost: 300, type: 'profileEffects', rarity: 'Rare', preview: 'ðŸ’°', particles: [{emoji:'ðŸ’°',count:10},{emoji:'ðŸ§ ',count:12},{emoji:'ðŸ’µ',count:8}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_crown',  name_en: "Royal Crown",   name_ar: "ØªØ§Ø¬ Ù…Ù„ÙƒÙŠ",    cost: 300, type: 'profileEffects', rarity: 'Rare', preview: 'ðŸ‘‘', particles: [{emoji:'ðŸ‘‘',count:6},{emoji:'ðŸ’Ž',count:8},{emoji:'âœ¨',count:12}], duration: 2200 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_galaxy', name_en: "Galaxy",        name_ar: "Ù…Ø¬Ø±Ø©",        cost: 300, type: 'profileEffects', rarity: 'Rare',    preview: 'ðŸŒŒ', particles: [{emoji:'ðŸŒŸ',count:8},{emoji:'ðŸ’«',count:10},{emoji:'ðŸŒ™',count:6},{emoji:'â­',count:8}], duration: 2500 , hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: null, season: null, maxSendOptions: null },
        { id: 'effect_gif', name_en: "SuperGirl",  name_ar: "Ø³ÙˆØ¨Ø± Ø¬ÙŠØ±Ù„",  cost: 3000, type: 'profileEffects', rarity: 'Mythic',    preview: 'https://s13.gifyu.com/images/bmv39.gif', imageUrl: 'https://s13.gifyu.com/images/bmv39.gif', particles: [], duration: 2, loopEvery: 9999999, displayDuration: 2000, showOnce: true, opacity: 0.82, blendMode: 'overlay', hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 3, season: null, maxSendOptions: null },
        { id: 'effect_gif2', name_en: "Glow Burst",      name_ar: "ÙˆÙ…Ø¶Ø© Ù†ÙŠÙˆÙ†",    cost: 3500, type: 'profileEffects', rarity: 'Mythic',    preview: 'https://s13.gifyu.com/images/bmvMv.gif', imageUrl: 'https://s13.gifyu.com/images/bmvMv.gif', particles: [], duration: 2, loopEvery: 9999999, displayDuration: 2000, showOnce: true, opacity: 0.88, blendMode: 'screen', hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 3, season: null, maxSendOptions: null },
        { id: 'effect_gif3', name_en: "Aura Pulse",      name_ar: "Ù†Ø¨Ø¶Ø© Ø§Ù„Ø£ÙˆØ±Ø§",  cost: 3500, type: 'profileEffects', rarity: 'Mythic',    preview: 'https://s13.gifyu.com/images/bmvMm.gif', imageUrl: 'https://s13.gifyu.com/images/bmvMm.gif', particles: [], duration: 2, loopEvery: 9999999, displayDuration: 2000, showOnce: true, opacity: 0.88, blendMode: 'screen', hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 3, season: null, maxSendOptions: null },
        { id: 'Volcano_Woman', name_en: "Volcano Woman",      name_ar: "Ø§Ù…Ø±Ø§Ù‡ Ø§Ù„Ø¨Ø±ÙƒØ§Ù†",  cost: 3500, type: 'profileEffects', rarity: 'Mythic',    preview: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/main/icos/profileEffects/Volcano%20Woman.gif', imageUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/main/icos/profileEffects/Volcano%20Woman.gif', particles: [], duration: 2, loopEvery: 9999999, displayDuration: 2000, showOnce: true, opacity: 0.88, blendMode: 'screen', hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 3, season: null, maxSendOptions: null },
        { id: 'fire_Woman', name_en: "fire Woman",      name_ar: "Ø§Ù…Ø±Ø£Ø© Ø§Ù„Ù†Ø§Ø±",  cost: 3500, type: 'profileEffects', rarity: 'Mythic',    preview: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/main/icos/profileEffects/fire%20Woman.gif', imageUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/main/icos/profileEffects/fire%20Woman.gif', particles: [], duration: 2, loopEvery: 9999999, displayDuration: 2000, showOnce: true, opacity: 0.88, blendMode: 'screen', hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 3, season: null, maxSendOptions: null },
        { id: 'lightning_woman', name_en: "lightning woman",      name_ar: "Ø§Ù…Ø±Ø£Ø© Ø§Ù„Ø¨Ø±Ù‚",  cost: 3500, type: 'profileEffects', rarity: 'Mythic',    preview: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/main/icos/profileEffects/lightning%20woman.gif', imageUrl: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/main/icos/profileEffects/lightning%20woman.gif', particles: [], duration: 2, loopEvery: 9999999, displayDuration: 2000, showOnce: true, opacity: 0.88, blendMode: 'screen', hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 3, season: null, maxSendOptions: null },

    ],
    // âœ… BFF TOKENS â€” purchased to create relationships
    bff_tokens: [], // populated from BFF_TOKEN_ITEMS in 01-config.js at runtime
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // ðŸŽ GIFTS SYSTEM â€” v3 (30-Day Expiry Edition)
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    //
    // ðŸ“ Ø§Ù„Ù‚ÙˆØ§Ø¹Ø¯ Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ© (Ù…Ù† Ø§Ù„ØµÙˆØ±):
    //    â€¢ charisma   = cost Ã· 5         (ÙƒÙ„ 5 Ø¬ÙˆÙ„Ø¯ = 1 ÙƒØ§Ø±ÙŠØ²Ù…Ø§)
    //    â€¢ maxBonus   = cost Ã— 5         (Ø§Ù„Ù…Ø³ØªÙ„Ù… ÙŠØ­ØµÙ„ Ø­ØªÙ‰ 5Ã— Ù‚ÙŠÙ…Ø© Ø§Ù„Ù‡Ø¯ÙŠØ©)
    //    â€¢ Ø¨ÙˆÙ†Øµ ÙÙ‚Ø· Ù„Ùˆ cost â‰¥ 100       (Ø£Ù‚Ù„ Ù…Ù† 100 Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù…Ø±Ø¯ÙˆØ¯ ÙƒÙˆÙŠÙ†)
    //    â€¢ vipXP      = max(1, charisma Ã· 20)
    //    â€¢ durationDays: 30              (ÙƒÙ„ Ø§Ù„Ù‡Ø¯Ø§ÙŠØ§ ØªÙ†ØªÙ‡ÙŠ Ø¨Ø¹Ø¯ 30 ÙŠÙˆÙ…)
    //    â€¢ maxSendOptions: [1,3,5,10]   (Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ù…ØªØ¹Ø¯Ø¯)
    //
    // ðŸ… Ù†Ø¸Ø§Ù… Ø§Ù„Ù†Ø¬ÙˆÙ… (Stars):
    //    â€¢ 1-9 Ù‡Ø¯Ø§ÙŠØ§ Ù…Ø³ØªÙ„Ù…Ø©  â†’ â­ 1 Ù†Ø¬Ù…Ø©
    //    â€¢ 10-29             â†’ â­â­ 2 Ù†Ø¬ÙˆÙ…
    //    â€¢ 30+               â†’ â­â­â­ 3 Ù†Ø¬ÙˆÙ…
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    gifts: [

        // â”€â”€ âšª Common â€” Ø¨Ø¯ÙˆÙ† Ù…Ø±Ø¯ÙˆØ¯ ÙƒÙˆÙŠÙ† (cost < 100) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        { id: 'gift_rose',     name_en: "Rose",        name_ar: "ÙˆØ±Ø¯Ø©",       cost: 10,   type: 'gifts', charisma: 2,    vipXP: 1,   minBonus: 0, maxBonus: 0,      desc_ar: "ÙˆØ±Ø¯Ø© Ø¬Ù…ÙŠÙ„Ø© ØªØ¹Ø¨Ù‘Ø± Ø¹Ù† Ù…Ø´Ø§Ø¹Ø±Ùƒ",     desc_en: "A beautiful rose to express your feelings",  emoji: "ðŸŒ¹", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_candy',    name_en: "Candy",       name_ar: "Ø­Ù„ÙˆÙ‰",       cost: 20,   type: 'gifts', charisma: 4,    vipXP: 1,   minBonus: 0, maxBonus: 0,      desc_ar: "Ø­Ù„Ø§ÙˆØ© ØªÙÙØ±Ø­ Ø§Ù„Ù‚Ù„Ø¨",               desc_en: "Sweetness that brightens the heart",          emoji: "ðŸ¬", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_teddy',    name_en: "Teddy Bear",  name_ar: "Ø¯Ø¨ Ù†Ø§Ø¹Ù…",    cost: 50,   type: 'gifts', charisma: 10,   vipXP: 1,   minBonus: 0, maxBonus: 0,      desc_ar: "Ø¯Ø¨ Ù‚Ø·Ù†ÙŠ Ù†Ø§Ø¹Ù… Ù…Ù„ÙŠØ¡ Ø¨Ø§Ù„Ø­Ù†Ø§Ù†",       desc_en: "A soft teddy bear full of warmth",            emoji: "ðŸ§¸", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },

        // â”€â”€ ðŸŸ¢ Uncommon â€” Ù…Ø±Ø¯ÙˆØ¯ Ø­ØªÙ‰ 5Ã— (100 â‰¤ cost < 500) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        { id: 'gift_coffee',   name_en: "Coffee",      name_ar: "Ù‚Ù‡ÙˆØ©",       cost: 100,  type: 'gifts', charisma: 20,   vipXP: 1,   minBonus: 1, maxBonus: 500,    desc_ar: "Ù‚Ù‡ÙˆØ© ØµØ¨Ø§Ø­ÙŠØ© ØªØ´Ø­Ù† Ø·Ø§Ù‚ØªÙƒ",         desc_en: "Morning coffee to charge your energy",        emoji: "â˜•", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_cake',     name_en: "Cake",        name_ar: "ÙƒÙŠÙƒØ©",       cost: 200,  type: 'gifts', charisma: 40,   vipXP: 2,   minBonus: 1, maxBonus: 1000,   desc_ar: "ÙƒÙŠÙƒØ© Ù„Ù„Ø§Ø­ØªÙØ§Ù„ Ø¨Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø§Øª",        desc_en: "A cake for every celebration",                emoji: "ðŸŽ‚", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_heart',    name_en: "Heart",       name_ar: "Ù‚Ù„Ø¨",        cost: 300,  type: 'gifts', charisma: 60,   vipXP: 3,   minBonus: 1, maxBonus: 1500,   desc_ar: "Ù‚Ù„Ø¨ ÙŠØ­Ù…Ù„ Ù†Ø¨Ø¶ Ø§Ù„Ù…Ø­Ø¨Ø©",             desc_en: "A heart that carries the pulse of love",      emoji: "â¤ï¸", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },

        // â”€â”€ ðŸ”µ Rare â€” Ù…Ø±Ø¯ÙˆØ¯ Ø­ØªÙ‰ 5Ã— (500 â‰¤ cost < 2000) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        { id: 'gift_crown',    name_en: "Crown",       name_ar: "ØªØ§Ø¬",        cost: 500,  type: 'gifts', charisma: 100,  vipXP: 5,   minBonus: 1, maxBonus: 2500,   desc_ar: "ØªØ§Ø¬ Ù…Ù„ÙƒÙŠ ÙŠÙØªÙˆÙÙ‘Ø¬ Ø§Ù„ÙƒØ§Ø±ÙŠØ²Ù…Ø§",     desc_en: "A royal crown that tops your charisma",       emoji: "ðŸ‘‘", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_rocket',   name_en: "Rocket",      name_ar: "ØµØ§Ø±ÙˆØ®",      cost: 1000, type: 'gifts', charisma: 200,  vipXP: 10,  minBonus: 1, maxBonus: 5000,   desc_ar: "ØµØ§Ø±ÙˆØ® ÙŠÙ†Ø·Ù„Ù‚ Ø¨Ùƒ Ù†Ø­Ùˆ Ø§Ù„Ù†Ø¬ÙˆÙ…",       desc_en: "A rocket that launches you to the stars",     emoji: "ðŸš€", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_crystal',  name_en: "Crystal",     name_ar: "ÙƒØ±ÙŠØ³ØªØ§Ù„",    cost: 1500, type: 'gifts', charisma: 300,  vipXP: 15,  minBonus: 1, maxBonus: 7500,   desc_ar: "ÙƒØ±ÙŠØ³ØªØ§Ù„ Ù†Ø§Ø¯Ø± ÙŠØ¶ÙŠØ¡ Ø·Ø±ÙŠÙ‚Ùƒ",         desc_en: "A rare crystal that lights your path",        emoji: "ðŸ”®", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },

        // â”€â”€ ðŸ’œ Epic â€” Ù…Ø±Ø¯ÙˆØ¯ Ø­ØªÙ‰ 5Ã— (2000 â‰¤ cost < 10000) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        { id: 'gift_racecar',  name_en: "Race Car",    name_ar: "Ø³ÙŠØ§Ø±Ø© Ø³Ø¨Ø§Ù‚", cost: 2000, type: 'gifts', charisma: 400,  vipXP: 20,  minBonus: 1, maxBonus: 10000,  desc_ar: "Ø³ÙŠØ§Ø±Ø© Ø³Ø¨Ø§Ù‚ ÙØ§Ø±Ù‡Ø© Ù„Ù„Ù†Ø®Ø¨Ø©",         desc_en: "A racing car for the elite",                  emoji: "ðŸŽï¸", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_castle',   name_en: "Castle",      name_ar: "Ù‚ØµØ±",        cost: 5000, type: 'gifts', charisma: 1000, vipXP: 50,  minBonus: 1, maxBonus: 25000,  desc_ar: "Ù‚ØµØ± Ù…Ù„ÙƒÙŠ ÙØ®Ù… Ù„Ù…Ù† ÙŠØ³ØªØ­Ù‚",         desc_en: "A luxury palace for those who deserve it",    emoji: "ðŸ°", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_yacht',    name_en: "Yacht",       name_ar: "ÙŠØ®Øª",        cost: 8000, type: 'gifts', charisma: 1600, vipXP: 80,  minBonus: 1, maxBonus: 40000,  desc_ar: "ÙŠØ®Øª ÙØ§Ø®Ø± ÙÙŠ Ø¨Ø­Ø± Ø§Ù„ÙƒØ§Ø±ÙŠØ²Ù…Ø§",       desc_en: "A luxury yacht in the sea of charisma",       emoji: "ðŸ›¥ï¸", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },

        // â”€â”€ â­ Legendary â€” Ù…Ø±Ø¯ÙˆØ¯ Ø­ØªÙ‰ 5Ã— (10000 â‰¤ cost < 50000) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        { id: 'gift_jet',      name_en: "Private Jet", name_ar: "Ø·Ø§Ø¦Ø±Ø© Ø®Ø§ØµØ©", cost: 10000, type: 'gifts', charisma: 2000, vipXP: 100, minBonus: 1, maxBonus: 50000,  desc_ar: "Ø·Ø§Ø¦Ø±Ø© Ø®Ø§ØµØ© ØªØ­Ù„Ù‘Ù‚ ÙÙŠ Ø³Ù…Ø§Ø¡ Ø§Ù„ÙƒØ§Ø±ÙŠØ²Ù…Ø§", desc_en: "A private jet soaring in charisma skies", emoji: "âœˆï¸", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_planet',   name_en: "Planet",      name_ar: "ÙƒÙˆÙƒØ¨",       cost: 25000, type: 'gifts', charisma: 5000, vipXP: 250, minBonus: 1, maxBonus: 125000, desc_ar: "ÙƒÙˆÙƒØ¨ ÙƒØ§Ù…Ù„ Ù…ÙÙ‡Ø¯Ù‰ Ø¥Ù„ÙŠÙƒ",             desc_en: "An entire planet gifted to you",              emoji: "ðŸª", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },

        // â”€â”€ ðŸ”® Mythic â€” Ù…Ø±Ø¯ÙˆØ¯ Ø­ØªÙ‰ 5Ã— (cost â‰¥ 50000) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        { id: 'gift_universe', name_en: "Universe",    name_ar: "ÙƒÙˆÙ†",        cost: 50000,  type: 'gifts', charisma: 10000, vipXP: 500,  minBonus: 1, maxBonus: 250000,  desc_ar: "ÙƒÙˆÙ† Ø¨Ø£ÙƒÙ…Ù„Ù‡ Ù…Ù„ÙƒÙƒ ÙˆØ­Ø¯Ùƒ",            desc_en: "An entire universe that belongs to you",      emoji: "ðŸŒŒ", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_ultimate', name_en: "Ultimate",    name_ar: "Ø§Ù„Ù‡Ø¯ÙŠØ© Ø§Ù„Ù…Ø·Ù„Ù‚Ø©", cost: 100000, type: 'gifts', charisma: 20000, vipXP: 1000, minBonus: 1, maxBonus: 500000, desc_ar: "Ø£Ø¹Ø¸Ù… Ù‡Ø¯ÙŠØ© Ø¹Ù„Ù‰ ÙˆØ¬Ù‡ Ø§Ù„Ø£Ø±Ø¶",         desc_en: "The greatest gift that ever existed",         emoji: "ðŸ†", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_ring',     name_en: "Diamond Ring",name_ar: "Ø®Ø§ØªÙ… Ø£Ù„Ù…Ø§Ø³", cost: 100000, type: 'gifts', charisma: 20000, vipXP: 1000, minBonus: 1, maxBonus: 500000, desc_ar: "Ø®Ø§ØªÙ… Ø§Ù„ÙƒØ§Ø±ÙŠØ²Ù…Ø§ Ø§Ù„Ù†Ø§Ø¯Ø± Ù…Ù† Ø§Ù„Ø¬Ø§ØªØ´Ø§",       desc_en: "Rare charisma ring from Gacha",               emoji: "ðŸ’", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },

        // â”€â”€ ðŸŽ« FunPass Exclusive (hidden in shop, accessible via FunPass) â”€
        { id: 'gift_fp_lucky',   name_en: "Lucky Clover",  name_ar: "Ø§Ù„Ø¨Ø±Ø³ÙŠÙ… Ø§Ù„Ù…Ø­Ø¸ÙˆØ¸", cost: 500,  type: 'gifts', charisma: 100, vipXP: 5,  minBonus: 1, maxBonus: 2500, desc_ar: "Ù‡Ø¯ÙŠØ© FunPass Ø­ØµØ±ÙŠØ© ðŸ€", desc_en: "Exclusive FunPass gift ðŸ€", emoji: "ðŸ€", imageUrl: "", hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
        { id: 'gift_fp_crystal', name_en: "FP Crystal",    name_ar: "ÙƒØ±ÙŠØ³ØªØ§Ù„ FunPass", cost: 1200, type: 'gifts', charisma: 240, vipXP: 12, minBonus: 1, maxBonus: 6000, desc_ar: "Ù‡Ø¯ÙŠØ© FunPass Ù†Ø§Ø¯Ø±Ø© ðŸ’Ž",  desc_en: "Rare FunPass gift ðŸ’Ž",    emoji: "ðŸ”·", imageUrl: "", hidden: true, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10] },
    ],

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // ðŸ‘‘ VIP EXCLUSIVE GIFTS
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // Ù†ÙØ³ Ù…Ø¹Ø§Ø¯Ù„Ø© Ø§Ù„ÙƒØ§Ø±ÙŠØ²Ù…Ø§: charisma = cost Ã· 5 | maxBonus = cost Ã— 5
    // vipGlowType: null | 'aurora' | 'inferno' | 'cosmic' | 'godlike'
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    gifts_vip: [
        // VIP 1+ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        { id: 'vgift_vip_star',    name_en: "VIP Star",    name_ar: "Ù†Ø¬Ù…Ø© VIP",       cost: 500,    type: 'gifts_vip', charisma: 100,   vipXP: 5,    minBonus: 1, maxBonus: 2500,   desc_ar: "Ù†Ø¬Ù…Ø© Ø°Ù‡Ø¨ÙŠØ© Ø­ØµØ±ÙŠØ© Ù„Ø£Ø¹Ø¶Ø§Ø¡ VIP",         desc_en: "Exclusive gold star for VIP members",    emoji: "â­", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, vipMinLevel: 1,  vipExclusive: true, vipGlowType: null     },
        // VIP 3+ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        { id: 'vgift_vip_diamond', name_en: "VIP Diamond", name_ar: "Ù…Ø§Ø³Ø© VIP",       cost: 2000,   type: 'gifts_vip', charisma: 400,   vipXP: 20,   minBonus: 1, maxBonus: 10000,  desc_ar: "Ù…Ø§Ø³Ø© Ø¨Ø±ÙŠÙ‚ Ø­ØµØ±ÙŠ Ù„Ù€ VIP 3 ÙØ£ÙƒØ«Ø±",       desc_en: "Diamond exclusively for VIP 3+",         emoji: "ðŸ’ ", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, vipMinLevel: 3,  vipExclusive: true, vipGlowType: null     },
        // VIP 5+ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        { id: 'vgift_vip_dragon',  name_en: "VIP Dragon",  name_ar: "ØªÙ†ÙŠÙ† VIP",       cost: 5000,   type: 'gifts_vip', charisma: 1000,  vipXP: 50,   minBonus: 1, maxBonus: 25000,  desc_ar: "ØªÙ†ÙŠÙ† Ø£Ø³Ø·ÙˆØ±ÙŠ Ø­ØµØ±ÙŠ Ù„Ù€ VIP 5 ÙØ£ÙƒØ«Ø±",     desc_en: "Legendary dragon for VIP 5+",            emoji: "ðŸ‰", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, vipMinLevel: 5,  vipExclusive: true, vipGlowType: null     },
        // VIP 7 â€” Aurora â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        { id: 'vgift_aurora',      name_en: "Aurora",      name_ar: "Ù‡Ø¯ÙŠØ© Ø§Ù„Ø£ÙˆØ±ÙˆØ±Ø§",  cost: 10000,  type: 'gifts_vip', charisma: 2000,  vipXP: 100,  minBonus: 1, maxBonus: 50000,  desc_ar: "Ø£Ø¶ÙˆØ§Ø¡ Ø§Ù„Ø´ÙÙ‚ Ø§Ù„Ù‚Ø·Ø¨ÙŠ â€” Ø­ØµØ±ÙŠ VIP 7",     desc_en: "Northern lights power â€” VIP 7 only",     emoji: "ðŸŒŒ", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, vipMinLevel: 7,  vipExclusive: true, vipGlowType: 'aurora'  },
        // VIP 8 â€” Inferno â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        { id: 'vgift_inferno',     name_en: "Inferno",     name_ar: "Ù‡Ø¯ÙŠØ© Ø§Ù„Ø¬Ø­ÙŠÙ…",    cost: 20000,  type: 'gifts_vip', charisma: 4000,  vipXP: 200,  minBonus: 1, maxBonus: 100000, desc_ar: "Ù†Ø§Ø± Ø¬Ù‡Ù†Ù… Ø§Ù„Ù…Ø´ØªØ¹Ù„Ø© â€” Ø­ØµØ±ÙŠ VIP 8",       desc_en: "Hellfire blazing â€” VIP 8 only",           emoji: "ðŸ”¥", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, vipMinLevel: 8,  vipExclusive: true, vipGlowType: 'inferno' },
        // VIP 9 â€” Cosmic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        { id: 'vgift_cosmic',      name_en: "Cosmic",      name_ar: "Ù‡Ø¯ÙŠØ© Ø§Ù„ÙƒÙˆÙ†",     cost: 50000,  type: 'gifts_vip', charisma: 10000, vipXP: 500,  minBonus: 1, maxBonus: 250000, desc_ar: "Ù‚ÙˆØ© Ø§Ù„ÙƒÙˆÙ† Ø§Ù„Ù…Ø·Ù„Ù‚Ø© â€” Ø­ØµØ±ÙŠ VIP 9",       desc_en: "Absolute cosmic power â€” VIP 9 only",     emoji: "ðŸŒ ", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, vipMinLevel: 9,  vipExclusive: true, vipGlowType: 'cosmic'  },
        // VIP 10 â€” Godlike â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        { id: 'vgift_godlike',     name_en: "Godlike",     name_ar: "Ù‡Ø¯ÙŠØ© Ø§Ù„Ø¥Ù„Ù‡",     cost: 100000, type: 'gifts_vip', charisma: 20000, vipXP: 1000, minBonus: 1, maxBonus: 500000, desc_ar: "Ø£Ø¹Ø¸Ù… Ù‡Ø¯ÙŠØ© Ø¹Ù„Ù‰ Ø§Ù„Ø¥Ø·Ù„Ø§Ù‚ â€” Ø­ØµØ±ÙŠ VIP 10", desc_en: "The greatest gift ever â€” VIP 10 only",   emoji: "âš¡", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, vipMinLevel: 10, vipExclusive: true, vipGlowType: 'godlike' },
    ],

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // ðŸ° FAMILY GIFTS â€” 5 Ù‡Ø¯Ø§ÙŠØ§ Ø­ØµØ±ÙŠØ© Ù„Ù„Ø£Ø¹Ø¶Ø§Ø¡ ÙÙŠ Ù‚Ø¨ÙŠÙ„Ø©
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // familyMinLevel: Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ø¯Ù†Ù‰ Ù„Ù…Ø³ØªÙˆÙ‰ Ø§Ù„Ù‚Ø¨ÙŠÙ„Ø© Ø§Ù„Ù…Ø·Ù„ÙˆØ¨
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    gifts_family: [
        { id: 'fgift_emblem',   name_en: "Clan Emblem",   name_ar: "Ø´Ø¹Ø§Ø± Ø§Ù„Ù‚Ø¨ÙŠÙ„Ø©",  cost: 800,   type: 'gifts_family', charisma: 160,  vipXP: 8,   minBonus: 1, maxBonus: 4000,  desc_ar: "Ø´Ø¹Ø§Ø± Ù‚Ø¨ÙŠÙ„ØªÙƒ Ø§Ù„ÙØ®ÙˆØ±",        desc_en: "Your clan's proud emblem",         emoji: "ðŸ´", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10], familyMinLevel: 1  },
        { id: 'fgift_sword',    name_en: "Clan Sword",    name_ar: "Ø³ÙŠÙ Ø§Ù„Ù‚Ø¨ÙŠÙ„Ø©",   cost: 1500,  type: 'gifts_family', charisma: 300,  vipXP: 15,  minBonus: 1, maxBonus: 7500,  desc_ar: "Ø³ÙŠÙ Ø§Ù„Ù…Ø­Ø§Ø±Ø¨ÙŠÙ† Ø§Ù„Ø£Ø´Ø¯Ø§Ø¡",     desc_en: "The sword of mighty warriors",     emoji: "âš”ï¸", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10], familyMinLevel: 2  },
        { id: 'fgift_shield',   name_en: "Guardian Shield",name_ar: "Ø¯Ø±Ø¹ Ø§Ù„Ø­Ø±Ø§Ø³Ø©", cost: 3000,  type: 'gifts_family', charisma: 600,  vipXP: 30,  minBonus: 1, maxBonus: 15000, desc_ar: "Ø¯Ø±Ø¹ Ø§Ù„Ø­Ù…Ø§ÙŠØ© Ø§Ù„ÙÙˆÙ„Ø§Ø°ÙŠ",      desc_en: "The steel guardian shield",        emoji: "ðŸ›¡ï¸", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10], familyMinLevel: 4  },
        { id: 'fgift_throne',   name_en: "Clan Throne",   name_ar: "Ø¹Ø±Ø´ Ø§Ù„Ù‚Ø¨ÙŠÙ„Ø©",   cost: 6000,  type: 'gifts_family', charisma: 1200, vipXP: 60,  minBonus: 1, maxBonus: 30000, desc_ar: "Ø¹Ø±Ø´ Ø§Ù„Ù…Ù„ÙˆÙƒ ÙˆØ§Ù„Ø£Ø¨Ø·Ø§Ù„",       desc_en: "The throne of kings and champions", emoji: "ðŸ‘‘", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10], familyMinLevel: 6  },
        { id: 'fgift_legend',   name_en: "Clan Legend",   name_ar: "Ø£Ø³Ø·ÙˆØ±Ø© Ø§Ù„Ù‚Ø¨ÙŠÙ„Ø©", cost: 12000, type: 'gifts_family', charisma: 2400, vipXP: 120, minBonus: 1, maxBonus: 60000, desc_ar: "Ø£Ø³Ø·ÙˆØ±Ø© Ù„Ø§ ØªÙÙ†Ø³Ù‰ ÙÙŠ ØªØ§Ø±ÙŠØ® Ø§Ù„Ù‚Ø¨ÙŠÙ„Ø©", desc_en: "A legend never forgotten in clan history", emoji: "ðŸŒŸ", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, eventOnly: false, durationDays: 30, season: null, maxSendOptions: [1,3,5,10], familyMinLevel: 8  },
    ],

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // ðŸŽ° SPECIAL GIFTS â€” Ù‡Ø¯Ø§ÙŠØ§ Ø³Ø¨ÙŠØ´ÙŠØ§Ù„ Ø¨Ù†Ø¸Ø§Ù… Ø§Ù„ÙŠØ§Ù†ØµÙŠØ¨
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // specialType: 'lottery' | 'limited' | 'event'
    // possibleRewards: Ù…ØµÙÙˆÙØ© Ø§Ù„Ø¬ÙˆØ§Ø¦Ø² Ø§Ù„Ù…Ù…ÙƒÙ†Ø© Ù…Ù† Ø§Ù„ÙŠØ§Ù†ØµÙŠØ¨
    //   ÙƒÙ„ Ø¬Ø§Ø¦Ø²Ø©: { type: 'frame'|'badge'|'title'|'effect'|'currency', itemId?, amount?, durationDays?, chance }
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    gifts_special: [
        {
            id: 'sgift_lucky_box', name_en: "Lucky Box",  name_ar: "ØµÙ†Ø¯ÙˆÙ‚ Ø§Ù„Ø­Ø¸",
            cost: 300, type: 'gifts_special', charisma: 60, vipXP: 3, minBonus: 1, maxBonus: 1500,
            desc_ar: "ØµÙ†Ø¯ÙˆÙ‚ Ù…Ø¬Ù‡ÙˆÙ„ Ø§Ù„Ù…Ø­ØªÙˆÙ‰ â€” Ø£ÙØªØ­Ù‡ ÙˆØ§Ù†ØªØ¸Ø± Ø§Ù„Ù…ÙØ§Ø¬Ø£Ø©!",
            desc_en: "Mystery box â€” open it and wait for the surprise!",
            emoji: "ðŸŽ", imageUrl: "", hidden: false, isEvent: false, limitedTime: false, specialType: 'lottery',
            durationDays: 30, maxSendOptions: [1,3,5,10],
            possibleRewards: [
                { chance: 50, type: 'currency', amount: 200,       desc_en: '200 Intel',      desc_ar: '200 Ø¥Ù†ØªÙ„' },
                { chance: 25, type: 'currency', amount: 500,       desc_en: '500 Intel',      desc_ar: '500 Ø¥Ù†ØªÙ„' },
                { chance: 15, type: 'badge',    itemId: 'fp_badge_speed', durationDays: 7,  desc_en: 'Speed Badge 7d', desc_ar: 'Ø´Ø§Ø±Ø© Ø§Ù„Ø³Ø±Ø¹Ø© 7 Ø£ÙŠØ§Ù…' },
                { chance: 8,  type: 'frame',    itemId: 'fp_frame_neon',  durationDays: 7,  desc_en: 'Neon Frame 7d',  desc_ar: 'Ø¥Ø·Ø§Ø± Ù†ÙŠÙˆÙ† 7 Ø£ÙŠØ§Ù…' },
                { chance: 2,  type: 'frame',    itemId: 'fp_frame_gold',  durationDays: 30, desc_en: 'Gold Frame 30d', desc_ar: 'Ø¥Ø·Ø§Ø± Ø°Ù‡Ø¨ÙŠ 30 ÙŠÙˆÙ…' },
            ]
        },
        {
            id: 'sgift_mystery_star', name_en: "Mystery Star", name_ar: "Ù†Ø¬Ù…Ø© Ø§Ù„ØºÙ…ÙˆØ¶",
            cost: 800, type: 'gifts_special', charisma: 160, vipXP: 8, minBonus: 1, maxBonus: 4000,
            desc_ar: "Ù†Ø¬Ù…Ø© Ø³Ø­Ø±ÙŠØ© Ù‚Ø¯ ØªÙ…Ù†Ø­Ùƒ Ø¥Ø·Ø§Ø±Ø§Ù‹ Ø£Ùˆ Ø´Ø§Ø±Ø© Ù†Ø§Ø¯Ø±Ø©",
            desc_en: "A magic star that may grant you a rare frame or badge",
            emoji: "â­", imageUrl: "", hidden: false, isEvent: true, limitedTime: false, specialType: 'lottery',
            durationDays: 30, maxSendOptions: [1,3,5,10],
            possibleRewards: [
                { chance: 40, type: 'currency', amount: 500,        desc_en: '500 Intel',       desc_ar: '500 Ø¥Ù†ØªÙ„' },
                { chance: 25, type: 'badge',    itemId: 'fp_badge_diamond', durationDays: 14, desc_en: 'Diamond Badge 14d', desc_ar: 'Ø´Ø§Ø±Ø© Ø£Ù„Ù…Ø§Ø³ 14 ÙŠÙˆÙ…' },
                { chance: 20, type: 'frame',    itemId: 'fp_frame_crystal', durationDays: 14, desc_en: 'Crystal Frame 14d', desc_ar: 'Ø¥Ø·Ø§Ø± ÙƒØ±ÙŠØ³ØªØ§Ù„ 14 ÙŠÙˆÙ…' },
                { chance: 10, type: 'frame',    itemId: 'fp_frame_inferno', durationDays: 14, desc_en: 'Inferno Frame 14d', desc_ar: 'Ø¥Ø·Ø§Ø± Ø¬Ù‡Ù†Ù… 14 ÙŠÙˆÙ…' },
                { chance: 5,  type: 'frame',    itemId: 'fp_frame_mythic',  durationDays: 7,  desc_en: 'Mythic Frame 7d',   desc_ar: 'Ø¥Ø·Ø§Ø± Ø®Ø±Ø§ÙÙŠ 7 Ø£ÙŠØ§Ù…' },
            ]
        },
        {
            id: 'sgift_rainbow_chest', name_en: "Rainbow Chest", name_ar: "ØµÙ†Ø¯ÙˆÙ‚ Ù‚ÙˆØ³ Ù‚Ø²Ø­",
            cost: 2000, type: 'gifts_special', charisma: 400, vipXP: 20, minBonus: 1, maxBonus: 10000,
            desc_ar: "ØµÙ†Ø¯ÙˆÙ‚ Ø§Ù„Ø£Ù„ÙˆØ§Ù† Ø§Ù„Ø³Ø¨Ø¹Ø© â€” Ø¬ÙˆØ§Ø¦Ø² Ù†Ø§Ø¯Ø±Ø© Ø¨Ø§Ù†ØªØ¸Ø§Ø±Ùƒ",
            desc_en: "The seven-color chest â€” rare prizes await",
            emoji: "ðŸŒˆ", imageUrl: "", hidden: false, isEvent: false, limitedTime: true, specialType: 'lottery',
            durationDays: 30, maxSendOptions: [1,3,5,10],
            possibleRewards: [
                { chance: 30, type: 'currency',  amount: 1000,        desc_en: '1000 Intel',      desc_ar: '1000 Ø¥Ù†ØªÙ„' },
                { chance: 25, type: 'badge',     itemId: 'fp_badge_galaxy', durationDays: 30, desc_en: 'Galaxy Badge 30d', desc_ar: 'Ø´Ø§Ø±Ø© Ø§Ù„Ù…Ø¬Ø±Ø© 30 ÙŠÙˆÙ…' },
                { chance: 20, type: 'frame',     itemId: 'fp_frame_rainbow', durationDays: 30, desc_en: 'Rainbow Frame 30d', desc_ar: 'Ø¥Ø·Ø§Ø± Ù‚ÙˆØ³ Ù‚Ø²Ø­ 30 ÙŠÙˆÙ…' },
                { chance: 15, type: 'frame',     itemId: 'fp_frame_void',   durationDays: 14, desc_en: 'Void Frame 14d',   desc_ar: 'Ø¥Ø·Ø§Ø± Ø§Ù„ÙØ±Ø§Øº 14 ÙŠÙˆÙ…' },
                { chance: 8,  type: 'frame',     itemId: 'fp_frame_phoenix', durationDays: 30, desc_en: 'Phoenix Frame 30d', desc_ar: 'Ø¥Ø·Ø§Ø± Ø§Ù„ÙÙŠÙ†ÙŠÙƒØ³ 30 ÙŠÙˆÙ…' },
                { chance: 2,  type: 'frame',     itemId: 'fp_frame_nova',    durationDays: 30, desc_en: 'Nova Frame 30d',   desc_ar: 'Ø¥Ø·Ø§Ø± Ø§Ù„Ù†Ø¬Ù… 30 ÙŠÙˆÙ…' },
            ]
        },
    ],

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // ðŸš© FLAG GIFTS â€” Ù‡Ø¯Ø§ÙŠØ§ Ø§Ù„Ø£Ø¹Ù„Ø§Ù… ÙˆØ§Ù„Ø¯ÙˆÙ„
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    gifts_flag: [
        { id: 'flag_sa',  name_en: "Saudi Arabia",  name_ar: "Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©",    cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "ðŸ‡¸ðŸ‡¦", imageUrl: "", hidden: false, countryCode: 'SA', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_ae',  name_en: "UAE",            name_ar: "Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª",    cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "ðŸ‡¦ðŸ‡ª", imageUrl: "", hidden: false, countryCode: 'AE', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_eg',  name_en: "Egypt",          name_ar: "Ù…ØµØ±",         cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "ðŸ‡ªðŸ‡¬", imageUrl: "", hidden: false, countryCode: 'EG', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_kw',  name_en: "Kuwait",         name_ar: "Ø§Ù„ÙƒÙˆÙŠØª",      cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "ðŸ‡°ðŸ‡¼", imageUrl: "", hidden: false, countryCode: 'KW', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_qa',  name_en: "Qatar",          name_ar: "Ù‚Ø·Ø±",         cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "ðŸ‡¶ðŸ‡¦", imageUrl: "", hidden: false, countryCode: 'QA', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_bh',  name_en: "Bahrain",        name_ar: "Ø§Ù„Ø¨Ø­Ø±ÙŠÙ†",     cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "ðŸ‡§ðŸ‡­", imageUrl: "", hidden: false, countryCode: 'BH', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_om',  name_en: "Oman",           name_ar: "Ø¹ÙÙ…Ø§Ù†",       cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "ðŸ‡´ðŸ‡²", imageUrl: "", hidden: false, countryCode: 'OM', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_jo',  name_en: "Jordan",         name_ar: "Ø§Ù„Ø£Ø±Ø¯Ù†",      cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "ðŸ‡¯ðŸ‡´", imageUrl: "", hidden: false, countryCode: 'JO', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_iq',  name_en: "Iraq",           name_ar: "Ø§Ù„Ø¹Ø±Ø§Ù‚",      cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "ðŸ‡®ðŸ‡¶", imageUrl: "", hidden: false, countryCode: 'IQ', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_ma',  name_en: "Morocco",        name_ar: "Ø§Ù„Ù…ØºØ±Ø¨",      cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "ðŸ‡²ðŸ‡¦", imageUrl: "", hidden: false, countryCode: 'MA', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_tn',  name_en: "Tunisia",        name_ar: "ØªÙˆÙ†Ø³",        cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "ðŸ‡¹ðŸ‡³", imageUrl: "", hidden: false, countryCode: 'TN', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_ly',  name_en: "Libya",          name_ar: "Ù„ÙŠØ¨ÙŠØ§",       cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "ðŸ‡±ðŸ‡¾", imageUrl: "", hidden: false, countryCode: 'LY', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_sy',  name_en: "Syria",          name_ar: "Ø³ÙˆØ±ÙŠØ§",       cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "ðŸ‡¸ðŸ‡¾", imageUrl: "", hidden: false, countryCode: 'SY', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_lb',  name_en: "Lebanon",        name_ar: "Ù„Ø¨Ù†Ø§Ù†",       cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "ðŸ‡±ðŸ‡§", imageUrl: "", hidden: false, countryCode: 'LB', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_ps',  name_en: "Palestine",      name_ar: "ÙÙ„Ø³Ø·ÙŠÙ†",      cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "ðŸ‡µðŸ‡¸", imageUrl: "", hidden: false, countryCode: 'PS', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_tr',  name_en: "Turkey",         name_ar: "ØªØ±ÙƒÙŠØ§",       cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "ðŸ‡¹ðŸ‡·", imageUrl: "", hidden: false, countryCode: 'TR', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_us',  name_en: "USA",            name_ar: "Ø£Ù…Ø±ÙŠÙƒØ§",      cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "ðŸ‡ºðŸ‡¸", imageUrl: "", hidden: false, countryCode: 'US', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_gb',  name_en: "UK",             name_ar: "Ø¨Ø±ÙŠØ·Ø§Ù†ÙŠØ§",    cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "ðŸ‡¬ðŸ‡§", imageUrl: "", hidden: false, countryCode: 'GB', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_de',  name_en: "Germany",        name_ar: "Ø£Ù„Ù…Ø§Ù†ÙŠØ§",     cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "ðŸ‡©ðŸ‡ª", imageUrl: "", hidden: false, countryCode: 'DE', durationDays: 30, maxSendOptions: [1,3,5,10] },
        { id: 'flag_fr',  name_en: "France",         name_ar: "ÙØ±Ù†Ø³Ø§",       cost: 50,  type: 'gifts_flag', charisma: 10, vipXP: 1, minBonus: 0, maxBonus: 0, emoji: "ðŸ‡«ðŸ‡·", imageUrl: "", hidden: false, countryCode: 'FR', durationDays: 30, maxSendOptions: [1,3,5,10] },
    ]
};

// ðŸŽ¨ GIFT RARITY SYSTEM
var ARITY_CONFIG = {
    Common:       { name_en: 'Common',       name_ar: 'Ø¹Ø§Ø¯ÙŠ',          color: '#9ca3af', bg: 'rgba(156,163,175,0.07)', border: 'rgba(156,163,175,0.25)', glow: false, icon: 'âšª', order: 0 },
    Uncommon:     { name_en: 'Uncommon',     name_ar: 'ØºÙŠØ± Ø´Ø§Ø¦Ø¹',      color: '#4ade80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.35)',  glow: false, icon: 'ðŸŸ¢', order: 1 },
    Rare:         { name_en: 'Rare',         name_ar: 'Ù†Ø§Ø¯Ø±',          color: '#60a5fa', bg: 'rgba(96,165,250,0.09)',  border: 'rgba(96,165,250,0.40)',  glow: false, icon: 'ðŸ”µ', order: 2 },
    Epic:         { name_en: 'Epic',         name_ar: 'Ù…Ù„Ø­Ù…ÙŠ',         color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)',  border: 'rgba(139,92,246,0.45)',  glow: false, icon: 'ðŸ’œ', order: 3 },
    Legendary:    { name_en: 'Legendary',    name_ar: 'Ø£Ø³Ø·ÙˆØ±ÙŠ',        color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.50)',  glow: true,  icon: 'â­', order: 4 },
    Mythic:       { name_en: 'Mythic',       name_ar: 'Ø®Ø±Ø§ÙÙŠ',         color: '#ff0055', bg: 'rgba(255,0,85,0.12)',    border: 'rgba(255,0,85,0.60)',    glow: true,  icon: 'ðŸ”®', order: 5, special: true },
    // â•â• 4 TIERS BEYOND MYTHIC â•â•
    Artifact:     { name_en: 'Artifact',     name_ar: 'Ø£Ø«Ø±ÙŠ',          color: '#c2410c', bg: 'rgba(194,65,12,0.12)',   border: 'rgba(194,65,12,0.65)',   glow: true,  icon: 'ðŸº', order: 6, special: true, cssClass: 'rarity-artifact'     },
    Transcendent: { name_en: 'Transcendent', name_ar: 'Ù…ØªØ¬Ø§ÙˆØ²',        color: '#c026d3', bg: 'rgba(192,38,211,0.13)',  border: 'rgba(192,38,211,0.70)',  glow: true,  icon: 'ðŸŒ€', order: 7, special: true, cssClass: 'rarity-transcendent' },
    Immortal:     { name_en: 'Immortal',     name_ar: 'Ø®Ø§Ù„Ø¯',          color: '#e2e8f0', bg: 'rgba(226,232,240,0.10)', border: 'rgba(226,232,240,0.70)', glow: true,  icon: 'âœ¨', order: 8, special: true, cssClass: 'rarity-immortal'     },
    Divine:       { name_en: 'Divine',       name_ar: 'Ø¥Ù„Ù‡ÙŠ',          color: '#00d4ff', bg: 'rgba(0,212,255,0.10)',   border: 'rgba(0,212,255,0.75)',   glow: true,  icon: 'ðŸ’Ž', order: 9, special: true, cssClass: 'rarity-divine'       },
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

// ðŸ† ACHIEVEMENTS SYSTEM â€” Leveled (4 tiers per group)
// tier 1: Bronze/Normal | tier 2: Silver/Natural | tier 3: Red/Legendary | tier 4: Multi-color Glow/Ultimate
var CHIEVEMENTS = [

    // â•â• ðŸŽ GIFTS RECEIVED â•â•
    { id: 'ach_recv_1', group: 'gifts_recv', tier: 1, nameKey: 'achRecv1', descKey: 'achRecv1Desc', icon: 'ðŸŽ', imageUrl: '', condition: { type: 'gifts_received', value: 1 } },
    { id: 'ach_recv_2', group: 'gifts_recv', tier: 2, nameKey: 'achRecv2', descKey: 'achRecv2Desc', icon: 'ðŸ’', imageUrl: '', condition: { type: 'gifts_received', value: 50 } },
    { id: 'ach_recv_3', group: 'gifts_recv', tier: 3, nameKey: 'achRecv3', descKey: 'achRecv3Desc', icon: 'ðŸ’Ž', imageUrl: '', condition: { type: 'gifts_received', value: 200 } },
    { id: 'ach_recv_4', group: 'gifts_recv', tier: 4, nameKey: 'achRecv4', descKey: 'achRecv4Desc', icon: 'ðŸ‘‘', imageUrl: '', condition: { type: 'gifts_received', value: 500 } },

    // â•â• ðŸ“¤ GIFTS SENT â•â•
    { id: 'ach_sent_1', group: 'gifts_sent', tier: 1, nameKey: 'achSent1', descKey: 'achSent1Desc', icon: 'ðŸ’Œ', imageUrl: '', condition: { type: 'gifts_sent', value: 10 } },
    { id: 'ach_sent_2', group: 'gifts_sent', tier: 2, nameKey: 'achSent2', descKey: 'achSent2Desc', icon: 'ðŸŽ…', imageUrl: '', condition: { type: 'gifts_sent', value: 50 } },
    { id: 'ach_sent_3', group: 'gifts_sent', tier: 3, nameKey: 'achSent3', descKey: 'achSent3Desc', icon: 'ðŸŽ', imageUrl: '', condition: { type: 'gifts_sent', value: 150 } },
    { id: 'ach_sent_4', group: 'gifts_sent', tier: 4, nameKey: 'achSent4', descKey: 'achSent4Desc', icon: 'âœ¨', imageUrl: '', condition: { type: 'gifts_sent', value: 500 } },

    // â•â• ðŸŽ® GAMES PLAYED â•â•
    { id: 'ach_games_1', group: 'games_played', tier: 1, nameKey: 'achGames1', descKey: 'achGames1Desc', icon: 'ðŸŽ®', imageUrl: '', condition: { type: 'games_played', value: 10 } },
    { id: 'ach_games_2', group: 'games_played', tier: 2, nameKey: 'achGames2', descKey: 'achGames2Desc', icon: 'ðŸŽ–ï¸', imageUrl: '', condition: { type: 'games_played', value: 50 } },
    { id: 'ach_games_3', group: 'games_played', tier: 3, nameKey: 'achGames3', descKey: 'achGames3Desc', icon: 'â­', imageUrl: '', condition: { type: 'games_played', value: 200 } },
    { id: 'ach_games_4', group: 'games_played', tier: 4, nameKey: 'achGames4', descKey: 'achGames4Desc', icon: 'ðŸ†', imageUrl: '', condition: { type: 'games_played', value: 500 } },

    // â•â• ðŸ† WINS â•â•
    { id: 'ach_wins_1', group: 'wins', tier: 1, nameKey: 'achWins1', descKey: 'achWins1Desc', icon: 'ðŸ†', imageUrl: '', condition: { type: 'wins', value: 5 } },
    { id: 'ach_wins_2', group: 'wins', tier: 2, nameKey: 'achWins2', descKey: 'achWins2Desc', icon: 'ðŸ¥‡', imageUrl: '', condition: { type: 'wins', value: 25 } },
    { id: 'ach_wins_3', group: 'wins', tier: 3, nameKey: 'achWins3', descKey: 'achWins3Desc', icon: 'ðŸ’¥', imageUrl: '', condition: { type: 'wins', value: 100 } },
    { id: 'ach_wins_4', group: 'wins', tier: 4, nameKey: 'achWins4', descKey: 'achWins4Desc', icon: 'âš¡', imageUrl: '', condition: { type: 'wins', value: 300 } },

    // â•â• ðŸ”¥ WIN STREAK â•â•
    { id: 'ach_streak_1', group: 'win_streak', tier: 1, nameKey: 'achStreak1', descKey: 'achStreak1Desc', icon: 'ðŸ”¥', imageUrl: '', condition: { type: 'win_streak', value: 3 } },
    { id: 'ach_streak_2', group: 'win_streak', tier: 2, nameKey: 'achStreak2', descKey: 'achStreak2Desc', icon: 'ðŸŒŸ', imageUrl: '', condition: { type: 'win_streak', value: 5 } },
    { id: 'ach_streak_3', group: 'win_streak', tier: 3, nameKey: 'achStreak3', descKey: 'achStreak3Desc', icon: 'ðŸ’¢', imageUrl: '', condition: { type: 'win_streak', value: 10 } },
    { id: 'ach_streak_4', group: 'win_streak', tier: 4, nameKey: 'achStreak4', descKey: 'achStreak4Desc', icon: 'ðŸŒªï¸', imageUrl: '', condition: { type: 'win_streak', value: 20 } },

    // â•â• ðŸ•µï¸ SPY WINS â•â•
    { id: 'ach_spy_1', group: 'spy_wins', tier: 1, nameKey: 'achSpy1', descKey: 'achSpy1Desc', icon: 'ðŸ•µï¸', imageUrl: '', condition: { type: 'spy_wins', value: 1 } },
    { id: 'ach_spy_2', group: 'spy_wins', tier: 2, nameKey: 'achSpy2', descKey: 'achSpy2Desc', icon: 'ðŸ¥·', imageUrl: '', condition: { type: 'spy_wins', value: 10 } },
    { id: 'ach_spy_3', group: 'spy_wins', tier: 3, nameKey: 'achSpy3', descKey: 'achSpy3Desc', icon: 'ðŸ‘¤', imageUrl: '', condition: { type: 'spy_wins', value: 30 } },
    { id: 'ach_spy_4', group: 'spy_wins', tier: 4, nameKey: 'achSpy4', descKey: 'achSpy4Desc', icon: 'ðŸŒ‘', imageUrl: '', condition: { type: 'spy_wins', value: 75 } },

    // â•â• ðŸ¤µ AGENT WINS â•â•
    { id: 'ach_agent_1', group: 'agent_wins', tier: 1, nameKey: 'achAgent1', descKey: 'achAgent1Desc', icon: 'ðŸ¤µ', imageUrl: '', condition: { type: 'agent_wins', value: 1 } },
    { id: 'ach_agent_2', group: 'agent_wins', tier: 2, nameKey: 'achAgent2', descKey: 'achAgent2Desc', icon: 'ðŸ›¡ï¸', imageUrl: '', condition: { type: 'agent_wins', value: 10 } },
    { id: 'ach_agent_3', group: 'agent_wins', tier: 3, nameKey: 'achAgent3', descKey: 'achAgent3Desc', icon: 'âš”ï¸', imageUrl: '', condition: { type: 'agent_wins', value: 30 } },
    { id: 'ach_agent_4', group: 'agent_wins', tier: 4, nameKey: 'achAgent4', descKey: 'achAgent4Desc', icon: 'ðŸ›ï¸', imageUrl: '', condition: { type: 'agent_wins', value: 75 } },

    // â•â• ðŸ¦‹ FRIENDS â•â•
    { id: 'ach_friends_1', group: 'friends', tier: 1, nameKey: 'achFriends1', descKey: 'achFriends1Desc', icon: 'ðŸ¦‹', imageUrl: '', condition: { type: 'friends', value: 5 } },
    { id: 'ach_friends_2', group: 'friends', tier: 2, nameKey: 'achFriends2', descKey: 'achFriends2Desc', icon: 'â­', imageUrl: '', condition: { type: 'friends', value: 15 } },
    { id: 'ach_friends_3', group: 'friends', tier: 3, nameKey: 'achFriends3', descKey: 'achFriends3Desc', icon: 'ðŸŒŸ', imageUrl: '', condition: { type: 'friends', value: 30 } },
    { id: 'ach_friends_4', group: 'friends', tier: 4, nameKey: 'achFriends4', descKey: 'achFriends4Desc', icon: 'ðŸŒ', imageUrl: '', condition: { type: 'friends', value: 75 } },

    // â•â• ðŸ”¥ LOGIN STREAK (consecutive days) â•â•
    { id: 'ach_login_str_1', group: 'login_streak', tier: 1, nameKey: 'achLoginStr1', descKey: 'achLoginStr1Desc', icon: 'ðŸ”¥', imageUrl: '', condition: { type: 'login_streak', value: 7 } },
    { id: 'ach_login_str_2', group: 'login_streak', tier: 2, nameKey: 'achLoginStr2', descKey: 'achLoginStr2Desc', icon: 'ðŸ“…', imageUrl: '', condition: { type: 'login_streak', value: 30 } },
    { id: 'ach_login_str_3', group: 'login_streak', tier: 3, nameKey: 'achLoginStr3', descKey: 'achLoginStr3Desc', icon: 'ðŸ—“ï¸', imageUrl: '', condition: { type: 'login_streak', value: 100 } },
    { id: 'ach_login_str_4', group: 'login_streak', tier: 4, nameKey: 'achLoginStr4', descKey: 'achLoginStr4Desc', icon: 'â™¾ï¸', imageUrl: '', condition: { type: 'login_streak', value: 365 } },

    // â•â• ðŸ“… TOTAL LOGIN DAYS â•â•
    { id: 'ach_logins_1', group: 'total_logins', tier: 1, nameKey: 'achLogins1', descKey: 'achLogins1Desc', icon: 'ðŸ“…', imageUrl: '', condition: { type: 'total_logins', value: 30 } },
    { id: 'ach_logins_2', group: 'total_logins', tier: 2, nameKey: 'achLogins2', descKey: 'achLogins2Desc', icon: 'ðŸ’Ž', imageUrl: '', condition: { type: 'total_logins', value: 100 } },
    { id: 'ach_logins_3', group: 'total_logins', tier: 3, nameKey: 'achLogins3', descKey: 'achLogins3Desc', icon: 'ðŸ…', imageUrl: '', condition: { type: 'total_logins', value: 300 } },
    { id: 'ach_logins_4', group: 'total_logins', tier: 4, nameKey: 'achLogins4', descKey: 'achLogins4Desc', icon: 'ðŸ‘‘', imageUrl: '', condition: { type: 'total_logins', value: 365 } },

    // â•â• â­ CHARISMA â•â•
    { id: 'ach_charisma_1', group: 'charisma', tier: 1, nameKey: 'achCharisma1', descKey: 'achCharisma1Desc', icon: 'â­', imageUrl: '', condition: { type: 'charisma', value: 10000 } },
    { id: 'ach_charisma_2', group: 'charisma', tier: 2, nameKey: 'achCharisma2', descKey: 'achCharisma2Desc', icon: 'ðŸ’«', imageUrl: '', condition: { type: 'charisma', value: 100000 } },
    { id: 'ach_charisma_3', group: 'charisma', tier: 3, nameKey: 'achCharisma3', descKey: 'achCharisma3Desc', icon: 'ðŸŒ ', imageUrl: '', condition: { type: 'charisma', value: 500000 } },
    { id: 'ach_charisma_4', group: 'charisma', tier: 4, nameKey: 'achCharisma4', descKey: 'achCharisma4Desc', icon: 'ðŸŒŒ', imageUrl: '', condition: { type: 'charisma', value: 1000000 } },
];

// --- Scenarios ---
var CENARIOS = [
    { loc_ar: "Ù…Ø­Ø·Ø© ÙØ¶Ø§Ø¡", words_ar: ["ÙØ¶Ø§Ø¡", "ØµØ§Ø±ÙˆØ®", "zero-g", "Ù‚Ù…Ø±"], loc_en: "Space Station", words_en: ["Space", "Rocket", "Zero-g", "Moon"] },
    { loc_ar: "ØºÙˆØ§ØµØ© Ù†ÙˆÙˆÙŠØ©", words_ar: ["Ø¹Ù…Ù‚", "Ù…Ø§Ø¡", "Ø¶ØºØ·", "Ø³ÙˆÙ†Ø§Ø±"], loc_en: "Nuclear Submarine", words_en: ["Depth", "Water", "Pressure", "Sonar"] },
    { loc_ar: "Ù‚ØµØ± Ù…Ù„ÙƒÙŠ", words_ar: ["ØªØ§Ø¬", "Ø­Ø±Ø§Ø³", "Ø¹Ø±ÙˆØ´", "Ø®Ø¯Ù…"], loc_en: "Royal Palace", words_en: ["Crown", "Guards", "Throne", "Servants"] },
    { loc_ar: "Ø¨Ù†Ùƒ Ù…Ø±ÙƒØ²ÙŠ", words_ar: ["Ø®Ø²Ù†Ø©", "Ù…Ø§Ù„", "Ø±ØµØ§Øµ", "Ù…ÙØªØ§Ø­"], loc_en: "Central Bank", words_en: ["Vault", "Money", "Lead", "Key"] },
    { loc_ar: "Ù…Ø³ØªØ´ÙÙ‰ Ù…Ù‡Ø¬ÙˆØ±", words_ar: ["Ø£Ø´Ø¨Ø§Ø­", "Ø£Ø·Ø¨Ø§Ø¡", "Ø¸Ù„Ø§Ù…", "Ø­Ù‚Ù†"], loc_en: "Abandoned Hospital", words_en: ["Ghosts", "Doctors", "Dark", "Syringe"] },
    { loc_ar: "Ù‚Ø·Ø§Ø± Ù„ÙŠÙ„ÙŠ", words_ar: ["Ø¯Ø±Ø¬Ø§Øª", "ØªØ°Ø§ÙƒØ±", "Ù†ÙˆÙ…", "Ù…Ù…Ø±"], loc_en: "Night Train", words_en: ["Bunks", "Tickets", "Sleep", "Aisle"] },
    { loc_ar: "Ø¬Ø²ÙŠØ±Ø© ÙƒÙ†Ø²", words_ar: ["Ø®Ø±ÙŠØ·Ø©", "Ø­ÙØ±", "Ø°Ù‡Ø¨", "Ù‚Ø±Ø§ØµÙ†Ø©"], loc_en: "Treasure Island", words_en: ["Map", "Dig", "Gold", "Pirates"] },
    { loc_ar: "Ù…ØµÙ†Ø¹ Ø±ÙˆØ¨ÙˆØªØ§Øª", words_ar: ["Ø£Ø³Ù„Ø§Ùƒ", "ØµÙŠØ§Ù†Ø©", "Ø¨Ø±Ù…Ø¬Ø©", "Ù…Ø¹Ø§Ø¯Ù†"], loc_en: "Robot Factory", words_en: ["Wires", "Maintenance", "Coding", "Metal"] }
];

// EMOJI CATEGORIES FOR PROFESSIONAL PICKER
var MOJI_CATEGORIES = {
    smiles: ['ðŸ˜€', 'ðŸ˜‚', 'ðŸ˜', 'ðŸ¤”', 'ðŸ˜Ž', 'ðŸ¤«', 'ðŸ˜¡', 'ðŸ¤¢', 'ðŸ˜´', 'ðŸ¤¯', 'ðŸ˜¤', 'ðŸ¥º', 'ðŸ˜±', 'ðŸ¤¬', 'ðŸ’€', 'ðŸ‘»', 'ðŸ‘¾', 'ðŸ¤–', 'ðŸ’©', 'ðŸ˜ˆ'],
    gestures: ['ðŸ‘ï¸', 'ðŸ§ ', 'ðŸ¦·', 'ðŸ¦´', 'ðŸ‘€', 'ðŸ‘Š', 'âœŒï¸', 'ðŸ¤ž', 'ðŸ¤Ÿ', 'ðŸ‘Œ', 'ðŸ¤™', 'ðŸ‘ˆ', 'ðŸ‘‰', 'â˜ï¸', 'ðŸ‘†', 'ðŸ‘‡', 'âœ‹', 'ðŸ¤š', 'ðŸ–ï¸', 'ðŸ––', 'ðŸ‘‹', 'ðŸ¤', 'âœŠ', 'ðŸ¤›', 'ðŸ¤œ', 'ðŸ‘', 'ðŸ™Œ', 'ðŸ‘', 'ðŸ¤²', 'ðŸ™'],
    hearts: ['ðŸ’ª', 'â¤ï¸', 'ðŸ’”', 'ðŸ’•', 'ðŸ’–', 'ðŸ’—', 'ðŸ’˜', 'ðŸ’', 'ðŸ’ž', 'ðŸ’Ÿ', 'ðŸ§¡', 'ðŸ’›', 'ðŸ’š', 'ðŸ’™', 'ðŸ’œ', 'ðŸ–¤', 'ðŸ¤', 'ðŸ¤Ž'],
    objects: ['ðŸ”¥', 'â­', 'ðŸŒŸ', 'âœ¨', 'ðŸ’«', 'ðŸŽ‰', 'ðŸŽŠ', 'ðŸŽ', 'ðŸŽˆ', 'ðŸŽ€', 'ðŸ†', 'ðŸ¥‡', 'ðŸ¥ˆ', 'ðŸ¥‰', 'âš½', 'ðŸ€', 'ðŸŽ®', 'ðŸŽ²', 'ðŸŽ¯', 'ðŸŽµ', 'ðŸŽ¶', 'ðŸŽ¤', 'ðŸŽ§', 'ðŸ“·', 'ðŸ’»', 'ðŸ“±', 'ðŸ’°', 'ðŸ’µ', 'ðŸ’Ž', 'ðŸ‘‘', 'ðŸŽ©'],
    nature: ['ðŸš€', 'âœˆï¸', 'ðŸ›¸', 'ðŸŒ¹', 'ðŸŒ¸', 'ðŸŒº', 'ðŸŒ»', 'ðŸŒ¼', 'ðŸŒ·', 'ðŸŒ±', 'ðŸŒ²', 'ðŸŒ³', 'ðŸŒ´', 'ðŸŒµ', 'ðŸŒ¾', 'ðŸŒ¿', 'â˜˜ï¸', 'ðŸ€', 'ðŸ', 'ðŸ‚', 'ðŸƒ']
};

// --- Helper Functions ---
var ormatTime = (timestamp) => { if (!timestamp) return ''; const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp); return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
var ormatCharisma = (num) => { if (num === undefined || num === null) return '0'; if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'; if (num >= 1000) return (num / 1000).toFixed(1) + 'K'; return num.toString(); };
var askEmail = (email) => { if (!email) return 'N/A'; const [localPart, domain] = email.split('@'); if (!domain) return email; const visibleChars = Math.min(2, localPart.length); return localPart.substring(0, visibleChars) + '***@' + domain; };
// ðŸŽ¯ SMART BONUS SYSTEM â€” Ø¨ÙˆÙ†Øµ Ø°ÙƒÙŠ ÙŠØ±Ø§Ø¹ÙŠ Ù‚ÙŠÙ…Ø© Ø§Ù„Ù‡Ø¯ÙŠØ©
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ”§ BONUS_CONFIG â€” Ø¹Ø¯Ù‘Ù„ Ø§Ù„Ù‚ÙŠÙ… Ù‡Ù†Ø§ Ù„Ø¶Ø¨Ø· Ø§Ù„Ø³Ù„ÙˆÙƒ:
var ONUS_CONFIG = {
    // Ø§Ù„Ø£ÙˆØ²Ø§Ù† Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©: [Ù…Ù†Ø®ÙØ¶, Ù…ØªÙˆØ³Ø·, Ø¹Ø§Ù„ÙŠ, Ø¬Ø§ÙƒØ¨ÙˆØª]
    // Ø§Ù„Ø¬Ù…Ø¹ = 1.0  (Ù…Ø«Ù„Ø§Ù‹: 70% + 18% + 9% + 3% = 100%)
    ZONE_WEIGHTS: [0.70, 0.18, 0.09, 0.03],

    // Ù†Ø·Ø§Ù‚Ø§Øª ÙƒÙ„ Ù…Ù†Ø·Ù‚Ø© ÙƒÙ†Ø³Ø¨Ø© Ù…Ù† maxBonus Ø§Ù„Ù…Ø¹Ø¯ÙŽÙ‘Ù„
    ZONE_RANGES: [
        [0.00, 0.08], // Ù…Ù†Ø®ÙØ¶: 0-8% Ù…Ù† maxBonus (70% Ù…Ù† Ø§Ù„ÙˆÙ‚Øª)
        [0.08, 0.22], // Ù…ØªÙˆØ³Ø·: 8-22% (18% Ù…Ù† Ø§Ù„ÙˆÙ‚Øª)
        [0.22, 0.50], // Ø¹Ø§Ù„ÙŠ: 22-50% (9% Ù…Ù† Ø§Ù„ÙˆÙ‚Øª)
        [0.50, 1.00], // ðŸŽ° Ø¬Ø§ÙƒØ¨ÙˆØª: 50-100% (3% ÙÙ‚Ø·!)
    ],

    // Ø³Ù‚Ù Ø§Ù„Ø¨ÙˆÙ†Øµ Ø¨Ø­Ø³Ø¨ ÙØ¦Ø© Ø³Ø¹Ø± Ø§Ù„Ù‡Ø¯ÙŠØ© (ÙƒÙ†Ø³Ø¨Ø© Ù…Ù† maxBonus)
    // ÙƒÙ„Ù…Ø§ ÙƒØ§Ù†Øª Ø§Ù„Ù‡Ø¯ÙŠØ© Ø£ØºÙ„Ù‰ØŒ ÙƒÙ„Ù…Ø§ Ù‚ÙŽÙ„ÙŽÙ‘ Ø§Ù„Ø³Ù‚Ù Ø§Ù„Ø·Ø¨ÙŠØ¹ÙŠ
    GIFT_COST_CAP: [
        { maxCost: 20,    cap: 1.00 }, // Ø±Ø®ÙŠØµØ© Ø¬Ø¯Ø§Ù‹: ÙƒØ§Ù…Ù„ maxBonus
        { maxCost: 100,   cap: 0.40 }, // Ø±Ø®ÙŠØµØ©: 40% ÙÙ‚Ø· Ù…Ù† maxBonus
        { maxCost: 500,   cap: 0.25 }, // Ù…ØªÙˆØ³Ø·Ø©: 25% ÙÙ‚Ø·
        { maxCost: 2000,  cap: 0.15 }, // ØºØ§Ù„ÙŠØ©: 15% ÙÙ‚Ø·
        { maxCost: 10000, cap: 0.10 }, // ØºØ§Ù„ÙŠØ© Ø¬Ø¯Ø§Ù‹: 10% ÙÙ‚Ø·
        { maxCost: Infinity, cap: 0.06 }, // Ø£Ø³Ø·ÙˆØ±ÙŠØ©: 6% ÙÙ‚Ø·
    ],

    // Ø§Ø³ØªØ«Ù†Ø§Ø¡ Ø§Ù„Ø¬Ø§ÙƒØ¨ÙˆØª: ÙŠØ¬ØªØ§Ø² Ø§Ù„Ø³Ù‚Ù Ø¯Ø§Ø¦Ù…Ø§Ù‹ØŸ (true = Ù†Ø¹Ù…)
    JACKPOT_BYPASSES_CAP: true,
};

var enerateRandomBonus = (min, max, giftCost = 0) => {
    const { ZONE_WEIGHTS, ZONE_RANGES, GIFT_COST_CAP, JACKPOT_BYPASSES_CAP } = BONUS_CONFIG;

    // Ø§Ø­Ø³Ø¨ Ø§Ù„Ø³Ù‚Ù Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ Ø³Ø¹Ø± Ø§Ù„Ù‡Ø¯ÙŠØ©
    const capEntry = GIFT_COST_CAP.find(e => giftCost <= e.maxCost) || GIFT_COST_CAP[GIFT_COST_CAP.length - 1];
    const capFactor = capEntry.cap;

    // Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ù…Ù†Ø·Ù‚Ø©
    const r = Math.random();
    let zone = ZONE_WEIGHTS.length - 1;
    let cumulative = 0;
    for (let i = 0; i < ZONE_WEIGHTS.length; i++) {
        cumulative += ZONE_WEIGHTS[i];
        if (r < cumulative) { zone = i; break; }
    }

    const isJackpot = zone === ZONE_WEIGHTS.length - 1;
    const [lo, hi] = ZONE_RANGES[zone];

    // Ø·Ø¨Ù‘Ù‚ Ø§Ù„Ø³Ù‚Ù Ø¹Ù„Ù‰ Ø§Ù„Ø¬Ø§ÙƒØ¨ÙˆØª Ø£Ùˆ Ù„Ø§ØŸ
    const effectiveMax = (isJackpot && JACKPOT_BYPASSES_CAP)
        ? max
        : Math.max(min, Math.floor(max * capFactor));

    const range = effectiveMax - min;
    return Math.max(min, Math.min(effectiveMax, Math.floor(min + range * (lo + Math.random() * (hi - lo)))));
};

// --- Translations ---

