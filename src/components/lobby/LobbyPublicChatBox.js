(function() {
    var { useState, useEffect, useRef } = React;
/**
 * LobbyPublicChatBox Component
 * Modularized from 14-modals-misc.js
 */
var LobbyPublicChatBox = ({ currentUser, user, lang, isLoggedIn, onOpenProfile, currentUID, onOpenFull }) => {
    var [messages, setMessages] = useState([]);
    var [msgText, setMsgText] = useState('');
    var [sending, setSending] = useState(false);
    var [cooldown, setCooldown]   = useState(0);
    var [miniProfile, setMiniProfile] = useState(null);
    var messagesEndRef = useRef(null);
    var inputRef = useRef(null);
    var cooldownRef = useRef(null);

    // Open mini profile instead of full profile
    var openMini = async (uid, basicData) => {
        if (!uid) return;
        setMiniProfile({ uid, name: basicData?.name || '...', photo: basicData?.photo || null, loading: true });
        var friends = currentUser ? (currentUser.friends || []) : [];
        var data = typeof fetchMiniProfileData === 'function' ? await fetchMiniProfileData(uid, friends) : null;
        if (data) setMiniProfile(data);
    };

    var isFirstLoad = useRef(true);
    useEffect(() => {
        var unsub = publicChatCollection
            .orderBy('createdAt', 'asc')
            .limitToLast(30)
            .onSnapshot(snap => {
                setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                // Only auto-scroll after user has interacted (not on initial page load)
                if (!isFirstLoad.current) {
                    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
                }
                isFirstLoad.current = false;
            }, () => {});
        return () => unsub();
    }, []);

    var sendMsg = async () => {
        if (!msgText.trim() || !user || !isLoggedIn || sending || cooldown > 0) return;
        var text = msgText.trim(); setMsgText(''); setSending(true);
        try {
            var vipLevel = (typeof window.getVIPLevel === 'function') ? (window.getVIPLevel(currentUser) || 0) : 0;
            await publicChatCollection.add({
                type: 'text', text,
                senderId: user.uid,
                senderName: currentUser?.displayName || 'User',
                senderPhoto: currentUser?.photoURL || null,
                senderVipLevel: vipLevel,
                senderTitle: currentUser?.activeTitle || null,
                senderFrame: currentUser?.equipped?.frames || null,
                senderBadges: (currentUser?.equipped?.badges || []).slice(0, 3),
                createdAt: TS(),
            });
            // ── 5-second cooldown after each message ──
            setCooldown(5);
            if (cooldownRef.current) clearInterval(cooldownRef.current);
            cooldownRef.current = setInterval(() => {
                setCooldown(prev => {
                    if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
                    return prev - 1;
                });
            }, 1000);
        } catch(e) { setMsgText(text); }
        setSending(false);
    };

    var fmtTs = (ts) => {
        if (!ts) return '';
        var d = ts?.toDate ? ts.toDate() : new Date((ts?.seconds||0)*1000);
        return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    };

    var visibleMsgs = messages.filter(m => m.type === 'text' || m.type === 'image' || m.type === 'red_packet');

    return (
        <>
        <div style={{margin:'0 8px 16px',background:'linear-gradient(160deg,rgba(5,5,18,0.98),rgba(9,8,26,0.96))',border:'1px solid rgba(74,222,128,0.15)',borderRadius:'16px',overflow:'hidden',boxSizing:'border-box',width:'calc(100% - 16px)'}}>
            {/* Messages */}
            <div style={{height:'clamp(140px,25vw,200px)',overflowY:'auto',padding:'10px 10px 4px',display:'flex',flexDirection:'column',gap:'4px'}}>
                {visibleMsgs.length === 0 && (
                    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'#4b5563',fontSize:'11px',flexDirection:'column',gap:'4px'}}>
                        <span style={{fontSize:'24px'}}>🌍</span>
                        <span>{lang==='ar'?'لا رسائل بعد — كن الأول!':'No messages yet — be the first!'}</span>
                    </div>
                )}
                {visibleMsgs.map((msg, i) => {
                    var isMe = msg.senderId === currentUID;
                    var vipCfg = window.getVIPConfig(msg.senderVipLevel);
                    if (msg.type === 'red_packet') return (
                        <div key={msg.id||i} style={{alignSelf:'center',fontSize:'10px',color:'#ffd700',padding:'3px 10px',background:'rgba(239,68,68,0.08)',borderRadius:'12px',border:'1px solid rgba(239,68,68,0.2)'}}>
                            🧧 {msg.senderName} {lang==='ar'?'أرسل مغلف':'sent a packet'} {msg.rpAmount?.toLocaleString()} 🧠
                        </div>
                    );
                    return (
                        <div key={msg.id||i} style={{display:'flex',flexDirection:isMe?'row-reverse':'row',gap:'6px',alignItems:'flex-end'}}>
                            {/* Avatar — clickable → mini profile */}
                            <div onClick={() => openMini(msg.senderId, { name: msg.senderName, photo: msg.senderPhoto })}
                                style={{width:'24px',height:'24px',borderRadius:'50%',overflow:'hidden',flexShrink:0,cursor:'pointer',border:vipCfg?`1.5px solid ${vipCfg.nameColor}`:'1.5px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.08)'}}>
                                {msg.senderPhoto ? <img src={msg.senderPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span style={{fontSize:'11px',display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>😎</span>}
                            </div>
                            <div style={{maxWidth:'min(70%, calc(100vw - 70px))' }}>
                                <div onClick={() => openMini(msg.senderId, { name: msg.senderName, photo: msg.senderPhoto })}
                                    style={{display:'flex',alignItems:'center',gap:'3px',marginBottom:'1px',cursor:'pointer',justifyContent:isMe?'flex-end':'flex-start'}}>
                                    <span style={{fontSize:'8px',fontWeight:700,color:vipCfg?vipCfg.nameColor:'#a78bfa'}}>{msg.senderName}</span>
                                    {vipCfg && <span style={{fontSize:'7px',fontWeight:900,background:vipCfg.nameColor,color:'#000',padding:'0 2px',borderRadius:'2px'}}>VIP{msg.senderVipLevel}</span>}
                                    {msg.senderVipLevel > 0 && typeof VIP_CHAT_TITLE_URLS !== 'undefined' && VIP_CHAT_TITLE_URLS?.[msg.senderVipLevel] && <img src={VIP_CHAT_TITLE_URLS[msg.senderVipLevel]} alt="" style={{height:'10px',objectFit:'contain'}}/>}
                                </div>
                                {msg.type === 'image' ? (
                                    <div style={{borderRadius:'8px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.08)',maxWidth:'min(120px, calc(100vw - 90px))'}}>
                                        <img src={msg.imageData} alt="📷" style={{display:'block',maxWidth:'min(120px, calc(100vw - 90px))',maxHeight:'120px',objectFit:'cover'}}/>
                                    </div>
                                ) : (
                                    <div style={{padding:'6px 10px',borderRadius:isMe?'12px 4px 12px 12px':'4px 12px 12px 12px',background:isMe?'linear-gradient(135deg,rgba(112,0,255,0.35),rgba(0,242,255,0.15))':'rgba(255,255,255,0.07)',border:isMe?'1px solid rgba(0,242,255,0.15)':'1px solid rgba(255,255,255,0.08)',fontSize:'11px',color:'#e2e8f0',lineHeight:1.4,wordBreak:'break-word'}}>
                                        {msg.text}
                                    </div>
                                )}
                                <div style={{fontSize:'8px',color:'#374151',marginTop:'1px',textAlign:isMe?'right':'left',paddingLeft:'2px'}}>{fmtTs(msg.createdAt)}</div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef}/>
            </div>
            {/* Input */}
            {isLoggedIn ? (
                <div style={{display:'flex',gap:'4px',padding:'7px 8px',borderTop:'1px solid rgba(255,255,255,0.06)',background:'rgba(0,0,0,0.3)',boxSizing:'border-box',width:'100%'}}>
                    <input ref={inputRef} value={msgText} onChange={e=>setMsgText(e.target.value)}
                        onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),sendMsg())}
                        style={{flex:1,padding:'7px 8px',borderRadius:'10px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:'12px',outline:'none',minWidth:0}}
                        placeholder={lang==='ar'?'اكتب...':'Write...'}/>
                    <button onClick={sendMsg} disabled={!msgText.trim()||sending||cooldown > 0}
                        style={{width:'34px',height:'34px',borderRadius:'10px',border:'none',background:(msgText.trim()&&cooldown===0)?'linear-gradient(135deg,#7000ff,#00f2ff)':'rgba(255,255,255,0.05)',color:(msgText.trim()&&cooldown===0)?'white':'#4b5563',fontSize:cooldown > 0?'10px':'14px',fontWeight:cooldown > 0?900:400,cursor:(msgText.trim()&&cooldown===0)?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        {cooldown > 0 ? cooldown : '➤'}
                    </button>
                    <button onClick={onOpenFull}
                        style={{width:'34px',height:'34px',borderRadius:'10px',border:'1px solid rgba(74,222,128,0.3)',background:'rgba(74,222,128,0.08)',color:'#4ade80',fontSize:'13px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}} title={lang==='ar'?'فتح كامل':'Open full'}>⛶</button>
                </div>
            ) : (
                <div style={{padding:'8px 12px',borderTop:'1px solid rgba(255,255,255,0.06)',textAlign:'center',color:'#6b7280',fontSize:'11px'}}>
                    🔐 {lang==='ar'?'سجّل دخول للكتابة':'Login to chat'}
                    <button onClick={onOpenFull} style={{marginLeft:'8px',padding:'3px 10px',borderRadius:'8px',background:'rgba(74,222,128,0.1)',border:'1px solid rgba(74,222,128,0.3)',color:'#4ade80',fontSize:'10px',fontWeight:700,cursor:'pointer'}}>{lang==='ar'?'قراءة':'Read'}</button>
                </div>
            )}
        </div>
        {/* Mini Profile Popup */}
        {miniProfile && window.MiniProfilePopup && (
            <window.MiniProfilePopup
                profile={miniProfile}
                onClose={() => setMiniProfile(null)}
                currentUID={currentUID}
                lang={lang}
                onOpenProfile={(uid) => { setMiniProfile(null); if (onOpenProfile) onOpenProfile(uid); }}
                zIndex={(window.Z && window.Z.MODAL_HIGH ? window.Z.MODAL_HIGH : 9000) + 20}
            />
        )}
        </>
    );
};

window.LobbyPublicChatBox = LobbyPublicChatBox;
})();
