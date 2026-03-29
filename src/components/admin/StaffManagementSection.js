(function() {
    var { useState, useEffect, useMemo, useRef } = React;

var StaffManagementSection = ({ currentUser, currentUserData, lang, onNotification }) => {
    var [staff, setStaff] = useState([]);
    var [loading, setLoading] = useState(true);
    var [editing, setEditing] = useState(null);
    var [newRole, setNewRole] = useState('');
    var [searchUID, setSearchUID] = useState('');
    var [searching, setSearching] = useState(false);

    useEffect(() => {
        var unsub = usersCollection.where('role', 'in', ['moderator','admin','owner']).onSnapshot(snap => {
            setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return unsub;
    }, []);

    var updateRole = async (uid, currentRole) => {
        if (getUserRole(currentUserData, currentUser?.uid) !== 'owner') {
            onNotification('⛔ Only Owners can change roles');
            return;
        }
        try {
            await usersCollection.doc(uid).update({ role: newRole });
            onNotification('✅ Role updated');
            setEditing(null);
        } catch(e) { onNotification('❌ Error'); }
    };

    var addStaffById = async () => {
        if (!searchUID.trim() || searching) return;
        setSearching(true);
        try {
            var res = await usersCollection.doc(searchUID.trim()).get();
            if (!res.exists) {
                onNotification(lang==='ar'?'❌ المستخدم غير موجود':'❌ User not found');
            } else {
                await usersCollection.doc(searchUID.trim()).update({ role: 'moderator' });
                onNotification(lang==='ar'?'✅ تمت إضافة المشرف':'✅ Added as Moderator');
                setSearchUID('');
            }
        } catch(e) { onNotification('❌ Error'); }
        setSearching(false);
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#8b5cf6', marginBottom:'16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span>🛡️ {lang==='ar'?'إدارة فريق العمل':'Staff Management'}</span>
                {getUserRole(currentUserData, currentUser?.uid) === 'owner' && (
                    <div style={{ display:'flex', gap:'6px' }}>
                        <input className="input-dark" style={{ width:'120px', padding:'5px 10px', fontSize:'11px' }} 
                            placeholder="User ID" value={searchUID} onChange={e=>setSearchUID(e.target.value)} />
                        <button onClick={addStaffById} disabled={searching || !searchUID}
                            className="btn-neon" style={{ padding:'5px 12px', fontSize:'11px' }}>
                            {searching ? '⏳' : `➕ ${lang==='ar'?'إضافة':'Add'}`}
                        </button>
                    </div>
                )}
            </div>
            {loading ? <div style={{textAlign:'center',padding:'20px'}}>⏳</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {staff.map(s => (
                        <div key={s.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                                <img src={s.photoURL || 'https://via.placeholder.com/40'} style={{ width:'36px', height:'36px', borderRadius:'50%' }} />
                                <div>
                                    <div style={{ fontSize:'12px', fontWeight:700 }}>{s.displayName}</div>
                                    <div style={{ fontSize:'10px', color:ROLE_CONFIG[s.role]?.color || '#9ca3af' }}>{s.role?.toUpperCase()}</div>
                                </div>
                            </div>
                            
                            {getUserRole(currentUserData, currentUser?.uid) === 'owner' && s.uid !== currentUser.uid && (
                                <div style={{ display:'flex', gap:'6px' }}>
                                    {editing === s.id ? (
                                        <>
                                            <select value={newRole || s.role} onChange={e => setNewRole(e.target.value)} 
                                                className="input-dark" style={{ fontSize:'10px', padding:'4px' }}>
                                                <option value="moderator">MODERATOR</option>
                                                <option value="admin">ADMIN</option>
                                                <option value="owner">OWNER</option>
                                                <option value="user">REMOVE STAFF</option>
                                            </select>
                                            <button onClick={() => updateRole(s.id, s.role)} style={{ padding:'4px 8px', background:'#10b981', color:'#fff', borderRadius:'5px', fontSize:'10px', border:'none', cursor:'pointer' }}>💾</button>
                                            <button onClick={() => setEditing(null)} style={{ padding:'4px 8px', background:'rgba(255,255,255,0.1)', color:'#fff', borderRadius:'5px', fontSize:'10px', border:'none', cursor:'pointer' }}>✕</button>
                                        </>
                                    ) : (
                                        <button onClick={() => { setEditing(s.id); setNewRole(s.role); }} 
                                            className="btn-neon" style={{ padding:'5px 12px', fontSize:'10px' }}>
                                            ✏️ {lang==='ar'?'تعديل':'Edit'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

window.StaffManagementSection = StaffManagementSection;
})();
