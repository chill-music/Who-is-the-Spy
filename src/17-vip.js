// ��������������������������������������������������������
// � VIP SYSTEM � 10 Levels
//    �� بادجات VIP �اب�ة ��تخص�ص �� ��ا
// ��������������������������������������������������������

// � VIP BADGE IMAGES � ضع ر�ابط ص�ر ا�بادجات ��ا
var IP_BADGE_URLS = {
    1:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/vip%20icos/vip1.png',   // رابط بادج VIP 1
    2:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/vip%20icos/vip2.png',   // رابط بادج VIP 2
    3:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/vip%20icos/vip3.png',   // رابط بادج VIP 3
    4:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/vip%20icos/vip4.png',   // رابط بادج VIP 4
    5:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/vip%20icos/vip5.png',   // رابط بادج VIP 5
    6:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/vip%20icos/vip6.png',   // رابط بادج VIP 6
    7:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/vip%20icos/vip7.png',   // رابط بادج VIP 7
    8:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/vip%20icos/vip8.png',   // رابط بادج VIP 8
    9:  'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/vip%20icos/vip9.png',   // رابط بادج VIP 9
    10: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/vip%20icos/vip10.png',   // رابط بادج VIP 10
};

// � VIP CHAT TITLE IMAGES � ص�ر Title ف� ا�شات خ�ف اس� ا��ستخد�
var IP_CHAT_TITLE_URLS = {
    1:  '',
    2:  '',
    3:  '',
    4:  '',
    5:  '',
    6:  '',
    7:  '',
    8:  '',
    9:  '',
    10: 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/vip%20icos/vip10.png',
};

// � VIP MOMENT BACKGROUNDS � خ�ف�ة ا�� Moments �� ��ف� 2 �� 10
var IP_MOMENT_BG_URLS = {
    2:  '',   // رابط خ�ف�ة Moments �� VIP 2
    3:  '',
    4:  '',
    5:  '',
    6:  '',
    7:  '',
    8:  '',
    9:  '',
    10: '',
};

// ���� VIP XP SYSTEM ����
// XP �ط��ب ���ص�� ��� �ست�� (�حسب ترا��� � �ج��ع ا�� XP ا����)
var IP_XP_THRESHOLDS = {
    0: 0,        // عاد�
    1: 5000,     // VIP 1 � 5,000 XP
    2: 15000,    // VIP 2 � 15,000 XP
    3: 35000,    // VIP 3 � 35,000 XP
    4: 70000,    // VIP 4 � 70,000 XP
    5: 120000,   // VIP 5 � 120,000 XP
    6: 200000,   // VIP 6 � 200,000 XP
    7: 320000,   // VIP 7 � 320,000 XP
    8: 480000,   // VIP 8 � 480,000 XP
    9: 700000,   // VIP 9 � 700,000 XP
    10: 1000000, // VIP 10 � 1,000,000 XP
};

// XP ا��� ��سب� ا��اعب �� �� �د�ة �بعت�ا = �سبة �� ا�� charisma بتاع ا��د�ة
var IP_XP_PER_CHARISMA_RATE = 0.05; // 5% �� ا�� charisma � VIP XP

// حساب VIP XP �� �د�ة �ع��ة
// � �� ا��د�ة ع�د�ا vipXP �حدد �د��ا� �ُستخد�� غ�ر �د� �ُحسب 5% �� ا��ار�ز�ا
var etGiftVIPXP = (gift) => {
    if (gift.vipXP !== undefined && gift.vipXP !== null) return Math.max(1, gift.vipXP);
    const xp = Math.round((gift.charisma || 0) * VIP_XP_PER_CHARISMA_RATE);
    return Math.max(1, xp); // minimum 1 XP per gift
};

// حساب �ست�� VIP �� ا�� XP ا����
var etVIPLevelFromXP = (totalXP) => {
    let level = 0;
    for (let lvl = 10; lvl >= 1; lvl--) {
        if (totalXP >= VIP_XP_THRESHOLDS[lvl]) {
            level = lvl;
            break;
        }
    }
    return level;
};

// Progress ���ست�� ا��اد�
var etVIPXPProgress = (totalXP) => {
    const currentLevel = getVIPLevelFromXP(totalXP);
    if (currentLevel >= 10) return { currentLevel: 10, progress: 100, xpInLevel: 0, xpNeeded: 0, totalXP };
    const currentThreshold = VIP_XP_THRESHOLDS[currentLevel];
    const nextThreshold    = VIP_XP_THRESHOLDS[currentLevel + 1];
    const xpInLevel = totalXP - currentThreshold;
    const xpNeeded  = nextThreshold - currentThreshold;
    const progress  = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
    return { currentLevel, progress, xpInLevel, xpNeeded, totalXP };
};

