(function () {
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
  var compressImageToBase64 = (file) => new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = (e) => {
      var img = new Image();
      img.onload = () => {
        var MAX = 400;
        var w = img.width,h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) {h = Math.round(h * MAX / w);w = MAX;} else
          {w = Math.round(w * MAX / h);h = MAX;}
        }
        var canvas = document.createElement('canvas');
        canvas.width = w;canvas.height = h;
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
  var _chatCacheKey = (chatId) => `pro_spy_chat_cache_${chatId}`;
  var _saveChatCache = (chatId, msgs) => {
    try {localStorage.setItem(_chatCacheKey(chatId), JSON.stringify(msgs.slice(-80)));} catch {}
  };
  var _loadChatCache = (chatId) => {
    try {var r = localStorage.getItem(_chatCacheKey(chatId));return r ? JSON.parse(r) : [];}
    catch {return [];}
  };

  // ── Format timestamp ──
  var _fmtChatTs = (ts) => {
    if (!ts) return '';
    var d;
    if (ts?.toDate) d = ts.toDate();else
    if (ts?.seconds) d = new Date(ts.seconds * 1000);else
    if (typeof ts === 'number') d = new Date(ts);else
    d = new Date(ts);
    if (!d || isNaN(d.getTime())) return '';
    var now = new Date();
    var diff = now - d;
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  var PrivateChatModal = ({
    show, onClose, friend, currentUser, user, lang,
    onSendNotification, onSendGift, currency,
    friendsData, onOpenProfile
  }) => {
    var t = TRANSLATIONS[lang];
    var [messages, setMessages] = useState([]);
    var [newMsg, setNewMsg] = useState('');
    var [sending, setSending] = useState(false);
    var [showGiftModal, setShowGiftModal] = useState(false);
    var [showEmojiPicker, setShowEmojiPicker] = useState(false);
    var [isBlocked, setIsBlocked] = useState(false);
    var [blockedByTarget, setBlockedByTarget] = useState(false);
    var [friendTyping, setFriendTyping] = useState(false);
    var [uploadingImg, setUploadingImg] = useState(false);
    // ── 3-dot menu ──
    var [showHeaderMenu, setShowHeaderMenu] = useState(false);
    // ── Delete chat confirm ──
    var [showDeleteChatConfirm, setShowDeleteChatConfirm] = useState(false);
    var [deletingChat, setDeletingChat] = useState(false);
    // ── Report modal ──
    var [showReportModal, setShowReportModal] = useState(false);
    var [reportStep, setReportStep] = useState('reason');
    var [reportReason, setReportReason] = useState('');
    var [reportDMMsg, setReportDMMsg] = useState(null);
    var [submittingReport, setSubmittingReport] = useState(false);
    // ── Message edit/delete ──
    var [editingMsgId, setEditingMsgId] = useState(null);
    var [editMsgText, setEditMsgText] = useState('');
    var [msgMenuId, setMsgMenuId] = useState(null); // قائمة القلم للرسالة
    // ── @ Mention ──
    var [showMentionSuggestion, setShowMentionSuggestion] = useState(false);
    // ── Mini Profile ──
    var [miniProfile, setMiniProfile] = useState(null);
    var [loadingMiniProfile, setLoadingMiniProfile] = useState(false);
    var [showMiniMenu, setShowMiniMenu] = useState(false);
    // ── Pen menu position (fixed) ──
    var [msgMenuPos, setMsgMenuPos] = useState({ top: 0, right: 0 });
    // ── 3-dot header button rect ──
    var [menuBtnRect, setMenuBtnRect] = useState(null);
    // ── 🧧 DM Red Packet ──
    var [showDMRedPacket, setShowDMRedPacket] = useState(false);
    var [sendingDMRedPacket, setSendingDMRedPacket] = useState(false);

    var messagesEndRef = useRef(null);
    var inputRef = useRef(null);
    var fileInputRef = useRef(null);
    var typingTimerRef = useRef(null);
    var headerMenuBtnRef = useRef(null);

    // VIP level helpers
    var myVipLevel = useMemo(() => {try {return window.getVIPLevel ? window.getVIPLevel(currentUser) || 0 : 0;} catch {return 0;}}, [currentUser]);
    var friendVipLevel = useMemo(() => {try {return window.getVIPLevel ? window.getVIPLevel(friend) || 0 : 0;} catch {return 0;}}, [friend]);
    var isMyVIP10 = myVipLevel >= 10;
    var isFriendVIP10 = friendVipLevel >= 10;
    // Typing indicator available when EITHER party is VIP10
    var typingEnabled = isMyVIP10 || isFriendVIP10;

    var chatId = friend && user ? [user.uid, friend.uid].sort().join('_') : null;

    // ── Blocked check ──
    useEffect(() => {
      if (!show || !friend || !currentUser) return;
      setIsBlocked((currentUser.blockedUsers || []).includes(friend.uid));
      usersCollection.doc(friend.uid).get().then((doc) => {
        if (doc.exists) setBlockedByTarget((doc.data().blockedUsers || []).includes(user.uid));
      }).catch(() => {});
    }, [show, friend?.uid, currentUser?.uid, user?.uid]);

    // ── Messages: ALWAYS from Firestore (real-time for both parties) ──
    useEffect(() => {
      if (!show || !chatId) return;

      // Show cache immediately while Firestore loads
      var cached = _loadChatCache(chatId);
      if (cached.length > 0) setMessages(cached);

      var unsub = chatsCollection.doc(chatId).collection('messages').
      limit(100).
      onSnapshot((snap) => {
        var msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        msgs.sort((a, b) => {
          var tA = a.timestamp?.toMillis?.() || (a.timestamp?.seconds || 0) * 1000 || (typeof a.timestamp === 'number' ? a.timestamp : 0);
          var tB = b.timestamp?.toMillis?.() || (b.timestamp?.seconds || 0) * 1000 || (typeof b.timestamp === 'number' ? b.timestamp : 0);
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
      var unsub = chatsCollection.doc(chatId).onSnapshot((snap) => {
        if (snap.exists) {
          setFriendTyping(!!snap.data()?.typing?.[friend.uid]);
        }
      }, () => {});
      return unsub;
    }, [show, chatId, friend?.uid, typingEnabled]);

    // ── Auto-scroll to bottom ──
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, friendTyping]);

    // ── Typing indicator write (when typingEnabled) ──
    var _setTyping = (val) => {
      if (!typingEnabled || !chatId || !user) return;
      chatsCollection.doc(chatId).set({ typing: { [user.uid]: val } }, { merge: true }).catch(() => {});
    };
    var handleTypingChange = () => {
      _setTyping(true);
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => _setTyping(false), 2500);
    };
    var clearTypingStatus = () => {
      clearTimeout(typingTimerRef.current);
      _setTyping(false);
    };

    // ── Send text message ──
    var handleSend = async () => {
      if (!newMsg.trim() || sending || isBlocked || blockedByTarget) return;
      clearTypingStatus();
      setSending(true);
      var text = newMsg.trim();
      setNewMsg('');
      try {
        var msgData = {
          senderId: user.uid,
          senderName: currentUser?.displayName || 'User',
          senderPhoto: currentUser?.photoURL || null,
          senderVipLevel: myVipLevel,
          type: 'text',
          text,
          timestamp: TS()
        };
        // ✅ Always save to Firestore so the other person sees it
        await chatsCollection.doc(chatId).collection('messages').add(msgData);
        await chatsCollection.doc(chatId).set({
          members: [user.uid, friend.uid],
          lastMessage: text,
          timestamp: TS(),
          [`unread.${friend.uid}`]: firebase.firestore.FieldValue.increment(1)
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
    var handleImageSelect = async (e) => {
      var file = e.target.files?.[0];
      if (!file || isBlocked || blockedByTarget || !file.type.startsWith('image/')) return;
      setUploadingImg(true);
      try {
        var base64 = await compressImageToBase64(file);
        var msgData = {
          senderId: user.uid,
          senderName: currentUser?.displayName || 'User',
          senderPhoto: currentUser?.photoURL || null,
          senderVipLevel: myVipLevel,
          type: 'image',
          imageData: base64,
          text: '📷',
          timestamp: TS()
        };
        await chatsCollection.doc(chatId).collection('messages').add(msgData);
        await chatsCollection.doc(chatId).set({
          members: [user.uid, friend.uid],
          lastMessage: '📷 Photo',
          timestamp: TS(),
          [`unread.${friend.uid}`]: firebase.firestore.FieldValue.increment(1)
        }, { merge: true });
        playSound('click');
      } catch (err) {console.error('Image send error:', err);}
      setUploadingImg(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    var handleEmojiSelect = (emoji) => {
      setNewMsg((p) => p + emoji);
      setShowEmojiPicker(false);
      inputRef.current?.focus();
    };

    var handleSendGiftToChat = async (gift, targetUser, qty = 1) => {
      if (!onSendGift || isBlocked || blockedByTarget) return;
      await onSendGift(gift, targetUser, qty);
      setShowGiftModal(false);
    };

    // ── حذف الشات ──
    var handleDeleteChat = async () => {
      if (!chatId || deletingChat) return;
      setDeletingChat(true);
      try {
        // حذف كل الرسائل
        var msgsSnap = await chatsCollection.doc(chatId).collection('messages').limit(500).get();
        var batch = db.batch();
        msgsSnap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit().catch(() => {});
        // حذف الـ chat doc
        await chatsCollection.doc(chatId).delete().catch(() => {});
        setShowDeleteChatConfirm(false);
        onClose();
      } catch (e) {console.error('Delete chat error:', e);}
      setDeletingChat(false);
    };

    // ── حظر المستخدم ──
    var handleBlock = async () => {
      if (!user || !friend) return;
      try {
        await usersCollection.doc(user.uid).update({
          blockedUsers: firebase.firestore.FieldValue.arrayUnion(friend.uid)
        });
        setIsBlocked(true);
        setShowHeaderMenu(false);
      } catch (e) {console.error('Block error:', e);}
    };

    // ── إلغاء الحظر ──
    var handleUnblock = async () => {
      if (!user || !friend) return;
      try {
        await usersCollection.doc(user.uid).update({
          blockedUsers: firebase.firestore.FieldValue.arrayRemove(friend.uid)
        });
        setIsBlocked(false);
        setShowHeaderMenu(false);
      } catch (e) {console.error('Unblock error:', e);}
    };

    // ── فتح ميني بروفايل لأي شخص ──
    var openMiniProfile = async (uid) => {
      if (!uid) return;
      setLoadingMiniProfile(true);
      setShowMiniMenu(false);
      setMiniProfile({ uid, name: '...', photo: null, loading: true });
      var data = await fetchMiniProfileData(uid, currentUser?.friends || []);
      if (data) setMiniProfile(data);
      setLoadingMiniProfile(false);
    };

    // ── تعديل رسالة ──
    var handleEditMessage = async (msgId, newText) => {
      if (!newText.trim() || !chatId) return;
      try {
        await chatsCollection.doc(chatId).collection('messages').doc(msgId).update({
          text: newText.trim(),
          editedAt: TS(),
          isEdited: true
        });
        setEditingMsgId(null);
        setEditMsgText('');
      } catch (e) {console.error('Edit message error:', e);}
    };

    // ── حذف رسالة ──
    var handleDeleteMessage = async (msgId) => {
      if (!chatId) return;
      try {
        // استبدال الرسالة بـ "تم حذف هذه الرسالة"
        await chatsCollection.doc(chatId).collection('messages').doc(msgId).update({
          text: lang === 'ar' ? '🗑️ تم حذف هذه الرسالة' : '🗑️ This message was deleted',
          isDeleted: true,
          deletedAt: TS(),
          imageData: firebase.firestore.FieldValue.delete(),
          type: 'deleted'
        });
      } catch (e) {console.error('Delete message error:', e);}
    };

    // ── إرسال بلاغ مع DM كدليل ──
    var handleSubmitReport = async () => {
      if (!reportReason.trim() || !user || !friend) return;
      setSubmittingReport(true);
      try {
        await reportsCollection.add({
          reporterUID: user.uid,
          reporterName: currentUser?.displayName || 'User',
          reportedUID: friend.uid,
          reportedName: friend.displayName || 'User',
          reason: reportReason.trim(),
          evidence: reportDMMsg ? {
            msgId: reportDMMsg.id,
            text: reportDMMsg.text,
            sender: reportDMMsg.senderName,
            time: reportDMMsg.timestamp
          } : null,
          type: 'user',
          resolved: false,
          createdAt: TS()
        });
        // إشعار للمستخدم بإرسال البلاغ
        await botChatsCollection.add({
          botId: 'detective_bot',
          toUserId: user.uid,
          type: 'report_submitted',
          message: lang === 'ar' ?
          `🕵️ تم استلام بلاغك ضد "${friend.displayName || 'المستخدم'}".\nسيقوم فريق الإدارة بمراجعة البلاغ والتحقيق فيه.\n\nشكراً لمساعدتنا في الحفاظ على سلامة المجتمع.` :
          `🕵️ Your report against "${friend.displayName || 'user'}" has been received.\nOur moderation team will review and investigate.\n\nThank you for helping keep the community safe.`,
          read: false,
          timestamp: TS()
        }).catch(() => {});
        setReportStep('done');
      } catch (e) {console.error('Report error:', e);}
      setSubmittingReport(false);
    };

    if (!show || !friend) return null;

    // ── Online status ──
    var friendInfo = friendsData?.find((f) => f.id === friend.uid) || friend;
    var isOnline = friendInfo?.isOnline || friendInfo?.onlineStatus === 'online';
    var isAway = friendInfo?.onlineStatus === 'away';
    var statusColor = isOnline ? '#22c55e' : isAway ? '#f59e0b' : '#6b7280';
    var statusLabel = isOnline ?
    lang === 'ar' ? 'متصل الآن' : 'Online' :
    isAway ? lang === 'ar' ? 'بعيد' : 'Away' :
    lang === 'ar' ? 'غير متصل' : 'Offline';

    var canSend = !sending && newMsg.trim().length > 0 && !isBlocked && !blockedByTarget;

    return (/*#__PURE__*/
      React.createElement(React.Fragment, null, /*#__PURE__*/

      React.createElement("input", { ref: fileInputRef, type: "file", accept: "image/*",
        style: { display: 'none' }, onChange: handleImageSelect }), /*#__PURE__*/

      React.createElement("div", { className: "modal-overlay", onClick: onClose, style: { padding: "4px" } }, /*#__PURE__*/
      React.createElement("div", { onClick: (e) => e.stopPropagation(), style: {
          display: 'flex', flexDirection: 'column',
          width: '100%', maxWidth: 'min(420px, calc(100vw - 8px))',
          height: 'min(92vh, 680px)',
          minHeight: '400px',
          background: 'linear-gradient(160deg,rgba(5,5,18,0.99),rgba(9,8,26,0.99))',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 28px 70px rgba(0,0,0,0.88), 0 0 30px rgba(0,242,255,0.06)',
          margin: 'auto', boxSizing: 'border-box'
        } }, /*#__PURE__*/


      React.createElement("div", { style: {
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '11px 14px',
          background: 'linear-gradient(135deg,rgba(7,7,22,1),rgba(15,9,32,1))',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0
        } }, /*#__PURE__*/

      React.createElement("div", {
        style: { position: 'relative', flexShrink: 0, cursor: 'pointer' },
        onClick: () => onOpenProfile && onOpenProfile(friend.uid) }, /*#__PURE__*/

      React.createElement(window.AvatarWithFrame, {
        photoURL: friend.photoURL,
        equipped: friend.equipped,
        size: 'xs',
        lang: lang,
        onClick: () => onOpenProfile && onOpenProfile(friend.uid)
      }
      ), /*#__PURE__*/
      React.createElement("div", { style: {
          position: 'absolute', bottom: '1px', right: '1px',
          width: '10px', height: '10px', borderRadius: '50%',
          background: statusColor, border: '1.5px solid rgba(5,5,18,1)'
        } })
      ), /*#__PURE__*/


      React.createElement("div", {
        style: { flex: 1, minWidth: 0, cursor: 'pointer' },
        onClick: () => onOpenProfile && onOpenProfile(friend.uid) }, /*#__PURE__*/

      React.createElement("div", { style: {
          fontSize: '13px', fontWeight: 800, color: 'white',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          display: 'flex', alignItems: 'center', gap: '5px'
        } },
      friend.displayName || 'User',
      friend.vip?.isActive && window.getVIPLevel && window.getVIPLevel(friend) > 0 && VIP_CONFIG && /*#__PURE__*/
      React.createElement("span", { style: {
          fontSize: '8px', fontWeight: 900,
          background: window.getVIPConfig(window.getVIPLevel(friend))?.nameColor || '#7c3aed',
          color: '#000', padding: '1px 4px', borderRadius: '3px', flexShrink: 0
        } }, "VIP", window.getVIPLevel(friend))

      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '10px', color: friendTyping ? '#00f2ff' : statusColor, fontWeight: 600 } },
      friendTyping ? /*#__PURE__*/
      React.createElement("span", { style: { fontStyle: 'italic' } }, lang === 'ar' ? '✏️ يكتب...' : '✏️ typing...') : /*#__PURE__*/
      React.createElement("span", null, /*#__PURE__*/React.createElement("span", { style: { fontSize: '7px' } }, "\u25CF "), statusLabel)

      )
      ), /*#__PURE__*/


      React.createElement("div", { style: { display: 'flex', gap: '5px', alignItems: 'center', flexShrink: 0 } },

      isMyVIP10 && /*#__PURE__*/
      React.createElement("div", { style: {
          fontSize: '8px', color: '#a78bfa',
          background: 'rgba(167,139,250,0.1)',
          padding: '2px 5px', borderRadius: '4px',
          border: '1px solid rgba(167,139,250,0.22)'
        } }, "\u2601\uFE0F ", lang === 'ar' ? 'محفوظ' : 'Saved'), /*#__PURE__*/


      React.createElement("button", {
        onClick: () => setShowGiftModal(true),
        disabled: isBlocked || blockedByTarget,
        style: {
          background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.18)',
          borderRadius: '8px', padding: '5px 7px', fontSize: '14px',
          cursor: isBlocked || blockedByTarget ? 'not-allowed' : 'pointer',
          opacity: isBlocked || blockedByTarget ? 0.4 : 1
        } },
      "\uD83C\uDF81"), /*#__PURE__*/


      React.createElement("button", {
        ref: headerMenuBtnRef,
        onClick: (e) => {e.stopPropagation();setShowHeaderMenu((v) => !v);},
        style: {
          background: showHeaderMenu ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '8px', width: '30px', height: '30px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#9ca3af', fontSize: '18px', fontWeight: 900,
          letterSpacing: '-1px', lineHeight: 1
        } },
      "\u22EE"), /*#__PURE__*/

      React.createElement("button", {
        onClick: () => {setShowHeaderMenu(false);onClose();},
        style: {
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '8px', width: '30px', height: '30px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#9ca3af', fontSize: '14px'
        } },
      "\u2715")
      )
      ),


      (isBlocked || blockedByTarget) && /*#__PURE__*/
      React.createElement("div", { style: {
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
          borderRadius: '8px', margin: '8px 12px 0',
          padding: '7px 12px', fontSize: '11px', color: '#f87171',
          display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0
        } }, "\uD83D\uDEAB ",
      isBlocked ?
      lang === 'ar' ? 'حظرت هذا المستخدم. إلغاء الحظر للمراسلة.' : 'You blocked this user. Unblock to message.' :
      lang === 'ar' ? 'هذا المستخدم حظرك. لا يمكنك الإرسال.' : 'This user has blocked you.'
      ), /*#__PURE__*/



      React.createElement("div", { style: {
          flex: 1, overflowY: 'auto', padding: '12px 10px',
          display: 'flex', flexDirection: 'column', gap: '5px',
          background: 'linear-gradient(180deg,rgba(5,5,16,0.98),rgba(8,8,22,0.98))'
        } },
      messages.length === 0 ? /*#__PURE__*/
      React.createElement("div", { style: {
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '8px', opacity: 0.35, paddingTop: '50px'
        } }, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '40px' } }, "\uD83D\uDCAC"), /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '12px', color: '#6b7280' } },
      lang === 'ar' ? 'لا توجد رسائل بعد' : 'No messages yet'
      )
      ) :
      messages.map((msg, idx) => {
        var isMine = msg.senderId === user?.uid;
        var isGift = msg.type === 'gift';
        var isImage = msg.type === 'image';
        var isRedPacket = msg.type === 'red_packet';
        var prevSender = idx > 0 ? messages[idx - 1]?.senderId : null;
        var nextSender = idx < messages.length - 1 ? messages[idx + 1]?.senderId : null;
        // show avatar for BOTH mine and others — on first message of each group
        var showAvatar = prevSender !== msg.senderId;
        var showName = prevSender !== msg.senderId;
        var isLastGroup = nextSender !== msg.senderId;
        // Get VIP config for this message sender
        var msgVipLevel = msg.senderVipLevel || 0;
        var msgVipCfg = window.getVIPConfig(msgVipLevel);

        // 🧧 Red Packet bubble
        if (isRedPacket) {
          var isClaimed = msg.claimedBy?.includes(user?.uid) || msg.rpStatus === 'exhausted';
          return (/*#__PURE__*/
            React.createElement("div", { key: msg.id || idx, style: { display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '6px', marginBottom: isLastGroup ? '4px' : '1px' } }, /*#__PURE__*/

            React.createElement("div", { style: { width: '32px', height: '32px', flexShrink: 0, alignSelf: 'flex-end', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
            showAvatar ? /*#__PURE__*/
            React.createElement(window.AvatarWithFrame, {
              photoURL: isMine ? (currentUser?.photoURL || currentUser?.photo) : (msg.senderPhoto || msg.senderPhotoURL),
              equipped: isMine ? currentUser?.equipped : msg.senderEquipped,
              size: 'xs',
              lang: lang,
              onClick: () => openMiniProfile(msg.senderId)
            }) : /*#__PURE__*/
            React.createElement("div", { style: { width: '32px', height: '32px' } })
            ), /*#__PURE__*/
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', maxWidth: '72%', gap: '2px' } },
            showName && /*#__PURE__*/
            React.createElement("div", { onClick: () => openMiniProfile(msg.senderId), style: { fontSize: '10px', fontWeight: 700, color: isMine ? '#00f2ff' : '#a78bfa', paddingLeft: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' } },
            msgVipCfg && /*#__PURE__*/React.createElement("span", { style: { fontSize: '7px', fontWeight: 900, background: msgVipCfg.nameColor, color: '#000', padding: '0 3px', borderRadius: '2px' } }, "VIP", msgVipLevel),
            isMine ? currentUser?.displayName || msg.senderName || 'You' : msg.senderName,
            isMine && /*#__PURE__*/React.createElement("span", { style: { fontSize: '8px', color: '#4b5563' } }, " (", lang === 'ar' ? 'أنت' : 'you', ")")
            ), /*#__PURE__*/

            React.createElement("button", { onClick: async () => {
                if (isClaimed) return;
                if (!msg.rpId || !user) return;
                try {
                  var rpDoc = await redPacketsCollection.doc(msg.rpId).get();
                  if (!rpDoc.exists) {return;}
                  var rp = rpDoc.data();
                  // ❌ المرسل لا يستطيع استلام مغلفه في البرايفت
                  if (rp.senderId === user.uid) {
                    if (window.showToast) window.showToast(lang === 'ar' ? '❌ لا يمكنك استلام مغلفك الخاص' : '❌ You cannot claim your own packet');
                    else console.warn('[Chat] Cannot claim own packet');
                    return;
                  }
                  if (rp.claimedBy?.includes(user.uid)) {
                    if (window.showToast) window.showToast(lang === 'ar' ? 'استلمته من قبل' : 'Already claimed');
                    return;
                  }
                  if ((rp.claimedBy?.length || 0) >= rp.maxClaims) {
                    if (window.showToast) window.showToast(lang === 'ar' ? 'المغلف نفد' : 'Packet exhausted');
                    return;
                  }
                  if (rp.status !== 'active') {
                    if (window.showToast) window.showToast(lang === 'ar' ? 'المغلف منتهي' : 'Packet expired');
                    return;
                  }
                  // DM packet: recipient gets full amount
                  var claimAmt = rp.remaining || rp.amount;
                  var myName = currentUserData?.displayName || currentUser?.displayName || 'User';
                  await redPacketsCollection.doc(msg.rpId).update({
                    claimedBy: firebase.firestore.FieldValue.arrayUnion(user.uid),
                    claimerNames: firebase.firestore.FieldValue.arrayUnion(myName),
                    remaining: firebase.firestore.FieldValue.increment(-claimAmt),
                    status: 'exhausted'
                  });
                  // 🛡️ SECURITY: Chat Red Packet Claim
                  if (window.SecurityService) {
                    await window.SecurityService.applyCurrencyTransaction(user.uid, claimAmt, `Chat Red Packet Claim: ${rp.id}`);
                  } else {
                    await usersCollection.doc(user.uid).update({ currency: firebase.firestore.FieldValue.increment(claimAmt) });
                  }
                  
                  if (onNotification) {
                    onNotification((lang === 'ar' ? '🎉 استلمت ' : '🎉 You got ') + claimAmt + ' Intel!');
                  } else if (window.showToast) {
                    window.showToast((lang === 'ar' ? '🎉 استلمت ' : '🎉 You got ') + claimAmt + ' Intel!');
                  } else {
                    console.info('[Chat] Got', claimAmt, 'Intel');
                  }
                } catch (e) {console.error(e);}
              }, disabled: isClaimed, style: {
                display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '16px',
                background: isClaimed ?
                'linear-gradient(135deg,rgba(75,85,99,0.3),rgba(55,65,81,0.25))' :
                'linear-gradient(135deg,rgba(239,68,68,0.25),rgba(185,28,28,0.2))',
                border: isClaimed ? '1px solid rgba(107,114,128,0.3)' : '1px solid rgba(239,68,68,0.5)',
                cursor: isClaimed ? 'default' : 'pointer',
                boxShadow: isClaimed ? 'none' : '0 4px 16px rgba(239,68,68,0.3)',
                textAlign: 'left',
                opacity: isClaimed ? 0.55 : 1,
                transition: 'all 0.2s'
              } }, /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '32px', filter: isClaimed ? 'grayscale(1) opacity(0.5)' : 'drop-shadow(0 0 8px rgba(239,68,68,0.7))' } }, "\uD83E\uDDE7"), /*#__PURE__*/
            React.createElement("div", { style: { flex: 1 } }, /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '12px', fontWeight: 800, color: isClaimed ? '#6b7280' : '#ffd700' } }, lang === 'ar' ? 'مغلف أحمر' : 'Red Packet'), /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '10px', color: isClaimed ? '#4b5563' : '#fca5a5', marginTop: '2px' } }, msg.rpAmount?.toLocaleString(), " \uD83E\uDDE0"), /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '9px', color: isClaimed ? '#374151' : 'rgba(252,165,165,0.7)', marginTop: '2px' } },
            isClaimed ? lang === 'ar' ? '✅ تم الاستلام' : '✅ Claimed' : (lang === 'ar' ? 'اضغط للاستلام' : 'Tap to claim') + ' 🎁'
            )
            )
            ), /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '9px', color: '#374151', marginTop: '2px', textAlign: isMine ? 'right' : 'left', paddingLeft: '4px', paddingRight: '4px' } }, _fmtChatTs(msg.timestamp))
            )
            ));

        }

        return (/*#__PURE__*/
          React.createElement("div", { key: msg.id || idx, style: {
              display: 'flex',
              flexDirection: isMine ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              gap: '6px',
              marginBottom: isLastGroup ? '4px' : '1px'
            } }, /*#__PURE__*/

          React.createElement("div", { style: { width: '28px', flexShrink: 0, alignSelf: 'flex-end', position: 'relative' } },
          showAvatar ? /*#__PURE__*/
          React.createElement(window.AvatarWithFrame, {
            photoURL: isMine ? (currentUser?.photoURL || currentUser?.photo) : (msg.senderPhoto || msg.senderPhotoURL),
            equipped: isMine ? currentUser?.equipped : msg.senderEquipped,
            size: 'xs',
            lang: lang,
            onClick: () => openMiniProfile(msg.senderId)
          }) : /*#__PURE__*/
          React.createElement("div", { style: { width: '28px', height: '28px' } })
          ), /*#__PURE__*/


          React.createElement("div", { style: {
              display: 'flex', flexDirection: 'column',
              alignItems: isMine ? 'flex-end' : 'flex-start',
              maxWidth: '72%', gap: '2px'
            } },

          showName && /*#__PURE__*/
          React.createElement("div", {
            onClick: () => openMiniProfile(msg.senderId),
            style: {
              fontSize: '10px', fontWeight: 700,
              color: isMine ? '#00f2ff' : '#a78bfa',
              paddingLeft: isMine ? 0 : '4px',
              paddingRight: isMine ? '4px' : 0,
              display: 'flex', alignItems: 'center', gap: '4px',
              cursor: 'pointer'
            } },
          msgVipCfg && /*#__PURE__*/React.createElement("span", { style: { fontSize: '7px', fontWeight: 900, background: msgVipCfg.nameColor, color: '#000', padding: '0 3px', borderRadius: '2px', flexShrink: 0 } }, "VIP", msgVipLevel),
          isMine ? currentUser?.displayName || msg.senderName || 'You' : msg.senderName,
          isMine && /*#__PURE__*/React.createElement("span", { style: { fontSize: '8px', color: '#4b5563', fontWeight: 500 } }, " (", lang === 'ar' ? 'أنت' : 'you', ")"),
          msg.senderVipLevel > 0 && typeof window.VIP_CHAT_TITLE_URLS !== 'undefined' && window.VIP_CHAT_TITLE_URLS?.[msg.senderVipLevel] && /*#__PURE__*/
          React.createElement("img", { src: window.VIP_CHAT_TITLE_URLS[msg.senderVipLevel], alt: "",
            style: { height: '13px', objectFit: 'contain' } })

          ),



          msg.isDeleted ? /*#__PURE__*/
          React.createElement("div", { style: {
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              padding: '7px 11px',
              fontSize: '11px', color: '#4b5563',
              fontStyle: 'italic'
            } }, "\uD83D\uDDD1\uFE0F ",
          lang === 'ar' ? 'تم حذف هذه الرسالة' : 'This message was deleted'
          ) :
          isGift ? /*#__PURE__*/
          React.createElement("div", { style: {
              background: isMine ?
              'linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,136,0,0.10))' :
              'linear-gradient(135deg,rgba(255,215,0,0.09),rgba(255,136,0,0.06))',
              border: '1px solid rgba(255,215,0,0.25)',
              borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              padding: '8px 12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px'
            } },
          msg.giftImageUrl ? /*#__PURE__*/
          React.createElement("img", { src: msg.giftImageUrl, alt: "", style: { width: '36px', height: '36px', objectFit: 'contain' } }) : /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '30px' } }, msg.giftEmoji || '🎁'), /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '11px', fontWeight: 700, color: '#fbbf24' } },
          lang === 'ar' ? msg.giftNameAr || 'هدية' : msg.giftNameEn || 'Gift',
          msg.giftQty > 1 && ` ×${msg.giftQty}`
          ), /*#__PURE__*/
          React.createElement("div", { style: { display: 'flex', gap: '6px', fontSize: '10px' } }, /*#__PURE__*/
          React.createElement("span", { style: { color: '#facc15', fontWeight: 700 } }, "+", formatCharisma(msg.giftCharisma || 0), " \u2B50"),
          msg.giftBonus > 0 && /*#__PURE__*/React.createElement("span", { style: { color: '#4ade80', fontWeight: 700 } }, "+", msg.giftBonus, " \uD83E\uDDE0")
          )
          ) :
          isImage ? /*#__PURE__*/
          React.createElement("div", {
            onClick: () => {
              var _imgSrc = msg.imageData;
              var _html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}body{background:#000;min-height:100vh;display:flex;align-items:center;justify-content:center}img{max-width:100vw;max-height:100vh;object-fit:contain}</style></head><body><img src="' + _imgSrc.replace(/"/g, '&quot;') + '"></body></html>';
              var _blob = new Blob([_html], { type: 'text/html' });
              var _blobUrl = URL.createObjectURL(_blob);
              var _win = window.open(_blobUrl, '_blank');
              if (_win) setTimeout(function () { URL.revokeObjectURL(_blobUrl); }, 30000);
            },
            style: {
              borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              overflow: 'hidden',
              border: `1px solid ${isMine ? 'rgba(0,242,255,0.18)' : 'rgba(255,255,255,0.09)'}`,
              cursor: 'pointer',
              width: 'min(260px, calc(100vw - 80px))'
            } }, /*#__PURE__*/

          React.createElement("img", { src: msg.imageData, alt: "\uD83D\uDCF7",
            style: { display: 'block', width: '100%', maxHeight: '260px', objectFit: 'cover' } })
          ) :
          editingMsgId === msg.id ? /*#__PURE__*/
          /* ── Edit input ── */
          React.createElement("div", { style: { display: 'flex', gap: '5px', alignItems: 'center' } }, /*#__PURE__*/
          React.createElement("input", {
            autoFocus: true,
            value: editMsgText,
            onChange: (e) => setEditMsgText(e.target.value),
            onKeyDown: (e) => {
              if (e.key === 'Enter') handleEditMessage(msg.id, editMsgText);
              if (e.key === 'Escape') {setEditingMsgId(null);setEditMsgText('');}
            },
            style: {
              flex: 1, padding: '7px 10px',
              background: 'rgba(0,242,255,0.08)',
              border: '1px solid rgba(0,242,255,0.3)',
              borderRadius: '10px', color: 'white',
              fontSize: '13px', outline: 'none'
            } }
          ), /*#__PURE__*/
          React.createElement("button", { onClick: () => handleEditMessage(msg.id, editMsgText),
            style: { background: 'rgba(0,242,255,0.2)', border: '1px solid rgba(0,242,255,0.4)', borderRadius: '8px', padding: '5px 8px', color: '#00f2ff', cursor: 'pointer', fontSize: '12px', fontWeight: 800 } }, "\u2713"), /*#__PURE__*/
          React.createElement("button", { onClick: () => {setEditingMsgId(null);setEditMsgText('');},
            style: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '5px 8px', color: '#9ca3af', cursor: 'pointer', fontSize: '12px' } }, "\u2715")
          ) :
          msg.type === 'spy_room_invite' ? /*#__PURE__*/
          React.createElement("div", { style: {
            background: 'linear-gradient(135deg,rgba(0,212,170,0.1),rgba(0,0,0,0.4))',
            border: '1px solid rgba(0,212,170,0.3)',
            borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
            padding: '12px', minWidth: '200px'
          } },
            React.createElement("div", { style: { fontSize: '24px', marginBottom: '4px' } }, "🕵️"),
            React.createElement("div", { style: { fontSize: '13px', fontWeight: 900, color: '#fff', marginBottom: '4px' } }, "Spy Game Invite!"),
            React.createElement("div", { style: { fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' } }, msg.text),
            React.createElement("button", {
                onClick: () => {
                    onClose && onClose();
                    setTimeout(() => window.SpyGameCore && window.SpyGameCore.online && window.SpyGameCore.online.joinAndGo(msg.roomCode, msg.password), 300);
                },
                style: {
                    width: '100%', padding: '8px', background: 'var(--spy-gold, #f5a623)',
                    color: '#000', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase',
                    border: 'none', borderRadius: '8px', cursor: 'pointer', letterSpacing: '1px'
                }
            }, "JOIN MISSION")
          ) : /*#__PURE__*/

          React.createElement("div", { style: {
              background: isMine ?
              'linear-gradient(135deg,rgba(0,242,255,0.16),rgba(112,0,255,0.13))' :
              'rgba(255,255,255,0.07)',
              border: isMine ?
              '1px solid rgba(0,242,255,0.16)' :
              '1px solid rgba(255,255,255,0.07)',
              borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              padding: '8px 11px',
              fontSize: '13px', color: 'white',
              lineHeight: 1.45, wordBreak: 'break-word'
            } },
          msg.text?.split(/(@\w[\w\s]*?)(?=\s|$)/g).map((part, pi) =>
          part.startsWith('@') ? /*#__PURE__*/
          React.createElement("span", { key: pi,
            style: { color: '#00f2ff', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline dotted rgba(0,242,255,0.4)' },
            onClick: () => {
              var mentionName = part.slice(1).trim();
              var uid = null;
              if (friend?.displayName === mentionName) uid = friend.uid;else
              if (currentUser?.displayName === mentionName) uid = user?.uid;
              if (uid) openMiniProfile(uid);
            } },
          part) :
          part
          )
          ),



          !msg.isDeleted && /*#__PURE__*/
          React.createElement("div", { style: {
              display: 'flex', alignItems: 'center', gap: '4px',
              justifyContent: isMine ? 'flex-end' : 'flex-start',
              paddingLeft: isMine ? 0 : '3px',
              paddingRight: isMine ? '3px' : 0,
              position: 'relative'
            } }, /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '9px', color: '#374151' } },
          _fmtChatTs(msg.timestamp),
          msg.isEdited && /*#__PURE__*/React.createElement("span", { style: { marginLeft: '3px', color: '#4b5563', fontStyle: 'italic' } }, lang === 'ar' ? '(معدّل)' : '(edited)'),
          isMine && /*#__PURE__*/React.createElement("span", { style: { marginLeft: '3px', color: '#374151' } }, "\u2713")
          ),

          isMine && !isGift && !isImage && msg.type !== 'deleted' && /*#__PURE__*/
          React.createElement("button", {
            onClick: (e) => {
              e.stopPropagation();
              var rect = e.currentTarget.getBoundingClientRect();
              setMsgMenuPos({
                bottom: window.innerHeight - rect.top + 4,
                right: Math.max(8, window.innerWidth - rect.right)
              });
              setMsgMenuId(msgMenuId === msg.id ? null : msg.id);
            },
            style: {
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '11px', color: '#4b5563', padding: '2px 3px',
              lineHeight: 1, borderRadius: '4px'
            },
            onMouseEnter: (e) => e.currentTarget.style.color = '#9ca3af',
            onMouseLeave: (e) => e.currentTarget.style.color = '#4b5563' },
          "\u270F\uFE0F"),


          showReportModal && reportStep === 'dm' && !isMine && !isGift && !isImage && /*#__PURE__*/
          React.createElement("button", {
            onClick: () => setReportDMMsg(reportDMMsg?.id === msg.id ? null : msg),
            style: {
              background: reportDMMsg?.id === msg.id ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.05)',
              border: reportDMMsg?.id === msg.id ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px', padding: '2px 6px',
              fontSize: '10px', color: reportDMMsg?.id === msg.id ? '#f87171' : '#9ca3af',
              cursor: 'pointer', fontWeight: 700
            } },
          reportDMMsg?.id === msg.id ? '✓' : lang === 'ar' ? 'اختر' : 'Select')

          )

          )
          ));

      }),


      friendTyping && /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'flex-end', gap: '6px' } }, /*#__PURE__*/
      React.createElement("img", {
        src: friend.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.displayName || 'U')}&background=6366f1&color=fff&size=56`,
        alt: "",
        style: {
          width: '28px', height: '28px', borderRadius: '50%',
          objectFit: 'cover', border: '1.5px solid rgba(0,242,255,0.15)',
          flexShrink: 0
        } }
      ), /*#__PURE__*/
      React.createElement("div", { style: {
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '14px 14px 14px 4px',
          padding: '10px 14px',
          display: 'flex', gap: '4px', alignItems: 'center'
        } },
      [0, 1, 2].map((i) => /*#__PURE__*/
      React.createElement("div", { key: i, style: {
          width: '5px', height: '5px', borderRadius: '50%',
          background: '#00f2ff',
          animation: `chat-typing-dot 1.2s ${i * 0.22}s ease-in-out infinite`
        } })
      )
      )
      ), /*#__PURE__*/


      React.createElement("div", { ref: messagesEndRef })
      ), /*#__PURE__*/


      React.createElement("div", { style: {
          padding: '9px 11px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(0,0,0,0.45)',
          flexShrink: 0,
          position: 'relative'
        } },

      showEmojiPicker && /*#__PURE__*/
      React.createElement("div", { style: {
          position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#0e1020',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '14px', padding: '10px',
          zIndex: Z.MODAL_TOP,
          boxShadow: '0 -14px 44px rgba(0,0,0,0.8)'
        } }, /*#__PURE__*/
      React.createElement("div", { style: {
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.07)',
          paddingBottom: '6px'
        } }, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '11px', fontWeight: 700, color: '#00f2ff' } },
      lang === 'ar' ? 'اختر إيموجي' : 'Select Emoji'
      ), /*#__PURE__*/
      React.createElement("button", {
        onClick: () => setShowEmojiPicker(false),
        style: { background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px', lineHeight: 1 } },
      "\u2715")
      ),
      React.createElement(EmojiPicker, {
        show: true,
        onClose: () => setShowEmojiPicker(false),
        onSelect: handleEmojiSelect,
        lang,
        inline: true
      })
      ),


      !(isBlocked || blockedByTarget) ? /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '5px', boxSizing: 'border-box', width: '100%', minWidth: 0 } }, /*#__PURE__*/


      React.createElement("button", {
        onClick: () => setShowEmojiPicker((v) => !v),
        style: {
          background: showEmojiPicker ? 'rgba(0,242,255,0.12)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${showEmojiPicker ? 'rgba(0,242,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '10px', width: '36px', height: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: '17px', flexShrink: 0,
          transition: 'all 0.2s'
        } },
      "\uD83D\uDE00"), /*#__PURE__*/


      React.createElement("button", {
        onClick: () => fileInputRef.current?.click(),
        disabled: uploadingImg,
        title: lang === 'ar' ? 'إرسال صورة' : 'Send image',
        style: {
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px', width: '36px', height: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: uploadingImg ? 'wait' : 'pointer',
          fontSize: '15px', flexShrink: 0,
          opacity: uploadingImg ? 0.5 : 1
        } },
      uploadingImg ? '⏳' : '🖼️'), /*#__PURE__*/


      React.createElement("button", {
        onClick: () => {
          if (typeof setShowDMRedPacket === 'function') setShowDMRedPacket(true);
        },
        title: lang === 'ar' ? 'مغلف أحمر' : 'Red Packet',
        style: {
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '10px', width: '36px', height: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: '16px', flexShrink: 0
        } },
      "\uD83E\uDDE7"), /*#__PURE__*/


      React.createElement("input", {
        ref: inputRef,
        type: "text",
        placeholder: t.typeMessage || (lang === 'ar' ? 'اكتب رسالة...' : 'Type a message...'),
        value: newMsg,
        onChange: (e) => {
          var val = e.target.value;
          setNewMsg(val);
          handleTypingChange();
          var lastAt = val.lastIndexOf('@');
          if (lastAt !== -1) {
            var after = val.slice(lastAt + 1);
            if (!after.includes(' ') && (
            (friend?.displayName || '').toLowerCase().includes(after.toLowerCase()) ||
            (currentUser?.displayName || '').toLowerCase().includes(after.toLowerCase())))
            {
              setShowMentionSuggestion(true);
            } else {setShowMentionSuggestion(false);}
          } else {setShowMentionSuggestion(false);}
        },
        onKeyPress: (e) => {if (e.key === 'Enter' && !e.shiftKey) {setShowMentionSuggestion(false);handleSend();}},
        onBlur: () => {clearTypingStatus();setTimeout(() => setShowMentionSuggestion(false), 200);},
        style: {
          flex: 1, padding: '8px 10px', minWidth: 0,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          color: 'white', fontSize: '13px', outline: 'none',
          transition: 'border-color 0.2s'
        },
        onFocus: (e) => e.target.style.borderColor = 'rgba(0,242,255,0.3)' }
      ),


      showMentionSuggestion && /*#__PURE__*/
      React.createElement("div", { style: {
          position: 'absolute', bottom: 'calc(100% + 4px)', left: '50px', right: '50px',
          background: 'linear-gradient(160deg,#0e0e22,#13122a)',
          border: '1px solid rgba(0,242,255,0.2)',
          borderRadius: '12px', overflow: 'hidden', zIndex: Z.TOOLTIP,
          boxShadow: '0 -10px 28px rgba(0,0,0,0.85)'
        } },
      [
      { uid: friend?.uid, name: friend?.displayName, photo: friend?.photoURL },
      { uid: user?.uid, name: currentUser?.displayName, photo: currentUser?.photoURL }].
      filter((p) => {
        var after = newMsg.slice(newMsg.lastIndexOf('@') + 1).toLowerCase();
        return p.uid && p.name && p.name.toLowerCase().includes(after);
      }).map((p) => /*#__PURE__*/
      React.createElement("div", { key: p.uid,
        onClick: () => {
          var lastAt = newMsg.lastIndexOf('@');
          setNewMsg(newMsg.slice(0, lastAt) + '@' + p.name + ' ');
          setShowMentionSuggestion(false);
          inputRef.current?.focus();
        },
        style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', cursor: 'pointer' },
        onMouseEnter: (e) => e.currentTarget.style.background = 'rgba(0,242,255,0.08)',
        onMouseLeave: (e) => e.currentTarget.style.background = 'transparent' }, /*#__PURE__*/

      React.createElement("img", { src: p.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || 'U')}&background=6366f1&color=fff&size=40`,
        alt: "", style: { width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' } }), /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '12px', fontWeight: 700, color: '#00f2ff' } }, "@", p.name),
      p.uid === user?.uid && /*#__PURE__*/React.createElement("span", { style: { fontSize: '10px', color: '#6b7280' } }, lang === 'ar' ? '(أنت)' : '(you)')
      )
      )
      ), /*#__PURE__*/



      React.createElement("button", {
        onClick: handleSend,
        disabled: !canSend,
        style: {
          background: canSend ?
          'linear-gradient(135deg,rgba(0,242,255,0.25),rgba(112,0,255,0.22))' :
          'rgba(255,255,255,0.03)',
          border: canSend ?
          '1px solid rgba(0,242,255,0.35)' :
          '1px solid rgba(255,255,255,0.06)',
          borderRadius: '10px', width: '36px', height: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          // ✅ cursor changes ONLY when there's text
          cursor: canSend ? 'pointer' : 'default',
          color: canSend ? '#00f2ff' : '#2d3748',
          fontSize: '15px', flexShrink: 0,
          transition: 'all 0.2s',
          // ✅ No glow/box-shadow unless canSend
          boxShadow: canSend ? '0 0 10px rgba(0,242,255,0.2)' : 'none'
        } },
      "\u27A4")
      ) : /*#__PURE__*/

      React.createElement("div", { style: { textAlign: 'center', fontSize: '11px', color: '#4b5563', padding: '8px' } },
      lang === 'ar' ? 'لا يمكنك الإرسال' : 'Cannot send messages'
      )

      )
      )
      ),


      showDMRedPacket && /*#__PURE__*/
      React.createElement("div", { style: { position: 'fixed', inset: 0, zIndex: Z.TOOLTIP, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' } }, /*#__PURE__*/
      React.createElement("div", { style: { width: '100%', maxWidth: 'min(440px, 100vw)', background: 'linear-gradient(160deg,#0e0e22,#13122a)', borderRadius: '20px 20px 0 0', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '14px', fontWeight: 800, color: '#ef4444' } }, "\uD83E\uDDE7 ", lang === 'ar' ? 'أرسل مغلف أحمر' : 'Send Red Packet'), /*#__PURE__*/
      React.createElement("button", { onClick: () => setShowDMRedPacket(false), style: { background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer' } }, "\u2715")
      ), /*#__PURE__*/
      React.createElement("div", { style: { padding: '14px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', color: '#6b7280', marginBottom: '12px', textAlign: 'center' } },
      lang === 'ar' ? 'إلى' : 'To', ": ", /*#__PURE__*/React.createElement("span", { style: { color: '#a78bfa', fontWeight: 700 } }, friend?.displayName),
      ' · ', lang === 'ar' ? 'رصيدك' : 'Balance', ": ", /*#__PURE__*/React.createElement("span", { style: { color: '#ffd700', fontWeight: 700 } }, (currency || 0).toLocaleString(), " \uD83E\uDDE0")
      ), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' } },
      (typeof RED_PACKETS_CONFIG !== 'undefined' ? RED_PACKETS_CONFIG : []).map((rp) => /*#__PURE__*/
      React.createElement("button", { key: rp.id, onClick: async () => {
          if (sendingDMRedPacket || (currency || 0) < rp.amount) return;
          setSendingDMRedPacket(true);
          try {
            var rpRef = await redPacketsCollection.add({
              configId: rp.id, amount: rp.amount,
              senderId: user.uid, senderName: currentUser?.displayName || 'User', senderPhoto: currentUser?.photoURL || null,
              targetType: 'dm', targetId: friend.uid, targetName: friend.displayName,
              claimedBy: [], maxClaims: 1, remaining: rp.amount,
              createdAt: TS(), status: 'active'
            });
            // 🛡️ SECURITY: Chat Red Packet Send
            if (window.SecurityService) {
              await window.SecurityService.applyCurrencyTransaction(user.uid, -rp.amount, `Chat Red Packet Send: ${rp.id}`);
            } else {
              await usersCollection.doc(user.uid).update({ currency: firebase.firestore.FieldValue.increment(-rp.amount) });
            }
            
            if (onNotification) {
              onNotification(lang === 'ar' ? '✅ تم إرسال العيدية' : '✅ Red Packet Sent');
            } else if (window.showToast) {
              window.showToast(lang === 'ar' ? '✅ تم إرسال العيدية' : '✅ Red Packet Sent');
            } else {
              console.info('[Chat] Red Packet Sent');
            }
            await chatsCollection.doc(chatId).collection('messages').add({
              type: 'red_packet', rpId: rpRef.id, rpAmount: rp.amount, rpConfigId: rp.id,
              senderId: user.uid, senderName: currentUser?.displayName || 'User', senderPhoto: currentUser?.photoURL || null,
              text: `🧧 ${rp.amount}`, timestamp: TS(), maxClaims: 1
            });
            // Announce
            await publicChatCollection.add({
              type: 'red_packet_announce', senderId: user.uid, senderName: currentUser?.displayName || 'User',
              amount: rp.amount, targetType: 'dm', targetName: friend.displayName,
              text: lang === 'ar' ? `🧧 ${currentUser?.displayName} أرسل مغلف ${rp.amount} إلى ${friend.displayName}` : `🧧 ${currentUser?.displayName} sent a ${rp.amount} packet to ${friend.displayName}`,
              createdAt: TS()
            });
            setShowDMRedPacket(false);
          } catch (e) {console.error(e);}
          setSendingDMRedPacket(false);
        }, disabled: sendingDMRedPacket || (currency || 0) < rp.amount,
        style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '14px', background: rp.bg, border: `1px solid ${rp.border}`, cursor: (currency || 0) < rp.amount ? 'not-allowed' : 'pointer', opacity: (currency || 0) < rp.amount ? 0.4 : 1, textAlign: 'left' } },
      rp.imageURL ? /*#__PURE__*/React.createElement("img", { src: rp.imageURL, alt: "", style: { width: '42px', height: '42px', objectFit: 'contain' } }) : /*#__PURE__*/React.createElement("div", { style: { width: '42px', height: '42px', borderRadius: '10px', background: `${rp.color}20`, border: `1px solid ${rp.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' } }, "\uD83E\uDDE7"), /*#__PURE__*/
      React.createElement("div", { style: { flex: 1 } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 800, color: rp.color } }, lang === 'ar' ? rp.name_ar : rp.name_en), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '10px', color: '#9ca3af', marginTop: '2px' } }, lang === 'ar' ? rp.desc_ar : rp.desc_en)
      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 800, color: rp.color } }, rp.amount.toLocaleString(), " \uD83E\uDDE0")
      )
      )
      )
      )
      )
      ),



      showGiftModal && /*#__PURE__*/
      React.createElement(SendGiftModal, {
        show: showGiftModal,
        onClose: () => setShowGiftModal(false),
        targetUser: friend,
        currentUser: currentUser,
        lang: lang,
        onSendGift: handleSendGiftToChat,
        currency: currency || 0,
        friendsData: friendsData }
      ),



      showHeaderMenu && (() => {
        var rect = headerMenuBtnRef.current?.getBoundingClientRect();
        var dropTop = rect ? rect.bottom + 4 : 60;
        var dropRight = rect ? Math.max(8, window.innerWidth - rect.right) : 8;
        return (/*#__PURE__*/
          React.createElement("div", { style: { position: 'fixed', inset: 0, zIndex: Z.TOOLTIP - 1 },
            onClick: () => setShowHeaderMenu(false) }, /*#__PURE__*/
          React.createElement("div", { style: {
              position: 'fixed', top: `${dropTop}px`, right: `${dropRight}px`,
              background: 'linear-gradient(160deg,#0e0e22,#13122a)',
              border: '1px solid rgba(255,255,255,0.13)',
              borderRadius: '14px', padding: '7px',
              zIndex: Z.TOOLTIP,
              minWidth: '185px',
              boxShadow: '0 16px 44px rgba(0,0,0,0.9)'
            }, onClick: (e) => e.stopPropagation() }, /*#__PURE__*/
          React.createElement("button", { onClick: () => {setShowHeaderMenu(false);setShowDeleteChatConfirm(true);},
            style: { width: '100%', padding: '10px 13px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px', fontSize: '13px', fontWeight: 700, color: '#f87171', textAlign: 'left' },
            onMouseEnter: (e) => e.currentTarget.style.background = 'rgba(239,68,68,0.12)',
            onMouseLeave: (e) => e.currentTarget.style.background = 'none' },
          "\uD83D\uDDD1\uFE0F ", lang === 'ar' ? 'حذف المحادثة' : 'Delete Chat'), /*#__PURE__*/
          React.createElement("button", { onClick: () => {isBlocked ? handleUnblock() : handleBlock();},
            style: { width: '100%', padding: '10px 13px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px', fontSize: '13px', fontWeight: 700, color: isBlocked ? '#4ade80' : '#f59e0b', textAlign: 'left' },
            onMouseEnter: (e) => e.currentTarget.style.background = isBlocked ? 'rgba(74,222,128,0.1)' : 'rgba(245,158,11,0.1)',
            onMouseLeave: (e) => e.currentTarget.style.background = 'none' },
          isBlocked ? `✅ ${lang === 'ar' ? 'إلغاء الحظر' : 'Unblock'}` : `🚫 ${lang === 'ar' ? 'حظر المستخدم' : 'Block User'}`), /*#__PURE__*/
          React.createElement("button", { onClick: () => {setShowHeaderMenu(false);setReportStep('reason');setReportReason('');setReportDMMsg(null);setShowReportModal(true);},
            style: { width: '100%', padding: '10px 13px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px', fontSize: '13px', fontWeight: 700, color: '#9ca3af', textAlign: 'left' },
            onMouseEnter: (e) => e.currentTarget.style.background = 'rgba(255,255,255,0.07)',
            onMouseLeave: (e) => e.currentTarget.style.background = 'none' },
          "\uD83D\uDEA8 ", lang === 'ar' ? 'إبلاغ' : 'Report')
          )
          ));

      })(),


      msgMenuId && (() => {
        var activeMsg = messages.find((m) => m.id === msgMenuId);
        if (!activeMsg) return null;
        return (/*#__PURE__*/
          React.createElement("div", { style: { position: 'fixed', inset: 0, zIndex: Z.MODAL_HIGH }, onClick: () => setMsgMenuId(null) }, /*#__PURE__*/
          React.createElement("div", { style: {
              position: 'fixed',
              bottom: `${msgMenuPos.bottom}px`,
              right: `${msgMenuPos.right}px`,
              background: 'linear-gradient(160deg,#0e0e22,#13122a)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px', padding: '5px',
              zIndex: Z.MODAL_HIGH + 1,
              boxShadow: '0 8px 24px rgba(0,0,0,0.9)',
              minWidth: '130px',
              whiteSpace: 'nowrap'
            }, onClick: (e) => e.stopPropagation() }, /*#__PURE__*/
          React.createElement("button", {
            onClick: (e) => {e.stopPropagation();setEditingMsgId(msgMenuId);setEditMsgText(activeMsg.text || '');setMsgMenuId(null);},
            style: { width: '100%', padding: '7px 10px', borderRadius: '7px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#00f2ff', fontWeight: 700, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '7px' },
            onMouseEnter: (e) => e.currentTarget.style.background = 'rgba(0,242,255,0.1)',
            onMouseLeave: (e) => e.currentTarget.style.background = 'none' },
          "\u270F\uFE0F ", lang === 'ar' ? 'تعديل' : 'Edit'), /*#__PURE__*/
          React.createElement("button", {
            onClick: (e) => {e.stopPropagation();setMsgMenuId(null);handleDeleteMessage(msgMenuId);},
            style: { width: '100%', padding: '7px 10px', borderRadius: '7px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#f87171', fontWeight: 700, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '7px' },
            onMouseEnter: (e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)',
            onMouseLeave: (e) => e.currentTarget.style.background = 'none' },
          "\uD83D\uDDD1\uFE0F ", lang === 'ar' ? 'حذف' : 'Delete')
          )
          ));

      })(),


      miniProfile && /*#__PURE__*/
      React.createElement(MiniProfilePopup, {
        profile: miniProfile,
        onClose: () => {setMiniProfile(null);setShowMiniMenu(false);},
        currentUID: user?.uid,
        lang: lang,
        onOpenProfile: onOpenProfile,
        onSendGift: onSendGift ? () => {setShowGiftModal(true);} : null,
        onReport: () => {setTimeout(() => {setReportStep('reason');setReportReason('');setReportDMMsg(null);setShowReportModal(true);}, 50);},
        onBlock: handleBlock,
        onUnblock: handleUnblock,
        isBlocked: isBlocked }
      ),




      showDeleteChatConfirm && /*#__PURE__*/
      React.createElement("div", { style: {
          position: 'fixed', inset: 0, zIndex: Z.OVERLAY,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }, onClick: () => setShowDeleteChatConfirm(false) }, /*#__PURE__*/
      React.createElement("div", { style: {
          background: 'linear-gradient(135deg,#1a0808,#0f0505)',
          border: '2px solid rgba(239,68,68,0.45)',
          borderRadius: '18px', padding: '24px',
          maxWidth: '300px', width: '100%',
          textAlign: 'center',
          boxShadow: '0 0 40px rgba(239,68,68,0.2)'
        }, onClick: (e) => e.stopPropagation() }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '40px', marginBottom: '10px' } }, "\uD83D\uDDD1\uFE0F"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '15px', fontWeight: 900, color: '#f87171', marginBottom: '8px' } },
      lang === 'ar' ? 'حذف المحادثة' : 'Delete Chat'
      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '12px', color: '#9ca3af', marginBottom: '20px', lineHeight: 1.6 } },
      lang === 'ar' ?
      'سيتم حذف كل الرسائل نهائياً. هل أنت متأكد؟' :
      'All messages will be permanently deleted. Are you sure?'
      ), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '10px' } }, /*#__PURE__*/
      React.createElement("button", { onClick: () => setShowDeleteChatConfirm(false),
        style: { flex: 1, padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '13px', fontWeight: 700, cursor: 'pointer' } },
      lang === 'ar' ? 'إلغاء' : 'Cancel'
      ), /*#__PURE__*/
      React.createElement("button", { onClick: handleDeleteChat, disabled: deletingChat,
        style: { flex: 1, padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg,#dc2626,#991b1b)', border: 'none', color: 'white', fontSize: '13px', fontWeight: 800, cursor: deletingChat ? 'wait' : 'pointer', opacity: deletingChat ? 0.7 : 1 } },
      deletingChat ? '⏳' : `🗑️ ${lang === 'ar' ? 'حذف' : 'Delete'}`
      )
      )
      )
      ),



      showReportModal && /*#__PURE__*/
      React.createElement("div", { style: {
          position: 'fixed', inset: 0, zIndex: Z.OVERLAY,
          background: 'rgba(0,0,0,0.88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px'
        }, onClick: () => {if (reportStep !== 'done') setShowReportModal(false);} }, /*#__PURE__*/
      React.createElement("div", { style: {
          background: 'linear-gradient(160deg,#0d0d1f,#0a0a18)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '20px', padding: '24px',
          maxWidth: '340px', width: '100%',
          boxShadow: '0 24px 60px rgba(0,0,0,0.9)'
        }, onClick: (e) => e.stopPropagation() }, /*#__PURE__*/


      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' } }, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '22px' } }, "\uD83D\uDEA8"), /*#__PURE__*/
      React.createElement("div", { style: { flex: 1 } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '14px', fontWeight: 900, color: '#f87171' } },
      lang === 'ar' ? 'إبلاغ عن مستخدم' : 'Report User'
      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', color: '#6b7280' } }, friend?.displayName)
      ),
      reportStep !== 'done' && /*#__PURE__*/
      React.createElement("button", { onClick: () => setShowReportModal(false),
        style: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '16px' } }, "\u2715")

      ),


      reportStep === 'reason' && /*#__PURE__*/
      React.createElement(React.Fragment, null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '12px', color: '#9ca3af', marginBottom: '10px' } },
      lang === 'ar' ? 'سبب البلاغ:' : 'Reason for report:'
      ),
      [
      { en: 'Harassment / Bullying', ar: 'مضايقة / تنمر' },
      { en: 'Inappropriate content', ar: 'محتوى غير لائق' },
      { en: 'Spam / Advertising', ar: 'سبام / إعلانات' },
      { en: 'Fake account', ar: 'حساب مزيف' },
      { en: 'Other', ar: 'أخرى' }].
      map((r) => /*#__PURE__*/
      React.createElement("button", { key: r.en, onClick: () => setReportReason(lang === 'ar' ? r.ar : r.en),
        style: {
          width: '100%', padding: '9px 13px', marginBottom: '5px', borderRadius: '9px',
          background: reportReason === (lang === 'ar' ? r.ar : r.en) ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
          border: reportReason === (lang === 'ar' ? r.ar : r.en) ? '1px solid rgba(239,68,68,0.45)' : '1px solid rgba(255,255,255,0.08)',
          color: reportReason === (lang === 'ar' ? r.ar : r.en) ? '#f87171' : '#d1d5db',
          fontSize: '12px', fontWeight: 600, cursor: 'pointer', textAlign: 'left'
        } },
      lang === 'ar' ? r.ar : r.en
      )
      ), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '8px', marginTop: '12px' } }, /*#__PURE__*/
      React.createElement("button", { onClick: () => setShowReportModal(false),
        style: { flex: 1, padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '12px', fontWeight: 700, cursor: 'pointer' } },
      lang === 'ar' ? 'إلغاء' : 'Cancel'
      ), /*#__PURE__*/
      React.createElement("button", { onClick: () => setReportStep('dm'), disabled: !reportReason,
        style: { flex: 1, padding: '10px', borderRadius: '10px', background: reportReason ? 'linear-gradient(135deg,rgba(239,68,68,0.3),rgba(185,28,28,0.2))' : 'rgba(255,255,255,0.03)', border: reportReason ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.06)', color: reportReason ? '#f87171' : '#374151', fontSize: '12px', fontWeight: 700, cursor: reportReason ? 'pointer' : 'not-allowed' } },
      lang === 'ar' ? 'التالي →' : 'Next →'
      )
      )
      ),



      reportStep === 'dm' && /*#__PURE__*/
      React.createElement(React.Fragment, null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '12px', color: '#9ca3af', marginBottom: '8px' } },
      lang === 'ar' ? 'أضف دليلاً من الرسائل (اختياري):' : 'Add message evidence (optional):'
      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', color: '#6b7280', marginBottom: '12px', lineHeight: 1.5 } },
      lang === 'ar' ?
      'أغلق هذه النافذة واضغط على "اختر" بجانب الرسالة التي تريد إرفاقها كدليل، ثم عد هنا.' :
      'Close this dialog and tap "Select" next to the message you want as evidence, then come back.'
      ),
      reportDMMsg && /*#__PURE__*/
      React.createElement("div", { style: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px', marginBottom: '12px', fontSize: '12px', color: '#fca5a5' } }, "\uD83D\uDCCE ",
      lang === 'ar' ? 'دليل مرفق:' : 'Evidence attached:', " \"", reportDMMsg.text?.slice(0, 60), reportDMMsg.text?.length > 60 ? '...' : '', "\""
      ), /*#__PURE__*/

      React.createElement("div", { style: { display: 'flex', gap: '8px' } }, /*#__PURE__*/
      React.createElement("button", { onClick: () => setReportStep('reason'),
        style: { flex: 1, padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '12px', fontWeight: 700, cursor: 'pointer' } }, "\u2190 ",
      lang === 'ar' ? 'رجوع' : 'Back'
      ), /*#__PURE__*/
      React.createElement("button", { onClick: handleSubmitReport, disabled: submittingReport,
        style: { flex: 1, padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg,rgba(239,68,68,0.35),rgba(185,28,28,0.25))', border: '1px solid rgba(239,68,68,0.5)', color: '#f87171', fontSize: '12px', fontWeight: 800, cursor: submittingReport ? 'wait' : 'pointer', opacity: submittingReport ? 0.7 : 1 } },
      submittingReport ? '⏳' : `🚨 ${lang === 'ar' ? 'إرسال البلاغ' : 'Submit Report'}`
      )
      )
      ),



      reportStep === 'done' && /*#__PURE__*/
      React.createElement("div", { style: { textAlign: 'center', padding: '10px 0' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '40px', marginBottom: '12px' } }, "\u2705"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '14px', fontWeight: 800, color: '#4ade80', marginBottom: '8px' } },
      lang === 'ar' ? 'تم إرسال البلاغ' : 'Report Submitted'
      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', color: '#9ca3af', marginBottom: '20px', lineHeight: 1.6 } },
      lang === 'ar' ?
      'شكراً لمساعدتنا. سيتم مراجعة البلاغ قريباً وستصلك رسالة من المحقق.' :
      'Thank you. Your report will be reviewed soon and you will receive a message from The Detective.'
      ), /*#__PURE__*/
      React.createElement("button", { onClick: () => setShowReportModal(false),
        style: { padding: '10px 28px', borderRadius: '10px', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontSize: '13px', fontWeight: 700, cursor: 'pointer' } },
      lang === 'ar' ? 'إغلاق' : 'Close'
      )
      )

      )
      ), /*#__PURE__*/



      React.createElement("style", null, `
          @keyframes chat-typing-dot {
            0%,60%,100%{ transform:translateY(0); opacity:0.3; }
            30%{ transform:translateY(-5px); opacity:1; }
          }
        `)
      ));

  };

  window.PrivateChatModal = PrivateChatModal;
})();