(function () {
  var { useState } = React;

  var GroupsList = (props) => {
    var {
      groups, loadingGroups, currentUID, currentUserData, lang, onNotification,
      showCreate, setShowCreate, groupName, setGroupName, createGroup, creating,
      setActiveGroup, hasUnread, fmtTime
    } = props;

    var isVIP = currentUserData?.vip?.isActive;
    var maxGroups = isVIP ? 3 : 2;
    var ownedCount = groups.filter((g) => g.createdBy === currentUID).length;

    if (loadingGroups) return /*#__PURE__*/React.createElement("div", { style: { textAlign: 'center', padding: '32px', color: '#6b7280' } }, "\u23F3");

    return (/*#__PURE__*/
      React.createElement("div", { style: { padding: '0 16px' } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '10px', color: '#4b5563' } },
      lang === 'ar' ? `${ownedCount}/${maxGroups} جروبات` : `${ownedCount}/${maxGroups} groups`,
      !isVIP && /*#__PURE__*/React.createElement("span", { style: { color: '#a78bfa', marginLeft: '4px', marginRight: '4px' } }, "\xB7 VIP \u2192 3")
      ), /*#__PURE__*/
      React.createElement("button", { onClick: () => setShowCreate(!showCreate), style: { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '10px', border: '1px solid rgba(167,139,250,0.4)', background: 'rgba(167,139,250,0.12)', color: '#a78bfa', fontSize: '12px', fontWeight: 700, cursor: 'pointer', opacity: ownedCount >= maxGroups ? 0.5 : 1 } }, "\u2795 ",
      lang === 'ar' ? 'جروب جديد' : 'New Group'
      )
      ),

      showCreate && /*#__PURE__*/
      React.createElement("div", { style: { marginBottom: '14px', padding: '14px', background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '14px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '12px', fontWeight: 700, color: '#a78bfa', marginBottom: '10px' } }, "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67 ", lang === 'ar' ? 'إنشاء جروب جديد' : 'Create New Group'), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '8px' } }, /*#__PURE__*/
      React.createElement("div", { style: { flex: 1, position: 'relative' } }, /*#__PURE__*/
      React.createElement("input", { value: groupName, onChange: (e) => setGroupName(e.target.value.slice(0, 7)), onKeyDown: (e) => e.key === 'Enter' && createGroup(),
        maxLength: 7,
        style: { width: '100%', padding: '8px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: '12px', outline: 'none', boxSizing: 'border-box' },
        placeholder: lang === 'ar' ? 'اسم الجروب (7 أحرف)...' : 'Group name (7 chars)...' }), /*#__PURE__*/
      React.createElement("span", { style: { position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '9px', color: groupName.length >= 7 ? '#f87171' : '#6b7280', fontWeight: 700 } }, groupName.length, "/7")
      ), /*#__PURE__*/
      React.createElement("button", { onClick: createGroup, disabled: !groupName.trim() || creating,
        style: { padding: '8px 14px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer', background: groupName.trim() ? 'linear-gradient(135deg,#7000ff,#a78bfa)' : 'rgba(255,255,255,0.06)', color: groupName.trim() ? 'white' : '#6b7280' } },
      creating ? '...' : lang === 'ar' ? 'إنشاء' : 'Create'
      )
      )
      ),


      groups.length === 0 ? /*#__PURE__*/
      React.createElement("div", { style: { textAlign: 'center', padding: '32px', color: '#6b7280' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '36px', marginBottom: '10px' } }, "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 600, color: '#4b5563', marginBottom: '6px' } }, lang === 'ar' ? 'لا جروبات بعد' : 'No groups yet'), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px' } }, lang === 'ar' ? 'أنشئ جروب وادعو أصدقاءك' : 'Create a group and invite your friends')
      ) : /*#__PURE__*/

      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
      groups.map((group) => {
        var unread = hasUnread(group);
        var gLvl = window.getGroupLevel(group.xp || 0);
        return (/*#__PURE__*/
          React.createElement("div", { key: group.id, onClick: () => setActiveGroup(group), style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '14px', cursor: 'pointer', background: unread ? 'linear-gradient(135deg,rgba(167,139,250,0.1),rgba(112,0,255,0.06))' : 'rgba(255,255,255,0.04)', border: unread ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(255,255,255,0.07)', transition: 'all 0.2s' } }, /*#__PURE__*/
          React.createElement("div", { style: { position: 'relative', flexShrink: 0 } }, /*#__PURE__*/
          React.createElement("div", { style: { width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(167,139,250,0.25),rgba(112,0,255,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', overflow: 'hidden' } },
          group.photoURL ? /*#__PURE__*/React.createElement("img", { src: group.photoURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : '👨‍👩‍👧'
          ),
          unread && /*#__PURE__*/React.createElement("div", { style: { position: 'absolute', top: '-2px', right: '-2px', width: '12px', height: '12px', borderRadius: '50%', background: '#a78bfa', border: '2px solid var(--bg-main)', boxShadow: '0 0 6px rgba(167,139,250,0.8)' } })
          ), /*#__PURE__*/
          React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
          React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' } }, /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '13px', fontWeight: unread ? 800 : 600, color: unread ? '#e2e8f0' : '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, group.name), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '9px', color: '#6b7280', flexShrink: 0, marginLeft: '6px' } }, fmtTime(group.lastMessageAt))
          ), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '11px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, group.lastMessage || (lang === 'ar' ? 'لا رسائل' : 'No messages')), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '9px', color: '#4b5563', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/
          React.createElement("span", null, group.members?.length || 1, " ", lang === 'ar' ? 'عضو' : 'members'), /*#__PURE__*/
          React.createElement("span", { style: { color: gLvl.color, fontWeight: 700 } }, gLvl.icon, " Lv.", gLvl.level)
          )
          ), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '16px', color: '#6b7280', flexShrink: 0 } }, "\u203A")
          ));

      })
      )

      ));

  };

  window.GroupsList = GroupsList;
})();