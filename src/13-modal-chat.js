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

    const messagesEndRef  = useRef(null);
    const inputRef        = useRef(null);
    const fileInputRef    = useRef(null);
    const typingTimerRef  = useRef(null);

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
                <button
                  onClick={onClose}
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
                const prevSender  = idx > 0 ? messages[idx - 1]?.senderId : null;
                const nextSender  = idx < messages.length - 1 ? messages[idx + 1]?.senderId : null;
                const showAvatar  = !isMine && prevSender !== msg.senderId;
                const showName    = !isMine && prevSender !== msg.senderId;
                const isLastGroup = nextSender !== msg.senderId;

                return (
                  <div key={msg.id || idx} style={{
                    display: 'flex',
                    flexDirection: isMine ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    gap: '6px',
                    marginBottom: isLastGroup ? '4px' : '1px',
                  }}>
                    {/* Friend avatar */}
                    {!isMine && (
                      <div style={{ width: '28px', flexShrink: 0, alignSelf: 'flex-end' }}>
                        {showAvatar ? (
                          <img
                            src={msg.senderPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName||'U')}&background=6366f1&color=fff&size=56`}
                            alt=""
                            onClick={() => onOpenProfile && onOpenProfile(msg.senderId)}
                            style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              objectFit: 'cover', cursor: 'pointer',
                              border: '1.5px solid rgba(0,242,255,0.15)',
                            }}
                          />
                        ) : <div style={{ width: '28px' }} />}
                      </div>
                    )}

                    {/* Bubble column */}
                    <div style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: isMine ? 'flex-end' : 'flex-start',
                      maxWidth: '72%', gap: '2px',
                    }}>
                      {/* Sender name (first in group, received only) */}
                      {showName && (
                        <div style={{
                          fontSize: '10px', fontWeight: 700, color: '#00f2ff',
                          paddingLeft: '4px',
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                          {msg.senderName}
                          {msg.senderVipLevel > 0 && VIP_CHAT_TITLE_URLS?.[msg.senderVipLevel] && (
                            <img src={VIP_CHAT_TITLE_URLS[msg.senderVipLevel]} alt=""
                              style={{ height: '13px', objectFit: 'contain' }} />
                          )}
                        </div>
                      )}

                      {/* Bubble */}
                      {isGift ? (
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
                            w.document.write(`<body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${msg.imageData}" style="max-width:100vw;max-height:100vh;object-fit:contain"></body>`);
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
                          {msg.text}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div style={{
                        fontSize: '9px', color: '#374151',
                        paddingLeft: isMine ? 0 : '3px',
                        paddingRight: isMine ? '3px' : 0,
                      }}>
                        {_fmtChatTs(msg.timestamp)}
                        {isMine && <span style={{ marginLeft: '3px', color: '#374151' }}>✓</span>}
                      </div>
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

                  {/* Text input */}
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={t.typeMessage || (lang === 'ar' ? 'اكتب رسالة...' : 'Type a message...')}
                    value={newMsg}
                    onChange={e => { setNewMsg(e.target.value); handleTypingChange(); }}
                    onKeyPress={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend(); }}
                    onBlur={clearTypingStatus}
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
