(function() {
    const { useState, useEffect, useMemo, useRef } = React;

var BanPanelInline = ({ reportedUID, reportedName, reportId, currentUser, currentUserData, lang, onDone, onCancel }) => {
    const [banReason, setBanReason]     = useState('');
    const [banDuration, setBanDuration] = useState('7d');
    const [banning, setBanning]         = useState(false);

    const durations = [
        { val:'1d',   ar:'يوم واحد',   en:'1 Day'    },
        { val:'3d',   ar:'3 أيام',     en:'3 Days'   },
        { val:'7d',   ar:'أسبوع',      en:'1 Week'   },
        { val:'30d',  ar:'شهر',        en:'1 Month'  },
        { val:'perm', ar:'دائم',       en:'Permanent'},
    ];

    const handleBan = async () => {
        if (!banReason.trim()) return;
        setBanning(true);
        try {
            let expiresAt = null;
            if (banDuration !== 'perm') {
                const days = parseInt(banDuration);
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
                const reportDoc = await reportsCollection.doc(reportId).get().catch(()=>null);
                if (reportDoc && reportDoc.exists) {
                    const reporterUID = reportDoc.data()?.reporterUID;
                    await reportsCollection.doc(reportId).update({ resolved: true, resolvedAt: TS() }).catch(()=>{});
                    // Send detective bot message to reporter
                    if (reporterUID && typeof botChatsCollection !== 'undefined') {
                        const durLabel = banDuration === 'perm'
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
