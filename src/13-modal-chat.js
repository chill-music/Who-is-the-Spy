// ════════════════════════════════════════════════════════
// 💬 PRIVATE CHAT MODAL — V3
//    ✅ ALL users → Firestore (for real-time delivery)
//    ✅ VIP10 → Typing indicator + ☁️ badge (permanent storage)
//    ✅ Non-VIP10 → messages still go to Firestore (deliverable)
//                   localStorage used as local cache only
//    ✅ Image upload (base64, max 400px)
//    ✅ Send arrow only lights up when there's text
//    ✅ Modern UI: avatars, names, timestamps, status
// ════════════════════════════════════════════════════════

// ── Compress image to base64 ──
const compressImageToBase64 = (file) => new Promise((resolve, reject) => {
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

// ── LocalStorage helpers (cache only) ──
const _chatCacheKey = (chatId) => `pro_spy_chat_cache_${chatId}`;
const _saveChatCache = (chatId, msgs) => {
    try { localStorage.setItem(_chatCacheKey(chatId), JSON.stringify(msgs.slice(-80))); } catch {}
};
const _loadChatCache = (chatId) => {
    try { const r = localStorage.getItem(_chatCacheKey(chatId)); return r ? JSON.parse(r) : []; }
    catch { return []; }
};

// ── Format timestamp ──
const _fmtChatTs = (ts) => {
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

const PrivateChatModal = ({
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
    // ── 3-dot menu ──
    const [showHeaderMenu, setShowHeaderMenu] = useState(false);
    // ── Delete chat confirm ──
    const [showDeleteChatConfirm, setShowDeleteChatConfirm] = useState(false);
    const [deletingChat, setDeletingChat]   = useState(false);
    // ── Report modal ──
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportStep, setReportStep]       = useState('reason');
    const [reportReason, setReportReason]   = useState('');
    const [reportDMMsg, setReportDMMsg]     = useState(null);
    const [submittingReport, setSubmittingReport] = useState(false);
    // ── Message edit/delete ──
    const [editingMsgId, setEditingMsgId]   = useState(null);
    const [editMsgText, setEditMsgText]     = useState('');
    const [msgMenuId, setMsgMenuId]         = useState(null); // قائمة القلم للرسالة
    // ── @ Mention ──
    const [showMentionSuggestion, setShowMentionSuggestion] = useState(false);
    // ── Mini Profile ──
    const [miniProfile, setMiniProfile]     = useState(null);
    const [loadingMiniProfile, setLoadingMiniProfile] = useState(false);
    const [showMiniMenu, setShowMiniMenu]   = useState(false);
    // ── Pen menu position (fixed) ──
    const [msgMenuPos, setMsgMenuPos]       = useState({ top: 0, right: 0 });
    // ── 3-dot header button rect ──
    const [menuBtnRect, setMenuBtnRect]     = useState(null);
    // ── 🧧 DM Red Packet ──
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

    // ── Blocked check ──
    useEffect(() => {
        if (!show || !friend || !currentUser) return;
        setIsBlocked((currentUser.blockedUsers || []).includes(friend.uid));
        usersCollection.doc(friend.uid).get().then(doc => {
            if (doc.exists) setBlockedByTarget((doc.data().blockedUsers || []).includes(user.uid));
        }).catch(() => {});
    }, [show, friend?.uid, currentUser?.uid, user?.uid]);

    // ── Messages: ALWAYS from Firestore (real-time for both parties) ──
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

    // ── Typing listener (when typingEnabled) ──
    useEffect(() => {
        if (!show || !chatId || !typingEnabled || !friend) return;
        const unsub = chatsCollection.doc(chatId).onSnapshot(snap => {
            if (snap.exists) {
                setFriendTyping(!!(snap.data()?.typing?.[friend.uid]));
            }
        }, () => {});
        return unsub;
    }, [show, chatId, friend?.uid, typingEnabled]);

    // ── Auto-scroll to bottom ──
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, friendTyping]);

    // ── Typing indicator write (when typingEnabled) ──
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

    // ── Send text message ──
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
                timestamp:     firebase.firestore.FieldValue.serverTimestamp(),
            };
            // ✅ Always save to Firestore so the other person sees it
            await chatsCollection.doc(chatId).collection('messages').add(msgData);
            await chatsCollection.doc(chatId).set({
                members:  [user.uid, friend.uid],
                lastMessage: text,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
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

    // ── Send image ──
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
                text:          '📷',
                timestamp:     firebase.firestore.FieldValue.serverTimestamp(),
            };
            await chatsCollection.doc(chatId).collection('messages').add(msgData);
            await chatsCollection.doc(chatId).set({
                members:  [user.uid, friend.uid],
                lastMessage: '📷 Photo',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
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

    // ── حذف الشات ──
    const handleDeleteChat = async () => {
        if (!chatId || deletingChat) return;
        setDeletingChat(true);
        try {
            // حذف كل الرسائل
            const msgsSnap = await chatsCollection.doc(chatId).collection('messages').limit(500).get();
            const batch = db.batch();
            msgsSnap.docs.forEach(d => batch.delete(d.ref));
            await batch.commit().catch(() => {});
            // حذف الـ chat doc
            await chatsCollection.doc(chatId).delete().catch(() => {});
            setShowDeleteChatConfirm(false);
            onClose();
        } catch (e) { console.error('Delete chat error:', e); }
        setDeletingChat(false);
    };

    // ── حظر المستخدم ──
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

    // ── إلغاء الحظر ──
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

    // ── فتح ميني بروفايل لأي شخص ──
    const openMiniProfile = async (uid) => {
        if (!uid) return;
        setLoadingMiniProfile(true);
        setShowMiniMenu(false);
        setMiniProfile({ uid, name: '...', photo: null, customId: null, bannerUrl: null, gender: null, loading: true });
        try {
            const doc = await usersCollection.doc(uid).get();
            if (doc.exists) {
                const d = doc.data();
                const stats = d.stats || {};
                const wins = stats.wins || 0;
                const losses = stats.losses || 0;
                const total = wins + losses;
                const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
                const unlockedBadgeIds = Array.isArray(d.achievements)
                    ? d.achievements.map(a => typeof a === 'string' ? a : a?.id).filter(Boolean)
                    : ((d.achievements?.badges) || []).map(b => b?.id || b).filter(Boolean);
                const topBadges = typeof ACHIEVEMENTS !== 'undefined'
                    ? ACHIEVEMENTS.filter(a => unlockedBadgeIds.includes(a.id))
                        .sort((a, b) => (b.tier || 0) - (a.tier || 0))
                        .slice(0, 3)
                    : [];
                // VIP info
                const vipLevel = typeof getVIPLevel === 'function' ? (getVIPLevel(d) || 0) : 0;
                const vipCfg = vipLevel > 0 && typeof VIP_CONFIG !== 'undefined' ? VIP_CONFIG[Math.min(vipLevel-1, VIP_CONFIG.length-1)] : null;
                setMiniProfile({
                    uid,
                    name: d.displayName || 'User',
                    photo: d.photoURL || null,
                    customId: d.customId || null,
                    bannerUrl: d.profileBanner || d.bannerUrl || null,
                    gender: d.gender || null,
                    isFriend: (currentUser?.friends || []).includes(uid),
                    charisma: d.charisma || 0,
                    familyTag: d.familyTag || null,
                    familyName: d.familyName || null,
                    familySignLevel: d.familySignLevel || null,
                    familySignColor: d.familySignColor || null,
                    familySignImageURL: d.familySignImageURL || null,
                    gamesPlayed: total,
                    winRate,
                    topBadges,
                    vipLevel,
                    vipCfg,
                    equippedFrame: d.equipped?.frames || null,
                    coupleRingEmoji: d.coupleRingEmoji || null,
                    coupleRingImageUrl: d.coupleRingImageUrl || null,
                    loading: false,
                });
            }
        } catch(e) { console.error('openMiniProfile error:', e); }
        setLoadingMiniProfile(false);
    };

    // ── تعديل رسالة ──
    const handleEditMessage = async (msgId, newText) => {
        if (!newText.trim() || !chatId) return;
        try {
            await chatsCollection.doc(chatId).collection('messages').doc(msgId).update({
                text: newText.trim(),
                editedAt: firebase.firestore.FieldValue.serverTimestamp(),
                isEdited: true,
            });
            setEditingMsgId(null);
            setEditMsgText('');
        } catch (e) { console.error('Edit message error:', e); }
    };

    // ── حذف رسالة ──
    const handleDeleteMessage = async (msgId) => {
        if (!chatId) return;
        try {
            // استبدال الرسالة بـ "تم حذف هذه الرسالة"
            await chatsCollection.doc(chatId).collection('messages').doc(msgId).update({
                text: lang === 'ar' ? '🗑️ تم حذف هذه الرسالة' : '🗑️ This message was deleted',
                isDeleted: true,
                deletedAt: firebase.firestore.FieldValue.serverTimestamp(),
                imageData: firebase.firestore.FieldValue.delete(),
                type: 'deleted',
            });
        } catch (e) { console.error('Delete message error:', e); }
    };

    // ── إرسال بلاغ مع DM كدليل ──
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
                createdAt:     firebase.firestore.FieldValue.serverTimestamp(),
            });
            // إشعار للمستخدم بإرسال البلاغ
            await botChatsCollection.add({
                botId: 'detective_bot',
                toUserId: user.uid,
                type: 'report_submitted',
                message: lang === 'ar'
                    ? `🕵️ تم استلام بلاغك ضد "${friend.displayName || 'المستخدم'}".\nسيقوم فريق الإدارة بمراجعة البلاغ والتحقيق فيه.\n\nشكراً لمساعدتنا في الحفاظ على سلامة المجتمع.`
                    : `🕵️ Your report against "${friend.displayName || 'user'}" has been received.\nOur moderation team will review and investigate.\n\nThank you for helping keep the community safe.`,
                read: false,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            }).catch(() => {});
            setReportStep('done');
        } catch (e) { console.error('Report error:', e); }
        setSubmittingReport(false);
    };

    if (!show || !friend) return null;

    // ── Online status ──
    const friendInfo   = friendsData?.find(f => f.id === friend.uid) || friend;
    const isOnline     = friendInfo?.isOnline || friendInfo?.onlineStatus === 'online';
    const isAway       = friendInfo?.onlineStatus === 'away';
    const statusColor  = isOnline ? '#22c55e' : isAway ? '#f59e0b' : '#6b7280';
    const statusLabel  = isOnline
        ? (lang === 'ar' ? 'متصل الآن' : 'Online')
        : isAway ? (lang === 'ar' ? 'بعيد' : 'Away')
        : (lang === 'ar' ? 'غير متصل' : 'Offline');

    const canSend = !sending && newMsg.trim().length > 0 && !isBlocked && !blockedByTarget;

    return (
        <>
        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept="image/*"
            style={{ display: 'none' }} onChange={handleImageSelect} />

        <div className="modal-overlay" onClick={onClose}>
          <div onClick={e => e.stopPropagation()} style={{
            display: 'flex', flexDirection: 'column',
            width: '100%', maxWidth: '420px',
            height: '82vh', maxHeight: '680px',
            background: 'linear-gradient(160deg,rgba(5,5,18,0.99),rgba(9,8,26,0.99))',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 28px 70px rgba(0,0,0,0.88), 0 0 30px rgba(0,242,255,0.06)',
            margin: 'auto',
          }}>

            {/* ══ HEADER ══ */}
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
                      background: VIP_CONFIG[Math.min(getVIPLevel(friend)-1, VIP_CONFIG.length-1)]?.nameColor || '#7c3aed',
                      color: '#000', padding: '1px 4px', borderRadius: '3px', flexShrink: 0,
                    }}>VIP{getVIPLevel(friend)}</span>
                  )}
                </div>
                <div style={{ fontSize: '10px', color: friendTyping ? '#00f2ff' : statusColor, fontWeight: 600 }}>
                  {friendTyping
                    ? <span style={{ fontStyle: 'italic' }}>{lang === 'ar' ? '✏️ يكتب...' : '✏️ typing...'}</span>
                    : <span><span style={{ fontSize: '7px' }}>● </span>{statusLabel}</span>
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
                  }}>☁️ {lang === 'ar' ? 'محفوظ' : 'Saved'}</div>
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
                >🎁</button>

                {/* ── 3-dot menu button ── */}
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
                >⋮</button>

                <button
                  onClick={() => { setShowHeaderMenu(false); onClose(); }}
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '8px', width: '30px', height: '30px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#9ca3af', fontSize: '14px',
                  }}
                >✕</button>
              </div>
            </div>

            {/* ══ BLOCKED NOTICE ══ */}
            {(isBlocked || blockedByTarget) && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
                borderRadius: '8px', margin: '8px 12px 0',
                padding: '7px 12px', fontSize: '11px', color: '#f87171',
                display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
              }}>
                🚫 {isBlocked
                  ? (lang === 'ar' ? 'حظرت هذا المستخدم. إلغاء الحظر للمراسلة.' : 'You blocked this user. Unblock to message.')
                  : (lang === 'ar' ? 'هذا المستخدم حظرك. لا يمكنك الإرسال.' : 'This user has blocked you.')}
              </div>
            )}

            {/* ══ MESSAGES AREA ══ */}
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
                  <span style={{ fontSize: '40px' }}>💬</span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {lang === 'ar' ? 'لا توجد رسائل بعد' : 'No messages yet'}
                  </span>
                </div>
              ) : messages.map((msg, idx) => {
                const isMine      = msg.senderId === user?.uid;
                const isGift      = msg.type === 'gift';
                const isImage     = msg.type === 'image';
                const isRedPacket = msg.type === 'red_packet';
                const prevSender  = idx > 0 ? messages[idx - 1]?.senderId : null;
                const nextSender  = idx < messages.length - 1 ? messages[idx + 1]?.senderId : null;
                // show avatar for BOTH mine and others — on first message of each group
                const showAvatar  = prevSender !== msg.senderId;
                const showName    = prevSender !== msg.senderId;
                const isLastGroup = nextSender !== msg.senderId;
                // Get VIP config for this message sender
                const msgVipLevel = msg.senderVipLevel || 0;
                const msgVipCfg = msgVipLevel > 0 && typeof VIP_CONFIG !== 'undefined' ? VIP_CONFIG[Math.min(msgVipLevel-1, VIP_CONFIG.length-1)] : null;

                // 🧧 Red Packet bubble
                if(isRedPacket) return (
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
                          {isMine&&<span style={{fontSize:'8px',color:'#4b5563'}}> ({lang==='ar'?'أنت':'you'})</span>}
                        </div>
                      )}
                      <button onClick={async()=>{
                        if(!msg.rpId||!user) return;
                        try {
                          const rpDoc = await redPacketsCollection.doc(msg.rpId).get();
                          if(!rpDoc.exists){return;}
                          const rp=rpDoc.data();
                          if(rp.claimedBy?.includes(user.uid)){return;}
                          if(rp.claimedBy?.length>=rp.maxClaims){return;}
                          await redPacketsCollection.doc(msg.rpId).update({claimedBy:firebase.firestore.FieldValue.arrayUnion(user.uid),status:'exhausted'});
                          await usersCollection.doc(user.uid).update({currency:firebase.firestore.FieldValue.increment(rp.amount)});
                        } catch(e){console.error(e);}
                      }} style={{
                        display:'flex',alignItems:'center',gap:'10px',padding:'12px 16px',borderRadius:'16px',
                        background:'linear-gradient(135deg,rgba(239,68,68,0.25),rgba(185,28,28,0.2))',
                        border:'1px solid rgba(239,68,68,0.5)',cursor:'pointer',
                        boxShadow:'0 4px 16px rgba(239,68,68,0.3)',textAlign:'left',
                      }}>
                        <div style={{fontSize:'32px',filter:'drop-shadow(0 0 8px rgba(239,68,68,0.7))'}}>🧧</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:'12px',fontWeight:800,color:'#ffd700'}}>{lang==='ar'?'مغلف أحمر':'Red Packet'}</div>
                          <div style={{fontSize:'10px',color:'#fca5a5',marginTop:'2px'}}>{msg.rpAmount?.toLocaleString()} 🧠</div>
                          <div style={{fontSize:'9px',color:'rgba(252,165,165,0.7)',marginTop:'2px'}}>{lang==='ar'?'اضغط للاستلام':'Tap to claim'} 🎁</div>
                        </div>
                      </button>
                      <div style={{fontSize:'9px',color:'#374151',marginTop:'2px',textAlign:isMine?'right':'left',paddingLeft:'4px',paddingRight:'4px'}}>{_fmtChatTs(msg.timestamp)}</div>
                    </div>
                  </div>
                );

                return (
                  <div key={msg.id || idx} style={{
                    display: 'flex',
                    flexDirection: isMine ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    gap: '6px',
                    marginBottom: isLastGroup ? '4px' : '1px',
                  }}>
                    {/* Avatar — shown for BOTH sides */}
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
                      {/* Sender name — shown for BOTH, clickable to open mini profile */}
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
                          {isMine && <span style={{fontSize:'8px',color:'#4b5563',fontWeight:500}}> ({lang==='ar'?'أنت':'you'})</span>}
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
                          🗑️ {lang === 'ar' ? 'تم حذف هذه الرسالة' : 'This message was deleted'}
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
                            : <span style={{ fontSize: '30px' }}>{msg.giftEmoji || '🎁'}</span>}
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24' }}>
                            {lang === 'ar' ? (msg.giftNameAr || 'هدية') : (msg.giftNameEn || 'Gift')}
                            {msg.giftQty > 1 && ` ×${msg.giftQty}`}
                          </span>
                          <div style={{ display: 'flex', gap: '6px', fontSize: '10px' }}>
                            <span style={{ color: '#facc15', fontWeight: 700 }}>+{formatCharisma(msg.giftCharisma || 0)} ⭐</span>
                            {msg.giftBonus > 0 && <span style={{ color: '#4ade80', fontWeight: 700 }}>+{msg.giftBonus} 🧠</span>}
                          </div>
                        </div>
                      ) : isImage ? (
                        <div
                          onClick={() => {
                            const w = window.open();
                            w.document.write(`<body style="margin:0;background:#000;display:flex;align-items:center;justify-content:min-height:100vh"><img src="${msg.imageData}" style="max-width:100vw;max-height:100vh;object-fit:contain"></body>`);
                          }}
                          style={{
                            borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                            overflow: 'hidden',
                            border: `1px solid ${isMine ? 'rgba(0,242,255,0.18)' : 'rgba(255,255,255,0.09)'}`,
                            cursor: 'pointer', maxWidth: '200px',
                          }}
                        >
                          <img src={msg.imageData} alt="📷"
                            style={{ display: 'block', maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }} />
                        </div>
                      ) : editingMsgId === msg.id ? (
                        /* ── Edit input ── */
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
                            style={{ background: 'rgba(0,242,255,0.2)', border: '1px solid rgba(0,242,255,0.4)', borderRadius: '8px', padding: '5px 8px', color: '#00f2ff', cursor: 'pointer', fontSize: '12px', fontWeight: 800 }}>✓</button>
                          <button onClick={() => { setEditingMsgId(null); setEditMsgText(''); }}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '5px 8px', color: '#9ca3af', cursor: 'pointer', fontSize: '12px' }}>✕</button>
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
                            {msg.isEdited && <span style={{ marginLeft: '3px', color: '#4b5563', fontStyle: 'italic' }}>{lang === 'ar' ? '(معدّل)' : '(edited)'}</span>}
                            {isMine && <span style={{ marginLeft: '3px', color: '#374151' }}>✓</span>}
                          </div>
                          {/* ✏️ قلم التعديل/الحذف */}
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
                            >✏️</button>
                          )}
                          {/* ── DM evidence select ── */}
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
                            >{reportDMMsg?.id === msg.id ? '✓' : lang === 'ar' ? 'اختر' : 'Select'}</button>
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

            {/* ══ INPUT BAR ══ */}
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
                      {lang === 'ar' ? 'اختر إيموجي' : 'Select Emoji'}
                    </span>
                    <button
                      onClick={() => setShowEmojiPicker(false)}
                      style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}
                    >✕</button>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>

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
                  >😀</button>

                  {/* Image upload */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImg}
                    title={lang === 'ar' ? 'إرسال صورة' : 'Send image'}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px', width: '36px', height: '36px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: uploadingImg ? 'wait' : 'pointer',
                      fontSize: '15px', flexShrink: 0,
                      opacity: uploadingImg ? 0.5 : 1,
                    }}
                  >{uploadingImg ? '⏳' : '🖼️'}</button>

                  {/* 🧧 Red Packet button */}
                  <button
                    onClick={() => {
                      if (typeof setShowDMRedPacket === 'function') setShowDMRedPacket(true);
                    }}
                    title={lang === 'ar' ? 'مغلف أحمر' : 'Red Packet'}
                    style={{
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '10px', width: '36px', height: '36px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontSize: '16px', flexShrink: 0,
                    }}
                  >🧧</button>

                  {/* Text input */}
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={t.typeMessage || (lang === 'ar' ? 'اكتب رسالة... أو @ للمنشن' : 'Type a message... @ to mention')}
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
                      flex: 1, padding: '8px 11px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      color: 'white', fontSize: '13px', outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,242,255,0.3)'}
                  />

                  {/* @ Mention dropdown — self + friend */}
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
                          {p.uid === user?.uid && <span style={{ fontSize:'10px', color:'#6b7280' }}>{lang==='ar'?'(أنت)':'(you)'}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Send button — ONLY lights up when there's text */}
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
                      // ✅ cursor changes ONLY when there's text
                      cursor: canSend ? 'pointer' : 'default',
                      color: canSend ? '#00f2ff' : '#2d3748',
                      fontSize: '15px', flexShrink: 0,
                      transition: 'all 0.2s',
                      // ✅ No glow/box-shadow unless canSend
                      boxShadow: canSend ? '0 0 10px rgba(0,242,255,0.2)' : 'none',
                    }}
                  >➤</button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', fontSize: '11px', color: '#4b5563', padding: '8px' }}>
                  {lang === 'ar' ? 'لا يمكنك الإرسال' : 'Cannot send messages'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🧧 DM Red Packet Modal */}
        {showDMRedPacket && (
          <div style={{position:'fixed',inset:0,zIndex:Z.TOOLTIP,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
            <div style={{width:'100%',maxWidth:'440px',background:'linear-gradient(160deg,#0e0e22,#13122a)',borderRadius:'20px 20px 0 0',border:'1px solid rgba(255,255,255,0.1)',overflow:'hidden'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
                <div style={{fontSize:'14px',fontWeight:800,color:'#ef4444'}}>🧧 {lang==='ar'?'أرسل مغلف أحمر':'Send Red Packet'}</div>
                <button onClick={()=>setShowDMRedPacket(false)} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'20px',cursor:'pointer'}}>✕</button>
              </div>
              <div style={{padding:'14px'}}>
                <div style={{fontSize:'11px',color:'#6b7280',marginBottom:'12px',textAlign:'center'}}>
                  {lang==='ar'?'إلى':'To'}: <span style={{color:'#a78bfa',fontWeight:700}}>{friend?.displayName}</span>
                  {' · '}{lang==='ar'?'رصيدك':'Balance'}: <span style={{color:'#ffd700',fontWeight:700}}>{(currency||0).toLocaleString()} 🧠</span>
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
                          createdAt:firebase.firestore.FieldValue.serverTimestamp(), status:'active',
                        });
                        await usersCollection.doc(user.uid).update({currency:firebase.firestore.FieldValue.increment(-rp.amount)});
                        await chatsCollection.doc(chatId).collection('messages').add({
                          type:'red_packet', rpId:rpRef.id, rpAmount:rp.amount, rpConfigId:rp.id,
                          senderId:user.uid, senderName:currentUser?.displayName||'User', senderPhoto:currentUser?.photoURL||null,
                          text:`🧧 ${rp.amount}`, timestamp:firebase.firestore.FieldValue.serverTimestamp(), maxClaims:1,
                        });
                        // Announce
                        await publicChatCollection.add({
                          type:'red_packet_announce', senderId:user.uid, senderName:currentUser?.displayName||'User',
                          amount:rp.amount, targetType:'dm', targetName:friend.displayName,
                          text:lang==='ar'?`🧧 ${currentUser?.displayName} أرسل مغلف ${rp.amount} إلى ${friend.displayName}`:`🧧 ${currentUser?.displayName} sent a ${rp.amount} packet to ${friend.displayName}`,
                          createdAt:firebase.firestore.FieldValue.serverTimestamp(),
                        });
                        setShowDMRedPacket(false);
                      } catch(e) { console.error(e); }
                      setSendingDMRedPacket(false);
                    }} disabled={sendingDMRedPacket||(currency||0)<rp.amount}
                    style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',borderRadius:'14px',background:rp.bg,border:`1px solid ${rp.border}`,cursor:(currency||0)<rp.amount?'not-allowed':'pointer',opacity:(currency||0)<rp.amount?0.4:1,textAlign:'left'}}>
                      {rp.imageURL?<img src={rp.imageURL} alt="" style={{width:'42px',height:'42px',objectFit:'contain'}}/>:<div style={{width:'42px',height:'42px',borderRadius:'10px',background:`${rp.color}20`,border:`1px solid ${rp.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px'}}>🧧</div>}
                      <div style={{flex:1}}>
                        <div style={{fontSize:'13px',fontWeight:800,color:rp.color}}>{lang==='ar'?rp.name_ar:rp.name_en}</div>
                        <div style={{fontSize:'10px',color:'#9ca3af',marginTop:'2px'}}>{lang==='ar'?rp.desc_ar:rp.desc_en}</div>
                      </div>
                      <div style={{fontSize:'13px',fontWeight:800,color:rp.color}}>{rp.amount.toLocaleString()} 🧠</div>
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

        {/* ── Header 3-dot dropdown — rendered as fixed overlay ── */}
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
                >🗑️ {lang==='ar'?'حذف المحادثة':'Delete Chat'}</button>
                <button onClick={() => { isBlocked ? handleUnblock() : handleBlock(); }}
                  style={{ width:'100%', padding:'10px 13px', borderRadius:'8px', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'9px', fontSize:'13px', fontWeight:700, color: isBlocked?'#4ade80':'#f59e0b', textAlign:'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = isBlocked?'rgba(74,222,128,0.1)':'rgba(245,158,11,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}
                >{isBlocked?`✅ ${lang==='ar'?'إلغاء الحظر':'Unblock'}`:`🚫 ${lang==='ar'?'حظر المستخدم':'Block User'}`}</button>
                <button onClick={() => { setShowHeaderMenu(false); setReportStep('reason'); setReportReason(''); setReportDMMsg(null); setShowReportModal(true); }}
                  style={{ width:'100%', padding:'10px 13px', borderRadius:'8px', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'9px', fontSize:'13px', fontWeight:700, color:'#9ca3af', textAlign:'left' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}
                >🚨 {lang==='ar'?'إبلاغ':'Report'}</button>
              </div>
            </div>
          );
        })()}

        {/* ── Pen message menu — fixed overlay ── */}
        {msgMenuId && (() => {
          const activeMsg = messages.find(m => m.id === msgMenuId);
          if (!activeMsg) return null;
          return (
            <div style={{ position:'fixed', inset:0, zIndex: 9998 }} onClick={() => setMsgMenuId(null)}>
              <div style={{
                position:'fixed',
                bottom: `${msgMenuPos.bottom}px`,
                right: `${msgMenuPos.right}px`,
                background: 'linear-gradient(160deg,#0e0e22,#13122a)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px', padding: '5px',
                zIndex: 9999,
                boxShadow: '0 8px 24px rgba(0,0,0,0.9)',
                minWidth: '130px',
                whiteSpace: 'nowrap',
              }} onClick={e => e.stopPropagation()}>
                <button
                  onClick={e => { e.stopPropagation(); setEditingMsgId(msgMenuId); setEditMsgText(activeMsg.text || ''); setMsgMenuId(null); }}
                  style={{ width:'100%', padding:'7px 10px', borderRadius:'7px', background:'none', border:'none', cursor:'pointer', fontSize:'12px', color:'#00f2ff', fontWeight:700, textAlign:'left', display:'flex', alignItems:'center', gap:'7px' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(0,242,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}
                >✏️ {lang==='ar'?'تعديل':'Edit'}</button>
                <button
                  onClick={e => { e.stopPropagation(); setMsgMenuId(null); handleDeleteMessage(msgMenuId); }}
                  style={{ width:'100%', padding:'7px 10px', borderRadius:'7px', background:'none', border:'none', cursor:'pointer', fontSize:'12px', color:'#f87171', fontWeight:700, textAlign:'left', display:'flex', alignItems:'center', gap:'7px' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}
                >🗑️ {lang==='ar'?'حذف':'Delete'}</button>
              </div>
            </div>
          );
        })()}

        {/* ── Mini Profile Modal — New Design ── */}
        {miniProfile && (
          <div style={{
            position:'fixed', inset:0, zIndex: Z.OVERLAY,
            background:'rgba(0,0,0,0.78)',
            display:'flex', alignItems:'center', justifyContent:'center',
            padding:'16px',
          }} onClick={() => { setMiniProfile(null); setShowMiniMenu(false); }}>
            <div style={{
              width:'100%', maxWidth:'320px',
              borderRadius:'22px', overflow:'hidden',
              background:'#0d0d1f',
              border:'1px solid rgba(255,255,255,0.1)',
              boxShadow:'0 28px 70px rgba(0,0,0,0.95)',
              position:'relative',
            }} onClick={e => e.stopPropagation()}>

              {/* ── Banner ── */}
              <div style={{
                position:'relative', height:'130px',
                background: miniProfile.bannerUrl
                  ? `url(${miniProfile.bannerUrl}) center/cover no-repeat`
                  : 'linear-gradient(135deg,#0a0a2e,#1a1040,#0d1a3a)',
              }}>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(0,0,0,0.25) 0%,rgba(13,13,31,0.72) 100%)' }} />

                {/* 3-dot menu top-right */}
                <div style={{ position:'absolute', top:'10px', right:'10px', zIndex:3 }}>
                  <div style={{ position:'relative' }}>
                    <button
                      onClick={e => { e.stopPropagation(); setShowMiniMenu(v => !v); }}
                      style={{ background:'rgba(0,0,0,0.55)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:'50%', width:'30px', height:'30px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'white', fontSize:'17px', fontWeight:900, lineHeight:1 }}
                    >⋮</button>
                    {showMiniMenu && (
                      <div style={{ position:'absolute', top:'34px', right:0, background:'linear-gradient(160deg,#0e0e22,#13122a)', border:'1px solid rgba(255,255,255,0.13)', borderRadius:'12px', padding:'5px', minWidth:'160px', boxShadow:'0 10px 30px rgba(0,0,0,0.9)', zIndex:5 }}
                        onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setShowMiniMenu(false);
                            setMiniProfile(null);
                            // small delay so miniProfile closes first
                            setTimeout(() => {
                              setReportStep('reason');
                              setReportReason('');
                              setReportDMMsg(null);
                              setShowReportModal(true);
                            }, 50);
                          }}
                          style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', fontWeight:700, color:'#f87171', textAlign:'left' }}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background='none'}
                        >🚨 {lang==='ar'?'إبلاغ':'Report'}</button>
                        {miniProfile.uid !== user?.uid && (
                          <button
                            onClick={async () => { if (isBlocked) { await handleUnblock(); } else { await handleBlock(); } setShowMiniMenu(false); setMiniProfile(null); }}
                            style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', fontWeight:700, color: isBlocked?'#4ade80':'#f59e0b', textAlign:'left' }}
                            onMouseEnter={e => e.currentTarget.style.background = isBlocked?'rgba(74,222,128,0.1)':'rgba(245,158,11,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background='none'}
                          >{isBlocked ? `✅ ${lang==='ar'?'إلغاء الحظر':'Unblock'}` : `🚫 ${lang==='ar'?'حظر':'Block'}`}</button>
                        )}
                        <button
                          onClick={() => { setShowMiniMenu(false); setMiniProfile(null); if(onOpenProfile) onOpenProfile(miniProfile.uid); }}
                          style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', fontWeight:700, color:'#00f2ff', textAlign:'left' }}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(0,242,255,0.08)'}
                          onMouseLeave={e => e.currentTarget.style.background='none'}
                        >👤 {lang==='ar'?'فتح البروفايل':'Open Profile'}</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 💍 Couple ring — top right below 3-dot */}
                {(miniProfile.coupleRingEmoji || miniProfile.coupleRingImageUrl) && (
                  <div style={{ position:'absolute', top:'48px', right:'12px', zIndex:2 }}>
                    {miniProfile.coupleRingImageUrl
                      ? <img src={miniProfile.coupleRingImageUrl} alt="" style={{width:'28px',height:'28px',objectFit:'contain',filter:'drop-shadow(0 0 6px rgba(255,80,150,0.7))'}}/>
                      : <span style={{fontSize:'22px',filter:'drop-shadow(0 0 6px rgba(255,80,150,0.7))'}}>{miniProfile.coupleRingEmoji}</span>}
                  </div>
                )}
              </div>

              {/* ── Badges row — RIGHT side ── */}
              {(miniProfile.topBadges || []).length > 0 && (
                <div style={{ display:'flex', gap:'6px', padding:'8px 16px 0', justifyContent:'flex-end' }}>
                  {(miniProfile.topBadges || []).map((badge, i) => (
                    <div key={i} title={badge.title_en || badge.name_en || ''} style={{
                      width:'32px', height:'32px', borderRadius:'10px',
                      background:'rgba(255,255,255,0.06)',
                      border:'1px solid rgba(255,255,255,0.15)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'17px',
                    }}>
                      {badge.imageUrl
                        ? <img src={badge.imageUrl} alt="" style={{ width:'22px', height:'22px', objectFit:'contain' }} />
                        : (badge.icon || '🏅')
                      }
                    </div>
                  ))}
                </div>
              )}

              {/* ── Profile section ── */}
              <div style={{ padding: (miniProfile.topBadges||[]).length > 0 ? '6px 16px 20px' : '0 16px 20px', position:'relative' }}>
                {/* Avatar + info row */}
                <div style={{ display:'flex', alignItems:'flex-end', gap:'12px', marginTop: (miniProfile.topBadges||[]).length > 0 ? '-48px' : '-36px', marginBottom:'14px' }}>
                  {/* Avatar — click opens full profile */}
                  <div
                    onClick={() => { setMiniProfile(null); setShowMiniMenu(false); if (onOpenProfile) onOpenProfile(miniProfile.uid); }}
                    style={{
                      width:'72px', height:'72px', borderRadius:'50%',
                      border: miniProfile.vipCfg ? `3px solid ${miniProfile.vipCfg.nameColor}` : '3px solid #0d0d1f',
                      overflow:'hidden', background:'#1a1a2e',
                      boxShadow: miniProfile.vipCfg ? `0 0 14px ${miniProfile.vipCfg.nameColor}88, 0 4px 16px rgba(0,0,0,0.6)` : '0 4px 16px rgba(0,0,0,0.6)',
                      flexShrink:0, zIndex:2, cursor:'pointer', position:'relative',
                    }}
                  >
                    {miniProfile.photo
                      ? <img src={miniProfile.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px' }}>😎</div>
                    }
                  </div>
                  {/* Text info */}
                  <div style={{ flex:1, paddingBottom:'4px', minWidth:0 }}>
                    {/* Name row: Name + VIP badge + gender */}
                    <div
                      onClick={() => { setMiniProfile(null); setShowMiniMenu(false); if (onOpenProfile) onOpenProfile(miniProfile.uid); }}
                      style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px', cursor:'pointer', flexWrap:'wrap' }}
                    >
                      {/* VIP badge BEFORE gender, right after name */}
                      {miniProfile.vipCfg && (
                        <span style={{ fontSize:'8px', fontWeight:900, background:miniProfile.vipCfg.nameColor, color:'#000', padding:'1px 4px', borderRadius:'3px', flexShrink:0 }}>VIP{miniProfile.vipLevel}</span>
                      )}
                      <span style={{ fontSize:'16px', fontWeight:900, color:'#00f2ff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textDecoration:'underline dotted rgba(0,242,255,0.4)' }}>{miniProfile.name}</span>
                      {miniProfile.gender && <span style={{ fontSize:'13px', flexShrink:0 }}>{miniProfile.gender==='male'?'♂️':'♀️'}</span>}
                    </div>
                    {/* Charisma + family sign */}
                    <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap', marginBottom:'5px' }}>
                      {(() => {
                        if (typeof CHARISMA_LEVELS === 'undefined') return null;
                        const ch = miniProfile.charisma || 0;
                        let lvl = CHARISMA_LEVELS[0];
                        for (let ci = CHARISMA_LEVELS.length - 1; ci >= 0; ci--) {
                          if (ch >= CHARISMA_LEVELS[ci].threshold) { lvl = CHARISMA_LEVELS[ci]; break; }
                        }
                        return lvl.iconUrl
                          ? <img src={lvl.iconUrl} alt="" style={{ height:'22px', objectFit:'contain' }} />
                          : <span style={{ fontSize:'15px' }}>{lvl.icon}</span>;
                      })()}
                      {/* Family Sign — show image with tag overlaid if image available */}
                      {miniProfile.familyTag && (() => {
                        const signLevel = miniProfile.familySignLevel;
                        let signImgURL = miniProfile.familySignImageURL || null;
                        if (!signImgURL && signLevel && typeof FAMILY_SIGN_IMAGES !== 'undefined') {
                          const cfg = FAMILY_SIGN_IMAGES.find(s => s.level === signLevel);
                          signImgURL = cfg?.imageURL || null;
                        }
                        if (signImgURL) {
                          const imgW = 44 + ((miniProfile.familyTag.length || 3) * 6);
                          const imgH = Math.round(imgW * 0.55);
                          const fontSize = (miniProfile.familyTag.length||3) <= 3 ? 11 : (miniProfile.familyTag.length||3) === 4 ? 10 : 9;
                          const signColor = miniProfile.familySignColor || '#00f2ff';
                          const hasGlow = (signLevel||0) >= 4;
                          return (
                            <span style={{position:'relative',display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0,width:`${imgW}px`,height:`${imgH}px`,filter:hasGlow?`drop-shadow(0 0 6px ${signColor}cc)`:'none'}}>
                              <img src={signImgURL} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain'}}/>
                              <span style={{position:'relative',zIndex:1,fontSize:`${fontSize}px`,fontWeight:900,fontStyle:'italic',letterSpacing:'1.5px',color:'#fff',textShadow:'0 0 6px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.7)'}}>{miniProfile.familyTag}</span>
                            </span>
                          );
                        }
                        return (
                          <span style={{ fontSize:'10px', fontWeight:800, color:'#00f2ff', background:'rgba(0,242,255,0.15)', border:'1px solid rgba(0,242,255,0.3)', borderRadius:'6px', padding:'2px 8px' }}>{miniProfile.familyTag}</span>
                        );
                      })()}
                    </div>
                    {/* ID */}
                    {miniProfile.customId && (
                      <div style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'#6b7280' }}>
                        <span>ID: {miniProfile.customId}</span>
                        <button onClick={() => navigator.clipboard?.writeText(miniProfile.customId)}
                          style={{ background:'none', border:'none', cursor:'pointer', fontSize:'12px', color:'#4b5563', padding:'0 2px', lineHeight:1 }}>⎘</button>
                      </div>
                    )}
                    {miniProfile.loading && <div style={{ fontSize:'11px', color:'#4b5563', fontStyle:'italic' }}>⏳</div>}
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display:'flex', borderTop:'1px solid rgba(255,255,255,0.07)', borderBottom:'1px solid rgba(255,255,255,0.07)', margin:'0 0 16px', padding:'12px 0' }}>
                  <div style={{ flex:1, textAlign:'center' }}>
                    <div style={{ fontSize:'22px', fontWeight:900, color:'white', lineHeight:1 }}>{miniProfile.gamesPlayed ?? 0}</div>
                    <div style={{ fontSize:'10px', color:'#6b7280', marginTop:'3px' }}>{lang==='ar'?'مباريات':'Games'}</div>
                  </div>
                  <div style={{ width:'1px', background:'rgba(255,255,255,0.08)', margin:'4px 0' }} />
                  <div style={{ flex:1, textAlign:'center' }}>
                    {(() => {
                      const rate = miniProfile.winRate ?? 0;
                      const col = rate >= 70 ? '#10b981' : rate >= 50 ? '#facc15' : '#f97316';
                      return <>
                        <div style={{ fontSize:'22px', fontWeight:900, color:col, lineHeight:1 }}>{rate}%</div>
                        <div style={{ fontSize:'10px', color:'#6b7280', marginTop:'3px' }}>{lang==='ar'?'نسبة الفوز':'Winning Rate'}</div>
                      </>;
                    })()}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display:'flex', gap:'10px' }}>
                  {miniProfile.uid !== user?.uid && !miniProfile.isFriend && (
                    <button onClick={async () => {
                        try {
                          await usersCollection.doc(miniProfile.uid).update({ friendRequests: firebase.firestore.FieldValue.arrayUnion(user.uid) });
                          setMiniProfile(p => ({ ...p, isFriend: true }));
                        } catch(e) {}
                      }}
                      style={{ flex:1, padding:'11px', borderRadius:'50px', background:'linear-gradient(135deg,rgba(0,242,255,0.22),rgba(0,180,255,0.18))', border:'1px solid rgba(0,242,255,0.4)', color:'#00f2ff', fontSize:'13px', fontWeight:800, cursor:'pointer' }}>
                      {lang==='ar'?'إضافة':'Add'}
                    </button>
                  )}
                  {miniProfile.uid !== user?.uid && miniProfile.isFriend && (
                    <div style={{ flex:1, padding:'11px', borderRadius:'50px', background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.3)', color:'#10b981', fontSize:'13px', fontWeight:800, textAlign:'center' }}>
                      ✅ {lang==='ar'?'صديق':'Friends'}
                    </div>
                  )}
                  {miniProfile.uid !== user?.uid && onSendGift && (
                    <button onClick={() => { setMiniProfile(null); setShowMiniMenu(false); setShowGiftModal(true); }}
                      style={{ flex:1, padding:'11px', borderRadius:'50px', background:'linear-gradient(135deg,rgba(255,80,150,0.26),rgba(236,72,153,0.18))', border:'1px solid rgba(255,80,150,0.4)', color:'#f472b6', fontSize:'13px', fontWeight:800, cursor:'pointer' }}>
                      {lang==='ar'?'إرسال هدية':'Send Gift'}
                    </button>
                  )}
                  {/* Self — show "You" + open full profile */}
                  {miniProfile.uid === user?.uid && (
                    <button onClick={() => { setMiniProfile(null); setShowMiniMenu(false); if(onOpenProfile) onOpenProfile(miniProfile.uid); }}
                      style={{ flex:1, padding:'11px', borderRadius:'50px', background:'rgba(0,242,255,0.08)', border:'1px solid rgba(0,242,255,0.25)', color:'#00f2ff', fontSize:'13px', fontWeight:700, cursor:'pointer', textAlign:'center' }}>
                      👤 {lang==='ar'?'بروفايلي':'My Profile'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Chat Confirm Modal ── */}
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
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🗑️</div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: '#f87171', marginBottom: '8px' }}>
                {lang === 'ar' ? 'حذف المحادثة' : 'Delete Chat'}
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px', lineHeight: 1.6 }}>
                {lang === 'ar'
                  ? 'سيتم حذف كل الرسائل نهائياً. هل أنت متأكد؟'
                  : 'All messages will be permanently deleted. Are you sure?'}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowDeleteChatConfirm(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={handleDeleteChat} disabled={deletingChat}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg,#dc2626,#991b1b)', border: 'none', color: 'white', fontSize: '13px', fontWeight: 800, cursor: deletingChat ? 'wait' : 'pointer', opacity: deletingChat ? 0.7 : 1 }}>
                  {deletingChat ? '⏳' : `🗑️ ${lang === 'ar' ? 'حذف' : 'Delete'}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Report Modal ── */}
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
                <span style={{ fontSize: '22px' }}>🚨</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#f87171' }}>
                    {lang === 'ar' ? 'إبلاغ عن مستخدم' : 'Report User'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{friend?.displayName}</div>
                </div>
                {reportStep !== 'done' && (
                  <button onClick={() => setShowReportModal(false)}
                    style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                )}
              </div>

              {/* Step: reason */}
              {reportStep === 'reason' && (
                <>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '10px' }}>
                    {lang === 'ar' ? 'سبب البلاغ:' : 'Reason for report:'}
                  </div>
                  {[
                    { en: 'Harassment / Bullying', ar: 'مضايقة / تنمر' },
                    { en: 'Inappropriate content', ar: 'محتوى غير لائق' },
                    { en: 'Spam / Advertising', ar: 'سبام / إعلانات' },
                    { en: 'Fake account', ar: 'حساب مزيف' },
                    { en: 'Other', ar: 'أخرى' },
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
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button onClick={() => setReportStep('dm')} disabled={!reportReason}
                      style={{ flex: 1, padding: '10px', borderRadius: '10px', background: reportReason ? 'linear-gradient(135deg,rgba(239,68,68,0.3),rgba(185,28,28,0.2))' : 'rgba(255,255,255,0.03)', border: reportReason ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.06)', color: reportReason ? '#f87171' : '#374151', fontSize: '12px', fontWeight: 700, cursor: reportReason ? 'pointer' : 'not-allowed' }}>
                      {lang === 'ar' ? 'التالي →' : 'Next →'}
                    </button>
                  </div>
                </>
              )}

              {/* Step: DM evidence */}
              {reportStep === 'dm' && (
                <>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
                    {lang === 'ar' ? 'أضف دليلاً من الرسائل (اختياري):' : 'Add message evidence (optional):'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '12px', lineHeight: 1.5 }}>
                    {lang === 'ar'
                      ? 'أغلق هذه النافذة واضغط على "اختر" بجانب الرسالة التي تريد إرفاقها كدليل، ثم عد هنا.'
                      : 'Close this dialog and tap "Select" next to the message you want as evidence, then come back.'}
                  </div>
                  {reportDMMsg && (
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px', marginBottom: '12px', fontSize: '12px', color: '#fca5a5' }}>
                      📎 {lang === 'ar' ? 'دليل مرفق:' : 'Evidence attached:'} "{reportDMMsg.text?.slice(0, 60)}{reportDMMsg.text?.length > 60 ? '...' : ''}"
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setReportStep('reason')}
                      style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      ← {lang === 'ar' ? 'رجوع' : 'Back'}
                    </button>
                    <button onClick={handleSubmitReport} disabled={submittingReport}
                      style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg,rgba(239,68,68,0.35),rgba(185,28,28,0.25))', border: '1px solid rgba(239,68,68,0.5)', color: '#f87171', fontSize: '12px', fontWeight: 800, cursor: submittingReport ? 'wait' : 'pointer', opacity: submittingReport ? 0.7 : 1 }}>
                      {submittingReport ? '⏳' : `🚨 ${lang === 'ar' ? 'إرسال البلاغ' : 'Submit Report'}`}
                    </button>
                  </div>
                </>
              )}

              {/* Step: done */}
              {reportStep === 'done' && (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#4ade80', marginBottom: '8px' }}>
                    {lang === 'ar' ? 'تم إرسال البلاغ' : 'Report Submitted'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '20px', lineHeight: 1.6 }}>
                    {lang === 'ar'
                      ? 'شكراً لمساعدتنا. سيتم مراجعة البلاغ قريباً وستصلك رسالة من المحقق.'
                      : 'Thank you. Your report will be reviewed soon and you will receive a message from The Detective.'}
                  </div>
                  <button onClick={() => setShowReportModal(false)}
                    style={{ padding: '10px 28px', borderRadius: '10px', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                    {lang === 'ar' ? 'إغلاق' : 'Close'}
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

// 📅 LOGIN REWARDS COMPONENT
