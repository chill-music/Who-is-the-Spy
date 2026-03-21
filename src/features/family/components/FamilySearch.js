var { 
    getFamilyLevelConfig, 
    createFamily, 
    loadFamilies, 
    searchFamilyByTag 
} = window.FamilyService;
var { FAMILY_COINS_SYMBOL } = window.FamilyConstants;
var { useState, useEffect } = React;

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
    const [createCost] = useState(100); // Constant or from config
    const [tagName, setTagName] = useState('');
    const [familyInfo, setFamilyInfo] = useState('');
    const [joinMode, setJoinMode] = useState('open');
    const [creating, setCreating] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [families, setFamilies] = useState([]);
    const [loadingFamilies, setLoadingFamilies] = useState(false);

    useEffect(() => {
        if (view === 'join') {
            handleLoadFamilies();
        }
    }, [view]);

    const handleLoadFamilies = async () => {
        setLoadingFamilies(true);
        try {
            const data = await loadFamilies();
            setFamilies(data);
        } catch (e) {
            console.error(e);
        }
        setLoadingFamilies(false);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return handleLoadFamilies();
        setLoadingFamilies(true);
        try {
            const data = await searchFamilyByTag(searchQuery);
            setFamilies(data);
        } catch(e) {}
        setLoadingFamilies(false);
    };

    const handleCreate = async () => {
        if (!tagName.trim() || creating) return;
        setCreating(true);
        try {
            await createFamily({
                currentUID,
                currentUserData,
                tagName: tagName.trim(),
                info: familyInfo.trim(),
                joinMode,
                createCost,
                lang,
                onNotification
            });
            // On success, the parent will detect family via Firestore listener and switch to 'main'
            // We can also manually trigger a refresh if needed, but usually listener handles it.
        } catch (e) {
            console.error(e);
        }
        setCreating(false);
    };

    if (view === 'home') {
        return (
            <div style={{padding:'20px',textAlign:'center',display:'flex',flexDirection:'column',gap:'20px',alignItems:'center',justifyContent:'center',height:'100%'}}>
                <div style={{fontSize:'70px',filter:'drop-shadow(0 0 20px rgba(0,242,255,0.4))'}}>🛡️</div>
                <div>
                    <div style={{fontSize:'22px',fontWeight:900,color:'white',marginBottom:'8px'}}>
                        {lang==='ar'?'انضم إلى عائلة':'Join a Family'}
                    </div>
                    <div style={{fontSize:'13px',color:'#9ca3af',maxWidth:'280px',margin:'0 auto',lineHeight:1.6}}>
                        {lang==='ar'?'العائلات هي مجتمعات مصغرة داخل اللعبة حيث يمكنك التعاون مع أصدقائك والحصول على مكافآت حصرية.':'Families are mini-communities where you can collaborate with friends and get exclusive rewards.'}
                    </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'12px',width:'100%',maxWidth:'260px'}}>
                    <button onClick={() => setView('join')} style={S.btnPrimary}>
                        {lang==='ar'?'بحث عن عائلات':'Search Families'}
                    </button>
                    <button onClick={() => setView('create')} style={S.btnSecondary}>
                        {lang==='ar'?'إنشاء عائلة جديدة':'Create New Family'}
                    </button>
                </div>
            </div>
        );
    }

    if (view === 'create') {
        return (
            <div style={{padding:'20px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'20px'}}>
                    <button onClick={() => setView('home')} style={{background:'rgba(255,255,255,0.08)',border:'none',color:'white',padding:'8px',borderRadius:'10px',cursor:'pointer'}}>←</button>
                    <div style={{fontSize:'18px',fontWeight:900,color:'white'}}>{lang==='ar'?'تأسيس عائلة':'Establish Family'}</div>
                </div>

                <div style={{display:'flex',flexDirection:'column',gap:'15px'}}>
                    <div>
                        <div style={S.label}>{lang==='ar'?'اسم العائلة (التاج)':'Family Tag (Name)'}</div>
                        <input value={tagName} onChange={e=>setTagName(e.target.value)} maxLength={12} placeholder="ETM" style={S.input} />
                        <div style={{fontSize:'10px',color:'#6b7280',marginTop:'4px'}}>{lang==='ar'?'3-12 حرف، سيظهر بجانب اسمك':'3-12 chars, will show next to name'}</div>
                    </div>

                    <div>
                        <div style={S.label}>{lang==='ar'?'تعريف العائلة':'About Family'}</div>
                        <textarea value={familyInfo} onChange={e=>setFamilyInfo(e.target.value)} maxLength={100} placeholder="..." style={{...S.input, height:'80px', resize:'none'}} />
                    </div>

                    <div>
                        <div style={S.label}>{lang==='ar'?'أسلوب الانضمام':'Join Mode'}</div>
                        <div style={{display:'flex',gap:'10px'}}>
                            <button onClick={()=>setJoinMode('open')} style={{flex:1,padding:'10px',borderRadius:'10px',background:joinMode==='open'?'rgba(0,242,255,0.1)':'rgba(255,255,255,0.05)',border:joinMode==='open'?'1px solid #00f2ff':'1px solid transparent',color:joinMode==='open'?'#00f2ff':'#9ca3af',fontSize:'12px',cursor:'pointer'}}>
                                {lang==='ar'?'مفتوح للجميع':'Open to all'}
                            </button>
                            <button onClick={()=>setJoinMode('approval')} style={{flex:1,padding:'10px',borderRadius:'10px',background:joinMode==='approval'?'rgba(0,242,255,0.1)':'rgba(255,255,255,0.05)',border:joinMode==='approval'?'1px solid #00f2ff':'1px solid transparent',color:joinMode==='approval'?'#00f2ff':'#9ca3af',fontSize:'12px',cursor:'pointer'}}>
                                {lang==='ar'?'بالموافقة':'By approval'}
                            </button>
                        </div>
                    </div>

                    <div style={{marginTop:'10px',background:'rgba(251,191,36,0.08)',border:'1px dashed rgba(251,191,36,0.3)',borderRadius:'12px',padding:'15px',textAlign:'center'}}>
                        <div style={{fontSize:'11px',color:'#fbbf24',marginBottom:'8px'}}>{lang==='ar'?'تكلفة التأسيس':'Creation Cost'}</div>
                        <div style={{fontSize:'24px',fontWeight:900,color:'white'}}>
                            {createCost} {FAMILY_COINS_SYMBOL}
                        </div>
                    </div>

                    <button onClick={handleCreate} disabled={!tagName.trim() || creating} style={{...S.btnPrimary, height:'50px', fontSize:'16px'}}>
                        {creating ? (lang==='ar'?'جاري التأسيس...':'Establishing...') : (lang==='ar'?'تأسيس الآن':'Establish Now')}
                    </button>
                </div>
            </div>
        );
    }

    if (view === 'join') {
        return (
            <div style={{padding:'20px',height:'100%',display:'flex',flexDirection:'column'}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'15px'}}>
                    <button onClick={() => setView('home')} style={{background:'rgba(255,255,255,0.08)',border:'none',color:'white',padding:'8px',borderRadius:'10px',cursor:'pointer'}}>←</button>
                    <div style={{flex:1,position:'relative'}}>
                        <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} placeholder={lang==='ar'?'بحث بالتاج...':'Search by tag...'} style={{...S.input, paddingRight:'40px'}} />
                        <button onClick={handleSearch} style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:'16px'}}>🔍</button>
                    </div>
                </div>

                <div style={{flex:1,overflowY:'auto'}}>
                    {loadingFamilies ? (
                        <div style={{textAlign:'center',padding:'40px',color:'#6b7280'}}>⏳</div>
                    ) : families.length === 0 ? (
                        <div style={{textAlign:'center',padding:'40px',color:'#6b7280'}}>{lang==='ar'?'لا توجد عائلات':'No families found'}</div>
                    ) : (
                        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                            {families.map(f => {
                                const levelData = getFamilyLevelConfig(f.level || 1);
                                return (
                                    <div key={f.id} onClick={() => { /* Detail view or join */ }} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'12px',display:'flex',alignItems:'center',gap:'12px',cursor:'pointer'}}>
                                        <div style={{width:'45px',height:'45px',borderRadius:'12px',background:'linear-gradient(135deg,#1a1a2e,#16213e)',border:'1px solid rgba(0,242,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>
                                            {f.emoji || '🛡️'}
                                        </div>
                                        <div style={{flex:1}}>
                                            <div style={{fontSize:'14px',fontWeight:800,color:'white'}}>{f.tagName}</div>
                                            <div style={{fontSize:'10px',color:'#6b7280'}}>Lv.{f.level || 1} • {f.members?.length || 0}/{levelData.maxMembers}</div>
                                        </div>
                                        <button onClick={(e)=>{e.stopPropagation(); /* Join action */}} style={{padding:'6px 12px',borderRadius:'8px',background:'rgba(0,242,255,0.1)',border:'1px solid #00f2ff',color:'#00f2ff',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>
                                            {lang==='ar'?'انضمام':'Join'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
};


