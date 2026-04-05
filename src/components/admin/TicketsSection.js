(function () {
  var { useState, useEffect } = React;

  // Role badge shown next to sender name
  var RoleBadge = ({ role }) => {
    var cfg = { owner: { icon: '👑', color: '#f59e0b' }, admin: { icon: '🛡️', color: '#ef4444' }, moderator: { icon: '🔰', color: '#3b82f6' } };
    if (!role || !cfg[role]) return null;
    return /*#__PURE__*/React.createElement('span', { style: { fontSize: '9px', fontWeight: 800, color: cfg[role].color, background: cfg[role].color + '20', padding: '1px 5px', borderRadius: '4px', marginLeft: '4px' } },
      cfg[role].icon, ' ', role.toUpperCase()
    );
  };

  var TicketsSection = ({ currentUser, currentUserData, lang, onNotification, onOpenProfile }) => {
    var [tickets, setTickets]           = useState([]);
    var [loading, setLoading]           = useState(true);
    var [filter, setFilter]             = useState('open');
    var [replyingTo, setReplyingTo]     = useState(null);
    var [replyText, setReplyText]       = useState('');
    var [banningUID, setBanningUID]     = useState(null);
    var [escalating, setEscalating]     = useState(null);
    var [escalateTo, setEscalateTo]     = useState('admin');
    var [escalateNote, setEscalateNote] = useState('');
    // In-app fallback dialog state (replaces confirm())
    var [noAdminDialog, setNoAdminDialog] = useState(null); // { ticket }

    var myRole = window.getUserRole ? window.getUserRole(currentUserData, currentUser?.uid) : currentUserData?.role;

    useEffect(() => {
      var unsub = ticketsCollection.orderBy('createdAt', 'desc').limit(100).onSnapshot(
        (snap) => { setTickets(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); },
        (err)  => { console.warn('[Tickets]', err.code, err.message); setLoading(false); }
      );
      return unsub;
    }, []);

    var sendReply = async (ticket) => {
      if (!replyText.trim()) return;
      try {
        var role = myRole || 'user';
        var msg = { senderId: currentUser.uid, senderName: currentUserData?.displayName || 'Support', senderRole: role, text: replyText.trim(), timestamp: TS() };
        await ticketsCollection.doc(ticket.id).update({
          messages: firebase.firestore.FieldValue.arrayUnion(msg),
          status: 'replied', updatedAt: TS(), lastMessageBy: currentUser.uid
        });
        if (window.logStaffAction) await window.logStaffAction(currentUser.uid, currentUserData?.displayName, 'REPLY_TICKET', ticket.userId, ticket.userName, `Ticket: ${ticket.id}`);
        onNotification('✅ Reply sent');
        setReplyingTo(null); setReplyText('');
      } catch (e) { onNotification('❌ Error'); }
    };

    var closeTicket = async (id, userId, userName) => {
      try {
        await ticketsCollection.doc(id).update({ status: 'closed', closedAt: TS() });
        if (window.logStaffAction) await window.logStaffAction(currentUser.uid, currentUserData?.displayName, 'CLOSE_TICKET', userId, userName, `Ticket: ${id}`);
        onNotification('✅ Ticket closed');
      } catch (e) { onNotification('❌ Error'); }
    };

    // Core escalation writer (shared between normal + no-admin fallback)
    var doEscalate = async (ticket, targetRole) => {
      var roleLabel = targetRole === 'owner'
        ? (lang === 'ar' ? 'المالك' : 'Owner')
        : (lang === 'ar' ? 'فريق الإدارة' : 'Admin Team');
      try {
        await ticketsCollection.doc(ticket.id).update({
          escalated: true,
          escalatedTo: targetRole,
          escalatedToName: roleLabel,
          escalateNote: escalateNote.trim(),
          escalatedAt: TS(),
          escalatedBy: currentUser.uid,
          escalatedByName: currentUserData?.displayName || 'Mod'
        });
        if (window.logStaffAction) {
          try {
            await window.logStaffAction(currentUser.uid, currentUserData?.displayName, 'ESCALATE_TICKET', ticket.userId, ticket.userName, 'Ticket ' + ticket.id + ' → ' + targetRole);
          } catch (_) {}
        }
        if (window.sendStaffCommandBotMessage) {
          try {
            var staffSnap = await usersCollection.where('role', '==', targetRole).get();
            var notifMsg = (
              '🚨 ' + (lang === 'ar' ? 'تصعيد تذكرة: ' : 'Ticket Escalation: ') +
              (ticket.subject || ticket.id) + '\n' +
              '👤 ' + (lang === 'ar' ? 'من: ' : 'From: ') + (currentUserData?.displayName || 'Mod') + '\n' +
              '📝 ' + (lang === 'ar' ? 'السبب: ' : 'Reason: ') + escalateNote.trim() + '\n' +
              '→ ' + (lang === 'ar' ? 'افتح تبويب التذاكر للمراجعة.' : 'Open the Tickets tab to review.')
            );
            var notifPromises = staffSnap.docs.map((d) => window.sendStaffCommandBotMessage(d.id, notifMsg, { type: 'escalation' }));
            var ownerUID = window.OWNER_UID || (window.ADMIN_UIDS && window.ADMIN_UIDS[0]);
            if (ownerUID && targetRole !== 'owner') notifPromises.push(window.sendStaffCommandBotMessage(ownerUID, notifMsg, { type: 'escalation' }));
            await Promise.allSettled(notifPromises);
          } catch (_) {}
        }
        onNotification('🚀 ' + (lang === 'ar' ? 'تم التصعيد' : 'Escalated'));
        setEscalating(null); setEscalateTo('admin'); setEscalateNote('');
      } catch (e) { onNotification('❌ Error: ' + e.message); }
    };

    var handleEscalate = async (ticket) => {
      if (!escalateTo || !escalateNote.trim()) { onNotification('⚠️ ' + (lang === 'ar' ? 'اختر هدفاً واكتب سبب' : 'Choose a target and write a note.')); return; }
      if (escalateTo === 'admin') {
        try {
          var adminSnap = await usersCollection.where('role', '==', 'admin').limit(1).get();
          if (adminSnap.empty) {
            // Show in-app dialog instead of confirm()
            setNoAdminDialog({ ticket }); return;
          }
        } catch (_) { /* continue */ }
      }
      await doEscalate(ticket, escalateTo);
    };

    var filtered = tickets.filter((t) => filter === 'open' ? (t.status === 'open' || t.status === 'replied') : t.status === 'closed');

    // Select option common style for dark dropdown
    var optStyle = { background: '#1e293b', color: '#e5e7eb' };

    return (/*#__PURE__*/
      React.createElement('div', null,

      /* ── In-app "No Admin" dialog ─────────────────────────────────────── */
      noAdminDialog && /*#__PURE__*/
      React.createElement('div', { style: { position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' } },
        React.createElement('div', { style: { background: '#1e293b', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '16px', padding: '24px', maxWidth: '340px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' } },
          React.createElement('div', { style: { fontSize: '24px', marginBottom: '10px', textAlign: 'center' } }, '⚠️'),
          React.createElement('div', { style: { fontSize: '13px', fontWeight: 700, color: '#f59e0b', marginBottom: '8px', textAlign: 'center' } },
            lang === 'ar' ? 'لا يوجد مديرون حالياً' : 'No Admins currently assigned'
          ),
          React.createElement('div', { style: { fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginBottom: '16px' } },
            lang === 'ar' ? 'هل تريد تصعيد التذكرة إلى المالك بدلاً من ذلك؟' : 'Would you like to escalate to the Owner instead?'
          ),
          React.createElement('div', { style: { display: 'flex', gap: '8px' } },
            React.createElement('button', {
              onClick: async () => { var t = noAdminDialog.ticket; setNoAdminDialog(null); await doEscalate(t, 'owner'); },
              style: { flex: 1, padding: '9px', background: '#f59e0b', color: '#000', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }
            }, lang === 'ar' ? '✅ نعم، للمالك' : '✅ Yes, to Owner'),
            React.createElement('button', {
              onClick: () => setNoAdminDialog(null),
              style: { flex: 1, padding: '9px', background: 'rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: '8px', border: 'none', fontSize: '12px', cursor: 'pointer' }
            }, lang === 'ar' ? 'إلغاء' : 'Cancel')
          )
        )
      ),

      /* ── Header ── */
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' } },
        React.createElement('div', { style: { fontSize: '13px', fontWeight: 700, color: '#f59e0b' } }, '🎫 ', lang === 'ar' ? 'تذاكر الدعم' : 'Support Tickets'),
        React.createElement('div', { style: { display: 'flex', gap: '4px', flexWrap: 'wrap' } },
          ['open', 'closed'].map((f) => /*#__PURE__*/
            React.createElement('button', { key: f, onClick: () => setFilter(f),
              style: { padding: '4px 12px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer', border: 'none', fontWeight: 700,
                background: filter === f ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                color: filter === f ? '#000' : '#9ca3af' } },
              lang === 'ar' ? (f === 'open' ? 'مفتوحة' : 'مغلقة') : f.toUpperCase()
            )
          )
        )
      ),

      loading
        ? /*#__PURE__*/React.createElement('div', { style: { textAlign: 'center', padding: '20px' } }, '⏳')
        : /*#__PURE__*/React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },

          filtered.length === 0 && /*#__PURE__*/
          React.createElement('div', { style: { textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '12px' } },
            lang === 'ar' ? 'لا توجد تذاكر' : 'No tickets found'),

          filtered.map((t) => /*#__PURE__*/
            React.createElement('div', { key: t.id, style: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px' } },

            /* Ticket header */
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
                React.createElement('span', { onClick: () => onOpenProfile && onOpenProfile(t.userId), style: { fontSize: '12px', fontWeight: 700, cursor: onOpenProfile ? 'pointer' : 'default', color: '#f59e0b' } }, t.userName || 'User'),
                React.createElement('span', { style: { fontSize: '10px', color: '#9ca3af' } }, t.createdAt?.toDate?.()?.toLocaleString() || ''),
                t.escalated && /*#__PURE__*/React.createElement('span', { style: { fontSize: '9px', background: 'rgba(139,92,246,0.2)', color: '#8b5cf6', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 } }, '🚀 ', lang === 'ar' ? 'مُصعَّد لـ: ' + (t.escalatedToName || t.escalatedTo) : 'ESCALATED → ' + (t.escalatedToName || t.escalatedTo))
              ),
              React.createElement('span', { style: { fontSize: '10px', color: '#6b7280' } }, '#', t.id?.slice(-6))
            ),

            /* Messages */
            React.createElement('div', { style: { background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '10px', marginBottom: '12px' } },
              React.createElement('div', { style: { fontSize: '12px', color: '#d1d5db', marginBottom: '8px', lineHeight: 1.5 } }, t.subject),
              (t.messages || []).map((m, idx) => {
                var isMine = m.senderId !== t.userId;
                return /*#__PURE__*/React.createElement('div', { key: idx, style: { marginTop: '6px', padding: '8px 10px', borderRadius: '8px',
                  background: isMine ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.05)',
                  marginLeft: isMine ? '12px' : '0', marginRight: isMine ? '0' : '12px' } },
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' } },
                    React.createElement('span', { style: { fontSize: '9px', color: '#6b7280', fontWeight: 600 } }, m.senderName || 'User'),
                    /*#__PURE__*/React.createElement(RoleBadge, { role: m.senderRole }),
                    React.createElement('span', { style: { fontSize: '9px', color: '#4b5563' } }, ' • ', m.timestamp?.toDate?.()?.toLocaleTimeString() || '')
                  ),
                  React.createElement('div', { style: { fontSize: '11px', color: '#e5e7eb' } }, m.text)
                );
              })
            ),

            /* Escalation info banner (visible to admin/owner) */
            t.escalated && ['admin','owner'].includes(myRole) && /*#__PURE__*/
            React.createElement('div', { style: { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px', fontSize: '11px', color: '#a78bfa' } },
              '🚀 ', lang === 'ar' ? 'صُعِّدت بواسطة: ' : 'Escalated by: ',
              React.createElement('strong', null, t.escalatedByName || '?'),
              ' → ', t.escalatedToName || t.escalatedTo,
              t.escalateNote && React.createElement('div', { style: { color: '#94a3b8', marginTop: '4px' } }, t.escalateNote)
            ),

            /* Actions */
            t.status !== 'closed'
              ? /*#__PURE__*/React.createElement(React.Fragment, null,

                /* Ban panel (admin/owner only) */
                banningUID === t.id
                  ? /*#__PURE__*/React.createElement(window.BanPanelInline, {
                      reportedUID: t.userId, reportedName: t.userName, reportId: null,
                      currentUser, currentUserData, lang,
                      onDone: (msg) => { setBanningUID(null); onNotification(msg); },
                      onCancel: () => setBanningUID(null) })

                /* Escalate panel (moderator) */
                : escalating === t.id
                  ? /*#__PURE__*/React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                      React.createElement('select', { value: escalateTo, onChange: (e) => setEscalateTo(e.target.value),
                        style: { width: '100%', padding: '8px', fontSize: '12px', background: '#1e293b', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', cursor: 'pointer', outline: 'none' } },
                        React.createElement('option', { value: '', style: optStyle }, lang === 'ar' ? '--- اختر ---' : '--- Select ---'),
                        React.createElement('option', { value: 'admin', style: optStyle }, lang === 'ar' ? '🛡️ فريق الإدارة (Admin)' : '🛡️ Admin Team'),
                        React.createElement('option', { value: 'owner', style: optStyle }, lang === 'ar' ? '👑 المالك (Owner)' : '👑 Owner')
                      ),
                      React.createElement('textarea', { className: 'input-dark', style: { width: '100%', padding: '8px', borderRadius: '8px', fontSize: '11px', minHeight: '50px' },
                        placeholder: lang === 'ar' ? 'سبب التصعيد...' : 'Escalation reason...',
                        value: escalateNote, onChange: (e) => setEscalateNote(e.target.value) }),
                      React.createElement('div', { style: { display: 'flex', gap: '6px' } },
                        React.createElement('button', { onClick: () => handleEscalate(t), style: { flex: 1, padding: '7px', background: '#8b5cf6', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px', fontWeight: 700, cursor: 'pointer' } }, '🚀 ', lang === 'ar' ? 'تصعيد' : 'Escalate'),
                        React.createElement('button', { onClick: () => setEscalating(null), style: { padding: '7px 12px', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px', cursor: 'pointer' } }, '✕')
                      )
                    )

                /* Reply input */
                : replyingTo === t.id
                  ? /*#__PURE__*/React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                      React.createElement('textarea', { className: 'input-dark', style: { width: '100%', padding: '8px', borderRadius: '8px', fontSize: '12px', minHeight: '60px' },
                        placeholder: lang === 'ar' ? 'اكتب ردك هنا...' : 'Type your reply...', value: replyText, onChange: (e) => setReplyText(e.target.value) }),
                      React.createElement('div', { style: { display: 'flex', gap: '6px' } },
                        React.createElement('button', { onClick: () => sendReply(t), style: { flex: 1, padding: '8px', background: '#f59e0b', color: '#000', borderRadius: '8px', border: 'none', fontSize: '11px', fontWeight: 700, cursor: 'pointer' } }, lang === 'ar' ? 'إرسال الرد' : 'Send Reply'),
                        React.createElement('button', { onClick: () => setReplyingTo(null), style: { padding: '8px 14px', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px', cursor: 'pointer' } }, '✕')
                      )
                    )

                /* Button bar */
                : /*#__PURE__*/React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
                    React.createElement('button', { onClick: () => setReplyingTo(t.id), style: { flex: 1, minWidth: '80px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' } }, '💬 ', lang === 'ar' ? 'رد' : 'Reply'),
                    React.createElement('button', { onClick: () => closeTicket(t.id, t.userId, t.userName), style: { flex: 1, minWidth: '80px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' } }, '✅ ', lang === 'ar' ? 'إغلاق' : 'Close'),
                    myRole === 'moderator'
                      ? /*#__PURE__*/React.createElement('button', { onClick: () => { setEscalating(t.id); setEscalateTo(''); setEscalateNote(''); }, style: { flex: 1, minWidth: '80px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6', padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' } }, '🚀 ', lang === 'ar' ? 'تصعيد' : 'Escalate')
                      : /*#__PURE__*/React.createElement('button', { onClick: () => setBanningUID(t.id), style: { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer' } }, '🔨')
                  )

              ) : /*#__PURE__*/
              React.createElement('div', { style: { fontSize: '11px', color: '#10b981', textAlign: 'center', fontWeight: 700 } }, '✅ ', lang === 'ar' ? 'هذه التذكرة مغلقة' : 'Ticket closed')
            )
          )
        )
      ));
  };

  window.TicketsSection = TicketsSection;
})();