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

// 🎉 ONBOARDING MODAL - New User Setup
const OnboardingModal = ({ show, googleUser, onComplete, lang }) => {
    const [displayName, setDisplayName] = useState(googleUser?.displayName || '');
    const [gender, setGender] = useState('');
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
        onComplete({ displayName: displayName.trim(), gender, photoURL });
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
                            maxLength={20}
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

    // Tick every 30 seconds to update progress
    React.useEffect(() => {
        const t = setInterval(() => setTick(p => p + 1), 30000);
        return () => clearInterval(t);
    }, []);

    const userTasks = userData?.dailyTasks || {};
    const sessionStart = userTasks.sessionStartTime?.toDate?.() || new Date();
    const minutesOnline = Math.floor((Date.now() - sessionStart.getTime()) / 60000);

    const getTaskStatus = (box) => {
        const claimed = userTasks.boxes?.[box.id - 1]?.status === 'claimed';
        if (claimed) return 'claimed';
        if (box.comingSoon) return 'coming_soon';
        if (!box.duration) return 'locked';
        if (minutesOnline >= Math.ceil(box.duration / 60000)) return 'available';
        return 'locked';
    };

    const handleClaimTask = async (box) => {
        const status = getTaskStatus(box);
        if (status === 'claimed') { onNotification(lang === 'ar' ? '✅ استلمت بالفعل' : '✅ Already claimed'); return; }
        if (status === 'coming_soon') { onNotification(lang === 'ar' ? '🔜 قريباً جداً' : '🔜 Coming soon'); return; }
        if (status === 'locked') {
            const requiredMin = Math.ceil(box.duration / 60000);
            const remaining = requiredMin - minutesOnline;
            onNotification(lang === 'ar' ? `⏳ بعد ${remaining} دقيقة` : `⏳ In ${remaining} min`);
            return;
        }
        try {
            const updates = {};
            updates[`dailyTasks.boxes.${box.id - 1}.status`] = 'claimed';
            updates[`dailyTasks.boxes.${box.id - 1}.claimedAt`] = firebase.firestore.FieldValue.serverTimestamp();
            if (box.reward.type === 'currency') {
                updates['currency'] = firebase.firestore.FieldValue.increment(box.reward.amount);
            }
            await usersCollection.doc(user.uid).update(updates);
            onNotification(`✅ +${box.reward.amount} 🧠`);
        } catch (err) {
            onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error');
        }
    };

    return (
        <div style={{
            marginTop: '16px',
            padding: '14px',
            background: 'linear-gradient(135deg, rgba(0,242,255,0.05), rgba(112,0,255,0.04))',
            borderRadius: '14px',
            border: '1px solid rgba(0,242,255,0.15)'
        }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <span style={{fontSize:'16px'}}>📦</span>
                    <div>
                        <div style={{fontSize:'13px', fontWeight:800, color:'#00f2ff'}}>
                            {lang === 'ar' ? 'المهام اليومية' : 'Daily Tasks'}
                        </div>
                        <div style={{fontSize:'10px', color:'#64748b'}}>
                            {lang === 'ar' ? `أون لاين منذ ${minutesOnline} دقيقة` : `Online for ${minutesOnline} min`}
                        </div>
                    </div>
                </div>
            </div>

            {/* 8 Boxes - 4 per row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'8px' }}>
                {DAILY_TASKS_CONFIG.map(box => {
                    const status = getTaskStatus(box);
                    const reqMin = box.duration ? Math.ceil(box.duration / 60000) : null;
                    const progress = reqMin ? Math.min(100, Math.floor((minutesOnline / reqMin) * 100)) : 0;

                    const isVip = box.comingSoon;
                    const bgColor =
                        status === 'claimed'     ? 'rgba(74,222,128,0.18)' :
                        status === 'available'   ? 'rgba(0,242,255,0.18)' :
                        isVip                    ? 'rgba(245,158,11,0.08)' :
                                                   'rgba(255,255,255,0.04)';
                    const borderColor =
                        status === 'claimed'   ? 'rgba(74,222,128,0.6)' :
                        status === 'available' ? 'rgba(0,242,255,0.6)' :
                        isVip                  ? 'rgba(245,158,11,0.4)' :
                                                 'rgba(255,255,255,0.08)';

                    return (
                        <button
                            key={box.id}
                            onClick={() => handleClaimTask(box)}
                            style={{
                                padding:'10px 4px', borderRadius:'10px',
                                border:`1.5px solid ${borderColor}`,
                                background: bgColor,
                                cursor: status === 'available' ? 'pointer' : 'default',
                                textAlign:'center', position:'relative', overflow:'hidden',
                                transition:'all 0.2s',
                                boxShadow: status === 'available' ? '0 0 10px rgba(0,242,255,0.2)' :
                                           status === 'claimed'   ? '0 0 8px rgba(74,222,128,0.15)' : 'none'
                            }}
                        >
                            {/* Reward icon */}
                            <div style={{fontSize:'20px', lineHeight:1, marginBottom:'4px'}}>
                                {isVip ? '👑' : box.reward.icon}
                            </div>
                            {/* Amount or VIP label */}
                            <div style={{
                                fontSize:'9px', fontWeight:800,
                                color: status === 'claimed' ? '#4ade80' :
                                       status === 'available' ? '#00f2ff' :
                                       isVip ? '#f59e0b' : '#6b7280',
                                marginBottom:'2px'
                            }}>
                                {isVip ? (lang==='ar'?'قريباً':'Soon') : `+${box.reward.amount}`}
                            </div>
                            {/* Time label */}
                            <div style={{fontSize:'8px', color:'#4b5563', marginBottom:'4px'}}>
                                {isVip ? 'VIP' : (reqMin ? (reqMin >= 60 ? `${reqMin/60}h` : `${reqMin}m`) : '')}
                            </div>
                            {/* Status icon */}
                            <div style={{fontSize:'11px'}}>
                                {status === 'claimed'     ? <span style={{color:'#4ade80', fontWeight:900}}>✓</span> :
                                 status === 'available'   ? <span style={{fontSize:'13px'}}>📦</span> :
                                 isVip                    ? <span style={{color:'#f59e0b'}}>🔜</span> :
                                                            <span style={{color:'#6b7280'}}>🔒</span>}
                            </div>
                            {/* Progress bar for locked/in-progress */}
                            {status === 'locked' && !isVip && progress > 0 && (
                                <div style={{
                                    position:'absolute', bottom:0, left:0, right:0, height:'3px',
                                    background:'rgba(255,255,255,0.08)', borderRadius:'0 0 10px 10px'
                                }}>
                                    <div style={{
                                        height:'100%', width:`${progress}%`,
                                        background:'linear-gradient(90deg,#00f2ff,#7000ff)',
                                        borderRadius:'inherit', transition:'width 0.5s ease'
                                    }} />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
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
