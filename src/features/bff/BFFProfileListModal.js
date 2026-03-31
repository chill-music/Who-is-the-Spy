(function () {
  var { useState, useEffect, useRef, useMemo } = React;

  // ─────────────────────────────────────────────
  // 📋 BFF PROFILE LIST MODAL — full card grid view
  // ─────────────────────────────────────────────
  var BFFProfileListModal = ({ show, onClose, relationships, partnerProfiles, targetUID, lang }) => {
    // ── Late-binding: read from window at render time ──
    var PortalModal = window.PortalModal || (({ children }) => children);

    if (!show) return null;

    return (/*#__PURE__*/
      React.createElement(PortalModal, null, /*#__PURE__*/
      React.createElement("div", { onClick: onClose, style: {
          position: 'fixed', inset: 0, zIndex: Z.MODAL_HIGH + 4,
          background: 'rgba(0,0,0,0.78)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
        } }, /*#__PURE__*/
      React.createElement("div", { className: "animate-pop", onClick: (e) => e.stopPropagation(), style: {
          width: '100%', maxWidth: '480px', maxHeight: '85vh',
          background: 'linear-gradient(160deg, #1a0a2e, #0d0d1a)',
          borderRadius: '24px 24px 0 0',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 -10px 60px rgba(167,139,250,0.22)',
          border: '1px solid rgba(167,139,250,0.18)', borderBottom: 'none'
        } }, /*#__PURE__*/

      React.createElement("div", { style: { display: 'flex', justifyContent: 'center', padding: '10px 0 4px' } }, /*#__PURE__*/
      React.createElement("div", { style: { width: '40px', height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.15)' } })
      ), /*#__PURE__*/


      React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px 14px', flexShrink: 0 } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '16px', fontWeight: 900, color: 'white' } },
      lang === 'ar' ? 'علاقات BFF' : 'My BFF'
      ), /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '14px' } }, "\u2764\uFE0F"), /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '16px', fontWeight: 900, color: '#f472b6' } }, relationships.length)
      ), /*#__PURE__*/
      React.createElement("button", { onClick: onClose, style: {
          background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '10px',
          color: '#9ca3af', fontSize: '18px', width: '34px', height: '34px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        } }, "\u2715")
      ), /*#__PURE__*/


      React.createElement("div", { style: { flex: 1, overflowY: 'auto', padding: '0 14px 24px' } }, /*#__PURE__*/
      React.createElement("div", { style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px 10px'
        } },
      relationships.map((rel) => {
        var partnerUID = rel.uid1 === targetUID ? rel.uid2 : rel.uid1;
        var partner = partnerProfiles[partnerUID];
        var token = BFF_TOKEN_ITEMS.find((t) => t.id === rel.tokenId) || BFF_TOKEN_ITEMS[0];
        var level = BFF_RARITY_TO_LEVEL[token.rarity] || 1;

        return (/*#__PURE__*/
          React.createElement("div", { key: rel.id, style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } }, /*#__PURE__*/

          React.createElement("div", { style: {
              width: '100%',
              height: '110px',
              borderRadius: '14px',
              position: 'relative',
              background: `linear-gradient(145deg, ${token.color}30, ${token.color}12)`,
              border: `1.5px solid ${token.color}55`,
              boxShadow: `0 4px 16px ${token.glow}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '20px',
              overflow: 'visible'
            } }, /*#__PURE__*/

          React.createElement("div", { style: {
              position: 'absolute', inset: 0, borderRadius: '12px',
              background: `repeating-linear-gradient(45deg, ${token.color}09 0px, transparent 12px, ${token.color}05 12px, transparent 24px)`,
              pointerEvents: 'none', overflow: 'hidden'
            } }), /*#__PURE__*/


          React.createElement("div", { style: {
              position: 'absolute', top: '6px', left: '6px',
              background: `linear-gradient(135deg, ${token.color}ee, ${token.color}99)`,
              borderRadius: '6px', padding: '2px 5px',
              fontSize: '8px', fontWeight: 900, color: '#fff',
              display: 'flex', alignItems: 'center', gap: '2px',
              zIndex: 2
            } }, /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '9px' } }, token.emoji),
          ' ', "LV", level
          ), /*#__PURE__*/


          React.createElement("div", { style: { fontSize: '30px', zIndex: 1 } },
          token.imageURL ? /*#__PURE__*/
          React.createElement("img", { src: token.imageURL, alt: "", style: { width: '38px', height: '38px', objectFit: 'contain' } }) :
          token.emoji
          ), /*#__PURE__*/


          React.createElement("div", { style: {
              position: 'absolute', bottom: '-18px',
              width: '36px', height: '36px', borderRadius: '50%',
              border: `2.5px solid ${token.color}`,
              overflow: 'hidden', background: '#120820',
              boxShadow: `0 2px 10px rgba(0,0,0,0.6), 0 0 8px ${token.glow}`,
              zIndex: 3
            } },
          partner?.photoURL ? /*#__PURE__*/
          React.createElement("img", { src: partner.photoURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/
          React.createElement("div", { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' } }, "\uD83D\uDE0E")
          )
          ), /*#__PURE__*/


          React.createElement("div", { style: {
              fontSize: '10px', fontWeight: 700,
              color: '#d1d5db', textAlign: 'center',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              width: '100%', padding: '0 2px'
            } },
          partner?.displayName || '...'
          )
          ));

      })
      )
      )
      )
      )
      ));

  };

  // 🌍 Global Export
  window.BFFProfileListModal = BFFProfileListModal;
})();