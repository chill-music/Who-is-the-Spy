(function () {
  var { useState, useEffect, useRef } = React;

  // ── Thank-you messages ─────────────────────────────────────────────────────
  var ACK_MSG_EN = 'Hi! 👋 We saw your feedback and we truly appreciate you taking the time to share it with us. Thank you for helping us improve! 🙏';
  var ACK_MSG_AR = 'مرحباً! 👋 لقد اطلعنا على ملاحظتك ونقدّر جداً وقتك في مشاركتها معنا. شكراً لمساعدتك في التحسين! 🙏';

  var FeedbackInboxSection = ({ currentUser, currentUserData, lang, onNotification }) => {
    var [feedback,   setFeedback]   = useState([]);
    var [loading,    setLoading]    = useState(true);
    var [userNames,  setUserNames]  = useState({});   // { [uid]: displayName }
    var [acking,     setAcking]     = useState({});   // { [fid]: true } while in-flight

    // ── Live feedback listener ──────────────────────────────────────────────
    useEffect(() => {
      var unsub = feedbackCollection.orderBy('createdAt', 'desc').limit(100).onSnapshot((snap) => {
        var list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setFeedback(list);
        setLoading(false);

        // Collect unique UIDs that we don't have a name for yet
        var needed = list
          .map((f) => f.userId)
          .filter((uid) => uid && !userNames[uid]);
        var unique = [...new Set(needed)];
        if (unique.length === 0) return;

        // Batch-fetch displayNames
        unique.forEach(async (uid) => {
          try {
            var doc = await usersCollection.doc(uid).get();
            if (doc.exists) {
              var name = doc.data().displayName || doc.data().userName || uid;
              setUserNames((prev) => ({ ...prev, [uid]: name }));
            }
          } catch (_) {}
        });
      }, () => setLoading(false));
      return unsub;
    }, []);

    // ── Delete feedback ─────────────────────────────────────────────────────
    var deleteFeedback = async (id) => {
      if (!confirm('Delete this feedback?')) return;
      try {
        await feedbackCollection.doc(id).delete();
        onNotification('✅ Deleted');
      } catch (e) { onNotification('❌ Error'); }
    };

    // ── Acknowledge  ────────────────────────────────────────────────────────
    var handleAcknowledge = async (f) => {
      if (acking[f.id]) return;
      if (!f.userId) { onNotification('⚠️ No user ID on this feedback'); return; }
      setAcking((prev) => ({ ...prev, [f.id]: true }));
      try {
        // 1. Send PRO SPY bot message to the submitter
        var msg = lang === 'ar' ? ACK_MSG_AR : ACK_MSG_EN;
        if (window.sendProSpyBotMessage) {
          await window.sendProSpyBotMessage(f.userId, msg, { type: 'feedback_ack' });
        }

        // 2. Mark the feedback doc as acknowledged
        await feedbackCollection.doc(f.id).update({
          status:         'acknowledged',
          acknowledgedAt: TS(),
          acknowledgedBy: currentUser?.uid || 'admin'
        });

        onNotification('✅ ' + (lang === 'ar' ? 'تم الإشعار بالاستلام وإرسال الرسالة' : 'Acknowledged & message sent'));
      } catch (e) {
        onNotification('❌ Error: ' + e.message);
      }
      setAcking((prev) => ({ ...prev, [f.id]: false }));
    };

    // ── Render ──────────────────────────────────────────────────────────────
    return (/*#__PURE__*/
      React.createElement('div', null,

      /* Header */
      React.createElement('div', { style: { fontSize: '13px', fontWeight: 700, color: '#10b981', marginBottom: '16px' } },
        '📩 ', lang === 'ar' ? 'صندوق الملاحظات والشكاوى' : 'Feedback Inbox'
      ),

      loading
      ? React.createElement('div', { style: { textAlign: 'center', padding: '20px' } }, '⏳')
      : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },

          feedback.length === 0 &&
          React.createElement('div', { style: { textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '12px' } },
            lang === 'ar' ? 'لا توجد ملاحظات' : 'No feedback yet'
          ),

          feedback.map((f) => {
            // Live-resolved display name — falls back to stored userName, then 'Anonymous'
            var resolvedName = (f.userId && userNames[f.userId]) || f.userName || 'Anonymous';
            var isAcked = f.status === 'acknowledged';
            var inFlight = acking[f.id];

            return React.createElement('div', {
              key: f.id,
              style: {
                background: isAcked ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.03)',
                border: '1px solid ' + (isAcked ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'),
                borderRadius: '12px', padding: '12px'
              }
            },

              /* Top row: name + timestamp + delete button */
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' } },
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
                  React.createElement('div', { style: { fontSize: '11px', fontWeight: 700, color: '#10b981' } }, resolvedName),
                  isAcked &&
                  React.createElement('span', { style: { fontSize: '9px', fontWeight: 700, background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '1px 6px', borderRadius: '10px' } },
                    '✓ ' + (lang === 'ar' ? 'تم الاستلام' : 'Seen')
                  ),
                  React.createElement('span', { style: { fontSize: '10px', color: '#9ca3af' } },
                    f.createdAt?.toDate?.() ? f.createdAt.toDate().toLocaleString()
                    : (f.timestamp?.toDate?.() ? f.timestamp.toDate().toLocaleString() : '')
                  )
                ),
                React.createElement('button', {
                  onClick: () => deleteFeedback(f.id),
                  style: { padding: '3px 8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '6px', fontSize: '9px', cursor: 'pointer', flexShrink: 0 }
                }, lang === 'ar' ? 'حذف' : 'Delete')
              ),

              /* Message body */
              React.createElement('div', { style: { background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '10px', fontSize: '11px', color: '#d1d5db', lineHeight: 1.6, marginBottom: '10px' } },
                f.text
              ),

              /* Meta row */
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' } },
                React.createElement('div', { style: { fontSize: '9px', color: '#4b5563' } },
                  'User ID: ', f.userId || 'N/A', ' • Platform: ', f.platform || 'Web'
                ),

                /* 👁️ Acknowledge button */
                isAcked
                ? React.createElement('div', { style: { fontSize: '10px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' } },
                    '✅ ', lang === 'ar' ? 'تم إبلاغ المستخدم' : 'User notified'
                  )
                : React.createElement('button', {
                    onClick: () => handleAcknowledge(f),
                    disabled: inFlight,
                    style: {
                      padding: '5px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, border: 'none',
                      background: inFlight ? 'rgba(59,130,246,0.07)' : 'rgba(59,130,246,0.12)',
                      color: '#60a5fa', cursor: inFlight ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }
                  }, inFlight ? '⏳' : '👁️ ' + (lang === 'ar' ? 'إشعار بالاستلام' : 'Acknowledge'))
              )
            );
          })
        )
    ));
  };

  window.FeedbackInboxSection = FeedbackInboxSection;
})();