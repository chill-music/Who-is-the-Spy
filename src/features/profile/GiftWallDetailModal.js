/**
 * GiftWallDetailModal.js
 * Shows details for a specific gift.
 */
var GiftWallDetailModalV12 = ({ giftDetail, topSenderInfo, lang, onClose }) => {
    var { gift, count, rarity, rKey, level } = giftDetail;
    var topSender = topSenderInfo?.[gift.id];
    var frameStyle = window.getGiftLevelFrame ? window.getGiftLevelFrame(level) : {};
    var needNext = level === 0 ? 5 : level === 1 ? 25 : level === 2 ? 50 : null;
    var needMore = needNext ? needNext - count : 0;

    // Rainbow border animation keyframes injected once
    React.useEffect(() => {
        if (document.getElementById('gw-rainbow-style')) return;
        var s = document.createElement('style');
        s.id = 'gw-rainbow-style';
        s.textContent = `
            @keyframes gw-rainbow { 0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%} }
            @keyframes gw-float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)} }
        `;
        document.head.appendChild(s);
    }, []);

    var borderGrad = rKey==='Mythic'    ? 'linear-gradient(45deg,#ff0055,#7c3aed,#00d4ff,#ff0055)'
                     : rKey==='Legendary' ? 'linear-gradient(45deg,#ffd700,#ff8800,#ffd700,#ff8800)'
                     : rKey==='Epic'      ? 'linear-gradient(45deg,#8b5cf6,#ec4899,#8b5cf6)'
                     : rKey==='Rare'      ? 'linear-gradient(45deg,#3b82f6,#06b6d4,#3b82f6)'
                     :                     'linear-gradient(45deg,#6b7280,#9ca3af,#6b7280)';

    var bgModal = rKey==='Mythic'    ? 'linear-gradient(160deg,#1a0015,#0a0020)'
                   : rKey==='Legendary' ? 'linear-gradient(160deg,#1a1200,#0a0800)'
                   : rKey==='Epic'      ? 'linear-gradient(160deg,#0e0a20,#060412)'
                   : rKey==='Rare'      ? 'linear-gradient(160deg,#001528,#00080e)'
                   :                     'linear-gradient(160deg,#0f0f1a,#080812)';

    var Z_TOOLTIP = (window.Z && window.Z.TOOLTIP) || 9999;
    var VIP_CONFIG = window.VIP_CONFIG || [];

    return (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:Z_TOOLTIP,padding:'16px'}}
            onClick={onClose}>
            {/* Holographic border wrapper */}
            <div onClick={e=>e.stopPropagation()} style={{
                position:'relative', borderRadius:'22px',
                padding:'2.5px',
                background: borderGrad,
                backgroundSize:'300% 300%',
                animation:'gw-rainbow 3s linear infinite',
                boxShadow:`0 0 40px ${rarity.color}55, 0 0 80px ${rarity.color}22`,
                maxWidth:'320px', width:'100%',
            }}>
                {/* Inner modal */}
                <div style={{
                    background: bgModal,
                    borderRadius:'20px',
                    padding:'20px 18px 16px',
                    position:'relative', overflow:'hidden',
                }}>
                    {/* Decorative corner ornaments */}
                    <div style={{position:'absolute',top:'10px',left:'10px',fontSize:'14px',opacity:0.4,color:rarity.color}}>❧</div>
                    <div style={{position:'absolute',top:'10px',right:'10px',fontSize:'14px',opacity:0.4,color:rarity.color,transform:'scaleX(-1)'}}>❧</div>
                    <div style={{position:'absolute',bottom:'10px',left:'10px',fontSize:'14px',opacity:0.3,color:rarity.color,transform:'scaleY(-1)'}}>❧</div>
                    <div style={{position:'absolute',bottom:'10px',right:'10px',fontSize:'14px',opacity:0.3,color:rarity.color,transform:'scale(-1)'}}>❧</div>

                    {/* Close button */}
                    <button onClick={onClose} style={{position:'absolute',top:'10px',right:'14px',background:'rgba(255,255,255,0.08)',border:'none',color:'#9ca3af',fontSize:'14px',cursor:'pointer',borderRadius:'50%',width:'24px',height:'24px',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2}}>✕</button>

                    {/* Gift Image Box */}
                    <div style={{
                        width:'120px', height:'120px', margin:'0 auto 12px',
                        borderRadius:'16px',
                        background: `linear-gradient(135deg,${rarity.color}22,rgba(20,10,35,0.98))`,
                        border: frameStyle.border,
                        boxShadow: frameStyle.shadow,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        position:'relative',overflow:'hidden',
                        animation:'gw-float 3s ease-in-out infinite',
                    }}>
                        {/* Shimmer overlay */}
                        <div style={{position:'absolute',inset:0,background:`radial-gradient(circle at 30% 30%,${rarity.color}18,transparent 60%)`,pointerEvents:'none'}}/>
                        {gift.imageUrl && gift.imageUrl.trim() ? (
                            <img src={gift.imageUrl} alt={gift.name_en} style={{width:'88px',height:'88px',objectFit:'contain',filter:`drop-shadow(0 0 12px ${rarity.color}88)`}} />
                        ) : (
                            <span style={{fontSize:'60px',filter:`drop-shadow(0 0 14px ${rarity.color}99)`}}>{gift.emoji||'🎁'}</span>
                        )}
                    </div>

                    {/* Gift Name */}
                    <div style={{textAlign:'center',fontSize:'18px',fontWeight:900,color:'white',marginBottom:'4px',
                        textShadow:`0 0 20px ${rarity.color}88`,letterSpacing:'0.3px'}}>
                        {lang==='ar'?gift.name_ar:gift.name_en}
                    </div>

                    {/* Rarity badge */}
                    <div style={{display:'flex',justifyContent:'center',marginBottom:'10px'}}>
                        <span style={{fontSize:'10px',fontWeight:800,color:rarity.color,background:`${rarity.color}18`,border:`1px solid ${rarity.border}`,padding:'2px 10px',borderRadius:'20px'}}>
                            {rarity.icon} {lang==='ar'?rarity.name_ar:rarity.name_en}
                        </span>
                    </div>

                    {/* Top Sender Row */}
                    {topSender && (
                        <div style={{
                            display:'flex',alignItems:'center',gap:'8px',
                            padding:'8px 12px',marginBottom:'10px',
                            background:'rgba(255,255,255,0.05)',
                            border:`1px solid ${rarity.border}`,
                            borderRadius:'12px',
                        }}>
                            <img src={topSender.photo||`https://ui-avatars.com/api/?name=${encodeURIComponent(topSender.name||'U')}&background=6366f1&color=fff&size=40`}
                                alt="" style={{width:'36px',height:'36px',borderRadius:'50%',border:`2px solid ${rarity.color}66`,objectFit:'cover',flexShrink:0}} />
                            <div style={{flex:1,minWidth:0}}>
                                <div style={{fontSize:'8px',color:'#9ca3af',fontWeight:600}}>{lang==='ar'?'أكثر من أرسل':'With the most gifts'}</div>
                                <div style={{fontSize:'12px',fontWeight:800,color:'white',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{topSender.name||'?'}</div>
                            </div>
                            <div style={{fontSize:'14px',fontWeight:900,color:rarity.color,flexShrink:0}}>×{topSender.count}</div>
                        </div>
                    )}

                    {/* Stats rows */}
                    <div style={{display:'flex',flexDirection:'column',gap:'6px',marginBottom:'10px'}}>
                        {/* Price */}
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 12px',background:'rgba(255,255,255,0.04)',borderRadius:'9px'}}>
                            <span style={{fontSize:'11px',color:'#9ca3af',fontWeight:600}}>💰 {lang==='ar'?'السعر':'Price'}</span>
                            <span style={{fontSize:'13px',fontWeight:800,color:'#fbbf24'}}>{(gift.cost||0).toLocaleString()} 🧠</span>
                        </div>
                        {/* Amount received */}
                        {count > 0 && (
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 12px',background:'rgba(255,255,255,0.04)',borderRadius:'9px'}}>
                                <span style={{fontSize:'11px',color:'#9ca3af',fontWeight:600}}>📦 {lang==='ar'?'المستلم':'Amount'}</span>
                                <span style={{fontSize:'13px',fontWeight:800,color:rarity.color}}>×{count}</span>
                            </div>
                        )}
                        {/* Star level row */}
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 12px',background:'rgba(255,255,255,0.04)',borderRadius:'9px'}}>
                            <span style={{fontSize:'11px',color:'#9ca3af',fontWeight:600}}>{lang==='ar'?'⭐ المستوى':'⭐ Star'}</span>
                            <div style={{display:'flex',gap:'4px'}}>
                                {[1,2,3].map(s=>(
                                    <span key={s} style={{fontSize:'18px',color:level>=s?'#ffd700':'rgba(255,255,255,0.15)',filter:level>=s?'drop-shadow(0 0 4px #ffd700)':'none'}}>★</span>
                                ))}
                            </div>
                        </div>
                        {/* Charisma */}
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 12px',background:'rgba(255,255,255,0.04)',borderRadius:'9px'}}>
                            <span style={{fontSize:'11px',color:'#9ca3af',fontWeight:600}}>⭐ {lang==='ar'?'كاريزما':'Charisma'}</span>
                            <span style={{fontSize:'13px',fontWeight:800,color:'#fbbf24'}}>{(gift.charisma||0).toLocaleString()}</span>
                        </div>
                        {/* VIP Required */}
                        {gift.vipMinLevel > 0 && (
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 12px',background:'rgba(255,255,255,0.04)',borderRadius:'9px'}}>
                                <span style={{fontSize:'11px',color:'#9ca3af',fontWeight:600}}>👑 {lang==='ar'?'يتطلب':'Requires'}</span>
                                <span style={{fontSize:'13px',fontWeight:900,color:VIP_CONFIG[gift.vipMinLevel-1]?.nameColor||'#ef4444'}}>VIP {gift.vipMinLevel}+</span>
                            </div>
                        )}
                    </div>

                    {/* Level up tip */}
                    {needMore > 0 && (
                        <div style={{textAlign:'center',fontSize:'11px',color:'#f97316',fontWeight:700,padding:'6px 12px',background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.3)',borderRadius:'8px'}}>
                            {lang==='ar'
                                ? `✨ تحتاج ${needMore} هدية أخرى للمستوى التالي!`
                                : `✨ Need ${needMore} more to level up!`}
                        </div>
                    )}
                    {level === 3 && (
                        <div style={{textAlign:'center',fontSize:'11px',color:'#ffd700',fontWeight:800,padding:'6px 12px',background:'rgba(255,215,0,0.1)',border:'1px solid rgba(255,215,0,0.3)',borderRadius:'8px'}}>
                            👑 {lang==='ar'?'الحد الأقصى! أسطوري':'MAX LEVEL! Legendary'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

window.GiftWallDetailModalV12 = GiftWallDetailModalV12;
