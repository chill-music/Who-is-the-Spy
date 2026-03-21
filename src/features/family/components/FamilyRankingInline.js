var { familiesCollection } = window;
var { getFamilyLevelConfig, getFamilySignLevelData } = window.FamilyConstants || {};
var { fmtFamilyNum } = window;
var FamilySignBadge = window.FamilySignBadge;

var FamilyRankingInline = ({ currentUID, lang, currentFamilyId, onOpenFamily }) => {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        familiesCollection.orderBy('xp', 'desc').limit(50).get().then(snap => {
            setRankings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div style={{textAlign:'center',padding:'40px',color:'#6b7280'}}>⏳</div>;

    return (
        <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
            {rankings.map((fam, i) => {
                const fl = getFamilyLevelConfig(fam.level || 1);
                const sign = getFamilySignLevelData(fam.weeklyActiveness || 0);
                const signColor = sign?.color || '#6b7280';
                const signLevel = sign?.level || 0;
                const isMine = fam.id === currentFamilyId;
                const medals = ['🥇','🥈','🥉'];
                return (
                    <div key={fam.id}
                        onClick={() => onOpenFamily && onOpenFamily(fam.id)}
                        style={{
                            display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px',
                            borderRadius:'12px',
                            background: isMine ? 'rgba(0,242,255,0.08)' : i < 3 ? 'rgba(255,215,0,0.04)' : 'rgba(255,255,255,0.03)',
                            border: isMine ? '1px solid rgba(0,242,255,0.3)' : i === 0 ? '1px solid rgba(255,215,0,0.2)' : '1px solid rgba(255,255,255,0.06)',
                            cursor: onOpenFamily ? 'pointer' : 'default',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { if (onOpenFamily) e.currentTarget.style.background = isMine ? 'rgba(0,242,255,0.14)' : 'rgba(255,255,255,0.06)'; }}
                        onMouseLeave={e => { if (onOpenFamily) e.currentTarget.style.background = isMine ? 'rgba(0,242,255,0.08)' : i < 3 ? 'rgba(255,215,0,0.04)' : 'rgba(255,255,255,0.03)'; }}
                    >
                        <div style={{width:'24px', textAlign:'center', fontSize:'14px', flexShrink:0}}>
                            {i < 3 ? medals[i] : <span style={{fontSize:'11px',color:'#4b5563',fontWeight:800}}>#{i+1}</span>}
                        </div>
                        <div style={{width:'38px', height:'38px', borderRadius:'50%', overflow:'hidden', border:`2px solid ${signColor}55`, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0}}>
                            {fam.photoURL ? <img src={fam.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : fam.emblem || '🏠'}
                        </div>
                        <div style={{flex:1, minWidth:0}}>
                            <div style={{display:'flex', alignItems:'center', gap:'5px', flexWrap:'wrap'}}>
                                <span style={{fontSize:'12px', fontWeight:800, color: isMine?'#00f2ff':'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'110px'}}>{fam.name}</span>
                                {sign && <FamilySignBadge tag={fam.tag} color={signColor} small signLevel={signLevel} />}
                            </div>
                            <div style={{fontSize:'10px', color:'#6b7280', marginTop:'1px'}}>
                                {fl.icon} Lv.{fl.level} · 👥 {(fam.members||[]).length}
                            </div>
                        </div>
                        <div style={{textAlign:'right', flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'2px'}}>
                            <div style={{fontSize:'12px', fontWeight:900, color:'#fbbf24'}}>{fmtFamilyNum(fam.activeness||0)} XP</div>
                            {sign && <div style={{fontSize:'9px', color: signColor, fontWeight:700}}>{lang==='ar'?sign.name_ar:sign.name_en}</div>}
                            {onOpenFamily && <div style={{fontSize:'9px', color:'#4b5563'}}>›</div>}
                        </div>
                    </div>
                );
            })}
            {rankings.length === 0 && <div style={{textAlign:'center',padding:'30px',color:'#4b5563',fontSize:'12px'}}>{lang==='ar'?'لا يوجد ترتيب بعد':'No rankings yet'}</div>}
        </div>
    );
};


window.FamilyRankingInline = FamilyRankingInline;
