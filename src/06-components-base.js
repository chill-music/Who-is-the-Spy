(function() {
    var { useState, useEffect, useRef } = React;

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
    var GuestBanner = ({ lang }) => {
        var t = TRANSLATIONS[lang];
        return ( <div className="guest-banner"> <h3 className="guest-banner-title">{t.guestTitle}</h3> <p className="guest-banner-desc">{t.guestDesc}</p> </div> );
    };

    // Notification Toast — Modern sliding pill from top
    var NotificationToast = ({ message, onClose }) => {
        var [visible, setVisible] = useState(false);
        var [exiting, setExiting] = useState(false);

        useEffect(() => {
            if (message) {
                setExiting(false);
                setVisible(true);
                var hideTimer = setTimeout(() => {
                    setExiting(true);
                    setTimeout(() => { setVisible(false); onClose(); }, 350);
                }, 2500);
                return () => clearTimeout(hideTimer);
            }
        }, [message]);

        if (!message || !visible) return null;

        var emoji = message.match(/^(\p{Emoji})/u)?.[1] || '💬';
        var cleanMsg = message.replace(/^(\p{Emoji}\s?)/u, '');

        return (
            <div className={`modern-notification ${exiting ? 'exiting' : ''}`} 
                 onClick={() => { setExiting(true); setTimeout(() => { setVisible(false); onClose(); }, 350); }}>
                <div className="notification-accent"></div>
                <div className="notification-icon">{emoji}</div>
                <div className="notification-text">{cleanMsg}</div>
                <div className="notification-progress-bar">
                    <div className="notification-progress-fill"></div>
                </div>
            </div>
        );
    };

    // Modal Close Button
    var ModalCloseBtn = ({ onClose }) => (<button onClick={onClose} className="modal-close-btn" aria-label="Close">&times;</button>);

    // Charisma Display
    var CharismaDisplay = ({ charisma, lang, showDetails = true }) => {
        var t = TRANSLATIONS[lang];
        var { currentLevel, nextLevel } = getCharismaLevel(charisma || 0);
        var progress = getCharismaProgress(charisma || 0);
        var neededForNext = nextLevel ? nextLevel.threshold - (charisma || 0) : 0;
        var isMaxLevel = currentLevel.isMaxLevel;
        var hasGlow = currentLevel.hasGlow;
        var isDivine = currentLevel.isDivine; // ✨ Level 21 — Divine style

        var renderIcon = () => {
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

    // Avatar with Frame
    var AvatarWithFrame = ({ photoURL, equipped, size = 'md', onClick, banData, lang }) => {
        var sizeConfig = { sm: { wrapper: 52, avatar: 30, mask: 32 }, md: { wrapper: 72, avatar: 40, mask: 42 }, lg: { wrapper: 110, avatar: 60, mask: 62 }, xl: { wrapper: 140, avatar: 80, mask: 82 } };
        var config = sizeConfig[size] || sizeConfig.md;
        var frameItem = SHOP_ITEMS.frames.find(f => f.id === equipped?.frames);
        var showBan = banData?.isBanned && (
            !banData.expiresAt ||
            new Date() < (banData.expiresAt?.toDate?.() || new Date(banData.expiresAt))
        );
        var isImageURL = photoURL && (photoURL.startsWith('http') || photoURL.startsWith('data:') || photoURL.startsWith('/'));
        var avatarStyle = { width: config.avatar + 'px', height: config.avatar + 'px', borderRadius: '50%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, border: '2px solid rgba(0,0,0,0.5)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', filter: showBan ? 'grayscale(70%) brightness(0.5)' : 'none' };

        var renderFrame = () => {
            if (!frameItem) return null;
            if (frameItem.preview.startsWith('http')) {
                return (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: config.wrapper + 'px', height: config.wrapper + 'px', borderRadius: '50%', overflow: 'hidden', zIndex: 1 }}>
                        <img src={frameItem.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="frame" />
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: config.mask + 'px', height: config.mask + 'px', borderRadius: '50%', background: 'var(--bg-dark)' }} />
                    </div>
                );
            }
            return (
                <div style={{ position: 'absolute', top: 0, left: 0, width: config.wrapper + 'px', height: config.wrapper + 'px', borderRadius: '50%', background: frameItem.preview, zIndex: 1 }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: config.mask + 'px', height: config.mask + 'px', borderRadius: '50%', background: 'var(--bg-dark)' }} />
                </div>
            );
        };

        return (
            <div style={{ position: 'relative', width: config.wrapper + 'px', height: config.wrapper + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: onClick ? 'pointer' : 'default', flexShrink: 0 }} onClick={onClick}>
                {renderFrame()}
                {isImageURL ? (
                    <img src={photoURL} style={{ ...avatarStyle, objectFit: 'cover' }} alt="avatar"
                        onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=User&background=random`; }} />
                ) : photoURL ? (
                    <div style={{ ...avatarStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(30,30,60,0.85)', fontSize: Math.round(config.avatar * 0.52) + 'px', userSelect: 'none' }}>
                        {photoURL}
                    </div>
                ) : (
                    <img src={`https://ui-avatars.com/api/?name=User&background=random`} style={{ ...avatarStyle, objectFit: 'cover' }} alt="avatar" />
                )}
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

    // Notification Dropdown
    var NotificationDropdown = ({ show, onClose, notifications, onMarkRead, onClearAll, onNotificationClick, lang }) => {
        var t = TRANSLATIONS[lang];
        if (!show) return null;
        var unreadCount = notifications.filter(n => !n.read).length;
        var getNotificationIcon = (type) => { switch(type) { case 'friend_request': return '👥'; case 'gift': return '🎁'; case 'message': return '💬'; case 'friend_request_accepted': return '✅'; case 'achievement': return '🏆'; default: return '🔔'; } };

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

    // MiniProfilePopup
    var MiniProfilePopup = ({
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
        var [showMenu, setShowMenu] = useState(false);
        var [bannerErr, setBannerErr] = useState(false);

        if (!profile) return null;

        var isSelf  = profile.uid === currentUID;
        var hasMenu = onReport || onBlock || onUnblock || onOpenProfile;
        var vipColor = profile.vipCfg?.nameColor || null;

        var charismaLevel = (() => {
            if (typeof getCharismaLevel === 'undefined') return null;
            var { currentLevel: lvl } = getCharismaLevel(profile.charisma || 0);
            return lvl || null;
        })();

        var familySignEl = (() => {
            if (!profile.familyTag) return null;
            var signImgURL = getFamilySignURL(profile);
            var tag = profile.familyTag;
            var sc  = profile.familySignColor || '#00f2ff';
            var hg  = (profile.familySignLevel || 0) >= 4;
            
            if (signImgURL) {
                var imgW = 44 + (tag.length * 6);
                var imgH = Math.round(imgW * 0.55);
                var fs   = tag.length <= 3 ? 11 : tag.length === 4 ? 10 : 9;
                
                return (
                    <div className={`family-sign-layered ${hg ? 'family-sign-glow' : ''}`} 
                         style={{ width: `${imgW}px`, height: `${imgH}px`, '--sign-color': sc }}>
                        <img src={signImgURL} className="family-sign-bg" alt="" />
                        <span className="family-sign-tag" style={{ fontSize: `${fs}px` }}>{tag}</span>
                    </div>
                );
            }
            return <span style={{fontSize:'10px',fontWeight:800,color:sc,background:`${sc}22`,border:`1px solid ${sc}44`,borderRadius:'6px',padding:'2px 8px'}}>{tag}</span>;
        })();

        var nameStyle = vipColor
            ? { background: `linear-gradient(90deg, ${vipColor}, #fff, ${vipColor})`, backgroundSize:'200%', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', fontWeight:900, fontSize:'17px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'170px', cursor:'pointer' }
            : { fontSize:'17px', fontWeight:900, color:'#00f2ff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'170px', cursor:'pointer', textDecoration:'underline dotted rgba(0,242,255,0.4)' };

        var hasBanner = profile.bannerUrl && !bannerErr;

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
                        border:`1px solid ${vipColor ? vipColor+'44' : 'rgba(255,255,255,0.1)'}`,
                        boxShadow:`0 28px 70px rgba(0,0,0,0.95)${vipColor ? `, 0 0 30px ${vipColor}22` : ''}`,
                        position:'relative',
                    }} onClick={e => e.stopPropagation()}>

                        <div style={{
                            position:'relative', height:'130px',
                            background: hasBanner ? 'transparent' : 'linear-gradient(135deg,#0a0a2e,#1a1040,#0d1a3a)',
                        }}>
                            {hasBanner && (
                                <img
                                    src={profile.bannerUrl}
                                    alt=""
                                    onError={() => setBannerErr(true)}
                                    style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}
                                />
                            )}
                            <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(0,0,0,0.1) 0%,rgba(13,13,31,0.7) 100%)' }} />

                            {hasMenu && (
                                <div style={{ position:'absolute', top:'10px', right:'10px', zIndex:3 }}>
                                    <div style={{ position:'relative' }}>
                                        <button onClick={e => { e.stopPropagation(); setShowMenu(v => !v); }}
                                            style={{ background:'rgba(0,0,0,0.55)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'50%', width:'30px', height:'30px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'white', fontSize:'17px', fontWeight:900, lineHeight:1 }}>
                                            ⋮
                                        </button>
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

                            {(profile.coupleRingEmoji || profile.coupleRingImageUrl) && (
                                <div style={{ position:'absolute', bottom:'8px', right:'12px', zIndex:2 }}>
                                    {profile.coupleRingImageUrl
                                        ? <img src={profile.coupleRingImageUrl} alt="" style={{width:'28px',height:'28px',objectFit:'contain',filter:'drop-shadow(0 0 6px rgba(255,80,150,0.7))'}}/>
                                        : <span style={{fontSize:'22px',filter:'drop-shadow(0 0 6px rgba(255,80,150,0.7))'}}>{profile.coupleRingEmoji}</span>}
                                </div>
                            )}
                        </div>

                        {(profile.topBadges || []).length > 0 && (
                            <div style={{ position:'absolute', top:'100px', right:'12px', display:'flex', gap:'5px', zIndex:3 }}>
                                {(profile.topBadges || []).map((badge, i) => (
                                    <div key={i} title={badge.title_en || badge.name_en || ''} style={{ width:'28px', height:'28px', borderRadius:'8px', background:'rgba(13,13,31,0.85)', border:'1px solid rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', backdropFilter:'blur(6px)' }}>
                                        {badge.imageUrl ? <img src={badge.imageUrl} alt="" style={{width:'20px',height:'20px',objectFit:'contain'}}/> : (badge.icon || '🏅')}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ padding:'0 14px 16px', position:'relative' }}>
                            <div style={{ display:'flex', alignItems:'flex-end', gap:'12px', marginTop:'-36px', marginBottom:'10px' }}>
                                <div onClick={() => { onClose(); if(onOpenProfile) onOpenProfile(profile.uid); }}
                                    style={{ position:'relative', width:'76px', height:'76px', borderRadius:'50%',
                                        border: vipColor ? `3px solid ${vipColor}` : '3px solid #0d0d1f',
                                        overflow:'hidden', background:'#1a1a2e',
                                        boxShadow: vipColor ? `0 0 16px ${vipColor}88, 0 4px 16px rgba(0,0,0,0.7)` : '0 4px 16px rgba(0,0,0,0.7)',
                                        flexShrink:0, zIndex:2, cursor:'pointer' }}>
                                    {profile.photo
                                        ? <img src={profile.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                                        : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#4f46e5,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'30px'}}>😎</div>}
                                    {profile.equippedFrame && (
                                        <img
                                            src={profile.equippedFrame}
                                            alt=""
                                            onError={e => { e.target.style.display='none'; }}
                                            style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',pointerEvents:'none'}}
                                        />
                                    )}
                                </div>

                                <div style={{ flex:1, paddingBottom:'6px', minWidth:0 }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'4px', flexWrap:'wrap' }}
                                        onClick={() => { onClose(); if(onOpenProfile) onOpenProfile(profile.uid); }}>
                                        {profile.vipCfg && (
                                            <span style={{ fontSize:'8px', fontWeight:900, background:vipColor, color:'#000', padding:'1px 4px', borderRadius:'3px', flexShrink:0, display:'inline-flex', alignItems:'center', gap:'2px', cursor:'pointer' }}>
                                                {profile.vipCfg.badgeImageUrl && <img src={profile.vipCfg.badgeImageUrl} alt="" style={{height:'10px',objectFit:'contain'}}/>}
                                                VIP{profile.vipLevel}
                                            </span>
                                        )}
                                        <span style={nameStyle}>{profile.name}</span>
                                        {profile.gender && <span style={{fontSize:'15px',lineHeight:1,flexShrink:0}}>{profile.gender==='male'?'♂️':'♀️'}</span>}
                                    </div>

                                    <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap', marginBottom:'4px' }}>
                                        {charismaLevel && (
                                            <div style={{ display:'inline-flex', alignItems:'center', gap:'3px', borderRadius:'6px', padding:'2px 5px',
                                                background: charismaLevel.isDivine?'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(10,10,46,0.97))':charismaLevel.hasGlow?`${charismaLevel.color}18`:'rgba(255,255,255,0.06)',
                                                border: charismaLevel.isDivine?'1px solid rgba(0,212,255,0.4)':charismaLevel.hasGlow?`1px solid ${charismaLevel.color}55`:'1px solid rgba(255,255,255,0.1)',
                                                flexShrink:0 }}>
                                                {charismaLevel.iconType === 'image' && charismaLevel.iconUrl
                                                    ? <img src={charismaLevel.iconUrl} alt="" style={{width:'14px',height:'14px',borderRadius:charismaLevel.isDivine?'50%':'0',objectFit:'cover'}}/>
                                                    : <span style={{fontSize:'12px'}}>{charismaLevel.icon}</span>}
                                                <span style={{fontSize:'10px',fontWeight:800,color:charismaLevel.isDivine?'#00d4ff':charismaLevel.color}}>Lv.{charismaLevel.level}</span>
                                            </div>
                                        )}
                                        {familySignEl}
                                    </div>

                                    {profile.customId && (
                                        <div style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'#6b7280' }}>
                                            {profile.vipCfg?.idBeforeImageUrl
                                                ? <><img src={profile.vipCfg.idBeforeImageUrl} alt="" style={{height:'14px',objectFit:'contain',flexShrink:0}}/><span>{profile.customId}</span></>
                                                : <span>ID:{profile.customId}</span>}
                                            <button onClick={() => navigator.clipboard?.writeText(profile.customId)}
                                                style={{background:'none',border:'none',cursor:'pointer',fontSize:'12px',color:'#4b5563',padding:'0 2px',lineHeight:1}}>⎘</button>
                                        </div>
                                    )}
                                    {profile.loading && <div style={{fontSize:'11px',color:'#4b5563',fontStyle:'italic'}}>⏳</div>}
                                </div>
                            </div>

                            <div style={{ display:'flex', borderTop:'1px solid rgba(255,255,255,0.07)', borderBottom:'1px solid rgba(255,255,255,0.07)', margin:'0 0 14px', padding:'10px 0' }}>
                                <div style={{flex:1,textAlign:'center'}}>
                                    <div style={{fontSize:'20px',fontWeight:900,color:'white',lineHeight:1}}>{profile.gamesPlayed ?? 0}</div>
                                    <div style={{fontSize:'10px',color:'#6b7280',marginTop:'3px'}}>{lang==='ar'?'مباريات':'Games'}</div>
                                </div>
                                <div style={{width:'1px',background:'rgba(255,255,255,0.08)',margin:'4px 0'}}/>
                                <div style={{flex:1,textAlign:'center'}}>
                                    {(() => {
                                        var r = profile.winRate ?? 0;
                                        var c = r >= 70 ? '#10b981' : r >= 50 ? '#facc15' : '#f97316';
                                        return <>
                                            <div style={{fontSize:'20px',fontWeight:900,color:c,lineHeight:1}}>{r}%</div>
                                            <div style={{fontSize:'10px',color:'#6b7280',marginTop:'3px'}}>{lang==='ar'?'نسبة الفوز':'Win Rate'}</div>
                                        </>;
                                    })()}
                                </div>
                            </div>

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

    // Attach to window
    window.ErrorBoundary = ErrorBoundary;
    window.GuestBanner = GuestBanner;
    window.NotificationToast = NotificationToast;
    window.ModalCloseBtn = ModalCloseBtn;
    window.CharismaDisplay = CharismaDisplay;
    window.AvatarWithFrame = AvatarWithFrame;
    window.AvatarComponent = AvatarWithFrame; // Alias: legacy name for the same component
    window.NotificationDropdown = NotificationDropdown;
    window.MiniProfilePopup = MiniProfilePopup;

})();
