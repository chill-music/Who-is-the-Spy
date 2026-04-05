(function () {
  var { useState } = React;

  // ── Helpers ──────────────────────────────────────────────────────────────
  var fmtDate = (val) => {
    if (!val) return '—';
    try {
      var d = val.toDate ? val.toDate() : (val.seconds ? new Date(val.seconds * 1000) : new Date(val));
      return d.toLocaleDateString();
    } catch (_) { return '—'; }
  };

  var ROLE_COLORS = { owner: '#ffd700', admin: '#f97316', moderator: '#8b5cf6', user: '#6b7280' };

  // ─────────────────────────────────────────────────────────────────────────
  var UserManagementSection = ({ currentUser, currentUserData, lang, onNotification }) => {
    var [searchTerm,   setSearchTerm]   = useState('');
    var [searchResult, setSearchResult] = useState(null);
    var [notFound,     setNotFound]     = useState(false);
    var [searching,    setSearching]    = useState(false);
    var [processing,   setProcessing]   = useState(false);

    // Ban form state
    var [showBanForm,  setShowBanForm]  = useState(false);
    var [banReason,    setBanReason]    = useState('');
    var [banDuration,  setBanDuration]  = useState('permanent');

    var myRole = currentUserData?.role || '';
    var isOwner = myRole === 'owner';

    // ── Search ──────────────────────────────────────────────────────────
    var handleSearch = async (e) => {
      e.preventDefault();
      if (!searchTerm.trim()) return;
      setSearching(true); setSearchResult(null); setNotFound(false); setShowBanForm(false);
      var found = await window.searchUser(searchTerm);
      if (found) setSearchResult(found);
      else setNotFound(true);
      setSearching(false);
    };

    // ── Unban ───────────────────────────────────────────────────────────
    var handleUnban = async () => {
      if (!searchResult || processing) return;
      setProcessing(true);
      try {
        await usersCollection.doc(searchResult.id).update({
          'ban.isBanned': false,
          'ban.unbannedBy': currentUser.uid,
          'ban.unbannedAt': TS()
        });
        if (window.logStaffAction) {
          await window.logStaffAction(currentUser.uid, currentUserData?.displayName, 'UNBAN_USER', searchResult.id, searchResult.displayName, 'Unbanned via Admin Panel');
        }
        setSearchResult({ ...searchResult, ban: { ...searchResult.ban, isBanned: false } });
        onNotification('✅ ' + (lang === 'ar' ? 'تم رفع الحظر' : 'User unbanned'));
      } catch (e) { onNotification('❌ Error: ' + e.message); }
      setProcessing(false);
    };

    // ── Verify ─────────────────────────────────────────────────────────
    var handleVerify = async () => {
      if (!searchResult || processing) return;
      setProcessing(true);
      try {
        await usersCollection.doc(searchResult.id).update({
          verified: true,
          verifiedBy: currentUser.uid,
          verifiedAt: TS()
        });
        if (window.logStaffAction) {
          await window.logStaffAction(
            currentUser.uid, currentUserData?.displayName,
            'VERIFY_USER', searchResult.id, searchResult.displayName,
            'Account verified via Admin Panel'
          );
        }
        setSearchResult({ ...searchResult, verified: true });
        onNotification('✅ ' + (lang === 'ar' ? 'تم توثيق الحساب' : 'Account verified'));
      } catch (e) { onNotification('❌ Error: ' + e.message); }
      setProcessing(false);
    };

    // ── Ban ─────────────────────────────────────────────────────────────
    var handleBan = async () => {
      if (!searchResult || processing || !banReason.trim()) return;
      // Safety: never ban the owner
      if (searchResult.id === window.OWNER_UID || searchResult.uid === window.OWNER_UID) {
        onNotification('⛔ ' + (lang === 'ar' ? 'لا يمكن حظر المالك' : 'Cannot ban the Owner'));
        return;
      }
      setProcessing(true);
      try {
        await usersCollection.doc(searchResult.id).update({
          ban: {
            isBanned: true,
            reason: banReason.trim(),
            duration: banDuration,
            bannedBy: currentUser.uid,
            bannedByName: currentUserData?.displayName || 'Admin',
            bannedAt: TS()
          }
        });
        if (window.logStaffAction) {
          await window.logStaffAction(
            currentUser.uid, currentUserData?.displayName,
            'BAN_USER', searchResult.id, searchResult.displayName,
            'Reason: ' + banReason + ' | Duration: ' + banDuration
          );
        }
        setSearchResult({ ...searchResult, ban: { isBanned: true, reason: banReason, duration: banDuration } });
        setShowBanForm(false); setBanReason(''); setBanDuration('permanent');
        onNotification('🔨 ' + (lang === 'ar' ? 'تم حظر المستخدم' : 'User banned'));
      } catch (e) { onNotification('❌ Error: ' + e.message); }
      setProcessing(false);
    };

    // ── Stat cell helper ────────────────────────────────────────────────
    var statCell = (label, value, color) => React.createElement('div', {
      style: { background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '10px', textAlign: 'center' }
    },
      React.createElement('div', { style: { fontSize: '10px', color: '#6b7280', marginBottom: '4px' } }, label),
      React.createElement('div', { style: { fontSize: '13px', fontWeight: 700, color: color || '#e2e8f0' } }, value ?? '—')
    );

    // ── Render ───────────────────────────────────────────────────────────
    return (/*#__PURE__*/
      React.createElement('div', null,

      /* Title */
      React.createElement('div', { style: { fontSize: '13px', fontWeight: 700, color: '#3b82f6', marginBottom: '16px' } },
        '🔍 ', lang === 'ar' ? 'البحث والإدارة' : 'Search & Manage Users'
      ),

      /* Search form */
      React.createElement('form', { onSubmit: handleSearch, style: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' } },
        React.createElement('input', { className: 'input-dark', style: { flex: 1, minWidth: '140px', padding: '10px', borderRadius: '10px', fontSize: '13px' },
          placeholder: lang === 'ar' ? 'ابحث بـ UID أو ID المخصص أو الاسم...' : 'Search by UID / Custom ID / Name...',
          value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) }),
        React.createElement('button', { type: 'submit', disabled: searching, className: 'btn-neon', style: { padding: '0 20px', flexShrink: 0 } },
          searching ? '⏳' : lang === 'ar' ? 'بحث' : 'Search'
        ),
        (searchResult || notFound) &&
        React.createElement('button', { type: 'button', onClick: () => { setSearchResult(null); setNotFound(false); setSearchTerm(''); setShowBanForm(false); },
          style: { padding: '0 14px', background: 'rgba(255,255,255,0.07)', color: '#9ca3af', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', flexShrink: 0 } }, '×')
      ),

      /* Not found */
      notFound &&
      React.createElement('div', { style: { padding: '14px', borderRadius: '12px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center', color: '#ef4444', fontSize: '12px', marginBottom: '16px' } },
        '⚠️ ', lang === 'ar' ? 'لم يُعثر على مستخدم بهذا الاسم أو المعرّف.' : 'No user found with that UID, custom ID, or name.'
      ),

      /* Result card */
      searchResult &&
      React.createElement('div', { style: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px' } },

        /* Avatar + Name */
        React.createElement('div', { style: { textAlign: 'center', marginBottom: '16px' } },
          React.createElement('img', { src: searchResult.photoURL || 'https://via.placeholder.com/80', style: { width: '80px', height: '80px', borderRadius: '50%', marginBottom: '10px', border: '3px solid #3b82f6', objectFit: 'cover', display: 'block', margin: '0 auto 10px' } }),
          React.createElement('div', { style: { fontSize: '16px', fontWeight: 800, marginBottom: '4px' } }, searchResult.displayName),

          /* Role badge */
          searchResult.role &&
          React.createElement('span', { style: {
            display: 'inline-block', fontSize: '10px', fontWeight: 800,
            background: (ROLE_COLORS[searchResult.role] || '#6b7280') + '22',
            color: ROLE_COLORS[searchResult.role] || '#6b7280',
            border: '1px solid ' + (ROLE_COLORS[searchResult.role] || '#6b7280') + '55',
            padding: '2px 10px', borderRadius: '20px', marginBottom: '6px'
          } }, (searchResult.role || 'user').toUpperCase()),

          /* UID + Custom ID */
          React.createElement('div', { style: { fontSize: '10px', color: '#6b7280' } }, 'UID: ', searchResult.uid || searchResult.id),
          searchResult.customId &&
          React.createElement('div', { style: { fontSize: '10px', color: '#f59e0b', marginTop: '2px' } }, 'ID: #', searchResult.customId)
        ),

        /* Stats grid — 4 cells */
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' } },
          statCell(lang === 'ar' ? 'الذهب' : 'Gold',   searchResult.currency ?? 0, '#f59e0b'),
          statCell(lang === 'ar' ? 'المستوى' : 'Level', searchResult.level    ?? 1, '#3b82f6'),
          statCell(lang === 'ar' ? 'نقاط XP' : 'XP',   searchResult.xp       ?? 0, '#10b981'),
          statCell(lang === 'ar' ? 'الكاريزما' : 'Charisma', searchResult.charisma ?? 0, '#ec4899')
        ),

        /* Join date */
        React.createElement('div', { style: { fontSize: '10px', color: '#6b7280', marginBottom: '14px', textAlign: 'center' } },
          (lang === 'ar' ? 'تاريخ الانضمام: ' : 'Joined: '), fmtDate(searchResult.createdAt)
        ),

        /* Ban status */
        searchResult.ban?.isBanned ?
        React.createElement('div', { style: { padding: '12px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '12px' } },
          React.createElement('div', { style: { fontSize: '11px', color: '#ef4444', fontWeight: 700 } }, '⛔ ', lang === 'ar' ? 'هذا المستخدم محظور!' : 'User is Banned!'),
          React.createElement('div', { style: { fontSize: '10px', color: '#6b7280', marginTop: '4px' } }, lang === 'ar' ? 'السبب:' : 'Reason:', ' ', searchResult.ban.reason),
          isOwner &&
          React.createElement('button', { onClick: handleUnban, disabled: processing, className: 'btn-neon', style: { marginTop: '10px', width: '100%', padding: '8px' } },
            processing ? '⏳' : '✅ ' + (lang === 'ar' ? 'رفع الحظر' : 'Unban User')
          )
        ) :
        React.createElement('div', { style: { fontSize: '11px', color: '#10b981', textAlign: 'center', marginBottom: '12px' } }, '🟢 ', lang === 'ar' ? 'حساب نشط ومفعل' : 'Active Account'),

        /* Owner actions — Ban + Verify */
        isOwner && !searchResult.ban?.isBanned &&
        searchResult.id !== window.OWNER_UID && searchResult.uid !== window.OWNER_UID &&
        React.createElement('div', { style: { borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' } },

          /* Verify Account button */
          searchResult.verified
          ? React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '10px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', fontSize: '12px', fontWeight: 700, marginBottom: '10px' } },
              '✅ ', lang === 'ar' ? 'موثّق بالفعل' : 'Already Verified'
            )
          : React.createElement('button', {
              onClick: handleVerify, disabled: processing,
              style: { width: '100%', padding: '9px', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.3)',
                background: 'rgba(16,185,129,0.07)', color: '#10b981', fontSize: '12px', fontWeight: 700,
                cursor: 'pointer', marginBottom: '10px' }
            }, processing ? '⏳' : '✅ ' + (lang === 'ar' ? 'توثيق الحساب' : 'Verify Account')),

          /* Ban toggle button */
          React.createElement('button', {
            onClick: () => setShowBanForm(!showBanForm),
            style: { width: '100%', padding: '9px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)',
              background: showBanForm ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.07)',
              color: '#ef4444', fontSize: '12px', fontWeight: 700, cursor: 'pointer', marginBottom: '10px' }
          }, showBanForm ? '✕ ' + (lang === 'ar' ? 'إلغاء' : 'Cancel') : '🔨 ' + (lang === 'ar' ? 'حظر المستخدم' : 'Ban User')),

          /* Inline ban form */
          showBanForm &&
          React.createElement('div', { style: { background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' } },
            React.createElement('input', { className: 'input-dark', placeholder: lang === 'ar' ? 'سبب الحظر...' : 'Reason for ban...',
              value: banReason, onChange: (e) => setBanReason(e.target.value),
              style: { padding: '9px', borderRadius: '8px', fontSize: '12px', width: '100%' } }),
            React.createElement('select', { value: banDuration, onChange: (e) => setBanDuration(e.target.value),
              style: { padding: '9px', borderRadius: '8px', fontSize: '12px', background: '#1e293b', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' } },
              React.createElement('option', { value: 'permanent', style: { background: '#1e293b', color: '#e5e7eb' } }, lang === 'ar' ? 'دائم' : 'Permanent'),
              React.createElement('option', { value: '7d',         style: { background: '#1e293b', color: '#e5e7eb' } }, lang === 'ar' ? '7 أيام' : '7 Days'),
              React.createElement('option', { value: '3d',         style: { background: '#1e293b', color: '#e5e7eb' } }, lang === 'ar' ? '3 أيام' : '3 Days'),
              React.createElement('option', { value: '1d',         style: { background: '#1e293b', color: '#e5e7eb' } }, lang === 'ar' ? 'يوم واحد' : '1 Day')
            ),
            React.createElement('button', {
              onClick: handleBan, disabled: processing || !banReason.trim(),
              style: { padding: '9px', borderRadius: '8px', background: processing ? '#374151' : '#dc2626',
                color: 'white', fontSize: '12px', fontWeight: 700, border: 'none', cursor: banReason.trim() ? 'pointer' : 'not-allowed' }
            }, processing ? '⏳' : '🔨 ' + (lang === 'ar' ? 'تأكيد الحظر' : 'Confirm Ban'))
          )
        )

      )
    ));
  };

  window.UserManagementSection = UserManagementSection;
})();