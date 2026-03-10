// ════════════════════════════════════════════════════════
// 👑 VIP SYSTEM — 10 Levels
//    كل بادجات VIP قابلة للتخصيص من هنا
// ════════════════════════════════════════════════════════

// 🔧 VIP BADGE IMAGES — ضع روابط صور البادجات هنا
const VIP_BADGE_URLS = {
    1:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/vip1.png',   // رابط بادج VIP 1
    2:  '',   // رابط بادج VIP 2
    3:  '',   // رابط بادج VIP 3
    4:  '',   // رابط بادج VIP 4
    5:  '',   // رابط بادج VIP 5
    6:  '',   // رابط بادج VIP 6
    7:  '',   // رابط بادج VIP 7
    8:  '',   // رابط بادج VIP 8
    9:  '',   // رابط بادج VIP 9
    10: '',   // رابط بادج VIP 10
};

// 🔧 VIP CHAT TITLE IMAGES — صور Title في الشات خلف اسم المستخدم
const VIP_CHAT_TITLE_URLS = {
    1:  '',
    2:  '',
    3:  '',
    4:  '',
    5:  '',
    6:  '',
    7:  '',
    8:  '',
    9:  '',
    10: '',
};

// 🔧 VIP MOMENT BACKGROUNDS — خلفية الـ Moments من ليفل 2 لـ 10
const VIP_MOMENT_BG_URLS = {
    2:  '',   // رابط خلفية Moments لـ VIP 2
    3:  '',
    4:  '',
    5:  '',
    6:  '',
    7:  '',
    8:  '',
    9:  '',
    10: '',
};

// ════ VIP XP SYSTEM ════
// XP مطلوب للوصول لكل مستوى (يحسب تراكمي — مجموع الـ XP الكلي)
const VIP_XP_THRESHOLDS = {
    0: 0,        // عادي
    1: 5000,     // VIP 1 — 5,000 XP
    2: 15000,    // VIP 2 — 15,000 XP
    3: 35000,    // VIP 3 — 35,000 XP
    4: 70000,    // VIP 4 — 70,000 XP
    5: 120000,   // VIP 5 — 120,000 XP
    6: 200000,   // VIP 6 — 200,000 XP
    7: 320000,   // VIP 7 — 320,000 XP
    8: 480000,   // VIP 8 — 480,000 XP
    9: 700000,   // VIP 9 — 700,000 XP
    10: 1000000, // VIP 10 — 1,000,000 XP
};

// XP اللي يكسبه اللاعب من كل هدية يبعتها = نسبة من الـ charisma بتاع الهدية
const VIP_XP_PER_CHARISMA_RATE = 0.05; // 5% من الـ charisma → VIP XP

// حساب VIP XP من هدية معينة
// ✅ لو الهدية عندها vipXP محدد يدوياً يُستخدم، غير كده يُحسب 5% من الكاريزما
const getGiftVIPXP = (gift) => {
    if (gift.vipXP !== undefined && gift.vipXP !== null) return Math.max(1, gift.vipXP);
    const xp = Math.round((gift.charisma || 0) * VIP_XP_PER_CHARISMA_RATE);
    return Math.max(1, xp); // minimum 1 XP per gift
};

// حساب مستوى VIP من الـ XP الكلي
const getVIPLevelFromXP = (totalXP) => {
    let level = 0;
    for (let lvl = 10; lvl >= 1; lvl--) {
        if (totalXP >= VIP_XP_THRESHOLDS[lvl]) {
            level = lvl;
            break;
        }
    }
    return level;
};

// Progress للمستوى القادم
const getVIPXPProgress = (totalXP) => {
    const currentLevel = getVIPLevelFromXP(totalXP);
    if (currentLevel >= 10) return { currentLevel: 10, progress: 100, xpInLevel: 0, xpNeeded: 0, totalXP };
    const currentThreshold = VIP_XP_THRESHOLDS[currentLevel];
    const nextThreshold    = VIP_XP_THRESHOLDS[currentLevel + 1];
    const xpInLevel = totalXP - currentThreshold;
    const xpNeeded  = nextThreshold - currentThreshold;
    const progress  = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
    return { currentLevel, progress, xpInLevel, xpNeeded, totalXP };
};

