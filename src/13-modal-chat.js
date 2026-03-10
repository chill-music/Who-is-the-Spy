// ════════════════════════════════════════════════════════
// 💬 PRIVATE CHAT MODAL — V2 REDESIGN
//    ✅ Modern UI with photos, names, timestamps
//    ✅ Image upload support (base64)
//    ✅ Typing indicator (VIP10 = Firestore realtime)
//    ✅ VIP10 = Firestore persistence, others = localStorage
// ════════════════════════════════════════════════════════

// ── Helper: compress image to base64 (max 400px, JPEG 0.65) ──
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

const getLocalChatKey = (chatId) => `pro_spy_chat_v2_${chatId}`;
const loadLocalMessages = (chatId) => {
    try { const r = localStorage.getItem(getLocalChatKey(chatId)); return r ? JSON.parse(r) : []; }
    catch { return []; }
};
const saveLocalMessages = (chatId, msgs) => {
    try { localStorage.setItem(getLocalChatKey(chatId), JSON.stringify(msgs.slice(-100))); }
    catch {}
};
const fmtChatTime = (ts) => {
    if (!ts) return '';
    const d = ts?.toDate ? ts.toDate() : (ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts));
    if (isNaN(d)) return '';
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return lang === 'ar' ? 'الآن' : 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const PrivateChatModal = ({ show, onClose, friend, currentUser, user, lang, onSendNotification, onSendGift, currency, friendsData, onOpenProfile }) => {
    const t = TRANSLATIONS[lang];
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [sending, setSending] = useState(false);
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [blockedByTarget, setBlockedByTarget] = useState(false);
    const [friendTyping, setFriendTyping] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const isVIP10 = useMemo(() => {
        if (!currentUser) return false;
        try { return (getVIPLevel ? getVIPLevel(currentUser) : 0) >= 10; } catch { return false; }
    }, [currentUser]);

    const chatId = friend && user ? [user.uid, friend.uid].sort().join('_') : null;

    // ── Blocked check ──
    useEffect(() => {
        if (!show || !friend || !currentUser) return;
        setIsBlocked((currentUser.blockedUsers || []).includes(friend.uid));
        usersCollection.doc(friend.uid).get().then(doc => {
            if (doc.exists) setBlockedByTarget((doc.data().blockedUsers || []).includes(user.uid));
        });
    }, [show, friend?.uid, currentUser, user?.uid]);

    // ── Messages loader ──
    useEffect(() => {
        if (!show || !chatId) return;
        if (isVIP10) {
            const unsub = chatsCollection.doc(chatId).collection('messages')
                .limit(100)
                .onSnapshot(snap => {
                    let msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    msgs.sort((a, b) => {
                        const tA = a.timestamp?.toMillis?.() || (a.timestamp?.seconds || 0) * 1000 || a.timestamp || 0;
                        const tB = b.timestamp?.toMillis?.() || (b.timestamp?.seconds || 0) * 1000 || b.timestamp || 0;
                        return tA - tB;
                    });
                    setMessages(msgs);
                    chatsCollection.doc(chatId).update({ [`unread.${user.uid}`]: 0 }).catch(() => {});
                }, () => {});
            return unsub;
        } else {
            setMessages(loadLocalMessages(chatId));
        }
    }, [show, chatId, user?.uid, isVIP10]);

    // ── Typing listener (VIP10 only) ──
    useEffect(() => {
        if (!show || !chatId || !isVIP10 || !friend) return;
        const unsub = chatsCollection.doc(chatId).onSnapshot(snap => {
            if (snap.exists) setFriendTyping(!!(snap.data()?.typing?.[friend.uid]));
        });
        return unsub;
    }, [show, chatId, friend?.uid, isVIP10]);

    // ── Scroll to bottom ──
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, friendTyping]);

    // ── Typing indicator management ──
    const handleTypingStart = () => {
        if (!isVIP10 || !chatId || !user) return;
        chatsCollection.doc(chatId).set({ typing: { [user.uid]: true } }, { merge: true }).catch(() => {});
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            chatsCollection.doc(chatId).set({ typing: { [user.uid]: false } }, { merge: true }).catch(() => {});
        }, 2500);
    };
    const clearTyping = () => {
        clearTimeout(typingTimeoutRef.current);
        if (isVIP10 && chatId && user) {
            chatsCollection.doc(chatId).set({ typing: { [user.uid]: false } }, { merge: true }).catch(() => {});
        }
    };

    // ── Send text ──
    const handleSend = async () => {
        if (!newMsg.trim() || sending || isBlocked || blockedByTarget) return;
        clearTyping();
        setSending(true);
        const text = newMsg.trim();
        const msgBase = {
            senderId: user.uid,
            senderName: currentUser?.displayName || 'User',
            senderPhoto: currentUser?.photoURL || null,
            senderVipLevel: (() => { try { return getVIPLevel ? getVIPLevel(currentUser) || 0 : 0; } catch { return 0; } })(),
            type: 'text',
            text,
        };
        try {
            if (isVIP10) {
                await chatsCollection.doc(chatId).collection('messages').add({
                    ...msgBase,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                await chatsCollection.doc(chatId).set({
                    members: [user.uid, friend.uid],
                    lastMessage: text,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    [`unread.${friend.uid}`]: firebase.firestore.FieldValue.increment(1)
                }, { merge: true });
                if (onSendNotification) {
                    onSendNotification(friend.uid, 'message',
                        `${currentUser?.displayName || 'User'}: ${text.substring(0, 50)}`,
                        user.uid, currentUser?.displayName || 'User');
                }
            } else {
                const newMsgs = [...messages, { ...msgBase, id: `l_${Date.now()}`, timestamp: Date.now() }];
                setMessages(newMsgs);
                saveLocalMessages(chatId, newMsgs);
            }
            setNewMsg('');
            playSound('click');
        } catch (e) { console.error('Send error:', e); }
        setSending(false);
    };

    // ── Send image ──
    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file || isBlocked || blockedByTarget || !file.type.startsWith('image/')) return;
        setUploadingImg(true);
        try {
            const base64 = await compressImageToBase64(file);
            const msgBase = {
                senderId: user.uid,
                senderName: currentUser?.displayName || 'User',
                senderPhoto: currentUser?.photoURL || null,
                senderVipLevel: (() => { try { return getVIPLevel ? getVIPLevel(currentUser) || 0 : 0; } catch { return 0; } })(),
                type: 'image',
                imageData: base64,
                text: '📷',
            };
            if (isVIP10) {
                await chatsCollection.doc(chatId).collection('messages').add({
                    ...msgBase,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                await chatsCollection.doc(chatId).set({
                    members: [user.uid, friend.uid],
                    lastMessage: '📷 Photo',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    [`unread.${friend.uid}`]: firebase.firestore.FieldValue.increment(1)
                }, { merge: true });
            } else {
                const newMsgs = [...messages, { ...msgBase, id: `li_${Date.now()}`, timestamp: Date.now() }];
                setMessages(newMsgs);
                saveLocalMessages(chatId, newMsgs);
            }
            playSound('click');
        } catch (err) { console.error('Image error:', err); }
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

    const friendInfo = friendsData?.find(f => f.id === friend.uid) || friend;
    const isOnline = friendInfo?.isOnline || friendInfo?.onlineStatus === 'online';
    const isAway = friendInfo?.onlineStatus === 'away';
    const statusColor = isOnline ? '#22c55e' : isAway ? '#f59e0b' : '#6b7280';
    const statusLabel = isOnline
        ? (lang === 'ar' ? 'متصل الآن' : 'Online')
        : isAway ? (lang === 'ar' ? 'بعيد' : 'Away')
        : (lang === 'ar' ? 'غير متصل' : 'Offline');

    const now = new Date();
    const fmtTs = (ts) => {
        if (!ts) return '';
        const d = ts?.toDate ? ts.toDate() : (ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts));
        if (isNaN(d)) return '';
        const diff = now - d;
        if (diff < 60000) return lang === 'ar' ? 'الآن' : 'now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <>
        <input ref={fileInputRef} type="file" accept="image/*"
            style={{ display: 'none' }} onChange={handleImageSelect} />

        <div className="modal-overlay" onClick={onClose}>
          <div onClick={e => e.stopPropagation()} style={{
            display:'flex', flexDirection:'column',
            width:'100%', maxWidth:'420px',
            height:'82vh', maxHeight:'680px',
            background:'linear-gradient(160deg,rgba(5,5,18,0.99),rgba(9,8,26,0.99))',
            border:'1px solid rgba(255,255,255,0.09)',
            borderRadius:'20px',
            overflow:'hidden',
            boxShadow:'0 28px 70px rgba(0,0,0,0.88), 0 0 30px rgba(0,242,255,0.07)',
            margin:'auto',
          }}>

            {/* ══ HEADER ══ */}
            <div style={{
              display:'flex', alignItems:'center', gap:'10px',
              padding:'11px 14px',
              background:'linear-gradient(135deg,rgba(7,7,22,1),rgba(15,9,32,1))',
              borderBottom:'1px solid rgba(255,255,255,0.07)',
              flexShrink:0,
            }}>
              {/* Avatar */}
              <div style={{position:'relative',flexShrink:0,cursor:'pointer'}}
                onClick={() => onOpenProfile && onOpenProfile(friend.uid)}>
                <img
                  src={friend.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.displayName||'U')}&background=6366f1&color=fff&size=80`}
                  alt=""
                  style={{
                    width:'40px', height:'40px', borderRadius:'50%',
                    objectFit:'cover',
                    border:`2px solid ${statusColor}55`,
                    boxShadow: isOnline ? `0 0 10px ${statusColor}44` : 'none',
                  }}
                />
                <div style={{
                  position:'absolute', bottom:'1px', right:'1px',
                  width:'10px', height:'10px', borderRadius:'50%',
                  background:statusColor, border:'1.5px solid rgba(5,5,18,1)',
                }} />
              </div>

              {/* Info */}
              <div style={{flex:1,minWidth:0,cursor:'pointer'}}
                onClick={() => onOpenProfile && onOpenProfile(friend.uid)}>
                <div style={{
                  fontSize:'13px', fontWeight:800, color:'white',
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                  display:'flex', alignItems:'center', gap:'5px',
                }}>
                  {friend.displayName || 'User'}
                  {friend.vip?.isActive && getVIPLevel && getVIPLevel(friend) > 0 && VIP_CONFIG && (
                    <span style={{
                      fontSize:'8px', fontWeight:900,
                      background: VIP_CONFIG[getVIPLevel(friend)-1]?.nameColor || '#7c3aed',
                      color:'#000', padding:'1px 4px', borderRadius:'3px', flexShrink:0,
                    }}>VIP{getVIPLevel(friend)}</span>
                  )}
                </div>
                <div style={{fontSize:'10px', color: friendTyping ? '#00f2ff' : statusColor, fontWeight:600, display:'flex', alignItems:'center', gap:'4px'}}>
                  {friendTyping ? (
                    <span style={{fontStyle:'italic', animation:'fadeIn 0.3s'}}>
                      {lang==='ar' ? '✏️ يكتب...' : '✏️ typing...'}
                    </span>
                  ) : (
                    <><span style={{fontSize:'7px'}}>●</span><span>{statusLabel}</span></>
                  )}
                </div>
              </div>

              {/* Right actions */}
              <div style={{display:'flex', gap:'5px', alignItems:'center', flexShrink:0}}>
                {!isVIP10 && (
                  <div style={{
                    fontSize:'8px', color:'#6b7280',
                    background:'rgba(255,255,255,0.04)',
                    padding:'2px 5px', borderRadius:'4px',
                    border:'1px solid rgba(255,255,255,0.06)',
                  }}>
                    {lang==='ar' ? '📱 محلي' : '📱 Local'}
                  </div>
                )}
                {isVIP10 && (
                  <div style={{
                    fontSize:'8px', color:'#a78bfa',
                    background:'rgba(167,139,250,0.1)',
                    padding:'2px 5px', borderRadius:'4px',
                    border:'1px solid rgba(167,139,250,0.25)',
                  }}>
                    ☁️ {lang==='ar' ? 'محفوظ' : 'Saved'}
                  </div>
                )}
                <button
                  onClick={() => setShowGiftModal(true)}
                  disabled={isBlocked||blockedByTarget}
                  style={{
                    background:'rgba(255,215,0,0.1)', border:'1px solid rgba(255,215,0,0.2)',
                    borderRadius:'8px', padding:'5px 7px', fontSize:'14px',
                    cursor: (isBlocked||blockedByTarget) ? 'not-allowed' : 'pointer',
                    opacity: (isBlocked||blockedByTarget) ? 0.4 : 1,
                  }}>🎁</button>
                <button onClick={onClose} style={{
                  background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
                  borderRadius:'8px', width:'30px', height:'30px',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:'pointer', color:'#9ca3af', fontSize:'14px',
                }}>✕</button>
              </div>
            </div>

            {/* ══ BLOCKED NOTICE ══ */}
            {(isBlocked||blockedByTarget) && (
              <div style={{
                background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
                borderRadius:'8px', margin:'8px 12px 0',
                padding:'7px 12px', fontSize:'11px', color:'#f87171',
                display:'flex', alignItems:'center', gap:'6px', flexShrink:0,
              }}>
                🚫 {isBlocked
                  ? (lang==='ar' ? 'حظرت هذا المستخدم. إلغاء الحظر للمراسلة.' : 'You blocked this user. Unblock to message.')
                  : (lang==='ar' ? 'هذا المستخدم حظرك. لا يمكنك الإرسال.' : 'This user has blocked you.')}
              </div>
            )}

            {/* ══ MESSAGES ══ */}
            <div style={{
              flex:1, overflowY:'auto', padding:'12px 10px',
              display:'flex', flexDirection:'column', gap:'6px',
              background:'linear-gradient(180deg,rgba(5,5,16,0.97),rgba(8,8,22,0.97))',
            }}>
              {messages.length === 0 ? (
                <div style={{
                  flex:1, display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center', gap:'8px',
                  opacity:0.35, paddingTop:'50px',
                }}>
                  <span style={{fontSize:'40px'}}>💬</span>
                  <span style={{fontSize:'12px', color:'#6b7280'}}>
                    {lang==='ar' ? 'لا توجد رسائل بعد' : 'No messages yet'}
                  </span>
                </div>
              ) : messages.map((msg, idx) => {
                const isMine = msg.senderId === user?.uid;
                const isGift = msg.type === 'gift';
                const isImage = msg.type === 'image';
                const prevSender = idx > 0 ? messages[idx-1]?.senderId : null;
                const nextSender = idx < messages.length-1 ? messages[idx+1]?.senderId : null;
                const showAvatar = !isMine && prevSender !== msg.senderId;
                const showName   = !isMine && prevSender !== msg.senderId;
                const isLastInGroup = nextSender !== msg.senderId;

                return (
                  <div key={msg.id || idx} style={{
                    display:'flex',
                    flexDirection: isMine ? 'row-reverse' : 'row',
                    alignItems:'flex-end',
                    gap:'6px',
                    marginBottom: isLastInGroup ? '4px' : '1px',
                  }}>
                    {/* Friend avatar */}
                    {!isMine && (
                      <div style={{width:'28px', flexShrink:0, alignSelf:'flex-end'}}>
                        {showAvatar ? (
                          <img
                            src={msg.senderPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName||'U')}&background=6366f1&color=fff&size=56`}
                            alt=""
                            onClick={() => onOpenProfile && onOpenProfile(msg.senderId)}
                            style={{
                              width:'28px', height:'28px', borderRadius:'50%',
                              objectFit:'cover', cursor:'pointer',
                              border:'1.5px solid rgba(0,242,255,0.18)',
                            }}
                          />
                        ) : <div style={{width:'28px'}} />}
                      </div>
                    )}

                    {/* Content */}
                    <div style={{
                      display:'flex', flexDirection:'column',
                      alignItems: isMine ? 'flex-end' : 'flex-start',
                      maxWidth:'72%', gap:'2px',
                    }}>
                      {/* Name */}
                      {showName && (
                        <div style={{
                          fontSize:'10px', fontWeight:700, color:'#00f2ff',
                          paddingLeft:'4px', display:'flex', alignItems:'center', gap:'4px',
                        }}>
                          {msg.senderName}
                          {msg.senderVipLevel > 0 && VIP_CHAT_TITLE_URLS?.[msg.senderVipLevel] && (
                            <img src={VIP_CHAT_TITLE_URLS[msg.senderVipLevel]} alt=""
                              style={{height:'13px', objectFit:'contain'}} />
                          )}
                        </div>
                      )}

                      {/* Bubble */}
                      {isGift ? (
                        <div style={{
                          background: isMine
                            ? 'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,136,0,0.12))'
                            : 'linear-gradient(135deg,rgba(255,215,0,0.10),rgba(255,136,0,0.07))',
                          border:'1px solid rgba(255,215,0,0.28)',
                          borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          padding:'8px 12px',
                          display:'flex', flexDirection:'column', alignItems:'center', gap:'3px',
                        }}>
                          {msg.giftImageUrl
                            ? <img src={msg.giftImageUrl} alt="" style={{width:'36px',height:'36px',objectFit:'contain'}}/>
                            : <span style={{fontSize:'30px'}}>{msg.giftEmoji||'🎁'}</span>}
                          <span style={{fontSize:'11px',fontWeight:700,color:'#fbbf24'}}>
                            {lang==='ar' ? msg.giftNameAr : msg.giftNameEn || 'Gift'}
                            {msg.giftQty > 1 && ` ×${msg.giftQty}`}
                          </span>
                          <div style={{display:'flex',gap:'6px',fontSize:'10px'}}>
                            <span style={{color:'#facc15',fontWeight:700}}>+{formatCharisma(msg.giftCharisma||0)} ⭐</span>
                            {msg.giftBonus > 0 && <span style={{color:'#4ade80',fontWeight:700}}>+{msg.giftBonus} 🧠</span>}
                          </div>
                        </div>
                      ) : isImage ? (
                        <div
                          onClick={() => { const w=window.open(); w.document.write(`<body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${msg.imageData}" style="max-width:100%;max-height:100vh"></body>`); }}
                          style={{
                            borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                            overflow:'hidden',
                            border:`1px solid ${isMine?'rgba(0,242,255,0.2)':'rgba(255,255,255,0.1)'}`,
                            cursor:'pointer', maxWidth:'200px',
                          }}>
                          <img src={msg.imageData} alt="📷"
                            style={{display:'block', maxWidth:'200px', maxHeight:'200px', objectFit:'cover'}} />
                        </div>
                      ) : (
                        <div style={{
                          background: isMine
                            ? 'linear-gradient(135deg,rgba(0,242,255,0.18),rgba(112,0,255,0.15))'
                            : 'rgba(255,255,255,0.07)',
                          border: isMine
                            ? '1px solid rgba(0,242,255,0.18)'
                            : '1px solid rgba(255,255,255,0.07)',
                          borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          padding:'8px 11px',
                          fontSize:'13px', color:'white',
                          lineHeight:1.45, wordBreak:'break-word',
                        }}>{msg.text}</div>
                      )}

                      {/* Time */}
                      <div style={{
                        fontSize:'9px', color:'#374151',
                        paddingLeft: isMine ? 0 : '3px',
                        paddingRight: isMine ? '3px' : 0,
                        display:'flex', alignItems:'center', gap:'3px',
                      }}>
                        {fmtTs(msg.timestamp)}
                        {isMine && <span style={{color:'#374151'}}>✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing dots */}
              {friendTyping && (
                <div style={{display:'flex',alignItems:'flex-end',gap:'6px'}}>
                  <img
                    src={friend.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.displayName||'U')}&background=6366f1&color=fff&size=56`}
                    alt="" style={{width:'28px',height:'28px',borderRadius:'50%',objectFit:'cover',border:'1.5px solid rgba(0,242,255,0.18)',flexShrink:0}}
                  />
                  <div style={{
                    background:'rgba(255,255,255,0.07)',
                    border:'1px solid rgba(255,255,255,0.07)',
                    borderRadius:'14px 14px 14px 4px',
                    padding:'10px 14px',
                    display:'flex', gap:'4px', alignItems:'center',
                  }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{
                        width:'5px', height:'5px', borderRadius:'50%',
                        background:'#00f2ff',
                        animation:`chat-typing-dot 1.2s ${i*0.22}s ease-in-out infinite`,
                      }}/>
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ══ INPUT ══ */}
            <div style={{
              padding:'9px 11px',
              borderTop:'1px solid rgba(255,255,255,0.07)',
              background:'rgba(0,0,0,0.45)',
              flexShrink:0,
              position:'relative',
            }}>
              {/* Emoji picker panel */}
              {showEmojiPicker && (
                <div style={{
                  position:'absolute', bottom:'calc(100% + 4px)', left:0, right:0,
                  background:'#0f1120',
                  border:'1px solid rgba(255,255,255,0.1)',
                  borderRadius:'14px', padding:'10px',
                  zIndex: Z.MODAL_TOP,
                  boxShadow:'0 -14px 44px rgba(0,0,0,0.8)',
                }}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px',borderBottom:'1px solid rgba(255,255,255,0.07)',paddingBottom:'6px'}}>
                    <span style={{fontSize:'11px',fontWeight:700,color:'#00f2ff'}}>{lang==='ar'?'اختر إيموجي':'Select Emoji'}</span>
                    <button onClick={()=>setShowEmojiPicker(false)} style={{background:'none',border:'none',color:'#9ca3af',cursor:'pointer',fontSize:'14px',lineHeight:1}}>✕</button>
                  </div>
                  {React.createElement(EmojiPicker, {show:true, onClose:()=>setShowEmojiPicker(false), onSelect:handleEmojiSelect, lang, inline:true})}
                </div>
              )}

              {!(isBlocked||blockedByTarget) ? (
                <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
                  {/* Emoji */}
                  <button onClick={()=>setShowEmojiPicker(v=>!v)} style={{
                    background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)',
                    borderRadius:'10px', width:'36px', height:'36px',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    cursor:'pointer', fontSize:'17px', flexShrink:0,
                  }}>😀</button>

                  {/* Image upload */}
                  <button onClick={()=>fileInputRef.current?.click()} disabled={uploadingImg}
                    title={lang==='ar'?'إرسال صورة':'Send image'}
                    style={{
                      background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)',
                      borderRadius:'10px', width:'36px', height:'36px',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      cursor:uploadingImg?'wait':'pointer', fontSize:'15px', flexShrink:0,
                      opacity:uploadingImg?0.5:1,
                    }}>{uploadingImg?'⏳':'🖼️'}</button>

                  {/* Text input */}
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={t.typeMessage || (lang==='ar'?'اكتب رسالة...':'Type a message...')}
                    value={newMsg}
                    onChange={e=>{setNewMsg(e.target.value);handleTypingStart();}}
                    onKeyPress={e=>{if(e.key==='Enter')handleSend();}}
                    onBlur={clearTyping}
                    style={{
                      flex:1, padding:'8px 11px',
                      background:'rgba(255,255,255,0.07)',
                      border:'1px solid rgba(255,255,255,0.09)',
                      borderRadius:'10px',
                      color:'white', fontSize:'13px', outline:'none',
                      transition:'border-color 0.2s',
                    }}
                    onFocus={e=>e.target.style.borderColor='rgba(0,242,255,0.35)'}
                  />

                  {/* Send button */}
                  <button onClick={handleSend} disabled={sending||!newMsg.trim()} style={{
                    background: newMsg.trim()
                      ? 'linear-gradient(135deg,rgba(0,242,255,0.22),rgba(112,0,255,0.22))'
                      : 'rgba(255,255,255,0.04)',
                    border: newMsg.trim()
                      ? '1px solid rgba(0,242,255,0.3)'
                      : '1px solid rgba(255,255,255,0.07)',
                    borderRadius:'10px', width:'36px', height:'36px',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    cursor: newMsg.trim() ? 'pointer' : 'not-allowed',
                    color: newMsg.trim() ? '#00f2ff' : '#374151',
                    fontSize:'15px', flexShrink:0,
                    transition:'all 0.2s',
                  }}>➤</button>
                </div>
              ) : (
                <div style={{textAlign:'center',fontSize:'11px',color:'#4b5563',padding:'8px'}}>
                  {lang==='ar' ? 'لا يمكنك الإرسال' : 'Cannot send messages'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gift modal */}
        {showGiftModal && (
          <SendGiftModal
            show={showGiftModal}
            onClose={()=>setShowGiftModal(false)}
            targetUser={friend}
            currentUser={currentUser}
            lang={lang}
            onSendGift={handleSendGiftToChat}
            currency={currency||0}
            friendsData={friendsData}
          />
        )}

        {/* Typing animation */}
        <style>{`
          @keyframes chat-typing-dot {
            0%,60%,100%{transform:translateY(0);opacity:0.35}
            30%{transform:translateY(-5px);opacity:1}
          }
        `}</style>
        </>
    );
};

// 📅 LOGIN REWARDS COMPONENT
