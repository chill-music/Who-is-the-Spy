const { redPacketsCollection } = window;

/**
 * 🧧 RED PACKET CARD — Tap once to see details, tap Claim to get funds
 * Used in Public Chat, Family Chat, Group Chat
 */
const RedPacketCard = ({ rpId, rpAmount, maxClaims, senderName, currentUID, user, currentUser, lang, onClaim }) => {
    const [showDetails, setShowDetails] = React.useState(false);
    const [rpData, setRpData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [selfClaimed, setSelfClaimed] = React.useState(false);

    // Auto-load to detect claimed state without user tap
    React.useEffect(() => {
        if (!rpId) return;
        redPacketsCollection.doc(rpId).get().then(doc => {
            if (doc.exists) {
                const d = doc.data();
                setRpData(d);
                if (d.claimedBy?.includes(user?.uid)) setSelfClaimed(true);
            }
        }).catch(()=>{});
    }, [rpId, user?.uid]);

    const fetchDetails = async () => {
        if (rpData) { setShowDetails(true); return; }
        setLoading(true);
        try {
            const doc = await redPacketsCollection.doc(rpId).get();
            if (doc.exists) setRpData(doc.data());
        } catch(e) {}
        setLoading(false);
        setShowDetails(true);
    };

    const claimed = selfClaimed || rpData?.claimedBy?.includes(user?.uid);
    const isReclaimed = rpData?.status === 'reclaimed';
    const exhausted = isReclaimed || (rpData?.claimedBy?.length||0) >= (rpData?.maxClaims||maxClaims||1);
    const remaining = rpData?.remaining ?? rpAmount;
    const claimedCount = rpData?.claimedBy?.length || 0;

    if (showDetails && rpData) return (
        <React.Fragment>
        <div style={{background:'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(185,28,28,0.1))',border:'1px solid rgba(239,68,68,0.4)',borderRadius:'16px',padding:'12px 14px',minWidth:'200px',maxWidth:'min(260px,calc(100vw-90px))'}}>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                <div style={{fontSize:'26px',filter:'drop-shadow(0 0 6px rgba(239,68,68,0.7))'}}>🧧</div>
                <div>
                    <div style={{fontSize:'12px',fontWeight:800,color:'#ffd700'}}>{lang==='ar'?'مغلف أحمر':'Red Packet'}</div>
                    <div style={{fontSize:'10px',color:'#fca5a5'}}>{rpAmount?.toLocaleString()} 🧠 · {lang==='ar'?'من':'from'} {senderName}</div>
                </div>
                <button onClick={()=>setShowDetails(false)} style={{marginLeft:'auto',background:'none',border:'none',color:'#6b7280',cursor:'pointer',fontSize:'14px',lineHeight:1}}>✕</button>
            </div>
            {/* Progress bar */}
            <div style={{marginBottom:'8px'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'9px',color:'#9ca3af',marginBottom:'3px'}}>
                    <span>{lang==='ar'?'تم الاستلام':'Claimed'}: {claimedCount}/{rpData.maxClaims||maxClaims}</span>
                    <span>{lang==='ar'?'متبقي':'Remaining'}: {remaining?.toLocaleString?.()} 🧠</span>
                </div>
                <div style={{height:'4px',borderRadius:'2px',background:'rgba(255,255,255,0.1)',overflow:'hidden'}}>
                    <div style={{height:'100%',borderRadius:'2px',background:'linear-gradient(90deg,#ef4444,#fbbf24)',width:`${Math.min(100,((claimedCount/(rpData.maxClaims||maxClaims||1))*100))}%`}}/>
                </div>
            </div>
            {!claimed && !exhausted && (
                <button onClick={()=>{onClaim(rpId);setShowDetails(false);}} style={{width:'100%',padding:'8px',borderRadius:'10px',background:'linear-gradient(135deg,rgba(239,68,68,0.3),rgba(185,28,28,0.2))',border:'1px solid rgba(239,68,68,0.5)',color:'#ffd700',fontSize:'12px',fontWeight:800,cursor:'pointer'}}>
                    🎁 {lang==='ar'?'استلم الآن':'Claim Now'}
                </button>
            )}
            {claimed && <div style={{textAlign:'center',fontSize:'11px',color:'#4ade80',padding:'6px'}}>✅ {lang==='ar'?'استلمته':'Claimed'}</div>}
            {isReclaimed && !claimed && <div style={{textAlign:'center',fontSize:'11px',color:'#f87171',padding:'6px'}}>↩ {lang==='ar'?'تم استرداد المغلف':'Packet reclaimed'}</div>}
            {exhausted && !claimed && !isReclaimed && <div style={{textAlign:'center',fontSize:'11px',color:'#6b7280',padding:'6px'}}>🔴 {lang==='ar'?'نفد المغلف':'Exhausted'}</div>}
        </div>
        </React.Fragment>
    );

    return (
        <button onClick={fetchDetails} style={{
            display:'flex',alignItems:'center',gap:'10px',padding:'11px 15px',borderRadius:'16px',
            background: claimed
                ? 'linear-gradient(135deg,rgba(75,85,99,0.28),rgba(55,65,81,0.2))'
                : 'linear-gradient(135deg,rgba(239,68,68,0.25),rgba(185,28,28,0.2))',
            border: claimed ? '1px solid rgba(107,114,128,0.3)' : '1px solid rgba(239,68,68,0.5)',
            cursor:'pointer',
            boxShadow: claimed ? 'none' : '0 4px 16px rgba(239,68,68,0.25)',
            textAlign:'left',
            maxWidth:'min(260px,calc(100vw-90px))',
            opacity: claimed ? 0.55 : 1,
            transition:'all 0.25s',
        }}>
            <div style={{fontSize:'30px',filter: claimed ? 'grayscale(1) opacity(0.5)' : 'drop-shadow(0 0 8px rgba(239,68,68,0.7))'}}>{loading?'⏳':'🧧'}</div>
            <div>
                <div style={{fontSize:'12px',fontWeight:800,color: claimed ? '#6b7280' : '#ffd700'}}>{lang==='ar'?'مغلف أحمر':'Red Packet'}</div>
                <div style={{fontSize:'10px',color: claimed ? '#4b5563' : '#fca5a5',marginTop:'2px'}}>{rpAmount?.toLocaleString()} 🧠 · {maxClaims} {lang==='ar'?'استلام':'claims'}</div>
                <div style={{fontSize:'9px',color: claimed ? '#374151' : 'rgba(252,165,165,0.6)',marginTop:'2px'}}>
                    {claimed ? (lang==='ar'?'✅ تم الاستلام':'✅ Claimed') : (lang==='ar'?'اضغط للتفاصيل':'Tap for details')}
                </div>
            </div>
        </button>
    );
};

window.RedPacketCard = RedPacketCard;
