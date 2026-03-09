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

// Notification Toast
const NotificationToast = ({ message, onClose }) => {
    useEffect(() => { if (message) { const timer = setTimeout(() => { onClose(); }, 2500); return () => clearTimeout(timer); } }, [message, onClose]);
    if(!message) return null;
    return (
        <div className="notification-toast">
            <div className="notification-content">
                <span className="notification-icon">🎉</span>
                <span className="notification-text">{message}</span>
                <button onClick={onClose} className="notification-close">&times;</button>
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
