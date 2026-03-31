// Lazy access — avoids crash if PortalModal / Z not yet on window at parse time
var getZ = () => window.Z || {};
var getPortalModal = () => window.PortalModal || (({ children }) => children);
var fmtFamilyNum = (...args) => (window.fmtFamilyNum || ((n) => String(n)))(...args);

/**
 * FamilyGacha - Modal component for family gacha spins.
 */
var FamilyGacha = ({ family, currentUID, currentUserData, lang, onNotification, show, onClose }) => {
  var [spinning, setSpinning] = React.useState(false);
  var [result, setResult] = React.useState(null);
  var [spinMode, setSpinMode] = React.useState('free'); // 'free' or 'paid'

  if (!show) return null;

  var cBasic = window.FamilyConstants?.GACHA_CONFIG_BASIC || window.GACHA_CONFIG_BASIC || window.GACHA_CONFIG || {};
  var cPrem = window.FamilyConstants?.GACHA_CONFIG_PREMIUM || window.GACHA_CONFIG_PREMIUM || window.GACHA_CONFIG || {};
  var currentGachaConfig = family?.level >= 5 ? cPrem : cBasic;
  var rewards = currentGachaConfig.rewards || [];

  var handleSpin = async (mode) => {
    if (spinning) return;
    setSpinMode(mode);
    setSpinning(true);
    setResult(null);

    try {
      await new Promise((r) => setTimeout(r, 2000));

      var res = await window.FamilyService.handleGachaRoll({
        family,
        currentUID,
        currentUserData,
        mode,
        lang,
        onNotification
      });

      if (res) setResult(res);
    } catch (e) {
      console.error(e);
      onNotification(lang === 'ar' ? '❌ فشل السحب' : '❌ Spin failed');
    } finally {
      setSpinning(false);
    }
  };

  var PortalModal = getPortalModal();
  var Z = getZ();
  return (/*#__PURE__*/
    React.createElement(PortalModal, null, /*#__PURE__*/
    React.createElement("div", { className: "modal-overlay", onClick: onClose, style: { zIndex: Z.MODAL_HIGH + 10 } }, /*#__PURE__*/
    React.createElement("div", { className: "modal-content", onClick: (e) => e.stopPropagation(), style: {
        background: 'linear-gradient(180deg, #1a1040, #0a0a2e)',
        borderRadius: '24px',
        width: '90%',
        maxWidth: '400px',
        padding: '24px',
        textAlign: 'center',
        border: '1px solid rgba(167, 139, 250, 0.3)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
      } }, /*#__PURE__*/
    React.createElement("h2", { style: { color: '#a78bfa', marginBottom: '8px' } }, "\uD83C\uDFB0 ", lang === 'ar' ? 'جاتشه القبيلة' : 'Family Gacha'), /*#__PURE__*/
    React.createElement("p", { style: { fontSize: '12px', color: '#9ca3af', marginBottom: '20px' } },
    lang === 'ar' ? 'جرب حظك واربح جوائز نادرة!' : 'Try your luck and win rare rewards!'
    ), /*#__PURE__*/


    React.createElement("div", { style: {
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
      } },
    spinning ? /*#__PURE__*/
    React.createElement("div", { className: "spinning-slots", style: { fontSize: '60px' } }, "\u2728") :
    result ? /*#__PURE__*/
    React.createElement("div", { style: { textAlign: 'center' } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '50px', marginBottom: '8px' } }, result.icon || '🎁'), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '14px', fontWeight: 800, color: '#00f2ff' } },
    lang === 'ar' ? result.name_ar : result.name_en
    )
    ) : /*#__PURE__*/

    React.createElement("div", { style: { fontSize: '60px', opacity: 0.3 } }, "\uD83C\uDFB0"), /*#__PURE__*/



    React.createElement("div", { style: { position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, transparent, #a78bfa, transparent)' } })
    ), /*#__PURE__*/


    React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, /*#__PURE__*/
    React.createElement("button", {
      onClick: () => handleSpin('free'),
      disabled: spinning,
      style: {
        padding: '14px',
        borderRadius: '16px',
        border: 'none',
        background: 'rgba(255,255,255,0.06)',
        color: '#e2e8f0',
        fontWeight: 800,
        cursor: 'pointer',
        opacity: spinning ? 0.5 : 1
      } },
    "\uD83C\uDD93 ",
    lang === 'ar' ? 'سحبة مجانية يومية' : 'Daily Free Spin'
    ), /*#__PURE__*/

    React.createElement("button", {
      onClick: () => handleSpin('paid'),
      disabled: spinning,
      style: {
        padding: '14px',
        borderRadius: '16px',
        border: 'none',
        background: 'linear-gradient(135deg, #a78bfa, #7000ff)',
        color: 'white',
        fontWeight: 800,
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(112, 0, 255, 0.4)',
        opacity: spinning ? 0.5 : 1
      } },
    "\uD83D\uDC8E ",
    lang === 'ar' ? `سحبة بـ ${currentGachaConfig.paidCostPerSpin} إنتل` : `Spin for ${currentGachaConfig.paidCostPerSpin} Intel`
    )
    ), /*#__PURE__*/


    React.createElement("div", { style: {
        marginTop: '24px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '16px',
        textAlign: 'left'
      } }, /*#__PURE__*/
    React.createElement("div", { style: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'
      } }, /*#__PURE__*/
    React.createElement("span", { style: { color: '#e2e8f0', fontWeight: 'bold', fontSize: '14px' } },
    lang === 'ar' ? 'الجوائز المتاحة' : 'Available Rewards'
    ), /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '12px', color: '#a78bfa' } },
    lang === 'ar' ? 'النسب المئوية التقريبية' : 'Estimated Rates'
    )
    ), /*#__PURE__*/

    React.createElement("div", { style: {
        maxHeight: '120px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        paddingRight: '6px'
      } },
    rewards.map((r, i) => /*#__PURE__*/
    React.createElement("div", { key: i, style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
        padding: '8px 12px'
      } }, /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '18px' } }, r.icon), /*#__PURE__*/
    React.createElement("span", { style: { color: '#e2e8f0', fontSize: '13px' } },
    lang === 'ar' ? r.label_ar : r.label_en
    )
    ), /*#__PURE__*/
    React.createElement("span", { style: {
        color: r.rarity === 'legendary' ? '#fbbf24' :
        r.rarity === 'epic' ? '#a78bfa' :
        r.rarity === 'rare' ? '#60a5fa' :
        r.rarity === 'uncommon' ? '#4ade80' : '#9ca3af',
        fontSize: '12px',
        fontWeight: 'bold'
      } },
    r.rateDisplay
    )
    )
    )
    )
    ), /*#__PURE__*/

    React.createElement("button", {
      onClick: onClose,
      style: { marginTop: '20px', background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', cursor: 'pointer' } },

    lang === 'ar' ? 'إغلاق' : 'Close'
    )
    )
    ), /*#__PURE__*/

    React.createElement("style", null, `
                .spinning-slots {
                    animation: gacha-spin 0.2s infinite;
                }
                @keyframes gacha-spin {
                    0% { transform: translateY(-5px) scale(1.1); filter: hue-rotate(0deg); }
                    50% { transform: translateY(5px) scale(0.9); filter: hue-rotate(180deg); }
                    100% { transform: translateY(-5px) scale(1.1); filter: hue-rotate(360deg); }
                }
            `)
    ));

};

// No export default. Access via window.FamilyGacha.
window.FamilyGacha = FamilyGacha;