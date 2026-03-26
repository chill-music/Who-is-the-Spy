const { useState, useEffect, useMemo, useRef } = React;

var MomentsModerationSection = ({ currentUser, currentUserData, lang, onNotification, onOpenProfile }) => {
    const [moments, setMoments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [banningUID, setBanningUID] = useState(null); // moment.id of the one being banned

    useEffect(() => {
        const unsub = momentsCollection.orderBy('timestamp', 'desc').limit(50).onSnapshot(snap => {
            setMoments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, []);

    const toggleHideMoment = async (id, currentHidden) => {
        try {
            await momentsCollection.doc(id).update({ hidden: !currentHidden });
            onNotification(`✅ ${!currentHidden ? 'Moment Hidden' : 'Moment Restored'}`);
        } catch(e) { onNotification('❌ Error'); }
    };

    const deleteMoment = async (id) => {
        if(!confirm(lang==='ar'?'حذف هذا المنشور نهائياً؟':'Delete this moment permanently?')) return;
        try {
            await momentsCollection.doc(id).delete();
            onNotification('✅ Success');
        } catch(e) { onNotification('❌ Error'); }
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#8b5cf6', marginBottom:'16px' }}>
                📸 {lang==='ar'?'مراجعة اللحظات':'Moments Moderation'}
            </div>
            {loading ? <div style={{textAlign:'center',padding:'20px'}}>⏳</div> : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'12px' }}>
                    {moments.map(m => (
                        <div key={m.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'10px', opacity:m.hidden?0.5:1 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                                <img src={m.userPhoto || 'https://via.placeholder.com/30'} style={{ width:'24px', height:'24px', borderRadius:'50%' }} />
                                <div style={{ fontSize:'10px', fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flex:1 }}>{m.userName}</div>
                                {m.hidden && <span style={{ fontSize:'9px', color:'#ef4444' }}>[HIDDEN]</span>}
                            </div>
                            
                            {m.imageUrl ? (
                                <img src={m.imageUrl} style={{ width:'100%', aspectRatio:'1', borderRadius:'8px', objectFit:'cover', marginBottom:'8px', cursor:'pointer' }} onClick={() => window.open(m.imageUrl)} />
                            ) : (
                                <div style={{ background:'rgba(255,255,255,0.05)', padding:'8px', borderRadius:'8px', fontSize:'10px', color:'#9ca3af', minHeight:'60px', marginBottom:'8px' }}>{m.text}</div>
                            )}

                            {banningUID === m.id ? (
                                <window.BanPanelInline 
                                    reportedUID={m.userId}
                                    reportedName={m.userName}
                                    reportId={null}
                                    currentUser={currentUser}
                                    currentUserData={currentUserData}
                                    lang={lang}
                                    onDone={(msg) => { setBanningUID(null); onNotification(msg); }}
                                    onCancel={() => setBanningUID(null)}
                                />
                            ) : (
                                <div style={{ display:'flex', gap:'5px' }}>
                                    <button onClick={() => toggleHideMoment(m.id, m.hidden)} 
                                        style={{ flex:1, padding:'5px', borderRadius:'6px', border:'none', fontSize:'10px', cursor:'pointer', background:'rgba(245,158,11,0.2)', color:'#f59e0b' }}>
                                        {m.hidden ? '👁️' : '🚫'}
                                    </button>
                                    <button onClick={() => deleteMoment(m.id)} 
                                        style={{ flex:1, padding:'5px', borderRadius:'6px', border:'none', fontSize:'10px', cursor:'pointer', background:'rgba(239,68,68,0.2)', color:'#ef4444' }}>
                                        🗑️
                                    </button>
                                    <button onClick={() => setBanningUID(m.id)} 
                                        style={{ flex:1, padding:'5px', borderRadius:'6px', border:'none', fontSize:'10px', cursor:'pointer', background:'rgba(255,255,255,0.05)', color:'#fff' }}>
                                        🔨
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

window.MomentsModerationSection = MomentsModerationSection;
