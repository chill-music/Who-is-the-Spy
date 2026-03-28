(function() {
    var { useState, useEffect } = React;

    var GroupDetailsModal = (props) => {
        var {
            showInvite, setShowInvite, friendsData, activeGroup, inviteFriend, lang,
            showDetails, setShowDetails, settingsView, setSettingsView, isOwner, isAdm,
            groupImgInputRef, grpLvl, membersData, loadingMembers, editingNotice, setEditingNotice,
            groupNotice, setGroupNotice, saveGroupNotice, saveGroupManageSettings,
            groupMuted, setGroupMuted, showReportGroup, setShowReportGroup, reportGroupReason,
            setReportGroupReason, handleSubmitGroupReport, sendingGroupReport, handleLeaveGroup,
            handleDeleteGroup, removeAdmin, makeAdmin, kickMember, groupInviteType, setGroupInviteType,
            groupIsPublic, setGroupIsPublic, transferToId, setTransferToId, showTransferConfirm,
            setShowTransferConfirm, handleTransferOwnership
        } = props;

        if (!showDetails && !showInvite) return null;

        return (
            <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(5,5,20,0.99)',zIndex:150,display:'flex',flexDirection:'column',overflow:'hidden',borderRadius:'16px'}}>
                {/* ── INVITE OVERLAY ── */}
                {showInvite && (
                    <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(5,5,20,0.97)',zIndex:160,display:'flex',flexDirection:'column',padding:'16px'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                            <div style={{fontSize:'14px',fontWeight:800,color:'#a78bfa'}}>👥 {lang==='ar'?'دعوة صديق':'Invite Friend'}</div>
                            <button onClick={()=>setShowInvite(false)} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'20px',cursor:'pointer'}}>✕</button>
                        </div>
                        <div style={{overflowY:'auto',flex:1}}>
                            {friendsData.filter(f=>!(activeGroup.members||[]).includes(f.id)).length===0
                                ? <div style={{textAlign:'center',padding:'20px',color:'#6b7280',fontSize:'12px'}}>{lang==='ar'?'لا يوجد أصدقاء لدعوتهم':'No friends to invite'}</div>
                                : friendsData.filter(f=>!(activeGroup.members||[]).includes(f.id)).map(friend=>(
                                    <div key={friend.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                                        <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',overflow:'hidden',flexShrink:0}}>
                                            {friend.photoURL?<img src={friend.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>😎</div>}
                                        </div>
                                        <div style={{flex:1,fontSize:'13px',color:'#e2e8f0',fontWeight:600}}>{friend.displayName}</div>
                                        <button onClick={()=>inviteFriend(friend.id)} style={{background:'rgba(167,139,250,0.2)',border:'1px solid rgba(167,139,250,0.4)',borderRadius:'8px',padding:'5px 12px',color:'#a78bfa',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>+ {lang==='ar'?'أضف':'Add'}</button>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                {/* ── SETTINGS HEADER ── */}
                {showDetails && (
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0,background:'rgba(7,7,22,1)'}}>
                        {settingsView !== 'main' ? (
                            <button onClick={()=>setSettingsView('main')} style={{background:'none',border:'none',color:'#00f2ff',fontSize:'14px',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',fontWeight:700,padding:0}}>
                                ‹ {lang==='ar'?'رجوع':'Back'}
                            </button>
                        ) : (
                            <button onClick={()=>setShowDetails(false)} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'20px',cursor:'pointer',padding:0}}>‹</button>
                        )}
                        <div style={{fontSize:'14px',fontWeight:800,color:'#a78bfa'}}>
                            {settingsView==='main' ? (lang==='ar'?'إعدادات الجروب':'Group Settings')
                             : settingsView==='manage' ? (lang==='ar'?'إدارة الجروب':'Manage Group')
                             : (lang==='ar'?'الأعضاء':'Members')}
                        </div>
                        <button onClick={()=>{setShowDetails(false);setSettingsView('main');}} style={{background:'none',border:'none',color:'#9ca3af',fontSize:'20px',cursor:'pointer',padding:0}}>✕</button>
                    </div>
                )}

                {/* ── SETTINGS VIEWS ── */}
                {showDetails && settingsView === 'main' && (
                    <div style={{flex:1,overflowY:'auto',paddingBottom:'16px'}}>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'20px 16px 14px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                            <div style={{position:'relative',marginBottom:'10px'}}>
                                <div style={{width:'78px',height:'78px',borderRadius:'50%',background:'linear-gradient(135deg,rgba(167,139,250,0.3),rgba(112,0,255,0.2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'38px',overflow:'hidden',border:'2px solid rgba(167,139,250,0.4)',boxShadow:'0 0 20px rgba(167,139,250,0.2)'}}>
                                    {activeGroup.photoURL?<img src={activeGroup.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'👨‍👩‍👧'}
                                </div>
                                {(isOwner||isAdm) && (
                                    <button onClick={()=>groupImgInputRef.current?.click()} style={{position:'absolute',bottom:0,right:0,width:'26px',height:'26px',borderRadius:'50%',background:'#a78bfa',border:'2px solid rgba(5,5,20,1)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'12px',padding:0}}>📷</button>
                                )}
                            </div>
                            <div style={{fontSize:'17px',fontWeight:800,color:'white',marginBottom:'4px'}}>{activeGroup.name}</div>
                            <div style={{display:'flex',gap:'8px',fontSize:'11px',color:'#6b7280',alignItems:'center'}}>
                                <span>{activeGroup.members?.length||1} {lang==='ar'?'عضو':'members'}</span>
                                <span>·</span>
                                <span style={{color:grpLvl.color,fontWeight:700}}>{grpLvl.icon} Lv.{grpLvl.level}</span>
                                {activeGroup.isPublic && <span style={{fontSize:'9px',padding:'1px 6px',borderRadius:'10px',background:'rgba(74,222,128,0.12)',border:'1px solid rgba(74,222,128,0.3)',color:'#4ade80',fontWeight:700}}>🌍 {lang==='ar'?'عام':'Public'}</span>}
                            </div>
                        </div>

                        <div style={{padding:'14px 16px'}}>
                            <div onClick={()=>setSettingsView('members')} style={{fontSize:'12px',fontWeight:700,color:'#9ca3af',marginBottom:'10px',cursor:'pointer',display:'flex',justifyContent:'space-between'}}>
                                <span>👥 {lang==='ar'?'الأعضاء':'Members'} ({activeGroup.members?.length||0})</span>
                                <span>›</span>
                            </div>
                            
                            {(isOwner||isAdm) && (
                                <div onClick={()=>setSettingsView('manage')} style={{display:'flex',alignItems:'center',gap:'12px',padding:'13px 14px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',cursor:'pointer',marginBottom:'10px'}}>
                                    <div style={{width:'32px',height:'32px',borderRadius:'9px',background:'rgba(0,242,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>⚙️</div>
                                    <div style={{flex:1}}><div style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0'}}>{lang==='ar'?'إدارة الجروب':'Manage Group'}</div></div>
                                    <span style={{color:'#6b7280',fontSize:'16px'}}>›</span>
                                </div>
                            )}

                            <div style={{height:'12px'}}/>
                            <div style={{display:'flex',gap:'8px'}}>
                                {!isOwner && <button onClick={handleLeaveGroup} style={{flex:1,padding:'12px',borderRadius:'12px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171',fontSize:'12px',fontWeight:700,cursor:'pointer'}}>🚪 {lang==='ar'?'مغادرة':'Leave'}</button>}
                                {isOwner && <button onClick={handleDeleteGroup} style={{flex:1,padding:'12px',borderRadius:'12px',background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',fontSize:'12px',fontWeight:700,cursor:'pointer'}}>🗑️ {lang==='ar'?'حذف الجروب':'Delete'}</button>}
                            </div>
                        </div>
                    </div>
                )}

                {showDetails && settingsView === 'members' && (
                    <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
                        <button onClick={()=>setShowInvite(true)} style={{width:'100%',padding:'12px',borderRadius:'12px',background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.3)',color:'#a78bfa',fontSize:'13px',fontWeight:800,marginBottom:'16px',cursor:'pointer'}}>➕ {lang==='ar'?'دعوة صديق':'Invite Friend'}</button>
                        {loadingMembers ? <div style={{textAlign:'center',padding:'20px',color:'#6b7280'}}>⏳</div> : (
                            <div style={{display:'flex',flexDirection:'column',gap:'2px'}}>
                                {membersData.sort((a,b)=>{
                                    if(a.id===activeGroup.createdBy) return -1; if(b.id===activeGroup.createdBy) return 1;
                                    var aAdm=activeGroup.admins?.includes(a.id); var bAdm=activeGroup.admins?.includes(b.id);
                                    if(aAdm&&!bAdm) return -1; if(!aAdm&&bAdm) return 1;
                                    return 0;
                                }).map(m=>(
                                    <div key={m.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                                        <div style={{width:'34px',height:'34px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',overflow:'hidden',flexShrink:0}}>
                                            {m.photoURL?<img src={m.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>😎</div>}
                                        </div>
                                        <div style={{flex:1,minWidth:0}}>
                                            <div style={{fontSize:'13px',color:'#e2e8f0',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.displayName}</div>
                                            <div style={{display:'flex',gap:'4px',marginTop:'1px'}}>
                                                {m.id===activeGroup.createdBy && <span style={{fontSize:'8px',padding:'1px 4px',borderRadius:'4px',background:'rgba(167,139,250,0.2)',color:'#a78bfa',fontWeight:800}}>OWNER</span>}
                                                {activeGroup.admins?.includes(m.id) && m.id!==activeGroup.createdBy && <span style={{fontSize:'8px',padding:'1px 4px',borderRadius:'4px',background:'rgba(0,242,255,0.15)',color:'#00f2ff',fontWeight:800}}>ADMIN</span>}
                                            </div>
                                        </div>
                                        {/* Simplified member actions */}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    window.GroupDetailsModal = GroupDetailsModal;
})();
