(function() {
    var { useState, useEffect, useMemo, useRef } = React;

var FAKE_PROFILE_PHOTOS = [
    'https://i.pravatar.cc/150?img=1','https://i.pravatar.cc/150?img=2','https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4','https://i.pravatar.cc/150?img=5','https://i.pravatar.cc/150?img=6',
    'https://i.pravatar.cc/150?img=7','https://i.pravatar.cc/150?img=8','https://i.pravatar.cc/150?img=9',
    'https://i.pravatar.cc/150?img=10','https://i.pravatar.cc/150?img=11','https://i.pravatar.cc/150?img=12',
];
var FAKE_NAMES = ['Alex Shadow','Nova Cipher','Rex Viper','Luna Storm','Kai Echo','Zara Blaze','Max Frost','Nora Specter','Finn Raven','Iris Ghost','Cole Hex','Dara Nova','Jax Titan','Mia Ghost','Leo Strike'];

var FakeProfilesSection = ({ lang, onNotification }) => {
    var [profiles, setProfiles] = useState([]);
    var [loading, setLoading] = useState(true);
    var [generating, setGenerating] = useState(false);

    useEffect(() => {
        var unsub = usersCollection.where('isFake', '==', true).onSnapshot(snap => {
            setProfiles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return unsub;
    }, []);

    var deleteProfile = async (id) => {
        if(!confirm(lang==='ar'?'حذف هذا الحساب الوهمي؟':'Delete this fake profile?')) return;
        try {
            await usersCollection.doc(id).delete();
            onNotification('✅ Success');
        } catch(e) { onNotification('❌ Error'); }
    };

    var generateProfiles = async () => {
        if (generating) return;
        setGenerating(true);
        try {
            var batch = db.batch();
            for (var i = 0; i < 10; i++) {
                var randomId = 'bot_' + Math.random().toString(36).substr(2, 9);
                var name = FAKE_NAMES[Math.floor(Math.random()*FAKE_NAMES.length)] + ' (Bot)';
                var photo = FAKE_PROFILE_PHOTOS[Math.floor(Math.random()*FAKE_PROFILE_PHOTOS.length)];
                var ref = usersCollection.doc(randomId);
                batch.set(ref, {
                    uid: randomId,
                    displayName: name,
                    photoURL: photo,
                    isFake: true,
                    role: 'user',
                    xp: Math.floor(Math.random()*2000),
                    currency: 500,
                    createdAt: TS()
                });
            }
            await batch.commit();
            onNotification(lang==='ar'?'✅ تم إنشاء 10 حسابات':'✅ Generated 10 profiles');
        } catch(e) { onNotification('❌ Error'); }
        setGenerating(false);
    };

    return (
        <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'#ec4899' }}>
                    🤖 {lang==='ar'?'الحسابات الوهمية':'Fake Profiles'}
                </div>
                <button onClick={generateProfiles} disabled={generating}
                    className="btn-neon" style={{ padding:'5px 12px', fontSize:'11px', opacity: generating ? 0.6 : 1 }}>
                    {generating ? '⏳' : `➕ ${lang==='ar'?'إنشاء 10 حسابات':'Generate 10'}`}
                </button>
            </div>

            {loading ? <div style={{textAlign:'center',padding:'20px'}}>⏳</div> : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:'10px' }}>
                    {profiles.map(p => (
                        <div key={p.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'10px', textAlign:'center', position:'relative' }}>
                            <img src={p.photoURL || 'https://via.placeholder.com/50'} 
                                style={{ width:'45px', height:'45px', borderRadius:'50%', marginBottom:'6px', border:'2px solid #ec4899' }} />
                            <div style={{ fontSize:'11px', fontWeight:700, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.displayName}</div>
                            <div style={{ fontSize:'9px', color:'#6b7280', marginBottom:'8px' }}>ID: {p.uid?.slice(0,6)}</div>
                            <button onClick={() => deleteProfile(p.id)}
                                style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444', padding:'3px 8px', borderRadius:'5px', fontSize:'9px', cursor:'pointer' }}>
                                {lang==='ar'?'حذف':'Delete'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

window.FakeProfilesSection = FakeProfilesSection;
})();
