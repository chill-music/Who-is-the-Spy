const BlockedUserItem = ({ uid, onUnblock, lang }) => {
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
                {lang === 'ar' ? 'إلغاء' : 'Unblock'}
            </button>
        </div>
    );
};

// 🌍 COUNTRIES LIST
const COUNTRIES = [
    { code:'SA', flag:'🇸🇦', name_ar:'السعودية',      name_en:'Saudi Arabia' },
    { code:'EG', flag:'🇪🇬', name_ar:'مصر',            name_en:'Egypt' },
    { code:'AE', flag:'🇦🇪', name_ar:'الإمارات',      name_en:'UAE' },
    { code:'KW', flag:'🇰🇼', name_ar:'الكويت',        name_en:'Kuwait' },
    { code:'QA', flag:'🇶🇦', name_ar:'قطر',           name_en:'Qatar' },
    { code:'BH', flag:'🇧🇭', name_ar:'البحرين',       name_en:'Bahrain' },
    { code:'OM', flag:'🇴🇲', name_ar:'عُمان',         name_en:'Oman' },
    { code:'IQ', flag:'🇮🇶', name_ar:'العراق',        name_en:'Iraq' },
    { code:'SY', flag:'🇸🇾', name_ar:'سوريا',         name_en:'Syria' },
    { code:'JO', flag:'🇯🇴', name_ar:'الأردن',        name_en:'Jordan' },
    { code:'LB', flag:'🇱🇧', name_ar:'لبنان',         name_en:'Lebanon' },
    { code:'PS', flag:'🇵🇸', name_ar:'فلسطين',        name_en:'Palestine' },
    { code:'YE', flag:'🇾🇪', name_ar:'اليمن',         name_en:'Yemen' },
    { code:'LY', flag:'🇱🇾', name_ar:'ليبيا',         name_en:'Libya' },
    { code:'TN', flag:'🇹🇳', name_ar:'تونس',          name_en:'Tunisia' },
    { code:'DZ', flag:'🇩🇿', name_ar:'الجزائر',       name_en:'Algeria' },
    { code:'MA', flag:'🇲🇦', name_ar:'المغرب',        name_en:'Morocco' },
    { code:'SD', flag:'🇸🇩', name_ar:'السودان',       name_en:'Sudan' },
    { code:'SO', flag:'🇸🇴', name_ar:'الصومال',       name_en:'Somalia' },
    { code:'MR', flag:'🇲🇷', name_ar:'موريتانيا',     name_en:'Mauritania' },
    { code:'US', flag:'🇺🇸', name_ar:'أمريكا',        name_en:'USA' },
    { code:'GB', flag:'🇬🇧', name_ar:'بريطانيا',      name_en:'UK' },
    { code:'FR', flag:'🇫🇷', name_ar:'فرنسا',         name_en:'France' },
    { code:'DE', flag:'🇩🇪', name_ar:'ألمانيا',       name_en:'Germany' },
    { code:'IT', flag:'🇮🇹', name_ar:'إيطاليا',       name_en:'Italy' },
    { code:'ES', flag:'🇪🇸', name_ar:'إسبانيا',       name_en:'Spain' },
    { code:'CA', flag:'🇨🇦', name_ar:'كندا',          name_en:'Canada' },
    { code:'AU', flag:'🇦🇺', name_ar:'أستراليا',      name_en:'Australia' },
    { code:'TR', flag:'🇹🇷', name_ar:'تركيا',         name_en:'Turkey' },
    { code:'IR', flag:'🇮🇷', name_ar:'إيران',         name_en:'Iran' },
    { code:'PK', flag:'🇵🇰', name_ar:'باكستان',       name_en:'Pakistan' },
    { code:'IN', flag:'🇮🇳', name_ar:'الهند',         name_en:'India' },
    { code:'CN', flag:'🇨🇳', name_ar:'الصين',         name_en:'China' },
    { code:'JP', flag:'🇯🇵', name_ar:'اليابان',       name_en:'Japan' },
    { code:'KR', flag:'🇰🇷', name_ar:'كوريا',         name_en:'South Korea' },
    { code:'BR', flag:'🇧🇷', name_ar:'البرازيل',      name_en:'Brazil' },
    { code:'MX', flag:'🇲🇽', name_ar:'المكسيك',       name_en:'Mexico' },
    { code:'RU', flag:'🇷🇺', name_ar:'روسيا',         name_en:'Russia' },
    { code:'NL', flag:'🇳🇱', name_ar:'هولندا',        name_en:'Netherlands' },
    { code:'SE', flag:'🇸🇪', name_ar:'السويد',        name_en:'Sweden' },
    { code:'NO', flag:'🇳🇴', name_ar:'النرويج',       name_en:'Norway' },
    { code:'CH', flag:'🇨🇭', name_ar:'سويسرا',        name_en:'Switzerland' },
    { code:'NG', flag:'🇳🇬', name_ar:'نيجيريا',       name_en:'Nigeria' },
    { code:'ET', flag:'🇪🇹', name_ar:'إثيوبيا',       name_en:'Ethiopia' },
    { code:'ZA', flag:'🇿🇦', name_ar:'جنوب أفريقيا',  name_en:'South Africa' },
    { code:'ID', flag:'🇮🇩', name_ar:'إندونيسيا',     name_en:'Indonesia' },
    { code:'MY', flag:'🇲🇾', name_ar:'ماليزيا',       name_en:'Malaysia' },
    { code:'PH', flag:'🇵🇭', name_ar:'الفلبين',       name_en:'Philippines' },
];

