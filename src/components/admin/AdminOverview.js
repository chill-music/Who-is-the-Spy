(function () {
  var { useState, useEffect } = React;

  var ROLE_COLORS = { owner: '#f59e0b', admin: '#3b82f6', moderator: '#8b5cf6' };
  var ROLE_ICONS  = { owner: '👑', admin: '🛡️', moderator: '🪪' };

  // 5-minute online threshold
  var ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

  var OverviewSection = ({ currentUser, currentUserData, lang }) => {
    var [stats, setStats]               = useState({ users: 0, today: 0, reports: 0, tickets: 0 });
    var [loading, setLoading]           = useState(true);
    var [staff, setStaff]               = useState([]);
    var [staffLoading, setStaffLoading] = useState(true);

    // In-app staff message modal state (replaces window.prompt / window.alert)
    var [msgModal, setMsgModal]     = useState(null); // { uid, name }
    var [msgText, setMsgText]       = useState('');
    var [msgSending, setMsgSending] = useState(false);

    // ── Stats ─────────────────────────────────────────────────────────────────
    useEffect(() => {
      var fetchStats = async () => {
        try {
          var u  = await usersCollection.count().get();
          var r  = await reportsCollection.where('resolved', '==', false).count().get();
          var t  = await ticketsCollection.where('status', '==', 'open').count().get();
          var today = new Date(); today.setHours(0, 0, 0, 0);
          var td = await usersCollection.where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(today)).count().get();
          setStats({ users: u.data().count, today: td.data().count, reports: r.data().count, tickets: t.data().count });
        } catch (e) {}
        setLoading(false);
      };
      fetchStats();
    }, []);

    // ── Staff list — real-time onSnapshot (all staff roles) ───────────────────
    useEffect(() => {
      var unsub = usersCollection
        .where('role', 'in', ['owner', 'admin', 'moderator'])
        .onSnapshot(async (snap) => {
          var list = snap.docs.map((d) => {
            var data = d.data();
            // Normalize legacy nested staffRole.role field
            if (!data.role && data.staffRole?.role) data.role = data.staffRole.role;
            return { id: d.id, ...data };
          });

          // Always ensure the hardcoded owner is included
          var ownerUID = window.OWNER_UID || (window.ADMIN_UIDS && window.ADMIN_UIDS[0]);
          if (ownerUID && !list.find((s) => s.uid === ownerUID || s.id === ownerUID)) {
            try {
              var oDoc = await usersCollection.doc(ownerUID).get();
              if (oDoc.exists) list.push({ id: oDoc.id, role: 'owner', ...oDoc.data() });
            } catch (_) {}
          }

          // Sort: owner → admin → moderator
          var order = { owner: 0, admin: 1, moderator: 2 };
          list.sort((a, b) => (order[a.role] ?? 9) - (order[b.role] ?? 9));
          setStaff(list);
          setStaffLoading(false);
        }, (err) => {
          console.error('[AdminOverview] staff snapshot error:', err);
          setStaffLoading(false);
        });

      return unsub;
    }, []);

    // ── Send staff-to-staff message via Admin HQ bot ──────────────────────────
    var sendStaffMessage = async () => {
      if (!msgText.trim() || !msgModal) return;
      setMsgSending(true);
      try {
        var senderName = currentUserData?.displayName || currentUser?.uid?.slice(0, 6) || 'Staff';
        var payload    = '💬 ' + senderName + ' → ' + msgModal.name + ':\n' + msgText.trim();
        if (window.sendStaffCommandBotMessage) {
          await window.sendStaffCommandBotMessage(
            msgModal.uid,
            payload,
            { type: 'staff_direct_msg', fromUID: currentUser?.uid }
          );
        }
        setMsgModal(null);
        setMsgText('');
        if (window.showToast) window.showToast('✅ ' + (lang === 'ar' ? 'تم الإرسال' : 'Sent!'));
      } catch (e) {
        if (window.showToast) window.showToast('❌ Error: ' + e.message);
      }
      setMsgSending(false);
    };

    return (/*#__PURE__*/
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '20px' } },

        /* ── In-app Staff Message Modal (replaces window.prompt) ─────────── */
        msgModal && /*#__PURE__*/
        React.createElement('div', {
          style: { position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(8px)' },
          onClick: () => { setMsgModal(null); setMsgText(''); }
        },
          React.createElement('div', {
            style: { background: '#1e293b', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '20px', padding: '26px', maxWidth: '360px', width: '92%', boxShadow: '0 28px 60px rgba(0,0,0,0.7)' },
            onClick: (e) => e.stopPropagation()
          },
            React.createElement('div', { style: { fontSize: '26px', textAlign: 'center', marginBottom: '10px' } }, '💬'),
            React.createElement('div', { style: { fontSize: '14px', fontWeight: 700, color: '#a78bfa', textAlign: 'center', marginBottom: '4px' } },
              lang === 'ar' ? 'رسالة إلى' : 'Message to',
              ' ',
              React.createElement('span', { style: { color: '#f1f5f9' } }, msgModal.name)
            ),
            React.createElement('div', { style: { fontSize: '10px', color: '#64748b', textAlign: 'center', marginBottom: '16px' } },
              lang === 'ar' ? 'يُرسَل عبر قناة Admin HQ' : 'Delivered via Admin HQ channel'
            ),
            React.createElement('textarea', {
              className: 'input-dark',
              style: { width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '12px', minHeight: '90px', marginBottom: '14px', resize: 'vertical', boxSizing: 'border-box', lineHeight: '1.5' },
              placeholder: lang === 'ar' ? 'اكتب رسالتك هنا…' : 'Type your message here…',
              value: msgText,
              onChange: (e) => setMsgText(e.target.value),
              autoFocus: true,
              onKeyDown: (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendStaffMessage(); }
            }),
            React.createElement('div', { style: { display: 'flex', gap: '8px' } },
              React.createElement('button', {
                onClick: sendStaffMessage,
                disabled: !msgText.trim() || msgSending,
                style: {
                  flex: 1, padding: '11px', borderRadius: '10px', border: 'none',
                  background: msgText.trim() && !msgSending ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)' : '#374151',
                  color: '#fff', fontSize: '12px', fontWeight: 700,
                  cursor: msgText.trim() && !msgSending ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s'
                }
              }, msgSending ? '⏳…' : (lang === 'ar' ? '📤 إرسال' : '📤 Send')),
              React.createElement('button', {
                onClick: () => { setMsgModal(null); setMsgText(''); },
                style: { padding: '11px 18px', background: 'rgba(255,255,255,0.07)', color: '#9ca3af', borderRadius: '10px', border: 'none', fontSize: '12px', cursor: 'pointer' }
              }, lang === 'ar' ? 'إلغاء' : 'Cancel')
            )
          )
        ),

        /* ── Stats row ──────────────────────────────────────────────────── */
        React.createElement('div', null,
          React.createElement('div', { style: { fontSize: '13px', fontWeight: 700, color: '#3b82f6', marginBottom: '16px' } },
            '📊 ', lang === 'ar' ? 'نظرة عامة' : 'System Overview'
          ),
          loading
            ? React.createElement('div', { style: { textAlign: 'center', padding: '20px' } }, '⏳')
            : React.createElement('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
                React.createElement(window.AdminStatCard, { label: lang === 'ar' ? 'إجمالي المستخدمين' : 'Total Users',  value: stats.users.toLocaleString(), icon: '👥', color: '#3b82f6' }),
                React.createElement(window.AdminStatCard, { label: lang === 'ar' ? 'جديد اليوم'        : 'New Today',    value: stats.today,                  icon: '✨', color: '#10b981' }),
                React.createElement(window.AdminStatCard, { label: lang === 'ar' ? 'بلاغات مفتوحة'    : 'Open Reports', value: stats.reports,                icon: '🚨', color: '#ef4444' }),
                React.createElement(window.AdminStatCard, { label: lang === 'ar' ? 'تذاكر مفتوحة'     : 'Open Tickets', value: stats.tickets,                icon: '🎫', color: '#f59e0b' })
              )
        ),

        /* ── Staff Team box ─────────────────────────────────────────────── */
        React.createElement('div', { style: { padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' } },
          React.createElement('div', { style: { fontSize: '12px', fontWeight: 700, color: '#8b5cf6', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' } },
            '👮 ', lang === 'ar' ? 'فريق العمل النشط' : 'Active Staff Team'
          ),

          staffLoading
            ? React.createElement('div', { style: { textAlign: 'center', padding: '16px', color: '#6b7280', fontSize: '12px' } }, '⏳')
            : staff.length === 0
              ? React.createElement('div', { style: { textAlign: 'center', padding: '16px', color: '#6b7280', fontSize: '12px' } },
                  lang === 'ar' ? 'لا يوجد فريق عمل مسجّل' : 'No staff found'
                )
              : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                  staff.map((s) => {
                    var color = ROLE_COLORS[s.role] || '#9ca3af';
                    var icon  = ROLE_ICONS[s.role]  || '👤';
                    var isMe  = s.uid === currentUser?.uid || s.id === currentUser?.uid;

                    // Online: lastActive within ONLINE_THRESHOLD_MS
                    var lastActiveMs = s.lastActive?.toDate
                      ? s.lastActive.toDate().getTime()
                      : (s.lastActive?.seconds ? s.lastActive.seconds * 1000 : 0);
                    var isOnline = lastActiveMs > 0 && (Date.now() - lastActiveMs) < ONLINE_THRESHOLD_MS;

                    return React.createElement('div', {
                      key: s.id,
                      style: {
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                        borderRadius: '10px',
                        background: isMe ? color + '18' : 'rgba(255,255,255,0.02)',
                        border: '1px solid ' + (isMe ? color + '45' : 'rgba(255,255,255,0.06)')
                      }
                    },
                      /* Avatar with online dot */
                      React.createElement('div', { style: { position: 'relative', flexShrink: 0 } },
                        React.createElement('img', {
                          src: s.photoURL || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="18" fill="%23374151"/><text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-size="16" fill="%23fff">👤</text></svg>',
                          alt: '',
                          style: { width: '36px', height: '36px', borderRadius: '50%', border: '2px solid ' + color, objectFit: 'cover', display: 'block' }
                        }),
                        React.createElement('span', {
                          style: {
                            position: 'absolute', bottom: '0', right: '0',
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: isOnline ? '#10b981' : '#4b5563',
                            border: '2px solid #0f172a',
                            boxShadow: isOnline ? '0 0 0 2px rgba(16,185,129,0.25)' : 'none'
                          }
                        })
                      ),
                      /* Name + last-seen */
                      React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                        React.createElement('div', { style: { fontSize: '12px', fontWeight: 700, color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                          s.displayName || 'Unknown', isMe ? ' (' + (lang === 'ar' ? 'أنت' : 'You') + ')' : ''
                        ),
                        React.createElement('div', { style: { fontSize: '10px', color: isOnline ? '#10b981' : '#6b7280', marginTop: '1px' } },
                          isOnline
                            ? (lang === 'ar' ? '🟢 متصل الآن' : '🟢 Online now')
                            : (lang === 'ar' ? '⚫ غير متصل'  : '⚫ Offline')
                        )
                      ),
                      /* Role badge */
                      React.createElement('span', {
                        style: { fontSize: '11px', fontWeight: 800, color, background: color + '22', padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap', flexShrink: 0 }
                      },
                        icon, ' ', (s.role || 'user').toUpperCase()
                      ),
                      /* Chat button — in-app modal (not window.prompt) */
                      !isMe && window.sendStaffCommandBotMessage && /*#__PURE__*/
                      React.createElement('button', {
                        title: lang === 'ar' ? 'إرسال رسالة عبر Admin HQ' : 'Send via Admin HQ',
                        onClick: () => { setMsgModal({ uid: s.uid || s.id, name: s.displayName || '?' }); setMsgText(''); },
                        style: {
                          padding: '5px 9px', borderRadius: '8px', fontSize: '14px',
                          background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                          color: '#a78bfa', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s'
                        }
                      }, '💬')
                    );
                  })
                )
        ),

        /* ── Quick guide ────────────────────────────────────────────────── */
        React.createElement('div', { style: { padding: '14px 16px', borderRadius: '12px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' } },
          React.createElement('div', { style: { fontSize: '11px', fontWeight: 700, color: '#3b82f6', marginBottom: '8px' } },
            '🚀 ', lang === 'ar' ? 'إرشادات سريعة' : 'Quick Guide'
          ),
          React.createElement('ul', { style: { margin: 0, padding: '0 0 0 16px', fontSize: '11px', color: '#9ca3af', lineHeight: 1.9 } },
            React.createElement('li', null, lang === 'ar'
              ? 'استخدم تبويب "المستخدمين" للبحث بـ ID أو الاسم.'
              : 'Use "Users" tab to search by UID, Custom ID or name.'),
            React.createElement('li', null, lang === 'ar'
              ? 'البلاغات تحتاج مراجعة سريعة للحفاظ على المجتمع.'
              : 'Review reports regularly to keep the community safe.'),
            React.createElement('li', null, lang === 'ar'
              ? 'المشرف يستطيع الرد على التذاكر وتصعيد التقارير فقط.'
              : 'Moderators can reply to tickets & escalate reports only.')
          )
        )

      )
    );
  };

  window.AdminOverview = OverviewSection;
})();