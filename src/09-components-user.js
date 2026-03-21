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
                {lang === 'ar' ? 'إ�غاء' : 'Unblock'}
            </button>
        </div>
    );
};

// �� COUNTRIES LIST
var OUNTRIES = [
    { code:'SA', flag:'��', name_ar:'ا�سع�د�ة',      name_en:'Saudi Arabia' },
    { code:'EG', flag:'��', name_ar:'�صر',            name_en:'Egypt' },
    { code:'AE', flag:'��', name_ar:'ا�إ�ارات',      name_en:'UAE' },
    { code:'KW', flag:'��', name_ar:'ا����ت',        name_en:'Kuwait' },
    { code:'QA', flag:'��', name_ar:'�طر',           name_en:'Qatar' },
    { code:'BH', flag:'��', name_ar:'ا�بحر��',       name_en:'Bahrain' },
    { code:'OM', flag:'��', name_ar:'عُ�ا�',         name_en:'Oman' },
    { code:'IQ', flag:'��', name_ar:'ا�عرا�',        name_en:'Iraq' },
    { code:'SY', flag:'��', name_ar:'س�ر�ا',         name_en:'Syria' },
    { code:'JO', flag:'��', name_ar:'ا�أرد�',        name_en:'Jordan' },
    { code:'LB', flag:'��', name_ar:'�ب�ا�',         name_en:'Lebanon' },
    { code:'PS', flag:'��', name_ar:'ف�سط��',        name_en:'Palestine' },
    { code:'YE', flag:'��', name_ar:'ا����',         name_en:'Yemen' },
    { code:'LY', flag:'��', name_ar:'��ب�ا',         name_en:'Libya' },
    { code:'TN', flag:'��', name_ar:'ت��س',          name_en:'Tunisia' },
    { code:'DZ', flag:'��', name_ar:'ا�جزائر',       name_en:'Algeria' },
    { code:'MA', flag:'��', name_ar:'ا��غرب',        name_en:'Morocco' },
    { code:'SD', flag:'��', name_ar:'ا�س�دا�',       name_en:'Sudan' },
    { code:'SO', flag:'��', name_ar:'ا�ص��ا�',       name_en:'Somalia' },
    { code:'MR', flag:'��', name_ar:'��ر�تا��ا',     name_en:'Mauritania' },
    { code:'US', flag:'��', name_ar:'أ�ر��ا',        name_en:'USA' },
    { code:'GB', flag:'��', name_ar:'بر�طا��ا',      name_en:'UK' },
    { code:'FR', flag:'��', name_ar:'فر�سا',         name_en:'France' },
    { code:'DE', flag:'��', name_ar:'أ��ا��ا',       name_en:'Germany' },
    { code:'IT', flag:'��', name_ar:'إ�طا��ا',       name_en:'Italy' },
    { code:'ES', flag:'��', name_ar:'إسبا��ا',       name_en:'Spain' },
    { code:'CA', flag:'��', name_ar:'��دا',          name_en:'Canada' },
    { code:'AU', flag:'��', name_ar:'أسترا��ا',      name_en:'Australia' },
    { code:'TR', flag:'��', name_ar:'تر��ا',         name_en:'Turkey' },
    { code:'IR', flag:'��', name_ar:'إ�را�',         name_en:'Iran' },
    { code:'PK', flag:'��', name_ar:'با�ستا�',       name_en:'Pakistan' },
    { code:'IN', flag:'��', name_ar:'ا���د',         name_en:'India' },
    { code:'CN', flag:'��', name_ar:'ا�ص��',         name_en:'China' },
    { code:'JP', flag:'��', name_ar:'ا��ابا�',       name_en:'Japan' },
    { code:'KR', flag:'��', name_ar:'��ر�ا',         name_en:'South Korea' },
    { code:'BR', flag:'��', name_ar:'ا�براز��',      name_en:'Brazil' },
    { code:'MX', flag:'��', name_ar:'ا���س��',       name_en:'Mexico' },
    { code:'RU', flag:'��', name_ar:'ر�س�ا',         name_en:'Russia' },
    { code:'NL', flag:'��', name_ar:'����دا',        name_en:'Netherlands' },
    { code:'SE', flag:'��', name_ar:'ا�س��د',        name_en:'Sweden' },
    { code:'NO', flag:'��', name_ar:'ا��ر��ج',       name_en:'Norway' },
    { code:'CH', flag:'��', name_ar:'س��سرا',        name_en:'Switzerland' },
    { code:'NG', flag:'��', name_ar:'��ج�ر�ا',       name_en:'Nigeria' },
    { code:'ET', flag:'��', name_ar:'إث��ب�ا',       name_en:'Ethiopia' },
    { code:'ZA', flag:'��', name_ar:'ج��ب أفر���ا',  name_en:'South Africa' },
    { code:'ID', flag:'��', name_ar:'إ�د���س�ا',     name_en:'Indonesia' },
    { code:'MY', flag:'��', name_ar:'�ا��ز�ا',       name_en:'Malaysia' },
    { code:'PH', flag:'��', name_ar:'ا�ف�ب��',       name_en:'Philippines' },
];

// �� Country Picker Component � Flag Grid
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
                placeholder={lang === 'ar' ? '�� ابحث...' : '�� Search...'}
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

