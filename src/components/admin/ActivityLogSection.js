(function () {
  var { useState, useEffect } = React;

  // ─── Action colors ────────────────────────────────────────────────────────
  var ACTION_COLORS = {
    'BAN_USER':       '#ef4444',
    'UNBAN_USER':     '#10b981',
    'VERIFY_USER':    '#3b82f6',
    'RESOLVE_REPORT': '#3b82f6',
    'ESCALATE_REPORT':'#8b5cf6',
    'ESCALATE_TICKET':'#8b5cf6',
    'REPLY_TICKET':   '#f59e0b',
    'CLOSE_TICKET':   '#10b981',
    'EDIT_STAFF':     '#8b5cf6',
    'ASSIGN_ROLE':    '#f5af19',
    'REMOVE_STAFF':   '#ef4444',
    'SEND_GOLD':      '#f59e0b',
    'BROADCAST':      '#f59e0b',
    'DELETE_TICKET':  '#6b7280',
    'DELETE_MOMENT':  '#6b7280',
    'HIDE_MOMENT':    '#6b7280',
  };

  // T022 — Role config used for role badge pill per log entry
  var ROLE_CONFIG = {
    owner:     { icon: '👑', color: '#f59e0b' },
    admin:     { icon: '🛡️', color: '#ef4444' },
    moderator: { icon: '🔰', color: '#3b82f6' },
    staff:     { icon: '👤', color: '#6b7280' },
  };

  var ActivityLogSection = ({ lang }) => {
    var [logs,         setLogs]         = useState([]);
    var [loading,      setLoading]      = useState(true);
    var [error,        setError]        = useState(null);
    // T020 — Date filter state
    var [selectedDate, setSelectedDate] = useState('');

    // ── Firestore query (T021) ─────────────────────────────────────────────
    useEffect(() => {
      setLoading(true);
      setError(null);

      var query;
      if (selectedDate) {
        // Build start/end Timestamps for the selected calendar date
        var start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);
        var end   = new Date(selectedDate);
        end.setHours(23, 59, 59, 999);
        query = staffLogCollection
          .where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(start))
          .where('timestamp', '<=', firebase.firestore.Timestamp.fromDate(end))
          .orderBy('timestamp', 'desc');
      } else {
        query = staffLogCollection.orderBy('timestamp', 'desc').limit(200);
      }

      var unsub = query.onSnapshot(
        (snap) => { setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); },
        (err)  => { console.warn('[ActivityLog]', err); setError(err.code || 'permission-denied'); setLoading(false); }
      );
      return unsub;
    }, [selectedDate]); // re-run whenever date changes

    // ─── Render ─────────────────────────────────────────────────────────────
    return (/*#__PURE__*/
      React.createElement('div', null,

      /* Header */
      React.createElement('div', { style: { fontSize: '13px', fontWeight: 700, color: '#3b82f6', marginBottom: '16px' } },
        '📋 ', lang === 'ar' ? 'سجل نشاط الفريق' : 'Staff Activity Log'
      ),

      /* T020 — Date filter bar */
      React.createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' } },
        React.createElement('input', {
          type: 'date',
          value: selectedDate,
          onChange: (e) => setSelectedDate(e.target.value),
          className: 'input-dark',
          style: { padding: '7px 10px', borderRadius: '8px', fontSize: '12px', flex: '1', minWidth: '140px', cursor: 'pointer' }
        }),
        selectedDate &&
        React.createElement('button', {
          onClick: () => setSelectedDate(''),
          style: { padding: '7px 12px', background: 'rgba(255,255,255,0.07)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', flexShrink: 0 }
        }, '✕ ', lang === 'ar' ? 'مسح' : 'Clear'),
        selectedDate &&
        React.createElement('span', { style: { fontSize: '10px', color: '#6b7280' } },
          lang === 'ar' ? 'نتائج: ' : 'Showing: ', logs.length, lang === 'ar' ? ' سجل' : ' entries'
        )
      ),

      /* Body */
      loading
      ? React.createElement('div', { style: { color: '#6b7280', fontSize: '12px', textAlign: 'center', padding: '20px' } }, '⏳')
      : error
      ? React.createElement('div', { style: { padding: '16px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '12px' } },
          '⚠️ ', lang === 'ar'
            ? 'خطأ في الصلاحيات (' + error + ') — تأكد من تحديث قوانين Firestore.'
            : 'Permission error (' + error + ') — update your Firestore rules to allow staff log reads.'
        )
      : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '60vh', overflowY: 'auto' } },

          logs.length === 0 &&
          React.createElement('div', { style: { color: '#6b7280', fontSize: '12px', textAlign: 'center', padding: '20px' } },
            lang === 'ar' ? 'لا توجد سجلات' : 'No logs yet'
          ),

          logs.map((log) => {
            var ts    = log.timestamp?.toDate?.();
            var color = ACTION_COLORS[log.action] || '#9ca3af';

            // T022 — Role badge
            var roleCfg = ROLE_CONFIG[log.staffRole] || ROLE_CONFIG['staff'];

            return React.createElement('div', { key: log.id, style: {
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid ' + color + '20',
              borderRadius: '8px',
              padding: '10px',
              borderLeft: '3px solid ' + color
            } },
              /* Top row: action label + timestamp */
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' } },
                React.createElement('span', { style: { fontSize: '11px', fontWeight: 700, color } },
                  (log.action || '').replace(/_/g, ' ')
                ),
                React.createElement('span', { style: { fontSize: '9px', color: '#6b7280' } },
                  ts ? ts.toLocaleString() : ''
                )
              ),

              /* Staff name + T022 role badge + arrow + target */
              React.createElement('div', { style: { fontSize: '11px', color: '#d1d5db', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' } },
                React.createElement('strong', null, log.staffName),
                /* Role badge pill */
                React.createElement('span', { style: {
                  fontSize: '9px', fontWeight: 800,
                  color: roleCfg.color,
                  background: roleCfg.color + '20',
                  border: '1px solid ' + roleCfg.color + '40',
                  padding: '1px 5px', borderRadius: '4px'
                } }, roleCfg.icon, ' ', (log.staffRole || 'staff').toUpperCase()),
                log.targetName
                  ? React.createElement('span', { style: { color: '#6b7280' } }, ' → ', log.targetName)
                  : null
              ),

              /* Details row */
              log.details &&
              React.createElement('div', { style: { fontSize: '10px', color: '#6b7280', marginTop: '3px' } },
                log.details
              )
            );
          })
        )
    ));
  };

  window.ActivityLogSection = ActivityLogSection;
})();