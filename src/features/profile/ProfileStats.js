// ════════════════════════════════════════════════════════════
// 🏗️ PROFILE STATS COMPONENT
// ════════════════════════════════════════════════════════════
var ProfileStats = ({
  wins,
  losses,
  charismaRank,
  level,
  lang
}) => {
  return (/*#__PURE__*/
    React.createElement("div", { style: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-evenly',
        width: '100%', padding: '10px 8px', boxSizing: 'border-box',
        background: 'rgba(0,0,0,0.15)', borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)', margin: '8px 0'
      } }, /*#__PURE__*/

    React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flex: '1', minWidth: 0 } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '18px', fontWeight: 900, color: '#4ade80', lineHeight: 1 } }, wins), /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '8px', color: '#6b7280', fontWeight: 600, textAlign: 'center' } }, "\uD83C\uDFC6 ", lang === 'ar' ? 'فوز' : 'Wins')
    ), /*#__PURE__*/

    React.createElement("div", { style: { width: '1px', height: '32px', background: 'rgba(255,255,255,0.08)', flexShrink: 0 } }), /*#__PURE__*/

    React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flex: '1', minWidth: 0 } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '18px', fontWeight: 900, color: '#f87171', lineHeight: 1 } }, losses), /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '8px', color: '#6b7280', fontWeight: 600, textAlign: 'center' } }, "\uD83D\uDC80 ", lang === 'ar' ? 'خسارة' : 'Losses')
    ), /*#__PURE__*/

    React.createElement("div", { style: { width: '1px', height: '32px', background: 'rgba(255,255,255,0.08)', flexShrink: 0 } }), /*#__PURE__*/

    React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flex: '1.2', minWidth: 0 } }, /*#__PURE__*/
    React.createElement(WinRateCircleV11, { wins: wins, losses: losses, lang: lang })
    ), /*#__PURE__*/

    React.createElement("div", { style: { width: '1px', height: '32px', background: 'rgba(255,255,255,0.08)', flexShrink: 0 } }), /*#__PURE__*/

    React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flex: '1', minWidth: 0 } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '18px', fontWeight: 900, color: '#fbbf24', lineHeight: 1 } }, "#", charismaRank || '--'), /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '8px', color: '#6b7280', fontWeight: 600, textAlign: 'center' } }, "\uD83C\uDF96\uFE0F ", lang === 'ar' ? 'رتبة' : 'Rank')
    ), /*#__PURE__*/

    React.createElement("div", { style: { width: '1px', height: '32px', background: 'rgba(255,255,255,0.08)', flexShrink: 0 } }), /*#__PURE__*/

    React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flex: '1', minWidth: 0 } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '18px', fontWeight: 900, color: '#a78bfa', lineHeight: 1 } }, level), /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '8px', color: '#6b7280', fontWeight: 600, textAlign: 'center' } }, "\u26A1 ", lang === 'ar' ? 'مستوى' : 'Level')
    )
    ));

};

window.ProfileStats = ProfileStats;