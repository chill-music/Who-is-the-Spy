class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) { }
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="glass-panel rounded-xl p-6 text-center max-w-md">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
                        <p className="text-sm text-gray-400 mb-4">Please refresh the page</p>
                        <button onClick={() => window.location.reload()} className="btn-neon px-6 py-2 rounded-lg">Refresh</button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// Guest Banner
const GuestBanner = ({ lang }) => {
    const t = TRANSLATIONS[lang];
    return ( <div className="guest-banner"> <h3 className="guest-banner-title">{t.guestTitle}</h3> <p className="guest-banner-desc">{t.guestDesc}</p> </div> );
};

// Notification Toast — Modern sliding pill from top
const NotificationToast = ({ message, onClose }) => {
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        if (message) {
            setExiting(false);
            setVisible(true);
            const hideTimer = setTimeout(() => {
                setExiting(true);
                setTimeout(() => { setVisible(false); onClose(); }, 350);
            }, 2000);
            return () => clearTimeout(hideTimer);
        }
    }, [message]);

    if (!message || !visible) return null;

    // Auto-detect icon type from message prefix
    const getToastStyle = (msg) => {
        if (msg.startsWith('✅') || msg.startsWith('👑') || msg.startsWith('🎉')) return { accent: '#4ade80', bg: 'rgba(10,30,20,0.97)', border: 'rgba(74,222,128,0.45)' };
        if (msg.startsWith('❌')) return { accent: '#f87171', bg: 'rgba(30,10,10,0.97)', border: 'rgba(248,113,113,0.45)' };
        if (msg.startsWith('⚠️')) return { accent: '#fbbf24', bg: 'rgba(30,25,5,0.97)', border: 'rgba(251,191,36,0.45)' };
        if (msg.startsWith('🎁')) return { accent: '#a78bfa', bg: 'rgba(20,10,35,0.97)', border: 'rgba(167,139,250,0.45)' };
        if (msg.startsWith('🧠') || msg.includes('Intel') || msg.includes('إنتل')) return { accent: '#00d4ff', bg: 'rgba(0,20,35,0.97)', border: 'rgba(0,212,255,0.45)' };
        return { accent: '#00f2ff', bg: 'rgba(10,10,26,0.97)', border: 'rgba(0,242,255,0.4)' };
    };

    const ts = getToastStyle(message);

    return (
        <div style={{
            position: 'fixed',
            top: '14px',
            left: '50%',
            right: 'auto',
            transform: 'translateX(-50%)',
            zIndex: 9999999,
            animation: exiting ? 'toast-slide-up 0.35s ease-in forwards' : 'toast-slide-down 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
            width: 'min(360px, calc(100vw - 24px))',
            pointerEvents: 'auto',
        }}>
            <div style={{
                background: ts.bg,
                border: `1px solid ${ts.border}`,
                borderRadius: '14px',
                padding: '11px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${ts.accent}22`,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Accent bar */}
                <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
                    background: `linear-gradient(180deg, ${ts.accent}, ${ts.accent}88)`,
                    borderRadius: '14px 0 0 14px',
                }} />
                {/* Progress bar */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
                    background: `rgba(255,255,255,0.06)`,
                    borderRadius: '0 0 14px 14px',
                }}>
                    <div style={{
                        height: '100%', background: ts.accent, borderRadius: 'inherit',
                        animation: 'toast-progress 2s linear forwards',
                        transformOrigin: 'left',
                    }} />
                </div>
                <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0, marginLeft: '6px' }}>
                    {message.match(/^(\p{Emoji})/u)?.[1] || '💬'}
                </span>
                <span style={{ flex: 1, fontSize: '12.5px', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.4 }}>
                    {message.replace(/^(\p{Emoji}\s?)/u, '')}
                </span>
                <button onClick={() => { setExiting(true); setTimeout(() => { setVisible(false); onClose(); }, 350); }}
                    style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '15px', padding: '2px', lineHeight: 1, flexShrink: 0 }}>
                    ×
                </button>
            </div>
        </div>
    );
};

// Modal Close Button
const ModalCloseBtn = ({ onClose }) => (<button onClick={onClose} className="modal-close-btn" aria-label="Close">&times;</button>);

