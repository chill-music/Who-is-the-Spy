(function () {
  var RINGS_DATA = window.SHOP_ITEMS?.rings || [];

  var PROPOSAL_GIFTS = [
  { id: 'pg_rose', emoji: '🌹', name_en: 'Red Rose', name_ar: 'وردة حمراء', cost: 100, charisma: 200 },
  { id: 'pg_bouquet', emoji: '💐', name_en: 'Bouquet', name_ar: 'باقة زهور', cost: 300, charisma: 600 },
  { id: 'pg_chocolate', emoji: '🍫', name_en: 'Chocolates', name_ar: 'شوكولاتة', cost: 500, charisma: 1000 },
  { id: 'pg_teddy', emoji: '🧸', name_en: 'Teddy Bear', name_ar: 'دبدوب', cost: 800, charisma: 1600 },
  { id: 'pg_cake', emoji: '🎂', name_en: 'Love Cake', name_ar: 'كيكة الحب', cost: 1200, charisma: 2400 },
  { id: 'pg_heart', emoji: '💝', name_en: 'Heart Box', name_ar: 'صندوق القلب', cost: 2000, charisma: 4000 },
  { id: 'pg_stars', emoji: '⭐', name_en: 'Falling Stars', name_ar: 'نيازك الحب', cost: 3000, charisma: 6000 },
  { id: 'pg_crown', emoji: '👑', name_en: 'Love Crown', name_ar: 'تاج الحب', cost: 5000, charisma: 10000 }];


  var RARITY_COLORS_C = {
    Common: '#9ca3af', Uncommon: '#4ade80', Rare: '#60a5fa',
    Epic: '#a78bfa', Legendary: '#ffd700', Mythic: '#f0abfc'
  };

  var LOVE_LEVELS = [
  { days: 0, label_ar: 'حب ناشئ 🌱', label_en: 'Budding Love 🌱', color: '#86efac' },
  { days: 7, label_ar: 'حب متنامي 💛', label_en: 'Growing Love 💛', color: '#fde68a' },
  { days: 30, label_ar: 'حب عميق 💕', label_en: 'Deep Love 💕', color: '#f9a8d4' },
  { days: 90, label_ar: 'رابطة قوية 💑', label_en: 'Strong Bond 💑', color: '#c4b5fd' },
  { days: 180, label_ar: 'حب حقيقي 💖', label_en: 'True Love 💖', color: '#f0abfc' },
  { days: 365, label_ar: 'حب أبدي 💎', label_en: 'Eternal Love 💎', color: '#67e8f9' }];


  var getLoveLevel = (days) => {
    var lv = LOVE_LEVELS[0];
    for (var l of LOVE_LEVELS) {if (days >= l.days) lv = l;else break;}
    var next = LOVE_LEVELS[LOVE_LEVELS.indexOf(lv) + 1];
    var pct = next ? Math.min(100, Math.round((days - lv.days) / (next.days - lv.days) * 100)) : 100;
    return { ...lv, pct, nextDays: next?.days || null };
  };

  var coupleTimeDiff = (marriageDate) => {
    if (!marriageDate) return null;
    var start = marriageDate.toDate ? marriageDate.toDate() : new Date(marriageDate.seconds * 1000);
    var diff = Date.now() - start.getTime();
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor(diff % 86400000 / 3600000);
    var mins = Math.floor(diff % 3600000 / 60000);
    return { days, hours, mins };
  };

  // Global exports
  window.RINGS_DATA = RINGS_DATA;
  window.PROPOSAL_GIFTS = PROPOSAL_GIFTS;
  window.RARITY_COLORS_C = RARITY_COLORS_C;
  window.LOVE_LEVELS = LOVE_LEVELS;
  window.getLoveLevel = getLoveLevel;
  window.coupleTimeDiff = coupleTimeDiff;

})();