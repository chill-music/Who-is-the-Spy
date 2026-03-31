(function () {
  var { useState, useEffect, useMemo, useRef } = React;

  var FeedbackInboxSection = ({ lang, onNotification }) => {
    var [feedback, setFeedback] = useState([]);
    var [loading, setLoading] = useState(true);

    useEffect(() => {
      var unsub = feedbackCollection.orderBy('timestamp', 'desc').limit(100).onSnapshot((snap) => {
        setFeedback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }, () => setLoading(false));
      return unsub;
    }, []);

    var deleteFeedback = async (id) => {
      if (!confirm('Delete this feedback?')) return;
      try {
        await feedbackCollection.doc(id).delete();
        onNotification('✅ Deleted');
      } catch (e) {onNotification('❌ Error');}
    };

    return (/*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 700, color: '#10b981', marginBottom: '16px' } }, "\uD83D\uDCE9 ",
      lang === 'ar' ? 'صندوق الملاحظات والشكاوى' : 'Feedback Inbox'
      ),
      loading ? /*#__PURE__*/React.createElement("div", { style: { textAlign: 'center', padding: '20px' } }, "\u23F3") : /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
      feedback.length === 0 && /*#__PURE__*/React.createElement("div", { style: { textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '12px' } }, lang === 'ar' ? 'لا توجد ملاحظات' : 'No feedback yet'),
      feedback.map((f) => /*#__PURE__*/
      React.createElement("div", { key: f.id, style: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', fontWeight: 700, color: '#10b981' } }, f.userName || 'Anonymous'), /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '10px', color: '#9ca3af' } }, f.timestamp?.toDate?.() ? f.timestamp.toDate().toLocaleString() : '')
      ), /*#__PURE__*/
      React.createElement("button", { onClick: () => deleteFeedback(f.id), style: { padding: '3px 8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '6px', fontSize: '9px', cursor: 'pointer' } }, lang === 'ar' ? 'حذف' : 'Delete')
      ), /*#__PURE__*/
      React.createElement("div", { style: { background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '10px', fontSize: '11px', color: '#d1d5db', lineHeight: 1.5 } },
      f.text
      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '9px', color: '#4b5563', marginTop: '8px' } }, "User ID: ", f.userId || 'N/A', " \u2022 Platform: ", f.platform || 'Web')
      )
      )
      )

      ));

  };

  window.FeedbackInboxSection = FeedbackInboxSection;
})();