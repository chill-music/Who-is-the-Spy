(function () {
  var { useState, useEffect, useRef, useMemo } = React;

  // ─────────────────────────────────────────────
  // 📋 INCOMING BFF REQUEST ITEM — standalone component
  // ─────────────────────────────────────────────
  var BFFRequestItem = ({ bffDoc, fromData, lang, onNotification, onDone }) => {
    var [handling, setHandling] = useState(false);
    var token = BFF_TOKEN_ITEMS.find((t) => t.id === bffDoc.tokenId) || BFF_TOKEN_ITEMS[0];

    var handle = async (accept) => {
      setHandling(true);
      if (accept) {
        await acceptBFFRequest({ bffDocId: bffDoc.id, uid1: bffDoc.uid1, uid2: bffDoc.uid2, onNotification, lang });
      } else {
        await declineBFFRequest({ bffDocId: bffDoc.id, fromUID: bffDoc.uid1, tokenId: bffDoc.tokenId, onNotification, lang });
      }
      setHandling(false);
      onDone && onDone();
    };

    return (/*#__PURE__*/
      React.createElement("div", { style: {
          background: `linear-gradient(135deg,${token.color}12,${token.color}06)`,
          border: `1px solid ${token.color}40`,
          borderRadius: '16px', padding: '14px 16px', position: 'relative', overflow: 'hidden'
        } }, /*#__PURE__*/
      React.createElement("div", { style: { position: 'absolute', top: '-20px', right: '-20px', width: '70px', height: '70px', borderRadius: '50%', background: token.glow, filter: 'blur(28px)', pointerEvents: 'none' } }), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' } }, /*#__PURE__*/
      React.createElement("div", { style: { width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${token.color}60`, flexShrink: 0 } },
      fromData?.photoURL ? /*#__PURE__*/
      React.createElement("img", { src: fromData.photoURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/
      React.createElement("div", { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' } }, "\uD83D\uDE0E")
      ), /*#__PURE__*/
      React.createElement("div", { style: { flex: 1 } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '14px', fontWeight: 800, color: 'white' } }, fromData?.displayName || '—'), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', color: token.color } }, "\uD83E\uDD1D ", lang === 'ar' ? 'يريد صداقتك' : 'wants to be your BFF')
      ), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', background: `${token.color}15`, border: `1px solid ${token.color}40`, borderRadius: '10px', padding: '5px 10px' } }, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '18px' } }, token.emoji), /*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '10px', fontWeight: 700, color: token.color } }, lang === 'ar' ? token.name_ar : token.name_en), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '9px', color: BFF_RARITY_COLORS[token.rarity] } }, token.rarity)
      )
      )
      ), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '10px' } }, /*#__PURE__*/
      React.createElement("button", { onClick: () => handle(false), disabled: handling, style: {
          flex: 1, padding: '10px', borderRadius: '11px',
          border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)',
          color: '#f87171', fontSize: '12px', fontWeight: 700, cursor: 'pointer'
        } }, handling ? '⏳' : lang === 'ar' ? '❌ رفض' : '❌ Decline'), /*#__PURE__*/
      React.createElement("button", { onClick: () => handle(true), disabled: handling, style: {
          flex: 1, padding: '10px', borderRadius: '11px', border: 'none',
          background: `linear-gradient(135deg,${token.color},${token.color}88)`,
          color: '#000', fontSize: '12px', fontWeight: 800, cursor: 'pointer',
          boxShadow: `0 4px 16px ${token.glow}`
        } }, handling ? '⏳' : lang === 'ar' ? '🤝 قبول' : '🤝 Accept')
      )
      ));

  };

  // 🌍 Global Export
  window.BFFRequestItem = BFFRequestItem;
})();