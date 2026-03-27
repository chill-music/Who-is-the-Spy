(function() {
    "use strict";

    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\profile\ProfileFamilySignBadge.js ---

/**
 * ProfileFamilySignBadge.js
 * Shows clan sign on profile.
 */
var ProfileFamilySignBadge = ({ userData, lang, onClick }) => {
    var familyTag   = userData?.familyTag;
    var familyName  = userData?.familyName;
    var signLevel   = userData?.familySignLevel || (userData?.familyId ? 1 : null);
    var signData    = (window.FamilyConstants && signLevel) ? window.FamilyConstants.getFamilySignLevelDataByLevel(signLevel) : null;
    var signColor   = signData?.color || userData?.familySignColor || '#6b7280';
    var signImgURL  = (window.FamilyConstants && signLevel) ? window.FamilyConstants.getFamilySignImage(0, signLevel) : (window.getFamilySignURL ? window.getFamilySignURL(userData) : null);

    // Only show if user has a family AND has earned a sign (level > 0)
    if (!familyTag || !signLevel) return null;

    var hasGlow = signLevel >= 4;
    // الـ glow يستخدم لون الساين نفسه — مستوى 5 أحمر، مستوى 4 برتقالي
    var glowIntensity = signLevel === 5 ? 'dd' : signLevel === 4 ? 'cc' : '99';
    var glowMid       = signLevel === 5 ? '88' : signLevel === 4 ? '77' : '55';
    var glowFar       = signLevel === 5 ? '44' : '33';

    // لو في صورة: تظهر كبيرة مع التاج مكتوب فوقها باحتراف
    if (signImgURL) {
        // عرض الصورة يتناسب مع عدد الأحرف — 3→52px  4→62px  5→72px
        var imgW = 44 + (familyTag.length * 6);
        var imgH = Math.round(imgW * 0.55); // نسبة عرض/ارتفاع ثابتة
        // حجم الخط يتناسب مع حجم الصورة
        var fontSize = familyTag.length <= 3 ? 11 : familyTag.length === 4 ? 10 : 9;

        return (
            <span
                onClick={onClick}
                title={familyName ? (lang === 'ar' ? `عائلة: ${familyName}` : `Family: ${familyName}`) : familyTag}
                style={{
                    position:'relative',
                    display:'inline-flex', alignItems:'center', justifyContent:'center',
                    flexShrink:0, cursor: onClick ? 'pointer' : 'default',
                    width:`${imgW}px`, height:`${imgH}px`,
                filter: hasGlow
                        ? `drop-shadow(0 0 6px ${signColor}${glowIntensity}) drop-shadow(0 0 14px ${signColor}${glowMid}) drop-shadow(0 0 22px ${signColor}${glowFar})`
                        : 'none',
                    transition:'all 0.2s',
                }}
            >
                {/* الصورة الخلفية */}
                <img
                    src={signImgURL}
                    alt=""
                    style={{
                        position:'absolute', inset:0,
                        width:'100%', height:'100%',
                        objectFit:'contain',
                        display:'block',
                    }}
                />
                {/* التاج مكتوب فوق الصورة */}
                <span style={{
                    position:'relative', zIndex:1,
                    fontSize:`${fontSize}px`,
                    fontWeight:900,
                    fontStyle:'italic',
                    letterSpacing:'1.5px',
                    color:'#fff',
                    marginTop:'2px',
                    textShadow:`
                        0 0 6px rgba(0,0,0,0.9),
                        0 0 12px rgba(0,0,0,0.7),
                        1px 1px 0 rgba(0,0,0,0.8),
                        -1px -1px 0 rgba(0,0,0,0.8),
                        1px -1px 0 rgba(0,0,0,0.8),
                        -1px 1px 0 rgba(0,0,0,0.8),
                        0 0 18px ${signColor}cc
                    `,
                    userSelect:'none',
                    lineHeight:1,
                }}>
                    {familyTag}
                </span>
            </span>
        );
    }

    // لو ما في صورة: badge نصي عادي
    return (
        <span
            onClick={onClick}
            title={familyName ? (lang === 'ar' ? `عائلة: ${familyName}` : `Family: ${familyName}`) : familyTag}
            style={{
                display:'inline-flex', alignItems:'center', gap:'4px',
                padding:'2px 8px', borderRadius:'6px', fontSize:'11px',
                fontWeight:800, fontStyle:'italic', cursor: onClick ? 'pointer' : 'default',
                background:`${signColor}20`, border:`1px solid ${signColor}55`,
                color:signColor, letterSpacing:'0.5px', whiteSpace:'nowrap', flexShrink:0,
                boxShadow: hasGlow ? `0 0 10px ${signColor}55, 0 0 20px ${signColor}33` : 'none',
                transition:'all 0.2s',
            }}
        >
            {familyTag}
        </span>
    );
};

window.ProfileFamilySignBadge = ProfileFamilySignBadge;


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\profile\WinRateCircle.js ---

(() => {
/**
 * WinRateCircle.js
 * Renders a circular win rate indicator.
 */
var WinRateCircleV11 = ({ wins, losses, lang }) => {
    var total = wins + losses;
    var rate = total > 0 ? Math.round((wins / total) * 100) : 0;

    var getColor = (percentage) => {
        if (percentage >= 70) return '#10b981';
        if (percentage >= 50) return '#facc15';
        if (percentage >= 30) return '#f97316';
        return '#ef4444';
    };

    var gradient = `conic-gradient(${getColor(rate)} ${rate}%, #1f2937 ${rate}%)`;

    return (
        <div className="profile-winrate-circle" style={{ background: gradient, width:'64px', height:'64px', flexShrink:0 }}>
            <div className="profile-winrate-content">
                <span className="profile-winrate-value" style={{ color: getColor(rate), fontSize:'13px' }}>{rate}%</span>
                <span className="profile-winrate-label" style={{fontSize:'7px'}}>{lang === 'ar' ? 'معدل' : 'Win%'}</span>
            </div>
        </div>
    );
};

window.WinRateCircleV11 = WinRateCircleV11;
})();


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\profile\GiftWallDetailModal.js ---

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


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\profile\GiftWall.js ---

/**
 * GiftWall.js
 * Shows the grid of gifts on the profile.
 * Extracted from 15-profile.js
 */
var GiftWallV11 = ({ gifts, lang, onSendGiftToSelf, isOwnProfile, userData, onOpenProfile }) => {
    var [activeTab, setActiveTab] = React.useState('wall');
    var [selectedGiftDetail, setSelectedGiftDetail] = React.useState(null);
    var [showAllGifts, setShowAllGifts] = React.useState(false);
    var [rotatingIdx, setRotatingIdx] = React.useState(0);
    // open full wall modal on banner click
    var [showWallModal, setShowWallModal] = React.useState(false);
    var GIFTS_LIMIT = 32;

    // Calculate gift data (counts, top senders)
    var giftData = React.useMemo(() => {
        var counts = {};
        var lastSenders = {};
        var senderTally = {}; // { giftId: { senderId: count } }

        gifts?.forEach(g => {
            counts[g.giftId] = (counts[g.giftId] || 0) + 1;
            if (!lastSenders[g.giftId]) lastSenders[g.giftId] = { name:g.senderName, photo:g.senderPhoto, uid:g.senderId };
            if (!senderTally[g.giftId]) senderTally[g.giftId] = {};
            senderTally[g.giftId][g.senderId] = (senderTally[g.giftId][g.senderId]||0) + 1;
        });

        // Find top sender per gift
        var topSenderInfo = {};
        Object.entries(senderTally).forEach(([giftId, tally]) => {
            var sorted = Object.entries(tally).sort((a,b)=>b[1]-a[1]);
            if (sorted.length) {
                var [topUid, topCount] = sorted[0];
                var entry = gifts.find(g=>g.giftId===giftId && g.senderId===topUid);
                topSenderInfo[giftId] = { uid:topUid, count:topCount, name:entry?.senderName||'?', photo:entry?.senderPhoto||null };
            }
        });

        return { counts, lastSenders, topSenderInfo };
    }, [gifts]);

    // ALL gifts (hidden + shop + VIP)
    var SHOP_ITEMS = window.SHOP_ITEMS || {};
    var RARITY_CONFIG = window.RARITY_CONFIG || {};
    var VIP_CONFIG = window.VIP_CONFIG || [];
    var Z = window.Z || { MODAL: 1000, TOOLTIP: 9999 };

    var allRegular = SHOP_ITEMS.gifts || [];
    var allVIP     = SHOP_ITEMS.gifts_vip || [];
    var allGifts   = [...allRegular, ...allVIP];
    var displayGifts = showAllGifts ? allGifts : allGifts.slice(0, GIFTS_LIMIT);
    var hasMoreGifts = allGifts.length > GIFTS_LIMIT;

    // Stats
    var totalGifts        = gifts?.length || 0;
    var uniqueTypesCount  = Object.keys(giftData.counts).length;
    var totalCharisma     = gifts?.reduce((s,g)=>s+(g.charisma||0),0)||0;

    // Rotating recent gift images for the mini card
    var recentUnique = React.useMemo(() => {
        var seen = new Set(); var res = [];
        for (var g of (gifts||[])) {
            if (!seen.has(g.giftId)) { seen.add(g.giftId); res.push(g); }
            if (res.length >= 5) break;
        }
        return res;
    }, [gifts]);

    React.useEffect(() => {
        if (recentUnique.length <= 1) return;
        var t = setInterval(()=>setRotatingIdx(p=>(p+1)%recentUnique.length), 1500);
        return ()=>clearInterval(t);
    }, [recentUnique.length]);

    var fmtBig = window.fmtNum; // unified — defined in 01-config.js

    return (
        <div className="profile-gift-section">

            {/* ✅ Mini Preview Banner — clickable → opens full wall modal */}
            <div
                onClick={() => setShowWallModal(true)}
                style={{
                    position:'relative', overflow:'hidden',
                    borderRadius:'16px',
                    background:'linear-gradient(135deg,rgba(8,8,22,0.97),rgba(16,8,36,0.97))',
                    border:'1px solid rgba(255,255,255,0.09)',
                    padding:'14px 16px',
                    cursor:'pointer',
                    transition:'box-shadow 0.2s',
                }}
                onMouseEnter={e=>e.currentTarget.style.boxShadow='0 0 18px rgba(112,0,255,0.25)'}
                onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}
            >
                {/* Star-field backdrop */}
                <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 70% 50%,rgba(112,0,255,0.07),transparent 65%)',pointerEvents:'none'}}/>
                {[{t:'12%',l:'55%',s:3},{t:'40%',l:'80%',s:2},{t:'70%',l:'60%',s:4},{t:'20%',l:'90%',s:2},{t:'60%',l:'72%',s:3}].map((d,i)=>(
                    <div key={i} style={{position:'absolute',top:d.t,left:d.l,width:d.s,height:d.s,borderRadius:'50%',background:'rgba(255,255,255,0.5)',pointerEvents:'none'}}/>
                ))}

                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px',position:'relative'}}>
                    <span style={{fontSize:'13px',fontWeight:800,color:'white',letterSpacing:'0.3px'}}>🎁 {lang==='ar'?'جدار الهدايا':'Gift Wall'}</span>
                    <span style={{fontSize:'11px',color:'#6b7280',fontWeight:600}}>{lang==='ar'?'اضغط للعرض ›':'Tap to view ›'}</span>
                </div>

                <div style={{display:'flex',alignItems:'center',gap:'14px',position:'relative'}}>
                    {/* 3 stacked rotating gift images */}
                    <div style={{position:'relative',width:'82px',height:'60px',flexShrink:0}}>
                        {recentUnique.length>0 ? recentUnique.slice(0,3).map((g,i)=>{
                            var isActive = i===(rotatingIdx % Math.min(3,recentUnique.length));
                            return (
                                <div key={g.id||i} style={{
                                    position:'absolute', left:`${i*16}px`, top:`${i*4}px`,
                                    width:'46px', height:'46px', borderRadius:'12px',
                                    background:'rgba(25,15,50,0.95)',
                                    border:`1.5px solid ${isActive?'rgba(255,215,0,0.65)':'rgba(255,255,255,0.12)'}`,
                                    display:'flex',alignItems:'center',justifyContent:'center',
                                    boxShadow: isActive?'0 0 14px rgba(255,215,0,0.3)':'none',
                                    transition:'all 0.6s ease',
                                    zIndex: 3-i,
                                }}>
                                    {g.giftImageUrl?<img src={g.giftImageUrl} alt="" style={{width:'32px',height:'32px',objectFit:'contain'}}/>
                                        :<span style={{fontSize:'26px'}}>{g.giftEmoji||'🎁'}</span>}
                                </div>
                            );
                        }) : (
                            <div style={{width:'46px',height:'46px',borderRadius:'12px',background:'rgba(255,255,255,0.04)',border:'1.5px dashed rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                <span style={{fontSize:'22px',opacity:0.35}}>🎁</span>
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div style={{display:'flex',flex:1,justifyContent:'space-around',alignItems:'center'}}>
                        {[
                            {val:totalGifts,            label:lang==='ar'?'هدية':'Gift',  color:'white'},
                            {val:fmtBig?fmtBig(totalCharisma):totalCharisma, label:lang==='ar'?'نجمة':'Star',  color:'#fbbf24'},
                            {val:uniqueTypesCount,       label:lang==='ar'?'نوع':'Badge',  color:'#a78bfa'},
                        ].map((s,i,arr)=>(
                            <React.Fragment key={s.label}>
                                <div style={{textAlign:'center'}}>
                                    <div style={{fontSize:'20px',fontWeight:900,color:s.color,lineHeight:1}}>{s.val}</div>
                                    <div style={{fontSize:'9px',color:'#6b7280',marginTop:'3px',fontWeight:600}}>{s.label}</div>
                                </div>
                                {i<arr.length-1 && <div style={{width:'1px',height:'34px',background:'rgba(255,255,255,0.07)'}}/>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* ✅ Full Wall Modal — opens when banner is tapped */}
            {showWallModal && (
                <window.PortalModal>
                    <div onClick={() => setShowWallModal(false)} style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)',
                        zIndex: Z.MODAL, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '16px',
                    }}>
                        <div onClick={e => e.stopPropagation()} style={{
                            width: '100%', maxWidth: '420px', maxHeight: '82vh',
                            borderRadius: '18px', overflow: 'hidden',
                            display: 'flex', flexDirection: 'column',
                            background: 'linear-gradient(160deg,#060612,#0a0a1e)',
                            border: '1px solid rgba(255,255,255,0.09)',
                            boxShadow: '0 24px 60px rgba(0,0,0,0.9)',
                        }}>
                            {/* Modal header */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '14px 16px',
                                background: 'linear-gradient(135deg,rgba(8,8,22,1),rgba(20,10,40,1))',
                                borderBottom: '1px solid rgba(255,255,255,0.08)',
                                flexShrink: 0,
                            }}>
                                <span style={{ fontSize: '15px', fontWeight: 900, color: 'white' }}>🎁 {lang === 'ar' ? 'جدار الهدايا' : 'Gift Wall'}</span>
                                <button onClick={() => setShowWallModal(false)} style={{
                                    background: 'rgba(255,255,255,0.08)', border: 'none', color: '#9ca3af',
                                    fontSize: '16px', cursor: 'pointer', borderRadius: '50%',
                                    width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>✕</button>
                            </div>

                            {/* Tab buttons */}
                            <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                                {[
                                    { id: 'wall', icon: '🎁', ar: 'الهدايا', en: 'Gifts' },
                                    { id: 'log', icon: '📬', ar: 'السجل', en: 'Log' },
                                ].map(tab => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                                        flex: 1, padding: '10px 4px', fontSize: '12px', fontWeight: 700,
                                        cursor: 'pointer', border: 'none',
                                        background: 'transparent',
                                        color: activeTab === tab.id ? '#00f2ff' : '#6b7280',
                                        borderBottom: activeTab === tab.id ? '2px solid #00f2ff' : '2px solid transparent',
                                    }}>
                                        {tab.icon} {lang === 'ar' ? tab.ar : tab.en}
                                    </button>
                                ))}
                            </div>

                            {/* Scrollable content */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', background: 'linear-gradient(160deg,#060612,#0a0a1e)' }}>

                                {/* ── Gift Wall Grid ── */}
                                {activeTab === 'wall' && (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                                            {displayGifts.map(gift => {
                                                var count = giftData.counts[gift.id] || 0;
                                                var unlocked = count > 0;
                                                var lvl = window.getGiftLevel ? window.getGiftLevel(count) : 0;
                                                var frame = window.getGiftLevelFrame ? window.getGiftLevelFrame(lvl) : {};
                                                var rKey = window.getGiftRarity ? window.getGiftRarity(gift.cost) : 'Common';
                                                var rarity = RARITY_CONFIG[rKey] || {};
                                                var topSdr = giftData.lastSenders[gift.id];
                                                var isVIP = gift.type === 'gifts_vip';
                                                var vipCfg = isVIP && gift.vipMinLevel > 0 ? VIP_CONFIG[gift.vipMinLevel - 1] : null;
                                                var vipColor = vipCfg ? vipCfg.nameColor : null;

                                                return (
                                                    <div key={gift.id}
                                                        onClick={() => setSelectedGiftDetail({ gift, count, rarity, rKey, level: lvl })}
                                                        style={{
                                                            position: 'relative', borderRadius: '11px', cursor: 'pointer',
                                                            border: unlocked ? (vipColor ? `2px solid ${vipColor}88` : frame.border) : '1.5px solid rgba(50,50,70,0.35)',
                                                            background: unlocked
                                                                ? (vipColor
                                                                    ? `linear-gradient(160deg,${vipColor}16,rgba(12,8,22,0.97))`
                                                                    : `linear-gradient(160deg,${rarity.color}14,rgba(12,8,22,0.97))`)
                                                                : 'rgba(12,12,22,0.7)',
                                                            boxShadow: unlocked ? (vipColor ? `0 0 8px ${vipColor}33` : frame.shadow) : 'none',
                                                            aspectRatio: '3/4',
                                                            overflow: 'hidden',
                                                            transition: 'transform 0.15s',
                                                        }}
                                                        onMouseEnter={e => { if (unlocked) e.currentTarget.style.transform = 'scale(1.06)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                                                    >
                                                        {/* Sender avatar — top right */}
                                                        {unlocked && topSdr?.photo && (
                                                            <img src={topSdr.photo} alt=""
                                                                style={{ position: 'absolute', top: '4px', right: '4px', width: '16px', height: '16px', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.25)', zIndex: 4, objectFit: 'cover' }} />
                                                        )}
                                                        {/* Level badge — top left */}
                                                        {unlocked && lvl > 0 && (
                                                            <div style={{
                                                                position: 'absolute', top: '4px', left: '4px',
                                                                width: '14px', height: '14px', borderRadius: '50%',
                                                                background: lvl === 3 ? '#ffd700' : lvl === 2 ? '#C0C0C0' : '#cd7f32',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontSize: '7px', fontWeight: 900, color: '#000', zIndex: 4,
                                                                boxShadow: `0 0 6px ${lvl === 3 ? '#ffd70099' : lvl === 2 ? '#C0C0C099' : '#cd7f3299'}`,
                                                            }}>{lvl}</div>
                                                        )}
                                                        {/* VIP badge */}
                                                        {isVIP && vipColor && !unlocked && (
                                                            <div style={{ position: 'absolute', top: '3px', left: '3px', fontSize: '6px', fontWeight: 900, background: vipColor, color: '#000', padding: '1px 3px', borderRadius: '3px', lineHeight: 1.2, zIndex: 4 }}>
                                                                V{gift.vipMinLevel}
                                                            </div>
                                                        )}
                                                        {/* Gift icon */}
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '68%', paddingTop: '6px' }}>
                                                            {gift.imageUrl && gift.imageUrl.trim() ? (
                                                                <img src={gift.imageUrl} alt={gift.name_en} style={{ width: '40px', height: '40px', objectFit: 'contain', filter: unlocked ? `drop-shadow(0 0 6px ${rarity.color}66)` : 'grayscale(1)' }} />
                                                            ) : (
                                                                <span style={{ fontSize: '24px', lineHeight: 1, filter: unlocked ? `drop-shadow(0 0 7px ${rarity.color}77)` : 'grayscale(1) opacity(0.5)' }}>{gift.emoji || '🎁'}</span>
                                                            )}
                                                        </div>
                                                        {/* Stars */}
                                                        {unlocked && (
                                                            <div style={{ position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '1px' }}>
                                                                {[1, 2, 3].map(s => (
                                                                    <span key={s} style={{ fontSize: '8px', color: lvl >= s ? '#ffd700' : 'rgba(255,255,255,0.18)', filter: lvl >= s ? 'drop-shadow(0 0 3px #ffd700)' : 'none' }}>★</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {/* Name + count */}
                                                        <div style={{
                                                            position: 'absolute', bottom: 0, left: 0, right: 0,
                                                            background: 'linear-gradient(transparent,rgba(0,0,0,0.88))',
                                                            borderRadius: '0 0 9px 9px', padding: '2px 4px 3px',
                                                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                        }}>
                                                            <span style={{ fontSize: '7px', color: '#d1d5db', fontWeight: 600, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                                                                {lang === 'ar' ? gift.name_ar : gift.name_en}
                                                            </span>
                                                            {unlocked && <span style={{ fontSize: '8px', color: frame.labelColor, fontWeight: 800, lineHeight: 1 }}>×{count}</span>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {hasMoreGifts && (
                                            <button onClick={() => setShowAllGifts(v => !v)} style={{
                                                width: '100%', marginTop: '8px', padding: '8px',
                                                background: 'rgba(0,242,255,0.05)', border: '1px solid rgba(0,242,255,0.15)',
                                                borderRadius: '8px', color: '#00f2ff', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                                            }}>
                                                {showAllGifts ? (lang === 'ar' ? '▲ عرض أقل' : '▲ Show Less') :
                                                    `▼ ${lang === 'ar' ? 'المزيد' : 'More'} (${allGifts.length - GIFTS_LIMIT} ${lang === 'ar' ? 'هدية' : 'gifts'})`}
                                            </button>
                                        )}
                                    </>
                                )}

                                {/* ── Log Tab ── */}
                                {activeTab === 'log' && (
                                    <div className="profile-gift-log">
                                        {gifts && gifts.length > 0 ? (
                                            gifts.slice(0, 10).map((gift, idx) => {
                                                var logRarityKey = window.getGiftRarity ? window.getGiftRarity(gift.giftCost || 0) : 'Common';
                                                var isMythicLog = logRarityKey === 'Mythic';
                                                return (
                                                    <div key={idx} className={`profile-gift-log-item${isMythicLog ? ' mythic-glow' : ''}`}
                                                        style={isMythicLog ? { border: '1px solid rgba(255,0,85,0.5)', background: 'rgba(255,0,85,0.08)' } : {}}>
                                                        <img src={gift.senderPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(gift.senderName || 'User')}&background=6366f1&color=fff`}
                                                            alt="" className="profile-gift-log-avatar"
                                                            onClick={() => gift.senderId && onOpenProfile && onOpenProfile(gift.senderId)}
                                                            title={gift.senderName || 'Unknown'} />
                                                        <div className="profile-gift-log-content">
                                                            <div className="profile-gift-log-sender">
                                                                {gift.senderName || 'Unknown'}
                                                                {isMythicLog && <span style={{ marginLeft: '4px', fontSize: '9px', color: '#ff0055' }}>🔮 Mythic</span>}
                                                            </div>
                                                            <div className="profile-gift-log-details">
                                                                <span className="profile-gift-log-emoji">{gift.giftEmoji || '🎁'}</span>
                                                                <span className="profile-gift-log-name">{lang === 'ar' ? (gift.giftNameAr || 'هدية') : (gift.giftNameEn || 'Gift')}</span>
                                                            </div>
                                                        </div>
                                                        <div className="profile-gift-log-stats">
                                                            <div className="profile-gift-log-charisma" style={isMythicLog ? { color: '#ff0055' } : {}}>+{gift.charisma || 0}</div>
                                                            <div className="profile-gift-log-time">{gift.timestamp?.toDate ? formatTime(gift.timestamp) : ''}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="profile-gift-empty">
                                                <span style={{ fontSize: '32px' }}>🎁</span>
                                                <span>{lang === 'ar' ? 'لا توجد هدايا بعد' : 'No gifts yet'}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>{/* end inner dialog */}
                    </div>{/* end backdrop */}

                    {/* ── Gift Detail Modal (on top of wall modal) ── */}
                    {selectedGiftDetail && (
                        <window.GiftWallDetailModalV12
                            giftDetail={selectedGiftDetail}
                            topSenderInfo={giftData.topSenderInfo}
                            lang={lang}
                            onClose={() => setSelectedGiftDetail(null)}
                        />
                    )}
                </window.PortalModal>
            )}
        </div>
    );
};

window.GiftWallV11 = GiftWallV11;


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\profile\ProfileStats.js ---

// ════════════════════════════════════════════════════════════
// 🏗️ PROFILE STATS COMPONENT
// ════════════════════════════════════════════════════════════
var ProfileStats = ({
    wins,
    losses,
    charismaRank,
    level,
    lang
}) => {
    return (
        <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-evenly',
            width:'100%', padding:'10px 8px', boxSizing:'border-box',
            background:'rgba(0,0,0,0.15)', borderTop:'1px solid rgba(255,255,255,0.05)',
            borderBottom:'1px solid rgba(255,255,255,0.05)', margin:'8px 0'
        }}>
            {/* Wins */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flex:'1',minWidth:0}}>
                <span style={{fontSize:'18px',fontWeight:900,color:'#4ade80',lineHeight:1}}>{wins}</span>
                <span style={{fontSize:'8px',color:'#6b7280',fontWeight:600,textAlign:'center'}}>🏆 {lang==='ar'?'فوز':'Wins'}</span>
            </div>
            {/* Divider */}
            <div style={{width:'1px',height:'32px',background:'rgba(255,255,255,0.08)',flexShrink:0}}/>
            {/* Losses */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flex:'1',minWidth:0}}>
                <span style={{fontSize:'18px',fontWeight:900,color:'#f87171',lineHeight:1}}>{losses}</span>
                <span style={{fontSize:'8px',color:'#6b7280',fontWeight:600,textAlign:'center'}}>💀 {lang==='ar'?'خسارة':'Losses'}</span>
            </div>
            {/* Divider */}
            <div style={{width:'1px',height:'32px',background:'rgba(255,255,255,0.08)',flexShrink:0}}/>
            {/* Win Rate */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flex:'1.2',minWidth:0}}>
                <WinRateCircleV11 wins={wins} losses={losses} lang={lang} />
            </div>
            {/* Divider */}
            <div style={{width:'1px',height:'32px',background:'rgba(255,255,255,0.08)',flexShrink:0}}/>
            {/* Rank */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flex:'1',minWidth:0}}>
                <span style={{fontSize:'18px',fontWeight:900,color:'#fbbf24',lineHeight:1}}>#{charismaRank||'--'}</span>
                <span style={{fontSize:'8px',color:'#6b7280',fontWeight:600,textAlign:'center'}}>🎖️ {lang==='ar'?'رتبة':'Rank'}</span>
            </div>
            {/* Divider */}
            <div style={{width:'1px',height:'32px',background:'rgba(255,255,255,0.08)',flexShrink:0}}/>
            {/* Level */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flex:'1',minWidth:0}}>
                <span style={{fontSize:'18px',fontWeight:900,color:'#a78bfa',lineHeight:1}}>{level}</span>
                <span style={{fontSize:'8px',color:'#6b7280',fontWeight:600,textAlign:'center'}}>⚡ {lang==='ar'?'مستوى':'Level'}</span>
            </div>
        </div>
    );
};

window.ProfileStats = ProfileStats;


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\profile\ProfileTabs.js ---

/**
 * ProfileTabs.js
 * Modular component for profile navigation tabs.
 * Part of Phase 4: Batch 3 modularization.
 */

var ProfileTabs = ({ activeTab, setActiveTab, lang }) => {
    var TABS = [
        { id: 'about',   label_en: 'About',   label_ar: 'حول',      icon: '👤' },
        { id: 'games',   label_en: 'Games',   label_ar: 'الألعاب',   icon: '🎮' },
        { id: 'friends', label_en: 'Friends', label_ar: 'الأصدقاء',  icon: '👥' },
        { id: 'gifts',   label_en: 'Gifts',   label_ar: 'الهدايا',   icon: '🎁' },
        { id: 'moments', label_en: 'Moments', label_ar: 'المنشورات', icon: '📸' },
    ];

    var S = {
        container: {
            display: 'flex',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(0,0,0,0.2)',
            flexShrink: 0,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            padding: '4px 8px',
            gap: '4px'
        },
        tab: (isActive) => ({
            flex: 1,
            padding: '10px 4px 8px',
            fontSize: '11px',
            fontWeight: isActive ? 800 : 500,
            color: isActive ? '#00f2ff' : '#6b7280',
            background: isActive ? 'rgba(0,242,255,0.05)' : 'transparent',
            border: 'none',
            borderBottom: `2px solid ${isActive ? '#00f2ff' : 'transparent'}`,
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.25s ease',
            minWidth: '65px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px'
        }),
        icon: {
            fontSize: '16px',
            marginBottom: '2px'
        },
        label: {
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        }
    };

    return (
        <div style={S.container} className="profile-tabs-scroll">
            {TABS.map(tab => {
                var isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={S.tab(isActive)}
                        title={lang === 'ar' ? tab.label_ar : tab.label_en}
                    >
                        <span style={S.icon}>{tab.icon}</span>
                        <span style={S.label}>{lang === 'ar' ? tab.label_ar : tab.label_en}</span>
                    </button>
                );
            })}
        </div>
    );
};

// Export to window for global access
window.ProfileTabs = ProfileTabs;


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\profile\AchievementsDisplay.js ---

/**
 * AchievementsDisplay.js
 * Modular component for displaying user achievements in a tiered system.
 * Part of Phase 4: Batch 4 modularization.
 * 
 * @param {Object} props
 * @param {Object} props.userData - The user data containing achievements and stats.
 * @param {string} props.lang - Language code ('ar' or 'en').
 * @param {boolean} [props.showAll=false] - Whether to show all groups initially.
 */
var AchievementsDisplayV11 = ({ userData, lang, showAll = false }) => {
    var rawAchievements = userData?.achievements;

    // Memoized list of unlocked achievement IDs
    var unlockedIds = React.useMemo(() => {
        if (!rawAchievements) return [];
        if (Array.isArray(rawAchievements)) {
            return rawAchievements
                .map(item => (typeof item === 'string' ? item : item?.id))
                .filter(Boolean);
        }
        if (rawAchievements?.badges && Array.isArray(rawAchievements.badges)) {
            return rawAchievements.badges.map(b => b?.id || b).filter(Boolean);
        }
        return [];
    }, [rawAchievements]);

    /**
     * Helper to get the current value for an achievement condition from user data.
     * @param {Object} ach - The achievement object.
     * @returns {number}
     */
    var getCurrentVal = (ach) => {
        var stats = userData?.stats || {};
        switch (ach.condition.type) {
            case 'wins':           return stats.wins || 0;
            case 'games_played':   return (stats.wins || 0) + (stats.losses || 0);
            case 'spy_wins':       return stats.spy_wins || 0;
            case 'agent_wins':     return stats.agent_wins || 0;
            case 'win_streak':     return stats.win_streak || 0;
            case 'gifts_received': return userData?.giftsReceived || 0;
            case 'gifts_sent':     return userData?.giftsSent || 0;
            case 'charisma':       return userData?.charisma || 0;
            case 'friends':        return (userData?.friends || []).length;
            case 'login_streak':   return userData?.loginRewards?.streak || 0;
            case 'total_logins':   return userData?.loginRewards?.totalClaims || 0;
            default:               return 0;
        }
    };

    // Tier visual configuration constants
    var TIER_STYLE = {
        1: { color: '#9ca3af',  glow: false, label: TRANSLATIONS[lang]?.achTier1 || 'Bronze' },
        2: { color: '#60a5fa',  glow: false, label: TRANSLATIONS[lang]?.achTier2 || 'Silver' },
        3: { color: '#fbbf24',  glow: true,  label: TRANSLATIONS[lang]?.achTier3 || 'Legendary' },
        4: { color: '#00d4ff',  glow: true,  label: TRANSLATIONS[lang]?.achTier4 || 'Divine', ultimate: true, isDivine: true },
    };
    var TIER_DOT_COLOR = { 1: '#78716c', 2: '#60a5fa', 3: '#fbbf24', 4: '#00d4ff' };

    // Memoized grouped achievements
    var groups = React.useMemo(() => {
        var groupMap = {};
        ACHIEVEMENTS.forEach(ach => {
            var g = ach.group || 'misc';
            if (!groupMap[g]) groupMap[g] = [];
            groupMap[g].push(ach);
        });
        
        Object.values(groupMap).forEach(arr => arr.sort((a, b) => a.tier - b.tier));

        return Object.entries(groupMap).map(([groupKey, tiers]) => {
            var highestUnlocked = tiers.reduce((best, ach) =>
                unlockedIds.includes(ach.id) && ach.tier > best ? ach.tier : best, 0);
            
            var nextTier = tiers.find(a => !unlockedIds.includes(a.id));
            var progress = nextTier
                ? Math.min(100, Math.round((getCurrentVal(nextTier) / nextTier.condition.value) * 100))
                : 100;
            
            return { groupKey, tiers, highestUnlocked, nextTier, progress };
        }).sort((a, b) => {
            if (b.highestUnlocked !== a.highestUnlocked) return b.highestUnlocked - a.highestUnlocked;
            return b.progress - a.progress;
        });
    }, [unlockedIds, userData]);

    var [selectedGroup, setSelectedGroup] = React.useState(null);
    var unlockedCount  = unlockedIds.length;
    var totalCount     = ACHIEVEMENTS.length;

    return (
        <div className="profile-achievements-section">
            {/* Header with Title and Unlock Progress */}
            <div className="profile-achievements-header" style={{ marginBottom: '12px' }}>
                <span className="profile-achievements-title">
                    🏆 {lang === 'ar' ? 'الإنجازات' : 'Achievements'}
                </span>
                <span style={{
                    fontSize:'11px', fontWeight:800, padding:'2px 8px', borderRadius:'8px',
                    background: unlockedCount > 0 ? 'rgba(255,215,0,0.15)' : 'rgba(100,100,100,0.15)',
                    color: unlockedCount > 0 ? '#ffd700' : '#6b7280',
                    border: unlockedCount > 0 ? '1px solid rgba(255,215,0,0.35)' : '1px solid rgba(100,100,100,0.25)'
                }}>
                    {unlockedCount}/{totalCount}
                </span>
            </div>

            {/* Grid of Achievement Groups */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:'8px' }}>
                {groups.map(({ groupKey, tiers, highestUnlocked, nextTier, progress }) => {
                    var displayTier = highestUnlocked > 0 ? tiers[highestUnlocked - 1] : tiers[0];
                    var ts          = TIER_STYLE[highestUnlocked] || TIER_STYLE[1];
                    var allDone     = highestUnlocked === 4;
                    var isUnlocked  = highestUnlocked > 0;
                    var tierColor   = isUnlocked ? ts.color : '#4b5563';

                    return (
                        <div
                            key={groupKey}
                            onClick={() => setSelectedGroup({ groupKey, tiers })}
                            style={{
                                position:'relative', cursor:'pointer',
                                borderRadius:'12px',
                                border: `1px solid ${isUnlocked ? tierColor + '66' : 'rgba(255,255,255,0.08)'}`,
                                background: isUnlocked
                                    ? `linear-gradient(135deg,${tierColor}11,rgba(15,15,26,0.97))`
                                    : 'rgba(15,15,26,0.5)',
                                boxShadow: ts.glow && isUnlocked
                                    ? (ts.ultimate ? `0 0 16px ${tierColor}88, 0 0 30px ${tierColor}44` : `0 0 8px ${tierColor}55`)
                                    : 'none',
                                padding:'10px 8px',
                                display:'flex', flexDirection:'column', alignItems:'center', gap:'5px',
                                animation: ts.isDivine && isUnlocked ? 'divine-aura 3s ease-in-out infinite' : ts.ultimate && isUnlocked ? 'mythic-pulse 2.5s ease-in-out infinite' : 'none',
                                opacity: isUnlocked ? 1 : 0.5,
                                transition: 'transform 0.2s ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <span style={{
                                fontSize:'24px',
                                filter: isUnlocked
                                    ? (ts.ultimate ? `drop-shadow(0 0 10px ${tierColor})` : ts.glow ? `drop-shadow(0 0 6px ${tierColor})` : 'none')
                                    : 'grayscale(100%)'
                            }}>
                                {displayTier.icon || '🏅'}
                            </span>

                            {isUnlocked && (
                                <span style={{
                                    fontSize:'8px', fontWeight:900, color: tierColor,
                                    textTransform:'uppercase', letterSpacing:'0.5px'
                                }}>
                                    {ts.label}
                                </span>
                            )}

                            <span style={{ fontSize:'9px', color: isUnlocked ? '#e2e8f0' : '#6b7280', textAlign:'center', lineHeight:1.3 }}>
                                {TRANSLATIONS[lang]?.[displayTier.nameKey] || groupKey}
                            </span>

                            {/* Tier Progress Dots */}
                            <div style={{ display:'flex', gap:'3px', marginTop:'2px' }}>
                                {tiers.map(a => (
                                    <div key={a.id} style={{
                                        width:'7px', height:'7px', borderRadius:'50%',
                                        background: unlockedIds.includes(a.id)
                                            ? TIER_DOT_COLOR[a.tier]
                                            : 'rgba(255,255,255,0.1)',
                                        boxShadow: unlockedIds.includes(a.id) && a.tier >= 3
                                            ? `0 0 5px ${TIER_DOT_COLOR[a.tier]}`
                                            : 'none',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        transition:'all 0.2s'
                                    }} />
                                ))}
                            </div>

                            {/* Circular progress or status */}
                            {allDone ? (
                                <div style={{ fontSize:'8px', color:'#fbbf24', fontWeight:700 }}>
                                    {lang === 'ar' ? '✓ مكتمل!' : '✓ Complete!'}
                                </div>
                            ) : nextTier && (
                                <div style={{ width:'100%' }}>
                                    <div style={{
                                        width:'100%', height:'4px', borderRadius:'2px',
                                        background:'rgba(255,255,255,0.07)', overflow:'hidden'
                                    }}>
                                        <div style={{
                                            width:`${progress}%`, height:'100%',
                                            background: `linear-gradient(90deg, #7c3aed, ${tierColor})`,
                                            borderRadius:'2px', transition:'width 0.4s'
                                        }} />
                                    </div>
                                    <div style={{ fontSize:'7px', color:'#6b7280', textAlign:'center', marginTop:'2px' }}>
                                        {getCurrentVal(nextTier)}/{nextTier.condition.value}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Achievement Detail Overlay */}
            {selectedGroup && (
                <PortalModal>
                    <div
                        style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            zIndex:Z.TOOLTIP, padding:'16px' }}
                        onClick={() => setSelectedGroup(null)}
                    >
                        <div
                            className="achievement-detail-modal animate-pop"
                            onClick={e => e.stopPropagation()}
                            style={{ maxWidth:'340px', width:'100%' }}
                        >
                            <div style={{ fontSize:'13px', fontWeight:800, color:'#e2e8f0', marginBottom:'12px', textAlign:'center' }}>
                                🏆 {lang === 'ar' ? 'مستويات الإنجاز' : 'Achievement Tiers'}
                            </div>
                            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                                {selectedGroup.tiers.map(ach => {
                                    var isUnlocked = unlockedIds.includes(ach.id);
                                    var ts         = TIER_STYLE[ach.tier];
                                    var cur        = getCurrentVal(ach);
                                    var pct        = Math.min(100, Math.round((cur / ach.condition.value) * 100));
                                    return (
                                        <div key={ach.id} style={{
                                            padding:'10px 12px', borderRadius:'10px',
                                            background: isUnlocked
                                                ? `linear-gradient(135deg,${ts.color}15,rgba(15,15,26,0.97))`
                                                : 'rgba(255,255,255,0.03)',
                                            border: `1px solid ${isUnlocked ? ts.color + '55' : 'rgba(255,255,255,0.08)'}`,
                                            boxShadow: isUnlocked && ts.glow ? `0 0 10px ${ts.color}44` : 'none',
                                            opacity: isUnlocked ? 1 : 0.55,
                                            display:'flex', alignItems:'center', gap:'10px'
                                        }}>
                                            <span style={{
                                                fontSize:'22px',
                                                filter: isUnlocked && ts.glow ? `drop-shadow(0 0 6px ${ts.color})` : (isUnlocked ? 'none' : 'grayscale(80%)')
                                            }}>
                                                {ach.icon}
                                            </span>
                                            <div style={{ flex:1 }}>
                                                <div style={{ fontSize:'11px', fontWeight:800, color: isUnlocked ? ts.color : '#9ca3af' }}>
                                                    {ts.label} — {TRANSLATIONS[lang]?.[ach.nameKey] || ach.id}
                                                </div>
                                                <div style={{ fontSize:'10px', color:'#6b7280', marginTop:'2px' }}>
                                                    {TRANSLATIONS[lang]?.[ach.descKey] || ''}
                                                </div>
                                                {!isUnlocked && (
                                                    <div style={{ marginTop:'5px' }}>
                                                        <div style={{ width:'100%', height:'4px', borderRadius:'2px', background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
                                                            <div style={{ width:`${pct}%`, height:'100%', background:`linear-gradient(90deg,#7c3aed,${ts.color})`, transition:'width 0.4s' }} />
                                                        </div>
                                                        <div style={{ fontSize:'9px', color:'#6b7280', marginTop:'2px' }}>{cur}/{ach.condition.value}</div>
                                                    </div>
                                                )}
                                            </div>
                                            {isUnlocked && (
                                                <span style={{ fontSize:'16px', color:'#4ade80' }}>✓</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                className="achievement-detail-close-bottom"
                                onClick={() => setSelectedGroup(null)}
                                style={{ marginTop:'12px' }}
                            >
                                {lang === 'ar' ? 'إغلاق' : 'Close'} ✕
                            </button>
                        </div>
                    </div>
                </PortalModal>
            )}
        </div>
    );
};

// Export to global scope
window.AchievementsDisplayV11 = AchievementsDisplayV11;


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\features\profile\ProfileV11.js ---

(function() {
    var { useState, useEffect, useRef, useMemo, useCallback } = React;

    var ProfileV11 = ({
    show,
    onClose,
    targetUID,
    lang,
    currentUserUID,
    onSendFriendRequest,
    onSendGift,
    userData,
    currentUserFriends,
    currentUserFriendRequests,
    friendsData,
    isOwnProfileOverride = false,
    onOpenSettings,
    onOpenShop,
    onOpenInventory,
    onLogout,
    onLoginGoogle,
    isLoggedIn: isLoggedInProp,
    isGuest: isGuestProp,
    sessionClaimedToday,
    onOpenLoginRewards,
    currency: currencyProp,
    onOpenChat,
    onOpenProfile,
    currentViewerData,  // logged-in viewer's user data (for couple gift sending)
    onOpenMarriage,     // opens the marriage/wedding hall page
    onOpenFamily,       // opens family modal (pass familyId to view any family)
    onOpenBFFModal,     // opens BFF modal for own profile
    onNotification = () => {},  // optional notification callback
}) => {
    var t = TRANSLATIONS[lang] || {};

    var [targetData, setTargetData] = useState(null);
    var [loading, setLoading] = useState(true);
    var [showGiftModal, setShowGiftModal] = useState(false);
    var [requestSent, setRequestSent] = useState(false);
    var [showOptionsMenu, setShowOptionsMenu] = useState(false);
    var [isBlocked, setIsBlocked] = useState(false);
    var [blockedByTarget, setBlockedByTarget] = useState(false);
    var [showBlockConfirm, setShowBlockConfirm] = useState(false);
    var [gifts, setGifts] = useState([]);
    var [charismaRank, setCharismaRank] = useState(null);
    var [copiedId, setCopiedId] = useState(false);
    var [bannerURL, setBannerURL] = useState(null);
    var [bannerUploading, setBannerUploading] = useState(false);
    var bannerFileRef = useRef(null);
    var [showReportModal, setShowReportModal] = useState(false);
    var [reportReason, setReportReason] = useState('');
    var [reportDescription, setReportDescription] = useState('');
    var [reportImagePreview, setReportImagePreview] = useState(null); // base64
    var [reportSending, setReportSending] = useState(false);
    var [selfGift, setSelfGift] = useState(null);
    var [showSelfGiftModal, setShowSelfGiftModal] = useState(false);

    var [showBanModal, setShowBanModal] = useState(false);
    var [showRoleModal, setShowRoleModal] = useState(false);
    var [showRoleInfoPopup, setShowRoleInfoPopup] = useState(false);

    // 💍 Couple badge state
    var [profileCoupleDoc, setProfileCoupleDoc]         = useState(null);
    var [profilePartnerData, setProfilePartnerData]     = useState(null);
    var [showProfileCoupleCard, setShowProfileCoupleCard] = useState(false);

    // 🛡️ GUARD SYSTEM STATE
    var [guardData, setGuardData]               = useState([]);   // top guardians [{uid,name,photo,total}]
    var [showGuardModal, setShowGuardModal]     = useState(false);
    var [guardGiven, setGuardGiven]             = useState(false); // did viewer already give guard today?
    var [guardLockedUntil, setGuardLockedUntil] = useState(null); // timestamp of next unlock
    var guardCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('guard_log');

    var [activeTab, setActiveTab] = useState('about');
    var optionsRef = useRef(null);

    useEffect(() => {
        if (!show || !targetUID) {
            setLoading(false); // ← was setLoading(true) — caused permanent freeze when no targetUID
            return;
        }

        var isMounted = true;
        setLoading(true);
        setRequestSent(false);
        setShowOptionsMenu(false);

        // Safety timeout: never stay loading > 10 seconds
        var safetyTimer = setTimeout(() => {
            if (isMounted) { setLoading(false); }
        }, 10000);

        usersCollection.doc(targetUID).get().then(doc => {
            if (!isMounted) return;
            clearTimeout(safetyTimer);
            if (doc.exists) {
                var data = doc.data();
                setTargetData({ id: doc.id, ...data, isGuest: false });
                setBannerURL(data.bannerURL || null);
                var theirBlockedUsers = data.blockedUsers || [];
                setBlockedByTarget(theirBlockedUsers.includes(currentUserUID));
                setLoading(false);
            } else {
                guestsCollection.doc(targetUID).get().then(guestDoc => {
                    if (!isMounted) return;
                    if (guestDoc.exists) {
                        setTargetData({ id: guestDoc.id, ...guestDoc.data(), isGuest: true });
                    } else {
                        setTargetData(null);
                    }
                    setLoading(false);
                }).catch(() => {
                    if (isMounted) { setTargetData(null); setLoading(false); }
                });
            }
        }).catch(() => {
            if (isMounted) { setLoading(false); setTargetData(null); }
            clearTimeout(safetyTimer);
        });

        return () => { isMounted = false; clearTimeout(safetyTimer); };
    }, [show, targetUID, currentUserUID]);

    useEffect(() => {
        if (userData && targetUID) {
            var blocked = userData.blockedUsers || [];
            setIsBlocked(blocked.includes(targetUID));
        }
    }, [userData, targetUID]);

    // 💍 Real-time couple doc + real-time partner photo listener — MUTUAL (works for both uid1 and uid2)
    useEffect(() => {
        if (!show || !targetUID) {
            setProfileCoupleDoc(null);
            setProfilePartnerData(null);
            return;
        }
        var unsubPartner;
        var foundDoc = false; // track if we found a match from either query

        var attachPartnerListener = (partnerUID) => {
            if (unsubPartner) unsubPartner();
            unsubPartner = usersCollection.doc(partnerUID)
                .onSnapshot(doc => {
                    if (doc.exists) setProfilePartnerData({ id: doc.id, ...doc.data() });
                }, () => {});
        };

        // Query both directions simultaneously — first match wins
        var p1 = couplesCollection
            .where('uid1', '==', targetUID).where('status', '==', 'accepted').limit(1)
            .get().catch(() => null);

        var p2 = couplesCollection
            .where('uid2', '==', targetUID).where('status', '==', 'accepted').limit(1)
            .get().catch(() => null);

        Promise.all([p1, p2]).then(([snap1, snap2]) => {
            var snap = (snap1 && !snap1.empty) ? snap1 : (snap2 && !snap2.empty) ? snap2 : null;
            if (!snap || snap.empty) {
                setProfileCoupleDoc(null);
                setProfilePartnerData(null);
                return;
            }
            var d = { id: snap.docs[0].id, ...snap.docs[0].data() };
            setProfileCoupleDoc(d);
            foundDoc = true;
            // Partner is whichever uid is NOT the target
            var partnerUID = d.uid1 === targetUID ? d.uid2 : d.uid1;
            attachPartnerListener(partnerUID);
        });

        return () => {
            unsubPartner && unsubPartner();
        };
    }, [show, targetUID]);

    // Fetch gifts without orderBy to avoid Firebase index requirement
    useEffect(() => {
        if (!show || !targetUID) return;

        var unsub = giftsLogCollection
            .where('receiverId', '==', targetUID)
            .limit(50)
            .onSnapshot(snap => {
                var giftData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // Sort in memory instead of query
                giftData.sort((a, b) => {
                    var timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds || 0;
                    var timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds || 0;
                    return timeB - timeA;
                });
                setGifts(giftData);
            }, error => {
                console.error("Error fetching gifts:", error);
            });

        return unsub;
    }, [show, targetUID]);

    useEffect(() => {
        var handleClickOutside = (e) => {
            if (optionsRef.current && !optionsRef.current.contains(e.target)) {
                setShowOptionsMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calculate charisma rank - must be before early return
    useEffect(() => {
        if (!show || !targetUID || !targetData) return;
        // Optimized: limit to top 100 only, show rank only if user is in top 100
        usersCollection.orderBy('charisma', 'desc').limit(100).get().then(snap => {
            var users = snap.docs.map((doc, idx) => ({ id: doc.id, rank: idx + 1 }));
            var userRank = users.find(u => u.id === targetUID);
            setCharismaRank(userRank ? userRank.rank : '--');
        }).catch(() => {
            setCharismaRank('--');
        });
    }, [show, targetUID, targetData]);

    // 🛡️ Guard system — load top 100 guardians (ranked by charisma gifted to this user)
    useEffect(() => {
        if (!show || !targetUID) return;
        var unsub = guardCollection
            .where('receiverId', '==', targetUID)
            .onSnapshot(snap => {
                var logs = snap.docs.map(d => d.data());
                // Aggregate charisma by senderId
                var map = {};
                logs.forEach(l => {
                    var sid = l.senderId;
                    if (!sid) return;
                    if (!map[sid]) map[sid] = { uid: sid, name: l.senderName || 'User', photo: l.senderPhoto || null, total: 0 };
                    map[sid].total += l.amount || l.charisma || 0;
                    if (l.senderName)  map[sid].name  = l.senderName;
                    if (l.senderPhoto) map[sid].photo = l.senderPhoto;
                });
                // Sort descending, cap at 100
                var sorted = Object.values(map).sort((a, b) => b.total - a.total).slice(0, 100);
                setGuardData(sorted);
            }, () => {});
        return () => unsub();
    }, [show, targetUID, currentUserUID]);

    // 🛡️ Check daily guard status from localStorage
    useEffect(() => {
        if (!show || !currentUserUID || !targetUID) return;
        var key = `guard_${currentUserUID}_${targetUID}`;
        var stored = localStorage.getItem(key);
        if (stored) {
            var { date } = JSON.parse(stored);
            var today = new Date().toDateString();
            if (date === today) {
                setGuardGiven(true);
                // Calculate unlock time (midnight)
                var now = new Date();
                var midnight = new Date(now);
                midnight.setDate(midnight.getDate() + 1);
                midnight.setHours(0, 0, 0, 0);
                setGuardLockedUntil(midnight);
            } else {
                setGuardGiven(false);
                setGuardLockedUntil(null);
            }
        } else {
            setGuardGiven(false);
            setGuardLockedUntil(null);
        }
    }, [show, currentUserUID, targetUID]);

    // 🛡️ Give Guard handler — friends only, once per day
    var handleGiveGuard = useCallback(async () => {
        if (!currentUserUID || !targetUID || guardGiven || !isLoggedInProp) return;
        // Only friends can give guard
        var isFriend = currentUserFriends?.includes(targetUID);
        if (!isFriend) return;
        var amount = 1;
        try {
            var viewerDoc = await usersCollection.doc(currentUserUID).get();
            if (viewerDoc.exists) {
                var vd = viewerDoc.data();
                var friends = vd.friends || [];
                var max = Math.min(friends.length, 70);
                amount = max > 0 ? Math.floor(Math.random() * max) + 1 : 1;
            }
        } catch (e) {}
        try {
            await guardCollection.add({
                receiverId:   targetUID,
                senderId:     currentUserUID,
                senderName:   userData?.displayName || 'User',
                senderPhoto:  userData?.photoURL || null,
                amount,
                timestamp:    TS(),
            });
            // Save daily lock to localStorage
            var key = `guard_${currentUserUID}_${targetUID}`;
            localStorage.setItem(key, JSON.stringify({ date: new Date().toDateString() }));
            setGuardGiven(true);
            var midnight = new Date();
            midnight.setDate(midnight.getDate() + 1);
            midnight.setHours(0, 0, 0, 0);
            setGuardLockedUntil(midnight);
        } catch (e) {}
    }, [currentUserUID, targetUID, guardGiven, isLoggedInProp, userData, currentUserFriends]);

    if (!show) return null;

    var isOwnProfile = isOwnProfileOverride || targetUID === currentUserUID;
    var isTargetGuest = targetData?.isGuest || targetData?.isAnonymous;
    var isGuestViewer = isGuestProp === true; // current user viewing is a guest
    var isAlreadyFriend = currentUserFriends?.includes(targetUID);
    var hasPendingRequest = currentUserFriendRequests?.includes(targetUID) || requestSent;

    var handleAddFriend = async () => {
        if (isAlreadyFriend || hasPendingRequest) return;
        await onSendFriendRequest(targetUID);
        setRequestSent(true);
    };

    var handleBlockUser = async () => {
        if (!userData || !targetUID) return;
        try {
            await usersCollection.doc(currentUserUID).update({
                blockedUsers: firebase.firestore.FieldValue.arrayUnion(targetUID)
            });
            setIsBlocked(true);
            setShowBlockConfirm(false);
            setShowOptionsMenu(false);
        } catch (error) {
            console.error("Block error:", error);
        }
    };

    var handleUnblockUser = async () => {
        if (!userData || !targetUID) return;
        try {
            await usersCollection.doc(currentUserUID).update({
                blockedUsers: firebase.firestore.FieldValue.arrayRemove(targetUID)
            });
            setIsBlocked(false);
            setShowOptionsMenu(false);
        } catch (error) {
            console.error("Unblock error:", error);
        }
    };

    var handleSendReport = async () => {
        if (!reportReason || !currentUserUID || !targetUID) return;
        setReportSending(true);
        try {
            var reporterSnap = await usersCollection.doc(currentUserUID).get();
            var reporterName = reporterSnap.exists ? (reporterSnap.data()?.displayName || 'User') : 'User';
            var reportRef = await reportsCollection.add({
                reportedUID:    targetUID,
                reportedName:   targetData?.displayName || 'Unknown',
                reportedPhoto:  targetData?.photoURL || '',
                reporterUID:    currentUserUID,
                reporterName,
                reason:         reportReason,
                description:    reportDescription.trim(),
                imageBase64:    reportImagePreview || null,
                timestamp:      TS(),
                status:         'pending',
                type:           'user',
            });
            // Send detective bot message to reporter
            if (typeof botChatsCollection !== 'undefined') {
                await botChatsCollection.add({
                    botId: 'detective_bot',
                    toUserId: currentUserUID,
                    type: 'report_received',
                    message: lang === 'ar'
                        ? `🕵️ تم استلام بلاغك بنجاح ضد "${targetData?.displayName || 'Unknown'}".\nالسبب: ${reportReason}\n\nسيتم مراجعته من قِبل الفريق. انتظر الرد هنا.`
                        : `🕵️ Your report against "${targetData?.displayName || 'Unknown'}" was received successfully.\nReason: ${reportReason}\n\nOur team will review it. Watch for a response here.`,
                    fromName: null,
                    fromPhoto: null,
                    reportId: reportRef.id,
                    timestamp: TS(),
                    read: false,
                }).catch(() => {});
            }
            setShowReportModal(false);
            setReportReason('');
            setReportDescription('');
            setReportImagePreview(null);
            setShowOptionsMenu(false);
        } catch (e) {
            console.error("Report error:", e);
        }
        setReportSending(false);
    };

    var wins = targetData?.stats?.wins || 0;
    var losses = targetData?.stats?.losses || 0;
    var level = Math.floor((targetData?.stats?.xp || 0) / 100) + 1;

    return (
        <div className="modal-overlay" onClick={onClose} style={{zIndex:Z.MODAL}}>
            <div className="profile-glass-card animate-pop" style={{position:'relative'}} onClick={e => e.stopPropagation()}>
                {/* Profile Effect — confined inside card, behind content */}
                {targetData?.equipped?.profileEffects && (
                    <ProfileEffectOverlay key={`fx-${targetUID}`} effectId={targetData.equipped.profileEffects} />
                )}

                <ProfileHeader
                    isOwnProfile={isOwnProfile}
                    isTargetGuest={isTargetGuest}
                    isGuestViewer={isGuestViewer}
                    lang={lang}
                    onClose={onClose}
                    showOptionsMenu={showOptionsMenu}
                    setShowOptionsMenu={setShowOptionsMenu}
                    optionsRef={optionsRef}
                    isBlocked={isBlocked}
                    handleUnblockUser={handleUnblockUser}
                    setShowBlockConfirm={setShowBlockConfirm}
                    setShowReportModal={setShowReportModal}
                    userData={userData}
                    currentUserUID={currentUserUID}
                    targetData={targetData}
                    targetUID={targetUID}
                    setShowBanModal={setShowBanModal}
                    setShowRoleModal={setShowRoleModal}
                    bannerURL={bannerURL}
                    setBannerURL={setBannerURL}
                    bannerFileRef={bannerFileRef}
                    bannerUploading={bannerUploading}
                    setBannerUploading={setBannerUploading}
                    profileCoupleDoc={profileCoupleDoc}
                    profilePartnerData={profilePartnerData}
                    showProfileCoupleCard={showProfileCoupleCard}
                    setShowProfileCoupleCard={setShowProfileCoupleCard}
                    currentViewerData={currentViewerData}
                    onOpenMarriage={onOpenMarriage}
                    onOpenSettings={onOpenSettings}
                    onOpenProfile={onOpenProfile}
                />


                {loading ? (
                    <div className="profile-loading">
                        <div className="profile-loading-spinner"></div>
                        <div className="profile-loading-text">{t.loading || 'Loading...'}</div>
                    </div>
                ) : !targetData ? (
                    <div className="profile-loading">
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                        <div className="profile-loading-text">{t.friendNotFound || 'User not found'}</div>
                    </div>
                ) : (
                    <>
                        {/* 🚫 BAN NOTICE BANNER */}
                        {isBannedUser(targetData) && (
                            <div style={{
                                margin: '0 12px 6px',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, rgba(220,0,0,0.18), rgba(139,0,0,0.12))',
                                border: '1.5px solid rgba(239,68,68,0.5)',
                                display: 'flex', alignItems:'center', gap: '10px',
                                boxShadow: '0 0 20px rgba(220,0,0,0.15)',
                            }}>
                                <span style={{ fontSize: '22px', flexShrink: 0, lineHeight: 1 }}>🚫</span>
                                <div style={{ fontSize: '13px', fontWeight: 900, color: '#f87171', letterSpacing: '0.3px' }}>
                                    {lang === 'ar' ? 'تم حظر هذا الحساب' : 'This Account is Banned'}
                                </div>
                            </div>
                        )}

                        <ProfileIdentity
                            targetData={targetData}
                            targetUID={targetUID}
                            lang={lang}
                            onOpenFamily={onOpenFamily}
                            onOpenProfile={onOpenProfile}
                            setShowRoleInfoPopup={setShowRoleInfoPopup}
                            copiedId={copiedId}
                            setCopiedId={setCopiedId}
                            userData={userData}
                            isOwnProfile={isOwnProfile}
                        />

                        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} />

                        {activeTab === 'about' && (
                            <div className="profile-tab-content animate-fade-in">
                                <ProfileStats wins={wins} losses={losses} charismaRank={charismaRank} level={level} lang={lang} />
                                {!loading && targetData && (
                                    <BFFStripProfile
                                        targetUID={targetUID}
                                        currentUID={currentUserUID}
                                        currentUserData={userData}
                                        lang={lang}
                                        onNotification={onNotification}
                                        friendsData={null}
                                        onOpenBFFModal={onOpenBFFModal}
                                    />
                                )}
                                {!loading && targetData && (
                                    <div
                                        onClick={() => setShowGuardModal(true)}
                                        style={{
                                            display:'flex', alignItems:'center', justifyContent:'space-between',
                                            padding:'8px 12px',
                                            margin:'0',
                                            background:'linear-gradient(135deg,rgba(0,212,255,0.05),rgba(112,0,255,0.05))',
                                            borderTop:'1px solid rgba(0,212,255,0.08)',
                                            borderBottom:'1px solid rgba(0,212,255,0.08)',
                                            cursor:'pointer',
                                            transition:'background 0.15s',
                                        }}
                                        onMouseEnter={e=>{e.currentTarget.style.background='linear-gradient(135deg,rgba(0,212,255,0.09),rgba(112,0,255,0.09))';}}
                                        onMouseLeave={e=>{e.currentTarget.style.background='linear-gradient(135deg,rgba(0,212,255,0.05),rgba(112,0,255,0.05))';}}
                                    >
                                        <div style={{display:'flex', alignItems:'center', gap:'8px', flex:1}}>
                                            <div>
                                                <div style={{fontSize:'12px', fontWeight:800, color:'#e5e7eb', letterSpacing:'-0.2px'}}>Guard</div>
                                                {!isOwnProfile && isLoggedInProp && currentUserFriends?.includes(targetUID) && (
                                                    <div
                                                        onClick={e => { e.stopPropagation(); handleGiveGuard(); }}
                                                        style={{
                                                            display:'inline-flex', alignItems:'center', gap:'3px',
                                                            fontSize:'9px', fontWeight:700, marginTop:'2px',
                                                            padding:'2px 7px', borderRadius:'5px', cursor: guardGiven ? 'default' : 'pointer',
                                                            background: guardGiven ? 'rgba(107,114,128,0.15)' : 'linear-gradient(135deg,rgba(0,212,255,0.2),rgba(112,0,255,0.2))',
                                                            border: guardGiven ? '1px solid rgba(107,114,128,0.2)' : '1px solid rgba(0,212,255,0.35)',
                                                            color: guardGiven ? '#6b7280' : '#00f2ff',
                                                            transition:'all 0.15s',
                                                        }}
                                                    >
                                                        {guardGiven ? (<>🔒 {lang==='ar'?'غداً':'Tomorrow'}</>) : (<>✨ {lang==='ar'?'أعطِ حماية':'Give Guard'}</>)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{display:'flex', alignItems:'center', gap:'4px'}}>
                                            <div style={{display:'flex', alignItems:'center', direction:'ltr'}}>
                                                {[0,1,2].map(i => {
                                                    var g = guardData[i];
                                                    var colors = ['#f5a623','#b0b8c8','#e07b9a'];
                                                    return (
                                                        <div key={i} style={{
                                                            width:'38px', height:'38px', borderRadius:'50%',
                                                            border:`2.5px solid ${colors[i]}`,
                                                            overflow:'hidden', flexShrink:0,
                                                            marginLeft: i > 0 ? '-10px' : '0',
                                                            background: '#1a1a2e',
                                                            zIndex: 10 - i
                                                        }}>
                                                            {g?.photo ? <img src={g.photo} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#4b5563', fontSize:'14px'}}>👤</div>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div style={{fontSize:'16px', color:'#6b7280', marginLeft:'4px'}}>›</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'games' && (
                            <div className="profile-tab-content animate-fade-in">
                                <ProfileStats wins={wins} losses={losses} charismaRank={charismaRank} level={level} lang={lang} />
                                <AchievementsDisplayV11 userData={targetData} lang={lang} showAll={true} />
                            </div>
                        )}

                        {activeTab === 'friends' && (
                            <div className="profile-tab-content animate-fade-in">
                                <ProfileFriendsSection targetData={targetData} friendsData={friendsData} lang={lang} onOpenProfile={onOpenProfile} />
                            </div>
                        )}

                        {activeTab === 'gifts' && (
                            <div className="profile-tab-content animate-fade-in">
                                <GiftWallV11 gifts={gifts} lang={lang} isOwnProfile={isOwnProfile} userData={userData} onOpenProfile={onOpenProfile} onSendGiftToSelf={isGuestProp ? null : (gift) => { setSelfGift(gift); setShowSelfGiftModal(true); }} />
                            </div>
                        )}

                        {activeTab === 'moments' && (
                            <div className="profile-tab-content animate-fade-in">
                                <MomentsSection ownerUID={targetUID} ownerName={targetData?.displayName} ownerPhoto={targetData?.photoURL} currentUser={userData} isOwnProfile={isOwnProfile} lang={lang} onOpenProfile={onOpenProfile} />
                            </div>
                        )}

                        {/* 🛡️ GUARD MODAL */}
                        {showGuardModal && (
                            <PortalModal>
                                <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:Z.MODAL_HIGH,padding:'16px'}}
                                    onClick={() => setShowGuardModal(false)}>
                                    <div style={{
                                        background:'linear-gradient(160deg,#0d0d22,#131330)',
                                        border:'1px solid rgba(255,255,255,0.10)',
                                        borderRadius:'20px',
                                        width:'100%', maxWidth:'360px',
                                        maxHeight:'82vh', overflowY:'auto',
                                        boxShadow:'0 8px 40px rgba(0,0,0,0.6)',
                                    }} onClick={e => e.stopPropagation()}>

                                        {/* ── Header ── */}
                                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 16px 12px',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
                                            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                                                <div style={{width:'38px',height:'38px',borderRadius:'50%',overflow:'hidden',border:'2px solid rgba(255,255,255,0.15)',flexShrink:0}}>
                                                    {targetData?.photoURL
                                                        ? <img src={targetData.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                                                        : <div style={{width:'100%',height:'100%',background:'#1a1a3e',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>👤</div>
                                                    }
                                                </div>
                                                <div>
                                                    <div style={{fontSize:'13px',fontWeight:900,color:'#fff'}}>{targetData?.displayName||''}</div>
                                                    <div style={{fontSize:'11px',color:'rgba(255,255,255,0.45)',fontWeight:600}}>🛡️ Guard Ranking</div>
                                                </div>
                                            </div>
                                            <button onClick={() => setShowGuardModal(false)} style={{background:'rgba(255,255,255,0.08)',border:'none',color:'#9ca3af',fontSize:'16px',cursor:'pointer',padding:'5px 9px',borderRadius:'8px',lineHeight:1}}>✕</button>
                                        </div>

                                        {/* ── Protection Button — للأصدقاء فقط ── */}
                                        {!isOwnProfile && isLoggedInProp && currentUserFriends?.includes(targetUID) && (
                                            <div style={{padding:'12px 14px 6px'}}>
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleGiveGuard(); }}
                                                    disabled={guardGiven}
                                                    style={{
                                                        width:'100%', padding:'11px 16px',
                                                        borderRadius:'12px', border:'none',
                                                        background: guardGiven
                                                            ? 'rgba(107,114,128,0.15)'
                                                            : 'linear-gradient(135deg,rgba(0,212,255,0.22),rgba(112,0,255,0.22))',
                                                        border: guardGiven
                                                            ? '1px solid rgba(107,114,128,0.18)'
                                                            : '1px solid rgba(0,212,255,0.38)',
                                                        color: guardGiven ? '#4b5563' : '#00f2ff',
                                                        fontSize:'13px', fontWeight:800,
                                                        cursor: guardGiven ? 'not-allowed' : 'pointer',
                                                        display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                                                        transition:'all 0.18s',
                                                        boxShadow: guardGiven ? 'none' : '0 0 18px rgba(0,212,255,0.15)',
                                                    }}
                                                    onMouseEnter={e=>{ if(!guardGiven){ e.currentTarget.style.background='linear-gradient(135deg,rgba(0,212,255,0.32),rgba(112,0,255,0.32))'; e.currentTarget.style.boxShadow='0 0 24px rgba(0,212,255,0.28)'; } }}
                                                    onMouseLeave={e=>{ if(!guardGiven){ e.currentTarget.style.background='linear-gradient(135deg,rgba(0,212,255,0.22),rgba(112,0,255,0.22))'; e.currentTarget.style.boxShadow='0 0 18px rgba(0,212,255,0.15)'; } }}
                                                >
                                                    {guardGiven ? (
                                                        <>🔒 {lang==='ar'?'لقد أعطيت حماية اليوم — عُد غداً':'Already protected today — come back tomorrow'}</>
                                                    ) : (
                                                        <>🛡️ {lang==='ar'?'أعطِ حماية يومية':'Give Daily Protection'}</>
                                                    )}
                                                </button>
                                                {!guardGiven && (
                                                    <div style={{fontSize:'9px',color:'rgba(255,255,255,0.28)',textAlign:'center',marginTop:'5px'}}>
                                                        {lang==='ar'
                                                            ? 'كل يوم مرة واحدة — الحماية تعتمد على عدد أصدقائك (1–70)'
                                                            : 'Once per day — protection based on your friends count (1–70)'}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* ── Top 3 shields — always rendered with empty fallback ── */}
                                        {(() => {
                                            var cfgMap = {
                                                1:{ borderColor:'#f5a72a', bg:'rgba(245,167,42,0.10)', nameColor:'#ffd166', scoreColor:'#ffc042', size:78, borderW:3,  crown:'👑' },
                                                2:{ borderColor:'#8da4c8', bg:'rgba(141,164,200,0.10)', nameColor:'#b0c4de', scoreColor:'#90a8cc', size:62, borderW:2.5, crown:'🥈' },
                                                3:{ borderColor:'#e07b9a', bg:'rgba(224,123,154,0.10)', nameColor:'#f0a0bc', scoreColor:'#e07b9a', size:62, borderW:2.5, crown:'🥉' },
                                            };
                                            var fmtV = typeof fmtNum !== 'undefined' ? fmtNum : (n) => n; 
                                            var ShieldCard = ({gd, rank}) => {
                                                var cfg = cfgMap[rank];
                                                var s = cfg.size;
                                                var isEmpty = !gd;
                                                return (
                                                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'5px',flex:rank===1?1.25:1}}>
                                                        <span style={{fontSize:rank===1?'20px':'15px',marginBottom:'-2px'}}>{cfg.crown}</span>
                                                        <div style={{position:'relative',width:`${s+14}px`,height:`${s+16}px`}}>
                                                            <svg width={s+14} height={s+18} viewBox={`0 0 ${s+14} ${s+18}`} style={{position:'absolute',top:0,left:0}}>
                                                                <path d={`M7,5 Q${(s+14)/2},1 ${s+7},5 L${s+7},${s*0.66} Q${(s+14)/2},${s+16} 7,${s*0.66} Z`}
                                                                    fill={cfg.bg} stroke={isEmpty?'rgba(255,255,255,0.15)':cfg.borderColor} strokeWidth={isEmpty?1.5:cfg.borderW} strokeDasharray={isEmpty?'4,3':'none'} opacity={isEmpty?0.6:1}/>
                                                                <path d={`M13,10 Q${(s+14)/2},6 ${s+1},10 L${s+1},${s*0.62} Q${(s+14)/2},${s+9} 13,${s*0.62} Z`}
                                                                    fill="none" stroke={isEmpty?'rgba(255,255,255,0.08)':cfg.borderColor} strokeWidth="1" opacity="0.35"/>
                                                            </svg>
                                                            <div style={{
                                                                position:'absolute', top:'11px', left:'11px',
                                                                width:`${s-8}px`, height:`${s-8}px`,
                                                                borderRadius:'50%', overflow:'hidden',
                                                                border:`2px solid ${isEmpty?'rgba(255,255,255,0.12)':cfg.borderColor}`,
                                                                background: isEmpty?'rgba(255,255,255,0.05)':'transparent',
                                                                display:'flex',alignItems:'center',justifyContent:'center',
                                                            }}>
                                                                {isEmpty
                                                                    ? <svg width="28" height="28" viewBox="0 0 24 24" fill="none" opacity="0.25"><circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth="1.5"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                                                    : gd.photo
                                                                        ? <img src={gd.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                                                                        : <div style={{width:'100%',height:'100%',background:'#1e1e3f',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>👤</div>
                                                                }
                                                            </div>
                                                            {!isEmpty && (
                                                                <div style={{position:'absolute',bottom:'3px',right:'1px',width:'18px',height:'18px',borderRadius:'50%',background:cfg.borderColor,border:`2px solid #131330`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:900,color:'#fff'}}>
                                                                    {rank}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span style={{fontSize:'11px',fontWeight:800,color:isEmpty?'rgba(255,255,255,0.2)':cfg.nameColor,maxWidth:'76px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',textAlign:'center'}}>{isEmpty?(lang==='ar'?'فارغ':'Empty'):gd.name}</span>
                                                        <span style={{fontSize:'12px',fontWeight:900,color:isEmpty?'rgba(255,255,255,0.15)':cfg.scoreColor}}>{isEmpty?'—':fmtV(gd.total)}</span>
                                                        <span style={{fontSize:'8px',color:'rgba(255,255,255,0.3)',fontWeight:600,letterSpacing:'0.3px'}}>Guard</span>
                                                    </div>
                                                );
                                            };
                                            return (
                                                <div style={{display:'flex',alignItems:'flex-end',justifyContent:'center',gap:'6px',padding:'18px 12px 16px',background:'rgba(255,255,255,0.02)',margin:'14px 14px 6px',borderRadius:'16px',border:'1px solid rgba(255,255,255,0.06)'}}>
                                                    <ShieldCard gd={guardData[1]||null} rank={2}/>
                                                    <div style={{marginBottom:'14px'}}><ShieldCard gd={guardData[0]||null} rank={1}/></div>
                                                    <ShieldCard gd={guardData[2]||null} rank={3}/>
                                                </div>
                                            );
                                        })()}

                                        {/* ── Ranks 4+ ── */}
                                        {guardData.length > 3 && (
                                            <div style={{margin:'6px 14px 14px',borderRadius:'14px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.07)'}}>
                                                {guardData.slice(3).map((g, i) => (
                                                    <div key={g.uid} style={{
                                                        display:'flex', alignItems:'center', gap:'11px',
                                                        padding:'10px 14px',
                                                        background: i%2===0?'rgba(255,255,255,0.025)':'rgba(255,255,255,0.015)',
                                                        borderBottom: i < guardData.length-4 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                                    }}>
                                                        <span style={{fontSize:'12px',fontWeight:800,color:'rgba(255,255,255,0.3)',minWidth:'22px',textAlign:'center'}}>{i+4}</span>
                                                        <div style={{width:'36px',height:'36px',borderRadius:'50%',overflow:'hidden',border:'1.5px solid rgba(255,255,255,0.12)',flexShrink:0}}>
                                                            {g.photo
                                                                ? <img src={g.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                                                                : <div style={{width:'100%',height:'100%',background:'#1e1e3f',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}>👤</div>
                                                            }
                                                        </div>
                                                        <span style={{flex:1,fontSize:'13px',fontWeight:700,color:'#e5e7eb',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{g.name}</span>
                                                        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end'}}>
                                                            <span style={{fontSize:'13px',color:'#f472b6',fontWeight:800}}>{fmtNum(g.total)}</span>
                                                            <span style={{fontSize:'8px',color:'rgba(255,255,255,0.3)',fontWeight:600}}>Guard</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div style={{height:'10px'}}/>
                                    </div>
                                </div>
                            </PortalModal>
                        )}

                        <AchievementsDisplayV11 userData={targetData} lang={lang} />

                        {isBlocked && !isOwnProfile && (
                            <div className="profile-blocked-notice">
                                <span>🚫</span>
                                <span>{lang === 'ar' ? 'لقد حظرت هذا المستخدم' : 'You have blocked this user'}</span>
                            </div>
                        )}

                        {blockedByTarget && !isOwnProfile && (
                            <div className="profile-blocked-notice blocked-by-other">
                                <span>🚫</span>
                                <span>{lang === 'ar' ? 'هذا المستخدم قد حظرك' : 'This user has blocked you'}</span>
                            </div>
                        )}

                        {/* ── GUEST LOGIN BANNER — shown to guest viewing their own profile ── */}
                        {isOwnProfile && isGuestProp && onLoginGoogle && (
                            <div style={{margin:'8px 12px',padding:'14px 16px',borderRadius:'16px',background:'linear-gradient(135deg,rgba(66,133,244,0.13),rgba(26,115,232,0.08))',border:'1px solid rgba(66,133,244,0.3)',display:'flex',alignItems:'center',gap:'12px'}}>
                                <span style={{fontSize:'28px',flexShrink:0}}>🔑</span>
                                <div style={{flex:1,minWidth:0}}>
                                    <div style={{fontSize:'13px',fontWeight:800,color:'#e5e7eb',marginBottom:'2px'}}>{lang==='ar'?'سجّل دخولك بجوجل':'Sign in with Google'}</div>
                                    <div style={{fontSize:'11px',color:'#6b7280'}}>{lang==='ar'?'احفظ تقدمك واستمتع بكل الميزات':'Save progress & unlock all features'}</div>
                                </div>
                                <button
                                    onClick={onLoginGoogle}
                                    style={{flexShrink:0,padding:'8px 14px',borderRadius:'10px',background:'linear-gradient(135deg,#4285f4,#1a73e8)',border:'none',color:'#fff',fontWeight:800,fontSize:'12px',cursor:'pointer',whiteSpace:'nowrap',boxShadow:'0 2px 10px rgba(66,133,244,0.4)'}}>
                                    {lang==='ar'?'دخول':'Login'}
                                </button>
                            </div>
                        )}

                        {/* ── GUEST BADGE - visible to ALL viewers ── */}
                        {isTargetGuest && (
                            <div style={{
                                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                                padding:'10px 16px', margin:'6px 0',
                                background:'linear-gradient(135deg,rgba(251,191,36,0.12),rgba(245,158,11,0.08))',
                                border:'1px solid rgba(251,191,36,0.4)',
                                borderRadius:'12px',
                                boxShadow:'0 0 16px rgba(251,191,36,0.12)'
                            }}>
                                <span style={{fontSize:'16px'}}>👤</span>
                                <div>
                                    <div style={{fontSize:'12px', fontWeight:900, color:'#fbbf24', letterSpacing:'0.5px'}}>
                                        {lang==='ar' ? 'حساب ضيف' : 'GUEST ACCOUNT'}
                                    </div>
                                    <div style={{fontSize:'9px', color:'#92400e', fontWeight:600}}>
                                        {lang==='ar' ? 'لا يمكن إضافته كصديق أو إرسال هدايا' : 'Limited features — no friends or gifts'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isOwnProfile && !isTargetGuest && !isBlocked && !blockedByTarget && !isGuestViewer && (
                            <div className="profile-actions">
                                {isAlreadyFriend ? (
                                    /* Already friends → show Chat button */
                                    <button
                                        onClick={() => {
                                            if (onOpenChat) {
                                                onOpenChat({ uid: targetUID, displayName: targetData?.displayName, photoURL: targetData?.photoURL, equipped: targetData?.equipped, id: targetUID });
                                            }
                                        }}
                                        className="profile-action-btn primary"
                                        style={{background:'linear-gradient(135deg,rgba(0,242,255,0.25),rgba(112,0,255,0.2))', borderColor:'rgba(0,242,255,0.4)'}}
                                    >
                                        <span>💬</span>
                                        <span>{lang === 'ar' ? 'محادثة' : 'Chat'}</span>
                                    </button>
                                ) : hasPendingRequest ? (
                                    <button disabled className="profile-action-btn secondary">
                                        <span>⏳</span>
                                        <span>{lang === 'ar' ? 'تم الإرسال' : 'Sent'}</span>
                                    </button>
                                ) : (
                                    <button onClick={handleAddFriend} className="profile-action-btn primary">
                                        <span>👤</span>
                                        <span>{lang === 'ar' ? 'أضف صديق' : 'Add Friend'}</span>
                                    </button>
                                )}
                                <button onClick={() => setShowGiftModal(true)} className="profile-action-btn secondary">
                                    <span>🎁</span>
                                    <span>{lang === 'ar' ? 'أرسل هدية' : 'Send Gift'}</span>
                                </button>
                            </div>
                        )}

                        {/* Own profile action buttons */}
                        {isOwnProfile && (
                            <div style={{padding:'0 12px 12px', display:'flex', gap:'8px'}}>
                                {/* Personal Notes Chat */}
                                <button
                                    onClick={() => onOpenChat && onOpenChat('self')}
                                    style={{
                                        flex:1, padding:'11px', borderRadius:'12px',
                                        background:'linear-gradient(135deg,rgba(0,242,255,0.12),rgba(112,0,255,0.1))',
                                        border:'1px solid rgba(0,242,255,0.3)', color:'#00f2ff',
                                        fontSize:'12px', fontWeight:800, cursor:'pointer',
                                        display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                                        transition:'all 0.2s'
                                    }}
                                >
                                    <span style={{fontSize:'16px'}}>💬</span>
                                    <span>{lang === 'ar' ? 'شاتي' : 'My Chat'}</span>
                                </button>
                                {/* Self Gift */}
                                <button
                                    onClick={() => setShowSelfGiftModal(true)}
                                    style={{
                                        flex:1, padding:'11px', borderRadius:'12px',
                                        background:GR.GOLD,
                                        border:'1px solid rgba(255,215,0,0.4)', color:'#facc15',
                                        fontSize:'12px', fontWeight:800, cursor:'pointer',
                                        display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                                        transition:'all 0.2s'
                                    }}
                                >
                                    <span style={{fontSize:'16px'}}>🎁</span>
                                    <span>{lang === 'ar' ? 'هدية لنفسي' : 'Gift Myself'}</span>
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Report Modal */}
                {showReportModal && (
                    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:Z.MODAL,padding:'16px'}} onClick={() => { setShowReportModal(false); setReportReason(''); setReportDescription(''); setReportImagePreview(null); }}>
                        <div className="profile-confirm-modal" onClick={e => e.stopPropagation()} style={{maxWidth:'320px', width:'100%', maxHeight:'85vh', overflowY:'auto'}}>
                            <div className="profile-confirm-icon">🚨</div>
                            <div className="profile-confirm-title">{lang === 'ar' ? 'إبلاغ عن مستخدم' : 'Report User'}</div>

                            {/* Reported user info */}
                            <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px', padding:'8px 10px', marginBottom:'12px' }}>
                                <img src={targetData?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetData?.displayName||'U')}&background=7000ff&color=fff&size=50`}
                                    style={{ width:'32px', height:'32px', borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />
                                <div>
                                    <div style={{ fontSize:'12px', fontWeight:700, color:'white' }}>{targetData?.displayName}</div>
                                    <div style={{ fontSize:'10px', color:'#6b7280', fontFamily:'monospace' }}>{targetUID?.slice(0,16)}...</div>
                                </div>
                            </div>

                            {/* Reason selection */}
                            <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'8px', textAlign:'start'}}>
                                {lang === 'ar' ? 'سبب البلاغ:' : 'Reason:'}
                            </div>
                            <div style={{display:'flex', flexDirection:'column', gap:'5px', marginBottom:'12px'}}>
                                {[
                                    {key:'abusive',       icon:'🤬', ar:'سلوك مسيء',       en:'Abusive Behavior'},
                                    {key:'verbal_abuse',  icon:'💬', ar:'شتيمة لفظية',      en:'Verbal Abuse'},
                                    {key:'cheating',      icon:'🎮', ar:'غش في اللعبة',     en:'Cheating'},
                                    {key:'fraud',         icon:'💰', ar:'احتيال',            en:'Fraud'},
                                    {key:'avatar',        icon:'🖼️', ar:'صورة أفاتار مسيئة', en:'Inappropriate Avatar'},
                                    {key:'spam',          icon:'📢', ar:'سبام',              en:'Spam'},
                                    {key:'other',         icon:'❓', ar:'سبب آخر',           en:'Other'}
                                ].map(r => (
                                    <button key={r.key} onClick={() => setReportReason(r.key)} style={{
                                        padding:'7px 10px', borderRadius:'7px', fontSize:'12px',
                                        textAlign:'start', cursor:'pointer', fontWeight:600,
                                        display:'flex', alignItems:'center', gap:'8px',
                                        background: reportReason === r.key ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                                        border: reportReason === r.key ? '1.5px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.1)',
                                        color: reportReason === r.key ? 'white' : '#9ca3af'
                                    }}>
                                        <span>{r.icon}</span>
                                        <span>{lang === 'ar' ? r.ar : r.en}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Description */}
                            <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'6px'}}>
                                {lang === 'ar' ? 'وصف المشكلة (اختياري):' : 'Describe the issue (optional):'}
                            </div>
                            <textarea
                                value={reportDescription}
                                onChange={e => setReportDescription(e.target.value)}
                                maxLength={300}
                                placeholder={lang === 'ar' ? 'اشرح ما حدث بالتفصيل...' : 'Explain what happened in detail...'}
                                style={{
                                    width:'100%', padding:'8px', borderRadius:'7px', fontSize:'11px', resize:'vertical', minHeight:'55px',
                                    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                                    color:'white', outline:'none', marginBottom:'10px', boxSizing:'border-box'
                                }} />

                            {/* Image upload */}
                            <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'6px'}}>
                                {lang === 'ar' ? 'إرفاق صورة (اختياري):' : 'Attach image (optional):'}
                            </div>
                            {reportImagePreview ? (
                                <div style={{ position:'relative', marginBottom:'10px' }}>
                                    <img src={reportImagePreview} style={{ width:'100%', maxHeight:'120px', objectFit:'cover', borderRadius:'7px', border:'1px solid rgba(255,255,255,0.1)' }} />
                                    <button onClick={() => setReportImagePreview(null)}
                                        style={{ position:'absolute', top:'4px', right:'4px', background:'rgba(0,0,0,0.7)', border:'none', color:'white', borderRadius:'50%', width:'20px', height:'20px', cursor:'pointer', fontSize:'11px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <label style={{
                                    display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                                    padding:'8px', borderRadius:'7px', marginBottom:'10px', cursor:'pointer',
                                    background:'rgba(255,255,255,0.04)', border:'1px dashed rgba(255,255,255,0.2)', color:'#9ca3af', fontSize:'11px'
                                }}>
                                    📎 {lang === 'ar' ? 'اضغط لإرفاق صورة' : 'Click to attach image'}
                                    <input type="file" accept="image/*" style={{display:'none'}} onChange={e => {
                                        var file = e.target.files?.[0];
                                        if (!file) return;
                                        var reader = new FileReader();
                                        reader.onload = ev => {
                                            // Resize via canvas to max 600px
                                            var img = new Image();
                                            img.onload = () => {
                                                var canvas = document.createElement('canvas');
                                                var max = 600;
                                                var ratio = Math.min(max/img.width, max/img.height, 1);
                                                canvas.width = img.width * ratio;
                                                canvas.height = img.height * ratio;
                                                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                                                setReportImagePreview(canvas.toDataURL('image/jpeg', 0.7));
                                            };
                                            img.src = ev.target.result;
                                        };
                                        reader.readAsDataURL(file);
                                        e.target.value = '';
                                    }} />
                                </label>
                            )}

                            <div className="profile-confirm-actions">
                                <button onClick={() => { setShowReportModal(false); setReportReason(''); setReportDescription(''); setReportImagePreview(null); }} className="cancel">
                                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button onClick={handleSendReport} disabled={!reportReason || reportSending} className="confirm"
                                    style={{opacity: (!reportReason || reportSending) ? 0.5 : 1, background:'#ef4444'}}>
                                    {reportSending ? '...' : (lang === 'ar' ? 'إرسال البلاغ' : 'Submit Report')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showBlockConfirm && (
                    <div className="profile-confirm-overlay" onClick={() => setShowBlockConfirm(false)}>
                        <div className="profile-confirm-modal" onClick={e => e.stopPropagation()}>
                            <div className="profile-confirm-icon">🚫</div>
                            <div className="profile-confirm-title">
                                {lang === 'ar' ? 'حظر المستخدم' : 'Block User'}
                            </div>
                            <div className="profile-confirm-message">
                                {lang === 'ar'
                                    ? `هل أنت متأكد من حظر ${targetData?.displayName || 'هذا المستخدم'}؟`
                                    : `Are you sure you want to block ${targetData?.displayName || 'this user'}?`}
                            </div>
                            <div className="profile-confirm-actions">
                                <button onClick={() => setShowBlockConfirm(false)} className="cancel">
                                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button onClick={handleBlockUser} className="confirm">
                                    {lang === 'ar' ? 'حظر' : 'Block'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🔒 ADMIN BAN MODAL */}
                {showBanModal && isAdmin(currentUserUID) && (
                    <AdminBanModal
                        targetData={targetData}
                        lang={lang}
                        onClose={() => setShowBanModal(false)}
                        onBanApplied={(newBan) => {
                            setTargetData(prev => ({ ...prev, ban: newBan }));
                        }}
                    />
                )}

                {/* 👑 ADMIN ROLE MODAL */}
                {showRoleModal && canManageRoles(userData, currentUserUID) && (
                    <AdminRoleModal
                        targetData={targetData}
                        viewerData={userData}
                        viewerUID={currentUserUID}
                        lang={lang}
                        onClose={() => setShowRoleModal(false)}
                        onRoleApplied={(newRole) => {
                            setTargetData(prev => ({ ...prev, staffRole: newRole }));
                        }}
                    />
                )}

                {/* 👑 ROLE INFO POPUP */}
                {showRoleInfoPopup && (
                    <RoleInfoPopup
                        targetData={targetData}
                        lang={lang}
                        onClose={() => setShowRoleInfoPopup(false)}
                    />
                )}
            </div>

            {showGiftModal && targetData && (
                <SendGiftModal
                    show={showGiftModal}
                    onClose={() => setShowGiftModal(false)}
                    targetUser={targetData}
                    currentUser={userData}
                    lang={lang}
                    onSendGift={onSendGift}
                    currency={userData?.currency || 0}
                    friendsData={friendsData}
                />
            )}

            {showSelfGiftModal && userData && (
                <SendGiftModal
                    show={showSelfGiftModal}
                    onClose={() => setShowSelfGiftModal(false)}
                    targetUser={{ uid: userData?.uid, displayName: userData?.displayName || (lang==='ar'?'أنت':'You'), photoURL: userData?.photoURL }}
                    currentUser={userData}
                    lang={lang}
                    onSendGift={async (gift, targetUser) => {
                        if (onSendGift) await onSendGift(gift, targetUser);
                        setShowSelfGiftModal(false);
                    }}
                    currency={userData?.currency || 0}
                    friendsData={[]}
                />
            )}
        </div>
    );
};

    window.ProfileV11 = ProfileV11;
})();

})();
