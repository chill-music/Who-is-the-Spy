const WinRateCircleV11 = ({ wins, losses, lang }) => {
    const total = wins + losses;
    const rate = total > 0 ? Math.round((wins / total) * 100) : 0;

    const getColor = (percentage) => {
        if (percentage >= 70) return '#10b981';
        if (percentage >= 50) return '#facc15';
        if (percentage >= 30) return '#f97316';
        return '#ef4444';
    };

    const gradient = `conic-gradient(${getColor(rate)} ${rate}%, #1f2937 ${rate}%)`;

    return (
        <div className="profile-winrate-circle" style={{ background: gradient, width:'64px', height:'64px', flexShrink:0 }}>
            <div className="profile-winrate-content">
                <span className="profile-winrate-value" style={{ color: getColor(rate), fontSize:'13px' }}>{rate}%</span>
                <span className="profile-winrate-label" style={{fontSize:'7px'}}>{lang === 'ar' ? 'معدل' : 'Win%'}</span>
            </div>
        </div>
    );
};

// 🎁 GIFT WALL COMPONENT V11 - IMPROVED WITH SENDER PHOTOS
const GiftWallV11 = ({ gifts, lang, onSendGiftToSelf, isOwnProfile, userData, onOpenProfile }) => {
    const [activeTab, setActiveTab] = useState('wall');
    const totalGifts = gifts?.length || 0;
    const [selectedGiftDetail, setSelectedGiftDetail] = useState(null);
    const [showAllGifts, setShowAllGifts] = useState(false);
    const GIFTS_LIMIT = 24;

    // Calculate gift counts and last sender info
    const giftData = useMemo(() => {
        const counts = {};
        const lastSenders = {};

        gifts?.forEach(g => {
            counts[g.giftId] = (counts[g.giftId] || 0) + 1;
            // Keep track of the most recent sender for each gift type
            if (!lastSenders[g.giftId]) {
                lastSenders[g.giftId] = {
                    name: g.senderName,
                    photo: g.senderPhoto,
                    uid: g.senderId
                };
            }
        });

        return { counts, lastSenders };
    }, [gifts]);

    const allRegular = SHOP_ITEMS.gifts || [];
    const allVIP     = SHOP_ITEMS.gifts_vip || [];
    const allGifts   = [...allRegular, ...allVIP];
    const displayGifts = showAllGifts ? allGifts : allGifts.slice(0, GIFTS_LIMIT);
    const hasMoreGifts = allGifts.length > GIFTS_LIMIT;

    return (
        <div className="profile-gift-section">
            <div className="profile-gift-header">
                <div className="profile-gift-tabs">
                    <button
                        className={`profile-gift-tab ${activeTab === 'wall' ? 'active' : ''}`}
                        onClick={() => setActiveTab('wall')}
                    >
                        {lang === 'ar' ? '🎁 الجدار' : '🎁 Wall'}
                    </button>
                    <button
                        className={`profile-gift-tab ${activeTab === 'log' ? 'active' : ''}`}
                        onClick={() => setActiveTab('log')}
                    >
                        {lang === 'ar' ? '📬 السجل' : '📬 Log'}
                    </button>
                </div>
                <span className="profile-gift-count">{totalGifts} {lang === 'ar' ? 'هدية' : 'gifts'}</span>
            </div>

            {activeTab === 'wall' && (
                <div className="profile-gift-grid">
                    {displayGifts.map((gift) => {
                        const count = giftData.counts[gift.id] || 0;
                        const unlocked = count > 0;
                        const lastSender = giftData.lastSenders[gift.id];

                        const rKey = getGiftRarity(gift.cost);
                        const rarity = RARITY_CONFIG[rKey];
                        const isVIPGift = gift.type === 'gifts_vip';
                        const vipCfg    = isVIPGift && gift.vipMinLevel > 0 ? VIP_CONFIG[gift.vipMinLevel - 1] : null;
                        const vipColor  = vipCfg ? vipCfg.nameColor : null;
                        const glowClass = unlocked && gift.vipGlowType ? `glow-${gift.vipGlowType}` : '';
                        return (
                            <div
                                key={gift.id}
                                className={`profile-gift-slot ${unlocked ? 'unlocked' : 'locked'}${unlocked && rKey === 'Mythic' ? ' mythic-glow' : ''} ${glowClass}`}
                                title={unlocked ? `${lang === 'ar' ? gift.name_ar : gift.name_en} x${count}` : (lang === 'ar' ? 'لم تُستلم بعد' : 'Not received')}
                                style={{ cursor:'pointer', ...(unlocked ? {
                                    border: vipColor ? `1.5px solid ${vipColor}88` : `1.5px solid ${rarity.border}`,
                                    boxShadow: rKey === 'Mythic' ? `0 0 12px rgba(255,0,85,0.6), 0 0 24px rgba(255,0,85,0.25)` : (rarity.glow ? `0 0 8px ${rarity.color}55` : 'none'),
                                    background: vipColor ? `linear-gradient(135deg,${vipColor}11,rgba(15,15,26,0.97))` : rarity.bg
                                } : {}) }}
                                onClick={() => setSelectedGiftDetail({ gift, count, rarity, rKey, unlocked })}
                            >
                                <span style={{ position:'absolute', top:'2px', right:'2px', fontSize:'9px' }}>{rarity.icon}</span>
                                {isVIPGift && vipColor && (
                                    <span style={{ position:'absolute', top:'2px', left:'2px', fontSize:'6px', fontWeight:900, background:vipColor, color:'#000', padding:'1px 3px', borderRadius:'3px', lineHeight:1.2 }}>
                                        V{gift.vipMinLevel}
                                    </span>
                                )}
                                <span className="profile-gift-icon">{gift.emoji || '🎁'}</span>
                                {count > 0 && <span className="profile-gift-count-badge">{count}</span>}
                                {unlocked && <div className="profile-gift-glow"></div>}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* More / Less gifts button */}
            {activeTab === 'wall' && hasMoreGifts && (
                <button
                    onClick={() => setShowAllGifts(v => !v)}
                    style={{
                        width:'100%', marginTop:'6px', padding:'7px',
                        background:'rgba(0,242,255,0.05)',
                        border:'1px solid rgba(0,242,255,0.15)',
                        borderRadius:'8px', color:'#00f2ff', fontSize:'11px',
                        fontWeight:700, cursor:'pointer', display:'flex',
                        alignItems:'center', justifyContent:'center', gap:'5px'
                    }}
                >
                    {showAllGifts
                        ? (lang==='ar' ? '▲ عرض أقل' : '▲ Show Less')
                        : `▼ ${lang==='ar' ? 'المزيد' : 'More'} (${allGifts.length - GIFTS_LIMIT} ${lang==='ar' ? 'هدية' : 'gifts'})`
                    }
                </button>
            )}

            {/* Gift Detail Popup - PORTAL to escape backdrop-filter */}
            {selectedGiftDetail && (
                <PortalModal>
                <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:Z.TOOLTIP,padding:'16px'}} onClick={() => setSelectedGiftDetail(null)}>
                    <div className="gift-detail-modal animate-pop" onClick={e => e.stopPropagation()} style={{
                        background: selectedGiftDetail.rKey==='Mythic' ? 'linear-gradient(160deg,#1a0010,#0d0020,#1a0010)' : selectedGiftDetail.rKey==='Legendary' ? 'linear-gradient(160deg,#1a1000,#0d0800,#1a1000)' : selectedGiftDetail.rKey==='Epic' ? 'linear-gradient(160deg,#0e0a1a,#06040f,#0e0a1a)' : selectedGiftDetail.rKey==='Rare' ? 'linear-gradient(160deg,#001020,#000810,#001020)' : 'linear-gradient(160deg,#0f0f1a,#080812,#0f0f1a)',
                        border: `2px solid ${selectedGiftDetail.rarity.border}`,
                        boxShadow: selectedGiftDetail.rKey==='Mythic' ? '0 0 0 1px rgba(255,0,85,0.3),0 0 30px rgba(255,0,85,0.7),0 0 70px rgba(255,0,85,0.3)' : selectedGiftDetail.rKey==='Legendary' ? '0 0 0 1px rgba(245,158,11,0.3),0 0 25px rgba(245,158,11,0.6),0 0 55px rgba(245,158,11,0.2)' : selectedGiftDetail.rKey==='Epic' ? '0 0 0 1px rgba(139,92,246,0.3),0 0 20px rgba(139,92,246,0.5)' : selectedGiftDetail.rKey==='Rare' ? '0 0 0 1px rgba(96,165,250,0.3),0 0 16px rgba(96,165,250,0.4)' : '0 20px 60px rgba(0,0,0,0.6)',
                        animation: selectedGiftDetail.rKey==='Mythic' ? 'mythic-pulse 2s ease-in-out infinite' : 'none',
                        position:'relative', overflow:'hidden'
                    }}>
                        <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',background:`linear-gradient(90deg,transparent,${selectedGiftDetail.rarity.color},transparent)`}}/>
                        {selectedGiftDetail.rKey==='Mythic' && <><div style={{position:'absolute',top:'8px',left:'10px',fontSize:'11px',opacity:0.7,animation:'mythic-pulse 1.5s ease-in-out infinite'}}>✦</div><div style={{position:'absolute',bottom:'8px',right:'10px',fontSize:'11px',opacity:0.7,animation:'mythic-pulse 1.8s ease-in-out infinite'}}>✦</div></>}
                        <button className="gift-detail-close" onClick={() => setSelectedGiftDetail(null)}>✕</button>
                        <div className="gift-detail-emoji" style={{
                            filter: selectedGiftDetail.rKey==='Mythic' ? `drop-shadow(0 0 16px ${selectedGiftDetail.rarity.color}) drop-shadow(0 0 30px ${selectedGiftDetail.rarity.color}88)` : selectedGiftDetail.rKey==='Legendary' ? `drop-shadow(0 0 12px ${selectedGiftDetail.rarity.color})` : selectedGiftDetail.rKey==='Epic' ? `drop-shadow(0 0 10px ${selectedGiftDetail.rarity.color})` : selectedGiftDetail.rKey==='Rare' ? `drop-shadow(0 0 8px ${selectedGiftDetail.rarity.color}88)` : 'none',
                            animation: selectedGiftDetail.rKey==='Mythic' ? 'mythic-pulse 2s ease-in-out infinite' : 'none'
                        }}>{selectedGiftDetail.gift.emoji || '🎁'}</div>
                        <div className="gift-detail-name" style={{color:selectedGiftDetail.rKey==='Mythic'?'#ff88bb':selectedGiftDetail.rKey==='Legendary'?'#fde68a':'white'}}>
                            {lang === 'ar' ? selectedGiftDetail.gift.name_ar : selectedGiftDetail.gift.name_en}
                        </div>
                        <div className="gift-detail-rarity" style={{color:selectedGiftDetail.rarity.color,borderColor:selectedGiftDetail.rarity.border,background:`${selectedGiftDetail.rarity.color}18`}}>
                            {selectedGiftDetail.rarity.icon} {lang === 'ar' ? selectedGiftDetail.rarity.name_ar : selectedGiftDetail.rarity.name_en}
                        </div>
                        <div className="gift-detail-stats" style={{background:`${selectedGiftDetail.rarity.color}0a`,border:`1px solid ${selectedGiftDetail.rarity.border}`}}>
                            <div className="gift-detail-stat">
                                <span className="gift-detail-stat-label">⭐ {lang==='ar'?'كاريزما':'Charisma'}</span>
                                <span className="gift-detail-stat-value" style={{color:'#fbbf24'}}>{(selectedGiftDetail.gift.charisma || 0).toLocaleString()}</span>
                            </div>
                            <div className="gift-detail-stat">
                                <span className="gift-detail-stat-label">🍀 {lang==='ar'?'بونص':'Bonus'}</span>
                                <span className="gift-detail-stat-value" style={{color:'#4ade80'}}>
                                    {selectedGiftDetail.gift.minBonus} – {selectedGiftDetail.gift.maxBonus} 🧠
                                </span>
                            </div>
                            <div className="gift-detail-stat">
                                <span className="gift-detail-stat-label">💰 {lang==='ar'?'السعر':'Price'}</span>
                                <span className="gift-detail-stat-value">{(selectedGiftDetail.gift.cost || 0).toLocaleString()} 🧠</span>
                            </div>
                            {/* VIP Required */}
                            {selectedGiftDetail.gift.vipMinLevel > 0 && (
                                <div className="gift-detail-stat">
                                    <span className="gift-detail-stat-label">👑 {lang==='ar'?'يتطلب':'Requires'}</span>
                                    <span className="gift-detail-stat-value" style={{color: VIP_CONFIG[selectedGiftDetail.gift.vipMinLevel - 1]?.nameColor || '#ef4444', fontWeight:900}}>
                                        VIP {selectedGiftDetail.gift.vipMinLevel}+
                                    </span>
                                </div>
                            )}
                            {/* Event */}
                            {selectedGiftDetail.gift.isEvent && (
                                <div className="gift-detail-stat">
                                    <span className="gift-detail-stat-label">⚡ {lang==='ar'?'نوع':'Type'}</span>
                                    <span className="gift-detail-stat-value" style={{color:'#a78bfa', fontWeight:800}}>
                                        {lang==='ar' ? '🎉 إيفنت' : '🎉 Event'}
                                    </span>
                                </div>
                            )}
                            {/* Limited Time */}
                            {selectedGiftDetail.gift.limitedTime && (
                                <div className="gift-detail-stat">
                                    <span className="gift-detail-stat-label">⏳ {lang==='ar'?'متاح':'Available'}</span>
                                    <span className="gift-detail-stat-value" style={{color:'#f97316', fontWeight:800}}>
                                        {lang==='ar' ? 'لوقت محدود' : 'Limited Time'}
                                    </span>
                                </div>
                            )}
                            {selectedGiftDetail.count > 0 && (
                                <div className="gift-detail-stat">
                                    <span className="gift-detail-stat-label">📦 {lang==='ar'?'استلمت':'Received'}</span>
                                    <span className="gift-detail-stat-value" style={{color:selectedGiftDetail.rarity.color}}>×{selectedGiftDetail.count}</span>
                                </div>
                            )}
                        </div>
                        {(lang==='ar'?selectedGiftDetail.gift.desc_ar:selectedGiftDetail.gift.desc_en) && (
                            <div className="gift-detail-desc">
                                {lang==='ar'?selectedGiftDetail.gift.desc_ar:selectedGiftDetail.gift.desc_en}
                            </div>
                        )}
                    </div>
                </div>
                </PortalModal>
            )}

            {activeTab === 'log' && (
                <div className="profile-gift-log">
                    {gifts && gifts.length > 0 ? (
                        gifts.slice(0, 10).map((gift, idx) => {
                            const logRarityKey = getGiftRarity(gift.giftCost || 0);
                            const isMythicLog = logRarityKey === 'Mythic';
                            return (
                            <div key={idx} className={`profile-gift-log-item${isMythicLog ? ' mythic-glow' : ''}`}
                                style={isMythicLog ? {border:'1px solid rgba(255,0,85,0.5)', background:'rgba(255,0,85,0.08)'} : {}}>
                                <img
                                    src={gift.senderPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(gift.senderName || 'User')}&background=6366f1&color=fff`}
                                    alt=""
                                    className="profile-gift-log-avatar"
                                    onClick={() => gift.senderId && onOpenProfile && onOpenProfile(gift.senderId)}
                                    title={gift.senderName || 'Unknown'}
                                />
                                <div className="profile-gift-log-content">
                                    <div className="profile-gift-log-sender">
                                        {gift.senderName || 'Unknown'}
                                        {isMythicLog && <span style={{marginLeft:'4px',fontSize:'9px',color:'#ff0055'}}>🔮 Mythic</span>}
                                    </div>
                                    <div className="profile-gift-log-details">
                                        <span className="profile-gift-log-emoji">{gift.giftEmoji || '🎁'}</span>
                                        <span className="profile-gift-log-name">
                                            {lang === 'ar' ? (gift.giftNameAr || 'هدية') : (gift.giftNameEn || 'Gift')}
                                        </span>
                                    </div>
                                </div>
                                <div className="profile-gift-log-stats">
                                    <div className="profile-gift-log-charisma" style={isMythicLog ? {color:'#ff0055'} : {}}>+{gift.charisma || 0}</div>
                                    <div className="profile-gift-log-time">
                                        {gift.timestamp?.toDate ? formatTime(gift.timestamp) : ''}
                                    </div>
                                </div>
                            </div>
                            );
                        })
                    ) : (
                        <div className="profile-gift-empty">
                            <span style={{ fontSize: '32px' }}>🎁</span>
                            <span>{lang === 'ar' ? 'لا توجد هدايا بعد' : 'No gifts yet'}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// 🏆 ACHIEVEMENTS DISPLAY V11 - GROUPED TIERED SYSTEM
const AchievementsDisplayV11 = ({ userData, lang, showAll = false }) => {
    const rawAchievements = userData?.achievements;

    const unlockedIds = React.useMemo(() => {
        if (!rawAchievements) return [];
        if (Array.isArray(rawAchievements)) {
            return rawAchievements
                .map(item => (typeof item === 'string' ? item : item?.id))
                .filter(Boolean);
        }
        if (rawAchievements?.badges && Array.isArray(rawAchievements.badges)) {
            return rawAchievements.badges.map(b => b?.id || b).filter(Boolean);
        }
        return [];
    }, [rawAchievements]);

    // Current value for progress
    const getCurrentVal = (ach) => {
        const stats = userData?.stats || {};
        switch (ach.condition.type) {
            case 'wins':           return stats.wins || 0;
            case 'games_played':   return (stats.wins || 0) + (stats.losses || 0);
            case 'spy_wins':       return stats.spy_wins || 0;
            case 'agent_wins':     return stats.agent_wins || 0;
            case 'win_streak':     return stats.win_streak || 0;
            case 'gifts_received': return userData?.giftsReceived || 0;
            case 'gifts_sent':     return userData?.giftsSent || 0;
            case 'charisma':       return userData?.charisma || 0;
            case 'friends':        return (userData?.friends || []).length;
            case 'login_streak':   return userData?.loginRewards?.streak || 0;
            case 'total_logins':   return userData?.loginRewards?.totalClaims || 0;
            default:               return 0;
        }
    };

    // Tier visual config
    const TIER_STYLE = {
        1: { color: '#9ca3af',  glow: false, label: TRANSLATIONS[lang]?.achTier1 || 'Bronze' },
        2: { color: '#d1d5db',  glow: false, label: TRANSLATIONS[lang]?.achTier2 || 'Silver' },
        3: { color: '#ef4444',  glow: true,  label: TRANSLATIONS[lang]?.achTier3 || 'Legendary' },
        // ✨ Tier 4 → Divine (Celestial Cyan)
        4: { color: '#00d4ff',  glow: true,  label: TRANSLATIONS[lang]?.achTier4 || 'Divine', ultimate: true, isDivine: true },
    };
    const TIER_DOT_COLOR = { 1: '#78716c', 2: '#d1d5db', 3: '#ef4444', 4: '#00d4ff' };

    // Group achievements by group field
    const groups = React.useMemo(() => {
        const groupMap = {};
        ACHIEVEMENTS.forEach(ach => {
            const g = ach.group || 'misc';
            if (!groupMap[g]) groupMap[g] = [];
            groupMap[g].push(ach);
        });
        // Sort each group by tier
        Object.values(groupMap).forEach(arr => arr.sort((a, b) => a.tier - b.tier));

        // Convert to array and sort: highest tier unlocked first, then by progress
        return Object.entries(groupMap).map(([groupKey, tiers]) => {
            const highestUnlocked = tiers.reduce((best, ach) =>
                unlockedIds.includes(ach.id) && ach.tier > best ? ach.tier : best, 0);
            // Progress toward next tier
            const nextTier = tiers.find(a => !unlockedIds.includes(a.id));
            const progress = nextTier
                ? Math.min(100, Math.round((getCurrentVal(nextTier) / nextTier.condition.value) * 100))
                : 100;
            return { groupKey, tiers, highestUnlocked, nextTier, progress };
        }).sort((a, b) => {
            if (b.highestUnlocked !== a.highestUnlocked) return b.highestUnlocked - a.highestUnlocked;
            return b.progress - a.progress;
        });
    }, [unlockedIds, userData]);

    const [selectedGroup, setSelectedGroup] = useState(null);
    const unlockedCount  = unlockedIds.length;
    const totalCount     = ACHIEVEMENTS.length;

    return (
        <div className="profile-achievements-section">
            {/* Header */}
            <div className="profile-achievements-header">
                <span className="profile-achievements-title">
                    🏆 {lang === 'ar' ? 'الإنجازات' : 'Achievements'}
                </span>
                <span style={{
                    fontSize:'11px', fontWeight:800, padding:'2px 8px', borderRadius:'8px',
                    background: unlockedCount > 0 ? 'rgba(255,215,0,0.15)' : 'rgba(100,100,100,0.15)',
                    color: unlockedCount > 0 ? '#ffd700' : '#6b7280',
                    border: unlockedCount > 0 ? '1px solid rgba(255,215,0,0.35)' : '1px solid rgba(100,100,100,0.25)'
                }}>
                    {unlockedCount}/{totalCount}
                </span>
            </div>

            {/* Groups Grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:'8px' }}>
                {groups.map(({ groupKey, tiers, highestUnlocked, nextTier, progress }) => {
                    const displayTier = highestUnlocked > 0 ? tiers[highestUnlocked - 1] : tiers[0];
                    const ts          = TIER_STYLE[highestUnlocked] || TIER_STYLE[1];
                    const allDone     = highestUnlocked === 4;
                    const isUnlocked  = highestUnlocked > 0;
                    const tierColor   = isUnlocked ? ts.color : '#4b5563';

                    return (
                        <div
                            key={groupKey}
                            onClick={() => setSelectedGroup({ groupKey, tiers })}
                            style={{
                                position:'relative', cursor:'pointer',
                                borderRadius:'12px',
                                border: `1px solid ${isUnlocked ? tierColor + '66' : 'rgba(255,255,255,0.08)'}`,
                                background: isUnlocked
                                    ? `linear-gradient(135deg,${tierColor}11,rgba(15,15,26,0.97))`
                                    : 'rgba(15,15,26,0.5)',
                                boxShadow: ts.glow && isUnlocked
                                    ? (ts.ultimate ? `0 0 16px ${tierColor}88, 0 0 30px ${tierColor}44` : `0 0 8px ${tierColor}55`)
                                    : 'none',
                                padding:'10px 8px',
                                display:'flex', flexDirection:'column', alignItems:'center', gap:'5px',
                                animation: ts.isDivine && isUnlocked ? 'divine-aura 3s ease-in-out infinite' : ts.ultimate && isUnlocked ? 'mythic-pulse 2.5s ease-in-out infinite' : 'none',
                                opacity: isUnlocked ? 1 : 0.5,
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {/* Icon */}
                            <span style={{
                                fontSize:'24px',
                                filter: isUnlocked
                                    ? (ts.ultimate ? `drop-shadow(0 0 10px ${tierColor})` : ts.glow ? `drop-shadow(0 0 6px ${tierColor})` : 'none')
                                    : 'grayscale(100%)'
                            }}>
                                {displayTier.icon || '🏅'}
                            </span>

                            {/* Tier name */}
                            {isUnlocked && (
                                <span style={{
                                    fontSize:'8px', fontWeight:900, color: tierColor,
                                    textTransform:'uppercase', letterSpacing:'0.5px'
                                }}>
                                    {ts.label}
                                </span>
                            )}

                            {/* Achievement group name */}
                            <span style={{ fontSize:'9px', color: isUnlocked ? '#e2e8f0' : '#6b7280', textAlign:'center', lineHeight:1.3 }}>
                                {TRANSLATIONS[lang]?.[displayTier.nameKey] || groupKey}
                            </span>

                            {/* Tier dots — 4 dots showing which tiers are unlocked */}
                            <div style={{ display:'flex', gap:'3px', marginTop:'2px' }}>
                                {tiers.map(a => (
                                    <div key={a.tier} style={{
                                        width:'7px', height:'7px', borderRadius:'50%',
                                        background: unlockedIds.includes(a.id)
                                            ? TIER_DOT_COLOR[a.tier]
                                            : 'rgba(255,255,255,0.1)',
                                        boxShadow: unlockedIds.includes(a.id) && a.tier >= 3
                                            ? `0 0 5px ${TIER_DOT_COLOR[a.tier]}`
                                            : 'none',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        transition:'all 0.2s'
                                    }} />
                                ))}
                            </div>

                            {/* Progress bar to next tier OR Complete */}
                            {allDone ? (
                                <div style={{ fontSize:'8px', color:'#fbbf24', fontWeight:700 }}>
                                    {lang === 'ar' ? '✓ مكتمل!' : '✓ Complete!'}
                                </div>
                            ) : nextTier && (
                                <div style={{ width:'100%' }}>
                                    <div style={{
                                        width:'100%', height:'4px', borderRadius:'2px',
                                        background:'rgba(255,255,255,0.07)', overflow:'hidden'
                                    }}>
                                        <div style={{
                                            width:`${progress}%`, height:'100%',
                                            background: `linear-gradient(90deg, #7c3aed, ${tierColor})`,
                                            borderRadius:'2px', transition:'width 0.4s'
                                        }} />
                                    </div>
                                    <div style={{ fontSize:'7px', color:'#6b7280', textAlign:'center', marginTop:'2px' }}>
                                        {getCurrentVal(nextTier)}/{nextTier.condition.value}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Group Detail Modal */}
            {selectedGroup && (
                <PortalModal>
                    <div
                        style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            zIndex:Z.TOOLTIP, padding:'16px' }}
                        onClick={() => setSelectedGroup(null)}
                    >
                        <div
                            className="achievement-detail-modal animate-pop"
                            onClick={e => e.stopPropagation()}
                            style={{ maxWidth:'340px', width:'100%' }}
                        >
                            <div style={{ fontSize:'13px', fontWeight:800, color:'#e2e8f0', marginBottom:'12px', textAlign:'center' }}>
                                🏆 {lang === 'ar' ? 'مستويات الإنجاز' : 'Achievement Tiers'}
                            </div>
                            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                                {selectedGroup.tiers.map(ach => {
                                    const isUnlocked = unlockedIds.includes(ach.id);
                                    const ts         = TIER_STYLE[ach.tier];
                                    const cur        = getCurrentVal(ach);
                                    const pct        = Math.min(100, Math.round((cur / ach.condition.value) * 100));
                                    return (
                                        <div key={ach.id} style={{
                                            padding:'10px 12px', borderRadius:'10px',
                                            background: isUnlocked
                                                ? `linear-gradient(135deg,${ts.color}15,rgba(15,15,26,0.97))`
                                                : 'rgba(255,255,255,0.03)',
                                            border: `1px solid ${isUnlocked ? ts.color + '55' : 'rgba(255,255,255,0.08)'}`,
                                            boxShadow: isUnlocked && ts.glow ? `0 0 10px ${ts.color}44` : 'none',
                                            opacity: isUnlocked ? 1 : 0.55,
                                            display:'flex', alignItems:'center', gap:'10px'
                                        }}>
                                            <span style={{
                                                fontSize:'22px',
                                                filter: isUnlocked && ts.glow ? `drop-shadow(0 0 6px ${ts.color})` : (isUnlocked ? 'none' : 'grayscale(80%)')
                                            }}>
                                                {ach.icon}
                                            </span>
                                            <div style={{ flex:1 }}>
                                                <div style={{ fontSize:'11px', fontWeight:800, color: isUnlocked ? ts.color : '#9ca3af' }}>
                                                    {ts.label} — {TRANSLATIONS[lang]?.[ach.nameKey] || ach.id}
                                                </div>
                                                <div style={{ fontSize:'10px', color:'#6b7280', marginTop:'2px' }}>
                                                    {TRANSLATIONS[lang]?.[ach.descKey] || ''}
                                                </div>
                                                {!isUnlocked && (
                                                    <div style={{ marginTop:'5px' }}>
                                                        <div style={{ width:'100%', height:'4px', borderRadius:'2px', background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
                                                            <div style={{ width:`${pct}%`, height:'100%', background:`linear-gradient(90deg,#7c3aed,${ts.color})`, transition:'width 0.4s' }} />
                                                        </div>
                                                        <div style={{ fontSize:'9px', color:'#6b7280', marginTop:'2px' }}>{cur}/{ach.condition.value}</div>
                                                    </div>
                                                )}
                                            </div>
                                            {isUnlocked && (
                                                <span style={{ fontSize:'16px', color:'#4ade80' }}>✓</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                className="achievement-detail-close-bottom"
                                onClick={() => setSelectedGroup(null)}
                                style={{ marginTop:'12px' }}
                            >
                                {lang === 'ar' ? 'إغلاق' : 'Close'} ✕
                            </button>
                        </div>
                    </div>
                </PortalModal>
            )}
        </div>
    );
};
// 👤 USER TITLE COMPONENT V11 - FIXED VISIBILITY
const UserTitleV11 = ({ equipped, lang }) => {
    const titleId = equipped?.titles;
    if (!titleId) return null;

    const title = SHOP_ITEMS.titles.find(t => t.id === titleId);
    if (!title) return null;

    // If title has an image URL, show the image
    if (title.imageUrl && title.imageUrl.trim() !== '') {
        return (
            <div className="profile-user-title has-image">
                <img src={title.imageUrl} alt={title.name_en} />
            </div>
        );
    }

    // Otherwise show text with emoji/preview
    return (
        <span className="profile-user-title">
            {title.preview} {lang === 'ar' ? title.name_ar : title.name_en}
        </span>
    );
};

// 🎖️ USER BADGES COMPONENT V11 - SHOW ALL 10 BADGES
const UserBadgesV11 = ({ equipped, lang }) => {
    const badges = equipped?.badges || [];
    if (badges.length === 0) return null;

    return (
        <div className="profile-badges-row">
            {badges.slice(0, 10).map((badgeId, idx) => {
                const badge = SHOP_ITEMS.badges.find(b => b.id === badgeId);
                if (!badge) return null;

                return (
                    <div key={idx} className={`profile-badge-chip${badge.imageUrl ? ' has-image' : ''}`}>
                        {badge.imageUrl ? (
                            <img src={badge.imageUrl} alt="" style={{ width: 18, height: 18, objectFit:'contain', background:'transparent' }} />
                        ) : (
                            <span>{badge.preview}</span>
                        )}
                        {!badge.imageUrl && <span>{lang === 'ar' ? badge.name_ar : badge.name_en}</span>}
                    </div>
                );
            })}
        </div>
    );
};

// 👤 AVATAR WITH FRAME V11 - FIXED CIRCULAR (Frame AROUND Avatar)
const AvatarWithFrameV11 = ({ photoURL, equipped, size = 'lg', isOnline, effectId }) => {
    const sizeMap = {
        sm: { wrapper: 64, avatar: 36, frameSize: 56 },
        md: { wrapper: 80, avatar: 48, frameSize: 72 },
        lg: { wrapper: 96, avatar: 58, frameSize: 90 },
        xl: { wrapper: 150, avatar: 90, frameSize: 140 }
    };

    const s = sizeMap[size] || sizeMap.lg;
    const frame = equipped?.frames;
    const frameStyle = frame ? SHOP_ITEMS.frames.find(f => f.id === frame) : null;

    // Resolve profile effect (from prop or equipped)
    const resolvedEffectId = effectId || equipped?.profileEffects;
    const effect = resolvedEffectId ? (SHOP_ITEMS.profileEffects || []).find(e => e.id === resolvedEffectId) : null;
    const hasImageEffect = effect && effect.imageUrl && effect.imageUrl.trim() !== '';

    return (
        <div className="profile-avatar-container" style={{
            position: 'relative',
            width: s.wrapper,
            height: s.wrapper,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* Frame layer - AROUND the avatar (larger than avatar) */}
            {frameStyle && frameStyle.preview && (
                <div
                    className="profile-avatar-frame"
                    style={{
                        position: 'absolute',
                        width: s.frameSize,
                        height: s.frameSize,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        zIndex: 1
                    }}
                >
                    {frameStyle.preview.startsWith('http') ? (
                        <img src={frameStyle.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            background: frameStyle.preview,
                            borderRadius: '50%'
                        }} />
                    )}
                </div>
            )}

            {/* Avatar image - CENTERED inside frame */}
            <div style={{ position:'relative', width: s.avatar, height: s.avatar, zIndex: 10, borderRadius:'50%', overflow: hasImageEffect ? 'hidden' : 'visible' }}>
                <img
                    src={photoURL || `https://ui-avatars.com/api/?name=User&background=1e293b&color=fff&size=${s.avatar * 2}`}
                    alt=""
                    className="profile-avatar"
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        display: 'block',
                        border: '3px solid #0f172a',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        objectFit: 'cover',
                        background: '#0f172a'
                    }}
                />
                {/* Image/GIF effect directly ON the avatar */}
                {hasImageEffect && (
                    <>
                        <img
                            src={effect.imageUrl}
                            alt=""
                            style={{
                                position:'absolute', inset:0,
                                width:'100%', height:'100%',
                                objectFit:'cover', objectPosition:'center',
                                borderRadius:'50%',
                                opacity: 0.85,
                                pointerEvents:'none'
                            }}
                        />
                        {effect.hasGlow && (
                            <div style={{
                                position:'absolute', inset:0, borderRadius:'50%',
                                background:'radial-gradient(circle at center, rgba(0,242,255,0.3) 0%, transparent 70%)',
                                pointerEvents:'none'
                            }} />
                        )}
                    </>
                )}
            </div>

            {isOnline !== undefined && (
                <div className={`profile-status-dot ${isOnline ? '' : 'offline'}`}></div>
            )}
        </div>
    );
};

// ✨ PROFILE EFFECT OVERLAY (standalone component - no hooks added to ProfileV11)
const ProfileEffectOverlay = ({ effectId }) => {
    const [particles, setParticles] = useState([]);
    const [alive, setAlive] = useState(false);
    const timerRef = useRef(null);

    const effect = (SHOP_ITEMS.profileEffects || []).find(e => e.id === effectId);

    useEffect(() => {
        if (!effect) return;
        const all = [];
        (effect.particles || []).forEach(p => {
            for (let i = 0; i < p.count; i++) all.push({
                id: `${p.emoji}-${i}-${Math.random().toString(36).slice(2)}`,
                emoji: p.emoji,
                x: 5 + Math.random() * 90,
                delay: Math.random() * 1.4,
                size: 13 + Math.random() * 17,
                dur: 1.5 + Math.random() * 0.9,
            });
        });
        setParticles(all);
        setAlive(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setAlive(false), (effect.duration || 2200) + 1200);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [effectId]);

    if (!effect) return null;

    // Support for image/GIF effects (imageUrl field in effect)
    if (effect.imageUrl && effect.imageUrl.trim() !== '') {
        return (
            <div style={{
                position:'absolute', inset:0, borderRadius:'inherit',
                overflow:'hidden', pointerEvents:'none', zIndex:2
            }}>
                <img
                    src={effect.imageUrl}
                    alt={effect.name_en}
                    style={{
                        position:'absolute', inset:0,
                        width:'100%', height:'100%',
                        objectFit:'cover', objectPosition:'center',
                        borderRadius:'inherit',
                        opacity: 0.85
                    }}
                />
                {effect.hasGlow && (
                    <div style={{
                        position:'absolute', inset:0,
                        background:'radial-gradient(circle at center, rgba(0,242,255,0.25) 0%, transparent 70%)',
                        pointerEvents:'none'
                    }} />
                )}
            </div>
        );
    }

    // Default: particle effect
    if (!alive || particles.length === 0) return null;
    return (
        <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:99998,overflow:'hidden'}}>
            {particles.map(p => (
                <div key={p.id} style={{
                    position:'absolute', left:`${p.x}%`, top:'-8%',
                    fontSize:`${p.size}px`, lineHeight:1, userSelect:'none',
                    animation:`pef_fall ${p.dur}s ease-in ${p.delay}s forwards`,
                    opacity: 0,
                }}>{p.emoji}</div>
            ))}
            <style>{`@keyframes pef_fall{0%{opacity:0;transform:translateY(0) rotate(0deg)}10%{opacity:1}80%{opacity:.9}100%{opacity:0;transform:translateY(105vh) rotate(380deg)}}`}</style>
        </div>
    );
};

// 📸 MOMENTS SYSTEM - Complete Component

// Max file size: 2MB images, 5MB videos (10 sec max)
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const MAX_VIDEO_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_DURATION = 10;

const AllMomentsModal = ({ show, onClose, moments, ownerName, lang, onSelectMoment }) => {
    if (!show) return null;
    return (
        <div className="modal-overlay" onClick={onClose} style={{zIndex:Z.MODAL_HIGH}}>
            <div className="animate-pop" onClick={e => e.stopPropagation()} style={{
                background:'linear-gradient(180deg,#0f0f1e,#0a0a14)',
                border:'1px solid rgba(0,242,255,0.2)',
                borderRadius:'18px', width:'100%', maxWidth:'420px',
                maxHeight:'85vh', display:'flex', flexDirection:'column', overflow:'hidden',
                boxShadow:'0 20px 60px rgba(0,0,0,0.9)'
            }}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <span style={{fontSize:'16px'}}>📸</span>
                        <div>
                            <div style={{fontSize:'13px', fontWeight:800, color:'white'}}>{lang==='ar'?'كل اللحظات':'All Moments'}</div>
                            <div style={{fontSize:'9px', color:'#6b7280'}}>{ownerName} · {moments.length} {lang==='ar'?'لحظة':'moments'}</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{background:'rgba(255,255,255,0.07)',border:'none',borderRadius:'8px',color:'#9ca3af',fontSize:'16px',width:'30px',height:'30px',cursor:'pointer'}}>✕</button>
                </div>
                <div style={{flex:1, overflowY:'auto', padding:'10px 12px'}}>
                    <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px'}}>
                        {moments.map(moment => (
                            <div key={moment.id} onClick={() => { onSelectMoment(moment); onClose(); }} style={{
                                aspectRatio:'1', borderRadius:'10px', overflow:'hidden',
                                background:GR.CYAN_SOFT,
                                border:'1px solid rgba(0,242,255,0.15)', cursor:'pointer', position:'relative',
                                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px',
                                transition:'transform 0.15s'
                            }}>
                                {moment.type === 'image' && moment.mediaUrl ? (
                                    <img src={moment.mediaUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                                ) : moment.type === 'video' && moment.mediaUrl ? (
                                    <video src={moment.mediaUrl} style={{width:'100%',height:'100%',objectFit:'cover'}} muted />
                                ) : (
                                    <div style={{fontSize:'11px',color:'#e2e8f0',padding:'8px',textAlign:'center',lineHeight:1.3, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:4, WebkitBoxOrient:'vertical'}}>
                                        {moment.content}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MomentsSection = ({ ownerUID, ownerName, currentUser, isOwnProfile, lang, onMomentPosted }) => {
    const [moments, setMoments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMoment, setSelectedMoment] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAllMoments, setShowAllMoments] = useState(false);
    const PREVIEW_COUNT = 3;

    useEffect(() => {
        if (!ownerUID) return;
        setLoading(true);
        const unsub = momentsCollection
            .where('authorUID', '==', ownerUID)
            .limit(50)
            .onSnapshot(snap => {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                data.sort((a, b) => {
                    const ta = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
                    const tb = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
                    return tb - ta;
                });
                setMoments(data);
                setLoading(false);
            }, () => setLoading(false));
        return unsub;
    }, [ownerUID]);

    const previewMoments = moments.slice(0, PREVIEW_COUNT);
    const hasMore = moments.length > PREVIEW_COUNT;

    return (<>
        <div style={{
            margin:'8px 12px',
            background:'linear-gradient(135deg,rgba(0,0,0,0.35),rgba(0,0,0,0.2))',
            border:'1px solid rgba(0,242,255,0.12)',
            borderRadius:'14px',
            overflow:'hidden',
            boxShadow:'0 8px 32px rgba(0,0,0,0.3)'
        }}>
            {/* Header */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', borderBottom: moments.length > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none'}}>
                <button
                    onClick={() => moments.length > 0 && setShowAllMoments(true)}
                    style={{
                        display:'flex', alignItems:'center', gap:'6px', background:'none', border:'none',
                        cursor: moments.length > 0 ? 'pointer' : 'default', padding:0
                    }}
                >
                    <span style={{fontSize:'11px'}}>📸</span>
                    <span style={{fontSize:'10px', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.5px'}}>
                        {lang === 'ar' ? 'اللحظات' : 'Moments'}
                    </span>
                    <span style={{
                        fontSize:'9px', fontWeight:800, color:'#00f2ff',
                        background:'rgba(0,242,255,0.1)', border:'1px solid rgba(0,242,255,0.25)',
                        borderRadius:'4px', padding:'1px 5px'
                    }}>{moments.length}</span>
                </button>
                <div style={{display:'flex', gap:'6px', alignItems:'center'}}>
                    {hasMore && (
                        <button
                            onClick={() => setShowAllMoments(true)}
                            style={{fontSize:'9px', color:'#94a3b8', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'6px', padding:'3px 8px', cursor:'pointer', fontWeight:600}}
                        >
                            {lang === 'ar' ? `الكل (${moments.length})` : `All (${moments.length})`}
                        </button>
                    )}
                    {isOwnProfile && currentUser && !currentUser.isGuest && !currentUser.isAnonymous && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{fontSize:'9px', color:'#00f2ff', background:'rgba(0,242,255,0.08)', border:'1px solid rgba(0,242,255,0.25)', borderRadius:'6px', padding:'3px 8px', cursor:'pointer', fontWeight:700}}
                        >
                            + {lang === 'ar' ? 'أضف' : 'Add'}
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div style={{padding:'10px 12px 12px'}}>
            {loading ? (
                <div style={{textAlign:'center', padding:'16px', color:'#64748b', fontSize:'11px'}}>...</div>
            ) : moments.length === 0 ? (
                <div style={{textAlign:'center', padding:'12px', color:'#64748b', fontSize:'11px'}}>
                    {lang === 'ar' ? 'لا توجد لحظات بعد' : 'No moments yet'}
                </div>
            ) : (
                <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'5px'}}>
                    {previewMoments.map(moment => (
                        <div
                            key={moment.id}
                            onClick={() => setSelectedMoment(moment)}
                            style={{
                                aspectRatio:'1', borderRadius:'10px', overflow:'hidden',
                                background:GR.CYAN_SOFT,
                                border:'1px solid rgba(0,242,255,0.18)',
                                boxShadow:'0 0 8px rgba(0,242,255,0.06)',
                                cursor:'pointer', position:'relative', transition:'transform 0.15s',
                                display:'flex', alignItems:'center', justifyContent:'center'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform='scale(0.97)'}
                            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                        >
                            {/* Moment type indicator */}
                            <div style={{position:'absolute', top:'4px', left:'4px', zIndex:2, fontSize:'8px', background:'rgba(0,0,0,0.6)', borderRadius:'4px', padding:'1px 4px', color:'#00f2ff', fontWeight:700}}>
                                {moment.type === 'text' ? '✏️' : moment.type === 'image' ? '🖼️' : '🎥'}
                            </div>

                            {moment.type === 'text' ? (
                                <div style={{padding:'8px', fontSize:'9px', color:'#e2e8f0', textAlign:'center', wordBreak:'break-word', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:5, WebkitBoxOrient:'vertical'}}>
                                    {moment.content}
                                </div>
                            ) : moment.type === 'image' ? (
                                <img src={moment.mediaUrl} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                            ) : moment.type === 'video' ? (
                                <div style={{width:'100%', height:'100%', position:'relative', background:'#000'}}>
                                    <video src={moment.mediaUrl} style={{width:'100%', height:'100%', objectFit:'cover'}} muted />
                                    <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.25)'}}>
                                        <span style={{fontSize:'22px'}}>▶</span>
                                    </div>
                                </div>
                            ) : null}

                            {/* Likes + comments bottom bar */}
                            <div style={{position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(transparent,rgba(0,0,0,0.75))', padding:'8px 4px 3px', display:'flex', justifyContent:'flex-end', gap:'6px', alignItems:'center'}}>
                                {(moment.likesCount || 0) > 0 && (
                                    <span style={{fontSize:'8px', color:'#f87171', fontWeight:700}}>❤️ {moment.likesCount}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <CreateMomentModal
                    onClose={() => setShowCreateModal(false)}
                    currentUser={currentUser}
                    lang={lang}
                    onPosted={onMomentPosted}
                />
            )}
            </div>{/* end content padding */}
        </div>{/* end container box */}

        {showAllMoments && (
            <AllMomentsModal
                show={showAllMoments}
                onClose={() => setShowAllMoments(false)}
                moments={moments}
                ownerName={ownerName || ''}
                lang={lang}
                onSelectMoment={setSelectedMoment}
            />
        )}
        {selectedMoment && (
            <MomentDetailModal
                moment={selectedMoment}
                onClose={() => setSelectedMoment(null)}
                currentUser={currentUser}
                isOwnProfile={isOwnProfile}
                lang={lang}
                onDelete={(id) => { momentsCollection.doc(id).delete(); setSelectedMoment(null); }}
            />
        )}
    </>);
};

const MomentDetailModal = ({ moment, onClose, currentUser, isOwnProfile, lang, onDelete }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(moment.likesCount || 0);
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [reportSent, setReportSent] = useState(false);
    const [showReportMomentModal, setShowReportMomentModal] = useState(false);
    const [lastCommentTime, setLastCommentTime] = useState(0);
    const COMMENT_COOLDOWN_MS = 60000; // 1 minute
    const [cooldownTick, setCooldownTick] = useState(0);

    // Tick every second to update cooldown display
    useEffect(() => {
        const timer = setInterval(() => setCooldownTick(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const cooldownRemaining = Math.max(0, Math.ceil((COMMENT_COOLDOWN_MS - (Date.now() - lastCommentTime)) / 1000));
    const isCoolingDown = cooldownRemaining > 0 && lastCommentTime > 0;
    const [momentReportReason, setMomentReportReason] = useState('');
    const [showReportCommentModal, setShowReportCommentModal] = useState(false);
    const [reportTargetComment, setReportTargetComment] = useState(null);
    const [commentReportReason, setCommentReportReason] = useState('');

    useEffect(() => {
        if (!moment.id) return;
        const unsub = momentsCollection.doc(moment.id).collection('comments')
            .limit(50)
            .onSnapshot(snap => {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                data.sort((a, b) => {
                    const ta = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
                    const tb = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
                    return ta - tb;
                });
                setComments(data);
            });
        if (currentUser) {
            setLiked((moment.likedBy || []).includes(currentUser.uid));
            setLikesCount(moment.likesCount || 0);
        }
        return unsub;
    }, [moment.id]);

    const handleLike = async () => {
        if (!currentUser?.uid) return;
        const docRef = momentsCollection.doc(moment.id);
        if (liked) {
            await docRef.update({ likedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.uid), likesCount: firebase.firestore.FieldValue.increment(-1) });
            setLiked(false); setLikesCount(p => Math.max(0, p - 1));
        } else {
            await docRef.update({ likedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid), likesCount: firebase.firestore.FieldValue.increment(1) });
            setLiked(true); setLikesCount(p => p + 1);
        }
    };

    const handleComment = async () => {
        if (!newComment.trim() || !currentUser || submitting) return;
        // Anti-spam: 1 minute cooldown
        const now = Date.now();
        if (now - lastCommentTime < COMMENT_COOLDOWN_MS) {
            // Just block silently - UI shows cooldown timer
            return;
        }
        setSubmitting(true);
        await momentsCollection.doc(moment.id).collection('comments').add({
            authorUID: currentUser.uid,
            authorName: currentUser.displayName || (lang === 'ar' ? 'مستخدم' : 'User'),
            authorPhoto: currentUser.photoURL || null,
            text: newComment.trim(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        // ✅ Track mission: commentsPosted
        try {
            const today = new Date().toDateString();
            const dp = currentUser?.missionProgress?.daily || {};
            const now3 = new Date(); const soy3 = new Date(now3.getFullYear(),0,1);
            const wNum3 = Math.ceil(((now3-soy3)/86400000+soy3.getDay()+1)/7);
            const wStr3 = `${now3.getFullYear()}-W${wNum3}`;
            const wp3 = currentUser?.missionProgress?.weekly || {};
            const cUpdates = {};
            if (dp.resetDate !== today) {
                cUpdates['missionProgress.daily.resetDate'] = today;
                cUpdates['missionProgress.daily.commentsPosted'] = 1;
            } else {
                cUpdates['missionProgress.daily.commentsPosted'] = firebase.firestore.FieldValue.increment(1);
            }
            if (wp3.resetWeek !== wStr3) {
                cUpdates['missionProgress.weekly.resetWeek'] = wStr3;
            }
            if (Object.keys(cUpdates).length) await usersCollection.doc(currentUser.uid).update(cUpdates);
        } catch (ce) {}
        setNewComment(''); setSubmitting(false); setLastCommentTime(Date.now());
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm(lang === 'ar' ? 'حذف هذا التعليق؟' : 'Delete this comment?')) return;
        await momentsCollection.doc(moment.id).collection('comments').doc(commentId).delete();
    };

    const handleReportMoment = async () => {
        if (!currentUser || reportSent || !momentReportReason) return;
        try {
            await reportsCollection.add({
                type: 'moment',
                reason: momentReportReason,
                targetId: moment.id,
                targetOwnerUID: moment.authorUID,
                momentType: moment.type,
                momentContent: moment.type === 'text' ? (moment.content || '') : '',
                momentMediaUrl: (moment.type === 'image' || moment.type === 'video') ? (moment.mediaUrl || '') : '',
                reporterUID: currentUser.uid,
                reporterName: currentUser.displayName || 'User',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            setReportSent(true);
            setShowReportMomentModal(false);
            setMomentReportReason('');
        } catch(e) { }
    };

    const handleReportCommentSubmit = async () => {
        if (!currentUser || !reportTargetComment || !commentReportReason) return;
        try {
            await reportsCollection.add({
                type: 'moment_comment',
                reason: commentReportReason,
                targetId: reportTargetComment.id,
                momentId: moment.id,
                commentText: reportTargetComment.text || '',
                targetOwnerUID: reportTargetComment.authorUID,
                reporterUID: currentUser.uid,
                reporterName: currentUser.displayName || 'User',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            setShowReportCommentModal(false);
            setReportTargetComment(null);
            setCommentReportReason('');
        } catch(e) { }
    };

    const handleReportComment = async (comment) => {
        if (!currentUser) return;
        try {
            await reportsCollection.add({
                type: 'moment_comment',
                targetId: comment.id,
                momentId: moment.id,
                targetOwnerUID: comment.authorUID,
                reporterUID: currentUser.uid,
                reporterName: currentUser.displayName || 'User',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch(e) {}
    };

    return (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:Z.MODAL, padding:'16px'}} onClick={onClose}>
            <div style={{background:GR.DARK_CARD, border:'1px solid rgba(0,242,255,0.2)', borderRadius:'16px', width:'100%', maxWidth:'400px', maxHeight:'85vh', overflow:'hidden', display:'flex', flexDirection:'column', position:'relative'}} onClick={e => e.stopPropagation()}>
                {/* VIP Moment Background */}
                {(() => {
                    const authorVipLevel = moment.authorVipLevel || 0;
                    const bgUrl = authorVipLevel >= 2 ? VIP_MOMENT_BG_URLS[authorVipLevel] : null;
                    if (!bgUrl) return null;
                    return <div className="moment-vip-bg" style={{backgroundImage:`url(${bgUrl})`}} />;
                })()}

                {/* Header */}
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        {moment.authorPhoto
                            ? <img src={moment.authorPhoto} alt="" style={{width:'28px', height:'28px', borderRadius:'50%', objectFit:'cover'}} />
                            : <div style={{width:'28px', height:'28px', borderRadius:'50%', background:'#374151', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px'}}>👤</div>
                        }
                        <span style={{fontSize:'12px', fontWeight:700, color:'white'}}>{moment.authorName}</span>
                    </div>
                    <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                        {/* Report button - shown to non-owners */}
                        {currentUser && !isOwnProfile && (
                            <button
                                onClick={() => !reportSent && setShowReportMomentModal(true)}
                                title={lang === 'ar' ? 'إبلاغ' : 'Report'}
                                style={{background: reportSent ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.06)', border: reportSent ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgba(255,255,255,0.1)', borderRadius:'6px', color: reportSent ? '#fbbf24' : '#6b7280', fontSize:'10px', padding:'3px 8px', cursor: reportSent ? 'default' : 'pointer', fontWeight:700}}
                            >
                                {reportSent ? (lang === 'ar' ? '✓ تم' : '✓ Sent') : (lang === 'ar' ? '🚩 إبلاغ' : '🚩 Report')}
                            </button>
                        )}
                        {/* Delete button - shown to owner */}
                        {isOwnProfile && (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                style={{background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'6px', color:'#f87171', fontSize:'10px', padding:'3px 8px', cursor:'pointer', fontWeight:700}}
                            >
                                🗑️
                            </button>
                        )}
                        <button onClick={onClose} style={{background:'rgba(255,255,255,0.08)', border:'none', color:'#9ca3af', fontSize:'16px', cursor:'pointer', borderRadius:'6px', padding:'4px 8px'}}>✕</button>
                    </div>
                </div>

                {/* Content */}
                <div style={{flex:'0 0 auto', padding:'12px 14px', background:'rgba(0,0,0,0.2)'}}>
                    {(moment.type === 'image' || moment.type === 'video') && moment.mediaUrl && (
                        <div style={{marginBottom: moment.content ? '10px' : 0}}>
                            {moment.type === 'image'
                                ? <img src={moment.mediaUrl} alt="" style={{width:'100%', borderRadius:'10px', maxHeight:'250px', objectFit:'cover'}} />
                                : <video src={moment.mediaUrl} controls style={{width:'100%', borderRadius:'10px', maxHeight:'250px'}} />
                            }
                        </div>
                    )}
                    {moment.content ? (
                        <p style={{fontSize:'13px', color:'#e2e8f0', lineHeight:1.6, margin:0}}>{moment.content}</p>
                    ) : null}
                </div>

                {/* Like + stats bar */}
                <div style={{padding:'8px 14px', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    <button
                        onClick={handleLike}
                        style={{
                            background: liked ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.05)',
                            border: liked ? '1px solid rgba(248,113,113,0.4)' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius:'8px', padding:'5px 12px', color: liked ? '#f87171' : '#9ca3af',
                            fontSize:'12px', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'
                        }}
                    >
                        {liked ? '❤️' : '🤍'} {likesCount}
                    </button>
                    <span style={{fontSize:'10px', color:'#64748b'}}>💬 {comments.length}</span>
                </div>

                {/* Comments list */}
                <div style={{flex:1, overflowY:'auto', padding:'8px 14px', display:'flex', flexDirection:'column', gap:'8px'}}>
                    {comments.length === 0 ? (
                        <div style={{textAlign:'center', color:'#64748b', fontSize:'11px', padding:'12px 0'}}>
                            {lang === 'ar' ? 'لا توجد تعليقات' : 'No comments yet'}
                        </div>
                    ) : comments.map(c => {
                        const isMyComment = currentUser?.uid === c.authorUID;
                        const isMomentOwner = isOwnProfile;
                        return (
                            <div key={c.id} style={{display:'flex', gap:'8px', alignItems:'flex-start'}}>
                                {c.authorPhoto
                                    ? <img src={c.authorPhoto} alt="" style={{width:'24px', height:'24px', borderRadius:'50%', objectFit:'cover', flexShrink:0}} />
                                    : <div style={{width:'24px', height:'24px', borderRadius:'50%', background:'#374151', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px'}}>👤</div>
                                }
                                <div style={{background:'rgba(255,255,255,0.05)', borderRadius:'10px', padding:'6px 10px', flex:1, minWidth:0}}>
                                    <div style={{fontSize:'9px', fontWeight:700, color:'#00f2ff', marginBottom:'2px'}}>{c.authorName}</div>
                                    <div style={{fontSize:'11px', color:'#e2e8f0', lineHeight:1.4, wordBreak:'break-word'}}>{c.text}</div>
                                </div>
                                {/* Actions: delete for owner/moment-owner, report for all non-authors */}
                                <div style={{display:'flex', flexDirection:'column', gap:'3px', flexShrink:0}}>
                                    {(isMyComment || isMomentOwner) && (
                                        <button
                                            onClick={() => handleDeleteComment(c.id)}
                                            title={lang === 'ar' ? 'حذف' : 'Delete'}
                                            style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'5px', color:'#f87171', fontSize:'9px', padding:'2px 5px', cursor:'pointer', lineHeight:1}}
                                        >✕</button>
                                    )}
                                    {!isMyComment && currentUser && (
                                        <button
                                            onClick={() => { setReportTargetComment(c); setShowReportCommentModal(true); }}
                                            title={lang === 'ar' ? 'إبلاغ' : 'Report'}
                                            style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'5px', color:'#6b7280', fontSize:'9px', padding:'2px 5px', cursor:'pointer', lineHeight:1}}
                                        >🚩</button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Comment input */}
                {currentUser && (
                    <div style={{padding:'10px 14px', borderTop:'1px solid rgba(255,255,255,0.08)'}}>
                        {isCoolingDown ? (
                            /* Cooldown banner - shown INSIDE modal in place of input */
                            <div style={{
                                display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
                                padding:'10px 14px', borderRadius:'12px',
                                background:'linear-gradient(135deg,rgba(255,136,0,0.12),rgba(255,60,0,0.08))',
                                border:'1px solid rgba(255,136,0,0.3)'
                            }}>
                                <div style={{
                                    width:'36px', height:'36px', borderRadius:'50%', flexShrink:0,
                                    background:'rgba(255,136,0,0.15)', border:'2px solid rgba(255,136,0,0.4)',
                                    display:'flex', alignItems:'center', justifyContent:'center',
                                    fontSize:'16px'
                                }}>⏳</div>
                                <div>
                                    <div style={{fontSize:'11px', fontWeight:700, color:'#fb923c'}}>
                                        {lang === 'ar' ? 'انتظر قبل التعليق التالي' : 'Wait before next comment'}
                                    </div>
                                    <div style={{fontSize:'10px', color:'#9ca3af', marginTop:'2px'}}>
                                        {lang === 'ar' ? `${cooldownRemaining} ثانية` : `${cooldownRemaining}s remaining`}
                                    </div>
                                </div>
                                {/* Progress bar */}
                                <div style={{flex:1, height:'4px', background:'rgba(255,255,255,0.08)', borderRadius:'2px', overflow:'hidden'}}>
                                    <div style={{
                                        height:'100%', borderRadius:'2px',
                                        background:'linear-gradient(90deg,#ff8800,#ff4500)',
                                        width:`${(cooldownRemaining / 60) * 100}%`,
                                        transition:'width 1s linear'
                                    }}/>
                                </div>
                            </div>
                        ) : (
                            <div style={{display:'flex', gap:'8px'}}>
                                <input
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleComment()}
                                    placeholder={lang === 'ar' ? 'اكتب تعليقاً...' : 'Write a comment...'}
                                    style={{flex:1, background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'8px 12px', color:'white', fontSize:'12px', outline:'none', fontFamily:'inherit'}}
                                />
                                <button
                                    onClick={handleComment}
                                    disabled={!newComment.trim() || submitting}
                                    style={{background:GR.NEON, border:'none', borderRadius:'10px', color:'white', fontSize:'12px', fontWeight:700, padding:'8px 14px', cursor:'pointer', opacity: (!newComment.trim() || submitting) ? 0.5 : 1}}
                                >
                                    {lang === 'ar' ? 'إرسال' : 'Send'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── REPORT MOMENT MODAL ── */}
                {showReportMomentModal && (
                    <PortalModal>
                        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:Z.TOOLTIP,padding:'16px'}} onClick={() => setShowReportMomentModal(false)}>
                            <div style={{background:GR.DARK_CARD,border:'1px solid rgba(239,68,68,0.3)',borderRadius:'14px',padding:'20px',maxWidth:'300px',width:'100%'}} onClick={e => e.stopPropagation()}>
                                <div style={{fontSize:'22px',textAlign:'center',marginBottom:'6px'}}>🚩</div>
                                <div style={{fontSize:'14px',fontWeight:800,color:'white',textAlign:'center',marginBottom:'4px'}}>
                                    {lang==='ar'?'إبلاغ عن اللحظة':'Report Moment'}
                                </div>
                                <div style={{fontSize:'11px',color:'#9ca3af',textAlign:'center',marginBottom:'14px'}}>
                                    {lang==='ar'?'اختر سبب الإبلاغ:':'Select a reason:'}
                                </div>
                                <div style={{display:'flex',flexDirection:'column',gap:'6px',marginBottom:'14px'}}>
                                    {[
                                        {key:'offensive_image', icon:'🖼️', ar:'صورة مسيئة/مهينة', en:'Offensive Image'},
                                        {key:'verbal_abuse',    icon:'💬', ar:'شتيمة/إهانة',       en:'Verbal Abuse'},
                                        {key:'spam',            icon:'📢', ar:'سبام',               en:'Spam'},
                                        {key:'other',           icon:'❓', ar:'سبب آخر',            en:'Other'}
                                    ].map(r => (
                                        <button key={r.key} onClick={() => setMomentReportReason(r.key)} style={{
                                            padding:'8px 12px', borderRadius:'8px', fontSize:'12px', cursor:'pointer',
                                            display:'flex', alignItems:'center', gap:'8px', fontWeight:600, textAlign:'start',
                                            background: momentReportReason===r.key ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)',
                                            border: momentReportReason===r.key ? '1.5px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
                                            color: momentReportReason===r.key ? '#fca5a5' : '#9ca3af'
                                        }}>
                                            <span>{r.icon}</span><span>{lang==='ar'?r.ar:r.en}</span>
                                        </button>
                                    ))}
                                </div>
                                <div style={{display:'flex',gap:'8px'}}>
                                    <button onClick={() => { setShowReportMomentModal(false); setMomentReportReason(''); }} style={{flex:1,padding:'8px',borderRadius:'8px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'#9ca3af',fontSize:'12px',fontWeight:700,cursor:'pointer'}}>
                                        {lang==='ar'?'إلغاء':'Cancel'}
                                    </button>
                                    <button onClick={handleReportMoment} disabled={!momentReportReason} style={{flex:1,padding:'8px',borderRadius:'8px',background: momentReportReason ? 'rgba(239,68,68,0.2)' : 'rgba(100,100,100,0.1)',border: momentReportReason ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.05)',color: momentReportReason ? '#f87171' : '#4b5563',fontSize:'12px',fontWeight:700,cursor: momentReportReason ? 'pointer' : 'default',opacity: momentReportReason ? 1 : 0.5}}>
                                        {lang==='ar'?'إرسال':'Submit'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </PortalModal>
                )}

                {/* ── REPORT COMMENT MODAL ── */}
                {showReportCommentModal && reportTargetComment && (
                    <PortalModal>
                        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:Z.TOOLTIP,padding:'16px'}} onClick={() => { setShowReportCommentModal(false); setReportTargetComment(null); }}>
                            <div style={{background:GR.DARK_CARD,border:'1px solid rgba(239,68,68,0.3)',borderRadius:'14px',padding:'20px',maxWidth:'300px',width:'100%'}} onClick={e => e.stopPropagation()}>
                                <div style={{fontSize:'22px',textAlign:'center',marginBottom:'6px'}}>🚩</div>
                                <div style={{fontSize:'14px',fontWeight:800,color:'white',textAlign:'center',marginBottom:'4px'}}>
                                    {lang==='ar'?'إبلاغ عن تعليق':'Report Comment'}
                                </div>
                                {/* Show the comment content */}
                                <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'8px',padding:'8px 10px',marginBottom:'12px',fontSize:'11px',color:'#cbd5e1',maxHeight:'60px',overflow:'hidden',textOverflow:'ellipsis'}}>
                                    💬 {reportTargetComment.text}
                                </div>
                                <div style={{fontSize:'11px',color:'#9ca3af',textAlign:'center',marginBottom:'10px'}}>
                                    {lang==='ar'?'اختر سبب الإبلاغ:':'Select a reason:'}
                                </div>
                                <div style={{display:'flex',flexDirection:'column',gap:'6px',marginBottom:'14px'}}>
                                    {[
                                        {key:'verbal_abuse', icon:'💬', ar:'شتيمة/إهانة',    en:'Verbal Abuse'},
                                        {key:'spam',         icon:'📢', ar:'سبام',            en:'Spam'},
                                        {key:'harassment',   icon:'😡', ar:'مضايقة',          en:'Harassment'},
                                        {key:'other',        icon:'❓', ar:'سبب آخر',         en:'Other'}
                                    ].map(r => (
                                        <button key={r.key} onClick={() => setCommentReportReason(r.key)} style={{
                                            padding:'8px 12px', borderRadius:'8px', fontSize:'12px', cursor:'pointer',
                                            display:'flex', alignItems:'center', gap:'8px', fontWeight:600,
                                            background: commentReportReason===r.key ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)',
                                            border: commentReportReason===r.key ? '1.5px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
                                            color: commentReportReason===r.key ? '#fca5a5' : '#9ca3af'
                                        }}>
                                            <span>{r.icon}</span><span>{lang==='ar'?r.ar:r.en}</span>
                                        </button>
                                    ))}
                                </div>
                                <div style={{display:'flex',gap:'8px'}}>
                                    <button onClick={() => { setShowReportCommentModal(false); setReportTargetComment(null); setCommentReportReason(''); }} style={{flex:1,padding:'8px',borderRadius:'8px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'#9ca3af',fontSize:'12px',fontWeight:700,cursor:'pointer'}}>
                                        {lang==='ar'?'إلغاء':'Cancel'}
                                    </button>
                                    <button onClick={handleReportCommentSubmit} disabled={!commentReportReason} style={{flex:1,padding:'8px',borderRadius:'8px',background: commentReportReason ? 'rgba(239,68,68,0.2)' : 'rgba(100,100,100,0.1)',border: commentReportReason ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.05)',color: commentReportReason ? '#f87171' : '#4b5563',fontSize:'12px',fontWeight:700,cursor: commentReportReason ? 'pointer' : 'default',opacity: commentReportReason ? 1 : 0.5}}>
                                        {lang==='ar'?'إرسال':'Submit'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </PortalModal>
                )}

                {/* Delete confirm - PortalModal to escape overflow:hidden */}
                {showDeleteConfirm && (
                    <PortalModal>
                        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:Z.TOOLTIP, padding:'16px'}} onClick={() => setShowDeleteConfirm(false)}>
                            <div style={{background:GR.DARK_CARD, border:'1px solid rgba(239,68,68,0.35)', borderRadius:'14px', padding:'22px 24px', textAlign:'center', maxWidth:'260px', width:'100%'}} onClick={e => e.stopPropagation()}>
                                <div style={{fontSize:'32px', marginBottom:'8px'}}>🗑️</div>
                                <div style={{fontSize:'14px', fontWeight:800, color:'white', marginBottom:'6px'}}>
                                    {lang === 'ar' ? 'حذف اللحظة؟' : 'Delete Moment?'}
                                </div>
                                <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'18px'}}>
                                    {lang === 'ar' ? 'لا يمكن التراجع عن هذا الإجراء' : 'This action cannot be undone'}
                                </div>
                                <div style={{display:'flex', gap:'8px'}}>
                                    <button onClick={() => setShowDeleteConfirm(false)} style={{flex:1, padding:'9px', borderRadius:'8px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'#9ca3af', fontSize:'12px', fontWeight:700, cursor:'pointer'}}>
                                        {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                                    </button>
                                    <button onClick={() => { setShowDeleteConfirm(false); onDelete(moment.id); }} style={{flex:1, padding:'9px', borderRadius:'8px', background:'rgba(239,68,68,0.18)', border:'1px solid rgba(239,68,68,0.4)', color:'#f87171', fontSize:'12px', fontWeight:700, cursor:'pointer'}}>
                                        {lang === 'ar' ? 'حذف' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </PortalModal>
                )}
            </div>
        </div>
    );
};

const CreateMomentModal = ({ onClose, currentUser, lang, onPosted }) => {
    const [momentType, setMomentType] = useState('text');
    const [textContent, setTextContent] = useState('');  // text content OR caption
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError('');

        if (momentType === 'image') {
            if (file.size > MAX_IMAGE_SIZE) {
                setError(lang === 'ar' ? 'حجم الصورة كبير جداً (الحد 2MB)' : 'Image too large (max 2MB)');
                return;
            }
            // Compress image with canvas to stay under Firestore 1MB doc limit
            const reader = new FileReader();
            reader.onload = ev => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_W = 800, MAX_H = 800;
                    let w = img.width, h = img.height;
                    if (w > MAX_W || h > MAX_H) {
                        const ratio = Math.min(MAX_W / w, MAX_H / h);
                        w = Math.round(w * ratio);
                        h = Math.round(h * ratio);
                    }
                    canvas.width = w; canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    const compressed = canvas.toDataURL('image/jpeg', 0.6);
                    setMediaPreview(compressed);
                    setMediaFile(file);
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        } else if (momentType === 'video') {
            if (file.size > MAX_VIDEO_SIZE) {
                setError(lang === 'ar' ? 'حجم الفيديو كبير جداً (الحد 5MB)' : 'Video too large (max 5MB)');
                return;
            }
            const url = URL.createObjectURL(file);
            const video = document.createElement('video');
            video.src = url;
            video.onloadedmetadata = () => {
                URL.revokeObjectURL(url);
                if (video.duration > MAX_VIDEO_DURATION) {
                    setError(lang === 'ar' ? `الفيديو يجب أن يكون ${MAX_VIDEO_DURATION} ثواني فقط` : `Video must be max ${MAX_VIDEO_DURATION} seconds`);
                    return;
                }
                const reader = new FileReader();
                reader.onload = ev => setMediaPreview(ev.target.result);
                reader.readAsDataURL(file);
                setMediaFile(file);
            };
        }
    };

    const handleSubmit = async () => {
        if (!currentUser) return;
        if (momentType === 'text' && !textContent.trim()) return;
        if ((momentType === 'image' || momentType === 'video') && !mediaFile) return;
        setUploading(true);

        try {
            const momentData = {
                authorUID: currentUser.uid,
                authorName: currentUser.displayName || (lang === 'ar' ? 'مستخدم' : 'User'),
                authorPhoto: currentUser.photoURL || null,
                authorVipLevel: getVIPLevel(currentUser) || 0,
                type: momentType,
                content: textContent.trim(), // caption for image/video, full text for text type
                mediaUrl: (momentType === 'image' || momentType === 'video') ? mediaPreview : null,
                likesCount: 0,
                likedBy: [],
                commentsCount: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            await momentsCollection.add(momentData);
            // ✅ Track mission: momentsPosted
            try {
                const today = new Date().toDateString();
                const dp = currentUser?.missionProgress?.daily || {};
                const now2 = new Date(); const soy = new Date(now2.getFullYear(),0,1);
                const wNum = Math.ceil(((now2-soy)/86400000+soy.getDay()+1)/7);
                const wStr = `${now2.getFullYear()}-W${wNum}`;
                const wp = currentUser?.missionProgress?.weekly || {};
                const mUpdates = {};
                if (dp.resetDate !== today) {
                    mUpdates['missionProgress.daily.resetDate'] = today;
                    mUpdates['missionProgress.daily.momentsPosted'] = 1;
                } else {
                    mUpdates['missionProgress.daily.momentsPosted'] = firebase.firestore.FieldValue.increment(1);
                }
                if (wp.resetWeek !== wStr) {
                    mUpdates['missionProgress.weekly.resetWeek'] = wStr;
                    mUpdates['missionProgress.weekly.momentsPosted'] = 1;
                } else {
                    mUpdates['missionProgress.weekly.momentsPosted'] = firebase.firestore.FieldValue.increment(1);
                }
                await usersCollection.doc(currentUser.uid).update(mUpdates);
            } catch (me) {}
            if (onPosted) onPosted();
            onClose();
        } catch (e) {
            setError(lang === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'Error occurred, try again');
        }
        setUploading(false);
    };

    return (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:Z.MODAL, padding:'16px'}} onClick={onClose}>
            <div style={{background:GR.DARK_CARD, border:'1px solid rgba(0,242,255,0.25)', borderRadius:'16px', width:'100%', maxWidth:'360px', overflow:'hidden'}} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                    <span style={{fontWeight:800, fontSize:'15px', color:'white'}}>{lang === 'ar' ? '📸 لحظة جديدة' : '📸 New Moment'}</span>
                    <button onClick={onClose} style={{background:'rgba(255,255,255,0.1)', border:'none', color:'#9ca3af', fontSize:'16px', cursor:'pointer', borderRadius:'6px', padding:'4px 8px'}}>✕</button>
                </div>

                <div style={{padding:'16px'}}>
                    {/* Type selector */}
                    <div style={{display:'flex', gap:'6px', marginBottom:'14px'}}>
                        {[
                            {id:'text', icon:'✏️', ar:'نص', en:'Text'},
                            {id:'image', icon:'🖼️', ar:'صورة', en:'Image'},
                            {id:'video', icon:'🎥', ar:'فيديو', en:'Video'}
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => { setMomentType(t.id); setMediaFile(null); setMediaPreview(null); setError(''); }}
                                style={{
                                    flex:1, padding:'8px 4px', borderRadius:'10px', fontSize:'11px', fontWeight:700, cursor:'pointer',
                                    background: momentType === t.id ? 'rgba(0,242,255,0.2)' : 'rgba(255,255,255,0.04)',
                                    border: momentType === t.id ? '1.5px solid #00f2ff' : '1px solid rgba(255,255,255,0.1)',
                                    color: momentType === t.id ? '#00f2ff' : '#9ca3af',
                                    display:'flex', alignItems:'center', justifyContent:'center', gap:'4px'
                                }}
                            >
                                {t.icon} {lang === 'ar' ? t.ar : t.en}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    {momentType === 'text' && (
                        <textarea
                            value={textContent}
                            onChange={e => setTextContent(e.target.value)}
                            maxLength={280}
                            placeholder={lang === 'ar' ? 'اكتب لحظتك هنا...' : 'Write your moment here...'}
                            style={{width:'100%', background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'10px 12px', color:'white', fontSize:'13px', fontFamily:'inherit', resize:'none', height:'100px', outline:'none'}}
                        />
                    )}

                    {(momentType === 'image' || momentType === 'video') && (
                        <div>
                            <input ref={fileRef} type="file" accept={momentType === 'image' ? 'image/*' : 'video/*'} onChange={handleFileChange} style={{display:'none'}} />
                            {mediaPreview ? (
                                <div style={{position:'relative', borderRadius:'10px', overflow:'hidden', marginBottom:'8px'}}>
                                    {momentType === 'image'
                                        ? <img src={mediaPreview} alt="" style={{width:'100%', maxHeight:'180px', objectFit:'cover'}} />
                                        : <video src={mediaPreview} controls style={{width:'100%', maxHeight:'180px'}} />
                                    }
                                    <button onClick={() => { setMediaFile(null); setMediaPreview(null); setTextContent(''); }} style={{position:'absolute', top:'6px', right:'6px', background:'rgba(0,0,0,0.7)', border:'none', color:'white', borderRadius:'50%', width:'24px', height:'24px', cursor:'pointer', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center'}}>✕</button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    style={{border:'2px dashed rgba(0,242,255,0.3)', borderRadius:'10px', padding:'24px', textAlign:'center', cursor:'pointer', color:'#64748b', fontSize:'12px'}}
                                >
                                    <div style={{fontSize:'28px', marginBottom:'6px'}}>{momentType === 'image' ? '🖼️' : '🎥'}</div>
                                    <div>{lang === 'ar' ? 'انقر لاختيار ملف' : 'Click to select file'}</div>
                                    <div style={{fontSize:'9px', marginTop:'4px', color:'#475569'}}>
                                        {momentType === 'image' ? (lang === 'ar' ? 'الحد الأقصى 2MB' : 'Max 2MB') : (lang === 'ar' ? 'الحد 10 ثواني / 5MB' : 'Max 10s / 5MB')}
                                    </div>
                                </div>
                            )}
                            {/* Caption field - optional text with image/video */}
                            <textarea
                                value={textContent}
                                onChange={e => setTextContent(e.target.value)}
                                maxLength={200}
                                placeholder={lang === 'ar' ? 'أضف تعليقاً (اختياري)...' : 'Add a caption (optional)...'}
                                style={{width:'100%', marginTop:'8px', background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'8px 12px', color:'white', fontSize:'12px', fontFamily:'inherit', resize:'none', height:'56px', outline:'none'}}
                            />
                        </div>
                    )}

                    {error && <div style={{color:'#f87171', fontSize:'11px', marginTop:'6px', textAlign:'center'}}>{error}</div>}

                    <button
                        onClick={handleSubmit}
                        disabled={uploading || (momentType === 'text' ? !textContent.trim() : !mediaFile)}
                        style={{
                            width:'100%', marginTop:'12px', padding:'12px', borderRadius:'12px',
                            background:GR.NEON, color:'white',
                            fontSize:'14px', fontWeight:800, border:'none', cursor:'pointer',
                            opacity: (uploading || (momentType === 'text' ? !textContent.trim() : !mediaFile)) ? 0.5 : 1
                        }}
                    >
                        {uploading ? (lang === 'ar' ? 'جارٍ النشر...' : 'Posting...') : (lang === 'ar' ? 'نشر اللحظة 🚀' : 'Post Moment 🚀')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const MomentsSettingsSection = ({ currentUser, userData, lang }) => {
    const [moments, setMoments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedMoment, setSelectedMoment] = useState(null);

    useEffect(() => {
        if (!currentUser?.uid) return;
        const unsub = momentsCollection
            .where('authorUID', '==', currentUser.uid)
            .limit(20)
            .onSnapshot(snap => {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                data.sort((a, b) => {
                    const ta = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
                    const tb = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
                    return tb - ta;
                });
                setMoments(data);
                setLoading(false);
            }, () => setLoading(false));
        return unsub;
    }, [currentUser?.uid]);

    return (
        <div>
            <button
                onClick={() => setShowCreateModal(true)}
                style={{width:'100%', padding:'10px', borderRadius:'10px', background:'linear-gradient(135deg,rgba(0,242,255,0.15),rgba(112,0,255,0.1))', border:'1px solid rgba(0,242,255,0.3)', color:'#00f2ff', fontSize:'13px', fontWeight:800, cursor:'pointer', marginBottom:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}
            >
                <span>📸</span>
                <span>{lang === 'ar' ? 'إضافة لحظة جديدة' : 'Add New Moment'}</span>
            </button>

            {loading ? (
                <div style={{textAlign:'center', padding:'16px', color:'#64748b', fontSize:'12px'}}>...</div>
            ) : moments.length === 0 ? (
                <div style={{textAlign:'center', padding:'20px', color:'#64748b', fontSize:'12px'}}>
                    {lang === 'ar' ? 'لا توجد لحظات بعد. أضف أول لحظة!' : 'No moments yet. Add your first moment!'}
                </div>
            ) : (
                <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'6px'}}>
                    {moments.map(moment => (
                        <div key={moment.id} onClick={() => setSelectedMoment(moment)} style={{aspectRatio:'1', borderRadius:'8px', overflow:'hidden', background:'rgba(31,41,55,0.6)', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', position:'relative', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            {moment.type === 'text' ? (
                                <div style={{padding:'6px', fontSize:'9px', color:'#e2e8f0', textAlign:'center', wordBreak:'break-word', lineHeight:1.4, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:4, WebkitBoxOrient:'vertical'}}>{moment.content}</div>
                            ) : moment.type === 'image' ? (
                                <img src={moment.mediaUrl} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                            ) : (
                                <div style={{width:'100%', height:'100%', position:'relative', background:'#000', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                    <span style={{fontSize:'24px', opacity:0.7}}>🎥</span>
                                </div>
                            )}
                            <div style={{position:'absolute', bottom:'2px', right:'2px', background:'rgba(0,0,0,0.7)', borderRadius:'6px', padding:'1px 5px', fontSize:'8px', color:'#f87171', fontWeight:700}}>
                                ❤️ {moment.likesCount || 0}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && <CreateMomentModal onClose={() => setShowCreateModal(false)} currentUser={currentUser} lang={lang} />}
            {selectedMoment && (
                <MomentDetailModal
                    moment={selectedMoment}
                    onClose={() => setSelectedMoment(null)}
                    currentUser={currentUser}
                    isOwnProfile={true}
                    lang={lang}
                    onDelete={(id) => { momentsCollection.doc(id).delete(); setSelectedMoment(null); }}
                />
            )}
        </div>
    );
};

// 🎯 PROFILE V11 - MAIN COMPONENT
const ProfileV11 = ({
    show,
    onClose,
    targetUID,
    lang,
    currentUserUID,
    onSendFriendRequest,
    onSendGift,
    userData,
    currentUserFriends,
    currentUserFriendRequests,
    friendsData,
    isOwnProfileOverride = false,
    onOpenSettings,
    onOpenShop,
    onOpenInventory,
    onLogout,
    onLoginGoogle,
    isLoggedIn: isLoggedInProp,
    isGuest: isGuestProp,
    sessionClaimedToday,
    onOpenLoginRewards,
    currency: currencyProp,
    onOpenChat,
    onOpenProfile
}) => {
    const t = TRANSLATIONS[lang] || {};

    const [targetData, setTargetData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [blockedByTarget, setBlockedByTarget] = useState(false);
    const [showBlockConfirm, setShowBlockConfirm] = useState(false);
    const [gifts, setGifts] = useState([]);
    const [charismaRank, setCharismaRank] = useState(null);
    const [copiedId, setCopiedId] = useState(false);
    const [bannerURL, setBannerURL] = useState(null);
    const [bannerUploading, setBannerUploading] = useState(false);
    const bannerFileRef = useRef(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportSending, setReportSending] = useState(false);
    const [selfGift, setSelfGift] = useState(null);
    const [showSelfGiftModal, setShowSelfGiftModal] = useState(false);

    const optionsRef = useRef(null);

    useEffect(() => {
        if (!show || !targetUID) {
            setLoading(true);
            return;
        }

        setLoading(true);
        setRequestSent(false);
        setShowOptionsMenu(false);

        usersCollection.doc(targetUID).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                setTargetData({ id: doc.id, ...data, isGuest: false });
                setBannerURL(data.bannerURL || null);
                const theirBlockedUsers = data.blockedUsers || [];
                setBlockedByTarget(theirBlockedUsers.includes(currentUserUID));
                setLoading(false);
            } else {
                guestsCollection.doc(targetUID).get().then(guestDoc => {
                    if (guestDoc.exists) {
                        setTargetData({ id: guestDoc.id, ...guestDoc.data(), isGuest: true });
                    } else {
                        setTargetData(null);
                    }
                    setLoading(false);
                }).catch(() => {
                    setTargetData(null);
                    setLoading(false);
                });
            }
        }).catch(() => {
            setLoading(false);
            setTargetData(null);
        });
    }, [show, targetUID, currentUserUID]);

    useEffect(() => {
        if (userData && targetUID) {
            const blocked = userData.blockedUsers || [];
            setIsBlocked(blocked.includes(targetUID));
        }
    }, [userData, targetUID]);

    // Fetch gifts without orderBy to avoid Firebase index requirement
    useEffect(() => {
        if (!show || !targetUID) return;

        const unsub = giftsLogCollection
            .where('receiverId', '==', targetUID)
            .limit(50)
            .onSnapshot(snap => {
                const giftData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // Sort in memory instead of query
                giftData.sort((a, b) => {
                    const timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds || 0;
                    const timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds || 0;
                    return timeB - timeA;
                });
                setGifts(giftData);
            }, error => {
            });

        return unsub;
    }, [show, targetUID]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (optionsRef.current && !optionsRef.current.contains(e.target)) {
                setShowOptionsMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calculate charisma rank - must be before early return
    useEffect(() => {
        if (!show || !targetUID || !targetData) return;
        // Get rank from charisma leaderboard
        usersCollection.orderBy('charisma', 'desc').limit(1000).get().then(snap => {
            const users = snap.docs.map((doc, idx) => ({ id: doc.id, rank: idx + 1 }));
            const userRank = users.find(u => u.id === targetUID);
            setCharismaRank(userRank ? userRank.rank : '--');
        }).catch(() => {
            setCharismaRank('--');
        });
    }, [show, targetUID, targetData]);

    if (!show) return null;

    const isOwnProfile = isOwnProfileOverride || targetUID === currentUserUID;
    const isTargetGuest = targetData?.isGuest || targetData?.isAnonymous;
    const isGuestViewer = isGuestProp === true; // current user viewing is a guest
    const isAlreadyFriend = currentUserFriends?.includes(targetUID);
    const hasPendingRequest = currentUserFriendRequests?.includes(targetUID) || requestSent;

    const handleAddFriend = async () => {
        if (isAlreadyFriend || hasPendingRequest) return;
        await onSendFriendRequest(targetUID);
        setRequestSent(true);
    };

    const handleBlockUser = async () => {
        if (!userData || !targetUID) return;
        try {
            await usersCollection.doc(currentUserUID).update({
                blockedUsers: firebase.firestore.FieldValue.arrayUnion(targetUID)
            });
            setIsBlocked(true);
            setShowBlockConfirm(false);
            setShowOptionsMenu(false);
        } catch (error) {
        }
    };

    const handleUnblockUser = async () => {
        if (!userData || !targetUID) return;
        try {
            await usersCollection.doc(currentUserUID).update({
                blockedUsers: firebase.firestore.FieldValue.arrayRemove(targetUID)
            });
            setIsBlocked(false);
            setShowOptionsMenu(false);
        } catch (error) {
        }
    };

    const handleSendReport = async () => {
        if (!reportReason || !currentUserUID || !targetUID) return;
        setReportSending(true);
        try {
            await reportsCollection.add({
                reportedUID: targetUID,
                reportedName: targetData?.displayName || 'Unknown',
                reporterUID: currentUserUID,
                reason: reportReason,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            });
            setShowReportModal(false);
            setReportReason('');
            setShowOptionsMenu(false);
        } catch (e) {
        }
        setReportSending(false);
    };

    const wins = targetData?.stats?.wins || 0;
    const losses = targetData?.stats?.losses || 0;
    const level = Math.floor((targetData?.stats?.xp || 0) / 100) + 1;

    return (
        <div className="modal-overlay" onClick={onClose} style={{zIndex:Z.MODAL}}>
            {targetData?.equipped?.profileEffects && (
                <ProfileEffectOverlay key={`fx-${targetUID}`} effectId={targetData.equipped.profileEffects} />
            )}
            <div className="profile-glass-card animate-pop" onClick={e => e.stopPropagation()}>

                {/* Profile Header Bar - X button on RIGHT, Three dots on LEFT of X */}
                <div className="profile-header-bar">
                    {/* Spacer on left to push buttons to right */}
                    <div style={{ flex: 1 }}></div>

                    {/* Three dots menu (only for other users, NOT for guest viewers) */}
                    {!isOwnProfile && !isTargetGuest && !isGuestViewer && (
                        <div className="profile-options-container" ref={optionsRef}>
                            <button
                                className="profile-options-btn"
                                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                            >
                                ⋮
                            </button>
                            {showOptionsMenu && (
                                <div className="profile-options-menu">
                                    {isBlocked ? (
                                        <button onClick={handleUnblockUser} className="profile-options-item unblock">
                                            <span>🔓</span>
                                            <span>{lang === 'ar' ? 'إلغاء الحظر' : 'Unblock'}</span>
                                        </button>
                                    ) : (
                                        <button onClick={() => { setShowBlockConfirm(true); setShowOptionsMenu(false); }} className="profile-options-item block">
                                            <span>🚫</span>
                                            <span>{lang === 'ar' ? 'حظر' : 'Block'}</span>
                                        </button>
                                    )}
                                    <button onClick={() => { setShowReportModal(true); setShowOptionsMenu(false); }} className="profile-options-item report" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',width:'100%',textAlign:'center'}}>
                                        <span>🚨</span>
                                        <span>{lang === 'ar' ? 'إبلاغ' : 'Report'}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* X button - ALWAYS on the far right */}
                    <button
                        onClick={onClose}
                        className="profile-close-btn"
                    >
                        ✕
                    </button>
                </div>

                {/* Banner upload handler */}
                <input
                    type="file"
                    ref={bannerFileRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !isOwnProfile) return;
                        setBannerUploading(true);
                        const reader = new FileReader();
                        reader.onload = async (ev) => {
                            const img = new Image();
                            img.onload = async () => {
                                const canvas = document.createElement('canvas');
                                const W = 800, H = 200;
                                canvas.width = W; canvas.height = H;
                                const ctx = canvas.getContext('2d');
                                const scale = Math.max(W / img.width, H / img.height);
                                const sw = img.width * scale, sh = img.height * scale;
                                ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh);
                                const base64 = canvas.toDataURL('image/jpeg', 0.55);
                                try {
                                    await usersCollection.doc(targetUID).update({ bannerURL: base64 });
                                    setBannerURL(base64);
                                } catch(err) { }
                                setBannerUploading(false);
                            };
                            img.src = ev.target.result;
                        };
                        reader.readAsDataURL(file);
                    }}
                />
                {/* Cover with Banner + Avatar */}
                <div
                    className="profile-cover"
                    style={bannerURL ? {
                        backgroundImage: `url(${bannerURL})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    } : {}}
                >
                    {/* Camera icon to change banner - only own profile AND not a guest */}
                    {isOwnProfile && !isGuestProp && (
                        <button
                            className="profile-banner-camera"
                            onClick={() => bannerFileRef.current?.click()}
                            title={lang === 'ar' ? 'تغيير البنر' : 'Change banner'}
                            disabled={bannerUploading}
                        >
                            {bannerUploading ? '⏳' : '📷'}
                        </button>
                    )}
                    <div className="profile-avatar-wrapper">
                        <AvatarWithFrameV11
                            photoURL={targetData?.photoURL}
                            equipped={targetData?.equipped}
                            size="lg"
                            isOnline={targetData?.isOnline}
                            effectId={targetData?.equipped?.profileEffects}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="profile-loading">
                        <div className="profile-loading-spinner"></div>
                        <div className="profile-loading-text">{t.loading || 'Loading...'}</div>
                    </div>
                ) : !targetData ? (
                    <div className="profile-loading">
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                        <div className="profile-loading-text">{t.friendNotFound || 'User not found'}</div>
                    </div>
                ) : (
                    <>
                        <div className="profile-identity">
                            <div className="profile-name-row">
                                <UserTitleV11 equipped={targetData?.equipped} lang={lang} />
                                <div style={{display:'flex', alignItems:'center', gap:'5px', justifyContent:'center', flexWrap:'wrap'}}>
                                    <VIPName
                                        displayName={targetData?.displayName || 'Unknown'}
                                        userData={targetData}
                                        className="profile-name"
                                    />
                                    <VIPBadge userData={targetData} size="md" onClick={(lvl) => {}} />
                                    {targetData?.gender === 'male' && (
                                        <span style={{fontSize:'13px', color:'#60a5fa', fontWeight:700, lineHeight:1}}>♂️</span>
                                    )}
                                    {targetData?.gender === 'female' && (
                                        <span style={{fontSize:'13px', color:'#f472b6', fontWeight:700, lineHeight:1}}>♀️</span>
                                    )}
                                    {targetData?.country?.flag && (
                                        <span title={lang === 'ar' ? targetData.country.name_ar : targetData.country.name_en}
                                            style={{fontSize:'16px', lineHeight:1, cursor:'default'}}>
                                            {targetData.country.flag}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <UserBadgesV11 equipped={targetData?.equipped} lang={lang} />

                            <span
                                className="profile-id-display"
                                onClick={() => {
                                    navigator.clipboard.writeText(targetData?.customId || targetData?.uid?.substring(0, 8));
                                    setCopiedId(true);
                                    setTimeout(() => setCopiedId(false), 2000);
                                }}
                            >
                                {copiedId
                                    ? (lang === 'ar' ? '✓ تم النسخ!' : '✓ Copied!')
                                    : `ID: ${targetData?.customId || targetData?.uid?.substring(0, 8)} 📋`
                                }
                            </span>

                            {/* Charisma Display */}
                            {/* Moments Section - above Charisma */}
                            <MomentsSection
                                ownerUID={targetUID}
                                ownerName={targetData?.displayName || ''}
                                currentUser={userData}
                                isOwnProfile={isOwnProfile}
                                lang={lang}
                            />
                            <CharismaDisplay charisma={targetData?.charisma} lang={lang} />
                        </div>

                        {/* ── STATS ROW ── */}
                        <div style={{
                            display:'flex', alignItems:'center', justifyContent:'space-evenly',
                            width:'100%', padding:'10px 8px', boxSizing:'border-box',
                            background:'rgba(0,0,0,0.15)', borderTop:'1px solid rgba(255,255,255,0.05)',
                            borderBottom:'1px solid rgba(255,255,255,0.05)', margin:'8px 0'
                        }}>
                            {/* Wins */}
                            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flex:'1',minWidth:0}}>
                                <span style={{fontSize:'18px',fontWeight:900,color:'#4ade80',lineHeight:1}}>{wins}</span>
                                <span style={{fontSize:'8px',color:'#6b7280',fontWeight:600,textAlign:'center'}}>🏆 {lang==='ar'?'فوز':'Wins'}</span>
                            </div>
                            {/* Divider */}
                            <div style={{width:'1px',height:'32px',background:'rgba(255,255,255,0.08)',flexShrink:0}}/>
                            {/* Losses */}
                            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flex:'1',minWidth:0}}>
                                <span style={{fontSize:'18px',fontWeight:900,color:'#f87171',lineHeight:1}}>{losses}</span>
                                <span style={{fontSize:'8px',color:'#6b7280',fontWeight:600,textAlign:'center'}}>💀 {lang==='ar'?'خسارة':'Losses'}</span>
                            </div>
                            {/* Divider */}
                            <div style={{width:'1px',height:'32px',background:'rgba(255,255,255,0.08)',flexShrink:0}}/>
                            {/* Win Rate */}
                            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flex:'1.2',minWidth:0}}>
                                <WinRateCircleV11 wins={wins} losses={losses} lang={lang} />
                            </div>
                            {/* Divider */}
                            <div style={{width:'1px',height:'32px',background:'rgba(255,255,255,0.08)',flexShrink:0}}/>
                            {/* Rank */}
                            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flex:'1',minWidth:0}}>
                                <span style={{fontSize:'18px',fontWeight:900,color:'#fbbf24',lineHeight:1}}>#{charismaRank||'--'}</span>
                                <span style={{fontSize:'8px',color:'#6b7280',fontWeight:600,textAlign:'center'}}>🎖️ {lang==='ar'?'رتبة':'Rank'}</span>
                            </div>
                            {/* Divider */}
                            <div style={{width:'1px',height:'32px',background:'rgba(255,255,255,0.08)',flexShrink:0}}/>
                            {/* Level */}
                            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flex:'1',minWidth:0}}>
                                <span style={{fontSize:'18px',fontWeight:900,color:'#a78bfa',lineHeight:1}}>{level}</span>
                                <span style={{fontSize:'8px',color:'#6b7280',fontWeight:600,textAlign:'center'}}>⚡ {lang==='ar'?'مستوى':'Level'}</span>
                            </div>
                        </div>

                        <GiftWallV11 gifts={gifts} lang={lang} isOwnProfile={isOwnProfile} userData={userData} onOpenProfile={onOpenProfile} onSendGiftToSelf={isGuestProp ? null : (gift) => { setSelfGift(gift); setShowSelfGiftModal(true); }} />

                        <AchievementsDisplayV11 userData={targetData} lang={lang} />

                        {isBlocked && !isOwnProfile && (
                            <div className="profile-blocked-notice">
                                <span>🚫</span>
                                <span>{lang === 'ar' ? 'لقد حظرت هذا المستخدم' : 'You have blocked this user'}</span>
                            </div>
                        )}

                        {blockedByTarget && !isOwnProfile && (
                            <div className="profile-blocked-notice blocked-by-other">
                                <span>🚫</span>
                                <span>{lang === 'ar' ? 'هذا المستخدم قد حظرك' : 'This user has blocked you'}</span>
                            </div>
                        )}

                        {/* ── GUEST BADGE - visible to ALL viewers ── */}
                        {isTargetGuest && (
                            <div style={{
                                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                                padding:'10px 16px', margin:'6px 0',
                                background:'linear-gradient(135deg,rgba(251,191,36,0.12),rgba(245,158,11,0.08))',
                                border:'1px solid rgba(251,191,36,0.4)',
                                borderRadius:'12px',
                                boxShadow:'0 0 16px rgba(251,191,36,0.12)'
                            }}>
                                <span style={{fontSize:'16px'}}>👤</span>
                                <div>
                                    <div style={{fontSize:'12px', fontWeight:900, color:'#fbbf24', letterSpacing:'0.5px'}}>
                                        {lang==='ar' ? 'حساب ضيف' : 'GUEST ACCOUNT'}
                                    </div>
                                    <div style={{fontSize:'9px', color:'#92400e', fontWeight:600}}>
                                        {lang==='ar' ? 'لا يمكن إضافته كصديق أو إرسال هدايا' : 'Limited features — no friends or gifts'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isOwnProfile && !isTargetGuest && !isBlocked && !blockedByTarget && !isGuestViewer && (
                            <div className="profile-actions">
                                {isAlreadyFriend ? (
                                    /* Already friends → show Chat button */
                                    <button
                                        onClick={() => {
                                            if (onOpenChat) {
                                                onOpenChat({ uid: targetUID, displayName: targetData?.displayName, photoURL: targetData?.photoURL, equipped: targetData?.equipped, id: targetUID });
                                            }
                                        }}
                                        className="profile-action-btn primary"
                                        style={{background:'linear-gradient(135deg,rgba(0,242,255,0.25),rgba(112,0,255,0.2))', borderColor:'rgba(0,242,255,0.4)'}}
                                    >
                                        <span>💬</span>
                                        <span>{lang === 'ar' ? 'محادثة' : 'Chat'}</span>
                                    </button>
                                ) : hasPendingRequest ? (
                                    <button disabled className="profile-action-btn secondary">
                                        <span>⏳</span>
                                        <span>{lang === 'ar' ? 'تم الإرسال' : 'Sent'}</span>
                                    </button>
                                ) : (
                                    <button onClick={handleAddFriend} className="profile-action-btn primary">
                                        <span>👤</span>
                                        <span>{lang === 'ar' ? 'أضف صديق' : 'Add Friend'}</span>
                                    </button>
                                )}
                                <button onClick={() => setShowGiftModal(true)} className="profile-action-btn secondary">
                                    <span>🎁</span>
                                    <span>{lang === 'ar' ? 'أرسل هدية' : 'Send Gift'}</span>
                                </button>
                            </div>
                        )}

                        {/* Own profile action buttons */}
                        {isOwnProfile && (
                            <div style={{padding:'0 12px 12px', display:'flex', gap:'8px'}}>
                                {/* Personal Notes Chat */}
                                <button
                                    onClick={() => onOpenChat && onOpenChat('self')}
                                    style={{
                                        flex:1, padding:'11px', borderRadius:'12px',
                                        background:'linear-gradient(135deg,rgba(0,242,255,0.12),rgba(112,0,255,0.1))',
                                        border:'1px solid rgba(0,242,255,0.3)', color:'#00f2ff',
                                        fontSize:'12px', fontWeight:800, cursor:'pointer',
                                        display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                                        transition:'all 0.2s'
                                    }}
                                >
                                    <span style={{fontSize:'16px'}}>📝</span>
                                    <span>{lang === 'ar' ? 'ملاحظاتي' : 'My Notes'}</span>
                                </button>
                                {/* Self Gift */}
                                <button
                                    onClick={() => setShowSelfGiftModal(true)}
                                    style={{
                                        flex:1, padding:'11px', borderRadius:'12px',
                                        background:GR.GOLD,
                                        border:'1px solid rgba(255,215,0,0.4)', color:'#facc15',
                                        fontSize:'12px', fontWeight:800, cursor:'pointer',
                                        display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                                        transition:'all 0.2s'
                                    }}
                                >
                                    <span style={{fontSize:'16px'}}>🎁</span>
                                    <span>{lang === 'ar' ? 'هدية لنفسي' : 'Gift Myself'}</span>
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Report Modal */}
                {showReportModal && (
                    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:Z.MODAL,padding:'16px'}} onClick={() => setShowReportModal(false)}>
                        <div className="profile-confirm-modal" onClick={e => e.stopPropagation()} style={{maxWidth:'300px'}}>
                            <div className="profile-confirm-icon">🚨</div>
                            <div className="profile-confirm-title">{lang === 'ar' ? 'إبلاغ عن مستخدم' : 'Report User'}</div>
                            <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'10px', textAlign:'center'}}>
                                {lang === 'ar' ? 'اختر سبب الإبلاغ:' : 'Select a reason:'}
                            </div>
                            <div style={{display:'flex', flexDirection:'column', gap:'6px', marginBottom:'14px'}}>
                                {[
                                    {key:'abusive',       icon:'🤬', ar:'سلوك مسيء',       en:'Abusive Behavior'},
                                    {key:'verbal_abuse',  icon:'💬', ar:'شتيمة لفظية',      en:'Verbal Abuse'},
                                    {key:'cheating',      icon:'🎮', ar:'غش في اللعبة',     en:'Cheating'},
                                    {key:'fraud',         icon:'💰', ar:'احتيال',            en:'Fraud'},
                                    {key:'avatar',        icon:'🖼️', ar:'صورة أفاتار مسيئة', en:'Inappropriate Avatar'},
                                    {key:'spam',          icon:'📢', ar:'سبام',              en:'Spam'},
                                    {key:'other',         icon:'❓', ar:'سبب آخر',           en:'Other'}
                                ].map(r => (
                                    <button
                                        key={r.key}
                                        onClick={() => setReportReason(r.key)}
                                        style={{
                                            padding:'8px 12px', borderRadius:'8px', fontSize:'12px',
                                            textAlign:'start', cursor:'pointer', fontWeight:600,
                                            display:'flex', alignItems:'center', gap:'8px',
                                            background: reportReason === r.key ? 'rgba(112,0,255,0.3)' : 'rgba(255,255,255,0.05)',
                                            border: reportReason === r.key ? '1.5px solid #7000ff' : '1px solid rgba(255,255,255,0.1)',
                                            color: reportReason === r.key ? 'white' : '#9ca3af'
                                        }}
                                    >
                                        <span>{r.icon}</span>
                                        <span>{lang === 'ar' ? r.ar : r.en}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="profile-confirm-actions">
                                <button onClick={() => { setShowReportModal(false); setReportReason(''); }} className="cancel">
                                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button onClick={handleSendReport} disabled={!reportReason || reportSending} className="confirm"
                                    style={{opacity: (!reportReason || reportSending) ? 0.5 : 1, background:'#ef4444'}}>
                                    {reportSending ? '...' : (lang === 'ar' ? 'إرسال' : 'Submit')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showBlockConfirm && (
                    <div className="profile-confirm-overlay" onClick={() => setShowBlockConfirm(false)}>
                        <div className="profile-confirm-modal" onClick={e => e.stopPropagation()}>
                            <div className="profile-confirm-icon">🚫</div>
                            <div className="profile-confirm-title">
                                {lang === 'ar' ? 'حظر المستخدم' : 'Block User'}
                            </div>
                            <div className="profile-confirm-message">
                                {lang === 'ar'
                                    ? `هل أنت متأكد من حظر ${targetData?.displayName || 'هذا المستخدم'}؟`
                                    : `Are you sure you want to block ${targetData?.displayName || 'this user'}?`}
                            </div>
                            <div className="profile-confirm-actions">
                                <button onClick={() => setShowBlockConfirm(false)} className="cancel">
                                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button onClick={handleBlockUser} className="confirm">
                                    {lang === 'ar' ? 'حظر' : 'Block'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showGiftModal && targetData && (
                <SendGiftModal
                    show={showGiftModal}
                    onClose={() => setShowGiftModal(false)}
                    targetUser={targetData}
                    currentUser={userData}
                    lang={lang}
                    onSendGift={onSendGift}
                    currency={userData?.currency || 0}
                    friendsData={friendsData}
                />
            )}

            {showSelfGiftModal && userData && (
                <SendGiftModal
                    show={showSelfGiftModal}
                    onClose={() => setShowSelfGiftModal(false)}
                    targetUser={{ uid: userData?.uid, displayName: userData?.displayName || (lang==='ar'?'أنت':'You'), photoURL: userData?.photoURL }}
                    currentUser={userData}
                    lang={lang}
                    onSendGift={async (gift, targetUser) => {
                        if (onSendGift) await onSendGift(gift, targetUser);
                        setShowSelfGiftModal(false);
                    }}
                    currency={userData?.currency || 0}
                    friendsData={[]}
                />
            )}
        </div>
    );
};

// Make ProfileV11 available globally
window.ProfileV11 = ProfileV11;

// Wrap with ErrorBoundary
