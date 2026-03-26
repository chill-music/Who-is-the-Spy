const { useState, useEffect, useMemo, useRef } = React;

var UserManagementSection = ({ currentUser, currentUserData, lang, onNotification }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searching, setSearching] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        const tid = searchTerm.trim();
        if (!tid) return;
        setSearching(true); setSearchResult(null);
        try {
            const snap = await usersCollection.where('uid', '==', tid).limit(1).get();
            if (snap.empty) {
                const snap2 = await usersCollection.where('displayName', '==', tid).limit(1).get();
                if (!snap2.empty) setSearchResult({ id: snap2.docs[0].id, ...snap2.docs[0].data() });
            } else {
                setSearchResult({ id: snap.docs[0].id, ...snap.docs[0].data() });
            }
        } catch(e) {}
        setSearching(false);
    };

    const handleUnban = async () => {
        if (!searchResult || processing) return;
        setProcessing(true);
        try {
            await usersCollection.doc(searchResult.id).update({
                'ban.isBanned': false,
                'ban.unbannedBy': currentUser.uid,
                'ban.unbannedAt': TS()
            });
            setSearchResult({ ...searchResult, ban: { ...searchResult.ban, isBanned: false } });
            onNotification('✅ User unbanned');
        } catch(e) { onNotification('❌ Error'); }
        setProcessing(false);
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#3b82f6', marginBottom:'16px' }}>
                🔍 {lang==='ar'?'البحث والإدارة':'Search & Manage Users'}
            </div>
            <form onSubmit={handleSearch} style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
                <input className="input-dark" style={{ flex:1, padding:'10px', borderRadius:'10px', fontSize:'13px' }}
                    placeholder={lang==='ar'?'ابحث بـ UID أو الإسم...':'Search by UID or Name...'}
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <button type="submit" disabled={searching} className="btn-neon" style={{ padding:'0 20px' }}>
                    {searching ? '⏳' : (lang==='ar'?'بحث':'Search')}
                </button>
            </form>

            {searchResult && (
                <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'16px', padding:'20px', textAlign:'center' }}>
                    <img src={searchResult.photoURL || 'https://via.placeholder.com/80'} style={{ width:'80px', height:'80px', borderRadius:'50%', marginBottom:'12px', border:'3px solid #3b82f6' }} />
                    <div style={{ fontSize:'16px', fontWeight:800 }}>{searchResult.displayName}</div>
                    <div style={{ fontSize:'12px', color:'#6b7280', marginBottom:'15px' }}>{searchResult.uid}</div>
                    
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px' }}>
                        <div style={{ background:'rgba(255,255,255,0.02)', padding:'10px', borderRadius:'10px' }}>
                            <div style={{ fontSize:'10px', color:'#6b7280' }}>{lang==='ar'?'الذهب':'Gold'}</div>
                            <div style={{ fontSize:'14px', fontWeight:700, color:'#f59e0b' }}>{searchResult.gold || 0}</div>
                        </div>
                        <div style={{ background:'rgba(255,255,255,0.02)', padding:'10px', borderRadius:'10px' }}>
                            <div style={{ fontSize:'10px', color:'#6b7280' }}>{lang==='ar'?'المستوى':'Level'}</div>
                            <div style={{ fontSize:'14px', fontWeight:700, color:'#3b82f6' }}>{searchResult.level || 1}</div>
                        </div>
                    </div>

                    {searchResult.ban?.isBanned ? (
                        <div style={{ padding:'12px', borderRadius:'10px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', marginBottom:'12px' }}>
                            <div style={{ fontSize:'11px', color:'#ef4444', fontWeight:700 }}>⛔ {lang==='ar'?'هذا المستخدم محظور!':'User is Banned!'}</div>
                            <div style={{ fontSize:'10px', color:'#6b7280', marginTop:'4px' }}>{lang==='ar'?'السبب:':'Reason:'} {searchResult.ban.reason}</div>
                            <button onClick={handleUnban} disabled={processing}
                                className="btn-neon" style={{ marginTop:'10px', width:'100%', padding:'8px' }}>
                                {processing ? '⏳' : `✅ ${lang==='ar'?'رفع الحظر':'Unban User'}`}
                            </button>
                        </div>
                    ) : (
                        <div style={{ fontSize:'11px', color:'#10b981' }}>🟢 {lang==='ar'?'حساب نشط ومفعل':'Active Account'}</div>
                    )}
                </div>
            )}
        </div>
    );
};

window.UserManagementSection = UserManagementSection;
