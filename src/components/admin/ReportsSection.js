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

    var myRole = window.getUserRole ? window.getUserRole(currentUserData, currentUser?.uid) : (currentUserData?.role || 'user');

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