// ���� VIP CONFIG � ا�إعدادات ا��ا��ة ��� �ست�� ����
var IP_CONFIG = [
    {
        level: 1,
        name_en: 'VIP I',       name_ar: 'ف� آ� ب� 1',
        // ا����: أح�ر �� 1-5
        nameColor: '#ef4444',
        glowColor: null,
        gradientAnim: false,
        xpMultiplier: 1.2,           // x1.2 XP
        idLength: 6,                  // ط�� ID عاد�
        customIdLength: null,         // �ا custom ID
        exclusiveGifts: false,
        vipDailyTasks: false,
        exclusiveForm: false,
        // �� VIP Items � ع�اصر تُضاف ��إ�ف�تر� ع�د ا�شراء �تختف� ��ا VIP ��ت��
        // �ثا�: [{ id: 'frame_vip1_gold', type: 'frames' }, { id: 'badge_vip1_star', type: 'badges' }]
        vipItems: [],  // � VIP 1 أضف ��ا ع�اصر ا��ست�� ا�أ��
        // �️ ص�رة �ب� ا�� ID ف� ا�بر�فا�� � ضع رابط ص�رة/GIF ��ا أ� null
        idBeforeImageUrl: null, // � VIP 1: ضع رابط ا�ص�رة ��ا
        benefits_en: ['1.2� XP Multiplier', 'VIP Badge'],
        benefits_ar: ['�ضاعف XP � 1.2', 'بادج VIP'],
    },
    {
        level: 2,
        name_en: 'VIP II',      name_ar: 'ف� آ� ب� 2',
        nameColor: '#ef4444',
        glowColor: null,
        gradientAnim: false,
        xpMultiplier: 1.3,
        idLength: 6,
        customIdLength: null,
        exclusiveGifts: true,         // �� �دا�ا حصر�ة �� ��ا
        vipDailyTasks: true,          // � تفع�� Daily Tasks VIP
        exclusiveForm: false,
        // �� VIP Items Level 2 � أضف ع�اصر ��ا (تُ��ح ع�د ا�شراء� تُسحب ع�د ا�ت�اء VIP)
        vipItems: [],  // � �ثا�: [{ id: 'frame_vip2', type: 'frames' }]
        // �️ ص�رة �ب� ا�� ID ف� ا�بر�فا��
        idBeforeImageUrl: null, // � VIP 2: ضع رابط ا�ص�رة ��ا
        benefits_en: ['1.3� XP', 'VIP Badge', 'Exclusive Gifts', 'VIP Daily Tasks'],
        benefits_ar: ['�ضاعف XP � 1.3', 'بادج VIP', '�دا�ا حصر�ة', '��ا� ����ة VIP'],
    },
    {
        level: 3,
        name_en: 'VIP III',     name_ar: 'ف� آ� ب� 3',
        nameColor: '#ef4444',
        glowColor: null,
        gradientAnim: false,
        xpMultiplier: 1.4,
        idLength: 6,
        customIdLength: null,
        exclusiveGifts: true,
        vipDailyTasks: true,
        exclusiveForm: false,
        // �� VIP Items Level 3 � أضف ع�اصر ��ا (تُ��ح ع�د ا�شراء� تُسحب ع�د ا�ت�اء VIP)
        vipItems: [],  // � �ثا�: [{ id: 'frame_vip3', type: 'frames' }]
        idBeforeImageUrl: null, // � VIP 3: ضع رابط ا�ص�رة ��ا
        benefits_en: ['1.4� XP', 'VIP Badge', 'Exclusive Gifts', 'VIP Daily Tasks'],
        benefits_ar: ['�ضاعف XP � 1.4', 'بادج VIP', '�دا�ا حصر�ة', '��ا� ����ة VIP'],
    },
    {
        level: 4,
        name_en: 'VIP IV',      name_ar: 'ف� آ� ب� 4',
        nameColor: '#ef4444',
        glowColor: null,
        gradientAnim: false,
        xpMultiplier: 1.5,
        idLength: 6,
        customIdLength: null,
        exclusiveGifts: true,
        vipDailyTasks: true,
        exclusiveForm: false,
        // �� VIP Items Level 4 � أضف ع�اصر ��ا (تُ��ح ع�د ا�شراء� تُسحب ع�د ا�ت�اء VIP)
        vipItems: [],  // � �ثا�: [{ id: 'frame_vip4', type: 'frames' }]
        idBeforeImageUrl: null, // � VIP 4: ضع رابط ا�ص�رة ��ا
        benefits_en: ['1.5� XP', 'VIP Badge', 'Exclusive Gifts', 'VIP Daily Tasks'],
        benefits_ar: ['�ضاعف XP � 1.5', 'بادج VIP', '�دا�ا حصر�ة', '��ا� ����ة VIP'],
    },
    {
        level: 5,
        name_en: 'VIP V',       name_ar: 'ف� آ� ب� 5',
        nameColor: '#ef4444',
        glowColor: null,
        gradientAnim: false,
        xpMultiplier: 1.6,
        idLength: 6,
        customIdLength: null,
        exclusiveGifts: true,
        vipDailyTasks: true,
        exclusiveForm: false,
        // �� VIP Items Level 5 � أضف ع�اصر ��ا (تُ��ح ع�د ا�شراء� تُسحب ع�د ا�ت�اء VIP)
        vipItems: [],  // � �ثا�: [{ id: 'frame_vip5', type: 'frames' }]
        idBeforeImageUrl: null, // � VIP 5: ضع رابط ا�ص�رة ��ا
        benefits_en: ['1.6� XP', 'VIP Badge', 'Exclusive Gifts', 'VIP Daily Tasks'],
        benefits_ar: ['�ضاعف XP � 1.6', 'بادج VIP', '�دا�ا حصر�ة', '��ا� ����ة VIP'],
    },
    {
        level: 6,
        name_en: 'VIP VI',      name_ar: 'ف� آ� ب� 6',
        // Yellow + Glow �� 6-8
        nameColor: '#eab308',
        glowColor: 'rgba(234,179,8,0.8)',
        gradientAnim: false,
        xpMultiplier: 1.7,
        idLength: 6,
        customIdLength: 6,            // Custom 6-digit ID
        exclusiveGifts: true,
        vipDailyTasks: true,
        exclusiveForm: false,
        // �� VIP Items Level 6 � أضف ع�اصر ��ا (تُ��ح ع�د ا�شراء� تُسحب ع�د ا�ت�اء VIP)
        vipItems: [],  // � �ثا�: [{ id: 'frame_vip6', type: 'frames' }]
        idBeforeImageUrl: null, // � VIP 6: ضع رابط ا�ص�رة ��ا
        idIconImageUrl: null,   // � VIP 6: أ����ة ���زة أ�ا� ا�� ID (ذ�ب�ة �ث�ا�)
        benefits_en: ['1.7� XP', 'Gold Name Glow', 'Custom 6-Digit ID', 'Exclusive Gifts', 'VIP Daily Tasks'],
        benefits_ar: ['�ضاعف XP � 1.7', 'ت��ج اس� ذ�ب�', 'ID �خصص 6 أر�ا�', '�دا�ا حصر�ة', '��ا� ����ة VIP'],
    },
    {
        level: 7,
        name_en: 'VIP VII',     name_ar: 'ف� آ� ب� 7',
        nameColor: '#eab308',
        glowColor: 'rgba(234,179,8,0.9)',
        gradientAnim: false,
        xpMultiplier: 1.8,
        idLength: 6,
        customIdLength: 5,            // Custom 5-digit ID
        exclusiveGifts: true,
        vipDailyTasks: true,
        exclusiveForm: false,
        // �� VIP Items Level 7 � أضف ع�اصر ��ا (تُ��ح ع�د ا�شراء� تُسحب ع�د ا�ت�اء VIP)
        vipItems: [],  // � �ثا�: [{ id: 'frame_vip7', type: 'frames' }]
        idBeforeImageUrl: null, // � VIP 7: ضع رابط ا�ص�رة ��ا
        idIconImageUrl: null,   // � VIP 7: أ����ة ���زة أ�ا� ا�� ID
        benefits_en: ['1.8� XP', 'Gold Name Glow', 'Custom 5-Digit ID', 'Exclusive Gifts'],
        benefits_ar: ['�ضاعف XP � 1.8', 'ت��ج اس� ذ�ب�', 'ID �خصص 5 أر�ا�', '�دا�ا حصر�ة'],
    },
    {
        level: 8,
        name_en: 'VIP VIII',    name_ar: 'ف� آ� ب� 8',
        nameColor: '#eab308',
        glowColor: 'rgba(234,179,8,1)',
        gradientAnim: false,
        xpMultiplier: 1.9,
        idLength: 6,
        customIdLength: 4,            // Custom 4-digit ID
        exclusiveGifts: true,
        vipDailyTasks: true,
        exclusiveForm: false,
        // �� VIP Items Level 8 � أضف ع�اصر ��ا (تُ��ح ع�د ا�شراء� تُسحب ع�د ا�ت�اء VIP)
        vipItems: [],  // � �ثا�: [{ id: 'frame_vip8', type: 'frames' }]
        idBeforeImageUrl: null, // � VIP 8: ضع رابط ا�ص�رة ��ا
        idIconImageUrl: null,   // � VIP 8: أ����ة ���زة أ�ا� ا�� ID
        benefits_en: ['1.9� XP', 'Gold Name Glow', 'Custom 4-Digit ID', 'Exclusive Gifts'],
        benefits_ar: ['�ضاعف XP � 1.9', 'ت��ج اس� ذ�ب�', 'ID �خصص 4 أر�ا�', '�دا�ا حصر�ة'],
    },
    {
        level: 9,
        name_en: 'VIP IX',      name_ar: 'ف� آ� ب� 9',
        // Red + Gradient Animation �� 9-10
        nameColor: '#ef4444',
        glowColor: 'rgba(239,68,68,0.9)',
        gradientAnim: true,
        xpMultiplier: 2.0,
        idLength: 6,
        customIdLength: 3,            // Custom 3-digit ID
        exclusiveGifts: true,
        vipDailyTasks: true,
        exclusiveForm: false,
        // �� VIP Items Level 9 � أضف ع�اصر ��ا (تُ��ح ع�د ا�شراء� تُسحب ع�د ا�ت�اء VIP)
        vipItems: [],  // � �ثا�: [{ id: 'frame_vip9', type: 'frames' }]
        idBeforeImageUrl: null, // � VIP 9: ضع رابط ا�ص�رة ��ا
        idIconImageUrl: null,   // � VIP 9: أ����ة أ���ش� أ�ا� ا�� ID
        benefits_en: ['2� XP', 'Animated Name Glow', 'Custom 3-Digit ID', 'Exclusive Gifts'],
        benefits_ar: ['�ضاعف XP � 2', 'ت��ج اس� �تحر�', 'ID �خصص 3 أر�ا�', '�دا�ا حصر�ة'],
    },
    {
        level: 10,
        name_en: 'VIP X',       name_ar: 'ف� آ� ب� 10',
        nameColor: '#ef4444',
        glowColor: 'rgba(239,68,68,1)',
        gradientAnim: true,
        xpMultiplier: 2.0,
        idLength: 6,
        customIdLength: 2,            // Custom 2-digit ID
        exclusiveGifts: true,
        vipDailyTasks: true,
        exclusiveForm: true,          // � ف�ر� �دا�ا �خصصة
        // �� VIP Items Level 10 � أضف ع�اصر ��ا (تُ��ح ع�د ا�شراء� تُسحب ع�د ا�ت�اء VIP)
        vipItems: [],  // � �ثا�: [{ id: 'frame_vip10', type: 'frames' }]
        idBeforeImageUrl: null, // � VIP 10: ضع رابط ا�ص�رة ��ا
        idIconImageUrl: null,   // � VIP 10: أ����ة أسط�ر�ة أ�ا� ا�� ID
        benefits_en: ['2� XP', 'Animated Name Glow', 'Custom 2-Digit ID', 'Exclusive Gifts', 'Custom Gift Request'],
        benefits_ar: ['�ضاعف XP � 2', 'ت��ج اس� �تحر�', 'ID �خصص ر����', '�دا�ا حصر�ة', 'ط�ب �د�ة �خصصة'],
    },
];

