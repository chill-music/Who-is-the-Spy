var FamilyMemberQuickCard = ({ member, role, isMe, lang, onOpenProfile, onClose, onSendGift, currentUID }) => {
    if (!member) return null;
    var isSelf = member.uid === currentUID;
    return (
        <div style={{
            position:'absolute', inset:0, zIndex:10,
            background:'rgba(0,0,0,0.6)',
            display:'flex', alignItems:'center', justifyContent:'center',
        }} onClick={onClose}>
            <div style={{
                background:'linear-gradient(160deg,#0e0e22,#13122a)',
                border:'1px solid rgba(0,242,255,0.25)', borderRadius:'18px',
                padding:'20px', width:'240px',
                boxShadow:'0 20px 50px rgba(0,0,0,0.9)',
                textAlign:'center',
            }} onClick={e => e.stopPropagation()}>

                <div style={{width:'64px',height:'64px',borderRadius:'50%',overflow:'hidden',margin:'0 auto 10px',border:'2px solid rgba(0,242,255,0.35)'}}>
                    {member.photo
                        ? <img src={member.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        : <div style={{width:'100%',height:'100%',background:'rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'26px'}}>😎</div>
                    }
                </div>

                <div style={{fontSize:'14px',fontWeight:800,color:'white',marginBottom:'4px'}}>{member.name}</div>

                {member.customId && (
                    <div style={{fontSize:'11px',color:'#6b7280',marginBottom:'14px'}}>
                        🪪 #{member.customId}
                    </div>
                )}

                {!isSelf && onSendGift && (
                    <button onClick={() => { onClose(); onSendGift(member); }}
                        style={{width:'100%',padding:'10px',borderRadius:'10px',background:'linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,140,0,0.15))',border:'1px solid rgba(255,215,0,0.4)',color:'#fbbf24',fontSize:'13px',fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                        🎁 {lang === 'ar' ? 'أرسل هدية' : 'Send Gift'}
                    </button>
                )}

                {isSelf && (
                    <div style={{fontSize:'11px',color:'#6b7280'}}>
                        {lang === 'ar' ? 'هذا أنت' : 'This is you'}
                    </div>
                )}
            </div>
        </div>
    );
};

window.FamilyMemberQuickCard = FamilyMemberQuickCard;
