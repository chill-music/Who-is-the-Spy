(function () {
  // ════════════════════════════════════════════════════════
  // 👑 VIP SYSTEM — 10 Levels
  //    كل بادجات VIP قابلة للتخصيص من هنا
  // ════════════════════════════════════════════════════════

  // 🔧 VIP BADGE IMAGES — ضع روابط صور البادجات هنا
  var VIP_BADGE_URLS = {
    1: 'icos/vip icos/vip1.png', // رابط بادج VIP 1
    2: 'icos/vip icos/vip2.png', // رابط بادج VIP 2
    3: 'icos/vip icos/vip3.png', // رابط بادج VIP 3
    4: 'icos/vip icos/vip4.png', // رابط بادج VIP 4
    5: 'icos/vip icos/vip5.png', // رابط بادج VIP 5
    6: 'icos/vip icos/vip6.png', // رابط بادج VIP 6
    7: 'icos/vip icos/vip7.png', // رابط بادج VIP 7
    8: 'icos/vip icos/vip8.png', // رابط بادج VIP 8
    9: 'icos/vip icos/vip9.png', // رابط بادج VIP 9
    10: 'icos/vip icos/vip10.png' // رابط بادج VIP 10
  };

  // 🔧 VIP CHAT TITLE IMAGES — صور Title في الشات خلف اسم المستخدم
  var VIP_CHAT_TITLE_URLS = {
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
    6: '',
    7: '',
    8: '',
    9: '',
    10: 'icos/vip icos/vip10.png'
  };

  // 🔧 VIP MOMENT BACKGROUNDS — خلفية الـ Moments من ليفل 2 لـ 10
  var VIP_MOMENT_BG_URLS = {
    2: '', // رابط خلفية Moments لـ VIP 2
    3: '',
    4: '',
    5: '',
    6: '',
    7: '',
    8: '',
    9: '',
    10: ''
  };

  // ════ VIP XP SYSTEM ════
  // XP مطلوب للوصول لكل مستوى (يحسب تراكمي — مجموع الـ XP الكلي)
  var VIP_XP_THRESHOLDS = {
    0: 0, // عادي
    1: 5000, // VIP 1 — 5,000 XP
    2: 15000, // VIP 2 — 15,000 XP
    3: 35000, // VIP 3 — 35,000 XP
    4: 70000, // VIP 4 — 70,000 XP
    5: 120000, // VIP 5 — 120,000 XP
    6: 200000, // VIP 6 — 200,000 XP
    7: 320000, // VIP 7 — 320,000 XP
    8: 480000, // VIP 8 — 480,000 XP
    9: 700000, // VIP 9 — 700,000 XP
    10: 1000000 // VIP 10 — 1,000,000 XP
  };

  // XP اللي يكسبه اللاعب من كل هدية يبعتها = نسبة من الـ charisma بتاع الهدية
  var VIP_XP_PER_CHARISMA_RATE = 0.05; // 5% من الـ charisma → VIP XP

  // حساب VIP XP من هدية معينة
  // ✅ لو الهدية عندها vipXP محدد يدوياً يُستخدم، غير كده يُحسب 5% من الكاريزما
  var getGiftVIPXP = (gift) => {
    if (gift.vipXP !== undefined && gift.vipXP !== null) return Math.max(1, gift.vipXP);
    var xp = Math.round((gift.charisma || 0) * VIP_XP_PER_CHARISMA_RATE);
    return Math.max(1, xp); // minimum 1 XP per gift
  };

  // حساب مستوى VIP من الـ XP الكلي
  var getVIPLevelFromXP = (totalXP) => {
    var level = 0;
    for (var lvl = 10; lvl >= 1; lvl--) {
      if (totalXP >= VIP_XP_THRESHOLDS[lvl]) {
        level = lvl;
        break;
      }
    }
    return level;
  };

  // Progress للمستوى القادم
  var getVIPXPProgress = (totalXP) => {
    var currentLevel = getVIPLevelFromXP(totalXP);
    if (currentLevel >= 10) return { currentLevel: 10, progress: 100, xpInLevel: 0, xpNeeded: 0, totalXP };
    var currentThreshold = VIP_XP_THRESHOLDS[currentLevel];
    var nextThreshold = VIP_XP_THRESHOLDS[currentLevel + 1];
    var xpInLevel = totalXP - currentThreshold;
    var xpNeeded = nextThreshold - currentThreshold;
    var progress = Math.min(100, Math.round(xpInLevel / xpNeeded * 100));
    return { currentLevel, progress, xpInLevel, xpNeeded, totalXP };
  };

  // ════ VIP CONFIG — الإعدادات الكاملة لكل مستوى ════
  var VIP_CONFIG = [
  {
    level: 1,
    name_en: 'VIP I', name_ar: 'في آي بي 1',
    // اللون: أحمر لـ 1-5
    nameColor: '#ef4444',
    glowColor: null,
    gradientAnim: false,
    xpMultiplier: 1.2, // x1.2 XP
    idLength: 6, // طول ID عادي
    customIdLength: null, // لا custom ID
    exclusiveGifts: false,
    vipDailyTasks: false,
    exclusiveForm: false,
    // 🎁 VIP Items — عناصر تُضاف للإنفنتري عند الشراء وتختفي لما VIP ينتهي
    // مثال: [{ id: 'frame_vip1_gold', type: 'frames' }, { id: 'badge_vip1_star', type: 'badges' }]
    vipItems: [], // ← VIP 1 أضف هنا عناصر المستوى الأول
    // 🖼️ صورة قبل الـ ID في البروفايل — ضع رابط صورة/GIF هنا أو null
    idBeforeImageUrl: null, // ← VIP 1: ضع رابط الصورة هنا
    benefits_en: ['1.2× XP Multiplier', 'VIP Badge'],
    benefits_ar: ['مضاعف XP × 1.2', 'بادج VIP']
  },
  {
    level: 2,
    name_en: 'VIP II', name_ar: 'في آي بي 2',
    nameColor: '#ef4444',
    glowColor: null,
    gradientAnim: false,
    xpMultiplier: 1.3,
    idLength: 6,
    customIdLength: null,
    exclusiveGifts: true, // 🎁 هدايا حصرية من هنا
    vipDailyTasks: true, // ✅ تفعيل Daily Tasks VIP
    exclusiveForm: false,
    // 🎁 VIP Items Level 2 — أضف عناصر هنا (تُمنح عند الشراء، تُسحب عند انتهاء VIP)
    vipItems: [], // ← مثال: [{ id: 'frame_vip2', type: 'frames' }]
    // 🖼️ صورة قبل الـ ID في البروفايل
    idBeforeImageUrl: null, // ← VIP 2: ضع رابط الصورة هنا
    benefits_en: ['1.3× XP', 'VIP Badge', 'Exclusive Gifts', 'VIP Daily Tasks'],
    benefits_ar: ['مضاعف XP × 1.3', 'بادج VIP', 'هدايا حصرية', 'مهام يومية VIP']
  },
  {
    level: 3,
    name_en: 'VIP III', name_ar: 'في آي بي 3',
    nameColor: '#ef4444',
    glowColor: null,
    gradientAnim: false,
    xpMultiplier: 1.4,
    idLength: 6,
    customIdLength: null,
    exclusiveGifts: true,
    vipDailyTasks: true,
    exclusiveForm: false,
    // 🎁 VIP Items Level 3 — أضف عناصر هنا (تُمنح عند الشراء، تُسحب عند انتهاء VIP)
    vipItems: [], // ← مثال: [{ id: 'frame_vip3', type: 'frames' }]
    idBeforeImageUrl: null, // ← VIP 3: ضع رابط الصورة هنا
    benefits_en: ['1.4× XP', 'VIP Badge', 'Exclusive Gifts', 'VIP Daily Tasks'],
    benefits_ar: ['مضاعف XP × 1.4', 'بادج VIP', 'هدايا حصرية', 'مهام يومية VIP']
  },
  {
    level: 4,
    name_en: 'VIP IV', name_ar: 'في آي بي 4',
    nameColor: '#ef4444',
    glowColor: null,
    gradientAnim: false,
    xpMultiplier: 1.5,
    idLength: 6,
    customIdLength: null,
    exclusiveGifts: true,
    vipDailyTasks: true,
    exclusiveForm: false,
    // 🎁 VIP Items Level 4 — أضف عناصر هنا (تُمنح عند الشراء، تُسحب عند انتهاء VIP)
    vipItems: [], // ← مثال: [{ id: 'frame_vip4', type: 'frames' }]
    idBeforeImageUrl: null, // ← VIP 4: ضع رابط الصورة هنا
    benefits_en: ['1.5× XP', 'VIP Badge', 'Exclusive Gifts', 'VIP Daily Tasks'],
    benefits_ar: ['مضاعف XP × 1.5', 'بادج VIP', 'هدايا حصرية', 'مهام يومية VIP']
  },
  {
    level: 5,
    name_en: 'VIP V', name_ar: 'في آي بي 5',
    nameColor: '#ef4444',
    glowColor: null,
    gradientAnim: false,
    xpMultiplier: 1.6,
    idLength: 6,
    customIdLength: null,
    exclusiveGifts: true,
    vipDailyTasks: true,
    exclusiveForm: false,
    // 🎁 VIP Items Level 5 — أضف عناصر هنا (تُمنح عند الشراء، تُسحب عند انتهاء VIP)
    vipItems: [], // ← مثال: [{ id: 'frame_vip5', type: 'frames' }]
    idBeforeImageUrl: null, // ← VIP 5: ضع رابط الصورة هنا
    benefits_en: ['1.6× XP', 'VIP Badge', 'Exclusive Gifts', 'VIP Daily Tasks'],
    benefits_ar: ['مضاعف XP × 1.6', 'بادج VIP', 'هدايا حصرية', 'مهام يومية VIP']
  },
  {
    level: 6,
    name_en: 'VIP VI', name_ar: 'في آي بي 6',
    // Yellow + Glow لـ 6-8
    nameColor: '#eab308',
    glowColor: 'rgba(234,179,8,0.8)',
    gradientAnim: false,
    xpMultiplier: 1.7,
    idLength: 6,
    customIdLength: 6, // Custom 6-digit ID
    exclusiveGifts: true,
    vipDailyTasks: true,
    exclusiveForm: false,
    // 🎁 VIP Items Level 6 — أضف عناصر هنا (تُمنح عند الشراء، تُسحب عند انتهاء VIP)
    vipItems: [], // ← مثال: [{ id: 'frame_vip6', type: 'frames' }]
    idBeforeImageUrl: null, // ← VIP 6: ضع رابط الصورة هنا
    idIconImageUrl: null, // ← VIP 6: أيقونة مميزة أمام الـ ID (ذهبية مثلاً)
    benefits_en: ['1.7× XP', 'Gold Name Glow', 'Custom 6-Digit ID', 'Exclusive Gifts', 'VIP Daily Tasks'],
    benefits_ar: ['مضاعف XP × 1.7', 'توهج اسم ذهبي', 'ID مخصص 6 أرقام', 'هدايا حصرية', 'مهام يومية VIP']
  },
  {
    level: 7,
    name_en: 'VIP VII', name_ar: 'في آي بي 7',
    nameColor: '#eab308',
    glowColor: 'rgba(234,179,8,0.9)',
    gradientAnim: false,
    xpMultiplier: 1.8,
    idLength: 6,
    customIdLength: 5, // Custom 5-digit ID
    exclusiveGifts: true,
    vipDailyTasks: true,
    exclusiveForm: false,
    // 🎁 VIP Items Level 7 — أضف عناصر هنا (تُمنح عند الشراء، تُسحب عند انتهاء VIP)
    vipItems: [], // ← مثال: [{ id: 'frame_vip7', type: 'frames' }]
    idBeforeImageUrl: null, // ← VIP 7: ضع رابط الصورة هنا
    idIconImageUrl: null, // ← VIP 7: أيقونة مميزة أمام الـ ID
    benefits_en: ['1.8× XP', 'Gold Name Glow', 'Custom 5-Digit ID', 'Exclusive Gifts'],
    benefits_ar: ['مضاعف XP × 1.8', 'توهج اسم ذهبي', 'ID مخصص 5 أرقام', 'هدايا حصرية']
  },
  {
    level: 8,
    name_en: 'VIP VIII', name_ar: 'في آي بي 8',
    nameColor: '#eab308',
    glowColor: 'rgba(234,179,8,1)',
    gradientAnim: false,
    xpMultiplier: 1.9,
    idLength: 6,
    customIdLength: 4, // Custom 4-digit ID
    exclusiveGifts: true,
    vipDailyTasks: true,
    exclusiveForm: false,
    // 🎁 VIP Items Level 8 — أضف عناصر هنا (تُمنح عند الشراء، تُسحب عند انتهاء VIP)
    vipItems: [], // ← مثال: [{ id: 'frame_vip8', type: 'frames' }]
    idBeforeImageUrl: null, // ← VIP 8: ضع رابط الصورة هنا
    idIconImageUrl: null, // ← VIP 8: أيقونة مميزة أمام الـ ID
    benefits_en: ['1.9× XP', 'Gold Name Glow', 'Custom 4-Digit ID', 'Exclusive Gifts'],
    benefits_ar: ['مضاعف XP × 1.9', 'توهج اسم ذهبي', 'ID مخصص 4 أرقام', 'هدايا حصرية']
  },
  {
    level: 9,
    name_en: 'VIP IX', name_ar: 'في آي بي 9',
    // Red + Gradient Animation لـ 9-10
    nameColor: '#ef4444',
    glowColor: 'rgba(239,68,68,0.9)',
    gradientAnim: true,
    xpMultiplier: 2.0,
    idLength: 6,
    customIdLength: 3, // Custom 3-digit ID
    exclusiveGifts: true,
    vipDailyTasks: true,
    exclusiveForm: false,
    // 🎁 VIP Items Level 9 — أضف عناصر هنا (تُمنح عند الشراء، تُسحب عند انتهاء VIP)
    vipItems: [], // ← مثال: [{ id: 'frame_vip9', type: 'frames' }]
    idBeforeImageUrl: null, // ← VIP 9: ضع رابط الصورة هنا
    idIconImageUrl: null, // ← VIP 9: أيقونة أنيمشن أمام الـ ID
    benefits_en: ['2× XP', 'Animated Name Glow', 'Custom 3-Digit ID', 'Exclusive Gifts'],
    benefits_ar: ['مضاعف XP × 2', 'توهج اسم متحرك', 'ID مخصص 3 أرقام', 'هدايا حصرية']
  },
  {
    level: 10,
    name_en: 'VIP X', name_ar: 'في آي بي 10',
    nameColor: '#ff1a1a',
    glowColor: 'rgba(255, 26, 26, 1)',
    gradientAnim: true,
    xpMultiplier: 2.0,
    idLength: 6,
    customIdLength: 2, // Custom 2-digit ID
    exclusiveGifts: true,
    vipDailyTasks: true,
    exclusiveForm: true, // 📋 فورم هدايا مخصصة
    // 🎁 VIP Items Level 10 — أضف عناصر هنا (تُمنح عند الشراء، تُسحب عند انتهاء VIP)
    vipItems: [], // ← مثال: [{ id: 'frame_vip10', type: 'frames' }]
    idBeforeImageUrl: null, // ← VIP 10: ضع رابط الصورة هنا
    idIconImageUrl: null, // ← VIP 10: أيقونة أسطورية أمام الـ ID
    benefits_en: ['2× XP', 'Animated Name Glow', 'Custom 2-Digit ID', 'Exclusive Gifts', 'Custom Gift Request'],
    benefits_ar: ['مضاعف XP × 2', 'توهج اسم متحرك', 'ID مخصص رقمين', 'هدايا حصرية', 'طلب هدية مخصصة']
  }];


  // ════ HELPER FUNCTIONS ════

  // getVIPData — يرجع config الـ VIP بناءً على الـ XP
  var getVIPData = (userData) => {
    var totalXP = userData?.vip?.xp || 0;
    var level = getVIPLevelFromXP(totalXP);
    if (!level) return null;
    return VIP_CONFIG.find((v) => v.level === level) || null;
  };

  // getVIPLevel — يحسب الليفل من الـ XP (أو fallback للـ manual level)
  var getVIPLevel = (userData) => {
    var totalXP = userData?.vip?.xp || 0;
    if (totalXP > 0) return getVIPLevelFromXP(totalXP);
    return userData?.vip?.level || 0; // fallback للـ manual admin assign
  };

  var hasVIP = (userData) => getVIPLevel(userData) >= 1;
  // hasVIPExclusiveGifts removed — dead code, never called anywhere in project

  var hasVIPDailyTasks = (userData) => {
    var cfg = getVIPData(userData);
    return cfg?.vipDailyTasks === true;
  };

  var getVIPXPMultiplier = (userData) => {
    var cfg = getVIPData(userData);
    return cfg?.xpMultiplier || 1;
  };

  var getVIPCustomIdLength = (userData) => {
    var cfg = getVIPData(userData);
    return cfg?.customIdLength || null;
  };

  // ════ VIP BADGE COMPONENT ════
  var VIPBadge = ({ userData, onClick, size = 'sm' }) => {
    var level = getVIPLevel(userData);
    if (!level) return null;

    var cfg = VIP_CONFIG[level - 1];
    var badgeUrl = VIP_BADGE_URLS[level];
    var sz = size === 'lg' ? 32 : size === 'md' ? 26 : 22;

    var handleClick = (e) => {
      e.stopPropagation();
      if (onClick) onClick(level);
    };

    return (/*#__PURE__*/
      React.createElement("span", {
        onClick: handleClick,
        title: `${cfg.name_en}`,
        style: { display: 'inline-flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' } },

      badgeUrl ? /*#__PURE__*/
      React.createElement("img", { src: badgeUrl, alt: cfg.name_en, style: { width: sz, height: sz, objectFit: 'contain' } }) : /*#__PURE__*/

      React.createElement("span", {
        className: `vip-badge-icon vip-level-${level}`,
        style: {
          fontSize: sz * 0.65,
          background: `linear-gradient(135deg, ${cfg.nameColor}, ${cfg.nameColor}99)`,
          color: '#fff',
          fontWeight: 900,
          padding: '1px 5px',
          borderRadius: '6px',
          border: `1.5px solid ${cfg.nameColor}`,
          lineHeight: 1.4,
          letterSpacing: '-0.3px',
          boxShadow: cfg.glowColor ? `0 0 8px ${cfg.glowColor}` : 'none',
          minWidth: sz,
          textAlign: 'center'
        } },

      level
      )

      ));

  };

  // ════ VIP NAME COMPONENT — اسم الـ VIP بالتأثيرات الصح ════
  var VIPName = ({ displayName, userData, className = '', style = {} }) => {
    var level = getVIPLevel(userData);
    if (!level) {
      return /*#__PURE__*/React.createElement("span", { className: className, style: style }, displayName);
    }
    var cfg = VIP_CONFIG[level - 1];

    if (cfg.gradientAnim) {
      // VIP 9-10: animated gradient
      return (/*#__PURE__*/
        React.createElement("span", {
          className: `vip-name-animated ${className}`,
          style: {
            color: cfg.nameColor,
            textShadow: `0 0 10px ${cfg.glowColor}, 0 0 20px ${cfg.glowColor}`,
            position: 'relative',
            ...style
          } },

        displayName, /*#__PURE__*/
        React.createElement("span", { className: "vip-name-gradient-overlay", "aria-hidden": "true" }, displayName)
        ));

    }
    if (cfg.glowColor) {
      // VIP 6-8: yellow + glow
      return (/*#__PURE__*/
        React.createElement("span", {
          className: className,
          style: {
            color: cfg.nameColor,
            textShadow: `0 0 8px ${cfg.glowColor}, 0 0 16px ${cfg.glowColor}55`,
            ...style
          } },

        displayName
        ));

    }
    // VIP 1-5: red
    return (/*#__PURE__*/
      React.createElement("span", { className: className, style: { color: cfg.nameColor, ...style } },
      displayName
      ));

  };

  // ════════════════════════════════════════════════════════════
  // 👑 STAFF ROLE BADGE — يظهر في كل مكان
  // ════════════════════════════════════════════════════════════
  var StaffRoleBadge = ({ userData, uid, lang, size = 'sm', onClick }) => {
    var role = getUserRole(userData, uid);
    if (!role) return null;
    var cfg = ROLE_CONFIG[role];
    var isMd = size === 'md';

    return (/*#__PURE__*/
      React.createElement("span", {
        onClick: onClick,
        style: {
          display: 'inline-flex', alignItems: 'center', gap: '2px',
          fontSize: isMd ? '10px' : '8px',
          fontWeight: 900,
          color: cfg.color,
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          borderRadius: '5px',
          padding: isMd ? '2px 7px' : '1px 5px',
          letterSpacing: '0.3px',
          boxShadow: `0 0 8px ${cfg.glow}`,
          whiteSpace: 'nowrap',
          lineHeight: 1.4,
          flexShrink: 0,
          cursor: onClick ? 'pointer' : 'default',
          transition: onClick ? 'all 0.15s' : 'none'
        } },

      cfg.icon, " ", lang === 'ar' ? cfg.label_ar : cfg.label_en
      ));

  };

  // ════════════════════════════════════════════════════════════
  // 🏷️  PLAYER NAME TAG
  // الكومبوننت الموحّد لعرض اللاعب في كل مكان:
  //   لوبي · ليدر بورد · أصدقاء · تصويت · أي مكان تاني
  //
  // Props:
  //   player      — { photoURL|photo, displayName|name, equipped, vip }
  //   lang        — 'ar' | 'en'
  //   size        — 'sm' (default) | 'md'
  //   showStatus  — لون نقطة الستاتوس (مثلاً '#4ade80') أو null
  // ════════════════════════════════════════════════════════════
  // ✅ FIX: FlagDisplay — works on ALL platforms including Windows Chrome
  // Windows Chrome does NOT render flag emoji. We use flagcdn.com image as primary
  // and fall back to emoji if the image fails.
  var FlagDisplay = ({ countryCode, flagEmoji, size = 20, style = {} }) => {
    var [imgFailed, setImgFailed] = React.useState(false);
    if (!countryCode && !flagEmoji) return null;
    var code = (countryCode || '').toLowerCase();
    var imgUrl = code ? `https://flagcdn.com/w${size}/${code}.png` : null;
    if (imgUrl && !imgFailed) {
      return (/*#__PURE__*/
        React.createElement("img", {
          src: imgUrl,
          alt: flagEmoji || code,
          onError: () => setImgFailed(true),
          style: {
            width: size + 'px',
            height: Math.round(size * 0.7) + 'px',
            objectFit: 'cover',
            borderRadius: '2px',
            display: 'inline-block',
            verticalAlign: 'middle',
            flexShrink: 0,
            ...style
          } }
        ));

    }
    // fallback: emoji
    return /*#__PURE__*/React.createElement("span", { style: { fontSize: size * 1.1 + 'px', lineHeight: 1, ...style } }, flagEmoji || '');
  };

  var PlayerNameTag = ({ player, lang, size = 'sm', showStatus = null }) => {
    if (!player) return null;

    var photoURL = player.photoURL || player.photo || null;
    var name = player.displayName || player.name || '—';
    var equipped = player.equipped || {};
    var vipActive = getVIPLevel(player) > 0;
    var banData = player.ban || null;
    var playerUID = player.uid || player.id || null;
    var playerRole = getUserRole(player, playerUID);

    // Title
    var titleId = equipped.titles;
    var titleItem = titleId ? SHOP_ITEMS.titles.find((t) => t.id === titleId) : null;

    // Badges — max 3
    var badgeIds = equipped.badges || [];

    var avatarSz = size === 'md' ? 'md' : 'sm';
    var nameSz = size === 'md' ? '13px' : '12px';

    return (/*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: size === 'md' ? '10px' : '8px', minWidth: 0 } }, /*#__PURE__*/


      React.createElement("div", { style: { position: 'relative', flexShrink: 0 } }, /*#__PURE__*/
      React.createElement(AvatarWithFrame, { photoURL: photoURL, equipped: equipped, size: avatarSz, banData: banData, lang: lang }),
      showStatus && /*#__PURE__*/
      React.createElement("div", { style: {
          position: 'absolute', bottom: '-1px', right: '-1px',
          width: '9px', height: '9px', borderRadius: '50%',
          background: showStatus, border: '2px solid #0a0a14'
        } })

      ), /*#__PURE__*/


      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 } }, /*#__PURE__*/


      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'nowrap' } }, /*#__PURE__*/
      React.createElement(VIPName, {
        displayName: name,
        userData: player,
        style: { fontSize: nameSz, fontWeight: 700,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          maxWidth: '120px' } }
      ),

      player.familyTag && window.FamilySignBadge && /*#__PURE__*/
      React.createElement("div", { style: { transform: 'scale(0.8)', transformOrigin: 'left center', marginLeft: '-2px', marginRight: '-2px' } }, /*#__PURE__*/
      React.createElement(window.FamilySignBadge, {
        tag: player.familyTag,
        signLevel: player.familySignLevel || 1,
        color: window.FamilyConstants?.getFamilySignLevelDataByLevel?.(player.familySignLevel || 1)?.color || '#00f2ff',
        imageURL: window.FamilyConstants?.getFamilySignImage?.(0, player.familySignLevel || 1),
        small: true }
      )
      ),

      vipActive && /*#__PURE__*/
      React.createElement(VIPBadge, { userData: player, size: "sm", onClick: () => {} }),

      playerRole && /*#__PURE__*/
      React.createElement(StaffRoleBadge, { userData: player, uid: playerUID, lang: lang, size: "sm" }),

      banData?.isBanned && (!banData.expiresAt || new Date() < (banData.expiresAt?.toDate?.() || new Date(banData.expiresAt))) && /*#__PURE__*/
      React.createElement("span", { className: "banned-name-indicator" }, "\uD83D\uDEAB")

      ),


      badgeIds.length > 0 && /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '2px' } },
      badgeIds.slice(0, 3).map((bid, idx) => {
        var b = SHOP_ITEMS.badges.find((b) => b.id === bid);
        if (!b) return null;
        return b.imageUrl && b.imageUrl.trim() !== '' ? /*#__PURE__*/
        React.createElement("img", { key: idx, src: b.imageUrl, alt: "",
          style: { width: 13, height: 13, objectFit: 'contain' } }) : /*#__PURE__*/

        React.createElement("span", { key: idx, style: { fontSize: '11px', lineHeight: 1 } }, b.preview);

      })
      ),



      titleItem && /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '2px' } },
      titleItem.imageUrl && titleItem.imageUrl.trim() !== '' ? /*#__PURE__*/
      React.createElement("img", { src: titleItem.imageUrl, alt: "",
        style: { maxWidth: '70px', maxHeight: '13px', objectFit: 'contain' } }) : /*#__PURE__*/

      React.createElement("span", { style: { fontSize: '9px', color: '#a78bfa', lineHeight: 1, whiteSpace: 'nowrap' } }, "\uD83C\uDF10 ",
      titleItem.preview, " ", lang === 'ar' ? titleItem.name_ar : titleItem.name_en
      )

      )


      )
      ));

  };

  // ════ VIP BADGE POPUP ════
  var VIPBadgePopup = ({ level, onClose }) => {
    if (!level) return null;
    var cfg = VIP_CONFIG[level - 1];
    return (/*#__PURE__*/
      React.createElement("div", {
        style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: Z.TOOLTIP },
        onClick: onClose }, /*#__PURE__*/

      React.createElement("div", {
        className: "animate-pop",
        style: { background: 'linear-gradient(135deg,#0f0f1a,#1a0010)', border: `2px solid ${cfg.nameColor}`, borderRadius: '16px', padding: '24px', textAlign: 'center', minWidth: '220px', boxShadow: `0 0 30px ${cfg.nameColor}55` },
        onClick: (e) => e.stopPropagation() }, /*#__PURE__*/

      React.createElement("div", { style: { fontSize: '40px', marginBottom: '10px' } }, "\uD83D\uDC51"), /*#__PURE__*/
      React.createElement("div", { style: { color: cfg.nameColor, fontWeight: 900, fontSize: '20px', marginBottom: '6px' } }, "VIP Level ",
      level
      ), /*#__PURE__*/
      React.createElement("div", { style: { color: '#9ca3af', fontSize: '12px', marginBottom: '14px' } }, cfg.name_ar), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' } },
      cfg.benefits_ar.map((b, i) => /*#__PURE__*/
      React.createElement("div", { key: i, style: { fontSize: '11px', color: '#d1d5db', display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/
      React.createElement("span", { style: { color: cfg.nameColor } }, "\u2713"), " ", b
      )
      )
      ), /*#__PURE__*/
      React.createElement("button", { onClick: onClose, style: { background: cfg.nameColor, color: '#000', fontWeight: 800, padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px' } }, "OK"

      )
      )
      ));

  };

  // ════ VIP INFO TABLE MODAL ════
  var VIPInfoModal = ({ onClose, lang }) => {
    var t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    return (/*#__PURE__*/
      React.createElement("div", { className: "modal-overlay", onClick: onClose }, /*#__PURE__*/
      React.createElement("div", { className: "modal-content animate-pop", onClick: (e) => e.stopPropagation(), style: { maxWidth: '380px' } }, /*#__PURE__*/
      React.createElement("div", { className: "modal-header" }, /*#__PURE__*/
      React.createElement("h2", { className: "modal-title" }, "\uD83D\uDC51 ", lang === 'ar' ? 'مميزات VIP' : 'VIP Benefits'), /*#__PURE__*/
      React.createElement(ModalCloseBtn, { onClose: onClose })
      ), /*#__PURE__*/
      React.createElement("div", { className: "modal-body", style: { padding: '12px' } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
      VIP_CONFIG.map((cfg) => /*#__PURE__*/
      React.createElement("div", { key: cfg.level, className: "vip-info-card", style: {
          background: `linear-gradient(135deg, ${cfg.nameColor}11, rgba(15,15,26,0.95))`,
          border: `1px solid ${cfg.nameColor}44`,
          borderRadius: '10px', padding: '10px 12px',
          display: 'flex', flexDirection: 'column', gap: '4px'
        } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, /*#__PURE__*/
      React.createElement("span", { style: {
          background: cfg.nameColor, color: '#000', fontWeight: 900,
          padding: '2px 8px', borderRadius: '6px', fontSize: '12px'
        } }, "VIP ",
      cfg.level
      ), /*#__PURE__*/
      React.createElement("span", { style: { color: cfg.nameColor, fontWeight: 700, fontSize: '13px' } },
      lang === 'ar' ? cfg.name_ar : cfg.name_en
      ),
      cfg.xpMultiplier >= 2 && /*#__PURE__*/React.createElement("span", { style: { fontSize: '10px', color: '#fbbf24' } }, "\u26A1 \xD72")
      ), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '3px' } },
      (lang === 'ar' ? cfg.benefits_ar : cfg.benefits_en).map((b, i) => /*#__PURE__*/
      React.createElement("span", { key: i, style: {
          fontSize: '10px', color: '#d1d5db',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '4px', padding: '2px 6px',
          border: '1px solid rgba(255,255,255,0.08)'
        } }, b)
      ),
      cfg.customIdLength && /*#__PURE__*/
      React.createElement("span", { style: {
          fontSize: '10px', color: '#60a5fa',
          background: 'rgba(96,165,250,0.1)',
          borderRadius: '4px', padding: '2px 6px',
          border: '1px solid rgba(96,165,250,0.3)'
        } }, "ID: ", cfg.customIdLength, " ", lang === 'ar' ? 'أرقام' : 'digits')

      )
      )
      )
      )
      )
      )
      ));

  };

  // ════ VIP 10 EXCLUSIVE REQUEST FORM — with full approval system ════
  var VIP10RequestForm = ({ user, lang, onNotification, userData }) => {
    var [giftName, setGiftName] = useState('');
    var [giftImage, setGiftImage] = useState('');
    var [giftEmail, setGiftEmail] = useState('');
    var [luckyNumber, setLuckyNumber] = useState('');
    var [sending, setSending] = useState(false);
    var [showForm, setShowForm] = useState(false); // for modification mode

    // STATUS: 0=pending, 1=approved, 2=rejected
    var [latestRequest, setLatestRequest] = useState(null);
    var [loadingReq, setLoadingReq] = useState(true);

    useEffect(() => {
      if (!user?.uid) {setLoadingReq(false);return;}
      var unsub = vip10RequestsCollection.
      where('uid', '==', user.uid).
      limit(10).
      onSnapshot((snap) => {
        if (!snap.empty) {
          var docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          docs.sort((a, b) => {
            var aT = a.createdAt?.toMillis?.() || 0;
            var bT = b.createdAt?.toMillis?.() || 0;
            return bT - aT;
          });
          setLatestRequest(docs[0]);
        } else {
          setLatestRequest(null);
        }
        setLoadingReq(false);
      }, () => setLoadingReq(false));
      return unsub;
    }, [user?.uid]);

    // ✅ Can the user submit THIS month?
    var getMonthKey = (d) => {
      var date = d?.toDate ? d.toDate() : d ? new Date(d) : null;
      if (!date) return null;
      return `${date.getFullYear()}-${date.getMonth()}`;
    };
    var thisMonthKey = `${new Date().getFullYear()}-${new Date().getMonth()}`;
    var lastRequestMonthKey = getMonthKey(latestRequest?.createdAt);
    var alreadyRequestedThisMonth = lastRequestMonthKey === thisMonthKey;

    // ✅ Logic:
    // - No request ever → show form
    // - Pending (0) → show waiting
    // - Approved (1) + same month → show approved + "next month you can modify"
    // - Approved (1) + new month → show approved + "modify gift" button → opens form with "Modification" label
    // - Rejected (2) + same month → show rejected + can resubmit
    // - Rejected (2) + new month → show form (fresh start)
    var isApproved = latestRequest?.status === 1;
    var isRejected = latestRequest?.status === 2;
    var isPending = latestRequest?.status === 0;
    var canModify = isApproved && !alreadyRequestedThisMonth; // approved but new month
    var canResubmit = isRejected; // always can resubmit after rejection
    var isModification = isApproved; // any new request after approval = modification

    var handleImageChange = (e) => {
      var file = e.target.files?.[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = (ev) => setGiftImage(ev.target.result);
      reader.readAsDataURL(file);
    };

    var handleSubmit = async () => {
      if (!giftName.trim() || !user) return;
      setSending(true);
      try {
        await vip10RequestsCollection.add({
          uid: user.uid,
          displayName: userData?.displayName || '',
          giftName: giftName.trim(),
          giftImage: giftImage || '',
          giftEmail: giftEmail.trim(),
          luckyNumber: parseInt(luckyNumber) || 0,
          status: 0,
          adminNote: '',
          isModification: isModification, // ✅ flag for admin
          createdAt: TS()
        });
        await usersCollection.doc(user.uid).update({
          'vip.lastGiftRequest': TS()
        });
        onNotification(lang === 'ar' ?
        isModification ? '✅ تم إرسال طلب التعديل!' : '✅ تم إرسال طلبك!' :
        isModification ? '✅ Modification request sent!' : '✅ Request sent!');
        setGiftName('');setGiftImage('');setGiftEmail('');setLuckyNumber('');
        setShowForm(false);
      } catch (e) {
        onNotification(lang === 'ar' ? '❌ خطأ، حاول مرة أخرى' : '❌ Error, try again');
      }
      setSending(false);
    };

    if (loadingReq) return null;

    // ── Gift request form ──
    var RequestForm = ({ label }) => /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
    label && /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '10px', color: '#fbbf24', fontWeight: 800, textAlign: 'center',
        background: 'rgba(251,191,36,0.08)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(251,191,36,0.2)' } }, "\u270F\uFE0F ",
    label
    ), /*#__PURE__*/

    React.createElement("input", { className: "input-dark", placeholder: lang === 'ar' ? 'اسم الهدية' : 'Gift name',
      value: giftName, onChange: (e) => setGiftName(e.target.value), style: { fontSize: '12px' } }), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("label", { style: { fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' } }, "\uD83D\uDDBC\uFE0F ",
    lang === 'ar' ? 'صورة الهدية (اختياري)' : 'Gift image (optional)'
    ), /*#__PURE__*/
    React.createElement("input", { type: "file", accept: "image/*", onChange: handleImageChange,
      style: { fontSize: '11px', color: '#d1d5db', background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px',
        padding: '4px 6px', width: '100%', cursor: 'pointer' } }),
    giftImage && /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' } }, /*#__PURE__*/
    React.createElement("img", { src: giftImage, alt: "preview", style: { width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.4)' } }), /*#__PURE__*/
    React.createElement("button", { onClick: () => setGiftImage(''), style: { fontSize: '10px', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' } }, "\u2715 ",
    lang === 'ar' ? 'حذف' : 'Remove'
    )
    )

    ), /*#__PURE__*/
    React.createElement("input", { className: "input-dark", type: "email", placeholder: lang === 'ar' ? 'بريدك الإلكتروني' : 'Your email',
      value: giftEmail, onChange: (e) => setGiftEmail(e.target.value), style: { fontSize: '12px' } }), /*#__PURE__*/
    React.createElement("input", { className: "input-dark", type: "number", placeholder: lang === 'ar' ? 'رقمك المحظوظ 🍀' : 'Your lucky number 🍀',
      value: luckyNumber, onChange: (e) => setLuckyNumber(e.target.value), style: { fontSize: '12px' } }), /*#__PURE__*/
    React.createElement("button", { onClick: handleSubmit, disabled: sending || !giftName.trim(), className: "btn-neon",
      style: { padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
        opacity: sending || !giftName.trim() ? 0.5 : 1 } },
    sending ? '⏳' : lang === 'ar' ? '📨 إرسال الطلب' : '📨 Send Request'
    ), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '9px', color: '#6b7280', textAlign: 'center' } }, "\u26A1 ",
    lang === 'ar' ? 'سيتم مراجعة طلبك خلال 24 ساعة' : 'Request reviewed within 24h'
    )
    );


    // ── Status card shared ──
    var StatusCard = ({ statusColor, statusEmoji, statusText, giftText, note, children }) => /*#__PURE__*/
    React.createElement("div", { style: {
        borderRadius: '10px', padding: '12px',
        background: `rgba(${statusColor},0.06)`,
        border: `1px solid rgba(${statusColor},0.3)`,
        display: 'flex', flexDirection: 'column', gap: '6px'
      } }, /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '18px' } }, statusEmoji), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '11px', fontWeight: 800, color: `rgb(${statusColor})` } }, statusText),
    giftText && /*#__PURE__*/React.createElement("div", { style: { fontSize: '10px', color: '#9ca3af', marginTop: '2px' } },
    lang === 'ar' ? 'الهدية:' : 'Gift:', ' ', /*#__PURE__*/
    React.createElement("span", { style: { color: '#fbbf24', fontWeight: 700 } }, giftText)
    )
    )
    ),
    note && /*#__PURE__*/
    React.createElement("div", { style: { background: 'rgba(255,255,255,0.04)', borderRadius: '7px', padding: '8px 10px',
        borderLeft: '3px solid #ef4444', fontSize: '11px', color: '#e2e8f0', lineHeight: 1.5 } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '9px', color: '#ef4444', fontWeight: 800, display: 'block', marginBottom: '2px' } },
    lang === 'ar' ? '📋 رسالة الإدارة:' : '📋 Admin Note:'
    ),
    note
    ),

    children, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '9px', color: '#6b7280', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '5px' } },
    lang === 'ar' ? 'يمكنك الطلب مرة واحدة في الشهر' : 'One request per month'
    )
    );


    return (/*#__PURE__*/
      React.createElement("div", { style: {
          background: 'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(15,15,26,0.95))',
          border: '1px solid rgba(239,68,68,0.35)',
          borderRadius: '12px', padding: '14px', marginTop: '6px'
        } }, /*#__PURE__*/
      React.createElement("div", { style: { color: '#ef4444', fontWeight: 800, fontSize: '13px', marginBottom: '10px',
          display: 'flex', alignItems: 'center', gap: '6px' } }, "\uD83D\uDC51 ",
      lang === 'ar' ? 'طلب هدية مخصصة (VIP 10 فقط)' : 'Custom Gift Request (VIP 10 only)'
      ),


      !latestRequest && /*#__PURE__*/React.createElement(RequestForm, { label: null }),


      isPending && /*#__PURE__*/
      React.createElement(StatusCard, {
        statusColor: "251,191,36",
        statusEmoji: "\u23F3",
        statusText: lang === 'ar' ? 'طلبك قيد المراجعة…' : 'Request under review…',
        giftText: latestRequest.giftName,
        note: latestRequest.adminNote || null },

      !latestRequest.adminNote && /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '9px', color: '#6b7280', textAlign: 'center' } },
      lang === 'ar' ? 'في انتظار رد الإدارة…' : 'Waiting for admin response…'
      )

      ),



      isApproved && !showForm && /*#__PURE__*/
      React.createElement(StatusCard, {
        statusColor: "74,222,128",
        statusEmoji: "\u2705",
        statusText: lang === 'ar' ? '✅ تم قبول طلب الهدية!' : '✅ Gift Request Approved!',
        giftText: latestRequest.giftName,
        note: latestRequest.adminNote || null },

      canModify ? /*#__PURE__*/
      React.createElement("button", { onClick: () => setShowForm(true), style: {
          padding: '7px', borderRadius: '7px', fontSize: '11px', fontWeight: 700,
          background: 'rgba(251,191,36,0.15)', color: '#fbbf24',
          border: '1px solid rgba(251,191,36,0.35)', cursor: 'pointer'
        } }, "\u270F\uFE0F ",
      lang === 'ar' ? 'تعديل الهدية (شهر جديد)' : 'Modify Gift (New Month)'
      ) : /*#__PURE__*/

      React.createElement("div", { style: { fontSize: '9px', color: '#6b7280', textAlign: 'center' } }, "\uD83D\uDD12 ",
      lang === 'ar' ? 'يمكنك التعديل الشهر القادم' : 'You can modify next month'
      )

      ),



      isApproved && showForm && /*#__PURE__*/
      React.createElement(React.Fragment, null, /*#__PURE__*/
      React.createElement(RequestForm, { label: lang === 'ar' ? 'تعديل الهدية المخصصة' : 'Modify Custom Gift' }), /*#__PURE__*/
      React.createElement("button", { onClick: () => setShowForm(false), style: {
          width: '100%', marginTop: '4px', padding: '5px', background: 'none',
          border: 'none', color: '#6b7280', fontSize: '10px', cursor: 'pointer' } },
      lang === 'ar' ? '← إلغاء' : '← Cancel'
      )
      ),



      isRejected && !showForm && /*#__PURE__*/
      React.createElement(StatusCard, {
        statusColor: "248,113,113",
        statusEmoji: "\u274C",
        statusText: lang === 'ar' ? 'تم رفض طلبك' : 'Request Rejected',
        giftText: latestRequest.giftName,
        note: latestRequest.adminNote || null }, /*#__PURE__*/

      React.createElement("button", { onClick: () => setShowForm(true), style: {
          padding: '7px', borderRadius: '7px', fontSize: '11px', fontWeight: 700,
          background: 'rgba(239,68,68,0.15)', color: '#f87171',
          border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer'
        } }, "\uD83D\uDD04 ",
      lang === 'ar' ? 'إرسال طلب جديد' : 'Submit New Request'
      )
      ),



      isRejected && showForm && /*#__PURE__*/
      React.createElement(React.Fragment, null, /*#__PURE__*/
      React.createElement(RequestForm, { label: null }), /*#__PURE__*/
      React.createElement("button", { onClick: () => setShowForm(false), style: {
          width: '100%', marginTop: '4px', padding: '5px', background: 'none',
          border: 'none', color: '#6b7280', fontSize: '10px', cursor: 'pointer' } },
      lang === 'ar' ? '← إلغاء' : '← Cancel'
      )
      )

      ));

  };



  // ════ VIP BUY / RENEW SECTION (Premium Shop Style) ════
  var VIPBuySection = ({ userData, user, lang, onNotification, isRenew }) => {
    var [showConfirm, setShowConfirm] = useState(false);
    var [buying, setBuying] = useState(false);
    var currency = userData?.currency || 0;
    var hasVIP = typeof getVIPLevel === 'function' && getVIPLevel(userData) > 0;
    var vipDaysLeft = (() => {
      if (!userData?.vip?.expiresAt) return null;
      var exp = userData.vip.expiresAt?.toDate ? userData.vip.expiresAt.toDate() : new Date(userData.vip.expiresAt.seconds * 1000);
      var diff = Math.ceil((exp - Date.now()) / 86400000);
      return Math.max(0, diff);
    })();

    var handleBuyVIP = async () => {
      if (!user || currency < 50000 || buying) return;
      setBuying(true);
      try {
        var now = new Date();
        var expiresAt = hasVIP && vipDaysLeft > 0 ?
        new Date(now.getTime() + (vipDaysLeft + 30) * 86400000) :
        new Date(now.getTime() + 30 * 86400000);
        
        if (window.SecurityService) {
          await window.SecurityService.applyCurrencyTransaction(user.uid, -50000, `VIP Activation/Renewal`);
        } else {
          await usersCollection.doc(user.uid).update({ currency: firebase.firestore.FieldValue.increment(-50000) });
        }

        await usersCollection.doc(user.uid).update({
          'vip.active': true,
          'vip.activatedAt': hasVIP ? userData.vip.activatedAt || TS() : TS(),
          'vip.expiresAt': expiresAt,
          'vip.xp': firebase.firestore.FieldValue.increment(hasVIP ? 0 : 5000)
        });
        onNotification && onNotification(lang === 'ar' ? '👑 تم تفعيل VIP! +30 يوم' : '👑 VIP Activated! +30 days');
        setShowConfirm(false);
      } catch (e) {
        onNotification && onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error');
      }
      setBuying(false);
    };

    var canAfford = currency >= 50000;

    if (isRenew) return (/*#__PURE__*/
      React.createElement("div", { style: { marginTop: '8px' } },
      !showConfirm ? /*#__PURE__*/
      React.createElement("button", {
        onClick: () => canAfford && setShowConfirm(true),
        disabled: !canAfford,
        style: {
          width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
          background: canAfford ? 'linear-gradient(135deg,#5b21b6,#7c3aed,#a855f7)' : 'rgba(100,100,100,0.12)',
          color: canAfford ? '#fff' : '#4b5563',
          fontWeight: 900, fontSize: '14px', cursor: canAfford ? 'pointer' : 'not-allowed',
          boxShadow: canAfford ? '0 6px 20px rgba(124,58,237,0.35)' : 'none',
          transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
        } },
      canAfford && /*#__PURE__*/React.createElement("div", { style: { position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)', animation: 'shimmer 2s infinite' } }), /*#__PURE__*/
      React.createElement("span", { style: { position: 'relative' } },
      canAfford ?
      `🔄 ${lang === 'ar' ? 'تجديد +30 يوم' : 'Renew +30 days'} — 50,000 🧠` :
      `❌ ${lang === 'ar' ? 'تحتاج' : 'Need'} 50,000 🧠`
      )
      ) : /*#__PURE__*/

      React.createElement("div", { style: { borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(168,85,247,0.4)', background: 'linear-gradient(135deg,#1a0533,#0d0d2b)', padding: '18px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' } }, /*#__PURE__*/
      React.createElement("div", { style: { color: '#e9d5ff', fontWeight: 900, fontSize: '15px', marginBottom: '6px' } }, "🔄 ", lang === 'ar' ? 'تأكيد التجديد؟' : 'Confirm Renewal?'), /*#__PURE__*/
      React.createElement("div", { style: { color: '#fbbf24', fontWeight: 900, fontSize: '20px', marginBottom: '16px' } }, "50,000 \uD83E\uDDE0"), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '10px', justifyContent: 'center' } }, /*#__PURE__*/
      React.createElement("button", { onClick: () => setShowConfirm(false), style: { padding: '9px 20px', borderRadius: '11px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#9ca3af', fontWeight: 600, cursor: 'pointer', fontSize: '13px' } },
      lang === 'ar' ? 'إلغاء' : 'Cancel'
      ), /*#__PURE__*/
      React.createElement("button", { onClick: handleBuyVIP, disabled: buying, style: { padding: '9px 24px', borderRadius: '11px', border: 'none', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '13px', boxShadow: '0 0 15px rgba(124,58,237,0.4)' } },
      buying ? '⏳' : lang === 'ar' ? 'تأكيد' : 'Confirm'
      )
      )
      )
      ));

    return (/*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, /*#__PURE__*/

      React.createElement("div", { style: {
          borderRadius: '14px', padding: '14px 16px',
          background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(168,85,247,0.08))',
          border: '1px solid rgba(168,85,247,0.35)',
          fontSize: '11px', color: '#c4b5fd', lineHeight: 1.6, textAlign: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
        } }, "\uD83C\uDF81 ",
      lang === 'ar' ?
      'كل هدية ترسلها تمنحك VIP XP — كلما أرسلت أكثر ارتفع مستواك!' :
      'Every gift you send earns VIP XP — the more you give, the higher you level!'
      ), /*#__PURE__*/

      React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' } },
      [
      { icon: '🎨', ar: 'اسم ملون مميز', en: 'Colored VIP Name' },
      { icon: '⚡', ar: 'مضاعف XP ×1.2', en: '1.2× XP Multiplier' },
      { icon: '🏅', ar: 'بادج VIP حصري', en: 'Exclusive VIP Badge' },
      { icon: '🎁', ar: 'هدايا VIP مقفلة', en: 'Locked VIP Gifts' }].
      map((f, i) => /*#__PURE__*/
      React.createElement("div", { key: i, style: {
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '11px', color: '#e9d5ff',
          background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(196,181,253,0.15)',
          borderRadius: '11px', padding: '9px 10px'
        } }, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '15px', flexShrink: 0 } }, f.icon), /*#__PURE__*/
      React.createElement("span", { style: { fontWeight: 600, lineHeight: 1.3 } }, lang === 'ar' ? f.ar : f.en)
      )
      )
      ), /*#__PURE__*/

      React.createElement("div", { style: { textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginBottom: '2px' } },
      lang === 'ar' ? 'رصيدك الحالي:' : 'Current Balance:', " ", /*#__PURE__*/React.createElement("span", { style: { color: '#fbbf24', fontWeight: 800 } }, currency.toLocaleString(), " \uD83E\uDDE0")
      ),


      !showConfirm ? /*#__PURE__*/
      React.createElement("button", {
        onClick: () => canAfford && setShowConfirm(true),
        disabled: !canAfford,
        style: {
          width: '100%', padding: '16px', borderRadius: '15px', border: 'none',
          background: canAfford ? 'linear-gradient(135deg,#b91c1c,#ef4444,#f87171)' : 'rgba(100,100,100,0.12)',
          color: canAfford ? '#fff' : '#4b5563',
          fontWeight: 900, fontSize: '16px', cursor: canAfford ? 'pointer' : 'not-allowed',
          boxShadow: canAfford ? '0 8px 24px rgba(239,68,68,0.4)' : 'none',
          transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
        } },
      canAfford && /*#__PURE__*/React.createElement("div", { style: { position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)', animation: 'shimmer 2s infinite' } }), /*#__PURE__*/
      React.createElement("span", { style: { position: 'relative' } },
      canAfford ?
      `👑 ${lang === 'ar' ? 'اشترِ VIP 1' : 'Buy VIP 1'} — 50,000 🧠` :
      `❌ ${lang === 'ar' ? 'تحتاج' : 'Need'} 50,000 🧠`
      )
      ) : /*#__PURE__*/

      React.createElement("div", { style: { borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(239,68,68,0.4)', background: 'linear-gradient(135deg,#2e0a0a,#0f0a0a)', padding: '20px', textAlign: 'center', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '40px', marginBottom: '10px' } }, "\uD83D\uDC51"), /*#__PURE__*/
      React.createElement("div", { style: { color: '#fee2e2', fontWeight: 900, fontSize: '17px', marginBottom: '6px' } },
      lang === 'ar' ? 'هل تريد تفعيل VIP؟' : 'Activate VIP?'
      ), /*#__PURE__*/
      React.createElement("div", { style: { color: '#fbbf24', fontWeight: 900, fontSize: '22px', marginBottom: '18px' } }, "50,000 \uD83E\uDDE0"), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '12px', justifyContent: 'center' } }, /*#__PURE__*/
      React.createElement("button", { onClick: () => setShowConfirm(false), style: { padding: '10px 22px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', fontWeight: 600, cursor: 'pointer' } },
      lang === 'ar' ? 'إلغاء' : 'Cancel'
      ), /*#__PURE__*/
      React.createElement("button", { onClick: handleBuyVIP, disabled: buying, style: { padding: '10px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#ef4444,#b91c1c)', color: '#fff', fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 25px rgba(239,68,68,0.45)', fontSize: '14px' } },
      buying ? '⏳' : lang === 'ar' ? 'تأكيد' : 'Confirm'
      )
      )
      )
      ));

  };

  // ════ VIP CENTER SECTION (for Settings) ════
  var VIPCenterSection = ({ userData, user, lang, onNotification }) => {
    var [showInfoModal, setShowInfoModal] = useState(false);
    var [showBadgePopup, setShowBadgePopup] = useState(false);
    var [customIdEnabled, setCustomIdEnabled] = useState(userData?.vip?.customIdEnabled || false);
    var [desiredId, setDesiredId] = useState('');
    var [idCheckStatus, setIdCheckStatus] = useState(null);
    var [idRequestSending, setIdRequestSending] = useState(false);
    var [pendingRequest, setPendingRequest] = useState(null);

    var totalVIPXP = userData?.vip?.xp || 0;
    var level = getVIPLevel(userData);
    var cfg = level ? VIP_CONFIG[level - 1] : null;
    var customIdLen = getVIPCustomIdLength(userData);
    var xpInfo = getVIPXPProgress(totalVIPXP);

    useEffect(() => {
      if (!user || !level || !customIdLen) return;
      var unsub = vip10IdRequestsCollection.where('uid', '==', user.uid).limit(10).onSnapshot((snap) => {
        if (!snap.empty) {
          var docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          docs.sort((a, b) => (b.createdAt?.toMillis?.() || b.createdAt || 0) - (a.createdAt?.toMillis?.() || a.createdAt || 0));
          setPendingRequest(docs[0]);
        } else {
          setPendingRequest(null);
        }
      });
      return unsub;
    }, [user?.uid, level]);

    var checkIdAvailability = async (id) => {
      if (!id || id.length !== customIdLen) return;
      setIdCheckStatus('checking');
      var snap = await usersCollection.where('customId', '==', id).limit(1).get();
      setIdCheckStatus(snap.empty ? 'available' : 'taken');
    };

    var handleIdRequest = async () => {
      if (idCheckStatus !== 'available' || idRequestSending || !user) return;
      setIdRequestSending(true);
      try {
        await vip10IdRequestsCollection.add({
          uid: user.uid, displayName: userData?.displayName || '',
          desiredId: desiredId.trim(), vipLevel: level, status: 0, createdAt: TS()
        });
        onNotification(lang === 'ar' ? '✅ تم إرسال الطلب' : '✅ Request Sent');
        setDesiredId('');
        setIdCheckStatus(null);
      } catch (e) {}
      setIdRequestSending(false);
    };

    var barColor = cfg ? cfg.nameColor : '#7c3aed';

    return (/*#__PURE__*/
      React.createElement("div", { className: "vip-center-container", style: { display: 'flex', flexDirection: 'column', gap: '20px' } }, /*#__PURE__*/
        
        // 👑 VIP Status Header
        React.createElement("div", { style: { 
            borderRadius: '24px', padding: '24px 20px',
            background: 'linear-gradient(135deg,#1a0035 0%,#2d0060 40%,#1a0035 100%)',
            border: '1.5px solid rgba(168,85,247,0.4)',
            boxShadow: '0 0 50px rgba(124,58,237,0.25)', position: 'relative', overflow: 'hidden'
          } },
          React.createElement("div", { style: { position: 'absolute', top: 0, left: '15%', right: '15%', height: '2.5px', background: 'linear-gradient(90deg,transparent,#a855f7,transparent)' } }), /*#__PURE__*/
          React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' } }, /*#__PURE__*/
            React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '14px' } }, /*#__PURE__*/
              React.createElement("div", { style: { width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', boxShadow: '0 8px 16px rgba(124,58,237,0.4)' } }, "\uD83D\uDC51"), /*#__PURE__*/
              React.createElement("div", null, /*#__PURE__*/
                React.createElement("div", { style: { fontSize: '20px', fontWeight: 900, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' } }, "VIP STATUS"), /*#__PURE__*/
                React.createElement("div", { style: { fontSize: '12px', color: '#a78bfa', fontWeight: 600 } }, level ? (lang === 'ar' ? cfg.name_ar : cfg.name_en) : (lang === 'ar' ? 'غير مفضل' : 'Not Active'))
              )
            ), /*#__PURE__*/
            level > 0 && React.createElement("div", { style: { cursor: 'pointer' }, onClick: () => setShowBadgePopup(true) }, /*#__PURE__*/
              React.createElement(VIPBadge, { userData: userData, size: "lg" })
            )
          ), /*#__PURE__*/
          
          React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' } }, /*#__PURE__*/
            React.createElement("span", { style: { fontSize: '13px', color: '#cbd5e1', fontWeight: 700 } }, "VIP XP"), /*#__PURE__*/
            React.createElement("span", { style: { fontSize: '13px', color: '#fff', fontWeight: 900 } }, totalVIPXP.toLocaleString(), " ", level < 10 && /*#__PURE__*/React.createElement("span", { style: { color: '#64748b', fontWeight: 400 } }, "/ ", VIP_XP_THRESHOLDS[level + 1]?.toLocaleString()))
          ), /*#__PURE__*/
          React.createElement("div", { style: { height: '12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' } }, /*#__PURE__*/
            React.createElement("div", { style: { width: `${xpInfo.progress}%`, height: '100%', background: `linear-gradient(90deg, #7c3aed, ${barColor})`, boxShadow: `0 0 12px ${barColor}` } })
          ), /*#__PURE__*/
          React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', marginTop: '6px' } }, /*#__PURE__*/
            React.createElement("span", { style: { fontSize: '10px', color: '#94a3b8', fontWeight: 600 } }, lang === 'ar' ? `المستوى ${level}` : `Level ${level}`),
            level < 10 ? /*#__PURE__*/React.createElement("span", { style: { fontSize: '10px', color: barColor, fontWeight: 700 } }, lang === 'ar' ? `باقي ${(xpInfo.xpNeeded - xpInfo.xpInLevel).toLocaleString()} XP لـ VIP ${level + 1}` : `${(xpInfo.xpNeeded - xpInfo.xpInLevel).toLocaleString()} XP to VIP ${level + 1}`) : /*#__PURE__*/React.createElement("span", { style: { fontSize: '10px', color: '#fbbf24', fontWeight: 900 } }, "\u2728 MAX LEVEL")
          )
        ),

        // 🛒 Subscription / Buy Section
        React.createElement("div", { style: { borderRadius: '20px', background: 'rgba(20,20,40,0.6)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px' } },
          React.createElement(VIPBuySection, { userData: userData, user: user, lang: lang, onNotification: onNotification, isRenew: level > 0 })
        ),

        // 📊 VIP Levels Table
        React.createElement("div", { style: { borderRadius: '20px', background: 'rgba(15,10,32,0.8)', border: '1px solid rgba(124,58,237,0.2)', padding: '12px' } }, /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '13px', fontWeight: 900, color: '#a78bfa', marginBottom: '12px', paddingLeft: '8px' } }, "\uD83D\uDCC8 VIP PROGRESSION"),
          VIP_CONFIG.map((v, i) => /*#__PURE__*/
            React.createElement("div", { key: v.level, style: { display: 'flex', alignItems: 'center', padding: '10px 12px', background: level === v.level ? 'rgba(124,58,237,0.1)' : 'transparent', borderRadius: '12px', marginBottom: '4px' } }, /*#__PURE__*/
              React.createElement("div", { style: { width: '45px', fontWeight: 900, color: level >= v.level ? v.nameColor : '#4b5563', fontSize: '13px' } }, "V", v.level), /*#__PURE__*/
              React.createElement("div", { style: { flex: 1, margin: '0 12px' } }, /*#__PURE__*/
                React.createElement("div", { style: { height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' } }, /*#__PURE__*/
                  React.createElement("div", { style: { width: level > v.level ? '100%' : level === v.level ? `${xpInfo.progress}%` : '0%', height: '100%', background: v.nameColor, borderRadius: '3px', boxShadow: level >= v.level ? `0 0 6px ${v.nameColor}` : 'none' } })
                )
              ), /*#__PURE__*/
              React.createElement("div", { style: { fontSize: '11px', color: level >= v.level ? '#fff' : '#64748b', fontWeight: 700 } }, VIP_XP_THRESHOLDS[v.level].toLocaleString(), " XP")
            )
          )
        ),

        // 🆔 Custom ID Request (VIP 6+)
        customIdLen && React.createElement("div", { style: { borderRadius: '20px', padding: '20px', background: 'rgba(10,10,25,0.9)', border: `1.5px solid ${level === 10 ? 'rgba(239,68,68,0.3)' : 'rgba(96,165,250,0.3)'}`, boxShadow: '0 15px 35px rgba(0,0,0,0.4)' } }, /*#__PURE__*/
          React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' } }, /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '24px' } }, "\uD83E\uDEAA"), /*#__PURE__*/
            React.createElement("div", null, /*#__PURE__*/
              React.createElement("div", { style: { fontSize: '16px', fontWeight: 900, color: level === 10 ? '#ef4444' : '#60a5fa' } }, lang === 'ar' ? 'طلب معرف مخصص' : 'Custom ID Request'), /*#__PURE__*/
              React.createElement("div", { style: { fontSize: '11px', color: '#94a3b8' } }, lang === 'ar' ? `بصيغة ${customIdLen} أرقام بالضبط` : `Exactly ${customIdLen} digits format`)
            )
          ), /*#__PURE__*/
          !pendingRequest ? /*#__PURE__*/
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, /*#__PURE__*/
              React.createElement("div", { style: { display: 'flex', gap: '10px' } }, /*#__PURE__*/
                React.createElement("input", { className: "input-dark", value: desiredId, maxLength: customIdLen, onChange: e => { setDesiredId(e.target.value.replace(/\D/g, '')); setIdCheckStatus(null); }, style: { flex: 1, height: '50px', fontSize: '22px', fontWeight: 900, textAlign: 'center', letterSpacing: '8px', borderRadius: '15px' } }), /*#__PURE__*/
                React.createElement("button", { onClick: () => checkIdAvailability(desiredId), disabled: desiredId.length !== customIdLen, style: { width: '70px', borderRadius: '15px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' } }, idCheckStatus === 'checking' ? '⏳' : (lang === 'ar' ? 'تحقق' : 'Check'))
              ),
              idCheckStatus === 'taken' && React.createElement("div", { style: { color: '#f87171', fontSize: '11px', textAlign: 'center', fontWeight: 700 } }, "❌ ", lang === 'ar' ? 'هذا الرقم محجوز' : 'This ID is taken'),
              idCheckStatus === 'available' && React.createElement("div", { style: { color: '#4ade80', fontSize: '11px', textAlign: 'center', fontWeight: 700 } }, "✅ ", lang === 'ar' ? 'الرقم متاح' : 'ID is available'), /*#__PURE__*/
              React.createElement("button", { onClick: handleIdRequest, disabled: idCheckStatus !== 'available', style: { width: '100%', height: '50px', borderRadius: '15px', background: idCheckStatus === 'available' ? (level === 10 ? 'linear-gradient(135deg,#ef4444,#b91c1c)' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)') : 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '15px', fontWeight: 900, border: 'none', cursor: idCheckStatus === 'available' ? 'pointer' : 'not-allowed', boxShadow: idCheckStatus === 'available' ? '0 10px 20px rgba(0,0,0,0.3)' : 'none' } }, lang === 'ar' ? 'إرسال الطلب' : 'Submit Request')
            ) : /*#__PURE__*/
            React.createElement("div", { style: { padding: '16px', borderRadius: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' } }, /*#__PURE__*/
              React.createElement("div", { style: { fontSize: '18px', color: pendingRequest.status === 1 ? '#4ade80' : pendingRequest.status === 2 ? '#f87171' : '#fbbf24', fontWeight: 900, marginBottom: '4px' } }, pendingRequest.status === 0 ? (lang === 'ar' ? '⏳ قيد الانتظار...' : '⏳ Pending Review...') : pendingRequest.status === 1 ? (lang === 'ar' ? '✅ تم القبول!' : '✅ Approved!') : (lang === 'ar' ? '❌ تم الرفض' : '❌ Rejected')), /*#__PURE__*/
              React.createElement("div", { style: { fontSize: '13px', color: '#cbd5e1' } }, lang === 'ar' ? 'الرقم المطلوب: ' : 'Desired: ', /*#__PURE__*/React.createElement("span", { style: { color: '#fff', fontWeight: 900, letterSpacing: '2px' } }, pendingRequest.desiredId))
            )
        ),

        // 📝 Exclusive Form (VIP 10)
        cfg?.exclusiveForm && React.createElement(VIP10RequestForm, { user: user, lang: lang, onNotification: onNotification, userData: userData }),

        showInfoModal && React.createElement(VIPInfoModal, { onClose: () => setShowInfoModal(false), lang: lang }),
        showBadgePopup && React.createElement(VIPBadgePopup, { level: level, onClose: () => setShowBadgePopup(false) })
      )
    );
  };

  // Export to window
  window.VIPBadge = VIPBadge;
  window.VIPName = VIPName;
  window.StaffRoleBadge = StaffRoleBadge;
  window.PlayerNameTag = PlayerNameTag;
  window.FlagDisplay = FlagDisplay;
  window.VIPCenterSection = VIPCenterSection;
  window.getVIPLevel = getVIPLevel;
  window.getVIPData = getVIPData;
  window.hasVIP = hasVIP;
  window.hasVIPDailyTasks = hasVIPDailyTasks;
  window.getVIPXPMultiplier = getVIPXPMultiplier;
  window.getVIPCustomIdLength = getVIPCustomIdLength;
  window.getGiftVIPXP = getGiftVIPXP;
  window.getVIPLevelFromXP = getVIPLevelFromXP;
  window.getVIPXPProgress = getVIPXPProgress;
  window.VIP_CONFIG = VIP_CONFIG;

})();