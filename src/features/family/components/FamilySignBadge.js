var { FAMILY_SIGN_LEVELS, getFamilySignImage } = window.FamilyConstants || {};

// Enhanced FamilySignBadge — image with tag overlaid, matches ProfileFamilySignBadge
var FamilySignBadge = ({ level, size = 40, lang, tag, color, small, signLevel, imageURL }) => {
    // Correct call to getFamilySignImage(activeness=0, level=signLevel)
    var imgSrc = imageURL || (typeof getFamilySignImage === 'function' ? getFamilySignImage(0, signLevel) : null);
    
    var signLevelData = typeof FAMILY_SIGN_LEVELS !== 'undefined'
        ? FAMILY_SIGN_LEVELS.find(s => s.level === signLevel)
        : null;
    var hasGlow = signLevelData?.hasGlow || signLevel >= 4;
    var glowIntensity = signLevel === 5 ? 'dd' : signLevel === 4 ? 'cc' : '99';
    var glowMid       = signLevel === 5 ? '88' : signLevel === 4 ? '77' : '55';
    var glowFar       = signLevel === 5 ? '44' : '33';
    var displayTag = tag || 'FAM';

    // لو في صورة: تظهر مع التاج مكتوب فوقها
    if (imgSrc) {
        // Badge is purely the image size; tag text floats centered over the image
        var imgW = small
            ? 36 + (displayTag.length * 3)   // small: 3→45  4→48  5→51
            : 54 + (displayTag.length * 5);   // normal: 3→69 4→74  5→79
        var imgH = Math.round(imgW * 0.55);
        var fontSize = small
            ? (displayTag.length <= 3 ? 8 : displayTag.length === 4 ? 7 : 6)
            : (displayTag.length <= 3 ? 11 : displayTag.length === 4 ? 10 : 9);

        return (
            <span style={{
                position:'relative',
                display:'inline-block',
                flexShrink:0,
                width:`${imgW}px`,
                height:`${imgH}px`,
                filter: hasGlow
                    ? `drop-shadow(0 0 6px ${color}${glowIntensity}) drop-shadow(0 0 14px ${color}${glowMid}) drop-shadow(0 0 22px ${color}${glowFar})`
                    : 'none',
                transition:'all 0.2s',
            }}>
                {/* Background image fills the container */}
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
                {/* Tag text: absolutely centered, small pill */}
                <span style={{
                    position:'absolute',
                    left:'50%', top:'50%',
                    transform:'translate(-50%, -50%)',
                    zIndex:1,
                    fontSize:`${fontSize}px`,
                    fontWeight:900,
                    fontStyle:'italic',
                    letterSpacing:'1.5px',
                    color:'#fff',
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
                    whiteSpace:'nowrap',
                    pointerEvents:'none',
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
