/**
 * FamilyShared.js - Shared UI components for the Family System.
 */
var { FAMILY_ROLE_CONFIG, FAMILY_SIGN_LEVELS } = window.FamilyConstants || {};

var FamilyRoleBadge = ({ role, lang, small = false }) => {
    var cfg = FAMILY_ROLE_CONFIG[role] || FAMILY_ROLE_CONFIG.member;
    return (
        <span style={{
            display:'inline-flex', alignItems:'center', gap:'2px',
            padding: small ? '1px 5px' : '2px 7px',
            borderRadius:'5px', fontSize: small ? '9px' : '10px',
            fontWeight:800, fontStyle:'italic',
            background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color,
            letterSpacing:'0.3px', whiteSpace:'nowrap', flexShrink:0,
        }}>
            {cfg.icon} {lang === 'ar' ? cfg.label_ar : cfg.label_en}
        </span>
    );
};

var FamilySignBadge = ({ tag, color = '#7000ff', small = false, imageURL = null, signLevel = 1 }) => {
    var displayTag = tag || 'FAM';
    var signLevelData = FAMILY_SIGN_LEVELS.find(s => s.level === signLevel);
    var hasGlow = signLevelData?.hasGlow || signLevel >= 4;
    
    if (imageURL) {
        var imgW = small
            ? 28 + (displayTag.length * 4)
            : 44 + (displayTag.length * 6);
        var imgH = Math.round(imgW * 0.55);
        var fontSize = small
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
            }}>
                <img src={imageURL} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain' }} />
                <span style={{ position:'relative', zIndex:1, fontSize:`${fontSize}px`, fontWeight:900, color:'white', textShadow:'0 1px 3px rgba(0,0,0,0.8)', letterSpacing: small ? '0px' : '0.5px', marginBottom:'2px' }}>
                    {displayTag}
                </span>
            </span>
        );
    }

    // Fallback if no imageURL
    return (
        <span style={{
            padding:'2px 6px', borderRadius:'4px', background:color, color:'white', fontSize: small?'9px':'10px', fontWeight:900
        }}>
            {displayTag}
        </span>
    );
};

// Common styles for Family components
var S = {
    card: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: '14px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
    },
    sectionTitle: {
        fontSize: '12px',
        fontWeight: 800,
        color: '#9ca3af',
        marginBottom: '10px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    input: {
        width: '100%',
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        padding: '10px 12px',
        color: 'white',
        fontSize: '13px',
        outline: 'none',
        transition: 'border 0.2s'
    },
    btn: {
        padding: '10px 16px',
        borderRadius: '10px',
        border: 'none',
        fontWeight: 800,
        fontSize: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        transition: 'all 0.2s'
    },
    btnPrimary: {
        padding: '12px 20px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #00f2ff, #00d4ff)',
        color: '#0d0d1f',
        fontWeight: 900,
        fontSize: '14px',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,242,255,0.3)',
        transition: 'all 0.2s'
    },
    btnSecondary: {
        padding: '12px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)',
        color: 'white',
        fontWeight: 800,
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    label: {
        fontSize: '11px',
        fontWeight: 700,
        color: '#6b7280',
        marginBottom: '6px',
        display: 'block'
    }
};

// Global access for legacy scripts
window.FamilyShared = {
    FamilyRoleBadge,
    FamilySignBadge,
    S
};
