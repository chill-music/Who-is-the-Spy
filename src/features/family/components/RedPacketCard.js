/**
 * 🧧 RED PACKET CARD — Tap once to see details, tap Claim to get funds
 * Used in Public Chat, Family Chat, Group Chat
 */
var RedPacketCard = ({ rpId, rpAmount, maxClaims, senderName, currentUID, user, currentUser, lang, onClaim }) => {
  var redPacketsCollection = window.redPacketsCollection || (window.db || window.firestore)?.collection('redPackets');
  var [showDetails, setShowDetails] = React.useState(false);
  var [rpData, setRpData] = React.useState(null);
  var [loading, setLoading] = React.useState(false);
  var [selfClaimed, setSelfClaimed] = React.useState(false);

  // Auto-load to detect claimed state without user tap
  React.useEffect(() => {
    if (!rpId) return;
    redPacketsCollection.doc(rpId).get().then((doc) => {
      if (doc.exists) {
        var d = doc.data();
        setRpData(d);
        if (d.claimedBy?.includes(user?.uid)) setSelfClaimed(true);
      }
    }).catch(() => {});
  }, [rpId, user?.uid]);

  var fetchDetails = async () => {
    if (rpData) {setShowDetails(true);return;}
    setLoading(true);
    try {
      var doc = await redPacketsCollection.doc(rpId).get();
      if (doc.exists) setRpData(doc.data());
    } catch (e) {}
    setLoading(false);
    setShowDetails(true);
  };

  var claimed = selfClaimed || rpData?.claimedBy?.includes(user?.uid);
  var isReclaimed = rpData?.status === 'reclaimed';
  var exhausted = isReclaimed || (rpData?.claimedBy?.length || 0) >= (rpData?.maxClaims || maxClaims || 1);
  var remaining = rpData?.remaining ?? rpAmount;
  var claimedCount = rpData?.claimedBy?.length || 0;

  if (showDetails && rpData) return (/*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("div", { style: { background: 'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(185,28,28,0.1))', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '16px', padding: '12px 14px', minWidth: '200px', maxWidth: 'min(260px,calc(100vw-90px))' } }, /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '26px', filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.7))' } }, "\uD83E\uDDE7"), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '12px', fontWeight: 800, color: '#ffd700' } }, lang === 'ar' ? 'مغلف أحمر' : 'Red Packet'), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '10px', color: '#fca5a5' } }, rpAmount?.toLocaleString(), " \uD83E\uDDE0 \xB7 ", lang === 'ar' ? 'من' : 'from', " ", senderName)
    ), /*#__PURE__*/
    React.createElement("button", { onClick: () => setShowDetails(false), style: { marginLeft: 'auto', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '14px', lineHeight: 1 } }, "\u2715")
    ), /*#__PURE__*/

    React.createElement("div", { style: { marginBottom: '8px' } }, /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#9ca3af', marginBottom: '3px' } }, /*#__PURE__*/
    React.createElement("span", null, lang === 'ar' ? 'تم الاستلام' : 'Claimed', ": ", claimedCount, "/", rpData.maxClaims || maxClaims), /*#__PURE__*/
    React.createElement("span", null, lang === 'ar' ? 'متبقي' : 'Remaining', ": ", remaining?.toLocaleString?.(), " \uD83E\uDDE0")
    ), /*#__PURE__*/
    React.createElement("div", { style: { height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' } }, /*#__PURE__*/
    React.createElement("div", { style: { height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg,#ef4444,#fbbf24)', width: `${Math.min(100, claimedCount / (rpData.maxClaims || maxClaims || 1) * 100)}%` } })
    )
    ),
    !claimed && !exhausted && /*#__PURE__*/
    React.createElement("button", { onClick: () => {onClaim(rpId);setShowDetails(false);}, style: { width: '100%', padding: '10px', borderRadius: '12px', background: 'linear-gradient(135deg,#ef4444,#b91c1c)', border: 'none', color: 'white', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.3)', marginTop: '4px' } }, "\uD83C\uDF81 ",
    lang === 'ar' ? 'استلم الآن' : 'Claim Now'
    ),

    claimed && /*#__PURE__*/React.createElement("div", { style: { textAlign: 'center', fontSize: '12px', color: '#4ade80', padding: '8px', background: 'rgba(74,222,128,0.1)', borderRadius: '10px', fontWeight: 700 } }, "\u2705 ", lang === 'ar' ? 'استلمته' : 'Claimed'),
    isReclaimed && !claimed && /*#__PURE__*/React.createElement("div", { style: { textAlign: 'center', fontSize: '12px', color: '#f87171', padding: '8px', background: 'rgba(248,113,113,0.1)', borderRadius: '10px' } }, "\u21A9 ", lang === 'ar' ? 'تم استرداد المغلف' : 'Packet reclaimed'),
    exhausted && !claimed && !isReclaimed && /*#__PURE__*/React.createElement("div", { style: { textAlign: 'center', fontSize: '12px', color: '#9ca3af', padding: '8px', background: 'rgba(156,163,175,0.1)', borderRadius: '10px' } }, "\uD83D\uDD34 ", lang === 'ar' ? 'نفد المغلف' : 'Exhausted'),


    rpData?.claimerNames && rpData.claimerNames.length > 0 && /*#__PURE__*/
    React.createElement("div", { style: { marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '10px', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' } }, lang === 'ar' ? 'من استلم' : 'Claimed by'), /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' } },
    rpData.claimerNames.map((name, idx) => /*#__PURE__*/
    React.createElement("span", { key: idx, style: { fontSize: '10px', color: '#d1d5db', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' } },
    name
    )
    )
    )
    )

    )
    ));


  return (/*#__PURE__*/
    React.createElement("button", { onClick: fetchDetails, style: {
        display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 15px', borderRadius: '16px',
        background: claimed ?
        'linear-gradient(135deg,rgba(75,85,99,0.28),rgba(55,65,81,0.2))' :
        'linear-gradient(135deg,rgba(239,68,68,0.25),rgba(185,28,28,0.2))',
        border: claimed ? '1px solid rgba(107,114,128,0.3)' : '1px solid rgba(239,68,68,0.5)',
        cursor: 'pointer',
        boxShadow: claimed ? 'none' : '0 4px 16px rgba(239,68,68,0.25)',
        textAlign: 'left',
        maxWidth: 'min(260px,calc(100vw-90px))',
        opacity: claimed ? 0.55 : 1,
        transition: 'all 0.25s'
      } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '34px', filter: claimed || exhausted ? 'grayscale(0.8) contrast(0.8) brightness(0.7)' : 'drop-shadow(0 0 10px rgba(239,68,68,0.8))', transition: 'all 0.3s' } },
    loading ? '⏳' : '🧧'
    ), /*#__PURE__*/
    React.createElement("div", { style: { flex: 1 } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '13px', fontWeight: 900, color: claimed || exhausted ? '#9ca3af' : '#ffd700' } }, lang === 'ar' ? 'مغلف أحمر' : 'Red Packet'), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '11px', color: claimed || exhausted ? '#6b7280' : '#fca5a5', marginTop: '2px', fontWeight: 600 } }, rpAmount?.toLocaleString(), " \uD83E\uDDE0 \xB7 ", maxClaims, " ", lang === 'ar' ? 'استلام' : 'claims'), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '10px', color: claimed ? '#4ade80' : exhausted ? '#6b7280' : 'rgba(252,165,165,0.8)', marginTop: '3px', fontWeight: 700 } },
    claimed ? lang === 'ar' ? '✅ تم الاستلام' : '✅ Claimed' : exhausted ? lang === 'ar' ? '🔴 نفد' : '🔴 Exhausted' : lang === 'ar' ? '🎁 اضغط للتفاصيل' : '🎁 Tap for details'
    )
    )
    ));

};

window.RedPacketCard = RedPacketCard;