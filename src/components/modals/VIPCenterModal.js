(function() {
    var VIPCenterModal = ({ show, onClose, userData, user, lang, onNotification, onOpenShop }) => {
    if (!show) return null;
    return (
        <PortalModal>
            <div style={{position:'fixed',inset:0,zIndex:Z.MODAL_HIGH,background:'rgba(0,0,0,0.88)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'8px'}} onClick={onClose}>
                <div onClick={e=>e.stopPropagation()} style={{
                    width:'100%',maxWidth:'min(440px, calc(100vw - 16px))',maxHeight:'92vh',
                    background:'linear-gradient(160deg,rgba(8,6,20,0.99),rgba(14,10,32,0.99))',
                    border:'1px solid rgba(255,215,0,0.2)',borderRadius:'20px',overflow:'hidden',
                    display:'flex',flexDirection:'column',boxShadow:'0 28px 80px rgba(0,0,0,0.9),0 0 60px rgba(255,215,0,0.06)',
                    boxSizing:'border-box',
                }}>
                    {/* Header */}
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 18px',borderBottom:'1px solid rgba(255,215,0,0.15)',background:'linear-gradient(135deg,rgba(255,215,0,0.08),rgba(255,140,0,0.04))',flexShrink:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                            <div style={{fontSize:'28px'}}>👑</div>
                            <div>
                                <div style={{fontSize:'16px',fontWeight:900,color:'#ffd700',letterSpacing:'0.02em'}}>{lang==='ar'?'مركز VIP':'VIP Center'}</div>
                                <div style={{fontSize:'10px',color:'#9ca3af',marginTop:'1px'}}>{lang==='ar'?'امتيازاتك الحصرية':'Your exclusive privileges'}</div>
                            </div>
                        </div>
                        <button onClick={onClose} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'6px 10px',color:'#9ca3af',fontSize:'16px',cursor:'pointer'}}>✕</button>
                    </div>
                    {/* Body — reuse VIPCenterSection */}
                    <div style={{flex:1,overflowY:'auto',padding:'12px 0'}}>
                        <VIPCenterSection userData={userData} user={user} lang={lang} onNotification={onNotification} />
                        {/* Buy VIP button */}
                        <div style={{padding:'14px 16px 8px'}}>
                            <button onClick={()=>{onClose();if(onOpenShop)onOpenShop();}}
                                style={{width:'100%',padding:'13px',borderRadius:'14px',border:'1px solid rgba(255,215,0,0.4)',background:'linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,140,0,0.1))',color:'#ffd700',fontSize:'13px',fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                                🛒 {lang==='ar'?'اشتري VIP من المتجر':'Buy VIP from Shop'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PortalModal>
    );
};

    window.VIPCenterModal = VIPCenterModal;
})();
