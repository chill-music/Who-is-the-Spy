(function() {
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

        var isOwner = activeGroup.createdBy === currentUID;
        var isAdm = activeGroup.admins?.includes(currentUID);
        var grpLvl = window.getGroupLevel(activeGroup.xp || 0);

        return (
            <Fragment>
            <PortalModal>
                <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImageSelect} />
                <input ref={groupImgInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleGroupPhotoUpload} />

                <div style={{
                    position:'fixed', inset:0, zIndex:Z.MODAL_HIGH,
                    background:'rgba(0,0,0,0.7)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    padding:'4px',
                }} onClick={onClose}>
                    <div style={{
                        display:'flex', flexDirection:'column',
                        width:'100%', maxWidth:'min(440px, calc(100vw - 8px))',
                        height:'min(94vh,700px)', minHeight:'400px',
                        background:'linear-gradient(160deg,rgba(5,5,18,0.99),rgba(9,8,26,0.99))',
                        border:'1px solid rgba(255,255,255,0.09)',
                        borderRadius:'16px', overflow:'hidden',
                        boxShadow:'0 28px 70px rgba(0,0,0,0.9)',
                        position:'relative', boxSizing:'border-box',
                    }} onClick={e => e.stopPropagation()}>
                        {/* ── HEADER ── */}
                        <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'11px 14px',background:'rgba(7,7,22,1)',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0}}>
                            <button onClick={onClose} style={{background:'none',border:'none',color:'#00f2ff',fontSize:'20px',cursor:'pointer',padding:'0 4px',lineHeight:1}}>‹</button>
                            <div
                                onClick={()=>setShowDetails(true)}
                                style={{width:'38px',height:'38px',borderRadius:'50%',background:'linear-gradient(135deg,rgba(167,139,250,0.3),rgba(112,0,255,0.2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',flexShrink:0,overflow:'hidden',cursor:'pointer'}}
                            >
                                {activeGroup.photoURL
                                    ? <img src={activeGroup.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                                    : '👨‍👩‍👧'}
                            </div>
                            <div style={{flex:1,minWidth:0,cursor:'pointer'}} onClick={()=>setShowDetails(true)}>
                                <div style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{activeGroup.name}</div>
                                <div style={{fontSize:'10px',color:'#6b7280',display:'flex',alignItems:'center',gap:'6px'}}>
                                    <span>{activeGroup.members?.length||1} {lang==='ar'?'عضو':'members'}</span>
                                    <span style={{color:grpLvl.color,fontWeight:700}}>{grpLvl.icon} Lv.{grpLvl.level}</span>
                                </div>
                            </div>
                            {isAdm && <button onClick={()=>setShowDetails(true)} style={{background:'rgba(167,139,250,0.15)',border:'1px solid rgba(167,139,250,0.3)',borderRadius:'8px',width:'32px',height:'32px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'16px',color:'#a78bfa',flexShrink:0}} title={lang==='ar'?'إعدادات الجروب':'Group Settings'}>⚙️</button>}
                        </div>

                        {/* ── MESSAGES ── */}
                        <div style={{
                            flex:1, overflowY:'auto', padding:'12px 10px',
                            display:'flex', flexDirection:'column', gap:'4px',
                            background: activeGroup.photoURL
                                ? `linear-gradient(rgba(5,5,16,0.82),rgba(8,8,22,0.82)), url(${activeGroup.photoURL}) center/cover no-repeat`
                                : 'linear-gradient(180deg,rgba(5,5,16,0.98),rgba(8,8,22,0.98))',
                            backgroundAttachment:'local',
                        }}>
                            {messages.map(msg=>{
                                if(msg.type==='system') return(
                                    <div key={msg.id} style={{textAlign:'center',fontSize:'10px',color:'#6b7280',padding:'3px 12px',background:'rgba(255,255,255,0.04)',borderRadius:'20px',alignSelf:'center',maxWidth:'80%'}}>{msg.text}</div>
                                );
                                if(msg.type==='red_packet') {
                                    var isMeRP=msg.senderId===currentUID;
                                    var vipCfgRP = window.getVIPConfig(msg.senderVipLevel);
                                    return(
                                        <div key={msg.id} style={{display:'flex',flexDirection:isMeRP?'row-reverse':'row',gap:'7px',alignItems:'flex-end',marginBottom:'4px'}}>
                                            <div onClick={()=>openGroupMiniProfile(msg.senderId,{name:msg.senderName,photo:msg.senderPhoto})}
                                                style={{width:'28px',height:'28px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',overflow:'hidden',flexShrink:0,cursor:'pointer',border:vipCfgRP?`2px solid ${vipCfgRP.nameColor}`:'2px solid rgba(255,255,255,0.1)'}}>
                                                {msg.senderPhoto?<img src={msg.senderPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px'}}>😎</div>}
                                            </div>
                                            <div style={{maxWidth:'min(220px, calc(100vw - 90px))'}}>
                                                <div onClick={()=>openGroupMiniProfile(msg.senderId,{name:msg.senderName,photo:msg.senderPhoto})}
                                                    style={{fontSize:'9px',color:vipCfgRP?vipCfgRP.nameColor:'#a78bfa',fontWeight:700,marginBottom:'3px',paddingLeft:'4px',cursor:'pointer',display:'flex',alignItems:'center',gap:'3px'}}>
                                                    {vipCfgRP && <span style={{fontSize:'7px',fontWeight:900,background:vipCfgRP.nameColor,color:'#000',padding:'0 3px',borderRadius:'2px'}}>VIP{msg.senderVipLevel}</span>}
                                                    {msg.senderName}
                                                    {isMeRP&&<span style={{fontSize:'8px',color:'#4b5563'}}> ({lang==='ar'?'أنت':'you'})</span>}
                                                </div>
                                                <button onClick={()=>claimRedPacket(msg.rpId)} style={{
                                                    display:'flex',alignItems:'center',gap:'10px',padding:'12px 16px',borderRadius:'16px',
                                                    background:`linear-gradient(135deg,rgba(239,68,68,0.25),rgba(185,28,28,0.2))`,
                                                    border:`1px solid rgba(239,68,68,0.5)`,cursor:'pointer',width:'100%',
                                                    boxShadow:`0 4px 16px rgba(239,68,68,0.3)`,
                                                }}>
                                                    <div style={{fontSize:'32px',filter:'drop-shadow(0 0 8px rgba(239,68,68,0.7))'}}>🧧</div>
                                                    <div style={{flex:1,textAlign:'left'}}>
                                                        <div style={{fontSize:'12px',fontWeight:800,color:'#ffd700'}}>{lang==='ar'?'مغلف أحمر':'Red Packet'}</div>
                                                        <div style={{fontSize:'10px',color:'#fca5a5',marginTop:'2px'}}>{msg.rpAmount?.toLocaleString()} 🧠 · {msg.maxClaims} {lang==='ar'?'مستلم':'claims'}</div>
                                                        <div style={{fontSize:'9px',color:'rgba(252,165,165,0.7)',marginTop:'2px'}}>{lang==='ar'?'اضغط للاستلام':'Tap to claim'} 🎁</div>
                                                    </div>
                                                </button>
                                                <div style={{fontSize:'9px',color:'#374151',marginTop:'2px',textAlign:isMeRP?'right':'left',paddingLeft:'4px'}}>{fmtTime(msg.createdAt)}</div>
                                            </div>
                                        </div>
                                    );
                                }
                                var isMe=msg.senderId===currentUID;
                                var isImage=msg.type==='image';
                                var vipCfgMsg = window.getVIPConfig(msg.senderVipLevel);
                                var nameColor = vipCfgMsg ? vipCfgMsg.nameColor : (isMe ? '#00f2ff' : '#a78bfa');
                                return(
                                    <div key={msg.id} style={{display:'flex',flexDirection:isMe?'row-reverse':'row',gap:'7px',alignItems:'flex-end'}}>
                                        <div style={{position:'relative',width:'30px',height:'30px',flexShrink:0}}>
                                            <div
                                                onClick={()=>openGroupMiniProfile(msg.senderId,{name:msg.senderName,photo:msg.senderPhoto})}
                                                style={{width:'30px',height:'30px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',overflow:'hidden',cursor:'pointer',border:vipCfgMsg?`2px solid ${vipCfgMsg.nameColor}`:'2px solid rgba(255,255,255,0.1)',boxShadow:vipCfgMsg?`0 0 6px ${vipCfgMsg.nameColor}66`:'none',position:'relative'}}>
                                                {msg.senderPhoto?<img src={msg.senderPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}>😎</div>}
                                                {msg.senderFrame && <img src={msg.senderFrame} alt="" onError={e=>e.target.style.display='none'} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',pointerEvents:'none'}}/>}
                                            </div>
                                        </div>
                                        <div style={{maxWidth:'min(70%, calc(100vw - 80px))'}}>
                                            <div style={{marginBottom:'2px',paddingLeft:isMe?0:'4px',paddingRight:isMe?'4px':0}}>
                                                <div style={{display:'flex',alignItems:'center',gap:'4px',flexWrap:'wrap',cursor:'pointer',justifyContent:isMe?'flex-end':'flex-start'}}
                                                    onClick={()=>openGroupMiniProfile(msg.senderId,{name:msg.senderName,photo:msg.senderPhoto})}>
                                                    {vipCfgMsg && (
                                                        <span style={{fontSize:'7px',fontWeight:900,background:vipCfgMsg.nameColor,color:'#000',padding:'1px 3px',borderRadius:'2px',flexShrink:0}}>VIP{msg.senderVipLevel}</span>
                                                    )}
                                                    <span style={{fontSize:'9px',color:nameColor,fontWeight:700}}>{msg.senderName}{isMe?` (${lang==='ar'?'أنت':'you'})`:''}</span>
                                                    {msg.senderVipLevel > 0 && typeof window.VIP_CHAT_TITLE_URLS !== 'undefined' && window.VIP_CHAT_TITLE_URLS?.[msg.senderVipLevel] && (
                                                        <img src={window.VIP_CHAT_TITLE_URLS[msg.senderVipLevel]} alt="" style={{height:'11px',objectFit:'contain'}}/>
                                                    )}
                                                    {(msg.senderBadges||[]).slice(0,3).map((b,bi)=>{
                                                        if (!b) return null;
                                                        var badge = typeof window.ACHIEVEMENTS !== 'undefined' ? window.ACHIEVEMENTS.find(a=>a.id===b) : null;
                                                        if (!badge) return null;
                                                        return badge.imageUrl
                                                            ? <img key={bi} src={badge.imageUrl} alt="" onError={e=>e.target.style.display='none'} style={{width:'12px',height:'12px',objectFit:'contain',flexShrink:0}}/>
                                                            : <span key={bi} style={{fontSize:'10px'}}>{badge.icon||'🏅'}</span>;
                                                    })}
                                                </div>
                                                {msg.senderTitle && <div style={{fontSize:'8px',color:'#fbbf24',marginTop:'1px',fontStyle:'italic',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'140px',textAlign:isMe?'right':'left'}}>{msg.senderTitle}</div>}
                                            </div>
                                            {isImage ? (
                                                <div onClick={()=>{var w=window.open();w.document.write(`<body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${msg.imageData}" style="max-width:100vw;max-height:100vh;object-fit:contain"></body>`);}}
                                                    style={{borderRadius:isMe?'14px 14px 4px 14px':'14px 14px 14px 4px',overflow:'hidden',border:`1px solid ${isMe?'rgba(0,242,255,0.18)':'rgba(255,255,255,0.09)'}`,cursor:'pointer',maxWidth:'min(200px, calc(100vw - 90px))'}}>
                                                    <img src={msg.imageData} alt="📷" style={{display:'block',maxWidth:'min(200px, calc(100vw - 90px))',maxHeight:'200px',objectFit:'cover'}}/>
                                                </div>
                                            ) : (
                                                <div style={{padding:'8px 12px',borderRadius:isMe?'14px 4px 14px 14px':'4px 14px 14px 14px',background:isMe?'linear-gradient(135deg,rgba(112,0,255,0.45),rgba(0,242,255,0.2))':'rgba(255,255,255,0.08)',border:isMe?'1px solid rgba(0,242,255,0.2)':'1px solid rgba(255,255,255,0.09)',fontSize:'12px',color:'#e2e8f0',lineHeight:1.5,wordBreak:'break-word'}}>{msg.text}</div>
                                            )}
                                            <div style={{fontSize:'9px',color:'#374151',marginTop:'2px',textAlign:isMe?'right':'left',paddingLeft:'4px',paddingRight:'4px'}}>{fmtTime(msg.createdAt)}</div>
                                        </div>
                                    </div>
                                );
                            })}
                            {messages.length===0&&<div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'8px',color:'#4b5563',paddingTop:'40px'}}><div style={{fontSize:'32px'}}>💬</div><div style={{fontSize:'12px'}}>{lang==='ar'?'ابدأ المحادثة!':'Say hi!'}</div></div>}
                            <div ref={messagesEndRef}/>
                        </div>

                        {/* ── INPUT BAR ── */}
                        <div style={{display:'flex',gap:'5px',padding:'8px 8px',borderTop:'1px solid rgba(255,255,255,0.07)',flexShrink:0,background:'rgba(0,0,0,0.45)',boxSizing:'border-box',width:'100%'}}>
                            <button onClick={()=>setShowEmojiPicker(v=>!v)} style={{width:'34px',height:'34px',borderRadius:'10px',border:`1px solid ${showEmojiPicker?'rgba(0,242,255,0.3)':'rgba(255,255,255,0.08)'}`,background:showEmojiPicker?'rgba(0,242,255,0.12)':'rgba(255,255,255,0.05)',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>😀</button>
                            <button onClick={()=>fileInputRef.current?.click()} disabled={uploadingImg} title={lang==='ar'?'إرسال صورة':'Send image'} style={{width:'36px',height:'36px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.05)',cursor:uploadingImg?'wait':'pointer',fontSize:'15px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,opacity:uploadingImg?0.5:1}}>
                                {uploadingImg?'⏳':'🖼️'}
                            </button>
                            <button onClick={()=>setShowRedPacketModal(true)} title={lang==='ar'?'مغلف أحمر':'Red Packet'}
                                style={{width:'36px',height:'36px',borderRadius:'10px',border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.1)',cursor:'pointer',fontSize:'17px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                🧧
                            </button>
                            <input
                                ref={chatInputRef}
                                value={msgText}
                                onChange={e=>setMsgText(e.target.value)}
                                onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),sendMessage())}
                                style={{flex:1,padding:'8px 10px',borderRadius:'12px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontSize:'13px',outline:'none',minWidth:0,width:'100%'}}
                                placeholder={lang==='ar'?'اكتب رسالة...':'Type a message...'}
                            />
                            <button onClick={sendMessage} disabled={!msgText.trim()} style={{width:'38px',height:'38px',borderRadius:'12px',border:'none',cursor:'pointer',flexShrink:0,background:msgText.trim()?'linear-gradient(135deg,#7000ff,#00f2ff)':'rgba(255,255,255,0.06)',color:msgText.trim()?'white':'#6b7280',fontSize:'16px',transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center'}}>➤</button>
                        </div>
                    </div>
                </div>
            </PortalModal>
            </Fragment>
        );
    };

    window.GroupChatModal = GroupChatModal;
})();
