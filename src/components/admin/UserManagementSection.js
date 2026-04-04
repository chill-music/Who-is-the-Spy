(function () {
  var { useState, useEffect } = React;

  var UserManagementSection = ({ currentUser, currentUserData, lang, onNotification }) => {
    var [searchTerm, setSearchTerm] = useState('');
    var [searchResult, setSearchResult] = useState(null);
    var [notFound, setNotFound]   = useState(false);
    var [searching, setSearching] = useState(false);
    var [processing, setProcessing] = useState(false);

    var handleSearch = async (e) => {
      e.preventDefault();
      if (!searchTerm.trim()) return;
      setSearching(true); setSearchResult(null); setNotFound(false);
      var found = await window.searchUser(searchTerm);
      if (found) setSearchResult(found);
      else setNotFound(true);
      setSearching(false);
    };

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
        onNotification('✅ User unbanned');
      } catch (e) { onNotification('❌ Error'); }
      setProcessing(false);
    };

    return (/*#__PURE__*/
      React.createElement('div', null, /*#__PURE__*/
      React.createElement('div', { style: { fontSize: '13px', fontWeight: 700, color: '#3b82f6', marginBottom: '16px' } }, '🔍 ',
        lang === 'ar' ? 'البحث والإدارة' : 'Search & Manage Users'
      ), /*#__PURE__*/

      /* ── Search form ── */
      React.createElement('form', { onSubmit: handleSearch, style: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' } }, /*#__PURE__*/
        React.createElement('input', { className: 'input-dark', style: { flex: 1, minWidth: '140px', padding: '10px', borderRadius: '10px', fontSize: '13px' },
          placeholder: lang === 'ar' ? 'ابحث بـ UID أو ID المخصص أو الاسم...' : 'Search by UID / Custom ID / Name...',
          value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) }), /*#__PURE__*/
        React.createElement('button', { type: 'submit', disabled: searching, className: 'btn-neon', style: { padding: '0 20px', flexShrink: 0 } },
          searching ? '⏳' : lang === 'ar' ? 'بحث' : 'Search'
        ),
        (searchResult || notFound) && /*#__PURE__*/
        React.createElement('button', { type: 'button', onClick: () => { setSearchResult(null); setNotFound(false); setSearchTerm(''); },
          style: { padding: '0 14px', background: 'rgba(255,255,255,0.07)', color: '#9ca3af', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', flexShrink: 0 } }, '×')
      ),

      /* ── Not found ── */
      notFound && /*#__PURE__*/
      React.createElement('div', { style: { padding: '14px', borderRadius: '12px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center', color: '#ef4444', fontSize: '12px', marginBottom: '16px' } },
        '⚠️ ', lang === 'ar' ? 'لم يُعثر على مستخدم بهذا الاسم أو المعرّف.' : 'No user found with that UID, custom ID, or name.'
      ),

      /* ── Result card ── */
      searchResult && /*#__PURE__*/
      React.createElement('div', { style: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', textAlign: 'center' } }, /*#__PURE__*/
        React.createElement('img', { src: searchResult.photoURL || 'https://via.placeholder.com/80', style: { width: '80px', height: '80px', borderRadius: '50%', marginBottom: '12px', border: '3px solid #3b82f6', objectFit: 'cover' } }), /*#__PURE__*/
        React.createElement('div', { style: { fontSize: '16px', fontWeight: 800 } }, searchResult.displayName), /*#__PURE__*/
        React.createElement('div', { style: { fontSize: '11px', color: '#6b7280', marginBottom: '4px' } }, 'UID: ', searchResult.uid || searchResult.id), /*#__PURE__*/
        searchResult.customId && /*#__PURE__*/
        React.createElement('div', { style: { fontSize: '11px', color: '#f59e0b', marginBottom: '12px' } }, 'Custom ID: ', searchResult.customId), /*#__PURE__*/

        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' } }, /*#__PURE__*/
          React.createElement('div', { style: { background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '10px' } }, /*#__PURE__*/
            React.createElement('div', { style: { fontSize: '10px', color: '#6b7280' } }, lang === 'ar' ? 'الذهب' : 'Gold'), /*#__PURE__*/
            React.createElement('div', { style: { fontSize: '14px', fontWeight: 700, color: '#f59e0b' } }, searchResult.gold || 0)
          ), /*#__PURE__*/
          React.createElement('div', { style: { background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '10px' } }, /*#__PURE__*/
            React.createElement('div', { style: { fontSize: '10px', color: '#6b7280' } }, lang === 'ar' ? 'المستوى' : 'Level'), /*#__PURE__*/
            React.createElement('div', { style: { fontSize: '14px', fontWeight: 700, color: '#3b82f6' } }, searchResult.level || 1)
          )
        ),

        searchResult.ban?.isBanned ? /*#__PURE__*/
        React.createElement('div', { style: { padding: '12px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '12px' } }, /*#__PURE__*/
          React.createElement('div', { style: { fontSize: '11px', color: '#ef4444', fontWeight: 700 } }, '⛔ ', lang === 'ar' ? 'هذا المستخدم محظور!' : 'User is Banned!'), /*#__PURE__*/
          React.createElement('div', { style: { fontSize: '10px', color: '#6b7280', marginTop: '4px' } }, lang === 'ar' ? 'السبب:' : 'Reason:', ' ', searchResult.ban.reason), /*#__PURE__*/
          React.createElement('button', { onClick: handleUnban, disabled: processing, className: 'btn-neon', style: { marginTop: '10px', width: '100%', padding: '8px' } },
            processing ? '⏳' : `✅ ${lang === 'ar' ? 'رفع الحظر' : 'Unban User'}`
          )
        ) : /*#__PURE__*/
        React.createElement('div', { style: { fontSize: '11px', color: '#10b981' } }, '🟢 ', lang === 'ar' ? 'حساب نشط ومفعل' : 'Active Account')
      )

      ));

  };

  window.UserManagementSection = UserManagementSection;
})();