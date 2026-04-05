(function () {
  var { useState, useEffect } = React;

  var ROLE_COLORS = { owner: '#f59e0b', admin: '#ef4444', moderator: '#3b82f6' };
  var ROLE_ICONS  = { owner: '👑', admin: '🛡️', moderator: '🔰' };

  var StaffManagementSection = ({ currentUser, currentUserData, lang, onNotification }) => {
    var [staff, setStaff]         = useState([]);
    var [loading, setLoading]     = useState(true);
    var [editing, setEditing]     = useState(null);
    var [newRole, setNewRole]     = useState('');
    var [searchTerm, setSearchTerm]   = useState('');
    var [addRole, setAddRole]         = useState('moderator');
    var [searching, setSearching]     = useState(false);

    var myRole = window.getUserRole ? window.getUserRole(currentUserData, currentUser?.uid) : currentUserData?.role;

    // ── Load staff list ──────────────────────────────────────────────────────
    var loadStaff = () => {
      var unsub = usersCollection
        .where('role', 'in', ['owner', 'admin', 'moderator'])
        .onSnapshot(async (snap) => {
          var list = snap.docs.map((d) => {
            var data = d.data();
            // Normalize: handle legacy accounts where role may be nested in staffRole.role
            if (!data.role && data.staffRole?.role) data.role = data.staffRole.role;
            return { id: d.id, ...data };
          });

          // Always include the hardcoded owner
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
          console.log('[StaffMgmt] loaded:', list.length, 'staff members', list.map(s => s.role + ':' + s.displayName));
          setStaff(list);
          setLoading(false);
        }, (err) => { console.error('[StaffMgmt] snapshot error:', err); setLoading(false); });
      return unsub;
    };

    useEffect(() => { var unsub = loadStaff(); return unsub; }, []);

    // ── Update role ──────────────────────────────────────────────────────────
    var updateRole = async (docId, targetName) => {
      if (myRole !== 'owner') { onNotification('⛔ Only Owners can change roles'); return; }
      try {
        await usersCollection.doc(docId).update({ role: newRole });
        if (window.logStaffAction) {
          await window.logStaffAction(currentUser.uid, currentUserData?.displayName,
            newRole === 'user' ? 'REMOVE_STAFF' : 'ASSIGN_ROLE',
            docId, targetName, `Changed role to: ${newRole}`);
        }
        onNotification('✅ Role updated');
        setEditing(null);
      } catch (e) { onNotification('❌ Error'); }
    };

    // ── Add staff by search (UID / customId / name) ──────────────────────────
    var addStaff = async () => {
      if (!searchTerm.trim() || searching || myRole !== 'owner') return;
      setSearching(true);
      var found = await window.searchUser(searchTerm);
      if (!found) {
        onNotification(lang === 'ar' ? '❌ المستخدم غير موجود' : '❌ User not found');
      } else {
        try {
          await usersCollection.doc(found.id).update({ role: addRole });
          if (window.logStaffAction) {
            await window.logStaffAction(currentUser.uid, currentUserData?.displayName,
              'ASSIGN_ROLE', found.id, found.displayName || 'User', 'Changed role to: ' + addRole);
          }
          var roleLabel = addRole === 'admin'
            ? (lang === 'ar' ? 'مدير' : 'Admin')
            : (lang === 'ar' ? 'مشرف' : 'Moderator');
          onNotification('✅ ' + (lang === 'ar' ? 'تمت إضافة ' : 'Added as ') + roleLabel);
          setSearchTerm('');
        } catch (e) { onNotification('❌ Error: ' + e.message); }
      }
      setSearching(false);
    };

    return (/*#__PURE__*/
      React.createElement('div', null, /*#__PURE__*/

      /* ── Header ── */
      React.createElement('div', { style: { fontSize: '13px', fontWeight: 700, color: '#8b5cf6', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' } }, /*#__PURE__*/
        React.createElement('span', null, '🛡️ ', lang === 'ar' ? 'إدارة فريق العمل' : 'Staff Management'),

        /* Owner controls: UID search + role picker + Add button */
        myRole === 'owner' &&
        React.createElement('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
          React.createElement('input', { className: 'input-dark', style: { width: '130px', padding: '5px 10px', fontSize: '11px' },
            placeholder: lang === 'ar' ? 'UID / ID / الاسم' : 'UID / ID / Name',
            value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) }),
          React.createElement('select', { value: addRole, onChange: (e) => setAddRole(e.target.value),
            style: { padding: '5px 8px', fontSize: '11px', background: '#1e293b', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer' } },
            React.createElement('option', { value: 'moderator', style: { background: '#1e293b', color: '#e5e7eb' } }, lang === 'ar' ? 'مشرف' : 'Moderator'),
            React.createElement('option', { value: 'admin',     style: { background: '#1e293b', color: '#e5e7eb' } }, lang === 'ar' ? 'مدير' : 'Admin')
          ),
          React.createElement('button', { onClick: addStaff, disabled: searching || !searchTerm,
            className: 'btn-neon', style: { padding: '5px 12px', fontSize: '11px' } },
            searching ? '⏳' : `➕ ${lang === 'ar' ? 'إضافة' : 'Add'}`
          )
        )
      ),

      /* ── List ── */
      loading
        ? /*#__PURE__*/React.createElement('div', { style: { textAlign: 'center', padding: '20px' } }, '⏳')
        : staff.length === 0
          ? /*#__PURE__*/React.createElement('div', { style: { textAlign: 'center', padding: '20px', color: '#6b7280', fontSize: '12px' } },
              lang === 'ar' ? 'لا يوجد فريق عمل بعد' : 'No staff yet')
          : /*#__PURE__*/React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
              staff.map((s) => {
                var color = ROLE_COLORS[s.role] || '#9ca3af';
                var icon  = ROLE_ICONS[s.role]  || '👤';
                var isMe  = s.uid === currentUser?.uid || s.id === currentUser?.uid;
                return (/*#__PURE__*/
                  React.createElement('div', { key: s.id, style: { background: isMe ? `${color}12` : 'rgba(255,255,255,0.03)', border: `1px solid ${isMe ? color + '40' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' } }, /*#__PURE__*/

                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 } }, /*#__PURE__*/
                    React.createElement('img', { src: s.photoURL || 'https://via.placeholder.com/40', style: { width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${color}`, objectFit: 'cover', flexShrink: 0 } }), /*#__PURE__*/
                    React.createElement('div', { style: { minWidth: 0 } }, /*#__PURE__*/
                      React.createElement('div', { style: { fontSize: '13px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                        s.displayName || 'Unknown', isMe ? ` (${lang === 'ar' ? 'أنت' : 'You'})` : ''
                      ), /*#__PURE__*/
                      React.createElement('div', { style: { fontSize: '10px', color, fontWeight: 700 } }, icon, ' ', (s.role || '').toUpperCase()), /*#__PURE__*/
                      React.createElement('div', { style: { fontSize: '9px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, s.uid || s.id)
                    )
                  ),

                  myRole === 'owner' && !isMe && /*#__PURE__*/
                  React.createElement('div', { style: { display: 'flex', gap: '6px', flexShrink: 0 } },
                    editing === s.id
                      ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/
                          React.createElement('select', { value: newRole || s.role, onChange: (e) => setNewRole(e.target.value),
                            className: 'input-dark', style: { fontSize: '11px', padding: '4px 8px' } }, /*#__PURE__*/
                            React.createElement('option', { value: 'moderator' }, 'MODERATOR'), /*#__PURE__*/
                            React.createElement('option', { value: 'admin' }, 'ADMIN'), /*#__PURE__*/
                            React.createElement('option', { value: 'owner' }, 'OWNER'), /*#__PURE__*/
                            React.createElement('option', { value: 'user' }, 'REMOVE STAFF')
                          ), /*#__PURE__*/
                          React.createElement('button', { onClick: () => updateRole(s.id, s.displayName), style: { padding: '4px 8px', background: '#10b981', color: '#fff', borderRadius: '6px', fontSize: '11px', border: 'none', cursor: 'pointer' } }, '💾'), /*#__PURE__*/
                          React.createElement('button', { onClick: () => setEditing(null), style: { padding: '4px 8px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '11px', border: 'none', cursor: 'pointer' } }, '✕')
                        )
                      : /*#__PURE__*/React.createElement('button', { onClick: () => { setEditing(s.id); setNewRole(s.role); },
                          className: 'btn-neon', style: { padding: '5px 12px', fontSize: '11px' } }, '✏️ ',
                          lang === 'ar' ? 'تعديل' : 'Edit'
                        )
                  )
                  ));
              })
            )
      ));
  };

  window.StaffManagementSection = StaffManagementSection;
})();