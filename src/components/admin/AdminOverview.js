(function() {
    const { useState, useEffect, useMemo, useRef } = React;

var OverviewSection = ({ lang }) => {
    const [stats, setStats] = useState({ users:0, today:0, reports:0, tickets:0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const u = await usersCollection.count().get();
                const r = await reportsCollection.where('resolved','==',false).count().get();
                const t = await ticketsCollection.where('status','==','open').count().get();
                
                const today = new Date();
                today.setHours(0,0,0,0);
                const td = await usersCollection.where('createdAt','>=',firebase.firestore.Timestamp.fromDate(today)).count().get();

                setStats({ 
                    users: u.data().count, 
                    today: td.data().count, 
                    reports: r.data().count, 
                    tickets: t.data().count 
                });
            } catch(e) {}
            setLoading(false);
        };
        fetchStats();
    }, []);

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#3b82f6', marginBottom:'16px' }}>
                📊 {lang==='ar'?'نظرة عامة':'System Overview'}
            </div>
            {loading ? <div style={{textAlign:'center',padding:'20px'}}>⏳</div> : (
                <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                    <AdminStatCard label={lang==='ar'?'إجمالي المستخدمين':'Total Users'} value={stats.users.toLocaleString()} icon="👥" color="#3b82f6" />
                    <AdminStatCard label={lang==='ar'?'جديد اليوم':'New Today'} value={stats.today} icon="✨" color="#10b981" />
                    <AdminStatCard label={lang==='ar'?'بلاغات مفتوحة':'Open Reports'} value={stats.reports} icon="🚨" color="#ef4444" />
                    <AdminStatCard label={lang==='ar'?'تذاكر مفتوحة':'Open Tickets'} value={stats.tickets} icon="🎫" color="#f59e0b" />
                </div>
            )}
            
            <div style={{ marginTop:'24px', padding:'16px', borderRadius:'12px', background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.1)' }}>
                <div style={{ fontSize:'11px', fontWeight:700, color:'#3b82f6', marginBottom:'8px' }}>🚀 {lang==='ar'?'إرشادات سريعة':'Quick Guide'}</div>
                <ul style={{ margin:0, padding:'0 0 0 16px', fontSize:'11px', color:'#9ca3af', lineHeight:1.6 }}>
                    <li>{lang==='ar'?'استخدم تبويب "المستخدمين" للبحث عن ID معين أو الحظر.':'Use "Users" tab to search specific ID or ban.'}</li>
                    <li>{lang==='ar'?'البلاغات تحتاج لمراجعة سريعة للحفاظ على سلامة المجتمع.':'Reports need quick review to keep community safe.'}</li>
                    <li>{lang==='ar'?'لا تقم برفع الحظر عن أحد إلا بعد التأكد من السبب.':'Do not unban unless you verified the reason.'}</li>
                </ul>
            </div>
        </div>
    );
};

window.OverviewSection = OverviewSection;
})();