// ════ VIP CONFIG — الإعدادات الكاملة لكل مستوى ════
const VIP_CONFIG = [
    {
        level: 1,
        name_en: 'VIP I',       name_ar: 'في آي بي 1',
        // اللون: أحمر لـ 1-5
        nameColor: '#ef4444',
        glowColor: null,
        gradientAnim: false,
        xpMultiplier: 1.2,           // x1.2 XP
        idLength: 6,                  // طول ID عادي
        customIdLength: null,         // لا custom ID
        exclusiveGifts: false,
        vipDailyTasks: false,
        exclusiveForm: false,
        // 🎁 VIP Items — عناصر تُضاف للإنفنتري عند الشراء وتختفي لما VIP ينتهي
        // مثال: [{ id: 'frame_vip1_gold', type: 'frames' }, { id: 'badge_vip1_star', type: 'badges' }]
        vipItems: [],  // ← VIP 1 أضف هنا عناصر المستوى الأول
        benefits_en: ['1.2× XP Multiplier', 'VIP Badge'],
        benefits_ar: ['مضاعف XP × 1.2', 'بادج VIP'],
    },
    {
        level: 2,
        name_en: 'VIP II',      name_ar: 'في آي بي 2',
        nameColor: '#ef4444',
        glowColor: null,
        gradientAnim: false,
        xpMultiplier: 1.3,
        idLength: 6,
        customIdLength: null,
        exclusiveGifts: true,         // 🎁 هدايا حصرية من هنا
        vipDailyTasks: true,          // ✅ تفعيل Daily Tasks VIP
        exclusiveForm: false,
        // 🎁 VIP Items Level 2 — أضف عناصر هنا (تُمنح عند الشراء، تُسحب عند انتهاء VIP)
        vipItems: [],  // ← مثال: [{ id: 'frame_vip2', type: 'frames' }]
        benefits_en: ['1.3× XP', 'VIP Badge', 'Exclusive Gifts', 'VIP Daily Tasks'],
        benefits_ar: ['مضاعف XP × 1.3', 'بادج VIP', 'هدايا حصرية', 'مهام يومية VIP'],
    },
    {
        level: 3,
        name_en: 'VIP III',     name_ar: 'في آي بي 3',
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
        vipItems: [],  // ← مثال: [{ id: 'frame_vip3', type: 'frames' }]
        benefits_en: ['1.4× XP', 'VIP Badge', 'Exclusive Gifts', 'VIP Daily Tasks'],
        benefits_ar: ['مضاعف XP × 1.4', 'بادج VIP', 'هدايا حصرية', 'مهام يومية VIP'],
    },
    {
        level: 4,
        name_en: 'VIP IV',      name_ar: 'في آي بي 4',
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
        vipItems: [],  // ← مثال: [{ id: 'frame_vip4', type: 'frames' }]
        benefits_en: ['1.5× XP', 'VIP Badge', 'Exclusive Gifts', 'VIP Daily Tasks'],
        benefits_ar: ['مضاعف XP × 1.5', 'بادج VIP', 'هدايا حصرية', 'مهام يومية VIP'],
    },
    {
        level: 5,
        name_en: 'VIP V',       name_ar: 'في آي بي 5',
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
        vipItems: [],  // ← مثال: [{ id: 'frame_vip5', type: 'frames' }]
        benefits_en: ['1.6× XP', 'VIP Badge', 'Exclusive Gifts', 'VIP Daily Tasks'],
        benefits_ar: ['مضاعف XP × 1.6', 'بادج VIP', 'هدايا حصرية', 'مهام يومية VIP'],
    },
    {
        level: 6,
        name_en: 'VIP VI',      name_ar: 'في آي بي 6',
        // Yellow + Glow لـ 6-8
        nameColor: '#eab308',
        glowColor: 'rgba(234,179,8,0.8)',
        gradientAnim: false,
        xpMultiplier: 1.7,
        idLength: 6,
        customIdLength: 6,            // Custom 6-digit ID
        exclusiveGifts: true,
        vipDailyTasks: true,
        exclusiveForm: false,
        // 🎁 VIP Items Level 6 — أضف عناصر هنا (تُمنح عند الشراء، تُسحب عند انتهاء VIP)
        vipItems: [],  // ← مثال: [{ id: 'frame_vip6', type: 'frames' }]
        benefits_en: ['1.7× XP', 'Gold Name Glow', 'Custom 6-Digit ID', 'Exclusive Gifts', 'VIP Daily Tasks'],
        benefits_ar: ['مضاعف XP × 1.7', 'توهج اسم ذهبي', 'ID مخصص 6 أرقام', 'هدايا حصرية', 'مهام يومية VIP'],
    },
    {
        level: 7,
        name_en: 'VIP VII',     name_ar: 'في آي بي 7',
        nameColor: '#eab308',
        glowColor: 'rgba(234,179,8,0.9)',
        gradientAnim: false,
        xpMultiplier: 1.8,
        idLength: 6,
        customIdLength: 5,            // Custom 5-digit ID
        exclusiveGifts: true,
        vipDailyTasks: true,
        exclusiveForm: false,
        // 🎁 VIP Items Level 7 — أضف عناصر هنا (تُمنح عند الشراء، تُسحب عند انتهاء VIP)
        vipItems: [],  // ← مثال: [{ id: 'frame_vip7', type: 'frames' }]
        benefits_en: ['1.8× XP', 'Gold Name Glow', 'Custom 5-Digit ID', 'Exclusive Gifts'],
        benefits_ar: ['مضاعف XP × 1.8', 'توهج اسم ذهبي', 'ID مخصص 5 أرقام', 'هدايا حصرية'],
    },
    {
        level: 8,
        name_en: 'VIP VIII',    name_ar: 'في آي بي 8',
        nameColor: '#eab308',
        glowColor: 'rgba(234,179,8,1)',
        gradientAnim: false,
        xpMultiplier: 1.9,
        idLength: 6,
        customIdLength: 4,            // Custom 4-digit ID
        exclusiveGifts: true,
        vipDailyTasks: true,
        exclusiveForm: false,
        // 🎁 VIP Items Level 8 — أضف عناصر هنا (تُمنح عند الشراء، تُسحب عند انتهاء VIP)
        vipItems: [],  // ← مثال: [{ id: 'frame_vip8', type: 'frames' }]
        benefits_en: ['1.9× XP', 'Gold Name Glow', 'Custom 4-Digit ID', 'Exclusive Gifts'],
        benefits_ar: ['مضاعف XP × 1.9', 'توهج اسم ذهبي', 'ID مخصص 4 أرقام', 'هدايا حصرية'],
    },
    {
        level: 9,
        name_en: 'VIP IX',      name_ar: 'في آي بي 9',
        // Red + Gradient Animation لـ 9-10
        nameColor: '#ef4444',
        glowColor: 'rgba(239,68,68,0.9)',
        gradientAnim: true,
        xpMultiplier: 2.0,
        idLength: 6,
        customIdLength: 3,            // Custom 3-digit ID
        exclusiveGifts: true,
        vipDailyTasks: true,
        exclusiveForm: false,
        // 🎁 VIP Items Level 9 — أضف عناصر هنا (تُمنح عند الشراء، تُسحب عند انتهاء VIP)
        vipItems: [],  // ← مثال: [{ id: 'frame_vip9', type: 'frames' }]
        benefits_en: ['2× XP', 'Animated Name Glow', 'Custom 3-Digit ID', 'Exclusive Gifts'],
        benefits_ar: ['مضاعف XP × 2', 'توهج اسم متحرك', 'ID مخصص 3 أرقام', 'هدايا حصرية'],
    },
    {
        level: 10,
        name_en: 'VIP X',       name_ar: 'في آي بي 10',
        nameColor: '#ef4444',
        glowColor: 'rgba(239,68,68,1)',
        gradientAnim: true,
        xpMultiplier: 2.0,
        idLength: 6,
        customIdLength: 2,            // Custom 2-digit ID
        exclusiveGifts: true,
        vipDailyTasks: true,
        exclusiveForm: true,          // 📋 فورم هدايا مخصصة
        // 🎁 VIP Items Level 10 — أضف عناصر هنا (تُمنح عند الشراء، تُسحب عند انتهاء VIP)
        vipItems: [],  // ← مثال: [{ id: 'frame_vip10', type: 'frames' }]
        benefits_en: ['2× XP', 'Animated Name Glow', 'Custom 2-Digit ID', 'Exclusive Gifts', 'Custom Gift Request'],
        benefits_ar: ['مضاعف XP × 2', 'توهج اسم متحرك', 'ID مخصص رقمين', 'هدايا حصرية', 'طلب هدية مخصصة'],
    },
];

// ════ HELPER FUNCTIONS ════

// getVIPData — يرجع config الـ VIP بناءً على الـ XP
const getVIPData = (userData) => {
    const totalXP = userData?.vip?.xp || 0;
    const level = getVIPLevelFromXP(totalXP);
    if (!level) return null;
    return VIP_CONFIG.find(v => v.level === level) || null;
};

// getVIPLevel — يحسب الليفل من الـ XP (أو fallback للـ manual level)
const getVIPLevel = (userData) => {
    const totalXP = userData?.vip?.xp || 0;
    if (totalXP > 0) return getVIPLevelFromXP(totalXP);
    return userData?.vip?.level || 0; // fallback للـ manual admin assign
};

const hasVIP = (userData) => getVIPLevel(userData) >= 1;

const hasVIPExclusiveGifts = (userData) => {
    const cfg = getVIPData(userData);
    return cfg?.exclusiveGifts === true;
};

const hasVIPDailyTasks = (userData) => {
    const cfg = getVIPData(userData);
    return cfg?.vipDailyTasks === true;
};

const getVIPXPMultiplier = (userData) => {
    const cfg = getVIPData(userData);
    return cfg?.xpMultiplier || 1;
};

const getVIPCustomIdLength = (userData) => {
    const cfg = getVIPData(userData);
    return cfg?.customIdLength || null;
};

