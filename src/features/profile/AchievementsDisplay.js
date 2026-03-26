/**
 * AchievementsDisplay.js
 * Modular component for displaying user achievements in a tiered system.
 * Part of Phase 4: Batch 4 modularization.
 * 
 * @param {Object} props
 * @param {Object} props.userData - The user data containing achievements and stats.
 * @param {string} props.lang - Language code ('ar' or 'en').
 * @param {boolean} [props.showAll=false] - Whether to show all groups initially.
 */
var AchievementsDisplayV11 = ({ userData, lang, showAll = false }) => {
    const rawAchievements = userData?.achievements;

    // Memoized list of unlocked achievement IDs
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

    /**
     * Helper to get the current value for an achievement condition from user data.
     * @param {Object} ach - The achievement object.
     * @returns {number}
     */
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

    // Tier visual configuration constants
    const TIER_STYLE = {
        1: { color: '#9ca3af',  glow: false, label: TRANSLATIONS[lang]?.achTier1 || 'Bronze' },
        2: { color: '#60a5fa',  glow: false, label: TRANSLATIONS[lang]?.achTier2 || 'Silver' },
        3: { color: '#fbbf24',  glow: true,  label: TRANSLATIONS[lang]?.achTier3 || 'Legendary' },
        4: { color: '#00d4ff',  glow: true,  label: TRANSLATIONS[lang]?.achTier4 || 'Divine', ultimate: true, isDivine: true },
    };
    const TIER_DOT_COLOR = { 1: '#78716c', 2: '#60a5fa', 3: '#fbbf24', 4: '#00d4ff' };

    // Memoized grouped achievements
    const groups = React.useMemo(() => {
        const groupMap = {};
        ACHIEVEMENTS.forEach(ach => {
            const g = ach.group || 'misc';
            if (!groupMap[g]) groupMap[g] = [];
            groupMap[g].push(ach);
        });
        
        Object.values(groupMap).forEach(arr => arr.sort((a, b) => a.tier - b.tier));

        return Object.entries(groupMap).map(([groupKey, tiers]) => {
            const highestUnlocked = tiers.reduce((best, ach) =>
                unlockedIds.includes(ach.id) && ach.tier > best ? ach.tier : best, 0);
            
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

    const [selectedGroup, setSelectedGroup] = React.useState(null);
    const unlockedCount  = unlockedIds.length;
    const totalCount     = ACHIEVEMENTS.length;

    return (
        <div className="profile-achievements-section">
            {/* Header with Title and Unlock Progress */}
            <div className="profile-achievements-header" style={{ marginBottom: '12px' }}>
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

            {/* Grid of Achievement Groups */}
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
                                transition: 'transform 0.2s ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <span style={{
                                fontSize:'24px',
                                filter: isUnlocked
                                    ? (ts.ultimate ? `drop-shadow(0 0 10px ${tierColor})` : ts.glow ? `drop-shadow(0 0 6px ${tierColor})` : 'none')
                                    : 'grayscale(100%)'
                            }}>
                                {displayTier.icon || '🏅'}
                            </span>

                            {isUnlocked && (
                                <span style={{
                                    fontSize:'8px', fontWeight:900, color: tierColor,
                                    textTransform:'uppercase', letterSpacing:'0.5px'
                                }}>
                                    {ts.label}
                                </span>
                            )}

                            <span style={{ fontSize:'9px', color: isUnlocked ? '#e2e8f0' : '#6b7280', textAlign:'center', lineHeight:1.3 }}>
                                {TRANSLATIONS[lang]?.[displayTier.nameKey] || groupKey}
                            </span>

                            {/* Tier Progress Dots */}
                            <div style={{ display:'flex', gap:'3px', marginTop:'2px' }}>
                                {tiers.map(a => (
                                    <div key={a.id} style={{
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

                            {/* Circular progress or status */}
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

            {/* Achievement Detail Overlay */}
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

// Export to global scope
window.AchievementsDisplayV11 = AchievementsDisplayV11;