// ���� HELPER FUNCTIONS ����

// getVIPData � �رجع config ا�� VIP ب�اء� ع�� ا�� XP
var etVIPData = (userData) => {
    const totalXP = userData?.vip?.xp || 0;
    const level = getVIPLevelFromXP(totalXP);
    if (!level) return null;
    return VIP_CONFIG.find(v => v.level === level) || null;
};

// getVIPLevel � �حسب ا���ف� �� ا�� XP (أ� fallback ��� manual level)
var etVIPLevel = (userData) => {
    const totalXP = userData?.vip?.xp || 0;
    if (totalXP > 0) return getVIPLevelFromXP(totalXP);
    return userData?.vip?.level || 0; // fallback ��� manual admin assign
};

var asVIP = (userData) => getVIPLevel(userData) >= 1;
// hasVIPExclusiveGifts removed � dead code, never called anywhere in project

var asVIPDailyTasks = (userData) => {
    const cfg = getVIPData(userData);
    return cfg?.vipDailyTasks === true;
};

var etVIPXPMultiplier = (userData) => {
    const cfg = getVIPData(userData);
    return cfg?.xpMultiplier || 1;
};

var etVIPCustomIdLength = (userData) => {
    const cfg = getVIPData(userData);
    return cfg?.customIdLength || null;
};

