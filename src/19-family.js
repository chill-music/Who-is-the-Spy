// ════════════════════════════════════════════════════════
// 📸 FRIENDS MOMENTS MODAL
// 🏠 FAMILY SYSTEM — Complete Clan/Family System V2
// File: 19-family.js
// ════════════════════════════════════════════════════════
// familiesCollection — defined in 01-config.js

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

// ════ FAMILY SIGN LEVELS — Based on Weekly Activeness ════
// These thresholds mirror FAMILY_SIGN_IMAGES in 01-config.js
const FAMILY_SIGN_LEVELS = [
    { level:1, threshold:1000,   name_ar:'ساين المستوى 1',  name_en:'Sign Level 1',  color:'#6b7280', glow:'rgba(107,114,128,0.3)', defaultIcon:'🏠', bg:'rgba(107,114,128,0.15)' },
    { level:2, threshold:10000,  name_ar:'ساين المستوى 2',  name_en:'Sign Level 2',  color:'#22d3ee', glow:'rgba(34,211,238,0.4)',  defaultIcon:'⚔️', bg:'rgba(34,211,238,0.15)' },
    { level:3, threshold:30000,  name_ar:'ساين المستوى 3',  name_en:'Sign Level 3',  color:'#fbbf24', glow:'rgba(251,191,36,0.4)',  defaultIcon:'🛡️', bg:'rgba(251,191,36,0.15)' },
    { level:4, threshold:100000, name_ar:'ساين المستوى 4',  name_en:'Sign Level 4',  color:'#f97316', glow:'rgba(249,115,22,0.55)', defaultIcon:'👑', bg:'rgba(249,115,22,0.15)',  hasGlow:true },
    { level:5, threshold:300000, name_ar:'ساين المستوى 5',  name_en:'Sign Level 5',  color:'#ef4444', glow:'rgba(239,68,68,0.65)',  defaultIcon:'🌟', bg:'rgba(239,68,68,0.15)',   hasGlow:true },
];

// Get sign image URL from config (FAMILY_SIGN_IMAGES defined in 01-config.js)
const getFamilySignImage = (level) => {
    if (typeof FAMILY_SIGN_IMAGES === 'undefined') return null;
    const cfg = FAMILY_SIGN_IMAGES.find(s => s.level === level);
    return cfg?.imageURL || null;
};

