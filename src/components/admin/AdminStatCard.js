(function () {
  var { useState, useEffect, useMemo, useRef } = React;

  var AdminStatCard = ({ label, value, icon, color }) => /*#__PURE__*/
  React.createElement("div", { style: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', flex: 1, minWidth: '140px' } }, /*#__PURE__*/
  React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' } }, /*#__PURE__*/
  React.createElement("span", { style: { fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' } }, label), /*#__PURE__*/
  React.createElement("span", { style: { fontSize: '14px' } }, icon)
  ), /*#__PURE__*/
  React.createElement("div", { style: { fontSize: '18px', fontWeight: 800, color } }, value)
  );


  window.AdminStatCard = AdminStatCard;
})();