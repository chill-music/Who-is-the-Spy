// ════════════════════════════════════════════════════════
// 🛡️ ADMIN PANEL — PRO SPY v1.0
//    فقط Owner / Admin / Moderator يقدروا يشوفوها
//    يتم استدعاؤها من SettingsModal
// ════════════════════════════════════════════════════════

// ── Collections الجديدة ──────────────────────────────────
const staffLogCollection   = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('staff_activity_log');
const ticketsCollection    = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('support_tickets');

// ── Helper: تسجيل نشاط المشرف ────────────────────────────
const logStaffAction = async (staffUID, staffName, action, targetUID = null, targetName = null, details = '') => {
    try {
        await staffLogCollection.add({
            staffUID, staffName, action,
            targetUID: targetUID || null,
            targetName: targetName || null,
            details,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch(e) { console.error('Staff log error:', e); }
};

// ════════════════════════════════════════════════════════
// 🎭 FAKE PROFILES SECTION (Owner only) — تجريبي
// ════════════════════════════════════════════════════════
const FAKE_PROFILE_PHOTOS = [
    'https://i.pravatar.cc/150?img=1','https://i.pravatar.cc/150?img=2','https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4','https://i.pravatar.cc/150?img=5','https://i.pravatar.cc/150?img=6',
    'https://i.pravatar.cc/150?img=7','https://i.pravatar.cc/150?img=8','https://i.pravatar.cc/150?img=9',
    'https://i.pravatar.cc/150?img=10','https://i.pravatar.cc/150?img=11','https://i.pravatar.cc/150?img=12',
];
const FAKE_NAMES = ['Alex Shadow','Nova Cipher','Rex Viper','Luna Storm','Kai Echo','Zara Blaze','Max Frost','Nora Specter','Finn Raven','Iris Ghost','Cole Hex','Dara Nova','Jax Titan','Mia Ghost','Leo Strike'];
const FAKE_COUNTRIES = [
    {code:'SA',flag:'🇸🇦',name_ar:'السعودية',name_en:'Saudi Arabia'},
    {code:'EG',flag:'🇪🇬',name_ar:'مصر',name_en:'Egypt'},
    {code:'AE',flag:'🇦🇪',name_ar:'الإمارات',name_en:'UAE'},
    {code:'KW',flag:'🇰🇼',name_ar:'الكويت',name_en:'Kuwait'},
    {code:'MA',flag:'🇲🇦',name_ar:'المغرب',name_en:'Morocco'},
    {code:'US',flag:'🇺🇸',name_ar:'أمريكا',name_en:'USA'},
    {code:'TR',flag:'🇹🇷',name_ar:'تركيا',name_en:'Turkey'},
];

const FakeProfilesSection = ({ lang, onNotification }) => {
    const [fakeProfiles, setFakeProfiles] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [creating, setCreating] = React.useState(false);
    const [deleting, setDeleting] = React.useState(null);
    const [customName, setCustomName] = React.useState('');
    const [customWins, setCustomWins] = React.useState('');
    const [customCharisma, setCustomCharisma] = React.useState('');

    React.useEffect(() => {
        const unsub = usersCollection.where('isFakeProfile', '==', true).onSnapshot(snap => {
            setFakeProfiles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return () => unsub();
    }, []);

    const createFakeProfile = async () => {
        setCreating(true);
        try {
            const uid = 'fake_' + Date.now() + '_' + Math.floor(Math.random() * 9999);
            const name = customName.trim() || FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
            const photo = FAKE_PROFILE_PHOTOS[Math.floor(Math.random() * FAKE_PROFILE_PHOTOS.length)];
            const country = FAKE_COUNTRIES[Math.floor(Math.random() * FAKE_COUNTRIES.length)];
            const gender = Math.random() > 0.5 ? 'male' : 'female';
            const wins = parseInt(customWins) || Math.floor(Math.random() * 200) + 5;
            const charisma = parseInt(customCharisma) || Math.floor(Math.random() * 50000) + 1000;
            const newProfile = {
                uid, displayName: name, photoURL: photo, gender, country,
                customId: Math.floor(100000 + Math.random() * 900000).toString(),
                stats: { wins, losses: Math.floor(wins * 0.4), xp: wins * 25, spy_wins: Math.floor(wins * 0.3), agent_wins: Math.floor(wins * 0.7), win_streak: 0 },
                charisma, currency: 100, inventory: { frames: [], titles: [], themes: [], badges: [], gifts: [] },
                equipped: { badges: [] }, achievements: [], friends: [], friendRequests: [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastActive: firebase.firestore.FieldValue.serverTimestamp(),
                isAnonymous: false, isFakeProfile: true,
                loginRewards: { currentDay: 0, lastClaimDate: null, streak: 0, totalClaims: 0 },
            };
            await usersCollection.doc(uid).set(newProfile);
            onNotification(lang === 'ar' ? `✅ تم إنشاء بروفايل: ${name}` : `✅ Profile created: ${name}`);
            setCustomName(''); setCustomWins(''); setCustomCharisma('');
        } catch(e) {
            onNotification('❌ Error: ' + e.message);
        }
        setCreating(false);
    };

    const deleteFakeProfile = async (uid, name) => {
        if (!confirm(lang === 'ar' ? `حذف "${name}"؟` : `Delete "${name}"?`)) return;
        setDeleting(uid);
        try {
            await usersCollection.doc(uid).delete();
            onNotification(lang === 'ar' ? `🗑️ تم حذف ${name}` : `🗑️ Deleted ${name}`);
        } catch(e) {
            onNotification('❌ Error: ' + e.message);
        }
        setDeleting(null);
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#00f2ff', marginBottom:'16px' }}>
                🎭 {lang==='ar'?'البروفايلات التجريبية':'Fake / Test Profiles'}
            </div>
            <div style={{ fontSize:'11px', color:'#9ca3af', marginBottom:'16px', lineHeight:1.6 }}>
                {lang==='ar'
                    ? 'أنشئ بروفايلات مزيفة لاختبار اللعبة والرانكينج. هذه البروفايلات تظهر في الموقع كلاعبين حقيقيين ويمكن حذفها في أي وقت.'
                    : 'Create fake profiles to test the game and rankings. These profiles appear as real players and can be deleted at any time.'}
            </div>

            {/* Create Form */}
            <div style={{ background:'rgba(0,242,255,0.06)', border:'1px solid rgba(0,242,255,0.2)', borderRadius:'12px', padding:'14px', marginBottom:'20px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'#00f2ff', marginBottom:'10px' }}>
                    ➕ {lang==='ar'?'إنشاء بروفايل جديد':'Create New Profile'}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'8px' }}>
                    <div>
                        <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'4px' }}>{lang==='ar'?'الاسم (اختياري)':'Name (optional)'}</div>
                        <input className="input-dark" style={{ width:'100%', padding:'6px 8px', fontSize:'11px', borderRadius:'6px' }}
                            placeholder={lang==='ar'?'اتركه فارغاً للعشوائي':'Leave blank for random'}
                            value={customName} onChange={e => setCustomName(e.target.value)} />
                    </div>
                    <div>
                        <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'4px' }}>{lang==='ar'?'الانتصارات (اختياري)':'Wins (optional)'}</div>
                        <input className="input-dark" style={{ width:'100%', padding:'6px 8px', fontSize:'11px', borderRadius:'6px' }}
                            type="number" placeholder="0-999" min="0" max="999"
                            value={customWins} onChange={e => setCustomWins(e.target.value)} />
                    </div>
                    <div>
                        <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'4px' }}>{lang==='ar'?'الكاريزما (اختياري)':'Charisma (optional)'}</div>
                        <input className="input-dark" style={{ width:'100%', padding:'6px 8px', fontSize:'11px', borderRadius:'6px' }}
                            type="number" placeholder="0-999999" min="0"
                            value={customCharisma} onChange={e => setCustomCharisma(e.target.value)} />
                    </div>
                    <div style={{ display:'flex', alignItems:'flex-end' }}>
                        <button onClick={createFakeProfile} disabled={creating} style={{
                            width:'100%', padding:'8px', borderRadius:'7px', fontSize:'11px', fontWeight:700, cursor:'pointer',
                            background:'rgba(0,242,255,0.15)', border:'1px solid rgba(0,242,255,0.35)', color:'#00f2ff',
                            opacity: creating ? 0.5 : 1
                        }}>
                            {creating ? '⏳' : `🎭 ${lang==='ar'?'إنشاء':'Create'}`}
                        </button>
                    </div>
                </div>
                <div style={{ fontSize:'10px', color:'#6b7280' }}>
                    {lang==='ar'?'البيانات الفارغة تُملأ عشوائياً تلقائياً':'Empty fields are filled randomly'}
                </div>
            </div>

            {/* Fake Profiles List */}
            <div style={{ fontSize:'12px', fontWeight:700, color:'#9ca3af', marginBottom:'10px' }}>
                {lang==='ar'?'البروفايلات الموجودة':'Existing Profiles'} ({fakeProfiles.length})
            </div>
            {loading ? (
                <div style={{ textAlign:'center', padding:'20px', color:'#6b7280', fontSize:'12px' }}>⏳</div>
            ) : fakeProfiles.length === 0 ? (
                <div style={{ textAlign:'center', padding:'20px', color:'#6b7280', fontSize:'12px' }}>
                    {lang==='ar'?'لا توجد بروفايلات تجريبية بعد':'No fake profiles yet'}
                </div>
            ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {fakeProfiles.map(fp => (
                        <div key={fp.id} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'10px 12px', display:'flex', alignItems:'center', gap:'10px' }}>
                            <img src={fp.photoURL} alt="" style={{ width:'36px', height:'36px', borderRadius:'50%', objectFit:'cover', flexShrink:0 }} onError={e => e.target.style.display='none'} />
                            <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontSize:'12px', fontWeight:700, color:'white', display:'flex', alignItems:'center', gap:'6px' }}>
                                    {fp.displayName} <span style={{ fontSize:'9px', background:'rgba(0,242,255,0.15)', color:'#00f2ff', borderRadius:'4px', padding:'1px 5px' }}>FAKE</span>
                                </div>
                                <div style={{ fontSize:'10px', color:'#9ca3af', marginTop:'2px' }}>
                                    🏆 {fp.stats?.wins||0} {lang==='ar'?'فوز':'wins'} · ⭐ {(fp.charisma||0).toLocaleString()} · {fp.country?.flag} {lang==='ar'?fp.country?.name_ar:fp.country?.name_en}
                                </div>
                                <div style={{ fontSize:'10px', color:'#6b7280', marginTop:'1px' }}>ID: {fp.uid}</div>
                            </div>
                            <button onClick={() => deleteFakeProfile(fp.id, fp.displayName)} disabled={deleting===fp.id} style={{
                                padding:'5px 10px', borderRadius:'6px', fontSize:'10px', fontWeight:700, cursor:'pointer',
                                background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444',
                                opacity: deleting===fp.id ? 0.5 : 1, flexShrink:0
                            }}>
                                {deleting===fp.id ? '⏳' : '🗑️'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ════════════════════════════════════════════════════════
// 📊 STAT CARD COMPONENT
// ════════════════════════════════════════════════════════
const AdminStatCard = ({ icon, label, value, color = '#00f2ff', bg = 'rgba(0,242,255,0.08)' }) => (
    <div style={{
        background: bg,
        border: `1px solid ${color}30`,
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        flex: '1',
        minWidth: '120px'
    }}>
        <div style={{ fontSize: '22px' }}>{icon}</div>
        <div style={{ fontSize: '20px', fontWeight: 900, color }}>{value}</div>
        <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
);

// ════════════════════════════════════════════════════════
// 👑 OVERVIEW SECTION (Owner only)
// ════════════════════════════════════════════════════════
const OverviewSection = ({ lang }) => {
    const [stats, setStats] = useState({ users: 0, rooms: 0, reports: 0, tickets: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersSnap, roomsSnap, reportsSnap, ticketsSnap] = await Promise.all([
                    usersCollection.get(),
                    roomsCollection.get(),
                    reportsCollection.get(),
                    ticketsCollection.get()
                ]);
                setStats({
                    users: usersSnap.size,
                    rooms: roomsSnap.docs.filter(d => ['waiting','discussing','voting'].includes(d.data().status)).length,
                    reports: reportsSnap.docs.filter(d => !d.data().resolved).length,
                    tickets: ticketsSnap.docs.filter(d => d.data().status === 'open').length
                });
            } catch(e) {}
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) return <div style={{color:'#6b7280',textAlign:'center',padding:'40px'}}>⏳ {lang==='ar'?'جاري التحميل...':'Loading...'}</div>;

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#ffd700', marginBottom:'16px' }}>
                📊 {lang==='ar'?'نظرة عامة على الموقع':'Site Overview'}
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'12px', marginBottom:'24px' }}>
                <AdminStatCard icon="👥" label={lang==='ar'?'إجمالي المستخدمين':'Total Users'} value={stats.users} color="#00f2ff" bg="rgba(0,242,255,0.08)" />
                <AdminStatCard icon="🎮" label={lang==='ar'?'غرف نشطة':'Active Rooms'} value={stats.rooms} color="#10b981" bg="rgba(16,185,129,0.08)" />
                <AdminStatCard icon="🚨" label={lang==='ar'?'تقارير معلقة':'Pending Reports'} value={stats.reports} color="#ef4444" bg="rgba(239,68,68,0.08)" />
                <AdminStatCard icon="🎫" label={lang==='ar'?'تذاكر مفتوحة':'Open Tickets'} value={stats.tickets} color="#f59e0b" bg="rgba(245,158,11,0.08)" />
            </div>
        </div>
    );
};

