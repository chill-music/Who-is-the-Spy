(function() {
    const { useState, useEffect, useMemo, useRef } = React;

var AdminStatCard = ({ label, value, icon, color }) => (
    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'14px', flex:1, minWidth:'140px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
            <span style={{ fontSize:'10px', color:'#6b7280', fontWeight:600, textTransform:'uppercase' }}>{label}</span>
            <span style={{ fontSize:'14px' }}>{icon}</span>
        </div>
        <div style={{ fontSize:'18px', fontWeight:800, color }}>{value}</div>
    </div>
);

window.AdminStatCard = AdminStatCard;
})();
