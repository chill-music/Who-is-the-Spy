var LoginRewards = ({ show, onClose, userData, onClaim, lang, onOpenInventory }) => {
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

var BrowseRoomsModal = ({ show, onClose, onJoin, nickname, currentUID, currentUserData, lang }) => {
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

var TutorialModal = ({ show, onClose, lang }) => {
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
var SupportTicketSection = ({ user, userData, lang, onNotification }) => {
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
                createdAt:   TS(),
                lastUpdated: TS(),
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
                lastUpdated: TS()
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

var SettingsModal = ({ show, onClose, lang, onSetLang, userData, user, onNotification, isGuest: isGuestPropForSettings, onLoginGoogle, onOpenAdminPanel }) => {
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
                                            <input className="input-dark" style={{padding:'4px 8px',fontSize:'11px',borderRadius:'6px',width:'120px'}} value={newName} onChange={e => setNewName(e.target.value)} maxLength={10} placeholder={userData?.displayName} />
                                            <button className="btn-neon" style={{padding:'2px 8px',fontSize:'10px',borderRadius:'6px'}} onClick={async() => {
                                                if(newName.trim() && user) {
                                                    const now = new Date();
                                                    const lastChange = userData?.lastChangedName?.toDate?.() || new Date(0);
                                                    const diffDays = (now - lastChange) / (1000*60*60*24);
                                                    if(diffDays < 30) { onNotification(lang==='ar'?'يمكن التغيير مرة شهريًا':'Can change once per month'); setEditingName(false); return; }
                                                    await usersCollection.doc(user.uid).update({displayName:newName.trim(), lastChangedName:TS()});
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
                            <div style={{marginTop:'8px'}}>
                                <div style={{fontSize:'11px',color:'#9ca3af',marginBottom:'8px',display:'flex',alignItems:'center',gap:'6px'}}>
                                    🌍 {lang==='ar'?'البلد':'Country'}
                                    {userData?.country && <span style={{marginRight:'4px',marginLeft:'4px',fontWeight:700,color:'#e2e8f0'}}>{userData.country.flag} {lang==='ar'?userData.country.name_ar:userData.country.name_en}</span>}
                                </div>
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

                            {/* Language row — inside account info */}
                            <div style={{marginTop:'12px',paddingTop:'12px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                                <div style={{fontSize:'11px',color:'#9ca3af',marginBottom:'8px'}}>🌐 {lang==='ar'?'اللغة':'Language'}</div>
                                <div style={{display:'flex',background:'rgba(255,255,255,0.05)',borderRadius:'10px',padding:'3px',gap:'3px',border:'1px solid rgba(255,255,255,0.08)'}}>
                                    {['ar','en'].map(l => (
                                        <button key={l} onClick={() => onSetLang && onSetLang(l)} style={{
                                            flex:1, padding:'6px 0', borderRadius:'8px', fontSize:'11px',
                                            fontWeight: lang===l ? 800 : 500, cursor:'pointer', border:'none',
                                            background: lang===l ? 'linear-gradient(135deg,rgba(0,242,255,0.25),rgba(112,0,255,0.2))' : 'transparent',
                                            color: lang===l ? '#00f2ff' : '#6b7280',
                                            transition:'all 0.2s'
                                        }}>
                                            {l==='ar'?'🇸🇦 العربية':'🇬🇧 English'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* 🛡️ ADMIN PANEL BUTTON */}
                    {user && !isGuestPropForSettings && getUserRole(userData, user?.uid) && (
                        <div style={{marginBottom:'10px'}}>
                            <button onClick={() => { onClose(); if(onOpenAdminPanel) onOpenAdminPanel(); }}
                                style={{width:'100%',padding:'14px 16px',borderRadius:'14px',display:'flex',alignItems:'center',gap:'12px',cursor:'pointer',border:'1px solid rgba(255,215,0,0.35)',background:'linear-gradient(135deg,rgba(255,215,0,0.1),rgba(255,140,0,0.07))',color:'white',transition:'all 0.2s'}}
                                onMouseEnter={e=>e.currentTarget.style.background='linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,140,0,0.12))'}
                                onMouseLeave={e=>e.currentTarget.style.background='linear-gradient(135deg,rgba(255,215,0,0.1),rgba(255,140,0,0.07))'}>
                                <div style={{fontSize:'24px'}}>{ROLE_CONFIG[getUserRole(userData,user?.uid)]?.icon||'🛡️'}</div>
                                <div style={{flex:1,textAlign:lang==='ar'?'right':'left'}}>
                                    <div style={{fontSize:'13px',fontWeight:800,color:'#ffd700'}}>{lang==='ar'?'لوحة الإدارة':'Admin Panel'}</div>
                                    <div style={{fontSize:'10px',color:'#9ca3af',marginTop:'1px'}}>{lang==='ar'?`دخول كـ ${ROLE_CONFIG[getUserRole(userData,user?.uid)]?.label_ar}`:`Access as ${ROLE_CONFIG[getUserRole(userData,user?.uid)]?.label_en}`}</div>
                                </div>
                                <div style={{fontSize:'10px',padding:'3px 10px',borderRadius:'6px',fontWeight:700,background:`${ROLE_CONFIG[getUserRole(userData,user?.uid)]?.color||'#ffd700'}22`,border:`1px solid ${ROLE_CONFIG[getUserRole(userData,user?.uid)]?.color||'#ffd700'}44`,color:ROLE_CONFIG[getUserRole(userData,user?.uid)]?.color||'#ffd700'}}>{lang==='ar'?ROLE_CONFIG[getUserRole(userData,user?.uid)]?.label_ar:ROLE_CONFIG[getUserRole(userData,user?.uid)]?.label_en}</div>
                            </button>
                        </div>
                    )}

                    {/* ── Sound Toggle ── */}
                    <div style={{marginBottom:'10px',background:'linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                            <div style={{width:'36px',height:'36px',borderRadius:'10px',background:soundMutedLocal?'rgba(239,68,68,0.12)':'rgba(16,185,129,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>{soundMutedLocal?'🔇':'🔊'}</div>
                            <div>
                                <div style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0'}}>{t.sound}</div>
                                <div style={{fontSize:'10px',color:soundMutedLocal?'#f87171':'#4ade80',marginTop:'1px'}}>{soundMutedLocal?t.soundOff:t.soundOn}</div>
                            </div>
                        </div>
                        <div onClick={toggleSound} style={{width:'48px',height:'26px',borderRadius:'13px',cursor:'pointer',background:soundMutedLocal?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.4)',border:soundMutedLocal?'1px solid rgba(239,68,68,0.5)':'1px solid rgba(16,185,129,0.5)',position:'relative',transition:'all 0.25s'}}>
                            <div style={{position:'absolute',top:'3px',left:soundMutedLocal?'3px':'23px',width:'18px',height:'18px',borderRadius:'50%',background:soundMutedLocal?'#ef4444':'#10b981',boxShadow:soundMutedLocal?'0 0 6px rgba(239,68,68,0.6)':'0 0 6px rgba(16,185,129,0.6)',transition:'all 0.25s'}}></div>
                        </div>
                    </div>

                    {/* ── PWA Install Button ── */}
                    <div style={{marginBottom:'10px',background:'linear-gradient(135deg,rgba(0,242,255,0.04),rgba(112,0,255,0.02))',border:'1px solid rgba(0,242,255,0.15)',borderRadius:'14px',padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                            <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'rgba(0,242,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>📱</div>
                            <div>
                                <div style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0'}}>{lang === 'ar' ? 'تثبيت التطبيق' : 'Install App'}</div>
                                <div style={{fontSize:'10px',color:'#00f2ff',marginTop:'1px'}}>{lang === 'ar' ? 'للوصول السريع والمريح' : 'For fast & easy access'}</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => { if(window.triggerPWAInstall) window.triggerPWAInstall(); }}
                            style={{padding:'6px 14px', borderRadius:'10px', background:'rgba(0,242,255,0.15)', border:'1px solid rgba(0,242,255,0.3)', color:'#00f2ff', fontSize:'11px', fontWeight:800, cursor:'pointer'}}
                        >
                            {lang === 'ar' ? 'تثبيت' : 'Install'}
                        </button>
                    </div>

                    {/* ── Block Users ── */}
                    {user && !isGuestPropForSettings && (
                    <div style={{marginBottom:'10px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'14px 16px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
                            <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'rgba(239,68,68,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>🚫</div>
                            <div style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0'}}>{t.blockedUsers}</div>
                            {blockedUsers.length>0&&<span style={{fontSize:'10px',padding:'1px 7px',borderRadius:'20px',background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',fontWeight:700}}>{blockedUsers.length}</span>}
                        </div>
                        <div style={{display:'flex',gap:'8px',marginBottom:'10px'}}>
                            <input type="text" className="input-dark" style={{flex:1,padding:'8px 12px',borderRadius:'10px',fontSize:'12px'}} value={blockInput} onChange={e=>setBlockInput(e.target.value)} placeholder={t.friendIdPlaceholder} />
                            <button onClick={handleBlockUser} disabled={loading||!blockInput.trim()} style={{padding:'8px 14px',borderRadius:'10px',fontSize:'11px',fontWeight:700,cursor:'pointer',background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.35)',color:'#f87171',opacity:loading||!blockInput.trim()?0.5:1}}>
                                {t.blockUser}
                            </button>
                        </div>
                        <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                            {blockedUsers.length===0
                                ? <div style={{textAlign:'center',padding:'12px',color:'#4b5563',fontSize:'11px'}}>{t.noBlockedUsers}</div>
                                : blockedUsers.map(uid=><BlockedUserItem key={uid} uid={uid} onUnblock={()=>handleUnblockUser(uid)} lang={lang} />)
                            }
                        </div>
                    </div>
                    )}

                    <div style={{height:'8px'}}></div>
                </div>
            </div>
        </div>
    );
};

// 🎯 PROFILE V11 - NEW PREMIUM DESIGN COMPONENTS


// ════════════════════════════════════════════════════════
// 🧧 RED PACKET CARD — Tap once to see details, tap Claim to get funds
//    Used in Public Chat, Family Chat, Group Chat
// ════════════════════════════════════════════════════════
var RedPacketCard = ({ rpId, rpAmount, maxClaims, senderName, currentUID, user, currentUser, lang, onClaim }) => {
    const [showDetails, setShowDetails] = React.useState(false);
    const [rpData, setRpData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [selfClaimed, setSelfClaimed] = React.useState(false);

    // Auto-load to detect claimed state without user tap
    React.useEffect(() => {
        if (!rpId) return;
        redPacketsCollection.doc(rpId).get().then(doc => {
            if (doc.exists) {
                const d = doc.data();
                setRpData(d);
                if (d.claimedBy?.includes(user?.uid)) setSelfClaimed(true);
            }
        }).catch(()=>{});
    }, [rpId, user?.uid]);

    const fetchDetails = async () => {
        if (rpData) { setShowDetails(true); return; }
        setLoading(true);
        try {
            const doc = await redPacketsCollection.doc(rpId).get();
            if (doc.exists) setRpData(doc.data());
        } catch(e) {}
        setLoading(false);
        setShowDetails(true);
    };

    const claimed = selfClaimed || rpData?.claimedBy?.includes(user?.uid);
    const isReclaimed = rpData?.status === 'reclaimed';
    const exhausted = isReclaimed || (rpData?.claimedBy?.length||0) >= (rpData?.maxClaims||maxClaims||1);
    const remaining = rpData?.remaining ?? rpAmount;
    const claimedCount = rpData?.claimedBy?.length || 0;

    if (showDetails && rpData) return (
        <div style={{background:'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(185,28,28,0.1))',border:'1px solid rgba(239,68,68,0.4)',borderRadius:'16px',padding:'12px 14px',minWidth:'200px',maxWidth:'min(260px,calc(100vw-90px))'}}>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                <div style={{fontSize:'26px',filter:'drop-shadow(0 0 6px rgba(239,68,68,0.7))'}}>🧧</div>
                <div>
                    <div style={{fontSize:'12px',fontWeight:800,color:'#ffd700'}}>{lang==='ar'?'مغلف أحمر':'Red Packet'}</div>
                    <div style={{fontSize:'10px',color:'#fca5a5'}}>{rpAmount?.toLocaleString()} 🧠 · {lang==='ar'?'من':'from'} {senderName}</div>
                </div>
                <button onClick={()=>setShowDetails(false)} style={{marginLeft:'auto',background:'none',border:'none',color:'#6b7280',cursor:'pointer',fontSize:'14px',lineHeight:1}}>✕</button>
            </div>
            {/* Progress bar */}
            <div style={{marginBottom:'8px'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'9px',color:'#9ca3af',marginBottom:'3px'}}>
                    <span>{lang==='ar'?'تم الاستلام':'Claimed'}: {claimedCount}/{rpData.maxClaims||maxClaims}</span>
                    <span>{lang==='ar'?'متبقي':'Remaining'}: {remaining?.toLocaleString?.()} 🧠</span>
                </div>
                <div style={{height:'4px',borderRadius:'2px',background:'rgba(255,255,255,0.1)',overflow:'hidden'}}>
                    <div style={{height:'100%',borderRadius:'2px',background:'linear-gradient(90deg,#ef4444,#fbbf24)',width:`${Math.min(100,((claimedCount/(rpData.maxClaims||maxClaims||1))*100))}%`}}/>
                </div>
            </div>
            {!claimed && !exhausted && (
                <button onClick={()=>{onClaim(rpId);setShowDetails(false);}} style={{width:'100%',padding:'8px',borderRadius:'10px',background:'linear-gradient(135deg,rgba(239,68,68,0.3),rgba(185,28,28,0.2))',border:'1px solid rgba(239,68,68,0.5)',color:'#ffd700',fontSize:'12px',fontWeight:800,cursor:'pointer'}}>
                    🎁 {lang==='ar'?'استلم الآن':'Claim Now'}
                </button>
            )}
            {claimed && <div style={{textAlign:'center',fontSize:'11px',color:'#4ade80',padding:'6px'}}>✅ {lang==='ar'?'استلمته':'Claimed'}</div>}
            {isReclaimed && !claimed && <div style={{textAlign:'center',fontSize:'11px',color:'#f87171',padding:'6px'}}>↩ {lang==='ar'?'تم استرداد المغلف':'Packet reclaimed'}</div>}
            {exhausted && !claimed && !isReclaimed && <div style={{textAlign:'center',fontSize:'11px',color:'#6b7280',padding:'6px'}}>🔴 {lang==='ar'?'نفد المغلف':'Exhausted'}</div>}
        </div>
    );

    return (
        <button onClick={fetchDetails} style={{
            display:'flex',alignItems:'center',gap:'10px',padding:'11px 15px',borderRadius:'16px',
            background: claimed
                ? 'linear-gradient(135deg,rgba(75,85,99,0.28),rgba(55,65,81,0.2))'
                : 'linear-gradient(135deg,rgba(239,68,68,0.25),rgba(185,28,28,0.2))',
            border: claimed ? '1px solid rgba(107,114,128,0.3)' : '1px solid rgba(239,68,68,0.5)',
            cursor:'pointer',
            boxShadow: claimed ? 'none' : '0 4px 16px rgba(239,68,68,0.25)',
            textAlign:'left',
            maxWidth:'min(260px,calc(100vw-90px))',
            opacity: claimed ? 0.55 : 1,
            transition:'all 0.25s',
        }}>
            <div style={{fontSize:'30px',filter: claimed ? 'grayscale(1) opacity(0.5)' : 'drop-shadow(0 0 8px rgba(239,68,68,0.7))'}}>{loading?'⏳':'🧧'}</div>
            <div>
                <div style={{fontSize:'12px',fontWeight:800,color: claimed ? '#6b7280' : '#ffd700'}}>{lang==='ar'?'مغلف أحمر':'Red Packet'}</div>
                <div style={{fontSize:'10px',color: claimed ? '#4b5563' : '#fca5a5',marginTop:'2px'}}>{rpAmount?.toLocaleString()} 🧠 · {maxClaims} {lang==='ar'?'استلام':'claims'}</div>
                <div style={{fontSize:'9px',color: claimed ? '#374151' : 'rgba(252,165,165,0.6)',marginTop:'2px'}}>
                    {claimed ? (lang==='ar'?'✅ تم الاستلام':'✅ Claimed') : (lang==='ar'?'اضغط للتفاصيل':'Tap for details')}
                </div>
            </div>
        </button>
    );
};

// ════════════════════════════════════════════════════════
// 🌍 LOBBY PUBLIC CHAT BOX — Inline in Lobby
// ════════════════════════════════════════════════════════
var LobbyPublicChatBox = ({ currentUser, user, lang, isLoggedIn, onOpenProfile, currentUID, onOpenFull }) => {
    const [messages, setMessages] = React.useState([]);
    const [msgText, setMsgText] = React.useState('');
    const [sending, setSending] = React.useState(false);
    const [cooldown, setCooldown]   = React.useState(0); // seconds remaining
    const messagesEndRef = React.useRef(null);
    const inputRef = React.useRef(null);
    const cooldownRef = React.useRef(null);

    const isFirstLoad = React.useRef(true);
    React.useEffect(() => {
        const unsub = publicChatCollection
            .orderBy('createdAt', 'asc')
            .limitToLast(30)
            .onSnapshot(snap => {
                setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                // Only auto-scroll after user has interacted (not on initial page load)
                if (!isFirstLoad.current) {
                    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
                }
                isFirstLoad.current = false;
            }, () => {});
        return () => unsub();
    }, []);

    const sendMsg = async () => {
        if (!msgText.trim() || !user || !isLoggedIn || sending || cooldown > 0) return;
        const text = msgText.trim(); setMsgText(''); setSending(true);
        try {
            const vipLevel = (typeof getVIPLevel === 'function') ? (getVIPLevel(currentUser) || 0) : 0;
            await publicChatCollection.add({
                type: 'text', text,
                senderId: user.uid,
                senderName: currentUser?.displayName || 'User',
                senderPhoto: currentUser?.photoURL || null,
                senderVipLevel: vipLevel,
                senderTitle: currentUser?.activeTitle || null,
                senderFrame: currentUser?.equipped?.frames || null,
                senderBadges: (currentUser?.equipped?.badges || []).slice(0, 3),
                createdAt: TS(),
            });
            // ── 5-second cooldown after each message ──
            setCooldown(5);
            if (cooldownRef.current) clearInterval(cooldownRef.current);
            cooldownRef.current = setInterval(() => {
                setCooldown(prev => {
                    if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
                    return prev - 1;
                });
            }, 1000);
        } catch(e) { setMsgText(text); }
        setSending(false);
    };

    const fmtTs = (ts) => {
        if (!ts) return '';
        const d = ts?.toDate ? ts.toDate() : new Date((ts?.seconds||0)*1000);
        return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    };

    const visibleMsgs = messages.filter(m => m.type === 'text' || m.type === 'image' || m.type === 'red_packet');

    return (
        <div style={{margin:'0 8px 16px',background:'linear-gradient(160deg,rgba(5,5,18,0.98),rgba(9,8,26,0.96))',border:'1px solid rgba(74,222,128,0.15)',borderRadius:'16px',overflow:'hidden',boxSizing:'border-box',width:'calc(100% - 16px)'}}>
            {/* Messages */}
            <div style={{height:'clamp(140px,25vw,200px)',overflowY:'auto',padding:'10px 10px 4px',display:'flex',flexDirection:'column',gap:'4px'}}>
                {visibleMsgs.length === 0 && (
                    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'#4b5563',fontSize:'11px',flexDirection:'column',gap:'4px'}}>
                        <span style={{fontSize:'24px'}}>🌍</span>
                        <span>{lang==='ar'?'لا رسائل بعد — كن الأول!':'No messages yet — be the first!'}</span>
                    </div>
                )}
                {visibleMsgs.map((msg, i) => {
                    const isMe = msg.senderId === currentUID;
                    const vipCfg = getVIPConfig(msg.senderVipLevel);
                    if (msg.type === 'red_packet') return (
                        <div key={msg.id||i} style={{alignSelf:'center',fontSize:'10px',color:'#ffd700',padding:'3px 10px',background:'rgba(239,68,68,0.08)',borderRadius:'12px',border:'1px solid rgba(239,68,68,0.2)'}}>
                            🧧 {msg.senderName} {lang==='ar'?'أرسل مغلف':'sent a packet'} {msg.rpAmount?.toLocaleString()} 🧠
                        </div>
                    );
                    return (
                        <div key={msg.id||i} style={{display:'flex',flexDirection:isMe?'row-reverse':'row',gap:'6px',alignItems:'flex-end'}}>
                            {/* Avatar — clickable */}
                            <div onClick={() => onOpenProfile && onOpenProfile(msg.senderId)}
                                style={{width:'24px',height:'24px',borderRadius:'50%',overflow:'hidden',flexShrink:0,cursor:'pointer',border:vipCfg?`1.5px solid ${vipCfg.nameColor}`:'1.5px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.08)'}}>
                                {msg.senderPhoto ? <img src={msg.senderPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span style={{fontSize:'11px',display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>😎</span>}
                            </div>
                            <div style={{maxWidth:'min(70%, calc(100vw - 70px))' }}>
                                <div onClick={() => onOpenProfile && onOpenProfile(msg.senderId)}
                                    style={{display:'flex',alignItems:'center',gap:'3px',marginBottom:'1px',cursor:'pointer',justifyContent:isMe?'flex-end':'flex-start'}}>
                                    <span style={{fontSize:'8px',fontWeight:700,color:vipCfg?vipCfg.nameColor:'#a78bfa'}}>{msg.senderName}</span>
                                    {vipCfg && <span style={{fontSize:'7px',fontWeight:900,background:vipCfg.nameColor,color:'#000',padding:'0 2px',borderRadius:'2px'}}>VIP{msg.senderVipLevel}</span>}
                                    {msg.senderVipLevel > 0 && typeof VIP_CHAT_TITLE_URLS !== 'undefined' && VIP_CHAT_TITLE_URLS?.[msg.senderVipLevel] && <img src={VIP_CHAT_TITLE_URLS[msg.senderVipLevel]} alt="" style={{height:'10px',objectFit:'contain'}}/>}
                                </div>
                                {msg.type === 'image' ? (
                                    <div style={{borderRadius:'8px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.08)',maxWidth:'min(120px, calc(100vw - 90px))'}}>
                                        <img src={msg.imageData} alt="📷" style={{display:'block',maxWidth:'min(120px, calc(100vw - 90px))',maxHeight:'120px',objectFit:'cover'}}/>
                                    </div>
                                ) : (
                                    <div style={{padding:'6px 10px',borderRadius:isMe?'12px 4px 12px 12px':'4px 12px 12px 12px',background:isMe?'linear-gradient(135deg,rgba(112,0,255,0.35),rgba(0,242,255,0.15))':'rgba(255,255,255,0.07)',border:isMe?'1px solid rgba(0,242,255,0.15)':'1px solid rgba(255,255,255,0.08)',fontSize:'11px',color:'#e2e8f0',lineHeight:1.4,wordBreak:'break-word'}}>
                                        {msg.text}
                                    </div>
                                )}
                                <div style={{fontSize:'8px',color:'#374151',marginTop:'1px',textAlign:isMe?'right':'left',paddingLeft:'2px'}}>{fmtTs(msg.createdAt)}</div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef}/>
            </div>
            {/* Input */}
            {isLoggedIn ? (
                <div style={{display:'flex',gap:'4px',padding:'7px 8px',borderTop:'1px solid rgba(255,255,255,0.06)',background:'rgba(0,0,0,0.3)',boxSizing:'border-box',width:'100%'}}>
                    <input ref={inputRef} value={msgText} onChange={e=>setMsgText(e.target.value)}
                        onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),sendMsg())}
                        style={{flex:1,padding:'7px 8px',borderRadius:'10px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:'12px',outline:'none',minWidth:0}}
                        placeholder={lang==='ar'?'اكتب...':'Write...'}/>
                    <button onClick={sendMsg} disabled={!msgText.trim()||sending||cooldown>0}
                        style={{width:'34px',height:'34px',borderRadius:'10px',border:'none',background:(msgText.trim()&&cooldown===0)?'linear-gradient(135deg,#7000ff,#00f2ff)':'rgba(255,255,255,0.05)',color:(msgText.trim()&&cooldown===0)?'white':'#4b5563',fontSize:cooldown>0?'10px':'14px',fontWeight:cooldown>0?900:400,cursor:(msgText.trim()&&cooldown===0)?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        {cooldown > 0 ? cooldown : '➤'}
                    </button>
                    <button onClick={onOpenFull}
                        style={{width:'34px',height:'34px',borderRadius:'10px',border:'1px solid rgba(74,222,128,0.3)',background:'rgba(74,222,128,0.08)',color:'#4ade80',fontSize:'13px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}} title={lang==='ar'?'فتح كامل':'Open full'}>⛶</button>
                </div>
            ) : (
                <div style={{padding:'8px 12px',borderTop:'1px solid rgba(255,255,255,0.06)',textAlign:'center',color:'#6b7280',fontSize:'11px'}}>
                    🔐 {lang==='ar'?'سجّل دخول للكتابة':'Login to chat'}
                    <button onClick={onOpenFull} style={{marginLeft:'8px',padding:'3px 10px',borderRadius:'8px',background:'rgba(74,222,128,0.1)',border:'1px solid rgba(74,222,128,0.3)',color:'#4ade80',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>{lang==='ar'?'قراءة':'Read'}</button>
                </div>
            )}
        </div>
    );
};

// ════════════════════════════════════════════════════════
// 👑 VIP CENTER MODAL — Standalone full-screen
// ════════════════════════════════════════════════════════
var VIPCenterModal = ({ show, onClose, userData, user, lang, onNotification, onOpenShop }) => {
    if (!show) return null;
    return (
        <PortalModal>
            <div style={{position:'fixed',inset:0,zIndex:Z.MODAL_HIGH,background:'rgba(0,0,0,0.88)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'8px'}} onClick={onClose}>
                <div onClick={e=>e.stopPropagation()} style={{
                    width:'100%',maxWidth:'min(440px, calc(100vw - 16px))',maxHeight:'92vh',
                    background:'linear-gradient(160deg,rgba(8,6,20,0.99),rgba(14,10,32,0.99))',
                    border:'1px solid rgba(255,215,0,0.2)',borderRadius:'20px',overflow:'hidden',
                    display:'flex',flexDirection:'column',boxShadow:'0 28px 80px rgba(0,0,0,0.9),0 0 60px rgba(255,215,0,0.06)',
                    boxSizing:'border-box',
                }}>
                    {/* Header */}
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 18px',borderBottom:'1px solid rgba(255,215,0,0.15)',background:'linear-gradient(135deg,rgba(255,215,0,0.08),rgba(255,140,0,0.04))',flexShrink:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                            <div style={{fontSize:'28px'}}>👑</div>
                            <div>
                                <div style={{fontSize:'16px',fontWeight:900,color:'#ffd700',letterSpacing:'0.02em'}}>{lang==='ar'?'مركز VIP':'VIP Center'}</div>
                                <div style={{fontSize:'10px',color:'#9ca3af',marginTop:'1px'}}>{lang==='ar'?'امتيازاتك الحصرية':'Your exclusive privileges'}</div>
                            </div>
                        </div>
                        <button onClick={onClose} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'6px 10px',color:'#9ca3af',fontSize:'16px',cursor:'pointer'}}>✕</button>
                    </div>
                    {/* Body — reuse VIPCenterSection */}
                    <div style={{flex:1,overflowY:'auto',padding:'12px 0'}}>
                        <VIPCenterSection userData={userData} user={user} lang={lang} onNotification={onNotification} />
                        {/* Buy VIP button */}
                        <div style={{padding:'14px 16px 8px'}}>
                            <button onClick={()=>{onClose();if(onOpenShop)onOpenShop();}}
                                style={{width:'100%',padding:'13px',borderRadius:'14px',border:'1px solid rgba(255,215,0,0.4)',background:'linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,140,0,0.1))',color:'#ffd700',fontSize:'13px',fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                                🛒 {lang==='ar'?'اشتري VIP من المتجر':'Buy VIP from Shop'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PortalModal>
    );
};

// ════════════════════════════════════════════════════════
// 💬 HELP CENTER MODAL — FAQ + Tickets + Feedback
// ════════════════════════════════════════════════════════
var HelpCenterModal = ({ show, onClose, user, userData, lang, onNotification, isLoggedIn }) => {
    const [activeTab, setActiveTab] = React.useState('faq');
    const [faqs, setFaqs] = React.useState([]);
    const [openFaq, setOpenFaq] = React.useState(null);
    const [loadingFaqs, setLoadingFaqs] = React.useState(true);
    const [feedbackText, setFeedbackText] = React.useState('');
    const [feedbackRating, setFeedbackRating] = React.useState(5);
    const [sendingFeedback, setSendingFeedback] = React.useState(false);

    React.useEffect(() => {
        if (!show) return;
        setLoadingFaqs(true);
        const unsub = helpFaqCollection.onSnapshot(snap => {
            let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            data.sort((a, b) => (a.order||99) - (b.order||99));
            setFaqs(data);
            setLoadingFaqs(false);
        }, () => setLoadingFaqs(false));
        return () => unsub();
    }, [show]);

    const handleSendFeedback = async () => {
        if (!feedbackText.trim() || !user) return;
        setSendingFeedback(true);
        try {
            await feedbackCollection.add({
                userId: user.uid,
                userName: userData?.displayName || 'User',
                userPhoto: userData?.photoURL || '',
                text: feedbackText.trim(),
                rating: feedbackRating,
                createdAt: TS(),
                status: 'new',
            });
            setFeedbackText('');
            setFeedbackRating(5);
            onNotification(lang==='ar' ? '✅ شكراً على رأيك!' : '✅ Thanks for your feedback!');
        } catch(e) { onNotification(lang==='ar' ? '❌ خطأ' : '❌ Error'); }
        setSendingFeedback(false);
    };

    if (!show) return null;

    const tabs = [
        { id: 'faq',      icon: '❓', label_ar: 'الأسئلة الشائعة', label_en: 'FAQ' },
        { id: 'tickets',  icon: '🎫', label_ar: 'التذاكر',          label_en: 'Tickets' },
        { id: 'feedback', icon: '📝', label_ar: 'فيدباك',           label_en: 'Feedback' },
    ];

    return (
        <PortalModal>
            <div style={{position:'fixed',inset:0,zIndex:Z.MODAL_HIGH,background:'rgba(0,0,0,0.88)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'8px'}} onClick={onClose}>
                <div onClick={e=>e.stopPropagation()} style={{
                    width:'100%',maxWidth:'min(440px, calc(100vw - 16px))',maxHeight:'92vh',
                    background:'linear-gradient(160deg,rgba(5,5,18,0.99),rgba(9,8,26,0.99))',
                    border:'1px solid rgba(0,242,255,0.15)',borderRadius:'20px',overflow:'hidden',
                    display:'flex',flexDirection:'column',boxShadow:'0 28px 80px rgba(0,0,0,0.9)',
                    boxSizing:'border-box',
                }}>
                    {/* Header */}
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 18px',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                            <div style={{width:'40px',height:'40px',borderRadius:'12px',background:'rgba(0,242,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px'}}>💬</div>
                            <div>
                                <div style={{fontSize:'16px',fontWeight:900,color:'#e2e8f0'}}>{lang==='ar'?'مركز المساعدة':'Help Center'}</div>
                                <div style={{fontSize:'10px',color:'#6b7280',marginTop:'1px'}}>{lang==='ar'?'أسئلة، تذاكر، آراء':'FAQ, tickets & feedback'}</div>
                            </div>
                        </div>
                        <button onClick={onClose} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'6px 10px',color:'#9ca3af',fontSize:'16px',cursor:'pointer'}}>✕</button>
                    </div>
                    {/* Tabs */}
                    <div style={{display:'flex',borderBottom:'1px solid rgba(255,255,255,0.06)',flexShrink:0,background:'rgba(0,0,0,0.2)'}}>
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
                                flex:1,padding:'11px 0',border:'none',cursor:'pointer',fontSize:'11px',fontWeight:700,
                                background:'transparent',
                                color:activeTab===tab.id?'#00f2ff':'#6b7280',
                                borderBottom:activeTab===tab.id?'2px solid #00f2ff':'2px solid transparent',
                                transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center',gap:'4px',
                            }}>
                                <span>{tab.icon}</span><span>{lang==='ar'?tab.label_ar:tab.label_en}</span>
                            </button>
                        ))}
                    </div>
                    {/* Content */}
                    <div style={{flex:1,overflowY:'auto'}}>

                        {/* ── FAQ TAB ── */}
                        {activeTab === 'faq' && (
                            <div style={{padding:'14px 16px'}}>
                                {loadingFaqs ? (
                                    <div style={{textAlign:'center',padding:'40px',color:'#6b7280'}}>⏳</div>
                                ) : faqs.length === 0 ? (
                                    <div style={{textAlign:'center',padding:'40px',color:'#4b5563'}}>
                                        <div style={{fontSize:'36px',marginBottom:'12px'}}>❓</div>
                                        <div style={{fontSize:'13px',fontWeight:600,color:'#6b7280'}}>{lang==='ar'?'لا توجد أسئلة بعد':'No FAQs yet'}</div>
                                    </div>
                                ) : faqs.map(faq => (
                                    <div key={faq.id} style={{marginBottom:'8px',borderRadius:'14px',overflow:'hidden',border:`1px solid ${openFaq===faq.id?'rgba(0,242,255,0.3)':'rgba(255,255,255,0.07)'}`,background:openFaq===faq.id?'rgba(0,242,255,0.05)':'rgba(255,255,255,0.03)'}}>
                                        <button onClick={()=>setOpenFaq(openFaq===faq.id?null:faq.id)} style={{
                                            width:'100%',padding:'13px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',
                                            background:'none',border:'none',cursor:'pointer',textAlign:'left',
                                        }}>
                                            <div style={{display:'flex',alignItems:'center',gap:'10px',flex:1}}>
                                                <span style={{fontSize:'18px',flexShrink:0}}>{faq.emoji||'❓'}</span>
                                                <span style={{fontSize:'13px',fontWeight:700,color:openFaq===faq.id?'#00f2ff':'#e2e8f0',flex:1,textAlign:'left'}}>{lang==='ar'?faq.question_ar:faq.question_en}</span>
                                            </div>
                                            <span style={{fontSize:'14px',color:openFaq===faq.id?'#00f2ff':'#6b7280',flexShrink:0,marginLeft:'8px',transform:openFaq===faq.id?'rotate(180deg)':'none',transition:'transform 0.2s'}}>▾</span>
                                        </button>
                                        {openFaq === faq.id && (
                                            <div style={{padding:'0 16px 14px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                                                <div style={{fontSize:'12px',color:'#9ca3af',lineHeight:1.7,paddingTop:'10px'}}>{lang==='ar'?faq.answer_ar:faq.answer_en}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── TICKETS TAB ── */}
                        {activeTab === 'tickets' && (
                            <div>
                                {!isLoggedIn ? (
                                    <div style={{textAlign:'center',padding:'40px 24px',color:'#6b7280'}}>
                                        <div style={{fontSize:'36px',marginBottom:'12px'}}>🔐</div>
                                        <div style={{fontSize:'13px'}}>{lang==='ar'?'يجب تسجيل الدخول لإرسال تذكرة':'Login required to submit tickets'}</div>
                                    </div>
                                ) : (
                                    <div style={{padding:'0'}}>
                                        <SupportTicketSection user={user} userData={userData} lang={lang} onNotification={onNotification} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── FEEDBACK TAB ── */}
                        {activeTab === 'feedback' && (
                            <div style={{padding:'16px'}}>
                                {!isLoggedIn ? (
                                    <div style={{textAlign:'center',padding:'40px 24px',color:'#6b7280'}}>
                                        <div style={{fontSize:'36px',marginBottom:'12px'}}>🔐</div>
                                        <div style={{fontSize:'13px'}}>{lang==='ar'?'يجب تسجيل الدخول':'Login required'}</div>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{marginBottom:'16px',textAlign:'center'}}>
                                            <div style={{fontSize:'14px',fontWeight:700,color:'#e2e8f0',marginBottom:'6px'}}>📝 {lang==='ar'?'شاركنا رأيك':'Share your feedback'}</div>
                                            <div style={{fontSize:'11px',color:'#6b7280'}}>{lang==='ar'?'رأيك يساعدنا على التحسين':'Your opinion helps us improve'}</div>
                                        </div>
                                        {/* Rating stars */}
                                        <div style={{display:'flex',justifyContent:'center',gap:'8px',marginBottom:'16px'}}>
                                            {[1,2,3,4,5].map(star => (
                                                <button key={star} onClick={()=>setFeedbackRating(star)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'28px',opacity:feedbackRating>=star?1:0.3,transition:'all 0.15s',filter:feedbackRating>=star?'drop-shadow(0 0 6px rgba(251,191,36,0.8))':'none'}}>⭐</button>
                                            ))}
                                        </div>
                                        <textarea value={feedbackText} onChange={e=>setFeedbackText(e.target.value.slice(0,500))}
                                            style={{width:'100%',padding:'12px',borderRadius:'12px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:'13px',resize:'vertical',minHeight:'100px',outline:'none',boxSizing:'border-box',marginBottom:'10px',lineHeight:1.6}}
                                            placeholder={lang==='ar'?'اكتب رأيك هنا...':'Write your feedback here...'} />
                                        <div style={{fontSize:'10px',color:'#4b5563',textAlign:'right',marginBottom:'12px'}}>{feedbackText.length}/500</div>
                                        <button onClick={handleSendFeedback} disabled={sendingFeedback||!feedbackText.trim()}
                                            style={{width:'100%',padding:'13px',borderRadius:'12px',border:'none',background:feedbackText.trim()?'linear-gradient(135deg,rgba(0,242,255,0.25),rgba(112,0,255,0.22))':'rgba(255,255,255,0.05)',color:feedbackText.trim()?'#00f2ff':'#4b5563',fontSize:'13px',fontWeight:800,cursor:feedbackText.trim()?'pointer':'default',transition:'all 0.2s',opacity:sendingFeedback?0.6:1}}>
                                            {sendingFeedback?'⏳...':`📤 ${lang==='ar'?'إرسال الفيدباك':'Send Feedback'}`}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PortalModal>
    );
};

// ════════════════════════════════════════════════════════
// 🌍 PUBLIC CHAT MODAL — Global chat with gifts & red packets
// ════════════════════════════════════════════════════════
var PublicChatModal = ({ show, onClose, currentUser, user, lang, onNotification, isLoggedIn, onOpenProfile, currentUID }) => {
    const [messages, setMessages] = React.useState([]);
    const [msgText, setMsgText] = React.useState('');
    const [sending, setSending] = React.useState(false);
    const [editingMsgId, setEditingMsgId] = React.useState(null);
    const [editText, setEditText] = React.useState('');
    const [uploadingImg, setUploadingImg] = React.useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
    const [showRPModal, setShowRPModal] = React.useState(false);
    const [sendingRP, setSendingRP] = React.useState(false);
    const [menuMsgId, setMenuMsgId] = React.useState(null);
    // ── Mini Profile state ──
    const [miniProfilePub, setMiniProfilePub] = React.useState(null);
    const [miniMenuPub, setMiniMenuPub] = React.useState(false);
    const messagesEndRef = React.useRef(null);
    const inputRef = React.useRef(null);
    const fileInputRef = React.useRef(null);

    React.useEffect(() => {
        if (!show) return;
        const unsub = publicChatCollection
            .orderBy('createdAt', 'asc')
            .limitToLast(100)
            .onSnapshot(snap => {
                setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }, () => {});
        return () => unsub();
    }, [show]);

    const sendMsg = async () => {
        if (!msgText.trim() || !user || !isLoggedIn || sending) return;
        const text = msgText.trim(); setMsgText(''); setSending(true);
        try {
            const vipLevel = (typeof getVIPLevel === 'function') ? (getVIPLevel(currentUser) || 0) : 0;
            await publicChatCollection.add({
                type: 'text', text,
                senderId: user.uid,
                senderName: currentUser?.displayName || 'User',
                senderPhoto: currentUser?.photoURL || null,
                senderVipLevel: vipLevel,
                senderTitle: currentUser?.activeTitle || null,
                senderFrame: currentUser?.equipped?.frames || null,
                senderBadges: (currentUser?.equipped?.badges || []).slice(0, 3),
                senderFamilyName: null,
                createdAt: TS(),
            });
        } catch(e) { setMsgText(text); }
        setSending(false);
    };

    const handleImgUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/') || !user || uploadingImg) return;
        setUploadingImg(true);
        try {
            const base64 = await compressImageToBase64(file);
            await publicChatCollection.add({
                type: 'image', imageData: base64, text: '📷',
                senderId: user.uid, senderName: currentUser?.displayName || 'User',
                senderPhoto: currentUser?.photoURL || null,
                createdAt: TS(),
            });
        } catch(e) { onNotification(lang==='ar'?'❌ فشل رفع الصورة':'❌ Image upload failed'); }
        setUploadingImg(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDeleteMsg = async (msgId) => {
        if (!msgId) return;
        try { await publicChatCollection.doc(msgId).delete(); }
        catch(e) { onNotification(lang==='ar'?'❌ خطأ':'❌ Error'); }
        setMenuMsgId(null);
    };

    const handleEditMsg = async (msgId) => {
        if (!editText.trim() || !msgId) return;
        try { await publicChatCollection.doc(msgId).update({ text: editText.trim(), edited: true }); }
        catch(e) { onNotification(lang==='ar'?'❌ خطأ':'❌ Error'); }
        setEditingMsgId(null); setEditText('');
    };

    const handleReport = async (msg) => {
        if (!user) return;
        try {
            await reportsCollection.add({
                type: 'public_chat', msgId: msg.id, msgText: msg.text,
                reporterUID: user.uid, reporterName: currentUser?.displayName || 'User',
                reportedUID: msg.senderId, reportedName: msg.senderName,
                createdAt: TS(), status: 'pending',
            });
            onNotification(lang==='ar'?'✅ تم إرسال البلاغ':'✅ Report sent');
        } catch(e) {}
        setMenuMsgId(null);
    };

    const sendPublicRP = async (rp) => {
        if (!user || !currentUser || sendingRP) return;
        if ((currentUser?.currency||0) < rp.amount) { onNotification(lang==='ar'?'❌ رصيد غير كافٍ':'❌ Insufficient balance'); return; }
        setSendingRP(true);
        try {
            const rpRef = await redPacketsCollection.add({
                configId: rp.id, amount: rp.amount,
                senderId: user.uid, senderName: currentUser.displayName || 'User', senderPhoto: currentUser.photoURL || null,
                targetType: 'public', targetId: 'public', targetName: 'Public',
                claimedBy: [], maxClaims: rp.maxClaims, remaining: rp.amount,
                createdAt: TS(), status: 'active',
            });
            await usersCollection.doc(user.uid).update({ currency: firebase.firestore.FieldValue.increment(-rp.amount) });
            await publicChatCollection.add({
                type: 'red_packet', rpId: rpRef.id, rpAmount: rp.amount, rpConfigId: rp.id,
                senderId: user.uid, senderName: currentUser.displayName || 'User', senderPhoto: currentUser.photoURL || null,
                text: `🧧 ${rp.amount}`, createdAt: TS(), maxClaims: rp.maxClaims,
            });
            setShowRPModal(false);
            onNotification(lang==='ar'?'✅ تم إرسال المغلف!':'✅ Packet sent!');
        } catch(e) { onNotification(lang==='ar'?'❌ خطأ':'❌ Error'); }
        setSendingRP(false);
    };

    const claimPublicRP = async (rpId) => {
        if (!rpId || !user) return;
        try {
            const rpDoc = await redPacketsCollection.doc(rpId).get();
            if (!rpDoc.exists) return;
            const rp = rpDoc.data();
            // ❌ المرسل لا يستطيع الاستلام من مغلفه في الشات العام
            if (rp.senderId === user.uid) { onNotification(lang==='ar'?'❌ لا يمكنك استلام مغلفك الخاص':'❌ You cannot claim your own packet'); return; }
            if (rp.claimedBy?.includes(user.uid)) { onNotification(lang==='ar'?'❌ استلمته من قبل':'❌ Already claimed'); return; }
            if ((rp.claimedBy?.length||0) >= rp.maxClaims) { onNotification(lang==='ar'?'❌ نفد المغلف':'❌ Exhausted'); return; }
            const perClaim = Math.floor(rp.amount / rp.maxClaims);
            const bonus = Math.floor(Math.random() * Math.floor(perClaim * 0.5));
            const claim = Math.min(perClaim + bonus, rp.remaining || rp.amount);
            await redPacketsCollection.doc(rpId).update({
                claimedBy: firebase.firestore.FieldValue.arrayUnion(user.uid),
                remaining: firebase.firestore.FieldValue.increment(-claim),
                status: ((rp.claimedBy?.length||0) + 1 >= rp.maxClaims) ? 'exhausted' : 'active',
            });
            await usersCollection.doc(user.uid).update({ currency: firebase.firestore.FieldValue.increment(claim) });
            await publicChatCollection.add({
                type: 'system',
                text: lang==='ar' ? `🎉 ${currentUser?.displayName||'مستخدم'} استلم ${claim} 🧠 من مغلف ${rp.senderName}` : `🎉 ${currentUser?.displayName||'User'} claimed ${claim} 🧠 from ${rp.senderName}'s packet`,
                createdAt: TS(), senderId: 'system',
            });
            onNotification(lang==='ar'?`🎉 استلمت ${claim} Intel!`:`🎉 You got ${claim} Intel!`);
        } catch(e) { onNotification(lang==='ar'?'❌ خطأ':'❌ Error'); }
    };

    const fmtTs = (ts) => {
        if (!ts) return '';
        const d = ts?.toDate ? ts.toDate() : new Date(ts?.seconds*1000||ts);
        return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    };

    // ── Open Mini Profile (instead of full profile) ──
    const openMiniProfilePub = async (uid, basicData) => {
        if (!uid) return;
        setMiniMenuPub(false);
        setMiniProfilePub({ uid, name: basicData?.name || '...', photo: basicData?.photo || null, loading: true });
        const friends = user ? ((currentUser?.friends || []).concat([])) : [];
        const data = await fetchMiniProfileData(uid, friends);
        if (data) setMiniProfilePub(data);
    };

    if (!show) return null;

    return (
        <PortalModal>
            <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImgUpload}/>
            <div style={{position:'fixed',inset:0,zIndex:Z.MODAL_HIGH,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',padding:'4px'}} onClick={onClose}>
                <div onClick={e=>e.stopPropagation()} style={{
                    width:'100%',maxWidth:'min(480px, calc(100vw - 8px))',
                    height:'min(92vh, 720px)',
                    minHeight:'400px',
                    background:'linear-gradient(160deg,rgba(5,5,18,0.99),rgba(9,8,26,0.99))',
                    border:'1px solid rgba(74,222,128,0.15)',borderRadius:'16px',overflow:'hidden',
                    display:'flex',flexDirection:'column',boxShadow:'0 28px 80px rgba(0,0,0,0.9)',
                    boxSizing:'border-box', position:'relative',
                }}>
                    {/* Header */}
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0,background:'rgba(0,0,0,0.3)'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                            <div style={{width:'38px',height:'38px',borderRadius:'12px',background:'rgba(74,222,128,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>🌍</div>
                            <div>
                                <div style={{fontSize:'15px',fontWeight:800,color:'#e2e8f0'}}>{lang==='ar'?'الشات العام':'Public Chat'}</div>
                                <div style={{fontSize:'10px',color:'#6b7280',marginTop:'1px'}}>{lang==='ar'?'الجميع هنا':'Everyone is here'}</div>
                            </div>
                        </div>
                        <button onClick={onClose} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'6px 10px',color:'#9ca3af',fontSize:'16px',cursor:'pointer'}}>✕</button>
                    </div>

                    {/* Messages */}
                    <div style={{flex:1,overflowY:'auto',padding:'10px',display:'flex',flexDirection:'column',gap:'6px'}}>
                        {messages.map((msg,i) => {
                            if (msg.type === 'system' || msg.type === 'red_packet_announce') return (
                                <div key={msg.id||i} style={{textAlign:'center',fontSize:'10px',color:'#6b7280',padding:'3px 12px',background:'rgba(255,255,255,0.04)',borderRadius:'20px',alignSelf:'center',maxWidth:'90%'}}>{msg.text}</div>
                            );
                            if (msg.type === 'red_packet') {
                                const isMe = msg.senderId === currentUID;
                                return (
                                    <div key={msg.id||i} style={{display:'flex',flexDirection:isMe?'row-reverse':'row',gap:'8px',alignItems:'flex-end'}}>
                                        <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',overflow:'hidden',flexShrink:0,cursor:'pointer',border:'2px solid rgba(239,68,68,0.4)'}} onClick={()=>openMiniProfilePub(msg.senderId,{name:msg.senderName,photo:msg.senderPhoto})}>
                                            {msg.senderPhoto?<img src={msg.senderPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>😎</span>}
                                        </div>
                                        <div>
                                            <div style={{fontSize:'10px',fontWeight:700,marginBottom:'3px',paddingLeft:isMe?0:'4px',paddingRight:isMe?'4px':0,textAlign:isMe?'right':'left',cursor:'pointer',color:'#fca5a5'}} onClick={()=>openMiniProfilePub(msg.senderId,{name:msg.senderName,photo:msg.senderPhoto})}>{isMe?(lang==='ar'?'أنت':'You'):msg.senderName}</div>
                                            <RedPacketCard rpId={msg.rpId} rpAmount={msg.rpAmount} maxClaims={msg.maxClaims} senderId={msg.senderId} senderName={msg.senderName} currentUID={currentUID} user={user} currentUser={currentUser} lang={lang} onClaim={claimPublicRP} />
                                            <div style={{fontSize:'9px',color:'#374151',marginTop:'2px',textAlign:isMe?'right':'left',paddingLeft:'4px'}}>{fmtTs(msg.createdAt)}</div>
                                        </div>
                                    </div>
                                );
                            }
                            const isMe = msg.senderId === currentUID;
                            const isImg = msg.type === 'image';
                            const vipCfg = getVIPConfig(msg.senderVipLevel);
                            const nameColor = vipCfg ? vipCfg.nameColor : (isMe ? '#00f2ff' : '#a78bfa');
                            return (
                                <div key={msg.id||i} style={{display:'flex',flexDirection:isMe?'row-reverse':'row',gap:'8px',alignItems:'flex-end'}}>
                                    {/* Avatar with frame */}
                                    <div style={{position:'relative',width:'34px',height:'34px',flexShrink:0}}>
                                        <div onClick={()=>openMiniProfilePub(msg.senderId,{name:msg.senderName,photo:msg.senderPhoto})}
                                            style={{width:'34px',height:'34px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',overflow:'hidden',cursor:'pointer',border:vipCfg?`2px solid ${vipCfg.nameColor}`:'2px solid rgba(255,255,255,0.12)',boxShadow:vipCfg?`0 0 8px ${vipCfg.nameColor}55`:'none',position:'relative'}}>
                                            {msg.senderPhoto?<img src={msg.senderPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:'15px',display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>😎</span>}
                                            {msg.senderFrame && <img src={msg.senderFrame} alt="" onError={e=>e.target.style.display='none'} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',pointerEvents:'none'}}/>}
                                        </div>
                                    </div>
                                    <div style={{maxWidth:'min(72%, calc(100vw - 80px))',minWidth:0}}>
                                        {/* Name row */}
                                        <div style={{display:'flex',alignItems:'center',gap:'4px',marginBottom:'3px',paddingLeft:isMe?0:'2px',paddingRight:isMe?'2px':0,justifyContent:isMe?'flex-end':'flex-start',flexWrap:'wrap',cursor:'pointer'}} onClick={()=>openMiniProfilePub(msg.senderId,{name:msg.senderName,photo:msg.senderPhoto})}>
                                            <span style={{fontSize:'10px',color:nameColor,fontWeight:800}}>{isMe?(lang==='ar'?'أنت':'You'):msg.senderName}</span>
                                            {vipCfg && <span style={{fontSize:'8px',fontWeight:900,background:vipCfg.nameColor,color:'#000',padding:'1px 4px',borderRadius:'3px'}}>VIP{msg.senderVipLevel}</span>}
                                            {msg.senderVipLevel > 0 && typeof VIP_CHAT_TITLE_URLS !== 'undefined' && VIP_CHAT_TITLE_URLS?.[msg.senderVipLevel] && <img src={VIP_CHAT_TITLE_URLS[msg.senderVipLevel]} alt="" style={{height:'13px',objectFit:'contain'}}/>}
                                            {/* Badges */}
                                            {(msg.senderBadges||[]).slice(0,3).map((b,bi)=>{
                                                if (!b) return null;
                                                const badge = typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS.find(a=>a.id===b) : null;
                                                if (!badge) return null;
                                                return badge.imageUrl
                                                    ? <img key={bi} src={badge.imageUrl} alt="" onError={e=>e.target.style.display='none'} style={{width:'13px',height:'13px',objectFit:'contain',flexShrink:0}}/>
                                                    : <span key={bi} style={{fontSize:'11px'}}>{badge.icon||'🏅'}</span>;
                                            })}
                                        </div>
                                        {editingMsgId === msg.id ? (
                                            <div style={{display:'flex',gap:'4px',alignItems:'center'}}>
                                                <input autoFocus value={editText} onChange={e=>setEditText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')handleEditMsg(msg.id);if(e.key==='Escape'){setEditingMsgId(null);setEditText('');}}}
                                                    style={{flex:1,padding:'7px 10px',background:'rgba(0,242,255,0.08)',border:'1px solid rgba(0,242,255,0.3)',borderRadius:'10px',color:'white',fontSize:'12px',outline:'none'}}/>
                                                <button onClick={()=>handleEditMsg(msg.id)} style={{background:'rgba(0,242,255,0.2)',border:'1px solid rgba(0,242,255,0.4)',borderRadius:'7px',padding:'5px 8px',color:'#00f2ff',cursor:'pointer',fontSize:'12px',fontWeight:800}}>✓</button>
                                                <button onClick={()=>{setEditingMsgId(null);setEditText('');}} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'7px',padding:'5px 7px',color:'#9ca3af',cursor:'pointer',fontSize:'11px'}}>✕</button>
                                            </div>
                                        ) : isImg ? (
                                            <div style={{borderRadius:isMe?'14px 14px 4px 14px':'14px 14px 14px 4px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.09)',cursor:'pointer',width:'min(240px, calc(100vw - 80px))'}} onClick={()=>{const w=window.open();w.document.write(`<body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${msg.imageData}" style="max-width:100vw;max-height:100vh;object-fit:contain"></body>`);}}>
                                                <img src={msg.imageData} alt="📷" style={{display:'block',width:'100%',maxHeight:'240px',objectFit:'cover'}}/>
                                            </div>
                                        ) : (
                                            <div style={{padding:'8px 12px',borderRadius:isMe?'14px 4px 14px 14px':'4px 14px 14px 14px',background:isMe?'linear-gradient(135deg,rgba(112,0,255,0.4),rgba(0,242,255,0.18))':'rgba(255,255,255,0.07)',border:isMe?'1px solid rgba(0,242,255,0.18)':'1px solid rgba(255,255,255,0.08)',fontSize:'12px',color:'#e2e8f0',lineHeight:1.5,wordBreak:'break-word'}}>
                                                {msg.text}
                                                {msg.edited && <span style={{fontSize:'9px',color:'#4b5563',marginLeft:'6px',fontStyle:'italic'}}>{lang==='ar'?'(معدّل)':'(edited)'}</span>}
                                            </div>
                                        )}
                                        <div style={{display:'flex',alignItems:'center',gap:'6px',marginTop:'2px',justifyContent:isMe?'flex-end':'flex-start',paddingLeft:'4px',paddingRight:'4px'}}>
                                            <span style={{fontSize:'9px',color:'#374151'}}>{fmtTs(msg.createdAt)}</span>
                                            {/* Report / Edit / Delete menu */}
                                            <button onClick={()=>setMenuMsgId(menuMsgId===msg.id?null:msg.id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'10px',color:'#4b5563',padding:'0 2px',lineHeight:1}}>•••</button>
                                            {menuMsgId === msg.id && (
                                                <div style={{position:'absolute',background:'linear-gradient(160deg,#0e0e22,#13122a)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'10px',padding:'5px',zIndex:999,boxShadow:'0 8px 24px rgba(0,0,0,0.9)',minWidth:'120px',right: isMe ? '0' : 'auto', left: isMe ? 'auto' : '0'}}>
                                                    {isMe && !editingMsgId && (
                                                        <button onClick={()=>{setEditingMsgId(msg.id);setEditText(msg.text||'');setMenuMsgId(null);}} style={{width:'100%',padding:'7px 10px',borderRadius:'7px',background:'none',border:'none',cursor:'pointer',fontSize:'11px',color:'#00f2ff',fontWeight:700,textAlign:'left',display:'flex',alignItems:'center',gap:'6px'}}
                                                            onMouseEnter={e=>e.currentTarget.style.background='rgba(0,242,255,0.1)'}
                                                            onMouseLeave={e=>e.currentTarget.style.background='none'}>✏️ {lang==='ar'?'تعديل':'Edit'}</button>
                                                    )}
                                                    {isMe && (
                                                        <button onClick={()=>handleDeleteMsg(msg.id)} style={{width:'100%',padding:'7px 10px',borderRadius:'7px',background:'none',border:'none',cursor:'pointer',fontSize:'11px',color:'#f87171',fontWeight:700,textAlign:'left',display:'flex',alignItems:'center',gap:'6px'}}
                                                            onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                                                            onMouseLeave={e=>e.currentTarget.style.background='none'}>🗑️ {lang==='ar'?'حذف':'Delete'}</button>
                                                    )}
                                                    <button onClick={()=>handleReport(msg)} style={{width:'100%',padding:'7px 10px',borderRadius:'7px',background:'none',border:'none',cursor:'pointer',fontSize:'11px',color:'#9ca3af',fontWeight:700,textAlign:'left',display:'flex',alignItems:'center',gap:'6px'}}
                                                        onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.07)'}
                                                        onMouseLeave={e=>e.currentTarget.style.background='none'}>🚨 {lang==='ar'?'إبلاغ':'Report'}</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {messages.length===0 && <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'8px',color:'#4b5563',paddingTop:'40px'}}><div style={{fontSize:'32px'}}>🌍</div><div style={{fontSize:'12px'}}>{lang==='ar'?'ابدأ المحادثة!':'Start chatting!'}</div></div>}
                        <div ref={messagesEndRef}/>
                    </div>

                    {/* 🧧 Red Packet Send Modal — bottom sheet, closes on overlay click */}
                    {showRPModal && (
                        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.7)',zIndex:80,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end'}}
                            onClick={()=>setShowRPModal(false)}>
                            <div style={{width:'100%',background:'linear-gradient(160deg,#0e0e22,#13122a)',borderRadius:'20px 20px 0 0',border:'1px solid rgba(255,255,255,0.1)',overflow:'hidden',maxHeight:'60%',boxSizing:'border-box'}}
                                onClick={e=>e.stopPropagation()}>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
                                    <div style={{fontSize:'13px',fontWeight:800,color:'#ef4444'}}>🧧 {lang==='ar'?'أرسل مغلف للعموم':'Send Public Red Packet'}</div>
                                    <button onClick={()=>setShowRPModal(false)} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'20px',cursor:'pointer'}}>✕</button>
                                </div>
                                <div style={{padding:'12px',overflowY:'auto'}}>
                                    <div style={{fontSize:'11px',color:'#6b7280',marginBottom:'10px',textAlign:'center'}}>{lang==='ar'?'رصيدك':'Balance'}: <span style={{color:'#ffd700',fontWeight:700}}>{((currentUser?.currency)||0).toLocaleString()} 🧠</span></div>
                                    <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
                                        {(typeof RED_PACKETS_CONFIG!=='undefined'?RED_PACKETS_CONFIG:[]).map(rp=>(
                                            <button key={rp.id} onClick={()=>sendPublicRP(rp)} disabled={sendingRP||((currentUser?.currency)||0)<rp.amount}
                                                style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderRadius:'12px',background:rp.bg,border:`1px solid ${rp.border}`,cursor:((currentUser?.currency)||0)<rp.amount?'not-allowed':'pointer',opacity:((currentUser?.currency)||0)<rp.amount?0.4:1,textAlign:'left'}}>
                                                {rp.imageURL?<img src={rp.imageURL} alt="" style={{width:'36px',height:'36px',objectFit:'contain'}}/>:<div style={{width:'36px',height:'36px',borderRadius:'10px',background:`${rp.color}20`,border:`1px solid ${rp.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>🧧</div>}
                                                <div style={{flex:1}}>
                                                    <div style={{fontSize:'12px',fontWeight:800,color:rp.color}}>{lang==='ar'?rp.name_ar:rp.name_en}</div>
                                                    <div style={{fontSize:'10px',color:'#9ca3af',marginTop:'1px'}}>{lang==='ar'?rp.desc_ar:rp.desc_en}</div>
                                                </div>
                                                <div style={{fontSize:'12px',fontWeight:800,color:rp.color}}>{rp.amount.toLocaleString()} 🧠</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Mini Profile Popup inside PublicChat (Fix 4 & 8: higher z-index, stays above chat) ── */}
                    {miniProfilePub && (
                        <MiniProfilePopup
                            profile={miniProfilePub}
                            onClose={() => { setMiniProfilePub(null); setMiniMenuPub(false); }}
                            currentUID={user?.uid}
                            lang={lang}
                            onOpenProfile={onOpenProfile}
                            zIndex={Z.MODAL_HIGH + 10}
                        />
                    )}

                    {/* Input Bar */}
                    {isLoggedIn ? (
                        <div style={{display:'flex',gap:'5px',padding:'8px',borderTop:'1px solid rgba(255,255,255,0.07)',flexShrink:0,background:'rgba(0,0,0,0.4)',position:'relative',boxSizing:'border-box',width:'100%'}}>
                            {/* Emoji Picker */}
                            {showEmojiPicker && (
                                <div style={{position:'absolute',bottom:'58px',left:0,right:0,background:'#0e1020',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'14px 14px 0 0',padding:'10px',zIndex:10,boxShadow:'0 -14px 44px rgba(0,0,0,0.8)',maxHeight:'200px',overflowY:'auto'}}>
                                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                                        <span style={{fontSize:'11px',fontWeight:700,color:'#00f2ff'}}>{lang==='ar'?'إيموجي':'Emoji'}</span>
                                        <button onClick={()=>setShowEmojiPicker(false)} style={{background:'none',border:'none',color:'#9ca3af',cursor:'pointer',fontSize:'14px'}}>✕</button>
                                    </div>
                                    {React.createElement(EmojiPicker,{show:true,onClose:()=>setShowEmojiPicker(false),onSelect:(e)=>{setMsgText(p=>p+e);setShowEmojiPicker(false);inputRef.current?.focus();},lang,inline:true})}
                                </div>
                            )}
                            <button onClick={()=>setShowEmojiPicker(v=>!v)} style={{width:'36px',height:'36px',borderRadius:'10px',border:`1px solid ${showEmojiPicker?'rgba(0,242,255,0.3)':'rgba(255,255,255,0.08)'}`,background:showEmojiPicker?'rgba(0,242,255,0.12)':'rgba(255,255,255,0.05)',cursor:'pointer',fontSize:'17px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>😀</button>
                            <button onClick={()=>fileInputRef.current?.click()} disabled={uploadingImg} style={{width:'36px',height:'36px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.05)',cursor:'pointer',fontSize:'15px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,opacity:uploadingImg?0.5:1}}>{uploadingImg?'⏳':'🖼️'}</button>
                            <button onClick={()=>setShowRPModal(true)} style={{width:'36px',height:'36px',borderRadius:'10px',border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.1)',cursor:'pointer',fontSize:'17px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}} title={lang==='ar'?'مغلف أحمر':'Red Packet'}>🧧</button>
                            <input ref={inputRef} value={msgText} onChange={e=>setMsgText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),sendMsg())}
                                style={{flex:1,padding:'9px 12px',borderRadius:'12px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:'13px',outline:'none',minWidth:0}}
                                placeholder={lang==='ar'?'اكتب رسالة للعموم...':'Write a public message...'}/>
                            <button onClick={sendMsg} disabled={!msgText.trim()||sending} style={{width:'38px',height:'38px',borderRadius:'12px',border:'none',cursor:'pointer',flexShrink:0,background:msgText.trim()?'linear-gradient(135deg,#7000ff,#00f2ff)':'rgba(255,255,255,0.06)',color:msgText.trim()?'white':'#6b7280',fontSize:'16px',transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center'}}>➤</button>
                        </div>
                    ) : (
                        <div style={{padding:'12px 16px',borderTop:'1px solid rgba(255,255,255,0.07)',textAlign:'center',color:'#6b7280',fontSize:'12px',flexShrink:0}}>
                            🔐 {lang==='ar'?'سجّل دخول للكتابة':'Login to chat'}
                        </div>
                    )}
                </div>
            </div>
        </PortalModal>
    );
};

// 📊 WIN RATE CIRCLE COMPONENT