// ════════════════════════════════════════════════════════
// 👥 STAFF MANAGEMENT SECTION (Owner only)
// ════════════════════════════════════════════════════════
const StaffManagementSection = ({ currentUser, currentUserData, lang, onNotification }) => {
    const [staffList, setStaffList] = useState([]);
    const [searchId, setSearchId] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [assigning, setAssigning] = useState(false);
    const [loading, setLoading] = useState(true);

    const myRole = getUserRole(currentUserData, currentUser?.uid);
    const assignable = getAssignableRoles(currentUserData, currentUser?.uid);

    useEffect(() => {
        // جلب المشرفين الحاليين
        const fetchStaff = async () => {
            try {
                const snap = await usersCollection.where('staffRole.role', 'in', ['admin','moderator']).get();
                const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setStaffList(list);
            } catch(e) {}
            setLoading(false);
        };
        fetchStaff();
    }, [assigning]);

    const handleSearch = async () => {
        if (!searchId.trim()) return;
        try {
            const snap = await usersCollection.where('customId', '==', searchId.trim()).get();
            if (snap.empty) {
                onNotification(lang==='ar'?'❌ المستخدم غير موجود':'❌ User not found');
                setSearchResult(null);
                return;
            }
            const doc = snap.docs[0];
            setSearchResult({ id: doc.id, ...doc.data() });
        } catch(e) { onNotification('❌ Error'); }
    };

    const assignRole = async (targetUID, targetName, role) => {
        if (!currentUser || !role) return;
        setAssigning(true);
        try {
            if (role === 'remove') {
                await usersCollection.doc(targetUID).update({ staffRole: firebase.firestore.FieldValue.delete() });
                await logStaffAction(currentUser.uid, currentUserData?.displayName, 'REMOVE_ROLE', targetUID, targetName, 'Role removed');
                onNotification(lang==='ar'?'✅ تم إزالة الرتبة':'✅ Role removed');
            } else {
                await usersCollection.doc(targetUID).update({
                    staffRole: { role, assignedBy: currentUser.uid, assignedAt: firebase.firestore.FieldValue.serverTimestamp() }
                });
                await logStaffAction(currentUser.uid, currentUserData?.displayName, `ASSIGN_${role.toUpperCase()}`, targetUID, targetName, `Assigned role: ${role}`);
                onNotification(`✅ ${lang==='ar'?'تم تعيين':'Assigned'} ${role}`);
            }
            setSearchResult(null);
            setSearchId('');
        } catch(e) { onNotification('❌ Error'); }
        setAssigning(false);
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#ffd700', marginBottom:'16px' }}>
                👥 {lang==='ar'?'إدارة الفريق':'Staff Management'}
            </div>

            {/* Search user */}
            <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
                <input
                    className="input-dark"
                    style={{ flex:1, padding:'8px 12px', borderRadius:'8px', fontSize:'12px' }}
                    placeholder={lang==='ar'?'ابحث بـ ID المستخدم':'Search by User ID'}
                    value={searchId}
                    onChange={e => setSearchId(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && handleSearch()}
                />
                <button className="btn-neon" style={{ padding:'8px 14px', borderRadius:'8px', fontSize:'12px' }} onClick={handleSearch}>
                    🔍
                </button>
            </div>

            {/* Search result */}
            {searchResult && (
                <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'12px', marginBottom:'16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                        <img src={searchResult.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(searchResult.displayName||'U')}&background=7000ff&color=fff&size=100`}
                            style={{ width:'36px', height:'36px', borderRadius:'50%', objectFit:'cover' }} />
                        <div>
                            <div style={{ fontWeight:700, fontSize:'13px' }}>{searchResult.displayName}</div>
                            <div style={{ fontSize:'10px', color:'#6b7280' }}>ID: {searchResult.customId} • {getUserRole(searchResult, searchResult.id) ? `Role: ${getUserRole(searchResult, searchResult.id)}` : 'No role'}</div>
                        </div>
                    </div>
                    <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                        {assignable.map(role => (
                            <button key={role} onClick={() => assignRole(searchResult.id, searchResult.displayName, role)}
                                disabled={assigning || searchResult.id === OWNER_UID}
                                style={{ padding:'5px 12px', borderRadius:'6px', fontSize:'11px', fontWeight:700, cursor:'pointer', border:'1px solid',
                                    background: role==='admin'?'rgba(239,68,68,0.15)':'rgba(59,130,246,0.15)',
                                    borderColor: role==='admin'?'rgba(239,68,68,0.4)':'rgba(59,130,246,0.4)',
                                    color: role==='admin'?'#ef4444':'#3b82f6'
                                }}>
                                {ROLE_CONFIG[role]?.icon} {lang==='ar'?ROLE_CONFIG[role]?.label_ar:ROLE_CONFIG[role]?.label_en}
                            </button>
                        ))}
                        {getUserRole(searchResult, searchResult.id) && getUserRole(searchResult, searchResult.id) !== 'owner' && (
                            <button onClick={() => assignRole(searchResult.id, searchResult.displayName, 'remove')}
                                disabled={assigning}
                                style={{ padding:'5px 12px', borderRadius:'6px', fontSize:'11px', fontWeight:700, cursor:'pointer',
                                    background:'rgba(107,114,128,0.15)', border:'1px solid rgba(107,114,128,0.3)', color:'#9ca3af' }}>
                                🗑️ {lang==='ar'?'إزالة الرتبة':'Remove Role'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Current staff list */}
            <div style={{ fontSize:'11px', fontWeight:700, color:'#9ca3af', marginBottom:'8px', textTransform:'uppercase' }}>
                {lang==='ar'?'الفريق الحالي':'Current Staff'}
            </div>
            {loading ? <div style={{color:'#6b7280',fontSize:'12px'}}>⏳</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                    {/* Owner row */}
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px', background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.2)', borderRadius:'8px' }}>
                        <div style={{ fontSize:'18px' }}>👑</div>
                        <div style={{ flex:1 }}>
                            <div style={{ fontSize:'12px', fontWeight:700, color:'#ffd700' }}>Owner</div>
                            <div style={{ fontSize:'10px', color:'#6b7280' }}>UID: {OWNER_UID.slice(0,16)}...</div>
                        </div>
                        <div style={{ fontSize:'10px', padding:'3px 8px', background:'rgba(255,215,0,0.15)', border:'1px solid rgba(255,215,0,0.3)', borderRadius:'4px', color:'#ffd700' }}>
                            {lang==='ar'?'المالك':'Owner'}
                        </div>
                    </div>
                    {staffList.length === 0 && (
                        <div style={{ fontSize:'12px', color:'#6b7280', textAlign:'center', padding:'12px' }}>
                            {lang==='ar'?'لا يوجد مشرفون بعد':'No staff assigned yet'}
                        </div>
                    )}
                    {staffList.map(s => {
                        const role = s.staffRole?.role;
                        const rc = ROLE_CONFIG[role] || {};
                        return (
                            <div key={s.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px', background:`${rc.bg||'rgba(255,255,255,0.04)'}`, border:`1px solid ${rc.border||'rgba(255,255,255,0.1)'}`, borderRadius:'8px' }}>
                                <img src={s.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.displayName||'U')}&background=7000ff&color=fff&size=100`}
                                    style={{ width:'30px', height:'30px', borderRadius:'50%', objectFit:'cover' }} />
                                <div style={{ flex:1 }}>
                                    <div style={{ fontSize:'12px', fontWeight:700, color:rc.color||'white' }}>{s.displayName}</div>
                                    <div style={{ fontSize:'10px', color:'#6b7280' }}>ID: {s.customId}</div>
                                </div>
                                <div style={{ fontSize:'10px', padding:'3px 8px', background:`${rc.bg}`, border:`1px solid ${rc.border}`, borderRadius:'4px', color:rc.color }}>
                                    {rc.icon} {lang==='ar'?rc.label_ar:rc.label_en}
                                </div>
                                {myRole === 'owner' && (
                                    <button onClick={() => assignRole(s.id, s.displayName, 'remove')}
                                        style={{ fontSize:'12px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'5px', padding:'3px 6px', cursor:'pointer', color:'#ef4444' }}>
                                        ✕
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ════════════════════════════════════════════════════════
// 🚫 USER MANAGEMENT (Admin + Owner)
// ════════════════════════════════════════════════════════
const UserManagementSection = ({ currentUser, currentUserData, lang, onNotification }) => {
    const [searchId, setSearchId] = useState('');
    const [targetUser, setTargetUser] = useState(null);
    const [banDuration, setBanDuration] = useState('7');
    const [banReason, setBanReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSearch = async () => {
        if (!searchId.trim()) return;
        try {
            // Search by customId or UID
            let snap = await usersCollection.where('customId', '==', searchId.trim()).get();
            if (snap.empty) snap = await usersCollection.where(firebase.firestore.FieldPath.documentId(), '==', searchId.trim()).limit(1).get();
            if (snap.empty) { onNotification(lang==='ar'?'❌ المستخدم غير موجود':'❌ User not found'); setTargetUser(null); return; }
            const doc = snap.docs[0];
            setTargetUser({ id: doc.id, ...doc.data() });
        } catch(e) { onNotification('❌ Error'); }
    };

    const handleBan = async () => {
        if (!targetUser || !currentUser) return;
        if (targetUser.id === currentUser.uid) { onNotification(lang==='ar'?'لا يمكنك حظر نفسك':'Cannot ban yourself'); return; }
        if (getUserRole(targetUser, targetUser.id) === 'owner') { onNotification(lang==='ar'?'لا يمكنك حظر المالك':'Cannot ban owner'); return; }
        setProcessing(true);
        try {
            let expiresAt = null;
            if (banDuration !== 'permanent') {
                const d = new Date();
                d.setDate(d.getDate() + parseInt(banDuration));
                expiresAt = firebase.firestore.Timestamp.fromDate(d);
            }
            await usersCollection.doc(targetUser.id).update({
                ban: { isBanned: true, bannedBy: currentUser.uid, reason: banReason || 'Violation', expiresAt, bannedAt: firebase.firestore.FieldValue.serverTimestamp() }
            });
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'BAN_USER', targetUser.id, targetUser.displayName, `Duration: ${banDuration} days. Reason: ${banReason}`);
            onNotification(`✅ ${lang==='ar'?'تم الحظر':'User banned'}`);
            setTargetUser(prev => ({ ...prev, ban: { isBanned: true } }));
        } catch(e) { onNotification('❌ Error'); }
        setProcessing(false);
    };

    const handleUnban = async () => {
        if (!targetUser || !currentUser) return;
        setProcessing(true);
        try {
            await usersCollection.doc(targetUser.id).update({ ban: firebase.firestore.FieldValue.delete() });
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'UNBAN_USER', targetUser.id, targetUser.displayName, 'User unbanned');
            onNotification(`✅ ${lang==='ar'?'تم رفع الحظر':'User unbanned'}`);
            setTargetUser(prev => ({ ...prev, ban: null }));
        } catch(e) { onNotification('❌ Error'); }
        setProcessing(false);
    };

    const isBanned = targetUser ? isBannedUser(targetUser) : false;

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#ef4444', marginBottom:'16px' }}>
                🚫 {lang==='ar'?'إدارة المستخدمين':'User Management'}
            </div>
            <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
                <input className="input-dark" style={{ flex:1, padding:'8px 12px', borderRadius:'8px', fontSize:'12px' }}
                    placeholder={lang==='ar'?'ID المستخدم':'User ID or UID'}
                    value={searchId} onChange={e => setSearchId(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && handleSearch()} />
                <button className="btn-neon" style={{ padding:'8px 14px', borderRadius:'8px', fontSize:'12px' }} onClick={handleSearch}>🔍</button>
            </div>

            {targetUser && (
                <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                        <img src={targetUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser.displayName||'U')}&background=7000ff&color=fff&size=100`}
                            style={{ width:'42px', height:'42px', borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(255,255,255,0.1)' }} />
                        <div style={{ flex:1 }}>
                            <div style={{ fontWeight:800, fontSize:'13px' }}>{targetUser.displayName}</div>
                            <div style={{ fontSize:'10px', color:'#6b7280' }}>ID: {targetUser.customId} • {lang==='ar'?'انتصارات':'Wins'}: {targetUser.stats?.wins || 0}</div>
                            {isBanned && <div style={{ fontSize:'10px', color:'#ef4444', fontWeight:700 }}>⛔ {lang==='ar'?'محظور':'BANNED'} — {formatBanExpiry(targetUser, lang)}</div>}
                        </div>
                        {getUserRole(targetUser, targetUser.id) && (
                            <div style={{ fontSize:'10px', padding:'3px 8px', background:'rgba(255,215,0,0.1)', border:'1px solid rgba(255,215,0,0.3)', borderRadius:'4px', color:'#ffd700' }}>
                                {ROLE_CONFIG[getUserRole(targetUser, targetUser.id)]?.icon} {getUserRole(targetUser, targetUser.id)}
                            </div>
                        )}
                    </div>

                    {/* Stats row */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'14px' }}>
                        {[
                            { label: lang==='ar'?'انتصارات':'Wins', val: targetUser.stats?.wins || 0, color:'#10b981' },
                            { label: lang==='ar'?'خسارات':'Losses', val: targetUser.stats?.losses || 0, color:'#ef4444' },
                            { label: lang==='ar'?'إنتل':'Intel', val: targetUser.currency || 0, color:'#00f2ff' },
                        ].map(s => (
                            <div key={s.label} style={{ background:'rgba(255,255,255,0.04)', borderRadius:'8px', padding:'8px', textAlign:'center' }}>
                                <div style={{ fontSize:'15px', fontWeight:800, color:s.color }}>{s.val}</div>
                                <div style={{ fontSize:'9px', color:'#6b7280' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Ban controls */}
                    {!isBanned ? (
                        <div>
                            <div style={{ fontSize:'11px', color:'#9ca3af', marginBottom:'6px' }}>{lang==='ar'?'مدة الحظر:':'Ban Duration:'}</div>
                            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'8px' }}>
                                {['1','3','7','30','permanent'].map(d => (
                                    <button key={d} onClick={() => setBanDuration(d)}
                                        style={{ padding:'4px 10px', borderRadius:'6px', fontSize:'11px', cursor:'pointer', fontWeight: banDuration===d?700:400,
                                            background: banDuration===d?'rgba(239,68,68,0.3)':'rgba(255,255,255,0.05)',
                                            border: banDuration===d?'1px solid rgba(239,68,68,0.6)':'1px solid rgba(255,255,255,0.1)',
                                            color: banDuration===d?'#ef4444':'#9ca3af'
                                        }}>
                                        {d==='permanent'?(lang==='ar'?'دائم':'Permanent'):`${d}d`}
                                    </button>
                                ))}
                            </div>
                            <input className="input-dark" style={{ width:'100%', padding:'7px 10px', borderRadius:'8px', fontSize:'11px', marginBottom:'8px' }}
                                placeholder={lang==='ar'?'سبب الحظر (اختياري)':'Reason (optional)'}
                                value={banReason} onChange={e => setBanReason(e.target.value)} />
                            <button onClick={handleBan} disabled={processing || targetUser.id === OWNER_UID}
                                className="btn-danger" style={{ width:'100%', padding:'8px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer', opacity: targetUser.id===OWNER_UID?0.4:1 }}>
                                {processing ? '⏳' : `⛔ ${lang==='ar'?'حظر المستخدم':'Ban User'}`}
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleUnban} disabled={processing}
                            className="btn-neon" style={{ width:'100%', padding:'8px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                            {processing ? '⏳' : `✅ ${lang==='ar'?'رفع الحظر':'Unban User'}`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// ════════════════════════════════════════════════════════
// 📢 BROADCAST NOTIFICATION (Admin + Owner)
// ════════════════════════════════════════════════════════
const BroadcastSection = ({ currentUser, currentUserData, lang, onNotification }) => {
    const [msg, setMsg] = useState('');
    const [msgAr, setMsgAr] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(0);

    const handleBroadcast = async () => {
        const text = lang==='ar' ? msgAr : msg;
        if (!text.trim() || !currentUser) return;
        setSending(true);
        try {
            const usersSnap = await usersCollection.limit(500).get();
            const batch = db.batch();
            let count = 0;
            usersSnap.docs.forEach(doc => {
                const ref = notificationsCollection.doc();
                batch.set(ref, {
                    toUserId: doc.id,
                    type: 'system_broadcast',
                    message_en: msg || text,
                    message_ar: msgAr || text,
                    message: text,
                    fromName: lang==='ar'?'فريق PRO SPY':'PRO SPY Team',
                    icon: '📢',
                    read: false,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                count++;
            });
            await batch.commit();
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'BROADCAST', null, null, `Sent to ${count} users: ${text.slice(0,100)}`);
            setSent(count);
            setMsg(''); setMsgAr('');
            onNotification(`✅ ${lang==='ar'?`تم الإرسال لـ ${count} مستخدم`:`Sent to ${count} users`}`);
        } catch(e) { onNotification('❌ Error'); }
        setSending(false);
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#f59e0b', marginBottom:'16px' }}>
                📢 {lang==='ar'?'إشعار جماعي':'Broadcast Notification'}
            </div>
            <div style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'12px', padding:'14px' }}>
                <textarea className="input-dark" style={{ width:'100%', padding:'8px 12px', borderRadius:'8px', fontSize:'12px', minHeight:'70px', resize:'vertical', marginBottom:'8px' }}
                    placeholder="Message (EN)"
                    value={msg} onChange={e => setMsg(e.target.value)} />
                <textarea className="input-dark" style={{ width:'100%', padding:'8px 12px', borderRadius:'8px', fontSize:'12px', minHeight:'70px', resize:'vertical', marginBottom:'10px', direction:'rtl' }}
                    placeholder="الرسالة (عربي)"
                    value={msgAr} onChange={e => setMsgAr(e.target.value)} />
                <button onClick={handleBroadcast} disabled={sending || (!msg.trim() && !msgAr.trim())}
                    style={{ width:'100%', padding:'9px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer',
                        background:'linear-gradient(135deg,rgba(245,158,11,0.3),rgba(217,119,6,0.2))',
                        border:'1px solid rgba(245,158,11,0.5)', color:'#f59e0b', opacity:sending?0.5:1 }}>
                    {sending ? '⏳ Sending...' : `📢 ${lang==='ar'?'إرسال للجميع':'Send to All'}`}
                </button>
                {sent > 0 && <div style={{fontSize:'11px',color:'#10b981',textAlign:'center',marginTop:'8px'}}>✅ Sent to {sent} users</div>}
            </div>
        </div>
    );
};

// ════════════════════════════════════════════════════════
// 📋 MODERATOR ACTIVITY LOG (Admin + Owner)
// ════════════════════════════════════════════════════════
const ActivityLogSection = ({ lang }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = staffLogCollection.orderBy('timestamp', 'desc').limit(50).onSnapshot(snap => {
            setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, []);

    const actionColors = {
        BAN_USER: '#ef4444', UNBAN_USER: '#10b981',
        ASSIGN_ADMIN: '#ffd700', ASSIGN_MODERATOR: '#3b82f6',
        REMOVE_ROLE: '#9ca3af', BROADCAST: '#f59e0b',
        RESOLVE_REPORT: '#10b981', CLOSE_TICKET: '#6b7280', DELETE_MOMENT: '#ef4444'
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#3b82f6', marginBottom:'16px' }}>
                📋 {lang==='ar'?'سجل نشاط الفريق':'Staff Activity Log'}
            </div>
            {loading ? <div style={{color:'#6b7280',fontSize:'12px',textAlign:'center',padding:'20px'}}>⏳</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:'6px', maxHeight:'50vh', overflowY:'auto' }}>
                    {logs.length === 0 && <div style={{color:'#6b7280',fontSize:'12px',textAlign:'center',padding:'20px'}}>{lang==='ar'?'لا توجد سجلات':'No logs yet'}</div>}
                    {logs.map(log => {
                        const ts = log.timestamp?.toDate?.();
                        const color = actionColors[log.action] || '#9ca3af';
                        return (
                            <div key={log.id} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${color}20`, borderRadius:'8px', padding:'10px', borderLeft:`3px solid ${color}` }}>
                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                                    <span style={{ fontSize:'11px', fontWeight:700, color }}>{log.action?.replace(/_/g,' ')}</span>
                                    <span style={{ fontSize:'9px', color:'#6b7280' }}>{ts ? ts.toLocaleString() : ''}</span>
                                </div>
                                <div style={{ fontSize:'11px', color:'#d1d5db' }}>
                                    <strong>{log.staffName}</strong>{log.targetName ? ` → ${log.targetName}` : ''}
                                </div>
                                {log.details && <div style={{ fontSize:'10px', color:'#6b7280', marginTop:'2px' }}>{log.details}</div>}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ── Inline Ban Panel (used inside Reports) ───────────────
const BanPanelInline = ({ reportedUID, reportedName, reportId, currentUser, currentUserData, lang, onDone, onCancel }) => {
    const [banReason, setBanReason]     = useState('');
    const [banDuration, setBanDuration] = useState('7d');
    const [banning, setBanning]         = useState(false);

    const durations = [
        { val:'1d',   ar:'يوم واحد',   en:'1 Day'    },
        { val:'3d',   ar:'3 أيام',     en:'3 Days'   },
        { val:'7d',   ar:'أسبوع',      en:'1 Week'   },
        { val:'30d',  ar:'شهر',        en:'1 Month'  },
        { val:'perm', ar:'دائم',       en:'Permanent'},
    ];

    const handleBan = async () => {
        if (!banReason.trim()) return;
        setBanning(true);
        try {
            let expiresAt = null;
            if (banDuration !== 'perm') {
                const days = parseInt(banDuration);
                expiresAt = new Date(Date.now() + days * 864e5);
            }
            await usersCollection.doc(reportedUID).update({
                ban: {
                    isBanned:  true,
                    bannedBy:  currentUser.uid,
                    bannedByName: currentUserData?.displayName || 'Admin',
                    reason:    banReason.trim(),
                    expiresAt: expiresAt ? firebase.firestore.Timestamp.fromDate(expiresAt) : null,
                    bannedAt:  firebase.firestore.FieldValue.serverTimestamp(),
                    permanent: banDuration === 'perm',
                }
            });
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'BAN_USER',
                reportedUID, reportedName,
                `Reason: ${banReason} | Duration: ${banDuration} | From report: ${reportId}`
            );
            // Mark report as resolved
            if (reportId) {
                const reportDoc = await reportsCollection.doc(reportId).get().catch(()=>null);
                if (reportDoc && reportDoc.exists) {
                    const reporterUID = reportDoc.data()?.reporterUID;
                    await reportsCollection.doc(reportId).update({ resolved: true, resolvedAt: firebase.firestore.FieldValue.serverTimestamp() }).catch(()=>{});
                    // Send detective bot message to reporter
                    if (reporterUID && typeof botChatsCollection !== 'undefined') {
                        const durLabel = banDuration === 'perm'
                            ? (lang==='ar'?'حظر دائم':'permanent ban')
                            : `${banDuration} ${lang==='ar'?'يوم':'day ban'}`;
                        await botChatsCollection.add({
                            botId: 'detective_bot',
                            toUserId: reporterUID,
                            type: 'report_resolved',
                            message: lang==='ar'
                                ? `🕵️ تم مراجعة بلاغك ضد "${reportedName}".\n✅ الإجراء: ${durLabel}\nالسبب: ${banReason}\n\nشكراً لمساعدتنا في الحفاظ على سلامة المجتمع.`
                                : `🕵️ Your report against "${reportedName}" has been reviewed.\n✅ Action taken: ${durLabel}\nReason: ${banReason}\n\nThank you for keeping the community safe.`,
                            fromName: null,
                            fromPhoto: null,
                            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                            read: false,
                        }).catch(()=>{});
                    }
                }
            }
            onDone(`🔨 ${lang==='ar'?`تم حظر ${reportedName}`:`${reportedName} banned`}`);
        } catch(e) {
            onDone('❌ Error banning user');
        }
        setBanning(false);
    };

    return (
        <div style={{ background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'10px', padding:'12px', marginTop:'8px' }}>
            <div style={{ fontSize:'11px', color:'#ef4444', fontWeight:700, marginBottom:'10px' }}>
                🔨 {lang==='ar'?`حظر ${reportedName}`:`Ban ${reportedName}`}
            </div>
            {/* Duration */}
            <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'5px' }}>{lang==='ar'?'مدة الحظر:':'Duration:'}</div>
            <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', marginBottom:'8px' }}>
                {durations.map(d => (
                    <button key={d.val} onClick={() => setBanDuration(d.val)}
                        style={{ padding:'4px 9px', borderRadius:'5px', fontSize:'10px', cursor:'pointer', fontWeight:banDuration===d.val?700:400,
                            background:banDuration===d.val?'rgba(239,68,68,0.25)':'rgba(255,255,255,0.05)',
                            border:banDuration===d.val?'1px solid rgba(239,68,68,0.5)':'1px solid rgba(255,255,255,0.1)',
                            color:banDuration===d.val?'#ef4444':'#9ca3af' }}>
                        {lang==='ar'?d.ar:d.en}
                    </button>
                ))}
            </div>
            {/* Reason */}
            <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'5px' }}>{lang==='ar'?'سبب الحظر:':'Ban reason:'}</div>
            <input className="input-dark"
                style={{ width:'100%', padding:'7px 10px', borderRadius:'6px', fontSize:'11px', marginBottom:'8px' }}
                placeholder={lang==='ar'?'اكتب سبب الحظر...':'Enter ban reason...'}
                value={banReason} onChange={e => setBanReason(e.target.value)} />
            <div style={{ display:'flex', gap:'6px' }}>
                <button onClick={handleBan} disabled={banning || !banReason.trim()}
                    style={{ flex:1, padding:'6px', borderRadius:'6px', fontSize:'11px', cursor:'pointer', fontWeight:700,
                        background:'rgba(239,68,68,0.25)', border:'1px solid rgba(239,68,68,0.5)', color:'#ef4444',
                        opacity:banReason.trim()?1:0.4 }}>
                    {banning?'⏳':`🔨 ${lang==='ar'?'تأكيد الحظر':'Confirm Ban'}`}
                </button>
                <button onClick={onCancel}
                    style={{ padding:'6px 10px', borderRadius:'6px', fontSize:'11px', cursor:'pointer',
                        background:'rgba(107,114,128,0.15)', border:'1px solid rgba(107,114,128,0.3)', color:'#9ca3af' }}>
                    ✕
                </button>
            </div>
        </div>
    );
};

// ════════════════════════════════════════════════════════
// 🚨 REPORTS SECTION (Moderator + Admin + Owner)
// ════════════════════════════════════════════════════════
const ReportsSection = ({ currentUser, currentUserData, lang, onNotification, onOpenProfile }) => {
    const [reports, setReports]           = useState([]);
    const [loading, setLoading]           = useState(true);
    const [filter, setFilter]             = useState('open');
    const [escalating, setEscalating]     = useState(null);
    const [escalateNote, setEscalateNote] = useState('');
    const [staffList, setStaffList]       = useState([]);
    const [selectedEscalateTo, setSelectedEscalateTo] = useState('');
    const [banningUID, setBanningUID]     = useState(null); // report.id of the one being banned

    const myRole = getUserRole(currentUserData, currentUser?.uid);

    // ✅ جلب كل البلاغات — بدون orderBy لتجنب index issues
    useEffect(() => {
        let unsubscribed = false;

        const sortReports = (data) => {
            return data.sort((a, b) => {
                const ta = a.createdAt?.toMillis?.() || a.timestamp?.toMillis?.()
                         || (a.createdAt?.seconds  * 1000) || (a.timestamp?.seconds  * 1000) || 0;
                const tb = b.createdAt?.toMillis?.() || b.timestamp?.toMillis?.()
                         || (b.createdAt?.seconds  * 1000) || (b.timestamp?.seconds  * 1000) || 0;
                return tb - ta;
            });
        };

        // نحاول onSnapshot أولاً
        let unsub;
        try {
            unsub = reportsCollection.limit(200).onSnapshot(
                snap => {
                    if (unsubscribed) return;
                    setReports(sortReports(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
                    setLoading(false);
                },
                async (err) => {
                    // onSnapshot فشل — نستخدم get() بدلاً منه
                    console.warn('[Reports] onSnapshot failed, falling back to get():', err?.message);
                    try {
                        const snap = await reportsCollection.limit(200).get();
                        if (!unsubscribed) {
                            setReports(sortReports(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
                            setLoading(false);
                        }
                    } catch (e2) {
                        console.error('[Reports] get() also failed:', e2?.message);
                        if (!unsubscribed) setLoading(false);
                    }
                }
            );
        } catch (e) {
            console.error('[Reports] Failed to init listener:', e?.message);
            setLoading(false);
        }

        return () => {
            unsubscribed = true;
            if (unsub) unsub();
        };
    }, []);

    // ✅ جلب Staff List — fallback لو الـ nested-field query فشلت
    useEffect(() => {
        const ownerEntry = { id: OWNER_UID, displayName: 'Owner 👑', staffRole: { role: 'owner' } };

        // نحاول أولاً بـ nested field query
        usersCollection.where('staffRole.role', 'in', ['admin', 'moderator']).get()
            .then(snap => {
                const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setStaffList([ownerEntry, ...list]);
            })
            .catch(() => {
                // لو فشلت (مش في index)، نجيب كل المستخدمين ونفلتر client-side
                // بس نحدد limit عشان ما تكونش ثقيلة
                usersCollection.limit(500).get()
                    .then(snap => {
                        const list = snap.docs
                            .map(d => ({ id: d.id, ...d.data() }))
                            .filter(u => u.staffRole?.role === 'admin' || u.staffRole?.role === 'moderator');
                        setStaffList([ownerEntry, ...list]);
                    })
                    .catch(() => {
                        // آخر fallback: بس الـ Owner
                        setStaffList([ownerEntry]);
                    });
            });
    }, []);

    // ── Helper: وقت البلاغ ──
    const getReportTime = (r) => {
        const ts = r.createdAt || r.timestamp;
        if (!ts) return '';
        const d = ts.toDate?.() || new Date(ts);
        return isNaN(d) ? '' : d.toLocaleDateString(lang==='ar'?'ar-EG':'en-US', { day:'numeric', month:'short', year:'numeric' });
    };

    // ── Helper: اسم المُبلَّغ عنه ──
    const getReportedName = (r) => {
        // user report
        if (r.reportedName) return r.reportedName;
        if (r.reportedUID)  return r.reportedUID.slice(0,12) + '...';
        // moment report
        if (r.type === 'moment' || r.type === 'moment_comment') return lang==='ar'?'محتوى (لحظة)':'Content (Moment)';
        return lang==='ar'?'غير معروف':'Unknown';
    };

    // ── Helper: نوع البلاغ ──
    const getReportType = (r) => {
        if (r.type === 'moment')         return { label: lang==='ar'?'لحظة':'Moment',  color:'#8b5cf6', icon:'📸' };
        if (r.type === 'moment_comment') return { label: lang==='ar'?'تعليق':'Comment', color:'#6366f1', icon:'💬' };
        return { label: lang==='ar'?'مستخدم':'User', color:'#ef4444', icon:'👤' };
    };

    const resolveReport = async (reportId, reportData) => {
        try {
            await reportsCollection.doc(reportId).update({
                resolved: true,
                status: 'resolved',
                resolvedBy: currentUser.uid,
                resolvedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'RESOLVE_REPORT',
                reportData.reportedUID || reportData.targetOwnerUID,
                getReportedName(reportData),
                `Report type: ${reportData.type||'user'} | Reason: ${reportData.reason||''}`
            );
            // Send detective bot message to reporter (no action taken)
            const reporterUID = reportData.reporterUID;
            if (reporterUID && typeof botChatsCollection !== 'undefined') {
                await botChatsCollection.add({
                    botId: 'detective_bot',
                    toUserId: reporterUID,
                    type: 'report_resolved_no_action',
                    message: lang==='ar'
                        ? `🕵️ تم مراجعة بلاغك ضد "${reportData.reportedName || 'المستخدم'}".\nℹ️ بعد التحقيق، لم يتم اتخاذ إجراء في هذه المرة.\n\nشكراً لمساعدتنا.`
                        : `🕵️ Your report against "${reportData.reportedName || 'user'}" has been reviewed.\nℹ️ After investigation, no action was taken at this time.\n\nThank you for your report.`,
                    fromName: null,
                    fromPhoto: null,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    read: false,
                }).catch(()=>{});
            }
            onNotification(`✅ ${lang==='ar'?'تم حل البلاغ':'Report resolved'}`);
        } catch(e) { onNotification('❌ Error'); }
    };

    const handleEscalate = async (reportId, reportData) => {
        if (!selectedEscalateTo) { onNotification(lang==='ar'?'اختر شخصاً للتصعيد إليه':'Select a staff member to escalate to'); return; }
        try {
            // أضف flag escalated على البلاغ
            await reportsCollection.doc(reportId).update({
                escalated: true,
                escalatedTo: selectedEscalateTo,
                escalatedBy: currentUser.uid,
                escalatedNote: escalateNote,
                escalatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            // أرسل notification للمسؤول اللي صعّدنا إليه
            const targetStaff = staffList.find(s => s.id === selectedEscalateTo);
            await notificationsCollection.add({
                toUserId: selectedEscalateTo,
                type: 'escalated_report',
                message_en: `Report escalated to you by ${currentUserData?.displayName}. Reason: ${reportData.reason || ''}`,
                message_ar: `تم تصعيد بلاغ إليك من ${currentUserData?.displayName}. السبب: ${reportData.reason || ''}`,
                message: `Escalated report from ${currentUserData?.displayName}`,
                icon: '🚨',
                read: false,
                reportId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'ESCALATE_REPORT',
                reportData.reportedUID || null, getReportedName(reportData),
                `Escalated to ${targetStaff?.displayName||selectedEscalateTo}. Note: ${escalateNote}`
            );
            onNotification(`✅ ${lang==='ar'?'تم التصعيد':'Escalated successfully'}`);
            setEscalating(null);
            setEscalateNote('');
            setSelectedEscalateTo('');
        } catch(e) { onNotification('❌ Error'); }
    };

    const filtered = reports.filter(r => {
        if (filter === 'all')      return true;
        if (filter === 'open')     return !r.resolved && r.status !== 'resolved';
        if (filter === 'resolved') return r.resolved || r.status === 'resolved';
        if (filter === 'escalated') return r.escalated === true;
        return true;
    });

    const openCount      = reports.filter(r => !r.resolved && r.status !== 'resolved').length;
    const escalatedCount = reports.filter(r => r.escalated).length;

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#ef4444', marginBottom:'12px' }}>
                🚨 {lang==='ar'?'بلاغات المستخدمين':'User Reports'}
                <span style={{ marginLeft:'8px', fontSize:'11px', color:'#6b7280', fontWeight:400 }}>
                    ({reports.length} {lang==='ar'?'إجمالي':'total'})
                </span>
            </div>

            {/* Filter tabs */}
            <div style={{ display:'flex', gap:'6px', marginBottom:'14px', flexWrap:'wrap' }}>
                {[
                    { id:'open',      label_ar:`مفتوح (${openCount})`,      label_en:`Open (${openCount})` },
                    { id:'escalated', label_ar:`مُصعَّد (${escalatedCount})`, label_en:`Escalated (${escalatedCount})` },
                    { id:'resolved',  label_ar:'محلول',   label_en:'Resolved' },
                    { id:'all',       label_ar:'الكل',    label_en:'All' },
                ].map(f => (
                    <button key={f.id} onClick={() => setFilter(f.id)}
                        style={{ padding:'4px 12px', borderRadius:'6px', fontSize:'11px', cursor:'pointer', fontWeight: filter===f.id?700:400,
                            background: filter===f.id?'rgba(239,68,68,0.2)':'rgba(255,255,255,0.05)',
                            border: filter===f.id?'1px solid rgba(239,68,68,0.5)':'1px solid rgba(255,255,255,0.1)',
                            color: filter===f.id?'#ef4444':'#9ca3af' }}>
                        {lang==='ar' ? f.label_ar : f.label_en}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{color:'#6b7280',fontSize:'12px',textAlign:'center',padding:'30px'}}>⏳ {lang==='ar'?'جاري التحميل...':'Loading...'}</div>
            ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px', maxHeight:'55vh', overflowY:'auto', paddingBottom:'8px' }}>
                    {filtered.length === 0 && (
                        <div style={{color:'#6b7280',fontSize:'12px',textAlign:'center',padding:'30px'}}>
                            {lang==='ar'?'لا توجد بلاغات في هذا التصنيف':'No reports in this category'}
                        </div>
                    )}

                    {filtered.map(report => {
                        const typeInfo      = getReportType(report);
                        const isResolved    = report.resolved || report.status === 'resolved';
                        const isEscalated   = !!report.escalated;
                        const isEscalatingThis = escalating === report.id;
                        const reportedUID   = report.reportedUID || report.targetOwnerUID;
                        const reportedName  = getReportedName(report);
                        const reportedPhoto = report.reportedPhoto || null;
                        const reasonLabels  = { abusive:'🤬 سلوك مسيء', verbal_abuse:'💬 شتيمة', cheating:'🎮 غش', fraud:'💰 احتيال', avatar:'🖼️ صورة مسيئة', spam:'📢 سبام', other:'❓ أخرى' };

                        return (
                            <div key={report.id} style={{
                                background:'rgba(255,255,255,0.03)',
                                border:`1px solid ${isResolved?'rgba(16,185,129,0.2)':isEscalated?'rgba(245,158,11,0.25)':'rgba(239,68,68,0.2)'}`,
                                borderRadius:'12px',
                                borderLeft:`3px solid ${isResolved?'#10b981':isEscalated?'#f59e0b':'#ef4444'}`
                            }}>
                                {/* ── Top: User card ── */}
                                <div style={{ padding:'10px 12px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                                        {/* Avatar — clickable to open profile */}
                                        <div style={{ position:'relative', flexShrink:0 }}>
                                            <img
                                                src={reportedPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(reportedName)}&background=7000ff&color=fff&size=80`}
                                                style={{ width:'44px', height:'44px', borderRadius:'50%', objectFit:'cover', border:`2px solid ${isResolved?'#10b981':'#ef4444'}40`, cursor: reportedUID?'pointer':'default' }}
                                                onClick={() => { if (reportedUID && onOpenProfile) onOpenProfile(reportedUID); }}
                                                title={lang==='ar'?'فتح البروفايل':'Open Profile'}
                                            />
                                            {!isResolved && !isEscalated && (
                                                <span style={{ position:'absolute', bottom:0, right:0, width:'12px', height:'12px', borderRadius:'50%', background:'#ef4444', border:'2px solid rgba(10,10,25,0.98)' }} />
                                            )}
                                        </div>
                                        {/* Name + UID + type */}
                                        <div style={{ flex:1, minWidth:0 }}>
                                            <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }}>
                                                <span style={{ fontSize:'13px', fontWeight:800, color:'white', cursor: reportedUID?'pointer':'default' }}
                                                    onClick={() => { if (reportedUID && onOpenProfile) onOpenProfile(reportedUID); }}>
                                                    {reportedName}
                                                </span>
                                                <span style={{ fontSize:'10px', padding:'1px 6px', borderRadius:'4px', fontWeight:700,
                                                    background:`${typeInfo.color}18`, border:`1px solid ${typeInfo.color}35`, color:typeInfo.color }}>
                                                    {typeInfo.icon} {typeInfo.label}
                                                </span>
                                            </div>
                                            {reportedUID && (
                                                <div style={{ fontSize:'10px', color:'#6b7280', fontFamily:'monospace', marginTop:'2px' }}>
                                                    ID: {reportedUID}
                                                </div>
                                            )}
                                        </div>
                                        {/* Status + time */}
                                        <div style={{ textAlign:'right', flexShrink:0 }}>
                                            <div style={{ fontSize:'10px', fontWeight:700, padding:'2px 7px', borderRadius:'4px',
                                                background: isResolved?'rgba(16,185,129,0.12)':isEscalated?'rgba(245,158,11,0.12)':'rgba(239,68,68,0.1)',
                                                color: isResolved?'#10b981':isEscalated?'#f59e0b':'#ef4444', marginBottom:'3px' }}>
                                                {isResolved?'✅':isEscalated?'🔺':'⚠️'} {isResolved?(lang==='ar'?'محلول':'Resolved'):isEscalated?(lang==='ar'?'مُصعَّد':'Escalated'):(lang==='ar'?'مفتوح':'Open')}
                                            </div>
                                            <div style={{ fontSize:'10px', color:'#6b7280' }}>{getReportTime(report)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Middle: Report details ── */}
                                <div style={{ padding:'8px 12px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                                    {/* Reason */}
                                    <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'5px' }}>
                                        <span style={{ fontSize:'10px', color:'#9ca3af' }}>{lang==='ar'?'السبب:':'Reason:'}</span>
                                        <span style={{ fontSize:'11px', fontWeight:700, color:'#f3f4f6', background:'rgba(239,68,68,0.08)', padding:'2px 8px', borderRadius:'4px' }}>
                                            {reasonLabels[report.reason] || report.reason || '—'}
                                        </span>
                                    </div>
                                    {/* Description */}
                                    {report.description && (
                                        <div style={{ fontSize:'11px', color:'#d1d5db', background:'rgba(255,255,255,0.03)', borderRadius:'6px', padding:'7px 9px', marginBottom:'5px', lineHeight:1.6 }}>
                                            "{report.description}"
                                        </div>
                                    )}
                                    {/* Reporter */}
                                    <div style={{ fontSize:'10px', color:'#6b7280' }}>
                                        {lang==='ar'?'بلاغ من:':'Reported by:'} <span style={{color:'#9ca3af'}}>{report.reporterName || report.reporterUID?.slice(0,12) || '—'}</span>
                                    </div>
                                    {/* Attached image evidence — thumbnail */}
                                    {report.imageBase64 && (
                                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'5px' }}>
                                            <span style={{ fontSize:'10px', color:'#9ca3af' }}>📎 {lang==='ar'?'دليل:':'Evidence:'}</span>
                                            <img src={report.imageBase64}
                                                style={{ width:'48px', height:'48px', objectFit:'cover', borderRadius:'6px', border:'1px solid rgba(255,255,255,0.15)', cursor:'pointer', flexShrink:0 }}
                                                onClick={() => window.open(report.imageBase64)}
                                                title={lang==='ar'?'اضغط للتكبير':'Click to enlarge'} />
                                            <span style={{ fontSize:'10px', color:'#6b7280' }}>{lang==='ar'?'(اضغط للتكبير)':'(click to enlarge)'}</span>
                                        </div>
                                    )}
                                </div>

                                {/* ── Bottom: Action buttons ── */}
                                <div style={{ padding:'10px 12px 14px 12px' }}>
                                    {isEscalated && !isResolved && (
                                        <div style={{ fontSize:'10px', color:'#f59e0b', marginBottom:'7px' }}>
                                            🔺 {lang==='ar'?'تم التصعيد':'Escalated'}{report.escalatedNote ? ` — ${report.escalatedNote}` : ''}
                                        </div>
                                    )}

                                    {!isResolved && !isEscalatingThis && (
                                        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                                            {/* Resolve */}
                                            <button onClick={() => resolveReport(report.id, report)}
                                                style={{ padding:'5px 12px', borderRadius:'6px', fontSize:'11px', cursor:'pointer', fontWeight:700,
                                                    background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.4)', color:'#10b981' }}>
                                                ✅ {lang==='ar'?'حل البلاغ':'Resolve'}
                                            </button>

                                            {/* View Profile */}
                                            {reportedUID && onOpenProfile && (
                                                <button onClick={() => onOpenProfile(reportedUID)}
                                                    style={{ padding:'5px 12px', borderRadius:'6px', fontSize:'11px', cursor:'pointer', fontWeight:700,
                                                        background:'rgba(0,242,255,0.1)', border:'1px solid rgba(0,242,255,0.3)', color:'#00f2ff' }}>
                                                    👤 {lang==='ar'?'البروفايل':'Profile'}
                                                </button>
                                            )}

                                            {/* Ban — Admin/Owner only */}
                                            {(myRole === 'owner' || myRole === 'admin') && reportedUID && (
                                                <button onClick={() => setBanningUID(report.id)}
                                                    style={{ padding:'5px 12px', borderRadius:'6px', fontSize:'11px', cursor:'pointer', fontWeight:700,
                                                        background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.4)', color:'#ef4444' }}>
                                                    🔨 {lang==='ar'?'حظر':'Ban'}
                                                </button>
                                            )}

                                            {/* Escalate — Moderator only */}
                                            {myRole === 'moderator' && !isEscalated && (
                                                <button onClick={() => { setEscalating(report.id); setEscalateNote(''); setSelectedEscalateTo(''); }}
                                                    style={{ padding:'5px 12px', borderRadius:'6px', fontSize:'11px', cursor:'pointer', fontWeight:700,
                                                        background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.4)', color:'#f59e0b' }}>
                                                    🔺 {lang==='ar'?'تصعيد':'Escalate'}
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Ban Panel */}
                                    {banningUID === report.id && (
                                        <BanPanelInline
                                            reportedUID={reportedUID}
                                            reportedName={reportedName}
                                            reportId={report.id}
                                            currentUser={currentUser}
                                            currentUserData={currentUserData}
                                            lang={lang}
                                            onDone={(msg) => {
                                                // ✅ FIX: لا نستدعي resolveReport هنا لأن BanPanelInline
                                                // تقوم بإرسال رسالة المحقق وتعليم البلاغ كـ resolved بنفسها
                                                // استدعاء resolveReport هنا كان يسبب إرسال رسالتين للمستخدم
                                                setBanningUID(null);
                                                onNotification(msg);
                                            }}
                                            onCancel={() => setBanningUID(null)}
                                        />
                                    )}

                                    {/* Escalate Panel */}
                                    {isEscalatingThis && (
                                        <div style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'8px', padding:'10px', marginTop:'6px' }}>
                                            <div style={{ fontSize:'11px', color:'#f59e0b', fontWeight:700, marginBottom:'8px' }}>
                                                🔺 {lang==='ar'?'تصعيد البلاغ':'Escalate Report'}
                                            </div>
                                            <select value={selectedEscalateTo} onChange={e => setSelectedEscalateTo(e.target.value)}
                                                style={{ width:'100%', padding:'6px 10px', borderRadius:'6px', fontSize:'11px',
                                                    background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.15)', color:'white', marginBottom:'6px' }}>
                                                <option value=''>{lang==='ar'?'— اختر المسؤول —':'— Select staff member —'}</option>
                                                {staffList.filter(s => s.id !== currentUser?.uid).map(s => (
                                                    <option key={s.id} value={s.id}>{s.displayName} ({s.staffRole?.role || 'owner'})</option>
                                                ))}
                                            </select>
                                            <input className="input-dark"
                                                style={{ width:'100%', padding:'6px 10px', borderRadius:'6px', fontSize:'11px', marginBottom:'8px' }}
                                                placeholder={lang==='ar'?'ملاحظة (اختياري)':'Note (optional)'}
                                                value={escalateNote} onChange={e => setEscalateNote(e.target.value)} />
                                            <div style={{ display:'flex', gap:'6px' }}>
                                                <button onClick={() => handleEscalate(report.id, report)} disabled={!selectedEscalateTo}
                                                    style={{ flex:1, padding:'6px', borderRadius:'6px', fontSize:'11px', cursor:'pointer', fontWeight:700,
                                                        background:'rgba(245,158,11,0.25)', border:'1px solid rgba(245,158,11,0.5)', color:'#f59e0b', opacity:selectedEscalateTo?1:0.5 }}>
                                                    🔺 {lang==='ar'?'تأكيد':'Confirm'}
                                                </button>
                                                <button onClick={() => setEscalating(null)}
                                                    style={{ padding:'6px 10px', borderRadius:'6px', fontSize:'11px', cursor:'pointer',
                                                        background:'rgba(107,114,128,0.15)', border:'1px solid rgba(107,114,128,0.3)', color:'#9ca3af' }}>
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ════════════════════════════════════════════════════════
// 🎫 SUPPORT TICKETS (Moderator + Admin + Owner)
// ════════════════════════════════════════════════════════
const TicketsSection = ({ currentUser, currentUserData, lang, onNotification }) => {
    const [tickets, setTickets]               = useState([]);
    const [loading, setLoading]               = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyText, setReplyText]           = useState('');
    const [replying, setReplying]             = useState(false);
    const [filterStatus, setFilterStatus]     = useState('all');
    // Escalation state
    const [escalating, setEscalating]         = useState(false);
    const [escalateNote, setEscalateNote]     = useState('');
    const [escalateTo, setEscalateTo]         = useState('');
    const [staffList, setStaffList]           = useState([]);

    const myRole = getUserRole(currentUserData, currentUser?.uid);

    // جلب التذاكر — بدون orderBy لتجنب index issues
    useEffect(() => {
        const unsub = ticketsCollection.limit(100).onSnapshot(snap => {
            let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            data.sort((a,b) => {
                const ta = a.createdAt?.toMillis?.() || a.createdAt?.seconds*1000 || 0;
                const tb = b.createdAt?.toMillis?.() || b.createdAt?.seconds*1000 || 0;
                return tb - ta;
            });
            setTickets(data);
            // تحديث التذكرة المفتوحة لو في
            setSelectedTicket(prev => {
                if (!prev) return null;
                const updated = data.find(t => t.id === prev.id);
                return updated || prev;
            });
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, []);

    // جلب Staff List للـ Escalation (أدمن وأونر فقط — فوق المودريتور)
    useEffect(() => {
        if (myRole !== 'moderator') return; // الـ escalation للـ moderator بس
        const ownerEntry = { id: OWNER_UID, displayName: 'Owner 👑', staffRole: { role: 'owner' } };
        usersCollection.where('staffRole.role', '==', 'admin').get()
            .then(snap => {
                const admins = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setStaffList([ownerEntry, ...admins]);
            })
            .catch(() => {
                // fallback: فقط الـ Owner
                setStaffList([ownerEntry]);
            });
    }, [myRole]);

    const handleEscalateTicket = async () => {
        if (!escalateTo || !selectedTicket) return;
        try {
            const targetStaff = staffList.find(s => s.id === escalateTo);
            await ticketsCollection.doc(selectedTicket.id).update({
                escalated: true,
                escalatedTo: escalateTo,
                escalatedBy: currentUser.uid,
                escalatedByName: currentUserData?.displayName || 'Moderator',
                escalatedNote: escalateNote.trim(),
                escalatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'open', // يفضل open عشان الأدمن يشوفه
            });
            // إشعار للمسؤول
            await notificationsCollection.add({
                toUserId: escalateTo,
                type: 'escalated_ticket',
                message_en: `Ticket escalated to you by ${currentUserData?.displayName}: "${selectedTicket.subject}"${escalateNote ? ` — Note: ${escalateNote}` : ''}`,
                message_ar: `تذكرة صُعِّدت إليك من ${currentUserData?.displayName}: "${selectedTicket.subject}"${escalateNote ? ` — ملاحظة: ${escalateNote}` : ''}`,
                icon: '🔺',
                read: false,
                ticketId: selectedTicket.id,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            await logStaffAction(
                currentUser.uid, currentUserData?.displayName,
                'ESCALATE_TICKET',
                selectedTicket.userId, selectedTicket.userName,
                `Escalated to ${targetStaff?.displayName || escalateTo} | Subject: ${selectedTicket.subject} | Note: ${escalateNote}`
            );
            onNotification(`✅ ${lang==='ar'?'تم التصعيد':'Escalated successfully'}`);
            setEscalating(false);
            setEscalateNote('');
            setEscalateTo('');
        } catch(e) { onNotification('❌ Error'); }
    };

    const handleReply = async () => {
        if (!replyText.trim() || !selectedTicket || !currentUser) return;
        setReplying(true);
        try {
            const reply = {
                by: currentUser.uid,
                byName: currentUserData?.displayName || 'Staff',
                byRole: getUserRole(currentUserData, currentUser.uid) || 'staff',
                message: replyText.trim(),
                timestamp: new Date().toISOString()
            };
            await ticketsCollection.doc(selectedTicket.id).update({
                responses: firebase.firestore.FieldValue.arrayUnion(reply),
                status: 'answered',
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
            // إشعار المستخدم
            if (selectedTicket.userId && selectedTicket.userId !== '_system') {
                await notificationsCollection.add({
                    toUserId: selectedTicket.userId,
                    type: 'ticket_reply',
                    message_en: `${currentUserData?.displayName || 'Staff'} replied to your support ticket: "${selectedTicket.subject}"`,
                    message_ar: `${currentUserData?.displayName || 'الدعم'} ردّ على تذكرتك: "${selectedTicket.subject}"`,
                    icon: '🎫',
                    read: false,
                    ticketId: selectedTicket.id,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'REPLY_TICKET',
                selectedTicket.userId, selectedTicket.userName,
                `Subject: ${selectedTicket.subject} | Reply: ${replyText.slice(0,80)}`
            );
            setReplyText('');
            onNotification(`✅ ${lang==='ar'?'تم إرسال الرد':'Reply sent'}`);
        } catch(e) { onNotification('❌ Error'); }
        setReplying(false);
    };

    const closeTicket = async (ticketId) => {
        try {
            await ticketsCollection.doc(ticketId).update({
                status: 'closed',
                closedBy: currentUser.uid,
                closedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            // إشعار المستخدم بالإغلاق
            const ticket = tickets.find(t => t.id === ticketId);
            if (ticket?.userId && ticket.userId !== '_system') {
                await notificationsCollection.add({
                    toUserId: ticket.userId,
                    type: 'ticket_closed',
                    message_en: `Your support ticket "${ticket.subject}" has been closed.`,
                    message_ar: `تم إغلاق تذكرتك "${ticket.subject}".`,
                    icon: '🔒',
                    read: false,
                    ticketId,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'CLOSE_TICKET',
                ticket?.userId, ticket?.userName, `Closed: ${ticket?.subject}`
            );
            onNotification(`✅ ${lang==='ar'?'تم إغلاق التذكرة':'Ticket closed'}`);
        } catch(e) { onNotification('❌ Error'); }
    };

    const reopenTicket = async (ticketId) => {
        try {
            await ticketsCollection.doc(ticketId).update({ status: 'open', closedAt: null });
            onNotification(`✅ ${lang==='ar'?'تم إعادة فتح التذكرة':'Ticket reopened'}`);
        } catch(e) {}
    };

    const statusConfig = {
        open:     { color:'#ef4444', label_ar:'مفتوح',    label_en:'Open',     bg:'rgba(239,68,68,0.1)'   },
        answered: { color:'#f59e0b', label_ar:'تم الرد',  label_en:'Answered', bg:'rgba(245,158,11,0.1)'  },
        closed:   { color:'#6b7280', label_ar:'مغلق',     label_en:'Closed',   bg:'rgba(107,114,128,0.1)' },
    };

    const categoryIcon = { bug:'🐛', account:'👤', payment:'💳', other:'❓' };

    const filteredTickets = filterStatus === 'all'       ? tickets
        : filterStatus === 'escalated' ? tickets.filter(t => t.escalated)
        : tickets.filter(t => t.status === filterStatus);

    // ── Detail View ──────────────────────────────────────
    if (selectedTicket) {
        const sc = statusConfig[selectedTicket.status] || statusConfig.open;
        return (
            <div>
                <button onClick={() => setSelectedTicket(null)}
                    style={{ fontSize:'12px', color:'#00f2ff', background:'none', border:'none', cursor:'pointer', marginBottom:'14px', display:'flex', alignItems:'center', gap:'5px' }}>
                    ← {lang==='ar'?'العودة للتذاكر':'Back to tickets'}
                </button>

                {/* Ticket info */}
                <div style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${sc.color}30`, borderRadius:'12px', padding:'16px', marginBottom:'14px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px', flexWrap:'wrap', gap:'8px' }}>
                        <div>
                            <div style={{ fontWeight:800, fontSize:'14px', marginBottom:'3px' }}>{selectedTicket.subject}</div>
                            <div style={{ fontSize:'10px', color:'#6b7280' }}>
                                {categoryIcon[selectedTicket.category] || '❓'} {selectedTicket.category}
                                {' • '}{lang==='ar'?'من:':'From:'} <strong style={{color:'#d1d5db'}}>{selectedTicket.userName}</strong>
                                {' • '}{selectedTicket.createdAt?.toDate?.()?.toLocaleDateString(lang==='ar'?'ar-EG':'en-US')}
                            </div>
                        </div>
                        <span style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'5px', fontWeight:700, background:sc.bg, border:`1px solid ${sc.color}40`, color:sc.color }}>
                            {lang==='ar'?sc.label_ar:sc.label_en}
                        </span>
                    </div>

                    {/* Original message */}
                    <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:'8px', padding:'12px', fontSize:'12px', color:'#d1d5db', lineHeight:1.7, marginBottom:'12px', borderLeft:'3px solid rgba(255,255,255,0.1)' }}>
                        {selectedTicket.message}
                    </div>

                    {/* Conversation thread */}
                    {(selectedTicket.responses || []).length > 0 && (
                        <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'12px' }}>
                            {(selectedTicket.responses || []).map((r, i) => {
                                const isStaff = r.byRole && r.byRole !== 'user';
                                return (
                                    <div key={i} style={{
                                        background: isStaff ? 'rgba(0,242,255,0.05)' : 'rgba(112,0,255,0.05)',
                                        border: `1px solid ${isStaff ? 'rgba(0,242,255,0.15)' : 'rgba(112,0,255,0.15)'}`,
                                        borderRadius:'8px', padding:'10px',
                                        marginLeft: isStaff ? '0' : '16px',
                                        marginRight: isStaff ? '16px' : '0',
                                    }}>
                                        <div style={{ fontSize:'10px', fontWeight:700, marginBottom:'4px',
                                            color: isStaff ? '#00f2ff' : '#a78bfa' }}>
                                            {isStaff ? '👮' : '👤'} {r.byName}
                                            <span style={{ fontWeight:400, color:'#6b7280', marginLeft:'6px' }}>
                                                {new Date(r.timestamp).toLocaleString(lang==='ar'?'ar-EG':'en-US')}
                                            </span>
                                        </div>
                                        <div style={{ fontSize:'12px', color:'#d1d5db', lineHeight:1.6 }}>{r.message}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Reply box */}
                    {selectedTicket.status !== 'closed' ? (
                        <div>
                            <textarea className="input-dark"
                                style={{ width:'100%', padding:'10px', borderRadius:'8px', fontSize:'12px', minHeight:'70px', resize:'vertical', marginBottom:'8px', lineHeight:1.6 }}
                                placeholder={lang==='ar'?'اكتب ردك هنا...':'Type your reply here...'}
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)} />
                            <div style={{ display:'flex', gap:'8px' }}>
                                <button onClick={handleReply} disabled={replying || !replyText.trim()}
                                    className="btn-neon" style={{ flex:1, padding:'8px', borderRadius:'8px', fontSize:'12px', fontWeight:700 }}>
                                    {replying ? '⏳' : `📨 ${lang==='ar'?'إرسال الرد':'Send Reply'}`}
                                </button>
                                <button onClick={() => closeTicket(selectedTicket.id)}
                                    style={{ padding:'8px 14px', borderRadius:'8px', fontSize:'11px', cursor:'pointer', fontWeight:700,
                                        background:'rgba(107,114,128,0.15)', border:'1px solid rgba(107,114,128,0.3)', color:'#9ca3af' }}>
                                    🔒 {lang==='ar'?'إغلاق':'Close'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <span style={{ fontSize:'11px', color:'#6b7280' }}>🔒 {lang==='ar'?'هذه التذكرة مغلقة':'This ticket is closed'}</span>
                            <button onClick={() => reopenTicket(selectedTicket.id)}
                                style={{ padding:'5px 12px', borderRadius:'6px', fontSize:'11px', cursor:'pointer',
                                    background:'rgba(0,242,255,0.1)', border:'1px solid rgba(0,242,255,0.25)', color:'#00f2ff' }}>
                                🔓 {lang==='ar'?'إعادة فتح':'Reopen'}
                            </button>
                        </div>
                    )}

                    {/* 🔺 Escalate — للـ Moderator فقط لو التذكرة مش مصعّدة */}
                    {myRole === 'moderator' && !selectedTicket.escalated && selectedTicket.status !== 'closed' && (
                        <div style={{ marginTop:'12px', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'12px' }}>
                            {!escalating ? (
                                <button onClick={() => { setEscalating(true); setEscalateTo(''); setEscalateNote(''); }}
                                    style={{ width:'100%', padding:'7px', borderRadius:'8px', fontSize:'11px', cursor:'pointer', fontWeight:700,
                                        background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', color:'#f59e0b' }}>
                                    🔺 {lang==='ar'?'تصعيد للأدمن / الأونر':'Escalate to Admin / Owner'}
                                </button>
                            ) : (
                                <div style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'10px', padding:'12px' }}>
                                    <div style={{ fontSize:'11px', color:'#f59e0b', fontWeight:700, marginBottom:'10px' }}>
                                        🔺 {lang==='ar'?'تصعيد التذكرة':'Escalate Ticket'}
                                    </div>
                                    <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'5px' }}>
                                        {lang==='ar'?'اختر من تصعّد إليه:':'Escalate to:'}
                                    </div>
                                    <select value={escalateTo} onChange={e => setEscalateTo(e.target.value)}
                                        style={{ width:'100%', padding:'7px 10px', borderRadius:'7px', fontSize:'12px', marginBottom:'8px',
                                            background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.12)', color:'white' }}>
                                        <option value=''>{lang==='ar'?'— اختر —':'— Select —'}</option>
                                        {staffList.filter(s => s.id !== currentUser?.uid).map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.staffRole?.role === 'owner' ? '👑' : '🛡️'} {s.displayName}
                                            </option>
                                        ))}
                                    </select>
                                    <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'5px' }}>
                                        {lang==='ar'?'ملاحظة للمسؤول (اختياري):':'Note for staff (optional):'}
                                    </div>
                                    <textarea className="input-dark"
                                        style={{ width:'100%', padding:'7px', borderRadius:'7px', fontSize:'11px', minHeight:'50px', resize:'vertical', marginBottom:'8px' }}
                                        placeholder={lang==='ar'?'وصف المشكلة أو سبب التصعيد...':'Describe the issue or reason for escalation...'}
                                        value={escalateNote}
                                        onChange={e => setEscalateNote(e.target.value)} />
                                    <div style={{ display:'flex', gap:'6px' }}>
                                        <button onClick={handleEscalateTicket} disabled={!escalateTo}
                                            style={{ flex:1, padding:'7px', borderRadius:'7px', fontSize:'11px', cursor:'pointer', fontWeight:700,
                                                background:'rgba(245,158,11,0.2)', border:'1px solid rgba(245,158,11,0.4)', color:'#f59e0b',
                                                opacity: escalateTo ? 1 : 0.4 }}>
                                            🔺 {lang==='ar'?'تأكيد التصعيد':'Confirm Escalate'}
                                        </button>
                                        <button onClick={() => setEscalating(false)}
                                            style={{ padding:'7px 12px', borderRadius:'7px', fontSize:'11px', cursor:'pointer',
                                                background:'rgba(107,114,128,0.15)', border:'1px solid rgba(107,114,128,0.3)', color:'#9ca3af' }}>
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* عرض معلومات التصعيد لو التذكرة مصعّدة */}
                    {selectedTicket.escalated && (
                        <div style={{ marginTop:'12px', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'12px',
                            background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'8px', padding:'10px', marginTop:'12px' }}>
                            <span style={{ fontSize:'11px', color:'#f59e0b', fontWeight:700 }}>
                                🔺 {lang==='ar'?'تم التصعيد':'Escalated'}
                            </span>
                            {selectedTicket.escalatedByName && (
                                <span style={{ fontSize:'10px', color:'#6b7280', marginLeft:'8px' }}>
                                    {lang==='ar'?'بواسطة':'by'} {selectedTicket.escalatedByName}
                                </span>
                            )}
                            {selectedTicket.escalatedNote && (
                                <div style={{ fontSize:'11px', color:'#9ca3af', marginTop:'4px' }}>
                                    {selectedTicket.escalatedNote}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── List View ────────────────────────────────────────
    const openCount      = tickets.filter(t => t.status === 'open').length;
    const answeredCount  = tickets.filter(t => t.status === 'answered').length;
    const escalatedCount = tickets.filter(t => t.escalated).length;

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#6366f1', marginBottom:'12px' }}>
                🎫 {lang==='ar'?'تذاكر الدعم':'Support Tickets'}
                <span style={{ marginLeft:'8px', fontSize:'11px', color:'#6b7280', fontWeight:400 }}>
                    ({tickets.length} {lang==='ar'?'إجمالي':'total'})
                </span>
            </div>

            {/* Stats */}
            <div style={{ display:'flex', gap:'8px', marginBottom:'12px', flexWrap:'wrap' }}>
                {[
                    { label: lang==='ar'?'مفتوح':'Open',       val: openCount,                                    color:'#ef4444' },
                    { label: lang==='ar'?'تم الرد':'Answered',  val: answeredCount,                                color:'#f59e0b' },
                    { label: lang==='ar'?'مصعَّد':'Escalated',   val: escalatedCount,                              color:'#f97316' },
                    { label: lang==='ar'?'مغلق':'Closed',       val: tickets.filter(t=>t.status==='closed').length, color:'#6b7280' },
                ].map(s => (
                    <div key={s.label} style={{ flex:1, minWidth:'60px', background:`${s.color}10`, border:`1px solid ${s.color}25`, borderRadius:'8px', padding:'8px', textAlign:'center' }}>
                        <div style={{ fontSize:'16px', fontWeight:800, color:s.color }}>{s.val}</div>
                        <div style={{ fontSize:'9px', color:'#6b7280', textTransform:'uppercase' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div style={{ display:'flex', gap:'6px', marginBottom:'12px', flexWrap:'wrap' }}>
                {['all','open','answered','escalated','closed'].map(f => {
                    const sc = f === 'escalated'
                        ? { color:'#f97316', label_ar:'مصعَّد', label_en:'Escalated' }
                        : (statusConfig[f] || { color:'#9ca3af', label_ar:'الكل', label_en:'All' });
                    return (
                        <button key={f} onClick={() => setFilterStatus(f)}
                            style={{ padding:'4px 12px', borderRadius:'6px', fontSize:'11px', cursor:'pointer', fontWeight: filterStatus===f?700:400,
                                background: filterStatus===f?`${sc.color}20`:'rgba(255,255,255,0.05)',
                                border: filterStatus===f?`1px solid ${sc.color}50`:'1px solid rgba(255,255,255,0.1)',
                                color: filterStatus===f?sc.color:'#9ca3af' }}>
                            {f==='all'?(lang==='ar'?'الكل':'All'):(lang==='ar'?sc.label_ar:sc.label_en)}
                        </button>
                    );
                })}
            </div>

            {loading ? <div style={{color:'#6b7280',textAlign:'center',padding:'30px'}}>⏳</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxHeight:'55vh', overflowY:'auto' }}>
                    {filteredTickets.length === 0 && (
                        <div style={{color:'#6b7280',fontSize:'12px',textAlign:'center',padding:'30px'}}>
                            {lang==='ar'?'لا توجد تذاكر':'No tickets'}
                        </div>
                    )}
                    {filteredTickets.map(ticket => {
                        const sc = statusConfig[ticket.status] || statusConfig.open;
                        const hasUnread  = ticket.status === 'open' && (ticket.responses||[]).length === 0;
                        const isEscalated = !!ticket.escalated;
                        return (
                            <div key={ticket.id} onClick={() => setSelectedTicket(ticket)}
                                style={{
                                    background: isEscalated ? 'rgba(249,115,22,0.06)' : hasUnread ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.03)',
                                    border:`1px solid ${isEscalated?'rgba(249,115,22,0.3)':hasUnread?'rgba(99,102,241,0.3)':'rgba(255,255,255,0.08)'}`,
                                    borderRadius:'10px', padding:'12px', cursor:'pointer', transition:'all 0.15s',
                                    borderLeft:`3px solid ${isEscalated?'#f97316':sc.color}`
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                onMouseLeave={e => e.currentTarget.style.background = isEscalated?'rgba(249,115,22,0.06)':hasUnread?'rgba(99,102,241,0.06)':'rgba(255,255,255,0.03)'}>
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:'6px', minWidth:0 }}>
                                        {isEscalated && <span style={{ fontSize:'11px' }}>🔺</span>}
                                        {!isEscalated && hasUnread && <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#6366f1', flexShrink:0, display:'inline-block' }} />}
                                        <span style={{ fontSize:'12px', fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                            {categoryIcon[ticket.category]||'❓'} {ticket.subject || (lang==='ar'?'بدون عنوان':'No subject')}
                                        </span>
                                    </div>
                                    <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'4px', fontWeight:700, flexShrink:0, marginLeft:'8px',
                                        background: isEscalated?'rgba(249,115,22,0.15)':sc.bg,
                                        border:`1px solid ${isEscalated?'rgba(249,115,22,0.4)':sc.color+'35'}`,
                                        color: isEscalated?'#f97316':sc.color }}>
                                        {isEscalated?(lang==='ar'?'🔺 مصعَّد':'🔺 Escalated'):(lang==='ar'?sc.label_ar:sc.label_en)}
                                    </span>
                                </div>
                                <div style={{ fontSize:'11px', color:'#9ca3af', display:'flex', justifyContent:'space-between' }}>
                                    <span>👤 {ticket.userName}</span>
                                    <span>
                                        {(ticket.responses||[]).length > 0 && `💬 ${ticket.responses.length} • `}
                                        {ticket.createdAt?.toDate?.()?.toLocaleDateString(lang==='ar'?'ar-EG':'en-US')}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};



// ════════════════════════════════════════════════════════
// 🔍 CONTENT REVIEW (Admin + Owner) — Reported Moments + User Bans
// ════════════════════════════════════════════════════════
const MomentsModerationSection = ({ currentUser, currentUserData, lang, onNotification, onOpenProfile }) => {
    const [moments, setMoments]   = useState([]);
    const [users, setUsers]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [tab, setTab]           = useState('moments'); // 'moments' | 'banned'
    const [banningMoment, setBanningMoment] = useState(null); // momentId

    const myRole = getUserRole(currentUserData, currentUser?.uid);

    // Reported moments
    useEffect(() => {
        if (tab !== 'moments') return;
        setLoading(true);
        // جيب اللحظات المبلَّغ عنها — بدون composite index
        momentsCollection.limit(100).get()
            .then(snap => {
                const data = snap.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter(m => (m.reportCount > 0) || m.hidden)
                    .sort((a, b) => (b.reportCount || 0) - (a.reportCount || 0));
                setMoments(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [tab]);

    // Banned users
    useEffect(() => {
        if (tab !== 'banned') return;
        setLoading(true);
        usersCollection.limit(300).get()
            .then(snap => {
                const data = snap.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter(u => u.ban?.isBanned)
                    .sort((a, b) => {
                        const ta = a.ban?.bannedAt?.toMillis?.() || 0;
                        const tb = b.ban?.bannedAt?.toMillis?.() || 0;
                        return tb - ta;
                    });
                setUsers(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [tab]);

    const deleteMoment = async (momentId, authorName) => {
        if (!window.confirm(lang==='ar'?'حذف هذه اللحظة؟':'Delete this moment?')) return;
        try {
            await momentsCollection.doc(momentId).delete();
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'DELETE_MOMENT', null, authorName, `Moment: ${momentId}`);
            setMoments(p => p.filter(m => m.id !== momentId));
            onNotification(`✅ ${lang==='ar'?'تم الحذف':'Deleted'}`);
        } catch(e) { onNotification('❌ Error'); }
    };

    const hideMoment = async (momentId, currentHidden) => {
        try {
            await momentsCollection.doc(momentId).update({ hidden: !currentHidden });
            setMoments(p => p.map(m => m.id === momentId ? {...m, hidden: !currentHidden} : m));
            onNotification(`✅ ${!currentHidden?(lang==='ar'?'مخفي':'Hidden'):(lang==='ar'?'مرئي':'Visible')}`);
        } catch(e) {}
    };

    const unbanUser = async (uid, name) => {
        try {
            await usersCollection.doc(uid).update({ ban: { isBanned: false } });
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'UNBAN_USER', uid, name, 'Unbanned from Content Review');
            setUsers(p => p.filter(u => u.id !== uid));
            onNotification(`✅ ${lang==='ar'?`تم رفع حظر ${name}`:`${name} unbanned`}`);
        } catch(e) { onNotification('❌ Error'); }
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#8b5cf6', marginBottom:'12px' }}>
                🔍 {lang==='ar'?'مراجعة المحتوى':'Content Review'}
            </div>

            {/* Tab switcher */}
            <div style={{ display:'flex', gap:'6px', marginBottom:'14px' }}>
                {[
                    { id:'moments', icon:'📸', ar:'لحظات مُبلَّغ عنها', en:'Reported Moments' },
                    { id:'banned',  icon:'🔨', ar:'المستخدمون المحظورون', en:'Banned Users' },
                ].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        style={{ padding:'5px 14px', borderRadius:'7px', fontSize:'11px', cursor:'pointer', fontWeight:tab===t.id?700:400,
                            background:tab===t.id?'rgba(139,92,246,0.2)':'rgba(255,255,255,0.05)',
                            border:tab===t.id?'1px solid rgba(139,92,246,0.5)':'1px solid rgba(255,255,255,0.1)',
                            color:tab===t.id?'#8b5cf6':'#9ca3af' }}>
                        {t.icon} {lang==='ar'?t.ar:t.en}
                    </button>
                ))}
            </div>

            {loading ? <div style={{color:'#6b7280',textAlign:'center',padding:'30px'}}>⏳</div> : (

                /* ── Reported Moments ── */
                tab === 'moments' ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:'10px', maxHeight:'55vh', overflowY:'auto' }}>
                        {moments.length === 0 && (
                            <div style={{color:'#6b7280',fontSize:'12px',textAlign:'center',padding:'30px'}}>
                                {lang==='ar'?'لا توجد لحظات مُبلَّغ عنها ✨':'No reported moments ✨'}
                            </div>
                        )}
                        {moments.map(m => (
                            <div key={m.id} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${m.hidden?'rgba(107,114,128,0.2)':'rgba(139,92,246,0.2)'}`, borderRadius:'10px', overflow:'hidden', opacity:m.hidden?0.6:1 }}>
                                {/* Author row */}
                                <div style={{ padding:'10px 12px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:'10px' }}>
                                    <img src={m.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.authorName||'U')}&background=7000ff&color=fff&size=50`}
                                        style={{ width:'34px', height:'34px', borderRadius:'50%', objectFit:'cover', cursor:'pointer' }}
                                        onClick={() => m.authorUID && onOpenProfile && onOpenProfile(m.authorUID)} />
                                    <div style={{ flex:1 }}>
                                        <div style={{ fontSize:'12px', fontWeight:700, cursor:'pointer', color:'white' }}
                                            onClick={() => m.authorUID && onOpenProfile && onOpenProfile(m.authorUID)}>
                                            {m.authorName || 'Unknown'}
                                        </div>
                                        {m.authorUID && <div style={{ fontSize:'10px', color:'#6b7280', fontFamily:'monospace' }}>{m.authorUID.slice(0,20)}...</div>}
                                    </div>
                                    {m.reportCount > 0 && (
                                        <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'4px', fontWeight:700, background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444' }}>
                                            🚨 {m.reportCount} {lang==='ar'?'بلاغ':'reports'}
                                        </span>
                                    )}
                                    {m.hidden && <span style={{ fontSize:'10px', color:'#6b7280' }}>🙈 {lang==='ar'?'مخفي':'Hidden'}</span>}
                                </div>
                                {/* Content preview */}
                                <div style={{ padding:'10px 12px', display:'flex', gap:'10px', alignItems:'flex-start' }}>
                                    {(m.imageURL || m.mediaUrl) && (
                                        <img src={m.imageURL || m.mediaUrl} style={{ width:'70px', height:'70px', objectFit:'cover', borderRadius:'7px', flexShrink:0, cursor:'pointer' }}
                                            onClick={() => window.open(m.imageURL || m.mediaUrl)} />
                                    )}
                                    <div style={{ flex:1, fontSize:'11px', color:'#9ca3af', lineHeight:1.6 }}>
                                        {m.caption || m.text || m.content || <em>({lang==='ar'?'بدون نص':'No text'})</em>}
                                    </div>
                                </div>
                                {/* Actions */}
                                <div style={{ padding:'8px 12px', borderTop:'1px solid rgba(255,255,255,0.04)', display:'flex', gap:'6px', flexWrap:'wrap' }}>
                                    <button onClick={() => hideMoment(m.id, m.hidden)}
                                        style={{ padding:'4px 10px', borderRadius:'6px', fontSize:'10px', cursor:'pointer', fontWeight:700,
                                            background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)', color:'#f59e0b' }}>
                                        {m.hidden?(lang==='ar'?'👁️ إظهار':'👁️ Show'):(lang==='ar'?'🙈 إخفاء':'🙈 Hide')}
                                    </button>
                                    <button onClick={() => deleteMoment(m.id, m.authorName)}
                                        style={{ padding:'4px 10px', borderRadius:'6px', fontSize:'10px', cursor:'pointer', fontWeight:700,
                                            background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444' }}>
                                        🗑️ {lang==='ar'?'حذف':'Delete'}
                                    </button>
                                    {/* Ban author — Admin/Owner only */}
                                    {(myRole === 'owner' || myRole === 'admin') && m.authorUID && (
                                        <button onClick={() => setBanningMoment(banningMoment===m.id?null:m.id)}
                                            style={{ padding:'4px 10px', borderRadius:'6px', fontSize:'10px', cursor:'pointer', fontWeight:700,
                                                background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.4)', color:'#ef4444' }}>
                                            🔨 {lang==='ar'?'حظر الكاتب':'Ban Author'}
                                        </button>
                                    )}
                                </div>
                                {/* Inline ban panel */}
                                {banningMoment === m.id && (
                                    <div style={{ padding:'0 12px 12px' }}>
                                        <BanPanelInline
                                            reportedUID={m.authorUID}
                                            reportedName={m.authorName || 'User'}
                                            reportId={m.id}
                                            currentUser={currentUser}
                                            currentUserData={currentUserData}
                                            lang={lang}
                                            onDone={(msg) => { setBanningMoment(null); onNotification(msg); }}
                                            onCancel={() => setBanningMoment(null)}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (

                /* ── Banned Users ── */
                <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxHeight:'55vh', overflowY:'auto' }}>
                    {users.length === 0 && (
                        <div style={{color:'#6b7280',fontSize:'12px',textAlign:'center',padding:'30px'}}>
                            {lang==='ar'?'لا يوجد مستخدمون محظورون':'No banned users'}
                        </div>
                    )}
                    {users.map(u => {
                        const ban = u.ban;
                        const exp = ban?.expiresAt?.toDate?.();
                        const isPerm = ban?.permanent;
                        return (
                            <div key={u.id} style={{ background:'rgba(239,68,68,0.04)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:'10px', padding:'12px' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                                    <img src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName||'U')}&background=ef4444&color=fff&size=50`}
                                        style={{ width:'38px', height:'38px', borderRadius:'50%', objectFit:'cover', opacity:0.7, cursor:'pointer' }}
                                        onClick={() => onOpenProfile && onOpenProfile(u.id)} />
                                    <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ fontSize:'12px', fontWeight:700, color:'#f3f4f6', cursor:'pointer' }}
                                            onClick={() => onOpenProfile && onOpenProfile(u.id)}>
                                            🔨 {u.displayName}
                                        </div>
                                        <div style={{ fontSize:'10px', color:'#6b7280', fontFamily:'monospace' }}>{u.id.slice(0,20)}...</div>
                                        <div style={{ fontSize:'10px', color:'#9ca3af', marginTop:'3px' }}>
                                            {lang==='ar'?'السبب:':'Reason:'} {ban?.reason || '—'}
                                            {' • '}{isPerm?(lang==='ar'?'🔒 دائم':'🔒 Permanent'):(exp?(lang==='ar'?`ينتهي: ${exp.toLocaleDateString('ar-EG')}`:`Expires: ${exp.toLocaleDateString()}`):'')}
                                        </div>
                                    </div>
                                    {(myRole === 'owner' || myRole === 'admin') && (
                                        <button onClick={() => unbanUser(u.id, u.displayName)}
                                            style={{ padding:'5px 10px', borderRadius:'6px', fontSize:'10px', cursor:'pointer', fontWeight:700, flexShrink:0,
                                                background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.4)', color:'#10b981' }}>
                                            🔓 {lang==='ar'?'رفع الحظر':'Unban'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

// ════════════════════════════════════════════════════════
// 💰 FINANCIAL LOG (Owner only)
// ════════════════════════════════════════════════════════
const FinancialLogSection = ({ lang }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editUser, setEditUser] = useState(null);      // user being edited
    const [editAmount, setEditAmount] = useState('');     // amount to add/subtract
    const [editNote, setEditNote] = useState('');         // optional reason
    const [editSaving, setEditSaving] = useState(false);
    const [editMsg, setEditMsg] = useState(null);

    const loadUsers = () => {
        setLoading(true);
        usersCollection.orderBy('currency', 'desc').limit(100).get()
            .then(snap => { setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { loadUsers(); }, []);

    const totalIntel = users.reduce((s, u) => s + (u.currency || 0), 0);

    const handleAdjust = async (type) => {
        if (!editUser || editAmount === '' || isNaN(Number(editAmount))) return;
        const delta = type === 'add' ? Math.abs(Number(editAmount)) : -Math.abs(Number(editAmount));
        setEditSaving(true);
        try {
            await usersCollection.doc(editUser.id).update({
                currency: firebase.firestore.FieldValue.increment(delta),
            });
            setEditMsg({ ok: true, text: lang==='ar' ? `✅ تم ${type==='add'?'إضافة':'خصم'} ${Math.abs(delta).toLocaleString()} 🧠` : `✅ ${type==='add'?'Added':'Deducted'} ${Math.abs(delta).toLocaleString()} 🧠` });
            // update local list
            setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, currency: (u.currency||0) + delta } : u).sort((a,b)=>(b.currency||0)-(a.currency||0)));
            setEditUser(null); setEditAmount(''); setEditNote('');
        } catch(e) {
            setEditMsg({ ok: false, text: lang==='ar' ? '❌ خطأ، حاول مرة أخرى' : '❌ Error, try again' });
        }
        setEditSaving(false);
        setTimeout(() => setEditMsg(null), 3000);
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#10b981', marginBottom:'16px' }}>
                💰 {lang==='ar'?'السجل المالي':'Financial Log'}
            </div>
            <div style={{ display:'flex', gap:'12px', marginBottom:'16px', flexWrap:'wrap' }}>
                <AdminStatCard icon="🧠" label={lang==='ar'?'إجمالي الإنتل':'Total Intel in Circulation'} value={totalIntel.toLocaleString()} color="#10b981" />
                <AdminStatCard icon="👥" label={lang==='ar'?'المستخدمين':'Users Tracked'} value={users.length} color="#00f2ff" />
            </div>

            {/* ── Edit Balance Modal ── */}
            {editUser && (
                <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:'16px'}}
                    onClick={() => { setEditUser(null); setEditAmount(''); setEditNote(''); }}>
                    <div style={{background:'linear-gradient(160deg,#0a0a20,#0f0f2e)',border:'1px solid rgba(16,185,129,0.35)',borderRadius:'18px',padding:'22px',width:'100%',maxWidth:'320px'}}
                        onClick={e => e.stopPropagation()}>
                        <div style={{fontWeight:800,color:'#10b981',fontSize:'14px',marginBottom:'14px'}}>
                            💰 {lang==='ar'?'تعديل الرصيد':'Adjust Balance'} — {editUser.displayName}
                        </div>
                        <div style={{fontSize:'12px',color:'#9ca3af',marginBottom:'8px'}}>
                            {lang==='ar'?'الرصيد الحالي':'Current Balance'}: <span style={{color:'#10b981',fontWeight:700}}>{(editUser.currency||0).toLocaleString()} 🧠</span>
                        </div>
                        <input
                            type="number"
                            min="0"
                            placeholder={lang==='ar'?'المبلغ':'Amount'}
                            value={editAmount}
                            onChange={e => setEditAmount(e.target.value)}
                            style={{width:'100%',padding:'9px 12px',borderRadius:'10px',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(16,185,129,0.3)',color:'#e5e7eb',fontSize:'13px',marginBottom:'10px',outline:'none'}}
                        />
                        <input
                            type="text"
                            placeholder={lang==='ar'?'السبب (اختياري)':'Reason (optional)'}
                            value={editNote}
                            onChange={e => setEditNote(e.target.value)}
                            style={{width:'100%',padding:'9px 12px',borderRadius:'10px',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',color:'#e5e7eb',fontSize:'13px',marginBottom:'14px',outline:'none'}}
                        />
                        <div style={{display:'flex',gap:'10px'}}>
                            <button
                                disabled={editSaving || editAmount===''}
                                onClick={() => handleAdjust('add')}
                                style={{flex:1,padding:'9px',borderRadius:'10px',background:'linear-gradient(135deg,#10b981,#059669)',border:'none',color:'#fff',fontWeight:800,fontSize:'13px',cursor:editSaving?'wait':'pointer'}}>
                                ➕ {lang==='ar'?'إضافة':'Add'}
                            </button>
                            <button
                                disabled={editSaving || editAmount===''}
                                onClick={() => handleAdjust('sub')}
                                style={{flex:1,padding:'9px',borderRadius:'10px',background:'linear-gradient(135deg,#ef4444,#dc2626)',border:'none',color:'#fff',fontWeight:800,fontSize:'13px',cursor:editSaving?'wait':'pointer'}}>
                                ➖ {lang==='ar'?'خصم':'Deduct'}
                            </button>
                        </div>
                        <button onClick={() => { setEditUser(null); setEditAmount(''); setEditNote(''); }}
                            style={{width:'100%',marginTop:'10px',padding:'8px',borderRadius:'10px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'#9ca3af',fontSize:'12px',cursor:'pointer'}}>
                            {lang==='ar'?'إلغاء':'Cancel'}
                        </button>
                    </div>
                </div>
            )}

            {editMsg && (
                <div style={{padding:'10px 14px',borderRadius:'10px',background:editMsg.ok?'rgba(16,185,129,0.15)':`rgba(239,68,68,0.15)`,border:`1px solid ${editMsg.ok?'rgba(16,185,129,0.4)':`rgba(239,68,68,0.4)`}`,color:editMsg.ok?'#10b981':'#ef4444',fontSize:'12px',fontWeight:700,marginBottom:'12px'}}>
                    {editMsg.text}
                </div>
            )}

            {loading ? <div style={{color:'#6b7280',fontSize:'12px',textAlign:'center',padding:'20px'}}>⏳</div> : (
                <div style={{ maxHeight:'50vh', overflowY:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'11px' }}>
                        <thead>
                            <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding:'6px 8px', textAlign:'left', color:'#9ca3af', fontWeight:700 }}>#</th>
                                <th style={{ padding:'6px 8px', textAlign:'left', color:'#9ca3af', fontWeight:700 }}>{lang==='ar'?'المستخدم':'User'}</th>
                                <th style={{ padding:'6px 8px', textAlign:'right', color:'#9ca3af', fontWeight:700 }}>🧠 {lang==='ar'?'إنتل':'Intel'}</th>
                                <th style={{ padding:'6px 8px', textAlign:'right', color:'#9ca3af', fontWeight:700 }}>{lang==='ar'?'انتصارات':'Wins'}</th>
                                <th style={{ padding:'6px 8px', textAlign:'center', color:'#9ca3af', fontWeight:700 }}>{lang==='ar'?'تعديل':'Edit'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, i) => (
                                <tr key={u.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding:'6px 8px', color:'#6b7280' }}>{i+1}</td>
                                    <td style={{ padding:'6px 8px' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                                            <img src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName||'U')}&background=7000ff&color=fff&size=50`}
                                                style={{ width:'22px', height:'22px', borderRadius:'50%', objectFit:'cover' }} />
                                            <span style={{ color:'#d1d5db' }}>{u.displayName}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding:'6px 8px', textAlign:'right', color:'#10b981', fontWeight:700 }}>{(u.currency||0).toLocaleString()}</td>
                                    <td style={{ padding:'6px 8px', textAlign:'right', color:'#00f2ff' }}>{u.stats?.wins||0}</td>
                                    <td style={{ padding:'6px 8px', textAlign:'center' }}>
                                        <button
                                            onClick={() => { setEditUser(u); setEditAmount(''); setEditNote(''); }}
                                            style={{padding:'3px 10px',borderRadius:'8px',background:'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.15))',border:'1px solid rgba(16,185,129,0.4)',color:'#10b981',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>
                                            ✏️ {lang==='ar'?'تعديل':'Edit'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ════════════════════════════════════════════════════════
// 🎮 MAIN ADMIN PANEL COMPONENT
// ════════════════════════════════════════════════════════
const AdminPanel = ({ show, onClose, currentUser, currentUserData, lang, onOpenProfile }) => {
    const [activeSection, setActiveSection] = useState('overview');
    const [notification, setNotification] = useState(null);

    const role = getUserRole(currentUserData, currentUser?.uid);

    // ✅ ALL hooks MUST come before any early return — Rules of Hooks

    // Notification toast auto-dismiss
    useEffect(() => {
        if (!notification) return;
        const t = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(t);
    }, [notification]);

    // Set default section whenever panel opens or role changes
    useEffect(() => {
        if (!show) return;
        if (role === 'owner' || role === 'admin') setActiveSection('overview');
        else if (role === 'moderator') setActiveSection('reports');
    }, [show, role]);


    const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;
    const [mobileNav, setMobileNav] = useState(false);

    // ── Early return AFTER all hooks ─────────────────────
    if (!show || !role) return null;

    // ── Sidebar nav items based on role ──────────────────
    const navItems = [];

    if (role === 'owner' || role === 'admin') {
        navItems.push({ id:'overview',  icon:'📊', label_en:'Overview',      label_ar:'نظرة عامة',  color:'#ffd700',  roles:['owner','admin'] });
    }
    if (role === 'owner') {
        navItems.push({ id:'staff',     icon:'👥', label_en:'Staff Mgmt',    label_ar:'إدارة الفريق', color:'#ffd700', roles:['owner'] });
        navItems.push({ id:'financial', icon:'💰', label_en:'Financial Log', label_ar:'السجل المالي',color:'#10b981', roles:['owner'] });
        navItems.push({ id:'fakeprofiles', icon:'🎭', label_en:'Fake Profiles', label_ar:'بروفايلات تجريبية', color:'#00f2ff', roles:['owner'] });
    }
    if (role === 'owner' || role === 'admin') {
        navItems.push({ id:'users',     icon:'🚫', label_en:'User Mgmt',     label_ar:'إدارة المستخدمين', color:'#ef4444', roles:['owner','admin'] });
        navItems.push({ id:'broadcast', icon:'📢', label_en:'Broadcast',     label_ar:'إشعار جماعي', color:'#f59e0b', roles:['owner','admin'] });
        navItems.push({ id:'activitylog',icon:'📋',label_en:'Activity Log',  label_ar:'سجل النشاط',  color:'#3b82f6', roles:['owner','admin'] });
    }
    navItems.push(
        { id:'reports',  icon:'🚨', label_en:'Reports',        label_ar:'البلاغات',      color:'#ef4444', roles:['owner','admin','moderator'] },
        { id:'tickets',  icon:'🎫', label_en:'Tickets',        label_ar:'التذاكر',       color:'#6366f1', roles:['owner','admin','moderator'] },
        { id:'moments',  icon:'🔍', label_en:'Content Review', label_ar:'مراجعة المحتوى', color:'#8b5cf6', roles:['owner','admin'] }
    );

    const rc = ROLE_CONFIG[role];

    const renderSection = () => {
        switch(activeSection) {
            case 'overview':   return <OverviewSection lang={lang} />;
            case 'staff':      return <StaffManagementSection currentUser={currentUser} currentUserData={currentUserData} lang={lang} onNotification={setNotification} />;
            case 'financial':  return <FinancialLogSection lang={lang} />;
            case 'users':      return <UserManagementSection currentUser={currentUser} currentUserData={currentUserData} lang={lang} onNotification={setNotification} />;
            case 'broadcast':  return <BroadcastSection currentUser={currentUser} currentUserData={currentUserData} lang={lang} onNotification={setNotification} />;
            case 'activitylog':return <ActivityLogSection lang={lang} />;
            case 'fakeprofiles': return <FakeProfilesSection lang={lang} onNotification={setNotification} />;
            case 'reports':    return <ReportsSection currentUser={currentUser} currentUserData={currentUserData} lang={lang} onNotification={setNotification} onOpenProfile={onOpenProfile} />;
            case 'tickets':    return <TicketsSection currentUser={currentUser} currentUserData={currentUserData} lang={lang} onNotification={setNotification} />;
            case 'moments':    return <MomentsModerationSection currentUser={currentUser} currentUserData={currentUserData} lang={lang} onNotification={setNotification} onOpenProfile={onOpenProfile} />;
            default: return null;
        }
    };

    return (
        <PortalModal>
            <div style={{
                position:'fixed', inset:0, zIndex: Z.OVERLAY,
                background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)',
                display:'flex', alignItems:'stretch', justifyContent:'center', padding:'0',
                fontFamily:'Outfit, Rajdhani, sans-serif'
            }} onClick={onClose}>
                <div style={{
                    width:'100%', maxWidth:'900px', margin:'auto',
                    background:'linear-gradient(135deg, rgba(10,10,25,0.98), rgba(18,10,40,0.98))',
                    border:'1px solid rgba(255,255,255,0.08)',
                    borderRadius: isMobile ? '0' : '16px', overflow:'hidden',
                    display:'flex', flexDirection:'column',
                    maxHeight: isMobile ? '100dvh' : '95vh',
                    height: isMobile ? '100dvh' : 'auto',
                    boxShadow:'0 0 60px rgba(0,0,0,0.8)'
                }} onClick={e => e.stopPropagation()}>

                    {/* ── Header ── */}
                    <div style={{
                        padding: isMobile ? '10px 14px' : '14px 20px',
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        borderBottom:'1px solid rgba(255,255,255,0.08)',
                        background: `linear-gradient(90deg, ${rc?.bg||'rgba(0,0,0,0)'}, transparent)`,
                        flexShrink: 0,
                    }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                            <div style={{ fontSize: isMobile ? '18px' : '24px' }}>{rc?.icon || '🛡️'}</div>
                            <div>
                                <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight:900, color:'white', letterSpacing:'0.05em', display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }}>
                                    {lang==='ar'?'لوحة الإدارة':'Admin Panel'}
                                    <span style={{ fontSize:'9px', padding:'2px 6px', borderRadius:'4px',
                                        background:`${rc?.color||'#fff'}20`, border:`1px solid ${rc?.color||'#fff'}40`, color:rc?.color||'#fff' }}>
                                        {lang==='ar'?rc?.label_ar:rc?.label_en}
                                    </span>
                                </div>
                                {!isMobile && <div style={{ fontSize:'10px', color:'#6b7280', marginTop:'1px' }}>PRO SPY Control Center</div>}
                            </div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                            {isMobile && (
                                <button onClick={() => setMobileNav(v => !v)} style={{
                                    background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)',
                                    color:'white', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', fontSize:'12px', fontWeight:700
                                }}>☰ {lang==='ar'?'القائمة':'Menu'}</button>
                            )}
                            <button onClick={onClose} style={{
                                background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                                color:'white', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', fontSize:'14px'
                            }}>✕</button>
                        </div>
                    </div>

                    {/* ── Notification ── */}
                    {notification && (
                        <div style={{ background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', padding:'8px 16px', fontSize:'12px', color:'#10b981', textAlign:'center', flexShrink:0 }}>
                            {notification}
                        </div>
                    )}

                    {/* ── Mobile Nav Drawer (overlay) ── */}
                    {isMobile && mobileNav && (
                        <div style={{
                            position:'absolute', top:0, left:0, right:0, bottom:0, zIndex:10,
                            background:'rgba(0,0,0,0.7)', display:'flex'
                        }} onClick={() => setMobileNav(false)}>
                            <div style={{
                                width:'220px', height:'100%',
                                background:'linear-gradient(135deg, rgba(10,10,25,0.99), rgba(18,10,40,0.99))',
                                borderRight:'1px solid rgba(255,255,255,0.1)',
                                padding:'16px 10px', display:'flex', flexDirection:'column', gap:'4px',
                                overflowY:'auto'
                            }} onClick={e => e.stopPropagation()}>
                                <div style={{ fontSize:'11px', color:'#6b7280', fontWeight:700, padding:'4px 8px', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                                    {lang==='ar'?'الأقسام':'Sections'}
                                </div>
                                {navItems.map(item => (
                                    <button key={item.id} onClick={() => { setActiveSection(item.id); setMobileNav(false); }}
                                        style={{
                                            width:'100%', padding:'10px 12px', borderRadius:'8px',
                                            display:'flex', alignItems:'center', gap:'10px',
                                            fontSize:'12px', fontWeight: activeSection===item.id ? 700 : 500,
                                            cursor:'pointer', textAlign:'left', transition:'all 0.15s',
                                            background: activeSection===item.id ? `${item.color}20` : 'transparent',
                                            border: activeSection===item.id ? `1px solid ${item.color}40` : '1px solid transparent',
                                            color: activeSection===item.id ? item.color : '#9ca3af',
                                        }}>
                                        <span style={{ fontSize:'16px' }}>{item.icon}</span>
                                        <span>{lang==='ar' ? item.label_ar : item.label_en}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Body: Sidebar + Content ── */}
                    <div style={{ display:'flex', flex:1, overflow:'hidden', minHeight:0, position:'relative' }}>

                        {/* Desktop Sidebar */}
                        {!isMobile && (
                            <div style={{
                                width:'160px', minWidth:'140px',
                                borderRight:'1px solid rgba(255,255,255,0.06)',
                                padding:'12px 8px',
                                display:'flex', flexDirection:'column', gap:'4px',
                                overflowY:'auto'
                            }}>
                                {navItems.map(item => (
                                    <button key={item.id} onClick={() => setActiveSection(item.id)}
                                        style={{
                                            width:'100%', padding:'9px 10px', borderRadius:'8px',
                                            display:'flex', alignItems:'center', gap:'8px',
                                            fontSize:'11px', fontWeight: activeSection===item.id ? 700 : 500,
                                            cursor:'pointer', textAlign:'left', transition:'all 0.15s',
                                            background: activeSection===item.id ? `${item.color}18` : 'transparent',
                                            border: activeSection===item.id ? `1px solid ${item.color}35` : '1px solid transparent',
                                            color: activeSection===item.id ? item.color : '#9ca3af',
                                        }}>
                                        <span style={{ fontSize:'14px' }}>{item.icon}</span>
                                        <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                            {lang==='ar' ? item.label_ar : item.label_en}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Mobile: current section label */}
                        {isMobile && (
                            <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:1,
                                background:'rgba(0,0,0,0.4)', padding:'6px 14px',
                                display:'flex', alignItems:'center', gap:'6px',
                                fontSize:'11px', color:'#9ca3af', borderBottom:'1px solid rgba(255,255,255,0.06)',
                                pointerEvents:'none'
                            }}>
                                <span>{navItems.find(n=>n.id===activeSection)?.icon}</span>
                                <span style={{ color: navItems.find(n=>n.id===activeSection)?.color || '#fff', fontWeight:700 }}>
                                    {lang==='ar'
                                        ? navItems.find(n=>n.id===activeSection)?.label_ar
                                        : navItems.find(n=>n.id===activeSection)?.label_en}
                                </span>
                            </div>
                        )}

                        {/* Main Content */}
                        <div style={{
                            flex:1,
                            padding: isMobile ? '38px 12px 20px' : '20px',
                            paddingBottom:'32px',
                            overflowY:'auto', minWidth:0
                        }}>
                            {renderSection()}
                        </div>
                    </div>
                </div>
            </div>
        </PortalModal>
    );
};