// ════ VIP BADGE COMPONENT ════
const VIPBadge = ({ userData, onClick, size = 'sm' }) => {
    const level = getVIPLevel(userData);
    if (!level) return null;

    const cfg = VIP_CONFIG[level - 1];
    const badgeUrl = VIP_BADGE_URLS[level];
    const sz = size === 'lg' ? 32 : size === 'md' ? 26 : 22;

    const handleClick = (e) => {
        e.stopPropagation();
        if (onClick) onClick(level);
    };

    return (
        <span
            onClick={handleClick}
            title={`${cfg.name_en}`}
            style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
        >
            {badgeUrl ? (
                <img src={badgeUrl} alt={cfg.name_en} style={{ width: sz, height: sz, objectFit: 'contain' }} />
            ) : (
                <span
                    className={`vip-badge-icon vip-level-${level}`}
                    style={{
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
                        textAlign: 'center',
                    }}
                >
                    {level}
                </span>
            )}
        </span>
    );
};

// ════ VIP NAME COMPONENT — اسم الـ VIP بالتأثيرات الصح ════
const VIPName = ({ displayName, userData, className = '', style = {} }) => {
    const level = getVIPLevel(userData);
    if (!level) {
        return <span className={className} style={style}>{displayName}</span>;
    }
    const cfg = VIP_CONFIG[level - 1];

    if (cfg.gradientAnim) {
        // VIP 9-10: animated gradient
        return (
            <span
                className={`vip-name-animated ${className}`}
                style={{
                    color: cfg.nameColor,
                    textShadow: `0 0 10px ${cfg.glowColor}, 0 0 20px ${cfg.glowColor}`,
                    position: 'relative',
                    ...style
                }}
            >
                {displayName}
                <span className="vip-name-gradient-overlay" aria-hidden="true">{displayName}</span>
            </span>
        );
    }
    if (cfg.glowColor) {
        // VIP 6-8: yellow + glow
        return (
            <span
                className={className}
                style={{
                    color: cfg.nameColor,
                    textShadow: `0 0 8px ${cfg.glowColor}, 0 0 16px ${cfg.glowColor}55`,
                    ...style
                }}
            >
                {displayName}
            </span>
        );
    }
    // VIP 1-5: red
    return (
        <span className={className} style={{ color: cfg.nameColor, ...style }}>
            {displayName}
        </span>
    );
};

