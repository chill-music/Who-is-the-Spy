var { 
    getFamilyLevelConfig, 
    createFamily, 
    loadFamilies, 
    searchFamilyByTag 
} = window.FamilyService;
var { FAMILY_CREATE_COST, FAMILY_EMBLEMS } = window.FamilyConstants || { FAMILY_CREATE_COST: 1000, FAMILY_EMBLEMS: ['🛡️','🦅','🦁','👑','⚔️','🐺','🐉'] };
var FamilySignBadge = window.FamilySignBadge;
var { useState, useEffect, useMemo } = React;

var FamilySearch = ({ 
    view, // 'home', 'create', 'join'
    setView, 
    currentUID, 
    currentUserData, 
    lang, 
    onNotification,
    onClose,
    S
}) => {
    // ---- Home State ----
    const [homeTab, setHomeTab] = useState('new'); // 'new' | 'active'
    const [searchQuery, setSearchQuery] = useState('');
    const [families, setFamilies] = useState([]);
    const [loadingFamilies, setLoadingFamilies] = useState(false);

    // ---- Create State ----
    const [tribeEmblem, setFamilyEmblem] = useState('🛡️');
    const [tribeName, setFamilyName] = useState('');
    const [tribeTag, setFamilyTag] = useState('');
    const [tribeDesc, setFamilyDesc] = useState('');
    const [joinMode, setJoinMode] = useState('open');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (view === 'home' || view === 'join') {
            handleLoadFamilies();
        }
    }, [view]);

    var handleLoadFamilies = async () => {
        setLoadingFamilies(true);
        try {
            var data = await loadFamilies();
            setFamilies(data || []);
        } catch (e) {
            console.error(e);
        }
        setLoadingFamilies(false);
    };

    var handleSearch = async () => {
        if (!searchQuery.trim()) return handleLoadFamilies();
        setLoadingFamilies(true);
        try {
            var data = await searchFamilyByTag(searchQuery);
            setFamilies(data || []);
        } catch(e) {}
        setLoadingFamilies(false);
    };

    var handleCreate = async () => {
        if (!tribeName.trim() || !tribeTag.trim() || creating) return;
        
        // Check Charisma Level >= 4
        const charismaLvl = window.getCharismaLevel ? window.getCharismaLevel(currentUserData?.charisma || 0).currentLevel.level : 0;
        if (charismaLvl < 4) {
            onNotification(lang === 'ar' ? 'يجب أن يكون مستوى الكاريزما 4 على الأقل لإنشاء قبيلة' : 'Charisma level must be at least 4 to create a family');
            return;
        }

        if ((currentUserData?.currency || 0) < FAMILY_CREATE_COST) {
            onNotification(lang === 'ar' ? 'رصيد إنتل غير كاف' : 'Not enough Intel balance');
            return;
        }

        setCreating(true);
        try {
            await createFamily({
                currentUID,
                currentUserData,
                emblem: tribeEmblem,
                name: tribeName.trim(),
                tagName: tribeTag.trim(),
                info: tribeDesc.trim(),
                joinMode,
                lang,
                onNotification
            });
            // Successful creation should trigger user doc update listener in 19-family.js 
            // and naturally close this view.
        } catch (e) {
            console.error(e);
            onNotification(e.message);
        }
        setCreating(false);
    };

    // Derived Families List
    const displayFamilies = useMemo(() => {
        let sorted = [...families];
        if (homeTab === 'new') {
            sorted.sort((a,b) => {
                let tA = a.createdAt?.seconds || a.createdAt || 0;
                let tB = b.createdAt?.seconds || b.createdAt || 0;
                return tB - tA; // Newest first
            });
        } else {
            sorted.sort((a,b) => {
                let aAct = a.weeklyActiveness || a.activeness || 0;
                let bAct = b.weeklyActiveness || b.activeness || 0;
                return bAct - aAct; // Most active first
            });
        }
        return sorted;
    }, [families, homeTab]);

    if (view === 'home' || view === 'join') {
        const isSearch = view === 'join';
        return (
            <div style={{display:'flex', flexDirection:'column', height:'100%', background:'#f8f9fa'}}>
                {/* Header */}
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px', background:'white', borderBottom:'1px solid #e5e7eb'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        <button onClick={onClose} style={{background:'none', border:'none', fontSize:'24px', cursor:'pointer', color:'#111827', padding:0}}>‹</button>
                        <span style={{fontSize:'18px', fontWeight:800, color:'#111827'}}>{lang==='ar'?'القبائل':'Family Square'}</span>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        <button onClick={() => setView(isSearch ? 'home' : 'join')} style={{background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'#4b5563', padding:0}}>
                            {isSearch ? '✕' : '🔍'}
                        </button>
                        <button onClick={() => setView('create')} style={{padding:'6px 16px', borderRadius:'20px', background:'white', border:'1px solid #e5e7eb', color:'#111827', fontSize:'14px', fontWeight:600, cursor:'pointer', boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
                            {lang==='ar'?'إنشاء':'Create'}
                        </button>
                    </div>
                </div>

                {/* Search Input (if in join view) */}
                {isSearch && (
                    <div style={{padding:'16px', background:'white', borderBottom:'1px solid #e5e7eb'}}>
                        <div style={{display:'flex', position:'relative'}}>
                            <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} placeholder={lang==='ar'?'ابحث بالتاج للقبيلة...':'Search family tag...'} style={{width:'100%', padding:'12px 40px 12px 16px', borderRadius:'24px', border:'1px solid #e5e7eb', background:'#f3f4f6', fontSize:'14px', outline:'none'}} />
                            <button onClick={handleSearch} style={{position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', fontSize:'18px', cursor:'pointer', color:'#9ca3af'}}>🔍</button>
                        </div>
                    </div>
                )}

                {/* Tabs (only when not searching) */}
                {!isSearch && (
                    <div style={{display:'flex', background:'white', borderBottom:'1px solid #e5e7eb'}}>
                        <button onClick={() => setHomeTab('new')} style={{flex:1, padding:'16px', fontSize:'15px', fontWeight: homeTab==='new'?800:500, color: homeTab==='new'?'#111827':'#9ca3af', border:'none', background:'none', borderBottom: homeTab==='new'?'3px solid #00dbde':'3px solid transparent', cursor:'pointer', transition:'all 0.2s'}}>
                            {lang==='ar'?'قبائل جديدة':'New Recommend'}
                        </button>
                        <button onClick={() => setHomeTab('active')} style={{flex:1, padding:'16px', fontSize:'15px', fontWeight: homeTab==='active'?800:500, color: homeTab==='active'?'#111827':'#9ca3af', border:'none', background:'none', borderBottom: homeTab==='active'?'3px solid #00dbde':'3px solid transparent', cursor:'pointer', transition:'all 0.2s'}}>
                            {lang==='ar'?'توصيات نشطة':'Active Recommend'}
                        </button>
                    </div>
                )}

                {/* List Body */}
                <div style={{flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'12px'}}>
                    {loadingFamilies ? (
                        <div style={{textAlign:'center', padding:'40px', color:'#6b7280', fontSize:'24px'}}>⏳</div>
                    ) : displayFamilies.length === 0 ? (
                        <div style={{textAlign:'center', padding:'40px', color:'#9ca3af', fontSize:'15px'}}>{lang==='ar'?'لا توجد قبائل':'No families found'}</div>
                    ) : (
                        displayFamilies.map((f, i) => {
                            var levelData = getFamilyLevelConfig(f.level || 1);
                            // Ranks presentation
                            var rankIcon = i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
                            var rankBg = i === 0 ? '#fef3c7' : i === 1 ? '#f3f4f6' : i === 2 ? '#ffedd5' : 'transparent';
                            var rankColor = i === 0 ? '#d97706' : i === 1 ? '#4b5563' : i === 2 ? '#c2410c' : '#9ca3af';

                            return (
                                <div key={f.id} style={{display:'flex', alignItems:'center', gap:'12px', background:'white', padding:'12px', borderRadius:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.03)'}}>
                                    <div style={{width:'32px', display:'flex', justifyContent:'center', fontSize:'18px', fontWeight:800, color:rankColor, background:rankBg, borderRadius:'50%', width:'36px', height:'36px', alignItems:'center'}}>
                                        {rankIcon}
                                    </div>
                                    <div style={{width:'56px', height:'56px', borderRadius:'16px', background:'linear-gradient(135deg, #f3f4f6, #e5e7eb)', border:`2px solid ${levelData.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', overflow:'hidden', flexShrink:0}}>
                                        {f.photoURL ? <img src={f.photoURL} style={{width:'100%', height:'100%', objectFit:'cover'}} alt=""/> : (f.emblem || '🛡️')}
                                    </div>
                                    <div style={{flex:1, minWidth:0}}>
                                        <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                                            <span style={{fontSize:'16px', fontWeight:800, color:'#111827', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{f.name}</span>
                                            <span style={{fontSize:'10px', fontWeight:700, padding:'2px 6px', borderRadius:'4px', background:`${levelData.color}22`, color:levelData.color}}>{f.tag} · Lv.{f.level || 1}</span>
                                        </div>
                                        <div style={{fontSize:'12px', color:'#6b7280', margin:'4px 0', display:'flex', alignItems:'center', gap:'6px'}}>
                                            <span style={{display:'flex', alignItems:'center', gap:'4px'}}><span style={{fontSize:'14px', color:'#3b82f6'}}>🛡️</span> {f.activeness || 0}</span>
                                            <span>·</span>
                                            <span style={{display:'flex', alignItems:'center', gap:'4px'}}>👥 {f.members?.length || 0}/{levelData.maxMembers}</span>
                                        </div>
                                        {/* Optional badges for top active etc */}
                                        {i === 0 && <span style={{display:'inline-block', fontSize:'10px', fontWeight:800, color:'#d97706', background:'#fef3c7', padding:'2px 8px', borderRadius:'10px'}}>Top1 active</span>}
                                    </div>
                                    <button onClick={(e)=>{e.stopPropagation(); alert('طلب انضمام غير متصل حالياً للمعاينة');}} style={{padding:'8px 20px', borderRadius:'20px', background:'linear-gradient(135deg, #00dbde, #fc00ff)', border:'none', color:'white', fontSize:'14px', fontWeight:800, cursor:'pointer', boxShadow:'0 4px 10px rgba(0,0,0,0.15)'}}>
                                        {lang==='ar'?'انضمام':'Join'}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    }

    if (view === 'create') {
        const charismaLvl = window.getCharismaLevel ? window.getCharismaLevel(currentUserData?.charisma || 0).currentLevel.level : 0;
        const canCreate = charismaLvl >= 4;

        return (
            <div style={{display:'flex', flexDirection:'column', height:'100%', background:'#111827', color:'white'}}>
                {/* Header */}
                <div style={{display:'flex', alignItems:'center', padding:'16px', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    <button onClick={() => setView('home')} style={{background:'none', border:'none', fontSize:'24px', cursor:'pointer', color:'white', padding:0, marginRight:'16px'}}>‹</button>
                    <span style={{fontSize:'18px', fontWeight:800}}>{lang==='ar'?'تأسيس قبيلة':'Establish Family'}</span>
                </div>

                <div style={{flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:'20px'}}>
                    
                    {/* Preview Component Container */}
                    <div style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'20px', padding:'24px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center'}}>
                        <div style={{width:'80px', height:'80px', borderRadius:'24px', background:'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.2))', border:'2px solid rgba(0,242,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px', marginBottom:'16px', boxShadow:'0 8px 16px rgba(0,242,255,0.15)'}}>
                            {tribeEmblem}
                        </div>
                        <div style={{fontSize:'22px', fontWeight:900, marginBottom:'8px', minHeight:'26px'}}>{tribeName || (lang==='ar'?'اسم القبيلة':'Family Name')}</div>
                        {tribeTag ? (
                            <div style={{display:'flex', alignItems:'center', gap:'6px', justifyContent:'center'}}>
                                <FamilySignBadge tag={tribeTag} color="#a78bfa" small signLevel={1} />
                            </div>
                        ) : (
                            <div style={{fontSize:'12px', color:'#6b7280'}}>{lang==='ar'?'أدخل تاج القبيلة لرؤية الشكل':'Enter family tag to preview sign'}</div>
                        )}
                        <div style={{marginTop:'16px', fontSize:'13px', color:'#9ca3af', maxWidth:'240px', lineHeight:1.5}}>
                            {tribeDesc || (lang==='ar'?'الوصف الخاص بالقبيلة سيظهر هنا...':'Family description will appear here...')}
                        </div>
                    </div>

                    {/* Inputs */}
                    <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                        <div>
                            <div style={{fontSize:'13px', fontWeight:700, color:'#9ca3af', marginBottom:'8px'}}>{lang==='ar'?'اختر صورة القبيلة':'Select Family Emblem'}</div>
                            <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
                                {(FAMILY_EMBLEMS||['🛡️','🦅','🦁','👑','⚔️','🐺','🐉','🎯','⚓','⚡']).map(e => (
                                    <button key={e} onClick={()=>setFamilyEmblem(e)} style={{width:'46px', height:'46px', borderRadius:'14px', border:tribeEmblem===e?'2px solid #00dbde':'1px solid rgba(255,255,255,0.1)', background:tribeEmblem===e?'rgba(0,219,222,0.1)':'rgba(255,255,255,0.03)', fontSize:'24px', cursor:'pointer', transition:'all 0.2s'}}>
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div style={{fontSize:'13px', fontWeight:700, color:'#9ca3af', marginBottom:'8px'}}>{lang==='ar'?'اسم القبيلة *':'Family Name *'}</div>
                            <input value={tribeName} onChange={e=>setFamilyName(e.target.value)} maxLength={14} placeholder={lang==='ar'?'اسم مميز...':'Unique name...'} style={{width:'100%', padding:'16px', borderRadius:'14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', fontSize:'15px', outline:'none', boxSizing:'border-box'}} />
                        </div>

                        <div>
                            <div style={{fontSize:'13px', fontWeight:700, color:'#9ca3af', marginBottom:'8px'}}>{lang==='ar'?'تاج القبيلة *':'Family Tag *'}</div>
                            <input value={tribeTag} onChange={e=>setFamilyTag(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5))} maxLength={5} placeholder="TAG" style={{width:'100%', padding:'16px', borderRadius:'14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#00dbde', fontSize:'16px', fontWeight:900, letterSpacing:'2px', outline:'none', boxSizing:'border-box'}} />
                            <div style={{fontSize:'11px', color:'#6b7280', marginTop:'6px'}}>{lang==='ar'?'من 3 إلى 5 أحرف أو أرقام إنجليزية':'3 to 5 English letters or numbers'}</div>
                        </div>

                        <div>
                            <div style={{fontSize:'13px', fontWeight:700, color:'#9ca3af', marginBottom:'8px'}}>{lang==='ar'?'تعريف القبيلة (اختياري)':'About Family (Optional)'}</div>
                            <textarea value={tribeDesc} onChange={e=>setFamilyDesc(e.target.value)} maxLength={150} rows={3} placeholder="..." style={{width:'100%', padding:'16px', borderRadius:'14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', fontSize:'14px', outline:'none', resize:'none', boxSizing:'border-box', lineHeight:1.5}} />
                        </div>

                        <div>
                            <div style={{fontSize:'13px', fontWeight:700, color:'#9ca3af', marginBottom:'8px'}}>{lang==='ar'?'أسلوب الانضمام':'Join Mode'}</div>
                            <div style={{display:'flex', gap:'12px'}}>
                                <button onClick={()=>setJoinMode('open')} style={{flex:1, padding:'14px', borderRadius:'14px', background:joinMode==='open'?'rgba(0,219,222,0.1)':'rgba(255,255,255,0.05)', border:joinMode==='open'?'1px solid #00dbde':'1px solid transparent', color:joinMode==='open'?'#00dbde':'white', fontSize:'14px', fontWeight:700, cursor:'pointer', transition:'all 0.2s'}}>
                                    {lang==='ar'?'مفتوح للجميع':'Open to all'}
                                </button>
                                <button onClick={()=>setJoinMode('approval')} style={{flex:1, padding:'14px', borderRadius:'14px', background:joinMode==='approval'?'rgba(252,0,255,0.1)':'rgba(255,255,255,0.05)', border:joinMode==='approval'?'1px solid #fc00ff':'1px solid transparent', color:joinMode==='approval'?'#fc00ff':'white', fontSize:'14px', fontWeight:700, cursor:'pointer', transition:'all 0.2s'}}>
                                    {lang==='ar'?'بالموافقة':'By approval'}
                                </button>
                            </div>
                        </div>

                        {/* Cost & Requirements Box */}
                        <div style={{marginTop:'16px', padding:'20px', borderRadius:'16px', background:'rgba(251,191,36,0.08)', border:'1px dashed rgba(251,191,36,0.3)', textAlign:'center', display:'flex', flexDirection:'column', gap:'8px'}}>
                            <div style={{fontSize:'13px', color:'#fbbf24', fontWeight:700}}>{lang==='ar'?'تكلفة تأسيس القبيلة':'Establishment Cost'}</div>
                            <div style={{fontSize:'32px', fontWeight:900, color:'white', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
                                🧠 {FAMILY_CREATE_COST}
                            </div>
                            <div style={{fontSize:'12px', color:'#9ca3af'}}>
                                {lang==='ar'?`رصيدك الحالي: ${currentUserData?.currency||0} إنتل`:`Current balance: ${currentUserData?.currency||0} Intel`}
                            </div>
                        </div>

                        {/* Submit Actions */}
                        {!canCreate ? (
                            <div style={{padding:'16px', textAlign:'center', color:'#ef4444', background:'rgba(239, 68, 68, 0.1)', borderRadius:'14px', border:'1px solid rgba(239, 68, 68, 0.2)', fontSize:'14px', fontWeight:700, lineHeight:1.6}}>
                                🛑 {lang==='ar'?'لا يمكنك إنشاء قبيلة.':'You cannot create a family.'} 
                                <br />
                                {lang==='ar'?`يجب أن يكون مستوى الكاريزما الخاص بك 4 على الأقل (مستواك الحالي: ${charismaLvl}).`:`Your Charisma Level must be at least 4 (Your level: ${charismaLvl}).`}
                            </div>
                        ) : (
                            <button onClick={handleCreate} disabled={!tribeName.trim() || !tribeTag.trim() || creating} style={{padding:'20px', borderRadius:'16px', background: tribeName.trim() && tribeTag.trim() && !creating ? 'linear-gradient(135deg, #00dbde, #fc00ff)' : 'rgba(255,255,255,0.1)', border:'none', color:tribeName.trim() && tribeTag.trim() ? 'white' : '#9ca3af', fontSize:'16px', fontWeight:900, cursor: tribeName.trim() && tribeTag.trim() && !creating ? 'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginTop:'8px', boxShadow: tribeName.trim() && tribeTag.trim() && !creating ? '0 8px 24px rgba(252,0,255,0.2)' : 'none', transition:'all 0.3s'}}>
                                {creating ? '⏳...' : `🏠 ${lang==='ar'?'تأسيس الآن':'Establish Now'}`}
                            </button>
                        )}
                        <div style={{height:'20px'}} />{/* bottom padding */}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
