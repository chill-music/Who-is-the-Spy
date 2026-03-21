const { 
    GACHA_CONFIG_BASIC, 
    GACHA_CONFIG_PREMIUM, 
} = window.FamilyConstants;
const { Z, PortalModal } = window;
const { fmtFamilyNum } = window;
var FamilyService = window.FamilyService;

/**
 * FamilyGacha - Modal component for family gacha spins.
 */
var FamilyGacha = ({ 
    show, 
    onClose, 
    family, 
    currentUID, 
    currentUserData, 
    lang, 
    onNotification 
}) => {
    const [spinning, setSpinning] = React.useState(false);
    const [result, setResult] = React.useState(null);
    const [spinMode, setSpinMode] = React.useState('free'); // 'free' or 'paid'

    if (!show) return null;

    const currentGachaConfig = (family?.level >= 5) ? GACHA_CONFIG_BASIC : GACHA_CONFIG_PREMIUM;

    const handleSpin = async (mode) => {
        if (spinning) return;
        setSpinMode(mode);
        setSpinning(true);
        setResult(null);

        try {
            // Simulate spin delay
            await new Promise(r => setTimeout(r, 2000));
            
            const res = await window.FamilyService.handleGachaRoll({ 
                family, 
                currentUID, 
                currentUserData, 
                mode, 
                lang, 
                onNotification 
            });

            if (res) {
                setResult(res);
            } else {
                setSpinning(false);
            }
        } catch (e) {
            console.error(e);
            onNotification(lang === 'ar' ? '❌ فشل السحب' : '❌ Spin failed');
            setSpinning(false);
        }
    };

    return (
        <PortalModal>
            <div className="modal-overlay" onClick={onClose} style={{ zIndex: Z.MODAL_HIGH + 10 }}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                    background: 'linear-gradient(180deg, #1a1040, #0a0a2e)',
                    borderRadius: '24px',
                    width: '90%',
                    maxWidth: '400px',
                    padding: '24px',
                    textAlign: 'center',
                    border: '1px solid rgba(167, 139, 250, 0.3)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
                }}>
                    <h2 style={{ color: '#a78bfa', marginBottom: '8px' }}>🎰 {lang === 'ar' ? 'جاتشه القبيلة' : 'Family Gacha'}</h2>
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px' }}>
                        {lang === 'ar' ? 'جرب حظك واربح جوائز نادرة!' : 'Try your luck and win rare rewards!'}
                    </p>

                    {/* Machine View */}
                    <div style={{
                        height: '160px',
                        background: 'rgba(0,0,0,0.4)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '2px solid rgba(167, 139, 250, 0.2)'
                    }}>
                        {spinning ? (
                            <div className="spinning-slots" style={{ fontSize: '60px' }}>✨</div>
                        ) : result ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '50px', marginBottom: '8px' }}>{result.icon || '🎁'}</div>
                                <div style={{ fontSize: '14px', fontWeight: 800, color: '#00f2ff' }}>
                                    {lang === 'ar' ? result.name_ar : result.name_en}
                                </div>
                            </div>
                        ) : (
                            <div style={{ fontSize: '60px', opacity: 0.3 }}>🎰</div>
                        )}
                        
                        {/* Decoration */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, transparent, #a78bfa, transparent)' }}></div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button 
                            onClick={() => handleSpin('free')} 
                            disabled={spinning}
                            style={{
                                padding: '14px',
                                borderRadius: '16px',
                                border: 'none',
                                background: 'rgba(255,255,255,0.06)',
                                color: '#e2e8f0',
                                fontWeight: 800,
                                cursor: 'pointer',
                                opacity: spinning ? 0.5 : 1
                            }}
                        >
                            🆓 {lang === 'ar' ? 'سحبة مجانية يومية' : 'Daily Free Spin'}
                        </button>
                        
                        <button 
                            onClick={() => handleSpin('paid')} 
                            disabled={spinning}
                            style={{
                                padding: '14px',
                                borderRadius: '16px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #a78bfa, #7000ff)',
                                color: 'white',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(112, 0, 255, 0.4)',
                                opacity: spinning ? 0.5 : 1
                            }}
                        >
                            💎 {lang === 'ar' ? `سحبة بـ ${currentGachaConfig.paidCostPerSpin} إنتل` : `Spin for ${currentGachaConfig.paidCostPerSpin} Intel`}
                        </button>
                    </div>

                    <button 
                        onClick={onClose} 
                        style={{ marginTop: '20px', background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', cursor: 'pointer' }}
                    >
                        {lang === 'ar' ? 'إغلاق' : 'Close'}
                    </button>
                </div>
            </div>

            <style>{`
                .spinning-slots {
                    animation: gacha-spin 0.2s infinite;
                }
                @keyframes gacha-spin {
                    0% { transform: translateY(-5px) scale(1.1); filter: hue-rotate(0deg); }
                    50% { transform: translateY(5px) scale(0.9); filter: hue-rotate(180deg); }
                    100% { transform: translateY(-5px) scale(1.1); filter: hue-rotate(360deg); }
                }
            `}</style>
        </PortalModal>
    );
};

// No export default. Access via window.FamilyGacha.
window.FamilyGacha = FamilyGacha;