// ���� VIP BADGE COMPONENT ����
var IPBadge = ({ userData, onClick, size = 'sm' }) => {
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

// ���� VIP NAME COMPONENT � اس� ا�� VIP با�تأث�رات ا�صح ����
var IPName = ({ displayName, userData, className = '', style = {} }) => {
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

// ������������������������������������������������������������
// � STAFF ROLE BADGE � �ظ�ر ف� �� ��ا�
// ������������������������������������������������������������
var StaffRoleBadge = ({ userData, uid, lang, size = 'sm', onClick }) => {
    const role = getUserRole(userData, uid);
    if (!role) return null;
    const cfg = ROLE_CONFIG[role];
    const isMd = size === 'md';

    return (
        <span
            onClick={onClick}
            style={{
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
                transition: onClick ? 'all 0.15s' : 'none',
            }}
        >
            {cfg.icon} {lang === 'ar' ? cfg.label_ar : cfg.label_en}
        </span>
    );
};

// ������������������������������������������������������������
// ���️  PLAYER NAME TAG
// ا����ب���ت ا���ح�د �عرض ا��اعب ف� �� ��ا�:
//   ��ب� · ��در ب�رد · أصد�اء · تص��ت · أ� ��ا� تا��
//
// Props:
//   player      � { photoURL|photo, displayName|name, equipped, vip }
//   lang        � 'ar' | 'en'
//   size        � 'sm' (default) | 'md'
//   showStatus  � ��� ��طة ا�ستات�س (�ث�ا� '#4ade80') أ� null
// ������������������������������������������������������������
// � FIX: FlagDisplay � works on ALL platforms including Windows Chrome
// Windows Chrome does NOT render flag emoji. We use flagcdn.com image as primary
// and fall back to emoji if the image fails.
var lagDisplay = ({ countryCode, flagEmoji, size = 20, style = {} }) => {
    const [imgFailed, setImgFailed] = React.useState(false);
    if (!countryCode && !flagEmoji) return null;
    const code = (countryCode || '').toLowerCase();
    const imgUrl = code ? `https://flagcdn.com/w${size}/${code}.png` : null;
    if (imgUrl && !imgFailed) {
        return (
            <img
                src={imgUrl}
                alt={flagEmoji || code}
                onError={() => setImgFailed(true)}
                style={{
                    width: size + 'px',
                    height: Math.round(size * 0.7) + 'px',
                    objectFit: 'cover',
                    borderRadius: '2px',
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    flexShrink: 0,
                    ...style,
                }}
            />
        );
    }
    // fallback: emoji
    return <span style={{ fontSize: (size * 1.1) + 'px', lineHeight: 1, ...style }}>{flagEmoji || ''}</span>;
};

var layerNameTag = ({ player, lang, size = 'sm', showStatus = null }) => {
    if (!player) return null;

    const photoURL  = player.photoURL || player.photo || null;
    const name      = player.displayName || player.name || '�';
    const equipped  = player.equipped || {};
    const vipActive = getVIPLevel(player) > 0;
    const banData   = player.ban || null;
    const playerUID = player.uid || player.id || null;
    const playerRole = getUserRole(player, playerUID);

    // Title
    const titleId   = equipped.titles;
    const titleItem = titleId ? SHOP_ITEMS.titles.find(t => t.id === titleId) : null;

    // Badges � max 3
    const badgeIds  = equipped.badges || [];

    const avatarSz  = size === 'md' ? 'md' : 'sm';
    const nameSz    = size === 'md' ? '13px' : '12px';

    return (
        <div style={{ display:'flex', alignItems:'center', gap: size==='md'?'10px':'8px', minWidth:0 }}>

            {/* �� Avatar �� */}
            <div style={{ position:'relative', flexShrink:0 }}>
                <AvatarWithFrame photoURL={photoURL} equipped={equipped} size={avatarSz} banData={banData} lang={lang} />
                {showStatus && (
                    <div style={{
                        position:'absolute', bottom:'-1px', right:'-1px',
                        width:'9px', height:'9px', borderRadius:'50%',
                        background: showStatus, border:'2px solid #0a0a14'
                    }} />
                )}
            </div>

            {/* �� Info �� */}
            <div style={{ display:'flex', flexDirection:'column', gap:'2px', minWidth:0 }}>

                {/* Row 1 � Name + VIP badge + role badge + ban indicator */}
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
                    {playerRole && (
                        <StaffRoleBadge userData={player} uid={playerUID} lang={lang} size="sm" />
                    )}
                    {banData?.isBanned && (!banData.expiresAt || new Date() < (banData.expiresAt?.toDate?.() || new Date(banData.expiresAt))) && (
                        <span className="banned-name-indicator">�</span>
                    )}
                </div>

                {/* Row 2 � Badges (max 3) */}
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

                {/* Row 3 � Title with � */}
                {titleItem && (
                    <div style={{ display:'flex', alignItems:'center', gap:'2px' }}>
                        {titleItem.imageUrl && titleItem.imageUrl.trim() !== '' ? (
                            <img src={titleItem.imageUrl} alt=""
                                style={{ maxWidth:'70px', maxHeight:'13px', objectFit:'contain' }} />
                        ) : (
                            <span style={{ fontSize:'9px', color:'#a78bfa', lineHeight:1, whiteSpace:'nowrap' }}>
                                � {titleItem.preview} {lang==='ar' ? titleItem.name_ar : titleItem.name_en}
                            </span>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

// ���� VIP BADGE POPUP ����
var IPBadgePopup = ({ level, onClose }) => {
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
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>�</div>
                <div style={{ color: cfg.nameColor, fontWeight: 900, fontSize: '20px', marginBottom: '6px' }}>
                    VIP Level {level}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '14px' }}>{cfg.name_ar}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                    {cfg.benefits_ar.map((b, i) => (
                        <div key={i} style={{ fontSize: '11px', color: '#d1d5db', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: cfg.nameColor }}>�</span> {b}
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

// ���� VIP INFO TABLE MODAL ����
var IPInfoModal = ({ onClose, lang }) => {
    const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '380px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">� {lang === 'ar' ? '���زات VIP' : 'VIP Benefits'}</h2>
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
                                    {cfg.xpMultiplier >= 2 && <span style={{ fontSize: '10px', color: '#fbbf24' }}>� �2</span>}
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
                                        }}>ID: {cfg.customIdLength} {lang === 'ar' ? 'أر�ا�' : 'digits'}</span>
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

// ���� VIP 10 EXCLUSIVE REQUEST FORM � with full approval system ����
var IP10RequestForm = ({ user, lang, onNotification, userData }) => {
    const [giftName,    setGiftName]    = useState('');
    const [giftImage,   setGiftImage]   = useState('');
    const [giftEmail,   setGiftEmail]   = useState('');
    const [luckyNumber, setLuckyNumber] = useState('');
    const [sending,     setSending]     = useState(false);
    const [showForm,    setShowForm]    = useState(false); // for modification mode

    // STATUS: 0=pending, 1=approved, 2=rejected
    const [latestRequest, setLatestRequest] = useState(null);
    const [loadingReq,    setLoadingReq]    = useState(true);

    useEffect(() => {
        if (!user?.uid) { setLoadingReq(false); return; }
        const unsub = vip10RequestsCollection
            .where('uid', '==', user.uid)
            .limit(10)
            .onSnapshot(snap => {
                if (!snap.empty) {
                    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    docs.sort((a, b) => {
                        const aT = a.createdAt?.toMillis?.() || 0;
                        const bT = b.createdAt?.toMillis?.() || 0;
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

    // � Can the user submit THIS month?
    const getMonthKey = (d) => {
        const date = d?.toDate ? d.toDate() : (d ? new Date(d) : null);
        if (!date) return null;
        return `${date.getFullYear()}-${date.getMonth()}`;
    };
    const thisMonthKey = `${new Date().getFullYear()}-${new Date().getMonth()}`;
    const lastRequestMonthKey = getMonthKey(latestRequest?.createdAt);
    const alreadyRequestedThisMonth = lastRequestMonthKey === thisMonthKey;

    // � Logic:
    // - No request ever � show form
    // - Pending (0) � show waiting
    // - Approved (1) + same month � show approved + "next month you can modify"
    // - Approved (1) + new month � show approved + "modify gift" button � opens form with "Modification" label
    // - Rejected (2) + same month � show rejected + can resubmit
    // - Rejected (2) + new month � show form (fresh start)
    const isApproved  = latestRequest?.status === 1;
    const isRejected  = latestRequest?.status === 2;
    const isPending   = latestRequest?.status === 0;
    const canModify   = isApproved && !alreadyRequestedThisMonth; // approved but new month
    const canResubmit = isRejected; // always can resubmit after rejection
    const isModification = isApproved; // any new request after approval = modification

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
                uid:            user.uid,
                displayName:    userData?.displayName || '',
                giftName:       giftName.trim(),
                giftImage:      giftImage || '',
                giftEmail:      giftEmail.trim(),
                luckyNumber:    parseInt(luckyNumber) || 0,
                status:         0,
                adminNote:      '',
                isModification: isModification, // � flag for admin
                createdAt:      TS(),
            });
            await usersCollection.doc(user.uid).update({
                'vip.lastGiftRequest': TS()
            });
            onNotification(lang === 'ar'
                ? (isModification ? '� ت� إرسا� ط�ب ا�تعد��!' : '� ت� إرسا� ط�ب�!')
                : (isModification ? '� Modification request sent!' : '� Request sent!'));
            setGiftName(''); setGiftImage(''); setGiftEmail(''); setLuckyNumber('');
            setShowForm(false);
        } catch (e) {
            onNotification(lang === 'ar' ? '� خطأ� حا�� �رة أخر�' : '� Error, try again');
        }
        setSending(false);
    };

    if (loadingReq) return null;

    // �� Gift request form ��
    const RequestForm = ({ label }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {label && (
                <div style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 800, textAlign: 'center',
                    background: 'rgba(251,191,36,0.08)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(251,191,36,0.2)' }}>
                    �️ {label}
                </div>
            )}
            <input className="input-dark" placeholder={lang === 'ar' ? 'اس� ا��د�ة' : 'Gift name'}
                value={giftName} onChange={e => setGiftName(e.target.value)} style={{ fontSize: '12px' }} />
            <div>
                <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
                    �️ {lang === 'ar' ? 'ص�رة ا��د�ة (اخت�ار�)' : 'Gift image (optional)'}
                </label>
                <input type="file" accept="image/*" onChange={handleImageChange}
                    style={{ fontSize: '11px', color: '#d1d5db', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px',
                        padding: '4px 6px', width: '100%', cursor: 'pointer' }} />
                {giftImage && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                        <img src={giftImage} alt="preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.4)' }} />
                        <button onClick={() => setGiftImage('')} style={{ fontSize: '10px', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>
                            � {lang === 'ar' ? 'حذف' : 'Remove'}
                        </button>
                    </div>
                )}
            </div>
            <input className="input-dark" type="email" placeholder={lang === 'ar' ? 'بر�د� ا�إ��تر���' : 'Your email'}
                value={giftEmail} onChange={e => setGiftEmail(e.target.value)} style={{ fontSize: '12px' }} />
            <input className="input-dark" type="number" placeholder={lang === 'ar' ? 'ر��� ا��حظ�ظ ��' : 'Your lucky number ��'}
                value={luckyNumber} onChange={e => setLuckyNumber(e.target.value)} style={{ fontSize: '12px' }} />
            <button onClick={handleSubmit} disabled={sending || !giftName.trim()} className="btn-neon"
                style={{ padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                    opacity: sending || !giftName.trim() ? 0.5 : 1 }}>
                {sending ? '⏳' : (lang === 'ar' ? '� إرسا� ا�ط�ب' : '� Send Request')}
            </button>
            <div style={{ fontSize: '9px', color: '#6b7280', textAlign: 'center' }}>
                � {lang === 'ar' ? 'س�ت� �راجعة ط�ب� خ�ا� 24 ساعة' : 'Request reviewed within 24h'}
            </div>
        </div>
    );

    // �� Status card shared ��
    const StatusCard = ({ statusColor, statusEmoji, statusText, giftText, note, children }) => (
        <div style={{
            borderRadius: '10px', padding: '12px',
            background: `rgba(${statusColor},0.06)`,
            border: `1px solid rgba(${statusColor},0.3)`,
            display: 'flex', flexDirection: 'column', gap: '6px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{statusEmoji}</span>
                <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: `rgb(${statusColor})` }}>{statusText}</div>
                    {giftText && <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
                        {lang === 'ar' ? 'ا��د�ة:' : 'Gift:'}{' '}
                        <span style={{ color: '#fbbf24', fontWeight: 700 }}>{giftText}</span>
                    </div>}
                </div>
            </div>
            {note && (
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '7px', padding: '8px 10px',
                    borderLeft: '3px solid #ef4444', fontSize: '11px', color: '#e2e8f0', lineHeight: 1.5 }}>
                    <span style={{ fontSize: '9px', color: '#ef4444', fontWeight: 800, display: 'block', marginBottom: '2px' }}>
                        {lang === 'ar' ? '� رسا�ة ا�إدارة:' : '� Admin Note:'}
                    </span>
                    {note}
                </div>
            )}
            {children}
            <div style={{ fontSize: '9px', color: '#6b7280', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '5px' }}>
                {lang === 'ar' ? '����� ا�ط�ب �رة �احدة ف� ا�ش�ر' : 'One request per month'}
            </div>
        </div>
    );

    return (
        <div style={{
            background: 'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(15,15,26,0.95))',
            border: '1px solid rgba(239,68,68,0.35)',
            borderRadius: '12px', padding: '14px', marginTop: '6px'
        }}>
            <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '13px', marginBottom: '10px',
                display: 'flex', alignItems: 'center', gap: '6px' }}>
                � {lang === 'ar' ? 'ط�ب �د�ة �خصصة (VIP 10 ف�ط)' : 'Custom Gift Request (VIP 10 only)'}
            </div>

            {/* �� No request yet � show form �� */}
            {!latestRequest && <RequestForm label={null} />}

            {/* �� Pending (0) � waiting �� */}
            {isPending && (
                <StatusCard
                    statusColor="251,191,36"
                    statusEmoji="⏳"
                    statusText={lang === 'ar' ? 'ط�ب� ��د ا��راجعة�' : 'Request under review�'}
                    giftText={latestRequest.giftName}
                    note={latestRequest.adminNote || null}
                >
                    {!latestRequest.adminNote && (
                        <div style={{ fontSize: '9px', color: '#6b7280', textAlign: 'center' }}>
                            {lang === 'ar' ? 'ف� ا�تظار رد ا�إدارة�' : 'Waiting for admin response�'}
                        </div>
                    )}
                </StatusCard>
            )}

            {/* �� Approved (1) �� */}
            {isApproved && !showForm && (
                <StatusCard
                    statusColor="74,222,128"
                    statusEmoji="�"
                    statusText={lang === 'ar' ? '� ت� �ب�� ط�ب ا��د�ة!' : '� Gift Request Approved!'}
                    giftText={latestRequest.giftName}
                    note={latestRequest.adminNote || null}
                >
                    {canModify ? (
                        <button onClick={() => setShowForm(true)} style={{
                            padding: '7px', borderRadius: '7px', fontSize: '11px', fontWeight: 700,
                            background: 'rgba(251,191,36,0.15)', color: '#fbbf24',
                            border: '1px solid rgba(251,191,36,0.35)', cursor: 'pointer'
                        }}>
                            �️ {lang === 'ar' ? 'تعد�� ا��د�ة (ش�ر جد�د)' : 'Modify Gift (New Month)'}
                        </button>
                    ) : (
                        <div style={{ fontSize: '9px', color: '#6b7280', textAlign: 'center' }}>
                            � {lang === 'ar' ? '����� ا�تعد�� ا�ش�ر ا��اد�' : 'You can modify next month'}
                        </div>
                    )}
                </StatusCard>
            )}

            {/* �� Modification form (after approval) �� */}
            {isApproved && showForm && (
                <>
                    <RequestForm label={lang === 'ar' ? 'تعد�� ا��د�ة ا��خصصة' : 'Modify Custom Gift'} />
                    <button onClick={() => setShowForm(false)} style={{
                        width: '100%', marginTop: '4px', padding: '5px', background: 'none',
                        border: 'none', color: '#6b7280', fontSize: '10px', cursor: 'pointer' }}>
                        {lang === 'ar' ? '� إ�غاء' : '� Cancel'}
                    </button>
                </>
            )}

            {/* �� Rejected (2) �� */}
            {isRejected && !showForm && (
                <StatusCard
                    statusColor="248,113,113"
                    statusEmoji="�"
                    statusText={lang === 'ar' ? 'ت� رفض ط�ب�' : 'Request Rejected'}
                    giftText={latestRequest.giftName}
                    note={latestRequest.adminNote || null}
                >
                    <button onClick={() => setShowForm(true)} style={{
                        padding: '7px', borderRadius: '7px', fontSize: '11px', fontWeight: 700,
                        background: 'rgba(239,68,68,0.15)', color: '#f87171',
                        border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer'
                    }}>
                        � {lang === 'ar' ? 'إرسا� ط�ب جد�د' : 'Submit New Request'}
                    </button>
                </StatusCard>
            )}

            {/* �� New form after rejection �� */}
            {isRejected && showForm && (
                <>
                    <RequestForm label={null} />
                    <button onClick={() => setShowForm(false)} style={{
                        width: '100%', marginTop: '4px', padding: '5px', background: 'none',
                        border: 'none', color: '#6b7280', fontSize: '10px', cursor: 'pointer' }}>
                        {lang === 'ar' ? '� إ�غاء' : '� Cancel'}
                    </button>
                </>
            )}
        </div>
    );
};



// ���� VIP BUY / RENEW SECTION (embedded in VIP Center) ����
var IPBuySection = ({ userData, user, lang, onNotification, isRenew }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [buying, setBuying] = useState(false);
    const currency = userData?.currency || 0;
    const hasVIP = typeof getVIPLevel === 'function' && getVIPLevel(userData) > 0;
    const vipDaysLeft = (() => {
        if (!userData?.vip?.expiresAt) return null;
        const exp = userData.vip.expiresAt?.toDate ? userData.vip.expiresAt.toDate() : new Date(userData.vip.expiresAt.seconds * 1000);
        const diff = Math.ceil((exp - Date.now()) / 86400000);
        return Math.max(0, diff);
    })();

    const handleBuyVIP = async () => {
        if (!user || currency < 50000 || buying) return;
        setBuying(true);
        try {
            const now = new Date();
            const expiresAt = hasVIP && vipDaysLeft > 0
                ? new Date(now.getTime() + (vipDaysLeft + 30) * 86400000)
                : new Date(now.getTime() + 30 * 86400000);
            await usersCollection.doc(user.uid).update({
                currency: firebase.firestore.FieldValue.increment(-50000),
                'vip.active': true,
                'vip.activatedAt': hasVIP ? (userData.vip.activatedAt || TS()) : TS(),
                'vip.expiresAt': expiresAt,
                'vip.xp': firebase.firestore.FieldValue.increment(hasVIP ? 0 : 5000),
            });
            onNotification && onNotification(lang === 'ar' ? '� ت� تفع�� VIP! +30 ���' : '� VIP Activated! +30 days');
            setShowConfirm(false);
        } catch(e) {
            onNotification && onNotification(lang === 'ar' ? '� خطأ' : '� Error');
        }
        setBuying(false);
    };

    const canAfford = currency >= 50000;

    // Renew mode: only show the renew button inline, no banners or feature pills
    if (isRenew) return (
        <div style={{ marginTop:'4px' }}>
            {!showConfirm ? (
                <button
                    onClick={() => canAfford && setShowConfirm(true)}
                    disabled={!canAfford}
                    style={{
                        width:'100%', padding:'11px', borderRadius:'11px', border:'none',
                        background: canAfford ? 'linear-gradient(135deg,#5b21b6,#7c3aed,#a855f7)' : 'rgba(100,100,100,0.12)',
                        color: canAfford ? '#fff' : '#4b5563',
                        fontWeight:800, fontSize:'13px', cursor: canAfford ? 'pointer' : 'not-allowed',
                        boxShadow: canAfford ? '0 4px 18px rgba(124,58,237,0.4)' : 'none',
                        transition:'all 0.2s', position:'relative', overflow:'hidden',
                    }}>
                    {canAfford && <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)', animation:'shimmer 2s infinite' }}/>}
                    <span style={{ position:'relative' }}>
                        {canAfford
                            ? `� ${lang === 'ar' ? 'تجد�د +30 ���' : 'Renew +30 days'} � 50,000 �`
                            : `� ${lang === 'ar' ? 'تحتاج' : 'Need'} 50,000 �`}
                    </span>
                </button>
            ) : (
                <div style={{ borderRadius:'12px', overflow:'hidden', border:'1px solid rgba(168,85,247,0.35)', background:'linear-gradient(135deg,#1a0533,#0d0d2b)', padding:'14px', textAlign:'center' }}>
                    <div style={{ color:'#e9d5ff', fontWeight:800, fontSize:'14px', marginBottom:'4px' }}>� {lang === 'ar' ? 'تجد�د VIP�' : 'Renew VIP?'}</div>
                    <div style={{ color:'#fbbf24', fontWeight:900, fontSize:'16px', marginBottom:'12px' }}>50,000 �</div>
                    <div style={{ display:'flex', gap:'8px', justifyContent:'center' }}>
                        <button onClick={() => setShowConfirm(false)} style={{ padding:'7px 16px', borderRadius:'9px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'#9ca3af', fontWeight:600, cursor:'pointer', fontSize:'12px' }}>
                            {lang === 'ar' ? 'إ�غاء' : 'Cancel'}
                        </button>
                        <button onClick={handleBuyVIP} disabled={buying} style={{ padding:'7px 20px', borderRadius:'9px', border:'none', background:'linear-gradient(135deg,#7c3aed,#a855f7)', color:'#fff', fontWeight:800, cursor:'pointer', fontSize:'12px' }}>
                            {buying ? '⏳' : (lang === 'ar' ? 'تأ��د' : 'Confirm')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {/* Info banner */}
            <div style={{
                borderRadius:'12px', padding:'12px 14px',
                background:'linear-gradient(135deg,rgba(124,58,237,0.14),rgba(168,85,247,0.08))',
                border:'1px solid rgba(168,85,247,0.3)',
                fontSize:'11px', color:'#c4b5fd', lineHeight:1.6, textAlign:'center',
            }}>
                �� {lang === 'ar'
                    ? '�� �د�ة ترس��ا ت��ح� VIP XP � ���ا أرس�ت أ�ثر ارتفع �ست�ا�!'
                    : 'Every gift you send earns VIP XP � the more you give, the higher you level!'}
            </div>

            {/* Feature pills */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
                {[
                    { icon:'�', ar:'اس� ���� ���ز',    en:'Colored VIP Name'    },
                    { icon:'�', ar:'�ضاعف XP �1.2',   en:'1.2� XP Multiplier'  },
                    { icon:'��', ar:'بادج VIP حصر�',    en:'Exclusive VIP Badge' },
                    { icon:'��', ar:'�دا�ا VIP ��ف�ة',  en:'Locked VIP Gifts'    },
                ].map((f,i) => (
                    <div key={i} style={{
                        display:'flex', alignItems:'center', gap:'7px',
                        fontSize:'10px', color:'#e9d5ff',
                        background:'rgba(124,58,237,0.1)', border:'1px solid rgba(196,181,253,0.12)',
                        borderRadius:'9px', padding:'7px 9px',
                    }}>
                        <span style={{ fontSize:'13px', flexShrink:0 }}>{f.icon}</span>
                        <span style={{ fontWeight:600, lineHeight:1.3 }}>{lang === 'ar' ? f.ar : f.en}</span>
                    </div>
                ))}
            </div>

            {/* Balance */}
            <div style={{ textAlign:'center', fontSize:'11px', color:'#6b7280' }}>
                {lang === 'ar' ? 'رص�د�:' : 'Balance:'} <span style={{ color:'#fbbf24', fontWeight:700 }}>{currency.toLocaleString()} �</span>
            </div>

            {/* Buy button */}
            {!showConfirm ? (
                <button
                    onClick={() => canAfford && setShowConfirm(true)}
                    disabled={!canAfford}
                    style={{
                        width:'100%', padding:'14px', borderRadius:'13px', border:'none',
                        background: canAfford ? 'linear-gradient(135deg,#b91c1c,#ef4444,#f87171)' : 'rgba(100,100,100,0.12)',
                        color: canAfford ? '#fff' : '#4b5563',
                        fontWeight:900, fontSize:'15px', cursor: canAfford ? 'pointer' : 'not-allowed',
                        boxShadow: canAfford ? '0 6px 24px rgba(239,68,68,0.4)' : 'none',
                        transition:'all 0.2s', position:'relative', overflow:'hidden',
                    }}>
                    {canAfford && <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)', animation:'shimmer 2s infinite' }}/>}
                    <span style={{ position:'relative' }}>
                        {canAfford
                            ? `� ${lang === 'ar' ? 'اشترِ VIP 1' : 'Buy VIP 1'} � 50,000 �`
                            : `� ${lang === 'ar' ? 'تحتاج' : 'Need'} 50,000 � (${lang === 'ar' ? '�د��' : 'Have'}: ${currency.toLocaleString()})`}
                    </span>
                </button>
            ) : (
                <div style={{ borderRadius:'14px', overflow:'hidden', border:'1px solid rgba(168,85,247,0.35)', background:'linear-gradient(135deg,#1a0533,#0d0d2b)' }}>
                    <div style={{ padding:'16px', textAlign:'center' }}>
                        <div style={{ fontSize:'36px', marginBottom:'8px' }}>�</div>
                        <div style={{ color:'#e9d5ff', fontWeight:900, fontSize:'15px', marginBottom:'6px' }}>
                            {lang === 'ar' ? 'تفع�� VIP�' : 'Activate VIP?'}
                        </div>
                        <div style={{ color:'#fbbf24', fontWeight:900, fontSize:'18px', marginBottom:'14px' }}>50,000 �</div>
                        <div style={{ display:'flex', gap:'10px', justifyContent:'center' }}>
                            <button onClick={() => setShowConfirm(false)} style={{ padding:'9px 20px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'#9ca3af', fontWeight:600, cursor:'pointer' }}>
                                {lang === 'ar' ? 'إ�غاء' : 'Cancel'}
                            </button>
                            <button onClick={handleBuyVIP} disabled={buying} style={{ padding:'9px 24px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#7c3aed,#a855f7)', color:'#fff', fontWeight:800, cursor:'pointer', boxShadow:'0 0 20px rgba(168,85,247,0.45)', fontSize:'13px' }}>
                                {buying ? '⏳' : (lang === 'ar' ? 'تأ��د' : 'Confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ���� VIP CENTER SECTION (for Settings) ����
var IPCenterSection = ({ userData, user, lang, onNotification }) => {
    const [showInfoModal, setShowInfoModal]       = useState(false);
    const [showBadgePopup, setShowBadgePopup]     = useState(false);
    const [customIdEnabled, setCustomIdEnabled]   = useState(userData?.vip?.customIdEnabled || false);
    // VIP custom ID request states
    const [desiredId, setDesiredId]               = useState('');
    const [idCheckStatus, setIdCheckStatus]       = useState(null); // null | 'checking' | 'taken' | 'available'
    const [idRequestSending, setIdRequestSending] = useState(false);
    // � Pending request listener � �تابع حا�ة ا�ط�ب ف� real-time
    const [pendingRequest, setPendingRequest]     = useState(null); // null | { status, adminNote, desiredId }
    const [seenRequestId, setSeenRequestId]       = useState(null); // last request we've shown result for

    const totalVIPXP  = userData?.vip?.xp || 0;
    const level       = getVIPLevel(userData);
    const cfg         = level ? VIP_CONFIG[level - 1] : null;
    const customIdLen = getVIPCustomIdLength(userData);
    const xpInfo      = getVIPXPProgress(totalVIPXP);

    // � Real-time listener ع�� آخر ط�ب ID ���ستخد� (بد�� orderBy �تج�ب index)
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

    // � Auto-apply customId when admin approves request (status = 1)
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
        onNotification(lang === 'ar' ? 'ت� ا�حفظ �' : 'Saved �');
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
        if (!onlyDigits) return lang === 'ar' ? `� أر�ا� ف�ط` : `� Digits only`;
        if (id.length !== customIdLen) return lang === 'ar'
            ? `� �جب أ� ���� ${customIdLen} أر�ا� با�ضبط (VIP ${level})`
            : `� Must be exactly ${customIdLen} digits (VIP ${level})`;
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

    // Submit custom ID request � ALL VIP 6-10 go through request system
    const handleIdRequest = async () => {
        const err = validateIdInput(desiredId.trim());
        if (err || idCheckStatus !== 'available' || idRequestSending || !user) return;
        setIdRequestSending(true);
        try {
            // � Check for existing PENDING requests with same desiredId
            const pendingSnap = await vip10IdRequestsCollection
                .where('desiredId', '==', desiredId.trim())
                .where('status', '==', 0)
                .limit(1)
                .get();
            if (!pendingSnap.empty) {
                onNotification(lang === 'ar'
                    ? '� �ذا ا�� ID �حج�ز حا��ا� �� �ستخد� آخر'
                    : '� This ID is already reserved by another user');
                setIdRequestSending(false);
                return;
            }

            await vip10IdRequestsCollection.add({
                uid:         user.uid,
                displayName: userData?.displayName || '',
                desiredId:   desiredId.trim(),
                currentId:   userData?.customId || '',
                vipLevel:    level,
                // � STATUS FIELD:
                // 0 = pending (default, ط�ب ��د ا��راجعة)
                // 1 = approved (ات�ب� � غ��ر ا����ة ��� 1 ف� Firestore ��ب�� ا�ط�ب)
                // 2 = rejected (اترفض � غ��ر ا����ة ��� 2 ف� Firestore �رفض ا�ط�ب)
                status:      0,
                createdAt:   TS(),
            });
            await usersCollection.doc(user.uid).update({ 'vip.lastIdRequest': TS() });
            onNotification(lang === 'ar' ? '� ت� إرسا� ط�ب ا�� ID!' : '� ID request sent!');
            setDesiredId('');
            setIdCheckStatus(null);
        } catch (e) {
            onNotification(lang === 'ar' ? '� خطأ� حا�� �رة أخر�' : '� Error, try again');
        }
        setIdRequestSending(false);
    };

    // ��� ا�أ��ا� ب�اء� ع�� ا���ف� ���
    const barColor  = cfg ? cfg.nameColor : '#7c3aed';
    const nextLevel = level < 10 ? level + 1 : 10;
    const nextCfg   = VIP_CONFIG.find(v => v.level === nextLevel);

    return (
        <div className="settings-section">
            {/* �� Header �� */}
            <div className="settings-section-title">
                <span>�</span>
                <span>VIP Center</span>
                <button
                    onClick={() => setShowInfoModal(true)}
                    style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'#60a5fa', fontSize:'16px', padding:'0 2px' }}
                    title={lang === 'ar' ? '�ع���ات VIP' : 'VIP Info'}
                >�️</button>
            </div>

            {/* �� VIP XP Card �� (تظ�ر دا���ا) */}
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
                                {lang === 'ar' ? 'غ�ر �ُفع���' : 'Not Active'}
                            </span>
                        </>
                    )}
                </div>

                {/* �� XP Progress Bar or CTA �� */}
                {level > 0 ? (
                <div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px' }}>
                        <span style={{ fontSize:'11px', color:'#9ca3af' }}>
                            � VIP XP
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
                            {lang === 'ar' ? `ا��ست�� ${level}` : `Level ${level}`}
                        </span>
                        {level < 10 ? (
                            <span style={{ fontSize:'9px', color: barColor }}>
                                {lang === 'ar'
                                    ? `${(xpInfo.xpNeeded - xpInfo.xpInLevel).toLocaleString()} XP ���ست�� ${nextLevel} �`
                                    : `${(xpInfo.xpNeeded - xpInfo.xpInLevel).toLocaleString()} XP to Level ${nextLevel} �`
                                }
                            </span>
                        ) : (
                            <span style={{ fontSize:'9px', color:'#fbbf24', fontWeight:700 }}>
                                � MAX LEVEL
                            </span>
                        )}
                    </div>
                </div>
                ) : (
                /* No VIP � Buy section */
                <VIPBuySection userData={userData} user={user} lang={lang} onNotification={onNotification} />
                )}

                {/* �� Tip + Renew � only for active VIP �� */}
                {level > 0 && (
                <>
                <div style={{
                    fontSize:'10px', color:'#6b7280', textAlign:'center',
                    padding:'6px 10px', background:'rgba(255,255,255,0.03)',
                    borderRadius:'8px', border:'1px solid rgba(255,255,255,0.05)'
                }}>
                    �� {lang === 'ar'
                        ? 'أرس� �دا�ا �تحص� ع�� VIP XP �ترتفع ��ست�� أع��!'
                        : 'Send gifts to earn VIP XP and level up!'}
                </div>
                {/* Renew VIP button */}
                <VIPBuySection userData={userData} user={user} lang={lang} onNotification={onNotification} isRenew={true} />
                </>
                )}

                {/* �� Level perks if active �� */}
                {level > 0 && (
                    <>
                        {/* XP Multiplier */}
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:'12px' }}>
                            <span style={{ color:'#9ca3af' }}>� {lang === 'ar' ? '�ضاعف XP ا�أ�عاب' : 'Game XP Multiplier'}</span>
                            <span style={{ color:'#fbbf24', fontWeight:700 }}>�{cfg.xpMultiplier}</span>
                        </div>

                        {/* Custom ID Request � VIP 6+ (all levels go through request system) */}
                        {customIdLen && (
                            <div style={{
                                background: level === 10
                                    ? 'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(15,15,26,0.95))'
                                    : 'linear-gradient(135deg,rgba(96,165,250,0.08),rgba(15,15,26,0.95))',
                                border: `1px solid ${level === 10 ? 'rgba(239,68,68,0.3)' : 'rgba(96,165,250,0.3)'}`,
                                borderRadius: '10px', padding: '12px', marginTop: '4px'
                            }}>
                                <div style={{ fontSize:'11px', fontWeight:800, color: level === 10 ? '#ef4444' : '#60a5fa', marginBottom:'8px' }}>
                                    � {lang === 'ar'
                                        ? `ط�ب ID �خصص (${customIdLen} أر�ا� با�ضبط) � �رة �� ش�ر`
                                        : `Custom ID Request (exactly ${customIdLen} digits) � once/month`}
                                </div>
                                {userData?.customId && (
                                    <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'6px' }}>
                                        {lang === 'ar' ? 'ا�� ID ا�حا��:' : 'Current ID:'} <span style={{color:'#fbbf24', fontWeight:700}}>{userData.customId}</span>
                                    </div>
                                )}
                                {/* � Show form when no pending request (or after approved/rejected + new month)
                                    Show status box when request is pending/active */}
                                {!pendingRequest ? (
                                    <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                                        <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                                            <input
                                                className="input-dark"
                                                placeholder={lang === 'ar' ? `${customIdLen} أر�ا�` : `${customIdLen} digits`}
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
                                                {idCheckStatus === 'checking' ? '⏳' : (lang === 'ar' ? 'تح��' : 'Check')}
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
                                                �️ {lang === 'ar'
                                                    ? `�جب أ� ���� ${customIdLen} أر�ا� با�ضبط (أدخ�ت ${desiredId.length})`
                                                    : `Must be exactly ${customIdLen} digits (you entered ${desiredId.length})`}
                                            </div>
                                        )}
                                        {idCheckStatus === 'taken' && (
                                            <div style={{ fontSize:'10px', color:'#f87171', fontWeight:700 }}>� {lang === 'ar' ? '�ذا ا�� ID �أخ�ذ با�فع�' : 'This ID is already taken'}</div>
                                        )}
                                        {idCheckStatus === 'available' && (
                                            <div style={{ fontSize:'10px', color:'#4ade80', fontWeight:700 }}>� {lang === 'ar' ? 'ا�� ID �تاح!' : 'ID is available!'}</div>
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
                                            {idRequestSending ? '⏳' : (lang === 'ar' ? '� إرسا� ا�ط�ب' : '� Send Request')}
                                        </button>
                                        <div style={{ fontSize:'9px', color:'#6b7280', textAlign:'center' }}>
                                            {lang === 'ar' ? '� س�ت� �راجعة ط�ب� �تطب��� خ�ا� 24 ساعة' : '� Request reviewed & applied within 24h'}
                                        </div>
                                    </div>
                                ) : (
                                    /* � Real-time Request Status Box */
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
                                                {pendingRequest?.status === 1 ? '�' : pendingRequest?.status === 2 ? '�' : '⏳'}
                                            </span>
                                            <div>
                                                <div style={{ fontSize:'11px', fontWeight:800, color:
                                                    pendingRequest?.status === 1 ? '#4ade80'
                                                    : pendingRequest?.status === 2 ? '#f87171' : '#fbbf24'
                                                }}>
                                                    {pendingRequest?.status === 1
                                                        ? (lang === 'ar' ? '� ت� �ب�� ط�ب� �تطب�� ا�� ID!' : '� Request Approved & Applied!')
                                                        : pendingRequest?.status === 2
                                                        ? (lang === 'ar' ? '� ت� رفض ط�ب�' : '� Request Rejected')
                                                        : (lang === 'ar' ? '⏳ ط�ب� ��د ا��راجعة�' : '⏳ Request under review�')
                                                    }
                                                </div>
                                                {pendingRequest?.desiredId && (
                                                    <div style={{ fontSize:'10px', color:'#9ca3af', marginTop:'2px' }}>
                                                        {lang === 'ar' ? 'ا�� ID ا��ط��ب:' : 'Requested ID:'}{' '}
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
                                                    {lang === 'ar' ? '� رسا�ة �� ا�إدارة:' : '� Admin Note:'}
                                                </span>
                                                {pendingRequest.adminNote}
                                            </div>
                                        )}
                                        {!pendingRequest?.adminNote && pendingRequest?.status === 0 && (
                                            <div style={{ fontSize:'9px', color:'#6b7280', textAlign:'center' }}>
                                                {lang === 'ar' ? 'ف� ا�تظار رد �� ا��سؤ�����' : 'Waiting for admin response�'}
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
                                                {lang === 'ar' ? '� ط�ب ID جد�د' : '� Request New ID'}
                                            </button>
                                        )}
                                        <div style={{ fontSize:'9px', color:'#6b7280', textAlign:'center', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'5px' }}>
                                            {lang === 'ar' ? '����� ا�ط�ب �رة �احدة ف� ا�ش�ر' : 'You can request once per month'}
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

