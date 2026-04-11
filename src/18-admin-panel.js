(function () {
  var { useState, useEffect, useMemo, useRef } = React;

  var AdminPanel = ({ isOpen, show, onClose, currentUser, currentUserData, lang }) => {
    var isVisible = isOpen || show;
    var [activeTab, setActiveTab] = useState('overview');
    var [stats, setStats] = useState({ users: 0, reports: 0, tickets: 0 });

    useEffect(() => {
      if (!isVisible) return;
      // Basic stats for the sidebar/header
      var unsubUsers = usersCollection.onSnapshot((s) => setStats((prev) => ({ ...prev, users: s.size })));
      return () => {unsubUsers();};
    }, [isVisible]);

    if (!isVisible) return null;

    var onNotification = (msg) => {
      if (window.showToast) window.showToast(msg);
      else console.warn('[AdminPanel]', msg);
    };

    var renderSection = () => {
      // onOpenProfile: closes admin panel, then opens user profile modal via window helpers
      var onOpenProfile = (uid) => {
        if (!uid) return;
        onClose(); // close admin panel first
        setTimeout(() => {
          if (window._setTargetProfileUID) window._setTargetProfileUID(uid);
          if (window._setShowUserProfile) window._setShowUserProfile(true);
        }, 120);
      };
      var props = { currentUser, currentUserData, lang, onNotification, onOpenProfile };
      switch (activeTab) {
        case 'overview':  return /*#__PURE__*/React.createElement(window.AdminOverview, props);
        case 'staff':     return /*#__PURE__*/React.createElement(window.StaffManagementSection, props);
        case 'users':     return /*#__PURE__*/React.createElement(window.UserManagementSection, props);
        case 'broadcast': return /*#__PURE__*/React.createElement(window.BroadcastSection, props);
        case 'logs':      return /*#__PURE__*/React.createElement(window.ActivityLogSection, props);
        case 'reports':   return /*#__PURE__*/React.createElement(window.ReportsSection, props);
        case 'tickets':   return /*#__PURE__*/React.createElement(window.TicketsSection, props);
        case 'moments':   return /*#__PURE__*/React.createElement(window.MomentsModerationSection, props);
        case 'financial': return /*#__PURE__*/React.createElement(window.FinancialLogSection, props);
        case 'faq':       return /*#__PURE__*/React.createElement(window.FAQManagementSection, props);
        case 'feedback':  return /*#__PURE__*/React.createElement(window.FeedbackInboxSection, props);
        case 'fake':      return /*#__PURE__*/React.createElement(window.FakeProfilesSection, props);
        default:          return /*#__PURE__*/React.createElement(window.AdminOverview, props);
      }
    };

    var tabs = [
    { id: 'overview', icon: '📊', label: lang === 'ar' ? 'النظرة العامة' : 'Overview' },
    { id: 'staff', icon: '👮', label: lang === 'ar' ? 'المشرفين' : 'Staff', minRole: 'owner' },
    { id: 'users', icon: '👥', label: lang === 'ar' ? 'المستخدمين' : 'Users' },
    { id: 'reports', icon: '🚩', label: lang === 'ar' ? 'البلاغات' : 'Reports' },
    { id: 'tickets', icon: '🎫', label: lang === 'ar' ? 'التذاكر' : 'Tickets' },
    { id: 'moments', icon: '📸', label: lang === 'ar' ? 'اللحظات' : 'Moments' },
    { id: 'broadcast', icon: '📢', label: lang === 'ar' ? 'إذاعة' : 'Broadcast', minRole: 'admin' },
    { id: 'logs', icon: '📜', label: lang === 'ar' ? 'السجل' : 'Logs', minRole: 'admin' },
    { id: 'financial', icon: '💰', label: lang === 'ar' ? 'المالية' : 'Financial', minRole: 'admin' },
    { id: 'faq', icon: '❓', label: lang === 'ar' ? 'الأسئلة' : 'FAQ', minRole: 'admin' },
    { id: 'feedback', icon: '📩', label: lang === 'ar' ? 'الملاحظات' : 'Feedback' },
    { id: 'fake', icon: '🎭', label: lang === 'ar' ? 'وهمي' : 'Fake', minRole: 'owner' }];


    var userRole = window.getUserRole ? window.getUserRole(currentUserData, currentUser?.uid) : currentUserData?.role || 'user';

    return (/*#__PURE__*/
      React.createElement("div", { className: "admin-panel-overlay",
        onClick: onClose,
        style: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' } }, /*#__PURE__*/
      React.createElement("div", { className: "admin-panel-container",
        onClick: (e) => e.stopPropagation(),
        style: { width: '95%', maxWidth: '1000px', height: '90%', background: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' } }, /*#__PURE__*/


      React.createElement("div", { className: "admin-sidebar flex-sidebar", style: { width: '240px', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', flexShrink: 0 } }, /*#__PURE__*/
      React.createElement("div", { style: { padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '1px', marginBottom: '4px' } }, "\uD83D\uDEE1\uFE0F PRO SPY"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '10px', color: '#64748b', fontWeight: 700 } }, "ADMIN CONTROL CENTER")
      ), /*#__PURE__*/

      React.createElement("div", { className: "admin-sidebar-tabs", style: { flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column' } },
      tabs.map((t) => {
        if (t.minRole === 'owner' && userRole !== 'owner') return null;
        if (t.minRole === 'admin' && userRole !== 'owner' && userRole !== 'admin') return null;

        var active = activeTab === t.id;
        return (/*#__PURE__*/
          React.createElement("div", { className: "admin-sidebar-tab", key: t.id, onClick: () => setActiveTab(t.id), style: {
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', marginBottom: '4px',
              background: active ? 'linear-gradient(90deg, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.05) 100%)' : 'transparent',
              color: active ? '#3b82f6' : '#94a3b8',
              border: active ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
              transition: 'all 0.2s', flexShrink: 0
            } }, /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '16px' } }, t.icon), /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '13px', fontWeight: active ? 700 : 500 } }, t.label)
          ));

      })
      ), /*#__PURE__*/

      React.createElement("div", { style: { padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' } }, /*#__PURE__*/
      React.createElement("button", { onClick: onClose, style: { width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer' } }, "\uD83D\uDEAA ",
      lang === 'ar' ? 'إغلاق' : 'Close'
      )
      )
      ), /*#__PURE__*/


      React.createElement("div", { style: { flex: 1, display: 'flex', flexDirection: 'column', background: '#0f172a' } }, /*#__PURE__*/
      React.createElement("div", { style: { padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '15px', fontWeight: 800, color: '#fff' } }, tabs.find((t) => t.id === activeTab)?.label), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '20px' } }, /*#__PURE__*/
      React.createElement("div", { style: { textAlign: 'right' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '10px', color: '#64748b' } }, lang === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '14px', fontWeight: 800, color: '#3b82f6' } }, stats.users.toLocaleString())
      )
      )
      ), /*#__PURE__*/

      React.createElement("div", { style: { flex: 1, overflowY: 'auto', padding: '30px' } },
      renderSection()
      )
      )
      ), /*#__PURE__*/

      React.createElement("style", null, `
                    .admin-panel-container::-webkit-scrollbar { width: 4px; }
                    .admin-panel-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                    .admin-sidebar-tabs::-webkit-scrollbar { height: 4px; }
                    .admin-sidebar-tabs::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                    .input-dark {
                        background: rgba(255,255,255,0.03);
                        border: 1px solid rgba(255,255,255,0.1);
                        border-radius: 8px;
                        color: #fff;
                        outline: none;
                        transition: all 0.2s;
                    }
                    .input-dark:focus { border-color: #3b82f6; background: rgba(255,255,255,0.05); }
                    .btn-neon {
                        background: #3b82f6;
                        color: #fff;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .btn-neon:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
                    .btn-neon:active { transform: translateY(0); }
                    .btn-neon:disabled { opacity: 0.5; cursor: not-allowed; }
                    
                    @media (max-width: 768px) {
                        .admin-panel-container {
                            flex-direction: column !important;
                            height: 98% !important;
                            width: 98% !important;
                        }
                        .admin-sidebar {
                            width: 100% !important;
                            border-right: none !important;
                            border-bottom: 1px solid rgba(255,255,255,0.05) !important;
                        }
                        .admin-sidebar-tabs {
                            flex-direction: row !important;
                            overflow-x: auto !important;
                            overflow-y: hidden !important;
                            padding: 8px !important;
                            gap: 8px !important;
                            height: auto !important;
                        }
                        .admin-sidebar-tab {
                            margin-bottom: 0 !important;
                            white-space: nowrap !important;
                        }
                    }
                `)
      ));

  };

  window.AdminPanel = AdminPanel;
})();