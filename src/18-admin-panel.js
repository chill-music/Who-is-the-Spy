// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ›¡ï¸ ADMIN PANEL â€” PRO SPY v1.0
//    ÙÙ‚Ø· Owner / Admin / Moderator ÙŠÙ‚Ø¯Ø±ÙˆØ§ ÙŠØ´ÙˆÙÙˆÙ‡Ø§
//    ÙŠØªÙ… Ø§Ø³ØªØ¯Ø¹Ø§Ø¤Ù‡Ø§ Ù…Ù† SettingsModal
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// staffLogCollection, ticketsCollection â€” defined in 01-config.js

// â”€â”€ Helper: ØªØ³Ø¬ÙŠÙ„ Ù†Ø´Ø§Ø· Ø§Ù„Ù…Ø´Ø±Ù â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var ogStaffAction = async (staffUID, staffName, action, targetUID = null, targetName = null, details = '') => {
    try {
        await staffLogCollection.add({
            staffUID, staffName, action,
            targetUID: targetUID || null,
            targetName: targetName || null,
            details,
            timestamp: TS()
        });
    } catch(e) { console.error('Staff log error:', e); }
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸŽ­ FAKE PROFILES SECTION (Owner only) â€” ØªØ¬Ø±ÙŠØ¨ÙŠ
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var AKE_PROFILE_PHOTOS = [
    'https://i.pravatar.cc/150?img=1','https://i.pravatar.cc/150?img=2','https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4','https://i.pravatar.cc/150?img=5','https://i.pravatar.cc/150?img=6',
    'https://i.pravatar.cc/150?img=7','https://i.pravatar.cc/150?img=8','https://i.pravatar.cc/150?img=9',
    'https://i.pravatar.cc/150?img=10','https://i.pravatar.cc/150?img=11','https://i.pravatar.cc/150?img=12',
];
var AKE_NAMES = ['Alex Shadow','Nova Cipher','Rex Viper','Luna Storm','Kai Echo','Zara Blaze','Max Frost','Nora Specter','Finn Raven','Iris Ghost','Cole Hex','Dara Nova','Jax Titan','Mia Ghost','Leo Strike'];
var AKE_COUNTRIES = [
    {code:'SA',flag:'ðŸ‡¸ðŸ‡¦',name_ar:'Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©',name_en:'Saudi Arabia'},
    {code:'EG',flag:'ðŸ‡ªðŸ‡¬',name_ar:'Ù…ØµØ±',name_en:'Egypt'},
    {code:'AE',flag:'ðŸ‡¦ðŸ‡ª',name_ar:'Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª',name_en:'UAE'},
    {code:'KW',flag:'ðŸ‡°ðŸ‡¼',name_ar:'Ø§Ù„ÙƒÙˆÙŠØª',name_en:'Kuwait'},
    {code:'MA',flag:'ðŸ‡²ðŸ‡¦',name_ar:'Ø§Ù„Ù…ØºØ±Ø¨',name_en:'Morocco'},
    {code:'US',flag:'ðŸ‡ºðŸ‡¸',name_ar:'Ø£Ù…Ø±ÙŠÙƒØ§',name_en:'USA'},
    {code:'TR',flag:'ðŸ‡¹ðŸ‡·',name_ar:'ØªØ±ÙƒÙŠØ§',name_en:'Turkey'},
];

