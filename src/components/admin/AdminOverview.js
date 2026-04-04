(function () {
  var { useState, useEffect } = React;

  var ROLE_COLORS = { owner: '#f59e0b', admin: '#3b82f6', moderator: '#8b5cf6' };
  var ROLE_ICONS  = { owner: '👑', admin: '🛡️', moderator: '🪪' };

  var OverviewSection = ({ currentUser, lang }) => {
    var [stats, setStats] = useState({ users: 0, today: 0, reports: 0, tickets: 0 });
    var [loading, setLoading] = useState(true);
    var [staff, setStaff] = useState([]);
    var [staffLoading, setStaffLoading] = useState(true);

    // ── Stats ────────────────────────────────────────────────
    useEffect(() => {
      var fetchStats = async () => {
        try {
          var u = await usersCollection.count().get();
          var r = await reportsCollection.where('resolved', '==', false).count().get();
          var t = await ticketsCollection.where('status', '==', 'open').count().get();
          var today = new Date(); today.setHours(0, 0, 0, 0);
          var td = await usersCollection.where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(today)).count().get();
          setStats({ users: u.data().count, today: td.data().count, reports: r.data().count, tickets: t.data().count });
        } catch (e) {}
        setLoading(false);
      };
      fetchStats();
    }, []);

    // ── Staff list ───────────────────────────────────────────
    useEffect(() => {
      usersCollection.where('role', 'in', ['owner', 'admin', 'moderator'])
        .get().then(async (snap) => {
          var list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

          // Include hardcoded AdminConfig owners
          if (window.AdminConfig && window.AdminConfig.OWNERS) {
            var missing = window.AdminConfig.OWNERS.filter((uid) => !list.find((s) => s.uid === uid));
            for (var uid of missing) {
              try {
                var doc = await usersCollection.doc(uid).get();
                if (doc.exists) list.push({ id: doc.id, role: 'owner', ...doc.data() });
              } catch (_) {}
            }
          }

          // Sort: owner → admin → moderator
          var order = { owner: 0, admin: 1, moderator: 2 };
          list.sort((a, b) => (order[a.role] ?? 9) - (order[b.role] ?? 9));
          setStaff(list);
          setStaffLoading(false);
        }).catch(() => setStaffLoading(false));
    }, []);

    return (/*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '20px' } },

      /*─── Stats row ───────────────────────────────────────*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 700, color: '#3b82f6', marginBottom: '16px' } }, "\uD83D\uDCCA ",
        lang === 'ar' ? 'نظرة عامة' : 'System Overview'), /*#__PURE__*/
      loading ? /*#__PURE__*/React.createElement("div", { style: { textAlign: 'center', padding: '20px' } }, "\u23F3") : /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } }, /*#__PURE__*/
        React.createElement(window.AdminStatCard, { label: lang === 'ar' ? 'إجمالي المستخدمين' : 'Total Users',   value: stats.users.toLocaleString(), icon: '\uD83D\uDC65', color: '#3b82f6' }), /*#__PURE__*/
        React.createElement(window.AdminStatCard, { label: lang === 'ar' ? 'جديد اليوم'        : 'New Today',     value: stats.today,                  icon: '\u2728',         color: '#10b981' }), /*#__PURE__*/
        React.createElement(window.AdminStatCard, { label: lang === 'ar' ? 'بلاغات مفتوحة'    : 'Open Reports',  value: stats.reports,                icon: '\uD83D\uDEA8',   color: '#ef4444' }), /*#__PURE__*/
        React.createElement(window.AdminStatCard, { label: lang === 'ar' ? 'تذاكر مفتوحة'     : 'Open Tickets',  value: stats.tickets,                icon: '\uD83C\uDFAB',   color: '#f59e0b' })
      )
      ),

      /*─── Staff Team box ──────────────────────────────────*/
      React.createElement("div", { style: { padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' } }, /*#__PURE__*/
        React.createElement("div", { style: { fontSize: '12px', fontWeight: 700, color: '#8b5cf6', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' } }, "\uD83D\uDC6E\uFE0F ", lang === 'ar' ? 'فريق العمل المحرك' : 'Active Staff Team'), /*#__PURE__*/

        staffLoading ? /*#__PURE__*/React.createElement("div", { style: { textAlign: 'center', padding: '16px', color: '#6b7280', fontSize: '12px' } }, "\u23F3") :
        staff.length === 0 ? /*#__PURE__*/React.createElement("div", { style: { textAlign: 'center', padding: '16px', color: '#6b7280', fontSize: '12px' } }, lang === 'ar' ? 'لا يوجد فريق عمل' : 'No staff found') : /*#__PURE__*/

        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
          staff.map((s) => {
            var color = ROLE_COLORS[s.role] || '#9ca3af';
            var icon  = ROLE_ICONS[s.role]  || '👤';
            var isMe  = s.uid === currentUser?.uid;
            return (/*#__PURE__*/
              React.createElement("div", { key: s.id, style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: isMe ? `${color}15` : 'rgba(255,255,255,0.02)', border: `1px solid ${isMe ? color + '40' : 'rgba(255,255,255,0.06)'}` } }, /*#__PURE__*/
                React.createElement("img", { src: s.photoURL || 'https://via.placeholder.com/36', style: { width: '36px', height: '36px', borderRadius: '50%', border: `2px solid ${color}`, objectFit: 'cover', flexShrink: 0 } }), /*#__PURE__*/
                React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
                  React.createElement("div", { style: { fontSize: '12px', fontWeight: 700, color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                    s.displayName || 'Unknown', isMe ? ` (${lang === 'ar' ? 'أنت' : 'You'})` : ''
                  ), /*#__PURE__*/
                  React.createElement("div", { style: { fontSize: '10px', color: '#6b7280', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, s.uid)
                ), /*#__PURE__*/
                React.createElement("span", { style: { fontSize: '11px', fontWeight: 800, color, background: `${color}20`, padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap', flexShrink: 0 } },
                  icon, ' ', (s.role || 'user').toUpperCase()
                )
              ));
          })
        )
      ),

      /*─── Quick guide ─────────────────────────────────────*/
      React.createElement("div", { style: { padding: '14px 16px', borderRadius: '12px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' } }, /*#__PURE__*/
        React.createElement("div", { style: { fontSize: '11px', fontWeight: 700, color: '#3b82f6', marginBottom: '8px' } }, "\uD83D\uDE80 ", lang === 'ar' ? 'إرشادات سريعة' : 'Quick Guide'), /*#__PURE__*/
        React.createElement("ul", { style: { margin: 0, padding: '0 0 0 16px', fontSize: '11px', color: '#9ca3af', lineHeight: 1.8 } }, /*#__PURE__*/
          React.createElement("li", null, lang === 'ar' ? 'استخدم تبويب "المستخدمين" للبحث بـ ID أو الاسم.' : 'Use "Users" tab to search by UID or name.'), /*#__PURE__*/
          React.createElement("li", null, lang === 'ar' ? 'البلاغات تحتاج مراجعة سريعة للحفاظ على المجتمع.' : 'Review reports regularly to keep the community safe.'), /*#__PURE__*/
          React.createElement("li", null, lang === 'ar' ? 'المديريتور يستطيع الرد على التذاكر وتصعيد التقارير فقط.' : 'Moderators can reply tickets & escalate reports only.')
        )
      )

      ));
  };

  window.AdminOverview = OverviewSection;
})();