// Use WEEKLY activeness to determine sign level
const getFamilySignLevelData = (weeklyActiveness = 0) => {
    let cfg = null; // start with no sign
    for (let i = FAMILY_SIGN_LEVELS.length - 1; i >= 0; i--) {
        if (weeklyActiveness >= FAMILY_SIGN_LEVELS[i].threshold) { cfg = FAMILY_SIGN_LEVELS[i]; break; }
    }
    if (!cfg) return null; // no sign earned yet
    return { ...cfg, imageURL: getFamilySignImage(cfg.level) };
};
const getFamilySignProgress = (weeklyActiveness = 0) => {
    const cur = getFamilySignLevelData(weeklyActiveness);
    if (!cur) {
        const first = FAMILY_SIGN_LEVELS[0];
        return Math.min(99, Math.round((weeklyActiveness / first.threshold) * 100));
    }
    const next = FAMILY_SIGN_LEVELS.find(s => s.level === cur.level + 1);
    if (!next) return 100;
    return Math.min(100, Math.round(((weeklyActiveness - cur.threshold) / (next.threshold - cur.threshold)) * 100));
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

// Enhanced FamilySignBadge — image with tag overlaid, matches ProfileFamilySignBadge
const FamilySignBadge = ({ tag, color = '#7000ff', small = false, imageURL = null, signLevel = 1 }) => {
    const imgSrc = imageURL || (typeof getFamilySignImage === 'function' ? getFamilySignImage(signLevel) : null);
    // استخدم hasGlow من بيانات المستوى نفسه
    const signLevelData = typeof FAMILY_SIGN_LEVELS !== 'undefined'
        ? FAMILY_SIGN_LEVELS.find(s => s.level === signLevel)
        : null;
    const hasGlow = signLevelData?.hasGlow || signLevel >= 4;
    const glowColor = signLevelData?.glow || `${color}88`;
    const displayTag = tag || 'FAM';

    // لو في صورة: تظهر مع التاج مكتوب فوقها
    if (imgSrc) {
        const imgW = small
            ? 28 + (displayTag.length * 4)   // small: 3→40  4→44  5→48
            : 44 + (displayTag.length * 6);   // normal: 3→62 4→68  5→74
        const imgH = Math.round(imgW * 0.55);
        const fontSize = small
            ? (displayTag.length <= 3 ? 8 : displayTag.length === 4 ? 7 : 6)
            : (displayTag.length <= 3 ? 11 : displayTag.length === 4 ? 10 : 9);

        return (
            <span style={{
                position:'relative',
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                flexShrink:0,
                width:`${imgW}px`, height:`${imgH}px`,
                filter: hasGlow
                    ? `drop-shadow(0 0 6px ${color}dd) drop-shadow(0 0 14px ${color}88) drop-shadow(0 0 22px ${color}44)`
                    : 'none',
                transition:'all 0.2s',
            }}>
                {/* الصورة الخلفية */}
                <img
                    src={imgSrc}
                    alt=""
                    style={{
                        position:'absolute', inset:0,
                        width:'100%', height:'100%',
                        objectFit:'contain',
                        display:'block',
                    }}
                />
                {/* التاج فوق الصورة */}
                <span style={{
                    position:'relative', zIndex:1,
                    fontSize:`${fontSize}px`,
                    fontWeight:900,
                    fontStyle:'italic',
                    letterSpacing:'1.5px',
                    color:'#fff',
                    marginTop:'2px',
                    textShadow:`
                        0 0 6px rgba(0,0,0,0.9),
                        0 0 12px rgba(0,0,0,0.7),
                        1px 1px 0 rgba(0,0,0,0.8),
                        -1px -1px 0 rgba(0,0,0,0.8),
                        1px -1px 0 rgba(0,0,0,0.8),
                        -1px 1px 0 rgba(0,0,0,0.8),
                        0 0 16px ${color}cc
                    `,
                    userSelect:'none',
                    lineHeight:1,
                }}>
                    {displayTag}
                </span>
            </span>
        );
    }

    // لو ما في صورة: badge نصي عادي
    return (
        <span style={{
            display:'inline-flex', alignItems:'center', gap:'3px',
            padding: small ? '1px 5px' : '2px 8px',
            borderRadius:'5px', fontSize: small ? '8px' : '10px',
            fontWeight:800, fontStyle:'italic',
            background:`${color}20`, border:`1px solid ${color}55`,
            color:color, letterSpacing:'0.5px', whiteSpace:'nowrap', flexShrink:0,
            boxShadow: hasGlow ? `0 0 10px ${color}55, 0 0 20px ${color}33` : 'none',
        }}>
            {displayTag}
        </span>
    );
};

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
    const [showBell, setShowBell] = useState(false);
    const [bellNotifs, setBellNotifs] = useState([]);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [createText, setCreateText] = useState('');
    const [createImage, setCreateImage] = useState(null);
    const [createImageFile, setCreateImageFile] = useState(null);
    const [creating, setCreating] = useState(false);
    const fileRef = useRef(null);

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

    // Load bell notifications (moment likes/comments for current user)
    useEffect(() => {
        if (!show || !currentUID || !showBell) return;
        notificationsCollection
            .where('recipientUID', '==', currentUID)
            .where('type', 'in', ['moment_like', 'moment_comment'])
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get()
            .then(snap => setBellNotifs(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
            .catch(() => {});
    }, [show, currentUID, showBell]);

    const handleCreateMoment = async () => {
        if (creating || (!createText.trim() && !createImageFile)) return;
        setCreating(true);
        try {
            let mediaUrl = null;
            if (createImageFile) {
                const ref = firebase.storage().ref(`moments/${currentUID}/${Date.now()}_${createImageFile.name}`);
                await ref.put(createImageFile);
                mediaUrl = await ref.getDownloadURL();
            }
            await momentsCollection.add({
                authorUID: currentUID,
                authorName: currentUserData?.displayName || 'User',
                authorPhoto: currentUserData?.photoURL || null,
                type: mediaUrl ? 'image' : 'text',
                content: createText.trim(),
                mediaUrl: mediaUrl || null,
                likes: [],
                comments: [],
                createdAt: TS(),
            });
            setCreateText(''); setCreateImage(null); setCreateImageFile(null); setShowCreatePost(false);
        } catch(e) {}
        setCreating(false);
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
                        <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                            {/* Bell — moment notifications */}
                            {currentUID && (
                                <div style={{position:'relative'}}>
                                    <button onClick={() => setShowBell(v => !v)}
                                        style={{width:'30px', height:'30px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background: showBell ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)', color: bellNotifs.some(n=>!n.read) ? '#fbbf24' : '#6b7280', fontSize:'15px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}
                                    >🔔</button>
                                    {bellNotifs.some(n => !n.read) && (
                                        <div style={{position:'absolute', top:'-3px', right:'-3px', width:'8px', height:'8px', borderRadius:'50%', background:'#ef4444', border:'1.5px solid #0f0f1e'}} />
                                    )}
                                </div>
                            )}
                            {/* Camera — add moment */}
                            {currentUID && currentUser && !currentUser.isGuest && (
                                <button onClick={() => setShowCreatePost(v => !v)}
                                    style={{width:'30px', height:'30px', borderRadius:'8px', border:'1px solid rgba(0,242,255,0.3)', background: showCreatePost ? 'rgba(0,242,255,0.15)' : 'rgba(0,242,255,0.07)', color:'#00f2ff', fontSize:'15px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}
                                >📷</button>
                            )}
                            {/* Hidden file input */}
                            <input type="file" ref={fileRef} accept="image/*" style={{display:'none'}} onChange={e => {
                                const f = e.target.files[0];
                                if (!f) return;
                                setCreateImageFile(f);
                                setCreateImage(URL.createObjectURL(f));
                            }} />
                            <button onClick={onClose} style={{background:'rgba(255,255,255,0.07)',border:'none',borderRadius:'8px',color:'#9ca3af',fontSize:'16px',width:'30px',height:'30px',cursor:'pointer'}}>✕</button>
                        </div>
                    </div>

                    {/* Bell dropdown */}
                    {showBell && (
                        <div style={{padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(0,0,0,0.35)', maxHeight:'180px', overflowY:'auto'}}>
                            <div style={{fontSize:'10px', fontWeight:800, color:'#fbbf24', marginBottom:'6px'}}>🔔 {lang==='ar'?'إشعارات اللحظات':'Moments Alerts'}</div>
                            {bellNotifs.length === 0
                                ? <div style={{fontSize:'10px', color:'#4b5563', textAlign:'center', padding:'6px 0'}}>{lang==='ar'?'لا إشعارات':'No alerts yet'}</div>
                                : bellNotifs.map(n => (
                                    <div key={n.id} style={{display:'flex', alignItems:'center', gap:'7px', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                                        {n.senderPhoto
                                            ? <img src={n.senderPhoto} alt="" style={{width:'22px', height:'22px', borderRadius:'50%', objectFit:'cover'}} />
                                            : <div style={{width:'22px', height:'22px', borderRadius:'50%', background:'#374151', fontSize:'9px', display:'flex', alignItems:'center', justifyContent:'center'}}>👤</div>
                                        }
                                        <div style={{flex:1, fontSize:'10px', color:n.read?'#6b7280':'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                                            <span style={{fontWeight:700, color:'#00f2ff'}}>{n.senderName}</span>
                                            {' '}{n.type==='moment_like'?(lang==='ar'?'أعجب بلحظتك':'liked your moment'):(lang==='ar'?'علّق على لحظتك':'commented on your moment')}
                                        </div>
                                        {!n.read && <div style={{width:'6px', height:'6px', borderRadius:'50%', background:'#ef4444', flexShrink:0}} />}
                                    </div>
                                ))
                            }
                        </div>
                    )}

                    {/* Create moment panel */}
                    {showCreatePost && currentUID && (
                        <div style={{padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(0,242,255,0.04)'}}>
                            <div style={{fontSize:'11px', fontWeight:700, color:'#00f2ff', marginBottom:'8px'}}>
                                {lang==='ar'?'📷 أضف لحظة جديدة':'📷 Add a New Moment'}
                            </div>
                            {createImage && (
                                <div style={{marginBottom:'8px', position:'relative', display:'inline-block'}}>
                                    <img src={createImage} alt="" style={{height:'80px', borderRadius:'8px', objectFit:'cover'}} />
                                    <button onClick={() => { setCreateImage(null); setCreateImageFile(null); }}
                                        style={{position:'absolute', top:'-4px', right:'-4px', width:'18px', height:'18px', borderRadius:'50%', background:'#ef4444', color:'white', border:'none', fontSize:'10px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>✕</button>
                                </div>
                            )}
                            <div style={{display:'flex', gap:'6px'}}>
                                <input value={createText} onChange={e => setCreateText(e.target.value)}
                                    placeholder={lang==='ar'?'اكتب شيئاً...':'Write something...'}
                                    style={{flex:1, padding:'7px 10px', borderRadius:'8px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'white', fontSize:'12px', outline:'none', direction:lang==='ar'?'rtl':'ltr'}}
                                />
                                <button onClick={() => fileRef.current?.click()} style={{width:'32px', height:'32px', borderRadius:'8px', border:'1px solid rgba(0,242,255,0.3)', background:'rgba(0,242,255,0.08)', color:'#00f2ff', fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>🖼️</button>
                                <button onClick={handleCreateMoment} disabled={creating || (!createText.trim() && !createImageFile)}
                                    style={{width:'32px', height:'32px', borderRadius:'8px', border:'none', background: creating||(!createText.trim()&&!createImageFile)?'rgba(255,255,255,0.07)':'linear-gradient(135deg,#7000ff,#00f2ff)', color:'white', fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                    {creating ? '⏳' : '➤'}
                                </button>
                            </div>
                        </div>
                    )}
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
// 💬 FAMILY CHAT MODAL — Standalone chat accessible from Chat tab
// ════════════════════════════════════════════════════════
const CHAT_EMOJIS_FAM = ['😀','😂','❤️','👍','🔥','⭐','💎','🎁','🎉','😎','🤩','💪','✨','🙏','😊','👑','💖','🥳','🏆','🎯','😍','🤣','😭','😱','🫡','💯','🌹','🎮','🕵️','🏅'];

const FamilyChatModal = ({ show, onClose, familyId, familyData, currentUID, currentUserData, lang, onOpenFamily, onSendGift, userData, onNotification, onOpenProfile }) => {
    const [messages, setMessages] = React.useState([]);
    const [chatInput, setChatInput] = React.useState('');
    const [sendingMsg, setSendingMsg] = React.useState(false);
    const [showEmoji, setShowEmoji] = React.useState(false);
    const [prevMsgCount, setPrevMsgCount] = React.useState(0);
    const chatEndRef = React.useRef(null);
    const imgInputRef = React.useRef(null);
    const chatInputRef = React.useRef(null);
    // ── Gift modal ──
    const [giftTarget, setGiftTarget] = React.useState(null); // null = self, { uid, displayName, photoURL }
    const [showChatGiftModal, setShowChatGiftModal] = React.useState(false);
    const [showFamRPModal, setShowFamRPModal] = React.useState(false);
    const [sendingFamRP, setSendingFamRP] = React.useState(false);
    // ── Mini profile popup ──
    const [miniProfile, setMiniProfile] = React.useState(null);
    // ── @ Mention ──
    const [mentionSearch, setMentionSearch] = React.useState('');
    const [showMentionList, setShowMentionList] = React.useState(false);
    const [familyMembers, setFamilyMembers] = React.useState([]);

    // ── فتح ميني بروفايل في شات القبيلة ──
    const openFamilyChatMiniProfile = async function(uid, basicData) {
        if (!uid) return;
        setMiniProfile({ uid, name: (basicData && basicData.name) || '...', photo: (basicData && basicData.photo) || null, loading: true });
        const data = await fetchMiniProfileData(uid, (userData && userData.friends) || []);
        if (data) setMiniProfile(data);
    };

    // جلب أعضاء العائلة للمنشن
    React.useEffect(() => {
        if (!show || !familyId) return;
        const unsub = familiesCollection.doc(familyId).onSnapshot(snap => {
            if (!snap.exists) return;
            const memberIds = snap.data().members || [];
            if (memberIds.length === 0) return;
            // جلب بيانات الأعضاء
            usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', memberIds.slice(0,10))
                .get().then(s => setFamilyMembers(s.docs.map(d => ({ id: d.id, ...d.data() }))))
                .catch(() => {});
        }, () => {});
        return () => unsub();
    }, [show, familyId]);

    React.useEffect(() => {
        if (!show || !familyId) return;
        const unsub = familiesCollection.doc(familyId).collection('messages')
            .orderBy('timestamp', 'desc').limit(80)
            .onSnapshot(snap => {
                const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
                // صوت + نوتيفيكيشن لما تيجي رسالة جديدة
                if (prevMsgCount > 0 && msgs.length > prevMsgCount) {
                    const newest = msgs[msgs.length - 1];
                    if (newest && newest.senderId !== currentUID) {
                        try { playNotificationSound(); } catch(e) {}
                        if (onNotification) {
                            const senderName = newest.senderName || (lang==='ar'?'عضو':'Member');
                            const preview = newest.type === 'image' ? '📷' : (newest.text || '').slice(0, 40);
                            onNotification(`💬 ${senderName}: ${preview}`);
                        }
                    }
                }
                setPrevMsgCount(msgs.length);
                setMessages(msgs);
            }, () => {});
        return () => unsub();
    }, [show, familyId, prevMsgCount, currentUID]);

    React.useEffect(() => {
        if (show) setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 120);
    }, [messages.length, show]);

    var canManageFamilyChat = familyData ? canManageFamily(familyData, currentUID) : false;

    // ── معالجة @ Mention ──
    const handleInputChange = function(e) {
        const val = e.target.value;
        setChatInput(val);
        const lastAt = val.lastIndexOf('@');
        if (lastAt !== -1) {
            const after = val.slice(lastAt + 1);
            if (!after.includes(' ')) {
                setMentionSearch(after.toLowerCase());
                setShowMentionList(true);
                return;
            }
        }
        setShowMentionList(false);
    };

    const selectMention = function(member) {
        const lastAt = chatInput.lastIndexOf('@');
        const newVal = chatInput.slice(0, lastAt) + '@' + member.displayName + ' ';
        setChatInput(newVal);
        setShowMentionList(false);
        setTimeout(function() { chatInputRef.current && chatInputRef.current.focus(); }, 50);
    };

    const selfMember = currentUserData ? [{ id: currentUID, displayName: currentUserData.displayName, photoURL: currentUserData.photoURL }] : [];
    const mentionMembers = [...selfMember, ...familyMembers.filter(function(m) { return m.id !== currentUID; })]
        .filter(function(m) { return !mentionSearch || (m.displayName || '').toLowerCase().includes(mentionSearch); });

    const sendMessage = async (text, type, extra) => {
        type = type || 'text';
        extra = extra || {};
        if ((!text || !text.trim()) && type === 'text') return;
        if (!familyId || !currentUID || sendingMsg) return;
        setSendingMsg(true);
        setShowMentionList(false);
        try {
            var msgText = (text || '').trim();
            var isAnnouncementCmd = canManageFamilyChat && type === 'text' && msgText.toLowerCase().startsWith('announcement ');
            var finalType = isAnnouncementCmd ? 'announcement' : type;
            var finalText = isAnnouncementCmd ? msgText.slice('announcement '.length).trim() : msgText;
            if (isAnnouncementCmd && finalText) {
                await familiesCollection.doc(familyId).update({
                    announcement: finalText,
                    announcementBy: currentUserData?.displayName || 'Admin',
                }).catch(function() {});
            }
            await familiesCollection.doc(familyId).collection('messages').add({
                senderId: currentUID,
                senderName: currentUserData?.displayName || 'Member',
                senderPhoto: currentUserData?.photoURL || null,
                text: finalText,
                type: finalType,
                timestamp: TS(),
                ...extra,
            });
            if (type === 'text') setChatInput('');
            await familiesCollection.doc(familyId).update({
                lastChatMessage: finalText || (type === 'image' ? '📷' : ''),
                lastChatSenderId: currentUID,
                lastChatAt: TS(),
                lastChatAtMs: Date.now(),
                ['chatReadBy.' + currentUID]: TS(),
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

    // ── render mention text with highlight + click handler ──
    const renderMsgText = function(text) {
        if (!text) return '';
        const parts = text.split(/(@\w[\w\s]*?)(?=\s|$)/g);
        return parts.map(function(part, i) {
            if (part.startsWith('@')) {
                const mentionName = part.slice(1).trim().toLowerCase();
                return React.createElement('span', {
                    key: i,
                    style: { color: '#00f2ff', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline dotted rgba(0,242,255,0.4)' },
                    onClick: function(e) {
                        e.stopPropagation();
                        const allMbrs = [...familyMembers];
                        if (currentUserData) allMbrs.push({ id: currentUID, displayName: currentUserData.displayName, photoURL: currentUserData.photoURL });
                        const found = allMbrs.find(function(m) { return (m.displayName || '').toLowerCase() === mentionName; });
                        if (found) openFamilyChatMiniProfile(found.id, { name: found.displayName, photo: found.photoURL });
                    }
                }, part);
            }
            return part;
        });
    };

    if (!show) return null;

    var signData = (familyData ? getFamilySignLevelData(familyData.weeklyActiveness || 0) : null) || { level:0, color:'#4b5563', glow:'rgba(75,85,99,0.3)', defaultIcon:'🏠' };
    var fLvl = familyData ? getFamilyLevel(familyData.xp || 0) : null;

    return React.createElement(PortalModal, null,
        React.createElement('div', {
            style: { position:'fixed', inset:0, zIndex: Z.MODAL, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', padding:'12px' },
            onClick: onClose  // ✅ Fix 7: close on outside click
        },
        React.createElement('div', {
            style: { position:'relative', display:'flex', flexDirection:'column', width:'100%', maxWidth:'480px', height:'min(88vh, 700px)', minHeight:'400px', background:'linear-gradient(180deg,#0d0d1f 0%,#08080f 100%)', border:'1px solid rgba(0,242,255,0.15)', borderRadius:'20px', overflow:'hidden', boxShadow:'0 28px 70px rgba(0,0,0,0.95)' },
            onClick: function(e) { e.stopPropagation(); }
        },
            // Header
            React.createElement('div', {
                style: { display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', background:'rgba(0,0,0,0.4)', flexShrink:0 }
            },
                React.createElement('button', { onClick: onClose, style: { background:'none', border:'none', color:'#00f2ff', fontSize:'20px', cursor:'pointer', padding:'0 4px' } }, '‹'),
                React.createElement('div', {
                    onClick: function() { onOpenFamily && onOpenFamily(); },
                    style: { width:'40px', height:'40px', borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'linear-gradient(135deg,' + signData.color + '22,rgba(0,0,0,0.3))', border:'2px solid ' + signData.color + '55', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', cursor: onOpenFamily ? 'pointer' : 'default' }
                }, familyData && familyData.photoURL ? React.createElement('img', { src: familyData.photoURL, alt:'', style:{width:'100%',height:'100%',objectFit:'cover'}}) : (familyData && familyData.emblem) || '🏠'),
                React.createElement('div', {
                    onClick: function() { onOpenFamily && onOpenFamily(); },
                    style: { flex:1, minWidth:0, cursor: onOpenFamily ? 'pointer' : 'default' }
                },
                    React.createElement('div', { style: { display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' } },
                        React.createElement('span', { style: { fontSize:'14px', fontWeight:800, color: onOpenFamily ? '#00f2ff' : 'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textDecoration: onOpenFamily ? 'underline dotted rgba(0,242,255,0.4)' : 'none' } }, (familyData && familyData.name) || (lang==='ar'?'شات العائلة':'Family Chat')),
                        familyData && signData.level > 0 && React.createElement(FamilySignBadge, { tag: familyData.tag, color: signData.color, small: true, signLevel: signData.level, imageURL: familyData.signImageURL })
                    ),
                    React.createElement('div', { style: { fontSize:'10px', color:'#6b7280' } },
                        ((familyData && familyData.members && familyData.members.length) || 0) + ' ' + (lang==='ar'?'عضو':'members'),
                        fLvl && React.createElement('span', { style: { color: fLvl.color, marginLeft:'4px' } }, fLvl.icon + ' Lv.' + fLvl.level)
                    )
                )
            ),
            // Pinned Announcement Bar
            familyData && familyData.announcement && React.createElement('div', {
                style: { flexShrink:0, margin:'8px 10px 4px', padding:'9px 14px', borderRadius:'12px', background:'linear-gradient(135deg,rgba(255,165,0,0.18),rgba(255,80,0,0.12))', border:'1px solid rgba(255,165,0,0.45)', boxShadow:'0 0 16px rgba(255,140,0,0.2)', position:'relative', overflow:'hidden' }
            },
                React.createElement('div', { style: { position:'absolute', left:0, top:0, bottom:0, width:'4px', background:'linear-gradient(180deg,#ffd700,#ff8800)', borderRadius:'12px 0 0 12px' } }),
                React.createElement('div', { style: { display:'flex', alignItems:'flex-start', gap:'8px', paddingLeft:'6px' } },
                    React.createElement('span', { style: { fontSize:'16px', lineHeight:1, flexShrink:0 } }, '📢'),
                    React.createElement('div', { style: { flex:1, minWidth:0 } },
                        React.createElement('div', { style: { fontSize:'9px', fontWeight:800, color:'#fbbf24', letterSpacing:'1px', marginBottom:'3px', textTransform:'uppercase' } },
                            (lang==='ar'?'إعلان من الإدارة':'ANNOUNCEMENT') + (familyData.announcementBy ? ' · ' + familyData.announcementBy : '')
                        ),
                        React.createElement('div', { style: { fontSize:'12px', color:'#fde68a', lineHeight:1.5, fontWeight:600, wordBreak:'break-word' } }, familyData.announcement)
                    )
                )
            ),
            // ── Mini Profile Popup ──
            miniProfile && React.createElement(MiniProfilePopup, {
                profile: miniProfile,
                onClose: function() { setMiniProfile(null); },
                currentUID: currentUID,
                lang: lang,
                onOpenProfile: onOpenProfile,
                onSendGift: onSendGift ? function(p) {
                    setGiftTarget({ uid: p.uid, displayName: p.name, photoURL: p.photo });
                    setShowChatGiftModal(true);
                } : null,
                onReport: async function(p) {
                    try {
                        await reportsCollection.add({
                            type: 'user',
                            reporterUID: currentUID,
                            reporterName: (currentUserData && currentUserData.displayName) || 'User',
                            reportedUID: p.uid, reportedName: p.name,
                            reason: 'family_chat_report',
                            createdAt: TS(),
                            status: 'pending',
                        });
                    } catch(e) {}
                    if (onNotification) onNotification(lang === 'ar' ? '✅ تم إرسال البلاغ' : '✅ Report sent');
                },
            }),
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
                    // 🧧 Red Packet message in family chat
                    if (msg.type === 'red_packet') return React.createElement('div', { key: msg.id, style:{ display:'flex', flexDirection: isMe?'row-reverse':'row', gap:'7px', alignItems:'flex-end' } },
                        React.createElement('div', {
                            onClick: function() { openFamilyChatMiniProfile(msg.senderId, { name: msg.senderName, photo: msg.senderPhoto }); },
                            style: { width:'26px', height:'26px', borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.1)', cursor:'pointer' }
                        }, msg.senderPhoto ? React.createElement('img', { src:msg.senderPhoto, alt:'', style:{width:'100%',height:'100%',objectFit:'cover'} }) : React.createElement('div', { style:{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px'} }, '😎')),
                        React.createElement('div', { style:{ maxWidth:'min(220px,calc(100vw-90px))' } },
                            !isMe && React.createElement('div', { style:{ fontSize:'9px', color:'#a78bfa', fontWeight:700, marginBottom:'3px', paddingLeft:'4px', cursor:'pointer' }, onClick: function(){ openFamilyChatMiniProfile(msg.senderId,{name:msg.senderName,photo:msg.senderPhoto}); } }, msg.senderName),
                            typeof RedPacketCard !== 'undefined' && React.createElement(RedPacketCard, {
                                rpId: msg.rpId, rpAmount: msg.rpAmount, maxClaims: msg.maxClaims, senderName: msg.senderName,
                                currentUID: currentUID, user: { uid: currentUID }, currentUser: userData||currentUserData, lang: lang,
                                onClaim: async function(rpId) {
                                    try {
                                        var rpDoc = await redPacketsCollection.doc(rpId).get();
                                        if (!rpDoc.exists) return;
                                        var rp = rpDoc.data();
                                        // ❌ المرسل يأخذ نسبة فقط مثل أي شخص آخر في شات القبيلة
                                        if (rp.claimedBy && rp.claimedBy.includes(currentUID)) { if(onNotification) onNotification(lang==='ar'?'❌ استلمته من قبل':'❌ Already claimed'); return; }
                                        if ((rp.claimedBy&&rp.claimedBy.length||0)>=(rp.maxClaims||1)) { if(onNotification) onNotification(lang==='ar'?'❌ نفد المغلف':'❌ Exhausted'); return; }
                                        var perClaim = Math.floor(rp.amount/(rp.maxClaims||1));
                                        var bonus = Math.floor(Math.random()*Math.floor(perClaim*0.5));
                                        var claim = Math.min(perClaim+bonus, rp.remaining||rp.amount);
                                        await redPacketsCollection.doc(rpId).update({ claimedBy:firebase.firestore.FieldValue.arrayUnion(currentUID), remaining:firebase.firestore.FieldValue.increment(-claim), status:((rp.claimedBy&&rp.claimedBy.length||0)+1>=(rp.maxClaims||1))?'exhausted':'active' });
                                        await usersCollection.doc(currentUID).update({ currency:firebase.firestore.FieldValue.increment(claim) });
                                        await familiesCollection.doc(familyId).collection('messages').add({ type:'system', text:(lang==='ar'?'🎉 '+((userData||currentUserData)?.displayName||'عضو')+' استلم '+claim+' 🧠 من مغلف '+rp.senderName:'🎉 '+((userData||currentUserData)?.displayName||'Member')+' claimed '+claim+' 🧠 from '+rp.senderName+"'s packet"), senderId:'system', timestamp:TS() });
                                        if(onNotification) onNotification(lang==='ar'?'🎉 استلمت '+claim+' Intel!':'🎉 Got '+claim+' Intel!');
                                    } catch(e) { if(onNotification) onNotification(lang==='ar'?'❌ خطأ':'❌ Error'); }
                                }
                            }),
                            React.createElement('div', { style:{ fontSize:'9px', color:'#374151', marginTop:'2px', textAlign: isMe?'right':'left', paddingLeft:'4px' } }, fmtTime(msg.timestamp))
                        )
                    );
                    if (isSystem) return React.createElement('div', { key: msg.id, style: { textAlign:'center', padding:'4px 12px' } },
                        React.createElement('span', { style: { fontSize:'10px', color:'#6b7280', background:'rgba(255,255,255,0.04)', padding:'3px 10px', borderRadius:'20px' } }, msg.text)
                    );
                    if (isDonation) return React.createElement('div', { key: msg.id, style: { display:'flex', justifyContent:'center', padding:'4px 0' } },
                        React.createElement('div', { style: { background:'linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,140,0,0.1))', border:'1px solid rgba(255,215,0,0.3)', borderRadius:'12px', padding:'8px 14px', maxWidth:'90%', textAlign:'center' } },
                            React.createElement('div', { style: { fontSize:'12px', color:'#ffd700', fontWeight:800 } }, msg.text),
                            React.createElement('div', { style: { fontSize:'10px', color:'#6b7280', marginTop:'2px' } }, fmtTime(msg.timestamp))
                        )
                    );
                    var isAnnouncement = msg.type === 'announcement';
                    if (isAnnouncement) return React.createElement('div', { key: msg.id, style: { display:'flex', justifyContent:'center', padding:'6px 0' } },
                        React.createElement('div', {
                            style: { width:'100%', background:'linear-gradient(135deg,rgba(255,165,0,0.2),rgba(255,80,0,0.12))', border:'1.5px solid rgba(255,165,0,0.5)', borderRadius:'14px', padding:'10px 14px', position:'relative', overflow:'hidden', boxShadow:'0 0 18px rgba(255,140,0,0.18)' }
                        },
                            React.createElement('div', { style: { position:'absolute', left:0, top:0, bottom:0, width:'4px', background:'linear-gradient(180deg,#ffd700,#ff8800)', borderRadius:'14px 0 0 14px' } }),
                            React.createElement('div', { style: { paddingLeft:'8px' } },
                                React.createElement('div', { style: { display:'flex', alignItems:'center', gap:'6px', marginBottom:'5px' } },
                                    React.createElement('span', { style: { fontSize:'16px' } }, '📢'),
                                    React.createElement('span', { style: { fontSize:'10px', fontWeight:900, color:'#fbbf24', letterSpacing:'1px', textTransform:'uppercase' } }, lang==='ar'?'إعلان رسمي':'OFFICIAL ANNOUNCEMENT'),
                                    React.createElement('span', { style: { marginLeft:'auto', fontSize:'9px', color:'#6b7280' } }, fmtTime(msg.timestamp))
                                ),
                                React.createElement('div', { style: { display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' } },
                                    msg.senderPhoto
                                        ? React.createElement('img', { src: msg.senderPhoto, alt:'', style:{width:'18px',height:'18px',borderRadius:'50%',objectFit:'cover',border:'1.5px solid rgba(255,215,0,0.5)'} })
                                        : React.createElement('div', { style:{width:'18px',height:'18px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px'}}, '👤'),
                                    React.createElement('span', { style: { fontSize:'10px', fontWeight:700, color:'#fde68a' } }, msg.senderName)
                                ),
                                React.createElement('div', { style: { fontSize:'13px', color:'#fef3c7', lineHeight:1.6, fontWeight:600, wordBreak:'break-word' } }, msg.text)
                            )
                        )
                    );
                    return React.createElement('div', { key: msg.id, style: { display:'flex', flexDirection: isMe?'row-reverse':'row', gap:'8px', alignItems:'flex-end' } },
                        // صورة المرسل — قابلة للضغط
                        !isMe && React.createElement('div', {
                            onClick: function() { openFamilyChatMiniProfile(msg.senderId, { name: msg.senderName, photo: msg.senderPhoto }); },
                            style: { width:'28px', height:'28px', borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.1)', cursor:'pointer' }
                        },
                            msg.senderPhoto
                                ? React.createElement('img', { src: msg.senderPhoto, alt:'', style:{width:'100%',height:'100%',objectFit:'cover'}})
                                : React.createElement('div', { style:{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}, '😎')
                        ),
                        React.createElement('div', { style: { maxWidth:'72%' } },
                            // اسم المرسل — قابل للضغط
                            !isMe && React.createElement('div', {
                                onClick: function() { openFamilyChatMiniProfile(msg.senderId, { name: msg.senderName, photo: msg.senderPhoto }); },
                                style: { fontSize:'10px', color:'#9ca3af', marginBottom:'3px', fontWeight:700, paddingLeft:'4px', cursor:'pointer' },
                                onMouseEnter: function(e) { e.currentTarget.style.color='#00f2ff'; },
                                onMouseLeave: function(e) { e.currentTarget.style.color='#9ca3af'; }
                            }, msg.senderName),
                            msg.type === 'image' && msg.imageUrl
                                ? React.createElement('img', { src: msg.imageUrl, alt:'', style:{ width: 'min(240px,calc(100vw - 80px))', maxHeight:'240px', borderRadius:'12px', display:'block', objectFit:'cover', cursor:'pointer' }, onClick: function(){var w=window.open();w.document.write('<body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="'+msg.imageUrl+'" style="max-width:100vw;max-height:100vh;object-fit:contain"></body>');}  })
                                : React.createElement('div', {
                                    style: { padding:'8px 12px', borderRadius: isMe?'14px 4px 14px 14px':'4px 14px 14px 14px', background: isMe?'linear-gradient(135deg,rgba(0,242,255,0.2),rgba(112,0,255,0.2))':'rgba(255,255,255,0.07)', border: isMe?'1px solid rgba(0,242,255,0.3)':'1px solid rgba(255,255,255,0.08)', fontSize:'12px', color:'#e2e8f0', lineHeight:1.5, wordBreak:'break-word' }
                                  }, renderMsgText(msg.text)),
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
            // ── @ Mention list ──
            showMentionList && mentionMembers.length > 0 && React.createElement('div', {
                style: { background:'#0e1020', border:'1px solid rgba(0,242,255,0.2)', borderRadius:'12px', margin:'0 8px 4px', overflow:'hidden', maxHeight:'160px', overflowY:'auto', flexShrink:0 }
            },
                mentionMembers.map(function(m) {
                    return React.createElement('div', {
                        key: m.id,
                        onClick: function() { selectMention(m); },
                        style: { display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', cursor:'pointer', transition:'background 0.12s' },
                        onMouseEnter: function(e) { e.currentTarget.style.background='rgba(0,242,255,0.08)'; },
                        onMouseLeave: function(e) { e.currentTarget.style.background='transparent'; }
                    },
                        React.createElement('div', { style: { width:'24px', height:'24px', borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.08)' } },
                            m.photoURL
                                ? React.createElement('img', { src: m.photoURL, alt:'', style:{width:'100%',height:'100%',objectFit:'cover'} })
                                : React.createElement('span', { style:{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',fontSize:'12px'}}, '😎')
                        ),
                        React.createElement('span', { style: { fontSize:'12px', fontWeight:700, color:'white' } }, '@' + m.displayName),
                        m.id === currentUID && React.createElement('span', { style: { fontSize:'10px', color:'#6b7280' } }, lang==='ar'?'(أنت)':'(you)')
                    );
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
                // زر الهدايا
                onSendGift && React.createElement('button', {
                    onClick: function() { setGiftTarget(userData || currentUserData); setShowChatGiftModal(true); },
                    title: lang==='ar'?'أرسل هدية لعضو':'Send gift to a member',
                    style: { width:'36px', height:'36px', borderRadius:'10px', background:'rgba(255,215,0,0.1)', border:'1px solid rgba(255,215,0,0.22)', color:'#9ca3af', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }
                }, '🎁'),
                // زر المغلف الأحمر
                React.createElement('button', {
                    onClick: function() { setShowFamRPModal(true); },
                    title: lang==='ar'?'أرسل مغلف':'Send Packet',
                    style: { width:'36px', height:'36px', borderRadius:'10px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }
                }, '🧧'),
                React.createElement('input', {
                    ref: chatInputRef,
                    value: chatInput,
                    onChange: handleInputChange,
                    onKeyDown: function(e) {
                        if (e.key === 'Escape') setShowMentionList(false);
                        if (e.key === 'Enter' && !e.shiftKey && !showMentionList) { e.preventDefault(); sendMessage(chatInput); }
                    },
                    maxLength: 400,
                    style: { flex:1, padding:'9px 12px', borderRadius:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'white', fontSize:'13px', outline:'none' },
                    placeholder: lang==='ar'?'اكتب رسالة... أو @ للمنشن':'Type a message... or @ to mention'
                }),
                React.createElement('button', {
                    onClick: function() { sendMessage(chatInput); },
                    disabled: !chatInput.trim() || sendingMsg,
                    style: { width:'40px', height:'40px', borderRadius:'12px', border:'none', flexShrink:0, background: chatInput.trim()?'linear-gradient(135deg,#00f2ff,#7000ff)':'rgba(255,255,255,0.06)', color: chatInput.trim()?'white':'#6b7280', fontSize:'18px', cursor: chatInput.trim()?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center' }
                }, sendingMsg ? '⏳' : '➤')
            ),
            // 🧧 Red Packet Modal for Family Chat
            showFamRPModal && React.createElement('div', {
                style: { position:'fixed', inset:0, zIndex: Z.OVERLAY, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'flex-end', justifyContent:'center' }
            },
                React.createElement('div', {
                    style: { width:'100%', maxWidth:'min(440px,100vw)', background:'linear-gradient(160deg,#0e0e22,#13122a)', borderRadius:'20px 20px 0 0', border:'1px solid rgba(255,255,255,0.1)', overflow:'hidden' }
                },
                    React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)' } },
                        React.createElement('div', { style:{ fontSize:'14px', fontWeight:800, color:'#ef4444' } }, '🧧 ' + (lang==='ar'?'مغلف أحمر للقبيلة':'Family Red Packet')),
                        React.createElement('button', { onClick: function() { setShowFamRPModal(false); }, style:{ background:'none', border:'none', color:'#9ca3af', fontSize:'20px', cursor:'pointer' } }, '✕')
                    ),
                    React.createElement('div', { style:{ padding:'14px', overflowY:'auto', maxHeight:'60vh' } },
                        React.createElement('div', { style:{ fontSize:'11px', color:'#6b7280', marginBottom:'12px', textAlign:'center' } },
                            (lang==='ar'?'رصيدك:':'Balance:') + ' ',
                            React.createElement('span', { style:{ color:'#ffd700', fontWeight:700 } }, ((userData||currentUserData)?.currency||0).toLocaleString() + ' 🧠')
                        ),
                        typeof RED_PACKETS_CONFIG !== 'undefined' && RED_PACKETS_CONFIG.map(function(rp) {
                            var balance = (userData||currentUserData)?.currency||0;
                            var canBuy = balance >= rp.amount;
                            return React.createElement('button', {
                                key: rp.id,
                                disabled: sendingFamRP || !canBuy,
                                onClick: async function() {
                                    if (sendingFamRP || !canBuy) return;
                                    setSendingFamRP(true);
                                    try {
                                        var sender = userData || currentUserData;
                                        var rpRef = await redPacketsCollection.add({
                                            configId:rp.id, amount:rp.amount,
                                            senderId:currentUID, senderName:sender.displayName||'User', senderPhoto:sender.photoURL||null,
                                            targetType:'family', targetId:familyId, targetName:(familyData&&familyData.name)||'Family',
                                            claimedBy:[], maxClaims:rp.maxClaims, remaining:rp.amount,
                                            createdAt:TS(), status:'active',
                                        });
                                        await usersCollection.doc(currentUID).update({ currency:firebase.firestore.FieldValue.increment(-rp.amount) });
                                        await familiesCollection.doc(familyId).collection('messages').add({
                                            type:'red_packet', rpId:rpRef.id, rpAmount:rp.amount, rpConfigId:rp.id,
                                            senderId:currentUID, senderName:sender.displayName||'User', senderPhoto:sender.photoURL||null,
                                            text:'🧧 '+rp.amount, timestamp:TS(), maxClaims:rp.maxClaims,
                                        });
                                        await publicChatCollection.add({
                                            type:'red_packet_announce', senderId:currentUID, senderName:sender.displayName||'User',
                                            amount:rp.amount, targetType:'family', targetName:(familyData&&familyData.name)||'Family',
                                            text:(lang==='ar'?'🧧 '+(sender.displayName||'User')+' أرسل مغلف '+rp.amount+' في قبيلة '+((familyData&&familyData.name)||'Family'):'🧧 '+(sender.displayName||'User')+' sent a '+rp.amount+' packet in family '+((familyData&&familyData.name)||'Family')),
                                            createdAt:TS(),
                                        });
                                        setShowFamRPModal(false);
                                        if (onNotification) onNotification(lang==='ar'?'✅ تم إرسال المغلف!':'✅ Packet sent!');
                                    } catch(e) { if (onNotification) onNotification(lang==='ar'?'❌ خطأ':'❌ Error'); }
                                    setSendingFamRP(false);
                                },
                                style: { display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', borderRadius:'14px', background:rp.bg, border:'1px solid '+rp.border, cursor:canBuy?'pointer':'not-allowed', opacity:canBuy?1:0.4, textAlign:'left', width:'100%', marginBottom:'8px', boxSizing:'border-box' }
                            },
                                rp.imageURL ? React.createElement('img', { src:rp.imageURL, style:{width:'40px',height:'40px',objectFit:'contain'} }) : React.createElement('div', { style:{width:'40px',height:'40px',borderRadius:'10px',background:rp.color+'20',border:'1px solid '+rp.color+'44',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px'} }, '🧧'),
                                React.createElement('div', { style:{ flex:1 } },
                                    React.createElement('div', { style:{ fontSize:'13px', fontWeight:800, color:rp.color } }, lang==='ar'?rp.name_ar:rp.name_en),
                                    React.createElement('div', { style:{ fontSize:'10px', color:'#9ca3af', marginTop:'2px' } }, lang==='ar'?rp.desc_ar:rp.desc_en)
                                ),
                                React.createElement('div', { style:{ fontSize:'13px', fontWeight:800, color:rp.color } }, rp.amount.toLocaleString() + ' 🧠')
                            );
                        })
                    )
                )
            ),
            // Gift modal
            showChatGiftModal && onSendGift && React.createElement(SendGiftModal, {
                show: showChatGiftModal,
                onClose: function() { setShowChatGiftModal(false); setGiftTarget(null); },
                targetUser: giftTarget,
                currentUser: userData || currentUserData,
                lang: lang,
                onSendGift: async function(gift, target, qty) {
                    if (target && target.uid) {
                        const targetDoc = target.uid === currentUID
                            ? { uid: target.uid, ...target }
                            : await usersCollection.doc(target.uid).get().then(d => d.exists ? { uid: target.uid, ...d.data() } : target).catch(() => target);
                        await onSendGift(gift, targetDoc, qty || 1);
                    }
                    setShowChatGiftModal(false);
                    setGiftTarget(null);
                },
                currency: (userData || currentUserData)?.currency || 0,
                friendsData: familyMembers.filter(function(m) { return m.id !== currentUID; }).map(function(m) { return Object.assign({}, m, { uid: m.id }); }),
            })
        )
        )
    );
};


// ════════════════════════════════════════════════════════
// 🏆 FAMILY RANKING INLINE — Used in ranking tab
// ════════════════════════════════════════════════════════
const FamilyRankingInline = ({ lang, currentFamilyId, onOpenFamily }) => {
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
                            <div style={{fontSize:'12px', fontWeight:900, color:'#fbbf24'}}>{fmtFamilyNum(fam.xp||0)} XP</div>
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

// ════════════════════════════════════════════════════════
// 👤 FamilyMemberQuickCard — Lightweight inline popup
//    position:absolute داخل modal (مش fixed)
//    يظهر عند الضغط على اسم عضو في chat العائلة
// ════════════════════════════════════════════════════════
const FamilyMemberQuickCard = ({ member, currentUID, lang, onSendGift, onClose }) => {
    if (!member) return null;
    const isSelf = member.uid === currentUID;
    return (
        <div style={{
            position:'absolute', inset:0, zIndex:10,
            background:'rgba(0,0,0,0.6)',
            display:'flex', alignItems:'center', justifyContent:'center',
        }} onClick={onClose}>
            <div style={{
                background:'linear-gradient(160deg,#0e0e22,#13122a)',
                border:'1px solid rgba(0,242,255,0.25)', borderRadius:'18px',
                padding:'20px', width:'240px',
                boxShadow:'0 20px 50px rgba(0,0,0,0.9)',
                textAlign:'center',
            }} onClick={e => e.stopPropagation()}>

                <div style={{width:'64px',height:'64px',borderRadius:'50%',overflow:'hidden',margin:'0 auto 10px',border:'2px solid rgba(0,242,255,0.35)'}}>
                    {member.photo
                        ? <img src={member.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        : <div style={{width:'100%',height:'100%',background:'rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'26px'}}>😎</div>
                    }
                </div>

                <div style={{fontSize:'14px',fontWeight:800,color:'white',marginBottom:'4px'}}>{member.name}</div>

                {member.customId && (
                    <div style={{fontSize:'11px',color:'#6b7280',marginBottom:'14px'}}>
                        🪪 #{member.customId}
                    </div>
                )}

                {!isSelf && onSendGift && (
                    <button onClick={() => { onClose(); onSendGift(member); }}
                        style={{width:'100%',padding:'10px',borderRadius:'10px',background:'linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,140,0,0.15))',border:'1px solid rgba(255,215,0,0.4)',color:'#fbbf24',fontSize:'13px',fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                        🎁 {lang==='ar'?'أرسل هدية':'Send Gift'}
                    </button>
                )}

                {isSelf && (
                    <div style={{fontSize:'11px',color:'#6b7280'}}>
                        {lang==='ar'?'هذا أنت':'This is you'}
                    </div>
                )}
            </div>
        </div>
    );
};

// ════════════════════════════════════════════════════════
// 🏠 FAMILY MODAL — Main Component V2
// ════════════════════════════════════════════════════════
const FamilyModal = ({ show, onClose, currentUser, currentUserData, currentUID, lang, isLoggedIn, onNotification, viewFamilyId, onSendGift, userData }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [family, setFamily] = useState(null);
    const [loadingFamily, setLoadingFamily] = useState(true);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [newsLog, setNewsLog] = useState([]);
    const [donationSort, setDonationSort] = useState('intel');
    const [memberSearch, setMemberSearch] = useState('');
    // Gear menu state for member management
    const [gearMenuUid, setGearMenuUid] = useState(null); // uid of member whose gear is open
    // Tag editing state
    const [editTag, setEditTag] = useState('');
    const [savingTag, setSavingTag] = useState(false);
    const [joinRequesterProfiles, setJoinRequesterProfiles] = useState([]);
    // ── Delete family confirm ──
    const [showDeleteFamilyConfirm, setShowDeleteFamilyConfirm] = useState(false);
    const [deletingFamily, setDeletingFamily] = useState(false);
    // ── Gift modal in chat ──
    const [showFamilyChatGift, setShowFamilyChatGift] = useState(false);
    // ── Mini profile popup in chat ──
    const [miniProfileMember, setMiniProfileMember] = useState(null); // { uid, name, photo, customId }
    // ── Mention @ in chat ──
    const [mentionSearch, setMentionSearch] = useState(''); // query بعد @
    const [showMentionList, setShowMentionList] = useState(false);
    const chatInputRef = useRef(null);

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

    // ── Load family (real-time) ── supports viewFamilyId for viewing external families
    useEffect(() => {
        if (!show) { setLoadingFamily(false); return; }
        setLoadingFamily(true);
        // If viewFamilyId passed (from profile badge click), load that family in read-only mode
        const fid = viewFamilyId || currentUserData?.familyId;
        if (!fid) { setFamily(null); setLoadingFamily(false); return; }
        const unsub = familiesCollection.doc(fid).onSnapshot(snap => {
            if (snap.exists) {
                const d = { id: snap.id, ...snap.data() };
                setFamily(d);
                setEditAnnouncement(d.announcement || '');
                setEditName(d.name || '');
                setEditDesc(d.description || '');
                setJoinMode(d.joinMode || 'open');
                setEditTag(d.tag || '');
            } else {
                setFamily(null);
                if (!viewFamilyId) {
                    usersCollection.doc(currentUID).update({ familyId: null, familyName: null, familyTag: null }).catch(() => {});
                }
            }
            setLoadingFamily(false);
        }, () => setLoadingFamily(false));
        return () => unsub();
    }, [show, currentUID, currentUserData?.familyId, viewFamilyId]);

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
                createdAt: TS(),
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
                timestamp: TS(),
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
                timestamp: TS(),
            });
        } catch (e) {}
    };

    // Update user's sign fields when joining/sign changes
    const syncUserFamilySign = async (familyId, familyData) => {
        try {
            const weeklyAct = familyData.weeklyActiveness || 0;
            const signD = getFamilySignLevelData(weeklyAct);
            await usersCollection.doc(currentUID).update({
                familySignLevel: signD?.level || null,
                familySignColor: signD?.color || null,
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
        const cleanTag = tribeTag.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
        if (cleanTag.length < 3) { onNotification(lang === 'ar' ? '❌ الوسم 3 أحرف على الأقل' : '❌ Tag: min 3 chars'); return; }
        const cleanName = tribeName.trim().slice(0, 10);
        setCreating(true);
        try {
            const tagCheck = await familiesCollection.where('tag', '==', cleanTag).get();
            if (!tagCheck.empty) { onNotification(lang === 'ar' ? '❌ هذا الوسم مستخدم' : '❌ Tag already taken'); setCreating(false); return; }
            const ref = await familiesCollection.add({
                name: cleanName, tag: cleanTag, description: tribeDesc.trim(),
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
                createdAt: TS(),
                lastActivity: TS(),
            });
            await usersCollection.doc(currentUID).update({
                currency: firebase.firestore.FieldValue.increment(-FAMILY_CREATE_COST),
                familyId: ref.id, familyName: cleanName, familyTag: cleanTag,
                // No sign on creation — earned through weekly activeness
                familySignLevel: null, familySignColor: null, familySignImageURL: null,
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
                lastActivity: TS(),
            });
            await usersCollection.doc(currentUID).update({
                familyId, familyName: fd.name, familyTag: fd.tag,
                familySignLevel: getFamilySignLevelData(fd.weeklyActiveness || 0)?.level || null,
                familySignColor: getFamilySignLevelData(fd.weeklyActiveness || 0)?.color || null,
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
            onNotification(lang === 'ar' ? '👋 تركت العائلة' : '👋 Left family');
        } catch (e) { onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
    };

    // ── حذف العائلة (المالك فقط) ──
    const handleDeleteFamily = async () => {
        if (!family?.id || getFamilyRole(family, currentUID) !== 'owner') return;
        setDeletingFamily(true);
        try {
            // حذف كل الأعضاء من بيانات المستخدمين
            const memberIds = family.members || [];
            const batch = db.batch();
            memberIds.forEach(uid => {
                const ref = usersCollection.doc(uid);
                batch.update(ref, {
                    familyId: null, familyName: null, familyTag: null,
                    familySignLevel: null, familySignColor: null, familySignImageURL: null,
                });
            });
            await batch.commit().catch(() => {});
            // حذف العائلة نفسها
            await familiesCollection.doc(family.id).delete();
            setFamily(null);
            setView('home');
            setActiveTab('profile');
            setShowDeleteFamilyConfirm(false);
            onNotification(lang === 'ar' ? '🗑️ تم حذف العائلة بنجاح' : '🗑️ Family deleted successfully');
            onClose();
        } catch (e) {
            onNotification(lang === 'ar' ? '❌ خطأ في الحذف' : '❌ Delete error');
        }
        setDeletingFamily(false);
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

            // ── Mission ft3: Donate 500 Intel (per-user) ──
            const ft3Key = `ft3_${currentUID}`;
            const ft3Prog = family.taskProgress?.[ft3Key] || { current: 0, claimed: false };
            const newFt3 = ft3Prog.claimed ? ft3Prog.current : Math.min(500, (ft3Prog.current || 0) + amount);

            await familiesCollection.doc(family.id).update({
                treasury: firebase.firestore.FieldValue.increment(amount),
                xp: firebase.firestore.FieldValue.increment(Math.floor(amount / 10)),
                activeness: firebase.firestore.FieldValue.increment(amount),
                weeklyActiveness: firebase.firestore.FieldValue.increment(amount),
                [`memberDonations.${currentUID}.weekly`]: (don.weekly || 0) + amount,
                [`memberDonations.${currentUID}.total`]: (don.total || 0) + amount,
                [`memberDonations.${currentUID}.weeklyIntel`]: (don.weeklyIntel || 0) + amount,
                [`memberDonations.${currentUID}.totalIntel`]: (don.totalIntel || 0) + amount,
                ...(ft3Prog.claimed ? {} : { [`taskProgress.${ft3Key}.current`]: newFt3 }),
                lastActivity: TS(),
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
                timestamp: TS(),
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

        // ── Check if it's an Announcement (owner/admin only) ──
        const isAnnouncement = /^Announcement\b/i.test(text) && canManage;

        try {
            const msgData = {
                senderId: currentUID,
                senderName: currentUserData?.displayName || 'Member',
                senderPhoto: currentUserData?.photoURL || null,
                senderRole: myRole || 'member',
                type: isAnnouncement ? 'announcement' : 'text',
                text,
                timestamp: TS(),
            };
            await familiesCollection.doc(family.id).collection('messages').add(msgData);

            // لو إعلان → نحفظه في بيانات العائلة كمان
            if (isAnnouncement) {
                await familiesCollection.doc(family.id).update({
                    announcement: text,
                    announcementAt: TS(),
                    announcementBy: currentUserData?.displayName || 'Leader',
                });
            }

            // ── Mission ft6: Chat 10 messages (per-user) ──
            const userChatProg = family.taskProgress?.[`ft6_${currentUID}`] || { current: 0, claimed: false };
            if (!userChatProg.claimed) {
                await familiesCollection.doc(family.id).update({
                    [`taskProgress.ft6_${currentUID}.current`]: Math.min(10, (userChatProg.current || 0) + 1),
                    activeness: firebase.firestore.FieldValue.increment(5),
                    weeklyActiveness: firebase.firestore.FieldValue.increment(5),
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
                    familySignLevel: getFamilySignLevelData(fd.data()?.weeklyActiveness || 0)?.level || null,
                    familySignColor: getFamilySignLevelData(fd.data()?.weeklyActiveness || 0)?.color || null,
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

    const setMemberRole = async (uid, newRole) => {
        if (!family?.id || uid === family.createdBy) return;
        const myRole = getFamilyRole(family, currentUID);
        // Only owner can set admin; owner+admin can set moderator
        if (newRole === 'admin' && myRole !== 'owner') return;
        if (newRole === 'member' && myRole !== 'owner' && getFamilyRole(family, uid) === 'admin') return;
        try {
            await familiesCollection.doc(family.id).update({
                [`memberRoles.${uid}`]: newRole,
            });
            const m = familyMembers.find(fm => fm.id === uid);
            const roleName = { admin: lang==='ar'?'أدمن':'Admin', moderator: lang==='ar'?'مشرف':'Mod', member: lang==='ar'?'عضو':'Member' }[newRole] || newRole;
            await postSystemMessage(family.id, `${m?.displayName || 'Member'} → ${roleName}`);
            onNotification(lang==='ar'?`✅ تم تعيين ${roleName}`:`✅ Set as ${roleName}`);
        } catch(e) { onNotification(lang==='ar'?'❌ خطأ':'❌ Error'); }
        setGearMenuUid(null);
    };

    const saveTag = async () => {
        if (!family?.id || !canManageFamily(family, currentUID)) return;
        const clean = editTag.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
        if (clean.length < 3) { onNotification(lang==='ar'?'❌ الوسم 3 أحرف على الأقل':'❌ Tag: min 3 chars'); return; }
        setSavingTag(true);
        try {
            const tagCheck = await familiesCollection.where('tag', '==', clean).get();
            const alreadyMine = tagCheck.docs.some(d => d.id === family.id);
            if (!tagCheck.empty && !alreadyMine) { onNotification(lang==='ar'?'❌ هذا الوسم مستخدم':'❌ Tag already taken'); setSavingTag(false); return; }
            await familiesCollection.doc(family.id).update({ tag: clean });
            for (const uid of (family.members || [])) {
                await usersCollection.doc(uid).update({ familyTag: clean }).catch(() => {});
            }
            onNotification(lang==='ar'?'✅ تم تغيير الوسم':'✅ Tag updated');
        } catch(e) { onNotification(lang==='ar'?'❌ خطأ':'❌ Error'); }
        setSavingTag(false);
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

    // هل المستخدم بيشوف قبيلة من الخارج (مش عضو فيها)؟
    const isExternalView = !!(viewFamilyId && (!currentUserData?.familyId || currentUserData?.familyId !== viewFamilyId));
    const isMemberOfThisFamily = family ? (family.members || []).includes(currentUID) : false;
    const isReadOnly = isExternalView && !isMemberOfThisFamily;

    const TABS = isReadOnly ? [
        { id:'profile',  label_en:'Home',    label_ar:'الرئيسية', icon:'🏠' },
        { id:'members',  label_en:'Members', label_ar:'أعضاء',    icon:'👥' },
    ] : [
        { id:'profile',  label_en:'Home',    label_ar:'الرئيسية', icon:'🏠' },
        { id:'members',  label_en:'Members', label_ar:'أعضاء',    icon:'👥' },
        { id:'tasks',    label_en:'Tasks',   label_ar:'مهام',     icon:'🎯' },
        { id:'shop',     label_en:'Shop',    label_ar:'المتجر',   icon:'🏅' },
        { id:'news',     label_en:'News',    label_ar:'أخبار',    icon:'📰' },
        { id:'manage',   label_en:'Manage',  label_ar:'إدارة',    icon:'⚙️' },
    ];

    const fLvl = family ? getFamilyLevel(family.xp || 0) : null;
    const fProg = family ? getFamilyLevelProgress(family.xp || 0) : 0;
    const myRole = family ? getFamilyRole(family, currentUID) : null;
    const canManage = family ? canManageFamily(family, currentUID) : false;
    const weeklyAct = family ? (family.weeklyActiveness || 0) : 0;
    // signData can be null if no weekly activeness yet — use a safe fallback
    const SIGN_FALLBACK = { level: 0, color: '#4b5563', glow: 'rgba(75,85,99,0.3)', defaultIcon: '🏠', bg: 'rgba(75,85,99,0.1)', name_ar: 'بدون ساين', name_en: 'No Sign', threshold: 0 };
    const signData = (family ? getFamilySignLevelData(weeklyAct) : null) || SIGN_FALLBACK;
    const signProg = family ? getFamilySignProgress(weeklyAct) : 0;

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

                {/* ── OFFICIAL ANNOUNCEMENT — at top for visibility ── */}
                {family.announcement && (
                    <div style={{
                        background:'linear-gradient(135deg,rgba(20,10,0,0.95),rgba(30,15,0,0.95))',
                        border:'2px solid rgba(255,165,0,0.8)',
                        boxShadow:'0 0 28px rgba(255,140,0,0.25), inset 0 0 20px rgba(255,140,0,0.05)',
                        borderRadius:'14px',
                        position:'relative',
                        padding:'14px 14px 14px 22px',
                    }}>
                        {/* left glow bar */}
                        <div style={{position:'absolute',left:0,top:0,bottom:0,width:'5px',background:'linear-gradient(180deg,#ffd700,#ff8800)',borderRadius:'14px 0 0 14px'}}/>
                        {/* Header row */}
                        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                            <span style={{fontSize:'20px',flexShrink:0}}>📢</span>
                            <div style={{flex:1}}>
                                <div style={{fontSize:'10px', fontWeight:900, color:'#ffd700', letterSpacing:'1.5px', textTransform:'uppercase'}}>
                                    {lang==='ar'?'إعلان رسمي':'OFFICIAL ANNOUNCEMENT'}
                                </div>
                                {family.announcementBy && (
                                    <div style={{fontSize:'9px',color:'rgba(255,255,255,0.5)',marginTop:'1px'}}>
                                        {lang==='ar'?'بواسطة:':'By:'} {family.announcementBy}
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Announcement text — always fully visible */}
                        <div style={{
                            fontSize:'13px',
                            color:'#ffffff',
                            lineHeight:1.7,
                            fontWeight:500,
                            wordBreak:'break-word',
                            whiteSpace:'pre-wrap',
                            paddingTop:'4px',
                            borderTop:'1px solid rgba(255,165,0,0.25)',
                        }}>{family.announcement}</div>
                    </div>
                )}

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
                                {signData.level > 0 && <FamilySignBadge tag={family.tag} color={signData.color} signLevel={signData.level} imageURL={family.signImageURL} />}
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

                {/* ── Donate Button — only for members ── */}
                {!isReadOnly && (
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
                )}

                {/* ── Join Button — for non-members who are not in any family ── */}
                {isReadOnly && !currentUserData?.familyId && family && (
                <div style={{...S.card, background:'linear-gradient(135deg,rgba(0,242,255,0.07),rgba(112,0,255,0.05))', border:'1px solid rgba(0,242,255,0.2)', textAlign:'center', padding:'18px'}}>
                    <div style={{fontSize:'32px', marginBottom:'8px'}}>🏠</div>
                    <div style={{fontSize:'13px', fontWeight:800, color:'white', marginBottom:'4px'}}>
                        {lang==='ar'?'انضم لهذه العائلة':'Join this Family'}
                    </div>
                    <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'14px', lineHeight:1.5}}>
                        {lang==='ar'?'لست عضواً في أي عائلة — انضم الآن!':"You're not in any family — join now!"}
                    </div>
                    <button
                        onClick={()=>setView('join')}
                        style={{padding:'10px 28px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#00f2ff,#7000ff)', color:'white', fontSize:'13px', fontWeight:800, cursor:'pointer', boxShadow:'0 4px 16px rgba(0,242,255,0.3)'}}>
                        ➕ {lang==='ar'?'انضم الآن':'Join Now'}
                    </button>
                </div>
                )}

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

                {/* ── Announcement moved to top of page for visibility ── */}

                <div style={{height:'12px'}} />
            </div>
        );
    };

    // ─────────────────────────────────────────────
    // TAB: CHAT
    // ─────────────────────────────────────────────
    const renderChat = () => {
        if (!family) return null;

        const pinnedAnnouncement = family.announcement || null;
        const announcementBy = family.announcementBy || '';

        // ── معالجة تغيير input مع دعم الـ @ ──
        const handleChatInputChange = (e) => {
            const val = e.target.value;
            setChatInput(val);
            // detect @ mention
            const lastAt = val.lastIndexOf('@');
            if (lastAt !== -1) {
                const after = val.slice(lastAt + 1);
                if (!after.includes(' ')) {
                    setMentionSearch(after.toLowerCase());
                    setShowMentionList(true);
                    return;
                }
            }
            setShowMentionList(false);
        };

        // ── اختيار mention ──
        const selectMention = (member) => {
            const lastAt = chatInput.lastIndexOf('@');
            const newVal = chatInput.slice(0, lastAt) + '@' + member.displayName + ' ';
            setChatInput(newVal);
            setShowMentionList(false);
            setTimeout(() => chatInputRef.current?.focus(), 50);
        };

        // ── أعضاء العائلة المُصفّاة للمنشن — تشمل المستخدم نفسه ──
        const mentionMembers = [
            // نفسه أولاً
            ...(currentUID && currentUserData ? [{ id: currentUID, displayName: currentUserData.displayName, photoURL: currentUserData.photoURL, _isSelf: true }] : []),
            // بقية الأعضاء
            ...familyMembers.filter(m => m.id !== currentUID),
        ].filter(m => !mentionSearch || (m.displayName || '').toLowerCase().includes(mentionSearch));

        return (
            <div style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0, position:'relative'}}>

                {/* ── Pinned Announcement Bar ── */}
                {pinnedAnnouncement && (
                    <div style={{
                        flexShrink:0, margin:'8px 10px 4px', padding:'10px 14px',
                        borderRadius:'12px', background:'linear-gradient(135deg,rgba(255,165,0,0.18),rgba(255,80,0,0.12))',
                        border:'1px solid rgba(255,165,0,0.45)', boxShadow:'0 0 16px rgba(255,140,0,0.2)',
                        position:'relative', overflow:'hidden',
                    }}>
                        <div style={{position:'absolute',left:0,top:0,bottom:0,width:'4px',background:'linear-gradient(180deg,#ffd700,#ff8800)',borderRadius:'12px 0 0 12px'}}/>
                        <div style={{display:'flex',alignItems:'flex-start',gap:'8px',paddingLeft:'6px'}}>
                            <span style={{fontSize:'18px',lineHeight:1,flexShrink:0}}>📢</span>
                            <div style={{flex:1,minWidth:0}}>
                                <div style={{fontSize:'9px',fontWeight:800,color:'#fbbf24',letterSpacing:'1px',marginBottom:'3px',textTransform:'uppercase'}}>
                                    {lang==='ar'?'إعلان من الإدارة':'ANNOUNCEMENT'}
                                    {announcementBy ? ` · ${announcementBy}` : ''}
                                </div>
                                <div style={{fontSize:'12px',color:'#fde68a',lineHeight:1.5,fontWeight:600,wordBreak:'break-word'}}>
                                    {pinnedAnnouncement}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Mini Profile Popup ── */}
                <FamilyMemberQuickCard
                    member={miniProfileMember}
                    currentUID={currentUID}
                    lang={lang}
                    onClose={() => setMiniProfileMember(null)}
                    onSendGift={onSendGift ? (m) => setShowFamilyChatGift({ targetUID: m.uid, targetName: m.name, targetPhoto: m.photo }) : null}
                />

                {/* Messages */}
                <div style={{flex:1, overflowY:'auto', padding:'10px 12px', display:'flex', flexDirection:'column', gap:'8px'}}>
                    {chatMessages.length === 0 && !pinnedAnnouncement && (
                        <div style={{textAlign:'center', padding:'40px 20px', color:'#4b5563'}}>
                            <div style={{fontSize:'36px', marginBottom:'10px'}}>💬</div>
                            <div style={{fontSize:'12px'}}>{lang==='ar'?'كن أول من يتحدث!':'Be the first to chat!'}</div>
                        </div>
                    )}
                    {chatMessages.map(msg => {
                        const isMe = msg.senderId === currentUID;
                        const isSystem = msg.senderId === 'system' || msg.type === 'system';
                        const isDonation = msg.type === 'donation';
                        const isAnnouncement = msg.type === 'announcement';

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

                        if (isAnnouncement) return (
                            <div key={msg.id} style={{display:'flex', justifyContent:'center', padding:'6px 0'}}>
                                <div style={{width:'100%', background:'linear-gradient(135deg,rgba(255,165,0,0.2),rgba(255,80,0,0.12))', border:'1.5px solid rgba(255,165,0,0.5)', borderRadius:'14px', padding:'10px 14px', position:'relative', overflow:'hidden', boxShadow:'0 0 18px rgba(255,140,0,0.18)'}}>
                                    <div style={{position:'absolute',left:0,top:0,bottom:0,width:'4px',background:'linear-gradient(180deg,#ffd700,#ff8800)',borderRadius:'14px 0 0 14px'}}/>
                                    <div style={{paddingLeft:'8px'}}>
                                        <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'5px'}}>
                                            <span style={{fontSize:'16px'}}>📢</span>
                                            <span style={{fontSize:'10px',fontWeight:900,color:'#fbbf24',letterSpacing:'1px',textTransform:'uppercase'}}>{lang==='ar'?'إعلان رسمي':'OFFICIAL ANNOUNCEMENT'}</span>
                                            <span style={{marginLeft:'auto',fontSize:'9px',color:'#6b7280'}}>{fmtFamilyTime(msg.timestamp, lang)}</span>
                                        </div>
                                        <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'6px'}}>
                                            {msg.senderPhoto
                                                ? <img src={msg.senderPhoto} alt="" style={{width:'20px',height:'20px',borderRadius:'50%',objectFit:'cover',border:'1.5px solid rgba(255,215,0,0.5)'}}/>
                                                : <div style={{width:'20px',height:'20px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px'}}>👤</div>
                                            }
                                            <span style={{fontSize:'10px',fontWeight:700,color:'#fde68a'}}>{msg.senderName}</span>
                                            <FamilyRoleBadge role={msg.senderRole||'owner'} lang={lang} small />
                                        </div>
                                        <div style={{fontSize:'13px',color:'#fef3c7',lineHeight:1.6,fontWeight:600,wordBreak:'break-word'}}>{msg.text}</div>
                                    </div>
                                </div>
                            </div>
                        );

                        return (
                            <div key={msg.id} style={{display:'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap:'8px', alignItems:'flex-end'}}>
                                {/* صورة المرسل — قابلة للضغط لفتح ميني بروفايل */}
                                {!isMe && (
                                    <div
                                        style={{width:'28px', height:'28px', borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.1)', cursor:'pointer'}}
                                        onClick={() => setMiniProfileMember({ uid: msg.senderId, name: msg.senderName, photo: msg.senderPhoto, customId: null })}
                                    >
                                        {msg.senderPhoto
                                            ? <img src={msg.senderPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                                            : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}>😎</div>
                                        }
                                    </div>
                                )}
                                <div style={{maxWidth:'72%'}}>
                                    {/* اسم المرسل — قابل للضغط لفتح ميني بروفايل */}
                                    {!isMe && (
                                        <div
                                            style={{fontSize:'10px', color:'#9ca3af', marginBottom:'3px', fontWeight:700, paddingLeft:'4px', cursor:'pointer'}}
                                            onClick={() => setMiniProfileMember({ uid: msg.senderId, name: msg.senderName, photo: msg.senderPhoto, customId: null })}
                                            onMouseEnter={e => e.currentTarget.style.color='#00f2ff'}
                                            onMouseLeave={e => e.currentTarget.style.color='#9ca3af'}
                                        >{msg.senderName}</div>
                                    )}
                                    <div style={{
                                        padding:'8px 12px', borderRadius: isMe ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                                        background: isMe ? 'linear-gradient(135deg,rgba(0,242,255,0.2),rgba(112,0,255,0.2))' : 'rgba(255,255,255,0.07)',
                                        border: isMe ? '1px solid rgba(0,242,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                                        fontSize:'12px', color:'#e2e8f0', lineHeight:1.5,
                                        wordBreak:'break-word',
                                    }}>
                                        {/* عرض المنشن بلون مميز + قابل للضغط */}
                                        {msg.text?.split(/(@\w[\w\s]*?)(?=\s|$)/g).map((part, pi) =>
                                            part.startsWith('@') ? (
                                                <span key={pi}
                                                    style={{ color:'#00f2ff', fontWeight:700, cursor:'pointer', textDecoration:'underline dotted rgba(0,242,255,0.4)' }}
                                                    onClick={() => {
                                                        const mentionName = part.slice(1).trim();
                                                        const member = familyMembers.find(m => m.displayName === mentionName);
                                                        const selfMatch = (currentUserData?.displayName === mentionName);
                                                        if (member) setMiniProfileMember({ uid: member.id, name: member.displayName, photo: member.photoURL, customId: member.customId });
                                                        else if (selfMatch) setMiniProfileMember({ uid: currentUID, name: currentUserData?.displayName, photo: currentUserData?.photoURL, customId: currentUserData?.customId });
                                                    }}
                                                >{part}</span>
                                            ) : part
                                        )}
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

                {/* ── قائمة الـ @ Mention ── */}
                {showMentionList && mentionMembers.length > 0 && (
                    <div style={{
                        position:'absolute', bottom:'60px', left:'10px', right:'10px',
                        background:'#0e1020', border:'1px solid rgba(0,242,255,0.2)',
                        borderRadius:'12px', overflow:'hidden', zIndex:20,
                        boxShadow:'0 -10px 30px rgba(0,0,0,0.7)',
                        maxHeight:'180px', overflowY:'auto',
                    }}>
                        {mentionMembers.map(m => (
                            <div key={m.id}
                                onClick={() => selectMention(m)}
                                style={{display:'flex', alignItems:'center', gap:'8px', padding:'9px 12px', cursor:'pointer', transition:'background 0.12s'}}
                                onMouseEnter={e => e.currentTarget.style.background='rgba(0,242,255,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background='transparent'}
                            >
                                <div style={{width:'26px',height:'26px',borderRadius:'50%',overflow:'hidden',flexShrink:0,background:'rgba(255,255,255,0.08)'}}>
                                    {m.photoURL ? <img src={m.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',fontSize:'13px'}}>😎</span>}
                                </div>
                                <span style={{fontSize:'12px',fontWeight:700,color:'white'}}>@{m.displayName}</span>
                                {m._isSelf
                                    ? <span style={{fontSize:'10px',color:'#6b7280'}}>{lang==='ar'?'(أنت)':'(you)'}</span>
                                    : <FamilyRoleBadge role={getFamilyRole(family, m.id)} lang={lang} small />
                                }
                            </div>
                        ))}
                    </div>
                )}

                {/* Input bar */}
                <div style={{padding:'10px 12px', borderTop:'1px solid rgba(255,255,255,0.07)', background:'rgba(0,0,0,0.3)', display:'flex', gap:'8px', alignItems:'center', flexShrink:0}}>
                    {/* زر الهدايا — لو ضغطت بدون تحديد عضو = إرسال لنفسك */}
                    {onSendGift && (
                        <button
                            onClick={() => setShowFamilyChatGift(true)}
                            title={lang==='ar'?'أرسل هدية لعضو':'Send gift to member'}
                            style={{
                                width:'38px', height:'38px', borderRadius:'10px', flexShrink:0,
                                background:'rgba(255,215,0,0.1)', border:'1px solid rgba(255,215,0,0.22)',
                                fontSize:'17px', cursor:'pointer',
                                display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s',
                            }}
                            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,215,0,0.2)';}}
                            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,215,0,0.1)';}}
                        >🎁</button>
                    )}
                    <input
                        ref={chatInputRef}
                        value={chatInput}
                        onChange={handleChatInputChange}
                        onKeyDown={e => {
                            if (e.key === 'Escape') { setShowMentionList(false); }
                            if (e.key === 'Enter' && !e.shiftKey && !showMentionList) sendChatMessage();
                        }}
                        maxLength={300}
                        style={{...S.input, flex:1, padding:'9px 12px', fontSize:'12px'}}
                        placeholder={canManage
                            ? (lang==='ar'?'اكتب رسالة... أو @ للمنشن':'Type a message... @ to mention')
                            : (lang==='ar'?'اكتب رسالة... أو @ للمنشن':'Type a message... @ to mention')
                        }
                    />
                    <button onClick={sendChatMessage} disabled={!chatInput.trim()||sendingMsg}
                        style={{width:'38px', height:'38px', borderRadius:'10px', border:'none', flexShrink:0, background:chatInput.trim()?'linear-gradient(135deg,#00f2ff,#7000ff)':'rgba(255,255,255,0.06)', color:chatInput.trim()?'white':'#4b5563', fontSize:'16px', cursor:chatInput.trim()?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        {sendingMsg ? '⏳' : '➤'}
                    </button>
                </div>

                {/* Gift modal للشات — مع دعم الإرسال لنفسك أو لعضو محدد */}
                {showFamilyChatGift && onSendGift && (
                    <SendGiftModal
                        show={!!showFamilyChatGift}
                        onClose={() => setShowFamilyChatGift(false)}
                        targetUser={
                            typeof showFamilyChatGift === 'object' && showFamilyChatGift.targetUID
                                ? { uid: showFamilyChatGift.targetUID, displayName: showFamilyChatGift.targetName, photoURL: showFamilyChatGift.targetPhoto }
                                : (userData || currentUserData) // إرسال لنفسك
                        }
                        currentUser={userData || currentUserData}
                        lang={lang}
                        onSendGift={async (gift, target, qty) => {
                            if (target && target.uid) {
                                // لو المستهدف هو نفس المستخدم الحالي — إرسال للنفس
                                if (target.uid === currentUID) {
                                    await onSendGift(gift, target, qty || 1);
                                } else {
                                    // إرسال لعضو محدد
                                    const targetDoc = await usersCollection.doc(target.uid).get().catch(()=>null);
                                    if (targetDoc && targetDoc.exists) {
                                        await onSendGift(gift, { uid: target.uid, ...targetDoc.data() }, qty || 1);
                                    }
                                }
                            }
                            setShowFamilyChatGift(false);
                        }}
                        currency={(userData || currentUserData)?.currency || 0}
                        friendsData={familyMembers.filter(m => m.id !== currentUID).map(m => ({ ...m, uid: m.id }))}
                    />
                )}
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
        const myRole = getFamilyRole(family, currentUID);
        const canManage = myRole === 'owner' || myRole === 'admin';

        const sorted = [...familyMembers].sort((a, b) => {
            const aD = donations[a.id] || {};
            const bD = donations[b.id] || {};
            let aV, bV;
            if (donationSort === 'intel') {
                aV = aD.totalIntel || aD.total || 0;
                bV = bD.totalIntel || bD.total || 0;
            } else {
                aV = (actData[a.id]?.weekly || 0);
                bV = (actData[b.id]?.weekly || 0);
            }
            const aOwner = getFamilyRole(family, a.id) === 'owner' ? 1 : 0;
            const bOwner = getFamilyRole(family, b.id) === 'owner' ? 1 : 0;
            if (aOwner !== bOwner) return bOwner - aOwner;
            return bV - aV;
        }).filter(m => !memberSearch || m.displayName?.toLowerCase().includes(memberSearch.toLowerCase()));

        return (
            <div style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0}}>
                {/* Header */}
                <div style={{padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0}}>
                    {/* Search + member count */}
                    <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px'}}>
                        <div style={{flex:1, display:'flex', alignItems:'center', gap:'6px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'5px 10px'}}>
                            <span style={{fontSize:'13px'}}>🔍</span>
                            <input value={memberSearch} onChange={e=>setMemberSearch(e.target.value)}
                                style={{flex:1, background:'transparent', border:'none', outline:'none', color:'white', fontSize:'11px'}}
                                placeholder={lang==='ar'?'بحث...':'Search...'} />
                        </div>
                        <span style={{fontSize:'10px', color:'#6b7280', fontWeight:700, flexShrink:0}}>
                            {family.members?.length||0}/{getFamilyLevel(family.xp||0).maxMembers}
                        </span>
                    </div>
                    {/* Tab buttons */}
                    <div style={{display:'flex', gap:'6px'}}>
                        <button onClick={()=>setDonationSort('intel')} style={{flex:1, padding:'5px', borderRadius:'8px', border:`1px solid ${donationSort==='intel'?'rgba(0,242,255,0.4)':'rgba(255,255,255,0.07)'}`, background:donationSort==='intel'?'rgba(0,242,255,0.1)':'transparent', color:donationSort==='intel'?'#00f2ff':'#6b7280', fontSize:'10px', fontWeight:donationSort==='intel'?800:500, cursor:'pointer'}}>
                            🧠 {lang==='ar'?'التبرعات':'Donations'}
                        </button>
                        <button onClick={()=>setDonationSort('activity')} style={{flex:1, padding:'5px', borderRadius:'8px', border:`1px solid ${donationSort==='activity'?'rgba(251,191,36,0.4)':'rgba(255,255,255,0.07)'}`, background:donationSort==='activity'?'rgba(251,191,36,0.1)':'transparent', color:donationSort==='activity'?'#fbbf24':'#6b7280', fontSize:'10px', fontWeight:donationSort==='activity'?800:500, cursor:'pointer'}}>
                            ⚡ {lang==='ar'?'الاكتيفيتي':'Activity'}
                        </button>
                    </div>
                </div>

                {/* List */}
                <div style={{flex:1, overflowY:'auto'}} onClick={()=>gearMenuUid&&setGearMenuUid(null)}>
                    {sorted.map((m, i) => {
                        const role = getFamilyRole(family, m.id);
                        const rCfg = FAMILY_ROLE_CONFIG[role];
                        const don  = donations[m.id] || {};
                        const act  = actData[m.id]   || {};

                        // donation tab values
                        const weeklyDon = don.weeklyIntel || don.weekly || 0;
                        const totalDon  = don.totalIntel  || don.total  || 0;
                        // activity tab values
                        const weeklyAct = act.weekly || 0;
                        const totalAct  = act.total  || 0;

                        const isTop3 = i < 3;
                        const topColors = ['rgba(255,215,0,0.06)','rgba(192,192,192,0.04)','rgba(205,127,50,0.04)'];
                        const isGearOpen = gearMenuUid === m.id;

                        // Can current user manage this member?
                        const targetRole = getFamilyRole(family, m.id);
                        const canKick = canManage && m.id !== currentUID && targetRole !== 'owner' && !(myRole === 'admin' && targetRole === 'admin');
                        const canSetAdmin = myRole === 'owner' && m.id !== currentUID && targetRole !== 'owner';
                        const canSetMod = canManage && m.id !== currentUID && targetRole !== 'owner' && !(myRole === 'admin' && targetRole === 'admin');
                        const showGear = canKick || canSetAdmin || canSetMod;

                        return (
                            <div key={m.id} style={{position:'relative', display:'flex', alignItems:'center', padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,0.04)', background:isTop3?topColors[i]:'transparent'}}>
                                {/* Rank */}
                                <div style={{width:'20px', textAlign:'center', fontSize:'11px', color:i===0?'#ffd700':i===1?'#9ca3af':i===2?'#fb923c':'#4b5563', fontWeight:800, marginRight:'8px', flexShrink:0}}>
                                    {i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`}
                                </div>
                                {/* Avatar */}
                                <div style={{position:'relative', flexShrink:0, marginRight:'10px'}}>
                                    <div style={{width:'40px', height:'40px', borderRadius:'50%', border:`2px solid ${rCfg.color}66`, overflow:'hidden', background:'rgba(255,255,255,0.08)'}}>
                                        {m.photoURL ? <img src={m.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>😎</div>}
                                    </div>
                                    {role==='owner' && <div style={{position:'absolute', top:'-4px', right:'-4px', fontSize:'10px'}}>👑</div>}
                                </div>
                                {/* Name + role */}
                                <div style={{flex:1, minWidth:0}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'5px', marginBottom:'2px'}}>
                                        <span style={{fontSize:'12px', fontWeight:800, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'90px'}}>{m.displayName}</span>
                                        {signData.level > 0 && <FamilySignBadge tag={family.tag} color={signData.color} small signLevel={signData.level} imageURL={family.signImageURL} />}
                                    </div>
                                    <FamilyRoleBadge role={role} lang={lang} small />
                                </div>
                                {/* Stats */}
                                <div style={{textAlign:'right', flexShrink:0, marginRight: showGear ? '6px' : '0'}}>
                                    {donationSort === 'intel' ? (
                                        <div style={{display:'flex', flexDirection:'column', gap:'2px', alignItems:'flex-end'}}>
                                            <div style={{display:'flex', alignItems:'center', gap:'4px'}}>
                                                <span style={{fontSize:'8px', color:'#6b7280'}}>W</span>
                                                <span style={{fontSize:'11px', fontWeight:800, color:'#00f2ff'}}>{fmtFamilyNum(weeklyDon)}🧠</span>
                                            </div>
                                            <div style={{display:'flex', alignItems:'center', gap:'4px'}}>
                                                <span style={{fontSize:'8px', color:'#6b7280'}}>T</span>
                                                <span style={{fontSize:'11px', fontWeight:800, color:'#fbbf24'}}>{fmtFamilyNum(totalDon)}🧠</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{display:'flex', flexDirection:'column', gap:'2px', alignItems:'flex-end'}}>
                                            <div style={{display:'flex', alignItems:'center', gap:'4px'}}>
                                                <span style={{fontSize:'8px', color:'#6b7280'}}>W</span>
                                                <span style={{fontSize:'11px', fontWeight:800, color:'#fbbf24'}}>⚡{fmtFamilyNum(weeklyAct)}</span>
                                            </div>
                                            <div style={{display:'flex', alignItems:'center', gap:'4px'}}>
                                                <span style={{fontSize:'8px', color:'#6b7280'}}>T</span>
                                                <span style={{fontSize:'11px', fontWeight:800, color:'#a78bfa'}}>∑{fmtFamilyNum(totalAct)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Gear button */}
                                {showGear && (
                                    <div style={{position:'relative', flexShrink:0}}>
                                        <button
                                            onClick={e=>{ e.stopPropagation(); setGearMenuUid(isGearOpen ? null : m.id); }}
                                            style={{width:'28px', height:'28px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#9ca3af', fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1}}
                                        >⚙️</button>
                                        {/* Gear dropdown */}
                                        {isGearOpen && (
                                            <div onClick={e=>e.stopPropagation()} style={{position:'absolute', top:'32px', right:0, zIndex:50, background:'#0f1628', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'12px', padding:'6px', minWidth:'140px', boxShadow:'0 8px 32px rgba(0,0,0,0.6)'}}>
                                                {/* Role options */}
                                                {canSetAdmin && targetRole !== 'admin' && (
                                                    <button onClick={()=>setMemberRole(m.id,'admin')} style={{width:'100%', padding:'7px 10px', borderRadius:'8px', background:'transparent', border:'none', color:'#ef4444', fontSize:'11px', fontWeight:700, cursor:'pointer', textAlign:'right', display:'flex', alignItems:'center', gap:'6px'}}
                                                        onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                                                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                                                        🛡️ {lang==='ar'?'ترقية لأدمن':'Set Admin'}
                                                    </button>
                                                )}
                                                {canSetMod && targetRole !== 'moderator' && (
                                                    <button onClick={()=>setMemberRole(m.id,'moderator')} style={{width:'100%', padding:'7px 10px', borderRadius:'8px', background:'transparent', border:'none', color:'#3b82f6', fontSize:'11px', fontWeight:700, cursor:'pointer', textAlign:'right', display:'flex', alignItems:'center', gap:'6px'}}
                                                        onMouseEnter={e=>e.currentTarget.style.background='rgba(59,130,246,0.1)'}
                                                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                                                        🔰 {lang==='ar'?'ترقية لمشرف':'Set Mod'}
                                                    </button>
                                                )}
                                                {(targetRole === 'admin' || targetRole === 'moderator') && canSetAdmin && (
                                                    <button onClick={()=>setMemberRole(m.id,'member')} style={{width:'100%', padding:'7px 10px', borderRadius:'8px', background:'transparent', border:'none', color:'#6b7280', fontSize:'11px', fontWeight:700, cursor:'pointer', textAlign:'right', display:'flex', alignItems:'center', gap:'6px'}}
                                                        onMouseEnter={e=>e.currentTarget.style.background='rgba(107,114,128,0.1)'}
                                                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                                                        👤 {lang==='ar'?'تخفيض لعضو':'Set Member'}
                                                    </button>
                                                )}
                                                {/* Divider */}
                                                {canKick && <div style={{height:'1px', background:'rgba(255,255,255,0.07)', margin:'4px 0'}}/>}
                                                {canKick && (
                                                    <button onClick={()=>{ kickMember(m.id); setGearMenuUid(null); }} style={{width:'100%', padding:'7px 10px', borderRadius:'8px', background:'transparent', border:'none', color:'#f87171', fontSize:'11px', fontWeight:700, cursor:'pointer', textAlign:'right', display:'flex', alignItems:'center', gap:'6px'}}
                                                        onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                                                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                                                        🚫 {lang==='ar'?'طرد من القبيلة':'Kick'}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
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

        // ── دالة Claim للمهمة ──
        const claimTask = async (task) => {
            const key = `${task.id}_${currentUID}`;
            const prog = taskProgress[key] || { current: 0, claimed: false };
            const isDone = prog.current >= task.target;
            if (!isDone || prog.claimed || !family?.id) return;
            try {
                const r = task.reward;
                await familiesCollection.doc(family.id).update({
                    [`taskProgress.${key}.claimed`]: true,
                    xp:          firebase.firestore.FieldValue.increment(r.xp || 0),
                    activeness:  firebase.firestore.FieldValue.increment((r.xp || 0) * 2),
                    weeklyActiveness: firebase.firestore.FieldValue.increment((r.xp || 0) * 2),
                    familyCoins: firebase.firestore.FieldValue.increment(r.coins || 0),
                });
                await usersCollection.doc(currentUID).update({
                    currency: firebase.firestore.FieldValue.increment(r.intel || r.amount || 0),
                });
                onNotification(`✅ +${r.intel||r.amount||0}🧠 +${r.xp||0}XP +${r.coins||0}${FAMILY_COINS_SYMBOL}`);
            } catch(e) {}
        };

        // ── دالة Daily Check-in (ft4) ──
        const handleCheckIn = async () => {
            if (!family?.id || !currentUID) return;
            const key = `ft4_${currentUID}`;
            const prog = taskProgress[key] || { current: 0, claimed: false, lastCheckIn: null };
            const today = new Date().toDateString();
            const lastCheck = prog.lastCheckIn;
            if (lastCheck === today) {
                onNotification(lang === 'ar' ? '✅ سجّلت حضورك اليوم!' : '✅ Already checked in today!');
                return;
            }
            try {
                await familiesCollection.doc(family.id).update({
                    [`taskProgress.${key}.current`]: 1,
                    [`taskProgress.${key}.lastCheckIn`]: today,
                    [`taskProgress.${key}.claimed`]: false,
                    activeness: firebase.firestore.FieldValue.increment(50),
                    weeklyActiveness: firebase.firestore.FieldValue.increment(50),
                });
                onNotification(lang === 'ar' ? '✅ تم تسجيل الحضور!' : '✅ Checked in!');
            } catch(e) {}
        };

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

                {/* ── تعليمة المهام ── */}
                <div style={{fontSize:'10px', color:'#6b7280', textAlign:'center', padding:'4px', background:'rgba(255,255,255,0.03)', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.06)'}}>
                    {lang==='ar'
                        ? '📌 المهام شخصية — كل عضو يكمّل مهامه بشكل منفصل'
                        : '📌 Tasks are personal — each member tracks their own progress'}
                </div>

                {FAMILY_TASKS_CONFIG.map(task => {
                    const key = `${task.id}_${currentUID}`;
                    const prog = taskProgress[key] || { current: 0, claimed: false };

                    // Daily task reset logic
                    const today = new Date().toDateString();
                    const isDaily = task.daily;
                    const isDailyDone = isDaily && prog.lastCheckIn === today && prog.current >= task.target;
                    const effectiveProg = isDaily && prog.lastCheckIn !== today ? { current: 0, claimed: false } : prog;

                    const pct = Math.min(100, Math.round((effectiveProg.current / task.target) * 100));
                    const isDone = effectiveProg.current >= task.target;
                    const isClaimed = effectiveProg.claimed;

                    // ft4 special check-in state
                    const isFt4 = task.id === 'ft4';
                    const alreadyCheckedIn = isFt4 && prog.lastCheckIn === today;

                    return (
                        <div key={task.id} style={{...S.card, border:`1px solid ${isClaimed?'rgba(16,185,129,0.25)':isDone?'rgba(0,242,255,0.2)':'rgba(255,255,255,0.07)'}`}}>
                            <div style={{display:'flex', alignItems:'flex-start', gap:'10px'}}>
                                <div style={{width:'42px', height:'42px', borderRadius:'12px', background:isClaimed?'rgba(16,185,129,0.15)':isDone?'rgba(0,242,255,0.12)':'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0, border:`1px solid ${isClaimed?'rgba(16,185,129,0.3)':isDone?'rgba(0,242,255,0.3)':'rgba(255,255,255,0.08)'}`}}>
                                    {isClaimed ? '✅' : isDone ? '🎯' : task.icon}
                                </div>
                                <div style={{flex:1, minWidth:0}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'5px', marginBottom:'2px'}}>
                                        <div style={{fontSize:'12px', fontWeight:700, color:isClaimed?'#10b981':isDone?'#00f2ff':'#e2e8f0'}}>
                                            {lang==='ar' ? task.title_ar : task.title_en}
                                        </div>
                                        {isDaily && (
                                            <span style={{fontSize:'8px', fontWeight:800, color:'#f97316', background:'rgba(249,115,22,0.15)', border:'1px solid rgba(249,115,22,0.3)', padding:'1px 5px', borderRadius:'6px'}}>
                                                {lang==='ar'?'يومي':'DAILY'}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{fontSize:'10px', color:'#6b7280', marginBottom:'6px'}}>{lang==='ar' ? task.sub_ar : task.sub_en}</div>
                                    {!isClaimed && (
                                        <div>
                                            <div style={{display:'flex', justifyContent:'space-between', fontSize:'9px', color:'#4b5563', marginBottom:'3px'}}>
                                                <span>{effectiveProg.current}/{task.target}</span>
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
                                    {/* ft4 check-in button */}
                                    {isFt4 ? (
                                        <button
                                            onClick={alreadyCheckedIn ? () => {} : handleCheckIn}
                                            style={{...S.btn, padding:'5px 10px', fontSize:'10px',
                                                background: isClaimed?'rgba(16,185,129,0.15)':alreadyCheckedIn&&!isClaimed?'linear-gradient(135deg,#00f2ff,#7000ff)':isDone?'linear-gradient(135deg,#00f2ff,#7000ff)':'rgba(249,115,22,0.2)',
                                                color: isClaimed?'#10b981':alreadyCheckedIn||isDone?'white':'#f97316',
                                                cursor: isClaimed?'not-allowed':'pointer',
                                                border: isClaimed?'none':alreadyCheckedIn||isDone?'none':'1px solid rgba(249,115,22,0.4)',
                                            }}>
                                            {isClaimed?(lang==='ar'?'تم':'Done'):alreadyCheckedIn?(lang==='ar'?'اجمع':'Claim'):(lang==='ar'?'تسجيل':'Check-in')}
                                        </button>
                                    ) : (
                                        <button
                                            disabled={isClaimed || !isDone}
                                            onClick={() => claimTask(task)}
                                            style={{...S.btn, padding:'5px 12px', fontSize:'11px', background:isClaimed?'rgba(16,185,129,0.15)':isDone?'linear-gradient(135deg,#00f2ff,#7000ff)':'rgba(255,255,255,0.06)', color:isClaimed?'#10b981':isDone?'white':'#4b5563', cursor:isDone&&!isClaimed?'pointer':'not-allowed', border:'none'}}>
                                            {isClaimed ? (lang==='ar'?'تم':'Done') : isDone ? (lang==='ar'?'اجمع':'Claim') : (lang==='ar'?'ابدأ':'Go')}
                                        </button>
                                    )}
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
        const openFamilyById = (fid) => {
            if (!fid) return;
            // لو القبيلة دي قبيلتي افتح المودال على profile
            if (fid === family?.id) { setActiveTab('profile'); return; }
            // غير كده افتحها كـ viewFamilyId — نستخدم callback من الـ parent
            if (typeof window !== 'undefined') {
                // نعمل مودال مؤقت بـ viewFamilyId
                const evt = new CustomEvent('openFamilyById', { detail: { familyId: fid } });
                window.dispatchEvent(evt);
            }
        };
        return (
            <div style={{flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:'10px'}}>
                <div style={S.sectionTitle}>🏆 {lang==='ar'?'ترتيب العائلات':'Family Rankings'}</div>
                <FamilyRankingInline lang={lang} currentFamilyId={family?.id} onOpenFamily={openFamilyById} />
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
                            ? <input value={editName} onChange={e=>setEditName(e.target.value)} maxLength={10} style={S.input} />
                            : <div style={{...S.input, color:'#d1d5db', cursor:'default'}}>{family.name}</div>
                        }
                    </div>
                    <div style={{marginBottom:'8px'}}>
                        <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'4px'}}>🏷️ {lang==='ar'?'وسم القبيلة (Tag)':'Family Tag'}</div>
                        {canManage ? (
                            <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                                <input
                                    value={editTag}
                                    onChange={e=>setEditTag(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5))}
                                    maxLength={5}
                                    style={{...S.input, flex:1, letterSpacing:'3px', fontWeight:800, color:'#00f2ff', fontSize:'14px'}}
                                    placeholder='TAG'
                                />
                                <button onClick={saveTag} disabled={savingTag || !editTag.trim()} style={{...S.btn, padding:'8px 14px', fontSize:'11px', background:'rgba(0,242,255,0.15)', border:'1px solid rgba(0,242,255,0.3)', color:'#00f2ff', flexShrink:0}}>
                                    {savingTag ? '⏳' : (lang==='ar'?'حفظ':'Save')}
                                </button>
                            </div>
                        ) : (
                            <div style={{...S.input, color:'#00f2ff', cursor:'default', letterSpacing:'3px', fontWeight:800}}>{family.tag}</div>
                        )}
                        <div style={{fontSize:'9px', color:'#4b5563', marginTop:'3px'}}>
                            {lang==='ar'?'3-5 أحرف إنجليزية أو أرقام':'3-5 English letters or numbers'}
                        </div>
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

                {/* ── Family Sign — Weekly Activeness System ── */}
                <div style={S.card}>
                    <div style={S.sectionTitle}>🏴 {lang==='ar'?'شارة القبيلة':'Family Sign'}</div>

                    {/* Overview header */}
                    <div style={{marginBottom:'12px'}}>
                        <div style={{fontSize:'22px', fontWeight:900, color:'#00f2ff', marginBottom:'2px'}}>
                            {fmtFamilyNum(family.weeklyActiveness || 0)}
                        </div>
                        <div style={{fontSize:'10px', color:'#6b7280'}}>
                            {lang==='ar'
                                ? 'النشاط الأسبوعي (يُصفَّر كل أحد 0:00 GMT+3)'
                                : 'Weekly Activeness (Clears every Sunday at 0:00 GMT+3)'}
                        </div>
                    </div>

                    {/* 5 sign levels */}
                    <div style={{display:'flex', flexDirection:'column', gap:'8px', marginBottom:'14px'}}>
                        {FAMILY_SIGN_LEVELS.map(sl => {
                            const slImg = getFamilySignImage(sl.level);
                            const wAct = family.weeklyActiveness || 0;
                            const isEarned = wAct >= sl.threshold;
                            const isCurrent = signData && signData.level === sl.level;
                            const isNext = signData ? sl.level === signData.level + 1 : sl.level === 1;
                            return (
                                <div key={sl.level} style={{
                                    display:'flex', alignItems:'center', gap:'10px',
                                    padding:'10px 12px', borderRadius:'12px',
                                    background: isCurrent
                                        ? `linear-gradient(135deg,${sl.color}22,${sl.color}10)`
                                        : isEarned ? `${sl.color}10` : 'rgba(255,255,255,0.03)',
                                    border:`1px solid ${isCurrent ? sl.color+'66' : isEarned ? sl.color+'30' : 'rgba(255,255,255,0.07)'}`,
                                    position:'relative', overflow:'hidden',
                                }}>
                                    {/* Sign image or placeholder */}
                                    <div style={{
                                        width:'44px', height:'44px', borderRadius:'10px', flexShrink:0, overflow:'hidden',
                                        background: isEarned ? sl.bg : 'rgba(255,255,255,0.04)',
                                        border:`1px solid ${isEarned ? sl.color+'44' : 'rgba(255,255,255,0.08)'}`,
                                        display:'flex', alignItems:'center', justifyContent:'center',
                                        filter: isEarned ? 'none' : 'grayscale(1) opacity(0.4)',
                                    }}>
                                        {slImg
                                            ? <img src={slImg} style={{width:'100%',height:'100%',objectFit:'contain'}} alt=""/>
                                            : <span style={{fontSize:'22px'}}>{sl.defaultIcon}</span>
                                        }
                                    </div>
                                    <div style={{flex:1, minWidth:0}}>
                                        <div style={{fontSize:'12px', fontWeight:800, color: isEarned ? sl.color : '#4b5563'}}>
                                            {lang==='ar' ? sl.name_ar : sl.name_en}
                                        </div>
                                        <div style={{fontSize:'10px', color:'#6b7280', marginTop:'1px'}}>
                                            {lang==='ar' ? 'النشاط المطلوب:' : 'Required Activeness:'}&nbsp;
                                            <span style={{color: isEarned ? '#4ade80' : sl.color, fontWeight:700}}>
                                                {sl.threshold.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Status badge */}
                                    {isCurrent && (
                                        <div style={{
                                            fontSize:'9px', fontWeight:800, padding:'3px 8px', borderRadius:'20px',
                                            background:`${sl.color}25`, color:sl.color, border:`1px solid ${sl.color}50`,
                                            flexShrink:0,
                                        }}>✓ {lang==='ar'?'الحالي':'Current'}</div>
                                    )}
                                    {isNext && !isEarned && (
                                        <div style={{
                                            fontSize:'9px', fontWeight:800, padding:'3px 8px', borderRadius:'20px',
                                            background:'rgba(0,242,255,0.15)', color:'#00f2ff',
                                            border:'1px solid rgba(0,242,255,0.4)', flexShrink:0,
                                        }}>{lang==='ar'?'الأسبوع القادم':'Get next week'}</div>
                                    )}
                                    {isEarned && !isCurrent && (
                                        <div style={{fontSize:'16px', flexShrink:0}}>✅</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

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

                {/* ── Delete Family (Owner only) ── */}
                {getFamilyRole(family, currentUID) === 'owner' && (
                    <div style={{marginTop:'8px', paddingTop:'12px', borderTop:'1px solid rgba(255,255,255,0.04)'}}>
                        <button
                            onClick={() => setShowDeleteFamilyConfirm(true)}
                            style={{...S.btn, width:'100%', padding:'12px', background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.4)', color:'#ef4444', fontSize:'12px', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'}}>
                            🗑️ {lang==='ar'?'حذف العائلة نهائياً':'Delete Family Permanently'}
                        </button>
                        <div style={{fontSize:'10px', color:'#6b7280', textAlign:'center', marginTop:'4px'}}>
                            {lang==='ar'?'سيتم حذف العائلة وطرد جميع الأعضاء':'All members will be removed and family deleted'}
                        </div>
                    </div>
                )}

                {/* ── Delete Family Confirm Modal ── */}
                {showDeleteFamilyConfirm && (
                    <div style={{
                        position:'fixed', inset:0, zIndex: Z.OVERLAY,
                        background:'rgba(0,0,0,0.85)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        padding:'20px',
                    }} onClick={() => setShowDeleteFamilyConfirm(false)}>
                        <div style={{
                            background:'linear-gradient(135deg,#1a0808,#0f0505)',
                            border:'2px solid rgba(239,68,68,0.5)',
                            borderRadius:'20px', padding:'28px 24px',
                            maxWidth:'320px', width:'100%',
                            textAlign:'center',
                            boxShadow:'0 0 50px rgba(239,68,68,0.3)',
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{fontSize:'48px', marginBottom:'12px'}}>⚠️</div>
                            <div style={{fontSize:'16px', fontWeight:900, color:'#ef4444', marginBottom:'8px'}}>
                                {lang==='ar'?'حذف العائلة':'Delete Family'}
                            </div>
                            <div style={{fontSize:'12px', color:'#9ca3af', lineHeight:1.6, marginBottom:'6px'}}>
                                {lang==='ar'
                                    ? `هل أنت متأكد من حذف "${family?.name || ''}"؟ سيتم طرد جميع الأعضاء وحذف كل البيانات نهائياً.`
                                    : `Are you sure you want to delete "${family?.name || ''}"? All members will be removed and all data will be permanently deleted.`
                                }
                            </div>
                            <div style={{fontSize:'11px', color:'#ef4444', fontWeight:700, marginBottom:'20px', padding:'8px 12px', background:'rgba(239,68,68,0.08)', borderRadius:'8px', border:'1px solid rgba(239,68,68,0.2)'}}>
                                {lang==='ar'?'⚠️ هذا الإجراء لا يمكن التراجع عنه':'⚠️ This action cannot be undone'}
                            </div>
                            <div style={{display:'flex', gap:'10px'}}>
                                <button
                                    onClick={() => setShowDeleteFamilyConfirm(false)}
                                    style={{flex:1, padding:'10px', borderRadius:'10px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'#9ca3af', fontSize:'13px', fontWeight:700, cursor:'pointer'}}>
                                    {lang==='ar'?'إلغاء':'Cancel'}
                                </button>
                                <button
                                    onClick={handleDeleteFamily}
                                    disabled={deletingFamily}
                                    style={{flex:1, padding:'10px', borderRadius:'10px', background:'linear-gradient(135deg,#dc2626,#991b1b)', border:'1px solid rgba(239,68,68,0.5)', color:'white', fontSize:'13px', fontWeight:800, cursor:deletingFamily?'wait':'pointer', opacity:deletingFamily?0.7:1}}>
                                    {deletingFamily ? '⏳...' : `🗑️ ${lang==='ar'?'تأكيد الحذف':'Confirm Delete'}`}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                <input value={tribeName} onChange={e=>setFamilyName(e.target.value)} maxLength={10} style={S.input} placeholder={lang==='ar'?'اسم مميز...':'Unique name...'} />
            </div>
            <div>
                <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'6px'}}>🏷️ {lang==='ar'?'وسم العائلة * (حروف وأرقام، حتى 6)':'Family Tag * (letters & numbers, max 6)'}</div>
                <input value={tribeTag} onChange={e=>setFamilyTag(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5))} maxLength={5} style={{...S.input, letterSpacing:'3px', fontWeight:800, color:'#00f2ff', fontSize:'15px', border:'1px solid rgba(0,242,255,0.3)'}} placeholder='MYTAG' />
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
                                        {/* ── اسم القبيلة clickable يفتح الصفحة الرئيسية ── */}
                                        <span
                                            onClick={() => setActiveTab('profile')}
                                            style={{fontSize:'14px', fontWeight:900, color:'white', fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'120px', cursor:'pointer', transition:'color 0.2s'}}
                                            onMouseEnter={e => e.currentTarget.style.color='#00f2ff'}
                                            onMouseLeave={e => e.currentTarget.style.color='white'}
                                            title={lang==='ar'?'انتقل للصفحة الرئيسية':'Go to family home'}
                                        >
                                            {family.name}
                                        </span>
                                        {signData.level > 0 && <FamilySignBadge tag={family.tag} color={signData.color} small signLevel={signData.level} imageURL={family.signImageURL} />}
                                    </div>
                                    <div style={{fontSize:'9px', color:'#6b7280', display:'flex', alignItems:'center', gap:'6px'}}>
                                        <span>{fLvl?.icon} {lang==='ar'?`المستوى ${fLvl?.level}`:`Lv.${fLvl?.level}`}</span>
                                        <span>·</span>
                                        <span>👥 {family.members?.length||0} {lang==='ar'?'عضو':'members'}</span>
                                        {myRole && myRole !== 'owner' && <FamilyRoleBadge role={myRole} lang={lang} small />}
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
                                    {/* Unread badge for chat tab */}
                                    {tab.id==='chat' && family?.announcement && activeTab!=='chat' && (
                                        <span style={{position:'absolute', top:'4px', right:'6px', fontSize:'7px', background:'#f97316', color:'white', borderRadius:'50%', width:'14px', height:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900}}>📢</span>
                                    )}
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
                                {activeTab==='chat'     && renderChat()}
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
