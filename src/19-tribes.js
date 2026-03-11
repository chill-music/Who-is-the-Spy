// ════════════════════════════════════════════════════════
// 📸 FRIENDS MOMENTS MODAL — shows friends' moments feed
// ⚔️  TRIBE SYSTEM — complete family/tribe system
// File: 19-tribes.js
// ════════════════════════════════════════════════════════

// ── Tribe Firestore collection ──
const tribesCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('tribes');

// ── Tribe Level Config ──
const TRIBE_LEVEL_CONFIG = [
    { level:1,  xp:0,     icon:'🌱', name_en:'Rookie Tribe',   name_ar:'قبيلة مبتدئة',  color:'#4ade80', maxMembers:20  },
    { level:2,  xp:200,   icon:'🏕️', name_en:'Camp',          name_ar:'معسكر',          color:'#22d3ee', maxMembers:25  },
    { level:3,  xp:600,   icon:'🏰', name_en:'Fortress',      name_ar:'حصن',            color:'#60a5fa', maxMembers:30  },
    { level:4,  xp:1200,  icon:'⚔️', name_en:'Warriors',      name_ar:'محاربون',        color:'#fbbf24', maxMembers:35  },
    { level:5,  xp:2200,  icon:'🛡️', name_en:'Guardians',     name_ar:'حراس',           color:'#f97316', maxMembers:40  },
    { level:6,  xp:3600,  icon:'👑', name_en:'Kingdom',       name_ar:'مملكة',          color:'#ffd700', maxMembers:50  },
    { level:7,  xp:5500,  icon:'🌟', name_en:'Dynasty',       name_ar:'سلالة',          color:'#a78bfa', maxMembers:60  },
    { level:8,  xp:8000,  icon:'🔥', name_en:'Inferno',       name_ar:'جحيم',           color:'#ef4444', maxMembers:75  },
    { level:9,  xp:11500, icon:'🌌', name_en:'Constellation', name_ar:'كوكبة',          color:'#818cf8', maxMembers:90  },
    { level:10, xp:16000, icon:'🏆', name_en:'Legend Tribe',  name_ar:'قبيلة أسطورية', color:'#00d4ff', maxMembers:100 },
];
const getTribeLevel = (xp = 0) => {
    let cfg = TRIBE_LEVEL_CONFIG[0];
    for (let i = TRIBE_LEVEL_CONFIG.length - 1; i >= 0; i--) {
        if (xp >= TRIBE_LEVEL_CONFIG[i].xp) { cfg = TRIBE_LEVEL_CONFIG[i]; break; }
    }
    return cfg;
};
const getTribeLevelProgress = (xp = 0) => {
    const cur = getTribeLevel(xp);
    const next = TRIBE_LEVEL_CONFIG.find(c => c.level === cur.level + 1);
    if (!next) return 100;
    return Math.min(100, Math.round(((xp - cur.xp) / (next.xp - cur.xp)) * 100));
};

// ── Tribe Creation Cost ──
const TRIBE_CREATE_COST = 500;

