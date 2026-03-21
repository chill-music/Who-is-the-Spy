// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ðŸ’¬ PRIVATE CHAT MODAL â€” V3
//    âœ… ALL users â†’ Firestore (for real-time delivery)
//    âœ… VIP10 â†’ Typing indicator + â˜ï¸ badge (permanent storage)
//    âœ… Non-VIP10 â†’ messages still go to Firestore (deliverable)
//                   localStorage used as local cache only
//    âœ… Image upload (base64, max 400px)
//    âœ… Send arrow only lights up when there's text
//    âœ… Modern UI: avatars, names, timestamps, status
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€ Compress image to base64 â”€â”€
var ompressImageToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const MAX = 400;
            let w = img.width, h = img.height;
            if (w > MAX || h > MAX) {
                if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                else { w = Math.round(w * MAX / h); h = MAX; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.65));
        };
        img.onerror = reject;
        img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

// â”€â”€ LocalStorage helpers (cache only) â”€â”€
var chatCacheKey = (chatId) => `pro_spy_chat_cache_${chatId}`;
var saveChatCache = (chatId, msgs) => {
    try { localStorage.setItem(_chatCacheKey(chatId), JSON.stringify(msgs.slice(-80))); } catch {}
};
var loadChatCache = (chatId) => {
    try { const r = localStorage.getItem(_chatCacheKey(chatId)); return r ? JSON.parse(r) : []; }
    catch { return []; }
};

