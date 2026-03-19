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
            zIndex: Z.TOOLTIP,
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
            return <img src={currentLevel.iconUrl} alt="level" className={`w-5 h-5 ${hasGlow ? 'animate-pulse' : ''}`} style={isDivine ? {borderRadius:'50%', objectFit:'cover', filter:'drop-shadow(0 0 8px #00d4ff) drop-shadow(0 0 16px rgba(0,212,255,0.5))'} : hasGlow ? {filter: 'drop-shadow(0 0 8px #ff6600)'} : {}} />;
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
// ── KDCircle removed (dead code — never used; WinRateCircleV11 in 15-profile.js is used instead)
// ── renderTitle removed (dead code — never called anywhere in project)
// ── renderBadges removed (dead code — never called anywhere in project)

// Notification Dropdown
const AvatarWithFrame = ({ photoURL, equipped, size = 'md', onClick, banData, lang }) => {
    const sizeConfig = { sm: { wrapper: 52, avatar: 30, mask: 32 }, md: { wrapper: 72, avatar: 40, mask: 42 }, lg: { wrapper: 110, avatar: 60, mask: 62 }, xl: { wrapper: 140, avatar: 80, mask: 82 } };
    const config = sizeConfig[size] || sizeConfig.md;
    const frameItem = SHOP_ITEMS.frames.find(f => f.id === equipped?.frames);
    const showBan = banData?.isBanned && (
        !banData.expiresAt ||
        new Date() < (banData.expiresAt?.toDate?.() || new Date(banData.expiresAt))
    );
    // ✅ FIX: detect if photoURL is an image URL or an emoji/text
    const isImageURL = photoURL && (photoURL.startsWith('http') || photoURL.startsWith('data:') || photoURL.startsWith('/'));
    const avatarStyle = { width: config.avatar + 'px', height: config.avatar + 'px', borderRadius: '50%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, border: '2px solid rgba(0,0,0,0.5)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', filter: showBan ? 'grayscale(70%) brightness(0.5)' : 'none' };

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
            {isImageURL ? (
                /* ✅ Real image URL (includes animated GIFs) */
                <img src={photoURL} style={{ ...avatarStyle, objectFit: 'cover' }} alt="avatar"
                    onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=User&background=random`; }} />
            ) : photoURL ? (
                /* ✅ Emoji or text avatar */
                <div style={{ ...avatarStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(30,30,60,0.85)', fontSize: Math.round(config.avatar * 0.52) + 'px', userSelect: 'none' }}>
                    {photoURL}
                </div>
            ) : (
                /* ✅ Fallback: ui-avatars */
                <img src={`https://ui-avatars.com/api/?name=User&background=random`} style={{ ...avatarStyle, objectFit: 'cover' }} alt="avatar" />
            )}
            {/* 🚫 Ban Overlay */}
            {showBan && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: config.avatar + 'px', height: config.avatar + 'px',
                    borderRadius: '50%', zIndex: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(220,0,0,0.55)',
                    border: '2px solid rgba(255,50,50,0.9)',
                    flexDirection: 'column', gap: '0px',
                }}>
                    <span style={{ fontSize: config.avatar > 35 ? '9px' : '7px', fontWeight: 900, color: '#fff', textAlign: 'center', lineHeight: 1.1, textShadow: '0 1px 3px rgba(0,0,0,0.8)', letterSpacing: '-0.2px' }}>
                        {lang === 'ar' ? 'محظور' : 'BANNED'}
                    </span>
                </div>
            )}
        </div>
    );
};

// ── renderTitle removed (dead code — never called anywhere in project)
// ── renderBadges removed (dead code — never called anywhere in project)

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

