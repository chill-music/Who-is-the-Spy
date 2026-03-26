const { useState, useEffect, useMemo, useRef } = React;

var BroadcastSection = ({ currentUser, currentUserData, lang, onNotification }) => {
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
                    fromName: lang==='ar'?'فريق PRO SPY':'PRO SPY Team',
                    icon: '📢',
                    read: false,
                    timestamp: TS()
                });
                count++;
            });
            await batch.commit();
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'BROADCAST', null, null, `Sent to ${count} users: ${text.slice(0,100)}`);
            setSent(count);
            setMsg(''); setMsgAr('');
            onNotification(`✅ ${lang==='ar'?`تم الإرسال لـ ${count} مستخدم`:`Sent to ${count} users`}`);
        } catch(e) { onNotification('❌ Error'); }
        setSending(false);
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#f59e0b', marginBottom:'16px' }}>
                📢 {lang==='ar'?'إشعار جماعي':'Broadcast Notification'}
            </div>
            <div style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'12px', padding:'14px' }}>
                <textarea className="input-dark" style={{ width:'100%', padding:'8px 12px', borderRadius:'8px', fontSize:'12px', minHeight:'70px', resize:'vertical', marginBottom:'8px' }}
                    placeholder="Message (EN)"
                    value={msg} onChange={e => setMsg(e.target.value)} />
                <textarea className="input-dark" style={{ width:'100%', padding:'8px 12px', borderRadius:'8px', fontSize:'12px', minHeight:'70px', resize:'vertical', marginBottom:'10px', direction:'rtl' }}
                    placeholder="الرسالة (عربي)"
                    value={msgAr} onChange={e => setMsgAr(e.target.value)} />
                <button onClick={handleBroadcast} disabled={sending || (!msg.trim() && !msgAr.trim())}
                    style={{ width:'100%', padding:'9px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer',
                        background:'linear-gradient(135deg,rgba(245,158,11,0.3),rgba(217,119,6,0.2))',
                        border:'1px solid rgba(245,158,11,0.5)', color:'#f59e0b', opacity:sending?0.5:1 }}>
                    {sending ? '⏳ Sending...' : `📢 ${lang==='ar'?'إرسال للجميع':'Send to All'}`}
                </button>
                {sent > 0 && <div style={{fontSize:'11px',color:'#10b981',textAlign:'center',marginTop:'8px'}}>✅ Sent to {sent} users</div>}
            </div>
        </div>
    );
};

window.BroadcastSection = BroadcastSection;