// â”€â”€ Format timestamp â”€â”€
var fmtChatTs = (ts) => {
    if (!ts) return '';
    let d;
    if (ts?.toDate) d = ts.toDate();
    else if (ts?.seconds) d = new Date(ts.seconds * 1000);
    else if (typeof ts === 'number') d = new Date(ts);
    else d = new Date(ts);
    if (!d || isNaN(d.getTime())) return '';
    const now = new Date();
    const diff = now - d;
    if (diff < 60000)   return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (d.toDateString() === now.toDateString())
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

var rivateChatModal = ({
    show, onClose, friend, currentUser, user, lang,
    onSendNotification, onSendGift, currency,
    friendsData, onOpenProfile
}) => {
    const t = TRANSLATIONS[lang];
    const [messages, setMessages]           = useState([]);
    const [newMsg, setNewMsg]               = useState('');
    const [sending, setSending]             = useState(false);
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isBlocked, setIsBlocked]         = useState(false);
    const [blockedByTarget, setBlockedByTarget] = useState(false);
    const [friendTyping, setFriendTyping]   = useState(false);
    const [uploadingImg, setUploadingImg]   = useState(false);
    // â”€â”€ 3-dot menu â”€â”€
    const [showHeaderMenu, setShowHeaderMenu] = useState(false);
    // â”€â”€ Delete chat confirm â”€â”€
    const [showDeleteChatConfirm, setShowDeleteChatConfirm] = useState(false);
    const [deletingChat, setDeletingChat]   = useState(false);
    // â”€â”€ Report modal â”€â”€
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportStep, setReportStep]       = useState('reason');
    const [reportReason, setReportReason]   = useState('');
    const [reportDMMsg, setReportDMMsg]     = useState(null);
    const [submittingReport, setSubmittingReport] = useState(false);
    // â”€â”€ Message edit/delete â”€â”€
    const [editingMsgId, setEditingMsgId]   = useState(null);
    const [editMsgText, setEditMsgText]     = useState('');
    const [msgMenuId, setMsgMenuId]         = useState(null); // Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù‚Ù„Ù… Ù„Ù„Ø±Ø³Ø§Ù„Ø©
    // â”€â”€ @ Mention â”€â”€
    const [showMentionSuggestion, setShowMentionSuggestion] = useState(false);
    // â”€â”€ Mini Profile â”€â”€
    const [miniProfile, setMiniProfile]     = useState(null);
    const [loadingMiniProfile, setLoadingMiniProfile] = useState(false);
    const [showMiniMenu, setShowMiniMenu]   = useState(false);
    // â”€â”€ Pen menu position (fixed) â”€â”€
    const [msgMenuPos, setMsgMenuPos]       = useState({ top: 0, right: 0 });
    // â”€â”€ 3-dot header button rect â”€â”€
    const [menuBtnRect, setMenuBtnRect]     = useState(null);
    // â”€â”€ ðŸ§§ DM Red Packet â”€â”€
    const [showDMRedPacket, setShowDMRedPacket] = useState(false);
    const [sendingDMRedPacket, setSendingDMRedPacket] = useState(false);

    const messagesEndRef    = useRef(null);
    const inputRef          = useRef(null);
    const fileInputRef      = useRef(null);
    const typingTimerRef    = useRef(null);
    const headerMenuBtnRef  = useRef(null);

    // VIP level helpers
    const myVipLevel     = useMemo(() => { try { return getVIPLevel ? (getVIPLevel(currentUser) || 0) : 0; } catch { return 0; } }, [currentUser]);
    const friendVipLevel = useMemo(() => { try { return getVIPLevel ? (getVIPLevel(friend) || 0) : 0; } catch { return 0; } }, [friend]);
    const isMyVIP10      = myVipLevel >= 10;
    const isFriendVIP10  = friendVipLevel >= 10;
    // Typing indicator available when EITHER party is VIP10
    const typingEnabled  = isMyVIP10 || isFriendVIP10;

    const chatId = friend && user ? [user.uid, friend.uid].sort().join('_') : null;

    // â”€â”€ Blocked check â”€â”€
    useEffect(() => {
        if (!show || !friend || !currentUser) return;
        setIsBlocked((currentUser.blockedUsers || []).includes(friend.uid));
        usersCollection.doc(friend.uid).get().then(doc => {
            if (doc.exists) setBlockedByTarget((doc.data().blockedUsers || []).includes(user.uid));
        }).catch(() => {});
    }, [show, friend?.uid, currentUser?.uid, user?.uid]);

    // â”€â”€ Messages: ALWAYS from Firestore (real-time for both parties) â”€â”€
    useEffect(() => {
        if (!show || !chatId) return;

        // Show cache immediately while Firestore loads
        const cached = _loadChatCache(chatId);
        if (cached.length > 0) setMessages(cached);

        const unsub = chatsCollection.doc(chatId).collection('messages')
            .limit(100)
            .onSnapshot(snap => {
                let msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                msgs.sort((a, b) => {
                    const tA = a.timestamp?.toMillis?.() || (a.timestamp?.seconds || 0) * 1000 || (typeof a.timestamp === 'number' ? a.timestamp : 0);
                    const tB = b.timestamp?.toMillis?.() || (b.timestamp?.seconds || 0) * 1000 || (typeof b.timestamp === 'number' ? b.timestamp : 0);
                    return tA - tB;
                });
                setMessages(msgs);
                _saveChatCache(chatId, msgs);
                // Mark as read
                chatsCollection.doc(chatId).update({ [`unread.${user.uid}`]: 0 }).catch(() => {});
            }, () => {
                // If Firestore fails, show cache
                setMessages(_loadChatCache(chatId));
            });

        return unsub;
    }, [show, chatId, user?.uid]);

    // â”€â”€ Typing listener (when typingEnabled) â”€â”€
    useEffect(() => {
        if (!show || !chatId || !typingEnabled || !friend) return;
        const unsub = chatsCollection.doc(chatId).onSnapshot(snap => {
            if (snap.exists) {
                setFriendTyping(!!(snap.data()?.typing?.[friend.uid]));
            }
        }, () => {});
        return unsub;
    }, [show, chatId, friend?.uid, typingEnabled]);

    // â”€â”€ Auto-scroll to bottom â”€â”€
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, friendTyping]);

    // â”€â”€ Typing indicator write (when typingEnabled) â”€â”€
    const _setTyping = (val) => {
        if (!typingEnabled || !chatId || !user) return;
        chatsCollection.doc(chatId).set({ typing: { [user.uid]: val } }, { merge: true }).catch(() => {});
    };
    const handleTypingChange = () => {
        _setTyping(true);
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => _setTyping(false), 2500);
    };
    const clearTypingStatus = () => {
        clearTimeout(typingTimerRef.current);
        _setTyping(false);
    };

    // â”€â”€ Send text message â”€â”€
    const handleSend = async () => {
        if (!newMsg.trim() || sending || isBlocked || blockedByTarget) return;
        clearTypingStatus();
        setSending(true);
        const text = newMsg.trim();
        setNewMsg('');
        try {
            const msgData = {
                senderId:      user.uid,
                senderName:    currentUser?.displayName || 'User',
                senderPhoto:   currentUser?.photoURL || null,
                senderVipLevel: myVipLevel,
                type:          'text',
                text,
                timestamp:     TS(),
            };
            // âœ… Always save to Firestore so the other person sees it
            await chatsCollection.doc(chatId).collection('messages').add(msgData);
            await chatsCollection.doc(chatId).set({
                members:  [user.uid, friend.uid],
                lastMessage: text,
                timestamp: TS(),
                [`unread.${friend.uid}`]: firebase.firestore.FieldValue.increment(1),
            }, { merge: true });
            if (onSendNotification) {
                onSendNotification(
                    friend.uid, 'message',
                    `${currentUser?.displayName || 'User'}: ${text.substring(0, 50)}`,
                    user.uid, currentUser?.displayName || 'User'
                ).catch(() => {});
            }
            playSound('click');
        } catch (e) {
            console.error('Chat send error:', e);
        }
        setSending(false);
    };

    // â”€â”€ Send image â”€â”€
    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file || isBlocked || blockedByTarget || !file.type.startsWith('image/')) return;
        setUploadingImg(true);
        try {
            const base64 = await compressImageToBase64(file);
            const msgData = {
                senderId:      user.uid,
                senderName:    currentUser?.displayName || 'User',
                senderPhoto:   currentUser?.photoURL || null,
                senderVipLevel: myVipLevel,
                type:          'image',
                imageData:     base64,
                text:          'ðŸ“·',
                timestamp:     TS(),
            };
            await chatsCollection.doc(chatId).collection('messages').add(msgData);
            await chatsCollection.doc(chatId).set({
                members:  [user.uid, friend.uid],
                lastMessage: 'ðŸ“· Photo',
                timestamp: TS(),
                [`unread.${friend.uid}`]: firebase.firestore.FieldValue.increment(1),
            }, { merge: true });
            playSound('click');
        } catch (err) { console.error('Image send error:', err); }
        setUploadingImg(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleEmojiSelect = (emoji) => {
        setNewMsg(p => p + emoji);
        setShowEmojiPicker(false);
        inputRef.current?.focus();
    };

    const handleSendGiftToChat = async (gift, targetUser, qty = 1) => {
        if (!onSendGift || isBlocked || blockedByTarget) return;
        await onSendGift(gift, targetUser, qty);
        setShowGiftModal(false);
    };

    // â”€â”€ Ø­Ø°Ù Ø§Ù„Ø´Ø§Øª â”€â”€
    const handleDeleteChat = async () => {
        if (!chatId || deletingChat) return;
        setDeletingChat(true);
        try {
            // Ø­Ø°Ù ÙƒÙ„ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„
            const msgsSnap = await chatsCollection.doc(chatId).collection('messages').limit(500).get();
            const batch = db.batch();
            msgsSnap.docs.forEach(d => batch.delete(d.ref));
            await batch.commit().catch(() => {});
            // Ø­Ø°Ù Ø§Ù„Ù€ chat doc
            await chatsCollection.doc(chatId).delete().catch(() => {});
            setShowDeleteChatConfirm(false);
            onClose();
        } catch (e) { console.error('Delete chat error:', e); }
        setDeletingChat(false);
    };

    // â”€â”€ Ø­Ø¸Ø± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… â”€â”€
    const handleBlock = async () => {
        if (!user || !friend) return;
        try {
            await usersCollection.doc(user.uid).update({
                blockedUsers: firebase.firestore.FieldValue.arrayUnion(friend.uid)
            });
            setIsBlocked(true);
            setShowHeaderMenu(false);
        } catch (e) { console.error('Block error:', e); }
    };

    // â”€â”€ Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø­Ø¸Ø± â”€â”€
    const handleUnblock = async () => {
        if (!user || !friend) return;
        try {
            await usersCollection.doc(user.uid).update({
                blockedUsers: firebase.firestore.FieldValue.arrayRemove(friend.uid)
            });
            setIsBlocked(false);
            setShowHeaderMenu(false);
        } catch (e) { console.error('Unblock error:', e); }
    };

    // â”€â”€ ÙØªØ­ Ù…ÙŠÙ†ÙŠ Ø¨Ø±ÙˆÙØ§ÙŠÙ„ Ù„Ø£ÙŠ Ø´Ø®Øµ â”€â”€
    const openMiniProfile = async (uid) => {
        if (!uid) return;
        setLoadingMiniProfile(true);
        setShowMiniMenu(false);
        setMiniProfile({ uid, name: '...', photo: null, loading: true });
        const data = await fetchMiniProfileData(uid, currentUser?.friends || []);
        if (data) setMiniProfile(data);
        setLoadingMiniProfile(false);
    };

    // â”€â”€ ØªØ¹Ø¯ÙŠÙ„ Ø±Ø³Ø§Ù„Ø© â”€â”€
    const handleEditMessage = async (msgId, newText) => {
        if (!newText.trim() || !chatId) return;
        try {
            await chatsCollection.doc(chatId).collection('messages').doc(msgId).update({
                text: newText.trim(),
                editedAt: TS(),
                isEdited: true,
            });
            setEditingMsgId(null);
            setEditMsgText('');
        } catch (e) { console.error('Edit message error:', e); }
    };

    // â”€â”€ Ø­Ø°Ù Ø±Ø³Ø§Ù„Ø© â”€â”€
    const handleDeleteMessage = async (msgId) => {
        if (!chatId) return;
        try {
            // Ø§Ø³ØªØ¨Ø¯Ø§Ù„ Ø§Ù„Ø±Ø³Ø§Ù„Ø© Ø¨Ù€ "ØªÙ… Ø­Ø°Ù Ù‡Ø°Ù‡ Ø§Ù„Ø±Ø³Ø§Ù„Ø©"
            await chatsCollection.doc(chatId).collection('messages').doc(msgId).update({
                text: lang === 'ar' ? 'ðŸ—‘ï¸ ØªÙ… Ø­Ø°Ù Ù‡Ø°Ù‡ Ø§Ù„Ø±Ø³Ø§Ù„Ø©' : 'ðŸ—‘ï¸ This message was deleted',
                isDeleted: true,
                deletedAt: TS(),
                imageData: firebase.firestore.FieldValue.delete(),
                type: 'deleted',
            });
        } catch (e) { console.error('Delete message error:', e); }
    };

    // â”€â”€ Ø¥Ø±Ø³Ø§Ù„ Ø¨Ù„Ø§Øº Ù…Ø¹ DM ÙƒØ¯Ù„ÙŠÙ„ â”€â”€
    const handleSubmitReport = async () => {
        if (!reportReason.trim() || !user || !friend) return;
        setSubmittingReport(true);
        try {
            await reportsCollection.add({
                reporterUID:   user.uid,
                reporterName:  currentUser?.displayName || 'User',
                reportedUID:   friend.uid,
                reportedName:  friend.displayName || 'User',
                reason:        reportReason.trim(),
                evidence: reportDMMsg ? {
                    msgId:   reportDMMsg.id,
                    text:    reportDMMsg.text,
                    sender:  reportDMMsg.senderName,
                    time:    reportDMMsg.timestamp,
                } : null,
                type:          'user',
                resolved:      false,
                createdAt:     TS(),
            });
            // Ø¥Ø´Ø¹Ø§Ø± Ù„Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¨Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø¨Ù„Ø§Øº
            await botChatsCollection.add({
                botId: 'detective_bot',
                toUserId: user.uid,
                type: 'report_submitted',
                message: lang === 'ar'
                    ? `ðŸ•µï¸ ØªÙ… Ø§Ø³ØªÙ„Ø§Ù… Ø¨Ù„Ø§ØºÙƒ Ø¶Ø¯ "${friend.displayName || 'Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…'}".\nØ³ÙŠÙ‚ÙˆÙ… ÙØ±ÙŠÙ‚ Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© Ø¨Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ø¨Ù„Ø§Øº ÙˆØ§Ù„ØªØ­Ù‚ÙŠÙ‚ ÙÙŠÙ‡.\n\nØ´ÙƒØ±Ø§Ù‹ Ù„Ù…Ø³Ø§Ø¹Ø¯ØªÙ†Ø§ ÙÙŠ Ø§Ù„Ø­ÙØ§Ø¸ Ø¹Ù„Ù‰ Ø³Ù„Ø§Ù…Ø© Ø§Ù„Ù…Ø¬ØªÙ…Ø¹.`
                    : `ðŸ•µï¸ Your report against "${friend.displayName || 'user'}" has been received.\nOur moderation team will review and investigate.\n\nThank you for helping keep the community safe.`,
                read: false,
                timestamp: TS(),
            }).catch(() => {});
            setReportStep('done');
        } catch (e) { console.error('Report error:', e); }
        setSubmittingReport(false);
    };

    if (!show || !friend) return null;

    // â”€â”€ Online status â”€â”€
    const friendInfo   = friendsData?.find(f => f.id === friend.uid) || friend;
    const isOnline     = friendInfo?.isOnline || friendInfo?.onlineStatus === 'online';
    const isAway       = friendInfo?.onlineStatus === 'away';
    const statusColor  = isOnline ? '#22c55e' : isAway ? '#f59e0b' : '#6b7280';
    const statusLabel  = isOnline
        ? (lang === 'ar' ? 'Ù…ØªØµÙ„ Ø§Ù„Ø¢Ù†' : 'Online')
        : isAway ? (lang === 'ar' ? 'Ø¨Ø¹ÙŠØ¯' : 'Away')
        : (lang === 'ar' ? 'ØºÙŠØ± Ù…ØªØµÙ„' : 'Offline');

    const canSend = !sending && newMsg.trim().length > 0 && !isBlocked && !blockedByTarget;

    return (
        <>
        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept="image/*"
            style={{ display: 'none' }} onChange={handleImageSelect} />

        <div className="modal-overlay" onClick={onClose} style={{padding:"4px"}}>
          <div onClick={e => e.stopPropagation()} style={{
            display: 'flex', flexDirection: 'column',
            width: '100%', maxWidth: 'min(420px, calc(100vw - 8px))',
            height: 'min(92vh, 680px)',
            minHeight: '400px',
            background: 'linear-gradient(160deg,rgba(5,5,18,0.99),rgba(9,8,26,0.99))',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 28px 70px rgba(0,0,0,0.88), 0 0 30px rgba(0,242,255,0.06)',
            margin: 'auto', boxSizing: 'border-box',
          }}>

            {/* â•â• HEADER â•â• */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '11px 14px',
              background: 'linear-gradient(135deg,rgba(7,7,22,1),rgba(15,9,32,1))',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              flexShrink: 0,
            }}>
              {/* Avatar + status dot */}
              <div
                style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}
                onClick={() => onOpenProfile && onOpenProfile(friend.uid)}
              >
                <img
                  src={friend.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.displayName||'U')}&background=6366f1&color=fff&size=80`}
                  alt=""
                  style={{
                    width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover',
                    border: `2px solid ${statusColor}44`,
                    boxShadow: isOnline ? `0 0 8px ${statusColor}33` : 'none',
                  }}
                />
                <div style={{
                  position: 'absolute', bottom: '1px', right: '1px',
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: statusColor, border: '1.5px solid rgba(5,5,18,1)',
                }} />
              </div>

              {/* Name + status */}
              <div
                style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                onClick={() => onOpenProfile && onOpenProfile(friend.uid)}
              >
                <div style={{
                  fontSize: '13px', fontWeight: 800, color: 'white',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}>
                  {friend.displayName || 'User'}
                  {friend.vip?.isActive && getVIPLevel && getVIPLevel(friend) > 0 && VIP_CONFIG && (
                    <span style={{
                      fontSize: '8px', fontWeight: 900,
                      background: getVIPConfig(getVIPLevel(friend))?.nameColor || '#7c3aed',
                      color: '#000', padding: '1px 4px', borderRadius: '3px', flexShrink: 0,
                    }}>VIP{getVIPLevel(friend)}</span>
                  )}
                </div>
                <div style={{ fontSize: '10px', color: friendTyping ? '#00f2ff' : statusColor, fontWeight: 600 }}>
                  {friendTyping
                    ? <span style={{ fontStyle: 'italic' }}>{lang === 'ar' ? 'âœï¸ ÙŠÙƒØªØ¨...' : 'âœï¸ typing...'}</span>
                    : <span><span style={{ fontSize: '7px' }}>â— </span>{statusLabel}</span>
                  }
                </div>
              </div>

              {/* Right actions */}
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexShrink: 0 }}>
                {/* VIP10 badge */}
                {isMyVIP10 && (
                  <div style={{
                    fontSize: '8px', color: '#a78bfa',
                    background: 'rgba(167,139,250,0.1)',
                    padding: '2px 5px', borderRadius: '4px',
                    border: '1px solid rgba(167,139,250,0.22)',
                  }}>â˜ï¸ {lang === 'ar' ? 'Ù…Ø­ÙÙˆØ¸' : 'Saved'}</div>
                )}
                {/* Gift button */}
                <button
                  onClick={() => setShowGiftModal(true)}
                  disabled={isBlocked || blockedByTarget}
                  style={{
                    background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.18)',
                    borderRadius: '8px', padding: '5px 7px', fontSize: '14px',
                    cursor: (isBlocked || blockedByTarget) ? 'not-allowed' : 'pointer',
                    opacity: (isBlocked || blockedByTarget) ? 0.4 : 1,
                  }}
                >ðŸŽ</button>

                {/* â”€â”€ 3-dot menu button â”€â”€ */}
                <button
                  ref={headerMenuBtnRef}
                  onClick={e => { e.stopPropagation(); setShowHeaderMenu(v => !v); }}
                  style={{
                    background: showHeaderMenu ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '8px', width: '30px', height: '30px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#9ca3af', fontSize: '18px', fontWeight: 900,
                    letterSpacing: '-1px', lineHeight: 1,
                  }}
                >â‹®</button>

                <button
                  onClick={() => { setShowHeaderMenu(false); onClose(); }}
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '8px', width: '30px', height: '30px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#9ca3af', fontSize: '14px',
                  }}
                >âœ•</button>
              </div>
            </div>

            {/* â•â• BLOCKED NOTICE â•â• */}
            {(isBlocked || blockedByTarget) && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
                borderRadius: '8px', margin: '8px 12px 0',
                padding: '7px 12px', fontSize: '11px', color: '#f87171',
                display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
              }}>
                ðŸš« {isBlocked
                  ? (lang === 'ar' ? 'Ø­Ø¸Ø±Øª Ù‡Ø°Ø§ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…. Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø­Ø¸Ø± Ù„Ù„Ù…Ø±Ø§Ø³Ù„Ø©.' : 'You blocked this user. Unblock to message.')
                  : (lang === 'ar' ? 'Ù‡Ø°Ø§ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø­Ø¸Ø±Ùƒ. Ù„Ø§ ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ø¥Ø±Ø³Ø§Ù„.' : 'This user has blocked you.')}
              </div>
            )}

            {/* â•â• MESSAGES AREA â•â• */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '12px 10px',
              display: 'flex', flexDirection: 'column', gap: '5px',
              background: 'linear-gradient(180deg,rgba(5,5,16,0.98),rgba(8,8,22,0.98))',
            }}>
              {messages.length === 0 ? (
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '8px', opacity: 0.35, paddingTop: '50px',
                }}>
                  <span style={{ fontSize: '40px' }}>ðŸ’¬</span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {lang === 'ar' ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø±Ø³Ø§Ø¦Ù„ Ø¨Ø¹Ø¯' : 'No messages yet'}
                  </span>
                </div>
              ) : messages.map((msg, idx) => {
                const isMine      = msg.senderId === user?.uid;
                const isGift      = msg.type === 'gift';
                const isImage     = msg.type === 'image';
                const isRedPacket = msg.type === 'red_packet';
                const prevSender  = idx > 0 ? messages[idx - 1]?.senderId : null;
                const nextSender  = idx < messages.length - 1 ? messages[idx + 1]?.senderId : null;
                // show avatar for BOTH mine and others â€” on first message of each group
                const showAvatar  = prevSender !== msg.senderId;
                const showName    = prevSender !== msg.senderId;
                const isLastGroup = nextSender !== msg.senderId;
                // Get VIP config for this message sender
                const msgVipLevel = msg.senderVipLevel || 0;
                const msgVipCfg = getVIPConfig(msgVipLevel);

                // ðŸ§§ Red Packet bubble
                if(isRedPacket) {
                  const isClaimed = msg.claimedBy?.includes(user?.uid) || msg.rpStatus === 'exhausted';
                  return (
                  <div key={msg.id||idx} style={{display:'flex',flexDirection:isMine?'row-reverse':'row',alignItems:'flex-end',gap:'6px',marginBottom:isLastGroup?'4px':'1px'}}>
                    {/* Avatar for both sides */}
                    <div style={{width:'28px',flexShrink:0,alignSelf:'flex-end'}}>
                      {showAvatar ? (
                        <img
                          src={isMine
                            ? (currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.displayName||'U')}&background=6366f1&color=fff&size=56`)
                            : (msg.senderPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName||'U')}&background=6366f1&color=fff&size=56`)}
                          alt=""
                          onClick={() => openMiniProfile(msg.senderId)}
                          style={{width:'28px',height:'28px',borderRadius:'50%',objectFit:'cover',cursor:'pointer',border:msgVipCfg?`1.5px solid ${msgVipCfg.nameColor}`:'1.5px solid rgba(0,242,255,0.15)'}}
                        />
                      ) : <div style={{width:'28px'}}/>}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:isMine?'flex-end':'flex-start',maxWidth:'72%',gap:'2px'}}>
                      {showName && (
                        <div onClick={()=>openMiniProfile(msg.senderId)} style={{fontSize:'10px',fontWeight:700,color:isMine?'#00f2ff':'#a78bfa',paddingLeft:'4px',cursor:'pointer',display:'flex',alignItems:'center',gap:'3px'}}>
                          {msgVipCfg&&<span style={{fontSize:'7px',fontWeight:900,background:msgVipCfg.nameColor,color:'#000',padding:'0 3px',borderRadius:'2px'}}>VIP{msgVipLevel}</span>}
                          {isMine ? (currentUser?.displayName||msg.senderName||'You') : msg.senderName}
                          {isMine&&<span style={{fontSize:'8px',color:'#4b5563'}}> ({lang==='ar'?'Ø£Ù†Øª':'you'})</span>}
                        </div>
                      )}
                      <button onClick={async()=>{
                        if(isClaimed) return;
                        if(!msg.rpId||!user) return;
                        try {
                          const rpDoc = await redPacketsCollection.doc(msg.rpId).get();
                          if(!rpDoc.exists){return;}
                          const rp=rpDoc.data();
                          // âŒ Ø§Ù„Ù…Ø±Ø³Ù„ Ù„Ø§ ÙŠØ³ØªØ·ÙŠØ¹ Ø§Ø³ØªÙ„Ø§Ù… Ù…ØºÙ„ÙÙ‡ ÙÙŠ Ø§Ù„Ø¨Ø±Ø§ÙŠÙØª
                          if(rp.senderId===user.uid){alert(lang==='ar'?'âŒ Ù„Ø§ ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ø³ØªÙ„Ø§Ù… Ù…ØºÙ„ÙÙƒ Ø§Ù„Ø®Ø§Øµ':'âŒ You cannot claim your own packet');return;}
                          if(rp.claimedBy?.includes(user.uid)){alert(lang==='ar'?'Ø§Ø³ØªÙ„Ù…ØªÙ‡ Ù…Ù† Ù‚Ø¨Ù„':'Already claimed');return;}
                          if((rp.claimedBy?.length||0)>=rp.maxClaims){alert(lang==='ar'?'Ø§Ù„Ù…ØºÙ„Ù Ù†ÙØ¯':'Packet exhausted');return;}
                          if(rp.status!=='active'){alert(lang==='ar'?'Ø§Ù„Ù…ØºÙ„Ù Ù…Ù†ØªÙ‡ÙŠ':'Packet expired');return;}
                          // DM packet: recipient gets full amount
                          const claimAmt = rp.remaining || rp.amount;
                          await redPacketsCollection.doc(msg.rpId).update({
                            claimedBy:firebase.firestore.FieldValue.arrayUnion(user.uid),
                            remaining:firebase.firestore.FieldValue.increment(-claimAmt),
                            status:'exhausted',
                          });
                          await usersCollection.doc(user.uid).update({currency:firebase.firestore.FieldValue.increment(claimAmt)});
                          alert((lang==='ar'?'ðŸŽ‰ Ø§Ø³ØªÙ„Ù…Øª ':'ðŸŽ‰ You got ')+claimAmt+' Intel!');
                        } catch(e){console.error(e);}
                      }} disabled={isClaimed} style={{
                        display:'flex',alignItems:'center',gap:'10px',padding:'12px 16px',borderRadius:'16px',
                        background: isClaimed
                          ? 'linear-gradient(135deg,rgba(75,85,99,0.3),rgba(55,65,81,0.25))'
                          : 'linear-gradient(135deg,rgba(239,68,68,0.25),rgba(185,28,28,0.2))',
                        border: isClaimed ? '1px solid rgba(107,114,128,0.3)' : '1px solid rgba(239,68,68,0.5)',
                        cursor: isClaimed ? 'default' : 'pointer',
                        boxShadow: isClaimed ? 'none' : '0 4px 16px rgba(239,68,68,0.3)',
                        textAlign:'left',
                        opacity: isClaimed ? 0.55 : 1,
                        transition:'all 0.2s',
                      }}>
                        <div style={{fontSize:'32px',filter: isClaimed ? 'grayscale(1) opacity(0.5)' : 'drop-shadow(0 0 8px rgba(239,68,68,0.7))'}}>ðŸ§§</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:'12px',fontWeight:800,color: isClaimed ? '#6b7280' : '#ffd700'}}>{lang==='ar'?'Ù…ØºÙ„Ù Ø£Ø­Ù…Ø±':'Red Packet'}</div>
                          <div style={{fontSize:'10px',color: isClaimed ? '#4b5563' : '#fca5a5',marginTop:'2px'}}>{msg.rpAmount?.toLocaleString()} ðŸ§ </div>
                          <div style={{fontSize:'9px',color: isClaimed ? '#374151' : 'rgba(252,165,165,0.7)',marginTop:'2px'}}>
                            {isClaimed ? (lang==='ar'?'âœ… ØªÙ… Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…':'âœ… Claimed') : (lang==='ar'?'Ø§Ø¶ØºØ· Ù„Ù„Ø§Ø³ØªÙ„Ø§Ù…':'Tap to claim') + ' ðŸŽ'}
                          </div>
                        </div>
                      </button>
                      <div style={{fontSize:'9px',color:'#374151',marginTop:'2px',textAlign:isMine?'right':'left',paddingLeft:'4px',paddingRight:'4px'}}>{_fmtChatTs(msg.timestamp)}</div>
                    </div>
                  </div>
                  );
                }

                return (
                  <div key={msg.id || idx} style={{
                    display: 'flex',
                    flexDirection: isMine ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    gap: '6px',
                    marginBottom: isLastGroup ? '4px' : '1px',
                  }}>
                    {/* Avatar â€” shown for BOTH sides */}
                    <div style={{ width: '28px', flexShrink: 0, alignSelf: 'flex-end' }}>
                      {showAvatar ? (
                        <img
                          src={isMine
                            ? (currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.displayName||'U')}&background=6366f1&color=fff&size=56`)
                            : (msg.senderPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName||'U')}&background=6366f1&color=fff&size=56`)}
                          alt=""
                          onClick={() => openMiniProfile(msg.senderId)}
                          style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            objectFit: 'cover', cursor: 'pointer',
                            border: msgVipCfg ? `1.5px solid ${msgVipCfg.nameColor}` : '1.5px solid rgba(0,242,255,0.15)',
                            boxShadow: msgVipCfg ? `0 0 6px ${msgVipCfg.nameColor}55` : 'none',
                          }}
                        />
                      ) : <div style={{ width: '28px' }} />}
                    </div>

                    {/* Bubble column */}
                    <div style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: isMine ? 'flex-end' : 'flex-start',
                      maxWidth: '72%', gap: '2px',
                    }}>
                      {/* Sender name â€” shown for BOTH, clickable to open mini profile */}
                      {showName && (
                        <div
                          onClick={() => openMiniProfile(msg.senderId)}
                          style={{
                            fontSize: '10px', fontWeight: 700,
                            color: isMine ? '#00f2ff' : '#a78bfa',
                            paddingLeft: isMine ? 0 : '4px',
                            paddingRight: isMine ? '4px' : 0,
                            display: 'flex', alignItems: 'center', gap: '4px',
                            cursor: 'pointer',
                          }}>
                          {msgVipCfg && <span style={{fontSize:'7px',fontWeight:900,background:msgVipCfg.nameColor,color:'#000',padding:'0 3px',borderRadius:'2px',flexShrink:0}}>VIP{msgVipLevel}</span>}
                          {isMine ? (currentUser?.displayName || msg.senderName || 'You') : msg.senderName}
                          {isMine && <span style={{fontSize:'8px',color:'#4b5563',fontWeight:500}}> ({lang==='ar'?'Ø£Ù†Øª':'you'})</span>}
                          {msg.senderVipLevel > 0 && VIP_CHAT_TITLE_URLS?.[msg.senderVipLevel] && (
                            <img src={VIP_CHAT_TITLE_URLS[msg.senderVipLevel]} alt=""
                              style={{ height: '13px', objectFit: 'contain' }} />
                          )}
                        </div>
                      )}

                      {/* Bubble */}
                      {msg.isDeleted ? (
                        <div style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          padding: '7px 11px',
                          fontSize: '11px', color: '#4b5563',
                          fontStyle: 'italic',
                        }}>
                          ðŸ—‘ï¸ {lang === 'ar' ? 'ØªÙ… Ø­Ø°Ù Ù‡Ø°Ù‡ Ø§Ù„Ø±Ø³Ø§Ù„Ø©' : 'This message was deleted'}
                        </div>
                      ) : isGift ? (
                        <div style={{
                          background: isMine
                            ? 'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,136,0,0.10))'
                            : 'linear-gradient(135deg,rgba(255,215,0,0.09),rgba(255,136,0,0.06))',
                          border: '1px solid rgba(255,215,0,0.25)',
                          borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          padding: '8px 12px',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                        }}>
                          {msg.giftImageUrl
                            ? <img src={msg.giftImageUrl} alt="" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                            : <span style={{ fontSize: '30px' }}>{msg.giftEmoji || 'ðŸŽ'}</span>}
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24' }}>
                            {lang === 'ar' ? (msg.giftNameAr || 'Ù‡Ø¯ÙŠØ©') : (msg.giftNameEn || 'Gift')}
                            {msg.giftQty > 1 && ` Ã—${msg.giftQty}`}
                          </span>
                          <div style={{ display: 'flex', gap: '6px', fontSize: '10px' }}>
                            <span style={{ color: '#facc15', fontWeight: 700 }}>+{formatCharisma(msg.giftCharisma || 0)} â­</span>
                            {msg.giftBonus > 0 && <span style={{ color: '#4ade80', fontWeight: 700 }}>+{msg.giftBonus} ðŸ§ </span>}
                          </div>
                        </div>
                      ) : isImage ? (
                        <div
                          onClick={() => {
                            const w = window.open();
                            w.document.write(`<body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${msg.imageData}" style="max-width:100vw;max-height:100vh;object-fit:contain"></body>`);
                          }}
                          style={{
                            borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                            overflow: 'hidden',
                            border: `1px solid ${isMine ? 'rgba(0,242,255,0.18)' : 'rgba(255,255,255,0.09)'}`,
                            cursor: 'pointer',
                            width: 'min(260px, calc(100vw - 80px))',
                          }}
                        >
                          <img src={msg.imageData} alt="ðŸ“·"
                            style={{ display: 'block', width: '100%', maxHeight: '260px', objectFit: 'cover' }} />
                        </div>
                      ) : editingMsgId === msg.id ? (
                        /* â”€â”€ Edit input â”€â”€ */
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                          <input
                            autoFocus
                            value={editMsgText}
                            onChange={e => setEditMsgText(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleEditMessage(msg.id, editMsgText);
                              if (e.key === 'Escape') { setEditingMsgId(null); setEditMsgText(''); }
                            }}
                            style={{
                              flex: 1, padding: '7px 10px',
                              background: 'rgba(0,242,255,0.08)',
                              border: '1px solid rgba(0,242,255,0.3)',
                              borderRadius: '10px', color: 'white',
                              fontSize: '13px', outline: 'none',
                            }}
                          />
                          <button onClick={() => handleEditMessage(msg.id, editMsgText)}
                            style={{ background: 'rgba(0,242,255,0.2)', border: '1px solid rgba(0,242,255,0.4)', borderRadius: '8px', padding: '5px 8px', color: '#00f2ff', cursor: 'pointer', fontSize: '12px', fontWeight: 800 }}>âœ“</button>
                          <button onClick={() => { setEditingMsgId(null); setEditMsgText(''); }}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '5px 8px', color: '#9ca3af', cursor: 'pointer', fontSize: '12px' }}>âœ•</button>
                        </div>
                      ) : (
                        <div style={{
                          background: isMine
                            ? 'linear-gradient(135deg,rgba(0,242,255,0.16),rgba(112,0,255,0.13))'
                            : 'rgba(255,255,255,0.07)',
                          border: isMine
                            ? '1px solid rgba(0,242,255,0.16)'
                            : '1px solid rgba(255,255,255,0.07)',
                          borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          padding: '8px 11px',
                          fontSize: '13px', color: 'white',
                          lineHeight: 1.45, wordBreak: 'break-word',
                        }}>
                          {msg.text?.split(/(@\w[\w\s]*?)(?=\s|$)/g).map((part, pi) =>
                            part.startsWith('@') ? (
                              <span key={pi}
                                style={{ color:'#00f2ff', fontWeight:700, cursor:'pointer', textDecoration:'underline dotted rgba(0,242,255,0.4)' }}
                                onClick={() => {
                                  const mentionName = part.slice(1).trim();
                                  let uid = null;
                                  if (friend?.displayName === mentionName) uid = friend.uid;
                                  else if (currentUser?.displayName === mentionName) uid = user?.uid;
                                  if (uid) openMiniProfile(uid);
                                }}
                              >{part}</span>
                            ) : part
                          )}
                        </div>
                      )}

                      {/* Timestamp + edited + pen icon */}
                      {!msg.isDeleted && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          justifyContent: isMine ? 'flex-end' : 'flex-start',
                          paddingLeft: isMine ? 0 : '3px',
                          paddingRight: isMine ? '3px' : 0,
                          position: 'relative',
                        }}>
                          <div style={{ fontSize: '9px', color: '#374151' }}>
                            {_fmtChatTs(msg.timestamp)}
                            {msg.isEdited && <span style={{ marginLeft: '3px', color: '#4b5563', fontStyle: 'italic' }}>{lang === 'ar' ? '(Ù…Ø¹Ø¯Ù‘Ù„)' : '(edited)'}</span>}
                            {isMine && <span style={{ marginLeft: '3px', color: '#374151' }}>âœ“</span>}
                          </div>
                          {/* âœï¸ Ù‚Ù„Ù… Ø§Ù„ØªØ¹Ø¯ÙŠÙ„/Ø§Ù„Ø­Ø°Ù */}
                          {isMine && !isGift && !isImage && msg.type !== 'deleted' && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                setMsgMenuPos({
                                  bottom: window.innerHeight - rect.top + 4,
                                  right: Math.max(8, window.innerWidth - rect.right),
                                });
                                setMsgMenuId(msgMenuId === msg.id ? null : msg.id);
                              }}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '11px', color: '#4b5563', padding: '2px 3px',
                                lineHeight: 1, borderRadius: '4px',
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = '#9ca3af'}
                              onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}
                            >âœï¸</button>
                          )}
                          {/* â”€â”€ DM evidence select â”€â”€ */}
                          {showReportModal && reportStep === 'dm' && !isMine && !isGift && !isImage && (
                            <button
                              onClick={() => setReportDMMsg(reportDMMsg?.id === msg.id ? null : msg)}
                              style={{
                                background: reportDMMsg?.id === msg.id ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.05)',
                                border: reportDMMsg?.id === msg.id ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '6px', padding: '2px 6px',
                                fontSize: '10px', color: reportDMMsg?.id === msg.id ? '#f87171' : '#9ca3af',
                                cursor: 'pointer', fontWeight: 700,
                              }}
                            >{reportDMMsg?.id === msg.id ? 'âœ“' : lang === 'ar' ? 'Ø§Ø®ØªØ±' : 'Select'}</button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing animation */}
              {friendTyping && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                  <img
                    src={friend.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.displayName||'U')}&background=6366f1&color=fff&size=56`}
                    alt=""
                    style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      objectFit: 'cover', border: '1.5px solid rgba(0,242,255,0.15)',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '14px 14px 14px 4px',
                    padding: '10px 14px',
                    display: 'flex', gap: '4px', alignItems: 'center',
                  }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: '5px', height: '5px', borderRadius: '50%',
                        background: '#00f2ff',
                        animation: `chat-typing-dot 1.2s ${i * 0.22}s ease-in-out infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* â•â• INPUT BAR â•â• */}
            <div style={{
              padding: '9px 11px',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(0,0,0,0.45)',
              flexShrink: 0,
              position: 'relative',
            }}>
              {/* Emoji picker */}
              {showEmojiPicker && (
                <div style={{
                  position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0,
                  background: '#0e1020',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '14px', padding: '10px',
                  zIndex: Z.MODAL_TOP,
                  boxShadow: '0 -14px 44px rgba(0,0,0,0.8)',
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.07)',
                    paddingBottom: '6px',
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#00f2ff' }}>
                      {lang === 'ar' ? 'Ø§Ø®ØªØ± Ø¥ÙŠÙ…ÙˆØ¬ÙŠ' : 'Select Emoji'}
                    </span>
                    <button
                      onClick={() => setShowEmojiPicker(false)}
                      style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}
                    >âœ•</button>
                  </div>
                  {React.createElement(EmojiPicker, {
                    show: true,
                    onClose: () => setShowEmojiPicker(false),
                    onSelect: handleEmojiSelect,
                    lang,
                    inline: true,
                  })}
                </div>
              )}

              {!(isBlocked || blockedByTarget) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', boxSizing:'border-box', width:'100%', minWidth:0 }}>

                  {/* Emoji button */}
                  <button
                    onClick={() => setShowEmojiPicker(v => !v)}
                    style={{
                      background: showEmojiPicker ? 'rgba(0,242,255,0.12)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${showEmojiPicker ? 'rgba(0,242,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '10px', width: '36px', height: '36px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontSize: '17px', flexShrink: 0,
                      transition: 'all 0.2s',
                    }}
                  >ðŸ˜€</button>

                  {/* Image upload */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImg}
                    title={lang === 'ar' ? 'Ø¥Ø±Ø³Ø§Ù„ ØµÙˆØ±Ø©' : 'Send image'}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px', width: '36px', height: '36px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: uploadingImg ? 'wait' : 'pointer',
                      fontSize: '15px', flexShrink: 0,
                      opacity: uploadingImg ? 0.5 : 1,
                    }}
                  >{uploadingImg ? 'â³' : 'ðŸ–¼ï¸'}</button>

                  {/* ðŸ§§ Red Packet button */}
                  <button
                    onClick={() => {
                      if (typeof setShowDMRedPacket === 'function') setShowDMRedPacket(true);
                    }}
                    title={lang === 'ar' ? 'Ù…ØºÙ„Ù Ø£Ø­Ù…Ø±' : 'Red Packet'}
                    style={{
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '10px', width: '36px', height: '36px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontSize: '16px', flexShrink: 0,
                    }}
                  >ðŸ§§</button>

                  {/* Text input */}
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={t.typeMessage || (lang === 'ar' ? 'Ø§ÙƒØªØ¨ Ø±Ø³Ø§Ù„Ø©...' : 'Type a message...')}
                    value={newMsg}
                    onChange={e => {
                        const val = e.target.value;
                        setNewMsg(val);
                        handleTypingChange();
                        const lastAt = val.lastIndexOf('@');
                        if (lastAt !== -1) {
                            const after = val.slice(lastAt + 1);
                            if (!after.includes(' ') && (
                                (friend?.displayName || '').toLowerCase().includes(after.toLowerCase()) ||
                                (currentUser?.displayName || '').toLowerCase().includes(after.toLowerCase())
                            )) {
                                setShowMentionSuggestion(true);
                            } else { setShowMentionSuggestion(false); }
                        } else { setShowMentionSuggestion(false); }
                    }}
                    onKeyPress={e => { if (e.key === 'Enter' && !e.shiftKey) { setShowMentionSuggestion(false); handleSend(); } }}
                    onBlur={() => { clearTypingStatus(); setTimeout(() => setShowMentionSuggestion(false), 200); }}
                    style={{
                      flex: 1, padding: '8px 10px', minWidth: 0,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      color: 'white', fontSize: '13px', outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,242,255,0.3)'}
                  />

                  {/* @ Mention dropdown â€” self + friend */}
                  {showMentionSuggestion && (
                    <div style={{
                      position: 'absolute', bottom: 'calc(100% + 4px)', left: '50px', right: '50px',
                      background: 'linear-gradient(160deg,#0e0e22,#13122a)',
                      border: '1px solid rgba(0,242,255,0.2)',
                      borderRadius: '12px', overflow: 'hidden', zIndex: Z.TOOLTIP,
                      boxShadow: '0 -10px 28px rgba(0,0,0,0.85)',
                    }}>
                      {[
                        { uid: friend?.uid, name: friend?.displayName, photo: friend?.photoURL },
                        { uid: user?.uid, name: currentUser?.displayName, photo: currentUser?.photoURL },
                      ].filter(p => {
                        const after = newMsg.slice(newMsg.lastIndexOf('@') + 1).toLowerCase();
                        return p.uid && p.name && p.name.toLowerCase().includes(after);
                      }).map(p => (
                        <div key={p.uid}
                          onClick={() => {
                            const lastAt = newMsg.lastIndexOf('@');
                            setNewMsg(newMsg.slice(0, lastAt) + '@' + p.name + ' ');
                            setShowMentionSuggestion(false);
                            inputRef.current?.focus();
                          }}
                          style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 14px', cursor:'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(0,242,255,0.08)'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}
                        >
                          <img src={p.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name||'U')}&background=6366f1&color=fff&size=40`}
                            alt="" style={{ width:'24px', height:'24px', borderRadius:'50%', objectFit:'cover' }} />
                          <span style={{ fontSize:'12px', fontWeight:700, color:'#00f2ff' }}>@{p.name}</span>
                          {p.uid === user?.uid && <span style={{ fontSize:'10px', color:'#6b7280' }}>{lang==='ar'?'(Ø£Ù†Øª)':'(you)'}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Send button â€” ONLY lights up when there's text */}
                  <button
                    onClick={handleSend}
                    disabled={!canSend}
                    style={{
                      background: canSend
                        ? 'linear-gradient(135deg,rgba(0,242,255,0.25),rgba(112,0,255,0.22))'
                        : 'rgba(255,255,255,0.03)',
                      border: canSend
                        ? '1px solid rgba(0,242,255,0.35)'
                        : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '10px', width: '36px', height: '36px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      // âœ… cursor changes ONLY when there's text
                      cursor: canSend ? 'pointer' : 'default',
                      color: canSend ? '#00f2ff' : '#2d3748',
                      fontSize: '15px', flexShrink: 0,
                      transition: 'all 0.2s',
                      // âœ… No glow/box-shadow unless canSend
                      boxShadow: canSend ? '0 0 10px rgba(0,242,255,0.2)' : 'none',
                    }}
                  >âž¤</button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', fontSize: '11px', color: '#4b5563', padding: '8px' }}>
                  {lang === 'ar' ? 'Ù„Ø§ ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ø¥Ø±Ø³Ø§Ù„' : 'Cannot send messages'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ðŸ§§ DM Red Packet Modal */}
        {showDMRedPacket && (
          <div style={{position:'fixed',inset:0,zIndex:Z.TOOLTIP,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
            <div style={{width:'100%',maxWidth:'min(440px, 100vw)',background:'linear-gradient(160deg,#0e0e22,#13122a)',borderRadius:'20px 20px 0 0',border:'1px solid rgba(255,255,255,0.1)',overflow:'hidden'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
                <div style={{fontSize:'14px',fontWeight:800,color:'#ef4444'}}>ðŸ§§ {lang==='ar'?'Ø£Ø±Ø³Ù„ Ù…ØºÙ„Ù Ø£Ø­Ù…Ø±':'Send Red Packet'}</div>
                <button onClick={()=>setShowDMRedPacket(false)} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'20px',cursor:'pointer'}}>âœ•</button>
              </div>
              <div style={{padding:'14px'}}>
                <div style={{fontSize:'11px',color:'#6b7280',marginBottom:'12px',textAlign:'center'}}>
                  {lang==='ar'?'Ø¥Ù„Ù‰':'To'}: <span style={{color:'#a78bfa',fontWeight:700}}>{friend?.displayName}</span>
                  {' Â· '}{lang==='ar'?'Ø±ØµÙŠØ¯Ùƒ':'Balance'}: <span style={{color:'#ffd700',fontWeight:700}}>{(currency||0).toLocaleString()} ðŸ§ </span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'8px',maxHeight:'320px',overflowY:'auto'}}>
                  {(typeof RED_PACKETS_CONFIG!=='undefined'?RED_PACKETS_CONFIG:[]).map(rp=>(
                    <button key={rp.id} onClick={async()=>{
                      if(sendingDMRedPacket||(currency||0)<rp.amount) return;
                      setSendingDMRedPacket(true);
                      try {
                        const rpRef = await redPacketsCollection.add({
                          configId:rp.id, amount:rp.amount,
                          senderId:user.uid, senderName:currentUser?.displayName||'User', senderPhoto:currentUser?.photoURL||null,
                          targetType:'dm', targetId:friend.uid, targetName:friend.displayName,
                          claimedBy:[], maxClaims:1, remaining:rp.amount,
                          createdAt:TS(), status:'active',
                        });
                        await usersCollection.doc(user.uid).update({currency:firebase.firestore.FieldValue.increment(-rp.amount)});
                        await chatsCollection.doc(chatId).collection('messages').add({
                          type:'red_packet', rpId:rpRef.id, rpAmount:rp.amount, rpConfigId:rp.id,
                          senderId:user.uid, senderName:currentUser?.displayName||'User', senderPhoto:currentUser?.photoURL||null,
                          text:`ðŸ§§ ${rp.amount}`, timestamp:TS(), maxClaims:1,
                        });
                        // Announce
                        await publicChatCollection.add({
                          type:'red_packet_announce', senderId:user.uid, senderName:currentUser?.displayName||'User',
                          amount:rp.amount, targetType:'dm', targetName:friend.displayName,
                          text:lang==='ar'?`ðŸ§§ ${currentUser?.displayName} Ø£Ø±Ø³Ù„ Ù…ØºÙ„Ù ${rp.amount} Ø¥Ù„Ù‰ ${friend.displayName}`:`ðŸ§§ ${currentUser?.displayName} sent a ${rp.amount} packet to ${friend.displayName}`,
                          createdAt:TS(),
                        });
                        setShowDMRedPacket(false);
                      } catch(e) { console.error(e); }
                      setSendingDMRedPacket(false);
                    }} disabled={sendingDMRedPacket||(currency||0)<rp.amount}
                    style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',borderRadius:'14px',background:rp.bg,border:`1px solid ${rp.border}`,cursor:(currency||0)<rp.amount?'not-allowed':'pointer',opacity:(currency||0)<rp.amount?0.4:1,textAlign:'left'}}>
                      {rp.imageURL?<img src={rp.imageURL} alt="" style={{width:'42px',height:'42px',objectFit:'contain'}}/>:<div style={{width:'42px',height:'42px',borderRadius:'10px',background:`${rp.color}20`,border:`1px solid ${rp.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px'}}>ðŸ§§</div>}
                      <div style={{flex:1}}>
                        <div style={{fontSize:'13px',fontWeight:800,color:rp.color}}>{lang==='ar'?rp.name_ar:rp.name_en}</div>
                        <div style={{fontSize:'10px',color:'#9ca3af',marginTop:'2px'}}>{lang==='ar'?rp.desc_ar:rp.desc_en}</div>
                      </div>
                      <div style={{fontSize:'13px',fontWeight:800,color:rp.color}}>{rp.amount.toLocaleString()} ðŸ§ </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gift modal */}
        {showGiftModal && (
          <SendGiftModal
            show={showGiftModal}
            onClose={() => setShowGiftModal(false)}
            targetUser={friend}
            currentUser={currentUser}
            lang={lang}
            onSendGift={handleSendGiftToChat}
            currency={currency || 0}
            friendsData={friendsData}
          />
        )}

        {/* â”€â”€ Header 3-dot dropdown â€” rendered as fixed overlay â”€â”€ */}
        {showHeaderMenu && (() => {
          const rect = headerMenuBtnRef.current?.getBoundingClientRect();
          const dropTop = rect ? rect.bottom + 4 : 60;
          const dropRight = rect ? Math.max(8, window.innerWidth - rect.right) : 8;
          return (
            <div style={{ position:'fixed', inset:0, zIndex: Z.TOOLTIP - 1 }}
              onClick={() => setShowHeaderMenu(false)}>
              <div style={{
                position:'fixed', top:`${dropTop}px`, right:`${dropRight}px`,
                background:'linear-gradient(160deg,#0e0e22,#13122a)',
                border:'1px solid rgba(255,255,255,0.13)',
                borderRadius:'14px', padding:'7px',
                zIndex: Z.TOOLTIP,
                minWidth:'185px',
                boxShadow:'0 16px 44px rgba(0,0,0,0.9)',
              }} onClick={e => e.stopPropagation()}>
                <button onClick={() => { setShowHeaderMenu(false); setShowDeleteChatConfirm(true); }}
                  style={{ width:'100%', padding:'10px 13px', borderRadius:'8px', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'9px', fontSize:'13px', fontWeight:700, color:'#f87171', textAlign:'left' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}
                >ðŸ—‘ï¸ {lang==='ar'?'Ø­Ø°Ù Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø©':'Delete Chat'}</button>
                <button onClick={() => { isBlocked ? handleUnblock() : handleBlock(); }}
                  style={{ width:'100%', padding:'10px 13px', borderRadius:'8px', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'9px', fontSize:'13px', fontWeight:700, color: isBlocked?'#4ade80':'#f59e0b', textAlign:'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = isBlocked?'rgba(74,222,128,0.1)':'rgba(245,158,11,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}
                >{isBlocked?`âœ… ${lang==='ar'?'Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø­Ø¸Ø±':'Unblock'}`:`ðŸš« ${lang==='ar'?'Ø­Ø¸Ø± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…':'Block User'}`}</button>
                <button onClick={() => { setShowHeaderMenu(false); setReportStep('reason'); setReportReason(''); setReportDMMsg(null); setShowReportModal(true); }}
                  style={{ width:'100%', padding:'10px 13px', borderRadius:'8px', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'9px', fontSize:'13px', fontWeight:700, color:'#9ca3af', textAlign:'left' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}
                >ðŸš¨ {lang==='ar'?'Ø¥Ø¨Ù„Ø§Øº':'Report'}</button>
              </div>
            </div>
          );
        })()}

        {/* â”€â”€ Pen message menu â€” fixed overlay â”€â”€ */}
        {msgMenuId && (() => {
          const activeMsg = messages.find(m => m.id === msgMenuId);
          if (!activeMsg) return null;
          return (
            <div style={{ position:'fixed', inset:0, zIndex: Z.MODAL_HIGH }} onClick={() => setMsgMenuId(null)}>
              <div style={{
                position:'fixed',
                bottom: `${msgMenuPos.bottom}px`,
                right: `${msgMenuPos.right}px`,
                background: 'linear-gradient(160deg,#0e0e22,#13122a)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px', padding: '5px',
                zIndex: Z.MODAL_HIGH + 1,
                boxShadow: '0 8px 24px rgba(0,0,0,0.9)',
                minWidth: '130px',
                whiteSpace: 'nowrap',
              }} onClick={e => e.stopPropagation()}>
                <button
                  onClick={e => { e.stopPropagation(); setEditingMsgId(msgMenuId); setEditMsgText(activeMsg.text || ''); setMsgMenuId(null); }}
                  style={{ width:'100%', padding:'7px 10px', borderRadius:'7px', background:'none', border:'none', cursor:'pointer', fontSize:'12px', color:'#00f2ff', fontWeight:700, textAlign:'left', display:'flex', alignItems:'center', gap:'7px' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(0,242,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}
                >âœï¸ {lang==='ar'?'ØªØ¹Ø¯ÙŠÙ„':'Edit'}</button>
                <button
                  onClick={e => { e.stopPropagation(); setMsgMenuId(null); handleDeleteMessage(msgMenuId); }}
                  style={{ width:'100%', padding:'7px 10px', borderRadius:'7px', background:'none', border:'none', cursor:'pointer', fontSize:'12px', color:'#f87171', fontWeight:700, textAlign:'left', display:'flex', alignItems:'center', gap:'7px' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}
                >ðŸ—‘ï¸ {lang==='ar'?'Ø­Ø°Ù':'Delete'}</button>
              </div>
            </div>
          );
        })()}

        {/* â”€â”€ Mini Profile Modal â€” Enhanced Design â”€â”€ */}
        {miniProfile && (
          <MiniProfilePopup
            profile={miniProfile}
            onClose={() => { setMiniProfile(null); setShowMiniMenu(false); }}
            currentUID={user?.uid}
            lang={lang}
            onOpenProfile={onOpenProfile}
            onSendGift={onSendGift ? () => { setShowGiftModal(true); } : null}
            onReport={() => { setTimeout(() => { setReportStep('reason'); setReportReason(''); setReportDMMsg(null); setShowReportModal(true); }, 50); }}
            onBlock={handleBlock}
            onUnblock={handleUnblock}
            isBlocked={isBlocked}
          />
        )}


        {/* â”€â”€ Delete Chat Confirm Modal â”€â”€ */}
        {showDeleteChatConfirm && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: Z.OVERLAY,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }} onClick={() => setShowDeleteChatConfirm(false)}>
            <div style={{
              background: 'linear-gradient(135deg,#1a0808,#0f0505)',
              border: '2px solid rgba(239,68,68,0.45)',
              borderRadius: '18px', padding: '24px',
              maxWidth: '300px', width: '100%',
              textAlign: 'center',
              boxShadow: '0 0 40px rgba(239,68,68,0.2)',
            }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>ðŸ—‘ï¸</div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: '#f87171', marginBottom: '8px' }}>
                {lang === 'ar' ? 'Ø­Ø°Ù Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø©' : 'Delete Chat'}
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px', lineHeight: 1.6 }}>
                {lang === 'ar'
                  ? 'Ø³ÙŠØªÙ… Ø­Ø°Ù ÙƒÙ„ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹. Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ØŸ'
                  : 'All messages will be permanently deleted. Are you sure?'}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowDeleteChatConfirm(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                  {lang === 'ar' ? 'Ø¥Ù„ØºØ§Ø¡' : 'Cancel'}
                </button>
                <button onClick={handleDeleteChat} disabled={deletingChat}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg,#dc2626,#991b1b)', border: 'none', color: 'white', fontSize: '13px', fontWeight: 800, cursor: deletingChat ? 'wait' : 'pointer', opacity: deletingChat ? 0.7 : 1 }}>
                  {deletingChat ? 'â³' : `ðŸ—‘ï¸ ${lang === 'ar' ? 'Ø­Ø°Ù' : 'Delete'}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* â”€â”€ Report Modal â”€â”€ */}
        {showReportModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: Z.OVERLAY,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }} onClick={() => { if (reportStep !== 'done') setShowReportModal(false); }}>
            <div style={{
              background: 'linear-gradient(160deg,#0d0d1f,#0a0a18)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '20px', padding: '24px',
              maxWidth: '340px', width: '100%',
              boxShadow: '0 24px 60px rgba(0,0,0,0.9)',
            }} onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <span style={{ fontSize: '22px' }}>ðŸš¨</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#f87171' }}>
                    {lang === 'ar' ? 'Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ù…Ø³ØªØ®Ø¯Ù…' : 'Report User'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{friend?.displayName}</div>
                </div>
                {reportStep !== 'done' && (
                  <button onClick={() => setShowReportModal(false)}
                    style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '16px' }}>âœ•</button>
                )}
              </div>

              {/* Step: reason */}
              {reportStep === 'reason' && (
                <>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '10px' }}>
                    {lang === 'ar' ? 'Ø³Ø¨Ø¨ Ø§Ù„Ø¨Ù„Ø§Øº:' : 'Reason for report:'}
                  </div>
                  {[
                    { en: 'Harassment / Bullying', ar: 'Ù…Ø¶Ø§ÙŠÙ‚Ø© / ØªÙ†Ù…Ø±' },
                    { en: 'Inappropriate content', ar: 'Ù…Ø­ØªÙˆÙ‰ ØºÙŠØ± Ù„Ø§Ø¦Ù‚' },
                    { en: 'Spam / Advertising', ar: 'Ø³Ø¨Ø§Ù… / Ø¥Ø¹Ù„Ø§Ù†Ø§Øª' },
                    { en: 'Fake account', ar: 'Ø­Ø³Ø§Ø¨ Ù…Ø²ÙŠÙ' },
                    { en: 'Other', ar: 'Ø£Ø®Ø±Ù‰' },
                  ].map(r => (
                    <button key={r.en} onClick={() => setReportReason(lang === 'ar' ? r.ar : r.en)}
                      style={{
                        width: '100%', padding: '9px 13px', marginBottom: '5px', borderRadius: '9px',
                        background: reportReason === (lang === 'ar' ? r.ar : r.en) ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                        border: reportReason === (lang === 'ar' ? r.ar : r.en) ? '1px solid rgba(239,68,68,0.45)' : '1px solid rgba(255,255,255,0.08)',
                        color: reportReason === (lang === 'ar' ? r.ar : r.en) ? '#f87171' : '#d1d5db',
                        fontSize: '12px', fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                      }}>
                      {lang === 'ar' ? r.ar : r.en}
                    </button>
                  ))}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button onClick={() => setShowReportModal(false)}
                      style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      {lang === 'ar' ? 'Ø¥Ù„ØºØ§Ø¡' : 'Cancel'}
                    </button>
                    <button onClick={() => setReportStep('dm')} disabled={!reportReason}
                      style={{ flex: 1, padding: '10px', borderRadius: '10px', background: reportReason ? 'linear-gradient(135deg,rgba(239,68,68,0.3),rgba(185,28,28,0.2))' : 'rgba(255,255,255,0.03)', border: reportReason ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.06)', color: reportReason ? '#f87171' : '#374151', fontSize: '12px', fontWeight: 700, cursor: reportReason ? 'pointer' : 'not-allowed' }}>
                      {lang === 'ar' ? 'Ø§Ù„ØªØ§Ù„ÙŠ â†’' : 'Next â†’'}
                    </button>
                  </div>
                </>
              )}

              {/* Step: DM evidence */}
              {reportStep === 'dm' && (
                <>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
                    {lang === 'ar' ? 'Ø£Ø¶Ù Ø¯Ù„ÙŠÙ„Ø§Ù‹ Ù…Ù† Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ):' : 'Add message evidence (optional):'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '12px', lineHeight: 1.5 }}>
                    {lang === 'ar'
                      ? 'Ø£ØºÙ„Ù‚ Ù‡Ø°Ù‡ Ø§Ù„Ù†Ø§ÙØ°Ø© ÙˆØ§Ø¶ØºØ· Ø¹Ù„Ù‰ "Ø§Ø®ØªØ±" Ø¨Ø¬Ø§Ù†Ø¨ Ø§Ù„Ø±Ø³Ø§Ù„Ø© Ø§Ù„ØªÙŠ ØªØ±ÙŠØ¯ Ø¥Ø±ÙØ§Ù‚Ù‡Ø§ ÙƒØ¯Ù„ÙŠÙ„ØŒ Ø«Ù… Ø¹Ø¯ Ù‡Ù†Ø§.'
                      : 'Close this dialog and tap "Select" next to the message you want as evidence, then come back.'}
                  </div>
                  {reportDMMsg && (
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px', marginBottom: '12px', fontSize: '12px', color: '#fca5a5' }}>
                      ðŸ“Ž {lang === 'ar' ? 'Ø¯Ù„ÙŠÙ„ Ù…Ø±ÙÙ‚:' : 'Evidence attached:'} "{reportDMMsg.text?.slice(0, 60)}{reportDMMsg.text?.length > 60 ? '...' : ''}"
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setReportStep('reason')}
                      style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      â† {lang === 'ar' ? 'Ø±Ø¬ÙˆØ¹' : 'Back'}
                    </button>
                    <button onClick={handleSubmitReport} disabled={submittingReport}
                      style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg,rgba(239,68,68,0.35),rgba(185,28,28,0.25))', border: '1px solid rgba(239,68,68,0.5)', color: '#f87171', fontSize: '12px', fontWeight: 800, cursor: submittingReport ? 'wait' : 'pointer', opacity: submittingReport ? 0.7 : 1 }}>
                      {submittingReport ? 'â³' : `ðŸš¨ ${lang === 'ar' ? 'Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø¨Ù„Ø§Øº' : 'Submit Report'}`}
                    </button>
                  </div>
                </>
              )}

              {/* Step: done */}
              {reportStep === 'done' && (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>âœ…</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#4ade80', marginBottom: '8px' }}>
                    {lang === 'ar' ? 'ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø¨Ù„Ø§Øº' : 'Report Submitted'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '20px', lineHeight: 1.6 }}>
                    {lang === 'ar'
                      ? 'Ø´ÙƒØ±Ø§Ù‹ Ù„Ù…Ø³Ø§Ø¹Ø¯ØªÙ†Ø§. Ø³ÙŠØªÙ… Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ø¨Ù„Ø§Øº Ù‚Ø±ÙŠØ¨Ø§Ù‹ ÙˆØ³ØªØµÙ„Ùƒ Ø±Ø³Ø§Ù„Ø© Ù…Ù† Ø§Ù„Ù…Ø­Ù‚Ù‚.'
                      : 'Thank you. Your report will be reviewed soon and you will receive a message from The Detective.'}
                  </div>
                  <button onClick={() => setShowReportModal(false)}
                    style={{ padding: '10px 28px', borderRadius: '10px', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                    {lang === 'ar' ? 'Ø¥ØºÙ„Ø§Ù‚' : 'Close'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Typing animation keyframes */}
        <style>{`
          @keyframes chat-typing-dot {
            0%,60%,100%{ transform:translateY(0); opacity:0.3; }
            30%{ transform:translateY(-5px); opacity:1; }
          }
        `}</style>
        </>
    );
};

// ðŸ“… LOGIN REWARDS COMPONENT

