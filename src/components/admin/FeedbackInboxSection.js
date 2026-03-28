(function() {
    var { useState, useEffect, useMemo, useRef } = React;

var FeedbackInboxSection = ({ lang, onNotification }) => {
    var [feedback, setFeedback] = useState([]);
    var [loading, setLoading] = useState(true);

    useEffect(() => {
        var unsub = db.collection('feedback').orderBy('timestamp', 'desc').limit(100).onSnapshot(snap => {
            setFeedback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, []);

    var deleteFeedback = async (id) => {
        if(!confirm('Delete this feedback?')) return;
        try {
            await db.collection('feedback').doc(id).delete();
            onNotification('✅ Deleted');
        } catch(e) { onNotification('❌ Error'); }
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#10b981', marginBottom:'16px' }}>
                📩 {lang==='ar'?'صندوق الملاحظات والشكاوى':'Feedback Inbox'}
            </div>
            {loading ? <div style={{textAlign:'center',padding:'20px'}}>⏳</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {feedback.length === 0 && <div style={{textAlign:'center',padding:'40px',color:'#6b7280',fontSize:'12px'}}>{lang==='ar'?'لا توجد ملاحظات':'No feedback yet'}</div>}
                    {feedback.map(f => (
                        <div key={f.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'12px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                    <div style={{ fontSize:'11px', fontWeight:700, color:'#10b981' }}>{f.userName || 'Anonymous'}</div>
                                    <span style={{ fontSize:'10px', color:'#9ca3af' }}>{f.timestamp?.toDate?.() ? f.timestamp.toDate().toLocaleString() : ''}</span>
                                </div>
                                <button onClick={() => deleteFeedback(f.id)} style={{ padding:'3px 8px', background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'none', borderRadius:'6px', fontSize:'9px', cursor:'pointer' }}>{lang==='ar'?'حذف':'Delete'}</button>
                            </div>
                            <div style={{ background:'rgba(255,255,255,0.02)', padding:'10px', borderRadius:'10px', fontSize:'11px', color:'#d1d5db', lineHeight:1.5 }}>
                                {f.text}
                            </div>
                            <div style={{ fontSize:'9px', color:'#4b5563', marginTop:'8px' }}>User ID: {f.userId || 'N/A'} • Platform: {f.platform || 'Web'}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

window.FeedbackInboxSection = FeedbackInboxSection;
})();
