/**
 * ProfileFriendsSection.js
 * Modular component for the "Friends" tab within the profile modal.
 * Displays a list of friends and handles profile navigation.
 * 
 * Part of Phase 4: Batch 5 modularization.
 */

var ProfileFriendsSection = ({ friendsData, onOpenProfile, lang }) => {
    var friends = friendsData || [];
    return (
        <div style={{padding:'12px'}}>
            <h3 style={{margin:'0 0 12px 0', fontSize:'14px', fontWeight:800, color:'white', display:'flex', alignItems:'center', gap:'6px'}}>
                👥 {lang === 'ar' ? 'الأصدقاء' : 'Friends'}
                <span style={{fontSize:'10px', background:'rgba(255,255,255,0.1)', padding:'2px 6px', borderRadius:'10px', color:'#9ca3af'}}>{friends.length}</span>
            </h3>
            
            {friends.length === 0 ? (
                <div style={{background:'rgba(0,0,0,0.2)', borderRadius:'12px', padding:'30px 20px', textAlign:'center', border:'1px dashed rgba(255,255,255,0.08)'}}>
                    <div style={{fontSize:'24px', marginBottom:'8px'}}>🤝</div>
                    <div style={{fontSize:'12px', color:'#6b7280'}}>{lang === 'ar' ? 'لا يوجد أصدقاء بعد' : 'No friends yet'}</div>
                </div>
            ) : (
                <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                    {friends.map(friend => (
                        <div 
                            key={friend.uid} 
                            onClick={() => onOpenProfile(friend.uid)}
                            style={{display:'flex', alignItems:'center', gap:'10px', padding:'10px', background:'rgba(255,255,255,0.04)', borderRadius:'12px', cursor:'pointer', border:'1px solid rgba(255,255,255,0.06)', transition:'all 0.2s'}}
                        >
                            <div style={{width:'38px', height:'38px', borderRadius:'50%', overflow:'hidden', border:'2px solid rgba(0,242,255,0.1)'}}>
                                {friend.photoURL ? <img src={friend.photoURL} style={{width:'100%', height:'100%', objectFit:'cover'}} alt=""/> : <div style={{width:'100%', height:'100%', background:'#1a1a2e', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px'}}>👤</div>}
                            </div>
                            <div style={{flex:1}}>
                                <div style={{fontSize:'13px', fontWeight:800, color:'white'}}>{friend.displayName}</div>
                                <div style={{fontSize:'10px', color:'#6b7280'}}>Level {friend.level || 1}</div>
                            </div>
                            <div style={{fontSize:'12px', color:GR.NEON}}>👤</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Export to Global Scope ---
window.ProfileFriendsSection = ProfileFriendsSection;
