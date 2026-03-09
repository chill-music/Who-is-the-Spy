const PrivateChatModal = ({ show, onClose, friend, currentUser, user, lang, onSendNotification, onSendGift, currency, friendsData, onOpenProfile }) => {
    const t = TRANSLATIONS[lang];
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [sending, setSending] = useState(false);
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [blockedByTarget, setBlockedByTarget] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const chatId = friend && user ? [user.uid, friend.uid].sort().join('_') : null;

    // Check if blocked
    useEffect(() => {
        if (!show || !friend || !currentUser) return;
        // Check if current user blocked this friend
        const myBlocked = currentUser.blockedUsers || [];
        setIsBlocked(myBlocked.includes(friend.uid));

        // Check if friend blocked current user
        usersCollection.doc(friend.uid).get().then(doc => {
            if (doc.exists) {
                const theirBlocked = doc.data().blockedUsers || [];
                setBlockedByTarget(theirBlocked.includes(user.uid));
            }
        });
    }, [show, friend, currentUser, user?.uid]);

    useEffect(() => {
        if (!show || !chatId) return;
        const unsub = chatsCollection.doc(chatId).collection('messages').onSnapshot(snap => {
            let msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            msgs.sort((a, b) => { const timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds || 0; const timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds || 0; return timeA - timeB; });
            setMessages(msgs);
            chatsCollection.doc(chatId).update({ [`unread.${user.uid}`]: 0 }).catch(() => {});
        });
        return unsub;
    }, [show, chatId, user?.uid]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSend = async () => {
        if (!newMsg.trim() || sending || isBlocked || blockedByTarget) return;
        setSending(true);
        try {
            await chatsCollection.doc(chatId).collection('messages').add({
                senderId: user.uid,
                senderName: currentUser?.displayName || 'User',
                senderPhoto: currentUser?.photoURL || null,
                senderVipLevel: getVIPLevel(currentUser) || 0,
                text: newMsg.trim(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            await chatsCollection.doc(chatId).set({
                members: [user.uid, friend.uid],
                lastMessage: newMsg.trim(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                [`unread.${friend.uid}`]: firebase.firestore.FieldValue.increment(1)
            }, { merge: true });
            if (onSendNotification) await onSendNotification(friend.uid, 'message', `${currentUser?.displayName || 'User'}: ${newMsg.trim().substring(0, 50)}`, user.uid, currentUser?.displayName || 'User');
            setNewMsg('');
            playSound('click');
        } catch (e) { }
        setSending(false);
    };

    const handleEmojiSelect = (emoji) => {
        setNewMsg(prev => prev + emoji);
        setShowEmojiPicker(false);
        inputRef.current?.focus();
    };

    const handleSendGiftToChat = async (gift, targetUser, qty = 1) => {
        if (!onSendGift || isBlocked || blockedByTarget) return;
        await onSendGift(gift, targetUser, qty);
        setShowGiftModal(false);
    };

    // Handle profile opening
    const handleOpenProfile = (uid) => {
        if (onOpenProfile) {
            onOpenProfile(uid);
        }
    };

    if (!show || !friend) return null;

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="chat-modal-content animate-pop" onClick={e => e.stopPropagation()}>
                    <div className="chat-header-bar">
                        <div
                            onClick={() => handleOpenProfile(friend.uid)}
                            style={{ cursor: 'pointer', flex:1, minWidth:0 }}
                        >
                            <PlayerNameTag player={friend} lang={lang} size="sm" />
                        </div>
                        <div className="chat-header-status" style={{fontSize:'10px',color:'#9ca3af'}}>
                            {isBlocked ? (lang === 'ar' ? 'محظور' : 'Blocked') : blockedByTarget ? (lang === 'ar' ? 'تم حظرك' : 'You are blocked') : t.online}
                        </div>
                        <button onClick={() => setShowGiftModal(true)} className="gift-chat-btn" disabled={isBlocked || blockedByTarget} title={t.sendGift}>🎁</button>
                        <ModalCloseBtn onClose={onClose} />
                    </div>

                    {/* Blocked Notice */}
                    {(isBlocked || blockedByTarget) && (
                        <div className="chat-blocked-notice">
                            <span>🚫</span>
                            <span>{isBlocked
                                ? (lang === 'ar' ? 'لقد حظرت هذا المستخدم. إلغاء الحظر للمراسلة.' : 'You have blocked this user. Unblock to message.')
                                : (lang === 'ar' ? 'هذا المستخدم حظرك. لا يمكنك إرسال رسائل.' : 'This user has blocked you. You cannot send messages.')
                            }</span>
                        </div>
                    )}

                    <div className="chat-messages-container">
                        {messages.length === 0 ? <div className="text-center py-8 text-gray-400 text-sm">{t.noMessages}</div> : messages.map(msg => {
                            const isMine = msg.senderId === user?.uid;
                            const isGift = msg.type === 'gift';
                            return (
                                <div key={msg.id} className={`chat-message-row ${isMine ? 'mine' : ''} ${isGift ? 'gift-message' : ''}`}>
                                    {!isMine && (
                                        <div
                                            onClick={() => handleOpenProfile(msg.senderId || friend.uid)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <AvatarWithFrame
                                                photoURL={msg.senderPhoto || friend.photoURL}
                                                equipped={friend.equipped}
                                                size="sm"
                                            />
                                        </div>
                                    )}
                                    <div className="chat-message-content">
                                        <div
                                            className="chat-message-sender"
                                            onClick={() => handleOpenProfile(isMine ? user.uid : (msg.senderId || friend.uid))}
                                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            {/* VIP Chat Title */}
                                            {msg.senderVipLevel && VIP_CHAT_TITLE_URLS[msg.senderVipLevel] && (
                                                <span className="vip-chat-title-container" style={{
                                                    display: 'inline-block',
                                                    backgroundImage: `url(${VIP_CHAT_TITLE_URLS[msg.senderVipLevel]})`,
                                                    backgroundSize: 'contain',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'center',
                                                    width: '40px', height: '16px'
                                                }} />
                                            )}
                                            <span>{isMine ? (currentUser?.displayName || 'You') : msg.senderName}</span>
                                        </div>
                                        {isGift ? (
                                            <div className="gift-message-content">
                                                {msg.giftImageUrl ? (
                                                    <img src={msg.giftImageUrl} alt={msg.giftName} style={{width:'32px',height:'32px',objectFit:'contain',marginBottom:'2px'}} />
                                                ) : (
                                                    <div className="gift-message-icon">{msg.giftEmoji || '🎁'}</div>
                                                )}
                                                <div className="gift-message-name">
                                                    {lang === 'ar' ? msg.giftNameAr : msg.giftNameEn || msg.giftName || 'Gift'}
                                                </div>
                                                <div className="gift-message-details">
                                                    <span className="gift-charisma-badge">+{formatCharisma(msg.giftCharisma)} ⭐</span>
                                                    {msg.giftBonus > 0 && <span className="gift-bonus-badge">+{msg.giftBonus} 🧠</span>}
                                                    {msg.giftCost > 0 && <span style={{fontSize:'9px',color:'#6b7280'}}>{msg.giftCost}🧠</span>}
                                                </div>
                                            </div>
                                        ) : <div className="chat-message-bubble">{msg.text}</div>}
                                        <div className="chat-message-time">{formatTime(msg.timestamp)}</div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-input-container" style={{position:'relative'}}>
                        {showEmojiPicker && React.createElement(
                            React.Fragment, null,
                            React.createElement('div', {
                                style: {
                                    position:'absolute', bottom:'calc(100% + 6px)', left:0, right:0,
                                    background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.12)',
                                    borderRadius:'14px', padding:'10px', zIndex:Z.MODAL,
                                    boxShadow:'0 -14px 40px rgba(0,0,0,0.7)'
                                }
                            },
                                React.createElement('div', {style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'7px',borderBottom:'1px solid rgba(255,255,255,0.08)',paddingBottom:'6px'}},
                                    React.createElement('span', {style:{fontSize:'11px',fontWeight:700,color:'#00f2ff'}}, lang==='ar'?'اختر إيموجي':'Select Emoji'),
                                    React.createElement('button', {onClick:()=>setShowEmojiPicker(false),style:{background:'none',border:'none',color:'#9ca3af',cursor:'pointer',fontSize:'14px',lineHeight:1}}, '✕')
                                ),
                                React.createElement(EmojiPicker, {show:true, onClose:()=>setShowEmojiPicker(false), onSelect:handleEmojiSelect, lang, inline:true})
                            )
                        )}
                        {!(isBlocked || blockedByTarget) && (
                            <div style={{display:'flex',alignItems:'center',gap:'6px',width:'100%'}}>
                                <button
                                    className="emoji-picker-btn"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    style={{ fontSize: '22px' }}
                                >
                                    😀
                                </button>
                                <div className="chat-input-row" style={{flex:1}}>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className="chat-input"
                                        placeholder={t.typeMessage}
                                        value={newMsg}
                                        onChange={e => setNewMsg(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                                    />
                                    <button onClick={handleSend} disabled={sending || !newMsg.trim()} className="chat-send-btn">➤</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
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

        </>
    );
};

// 📅 LOGIN REWARDS COMPONENT
