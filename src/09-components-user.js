var lockedUserItem = ({ uid, onUnblock, lang }) => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        usersCollection.doc(uid).get().then(doc => {
            if (doc.exists) {
                setUserData({ id: doc.id, ...doc.data() });
            }
        });
    }, [uid]);

    return (
        <div className="blocked-user-item">
            <AvatarWithFrame photoURL={userData?.photoURL} equipped={userData?.equipped} size="sm" />
            <span className="blocked-user-name">{userData?.displayName || uid.substring(0, 8)}</span>
            <button onClick={onUnblock} className="btn-ghost px-2 py-1 rounded text-xs">
                {lang === 'ar' ? 'Ø¥Ù„ØºØ§Ø¡' : 'Unblock'}
            </button>
        </div>
    );
};

// ðŸŒ COUNTRIES LIST
var OUNTRIES = [
    { code:'SA', flag:'ðŸ‡¸ðŸ‡¦', name_ar:'Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©',      name_en:'Saudi Arabia' },
    { code:'EG', flag:'ðŸ‡ªðŸ‡¬', name_ar:'Ù…ØµØ±',            name_en:'Egypt' },
    { code:'AE', flag:'ðŸ‡¦ðŸ‡ª', name_ar:'Ø§Ù„Ø¥Ù…Ø§Ø±Ø§Øª',      name_en:'UAE' },
    { code:'KW', flag:'ðŸ‡°ðŸ‡¼', name_ar:'Ø§Ù„ÙƒÙˆÙŠØª',        name_en:'Kuwait' },
    { code:'QA', flag:'ðŸ‡¶ðŸ‡¦', name_ar:'Ù‚Ø·Ø±',           name_en:'Qatar' },
    { code:'BH', flag:'ðŸ‡§ðŸ‡­', name_ar:'Ø§Ù„Ø¨Ø­Ø±ÙŠÙ†',       name_en:'Bahrain' },
    { code:'OM', flag:'ðŸ‡´ðŸ‡²', name_ar:'Ø¹ÙÙ…Ø§Ù†',         name_en:'Oman' },
    { code:'IQ', flag:'ðŸ‡®ðŸ‡¶', name_ar:'Ø§Ù„Ø¹Ø±Ø§Ù‚',        name_en:'Iraq' },
    { code:'SY', flag:'ðŸ‡¸ðŸ‡¾', name_ar:'Ø³ÙˆØ±ÙŠØ§',         name_en:'Syria' },
    { code:'JO', flag:'ðŸ‡¯ðŸ‡´', name_ar:'Ø§Ù„Ø£Ø±Ø¯Ù†',        name_en:'Jordan' },
    { code:'LB', flag:'ðŸ‡±ðŸ‡§', name_ar:'Ù„Ø¨Ù†Ø§Ù†',         name_en:'Lebanon' },
    { code:'PS', flag:'ðŸ‡µðŸ‡¸', name_ar:'ÙÙ„Ø³Ø·ÙŠÙ†',        name_en:'Palestine' },
    { code:'YE', flag:'ðŸ‡¾ðŸ‡ª', name_ar:'Ø§Ù„ÙŠÙ…Ù†',         name_en:'Yemen' },
    { code:'LY', flag:'ðŸ‡±ðŸ‡¾', name_ar:'Ù„ÙŠØ¨ÙŠØ§',         name_en:'Libya' },
    { code:'TN', flag:'ðŸ‡¹ðŸ‡³', name_ar:'ØªÙˆÙ†Ø³',          name_en:'Tunisia' },
    { code:'DZ', flag:'ðŸ‡©ðŸ‡¿', name_ar:'Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±',       name_en:'Algeria' },
    { code:'MA', flag:'ðŸ‡²ðŸ‡¦', name_ar:'Ø§Ù„Ù…ØºØ±Ø¨',        name_en:'Morocco' },
    { code:'SD', flag:'ðŸ‡¸ðŸ‡©', name_ar:'Ø§Ù„Ø³ÙˆØ¯Ø§Ù†',       name_en:'Sudan' },
    { code:'SO', flag:'ðŸ‡¸ðŸ‡´', name_ar:'Ø§Ù„ØµÙˆÙ…Ø§Ù„',       name_en:'Somalia' },
    { code:'MR', flag:'ðŸ‡²ðŸ‡·', name_ar:'Ù…ÙˆØ±ÙŠØªØ§Ù†ÙŠØ§',     name_en:'Mauritania' },
    { code:'US', flag:'ðŸ‡ºðŸ‡¸', name_ar:'Ø£Ù…Ø±ÙŠÙƒØ§',        name_en:'USA' },
    { code:'GB', flag:'ðŸ‡¬ðŸ‡§', name_ar:'Ø¨Ø±ÙŠØ·Ø§Ù†ÙŠØ§',      name_en:'UK' },
    { code:'FR', flag:'ðŸ‡«ðŸ‡·', name_ar:'ÙØ±Ù†Ø³Ø§',         name_en:'France' },
    { code:'DE', flag:'ðŸ‡©ðŸ‡ª', name_ar:'Ø£Ù„Ù…Ø§Ù†ÙŠØ§',       name_en:'Germany' },
    { code:'IT', flag:'ðŸ‡®ðŸ‡¹', name_ar:'Ø¥ÙŠØ·Ø§Ù„ÙŠØ§',       name_en:'Italy' },
    { code:'ES', flag:'ðŸ‡ªðŸ‡¸', name_ar:'Ø¥Ø³Ø¨Ø§Ù†ÙŠØ§',       name_en:'Spain' },
    { code:'CA', flag:'ðŸ‡¨ðŸ‡¦', name_ar:'ÙƒÙ†Ø¯Ø§',          name_en:'Canada' },
    { code:'AU', flag:'ðŸ‡¦ðŸ‡º', name_ar:'Ø£Ø³ØªØ±Ø§Ù„ÙŠØ§',      name_en:'Australia' },
    { code:'TR', flag:'ðŸ‡¹ðŸ‡·', name_ar:'ØªØ±ÙƒÙŠØ§',         name_en:'Turkey' },
    { code:'IR', flag:'ðŸ‡®ðŸ‡·', name_ar:'Ø¥ÙŠØ±Ø§Ù†',         name_en:'Iran' },
    { code:'PK', flag:'ðŸ‡µðŸ‡°', name_ar:'Ø¨Ø§ÙƒØ³ØªØ§Ù†',       name_en:'Pakistan' },
    { code:'IN', flag:'ðŸ‡®ðŸ‡³', name_ar:'Ø§Ù„Ù‡Ù†Ø¯',         name_en:'India' },
    { code:'CN', flag:'ðŸ‡¨ðŸ‡³', name_ar:'Ø§Ù„ØµÙŠÙ†',         name_en:'China' },
    { code:'JP', flag:'ðŸ‡¯ðŸ‡µ', name_ar:'Ø§Ù„ÙŠØ§Ø¨Ø§Ù†',       name_en:'Japan' },
    { code:'KR', flag:'ðŸ‡°ðŸ‡·', name_ar:'ÙƒÙˆØ±ÙŠØ§',         name_en:'South Korea' },
    { code:'BR', flag:'ðŸ‡§ðŸ‡·', name_ar:'Ø§Ù„Ø¨Ø±Ø§Ø²ÙŠÙ„',      name_en:'Brazil' },
    { code:'MX', flag:'ðŸ‡²ðŸ‡½', name_ar:'Ø§Ù„Ù…ÙƒØ³ÙŠÙƒ',       name_en:'Mexico' },
    { code:'RU', flag:'ðŸ‡·ðŸ‡º', name_ar:'Ø±ÙˆØ³ÙŠØ§',         name_en:'Russia' },
    { code:'NL', flag:'ðŸ‡³ðŸ‡±', name_ar:'Ù‡ÙˆÙ„Ù†Ø¯Ø§',        name_en:'Netherlands' },
    { code:'SE', flag:'ðŸ‡¸ðŸ‡ª', name_ar:'Ø§Ù„Ø³ÙˆÙŠØ¯',        name_en:'Sweden' },
    { code:'NO', flag:'ðŸ‡³ðŸ‡´', name_ar:'Ø§Ù„Ù†Ø±ÙˆÙŠØ¬',       name_en:'Norway' },
    { code:'CH', flag:'ðŸ‡¨ðŸ‡­', name_ar:'Ø³ÙˆÙŠØ³Ø±Ø§',        name_en:'Switzerland' },
    { code:'NG', flag:'ðŸ‡³ðŸ‡¬', name_ar:'Ù†ÙŠØ¬ÙŠØ±ÙŠØ§',       name_en:'Nigeria' },
    { code:'ET', flag:'ðŸ‡ªðŸ‡¹', name_ar:'Ø¥Ø«ÙŠÙˆØ¨ÙŠØ§',       name_en:'Ethiopia' },
    { code:'ZA', flag:'ðŸ‡¿ðŸ‡¦', name_ar:'Ø¬Ù†ÙˆØ¨ Ø£ÙØ±ÙŠÙ‚ÙŠØ§',  name_en:'South Africa' },
    { code:'ID', flag:'ðŸ‡®ðŸ‡©', name_ar:'Ø¥Ù†Ø¯ÙˆÙ†ÙŠØ³ÙŠØ§',     name_en:'Indonesia' },
    { code:'MY', flag:'ðŸ‡²ðŸ‡¾', name_ar:'Ù…Ø§Ù„ÙŠØ²ÙŠØ§',       name_en:'Malaysia' },
    { code:'PH', flag:'ðŸ‡µðŸ‡­', name_ar:'Ø§Ù„ÙÙ„Ø¨ÙŠÙ†',       name_en:'Philippines' },
];

