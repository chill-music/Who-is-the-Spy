/**
 * ProfileFamilySignBadge.js
 * Shows clan sign on profile.
 */
var ProfileFamilySignBadge = ({ userData, lang, onClick }) => {
    const familyTag   = userData?.familyTag;
    const familyName  = userData?.familyName;
    const signLevel   = userData?.familySignLevel || (userData?.familyId ? 1 : null);
    const signData    = (window.FamilyConstants && signLevel) ? window.FamilyConstants.getFamilySignLevelDataByLevel(signLevel) : null;
    const signColor   = signData?.color || userData?.familySignColor || '#6b7280';
    const signImgURL  = (window.FamilyConstants && signLevel) ? window.FamilyConstants.getFamilySignImage(0, signLevel) : (window.getFamilySignURL ? window.getFamilySignURL(userData) : null);

    // Only show if user has a family AND has earned a sign (level > 0)
    if (!familyTag || !signLevel) return null;

    const hasGlow = signLevel >= 4;
    // الـ glow يستخدم لون الساين نفسه — مستوى 5 أحمر، مستوى 4 برتقالي
    const glowIntensity = signLevel === 5 ? 'dd' : signLevel === 4 ? 'cc' : '99';
    const glowMid       = signLevel === 5 ? '88' : signLevel === 4 ? '77' : '55';
    const glowFar       = signLevel === 5 ? '44' : '33';

    // لو في صورة: تظهر كبيرة مع التاج مكتوب فوقها باحتراف
    if (signImgURL) {
        // عرض الصورة يتناسب مع عدد الأحرف — 3→52px  4→62px  5→72px
        const imgW = 44 + (familyTag.length * 6);
        const imgH = Math.round(imgW * 0.55); // نسبة عرض/ارتفاع ثابتة
        // حجم الخط يتناسب مع حجم الصورة
        const fontSize = familyTag.length <= 3 ? 11 : familyTag.length === 4 ? 10 : 9;

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
