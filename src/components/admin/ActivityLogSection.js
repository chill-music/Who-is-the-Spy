(function() {
    var { useState, useEffect, useMemo, useRef } = React;

var ActivityLogSection = ({ lang }) => {
    var [logs, setLogs] = useState([]);
    var [loading, setLoading] = useState(true);

    var actionColors = {
        'BAN_USER': '#ef4444',
        'UNBAN_USER': '#10b981',
        'RESOLVE_REPORT': '#3b82f6',
        'EDIT_STAFF': '#8b5cf6',
        'SEND_GOLD': '#f59e0b',
        'BROADCAST': '#f59e0b',
        'DELETE_TICKET': '#6b7280',
    };

    useEffect(() => {
        // Fetch last 50 staff logs
        var unsub = staffLogCollection.orderBy('timestamp', 'desc').limit(50).onSnapshot(snap => {
            setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, []);

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#3b82f6', marginBottom:'16px' }}>
                📋 {lang==='ar'?'سجل نشاط الفريق':'Staff Activity Log'}
            </div>
            {loading ? <div style={{color:'#6b7280',fontSize:'12px',textAlign:'center',padding:'20px'}}>⏳</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:'6px', maxHeight:'50vh', overflowY:'auto' }}>
                    {logs.length === 0 && <div style={{color:'#6b7280',fontSize:'12px',textAlign:'center',padding:'20px'}}>{lang==='ar'?'لا توجد سجلات':'No logs yet'}</div>}
                    {logs.map(log => {
                        var ts = log.timestamp?.toDate?.();
                        var color = actionColors[log.action] || '#9ca3af';
                        return (
                            <div key={log.id} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${color}20`, borderRadius:'8px', padding:'10px', borderLeft:`3px solid ${color}` }}>
                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                                    <span style={{ fontSize:'11px', fontWeight:700, color }}>{log.action?.replace(/_/g,' ')}</span>
                                    <span style={{ fontSize:'9px', color:'#6b7280' }}>{ts ? ts.toLocaleString() : ''}</span>
                                </div>
                                <div style={{ fontSize:'11px', color:'#d1d5db' }}>
                                    <strong>{log.staffName}</strong>{log.targetName ? ` → ${log.targetName}` : ''}
                                </div>
                                {log.details && <div style={{ fontSize:'10px', color:'#6b7280', marginTop:'2px' }}>{log.details}</div>}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

window.ActivityLogSection = ActivityLogSection;
})();
