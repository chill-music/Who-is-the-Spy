(function () {
  var { useState, useRef, useEffect, Fragment } = React;

  var GroupChatModal = (props) => {
    var {
      activeGroup, currentUID, currentUserData, friendsData, lang, onNotification, onOpenProfile, onSendGift,
      onClose, messages, msgText, setMsgText, sendMessage, handleImageSelect, handleGroupPhotoUpload,
      uploadingImg, showDetails, setShowDetails, membersData, loadingMembers, setSettingsView, settingsView,
      groupNotice, setGroupNotice, editingNotice, setEditingNotice, groupMuted, setGroupMuted,
      showReportGroup, setShowReportGroup, reportGroupReason, setReportGroupReason, sendingGroupReport,
      handleSubmitGroupReport, groupInviteType, setGroupInviteType, groupIsPublic, setGroupIsPublic,
      saveGroupManageSettings, saveGroupNotice, transferToId, setTransferToId, showTransferConfirm,
      setShowTransferConfirm, handleTransferOwnership, handleLeaveGroup, handleDeleteGroup,
      showRedPacketModal, setShowRedPacketModal, sendingRedPacket, sendGroupRedPacket, claimRedPacket,
      groupMiniProfile, setGroupMiniProfile, openGroupMiniProfile, handleBlock, handleUnblock,
      fmtTime, messagesEndRef, chatInputRef, fileInputRef, groupImgInputRef, showEmojiPicker, setShowEmojiPicker
    } = props;

    // ── Late-binding: read from window at render time ──
    var PortalModal = window.PortalModal || (({ children }) => children);

    // Local state for invite overlay (managed here, passed to GroupDetailsModal)
    var [showInvite, setShowInvite] = React.useState(false);

    var isOwner = activeGroup.createdBy === currentUID;
    var isAdm = activeGroup.admins?.includes(currentUID);
    var grpLvl = window.getGroupLevel(activeGroup.xp || 0);

    // ─── inviteFriend helper for GroupDetailsModal ───
    var handleInviteFriend = async (friendId) => {
      if (!activeGroup || activeGroup.members?.includes(friendId)) return;
      try {
        await groupsCollection.doc(activeGroup.id).update({ members: firebase.firestore.FieldValue.arrayUnion(friendId) });
        onNotification(lang === 'ar' ? '✅ تمتالدعوة' : '✅ Invited');
        setShowInvite(false);
      } catch (e) {}
    };

    return (/*#__PURE__*/
      React.createElement(Fragment, null, /*#__PURE__*/
      React.createElement(PortalModal, null, /*#__PURE__*/
      React.createElement("input", { ref: fileInputRef, type: "file", accept: "image/*", style: { display: 'none' }, onChange: handleImageSelect }), /*#__PURE__*/
      React.createElement("input", { ref: groupImgInputRef, type: "file", accept: "image/*", style: { display: 'none' }, onChange: handleGroupPhotoUpload }), /*#__PURE__*/

      React.createElement("div", { style: {
          position: 'fixed', inset: 0, zIndex: Z.MODAL_HIGH,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '4px'
        }, onClick: onClose }, /*#__PURE__*/
      React.createElement("div", { style: {
          display: 'flex', flexDirection: 'column',
          width: '100%', maxWidth: 'min(440px, calc(100vw - 8px))',
          height: 'min(94vh,700px)', minHeight: '400px',
          background: 'linear-gradient(160deg,rgba(5,5,18,0.99),rgba(9,8,26,0.99))',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '16px', overflow: 'hidden',
          boxShadow: '0 28px 70px rgba(0,0,0,0.9)',
          position: 'relative', boxSizing: 'border-box'
        }, onClick: (e) => e.stopPropagation() }, /*#__PURE__*/

      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', background: 'rgba(7,7,22,1)', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 } }, /*#__PURE__*/
      React.createElement("button", { onClick: onClose, style: { background: 'none', border: 'none', color: '#00f2ff', fontSize: '20px', cursor: 'pointer', padding: '0 4px', lineHeight: 1 } }, "\u2039"), /*#__PURE__*/
      React.createElement("div", {
        onClick: () => setShowDetails(true),
        style: { width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(167,139,250,0.3),rgba(112,0,255,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0, overflow: 'hidden', cursor: 'pointer', position: 'relative' } },

      activeGroup.photoURL ? /*#__PURE__*/
      React.createElement(window.AvatarWithFrame, {
        photoURL: activeGroup.photoURL,
        size: "sm",
        lang: lang,
        equipped: { isEffect: activeGroup.photoURL.includes('.gif') }
      }) :
      '👨‍👩‍👧'
      ), /*#__PURE__*/
      React.createElement("div", { style: { flex: 1, minWidth: 0, cursor: 'pointer' }, onClick: () => setShowDetails(true) }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 700, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, activeGroup.name),
      activeGroup.familyTag && window.FamilySignBadge && /*#__PURE__*/
      React.createElement("div", { style: { transform: 'scale(0.85)', transformOrigin: 'left center', flexShrink: 0 } }, /*#__PURE__*/
      React.createElement(window.FamilySignBadge, {
        tag: activeGroup.familyTag,
        signLevel: activeGroup.familySignLevel || (activeGroup.level ? Math.min(activeGroup.level, 5) : 1),
        color: activeGroup.familySignColor || window.FamilyConstants?.getFamilySignLevelDataByLevel?.(activeGroup.familySignLevel || (activeGroup.level ? Math.min(activeGroup.level, 5) : 1))?.color || '#00f2ff',
        imageURL: window.FamilyConstants?.getFamilySignImage?.(0, activeGroup.familySignLevel || (activeGroup.level ? Math.min(activeGroup.level, 5) : 1)) || activeGroup.familySignImageURL,
        small: true }
      )
      )

      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '10px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/
      React.createElement("span", null, activeGroup.members?.length || 1, " ", lang === 'ar' ? 'عضو' : 'members'), /*#__PURE__*/
      React.createElement("span", { style: { color: grpLvl.color, fontWeight: 700 } }, grpLvl.icon, " Lv.", grpLvl.level)
      )
      ),
      isAdm && /*#__PURE__*/React.createElement("button", { onClick: () => setShowDetails(true), style: { background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', color: '#a78bfa', flexShrink: 0 }, title: lang === 'ar' ? 'إعدادات الجروب' : 'Group Settings' }, "\u2699\uFE0F")
      ), /*#__PURE__*/


      React.createElement("div", { style: {
          flex: 1, overflowY: 'auto', padding: '12px 10px',
          display: 'flex', flexDirection: 'column', gap: '4px',
          background: activeGroup.photoURL ?
          `linear-gradient(rgba(5,5,16,0.82),rgba(8,8,22,0.82)), url(${activeGroup.photoURL}) center/cover no-repeat` :
          'linear-gradient(180deg,rgba(5,5,16,0.98),rgba(8,8,22,0.98))',
          backgroundAttachment: 'local'
        } },
      messages.map((msg) => {
        if (msg.type === 'system') return (/*#__PURE__*/
          React.createElement("div", { key: msg.id, style: { textAlign: 'center', fontSize: '10px', color: '#6b7280', padding: '3px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '20px', alignSelf: 'center', maxWidth: '80%' } }, msg.text));

        if (msg.type === 'red_packet') {
          var isMeRP = msg.senderId === currentUID;
          var vipCfgRP = window.getVIPConfig(msg.senderVipLevel);
          return (/*#__PURE__*/
            React.createElement("div", { key: msg.id, style: { display: 'flex', flexDirection: isMeRP ? 'row-reverse' : 'row', gap: '7px', alignItems: 'flex-end', marginBottom: '4px' } }, /*#__PURE__*/
            React.createElement("div", { onClick: () => claimRedPacket(msg.rpId), 
              style: { width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', flexShrink: 0, cursor: 'pointer', position: 'relative' } },
            React.createElement(window.AvatarWithFrame, {
              photoURL: msg.senderPhoto,
              size: "xs",
              lang: lang,
              equipped: { isEffect: msg.senderPhoto?.includes('.gif'), frames: msg.senderFrame }
            })
            ), /*#__PURE__*/
            React.createElement("div", { style: { maxWidth: 'min(220px, calc(100vw - 90px))' } }, /*#__PURE__*/
            React.createElement("div", { onClick: () => openGroupMiniProfile(msg.senderId, { name: msg.senderName, photo: msg.senderPhoto }),
              style: { fontSize: '9px', color: vipCfgRP ? vipCfgRP.nameColor : '#a78bfa', fontWeight: 700, marginBottom: '3px', paddingLeft: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' } },
            vipCfgRP && /*#__PURE__*/React.createElement("span", { style: { fontSize: '7px', fontWeight: 900, background: vipCfgRP.nameColor, color: '#000', padding: '0 3px', borderRadius: '2px' } }, "VIP", msg.senderVipLevel),
            msg.senderName,
            isMeRP && /*#__PURE__*/React.createElement("span", { style: { fontSize: '8px', color: '#4b5563' } }, " (", lang === 'ar' ? 'أنت' : 'you', ")")
            ), /*#__PURE__*/
            React.createElement("button", { onClick: () => claimRedPacket(msg.rpId), style: {
                display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '16px',
                background: `linear-gradient(135deg,rgba(239,68,68,0.25),rgba(185,28,28,0.2))`,
                border: `1px solid rgba(239,68,68,0.5)`, cursor: 'pointer', width: '100%',
                boxShadow: `0 4px 16px rgba(239,68,68,0.3)`
              } }, /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '32px', filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.7))' } }, "\uD83E\uDDE7"), /*#__PURE__*/
            React.createElement("div", { style: { flex: 1, textAlign: 'left' } }, /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '12px', fontWeight: 800, color: '#ffd700' } }, lang === 'ar' ? 'مغلف أحمر' : 'Red Packet'), /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '10px', color: '#fca5a5', marginTop: '2px' } }, msg.rpAmount?.toLocaleString(), " \uD83E\uDDE0 \xB7 ", msg.maxClaims, " ", lang === 'ar' ? 'مستلم' : 'claims'), /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '9px', color: 'rgba(252,165,165,0.7)', marginTop: '2px' } }, lang === 'ar' ? 'اضغط للاستلام' : 'Tap to claim', " \uD83C\uDF81")
            )
            ), /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '9px', color: '#374151', marginTop: '2px', textAlign: isMeRP ? 'right' : 'left', paddingLeft: '4px' } }, fmtTime(msg.createdAt))
            )
            ));

        }
        var isMe = msg.senderId === currentUID;
        var isImage = msg.type === 'image';
        var vipCfgMsg = window.getVIPConfig(msg.senderVipLevel);
        var nameColor = vipCfgMsg ? vipCfgMsg.nameColor : isMe ? '#00f2ff' : '#a78bfa';
        return (/*#__PURE__*/
          React.createElement("div", { key: msg.id, style: { display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '7px', alignItems: 'flex-end' } }, /*#__PURE__*/
          React.createElement("div", { style: { position: 'relative', width: '30px', height: '30px', flexShrink: 0 } }, 
          React.createElement(window.AvatarWithFrame, {
            photoURL: msg.senderPhoto,
            equipped: { frames: msg.senderFrame, badges: msg.senderBadges, isEffect: msg.senderPhoto?.includes('.gif') },
            size: "xs",
            lang: lang,
            onClick: () => openGroupMiniProfile(msg.senderId, { name: msg.senderName, photo: msg.senderPhoto })
          })
          ), /*#__PURE__*/
          React.createElement("div", { style: { maxWidth: 'min(70%, calc(100vw - 80px))' } }, /*#__PURE__*/
          React.createElement("div", { style: { marginBottom: '2px', paddingLeft: isMe ? 0 : '4px', paddingRight: isMe ? '4px' : 0 } }, /*#__PURE__*/
          React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', cursor: 'pointer', justifyContent: isMe ? 'flex-end' : 'flex-start' },
            onClick: () => openGroupMiniProfile(msg.senderId, { name: msg.senderName, photo: msg.senderPhoto }) },
          vipCfgMsg && /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '7px', fontWeight: 900, background: vipCfgMsg.nameColor, color: '#000', padding: '1px 3px', borderRadius: '2px', flexShrink: 0 } }, "VIP", msg.senderVipLevel), /*#__PURE__*/

          React.createElement("span", { style: { fontSize: '9px', color: nameColor, fontWeight: 700 } }, msg.senderName, isMe ? ` (${lang === 'ar' ? 'أنت' : 'you'})` : ''),
          msg.senderVipLevel > 0 && typeof window.VIP_CHAT_TITLE_URLS !== 'undefined' && window.VIP_CHAT_TITLE_URLS?.[msg.senderVipLevel] && /*#__PURE__*/
          React.createElement("img", { src: window.VIP_CHAT_TITLE_URLS[msg.senderVipLevel], alt: "", style: { height: '11px', objectFit: 'contain' } }),

          (msg.senderBadges || []).slice(0, 3).map((b, bi) => {
            if (!b) return null;
            var badge = typeof window.ACHIEVEMENTS !== 'undefined' ? window.ACHIEVEMENTS.find((a) => a.id === b) : null;
            if (!badge) return null;
            return badge.imageUrl ? /*#__PURE__*/
            React.createElement("img", { key: bi, src: badge.imageUrl, alt: "", onError: (e) => e.target.style.display = 'none', style: { width: '12px', height: '12px', objectFit: 'contain', flexShrink: 0 } }) : /*#__PURE__*/
            React.createElement("span", { key: bi, style: { fontSize: '10px' } }, badge.icon || '🏅');
          })
          ),
          msg.senderTitle && /*#__PURE__*/React.createElement("div", { style: { fontSize: '8px', color: '#fbbf24', marginTop: '1px', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px', textAlign: isMe ? 'right' : 'left' } }, msg.senderTitle)
          ),
          isImage ? /*#__PURE__*/
          React.createElement("div", { onClick: () => {
            var _s = msg.imageData;
            var _h = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0}body{background:#000;min-height:100vh;display:flex;align-items:center;justify-content:center}img{max-width:100vw;max-height:100vh;object-fit:contain}</style></head><body><img src="' + _s.replace(/"/g, '&quot;') + '"></body></html>';
            var _b = new Blob([_h], { type: 'text/html' });
            var _u = URL.createObjectURL(_b);
            var _w = window.open(_u, '_blank');
            if (_w) setTimeout(function () { URL.revokeObjectURL(_u); }, 30000);
          },
            style: { borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px', overflow: 'hidden', border: `1px solid ${isMe ? 'rgba(0,242,255,0.18)' : 'rgba(255,255,255,0.09)'}`, cursor: 'pointer', maxWidth: 'min(200px, calc(100vw - 90px))' } }, /*#__PURE__*/
          React.createElement("img", { src: msg.imageData, alt: "\uD83D\uDCF7", style: { display: 'block', maxWidth: 'min(200px, calc(100vw - 90px))', maxHeight: '200px', objectFit: 'cover' } })
          ) : /*#__PURE__*/

          React.createElement("div", { style: { padding: '8px 12px', borderRadius: isMe ? '14px 4px 14px 14px' : '4px 14px 14px 14px', background: isMe ? 'linear-gradient(135deg,rgba(112,0,255,0.45),rgba(0,242,255,0.2))' : 'rgba(255,255,255,0.08)', border: isMe ? '1px solid rgba(0,242,255,0.2)' : '1px solid rgba(255,255,255,0.09)', fontSize: '12px', color: '#e2e8f0', lineHeight: 1.5, wordBreak: 'break-word' } }, msg.text), /*#__PURE__*/

          React.createElement("div", { style: { fontSize: '9px', color: '#374151', marginTop: '2px', textAlign: isMe ? 'right' : 'left', paddingLeft: '4px', paddingRight: '4px' } }, fmtTime(msg.createdAt))
          )
          ));

      }),
      messages.length === 0 && /*#__PURE__*/React.createElement("div", { style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: '#4b5563', paddingTop: '40px' } }, /*#__PURE__*/React.createElement("div", { style: { fontSize: '32px' } }, "\uD83D\uDCAC"), /*#__PURE__*/React.createElement("div", { style: { fontSize: '12px' } }, lang === 'ar' ? 'ابدأ المحادثة!' : 'Say hi!')), /*#__PURE__*/
      React.createElement("div", { ref: messagesEndRef })
      ),


      showEmojiPicker && window.EmojiPicker && /*#__PURE__*/
      React.createElement("div", { style: {
          position: 'absolute', bottom: '56px', left: '8px', right: '8px', zIndex: 100,
          background: '#0f0e1a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.8)', overflow: 'hidden'
        } }, /*#__PURE__*/
      React.createElement(window.EmojiPicker, {
        onEmojiSelect: (emoji) => {
          setMsgText((prev) => prev + emoji);
        },
        theme: "dark" }
      )
      ),



      showRedPacketModal && /*#__PURE__*/
      React.createElement("div", { style: {
          position: 'absolute', inset: 0, zIndex: 110,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }, onClick: () => setShowRedPacketModal(false) }, /*#__PURE__*/
      React.createElement("div", { style: {
          width: '100%', maxWidth: '320px', background: '#1a1a2e', borderRadius: '24px',
          border: '1px solid rgba(239,68,68,0.3)', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(239,68,68,0.1)'
        }, onClick: (e) => e.stopPropagation() }, /*#__PURE__*/
      React.createElement("div", { style: { padding: '20px', textAlign: 'center', background: 'linear-gradient(180deg,#ef4444, #991b1b)', color: 'white' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '40px', marginBottom: '10px' } }, "\uD83E\uDDE7"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '18px', fontWeight: 800 } }, lang === 'ar' ? 'إرسال مغلف أحمر' : 'Send Red Packet')
      ), /*#__PURE__*/
      React.createElement("div", { style: { padding: '15px', maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' } },
      (window.RED_PACKETS_CONFIG || [
      { id: 'rp1', amount: 1000, label: '1K' },
      { id: 'rp2', amount: 5000, label: '5K' },
      { id: 'rp3', amount: 10000, label: '10K' },
      { id: 'rp4', amount: 50000, label: '50K' }]).
      map((rp) => /*#__PURE__*/
      React.createElement("button", { key: rp.id, onClick: () => sendGroupRedPacket(rp),
        disabled: sendingRedPacket || (currentUserData?.currency || 0) < rp.amount,
        style: {
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 18px', borderRadius: '14px',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'white', cursor: 'pointer'
        } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '18px' } }, "\uD83E\uDDE0"), /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '15px', fontWeight: 700 } }, rp.amount.toLocaleString())
      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '20px', color: '#ef4444' } }, "\uD83E\uDDE7")
      )
      )
      )
      )
      ),



      (showDetails || showInvite) && (() => {
        var GDM = window.GroupDetailsModal;
        if (!GDM) return null;
        return (/*#__PURE__*/
          React.createElement(GDM, {
            showDetails: showDetails, setShowDetails: setShowDetails,
            showInvite: showInvite, setShowInvite: setShowInvite,
            activeGroup: activeGroup, friendsData: friendsData,
            inviteFriend: handleInviteFriend, lang: lang,
            settingsView: settingsView, setSettingsView: setSettingsView,
            isOwner: isOwner, isAdm: isAdm,
            groupImgInputRef: groupImgInputRef, grpLvl: grpLvl,
            membersData: membersData, loadingMembers: loadingMembers,
            editingNotice: editingNotice, setEditingNotice: setEditingNotice,
            groupNotice: groupNotice, setGroupNotice: setGroupNotice,
            saveGroupNotice: saveGroupNotice, saveGroupManageSettings: saveGroupManageSettings,
            groupMuted: groupMuted, setGroupMuted: setGroupMuted,
            showReportGroup: showReportGroup, setShowReportGroup: setShowReportGroup,
            reportGroupReason: reportGroupReason, setReportGroupReason: setReportGroupReason,
            handleSubmitGroupReport: handleSubmitGroupReport, sendingGroupReport: sendingGroupReport,
            handleLeaveGroup: handleLeaveGroup, handleDeleteGroup: handleDeleteGroup,
            removeAdmin: () => {}, makeAdmin: () => {}, kickMember: () => {},
            groupInviteType: groupInviteType, setGroupInviteType: setGroupInviteType,
            groupIsPublic: groupIsPublic, setGroupIsPublic: setGroupIsPublic,
            transferToId: transferToId, setTransferToId: setTransferToId,
            showTransferConfirm: showTransferConfirm, setShowTransferConfirm: setShowTransferConfirm,
            handleTransferOwnership: handleTransferOwnership }
          ));

      })(), /*#__PURE__*/


      React.createElement("div", { style: { display: 'flex', gap: '5px', padding: '8px 8px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, background: 'rgba(0,0,0,0.45)', boxSizing: 'border-box', width: '100%' } }, /*#__PURE__*/
      React.createElement("button", { onClick: () => setShowEmojiPicker((v) => !v), style: { width: '34px', height: '34px', borderRadius: '10px', border: `1px solid ${showEmojiPicker ? 'rgba(0,242,255,0.3)' : 'rgba(255,255,255,0.08)'}`, background: showEmojiPicker ? 'rgba(0,242,255,0.12)' : 'rgba(255,255,255,0.05)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, "\uD83D\uDE00"), /*#__PURE__*/
      React.createElement("button", { onClick: () => fileInputRef.current?.click(), disabled: uploadingImg, title: lang === 'ar' ? 'إرسال صورة' : 'Send image', style: { width: '36px', height: '36px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)', cursor: uploadingImg ? 'wait' : 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: uploadingImg ? 0.5 : 1 } },
      uploadingImg ? '⏳' : '🖼️'
      ), /*#__PURE__*/
      React.createElement("button", { onClick: () => setShowRedPacketModal(true), title: lang === 'ar' ? 'مغلف أحمر' : 'Red Packet',
        style: { width: '36px', height: '36px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', cursor: 'pointer', fontSize: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, "\uD83E\uDDE7"

      ), /*#__PURE__*/
      React.createElement("input", {
        ref: chatInputRef,
        value: msgText,
        onChange: (e) => setMsgText(e.target.value),
        onKeyDown: (e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage()),
        style: { flex: 1, padding: '8px 10px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', outline: 'none', minWidth: 0, width: '100%' },
        placeholder: lang === 'ar' ? 'اكتب رسالة...' : 'Type a message...' }
      ), /*#__PURE__*/
      React.createElement("button", { onClick: sendMessage, disabled: !msgText.trim(), style: { width: '38px', height: '38px', borderRadius: '12px', border: 'none', cursor: 'pointer', flexShrink: 0, background: msgText.trim() ? 'linear-gradient(135deg,#7000ff,#00f2ff)' : 'rgba(255,255,255,0.06)', color: msgText.trim() ? 'white' : '#6b7280', fontSize: '16px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, "\u27A4")
      )
      )
      )
      )
      ));

  };

  window.GroupChatModal = GroupChatModal;
})();