(function() {
    const { useState, useEffect } = React;

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
                createdAt:   TS(),
                lastUpdated: TS(),
            });
            setSubject(''); setMessage(''); setCategory('other');
            setView('list');
            onNotification(lang==='ar'?'✅ تم إرسال تذكرتك!':'✅ Ticket submitted!');
        } catch(e) {
            onNotification(lang==='ar'?'❌ حدث خطأ':'❌ Error');
        }
        setSubmitting(true);
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

    window.SupportTicketSection = SupportTicketSection;
})();
