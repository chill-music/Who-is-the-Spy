const LoginRewards = ({ show, onClose, userData, onClaim, lang, onOpenInventory }) => {
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
        // 📦 If reward is an item (frame/badge/title), go to inventory
        if (currentReward && (currentReward.type === 'frame' || currentReward.type === 'badge' || currentReward.type === 'title')) {
            setTimeout(() => { onClose(); if (onOpenInventory) onOpenInventory(); }, 500);
        }
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

// ════════════════════════════════════════════════════════
// 🎫 SUPPORT TICKET SECTION — for regular users in Settings
// ════════════════════════════════════════════════════════
const SupportTicketSection = ({ user, userData, lang, onNotification }) => {
    const [view, setView]             = useState('list'); // 'list' | 'new' | 'detail'
    const [myTickets, setMyTickets]   = useState([]);
    const [loading, setLoading]       = useState(true);
    const [selected, setSelected]     = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [userReply, setUserReply]   = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    // New ticket form state
    const [subject, setSubject]   = useState('');
    const [message, setMessage]   = useState('');
    const [category, setCategory] = useState('other');

    useEffect(() => {
        if (!user) return;
        const unsub = ticketsCollection
            .where('userId', '==', user.uid)
            .onSnapshot(snap => {
                let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                data.sort((a, b) => {
                    const ta = a.createdAt?.toMillis?.() || a.createdAt?.seconds*1000 || 0;
                    const tb = b.createdAt?.toMillis?.() || b.createdAt?.seconds*1000 || 0;
                    return tb - ta;
                });
                setMyTickets(data);
                // تحديث التذكرة المحددة
                setSelected(prev => {
                    if (!prev) return null;
                    return data.find(t => t.id === prev.id) || prev;
                });
                setLoading(false);
            }, () => setLoading(false));
        return unsub;
    }, [user?.uid]);

    const handleSubmitTicket = async () => {
        if (!subject.trim() || !message.trim() || !user) return;
        setSubmitting(true);
        try {
            await ticketsCollection.add({
                userId:      user.uid,
                userName:    userData?.displayName || 'User',
                userPhoto:   userData?.photoURL || '',
                subject:     subject.trim(),
                message:     message.trim(),
                category,
                status:      'open',
                responses:   [],
                createdAt:   firebase.firestore.FieldValue.serverTimestamp(),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            });
            setSubject(''); setMessage(''); setCategory('other');
            setView('list');
            onNotification(lang==='ar'?'✅ تم إرسال تذكرتك!':'✅ Ticket submitted!');
        } catch(e) {
            onNotification(lang==='ar'?'❌ حدث خطأ':'❌ Error');
        }
        setSubmitting(false);
    };

    const handleUserReply = async () => {
        if (!userReply.trim() || !selected) return;
        setSendingReply(true);
        try {
            const reply = {
                by: user.uid,
                byName: userData?.displayName || 'User',
                byRole: 'user',
                message: userReply.trim(),
                timestamp: new Date().toISOString()
            };
            await ticketsCollection.doc(selected.id).update({
                responses: firebase.firestore.FieldValue.arrayUnion(reply),
                status: 'open',
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
            setUserReply('');
            onNotification(lang==='ar'?'✅ تم إرسال ردك':'✅ Reply sent');
        } catch(e) { onNotification('❌ Error'); }
        setSendingReply(false);
    };

    const statusCfg = {
        open:     { label_ar:'مفتوح',    label_en:'Open',     color:'#ef4444' },
        answered: { label_ar:'تم الرد',  label_en:'Answered', color:'#f59e0b' },
        closed:   { label_ar:'مغلق',     label_en:'Closed',   color:'#6b7280' },
    };
    const catIcon = { bug:'🐛', account:'👤', payment:'💳', other:'❓' };
    const catLabels_ar = { bug:'خطأ تقني', account:'حساب', payment:'دفع', other:'أخرى' };
    const catLabels_en = { bug:'Bug Report', account:'Account', payment:'Payment', other:'Other' };

    // ── Detail View ──
    if (view === 'detail' && selected) {
        const sc = statusCfg[selected.status] || statusCfg.open;
        return (
            <div className="settings-section">
                <div className="settings-section-title">
                    <span>🎫</span>
                    <span>{lang==='ar'?'تفاصيل التذكرة':'Ticket Details'}</span>
                </div>
                <button onClick={() => setView('list')}
                    style={{ fontSize:'11px', color:'#00f2ff', background:'none', border:'none', cursor:'pointer', marginBottom:'10px', display:'flex', alignItems:'center', gap:'4px' }}>
                    ← {lang==='ar'?'رجوع':'Back'}
                </button>
                <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'12px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px', flexWrap:'wrap', gap:'6px' }}>
                        <div style={{ fontWeight:700, fontSize:'13px' }}>{selected.subject}</div>
                        <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'4px', fontWeight:700, background:`${sc.color}15`, border:`1px solid ${sc.color}30`, color:sc.color }}>
                            {lang==='ar'?sc.label_ar:sc.label_en}
                        </span>
                    </div>
                    {/* Original message */}
                    <div style={{ background:'rgba(112,0,255,0.05)', border:'1px solid rgba(112,0,255,0.15)', borderRadius:'7px', padding:'10px', marginBottom:'10px', fontSize:'12px', color:'#d1d5db' }}>
                        <div style={{ fontSize:'10px', color:'#7c3aed', fontWeight:700, marginBottom:'4px' }}>👤 {lang==='ar'?'رسالتك':'Your message'}</div>
                        {selected.message}
                    </div>
                    {/* Thread */}
                    {(selected.responses||[]).map((r, i) => {
                        const isStaff = r.byRole !== 'user';
                        return (
                            <div key={i} style={{
                                background: isStaff?'rgba(0,242,255,0.05)':'rgba(112,0,255,0.05)',
                                border:`1px solid ${isStaff?'rgba(0,242,255,0.15)':'rgba(112,0,255,0.15)'}`,
                                borderRadius:'7px', padding:'10px', marginBottom:'6px',
                                marginLeft: isStaff?'0':'12px'
                            }}>
                                <div style={{ fontSize:'10px', color: isStaff?'#00f2ff':'#a78bfa', fontWeight:700, marginBottom:'4px' }}>
                                    {isStaff?'👮':'👤'} {r.byName}
                                    <span style={{ fontWeight:400, color:'#6b7280', marginLeft:'6px' }}>
                                        {new Date(r.timestamp).toLocaleString(lang==='ar'?'ar-EG':'en-US')}
                                    </span>
                                </div>
                                <div style={{ fontSize:'12px', color:'#d1d5db', lineHeight:1.6 }}>{r.message}</div>
                            </div>
                        );
                    })}
                    {/* User reply */}
                    {selected.status !== 'closed' && (
                        <div style={{ marginTop:'10px' }}>
                            <textarea
                                style={{ width:'100%', padding:'8px', borderRadius:'7px', fontSize:'11px', minHeight:'55px', resize:'vertical',
                                    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', outline:'none' }}
                                placeholder={lang==='ar'?'أضف تعليقاً أو معلومات إضافية...':'Add a comment or more info...'}
                                value={userReply}
                                onChange={e => setUserReply(e.target.value)} />
                            <button onClick={handleUserReply} disabled={sendingReply || !userReply.trim()}
                                className="btn-neon" style={{ width:'100%', padding:'7px', borderRadius:'7px', marginTop:'6px', fontSize:'12px', fontWeight:700 }}>
                                {sendingReply ? '⏳' : `📨 ${lang==='ar'?'إرسال':'Send'}`}
                            </button>
                        </div>
                    )}
                    {selected.status === 'closed' && (
                        <div style={{ textAlign:'center', fontSize:'11px', color:'#6b7280', padding:'8px', borderTop:'1px solid rgba(255,255,255,0.06)', marginTop:'8px' }}>
                            🔒 {lang==='ar'?'هذه التذكرة مغلقة':'This ticket is closed'}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── New Ticket Form ──
    if (view === 'new') {
        return (
            <div className="settings-section">
                <div className="settings-section-title">
                    <span>🎫</span>
                    <span>{lang==='ar'?'تذكرة دعم جديدة':'New Support Ticket'}</span>
                </div>
                <button onClick={() => setView('list')}
                    style={{ fontSize:'11px', color:'#00f2ff', background:'none', border:'none', cursor:'pointer', marginBottom:'10px' }}>
                    ← {lang==='ar'?'رجوع':'Back'}
                </button>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {/* Category */}
                    <div>
                        <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'5px' }}>{lang==='ar'?'نوع المشكلة:':'Category:'}</div>
                        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                            {['bug','account','payment','other'].map(c => (
                                <button key={c} onClick={() => setCategory(c)}
                                    style={{ padding:'4px 10px', borderRadius:'6px', fontSize:'11px', cursor:'pointer',
                                        background: category===c?'rgba(0,242,255,0.15)':'rgba(255,255,255,0.05)',
                                        border: category===c?'1px solid rgba(0,242,255,0.4)':'1px solid rgba(255,255,255,0.1)',
                                        color: category===c?'#00f2ff':'#9ca3af', fontWeight: category===c?700:400 }}>
                                    {catIcon[c]} {lang==='ar'?catLabels_ar[c]:catLabels_en[c]}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Subject */}
                    <div>
                        <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'5px' }}>{lang==='ar'?'عنوان المشكلة:':'Subject:'}</div>
                        <input
                            style={{ width:'100%', padding:'8px 10px', borderRadius:'7px', fontSize:'12px',
                                background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', outline:'none' }}
                            placeholder={lang==='ar'?'وصف مختصر للمشكلة...':'Brief description of your issue...'}
                            value={subject}
                            onChange={e => setSubject(e.target.value)} />
                    </div>
                    {/* Message */}
                    <div>
                        <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'5px' }}>{lang==='ar'?'تفاصيل المشكلة:':'Details:'}</div>
                        <textarea
                            style={{ width:'100%', padding:'8px 10px', borderRadius:'7px', fontSize:'12px', minHeight:'80px', resize:'vertical',
                                background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', outline:'none' }}
                            placeholder={lang==='ar'?'اشرح مشكلتك بالتفصيل...':'Describe your issue in detail...'}
                            value={message}
                            onChange={e => setMessage(e.target.value)} />
                    </div>
                    <button onClick={handleSubmitTicket} disabled={submitting || !subject.trim() || !message.trim()}
                        className="btn-neon" style={{ width:'100%', padding:'9px', borderRadius:'8px', fontSize:'12px', fontWeight:700, marginTop:'2px' }}>
                        {submitting ? '⏳' : `🎫 ${lang==='ar'?'إرسال التذكرة':'Submit Ticket'}`}
                    </button>
                </div>
            </div>
        );
    }

    // ── List View ──
    const openCount = myTickets.filter(t => t.status === 'open' || t.status === 'answered').length;
    return (
        <div className="settings-section">
            <div className="settings-section-title" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <span>🎫</span>
                    <span>{lang==='ar'?'الدعم الفني':'Support'}</span>
                    {openCount > 0 && (
                        <span style={{ fontSize:'10px', padding:'1px 6px', borderRadius:'10px', background:'rgba(99,102,241,0.2)', border:'1px solid rgba(99,102,241,0.4)', color:'#818cf8', fontWeight:700 }}>
                            {openCount}
                        </span>
                    )}
                </div>
                <button onClick={() => setView('new')}
                    style={{ fontSize:'10px', padding:'4px 10px', borderRadius:'6px', cursor:'pointer', fontWeight:700,
                        background:'rgba(0,242,255,0.1)', border:'1px solid rgba(0,242,255,0.25)', color:'#00f2ff' }}>
                    + {lang==='ar'?'تذكرة جديدة':'New Ticket'}
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign:'center', padding:'16px', color:'#6b7280', fontSize:'12px' }}>⏳</div>
            ) : myTickets.length === 0 ? (
                <div style={{ textAlign:'center', padding:'20px', color:'#6b7280' }}>
                    <div style={{ fontSize:'28px', marginBottom:'8px' }}>🎫</div>
                    <div style={{ fontSize:'12px', marginBottom:'10px' }}>{lang==='ar'?'ليس لديك تذاكر دعم بعد':'No support tickets yet'}</div>
                    <button onClick={() => setView('new')}
                        style={{ fontSize:'11px', padding:'6px 16px', borderRadius:'7px', cursor:'pointer', fontWeight:700,
                            background:'rgba(0,242,255,0.1)', border:'1px solid rgba(0,242,255,0.25)', color:'#00f2ff' }}>
                        + {lang==='ar'?'فتح تذكرة':'Open Ticket'}
                    </button>
                </div>
            ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                    {myTickets.map(ticket => {
                        const sc = statusCfg[ticket.status] || statusCfg.open;
                        const hasNewReply = ticket.status === 'answered';
                        return (
                            <div key={ticket.id} onClick={() => { setSelected(ticket); setView('detail'); }}
                                style={{
                                    background: hasNewReply?'rgba(245,158,11,0.06)':'rgba(255,255,255,0.03)',
                                    border:`1px solid ${hasNewReply?'rgba(245,158,11,0.25)':'rgba(255,255,255,0.08)'}`,
                                    borderRadius:'8px', padding:'10px', cursor:'pointer', transition:'all 0.15s',
                                    borderLeft:`3px solid ${sc.color}`
                                }}
                                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                                onMouseLeave={e => e.currentTarget.style.background=hasNewReply?'rgba(245,158,11,0.06)':'rgba(255,255,255,0.03)'}>
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'3px' }}>
                                    <span style={{ fontSize:'12px', fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>
                                        {catIcon[ticket.category]||'❓'} {ticket.subject}
                                    </span>
                                    <span style={{ fontSize:'10px', padding:'1px 7px', borderRadius:'4px', fontWeight:700, flexShrink:0, marginLeft:'8px',
                                        background:`${sc.color}15`, border:`1px solid ${sc.color}30`, color:sc.color }}>
                                        {hasNewReply && '🔔 '}{lang==='ar'?sc.label_ar:sc.label_en}
                                    </span>
                                </div>
                                <div style={{ fontSize:'10px', color:'#6b7280' }}>
                                    {(ticket.responses||[]).length} {lang==='ar'?'ردود':'replies'}
                                    {' • '}{ticket.createdAt?.toDate?.()?.toLocaleDateString(lang==='ar'?'ar-EG':'en-US')}
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

const SettingsModal = ({ show, onClose, lang, onSetLang, userData, user, onNotification, isGuest: isGuestPropForSettings, onLoginGoogle, onOpenAdminPanel }) => {
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
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{
                maxWidth: '380px', width:'95vw',
                background:'linear-gradient(160deg,rgba(10,10,28,0.98),rgba(18,18,40,0.98))',
                border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:'20px', overflow:'hidden'
            }}>
                {/* ── Gradient Header ── */}
                <div style={{
                    padding:'18px 20px 16px',
                    background:'linear-gradient(135deg,rgba(0,242,255,0.08),rgba(112,0,255,0.08))',
                    borderBottom:'1px solid rgba(255,255,255,0.07)',
                    display:'flex', alignItems:'center', justifyContent:'space-between'
                }}>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                        <div style={{
                            width:'38px',height:'38px',borderRadius:'12px',
                            background:'linear-gradient(135deg,rgba(0,242,255,0.2),rgba(112,0,255,0.2))',
                            display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'
                        }}>⚙️</div>
                        <div>
                            <div style={{fontSize:'16px',fontWeight:900,color:'#e2e8f0',letterSpacing:'-0.2px'}}>{t.settings}</div>
                            <div style={{fontSize:'10px',color:'#6b7280',marginTop:'1px'}}>{lang==='ar'?'تخصيص تجربتك':'Customize your experience'}</div>
                        </div>
                    </div>
                    <ModalCloseBtn onClose={onClose} />
                </div>
                <div className="modal-body" style={{padding:'16px', overflowY:'auto', maxHeight:'80vh', display:'flex', flexDirection:'column', gap:'0px'}}>
                    {/* Account Info Section - GUEST: show login prompt instead */}
                    {isGuestPropForSettings && (
                        <div style={{
                            marginBottom:'10px',
                            background:'linear-gradient(135deg,rgba(0,10,30,0.6),rgba(20,0,50,0.4))',
                            border:'1px solid rgba(0,242,255,0.15)',
                            borderRadius:'14px', padding:'20px', textAlign:'center'
                        }}>
                            <div style={{fontSize:'36px', marginBottom:'10px'}}>🔒</div>
                            <div style={{fontSize:'14px', fontWeight:800, color:'white', marginBottom:'5px'}}>
                                {lang === 'ar' ? 'حساب زائر' : 'Guest Account'}
                            </div>
                            <div style={{fontSize:'11px', color:'#6b7280', marginBottom:'16px'}}>
                                {lang === 'ar' ? 'سجّل دخولك للوصول لجميع المميزات' : 'Login to access all features'}
                            </div>
                            <button onClick={onLoginGoogle} style={{
                                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                                width:'100%', padding:'11px 16px', borderRadius:'12px', border:'none', cursor:'pointer',
                                background:'white', color:'#333', fontSize:'13px', fontWeight:700
                            }}>
                                <img src="https://www.google.com/favicon.ico" alt="G" style={{width:'16px',height:'16px'}} />
                                {lang === 'ar' ? 'تسجيل الدخول بجوجل' : 'Login with Google'}
                            </button>
                        </div>
                    )}
                    {/* Account Info Section - Logged in users */}
                    {user && !isGuestPropForSettings && (
                        <div style={{
                            marginBottom:'10px',
                            background:'linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))',
                            border:'1px solid rgba(255,255,255,0.08)',
                            borderRadius:'14px', padding:'16px'
                        }}>
                            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px'}}>
                                <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'rgba(0,242,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>👤</div>
                                <div style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0'}}>{lang === 'ar' ? 'معلومات الحساب' : 'Account Info'}</div>
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
                            {/* Country row */}
                            <div className="settings-account-row" style={{marginTop:'4px', flexDirection:'column', alignItems:'flex-start', gap:'6px'}}>
                                <span className="settings-account-label">
                                    🌍 {lang === 'ar' ? 'البلد' : 'Country'}
                                    {userData?.country && <span style={{marginRight:'6px', marginLeft:'6px'}}>{userData.country.flag} {lang === 'ar' ? userData.country.name_ar : userData.country.name_en}</span>}
                                </span>
                                <CountryPicker
                                    selected={userData?.country?.code}
                                    onSelect={async (c) => {
                                        if (!user) return;
                                        await usersCollection.doc(user.uid).update({
                                            country: { code: c.code, flag: c.flag, name_ar: c.name_ar, name_en: c.name_en }
                                        });
                                        onNotification(lang === 'ar' ? 'تم حفظ البلد ✓' : 'Country saved ✓');
                                    }}
                                    lang={lang}
                                />
                            </div>
                        </div>
                    )}
                    {/* VIP Center */}
                    {user && !isGuestPropForSettings && (
                        <VIPCenterSection
                            userData={userData}
                            user={user}
                            lang={lang}
                            onNotification={onNotification}
                        />
                    )}

                    {/* ── Language Toggle ── */}
                    <div style={{
                        margin:'0 0 10px',
                        background:'linear-gradient(135deg,rgba(0,242,255,0.06),rgba(112,0,255,0.06))',
                        border:'1px solid rgba(255,255,255,0.08)',
                        borderRadius:'14px', padding:'14px 16px',
                        display:'flex', alignItems:'center', justifyContent:'space-between'
                    }}>
                        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                            <div style={{
                                width:'36px',height:'36px',borderRadius:'10px',
                                background:'rgba(0,242,255,0.12)',
                                display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'
                            }}>🌐</div>
                            <div>
                                <div style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0'}}>{lang==='ar'?'اللغة':'Language'}</div>
                                <div style={{fontSize:'10px',color:'#6b7280',marginTop:'1px'}}>{lang==='ar'?'عربي / English':'Arabic / English'}</div>
                            </div>
                        </div>
                        <div style={{
                            display:'flex',background:'rgba(255,255,255,0.05)',
                            borderRadius:'10px',padding:'3px',gap:'3px',
                            border:'1px solid rgba(255,255,255,0.08)'
                        }}>
                            {['ar','en'].map(l => (
                                <button key={l} onClick={() => onSetLang && onSetLang(l)} style={{
                                    padding:'5px 14px', borderRadius:'8px', fontSize:'11px',
                                    fontWeight: lang===l ? 800 : 500, cursor:'pointer', border:'none',
                                    background: lang===l ? 'linear-gradient(135deg,rgba(0,242,255,0.25),rgba(112,0,255,0.2))' : 'transparent',
                                    color: lang===l ? '#00f2ff' : '#6b7280',
                                    boxShadow: lang===l ? '0 0 10px rgba(0,242,255,0.15)' : 'none',
                                    transition:'all 0.2s'
                                }}>
                                    {l==='ar'?'العربية':'English'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 🛡️ ADMIN PANEL BUTTON — Staff only */}
                    {user && !isGuestPropForSettings && getUserRole(userData, user?.uid) && (
                        <div style={{marginBottom:'10px'}}>
                            <button
                                onClick={() => { onClose(); if (onOpenAdminPanel) onOpenAdminPanel(); }}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    borderRadius: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    border: '1px solid rgba(255,215,0,0.35)',
                                    background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,140,0,0.07))',
                                    color: 'white',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,215,0,0.18), rgba(255,140,0,0.12))'}
                                onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,140,0,0.07))'}
                            >
                                <div style={{ fontSize: '24px' }}>
                                    {ROLE_CONFIG[getUserRole(userData, user?.uid)]?.icon || '🛡️'}
                                </div>
                                <div style={{ flex: 1, textAlign: lang === 'ar' ? 'right' : 'left' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffd700' }}>
                                        {lang === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '1px' }}>
                                        {lang === 'ar'
                                            ? `دخول كـ ${ROLE_CONFIG[getUserRole(userData, user?.uid)]?.label_ar}`
                                            : `Access as ${ROLE_CONFIG[getUserRole(userData, user?.uid)]?.label_en}`
                                        }
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '10px', padding: '3px 10px', borderRadius: '6px', fontWeight: 700,
                                    background: `${ROLE_CONFIG[getUserRole(userData, user?.uid)]?.color || '#ffd700'}22`,
                                    border: `1px solid ${ROLE_CONFIG[getUserRole(userData, user?.uid)]?.color || '#ffd700'}44`,
                                    color: ROLE_CONFIG[getUserRole(userData, user?.uid)]?.color || '#ffd700'
                                }}>
                                    {lang === 'ar'
                                        ? ROLE_CONFIG[getUserRole(userData, user?.uid)]?.label_ar
                                        : ROLE_CONFIG[getUserRole(userData, user?.uid)]?.label_en
                                    }
                                </div>
                            </button>
                        </div>
                    )}

                    {/* ── Sound Toggle ── */}
                    <div style={{
                        marginBottom:'10px',
                        background:'linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))',
                        border:'1px solid rgba(255,255,255,0.08)',
                        borderRadius:'14px', padding:'14px 16px',
                        display:'flex', alignItems:'center', justifyContent:'space-between'
                    }}>
                        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                            <div style={{
                                width:'36px',height:'36px',borderRadius:'10px',
                                background: soundMutedLocal ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                                display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'
                            }}>{soundMutedLocal ? '🔇' : '🔊'}</div>
                            <div>
                                <div style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0'}}>{t.sound}</div>
                                <div style={{fontSize:'10px',color: soundMutedLocal?'#f87171':'#4ade80',marginTop:'1px'}}>
                                    {soundMutedLocal ? t.soundOff : t.soundOn}
                                </div>
                            </div>
                        </div>
                        <div
                            onClick={toggleSound}
                            style={{
                                width:'48px', height:'26px', borderRadius:'13px', cursor:'pointer',
                                background: soundMutedLocal ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.4)',
                                border: soundMutedLocal ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(16,185,129,0.5)',
                                position:'relative', transition:'all 0.25s'
                            }}
                        >
                            <div style={{
                                position:'absolute', top:'3px',
                                left: soundMutedLocal ? '3px' : '23px',
                                width:'18px', height:'18px', borderRadius:'50%',
                                background: soundMutedLocal ? '#ef4444' : '#10b981',
                                boxShadow: soundMutedLocal ? '0 0 6px rgba(239,68,68,0.6)' : '0 0 6px rgba(16,185,129,0.6)',
                                transition:'all 0.25s'
                            }}></div>
                        </div>
                    </div>

                    {/* ── Block Users ── */}
                    {user && !isGuestPropForSettings && (
                    <div style={{
                        marginBottom:'10px',
                        background:'linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))',
                        border:'1px solid rgba(255,255,255,0.08)',
                        borderRadius:'14px', padding:'14px 16px'
                    }}>
                        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
                            <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'rgba(239,68,68,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>🚫</div>
                            <div style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0'}}>{t.blockedUsers}</div>
                            {blockedUsers.length > 0 && (
                                <span style={{fontSize:'10px',padding:'1px 7px',borderRadius:'20px',background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',fontWeight:700}}>
                                    {blockedUsers.length}
                                </span>
                            )}
                        </div>
                        <div style={{display:'flex',gap:'8px',marginBottom:'10px'}}>
                            <input
                                type="text"
                                className="input-dark"
                                style={{flex:1,padding:'8px 12px',borderRadius:'10px',fontSize:'12px'}}
                                value={blockInput}
                                onChange={e => setBlockInput(e.target.value)}
                                placeholder={t.friendIdPlaceholder}
                            />
                            <button
                                onClick={handleBlockUser}
                                disabled={loading || !blockInput.trim()}
                                style={{
                                    padding:'8px 14px',borderRadius:'10px',fontSize:'11px',fontWeight:700,cursor:'pointer',
                                    background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.35)',
                                    color:'#f87171', opacity: loading||!blockInput.trim()?0.5:1, transition:'all 0.2s'
                                }}
                            >
                                {t.blockUser}
                            </button>
                        </div>
                        <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                            {blockedUsers.length === 0 ? (
                                <div style={{textAlign:'center',padding:'12px',color:'#4b5563',fontSize:'11px'}}>{t.noBlockedUsers}</div>
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
                    )}

                    {/* 🎫 SUPPORT TICKET SECTION */}
                    {user && !isGuestPropForSettings && (
                        <div style={{
                            background:'linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))',
                            border:'1px solid rgba(255,255,255,0.08)',
                            borderRadius:'14px', overflow:'hidden'
                        }}>
                            <SupportTicketSection user={user} userData={userData} lang={lang} onNotification={onNotification} />
                        </div>
                    )}
                    <div style={{height:'8px'}}></div>
                </div>
            </div>
        </div>
    );
};

// 🎯 PROFILE V11 - NEW PREMIUM DESIGN COMPONENTS

// 📊 WIN RATE CIRCLE COMPONENT
