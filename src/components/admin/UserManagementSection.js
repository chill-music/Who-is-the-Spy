(function () {
  var { useState, useEffect, useMemo, useRef } = React;

  var UserManagementSection = ({ currentUser, currentUserData, lang, onNotification }) => {
    var [searchTerm, setSearchTerm] = useState('');
    var [searchResult, setSearchResult] = useState(null);
    var [notFound, setNotFound] = useState(false);
    var [searching, setSearching] = useState(false);
    var [processing, setProcessing] = useState(false);

    var handleSearch = async (e) => {
      e.preventDefault();
      var tid = searchTerm.trim();
      if (!tid) return;
      setSearching(true); setSearchResult(null); setNotFound(false);
      try {
        var docSnap = await usersCollection.doc(tid).get();
        if (docSnap.exists) {
          setSearchResult({ id: docSnap.id, ...docSnap.data() });
        } else {
          var snap2 = await usersCollection.where('displayName', '==', tid).limit(1).get();
          if (!snap2.empty) {
            setSearchResult({ id: snap2.docs[0].id, ...snap2.docs[0].data() });
          } else {
            setNotFound(true);
          }
        }
      } catch (e) { setNotFound(true); }
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
          await window.logStaffAction(currentUser.uid, currentUserData?.displayName, 'UNBAN_USER', searchResult.id, searchResult.displayName, 'Unbanned user via Admin Panel');
        }
        setSearchResult({ ...searchResult, ban: { ...searchResult.ban, isBanned: false } });
        onNotification('✅ User unbanned');
      } catch (e) {onNotification('❌ Error');}
      setProcessing(false);
    };

    return (/*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 700, color: '#3b82f6', marginBottom: '16px' } }, "\uD83D\uDD0D ",
      lang === 'ar' ? 'البحث والإدارة' : 'Search & Manage Users'
      ), /*#__PURE__*/
      React.createElement("form", { onSubmit: handleSearch, style: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' } }, /*#__PURE__*/
      React.createElement("input", { className: "input-dark", style: { flex: 1, minWidth: '140px', padding: '10px', borderRadius: '10px', fontSize: '13px' },
        placeholder: lang === 'ar' ? 'ابحث بـ UID أو الإسم...' : 'Search by UID or Name...',
        value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) }), /*#__PURE__*/
      React.createElement("button", { type: "submit", disabled: searching, className: "btn-neon", style: { padding: '0 20px', flexShrink: 0 } },
      searching ? '⏳' : lang === 'ar' ? 'بحث' : 'Search'
      ),
      (searchResult || notFound) && /*#__PURE__*/
      React.createElement("button", { type: "button", onClick: () => { setSearchResult(null); setNotFound(false); setSearchTerm(''); },
        style: { padding: '0 14px', background: 'rgba(255,255,255,0.07)', color: '#9ca3af', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', flexShrink: 0 } }, '×')
      ),

      notFound && /*#__PURE__*/
      React.createElement("div", { style: { padding: '14px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center', color: '#ef4444', fontSize: '12px', marginBottom: '16px' } },
        '⚠️ ', lang === 'ar' ? 'لم يتم العثور على مستخدم بهذا الاسم أو المعرّف الفريد.' : 'No user found with that UID or display name.'
      ),

      searchResult && /*#__PURE__*/
      React.createElement("div", { style: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', textAlign: 'center' } }, /*#__PURE__*/
      React.createElement("img", { src: searchResult.photoURL || 'https://via.placeholder.com/80', style: { width: '80px', height: '80px', borderRadius: '50%', marginBottom: '12px', border: '3px solid #3b82f6' } }), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '16px', fontWeight: 800 } }, searchResult.displayName), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '12px', color: '#6b7280', marginBottom: '15px' } }, searchResult.uid), /*#__PURE__*/

      React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' } }, /*#__PURE__*/
      React.createElement("div", { style: { background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '10px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '10px', color: '#6b7280' } }, lang === 'ar' ? 'الذهب' : 'Gold'), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '14px', fontWeight: 700, color: '#f59e0b' } }, searchResult.gold || 0)
      ), /*#__PURE__*/
      React.createElement("div", { style: { background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '10px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '10px', color: '#6b7280' } }, lang === 'ar' ? 'المستوى' : 'Level'), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '14px', fontWeight: 700, color: '#3b82f6' } }, searchResult.level || 1)
      )
      ),

      searchResult.ban?.isBanned ? /*#__PURE__*/
      React.createElement("div", { style: { padding: '12px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '12px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', color: '#ef4444', fontWeight: 700 } }, "\u26D4 ", lang === 'ar' ? 'هذا المستخدم محظور!' : 'User is Banned!'), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '10px', color: '#6b7280', marginTop: '4px' } }, lang === 'ar' ? 'السبب:' : 'Reason:', " ", searchResult.ban.reason), /*#__PURE__*/
      React.createElement("button", { onClick: handleUnban, disabled: processing,
        className: "btn-neon", style: { marginTop: '10px', width: '100%', padding: '8px' } },
      processing ? '⏳' : `✅ ${lang === 'ar' ? 'رفع الحظر' : 'Unban User'}`
      )
      ) : /*#__PURE__*/

      React.createElement("div", { style: { fontSize: '11px', color: '#10b981' } }, "\uD83D\uDFE2 ", lang === 'ar' ? 'حساب نشط ومفعل' : 'Active Account')

      )

      ));

  };

  window.UserManagementSection = UserManagementSection;
})();