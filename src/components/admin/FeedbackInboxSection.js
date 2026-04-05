(function () {
  var { useState, useEffect, useRef } = React;

  var ACK_MSG_EN = 'Hi! 👋 We saw your feedback and we truly appreciate you taking the time to share it with us. Thank you for helping us improve! 🙏';
  var ACK_MSG_AR = 'مرحباً! 👋 لقد اطلعنا على ملاحظتك ونقدّر جداً وقتك في مشاركتها معنا. شكراً لمساعدتك في التحسين! 🙏';

  var FeedbackInboxSection = ({ currentUser, currentUserData, lang, onNotification }) => {
    var [feedback,   setFeedback]   = useState([]);
    var [loading,    setLoading]    = useState(true);
    var [userNames,  setUserNames]  = useState({});
    var [acking,     setAcking]     = useState({});

    // Moderator escalation state
    var myRole = currentUserData?.role || currentUserData?.staffRole?.role || 'user';
    var [escalating,  setEscalating]  = useState(null); // feedback.id
    var [escalateTo,  setEscalateTo]  = useState('');
    var [escalateNote, setEscalateNote] = useState('');
    var [staffList,   setStaffList]   = useState([]);
    var [noAdminDialog, setNoAdminDialog] = useState(null);

    useEffect(() => {
      var unsub = feedbackCollection.orderBy('createdAt', 'desc').limit(100).onSnapshot((snap) => {
        var list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setFeedback(list);
        setLoading(false);
        var needed = list.map((f) => f.userId).filter((uid) => uid && !userNames[uid]);
        var unique = [...new Set(needed)];
        if (unique.length === 0) return;
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

    // Load staff list for moderator escalation
    useEffect(() => {
      if (myRole === 'moderator') {
        if (window.fetchStaffList) {
          window.fetchStaffList(['admin', 'owner']).then((list) => setStaffList(list));
        } else {
          usersCollection.where('role', 'in', ['admin', 'owner']).get().then((snap) => {
            setStaffList(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
          }).catch(() => {});
        }
      }
    }, [myRole]);

    var deleteFeedback = async (id) => {
      try {
        await feedbackCollection.doc(id).delete();
        onNotification('✅ Deleted');
      } catch (e) { onNotification('❌ Error'); }
    };

    var handleAcknowledge = async (f) => {
      if (acking[f.id]) return;
      if (!f.userId) { onNotification('⚠️ No user ID on this feedback'); return; }
      setAcking((prev) => ({ ...prev, [f.id]: true }));
      try {
        var msg = lang === 'ar' ? ACK_MSG_AR : ACK_MSG_EN;
        if (window.sendProSpyBotMessage) {
          await window.sendProSpyBotMessage(f.userId, msg, { type: 'feedback_ack' });
        }
        await feedbackCollection.doc(f.id).update({
          status: 'acknowledged', acknowledgedAt: TS(), acknowledgedBy: currentUser?.uid || 'admin'
        });
        onNotification('✅ ' + (lang === 'ar' ? 'تم الإشعار بالاستلام وإرسال الرسالة' : 'Acknowledged & message sent'));
      } catch (e) {
        onNotification('❌ Error: ' + e.message);
      }
      setAcking((prev) => ({ ...prev, [f.id]: false }));
    };

    // Moderator escalation — core writer
    var doEscalateFeedback = async (f, targetUID) => {
      var target = staffList.find((s) => (s.uid || s.id) === targetUID);
      try {
        await feedbackCollection.doc(f.id).update({
          escalated: true,
          escalatedTo: targetUID,
          escalatedToName: target?.displayName || targetUID,
          escalatedToRole: target?.role || 'admin',
          escalateNote: escalateNote.trim(),
          escalatedAt: TS(),
          escalatedBy: currentUser?.uid,
          escalatedByName: currentUserData?.displayName || 'Mod'
        });
        // Notify via Staff Command Bot
        if (window.sendStaffCommandBotMessage && targetUID) {
          var notifMsg = (
            '📩 ' + (lang === 'ar' ? 'تصعيد ملاحظة: ' : 'Feedback Escalation: ') +
            (f.text?.slice(0, 80) || '') + '\n' +
            '👤 ' + (lang === 'ar' ? 'من: ' : 'From: ') + (currentUserData?.displayName || 'Mod') + '\n' +
            '📝 ' + (lang === 'ar' ? 'السبب: ' : 'Reason: ') + escalateNote.trim()
          );
          try { await window.sendStaffCommandBotMessage(targetUID, notifMsg, { type: 'feedback_escalation' }); } catch (_) {}
        }
        onNotification('🚀 ' + (lang === 'ar' ? 'تم التصعيد' : 'Escalated'));
        setEscalating(null); setEscalateTo(''); setEscalateNote('');
      } catch (e) { onNotification('❌ Error: ' + e.message); }
    };

    var handleEscalateFeedback = async (f) => {
      if (!escalateTo || !escalateNote.trim()) {
        onNotification('⚠️ ' + (lang === 'ar' ? 'اختر جهة واكتب السبب' : 'Select a target and write a reason'));
        return;
      }

      // Resolve role-based target to actual UIDs (T027 — role-based escalation)
      var resolvedUID = null;
      if (escalateTo === 'owner') {
        resolvedUID = window.OWNER_UID || null;
        if (!resolvedUID) {
          try {
            var ownerSnap = await usersCollection.where('role', '==', 'owner').limit(1).get();
            if (!ownerSnap.empty) resolvedUID = ownerSnap.docs[0].id;
          } catch (_) {}
        }
        if (!resolvedUID) { onNotification('❌ ' + (lang === 'ar' ? 'لم يُعثر على المالك' : 'Owner not found')); return; }
      } else if (escalateTo === 'admin_team') {
        // pick first available admin
        try {
          var adminSnap = await usersCollection.where('role', '==', 'admin').limit(1).get();
          if (!adminSnap.empty) {
            resolvedUID = adminSnap.docs[0].id;
          } else {
            // fall back to owner
            resolvedUID = window.OWNER_UID || null;
            if (!resolvedUID) {
              var ownerFallback = await usersCollection.where('role', '==', 'owner').limit(1).get();
              if (!ownerFallback.empty) resolvedUID = ownerFallback.docs[0].id;
            }
            if (!resolvedUID) { onNotification('❌ ' + (lang === 'ar' ? 'لا يوجد مديرون متاحون' : 'No admins available')); return; }
            onNotification('ℹ️ ' + (lang === 'ar' ? 'لا يوجد أدمن — تم التصعيد للمالك' : 'No admins — escalated to Owner'));
          }
        } catch (e) { onNotification('❌ Error: ' + e.message); return; }
      } else {
        // Legacy: individual UID (shouldn't happen with new dropdown, but keep for safety)
        resolvedUID = escalateTo;
      }

      await doEscalateFeedback(f, resolvedUID);
    };


    var optStyle = { background: '#1e293b', color: '#e5e7eb' };

    return (/*#__PURE__*/
      React.createElement('div', null,

      /* ── No-admin in-app dialog ─── */
      noAdminDialog && /*#__PURE__*/
      React.createElement('div', { style: { position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' } },
        React.createElement('div', { style: { background: '#1e293b', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '16px', padding: '24px', maxWidth: '320px', width: '90%' } },
          React.createElement('div', { style: { fontSize: '22px', textAlign: 'center', marginBottom: '8px' } }, '⚠️'),
          React.createElement('div', { style: { fontSize: '13px', fontWeight: 700, color: '#f59e0b', textAlign: 'center', marginBottom: '6px' } },
            lang === 'ar' ? 'لا يوجد مديرون' : 'No Admins assigned'),
          React.createElement('div', { style: { fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginBottom: '14px' } },
            lang === 'ar' ? 'هل تصعد للمالك بدلاً من ذلك؟' : 'Escalate to Owner instead?'),
          React.createElement('div', { style: { display: 'flex', gap: '8px' } },
            React.createElement('button', {
              onClick: async () => {
                var ownerEntry = staffList.find((s) => s.role === 'owner');
                var ownerUID = ownerEntry?.uid || ownerEntry?.id || window.OWNER_UID;
                setNoAdminDialog(null);
                if (ownerUID) await doEscalateFeedback(noAdminDialog.f, ownerUID);
                else onNotification('❌ ' + (lang === 'ar' ? 'لم يُعثر على المالك' : 'Owner not found'));
              },
              style: { flex: 1, padding: '8px', background: '#f59e0b', color: '#000', borderRadius: '8px', border: 'none', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }
            }, lang === 'ar' ? '✅ نعم، للمالك' : '✅ Yes, Owner'),
            React.createElement('button', {
              onClick: () => setNoAdminDialog(null),
              style: { flex: 1, padding: '8px', background: 'rgba(255,255,255,0.07)', color: '#9ca3af', borderRadius: '8px', border: 'none', fontSize: '11px', cursor: 'pointer' }
            }, lang === 'ar' ? 'إلغاء' : 'Cancel')
          )
        )
      ),

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
            var resolvedName = (f.userId && userNames[f.userId]) || f.userName || 'Anonymous';
            var isAcked = f.status === 'acknowledged';
            var inFlight = acking[f.id];

            return React.createElement('div', {
              key: f.id,
              style: {
                background: f.escalated ? 'rgba(139,92,246,0.04)' : isAcked ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.03)',
                border: '1px solid ' + (f.escalated ? 'rgba(139,92,246,0.2)' : isAcked ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'),
                borderRadius: '12px', padding: '12px'
              }
            },

              /* Top row */
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' } },
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
                  React.createElement('div', { style: { fontSize: '11px', fontWeight: 700, color: '#10b981' } }, resolvedName),
                  isAcked &&
                  React.createElement('span', { style: { fontSize: '9px', fontWeight: 700, background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '1px 6px', borderRadius: '10px' } },
                    '✓ ' + (lang === 'ar' ? 'تم الاستلام' : 'Seen')
                  ),
                  f.escalated &&
                  React.createElement('span', { style: { fontSize: '9px', fontWeight: 700, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', padding: '1px 6px', borderRadius: '10px' } },
                    '🚀 ', lang === 'ar' ? 'مُصعَّد لـ: ' + (f.escalatedToName || '?') : 'Escalated → ' + (f.escalatedToName || '?')
                  ),
                  React.createElement('span', { style: { fontSize: '10px', color: '#9ca3af' } },
                    f.createdAt?.toDate?.() ? f.createdAt.toDate().toLocaleString()
                    : (f.timestamp?.toDate?.() ? f.timestamp.toDate().toLocaleString() : '')
                  )
                ),
                myRole !== 'moderator' &&
                React.createElement('button', {
                  onClick: () => deleteFeedback(f.id),
                  style: { padding: '3px 8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '6px', fontSize: '9px', cursor: 'pointer', flexShrink: 0 }
                }, lang === 'ar' ? 'حذف' : 'Delete')
              ),

              /* Message body */
              React.createElement('div', { style: { background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '10px', fontSize: '11px', color: '#d1d5db', lineHeight: 1.6, marginBottom: '10px' } },
                f.text
              ),

              /* Escalation note (visible to admin/owner who received it) */
              f.escalated && f.escalateNote && ['admin','owner'].includes(myRole) &&
              React.createElement('div', { style: { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px', fontSize: '11px', color: '#a78bfa' } },
                '📝 ', lang === 'ar' ? 'ملاحظة التصعيد: ' : 'Escalation note: ',
                React.createElement('span', { style: { color: '#d1d5db' } }, f.escalateNote),
                React.createElement('div', { style: { fontSize: '10px', color: '#6b7280', marginTop: '2px' } },
                  lang === 'ar' ? 'من: ' : 'By: ', f.escalatedByName || '?'
                )
              ),

              /* Meta + action row */
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' } },
                React.createElement('div', { style: { fontSize: '9px', color: '#4b5563' } },
                  'User ID: ', f.userId || 'N/A', ' • Platform: ', f.platform || 'Web'
                ),

                /* Action buttons */
                React.createElement('div', { style: { display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' } },

                  /* Moderator: escalate button (if not yet escalated) */
                  myRole === 'moderator' && !f.escalated &&
                  React.createElement('button', {
                    onClick: () => { setEscalating(f.id); setEscalateTo(''); setEscalateNote(''); },
                    style: { padding: '5px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, border: 'none', background: 'rgba(139,92,246,0.12)', color: '#8b5cf6', cursor: 'pointer' }
                  }, '🚀 ' + (lang === 'ar' ? 'تصعيد' : 'Escalate')),

                  /* All staff can acknowledge (T027/T028) */
                  isAcked
                    ? React.createElement('div', { style: { fontSize: '10px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' } }, '✅ ', lang === 'ar' ? 'تم إبلاغ المستخدم' : 'User notified')
                    : React.createElement('button', {
                        onClick: () => handleAcknowledge(f),
                        disabled: inFlight,
                        style: { padding: '5px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, border: 'none', background: inFlight ? 'rgba(59,130,246,0.07)' : 'rgba(59,130,246,0.12)', color: '#60a5fa', cursor: inFlight ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }
                      }, inFlight ? '⏳' : '👁️ ' + (lang === 'ar' ? 'إشعار بالاستلام' : 'Acknowledge'))
                )
              ),

              /* Moderator escalation panel */
              escalating === f.id &&
              React.createElement('div', { style: { marginTop: '10px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' } },
                React.createElement('div', { style: { fontSize: '11px', fontWeight: 700, color: '#8b5cf6', marginBottom: '2px' } }, '🚀 ', lang === 'ar' ? 'تصعيد الملاحظة' : 'Escalate Feedback'),
                React.createElement('select', {
                  value: escalateTo,
                  onChange: (e) => setEscalateTo(e.target.value),
                  style: { width: '100%', padding: '8px', fontSize: '11px', background: '#1e293b', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', outline: 'none' }
                },
                  React.createElement('option', { value: '', style: optStyle }, lang === 'ar' ? '--- اختر الجهة ---' : '--- Select Target ---'),
                  /* Role-based targets (T027) — not individual UIDs */
                  React.createElement('option', { value: 'admin_team', style: optStyle }, lang === 'ar' ? '🛡️ فريق الإدارة (أدمن)' : '🛡️ Admin Team'),
                  React.createElement('option', { value: 'owner', style: optStyle }, lang === 'ar' ? '👑 المالك' : '👑 Owner')
                ),
                React.createElement('textarea', {
                  className: 'input-dark',
                  style: { width: '100%', padding: '8px', borderRadius: '8px', fontSize: '11px', minHeight: '50px' },
                  placeholder: lang === 'ar' ? 'سبب التصعيد...' : 'Reason for escalation...',
                  value: escalateNote, onChange: (e) => setEscalateNote(e.target.value)
                }),
                React.createElement('div', { style: { display: 'flex', gap: '6px' } },
                  React.createElement('button', {
                    onClick: () => handleEscalateFeedback(f),
                    style: { flex: 1, padding: '7px', background: '#8b5cf6', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }
                  }, lang === 'ar' ? 'إرسال' : 'Submit'),
                  React.createElement('button', {
                    onClick: () => setEscalating(null),
                    style: { padding: '7px 12px', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px', cursor: 'pointer' }
                  }, '✕')
                )
              )
            );
          })
        )
    ));
  };

  window.FeedbackInboxSection = FeedbackInboxSection;
})();