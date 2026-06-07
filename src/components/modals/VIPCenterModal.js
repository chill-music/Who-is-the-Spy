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
          width: '100%', maxWidth: 'min(520px, calc(100vw - 16px))', maxHeight: '94vh',
          background: 'linear-gradient(135deg,#0a0a1a 0%,#15153a 100%)',
          border: '1.5px solid rgba(168,85,247,0.3)', borderRadius: '32px', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', boxShadow: '0 30px 100px rgba(0,0,0,0.95), 0 0 50px rgba(124,58,237,0.15)',
          boxSizing: 'border-box', position: 'relative'
        }
      }, /*#__PURE__*/
      React.createElement("div", { style: { flex: 1, overflowY: 'auto', maxHeight: '94vh' } }, /*#__PURE__*/
        React.createElement(VIPCenterSection, { userData: userData, user: user, lang: lang, onNotification: onNotification, onClose: onClose })
      )

      )
      )
      ));
  };
  window.VIPCenterModal = VIPCenterModal;
})();