// � ONBOARDING MODAL - New User Setup
var OnboardingModal = ({ show, googleUser, onComplete, lang }) => {
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
                    <div className="onboarding-spy-icon">�️</div>
                    <h2 className="onboarding-title">{lang === 'ar' ? '�رحبا� ف� PRO SPY!' : 'Welcome to PRO SPY!'}</h2>
                    <p className="onboarding-subtitle">{lang === 'ar' ? 'أ��� ��ف� ا�شخص� ��بدء' : 'Complete your profile to start'}</p>
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
                                <span className="onboarding-camera-icon">�</span>
                            </div>
                        </div>
                        <input type="file" ref={fileRef} style={{ display: 'none' }} accept="image/*" onChange={handlePhotoChange} />
                        <p className="onboarding-photo-hint">{lang === 'ar' ? 'اضغط �تغ��ر ا�ص�رة' : 'Tap to change photo'}</p>
                    </div>

                    {/* Name Input */}
                    <div className="onboarding-field">
                        <label className="onboarding-label">
                            {lang === 'ar' ? '�️ اس�� ف� ا��عبة' : '�️ Your display name'}
                        </label>
                        <input
                            className="onboarding-input"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            placeholder={lang === 'ar' ? 'أدخ� اس��...' : 'Enter your name...'}
                            maxLength={10}
                        />
                    </div>

                    {/* Gender Selection */}
                    <div className="onboarding-field">
                        <label className="onboarding-label">
                            {lang === 'ar' ? '� ا�ج�س' : '� Gender'}
                        </label>
                        <div className="onboarding-gender-row">
                            <button
                                className={`onboarding-gender-btn ${gender === 'male' ? 'active' : ''}`}
                                onClick={() => setGender('male')}
                            >
                                <span style={{fontSize:'28px'}}>�</span>
                                <span>{lang === 'ar' ? 'ذ�ر' : 'Male'}</span>
                            </button>
                            <button
                                className={`onboarding-gender-btn ${gender === 'female' ? 'active' : ''}`}
                                onClick={() => setGender('female')}
                            >
                                <span style={{fontSize:'28px'}}>�</span>
                                <span>{lang === 'ar' ? 'أ�ث�' : 'Female'}</span>
                            </button>
                        </div>
                    </div>
                    {/* Country Selection */}
                    <div className="onboarding-field">
                        <label className="onboarding-label">
                            {lang === 'ar' ? '�� د��ت�' : '�� Your Country'}
                            <span style={{ color: '#6b7280', fontWeight: 400, fontSize: '11px', marginRight: '4px', marginLeft: '4px' }}>
                                ({lang === 'ar' ? 'اخت�ار�' : 'optional'})
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
                                    <span style={{ color: '#6b7280' }}>{lang === 'ar' ? '� اختر د��ت� �' : '� Select your country �'}</span>
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
                                    {lang === 'ar' ? '� إغ�ا�' : '� Close'}
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
                        {lang === 'ar' ? '� ابدأ ا��عب!' : '� Start Playing!'}
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
        if (status === 'claimed') { onNotification(lang==='ar'?'� است��ت با�فع�':'� Already claimed'); return; }
        if (status === 'vip_locked') { onNotification(lang==='ar'?'� حصر� �� VIP':'� VIP Exclusive'); return; }
        if (status === 'locked') {
            const requiredMin = Math.ceil(box.duration/60000);
            const remaining = requiredMin - minutesOnline;
            onNotification(lang==='ar'?`⏳ بعد ${remaining} د���ة`:`⏳ In ${remaining} min`);
            return;
        }
        try {
            const updates = {};
            updates[`dailyTasks.boxes.${box.id-1}.status`] = 'claimed';
            updates[`dailyTasks.boxes.${box.id-1}.claimedAt`] = TS();
            if (box.reward.type === 'currency') updates['currency'] = firebase.firestore.FieldValue.increment(box.reward.amount);
            await usersCollection.doc(user.uid).update(updates);
            onNotification(`� +${box.reward.amount} �`);
        } catch(err) { onNotification(lang==='ar'?'� خطأ':'� Error'); }
    };

    return (
        <div style={{ padding:'0' }}>
            {/* �� Header row �� */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'linear-gradient(135deg,rgba(0,242,255,0.2),rgba(112,0,255,0.15))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>�</div>
                    <div>
                        <div style={{ fontSize:'13px', fontWeight:800, color:'#e2e8f0' }}>{lang==='ar'?'��ا� ا����':'Daily Tasks'}</div>
                        <div style={{ fontSize:'10px', color:'#64748b', marginTop:'1px' }}>
                            {lang==='ar'?`${minutesOnline} د���ة أ�� �ا��`:`${minutesOnline} min online`}
                        </div>
                    </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    {availableCount > 0 && (
                        <div style={{ fontSize:'9px', fontWeight:800, background:'rgba(0,242,255,0.15)', border:'1px solid rgba(0,242,255,0.35)', color:'#00f2ff', borderRadius:'20px', padding:'2px 8px' }}>
                            {availableCount} {lang==='ar'?'�تاح':'ready'}
                        </div>
                    )}
                    <div style={{ fontSize:'10px', color:'#6b7280' }}>{claimedCount}/{DAILY_TASKS_CONFIG.length}</div>
                </div>
            </div>

            {/* �� Progress bar total �� */}
            <div style={{ height:'4px', background:'rgba(255,255,255,0.06)', borderRadius:'4px', marginBottom:'14px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${(claimedCount/DAILY_TASKS_CONFIG.length)*100}%`, background:'linear-gradient(90deg,#00f2ff,#7000ff)', transition:'width 0.6s ease' }} />
            </div>

            {/* �� 8 Chest Boxes �� */}
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
                                {isClaimed ? '�' : isAvailable ? '�' : isVipLocked ? '�' : '�'}
                            </div>

                            {/* Reward */}
                            <div style={{
                                fontSize:'9px', fontWeight:900, marginBottom:'2px',
                                color: isClaimed ? '#4ade80' : isAvailable ? '#00f2ff' : isVipLocked ? '#f87171' : '#4b5563'
                            }}>
                                {isClaimed ? '�' : isVipLocked ? 'VIP' : `+${box.reward.amount}`}
                            </div>

                            {/* Time / icon */}
                            <div style={{ fontSize:'8px', color: isClaimed?'#4ade8099':isAvailable?'#00f2ff88':'#374151' }}>
                                {isClaimed ? box.reward.icon : isVipLocked ? '�' : timeLabel || box.reward.icon}
                            </div>

                            {/* Available badge � pulsing dot */}
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

// LoginRewardsComponent removed � استخد� LoginRewards ف� 14-modals-misc.js

// AchievementsDisplayComponent removed - use AchievementsDisplayV11 instead

// � MAIN APP COMPONENT

// ��������������������������������������������������������
// ����� GROUPS SECTION � Group Chat System
// ��������������������������������������������������������
// groupsCollection � defined in 01-config.js

// �� Group Level System ��
var ROUP_LEVEL_CONFIG = [
    { level:1,  xp:0,    icon:'�', name_en:'Seed',    name_ar:'بذرة',   color:'#4ade80' },
    { level:2,  xp:50,   icon:'�', name_en:'Sprout',  name_ar:'�بتة',   color:'#22d3ee' },
    { level:3,  xp:150,  icon:'�', name_en:'Tree',    name_ar:'شجرة',   color:'#34d399' },
    { level:4,  xp:300,  icon:'⭐', name_en:'Star',    name_ar:'�ج�ة',   color:'#fbbf24' },
    { level:5,  xp:500,  icon:'�', name_en:'Diamond', name_ar:'�اسة',   color:'#60a5fa' },
    { level:6,  xp:800,  icon:'�', name_en:'Crown',   name_ar:'تاج',    color:'#ffd700' },
    { level:7,  xp:1200, icon:'�', name_en:'Flame',   name_ar:'��ب',    color:'#f97316' },
    { level:8,  xp:2000, icon:'�', name_en:'Thunder', name_ar:'رعد',    color:'#a78bfa' },
    { level:9,  xp:3500, icon:'�', name_en:'Galaxy',  name_ar:'�جرة',   color:'#818cf8' },
    { level:10, xp:5000, icon:'��', name_en:'Legend',  name_ar:'أسط�رة', color:'#00d4ff' },
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
    // �� NEW: settings sub-panels ��
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
    // �� Mini Profile in group chat ��
    const [groupMiniProfile, setGroupMiniProfile] = React.useState(null);
    const messagesEndRef = React.useRef(null);
    const chatInputRef = React.useRef(null);
    const fileInputRef = React.useRef(null);
    const groupImgInputRef = React.useRef(null);

    // � No orderBy � no index needed, sort client-side
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
            onNotification(lang === 'ar' ? '� اس� ا�جر�ب 7 أحرف �حد أ�ص�' : '� Group name max 7 chars');
            return;
        }
        // �� Check group limit ��
        const isVIP = currentUserData?.vip?.isActive;
        const maxGroups = isVIP ? 3 : 2;
        const myOwnedGroups = groups.filter(g => g.createdBy === currentUID);
        if (myOwnedGroups.length >= maxGroups) {
            onNotification(lang === 'ar'
                ? `� �ص�ت ��حد ا�أ�ص� (${maxGroups} جر�بات)${!isVIP ? ' · VIP �حص� ع�� 3' : ''}`
                : `� Max groups reached (${maxGroups})${!isVIP ? ' · VIP gets 3' : ''}`
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
                lastMessage: lang === 'ar' ? '� ت� إ�شاء ا�جر�ب' : '� Group created',
                lastMessageAt: TS(),
                lastMessageAtMs: nowMs,
                createdAt: TS(),
                readBy: { [currentUID]: TS() },
                xp: 0,
                level: 1,
            });
            setGroupName(''); setShowCreate(false);
            onNotification(lang === 'ar' ? '� ت� إ�شاء ا�جر�ب!' : '� Group created!');
        } catch (e) {
            console.error('createGroup error:', e);
            onNotification(lang === 'ar' ? '� خطأ ف� ا�إ�شاء' : '� Error creating group');
        }
        setCreating(false);
    };

    const inviteFriend = async (friendId) => {
        if (!activeGroup) return;
        if (activeGroup.members?.includes(friendId)) {
            onNotification(lang === 'ar' ? '�ذا ا�شخص ��ج�د با�فع�' : 'Already a member'); return;
        }
        try {
            await groupsCollection.doc(activeGroup.id).update({
                members: firebase.firestore.FieldValue.arrayUnion(friendId)
            });
            const friend = friendsData.find(f => f.id === friendId);
            await groupsCollection.doc(activeGroup.id).collection('messages').add({
                text: lang === 'ar' ? `ت�ت إضافة ${friend?.displayName || 'عض�'}` : `${friend?.displayName || 'Member'} was added`,
                senderId: 'system', senderName: 'System',
                createdAt: TS(), type: 'system'
            });
            onNotification(lang === 'ar' ? '� ت�ت ا�دع�ة!' : '� Invited!');
            setShowInvite(false);
            setActiveGroup(g => ({ ...g, members: [...(g.members || []), friendId] }));
        } catch (e) { onNotification(lang === 'ar' ? '� خطأ' : '� Error'); }
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
            // �� XP + level update ��
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
                text: '�', senderId: currentUID,
                senderName: currentUserData?.displayName || 'User',
                senderPhoto: currentUserData?.photoURL || null,
                type: 'image', imageData: base64,
                createdAt: TS()
            });
            await groupsCollection.doc(activeGroup.id).update({
                lastMessage: '� Photo', lastSenderId: currentUID,
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
            onNotification(lang === 'ar' ? '� ت� تغ��ر ص�رة ا�جر�ب' : '� Group photo updated');
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
            onNotification(lang === 'ar' ? '� ت� تر��ة ا�عض� �أد��' : '� Member promoted to admin');
        } catch (e) { onNotification(lang === 'ar' ? '� خطأ' : '� Error'); }
    };

    const removeAdmin = async (memberId) => {
        if (!activeGroup || !currentUID) return;
        try {
            await groupsCollection.doc(activeGroup.id).update({
                admins: firebase.firestore.FieldValue.arrayRemove(memberId)
            });
            setActiveGroup(g => ({ ...g, admins: (g.admins || []).filter(id => id !== memberId) }));
            onNotification(lang === 'ar' ? '� ت� إزا�ة ا�أد��' : '� Admin removed');
        } catch (e) { onNotification(lang === 'ar' ? '� خطأ' : '� Error'); }
    };

    const kickMember = async (memberId) => {
        if (!activeGroup || !currentUID) return;
        if (memberId === activeGroup.createdBy) { onNotification(lang==='ar'?'� �ا ���� طرد ا�أ��ر':'� Cannot kick owner'); return; }
        try {
            await groupsCollection.doc(activeGroup.id).update({
                members: firebase.firestore.FieldValue.arrayRemove(memberId),
                admins: firebase.firestore.FieldValue.arrayRemove(memberId),
            });
            const member = membersData.find(m => m.id === memberId);
            await groupsCollection.doc(activeGroup.id).collection('messages').add({
                text: lang==='ar' ? `ت� طرد ${member?.displayName||'عض�'}` : `${member?.displayName||'Member'} was removed`,
                senderId:'system', senderName:'System', type:'system',
                createdAt: TS()
            });
            setActiveGroup(g => ({ ...g, members: (g.members||[]).filter(id=>id!==memberId), admins: (g.admins||[]).filter(id=>id!==memberId) }));
            setMembersData(d => d.filter(m=>m.id!==memberId));
            onNotification(lang==='ar'?'� ت� طرد ا�عض�':'� Member removed');
        } catch(e) { onNotification(lang==='ar'?'� خطأ':'� Error'); }
    };

    const saveGroupNotice = async () => {
        if (!activeGroup) return;
        try {
            await groupsCollection.doc(activeGroup.id).update({ notice: groupNotice });
            setActiveGroup(g => ({ ...g, notice: groupNotice }));
            setEditingNotice(false);
            onNotification(lang==='ar'?'� ت� حفظ ا�إع�ا�':'� Notice saved');
        } catch(e) { onNotification(lang==='ar'?'� خطأ':'� Error'); }
    };

    const saveGroupManageSettings = async (updates) => {
        if (!activeGroup) return;
        try {
            await groupsCollection.doc(activeGroup.id).update(updates);
            setActiveGroup(g => ({ ...g, ...updates }));
            onNotification(lang==='ar'?'� ت� ا�حفظ':'� Saved');
        } catch(e) { onNotification(lang==='ar'?'� خطأ':'� Error'); }
    };

    const handleTransferOwnership = async () => {
        if (!activeGroup || !transferToId.trim()) return;
        const target = membersData.find(m => m.id === transferToId.trim() || (m.customId && m.customId === transferToId.trim()));
        if (!target) { onNotification(lang==='ar'?'� ا�عض� غ�ر ��ج�د ف� ا�جر�ب':'� Member not found'); return; }
        try {
            await groupsCollection.doc(activeGroup.id).update({
                createdBy: target.id,
                admins: firebase.firestore.FieldValue.arrayUnion(target.id),
            });
            await groupsCollection.doc(activeGroup.id).collection('messages').add({
                text: lang==='ar'?`ت� ��� ا�����ة إ�� ${target.displayName}`:`Ownership transferred to ${target.displayName}`,
                senderId:'system', senderName:'System', type:'system',
                createdAt: TS()
            });
            setActiveGroup(g => ({ ...g, createdBy: target.id, admins: [...(g.admins||[]), target.id] }));
            setShowTransferConfirm(false); setTransferToId('');
            onNotification(lang==='ar'?'� ت� ��� ا�����ة':'� Ownership transferred');
        } catch(e) { onNotification(lang==='ar'?'� خطأ':'� Error'); }
    };

    const handleLeaveGroup = async () => {
        if (!activeGroup || !currentUID) return;
        const isOwner = activeGroup.createdBy === currentUID;
        if (isOwner && (activeGroup.members||[]).length > 1) {
            onNotification(lang==='ar'?'� ا��� ا�����ة أ��ا� �ب� ا��غادرة':'� Transfer ownership before leaving');
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
                    text: lang==='ar'?`${currentUserData?.displayName||'عض�'} غادر ا�جر�ب`:`${currentUserData?.displayName||'Member'} left the group`,
                    senderId:'system', senderName:'System', type:'system',
                    createdAt: TS()
                });
            }
            setActiveGroup(null); setShowDetails(false);
            onNotification(lang==='ar'?'� غادرت ا�جر�ب':'� Left the group');
        } catch(e) { onNotification(lang==='ar'?'� خطأ':'� Error'); }
    };

    const handleDeleteGroup = async () => {
        if (!activeGroup || activeGroup.createdBy !== currentUID) return;
        try {
            await groupsCollection.doc(activeGroup.id).delete();
            setActiveGroup(null); setShowDetails(false);
            onNotification(lang==='ar'?'� ت� حذف ا�جر�ب':'� Group deleted');
        } catch(e) { onNotification(lang==='ar'?'� خطأ':'� Error'); }
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
            onNotification(lang==='ar'?'� ت� إرسا� ا�ب�اغ':'� Report submitted');
        } catch(e) { onNotification(lang==='ar'?'� خطأ':'� Error'); }
        setSendingGroupReport(false);
    };

    const sendGroupRedPacket = async (rpConfig) => {
        if (!activeGroup || !currentUID || !currentUserData) return;
        const balance = currentUserData.currency || 0;
        if (balance < rpConfig.amount) { onNotification(lang==='ar'?'� رص�د غ�ر �افٍ':'� Insufficient balance'); return; }
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
                text: lang==='ar'?`� �غ�ف أح�ر ${rpConfig.amount} �� ${currentUserData.displayName}`:`� Red Packet ${rpConfig.amount} from ${currentUserData.displayName}`,
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
                    ? `� ${currentUserData.displayName} أرس� �غ�ف ${rpConfig.amount} ف� جر�ب ${activeGroup.name}`
                    : `� ${currentUserData.displayName} sent a ${rpConfig.amount} packet in group ${activeGroup.name}`,
                createdAt: TS(),
            });
            setShowRedPacketModal(false);
            onNotification(lang==='ar'?'� ت� إرسا� ا��غ�ف!':'� Red Packet sent!');
        } catch(e) { onNotification(lang==='ar'?'� خطأ':'� Error'); }
        setSendingRedPacket(false);
    };

    const claimRedPacket = async (rpId) => {
        if (!rpId || !currentUID) return;
        try {
            const rpDoc = await redPacketsCollection.doc(rpId).get();
            if (!rpDoc.exists) { onNotification(lang==='ar'?'� ا��غ�ف غ�ر ��ج�د':'� Packet not found'); return; }
            const rp = rpDoc.data();
            // � Fix 2: ف� ا�جر�ب� ا��رس� �أخذ �سبة ف�ط �ث� أ� شخص آخر (�ا �ح� �� أخذ ا���)
            if (rp.claimedBy?.includes(currentUID)) { onNotification(lang==='ar'?'� است��ت� �� �ب�':'� Already claimed'); return; }
            if (rp.claimedBy?.length >= rp.maxClaims) { onNotification(lang==='ar'?'� ا��غ�ف �فد':'� Packet exhausted'); return; }
            if (rp.status !== 'active') { onNotification(lang==='ar'?'� ا��غ�ف ��ت��':'� Packet expired'); return; }
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
                        ? `� ${currentUserData?.displayName||'�ستخد�'} است�� ${claim} �� �غ�ف ${rp.senderName}`
                        : `� ${currentUserData?.displayName||'User'} claimed ${claim} from ${rp.senderName}'s packet`,
                    senderId: 'system', senderName: 'System',
                    createdAt: TS(),
                });
            }
            onNotification(lang==='ar'?`� است��ت ${claim} Intel!`:`� You got ${claim} Intel!`);
        } catch(e) { onNotification(lang==='ar'?'� خطأ':'� Error'); }
    };

    // openGroupMiniProfile � now opens a mini profile popup instead of the full profile
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
            <div style={{fontSize:'32px',marginBottom:'10px'}}>�</div>
            <div style={{fontSize:'12px'}}>{lang==='ar'?'سج�� دخ�� ���ص�� ��جر�بات':'Login to access groups'}</div>
        </div>
    );

    /* �� CHAT VIEW � as portal overlay so it doesn't affect parent layout �� */
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
                        {/* �� HEADER �� */}
                        <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'11px 14px',background:'rgba(7,7,22,1)',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0}}>
                            <button onClick={()=>setActiveGroup(null)} style={{background:'none',border:'none',color:'#00f2ff',fontSize:'20px',cursor:'pointer',padding:'0 4px',lineHeight:1}}>�</button>
                            <div
                                onClick={()=>setShowDetails(true)}
                                style={{width:'38px',height:'38px',borderRadius:'50%',background:'linear-gradient(135deg,rgba(167,139,250,0.3),rgba(112,0,255,0.2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',flexShrink:0,overflow:'hidden',cursor:'pointer'}}
                            >
                                {activeGroup.photoURL
                                    ? <img src={activeGroup.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                                    : '�����'}
                            </div>
                            <div style={{flex:1,minWidth:0,cursor:'pointer'}} onClick={()=>setShowDetails(true)}>
                                <div style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{activeGroup.name}</div>
                                <div style={{fontSize:'10px',color:'#6b7280',display:'flex',alignItems:'center',gap:'6px'}}>
                                    <span>{activeGroup.members?.length||1} {lang==='ar'?'عض�':'members'}</span>
                                    <span style={{color:grpLvl.color,fontWeight:700}}>{grpLvl.icon} Lv.{grpLvl.level}</span>
                                </div>
                            </div>
                            {isAdm && <button onClick={()=>setShowDetails(true)} style={{background:'rgba(167,139,250,0.15)',border:'1px solid rgba(167,139,250,0.3)',borderRadius:'8px',width:'32px',height:'32px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'16px',color:'#a78bfa',flexShrink:0}} title={lang==='ar'?'إعدادات ا�جر�ب':'Group Settings'}>�️</button>}
                        </div>

                        {/* �� INVITE OVERLAY �� */}
                        {showInvite && (
                            <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(5,5,20,0.97)',zIndex:50,display:'flex',flexDirection:'column',padding:'16px'}}>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                                    <div style={{fontSize:'14px',fontWeight:800,color:'#a78bfa'}}>� {lang==='ar'?'دع�ة صد��':'Invite Friend'}</div>
                                    <button onClick={()=>setShowInvite(false)} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'20px',cursor:'pointer'}}>�</button>
                                </div>
                                <div style={{overflowY:'auto',flex:1}}>
                                    {friendsData.filter(f=>!(activeGroup.members||[]).includes(f.id)).length===0
                                        ? <div style={{textAlign:'center',padding:'20px',color:'#6b7280',fontSize:'12px'}}>{lang==='ar'?'�ا ��جد أصد�اء �دع�ت��':'No friends to invite'}</div>
                                        : friendsData.filter(f=>!(activeGroup.members||[]).includes(f.id)).map(friend=>(
                                            <div key={friend.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                                                <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',overflow:'hidden',flexShrink:0}}>
                                                    {friend.photoURL?<img src={friend.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>�</div>}
                                                </div>
                                                <div style={{flex:1,fontSize:'13px',color:'#e2e8f0',fontWeight:600}}>{friend.displayName}</div>
                                                <button onClick={()=>inviteFriend(friend.id)} style={{background:'rgba(167,139,250,0.2)',border:'1px solid rgba(167,139,250,0.4)',borderRadius:'8px',padding:'5px 12px',color:'#a78bfa',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>+ {lang==='ar'?'أضف':'Add'}</button>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )}

                        {/* �� GROUP SETTINGS PANEL (Full) �� */}
                        {showDetails && (
                            <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(5,5,20,0.99)',zIndex:50,display:'flex',flexDirection:'column',overflow:'hidden'}}>
                                {/* Header */}
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0,background:'rgba(7,7,22,1)'}}>
                                    {settingsView !== 'main' ? (
                                        <button onClick={()=>setSettingsView('main')} style={{background:'none',border:'none',color:'#00f2ff',fontSize:'14px',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',fontWeight:700}}>
                                            � {lang==='ar'?'رج�ع':'Back'}
                                        </button>
                                    ) : (
                                        <button onClick={()=>setShowDetails(false)} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'20px',cursor:'pointer'}}>�</button>
                                    )}
                                    <div style={{fontSize:'14px',fontWeight:800,color:'#a78bfa'}}>
                                        {settingsView==='main' ? (lang==='ar'?'إعدادات ا�جر�ب':'Group Settings')
                                         : settingsView==='manage' ? (lang==='ar'?'إدارة ا�جر�ب':'Manage Group')
                                         : (lang==='ar'?'ا�أعضاء':'Members')}
                                    </div>
                                    <button onClick={()=>{setShowDetails(false);setSettingsView('main');}} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'20px',cursor:'pointer'}}>�</button>
                                </div>

                                {/* �� MAIN SETTINGS VIEW �� */}
                                {settingsView === 'main' && (
                                    <div style={{flex:1,overflowY:'auto',paddingBottom:'16px'}}>
                                        {/* Group header info */}
                                        <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'20px 16px 14px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                                            <div style={{position:'relative',marginBottom:'10px'}}>
                                                <div style={{width:'78px',height:'78px',borderRadius:'50%',background:'linear-gradient(135deg,rgba(167,139,250,0.3),rgba(112,0,255,0.2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'38px',overflow:'hidden',border:'2px solid rgba(167,139,250,0.4)',boxShadow:'0 0 20px rgba(167,139,250,0.2)'}}>
                                                    {activeGroup.photoURL?<img src={activeGroup.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'�����'}
                                                </div>
                                                {(isOwner||isAdm) && (
                                                    <button onClick={()=>groupImgInputRef.current?.click()} style={{position:'absolute',bottom:0,right:0,width:'26px',height:'26px',borderRadius:'50%',background:'#a78bfa',border:'2px solid rgba(5,5,20,1)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'12px'}}>�</button>
                                                )}
                                            </div>
                                            <div style={{fontSize:'17px',fontWeight:800,color:'white',marginBottom:'4px'}}>{activeGroup.name}</div>
                                            <div style={{display:'flex',gap:'8px',fontSize:'11px',color:'#6b7280',alignItems:'center'}}>
                                                <span>{activeGroup.members?.length||1} {lang==='ar'?'عض�':'members'}</span>
                                                <span>·</span>
                                                <span style={{color:grpLvl.color,fontWeight:700}}>{grpLvl.icon} Lv.{grpLvl.level}</span>
                                                {activeGroup.isPublic && <span style={{fontSize:'9px',padding:'1px 6px',borderRadius:'10px',background:'rgba(74,222,128,0.12)',border:'1px solid rgba(74,222,128,0.3)',color:'#4ade80',fontWeight:700}}>�� {lang==='ar'?'عا�':'Public'}</span>}
                                                {activeGroup.isPublic === false && <span style={{fontSize:'9px',padding:'1px 6px',borderRadius:'10px',background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',fontWeight:700}}>� {lang==='ar'?'خاص':'Private'}</span>}
                                            </div>
                                        </div>

                                        {/* �� MEMBERS SECTION �� */}
                                        <div style={{padding:'14px 16px 0'}}>
                                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
                                                <div style={{fontSize:'12px',fontWeight:700,color:'#9ca3af'}}>� {lang==='ar'?'ا�أعضاء':'Members'} ({activeGroup.members?.length||0}/{activeGroup.maxMembers||40})</div>
                                                <div style={{display:'flex',gap:'6px'}}>
                                                    {(isOwner||isAdm) && (
                                                        <button onClick={()=>setShowInvite(true)} style={{background:'rgba(74,222,128,0.12)',border:'1px solid rgba(74,222,128,0.3)',borderRadius:'8px',padding:'4px 10px',color:'#4ade80',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>+ {lang==='ar'?'إضافة':'Add'}</button>
                                                    )}
                                                    <button onClick={()=>{setSettingsView('members');}} style={{background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.25)',borderRadius:'8px',padding:'4px 10px',color:'#a78bfa',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>{lang==='ar'?'عرض ا���':'View All'}</button>
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
                                                                    {member.photoURL?<img src={member.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>�</div>}
                                                                </div>
                                                                {isMemberOwner && <div style={{position:'absolute',top:'-3px',right:'-3px',fontSize:'10px'}}>�</div>}
                                                                {!isMemberOwner && isMemberAdm && <div style={{position:'absolute',top:'-3px',right:'-3px',fontSize:'10px'}}>�️</div>}
                                                            </div>
                                                            <div style={{fontSize:'8px',color:'#9ca3af',textAlign:'center',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',width:'100%'}}>{(member.displayName||'User').slice(0,6)}</div>
                                                        </div>
                                                    );
                                                })}
                                                {(isOwner||isAdm) && (
                                                    <div onClick={()=>setShowInvite(true)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',width:'48px',cursor:'pointer'}}>
                                                        <div style={{width:'42px',height:'42px',borderRadius:'50%',background:'rgba(74,222,128,0.1)',border:'2px dashed rgba(74,222,128,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>+</div>
                                                        <div style={{fontSize:'8px',color:'#4ade80',textAlign:'center'}}>{lang==='ar'?'أضف':'Add'}</div>
                                                    </div>
                                                )}
                                                {(isOwner||isAdm) && (
                                                    <div onClick={()=>setSettingsView('members')} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',width:'48px',cursor:'pointer'}}>
                                                        <div style={{width:'42px',height:'42px',borderRadius:'50%',background:'rgba(239,68,68,0.1)',border:'2px dashed rgba(239,68,68,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>�</div>
                                                        <div style={{fontSize:'8px',color:'#f87171',textAlign:'center'}}>{lang==='ar'?'طرد':'Kick'}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* �� GROUP NOTICE �� */}
                                        <div style={{margin:'12px 16px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',overflow:'hidden'}}>
                                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 14px',borderBottom: editingNotice?'1px solid rgba(255,255,255,0.06)':'none'}}>
                                                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                                                    <div style={{width:'32px',height:'32px',borderRadius:'9px',background:'rgba(251,191,36,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>�</div>
                                                    <div>
                                                        <div style={{fontSize:'12px',fontWeight:700,color:'#e2e8f0'}}>{lang==='ar'?'إع�ا� ا�جر�ب':'Group Notice'}</div>
                                                        {!editingNotice && <div style={{fontSize:'10px',color:'#6b7280',marginTop:'1px'}}>{activeGroup.notice||(lang==='ar'?'�ا ��جد إع�ا�':'No notice yet')}</div>}
                                                    </div>
                                                </div>
                                                {(isOwner||isAdm) && !editingNotice && (
                                                    <button onClick={()=>{setGroupNotice(activeGroup.notice||'');setEditingNotice(true);}} style={{background:'rgba(251,191,36,0.1)',border:'1px solid rgba(251,191,36,0.3)',borderRadius:'7px',padding:'4px 9px',color:'#fbbf24',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>�️ {lang==='ar'?'تعد��':'Edit'}</button>
                                                )}
                                            </div>
                                            {editingNotice && (
                                                <div style={{padding:'10px 14px'}}>
                                                    <textarea value={groupNotice} onChange={e=>setGroupNotice(e.target.value.slice(0,200))} maxLength={200}
                                                        style={{width:'100%',padding:'8px',borderRadius:'8px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:'12px',resize:'vertical',minHeight:'60px',outline:'none',boxSizing:'border-box'}}
                                                        placeholder={lang==='ar'?'ا�تب إع�ا� ا�جر�ب...':'Write group notice...'}/>
                                                    <div style={{display:'flex',gap:'6px',marginTop:'8px'}}>
                                                        <button onClick={saveGroupNotice} style={{flex:1,padding:'7px',borderRadius:'8px',background:'linear-gradient(135deg,rgba(74,222,128,0.2),rgba(16,185,129,0.15))',border:'1px solid rgba(74,222,128,0.3)',color:'#4ade80',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>� {lang==='ar'?'حفظ':'Save'}</button>
                                                        <button onClick={()=>setEditingNotice(false)} style={{padding:'7px 12px',borderRadius:'8px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',color:'#9ca3af',fontSize:'11px',cursor:'pointer'}}>�</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* �� MANAGE GROUP �� */}
                                        <div onClick={()=>setSettingsView('manage')} style={{margin:'0 16px 10px',display:'flex',alignItems:'center',gap:'12px',padding:'13px 14px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',cursor:'pointer'}}
                                            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                                            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}>
                                            <div style={{width:'32px',height:'32px',borderRadius:'9px',background:'rgba(0,242,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>�️</div>
                                            <div style={{flex:1}}>
                                                <div style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0'}}>{lang==='ar'?'إدارة ا�جر�ب':'Manage Group'}</div>
                                                <div style={{fontSize:'10px',color:'#6b7280',marginTop:'1px'}}>{lang==='ar'?'دع�ة� خص�ص�ة� أد��� ��� ا�����ة':'Invite, privacy, admins, ownership'}</div>
                                            </div>
                                            <span style={{color:'#6b7280',fontSize:'16px'}}>�</span>
                                        </div>

                                        {/* �� GROUP COVER PHOTO �� */}
                                        <div style={{margin:'0 16px 10px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'13px 14px',display:'flex',alignItems:'center',gap:'12px'}}>
                                            <div style={{width:'32px',height:'32px',borderRadius:'9px',background:'rgba(167,139,250,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>�️</div>
                                            <div style={{flex:1}}>
                                                <div style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0'}}>{lang==='ar'?'ص�رة ا�جر�ب':'Group Photo'}</div>
                                                <div style={{fontSize:'10px',color:'#6b7280',marginTop:'1px'}}>{lang==='ar'?'ا�ص�رة ا�ت� تظ�ر ف� شات ا�جر�ب �� بر�':'Photo shown in external group view'}</div>
                                            </div>
                                            {(isOwner||isAdm) && (
                                                <button onClick={()=>groupImgInputRef.current?.click()} style={{background:'rgba(167,139,250,0.12)',border:'1px solid rgba(167,139,250,0.3)',borderRadius:'8px',padding:'5px 10px',color:'#a78bfa',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>� {lang==='ar'?'تغ��ر':'Change'}</button>
                                            )}
                                        </div>

                                        {/* �� MUTE �� */}
                                        <div style={{margin:'0 16px 10px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'13px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                                            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                                                <div style={{width:'32px',height:'32px',borderRadius:'9px',background:groupMuted?'rgba(239,68,68,0.12)':'rgba(16,185,129,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>{groupMuted?'�':'�'}</div>
                                                <div>
                                                    <div style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0'}}>{lang==='ar'?'�ت� ا�إشعارات':'Mute Notifications'}</div>
                                                    <div style={{fontSize:'10px',color:groupMuted?'#f87171':'#4ade80',marginTop:'1px'}}>{groupMuted?(lang==='ar'?'��ت��':'Muted'):(lang==='ar'?'�شط':'Active')}</div>
                                                </div>
                                            </div>
                                            <div onClick={()=>setGroupMuted(!groupMuted)} style={{width:'46px',height:'24px',borderRadius:'12px',cursor:'pointer',background:groupMuted?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.4)',border:groupMuted?'1px solid rgba(239,68,68,0.5)':'1px solid rgba(16,185,129,0.5)',position:'relative',transition:'all 0.25s'}}>
                                                <div style={{position:'absolute',top:'2px',left:groupMuted?'2px':'22px',width:'18px',height:'18px',borderRadius:'50%',background:groupMuted?'#ef4444':'#10b981',transition:'all 0.25s'}}></div>
                                            </div>
                                        </div>

                                        {/* �� REPORT GROUP �� */}
                                        {!showReportGroup ? (
                                            <div onClick={()=>setShowReportGroup(true)} style={{margin:'0 16px 10px',display:'flex',alignItems:'center',gap:'12px',padding:'13px 14px',background:'rgba(239,68,68,0.04)',border:'1px solid rgba(239,68,68,0.12)',borderRadius:'14px',cursor:'pointer'}}
                                                onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.08)'}
                                                onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,0.04)'}>
                                                <div style={{width:'32px',height:'32px',borderRadius:'9px',background:'rgba(239,68,68,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>�</div>
                                                <div style={{flex:1}}>
                                                    <div style={{fontSize:'13px',fontWeight:700,color:'#f87171'}}>{lang==='ar'?'ا�إب�اغ ع� ا�جر�ب':'Report Group'}</div>
                                                    <div style={{fontSize:'10px',color:'#6b7280',marginTop:'1px'}}>{lang==='ar'?'إب�اغ ع� �حت�� �س�ء':'Report inappropriate content'}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{margin:'0 16px 10px',background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'14px',padding:'13px 14px'}}>
                                                <div style={{fontSize:'12px',fontWeight:700,color:'#f87171',marginBottom:'8px'}}>� {lang==='ar'?'سبب ا�ب�اغ':'Report Reason'}</div>
                                                <textarea value={reportGroupReason} onChange={e=>setReportGroupReason(e.target.value)}
                                                    style={{width:'100%',padding:'8px',borderRadius:'8px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:'12px',resize:'none',minHeight:'55px',outline:'none',boxSizing:'border-box'}}
                                                    placeholder={lang==='ar'?'اشرح سبب ا�ب�اغ...':'Explain the reason...'}/>
                                                <div style={{display:'flex',gap:'6px',marginTop:'8px'}}>
                                                    <button onClick={handleSubmitGroupReport} disabled={sendingGroupReport||!reportGroupReason.trim()}
                                                        style={{flex:1,padding:'7px',borderRadius:'8px',background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',fontSize:'11px',fontWeight:700,cursor:'pointer',opacity:!reportGroupReason.trim()?0.5:1}}>
                                                        {sendingGroupReport?'⏳':'�'} {lang==='ar'?'إرسا�':'Submit'}
                                                    </button>
                                                    <button onClick={()=>{setShowReportGroup(false);setReportGroupReason('');}} style={{padding:'7px 12px',borderRadius:'8px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',color:'#9ca3af',fontSize:'11px',cursor:'pointer'}}>�</button>
                                                </div>
                                            </div>
                                        )}

                                        {/* �� LEAVE / DELETE �� */}
                                        <div style={{margin:'0 16px 8px',display:'flex',gap:'8px'}}>
                                            {!isOwner && (
                                                <button onClick={handleLeaveGroup} style={{flex:1,padding:'12px',borderRadius:'12px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171',fontSize:'12px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                                                    � {lang==='ar'?'�غادرة ا�جر�ب':'Leave Group'}
                                                </button>
                                            )}
                                            {isOwner && (
                                                <button onClick={handleDeleteGroup} style={{flex:1,padding:'12px',borderRadius:'12px',background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',fontSize:'12px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                                                    �️ {lang==='ar'?'حذف ا�جر�ب':'Delete Group'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* �� MEMBERS MANAGEMENT VIEW �� */}
                                {settingsView === 'members' && (
                                    <div style={{flex:1,overflowY:'auto',padding:'12px 16px'}}>
                                        {loadingMembers ? (
                                            <div style={{textAlign:'center',padding:'20px',color:'#6b7280'}}>⏳</div>
                                        ) : membersData.map(member => {
                                            const isMemberAdm = (activeGroup.admins||[]).includes(member.id);
                                            const isMemberOwner = activeGroup.createdBy===member.id;
                                            return (
                                                <div key={member.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                                                    <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',overflow:'hidden',flexShrink:0,border:`2px solid ${isMemberOwner?'#ffd700':isMemberAdm?'#ef4444':'rgba(255,255,255,0.1)'}`}}>
                                                        {member.photoURL?<img src={member.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>�</div>}
                                                    </div>
                                                    <div style={{flex:1,minWidth:0}}>
                                                        <div style={{fontSize:'13px',fontWeight:700,color:'white',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{member.displayName||'User'}</div>
                                                        <div style={{fontSize:'10px',color:isMemberOwner?'#ffd700':isMemberAdm?'#ef4444':'#6b7280',fontWeight:700}}>
                                                            {isMemberOwner?`� ${lang==='ar'?'�ا��':'Owner'}`:isMemberAdm?`�️ ${lang==='ar'?'أد��':'Admin'}`:`� ${lang==='ar'?'عض�':'Member'}`}
                                                        </div>
                                                    </div>
                                                    {isOwner && !isMemberOwner && (
                                                        <div style={{display:'flex',gap:'4px'}}>
                                                            {isMemberAdm ? (
                                                                <button onClick={()=>removeAdmin(member.id)} style={{background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'7px',padding:'4px 8px',color:'#f87171',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>
                                                                    {lang==='ar'?'إزا�ة أد��':'Remove Admin'}
                                                                </button>
                                                            ) : (
                                                                <button onClick={()=>makeAdmin(member.id)} style={{background:'rgba(167,139,250,0.12)',border:'1px solid rgba(167,139,250,0.25)',borderRadius:'7px',padding:'4px 8px',color:'#a78bfa',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>
                                                                    {lang==='ar'?'أد��':'Admin'}
                                                                </button>
                                                            )}
                                                            <button onClick={()=>kickMember(member.id)} style={{background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'7px',padding:'4px 8px',color:'#f87171',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>
                                                                � {lang==='ar'?'طرد':'Kick'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* �� MANAGE GROUP VIEW �� */}
                                {settingsView === 'manage' && (
                                    <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
                                        {/* Invite Type */}
                                        <div style={{marginBottom:'14px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'14px'}}>
                                            <div style={{fontSize:'12px',fontWeight:700,color:'#9ca3af',marginBottom:'10px'}}>� {lang==='ar'?'��ع ا�دع�ة':'Invite Type'}</div>
                                            {['open','approval','closed'].map(type => (
                                                <div key={type} onClick={()=>{setGroupInviteType(type);saveGroupManageSettings({inviteType:type});}}
                                                    style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 12px',borderRadius:'10px',cursor:'pointer',marginBottom:'4px',background:groupInviteType===type?'rgba(0,242,255,0.1)':'rgba(255,255,255,0.03)',border:`1px solid ${groupInviteType===type?'rgba(0,242,255,0.3)':'rgba(255,255,255,0.07)'}`}}>
                                                    <div style={{width:'22px',height:'22px',borderRadius:'50%',background:groupInviteType===type?'rgba(0,242,255,0.2)':'rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px'}}>{type==='open'?'��':type==='approval'?'�':'�'}</div>
                                                    <div style={{flex:1}}>
                                                        <div style={{fontSize:'12px',fontWeight:700,color:groupInviteType===type?'#00f2ff':'#e2e8f0'}}>
                                                            {type==='open'?(lang==='ar'?'�فت�ح � أ� شخص ��در �دخ�':'Open � Anyone can join')
                                                             :type==='approval'?(lang==='ar'?'��اف�ة � �حتاج إذ� ا�أد��':'Approval � Admin must approve')
                                                             :(lang==='ar'?'�غ�� � �ا ���� �أحد ا�دخ��':'Closed � No one can join')}
                                                        </div>
                                                    </div>
                                                    {groupInviteType===type && <div style={{fontSize:'14px',color:'#00f2ff'}}>�</div>}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Public / Private */}
                                        <div style={{marginBottom:'14px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                                            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                                                <div style={{width:'32px',height:'32px',borderRadius:'9px',background:groupIsPublic?'rgba(74,222,128,0.1)':'rgba(239,68,68,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>{groupIsPublic?'��':'�'}</div>
                                                <div>
                                                    <div style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0'}}>{lang==='ar'?'ا�جر�ب ا�عا�':'Group Visibility'}</div>
                                                    <div style={{fontSize:'10px',color:'#6b7280',marginTop:'1px'}}>{groupIsPublic?(lang==='ar'?'�ظ�ر ��ج��ع':'Visible to all'):(lang==='ar'?'�خف�':'Hidden')}</div>
                                                </div>
                                            </div>
                                            <div onClick={()=>{setGroupIsPublic(!groupIsPublic);saveGroupManageSettings({isPublic:!groupIsPublic});}} style={{width:'46px',height:'24px',borderRadius:'12px',cursor:'pointer',background:groupIsPublic?'rgba(74,222,128,0.4)':'rgba(239,68,68,0.3)',border:groupIsPublic?'1px solid rgba(74,222,128,0.5)':'1px solid rgba(239,68,68,0.5)',position:'relative',transition:'all 0.25s'}}>
                                                <div style={{position:'absolute',top:'2px',left:groupIsPublic?'22px':'2px',width:'18px',height:'18px',borderRadius:'50%',background:groupIsPublic?'#4ade80':'#ef4444',transition:'all 0.25s'}}></div>
                                            </div>
                                        </div>

                                        {/* Group Admins */}
                                        <div style={{marginBottom:'14px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'14px'}}>
                                            <div style={{fontSize:'12px',fontWeight:700,color:'#9ca3af',marginBottom:'10px'}}>�️ {lang==='ar'?'أد�� ا�جر�ب':'Group Admins'} ({(activeGroup.admins||[]).length})</div>
                                            {membersData.filter(m=>(activeGroup.admins||[]).includes(m.id) && m.id!==activeGroup.createdBy).map(adm=>(
                                                <div key={adm.id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                                                    <div style={{width:'30px',height:'30px',borderRadius:'50%',overflow:'hidden',background:'rgba(255,255,255,0.1)',flexShrink:0}}>
                                                        {adm.photoURL?<img src={adm.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>�</div>}
                                                    </div>
                                                    <div style={{flex:1,fontSize:'12px',fontWeight:700,color:'#e2e8f0'}}>{adm.displayName||'User'}</div>
                                                    {isOwner && (
                                                        <button onClick={()=>removeAdmin(adm.id)} style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'6px',padding:'3px 8px',color:'#f87171',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>
                                                            {lang==='ar'?'إزا�ة':'Remove'}
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            {membersData.filter(m=>(activeGroup.admins||[]).includes(m.id)&&m.id!==activeGroup.createdBy).length===0 && (
                                                <div style={{fontSize:'11px',color:'#4b5563',textAlign:'center',padding:'8px'}}>{lang==='ar'?'�ا ��جد أد�� بعد':'No admins yet'}</div>
                                            )}
                                        </div>

                                        {/* Transfer Ownership */}
                                        {isOwner && (
                                            <div style={{marginBottom:'14px',background:'rgba(255,215,0,0.04)',border:'1px solid rgba(255,215,0,0.15)',borderRadius:'14px',padding:'14px'}}>
                                                <div style={{fontSize:'12px',fontWeight:700,color:'#ffd700',marginBottom:'10px'}}>� {lang==='ar'?'��� ����ة ا�جر�ب':'Transfer Group Ownership'}</div>
                                                {!showTransferConfirm ? (
                                                    <div style={{display:'flex',gap:'8px'}}>
                                                        <input value={transferToId} onChange={e=>setTransferToId(e.target.value)}
                                                            style={{flex:1,padding:'8px 12px',borderRadius:'10px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:'12px',outline:'none'}}
                                                            placeholder={lang==='ar'?'أدخ� ID ا�عض�...':'Enter member ID...'}/>
                                                        <button onClick={()=>setShowTransferConfirm(true)} disabled={!transferToId.trim()}
                                                            style={{padding:'8px 14px',borderRadius:'10px',background:'rgba(255,215,0,0.12)',border:'1px solid rgba(255,215,0,0.3)',color:'#ffd700',fontSize:'11px',fontWeight:700,cursor:'pointer',opacity:!transferToId.trim()?0.4:1}}>
                                                            {lang==='ar'?'���':'Transfer'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div style={{fontSize:'11px',color:'#f87171',marginBottom:'8px',textAlign:'center'}}>�️ {lang==='ar'?'�� أ�ت �تأ�د �� ��� ا�����ة�':'Are you sure you want to transfer ownership?'}</div>
                                                        <div style={{display:'flex',gap:'6px'}}>
                                                            <button onClick={handleTransferOwnership} style={{flex:1,padding:'8px',borderRadius:'8px',background:'rgba(255,215,0,0.15)',border:'1px solid rgba(255,215,0,0.3)',color:'#ffd700',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>� {lang==='ar'?'تأ��د':'Confirm'}</button>
                                                            <button onClick={()=>setShowTransferConfirm(false)} style={{flex:1,padding:'8px',borderRadius:'8px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',color:'#9ca3af',fontSize:'11px',cursor:'pointer'}}>� {lang==='ar'?'إ�غاء':'Cancel'}</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* �� MESSAGES �� */}
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
                                // � Red Packet message
                                if(msg.type==='red_packet') {
                                    const isMe=msg.senderId===currentUID;
                                    const vipCfgRP = getVIPConfig(msg.senderVipLevel);
                                    return(
                                        <div key={msg.id} style={{display:'flex',flexDirection:isMe?'row-reverse':'row',gap:'7px',alignItems:'flex-end',marginBottom:'4px'}}>
                                            <div onClick={()=>openGroupMiniProfile(msg.senderId,{name:msg.senderName,photo:msg.senderPhoto})}
                                                style={{width:'28px',height:'28px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',overflow:'hidden',flexShrink:0,cursor:'pointer',border:vipCfgRP?`2px solid ${vipCfgRP.nameColor}`:'2px solid rgba(255,255,255,0.1)'}}>
                                                {msg.senderPhoto?<img src={msg.senderPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px'}}>�</div>}
                                            </div>
                                            <div style={{maxWidth:'min(220px, calc(100vw - 90px))'}}>
                                                <div onClick={()=>openGroupMiniProfile(msg.senderId,{name:msg.senderName,photo:msg.senderPhoto})}
                                                    style={{fontSize:'9px',color:vipCfgRP?vipCfgRP.nameColor:'#a78bfa',fontWeight:700,marginBottom:'3px',paddingLeft:'4px',cursor:'pointer',display:'flex',alignItems:'center',gap:'3px'}}>
                                                    {vipCfgRP && <span style={{fontSize:'7px',fontWeight:900,background:vipCfgRP.nameColor,color:'#000',padding:'0 3px',borderRadius:'2px'}}>VIP{msg.senderVipLevel}</span>}
                                                    {msg.senderName}
                                                    {isMe&&<span style={{fontSize:'8px',color:'#4b5563'}}> ({lang==='ar'?'أ�ت':'you'})</span>}
                                                </div>
                                                <button onClick={()=>claimRedPacket(msg.rpId)} style={{
                                                    display:'flex',alignItems:'center',gap:'10px',padding:'12px 16px',borderRadius:'16px',
                                                    background:`linear-gradient(135deg,rgba(239,68,68,0.25),rgba(185,28,28,0.2))`,
                                                    border:`1px solid rgba(239,68,68,0.5)`,cursor:'pointer',width:'100%',
                                                    boxShadow:`0 4px 16px rgba(239,68,68,0.3)`,
                                                }}>
                                                    <div style={{fontSize:'32px',filter:'drop-shadow(0 0 8px rgba(239,68,68,0.7))'}}>�</div>
                                                    <div style={{flex:1,textAlign:'left'}}>
                                                        <div style={{fontSize:'12px',fontWeight:800,color:'#ffd700'}}>{lang==='ar'?'�غ�ف أح�ر':'Red Packet'}</div>
                                                        <div style={{fontSize:'10px',color:'#fca5a5',marginTop:'2px'}}>{msg.rpAmount?.toLocaleString()} � · {msg.maxClaims} {lang==='ar'?'�ست��':'claims'}</div>
                                                        <div style={{fontSize:'9px',color:'rgba(252,165,165,0.7)',marginTop:'2px'}}>{lang==='ar'?'اضغط ��است�ا�':'Tap to claim'} ��</div>
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
                                                {msg.senderPhoto?<img src={msg.senderPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}>�</div>}
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
                                                    <span style={{fontSize:'9px',color:nameColor,fontWeight:700}}>{msg.senderName}{isMe?` (${lang==='ar'?'أ�ت':'you'})`:''}</span>
                                                    {msg.senderVipLevel > 0 && typeof VIP_CHAT_TITLE_URLS !== 'undefined' && VIP_CHAT_TITLE_URLS?.[msg.senderVipLevel] && (
                                                        <img src={VIP_CHAT_TITLE_URLS[msg.senderVipLevel]} alt="" style={{height:'11px',objectFit:'contain'}}/>
                                                    )}
                                                    {/* Badges � up to 3 */}
                                                    {(msg.senderBadges||[]).slice(0,3).map((b,bi)=>{
                                                        if (!b) return null;
                                                        const badge = typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS.find(a=>a.id===b) : null;
                                                        if (!badge) return null;
                                                        return badge.imageUrl
                                                            ? <img key={bi} src={badge.imageUrl} alt="" onError={e=>e.target.style.display='none'} style={{width:'12px',height:'12px',objectFit:'contain',flexShrink:0}}/>
                                                            : <span key={bi} style={{fontSize:'10px'}}>{badge.icon||'��'}</span>;
                                                    })}
                                                </div>
                                                {msg.senderTitle && <div style={{fontSize:'8px',color:'#fbbf24',marginTop:'1px',fontStyle:'italic',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'140px',textAlign:isMe?'right':'left'}}>{msg.senderTitle}</div>}
                                            </div>
                                            {isImage ? (
                                                <div onClick={()=>{const w=window.open();w.document.write(`<body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${msg.imageData}" style="max-width:100vw;max-height:100vh;object-fit:contain"></body>`);}}
                                                    style={{borderRadius:isMe?'14px 14px 4px 14px':'14px 14px 14px 4px',overflow:'hidden',border:`1px solid ${isMe?'rgba(0,242,255,0.18)':'rgba(255,255,255,0.09)'}`,cursor:'pointer',maxWidth:'min(200px, calc(100vw - 90px))'}}>
                                                    <img src={msg.imageData} alt="�" style={{display:'block',maxWidth:'min(200px, calc(100vw - 90px))',maxHeight:'200px',objectFit:'cover'}}/>
                                                </div>
                                            ) : (
                                                <div style={{padding:'8px 12px',borderRadius:isMe?'14px 4px 14px 14px':'4px 14px 14px 14px',background:isMe?'linear-gradient(135deg,rgba(112,0,255,0.45),rgba(0,242,255,0.2))':'rgba(255,255,255,0.08)',border:isMe?'1px solid rgba(0,242,255,0.2)':'1px solid rgba(255,255,255,0.09)',fontSize:'12px',color:'#e2e8f0',lineHeight:1.5,wordBreak:'break-word'}}>{msg.text}</div>
                                            )}
                                            <div style={{fontSize:'9px',color:'#374151',marginTop:'2px',textAlign:isMe?'right':'left',paddingLeft:'4px',paddingRight:'4px'}}>{fmtTime(msg.createdAt)}</div>
                                        </div>
                                    </div>
                                );
                            })}
                            {messages.length===0&&<div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'8px',color:'#4b5563',paddingTop:'40px'}}><div style={{fontSize:'32px'}}>�</div><div style={{fontSize:'12px'}}>{lang==='ar'?'ابدأ ا��حادثة!':'Say hi!'}</div></div>}
                            <div ref={messagesEndRef}/>
                        </div>

                        {/* �� EMOJI PICKER �� */}
                        {showEmojiPicker && (
                            <div style={{position:'absolute',bottom:'58px',left:0,right:0,background:'#0e1020',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'14px 14px 0 0',padding:'10px',zIndex:Z.MODAL_TOP,boxShadow:'0 -14px 44px rgba(0,0,0,0.8)',maxHeight:'220px',overflowY:'auto'}}>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
                                    <span style={{fontSize:'11px',fontWeight:700,color:'#00f2ff'}}>{lang==='ar'?'اختر إ���ج�':'Select Emoji'}</span>
                                    <button onClick={()=>setShowEmojiPicker(false)} style={{background:'none',border:'none',color:'#9ca3af',cursor:'pointer',fontSize:'14px'}}>�</button>
                                </div>
                                {React.createElement(EmojiPicker, {
                                    show: true,
                                    onClose: () => setShowEmojiPicker(false),
                                    onSelect: (emoji) => { setMsgText(p=>p+emoji); setShowEmojiPicker(false); chatInputRef.current?.focus(); },
                                    lang, inline: true,
                                })}
                            </div>
                        )}

                        {/* �� RED PACKET MODAL � closes on outside click �� */}
                        {showRedPacketModal && (
                            <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.75)',zIndex:80,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end'}}
                                onClick={()=>setShowRedPacketModal(false)}>
                                <div style={{width:'100%',background:'linear-gradient(160deg,#0e0e22,#13122a)',borderRadius:'20px 20px 0 0',border:'1px solid rgba(255,255,255,0.1)',overflow:'hidden',maxHeight:'65%'}}
                                    onClick={e=>e.stopPropagation()}>
                                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
                                        <div style={{fontSize:'13px',fontWeight:800,color:'#ef4444'}}>� {lang==='ar'?'أرس� �غ�ف أح�ر':'Send Red Packet'}</div>
                                        <button onClick={()=>setShowRedPacketModal(false)} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'20px',cursor:'pointer'}}>�</button>
                                    </div>
                                    <div style={{padding:'12px',overflowY:'auto'}}>
                                        <div style={{fontSize:'11px',color:'#6b7280',marginBottom:'10px',textAlign:'center'}}>{lang==='ar'?'رص�د� ا�حا��':'Your balance'}: <span style={{color:'#ffd700',fontWeight:700}}>{(currentUserData?.currency||0).toLocaleString()} �</span></div>
                                        <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
                                            {(typeof RED_PACKETS_CONFIG !== 'undefined' ? RED_PACKETS_CONFIG : []).map(rp=>(
                                                <button key={rp.id} onClick={()=>sendGroupRedPacket(rp)} disabled={sendingRedPacket||(currentUserData?.currency||0)<rp.amount}
                                                    style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderRadius:'12px',background:rp.bg,border:`1px solid ${rp.border}`,cursor:(currentUserData?.currency||0)<rp.amount?'not-allowed':'pointer',opacity:(currentUserData?.currency||0)<rp.amount?0.4:1,textAlign:'left',transition:'all 0.2s'}}>
                                                    {rp.imageURL?<img src={rp.imageURL} alt="" style={{width:'36px',height:'36px',objectFit:'contain'}}/>:<div style={{width:'36px',height:'36px',borderRadius:'10px',background:`${rp.color}20`,border:`1px solid ${rp.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px'}}>�</div>}
                                                    <div style={{flex:1}}>
                                                        <div style={{fontSize:'12px',fontWeight:800,color:rp.color}}>{lang==='ar'?rp.name_ar:rp.name_en}</div>
                                                        <div style={{fontSize:'10px',color:'#9ca3af',marginTop:'1px'}}>{lang==='ar'?rp.desc_ar:rp.desc_en}</div>
                                                    </div>
                                                    <div style={{fontSize:'12px',fontWeight:800,color:rp.color}}>{rp.amount.toLocaleString()} �</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* �� GROUP MINI PROFILE POPUP (Fix 4) �� */}
                        {groupMiniProfile && (
                            <MiniProfilePopup
                                profile={groupMiniProfile}
                                onClose={() => setGroupMiniProfile(null)}
                                currentUID={currentUID}
                                lang={lang}
                                onOpenProfile={onOpenProfile}
                            />
                        )}

                        {/* �� INPUT BAR �� */}
                        <div style={{display:'flex',gap:'5px',padding:'8px 8px',borderTop:'1px solid rgba(255,255,255,0.07)',flexShrink:0,background:'rgba(0,0,0,0.45)',boxSizing:'border-box',width:'100%'}}>
                            <button onClick={()=>setShowEmojiPicker(v=>!v)} style={{width:'34px',height:'34px',borderRadius:'10px',border:`1px solid ${showEmojiPicker?'rgba(0,242,255,0.3)':'rgba(255,255,255,0.08)'}`,background:showEmojiPicker?'rgba(0,242,255,0.12)':'rgba(255,255,255,0.05)',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>�</button>
                            <button onClick={()=>fileInputRef.current?.click()} disabled={uploadingImg} title={lang==='ar'?'إرسا� ص�رة':'Send image'} style={{width:'36px',height:'36px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.05)',cursor:uploadingImg?'wait':'pointer',fontSize:'15px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,opacity:uploadingImg?0.5:1}}>
                                {uploadingImg?'⏳':'�️'}
                            </button>
                            {/* � Red Packet Button */}
                            <button onClick={()=>setShowRedPacketModal(true)} title={lang==='ar'?'�غ�ف أح�ر':'Red Packet'}
                                style={{width:'36px',height:'36px',borderRadius:'10px',border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.1)',cursor:'pointer',fontSize:'17px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                �
                            </button>
                            <input
                                ref={chatInputRef}
                                value={msgText}
                                onChange={e=>setMsgText(e.target.value)}
                                onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),sendMessage())}
                                style={{flex:1,padding:'8px 10px',borderRadius:'12px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:'13px',outline:'none',minWidth:0,width:'100%'}}
                                placeholder={lang==='ar'?'ا�تب رسا�ة...':'Type a message...'}
                            />
                            <button onClick={sendMessage} disabled={!msgText.trim()} style={{width:'38px',height:'38px',borderRadius:'12px',border:'none',cursor:'pointer',flexShrink:0,background:msgText.trim()?'linear-gradient(135deg,#7000ff,#00f2ff)':'rgba(255,255,255,0.06)',color:msgText.trim()?'white':'#6b7280',fontSize:'16px',transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center'}}>�</button>
                        </div>
                    </div>
                </div>
            </PortalModal>

            )}
        </React.Fragment>
        );
    }

    /* �� GROUPS LIST �� */
    const isVIP = currentUserData?.vip?.isActive;
    const maxGroups = isVIP ? 3 : 2;
    const ownedCount = groups.filter(g => g.createdBy === currentUID).length;
    return (
        <div style={{padding:'0 16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                <div style={{fontSize:'10px',color:'#4b5563'}}>
                    {lang==='ar' ? `${ownedCount}/${maxGroups} جر�بات` : `${ownedCount}/${maxGroups} groups`}
                    {!isVIP && <span style={{color:'#a78bfa',marginLeft:'4px',marginRight:'4px'}}>· VIP � 3</span>}
                </div>
                <button onClick={()=>setShowCreate(!showCreate)} style={{display:'flex',alignItems:'center',gap:'6px',padding:'7px 14px',borderRadius:'10px',border:'1px solid rgba(167,139,250,0.4)',background:'rgba(167,139,250,0.12)',color:'#a78bfa',fontSize:'12px',fontWeight:700,cursor:'pointer',opacity:ownedCount>=maxGroups?0.5:1}}>
                    � {lang==='ar'?'جر�ب جد�د':'New Group'}
                </button>
            </div>
            {showCreate&&(
                <div style={{marginBottom:'14px',padding:'14px',background:'rgba(167,139,250,0.06)',border:'1px solid rgba(167,139,250,0.2)',borderRadius:'14px'}}>
                    <div style={{fontSize:'12px',fontWeight:700,color:'#a78bfa',marginBottom:'10px'}}>����� {lang==='ar'?'إ�شاء جر�ب جد�د':'Create New Group'}</div>
                    <div style={{display:'flex',gap:'8px'}}>
                        <div style={{flex:1,position:'relative'}}>
                            <input value={groupName} onChange={e=>setGroupName(e.target.value.slice(0,7))} onKeyDown={e=>e.key==='Enter'&&createGroup()}
                                maxLength={7}
                                style={{width:'100%',padding:'8px 12px',borderRadius:'10px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',color:'white',fontSize:'12px',outline:'none',boxSizing:'border-box'}}
                                placeholder={lang==='ar'?'اس� ا�جر�ب (7 أحرف)...':'Group name (7 chars)...'}/>
                            <span style={{position:'absolute',right:'8px',top:'50%',transform:'translateY(-50%)',fontSize:'9px',color:groupName.length>=7?'#f87171':'#6b7280',fontWeight:700}}>{groupName.length}/7</span>
                        </div>
                        <button onClick={createGroup} disabled={!groupName.trim()||creating}
                            style={{padding:'8px 14px',borderRadius:'10px',border:'none',fontWeight:700,fontSize:'12px',cursor:'pointer',background:groupName.trim()?'linear-gradient(135deg,#7000ff,#a78bfa)':'rgba(255,255,255,0.06)',color:groupName.trim()?'white':'#6b7280'}}>
                            {creating?'...':(lang==='ar'?'إ�شاء':'Create')}
                        </button>
                    </div>
                </div>
            )}
            {loadingGroups?(
                <div style={{textAlign:'center',padding:'32px',color:'#6b7280'}}>⏳</div>
            ):groups.length===0?(
                <div style={{textAlign:'center',padding:'32px',color:'#6b7280'}}>
                    <div style={{fontSize:'36px',marginBottom:'10px'}}>�����</div>
                    <div style={{fontSize:'13px',fontWeight:600,color:'#4b5563',marginBottom:'6px'}}>{lang==='ar'?'�ا جر�بات بعد':'No groups yet'}</div>
                    <div style={{fontSize:'11px'}}>{lang==='ar'?'أ�شئ جر�ب �ادع� أصد�اء�':'Create a group and invite your friends'}</div>
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
                                        {group.photoURL ? <img src={group.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : '�����'}
                                    </div>
                                    {unread&&<div style={{position:'absolute',top:'-2px',right:'-2px',width:'12px',height:'12px',borderRadius:'50%',background:'#a78bfa',border:'2px solid var(--bg-main)',boxShadow:'0 0 6px rgba(167,139,250,0.8)'}}/>}
                                </div>
                                <div style={{flex:1,minWidth:0}}>
                                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'3px'}}>
                                        <div style={{fontSize:'13px',fontWeight:unread?800:600,color:unread?'#e2e8f0':'#9ca3af',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{group.name}</div>
                                        <div style={{fontSize:'9px',color:'#6b7280',flexShrink:0,marginLeft:'6px'}}>{fmtTime(group.lastMessageAt)}</div>
                                    </div>
                                    <div style={{fontSize:'11px',color:'#6b7280',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{group.lastMessage||(lang==='ar'?'�ا رسائ�':'No messages')}</div>
                                    <div style={{fontSize:'9px',color:'#4b5563',marginTop:'2px',display:'flex',alignItems:'center',gap:'6px'}}>
                                        <span>{group.members?.length||1} {lang==='ar'?'عض�':'members'}</span>
                                        <span style={{color:gLvl.color,fontWeight:700}}>{gLvl.icon} Lv.{gLvl.level}</span>
                                    </div>
                                </div>
                                <div style={{fontSize:'16px',color:'#6b7280',flexShrink:0}}>�</div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

