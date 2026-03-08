const LoginRewards = ({ show, onClose, userData, onClaim, lang }) => {
    const t = TRANSLATIONS[lang];
    const [claiming, setClaiming] = useState(false);
    const [countdown, setCountdown] = useState('');

    // ALL computations before any hooks - Rules of Hooks compliance
    const loginData = userData?.loginRewards || { currentDay: 0, lastClaimDate: null, streak: 0, totalClaims: 0 };

    const getLastClaimDate = () => {
        const lcd = loginData.lastClaimDate;
        if (!lcd) return null;
        if (lcd?.toDate) return lcd.toDate();
        if (lcd instanceof Date) return lcd;
        const d = new Date(lcd);
        return isNaN(d.getTime()) ? null : d;
    };

    const lastClaimDate = getLastClaimDate();
    const todayStr = new Date().toDateString();
    const lastClaimStr = lastClaimDate ? lastClaimDate.toDateString() : null;
    const canClaimToday = lastClaimStr !== todayStr;
    const currentDay = loginData.currentDay || 0;
    const currentReward = LOGIN_REWARDS[currentDay];

    // Countdown timer - MUST be before any conditional returns
    useEffect(() => {
        if (!show || canClaimToday || !lastClaimDate) { setCountdown(''); return; }
        const calcCountdown = () => {
            const now = new Date();
            const nextMidnight = new Date(now);
            nextMidnight.setHours(24, 0, 0, 0);
            const diff = nextMidnight - now;
            if (diff <= 0) { setCountdown(''); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setCountdown(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
        };
        calcCountdown();
        const timer = setInterval(calcCountdown, 1000);
        return () => clearInterval(timer);
    }, [show, canClaimToday, lastClaimDate]);

    // Early return AFTER all hooks
    if (!show) return null;

    const handleClaim = async () => {
        if (!canClaimToday || claiming) return;
        setClaiming(true);
        playRewardSound();
        await onClaim(currentDay + 1);
        setClaiming(false);
    };

    const renderRewardIcon = (reward, size = 16) => {
        if (!reward) return <span style={{ fontSize: size + 'px' }}>❓</span>;
        return <span style={{ fontSize: size + 'px' }}>{reward.icon || '🎁'}</span>;
    };

    const getRewardName = (reward) => {
        if (!reward) return '';
        return lang === 'ar' ? reward.name_ar : reward.name_en;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '380px', maxHeight: '90vh', width: '95%' }}>
                <div className="modal-header">
                    <h2 className="modal-title">🎁 {t.loginRewards}</h2>
                    <ModalCloseBtn onClose={onClose} />
                </div>
                <div className="modal-body" style={{ padding: '12px' }}>
                    <div className="login-rewards-container">
                        <div className="login-rewards-header">
                            <span className="login-rewards-title">🔥 {t.dailyStreak}</span>
                            <span className="login-rewards-streak">{currentDay}/30</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', width: '100%', padding: '8px 0' }}>
                            {LOGIN_REWARDS.map((reward, index) => {
                                const dayNum = index + 1;
                                const isClaimed = dayNum <= currentDay;
                                const isCurrent = dayNum === currentDay + 1 && canClaimToday;
                                const isSpecial = reward.special === true;
                                const isFinal = reward.final === true;

                                let bgColor = 'rgba(255, 255, 255, 0.03)';
                                let borderColor = 'rgba(255, 255, 255, 0.1)';
                                let textColor = 'rgba(255, 255, 255, 0.5)';
                                let extraStyles = {};

                                if (isClaimed) {
                                    bgColor = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(34, 197, 94, 0.1))';
                                    borderColor = '#10b981';
                                    textColor = '#10b981';
                                } else if (isCurrent) {
                                    bgColor = 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 136, 0, 0.1))';
                                    borderColor = '#ffd700';
                                    textColor = '#ffd700';
                                    extraStyles = { animation: 'pulse-badge 2s infinite', boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)' };
                                } else if (isSpecial) {
                                    bgColor = 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.1))';
                                    borderColor = '#8b5cf6';
                                    textColor = '#a855f7';
                                } else if (isFinal) {
                                    bgColor = 'linear-gradient(135deg, rgba(255, 0, 85, 0.2), rgba(255, 51, 102, 0.1))';
                                    borderColor = '#ff0055';
                                    textColor = '#ff0055';
                                    extraStyles = { animation: 'glow-pulse 2s infinite' };
                                }

                                return (
                                    <div key={dayNum} title={getRewardName(reward)} style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: `2px solid ${borderColor}`, background: bgColor, padding: '4px', gap: '2px', position: 'relative', cursor: isCurrent ? 'pointer' : 'default', transition: 'all 0.2s ease', ...extraStyles }}>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: textColor, lineHeight: 1 }}>{dayNum}</span>
                                        <span style={{ fontSize: '14px', lineHeight: 1 }}>{renderRewardIcon(reward, 14)}</span>
                                        {/* ✓ claimed overlay */}
                                        {isClaimed && (
                                            <div style={{position:'absolute',inset:0,background:'rgba(16,185,129,0.15)',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                                <span style={{fontSize:'14px',color:'#10b981',fontWeight:900}}>✓</span>
                                            </div>
                                        )}
                                        {/* Current day glow ring */}
                                        {isCurrent && !isClaimed && (
                                            <div style={{position:'absolute',inset:'-2px',borderRadius:'10px',border:'2px solid #ffd700',boxShadow:'0 0 10px rgba(255,215,0,0.5)',pointerEvents:'none'}}/>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {canClaimToday && currentReward && (
                            <div style={{ marginTop: '12px', padding: '12px', background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 136, 0, 0.05))', border: '1px solid rgba(255, 215, 0, 0.3)', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>{lang === 'ar' ? 'مكافأة اليوم' : "Today's Reward"}</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>{renderRewardIcon(currentReward, 18)} {getRewardName(currentReward)}</div>
                                {currentReward.special && <div style={{ fontSize: '10px', color: '#ffd700', marginTop: '4px' }}>⭐ {lang === 'ar' ? 'مكافأة خاصة!' : 'Special Reward!'}</div>}
                            </div>
                        )}
                        {/* Countdown shown when already claimed */}
                        {!canClaimToday && countdown && (
                            <div style={{textAlign:'center', marginTop:'10px', padding:'8px 12px', background:'rgba(0,242,255,0.06)', border:'1px solid rgba(0,242,255,0.15)', borderRadius:'10px'}}>
                                <div style={{fontSize:'9px', color:'#64748b', marginBottom:'3px'}}>
                                    {lang === 'ar' ? '⏳ الوقت المتبقي لليوم التالي' : '⏳ Next reward in'}
                                </div>
                                <div style={{fontSize:'18px', fontWeight:900, color:'#00f2ff', fontFamily:'monospace', letterSpacing:'2px'}}>
                                    {countdown}
                                </div>
                            </div>
                        )}
                        <button onClick={handleClaim} disabled={!canClaimToday || claiming} style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: canClaimToday && !claiming ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease', background: canClaimToday ? 'linear-gradient(135deg, #ffd700, #ff8800)' : 'rgba(107, 114, 128, 0.5)', color: canClaimToday ? '#000' : 'rgba(255, 255, 255, 0.5)', marginTop: '10px' }}>
                            {claiming ? t.loading : canClaimToday ? t.claimReward : t.alreadyClaimed}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 🔧 BROWSE ROOMS MODAL

const BrowseRoomsModal = ({ show, onClose, onJoin, nickname, currentUID, currentUserData, lang }) => {
    const t = TRANSLATIONS[lang];
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joinPassword, setJoinPassword] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        if (!show) return;
        setLoading(true);
        setPasswordError('');
        const unsub = roomsCollection.where('status', '==', 'waiting').onSnapshot(snap => {
            const roomsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(room => room.players?.length < 10);
            setRooms(roomsData);
            setLoading(false);
        }, error => { setLoading(false); });
        return unsub;
    }, [show]);

    if (!show) return null;

    const handleJoinClick = (room) => {
        if (room.isPrivate) {
            setSelectedRoom(room);
            setShowPasswordInput(true);
            setPasswordError('');
        } else {
            onJoin(room.id, '');
        }
    };

    const handlePasswordJoin = () => {
        if (selectedRoom && joinPassword) {
            if (joinPassword !== selectedRoom.password) {
                setPasswordError(lang === 'ar' ? 'كلمة السر غير صحيحة!' : 'Incorrect password!');
                return;
            }
            onJoin(selectedRoom.id, joinPassword);
            setShowPasswordInput(false);
            setSelectedRoom(null);
            setJoinPassword('');
            setPasswordError('');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="modal-header"><h2 className="modal-title">{t.browse}</h2><ModalCloseBtn onClose={onClose} /></div>
                <div className="modal-body">
                    {loading ? <div className="text-center py-8"><div className="text-2xl animate-pulse">⏳</div><p className="text-gray-400 mt-2">{t.loading}</p></div> : rooms.length === 0 ? <div className="text-center py-8 text-gray-400"><div className="text-4xl mb-2">🔍</div><p>{t.noRooms}</p></div> : (
                        <div className="browse-rooms-container">
                            {rooms.map(room => (
                                <div key={room.id} className="room-card">
                                    <div className="room-card-header"><span className="room-card-code">{room.id}</span><span className="room-card-mode">{room.mode === 'advanced' ? (lang === 'ar' ? 'متقدم' : 'Advanced') : (lang === 'ar' ? 'عادي' : 'Normal')}</span></div>
                                    <div className="room-card-info">
                                        <div className="room-card-players"><span>👥 {room.players?.length || 0}/10</span>{room.isPrivate && <span className="room-card-private ml-2">🔒</span>}</div>
                                        <button onClick={() => handleJoinClick(room)} className="room-card-join-btn">{t.join}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {showPasswordInput && selectedRoom && (
                    <div className="p-3 bg-white/5 border-t border-white/10">
                        <div className="text-xs text-gray-400 mb-2">🔒 {lang === 'ar' ? 'أدخل كلمة السر' : 'Enter password'} - Room: {selectedRoom.id}</div>
                        <div className="flex gap-2">
                            <input type="password" value={joinPassword} onChange={e => { setJoinPassword(e.target.value); setPasswordError(''); }} placeholder={t.password} className="input-dark flex-1 p-2 rounded text-sm" />
                            <button onClick={handlePasswordJoin} className="btn-neon px-4 py-2 rounded text-sm">{t.join}</button>
                            <button onClick={() => { setShowPasswordInput(false); setSelectedRoom(null); setPasswordError(''); }} className="btn-ghost px-3 py-2 rounded text-sm">✕</button>
                        </div>
                        {passwordError && <div className="text-xs text-red-400 mt-2 text-center flex items-center justify-center gap-1"><span>❌</span> {passwordError}</div>}
                    </div>
                )}
            </div>
        </div>
    );
};

// 📚 TUTORIAL MODAL

const TutorialModal = ({ show, onClose, lang }) => {
    const t = TRANSLATIONS[lang];
    const [step, setStep] = useState(0);
    if(!show) return null;
    const steps = [ { text: t.tutorialStep1, img: "🕵️" }, { text: t.tutorialStep2, img: "🗳️" }, { text: t.tutorialStep3, img: "🛒" } ];
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '340px' }}>
                <div className="modal-header"><h2 className="modal-title">{t.tutorialTitle}</h2><ModalCloseBtn onClose={onClose} /></div>
                <div className="modal-body text-center">
                    <div className="text-5xl mb-4 animate-bounce">{steps[step].img}</div>
                    <p className="text-sm mb-4 text-gray-200">{steps[step].text}</p>
                    <div className="flex justify-center gap-2 mb-3">{steps.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full transition ${i === step ? 'bg-cyan-400 w-4' : 'bg-gray-600'}`}></div>)}</div>
                    <div className="flex gap-2">
                        {step > 0 && <button onClick={() => setStep(s => s-1)} className="btn-ghost flex-1 py-2 rounded-lg text-sm">Back</button>}
                        {step < steps.length - 1 ? <button onClick={() => setStep(s => s+1)} className="btn-neon flex-1 py-2 rounded-lg text-sm">{t.next}</button> : <button onClick={onClose} className="btn-neon flex-1 py-2 rounded-lg text-sm">{t.startGame}</button>}
                    </div>
                    <button onClick={onClose} className="text-xs text-gray-500 mt-3 hover:text-white">{t.skipTutorial}</button>
                </div>
            </div>
        </div>
    );
};

// ⚙️ SETTINGS MODAL

const SettingsModal = ({ show, onClose, lang, userData, user, onNotification, isGuest: isGuestPropForSettings, onLoginGoogle }) => {
    const t = TRANSLATIONS[lang];
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [blockInput, setBlockInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [soundMutedLocal, setSoundMutedLocal] = useState(() => localStorage.getItem('pro_spy_sound_muted') === 'true');
    const [showEmailLocal, setShowEmailLocal] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        if (show && userData) {
            setBlockedUsers(userData.blockedUsers || []);
        }
    }, [show, userData]);

    if (!show) return null;

    const toggleSound = () => {
        const newMuted = !soundMutedLocal;
        setSoundMutedLocal(newMuted);
        localStorage.setItem('pro_spy_sound_muted', String(newMuted));
        // Update global audio state
        if (typeof window !== 'undefined') {
            window.proSpySoundMuted = newMuted;
        }
        onNotification(newMuted ? (lang === 'ar' ? 'تم كتم الصوت' : 'Sound muted') : (lang === 'ar' ? 'تم تشغيل الصوت' : 'Sound enabled'));
    };

    const handleBlockUser = async () => {
        if (!blockInput.trim() || !user) return;
        setLoading(true);
        try {
            // Find user by ID
            const userQuery = await usersCollection.where('customId', '==', blockInput.trim()).get();
            if (userQuery.empty) {
                onNotification(t.friendNotFound);
                setLoading(false);
                return;
            }
            const targetUid = userQuery.docs[0].id;
            if (targetUid === user.uid) {
                onNotification(lang === 'ar' ? 'لا يمكنك حظر نفسك' : 'Cannot block yourself');
                setLoading(false);
                return;
            }
            if (blockedUsers.includes(targetUid)) {
                onNotification(lang === 'ar' ? 'المستخدم محظور بالفعل' : 'User already blocked');
                setLoading(false);
                return;
            }
            // Add to blocked list
            await usersCollection.doc(user.uid).update({
                blockedUsers: firebase.firestore.FieldValue.arrayUnion(targetUid)
            });
            setBlockedUsers([...blockedUsers, targetUid]);
            setBlockInput('');
            onNotification(t.blockSuccess);
        } catch (error) {
            onNotification(lang === 'ar' ? 'حدث خطأ' : 'An error occurred');
        }
        setLoading(false);
    };

    const handleUnblockUser = async (targetUid) => {
        if (!user) return;
        try {
            await usersCollection.doc(user.uid).update({
                blockedUsers: firebase.firestore.FieldValue.arrayRemove(targetUid)
            });
            setBlockedUsers(blockedUsers.filter(id => id !== targetUid));
            onNotification(t.unblockSuccess);
        } catch (error) {
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '360px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">⚙️ {t.settings}</h2>
                    <ModalCloseBtn onClose={onClose} />
                </div>
                <div className="modal-body">
                    {/* Account Info Section - GUEST: show login prompt instead */}
                    {isGuestPropForSettings && (
                        <div className="settings-section">
                            <div className="settings-section-title">
                                <span>👤</span>
                                <span>{lang === 'ar' ? 'معلومات الحساب' : 'Account Info'}</span>
                            </div>
                            <div style={{padding:'16px', borderRadius:'12px', background:'linear-gradient(135deg,rgba(0,10,30,0.6),rgba(20,0,50,0.4))', border:'1px solid rgba(0,242,255,0.15)', textAlign:'center'}}>
                                <div style={{fontSize:'32px', marginBottom:'8px'}}>🔒</div>
                                <div style={{fontSize:'13px', fontWeight:800, color:'white', marginBottom:'4px'}}>
                                    {lang === 'ar' ? 'حساب زائر' : 'Guest Account'}
                                </div>
                                <div style={{fontSize:'11px', color:'#6b7280', marginBottom:'14px'}}>
                                    {lang === 'ar' ? 'سجّل دخولك للوصول لجميع المميزات' : 'Login to access all features'}
                                </div>
                                <button onClick={onLoginGoogle} style={{
                                    display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                                    width:'100%', padding:'10px 16px', borderRadius:'10px', border:'none', cursor:'pointer',
                                    background:'white', color:'#333', fontSize:'13px', fontWeight:700
                                }}>
                                    <img src="https://www.google.com/favicon.ico" alt="G" style={{width:'16px',height:'16px'}} />
                                    {lang === 'ar' ? 'تسجيل الدخول بجوجل' : 'Login with Google'}
                                </button>
                            </div>
                        </div>
                    )}
                    {/* Account Info Section - Logged in users */}
                    {user && !isGuestPropForSettings && (
                        <div className="settings-section">
                            <div className="settings-section-title">
                                <span>👤</span>
                                <span>{lang === 'ar' ? 'معلومات الحساب' : 'Account Info'}</span>
                            </div>
                            {/* Profile Photo */}
                            <div style={{display:'flex', justifyContent:'center', marginBottom:'12px', marginTop:'8px'}}>
                                <div style={{position:'relative', cursor:'pointer'}} onClick={() => document.getElementById('settings-photo-input')?.click()}>
                                    <img
                                        src={userData?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.displayName||'User')}&background=7000ff&color=fff&size=200`}
                                        alt="avatar"
                                        style={{width:'72px', height:'72px', borderRadius:'50%', objectFit:'cover', border:'3px solid rgba(112,0,255,0.5)'}}
                                    />
                                    <div style={{position:'absolute', bottom:'0', right:'0', background:'rgba(112,0,255,0.9)', borderRadius:'50%', width:'22px', height:'22px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', border:'2px solid #0f0f1a'}}>📷</div>
                                </div>
                                <input id="settings-photo-input" type="file" style={{display:'none'}} accept="image/*" onChange={async(e) => {
                                    const file = e.target.files?.[0];
                                    if(!file || !user) return;
                                    const reader = new FileReader();
                                    reader.onload = async(ev) => {
                                        const img = new Image();
                                        img.onload = async() => {
                                            const canvas = document.createElement('canvas');
                                            const MAX = 300;
                                            let w = img.width, h = img.height;
                                            if(w > h){ if(w > MAX){h = Math.round(h*MAX/w); w=MAX;} } else { if(h > MAX){w = Math.round(w*MAX/h); h=MAX;} }
                                            canvas.width=w; canvas.height=h;
                                            canvas.getContext('2d').drawImage(img,0,0,w,h);
                                            const base64 = canvas.toDataURL('image/jpeg', 0.75);
                                            try {
                                                await usersCollection.doc(user.uid).update({photoURL: base64});
                                                onNotification(lang==='ar'?'تم تحديث الصورة!':'Photo updated!');
                                            } catch(err){ }
                                        };
                                        img.src = ev.target.result;
                                    };
                                    reader.readAsDataURL(file);
                                }} />
                            </div>
                            <div className="settings-account-card">
                                <div className="settings-account-row">
                                    <span className="settings-account-label">📧 {lang === 'ar' ? 'البريد' : 'Email'}</span>
                                    <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                                        <span className="settings-account-value">{showEmailLocal ? (user?.email || 'N/A') : maskEmail(user?.email)}</span>
                                        <button onClick={() => setShowEmailLocal(!showEmailLocal)} className="settings-eye-btn">{showEmailLocal ? '🙈' : '👁️'}</button>
                                    </div>
                                </div>
                                <div className="settings-account-row">
                                    <span className="settings-account-label">🪪 ID</span>
                                    <span className="settings-account-value" onClick={() => navigator.clipboard.writeText(userData?.customId || '')} style={{cursor:'pointer'}}>
                                        {userData?.customId || 'N/A'} 📋
                                    </span>
                                </div>
                                <div className="settings-account-row">
                                    <span className="settings-account-label">📅 {lang === 'ar' ? 'عضو منذ' : 'Member Since'}</span>
                                    <span className="settings-account-value">{userData?.createdAt?.toDate?.() ? userData.createdAt.toDate().toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="settings-account-row">
                                    <span className="settings-account-label">🔑 {lang === 'ar' ? 'نوع الحساب' : 'Account Type'}</span>
                                    <span className="settings-account-value" style={{color:'#10b981'}}>Google ✓</span>
                                </div>
                                <div className="settings-account-row">
                                    <span className="settings-account-label">✏️ {lang === 'ar' ? 'الاسم' : 'Name'}</span>
                                    {editingName ? (
                                        <div style={{display:'flex',gap:'4px'}}>
                                            <input className="input-dark" style={{padding:'4px 8px',fontSize:'11px',borderRadius:'6px',width:'120px'}} value={newName} onChange={e => setNewName(e.target.value)} placeholder={userData?.displayName} />
                                            <button className="btn-neon" style={{padding:'2px 8px',fontSize:'10px',borderRadius:'6px'}} onClick={async() => {
                                                if(newName.trim() && user) {
                                                    const now = new Date();
                                                    const lastChange = userData?.lastChangedName?.toDate?.() || new Date(0);
                                                    const diffDays = (now - lastChange) / (1000*60*60*24);
                                                    if(diffDays < 30) { onNotification(lang==='ar'?'يمكن التغيير مرة شهريًا':'Can change once per month'); setEditingName(false); return; }
                                                    await usersCollection.doc(user.uid).update({displayName:newName.trim(), lastChangedName:firebase.firestore.FieldValue.serverTimestamp()});
                                                    onNotification(lang==='ar'?'تم تغيير الاسم!':'Name changed!');
                                                    setEditingName(false);
                                                }
                                            }}>✓</button>
                                            <button className="btn-ghost" style={{padding:'2px 6px',fontSize:'10px',borderRadius:'6px'}} onClick={() => setEditingName(false)}>✕</button>
                                        </div>
                                    ) : (
                                        <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                                            <span className="settings-account-value">{userData?.displayName}</span>
                                            <button onClick={() => { setNewName(userData?.displayName || ''); setEditingName(true); }} className="settings-eye-btn">✏️</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Gender row */}
                            <div className="settings-account-row" style={{marginTop:'4px'}}>
                                <span className="settings-account-label">
                                    {(userData?.gender === 'male') ? '♂️' : (userData?.gender === 'female') ? '♀️' : '👤'}
                                    {' '}{lang === 'ar' ? 'الجنس' : 'Gender'}
                                </span>
                                <div style={{display:'flex', gap:'6px'}}>
                                    <button
                                        onClick={async () => {
                                            if (!user) return;
                                            await usersCollection.doc(user.uid).update({ gender: 'male' });
                                            onNotification(lang === 'ar' ? 'تم الحفظ ✓' : 'Saved ✓');
                                        }}
                                        style={{
                                            padding:'3px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:700, cursor:'pointer',
                                            background: userData?.gender === 'male' ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)',
                                            border: userData?.gender === 'male' ? '1.5px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                                            color: userData?.gender === 'male' ? '#93c5fd' : '#9ca3af'
                                        }}
                                    >♂️ {lang === 'ar' ? 'ذكر' : 'Male'}</button>
                                    <button
                                        onClick={async () => {
                                            if (!user) return;
                                            await usersCollection.doc(user.uid).update({ gender: 'female' });
                                            onNotification(lang === 'ar' ? 'تم الحفظ ✓' : 'Saved ✓');
                                        }}
                                        style={{
                                            padding:'3px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:700, cursor:'pointer',
                                            background: userData?.gender === 'female' ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.05)',
                                            border: userData?.gender === 'female' ? '1.5px solid #ec4899' : '1px solid rgba(255,255,255,0.1)',
                                            color: userData?.gender === 'female' ? '#f9a8d4' : '#9ca3af'
                                        }}
                                    >♀️ {lang === 'ar' ? 'أنثى' : 'Female'}</button>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Sound Toggle */}
                    <div className="settings-section">
                        <div className="settings-row">
                            <div className="settings-label">
                                <span className="settings-icon">🔊</span>
                                <span>{t.sound}</span>
                            </div>
                            <button
                                onClick={toggleSound}
                                className={`settings-toggle ${soundMutedLocal ? 'off' : 'on'}`}
                            >
                                {soundMutedLocal ? t.soundOff : t.soundOn}
                            </button>
                        </div>
                    </div>

                    )} {/* end logged-in account section */}
                    {/* Moments Section - only for logged-in users */}
                    {user && !isGuestPropForSettings && (
                    <div className="settings-section">
                        <div className="settings-section-title">
                            <span>📸</span>
                            <span>{lang === 'ar' ? 'لحظاتي' : 'My Moments'}</span>
                        </div>
                        <MomentsSettingsSection currentUser={user} userData={userData} lang={lang} />
                    </div>
                    )}

                    {/* Achievements Section */}
                    <div className="settings-section">
                        <div className="settings-section-title">
                            <span>🏆</span>
                            <span>{t.achievements}</span>
                        </div>
                        <AchievementsDisplayV11 userData={userData} lang={lang} showAll={true} />
                    </div>

                    {/* Block Users Section - only for logged-in users */}
                    {user && !isGuestPropForSettings && (
                    <div className="settings-section">
                        <div className="settings-section-title">
                            <span>🚫</span>
                            <span>{t.blockedUsers}</span>
                        </div>
                        <div className="block-input-row">
                            <input
                                type="text"
                                className="input-dark"
                                value={blockInput}
                                onChange={e => setBlockInput(e.target.value)}
                                placeholder={t.friendIdPlaceholder}
                            />
                            <button
                                onClick={handleBlockUser}
                                disabled={loading || !blockInput.trim()}
                                className="btn-danger px-3 py-2 rounded text-xs"
                            >
                                {t.blockUser}
                            </button>
                        </div>
                        <div className="blocked-users-list">
                            {blockedUsers.length === 0 ? (
                                <div className="no-blocked-users">{t.noBlockedUsers}</div>
                            ) : (
                                blockedUsers.map(uid => (
                                    <BlockedUserItem
                                        key={uid}
                                        uid={uid}
                                        onUnblock={() => handleUnblockUser(uid)}
                                        lang={lang}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                    )} {/* end block users section */}
                </div>
            </div>
        </div>
    );
};

// 🎯 PROFILE V11 - NEW PREMIUM DESIGN COMPONENTS

// 📊 WIN RATE CIRCLE COMPONENT
