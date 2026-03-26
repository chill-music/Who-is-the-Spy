var FamilyRanking = ({ currentUID, lang, isLeaderboard = true }) => {
    const [rankings, setRankRankings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        setLoading(true);
        // Using global firebase and db for now, but following FamilyService pattern
        var familiesCollection = db.collection('families');
        familiesCollection.orderBy('xp', 'desc').limit(50).get().then(snap => {
            setRankings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>⏳</div>;

    var medals = ['🥇', '🥈', '🥉'];

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {rankings.map((fam, i) => {
                    var fl = FamilyService.getFamilyLevelConfig(fam.level || 1);
                    var sign = window.FamilyConstants?.getFamilySignLevelData?.(fam.weeklyActiveness || 0);
                    var signColor = sign?.color || '#6b7280';
                    var signLevel = sign?.level || 1;
                    var isMine = fam.id === currentFamilyId;

                    return (
                        <div key={fam.id}
                            onClick={() => onOpenFamily && onOpenFamily(fam.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                                borderRadius: '16px',
                                background: isMine 
                                    ? 'rgba(0,242,255,0.08)' 
                                    : i < 3 
                                        ? 'rgba(255,215,0,0.04)' 
                                        : 'rgba(255,255,255,0.03)',
                                border: isMine 
                                    ? '1px solid rgba(0,242,255,0.3)' 
                                    : i === 0 
                                        ? '1px solid rgba(255,215,0,0.2)' 
                                        : '1px solid rgba(255,255,255,0.06)',
                                cursor: onOpenFamily ? 'pointer' : 'default',
                                transition: 'all 0.15s ease',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Rank Indicator */}
                            <div style={{ width: '28px', textAlign: 'center', fontSize: '16px', flexShrink: 0 }}>
                                {i < 3 ? medals[i] : <span style={{ fontSize: '11px', color: '#4b5563', fontWeight: 800 }}>#{i + 1}</span>}
                            </div>

                            {/* Emblem */}
                            <div style={{ 
                                width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', 
                                border: `2px solid ${signColor}55`, background: 'rgba(0,0,0,0.4)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                fontSize: '20px', flexShrink: 0 
                            }}>
                                {fam.photoURL ? <img src={fam.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (fam.emblem || '🏠')}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <span style={{ 
                                        fontSize: '13px', fontWeight: 800, color: isMine ? '#00f2ff' : 'white', 
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' 
                                    }}>
                                        {fam.name}
                                    </span>
                                    {sign && window.FamilySignBadge && <window.FamilySignBadge tag={fam.tag} color={signColor} small signLevel={signLevel} imageURL={window.FamilyConstants?.getFamilySignImage?.(0, signLevel)} />}
                                </div>
                                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>{fl.icon} Lv.{fl.level}</span>
                                    <span style={{ opacity: 0.3 }}>|</span>
                                    <span>👥 {(fam.members || []).length}</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 900, color: '#fbbf24' }}>
                                    {window.fmtFamilyNum ? window.fmtFamilyNum(fam.xp || 0) : (fam.xp || 0)} XP
                                </div>
                                {sign && <div style={{ fontSize: '9px', color: signColor, fontWeight: 700 }}>{lang === 'ar' ? sign.name_ar : sign.name_en}</div>}
                            </div>
                            
                            {/* Hover Arrow */}
                            {onOpenFamily && <div style={{ fontSize: '12px', color: '#4b5563', marginLeft: '4px' }}>›</div>}
                        </div>
                    );
                })}
                {rankings.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#4b5563', fontSize: '13px' }}>
                        {lang === 'ar' ? 'لا يوجد ترتيب بعد' : 'No rankings yet'}
                    </div>
                )}
            </div>
        </div>
    );
};

window.FamilyRanking = FamilyRanking;
window.FamilyRankingInline = FamilyRanking; // For backward compatibility if needed internally
