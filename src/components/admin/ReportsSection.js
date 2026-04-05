(function () {
  var { useState, useEffect } = React;

  var ReportsSection = ({ currentUser, currentUserData, lang, onNotification, onOpenProfile }) => {
    var [reports,           setReports]           = useState([]);
    var [loading,           setLoading]           = useState(true);
    var [filter,            setFilter]            = useState('open');
    var [escalating,        setEscalating]        = useState(null);
    var [escalateNote,      setEscalateNote]      = useState('');
    var [staffList,         setStaffList]         = useState([]);
    var [selectedEscalateTo, setSelectedEscalateTo] = useState('');
    var [banningUID,        setBanningUID]        = useState(null);

    var myRole = currentUserData?.role || 'user';

    // ── Load reports ─────────────────────────────────────────────
    useEffect(() => {
      var unsub;
      var unsubscribed = false;
      var sortReports = (data) => data.sort((a, b) => {
        var ta = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
        var tb = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
        return tb - ta;
      });
      try {
        unsub = reportsCollection.limit(200).onSnapshot(
          (snap) => { if (!unsubscribed) { setReports(sortReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })))); setLoading(false); } },
          async (err) => {
            console.warn('[Reports] onSnapshot failed:', err?.message);
            try {
              var snap = await reportsCollection.limit(200).get();
              if (!unsubscribed) { setReports(sortReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })))); setLoading(false); }
            } catch (e2) { if (!unsubscribed) setLoading(false); }
          }
        );
      } catch (e) { console.error('[Reports] listener error:', e?.message); setLoading(false); }
      return () => { unsubscribed = true; if (unsub) unsub(); };
    }, []);

    // ── Load staff list (admin + owner) for moderator escalation ─
    useEffect(() => {
      if (myRole === 'moderator') {
        if (window.fetchStaffList) {
          window.fetchStaffList(['admin', 'owner']).then((list) => setStaffList(list)).catch(() => {});
        } else {
          usersCollection.where('role', 'in', ['admin', 'owner']).get()
            .then((snap) => setStaffList(snap.docs.map((d) => ({ uid: d.id, id: d.id, ...d.data() }))))
            .catch(() => {});
        }
      }
    }, [myRole]);

    var resolveReport = async (id, targetUID, targetName) => {
      try {
        await reportsCollection.doc(id).update({ resolved: true, resolvedAt: TS() });
        // logStaffAction is fire-and-forget — don't block on permission error
        if (window.logStaffAction) window.logStaffAction(currentUser.uid, currentUserData?.displayName, 'RESOLVE_REPORT', targetUID, targetName, 'Report: ' + id).catch(() => {});
        onNotification('✅ ' + (lang === 'ar' ? 'تم الحل' : 'Resolved'));
      } catch (e) { onNotification('❌ Error: ' + e.message); }
    };

    var handleEscalate = async (report) => {
      if (!selectedEscalateTo || !escalateNote.trim()) {
        onNotification('⚠️ ' + (lang === 'ar' ? 'اختر شخصاً واكتب سبباً' : 'Select a target and write a reason'));
        return;
      }
      try {
        var target = staffList.find((s) => (s.uid || s.id) === selectedEscalateTo);
        await reportsCollection.doc(report.id).update({
          escalated: true,
          escalatedTo: selectedEscalateTo,
          escalatedToName: target?.displayName || selectedEscalateTo,
          escalatedToRole: target?.role || 'admin',
          escalateNote: escalateNote.trim(),
          escalatedAt: TS(),
          escalatedBy: currentUser.uid,
          escalatedByName: currentUserData?.displayName || 'Mod'
        });
        // Notify target via Staff Command Bot
        if (window.sendStaffCommandBotMessage) {
          var notifMsg = '🚨 ' + (lang === 'ar' ? 'تصعيد بلاغ: ' : 'Report Escalation: ') +
            (report.reportedName || 'User') + '\n' +
            '👤 ' + (lang === 'ar' ? 'من: ' : 'From: ') + (currentUserData?.displayName || 'Mod') + '\n' +
            '📝 ' + (lang === 'ar' ? 'السبب: ' : 'Reason: ') + escalateNote.trim() + '\n' +
            '→ ' + (lang === 'ar' ? 'افتح تبويب البلاغات.' : 'Open Reports tab to review.');
          window.sendStaffCommandBotMessage(selectedEscalateTo, notifMsg, { type: 'report_escalation' }).catch(() => {});
        }
        if (window.logStaffAction) window.logStaffAction(currentUser.uid, currentUserData?.displayName, 'ESCALATE_REPORT', report.reportedUID, report.reportedName, 'Report: ' + report.id + ' → ' + selectedEscalateTo).catch(() => {});
        onNotification('🚀 ' + (lang === 'ar' ? 'تم التصعيد' : 'Escalated'));
        setEscalating(null); setEscalateNote(''); setSelectedEscalateTo('');
      } catch (e) { onNotification('❌ Error: ' + e.message); }
    };

    // counts for filter badges
    var openCount      = reports.filter((r) => !r.resolved && !r.escalated).length;
    var escalatedCount = reports.filter((r) => r.escalated && !r.resolved).length;
    var resolvedCount  = reports.filter((r) => r.resolved).length;

    var filtered = reports.filter((r) => {
      if (filter === 'all')      return true;
      if (filter === 'open')     return !r.resolved && !r.escalated;
      if (filter === 'escalated') return r.escalated && !r.resolved;
      return r.resolved;
    });

    var filterTabs = [
      { id: 'all',       labelAr: 'الكل',    labelEn: 'ALL',       count: reports.length,  color: '#64748b' },
      { id: 'open',      labelAr: 'مفتوحة',  labelEn: 'OPEN',      count: openCount,       color: '#ef4444' },
      { id: 'escalated', labelAr: 'مُصعدة',  labelEn: 'ESCALATED', count: escalatedCount,  color: '#8b5cf6' },
      { id: 'resolved',  labelAr: 'محلولة',  labelEn: 'RESOLVED',  count: resolvedCount,   color: '#10b981' },
    ];

    var optStyle = { background: '#1e293b', color: '#e5e7eb' };

    return (/*#__PURE__*/
      React.createElement('div', null,

      /* ── Header ── */
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' } },
        React.createElement('div', { style: { fontSize: '13px', fontWeight: 700, color: '#ef4444' } }, '🚨 ', lang === 'ar' ? 'البلاغات' : 'Reports List'),
        React.createElement('div', { style: { display: 'flex', gap: '4px', flexWrap: 'wrap' } },
          filterTabs.map((f) => /*#__PURE__*/
            React.createElement('button', { key: f.id, onClick: () => setFilter(f.id),
              style: { position: 'relative', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer', border: 'none', fontWeight: 700,
                background: filter === f.id ? f.color : 'rgba(255,255,255,0.05)',
                color: filter === f.id ? '#fff' : '#9ca3af' } },
              lang === 'ar' ? f.labelAr : f.labelEn,
              f.count > 0 && /*#__PURE__*/
              React.createElement('span', { style: { marginLeft: '4px', background: filter === f.id ? 'rgba(255,255,255,0.3)' : f.color, color: '#fff', borderRadius: '8px', padding: '0 5px', fontSize: '9px', fontWeight: 900 } }, f.count)
            )
          )
        )
      ),

      loading ? /*#__PURE__*/React.createElement('div', { style: { textAlign: 'center', padding: '20px' } }, '⏳') : /*#__PURE__*/
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },

        filtered.length === 0 && /*#__PURE__*/
        React.createElement('div', { style: { textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '12px' } },
          lang === 'ar' ? 'لا توجد بلاغات' : 'No reports found'),

        filtered.map((r) => /*#__PURE__*/
          React.createElement('div', { key: r.id, style: {
            background: r.escalated && !r.resolved ? 'rgba(139,92,246,0.04)' : r.resolved ? 'rgba(16,185,129,0.03)' : 'rgba(255,255,255,0.03)',
            border: '1px solid ' + (r.escalated && !r.resolved ? 'rgba(139,92,246,0.2)' : r.resolved ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.1)'),
            borderRadius: '12px', padding: '12px'
          } },

          /* Top row */
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '4px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } },
              React.createElement('div', { style: { background: 'rgba(239,68,68,0.2)', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 800 } }, r.category?.toUpperCase() || 'REPORT'),
              r.escalated && !r.resolved && /*#__PURE__*/React.createElement('span', { style: { fontSize: '9px', fontWeight: 800, background: 'rgba(139,92,246,0.2)', color: '#a78bfa', padding: '1px 6px', borderRadius: '4px' } }, '🚀 ESCALATED'),
              r.resolved && /*#__PURE__*/React.createElement('span', { style: { fontSize: '9px', fontWeight: 800, background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '1px 6px', borderRadius: '4px' } }, '✅ RESOLVED'),
              React.createElement('span', { style: { fontSize: '10px', color: '#6b7280' } }, r.createdAt?.toDate?.()?.toLocaleString() || '')
            ),
            React.createElement('div', { style: { fontSize: '10px', color: '#4b5563' } }, '#', r.id?.slice(-5))
          ),

          /* Reporter / Reported */
          React.createElement('div', { style: { display: 'flex', gap: '10px', marginBottom: '10px' } },
            React.createElement('div', { style: { flex: 1, padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' } },
              React.createElement('div', { style: { fontSize: '9px', color: '#6b7280', marginBottom: '3px' } }, lang === 'ar' ? 'المُبلِغ' : 'Reporter'),
              React.createElement('div', { onClick: () => onOpenProfile && onOpenProfile(r.reporterUID), style: { fontSize: '11px', fontWeight: 700, cursor: onOpenProfile ? 'pointer' : 'default', color: '#3b82f6' } }, r.reporterName || 'Anonymous')
            ),
            React.createElement('div', { style: { flex: 1, padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' } },
              React.createElement('div', { style: { fontSize: '9px', color: '#ef4444', marginBottom: '3px' } }, lang === 'ar' ? 'المُبلَغ عنه' : 'Reported'),
              React.createElement('div', { onClick: () => onOpenProfile && onOpenProfile(r.reportedUID), style: { fontSize: '11px', fontWeight: 700, cursor: onOpenProfile ? 'pointer' : 'default', color: '#ef4444' } }, r.reportedName || 'User')
            )
          ),

          /* Reason */
          React.createElement('div', { style: { background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '8px', marginBottom: '10px', fontSize: '11px', color: '#d1d5db', lineHeight: 1.4 } },
            r.reason || r.description,
            r.evidenceUrl && /*#__PURE__*/React.createElement('img', { src: r.evidenceUrl, style: { width: '100%', borderRadius: '6px', marginTop: '6px', cursor: 'pointer' }, onClick: () => window.open(r.evidenceUrl) })
          ),

          /* Escalation info banner */
          r.escalated && !r.resolved && /*#__PURE__*/
          React.createElement('div', { style: { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px', fontSize: '11px' } },
            React.createElement('div', { style: { color: '#a78bfa', fontWeight: 700 } }, '🚀 ', lang === 'ar' ? 'صُعِّد بواسطة: ' : 'Escalated by: ', React.createElement('strong', null, r.escalatedByName || '?'), ' → ', r.escalatedToName || r.escalatedTo),
            r.escalateNote && React.createElement('div', { style: { color: '#94a3b8', marginTop: '2px' } }, r.escalateNote)
          ),

          /* Actions */
          !r.resolved && /*#__PURE__*/
          React.createElement(React.Fragment, null,

            /* Ban panel */
            banningUID === r.id
            ? /*#__PURE__*/React.createElement(window.BanPanelInline, { reportedUID: r.reportedUID, reportedName: r.reportedName, reportId: r.id, currentUser, currentUserData, lang, onDone: (msg) => { setBanningUID(null); onNotification(msg); }, onCancel: () => setBanningUID(null) })

            /* Moderator escalation panel */
            : escalating === r.id
            ? /*#__PURE__*/React.createElement('div', { style: { background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', padding: '12px', borderRadius: '10px' } },
                React.createElement('div', { style: { fontSize: '11px', color: '#8b5cf6', fontWeight: 700, marginBottom: '8px' } }, '🚀 ', lang === 'ar' ? 'تصعيد البلاغ' : 'Escalate Report'),
                React.createElement('select', {
                  value: selectedEscalateTo, onChange: (e) => setSelectedEscalateTo(e.target.value),
                  style: { width: '100%', padding: '8px', fontSize: '11px', background: '#1e293b', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', outline: 'none', marginBottom: '8px' }
                },
                  React.createElement('option', { value: '', style: optStyle }, lang === 'ar' ? '--- اختر المستلم ---' : '--- Select recipient ---'),
                  staffList.map((s) => {
                    var isOnline = s.lastSeen && (Date.now() - (s.lastSeen?.toMillis?.() || s.lastSeen?.seconds * 1000 || 0)) < 5 * 60 * 1000;
                    var label = (isOnline ? '🟢 ' : '⚫ ') + (s.displayName || s.id) + ' (' + (s.role || '?') + ')';
                    return /*#__PURE__*/React.createElement('option', { key: s.uid || s.id, value: s.uid || s.id, style: optStyle }, label);
                  })
                ),
                React.createElement('textarea', { className: 'input-dark', style: { width: '100%', padding: '8px', borderRadius: '8px', fontSize: '11px', minHeight: '55px', marginBottom: '8px' },
                  placeholder: lang === 'ar' ? 'سبب التصعيد...' : 'Reason for escalation...', value: escalateNote, onChange: (e) => setEscalateNote(e.target.value) }),
                React.createElement('div', { style: { display: 'flex', gap: '6px' } },
                  React.createElement('button', { onClick: () => handleEscalate(r), style: { flex: 1, padding: '7px', background: '#8b5cf6', color: '#fff', borderRadius: '7px', border: 'none', fontSize: '11px', fontWeight: 700, cursor: 'pointer' } }, lang === 'ar' ? 'إرسال' : 'Submit'),
                  React.createElement('button', { onClick: () => setEscalating(null), style: { padding: '7px 12px', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: '7px', border: 'none', fontSize: '11px', cursor: 'pointer' } }, '✕')
                )
              )

            /* Normal action buttons */
            : /*#__PURE__*/React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
                React.createElement('button', { onClick: () => resolveReport(r.id, r.reportedUID, r.reportedName), style: { flex: 1, minWidth: '70px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '7px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' } }, '✅ ', lang === 'ar' ? 'تجاهل' : 'Dismiss'),
                myRole !== 'moderator' && /*#__PURE__*/
                React.createElement('button', { onClick: () => setBanningUID(r.id), style: { flex: 1, minWidth: '70px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '7px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' } }, '🔨 ', lang === 'ar' ? 'حظر' : 'Ban'),
                myRole === 'moderator' && !r.escalated && /*#__PURE__*/
                React.createElement('button', { onClick: () => { setEscalating(r.id); setSelectedEscalateTo(''); setEscalateNote(''); }, style: { flex: 1, minWidth: '70px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6', padding: '7px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' } }, '🚀 ', lang === 'ar' ? 'تصعيد' : 'Escalate')
              )
          )
        )
      )
    ));
  };

  window.ReportsSection = ReportsSection;
})();