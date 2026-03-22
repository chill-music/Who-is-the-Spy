var { 
    Z, 
    RED_PACKETS_CONFIG, 
    CHEST_CONFIG, 
    FAMILY_COINS_SYMBOL, 
    ACTIVENESS_MILESTONES, 
    PortalModal, 
    fetchMiniProfileData 
} = window;
var { 
    getFamilySignLevelData, 
    getFamilyLevelConfig 
} = window.FamilyConstants;
var { 
    firebase, 
    auth, 
    db, 
    usersCollection, 
    familiesCollection, 
    redPacketsCollection, 
    reportsCollection, 
    publicChatCollection 
} = window;
var playNotificationSound = window.playNotificationSound || (() => {});
var { 
    canManageFamily, 
    sendMessage: serviceSendMessage, 
    handleImageUpload: serviceHandleImageUpload 
} = window.FamilyService;
var { renderMsgText: utilRenderMsgText } = window.FamilyUtils;
var TS = window.TS || (() => firebase.firestore.FieldValue.serverTimestamp());
var { MiniProfilePopup, FamilySignBadge, RedPacketCard } = window;
var { SendGiftModal } = window;

/**
 * FamilyChatModal - Extracted component for family chat functionality.
 */
var FamilyChatModal = (props) => {
    var { isOpen, onClose, currentUID, currentUserData, lang, onSendGift, userData, onNotification, onOpenProfile, onOpenFamily, family, S, myRole } = props;
    var show = props.show !== undefined ? props.show : (isOpen !== undefined ? isOpen : !onClose);
    var familyData = props.familyData || family;
    var familyId = props.familyId || familyData?.id || userData?.familyId || currentUserData?.familyId;

    const [messages, setMessages] = React.useState([]);
    const [chatInput, setChatInput] = React.useState('');
    const [sendingMsg, setSendingMsg] = React.useState(false);
    const [prevMsgCount, setPrevMsgCount] = React.useState(0);
    var chatEndRef = React.useRef(null);
    var imgInputRef = React.useRef(null);
    var chatInputRef = React.useRef(null);
    const [openingChest, setOpeningChest] = React.useState(false);
    const [chestDetailMsg, setChestDetailMsg] = React.useState(null);
    // ── Gift modal ──
    const [giftTarget, setGiftTarget] = React.useState(null); // null = self, { uid, displayName, photoURL }
    const [showChatGiftModal, setShowChatGiftModal] = React.useState(false);
    const [showFamRPModal, setShowFamRPModal] = React.useState(false);
    const [sendingFamRP, setSendingFamRP] = React.useState(false);
    // ── Mini profile popup ──
    const [miniProfile, setMiniProfile] = React.useState(null);
    // ── @ Mention ──
    const [mentionSearch, setMentionSearch] = React.useState('');
    const [showMentionList, setShowMentionList] = React.useState(false);
    const [familyMembers, setFamilyMembers] = React.useState([]);

    // ── فتح ميني بروفايل في شات القبيلة ──
    var openFamilyChatMiniProfile = async function(uid, basicData) {
        if (!uid) return;
        setMiniProfile({ uid, name: (basicData && basicData.name) || '...', photo: (basicData && basicData.photo) || null, loading: true });
        var data = await fetchMiniProfileData(uid, (userData && userData.friends) || []);
        if (data) setMiniProfile(data);
    };

    // جلب أعضاء العائلة للمنشن
    React.useEffect(() => {
        if (!show || !familyId) return;
        var unsub = familiesCollection.doc(familyId).onSnapshot(snap => {
            if (!snap.exists) return;
            var memberIds = snap.data().members || [];
            if (memberIds.length === 0) return;
            // جلب بيانات الأعضاء (أول 10 للمنشن)
            usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', memberIds.slice(0,10))
                .get().then(s => setFamilyMembers(s.docs.map(d => ({ id: d.id, ...d.data() }))))
                .catch(() => {});
        }, () => {});
        return () => unsub();
    }, [show, familyId]);

    React.useEffect(() => {
        if (!show || !familyId) return;
        var unsub = familiesCollection.doc(familyId).collection('messages')
            .orderBy('timestamp', 'desc').limit(80)
            .onSnapshot(snap => {
                var msgs = snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
                // صوت + نوتيفيكيشن لما تيجي رسالة جديدة
                if (prevMsgCount > 0 && msgs.length > prevMsgCount) {
                    var newest = msgs[msgs.length - 1];
                    if (newest && newest.senderId !== currentUID) {
                        try { playNotificationSound(); } catch(e) {}
                        if (onNotification) {
                            var senderName = newest.senderName || (lang==='ar'?'عضو':'Member');
                            var preview = newest.type === 'image' ? '📷' : (newest.text || '').slice(0, 40);
                            onNotification(`💬 ${senderName}: ${preview}`);
                        }
                    }
                }
                setPrevMsgCount(msgs.length);
                setMessages(msgs);
            }, () => {});
        return () => unsub();
    }, [show, familyId, prevMsgCount, currentUID, lang, onNotification]);

    React.useEffect(() => {
        if (show) setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 120);
    }, [messages.length, show]);

    var canManageFamilyChat = familyData ? canManageFamily(familyData, currentUID) : false;

    // ── معالجة @ Mention ──
    var handleInputChange = function(e) {
        var val = e.target.value;
        setChatInput(val);
        var lastAt = val.lastIndexOf('@');
        if (lastAt !== -1) {
            var after = val.slice(lastAt + 1);
            if (!after.includes(' ')) {
                setMentionSearch(after.toLowerCase());
                setShowMentionList(true);
                return;
            }
        }
        setShowMentionList(false);
    };

    var selectMention = function(member) {
        var lastAt = chatInput.lastIndexOf('@');
        var newVal = chatInput.slice(0, lastAt) + '@' + member.displayName + ' ';
        setChatInput(newVal);
        setShowMentionList(false);
        setTimeout(function() { chatInputRef.current && chatInputRef.current.focus(); }, 50);
    };

    // ── Open assigned chest from family chat ──
    var openAssignedChest = async (inventoryIdx) => {
        if (!familyId || !currentUID || openingChest) return;
        setOpeningChest(true);
        try {
            var result = await FamilyService.openAssignedChest({
                family: familyData,
                currentUID,
                currentUserData,
                inventoryIdx,
                lang,
                onNotification
            });
            
            if (!result) {
                setOpeningChest(false);
                return;
            }
            // Receipt and notification are handled by the service and component-level receipt text
        } catch (e) {
            console.error('FamilyChatModal.openAssignedChest Error:', e);
            if (onNotification) onNotification(lang==='ar'?'❌ خطأ في فتح الصندوق':'❌ Error opening chest');
        } finally {
            setOpeningChest(false);
        }
    };

    var selfMember = currentUserData ? [{ id: currentUID, displayName: currentUserData.displayName, photoURL: currentUserData.photoURL }] : [];
    var mentionMembers = [...selfMember, ...familyMembers.filter(function(m) { return m.id !== currentUID; })]
        .filter(function(m) { return !mentionSearch || (m.displayName || '').toLowerCase().includes(mentionSearch); });

    var sendMessage = async (text, type, extra) => {
        type = type || 'text';
        extra = extra || {};
        if ((!text || !text.trim()) && type === 'text') return;
        if (!familyId || !currentUID || sendingMsg) return;
        setSendingMsg(true);
        try {
            var msgText = (text || '').trim();
            var isAnnouncementCmd = canManageFamilyChat && type === 'text' && msgText.toLowerCase().startsWith('announcement ');
            var finalType = isAnnouncementCmd ? 'announcement' : type;
            var finalText = isAnnouncementCmd ? msgText.slice('announcement '.length).trim() : msgText;
            if (isAnnouncementCmd && finalText) {
                await familiesCollection.doc(familyId).update({
                    announcement: finalText,
                    announcementBy: currentUserData?.displayName || 'Admin',
                }).catch(function() {});
            }
            await familiesCollection.doc(familyId).collection('messages').add({
                senderId: currentUID,
                senderName: currentUserData?.displayName || 'Member',
                senderPhoto: currentUserData?.photoURL || null,
                text: finalText,
                type: finalType,
                timestamp: TS(),
                ...extra,
            });
            if (type === 'text') setChatInput('');
            await familiesCollection.doc(familyId).update({
                lastChatMessage: finalText || (type === 'image' ? '📷' : ''),
                lastChatSenderId: currentUID,
                lastChatAt: TS(),
                lastChatAtMs: Date.now(),
                ['chatReadBy.' + currentUID]: TS(),
            }).catch(function() {});
        } catch (e) { console.error('FamilyChatModal sendMessage error:', e); }
        setSendingMsg(false);
    };

    var handleImageUpload = async function(e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
            var base64 = await serviceHandleImageUpload(file);
            sendMessage('', 'image', { imageUrl: base64 });
        } catch(e) { console.error('Image upload failed:', e); }
        e.target.value = '';
    };

    var fmtTime = function(ts) {
        if (!ts) return '';
        var d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
        var diff = Date.now() - d.getTime();
        if (diff < 60000) return lang === 'ar' ? 'الآن' : 'now';
        if (diff < 3600000) return Math.floor(diff/60000) + (lang==='ar'?'د':'m');
        if (diff < 86400000) return Math.floor(diff/3600000) + (lang==='ar'?'س':'h');
        return Math.floor(diff/86400000) + (lang==='ar'?'ي':'d');
    };

    // --- Using the extracted utility ---
    var renderMsgText = (text) => utilRenderMsgText(text, familyMembers, currentUserData, currentUID, openFamilyChatMiniProfile);

    if (!show) return null;

    var signData = (familyData ? getFamilySignLevelData(familyData.weeklyActiveness || 0) : null) || { level:0, color:'#4b5563', glow:'rgba(75,85,99,0.3)', defaultIcon:'🏠' };
    var fLvl = familyData ? getFamilyLevelConfig(familyData.level || 1) : null;

    return React.createElement(PortalModal, null,
        React.createElement('div', {
            style: { position:'fixed', inset:0, zIndex: Z.MODAL, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', padding:'12px' },
            onClick: onClose
        },
        React.createElement('div', {
            style: { position:'relative', display:'flex', flexDirection:'column', width:'100%', maxWidth:'480px', height:'min(88vh, 700px)', minHeight:'400px', background:'linear-gradient(180deg,#0d0d1f 0%,#08080f 100%)', border:'1px solid rgba(0,242,255,0.15)', borderRadius:'20px', overflow:'hidden', boxShadow:'0 28px 70px rgba(0,0,0,0.95)' },
            onClick: function(e) { e.stopPropagation(); }
        },
            // Header
            React.createElement('div', {
                style: { display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', background:'rgba(0,0,0,0.4)', flexShrink:0 }
            },
                React.createElement('button', { onClick: onClose, style: { background:'none', border:'none', color:'#00f2ff', fontSize:'20px', cursor:'pointer', padding:'0 4px' } }, '‹'),
                React.createElement('div', {
                    onClick: function() { onOpenFamily && onOpenFamily(); },
                    style: { width:'40px', height:'40px', borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'linear-gradient(135deg,' + signData.color + '22,rgba(0,0,0,0.3))', border:'2px solid ' + signData.color + '55', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', cursor: onOpenFamily ? 'pointer' : 'default' }
                }, familyData && familyData.photoURL ? React.createElement('img', { src: familyData.photoURL, alt:'', style:{width:'100%',height:'100%',objectFit:'cover'}}) : (familyData && familyData.emblem) || '🏠'),
                React.createElement('div', {
                    onClick: function() { onOpenFamily && onOpenFamily(); },
                    style: { flex:1, minWidth:0, cursor: onOpenFamily ? 'pointer' : 'default' }
                },
                    React.createElement('div', { style: { display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' } },
                        React.createElement('span', { style: { fontSize:'14px', fontWeight:800, color: onOpenFamily ? '#00f2ff' : 'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textDecoration: onOpenFamily ? 'underline dotted rgba(0,242,255,0.4)' : 'none' } }, (familyData && familyData.name) || (lang==='ar'?'شات العائلة':'Family Chat')),
                        familyData && signData.level > 0 && React.createElement(FamilySignBadge, { tag: familyData.tag, color: signData.color, small: true, signLevel: signData.level, imageURL: familyData.signImageURL })
                    ),
                    React.createElement('div', { style: { fontSize:'10px', color:'#6b7280' } },
                        ((familyData && familyData.members && familyData.members.length) || 0) + ' ' + (lang==='ar'?'عضو':'members'),
                        fLvl && React.createElement('span', { style: { color: fLvl.color, marginLeft:'4px' } }, fLvl.icon + ' Lv.' + fLvl.level)
                    )
                )
            ),
            // Pinned Announcement Bar
            familyData && familyData.announcement && React.createElement('div', {
                style: { flexShrink:0, margin:'8px 10px 4px', padding:'9px 14px', borderRadius:'12px', background:'linear-gradient(135deg,rgba(255,165,0,0.18),rgba(255,80,0,0.12))', border:'1px solid rgba(255,165,0,0.45)', boxShadow:'0 0 16px rgba(255,140,0,0.2)', position:'relative', overflow:'hidden' }
            },
                React.createElement('div', { style: { position:'absolute', left:0, top:0, bottom:0, width:'4px', background:'linear-gradient(180deg,#ffd700,#ff8800)', borderRadius:'12px 0 0 12px' } }),
                React.createElement('div', { style: { display:'flex', alignItems:'flex-start', gap:'8px', paddingLeft:'6px' } },
                    React.createElement('span', { style: { fontSize:'16px', lineHeight:1, flexShrink:0 } }, '📢'),
                    React.createElement('div', { style: { flex:1, minWidth:0 } },
                        React.createElement('div', { style: { fontSize:'9px', fontWeight:800, color:'#fbbf24', letterSpacing:'1px', marginBottom:'3px', textTransform:'uppercase' } },
                            (lang==='ar'?'إعلان من الإدارة':'ANNOUNCEMENT') + (familyData.announcementBy ? ' · ' + familyData.announcementBy : '')
                        ),
                        React.createElement('div', { style: { fontSize:'12px', color:'#fde68a', lineHeight:1.5, fontWeight:600, wordBreak:'break-word' } }, familyData.announcement)
                    )
                )
            ),
            // ── Mini Profile Popup ──
            miniProfile && React.createElement(MiniProfilePopup, {
                profile: miniProfile,
                onClose: function() { setMiniProfile(null); },
                currentUID: currentUID,
                lang: lang,
                onOpenProfile: onOpenProfile,
                onSendGift: onSendGift ? function(p) {
                    setGiftTarget({ uid: p.uid, displayName: p.name, photo: p.photo });
                    setShowChatGiftModal(true);
                } : null,
                onReport: async function(p) {
                    try {
                        await reportsCollection.add({
                            type: 'user',
                            reporterUID: currentUID,
                            reporterName: (currentUserData && currentUserData.displayName) || 'User',
                            reportedUID: p.uid, reportedName: p.name,
                            reason: 'family_chat_report',
                            createdAt: TS(),
                            status: 'pending',
                        });
                    } catch(e) {}
                    if (onNotification) onNotification(lang === 'ar' ? '✅ تم إرسال البلاغ' : '✅ Report sent');
                },
            }),
            // Messages
            React.createElement('div', {
                style: { flex:1, overflowY:'auto', padding:'10px 12px', display:'flex', flexDirection:'column', gap:'8px', minHeight:0 }
            },
                messages.length === 0 && React.createElement('div', {
                    style: { textAlign:'center', padding:'40px 20px', color:'#4b5563' }
                },
                    React.createElement('div', { style: { fontSize:'36px', marginBottom:'10px' } }, '💬'),
                    React.createElement('div', { style: { fontSize:'12px' } }, lang==='ar'?'كن أول من يتحدث!':'Be the first to chat!')
                ),
                messages.map(function(msg) {
                    var isMe = msg.senderId === currentUID;
                    var isSystem = msg.senderId === 'system' || msg.type === 'system';
                    var isDonation = msg.type === 'donation';
                    // 📦 Chest assign/open messages
                    if (msg.type === 'chest_assign' || msg.type === 'chest_opened') {
                        var cfg2 = CHEST_CONFIG[msg.chestType];
                        var msObj = ACTIVENESS_MILESTONES.find(m=>m.chestType===msg.chestType);
                        var liveChest = (familyData?.treasuryInventory || []).find(inv=>inv.chestType===msg.chestType&&inv.assignedTo&&inv.inventoryIdx===msg.inventoryIdx);
                        var isAssigned = msg.type === 'chest_assign' && (liveChest?.assignedTo || msg.assignedTo || []).includes(currentUID);
                        var liveClaimedBy = liveChest?.claimedBy || msg.claimedBy || {};
                        var myClaimCount = isAssigned ? (liveClaimedBy[currentUID] || 0) : 0;
                        var maxClaims = msg.maxClaimsPerMember || 1;
                        var totalAssigned = (msg.assignedTo||[]).length;
                        var totalClaimed = Object.keys(liveClaimedBy).length;
                        var isOpened = msg.type === 'chest_opened';
                        var chestColor = cfg2?.color || '#9ca3af';
                        var isDetailOpen = chestDetailMsg === msg.id;
                        var liveDrops = liveChest?.assignedDrops || msg.assignedDrops || {};

                        return React.createElement('div', { key: msg.id, style:{ textAlign:'center', padding:'10px 14px', margin:'4px 0' } },
                            React.createElement('div', { style:{ display:'inline-flex', flexDirection:'column', alignItems:'center', gap:'6px', background:`${chestColor}14`, border:`1px solid ${chestColor}44`, borderRadius:'14px', padding:'12px 20px', maxWidth:'320px', width:'100%' } },
                                React.createElement('div', { style:{ fontSize:'28px' } }, msObj?.imageURL ? React.createElement('img', { src:msObj.imageURL, alt:'', style:{width:'32px',height:'32px',objectFit:'contain'} }) : (msg.chestIcon||'📦')),
                                React.createElement('div', { style:{ fontSize:'11px', fontWeight:800, color:'#e2e8f0', textAlign:'center', lineHeight:1.5, whiteSpace:'pre-line' } }, msg.text),
                                isOpened && msg.rewardReceipt && React.createElement('div', { style:{ fontSize:'10px', color:'#fbbf24', fontWeight:700, background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.25)', borderRadius:'8px', padding:'5px 10px', width:'100%', textAlign:'center' } },
                                    '📋 ' + msg.rewardReceipt
                                ),
                                totalAssigned > 0 && React.createElement('div', { style:{ fontSize:'9px', color:'#6b7280', background:'rgba(255,255,255,0.04)', borderRadius:'6px', padding:'3px 8px' } },
                                    (lang==='ar'?'استلم':'Claimed') + ': ' + totalClaimed + '/' + totalAssigned
                                ),
                                isAssigned && myClaimCount < maxClaims && React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:'6px', background:chestColor+'22', border:'1px solid '+chestColor+'55', borderRadius:'10px', padding:'5px 12px', cursor:'pointer' },
                                    onClick:()=>{
                                        var invIdx = (familyData?.treasuryInventory||[]).findIndex(inv=>inv.chestType===msg.chestType&&(inv.assignedTo||[]).includes(currentUID)&&(inv.claimedBy?.[currentUID]||0)<(inv.maxClaimsPerMember||1));
                                        if(invIdx>=0) openAssignedChest(invIdx);
                                    }},
                                    React.createElement('span', { style:{ fontSize:'14px' } }, '🎰'),
                                    React.createElement('span', { style:{ fontSize:'11px', fontWeight:800, color:chestColor } },
                                        (lang==='ar'?'افتح صندوقك':'Open your chest') + ' (' + (maxClaims - myClaimCount) + ' ' + (lang==='ar'?'متبقي':'left') + ')'
                                    )
                                ),
                                React.createElement('div', { style:{ fontSize:'10px', color:'#6b7280', cursor:'pointer', textDecoration:'underline dotted', marginTop:'2px' },
                                    onClick:()=>{ setChestDetailMsg(isDetailOpen ? null : msg.id); }
                                }, isDetailOpen ? (lang==='ar'?'إخفاء التفاصيل ▲':'Hide Details ▲') : (lang==='ar'?'عرض التفاصيل ▼':'View Details ▼')),

                                isDetailOpen && React.createElement('div', { style:{ width:'100%', background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'10px', marginTop:'4px', textAlign:'left' } },
                                    React.createElement('div', { style:{ fontSize:'10px', fontWeight:800, color:'#9ca3af', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px' } },
                                        '📦 ' + (lang==='ar'?'محتويات الصندوق':'Chest Contents')
                                    ),
                                    cfg2 && cfg2.rewards.map(function(r, ri) {
                                        return React.createElement('div', { key: ri, style:{ display:'flex', alignItems:'center', gap:'6px', padding:'3px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' } },
                                            React.createElement('span', { style:{ fontSize:'14px', flexShrink:0 } }, r.icon || '📦'),
                                            React.createElement('span', { style:{ flex:1, fontSize:'10px', color:'#d1d5db' } }, lang==='ar' ? r.label_ar : r.label_en),
                                            r.amount && React.createElement('span', { style:{ fontSize:'10px', color:'#6b7280' } }, '×' + r.amount),
                                            r.qty && r.qty > 1 && React.createElement('span', { style:{ fontSize:'10px', color:'#6b7280' } }, '×' + r.qty)
                                        );
                                    }),
                                    Object.keys(liveDrops).length > 0 && React.createElement('div', { style:{ marginTop:'10px' } },
                                        React.createElement('div', { style:{ fontSize:'10px', fontWeight:800, color:'#9ca3af', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px' } },
                                            '👥 ' + (lang==='ar'?'توزيع المشاركين':'Participant Distribution')
                                        ),
                                        Object.entries(liveDrops).map(function(entry) {
                                            var uid = entry[0]; var drop = entry[1];
                                            var hasClaimed = !!liveClaimedBy[uid];
                                            var memberName = familyMembers.find(function(m){ return m.id === uid; })?.displayName || uid.slice(0,8);
                                            var shareParts = [];
                                            if (drop.currency > 0) shareParts.push(drop.currency + ' 🧠');
                                            if (drop.coins > 0) shareParts.push(drop.coins + ' ' + FAMILY_COINS_SYMBOL);
                                            (drop.items||[]).forEach(function(it) { shareParts.push((it.qty||1) + '× ' + (it.icon||'🎁')); });
                                            return React.createElement('div', { key: uid, style:{ display:'flex', alignItems:'center', gap:'6px', padding:'4px 8px', marginBottom:'3px', borderRadius:'6px', background: hasClaimed ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)', border: '1px solid ' + (hasClaimed ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)') } },
                                                React.createElement('span', { style:{ fontSize:'11px', flex:1, color: hasClaimed ? '#10b981' : '#e2e8f0', fontWeight:700 } }, (hasClaimed ? '✅ ' : '⏳ ') + memberName),
                                                React.createElement('span', { style:{ fontSize:'9px', color:'#9ca3af' } }, shareParts.join(' • ') || '—')
                                            );
                                        })
                                    )
                                ),
                                React.createElement('div', { style:{ fontSize:'8px', color:'#4b5563', marginTop:'2px' } }, fmtTime(msg.timestamp))
                            )
                        );
                    }

                    // 🧧 Red Packet message
                    if (msg.type === 'red_packet') return React.createElement('div', { key: msg.id, style:{ display:'flex', flexDirection: isMe?'row-reverse':'row', gap:'7px', alignItems:'flex-end' } },
                        React.createElement('div', {
                            onClick: function() { openFamilyChatMiniProfile(msg.senderId, { name: msg.senderName, photo: msg.senderPhoto }); },
                            style: { width:'26px', height:'26px', borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.1)', cursor:'pointer' }
                        }, msg.senderPhoto ? React.createElement('img', { src:msg.senderPhoto, alt:'', style:{width:'100%',height:'100%',objectFit:'cover'} }) : React.createElement('div', { style:{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px'} }, '😎')),
                        React.createElement('div', { style:{ maxWidth:'min(220px,calc(100vw-90px))' } },
                            !isMe && React.createElement('div', { style:{ fontSize:'9px', color:'#a78bfa', fontWeight:700, marginBottom:'3px', paddingLeft:'4px', cursor:'pointer' }, onClick: function(){ openFamilyChatMiniProfile(msg.senderId,{name:msg.senderName,photo:msg.senderPhoto}); } }, msg.senderName),
                            typeof RedPacketCard !== 'undefined' && React.createElement(RedPacketCard, {
                                rpId: msg.rpId, rpAmount: msg.rpAmount, maxClaims: msg.maxClaims, senderName: msg.senderName,
                                currentUID: currentUID, user: { uid: currentUID }, currentUser: userData||currentUserData, lang: lang,
                                onClaim: async function(rpId) {
                                    try {
                                        var rpDoc = await redPacketsCollection.doc(rpId).get();
                                        if (!rpDoc.exists) return;
                                        var rp = rpDoc.data();
                                        if (rp.claimedBy && rp.claimedBy.includes(currentUID)) { if(onNotification) onNotification(lang==='ar'?'❌ استلمته من قبل':'❌ Already claimed'); return; }
                                        if ((rp.claimedBy&&rp.claimedBy.length||0)>=(rp.maxClaims||1)) { if(onNotification) onNotification(lang==='ar'?'❌ نفد المغلف':'❌ Exhausted'); return; }
                                        var perClaim = Math.floor(rp.amount/(rp.maxClaims||1));
                                        var bonus = Math.floor(Math.random()*Math.floor(perClaim*0.5));
                                        var claim = Math.min(perClaim+bonus, rp.remaining||rp.amount);
                                        await redPacketsCollection.doc(rpId).update({ claimedBy:firebase.firestore.FieldValue.arrayUnion(currentUID), remaining:firebase.firestore.FieldValue.increment(-claim), status:((rp.claimedBy&&rp.claimedBy.length||0)+1>=(rp.maxClaims||1))?'exhausted':'active' });
                                        await usersCollection.doc(currentUID).update({ currency:firebase.firestore.FieldValue.increment(claim) });
                                        await familiesCollection.doc(familyId).collection('messages').add({ type:'system', text:(lang==='ar'?'🎉 '+((userData||currentUserData)?.displayName||'عضو')+' استلم '+claim+' 🧠 من مغلف '+rp.senderName:'🎉 '+((userData||currentUserData)?.displayName||'Member')+' claimed '+claim+' 🧠 from '+rp.senderName+"'s packet"), senderId:'system', timestamp:TS() });
                                        if(onNotification) onNotification(lang==='ar'?'🎉 استلمت '+claim+' Intel!':'🎉 Got '+claim+' Intel!');
                                    } catch(e) { if(onNotification) onNotification(lang==='ar'?'❌ خطأ':'❌ Error'); }
                                }
                            }),
                            React.createElement('div', { style:{ fontSize:'9px', color:'#d1d5db', marginTop:'2px', textAlign: isMe?'right':'left', paddingLeft:'4px' } }, fmtTime(msg.timestamp))
                        )
                    );
                    if (isSystem) return React.createElement('div', { key: msg.id, style: { textAlign:'center', padding:'4px 12px' } },
                        React.createElement('span', { style: { fontSize:'10px', color:'#6b7280', background:'rgba(255,255,255,0.04)', padding:'3px 10px', borderRadius:'20px' } }, msg.text)
                    );
                    if (isDonation) return React.createElement('div', { key: msg.id, style: { display:'flex', justifyContent:'center', padding:'4px 0' } },
                        React.createElement('div', { style: { background:'linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,140,0,0.1))', border:'1px solid rgba(255,215,0,0.3)', borderRadius:'12px', padding:'8px 14px', maxWidth:'90%', textAlign:'center' } },
                            React.createElement('div', { style: { fontSize:'12px', color:'#ffd700', fontWeight:800 } }, msg.text),
                            React.createElement('div', { style: { fontSize:'10px', color:'#6b7280', marginTop:'2px' } }, fmtTime(msg.timestamp))
                        )
                    );
                    var isAnnouncement = msg.type === 'announcement';
                    if (isAnnouncement) return React.createElement('div', { key: msg.id, style: { display:'flex', justifyContent:'center', padding:'6px 0' } },
                        React.createElement('div', {
                            style: { width:'100%', background:'linear-gradient(135deg,rgba(255,165,0,0.2),rgba(255,80,0,0.12))', border:'1.5px solid rgba(255,165,0,0.5)', borderRadius:'14px', padding:'10px 14px', position:'relative', overflow:'hidden', boxShadow:'0 0 18px rgba(255,140,0,0.18)' }
                        },
                            React.createElement('div', { style: { position:'absolute', left:0, top:0, bottom:0, width:'4px', background:'linear-gradient(180deg,#ffd700,#ff8800)', borderRadius:'14px 0 0 14px' } }),
                            React.createElement('div', { style: { paddingLeft:'8px' } },
                                React.createElement('div', { style: { display:'flex', alignItems:'center', gap:'6px', marginBottom:'5px' } },
                                    React.createElement('span', { style: { fontSize:'16px' } }, '📢'),
                                    React.createElement('span', { style: { fontSize:'10px', fontWeight:900, color:'#fbbf24', letterSpacing:'1px', textTransform:'uppercase' } }, lang==='ar'?'إعلان رسمي':'OFFICIAL ANNOUNCEMENT'),
                                    React.createElement('span', { style: { marginLeft:'auto', fontSize:'9px', color:'#6b7280' } }, fmtTime(msg.timestamp))
                                ),
                                React.createElement('div', { style: { display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' } },
                                    msg.senderPhoto ? React.createElement('img', { src: msg.senderPhoto, alt:'', style:{width:'18px',height:'18px',borderRadius:'50%',objectFit:'cover',border:'1.5px solid rgba(255,215,0,0.5)'} })
                                    : React.createElement('div', { style:{width:'18px',height:'18px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px'}}, '👤'),
                                    React.createElement('span', { style: { fontSize:'10px', fontWeight:700, color:'#fde68a' } }, msg.senderName)
                                ),
                                React.createElement('div', { style: { fontSize:'13px', color:'#fef3c7', lineHeight:1.6, fontWeight:600, wordBreak:'break-word' } }, msg.text)
                            )
                        )
                    );
                    return React.createElement('div', { key: msg.id, style: { display:'flex', flexDirection: isMe?'row-reverse':'row', gap:'8px', alignItems:'flex-end' } },
                        React.createElement('div', {
                            onClick: function() { openFamilyChatMiniProfile(msg.senderId, { name: msg.senderName, photo: msg.senderPhoto }); },
                            style: { width:'28px', height:'28px', borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.1)', cursor:'pointer' }
                        }, msg.senderPhoto ? React.createElement('img', { src: msg.senderPhoto, alt:'', style:{width:'100%',height:'100%',objectFit:'cover'}})
                        : React.createElement('div', { style:{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}, '😎')),
                        React.createElement('div', { style: { maxWidth:'72%' } },
                            React.createElement('div', {
                                onClick: function() { openFamilyChatMiniProfile(msg.senderId, { name: msg.senderName, photo: msg.senderPhoto }); },
                                style: { fontSize:'10px', color: isMe?'#00f2ff':'#9ca3af', marginBottom:'3px', fontWeight:700, paddingLeft: isMe?'0':'4px', paddingRight: isMe?'4px':'0', cursor:'pointer', textAlign: isMe?'right':'left' },
                                onMouseEnter: function(e) { e.currentTarget.style.color='#00f2ff'; },
                                onMouseLeave: function(e) { e.currentTarget.style.color= isMe?'#00f2ff':'#9ca3af'; }
                            }, msg.senderName),
                            msg.type === 'image' && msg.imageUrl
                            ? React.createElement('img', { src: msg.imageUrl, alt:'', style:{ width: 'min(240px,calc(100vw - 80px))', maxHeight:'240px', borderRadius:'12px', display:'block', objectFit:'cover', cursor:'pointer' }, onClick: function(){var w=window.open();w.document.write('<body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="'+msg.imageUrl+'" style="max-width:100vw;max-height:100vh;object-fit:contain"></body>');}  })
                            : React.createElement('div', { style: { padding:'8px 12px', borderRadius: isMe?'14px 4px 14px 14px':'4px 14px 14px 14px', background: isMe?'linear-gradient(135deg,rgba(0,242,255,0.2),rgba(112,0,255,0.2))':'rgba(255,255,255,0.07)', border: isMe?'1px solid rgba(0,242,255,0.3)':'1px solid rgba(255,255,255,0.08)', fontSize:'12px', color:'#e2e8f0', lineHeight:1.5, wordBreak:'break-word' } }, renderMsgText(msg.text)),
                            React.createElement('div', { style: { fontSize:'9px', color:'#4b5563', marginTop:'2px', textAlign: isMe?'right':'left', paddingLeft:'4px', paddingRight:'4px' } }, fmtTime(msg.timestamp))
                        )
                    );
                }),
                React.createElement('div', { ref: chatEndRef })
            ),

            // ── @ Mention list ──
            showMentionList && mentionMembers.length > 0 && React.createElement('div', {
                style: { background:'#0e1020', border:'1px solid rgba(0,242,255,0.2)', borderRadius:'12px', margin:'0 8px 4px', overflow:'hidden', maxHeight:'160px', overflowY:'auto', flexShrink:0 }
            },
                mentionMembers.map(function(m) {
                    return React.createElement('div', {
                        key: m.id,
                        onClick: function() { selectMention(m); },
                        style: { display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', cursor:'pointer', transition:'background 0.12s' },
                        onMouseEnter: function(e) { e.currentTarget.style.background='rgba(0,242,255,0.08)'; },
                        onMouseLeave: function(e) { e.currentTarget.style.background='transparent'; }
                    },
                        React.createElement('div', { style: { width:'24px', height:'24px', borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.08)' } },
                            m.photoURL ? React.createElement('img', { src: m.photoURL, alt:'', style:{width:'100%',height:'100%',objectFit:'cover'} })
                            : React.createElement('span', { style:{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',fontSize:'12px'}}, '😎')),
                        React.createElement('span', { style: { fontSize:'12px', fontWeight:700, color:'white' } }, '@' + m.displayName),
                        m.id === currentUID && React.createElement('span', { style: { fontSize:'10px', color:'#6b7280' } }, lang==='ar'?'(أنت)':'(you)')
                    );
                })
            ),
            // Input bar
            React.createElement('div', {
                style: { padding:'10px 12px', borderTop:'1px solid rgba(255,255,255,0.07)', background:'rgba(0,0,0,0.3)', display:'flex', gap:'8px', alignItems:'center', flexShrink:0 }
            },
                React.createElement('input', { ref: imgInputRef, type:'file', accept:'image/*', style:{display:'none'}, onChange: handleImageUpload }),
                React.createElement('button', {
                    onClick: function() { if (imgInputRef.current) imgInputRef.current.click(); },
                    style: { width:'36px', height:'36px', borderRadius:'10px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#9ca3af', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }
                }, '📷'),

                onSendGift && React.createElement('button', {
                    onClick: function() { setGiftTarget(userData || currentUserData); setShowChatGiftModal(true); },
                    title: lang==='ar'?'أرسل هدية لعضو':'Send gift to a member',
                    style: { width:'36px', height:'36px', borderRadius:'10px', background:'rgba(255,215,0,0.1)', border:'1px solid rgba(255,215,0,0.22)', color:'#9ca3af', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }
                }, '🎁'),
                React.createElement('button', {
                    onClick: function() { setShowFamRPModal(true); },
                    title: lang==='ar'?'أرسل مغلف':'Send Packet',
                    style: { width:'36px', height:'36px', borderRadius:'10px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }
                }, '🧧'),
                React.createElement('input', {
                    ref: chatInputRef,
                    value: chatInput,
                    onChange: handleInputChange,
                    onKeyDown: function(e) {
                        if (e.key === 'Escape') setShowMentionList(false);
                        if (e.key === 'Enter' && !e.shiftKey && !showMentionList) { e.preventDefault(); sendMessage(chatInput); }
                    },
                    maxLength: 400,
                    style: { flex:1, padding:'9px 12px', borderRadius:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'white', fontSize:'13px', outline:'none', minWidth:0, width:'100%' },
                    placeholder: lang==='ar'?'اكتب رسالة... أو @ للمنشن':'Type a message... or @ to mention'
                }),
                React.createElement('button', {
                    onClick: function() { sendMessage(chatInput); },
                    disabled: !chatInput.trim() || sendingMsg,
                    style: { width:'40px', height:'40px', borderRadius:'12px', border:'none', flexShrink:0, background: chatInput.trim()?'linear-gradient(135deg,#00f2ff,#7000ff)':'rgba(255,255,255,0.06)', color: chatInput.trim()?'white':'#6b7280', fontSize:'18px', cursor: chatInput.trim()?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center' }
                }, sendingMsg ? '⏳' : '➤')
            ),
            // 🧧 Red Packet Modal
            showFamRPModal && React.createElement('div', {
                style: { position:'fixed', inset:0, zIndex: Z.OVERLAY, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'flex-end', justifyContent:'center' }
            },
                React.createElement('div', {
                    style: { width:'100%', maxWidth:'min(440px,100vw)', background:'linear-gradient(160deg,#0e0e22,#13122a)', borderRadius:'20px 20px 0 0', border:'1px solid rgba(255,255,255,0.1)', overflow:'hidden' }
                },
                    React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)' } },
                        React.createElement('div', { style:{ fontSize:'14px', fontWeight:800, color:'#ef4444' } }, '🧧 ' + (lang==='ar'?'مغلف أحمر للقبيلة':'Family Red Packet')),
                        React.createElement('button', { onClick: function() { setShowFamRPModal(false); }, style:{ background:'none', border:'none', color:'#9ca3af', fontSize:'20px', cursor:'pointer' } }, '✕')
                    ),
                    React.createElement('div', { style:{ padding:'14px', overflowY:'auto', maxHeight:'60vh' } },
                        React.createElement('div', { style:{ fontSize:'11px', color:'#6b7280', marginBottom:'12px', textAlign:'center' } },
                            (lang==='ar'?'رصيدك:':'Balance:') + ' ',
                            React.createElement('span', { style:{ color:'#ffd700', fontWeight:700 } }, ((userData||currentUserData)?.currency||0).toLocaleString() + ' 🧠')
                        ),
                        typeof RED_PACKETS_CONFIG !== 'undefined' && RED_PACKETS_CONFIG.map(function(rp) {
                            var balance = (userData||currentUserData)?.currency||0;
                            var canBuy = balance >= rp.amount;
                            return React.createElement('button', {
                                key: rp.id,
                                disabled: sendingFamRP || !canBuy,
                                onClick: async function() {
                                    if (sendingFamRP || !canBuy) return;
                                    setSendingFamRP(true);
                                    try {
                                        var sender = userData || currentUserData;
                                        var rpRef = await redPacketsCollection.add({
                                            configId:rp.id, amount:rp.amount,
                                            senderId:currentUID, senderName:sender.displayName||'User', senderPhoto:sender.photoURL||null,
                                            targetType:'family', targetId:familyId, targetName:(familyData&&familyData.name)||'Family',
                                            claimedBy:[], maxClaims:rp.maxClaims, remaining:rp.amount,
                                            createdAt:TS(), status:'active',
                                        });
                                        await usersCollection.doc(currentUID).update({ currency:firebase.firestore.FieldValue.increment(-rp.amount) });
                                        await familiesCollection.doc(familyId).collection('messages').add({
                                            type:'red_packet', rpId:rpRef.id, rpAmount:rp.amount, rpConfigId:rp.id,
                                            senderId:currentUID, senderName:sender.displayName||'User', senderPhoto:sender.photoURL||null,
                                            text:'🧧 '+rp.amount, timestamp:TS(), maxClaims:rp.maxClaims,
                                        });
                                        await publicChatCollection.add({
                                            type:'red_packet_announce', senderId:currentUID, senderName:sender.displayName||'User',
                                            amount:rp.amount, targetType:'family', targetName:(familyData&&familyData.name)||'Family',
                                            text:(lang==='ar'?'🧧 '+(sender.displayName||'User')+' أرسل مغلف '+rp.amount+' في قبيلة '+((familyData&&familyData.name)||'Family'):'🧧 '+(sender.displayName||'User')+' sent a '+rp.amount+' packet in family '+((familyData&&familyData.name)||'Family')),
                                            createdAt:TS(),
                                        });
                                        setShowFamRPModal(false);
                                        if (onNotification) onNotification(lang==='ar'?'✅ تم إرسال المغلف!':'✅ Packet sent!');
                                    } catch(e) { if (onNotification) onNotification(lang==='ar'?'❌ خطأ':'❌ Error'); }
                                    setSendingFamRP(false);
                                },
                                style: { display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', borderRadius:'14px', background:rp.bg, border:'1px solid '+rp.border, cursor:canBuy?'pointer':'not-allowed', opacity:canBuy?1:0.4, textAlign:'left', width:'100%', marginBottom:'8px', boxSizing:'border-box' }
                            },
                                rp.imageURL ? React.createElement('img', { src:rp.imageURL, style:{width:'40px',height:'40px',objectFit:'contain'} }) : React.createElement('div', { style:{width:'40px',height:'40px',borderRadius:'10px',background:rp.color+'20',border:'1px solid '+rp.color+'44',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px'} }, '🧧'),
                                React.createElement('div', { style:{ flex:1 } },
                                    React.createElement('div', { style:{ fontSize:'13px', fontWeight:800, color:rp.color } }, lang==='ar'?rp.name_ar:rp.name_en),
                                    React.createElement('div', { style:{ fontSize:'10px', color:'#9ca3af', marginTop:'2px' } }, lang==='ar'?rp.desc_ar:rp.desc_en)
                                ),
                                React.createElement('div', { style:{ fontSize:'13px', fontWeight:800, color:rp.color } }, rp.amount.toLocaleString() + ' 🧠')
                            );
                        })
                    )
                )
            ),
            // Gift modal
            showChatGiftModal && onSendGift && React.createElement(SendGiftModal, {
                show: showChatGiftModal,
                onClose: function() { setShowChatGiftModal(false); setGiftTarget(null); },
                targetUser: giftTarget,
                currentUser: userData || currentUserData,
                lang: lang,
                onSendGift: async function(gift, target, qty) {
                    if (target && target.uid) {
                        var targetDoc = target.uid === currentUID
                            ? { uid: target.uid, ...target }
                            : await usersCollection.doc(target.uid).get().then(d => d.exists ? { uid: target.uid, ...d.data() } : target).catch(() => target);
                        await onSendGift(gift, targetDoc, qty || 1, false, familyId);
                    }
                    setShowChatGiftModal(false);
                    setGiftTarget(null);
                },
                currency: (userData || currentUserData)?.currency || 0,
                friendsData: familyMembers.filter(function(m) { return m.id !== currentUID; }).map(function(m) { return Object.assign({}, m, { uid: m.id }); }),
            })
        )
        )
    );
};

window.FamilyChatModal = FamilyChatModal;
// No export default.