// ════════════════════════════════════════════════════════════
// 👤 MiniProfilePopup — Unified Mini Profile Component
// ════════════════════════════════════════════════════════════
// الاستخدام الموحد بدلاً من 4 نسخ مختلفة:
//   13-modal-chat / 14-modals-misc / 09-components-user / 19-family
//
// Props:
//   profile      — بيانات اليوزر (من fetchMiniProfileData)
//   onClose      — إغلاق البوبأب
//   currentUID   — uid المستخدم الحالي
//   lang         — 'ar' | 'en'
//   onOpenProfile(uid) — فتح البروفايل الكامل
//   onSendGift(profile) — إرسال هدية (اختياري — null = مخفي)
//   onReport()   — تقرير (اختياري — null = مخفي)
//   onBlock()    — حظر (اختياري — null = مخفي)
//   onUnblock()  — إلغاء حظر (اختياري — null = مخفي)
//   isBlocked    — هل اليوزر محظور حالياً (اختياري)
//   zIndex       — zIndex للـ overlay (افتراضي Z.OVERLAY)
// ════════════════════════════════════════════════════════════
const MiniProfilePopup = ({
    profile,
    onClose,
    currentUID,
    lang,
    onOpenProfile,
    onSendGift   = null,
    onReport     = null,
    onBlock      = null,
    onUnblock    = null,
    isBlocked    = false,
    zIndex       = Z.OVERLAY,
}) => {
    const [showMenu, setShowMenu] = useState(false);

    if (!profile) return null;

    const isSelf    = profile.uid === currentUID;
    const hasMenu   = onReport || onBlock || onUnblock || onOpenProfile;

    return (
        <PortalModal>
            <div style={{
                position:'fixed', inset:0, zIndex,
                background:'rgba(0,0,0,0.78)',
                display:'flex', alignItems:'center', justifyContent:'center',
                padding:'16px',
            }} onClick={() => { setShowMenu(false); onClose(); }}>
                <div style={{
                    width:'100%', maxWidth:'min(370px, calc(100vw - 20px))',
                    borderRadius:'24px', overflow:'hidden',
                    background:'#0d0d1f',
                    border:'1px solid rgba(255,255,255,0.1)',
                    boxShadow:'0 28px 70px rgba(0,0,0,0.95)',
                    position:'relative',
                }} onClick={e => e.stopPropagation()}>

                    {/* ── Banner ── */}
                    <div style={{
                        position:'relative', height:'120px',
                        background: profile.bannerUrl ? 'transparent' : 'linear-gradient(135deg,#0a0a2e,#1a1040,#0d1a3a)',
                        backgroundImage: profile.bannerUrl ? `url(${profile.bannerUrl})` : undefined,
                        backgroundSize:'cover', backgroundPosition:'center', backgroundRepeat:'no-repeat',
                    }}>
                        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(0,0,0,0.18) 0%,rgba(13,13,31,0.65) 100%)' }} />

                        {/* ⋮ Menu */}
                        {hasMenu && (
                            <div style={{ position:'absolute', top:'10px', right:'10px', zIndex:3 }}>
                                <div style={{ position:'relative' }}>
                                    <button
                                        onClick={e => { e.stopPropagation(); setShowMenu(v => !v); }}
                                        style={{ background:'rgba(0,0,0,0.55)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:'50%', width:'30px', height:'30px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'white', fontSize:'17px', fontWeight:900, lineHeight:1 }}
                                    >⋮</button>
                                    {showMenu && (
                                        <div style={{ position:'absolute', top:'34px', right:0, background:'linear-gradient(160deg,#0e0e22,#13122a)', border:'1px solid rgba(255,255,255,0.13)', borderRadius:'12px', padding:'5px', minWidth:'160px', boxShadow:'0 10px 30px rgba(0,0,0,0.9)', zIndex:5 }}
                                            onClick={e => e.stopPropagation()}>
                                            {onOpenProfile && (
                                                <button onClick={() => { setShowMenu(false); onClose(); onOpenProfile(profile.uid); }}
                                                    style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', fontWeight:700, color:'#00f2ff', textAlign:'right' }}
                                                    onMouseEnter={e => e.currentTarget.style.background='rgba(0,242,255,0.08)'}
                                                    onMouseLeave={e => e.currentTarget.style.background='none'}>
                                                    👤 {lang==='ar'?'فتح البروفايل':'Open Profile'}
                                                </button>
                                            )}
                                            {onReport && !isSelf && (
                                                <button onClick={() => { setShowMenu(false); onClose(); onReport(profile); }}
                                                    style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', fontWeight:700, color:'#f87171', textAlign:'right' }}
                                                    onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                                                    onMouseLeave={e => e.currentTarget.style.background='none'}>
                                                    🚨 {lang==='ar'?'إبلاغ':'Report'}
                                                </button>
                                            )}
                                            {(onBlock || onUnblock) && !isSelf && (
                                                <button onClick={async () => { setShowMenu(false); onClose(); isBlocked ? await onUnblock?.() : await onBlock?.(); }}
                                                    style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', fontWeight:700, color: isBlocked?'#4ade80':'#f59e0b', textAlign:'right' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = isBlocked?'rgba(74,222,128,0.1)':'rgba(245,158,11,0.1)'}
                                                    onMouseLeave={e => e.currentTarget.style.background='none'}>
                                                    {isBlocked ? `✅ ${lang==='ar'?'إلغاء الحظر':'Unblock'}` : `🚫 ${lang==='ar'?'حظر':'Block'}`}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 💍 Couple ring */}
                        {(profile.coupleRingEmoji || profile.coupleRingImageUrl) && (
                            <div style={{ position:'absolute', top:'48px', right:'12px', zIndex:2 }}>
                                {profile.coupleRingImageUrl
                                    ? <img src={profile.coupleRingImageUrl} alt="" style={{width:'28px',height:'28px',objectFit:'contain',filter:'drop-shadow(0 0 6px rgba(255,80,150,0.7))'}}/>
                                    : <span style={{fontSize:'22px',filter:'drop-shadow(0 0 6px rgba(255,80,150,0.7))'}}>{profile.coupleRingEmoji}</span>}
                            </div>
                        )}
                    </div>

                    {/* ── Top Badges (right side) ── */}
                    {(profile.topBadges || []).length > 0 && (
                        <div style={{ display:'flex', gap:'6px', padding:'8px 16px 0', justifyContent:'flex-end' }}>
                            {(profile.topBadges || []).map((badge, i) => (
                                <div key={i} title={badge.title_en || badge.name_en || ''} style={{ width:'26px', height:'26px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>
                                    {badge.imageUrl ? <img src={badge.imageUrl} alt="" style={{width:'18px',height:'18px',objectFit:'contain'}}/> : (badge.icon || '🏅')}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Profile section ── */}
                    <div style={{ padding:(profile.topBadges||[]).length > 0 ? '6px 16px 20px' : '0 16px 20px', position:'relative' }}>
                        <div style={{ display:'flex', alignItems:'flex-end', gap:'12px', marginTop:(profile.topBadges||[]).length > 0 ? '-48px' : '-36px', marginBottom:'14px' }}>

                            {/* Avatar */}
                            <div onClick={() => { onClose(); if(onOpenProfile) onOpenProfile(profile.uid); }}
                                style={{ position:'relative', width:'72px', height:'72px', borderRadius:'50%', border: profile.vipCfg ? `3px solid ${profile.vipCfg.nameColor}` : '3px solid #0d0d1f', overflow:'hidden', background:'#1a1a2e', boxShadow: profile.vipCfg ? `0 0 14px ${profile.vipCfg.nameColor}88, 0 4px 16px rgba(0,0,0,0.6)` : '0 4px 16px rgba(0,0,0,0.6)', flexShrink:0, zIndex:2, cursor:'pointer' }}>
                                {profile.photo
                                    ? <img src={profile.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                                    : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#4f46e5,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px'}}>😎</div>}
                                {/* Equipped Frame overlay */}
                                {profile.equippedFrame && (
                                    <img src={profile.equippedFrame} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',pointerEvents:'none'}}/>
                                )}
                            </div>

                            {/* Name / info column */}
                            <div style={{ flex:1, paddingBottom:'4px', minWidth:0 }}>
                                <div onClick={() => { onClose(); if(onOpenProfile) onOpenProfile(profile.uid); }}
                                    style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px', cursor:'pointer', flexWrap:'wrap' }}>
                                    {profile.vipCfg && (
                                        <span style={{ fontSize:'8px', fontWeight:900, background:profile.vipCfg.nameColor, color:'#000', padding:'1px 4px', borderRadius:'3px', flexShrink:0, display:'inline-flex', alignItems:'center', gap:'2px' }}>
                                            {profile.vipCfg.badgeImageUrl && <img src={profile.vipCfg.badgeImageUrl} alt="" style={{height:'10px',objectFit:'contain'}}/>}
                                            VIP{profile.vipLevel}
                                        </span>
                                    )}
                                    <span style={{ fontSize:'16px', fontWeight:900, color:'#00f2ff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textDecoration:'underline dotted rgba(0,242,255,0.4)' }}>{profile.name}</span>
                                    {profile.gender && <span style={{fontSize:'16px',lineHeight:1}}>{profile.gender==='male'?'♂️':'♀️'}</span>}

                                    {/* Charisma level badge */}
                                    {(() => {
                                        if (typeof getCharismaLevel === 'undefined') return null;
                                        const { currentLevel: lvlData } = getCharismaLevel(profile.charisma || 0);
                                        if (!lvlData) return null;
                                        const isDivine = lvlData.isDivine;
                                        const hasGlow  = lvlData.hasGlow;
                                        return (
                                            <div style={{ display:'inline-flex', alignItems:'center', gap:'3px', borderRadius:'6px', padding:'2px 5px', background: isDivine?'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(10,10,46,0.97))':hasGlow?`${lvlData.color}18`:'rgba(255,255,255,0.06)', border: isDivine?'1px solid rgba(0,212,255,0.4)':hasGlow?`1px solid ${lvlData.color}55`:'1px solid rgba(255,255,255,0.1)', boxShadow: isDivine?'0 0 10px rgba(0,212,255,0.25)':hasGlow?`0 0 8px ${lvlData.color}44`:'none', flexShrink:0 }}>
                                                {lvlData.iconType === 'image' && lvlData.iconUrl
                                                    ? <img src={lvlData.iconUrl} alt="" style={{width:'16px',height:'16px',borderRadius:isDivine?'50%':'0',objectFit:'cover'}}/>
                                                    : <span style={{fontSize:'13px'}}>{lvlData.icon}</span>}
                                                <span style={{fontSize:'10px',fontWeight:800,color:isDivine?'#00d4ff':lvlData.color}}>Lv.{lvlData.level}</span>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Family Sign */}
                                {profile.familyTag && (() => {
                                    const signImgURL = getFamilySignURL(profile);
                                    const tag = profile.familyTag;
                                    if (signImgURL) {
                                        const imgW = 44 + (tag.length * 6);
                                        const imgH = Math.round(imgW * 0.55);
                                        const fs   = tag.length <= 3 ? 11 : tag.length === 4 ? 10 : 9;
                                        const sc   = profile.familySignColor || '#00f2ff';
                                        const hg   = (profile.familySignLevel || 0) >= 4;
                                        return (
                                            <span style={{ position:'relative', display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0, width:`${imgW}px`, height:`${imgH}px`, filter:hg?`drop-shadow(0 0 6px ${sc}cc)`:'none', marginBottom:'4px' }}>
                                                <img src={signImgURL} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain'}}/>
                                                <span style={{position:'relative',zIndex:1,fontSize:`${fs}px`,fontWeight:900,fontStyle:'italic',letterSpacing:'1.5px',color:'#fff',textShadow:'0 0 6px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.7)'}}>{tag}</span>
                                            </span>
                                        );
                                    }
                                    return <span style={{fontSize:'10px',fontWeight:800,color:'#00f2ff',background:'rgba(0,242,255,0.15)',border:'1px solid rgba(0,242,255,0.3)',borderRadius:'6px',padding:'2px 8px'}}>{tag}</span>;
                                })()}

                                {/* ID row */}
                                {profile.customId && (
                                    <div style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'#6b7280' }}>
                                        {profile.vipCfg?.idBeforeImageUrl
                                            ? <><img src={profile.vipCfg.idBeforeImageUrl} alt="" style={{height:'16px',objectFit:'contain',flexShrink:0}}/><span>{profile.customId}</span></>
                                            : <span>ID: {profile.customId}</span>}
                                        <button onClick={() => navigator.clipboard?.writeText(profile.customId)}
                                            style={{background:'none',border:'none',cursor:'pointer',fontSize:'12px',color:'#4b5563',padding:'0 2px',lineHeight:1}}>⎘</button>
                                    </div>
                                )}
                                {profile.loading && <div style={{fontSize:'11px',color:'#4b5563',fontStyle:'italic'}}>⏳</div>}
                            </div>
                        </div>

                        {/* Stats row */}
                        <div style={{ display:'flex', borderTop:'1px solid rgba(255,255,255,0.07)', borderBottom:'1px solid rgba(255,255,255,0.07)', margin:'0 0 16px', padding:'12px 0' }}>
                            <div style={{flex:1,textAlign:'center'}}>
                                <div style={{fontSize:'22px',fontWeight:900,color:'white',lineHeight:1}}>{profile.gamesPlayed ?? 0}</div>
                                <div style={{fontSize:'10px',color:'#6b7280',marginTop:'3px'}}>{lang==='ar'?'مباريات':'Games'}</div>
                            </div>
                            <div style={{width:'1px',background:'rgba(255,255,255,0.08)',margin:'4px 0'}}/>
                            <div style={{flex:1,textAlign:'center'}}>
                                {(() => {
                                    const r = profile.winRate ?? 0;
                                    const c = r >= 70 ? '#10b981' : r >= 50 ? '#facc15' : '#f97316';
                                    return <>
                                        <div style={{fontSize:'22px',fontWeight:900,color:c,lineHeight:1}}>{r}%</div>
                                        <div style={{fontSize:'10px',color:'#6b7280',marginTop:'3px'}}>{lang==='ar'?'نسبة الفوز':'Win Rate'}</div>
                                    </>;
                                })()}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{display:'flex',gap:'10px'}}>
                            {!isSelf && !profile.isFriend && (
                                <button onClick={async () => {
                                    try { await usersCollection.doc(profile.uid).update({ friendRequests: firebase.firestore.FieldValue.arrayUnion(currentUID) }); } catch(e) {}
                                }}
                                style={{flex:1,padding:'11px',borderRadius:'50px',background:'linear-gradient(135deg,rgba(0,242,255,0.22),rgba(0,180,255,0.18))',border:'1px solid rgba(0,242,255,0.4)',color:'#00f2ff',fontSize:'13px',fontWeight:800,cursor:'pointer'}}>
                                    {lang==='ar'?'إضافة':'Add'}
                                </button>
                            )}
                            {!isSelf && profile.isFriend && (
                                <div style={{flex:1,padding:'11px',borderRadius:'50px',background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.3)',color:'#10b981',fontSize:'13px',fontWeight:800,textAlign:'center'}}>
                                    ✅ {lang==='ar'?'صديق':'Friends'}
                                </div>
                            )}
                            {!isSelf && onSendGift && (
                                <button onClick={() => { onClose(); onSendGift(profile); }}
                                    style={{flex:1,padding:'11px',borderRadius:'50px',background:'linear-gradient(135deg,rgba(255,80,150,0.26),rgba(236,72,153,0.18))',border:'1px solid rgba(255,80,150,0.4)',color:'#f472b6',fontSize:'13px',fontWeight:800,cursor:'pointer'}}>
                                    {lang==='ar'?'إرسال هدية':'Send Gift'}
                                </button>
                            )}
                            {isSelf && (
                                <button onClick={() => { onClose(); if(onOpenProfile) onOpenProfile(profile.uid); }}
                                    style={{flex:1,padding:'11px',borderRadius:'50px',background:'rgba(0,242,255,0.08)',border:'1px solid rgba(0,242,255,0.25)',color:'#00f2ff',fontSize:'13px',fontWeight:700,cursor:'pointer',textAlign:'center'}}>
                                    👤 {lang==='ar'?'بروفايلي':'My Profile'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PortalModal>
    );
};

