(function () {
  var { useState, useEffect, useRef } = React;

  var GroupsSection = ({ currentUser, currentUserData, currentUID, friendsData, lang, onNotification, isLoggedIn, onOpenProfile, onSendGift }) => {
    var [groups, setGroups] = useState([]);
    var [activeGroup, setActiveGroup] = useState(null);
    var [messages, setMessages] = useState([]);
    var [msgText, setMsgText] = useState('');
    var [showCreate, setShowCreate] = useState(false);
    var [showInvite, setShowInvite] = useState(false);
    var [groupName, setGroupName] = useState('');
    var [creating, setCreating] = useState(false);
    var [loadingGroups, setLoadingGroups] = useState(true);
    var [showEmojiPicker, setShowEmojiPicker] = useState(false);
    var [uploadingImg, setUploadingImg] = useState(false);
    var [showDetails, setShowDetails] = useState(false);
    var [membersData, setMembersData] = useState([]);
    var [loadingMembers, setLoadingMembers] = useState(false);
    var [settingsView, setSettingsView] = useState('main');
    var [groupNotice, setGroupNotice] = useState('');
    var [editingNotice, setEditingNotice] = useState(false);
    var [groupMuted, setGroupMuted] = useState(false);
    var [showReportGroup, setShowReportGroup] = useState(false);
    var [reportGroupReason, setReportGroupReason] = useState('');
    var [sendingGroupReport, setSendingGroupReport] = useState(false);
    var [groupInviteType, setGroupInviteType] = useState('open');
    var [groupIsPublic, setGroupIsPublic] = useState(true);
    var [transferToId, setTransferToId] = useState('');
    var [showTransferConfirm, setShowTransferConfirm] = useState(false);
    var [sendingRedPacket, setSendingRedPacket] = useState(false);
    var [showRedPacketModal, setShowRedPacketModal] = useState(false);
    var [groupMiniProfile, setGroupMiniProfile] = useState(null);

    var messagesEndRef = useRef(null);
    var chatInputRef = useRef(null);
    var fileInputRef = useRef(null);
    var groupImgInputRef = useRef(null);

    // 🛰️ Real-time Groups Subscription
    useEffect(() => {
      if (!currentUID || !isLoggedIn) {setLoadingGroups(false);return;}
      var unsub = groupsCollection.where('members', 'array-contains', currentUID).onSnapshot((snap) => {
        var gs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        gs.sort((a, b) => {
          var aT = a.lastMessageAtMs || a.lastMessageAt?.toMillis?.() || a.lastMessageAt?.seconds * 1000 || 0;
          var bT = b.lastMessageAtMs || b.lastMessageAt?.toMillis?.() || b.lastMessageAt?.seconds * 1000 || 0;
          return bT - aT;
        });
        setGroups(gs);
        setLoadingGroups(false);
      }, () => setLoadingGroups(false));
      return () => unsub();
    }, [currentUID, isLoggedIn]);

    // 🛰️ Real-time Messages Subscription
    useEffect(() => {
      if (!activeGroup) return;
      var unsub = groupsCollection.doc(activeGroup.id).collection('messages').
      orderBy('createdAt', 'asc').limitToLast(100).
      onSnapshot((snap) => {
        setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      });
      (async () => {
        try {
          await groupsCollection.doc(activeGroup.id).update({ [`readBy.${currentUID}`]: TS() });
        } catch (e) {
          console.error('[PRO SPY ERROR] update readBy status:', e);
        }
      })();
      return () => unsub();
    }, [activeGroup?.id, currentUID]);

    // 🛰️ Real-time Member Data Fetch
    useEffect(() => {
      if (!showDetails || !activeGroup) return;
      setLoadingMembers(true);
      var ids = activeGroup.members || [];
      if (!ids.length) {setMembersData([]);setLoadingMembers(false);return;}
      Promise.all(ids.map((id) => usersCollection.doc(id).get().then((d) => d.exists ? { id, ...d.data() } : { id, displayName: 'User' }))).
      then((ms) => {setMembersData(ms);setLoadingMembers(false);});
    }, [showDetails, activeGroup?.id]);

    // 📝 Group Logic
    var createGroup = async () => {
      if (!groupName.trim() || creating) return;
      var isVIP = currentUserData?.vip?.isActive;
      var maxGroups = isVIP ? 3 : 2;
      if (groups.filter((g) => g.createdBy === currentUID).length >= maxGroups) {
        onNotification(lang === 'ar' ? `❌ الحد الأقصى ${maxGroups} جروبات` : `❌ Max ${maxGroups} groups`);
        return;
      }
      setCreating(true);
      try {
        await groupsCollection.add({
          name: groupName.trim().slice(0, 7),
          createdBy: currentUID, members: [currentUID], admins: [currentUID],
          lastMessage: lang === 'ar' ? '🎉 تم الإنشاء' : '🎉 Created',
          lastMessageAt: TS(), lastMessageAtMs: Date.now(), createdAt: TS(),
          readBy: { [currentUID]: TS() }, xp: 0, level: 1
        });
        setGroupName('');setShowCreate(false);
        onNotification(lang === 'ar' ? '✅ تم الإنشاء!' : '✅ Created!');
      } catch (e) {onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error');}
      setCreating(false);
    };

    var sendMessage = async () => {
      if (!msgText.trim() || !activeGroup) return;
      var text = msgText.trim();setMsgText('');
      try {
        var vipLvl = typeof window.getVIPLevel === 'function' ? window.getVIPLevel(currentUserData) : 0;
        await groupsCollection.doc(activeGroup.id).collection('messages').add({
          text, senderId: currentUID, senderName: currentUserData?.displayName || 'User',
          senderPhoto: currentUserData?.photoURL || null, senderVipLevel: vipLvl,
          senderTitle: currentUserData?.activeTitle || null,
          senderFrame: currentUserData?.equipped?.frames || null,
          senderBadges: (currentUserData?.equipped?.badges || []).slice(0, 3),
          createdAt: TS(), type: 'text'
        });
        var newXP = (activeGroup.xp || 0) + 1;
        await groupsCollection.doc(activeGroup.id).update({
          lastMessage: text, lastSenderId: currentUID, lastMessageAt: TS(),
          lastMessageAtMs: Date.now(), xp: firebase.firestore.FieldValue.increment(1),
          level: window.getGroupLevel(newXP).level, [`readBy.${currentUID}`]: TS()
        });
      } catch (e) { console.error('[PRO SPY ERROR] sendMessage:', e); }
    };

    var handleImageSelect = async (e) => {
      var file = e.target.files?.[0];if (!file || !activeGroup) return;
      setUploadingImg(true);
      try {
        var base64 = await compressImageToBase64(file);
        await groupsCollection.doc(activeGroup.id).collection('messages').add({
          text: '📷', senderId: currentUID, type: 'image', imageData: base64, createdAt: TS()
        });
        await groupsCollection.doc(activeGroup.id).update({ lastMessage: '📷 Photo', lastMessageAt: TS(), lastMessageAtMs: Date.now() });
      } catch (e) { console.error('[PRO SPY ERROR] handleImageSelect:', e); }
      setUploadingImg(false);
    };

    var inviteFriend = async (friendId) => {
      if (!activeGroup || activeGroup.members?.includes(friendId)) return;
      try {
        await groupsCollection.doc(activeGroup.id).update({ members: firebase.firestore.FieldValue.arrayUnion(friendId) });
        onNotification(lang === 'ar' ? '✅ تمت الدعوة' : '✅ Invited');
        setShowInvite(false);
      } catch (e) { console.error('[PRO SPY ERROR] inviteFriend:', e); }
    };

    var handleTransferOwnership = async () => {
      var target = membersData.find((m) => m.id === transferToId || m.customId === transferToId);
      if (!target) return onNotification(lang === 'ar' ? ' العضو غير موجود' : 'Member not found');
      try {
        await groupsCollection.doc(activeGroup.id).update({ createdBy: target.id, admins: firebase.firestore.FieldValue.arrayUnion(target.id) });
        onNotification(lang === 'ar' ? '✅ تم النقل' : '✅ Transferred');
        setShowTransferConfirm(false);setTransferToId('');
      } catch (e) { console.error('[PRO SPY ERROR] handleTransferOwnership:', e); }
    };

    var saveGroupNotice = async () => {
      try {
        await groupsCollection.doc(activeGroup.id).update({ notice: groupNotice });
        setEditingNotice(false);onNotification(lang === 'ar' ? '✅ تم الحفظ' : '✅ Saved');
      } catch (e) { console.error('[PRO SPY ERROR] saveGroupNotice:', e); }
    };

    var claimRedPacket = async (rpId) => {
      if (!activeGroup || !currentUID) return;
      try {
        var rpDoc = await redPacketsCollection.doc(rpId).get();
        if (!rpDoc.exists) return;
        var rp = rpDoc.data();
        if (rp.claimedBy?.includes(currentUID)) {
          if (window.showToast) window.showToast(lang === 'ar' ? '❌ استلمته من قبل' : '❌ Already claimed');
          return;
        }
        if ((rp.claimedBy?.length || 0) >= rp.maxClaims) {
          if (window.showToast) window.showToast(lang === 'ar' ? '❌ نفد المغلف' : '❌ Exhausted');
          return;
        }

        var perClaim = Math.floor(rp.amount / (rp.maxClaims || 1));
        var claim = Math.min(perClaim + Math.floor(Math.random() * (perClaim * 0.5)), rp.remaining || rp.amount);
        var myName = currentUserData?.displayName || 'User';

        await redPacketsCollection.doc(rpId).update({
          claimedBy: firebase.firestore.FieldValue.arrayUnion(currentUID),
          claimerNames: firebase.firestore.FieldValue.arrayUnion(myName),
          remaining: firebase.firestore.FieldValue.increment(-claim),
          status: rp.claimedBy?.length + 1 >= (rp.maxClaims || 1) ? 'exhausted' : 'active'
        });
        
        // 🛡️ SECURITY: Group Red Packet Claim
        if (window.SecurityService) {
          await window.SecurityService.applyCurrencyTransaction(currentUID, claim, `Group Red Packet Claim: ${rpId}`, { groupId: activeGroup.id, rpId });
        } else {
          await usersCollection.doc(currentUID).update({ currency: firebase.firestore.FieldValue.increment(claim) });
        }

        // Add system message to group chat
        await groupsCollection.doc(activeGroup.id).collection('messages').add({
          type: 'system',
          text: lang === 'ar' ? `🎉 ${myName} استلم ${claim} 🧠 من مغلف ${rp.senderName || 'عضو'}` : `🎉 ${myName} claimed ${claim} 🧠 from ${rp.senderName || 'Member'}'s packet`,
          createdAt: TS(), senderId: 'system'
        });

        if (window.showToast) window.showToast(lang === 'ar' ? `🎉 استلمت ${claim} Intel!` : `🎉 Got ${claim} Intel!`);else
        onNotification(lang === 'ar' ? `🎉 استلمت ${claim}` : `🎉 Claimed ${claim}`);
      } catch (e) {
        console.error(e);
        if (window.showToast) window.showToast(lang === 'ar' ? '❌ خطأ' : '❌ Error');
      }
    };

    var openGroupMiniProfile = async (uid, basic) => {
      setGroupMiniProfile({ uid, name: basic?.name, photo: basic?.photo, loading: true });
      var data = await fetchMiniProfileData(uid, friendsData);
      setGroupMiniProfile(data || null);
    };

    // 🛠️ Helpers
    var hasUnread = (g) => {
      var r = g.readBy?.[currentUID];if (!r || !g.lastMessageAt) return false;
      return (g.lastMessageAt.toDate ? g.lastMessageAt.toDate() : new Date(g.lastMessageAt)) > (r.toDate ? r.toDate() : new Date(r));
    };
    var fmtTime = (ts) => ts ? (ts.toDate ? ts.toDate() : new Date(ts)).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : '';

    // ── RENDER ──
    if (activeGroup) {
      return (/*#__PURE__*/
        React.createElement(window.GroupChatModal, {
          activeGroup, currentUID, currentUserData, friendsData, lang, onNotification, onOpenProfile, onSendGift,
          onClose: () => setActiveGroup(null), messages, msgText, setMsgText, sendMessage, handleImageSelect,
          handleGroupPhotoUpload: async (e) => {
            var file = e.target.files?.[0];if (!file || !activeGroup) return;
            try {
              var base64 = await compressImageToBase64(file);
              await groupsCollection.doc(activeGroup.id).update({ photoURL: base64 });
              onNotification(lang === 'ar' ? '✅ تم التحديث' : '✅ Updated');
            } catch (e) { console.error('[PRO SPY ERROR] handleGroupPhotoUpload:', e); }
          }, uploadingImg, showDetails, setShowDetails,
          membersData, loadingMembers, setSettingsView, settingsView, groupNotice, setGroupNotice,
          editingNotice, setEditingNotice, groupMuted, setGroupMuted, showReportGroup, setShowReportGroup,
          reportGroupReason, setReportGroupReason, sendingGroupReport,
          handleSubmitGroupReport: async () => {
            if (!reportGroupReason.trim() || !activeGroup) return;
            setSendingGroupReport(true);
            try {
              // 🔍 DUPLICATE CHECK: Check the unified reports collection
              var snap = await db.collection('reports')
                .where('reporterUID', '==', currentUID)
                .where('type', '==', 'group')
                .where('resolved', '==', false)
                .get();
              
              var isDuplicate = snap.docs.some(doc => doc.data().groupId === activeGroup.id);

              if (isDuplicate) {
                onNotification(lang === 'ar' ? '🕵️ بلاغ مكرر: لقد قمت بالإبلاغ مسبقاً. الفريق يراجع طلبك.' : '🕵️ Duplicate: You have already reported this group. Team is reviewing.');
                setShowReportGroup(false);
                setReportGroupReason('');
                setSendingGroupReport(false);
                return;
              }

              // ✅ Submit new report to unified collection
              await db.collection('reports').add({
                type: 'group',
                groupId: activeGroup.id, 
                groupName: activeGroup.name || 'Group',
                reportedUID: activeGroup.ownerUID || null,
                reporterUID: currentUID,
                reporterName: currentUserData?.displayName || 'User',
                reason: reportGroupReason, 
                createdAt: TS(),
                status: 'pending',
                resolved: false
              });

              onNotification(lang === 'ar' ? '✅ لقد تم الابلاغ والمراجعه فريق' : '✅ Reported and being reviewed by staff');
              setShowReportGroup(false);
              setReportGroupReason('');
            } catch (e) { 
              console.error('[PRO SPY ERROR] handleSubmitGroupReport:', e); 
              onNotification('❌ Error: ' + e.message);
            }
            setSendingGroupReport(false);
          }, groupInviteType, setGroupInviteType,
          groupIsPublic, setGroupIsPublic, saveGroupManageSettings: async () => {
            try {
              await groupsCollection.doc(activeGroup.id).update({ isPublic: groupIsPublic, inviteType: groupInviteType });
              onNotification(lang === 'ar' ? '✅ تم الحفظ' : '✅ Saved');
            } catch (e) { console.error('[PRO SPY ERROR] saveGroupManageSettings:', e); }
          },
          saveGroupNotice, transferToId, setTransferToId, showTransferConfirm, setShowTransferConfirm,
          handleTransferOwnership, handleLeaveGroup: async () => {
            if (!activeGroup) return;
            try {
              await groupsCollection.doc(activeGroup.id).update({
                members: firebase.firestore.FieldValue.arrayRemove(currentUID),
                admins: firebase.firestore.FieldValue.arrayRemove(currentUID)
              });
              setActiveGroup(null);onNotification(lang === 'ar' ? '🚪 غادرت الجروب' : '🚪 Left group');
            } catch (e) { console.error('[PRO SPY ERROR] handleLeaveGroup:', e); }
          }, handleDeleteGroup: async () => {
            if (!activeGroup) return;
            if (!confirm(lang === 'ar' ? 'هل أنت متأكد من حذف الجروب؟' : 'Delete group?')) return;
            try {
              await groupsCollection.doc(activeGroup.id).delete();
              setActiveGroup(null);onNotification(lang === 'ar' ? '🗑️ تم الحذف' : '🗑️ Deleted');
            } catch (e) { console.error('[PRO SPY ERROR] handleDeleteGroup:', e); }
          }, showRedPacketModal, setShowRedPacketModal,
          sendingRedPacket, sendGroupRedPacket: async (rp) => {
            if (!activeGroup || (currentUserData?.currency || 0) < rp.amount) return;
            setSendingRedPacket(true);
            try {
              var rpRef = await redPacketsCollection.add({
                targetId: activeGroup.id, targetType: 'group',
                senderId: currentUID, senderName: currentUserData?.displayName || 'User',
                amount: rp.amount, maxClaims: 10, remaining: rp.amount,
                claimedBy: [], createdAt: TS(), status: 'active'
              });
              var vipLvl = typeof window.getVIPLevel === 'function' ? window.getVIPLevel(currentUserData) : 0;
              await groupsCollection.doc(activeGroup.id).collection('messages').add({
                type: 'red_packet', 
                senderId: currentUID, 
                senderName: currentUserData?.displayName || 'User',
                senderPhoto: currentUserData?.photoURL || null,
                senderVipLevel: vipLvl,
                senderFrame: currentUserData?.equipped?.frames || null,
                senderBadges: (currentUserData?.equipped?.badges || []).slice(0, 3),
                rpId: rpRef.id, 
                rpAmount: rp.amount,
                maxClaims: 10, 
                createdAt: TS()
              });
              // 🛡️ SECURITY: Group Red Packet Creation
              if (window.SecurityService) {
                await window.SecurityService.applyCurrencyTransaction(currentUID, -rp.amount, `Group Red Packet Creation: ${rpRef.id}`, { groupId: activeGroup.id, rpId: rpRef.id });
              } else {
                await usersCollection.doc(currentUID).update({ currency: firebase.firestore.FieldValue.increment(-rp.amount) });
              }
              onNotification(lang === 'ar' ? '🧧 تم الإرسال' : '🧧 Sent');
              setShowRedPacketModal(false);
            } catch (e) {console.error(e);}
            setSendingRedPacket(false);
          }, claimRedPacket,
          groupMiniProfile, setGroupMiniProfile, openGroupMiniProfile,
          handleBlock: async (id) => {
            try {
              await usersCollection.doc(currentUID).update({ blockedUsers: firebase.firestore.FieldValue.arrayUnion(id) });
              onNotification(lang === 'ar' ? '🚫 تم الحظر' : '🚫 Blocked');
            } catch (e) { console.error('[PRO SPY ERROR] handleBlock:', e); }
          }, handleUnblock: async (id) => {
            try {
              await usersCollection.doc(currentUID).update({ blockedUsers: firebase.firestore.FieldValue.arrayRemove(id) });
              onNotification(lang === 'ar' ? '✅ تم إلغاء الحظر' : '✅ Unblocked');
            } catch (e) { console.error('[PRO SPY ERROR] handleUnblock:', e); }
          },
          fmtTime, messagesEndRef, chatInputRef, fileInputRef, groupImgInputRef, showEmojiPicker, setShowEmojiPicker }
        ));

    }

    return (/*#__PURE__*/
      React.createElement(window.GroupsList, {
        groups, loadingGroups, currentUID, currentUserData, lang, onNotification,
        showCreate, setShowCreate, groupName, setGroupName, createGroup, creating,
        setActiveGroup, hasUnread, fmtTime }
      ));

  };

  window.GroupsSection = GroupsSection;
})();