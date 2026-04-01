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
    if (mode === 'paid') {
      if (spinsToday >= 50) {
        onNotification(lang === 'ar' ? '⚠️ وصلت للحد الأقصى اليوم (50)' : '⚠️ Daily limit reached (50)');
        return;
      }
      var userCurrency = currentUserData?.currency || 0;
      if (userCurrency < 600) {
        onNotification(lang === 'ar' ? '❌ رصيدك غير كافٍ (تحتاج 600 💰)' : '❌ Insufficient funds (Need 600 💰)');
        return;
      }
    }

    setSpinMode(mode);
    setSpinning(true);
    setResult(null);

    try {
      // Small delay for effect
      await new Promise((r) => setTimeout(r, 1800));

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
  var today = new Date().toDateString();
  var userTodayKey = `${currentUID}_${today}`;
  var spinsToday = family?.gachaPaidSpins?.[userTodayKey] || 0;
  
  return (/*#__PURE__*/
    React.createElement(PortalModal, null, /*#__PURE__*/
    React.createElement("div", { className: "modal-overlay", onClick: onClose, style: { zIndex: Z.MODAL_HIGH + 10 } }, /*#__PURE__*/
    React.createElement("div", { className: "modal-content family-gacha-velvet", onClick: (e) => e.stopPropagation(), style: {
        background: 'linear-gradient(160deg, #400a14, #1a052e)', 
        borderRadius: '28px',
        width: '94%',
        maxWidth: '420px',
        padding: '28px',
        textAlign: 'center',
        border: '2px solid rgba(255, 215, 0, 0.2)',
        boxShadow: spinning && spinMode === 'paid' ? 
          '0 0 40px rgba(0,242,255,0.4), 0 25px 60px rgba(0,0,0,0.9)' : 
          '0 25px 60px rgba(0,0,0,0.9), inset 0 0 40px rgba(220, 20, 60, 0.1)',
        position: 'relative',
        transition: 'all 0.5s ease'
      } }, /*#__PURE__*/

    React.createElement("h2", { style: { color: '#ffd700', marginBottom: '4px', fontSize: '24px', textShadow: '0 0 10px rgba(255,215,0,0.3)' } }, "\uD83C\uDFB0 ", lang === 'ar' ? 'جاتشه القبيلة' : 'Family Gacha'), /*#__PURE__*/

    React.createElement("p", { style: { fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px', fontWeight: 600 } },
    lang === 'ar' ? 'جرب حظك واربح جوائز نادرة!' : 'Try your luck and win rare rewards!'
    ), /*#__PURE__*/


    React.createElement("div", { style: {
        height: '140px',
        background: 'rgba(0,0,0,0.4)',
        borderRadius: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
        border: '1.5px solid rgba(255,215,0,0.1)'
      } },
    spinning ? /*#__PURE__*/
    React.createElement("div", { className: "spinning-slots", style: { fontSize: '60px', filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.5))' } }, "\u2728") :
    result ? /*#__PURE__*/
    React.createElement("div", { className: "animate-pop", style: { textAlign: 'center' } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '56px', marginBottom: '8px', filter: 'drop-shadow(0 0 20px rgba(0,242,255,0.4))' } }, result.icon || '🎁'), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '15px', fontWeight: 900, color: '#00f2ff', letterSpacing: '0.5px' } },
    lang === 'ar' ? result.name_ar : result.name_en
    )
    ) : /*#__PURE__*/

    React.createElement("div", { style: { fontSize: '60px', opacity: 0.15 } }, "\uD83C\uDFB0"), /*#__PURE__*/

    React.createElement("div", { style: { position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, #ffd700, transparent)' } })
    ), /*#__PURE__*/


    React.createElement("div", { style: { display: 'flex', gap: '12px', marginBottom: '24px' } }, /*#__PURE__*/
    React.createElement("div", { style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' } },
      React.createElement("button", {
        onClick: () => handleSpin('free'),
        disabled: spinning,
        style: {
          padding: '12px',
          borderRadius: '16px',
          border: '1.5px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.06)',
          color: '#ffd700',
          fontWeight: 900,
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          opacity: spinning ? 0.3 : 1
        } },
      lang === 'ar' ? 'سحبة مجانية' : 'Free Spin'
      ),
      React.createElement("div", { style: { fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 800 } }, lang === 'ar' ? 'مرة يومياً' : 'Daily Reset')
    ),

    React.createElement("div", { style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' } },
      React.createElement("button", {
        onClick: () => handleSpin('paid'),
        disabled: spinning,
        style: {
          padding: '12px',
          borderRadius: '16px',
          border: 'none',
          background: 'linear-gradient(135deg, #ffd700, #b8860b)',
          color: '#000',
          fontWeight: 900,
          fontSize: '13px',
          cursor: 'pointer',
          boxShadow: '0 6px 15px rgba(184, 134, 11, 0.4)',
          transition: 'all 0.2s',
          opacity: (spinning || spinsToday >= 50) ? 0.3 : 1
        } },
      lang === 'ar' ? 'سحبة بـ 600' : '600 Coins'
      ),
      React.createElement("div", { style: { 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '2px', 
        marginTop: '2px',
        background: 'rgba(255,215,0,0.05)',
        padding: '4px 8px',
        borderRadius: '8px',
        border: '1px solid rgba(255,215,0,0.1)'
      } },
        React.createElement("div", { style: { fontSize: '9px', color: '#ffd700', fontWeight: 800 } }, 
          lang === 'ar' ? '600 💰 التكلفة' : 'Cost: 600 💰'
        ),
        React.createElement("div", { style: { fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 } }, 
          lang === 'ar' ? `اليوم: ${spinsToday}/50` : `Today: ${spinsToday}/50`
        )
      )
    )

    ), /*#__PURE__*/


    React.createElement("div", { style: {
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '24px',
        padding: '16px',
        border: '1px solid rgba(255,255,255,0.05)'
      } }, /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' } }, /*#__PURE__*/
      React.createElement("span", { style: { color: '#e2e8f0', fontWeight: 800, fontSize: '13px' } },
        lang === 'ar' ? 'الجوائز المتاحة' : 'Rewards'
      ),
      React.createElement("span", { style: { fontSize: '10px', color: '#ffd700', fontWeight: 700 } }, 
        lang === 'ar' ? 'جاتشه القبيلة' : 'Family Pool'
      )
    ), /*#__PURE__*/

    React.createElement("div", { style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        maxHeight: '160px',
        overflowY: 'auto',
        paddingRight: '4px'
      } },
    rewards.map((r, i) => {
      var isWinner = result && (result.id === r.id || (result.type === r.type && result.amount === r.amount));
      var totalW = rewards.reduce((s, x) => s + (x.weight || 0), 0);
      var prob = totalW > 0 ? ((r.weight || 0) / totalW * 100).toFixed(1) : '0';
      var rColor = r.rarity === 'legendary' ? '#fbbf24' :
                   r.rarity === 'epic' ? '#a78bfa' :
                   r.rarity === 'rare' ? '#60a5fa' : '#9ca3af';

      return React.createElement("div", { key: i, style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: isWinner ? `${rColor}33` : 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          padding: '10px 4px',
          border: isWinner ? `2px solid ${rColor}` : `1px solid ${rColor}15`,
          position: 'relative',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          boxShadow: isWinner ? `0 0 20px ${rColor}66, inset 0 0 10px ${rColor}33` : `0 2px 8px rgba(0,0,0,0.2)`,
          overflow: 'hidden'
        } }, /*#__PURE__*/
      
      isWinner && React.createElement("div", { style: { position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', fontSize: '18px', zIndex: 10, animation: 'bounce 1s infinite' } }, "🎁"),

      /* Rarity Glow Background */
      React.createElement("div", { style: { 
        position: 'absolute', inset: 0, 
        background: `radial-gradient(circle at center, ${rColor}11, transparent 70%)`,
        pointerEvents: 'none'
      } }),

      /* Image or Icon */
      r.imageUrl ? 
        React.createElement("img", { src: r.imageUrl, alt: "", style: { width: '36px', height: '36px', objectFit: 'contain', marginBottom: '6px', filter: isWinner ? 'none' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' } }) :
        React.createElement("span", { style: { fontSize: '26px', marginBottom: '6px', filter: isWinner ? 'none' : 'grayscale(0.3)' } }, r.icon),

      /* Prob Tag */
      React.createElement("div", { style: { 
        position: 'absolute', top: '4px', right: '6px', 
        fontSize: '7px', fontWeight: 900, 
        color: isWinner ? rColor : 'rgba(255,255,255,0.25)',
        textShadow: isWinner ? `0 0 4px ${rColor}aa` : 'none'
      } }, prob, "%"),

      React.createElement("span", { style: {
          color: isWinner ? '#fff' : rColor,
          fontSize: '9px',
          fontWeight: 900,
          textAlign: 'center',
          lineHeight: 1.1,
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          padding: '0 4px'
        } },
      lang === 'ar' ? r.label_ar : r.label_en
      )
      );
    })

    )
    ), /*#__PURE__*/

    React.createElement("button", {
      onClick: onClose,
      style: { marginTop: '24px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' } },

    lang === 'ar' ? 'إغلاق' : 'Close'
    )
    )
    ), /*#__PURE__*/

    React.createElement("style", null, `
                .spinning-slots {
                    animation: gacha-spin-modern 0.25s infinite;
                }
                @keyframes gacha-spin-modern {
                    0% { transform: translateY(-8px) scale(1.05); filter: contrast(1.2) hue-rotate(0deg); }
                    50% { transform: translateY(8px) scale(0.95); filter: contrast(0.8) hue-rotate(90deg); }
                    100% { transform: translateY(-8px) scale(1.05); filter: contrast(1.2) hue-rotate(180deg); }
                }
                .family-gacha-velvet::-webkit-scrollbar { width: 4px; }
                .family-gacha-velvet::-webkit-scrollbar-thumb { background: rgba(255,215,0,0.2); border-radius: 10px; }
            `)
    ));

};

// No export default. Access via window.FamilyGacha.
window.FamilyGacha = FamilyGacha;