var akeProfilesSection = ({ lang, onNotification }) => {
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
                createdAt: TS(),
                lastActive: TS(),
                isAnonymous: false, isFakeProfile: true,
                loginRewards: { currentDay: 0, lastClaimDate: null, streak: 0, totalClaims: 0 },
            };
            await usersCollection.doc(uid).set(newProfile);
            onNotification(lang === 'ar' ? `âœ… ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø¨Ø±ÙˆÙØ§ÙŠÙ„: ${name}` : `âœ… Profile created: ${name}`);
            setCustomName(''); setCustomWins(''); setCustomCharisma('');
        } catch(e) {
            onNotification('âŒ Error: ' + e.message);
        }
        setCreating(false);
    };

    const deleteFakeProfile = async (uid, name) => {
        if (!confirm(lang === 'ar' ? `Ø­Ø°Ù "${name}"ØŸ` : `Delete "${name}"?`)) return;
        setDeleting(uid);
        try {
            await usersCollection.doc(uid).delete();
            onNotification(lang === 'ar' ? `ðŸ—‘ï¸ ØªÙ… Ø­Ø°Ù ${name}` : `ðŸ—‘ï¸ Deleted ${name}`);
        } catch(e) {
            onNotification('âŒ Error: ' + e.message);
        }
        setDeleting(null);
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#00f2ff', marginBottom:'16px' }}>
                ðŸŽ­ {lang==='ar'?'Ø§Ù„Ø¨Ø±ÙˆÙØ§ÙŠÙ„Ø§Øª Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠØ©':'Fake / Test Profiles'}
            </div>
            <div style={{ fontSize:'11px', color:'#9ca3af', marginBottom:'16px', lineHeight:1.6 }}>
                {lang==='ar'
                    ? 'Ø£Ù†Ø´Ø¦ Ø¨Ø±ÙˆÙØ§ÙŠÙ„Ø§Øª Ù…Ø²ÙŠÙØ© Ù„Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ù„Ø¹Ø¨Ø© ÙˆØ§Ù„Ø±Ø§Ù†ÙƒÙŠÙ†Ø¬. Ù‡Ø°Ù‡ Ø§Ù„Ø¨Ø±ÙˆÙØ§ÙŠÙ„Ø§Øª ØªØ¸Ù‡Ø± ÙÙŠ Ø§Ù„Ù…ÙˆÙ‚Ø¹ ÙƒÙ„Ø§Ø¹Ø¨ÙŠÙ† Ø­Ù‚ÙŠÙ‚ÙŠÙŠÙ† ÙˆÙŠÙ…ÙƒÙ† Ø­Ø°ÙÙ‡Ø§ ÙÙŠ Ø£ÙŠ ÙˆÙ‚Øª.'
                    : 'Create fake profiles to test the game and rankings. These profiles appear as real players and can be deleted at any time.'}
            </div>

            {/* Create Form */}
            <div style={{ background:'rgba(0,242,255,0.06)', border:'1px solid rgba(0,242,255,0.2)', borderRadius:'12px', padding:'14px', marginBottom:'20px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'#00f2ff', marginBottom:'10px' }}>
                    âž• {lang==='ar'?'Ø¥Ù†Ø´Ø§Ø¡ Ø¨Ø±ÙˆÙØ§ÙŠÙ„ Ø¬Ø¯ÙŠØ¯':'Create New Profile'}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'8px' }}>
                    <div>
                        <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'4px' }}>{lang==='ar'?'Ø§Ù„Ø§Ø³Ù… (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)':'Name (optional)'}</div>
                        <input className="input-dark" style={{ width:'100%', padding:'6px 8px', fontSize:'11px', borderRadius:'6px' }}
                            placeholder={lang==='ar'?'Ø§ØªØ±ÙƒÙ‡ ÙØ§Ø±ØºØ§Ù‹ Ù„Ù„Ø¹Ø´ÙˆØ§Ø¦ÙŠ':'Leave blank for random'}
                            value={customName} onChange={e => setCustomName(e.target.value)} />
                    </div>
                    <div>
                        <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'4px' }}>{lang==='ar'?'Ø§Ù„Ø§Ù†ØªØµØ§Ø±Ø§Øª (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)':'Wins (optional)'}</div>
                        <input className="input-dark" style={{ width:'100%', padding:'6px 8px', fontSize:'11px', borderRadius:'6px' }}
                            type="number" placeholder="0-999" min="0" max="999"
                            value={customWins} onChange={e => setCustomWins(e.target.value)} />
                    </div>
                    <div>
                        <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'4px' }}>{lang==='ar'?'Ø§Ù„ÙƒØ§Ø±ÙŠØ²Ù…Ø§ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)':'Charisma (optional)'}</div>
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
                            {creating ? 'â³' : `ðŸŽ­ ${lang==='ar'?'Ø¥Ù†Ø´Ø§Ø¡':'Create'}`}
                        </button>
                    </div>
                </div>
                <div style={{ fontSize:'10px', color:'#6b7280' }}>
                    {lang==='ar'?'Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙØ§Ø±ØºØ© ØªÙÙ…Ù„Ø£ Ø¹Ø´ÙˆØ§Ø¦ÙŠØ§Ù‹ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹':'Empty fields are filled randomly'}
                </div>
            </div>

            {/* Fake Profiles List */}
            <div style={{ fontSize:'12px', fontWeight:700, color:'#9ca3af', marginBottom:'10px' }}>
                {lang==='ar'?'Ø§Ù„Ø¨Ø±ÙˆÙØ§ÙŠÙ„Ø§Øª Ø§Ù„Ù…ÙˆØ¬ÙˆØ¯Ø©':'Existing Profiles'} ({fakeProfiles.length})
            </div>
            {loading ? (
                <div style={{ textAlign:'center', padding:'20px', color:'#6b7280', fontSize:'12px' }}>â³</div>
            ) : fakeProfiles.length === 0 ? (
                <div style={{ textAlign:'center', padding:'20px', color:'#6b7280', fontSize:'12px' }}>
                    {lang==='ar'?'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¨Ø±ÙˆÙØ§ÙŠÙ„Ø§Øª ØªØ¬Ø±ÙŠØ¨ÙŠØ© Ø¨Ø¹Ø¯':'No fake profiles yet'}
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
                                    ðŸ† {fp.stats?.wins||0} {lang==='ar'?'ÙÙˆØ²':'wins'} Â· â­ {(fp.charisma||0).toLocaleString()} Â· {fp.country?.flag} {lang==='ar'?fp.country?.name_ar:fp.country?.name_en}
                                </div>
                                <div style={{ fontSize:'10px', color:'#6b7280', marginTop:'1px' }}>ID: {fp.uid}</div>
                            </div>
                            <button onClick={() => deleteFakeProfile(fp.id, fp.displayName)} disabled={deleting===fp.id} style={{
                                padding:'5px 10px', borderRadius:'6px', fontSize:'10px', fontWeight:700, cursor:'pointer',
                                background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444',
                                opacity: deleting===fp.id ? 0.5 : 1, flexShrink:0
                            }}>
                                {deleting===fp.id ? 'â³' : 'ðŸ—‘ï¸'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ“Š STAT CARD COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var dminStatCard = ({ icon, label, value, color = '#00f2ff', bg = 'rgba(0,242,255,0.08)' }) => (
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ‘‘ OVERVIEW SECTION (Owner only)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var verviewSection = ({ lang }) => {
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

    if (loading) return <div style={{color:'#6b7280',textAlign:'center',padding:'40px'}}>â³ {lang==='ar'?'Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ­Ù…ÙŠÙ„...':'Loading...'}</div>;

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#ffd700', marginBottom:'16px' }}>
                ðŸ“Š {lang==='ar'?'Ù†Ø¸Ø±Ø© Ø¹Ø§Ù…Ø© Ø¹Ù„Ù‰ Ø§Ù„Ù…ÙˆÙ‚Ø¹':'Site Overview'}
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'12px', marginBottom:'24px' }}>
                <AdminStatCard icon="ðŸ‘¥" label={lang==='ar'?'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†':'Total Users'} value={stats.users} color="#00f2ff" bg="rgba(0,242,255,0.08)" />
                <AdminStatCard icon="ðŸŽ®" label={lang==='ar'?'ØºØ±Ù Ù†Ø´Ø·Ø©':'Active Rooms'} value={stats.rooms} color="#10b981" bg="rgba(16,185,129,0.08)" />
                <AdminStatCard icon="ðŸš¨" label={lang==='ar'?'ØªÙ‚Ø§Ø±ÙŠØ± Ù…Ø¹Ù„Ù‚Ø©':'Pending Reports'} value={stats.reports} color="#ef4444" bg="rgba(239,68,68,0.08)" />
                <AdminStatCard icon="ðŸŽ«" label={lang==='ar'?'ØªØ°Ø§ÙƒØ± Ù…ÙØªÙˆØ­Ø©':'Open Tickets'} value={stats.tickets} color="#f59e0b" bg="rgba(245,158,11,0.08)" />
            </div>
        </div>
    );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ‘¥ STAFF MANAGEMENT SECTION (Owner only)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var taffManagementSection = ({ currentUser, currentUserData, lang, onNotification }) => {
    const [staffList, setStaffList] = useState([]);
    const [searchId, setSearchId] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [assigning, setAssigning] = useState(false);
    const [loading, setLoading] = useState(true);

    const myRole = getUserRole(currentUserData, currentUser?.uid);
    const assignable = getAssignableRoles(currentUserData, currentUser?.uid);

    useEffect(() => {
        // Ø¬Ù„Ø¨ Ø§Ù„Ù…Ø´Ø±ÙÙŠÙ† Ø§Ù„Ø­Ø§Ù„ÙŠÙŠÙ†
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
                onNotification(lang==='ar'?'âŒ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯':'âŒ User not found');
                setSearchResult(null);
                return;
            }
            const doc = snap.docs[0];
            setSearchResult({ id: doc.id, ...doc.data() });
        } catch(e) { onNotification('âŒ Error'); }
    };

    const assignRole = async (targetUID, targetName, role) => {
        if (!currentUser || !role) return;
        setAssigning(true);
        try {
            if (role === 'remove') {
                await usersCollection.doc(targetUID).update({ staffRole: firebase.firestore.FieldValue.delete() });
                await logStaffAction(currentUser.uid, currentUserData?.displayName, 'REMOVE_ROLE', targetUID, targetName, 'Role removed');
                onNotification(lang==='ar'?'âœ… ØªÙ… Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ø±ØªØ¨Ø©':'âœ… Role removed');
            } else {
                await usersCollection.doc(targetUID).update({
                    staffRole: { role, assignedBy: currentUser.uid, assignedAt: TS() }
                });
                await logStaffAction(currentUser.uid, currentUserData?.displayName, `ASSIGN_${role.toUpperCase()}`, targetUID, targetName, `Assigned role: ${role}`);
                onNotification(`âœ… ${lang==='ar'?'ØªÙ… ØªØ¹ÙŠÙŠÙ†':'Assigned'} ${role}`);
            }
            setSearchResult(null);
            setSearchId('');
        } catch(e) { onNotification('âŒ Error'); }
        setAssigning(false);
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#ffd700', marginBottom:'16px' }}>
                ðŸ‘¥ {lang==='ar'?'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„ÙØ±ÙŠÙ‚':'Staff Management'}
            </div>

            {/* Search user */}
            <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
                <input
                    className="input-dark"
                    style={{ flex:1, padding:'8px 12px', borderRadius:'8px', fontSize:'12px' }}
                    placeholder={lang==='ar'?'Ø§Ø¨Ø­Ø« Ø¨Ù€ ID Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…':'Search by User ID'}
                    value={searchId}
                    onChange={e => setSearchId(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && handleSearch()}
                />
                <button className="btn-neon" style={{ padding:'8px 14px', borderRadius:'8px', fontSize:'12px' }} onClick={handleSearch}>
                    ðŸ”
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
                            <div style={{ fontSize:'10px', color:'#6b7280' }}>ID: {searchResult.customId} â€¢ {getUserRole(searchResult, searchResult.id) ? `Role: ${getUserRole(searchResult, searchResult.id)}` : 'No role'}</div>
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
                                ðŸ—‘ï¸ {lang==='ar'?'Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ø±ØªØ¨Ø©':'Remove Role'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Current staff list */}
            <div style={{ fontSize:'11px', fontWeight:700, color:'#9ca3af', marginBottom:'8px', textTransform:'uppercase' }}>
                {lang==='ar'?'Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ø­Ø§Ù„ÙŠ':'Current Staff'}
            </div>
            {loading ? <div style={{color:'#6b7280',fontSize:'12px'}}>â³</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                    {/* Owner row */}
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px', background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.2)', borderRadius:'8px' }}>
                        <div style={{ fontSize:'18px' }}>ðŸ‘‘</div>
                        <div style={{ flex:1 }}>
                            <div style={{ fontSize:'12px', fontWeight:700, color:'#ffd700' }}>Owner</div>
                            <div style={{ fontSize:'10px', color:'#6b7280' }}>UID: {OWNER_UID.slice(0,16)}...</div>
                        </div>
                        <div style={{ fontSize:'10px', padding:'3px 8px', background:'rgba(255,215,0,0.15)', border:'1px solid rgba(255,215,0,0.3)', borderRadius:'4px', color:'#ffd700' }}>
                            {lang==='ar'?'Ø§Ù„Ù…Ø§Ù„Ùƒ':'Owner'}
                        </div>
                    </div>
                    {staffList.length === 0 && (
                        <div style={{ fontSize:'12px', color:'#6b7280', textAlign:'center', padding:'12px' }}>
                            {lang==='ar'?'Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù…Ø´Ø±ÙÙˆÙ† Ø¨Ø¹Ø¯':'No staff assigned yet'}
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
                                        âœ•
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸš« USER MANAGEMENT (Admin + Owner)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var serManagementSection = ({ currentUser, currentUserData, lang, onNotification }) => {
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
            if (snap.empty) { onNotification(lang==='ar'?'âŒ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯':'âŒ User not found'); setTargetUser(null); return; }
            const doc = snap.docs[0];
            setTargetUser({ id: doc.id, ...doc.data() });
        } catch(e) { onNotification('âŒ Error'); }
    };

    const handleBan = async () => {
        if (!targetUser || !currentUser) return;
        if (targetUser.id === currentUser.uid) { onNotification(lang==='ar'?'Ù„Ø§ ÙŠÙ…ÙƒÙ†Ùƒ Ø­Ø¸Ø± Ù†ÙØ³Ùƒ':'Cannot ban yourself'); return; }
        if (getUserRole(targetUser, targetUser.id) === 'owner') { onNotification(lang==='ar'?'Ù„Ø§ ÙŠÙ…ÙƒÙ†Ùƒ Ø­Ø¸Ø± Ø§Ù„Ù…Ø§Ù„Ùƒ':'Cannot ban owner'); return; }
        setProcessing(true);
        try {
            let expiresAt = null;
            if (banDuration !== 'permanent') {
                const d = new Date();
                d.setDate(d.getDate() + parseInt(banDuration));
                expiresAt = firebase.firestore.Timestamp.fromDate(d);
            }
            await usersCollection.doc(targetUser.id).update({
                ban: { isBanned: true, bannedBy: currentUser.uid, reason: banReason || 'Violation', expiresAt, bannedAt: TS() }
            });
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'BAN_USER', targetUser.id, targetUser.displayName, `Duration: ${banDuration} days. Reason: ${banReason}`);
            onNotification(`âœ… ${lang==='ar'?'ØªÙ… Ø§Ù„Ø­Ø¸Ø±':'User banned'}`);
            setTargetUser(prev => ({ ...prev, ban: { isBanned: true } }));
        } catch(e) { onNotification('âŒ Error'); }
        setProcessing(false);
    };

    const handleUnban = async () => {
        if (!targetUser || !currentUser) return;
        setProcessing(true);
        try {
            await usersCollection.doc(targetUser.id).update({ ban: firebase.firestore.FieldValue.delete() });
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'UNBAN_USER', targetUser.id, targetUser.displayName, 'User unbanned');
            onNotification(`âœ… ${lang==='ar'?'ØªÙ… Ø±ÙØ¹ Ø§Ù„Ø­Ø¸Ø±':'User unbanned'}`);
            setTargetUser(prev => ({ ...prev, ban: null }));
        } catch(e) { onNotification('âŒ Error'); }
        setProcessing(false);
    };

    const isBanned = targetUser ? isBannedUser(targetUser) : false;

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#ef4444', marginBottom:'16px' }}>
                ðŸš« {lang==='ar'?'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†':'User Management'}
            </div>
            <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
                <input className="input-dark" style={{ flex:1, padding:'8px 12px', borderRadius:'8px', fontSize:'12px' }}
                    placeholder={lang==='ar'?'ID Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…':'User ID or UID'}
                    value={searchId} onChange={e => setSearchId(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && handleSearch()} />
                <button className="btn-neon" style={{ padding:'8px 14px', borderRadius:'8px', fontSize:'12px' }} onClick={handleSearch}>ðŸ”</button>
            </div>

            {targetUser && (
                <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                        <img src={targetUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser.displayName||'U')}&background=7000ff&color=fff&size=100`}
                            style={{ width:'42px', height:'42px', borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(255,255,255,0.1)' }} />
                        <div style={{ flex:1 }}>
                            <div style={{ fontWeight:800, fontSize:'13px' }}>{targetUser.displayName}</div>
                            <div style={{ fontSize:'10px', color:'#6b7280' }}>ID: {targetUser.customId} â€¢ {lang==='ar'?'Ø§Ù†ØªØµØ§Ø±Ø§Øª':'Wins'}: {targetUser.stats?.wins || 0}</div>
                            {isBanned && <div style={{ fontSize:'10px', color:'#ef4444', fontWeight:700 }}>â›” {lang==='ar'?'Ù…Ø­Ø¸ÙˆØ±':'BANNED'} â€” {formatBanExpiry(targetUser, lang)}</div>}
                        </div>
                        {getUserRole(targetUser, targetUser.id) && (
                            <div style={{ fontSize:'10px', padding:'3px 8px', background:'rgba(255,215,0,0.1)', border:'1px solid rgba(255,215,0,0.3)', borderRadius:'4px', color:'#ffd700' }}>
                                {ROLE_CONFIG[getUserRole(targetUser, targetUser.id)]?.icon} {getUserRole(targetUser, targetUser.id)}
                            </div>
                        )}
                    </div>

                    {/* Stats row */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'8px', marginBottom:'14px' }}>
                        {[
                            { label: lang==='ar'?'Ø§Ù†ØªØµØ§Ø±Ø§Øª':'Wins', val: targetUser.stats?.wins || 0, color:'#10b981' },
                            { label: lang==='ar'?'Ø®Ø³Ø§Ø±Ø§Øª':'Losses', val: targetUser.stats?.losses || 0, color:'#ef4444' },
                            { label: lang==='ar'?'Ø¥Ù†ØªÙ„':'Intel', val: targetUser.currency || 0, color:'#00f2ff' },
                            { label: lang==='ar'?'ÙƒØ§Ø±ÙŠØ²Ù…Ø§':'Charisma', val: targetUser.charisma || 0, color:'#fbbf24' },
                        ].map(s => (
                            <div key={s.label} style={{ background:'rgba(255,255,255,0.04)', borderRadius:'8px', padding:'8px', textAlign:'center' }}>
                                <div style={{ fontSize:'15px', fontWeight:800, color:s.color }}>{typeof s.val === 'number' ? s.val.toLocaleString() : s.val}</div>
                                <div style={{ fontSize:'9px', color:'#6b7280' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Balance Management */}
                    <div style={{ background:'rgba(0,242,255,0.05)', border:'1px solid rgba(0,242,255,0.15)', borderRadius:'10px', padding:'12px', marginBottom:'14px' }}>
                        <div style={{ fontSize:'11px', fontWeight:700, color:'#00f2ff', marginBottom:'10px' }}>
                            ðŸ’° {lang==='ar'?'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø±ØµÙŠØ¯':'Balance Management'}
                        </div>
                        <div style={{ display:'flex', gap:'6px', marginBottom:'8px' }}>
                            <button onClick={async () => {
                                setProcessing(true);
                                try {
                                    const freshDoc = await usersCollection.doc(targetUser.id).get();
                                    if (freshDoc.exists) {
                                        const freshData = freshDoc.data();
                                        // Force-write currency to trigger listeners
                                        await usersCollection.doc(targetUser.id).update({
                                            currency: freshData.currency || 0,
                                            charisma: freshData.charisma || 0,
                                        });
                                        setTargetUser(prev => ({ ...prev, currency: freshData.currency || 0, charisma: freshData.charisma || 0 }));
                                        onNotification(`âœ… ${lang==='ar'?'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø±ØµÙŠØ¯':'Balance refreshed'}: ${freshData.currency || 0} ðŸ§ `);
                                        await logStaffAction(currentUser.uid, currentUserData?.displayName, 'REPAIR_BALANCE', targetUser.id, targetUser.displayName, `Repaired balance: ${freshData.currency}`);
                                    }
                                } catch(e) { onNotification('âŒ Error'); }
                                setProcessing(false);
                            }} disabled={processing}
                                style={{ flex:1, padding:'7px', borderRadius:'7px', fontSize:'11px', fontWeight:700, cursor:'pointer',
                                    background:'rgba(0,242,255,0.12)', border:'1px solid rgba(0,242,255,0.3)', color:'#00f2ff', opacity:processing?0.5:1 }}>
                                {processing ? 'â³' : `ðŸ”„ ${lang==='ar'?'ØªØ­Ø¯ÙŠØ«/Ø¥ØµÙ„Ø§Ø­ Ø§Ù„Ø±ØµÙŠØ¯':'Repair/Refresh Balance'}`}
                            </button>
                        </div>
                        <div style={{ fontSize:'10px', color:'#6b7280', marginBottom:'6px' }}>
                            {lang==='ar'?'ØªØ¹ÙŠÙŠÙ† Ø±ØµÙŠØ¯ ÙŠØ¯ÙˆÙŠØ§Ù‹:':'Set balance manually:'}
                        </div>
                        <div style={{ display:'flex', gap:'6px' }}>
                            <input className="input-dark"
                                style={{ flex:1, padding:'6px 10px', borderRadius:'6px', fontSize:'11px' }}
                                type="number" min="0" placeholder={lang==='ar'?'Ø§Ù„Ø±ØµÙŠØ¯ Ø§Ù„Ø¬Ø¯ÙŠØ¯ (Ø¥Ù†ØªÙ„)':'New Intel balance'}
                                id="admin-manual-balance" />
                            <button onClick={async () => {
                                const inputEl = document.getElementById('admin-manual-balance');
                                const newBal = parseInt(inputEl?.value);
                                if (isNaN(newBal) || newBal < 0) { onNotification('âŒ Invalid'); return; }
                                setProcessing(true);
                                try {
                                    await usersCollection.doc(targetUser.id).update({ currency: newBal });
                                    setTargetUser(prev => ({ ...prev, currency: newBal }));
                                    onNotification(`âœ… ${lang==='ar'?'ØªÙ… ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ø±ØµÙŠØ¯':'Balance set to'}: ${newBal} ðŸ§ `);
                                    await logStaffAction(currentUser.uid, currentUserData?.displayName, 'SET_BALANCE', targetUser.id, targetUser.displayName, `Manually set balance to: ${newBal}`);
                                    inputEl.value = '';
                                } catch(e) { onNotification('âŒ Error'); }
                                setProcessing(false);
                            }} disabled={processing}
                                style={{ padding:'6px 12px', borderRadius:'6px', fontSize:'11px', fontWeight:700, cursor:'pointer',
                                    background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.4)', color:'#f59e0b' }}>
                                {processing ? 'â³' : `ðŸ’¾ ${lang==='ar'?'Ø­ÙØ¸':'Set'}`}
                            </button>
                        </div>
                    </div>

                    {/* Ban controls */}
                    {!isBanned ? (
                        <div>
                            <div style={{ fontSize:'11px', color:'#9ca3af', marginBottom:'6px' }}>{lang==='ar'?'Ù…Ø¯Ø© Ø§Ù„Ø­Ø¸Ø±:':'Ban Duration:'}</div>
                            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'8px' }}>
                                {['1','3','7','30','permanent'].map(d => (
                                    <button key={d} onClick={() => setBanDuration(d)}
                                        style={{ padding:'4px 10px', borderRadius:'6px', fontSize:'11px', cursor:'pointer', fontWeight: banDuration===d?700:400,
                                            background: banDuration===d?'rgba(239,68,68,0.3)':'rgba(255,255,255,0.05)',
                                            border: banDuration===d?'1px solid rgba(239,68,68,0.6)':'1px solid rgba(255,255,255,0.1)',
                                            color: banDuration===d?'#ef4444':'#9ca3af'
                                        }}>
                                        {d==='permanent'?(lang==='ar'?'Ø¯Ø§Ø¦Ù…':'Permanent'):`${d}d`}
                                    </button>
                                ))}
                            </div>
                            <input className="input-dark" style={{ width:'100%', padding:'7px 10px', borderRadius:'8px', fontSize:'11px', marginBottom:'8px' }}
                                placeholder={lang==='ar'?'Ø³Ø¨Ø¨ Ø§Ù„Ø­Ø¸Ø± (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)':'Reason (optional)'}
                                value={banReason} onChange={e => setBanReason(e.target.value)} />
                            <button onClick={handleBan} disabled={processing || targetUser.id === OWNER_UID}
                                className="btn-danger" style={{ width:'100%', padding:'8px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer', opacity: targetUser.id===OWNER_UID?0.4:1 }}>
                                {processing ? 'â³' : `â›” ${lang==='ar'?'Ø­Ø¸Ø± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…':'Ban User'}`}
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleUnban} disabled={processing}
                            className="btn-neon" style={{ width:'100%', padding:'8px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                            {processing ? 'â³' : `âœ… ${lang==='ar'?'Ø±ÙØ¹ Ø§Ù„Ø­Ø¸Ø±':'Unban User'}`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ“¢ BROADCAST NOTIFICATION (Admin + Owner)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var roadcastSection = ({ currentUser, currentUserData, lang, onNotification }) => {
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
                    fromName: lang==='ar'?'ÙØ±ÙŠÙ‚ PRO SPY':'PRO SPY Team',
                    icon: 'ðŸ“¢',
                    read: false,
                    timestamp: TS()
                });
                count++;
            });
            await batch.commit();
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'BROADCAST', null, null, `Sent to ${count} users: ${text.slice(0,100)}`);
            setSent(count);
            setMsg(''); setMsgAr('');
            onNotification(`âœ… ${lang==='ar'?`ØªÙ… Ø§Ù„Ø¥Ø±Ø³Ø§Ù„ Ù„Ù€ ${count} Ù…Ø³ØªØ®Ø¯Ù…`:`Sent to ${count} users`}`);
        } catch(e) { onNotification('âŒ Error'); }
        setSending(false);
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#f59e0b', marginBottom:'16px' }}>
                ðŸ“¢ {lang==='ar'?'Ø¥Ø´Ø¹Ø§Ø± Ø¬Ù…Ø§Ø¹ÙŠ':'Broadcast Notification'}
            </div>
            <div style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'12px', padding:'14px' }}>
                <textarea className="input-dark" style={{ width:'100%', padding:'8px 12px', borderRadius:'8px', fontSize:'12px', minHeight:'70px', resize:'vertical', marginBottom:'8px' }}
                    placeholder="Message (EN)"
                    value={msg} onChange={e => setMsg(e.target.value)} />
                <textarea className="input-dark" style={{ width:'100%', padding:'8px 12px', borderRadius:'8px', fontSize:'12px', minHeight:'70px', resize:'vertical', marginBottom:'10px', direction:'rtl' }}
                    placeholder="Ø§Ù„Ø±Ø³Ø§Ù„Ø© (Ø¹Ø±Ø¨ÙŠ)"
                    value={msgAr} onChange={e => setMsgAr(e.target.value)} />
                <button onClick={handleBroadcast} disabled={sending || (!msg.trim() && !msgAr.trim())}
                    style={{ width:'100%', padding:'9px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer',
                        background:'linear-gradient(135deg,rgba(245,158,11,0.3),rgba(217,119,6,0.2))',
                        border:'1px solid rgba(245,158,11,0.5)', color:'#f59e0b', opacity:sending?0.5:1 }}>
                    {sending ? 'â³ Sending...' : `ðŸ“¢ ${lang==='ar'?'Ø¥Ø±Ø³Ø§Ù„ Ù„Ù„Ø¬Ù…ÙŠØ¹':'Send to All'}`}
                </button>
                {sent > 0 && <div style={{fontSize:'11px',color:'#10b981',textAlign:'center',marginTop:'8px'}}>âœ… Sent to {sent} users</div>}
            </div>
        </div>
    );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ“‹ MODERATOR ACTIVITY LOG (Admin + Owner)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var ctivityLogSection = ({ lang }) => {
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
                ðŸ“‹ {lang==='ar'?'Ø³Ø¬Ù„ Ù†Ø´Ø§Ø· Ø§Ù„ÙØ±ÙŠÙ‚':'Staff Activity Log'}
            </div>
            {loading ? <div style={{color:'#6b7280',fontSize:'12px',textAlign:'center',padding:'20px'}}>â³</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:'6px', maxHeight:'50vh', overflowY:'auto' }}>
                    {logs.length === 0 && <div style={{color:'#6b7280',fontSize:'12px',textAlign:'center',padding:'20px'}}>{lang==='ar'?'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø³Ø¬Ù„Ø§Øª':'No logs yet'}</div>}
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
                                    <strong>{log.staffName}</strong>{log.targetName ? ` â†’ ${log.targetName}` : ''}
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

// â”€â”€ Inline Ban Panel (used inside Reports) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var anPanelInline = ({ reportedUID, reportedName, reportId, currentUser, currentUserData, lang, onDone, onCancel }) => {
    const [banReason, setBanReason]     = useState('');
    const [banDuration, setBanDuration] = useState('7d');
    const [banning, setBanning]         = useState(false);

    const durations = [
        { val:'1d',   ar:'ÙŠÙˆÙ… ÙˆØ§Ø­Ø¯',   en:'1 Day'    },
        { val:'3d',   ar:'3 Ø£ÙŠØ§Ù…',     en:'3 Days'   },
        { val:'7d',   ar:'Ø£Ø³Ø¨ÙˆØ¹',      en:'1 Week'   },
        { val:'30d',  ar:'Ø´Ù‡Ø±',        en:'1 Month'  },
        { val:'perm', ar:'Ø¯Ø§Ø¦Ù…',       en:'Permanent'},
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
                    bannedAt:  TS(),
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
                    await reportsCollection.doc(reportId).update({ resolved: true, resolvedAt: TS() }).catch(()=>{});
                    // Send detective bot message to reporter
                    if (reporterUID && typeof botChatsCollection !== 'undefined') {
                        const durLabel = banDuration === 'perm'
                            ? (lang==='ar'?'Ø­Ø¸Ø± Ø¯Ø§Ø¦Ù…':'permanent ban')
                            : `${banDuration} ${lang==='ar'?'ÙŠÙˆÙ…':'day ban'}`;
                        await botChatsCollection.add({
                            botId: 'detective_bot',
                            toUserId: reporterUID,
                            type: 'report_resolved',
                            message: lang==='ar'
                                ? `ðŸ•µï¸ ØªÙ… Ù…Ø±Ø§Ø¬Ø¹Ø© Ø¨Ù„Ø§ØºÙƒ Ø¶Ø¯ "${reportedName}".\nâœ… Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡: ${durLabel}\nØ§Ù„Ø³Ø¨Ø¨: ${banReason}\n\nØ´ÙƒØ±Ø§Ù‹ Ù„Ù…Ø³Ø§Ø¹Ø¯ØªÙ†Ø§ ÙÙŠ Ø§Ù„Ø­ÙØ§Ø¸ Ø¹Ù„Ù‰ Ø³Ù„Ø§Ù…Ø© Ø§Ù„Ù…Ø¬ØªÙ…Ø¹.`
                                : `ðŸ•µï¸ Your report against "${reportedName}" has been reviewed.\nâœ… Action taken: ${durLabel}\nReason: ${banReason}\n\nThank you for keeping the community safe.`,
                            fromName: null,
                            fromPhoto: null,
                            timestamp: TS(),
                            read: false,
                        }).catch(()=>{});
                    }
                }
            }
            onDone(`ðŸ”¨ ${lang==='ar'?`ØªÙ… Ø­Ø¸Ø± ${reportedName}`:`${reportedName} banned`}`);
        } catch(e) {
            onDone('âŒ Error banning user');
        }
        setBanning(false);
    };

    return (
        <div style={{ background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'10px', padding:'12px', marginTop:'8px' }}>
            <div style={{ fontSize:'11px', color:'#ef4444', fontWeight:700, marginBottom:'10px' }}>
                ðŸ”¨ {lang==='ar'?`Ø­Ø¸Ø± ${reportedName}`:`Ban ${reportedName}`}
            </div>
            {/* Duration */}
            <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'5px' }}>{lang==='ar'?'Ù…Ø¯Ø© Ø§Ù„Ø­Ø¸Ø±:':'Duration:'}</div>
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
            <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'5px' }}>{lang==='ar'?'Ø³Ø¨Ø¨ Ø§Ù„Ø­Ø¸Ø±:':'Ban reason:'}</div>
            <input className="input-dark"
                style={{ width:'100%', padding:'7px 10px', borderRadius:'6px', fontSize:'11px', marginBottom:'8px' }}
                placeholder={lang==='ar'?'Ø§ÙƒØªØ¨ Ø³Ø¨Ø¨ Ø§Ù„Ø­Ø¸Ø±...':'Enter ban reason...'}
                value={banReason} onChange={e => setBanReason(e.target.value)} />
            <div style={{ display:'flex', gap:'6px' }}>
                <button onClick={handleBan} disabled={banning || !banReason.trim()}
                    style={{ flex:1, padding:'6px', borderRadius:'6px', fontSize:'11px', cursor:'pointer', fontWeight:700,
                        background:'rgba(239,68,68,0.25)', border:'1px solid rgba(239,68,68,0.5)', color:'#ef4444',
                        opacity:banReason.trim()?1:0.4 }}>
                    {banning?'â³':`ðŸ”¨ ${lang==='ar'?'ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø­Ø¸Ø±':'Confirm Ban'}`}
                </button>
                <button onClick={onCancel}
                    style={{ padding:'6px 10px', borderRadius:'6px', fontSize:'11px', cursor:'pointer',
                        background:'rgba(107,114,128,0.15)', border:'1px solid rgba(107,114,128,0.3)', color:'#9ca3af' }}>
                    âœ•
                </button>
            </div>
        </div>
    );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸš¨ REPORTS SECTION (Moderator + Admin + Owner)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var eportsSection = ({ currentUser, currentUserData, lang, onNotification, onOpenProfile }) => {
    const [reports, setReports]           = useState([]);
    const [loading, setLoading]           = useState(true);
    const [filter, setFilter]             = useState('open');
    const [escalating, setEscalating]     = useState(null);
    const [escalateNote, setEscalateNote] = useState('');
    const [staffList, setStaffList]       = useState([]);
    const [selectedEscalateTo, setSelectedEscalateTo] = useState('');
    const [banningUID, setBanningUID]     = useState(null); // report.id of the one being banned

    const myRole = getUserRole(currentUserData, currentUser?.uid);

    // âœ… Ø¬Ù„Ø¨ ÙƒÙ„ Ø§Ù„Ø¨Ù„Ø§ØºØ§Øª â€” Ø¨Ø¯ÙˆÙ† orderBy Ù„ØªØ¬Ù†Ø¨ index issues
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

        // Ù†Ø­Ø§ÙˆÙ„ onSnapshot Ø£ÙˆÙ„Ø§Ù‹
        let unsub;
        try {
            unsub = reportsCollection.limit(200).onSnapshot(
                snap => {
                    if (unsubscribed) return;
                    setReports(sortReports(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
                    setLoading(false);
                },
                async (err) => {
                    // onSnapshot ÙØ´Ù„ â€” Ù†Ø³ØªØ®Ø¯Ù… get() Ø¨Ø¯Ù„Ø§Ù‹ Ù…Ù†Ù‡
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

    // âœ… Ø¬Ù„Ø¨ Staff List â€” fallback Ù„Ùˆ Ø§Ù„Ù€ nested-field query ÙØ´Ù„Øª
    useEffect(() => {
        const ownerEntry = { id: OWNER_UID, displayName: 'Owner ðŸ‘‘', staffRole: { role: 'owner' } };

        // Ù†Ø­Ø§ÙˆÙ„ Ø£ÙˆÙ„Ø§Ù‹ Ø¨Ù€ nested field query
        usersCollection.where('staffRole.role', 'in', ['admin', 'moderator']).get()
            .then(snap => {
                const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setStaffList([ownerEntry, ...list]);
            })
            .catch(() => {
                // Ù„Ùˆ ÙØ´Ù„Øª (Ù…Ø´ ÙÙŠ index)ØŒ Ù†Ø¬ÙŠØ¨ ÙƒÙ„ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† ÙˆÙ†ÙÙ„ØªØ± client-side
                // Ø¨Ø³ Ù†Ø­Ø¯Ø¯ limit Ø¹Ø´Ø§Ù† Ù…Ø§ ØªÙƒÙˆÙ†Ø´ Ø«Ù‚ÙŠÙ„Ø©
                usersCollection.limit(500).get()
                    .then(snap => {
                        const list = snap.docs
                            .map(d => ({ id: d.id, ...d.data() }))
                            .filter(u => u.staffRole?.role === 'admin' || u.staffRole?.role === 'moderator');
                        setStaffList([ownerEntry, ...list]);
                    })
                    .catch(() => {
                        // Ø¢Ø®Ø± fallback: Ø¨Ø³ Ø§Ù„Ù€ Owner
                        setStaffList([ownerEntry]);
                    });
            });
    }, []);

    // â”€â”€ Helper: ÙˆÙ‚Øª Ø§Ù„Ø¨Ù„Ø§Øº â”€â”€
    const getReportTime = (r) => {
        const ts = r.createdAt || r.timestamp;
        if (!ts) return '';
        const d = ts.toDate?.() || new Date(ts);
        return isNaN(d) ? '' : d.toLocaleDateString(lang==='ar'?'ar-EG':'en-US', { day:'numeric', month:'short', year:'numeric' });
    };

    // â”€â”€ Helper: Ø§Ø³Ù… Ø§Ù„Ù…ÙØ¨Ù„ÙŽÙ‘Øº Ø¹Ù†Ù‡ â”€â”€
    const getReportedName = (r) => {
        // user report
        if (r.reportedName) return r.reportedName;
        if (r.reportedUID)  return r.reportedUID.slice(0,12) + '...';
        // moment report
        if (r.type === 'moment' || r.type === 'moment_comment') return lang==='ar'?'Ù…Ø­ØªÙˆÙ‰ (Ù„Ø­Ø¸Ø©)':'Content (Moment)';
        return lang==='ar'?'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ':'Unknown';
    };

    // â”€â”€ Helper: Ù†ÙˆØ¹ Ø§Ù„Ø¨Ù„Ø§Øº â”€â”€
    const getReportType = (r) => {
        if (r.type === 'moment')         return { label: lang==='ar'?'Ù„Ø­Ø¸Ø©':'Moment',  color:'#8b5cf6', icon:'ðŸ“¸' };
        if (r.type === 'moment_comment') return { label: lang==='ar'?'ØªØ¹Ù„ÙŠÙ‚':'Comment', color:'#6366f1', icon:'ðŸ’¬' };
        return { label: lang==='ar'?'Ù…Ø³ØªØ®Ø¯Ù…':'User', color:'#ef4444', icon:'ðŸ‘¤' };
    };

    const resolveReport = async (reportId, reportData) => {
        try {
            await reportsCollection.doc(reportId).update({
                resolved: true,
                status: 'resolved',
                resolvedBy: currentUser.uid,
                resolvedAt: TS()
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
                        ? `ðŸ•µï¸ ØªÙ… Ù…Ø±Ø§Ø¬Ø¹Ø© Ø¨Ù„Ø§ØºÙƒ Ø¶Ø¯ "${reportData.reportedName || 'Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…'}".\nâ„¹ï¸ Ø¨Ø¹Ø¯ Ø§Ù„ØªØ­Ù‚ÙŠÙ‚ØŒ Ù„Ù… ÙŠØªÙ… Ø§ØªØ®Ø§Ø° Ø¥Ø¬Ø±Ø§Ø¡ ÙÙŠ Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø±Ø©.\n\nØ´ÙƒØ±Ø§Ù‹ Ù„Ù…Ø³Ø§Ø¹Ø¯ØªÙ†Ø§.`
                        : `ðŸ•µï¸ Your report against "${reportData.reportedName || 'user'}" has been reviewed.\nâ„¹ï¸ After investigation, no action was taken at this time.\n\nThank you for your report.`,
                    fromName: null,
                    fromPhoto: null,
                    timestamp: TS(),
                    read: false,
                }).catch(()=>{});
            }
            onNotification(`âœ… ${lang==='ar'?'ØªÙ… Ø­Ù„ Ø§Ù„Ø¨Ù„Ø§Øº':'Report resolved'}`);
        } catch(e) { onNotification('âŒ Error'); }
    };

    const handleEscalate = async (reportId, reportData) => {
        if (!selectedEscalateTo) { onNotification(lang==='ar'?'Ø§Ø®ØªØ± Ø´Ø®ØµØ§Ù‹ Ù„Ù„ØªØµØ¹ÙŠØ¯ Ø¥Ù„ÙŠÙ‡':'Select a staff member to escalate to'); return; }
        try {
            // Ø£Ø¶Ù flag escalated Ø¹Ù„Ù‰ Ø§Ù„Ø¨Ù„Ø§Øº
            await reportsCollection.doc(reportId).update({
                escalated: true,
                escalatedTo: selectedEscalateTo,
                escalatedBy: currentUser.uid,
                escalatedNote: escalateNote,
                escalatedAt: TS()
            });
            // Ø£Ø±Ø³Ù„ notification Ù„Ù„Ù…Ø³Ø¤ÙˆÙ„ Ø§Ù„Ù„ÙŠ ØµØ¹Ù‘Ø¯Ù†Ø§ Ø¥Ù„ÙŠÙ‡
            const targetStaff = staffList.find(s => s.id === selectedEscalateTo);
            await notificationsCollection.add({
                toUserId: selectedEscalateTo,
                type: 'escalated_report',
                message_en: `Report escalated to you by ${currentUserData?.displayName}. Reason: ${reportData.reason || ''}`,
                message_ar: `ØªÙ… ØªØµØ¹ÙŠØ¯ Ø¨Ù„Ø§Øº Ø¥Ù„ÙŠÙƒ Ù…Ù† ${currentUserData?.displayName}. Ø§Ù„Ø³Ø¨Ø¨: ${reportData.reason || ''}`,
                message: `Escalated report from ${currentUserData?.displayName}`,
                icon: 'ðŸš¨',
                read: false,
                reportId,
                timestamp: TS()
            });
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'ESCALATE_REPORT',
                reportData.reportedUID || null, getReportedName(reportData),
                `Escalated to ${targetStaff?.displayName||selectedEscalateTo}. Note: ${escalateNote}`
            );
            onNotification(`âœ… ${lang==='ar'?'ØªÙ… Ø§Ù„ØªØµØ¹ÙŠØ¯':'Escalated successfully'}`);
            setEscalating(null);
            setEscalateNote('');
            setSelectedEscalateTo('');
        } catch(e) { onNotification('âŒ Error'); }
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
                ðŸš¨ {lang==='ar'?'Ø¨Ù„Ø§ØºØ§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†':'User Reports'}
                <span style={{ marginLeft:'8px', fontSize:'11px', color:'#6b7280', fontWeight:400 }}>
                    ({reports.length} {lang==='ar'?'Ø¥Ø¬Ù…Ø§Ù„ÙŠ':'total'})
                </span>
            </div>

            {/* Filter tabs */}
            <div style={{ display:'flex', gap:'6px', marginBottom:'14px', flexWrap:'wrap' }}>
                {[
                    { id:'open',      label_ar:`Ù…ÙØªÙˆØ­ (${openCount})`,      label_en:`Open (${openCount})` },
                    { id:'escalated', label_ar:`Ù…ÙØµØ¹ÙŽÙ‘Ø¯ (${escalatedCount})`, label_en:`Escalated (${escalatedCount})` },
                    { id:'resolved',  label_ar:'Ù…Ø­Ù„ÙˆÙ„',   label_en:'Resolved' },
                    { id:'all',       label_ar:'Ø§Ù„ÙƒÙ„',    label_en:'All' },
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
                <div style={{color:'#6b7280',fontSize:'12px',textAlign:'center',padding:'30px'}}>â³ {lang==='ar'?'Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ­Ù…ÙŠÙ„...':'Loading...'}</div>
            ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px', maxHeight:'55vh', overflowY:'auto', paddingBottom:'8px' }}>
                    {filtered.length === 0 && (
                        <div style={{color:'#6b7280',fontSize:'12px',textAlign:'center',padding:'30px'}}>
                            {lang==='ar'?'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¨Ù„Ø§ØºØ§Øª ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„ØªØµÙ†ÙŠÙ':'No reports in this category'}
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
                        const reasonLabels  = { abusive:'ðŸ¤¬ Ø³Ù„ÙˆÙƒ Ù…Ø³ÙŠØ¡', verbal_abuse:'ðŸ’¬ Ø´ØªÙŠÙ…Ø©', cheating:'ðŸŽ® ØºØ´', fraud:'ðŸ’° Ø§Ø­ØªÙŠØ§Ù„', avatar:'ðŸ–¼ï¸ ØµÙˆØ±Ø© Ù…Ø³ÙŠØ¦Ø©', spam:'ðŸ“¢ Ø³Ø¨Ø§Ù…', other:'â“ Ø£Ø®Ø±Ù‰' };

                        return (
                            <div key={report.id} style={{
                                background:'rgba(255,255,255,0.03)',
                                border:`1px solid ${isResolved?'rgba(16,185,129,0.2)':isEscalated?'rgba(245,158,11,0.25)':'rgba(239,68,68,0.2)'}`,
                                borderRadius:'12px',
                                borderLeft:`3px solid ${isResolved?'#10b981':isEscalated?'#f59e0b':'#ef4444'}`
                            }}>
                                {/* â”€â”€ Top: User card â”€â”€ */}
                                <div style={{ padding:'10px 12px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                                        {/* Avatar â€” clickable to open profile */}
                                        <div style={{ position:'relative', flexShrink:0 }}>
                                            <img
                                                src={reportedPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(reportedName)}&background=7000ff&color=fff&size=80`}
                                                style={{ width:'44px', height:'44px', borderRadius:'50%', objectFit:'cover', border:`2px solid ${isResolved?'#10b981':'#ef4444'}40`, cursor: reportedUID?'pointer':'default' }}
                                                onClick={() => { if (reportedUID && onOpenProfile) onOpenProfile(reportedUID); }}
                                                title={lang==='ar'?'ÙØªØ­ Ø§Ù„Ø¨Ø±ÙˆÙØ§ÙŠÙ„':'Open Profile'}
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
                                                {isResolved?'âœ…':isEscalated?'ðŸ”º':'âš ï¸'} {isResolved?(lang==='ar'?'Ù…Ø­Ù„ÙˆÙ„':'Resolved'):isEscalated?(lang==='ar'?'Ù…ÙØµØ¹ÙŽÙ‘Ø¯':'Escalated'):(lang==='ar'?'Ù…ÙØªÙˆØ­':'Open')}
                                            </div>
                                            <div style={{ fontSize:'10px', color:'#6b7280' }}>{getReportTime(report)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* â”€â”€ Middle: Report details â”€â”€ */}
                                <div style={{ padding:'8px 12px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                                    {/* Reason */}
                                    <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'5px' }}>
                                        <span style={{ fontSize:'10px', color:'#9ca3af' }}>{lang==='ar'?'Ø§Ù„Ø³Ø¨Ø¨:':'Reason:'}</span>
                                        <span style={{ fontSize:'11px', fontWeight:700, color:'#f3f4f6', background:'rgba(239,68,68,0.08)', padding:'2px 8px', borderRadius:'4px' }}>
                                            {reasonLabels[report.reason] || report.reason || 'â€”'}
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
                                        {lang==='ar'?'Ø¨Ù„Ø§Øº Ù…Ù†:':'Reported by:'} <span style={{color:'#9ca3af'}}>{report.reporterName || report.reporterUID?.slice(0,12) || 'â€”'}</span>
                                    </div>
                                    {/* Attached image evidence â€” thumbnail */}
                                    {report.imageBase64 && (
                                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'5px' }}>
                                            <span style={{ fontSize:'10px', color:'#9ca3af' }}>ðŸ“Ž {lang==='ar'?'Ø¯Ù„ÙŠÙ„:':'Evidence:'}</span>
                                            <img src={report.imageBase64}
                                                style={{ width:'48px', height:'48px', objectFit:'cover', borderRadius:'6px', border:'1px solid rgba(255,255,255,0.15)', cursor:'pointer', flexShrink:0 }}
                                                onClick={() => window.open(report.imageBase64)}
                                                title={lang==='ar'?'Ø§Ø¶ØºØ· Ù„Ù„ØªÙƒØ¨ÙŠØ±':'Click to enlarge'} />
                                            <span style={{ fontSize:'10px', color:'#6b7280' }}>{lang==='ar'?'(Ø§Ø¶ØºØ· Ù„Ù„ØªÙƒØ¨ÙŠØ±)':'(click to enlarge)'}</span>
                                        </div>
                                    )}
                                </div>

                                {/* â”€â”€ Bottom: Action buttons â”€â”€ */}
                                <div style={{ padding:'10px 12px 14px 12px' }}>
                                    {isEscalated && !isResolved && (
                                        <div style={{ fontSize:'10px', color:'#f59e0b', marginBottom:'7px' }}>
                                            ðŸ”º {lang==='ar'?'ØªÙ… Ø§Ù„ØªØµØ¹ÙŠØ¯':'Escalated'}{report.escalatedNote ? ` â€” ${report.escalatedNote}` : ''}
                                        </div>
                                    )}

                                    {!isResolved && !isEscalatingThis && (
                                        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                                            {/* Resolve */}
                                            <button onClick={() => resolveReport(report.id, report)}
                                                style={{ padding:'5px 12px', borderRadius:'6px', fontSize:'11px', cursor:'pointer', fontWeight:700,
                                                    background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.4)', color:'#10b981' }}>
                                                âœ… {lang==='ar'?'Ø­Ù„ Ø§Ù„Ø¨Ù„Ø§Øº':'Resolve'}
                                            </button>

                                            {/* View Profile */}
                                            {reportedUID && onOpenProfile && (
                                                <button onClick={() => onOpenProfile(reportedUID)}
                                                    style={{ padding:'5px 12px', borderRadius:'6px', fontSize:'11px', cursor:'pointer', fontWeight:700,
                                                        background:'rgba(0,242,255,0.1)', border:'1px solid rgba(0,242,255,0.3)', color:'#00f2ff' }}>
                                                    ðŸ‘¤ {lang==='ar'?'Ø§Ù„Ø¨Ø±ÙˆÙØ§ÙŠÙ„':'Profile'}
                                                </button>
                                            )}

                                            {/* Ban â€” Admin/Owner only */}
                                            {(myRole === 'owner' || myRole === 'admin') && reportedUID && (
                                                <button onClick={() => setBanningUID(report.id)}
                                                    style={{ padding:'5px 12px', borderRadius:'6px', fontSize:'11px', cursor:'pointer', fontWeight:700,
                                                        background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.4)', color:'#ef4444' }}>
                                                    ðŸ”¨ {lang==='ar'?'Ø­Ø¸Ø±':'Ban'}
                                                </button>
                                            )}

                                            {/* Escalate â€” Moderator only */}
                                            {myRole === 'moderator' && !isEscalated && (
                                                <button onClick={() => { setEscalating(report.id); setEscalateNote(''); setSelectedEscalateTo(''); }}
                                                    style={{ padding:'5px 12px', borderRadius:'6px', fontSize:'11px', cursor:'pointer', fontWeight:700,
                                                        background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.4)', color:'#f59e0b' }}>
                                                    ðŸ”º {lang==='ar'?'ØªØµØ¹ÙŠØ¯':'Escalate'}
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
                                                // âœ… FIX: Ù„Ø§ Ù†Ø³ØªØ¯Ø¹ÙŠ resolveReport Ù‡Ù†Ø§ Ù„Ø£Ù† BanPanelInline
                                                // ØªÙ‚ÙˆÙ… Ø¨Ø¥Ø±Ø³Ø§Ù„ Ø±Ø³Ø§Ù„Ø© Ø§Ù„Ù…Ø­Ù‚Ù‚ ÙˆØªØ¹Ù„ÙŠÙ… Ø§Ù„Ø¨Ù„Ø§Øº ÙƒÙ€ resolved Ø¨Ù†ÙØ³Ù‡Ø§
                                                // Ø§Ø³ØªØ¯Ø¹Ø§Ø¡ resolveReport Ù‡Ù†Ø§ ÙƒØ§Ù† ÙŠØ³Ø¨Ø¨ Ø¥Ø±Ø³Ø§Ù„ Ø±Ø³Ø§Ù„ØªÙŠÙ† Ù„Ù„Ù…Ø³ØªØ®Ø¯Ù…
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
                                                ðŸ”º {lang==='ar'?'ØªØµØ¹ÙŠØ¯ Ø§Ù„Ø¨Ù„Ø§Øº':'Escalate Report'}
                                            </div>
                                            <select value={selectedEscalateTo} onChange={e => setSelectedEscalateTo(e.target.value)}
                                                style={{ width:'100%', padding:'6px 10px', borderRadius:'6px', fontSize:'11px',
                                                    background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.15)', color:'white', marginBottom:'6px' }}>
                                                <option value=''>{lang==='ar'?'â€” Ø§Ø®ØªØ± Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„ â€”':'â€” Select staff member â€”'}</option>
                                                {staffList.filter(s => s.id !== currentUser?.uid).map(s => (
                                                    <option key={s.id} value={s.id}>{s.displayName} ({s.staffRole?.role || 'owner'})</option>
                                                ))}
                                            </select>
                                            <input className="input-dark"
                                                style={{ width:'100%', padding:'6px 10px', borderRadius:'6px', fontSize:'11px', marginBottom:'8px' }}
                                                placeholder={lang==='ar'?'Ù…Ù„Ø§Ø­Ø¸Ø© (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)':'Note (optional)'}
                                                value={escalateNote} onChange={e => setEscalateNote(e.target.value)} />
                                            <div style={{ display:'flex', gap:'6px' }}>
                                                <button onClick={() => handleEscalate(report.id, report)} disabled={!selectedEscalateTo}
                                                    style={{ flex:1, padding:'6px', borderRadius:'6px', fontSize:'11px', cursor:'pointer', fontWeight:700,
                                                        background:'rgba(245,158,11,0.25)', border:'1px solid rgba(245,158,11,0.5)', color:'#f59e0b', opacity:selectedEscalateTo?1:0.5 }}>
                                                    ðŸ”º {lang==='ar'?'ØªØ£ÙƒÙŠØ¯':'Confirm'}
                                                </button>
                                                <button onClick={() => setEscalating(null)}
                                                    style={{ padding:'6px 10px', borderRadius:'6px', fontSize:'11px', cursor:'pointer',
                                                        background:'rgba(107,114,128,0.15)', border:'1px solid rgba(107,114,128,0.3)', color:'#9ca3af' }}>
                                                    âœ•
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸŽ« SUPPORT TICKETS (Moderator + Admin + Owner)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var icketsSection = ({ currentUser, currentUserData, lang, onNotification }) => {
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

    // Ø¬Ù„Ø¨ Ø§Ù„ØªØ°Ø§ÙƒØ± â€” Ø¨Ø¯ÙˆÙ† orderBy Ù„ØªØ¬Ù†Ø¨ index issues
    useEffect(() => {
        const unsub = ticketsCollection.limit(100).onSnapshot(snap => {
            let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            data.sort((a,b) => {
                const ta = a.createdAt?.toMillis?.() || a.createdAt?.seconds*1000 || 0;
                const tb = b.createdAt?.toMillis?.() || b.createdAt?.seconds*1000 || 0;
                return tb - ta;
            });
            setTickets(data);
            // ØªØ­Ø¯ÙŠØ« Ø§Ù„ØªØ°ÙƒØ±Ø© Ø§Ù„Ù…ÙØªÙˆØ­Ø© Ù„Ùˆ ÙÙŠ
            setSelectedTicket(prev => {
                if (!prev) return null;
                const updated = data.find(t => t.id === prev.id);
                return updated || prev;
            });
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, []);

    // Ø¬Ù„Ø¨ Staff List Ù„Ù„Ù€ Escalation (Ø£Ø¯Ù…Ù† ÙˆØ£ÙˆÙ†Ø± ÙÙ‚Ø· â€” ÙÙˆÙ‚ Ø§Ù„Ù…ÙˆØ¯Ø±ÙŠØªÙˆØ±)
    useEffect(() => {
        if (myRole !== 'moderator') return; // Ø§Ù„Ù€ escalation Ù„Ù„Ù€ moderator Ø¨Ø³
        const ownerEntry = { id: OWNER_UID, displayName: 'Owner ðŸ‘‘', staffRole: { role: 'owner' } };
        usersCollection.where('staffRole.role', '==', 'admin').get()
            .then(snap => {
                const admins = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setStaffList([ownerEntry, ...admins]);
            })
            .catch(() => {
                // fallback: ÙÙ‚Ø· Ø§Ù„Ù€ Owner
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
                escalatedAt: TS(),
                status: 'open', // ÙŠÙØ¶Ù„ open Ø¹Ø´Ø§Ù† Ø§Ù„Ø£Ø¯Ù…Ù† ÙŠØ´ÙˆÙÙ‡
            });
            // Ø¥Ø´Ø¹Ø§Ø± Ù„Ù„Ù…Ø³Ø¤ÙˆÙ„
            await notificationsCollection.add({
                toUserId: escalateTo,
                type: 'escalated_ticket',
                message_en: `Ticket escalated to you by ${currentUserData?.displayName}: "${selectedTicket.subject}"${escalateNote ? ` â€” Note: ${escalateNote}` : ''}`,
                message_ar: `ØªØ°ÙƒØ±Ø© ØµÙØ¹ÙÙ‘Ø¯Øª Ø¥Ù„ÙŠÙƒ Ù…Ù† ${currentUserData?.displayName}: "${selectedTicket.subject}"${escalateNote ? ` â€” Ù…Ù„Ø§Ø­Ø¸Ø©: ${escalateNote}` : ''}`,
                icon: 'ðŸ”º',
                read: false,
                ticketId: selectedTicket.id,
                timestamp: TS()
            });
            await logStaffAction(
                currentUser.uid, currentUserData?.displayName,
                'ESCALATE_TICKET',
                selectedTicket.userId, selectedTicket.userName,
                `Escalated to ${targetStaff?.displayName || escalateTo} | Subject: ${selectedTicket.subject} | Note: ${escalateNote}`
            );
            onNotification(`âœ… ${lang==='ar'?'ØªÙ… Ø§Ù„ØªØµØ¹ÙŠØ¯':'Escalated successfully'}`);
            setEscalating(false);
            setEscalateNote('');
            setEscalateTo('');
        } catch(e) { onNotification('âŒ Error'); }
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
                lastUpdated: TS()
            });
            // Ø¥Ø´Ø¹Ø§Ø± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…
            if (selectedTicket.userId && selectedTicket.userId !== '_system') {
                await notificationsCollection.add({
                    toUserId: selectedTicket.userId,
                    type: 'ticket_reply',
                    message_en: `${currentUserData?.displayName || 'Staff'} replied to your support ticket: "${selectedTicket.subject}"`,
                    message_ar: `${currentUserData?.displayName || 'Ø§Ù„Ø¯Ø¹Ù…'} Ø±Ø¯Ù‘ Ø¹Ù„Ù‰ ØªØ°ÙƒØ±ØªÙƒ: "${selectedTicket.subject}"`,
                    icon: 'ðŸŽ«',
                    read: false,
                    ticketId: selectedTicket.id,
                    timestamp: TS()
                });
            }
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'REPLY_TICKET',
                selectedTicket.userId, selectedTicket.userName,
                `Subject: ${selectedTicket.subject} | Reply: ${replyText.slice(0,80)}`
            );
            setReplyText('');
            onNotification(`âœ… ${lang==='ar'?'ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø±Ø¯':'Reply sent'}`);
        } catch(e) { onNotification('âŒ Error'); }
        setReplying(false);
    };

    const closeTicket = async (ticketId) => {
        try {
            await ticketsCollection.doc(ticketId).update({
                status: 'closed',
                closedBy: currentUser.uid,
                closedAt: TS()
            });
            // Ø¥Ø´Ø¹Ø§Ø± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¨Ø§Ù„Ø¥ØºÙ„Ø§Ù‚
            const ticket = tickets.find(t => t.id === ticketId);
            if (ticket?.userId && ticket.userId !== '_system') {
                await notificationsCollection.add({
                    toUserId: ticket.userId,
                    type: 'ticket_closed',
                    message_en: `Your support ticket "${ticket.subject}" has been closed.`,
                    message_ar: `ØªÙ… Ø¥ØºÙ„Ø§Ù‚ ØªØ°ÙƒØ±ØªÙƒ "${ticket.subject}".`,
                    icon: 'ðŸ”’',
                    read: false,
                    ticketId,
                    timestamp: TS()
                });
            }
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'CLOSE_TICKET',
                ticket?.userId, ticket?.userName, `Closed: ${ticket?.subject}`
            );
            onNotification(`âœ… ${lang==='ar'?'ØªÙ… Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„ØªØ°ÙƒØ±Ø©':'Ticket closed'}`);
        } catch(e) { onNotification('âŒ Error'); }
    };

    const reopenTicket = async (ticketId) => {
        try {
            await ticketsCollection.doc(ticketId).update({ status: 'open', closedAt: null });
            onNotification(`âœ… ${lang==='ar'?'ØªÙ… Ø¥Ø¹Ø§Ø¯Ø© ÙØªØ­ Ø§Ù„ØªØ°ÙƒØ±Ø©':'Ticket reopened'}`);
        } catch(e) {}
    };

    const statusConfig = {
        open:     { color:'#ef4444', label_ar:'Ù…ÙØªÙˆØ­',    label_en:'Open',     bg:'rgba(239,68,68,0.1)'   },
        answered: { color:'#f59e0b', label_ar:'ØªÙ… Ø§Ù„Ø±Ø¯',  label_en:'Answered', bg:'rgba(245,158,11,0.1)'  },
        closed:   { color:'#6b7280', label_ar:'Ù…ØºÙ„Ù‚',     label_en:'Closed',   bg:'rgba(107,114,128,0.1)' },
    };

    const categoryIcon = { bug:'ðŸ›', account:'ðŸ‘¤', payment:'ðŸ’³', other:'â“' };

    const filteredTickets = filterStatus === 'all'       ? tickets
        : filterStatus === 'escalated' ? tickets.filter(t => t.escalated)
        : tickets.filter(t => t.status === filterStatus);

    // â”€â”€ Detail View â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (selectedTicket) {
        const sc = statusConfig[selectedTicket.status] || statusConfig.open;
        return (
            <div>
                <button onClick={() => setSelectedTicket(null)}
                    style={{ fontSize:'12px', color:'#00f2ff', background:'none', border:'none', cursor:'pointer', marginBottom:'14px', display:'flex', alignItems:'center', gap:'5px' }}>
                    â† {lang==='ar'?'Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„ØªØ°Ø§ÙƒØ±':'Back to tickets'}
                </button>

                {/* Ticket info */}
                <div style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${sc.color}30`, borderRadius:'12px', padding:'16px', marginBottom:'14px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px', flexWrap:'wrap', gap:'8px' }}>
                        <div>
                            <div style={{ fontWeight:800, fontSize:'14px', marginBottom:'3px' }}>{selectedTicket.subject}</div>
                            <div style={{ fontSize:'10px', color:'#6b7280' }}>
                                {categoryIcon[selectedTicket.category] || 'â“'} {selectedTicket.category}
                                {' â€¢ '}{lang==='ar'?'Ù…Ù†:':'From:'} <strong style={{color:'#d1d5db'}}>{selectedTicket.userName}</strong>
                                {' â€¢ '}{selectedTicket.createdAt?.toDate?.()?.toLocaleDateString(lang==='ar'?'ar-EG':'en-US')}
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
                                            {isStaff ? 'ðŸ‘®' : 'ðŸ‘¤'} {r.byName}
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
                                placeholder={lang==='ar'?'Ø§ÙƒØªØ¨ Ø±Ø¯Ùƒ Ù‡Ù†Ø§...':'Type your reply here...'}
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)} />
                            <div style={{ display:'flex', gap:'8px' }}>
                                <button onClick={handleReply} disabled={replying || !replyText.trim()}
                                    className="btn-neon" style={{ flex:1, padding:'8px', borderRadius:'8px', fontSize:'12px', fontWeight:700 }}>
                                    {replying ? 'â³' : `ðŸ“¨ ${lang==='ar'?'Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø±Ø¯':'Send Reply'}`}
                                </button>
                                <button onClick={() => closeTicket(selectedTicket.id)}
                                    style={{ padding:'8px 14px', borderRadius:'8px', fontSize:'11px', cursor:'pointer', fontWeight:700,
                                        background:'rgba(107,114,128,0.15)', border:'1px solid rgba(107,114,128,0.3)', color:'#9ca3af' }}>
                                    ðŸ”’ {lang==='ar'?'Ø¥ØºÙ„Ø§Ù‚':'Close'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <span style={{ fontSize:'11px', color:'#6b7280' }}>ðŸ”’ {lang==='ar'?'Ù‡Ø°Ù‡ Ø§Ù„ØªØ°ÙƒØ±Ø© Ù…ØºÙ„Ù‚Ø©':'This ticket is closed'}</span>
                            <button onClick={() => reopenTicket(selectedTicket.id)}
                                style={{ padding:'5px 12px', borderRadius:'6px', fontSize:'11px', cursor:'pointer',
                                    background:'rgba(0,242,255,0.1)', border:'1px solid rgba(0,242,255,0.25)', color:'#00f2ff' }}>
                                ðŸ”“ {lang==='ar'?'Ø¥Ø¹Ø§Ø¯Ø© ÙØªØ­':'Reopen'}
                            </button>
                        </div>
                    )}

                    {/* ðŸ”º Escalate â€” Ù„Ù„Ù€ Moderator ÙÙ‚Ø· Ù„Ùˆ Ø§Ù„ØªØ°ÙƒØ±Ø© Ù…Ø´ Ù…ØµØ¹Ù‘Ø¯Ø© */}
                    {myRole === 'moderator' && !selectedTicket.escalated && selectedTicket.status !== 'closed' && (
                        <div style={{ marginTop:'12px', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'12px' }}>
                            {!escalating ? (
                                <button onClick={() => { setEscalating(true); setEscalateTo(''); setEscalateNote(''); }}
                                    style={{ width:'100%', padding:'7px', borderRadius:'8px', fontSize:'11px', cursor:'pointer', fontWeight:700,
                                        background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', color:'#f59e0b' }}>
                                    ðŸ”º {lang==='ar'?'ØªØµØ¹ÙŠØ¯ Ù„Ù„Ø£Ø¯Ù…Ù† / Ø§Ù„Ø£ÙˆÙ†Ø±':'Escalate to Admin / Owner'}
                                </button>
                            ) : (
                                <div style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'10px', padding:'12px' }}>
                                    <div style={{ fontSize:'11px', color:'#f59e0b', fontWeight:700, marginBottom:'10px' }}>
                                        ðŸ”º {lang==='ar'?'ØªØµØ¹ÙŠØ¯ Ø§Ù„ØªØ°ÙƒØ±Ø©':'Escalate Ticket'}
                                    </div>
                                    <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'5px' }}>
                                        {lang==='ar'?'Ø§Ø®ØªØ± Ù…Ù† ØªØµØ¹Ù‘Ø¯ Ø¥Ù„ÙŠÙ‡:':'Escalate to:'}
                                    </div>
                                    <select value={escalateTo} onChange={e => setEscalateTo(e.target.value)}
                                        style={{ width:'100%', padding:'7px 10px', borderRadius:'7px', fontSize:'12px', marginBottom:'8px',
                                            background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.12)', color:'white' }}>
                                        <option value=''>{lang==='ar'?'â€” Ø§Ø®ØªØ± â€”':'â€” Select â€”'}</option>
                                        {staffList.filter(s => s.id !== currentUser?.uid).map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.staffRole?.role === 'owner' ? 'ðŸ‘‘' : 'ðŸ›¡ï¸'} {s.displayName}
                                            </option>
                                        ))}
                                    </select>
                                    <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'5px' }}>
                                        {lang==='ar'?'Ù…Ù„Ø§Ø­Ø¸Ø© Ù„Ù„Ù…Ø³Ø¤ÙˆÙ„ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ):':'Note for staff (optional):'}
                                    </div>
                                    <textarea className="input-dark"
                                        style={{ width:'100%', padding:'7px', borderRadius:'7px', fontSize:'11px', minHeight:'50px', resize:'vertical', marginBottom:'8px' }}
                                        placeholder={lang==='ar'?'ÙˆØµÙ Ø§Ù„Ù…Ø´ÙƒÙ„Ø© Ø£Ùˆ Ø³Ø¨Ø¨ Ø§Ù„ØªØµØ¹ÙŠØ¯...':'Describe the issue or reason for escalation...'}
                                        value={escalateNote}
                                        onChange={e => setEscalateNote(e.target.value)} />
                                    <div style={{ display:'flex', gap:'6px' }}>
                                        <button onClick={handleEscalateTicket} disabled={!escalateTo}
                                            style={{ flex:1, padding:'7px', borderRadius:'7px', fontSize:'11px', cursor:'pointer', fontWeight:700,
                                                background:'rgba(245,158,11,0.2)', border:'1px solid rgba(245,158,11,0.4)', color:'#f59e0b',
                                                opacity: escalateTo ? 1 : 0.4 }}>
                                            ðŸ”º {lang==='ar'?'ØªØ£ÙƒÙŠØ¯ Ø§Ù„ØªØµØ¹ÙŠØ¯':'Confirm Escalate'}
                                        </button>
                                        <button onClick={() => setEscalating(false)}
                                            style={{ padding:'7px 12px', borderRadius:'7px', fontSize:'11px', cursor:'pointer',
                                                background:'rgba(107,114,128,0.15)', border:'1px solid rgba(107,114,128,0.3)', color:'#9ca3af' }}>
                                            âœ•
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Ø¹Ø±Ø¶ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„ØªØµØ¹ÙŠØ¯ Ù„Ùˆ Ø§Ù„ØªØ°ÙƒØ±Ø© Ù…ØµØ¹Ù‘Ø¯Ø© */}
                    {selectedTicket.escalated && (
                        <div style={{ marginTop:'12px', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'12px',
                            background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'8px', padding:'10px', marginTop:'12px' }}>
                            <span style={{ fontSize:'11px', color:'#f59e0b', fontWeight:700 }}>
                                ðŸ”º {lang==='ar'?'ØªÙ… Ø§Ù„ØªØµØ¹ÙŠØ¯':'Escalated'}
                            </span>
                            {selectedTicket.escalatedByName && (
                                <span style={{ fontSize:'10px', color:'#6b7280', marginLeft:'8px' }}>
                                    {lang==='ar'?'Ø¨ÙˆØ§Ø³Ø·Ø©':'by'} {selectedTicket.escalatedByName}
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

    // â”€â”€ List View â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const openCount      = tickets.filter(t => t.status === 'open').length;
    const answeredCount  = tickets.filter(t => t.status === 'answered').length;
    const escalatedCount = tickets.filter(t => t.escalated).length;

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#6366f1', marginBottom:'12px' }}>
                ðŸŽ« {lang==='ar'?'ØªØ°Ø§ÙƒØ± Ø§Ù„Ø¯Ø¹Ù…':'Support Tickets'}
                <span style={{ marginLeft:'8px', fontSize:'11px', color:'#6b7280', fontWeight:400 }}>
                    ({tickets.length} {lang==='ar'?'Ø¥Ø¬Ù…Ø§Ù„ÙŠ':'total'})
                </span>
            </div>

            {/* Stats */}
            <div style={{ display:'flex', gap:'8px', marginBottom:'12px', flexWrap:'wrap' }}>
                {[
                    { label: lang==='ar'?'Ù…ÙØªÙˆØ­':'Open',       val: openCount,                                    color:'#ef4444' },
                    { label: lang==='ar'?'ØªÙ… Ø§Ù„Ø±Ø¯':'Answered',  val: answeredCount,                                color:'#f59e0b' },
                    { label: lang==='ar'?'Ù…ØµØ¹ÙŽÙ‘Ø¯':'Escalated',   val: escalatedCount,                              color:'#f97316' },
                    { label: lang==='ar'?'Ù…ØºÙ„Ù‚':'Closed',       val: tickets.filter(t=>t.status==='closed').length, color:'#6b7280' },
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
                        ? { color:'#f97316', label_ar:'Ù…ØµØ¹ÙŽÙ‘Ø¯', label_en:'Escalated' }
                        : (statusConfig[f] || { color:'#9ca3af', label_ar:'Ø§Ù„ÙƒÙ„', label_en:'All' });
                    return (
                        <button key={f} onClick={() => setFilterStatus(f)}
                            style={{ padding:'4px 12px', borderRadius:'6px', fontSize:'11px', cursor:'pointer', fontWeight: filterStatus===f?700:400,
                                background: filterStatus===f?`${sc.color}20`:'rgba(255,255,255,0.05)',
                                border: filterStatus===f?`1px solid ${sc.color}50`:'1px solid rgba(255,255,255,0.1)',
                                color: filterStatus===f?sc.color:'#9ca3af' }}>
                            {f==='all'?(lang==='ar'?'Ø§Ù„ÙƒÙ„':'All'):(lang==='ar'?sc.label_ar:sc.label_en)}
                        </button>
                    );
                })}
            </div>

            {loading ? <div style={{color:'#6b7280',textAlign:'center',padding:'30px'}}>â³</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxHeight:'55vh', overflowY:'auto' }}>
                    {filteredTickets.length === 0 && (
                        <div style={{color:'#6b7280',fontSize:'12px',textAlign:'center',padding:'30px'}}>
                            {lang==='ar'?'Ù„Ø§ ØªÙˆØ¬Ø¯ ØªØ°Ø§ÙƒØ±':'No tickets'}
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
                                        {isEscalated && <span style={{ fontSize:'11px' }}>ðŸ”º</span>}
                                        {!isEscalated && hasUnread && <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#6366f1', flexShrink:0, display:'inline-block' }} />}
                                        <span style={{ fontSize:'12px', fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                            {categoryIcon[ticket.category]||'â“'} {ticket.subject || (lang==='ar'?'Ø¨Ø¯ÙˆÙ† Ø¹Ù†ÙˆØ§Ù†':'No subject')}
                                        </span>
                                    </div>
                                    <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'4px', fontWeight:700, flexShrink:0, marginLeft:'8px',
                                        background: isEscalated?'rgba(249,115,22,0.15)':sc.bg,
                                        border:`1px solid ${isEscalated?'rgba(249,115,22,0.4)':sc.color+'35'}`,
                                        color: isEscalated?'#f97316':sc.color }}>
                                        {isEscalated?(lang==='ar'?'ðŸ”º Ù…ØµØ¹ÙŽÙ‘Ø¯':'ðŸ”º Escalated'):(lang==='ar'?sc.label_ar:sc.label_en)}
                                    </span>
                                </div>
                                <div style={{ fontSize:'11px', color:'#9ca3af', display:'flex', justifyContent:'space-between' }}>
                                    <span>ðŸ‘¤ {ticket.userName}</span>
                                    <span>
                                        {(ticket.responses||[]).length > 0 && `ðŸ’¬ ${ticket.responses.length} â€¢ `}
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



// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ” CONTENT REVIEW (Admin + Owner) â€” Reported Moments + User Bans
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var omentsModerationSection = ({ currentUser, currentUserData, lang, onNotification, onOpenProfile }) => {
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
        // Ø¬ÙŠØ¨ Ø§Ù„Ù„Ø­Ø¸Ø§Øª Ø§Ù„Ù…Ø¨Ù„ÙŽÙ‘Øº Ø¹Ù†Ù‡Ø§ â€” Ø¨Ø¯ÙˆÙ† composite index
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
        if (!window.confirm(lang==='ar'?'Ø­Ø°Ù Ù‡Ø°Ù‡ Ø§Ù„Ù„Ø­Ø¸Ø©ØŸ':'Delete this moment?')) return;
        try {
            await momentsCollection.doc(momentId).delete();
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'DELETE_MOMENT', null, authorName, `Moment: ${momentId}`);
            setMoments(p => p.filter(m => m.id !== momentId));
            onNotification(`âœ… ${lang==='ar'?'ØªÙ… Ø§Ù„Ø­Ø°Ù':'Deleted'}`);
        } catch(e) { onNotification('âŒ Error'); }
    };

    const hideMoment = async (momentId, currentHidden) => {
        try {
            await momentsCollection.doc(momentId).update({ hidden: !currentHidden });
            setMoments(p => p.map(m => m.id === momentId ? {...m, hidden: !currentHidden} : m));
            onNotification(`âœ… ${!currentHidden?(lang==='ar'?'Ù…Ø®ÙÙŠ':'Hidden'):(lang==='ar'?'Ù…Ø±Ø¦ÙŠ':'Visible')}`);
        } catch(e) {}
    };

    const unbanUser = async (uid, name) => {
        try {
            await usersCollection.doc(uid).update({ ban: { isBanned: false } });
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'UNBAN_USER', uid, name, 'Unbanned from Content Review');
            setUsers(p => p.filter(u => u.id !== uid));
            onNotification(`âœ… ${lang==='ar'?`ØªÙ… Ø±ÙØ¹ Ø­Ø¸Ø± ${name}`:`${name} unbanned`}`);
        } catch(e) { onNotification('âŒ Error'); }
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#8b5cf6', marginBottom:'12px' }}>
                ðŸ” {lang==='ar'?'Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ù…Ø­ØªÙˆÙ‰':'Content Review'}
            </div>

            {/* Tab switcher */}
            <div style={{ display:'flex', gap:'6px', marginBottom:'14px' }}>
                {[
                    { id:'moments', icon:'ðŸ“¸', ar:'Ù„Ø­Ø¸Ø§Øª Ù…ÙØ¨Ù„ÙŽÙ‘Øº Ø¹Ù†Ù‡Ø§', en:'Reported Moments' },
                    { id:'banned',  icon:'ðŸ”¨', ar:'Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙˆÙ† Ø§Ù„Ù…Ø­Ø¸ÙˆØ±ÙˆÙ†', en:'Banned Users' },
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

            {loading ? <div style={{color:'#6b7280',textAlign:'center',padding:'30px'}}>â³</div> : (

                /* â”€â”€ Reported Moments â”€â”€ */
                tab === 'moments' ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:'10px', maxHeight:'55vh', overflowY:'auto' }}>
                        {moments.length === 0 && (
                            <div style={{color:'#6b7280',fontSize:'12px',textAlign:'center',padding:'30px'}}>
                                {lang==='ar'?'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù„Ø­Ø¸Ø§Øª Ù…ÙØ¨Ù„ÙŽÙ‘Øº Ø¹Ù†Ù‡Ø§ âœ¨':'No reported moments âœ¨'}
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
                                            ðŸš¨ {m.reportCount} {lang==='ar'?'Ø¨Ù„Ø§Øº':'reports'}
                                        </span>
                                    )}
                                    {m.hidden && <span style={{ fontSize:'10px', color:'#6b7280' }}>ðŸ™ˆ {lang==='ar'?'Ù…Ø®ÙÙŠ':'Hidden'}</span>}
                                </div>
                                {/* Content preview */}
                                <div style={{ padding:'10px 12px', display:'flex', gap:'10px', alignItems:'flex-start' }}>
                                    {(m.imageURL || m.mediaUrl) && (
                                        <img src={m.imageURL || m.mediaUrl} style={{ width:'70px', height:'70px', objectFit:'cover', borderRadius:'7px', flexShrink:0, cursor:'pointer' }}
                                            onClick={() => window.open(m.imageURL || m.mediaUrl)} />
                                    )}
                                    <div style={{ flex:1, fontSize:'11px', color:'#9ca3af', lineHeight:1.6 }}>
                                        {m.caption || m.text || m.content || <em>({lang==='ar'?'Ø¨Ø¯ÙˆÙ† Ù†Øµ':'No text'})</em>}
                                    </div>
                                </div>
                                {/* Actions */}
                                <div style={{ padding:'8px 12px', borderTop:'1px solid rgba(255,255,255,0.04)', display:'flex', gap:'6px', flexWrap:'wrap' }}>
                                    <button onClick={() => hideMoment(m.id, m.hidden)}
                                        style={{ padding:'4px 10px', borderRadius:'6px', fontSize:'10px', cursor:'pointer', fontWeight:700,
                                            background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)', color:'#f59e0b' }}>
                                        {m.hidden?(lang==='ar'?'ðŸ‘ï¸ Ø¥Ø¸Ù‡Ø§Ø±':'ðŸ‘ï¸ Show'):(lang==='ar'?'ðŸ™ˆ Ø¥Ø®ÙØ§Ø¡':'ðŸ™ˆ Hide')}
                                    </button>
                                    <button onClick={() => deleteMoment(m.id, m.authorName)}
                                        style={{ padding:'4px 10px', borderRadius:'6px', fontSize:'10px', cursor:'pointer', fontWeight:700,
                                            background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444' }}>
                                        ðŸ—‘ï¸ {lang==='ar'?'Ø­Ø°Ù':'Delete'}
                                    </button>
                                    {/* Ban author â€” Admin/Owner only */}
                                    {(myRole === 'owner' || myRole === 'admin') && m.authorUID && (
                                        <button onClick={() => setBanningMoment(banningMoment===m.id?null:m.id)}
                                            style={{ padding:'4px 10px', borderRadius:'6px', fontSize:'10px', cursor:'pointer', fontWeight:700,
                                                background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.4)', color:'#ef4444' }}>
                                            ðŸ”¨ {lang==='ar'?'Ø­Ø¸Ø± Ø§Ù„ÙƒØ§ØªØ¨':'Ban Author'}
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

                /* â”€â”€ Banned Users â”€â”€ */
                <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxHeight:'55vh', overflowY:'auto' }}>
                    {users.length === 0 && (
                        <div style={{color:'#6b7280',fontSize:'12px',textAlign:'center',padding:'30px'}}>
                            {lang==='ar'?'Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù…Ø³ØªØ®Ø¯Ù…ÙˆÙ† Ù…Ø­Ø¸ÙˆØ±ÙˆÙ†':'No banned users'}
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
                                            ðŸ”¨ {u.displayName}
                                        </div>
                                        <div style={{ fontSize:'10px', color:'#6b7280', fontFamily:'monospace' }}>{u.id.slice(0,20)}...</div>
                                        <div style={{ fontSize:'10px', color:'#9ca3af', marginTop:'3px' }}>
                                            {lang==='ar'?'Ø§Ù„Ø³Ø¨Ø¨:':'Reason:'} {ban?.reason || 'â€”'}
                                            {' â€¢ '}{isPerm?(lang==='ar'?'ðŸ”’ Ø¯Ø§Ø¦Ù…':'ðŸ”’ Permanent'):(exp?(lang==='ar'?`ÙŠÙ†ØªÙ‡ÙŠ: ${exp.toLocaleDateString('ar-EG')}`:`Expires: ${exp.toLocaleDateString()}`):'')}
                                        </div>
                                    </div>
                                    {(myRole === 'owner' || myRole === 'admin') && (
                                        <button onClick={() => unbanUser(u.id, u.displayName)}
                                            style={{ padding:'5px 10px', borderRadius:'6px', fontSize:'10px', cursor:'pointer', fontWeight:700, flexShrink:0,
                                                background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.4)', color:'#10b981' }}>
                                            ðŸ”“ {lang==='ar'?'Ø±ÙØ¹ Ø§Ù„Ø­Ø¸Ø±':'Unban'}
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ’° FINANCIAL LOG (Owner only)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var inancialLogSection = ({ lang }) => {
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
            setEditMsg({ ok: true, text: lang==='ar' ? `âœ… ØªÙ… ${type==='add'?'Ø¥Ø¶Ø§ÙØ©':'Ø®ØµÙ…'} ${Math.abs(delta).toLocaleString()} ðŸ§ ` : `âœ… ${type==='add'?'Added':'Deducted'} ${Math.abs(delta).toLocaleString()} ðŸ§ ` });
            // update local list
            setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, currency: (u.currency||0) + delta } : u).sort((a,b)=>(b.currency||0)-(a.currency||0)));
            setEditUser(null); setEditAmount(''); setEditNote('');
        } catch(e) {
            setEditMsg({ ok: false, text: lang==='ar' ? 'âŒ Ø®Ø·Ø£ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰' : 'âŒ Error, try again' });
        }
        setEditSaving(false);
        setTimeout(() => setEditMsg(null), 3000);
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#10b981', marginBottom:'16px' }}>
                ðŸ’° {lang==='ar'?'Ø§Ù„Ø³Ø¬Ù„ Ø§Ù„Ù…Ø§Ù„ÙŠ':'Financial Log'}
            </div>
            <div style={{ display:'flex', gap:'12px', marginBottom:'16px', flexWrap:'wrap' }}>
                <AdminStatCard icon="ðŸ§ " label={lang==='ar'?'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ø¥Ù†ØªÙ„':'Total Intel in Circulation'} value={totalIntel.toLocaleString()} color="#10b981" />
                <AdminStatCard icon="ðŸ‘¥" label={lang==='ar'?'Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†':'Users Tracked'} value={users.length} color="#00f2ff" />
            </div>

            {/* â”€â”€ Edit Balance Modal â”€â”€ */}
            {editUser && (
                <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:Z.MODAL_HIGH,padding:'16px'}}
                    onClick={() => { setEditUser(null); setEditAmount(''); setEditNote(''); }}>
                    <div style={{background:'linear-gradient(160deg,#0a0a20,#0f0f2e)',border:'1px solid rgba(16,185,129,0.35)',borderRadius:'18px',padding:'22px',width:'100%',maxWidth:'320px'}}
                        onClick={e => e.stopPropagation()}>
                        <div style={{fontWeight:800,color:'#10b981',fontSize:'14px',marginBottom:'14px'}}>
                            ðŸ’° {lang==='ar'?'ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø±ØµÙŠØ¯':'Adjust Balance'} â€” {editUser.displayName}
                        </div>
                        <div style={{fontSize:'12px',color:'#9ca3af',marginBottom:'8px'}}>
                            {lang==='ar'?'Ø§Ù„Ø±ØµÙŠØ¯ Ø§Ù„Ø­Ø§Ù„ÙŠ':'Current Balance'}: <span style={{color:'#10b981',fontWeight:700}}>{(editUser.currency||0).toLocaleString()} ðŸ§ </span>
                        </div>
                        <input
                            type="number"
                            min="0"
                            placeholder={lang==='ar'?'Ø§Ù„Ù…Ø¨Ù„Øº':'Amount'}
                            value={editAmount}
                            onChange={e => setEditAmount(e.target.value)}
                            style={{width:'100%',padding:'9px 12px',borderRadius:'10px',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(16,185,129,0.3)',color:'#e5e7eb',fontSize:'13px',marginBottom:'10px',outline:'none'}}
                        />
                        <input
                            type="text"
                            placeholder={lang==='ar'?'Ø§Ù„Ø³Ø¨Ø¨ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)':'Reason (optional)'}
                            value={editNote}
                            onChange={e => setEditNote(e.target.value)}
                            style={{width:'100%',padding:'9px 12px',borderRadius:'10px',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',color:'#e5e7eb',fontSize:'13px',marginBottom:'14px',outline:'none'}}
                        />
                        <div style={{display:'flex',gap:'10px'}}>
                            <button
                                disabled={editSaving || editAmount===''}
                                onClick={() => handleAdjust('add')}
                                style={{flex:1,padding:'9px',borderRadius:'10px',background:'linear-gradient(135deg,#10b981,#059669)',border:'none',color:'#fff',fontWeight:800,fontSize:'13px',cursor:editSaving?'wait':'pointer'}}>
                                âž• {lang==='ar'?'Ø¥Ø¶Ø§ÙØ©':'Add'}
                            </button>
                            <button
                                disabled={editSaving || editAmount===''}
                                onClick={() => handleAdjust('sub')}
                                style={{flex:1,padding:'9px',borderRadius:'10px',background:'linear-gradient(135deg,#ef4444,#dc2626)',border:'none',color:'#fff',fontWeight:800,fontSize:'13px',cursor:editSaving?'wait':'pointer'}}>
                                âž– {lang==='ar'?'Ø®ØµÙ…':'Deduct'}
                            </button>
                        </div>
                        <button onClick={() => { setEditUser(null); setEditAmount(''); setEditNote(''); }}
                            style={{width:'100%',marginTop:'10px',padding:'8px',borderRadius:'10px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'#9ca3af',fontSize:'12px',cursor:'pointer'}}>
                            {lang==='ar'?'Ø¥Ù„ØºØ§Ø¡':'Cancel'}
                        </button>
                    </div>
                </div>
            )}

            {editMsg && (
                <div style={{padding:'10px 14px',borderRadius:'10px',background:editMsg.ok?'rgba(16,185,129,0.15)':`rgba(239,68,68,0.15)`,border:`1px solid ${editMsg.ok?'rgba(16,185,129,0.4)':`rgba(239,68,68,0.4)`}`,color:editMsg.ok?'#10b981':'#ef4444',fontSize:'12px',fontWeight:700,marginBottom:'12px'}}>
                    {editMsg.text}
                </div>
            )}

            {loading ? <div style={{color:'#6b7280',fontSize:'12px',textAlign:'center',padding:'20px'}}>â³</div> : (
                <div style={{ maxHeight:'50vh', overflowY:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'11px' }}>
                        <thead>
                            <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding:'6px 8px', textAlign:'left', color:'#9ca3af', fontWeight:700 }}>#</th>
                                <th style={{ padding:'6px 8px', textAlign:'left', color:'#9ca3af', fontWeight:700 }}>{lang==='ar'?'Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…':'User'}</th>
                                <th style={{ padding:'6px 8px', textAlign:'right', color:'#9ca3af', fontWeight:700 }}>ðŸ§  {lang==='ar'?'Ø¥Ù†ØªÙ„':'Intel'}</th>
                                <th style={{ padding:'6px 8px', textAlign:'right', color:'#9ca3af', fontWeight:700 }}>{lang==='ar'?'Ø§Ù†ØªØµØ§Ø±Ø§Øª':'Wins'}</th>
                                <th style={{ padding:'6px 8px', textAlign:'center', color:'#9ca3af', fontWeight:700 }}>{lang==='ar'?'ØªØ¹Ø¯ÙŠÙ„':'Edit'}</th>
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
                                            âœï¸ {lang==='ar'?'ØªØ¹Ø¯ÙŠÙ„':'Edit'}
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸŽ® MAIN ADMIN PANEL COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// â“ FAQ MANAGEMENT SECTION â€” Admin adds Q&A for Help Center
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var AQManagementSection = ({ lang, onNotification }) => {
    const [faqs, setFaqs] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [showForm, setShowForm] = React.useState(false);
    const [editId, setEditId] = React.useState(null);
    const [formData, setFormData] = React.useState({ emoji: 'â“', question_ar: '', question_en: '', answer_ar: '', answer_en: '', order: 1 });
    const [saving, setSaving] = React.useState(false);
    const [deleting, setDeleting] = React.useState(null);

    React.useEffect(() => {
        const unsub = helpFaqCollection.onSnapshot(snap => {
            let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            data.sort((a, b) => (a.order||99) - (b.order||99));
            setFaqs(data);
            setLoading(false);
        }, () => setLoading(false));
        return () => unsub();
    }, []);

    const handleSave = async () => {
        if (!formData.question_ar.trim() || !formData.answer_ar.trim()) {
            onNotification(lang==='ar'?'âŒ Ø§Ù„Ø³Ø¤Ø§Ù„ ÙˆØ§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ù…Ø·Ù„ÙˆØ¨Ø§Ù†':'âŒ Question and answer required'); return;
        }
        setSaving(true);
        try {
            const data = { ...formData, updatedAt: TS() };
            if (editId) {
                await helpFaqCollection.doc(editId).update(data);
                onNotification(lang==='ar'?'âœ… ØªÙ… Ø§Ù„ØªØ¹Ø¯ÙŠÙ„':'âœ… Updated');
            } else {
                await helpFaqCollection.add({ ...data, createdAt: TS() });
                onNotification(lang==='ar'?'âœ… ØªÙ… Ø§Ù„Ø¥Ø¶Ø§ÙØ©':'âœ… Added');
            }
            setShowForm(false); setEditId(null);
            setFormData({ emoji:'â“', question_ar:'', question_en:'', answer_ar:'', answer_en:'', order:1 });
        } catch(e) { onNotification(lang==='ar'?'âŒ Ø®Ø·Ø£':'âŒ Error'); }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        setDeleting(id);
        try { await helpFaqCollection.doc(id).delete(); onNotification(lang==='ar'?'âœ… ØªÙ… Ø§Ù„Ø­Ø°Ù':'âœ… Deleted'); }
        catch(e) { onNotification(lang==='ar'?'âŒ Ø®Ø·Ø£':'âŒ Error'); }
        setDeleting(null);
    };

    const startEdit = (faq) => {
        setFormData({ emoji:faq.emoji||'â“', question_ar:faq.question_ar||'', question_en:faq.question_en||'', answer_ar:faq.answer_ar||'', answer_en:faq.answer_en||'', order:faq.order||1 });
        setEditId(faq.id); setShowForm(true);
    };

    const inp = (placeholder, key, multiline) => multiline ? (
        <textarea value={formData[key]} onChange={e=>setFormData(p=>({...p,[key]:e.target.value}))} placeholder={placeholder}
            style={{width:'100%',padding:'8px 12px',borderRadius:'10px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:'12px',outline:'none',resize:'vertical',minHeight:'60px',boxSizing:'border-box',marginBottom:'8px'}}/>
    ) : (
        <input type={key==='order'?'number':'text'} value={formData[key]} onChange={e=>setFormData(p=>({...p,[key]:key==='order'?parseInt(e.target.value)||1:e.target.value}))} placeholder={placeholder}
            style={{width:'100%',padding:'8px 12px',borderRadius:'10px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:'12px',outline:'none',boxSizing:'border-box',marginBottom:'8px'}}/>
    );

    return (
        <div style={{padding:'16px',maxHeight:'calc(100vh - 160px)',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                <div style={{fontSize:'14px',fontWeight:800,color:'#00f2ff'}}>â“ {lang==='ar'?'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ø´Ø§Ø¦Ø¹Ø©':'FAQ Management'}</div>
                <button onClick={()=>{setShowForm(!showForm);setEditId(null);setFormData({emoji:'â“',question_ar:'',question_en:'',answer_ar:'',answer_en:'',order:faqs.length+1});}}
                    style={{padding:'7px 14px',borderRadius:'10px',border:'1px solid rgba(0,242,255,0.4)',background:'rgba(0,242,255,0.1)',color:'#00f2ff',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>
                    {showForm&&!editId?'âœ•':('+ '+(lang==='ar'?'Ø¥Ø¶Ø§ÙØ© Ø³Ø¤Ø§Ù„':'Add FAQ'))}
                </button>
            </div>

            {showForm && (
                <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(0,242,255,0.2)',borderRadius:'14px',padding:'16px',marginBottom:'16px'}}>
                    <div style={{fontSize:'12px',fontWeight:700,color:'#00f2ff',marginBottom:'12px'}}>{editId?(lang==='ar'?'ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø³Ø¤Ø§Ù„':'Edit FAQ'):(lang==='ar'?'Ø¥Ø¶Ø§ÙØ© Ø³Ø¤Ø§Ù„ Ø¬Ø¯ÙŠØ¯':'Add New FAQ')}</div>
                    <div style={{display:'grid',gridTemplateColumns:'60px 1fr',gap:'8px',marginBottom:'8px',alignItems:'center'}}>
                        <div style={{fontSize:'11px',color:'#9ca3af'}}>Emoji</div>
                        {inp('â“','emoji')}
                    </div>
                    <div style={{fontSize:'11px',color:'#9ca3af',marginBottom:'4px'}}>ðŸ‡¸ðŸ‡¦ {lang==='ar'?'Ø§Ù„Ø³Ø¤Ø§Ù„ (Ø¹Ø±Ø¨ÙŠ)':'Question (Arabic)'}</div>
                    {inp(lang==='ar'?'Ø§Ù„Ø³Ø¤Ø§Ù„ Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©...':'Arabic question...','question_ar')}
                    <div style={{fontSize:'11px',color:'#9ca3af',marginBottom:'4px'}}>ðŸ‡¬ðŸ‡§ {lang==='ar'?'Ø§Ù„Ø³Ø¤Ø§Ù„ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)':'Question (English)'}</div>
                    {inp('English question...','question_en')}
                    <div style={{fontSize:'11px',color:'#9ca3af',marginBottom:'4px'}}>ðŸ‡¸ðŸ‡¦ {lang==='ar'?'Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© (Ø¹Ø±Ø¨ÙŠ)':'Answer (Arabic)'}</div>
                    {inp(lang==='ar'?'Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©...':'Arabic answer...','answer_ar',true)}
                    <div style={{fontSize:'11px',color:'#9ca3af',marginBottom:'4px'}}>ðŸ‡¬ðŸ‡§ {lang==='ar'?'Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)':'Answer (English)'}</div>
                    {inp('English answer...','answer_en',true)}
                    <div style={{fontSize:'11px',color:'#9ca3af',marginBottom:'4px'}}>{lang==='ar'?'Ø§Ù„ØªØ±ØªÙŠØ¨':'Order'}</div>
                    {inp('1','order')}
                    <div style={{display:'flex',gap:'8px',marginTop:'4px'}}>
                        <button onClick={handleSave} disabled={saving} style={{flex:1,padding:'9px',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,rgba(0,242,255,0.2),rgba(112,0,255,0.15))',color:'#00f2ff',fontSize:'12px',fontWeight:800,cursor:'pointer',opacity:saving?0.6:1}}>
                            {saving?'â³...':(`ðŸ’¾ ${lang==='ar'?'Ø­ÙØ¸':'Save'}`)}
                        </button>
                        <button onClick={()=>{setShowForm(false);setEditId(null);}} style={{padding:'9px 16px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)',color:'#9ca3af',fontSize:'12px',cursor:'pointer'}}>âœ•</button>
                    </div>
                </div>
            )}

            {loading ? <div style={{textAlign:'center',padding:'32px',color:'#6b7280'}}>â³</div> :
             faqs.length===0 ? <div style={{textAlign:'center',padding:'32px',color:'#4b5563'}}>
                <div style={{fontSize:'32px',marginBottom:'8px'}}>â“</div>
                <div style={{fontSize:'12px'}}>{lang==='ar'?'Ù„Ø§ Ø£Ø³Ø¦Ù„Ø© Ø¨Ø¹Ø¯':'No FAQs yet'}</div>
             </div> :
             faqs.map(faq => (
                <div key={faq.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'12px 14px',marginBottom:'8px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'10px'}}>
                        <div style={{flex:1}}>
                            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                                <span style={{fontSize:'18px'}}>{faq.emoji||'â“'}</span>
                                <span style={{fontSize:'12px',fontWeight:700,color:'#e2e8f0'}}>{lang==='ar'?faq.question_ar:faq.question_en}</span>
                                <span style={{fontSize:'9px',padding:'1px 6px',borderRadius:'6px',background:'rgba(0,242,255,0.1)',border:'1px solid rgba(0,242,255,0.2)',color:'#00f2ff'}}>#{faq.order||1}</span>
                            </div>
                            <div style={{fontSize:'11px',color:'#6b7280',lineHeight:1.5,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'300px'}}>{lang==='ar'?faq.answer_ar:faq.answer_en}</div>
                        </div>
                        <div style={{display:'flex',gap:'4px',flexShrink:0}}>
                            <button onClick={()=>startEdit(faq)} style={{padding:'5px 10px',borderRadius:'8px',background:'rgba(0,242,255,0.1)',border:'1px solid rgba(0,242,255,0.25)',color:'#00f2ff',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>âœï¸</button>
                            <button onClick={()=>handleDelete(faq.id)} disabled={deleting===faq.id} style={{padding:'5px 10px',borderRadius:'8px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',color:'#f87171',fontSize:'10px',fontWeight:700,cursor:'pointer',opacity:deleting===faq.id?0.5:1}}>ðŸ—‘ï¸</button>
                        </div>
                    </div>
                </div>
             ))}
        </div>
    );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ“ FEEDBACK INBOX SECTION â€” Admin views user feedback
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
var eedbackInboxSection = ({ lang, onNotification }) => {
    const [feedbacks, setFeedbacks] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState('all'); // 'all' | 'new' | 'reviewed'

    React.useEffect(() => {
        const unsub = feedbackCollection.onSnapshot(snap => {
            let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            data.sort((a, b) => {
                const ta = a.createdAt?.toMillis?.() || a.createdAt?.seconds*1000 || 0;
                const tb = b.createdAt?.toMillis?.() || b.createdAt?.seconds*1000 || 0;
                return tb - ta;
            });
            setFeedbacks(data);
            setLoading(false);
        }, () => setLoading(false));
        return () => unsub();
    }, []);

    const markReviewed = async (id) => {
        try {
            await feedbackCollection.doc(id).update({ status: 'reviewed' });
            onNotification(lang==='ar'?'âœ… ØªÙ… Ø§Ù„ØªØ¹Ù„ÙŠÙ… ÙƒÙ…Ø±Ø§Ø¬ÙŽØ¹':'âœ… Marked as reviewed');
        } catch(e) { onNotification(lang==='ar'?'âŒ Ø®Ø·Ø£':'âŒ Error'); }
    };

    const deleteFeedback = async (id) => {
        try {
            await feedbackCollection.doc(id).delete();
            onNotification(lang==='ar'?'âœ… ØªÙ… Ø§Ù„Ø­Ø°Ù':'âœ… Deleted');
        } catch(e) {}
    };

    const fmtDate = (ts) => {
        if (!ts) return 'â€”';
        const d = ts?.toDate ? ts.toDate() : new Date(ts?.seconds*1000||ts);
        return d.toLocaleDateString(lang==='ar'?'ar-EG':'en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
    };

    const shown = feedbacks.filter(f => filter==='all' ? true : f.status===filter);
    const newCount = feedbacks.filter(f=>f.status==='new').length;

    return (
        <div style={{padding:'16px',maxHeight:'calc(100vh - 160px)',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <div style={{fontSize:'14px',fontWeight:800,color:'#4ade80'}}>ðŸ“ {lang==='ar'?'ØµÙ†Ø¯ÙˆÙ‚ Ø§Ù„ÙÙŠØ¯Ø¨Ø§Ùƒ':'Feedback Inbox'}</div>
                    {newCount > 0 && <span style={{fontSize:'10px',padding:'2px 8px',borderRadius:'10px',background:'rgba(74,222,128,0.2)',border:'1px solid rgba(74,222,128,0.4)',color:'#4ade80',fontWeight:700}}>{newCount} {lang==='ar'?'Ø¬Ø¯ÙŠØ¯':'new'}</span>}
                </div>
            </div>
            {/* Filter Tabs */}
            <div style={{display:'flex',gap:'6px',marginBottom:'14px'}}>
                {['all','new','reviewed'].map(f=>(
                    <button key={f} onClick={()=>setFilter(f)} style={{padding:'5px 12px',borderRadius:'8px',border:`1px solid ${filter===f?'rgba(74,222,128,0.4)':'rgba(255,255,255,0.1)'}`,background:filter===f?'rgba(74,222,128,0.1)':'rgba(255,255,255,0.03)',color:filter===f?'#4ade80':'#6b7280',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>
                        {f==='all'?(lang==='ar'?'Ø§Ù„ÙƒÙ„':'All'):f==='new'?(lang==='ar'?'Ø¬Ø¯ÙŠØ¯':'New'):(lang==='ar'?'ØªÙ… Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©':'Reviewed')}
                    </button>
                ))}
            </div>
            {loading ? <div style={{textAlign:'center',padding:'32px',color:'#6b7280'}}>â³</div> :
             shown.length===0 ? <div style={{textAlign:'center',padding:'32px',color:'#4b5563'}}>
                <div style={{fontSize:'32px',marginBottom:'8px'}}>ðŸ“</div>
                <div style={{fontSize:'12px'}}>{lang==='ar'?'Ù„Ø§ ÙÙŠØ¯Ø¨Ø§Ùƒ':'No feedback'}</div>
             </div> :
             shown.map(fb => (
                <div key={fb.id} style={{background:'rgba(255,255,255,0.03)',border:`1px solid ${fb.status==='new'?'rgba(74,222,128,0.2)':'rgba(255,255,255,0.07)'}`,borderRadius:'12px',padding:'12px 14px',marginBottom:'8px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'8px',marginBottom:'8px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                            <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',overflow:'hidden',flexShrink:0}}>
                                {fb.userPhoto?<img src={fb.userPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>ðŸ˜Ž</div>}
                            </div>
                            <div>
                                <div style={{fontSize:'12px',fontWeight:700,color:'#e2e8f0'}}>{fb.userName||'User'}</div>
                                <div style={{fontSize:'9px',color:'#6b7280'}}>{fmtDate(fb.createdAt)}</div>
                            </div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:'6px',flexShrink:0}}>
                            {/* Star rating */}
                            <div style={{display:'flex',gap:'1px'}}>
                                {[1,2,3,4,5].map(s=><span key={s} style={{fontSize:'10px',opacity:fb.rating>=s?1:0.25}}>â­</span>)}
                            </div>
                            <span style={{fontSize:'9px',padding:'1px 6px',borderRadius:'6px',background:fb.status==='new'?'rgba(74,222,128,0.15)':'rgba(255,255,255,0.06)',border:`1px solid ${fb.status==='new'?'rgba(74,222,128,0.35)':'rgba(255,255,255,0.1)'}`,color:fb.status==='new'?'#4ade80':'#6b7280',fontWeight:700}}>
                                {fb.status==='new'?(lang==='ar'?'Ø¬Ø¯ÙŠØ¯':'New'):(lang==='ar'?'Ù…Ø±Ø§Ø¬ÙŽØ¹':'Reviewed')}
                            </span>
                        </div>
                    </div>
                    <div style={{fontSize:'12px',color:'#d1d5db',lineHeight:1.6,marginBottom:'10px',background:'rgba(255,255,255,0.03)',padding:'8px 10px',borderRadius:'8px'}}>{fb.text}</div>
                    <div style={{display:'flex',gap:'6px'}}>
                        {fb.status==='new' && (
                            <button onClick={()=>markReviewed(fb.id)} style={{padding:'5px 12px',borderRadius:'8px',background:'rgba(74,222,128,0.1)',border:'1px solid rgba(74,222,128,0.25)',color:'#4ade80',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>
                                âœ… {lang==='ar'?'ØªÙ… Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©':'Mark Reviewed'}
                            </button>
                        )}
                        <button onClick={()=>deleteFeedback(fb.id)} style={{padding:'5px 10px',borderRadius:'8px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>
                            ðŸ—‘ï¸
                        </button>
                    </div>
                </div>
             ))}
        </div>
    );
};

var dminPanel = ({ show, onClose, currentUser, currentUserData, lang, onOpenProfile }) => {
    const [activeSection, setActiveSection] = useState('overview');
    const [notification, setNotification] = useState(null);

    const role = getUserRole(currentUserData, currentUser?.uid);

    // âœ… ALL hooks MUST come before any early return â€” Rules of Hooks

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

    // â”€â”€ Early return AFTER all hooks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (!show || !role) return null;

    // â”€â”€ Sidebar nav items based on role â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const navItems = [];

    if (role === 'owner' || role === 'admin') {
        navItems.push({ id:'overview',  icon:'ðŸ“Š', label_en:'Overview',      label_ar:'Ù†Ø¸Ø±Ø© Ø¹Ø§Ù…Ø©',  color:'#ffd700',  roles:['owner','admin'] });
    }
    if (role === 'owner') {
        navItems.push({ id:'staff',     icon:'ðŸ‘¥', label_en:'Staff Mgmt',    label_ar:'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„ÙØ±ÙŠÙ‚', color:'#ffd700', roles:['owner'] });
        navItems.push({ id:'financial', icon:'ðŸ’°', label_en:'Financial Log', label_ar:'Ø§Ù„Ø³Ø¬Ù„ Ø§Ù„Ù…Ø§Ù„ÙŠ',color:'#10b981', roles:['owner'] });
        navItems.push({ id:'fakeprofiles', icon:'ðŸŽ­', label_en:'Fake Profiles', label_ar:'Ø¨Ø±ÙˆÙØ§ÙŠÙ„Ø§Øª ØªØ¬Ø±ÙŠØ¨ÙŠØ©', color:'#00f2ff', roles:['owner'] });
    }
    if (role === 'owner' || role === 'admin') {
        navItems.push({ id:'users',     icon:'ðŸš«', label_en:'User Mgmt',     label_ar:'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†', color:'#ef4444', roles:['owner','admin'] });
        navItems.push({ id:'broadcast', icon:'ðŸ“¢', label_en:'Broadcast',     label_ar:'Ø¥Ø´Ø¹Ø§Ø± Ø¬Ù…Ø§Ø¹ÙŠ', color:'#f59e0b', roles:['owner','admin'] });
        navItems.push({ id:'activitylog',icon:'ðŸ“‹',label_en:'Activity Log',  label_ar:'Ø³Ø¬Ù„ Ø§Ù„Ù†Ø´Ø§Ø·',  color:'#3b82f6', roles:['owner','admin'] });
    }
    navItems.push(
        { id:'reports',  icon:'ðŸš¨', label_en:'Reports',        label_ar:'Ø§Ù„Ø¨Ù„Ø§ØºØ§Øª',      color:'#ef4444', roles:['owner','admin','moderator'] },
        { id:'tickets',  icon:'ðŸŽ«', label_en:'Tickets',        label_ar:'Ø§Ù„ØªØ°Ø§ÙƒØ±',       color:'#6366f1', roles:['owner','admin','moderator'] },
        { id:'moments',  icon:'ðŸ”', label_en:'Content Review', label_ar:'Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ù…Ø­ØªÙˆÙ‰', color:'#8b5cf6', roles:['owner','admin'] },
        { id:'faq',      icon:'â“', label_en:'FAQ Mgmt',       label_ar:'Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ø´Ø§Ø¦Ø¹Ø©', color:'#00f2ff', roles:['owner','admin'] },
        { id:'feedback', icon:'ðŸ“', label_en:'Feedback',       label_ar:'Ø§Ù„ÙÙŠØ¯Ø¨Ø§Ùƒ',      color:'#4ade80', roles:['owner','admin'] }
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
            case 'faq':        return <FAQManagementSection lang={lang} onNotification={setNotification} />;
            case 'feedback':   return <FeedbackInboxSection lang={lang} onNotification={setNotification} />;
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

                    {/* â”€â”€ Header â”€â”€ */}
                    <div style={{
                        padding: isMobile ? '10px 14px' : '14px 20px',
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        borderBottom:'1px solid rgba(255,255,255,0.08)',
                        background: `linear-gradient(90deg, ${rc?.bg||'rgba(0,0,0,0)'}, transparent)`,
                        flexShrink: 0,
                    }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                            <div style={{ fontSize: isMobile ? '18px' : '24px' }}>{rc?.icon || 'ðŸ›¡ï¸'}</div>
                            <div>
                                <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight:900, color:'white', letterSpacing:'0.05em', display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }}>
                                    {lang==='ar'?'Ù„ÙˆØ­Ø© Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©':'Admin Panel'}
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
                                }}>â˜° {lang==='ar'?'Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©':'Menu'}</button>
                            )}
                            <button onClick={onClose} style={{
                                background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                                color:'white', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', fontSize:'14px'
                            }}>âœ•</button>
                        </div>
                    </div>

                    {/* â”€â”€ Notification â”€â”€ */}
                    {notification && (
                        <div style={{ background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', padding:'8px 16px', fontSize:'12px', color:'#10b981', textAlign:'center', flexShrink:0 }}>
                            {notification}
                        </div>
                    )}

                    {/* â”€â”€ Mobile Nav Drawer (overlay) â”€â”€ */}
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
                                    {lang==='ar'?'Ø§Ù„Ø£Ù‚Ø³Ø§Ù…':'Sections'}
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

                    {/* â”€â”€ Body: Sidebar + Content â”€â”€ */}
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