// 🌍 Country Picker Component — Flag Grid
const CountryPicker = ({ selected, onSelect, lang }) => {
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
                placeholder={lang === 'ar' ? '🔍 ابحث...' : '🔍 Search...'}
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

// 🎉 ONBOARDING MODAL - New User Setup
const OnboardingModal = ({ show, googleUser, onComplete, lang }) => {
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
                    <div className="onboarding-spy-icon">🕵️</div>
                    <h2 className="onboarding-title">{lang === 'ar' ? 'مرحباً في PRO SPY!' : 'Welcome to PRO SPY!'}</h2>
                    <p className="onboarding-subtitle">{lang === 'ar' ? 'أكمل ملفك الشخصي للبدء' : 'Complete your profile to start'}</p>
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
                                <span className="onboarding-camera-icon">📷</span>
                            </div>
                        </div>
                        <input type="file" ref={fileRef} style={{ display: 'none' }} accept="image/*" onChange={handlePhotoChange} />
                        <p className="onboarding-photo-hint">{lang === 'ar' ? 'اضغط لتغيير الصورة' : 'Tap to change photo'}</p>
                    </div>

                    {/* Name Input */}
                    <div className="onboarding-field">
                        <label className="onboarding-label">
                            {lang === 'ar' ? '✏️ اسمك في اللعبة' : '✏️ Your display name'}
                        </label>
                        <input
                            className="onboarding-input"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            placeholder={lang === 'ar' ? 'أدخل اسمك...' : 'Enter your name...'}
                            maxLength={10}
                        />
                    </div>

                    {/* Gender Selection */}
                    <div className="onboarding-field">
                        <label className="onboarding-label">
                            {lang === 'ar' ? '👤 الجنس' : '👤 Gender'}
                        </label>
                        <div className="onboarding-gender-row">
                            <button
                                className={`onboarding-gender-btn ${gender === 'male' ? 'active' : ''}`}
                                onClick={() => setGender('male')}
                            >
                                <span style={{fontSize:'28px'}}>👨</span>
                                <span>{lang === 'ar' ? 'ذكر' : 'Male'}</span>
                            </button>
                            <button
                                className={`onboarding-gender-btn ${gender === 'female' ? 'active' : ''}`}
                                onClick={() => setGender('female')}
                            >
                                <span style={{fontSize:'28px'}}>👩</span>
                                <span>{lang === 'ar' ? 'أنثى' : 'Female'}</span>
                            </button>
                        </div>
                    </div>
                    {/* Country Selection */}
                    <div className="onboarding-field">
                        <label className="onboarding-label">
                            {lang === 'ar' ? '🌍 دولتك' : '🌍 Your Country'}
                            <span style={{ color: '#6b7280', fontWeight: 400, fontSize: '11px', marginRight: '4px', marginLeft: '4px' }}>
                                ({lang === 'ar' ? 'اختياري' : 'optional'})
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
                                    <span style={{ color: '#6b7280' }}>{lang === 'ar' ? '— اختر دولتك —' : '— Select your country —'}</span>
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
                                    {lang === 'ar' ? '✕ إغلاق' : '✕ Close'}
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
                        {lang === 'ar' ? '🚀 ابدأ اللعب!' : '🚀 Start Playing!'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DailyTasksComponent = ({ userData, user, lang, onClaim, onNotification }) => {
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
        if (status === 'claimed') { onNotification(lang==='ar'?'✅ استلمت بالفعل':'✅ Already claimed'); return; }
        if (status === 'vip_locked') { onNotification(lang==='ar'?'👑 حصري لـ VIP':'👑 VIP Exclusive'); return; }
        if (status === 'locked') {
            const requiredMin = Math.ceil(box.duration/60000);
            const remaining = requiredMin - minutesOnline;
            onNotification(lang==='ar'?`⏳ بعد ${remaining} دقيقة`:`⏳ In ${remaining} min`);
            return;
        }
        try {
            const updates = {};
            updates[`dailyTasks.boxes.${box.id-1}.status`] = 'claimed';
            updates[`dailyTasks.boxes.${box.id-1}.claimedAt`] = firebase.firestore.FieldValue.serverTimestamp();
            if (box.reward.type === 'currency') updates['currency'] = firebase.firestore.FieldValue.increment(box.reward.amount);
            await usersCollection.doc(user.uid).update(updates);
            onNotification(`✅ +${box.reward.amount} 🧠`);
        } catch(err) { onNotification(lang==='ar'?'❌ خطأ':'❌ Error'); }
    };

    return (
        <div style={{ padding:'0' }}>
            {/* ── Header row ── */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'linear-gradient(135deg,rgba(0,242,255,0.2),rgba(112,0,255,0.15))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>📦</div>
                    <div>
                        <div style={{ fontSize:'13px', fontWeight:800, color:'#e2e8f0' }}>{lang==='ar'?'مهام اليوم':'Daily Tasks'}</div>
                        <div style={{ fontSize:'10px', color:'#64748b', marginTop:'1px' }}>
                            {lang==='ar'?`${minutesOnline} دقيقة أون لاين`:`${minutesOnline} min online`}
                        </div>
                    </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    {availableCount > 0 && (
                        <div style={{ fontSize:'9px', fontWeight:800, background:'rgba(0,242,255,0.15)', border:'1px solid rgba(0,242,255,0.35)', color:'#00f2ff', borderRadius:'20px', padding:'2px 8px' }}>
                            {availableCount} {lang==='ar'?'متاح':'ready'}
                        </div>
                    )}
                    <div style={{ fontSize:'10px', color:'#6b7280' }}>{claimedCount}/{DAILY_TASKS_CONFIG.length}</div>
                </div>
            </div>

            {/* ── Progress bar total ── */}
            <div style={{ height:'4px', background:'rgba(255,255,255,0.06)', borderRadius:'4px', marginBottom:'14px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${(claimedCount/DAILY_TASKS_CONFIG.length)*100}%`, background:'linear-gradient(90deg,#00f2ff,#7000ff)', transition:'width 0.6s ease' }} />
            </div>

            {/* ── 8 Chest Boxes ── */}
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
                                {isClaimed ? '📭' : isAvailable ? '📬' : isVipLocked ? '🔒' : '📪'}
                            </div>

                            {/* Reward */}
                            <div style={{
                                fontSize:'9px', fontWeight:900, marginBottom:'2px',
                                color: isClaimed ? '#4ade80' : isAvailable ? '#00f2ff' : isVipLocked ? '#f87171' : '#4b5563'
                            }}>
                                {isClaimed ? '✓' : isVipLocked ? 'VIP' : `+${box.reward.amount}`}
                            </div>

                            {/* Time / icon */}
                            <div style={{ fontSize:'8px', color: isClaimed?'#4ade8099':isAvailable?'#00f2ff88':'#374151' }}>
                                {isClaimed ? box.reward.icon : isVipLocked ? '👑' : timeLabel || box.reward.icon}
                            </div>

                            {/* Available badge — pulsing dot */}
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

const LoginRewardsComponent = ({ userData, user, lang, onNotification }) => {
    const t = TRANSLATIONS[lang] || {};
    const rewards = userData?.loginRewards || {};

    const handleClaimDay = async (day) => {
        if ((rewards.claimedDays || []).includes(day)) {
            return onNotification(lang === 'ar' ? '✅ استلمت بالفعل' : '✅ Already claimed');
        }

        const lastClaim = rewards.lastClaimDate?.toDate?.() || new Date(0);
        const hoursSinceLastClaim = (Date.now() - lastClaim.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastClaim < 23) {
            return onNotification(lang === 'ar' ? '⏳ عد إلى الغد' : '⏳ Come back tomorrow');
        }

        try {
            const rewardData = LOGIN_REWARDS_CONFIG.dailyRewards.find(r => r.day === day);
            const updates = {
                'loginRewards.currentDay': day,
                'loginRewards.lastClaimDate': firebase.firestore.FieldValue.serverTimestamp(),
                'loginRewards.claimedDays': firebase.firestore.FieldValue.arrayUnion(day),
                'currency': firebase.firestore.FieldValue.increment(rewardData?.reward || 100)
            };

            await usersCollection.doc(user.uid).update(updates);
            onNotification(`✅ +${rewardData?.reward} ${lang === 'ar' ? 'تم الاستلام!' : 'Claimed!'}`);
        } catch (error) {
            onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error');
        }
    };

    return (
        <div style={{ padding: '12px', background: 'rgba(255,215,0,0.08)', borderRadius: '8px', marginBottom: '12px' }}>
            <h3 style={{ color: '#ffd700', marginBottom: '8px', fontSize: '12px', fontWeight: 800 }}>
                {lang === 'ar' ? '🎁 مكافآت الدخول' : '🎁 Login Rewards'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(40px, 1fr))', gap: '6px' }}>
                {LOGIN_REWARDS_CONFIG.dailyRewards.slice(0, 7).map(reward => (
                    <button
                        key={reward.day}
                        onClick={() => handleClaimDay(reward.day)}
                        style={{
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid',
                            background: (rewards.claimedDays || []).includes(reward.day) ? 'rgba(74,222,128,0.2)' : 'rgba(255,215,0,0.1)',
                            borderColor: (rewards.claimedDays || []).includes(reward.day) ? 'rgba(74,222,128,0.5)' : 'rgba(255,215,0,0.3)',
                            color: (rewards.claimedDays || []).includes(reward.day) ? '#4ade80' : '#ffd700',
                            cursor: 'pointer',
                            fontSize: '10px',
                            fontWeight: 700,
                            textAlign: 'center'
                        }}
                    >
                        <div>{reward.icon}</div>
                        <div>{reward.day}</div>
                        {(rewards.claimedDays || []).includes(reward.day) && <div style={{fontSize: '9px'}}>✓</div>}
                    </button>
                ))}
            </div>
        </div>
    );
};

// AchievementsDisplayComponent removed - use AchievementsDisplayV11 instead

// 🎮 MAIN APP COMPONENT

// ════════════════════════════════════════════════════════
// 👨‍👩‍👧 GROUPS SECTION — Group Chat System
// ════════════════════════════════════════════════════════
const groupsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('group_chats');

// ── Group Level System ──
const GROUP_LEVEL_CONFIG = [
    { level:1,  xp:0,    icon:'🌱', name_en:'Seed',    name_ar:'بذرة',   color:'#4ade80' },
    { level:2,  xp:50,   icon:'🌿', name_en:'Sprout',  name_ar:'نبتة',   color:'#22d3ee' },
    { level:3,  xp:150,  icon:'🌳', name_en:'Tree',    name_ar:'شجرة',   color:'#34d399' },
    { level:4,  xp:300,  icon:'⭐', name_en:'Star',    name_ar:'نجمة',   color:'#fbbf24' },
    { level:5,  xp:500,  icon:'💎', name_en:'Diamond', name_ar:'ماسة',   color:'#60a5fa' },
    { level:6,  xp:800,  icon:'👑', name_en:'Crown',   name_ar:'تاج',    color:'#ffd700' },
    { level:7,  xp:1200, icon:'🔥', name_en:'Flame',   name_ar:'لهب',    color:'#f97316' },
    { level:8,  xp:2000, icon:'⚡', name_en:'Thunder', name_ar:'رعد',    color:'#a78bfa' },
    { level:9,  xp:3500, icon:'🌌', name_en:'Galaxy',  name_ar:'مجرة',   color:'#818cf8' },
    { level:10, xp:5000, icon:'🏆', name_en:'Legend',  name_ar:'أسطورة', color:'#00d4ff' },
];
const getGroupLevel = (xp = 0) => {
    let cfg = GROUP_LEVEL_CONFIG[0];
    for (let i = GROUP_LEVEL_CONFIG.length - 1; i >= 0; i--) {
        if (xp >= GROUP_LEVEL_CONFIG[i].xp) { cfg = GROUP_LEVEL_CONFIG[i]; break; }
    }
    return cfg;
};
const getGroupLevelProgress = (xp = 0) => {
    const cur = getGroupLevel(xp);
    const nextCfg = GROUP_LEVEL_CONFIG.find(c => c.level === cur.level + 1);
    if (!nextCfg) return 100;
    return Math.min(100, Math.round(((xp - cur.xp) / (nextCfg.xp - cur.xp)) * 100));
};

const GroupsSection = ({ currentUser, currentUserData, currentUID, friendsData, lang, onNotification, isLoggedIn, onOpenProfile }) => {
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
    const messagesEndRef = React.useRef(null);
    const chatInputRef = React.useRef(null);
    const fileInputRef = React.useRef(null);
    const groupImgInputRef = React.useRef(null);

    // ✅ No orderBy → no index needed, sort client-side
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
            [`readBy.${currentUID}`]: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(() => {});
        return () => unsub();
    }, [activeGroup?.id]);

    const createGroup = async () => {
        if (!groupName.trim() || !currentUID || creating) return;
        if (groupName.trim().length > 7) {
            onNotification(lang === 'ar' ? '❌ اسم الجروب 7 أحرف كحد أقصى' : '❌ Group name max 7 chars');
            return;
        }
        // ── Check group limit ──
        const isVIP = currentUserData?.vip?.isActive;
        const maxGroups = isVIP ? 3 : 2;
        const myOwnedGroups = groups.filter(g => g.createdBy === currentUID);
        if (myOwnedGroups.length >= maxGroups) {
            onNotification(lang === 'ar'
                ? `❌ وصلت للحد الأقصى (${maxGroups} جروبات)${!isVIP ? ' · VIP يحصل على 3' : ''}`
                : `❌ Max groups reached (${maxGroups})${!isVIP ? ' · VIP gets 3' : ''}`
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
                lastMessage: lang === 'ar' ? '🎉 تم إنشاء الجروب' : '🎉 Group created',
                lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastMessageAtMs: nowMs,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                readBy: { [currentUID]: firebase.firestore.FieldValue.serverTimestamp() },
                xp: 0,
                level: 1,
            });
            setGroupName(''); setShowCreate(false);
            onNotification(lang === 'ar' ? '✅ تم إنشاء الجروب!' : '✅ Group created!');
        } catch (e) {
            console.error('createGroup error:', e);
            onNotification(lang === 'ar' ? '❌ خطأ في الإنشاء' : '❌ Error creating group');
        }
        setCreating(false);
    };

    const inviteFriend = async (friendId) => {
        if (!activeGroup) return;
        if (activeGroup.members?.includes(friendId)) {
            onNotification(lang === 'ar' ? 'هذا الشخص موجود بالفعل' : 'Already a member'); return;
        }
        try {
            await groupsCollection.doc(activeGroup.id).update({
                members: firebase.firestore.FieldValue.arrayUnion(friendId)
            });
            const friend = friendsData.find(f => f.id === friendId);
            await groupsCollection.doc(activeGroup.id).collection('messages').add({
                text: lang === 'ar' ? `تمت إضافة ${friend?.displayName || 'عضو'}` : `${friend?.displayName || 'Member'} was added`,
                senderId: 'system', senderName: 'System',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(), type: 'system'
            });
            onNotification(lang === 'ar' ? '✅ تمت الدعوة!' : '✅ Invited!');
            setShowInvite(false);
            setActiveGroup(g => ({ ...g, members: [...(g.members || []), friendId] }));
        } catch (e) { onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
    };

    const sendMessage = async () => {
        if (!msgText.trim() || !activeGroup || !currentUID) return;
        const text = msgText.trim();
        setMsgText('');
        try {
            const nowMs = Date.now();
            const senderVipLevel = (typeof getVIPLevel === 'function' ? (getVIPLevel(currentUserData) || 0) : 0);
            const senderTitle = currentUserData?.activeTitle || currentUserData?.title || null;
            await groupsCollection.doc(activeGroup.id).collection('messages').add({
                text, senderId: currentUID,
                senderName: currentUserData?.displayName || 'User',
                senderPhoto: currentUserData?.photoURL || null,
                senderVipLevel,
                senderTitle,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(), type: 'text'
            });
            // ── XP + level update ──
            const newXP = (activeGroup.xp || 0) + 1;
            const newLevel = getGroupLevel(newXP);
            await groupsCollection.doc(activeGroup.id).update({
                lastMessage: text, lastSenderId: currentUID,
                lastSenderName: currentUserData?.displayName || 'User',
                lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastMessageAtMs: nowMs,
                xp: firebase.firestore.FieldValue.increment(1),
                level: newLevel.level,
                [`readBy.${currentUID}`]: firebase.firestore.FieldValue.serverTimestamp()
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
                text: '📷', senderId: currentUID,
                senderName: currentUserData?.displayName || 'User',
                senderPhoto: currentUserData?.photoURL || null,
                type: 'image', imageData: base64,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            await groupsCollection.doc(activeGroup.id).update({
                lastMessage: '📷 Photo', lastSenderId: currentUID,
                lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastMessageAtMs: nowMs,
                [`readBy.${currentUID}`]: firebase.firestore.FieldValue.serverTimestamp()
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
            onNotification(lang === 'ar' ? '✅ تم تغيير صورة الجروب' : '✅ Group photo updated');
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
            onNotification(lang === 'ar' ? '✅ تم ترقية العضو لأدمن' : '✅ Member promoted to admin');
        } catch (e) { onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
    };

    const removeAdmin = async (memberId) => {
        if (!activeGroup || !currentUID) return;
        try {
            await groupsCollection.doc(activeGroup.id).update({
                admins: firebase.firestore.FieldValue.arrayRemove(memberId)
            });
            setActiveGroup(g => ({ ...g, admins: (g.admins || []).filter(id => id !== memberId) }));
            onNotification(lang === 'ar' ? '✅ تم إزالة الأدمن' : '✅ Admin removed');
        } catch (e) { onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
    };

    // Load member details when showing the details panel
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
            <div style={{fontSize:'32px',marginBottom:'10px'}}>🔐</div>
            <div style={{fontSize:'12px'}}>{lang==='ar'?'سجّل دخول للوصول للجروبات':'Login to access groups'}</div>
        </div>
    );

    /* ── CHAT VIEW — as portal overlay so it doesn't affect parent layout ── */
    if (activeGroup) {
        const isOwner = activeGroup.createdBy === currentUID;
        const isAdm = activeGroup.admins?.includes(currentUID);
        const grpLvl = getGroupLevel(activeGroup.xp || 0);
        return (
            <PortalModal>
                {/* hidden inputs */}
                <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImageSelect} />
                <input ref={groupImgInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleGroupPhotoUpload} />

                <div style={{
                    position:'fixed', inset:0, zIndex:Z.MODAL_HIGH,
                    background:'rgba(0,0,0,0.7)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                    <div style={{
                        display:'flex', flexDirection:'column',
                        width:'100%', maxWidth:'440px',
                        height:'88vh', maxHeight:'700px',
                        background:'linear-gradient(160deg,rgba(5,5,18,0.99),rgba(9,8,26,0.99))',
                        border:'1px solid rgba(255,255,255,0.09)',
                        borderRadius:'20px', overflow:'hidden',
                        boxShadow:'0 28px 70px rgba(0,0,0,0.9)',
                        margin:'auto', position:'relative',
                    }}>
                        {/* ── HEADER ── */}
                        <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'11px 14px',background:'rgba(7,7,22,1)',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0}}>
                            <button onClick={()=>setActiveGroup(null)} style={{background:'none',border:'none',color:'#00f2ff',fontSize:'20px',cursor:'pointer',padding:'0 4px',lineHeight:1}}>‹</button>
                            <div
                                onClick={()=>setShowDetails(true)}
                                style={{width:'38px',height:'38px',borderRadius:'50%',background:'linear-gradient(135deg,rgba(167,139,250,0.3),rgba(112,0,255,0.2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',flexShrink:0,overflow:'hidden',cursor:'pointer'}}
                            >
                                {activeGroup.photoURL
                                    ? <img src={activeGroup.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                                    : '👨‍👩‍👧'}
                            </div>
                            <div style={{flex:1,minWidth:0,cursor:'pointer'}} onClick={()=>setShowDetails(true)}>
                                <div style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{activeGroup.name}</div>
                                <div style={{fontSize:'10px',color:'#6b7280',display:'flex',alignItems:'center',gap:'6px'}}>
                                    <span>{activeGroup.members?.length||1} {lang==='ar'?'عضو':'members'}</span>
                                    <span style={{color:grpLvl.color,fontWeight:700}}>{grpLvl.icon} Lv.{grpLvl.level}</span>
                                </div>
                            </div>
                            {isAdm && <button onClick={()=>setShowInvite(true)} style={{background:'rgba(167,139,250,0.15)',border:'1px solid rgba(167,139,250,0.3)',borderRadius:'8px',padding:'5px 10px',color:'#a78bfa',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>+ {lang==='ar'?'دعوة':'Invite'}</button>}
                        </div>

                        {/* ── INVITE OVERLAY ── */}
                        {showInvite && (
                            <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(5,5,20,0.97)',zIndex:50,display:'flex',flexDirection:'column',padding:'16px'}}>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                                    <div style={{fontSize:'14px',fontWeight:800,color:'#a78bfa'}}>👥 {lang==='ar'?'دعوة صديق':'Invite Friend'}</div>
                                    <button onClick={()=>setShowInvite(false)} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'20px',cursor:'pointer'}}>✕</button>
                                </div>
                                <div style={{overflowY:'auto',flex:1}}>
                                    {friendsData.filter(f=>!(activeGroup.members||[]).includes(f.id)).length===0
                                        ? <div style={{textAlign:'center',padding:'20px',color:'#6b7280',fontSize:'12px'}}>{lang==='ar'?'لا يوجد أصدقاء لدعوتهم':'No friends to invite'}</div>
                                        : friendsData.filter(f=>!(activeGroup.members||[]).includes(f.id)).map(friend=>(
                                            <div key={friend.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                                                <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',overflow:'hidden',flexShrink:0}}>
                                                    {friend.photoURL?<img src={friend.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>😎</div>}
                                                </div>
                                                <div style={{flex:1,fontSize:'13px',color:'#e2e8f0',fontWeight:600}}>{friend.displayName}</div>
                                                <button onClick={()=>inviteFriend(friend.id)} style={{background:'rgba(167,139,250,0.2)',border:'1px solid rgba(167,139,250,0.4)',borderRadius:'8px',padding:'5px 12px',color:'#a78bfa',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>+ {lang==='ar'?'أضف':'Add'}</button>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )}

                        {/* ── DETAILS PANEL ── */}
                        {showDetails && (
                            <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(5,5,20,0.98)',zIndex:50,display:'flex',flexDirection:'column',overflow:'hidden'}}>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0}}>
                                    <div style={{fontSize:'14px',fontWeight:800,color:'#a78bfa'}}>ℹ️ {lang==='ar'?'تفاصيل الجروب':'Group Details'}</div>
                                    <button onClick={()=>setShowDetails(false)} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'20px',cursor:'pointer'}}>✕</button>
                                </div>
                                <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
                                    {/* Group photo */}
                                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'16px',gap:'10px'}}>
                                        <div style={{position:'relative'}}>
                                            <div style={{width:'72px',height:'72px',borderRadius:'50%',background:'linear-gradient(135deg,rgba(167,139,250,0.3),rgba(112,0,255,0.2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'36px',overflow:'hidden',border:'2px solid rgba(167,139,250,0.3)'}}>
                                                {activeGroup.photoURL
                                                    ? <img src={activeGroup.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                                                    : '👨‍👩‍👧'}
                                            </div>
                                            {isAdm && (
                                                <button onClick={()=>groupImgInputRef.current?.click()} style={{position:'absolute',bottom:0,right:0,width:'24px',height:'24px',borderRadius:'50%',background:'#a78bfa',border:'2px solid rgba(5,5,20,1)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'12px'}}>📷</button>
                                            )}
                                        </div>
                                        <div style={{fontSize:'16px',fontWeight:800,color:'white'}}>{activeGroup.name}</div>
                                        <div style={{display:'flex',gap:'8px',fontSize:'11px',color:'#6b7280'}}>
                                            <span>{activeGroup.members?.length||1} {lang==='ar'?'عضو':'members'}</span>
                                            <span>·</span>
                                            <span style={{color:grpLvl.color,fontWeight:700}}>{grpLvl.icon} Lv.{grpLvl.level}</span>
                                        </div>
                                    </div>

                                    {/* Members list */}
                                    <div style={{fontSize:'11px',fontWeight:700,color:'#6b7280',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.5px'}}>
                                        👥 {lang==='ar'?'الأعضاء':'Members'} ({activeGroup.members?.length||0})
                                    </div>
                                    {loadingMembers ? (
                                        <div style={{textAlign:'center',padding:'20px',color:'#6b7280'}}>⏳</div>
                                    ) : membersData.map(member => {
                                        const isMemberAdm = (activeGroup.admins||[]).includes(member.id);
                                        const isMemberOwner = activeGroup.createdBy === member.id;
                                        return (
                                            <div key={member.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                                                <div style={{width:'38px',height:'38px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',overflow:'hidden',flexShrink:0}}>
                                                    {member.photoURL?<img src={member.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>😎</div>}
                                                </div>
                                                <div style={{flex:1,minWidth:0}}>
                                                    <div style={{fontSize:'13px',fontWeight:700,color:'white',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{member.displayName||'User'}</div>
                                                    <div style={{fontSize:'10px',color: isMemberOwner?'#ffd700':isMemberAdm?'#ef4444':'#6b7280', fontWeight:700}}>
                                                        {isMemberOwner ? '👑 '+(lang==='ar'?'مالك':'Owner') : isMemberAdm ? '🛡️ '+(lang==='ar'?'أدمن':'Admin') : '👤 '+(lang==='ar'?'عضو':'Member')}
                                                    </div>
                                                </div>
                                                {/* Admin management - only owner can manage admins */}
                                                {isOwner && !isMemberOwner && (
                                                    isMemberAdm ? (
                                                        <button onClick={()=>removeAdmin(member.id)} style={{background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'7px',padding:'4px 9px',color:'#f87171',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>
                                                            {lang==='ar'?'إزالة':'Remove'}
                                                        </button>
                                                    ) : (
                                                        <button onClick={()=>makeAdmin(member.id)} style={{background:'rgba(167,139,250,0.15)',border:'1px solid rgba(167,139,250,0.3)',borderRadius:'7px',padding:'4px 9px',color:'#a78bfa',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>
                                                            {lang==='ar'?'أدمن':'Admin'}
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── MESSAGES ── */}
                        <div style={{flex:1,overflowY:'auto',padding:'12px 10px',display:'flex',flexDirection:'column',gap:'4px',background:'linear-gradient(180deg,rgba(5,5,16,0.98),rgba(8,8,22,0.98))'}}>
                            {messages.map(msg=>{
                                if(msg.type==='system') return(
                                    <div key={msg.id} style={{textAlign:'center',fontSize:'10px',color:'#6b7280',padding:'3px 12px',background:'rgba(255,255,255,0.04)',borderRadius:'20px',alignSelf:'center',maxWidth:'80%'}}>{msg.text}</div>
                                );
                                const isMe=msg.senderId===currentUID;
                                const isImage=msg.type==='image';
                                return(
                                    <div key={msg.id} style={{display:'flex',flexDirection:isMe?'row-reverse':'row',gap:'7px',alignItems:'flex-end'}}>
                                        {!isMe&&<div
                                            onClick={()=>onOpenProfile && onOpenProfile(msg.senderId)}
                                            style={{width:'26px',height:'26px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',overflow:'hidden',flexShrink:0,cursor:onOpenProfile?'pointer':'default'}}>
                                            {msg.senderPhoto?<img src={msg.senderPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px'}}>😎</div>}
                                        </div>}
                                        <div style={{maxWidth:'72%'}}>
                                            {!isMe&&<div style={{marginBottom:'2px',paddingLeft:'4px'}}>
                                                <div style={{display:'flex',alignItems:'center',gap:'4px',flexWrap:'wrap',cursor:onOpenProfile?'pointer':'default'}} onClick={()=>onOpenProfile && onOpenProfile(msg.senderId)}>
                                                    <span style={{fontSize:'9px',color:'#a78bfa',fontWeight:700}}>{msg.senderName}</span>
                                                    {msg.senderVipLevel > 0 && typeof VIP_CONFIG !== 'undefined' && VIP_CONFIG && (
                                                        <span style={{fontSize:'7px',fontWeight:900,background:VIP_CONFIG[Math.min(msg.senderVipLevel-1,VIP_CONFIG.length-1)]?.nameColor||'#7c3aed',color:'#000',padding:'1px 3px',borderRadius:'2px',flexShrink:0}}>
                                                            VIP{msg.senderVipLevel}
                                                        </span>
                                                    )}
                                                    {msg.senderVipLevel > 0 && typeof VIP_CHAT_TITLE_URLS !== 'undefined' && VIP_CHAT_TITLE_URLS?.[msg.senderVipLevel] && (
                                                        <img src={VIP_CHAT_TITLE_URLS[msg.senderVipLevel]} alt="" style={{height:'12px',objectFit:'contain'}}/>
                                                    )}
                                                </div>
                                                {msg.senderTitle && <div style={{fontSize:'8px',color:'#fbbf24',marginTop:'1px',fontStyle:'italic',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'140px'}}>{msg.senderTitle}</div>}
                                            </div>}
                                            {isImage ? (
                                                <div onClick={()=>{const w=window.open();w.document.write(`<body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${msg.imageData}" style="max-width:100vw;max-height:100vh;object-fit:contain"></body>`);}}
                                                    style={{borderRadius:isMe?'14px 14px 4px 14px':'14px 14px 14px 4px',overflow:'hidden',border:`1px solid ${isMe?'rgba(0,242,255,0.18)':'rgba(255,255,255,0.09)'}`,cursor:'pointer',maxWidth:'200px'}}>
                                                    <img src={msg.imageData} alt="📷" style={{display:'block',maxWidth:'200px',maxHeight:'200px',objectFit:'cover'}}/>
                                                </div>
                                            ) : (
                                                <div style={{padding:'8px 12px',borderRadius:isMe?'14px 4px 14px 14px':'4px 14px 14px 14px',background:isMe?'linear-gradient(135deg,rgba(112,0,255,0.45),rgba(0,242,255,0.2))':'rgba(255,255,255,0.08)',border:isMe?'1px solid rgba(0,242,255,0.2)':'1px solid rgba(255,255,255,0.09)',fontSize:'12px',color:'#e2e8f0',lineHeight:1.5,wordBreak:'break-word'}}>{msg.text}</div>
                                            )}
                                            <div style={{fontSize:'9px',color:'#374151',marginTop:'2px',textAlign:isMe?'right':'left',paddingLeft:'4px',paddingRight:'4px'}}>{fmtTime(msg.createdAt)}</div>
                                        </div>
                                    </div>
                                );
                            })}
                            {messages.length===0&&<div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'8px',color:'#4b5563',paddingTop:'40px'}}><div style={{fontSize:'32px'}}>💬</div><div style={{fontSize:'12px'}}>{lang==='ar'?'ابدأ المحادثة!':'Say hi!'}</div></div>}
                            <div ref={messagesEndRef}/>
                        </div>

                        {/* ── EMOJI PICKER ── */}
                        {showEmojiPicker && (
                            <div style={{position:'absolute',bottom:'58px',left:0,right:0,background:'#0e1020',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'14px 14px 0 0',padding:'10px',zIndex:Z.MODAL_TOP,boxShadow:'0 -14px 44px rgba(0,0,0,0.8)',maxHeight:'220px',overflowY:'auto'}}>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
                                    <span style={{fontSize:'11px',fontWeight:700,color:'#00f2ff'}}>{lang==='ar'?'اختر إيموجي':'Select Emoji'}</span>
                                    <button onClick={()=>setShowEmojiPicker(false)} style={{background:'none',border:'none',color:'#9ca3af',cursor:'pointer',fontSize:'14px'}}>✕</button>
                                </div>
                                {React.createElement(EmojiPicker, {
                                    show: true,
                                    onClose: () => setShowEmojiPicker(false),
                                    onSelect: (emoji) => { setMsgText(p=>p+emoji); setShowEmojiPicker(false); chatInputRef.current?.focus(); },
                                    lang, inline: true,
                                })}
                            </div>
                        )}

                        {/* ── INPUT BAR ── */}
                        <div style={{display:'flex',gap:'6px',padding:'10px 12px',borderTop:'1px solid rgba(255,255,255,0.07)',flexShrink:0,background:'rgba(0,0,0,0.45)'}}>
                            <button onClick={()=>setShowEmojiPicker(v=>!v)} style={{width:'36px',height:'36px',borderRadius:'10px',border:`1px solid ${showEmojiPicker?'rgba(0,242,255,0.3)':'rgba(255,255,255,0.08)'}`,background:showEmojiPicker?'rgba(0,242,255,0.12)':'rgba(255,255,255,0.05)',cursor:'pointer',fontSize:'17px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>😀</button>
                            <button onClick={()=>fileInputRef.current?.click()} disabled={uploadingImg} title={lang==='ar'?'إرسال صورة':'Send image'} style={{width:'36px',height:'36px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.05)',cursor:uploadingImg?'wait':'pointer',fontSize:'15px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,opacity:uploadingImg?0.5:1}}>
                                {uploadingImg?'⏳':'🖼️'}
                            </button>
                            <input
                                ref={chatInputRef}
                                value={msgText}
                                onChange={e=>setMsgText(e.target.value)}
                                onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),sendMessage())}
                                style={{flex:1,padding:'9px 14px',borderRadius:'12px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:'13px',outline:'none'}}
                                placeholder={lang==='ar'?'اكتب رسالة...':'Type a message...'}
                            />
                            <button onClick={sendMessage} disabled={!msgText.trim()} style={{width:'38px',height:'38px',borderRadius:'12px',border:'none',cursor:'pointer',flexShrink:0,background:msgText.trim()?'linear-gradient(135deg,#7000ff,#00f2ff)':'rgba(255,255,255,0.06)',color:msgText.trim()?'white':'#6b7280',fontSize:'16px',transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center'}}>➤</button>
                        </div>
                    </div>
                </div>
            </PortalModal>
        );
    }

    /* ── GROUPS LIST ── */
    const isVIP = currentUserData?.vip?.isActive;
    const maxGroups = isVIP ? 3 : 2;
    const ownedCount = groups.filter(g => g.createdBy === currentUID).length;
    return (
        <div style={{padding:'0 16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                <div style={{fontSize:'10px',color:'#4b5563'}}>
                    {lang==='ar' ? `${ownedCount}/${maxGroups} جروبات` : `${ownedCount}/${maxGroups} groups`}
                    {!isVIP && <span style={{color:'#a78bfa',marginLeft:'4px',marginRight:'4px'}}>· VIP → 3</span>}
                </div>
                <button onClick={()=>setShowCreate(!showCreate)} style={{display:'flex',alignItems:'center',gap:'6px',padding:'7px 14px',borderRadius:'10px',border:'1px solid rgba(167,139,250,0.4)',background:'rgba(167,139,250,0.12)',color:'#a78bfa',fontSize:'12px',fontWeight:700,cursor:'pointer',opacity:ownedCount>=maxGroups?0.5:1}}>
                    ➕ {lang==='ar'?'جروب جديد':'New Group'}
                </button>
            </div>
            {showCreate&&(
                <div style={{marginBottom:'14px',padding:'14px',background:'rgba(167,139,250,0.06)',border:'1px solid rgba(167,139,250,0.2)',borderRadius:'14px'}}>
                    <div style={{fontSize:'12px',fontWeight:700,color:'#a78bfa',marginBottom:'10px'}}>👨‍👩‍👧 {lang==='ar'?'إنشاء جروب جديد':'Create New Group'}</div>
                    <div style={{display:'flex',gap:'8px'}}>
                        <div style={{flex:1,position:'relative'}}>
                            <input value={groupName} onChange={e=>setGroupName(e.target.value.slice(0,7))} onKeyDown={e=>e.key==='Enter'&&createGroup()}
                                maxLength={7}
                                style={{width:'100%',padding:'8px 12px',borderRadius:'10px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',color:'white',fontSize:'12px',outline:'none',boxSizing:'border-box'}}
                                placeholder={lang==='ar'?'اسم الجروب (7 أحرف)...':'Group name (7 chars)...'}/>
                            <span style={{position:'absolute',right:'8px',top:'50%',transform:'translateY(-50%)',fontSize:'9px',color:groupName.length>=7?'#f87171':'#6b7280',fontWeight:700}}>{groupName.length}/7</span>
                        </div>
                        <button onClick={createGroup} disabled={!groupName.trim()||creating}
                            style={{padding:'8px 14px',borderRadius:'10px',border:'none',fontWeight:700,fontSize:'12px',cursor:'pointer',background:groupName.trim()?'linear-gradient(135deg,#7000ff,#a78bfa)':'rgba(255,255,255,0.06)',color:groupName.trim()?'white':'#6b7280'}}>
                            {creating?'...':(lang==='ar'?'إنشاء':'Create')}
                        </button>
                    </div>
                </div>
            )}
            {loadingGroups?(
                <div style={{textAlign:'center',padding:'32px',color:'#6b7280'}}>⏳</div>
            ):groups.length===0?(
                <div style={{textAlign:'center',padding:'32px',color:'#6b7280'}}>
                    <div style={{fontSize:'36px',marginBottom:'10px'}}>👨‍👩‍👧</div>
                    <div style={{fontSize:'13px',fontWeight:600,color:'#4b5563',marginBottom:'6px'}}>{lang==='ar'?'لا جروبات بعد':'No groups yet'}</div>
                    <div style={{fontSize:'11px'}}>{lang==='ar'?'أنشئ جروب وادعو أصدقاءك':'Create a group and invite your friends'}</div>
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
                                        {group.photoURL ? <img src={group.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : '👨‍👩‍👧'}
                                    </div>
                                    {unread&&<div style={{position:'absolute',top:'-2px',right:'-2px',width:'12px',height:'12px',borderRadius:'50%',background:'#a78bfa',border:'2px solid var(--bg-main)',boxShadow:'0 0 6px rgba(167,139,250,0.8)'}}/>}
                                </div>
                                <div style={{flex:1,minWidth:0}}>
                                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'3px'}}>
                                        <div style={{fontSize:'13px',fontWeight:unread?800:600,color:unread?'#e2e8f0':'#9ca3af',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{group.name}</div>
                                        <div style={{fontSize:'9px',color:'#6b7280',flexShrink:0,marginLeft:'6px'}}>{fmtTime(group.lastMessageAt)}</div>
                                    </div>
                                    <div style={{fontSize:'11px',color:'#6b7280',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{group.lastMessage||(lang==='ar'?'لا رسائل':'No messages')}</div>
                                    <div style={{fontSize:'9px',color:'#4b5563',marginTop:'2px',display:'flex',alignItems:'center',gap:'6px'}}>
                                        <span>{group.members?.length||1} {lang==='ar'?'عضو':'members'}</span>
                                        <span style={{color:gLvl.color,fontWeight:700}}>{gLvl.icon} Lv.{gLvl.level}</span>
                                    </div>
                                </div>
                                <div style={{fontSize:'16px',color:'#6b7280',flexShrink:0}}>›</div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
