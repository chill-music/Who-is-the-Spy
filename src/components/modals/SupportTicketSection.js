(function () {
  var { useState, useEffect } = React;

  var SupportTicketSection = ({ user, userData, lang, onNotification }) => {
    var [view, setView] = useState('list'); // 'list' | 'new' | 'detail'
    var [myTickets, setMyTickets] = useState([]);
    var [loading, setLoading] = useState(true);
    var [selected, setSelected] = useState(null);
    var [submitting, setSubmitting] = useState(false);
    var [userReply, setUserReply] = useState('');
    var [sendingReply, setSendingReply] = useState(false);

    // New ticket form state
    var [subject, setSubject] = useState('');
    var [message, setMessage] = useState('');
    var [category, setCategory] = useState('other');

    useEffect(() => {
      if (!user) return;
      var unsub = ticketsCollection.
      where('userId', '==', user.uid).
      onSnapshot((snap) => {
        var data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          var ta = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
          var tb = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
          return tb - ta;
        });
        setMyTickets(data);
        // تحديث التذكرة المحددة
        setSelected((prev) => {
          if (!prev) return null;
          return data.find((t) => t.id === prev.id) || prev;
        });
        setLoading(false);
      }, () => setLoading(false));
      return unsub;
    }, [user?.uid]);

    var handleSubmitTicket = async () => {
      if (!subject.trim() || !message.trim() || !user) return;
      setSubmitting(true);
      try {
        await ticketsCollection.add({
          userId: user.uid,
          userName: userData?.displayName || 'User',
          userPhoto: userData?.photoURL || '',
          subject: subject.trim(),
          message: message.trim(),
          category,
          status: 'open',
          responses: [],
          createdAt: TS(),
          lastUpdated: TS()
        });
        setSubject('');setMessage('');setCategory('other');
        setView('list');
        onNotification(lang === 'ar' ? '✅ تم إرسال تذكرتك!' : '✅ Ticket submitted!');
      } catch (e) {
        onNotification(lang === 'ar' ? '❌ حدث خطأ' : '❌ Error');
      }
      setSubmitting(true);
    };

    var handleUserReply = async () => {
      if (!userReply.trim() || !selected) return;
      setSendingReply(true);
      try {
        var reply = {
          by: user.uid,
          byName: userData?.displayName || 'User',
          byRole: 'user',
          message: userReply.trim(),
          timestamp: new Date().toISOString()
        };
        await ticketsCollection.doc(selected.id).update({
          responses: firebase.firestore.FieldValue.arrayUnion(reply),
          status: 'open',
          lastUpdated: TS()
        });
        setUserReply('');
        onNotification(lang === 'ar' ? '✅ تم إرسال ردك' : '✅ Reply sent');
      } catch (e) {onNotification('❌ Error');}
      setSendingReply(false);
    };

    var statusCfg = {
      open: { label_ar: 'مفتوح', label_en: 'Open', color: '#ef4444' },
      answered: { label_ar: 'تم الرد', label_en: 'Answered', color: '#f59e0b' },
      closed: { label_ar: 'مغلق', label_en: 'Closed', color: '#6b7280' }
    };
    var catIcon = { bug: '🐛', account: '👤', payment: '💳', other: '❓' };
    var catLabels_ar = { bug: 'خطأ تقني', account: 'حساب', payment: 'دفع', other: 'أخرى' };
    var catLabels_en = { bug: 'Bug Report', account: 'Account', payment: 'Payment', other: 'Other' };

    // ── Detail View ──
    if (view === 'detail' && selected) {
      var sc = statusCfg[selected.status] || statusCfg.open;
      return (/*#__PURE__*/
        React.createElement("div", { className: "settings-section" }, /*#__PURE__*/
        React.createElement("div", { className: "settings-section-title" }, /*#__PURE__*/
        React.createElement("span", null, "\uD83C\uDFAB"), /*#__PURE__*/
        React.createElement("span", null, lang === 'ar' ? 'تفاصيل التذكرة' : 'Ticket Details')
        ), /*#__PURE__*/
        React.createElement("button", { onClick: () => setView('list'),
          style: { fontSize: '11px', color: '#00f2ff', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' } }, "\u2190 ",
        lang === 'ar' ? 'رجوع' : 'Back'
        ), /*#__PURE__*/
        React.createElement("div", { style: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px' } }, /*#__PURE__*/
        React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' } }, /*#__PURE__*/
        React.createElement("div", { style: { fontWeight: 700, fontSize: '13px' } }, selected.subject), /*#__PURE__*/
        React.createElement("span", { style: { fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, background: `${sc.color}15`, border: `1px solid ${sc.color}30`, color: sc.color } },
        lang === 'ar' ? sc.label_ar : sc.label_en
        )
        ), /*#__PURE__*/

        React.createElement("div", { style: { background: 'rgba(112,0,255,0.05)', border: '1px solid rgba(112,0,255,0.15)', borderRadius: '7px', padding: '10px', marginBottom: '10px', fontSize: '12px', color: '#d1d5db' } }, /*#__PURE__*/
        React.createElement("div", { style: { fontSize: '10px', color: '#7c3aed', fontWeight: 700, marginBottom: '4px' } }, "\uD83D\uDC64 ", lang === 'ar' ? 'رسالتك' : 'Your message'),
        selected.message
        ),

        (selected.responses || []).map((r, i) => {
          var isStaff = r.byRole !== 'user';
          return (/*#__PURE__*/
            React.createElement("div", { key: i, style: {
                background: isStaff ? 'rgba(0,242,255,0.05)' : 'rgba(112,0,255,0.05)',
                border: `1px solid ${isStaff ? 'rgba(0,242,255,0.15)' : 'rgba(112,0,255,0.15)'}`,
                borderRadius: '7px', padding: '10px', marginBottom: '6px',
                marginLeft: isStaff ? '0' : '12px'
              } }, /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '10px', color: isStaff ? '#00f2ff' : '#a78bfa', fontWeight: 700, marginBottom: '4px' } },
            isStaff ? '👮' : '👤', " ", r.byName, /*#__PURE__*/
            React.createElement("span", { style: { fontWeight: 400, color: '#6b7280', marginLeft: '6px' } },
            new Date(r.timestamp).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')
            )
            ), /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '12px', color: '#d1d5db', lineHeight: 1.6 } }, r.message)
            ));

        }),

        selected.status !== 'closed' && /*#__PURE__*/
        React.createElement("div", { style: { marginTop: '10px' } }, /*#__PURE__*/
        React.createElement("textarea", {
          style: { width: '100%', padding: '8px', borderRadius: '7px', fontSize: '11px', minHeight: '55px', resize: 'vertical',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' },
          placeholder: lang === 'ar' ? 'أضف تعليقاً أو معلومات إضافية...' : 'Add a comment or more info...',
          value: userReply,
          onChange: (e) => setUserReply(e.target.value) }), /*#__PURE__*/
        React.createElement("button", { onClick: handleUserReply, disabled: sendingReply || !userReply.trim(),
          className: "btn-neon", style: { width: '100%', padding: '7px', borderRadius: '7px', marginTop: '6px', fontSize: '12px', fontWeight: 700 } },
        sendingReply ? '⏳' : `📨 ${lang === 'ar' ? 'إرسال' : 'Send'}`
        )
        ),

        selected.status === 'closed' && /*#__PURE__*/
        React.createElement("div", { style: { textAlign: 'center', fontSize: '11px', color: '#6b7280', padding: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '8px' } }, "\uD83D\uDD12 ",
        lang === 'ar' ? 'هذه التذكرة مغلقة' : 'This ticket is closed'
        )

        )
        ));

    }

    // ── New Ticket Form ──
    if (view === 'new') {
      return (/*#__PURE__*/
        React.createElement("div", { className: "settings-section" }, /*#__PURE__*/
        React.createElement("div", { className: "settings-section-title" }, /*#__PURE__*/
        React.createElement("span", null, "\uD83C\uDFAB"), /*#__PURE__*/
        React.createElement("span", null, lang === 'ar' ? 'تذكرة دعم جديدة' : 'New Support Ticket')
        ), /*#__PURE__*/
        React.createElement("button", { onClick: () => setView('list'),
          style: { fontSize: '11px', color: '#00f2ff', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '10px' } }, "\u2190 ",
        lang === 'ar' ? 'رجوع' : 'Back'
        ), /*#__PURE__*/
        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, /*#__PURE__*/

        React.createElement("div", null, /*#__PURE__*/
        React.createElement("div", { style: { fontSize: '10px', color: '#9ca3af', marginBottom: '5px' } }, lang === 'ar' ? 'نوع المشكلة:' : 'Category:'), /*#__PURE__*/
        React.createElement("div", { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
        ['bug', 'account', 'payment', 'other'].map((c) => /*#__PURE__*/
        React.createElement("button", { key: c, onClick: () => setCategory(c),
          style: { padding: '4px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer',
            background: category === c ? 'rgba(0,242,255,0.15)' : 'rgba(255,255,255,0.05)',
            border: category === c ? '1px solid rgba(0,242,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
            color: category === c ? '#00f2ff' : '#9ca3af', fontWeight: category === c ? 700 : 400 } },
        catIcon[c], " ", lang === 'ar' ? catLabels_ar[c] : catLabels_en[c]
        )
        )
        )
        ), /*#__PURE__*/

        React.createElement("div", null, /*#__PURE__*/
        React.createElement("div", { style: { fontSize: '10px', color: '#9ca3af', marginBottom: '5px' } }, lang === 'ar' ? 'عنوان المشكلة:' : 'Subject:'), /*#__PURE__*/
        React.createElement("input", {
          style: { width: '100%', padding: '8px 10px', borderRadius: '7px', fontSize: '12px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' },
          placeholder: lang === 'ar' ? 'وصف مختصر للمشكلة...' : 'Brief description of your issue...',
          value: subject,
          onChange: (e) => setSubject(e.target.value) })
        ), /*#__PURE__*/

        React.createElement("div", null, /*#__PURE__*/
        React.createElement("div", { style: { fontSize: '10px', color: '#9ca3af', marginBottom: '5px' } }, lang === 'ar' ? 'تفاصيل المشكلة:' : 'Details:'), /*#__PURE__*/
        React.createElement("textarea", {
          style: { width: '100%', padding: '8px 10px', borderRadius: '7px', fontSize: '12px', minHeight: '80px', resize: 'vertical',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' },
          placeholder: lang === 'ar' ? 'اشرح مشكلتك بالتفصيل...' : 'Describe your issue in detail...',
          value: message,
          onChange: (e) => setMessage(e.target.value) })
        ), /*#__PURE__*/
        React.createElement("button", { onClick: handleSubmitTicket, disabled: submitting || !subject.trim() || !message.trim(),
          className: "btn-neon", style: { width: '100%', padding: '9px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, marginTop: '2px' } },
        submitting ? '⏳' : `🎫 ${lang === 'ar' ? 'إرسال التذكرة' : 'Submit Ticket'}`
        )
        )
        ));

    }

    // ── List View ──
    var openCount = myTickets.filter((t) => t.status === 'open' || t.status === 'answered').length;
    return (/*#__PURE__*/
      React.createElement("div", { className: "settings-section" }, /*#__PURE__*/
      React.createElement("div", { className: "settings-section-title", style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/
      React.createElement("span", null, "\uD83C\uDFAB"), /*#__PURE__*/
      React.createElement("span", null, lang === 'ar' ? 'الدعم الفني' : 'Support'),
      openCount > 0 && /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '10px', padding: '1px 6px', borderRadius: '10px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8', fontWeight: 700 } },
      openCount
      )

      ), /*#__PURE__*/
      React.createElement("button", { onClick: () => setView('new'),
        style: { fontSize: '10px', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700,
          background: 'rgba(0,242,255,0.1)', border: '1px solid rgba(0,242,255,0.25)', color: '#00f2ff' } }, "+ ",
      lang === 'ar' ? 'تذكرة جديدة' : 'New Ticket'
      )
      ),

      loading ? /*#__PURE__*/
      React.createElement("div", { style: { textAlign: 'center', padding: '16px', color: '#6b7280', fontSize: '12px' } }, "\u23F3") :
      myTickets.length === 0 ? /*#__PURE__*/
      React.createElement("div", { style: { textAlign: 'center', padding: '20px', color: '#6b7280' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '28px', marginBottom: '8px' } }, "\uD83C\uDFAB"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '12px', marginBottom: '10px' } }, lang === 'ar' ? 'ليس لديك تذاكر دعم بعد' : 'No support tickets yet'), /*#__PURE__*/
      React.createElement("button", { onClick: () => setView('new'),
        style: { fontSize: '11px', padding: '6px 16px', borderRadius: '7px', cursor: 'pointer', fontWeight: 700,
          background: 'rgba(0,242,255,0.1)', border: '1px solid rgba(0,242,255,0.25)', color: '#00f2ff' } }, "+ ",
      lang === 'ar' ? 'فتح تذكرة' : 'Open Ticket'
      )
      ) : /*#__PURE__*/

      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
      myTickets.map((ticket) => {
        var sc = statusCfg[ticket.status] || statusCfg.open;
        var hasNewReply = ticket.status === 'answered';
        return (/*#__PURE__*/
          React.createElement("div", { key: ticket.id, onClick: () => {setSelected(ticket);setView('detail');},
            style: {
              background: hasNewReply ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${hasNewReply ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '8px', padding: '10px', cursor: 'pointer', transition: 'all 0.15s',
              borderLeft: `3px solid ${sc.color}`
            },
            onMouseEnter: (e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)',
            onMouseLeave: (e) => e.currentTarget.style.background = hasNewReply ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)' }, /*#__PURE__*/
          React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' } }, /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '12px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 } },
          catIcon[ticket.category] || '❓', " ", ticket.subject
          ), /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '10px', padding: '1px 7px', borderRadius: '4px', fontWeight: 700, flexShrink: 0, marginLeft: '8px',
              background: `${sc.color}15`, border: `1px solid ${sc.color}30`, color: sc.color } },
          hasNewReply && '🔔 ', lang === 'ar' ? sc.label_ar : sc.label_en
          )
          ), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '10px', color: '#6b7280' } },
          (ticket.responses || []).length, " ", lang === 'ar' ? 'ردود' : 'replies',
          ' • ', ticket.createdAt?.toDate?.()?.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')
          )
          ));

      })
      )

      ));

  };

  window.SupportTicketSection = SupportTicketSection;
})();