// ════ VIP CHAT TITLE COMPONENT ════
const VIPChatTitle = ({ userData }) => {
    const level = getVIPLevel(userData);
    if (!level) return null;
    const titleUrl = VIP_CHAT_TITLE_URLS[level];
    if (!titleUrl) return null;
    return (
        <span className="vip-chat-title-container" style={{
            display: 'inline-block',
            backgroundImage: `url(${titleUrl})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
        }} />
    );
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
const PlayerNameTag = ({ player, lang, size = 'sm', showStatus = null }) => {
    if (!player) return null;

    const photoURL  = player.photoURL || player.photo || null;
    const name      = player.displayName || player.name || '—';
    const equipped  = player.equipped || {};
    const vipActive = getVIPLevel(player) > 0;

    // Title
    const titleId   = equipped.titles;
    const titleItem = titleId ? SHOP_ITEMS.titles.find(t => t.id === titleId) : null;

    // Badges — max 3
    const badgeIds  = equipped.badges || [];

    const avatarSz  = size === 'md' ? 'md' : 'sm';
    const nameSz    = size === 'md' ? '13px' : '12px';

    return (
        <div style={{ display:'flex', alignItems:'center', gap: size==='md'?'10px':'8px', minWidth:0 }}>

            {/* ── Avatar ── */}
            <div style={{ position:'relative', flexShrink:0 }}>
                <AvatarWithFrame photoURL={photoURL} equipped={equipped} size={avatarSz} />
                {showStatus && (
                    <div style={{
                        position:'absolute', bottom:'-1px', right:'-1px',
                        width:'9px', height:'9px', borderRadius:'50%',
                        background: showStatus, border:'2px solid #0a0a14'
                    }} />
                )}
            </div>

            {/* ── Info ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:'2px', minWidth:0 }}>

                {/* Row 1 — Name + VIP badge */}
                <div style={{ display:'flex', alignItems:'center', gap:'4px', flexWrap:'nowrap' }}>
                    <VIPName
                        displayName={name}
                        userData={player}
                        style={{ fontSize: nameSz, fontWeight:700,
                                 overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                                 maxWidth:'120px' }}
                    />
                    {vipActive && (
                        <VIPBadge userData={player} size="sm" onClick={() => {}} />
                    )}
                </div>

                {/* Row 2 — Badges (max 3) */}
                {badgeIds.length > 0 && (
                    <div style={{ display:'flex', alignItems:'center', gap:'2px' }}>
                        {badgeIds.slice(0, 3).map((bid, idx) => {
                            const b = SHOP_ITEMS.badges.find(b => b.id === bid);
                            if (!b) return null;
                            return b.imageUrl && b.imageUrl.trim() !== '' ? (
                                <img key={idx} src={b.imageUrl} alt=""
                                    style={{ width:13, height:13, objectFit:'contain' }} />
                            ) : (
                                <span key={idx} style={{ fontSize:'11px', lineHeight:1 }}>{b.preview}</span>
                            );
                        })}
                    </div>
                )}

                {/* Row 3 — Title with 🌐 */}
                {titleItem && (
                    <div style={{ display:'flex', alignItems:'center', gap:'2px' }}>
                        {titleItem.imageUrl && titleItem.imageUrl.trim() !== '' ? (
                            <img src={titleItem.imageUrl} alt=""
                                style={{ maxWidth:'70px', maxHeight:'13px', objectFit:'contain' }} />
                        ) : (
                            <span style={{ fontSize:'9px', color:'#a78bfa', lineHeight:1, whiteSpace:'nowrap' }}>
                                🌐 {titleItem.preview} {lang==='ar' ? titleItem.name_ar : titleItem.name_en}
                            </span>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

// ════ VIP BADGE POPUP ════
const VIPBadgePopup = ({ level, onClose }) => {
    if (!level) return null;
    const cfg = VIP_CONFIG[level - 1];
    return (
        <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: Z.TOOLTIP }}
            onClick={onClose}
        >
            <div
                className="animate-pop"
                style={{ background: 'linear-gradient(135deg,#0f0f1a,#1a0010)', border: `2px solid ${cfg.nameColor}`, borderRadius: '16px', padding: '24px', textAlign: 'center', minWidth: '220px', boxShadow: `0 0 30px ${cfg.nameColor}55` }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>👑</div>
                <div style={{ color: cfg.nameColor, fontWeight: 900, fontSize: '20px', marginBottom: '6px' }}>
                    VIP Level {level}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '14px' }}>{cfg.name_ar}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                    {cfg.benefits_ar.map((b, i) => (
                        <div key={i} style={{ fontSize: '11px', color: '#d1d5db', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: cfg.nameColor }}>✓</span> {b}
                        </div>
                    ))}
                </div>
                <button onClick={onClose} style={{ background: cfg.nameColor, color: '#000', fontWeight: 800, padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                    OK
                </button>
            </div>
        </div>
    );
};

// ════ VIP INFO TABLE MODAL ════
const VIPInfoModal = ({ onClose, lang }) => {
    const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '380px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">👑 {lang === 'ar' ? 'مميزات VIP' : 'VIP Benefits'}</h2>
                    <ModalCloseBtn onClose={onClose} />
                </div>
                <div className="modal-body" style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {VIP_CONFIG.map(cfg => (
                            <div key={cfg.level} className="vip-info-card" style={{
                                background: `linear-gradient(135deg, ${cfg.nameColor}11, rgba(15,15,26,0.95))`,
                                border: `1px solid ${cfg.nameColor}44`,
                                borderRadius: '10px', padding: '10px 12px',
                                display: 'flex', flexDirection: 'column', gap: '4px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                        background: cfg.nameColor, color: '#000', fontWeight: 900,
                                        padding: '2px 8px', borderRadius: '6px', fontSize: '12px'
                                    }}>
                                        VIP {cfg.level}
                                    </span>
                                    <span style={{ color: cfg.nameColor, fontWeight: 700, fontSize: '13px' }}>
                                        {lang === 'ar' ? cfg.name_ar : cfg.name_en}
                                    </span>
                                    {cfg.xpMultiplier >= 2 && <span style={{ fontSize: '10px', color: '#fbbf24' }}>⚡ ×2</span>}
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '3px' }}>
                                    {(lang === 'ar' ? cfg.benefits_ar : cfg.benefits_en).map((b, i) => (
                                        <span key={i} style={{
                                            fontSize: '10px', color: '#d1d5db',
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '4px', padding: '2px 6px',
                                            border: '1px solid rgba(255,255,255,0.08)'
                                        }}>{b}</span>
                                    ))}
                                    {cfg.customIdLength && (
                                        <span style={{
                                            fontSize: '10px', color: '#60a5fa',
                                            background: 'rgba(96,165,250,0.1)',
                                            borderRadius: '4px', padding: '2px 6px',
                                            border: '1px solid rgba(96,165,250,0.3)'
                                        }}>ID: {cfg.customIdLength} {lang === 'ar' ? 'أرقام' : 'digits'}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ════ VIP 10 EXCLUSIVE REQUEST FORM — with full approval system ════
const VIP10RequestForm = ({ user, lang, onNotification, userData }) => {
    const [giftName,    setGiftName]    = useState('');
    const [giftImage,   setGiftImage]   = useState('');   // base64
    const [giftEmail,   setGiftEmail]   = useState('');
    const [luckyNumber, setLuckyNumber] = useState('');
    const [sending,     setSending]     = useState(false);

    // ✅ Real-time pending request listener — same pattern as custom ID
    const [pendingRequest, setPendingRequest] = useState(null);
    const [loadingReq,     setLoadingReq]     = useState(true);

    // STATUS FIELD (same as vip10IdRequests):
    // 0 = pending (قيد المراجعة)
    // 1 = approved (تم القبول)
    // 2 = rejected (تم الرفض)

    useEffect(() => {
        if (!user?.uid) { setLoadingReq(false); return; }
        const unsub = vip10RequestsCollection
            .where('uid', '==', user.uid)
            .limit(10)
            .onSnapshot(snap => {
                if (!snap.empty) {
                    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    docs.sort((a, b) => {
                        const aT = a.createdAt?.toMillis?.() || a.createdAt || 0;
                        const bT = b.createdAt?.toMillis?.() || b.createdAt || 0;
                        return bT - aT;
                    });
                    setPendingRequest(docs[0]);
                } else {
                    setPendingRequest(null);
                }
                setLoadingReq(false);
            }, () => setLoadingReq(false));
        return unsub;
    }, [user?.uid]);

    // Check if user can submit another request this month
    const canRequestThisMonth = () => {
        const lastReq = userData?.vip?.lastGiftRequest;
        if (!lastReq) return true;
        const lastDate = lastReq?.toDate ? lastReq.toDate() : new Date(lastReq);
        const now = new Date();
        return !(lastDate.getMonth() === now.getMonth() && lastDate.getFullYear() === now.getFullYear());
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setGiftImage(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!giftName.trim() || !user) return;
        setSending(true);
        try {
            await vip10RequestsCollection.add({
                uid:         user.uid,
                displayName: userData?.displayName || '',
                giftName:    giftName.trim(),
                giftImage:   giftImage || '',
                giftEmail:   giftEmail.trim(),
                luckyNumber: parseInt(luckyNumber) || 0,
                // STATUS: 0=pending, 1=approved, 2=rejected
                status:      0,
                adminNote:   '',
                createdAt:   firebase.firestore.FieldValue.serverTimestamp(),
            });
            // ✅ Store last request date for monthly throttle
            await usersCollection.doc(user.uid).update({
                'vip.lastGiftRequest': firebase.firestore.FieldValue.serverTimestamp()
            });
            onNotification(lang === 'ar' ? '✅ تم إرسال طلبك!' : '✅ Request sent!');
            setGiftName(''); setGiftImage(''); setGiftEmail(''); setLuckyNumber('');
        } catch (e) {
            onNotification(lang === 'ar' ? '❌ خطأ، حاول مرة أخرى' : '❌ Error, try again');
        }
        setSending(false);
    };

    if (loadingReq) return null;

    return (
        <div style={{
            background: 'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(15,15,26,0.95))',
            border: '1px solid rgba(239,68,68,0.35)',
            borderRadius: '12px', padding: '14px', marginTop: '6px'
        }}>
            <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '13px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                👑 {lang === 'ar' ? 'طلب هدية مخصصة (VIP 10 فقط)' : 'Custom Gift Request (VIP 10 only)'}
            </div>

            {/* ✅ Show form OR status box based on pending request */}
            {!pendingRequest ? (
                /* ── Form: no pending request yet ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Gift Name */}
                    <input
                        className="input-dark"
                        placeholder={lang === 'ar' ? 'اسم الهدية' : 'Gift name'}
                        value={giftName} onChange={e => setGiftName(e.target.value)}
                        style={{ fontSize: '12px' }}
                    />

                    {/* Image Upload */}
                    <div>
                        <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
                            🖼️ {lang === 'ar' ? 'صورة الهدية (اختياري)' : 'Gift image (optional)'}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ fontSize: '11px', color: '#d1d5db', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px',
                                padding: '4px 6px', width: '100%', cursor: 'pointer' }}
                        />
                        {giftImage && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                <img src={giftImage} alt="preview"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.4)' }} />
                                <button onClick={() => setGiftImage('')}
                                    style={{ fontSize: '10px', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    ✕ {lang === 'ar' ? 'حذف' : 'Remove'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <input
                        className="input-dark"
                        type="email"
                        placeholder={lang === 'ar' ? 'بريدك الإلكتروني' : 'Your email'}
                        value={giftEmail} onChange={e => setGiftEmail(e.target.value)}
                        style={{ fontSize: '12px' }}
                    />

                    {/* Lucky Number */}
                    <input
                        className="input-dark"
                        type="number"
                        placeholder={lang === 'ar' ? 'رقمك المحظوظ 🍀' : 'Your lucky number 🍀'}
                        value={luckyNumber} onChange={e => setLuckyNumber(e.target.value)}
                        style={{ fontSize: '12px' }}
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={sending || !giftName.trim()}
                        className="btn-neon"
                        style={{ padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, opacity: sending || !giftName.trim() ? 0.5 : 1 }}
                    >
                        {sending ? '⏳' : (lang === 'ar' ? '📨 إرسال الطلب' : '📨 Send Request')}
                    </button>
                    <div style={{ fontSize: '9px', color: '#6b7280', textAlign: 'center' }}>
                        ⚡ {lang === 'ar' ? 'سيتم مراجعة طلبك وتطبيقه خلال 24 ساعة' : 'Request reviewed & applied within 24h'}
                    </div>
                </div>
            ) : (
                /* ── Status Box: pending / approved / rejected ── */
                <div style={{
                    borderRadius: '10px', padding: '12px',
                    background: pendingRequest.status === 1
                        ? 'rgba(74,222,128,0.08)'
                        : pendingRequest.status === 2
                        ? 'rgba(248,113,113,0.08)'
                        : 'rgba(251,191,36,0.07)',
                    border: `1px solid ${
                        pendingRequest.status === 1 ? 'rgba(74,222,128,0.35)'
                        : pendingRequest.status === 2 ? 'rgba(248,113,113,0.35)'
                        : 'rgba(251,191,36,0.3)'}`,
                    display: 'flex', flexDirection: 'column', gap: '6px'
                }}>
                    {/* Status Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>
                            {pendingRequest.status === 1 ? '✅' : pendingRequest.status === 2 ? '❌' : '⏳'}
                        </span>
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 800, color:
                                pendingRequest.status === 1 ? '#4ade80'
                                : pendingRequest.status === 2 ? '#f87171' : '#fbbf24' }}>
                                {pendingRequest.status === 1
                                    ? (lang === 'ar' ? '✅ تم قبول طلب الهدية!' : '✅ Gift Request Approved!')
                                    : pendingRequest.status === 2
                                    ? (lang === 'ar' ? '❌ تم رفض طلبك' : '❌ Request Rejected')
                                    : (lang === 'ar' ? '⏳ طلبك قيد المراجعة…' : '⏳ Request under review…')
                                }
                            </div>
                            {pendingRequest.giftName && (
                                <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
                                    {lang === 'ar' ? 'الهدية المطلوبة:' : 'Requested gift:'}{' '}
                                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>{pendingRequest.giftName}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Admin note */}
                    {pendingRequest.adminNote && (
                        <div style={{
                            background: 'rgba(255,255,255,0.04)', borderRadius: '7px',
                            padding: '8px 10px', borderLeft: '3px solid #ef4444',
                            fontSize: '11px', color: '#e2e8f0', lineHeight: 1.5
                        }}>
                            <span style={{ fontSize: '9px', color: '#ef4444', fontWeight: 800, display: 'block', marginBottom: '2px' }}>
                                {lang === 'ar' ? '📋 رسالة من الإدارة:' : '📋 Admin Note:'}
                            </span>
                            {pendingRequest.adminNote}
                        </div>
                    )}

                    {!pendingRequest.adminNote && pendingRequest.status === 0 && (
                        <div style={{ fontSize: '9px', color: '#6b7280', textAlign: 'center' }}>
                            {lang === 'ar' ? 'في انتظار رد من المسؤولين…' : 'Waiting for admin response…'}
                        </div>
                    )}

                    {/* If rejected + can request again this month → show new request button */}
                    {pendingRequest.status === 2 && canRequestThisMonth() && (
                        <button
                            onClick={() => { setPendingRequest(null); }}
                            style={{
                                padding: '6px', borderRadius: '7px', fontSize: '11px', fontWeight: 700,
                                background: 'rgba(239,68,68,0.15)', color: '#f87171',
                                border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer'
                            }}
                        >
                            {lang === 'ar' ? '🔄 طلب هدية جديدة' : '🔄 Request New Gift'}
                        </button>
                    )}

                    <div style={{ fontSize: '9px', color: '#6b7280', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '5px' }}>
                        {lang === 'ar' ? 'يمكنك الطلب مرة واحدة في الشهر' : 'You can request once per month'}
                    </div>
                </div>
            )}
        </div>
    );
};

// ════ VIP CENTER SECTION (for Settings) ════
const VIPCenterSection = ({ userData, user, lang, onNotification }) => {
    const [showInfoModal, setShowInfoModal]       = useState(false);
    const [showBadgePopup, setShowBadgePopup]     = useState(false);
    const [customIdEnabled, setCustomIdEnabled]   = useState(userData?.vip?.customIdEnabled || false);
    // VIP custom ID request states
    const [desiredId, setDesiredId]               = useState('');
    const [idCheckStatus, setIdCheckStatus]       = useState(null); // null | 'checking' | 'taken' | 'available'
    const [idRequestSending, setIdRequestSending] = useState(false);
    // ✅ Pending request listener — يتابع حالة الطلب في real-time
    const [pendingRequest, setPendingRequest]     = useState(null); // null | { status, adminNote, desiredId }
    const [seenRequestId, setSeenRequestId]       = useState(null); // last request we've shown result for

    const totalVIPXP  = userData?.vip?.xp || 0;
    const level       = getVIPLevel(userData);
    const cfg         = level ? VIP_CONFIG[level - 1] : null;
    const customIdLen = getVIPCustomIdLength(userData);
    const xpInfo      = getVIPXPProgress(totalVIPXP);

    // ✅ Real-time listener على آخر طلب ID للمستخدم (بدون orderBy لتجنب index)
    useEffect(() => {
        if (!user || !level || !customIdLen) return;
        const unsub = vip10IdRequestsCollection
            .where('uid', '==', user.uid)
            .limit(10)
            .onSnapshot(snap => {
                if (!snap.empty) {
                    // Sort on client by createdAt descending
                    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    docs.sort((a, b) => {
                        const aTime = a.createdAt?.toMillis?.() || a.createdAt || 0;
                        const bTime = b.createdAt?.toMillis?.() || b.createdAt || 0;
                        return bTime - aTime;
                    });
                    setPendingRequest(docs[0]);
                } else {
                    setPendingRequest(null);
                }
            }, (err) => { console.warn('ID request listener error:', err); });
        return unsub;
    }, [user?.uid, level]);

    // ✅ Auto-apply customId when admin approves request (status = 1)
    useEffect(() => {
        if (!pendingRequest || pendingRequest.status !== 1 || !user) return;
        // Only apply if the desired ID isn't already set
        const desiredIdToApply = pendingRequest.desiredId;
        if (!desiredIdToApply || userData?.customId === desiredIdToApply) return;
        // Apply the approved ID
        usersCollection.doc(user.uid).update({ customId: desiredIdToApply, 'vip.customIdEnabled': true })
            .catch(e => console.warn('Auto-apply ID failed:', e));
    }, [pendingRequest?.status, pendingRequest?.desiredId, user?.uid]);

    // For VIP 6-9: random toggle (keep as before)
    const toggleCustomId = async () => {
        if (!user || !customIdLen || level === 10) return;
        const newVal = !customIdEnabled;
        setCustomIdEnabled(newVal);
        if (newVal) {
            const max = Math.pow(10, customIdLen) - 1;
            const min = Math.pow(10, customIdLen - 1);
            const newId = Math.floor(min + Math.random() * (max - min + 1)).toString();
            await usersCollection.doc(user.uid).update({ 'vip.customIdEnabled': true, customId: newId });
        } else {
            const normalId = Math.floor(100000 + Math.random() * 900000).toString();
            await usersCollection.doc(user.uid).update({ 'vip.customIdEnabled': false, customId: normalId });
        }
        onNotification(lang === 'ar' ? 'تم الحفظ ✓' : 'Saved ✓');
    };

    // Check if user already made a request this month
    const canRequestIdThisMonth = () => {
        const lastReq = userData?.vip?.lastIdRequest;
        if (!lastReq) return true;
        const lastDate = lastReq?.toDate ? lastReq.toDate() : new Date(lastReq);
        const now = new Date();
        return !(lastDate.getMonth() === now.getMonth() && lastDate.getFullYear() === now.getFullYear());
    };

    // Validate exact digit count based on VIP level
    // VIP6=6, VIP7=5, VIP8=4, VIP9=3, VIP10=2
    const validateIdInput = (id) => {
        if (!customIdLen || !id) return null;
        const onlyDigits = /^\d+$/.test(id);
        if (!onlyDigits) return lang === 'ar' ? `❌ أرقام فقط` : `❌ Digits only`;
        if (id.length !== customIdLen) return lang === 'ar'
            ? `❌ يجب أن يكون ${customIdLen} أرقام بالضبط (VIP ${level})`
            : `❌ Must be exactly ${customIdLen} digits (VIP ${level})`;
        return null; // valid
    };

    const idValidationError = validateIdInput(desiredId);

    // Check uniqueness in Firestore
    const checkIdAvailability = async (id) => {
        const err = validateIdInput(id);
        if (err) { setIdCheckStatus('invalid'); return; }
        setIdCheckStatus('checking');
        try {
            const snap = await usersCollection.where('customId', '==', id).limit(1).get();
            setIdCheckStatus(snap.empty ? 'available' : 'taken');
        } catch { setIdCheckStatus(null); }
    };

    // Submit custom ID request — ALL VIP 6-10 go through request system
    const handleIdRequest = async () => {
        const err = validateIdInput(desiredId.trim());
        if (err || idCheckStatus !== 'available' || idRequestSending || !user) return;
        setIdRequestSending(true);
        try {
            // ✅ Check for existing PENDING requests with same desiredId
            const pendingSnap = await vip10IdRequestsCollection
                .where('desiredId', '==', desiredId.trim())
                .where('status', '==', 0)
                .limit(1)
                .get();
            if (!pendingSnap.empty) {
                onNotification(lang === 'ar'
                    ? '❌ هذا الـ ID محجوز حالياً من مستخدم آخر'
                    : '❌ This ID is already reserved by another user');
                setIdRequestSending(false);
                return;
            }

            await vip10IdRequestsCollection.add({
                uid:         user.uid,
                displayName: userData?.displayName || '',
                desiredId:   desiredId.trim(),
                currentId:   userData?.customId || '',
                vipLevel:    level,
                // 🔧 STATUS FIELD:
                // 0 = pending (default, طلب قيد المراجعة)
                // 1 = approved (اتقبل — غيّر القيمة للـ 1 في Firestore لقبول الطلب)
                // 2 = rejected (اترفض — غيّر القيمة للـ 2 في Firestore لرفض الطلب)
                status:      0,
                createdAt:   firebase.firestore.FieldValue.serverTimestamp(),
            });
            await usersCollection.doc(user.uid).update({ 'vip.lastIdRequest': firebase.firestore.FieldValue.serverTimestamp() });
            onNotification(lang === 'ar' ? '✅ تم إرسال طلب الـ ID!' : '✅ ID request sent!');
            setDesiredId('');
            setIdCheckStatus(null);
        } catch (e) {
            onNotification(lang === 'ar' ? '❌ خطأ، حاول مرة أخرى' : '❌ Error, try again');
        }
        setIdRequestSending(false);
    };

    // ─── الألوان بناءً على الليفل ───
    const barColor  = cfg ? cfg.nameColor : '#7c3aed';
    const nextLevel = level < 10 ? level + 1 : 10;
    const nextCfg   = VIP_CONFIG.find(v => v.level === nextLevel);

    return (
        <div className="settings-section">
            {/* ── Header ── */}
            <div className="settings-section-title">
                <span>👑</span>
                <span>VIP Center</span>
                <button
                    onClick={() => setShowInfoModal(true)}
                    style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'#60a5fa', fontSize:'16px', padding:'0 2px' }}
                    title={lang === 'ar' ? 'معلومات VIP' : 'VIP Info'}
                >ℹ️</button>
            </div>

            {/* ── VIP XP Card ── (تظهر دايمًا) */}
            <div style={{
                background: level
                    ? `linear-gradient(135deg, ${barColor}14, rgba(15,15,26,0.97))`
                    : 'linear-gradient(135deg,rgba(112,0,255,0.08),rgba(15,15,26,0.97))',
                border: `1px solid ${level ? barColor + '44' : 'rgba(112,0,255,0.25)'}`,
                borderRadius: '14px', padding: '14px 16px',
                display: 'flex', flexDirection: 'column', gap: '10px'
            }}>

                {/* Level badge + name row */}
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    {level ? (
                        <>
                            <div style={{
                                background: barColor, color:'#000', fontWeight:900,
                                padding:'4px 12px', borderRadius:'8px', fontSize:'14px',
                                boxShadow: `0 0 10px ${barColor}66`
                            }}>VIP {level}</div>
                            <span style={{ color: barColor, fontWeight:700, fontSize:'14px' }}>
                                {lang === 'ar' ? cfg.name_ar : cfg.name_en}
                            </span>
                            <button onClick={() => setShowBadgePopup(true)}
                                style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer' }}>
                                <VIPBadge userData={userData} size="md" />
                            </button>
                        </>
                    ) : (
                        <>
                            <div style={{
                                background:'rgba(112,0,255,0.25)', color:'#c4b5fd', fontWeight:900,
                                padding:'4px 12px', borderRadius:'8px', fontSize:'13px',
                                border:'1px solid rgba(112,0,255,0.4)'
                            }}>VIP 0</div>
                            <span style={{ color:'#9ca3af', fontSize:'13px' }}>
                                {lang === 'ar' ? 'غير مُفعَّل' : 'Not Active'}
                            </span>
                        </>
                    )}
                </div>

                {/* ── XP Progress Bar or CTA ── */}
                {level > 0 ? (
                <div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px' }}>
                        <span style={{ fontSize:'11px', color:'#9ca3af' }}>
                            🔥 VIP XP
                        </span>
                        <span style={{ fontSize:'11px', fontWeight:700, color: barColor }}>
                            {totalVIPXP.toLocaleString()}
                            {level < 10 && (
                                <span style={{ color:'#6b7280', fontWeight:400 }}>
                                    {' '}/ {VIP_XP_THRESHOLDS[level + 1]?.toLocaleString()}
                                </span>
                            )}
                        </span>
                    </div>
                    {/* Bar */}
                    <div style={{
                        width:'100%', height:'10px', borderRadius:'6px',
                        background:'rgba(255,255,255,0.07)',
                        border:'1px solid rgba(255,255,255,0.06)',
                        overflow:'hidden', position:'relative'
                    }}>
                        <div style={{
                            width: `${xpInfo.progress}%`,
                            height:'100%', borderRadius:'6px',
                            background: level >= 9
                                ? `linear-gradient(90deg, #ef4444, #fbbf24, #ef4444)`
                                : level >= 6
                                    ? `linear-gradient(90deg, #eab308, #fbbf24)`
                                    : `linear-gradient(90deg, #7c3aed, ${barColor})`,
                            transition:'width 0.6s ease',
                            boxShadow: `0 0 8px ${barColor}88`,
                            animation: level >= 9 ? 'vip-shimmer 2s linear infinite' : 'none',
                            backgroundSize: level >= 9 ? '200% 100%' : 'auto'
                        }} />
                    </div>
                    {/* Level labels */}
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:'4px' }}>
                        <span style={{ fontSize:'9px', color:'#6b7280' }}>
                            {lang === 'ar' ? `المستوى ${level}` : `Level ${level}`}
                        </span>
                        {level < 10 ? (
                            <span style={{ fontSize:'9px', color: barColor }}>
                                {lang === 'ar'
                                    ? `${(xpInfo.xpNeeded - xpInfo.xpInLevel).toLocaleString()} XP للمستوى ${nextLevel} 👑`
                                    : `${(xpInfo.xpNeeded - xpInfo.xpInLevel).toLocaleString()} XP to Level ${nextLevel} 👑`
                                }
                            </span>
                        ) : (
                            <span style={{ fontSize:'9px', color:'#fbbf24', fontWeight:700 }}>
                                ✨ MAX LEVEL
                            </span>
                        )}
                    </div>
                </div>
                ) : (
                /* No VIP — CTA to shop */
                <div style={{
                    textAlign:'center', padding:'12px 10px',
                    background:'rgba(112,0,255,0.08)',
                    border:'1px solid rgba(112,0,255,0.25)',
                    borderRadius:'10px'
                }}>
                    <div style={{ fontSize:'22px', marginBottom:'6px' }}>🛒</div>
                    <div style={{ fontSize:'12px', color:'#c4b5fd', fontWeight:700, marginBottom:'4px' }}>
                        {lang === 'ar' ? 'اذهب للشوب لشراء VIP' : 'Go to Shop to buy VIP'}
                    </div>
                    <div style={{ fontSize:'10px', color:'#6b7280' }}>
                        {lang === 'ar'
                            ? 'احصل على اسم ملون، بادج حصري، ومميزات أكثر!'
                            : 'Get a colored name, exclusive badge, and more!'}
                    </div>
                </div>
                )}

                {/* ── Tip: كل هدية تزيد XP ── (تظهر فقط لو عنده VIP) */}
                {level > 0 && (
                <div style={{
                    fontSize:'10px', color:'#6b7280', textAlign:'center',
                    padding:'6px 10px', background:'rgba(255,255,255,0.03)',
                    borderRadius:'8px', border:'1px solid rgba(255,255,255,0.05)'
                }}>
                    🎁 {lang === 'ar'
                        ? 'أرسل هدايا لتحصل على VIP XP وترتفع لمستوى أعلى!'
                        : 'Send gifts to earn VIP XP and level up!'}
                </div>
                )}

                {/* ── Level perks if active ── */}
                {level > 0 && (
                    <>
                        {/* XP Multiplier */}
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:'12px' }}>
                            <span style={{ color:'#9ca3af' }}>⚡ {lang === 'ar' ? 'مضاعف XP الألعاب' : 'Game XP Multiplier'}</span>
                            <span style={{ color:'#fbbf24', fontWeight:700 }}>×{cfg.xpMultiplier}</span>
                        </div>

                        {/* Custom ID Request — VIP 6+ (all levels go through request system) */}
                        {customIdLen && (
                            <div style={{
                                background: level === 10
                                    ? 'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(15,15,26,0.95))'
                                    : 'linear-gradient(135deg,rgba(96,165,250,0.08),rgba(15,15,26,0.95))',
                                border: `1px solid ${level === 10 ? 'rgba(239,68,68,0.3)' : 'rgba(96,165,250,0.3)'}`,
                                borderRadius: '10px', padding: '12px', marginTop: '4px'
                            }}>
                                <div style={{ fontSize:'11px', fontWeight:800, color: level === 10 ? '#ef4444' : '#60a5fa', marginBottom:'8px' }}>
                                    🪪 {lang === 'ar'
                                        ? `طلب ID مخصص (${customIdLen} أرقام بالضبط) — مرة كل شهر`
                                        : `Custom ID Request (exactly ${customIdLen} digits) — once/month`}
                                </div>
                                {userData?.customId && (
                                    <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'6px' }}>
                                        {lang === 'ar' ? 'الـ ID الحالي:' : 'Current ID:'} <span style={{color:'#fbbf24', fontWeight:700}}>{userData.customId}</span>
                                    </div>
                                )}
                                {/* ✅ Show form when no pending request (or after approved/rejected + new month)
                                    Show status box when request is pending/active */}
                                {!pendingRequest ? (
                                    <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                                        <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                                            <input
                                                className="input-dark"
                                                placeholder={lang === 'ar' ? `${customIdLen} أرقام` : `${customIdLen} digits`}
                                                value={desiredId}
                                                maxLength={customIdLen}
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                onChange={e => {
                                                    const v = e.target.value.replace(/\D/g,'');
                                                    setDesiredId(v);
                                                    setIdCheckStatus(null);
                                                }}
                                                style={{ flex:1, fontSize:'16px', fontWeight:800, letterSpacing:'4px', textAlign:'center', padding:'8px' }}
                                            />
                                            <button
                                                onClick={() => checkIdAvailability(desiredId.trim())}
                                                disabled={desiredId.length !== customIdLen || idCheckStatus === 'checking'}
                                                style={{
                                                    padding:'6px 10px', borderRadius:'7px', fontSize:'11px',
                                                    fontWeight:700, cursor:'pointer', border:'none', whiteSpace:'nowrap',
                                                    background: desiredId.length === customIdLen ? 'rgba(96,165,250,0.2)' : 'rgba(100,100,100,0.15)',
                                                    color: desiredId.length === customIdLen ? '#60a5fa' : '#6b7280'
                                                }}
                                            >
                                                {idCheckStatus === 'checking' ? '⏳' : (lang === 'ar' ? 'تحقق' : 'Check')}
                                            </button>
                                        </div>
                                        {/* Digit progress dots */}
                                        <div style={{ display:'flex', gap:'3px', justifyContent:'center' }}>
                                            {Array.from({length: customIdLen}).map((_,i) => (
                                                <div key={i} style={{
                                                    width:'18px', height:'4px', borderRadius:'2px',
                                                    background: i < desiredId.length ? '#60a5fa' : 'rgba(255,255,255,0.1)',
                                                    transition:'background 0.2s'
                                                }} />
                                            ))}
                                        </div>
                                        {/* Validation */}
                                        {desiredId.length > 0 && desiredId.length !== customIdLen && (
                                            <div style={{ fontSize:'10px', color:'#fbbf24', fontWeight:700 }}>
                                                ⚠️ {lang === 'ar'
                                                    ? `يجب أن يكون ${customIdLen} أرقام بالضبط (أدخلت ${desiredId.length})`
                                                    : `Must be exactly ${customIdLen} digits (you entered ${desiredId.length})`}
                                            </div>
                                        )}
                                        {idCheckStatus === 'taken' && (
                                            <div style={{ fontSize:'10px', color:'#f87171', fontWeight:700 }}>❌ {lang === 'ar' ? 'هذا الـ ID مأخوذ بالفعل' : 'This ID is already taken'}</div>
                                        )}
                                        {idCheckStatus === 'available' && (
                                            <div style={{ fontSize:'10px', color:'#4ade80', fontWeight:700 }}>✅ {lang === 'ar' ? 'الـ ID متاح!' : 'ID is available!'}</div>
                                        )}
                                        <button
                                            onClick={handleIdRequest}
                                            disabled={idCheckStatus !== 'available' || idRequestSending || desiredId.length !== customIdLen}
                                            style={{
                                                padding:'8px', borderRadius:'8px', fontSize:'12px', fontWeight:700,
                                                cursor: idCheckStatus === 'available' && desiredId.length === customIdLen ? 'pointer' : 'not-allowed',
                                                background: idCheckStatus === 'available' && desiredId.length === customIdLen
                                                    ? (level === 10 ? 'linear-gradient(135deg,#ef4444,#b91c1c)' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)')
                                                    : 'rgba(100,100,100,0.2)',
                                                color: idCheckStatus === 'available' && desiredId.length === customIdLen ? '#fff' : '#6b7280',
                                                border: 'none', opacity: idRequestSending ? 0.6 : 1
                                            }}
                                        >
                                            {idRequestSending ? '⏳' : (lang === 'ar' ? '📨 إرسال الطلب' : '📨 Send Request')}
                                        </button>
                                        <div style={{ fontSize:'9px', color:'#6b7280', textAlign:'center' }}>
                                            {lang === 'ar' ? '⚡ سيتم مراجعة طلبك وتطبيقه خلال 24 ساعة' : '⚡ Request reviewed & applied within 24h'}
                                        </div>
                                    </div>
                                ) : (
                                    /* ✅ Real-time Request Status Box */
                                    <div style={{
                                        borderRadius:'10px', padding:'12px',
                                        background: pendingRequest?.status === 1
                                            ? 'rgba(74,222,128,0.08)'
                                            : pendingRequest?.status === 2
                                            ? 'rgba(248,113,113,0.08)'
                                            : 'rgba(251,191,36,0.07)',
                                        border: `1px solid ${
                                            pendingRequest?.status === 1 ? 'rgba(74,222,128,0.35)'
                                            : pendingRequest?.status === 2 ? 'rgba(248,113,113,0.35)'
                                            : 'rgba(251,191,36,0.3)'
                                        }`,
                                        display:'flex', flexDirection:'column', gap:'6px'
                                    }}>
                                        {/* Status row */}
                                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                            <span style={{ fontSize:'18px' }}>
                                                {pendingRequest?.status === 1 ? '✅' : pendingRequest?.status === 2 ? '❌' : '⏳'}
                                            </span>
                                            <div>
                                                <div style={{ fontSize:'11px', fontWeight:800, color:
                                                    pendingRequest?.status === 1 ? '#4ade80'
                                                    : pendingRequest?.status === 2 ? '#f87171' : '#fbbf24'
                                                }}>
                                                    {pendingRequest?.status === 1
                                                        ? (lang === 'ar' ? '✅ تم قبول طلبك وتطبيق الـ ID!' : '✅ Request Approved & Applied!')
                                                        : pendingRequest?.status === 2
                                                        ? (lang === 'ar' ? '❌ تم رفض طلبك' : '❌ Request Rejected')
                                                        : (lang === 'ar' ? '⏳ طلبك قيد المراجعة…' : '⏳ Request under review…')
                                                    }
                                                </div>
                                                {pendingRequest?.desiredId && (
                                                    <div style={{ fontSize:'10px', color:'#9ca3af', marginTop:'2px' }}>
                                                        {lang === 'ar' ? 'الـ ID المطلوب:' : 'Requested ID:'}{' '}
                                                        <span style={{ color:'#fbbf24', fontWeight:700, letterSpacing:'2px' }}>
                                                            {pendingRequest.desiredId}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Admin note */}
                                        {pendingRequest?.adminNote && (
                                            <div style={{
                                                background:'rgba(255,255,255,0.04)', borderRadius:'7px',
                                                padding:'8px 10px', borderLeft:'3px solid #60a5fa',
                                                fontSize:'11px', color:'#e2e8f0', lineHeight:1.5
                                            }}>
                                                <span style={{ fontSize:'9px', color:'#60a5fa', fontWeight:800, display:'block', marginBottom:'2px' }}>
                                                    {lang === 'ar' ? '📋 رسالة من الإدارة:' : '📋 Admin Note:'}
                                                </span>
                                                {pendingRequest.adminNote}
                                            </div>
                                        )}
                                        {!pendingRequest?.adminNote && pendingRequest?.status === 0 && (
                                            <div style={{ fontSize:'9px', color:'#6b7280', textAlign:'center' }}>
                                                {lang === 'ar' ? 'في انتظار رد من المسؤولين…' : 'Waiting for admin response…'}
                                            </div>
                                        )}
                                        {/* If rejected: allow new request */}
                                        {(pendingRequest?.status === 2) && canRequestIdThisMonth() && (
                                            <button
                                                onClick={() => { setDesiredId(''); setIdCheckStatus(null); }}
                                                style={{
                                                    padding:'6px', borderRadius:'7px', fontSize:'11px', fontWeight:700,
                                                    background:'rgba(96,165,250,0.15)', color:'#60a5fa',
                                                    border:'1px solid rgba(96,165,250,0.3)', cursor:'pointer'
                                                }}
                                            >
                                                {lang === 'ar' ? '🔄 طلب ID جديد' : '🔄 Request New ID'}
                                            </button>
                                        )}
                                        <div style={{ fontSize:'9px', color:'#6b7280', textAlign:'center', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'5px' }}>
                                            {lang === 'ar' ? 'يمكنك الطلب مرة واحدة في الشهر' : 'You can request once per month'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* VIP 10 form */}
                        {cfg.exclusiveForm && (
                            <VIP10RequestForm user={user} lang={lang} onNotification={onNotification} userData={userData} />
                        )}
                    </>
                )}
            </div>

            {showInfoModal  && <VIPInfoModal onClose={() => setShowInfoModal(false)} lang={lang} />}
            {showBadgePopup && <VIPBadgePopup level={level} onClose={() => setShowBadgePopup(false)} />}
        </div>
    );
};
