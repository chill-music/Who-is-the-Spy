const { useState, useEffect, useMemo, useRef } = React;

var TicketsSection = ({ currentUser, currentUserData, lang, onNotification, onOpenProfile }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('open');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [banningUID, setBanningUID] = useState(null); // ticket.id of the one being banned

    useEffect(() => {
        const unsub = ticketsCollection.orderBy('createdAt', 'desc').limit(100).onSnapshot(snap => {
            setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, []);

    const sendMessage = async (ticket) => {
        if (!replyText.trim()) return;
        try {
            const msg = {
                senderId: currentUser.uid,
                senderName: currentUserData?.displayName || 'Support',
                text: replyText.trim(),
                timestamp: TS()
            };
            await ticketsCollection.doc(ticket.id).update({
                messages: firebase.firestore.FieldValue.arrayUnion(msg),
                status: 'replied',
                updatedAt: TS(),
                lastMessageBy: currentUser.uid
            });
            onNotification('✅ Reply sent');
            setReplyingTo(null);
            setReplyText('');
        } catch(e) { onNotification('❌ Error'); }
    };

    const closeTicket = async (id) => {
        try {
            await ticketsCollection.doc(id).update({ status: 'closed', closedAt: TS() });
            onNotification('✅ Ticket closed');
        } catch(e) { onNotification('❌ Error'); }
    };

    const filtered = tickets.filter(t => {
        if (filter === 'open') return t.status === 'open' || t.status === 'replied';
        return t.status === 'closed';
    });

    return (
        <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'#f59e0b' }}>🎫 {lang==='ar'?'تذاكر الدعم':'Support Tickets'}</div>
                <div style={{ display:'flex', gap:'4px' }}>
                    {['open', 'closed'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            style={{ padding:'4px 10px', borderRadius:'6px', fontSize:'10px', cursor:'pointer', border:'none',
                                background:filter===f?'#f59e0b':'rgba(255,255,255,0.05)',
                                color:filter===f?'#000':'#9ca3af' }}>
                            {lang==='ar' ? (f==='open'?'مفتوحة':'مغلقة') : f.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? <div style={{textAlign:'center',padding:'20px'}}>⏳</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {filtered.length === 0 && <div style={{textAlign:'center',padding:'40px',color:'#6b7280',fontSize:'12px'}}>{lang==='ar'?'لا توجد تذاكر':'No tickets found'}</div>}
                    {filtered.map(t => (
                        <div key={t.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'12px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                    <div onClick={() => onOpenProfile(t.userId)} style={{ fontSize:'11px', fontWeight:700, cursor:'pointer', color:'#f59e0b' }}>{t.userName || 'User'}</div>
                                    <span style={{ fontSize:'10px', color:'#9ca3af' }}>{t.createdAt?.toDate?.() ? t.createdAt.toDate().toLocaleString() : ''}</span>
                                </div>
                                <div style={{ fontSize:'10px', color:'#6b7280' }}>ID: {t.id?.slice(-5)}</div>
                            </div>

                            <div style={{ background:'rgba(255,255,255,0.02)', padding:'10px', borderRadius:'10px', marginBottom:'12px' }}>
                                <div style={{ fontSize:'12px', color:'#d1d5db', lineHeight:1.4 }}>{t.subject}</div>
                                {t.messages?.map((m, idx) => (
                                    <div key={idx} style={{ marginTop:'8px', padding:'8px', borderRadius:'8px', background:m.senderId===t.userId?'rgba(255,255,255,0.05)':'rgba(245,158,11,0.1)', marginLeft:m.senderId===t.userId?'0':'20px', marginRight:m.senderId===t.userId?'20px':'0' }}>
                                        <div style={{ fontSize:'9px', color:'#6b7280', marginBottom:'2px' }}>{m.senderName} • {m.timestamp?.toDate?.() ? m.timestamp.toDate().toLocaleTimeString() : ''}</div>
                                        <div style={{ fontSize:'11px', color:'#e5e7eb' }}>{m.text}</div>
                                    </div>
                                ))}
                            </div>

                            {!t.status || t.status !== 'closed' ? (
                                <>
                                    {banningUID === t.id ? (
                                        <window.BanPanelInline 
                                            reportedUID={t.userId}
                                            reportedName={t.userName}
                                            reportId={null}
                                            currentUser={currentUser}
                                            currentUserData={currentUserData}
                                            lang={lang}
                                            onDone={(msg) => { setBanningUID(null); onNotification(msg); }}
                                            onCancel={() => setBanningUID(null)}
                                        />
                                    ) : replyingTo === t.id ? (
                                        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                                            <textarea className="input-dark" style={{ width:'100%', padding:'8px', borderRadius:'8px', fontSize:'12px', minHeight:'60px' }} 
                                                placeholder={lang==='ar'?'اكتب ردك هنا...':'Type your reply...'} value={replyText} onChange={e=>setReplyText(e.target.value)} />
                                            <div style={{ display:'flex', gap:'6px' }}>
                                                <button onClick={()=>sendMessage(t)} style={{ flex:1, padding:'6px', background:'#f59e0b', color:'#000', borderRadius:'6px', border:'none', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>{lang==='ar'?'إرسال الرد':'Send Reply'}</button>
                                                <button onClick={()=>setReplyingTo(null)} style={{ padding:'6px 12px', background:'rgba(255,255,255,0.1)', color:'#fff', borderRadius:'6px', border:'none', fontSize:'11px', cursor:'pointer' }}>✕</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display:'flex', gap:'8px' }}>
                                            <button onClick={() => setReplyingTo(t.id)} 
                                                style={{ flex:1, background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)', color:'#f59e0b', padding:'8px', borderRadius:'8px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                                                💬 {lang==='ar'?'رد':'Reply'}
                                            </button>
                                            <button onClick={() => closeTicket(t.id)}
                                                style={{ flex:1, background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', color:'#10b981', padding:'8px', borderRadius:'8px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                                                ✅ {lang==='ar'?'إغلاق التذكرة':'Close'}
                                            </button>
                                            <button onClick={() => setBanningUID(t.id)}
                                                style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444', padding:'8px 12px', borderRadius:'8px', fontSize:'11px', cursor:'pointer' }}>
                                                🔨
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{ fontSize:'10px', color:'#10b981', textAlign:'center', fontWeight:700 }}>✅ {lang==='ar'?'هذه التذكرة مغلقة':'This ticket is closed'}</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

window.TicketsSection = TicketsSection;
