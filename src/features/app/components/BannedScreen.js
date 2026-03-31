(function () {
  /**
   * Component: BannedScreen
   * Renders the full-page suspension notice.
   */
  window.BannedScreen = function ({ userData, lang }) {
    if (!userData) return null;

    var formatExpiry = window.formatBanExpiry || ((d) => String(d));

    return (/*#__PURE__*/
      React.createElement("div", { style: {
          position: 'fixed', inset: 0, background: '#0a0a0f', zIndex: 999999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        } }, /*#__PURE__*/
      React.createElement("div", { style: { maxWidth: '400px', width: '100%', textAlign: 'center' } }, /*#__PURE__*/
      React.createElement("div", { style: {
          width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 20px',
          background: 'rgba(220,0,0,0.15)', border: '3px solid rgba(239,68,68,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px',
          boxShadow: '0 0 40px rgba(220,0,0,0.3), 0 0 80px rgba(220,0,0,0.1)',
          animation: 'ban-pulse 2s ease-in-out infinite'
        } }, "\uD83D\uDEAB"), /*#__PURE__*/
      React.createElement("style", null, `@keyframes ban-pulse{0%,100%{box-shadow:0 0 40px rgba(220,0,0,0.3),0 0 80px rgba(220,0,0,0.1)}50%{box-shadow:0 0 60px rgba(220,0,0,0.5),0 0 120px rgba(220,0,0,0.2)}}`), /*#__PURE__*/
      React.createElement("h1", { style: { fontSize: '22px', fontWeight: 900, color: '#f87171', marginBottom: '8px', letterSpacing: '0.5px' } },
      lang === 'ar' ? '🔒 حسابك موقوف' : '🔒 Account Suspended'
      ), /*#__PURE__*/
      React.createElement("p", { style: { fontSize: '13px', color: '#9ca3af', marginBottom: '20px', lineHeight: 1.6 } },
      lang === 'ar' ?
      'تم إيقاف حسابك من قِبَل الإدارة. لا يمكنك الدخول إلى اللعبة خلال هذه الفترة.' :
      'Your account has been suspended by the admin. You cannot access the game during this period.'
      ), /*#__PURE__*/

      React.createElement("div", { style: {
          background: 'linear-gradient(135deg,rgba(220,0,0,0.12),rgba(0,0,0,0.4))',
          border: '1px solid rgba(239,68,68,0.35)', borderRadius: '14px', padding: '16px 18px',
          textAlign: lang === 'ar' ? 'right' : 'left', marginBottom: '20px'
        } },
      userData?.ban?.reason && /*#__PURE__*/
      React.createElement("div", { style: { marginBottom: '8px' } }, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '10px', color: '#6b7280', fontWeight: 700, display: 'block', marginBottom: '2px' } },
      lang === 'ar' ? 'سبب الإيقاف' : 'REASON'
      ), /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '13px', color: '#fca5a5', fontWeight: 700 } }, userData.ban.reason)
      ), /*#__PURE__*/

      React.createElement("div", null, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '10px', color: '#6b7280', fontWeight: 700, display: 'block', marginBottom: '2px' } },
      lang === 'ar' ? 'ينتهي الإيقاف' : 'SUSPENSION ENDS'
      ), /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '13px', color: userData?.ban?.expiresAt ? '#fbbf24' : '#f87171', fontWeight: 900 } },
      formatExpiry(userData, lang)
      )
      )
      ), /*#__PURE__*/

      React.createElement("button", {
        onClick: () => window.auth && window.auth.signOut(),
        style: {
          padding: '11px 28px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
          color: '#9ca3af', letterSpacing: '0.3px'
        } },

      lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'
      )
      )
      ));

  };
})();