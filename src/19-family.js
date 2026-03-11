// ════════════════════════════════════════════════════════
// 📸 FRIENDS MOMENTS MODAL
// 🏠 FAMILY SYSTEM — Complete Clan/Family System
// File: 19-family.js
// ════════════════════════════════════════════════════════

// ── Firestore Collections ──
const familiesCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('families');

// ════════════════════════════════════════════════════════
// ⚙️  FAMILY CONFIG — Levels, Tasks, Milestones
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

const ACTIVENESS_MILESTONES = [
    { threshold: 8000,   reward: 1,  icon: '🎁' },
    { threshold: 24000,  reward: 2,  icon: '🎁' },
    { threshold: 60000,  reward: 3,  icon: '🎁' },
    { threshold: 120000, reward: 5,  icon: '💎' },
    { threshold: 280000, reward: 10, icon: '👑' },
];

const FAMILY_TASKS_CONFIG = [
    { id:'ft1', title_en:'Voice Room Activity (0/20)',  title_ar:'نشاط غرفة الصوت (0/20)',  sub_en:'Participate 20+ mins in voice room', sub_ar:'شارك 20 دقيقة في غرفة الصوت', target:20,     reward:{ type:'star', amount:10,  icon:'⭐' } },
    { id:'ft2', title_en:'Gacha Expert (0/10)',         title_ar:'خبير الغاشا (0/10)',       sub_en:'Open the family gacha 10 times',      sub_ar:'افتح غاشا العائلة 10 مرات',  target:10,     reward:{ type:'coin', amount:50,  icon:'🪙' } },
    { id:'ft3', title_en:'Love Family (0/100,000)',     title_ar:'أحب عائلتك (0/100,000)',  sub_en:'Send 100,000 Gold in family group',   sub_ar:'أرسل 100,000 ذهب في المجموعة', target:100000, reward:{ type:'coin', amount:50,  icon:'🪙' } },
    { id:'ft4', title_en:'Daily Check-in',              title_ar:'تسجيل الحضور اليومي',     sub_en:'Check in to the family today',        sub_ar:'سجّل حضورك في العائلة اليوم', target:1,      reward:{ type:'star', amount:5,   icon:'⭐' } },
    { id:'ft5', title_en:'Family Games (0/5)',          title_ar:'ألعاب العائلة (0/5)',     sub_en:'Play 5 games with family members',    sub_ar:'العب 5 ألعاب مع أفراد العائلة', target:5,      reward:{ type:'coin', amount:30,  icon:'🪙' } },
];

// ── Role Config (matches site's ROLE_CONFIG) ──
const FAMILY_ROLE_CONFIG = {
    owner:     { label_en:'Owner',     label_ar:'المالك',  color:'#ffd700', bg:'rgba(255,215,0,0.18)',     border:'rgba(255,215,0,0.45)',     icon:'👑' },
    admin:     { label_en:'Admin',     label_ar:'أدمن',    color:'#ef4444', bg:'rgba(239,68,68,0.18)',      border:'rgba(239,68,68,0.45)',     icon:'🛡️' },
    moderator: { label_en:'Mod',       label_ar:'مشرف',    color:'#3b82f6', bg:'rgba(59,130,246,0.18)',     border:'rgba(59,130,246,0.45)',    icon:'🔰' },
    member:    { label_en:'Member',    label_ar:'عضو',     color:'#6b7280', bg:'rgba(107,114,128,0.12)',    border:'rgba(107,114,128,0.3)',    icon:'👤' },
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

// ── Role Badge Component ──
const FamilyRoleBadge = ({ role, lang, small = false }) => {
    const cfg = FAMILY_ROLE_CONFIG[role] || FAMILY_ROLE_CONFIG.member;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '2px',
            padding: small ? '1px 5px' : '2px 7px',
            borderRadius: '5px', fontSize: small ? '9px' : '10px',
            fontWeight: 800, fontStyle: 'italic',
            background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
            letterSpacing: '0.3px', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
            {cfg.icon} {lang === 'ar' ? cfg.label_ar : cfg.label_en}
        </span>
    );
};