// ════════════════════════════════════════════════════════
// 📸 FRIENDS MOMENTS MODAL
// ════════════════════════════════════════════════════════
const FriendsMomentsModal = ({ show, onClose, currentUser, currentUserData, currentUID, friendsData, lang, onOpenProfile }) => {
    const [moments, setMoments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMoment, setSelectedMoment] = useState(null);
    const t = TRANSLATIONS[lang];

    useEffect(() => {
        if (!show || !currentUID) return;
        setLoading(true);

        // Collect friend UIDs including self
        const friendUIDs = (friendsData || []).map(f => f.id || f.uid).filter(Boolean);
        if (friendUIDs.length === 0) { setMoments([]); setLoading(false); return; }

        // Firestore 'in' is limited to 10 per query — chunk them
        const chunks = [];
        for (let i = 0; i < friendUIDs.length; i += 10) chunks.push(friendUIDs.slice(i, i + 10));

        Promise.all(chunks.map(chunk =>
            momentsCollection
                .where('authorUID', 'in', chunk)
                .orderBy('createdAt', 'desc')
                .limit(30)
                .get()
                .catch(() => ({ docs: [] }))
        )).then(results => {
            const all = [];
            results.forEach(snap => snap.docs.forEach(d => all.push({ id: d.id, ...d.data() })));
            // Sort combined results by date
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
                    background: 'linear-gradient(180deg,#0f0f1e,#0a0a14)',
                    border: '1px solid rgba(0,242,255,0.2)',
                    borderRadius: '18px', width: '100%', maxWidth: '440px',
                    maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                    overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.9)'
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px' }}>📸</span>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>{lang === 'ar' ? 'مومنت الأصدقاء' : 'Friends Moments'}</div>
                                <div style={{ fontSize: '10px', color: '#6b7280' }}>{moments.length} {lang === 'ar' ? 'لحظة' : 'moments'}</div>
                            </div>
                        </div>
                        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '8px', color: '#9ca3af', fontSize: '16px', width: '30px', height: '30px', cursor: 'pointer' }}>✕</button>
                    </div>

                    {/* Body */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>⏳</div>
                        ) : moments.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                                <div style={{ fontSize: '13px', color: '#6b7280' }}>{lang === 'ar' ? 'لا مومنتات من أصدقائك بعد' : 'No moments from friends yet'}</div>
                                <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '6px' }}>{lang === 'ar' ? 'أضف أصدقاء لتشاهد لحظاتهم' : 'Add friends to see their moments'}</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {moments.map(moment => (
                                    <div key={moment.id} style={{
                                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '14px', overflow: 'hidden', cursor: 'pointer',
                                        transition: 'border-color 0.2s'
                                    }} onClick={() => setSelectedMoment(moment)}>
                                        {/* Author row */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px 8px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.1)' }}>
                                                {moment.authorPhoto
                                                    ? <img src={moment.authorPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>😎</div>
                                                }
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{moment.authorName}</div>
                                                <div style={{ fontSize: '10px', color: '#6b7280' }}>{fmtMomentTime(moment.createdAt)}</div>
                                            </div>
                                            {onOpenProfile && <button onClick={e => { e.stopPropagation(); onOpenProfile(moment.authorUID); }} style={{ background: 'rgba(0,242,255,0.1)', border: '1px solid rgba(0,242,255,0.2)', borderRadius: '6px', padding: '3px 8px', color: '#00f2ff', fontSize: '10px', cursor: 'pointer' }}>👤</button>}
                                        </div>
                                        {/* Media */}
                                        {moment.type === 'image' && moment.mediaUrl && (
                                            <div style={{ maxHeight: '260px', overflow: 'hidden' }}>
                                                <img src={moment.mediaUrl} alt="" style={{ width: '100%', objectFit: 'cover', display: 'block' }} />
                                            </div>
                                        )}
                                        {/* Text */}
                                        {moment.content && (
                                            <div style={{ padding: '8px 12px 10px', fontSize: '12px', color: '#d1d5db', lineHeight: 1.5 }}>{moment.content}</div>
                                        )}
                                        {/* Likes */}
                                        <div style={{ padding: '6px 12px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '11px', color: '#6b7280' }}>❤️ {moment.likes?.length || 0}</span>
                                            <span style={{ fontSize: '11px', color: '#6b7280' }}>💬 {moment.comments?.length || 0}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected moment overlay */}
                {selectedMoment && (
                    <div className="modal-overlay" onClick={() => setSelectedMoment(null)} style={{ zIndex: Z.MODAL_HIGH + 1 }}>
                        <div className="animate-pop" onClick={e => e.stopPropagation()} style={{
                            background: '#0a0a14', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px', maxWidth: '420px', width: '95%', overflow: 'hidden', maxHeight: '85vh'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.1)' }}>
                                        {selectedMoment.authorPhoto ? <img src={selectedMoment.authorPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '14px' }}>😎</span>}
                                    </div>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>{selectedMoment.authorName}</div>
                                </div>
                                <button onClick={() => setSelectedMoment(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '18px', cursor: 'pointer' }}>✕</button>
                            </div>
                            <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
                                {selectedMoment.type === 'image' && selectedMoment.mediaUrl && (
                                    <img src={selectedMoment.mediaUrl} alt="" style={{ width: '100%', display: 'block' }} />
                                )}
                                {selectedMoment.content && (
                                    <div style={{ padding: '12px 14px', fontSize: '13px', color: '#e2e8f0', lineHeight: 1.6 }}>{selectedMoment.content}</div>
                                )}
                                <div style={{ padding: '8px 14px', fontSize: '11px', color: '#6b7280' }}>
                                    ❤️ {selectedMoment.likes?.length || 0} &nbsp;&nbsp; 💬 {selectedMoment.comments?.length || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PortalModal>
    );
};

// ════════════════════════════════════════════════════════
// ⚔️  TRIBE MODAL — Complete Tribe System
// ════════════════════════════════════════════════════════
const TribeModal = ({ show, onClose, currentUser, currentUserData, currentUID, lang, isLoggedIn, onNotification }) => {
    const [view, setView] = useState('home'); // 'home' | 'create' | 'myTribe' | 'search' | 'chat'
    const [myTribe, setMyTribe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tribeMessages, setTribeMessages] = useState([]);
    const [msgText, setMsgText] = useState('');
    const [tribeMembers, setTribeMembers] = useState([]);

    // Create form
    const [tribeName, setTribeName] = useState('');
    const [tribeTag, setTribeTag] = useState('');
    const [tribeDesc, setTribeDesc] = useState('');
    const [tribeEmblem, setTribeEmblem] = useState('⚔️');
    const [creating, setCreating] = useState(false);

    // Join
    const [joinTag, setJoinTag] = useState('');
    const [joining, setJoining] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const messagesEndRef = useRef(null);

    // ── Load user's tribe ──
    useEffect(() => {
        if (!show || !currentUID) { setLoading(false); return; }
        setLoading(true);
        const tribeId = currentUserData?.tribeId;
        if (!tribeId) { setMyTribe(null); setLoading(false); return; }
        const unsub = tribesCollection.doc(tribeId).onSnapshot(snap => {
            if (snap.exists) {
                setMyTribe({ id: snap.id, ...snap.data() });
                setView('myTribe');
            } else {
                // Tribe was deleted
                setMyTribe(null);
                usersCollection.doc(currentUID).update({ tribeId: null }).catch(() => {});
            }
            setLoading(false);
        }, () => setLoading(false));
        return () => unsub();
    }, [show, currentUID, currentUserData?.tribeId]);

    // ── Load tribe messages ──
    useEffect(() => {
        if (!myTribe?.id || view !== 'chat') return;
        const unsub = tribesCollection.doc(myTribe.id).collection('messages')
            .orderBy('createdAt', 'asc').limitToLast(80)
            .onSnapshot(snap => {
                setTribeMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            });
        return () => unsub();
    }, [myTribe?.id, view]);

    // ── Load tribe member profiles ──
    useEffect(() => {
        if (!myTribe?.members?.length) return;
        const uids = myTribe.members.slice(0, 20);
        const chunks = [];
        for (let i = 0; i < uids.length; i += 10) chunks.push(uids.slice(i, i + 10));
        Promise.all(chunks.map(chunk =>
            usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', chunk).get()
        )).then(results => {
            const members = [];
            results.forEach(snap => snap.docs.forEach(d => members.push({ id: d.id, ...d.data() })));
            setTribeMembers(members);
        }).catch(() => {});
    }, [myTribe?.members?.join(',')]);

    const createTribe = async () => {
        if (!tribeName.trim() || !tribeTag.trim() || creating || !currentUID) return;
        if ((currentUserData?.currency || 0) < TRIBE_CREATE_COST) {
            onNotification(lang === 'ar' ? `❌ تحتاج ${TRIBE_CREATE_COST} إنتل` : `❌ Need ${TRIBE_CREATE_COST} Intel`);
            return;
        }
        const cleanTag = tribeTag.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        if (cleanTag.length < 2) { onNotification(lang === 'ar' ? '❌ الوسم يجب أن يكون حرفين على الأقل' : '❌ Tag must be at least 2 chars'); return; }

        setCreating(true);
        try {
            // Check tag uniqueness
            const tagCheck = await tribesCollection.where('tag', '==', cleanTag).get();
            if (!tagCheck.empty) { onNotification(lang === 'ar' ? '❌ هذا الوسم مستخدم' : '❌ Tag already taken'); setCreating(false); return; }

            const tribeRef = await tribesCollection.add({
                name: tribeName.trim(),
                tag: cleanTag,
                description: tribeDesc.trim(),
                emblem: tribeEmblem,
                createdBy: currentUID,
                leaderName: currentUserData?.displayName || 'Leader',
                leaderPhoto: currentUserData?.photoURL || null,
                members: [currentUID],
                leaders: [currentUID],
                level: 1, xp: 0,
                totalWins: 0,
                isPrivate: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
            });

            // Deduct cost + save tribeId on user
            await usersCollection.doc(currentUID).update({
                currency: firebase.firestore.FieldValue.increment(-TRIBE_CREATE_COST),
                tribeId: tribeRef.id,
                tribeName: tribeName.trim(),
                tribeTag: cleanTag,
            });

            onNotification(lang === 'ar' ? '✅ تم إنشاء القبيلة!' : '✅ Tribe created!');
            setTribeName(''); setTribeTag(''); setTribeDesc('');
        } catch (e) {
            console.error('createTribe error:', e);
            onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error');
        }
        setCreating(false);
    };

    const joinTribe = async (tribeId) => {
        if (!currentUID || !tribeId || joining) return;
        setJoining(true);
        try {
            const tribeSnap = await tribesCollection.doc(tribeId).get();
            if (!tribeSnap.exists) { onNotification(lang === 'ar' ? '❌ القبيلة غير موجودة' : '❌ Tribe not found'); setJoining(false); return; }
            const td = tribeSnap.data();
            const lvlCfg = getTribeLevel(td.xp || 0);
            if ((td.members || []).length >= lvlCfg.maxMembers) {
                onNotification(lang === 'ar' ? '❌ القبيلة ممتلئة' : '❌ Tribe is full');
                setJoining(false); return;
            }
            await tribesCollection.doc(tribeId).update({
                members: firebase.firestore.FieldValue.arrayUnion(currentUID),
                xp: firebase.firestore.FieldValue.increment(5),
                lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
            });
            await usersCollection.doc(currentUID).update({
                tribeId: tribeId,
                tribeName: td.name,
                tribeTag: td.tag,
            });
            // System message
            await tribesCollection.doc(tribeId).collection('messages').add({
                text: lang === 'ar' ? `🎉 ${currentUserData?.displayName || 'عضو'} انضم للقبيلة!` : `🎉 ${currentUserData?.displayName || 'Member'} joined the tribe!`,
                senderId: 'system', senderName: 'System',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(), type: 'system'
            });
            onNotification(lang === 'ar' ? '✅ انضممت للقبيلة!' : '✅ Joined tribe!');
        } catch (e) {
            onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error');
        }
        setJoining(false);
    };

    const leaveTribe = async () => {
        if (!myTribe?.id || !currentUID) return;
        const isLeader = myTribe.leaders?.includes(currentUID);
        const isOnlyLeader = isLeader && (myTribe.leaders?.length || 0) <= 1;
        if (isOnlyLeader && (myTribe.members?.length || 0) > 1) {
            onNotification(lang === 'ar' ? '❌ يجب تعيين قائد آخر أولاً' : '❌ Assign another leader first');
            return;
        }
        try {
            if (isOnlyLeader && (myTribe.members?.length || 0) <= 1) {
                // Delete tribe if last member
                await tribesCollection.doc(myTribe.id).delete();
            } else {
                await tribesCollection.doc(myTribe.id).update({
                    members: firebase.firestore.FieldValue.arrayRemove(currentUID),
                    leaders: firebase.firestore.FieldValue.arrayRemove(currentUID),
                });
            }
            await usersCollection.doc(currentUID).update({ tribeId: null, tribeName: null, tribeTag: null });
            setMyTribe(null);
            setView('home');
            onNotification(lang === 'ar' ? '✅ تركت القبيلة' : '✅ Left tribe');
        } catch (e) { onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
    };

    const sendMessage = async () => {
        if (!msgText.trim() || !myTribe?.id || !currentUID) return;
        const text = msgText.trim();
        setMsgText('');
        try {
            await tribesCollection.doc(myTribe.id).collection('messages').add({
                text, senderId: currentUID,
                senderName: currentUserData?.displayName || 'Member',
                senderPhoto: currentUserData?.photoURL || null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(), type: 'text'
            });
            await tribesCollection.doc(myTribe.id).update({
                xp: firebase.firestore.FieldValue.increment(1),
                level: getTribeLevel((myTribe.xp || 0) + 1).level,
                lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
            });
        } catch (e) {}
    };

    const searchTribes = async () => {
        if (!joinTag.trim() || searching) return;
        setSearching(true);
        try {
            const snap = await tribesCollection.where('tag', '==', joinTag.trim().toUpperCase()).limit(5).get();
            if (snap.empty) {
                // fallback: search by name prefix
                const snapName = await tribesCollection.where('name', '>=', joinTag.trim()).where('name', '<=', joinTag.trim() + '\uf8ff').limit(5).get();
                setSearchResults(snapName.docs.map(d => ({ id: d.id, ...d.data() })));
            } else {
                setSearchResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            }
        } catch (e) { setSearchResults([]); }
        setSearching(false);
    };

    const EMBLEMS = ['⚔️','🛡️','🔥','🌊','⚡','🌙','🌟','💎','👑','🐉','🦁','🐺','🦅','🌹','🏹'];
    const fmtTime = (ts) => {
        if (!ts) return '';
        const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
        const diff = Date.now() - d.getTime();
        if (diff < 60000) return lang === 'ar' ? 'الآن' : 'now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}${lang === 'ar' ? 'د' : 'm'}`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}${lang === 'ar' ? 'س' : 'h'}`;
        return `${Math.floor(diff / 86400000)}${lang === 'ar' ? 'ي' : 'd'}`;
    };

    if (!show) return null;

    const tLvl = myTribe ? getTribeLevel(myTribe.xp || 0) : null;
    const tProg = myTribe ? getTribeLevelProgress(myTribe.xp || 0) : 0;

    const renderHome = () => (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>⚔️</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'white', marginBottom: '6px' }}>{lang === 'ar' ? 'عالم القبائل' : 'Tribe World'}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>{lang === 'ar' ? 'انضم أو أنشئ قبيلتك وتنافس مع الآخرين' : 'Join or create your tribe and compete'}</div>
            </div>
            {isLoggedIn ? (
                <>
                    <button onClick={() => setView('create')} style={{ padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,136,0,0.4)', background: 'linear-gradient(135deg,rgba(255,136,0,0.15),rgba(255,60,0,0.08))', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px' }}>🏗️</span>
                        <div style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fb923c' }}>{lang === 'ar' ? 'إنشاء قبيلة' : 'Create Tribe'}</div>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{lang === 'ar' ? `التكلفة: ${TRIBE_CREATE_COST} إنتل 🧠` : `Cost: ${TRIBE_CREATE_COST} Intel 🧠`}</div>
                        </div>
                    </button>
                    <button onClick={() => setView('search')} style={{ padding: '14px', borderRadius: '14px', border: '1px solid rgba(0,242,255,0.25)', background: 'rgba(0,242,255,0.06)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px' }}>🔍</span>
                        <div style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#00f2ff' }}>{lang === 'ar' ? 'البحث عن قبيلة' : 'Find a Tribe'}</div>
                            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{lang === 'ar' ? 'ابحث بالوسم أو الاسم' : 'Search by tag or name'}</div>
                        </div>
                    </button>
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280', fontSize: '12px' }}>
                    {lang === 'ar' ? '🔐 سجّل دخول للانضمام' : '🔐 Login to join tribes'}
                </div>
            )}
        </div>
    );

    const renderCreate = () => (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', color: '#00f2ff', fontSize: '18px', cursor: 'pointer' }}>‹</button>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>{lang === 'ar' ? '🏗️ إنشاء قبيلة' : '🏗️ Create Tribe'}</span>
            </div>

            {/* Emblem picker */}
            <div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px' }}>{lang === 'ar' ? 'شعار القبيلة' : 'Tribe Emblem'}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {EMBLEMS.map(e => (
                        <button key={e} onClick={() => setTribeEmblem(e)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: tribeEmblem === e ? '2px solid #f97316' : '1px solid rgba(255,255,255,0.1)', background: tribeEmblem === e ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.04)', fontSize: '20px', cursor: 'pointer' }}>{e}</button>
                    ))}
                </div>
            </div>

            <div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }}>{lang === 'ar' ? 'اسم القبيلة *' : 'Tribe Name *'}</div>
                <input value={tribeName} onChange={e => setTribeName(e.target.value)} maxLength={30} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder={lang === 'ar' ? 'اسم مميز للقبيلة...' : 'Unique tribe name...'} />
            </div>

            <div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }}>{lang === 'ar' ? 'وسم القبيلة * (حروف وأرقام فقط)' : 'Tribe Tag * (letters & numbers)'}</div>
                <input value={tribeTag} onChange={e => setTribeTag(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))} maxLength={6} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,136,0,0.3)', color: '#fb923c', fontSize: '14px', fontWeight: 700, outline: 'none', letterSpacing: '2px', boxSizing: 'border-box' }} placeholder='MYTAG' />
                <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '4px' }}>{lang === 'ar' ? 'يُستخدم للبحث عن قبيلتك' : 'Used to find your tribe'}</div>
            </div>

            <div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }}>{lang === 'ar' ? 'وصف القبيلة (اختياري)' : 'Description (optional)'}</div>
                <textarea value={tribeDesc} onChange={e => setTribeDesc(e.target.value)} maxLength={120} rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '12px', outline: 'none', resize: 'none', boxSizing: 'border-box' }} placeholder={lang === 'ar' ? 'صف قبيلتك...' : 'Describe your tribe...'} />
            </div>

            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(255,136,0,0.08)', border: '1px solid rgba(255,136,0,0.2)', fontSize: '11px', color: '#fb923c' }}>
                💡 {lang === 'ar' ? `سيُخصم ${TRIBE_CREATE_COST} إنتل من رصيدك (رصيدك: ${currentUserData?.currency || 0} 🧠)` : `${TRIBE_CREATE_COST} Intel will be deducted (Balance: ${currentUserData?.currency || 0} 🧠)`}
            </div>

            <button onClick={createTribe} disabled={!tribeName.trim() || !tribeTag.trim() || creating} style={{ padding: '13px', borderRadius: '12px', border: 'none', background: tribeName.trim() && tribeTag.trim() && !creating ? 'linear-gradient(135deg,#f97316,#dc2626)' : 'rgba(255,255,255,0.06)', color: tribeName.trim() && tribeTag.trim() ? 'white' : '#6b7280', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {creating ? '⏳' : '⚔️'} {lang === 'ar' ? (creating ? 'جاري الإنشاء...' : `إنشاء القبيلة`) : (creating ? 'Creating...' : 'Create Tribe')}
            </button>
        </div>
    );

    const renderSearch = () => (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => { setView('home'); setSearchResults([]); setJoinTag(''); }} style={{ background: 'none', border: 'none', color: '#00f2ff', fontSize: '18px', cursor: 'pointer' }}>‹</button>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>{lang === 'ar' ? '🔍 البحث عن قبيلة' : '🔍 Find Tribe'}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <input value={joinTag} onChange={e => setJoinTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchTribes()} style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: '12px', outline: 'none' }} placeholder={lang === 'ar' ? 'ابحث بالوسم أو الاسم...' : 'Search by tag or name...'} />
                <button onClick={searchTribes} disabled={searching || !joinTag.trim()} style={{ padding: '10px 14px', borderRadius: '10px', border: 'none', background: joinTag.trim() ? 'linear-gradient(135deg,#00f2ff,#7000ff)' : 'rgba(255,255,255,0.06)', color: joinTag.trim() ? 'white' : '#6b7280', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                    {searching ? '⏳' : '🔍'}
                </button>
            </div>
            {searchResults.map(tribe => {
                const tl = getTribeLevel(tribe.xp || 0);
                const isFull = (tribe.members?.length || 0) >= tl.maxMembers;
                return (
                    <div key={tribe.id} style={{ padding: '12px 14px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `linear-gradient(135deg,${tl.color}22,${tl.color}11)`, border: `1px solid ${tl.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>{tribe.emblem || '⚔️'}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{tribe.name} <span style={{ color: '#fb923c', fontSize: '10px' }}>#{tribe.tag}</span></div>
                            <div style={{ fontSize: '10px', color: '#6b7280', display: 'flex', gap: '8px', marginTop: '2px' }}>
                                <span>{tl.icon} Lv.{tl.level}</span>
                                <span>👥 {tribe.members?.length || 0}/{tl.maxMembers}</span>
                            </div>
                            {tribe.description && <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tribe.description}</div>}
                        </div>
                        <button onClick={() => joinTribe(tribe.id)} disabled={isFull || joining || tribe.members?.includes(currentUID)} style={{ padding: '7px 12px', borderRadius: '8px', border: 'none', background: isFull ? 'rgba(239,68,68,0.15)' : 'rgba(249,115,22,0.2)', color: isFull ? '#f87171' : '#fb923c', fontWeight: 700, fontSize: '11px', cursor: isFull ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
                            {tribe.members?.includes(currentUID) ? (lang === 'ar' ? 'عضو' : 'Joined') : isFull ? (lang === 'ar' ? 'ممتلئ' : 'Full') : (joining ? '⏳' : (lang === 'ar' ? 'انضم' : 'Join'))}
                        </button>
                    </div>
                );
            })}
            {searchResults.length === 0 && joinTag && !searching && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280', fontSize: '12px' }}>{lang === 'ar' ? 'لا توجد نتائج' : 'No results found'}</div>
            )}
        </div>
    );

    const renderMyTribe = () => {
        if (!myTribe || !tLvl) return null;
        const isLeader = myTribe.leaders?.includes(currentUID);
        const nextLvl = TRIBE_LEVEL_CONFIG.find(c => c.level === tLvl.level + 1);
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Tribe Hero */}
                <div style={{ padding: '16px', background: `linear-gradient(135deg,${tLvl.color}12,rgba(0,0,0,0))`, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `linear-gradient(135deg,${tLvl.color}22,${tLvl.color}11)`, border: `2px solid ${tLvl.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', flexShrink: 0 }}>{myTribe.emblem || '⚔️'}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>{myTribe.name}</div>
                            <div style={{ fontSize: '11px', color: '#6b7280', display: 'flex', gap: '8px', marginTop: '2px' }}>
                                <span style={{ color: '#fb923c' }}>#{myTribe.tag}</span>
                                <span style={{ color: tLvl.color, fontWeight: 700 }}>{tLvl.icon} Lv.{tLvl.level} {lang === 'ar' ? tLvl.name_ar : tLvl.name_en}</span>
                            </div>
                            {/* XP bar */}
                            <div style={{ marginTop: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#4b5563', marginBottom: '3px' }}>
                                    <span>XP: {myTribe.xp || 0}</span>
                                    {nextLvl && <span>{lang === 'ar' ? 'التالي' : 'Next'}: {nextLvl.xp}</span>}
                                </div>
                                <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', borderRadius: '2px', background: `linear-gradient(90deg,${tLvl.color},${tLvl.color}88)`, width: `${tProg}%`, transition: 'width 0.5s' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <div style={{ flex: 1, padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>{myTribe.members?.length || 0}</div>
                            <div style={{ fontSize: '9px', color: '#6b7280' }}>{lang === 'ar' ? 'أعضاء' : 'Members'}</div>
                        </div>
                        <div style={{ flex: 1, padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffd700' }}>{myTribe.totalWins || 0}</div>
                            <div style={{ fontSize: '9px', color: '#6b7280' }}>{lang === 'ar' ? 'انتصارات' : 'Wins'}</div>
                        </div>
                        <div style={{ flex: 1, padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: tLvl.color }}>{tLvl.level}</div>
                            <div style={{ fontSize: '9px', color: '#6b7280' }}>Level</div>
                        </div>
                    </div>
                    {/* Nav */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                        {['chat','members'].map(v => (
                            <button key={v} onClick={() => setView(v)} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: view===v ? `1px solid ${tLvl.color}55` : '1px solid rgba(255,255,255,0.1)', background: view===v ? `${tLvl.color}18` : 'rgba(255,255,255,0.03)', color: view===v ? tLvl.color : '#6b7280', fontWeight: view===v ? 700 : 500, fontSize: '11px', cursor: 'pointer' }}>
                                {v === 'chat' ? (lang === 'ar' ? '💬 الشات' : '💬 Chat') : (lang === 'ar' ? '👥 الأعضاء' : '👥 Members')}
                            </button>
                        ))}
                        {isLeader && <button onClick={() => {}} style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#6b7280', fontSize: '11px', cursor: 'pointer' }}>⚙️</button>}
                        <button onClick={leaveTribe} style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: '11px', cursor: 'pointer' }}>🚪</button>
                    </div>
                </div>
                {/* Content */}
                {view === 'chat' && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {tribeMessages.map(msg => {
                                if (msg.type === 'system') return (
                                    <div key={msg.id} style={{ textAlign: 'center', fontSize: '10px', color: '#6b7280', padding: '2px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', alignSelf: 'center', maxWidth: '80%' }}>{msg.text}</div>
                                );
                                const isMe = msg.senderId === currentUID;
                                return (
                                    <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '6px', alignItems: 'flex-end' }}>
                                        {!isMe && <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', flexShrink: 0 }}>{msg.senderPhoto ? <img src={msg.senderPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>😎</span>}</div>}
                                        <div style={{ maxWidth: '70%' }}>
                                            {!isMe && <div style={{ fontSize: '9px', color: tLvl.color, fontWeight: 700, marginBottom: '2px' }}>{msg.senderName}</div>}
                                            <div style={{ padding: '7px 11px', borderRadius: isMe ? '12px 3px 12px 12px' : '3px 12px 12px 12px', background: isMe ? `linear-gradient(135deg,${tLvl.color}40,${tLvl.color}20)` : 'rgba(255,255,255,0.07)', border: isMe ? `1px solid ${tLvl.color}30` : '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: '#e2e8f0', lineHeight: 1.5 }}>{msg.text}</div>
                                            <div style={{ fontSize: '9px', color: '#374151', marginTop: '2px', textAlign: isMe ? 'right' : 'left' }}>{fmtTime(msg.createdAt)}</div>
                                        </div>
                                    </div>
                                );
                            })}
                            {tribeMessages.length === 0 && <div style={{ flex: 1, textAlign: 'center', padding: '30px', color: '#4b5563', fontSize: '12px' }}>{lang === 'ar' ? '💬 ابدأ المحادثة!' : '💬 Say hi!'}</div>}
                            <div ref={messagesEndRef} />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                            <input value={msgText} onChange={e => setMsgText(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())} style={{ flex: 1, padding: '9px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '12px', outline: 'none' }} placeholder={lang === 'ar' ? 'اكتب رسالة...' : 'Type a message...'} />
                            <button onClick={sendMessage} disabled={!msgText.trim()} style={{ width: '38px', height: '38px', borderRadius: '12px', border: 'none', background: msgText.trim() ? `linear-gradient(135deg,${tLvl.color},${tLvl.color}88)` : 'rgba(255,255,255,0.06)', color: 'white', fontSize: '16px', cursor: 'pointer', flexShrink: 0 }}>➤</button>
                        </div>
                    </div>
                )}
                {view === 'members' && (
                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {tribeMembers.map(member => {
                            const isLdr = myTribe.leaders?.includes(member.id);
                            return (
                                <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.1)' }}>
                                        {member.photoURL ? <img src={member.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>😎</span>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {member.displayName}
                                            {isLdr && <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '6px', background: 'rgba(255,215,0,0.15)', color: '#ffd700', border: '1px solid rgba(255,215,0,0.3)' }}>{lang === 'ar' ? 'قائد' : 'Leader'}</span>}
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#6b7280' }}>🏆 {member.stats?.wins || 0} &nbsp; ⭐ {member.charisma || 0}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <PortalModal>
            <div className="modal-overlay" onClick={onClose} style={{ zIndex: Z.MODAL_HIGH }}>
                <div className="animate-pop" onClick={e => e.stopPropagation()} style={{
                    background: 'linear-gradient(180deg,#0f0f1e,#0a0a14)',
                    border: '1px solid rgba(255,136,0,0.25)',
                    borderRadius: '18px', width: '100%', maxWidth: '440px',
                    height: '85vh', display: 'flex', flexDirection: 'column',
                    overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.9)'
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px' }}>⚔️</span>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>
                                {loading ? '...' : myTribe ? myTribe.name : (lang === 'ar' ? 'القبيلة' : 'Tribe')}
                            </span>
                        </div>
                        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '8px', color: '#9ca3af', fontSize: '16px', width: '30px', height: '30px', cursor: 'pointer' }}>✕</button>
                    </div>

                    {/* Body */}
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '50px', color: '#6b7280' }}>⏳</div>
                        ) : myTribe ? renderMyTribe() : (
                            view === 'home' ? renderHome() :
                            view === 'create' ? renderCreate() :
                            view === 'search' ? renderSearch() : renderHome()
                        )}
                    </div>
                </div>
            </div>
        </PortalModal>
    );
};
