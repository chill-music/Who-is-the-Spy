var FamilyRanking = ({ currentUID, lang, isLeaderboard = true }) => {
  var [rankings, setRankRankings] = React.useState([]);
  var [loading, setLoading] = React.useState(true);

  var {
    getFamilyLevelConfig = () => ({}),
    getFamilySignLevelData = () => ({ level: 0 }),
    getFamilySignImage = () => ''
  } = window.FamilyConstants || window.FamilyService || {};
  var familiesCollection = (window.db || window.firestore)?.collection('families');
  var currentFamilyId = window.currentFamilyId;

  React.useEffect(() => {
    if (!familiesCollection) {
      setLoading(false);
      return;
    }
    setLoading(true);
    familiesCollection.orderBy('xp', 'desc').limit(50).get().then((snap) => {
      setRankRankings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [familiesCollection]);

  if (loading) return /*#__PURE__*/React.createElement("div", { style: { textAlign: 'center', padding: '40px', color: '#6b7280' } }, "\u23F3");

  var medals = ['🥇', '🥈', '🥉'];

  return (/*#__PURE__*/
    React.createElement("div", { style: { flex: 1, overflowY: 'auto', padding: '14px' } }, /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
    rankings.map((fam, i) => {
      var fl = getFamilyLevelConfig(fam.level || 1);
      var sign = getFamilySignLevelData(fam.weeklyActiveness || 0);
      var signColor = sign?.color || '#6b7280';
      var signLevel = sign?.level || 1;
      var isMine = fam.id === currentFamilyId;

      return (/*#__PURE__*/
        React.createElement("div", { key: fam.id,
          onClick: () => window.onOpenFamily && window.onOpenFamily(fam.id),
          style: {
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
            borderRadius: '16px',
            background: isMine ?
            'rgba(0,242,255,0.08)' :
            i < 3 ?
            'rgba(255,215,0,0.04)' :
            'rgba(255,255,255,0.03)',
            border: isMine ?
            '1px solid rgba(0,242,255,0.3)' :
            i === 0 ?
            '1px solid rgba(255,215,0,0.2)' :
            '1px solid rgba(255,255,255,0.06)',
            cursor: window.onOpenFamily ? 'pointer' : 'default',
            transition: 'all 0.15s ease',
            position: 'relative',
            overflow: 'hidden'
          } }, /*#__PURE__*/


        React.createElement("div", { style: { width: '28px', textAlign: 'center', fontSize: '16px', flexShrink: 0 } },
        i < 3 ? medals[i] : /*#__PURE__*/React.createElement("span", { style: { fontSize: '11px', color: '#4b5563', fontWeight: 800 } }, "#", i + 1)
        ), /*#__PURE__*/


        React.createElement("div", { style: {
            width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden',
            border: `2px solid ${signColor}55`, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', flexShrink: 0
          } },
        fam.photoURL ? /*#__PURE__*/React.createElement("img", { src: fam.photoURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : fam.emblem || '🏠'
        ), /*#__PURE__*/


        React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } }, /*#__PURE__*/
        React.createElement("span", { style: {
            fontSize: '13px', fontWeight: 800, color: isMine ? '#00f2ff' : 'white',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px'
          } },
        fam.name
        ),
        window.FamilySignBadge && /*#__PURE__*/React.createElement(window.FamilySignBadge, { tag: fam.tag, color: signColor, small: true, signLevel: signLevel, imageURL: getFamilySignImage(0, signLevel) })
        ), /*#__PURE__*/
        React.createElement("div", { style: { fontSize: '10px', color: '#6b7280', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/
        React.createElement("span", null, fl.icon, " Lv.", fl.level), /*#__PURE__*/
        React.createElement("span", { style: { opacity: 0.3 } }, "|"), /*#__PURE__*/
        React.createElement("span", null, "\uD83D\uDC65 ", (fam.members || []).length)
        )
        ), /*#__PURE__*/


        React.createElement("div", { style: { textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' } }, /*#__PURE__*/
        React.createElement("div", { style: { fontSize: '12px', fontWeight: 900, color: '#fbbf24' } },
        window.fmtFamilyNum ? window.fmtFamilyNum(fam.xp || 0) : fam.xp || 0, " XP"
        ),
        sign && /*#__PURE__*/React.createElement("div", { style: { fontSize: '9px', color: signColor, fontWeight: 700 } }, lang === 'ar' ? sign.name_ar : sign.name_en)
        ),


        window.onOpenFamily && /*#__PURE__*/React.createElement("div", { style: { fontSize: '12px', color: '#4b5563', marginLeft: '4px' } }, "\u203A")
        ));

    }),
    rankings.length === 0 && /*#__PURE__*/
    React.createElement("div", { style: { textAlign: 'center', padding: '40px', color: '#4b5563', fontSize: '13px' } },
    lang === 'ar' ? 'لا يوجد ترتيب بعد' : 'No rankings yet'
    )

    )
    ));

};

window.FamilyRanking = FamilyRanking;
window.FamilyRankingInline = FamilyRanking; // For backward compatibility if needed internally