// Charisma Display
const CharismaDisplay = ({ charisma, lang, showDetails = true }) => {
    const t = TRANSLATIONS[lang];
    const { currentLevel, nextLevel } = getCharismaLevel(charisma || 0);
    const progress = getCharismaProgress(charisma || 0);
    const neededForNext = nextLevel ? nextLevel.threshold - (charisma || 0) : 0;
    const isMaxLevel = currentLevel.isMaxLevel;
    const hasGlow = currentLevel.hasGlow;
    const isDivine = currentLevel.isDivine; // ✨ Level 21 — Divine style

    const renderIcon = () => {
        if (currentLevel.iconType === 'image' && currentLevel.iconUrl) {
            return <img src={currentLevel.iconUrl} alt="level" className={`w-5 h-5 ${hasGlow ? 'animate-pulse' : ''}`} style={isDivine ? {filter:'drop-shadow(0 0 8px #00d4ff) drop-shadow(0 0 16px rgba(0,212,255,0.5))'} : hasGlow ? {filter: 'drop-shadow(0 0 8px #ff6600)'} : {}} />;
        }
        return <span className="charisma-icon">{currentLevel.icon}</span>;
    };

    return (
        <div className={`charisma-container ${hasGlow ? 'has-glow' : ''} ${isDivine ? 'has-divine' : ''}`}
            style={isDivine ? {boxShadow:'0 0 20px rgba(0,212,255,0.25), 0 0 40px rgba(0,212,255,0.1)', border:'1px solid rgba(0,212,255,0.2)', borderRadius:'10px', padding:'4px'} : {}}>
            <div className="charisma-header">
                <span className="charisma-label">{renderIcon()}{t.charisma}</span>
                <span
                    className={`charisma-level-badge ${currentLevel.badge_class} ${hasGlow ? 'glow-badge' : ''}`}
                    style={isDivine
                        ? {boxShadow:'0 0 15px rgba(0,212,255,0.7)', border:'1.5px solid rgba(0,212,255,0.7)', color:'#00d4ff', background:'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(10,10,46,0.97))'}
                        : hasGlow ? {boxShadow: '0 0 15px ' + currentLevel.color} : {}}
                >
                    {renderIcon()} Lv.{currentLevel.level}
                    {isDivine && <span style={{fontSize:'8px', marginLeft:'2px', animation:'divine-aura 3s ease-in-out infinite'}}>✦</span>}
                </span>
            </div>
            <div className="charisma-bar-bg">
                <div className="charisma-bar-fill" style={{
                    width: `${progress}%`,
                    background: isDivine ? 'linear-gradient(90deg,#00d4ff,#7c3aed,#00d4ff)' : undefined,
                    backgroundSize: isDivine ? '200% 100%' : undefined,
                    animation: isDivine ? 'divine-bar-flow 3s linear infinite' : undefined,
                }} />
            </div>
            <div className="charisma-info">
                <span className="charisma-current" style={isDivine ? {color:'#00d4ff'} : {}}>{formatCharisma(charisma || 0)}</span>
                {isMaxLevel ? <span className="charisma-next" style={isDivine ? {color:'#00d4ff', fontWeight:'bold', textShadow:'0 0 8px rgba(0,212,255,0.8)'} : {color:'#ffd700', fontWeight:'bold'}}>{isDivine ? '✦ ' : ''}{t.maxLevel}</span> : nextLevel && showDetails && <span className="charisma-next">{t.nextLevel}: {formatCharisma(neededForNext)}</span>}
            </div>
        </div>
    );
};

// K/D Circle
const KDCircle = ({ wins, losses, lang }) => {
    const t = TRANSLATIONS[lang];
    const total = wins + losses;
    const ratio = total > 0 ? wins / total : 0;
    const percentage = Math.round(ratio * 100);
    const size = 100; const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (ratio * circumference);
    return (
        <div className="kd-circle-container" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="var(--secondary)" /><stop offset="100%" stopColor="var(--primary)" /></linearGradient></defs>
                <circle className="kd-circle-bg" cx={size/2} cy={size/2} r={radius} />
                <circle className="kd-circle-progress" cx={size/2} cy={size/2} r={radius} strokeDasharray={circumference} strokeDashoffset={offset} />
            </svg>
            <div className="kd-text"><span className="kd-rate">{percentage}%</span><span className="kd-label">{t.winRate}</span></div>
        </div>
    );
};

