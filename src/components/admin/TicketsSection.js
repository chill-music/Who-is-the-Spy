(function () {
  var { useState, useEffect } = React;

  // Role badge shown next to sender name in chat
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
    var [escalateTo, setEscalateTo]     = useState('admin');  // 'admin' | 'owner'
    var [escalateNote, setEscalateNote] = useState('');

    // T018: no hidden role filter — all queries use the same onSnapshot, access controlled by Firestore rules
    var myRole = window.getUserRole ? window.getUserRole(currentUserData, currentUser?.uid) : currentUserData?.role;

    // ── Load tickets ──────────────────────────────────────────────────────
    useEffect(() => {
      var unsub = ticketsCollection.orderBy('createdAt', 'desc').limit(100).onSnapshot(
        (snap) => { setTickets(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); },
        (err)  => { console.warn('[Tickets]', err.code, err.message); setLoading(false); }
      );
      return unsub;
    }, []);

    // ── Actions ───────────────────────────────────────────────────────────
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

    // ── Escalate (T016 + T017 + T037 + T038) ────────────────────────────
    var handleEscalate = async (ticket) => {
      if (!escalateTo || !escalateNote.trim()) { onNotification('⚠️ Choose a target and write a note.'); return; }

      var targetRole = escalateTo; // 'admin' | 'owner'
      var roleLabel  = targetRole === 'owner'
        ? (lang === 'ar' ? 'المالك' : 'Owner')
        : (lang === 'ar' ? 'فريق الإدارة' : 'Admin Team');

      // T037 — No-admin guard: if escalating to admins but none exist, prompt to send to owner
      if (targetRole === 'admin') {
        try {
          var adminSnap = await usersCollection.where('role', '==', 'admin').limit(1).get();
          if (adminSnap.empty) {
            var fallback = confirm(
              lang === 'ar'
                ? '⚠️ لا يوجد مديرون حالياً. هل تريد تصعيد إلى المالك بدلاً?'
                : '⚠️ No Admins are currently assigned. Escalate to Owner instead?'
            );
            if (!fallback) return;
            targetRole = 'owner';
            roleLabel  = lang === 'ar' ? 'المالك' : 'Owner';
          }
        } catch (e) { /* Firestore error — continue with original target */ }
      }

      try {
        // Write ticket update
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
          await window.logStaffAction(
            currentUser.uid, currentUserData?.displayName,
            'ESCALATE_TICKET', ticket.userId, ticket.userName,
            'Ticket ' + ticket.id + ' → ' + targetRole
          );
        }

        // T038 — Notify all staff of target role via Staff Command Bot
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
            // Also always notify the owner
            var ownerUID = window.OWNER_UID || (window.ADMIN_UIDS && window.ADMIN_UIDS[0]);
            if (ownerUID && targetRole !== 'owner') notifPromises.push(window.sendStaffCommandBotMessage(ownerUID, notifMsg, { type: 'escalation' }));
            await Promise.allSettled(notifPromises);
          } catch (notifErr) { console.warn('[Tickets] escalation notify error:', notifErr); }
        }

        onNotification('🚀 ' + (lang === 'ar' ? 'تم التصعيد' : 'Escalated'));
        setEscalating(null); setEscalateTo('admin'); setEscalateNote('');
      } catch (e) { onNotification('❌ Error: ' + e.message); }
    };

    var filtered = tickets.filter((t) => filter === 'open' ? (t.status === 'open' || t.status === 'replied') : t.status === 'closed');

    return (/*#__PURE__*/
      React.createElement('div', null, /*#__PURE__*/

      /* ── Header ── */
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' } }, /*#__PURE__*/
        React.createElement('div', { style: { fontSize: '13px', fontWeight: 700, color: '#f59e0b' } }, '🎫 ', lang === 'ar' ? 'تذاكر الدعم' : 'Support Tickets'), /*#__PURE__*/
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

      /* ── Error hint for moderator ── */
      loading && myRole === 'moderator' && /*#__PURE__*/
      React.createElement('div', { style: { padding: '12px', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '11px', color: '#f59e0b', marginBottom: '12px' } },
        '⚠️ ', lang === 'ar' ? 'إذا لم تظهر التذاكر، تأكد من تحديث قوانين Firestore للسماح للمشرفين بالقراءة.' : 'If tickets don\'t appear, make sure Firestore rules allow moderators to read.'
      ),

      loading
        ? /*#__PURE__*/React.createElement('div', { style: { textAlign: 'center', padding: '20px' } }, '⏳')
        : /*#__PURE__*/React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },

          filtered.length === 0 && /*#__PURE__*/
          React.createElement('div', { style: { textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '12px' } },
            lang === 'ar' ? 'لا توجد تذاكر' : 'No tickets found'),

          filtered.map((t) => /*#__PURE__*/
            React.createElement('div', { key: t.id, style: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px' } }, /*#__PURE__*/

            /* Ticket header */
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' } }, /*#__PURE__*/
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } }, /*#__PURE__*/
                React.createElement('span', { onClick: () => onOpenProfile && onOpenProfile(t.userId), style: { fontSize: '12px', fontWeight: 700, cursor: 'pointer', color: '#f59e0b' } }, t.userName || 'User'), /*#__PURE__*/
                React.createElement('span', { style: { fontSize: '10px', color: '#9ca3af' } }, t.createdAt?.toDate?.()?.toLocaleString() || ''), /*#__PURE__*/
                t.escalated && /*#__PURE__*/React.createElement('span', { style: { fontSize: '9px', background: 'rgba(139,92,246,0.2)', color: '#8b5cf6', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 } }, '🚀 ESCALATED')
              ), /*#__PURE__*/
              React.createElement('span', { style: { fontSize: '10px', color: '#6b7280' } }, '#', t.id?.slice(-6))
            ),

            /* Messages */
            React.createElement('div', { style: { background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '10px', marginBottom: '12px' } }, /*#__PURE__*/
              React.createElement('div', { style: { fontSize: '12px', color: '#d1d5db', marginBottom: '8px', lineHeight: 1.5 } }, t.subject),
              (t.messages || []).map((m, idx) => {
                var isMine = m.senderId !== t.userId;
                return /*#__PURE__*/React.createElement('div', { key: idx, style: { marginTop: '6px', padding: '8px 10px', borderRadius: '8px',
                  background: isMine ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.05)',
                  marginLeft: isMine ? '12px' : '0', marginRight: isMine ? '0' : '12px' } }, /*#__PURE__*/
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' } }, /*#__PURE__*/
                    React.createElement('span', { style: { fontSize: '9px', color: '#6b7280', fontWeight: 600 } }, m.senderName || 'User'),
                    /*#__PURE__*/React.createElement(RoleBadge, { role: m.senderRole }), /*#__PURE__*/
                    React.createElement('span', { style: { fontSize: '9px', color: '#4b5563' } }, ' • ', m.timestamp?.toDate?.()?.toLocaleTimeString() || '')
                  ), /*#__PURE__*/
                  React.createElement('div', { style: { fontSize: '11px', color: '#e5e7eb' } }, m.text)
                );
              })
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
                  ? /*#__PURE__*/React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, /*#__PURE__*/
                      /* T016 + T017: Static role-based dropdown with proper dark styling */
                      React.createElement('select', { value: escalateTo, onChange: (e) => setEscalateTo(e.target.value),
                        className: 'input-dark',
                        style: { width: '100%', padding: '8px', fontSize: '12px', background: '#1e293b', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', cursor: 'pointer' } },
                        React.createElement('option', { value: 'admin', style: { background: '#1e293b', color: '#e5e7eb' } },
                          lang === 'ar' ? '🛡️ فريق الإدارة' : '🛡️ Admin Team'
                        ),
                        React.createElement('option', { value: 'owner', style: { background: '#1e293b', color: '#e5e7eb' } },
                          lang === 'ar' ? '👑 المالك' : '👑 Owner'
                        )
                      ), /*#__PURE__*/
                      React.createElement('textarea', { className: 'input-dark', style: { width: '100%', padding: '8px', borderRadius: '8px', fontSize: '11px', minHeight: '50px' },
                        placeholder: lang === 'ar' ? 'سبب التصعيد...' : 'Escalation reason...',
                        value: escalateNote, onChange: (e) => setEscalateNote(e.target.value) }), /*#__PURE__*/
                      React.createElement('div', { style: { display: 'flex', gap: '6px' } }, /*#__PURE__*/
                        React.createElement('button', { onClick: () => handleEscalate(t), style: { flex: 1, padding: '7px', background: '#8b5cf6', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px', fontWeight: 700, cursor: 'pointer' } }, '🚀 ', lang === 'ar' ? 'تصعيد' : 'Escalate'), /*#__PURE__*/
                        React.createElement('button', { onClick: () => setEscalating(null), style: { padding: '7px 12px', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px', cursor: 'pointer' } }, '✕')
                      )
                    )

                /* Reply input */
                : replyingTo === t.id
                  ? /*#__PURE__*/React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, /*#__PURE__*/
                      React.createElement('textarea', { className: 'input-dark', style: { width: '100%', padding: '8px', borderRadius: '8px', fontSize: '12px', minHeight: '60px' },
                        placeholder: lang === 'ar' ? 'اكتب ردك هنا...' : 'Type your reply...', value: replyText, onChange: (e) => setReplyText(e.target.value) }), /*#__PURE__*/
                      React.createElement('div', { style: { display: 'flex', gap: '6px' } }, /*#__PURE__*/
                        React.createElement('button', { onClick: () => sendReply(t), style: { flex: 1, padding: '8px', background: '#f59e0b', color: '#000', borderRadius: '8px', border: 'none', fontSize: '11px', fontWeight: 700, cursor: 'pointer' } }, lang === 'ar' ? 'إرسال الرد' : 'Send Reply'), /*#__PURE__*/
                        React.createElement('button', { onClick: () => setReplyingTo(null), style: { padding: '8px 14px', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px', cursor: 'pointer' } }, '✕')
                      )
                    )

                /* Button bar */
                : /*#__PURE__*/React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } }, /*#__PURE__*/
                    React.createElement('button', { onClick: () => setReplyingTo(t.id), style: { flex: 1, minWidth: '80px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' } }, '💬 ', lang === 'ar' ? 'رد' : 'Reply'), /*#__PURE__*/
                    React.createElement('button', { onClick: () => closeTicket(t.id, t.userId, t.userName), style: { flex: 1, minWidth: '80px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' } }, '✅ ', lang === 'ar' ? 'إغلاق' : 'Close'), /*#__PURE__*/
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