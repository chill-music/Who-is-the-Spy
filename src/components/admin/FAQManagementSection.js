(function() {
    const { useState, useEffect, useMemo, useRef } = React;

var FAQManagementSection = ({ lang, onNotification }) => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newQ, setNewQ] = useState({ q_en:'', a_en:'', q_ar:'', a_ar:'', category: 'general' });

    useEffect(() => {
        const unsub = db.collection('faqs').orderBy('category').onSnapshot(snap => {
            setFaqs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return unsub;
    }, []);

    const handleAdd = async () => {
        if (!newQ.q_en || !newQ.a_en) return;
        try {
            await db.collection('faqs').add({ ...newQ, timestamp: TS() });
            setNewQ({ q_en:'', a_en:'', q_ar:'', a_ar:'', category: 'general' });
            onNotification('✅ FAQ Added');
        } catch(e) { onNotification('❌ Error'); }
    };

    const deleteFAQ = async (id) => {
        if(!confirm('Delete this FAQ?')) return;
        try {
            await db.collection('faqs').doc(id).delete();
            onNotification('✅ Deleted');
        } catch(e) { onNotification('❌ Error'); }
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#3b82f6', marginBottom:'16px' }}>
                ❓ {lang==='ar'?'إدارة الأسئلة الشائعة':'FAQ Management'}
            </div>
            
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'14px', marginBottom:'20px' }}>
                <div style={{ fontSize:'11px', fontWeight:700, color:'#3b82f6', marginBottom:'10px' }}>➕ {lang==='ar'?'إضافة سؤال جديد':'Add New FAQ'}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    <div style={{ display:'flex', gap:'8px' }}>
                        <input className="input-dark" style={{ flex:1, padding:'8px', fontSize:'11px' }} placeholder="Question (EN)" value={newQ.q_en} onChange={e=>setNewQ({...newQ, q_en:e.target.value})} />
                        <input className="input-dark" style={{ flex:1, padding:'8px', fontSize:'11px', textAlign:'right' }} placeholder="السؤال (عربي)" value={newQ.q_ar} onChange={e=>setNewQ({...newQ, q_ar:e.target.value})} />
                    </div>
                    <div style={{ display:'flex', gap:'8px' }}>
                        <textarea className="input-dark" style={{ flex:1, padding:'8px', fontSize:'11px', minHeight:'50px' }} placeholder="Answer (EN)" value={newQ.a_en} onChange={e=>setNewQ({...newQ, a_en:e.target.value})} />
                        <textarea className="input-dark" style={{ flex:1, padding:'8px', fontSize:'11px', textAlign:'right', minHeight:'50px' }} placeholder="الإجابة (عربي)" value={newQ.a_ar} onChange={e=>setNewQ({...newQ, a_ar:e.target.value})} />
                    </div>
                    <button onClick={handleAdd} className="btn-neon" style={{ padding:'10px', fontSize:'12px', fontWeight:700 }}>
                        {lang==='ar'?'إضافة السؤال':'Add FAQ'}
                    </button>
                </div>
            </div>

            {loading ? <div style={{textAlign:'center',padding:'20px'}}>⏳</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {faqs.map(f => (
                        <div key={f.id} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'10px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                                <div style={{ fontSize:'11px', fontWeight:700, color:'#3b82f6' }}>{lang==='ar'?f.q_ar:f.q_en}</div>
                                <button onClick={() => deleteFAQ(f.id)} style={{ padding:'2px 6px', background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'none', borderRadius:'4px', fontSize:'10px', cursor:'pointer' }}>🗑️</button>
                            </div>
                            <div style={{ fontSize:'10px', color:'#9ca3af', lineHeight:1.4 }}>{lang==='ar'?f.a_ar:f.a_en}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

window.FAQManagementSection = FAQManagementSection;
})();
