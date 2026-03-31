(function () {
  var { useState, useEffect, useMemo, useRef } = React;

  var OverviewSection = ({ lang }) => {
    var [stats, setStats] = useState({ users: 0, today: 0, reports: 0, tickets: 0 });
    var [loading, setLoading] = useState(true);

    useEffect(() => {
      var fetchStats = async () => {
        try {
          var u = await usersCollection.count().get();
          var r = await reportsCollection.where('resolved', '==', false).count().get();
          var t = await ticketsCollection.where('status', '==', 'open').count().get();

          var today = new Date();
          today.setHours(0, 0, 0, 0);
          var td = await usersCollection.where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(today)).count().get();

          setStats({
            users: u.data().count,
            today: td.data().count,
            reports: r.data().count,
            tickets: t.data().count
          });
        } catch (e) {}
        setLoading(false);
      };
      fetchStats();
    }, []);

    return (/*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 700, color: '#3b82f6', marginBottom: '16px' } }, "\uD83D\uDCCA ",
      lang === 'ar' ? 'نظرة عامة' : 'System Overview'
      ),
      loading ? /*#__PURE__*/React.createElement("div", { style: { textAlign: 'center', padding: '20px' } }, "\u23F3") : /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } }, /*#__PURE__*/
      React.createElement(window.AdminStatCard, { label: lang === 'ar' ? 'إجمالي المستخدمين' : 'Total Users', value: stats.users.toLocaleString(), icon: "\uD83D\uDC65", color: "#3b82f6" }), /*#__PURE__*/
      React.createElement(window.AdminStatCard, { label: lang === 'ar' ? 'جديد اليوم' : 'New Today', value: stats.today, icon: "\u2728", color: "#10b981" }), /*#__PURE__*/
      React.createElement(window.AdminStatCard, { label: lang === 'ar' ? 'بلاغات مفتوحة' : 'Open Reports', value: stats.reports, icon: "\uD83D\uDEA8", color: "#ef4444" }), /*#__PURE__*/
      React.createElement(window.AdminStatCard, { label: lang === 'ar' ? 'تذاكر مفتوحة' : 'Open Tickets', value: stats.tickets, icon: "\uD83C\uDFAB", color: "#f59e0b" })
      ), /*#__PURE__*/


      React.createElement("div", { style: { marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', fontWeight: 700, color: '#3b82f6', marginBottom: '8px' } }, "\uD83D\uDE80 ", lang === 'ar' ? 'إرشادات سريعة' : 'Quick Guide'), /*#__PURE__*/
      React.createElement("ul", { style: { margin: 0, padding: '0 0 0 16px', fontSize: '11px', color: '#9ca3af', lineHeight: 1.6 } }, /*#__PURE__*/
      React.createElement("li", null, lang === 'ar' ? 'استخدم تبويب "المستخدمين" للبحث عن ID معين أو الحظر.' : 'Use "Users" tab to search specific ID or ban.'), /*#__PURE__*/
      React.createElement("li", null, lang === 'ar' ? 'البلاغات تحتاج لمراجعة سريعة للحفاظ على سلامة المجتمع.' : 'Reports need quick review to keep community safe.'), /*#__PURE__*/
      React.createElement("li", null, lang === 'ar' ? 'لا تقم برفع الحظر عن أحد إلا بعد التأكد من السبب.' : 'Do not unban unless you verified the reason.')
      )
      )
      ));

  };

  window.AdminOverview = OverviewSection;
})();