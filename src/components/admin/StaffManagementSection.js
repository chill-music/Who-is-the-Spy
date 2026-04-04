(function () {
  var { useState, useEffect, useMemo, useRef } = React;

  var StaffManagementSection = ({ currentUser, currentUserData, lang, onNotification }) => {
    var [staff, setStaff] = useState([]);
    var [loading, setLoading] = useState(true);
    var [editing, setEditing] = useState(null);
    var [newRole, setNewRole] = useState('');
    var [searchUID, setSearchUID] = useState('');
    var [searching, setSearching] = useState(false);

    useEffect(() => {
      var unsub = usersCollection.where('role', 'in', ['moderator', 'admin', 'owner']).onSnapshot(async (snap) => {
        var staffData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        
        // Also ensure AdminConfig.OWNERS are loaded if they don't have the role field
        if (window.AdminConfig && window.AdminConfig.OWNERS) {
          var missingOwnerUids = window.AdminConfig.OWNERS.filter(uid => !staffData.find(s => s.uid === uid));
          for (var uid of missingOwnerUids) {
            try {
              var doc = await usersCollection.doc(uid).get();
              if (doc.exists) {
                var d = doc.data();
                d.role = d.role || 'owner';
                staffData.push({ id: doc.id, ...d });
              }
            } catch (e) {}
          }
        }
        
        setStaff(staffData);
        setLoading(false);
      });
      return unsub;
    }, []);

    var updateRole = async (uid, currentRole) => {
      if (getUserRole(currentUserData, currentUser?.uid) !== 'owner') {
        onNotification('⛔ Only Owners can change roles');
        return;
      }
      try {
        await usersCollection.doc(uid).update({ role: newRole });
        if (window.logStaffAction) {
          await window.logStaffAction(currentUser.uid, currentUserData?.displayName, newRole === 'user' ? 'REMOVE_STAFF' : 'ASSIGN_ROLE', uid, 'User', `Changed role to: ${newRole}`);
        }
        onNotification('✅ Role updated');
        setEditing(null);
      } catch (e) {onNotification('❌ Error');}
    };

    var addStaffById = async () => {
      if (!searchUID.trim() || searching) return;
      setSearching(true);
      try {
        var res = await usersCollection.doc(searchUID.trim()).get();
        if (!res.exists) {
          onNotification(lang === 'ar' ? '❌ المستخدم غير موجود' : '❌ User not found');
        } else {
          await usersCollection.doc(searchUID.trim()).update({ role: 'moderator' });
          if (window.logStaffAction) {
            await window.logStaffAction(currentUser.uid, currentUserData?.displayName, 'ASSIGN_ROLE', searchUID.trim(), res.data().displayName || 'User', 'Changed role to: moderator');
          }
          onNotification(lang === 'ar' ? '✅ تمت إضافة المشرف' : '✅ Added as Moderator');
          setSearchUID('');
        }
      } catch (e) {onNotification('❌ Error');}
      setSearching(false);
    };

    return (/*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 700, color: '#8b5cf6', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, /*#__PURE__*/
      React.createElement("span", null, "\uD83D\uDEE1\uFE0F ", lang === 'ar' ? 'إدارة فريق العمل' : 'Staff Management'),
      getUserRole(currentUserData, currentUser?.uid) === 'owner' && /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '6px' } }, /*#__PURE__*/
      React.createElement("input", { className: "input-dark", style: { width: '120px', padding: '5px 10px', fontSize: '11px' },
        placeholder: "User ID", value: searchUID, onChange: (e) => setSearchUID(e.target.value) }), /*#__PURE__*/
      React.createElement("button", { onClick: addStaffById, disabled: searching || !searchUID,
        className: "btn-neon", style: { padding: '5px 12px', fontSize: '11px' } },
      searching ? '⏳' : `➕ ${lang === 'ar' ? 'إضافة' : 'Add'}`
      )
      )

      ),
      loading ? /*#__PURE__*/React.createElement("div", { style: { textAlign: 'center', padding: '20px' } }, "\u23F3") : /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
      staff.map((s) => /*#__PURE__*/
      React.createElement("div", { key: s.id, style: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, /*#__PURE__*/
      React.createElement("img", { src: s.photoURL || 'https://via.placeholder.com/40', style: { width: '36px', height: '36px', borderRadius: '50%' } }), /*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '12px', fontWeight: 700 } }, s.displayName), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '10px', color: ROLE_CONFIG[s.role]?.color || '#9ca3af' } }, s.role?.toUpperCase())
      )
      ),

      getUserRole(currentUserData, currentUser?.uid) === 'owner' && s.uid !== currentUser.uid && /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '6px' } },
      editing === s.id ? /*#__PURE__*/
      React.createElement(React.Fragment, null, /*#__PURE__*/
      React.createElement("select", { value: newRole || s.role, onChange: (e) => setNewRole(e.target.value),
        className: "input-dark", style: { fontSize: '10px', padding: '4px' } }, /*#__PURE__*/
      React.createElement("option", { value: "moderator" }, "MODERATOR"), /*#__PURE__*/
      React.createElement("option", { value: "admin" }, "ADMIN"), /*#__PURE__*/
      React.createElement("option", { value: "owner" }, "OWNER"), /*#__PURE__*/
      React.createElement("option", { value: "user" }, "REMOVE STAFF")
      ), /*#__PURE__*/
      React.createElement("button", { onClick: () => updateRole(s.id, s.role), style: { padding: '4px 8px', background: '#10b981', color: '#fff', borderRadius: '5px', fontSize: '10px', border: 'none', cursor: 'pointer' } }, "\uD83D\uDCBE"), /*#__PURE__*/
      React.createElement("button", { onClick: () => setEditing(null), style: { padding: '4px 8px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '5px', fontSize: '10px', border: 'none', cursor: 'pointer' } }, "\u2715")
      ) : /*#__PURE__*/

      React.createElement("button", { onClick: () => {setEditing(s.id);setNewRole(s.role);},
        className: "btn-neon", style: { padding: '5px 12px', fontSize: '10px' } }, "\u270F\uFE0F ",
      lang === 'ar' ? 'تعديل' : 'Edit'
      )

      )

      )
      )
      )

      ));

  };

  window.StaffManagementSection = StaffManagementSection;
})();