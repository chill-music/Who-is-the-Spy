// ════════════════════════════════════════════════════════
// 📸 FRIENDS MOMENTS MODAL
// 🏠 FAMILY SYSTEM — Complete Clan/Family System V2
// File: 19-family.js
// ════════════════════════════════════════════════════════

// ── Firestore Collections ──
const familiesCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('families');

// ════════════════════════════════════════════════════════
// ⚙️  FAMILY CONFIG — Levels, Sign Levels, Tasks
// ════════════════════════════════════════════════════════
const FAMILY_CREATE_COST = 500;

const FAMILY_LEVEL_CONFIG = [
    { level:1,  xp:0,      name_en:'Rookie',        name_ar:'مبتدئة',       color:'#4ade80', maxMembers:20,  icon:'🌱' },
    { level:2,  xp:500,    name_en:'Rising',         name_ar:'صاعدة',        color:'#22d3ee', maxMembers:25,  icon:'⬆️' },
    { level:3,  xp:1500,   name_en:'Established',    name_ar:'راسخة',        color:'#60a5fa', maxMembers:30,  icon:'🏕️' },
    { level:4,  xp:3500,   name_en:'Warriors',       name_ar:'محاربون',      color:'#fbbf24', maxMembers:40,  icon:'⚔️' },
    { level:5,  xp:7000,   name_en:'Guardians',      name_ar:'حراس',         color:'#f97316', maxMembers:50,  icon:'🛡️' },
    { level:6,  xp:13000,  name_en:'Elite',          name_ar:'نخبة',         color:'#a78bfa', maxMembers:60,  icon:'💎' },
    { level:7,  xp:22000,  name_en:'Champions',      name_ar:'أبطال',        color:'#ffd700', maxMembers:80,  icon:'🏆' },
    { level:8,  xp:35000,  name_en:'Legends',        name_ar:'أساطير',       color:'#ef4444', maxMembers:100, icon:'🔥' },
    { level:9,  xp:55000,  name_en:'Dynasty',        name_ar:'سلالة',        color:'#818cf8', maxMembers:120, icon:'👑' },
    { level:10, xp:80000,  name_en:'GOAT',           name_ar:'الأعظم',       color:'#00d4ff', maxMembers:160, icon:'🌌' },
];

// ════ FAMILY SIGN LEVELS — Based on Activeness ════
const FAMILY_SIGN_LEVELS = [
    { level:1, threshold:0,      name_ar:'علامة العشيرة',   name_en:'Clan Mark',      color:'#6b7280', glow:'rgba(107,114,128,0.3)', defaultIcon:'🏠', bg:'rgba(107,114,128,0.15)' },
    { level:2, threshold:5000,   name_ar:'علامة الفرسان',   name_en:'Knight Mark',    color:'#22d3ee', glow:'rgba(34,211,238,0.4)',  defaultIcon:'⚔️', bg:'rgba(34,211,238,0.15)' },
    { level:3, threshold:20000,  name_ar:'علامة المحاربين', name_en:'Warriors Mark',  color:'#fbbf24', glow:'rgba(251,191,36,0.4)',  defaultIcon:'🛡️', bg:'rgba(251,191,36,0.15)' },
    { level:4, threshold:80000,  name_ar:'علامة الأبطال',   name_en:'Champions Mark', color:'#f97316', glow:'rgba(249,115,22,0.4)',  defaultIcon:'👑', bg:'rgba(249,115,22,0.15)' },
    { level:5, threshold:300000, name_ar:'علامة الأساطير',  name_en:'Legends Mark',   color:'#00d4ff', glow:'rgba(0,212,255,0.5)',   defaultIcon:'🌟', bg:'rgba(0,212,255,0.15)' },
];

const getFamilySignLevelData = (activeness = 0) => {
    let cfg = FAMILY_SIGN_LEVELS[0];
    for (let i = FAMILY_SIGN_LEVELS.length - 1; i >= 0; i--) {
        if (activeness >= FAMILY_SIGN_LEVELS[i].threshold) { cfg = FAMILY_SIGN_LEVELS[i]; break; }
    }
    return cfg;
};
const getFamilySignProgress = (activeness = 0) => {
    const cur = getFamilySignLevelData(activeness);
    const next = FAMILY_SIGN_LEVELS.find(s => s.level === cur.level + 1);
    if (!next) return 100;
    return Math.min(100, Math.round(((activeness - cur.threshold) / (next.threshold - cur.threshold)) * 100));
};

const getFamilyLevel = (xp = 0) => {
    let cfg = FAMILY_LEVEL_CONFIG[0];
    for (let i = FAMILY_LEVEL_CONFIG.length - 1; i >= 0; i--) {
        if (xp >= FAMILY_LEVEL_CONFIG[i].xp) { cfg = FAMILY_LEVEL_CONFIG[i]; break; }
    }
    return cfg;
};
const getFamilyLevelProgress = (xp = 0) => {
    const cur = getFamilyLevel(xp);
    const next = FAMILY_LEVEL_CONFIG.find(c => c.level === cur.level + 1);
    if (!next) return 100;
    return Math.min(100, Math.round(((xp - cur.xp) / (next.xp - cur.xp)) * 100));
};

// ════ UPDATED TASKS — Triple Currency: Intel + XP + Family Coins ════
const FAMILY_TASKS_CONFIG = [
    { id:'ft1', icon:'🎮', title_en:'Play 5 Games',        title_ar:'العب 5 ألعاب',        sub_en:'Play 5 spy games this week',      sub_ar:'العب 5 ألعاب جاسوس هذا الأسبوع', target:5,   daily:false, reward:{ intel:50,  xp:200,  coins:5,  icon:'🏅' } },
    { id:'ft2', icon:'🏆', title_en:'Win 3 Games',         title_ar:'اكسب 3 ألعاب',        sub_en:'Win 3 games to earn rewards',     sub_ar:'اكسب 3 ألعاب للحصول على المكافآت', target:3,  daily:false, reward:{ intel:100, xp:400,  coins:10, icon:'🏅' } },
    { id:'ft3', icon:'💰', title_en:'Donate 500 Intel',    title_ar:'تبرع بـ 500 إنتل',     sub_en:'Donate 500 Intel to family fund', sub_ar:'تبرع بـ 500 إنتل لصندوق العائلة', target:500, daily:false, reward:{ intel:80,  xp:300,  coins:8,  icon:'🏅' } },
    { id:'ft4', icon:'📅', title_en:'Daily Check-in',      title_ar:'تسجيل الحضور',         sub_en:'Check in to the family today',    sub_ar:'سجّل حضورك في العائلة اليوم',     target:1,   daily:true,  reward:{ intel:30,  xp:100,  coins:3,  icon:'🏅' } },
    { id:'ft5', icon:'🎁', title_en:'Send 3 Gifts',        title_ar:'أرسل 3 هدايا',         sub_en:'Send 3 gifts to any players',     sub_ar:'أرسل 3 هدايا لأي لاعبين',        target:3,   daily:false, reward:{ intel:120, xp:500,  coins:12, icon:'🏅' } },
    { id:'ft6', icon:'💬', title_en:'Chat (10 messages)',  title_ar:'الشات (10 رسائل)',      sub_en:'Send 10 messages in family chat', sub_ar:'أرسل 10 رسائل في شات العائلة',   target:10,  daily:false, reward:{ intel:60,  xp:250,  coins:6,  icon:'🏅' } },
    { id:'ft7', icon:'❤️', title_en:'Daily Like Mission',  title_ar:'مهمة الإعجاب اليومي',  sub_en:'Like 3 clanmates profiles/posts', sub_ar:'أعجب بـ 3 منشورات/بروفايلات أعضاء', target:3, daily:true,  reward:{ intel:40,  xp:150,  coins:4,  icon:'🏅' } },
];

const ACTIVENESS_MILESTONES = [
    { threshold:8000,   reward:200,  icon:'🎁' },
    { threshold:24000,  reward:500,  icon:'🎁' },
    { threshold:60000,  reward:1000, icon:'💎' },
    { threshold:120000, reward:2000, icon:'💎' },
    { threshold:280000, reward:5000, icon:'👑' },
];

// ── Role Config ──
const FAMILY_ROLE_CONFIG = {
    owner:     { label_en:'Owner',  label_ar:'المالك', color:'#ffd700', bg:'rgba(255,215,0,0.18)',    border:'rgba(255,215,0,0.45)',    icon:'👑' },
    admin:     { label_en:'Admin',  label_ar:'أدمن',   color:'#ef4444', bg:'rgba(239,68,68,0.18)',    border:'rgba(239,68,68,0.45)',    icon:'🛡️' },
    moderator: { label_en:'Mod',    label_ar:'مشرف',   color:'#3b82f6', bg:'rgba(59,130,246,0.18)',   border:'rgba(59,130,246,0.45)',   icon:'🔰' },
    member:    { label_en:'Member', label_ar:'عضو',    color:'#6b7280', bg:'rgba(107,114,128,0.12)',  border:'rgba(107,114,128,0.3)',   icon:'👤' },
};
const getFamilyRole = (family, uid) => {
    if (!family || !uid) return 'member';
    if (family.createdBy === uid) return 'owner';
    const roles = family.memberRoles || {};
    return roles[uid] || 'member';
};
const canManageFamily = (family, uid) => {
    const role = getFamilyRole(family, uid);
    return role === 'owner' || role === 'admin';
};

// ── Emblem Options ──
const FAMILY_EMBLEMS = ['🏠','⚔️','🛡️','🔥','🌊','⚡','🌙','🌟','💎','👑','🐉','🦁','🐺','🦅','🦋','🌹','🏹','🎯','🌈','💫'];

// ── Helpers ──
const fmtFamilyNum = (n = 0) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
};
const fmtFamilyTime = (ts, lang) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return lang === 'ar' ? 'الآن' : 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}${lang === 'ar' ? 'د' : 'm'}`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}${lang === 'ar' ? 'س' : 'h'}`;
    return `${Math.floor(diff / 86400000)}${lang === 'ar' ? 'ي' : 'd'}`;
};

// ── Components ──
const FamilyRoleBadge = ({ role, lang, small = false }) => {
    const cfg = FAMILY_ROLE_CONFIG[role] || FAMILY_ROLE_CONFIG.member;
    return (
        <span style={{
            display:'inline-flex', alignItems:'center', gap:'2px',
            padding: small ? '1px 5px' : '2px 7px',
            borderRadius:'5px', fontSize: small ? '9px' : '10px',
            fontWeight:800, fontStyle:'italic',
            background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color,
            letterSpacing:'0.3px', whiteSpace:'nowrap', flexShrink:0,
        }}>
            {cfg.icon} {lang === 'ar' ? cfg.label_ar : cfg.label_en}
        </span>
    );
};

// Enhanced FamilySignBadge — supports image
const FamilySignBadge = ({ tag, color = '#7000ff', small = false, imageURL = null, signLevel = 1 }) => (
    <span style={{
        display:'inline-flex', alignItems:'center', gap:'3px',
        padding: small ? '1px 5px' : '2px 8px',
        borderRadius:'5px', fontSize: small ? '8px' : '10px',
        fontWeight:800, fontStyle:'italic',
        background:`${color}20`, border:`1px solid ${color}55`,
        color:color, letterSpacing:'0.5px', whiteSpace:'nowrap', flexShrink:0,
        boxShadow: signLevel >= 4 ? `0 0 8px ${color}44` : 'none',
    }}>
        {imageURL
            ? <img src={imageURL} style={{height: small ? '10px' : '13px', objectFit:'contain', verticalAlign:'middle'}} alt="" />
            : null
        }
        {tag || 'FAM'}
    </span>
);

