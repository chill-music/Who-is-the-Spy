const { FAMILY_SIGN_LEVELS, getFamilySignImage } = window.FamilyConstants || {};

// Enhanced FamilySignBadge — image with tag overlaid, matches ProfileFamilySignBadge
var FamilySignBadge = ({ level, size = 40, lang }) => {
    const imgSrc = imageURL || (typeof getFamilySignImage === 'function' ? getFamilySignImage(signLevel) : null);
    // استخدم hasGlow من بيانات المستوى نفسه
    const signLevelData = typeof FAMILY_SIGN_LEVELS !== 'undefined'
        ? FAMILY_SIGN_LEVELS.find(s => s.level === signLevel)
        : null;
    const hasGlow = signLevelData?.hasGlow || signLevel >= 4;
    const glowColor = signLevelData?.glow || `${color}88`;
    const displayTag = tag || 'FAM';

    // لو في صورة: تظهر مع التاج مكتوب فوقها
    if (imgSrc) {
        const imgW = small
            ? 28 + (displayTag.length * 4)   // small: 3→40  4→44  5→48
            : 44 + (displayTag.length * 6);   // normal: 3→62 4→68  5→74
        const imgH = Math.round(imgW * 0.55);
        const fontSize = small
            ? (displayTag.length <= 3 ? 8 : displayTag.length === 4 ? 7 : 6)
            : (displayTag.length <= 3 ? 11 : displayTag.length === 4 ? 10 : 9);

        return (
            <span style={{
                position:'relative',
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                flexShrink:0,
                width:`${imgW}px`, height:`${imgH}px`,
                filter: hasGlow
                    ? `drop-shadow(0 0 6px ${color}dd) drop-shadow(0 0 14px ${color}88) drop-shadow(0 0 22px ${color}44)`
                    : 'none',
                transition:'all 0.2s',
            }}>
                {/* الصورة الخلفية */}
                <img
                    src={imgSrc}
                    alt=""
                    style={{
                        position:'absolute', inset:0,
                        width:'100%', height:'100%',
                        objectFit:'contain',
                        display:'block',
                    }}
                />
                {/* التاج فوق الصورة */}
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
                        0 0 16px ${color}cc
                    `,
                    userSelect:'none',
                    lineHeight:1,
                }}>
                    {displayTag}
                </span>
            </span>
        );
    }

    // لو ما في صورة: badge نصي عادي
    return (
        <span style={{
            display:'inline-flex', alignItems:'center', gap:'3px',
            padding: small ? '1px 5px' : '2px 8px',
            borderRadius:'5px', fontSize: small ? '8px' : '10px',
            fontWeight:800, fontStyle:'italic',
            background:`${color}20`, border:`1px solid ${color}55`,
            color:color, letterSpacing:'0.5px', whiteSpace:'nowrap', flexShrink:0,
            boxShadow: hasGlow ? `0 0 10px ${color}55, 0 0 20px ${color}33` : 'none',
        }}>
            {displayTag}
        </span>
    );
};


window.FamilySignBadge = FamilySignBadge;