// ── Family Sign Badge ──
const FamilySignBadge = ({ tag, color = '#7000ff', small = false }) => (
    <span style={{
        display: 'inline-block',
        padding: small ? '1px 5px' : '2px 7px',
        borderRadius: '5px', fontSize: small ? '8px' : '10px',
        fontWeight: 800, fontStyle: 'italic',
        background: `${color}30`, border: `1px solid ${color}60`,
        color: color, letterSpacing: '0.5px', whiteSpace: 'nowrap', flexShrink: 0,
    }}>
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

    useEffect(() => {
        if (!show || !currentUID) return;
        setLoading(true);
        const friendUIDs = (friendsData || []).map(f => f.id || f.uid).filter(Boolean);
        if (friendUIDs.length === 0) { setMoments([]); setLoading(false); return; }
        const chunks = [];
        for (let i = 0; i < friendUIDs.length; i += 10) chunks.push(friendUIDs.slice(i, i + 10));
        Promise.all(chunks.map(chunk =>
            momentsCollection.where('authorUID', 'in', chunk).orderBy('createdAt', 'desc').limit(30).get().catch(() => ({ docs: [] }))
        )).then(results => {
            const all = [];
            results.forEach(snap => snap.docs.forEach(d => all.push({ id: d.id, ...d.data() })));
            all.sort((a, b) => {
                const aT = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
                const bT = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
                return bT - aT;
            });
            setMoments(all.slice(0, 60));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [show, currentUID, friendsData?.length]);

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
                    background: 'linear-gradient(180deg,#0f0f1e,#0a0a14)', border: '1px solid rgba(0,242,255,0.2)',
                    borderRadius: '18px', width: '100%', maxWidth: '440px', maxHeight: '90vh',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.9)'
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
                                {moments.map(moment => (
                                    <div key={moment.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',overflow:'hidden',cursor:'pointer'}} onClick={()=>setSelectedMoment(moment)}>
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
                                        {moment.type==='image'&&moment.mediaUrl&&<div style={{maxHeight:'260px',overflow:'hidden'}}><img src={moment.mediaUrl} alt="" style={{width:'100%',objectFit:'cover',display:'block'}}/></div>}
                                        {moment.content&&<div style={{padding:'8px 12px 10px',fontSize:'12px',color:'#d1d5db',lineHeight:1.5}}>{moment.content}</div>}
                                        <div style={{padding:'6px 12px',borderTop:'1px solid rgba(255,255,255,0.05)',display:'flex',alignItems:'center',gap:'12px'}}>
                                            <span style={{fontSize:'11px',color:'#6b7280'}}>❤️ {moment.likes?.length||0}</span>
                                            <span style={{fontSize:'11px',color:'#6b7280'}}>💬 {moment.comments?.length||0}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {selectedMoment&&(
                    <div className="modal-overlay" onClick={()=>setSelectedMoment(null)} style={{zIndex:Z.MODAL_HIGH+1}}>
                        <div className="animate-pop" onClick={e=>e.stopPropagation()} style={{background:'#0a0a14',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'16px',maxWidth:'420px',width:'95%',overflow:'hidden',maxHeight:'85vh'}}>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
                                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                                    <div style={{width:'28px',height:'28px',borderRadius:'50%',overflow:'hidden',background:'rgba(255,255,255,0.1)'}}>
                                        {selectedMoment.authorPhoto?<img src={selectedMoment.authorPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:'14px'}}>😎</span>}
                                    </div>
                                    <div style={{fontSize:'12px',fontWeight:700,color:'white'}}>{selectedMoment.authorName}</div>
                                </div>
                                <button onClick={()=>setSelectedMoment(null)} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'18px',cursor:'pointer'}}>✕</button>
                            </div>
                            <div style={{overflowY:'auto',maxHeight:'70vh'}}>
                                {selectedMoment.type==='image'&&selectedMoment.mediaUrl&&<img src={selectedMoment.mediaUrl} alt="" style={{width:'100%',display:'block'}}/>}
                                {selectedMoment.content&&<div style={{padding:'12px 14px',fontSize:'13px',color:'#e2e8f0',lineHeight:1.6}}>{selectedMoment.content}</div>}
                                <div style={{padding:'8px 14px',fontSize:'11px',color:'#6b7280'}}>❤️ {selectedMoment.likes?.length||0}&nbsp;&nbsp;💬 {selectedMoment.comments?.length||0}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PortalModal>
    );
};

// ════════════════════════════════════════════════════════
// 🏠 FAMILY MODAL — Main Component
// ════════════════════════════════════════════════════════
const FamilyModal = ({ show, onClose, currentUser, currentUserData, currentUID, lang, isLoggedIn, onNotification }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [family, setFamily] = useState(null);
    const [loadingFamily, setLoadingFamily] = useState(true);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [newsLog, setNewsLog] = useState([]);
    const [donationSort, setDonationSort] = useState('gold'); // 'gold' | 'activity'
    const [memberSearch, setMemberSearch] = useState('');
    const [joinRequesterProfiles, setJoinRequesterProfiles] = useState([]);

    // Create/Join form state
    const [view, setView] = useState('home'); // 'home'|'create'|'search'
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
    const [savingAnn, setSavingAnn] = useState(false);

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
            } else {
                setFamily(null);
                usersCollection.doc(currentUID).update({ familyId: null, familyName: null, familyTag: null }).catch(() => {});
            }
            setLoadingFamily(false);
        }, () => setLoadingFamily(false));
        return () => unsub();
    }, [show, currentUID, currentUserData?.familyId]);

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
    // ACTIONS
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
                createdBy: currentUID,
                leaderName: currentUserData?.displayName || 'Leader',
                leaderPhoto: currentUserData?.photoURL || null,
                members: [currentUID],
                memberRoles: { [currentUID]: 'owner' },
                memberDonations: { [currentUID]: { weekly: 0, total: 0, weeklyActivity: 0, totalActivity: 0 } },
                level: 1, xp: 0,
                activeness: 0, weeklyActiveness: 0,
                treasury: 0, barrier: 0,
                activenessClaimedMilestones: [],
                taskProgress: {},
                joinRequests: [], isPrivate: false, weeklyRank: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
            });
            await usersCollection.doc(currentUID).update({
                currency: firebase.firestore.FieldValue.increment(-FAMILY_CREATE_COST),
                familyId: ref.id, familyName: tribeName.trim(), familyTag: cleanTag,
            });
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
            await familiesCollection.doc(familyId).update({
                members: firebase.firestore.FieldValue.arrayUnion(currentUID),
                xp: firebase.firestore.FieldValue.increment(10),
                [`memberRoles.${currentUID}`]: 'member',
                [`memberDonations.${currentUID}`]: { weekly: 0, total: 0, weeklyActivity: 0, totalActivity: 0 },
                lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
            });
            await usersCollection.doc(currentUID).update({ familyId, familyName: fd.name, familyTag: fd.tag });
            await postNews(familyId, 'join', lang === 'ar' ? `🎉 ${currentUserData?.displayName} انضم للعائلة!` : `🎉 ${currentUserData?.displayName} joined the family!`);
            onNotification(lang === 'ar' ? '✅ انضممت للعائلة!' : '✅ Joined family!');
        } catch (e) { onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
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
                const updRoles = { ...family.memberRoles };
                delete updRoles[currentUID];
                const updDons = { ...family.memberDonations };
                delete updDons[currentUID];
                await familiesCollection.doc(family.id).update({
                    members: firebase.firestore.FieldValue.arrayRemove(currentUID),
                    memberRoles: updRoles, memberDonations: updDons,
                });
                await postNews(family.id, 'leave', lang === 'ar' ? `${currentUserData?.displayName} غادر العائلة` : `${currentUserData?.displayName} left the family`);
            }
            await usersCollection.doc(currentUID).update({ familyId: null, familyName: null, familyTag: null });
            setFamily(null); setView('home'); setActiveTab('profile');
            onNotification(lang === 'ar' ? '👋 تركت العائلة' : '👋 Left family');
        } catch (e) { onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
    };

    const claimActiveMilestone = async (idx) => {
        if (!family?.id || !canManageFamily(family, currentUID)) return;
        try {
            await familiesCollection.doc(family.id).update({
                activenessClaimedMilestones: firebase.firestore.FieldValue.arrayUnion(idx),
                treasury: firebase.firestore.FieldValue.increment(ACTIVENESS_MILESTONES[idx].reward),
            });
            onNotification(`✅ +${ACTIVENESS_MILESTONES[idx].reward} ${lang === 'ar' ? 'للخزينة!' : 'to treasury!'}`);
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

    const handleJoinRequest = async (uid, accept) => {
        if (!family?.id) return;
        try {
            const updates = { joinRequests: firebase.firestore.FieldValue.arrayRemove(uid) };
            if (accept) {
                updates[`memberRoles.${uid}`] = 'member';
                updates[`memberDonations.${uid}`] = { weekly: 0, total: 0, weeklyActivity: 0, totalActivity: 0 };
                updates.members = firebase.firestore.FieldValue.arrayUnion(uid);
                updates.xp = firebase.firestore.FieldValue.increment(5);
                await familiesCollection.doc(family.id).update(updates);
                await usersCollection.doc(uid).update({ familyId: family.id, familyName: family.name, familyTag: family.tag });
                const p = joinRequesterProfiles.find(m => m.id === uid);
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
            await usersCollection.doc(uid).update({ familyId: null, familyName: null, familyTag: null });
            const m = familyMembers.find(fm => fm.id === uid);
            await postNews(family.id, 'leave', `${m?.displayName || 'Member'} ${lang === 'ar' ? 'تم طرده' : 'was kicked'}`);
            onNotification(lang === 'ar' ? '✅ تم الطرد' : '✅ Kicked');
        } catch (e) {}
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
        header: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0, background:'rgba(0,0,0,0.3)' },
        tabBar: { display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)', background:'rgba(0,0,0,0.2)', flexShrink:0, overflowX:'auto', scrollbarWidth:'none' },
        card: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'14px' },
        sectionTitle: { fontSize:'11px', fontWeight:800, color:'#00f2ff', textTransform:'uppercase', letterSpacing:'1px', paddingLeft:'10px', borderLeft:'3px solid #00f2ff', marginBottom:'12px' },
        input: { width:'100%', padding:'10px 13px', borderRadius:'10px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'white', fontSize:'13px', outline:'none', boxSizing:'border-box' },
        btn: { padding:'10px 18px', borderRadius:'10px', border:'none', fontWeight:800, fontSize:'12px', cursor:'pointer' },
        divider: { height:'1px', background:'rgba(255,255,255,0.06)', margin:'8px 0' },
    };

    const TABS = [
        { id:'profile', label_en:'Profile',  label_ar:'ملف' },
        { id:'members', label_en:'Members',  label_ar:'أعضاء' },
        { id:'tasks',   label_en:'Tasks',    label_ar:'مهام' },
        { id:'news',    label_en:'News',     label_ar:'أخبار' },
        { id:'manage',  label_en:'Manage',   label_ar:'إدارة' },
    ];

    const fLvl = family ? getFamilyLevel(family.xp || 0) : null;
    const fProg = family ? getFamilyLevelProgress(family.xp || 0) : 0;
    const myRole = family ? getFamilyRole(family, currentUID) : null;
    const canManage = family ? canManageFamily(family, currentUID) : false;

    // ─────────────────────────────────────────────
    // TAB: PROFILE
    // ─────────────────────────────────────────────
    const renderProfile = () => {
        if (!family || !fLvl) return null;
        const claimed = family.activenessClaimedMilestones || [];
        const weeklyAct = family.weeklyActiveness || 0;

        return (
            <div style={{flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:'12px'}}>

                {/* ── Family Hero ── */}
                <div style={{...S.card, background:`linear-gradient(135deg,rgba(0,242,255,0.06),rgba(112,0,255,0.06))`, border:`1px solid rgba(0,242,255,0.15)`}}>
                    <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
                        {/* Avatar */}
                        <div style={{position:'relative', flexShrink:0}}>
                            <div style={{width:'70px', height:'70px', borderRadius:'50%', border:`3px solid ${fLvl.color}`, padding:'3px', background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', boxShadow:`0 0 16px ${fLvl.color}44`}}>
                                {family.emblem || '🏠'}
                            </div>
                            {/* Level badge */}
                            <div style={{position:'absolute', bottom:'-4px', left:'50%', transform:'translateX(-50%)', background:`${fLvl.color}`, color:'#000', fontSize:'9px', fontWeight:900, padding:'1px 7px', borderRadius:'10px', whiteSpace:'nowrap'}}>
                                LV.{fLvl.level}
                            </div>
                        </div>
                        <div style={{flex:1, minWidth:0}}>
                            <div style={{display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap', marginBottom:'4px'}}>
                                <span style={{fontSize:'17px', fontWeight:900, color:'white', fontStyle:'italic', letterSpacing:'-0.5px'}}>{family.name}</span>
                                <FamilySignBadge tag={family.tag} color={fLvl.color} />
                            </div>
                            <div style={{fontSize:'10px', color:'#6b7280', marginBottom:'4px'}}>ID · {family.id?.slice(-6).toUpperCase()}</div>
                            <div style={{display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center'}}>
                                <span style={{fontSize:'10px', fontWeight:700, color:'#6b7280'}}>{lang==='ar'?fLvl.name_ar:fLvl.name_en}</span>
                                {family.weeklyRank && <span style={{fontSize:'10px', padding:'1px 8px', borderRadius:'20px', background:'rgba(255,140,0,0.2)', border:'1px solid rgba(255,140,0,0.4)', color:'#fb923c', fontWeight:700}}>🏅 #{family.weeklyRank}</span>}
                                <span style={{fontSize:'10px', color:'#6b7280'}}>👥 {family.members?.length||0}/{fLvl.maxMembers}</span>
                            </div>
                        </div>
                        {/* Weekly rank badge */}
                        {family.weeklyRank && (
                            <div style={{flexShrink:0, textAlign:'center', padding:'6px 10px', borderRadius:'10px', background:'rgba(255,140,0,0.15)', border:'1px solid rgba(255,140,0,0.3)'}}>
                                <div style={{fontSize:'16px', fontWeight:900, color:'#fb923c'}}>#{family.weeklyRank}</div>
                                <div style={{fontSize:'8px', color:'#6b7280'}}>{lang==='ar'?'ترتيب أسبوعي':'Weekly Rank'}</div>
                            </div>
                        )}
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

                {/* ── Activeness ── */}
                <div style={S.card}>
                    <div style={S.sectionTitle}>{lang==='ar'?'النشاط الأسبوعي':'Activeness'}</div>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'8px'}}>
                        <div>
                            <div style={{fontSize:'22px', fontWeight:900, color:'white', fontStyle:'italic'}}>{fmtFamilyNum(weeklyAct)}</div>
                            <div style={{fontSize:'9px', color:'#6b7280', marginTop:'2px'}}>{lang==='ar'?'يُعاد الأحد':'Refreshes Sunday'}</div>
                        </div>
                        <div style={{fontSize:'10px', color:'#6b7280', display:'flex', alignItems:'center', gap:'4px'}}>
                            🔥 {fmtFamilyNum(family.activeness||0)} / 37.5M
                        </div>
                    </div>
                    {/* Main progress bar */}
                    <div style={{height:'6px', borderRadius:'3px', background:'rgba(255,255,255,0.07)', overflow:'hidden', marginBottom:'14px'}}>
                        <div style={{height:'100%', borderRadius:'3px', background:'linear-gradient(90deg,#f97316,#fbbf24)', width:`${Math.min(100,((family.activeness||0)/37500000)*100)}%`, transition:'width 0.5s'}} />
                    </div>
                    {/* Milestones */}
                    <div style={{display:'flex', gap:'6px', justifyContent:'space-between'}}>
                        {ACTIVENESS_MILESTONES.map((m, i) => {
                            const reached = weeklyAct >= m.threshold;
                            const isClaimed = claimed.includes(i);
                            return (
                                <button key={i} onClick={()=>reached&&!isClaimed&&canManage&&claimActiveMilestone(i)}
                                    style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', padding:'8px 4px', borderRadius:'10px', border:`1px solid ${isClaimed?'rgba(16,185,129,0.4)':reached?'rgba(249,115,22,0.5)':'rgba(255,255,255,0.06)'}`, background:isClaimed?'rgba(16,185,129,0.12)':reached?'rgba(249,115,22,0.1)':'rgba(255,255,255,0.02)', cursor:reached&&!isClaimed&&canManage?'pointer':'default', transition:'all 0.2s', opacity:!reached&&!isClaimed?0.4:1}}>
                                    <span style={{fontSize:'18px', filter:!reached&&!isClaimed?'grayscale(1)':'none'}}>{m.icon}</span>
                                    <span style={{fontSize:'8px', fontWeight:700, color:isClaimed?'#10b981':reached?'#fb923c':'#6b7280'}}>{fmtFamilyNum(m.threshold)}</span>
                                    {isClaimed && <span style={{fontSize:'8px', color:'#10b981'}}>✓</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Treasury ── */}
                <div style={S.card}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
                        <div style={S.sectionTitle}>{lang==='ar'?'الخزينة':'Treasury'}</div>
                        <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'10px'}}>
                            <span style={{color:'#6b7280', display:'flex', alignItems:'center', gap:'3px'}}>🛡️ {lang==='ar'?'حاجز:':'Barrier:'} <span style={{color:'#22d3ee', fontWeight:700}}>{fmtFamilyNum(family.barrier||0)}</span></span>
                            <div style={{padding:'3px 10px', borderRadius:'8px', background:'rgba(255,215,0,0.1)', border:'1px solid rgba(255,215,0,0.3)', color:'#ffd700', fontWeight:800, fontStyle:'italic'}}>
                                🪙 {fmtFamilyNum(family.treasury||0)}
                            </div>
                        </div>
                    </div>
                    <div style={{display:'flex', gap:'8px', justifyContent:'space-around'}}>
                        {[0,1,2,3,4].map(i => {
                            const unlocked = i < Math.floor((family.treasury||0) / 1000) + 1;
                            return (
                                <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px'}}>
                                    <div style={{width:'44px', height:'44px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', background:unlocked?'rgba(255,215,0,0.12)':'rgba(255,255,255,0.03)', border:`1px solid ${unlocked?'rgba(255,215,0,0.3)':'rgba(255,255,255,0.06)'}`, filter:!unlocked?'grayscale(1)':'none', opacity:!unlocked?0.4:1}}>
                                        {i===0?'🗝️':i===1?'💰':i===2?'🎁':i===3?'💎':'👑'}
                                    </div>
                                    <span style={{fontSize:'8px', color:unlocked?'#ffd700':'#4b5563', fontWeight:700}}>{unlocked?(lang==='ar'?'مفتوح':'Unlocked'):(lang==='ar'?'مغلق':'Locked')}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Announcement ── */}
                <div style={S.card}>
                    <div style={S.sectionTitle}>📢 {lang==='ar'?'الإعلان':'Announcement'}</div>
                    {family.announcement ? (
                        <div style={{fontSize:'12px', color:'#d1d5db', lineHeight:1.7, direction:'auto', padding:'4px 0'}} dir={/[\u0600-\u06FF]/.test(family.announcement)?'rtl':'ltr'}>
                            {family.announcement}
                        </div>
                    ) : (
                        <div style={{fontSize:'11px', color:'#4b5563', textAlign:'center', padding:'8px'}}>{lang==='ar'?'لا يوجد إعلان':'No announcement yet'}</div>
                    )}
                </div>

                {/* ── Leave button ── */}
                <button onClick={leaveFamily} style={{...S.btn, background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', width:'100%', marginTop:'4px'}}>
                    🚪 {lang==='ar'?'مغادرة العائلة':'Leave Family'}
                </button>
                <div style={{height:'12px'}} />
            </div>
        );
    };

    // ─────────────────────────────────────────────
    // TAB: MEMBERS
    // ─────────────────────────────────────────────
    const renderMembers = () => {
        if (!family) return null;
        const donations = family.memberDonations || {};
        const filtered = familyMembers.filter(m => !memberSearch || m.displayName?.toLowerCase().includes(memberSearch.toLowerCase()));

        const sorted = [...filtered].sort((a, b) => {
            const aD = donations[a.id] || {};
            const bD = donations[b.id] || {};
            if (donationSort === 'gold') return (bD.total || 0) - (aD.total || 0);
            return (bD.totalActivity || 0) - (aD.totalActivity || 0);
        });

        // Put owner first, then admins, then mods, then members
        const roleOrder = { owner: 0, admin: 1, moderator: 2, member: 3 };
        sorted.sort((a, b) => (roleOrder[getFamilyRole(family, a.id)] || 3) - (roleOrder[getFamilyRole(family, b.id)] || 3));

        return (
            <div style={{flex:1, overflowY:'auto', display:'flex', flexDirection:'column'}}>
                {/* Search + counter */}
                <div style={{padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0}}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.05)', borderRadius:'10px', padding:'8px 12px', border:'1px solid rgba(255,255,255,0.08)'}}>
                        <span style={{fontSize:'14px', color:'#6b7280'}}>🔍</span>
                        <input value={memberSearch} onChange={e=>setMemberSearch(e.target.value)} style={{flex:1, background:'transparent', border:'none', outline:'none', color:'white', fontSize:'12px'}} placeholder={lang==='ar'?'بحث...':'Search...'} />
                        <span style={{fontSize:'10px', color:'#6b7280', fontWeight:700}}>{family.members?.length||0}/{getFamilyLevel(family.xp||0).maxMembers}</span>
                    </div>
                    {/* Donation Sort Toggle */}
                    <div style={{display:'flex', gap:'6px', marginTop:'8px'}}>
                        {['gold','activity'].map(s => (
                            <button key={s} onClick={()=>setDonationSort(s)} style={{flex:1, padding:'6px', borderRadius:'8px', border:`1px solid ${donationSort===s?'rgba(0,242,255,0.4)':'rgba(255,255,255,0.07)'}`, background:donationSort===s?'rgba(0,242,255,0.1)':'transparent', color:donationSort===s?'#00f2ff':'#6b7280', fontSize:'11px', fontWeight:donationSort===s?800:500, cursor:'pointer'}}>
                                {s==='gold'?(lang==='ar'?'🪙 تبرع الذهب':'🪙 Gold Donation'):(lang==='ar'?'⚡ التبرع بالنشاط':'⚡ Activity')}
                            </button>
                        ))}
                        <div style={{display:'flex', alignItems:'center', fontSize:'9px', color:'#4b5563', fontWeight:700, gap:'8px', padding:'0 4px', whiteSpace:'nowrap', fontStyle:'italic'}}>
                            {lang==='ar'?'أسبوعي | إجمالي':'Weekly | Total'}
                        </div>
                    </div>
                </div>

                {/* Member List */}
                <div style={{flex:1, overflowY:'auto'}}>
                    {sorted.map((m, i) => {
                        const role = getFamilyRole(family, m.id);
                        const rCfg = FAMILY_ROLE_CONFIG[role];
                        const don = donations[m.id] || {};
                        const weekly = donationSort==='gold' ? (don.weekly||0) : (don.weeklyActivity||0);
                        const total  = donationSort==='gold' ? (don.total||0)  : (don.totalActivity||0);
                        const isTop3 = i < 3;
                        const topColors = ['rgba(255,215,0,0.06)','rgba(192,192,192,0.04)','rgba(205,127,50,0.04)'];
                        return (
                            <div key={m.id} style={{display:'flex', alignItems:'center', padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,0.04)', background:isTop3?topColors[i]:'transparent', transition:'background 0.2s'}}>
                                {/* Rank number */}
                                <div style={{width:'18px', textAlign:'center', fontSize:'10px', color:i===0?'#ffd700':i===1?'#9ca3af':i===2?'#fb923c':'#4b5563', fontWeight:800, marginRight:'8px', flexShrink:0}}>
                                    {i+1}
                                </div>
                                {/* Avatar + role ring */}
                                <div style={{position:'relative', flexShrink:0, marginRight:'10px'}}>
                                    <div style={{width:'46px', height:'46px', borderRadius:'50%', border:`2px solid ${rCfg.color}66`, overflow:'hidden', background:'rgba(255,255,255,0.08)'}}>
                                        {m.photoURL
                                            ? <img src={m.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                                            : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px'}}>😎</div>
                                        }
                                    </div>
                                    {role==='owner'&&<div style={{position:'absolute', top:'-4px', right:'-4px', fontSize:'12px'}}>👑</div>}
                                </div>
                                {/* Info */}
                                <div style={{flex:1, minWidth:0}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'5px', flexWrap:'wrap', marginBottom:'3px'}}>
                                        <span style={{fontSize:'13px', fontWeight:800, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100px', fontStyle:'italic'}}>{m.displayName}</span>
                                        <FamilySignBadge tag={family.tag} color={fLvl.color} small />
                                    </div>
                                    <FamilyRoleBadge role={role} lang={lang} small />
                                </div>
                                {/* Donations */}
                                <div style={{display:'flex', gap:'12px', textAlign:'right', flexShrink:0}}>
                                    <span style={{fontSize:'11px', fontWeight:900, color:'#6b7280', fontStyle:'italic', minWidth:'32px'}}>{fmtFamilyNum(weekly)}</span>
                                    <span style={{fontSize:'11px', fontWeight:900, color:'#e2e8f0', fontStyle:'italic', minWidth:'40px'}}>{fmtFamilyNum(total)}</span>
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
        const coinBalance = family.treasury || 0;

        return (
            <div style={{flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:'10px'}}>
                {/* Balance row */}
                <div style={{display:'flex', gap:'8px'}}>
                    <div style={{flex:1, ...S.card, background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.2)', textAlign:'center', padding:'10px'}}>
                        <div style={{fontSize:'10px', color:'#9ca3af', marginBottom:'3px'}}>💰 {lang==='ar'?'صندوق العائلة':'Family Fund'}</div>
                        <div style={{fontSize:'16px', fontWeight:900, color:'#ffd700', fontStyle:'italic'}}>{fmtFamilyNum(coinBalance)}</div>
                    </div>
                    <div style={{flex:1, ...S.card, background:'rgba(0,242,255,0.04)', border:'1px solid rgba(0,242,255,0.15)', textAlign:'center', padding:'10px'}}>
                        <div style={{fontSize:'10px', color:'#9ca3af', marginBottom:'3px'}}>🪙 {lang==='ar'?'عملة العائلة':'Family Coins'}</div>
                        <div style={{fontSize:'16px', fontWeight:900, color:'#00f2ff', fontStyle:'italic'}}>{family.xp||0}</div>
                    </div>
                </div>

                {/* Task List */}
                {FAMILY_TASKS_CONFIG.map(task => {
                    const prog = taskProgress[task.id] || { current: 0, claimed: false };
                    const pct = Math.min(100, Math.round((prog.current / task.target) * 100));
                    const isDone = prog.current >= task.target;
                    const isClaimed = prog.claimed;

                    return (
                        <div key={task.id} style={{...S.card, border:`1px solid ${isClaimed?'rgba(16,185,129,0.25)':isDone?'rgba(0,242,255,0.2)':'rgba(255,255,255,0.07)'}`}}>
                            <div style={{display:'flex', alignItems:'flex-start', gap:'10px'}}>
                                {/* Icon */}
                                <div style={{width:'40px', height:'40px', borderRadius:'12px', background:isClaimed?'rgba(16,185,129,0.15)':isDone?'rgba(0,242,255,0.12)':'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0, border:`1px solid ${isClaimed?'rgba(16,185,129,0.3)':isDone?'rgba(0,242,255,0.3)':'rgba(255,255,255,0.08)'}`}}>
                                    {isClaimed?'✅':isDone?'🎯':task.reward.icon}
                                </div>
                                {/* Info */}
                                <div style={{flex:1, minWidth:0}}>
                                    <div style={{fontSize:'12px', fontWeight:700, color:isClaimed?'#10b981':isDone?'#00f2ff':'#e2e8f0', marginBottom:'2px'}}>
                                        {lang==='ar'?task.title_ar:task.title_en}
                                    </div>
                                    <div style={{fontSize:'10px', color:'#6b7280', marginBottom:'6px'}}>{lang==='ar'?task.sub_ar:task.sub_en}</div>
                                    {/* Progress bar */}
                                    {!isClaimed && (
                                        <div>
                                            <div style={{display:'flex', justifyContent:'space-between', fontSize:'9px', color:'#4b5563', marginBottom:'3px'}}>
                                                <span>{prog.current}/{task.target}</span>
                                                <span>{pct}%</span>
                                            </div>
                                            <div style={{height:'4px', borderRadius:'2px', background:'rgba(255,255,255,0.07)', overflow:'hidden'}}>
                                                <div style={{height:'100%', borderRadius:'2px', width:`${pct}%`, background: isDone?'linear-gradient(90deg,#00f2ff,#7000ff)':'linear-gradient(90deg,#6b7280,#9ca3af)', transition:'width 0.5s'}} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Reward + Action */}
                                <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'6px', flexShrink:0}}>
                                    <div style={{fontSize:'10px', fontWeight:800, color:task.reward.type==='coin'?'#00f2ff':'#fbbf24'}}>
                                        {task.reward.icon}×{task.reward.amount}
                                    </div>
                                    <button
                                        disabled={isClaimed||!isDone}
                                        onClick={async()=>{
                                            if(!isDone||isClaimed||!family?.id) return;
                                            try {
                                                await familiesCollection.doc(family.id).update({ [`taskProgress.${task.id}.claimed`]:true, xp:firebase.firestore.FieldValue.increment(task.reward.amount) });
                                                onNotification(`✅ +${task.reward.amount} ${task.reward.icon}`);
                                            } catch(e){}
                                        }}
                                        style={{...S.btn, padding:'5px 12px', fontSize:'11px', background:isClaimed?'rgba(16,185,129,0.15)':isDone?'linear-gradient(135deg,#00f2ff,#7000ff)':'rgba(255,255,255,0.06)', color:isClaimed?'#10b981':isDone?'white':'#4b5563', cursor:isDone&&!isClaimed?'pointer':'not-allowed', border:'none'}}>
                                        {isClaimed?(lang==='ar'?'تم':'Done'):isDone?(lang==='ar'?'اجمع':'Claim'):(lang==='ar'?'ابدأ':'Go')}
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
                            {item.amount>0 && <div style={{fontSize:'10px', color:'#ffd700', fontWeight:700, marginTop:'2px'}}>+{fmtFamilyNum(item.amount)} 🪙</div>}
                        </div>
                        <div style={{fontSize:'10px', color:'#4b5563', flexShrink:0}}>{fmtFamilyTime(item.createdAt, lang)}</div>
                    </div>
                ))}
                <div style={{height:'12px'}} />
            </div>
        );
    };

    // ─────────────────────────────────────────────
    // TAB: MANAGE (Admin only)
    // ─────────────────────────────────────────────
    const renderManage = () => {
        if (!canManage) return (
            <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'12px', color:'#6b7280'}}>
                <div style={{fontSize:'40px'}}>🔒</div>
                <div style={{fontSize:'12px'}}>{lang==='ar'?'للمسؤولين فقط':'Admins only'}</div>
            </div>
        );
        const requests = family?.joinRequests || [];

        return (
            <div style={{flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:'12px'}}>

                {/* ── Edit Announcement ── */}
                <div style={S.card}>
                    <div style={S.sectionTitle}>📢 {lang==='ar'?'تعديل الإعلان':'Edit Announcement'}</div>
                    <textarea value={editAnnouncement} onChange={e=>setEditAnnouncement(e.target.value)} maxLength={300} rows={4}
                        style={{...S.input, resize:'none', lineHeight:1.6, fontSize:'12px'}}
                        placeholder={lang==='ar'?'اكتب إعلانك هنا...':'Write your announcement here...'} />
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'8px'}}>
                        <span style={{fontSize:'10px', color:'#4b5563'}}>{editAnnouncement.length}/300</span>
                        <button onClick={saveAnnouncement} disabled={savingAnn} style={{...S.btn, background:'linear-gradient(135deg,#00f2ff44,#7000ff44)', border:'1px solid rgba(0,242,255,0.3)', color:'#00f2ff', padding:'7px 16px', fontSize:'11px'}}>
                            {savingAnn?'⏳':(lang==='ar'?'💾 حفظ':'💾 Save')}
                        </button>
                    </div>
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
                            <div style={{display:'flex', gap:'6px'}}>
                                <button onClick={()=>handleJoinRequest(p.id, true)} style={{...S.btn, padding:'5px 10px', fontSize:'11px', background:'rgba(16,185,129,0.2)', border:'1px solid rgba(16,185,129,0.4)', color:'#10b981'}}>✓</button>
                                <button onClick={()=>handleJoinRequest(p.id, false)} style={{...S.btn, padding:'5px 10px', fontSize:'11px', background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171'}}>✕</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Kick Members ── */}
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

                <div style={{height:'12px'}} />
            </div>
        );
    };

    // ─────────────────────────────────────────────
    // HOME — Create / Join
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
                        <button key={e} onClick={()=>setFamilyEmblem(e)} style={{width:'38px', height:'38px', borderRadius:'10px', border:tribeEmblem===e?`2px solid #00f2ff`:'1px solid rgba(255,255,255,0.1)', background:tribeEmblem===e?'rgba(0,242,255,0.15)':'rgba(255,255,255,0.04)', fontSize:'22px', cursor:'pointer', transition:'all 0.15s'}}>
                            {e}
                        </button>
                    ))}
                </div>
                {/* Selected preview */}
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
                <input value={joinSearch} onChange={e=>setJoinSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchFamilies()} style={{...S.input}} placeholder={lang==='ar'?'ابحث بالوسم أو الاسم...':'Search by tag or name...'} />
                <button onClick={searchFamilies} disabled={searching||!joinSearch.trim()} style={{...S.btn, flexShrink:0, padding:'10px 16px', background:joinSearch.trim()?'linear-gradient(135deg,#a78bfa,#7000ff)':'rgba(255,255,255,0.06)', color:joinSearch.trim()?'white':'#4b5563'}}>
                    {searching?'⏳':'🔍'}
                </button>
            </div>

            {joinResults.map(fam => {
                const fl = getFamilyLevel(fam.xp || 0);
                const isFull = (fam.members?.length||0) >= fl.maxMembers;
                const isAlreadyIn = fam.members?.includes(currentUID);
                return (
                    <div key={fam.id} style={{...S.card, display:'flex', alignItems:'center', gap:'12px', border:`1px solid ${fl.color}22`}}>
                        <div style={{width:'48px', height:'48px', borderRadius:'14px', background:`${fl.color}15`, border:`1px solid ${fl.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px', flexShrink:0}}>
                            {fam.emblem||'🏠'}
                        </div>
                        <div style={{flex:1, minWidth:0}}>
                            <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'3px', flexWrap:'wrap'}}>
                                <span style={{fontSize:'14px', fontWeight:800, color:'white', fontStyle:'italic'}}>{fam.name}</span>
                                <FamilySignBadge tag={fam.tag} color={fl.color} small />
                            </div>
                            <div style={{fontSize:'10px', color:'#6b7280', display:'flex', gap:'8px'}}>
                                <span style={{color:fl.color, fontWeight:700}}>{fl.icon} Lv.{fl.level}</span>
                                <span>👥 {fam.members?.length||0}/{fl.maxMembers}</span>
                                {fam.weeklyRank&&<span>🏅#{fam.weeklyRank}</span>}
                            </div>
                            {fam.description&&<div style={{fontSize:'10px', color:'#4b5563', marginTop:'3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{fam.description}</div>}
                        </div>
                        <button onClick={()=>!isAlreadyIn&&!isFull&&joinFamily(fam.id)} disabled={isFull||joining||isAlreadyIn} style={{...S.btn, padding:'7px 14px', fontSize:'11px', flexShrink:0, background:isAlreadyIn?'rgba(16,185,129,0.15)':isFull?'rgba(239,68,68,0.1)':'rgba(0,242,255,0.15)', border:`1px solid ${isAlreadyIn?'rgba(16,185,129,0.4)':isFull?'rgba(239,68,68,0.3)':'rgba(0,242,255,0.35)'}`, color:isAlreadyIn?'#10b981':isFull?'#f87171':'#00f2ff'}}>
                            {isAlreadyIn?(lang==='ar'?'عضو':'Joined'):isFull?(lang==='ar'?'ممتلئ':'Full'):(joining?'⏳':(lang==='ar'?'انضم':'Join'))}
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
        <PortalModal>
            <div className="modal-overlay" onClick={onClose} style={{zIndex: Z.MODAL_HIGH}}>
                <div style={S.modal} onClick={e => e.stopPropagation()}>

                    {/* ── Top Header ── */}
                    <div style={S.header}>
                        {family ? (
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                <div style={{width:'32px', height:'32px', borderRadius:'50%', border:`2px solid ${fLvl?.color}55`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px'}}>
                                    {family.emblem||'🏠'}
                                </div>
                                <div>
                                    <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                                        <span style={{fontSize:'14px', fontWeight:900, color:'white', fontStyle:'italic'}}>{family.name}</span>
                                        <FamilySignBadge tag={family.tag} color={fLvl?.color||'#00f2ff'} small />
                                    </div>
                                    <div style={{fontSize:'9px', color:'#6b7280'}}>
                                        {fLvl?.icon} Lv.{fLvl?.level} · 👥{family.members?.length||0} · <FamilyRoleBadge role={myRole||'member'} lang={lang} small />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                <span style={{fontSize:'20px'}}>🏠</span>
                                <span style={{fontSize:'15px', fontWeight:800, color:'white'}}>{lang==='ar'?'العائلة':'Family'}</span>
                            </div>
                        )}
                        <button onClick={onClose} style={{width:'30px', height:'30px', borderRadius:'8px', border:'none', background:'rgba(255,255,255,0.08)', color:'#9ca3af', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>✕</button>
                    </div>

                    {/* ── Tab Bar (only show if in family) ── */}
                    {family && (
                        <div style={S.tabBar}>
                            {TABS.map(tab => (
                                <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
                                    flex:1, padding:'11px 4px', fontSize:'11px', fontWeight:activeTab===tab.id?800:500,
                                    color:activeTab===tab.id?'#00f2ff':'#6b7280', background:'transparent', border:'none',
                                    borderBottom:`2px solid ${activeTab===tab.id?'#00f2ff':'transparent'}`,
                                    cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.2s',
                                    minWidth:'60px',
                                }}>
                                    {lang==='ar'?tab.label_ar:tab.label_en}
                                    {tab.id==='manage'&&(family?.joinRequests?.length>0)&&<span style={{marginLeft:'3px', fontSize:'9px', background:'#f97316', color:'white', borderRadius:'50%', padding:'0 4px', fontWeight:900}}>{family.joinRequests.length}</span>}
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
                                {activeTab==='profile' && renderProfile()}
                                {activeTab==='members' && renderMembers()}
                                {activeTab==='tasks'   && renderTasks()}
                                {activeTab==='news'    && renderNews()}
                                {activeTab==='manage'  && renderManage()}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </PortalModal>
    );
};
