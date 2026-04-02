(function () {
  var VIPCenterModal = ({ show, onClose, userData, user, lang, onNotification, onOpenShop }) => {
    if (!show) return null;
    return (/*#__PURE__*/
      React.createElement(PortalModal, null, /*#__PURE__*/
      React.createElement("div", {
        style: { position: 'fixed', inset: 0, zIndex: Z.MODAL_HIGH, background: 'rgba(5, 3, 10, 0.94)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' },
        onClick: onClose
      }, /*#__PURE__*/
      React.createElement("div", {
        onClick: (e) => e.stopPropagation(),
        style: {
          width: '100%', maxWidth: 'min(520px, calc(100vw - 16px))', maxHeight: '92vh',
          background: 'linear-gradient(135deg,#0a0a1a 0%,#15153a 100%)',
          border: '1.5px solid rgba(168,85,247,0.3)', borderRadius: '24px', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', boxShadow: '0 30px 100px rgba(0,0,0,0.95), 0 0 50px rgba(124,58,237,0.15)',
          boxSizing: 'border-box'
        }
      }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid rgba(168,85,247,0.2)', background: 'linear-gradient(90deg,rgba(124,58,237,0.1),rgba(15,15,35,0.02))' } }, /*#__PURE__*/
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' } }, /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '26px' } }, "\uD83D\uDC51"), /*#__PURE__*/
          React.createElement("div", null, /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '18px', fontWeight: 900, color: '#f5f3ff', letterSpacing: '0.5px' } }, lang === 'ar' ? 'مركز VIP' : 'VIP Center'), /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '11px', color: '#a78bfa', fontWeight: 600 } }, lang === 'ar' ? 'نظام التميز الحصري' : 'Exclusive Premium System')
          )
        ), /*#__PURE__*/
        React.createElement("button", { onClick: onClose, style: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '8px 12px', color: '#e2e8f0', fontSize: '18px', cursor: 'pointer', transition: 'all 0.2s' } }, "\u2715")
      ), /*#__PURE__*/
      React.createElement("div", { style: { flex: 1, overflowY: 'auto', padding: '16px', maxHeight: 'calc(92vh - 70px)' } }, /*#__PURE__*/
        React.createElement(VIPCenterSection, { userData: userData, user: user, lang: lang, onNotification: onNotification })
      )
      )
      )
      ));
  };
  window.VIPCenterModal = VIPCenterModal;
})();