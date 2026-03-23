var { 
    getFamilyLevelConfig, 
    createFamily, 
    loadFamilies, 
    searchFamilyByTag,
    joinFamily
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
    const [previewSignLevel, setPreviewSignLevel] = useState(1);

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

    var handleJoin = async (family) => {
        if (!family?.id) return;
        
        try {
            var res = await joinFamily({
                familyId: family.id,
                currentUID,
                currentUserData,
                lang
            });

            if (res?.status === 'pending') {
                window.Swal.fire({
                    icon: 'info',
                    title: lang === 'ar' ? 'تم إرسال الطلب' : 'Request Sent',
                    text: lang === 'ar' ? 'القبيلة تطلب موافقة للانضمام. تم إرسال طلبك للقائد.' : 'This family requires approval. Your request has been sent to the leaders.',
                    confirmButtonText: lang === 'ar' ? 'حسناً' : 'OK',
                    background: '#1a1a2e', color: '#fff', confirmButtonColor: '#fc00ff'
                });
            } else if (res?.status === 'joined') {
                window.Swal.fire({
                    icon: 'success',
                    title: lang === 'ar' ? 'تم الانضمام' : 'Joined Successfully',
                    text: lang === 'ar' ? 'مرحباً بك في القبيلة!' : 'Welcome to the family!',
                    confirmButtonText: lang === 'ar' ? 'دخول' : 'Enter',
                    background: '#1a1a2e', color: '#fff', confirmButtonColor: '#00dbde'
                }).then(() => {
                    if (onClose) onClose();
                });
            }
        } catch (e) {
            console.error(e);
            let errorMsg = lang === 'ar' ? 'حدث خطأ أثناء الانضمام' : 'Error joining family';
            if (e.message === 'Family is full') errorMsg = lang === 'ar' ? 'القبيلة ممتلئة' : 'Family is full';
            else if (e.message === 'Already requested') errorMsg = lang === 'ar' ? 'تم إرسال طلب سابقاً' : 'Request already sent';
            
            window.Swal.fire({
                icon: 'error',
                title: lang === 'ar' ? 'عفواً' : 'Oops',
                text: errorMsg,
                confirmButtonText: lang === 'ar' ? 'حسناً' : 'OK',
                background: '#1a1a2e', color: '#fff', confirmButtonColor: '#ef4444'
            });
        }
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
                tribeEmblem: tribeEmblem,
                tribeName: tribeName.trim(),
                tribeTag: tribeTag.trim(),
                tribeDesc: tribeDesc.trim(),
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
            <div style={{display:'flex', flexDirection:'column', height:'100%', background:'linear-gradient(135deg, #0b0f19 0%, #1a2235 100%)', color:'white'}}>
                {/* Header */}
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px', background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        <button onClick={onClose} style={{background:'none', border:'none', fontSize:'24px', cursor:'pointer', color:'white', padding:0}}>‹</button>
                        <span style={{fontSize:'18px', fontWeight:800}}>{lang==='ar'?'القبائل':'Family Square'}</span>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        <button onClick={() => setView(isSearch ? 'home' : 'join')} style={{background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'#9ca3af', padding:0}}>
                            {isSearch ? '✕' : '🔍'}
                        </button>
                        <button onClick={() => setView('create')} style={{padding:'6px 16px', borderRadius:'20px', background:'rgba(0,219,222,0.1)', border:'1px solid #00dbde', color:'#00dbde', fontSize:'14px', fontWeight:600, cursor:'pointer', boxShadow:'0 2px 8px rgba(0,219,222,0.15)'}}>
                            {lang==='ar'?'إنشاء':'Create'}
                        </button>
                    </div>
                </div>

                {/* Search Input (if in join view) */}
                {isSearch && (
                    <div style={{padding:'16px', background:'rgba(255,255,255,0.02)', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                        <div style={{display:'flex', position:'relative'}}>
                            <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} placeholder={lang==='ar'?'ابحث بالتاج للقبيلة...':'Search family tag...'} style={{width:'100%', padding:'12px 40px 12px 16px', borderRadius:'24px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(0,0,0,0.2)', color:'white', fontSize:'14px', outline:'none'}} />
                            <button onClick={handleSearch} style={{position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', fontSize:'18px', cursor:'pointer', color:'#9ca3af'}}>🔍</button>
                        </div>
                    </div>
                )}

                {/* Tabs (only when not searching) */}
                {!isSearch && (
                    <div style={{display:'flex', background:'rgba(255,255,255,0.02)', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                        <button onClick={() => setHomeTab('new')} style={{flex:1, padding:'16px', fontSize:'15px', fontWeight: homeTab==='new'?800:500, color: homeTab==='new'?'#00dbde':'#9ca3af', border:'none', background:'none', borderBottom: homeTab==='new'?'3px solid #00dbde':'3px solid transparent', cursor:'pointer', transition:'all 0.2s'}}>
                            {lang==='ar'?'قبائل جديدة':'New Recommend'}
                        </button>
                        <button onClick={() => setHomeTab('active')} style={{flex:1, padding:'16px', fontSize:'15px', fontWeight: homeTab==='active'?800:500, color: homeTab==='active'?'#fc00ff':'#9ca3af', border:'none', background:'none', borderBottom: homeTab==='active'?'3px solid #fc00ff':'3px solid transparent', cursor:'pointer', transition:'all 0.2s'}}>
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
                            var rankBg = i === 0 ? 'rgba(251,191,36,0.1)' : i === 1 ? 'rgba(156,163,175,0.1)' : i === 2 ? 'rgba(234,88,12,0.1)' : 'transparent';
                            var rankColor = i === 0 ? '#fbbf24' : i === 1 ? '#d1d5db' : i === 2 ? '#ea580c' : '#9ca3af';

                            return (
                                <div key={f.id} style={{display:'flex', alignItems:'center', gap:'12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', padding:'12px', borderRadius:'16px', boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}>
                                    <div style={{width:'36px', height:'36px', display:'flex', justifyContent:'center', fontSize:'18px', fontWeight:800, color:rankColor, background:rankBg, borderRadius:'50%', alignItems:'center'}}>
                                        {rankIcon}
                                    </div>
                                    <div style={{width:'56px', height:'56px', borderRadius:'16px', background:'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', border:`2px solid ${levelData.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', overflow:'hidden', flexShrink:0}}>
                                        {f.photoURL ? <img src={f.photoURL} style={{width:'100%', height:'100%', objectFit:'cover'}} alt=""/> : (f.emblem || '🛡️')}
                                    </div>
                                    <div style={{flex:1, minWidth:0}}>
                                        <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                                            <span style={{fontSize:'16px', fontWeight:800, color:'white', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{f.name}</span>
                                            <span style={{fontSize:'10px', fontWeight:700, padding:'2px 6px', borderRadius:'4px', background:`${levelData.color}22`, color:levelData.color, flexShrink:0}}>{f.tag} · Lv.{f.level || 1}</span>
                                        </div>
                                        <div style={{fontSize:'12px', color:'#9ca3af', margin:'4px 0', display:'flex', alignItems:'center', gap:'6px'}}>
                                            <span style={{display:'flex', alignItems:'center', gap:'4px'}}><span style={{fontSize:'14px', color:'#3b82f6'}}>🛡️</span> {f.activeness || 0}</span>
                                            <span>·</span>
                                            <span style={{display:'flex', alignItems:'center', gap:'4px'}}>👥 {f.members?.length || 0}/{levelData.maxMembers}</span>
                                        </div>
                                        {/* Optional badges for top active etc */}
                                        {i === 0 && <span style={{display:'inline-block', fontSize:'10px', fontWeight:800, color:'#fbbf24', background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.2)', padding:'2px 8px', borderRadius:'10px'}}>Top1 active</span>}
                                    </div>
                                    <button onClick={(e)=>{e.stopPropagation(); handleJoin(f);}} style={{padding:'8px 20px', borderRadius:'20px', background:'linear-gradient(135deg, #00dbde, #fc00ff)', border:'none', color:'white', fontSize:'14px', fontWeight:800, cursor:'pointer', boxShadow:'0 4px 10px rgba(0,0,0,0.15)'}}>
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
            <div style={{display:'flex', flexDirection:'column', height:'100%', background:'linear-gradient(135deg, #0b0f19 0%, #1a2235 100%)', color:'white'}}>
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
                            <div style={{display:'flex', alignItems:'center', gap:'16px', justifyContent:'center'}}>
                                <button onClick={() => setPreviewSignLevel(Math.max(1, previewSignLevel - 1))} style={{background:'rgba(255,255,255,0.1)', border:'none', color:'white', width:'30px', height:'30px', borderRadius:'50%', cursor:previewSignLevel>1?'pointer':'not-allowed', opacity:previewSignLevel>1?1:0.3, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:800}}>‹</button>
                                
                                <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'4px'}}>
                                    <FamilySignBadge tag={tribeTag} color="#a78bfa" small={false} signLevel={previewSignLevel} />
                                    <span style={{fontSize:'10px', color:'#9ca3af', fontWeight:700}}>Lv.{previewSignLevel}</span>
                                </div>
                                
                                <button onClick={() => setPreviewSignLevel(Math.min(5, previewSignLevel + 1))} style={{background:'rgba(255,255,255,0.1)', border:'none', color:'white', width:'30px', height:'30px', borderRadius:'50%', cursor:previewSignLevel<5?'pointer':'not-allowed', opacity:previewSignLevel<5?1:0.3, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:800}}>›</button>
                            </div>
                        ) : (
                            <div style={{fontSize:'12px', color:'#6b7280'}}>{lang==='ar'?'أدخل تاج القبيلة لرؤية الشكل':'Enter family tag to preview sign'}</div>
                        )}
                        <div style={{marginTop:'16px', fontSize:'12px', color:'#9ca3af', width:'100%', wordBreak:'break-word', whiteSpace:'pre-wrap', lineHeight:1.5}}>
                            {tribeDesc || (lang==='ar'?'الوصف الخاص بالقبيلة سيظهر هنا...':'Family description will appear here...')}
                        </div>
                    </div>

                    {/* Inputs */}
                    <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                        <div>
                            <div style={{fontSize:'13px', fontWeight:700, color:'#9ca3af', marginBottom:'8px'}}>{lang==='ar'?'اختر صورة القبيلة':'Select Family Emblem'}</div>
                            <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
                                {['🛡️','🦅','🦁','👑','⚔️','🐺','🐉','🎯','⚓','⚡'].map(e => (
                                    <button key={e} onClick={()=>setFamilyEmblem(e)} style={{width:'46px', height:'46px', borderRadius:'14px', border:tribeEmblem===e?'2px solid #00dbde':'1px solid rgba(255,255,255,0.1)', background:tribeEmblem===e?'rgba(0,219,222,0.1)':'rgba(255,255,255,0.03)', fontSize:'24px', cursor:'pointer', transition:'all 0.2s'}}>
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div style={{fontSize:'13px', fontWeight:700, color:'#9ca3af', marginBottom:'8px'}}>{lang==='ar'?'اسم القبيلة *':'Family Name *'}</div>
                            <input value={tribeName} onChange={e=>setFamilyName(e.target.value.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, ''))} maxLength={14} placeholder={lang==='ar'?'اسم مميز (حروف فقط)...':'Unique name (letters only)...'} style={{width:'100%', padding:'16px', borderRadius:'14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', fontSize:'15px', outline:'none', boxSizing:'border-box'}} />
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

window.FamilySearch = FamilySearch;