// ════════════════════════════════════════════════════════
// 📸 FRIENDS MOMENTS MODAL
// ════════════════════════════════════════════════════════
const FriendsMomentsModal = ({ show, onClose, currentUser, currentUserData, currentUID, friendsData, lang, onOpenProfile }) => {
    const [moments, setMoments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMoment, setSelectedMoment] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [likingId, setLikingId] = useState(null);

    useEffect(() => {
        if (!show || !currentUID) return;
        setLoading(true);
        const friendUIDs = (friendsData || []).map(f => f.id || f.uid).filter(Boolean);
        if (friendUIDs.length === 0) { setMoments([]); setLoading(false); return; }
        const chunks = [];
        for (let i = 0; i < friendUIDs.length; i += 10) chunks.push(friendUIDs.slice(i, i + 10));
        Promise.all(chunks.map(chunk =>
            momentsCollection.where('authorUID', 'in', chunk).limit(30).get()
                .catch(() => ({ docs: [] }))
        )).then(results => {
            const all = [];
            results.forEach(snap => snap.docs && snap.docs.forEach(d => all.push({ id: d.id, ...d.data() })));
            all.sort((a, b) => {
                const aT = a.createdAt?.toMillis?.() || (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
                const bT = b.createdAt?.toMillis?.() || (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
                return bT - aT;
            });
            setMoments(all.slice(0, 60));
            setLoading(false);
        }).catch(() => { setMoments([]); setLoading(false); });
    }, [show, currentUID, JSON.stringify((friendsData || []).map(f => f.id || f.uid).filter(Boolean).sort())]);

    // Real-time update for selected moment
    useEffect(() => {
        if (!selectedMoment?.id) return;
        const unsub = momentsCollection.doc(selectedMoment.id).onSnapshot(snap => {
            if (snap.exists) {
                const updated = { id: snap.id, ...snap.data() };
                setSelectedMoment(updated);
                setMoments(prev => prev.map(m => m.id === updated.id ? updated : m));
            }
        }, () => {});
        return () => unsub();
    }, [selectedMoment?.id]);

    const handleLike = async (moment, e) => {
        e?.stopPropagation();
        if (!currentUID || likingId === moment.id) return;
        setLikingId(moment.id);
        try {
            const likes = moment.likes || [];
            const alreadyLiked = likes.includes(currentUID);
            await momentsCollection.doc(moment.id).update({
                likes: alreadyLiked
                    ? firebase.firestore.FieldValue.arrayRemove(currentUID)
                    : firebase.firestore.FieldValue.arrayUnion(currentUID)
            });
            setMoments(prev => prev.map(m => m.id === moment.id ? {
                ...m,
                likes: alreadyLiked ? likes.filter(id => id !== currentUID) : [...likes, currentUID]
            } : m));
            if (selectedMoment?.id === moment.id) {
                setSelectedMoment(prev => ({
                    ...prev,
                    likes: alreadyLiked ? likes.filter(id => id !== currentUID) : [...likes, currentUID]
                }));
            }
        } catch(e) {}
        setLikingId(null);
    };

    const handleComment = async () => {
        if (!commentText.trim() || !selectedMoment?.id || !currentUID || submittingComment) return;
        setSubmittingComment(true);
        try {
            const newComment = {
                authorUID: currentUID,
                authorName: currentUserData?.displayName || 'User',
                authorPhoto: currentUserData?.photoURL || null,
                text: commentText.trim(),
                createdAt: new Date().toISOString(),
            };
            await momentsCollection.doc(selectedMoment.id).update({
                comments: firebase.firestore.FieldValue.arrayUnion(newComment)
            });
            setCommentText('');
        } catch(e) {}
        setSubmittingComment(false);
    };

    const fmtMomentTime = (ts) => {
        if (!ts) return '';
        const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
        const diff = Date.now() - d.getTime();
        if (diff < 60000) return lang === 'ar' ? 'الآن' : 'now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}${lang === 'ar' ? 'د' : 'm'}`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}${lang === 'ar' ? 'س' : 'h'}`;
        return `${Math.floor(diff / 86400000)}${lang === 'ar' ? 'ي' : 'd'}`;
    };

    if (!show) return null;

    return (
        <PortalModal>
            <div className="modal-overlay" onClick={onClose} style={{ zIndex: Z.MODAL_HIGH }}>
                <div className="animate-pop" onClick={e => e.stopPropagation()} style={{
                    background:'linear-gradient(180deg,#0f0f1e,#0a0a14)', border:'1px solid rgba(0,242,255,0.2)',
                    borderRadius:'18px', width:'100%', maxWidth:'440px', maxHeight:'90vh',
                    display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.9)'
                }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                            <span style={{fontSize:'18px'}}>📸</span>
                            <div>
                                <div style={{fontSize:'14px',fontWeight:800,color:'white'}}>{lang==='ar'?'مومنت الأصدقاء':'Friends Moments'}</div>
                                <div style={{fontSize:'10px',color:'#6b7280'}}>{moments.length} {lang==='ar'?'لحظة':'moments'}</div>
                            </div>
                        </div>
                        <button onClick={onClose} style={{background:'rgba(255,255,255,0.07)',border:'none',borderRadius:'8px',color:'#9ca3af',fontSize:'16px',width:'30px',height:'30px',cursor:'pointer'}}>✕</button>
                    </div>
                    <div style={{flex:1,overflowY:'auto',padding:'12px'}}>
                        {loading ? <div style={{textAlign:'center',padding:'40px',color:'#6b7280'}}>⏳</div>
                        : moments.length === 0 ? (
                            <div style={{textAlign:'center',padding:'40px'}}>
                                <div style={{fontSize:'40px',marginBottom:'12px'}}>📭</div>
                                <div style={{fontSize:'13px',color:'#6b7280'}}>{lang==='ar'?'لا مومنتات من أصدقائك بعد':'No moments from friends yet'}</div>
                                <div style={{fontSize:'11px',color:'#4b5563',marginTop:'6px'}}>{lang==='ar'?'أضف أصدقاء لتشاهد لحظاتهم':'Add friends to see their moments'}</div>
                            </div>
                        ) : (
                            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                                {moments.map(moment => {
                                    const likes = moment.likes || [];
                                    const isLiked = likes.includes(currentUID);
                                    const commentsCount = moment.comments?.length || 0;
                                    return (
                                        <div key={moment.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',overflow:'hidden'}}>
                                            {/* Author row */}
                                            <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px 8px'}}>
                                                <div style={{width:'32px',height:'32px',borderRadius:'50%',overflow:'hidden',flexShrink:0,background:'rgba(255,255,255,0.1)'}}>
                                                    {moment.authorPhoto?<img src={moment.authorPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>😎</div>}
                                                </div>
                                                <div style={{flex:1,minWidth:0}}>
                                                    <div style={{fontSize:'12px',fontWeight:700,color:'#e2e8f0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{moment.authorName}</div>
                                                    <div style={{fontSize:'10px',color:'#6b7280'}}>{fmtMomentTime(moment.createdAt)}</div>
                                                </div>
                                                {onOpenProfile&&<button onClick={e=>{e.stopPropagation();onOpenProfile(moment.authorUID);}} style={{background:'rgba(0,242,255,0.1)',border:'1px solid rgba(0,242,255,0.2)',borderRadius:'6px',padding:'3px 8px',color:'#00f2ff',fontSize:'10px',cursor:'pointer'}}>👤</button>}
                                            </div>
                                            {/* Image */}
                                            {moment.type==='image'&&moment.mediaUrl&&<div style={{maxHeight:'260px',overflow:'hidden',cursor:'pointer'}} onClick={()=>setSelectedMoment(moment)}><img src={moment.mediaUrl} alt="" style={{width:'100%',objectFit:'cover',display:'block'}}/></div>}
                                            {/* Content */}
                                            {moment.content&&<div style={{padding:'8px 12px',fontSize:'12px',color:'#d1d5db',lineHeight:1.5,cursor:'pointer'}} onClick={()=>setSelectedMoment(moment)}>{moment.content}</div>}
                                            {/* Actions */}
                                            <div style={{padding:'8px 12px',borderTop:'1px solid rgba(255,255,255,0.05)',display:'flex',alignItems:'center',gap:'14px'}}>
                                                <button onClick={(e)=>handleLike(moment,e)} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:'4px',color:isLiked?'#f87171':'#6b7280',fontSize:'12px',fontWeight:isLiked?700:400,padding:'3px 0',transition:'color 0.2s'}}>
                                                    {isLiked ? '❤️' : '🤍'} <span>{likes.length}</span>
                                                </button>
                                                <button onClick={()=>setSelectedMoment(moment)} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:'4px',color:'#6b7280',fontSize:'12px',padding:'3px 0'}}>
                                                    💬 <span>{commentsCount}</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Detail / Comment Modal ── */}
                {selectedMoment && (
                    <div className="modal-overlay" onClick={()=>{setSelectedMoment(null);setCommentText('');}} style={{zIndex:Z.MODAL_HIGH+1}}>
                        <div className="animate-pop" onClick={e=>e.stopPropagation()} style={{
                            background:'linear-gradient(180deg,#0d0d1f,#08080f)',
                            border:'1px solid rgba(255,255,255,0.1)',borderRadius:'16px',
                            maxWidth:'420px',width:'95%',overflow:'hidden',maxHeight:'88vh',
                            display:'flex',flexDirection:'column'
                        }}>
                            {/* Header */}
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0}}>
                                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                                    <div style={{width:'28px',height:'28px',borderRadius:'50%',overflow:'hidden',background:'rgba(255,255,255,0.1)'}}>
                                        {selectedMoment.authorPhoto?<img src={selectedMoment.authorPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:'14px',lineHeight:'28px',display:'block',textAlign:'center'}}>😎</span>}
                                    </div>
                                    <div>
                                        <div style={{fontSize:'12px',fontWeight:700,color:'white'}}>{selectedMoment.authorName}</div>
                                        <div style={{fontSize:'10px',color:'#6b7280'}}>{fmtMomentTime(selectedMoment.createdAt)}</div>
                                    </div>
                                </div>
                                <button onClick={()=>{setSelectedMoment(null);setCommentText('');}} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'18px',cursor:'pointer'}}>✕</button>
                            </div>
                            {/* Content */}
                            <div style={{overflowY:'auto',flex:1}}>
                                {selectedMoment.type==='image'&&selectedMoment.mediaUrl&&<img src={selectedMoment.mediaUrl} alt="" style={{width:'100%',display:'block'}}/>}
                                {selectedMoment.content&&<div style={{padding:'12px 14px',fontSize:'13px',color:'#e2e8f0',lineHeight:1.6}}>{selectedMoment.content}</div>}
                                {/* Like / counts */}
                                <div style={{padding:'8px 14px',display:'flex',alignItems:'center',gap:'16px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                                    <button onClick={(e)=>handleLike(selectedMoment,e)} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:'5px',color:(selectedMoment.likes||[]).includes(currentUID)?'#f87171':'#6b7280',fontSize:'13px',fontWeight:(selectedMoment.likes||[]).includes(currentUID)?700:400,padding:'4px 0'}}>
                                        {(selectedMoment.likes||[]).includes(currentUID) ? '❤️' : '🤍'} {(selectedMoment.likes||[]).length}
                                    </button>
                                    <span style={{fontSize:'13px',color:'#6b7280'}}>💬 {selectedMoment.comments?.length||0}</span>
                                </div>
                                {/* Comments */}
                                <div style={{padding:'10px 14px',display:'flex',flexDirection:'column',gap:'10px'}}>
                                    {(selectedMoment.comments||[]).length===0 && (
                                        <div style={{textAlign:'center',padding:'16px',color:'#4b5563',fontSize:'11px'}}>{lang==='ar'?'لا تعليقات بعد':'No comments yet'}</div>
                                    )}
                                    {(selectedMoment.comments||[]).map((c,i)=>(
                                        <div key={i} style={{display:'flex',gap:'8px',alignItems:'flex-start'}}>
                                            <div style={{width:'26px',height:'26px',borderRadius:'50%',overflow:'hidden',flexShrink:0,background:'rgba(255,255,255,0.08)'}}>
                                                {c.authorPhoto?<img src={c.authorPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:'12px',lineHeight:'26px',display:'block',textAlign:'center'}}>😎</span>}
                                            </div>
                                            <div style={{flex:1,background:'rgba(255,255,255,0.05)',borderRadius:'10px',padding:'7px 10px'}}>
                                                <div style={{fontSize:'10px',fontWeight:700,color:'#a78bfa',marginBottom:'2px'}}>{c.authorName}</div>
                                                <div style={{fontSize:'12px',color:'#d1d5db',lineHeight:1.5}}>{c.text}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Comment Input */}
                            {currentUID && (
                                <div style={{display:'flex',gap:'8px',padding:'10px 12px',borderTop:'1px solid rgba(255,255,255,0.07)',flexShrink:0,background:'rgba(0,0,0,0.3)'}}>
                                    <input
                                        value={commentText}
                                        onChange={e=>setCommentText(e.target.value)}
                                        onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),handleComment())}
                                        placeholder={lang==='ar'?'اكتب تعليقاً...':'Write a comment...'}
                                        style={{flex:1,padding:'9px 12px',borderRadius:'10px',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:'12px',outline:'none'}}
                                    />
                                    <button onClick={handleComment} disabled={!commentText.trim()||submittingComment} style={{width:'36px',height:'36px',borderRadius:'10px',border:'none',cursor:'pointer',background:commentText.trim()?'linear-gradient(135deg,#7000ff,#00f2ff)':'rgba(255,255,255,0.07)',color:commentText.trim()?'white':'#4b5563',fontSize:'15px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                        {submittingComment ? '⏳' : '➤'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </PortalModal>
    );
};

// ════════════════════════════════════════════════════════
// 🏆 FAMILY RANKING MODAL
// ════════════════════════════════════════════════════════
const FamilyRankingModal = ({ show, onClose, lang, currentFamilyId }) => {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!show) return;
        setLoading(true);
        familiesCollection.orderBy('xp', 'desc').limit(50).get().then(snap => {
            setRankings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [show]);

    if (!show) return null;

    return (
        <PortalModal>
            <div className="modal-overlay" onClick={onClose} style={{ zIndex: Z.MODAL_HIGH + 1 }}>
                <div className="animate-pop" onClick={e => e.stopPropagation()} style={{
                    background:'linear-gradient(180deg,#0d0d1f,#08080f)',
                    border:'1px solid rgba(255,215,0,0.2)', borderRadius:'18px',
                    width:'100%', maxWidth:'420px', maxHeight:'85vh',
                    display:'flex', flexDirection:'column', overflow:'hidden',
                }}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                            <span style={{fontSize:'20px'}}>🏆</span>
                            <div style={{fontSize:'14px', fontWeight:800, color:'white'}}>{lang==='ar'?'ترتيب العائلات':'Family Rankings'}</div>
                        </div>
                        <button onClick={onClose} style={{background:'rgba(255,255,255,0.07)',border:'none',borderRadius:'8px',color:'#9ca3af',fontSize:'16px',width:'30px',height:'30px',cursor:'pointer'}}>✕</button>
                    </div>
                    <div style={{flex:1, overflowY:'auto', padding:'12px'}}>
                        {loading ? <div style={{textAlign:'center',padding:'40px',color:'#6b7280'}}>⏳</div> :
                        rankings.map((fam, i) => {
                            const fl = getFamilyLevel(fam.xp || 0);
                            const sign = getFamilySignLevelData(fam.activeness || 0);
                            const isMine = fam.id === currentFamilyId;
                            return (
                                <div key={fam.id} style={{
                                    display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px',
                                    borderRadius:'12px', marginBottom:'6px',
                                    background: isMine ? 'rgba(0,242,255,0.08)' : i < 3 ? 'rgba(255,215,0,0.04)' : 'rgba(255,255,255,0.03)',
                                    border: isMine ? '1px solid rgba(0,242,255,0.3)' : i === 0 ? '1px solid rgba(255,215,0,0.2)' : '1px solid rgba(255,255,255,0.06)',
                                }}>
                                    <div style={{width:'26px', textAlign:'center', fontSize:i < 3 ? '16px' : '11px', color:i===0?'#ffd700':i===1?'#9ca3af':i===2?'#cd7f32':'#4b5563', fontWeight:800, flexShrink:0}}>
                                        {i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`}
                                    </div>
                                    <div style={{width:'38px', height:'38px', borderRadius:'12px', background:`${fl.color}15`, border:`1px solid ${fl.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0}}>
                                        {fam.photoURL ? <img src={fam.photoURL} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'10px'}} alt=""/> : (fam.emblem || '🏠')}
                                    </div>
                                    <div style={{flex:1, minWidth:0}}>
                                        <div style={{display:'flex', alignItems:'center', gap:'5px', flexWrap:'wrap'}}>
                                            <span style={{fontSize:'13px', fontWeight:800, color:isMine?'#00f2ff':'white', fontStyle:'italic'}}>{fam.name}</span>
                                            <FamilySignBadge tag={fam.tag} color={sign.color} small signLevel={sign.level} />
                                        </div>
                                        <div style={{fontSize:'10px', color:'#6b7280', marginTop:'2px'}}>
                                            <span style={{color:fl.color}}>{fl.icon} Lv.{fl.level}</span>
                                            <span style={{marginLeft:'8px'}}>👥 {fam.members?.length||0}</span>
                                            <span style={{marginLeft:'8px'}}>✨ {fmtFamilyNum(fam.xp||0)} XP</span>
                                        </div>
                                    </div>
                                    {isMine && <span style={{fontSize:'10px', color:'#00f2ff', fontWeight:800}}>★</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </PortalModal>
    );
};

// ════════════════════════════════════════════════════════
// 💬 FAMILY CHAT MODAL — Standalone chat accessible from Chat tab
// ════════════════════════════════════════════════════════
const CHAT_EMOJIS_FAM = ['😀','😂','❤️','👍','🔥','⭐','💎','🎁','🎉','😎','🤩','💪','✨','🙏','😊','👑','💖','🥳','🏆','🎯','😍','🤣','😭','😱','🫡','💯','🌹','🎮','🕵️','🏅'];

const FamilyChatModal = ({ show, onClose, familyId, familyData, currentUID, currentUserData, lang }) => {
    const [messages, setMessages] = React.useState([]);
    const [chatInput, setChatInput] = React.useState('');
    const [sendingMsg, setSendingMsg] = React.useState(false);
    const [showEmoji, setShowEmoji] = React.useState(false);
    const chatEndRef = React.useRef(null);
    const imgInputRef = React.useRef(null);

    React.useEffect(() => {
        if (!show || !familyId) return;
        const unsub = familiesCollection.doc(familyId).collection('messages')
            .orderBy('timestamp', 'desc').limit(80)
            .onSnapshot(snap => {
                const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
                setMessages(msgs);
            }, () => {});
        return () => unsub();
    }, [show, familyId]);

    React.useEffect(() => {
        if (show) setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 120);
    }, [messages.length, show]);

    const sendMessage = async (text, type, extra) => {
        type = type || 'text';
        extra = extra || {};
        if ((!text || !text.trim()) && type === 'text') return;
        if (!familyId || !currentUID || sendingMsg) return;
        setSendingMsg(true);
        try {
            await familiesCollection.doc(familyId).collection('messages').add({
                senderId: currentUID,
                senderName: currentUserData?.displayName || 'Member',
                senderPhoto: currentUserData?.photoURL || null,
                text: (text || '').trim(),
                type: type,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                ...extra,
            });
            if (type === 'text') setChatInput('');
            await familiesCollection.doc(familyId).update({
                lastChatMessage: (text || '').trim() || (type === 'image' ? '📷' : ''),
                lastChatSenderId: currentUID,
                lastChatAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastChatAtMs: Date.now(),
                ['chatReadBy.' + currentUID]: firebase.firestore.FieldValue.serverTimestamp(),
            }).catch(function() {});
        } catch (e) { console.error('FamilyChatModal sendMessage error:', e); }
        setSendingMsg(false);
    };

    const handleImageUpload = function(e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
            var img = new Image();
            img.onload = function() {
                var canvas = document.createElement('canvas');
                var MAX = 800;
                var w = img.width, h = img.height;
                if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
                else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                var base64 = canvas.toDataURL('image/jpeg', 0.7);
                sendMessage('', 'image', { imageUrl: base64 });
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    var fmtTime = function(ts) {
        if (!ts) return '';
        var d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
        var diff = Date.now() - d.getTime();
        if (diff < 60000) return lang === 'ar' ? 'الآن' : 'now';
        if (diff < 3600000) return Math.floor(diff/60000) + (lang==='ar'?'د':'m');
        if (diff < 86400000) return Math.floor(diff/3600000) + (lang==='ar'?'س':'h');
        return Math.floor(diff/86400000) + (lang==='ar'?'ي':'d');
    };

    if (!show) return null;

    var signData = familyData ? getFamilySignLevelData(familyData.activeness || 0) : FAMILY_SIGN_LEVELS[0];
    var fLvl = familyData ? getFamilyLevel(familyData.xp || 0) : null;

    return React.createElement(PortalModal, null,
        React.createElement('div', {
            style: { position:'fixed', inset:0, zIndex: Z.MODAL, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', padding:'12px' }
        },
        React.createElement('div', {
            style: { position:'relative', display:'flex', flexDirection:'column', width:'100%', maxWidth:'480px', height:'88vh', maxHeight:'700px', background:'linear-gradient(180deg,#0d0d1f 0%,#08080f 100%)', border:'1px solid rgba(0,242,255,0.15)', borderRadius:'20px', overflow:'hidden', boxShadow:'0 28px 70px rgba(0,0,0,0.95)' }
        },
            // Header
            React.createElement('div', {
                style: { display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', background:'rgba(0,0,0,0.4)', flexShrink:0 }
            },
                React.createElement('button', { onClick: onClose, style: { background:'none', border:'none', color:'#00f2ff', fontSize:'20px', cursor:'pointer', padding:'0 4px' } }, '‹'),
                React.createElement('div', {
                    style: { width:'40px', height:'40px', borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'linear-gradient(135deg,' + signData.color + '22,rgba(0,0,0,0.3))', border:'2px solid ' + signData.color + '55', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }
                }, familyData && familyData.photoURL ? React.createElement('img', { src: familyData.photoURL, alt:'', style:{width:'100%',height:'100%',objectFit:'cover'}}) : (familyData && familyData.emblem) || '🏠'),
                React.createElement('div', { style: { flex:1, minWidth:0 } },
                    React.createElement('div', { style: { display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' } },
                        React.createElement('span', { style: { fontSize:'14px', fontWeight:800, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }, (familyData && familyData.name) || (lang==='ar'?'شات العائلة':'Family Chat')),
                        familyData && React.createElement(FamilySignBadge, { tag: familyData.tag, color: signData.color, small: true, signLevel: signData.level, imageURL: familyData.signImageURL })
                    ),
                    React.createElement('div', { style: { fontSize:'10px', color:'#6b7280' } },
                        ((familyData && familyData.members && familyData.members.length) || 0) + ' ' + (lang==='ar'?'عضو':'members'),
                        fLvl && React.createElement('span', { style: { color: fLvl.color, marginLeft:'4px' } }, fLvl.icon + ' Lv.' + fLvl.level)
                    )
                )
            ),
            // Messages
            React.createElement('div', {
                style: { flex:1, overflowY:'auto', padding:'10px 12px', display:'flex', flexDirection:'column', gap:'8px', minHeight:0 }
            },
                messages.length === 0 && React.createElement('div', {
                    style: { textAlign:'center', padding:'40px 20px', color:'#4b5563' }
                },
                    React.createElement('div', { style: { fontSize:'36px', marginBottom:'10px' } }, '💬'),
                    React.createElement('div', { style: { fontSize:'12px' } }, lang==='ar'?'كن أول من يتحدث!':'Be the first to chat!')
                ),
                messages.map(function(msg) {
                    var isMe = msg.senderId === currentUID;
                    var isSystem = msg.senderId === 'system' || msg.type === 'system';
                    var isDonation = msg.type === 'donation';
                    if (isSystem) return React.createElement('div', { key: msg.id, style: { textAlign:'center', padding:'4px 12px' } },
                        React.createElement('span', { style: { fontSize:'10px', color:'#6b7280', background:'rgba(255,255,255,0.04)', padding:'3px 10px', borderRadius:'20px' } }, msg.text)
                    );
                    if (isDonation) return React.createElement('div', { key: msg.id, style: { display:'flex', justifyContent:'center', padding:'4px 0' } },
                        React.createElement('div', { style: { background:'linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,140,0,0.1))', border:'1px solid rgba(255,215,0,0.3)', borderRadius:'12px', padding:'8px 14px', maxWidth:'90%', textAlign:'center' } },
                            React.createElement('div', { style: { fontSize:'12px', color:'#ffd700', fontWeight:800 } }, msg.text),
                            React.createElement('div', { style: { fontSize:'10px', color:'#6b7280', marginTop:'2px' } }, fmtTime(msg.timestamp))
                        )
                    );
                    return React.createElement('div', { key: msg.id, style: { display:'flex', flexDirection: isMe?'row-reverse':'row', gap:'8px', alignItems:'flex-end' } },
                        !isMe && React.createElement('div', { style: { width:'28px', height:'28px', borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.1)' } },
                            msg.senderPhoto
                                ? React.createElement('img', { src: msg.senderPhoto, alt:'', style:{width:'100%',height:'100%',objectFit:'cover'}})
                                : React.createElement('div', { style:{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}, '😎')
                        ),
                        React.createElement('div', { style: { maxWidth:'72%' } },
                            !isMe && React.createElement('div', { style: { fontSize:'10px', color:'#9ca3af', marginBottom:'3px', fontWeight:700, paddingLeft:'4px' } }, msg.senderName),
                            msg.type === 'image' && msg.imageUrl
                                ? React.createElement('img', { src: msg.imageUrl, alt:'', style:{ maxWidth:'220px', maxHeight:'200px', borderRadius:'12px', display:'block', objectFit:'cover' }})
                                : React.createElement('div', {
                                    style: { padding:'8px 12px', borderRadius: isMe?'14px 4px 14px 14px':'4px 14px 14px 14px', background: isMe?'linear-gradient(135deg,rgba(0,242,255,0.2),rgba(112,0,255,0.2))':'rgba(255,255,255,0.07)', border: isMe?'1px solid rgba(0,242,255,0.3)':'1px solid rgba(255,255,255,0.08)', fontSize:'12px', color:'#e2e8f0', lineHeight:1.5, wordBreak:'break-word' }
                                }, msg.text),
                            React.createElement('div', { style: { fontSize:'9px', color:'#4b5563', marginTop:'2px', textAlign: isMe?'right':'left', paddingLeft:'4px', paddingRight:'4px' } }, fmtTime(msg.timestamp))
                        )
                    );
                }),
                React.createElement('div', { ref: chatEndRef })
            ),
            // Emoji picker
            showEmoji && React.createElement('div', {
                style: { padding:'8px 12px', borderTop:'1px solid rgba(255,255,255,0.06)', background:'rgba(0,0,0,0.5)', flexWrap:'wrap', display:'flex', gap:'4px', flexShrink:0 }
            },
                CHAT_EMOJIS_FAM.map(function(e) {
                    return React.createElement('button', {
                        key: e,
                        onClick: function() { setChatInput(function(p) { return p + e; }); setShowEmoji(false); },
                        style: { background:'none', border:'none', fontSize:'20px', cursor:'pointer', padding:'3px', borderRadius:'6px', lineHeight:1 }
                    }, e);
                })
            ),
            // Input bar
            React.createElement('div', {
                style: { padding:'10px 12px', borderTop:'1px solid rgba(255,255,255,0.07)', background:'rgba(0,0,0,0.3)', display:'flex', gap:'8px', alignItems:'center', flexShrink:0 }
            },
                React.createElement('input', { ref: imgInputRef, type:'file', accept:'image/*', style:{display:'none'}, onChange: handleImageUpload }),
                React.createElement('button', {
                    onClick: function() { if (imgInputRef.current) imgInputRef.current.click(); },
                    style: { width:'36px', height:'36px', borderRadius:'10px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#9ca3af', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }
                }, '📷'),
                React.createElement('button', {
                    onClick: function() { setShowEmoji(function(p) { return !p; }); },
                    style: { width:'36px', height:'36px', borderRadius:'10px', background: showEmoji?'rgba(0,242,255,0.15)':'rgba(255,255,255,0.06)', border: '1px solid ' + (showEmoji?'rgba(0,242,255,0.4)':'rgba(255,255,255,0.1)'), color:'#9ca3af', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }
                }, '😊'),
                React.createElement('input', {
                    value: chatInput,
                    onChange: function(e) { setChatInput(e.target.value); },
                    onKeyDown: function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(chatInput); } },
                    maxLength: 400,
                    style: { flex:1, padding:'9px 12px', borderRadius:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'white', fontSize:'13px', outline:'none' },
                    placeholder: lang==='ar'?'اكتب رسالة...':'Type a message...'
                }),
                React.createElement('button', {
                    onClick: function() { sendMessage(chatInput); },
                    disabled: !chatInput.trim() || sendingMsg,
                    style: { width:'40px', height:'40px', borderRadius:'12px', border:'none', flexShrink:0, background: chatInput.trim()?'linear-gradient(135deg,#00f2ff,#7000ff)':'rgba(255,255,255,0.06)', color: chatInput.trim()?'white':'#6b7280', fontSize:'18px', cursor: chatInput.trim()?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center' }
                }, sendingMsg ? '⏳' : '➤')
            )
        ) // close inner content div
        ) // close overlay div
    );
};

// ════════════════════════════════════════════════════════
// 🏠 FAMILY CHAT ITEM — Shows in Chat section when user has a family
// ════════════════════════════════════════════════════════
const FamilyChatItem = ({ familyId, currentUID, currentUserData, lang, onOpenChat }) => {
    const [family, setFamily] = React.useState(null);
    const [hasUnread, setHasUnread] = React.useState(false);

    React.useEffect(() => {
        if (!familyId) return;
        var unsub = familiesCollection.doc(familyId).onSnapshot(function(snap) {
            if (snap.exists) {
                var d = Object.assign({ id: snap.id }, snap.data());
                setFamily(d);
                var lastAtMs = d.lastChatAtMs || (d.lastChatAt && d.lastChatAt.toMillis && d.lastChatAt.toMillis()) || 0;
                var readAtRaw = d.chatReadBy && d.chatReadBy[currentUID];
                var readAtMs = readAtRaw && readAtRaw.toMillis ? readAtRaw.toMillis() : (readAtRaw && readAtRaw.seconds ? readAtRaw.seconds * 1000 : 0);
                setHasUnread(lastAtMs > readAtMs && d.lastChatSenderId !== currentUID && lastAtMs > 0);
            }
        }, function() {});
        return function() { unsub(); };
    }, [familyId, currentUID]);

    if (!family) return null;

    var signData = getFamilySignLevelData(family.activeness || 0);
    var fLvl = getFamilyLevel(family.xp || 0);
    var lastTime = family.lastChatAt ? fmtFamilyTime(family.lastChatAt, lang) : '';

    return React.createElement('div', {
        onClick: function() { onOpenChat(family); },
        style: { display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', cursor:'pointer', background: hasUnread?'linear-gradient(135deg,rgba(255,136,0,0.1),rgba(255,80,0,0.05))':'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.05)', transition:'background 0.2s' }
    },
        React.createElement('div', { style: { position:'relative', flexShrink:0 } },
            React.createElement('div', {
                style: { width:'46px', height:'46px', borderRadius:'50%', overflow:'hidden', background:'linear-gradient(135deg,' + signData.color + '22,rgba(0,0,0,0.3))', border:'2px solid ' + signData.color + '55', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px' }
            }, family.photoURL ? React.createElement('img', { src: family.photoURL, alt:'', style:{width:'100%',height:'100%',objectFit:'cover'}}) : family.emblem || '🏠'),
            hasUnread && React.createElement('div', { style: { position:'absolute', top:'-2px', right:'-2px', width:'14px', height:'14px', borderRadius:'50%', background:'#f97316', border:'2px solid var(--bg-main)', boxShadow:'0 0 6px rgba(249,115,22,0.8)' }})
        ),
        React.createElement('div', { style: { flex:1, minWidth:0 } },
            React.createElement('div', { style: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'3px' } },
                React.createElement('div', { style: { display:'flex', alignItems:'center', gap:'5px', flex:1, minWidth:0, flexWrap:'wrap' } },
                    React.createElement('span', { style: { fontSize:'13px', fontWeight: hasUnread?800:600, color: hasUnread?'#e2e8f0':'#9ca3af', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }, family.name),
                    React.createElement(FamilySignBadge, { tag: family.tag, color: signData.color, small: true, signLevel: signData.level, imageURL: family.signImageURL })
                ),
                React.createElement('span', { style: { fontSize:'9px', color:'#6b7280', flexShrink:0, marginLeft:'6px' } }, lastTime)
            ),
            React.createElement('div', { style: { fontSize:'11px', color: hasUnread?'#d1d5db':'#6b7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } },
                '🏠 ' + (family.lastChatMessage || (lang==='ar'?'شات العائلة':'Family Chat'))
            ),
            React.createElement('div', { style: { fontSize:'9px', color: fLvl.color, marginTop:'2px' } },
                fLvl.icon + ' Lv.' + fLvl.level + ' · ' + ((family.members && family.members.length) || 0) + ' ' + (lang==='ar'?'عضو':'members')
            )
        ),
        React.createElement('div', { style: { fontSize:'16px', color:'#f97316', flexShrink:0 } }, '›')
    );
};

// ════════════════════════════════════════════════════════
// 🏆 FAMILY RANKING INLINE — Used in ranking tab
// ════════════════════════════════════════════════════════
const FamilyRankingInline = ({ lang, currentFamilyId }) => {
    const [rankings, setRankings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
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
                const fl = getFamilyLevel(fam.xp || 0);
                const sign = getFamilySignLevelData(fam.activeness || 0);
                const isMine = fam.id === currentFamilyId;
                const medals = ['🥇','🥈','🥉'];
                return (
                    <div key={fam.id} style={{
                        display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px',
                        borderRadius:'12px',
                        background: isMine ? 'rgba(0,242,255,0.08)' : i < 3 ? 'rgba(255,215,0,0.04)' : 'rgba(255,255,255,0.03)',
                        border: isMine ? '1px solid rgba(0,242,255,0.3)' : i === 0 ? '1px solid rgba(255,215,0,0.2)' : '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <div style={{width:'24px', textAlign:'center', fontSize:'14px', flexShrink:0}}>
                            {i < 3 ? medals[i] : <span style={{fontSize:'11px',color:'#4b5563',fontWeight:800}}>#{i+1}</span>}
                        </div>
                        <div style={{width:'38px', height:'38px', borderRadius:'50%', overflow:'hidden', border:`2px solid ${sign.color}55`, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0}}>
                            {fam.photoURL ? <img src={fam.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : fam.emblem || '🏠'}
                        </div>
                        <div style={{flex:1, minWidth:0}}>
                            <div style={{display:'flex', alignItems:'center', gap:'5px', flexWrap:'wrap'}}>
                                <span style={{fontSize:'12px', fontWeight:800, color: isMine?'#00f2ff':'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'110px'}}>{fam.name}</span>
                                <FamilySignBadge tag={fam.tag} color={sign.color} small signLevel={sign.level} />
                            </div>
                            <div style={{fontSize:'10px', color:'#6b7280', marginTop:'1px'}}>
                                {fl.icon} Lv.{fl.level} · 👥 {(fam.members||[]).length}
                            </div>
                        </div>
                        <div style={{textAlign:'right', flexShrink:0}}>
                            <div style={{fontSize:'12px', fontWeight:900, color:'#fbbf24'}}>{fmtFamilyNum(fam.xp||0)} XP</div>
                            <div style={{fontSize:'9px', color: sign.color, fontWeight:700}}>{lang==='ar'?sign.name_ar:sign.name_en}</div>
                        </div>
                    </div>
                );
            })}
            {rankings.length === 0 && <div style={{textAlign:'center',padding:'30px',color:'#4b5563',fontSize:'12px'}}>{lang==='ar'?'لا يوجد ترتيب بعد':'No rankings yet'}</div>}
        </div>
    );
};

// ════════════════════════════════════════════════════════
// 🏠 FAMILY MODAL — Main Component V2
// ════════════════════════════════════════════════════════
const FamilyModal = ({ show, onClose, currentUser, currentUserData, currentUID, lang, isLoggedIn, onNotification }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [family, setFamily] = useState(null);
    const [loadingFamily, setLoadingFamily] = useState(true);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [newsLog, setNewsLog] = useState([]);
    const [donationSort, setDonationSort] = useState('intel');
    const [memberSearch, setMemberSearch] = useState('');
    const [joinRequesterProfiles, setJoinRequesterProfiles] = useState([]);

    // Chat state
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [sendingMsg, setSendingMsg] = useState(false);
    const chatEndRef = useRef(null);

    // Donate state
    const [donateAmount, setDonateAmount] = useState('');
    const [donating, setDonating] = useState(false);
    const [showDonatePanel, setShowDonatePanel] = useState(false);

    // Header dots menu
    // header menu state removed (three-dot removed; ranking is now a tab)

    // Create/Join state
    const [view, setView] = useState('home');
    const [tribeName, setFamilyName] = useState('');
    const [tribeTag, setFamilyTag] = useState('');
    const [tribeDesc, setFamilyDesc] = useState('');
    const [tribeEmblem, setFamilyEmblem] = useState('🏠');
    const [creating, setCreating] = useState(false);
    const [joinSearch, setJoinSearch] = useState('');
    const [joinResults, setJoinResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [joining, setJoining] = useState(false);

    // Manage tab state
    const [editAnnouncement, setEditAnnouncement] = useState('');
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [savingAnn, setSavingAnn] = useState(false);
    const [savingInfo, setSavingInfo] = useState(false);
    const [joinMode, setJoinMode] = useState('open'); // 'open' | 'approval'
    const photoFileRef = useRef(null);
    const signImageFileRef = useRef(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingSign, setUploadingSign] = useState(false);

    // ── Load family (real-time) ──
    useEffect(() => {
        if (!show || !currentUID) { setLoadingFamily(false); return; }
        setLoadingFamily(true);
        const fid = currentUserData?.familyId;
        if (!fid) { setFamily(null); setLoadingFamily(false); return; }
        const unsub = familiesCollection.doc(fid).onSnapshot(snap => {
            if (snap.exists) {
                const d = { id: snap.id, ...snap.data() };
                setFamily(d);
                setEditAnnouncement(d.announcement || '');
                setEditName(d.name || '');
                setEditDesc(d.description || '');
                setJoinMode(d.joinMode || 'open');
            } else {
                setFamily(null);
                usersCollection.doc(currentUID).update({ familyId: null, familyName: null, familyTag: null }).catch(() => {});
            }
            setLoadingFamily(false);
        }, () => setLoadingFamily(false));
        return () => unsub();
    }, [show, currentUID, currentUserData?.familyId]);

    // ── Load chat messages (real-time) ──
    useEffect(() => {
        if (!family?.id || activeTab !== 'chat') return;
        const unsub = familiesCollection.doc(family.id).collection('messages')
            .orderBy('timestamp', 'desc').limit(60)
            .onSnapshot(snap => {
                const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
                setChatMessages(msgs);
            }, () => {});
        return () => unsub();
    }, [family?.id, activeTab]);

    // Auto-scroll chat
    useEffect(() => {
        if (activeTab === 'chat') {
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    }, [chatMessages.length, activeTab]);

    // ── Load member profiles ──
    useEffect(() => {
        if (!family?.members?.length) { setFamilyMembers([]); return; }
        const uids = family.members.slice(0, 30);
        const chunks = [];
        for (let i = 0; i < uids.length; i += 10) chunks.push(uids.slice(i, i + 10));
        Promise.all(chunks.map(chunk =>
            usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', chunk).get().catch(() => ({ docs: [] }))
        )).then(results => {
            const members = [];
            results.forEach(snap => snap.docs.forEach(d => members.push({ id: d.id, ...d.data() })));
            setFamilyMembers(members);
        }).catch(() => {});
    }, [family?.members?.join(',')]);

    // ── Load news ──
    useEffect(() => {
        if (!family?.id || activeTab !== 'news') return;
        const unsub = familiesCollection.doc(family.id).collection('news')
            .orderBy('createdAt', 'desc').limit(30)
            .onSnapshot(snap => setNewsLog(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => {});
        return () => unsub();
    }, [family?.id, activeTab]);

    // ── Load join requester profiles ──
    useEffect(() => {
        const reqs = family?.joinRequests || [];
        if (!reqs.length || activeTab !== 'manage') { setJoinRequesterProfiles([]); return; }
        const chunks = [];
        for (let i = 0; i < reqs.length; i += 10) chunks.push(reqs.slice(i, i + 10));
        Promise.all(chunks.map(chunk =>
            usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', chunk).get().catch(() => ({ docs: [] }))
        )).then(results => {
            const ps = [];
            results.forEach(snap => snap.docs.forEach(d => ps.push({ id: d.id, ...d.data() })));
            setJoinRequesterProfiles(ps);
        }).catch(() => {});
    }, [family?.joinRequests?.join(','), activeTab]);

    if (!show) return null;

    // ─────────────────────────────────────────────
    // HELPERS & ACTIONS
    // ─────────────────────────────────────────────
    const postNews = async (familyId, type, text, amount = 0) => {
        try {
            await familiesCollection.doc(familyId).collection('news').add({
                type, text, amount,
                actorUID: currentUID,
                actorName: currentUserData?.displayName || 'Member',
                actorPhoto: currentUserData?.photoURL || null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        } catch (e) {}
    };

    const postChatMessage = async (familyId, text, type = 'text', extra = {}) => {
        try {
            await familiesCollection.doc(familyId).collection('messages').add({
                senderId: currentUID,
                senderName: currentUserData?.displayName || 'Member',
                senderPhoto: currentUserData?.photoURL || null,
                text, type,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                ...extra,
            });
        } catch (e) {}
    };

    const postSystemMessage = async (familyId, text) => {
        try {
            await familiesCollection.doc(familyId).collection('messages').add({
                senderId: 'system',
                senderName: 'SYSTEM',
                text, type: 'system',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            });
        } catch (e) {}
    };

    // Update user's sign fields when joining/sign changes
    const syncUserFamilySign = async (familyId, familyData) => {
        try {
            const activeness = familyData.activeness || 0;
            const signData = getFamilySignLevelData(activeness);
            await usersCollection.doc(currentUID).update({
                familySignLevel: signData.level,
                familySignColor: signData.color,
                familySignImageURL: familyData.signImageURL || null,
            });
        } catch (e) {}
    };

    const createFamily = async () => {
        if (!tribeName.trim() || !tribeTag.trim() || creating || !currentUID) return;
        if ((currentUserData?.currency || 0) < FAMILY_CREATE_COST) {
            onNotification(lang === 'ar' ? `❌ تحتاج ${FAMILY_CREATE_COST} إنتل` : `❌ Need ${FAMILY_CREATE_COST} Intel`);
            return;
        }
        const cleanTag = tribeTag.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        if (cleanTag.length < 2) { onNotification(lang === 'ar' ? '❌ الوسم حرفين على الأقل' : '❌ Tag: min 2 chars'); return; }
        setCreating(true);
        try {
            const tagCheck = await familiesCollection.where('tag', '==', cleanTag).get();
            if (!tagCheck.empty) { onNotification(lang === 'ar' ? '❌ هذا الوسم مستخدم' : '❌ Tag already taken'); setCreating(false); return; }
            const ref = await familiesCollection.add({
                name: tribeName.trim(), tag: cleanTag, description: tribeDesc.trim(),
                emblem: tribeEmblem, announcement: '',
                photoURL: null, signImageURL: null,
                createdBy: currentUID,
                leaderName: currentUserData?.displayName || 'Leader',
                leaderPhoto: currentUserData?.photoURL || null,
                members: [currentUID],
                memberRoles: { [currentUID]: 'owner' },
                memberDonations: { [currentUID]: { weekly: 0, total: 0, weeklyIntel: 0, totalIntel: 0 } },
                level: 1, xp: 0,
                activeness: 0, weeklyActiveness: 0,
                treasury: 0,
                activenessClaimedMilestones: [],
                taskProgress: {},
                joinRequests: [], joinMode: 'open', weeklyRank: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
            });
            await usersCollection.doc(currentUID).update({
                currency: firebase.firestore.FieldValue.increment(-FAMILY_CREATE_COST),
                familyId: ref.id, familyName: tribeName.trim(), familyTag: cleanTag,
                familySignLevel: 1, familySignColor: FAMILY_SIGN_LEVELS[0].color, familySignImageURL: null,
            });
            await postSystemMessage(ref.id, lang === 'ar' ? `🏠 تم إنشاء العائلة! مرحباً ${currentUserData?.displayName}` : `🏠 Family created! Welcome ${currentUserData?.displayName}`);
            onNotification(lang === 'ar' ? '🏠 تم إنشاء العائلة!' : '🏠 Family created!');
            setFamilyName(''); setFamilyTag(''); setFamilyDesc('');
        } catch (e) { console.error(e); onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
        setCreating(false);
    };

    const joinFamily = async (familyId) => {
        if (!currentUID || joining) return;
        setJoining(true);
        try {
            const snap = await familiesCollection.doc(familyId).get();
            if (!snap.exists) { onNotification(lang === 'ar' ? '❌ العائلة غير موجودة' : '❌ Family not found'); setJoining(false); return; }
            const fd = snap.data();
            const lvl = getFamilyLevel(fd.xp || 0);
            if ((fd.members || []).length >= lvl.maxMembers) { onNotification(lang === 'ar' ? '❌ العائلة ممتلئة' : '❌ Family is full'); setJoining(false); return; }

            // If approval required, add to joinRequests
            if (fd.joinMode === 'approval') {
                await familiesCollection.doc(familyId).update({
                    joinRequests: firebase.firestore.FieldValue.arrayUnion(currentUID)
                });
                onNotification(lang === 'ar' ? '✅ تم إرسال طلب الانضمام' : '✅ Join request sent');
                setJoining(false);
                return;
            }

            await familiesCollection.doc(familyId).update({
                members: firebase.firestore.FieldValue.arrayUnion(currentUID),
                xp: firebase.firestore.FieldValue.increment(10),
                [`memberRoles.${currentUID}`]: 'member',
                [`memberDonations.${currentUID}`]: { weekly: 0, total: 0, weeklyIntel: 0, totalIntel: 0 },
                lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
            });
            await usersCollection.doc(currentUID).update({
                familyId, familyName: fd.name, familyTag: fd.tag,
                familySignLevel: getFamilySignLevelData(fd.activeness || 0).level,
                familySignColor: getFamilySignLevelData(fd.activeness || 0).color,
                familySignImageURL: fd.signImageURL || null,
            });
            // Post chat message AFTER joining
            await postSystemMessage(familyId, lang === 'ar' ? `🎉 ${currentUserData?.displayName} انضم للعائلة!` : `🎉 ${currentUserData?.displayName} joined the family!`);
            await postNews(familyId, 'join', lang === 'ar' ? `🎉 ${currentUserData?.displayName} انضم للعائلة!` : `🎉 ${currentUserData?.displayName} joined the family!`);
            onNotification(lang === 'ar' ? '✅ انضممت للعائلة!' : '✅ Joined family!');
        } catch (e) { console.error(e); onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
        setJoining(false);
    };

    const leaveFamily = async () => {
        if (!family?.id || !currentUID) return;
        const role = getFamilyRole(family, currentUID);
        const isLastLeader = role === 'owner' && (family.members || []).length > 1;
        if (isLastLeader) { onNotification(lang === 'ar' ? '❌ عيّن قائداً آخر أولاً' : '❌ Assign another leader first'); return; }
        try {
            if ((family.members || []).length <= 1) {
                await familiesCollection.doc(family.id).delete();
            } else {
                const updRoles = { ...family.memberRoles }; delete updRoles[currentUID];
                const updDons = { ...family.memberDonations }; delete updDons[currentUID];
                await familiesCollection.doc(family.id).update({
                    members: firebase.firestore.FieldValue.arrayRemove(currentUID),
                    memberRoles: updRoles, memberDonations: updDons,
                });
                await postSystemMessage(family.id, lang === 'ar' ? `👋 ${currentUserData?.displayName} غادر العائلة` : `👋 ${currentUserData?.displayName} left the family`);
                await postNews(family.id, 'leave', lang === 'ar' ? `${currentUserData?.displayName} غادر العائلة` : `${currentUserData?.displayName} left the family`);
            }
            await usersCollection.doc(currentUID).update({
                familyId: null, familyName: null, familyTag: null,
                familySignLevel: null, familySignColor: null, familySignImageURL: null,
            });
            setFamily(null); setView('home'); setActiveTab('profile');
            setShowHeaderMenu(false);
            onNotification(lang === 'ar' ? '👋 تركت العائلة' : '👋 Left family');
        } catch (e) { onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
    };

    const handleDonate = async () => {
        const amount = parseInt(donateAmount);
        if (!amount || amount <= 0 || !family?.id || donating) return;
        if ((currentUserData?.currency || 0) < amount) {
            onNotification(lang === 'ar' ? '❌ رصيدك غير كافٍ' : '❌ Insufficient Intel');
            return;
        }
        setDonating(true);
        try {
            const don = family.memberDonations?.[currentUID] || { weekly: 0, total: 0, weeklyIntel: 0, totalIntel: 0 };
            await familiesCollection.doc(family.id).update({
                treasury: firebase.firestore.FieldValue.increment(amount),
                xp: firebase.firestore.FieldValue.increment(Math.floor(amount / 10)),
                activeness: firebase.firestore.FieldValue.increment(amount),
                weeklyActiveness: firebase.firestore.FieldValue.increment(amount),
                [`memberDonations.${currentUID}.weekly`]: (don.weekly || 0) + amount,
                [`memberDonations.${currentUID}.total`]: (don.total || 0) + amount,
                [`memberDonations.${currentUID}.weeklyIntel`]: (don.weeklyIntel || 0) + amount,
                [`memberDonations.${currentUID}.totalIntel`]: (don.totalIntel || 0) + amount,
                lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
            });
            await usersCollection.doc(currentUID).update({
                currency: firebase.firestore.FieldValue.increment(-amount),
            });
            // Post donation in family chat
            await familiesCollection.doc(family.id).collection('messages').add({
                senderId: currentUID,
                senderName: currentUserData?.displayName || 'Member',
                senderPhoto: currentUserData?.photoURL || null,
                type: 'donation',
                amount,
                text: lang === 'ar' ? `💰 ${currentUserData?.displayName} تبرع بـ ${fmtFamilyNum(amount)} إنتل 🧠` : `💰 ${currentUserData?.displayName} donated ${fmtFamilyNum(amount)} Intel 🧠`,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            });
            await postNews(family.id, 'donation', lang === 'ar' ? `${currentUserData?.displayName} تبرع بـ ${fmtFamilyNum(amount)} إنتل` : `${currentUserData?.displayName} donated ${fmtFamilyNum(amount)} Intel`, amount);
            onNotification(`✅ +${fmtFamilyNum(amount)} 🧠 ${lang === 'ar' ? 'تم التبرع!' : 'Donated!'}`);
            setDonateAmount('');
            setShowDonatePanel(false);
        } catch (e) { onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
        setDonating(false);
    };

    const sendChatMessage = async () => {
        if (!chatInput.trim() || sendingMsg || !family?.id) return;
        setSendingMsg(true);
        const text = chatInput.trim();
        setChatInput('');
        try {
            await familiesCollection.doc(family.id).collection('messages').add({
                senderId: currentUID,
                senderName: currentUserData?.displayName || 'Member',
                senderPhoto: currentUserData?.photoURL || null,
                type: 'text', text,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            });
            // Mission progress: chat
            if (typeof incrementMissionProgress === 'function') {
                // Update task progress ft6
                const cur = family.taskProgress?.ft6?.current || 0;
                await familiesCollection.doc(family.id).update({
                    'taskProgress.ft6.current': Math.min(10, cur + 1),
                    activeness: firebase.firestore.FieldValue.increment(5),
                });
            }
        } catch (e) {}
        setSendingMsg(false);
    };

    const handleJoinRequest = async (uid, accept) => {
        if (!family?.id) return;
        try {
            const updates = { joinRequests: firebase.firestore.FieldValue.arrayRemove(uid) };
            if (accept) {
                updates[`memberRoles.${uid}`] = 'member';
                updates[`memberDonations.${uid}`] = { weekly: 0, total: 0, weeklyIntel: 0, totalIntel: 0 };
                updates.members = firebase.firestore.FieldValue.arrayUnion(uid);
                updates.xp = firebase.firestore.FieldValue.increment(5);
                await familiesCollection.doc(family.id).update(updates);
                const fd = await familiesCollection.doc(family.id).get();
                await usersCollection.doc(uid).update({
                    familyId: family.id, familyName: family.name, familyTag: family.tag,
                    familySignLevel: getFamilySignLevelData(fd.data()?.activeness || 0).level,
                    familySignColor: getFamilySignLevelData(fd.data()?.activeness || 0).color,
                    familySignImageURL: fd.data()?.signImageURL || null,
                });
                const p = joinRequesterProfiles.find(m => m.id === uid);
                await postSystemMessage(family.id, `🎉 ${p?.displayName || 'Member'} ${lang === 'ar' ? 'انضم للعائلة!' : 'joined the family!'}`);
                await postNews(family.id, 'join', `🎉 ${p?.displayName || 'Member'} ${lang === 'ar' ? 'انضم للعائلة!' : 'joined the family!'}`);
                onNotification(lang === 'ar' ? '✅ تم القبول' : '✅ Accepted');
            } else {
                await familiesCollection.doc(family.id).update(updates);
                onNotification(lang === 'ar' ? '❌ تم الرفض' : '❌ Rejected');
            }
        } catch (e) {}
    };

    const kickMember = async (uid) => {
        if (!family?.id || uid === family.createdBy) return;
        try {
            const updRoles = { ...family.memberRoles }; delete updRoles[uid];
            const updDons = { ...family.memberDonations }; delete updDons[uid];
            await familiesCollection.doc(family.id).update({
                members: firebase.firestore.FieldValue.arrayRemove(uid),
                memberRoles: updRoles, memberDonations: updDons,
            });
            await usersCollection.doc(uid).update({
                familyId: null, familyName: null, familyTag: null,
                familySignLevel: null, familySignColor: null, familySignImageURL: null,
            });
            const m = familyMembers.find(fm => fm.id === uid);
            await postSystemMessage(family.id, `${m?.displayName || 'Member'} ${lang === 'ar' ? 'تم طرده' : 'was kicked'}`);
            await postNews(family.id, 'leave', `${m?.displayName || 'Member'} ${lang === 'ar' ? 'تم طرده' : 'was kicked'}`);
            onNotification(lang === 'ar' ? '✅ تم الطرد' : '✅ Kicked');
        } catch (e) {}
    };

    const claimActiveMilestone = async (idx) => {
        if (!family?.id || !canManageFamily(family, currentUID)) return;
        try {
            await familiesCollection.doc(family.id).update({
                activenessClaimedMilestones: firebase.firestore.FieldValue.arrayUnion(idx),
                treasury: firebase.firestore.FieldValue.increment(ACTIVENESS_MILESTONES[idx].reward),
            });
            onNotification(`✅ +${ACTIVENESS_MILESTONES[idx].reward} 🧠 ${lang === 'ar' ? 'للخزينة!' : 'to treasury!'}`);
        } catch (e) {}
    };

    const saveAnnouncement = async () => {
        if (!family?.id || !canManageFamily(family, currentUID)) return;
        setSavingAnn(true);
        try {
            await familiesCollection.doc(family.id).update({ announcement: editAnnouncement });
            onNotification(lang === 'ar' ? '✅ تم الحفظ' : '✅ Saved');
        } catch (e) {}
        setSavingAnn(false);
    };

    const saveInfo = async () => {
        if (!family?.id || !canManageFamily(family, currentUID)) return;
        if (!editName.trim()) return;
        setSavingInfo(true);
        try {
            await familiesCollection.doc(family.id).update({
                name: editName.trim(),
                description: editDesc.trim(),
                joinMode: joinMode,
            });
            // Update familyName in user docs of all members
            for (const uid of (family.members || [])) {
                await usersCollection.doc(uid).update({ familyName: editName.trim() }).catch(() => {});
            }
            onNotification(lang === 'ar' ? '✅ تم الحفظ' : '✅ Saved');
        } catch (e) {}
        setSavingInfo(false);
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !family?.id || !canManageFamily(family, currentUID)) return;
        setUploadingPhoto(true);
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                const SIZE = 200;
                canvas.width = SIZE; canvas.height = SIZE;
                const ctx = canvas.getContext('2d');
                const scale = Math.max(SIZE / img.width, SIZE / img.height);
                const sw = img.width * scale, sh = img.height * scale;
                ctx.drawImage(img, (SIZE - sw) / 2, (SIZE - sh) / 2, sw, sh);
                const base64 = canvas.toDataURL('image/jpeg', 0.7);
                try {
                    await familiesCollection.doc(family.id).update({ photoURL: base64 });
                    onNotification(lang === 'ar' ? '✅ تم تحديث صورة العائلة' : '✅ Family photo updated');
                } catch (err) {}
                setUploadingPhoto(false);
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleSignImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !family?.id || !canManageFamily(family, currentUID)) return;
        setUploadingSign(true);
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                canvas.width = 120; canvas.height = 40;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, 120, 40);
                const scale = Math.min(120 / img.width, 40 / img.height);
                const dw = img.width * scale, dh = img.height * scale;
                ctx.drawImage(img, (120 - dw) / 2, (40 - dh) / 2, dw, dh);
                const base64 = canvas.toDataURL('image/png', 0.8);
                try {
                    await familiesCollection.doc(family.id).update({ signImageURL: base64 });
                    // Update all member user docs
                    for (const uid of (family.members || [])) {
                        await usersCollection.doc(uid).update({ familySignImageURL: base64 }).catch(() => {});
                    }
                    onNotification(lang === 'ar' ? '✅ تم تحديث صورة الشارة' : '✅ Sign image updated');
                } catch (err) {}
                setUploadingSign(false);
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };

    const searchFamilies = async () => {
        if (!joinSearch.trim() || searching) return;
        setSearching(true);
        try {
            const q = joinSearch.trim().toUpperCase();
            const snap = await familiesCollection.where('tag', '==', q).limit(5).get();
            if (snap.empty) {
                const snap2 = await familiesCollection.where('name', '>=', joinSearch.trim()).where('name', '<=', joinSearch.trim() + '\uf8ff').limit(5).get();
                setJoinResults(snap2.docs.map(d => ({ id: d.id, ...d.data() })));
            } else {
                setJoinResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            }
        } catch (e) { setJoinResults([]); }
        setSearching(false);
    };

    // ─────────────────────────────────────────────
    // STYLES
    // ─────────────────────────────────────────────
    const S = {
        modal: { background:'linear-gradient(180deg,#0d0d1f,#08080f)', border:'1px solid rgba(0,242,255,0.15)', borderRadius:'20px', width:'100%', maxWidth:'460px', height:'92vh', maxHeight:'800px', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,0.95)' },
        header: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0, background:'rgba(0,0,0,0.3)', position:'relative' },
        tabBar: { display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)', background:'rgba(0,0,0,0.2)', flexShrink:0, overflowX:'auto', scrollbarWidth:'none' },
        card: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'14px' },
        sectionTitle: { fontSize:'11px', fontWeight:800, color:'#00f2ff', textTransform:'uppercase', letterSpacing:'1px', paddingLeft:'10px', borderLeft:'3px solid #00f2ff', marginBottom:'12px' },
        input: { width:'100%', padding:'10px 13px', borderRadius:'10px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'white', fontSize:'13px', outline:'none', boxSizing:'border-box' },
        btn: { padding:'10px 18px', borderRadius:'10px', border:'none', fontWeight:800, fontSize:'12px', cursor:'pointer' },
        divider: { height:'1px', background:'rgba(255,255,255,0.06)', margin:'8px 0' },
    };

    const TABS = [
        { id:'profile',  label_en:'Home',     label_ar:'الرئيسية', icon:'🏠' },
        { id:'members',  label_en:'Members',  label_ar:'أعضاء',    icon:'👥' },
        { id:'tasks',    label_en:'Tasks',    label_ar:'مهام',     icon:'🎯' },
        { id:'shop',     label_en:'Shop',     label_ar:'المتجر',   icon:'🏅' },
        { id:'ranking',  label_en:'Ranking',  label_ar:'ترتيب',    icon:'🏆' },
        { id:'news',     label_en:'News',     label_ar:'أخبار',    icon:'📰' },
        { id:'manage',   label_en:'Manage',   label_ar:'إدارة',    icon:'⚙️' },
    ];

    const fLvl = family ? getFamilyLevel(family.xp || 0) : null;
    const fProg = family ? getFamilyLevelProgress(family.xp || 0) : 0;
    const myRole = family ? getFamilyRole(family, currentUID) : null;
    const canManage = family ? canManageFamily(family, currentUID) : false;
    const signData = family ? getFamilySignLevelData(family.activeness || 0) : FAMILY_SIGN_LEVELS[0];
    const signProg = family ? getFamilySignProgress(family.activeness || 0) : 0;

    // ─────────────────────────────────────────────
    // TAB: PROFILE
    // ─────────────────────────────────────────────
    const renderProfile = () => {
        if (!family || !fLvl) return null;
        const claimed = family.activenessClaimedMilestones || [];
        const weeklyAct = family.weeklyActiveness || 0;
        const treasury = family.treasury || 0;
        const ownerMember = familyMembers.find(m => m.id === family.createdBy);

        return (
            <div style={{flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:'12px'}}>

                {/* ── Family Hero ── */}
                <div style={{...S.card, background:`linear-gradient(135deg,rgba(0,242,255,0.06),rgba(112,0,255,0.06))`, border:`1px solid rgba(0,242,255,0.15)`, padding:'14px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
                        {/* Photo/Avatar */}
                        <div style={{position:'relative', flexShrink:0}}>
                            <div style={{width:'72px', height:'72px', borderRadius:'50%', border:`3px solid ${fLvl.color}`, overflow:'hidden', boxShadow:`0 0 16px ${fLvl.color}44`, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px'}}>
                                {family.photoURL
                                    ? <img src={family.photoURL} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>
                                    : family.emblem || '🏠'
                                }
                            </div>
                            <div style={{position:'absolute', bottom:'-4px', left:'50%', transform:'translateX(-50%)', background:fLvl.color, color:'#000', fontSize:'9px', fontWeight:900, padding:'1px 7px', borderRadius:'10px', whiteSpace:'nowrap'}}>
                                LV.{fLvl.level}
                            </div>
                        </div>
                        <div style={{flex:1, minWidth:0}}>
                            <div style={{display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap', marginBottom:'4px'}}>
                                <span style={{fontSize:'18px', fontWeight:900, color:'white', fontStyle:'italic', letterSpacing:'-0.5px'}}>{family.name}</span>
                                <FamilySignBadge tag={family.tag} color={signData.color} signLevel={signData.level} imageURL={family.signImageURL} />
                            </div>
                            <div style={{fontSize:'10px', color:'#6b7280', marginBottom:'4px'}}>ID · {family.id?.slice(-6).toUpperCase()}</div>
                            <div style={{display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center'}}>
                                <span style={{fontSize:'10px', fontWeight:700, color:fLvl.color}}>{fLvl.icon} {lang==='ar'?fLvl.name_ar:fLvl.name_en}</span>
                                <span style={{fontSize:'10px', color:'#6b7280'}}>👥 {family.members?.length||0}/{fLvl.maxMembers}</span>
                            </div>
                        </div>
                    </div>

                    {/* XP Progress */}
                    <div style={{marginTop:'12px'}}>
                        <div style={{display:'flex', justifyContent:'space-between', fontSize:'9px', color:'#6b7280', marginBottom:'4px'}}>
                            <span>XP: {fmtFamilyNum(family.xp||0)}</span>
                            <span>{fProg}%</span>
                            {FAMILY_LEVEL_CONFIG.find(c=>c.level===fLvl.level+1) && <span>{lang==='ar'?'التالي':'Next'}: {fmtFamilyNum(FAMILY_LEVEL_CONFIG.find(c=>c.level===fLvl.level+1).xp)}</span>}
                        </div>
                        <div style={{height:'5px', borderRadius:'3px', background:'rgba(255,255,255,0.08)', overflow:'hidden'}}>
                            <div style={{height:'100%', borderRadius:'3px', width:`${fProg}%`, background:`linear-gradient(90deg,${fLvl.color},${fLvl.color}88)`, transition:'width 0.6s ease'}} />
                        </div>
                    </div>
                </div>

                {/* ── Owner / Manager ── */}
                {ownerMember && (
                    <div style={{...S.card, display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px'}}>
                        <div style={{width:'36px',height:'36px',borderRadius:'50%',overflow:'hidden',flexShrink:0,background:'rgba(255,215,0,0.1)',border:'2px solid rgba(255,215,0,0.4)'}}>
                            {ownerMember.photoURL?<img src={ownerMember.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:'18px',display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>👑</span>}
                        </div>
                        <div>
                            <div style={{fontSize:'10px', color:'#fbbf24', fontWeight:700}}>👑 {lang==='ar'?'مالك العائلة':'Family Owner'}</div>
                            <div style={{fontSize:'13px', fontWeight:800, color:'white'}}>{ownerMember.displayName}</div>
                        </div>
                        <div style={{marginLeft:'auto', textAlign:'right'}}>
                            <div style={{fontSize:'10px', color:'#6b7280'}}>{lang==='ar'?'أعضاء':'Members'}</div>
                            <div style={{fontSize:'14px', fontWeight:900, color:'#00f2ff'}}>{family.members?.length||0}</div>
                        </div>
                    </div>
                )}

                {/* ── Family Sign Level ── */}
                <div style={S.card}>
                    <div style={S.sectionTitle}>🏴 {lang==='ar'?'شارة العائلة':'Family Sign'}</div>
                    <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'10px'}}>
                        <div style={{
                            width:'56px', height:'56px', borderRadius:'14px',
                            background: signData.bg, border:`2px solid ${signData.color}55`,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            boxShadow: signData.level >= 4 ? `0 0 16px ${signData.glow}` : 'none',
                            flexShrink:0, overflow:'hidden',
                        }}>
                            {family.signImageURL
                                ? <img src={family.signImageURL} style={{width:'100%',height:'100%',objectFit:'contain'}} alt=""/>
                                : <span style={{fontSize:'28px'}}>{signData.defaultIcon}</span>
                            }
                        </div>
                        <div style={{flex:1}}>
                            <div style={{fontSize:'13px', fontWeight:800, color:signData.color, marginBottom:'2px'}}>
                                {lang==='ar' ? signData.name_ar : signData.name_en}
                            </div>
                            <div style={{fontSize:'10px', color:'#6b7280', marginBottom:'6px'}}>
                                {lang==='ar'?'المستوى':'Level'} {signData.level}/5 · {fmtFamilyNum(family.activeness||0)} {lang==='ar'?'نشاط':'Activeness'}
                            </div>
                            <div style={{height:'4px', borderRadius:'2px', background:'rgba(255,255,255,0.07)', overflow:'hidden'}}>
                                <div style={{height:'100%', borderRadius:'2px', width:`${signProg}%`, background:`linear-gradient(90deg,${signData.color},${signData.color}88)`, transition:'width 0.6s ease'}} />
                            </div>
                        </div>
                    </div>
                    {/* Sign levels progression */}
                    <div style={{display:'flex', gap:'4px', justifyContent:'space-between'}}>
                        {FAMILY_SIGN_LEVELS.map(sl => (
                            <div key={sl.level} style={{flex:1, textAlign:'center', padding:'4px 2px', borderRadius:'6px', background: sl.level <= signData.level ? `${sl.color}20` : 'rgba(255,255,255,0.03)', border:`1px solid ${sl.level <= signData.level ? sl.color+'40' : 'rgba(255,255,255,0.06)'}`, opacity: sl.level <= signData.level ? 1 : 0.4}}>
                                <div style={{fontSize:'12px'}}>{sl.defaultIcon}</div>
                                <div style={{fontSize:'8px', color: sl.level <= signData.level ? sl.color : '#4b5563', fontWeight:700}}>L{sl.level}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Treasury & Stats ── */}
                <div style={{display:'flex', gap:'8px'}}>
                    <div style={{flex:1, ...S.card, background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.2)', textAlign:'center', padding:'10px'}}>
                        <div style={{fontSize:'10px', color:'#9ca3af', marginBottom:'3px'}}>🧠 {lang==='ar'?'خزينة العائلة':'Treasury'}</div>
                        <div style={{fontSize:'16px', fontWeight:900, color:'#ffd700', fontStyle:'italic'}}>{fmtFamilyNum(treasury)}</div>
                    </div>
                    <div style={{flex:1, ...S.card, background:'rgba(0,242,255,0.04)', border:'1px solid rgba(0,242,255,0.15)', textAlign:'center', padding:'10px'}}>
                        <div style={{fontSize:'10px', color:'#9ca3af', marginBottom:'3px'}}>⚡ {lang==='ar'?'النشاط الأسبوعي':'Weekly Activity'}</div>
                        <div style={{fontSize:'16px', fontWeight:900, color:'#00f2ff', fontStyle:'italic'}}>{fmtFamilyNum(weeklyAct)}</div>
                    </div>
                </div>

                {/* ── Donate Button ── */}
                <div style={S.card}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: showDonatePanel ? '10px' : '0'}}>
                        <div style={{fontSize:'12px', fontWeight:700, color:'white'}}>💰 {lang==='ar'?'التبرع للعائلة':'Donate to Family'}</div>
                        <button onClick={()=>setShowDonatePanel(!showDonatePanel)} style={{...S.btn, padding:'6px 14px', fontSize:'11px', background:'linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,140,0,0.15))', border:'1px solid rgba(255,215,0,0.3)', color:'#fbbf24'}}>
                            {showDonatePanel ? (lang==='ar'?'إغلاق':'Close') : (lang==='ar'?'تبرع':'Donate')}
                        </button>
                    </div>
                    {showDonatePanel && (
                        <div style={{display:'flex', gap:'8px'}}>
                            <input type="number" value={donateAmount} onChange={e=>setDonateAmount(e.target.value)} style={{...S.input, flex:1}} placeholder={lang==='ar'?'الكمية (إنتل)':'Amount (Intel)'} min="1" />
                            <button onClick={handleDonate} disabled={donating||!donateAmount} style={{...S.btn, flexShrink:0, padding:'10px 16px', background:donateAmount&&!donating?'linear-gradient(135deg,#ffd700,#f97316)':'rgba(255,255,255,0.06)', color:donateAmount?'#000':'#4b5563', cursor:donateAmount?'pointer':'not-allowed'}}>
                                {donating?'⏳':'🧠'}
                            </button>
                        </div>
                    )}
                    <div style={{fontSize:'10px', color:'#4b5563', marginTop:'6px'}}>
                        {lang==='ar'?`رصيدك: ${fmtFamilyNum(currentUserData?.currency||0)} 🧠`:`Your balance: ${fmtFamilyNum(currentUserData?.currency||0)} 🧠`}
                    </div>
                </div>

                {/* ── Activeness Milestones ── */}
                <div style={S.card}>
                    <div style={S.sectionTitle}>🎁 {lang==='ar'?'مكافآت النشاط':'Activeness Rewards'}</div>
                    <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
                        {ACTIVENESS_MILESTONES.map((ms, idx) => {
                            const isClaimed = claimed.includes(idx);
                            const isReached = (family.activeness || 0) >= ms.threshold;
                            return (
                                <div key={idx} style={{display:'flex', alignItems:'center', gap:'10px', padding:'8px 10px', borderRadius:'10px', background: isClaimed?'rgba(16,185,129,0.08)':isReached?'rgba(0,242,255,0.06)':'rgba(255,255,255,0.03)', border:`1px solid ${isClaimed?'rgba(16,185,129,0.25)':isReached?'rgba(0,242,255,0.2)':'rgba(255,255,255,0.06)'}`}}>
                                    <span style={{fontSize:'16px'}}>{ms.icon}</span>
                                    <div style={{flex:1}}>
                                        <div style={{fontSize:'11px', fontWeight:700, color:isClaimed?'#10b981':isReached?'#00f2ff':'#6b7280'}}>{fmtFamilyNum(ms.threshold)} {lang==='ar'?'نشاط':'activeness'}</div>
                                        <div style={{fontSize:'10px', color:'#fbbf24', fontWeight:700}}>+{fmtFamilyNum(ms.reward)} 🧠</div>
                                    </div>
                                    {canManage && (
                                        <button disabled={isClaimed||!isReached} onClick={()=>claimActiveMilestone(idx)}
                                            style={{...S.btn, padding:'5px 12px', fontSize:'10px', background:isClaimed?'rgba(16,185,129,0.15)':isReached?'rgba(0,242,255,0.2)':'rgba(255,255,255,0.04)', color:isClaimed?'#10b981':isReached?'#00f2ff':'#4b5563', cursor:isReached&&!isClaimed?'pointer':'not-allowed', border:'none'}}>
                                            {isClaimed?'✅':(lang==='ar'?'اجمع':'Claim')}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Announcement ── */}
                {family.announcement && (
                    <div style={{...S.card, background:'rgba(0,242,255,0.04)', border:'1px solid rgba(0,242,255,0.15)'}}>
                        <div style={{fontSize:'10px', fontWeight:800, color:'#00f2ff', marginBottom:'6px'}}>📢 {lang==='ar'?'إعلان':'Announcement'}</div>
                        <div style={{fontSize:'12px', color:'#d1d5db', lineHeight:1.6}}>{family.announcement}</div>
                    </div>
                )}

                <div style={{height:'12px'}} />
            </div>
        );
    };

    // ─────────────────────────────────────────────
    // TAB: CHAT
    // ─────────────────────────────────────────────
    const renderChat = () => {
        if (!family) return null;
        return (
            <div style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0}}>
                {/* Messages */}
                <div style={{flex:1, overflowY:'auto', padding:'10px 12px', display:'flex', flexDirection:'column', gap:'8px'}}>
                    {chatMessages.length === 0 && (
                        <div style={{textAlign:'center', padding:'40px 20px', color:'#4b5563'}}>
                            <div style={{fontSize:'36px', marginBottom:'10px'}}>💬</div>
                            <div style={{fontSize:'12px'}}>{lang==='ar'?'كن أول من يتحدث!':'Be the first to chat!'}</div>
                        </div>
                    )}
                    {chatMessages.map(msg => {
                        const isMe = msg.senderId === currentUID;
                        const isSystem = msg.senderId === 'system' || msg.type === 'system';
                        const isDonation = msg.type === 'donation';

                        if (isSystem) return (
                            <div key={msg.id} style={{textAlign:'center', padding:'4px 12px'}}>
                                <span style={{fontSize:'10px', color:'#6b7280', background:'rgba(255,255,255,0.04)', padding:'3px 10px', borderRadius:'20px'}}>{msg.text}</span>
                            </div>
                        );

                        if (isDonation) return (
                            <div key={msg.id} style={{display:'flex', justifyContent:'center', padding:'4px 0'}}>
                                <div style={{background:'linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,140,0,0.1))', border:'1px solid rgba(255,215,0,0.3)', borderRadius:'12px', padding:'8px 14px', maxWidth:'90%', textAlign:'center'}}>
                                    <div style={{fontSize:'12px', color:'#ffd700', fontWeight:800}}>{msg.text}</div>
                                    <div style={{fontSize:'10px', color:'#6b7280', marginTop:'2px'}}>{fmtFamilyTime(msg.timestamp, lang)}</div>
                                </div>
                            </div>
                        );

                        return (
                            <div key={msg.id} style={{display:'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap:'8px', alignItems:'flex-end'}}>
                                {!isMe && (
                                    <div style={{width:'28px', height:'28px', borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.1)'}}>
                                        {msg.senderPhoto
                                            ? <img src={msg.senderPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                                            : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}>😎</div>
                                        }
                                    </div>
                                )}
                                <div style={{maxWidth:'72%'}}>
                                    {!isMe && <div style={{fontSize:'10px', color:'#9ca3af', marginBottom:'3px', fontWeight:700, paddingLeft:'4px'}}>{msg.senderName}</div>}
                                    <div style={{
                                        padding:'8px 12px', borderRadius: isMe ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                                        background: isMe ? 'linear-gradient(135deg,rgba(0,242,255,0.2),rgba(112,0,255,0.2))' : 'rgba(255,255,255,0.07)',
                                        border: isMe ? '1px solid rgba(0,242,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                                        fontSize:'12px', color:'#e2e8f0', lineHeight:1.5,
                                        wordBreak:'break-word',
                                    }}>
                                        {msg.text}
                                    </div>
                                    <div style={{fontSize:'9px', color:'#4b5563', marginTop:'2px', textAlign: isMe ? 'right' : 'left', paddingLeft:'4px', paddingRight:'4px'}}>
                                        {fmtFamilyTime(msg.timestamp, lang)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>

                {/* Input bar */}
                <div style={{padding:'10px 12px', borderTop:'1px solid rgba(255,255,255,0.07)', background:'rgba(0,0,0,0.3)', display:'flex', gap:'8px', alignItems:'center', flexShrink:0}}>
                    <input
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                        maxLength={300}
                        style={{...S.input, flex:1, padding:'9px 12px', fontSize:'12px'}}
                        placeholder={lang==='ar'?'اكتب رسالة...':'Type a message...'}
                    />
                    <button onClick={sendChatMessage} disabled={!chatInput.trim()||sendingMsg}
                        style={{width:'38px', height:'38px', borderRadius:'10px', border:'none', flexShrink:0, background:chatInput.trim()?'linear-gradient(135deg,#00f2ff,#7000ff)':'rgba(255,255,255,0.06)', color:chatInput.trim()?'white':'#4b5563', fontSize:'16px', cursor:chatInput.trim()?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        {sendingMsg ? '⏳' : '➤'}
                    </button>
                </div>
            </div>
        );
    };

    // ─────────────────────────────────────────────
    // TAB: MEMBERS
    // ─────────────────────────────────────────────
    const renderMembers = () => {
        if (!family) return null;
        const donations = family.memberDonations || {};
        const actData   = family.memberActiveness || {};
        const sorted = [...familyMembers].sort((a, b) => {
            const aD = donations[a.id] || {};
            const bD = donations[b.id] || {};
            const aV = donationSort === 'intel' ? (aD.totalIntel || aD.total || 0) : (aD.weeklyIntel || aD.weekly || 0);
            const bV = donationSort === 'intel' ? (bD.totalIntel || bD.total || 0) : (bD.weeklyIntel || bD.weekly || 0);
            const aOwner = getFamilyRole(family, a.id) === 'owner' ? 1 : 0;
            const bOwner = getFamilyRole(family, b.id) === 'owner' ? 1 : 0;
            if (aOwner !== bOwner) return bOwner - aOwner;
            return bV - aV;
        }).filter(m => !memberSearch || m.displayName?.toLowerCase().includes(memberSearch.toLowerCase()));

        return (
            <div style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0}}>
                {/* Header */}
                <div style={{padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0}}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'6px 10px'}}>
                        <span style={{fontSize:'14px'}}>🔍</span>
                        <input value={memberSearch} onChange={e=>setMemberSearch(e.target.value)} style={{flex:1, background:'transparent', border:'none', outline:'none', color:'white', fontSize:'12px'}} placeholder={lang==='ar'?'بحث...':'Search...'} />
                        <span style={{fontSize:'10px', color:'#6b7280', fontWeight:700}}>{family.members?.length||0}/{getFamilyLevel(family.xp||0).maxMembers}</span>
                    </div>
                    <div style={{display:'flex', gap:'6px'}}>
                        {[
                            ['intel',  lang==='ar' ? '🧠 إجمالي التبرع' : '🧠 Total Donated'],
                            ['weekly', lang==='ar' ? '⚡ أسبوعي'        : '⚡ Weekly']
                        ].map(([s, lbl]) => (
                            <button key={s} onClick={()=>setDonationSort(s)} style={{flex:1, padding:'5px', borderRadius:'8px', border:`1px solid ${donationSort===s?'rgba(0,242,255,0.4)':'rgba(255,255,255,0.07)'}`, background:donationSort===s?'rgba(0,242,255,0.1)':'transparent', color:donationSort===s?'#00f2ff':'#6b7280', fontSize:'10px', fontWeight:donationSort===s?800:500, cursor:'pointer'}}>
                                {lbl}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div style={{flex:1, overflowY:'auto'}}>
                    {sorted.map((m, i) => {
                        const role = getFamilyRole(family, m.id);
                        const rCfg = FAMILY_ROLE_CONFIG[role];
                        const don  = donations[m.id] || {};
                        const act  = actData[m.id]   || {};
                        const total       = donationSort === 'intel' ? (don.totalIntel || don.total || 0) : (don.weeklyIntel || don.weekly || 0);
                        const weeklyAct   = act.weekly || 0;
                        const totalAct    = act.total  || 0;
                        const isTop3 = i < 3;
                        const topColors = ['rgba(255,215,0,0.06)','rgba(192,192,192,0.04)','rgba(205,127,50,0.04)'];
                        return (
                            <div key={m.id} style={{display:'flex', alignItems:'center', padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,0.04)', background:isTop3?topColors[i]:'transparent'}}>
                                <div style={{width:'20px', textAlign:'center', fontSize:'11px', color:i===0?'#ffd700':i===1?'#9ca3af':i===2?'#fb923c':'#4b5563', fontWeight:800, marginRight:'8px', flexShrink:0}}>
                                    {i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`}
                                </div>
                                <div style={{position:'relative', flexShrink:0, marginRight:'10px'}}>
                                    <div style={{width:'44px', height:'44px', borderRadius:'50%', border:`2px solid ${rCfg.color}66`, overflow:'hidden', background:'rgba(255,255,255,0.08)'}}>
                                        {m.photoURL ? <img src={m.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>😎</div>}
                                    </div>
                                    {role==='owner' && <div style={{position:'absolute', top:'-4px', right:'-4px', fontSize:'11px'}}>👑</div>}
                                </div>
                                <div style={{flex:1, minWidth:0}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'5px', flexWrap:'wrap', marginBottom:'2px'}}>
                                        <span style={{fontSize:'12px', fontWeight:800, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'90px', fontStyle:'italic'}}>{m.displayName}</span>
                                        <FamilySignBadge tag={family.tag} color={signData.color} small signLevel={signData.level} imageURL={family.signImageURL} />
                                    </div>
                                    <FamilyRoleBadge role={role} lang={lang} small />
                                </div>
                                {/* Analytics: Weekly + Total Activeness */}
                                <div style={{textAlign:'right', flexShrink:0, display:'flex', flexDirection:'column', gap:'2px'}}>
                                    <div style={{fontSize:'11px', fontWeight:900, color:'#fbbf24', fontStyle:'italic'}}>{fmtFamilyNum(total)} 🧠</div>
                                    <div style={{display:'flex', gap:'6px', justifyContent:'flex-end'}}>
                                        <span style={{fontSize:'9px', color:'#00f2ff', fontWeight:700}}>⚡{fmtFamilyNum(weeklyAct)}</span>
                                        <span style={{fontSize:'9px', color:'#6b7280'}}>|</span>
                                        <span style={{fontSize:'9px', color:'#a78bfa', fontWeight:700}}>∑{fmtFamilyNum(totalAct)}</span>
                                    </div>
                                    <div style={{fontSize:'8px', color:'#4b5563'}}>{lang==='ar'?'أسبوعي | إجمالي':'weekly | total'}</div>
                                </div>
                            </div>
                        );
                    })}
                    {sorted.length === 0 && <div style={{textAlign:'center', padding:'30px', color:'#4b5563', fontSize:'12px'}}>{lang==='ar'?'لا أعضاء':'No members found'}</div>}
                </div>
            </div>
        );
    };

    // ─────────────────────────────────────────────
    // TAB: TASKS
    // ─────────────────────────────────────────────
    const renderTasks = () => {
        if (!family) return null;
        const taskProgress = family.taskProgress || {};

        return (
            <div style={{flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:'10px'}}>
                <div style={{...S.card, background:'rgba(0,242,255,0.04)', border:'1px solid rgba(0,242,255,0.15)', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div>
                        <div style={{fontSize:'10px', color:'#6b7280'}}>🧠 {lang==='ar'?'خزينة العائلة':'Family Treasury'}</div>
                        <div style={{fontSize:'18px', fontWeight:900, color:'#00f2ff', fontStyle:'italic'}}>{fmtFamilyNum(family.treasury||0)}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                        <div style={{fontSize:'10px', color:'#6b7280'}}>⚡ {lang==='ar'?'نشاطي':'My activity'}</div>
                        <div style={{fontSize:'14px', fontWeight:800, color:'#fbbf24'}}>{fmtFamilyNum((family.memberDonations?.[currentUID]?.totalIntel || family.memberDonations?.[currentUID]?.total) || 0)}</div>
                    </div>
                </div>

                {FAMILY_TASKS_CONFIG.map(task => {
                    const prog = taskProgress[task.id] || { current: 0, claimed: false };
                    const pct = Math.min(100, Math.round((prog.current / task.target) * 100));
                    const isDone = prog.current >= task.target;
                    const isClaimed = prog.claimed;

                    return (
                        <div key={task.id} style={{...S.card, border:`1px solid ${isClaimed?'rgba(16,185,129,0.25)':isDone?'rgba(0,242,255,0.2)':'rgba(255,255,255,0.07)'}`}}>
                            <div style={{display:'flex', alignItems:'flex-start', gap:'10px'}}>
                                <div style={{width:'42px', height:'42px', borderRadius:'12px', background:isClaimed?'rgba(16,185,129,0.15)':isDone?'rgba(0,242,255,0.12)':'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0, border:`1px solid ${isClaimed?'rgba(16,185,129,0.3)':isDone?'rgba(0,242,255,0.3)':'rgba(255,255,255,0.08)'}`}}>
                                    {isClaimed ? '✅' : isDone ? '🎯' : task.icon}
                                </div>
                                <div style={{flex:1, minWidth:0}}>
                                    <div style={{fontSize:'12px', fontWeight:700, color:isClaimed?'#10b981':isDone?'#00f2ff':'#e2e8f0', marginBottom:'2px'}}>
                                        {lang==='ar' ? task.title_ar : task.title_en}
                                    </div>
                                    <div style={{fontSize:'10px', color:'#6b7280', marginBottom:'6px'}}>{lang==='ar' ? task.sub_ar : task.sub_en}</div>
                                    {!isClaimed && (
                                        <div>
                                            <div style={{display:'flex', justifyContent:'space-between', fontSize:'9px', color:'#4b5563', marginBottom:'3px'}}>
                                                <span>{prog.current}/{task.target}</span>
                                                <span>{pct}%</span>
                                            </div>
                                            <div style={{height:'4px', borderRadius:'2px', background:'rgba(255,255,255,0.07)', overflow:'hidden'}}>
                                                <div style={{height:'100%', borderRadius:'2px', width:`${pct}%`, background:isDone?'linear-gradient(90deg,#00f2ff,#7000ff)':'linear-gradient(90deg,#6b7280,#9ca3af)', transition:'width 0.5s'}} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'6px', flexShrink:0}}>
                                    <div style={{fontSize:'10px', fontWeight:800, color:'#fbbf24'}}>
                                        +{task.reward.intel||task.reward.amount||0}🧠
                                    </div>
                                    <div style={{fontSize:'9px', fontWeight:700, color:'#00f2ff'}}>
                                        +{task.reward.xp||0} XP
                                    </div>
                                    <div style={{fontSize:'9px', fontWeight:700, color:'#a78bfa'}}>
                                        +{task.reward.coins||0}{FAMILY_COINS_SYMBOL}
                                    </div>
                                    <button
                                        disabled={isClaimed || !isDone}
                                        onClick={async () => {
                                            if (!isDone || isClaimed || !family?.id) return;
                                            try {
                                                const r = task.reward;
                                                await familiesCollection.doc(family.id).update({
                                                    [`taskProgress.${task.id}.claimed`]: true,
                                                    xp:         firebase.firestore.FieldValue.increment(r.xp || 0),
                                                    activeness: firebase.firestore.FieldValue.increment((r.xp || 0) * 2),
                                                    familyCoins: firebase.firestore.FieldValue.increment(r.coins || 0),
                                                });
                                                await usersCollection.doc(currentUID).update({
                                                    currency: firebase.firestore.FieldValue.increment(r.intel || r.amount || 0),
                                                });
                                                onNotification(`✅ +${r.intel||r.amount||0}🧠 +${r.xp||0}XP +${r.coins||0}${FAMILY_COINS_SYMBOL}`);
                                            } catch(e) {}
                                        }}
                                        style={{...S.btn, padding:'5px 12px', fontSize:'11px', background:isClaimed?'rgba(16,185,129,0.15)':isDone?'linear-gradient(135deg,#00f2ff,#7000ff)':'rgba(255,255,255,0.06)', color:isClaimed?'#10b981':isDone?'white':'#4b5563', cursor:isDone&&!isClaimed?'pointer':'not-allowed', border:'none'}}>
                                        {isClaimed ? (lang==='ar'?'تم':'Done') : isDone ? (lang==='ar'?'اجمع':'Claim') : (lang==='ar'?'ابدأ':'Go')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div style={{height:'12px'}} />
            </div>
        );
    };

    // ─────────────────────────────────────────────
    // TAB: FAMILY SHOP (Family Coins only)
    // ─────────────────────────────────────────────
    const renderShop = () => {
        if (!family) return null;
        const coins = family.familyCoins || 0;
        const purchases = family.shopPurchases || {};
        const RARITY_COLORS = { rare:'#60a5fa', epic:'#a78bfa', legendary:'#ffd700' };

        const handleBuy = async (item) => {
            if (!currentUID || !family?.id) return;
            if (coins < item.cost) {
                onNotification(lang==='ar' ? `❌ تحتاج ${item.cost}${FAMILY_COINS_SYMBOL}` : `❌ Need ${item.cost}${FAMILY_COINS_SYMBOL}`);
                return;
            }
            try {
                const key = `${currentUID}_${item.id}`;
                if (purchases[key]) {
                    onNotification(lang==='ar' ? '✅ اشتريت هذا بالفعل' : '✅ Already purchased'); return;
                }
                await familiesCollection.doc(family.id).update({
                    familyCoins: firebase.firestore.FieldValue.increment(-item.cost),
                    [`shopPurchases.${key}`]: true,
                });
                // Grant to user inventory based on type
                const inventoryKey = item.type === 'badge' ? 'inventory.badges' : item.type === 'title' ? 'inventory.titles' : null;
                if (inventoryKey) {
                    await usersCollection.doc(currentUID).update({
                        [inventoryKey]: firebase.firestore.FieldValue.arrayUnion(item.id),
                    });
                }
                onNotification(`✅ ${lang==='ar'?'تم الشراء!':'Purchased!'} ${item.emoji}`);
            } catch(e) {
                onNotification(lang==='ar' ? '❌ خطأ في الشراء' : '❌ Purchase error');
            }
        };

        return (
            <div style={{flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:'12px'}}>
                {/* Coins Header */}
                <div style={{...S.card, background:'linear-gradient(135deg,rgba(167,139,250,0.1),rgba(112,0,255,0.08))', border:'1px solid rgba(167,139,250,0.3)', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    <div>
                        <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'2px'}}>{lang==='ar'?'💰 عملات العائلة':'💰 Family Coins'}</div>
                        <div style={{fontSize:'24px', fontWeight:900, color:'#a78bfa', fontStyle:'italic'}}>{coins} {FAMILY_COINS_SYMBOL}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                        <div style={{fontSize:'10px', color:'#6b7280', marginBottom:'2px'}}>{lang==='ar'?'اجمعها من المهام':'Earn from Tasks'}</div>
                        <div style={{fontSize:'11px', color:'#a78bfa', fontWeight:700}}>🎯 {lang==='ar'?'مهمة = عملات':'Tasks = Coins'}</div>
                    </div>
                </div>

                <div style={S.sectionTitle}>🏅 {lang==='ar'?'المتجر الحصري':'Exclusive Store'}</div>

                {/* Shop Items Grid */}
                <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'10px'}}>
                    {(typeof FAMILY_SHOP_ITEMS !== 'undefined' ? FAMILY_SHOP_ITEMS : []).map(item => {
                        const key = `${currentUID}_${item.id}`;
                        const owned = purchases[key];
                        const canAfford = coins >= item.cost;
                        const rColor = RARITY_COLORS[item.rarity] || '#9ca3af';
                        return (
                            <div key={item.id} style={{
                                ...S.card,
                                padding:'14px 12px',
                                border:`1px solid ${owned?'rgba(16,185,129,0.4)':canAfford?rColor+'44':'rgba(255,255,255,0.07)'}`,
                                background: owned?'rgba(16,185,129,0.06)':canAfford?`${rColor}08`:'rgba(255,255,255,0.02)',
                                display:'flex', flexDirection:'column', alignItems:'center', gap:'8px',
                                transition:'all 0.2s', position:'relative',
                            }}>
                                {/* Rarity badge */}
                                <div style={{position:'absolute', top:'6px', right:'6px', fontSize:'8px', fontWeight:800, color:rColor, background:`${rColor}20`, padding:'1px 5px', borderRadius:'4px', textTransform:'uppercase'}}>{item.rarity}</div>
                                <div style={{fontSize:'32px', lineHeight:1, filter: owned?'none':`drop-shadow(0 0 6px ${rColor}88)`}}>{item.emoji}</div>
                                <div style={{textAlign:'center'}}>
                                    <div style={{fontSize:'11px', fontWeight:800, color: owned?'#10b981':canAfford?'white':'#6b7280', marginBottom:'2px'}}>
                                        {lang==='ar' ? item.name_ar : item.name_en}
                                    </div>
                                    <div style={{fontSize:'9px', color:'#6b7280', lineHeight:1.3, marginBottom:'4px'}}>
                                        {lang==='ar' ? item.desc_ar : item.desc_en}
                                    </div>
                                </div>
                                <button
                                    onClick={() => !owned && handleBuy(item)}
                                    disabled={owned || !canAfford}
                                    style={{
                                        padding:'6px 14px', borderRadius:'8px', border:'none', fontSize:'11px', fontWeight:800, cursor: owned||!canAfford?'not-allowed':'pointer',
                                        background: owned?'rgba(16,185,129,0.2)':canAfford?`linear-gradient(135deg,${rColor},${rColor}cc)`:'rgba(255,255,255,0.05)',
                                        color: owned?'#10b981':canAfford?'white':'#4b5563',
                                        width:'100%',
                                    }}>
                                    {owned ? `✅ ${lang==='ar'?'مشتري':'Owned'}` : `${item.cost}${FAMILY_COINS_SYMBOL}`}
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div style={{height:'12px'}} />
            </div>
        );
    };

    // ─────────────────────────────────────────────
    // TAB: RANKING (dedicated tab)
    // ─────────────────────────────────────────────
    const renderRankingTab = () => {
        return (
            <div style={{flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:'10px'}}>
                <div style={S.sectionTitle}>🏆 {lang==='ar'?'ترتيب العائلات':'Family Rankings'}</div>
                <FamilyRankingInline lang={lang} currentFamilyId={family?.id} />
            </div>
        );
    };

    // ─────────────────────────────────────────────
    // TAB: NEWS
    // ─────────────────────────────────────────────
    const renderNews = () => {
        const newsTypeIcon = { join:'🎉', leave:'👋', donation:'💰', level_up:'⬆️', task_complete:'✅', milestone:'🎁' };
        return (
            <div style={{flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:'6px'}}>
                <div style={S.sectionTitle}>📰 {lang==='ar'?'أخبار العائلة':'Family News'}</div>
                {newsLog.length === 0 ? (
                    <div style={{textAlign:'center', padding:'40px', color:'#4b5563'}}>
                        <div style={{fontSize:'32px', marginBottom:'10px'}}>📭</div>
                        <div style={{fontSize:'12px'}}>{lang==='ar'?'لا أخبار بعد':'No news yet'}</div>
                    </div>
                ) : newsLog.map(item => (
                    <div key={item.id} style={{...S.card, padding:'10px 12px', display:'flex', alignItems:'center', gap:'10px'}}>
                        <div style={{width:'34px', height:'34px', borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.08)'}}>
                            {item.actorPhoto ? <img src={item.actorPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}>{newsTypeIcon[item.type]||'📢'}</div>}
                        </div>
                        <div style={{flex:1, minWidth:0}}>
                            <div style={{fontSize:'12px', color:'#d1d5db', lineHeight:1.4}}>{item.text}</div>
                            {item.amount > 0 && <div style={{fontSize:'10px', color:'#ffd700', fontWeight:700, marginTop:'2px'}}>+{fmtFamilyNum(item.amount)} 🧠</div>}
                        </div>
                        <div style={{fontSize:'10px', color:'#4b5563', flexShrink:0}}>{fmtFamilyTime(item.createdAt, lang)}</div>
                    </div>
                ))}
                <div style={{height:'12px'}} />
            </div>
        );
    };

    // ─────────────────────────────────────────────
    // TAB: MANAGE
    // ─────────────────────────────────────────────
    const renderManage = () => {
        const requests = family?.joinRequests || [];

        return (
            <div style={{flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:'12px'}}>

                {/* ── Non-admin notice ── */}
                {!canManage && (
                    <div style={{padding:'10px 14px', borderRadius:'10px', background:'rgba(107,114,128,0.1)', border:'1px solid rgba(107,114,128,0.2)', fontSize:'11px', color:'#9ca3af', textAlign:'center'}}>
                        👀 {lang==='ar'?'يمكنك الاطلاع فقط · التعديل للمسؤولين':'View only · Editing is for admins'}
                    </div>
                )}

                {/* ── Edit Family Info ── */}
                <div style={S.card}>
                    <div style={S.sectionTitle}>📝 {lang==='ar'?'معلومات العائلة':'Family Info'}</div>

                    {/* Photo Upload */}
                    <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px'}}>
                        <div style={{width:'56px', height:'56px', borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.08)', border:`2px solid ${fLvl?.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px'}}>
                            {family.photoURL ? <img src={family.photoURL} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : (family.emblem || '🏠')}
                        </div>
                        <div style={{flex:1}}>
                            <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'4px'}}>🖼️ {lang==='ar'?'صورة العائلة':'Family Photo'}</div>
                            {canManage && (
                                <>
                                    <input type="file" ref={photoFileRef} style={{display:'none'}} accept="image/*" onChange={handlePhotoUpload} />
                                    <button onClick={()=>photoFileRef.current?.click()} disabled={uploadingPhoto} style={{...S.btn, padding:'6px 12px', fontSize:'11px', background:'rgba(0,242,255,0.1)', border:'1px solid rgba(0,242,255,0.25)', color:'#00f2ff'}}>
                                        {uploadingPhoto ? '⏳' : (lang==='ar'?'📷 رفع صورة':'📷 Upload Photo')}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div style={{marginBottom:'8px'}}>
                        <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'4px'}}>🏠 {lang==='ar'?'اسم العائلة':'Family Name'}</div>
                        {canManage
                            ? <input value={editName} onChange={e=>setEditName(e.target.value)} maxLength={30} style={S.input} />
                            : <div style={{...S.input, color:'#d1d5db', cursor:'default'}}>{family.name}</div>
                        }
                    </div>
                    <div style={{marginBottom:'10px'}}>
                        <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'4px'}}>📝 {lang==='ar'?'الوصف':'Description'}</div>
                        {canManage
                            ? <textarea value={editDesc} onChange={e=>setEditDesc(e.target.value)} maxLength={150} rows={2} style={{...S.input, resize:'none', lineHeight:1.5}} />
                            : <div style={{...S.input, color:'#d1d5db', cursor:'default', minHeight:'48px', lineHeight:1.5}}>{family.description || '—'}</div>
                        }
                    </div>
                    {/* Join mode */}
                    <div style={{marginBottom:'10px'}}>
                        <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'6px'}}>🚪 {lang==='ar'?'إعدادات الانضمام':'Join Settings'}</div>
                        <div style={{display:'flex', gap:'6px'}}>
                            {[['open', lang==='ar'?'🟢 مفتوح':'🟢 Open'], ['approval', lang==='ar'?'🔐 بموافقة':'🔐 Approval']].map(([mode, label]) => (
                                <button key={mode} onClick={()=>canManage&&setJoinMode(mode)} style={{flex:1, padding:'7px', borderRadius:'8px', border:`1px solid ${joinMode===mode?'rgba(0,242,255,0.4)':'rgba(255,255,255,0.1)'}`, background:joinMode===mode?'rgba(0,242,255,0.12)':'rgba(255,255,255,0.04)', color:joinMode===mode?'#00f2ff':'#6b7280', fontSize:'11px', fontWeight:joinMode===mode?800:500, cursor:canManage?'pointer':'default'}}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    {canManage && (
                        <button onClick={saveInfo} disabled={savingInfo} style={{...S.btn, width:'100%', padding:'9px', fontSize:'12px', background:'rgba(0,242,255,0.15)', border:'1px solid rgba(0,242,255,0.3)', color:'#00f2ff', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'}}>
                            {savingInfo ? '⏳' : `💾 ${lang==='ar'?'حفظ المعلومات':'Save Info'}`}
                        </button>
                    )}
                </div>

                {/* ── Sign Image Upload ── */}
                <div style={S.card}>
                    <div style={S.sectionTitle}>🏴 {lang==='ar'?'صورة الشارة':'Sign Image'}</div>
                    <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'10px'}}>
                        <div style={{width:'60px', height:'30px', borderRadius:'8px', overflow:'hidden', background: signData.bg, border:`1px solid ${signData.color}40`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                            {family.signImageURL
                                ? <img src={family.signImageURL} style={{width:'100%',height:'100%',objectFit:'contain'}} alt=""/>
                                : <span style={{fontSize:'16px'}}>{signData.defaultIcon}</span>
                            }
                        </div>
                        {canManage && (
                            <div style={{flex:1}}>
                                <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'4px'}}>{lang==='ar'?'صورة مخصصة للشارة (اختياري)':'Custom sign image (optional)'}</div>
                                <input type="file" ref={signImageFileRef} style={{display:'none'}} accept="image/*" onChange={handleSignImageUpload} />
                                <button onClick={()=>signImageFileRef.current?.click()} disabled={uploadingSign} style={{...S.btn, padding:'6px 12px', fontSize:'11px', background:`${signData.color}20`, border:`1px solid ${signData.color}40`, color:signData.color}}>
                                    {uploadingSign ? '⏳' : (lang==='ar'?'📷 رفع صورة الشارة':'📷 Upload Sign Image')}
                                </button>
                            </div>
                        )}
                        {!canManage && <div style={{flex:1, fontSize:'11px', color:'#6b7280'}}>{lang==='ar'?'صورة الشارة الحالية':'Current sign image'}</div>}
                    </div>
                    {canManage && family.signImageURL && (
                        <button onClick={async()=>{
                            try {
                                await familiesCollection.doc(family.id).update({ signImageURL: null });
                                for (const uid of (family.members||[])) {
                                    await usersCollection.doc(uid).update({ familySignImageURL: null }).catch(()=>{});
                                }
                                onNotification(lang==='ar'?'✅ تم حذف الصورة':'✅ Image removed');
                            } catch(e){}
                        }} style={{...S.btn, padding:'5px 12px', fontSize:'10px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171', width:'100%'}}>
                            🗑️ {lang==='ar'?'حذف صورة الشارة':'Remove Sign Image'}
                        </button>
                    )}
                </div>

                {/* ── Announcement ── */}
                <div style={S.card}>
                    <div style={S.sectionTitle}>📢 {lang==='ar'?'الإعلان':'Announcement'}</div>
                    {canManage ? (
                        <>
                            <textarea value={editAnnouncement} onChange={e=>setEditAnnouncement(e.target.value)} maxLength={300} rows={4}
                                style={{...S.input, resize:'none', lineHeight:1.6, fontSize:'12px'}}
                                placeholder={lang==='ar'?'اكتب إعلانك هنا...':'Write your announcement here...'} />
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'8px'}}>
                                <span style={{fontSize:'10px', color:'#4b5563'}}>{editAnnouncement.length}/300</span>
                                <button onClick={saveAnnouncement} disabled={savingAnn} style={{...S.btn, background:'rgba(0,242,255,0.12)', border:'1px solid rgba(0,242,255,0.3)', color:'#00f2ff', padding:'7px 16px', fontSize:'11px'}}>
                                    {savingAnn ? '⏳' : (lang==='ar'?'💾 حفظ':'💾 Save')}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{fontSize:'12px', color:'#d1d5db', lineHeight:1.6, minHeight:'40px'}}>
                            {family.announcement || <span style={{color:'#4b5563'}}>{lang==='ar'?'لا يوجد إعلان':'No announcement'}</span>}
                        </div>
                    )}
                </div>

                {/* ── Join Requests ── */}
                <div style={S.card}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
                        <div style={S.sectionTitle}>📩 {lang==='ar'?'طلبات الانضمام':'Join Requests'}</div>
                        {requests.length > 0 && <span style={{fontSize:'10px', padding:'2px 8px', borderRadius:'20px', background:'rgba(249,115,22,0.2)', border:'1px solid rgba(249,115,22,0.4)', color:'#fb923c', fontWeight:700}}>{requests.length}</span>}
                    </div>
                    {requests.length === 0 ? (
                        <div style={{textAlign:'center', padding:'16px', color:'#4b5563', fontSize:'11px'}}>{lang==='ar'?'لا طلبات معلّقة':'No pending requests'}</div>
                    ) : joinRequesterProfiles.map(p => (
                        <div key={p.id} style={{display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                            <div style={{width:'36px', height:'36px', borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.08)'}}>
                                {p.photoURL?<img src={p.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:'18px',display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>😎</span>}
                            </div>
                            <div style={{flex:1}}>
                                <div style={{fontSize:'12px', fontWeight:700, color:'#e2e8f0'}}>{p.displayName}</div>
                                <div style={{fontSize:'10px', color:'#6b7280'}}>🏆 {p.stats?.wins||0} &nbsp; ⭐ {p.charisma||0}</div>
                            </div>
                            {canManage ? (
                                <div style={{display:'flex', gap:'6px'}}>
                                    <button onClick={()=>handleJoinRequest(p.id, true)} style={{...S.btn, padding:'5px 10px', fontSize:'11px', background:'rgba(16,185,129,0.2)', border:'1px solid rgba(16,185,129,0.4)', color:'#10b981'}}>✓</button>
                                    <button onClick={()=>handleJoinRequest(p.id, false)} style={{...S.btn, padding:'5px 10px', fontSize:'11px', background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171'}}>✕</button>
                                </div>
                            ) : (
                                <span style={{fontSize:'10px', color:'#6b7280', fontStyle:'italic'}}>{lang==='ar'?'معلّق':'Pending'}</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* ── Kick Members (owner only) ── */}
                {myRole === 'owner' && (
                    <div style={S.card}>
                        <div style={S.sectionTitle}>⚡ {lang==='ar'?'طرد عضو':'Kick Member'}</div>
                        <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
                            {familyMembers.filter(m => m.id !== currentUID && m.id !== family.createdBy).map(m => (
                                <div key={m.id} style={{display:'flex', alignItems:'center', gap:'10px', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                                    <div style={{width:'30px', height:'30px', borderRadius:'50%', overflow:'hidden', background:'rgba(255,255,255,0.08)', flexShrink:0}}>
                                        {m.photoURL?<img src={m.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>😎</span>}
                                    </div>
                                    <div style={{flex:1, fontSize:'12px', fontWeight:600, color:'#d1d5db'}}>{m.displayName}</div>
                                    <FamilyRoleBadge role={getFamilyRole(family, m.id)} lang={lang} small />
                                    <button onClick={()=>kickMember(m.id)} style={{...S.btn, padding:'4px 10px', fontSize:'10px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171'}}>
                                        {lang==='ar'?'طرد':'Kick'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Leave Family — always at bottom ── */}
                <div style={{marginTop:'8px', paddingTop:'12px', borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                    <button
                        onClick={leaveFamily}
                        style={{...S.btn, width:'100%', padding:'12px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', color:'rgba(239,68,68,0.65)', fontSize:'12px', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'}}>
                        🚪 {lang==='ar'?'مغادرة العائلة':'Leave Family'}
                    </button>
                    <div style={{fontSize:'10px', color:'#4b5563', textAlign:'center', marginTop:'6px'}}>{lang==='ar'?'لا يمكن التراجع عن هذا القرار':'This action cannot be undone'}</div>
                </div>

                <div style={{height:'12px'}} />
            </div>
        );
    };

    // ─────────────────────────────────────────────
    // HOME / CREATE / JOIN VIEWS
    // ─────────────────────────────────────────────
    const renderHome = () => (
        <div style={{flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'12px'}}>
            <div style={{textAlign:'center', padding:'20px 0 10px'}}>
                <div style={{fontSize:'52px', marginBottom:'10px'}}>🏠</div>
                <div style={{fontSize:'17px', fontWeight:900, color:'white', marginBottom:'6px', fontStyle:'italic'}}>{lang==='ar'?'عالم العائلات':'Family World'}</div>
                <div style={{fontSize:'11px', color:'#6b7280'}}>{lang==='ar'?'أنشئ عائلتك أو انضم لعائلة وتنافس':'Create or join a family and compete'}</div>
            </div>

            {isLoggedIn ? (
                <>
                    <button onClick={()=>setView('create')} style={{padding:'16px', borderRadius:'14px', border:'1px solid rgba(0,242,255,0.25)', background:'linear-gradient(135deg,rgba(0,242,255,0.08),rgba(112,0,255,0.06))', color:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:'14px', textAlign:'left', width:'100%'}}>
                        <span style={{fontSize:'28px'}}>🏗️</span>
                        <div>
                            <div style={{fontSize:'14px', fontWeight:800, color:'#00f2ff', marginBottom:'2px'}}>{lang==='ar'?'إنشاء عائلة':'Create Family'}</div>
                            <div style={{fontSize:'10px', color:'#6b7280'}}>{lang==='ar'?`التكلفة: ${FAMILY_CREATE_COST} إنتل 🧠`:`Cost: ${FAMILY_CREATE_COST} Intel 🧠`}</div>
                        </div>
                        <div style={{marginLeft:'auto', fontSize:'18px', color:'#6b7280'}}>›</div>
                    </button>
                    <button onClick={()=>setView('join')} style={{padding:'16px', borderRadius:'14px', border:'1px solid rgba(167,139,250,0.25)', background:'linear-gradient(135deg,rgba(167,139,250,0.08),rgba(112,0,255,0.06))', color:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:'14px', textAlign:'left', width:'100%'}}>
                        <span style={{fontSize:'28px'}}>🔍</span>
                        <div>
                            <div style={{fontSize:'14px', fontWeight:800, color:'#a78bfa', marginBottom:'2px'}}>{lang==='ar'?'البحث عن عائلة':'Find a Family'}</div>
                            <div style={{fontSize:'10px', color:'#6b7280'}}>{lang==='ar'?'ابحث بالوسم أو الاسم':'Search by tag or name'}</div>
                        </div>
                        <div style={{marginLeft:'auto', fontSize:'18px', color:'#6b7280'}}>›</div>
                    </button>
                    <button onClick={()=>setShowRankingModal(true)} style={{padding:'14px 16px', borderRadius:'14px', border:'1px solid rgba(255,215,0,0.2)', background:'linear-gradient(135deg,rgba(255,215,0,0.06),rgba(255,140,0,0.04))', color:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:'14px', textAlign:'left', width:'100%'}}>
                        <span style={{fontSize:'28px'}}>🏆</span>
                        <div>
                            <div style={{fontSize:'13px', fontWeight:700, color:'#fbbf24', marginBottom:'2px'}}>{lang==='ar'?'ترتيب العائلات':'Family Rankings'}</div>
                            <div style={{fontSize:'10px', color:'#6b7280'}}>{lang==='ar'?'شاهد أقوى العائلات':'See the top families'}</div>
                        </div>
                        <div style={{marginLeft:'auto', fontSize:'18px', color:'#6b7280'}}>›</div>
                    </button>
                </>
            ) : (
                <div style={{textAlign:'center', padding:'24px', color:'#6b7280', fontSize:'13px'}}>
                    <div style={{fontSize:'32px', marginBottom:'8px'}}>🔐</div>
                    {lang==='ar'?'سجّل دخول للانضمام':'Login to join families'}
                </div>
            )}
        </div>
    );

    const renderCreate = () => (
        <div style={{flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'12px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px'}}>
                <button onClick={()=>setView('home')} style={{background:'none', border:'none', color:'#00f2ff', fontSize:'20px', cursor:'pointer', padding:'0 4px'}}>‹</button>
                <span style={{fontSize:'15px', fontWeight:800, color:'white'}}>🏗️ {lang==='ar'?'إنشاء عائلة':'Create Family'}</span>
            </div>
            {/* Emblem picker */}
            <div>
                <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'8px'}}>✨ {lang==='ar'?'شعار العائلة':'Family Emblem'}</div>
                <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
                    {FAMILY_EMBLEMS.map(e => (
                        <button key={e} onClick={()=>setFamilyEmblem(e)} style={{width:'38px', height:'38px', borderRadius:'10px', border:tribeEmblem===e?`2px solid #00f2ff`:'1px solid rgba(255,255,255,0.1)', background:tribeEmblem===e?'rgba(0,242,255,0.15)':'rgba(255,255,255,0.04)', fontSize:'22px', cursor:'pointer'}}>
                            {e}
                        </button>
                    ))}
                </div>
                <div style={{marginTop:'10px', display:'flex', alignItems:'center', gap:'10px', padding:'10px', borderRadius:'12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)'}}>
                    <div style={{width:'48px', height:'48px', borderRadius:'50%', border:`2px solid #00f2ff55`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px'}}>{tribeEmblem}</div>
                    <div>
                        <div style={{fontSize:'13px', fontWeight:800, color:'white', fontStyle:'italic'}}>{tribeName || (lang==='ar'?'اسم العائلة':'Family Name')}</div>
                        {tribeTag && <FamilySignBadge tag={tribeTag} color='#00f2ff' small />}
                    </div>
                </div>
            </div>
            <div>
                <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'6px'}}>🏠 {lang==='ar'?'اسم العائلة *':'Family Name *'}</div>
                <input value={tribeName} onChange={e=>setFamilyName(e.target.value)} maxLength={30} style={S.input} placeholder={lang==='ar'?'اسم مميز...':'Unique name...'} />
            </div>
            <div>
                <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'6px'}}>🏷️ {lang==='ar'?'وسم العائلة * (حروف وأرقام، حتى 6)':'Family Tag * (letters & numbers, max 6)'}</div>
                <input value={tribeTag} onChange={e=>setFamilyTag(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6))} maxLength={6} style={{...S.input, letterSpacing:'3px', fontWeight:800, color:'#00f2ff', fontSize:'15px', border:'1px solid rgba(0,242,255,0.3)'}} placeholder='MYTAG' />
                <div style={{fontSize:'10px', color:'#4b5563', marginTop:'4px'}}>{lang==='ar'?'مثال: CALM أو PRO1':'Example: CALM or PRO1'}</div>
            </div>
            <div>
                <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'6px'}}>📝 {lang==='ar'?'الوصف (اختياري)':'Description (optional)'}</div>
                <textarea value={tribeDesc} onChange={e=>setFamilyDesc(e.target.value)} maxLength={150} rows={3} style={{...S.input, resize:'none', lineHeight:1.5}} placeholder={lang==='ar'?'صف عائلتك...':'Describe your family...'} />
            </div>
            <div style={{padding:'10px 12px', borderRadius:'10px', background:'rgba(255,215,0,0.07)', border:'1px solid rgba(255,215,0,0.2)', fontSize:'11px', color:'#fbbf24'}}>
                💡 {lang==='ar' ? `سيُخصم ${FAMILY_CREATE_COST} إنتل (رصيدك: ${currentUserData?.currency||0} 🧠)` : `${FAMILY_CREATE_COST} Intel will be deducted (Balance: ${currentUserData?.currency||0} 🧠)`}
            </div>
            <button onClick={createFamily} disabled={!tribeName.trim()||!tribeTag.trim()||creating} style={{...S.btn, width:'100%', padding:'13px', fontSize:'13px', background:tribeName.trim()&&tribeTag.trim()&&!creating?'linear-gradient(135deg,#00f2ff,#7000ff)':'rgba(255,255,255,0.06)', color:tribeName.trim()&&tribeTag.trim()?'white':'#4b5563', cursor:tribeName.trim()&&tribeTag.trim()&&!creating?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
                {creating?'⏳🏗️':`🏠 ${lang==='ar'?'إنشاء العائلة':'Create Family'}`}
            </button>
        </div>
    );

    const renderJoin = () => (
        <div style={{flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'12px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px'}}>
                <button onClick={()=>{setView('home');setJoinResults([]);setJoinSearch('');}} style={{background:'none', border:'none', color:'#a78bfa', fontSize:'20px', cursor:'pointer', padding:'0 4px'}}>‹</button>
                <span style={{fontSize:'15px', fontWeight:800, color:'white'}}>🔍 {lang==='ar'?'البحث عن عائلة':'Find Family'}</span>
            </div>
            <div style={{display:'flex', gap:'8px'}}>
                <input value={joinSearch} onChange={e=>setJoinSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchFamilies()} style={S.input} placeholder={lang==='ar'?'ابحث بالوسم أو الاسم...':'Search by tag or name...'} />
                <button onClick={searchFamilies} disabled={searching||!joinSearch.trim()} style={{...S.btn, flexShrink:0, padding:'10px 16px', background:joinSearch.trim()?'linear-gradient(135deg,#a78bfa,#7000ff)':'rgba(255,255,255,0.06)', color:joinSearch.trim()?'white':'#4b5563'}}>
                    {searching?'⏳':'🔍'}
                </button>
            </div>
            {joinResults.map(fam => {
                const fl = getFamilyLevel(fam.xp || 0);
                const fs = getFamilySignLevelData(fam.activeness || 0);
                const isFull = (fam.members?.length||0) >= fl.maxMembers;
                const isAlreadyIn = fam.members?.includes(currentUID);
                const needsApproval = fam.joinMode === 'approval';
                const alreadyRequested = fam.joinRequests?.includes(currentUID);
                return (
                    <div key={fam.id} style={{...S.card, display:'flex', alignItems:'center', gap:'12px', border:`1px solid ${fl.color}22`}}>
                        <div style={{width:'48px', height:'48px', borderRadius:'14px', background:`${fl.color}15`, border:`1px solid ${fl.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px', flexShrink:0, overflow:'hidden'}}>
                            {fam.photoURL ? <img src={fam.photoURL} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'12px'}} alt=""/> : (fam.emblem||'🏠')}
                        </div>
                        <div style={{flex:1, minWidth:0}}>
                            <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'3px', flexWrap:'wrap'}}>
                                <span style={{fontSize:'14px', fontWeight:800, color:'white', fontStyle:'italic'}}>{fam.name}</span>
                                <FamilySignBadge tag={fam.tag} color={fs.color} small signLevel={fs.level} />
                            </div>
                            <div style={{fontSize:'10px', color:'#6b7280', display:'flex', gap:'8px', flexWrap:'wrap'}}>
                                <span style={{color:fl.color, fontWeight:700}}>{fl.icon} Lv.{fl.level}</span>
                                <span>👥 {fam.members?.length||0}/{fl.maxMembers}</span>
                                {needsApproval && <span style={{color:'#fbbf24'}}>🔐</span>}
                            </div>
                            {fam.description&&<div style={{fontSize:'10px', color:'#4b5563', marginTop:'3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{fam.description}</div>}
                        </div>
                        <button
                            onClick={()=>!isAlreadyIn&&!isFull&&!alreadyRequested&&joinFamily(fam.id)}
                            disabled={isFull||joining||isAlreadyIn||alreadyRequested}
                            style={{...S.btn, padding:'7px 12px', fontSize:'11px', flexShrink:0,
                                background:isAlreadyIn?'rgba(16,185,129,0.15)':alreadyRequested?'rgba(251,191,36,0.15)':isFull?'rgba(239,68,68,0.1)':'rgba(0,242,255,0.15)',
                                border:`1px solid ${isAlreadyIn?'rgba(16,185,129,0.4)':alreadyRequested?'rgba(251,191,36,0.4)':isFull?'rgba(239,68,68,0.3)':'rgba(0,242,255,0.35)'}`,
                                color:isAlreadyIn?'#10b981':alreadyRequested?'#fbbf24':isFull?'#f87171':'#00f2ff'}}>
                            {isAlreadyIn?(lang==='ar'?'عضو':'Joined'):alreadyRequested?(lang==='ar'?'مرسل':'Sent'):isFull?(lang==='ar'?'ممتلئ':'Full'):(joining?'⏳':(needsApproval?(lang==='ar'?'طلب':'Request'):(lang==='ar'?'انضم':'Join')))}
                        </button>
                    </div>
                );
            })}
            {joinResults.length===0&&joinSearch&&!searching&&<div style={{textAlign:'center', padding:'24px', color:'#4b5563', fontSize:'12px'}}>{lang==='ar'?'لا توجد نتائج':'No results found'}</div>}
        </div>
    );

    // ─────────────────────────────────────────────
    // MAIN RENDER
    // ─────────────────────────────────────────────
    return (
        <>
        <PortalModal>
            <div className="modal-overlay" onClick={onClose} style={{zIndex: Z.MODAL_HIGH}}>
                <div style={S.modal} onClick={e => e.stopPropagation()}>

                    {/* ── Top Header ── */}
                    <div style={S.header}>
                        {family ? (
                            <div style={{display:'flex', alignItems:'center', gap:'10px', flex:1, minWidth:0}}>
                                <div style={{width:'34px', height:'34px', borderRadius:'50%', border:`2px solid ${fLvl?.color}55`, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0}}>
                                    {family.photoURL ? <img src={family.photoURL} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : (family.emblem||'🏠')}
                                </div>
                                <div style={{flex:1, minWidth:0}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap'}}>
                                        <span style={{fontSize:'14px', fontWeight:900, color:'white', fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'120px'}}>{family.name}</span>
                                        <FamilySignBadge tag={family.tag} color={signData.color} small signLevel={signData.level} imageURL={family.signImageURL} />
                                    </div>
                                    <div style={{fontSize:'9px', color:'#6b7280', display:'flex', alignItems:'center', gap:'6px'}}>
                                        <span>{fLvl?.icon} {lang==='ar'?`المستوى ${fLvl?.level}`:`Lv.${fLvl?.level}`}</span>
                                        <span>·</span>
                                        <span>👥 {family.members?.length||0} {lang==='ar'?'عضو':'members'}</span>
                                        <FamilyRoleBadge role={myRole||'member'} lang={lang} small />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{display:'flex', alignItems:'center', gap:'8px', flex:1}}>
                                <span style={{fontSize:'20px'}}>🏠</span>
                                <span style={{fontSize:'15px', fontWeight:800, color:'white'}}>{lang==='ar'?'العائلة':'Family'}</span>
                            </div>
                        )}

                        <div style={{display:'flex', alignItems:'center', gap:'6px', flexShrink:0}}>
                            {/* Close */}
                            <button onClick={onClose} style={{width:'30px', height:'30px', borderRadius:'8px', border:'none', background:'rgba(255,255,255,0.08)', color:'#9ca3af', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>✕</button>
                        </div>
                    </div>

                    {/* ── Tab Bar (only in family) ── */}
                    {family && (
                        <div style={S.tabBar}>
                            {TABS.map(tab => (
                                <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
                                    flex:1, padding:'10px 4px 8px', fontSize:'10px', fontWeight:activeTab===tab.id?800:500,
                                    color:activeTab===tab.id?'#00f2ff':'#6b7280', background:'transparent', border:'none',
                                    borderBottom:`2px solid ${activeTab===tab.id?'#00f2ff':'transparent'}`,
                                    cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.2s',
                                    minWidth:'50px', position:'relative',
                                }}>
                                    <div style={{fontSize:'14px', marginBottom:'1px'}}>{tab.icon}</div>
                                    <div>{lang==='ar'?tab.label_ar:tab.label_en}</div>
                                    {tab.id==='manage'&&(family?.joinRequests?.length>0)&&<span style={{position:'absolute', top:'4px', right:'6px', fontSize:'8px', background:'#f97316', color:'white', borderRadius:'50%', width:'14px', height:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900}}>{family.joinRequests.length}</span>}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ── Body ── */}
                    <div style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0}}>
                        {loadingFamily ? (
                            <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#6b7280'}}>⏳</div>
                        ) : !family ? (
                            view==='home' ? renderHome() : view==='create' ? renderCreate() : renderJoin()
                        ) : (
                            <>
                                {activeTab==='profile'  && renderProfile()}
                                {activeTab==='members'  && renderMembers()}
                                {activeTab==='tasks'    && renderTasks()}
                                {activeTab==='shop'     && renderShop()}
                                {activeTab==='ranking'  && renderRankingTab()}
                                {activeTab==='news'     && renderNews()}
                                {activeTab==='manage'   && renderManage()}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </PortalModal>
        </>
    );
};