// ðŸŒ Country Picker Component â€” Flag Grid
var ountryPicker = ({ selected, onSelect, lang }) => {
    const [search, setSearch] = useState('');
    const filtered = COUNTRIES.filter(c => {
        const q = search.toLowerCase();
        return c.name_ar.includes(q) || c.name_en.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
    });
    return (
        <div>
            <input
                style={{
                    width:'100%', padding:'7px 12px', borderRadius:'10px', fontSize:'11px',
                    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                    color:'white', outline:'none', marginBottom:'10px'
                }}
                placeholder={lang === 'ar' ? 'ðŸ” Ø§Ø¨Ø­Ø«...' : 'ðŸ” Search...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            <div style={{
                display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'6px',
                maxHeight:'180px', overflowY:'auto',
                scrollbarWidth:'thin', scrollbarColor:'rgba(255,255,255,0.1) transparent'
            }}>
                {filtered.map(c => (
                    <button
                        key={c.code}
                        onClick={() => onSelect(c)}
                        title={lang==='ar'?c.name_ar:c.name_en}
                        style={{
                            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                            gap:'3px', padding:'7px 4px', borderRadius:'10px', cursor:'pointer', border:'none',
                            background: selected===c.code ? 'rgba(0,242,255,0.18)' : 'rgba(255,255,255,0.04)',
                            outline: selected===c.code ? '1.5px solid rgba(0,242,255,0.6)' : '1.5px solid transparent',
                            transition:'all 0.15s',
                            boxShadow: selected===c.code ? '0 0 8px rgba(0,242,255,0.2)' : 'none'
                        }}
                    >
                        <span style={{ fontSize:'22px', lineHeight:1 }}>{c.flag}</span>
                        <span style={{ fontSize:'8px', color: selected===c.code?'#00f2ff':'#6b7280', fontWeight:600, letterSpacing:'0.3px' }}>{c.code}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

// ðŸŽ‰ ONBOARDING MODAL - New User Setup
var nboardingModal = ({ show, googleUser, onComplete, lang }) => {
    const [displayName, setDisplayName] = useState(googleUser?.displayName || '');
    const [gender, setGender] = useState('');
    const [country, setCountry] = useState(null);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [photoURL, setPhotoURL] = useState(googleUser?.photoURL || null);
    const fileRef = useRef(null);

    if (!show) return null;

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX = 300;
                let w = img.width, h = img.height;
                if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
                else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                setPhotoURL(canvas.toDataURL('image/jpeg', 0.75));
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleComplete = () => {
        if (!displayName.trim() || !gender) return;
        onComplete({ displayName: displayName.trim(), gender, country, photoURL });
    };

    return (
        <div className="onboarding-overlay" style={{ zIndex:Z.MODAL }}>
            <div className="onboarding-card animate-pop">
                <div className="onboarding-header">
                    <div className="onboarding-spy-icon">ðŸ•µï¸</div>
                    <h2 className="onboarding-title">{lang === 'ar' ? 'Ù…Ø±Ø­Ø¨Ø§Ù‹ ÙÙŠ PRO SPY!' : 'Welcome to PRO SPY!'}</h2>
                    <p className="onboarding-subtitle">{lang === 'ar' ? 'Ø£ÙƒÙ…Ù„ Ù…Ù„ÙÙƒ Ø§Ù„Ø´Ø®ØµÙŠ Ù„Ù„Ø¨Ø¯Ø¡' : 'Complete your profile to start'}</p>
                </div>

                <div className="onboarding-body">
                    {/* Photo Upload */}
                    <div className="onboarding-photo-section">
                        <div className="onboarding-photo-wrapper" onClick={() => fileRef.current?.click()}>
                            <img
                                src={photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=7000ff&color=fff&size=300`}
                                alt="avatar"
                                className="onboarding-photo"
                            />
                            <div className="onboarding-photo-overlay">
                                <span className="onboarding-camera-icon">ðŸ“·</span>
                            </div>
                        </div>
                        <input type="file" ref={fileRef} style={{ display: 'none' }} accept="image/*" onChange={handlePhotoChange} />
                        <p className="onboarding-photo-hint">{lang === 'ar' ? 'Ø§Ø¶ØºØ· Ù„ØªØºÙŠÙŠØ± Ø§Ù„ØµÙˆØ±Ø©' : 'Tap to change photo'}</p>
                    </div>

                    {/* Name Input */}
                    <div className="onboarding-field">
                        <label className="onboarding-label">
                            {lang === 'ar' ? 'âœï¸ Ø§Ø³Ù…Ùƒ ÙÙŠ Ø§Ù„Ù„Ø¹Ø¨Ø©' : 'âœï¸ Your display name'}
                        </label>
                        <input
                            className="onboarding-input"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            placeholder={lang === 'ar' ? 'Ø£Ø¯Ø®Ù„ Ø§Ø³Ù…Ùƒ...' : 'Enter your name...'}
                            maxLength={10}
                        />
                    </div>

                    {/* Gender Selection */}
                    <div className="onboarding-field">
                        <label className="onboarding-label">
                            {lang === 'ar' ? 'ðŸ‘¤ Ø§Ù„Ø¬Ù†Ø³' : 'ðŸ‘¤ Gender'}
                        </label>
                        <div className="onboarding-gender-row">
                            <button
                                className={`onboarding-gender-btn ${gender === 'male' ? 'active' : ''}`}
                                onClick={() => setGender('male')}
                            >
                                <span style={{fontSize:'28px'}}>ðŸ‘¨</span>
                                <span>{lang === 'ar' ? 'Ø°ÙƒØ±' : 'Male'}</span>
                            </button>
                            <button
                                className={`onboarding-gender-btn ${gender === 'female' ? 'active' : ''}`}
                                onClick={() => setGender('female')}
                            >
                                <span style={{fontSize:'28px'}}>ðŸ‘©</span>
                                <span>{lang === 'ar' ? 'Ø£Ù†Ø«Ù‰' : 'Female'}</span>
                            </button>
                        </div>
                    </div>
                    {/* Country Selection */}
                    <div className="onboarding-field">
                        <label className="onboarding-label">
                            {lang === 'ar' ? 'ðŸŒ Ø¯ÙˆÙ„ØªÙƒ' : 'ðŸŒ Your Country'}
                            <span style={{ color: '#6b7280', fontWeight: 400, fontSize: '11px', marginRight: '4px', marginLeft: '4px' }}>
                                ({lang === 'ar' ? 'Ø§Ø®ØªÙŠØ§Ø±ÙŠ' : 'optional'})
                            </span>
                        </label>
                        {!showCountryPicker ? (
                            <button
                                className="onboarding-gender-btn"
                                style={{ width: '100%', justifyContent: 'center', gap: '8px', padding: '10px' }}
                                onClick={() => setShowCountryPicker(true)}
                            >
                                {country ? (
                                    <>
                                        <span style={{ fontSize: '24px' }}>{country.flag}</span>
                                        <span>{lang === 'ar' ? country.name_ar : country.name_en}</span>
                                    </>
                                ) : (
                                    <span style={{ color: '#6b7280' }}>{lang === 'ar' ? 'â€” Ø§Ø®ØªØ± Ø¯ÙˆÙ„ØªÙƒ â€”' : 'â€” Select your country â€”'}</span>
                                )}
                            </button>
                        ) : (
                            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <CountryPicker
                                    selected={country?.code}
                                    onSelect={(c) => { setCountry(c); setShowCountryPicker(false); }}
                                    lang={lang}
                                />
                                <button
                                    onClick={() => setShowCountryPicker(false)}
                                    style={{ marginTop: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '11px', width: '100%' }}
                                >
                                    {lang === 'ar' ? 'âœ• Ø¥ØºÙ„Ø§Ù‚' : 'âœ• Close'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="onboarding-footer">
                    <button
                        onClick={handleComplete}
                        disabled={!displayName.trim() || !gender}
                        className={`onboarding-submit-btn ${(!displayName.trim() || !gender) ? 'disabled' : ''}`}
                    >
                        {lang === 'ar' ? 'ðŸš€ Ø§Ø¨Ø¯Ø£ Ø§Ù„Ù„Ø¹Ø¨!' : 'ðŸš€ Start Playing!'}
                    </button>
                </div>
            </div>
        </div>
    );
};

var ailyTasksComponent = ({ userData, user, lang, onClaim, onNotification }) => {
    const [tick, setTick] = React.useState(0);
    React.useEffect(() => {
        const t = setInterval(() => setTick(p => p + 1), 30000);
        return () => clearInterval(t);
    }, []);

    const userTasks = userData?.dailyTasks || {};
    const sessionStart = userTasks.sessionStartTime?.toDate?.() || new Date();
    const minutesOnline = Math.floor((Date.now() - sessionStart.getTime()) / 60000);

    const claimedCount = DAILY_TASKS_CONFIG.filter(box => userTasks.boxes?.[box.id-1]?.status === 'claimed').length;
    const availableCount = DAILY_TASKS_CONFIG.filter(box => {
        if (userTasks.boxes?.[box.id-1]?.status === 'claimed') return false;
        if (box.comingSoon) {
            if (!hasVIPDailyTasks(userData)) return false;
            if (!box.duration) return true;
            return minutesOnline >= Math.ceil(box.duration/60000);
        }
        if (!box.duration) return false;
        return minutesOnline >= Math.ceil(box.duration/60000);
    }).length;

    const getTaskStatus = (box) => {
        const claimed = userTasks.boxes?.[box.id - 1]?.status === 'claimed';
        if (claimed) return 'claimed';
        if (box.comingSoon) {
            if (!hasVIPDailyTasks(userData)) return 'vip_locked';
            if (!box.duration) return 'available';
            if (minutesOnline >= Math.ceil(box.duration / 60000)) return 'available';
            return 'locked';
        }
        if (!box.duration) return 'locked';
        if (minutesOnline >= Math.ceil(box.duration / 60000)) return 'available';
        return 'locked';
    };

    const handleClaimTask = async (box) => {
        const status = getTaskStatus(box);
        if (status === 'claimed') { onNotification(lang==='ar'?'âœ… Ø§Ø³ØªÙ„Ù…Øª Ø¨Ø§Ù„ÙØ¹Ù„':'âœ… Already claimed'); return; }
        if (status === 'vip_locked') { onNotification(lang==='ar'?'ðŸ‘‘ Ø­ØµØ±ÙŠ Ù„Ù€ VIP':'ðŸ‘‘ VIP Exclusive'); return; }
        if (status === 'locked') {
            const requiredMin = Math.ceil(box.duration/60000);
            const remaining = requiredMin - minutesOnline;
            onNotification(lang==='ar'?`â³ Ø¨Ø¹Ø¯ ${remaining} Ø¯Ù‚ÙŠÙ‚Ø©`:`â³ In ${remaining} min`);
            return;
        }
        try {
            const updates = {};
            updates[`dailyTasks.boxes.${box.id-1}.status`] = 'claimed';
            updates[`dailyTasks.boxes.${box.id-1}.claimedAt`] = TS();
            if (box.reward.type === 'currency') updates['currency'] = firebase.firestore.FieldValue.increment(box.reward.amount);
            await usersCollection.doc(user.uid).update(updates);
            onNotification(`âœ… +${box.reward.amount} ðŸ§ `);
        } catch(err) { onNotification(lang==='ar'?'âŒ Ø®Ø·Ø£':'âŒ Error'); }
    };

    return (
        <div style={{ padding:'0' }}>
            {/* â”€â”€ Header row â”€â”€ */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'linear-gradient(135deg,rgba(0,242,255,0.2),rgba(112,0,255,0.15))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>ðŸ“¦</div>
                    <div>
                        <div style={{ fontSize:'13px', fontWeight:800, color:'#e2e8f0' }}>{lang==='ar'?'Ù…Ù‡Ø§Ù… Ø§Ù„ÙŠÙˆÙ…':'Daily Tasks'}</div>
                        <div style={{ fontSize:'10px', color:'#64748b', marginTop:'1px' }}>
                            {lang==='ar'?`${minutesOnline} Ø¯Ù‚ÙŠÙ‚Ø© Ø£ÙˆÙ† Ù„Ø§ÙŠÙ†`:`${minutesOnline} min online`}
                        </div>
                    </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    {availableCount > 0 && (
                        <div style={{ fontSize:'9px', fontWeight:800, background:'rgba(0,242,255,0.15)', border:'1px solid rgba(0,242,255,0.35)', color:'#00f2ff', borderRadius:'20px', padding:'2px 8px' }}>
                            {availableCount} {lang==='ar'?'Ù…ØªØ§Ø­':'ready'}
                        </div>
                    )}
                    <div style={{ fontSize:'10px', color:'#6b7280' }}>{claimedCount}/{DAILY_TASKS_CONFIG.length}</div>
                </div>
            </div>

            {/* â”€â”€ Progress bar total â”€â”€ */}
            <div style={{ height:'4px', background:'rgba(255,255,255,0.06)', borderRadius:'4px', marginBottom:'14px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${(claimedCount/DAILY_TASKS_CONFIG.length)*100}%`, background:'linear-gradient(90deg,#00f2ff,#7000ff)', transition:'width 0.6s ease' }} />
            </div>

            {/* â”€â”€ 8 Chest Boxes â”€â”€ */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px' }}>
                {DAILY_TASKS_CONFIG.map(box => {
                    const status = getTaskStatus(box);
                    const isAvailable = status === 'available';
                    const isClaimed   = status === 'claimed';
                    const isVipLocked = status === 'vip_locked';
                    const isLocked    = status === 'locked';
                    const isVip       = box.comingSoon;
                    const reqMin      = box.duration ? Math.ceil(box.duration/60000) : null;
                    const progress    = (isLocked && reqMin) ? Math.min(100, Math.floor((minutesOnline/reqMin)*100)) : 0;
                    const timeLabel   = reqMin ? (reqMin>=60?`${reqMin/60}h`:`${reqMin}m`) : '';

                    return (
                        <button
                            key={box.id}
                            onClick={() => handleClaimTask(box)}
                            style={{
                                position:'relative', padding:'10px 4px 8px', borderRadius:'12px',
                                border: isClaimed   ? '1.5px solid rgba(74,222,128,0.45)' :
                                        isAvailable ? '1.5px solid rgba(0,242,255,0.7)' :
                                        isVipLocked ? '1.5px solid rgba(239,68,68,0.35)' :
                                                      '1.5px solid rgba(255,255,255,0.07)',
                                background: isClaimed   ? 'linear-gradient(160deg,rgba(74,222,128,0.12),rgba(16,185,129,0.06))' :
                                            isAvailable ? 'linear-gradient(160deg,rgba(0,242,255,0.14),rgba(112,0,255,0.09))' :
                                            isVipLocked ? 'rgba(239,68,68,0.05)' :
                                                          'rgba(255,255,255,0.03)',
                                cursor: isAvailable ? 'pointer' : 'default',
                                textAlign:'center', overflow:'hidden', transition:'all 0.2s',
                                boxShadow: isAvailable ? '0 0 14px rgba(0,242,255,0.2)' :
                                           isClaimed   ? '0 0 8px rgba(74,222,128,0.1)' : 'none',
                            }}
                        >
                            {/* Chest Icon */}
                            <div style={{ fontSize:'22px', lineHeight:1, marginBottom:'5px' }}>
                                {isClaimed ? 'ðŸ“­' : isAvailable ? 'ðŸ“¬' : isVipLocked ? 'ðŸ”’' : 'ðŸ“ª'}
                            </div>

                            {/* Reward */}
                            <div style={{
                                fontSize:'9px', fontWeight:900, marginBottom:'2px',
                                color: isClaimed ? '#4ade80' : isAvailable ? '#00f2ff' : isVipLocked ? '#f87171' : '#4b5563'
                            }}>
                                {isClaimed ? 'âœ“' : isVipLocked ? 'VIP' : `+${box.reward.amount}`}
                            </div>

                            {/* Time / icon */}
                            <div style={{ fontSize:'8px', color: isClaimed?'#4ade8099':isAvailable?'#00f2ff88':'#374151' }}>
                                {isClaimed ? box.reward.icon : isVipLocked ? 'ðŸ‘‘' : timeLabel || box.reward.icon}
                            </div>

                            {/* Available badge â€” pulsing dot */}
                            {isAvailable && (
                                <div style={{
                                    position:'absolute', top:'5px', right:'5px',
                                    width:'9px', height:'9px', borderRadius:'50%',
                                    background:'#00f2ff',
                                    boxShadow:'0 0 6px #00f2ff',
                                    animation:'dtPulse 1.4s ease-in-out infinite'
                                }} />
                            )}

                            {/* Progress bar */}
                            {isLocked && !isVip && progress > 0 && (
                                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'3px', background:'rgba(255,255,255,0.06)' }}>
                                    <div style={{ height:'100%', width:`${progress}%`, background:'linear-gradient(90deg,#7000ff,#00f2ff)', transition:'width 0.5s' }} />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <style>{`
                @keyframes dtPulse {
                    0%,100% { opacity:1; transform:scale(1); }
                    50%      { opacity:0.6; transform:scale(1.3); }
                }
            `}</style>
        </div>
    );
};

// LoginRewardsComponent removed â€” Ø§Ø³ØªØ®Ø¯Ù… LoginRewards ÙÙŠ 14-modals-misc.js

// AchievementsDisplayComponent removed - use AchievementsDisplayV11 instead

// ðŸŽ® MAIN APP COMPONENT

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ‘¨â€ðŸ‘©â€ðŸ‘§ GROUPS SECTION â€” Group Chat System
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// groupsCollection â€” defined in 01-config.js

// â”€â”€ Group Level System â”€â”€
var ROUP_LEVEL_CONFIG = [
    { level:1,  xp:0,    icon:'ðŸŒ±', name_en:'Seed',    name_ar:'Ø¨Ø°Ø±Ø©',   color:'#4ade80' },
    { level:2,  xp:50,   icon:'ðŸŒ¿', name_en:'Sprout',  name_ar:'Ù†Ø¨ØªØ©',   color:'#22d3ee' },
    { level:3,  xp:150,  icon:'ðŸŒ³', name_en:'Tree',    name_ar:'Ø´Ø¬Ø±Ø©',   color:'#34d399' },
    { level:4,  xp:300,  icon:'â­', name_en:'Star',    name_ar:'Ù†Ø¬Ù…Ø©',   color:'#fbbf24' },
    { level:5,  xp:500,  icon:'ðŸ’Ž', name_en:'Diamond', name_ar:'Ù…Ø§Ø³Ø©',   color:'#60a5fa' },
    { level:6,  xp:800,  icon:'ðŸ‘‘', name_en:'Crown',   name_ar:'ØªØ§Ø¬',    color:'#ffd700' },
    { level:7,  xp:1200, icon:'ðŸ”¥', name_en:'Flame',   name_ar:'Ù„Ù‡Ø¨',    color:'#f97316' },
    { level:8,  xp:2000, icon:'âš¡', name_en:'Thunder', name_ar:'Ø±Ø¹Ø¯',    color:'#a78bfa' },
    { level:9,  xp:3500, icon:'ðŸŒŒ', name_en:'Galaxy',  name_ar:'Ù…Ø¬Ø±Ø©',   color:'#818cf8' },
    { level:10, xp:5000, icon:'ðŸ†', name_en:'Legend',  name_ar:'Ø£Ø³Ø·ÙˆØ±Ø©', color:'#00d4ff' },
];
var etGroupLevel = (xp = 0) => {
    let cfg = GROUP_LEVEL_CONFIG[0];
    for (let i = GROUP_LEVEL_CONFIG.length - 1; i >= 0; i--) {
        if (xp >= GROUP_LEVEL_CONFIG[i].xp) { cfg = GROUP_LEVEL_CONFIG[i]; break; }
    }
    return cfg;
};
var roupsSection = ({ currentUser, currentUserData, currentUID, friendsData, lang, onNotification, isLoggedIn, onOpenProfile }) => {
    const [groups, setGroups] = React.useState([]);
    const [activeGroup, setActiveGroup] = React.useState(null);
    const [messages, setMessages] = React.useState([]);
    const [msgText, setMsgText] = React.useState('');
    const [showCreate, setShowCreate] = React.useState(false);
    const [showInvite, setShowInvite] = React.useState(false);
    const [groupName, setGroupName] = React.useState('');
    const [creating, setCreating] = React.useState(false);
    const [loadingGroups, setLoadingGroups] = React.useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
    const [uploadingImg, setUploadingImg] = React.useState(false);
    const [showDetails, setShowDetails] = React.useState(false);
    const [membersData, setMembersData] = React.useState([]);
    const [loadingMembers, setLoadingMembers] = React.useState(false);
    // â”€â”€ NEW: settings sub-panels â”€â”€
    const [settingsView, setSettingsView] = React.useState('main'); // 'main' | 'manage' | 'members'
    const [groupNotice, setGroupNotice] = React.useState('');
    const [editingNotice, setEditingNotice] = React.useState(false);
    const [groupMuted, setGroupMuted] = React.useState(false);
    const [showReportGroup, setShowReportGroup] = React.useState(false);
    const [reportGroupReason, setReportGroupReason] = React.useState('');
    const [sendingGroupReport, setSendingGroupReport] = React.useState(false);
    const [groupInviteType, setGroupInviteType] = React.useState('open'); // 'open' | 'approval' | 'closed'
    const [groupIsPublic, setGroupIsPublic] = React.useState(true);
    const [transferToId, setTransferToId] = React.useState('');
    const [showTransferConfirm, setShowTransferConfirm] = React.useState(false);
    const [sendingRedPacket, setSendingRedPacket] = React.useState(false);
    const [showRedPacketModal, setShowRedPacketModal] = React.useState(false);
    // â”€â”€ Mini Profile in group chat â”€â”€
    const [groupMiniProfile, setGroupMiniProfile] = React.useState(null);
    const messagesEndRef = React.useRef(null);
    const chatInputRef = React.useRef(null);
    const fileInputRef = React.useRef(null);
    const groupImgInputRef = React.useRef(null);

    // âœ… No orderBy â†’ no index needed, sort client-side
    React.useEffect(() => {
        if (!currentUID || !isLoggedIn) { setLoadingGroups(false); return; }
        const unsub = groupsCollection
            .where('members', 'array-contains', currentUID)
            .onSnapshot(snap => {
                const gs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // Sort by lastMessageAtMs (number) then lastMessageAt (timestamp) fallback
                gs.sort((a, b) => {
                    const aT = a.lastMessageAtMs || a.lastMessageAt?.toMillis?.() || a.lastMessageAt?.seconds * 1000 || 0;
                    const bT = b.lastMessageAtMs || b.lastMessageAt?.toMillis?.() || b.lastMessageAt?.seconds * 1000 || 0;
                    return bT - aT;
                });
                setGroups(gs);
                setLoadingGroups(false);
            }, (err) => { console.error('Groups error:', err); setLoadingGroups(false); });
        return () => unsub();
    }, [currentUID]);

    React.useEffect(() => {
        if (!activeGroup) return;
        const unsub = groupsCollection.doc(activeGroup.id).collection('messages')
            .orderBy('createdAt', 'asc').limitToLast(100)
            .onSnapshot(snap => {
                setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            });
        groupsCollection.doc(activeGroup.id).update({
            [`readBy.${currentUID}`]: TS()
        }).catch(() => {});
        return () => unsub();
    }, [activeGroup?.id]);

    const createGroup = async () => {
        if (!groupName.trim() || !currentUID || creating) return;
        if (groupName.trim().length > 7) {
            onNotification(lang === 'ar' ? 'âŒ Ø§Ø³Ù… Ø§Ù„Ø¬Ø±ÙˆØ¨ 7 Ø£Ø­Ø±Ù ÙƒØ­Ø¯ Ø£Ù‚ØµÙ‰' : 'âŒ Group name max 7 chars');
            return;
        }
        // â”€â”€ Check group limit â”€â”€
        const isVIP = currentUserData?.vip?.isActive;
        const maxGroups = isVIP ? 3 : 2;
        const myOwnedGroups = groups.filter(g => g.createdBy === currentUID);
        if (myOwnedGroups.length >= maxGroups) {
            onNotification(lang === 'ar'
                ? `âŒ ÙˆØµÙ„Øª Ù„Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ (${maxGroups} Ø¬Ø±ÙˆØ¨Ø§Øª)${!isVIP ? ' Â· VIP ÙŠØ­ØµÙ„ Ø¹Ù„Ù‰ 3' : ''}`
                : `âŒ Max groups reached (${maxGroups})${!isVIP ? ' Â· VIP gets 3' : ''}`
            );
            return;
        }
        setCreating(true);
        try {
            const nowMs = Date.now();
            await groupsCollection.add({
                name: groupName.trim().slice(0, 7),
                createdBy: currentUID,
                creatorName: currentUserData?.displayName || 'User',
                members: [currentUID],
                admins: [currentUID],
                lastMessage: lang === 'ar' ? 'ðŸŽ‰ ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø¬Ø±ÙˆØ¨' : 'ðŸŽ‰ Group created',
                lastMessageAt: TS(),
                lastMessageAtMs: nowMs,
                createdAt: TS(),
                readBy: { [currentUID]: TS() },
                xp: 0,
                level: 1,
            });
            setGroupName(''); setShowCreate(false);
            onNotification(lang === 'ar' ? 'âœ… ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø¬Ø±ÙˆØ¨!' : 'âœ… Group created!');
        } catch (e) {
            console.error('createGroup error:', e);
            onNotification(lang === 'ar' ? 'âŒ Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡' : 'âŒ Error creating group');
        }
        setCreating(false);
    };

    const inviteFriend = async (friendId) => {
        if (!activeGroup) return;
        if (activeGroup.members?.includes(friendId)) {
            onNotification(lang === 'ar' ? 'Ù‡Ø°Ø§ Ø§Ù„Ø´Ø®Øµ Ù…ÙˆØ¬ÙˆØ¯ Ø¨Ø§Ù„ÙØ¹Ù„' : 'Already a member'); return;
        }
        try {
            await groupsCollection.doc(activeGroup.id).update({
                members: firebase.firestore.FieldValue.arrayUnion(friendId)
            });
            const friend = friendsData.find(f => f.id === friendId);
            await groupsCollection.doc(activeGroup.id).collection('messages').add({
                text: lang === 'ar' ? `ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© ${friend?.displayName || 'Ø¹Ø¶Ùˆ'}` : `${friend?.displayName || 'Member'} was added`,
                senderId: 'system', senderName: 'System',
                createdAt: TS(), type: 'system'
            });
            onNotification(lang === 'ar' ? 'âœ… ØªÙ…Øª Ø§Ù„Ø¯Ø¹ÙˆØ©!' : 'âœ… Invited!');
            setShowInvite(false);
            setActiveGroup(g => ({ ...g, members: [...(g.members || []), friendId] }));
        } catch (e) { onNotification(lang === 'ar' ? 'âŒ Ø®Ø·Ø£' : 'âŒ Error'); }
    };

    const sendMessage = async () => {
        if (!msgText.trim() || !activeGroup || !currentUID) return;
        const text = msgText.trim();
        setMsgText('');
        try {
            const nowMs = Date.now();
            const senderVipLevel = (typeof getVIPLevel === 'function' ? (getVIPLevel(currentUserData) || 0) : 0);
            const senderTitle = currentUserData?.activeTitle || currentUserData?.title || null;
            const senderFrame = currentUserData?.equipped?.frames || null;
            const senderBadges = (currentUserData?.equipped?.badges || []).slice(0, 3);
            await groupsCollection.doc(activeGroup.id).collection('messages').add({
                text, senderId: currentUID,
                senderName: currentUserData?.displayName || 'User',
                senderPhoto: currentUserData?.photoURL || null,
                senderVipLevel,
                senderTitle,
                senderFrame,
                senderBadges,
                createdAt: TS(), type: 'text'
            });
            // â”€â”€ XP + level update â”€â”€
            const newXP = (activeGroup.xp || 0) + 1;
            const newLevel = getGroupLevel(newXP);
            await groupsCollection.doc(activeGroup.id).update({
                lastMessage: text, lastSenderId: currentUID,
                lastSenderName: currentUserData?.displayName || 'User',
                lastMessageAt: TS(),
                lastMessageAtMs: nowMs,
                xp: firebase.firestore.FieldValue.increment(1),
                level: newLevel.level,
                [`readBy.${currentUID}`]: TS()
            });
            setActiveGroup(g => ({ ...g, xp: newXP, level: newLevel.level }));
        } catch (e) { console.error('sendMessage error:', e); }
    };

    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/') || !activeGroup || !currentUID) return;
        setUploadingImg(true);
        try {
            const base64 = await compressImageToBase64(file);
            const nowMs = Date.now();
            await groupsCollection.doc(activeGroup.id).collection('messages').add({
                text: 'ðŸ“·', senderId: currentUID,
                senderName: currentUserData?.displayName || 'User',
                senderPhoto: currentUserData?.photoURL || null,
                type: 'image', imageData: base64,
                createdAt: TS()
            });
            await groupsCollection.doc(activeGroup.id).update({
                lastMessage: 'ðŸ“· Photo', lastSenderId: currentUID,
                lastMessageAt: TS(),
                lastMessageAtMs: nowMs,
                [`readBy.${currentUID}`]: TS()
            });
        } catch (e) { console.error('Image upload error:', e); }
        setUploadingImg(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleGroupPhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/') || !activeGroup || !currentUID) return;
        try {
            const base64 = await compressImageToBase64(file);
            await groupsCollection.doc(activeGroup.id).update({ photoURL: base64 });
            setActiveGroup(g => ({ ...g, photoURL: base64 }));
            onNotification(lang === 'ar' ? 'âœ… ØªÙ… ØªØºÙŠÙŠØ± ØµÙˆØ±Ø© Ø§Ù„Ø¬Ø±ÙˆØ¨' : 'âœ… Group photo updated');
        } catch (e) { console.error('Group photo error:', e); }
        if (groupImgInputRef.current) groupImgInputRef.current.value = '';
    };

    const makeAdmin = async (memberId) => {
        if (!activeGroup || !currentUID) return;
        try {
            await groupsCollection.doc(activeGroup.id).update({
                admins: firebase.firestore.FieldValue.arrayUnion(memberId)
            });
            setActiveGroup(g => ({ ...g, admins: [...(g.admins || []), memberId] }));
            onNotification(lang === 'ar' ? 'âœ… ØªÙ… ØªØ±Ù‚ÙŠØ© Ø§Ù„Ø¹Ø¶Ùˆ Ù„Ø£Ø¯Ù…Ù†' : 'âœ… Member promoted to admin');
        } catch (e) { onNotification(lang === 'ar' ? 'âŒ Ø®Ø·Ø£' : 'âŒ Error'); }
    };

    const removeAdmin = async (memberId) => {
        if (!activeGroup || !currentUID) return;
        try {
            await groupsCollection.doc(activeGroup.id).update({
                admins: firebase.firestore.FieldValue.arrayRemove(memberId)
            });
            setActiveGroup(g => ({ ...g, admins: (g.admins || []).filter(id => id !== memberId) }));
            onNotification(lang === 'ar' ? 'âœ… ØªÙ… Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ø£Ø¯Ù…Ù†' : 'âœ… Admin removed');
        } catch (e) { onNotification(lang === 'ar' ? 'âŒ Ø®Ø·Ø£' : 'âŒ Error'); }
    };

    const kickMember = async (memberId) => {
        if (!activeGroup || !currentUID) return;
        if (memberId === activeGroup.createdBy) { onNotification(lang==='ar'?'âŒ Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø·Ø±Ø¯ Ø§Ù„Ø£ÙˆÙ†Ø±':'âŒ Cannot kick owner'); return; }
        try {
            await groupsCollection.doc(activeGroup.id).update({
                members: firebase.firestore.FieldValue.arrayRemove(memberId),
                admins: firebase.firestore.FieldValue.arrayRemove(memberId),
            });
            const member = membersData.find(m => m.id === memberId);
            await groupsCollection.doc(activeGroup.id).collection('messages').add({
                text: lang==='ar' ? `ØªÙ… Ø·Ø±Ø¯ ${member?.displayName||'Ø¹Ø¶Ùˆ'}` : `${member?.displayName||'Member'} was removed`,
                senderId:'system', senderName:'System', type:'system',
                createdAt: TS()
            });
            setActiveGroup(g => ({ ...g, members: (g.members||[]).filter(id=>id!==memberId), admins: (g.admins||[]).filter(id=>id!==memberId) }));
            setMembersData(d => d.filter(m=>m.id!==memberId));
            onNotification(lang==='ar'?'âœ… ØªÙ… Ø·Ø±Ø¯ Ø§Ù„Ø¹Ø¶Ùˆ':'âœ… Member removed');
        } catch(e) { onNotification(lang==='ar'?'âŒ Ø®Ø·Ø£':'âŒ Error'); }
    };

    const saveGroupNotice = async () => {
        if (!activeGroup) return;
        try {
            await groupsCollection.doc(activeGroup.id).update({ notice: groupNotice });
            setActiveGroup(g => ({ ...g, notice: groupNotice }));
            setEditingNotice(false);
            onNotification(lang==='ar'?'âœ… ØªÙ… Ø­ÙØ¸ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†':'âœ… Notice saved');
        } catch(e) { onNotification(lang==='ar'?'âŒ Ø®Ø·Ø£':'âŒ Error'); }
    };

    const saveGroupManageSettings = async (updates) => {
        if (!activeGroup) return;
        try {
            await groupsCollection.doc(activeGroup.id).update(updates);
            setActiveGroup(g => ({ ...g, ...updates }));
            onNotification(lang==='ar'?'âœ… ØªÙ… Ø§Ù„Ø­ÙØ¸':'âœ… Saved');
        } catch(e) { onNotification(lang==='ar'?'âŒ Ø®Ø·Ø£':'âŒ Error'); }
    };

    const handleTransferOwnership = async () => {
        if (!activeGroup || !transferToId.trim()) return;
        const target = membersData.find(m => m.id === transferToId.trim() || (m.customId && m.customId === transferToId.trim()));
        if (!target) { onNotification(lang==='ar'?'âŒ Ø§Ù„Ø¹Ø¶Ùˆ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯ ÙÙŠ Ø§Ù„Ø¬Ø±ÙˆØ¨':'âŒ Member not found'); return; }
        try {
            await groupsCollection.doc(activeGroup.id).update({
                createdBy: target.id,
                admins: firebase.firestore.FieldValue.arrayUnion(target.id),
            });
            await groupsCollection.doc(activeGroup.id).collection('messages').add({
                text: lang==='ar'?`ØªÙ… Ù†Ù‚Ù„ Ø§Ù„Ù…Ù„ÙƒÙŠØ© Ø¥Ù„Ù‰ ${target.displayName}`:`Ownership transferred to ${target.displayName}`,
                senderId:'system', senderName:'System', type:'system',
                createdAt: TS()
            });
            setActiveGroup(g => ({ ...g, createdBy: target.id, admins: [...(g.admins||[]), target.id] }));
            setShowTransferConfirm(false); setTransferToId('');
            onNotification(lang==='ar'?'âœ… ØªÙ… Ù†Ù‚Ù„ Ø§Ù„Ù…Ù„ÙƒÙŠØ©':'âœ… Ownership transferred');
        } catch(e) { onNotification(lang==='ar'?'âŒ Ø®Ø·Ø£':'âŒ Error'); }
    };

    const handleLeaveGroup = async () => {
        if (!activeGroup || !currentUID) return;
        const isOwner = activeGroup.createdBy === currentUID;
        if (isOwner && (activeGroup.members||[]).length > 1) {
            onNotification(lang==='ar'?'âŒ Ø§Ù†Ù‚Ù„ Ø§Ù„Ù…Ù„ÙƒÙŠØ© Ø£ÙˆÙ„Ø§Ù‹ Ù‚Ø¨Ù„ Ø§Ù„Ù…ØºØ§Ø¯Ø±Ø©':'âŒ Transfer ownership before leaving');
            return;
        }
        try {
            if (isOwner && (activeGroup.members||[]).length <= 1) {
                // Delete group if owner and only member
                await groupsCollection.doc(activeGroup.id).delete();
            } else {
                await groupsCollection.doc(activeGroup.id).update({
                    members: firebase.firestore.FieldValue.arrayRemove(currentUID),
                    admins: firebase.firestore.FieldValue.arrayRemove(currentUID),
                });
                await groupsCollection.doc(activeGroup.id).collection('messages').add({
                    text: lang==='ar'?`${currentUserData?.displayName||'Ø¹Ø¶Ùˆ'} ØºØ§Ø¯Ø± Ø§Ù„Ø¬Ø±ÙˆØ¨`:`${currentUserData?.displayName||'Member'} left the group`,
                    senderId:'system', senderName:'System', type:'system',
                    createdAt: TS()
                });
            }
            setActiveGroup(null); setShowDetails(false);
            onNotification(lang==='ar'?'âœ… ØºØ§Ø¯Ø±Øª Ø§Ù„Ø¬Ø±ÙˆØ¨':'âœ… Left the group');
        } catch(e) { onNotification(lang==='ar'?'âŒ Ø®Ø·Ø£':'âŒ Error'); }
    };

    const handleDeleteGroup = async () => {
        if (!activeGroup || activeGroup.createdBy !== currentUID) return;
        try {
            await groupsCollection.doc(activeGroup.id).delete();
            setActiveGroup(null); setShowDetails(false);
            onNotification(lang==='ar'?'âœ… ØªÙ… Ø­Ø°Ù Ø§Ù„Ø¬Ø±ÙˆØ¨':'âœ… Group deleted');
        } catch(e) { onNotification(lang==='ar'?'âŒ Ø®Ø·Ø£':'âŒ Error'); }
    };

    const handleSubmitGroupReport = async () => {
        if (!reportGroupReason.trim() || !activeGroup) return;
        setSendingGroupReport(true);
        try {
            await reportsCollection.add({
                type: 'group', groupId: activeGroup.id, groupName: activeGroup.name,
                reporterId: currentUID, reporterName: currentUserData?.displayName || 'User',
                reason: reportGroupReason.trim(),
                createdAt: TS(), status: 'pending'
            });
            setShowReportGroup(false); setReportGroupReason('');
            onNotification(lang==='ar'?'âœ… ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø¨Ù„Ø§Øº':'âœ… Report submitted');
        } catch(e) { onNotification(lang==='ar'?'âŒ Ø®Ø·Ø£':'âŒ Error'); }
        setSendingGroupReport(false);
    };

    const sendGroupRedPacket = async (rpConfig) => {
        if (!activeGroup || !currentUID || !currentUserData) return;
        const balance = currentUserData.currency || 0;
        if (balance < rpConfig.amount) { onNotification(lang==='ar'?'âŒ Ø±ØµÙŠØ¯ ØºÙŠØ± ÙƒØ§ÙÙ':'âŒ Insufficient balance'); return; }
        setSendingRedPacket(true);
        try {
            const rpRef = await redPacketsCollection.add({
                configId: rpConfig.id, amount: rpConfig.amount,
                senderId: currentUID, senderName: currentUserData.displayName || 'User',
                senderPhoto: currentUserData.photoURL || null,
                targetType: 'group', targetId: activeGroup.id, targetName: activeGroup.name,
                claimedBy: [], maxClaims: rpConfig.maxClaims,
                remaining: rpConfig.amount,
                createdAt: TS(),
                status: 'active',
            });
            await usersCollection.doc(currentUID).update({ currency: firebase.firestore.FieldValue.increment(-rpConfig.amount) });
            await groupsCollection.doc(activeGroup.id).collection('messages').add({
                type: 'red_packet', rpId: rpRef.id,
                rpAmount: rpConfig.amount, rpConfigId: rpConfig.id,
                senderId: currentUID, senderName: currentUserData.displayName || 'User',
                senderPhoto: currentUserData.photoURL || null,
                text: lang==='ar'?`ðŸ§§ Ù…ØºÙ„Ù Ø£Ø­Ù…Ø± ${rpConfig.amount} Ù…Ù† ${currentUserData.displayName}`:`ðŸ§§ Red Packet ${rpConfig.amount} from ${currentUserData.displayName}`,
                createdAt: TS(),
                maxClaims: rpConfig.maxClaims,
            });
            // Site-wide announcement in public chat
            await publicChatCollection.add({
                type: 'red_packet_announce',
                senderId: currentUID, senderName: currentUserData.displayName || 'User',
                senderPhoto: currentUserData.photoURL || null,
                amount: rpConfig.amount, targetType: 'group', targetName: activeGroup.name,
                text: lang==='ar'
                    ? `ðŸ§§ ${currentUserData.displayName} Ø£Ø±Ø³Ù„ Ù…ØºÙ„Ù ${rpConfig.amount} ÙÙŠ Ø¬Ø±ÙˆØ¨ ${activeGroup.name}`
                    : `ðŸ§§ ${currentUserData.displayName} sent a ${rpConfig.amount} packet in group ${activeGroup.name}`,
                createdAt: TS(),
            });
            setShowRedPacketModal(false);
            onNotification(lang==='ar'?'âœ… ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ù…ØºÙ„Ù!':'âœ… Red Packet sent!');
        } catch(e) { onNotification(lang==='ar'?'âŒ Ø®Ø·Ø£':'âŒ Error'); }
        setSendingRedPacket(false);
    };

    const claimRedPacket = async (rpId) => {
        if (!rpId || !currentUID) return;
        try {
            const rpDoc = await redPacketsCollection.doc(rpId).get();
            if (!rpDoc.exists) { onNotification(lang==='ar'?'âŒ Ø§Ù„Ù…ØºÙ„Ù ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯':'âŒ Packet not found'); return; }
            const rp = rpDoc.data();
            // âœ… Fix 2: ÙÙŠ Ø§Ù„Ø¬Ø±ÙˆØ¨ØŒ Ø§Ù„Ù…Ø±Ø³Ù„ ÙŠØ£Ø®Ø° Ù†Ø³Ø¨Ø© ÙÙ‚Ø· Ù…Ø«Ù„ Ø£ÙŠ Ø´Ø®Øµ Ø¢Ø®Ø± (Ù„Ø§ ÙŠØ­Ù‚ Ù„Ù‡ Ø£Ø®Ø° Ø§Ù„ÙƒÙ„)
            if (rp.claimedBy?.includes(currentUID)) { onNotification(lang==='ar'?'âŒ Ø§Ø³ØªÙ„Ù…ØªÙ‡ Ù…Ù† Ù‚Ø¨Ù„':'âŒ Already claimed'); return; }
            if (rp.claimedBy?.length >= rp.maxClaims) { onNotification(lang==='ar'?'âŒ Ø§Ù„Ù…ØºÙ„Ù Ù†ÙØ¯':'âŒ Packet exhausted'); return; }
            if (rp.status !== 'active') { onNotification(lang==='ar'?'âŒ Ø§Ù„Ù…ØºÙ„Ù Ù…Ù†ØªÙ‡ÙŠ':'âŒ Packet expired'); return; }
            const perClaim = Math.floor(rp.amount / rp.maxClaims);
            const randomBonus = Math.floor(Math.random() * Math.floor(perClaim * 0.5));
            const claim = Math.min(perClaim + randomBonus, rp.remaining || rp.amount);
            await redPacketsCollection.doc(rpId).update({
                claimedBy: firebase.firestore.FieldValue.arrayUnion(currentUID),
                remaining: firebase.firestore.FieldValue.increment(-claim),
                status: (rp.claimedBy?.length + 1 >= rp.maxClaims) ? 'exhausted' : 'active',
            });
            await usersCollection.doc(currentUID).update({ currency: firebase.firestore.FieldValue.increment(claim) });
            // System message about who claimed
            if (activeGroup) {
                await groupsCollection.doc(activeGroup.id).collection('messages').add({
                    type: 'system',
                    text: lang==='ar'
                        ? `ðŸŽ‰ ${currentUserData?.displayName||'Ù…Ø³ØªØ®Ø¯Ù…'} Ø§Ø³ØªÙ„Ù… ${claim} Ù…Ù† Ù…ØºÙ„Ù ${rp.senderName}`
                        : `ðŸŽ‰ ${currentUserData?.displayName||'User'} claimed ${claim} from ${rp.senderName}'s packet`,
                    senderId: 'system', senderName: 'System',
                    createdAt: TS(),
                });
            }
            onNotification(lang==='ar'?`ðŸŽ‰ Ø§Ø³ØªÙ„Ù…Øª ${claim} Intel!`:`ðŸŽ‰ You got ${claim} Intel!`);
        } catch(e) { onNotification(lang==='ar'?'âŒ Ø®Ø·Ø£':'âŒ Error'); }
    };

    // openGroupMiniProfile â†’ now opens a mini profile popup instead of the full profile
    const openGroupMiniProfile = async (uid, basicData) => {
        if (!uid) return;
        setGroupMiniProfile({ uid, name: basicData?.name || '...', photo: basicData?.photo || null, loading: true });
        const data = await fetchMiniProfileData(uid);
        if (data) setGroupMiniProfile(data);
        else { setGroupMiniProfile(null); if (onOpenProfile) onOpenProfile(uid); }
    };
    React.useEffect(() => {
        if (!showDetails || !activeGroup) return;
        setLoadingMembers(true);
        const memberIds = activeGroup.members || [];
        if (memberIds.length === 0) { setMembersData([]); setLoadingMembers(false); return; }
        Promise.all(memberIds.map(id =>
            usersCollection.doc(id).get().then(d => d.exists ? { id, ...d.data() } : { id, displayName: 'Unknown' })
                .catch(() => ({ id, displayName: 'Unknown' }))
        )).then(ms => { setMembersData(ms); setLoadingMembers(false); });
    }, [showDetails, activeGroup?.id]);

    const hasUnread = (group) => {
        const readAt = group.readBy?.[currentUID];
        if (!readAt || !group.lastMessageAt) return false;
        const readTime = readAt.toDate ? readAt.toDate() : new Date(readAt);
        const lastTime = group.lastMessageAt.toDate ? group.lastMessageAt.toDate() : new Date(group.lastMessageAt);
        return lastTime > readTime && group.lastSenderId !== currentUID;
    };

    const fmtTime = (ts) => {
        if (!ts) return '';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleTimeString(lang==='ar'?'ar-EG':'en-US',{hour:'2-digit',minute:'2-digit'});
    };

    if (!isLoggedIn) return (
        <div style={{padding:'32px 16px',textAlign:'center',color:'#6b7280'}}>
            <div style={{fontSize:'32px',marginBottom:'10px'}}>ðŸ”</div>
            <div style={{fontSize:'12px'}}>{lang==='ar'?'Ø³Ø¬Ù‘Ù„ Ø¯Ø®ÙˆÙ„ Ù„Ù„ÙˆØµÙˆÙ„ Ù„Ù„Ø¬Ø±ÙˆØ¨Ø§Øª':'Login to access groups'}</div>
        </div>
    );

    /* â”€â”€ CHAT VIEW â€” as portal overlay so it doesn't affect parent layout â”€â”€ */
    if (activeGroup) {
        const isOwner = activeGroup.createdBy === currentUID;
        const isAdm = activeGroup.admins?.includes(currentUID);
        const grpLvl = getGroupLevel(activeGroup.xp || 0);
        return (
            <React.Fragment>
            <PortalModal>
                {/* hidden inputs */}
                <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImageSelect} />
                <input ref={groupImgInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleGroupPhotoUpload} />

                <div style={{
                    position:'fixed', inset:0, zIndex:Z.MODAL_HIGH,
                    background:'rgba(0,0,0,0.7)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    padding:'4px',
                }} onClick={() => setActiveGroup(null)}>
                    <div style={{
                        display:'flex', flexDirection:'column',
                        width:'100%', maxWidth:'min(440px, calc(100vw - 8px))',
                        height:'min(94vh,700px)', minHeight:'400px',
                        background:'linear-gradient(160deg,rgba(5,5,18,0.99),rgba(9,8,26,0.99))',
                        border:'1px solid rgba(255,255,255,0.09)',
                        borderRadius:'16px', overflow:'hidden',
                        boxShadow:'0 28px 70px rgba(0,0,0,0.9)',
                        position:'relative', boxSizing:'border-box',
                    }} onClick={e => e.stopPropagation()}>
                        {/* â”€â”€ HEADER â”€â”€ */}
                        <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'11px 14px',background:'rgba(7,7,22,1)',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0}}>
                            <button onClick={()=>setActiveGroup(null)} style={{background:'none',border:'none',color:'#00f2ff',fontSize:'20px',cursor:'pointer',padding:'0 4px',lineHeight:1}}>â€¹</button>
                            <div
                                onClick={()=>setShowDetails(true)}
                                style={{width:'38px',height:'38px',borderRadius:'50%',background:'linear-gradient(135deg,rgba(167,139,250,0.3),rgba(112,0,255,0.2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',flexShrink:0,overflow:'hidden',cursor:'pointer'}}
                            >
                                {activeGroup.photoURL
                                    ? <img src={activeGroup.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                                    : 'ðŸ‘¨â€ðŸ‘©â€ðŸ‘§'}
                            </div>
                            <div style={{flex:1,minWidth:0,cursor:'pointer'}} onClick={()=>setShowDetails(true)}>
                                <div style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{activeGroup.name}</div>
                                <div style={{fontSize:'10px',color:'#6b7280',display:'flex',alignItems:'center',gap:'6px'}}>
                                    <span>{activeGroup.members?.length||1} {lang==='ar'?'Ø¹Ø¶Ùˆ':'members'}</span>
                                    <span style={{color:grpLvl.color,fontWeight:700}}>{grpLvl.icon} Lv.{grpLvl.level}</span>
                                </div>
                            </div>
                            {isAdm && <button onClick={()=>setShowDetails(true)} style={{background:'rgba(167,139,250,0.15)',border:'1px solid rgba(167,139,250,0.3)',borderRadius:'8px',width:'32px',height:'32px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'16px',color:'#a78bfa',flexShrink:0}} title={lang==='ar'?'Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø¬Ø±ÙˆØ¨':'Group Settings'}>âš™ï¸</button>}
                        </div>

                        {/* â”€â”€ INVITE OVERLAY â”€â”€ */}
                        {showInvite && (
                            <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(5,5,20,0.97)',zIndex:50,display:'flex',flexDirection:'column',padding:'16px'}}>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                                    <div style={{fontSize:'14px',fontWeight:800,color:'#a78bfa'}}>ðŸ‘¥ {lang==='ar'?'Ø¯Ø¹ÙˆØ© ØµØ¯ÙŠÙ‚':'Invite Friend'}</div>
                                    <button onClick={()=>setShowInvite(false)} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'20px',cursor:'pointer'}}>âœ•</button>
                                </div>
                                <div style={{overflowY:'auto',flex:1}}>
                                    {friendsData.filter(f=>!(activeGroup.members||[]).includes(f.id)).length===0
                                        ? <div style={{textAlign:'center',padding:'20px',color:'#6b7280',fontSize:'12px'}}>{lang==='ar'?'Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø£ØµØ¯Ù‚Ø§Ø¡ Ù„Ø¯Ø¹ÙˆØªÙ‡Ù…':'No friends to invite'}</div>
                                        : friendsData.filter(f=>!(activeGroup.members||[]).includes(f.id)).map(friend=>(
                                            <div key={friend.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                                                <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',overflow:'hidden',flexShrink:0}}>
                                                    {friend.photoURL?<img src={friend.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>ðŸ˜Ž</div>}
                                                </div>
                                                <div style={{flex:1,fontSize:'13px',color:'#e2e8f0',fontWeight:600}}>{friend.displayName}</div>
                                                <button onClick={()=>inviteFriend(friend.id)} style={{background:'rgba(167,139,250,0.2)',border:'1px solid rgba(167,139,250,0.4)',borderRadius:'8px',padding:'5px 12px',color:'#a78bfa',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>+ {lang==='ar'?'Ø£Ø¶Ù':'Add'}</button>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )}

                        {/* â”€â”€ GROUP SETTINGS PANEL (Full) â”€â”€ */}
                        {showDetails && (
                            <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(5,5,20,0.99)',zIndex:50,display:'flex',flexDirection:'column',overflow:'hidden'}}>
                                {/* Header */}
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0,background:'rgba(7,7,22,1)'}}>
                                    {settingsView !== 'main' ? (
                                        <button onClick={()=>setSettingsView('main')} style={{background:'none',border:'none',color:'#00f2ff',fontSize:'14px',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',fontWeight:700}}>
                                            â€¹ {lang==='ar'?'Ø±Ø¬ÙˆØ¹':'Back'}
                                        </button>
                                    ) : (
                                        <button onClick={()=>setShowDetails(false)} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'20px',cursor:'pointer'}}>â€¹</button>
                                    )}
                                    <div style={{fontSize:'14px',fontWeight:800,color:'#a78bfa'}}>
                                        {settingsView==='main' ? (lang==='ar'?'Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø¬Ø±ÙˆØ¨':'Group Settings')
                                         : settingsView==='manage' ? (lang==='ar'?'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¬Ø±ÙˆØ¨':'Manage Group')
                                         : (lang==='ar'?'Ø§Ù„Ø£Ø¹Ø¶Ø§Ø¡':'Members')}
                                    </div>
                                    <button onClick={()=>{setShowDetails(false);setSettingsView('main');}} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'20px',cursor:'pointer'}}>âœ•</button>
                                </div>

                                {/* â”€â”€ MAIN SETTINGS VIEW â”€â”€ */}
                                {settingsView === 'main' && (
                                    <div style={{flex:1,overflowY:'auto',paddingBottom:'16px'}}>
                                        {/* Group header info */}
                                        <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'20px 16px 14px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                                            <div style={{position:'relative',marginBottom:'10px'}}>
                                                <div style={{width:'78px',height:'78px',borderRadius:'50%',background:'linear-gradient(135deg,rgba(167,139,250,0.3),rgba(112,0,255,0.2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'38px',overflow:'hidden',border:'2px solid rgba(167,139,250,0.4)',boxShadow:'0 0 20px rgba(167,139,250,0.2)'}}>
                                                    {activeGroup.photoURL?<img src={activeGroup.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'ðŸ‘¨â€ðŸ‘©â€ðŸ‘§'}
                                                </div>
                                                {(isOwner||isAdm) && (
                                                    <button onClick={()=>groupImgInputRef.current?.click()} style={{position:'absolute',bottom:0,right:0,width:'26px',height:'26px',borderRadius:'50%',background:'#a78bfa',border:'2px solid rgba(5,5,20,1)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'12px'}}>ðŸ“·</button>
                                                )}
                                            </div>
                                            <div style={{fontSize:'17px',fontWeight:800,color:'white',marginBottom:'4px'}}>{activeGroup.name}</div>
                                            <div style={{display:'flex',gap:'8px',fontSize:'11px',color:'#6b7280',alignItems:'center'}}>
                                                <span>{activeGroup.members?.length||1} {lang==='ar'?'Ø¹Ø¶Ùˆ':'members'}</span>
                                                <span>Â·</span>
                                                <span style={{color:grpLvl.color,fontWeight:700}}>{grpLvl.icon} Lv.{grpLvl.level}</span>
                                                {activeGroup.isPublic && <span style={{fontSize:'9px',padding:'1px 6px',borderRadius:'10px',background:'rgba(74,222,128,0.12)',border:'1px solid rgba(74,222,128,0.3)',color:'#4ade80',fontWeight:700}}>ðŸŒ {lang==='ar'?'Ø¹Ø§Ù…':'Public'}</span>}
                                                {activeGroup.isPublic === false && <span style={{fontSize:'9px',padding:'1px 6px',borderRadius:'10px',background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',fontWeight:700}}>ðŸ”’ {lang==='ar'?'Ø®Ø§Øµ':'Private'}</span>}
                                            </div>
                                        </div>

                                        {/* â”€â”€ MEMBERS SECTION â”€â”€ */}
                                        <div style={{padding:'14px 16px 0'}}>
                                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
                                                <div style={{fontSize:'12px',fontWeight:700,color:'#9ca3af'}}>ðŸ‘¥ {lang==='ar'?'Ø§Ù„Ø£Ø¹Ø¶Ø§Ø¡':'Members'} ({activeGroup.members?.length||0}/{activeGroup.maxMembers||40})</div>
                                                <div style={{display:'flex',gap:'6px'}}>
                                                    {(isOwner||isAdm) && (
                                                        <button onClick={()=>setShowInvite(true)} style={{background:'rgba(74,222,128,0.12)',border:'1px solid rgba(74,222,128,0.3)',borderRadius:'8px',padding:'4px 10px',color:'#4ade80',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>+ {lang==='ar'?'Ø¥Ø¶Ø§ÙØ©':'Add'}</button>
                                                    )}
                                                    <button onClick={()=>{setSettingsView('members');}} style={{background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.25)',borderRadius:'8px',padding:'4px 10px',color:'#a78bfa',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>{lang==='ar'?'Ø¹Ø±Ø¶ Ø§Ù„ÙƒÙ„':'View All'}</button>
                                                </div>
                                            </div>
                                            {/* Member avatars grid */}
                                            <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'6px'}}>
                                                {(loadingMembers ? [] : membersData).slice(0,10).map(member=>{
                                                    const isMemberOwner = activeGroup.createdBy===member.id;
                                                    const isMemberAdm = (activeGroup.admins||[]).includes(member.id);
                                                    return (
                                                        <div key={member.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',width:'48px'}}>
                                                            <div style={{position:'relative'}}>
                                                                <div style={{width:'42px',height:'42px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',overflow:'hidden',border:`2px solid ${isMemberOwner?'#ffd700':isMemberAdm?'#ef4444':'rgba(255,255,255,0.15)'}`}}>
                                                                    {member.photoURL?<img src={member.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>ðŸ˜Ž</div>}
                                                                </div>
                                                                {isMemberOwner && <div style={{position:'absolute',top:'-3px',right:'-3px',fontSize:'10px'}}>ðŸ‘‘</div>}
                                                                {!isMemberOwner && isMemberAdm && <div style={{position:'absolute',top:'-3px',right:'-3px',fontSize:'10px'}}>ðŸ›¡ï¸</div>}
                                                            </div>
                                                            <div style={{fontSize:'8px',color:'#9ca3af',textAlign:'center',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',width:'100%'}}>{(member.displayName||'User').slice(0,6)}</div>
                                                        </div>
                                                    );
                                                })}
                                                {(isOwner||isAdm) && (
                                                    <div onClick={()=>setShowInvite(true)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',width:'48px',cursor:'pointer'}}>
                                                        <div style={{width:'42px',height:'42px',borderRadius:'50%',background:'rgba(74,222,128,0.1)',border:'2px dashed rgba(74,222,128,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>+</div>
                                                        <div style={{fontSize:'8px',color:'#4ade80',textAlign:'center'}}>{lang==='ar'?'Ø£Ø¶Ù':'Add'}</div>
                                                    </div>
                                                )}
                                                {(isOwner||isAdm) && (
                                                    <div onClick={()=>setSettingsView('members')} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',width:'48px',cursor:'pointer'}}>
                                                        <div style={{width:'42px',height:'42px',borderRadius:'50%',background:'rgba(239,68,68,0.1)',border:'2px dashed rgba(239,68,68,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>â€”</div>
                                                        <div style={{fontSize:'8px',color:'#f87171',textAlign:'center'}}>{lang==='ar'?'Ø·Ø±Ø¯':'Kick'}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* â”€â”€ GROUP NOTICE â”€â”€ */}
                                        <div style={{margin:'12px 16px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',overflow:'hidden'}}>
                                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 14px',borderBottom: editingNotice?'1px solid rgba(255,255,255,0.06)':'none'}}>
                                                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                                                    <div style={{width:'32px',height:'32px',borderRadius:'9px',background:'rgba(251,191,36,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>ðŸ“¢</div>
                                                    <div>
                                                        <div style={{fontSize:'12px',fontWeight:700,color:'#e2e8f0'}}>{lang==='ar'?'Ø¥Ø¹Ù„Ø§Ù† Ø§Ù„Ø¬Ø±ÙˆØ¨':'Group Notice'}</div>
                                                        {!editingNotice && <div style={{fontSize:'10px',color:'#6b7280',marginTop:'1px'}}>{activeGroup.notice||(lang==='ar'?'Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø¥Ø¹Ù„Ø§Ù†':'No notice yet')}</div>}
                                                    </div>
                                                </div>
                                                {(isOwner||isAdm) && !editingNotice && (
                                                    <button onClick={()=>{setGroupNotice(activeGroup.notice||'');setEditingNotice(true);}} style={{background:'rgba(251,191,36,0.1)',border:'1px solid rgba(251,191,36,0.3)',borderRadius:'7px',padding:'4px 9px',color:'#fbbf24',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>âœï¸ {lang==='ar'?'ØªØ¹Ø¯ÙŠÙ„':'Edit'}</button>
                                                )}
                                            </div>
                                            {editingNotice && (
                                                <div style={{padding:'10px 14px'}}>
                                                    <textarea value={groupNotice} onChange={e=>setGroupNotice(e.target.value.slice(0,200))} maxLength={200}
                                                        style={{width:'100%',padding:'8px',borderRadius:'8px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:'12px',resize:'vertical',minHeight:'60px',outline:'none',boxSizing:'border-box'}}
                                                        placeholder={lang==='ar'?'Ø§ÙƒØªØ¨ Ø¥Ø¹Ù„Ø§Ù† Ø§Ù„Ø¬Ø±ÙˆØ¨...':'Write group notice...'}/>
                                                    <div style={{display:'flex',gap:'6px',marginTop:'8px'}}>
                                                        <button onClick={saveGroupNotice} style={{flex:1,padding:'7px',borderRadius:'8px',background:'linear-gradient(135deg,rgba(74,222,128,0.2),rgba(16,185,129,0.15))',border:'1px solid rgba(74,222,128,0.3)',color:'#4ade80',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>ðŸ’¾ {lang==='ar'?'Ø­ÙØ¸':'Save'}</button>
                                                        <button onClick={()=>setEditingNotice(false)} style={{padding:'7px 12px',borderRadius:'8px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',color:'#9ca3af',fontSize:'11px',cursor:'pointer'}}>âœ•</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* â”€â”€ MANAGE GROUP â”€â”€ */}
                                        <div onClick={()=>setSettingsView('manage')} style={{margin:'0 16px 10px',display:'flex',alignItems:'center',gap:'12px',padding:'13px 14px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',cursor:'pointer'}}
                                            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                                            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}>
                                            <div style={{width:'32px',height:'32px',borderRadius:'9px',background:'rgba(0,242,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>âš™ï¸</div>
                                            <div style={{flex:1}}>
                                                <div style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0'}}>{lang==='ar'?'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¬Ø±ÙˆØ¨':'Manage Group'}</div>
                                                <div style={{fontSize:'10px',color:'#6b7280',marginTop:'1px'}}>{lang==='ar'?'Ø¯Ø¹ÙˆØ©ØŒ Ø®ØµÙˆØµÙŠØ©ØŒ Ø£Ø¯Ù…Ù†ØŒ Ù†Ù‚Ù„ Ø§Ù„Ù…Ù„ÙƒÙŠØ©':'Invite, privacy, admins, ownership'}</div>
                                            </div>
                                            <span style={{color:'#6b7280',fontSize:'16px'}}>â€º</span>
                                        </div>

                                        {/* â”€â”€ GROUP COVER PHOTO â”€â”€ */}
                                        <div style={{margin:'0 16px 10px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'13px 14px',display:'flex',alignItems:'center',gap:'12px'}}>
                                            <div style={{width:'32px',height:'32px',borderRadius:'9px',background:'rgba(167,139,250,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>ðŸ–¼ï¸</div>
                                            <div style={{flex:1}}>
                                                <div style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0'}}>{lang==='ar'?'ØµÙˆØ±Ø© Ø§Ù„Ø¬Ø±ÙˆØ¨':'Group Photo'}</div>
                                                <div style={{fontSize:'10px',color:'#6b7280',marginTop:'1px'}}>{lang==='ar'?'Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„ØªÙŠ ØªØ¸Ù‡Ø± ÙÙŠ Ø´Ø§Øª Ø§Ù„Ø¬Ø±ÙˆØ¨ Ù…Ù† Ø¨Ø±Ù‡':'Photo shown in external group view'}</div>
                                            </div>
                                            {(isOwner||isAdm) && (
                                                <button onClick={()=>groupImgInputRef.current?.click()} style={{background:'rgba(167,139,250,0.12)',border:'1px solid rgba(167,139,250,0.3)',borderRadius:'8px',padding:'5px 10px',color:'#a78bfa',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>ðŸ“· {lang==='ar'?'ØªØºÙŠÙŠØ±':'Change'}</button>
                                            )}
                                        </div>

                                        {/* â”€â”€ MUTE â”€â”€ */}
                                        <div style={{margin:'0 16px 10px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'13px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                                            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                                                <div style={{width:'32px',height:'32px',borderRadius:'9px',background:groupMuted?'rgba(239,68,68,0.12)':'rgba(16,185,129,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>{groupMuted?'ðŸ”‡':'ðŸ””'}</div>
                                                <div>
                                                    <div style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0'}}>{lang==='ar'?'ÙƒØªÙ… Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª':'Mute Notifications'}</div>
                                                    <div style={{fontSize:'10px',color:groupMuted?'#f87171':'#4ade80',marginTop:'1px'}}>{groupMuted?(lang==='ar'?'Ù…ÙƒØªÙˆÙ…':'Muted'):(lang==='ar'?'Ù†Ø´Ø·':'Active')}</div>
                                                </div>
                                            </div>
                                            <div onClick={()=>setGroupMuted(!groupMuted)} style={{width:'46px',height:'24px',borderRadius:'12px',cursor:'pointer',background:groupMuted?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.4)',border:groupMuted?'1px solid rgba(239,68,68,0.5)':'1px solid rgba(16,185,129,0.5)',position:'relative',transition:'all 0.25s'}}>
                                                <div style={{position:'absolute',top:'2px',left:groupMuted?'2px':'22px',width:'18px',height:'18px',borderRadius:'50%',background:groupMuted?'#ef4444':'#10b981',transition:'all 0.25s'}}></div>
                                            </div>
                                        </div>

                                        {/* â”€â”€ REPORT GROUP â”€â”€ */}
                                        {!showReportGroup ? (
                                            <div onClick={()=>setShowReportGroup(true)} style={{margin:'0 16px 10px',display:'flex',alignItems:'center',gap:'12px',padding:'13px 14px',background:'rgba(239,68,68,0.04)',border:'1px solid rgba(239,68,68,0.12)',borderRadius:'14px',cursor:'pointer'}}
                                                onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.08)'}
                                                onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,0.04)'}>
                                                <div style={{width:'32px',height:'32px',borderRadius:'9px',background:'rgba(239,68,68,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>ðŸš¨</div>
                                                <div style={{flex:1}}>
                                                    <div style={{fontSize:'13px',fontWeight:700,color:'#f87171'}}>{lang==='ar'?'Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ø§Ù„Ø¬Ø±ÙˆØ¨':'Report Group'}</div>
                                                    <div style={{fontSize:'10px',color:'#6b7280',marginTop:'1px'}}>{lang==='ar'?'Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ù…Ø­ØªÙˆÙ‰ Ù…Ø³ÙŠØ¡':'Report inappropriate content'}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{margin:'0 16px 10px',background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'14px',padding:'13px 14px'}}>
                                                <div style={{fontSize:'12px',fontWeight:700,color:'#f87171',marginBottom:'8px'}}>ðŸš¨ {lang==='ar'?'Ø³Ø¨Ø¨ Ø§Ù„Ø¨Ù„Ø§Øº':'Report Reason'}</div>
                                                <textarea value={reportGroupReason} onChange={e=>setReportGroupReason(e.target.value)}
                                                    style={{width:'100%',padding:'8px',borderRadius:'8px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:'12px',resize:'none',minHeight:'55px',outline:'none',boxSizing:'border-box'}}
                                                    placeholder={lang==='ar'?'Ø§Ø´Ø±Ø­ Ø³Ø¨Ø¨ Ø§Ù„Ø¨Ù„Ø§Øº...':'Explain the reason...'}/>
                                                <div style={{display:'flex',gap:'6px',marginTop:'8px'}}>
                                                    <button onClick={handleSubmitGroupReport} disabled={sendingGroupReport||!reportGroupReason.trim()}
                                                        style={{flex:1,padding:'7px',borderRadius:'8px',background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',fontSize:'11px',fontWeight:700,cursor:'pointer',opacity:!reportGroupReason.trim()?0.5:1}}>
                                                        {sendingGroupReport?'â³':'ðŸ“¤'} {lang==='ar'?'Ø¥Ø±Ø³Ø§Ù„':'Submit'}
                                                    </button>
                                                    <button onClick={()=>{setShowReportGroup(false);setReportGroupReason('');}} style={{padding:'7px 12px',borderRadius:'8px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',color:'#9ca3af',fontSize:'11px',cursor:'pointer'}}>âœ•</button>
                                                </div>
                                            </div>
                                        )}

                                        {/* â”€â”€ LEAVE / DELETE â”€â”€ */}
                                        <div style={{margin:'0 16px 8px',display:'flex',gap:'8px'}}>
                                            {!isOwner && (
                                                <button onClick={handleLeaveGroup} style={{flex:1,padding:'12px',borderRadius:'12px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171',fontSize:'12px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                                                    ðŸšª {lang==='ar'?'Ù…ØºØ§Ø¯Ø±Ø© Ø§Ù„Ø¬Ø±ÙˆØ¨':'Leave Group'}
                                                </button>
                                            )}
                                            {isOwner && (
                                                <button onClick={handleDeleteGroup} style={{flex:1,padding:'12px',borderRadius:'12px',background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',fontSize:'12px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                                                    ðŸ—‘ï¸ {lang==='ar'?'Ø­Ø°Ù Ø§Ù„Ø¬Ø±ÙˆØ¨':'Delete Group'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* â”€â”€ MEMBERS MANAGEMENT VIEW â”€â”€ */}
                                {settingsView === 'members' && (
                                    <div style={{flex:1,overflowY:'auto',padding:'12px 16px'}}>
                                        {loadingMembers ? (
                                            <div style={{textAlign:'center',padding:'20px',color:'#6b7280'}}>â³</div>
                                        ) : membersData.map(member => {
                                            const isMemberAdm = (activeGroup.admins||[]).includes(member.id);
                                            const isMemberOwner = activeGroup.createdBy===member.id;
                                            return (
                                                <div key={member.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                                                    <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',overflow:'hidden',flexShrink:0,border:`2px solid ${isMemberOwner?'#ffd700':isMemberAdm?'#ef4444':'rgba(255,255,255,0.1)'}`}}>
                                                        {member.photoURL?<img src={member.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>ðŸ˜Ž</div>}
                                                    </div>
                                                    <div style={{flex:1,minWidth:0}}>
                                                        <div style={{fontSize:'13px',fontWeight:700,color:'white',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{member.displayName||'User'}</div>
                                                        <div style={{fontSize:'10px',color:isMemberOwner?'#ffd700':isMemberAdm?'#ef4444':'#6b7280',fontWeight:700}}>
                                                            {isMemberOwner?`ðŸ‘‘ ${lang==='ar'?'Ù…Ø§Ù„Ùƒ':'Owner'}`:isMemberAdm?`ðŸ›¡ï¸ ${lang==='ar'?'Ø£Ø¯Ù…Ù†':'Admin'}`:`ðŸ‘¤ ${lang==='ar'?'Ø¹Ø¶Ùˆ':'Member'}`}
                                                        </div>
                                                    </div>
                                                    {isOwner && !isMemberOwner && (
                                                        <div style={{display:'flex',gap:'4px'}}>
                                                            {isMemberAdm ? (
                                                                <button onClick={()=>removeAdmin(member.id)} style={{background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'7px',padding:'4px 8px',color:'#f87171',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>
                                                                    {lang==='ar'?'Ø¥Ø²Ø§Ù„Ø© Ø£Ø¯Ù…Ù†':'Remove Admin'}
                                                                </button>
                                                            ) : (
                                                                <button onClick={()=>makeAdmin(member.id)} style={{background:'rgba(167,139,250,0.12)',border:'1px solid rgba(167,139,250,0.25)',borderRadius:'7px',padding:'4px 8px',color:'#a78bfa',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>
                                                                    {lang==='ar'?'Ø£Ø¯Ù…Ù†':'Admin'}
                                                                </button>
                                                            )}
                                                            <button onClick={()=>kickMember(member.id)} style={{background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'7px',padding:'4px 8px',color:'#f87171',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>
                                                                ðŸš« {lang==='ar'?'Ø·Ø±Ø¯':'Kick'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* â”€â”€ MANAGE GROUP VIEW â”€â”€ */}
                                {settingsView === 'manage' && (
                                    <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
                                        {/* Invite Type */}
                                        <div style={{marginBottom:'14px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'14px'}}>
                                            <div style={{fontSize:'12px',fontWeight:700,color:'#9ca3af',marginBottom:'10px'}}>ðŸ”— {lang==='ar'?'Ù†ÙˆØ¹ Ø§Ù„Ø¯Ø¹ÙˆØ©':'Invite Type'}</div>
                                            {['open','approval','closed'].map(type => (
                                                <div key={type} onClick={()=>{setGroupInviteType(type);saveGroupManageSettings({inviteType:type});}}
                                                    style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 12px',borderRadius:'10px',cursor:'pointer',marginBottom:'4px',background:groupInviteType===type?'rgba(0,242,255,0.1)':'rgba(255,255,255,0.03)',border:`1px solid ${groupInviteType===type?'rgba(0,242,255,0.3)':'rgba(255,255,255,0.07)'}`}}>
                                                    <div style={{width:'22px',height:'22px',borderRadius:'50%',background:groupInviteType===type?'rgba(0,242,255,0.2)':'rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px'}}>{type==='open'?'ðŸŒ':type==='approval'?'âœ‹':'ðŸ”’'}</div>
                                                    <div style={{flex:1}}>
                                                        <div style={{fontSize:'12px',fontWeight:700,color:groupInviteType===type?'#00f2ff':'#e2e8f0'}}>
                                                            {type==='open'?(lang==='ar'?'Ù…ÙØªÙˆØ­ â€” Ø£ÙŠ Ø´Ø®Øµ ÙŠÙ‚Ø¯Ø± ÙŠØ¯Ø®Ù„':'Open â€” Anyone can join')
                                                             :type==='approval'?(lang==='ar'?'Ù…ÙˆØ§ÙÙ‚Ø© â€” ÙŠØ­ØªØ§Ø¬ Ø¥Ø°Ù† Ø§Ù„Ø£Ø¯Ù…Ù†':'Approval â€” Admin must approve')
                                                             :(lang==='ar'?'Ù…ØºÙ„Ù‚ â€” Ù„Ø§ ÙŠÙ…ÙƒÙ† Ù„Ø£Ø­Ø¯ Ø§Ù„Ø¯Ø®ÙˆÙ„':'Closed â€” No one can join')}
                                                        </div>
                                                    </div>
                                                    {groupInviteType===type && <div style={{fontSize:'14px',color:'#00f2ff'}}>âœ“</div>}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Public / Private */}
                                        <div style={{marginBottom:'14px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                                            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                                                <div style={{width:'32px',height:'32px',borderRadius:'9px',background:groupIsPublic?'rgba(74,222,128,0.1)':'rgba(239,68,68,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>{groupIsPublic?'ðŸŒ':'ðŸ”’'}</div>
                                                <div>
                                                    <div style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0'}}>{lang==='ar'?'Ø§Ù„Ø¬Ø±ÙˆØ¨ Ø§Ù„Ø¹Ø§Ù…':'Group Visibility'}</div>
                                                    <div style={{fontSize:'10px',color:'#6b7280',marginTop:'1px'}}>{groupIsPublic?(lang==='ar'?'ÙŠØ¸Ù‡Ø± Ù„Ù„Ø¬Ù…ÙŠØ¹':'Visible to all'):(lang==='ar'?'Ù…Ø®ÙÙŠ':'Hidden')}</div>
                                                </div>
                                            </div>
                                            <div onClick={()=>{setGroupIsPublic(!groupIsPublic);saveGroupManageSettings({isPublic:!groupIsPublic});}} style={{width:'46px',height:'24px',borderRadius:'12px',cursor:'pointer',background:groupIsPublic?'rgba(74,222,128,0.4)':'rgba(239,68,68,0.3)',border:groupIsPublic?'1px solid rgba(74,222,128,0.5)':'1px solid rgba(239,68,68,0.5)',position:'relative',transition:'all 0.25s'}}>
                                                <div style={{position:'absolute',top:'2px',left:groupIsPublic?'22px':'2px',width:'18px',height:'18px',borderRadius:'50%',background:groupIsPublic?'#4ade80':'#ef4444',transition:'all 0.25s'}}></div>
                                            </div>
                                        </div>

                                        {/* Group Admins */}
                                        <div style={{marginBottom:'14px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'14px'}}>
                                            <div style={{fontSize:'12px',fontWeight:700,color:'#9ca3af',marginBottom:'10px'}}>ðŸ›¡ï¸ {lang==='ar'?'Ø£Ø¯Ù…Ù† Ø§Ù„Ø¬Ø±ÙˆØ¨':'Group Admins'} ({(activeGroup.admins||[]).length})</div>
                                            {membersData.filter(m=>(activeGroup.admins||[]).includes(m.id) && m.id!==activeGroup.createdBy).map(adm=>(
                                                <div key={adm.id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                                                    <div style={{width:'30px',height:'30px',borderRadius:'50%',overflow:'hidden',background:'rgba(255,255,255,0.1)',flexShrink:0}}>
                                                        {adm.photoURL?<img src={adm.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>ðŸ˜Ž</div>}
                                                    </div>
                                                    <div style={{flex:1,fontSize:'12px',fontWeight:700,color:'#e2e8f0'}}>{adm.displayName||'User'}</div>
                                                    {isOwner && (
                                                        <button onClick={()=>removeAdmin(adm.id)} style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'6px',padding:'3px 8px',color:'#f87171',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>
                                                            {lang==='ar'?'Ø¥Ø²Ø§Ù„Ø©':'Remove'}
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            {membersData.filter(m=>(activeGroup.admins||[]).includes(m.id)&&m.id!==activeGroup.createdBy).length===0 && (
                                                <div style={{fontSize:'11px',color:'#4b5563',textAlign:'center',padding:'8px'}}>{lang==='ar'?'Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø£Ø¯Ù…Ù† Ø¨Ø¹Ø¯':'No admins yet'}</div>
                                            )}
                                        </div>

                                        {/* Transfer Ownership */}
                                        {isOwner && (
                                            <div style={{marginBottom:'14px',background:'rgba(255,215,0,0.04)',border:'1px solid rgba(255,215,0,0.15)',borderRadius:'14px',padding:'14px'}}>
                                                <div style={{fontSize:'12px',fontWeight:700,color:'#ffd700',marginBottom:'10px'}}>ðŸ‘‘ {lang==='ar'?'Ù†Ù‚Ù„ Ù…Ù„ÙƒÙŠØ© Ø§Ù„Ø¬Ø±ÙˆØ¨':'Transfer Group Ownership'}</div>
                                                {!showTransferConfirm ? (
                                                    <div style={{display:'flex',gap:'8px'}}>
                                                        <input value={transferToId} onChange={e=>setTransferToId(e.target.value)}
                                                            style={{flex:1,padding:'8px 12px',borderRadius:'10px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:'12px',outline:'none'}}
                                                            placeholder={lang==='ar'?'Ø£Ø¯Ø®Ù„ ID Ø§Ù„Ø¹Ø¶Ùˆ...':'Enter member ID...'}/>
                                                        <button onClick={()=>setShowTransferConfirm(true)} disabled={!transferToId.trim()}
                                                            style={{padding:'8px 14px',borderRadius:'10px',background:'rgba(255,215,0,0.12)',border:'1px solid rgba(255,215,0,0.3)',color:'#ffd700',fontSize:'11px',fontWeight:700,cursor:'pointer',opacity:!transferToId.trim()?0.4:1}}>
                                                            {lang==='ar'?'Ù†Ù‚Ù„':'Transfer'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div style={{fontSize:'11px',color:'#f87171',marginBottom:'8px',textAlign:'center'}}>âš ï¸ {lang==='ar'?'Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ù†Ù‚Ù„ Ø§Ù„Ù…Ù„ÙƒÙŠØ©ØŸ':'Are you sure you want to transfer ownership?'}</div>
                                                        <div style={{display:'flex',gap:'6px'}}>
                                                            <button onClick={handleTransferOwnership} style={{flex:1,padding:'8px',borderRadius:'8px',background:'rgba(255,215,0,0.15)',border:'1px solid rgba(255,215,0,0.3)',color:'#ffd700',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>âœ… {lang==='ar'?'ØªØ£ÙƒÙŠØ¯':'Confirm'}</button>
                                                            <button onClick={()=>setShowTransferConfirm(false)} style={{flex:1,padding:'8px',borderRadius:'8px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',color:'#9ca3af',fontSize:'11px',cursor:'pointer'}}>âœ• {lang==='ar'?'Ø¥Ù„ØºØ§Ø¡':'Cancel'}</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* â”€â”€ MESSAGES â”€â”€ */}
                        <div style={{
                            flex:1, overflowY:'auto', padding:'12px 10px',
                            display:'flex', flexDirection:'column', gap:'4px',
                            background: activeGroup.photoURL
                                ? `linear-gradient(rgba(5,5,16,0.82),rgba(8,8,22,0.82)), url(${activeGroup.photoURL}) center/cover no-repeat`
                                : 'linear-gradient(180deg,rgba(5,5,16,0.98),rgba(8,8,22,0.98))',
                            backgroundAttachment:'local',
                        }}>                            {messages.map(msg=>{
                                if(msg.type==='system') return(
                                    <div key={msg.id} style={{textAlign:'center',fontSize:'10px',color:'#6b7280',padding:'3px 12px',background:'rgba(255,255,255,0.04)',borderRadius:'20px',alignSelf:'center',maxWidth:'80%'}}>{msg.text}</div>
                                );
                                // ðŸ§§ Red Packet message
                                if(msg.type==='red_packet') {
                                    const isMe=msg.senderId===currentUID;
                                    const vipCfgRP = getVIPConfig(msg.senderVipLevel);
                                    return(
                                        <div key={msg.id} style={{display:'flex',flexDirection:isMe?'row-reverse':'row',gap:'7px',alignItems:'flex-end',marginBottom:'4px'}}>
                                            <div onClick={()=>openGroupMiniProfile(msg.senderId,{name:msg.senderName,photo:msg.senderPhoto})}
                                                style={{width:'28px',height:'28px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',overflow:'hidden',flexShrink:0,cursor:'pointer',border:vipCfgRP?`2px solid ${vipCfgRP.nameColor}`:'2px solid rgba(255,255,255,0.1)'}}>
                                                {msg.senderPhoto?<img src={msg.senderPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px'}}>ðŸ˜Ž</div>}
                                            </div>
                                            <div style={{maxWidth:'min(220px, calc(100vw - 90px))'}}>
                                                <div onClick={()=>openGroupMiniProfile(msg.senderId,{name:msg.senderName,photo:msg.senderPhoto})}
                                                    style={{fontSize:'9px',color:vipCfgRP?vipCfgRP.nameColor:'#a78bfa',fontWeight:700,marginBottom:'3px',paddingLeft:'4px',cursor:'pointer',display:'flex',alignItems:'center',gap:'3px'}}>
                                                    {vipCfgRP && <span style={{fontSize:'7px',fontWeight:900,background:vipCfgRP.nameColor,color:'#000',padding:'0 3px',borderRadius:'2px'}}>VIP{msg.senderVipLevel}</span>}
                                                    {msg.senderName}
                                                    {isMe&&<span style={{fontSize:'8px',color:'#4b5563'}}> ({lang==='ar'?'Ø£Ù†Øª':'you'})</span>}
                                                </div>
                                                <button onClick={()=>claimRedPacket(msg.rpId)} style={{
                                                    display:'flex',alignItems:'center',gap:'10px',padding:'12px 16px',borderRadius:'16px',
                                                    background:`linear-gradient(135deg,rgba(239,68,68,0.25),rgba(185,28,28,0.2))`,
                                                    border:`1px solid rgba(239,68,68,0.5)`,cursor:'pointer',width:'100%',
                                                    boxShadow:`0 4px 16px rgba(239,68,68,0.3)`,
                                                }}>
                                                    <div style={{fontSize:'32px',filter:'drop-shadow(0 0 8px rgba(239,68,68,0.7))'}}>ðŸ§§</div>
                                                    <div style={{flex:1,textAlign:'left'}}>
                                                        <div style={{fontSize:'12px',fontWeight:800,color:'#ffd700'}}>{lang==='ar'?'Ù…ØºÙ„Ù Ø£Ø­Ù…Ø±':'Red Packet'}</div>
                                                        <div style={{fontSize:'10px',color:'#fca5a5',marginTop:'2px'}}>{msg.rpAmount?.toLocaleString()} ðŸ§  Â· {msg.maxClaims} {lang==='ar'?'Ù…Ø³ØªÙ„Ù…':'claims'}</div>
                                                        <div style={{fontSize:'9px',color:'rgba(252,165,165,0.7)',marginTop:'2px'}}>{lang==='ar'?'Ø§Ø¶ØºØ· Ù„Ù„Ø§Ø³ØªÙ„Ø§Ù…':'Tap to claim'} ðŸŽ</div>
                                                    </div>
                                                </button>
                                                <div style={{fontSize:'9px',color:'#374151',marginTop:'2px',textAlign:isMe?'right':'left',paddingLeft:'4px'}}>{fmtTime(msg.createdAt)}</div>
                                            </div>
                                        </div>
                                    );
                                }
                                const isMe=msg.senderId===currentUID;
                                const isImage=msg.type==='image';
                                const vipCfgMsg = getVIPConfig(msg.senderVipLevel);
                                const nameColor = vipCfgMsg ? vipCfgMsg.nameColor : (isMe ? '#00f2ff' : '#a78bfa');
                                return(
                                    <div key={msg.id} style={{display:'flex',flexDirection:isMe?'row-reverse':'row',gap:'7px',alignItems:'flex-end'}}>
                                        {/* Avatar with frame */}
                                        <div style={{position:'relative',width:'30px',height:'30px',flexShrink:0}}>
                                            <div
                                                onClick={()=>openGroupMiniProfile(msg.senderId,{name:msg.senderName,photo:msg.senderPhoto})}
                                                style={{width:'30px',height:'30px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',overflow:'hidden',cursor:'pointer',border:vipCfgMsg?`2px solid ${vipCfgMsg.nameColor}`:'2px solid rgba(255,255,255,0.1)',boxShadow:vipCfgMsg?`0 0 6px ${vipCfgMsg.nameColor}66`:'none',position:'relative'}}>
                                                {msg.senderPhoto?<img src={msg.senderPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}>ðŸ˜Ž</div>}
                                                {msg.senderFrame && <img src={msg.senderFrame} alt="" onError={e=>e.target.style.display='none'} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',pointerEvents:'none'}}/>}
                                            </div>
                                        </div>
                                        <div style={{maxWidth:'min(70%, calc(100vw - 80px))'}}>
                                            {/* Name row */}
                                            <div style={{marginBottom:'2px',paddingLeft:isMe?0:'4px',paddingRight:isMe?'4px':0}}>
                                                <div style={{display:'flex',alignItems:'center',gap:'4px',flexWrap:'wrap',cursor:'pointer',justifyContent:isMe?'flex-end':'flex-start'}}
                                                    onClick={()=>openGroupMiniProfile(msg.senderId,{name:msg.senderName,photo:msg.senderPhoto})}>
                                                    {vipCfgMsg && (
                                                        <span style={{fontSize:'7px',fontWeight:900,background:vipCfgMsg.nameColor,color:'#000',padding:'1px 3px',borderRadius:'2px',flexShrink:0}}>VIP{msg.senderVipLevel}</span>
                                                    )}
                                                    <span style={{fontSize:'9px',color:nameColor,fontWeight:700}}>{msg.senderName}{isMe?` (${lang==='ar'?'Ø£Ù†Øª':'you'})`:''}</span>
                                                    {msg.senderVipLevel > 0 && typeof VIP_CHAT_TITLE_URLS !== 'undefined' && VIP_CHAT_TITLE_URLS?.[msg.senderVipLevel] && (
                                                        <img src={VIP_CHAT_TITLE_URLS[msg.senderVipLevel]} alt="" style={{height:'11px',objectFit:'contain'}}/>
                                                    )}
                                                    {/* Badges â€” up to 3 */}
                                                    {(msg.senderBadges||[]).slice(0,3).map((b,bi)=>{
                                                        if (!b) return null;
                                                        const badge = typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS.find(a=>a.id===b) : null;
                                                        if (!badge) return null;
                                                        return badge.imageUrl
                                                            ? <img key={bi} src={badge.imageUrl} alt="" onError={e=>e.target.style.display='none'} style={{width:'12px',height:'12px',objectFit:'contain',flexShrink:0}}/>
                                                            : <span key={bi} style={{fontSize:'10px'}}>{badge.icon||'ðŸ…'}</span>;
                                                    })}
                                                </div>
                                                {msg.senderTitle && <div style={{fontSize:'8px',color:'#fbbf24',marginTop:'1px',fontStyle:'italic',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'140px',textAlign:isMe?'right':'left'}}>{msg.senderTitle}</div>}
                                            </div>
                                            {isImage ? (
                                                <div onClick={()=>{const w=window.open();w.document.write(`<body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${msg.imageData}" style="max-width:100vw;max-height:100vh;object-fit:contain"></body>`);}}
                                                    style={{borderRadius:isMe?'14px 14px 4px 14px':'14px 14px 14px 4px',overflow:'hidden',border:`1px solid ${isMe?'rgba(0,242,255,0.18)':'rgba(255,255,255,0.09)'}`,cursor:'pointer',maxWidth:'min(200px, calc(100vw - 90px))'}}>
                                                    <img src={msg.imageData} alt="ðŸ“·" style={{display:'block',maxWidth:'min(200px, calc(100vw - 90px))',maxHeight:'200px',objectFit:'cover'}}/>
                                                </div>
                                            ) : (
                                                <div style={{padding:'8px 12px',borderRadius:isMe?'14px 4px 14px 14px':'4px 14px 14px 14px',background:isMe?'linear-gradient(135deg,rgba(112,0,255,0.45),rgba(0,242,255,0.2))':'rgba(255,255,255,0.08)',border:isMe?'1px solid rgba(0,242,255,0.2)':'1px solid rgba(255,255,255,0.09)',fontSize:'12px',color:'#e2e8f0',lineHeight:1.5,wordBreak:'break-word'}}>{msg.text}</div>
                                            )}
                                            <div style={{fontSize:'9px',color:'#374151',marginTop:'2px',textAlign:isMe?'right':'left',paddingLeft:'4px',paddingRight:'4px'}}>{fmtTime(msg.createdAt)}</div>
                                        </div>
                                    </div>
                                );
                            })}
                            {messages.length===0&&<div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'8px',color:'#4b5563',paddingTop:'40px'}}><div style={{fontSize:'32px'}}>ðŸ’¬</div><div style={{fontSize:'12px'}}>{lang==='ar'?'Ø§Ø¨Ø¯Ø£ Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø©!':'Say hi!'}</div></div>}
                            <div ref={messagesEndRef}/>
                        </div>

                        {/* â”€â”€ EMOJI PICKER â”€â”€ */}
                        {showEmojiPicker && (
                            <div style={{position:'absolute',bottom:'58px',left:0,right:0,background:'#0e1020',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'14px 14px 0 0',padding:'10px',zIndex:Z.MODAL_TOP,boxShadow:'0 -14px 44px rgba(0,0,0,0.8)',maxHeight:'220px',overflowY:'auto'}}>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
                                    <span style={{fontSize:'11px',fontWeight:700,color:'#00f2ff'}}>{lang==='ar'?'Ø§Ø®ØªØ± Ø¥ÙŠÙ…ÙˆØ¬ÙŠ':'Select Emoji'}</span>
                                    <button onClick={()=>setShowEmojiPicker(false)} style={{background:'none',border:'none',color:'#9ca3af',cursor:'pointer',fontSize:'14px'}}>âœ•</button>
                                </div>
                                {React.createElement(EmojiPicker, {
                                    show: true,
                                    onClose: () => setShowEmojiPicker(false),
                                    onSelect: (emoji) => { setMsgText(p=>p+emoji); setShowEmojiPicker(false); chatInputRef.current?.focus(); },
                                    lang, inline: true,
                                })}
                            </div>
                        )}

                        {/* â”€â”€ RED PACKET MODAL â€” closes on outside click â”€â”€ */}
                        {showRedPacketModal && (
                            <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.75)',zIndex:80,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end'}}
                                onClick={()=>setShowRedPacketModal(false)}>
                                <div style={{width:'100%',background:'linear-gradient(160deg,#0e0e22,#13122a)',borderRadius:'20px 20px 0 0',border:'1px solid rgba(255,255,255,0.1)',overflow:'hidden',maxHeight:'65%'}}
                                    onClick={e=>e.stopPropagation()}>
                                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
                                        <div style={{fontSize:'13px',fontWeight:800,color:'#ef4444'}}>ðŸ§§ {lang==='ar'?'Ø£Ø±Ø³Ù„ Ù…ØºÙ„Ù Ø£Ø­Ù…Ø±':'Send Red Packet'}</div>
                                        <button onClick={()=>setShowRedPacketModal(false)} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'20px',cursor:'pointer'}}>âœ•</button>
                                    </div>
                                    <div style={{padding:'12px',overflowY:'auto'}}>
                                        <div style={{fontSize:'11px',color:'#6b7280',marginBottom:'10px',textAlign:'center'}}>{lang==='ar'?'Ø±ØµÙŠØ¯Ùƒ Ø§Ù„Ø­Ø§Ù„ÙŠ':'Your balance'}: <span style={{color:'#ffd700',fontWeight:700}}>{(currentUserData?.currency||0).toLocaleString()} ðŸ§ </span></div>
                                        <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
                                            {(typeof RED_PACKETS_CONFIG !== 'undefined' ? RED_PACKETS_CONFIG : []).map(rp=>(
                                                <button key={rp.id} onClick={()=>sendGroupRedPacket(rp)} disabled={sendingRedPacket||(currentUserData?.currency||0)<rp.amount}
                                                    style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderRadius:'12px',background:rp.bg,border:`1px solid ${rp.border}`,cursor:(currentUserData?.currency||0)<rp.amount?'not-allowed':'pointer',opacity:(currentUserData?.currency||0)<rp.amount?0.4:1,textAlign:'left',transition:'all 0.2s'}}>
                                                    {rp.imageURL?<img src={rp.imageURL} alt="" style={{width:'36px',height:'36px',objectFit:'contain'}}/>:<div style={{width:'36px',height:'36px',borderRadius:'10px',background:`${rp.color}20`,border:`1px solid ${rp.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px'}}>ðŸ§§</div>}
                                                    <div style={{flex:1}}>
                                                        <div style={{fontSize:'12px',fontWeight:800,color:rp.color}}>{lang==='ar'?rp.name_ar:rp.name_en}</div>
                                                        <div style={{fontSize:'10px',color:'#9ca3af',marginTop:'1px'}}>{lang==='ar'?rp.desc_ar:rp.desc_en}</div>
                                                    </div>
                                                    <div style={{fontSize:'12px',fontWeight:800,color:rp.color}}>{rp.amount.toLocaleString()} ðŸ§ </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* â”€â”€ GROUP MINI PROFILE POPUP (Fix 4) â”€â”€ */}
                        {groupMiniProfile && (
                            <MiniProfilePopup
                                profile={groupMiniProfile}
                                onClose={() => setGroupMiniProfile(null)}
                                currentUID={currentUID}
                                lang={lang}
                                onOpenProfile={onOpenProfile}
                            />
                        )}

                        {/* â”€â”€ INPUT BAR â”€â”€ */}
                        <div style={{display:'flex',gap:'5px',padding:'8px 8px',borderTop:'1px solid rgba(255,255,255,0.07)',flexShrink:0,background:'rgba(0,0,0,0.45)',boxSizing:'border-box',width:'100%'}}>
                            <button onClick={()=>setShowEmojiPicker(v=>!v)} style={{width:'34px',height:'34px',borderRadius:'10px',border:`1px solid ${showEmojiPicker?'rgba(0,242,255,0.3)':'rgba(255,255,255,0.08)'}`,background:showEmojiPicker?'rgba(0,242,255,0.12)':'rgba(255,255,255,0.05)',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>ðŸ˜€</button>
                            <button onClick={()=>fileInputRef.current?.click()} disabled={uploadingImg} title={lang==='ar'?'Ø¥Ø±Ø³Ø§Ù„ ØµÙˆØ±Ø©':'Send image'} style={{width:'36px',height:'36px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.05)',cursor:uploadingImg?'wait':'pointer',fontSize:'15px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,opacity:uploadingImg?0.5:1}}>
                                {uploadingImg?'â³':'ðŸ–¼ï¸'}
                            </button>
                            {/* ðŸ§§ Red Packet Button */}
                            <button onClick={()=>setShowRedPacketModal(true)} title={lang==='ar'?'Ù…ØºÙ„Ù Ø£Ø­Ù…Ø±':'Red Packet'}
                                style={{width:'36px',height:'36px',borderRadius:'10px',border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.1)',cursor:'pointer',fontSize:'17px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                ðŸ§§
                            </button>
                            <input
                                ref={chatInputRef}
                                value={msgText}
                                onChange={e=>setMsgText(e.target.value)}
                                onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),sendMessage())}
                                style={{flex:1,padding:'8px 10px',borderRadius:'12px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:'13px',outline:'none',minWidth:0,width:'100%'}}
                                placeholder={lang==='ar'?'Ø§ÙƒØªØ¨ Ø±Ø³Ø§Ù„Ø©...':'Type a message...'}
                            />
                            <button onClick={sendMessage} disabled={!msgText.trim()} style={{width:'38px',height:'38px',borderRadius:'12px',border:'none',cursor:'pointer',flexShrink:0,background:msgText.trim()?'linear-gradient(135deg,#7000ff,#00f2ff)':'rgba(255,255,255,0.06)',color:msgText.trim()?'white':'#6b7280',fontSize:'16px',transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center'}}>âž¤</button>
                        </div>
                    </div>
                </div>
            </PortalModal>

            )}
        </React.Fragment>
        );
    }

    /* â”€â”€ GROUPS LIST â”€â”€ */
    const isVIP = currentUserData?.vip?.isActive;
    const maxGroups = isVIP ? 3 : 2;
    const ownedCount = groups.filter(g => g.createdBy === currentUID).length;
    return (
        <div style={{padding:'0 16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                <div style={{fontSize:'10px',color:'#4b5563'}}>
                    {lang==='ar' ? `${ownedCount}/${maxGroups} Ø¬Ø±ÙˆØ¨Ø§Øª` : `${ownedCount}/${maxGroups} groups`}
                    {!isVIP && <span style={{color:'#a78bfa',marginLeft:'4px',marginRight:'4px'}}>Â· VIP â†’ 3</span>}
                </div>
                <button onClick={()=>setShowCreate(!showCreate)} style={{display:'flex',alignItems:'center',gap:'6px',padding:'7px 14px',borderRadius:'10px',border:'1px solid rgba(167,139,250,0.4)',background:'rgba(167,139,250,0.12)',color:'#a78bfa',fontSize:'12px',fontWeight:700,cursor:'pointer',opacity:ownedCount>=maxGroups?0.5:1}}>
                    âž• {lang==='ar'?'Ø¬Ø±ÙˆØ¨ Ø¬Ø¯ÙŠØ¯':'New Group'}
                </button>
            </div>
            {showCreate&&(
                <div style={{marginBottom:'14px',padding:'14px',background:'rgba(167,139,250,0.06)',border:'1px solid rgba(167,139,250,0.2)',borderRadius:'14px'}}>
                    <div style={{fontSize:'12px',fontWeight:700,color:'#a78bfa',marginBottom:'10px'}}>ðŸ‘¨â€ðŸ‘©â€ðŸ‘§ {lang==='ar'?'Ø¥Ù†Ø´Ø§Ø¡ Ø¬Ø±ÙˆØ¨ Ø¬Ø¯ÙŠØ¯':'Create New Group'}</div>
                    <div style={{display:'flex',gap:'8px'}}>
                        <div style={{flex:1,position:'relative'}}>
                            <input value={groupName} onChange={e=>setGroupName(e.target.value.slice(0,7))} onKeyDown={e=>e.key==='Enter'&&createGroup()}
                                maxLength={7}
                                style={{width:'100%',padding:'8px 12px',borderRadius:'10px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',color:'white',fontSize:'12px',outline:'none',boxSizing:'border-box'}}
                                placeholder={lang==='ar'?'Ø§Ø³Ù… Ø§Ù„Ø¬Ø±ÙˆØ¨ (7 Ø£Ø­Ø±Ù)...':'Group name (7 chars)...'}/>
                            <span style={{position:'absolute',right:'8px',top:'50%',transform:'translateY(-50%)',fontSize:'9px',color:groupName.length>=7?'#f87171':'#6b7280',fontWeight:700}}>{groupName.length}/7</span>
                        </div>
                        <button onClick={createGroup} disabled={!groupName.trim()||creating}
                            style={{padding:'8px 14px',borderRadius:'10px',border:'none',fontWeight:700,fontSize:'12px',cursor:'pointer',background:groupName.trim()?'linear-gradient(135deg,#7000ff,#a78bfa)':'rgba(255,255,255,0.06)',color:groupName.trim()?'white':'#6b7280'}}>
                            {creating?'...':(lang==='ar'?'Ø¥Ù†Ø´Ø§Ø¡':'Create')}
                        </button>
                    </div>
                </div>
            )}
            {loadingGroups?(
                <div style={{textAlign:'center',padding:'32px',color:'#6b7280'}}>â³</div>
            ):groups.length===0?(
                <div style={{textAlign:'center',padding:'32px',color:'#6b7280'}}>
                    <div style={{fontSize:'36px',marginBottom:'10px'}}>ðŸ‘¨â€ðŸ‘©â€ðŸ‘§</div>
                    <div style={{fontSize:'13px',fontWeight:600,color:'#4b5563',marginBottom:'6px'}}>{lang==='ar'?'Ù„Ø§ Ø¬Ø±ÙˆØ¨Ø§Øª Ø¨Ø¹Ø¯':'No groups yet'}</div>
                    <div style={{fontSize:'11px'}}>{lang==='ar'?'Ø£Ù†Ø´Ø¦ Ø¬Ø±ÙˆØ¨ ÙˆØ§Ø¯Ø¹Ùˆ Ø£ØµØ¯Ù‚Ø§Ø¡Ùƒ':'Create a group and invite your friends'}</div>
                </div>
            ):(
                <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                    {groups.map(group=>{
                        const unread=hasUnread(group);
                        const gLvl = getGroupLevel(group.xp || 0);
                        return(
                            <div key={group.id} onClick={()=>setActiveGroup(group)} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 14px',borderRadius:'14px',cursor:'pointer',background:unread?'linear-gradient(135deg,rgba(167,139,250,0.1),rgba(112,0,255,0.06))':'rgba(255,255,255,0.04)',border:unread?'1px solid rgba(167,139,250,0.3)':'1px solid rgba(255,255,255,0.07)',transition:'all 0.2s'}}>
                                <div style={{position:'relative',flexShrink:0}}>
                                    <div style={{width:'44px',height:'44px',borderRadius:'50%',background:'linear-gradient(135deg,rgba(167,139,250,0.25),rgba(112,0,255,0.2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',overflow:'hidden'}}>
                                        {group.photoURL ? <img src={group.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : 'ðŸ‘¨â€ðŸ‘©â€ðŸ‘§'}
                                    </div>
                                    {unread&&<div style={{position:'absolute',top:'-2px',right:'-2px',width:'12px',height:'12px',borderRadius:'50%',background:'#a78bfa',border:'2px solid var(--bg-main)',boxShadow:'0 0 6px rgba(167,139,250,0.8)'}}/>}
                                </div>
                                <div style={{flex:1,minWidth:0}}>
                                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'3px'}}>
                                        <div style={{fontSize:'13px',fontWeight:unread?800:600,color:unread?'#e2e8f0':'#9ca3af',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{group.name}</div>
                                        <div style={{fontSize:'9px',color:'#6b7280',flexShrink:0,marginLeft:'6px'}}>{fmtTime(group.lastMessageAt)}</div>
                                    </div>
                                    <div style={{fontSize:'11px',color:'#6b7280',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{group.lastMessage||(lang==='ar'?'Ù„Ø§ Ø±Ø³Ø§Ø¦Ù„':'No messages')}</div>
                                    <div style={{fontSize:'9px',color:'#4b5563',marginTop:'2px',display:'flex',alignItems:'center',gap:'6px'}}>
                                        <span>{group.members?.length||1} {lang==='ar'?'Ø¹Ø¶Ùˆ':'members'}</span>
                                        <span style={{color:gLvl.color,fontWeight:700}}>{gLvl.icon} Lv.{gLvl.level}</span>
                                    </div>
                                </div>
                                <div style={{fontSize:'16px',color:'#6b7280',flexShrink:0}}>â€º</div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

