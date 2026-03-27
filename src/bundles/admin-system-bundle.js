(function() {
    "use strict";

    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\components\admin\AdminUtils.js ---

(function() {
    var { useState, useEffect, useMemo, useRef } = React;
var logStaffAction = async (staffUID, staffName, action, targetUID = null, targetName = null, details = '') => {
    try {
        await db.collection('staff_logs').add({
            staffUID,
            staffName,
            action,
            targetUID,
            targetName,
            details,
            timestamp: TS()
        });
    } catch(e) { console.error('[StaffLog] Error:', e); }
};

window.logStaffAction = logStaffAction;
})();


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\components\admin\AdminStatCard.js ---

(function() {
    var { useState, useEffect, useMemo, useRef } = React;

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


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\components\admin\AdminOverview.js ---

(function() {
    var { useState, useEffect, useMemo, useRef } = React;

var OverviewSection = ({ lang }) => {
    var [stats, setStats] = useState({ users:0, today:0, reports:0, tickets:0 });
    var [loading, setLoading] = useState(true);

    useEffect(() => {
        var fetchStats = async () => {
            try {
                var u = await usersCollection.count().get();
                var r = await reportsCollection.where('resolved','==',false).count().get();
                var t = await ticketsCollection.where('status','==','open').count().get();
                
                var today = new Date();
                today.setHours(0,0,0,0);
                var td = await usersCollection.where('createdAt','>=',firebase.firestore.Timestamp.fromDate(today)).count().get();

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


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\components\admin\UserManagementSection.js ---

(function() {
    var { useState, useEffect, useMemo, useRef } = React;

var UserManagementSection = ({ currentUser, currentUserData, lang, onNotification }) => {
    var [searchTerm, setSearchTerm] = useState('');
    var [searchResult, setSearchResult] = useState(null);
    var [searching, setSearching] = useState(false);
    var [processing, setProcessing] = useState(false);

    var handleSearch = async (e) => {
        e.preventDefault();
        var tid = searchTerm.trim();
        if (!tid) return;
        setSearching(true); setSearchResult(null);
        try {
            var snap = await usersCollection.where('uid', '==', tid).limit(1).get();
            if (snap.empty) {
                var snap2 = await usersCollection.where('displayName', '==', tid).limit(1).get();
                if (!snap2.empty) setSearchResult({ id: snap2.docs[0].id, ...snap2.docs[0].data() });
            } else {
                setSearchResult({ id: snap.docs[0].id, ...snap.docs[0].data() });
            }
        } catch(e) {}
        setSearching(false);
    };

    var handleUnban = async () => {
        if (!searchResult || processing) return;
        setProcessing(true);
        try {
            await usersCollection.doc(searchResult.id).update({
                'ban.isBanned': false,
                'ban.unbannedBy': currentUser.uid,
                'ban.unbannedAt': TS()
            });
            setSearchResult({ ...searchResult, ban: { ...searchResult.ban, isBanned: false } });
            onNotification('✅ User unbanned');
        } catch(e) { onNotification('❌ Error'); }
        setProcessing(false);
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#3b82f6', marginBottom:'16px' }}>
                🔍 {lang==='ar'?'البحث والإدارة':'Search & Manage Users'}
            </div>
            <form onSubmit={handleSearch} style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
                <input className="input-dark" style={{ flex:1, padding:'10px', borderRadius:'10px', fontSize:'13px' }}
                    placeholder={lang==='ar'?'ابحث بـ UID أو الإسم...':'Search by UID or Name...'}
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <button type="submit" disabled={searching} className="btn-neon" style={{ padding:'0 20px' }}>
                    {searching ? '⏳' : (lang==='ar'?'بحث':'Search')}
                </button>
            </form>

            {searchResult && (
                <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'16px', padding:'20px', textAlign:'center' }}>
                    <img src={searchResult.photoURL || 'https://via.placeholder.com/80'} style={{ width:'80px', height:'80px', borderRadius:'50%', marginBottom:'12px', border:'3px solid #3b82f6' }} />
                    <div style={{ fontSize:'16px', fontWeight:800 }}>{searchResult.displayName}</div>
                    <div style={{ fontSize:'12px', color:'#6b7280', marginBottom:'15px' }}>{searchResult.uid}</div>
                    
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px' }}>
                        <div style={{ background:'rgba(255,255,255,0.02)', padding:'10px', borderRadius:'10px' }}>
                            <div style={{ fontSize:'10px', color:'#6b7280' }}>{lang==='ar'?'الذهب':'Gold'}</div>
                            <div style={{ fontSize:'14px', fontWeight:700, color:'#f59e0b' }}>{searchResult.gold || 0}</div>
                        </div>
                        <div style={{ background:'rgba(255,255,255,0.02)', padding:'10px', borderRadius:'10px' }}>
                            <div style={{ fontSize:'10px', color:'#6b7280' }}>{lang==='ar'?'المستوى':'Level'}</div>
                            <div style={{ fontSize:'14px', fontWeight:700, color:'#3b82f6' }}>{searchResult.level || 1}</div>
                        </div>
                    </div>

                    {searchResult.ban?.isBanned ? (
                        <div style={{ padding:'12px', borderRadius:'10px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', marginBottom:'12px' }}>
                            <div style={{ fontSize:'11px', color:'#ef4444', fontWeight:700 }}>⛔ {lang==='ar'?'هذا المستخدم محظور!':'User is Banned!'}</div>
                            <div style={{ fontSize:'10px', color:'#6b7280', marginTop:'4px' }}>{lang==='ar'?'السبب:':'Reason:'} {searchResult.ban.reason}</div>
                            <button onClick={handleUnban} disabled={processing}
                                className="btn-neon" style={{ marginTop:'10px', width:'100%', padding:'8px' }}>
                                {processing ? '⏳' : `✅ ${lang==='ar'?'رفع الحظر':'Unban User'}`}
                            </button>
                        </div>
                    ) : (
                        <div style={{ fontSize:'11px', color:'#10b981' }}>🟢 {lang==='ar'?'حساب نشط ومفعل':'Active Account'}</div>
                    )}
                </div>
            )}
        </div>
    );
};

window.UserManagementSection = UserManagementSection;
})();


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\components\admin\BroadcastSection.js ---

(function() {
    var { useState, useEffect, useMemo, useRef } = React;

var BroadcastSection = ({ currentUser, currentUserData, lang, onNotification }) => {
    var [msg, setMsg] = useState('');
    var [msgAr, setMsgAr] = useState('');
    var [sending, setSending] = useState(false);
    var [sent, setSent] = useState(0);

    var handleBroadcast = async () => {
        var text = lang==='ar' ? msgAr : msg;
        if (!text.trim() || !currentUser) return;
        setSending(true);
        try {
            var usersSnap = await usersCollection.limit(500).get();
            var batch = db.batch();
            var count = 0;
            usersSnap.docs.forEach(doc => {
                var ref = notificationsCollection.doc();
                batch.set(ref, {
                    toUserId: doc.id,
                    type: 'system_broadcast',
                    message_en: msg || text,
                    message_ar: msgAr || text,
                    message: text,
                    fromName: lang==='ar'?'فريق PRO SPY':'PRO SPY Team',
                    icon: '📢',
                    read: false,
                    timestamp: TS()
                });
                count++;
            });
            await batch.commit();
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'BROADCAST', null, null, `Sent to ${count} users: ${text.slice(0,100)}`);
            setSent(count);
            setMsg(''); setMsgAr('');
            onNotification(`✅ ${lang==='ar'?`تم الإرسال لـ ${count} مستخدم`:`Sent to ${count} users`}`);
        } catch(e) { onNotification('❌ Error'); }
        setSending(false);
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#f59e0b', marginBottom:'16px' }}>
                📢 {lang==='ar'?'إشعار جماعي':'Broadcast Notification'}
            </div>
            <div style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'12px', padding:'14px' }}>
                <textarea className="input-dark" style={{ width:'100%', padding:'8px 12px', borderRadius:'8px', fontSize:'12px', minHeight:'70px', resize:'vertical', marginBottom:'8px' }}
                    placeholder="Message (EN)"
                    value={msg} onChange={e => setMsg(e.target.value)} />
                <textarea className="input-dark" style={{ width:'100%', padding:'8px 12px', borderRadius:'8px', fontSize:'12px', minHeight:'70px', resize:'vertical', marginBottom:'10px', direction:'rtl' }}
                    placeholder="الرسالة (عربي)"
                    value={msgAr} onChange={e => setMsgAr(e.target.value)} />
                <button onClick={handleBroadcast} disabled={sending || (!msg.trim() && !msgAr.trim())}
                    style={{ width:'100%', padding:'9px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer',
                        background:'linear-gradient(135deg,rgba(245,158,11,0.3),rgba(217,119,6,0.2))',
                        border:'1px solid rgba(245,158,11,0.5)', color:'#f59e0b', opacity:sending?0.5:1 }}>
                    {sending ? '⏳ Sending...' : `📢 ${lang==='ar'?'إرسال للجميع':'Send to All'}`}
                </button>
                {sent > 0 && <div style={{fontSize:'11px',color:'#10b981',textAlign:'center',marginTop:'8px'}}>✅ Sent to {sent} users</div>}
            </div>
        </div>
    );
};

window.BroadcastSection = BroadcastSection;
})();


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\components\admin\ActivityLogSection.js ---

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
        var unsub = db.collection('staff_logs').orderBy('timestamp', 'desc').limit(50).onSnapshot(snap => {
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


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\components\admin\BanPanelInline.js ---

(function() {
    var { useState, useEffect, useMemo, useRef } = React;

var BanPanelInline = ({ reportedUID, reportedName, reportId, currentUser, currentUserData, lang, onDone, onCancel }) => {
    var [banReason, setBanReason]     = useState('');
    var [banDuration, setBanDuration] = useState('7d');
    var [banning, setBanning]         = useState(false);

    var durations = [
        { val:'1d',   ar:'يوم واحد',   en:'1 Day'    },
        { val:'3d',   ar:'3 أيام',     en:'3 Days'   },
        { val:'7d',   ar:'أسبوع',      en:'1 Week'   },
        { val:'30d',  ar:'شهر',        en:'1 Month'  },
        { val:'perm', ar:'دائم',       en:'Permanent'},
    ];

    var handleBan = async () => {
        if (!banReason.trim()) return;
        setBanning(true);
        try {
            var expiresAt = null;
            if (banDuration !== 'perm') {
                var days = parseInt(banDuration);
                expiresAt = new Date(Date.now() + days * 864e5);
            }
            await usersCollection.doc(reportedUID).update({
                ban: {
                    isBanned:  true,
                    bannedBy:  currentUser.uid,
                    bannedByName: currentUserData?.displayName || 'Admin',
                    reason:    banReason.trim(),
                    expiresAt: expiresAt ? firebase.firestore.Timestamp.fromDate(expiresAt) : null,
                    bannedAt:  TS(),
                    permanent: banDuration === 'perm',
                }
            });
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'BAN_USER',
                reportedUID, reportedName,
                `Reason: ${banReason} | Duration: ${banDuration} | From report: ${reportId}`
            );
            // Mark report as resolved
            if (reportId) {
                var reportDoc = await reportsCollection.doc(reportId).get().catch(()=>null);
                if (reportDoc && reportDoc.exists) {
                    var reporterUID = reportDoc.data()?.reporterUID;
                    await reportsCollection.doc(reportId).update({ resolved: true, resolvedAt: TS() }).catch(()=>{});
                    // Send detective bot message to reporter
                    if (reporterUID && typeof botChatsCollection !== 'undefined') {
                        var durLabel = banDuration === 'perm'
                            ? (lang==='ar'?'حظر دائم':'permanent ban')
                            : `${banDuration} ${lang==='ar'?'يوم':'day ban'}`;
                        await botChatsCollection.add({
                            botId: 'detective_bot',
                            toUserId: reporterUID,
                            type: 'report_resolved',
                            message: lang==='ar'
                                ? `🕵️ تم مراجعة بلاغك ضد "${reportedName}".\n✅ الإجراء: ${durLabel}\nالسبب: ${banReason}\n\nشكراً لمساعدتنا في الحفاظ على سلامة المجتمع.`
                                : `🕵️ Your report against "${reportedName}" has been reviewed.\n✅ Action taken: ${durLabel}\nReason: ${banReason}\n\nThank you for keeping the community safe.`,
                            fromName: null,
                            fromPhoto: null,
                            timestamp: TS(),
                            read: false,
                        }).catch(()=>{});
                    }
                }
            }
            onDone(`🔨 ${lang==='ar'?`تم حظر ${reportedName}`:`${reportedName} banned`}`);
        } catch(e) {
            onDone('❌ Error banning user');
        }
        setBanning(false);
    };

    return (
        <div style={{ background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'10px', padding:'12px', marginTop:'8px' }}>
            <div style={{ fontSize:'11px', color:'#ef4444', fontWeight:700, marginBottom:'10px' }}>
                🔨 {lang==='ar'?`حظر ${reportedName}`:`Ban ${reportedName}`}
            </div>
            {/* Duration */}
            <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'5px' }}>{lang==='ar'?'مدة الحظر:':'Duration:'}</div>
            <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', marginBottom:'8px' }}>
                {durations.map(d => (
                    <button key={d.val} onClick={() => setBanDuration(d.val)}
                        style={{ padding:'4px 9px', borderRadius:'5px', fontSize:'10px', cursor:'pointer', fontWeight:banDuration===d.val?700:400,
                            background:banDuration===d.val?'rgba(239,68,68,0.25)':'rgba(255,255,255,0.05)',
                            border:banDuration===d.val?'1px solid rgba(239,68,68,0.5)':'1px solid rgba(255,255,255,0.1)',
                            color:banDuration===d.val?'#ef4444':'#9ca3af' }}>
                        {lang==='ar'?d.ar:d.en}
                    </button>
                ))}
            </div>
            {/* Reason */}
            <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'5px' }}>{lang==='ar'?'سبب الحظر:':'Ban reason:'}</div>
            <input className="input-dark"
                style={{ width:'100%', padding:'7px 10px', borderRadius:'6px', fontSize:'11px', marginBottom:'8px' }}
                placeholder={lang==='ar'?'اكتب سبب الحظر...':'Enter ban reason...'}
                value={banReason} onChange={e => setBanReason(e.target.value)} />
            <div style={{ display:'flex', gap:'6px' }}>
                <button onClick={handleBan} disabled={banning || !banReason.trim()}
                    style={{ flex:1, padding:'6px', borderRadius:'6px', fontSize:'11px', cursor:'pointer', fontWeight:700,
                        background:'rgba(239,68,68,0.25)', border:'1px solid rgba(239,68,68,0.5)', color:'#ef4444',
                        opacity:banReason.trim()?1:0.4 }}>
                    {banning?'⏳':`🔨 ${lang==='ar'?'تأكيد الحظر':'Confirm Ban'}`}
                </button>
                <button onClick={onCancel}
                    style={{ padding:'6px 10px', borderRadius:'6px', fontSize:'11px', cursor:'pointer',
                        background:'rgba(107,114,128,0.15)', border:'1px solid rgba(107,114,128,0.3)', color:'#9ca3af' }}>
                    ✕
                </button>
            </div>
        </div>
    );
};

window.BanPanelInline = BanPanelInline;
})();


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\components\admin\ReportsSection.js ---

(function() {
    var { useState, useEffect, useMemo, useRef } = React;

var ReportsSection = ({ currentUser, currentUserData, lang, onNotification, onOpenProfile }) => {
    var [reports, setReports]           = useState([]);
    var [loading, setLoading]           = useState(true);
    var [filter, setFilter]             = useState('open');
    var [escalating, setEscalating]     = useState(null);
    var [escalateNote, setEscalateNote] = useState('');
    var [staffList, setStaffList]       = useState([]);
    var [selectedEscalateTo, setSelectedEscalateTo] = useState('');
    var [banningUID, setBanningUID]     = useState(null); // report.id of the one being banned

    var myRole = getUserRole(currentUserData, currentUser?.uid);

    useEffect(() => {
        var unsubscribed = false;

        var sortReports = (data) => {
            return data.sort((a, b) => {
                var ta = a.createdAt?.toMillis?.() || a.timestamp?.toMillis?.()
                         || (a.createdAt?.seconds  * 1000) || (a.timestamp?.seconds  * 1000) || 0;
                var tb = b.createdAt?.toMillis?.() || b.timestamp?.toMillis?.()
                         || (b.createdAt?.seconds  * 1000) || (b.timestamp?.seconds  * 1000) || 0;
                return tb - ta;
            });
        };

        var unsub;
        try {
            unsub = reportsCollection.limit(200).onSnapshot(
                snap => {
                    if (unsubscribed) return;
                    setReports(sortReports(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
                    setLoading(false);
                },
                async (err) => {
                    console.warn('[Reports] onSnapshot failed, falling back to get():', err?.message);
                    try {
                        var snap = await reportsCollection.limit(200).get();
                        if (!unsubscribed) {
                            setReports(sortReports(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
                            setLoading(false);
                        }
                    } catch (e2) {
                        console.error('[Reports] get() also failed:', e2?.message);
                        if (!unsubscribed) setLoading(false);
                    }
                }
            );
        } catch (e) {
            console.error('[Reports] Failed to init listener:', e?.message);
            setLoading(false);
        }

        return () => {
            unsubscribed = true;
            if (unsub) unsub();
        };
    }, []);

    useEffect(() => {
        if (myRole === 'moderator') {
            usersCollection.where('role', 'in', ['admin','owner']).get().then(snap => {
                setStaffList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            });
        }
    }, [myRole]);

    var resolveReport = async (id, targetUID, targetName) => {
        try {
            await reportsCollection.doc(id).update({ resolved: true, resolvedAt: TS() });
            await logStaffAction(currentUser.uid, currentUserData?.displayName, 'RESOLVE_REPORT', targetUID, targetName, `Report ID: ${id}`);
            onNotification('✅ Resolved');
        } catch(e) { onNotification('❌ Error'); }
    };

    var handleEscalate = async (report) => {
        if (!selectedEscalateTo || !escalateNote.trim()) return;
        try {
            await reportsCollection.doc(report.id).update({
                escalated: true,
                escalatedTo: selectedEscalateTo,
                escalateNote: escalateNote.trim(),
                escalatedAt: TS(),
                escalatedBy: currentUser.uid,
                escalatedByName: currentUserData?.displayName || 'Mod'
            });
            onNotification('🚀 Escalated to Admin');
            setEscalating(null);
            setEscalateNote('');
        } catch(e) { onNotification('❌ Error'); }
    };

    var filtered = reports.filter(r => {
        if (filter === 'open') return !r.resolved && !r.escalated;
        if (filter === 'escalated') return r.escalated && !r.resolved;
        return r.resolved;
    });

    return (
        <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'#ef4444' }}>🚨 {lang==='ar'?'البلاغات':'Reports List'}</div>
                <div style={{ display:'flex', gap:'4px' }}>
                    {['open', 'escalated', 'resolved'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            style={{ padding:'4px 8px', borderRadius:'6px', fontSize:'10px', cursor:'pointer', border:'none',
                                background:filter===f?'#ef4444':'rgba(255,255,255,0.05)',
                                color:filter===f?'#fff':'#9ca3af' }}>
                            {lang==='ar' ? (f==='open'?'مفتوحة':f==='escalated'?'مُصعدة':'محلولة') : f.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? <div style={{textAlign:'center',padding:'20px'}}>⏳</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {filtered.length === 0 && <div style={{textAlign:'center',padding:'40px',color:'#6b7280',fontSize:'12px'}}>{lang==='ar'?'لا توجد بلاغات':'No reports found'}</div>}
                    {filtered.map(r => (
                        <div key={r.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'12px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                    <div style={{ background:'rgba(239,68,68,0.2)', color:'#ef4444', padding:'3px 7px', borderRadius:'5px', fontSize:'9px', fontWeight:800 }}>{r.category?.toUpperCase()}</div>
                                    <span style={{ fontSize:'10px', color:'#9ca3af' }}>{r.createdAt?.toDate?.() ? r.createdAt.toDate().toLocaleString() : ''}</span>
                                </div>
                                <div style={{ fontSize:'10px', color:'#6b7280' }}>ID: {r.id?.slice(-5)}</div>
                            </div>
                            
                            <div style={{ display:'flex', gap:'10px', marginBottom:'12px' }}>
                                <div style={{ flex:1, padding:'10px', background:'rgba(255,255,255,0.02)', borderRadius:'10px' }}>
                                    <div style={{ fontSize:'9px', color:'#6b7280', marginBottom:'4px' }}>{lang==='ar'?'المُبلِغ':'Reporter'}</div>
                                    <div onClick={() => onOpenProfile(r.reporterUID)} style={{ fontSize:'11px', fontWeight:700, cursor:'pointer', color:'#3b82f6' }}>{r.reporterName || 'Anonymous'}</div>
                                    <div style={{ fontSize:'9px', color:'#4b5563' }}>{r.reporterUID?.slice(0,8)}</div>
                                </div>
                                <div style={{ flex:1, padding:'10px', background:'rgba(255,255,255,0.02)', borderRadius:'10px' }}>
                                    <div style={{ fontSize:'9px', color:'#ef4444', marginBottom:'4px' }}>{lang==='ar'?'المُبلَغ عنه':'Reported User'}</div>
                                    <div onClick={() => onOpenProfile(r.reportedUID)} style={{ fontSize:'11px', fontWeight:700, cursor:'pointer', color:'#ef4444' }}>{r.reportedName || 'User'}</div>
                                    <div style={{ fontSize:'9px', color:'#4b5563' }}>{r.reportedUID?.slice(0,8)}</div>
                                </div>
                            </div>

                            <div style={{ background:'rgba(255,255,255,0.02)', padding:'10px', borderRadius:'10px', marginBottom:'12px' }}>
                                <div style={{ fontSize:'10px', color:'#9ca3af', marginBottom:'4px' }}>{lang==='ar'?'الوصف:':'Reason/Description:'}</div>
                                <div style={{ fontSize:'12px', color:'#d1d5db', lineHeight:1.4 }}>{r.reason || r.description}</div>
                                {r.evidenceUrl && <img src={r.evidenceUrl} style={{ width:'100%', borderRadius:'8px', marginTop:'8px', cursor:'pointer' }} onClick={() => window.open(r.evidenceUrl)} />}
                            </div>

                            {r.escalated && !r.resolved && (
                                <div style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', padding:'10px', borderRadius:'8px', marginBottom:'12px' }}>
                                    <div style={{ fontSize:'10px', fontWeight:700, color:'#f59e0b' }}>⚠️ {lang==='ar'?'تم تصعيده بواسطة:':'Escalated by:'} {r.escalatedByName}</div>
                                    <div style={{ fontSize:'10px', color:'#d1d5db', marginTop:'2px' }}>{r.escalateNote}</div>
                                </div>
                            )}

                            {!r.resolved && (
                                <>
                                    {banningUID === r.id ? (
                                        <window.BanPanelInline 
                                            reportedUID={r.reportedUID}
                                            reportedName={r.reportedName}
                                            reportId={r.id}
                                            currentUser={currentUser}
                                            currentUserData={currentUserData}
                                            lang={lang}
                                            onDone={(msg) => { setBanningUID(null); onNotification(msg); }}
                                            onCancel={() => setBanningUID(null)}
                                        />
                                    ) : escalating === r.id ? (
                                        <div style={{ background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.2)', padding:'12px', borderRadius:'10px', marginTop:'8px' }}>
                                            <div style={{ fontSize:'11px', color:'#8b5cf6', fontWeight:700, marginBottom:'8px' }}>🚀 {lang==='ar'?'تصعيد للإدارة الأعلى':'Escalate to Admin'}</div>
                                            <select className="input-dark" style={{ width:'100%', marginBottom:'8px', fontSize:'11px' }} value={selectedEscalateTo} onChange={e=>setSelectedEscalateTo(e.target.value)}>
                                                <option value="">{lang==='ar'?'اختر المدير...':'Select Admin...'}</option>
                                                {staffList.map(s => <option key={s.uid} value={s.uid}>{s.displayName} ({s.role})</option>)}
                                            </select>
                                            <textarea className="input-dark" style={{ width:'100%', padding:'8px', borderRadius:'8px', fontSize:'11px', minHeight:'60px', marginBottom:'8px' }} 
                                                placeholder={lang==='ar'?'سبب التصعيد...':'Reason for escalation...'} value={escalateNote} onChange={e=>setEscalateNote(e.target.value)} />
                                            <div style={{ display:'flex', gap:'6px' }}>
                                                <button onClick={()=>handleEscalate(r)} style={{ flex:1, padding:'6px', background:'#8b5cf6', color:'#fff', borderRadius:'6px', border:'none', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>{lang==='ar'?'إرسال':'Submit'}</button>
                                                <button onClick={()=>setEscalating(null)} style={{ padding:'6px 12px', background:'rgba(255,255,255,0.1)', color:'#fff', borderRadius:'6px', border:'none', fontSize:'11px', cursor:'pointer' }}>✕</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display:'flex', gap:'8px' }}>
                                            <button onClick={() => setBanningUID(r.id)} 
                                                style={{ flex:1, background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444', padding:'8px', borderRadius:'8px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                                                🔨 {lang==='ar'?'حظر':'Ban'}
                                            </button>
                                            <button onClick={() => resolveReport(r.id, r.reportedUID, r.reportedName)}
                                                style={{ flex:1, background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', color:'#10b981', padding:'8px', borderRadius:'8px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                                                ✅ {lang==='ar'?'تجاهل':'Dismiss'}
                                            </button>
                                            {myRole === 'moderator' && !r.escalated && (
                                                <button onClick={() => setEscalating(r.id)}
                                                    style={{ background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.3)', color:'#8b5cf6', padding:'8px 12px', borderRadius:'8px', fontSize:'11px', cursor:'pointer' }}>
                                                    🚀
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

window.ReportsSection = ReportsSection;
})();


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\components\admin\TicketsSection.js ---

(function() {
    var { useState, useEffect, useMemo, useRef } = React;

var TicketsSection = ({ currentUser, currentUserData, lang, onNotification, onOpenProfile }) => {
    var [tickets, setTickets] = useState([]);
    var [loading, setLoading] = useState(true);
    var [filter, setFilter] = useState('open');
    var [replyingTo, setReplyingTo] = useState(null);
    var [replyText, setReplyText] = useState('');
    var [banningUID, setBanningUID] = useState(null); // ticket.id of the one being banned

    useEffect(() => {
        var unsub = ticketsCollection.orderBy('createdAt', 'desc').limit(100).onSnapshot(snap => {
            setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, []);

    var sendMessage = async (ticket) => {
        if (!replyText.trim()) return;
        try {
            var msg = {
                senderId: currentUser.uid,
                senderName: currentUserData?.displayName || 'Support',
                text: replyText.trim(),
                timestamp: TS()
            };
            await ticketsCollection.doc(ticket.id).update({
                messages: firebase.firestore.FieldValue.arrayUnion(msg),
                status: 'replied',
                updatedAt: TS(),
                lastMessageBy: currentUser.uid
            });
            onNotification('✅ Reply sent');
            setReplyingTo(null);
            setReplyText('');
        } catch(e) { onNotification('❌ Error'); }
    };

    var closeTicket = async (id) => {
        try {
            await ticketsCollection.doc(id).update({ status: 'closed', closedAt: TS() });
            onNotification('✅ Ticket closed');
        } catch(e) { onNotification('❌ Error'); }
    };

    var filtered = tickets.filter(t => {
        if (filter === 'open') return t.status === 'open' || t.status === 'replied';
        return t.status === 'closed';
    });

    return (
        <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'#f59e0b' }}>🎫 {lang==='ar'?'تذاكر الدعم':'Support Tickets'}</div>
                <div style={{ display:'flex', gap:'4px' }}>
                    {['open', 'closed'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            style={{ padding:'4px 10px', borderRadius:'6px', fontSize:'10px', cursor:'pointer', border:'none',
                                background:filter===f?'#f59e0b':'rgba(255,255,255,0.05)',
                                color:filter===f?'#000':'#9ca3af' }}>
                            {lang==='ar' ? (f==='open'?'مفتوحة':'مغلقة') : f.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? <div style={{textAlign:'center',padding:'20px'}}>⏳</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {filtered.length === 0 && <div style={{textAlign:'center',padding:'40px',color:'#6b7280',fontSize:'12px'}}>{lang==='ar'?'لا توجد تذاكر':'No tickets found'}</div>}
                    {filtered.map(t => (
                        <div key={t.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'12px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                    <div onClick={() => onOpenProfile(t.userId)} style={{ fontSize:'11px', fontWeight:700, cursor:'pointer', color:'#f59e0b' }}>{t.userName || 'User'}</div>
                                    <span style={{ fontSize:'10px', color:'#9ca3af' }}>{t.createdAt?.toDate?.() ? t.createdAt.toDate().toLocaleString() : ''}</span>
                                </div>
                                <div style={{ fontSize:'10px', color:'#6b7280' }}>ID: {t.id?.slice(-5)}</div>
                            </div>

                            <div style={{ background:'rgba(255,255,255,0.02)', padding:'10px', borderRadius:'10px', marginBottom:'12px' }}>
                                <div style={{ fontSize:'12px', color:'#d1d5db', lineHeight:1.4 }}>{t.subject}</div>
                                {t.messages?.map((m, idx) => (
                                    <div key={idx} style={{ marginTop:'8px', padding:'8px', borderRadius:'8px', background:m.senderId===t.userId?'rgba(255,255,255,0.05)':'rgba(245,158,11,0.1)', marginLeft:m.senderId===t.userId?'0':'20px', marginRight:m.senderId===t.userId?'20px':'0' }}>
                                        <div style={{ fontSize:'9px', color:'#6b7280', marginBottom:'2px' }}>{m.senderName} • {m.timestamp?.toDate?.() ? m.timestamp.toDate().toLocaleTimeString() : ''}</div>
                                        <div style={{ fontSize:'11px', color:'#e5e7eb' }}>{m.text}</div>
                                    </div>
                                ))}
                            </div>

                            {!t.status || t.status !== 'closed' ? (
                                <>
                                    {banningUID === t.id ? (
                                        <window.BanPanelInline 
                                            reportedUID={t.userId}
                                            reportedName={t.userName}
                                            reportId={null}
                                            currentUser={currentUser}
                                            currentUserData={currentUserData}
                                            lang={lang}
                                            onDone={(msg) => { setBanningUID(null); onNotification(msg); }}
                                            onCancel={() => setBanningUID(null)}
                                        />
                                    ) : replyingTo === t.id ? (
                                        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                                            <textarea className="input-dark" style={{ width:'100%', padding:'8px', borderRadius:'8px', fontSize:'12px', minHeight:'60px' }} 
                                                placeholder={lang==='ar'?'اكتب ردك هنا...':'Type your reply...'} value={replyText} onChange={e=>setReplyText(e.target.value)} />
                                            <div style={{ display:'flex', gap:'6px' }}>
                                                <button onClick={()=>sendMessage(t)} style={{ flex:1, padding:'6px', background:'#f59e0b', color:'#000', borderRadius:'6px', border:'none', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>{lang==='ar'?'إرسال الرد':'Send Reply'}</button>
                                                <button onClick={()=>setReplyingTo(null)} style={{ padding:'6px 12px', background:'rgba(255,255,255,0.1)', color:'#fff', borderRadius:'6px', border:'none', fontSize:'11px', cursor:'pointer' }}>✕</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display:'flex', gap:'8px' }}>
                                            <button onClick={() => setReplyingTo(t.id)} 
                                                style={{ flex:1, background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)', color:'#f59e0b', padding:'8px', borderRadius:'8px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                                                💬 {lang==='ar'?'رد':'Reply'}
                                            </button>
                                            <button onClick={() => closeTicket(t.id)}
                                                style={{ flex:1, background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', color:'#10b981', padding:'8px', borderRadius:'8px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                                                ✅ {lang==='ar'?'إغلاق التذكرة':'Close'}
                                            </button>
                                            <button onClick={() => setBanningUID(t.id)}
                                                style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444', padding:'8px 12px', borderRadius:'8px', fontSize:'11px', cursor:'pointer' }}>
                                                🔨
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{ fontSize:'10px', color:'#10b981', textAlign:'center', fontWeight:700 }}>✅ {lang==='ar'?'هذه التذكرة مغلقة':'This ticket is closed'}</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

window.TicketsSection = TicketsSection;
})();


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\components\admin\MomentsModerationSection.js ---

(function() {
    var { useState, useEffect, useMemo, useRef } = React;

var MomentsModerationSection = ({ currentUser, currentUserData, lang, onNotification, onOpenProfile }) => {
    var [moments, setMoments] = useState([]);
    var [loading, setLoading] = useState(true);
    var [banningUID, setBanningUID] = useState(null); // moment.id of the one being banned

    useEffect(() => {
        var unsub = momentsCollection.orderBy('timestamp', 'desc').limit(50).onSnapshot(snap => {
            setMoments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, []);

    var toggleHideMoment = async (id, currentHidden) => {
        try {
            await momentsCollection.doc(id).update({ hidden: !currentHidden });
            onNotification(`✅ ${!currentHidden ? 'Moment Hidden' : 'Moment Restored'}`);
        } catch(e) { onNotification('❌ Error'); }
    };

    var deleteMoment = async (id) => {
        if(!confirm(lang==='ar'?'حذف هذا المنشور نهائياً؟':'Delete this moment permanently?')) return;
        try {
            await momentsCollection.doc(id).delete();
            onNotification('✅ Success');
        } catch(e) { onNotification('❌ Error'); }
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#8b5cf6', marginBottom:'16px' }}>
                📸 {lang==='ar'?'مراجعة اللحظات':'Moments Moderation'}
            </div>
            {loading ? <div style={{textAlign:'center',padding:'20px'}}>⏳</div> : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'12px' }}>
                    {moments.map(m => (
                        <div key={m.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'10px', opacity:m.hidden?0.5:1 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                                <img src={m.userPhoto || 'https://via.placeholder.com/30'} style={{ width:'24px', height:'24px', borderRadius:'50%' }} />
                                <div style={{ fontSize:'10px', fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flex:1 }}>{m.userName}</div>
                                {m.hidden && <span style={{ fontSize:'9px', color:'#ef4444' }}>[HIDDEN]</span>}
                            </div>
                            
                            {m.imageUrl ? (
                                <img src={m.imageUrl} style={{ width:'100%', aspectRatio:'1', borderRadius:'8px', objectFit:'cover', marginBottom:'8px', cursor:'pointer' }} onClick={() => window.open(m.imageUrl)} />
                            ) : (
                                <div style={{ background:'rgba(255,255,255,0.05)', padding:'8px', borderRadius:'8px', fontSize:'10px', color:'#9ca3af', minHeight:'60px', marginBottom:'8px' }}>{m.text}</div>
                            )}

                            {banningUID === m.id ? (
                                <window.BanPanelInline 
                                    reportedUID={m.userId}
                                    reportedName={m.userName}
                                    reportId={null}
                                    currentUser={currentUser}
                                    currentUserData={currentUserData}
                                    lang={lang}
                                    onDone={(msg) => { setBanningUID(null); onNotification(msg); }}
                                    onCancel={() => setBanningUID(null)}
                                />
                            ) : (
                                <div style={{ display:'flex', gap:'5px' }}>
                                    <button onClick={() => toggleHideMoment(m.id, m.hidden)} 
                                        style={{ flex:1, padding:'5px', borderRadius:'6px', border:'none', fontSize:'10px', cursor:'pointer', background:'rgba(245,158,11,0.2)', color:'#f59e0b' }}>
                                        {m.hidden ? '👁️' : '🚫'}
                                    </button>
                                    <button onClick={() => deleteMoment(m.id)} 
                                        style={{ flex:1, padding:'5px', borderRadius:'6px', border:'none', fontSize:'10px', cursor:'pointer', background:'rgba(239,68,68,0.2)', color:'#ef4444' }}>
                                        🗑️
                                    </button>
                                    <button onClick={() => setBanningUID(m.id)} 
                                        style={{ flex:1, padding:'5px', borderRadius:'6px', border:'none', fontSize:'10px', cursor:'pointer', background:'rgba(255,255,255,0.05)', color:'#fff' }}>
                                        🔨
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

window.MomentsModerationSection = MomentsModerationSection;
})();


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\components\admin\FinancialLogSection.js ---

(function() {
    var { useState, useEffect, useMemo, useRef } = React;

var FinancialLogSection = ({ lang }) => {
    var [goldLogs, setGoldLogs] = useState([]);
    var [loading, setLoading] = useState(true);
    var [targetUID, setTargetUID] = useState('');
    var [amount, setAmount] = useState('');
    var [reason, setReason] = useState('');
    var [processing, setProcessing] = useState(false);

    useEffect(() => {
        var unsub = db.collection('gold_transactions').orderBy('timestamp', 'desc').limit(50).onSnapshot(snap => {
            setGoldLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, []);

    var handleSendGold = async () => {
        if (!targetUID || !amount || processing) return;
        setProcessing(true);
        try {
            var num = parseInt(amount);
            var userRef = usersCollection.doc(targetUID.trim());
            var userDoc = await userRef.get();
            if (!userDoc.exists) {
                alert('User not found');
                setProcessing(false);
                return;
            }

            await db.runTransaction(async (transaction) => {
                var freshDoc = await transaction.get(userRef);
                var currentGold = freshDoc.data().gold || 0;
                transaction.update(userRef, { gold: currentGold + num });
                
                var logRef = db.collection('gold_transactions').doc();
                transaction.set(logRef, {
                    userId: targetUID.trim(),
                    userName: freshDoc.data().displayName,
                    type: 'admin_adjustment',
                    amount: num,
                    reason: reason.trim() || 'Admin Adjustment',
                    timestamp: TS()
                });
            });

            onNotification('✅ Gold updated successfully');
            setTargetUID(''); setAmount(''); setReason('');
        } catch(e) { onNotification('❌ Error'); }
        setProcessing(false);
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#f59e0b', marginBottom:'16px' }}>
                💰 {lang==='ar'?'السجل المالي والهدايا':'Financial Log & Gold'}
            </div>
            
            <div style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'12px', padding:'16px', marginBottom:'20px' }}>
                <div style={{ fontSize:'11px', fontWeight:700, color:'#f59e0b', marginBottom:'10px' }}>🎁 {lang==='ar'?'إرسال ذهب لمستخدم':'Send Gold to User'}</div>
                <div style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
                    <input className="input-dark" style={{ flex:1.5, padding:'8px', fontSize:'11px' }} placeholder="Target UID" value={targetUID} onChange={e=>setTargetUID(e.target.value)} />
                    <input className="input-dark" style={{ flex:1, padding:'8px', fontSize:'11px' }} placeholder="Amount" type="number" value={amount} onChange={e=>setAmount(e.target.value)} />
                </div>
                <input className="input-dark" style={{ width:'100%', padding:'8px', fontSize:'11px', marginBottom:'10px' }} placeholder="Reason (Optional)" value={reason} onChange={e=>setReason(e.target.value)} />
                <button onClick={handleSendGold} disabled={processing || !targetUID || !amount}
                    className="btn-neon" style={{ width:'100%', padding:'10px', fontSize:'12px', fontWeight:700 }}>
                    {processing ? '⏳' : `💰 ${lang==='ar'?'تعديل الرصيد':'Update Balance'}`}
                </button>
            </div>

            {loading ? <div style={{textAlign:'center',padding:'20px'}}>⏳</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:'6px', maxHeight:'40vh', overflowY:'auto' }}>
                    {goldLogs.map(log => (
                        <div key={log.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <div>
                                <div style={{ fontSize:'11px', fontWeight:700 }}>{log.userName}</div>
                                <div style={{ fontSize:'10px', color:'#6b7280' }}>{log.reason}</div>
                            </div>
                            <div style={{ textAlign:'right' }}>
                                <div style={{ fontSize:'12px', fontWeight:800, color:log.amount>=0?'#10b981':'#ef4444' }}>{log.amount >= 0 ? '+' : ''}{log.amount}</div>
                                <div style={{ fontSize:'9px', color:'#4b5563' }}>{log.timestamp?.toDate?.() ? log.timestamp.toDate().toLocaleString() : ''}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

window.FinancialLogSection = FinancialLogSection;
})();


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\components\admin\StaffManagementSection.js ---

(function() {
    var { useState, useEffect, useMemo, useRef } = React;

var StaffManagementSection = ({ currentUser, currentUserData, lang, onNotification }) => {
    var [staff, setStaff] = useState([]);
    var [loading, setLoading] = useState(true);
    var [editing, setEditing] = useState(null);
    var [newRole, setNewRole] = useState('');

    useEffect(() => {
        var unsub = usersCollection.where('role', 'in', ['moderator','admin','owner']).onSnapshot(snap => {
            setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return unsub;
    }, []);

    var updateRole = async (uid, currentRole) => {
        if (getUserRole(currentUserData, currentUser?.uid) !== 'owner') {
            onNotification('⛔ Only Owners can change roles');
            return;
        }
        try {
            await usersCollection.doc(uid).update({ role: newRole });
            onNotification('✅ Role updated');
            setEditing(null);
        } catch(e) { onNotification('❌ Error'); }
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#8b5cf6', marginBottom:'16px' }}>
                🛡️ {lang==='ar'?'إدارة فريق العمل':'Staff Management'}
            </div>
            {loading ? <div style={{textAlign:'center',padding:'20px'}}>⏳</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {staff.map(s => (
                        <div key={s.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                                <img src={s.photoURL || 'https://via.placeholder.com/40'} style={{ width:'36px', height:'36px', borderRadius:'50%' }} />
                                <div>
                                    <div style={{ fontSize:'12px', fontWeight:700 }}>{s.displayName}</div>
                                    <div style={{ fontSize:'10px', color:ROLE_CONFIG[s.role]?.color || '#9ca3af' }}>{s.role?.toUpperCase()}</div>
                                </div>
                            </div>
                            
                            {getUserRole(currentUserData, currentUser?.uid) === 'owner' && s.uid !== currentUser.uid && (
                                <div style={{ display:'flex', gap:'6px' }}>
                                    {editing === s.id ? (
                                        <>
                                            <select value={newRole || s.role} onChange={e => setNewRole(e.target.value)} 
                                                className="input-dark" style={{ fontSize:'10px', padding:'4px' }}>
                                                <option value="moderator">MODERATOR</option>
                                                <option value="admin">ADMIN</option>
                                                <option value="owner">OWNER</option>
                                                <option value="user">REMOVE STAFF</option>
                                            </select>
                                            <button onClick={() => updateRole(s.id, s.role)} style={{ padding:'4px 8px', background:'#10b981', color:'#fff', borderRadius:'5px', fontSize:'10px', border:'none', cursor:'pointer' }}>💾</button>
                                            <button onClick={() => setEditing(null)} style={{ padding:'4px 8px', background:'rgba(255,255,255,0.1)', color:'#fff', borderRadius:'5px', fontSize:'10px', border:'none', cursor:'pointer' }}>✕</button>
                                        </>
                                    ) : (
                                        <button onClick={() => { setEditing(s.id); setNewRole(s.role); }} 
                                            className="btn-neon" style={{ padding:'5px 12px', fontSize:'10px' }}>
                                            ✏️ {lang==='ar'?'تعديل':'Edit'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

window.StaffManagementSection = StaffManagementSection;
})();


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\components\admin\FAQManagementSection.js ---

(function() {
    var { useState, useEffect, useMemo, useRef } = React;

var FAQManagementSection = ({ lang, onNotification }) => {
    var [faqs, setFaqs] = useState([]);
    var [loading, setLoading] = useState(true);
    var [newQ, setNewQ] = useState({ q_en:'', a_en:'', q_ar:'', a_ar:'', category: 'general' });

    useEffect(() => {
        var unsub = db.collection('faqs').orderBy('category').onSnapshot(snap => {
            setFaqs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return unsub;
    }, []);

    var handleAdd = async () => {
        if (!newQ.q_en || !newQ.a_en) return;
        try {
            await db.collection('faqs').add({ ...newQ, timestamp: TS() });
            setNewQ({ q_en:'', a_en:'', q_ar:'', a_ar:'', category: 'general' });
            onNotification('✅ FAQ Added');
        } catch(e) { onNotification('❌ Error'); }
    };

    var deleteFAQ = async (id) => {
        if(!confirm('Delete this FAQ?')) return;
        try {
            await db.collection('faqs').doc(id).delete();
            onNotification('✅ Deleted');
        } catch(e) { onNotification('❌ Error'); }
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#3b82f6', marginBottom:'16px' }}>
                ❓ {lang==='ar'?'إدارة الأسئلة الشائعة':'FAQ Management'}
            </div>
            
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'14px', marginBottom:'20px' }}>
                <div style={{ fontSize:'11px', fontWeight:700, color:'#3b82f6', marginBottom:'10px' }}>➕ {lang==='ar'?'إضافة سؤال جديد':'Add New FAQ'}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    <div style={{ display:'flex', gap:'8px' }}>
                        <input className="input-dark" style={{ flex:1, padding:'8px', fontSize:'11px' }} placeholder="Question (EN)" value={newQ.q_en} onChange={e=>setNewQ({...newQ, q_en:e.target.value})} />
                        <input className="input-dark" style={{ flex:1, padding:'8px', fontSize:'11px', textAlign:'right' }} placeholder="السؤال (عربي)" value={newQ.q_ar} onChange={e=>setNewQ({...newQ, q_ar:e.target.value})} />
                    </div>
                    <div style={{ display:'flex', gap:'8px' }}>
                        <textarea className="input-dark" style={{ flex:1, padding:'8px', fontSize:'11px', minHeight:'50px' }} placeholder="Answer (EN)" value={newQ.a_en} onChange={e=>setNewQ({...newQ, a_en:e.target.value})} />
                        <textarea className="input-dark" style={{ flex:1, padding:'8px', fontSize:'11px', textAlign:'right', minHeight:'50px' }} placeholder="الإجابة (عربي)" value={newQ.a_ar} onChange={e=>setNewQ({...newQ, a_ar:e.target.value})} />
                    </div>
                    <button onClick={handleAdd} className="btn-neon" style={{ padding:'10px', fontSize:'12px', fontWeight:700 }}>
                        {lang==='ar'?'إضافة السؤال':'Add FAQ'}
                    </button>
                </div>
            </div>

            {loading ? <div style={{textAlign:'center',padding:'20px'}}>⏳</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {faqs.map(f => (
                        <div key={f.id} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'10px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                                <div style={{ fontSize:'11px', fontWeight:700, color:'#3b82f6' }}>{lang==='ar'?f.q_ar:f.q_en}</div>
                                <button onClick={() => deleteFAQ(f.id)} style={{ padding:'2px 6px', background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'none', borderRadius:'4px', fontSize:'10px', cursor:'pointer' }}>🗑️</button>
                            </div>
                            <div style={{ fontSize:'10px', color:'#9ca3af', lineHeight:1.4 }}>{lang==='ar'?f.a_ar:f.a_en}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

window.FAQManagementSection = FAQManagementSection;
})();


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\components\admin\FakeProfilesSection.js ---

(function() {
    var { useState, useEffect, useMemo, useRef } = React;

var FAKE_PROFILE_PHOTOS = [
    'https://i.pravatar.cc/150?img=1','https://i.pravatar.cc/150?img=2','https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4','https://i.pravatar.cc/150?img=5','https://i.pravatar.cc/150?img=6',
    'https://i.pravatar.cc/150?img=7','https://i.pravatar.cc/150?img=8','https://i.pravatar.cc/150?img=9',
    'https://i.pravatar.cc/150?img=10','https://i.pravatar.cc/150?img=11','https://i.pravatar.cc/150?img=12',
];
var FAKE_NAMES = ['Alex Shadow','Nova Cipher','Rex Viper','Luna Storm','Kai Echo','Zara Blaze','Max Frost','Nora Specter','Finn Raven','Iris Ghost','Cole Hex','Dara Nova','Jax Titan','Mia Ghost','Leo Strike'];

var FakeProfilesSection = ({ lang, onNotification }) => {
    var [profiles, setProfiles] = useState([]);
    var [loading, setLoading] = useState(true);

    useEffect(() => {
        var unsub = usersCollection.where('isFake', '==', true).onSnapshot(snap => {
            setProfiles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return unsub;
    }, []);

    var deleteProfile = async (id) => {
        if(!confirm(lang==='ar'?'حذف هذا الحساب الوهمي؟':'Delete this fake profile?')) return;
        try {
            await usersCollection.doc(id).delete();
            onNotification('✅ Success');
        } catch(e) { onNotification('❌ Error'); }
    };

    return (
        <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'#ec4899' }}>
                    🤖 {lang==='ar'?'الحسابات الوهمية':'Fake Profiles'}
                </div>
                <button onClick={() => window.open('/tools/fake-gen.html','_blank')}
                    className="btn-neon" style={{ padding:'5px 12px', fontSize:'11px' }}>
                    ➕ {lang==='ar'?'إنشاء حسابات':'Generate'}
                </button>
            </div>

            {loading ? <div style={{textAlign:'center',padding:'20px'}}>⏳</div> : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:'10px' }}>
                    {profiles.map(p => (
                        <div key={p.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'10px', textAlign:'center', position:'relative' }}>
                            <img src={p.photoURL || 'https://via.placeholder.com/50'} 
                                style={{ width:'45px', height:'45px', borderRadius:'50%', marginBottom:'6px', border:'2px solid #ec4899' }} />
                            <div style={{ fontSize:'11px', fontWeight:700, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.displayName}</div>
                            <div style={{ fontSize:'9px', color:'#6b7280', marginBottom:'8px' }}>ID: {p.uid?.slice(0,6)}</div>
                            <button onClick={() => deleteProfile(p.id)}
                                style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444', padding:'3px 8px', borderRadius:'5px', fontSize:'9px', cursor:'pointer' }}>
                                {lang==='ar'?'حذف':'Delete'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

window.FakeProfilesSection = FakeProfilesSection;
})();


    // --- Source: c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\src\components\admin\FeedbackInboxSection.js ---

(function() {
    var { useState, useEffect, useMemo, useRef } = React;

var FeedbackInboxSection = ({ lang, onNotification }) => {
    var [feedback, setFeedback] = useState([]);
    var [loading, setLoading] = useState(true);

    useEffect(() => {
        var unsub = db.collection('feedback').orderBy('timestamp', 'desc').limit(100).onSnapshot(snap => {
            setFeedback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, []);

    var deleteFeedback = async (id) => {
        if(!confirm('Delete this feedback?')) return;
        try {
            await db.collection('feedback').doc(id).delete();
            onNotification('✅ Deleted');
        } catch(e) { onNotification('❌ Error'); }
    };

    return (
        <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#10b981', marginBottom:'16px' }}>
                📩 {lang==='ar'?'صندوق الملاحظات والشكاوى':'Feedback Inbox'}
            </div>
            {loading ? <div style={{textAlign:'center',padding:'20px'}}>⏳</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {feedback.length === 0 && <div style={{textAlign:'center',padding:'40px',color:'#6b7280',fontSize:'12px'}}>{lang==='ar'?'لا توجد ملاحظات':'No feedback yet'}</div>}
                    {feedback.map(f => (
                        <div key={f.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'12px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                    <div style={{ fontSize:'11px', fontWeight:700, color:'#10b981' }}>{f.userName || 'Anonymous'}</div>
                                    <span style={{ fontSize:'10px', color:'#9ca3af' }}>{f.timestamp?.toDate?.() ? f.timestamp.toDate().toLocaleString() : ''}</span>
                                </div>
                                <button onClick={() => deleteFeedback(f.id)} style={{ padding:'3px 8px', background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'none', borderRadius:'6px', fontSize:'9px', cursor:'pointer' }}>{lang==='ar'?'حذف':'Delete'}</button>
                            </div>
                            <div style={{ background:'rgba(255,255,255,0.02)', padding:'10px', borderRadius:'10px', fontSize:'11px', color:'#d1d5db', lineHeight:1.5 }}>
                                {f.text}
                            </div>
                            <div style={{ fontSize:'9px', color:'#4b5563', marginTop:'8px' }}>User ID: {f.userId || 'N/A'} • Platform: {f.platform || 'Web'}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

window.FeedbackInboxSection = FeedbackInboxSection;
})();

})();
