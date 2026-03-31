(function () {
  var { useState, useEffect } = React;

  var GroupDetailsModal = (props) => {
    var {
      showInvite, setShowInvite, friendsData, activeGroup, inviteFriend, lang,
      showDetails, setShowDetails, settingsView, setSettingsView, isOwner, isAdm,
      groupImgInputRef, grpLvl, membersData, loadingMembers, editingNotice, setEditingNotice,
      groupNotice, setGroupNotice, saveGroupNotice, saveGroupManageSettings,
      groupMuted, setGroupMuted, showReportGroup, setShowReportGroup, reportGroupReason,
      setReportGroupReason, handleSubmitGroupReport, sendingGroupReport, handleLeaveGroup,
      handleDeleteGroup, removeAdmin, makeAdmin, kickMember, groupInviteType, setGroupInviteType,
      groupIsPublic, setGroupIsPublic, transferToId, setTransferToId, showTransferConfirm,
      setShowTransferConfirm, handleTransferOwnership
    } = props;

    if (!showDetails && !showInvite) return null;

    return (/*#__PURE__*/
      React.createElement("div", { style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5,5,20,0.99)', zIndex: 150, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '16px' } },

      showInvite && /*#__PURE__*/
      React.createElement("div", { style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5,5,20,0.97)', zIndex: 160, display: 'flex', flexDirection: 'column', padding: '16px' } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '14px', fontWeight: 800, color: '#a78bfa' } }, "\uD83D\uDC65 ", lang === 'ar' ? 'دعوة صديق' : 'Invite Friend'), /*#__PURE__*/
      React.createElement("button", { onClick: () => setShowInvite(false), style: { background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer' } }, "\u2715")
      ), /*#__PURE__*/
      React.createElement("div", { style: { overflowY: 'auto', flex: 1 } },
      friendsData.filter((f) => !(activeGroup.members || []).includes(f.id)).length === 0 ? /*#__PURE__*/
      React.createElement("div", { style: { textAlign: 'center', padding: '20px', color: '#6b7280', fontSize: '12px' } }, lang === 'ar' ? 'لا يوجد أصدقاء لدعوتهم' : 'No friends to invite') :
      friendsData.filter((f) => !(activeGroup.members || []).includes(f.id)).map((friend) => /*#__PURE__*/
      React.createElement("div", { key: friend.id, style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' } }, /*#__PURE__*/
      React.createElement("div", { style: { width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', flexShrink: 0 } },
      friend.photoURL ? /*#__PURE__*/React.createElement("img", { src: friend.photoURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/React.createElement("div", { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' } }, "\uD83D\uDE0E")
      ), /*#__PURE__*/
      React.createElement("div", { style: { flex: 1, fontSize: '13px', color: '#e2e8f0', fontWeight: 600 } }, friend.displayName), /*#__PURE__*/
      React.createElement("button", { onClick: () => inviteFriend(friend.id), style: { background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)', borderRadius: '8px', padding: '5px 12px', color: '#a78bfa', fontSize: '11px', fontWeight: 700, cursor: 'pointer' } }, "+ ", lang === 'ar' ? 'أضف' : 'Add')
      )
      )

      )
      ),



      showDetails && /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, background: 'rgba(7,7,22,1)' } },
      settingsView !== 'main' ? /*#__PURE__*/
      React.createElement("button", { onClick: () => setSettingsView('main'), style: { background: 'none', border: 'none', color: '#00f2ff', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, padding: 0 } }, "\u2039 ",
      lang === 'ar' ? 'رجوع' : 'Back'
      ) : /*#__PURE__*/

      React.createElement("button", { onClick: () => setShowDetails(false), style: { background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer', padding: 0 } }, "\u2039"), /*#__PURE__*/

      React.createElement("div", { style: { fontSize: '14px', fontWeight: 800, color: '#a78bfa' } },
      settingsView === 'main' ? lang === 'ar' ? 'إعدادات الجروب' : 'Group Settings' :
      settingsView === 'manage' ? lang === 'ar' ? 'إدارة الجروب' : 'Manage Group' :
      lang === 'ar' ? 'الأعضاء' : 'Members'
      ), /*#__PURE__*/
      React.createElement("button", { onClick: () => {setShowDetails(false);setSettingsView('main');}, style: { background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer', padding: 0 } }, "\u2715")
      ),



      showDetails && settingsView === 'main' && /*#__PURE__*/
      React.createElement("div", { style: { flex: 1, overflowY: 'auto', paddingBottom: '16px' } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' } }, /*#__PURE__*/
      React.createElement("div", { style: { position: 'relative', marginBottom: '10px' } }, /*#__PURE__*/
      React.createElement("div", { style: { width: '78px', height: '78px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(167,139,250,0.3),rgba(112,0,255,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px', overflow: 'hidden', border: '2px solid rgba(167,139,250,0.4)', boxShadow: '0 0 20px rgba(167,139,250,0.2)' } },
      activeGroup.photoURL ? /*#__PURE__*/React.createElement("img", { src: activeGroup.photoURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : '👨‍👩‍👧'
      ),
      (isOwner || isAdm) && /*#__PURE__*/
      React.createElement("button", { onClick: () => groupImgInputRef.current?.click(), style: { position: 'absolute', bottom: 0, right: 0, width: '26px', height: '26px', borderRadius: '50%', background: '#a78bfa', border: '2px solid rgba(5,5,20,1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px', padding: 0 } }, "\uD83D\uDCF7")

      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '17px', fontWeight: 800, color: 'white', marginBottom: '4px' } }, activeGroup.name), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '8px', fontSize: '11px', color: '#6b7280', alignItems: 'center' } }, /*#__PURE__*/
      React.createElement("span", null, activeGroup.members?.length || 1, " ", lang === 'ar' ? 'عضو' : 'members'), /*#__PURE__*/
      React.createElement("span", null, "\xB7"), /*#__PURE__*/
      React.createElement("span", { style: { color: grpLvl.color, fontWeight: 700 } }, grpLvl.icon, " Lv.", grpLvl.level),
      activeGroup.isPublic && /*#__PURE__*/React.createElement("span", { style: { fontSize: '9px', padding: '1px 6px', borderRadius: '10px', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontWeight: 700 } }, "\uD83C\uDF0D ", lang === 'ar' ? 'عام' : 'Public')
      )
      ), /*#__PURE__*/

      React.createElement("div", { style: { padding: '14px 16px' } }, /*#__PURE__*/
      React.createElement("div", { onClick: () => setSettingsView('members'), style: { fontSize: '12px', fontWeight: 700, color: '#9ca3af', marginBottom: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' } }, /*#__PURE__*/
      React.createElement("span", null, "\uD83D\uDC65 ", lang === 'ar' ? 'الأعضاء' : 'Members', " (", activeGroup.members?.length || 0, ")"), /*#__PURE__*/
      React.createElement("span", null, "\u203A")
      ),

      (isOwner || isAdm) && /*#__PURE__*/
      React.createElement("div", { onClick: () => setSettingsView('manage'), style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', cursor: 'pointer', marginBottom: '10px' } }, /*#__PURE__*/
      React.createElement("div", { style: { width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(0,242,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' } }, "\u2699\uFE0F"), /*#__PURE__*/
      React.createElement("div", { style: { flex: 1 } }, /*#__PURE__*/React.createElement("div", { style: { fontSize: '13px', fontWeight: 700, color: '#e2e8f0' } }, lang === 'ar' ? 'إدارة الجروب' : 'Manage Group')), /*#__PURE__*/
      React.createElement("span", { style: { color: '#6b7280', fontSize: '16px' } }, "\u203A")
      ), /*#__PURE__*/


      React.createElement("div", { style: { height: '12px' } }), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '8px' } },
      !isOwner && /*#__PURE__*/React.createElement("button", { onClick: handleLeaveGroup, style: { flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '12px', fontWeight: 700, cursor: 'pointer' } }, "\uD83D\uDEAA ", lang === 'ar' ? 'مغادرة' : 'Leave'),
      isOwner && /*#__PURE__*/React.createElement("button", { onClick: handleDeleteGroup, style: { flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '12px', fontWeight: 700, cursor: 'pointer' } }, "\uD83D\uDDD1\uFE0F ", lang === 'ar' ? 'حذف الجروب' : 'Delete')
      )
      )
      ),


      showDetails && settingsView === 'members' && /*#__PURE__*/
      React.createElement("div", { style: { flex: 1, overflowY: 'auto', padding: '16px' } }, /*#__PURE__*/
      React.createElement("button", { onClick: () => setShowInvite(true), style: { width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', fontSize: '13px', fontWeight: 800, marginBottom: '16px', cursor: 'pointer' } }, "\u2795 ", lang === 'ar' ? 'دعوة صديق' : 'Invite Friend'),
      loadingMembers ? /*#__PURE__*/React.createElement("div", { style: { textAlign: 'center', padding: '20px', color: '#6b7280' } }, "\u23F3") : /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
      membersData.sort((a, b) => {
        if (a.id === activeGroup.createdBy) return -1;if (b.id === activeGroup.createdBy) return 1;
        var aAdm = activeGroup.admins?.includes(a.id);var bAdm = activeGroup.admins?.includes(b.id);
        if (aAdm && !bAdm) return -1;if (!aAdm && bAdm) return 1;
        return 0;
      }).map((m) => /*#__PURE__*/
      React.createElement("div", { key: m.id, style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' } }, /*#__PURE__*/
      React.createElement("div", { style: { width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', flexShrink: 0 } },
      m.photoURL ? /*#__PURE__*/React.createElement("img", { src: m.photoURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/React.createElement("div", { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' } }, "\uD83D\uDE0E")
      ), /*#__PURE__*/
      React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', color: '#e2e8f0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, m.displayName), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '4px', marginTop: '1px' } },
      m.id === activeGroup.createdBy && /*#__PURE__*/React.createElement("span", { style: { fontSize: '8px', padding: '1px 4px', borderRadius: '4px', background: 'rgba(167,139,250,0.2)', color: '#a78bfa', fontWeight: 800 } }, "OWNER"),
      activeGroup.admins?.includes(m.id) && m.id !== activeGroup.createdBy && /*#__PURE__*/React.createElement("span", { style: { fontSize: '8px', padding: '1px 4px', borderRadius: '4px', background: 'rgba(0,242,255,0.15)', color: '#00f2ff', fontWeight: 800 } }, "ADMIN")
      )
      )

      )
      )
      )

      )

      ));

  };

  window.GroupDetailsModal = GroupDetailsModal;
})();