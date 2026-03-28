(function() {
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
            if (!currentUID || !isLoggedIn) { setLoadingGroups(false); return; }
            var unsub = groupsCollection.where('members', 'array-contains', currentUID).onSnapshot(snap => {
                var gs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
            var unsub = groupsCollection.doc(activeGroup.id).collection('messages')
                .orderBy('createdAt', 'asc').limitToLast(100)
                .onSnapshot(snap => {
                    setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                });
            groupsCollection.doc(activeGroup.id).update({ [`readBy.${currentUID}`]: TS() }).catch(() => {});
            return () => unsub();
        }, [activeGroup?.id, currentUID]);

        // 🛰️ Real-time Member Data Fetch
        useEffect(() => {
            if (!showDetails || !activeGroup) return;
            setLoadingMembers(true);
            var ids = activeGroup.members || [];
            if (!ids.length) { setMembersData([]); setLoadingMembers(false); return; }
            Promise.all(ids.map(id => usersCollection.doc(id).get().then(d => d.exists ? { id, ...d.data() } : { id, displayName: 'User' })))
                .then(ms => { setMembersData(ms); setLoadingMembers(false); });
        }, [showDetails, activeGroup?.id]);

        // 📝 Group Logic
        var createGroup = async () => {
            if (!groupName.trim() || creating) return;
            var isVIP = currentUserData?.vip?.isActive;
            var maxGroups = isVIP ? 3 : 2;
            if (groups.filter(g => g.createdBy === currentUID).length >= maxGroups) {
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
                    readBy: { [currentUID]: TS() }, xp: 0, level: 1,
                });
                setGroupName(''); setShowCreate(false);
                onNotification(lang === 'ar' ? '✅ تم الإنشاء!' : '✅ Created!');
            } catch (e) { onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
            setCreating(false);
        };

        var sendMessage = async () => {
            if (!msgText.trim() || !activeGroup) return;
            var text = msgText.trim(); setMsgText('');
            try {
                var vipLvl = (typeof window.getVIPLevel === 'function' ? window.getVIPLevel(currentUserData) : 0);
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
            } catch (e) {}
        };

        var handleImageSelect = async (e) => {
            var file = e.target.files?.[0]; if (!file || !activeGroup) return;
            setUploadingImg(true);
            try {
                var base64 = await compressImageToBase64(file);
                await groupsCollection.doc(activeGroup.id).collection('messages').add({
                    text: '📷', senderId: currentUID, type: 'image', imageData: base64, createdAt: TS()
                });
                await groupsCollection.doc(activeGroup.id).update({ lastMessage: '📷 Photo', lastMessageAt: TS(), lastMessageAtMs: Date.now() });
            } catch (e) {}
            setUploadingImg(false);
        };

        var inviteFriend = async (friendId) => {
            if (!activeGroup || activeGroup.members?.includes(friendId)) return;
            try {
                await groupsCollection.doc(activeGroup.id).update({ members: firebase.firestore.FieldValue.arrayUnion(friendId) });
                onNotification(lang === 'ar' ? '✅ تمت الدعوة' : '✅ Invited');
                setShowInvite(false);
            } catch (e) {}
        };

        var handleTransferOwnership = async () => {
            var target = membersData.find(m => m.id === transferToId || m.customId === transferToId);
            if (!target) return onNotification(lang==='ar'?' العضو غير موجود':'Member not found');
            try {
                await groupsCollection.doc(activeGroup.id).update({ createdBy: target.id, admins: firebase.firestore.FieldValue.arrayUnion(target.id) });
                onNotification(lang==='ar'?'✅ تم النقل':'✅ Transferred');
                setShowTransferConfirm(false); setTransferToId('');
            } catch (e) {}
        };

        var saveGroupNotice = async () => {
            try {
                await groupsCollection.doc(activeGroup.id).update({ notice: groupNotice });
                setEditingNotice(false); onNotification(lang==='ar'?'✅ تم الحفظ':'✅ Saved');
            } catch(e) {}
        };

        var claimRedPacket = async (rpId) => {
            try {
                var rpDoc = await redPacketsCollection.doc(rpId).get();
                if (!rpDoc.exists || rpDoc.data().claimedBy?.includes(currentUID)) return;
                var rp = rpDoc.data();
                var perClaim = Math.floor(rp.amount / rp.maxClaims);
                var claim = Math.min(perClaim + Math.floor(Math.random()*(perClaim*0.5)), rp.remaining);
                await redPacketsCollection.doc(rpId).update({
                    claimedBy: firebase.firestore.FieldValue.arrayUnion(currentUID),
                    remaining: firebase.firestore.FieldValue.increment(-claim),
                    status: (rp.claimedBy?.length + 1 >= rp.maxClaims) ? 'exhausted' : 'active'
                });
                await usersCollection.doc(currentUID).update({ currency: firebase.firestore.FieldValue.increment(claim) });
                onNotification(lang==='ar'?`🎉 استلمت ${claim}`:`🎉 Claimed ${claim}`);
            } catch(e) {}
        };

        var openGroupMiniProfile = async (uid, basic) => {
            setGroupMiniProfile({ uid, name: basic?.name, photo: basic?.photo, loading: true });
            var data = await fetchMiniProfileData(uid, friendsData);
            setGroupMiniProfile(data || null);
        };

        // 🛠️ Helpers
        var hasUnread = (g) => {
            var r = g.readBy?.[currentUID]; if (!r || !g.lastMessageAt) return false;
            return (g.lastMessageAt.toDate ? g.lastMessageAt.toDate() : new Date(g.lastMessageAt)) > (r.toDate ? r.toDate() : new Date(r));
        };
        var fmtTime = (ts) => ts ? (ts.toDate ? ts.toDate() : new Date(ts)).toLocaleTimeString(lang==='ar'?'ar-EG':'en-US',{hour:'2-digit',minute:'2-digit'}) : '';

        // ── RENDER ──
        if (activeGroup) {
            return (
                <window.GroupChatModal 
                    {...{activeGroup, currentUID, currentUserData, friendsData, lang, onNotification, onOpenProfile, onSendGift,
                        onClose:()=>setActiveGroup(null), messages, msgText, setMsgText, sendMessage, handleImageSelect, 
                        handleGroupPhotoUpload: async(e)=>{
                            var file = e.target.files?.[0]; if(!file||!activeGroup) return;
                            try {
                                var base64 = await compressImageToBase64(file);
                                await groupsCollection.doc(activeGroup.id).update({ photoURL: base64 });
                                onNotification(lang==='ar'?'✅ تم التحديث':'✅ Updated');
                            } catch(e) {}
                        }, uploadingImg, showDetails, setShowDetails, 
                        membersData, loadingMembers, setSettingsView, settingsView, groupNotice, setGroupNotice, 
                        editingNotice, setEditingNotice, groupMuted, setGroupMuted, showReportGroup, setShowReportGroup, 
                        reportGroupReason, setReportGroupReason, sendingGroupReport, 
                        handleSubmitGroupReport: async()=>{
                            if(!reportGroupReason.trim()||!activeGroup) return;
                            setSendingGroupReport(true);
                            try {
                                await db.collection('group_reports').add({
                                    groupId: activeGroup.id, reporterId: currentUID,
                                    reason: reportGroupReason, createdAt: TS()
                                });
                                onNotification(lang==='ar'?'✅ تم التبليغ':'✅ Reported');
                                setShowReportGroup(false); setReportGroupReason('');
                            } catch(e) {}
                            setSendingGroupReport(false);
                        }, groupInviteType, setGroupInviteType, 
                        groupIsPublic, setGroupIsPublic, saveGroupManageSettings: async()=>{
                            try {
                                await groupsCollection.doc(activeGroup.id).update({ isPublic: groupIsPublic, inviteType: groupInviteType });
                                onNotification(lang==='ar'?'✅ تم الحفظ':'✅ Saved');
                            } catch(e) {}
                        }, 
                        saveGroupNotice, transferToId, setTransferToId, showTransferConfirm, setShowTransferConfirm, 
                        handleTransferOwnership, handleLeaveGroup: async()=>{
                            if(!activeGroup) return;
                            try {
                                await groupsCollection.doc(activeGroup.id).update({ 
                                    members: firebase.firestore.FieldValue.arrayRemove(currentUID),
                                    admins: firebase.firestore.FieldValue.arrayRemove(currentUID)
                                });
                                setActiveGroup(null); onNotification(lang==='ar'?'🚪 غادرت الجروب':'🚪 Left group');
                            } catch(e) {}
                        }, 
                        handleDeleteGroup: async()=>{
                            if(!activeGroup) return;
                            if(!confirm(lang==='ar'?'هل أنت متأكد من حذف الجروب؟':'Delete group?')) return;
                            try {
                                await groupsCollection.doc(activeGroup.id).delete();
                                setActiveGroup(null); onNotification(lang==='ar'?'🗑️ تم الحذف':'🗑️ Deleted');
                            } catch(e) {}
                        }, showRedPacketModal, setShowRedPacketModal, 
                        sendingRedPacket, sendGroupRedPacket: async(rp)=>{
                            if(!activeGroup||(currentUserData?.currency||0)<rp.amount) return;
                            setSendingRedPacket(true);
                            try {
                                var rpRef = await db.collection('red_packets').add({
                                    groupId: activeGroup.id, senderId: currentUID, 
                                    amount: rp.amount, maxClaims: 10, remaining: rp.amount,
                                    claimedBy: [], createdAt: TS(), status: 'active'
                                });
                                await groupsCollection.doc(activeGroup.id).collection('messages').add({
                                    type: 'red_packet', senderId: currentUID, rpId: rpRef.id, rpAmount: rp.amount,
                                    maxClaims: 10, createdAt: TS(), senderName: currentUserData?.displayName
                                });
                                await usersCollection.doc(currentUID).update({ currency: firebase.firestore.FieldValue.increment(-rp.amount) });
                                onNotification(lang==='ar'?'🧧 تم الإرسال':'🧧 Sent');
                                setShowRedPacketModal(false);
                            } catch(e) {}
                            setSendingRedPacket(false);
                        }, claimRedPacket, 
                        groupMiniProfile, setGroupMiniProfile, openGroupMiniProfile, 
                        handleBlock: async(id)=>{
                            try {
                                await usersCollection.doc(currentUID).update({ blockedUsers: firebase.firestore.FieldValue.arrayUnion(id) });
                                onNotification(lang==='ar'?'🚫 تم الحظر':'🚫 Blocked');
                            } catch(e) {}
                        }, handleUnblock: async(id)=>{
                            try {
                                await usersCollection.doc(currentUID).update({ blockedUsers: firebase.firestore.FieldValue.arrayRemove(id) });
                                onNotification(lang==='ar'?'✅ تم إلغاء الحظر':'✅ Unblocked');
                            } catch(e) {}
                        }, 
                        fmtTime, messagesEndRef, chatInputRef, fileInputRef, groupImgInputRef, showEmojiPicker, setShowEmojiPicker}}
                />
            );
        }

        return (
            <window.GroupsList 
                {...{groups, loadingGroups, currentUID, currentUserData, lang, onNotification, 
                    showCreate, setShowCreate, groupName, setGroupName, createGroup, creating,
                    setActiveGroup, hasUnread, fmtTime}}
            />
        );
    };

    window.GroupsSection = GroupsSection;
})();