// Avatar With Frame
const AvatarWithFrame = ({ photoURL, equipped, size = 'md', onClick }) => {
    const sizeConfig = { sm: { wrapper: 52, avatar: 30, mask: 32 }, md: { wrapper: 72, avatar: 40, mask: 42 }, lg: { wrapper: 110, avatar: 60, mask: 62 }, xl: { wrapper: 140, avatar: 80, mask: 82 } };
    const config = sizeConfig[size] || sizeConfig.md;
    const frameItem = SHOP_ITEMS.frames.find(f => f.id === equipped?.frames);

    const renderFrame = () => {
        if (!frameItem) return null;
        if (frameItem.preview.startsWith('http')) {
            return (<div style={{ position: 'absolute', top: 0, left: 0, width: config.wrapper + 'px', height: config.wrapper + 'px', borderRadius: '50%', overflow: 'hidden', zIndex: 1 }}><img src={frameItem.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="frame" /><div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: config.mask + 'px', height: config.mask + 'px', borderRadius: '50%', background: 'var(--bg-dark)' }} /></div>);
        }
        return (<div style={{ position: 'absolute', top: 0, left: 0, width: config.wrapper + 'px', height: config.wrapper + 'px', borderRadius: '50%', background: frameItem.preview, zIndex: 1 }}><div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: config.mask + 'px', height: config.mask + 'px', borderRadius: '50%', background: 'var(--bg-dark)' }} /></div>);
    };

    return (
        <div style={{ position: 'relative', width: config.wrapper + 'px', height: config.wrapper + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: onClick ? 'pointer' : 'default', flexShrink: 0 }} onClick={onClick}>
            {renderFrame()}
            <img src={photoURL || `https://ui-avatars.com/api/?name=User&background=random`} style={{ width: config.avatar + 'px', height: config.avatar + 'px', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, border: '2px solid rgba(0,0,0,0.5)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} alt="avatar" />
        </div>
    );
};

// Render Title
const renderTitle = (titleId, lang) => {
    const titleItem = SHOP_ITEMS.titles.find(t => t.id === titleId);
    if (!titleItem) return null;
    if (titleItem.imageUrl && titleItem.imageUrl.trim() !== '') {
        // ✅ Image/GIF title: transparent, no background pill
        return (
            <div className="profile-title-image">
                <img src={titleItem.imageUrl} alt={titleItem.name_en}
                    style={{ maxWidth: '120px', maxHeight: '40px', objectFit: 'contain', background: 'transparent', imageRendering: 'auto' }} />
            </div>
        );
    }
    const name = lang === 'ar' ? titleItem.name_ar : titleItem.name_en;
    return <div className="profile-title-text"><span>{titleItem.preview}</span><span>{name}</span></div>;
};

// Render Badges
const renderBadges = (badgeIds, size = 28) => {
    if (!badgeIds) return null;
    const badgeArray = Array.isArray(badgeIds) ? badgeIds : [badgeIds];
    return (
        <div className="profile-badge-container">
            {badgeArray.slice(0, MAX_BADGES).map((badgeId, index) => {
                const badgeItem = SHOP_ITEMS.badges.find(b => b.id === badgeId);
                if (!badgeItem) return null;
                if (badgeItem.imageUrl && badgeItem.imageUrl.trim() !== '') {
                    // ✅ Image/GIF badge: transparent background, full display
                    return <img key={index} src={badgeItem.imageUrl} alt={badgeItem.name_en}
                        style={{ width: size, height: size, objectFit: 'contain', background: 'transparent', imageRendering: 'auto' }} />;
                }
                return <span key={index} className="profile-badge" style={{ fontSize: size + 'px' }}>{badgeItem.preview}</span>;
            })}
        </div>
    );
};

// ============================================================
// 🏷️  PLAYER NAME TAG — Avatar + Name + Badges + VIP + Title
// Use everywhere a player is shown (lobby, leaderboard, friends)
// Props:
//   player   — object with: photoURL|photo, displayName|name, equipped, vip
//   lang     — 'ar' | 'en'
//   size     — 'sm' (default) | 'md'
//   showStatus — optional online dot color string (e.g. '#4ade80')
// ============================================================
const PlayerNameTag = ({ player, lang, size = 'sm', showStatus = null }) => {
    if (!player) return null;

    const photoURL    = player.photoURL || player.photo || null;
    const name        = player.displayName || player.name || '—';
    const equipped    = player.equipped || {};
    const vipData     = player.vip || {};

    // VIP active check + level color
    const vipActive = vipData.isActive && vipData.expiresAt;
    const vipLevel  = vipActive ? getVIPLevelFromXP(vipData.xp || 0) : 0;
    const vipCfg    = vipLevel > 0 ? VIP_CONFIG.find(v => v.level === vipLevel) : null;
    const nameColor = vipCfg?.nameColor || null;

    // Title
    const titleId   = equipped.titles;
    const titleItem = titleId ? SHOP_ITEMS.titles.find(t => t.id === titleId) : null;
    const titleText = titleItem ? (lang === 'ar' ? titleItem.name_ar : titleItem.name_en) : null;

    // Badges (max 3)
    const badgeIds  = equipped.badges || [];

    const avatarSize = size === 'md' ? 'md' : 'sm';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: size === 'md' ? '10px' : '8px', minWidth: 0 }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
                <AvatarWithFrame photoURL={photoURL} equipped={equipped} size={avatarSize} />
                {showStatus && (
                    <div style={{
                        position: 'absolute', bottom: '-1px', right: '-1px',
                        width: '9px', height: '9px', borderRadius: '50%',
                        background: showStatus, border: '2px solid #0a0a14'
                    }} />
                )}
            </div>

            {/* Info stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>

                {/* Row 1: Name + VIP badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                    <span style={{
                        fontSize: size === 'md' ? '13px' : '12px',
                        fontWeight: 700,
                        color: nameColor || '#e2e8f0',
                        textShadow: nameColor ? `0 0 8px ${nameColor}66` : 'none',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        maxWidth: '120px',
                    }}>
                        {name}
                    </span>
                    {vipActive && vipCfg && (
                        <span style={{
                            fontSize: '8px', fontWeight: 900, lineHeight: 1,
                            padding: '1px 4px', borderRadius: '4px',
                            background: `${nameColor}22`,
                            color: nameColor, border: `1px solid ${nameColor}55`,
                            flexShrink: 0,
                        }}>
                            VIP{vipLevel}
                        </span>
                    )}
                </div>

                {/* Row 2: Badges (max 3) */}
                {badgeIds.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        {badgeIds.slice(0, 3).map((badgeId, idx) => {
                            const badge = SHOP_ITEMS.badges.find(b => b.id === badgeId);
                            if (!badge) return null;
                            return badge.imageUrl && badge.imageUrl.trim() !== '' ? (
                                <img key={idx} src={badge.imageUrl} alt=""
                                    style={{ width: 14, height: 14, objectFit: 'contain' }} />
                            ) : (
                                <span key={idx} style={{ fontSize: '11px', lineHeight: 1 }}>{badge.preview}</span>
                            );
                        })}
                    </div>
                )}

                {/* Row 3: Title with 🌐 */}
                {titleItem && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        {titleItem.imageUrl && titleItem.imageUrl.trim() !== '' ? (
                            <img src={titleItem.imageUrl} alt=""
                                style={{ maxWidth: '60px', maxHeight: '12px', objectFit: 'contain' }} />
                        ) : (
                            <span style={{ fontSize: '9px', color: '#a78bfa', lineHeight: 1 }}>
                                🌐 {titleItem.preview} {titleText}
                            </span>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

// Notification Dropdown
const NotificationDropdown = ({ show, onClose, notifications, onMarkRead, onClearAll, onNotificationClick, lang }) => {
    const t = TRANSLATIONS[lang];
    if (!show) return null;
    const unreadCount = notifications.filter(n => !n.read).length;
    const getNotificationIcon = (type) => { switch(type) { case 'friend_request': return '👥'; case 'gift': return '🎁'; case 'message': return '💬'; case 'friend_request_accepted': return '✅'; case 'achievement': return '🏆'; default: return '🔔'; } };

    return (
        <div className="notification-dropdown animate-pop">
            <div className="notification-dropdown-header">
                <span className="notification-dropdown-title">{t.notifications} {unreadCount > 0 && `(${unreadCount})`}</span>
                {notifications.length > 0 && <button onClick={onClearAll} className="notification-clear-all">{t.clearAll}</button>}
            </div>
            <div className="notification-list">
                {notifications.length === 0 ? <div className="notification-empty"><div className="text-3xl mb-2">🔔</div><p>{t.noNotifications}</p></div> : notifications.map(notif => (
                    <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`} onClick={() => { onMarkRead(notif.id); onNotificationClick(notif); onClose(); }}>
                        <span className="notification-item-icon">{getNotificationIcon(notif.type)}</span>
                        <div className="notification-item-content">
                            <div className="notification-item-title">{notif.fromName || 'System'}</div>
                            <div className="notification-item-message">{notif.message}</div>
                            <div className="notification-item-time">{formatTime(notif.timestamp)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 🎁 GIFT LOG COMPONENT - REDESIGNED WITH 3 TABS
