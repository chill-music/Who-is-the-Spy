/**
 * FamilyChatModal - Extracted component for family chat functionality.
 */
var FamilyChatModal = (props) => {
  // ---- Late Binding Global Refs ----
  var {
    Z = { MODAL: 1000, OVERLAY: 900 },
    RED_PACKETS_CONFIG = {},
    CHEST_CONFIG = {},
    FAMILY_COINS_SYMBOL = '🧠',
    ACTIVENESS_MILESTONES = [],
    PortalModal,
    fetchMiniProfileData
  } = window;
  var {
    getFamilySignLevelData = () => null,
    getFamilyLevelConfig = () => ({})
  } = window.FamilyConstants || {};
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
  } = window.FamilyService || {};
  var { renderMsgText: utilRenderMsgText } = window.FamilyUtils || { renderMsgText: (t) => t };
  var TS = window.TS || (() => firebase?.firestore?.FieldValue?.serverTimestamp() || Date.now());
  var { MiniProfilePopup, FamilySignBadge, RedPacketCard } = window;
  var { SendGiftModal } = window;
  var { isOpen, onClose, currentUID, currentUserData, lang, onSendGift, userData, onNotification, onOpenProfile, onOpenFamily, family, S, myRole } = props;
  var show = props.show !== undefined ? props.show : isOpen !== undefined ? isOpen : !onClose;
  var familyData = props.familyData || family;
  var familyId = props.familyId || familyData?.id || userData?.familyId || currentUserData?.familyId;

  var [messages, setMessages] = React.useState([]);
  var [chatInput, setChatInput] = React.useState('');
  var [sendingMsg, setSendingMsg] = React.useState(false);
  var [prevMsgCount, setPrevMsgCount] = React.useState(0);
  var chatEndRef = React.useRef(null);
  var imgInputRef = React.useRef(null);
  var chatInputRef = React.useRef(null);
  var [openingChest, setOpeningChest] = React.useState(false);
  var [chestDetailMsg, setChestDetailMsg] = React.useState(null);
  // ── Gift modal ──
  var [giftTarget, setGiftTarget] = React.useState(null); // null = self, { uid, displayName, photoURL }
  var [showChatGiftModal, setShowChatGiftModal] = React.useState(false);
  var [showFamRPModal, setShowFamRPModal] = React.useState(false);
  var [sendingFamRP, setSendingFamRP] = React.useState(false);
  // ── Mini profile popup ──
  var [miniProfile, setMiniProfile] = React.useState(null);

  var handleBlock = async (uid) => {
    if (!currentUID || !uid) return;
    try {
      await usersCollection.doc(currentUID).update({
        blockedUsers: firebase.firestore.FieldValue.arrayUnion(uid)
      });
      if (onNotification) onNotification(lang === 'ar' ? '🚫 تم حظر المستخدم' : '🚫 User blocked');
    } catch (e) {console.error('Block error:', e);}
  };

  var handleUnblock = async (uid) => {
    if (!currentUID || !uid) return;
    try {
      await usersCollection.doc(currentUID).update({
        blockedUsers: firebase.firestore.FieldValue.arrayRemove(uid)
      });
      if (onNotification) onNotification(lang === 'ar' ? '✅ تم إلغاء الحظر' : '✅ User unblocked');
    } catch (e) {console.error('Unblock error:', e);}
  };

  // ── @ Mention ──
  var [mentionSearch, setMentionSearch] = React.useState('');
  var [showMentionList, setShowMentionList] = React.useState(false);
  var [familyMembers, setFamilyMembers] = React.useState([]);

  // ── فتح ميني بروفايل في شات القبيلة ──
  var openFamilyChatMiniProfile = async function (uid, basicData) {
    if (!uid) return;
    setMiniProfile({ uid, name: basicData && basicData.name || '...', photo: basicData && basicData.photo || null, loading: true });
    var data = await fetchMiniProfileData(uid, userData && userData.friends || []);
    if (data) setMiniProfile(data);
  };

  // جلب أعضاء العائلة للمنشن
  React.useEffect(() => {
    if (!show || !familyId) return;
    var unsub = familiesCollection.doc(familyId).onSnapshot((snap) => {
      if (!snap.exists) return;
      var memberIds = snap.data().members || [];
      if (memberIds.length === 0) return;
      // جلب بيانات الأعضاء (أول 10 للمنشن)
      usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', memberIds.slice(0, 10)).
      get().then((s) => setFamilyMembers(s.docs.map((d) => ({ id: d.id, ...d.data() })))).
      catch(() => {});
    }, () => {});
    return () => unsub();
  }, [show, familyId]);

  React.useEffect(() => {
    if (!show || !familyId) return;
    var unsub = familiesCollection.doc(familyId).collection('messages').
    orderBy('timestamp', 'desc').limit(80).
    onSnapshot((snap) => {
      var msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() })).reverse();
      // صوت + نوتيفيكيشن لما تيجي رسالة جديدة
      if (prevMsgCount > 0 && msgs.length > prevMsgCount) {
        var newest = msgs[msgs.length - 1];
        if (newest && newest.senderId !== currentUID) {
          try {playNotificationSound();} catch (e) {}
          if (onNotification) {
            var senderName = newest.senderName || (lang === 'ar' ? 'عضو' : 'Member');
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
  var handleInputChange = function (e) {
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

  var selectMention = function (member) {
    var lastAt = chatInput.lastIndexOf('@');
    var newVal = chatInput.slice(0, lastAt) + '@' + member.displayName + ' ';
    setChatInput(newVal);
    setShowMentionList(false);
    setTimeout(function () {chatInputRef.current && chatInputRef.current.focus();}, 50);
  };

  // ── Open assigned chest from family chat ──
  var openAssignedChest = async (inventoryIdx) => {
    if (!familyId || !currentUID || openingChest) return;
    setOpeningChest(true);
    try {
      var result = await window.FamilyService.openAssignedChest({
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
      if (onNotification) onNotification(lang === 'ar' ? '❌ خطأ في فتح الصندوق' : '❌ Error opening chest');
    } finally {
      setOpeningChest(false);
    }
  };

  var selfMember = currentUserData ? [{ id: currentUID, displayName: currentUserData.displayName, photoURL: currentUserData.photoURL }] : [];
  var mentionMembers = [...selfMember, ...familyMembers.filter(function (m) {return m.id !== currentUID;})].
  filter(function (m) {return !mentionSearch || (m.displayName || '').toLowerCase().includes(mentionSearch);});

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
          announcementBy: currentUserData?.displayName || 'Admin'
        }).catch(function () {});
      }
      await familiesCollection.doc(familyId).collection('messages').add({
        senderId: currentUID,
        senderName: currentUserData?.displayName || 'Member',
        senderPhoto: currentUserData?.photoURL || null,
        text: finalText,
        type: finalType,
        timestamp: TS(),
        ...extra
      });
      if (type === 'text') setChatInput('');
      await familiesCollection.doc(familyId).update({
        lastChatMessage: finalText || (type === 'image' ? '📷' : ''),
        lastChatSenderId: currentUID,
        lastChatAt: TS(),
        lastChatAtMs: Date.now(),
        ['chatReadBy.' + currentUID]: TS()
      }).catch(function () {});
    } catch (e) {console.error('FamilyChatModal sendMessage error:', e);}
    setSendingMsg(false);
  };

  var handleImageUpload = async function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      var base64 = await serviceHandleImageUpload(file);
      sendMessage('', 'image', { imageUrl: base64 });
    } catch (e) {console.error('Image upload failed:', e);}
    e.target.value = '';
  };

  var fmtTime = function (ts) {
    if (!ts) return '';
    var d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
    var diff = Date.now() - d.getTime();
    if (diff < 60000) return lang === 'ar' ? 'الآن' : 'now';
    if (diff < 3600000) return Math.floor(diff / 60000) + (lang === 'ar' ? 'د' : 'm');
    if (diff < 86400000) return Math.floor(diff / 3600000) + (lang === 'ar' ? 'س' : 'h');
    return Math.floor(diff / 86400000) + (lang === 'ar' ? 'ي' : 'd');
  };

  // --- Using the extracted utility ---
  var renderMsgText = (text) => utilRenderMsgText(text, familyMembers, currentUserData, currentUID, openFamilyChatMiniProfile);

  if (!show) return null;

  var familyWeeklyAct = familyData?.lastWeekActiveness !== undefined ? familyData.lastWeekActiveness : (familyData?.weeklyActiveness || 0);
  var signLvl = familyData?.familySignLevel || (familyData ? getFamilySignLevelData(familyWeeklyAct)?.level : 1) || 1;
  var signData = typeof window.FamilyConstants !== 'undefined' && window.FamilyConstants.FAMILY_SIGN_LEVELS?.find((s) => s.level === signLvl) || { level: signLvl, color: '#6b7280' };
  var signImageURL = typeof window.FamilyConstants !== 'undefined' && window.FamilyConstants.getFamilySignImage ? window.FamilyConstants.getFamilySignImage(0, signLvl) : 'icos/Family Sign1.png';
  var fLvl = familyData ? getFamilyLevelConfig(familyData.level || 1) : null;

  return React.createElement(PortalModal || React.Fragment, null,
  React.createElement('div', {
    style: { position: 'fixed', inset: 0, zIndex: Z.MODAL, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' },
    onClick: onClose
  },
  React.createElement('div', {
    style: { position: 'relative', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '480px', height: 'min(88vh, 700px)', minHeight: '400px', background: 'linear-gradient(180deg,#0d0d1f 0%,#08080f 100%)', border: '1px solid rgba(0,242,255,0.15)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 28px 70px rgba(0,0,0,0.95)' },
    onClick: function (e) {e.stopPropagation();}
  },
  // Header
  React.createElement('div', {
    style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.4)', flexShrink: 0 }
  },
  React.createElement('button', { onClick: onClose, style: { background: 'none', border: 'none', color: '#00f2ff', fontSize: '20px', cursor: 'pointer', padding: '0 4px' } }, '‹'),
  React.createElement('div', {
    onClick: function () {onOpenFamily && onOpenFamily();},
    style: { width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg,' + signData.color + '22,rgba(0,0,0,0.3))', border: '2px solid ' + signData.color + '55', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', cursor: onOpenFamily ? 'pointer' : 'default' }
  }, familyData && familyData.photoURL ? React.createElement('img', { src: familyData.photoURL, alt: '', style: { width: '100%', height: '100%', objectFit: 'cover' } }) : familyData && familyData.emblem || '🏠'),
  React.createElement('div', {
    onClick: function () {onOpenFamily && onOpenFamily();},
    style: { flex: 1, minWidth: 0, cursor: onOpenFamily ? 'pointer' : 'default' }
  },
  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } },
  React.createElement('span', { style: { fontSize: '14px', fontWeight: 800, color: onOpenFamily ? '#00f2ff' : 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: onOpenFamily ? 'underline dotted rgba(0,242,255,0.4)' : 'none' } }, familyData && familyData.name || (lang === 'ar' ? 'شات العائلة' : 'Family Chat')),
  familyData && signData.level >= 1 && FamilySignBadge && React.createElement(FamilySignBadge, { tag: familyData.tag, color: signData.color, small: true, signLevel: signData.level, imageURL: signImageURL })
  ),
  React.createElement('div', { style: { fontSize: '10px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' } },
    React.createElement('span', null, (familyData && familyData.members && familyData.members.length || 0) + ' ' + (lang === 'ar' ? 'عضو' : 'members')),
    fLvl && React.createElement('span', { style: { color: fLvl.color } }, fLvl.icon + ' Lv.' + fLvl.level),
    (familyData?.treasuryInventory && familyData.treasuryInventory.length > 0) && React.createElement('div', { 
      style: { 
        marginLeft: 'auto', 
        background: 'rgba(255,215,0,0.12)', 
        border: '1px solid rgba(255,215,0,0.3)', 
        borderRadius: '6px', 
        padding: '2px 6px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px',
        color: '#ffd700',
        fontWeight: '800',
        fontSize: '9px'
      } 
    }, '📦 ' + familyData.treasuryInventory.length)
  )
  )
  ),
  // Pinned Announcement Bar
  familyData && familyData.announcement && React.createElement('div', {
    style: { flexShrink: 0, margin: '8px 10px 4px', padding: '9px 14px', borderRadius: '12px', background: 'linear-gradient(135deg,rgba(255,165,0,0.18),rgba(255,80,0,0.12))', border: '1px solid rgba(255,165,0,0.45)', boxShadow: '0 0 16px rgba(255,140,0,0.2)', position: 'relative', overflow: 'hidden' }
  },
  React.createElement('div', { style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'linear-gradient(180deg,#ffd700,#ff8800)', borderRadius: '12px 0 0 12px' } }),
  React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '8px', paddingLeft: '6px' } },
  React.createElement('span', { style: { fontSize: '16px', lineHeight: 1, flexShrink: 0 } }, '📢'),
  React.createElement('div', { style: { flex: 1, minWidth: 0 } },
  React.createElement('div', { style: { fontSize: '9px', fontWeight: 800, color: '#fbbf24', letterSpacing: '1px', marginBottom: '3px', textTransform: 'uppercase' } },
  (lang === 'ar' ? 'إعلان من الإدارة' : 'ANNOUNCEMENT') + (familyData.announcementBy ? ' · ' + familyData.announcementBy : '')
  ),
  React.createElement('div', { style: { fontSize: '12px', color: '#fde68a', lineHeight: 1.5, fontWeight: 600, wordBreak: 'break-word' } }, familyData.announcement)
  )
  )
  ),
  // ── Mini Profile Popup ──
  miniProfile && MiniProfilePopup && React.createElement(MiniProfilePopup, {
    profile: miniProfile,
    onClose: function () {setMiniProfile(null);},
    currentUID: currentUID,
    lang: lang,
    onOpenProfile: onOpenProfile,
    onSendGift: onSendGift ? function (p) {
      setGiftTarget({ uid: p.uid, displayName: p.name, photo: p.photo });
      setShowChatGiftModal(true);
    } : null,
    onBlock: handleBlock,
    onUnblock: handleUnblock,
    isBlocked: (userData || currentUserData)?.blockedUsers?.includes(miniProfile.uid),
    onReport: async function (p, reason, note) {
      try {
        await reportsCollection.add({
          type: 'user',
          reporterUID: currentUID,
          reporterName: currentUserData && currentUserData.displayName || 'User',
          reportedUID: p.uid, reportedName: p.name,
          reason: reason || 'family_chat_report',
          note: note || '',
          createdAt: TS(),
          status: 'pending',
          resolved: false
        });
      } catch (e) {}
      if (onNotification) onNotification(lang === 'ar' ? '✅ تم إرسال البلاغ' : '✅ Report sent');
    }
  }),
  // Messages
  React.createElement('div', {
    style: { flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0 }
  },
  messages.length === 0 && React.createElement('div', {
    style: { textAlign: 'center', padding: '40px 20px', color: '#4b5563' }
  },
  React.createElement('div', { style: { fontSize: '36px', marginBottom: '10px' } }, '💬'),
  React.createElement('div', { style: { fontSize: '12px' } }, lang === 'ar' ? 'كن أول من يتحدث!' : 'Be the first to chat!')
  ),
  messages.map(function (msg) {
    var isMe = msg.senderId === currentUID;
    var isSystem = msg.senderId === 'system' || msg.type === 'system';
    var isDonation = msg.type === 'donation';
    // 📦 Chest assign/open messages
    if (msg.type === 'chest_assigned' || msg.type === 'chest_opened') {
      var cfg2 = CHEST_CONFIG[msg.chestType];
      var msObj = ACTIVENESS_MILESTONES.find(function (m) {return m.chestType === msg.chestType;});
      var liveChest = (familyData?.treasuryInventory || []).find(function (inv) {return msg.chestId && inv.chestId === msg.chestId || inv.chestType === msg.chestType && inv.sourceMilestoneIdx === msg.sourceMilestoneIdx;});
      var isAssigned = msg.type === 'chest_assigned' && (liveChest?.assignedTo || msg.assignedTo || []).includes(currentUID);
      var liveClaimedBy = liveChest?.claimedBy || msg.claimedBy || {};
      var myClaimCount = isAssigned ? liveClaimedBy[currentUID] || 0 : 0;
      var maxClaims = liveChest?.maxClaimsPerMember || msg.maxClaimsPerMember || 1;
      var totalAssigned = (liveChest?.assignedTo || msg.assignedTo || []).length;
      var totalClaimed = Object.keys(liveClaimedBy).length;
      var isOpened = msg.type === 'chest_opened';
      var chestColor = cfg2?.color || '#9ca3af';
      var isDetailOpen = chestDetailMsg === msg.id;
      var liveDrops = liveChest?.assignedDrops || msg.assignedDrops || {};

      return React.createElement('div', { key: msg.id, style: { textAlign: 'center', padding: '10px 14px', margin: '4px 0' } },
      React.createElement('div', { style: { display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: `${chestColor}14`, border: `1px solid ${chestColor}44`, borderRadius: '14px', padding: '12px 20px', maxWidth: '320px', width: '100%' } },
      React.createElement('div', { style: { fontSize: '28px' } }, msObj?.imageURL ? React.createElement('img', { src: msObj.imageURL, alt: '', style: { width: '32px', height: '32px', objectFit: 'contain' } }) : msg.chestIcon || '📦'),
      React.createElement('div', { style: { fontSize: '11px', fontWeight: 800, color: '#e2e8f0', textAlign: 'center', lineHeight: 1.5, whiteSpace: 'pre-line' } }, msg.text),
      isOpened && msg.rewardReceipt && React.createElement('div', { style: { fontSize: '10px', color: '#fbbf24', fontWeight: 700, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '8px', padding: '5px 10px', width: '100%', textAlign: 'center' } },
      '📋 ' + msg.rewardReceipt
      ),
      totalAssigned > 0 && React.createElement('div', { style: { fontSize: '9px', color: '#6b7280', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '3px 8px' } },
      (lang === 'ar' ? 'استلم' : 'Claimed') + ': ' + totalClaimed + '/' + totalAssigned
      ),
      isAssigned && myClaimCount < maxClaims && React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', background: chestColor + '22', border: '1px solid ' + chestColor + '55', borderRadius: '10px', padding: '5px 12px', cursor: 'pointer' },
        onClick: function () {
          var invIdx = (familyData?.treasuryInventory || []).findIndex(function (inv) {return (msg.chestId && inv.chestId === msg.chestId || inv.chestType === msg.chestType) && (inv.assignedTo || []).includes(currentUID) && (inv.claimedBy?.[currentUID] || 0) < (inv.maxClaimsPerMember || 1);});
          if (invIdx >= 0) openAssignedChest(invIdx);
        } },
      React.createElement('span', { style: { fontSize: '14px' } }, '🎰'),
      React.createElement('span', { style: { fontSize: '11px', fontWeight: 800, color: chestColor } },
      (lang === 'ar' ? 'افتح صندوقك' : 'Open your chest') + ' (' + (maxClaims - myClaimCount) + ' ' + (lang === 'ar' ? 'متبقي' : 'left') + ')'
      )
      ),
      React.createElement('div', { style: { fontSize: '10px', color: '#6b7280', cursor: 'pointer', textDecoration: 'underline dotted', marginTop: '2px' },
        onClick: function () {setChestDetailMsg(isDetailOpen ? null : msg.id);}
      }, isDetailOpen ? lang === 'ar' ? 'إخفاء التفاصيل ▲' : 'Hide Details ▲' : lang === 'ar' ? 'عرض التفاصيل ▼' : 'View Details ▼'),
      isDetailOpen && React.createElement('div', { style: { width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px', marginTop: '4px', textAlign: 'left' } },
      React.createElement('div', { style: { fontSize: '10px', fontWeight: 800, color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' } },
      '📦 ' + (lang === 'ar' ? 'محتويات الصندوق' : 'Chest Contents')
      ),
      cfg2 && React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(64px,1fr))', gap: '7px', marginBottom: '12px' } },
      cfg2.rewards.map(function (r, ri) {
        var resolved = typeof window.resolveRewardItem === 'function' ? window.resolveRewardItem(r) : r;
        var imgSrc = resolved.imageURL || resolved.imageUrl || null;
        var fprev = resolved.preview || null;
        var isGradient = fprev && !fprev.startsWith('http') && !fprev.startsWith('icos') && !fprev.startsWith('/');
        var isImgPrev = fprev && !isGradient;
        var qty = r.amount || r.qty || 1;
        var dur = r.duration || resolved.duration || null;
        var isLimited = resolved.isEvent || resolved.limitedTime || resolved.eventOnly;
        var RC = window.RARITY_CONFIG;
        var rarC = RC && resolved.rarity && RC[resolved.rarity];
        var cardBg = rarC ? rarC.color + '18' : 'rgba(255,255,255,0.05)';
        var cardBdr = rarC ? rarC.color + '55' : 'rgba(255,255,255,0.12)';
        return React.createElement('div', { key: ri, style: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', background: cardBg, border: '1px solid ' + cardBdr, borderRadius: '10px', padding: '7px 4px 5px', minWidth: 0, overflow: 'hidden' } },
        isGradient && React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: fprev, borderRadius: '10px 10px 0 0' } }),
        imgSrc ?
        React.createElement('img', { src: imgSrc, alt: '', style: { width: '36px', height: '36px', objectFit: 'contain', borderRadius: '6px' } }) :
        isImgPrev ?
        React.createElement('img', { src: fprev, alt: '', style: { width: '36px', height: '36px', objectFit: 'contain', borderRadius: '6px' } }) :
        isGradient ?
        React.createElement('div', { style: { width: '34px', height: '34px', borderRadius: '50%', background: fprev, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' } }, '🖼️') :
        React.createElement('span', { style: { fontSize: '24px', lineHeight: 1 } }, resolved.icon || r.icon || '🎁'),
        React.createElement('span', { style: { fontSize: '9px', color: '#d1d5db', textAlign: 'center', lineHeight: 1.2, wordBreak: 'break-word', width: '100%' } }, lang === 'ar' ? resolved.label_ar || r.label_ar || resolved.name || '' : resolved.label_en || r.label_en || resolved.name || ''),
        dur && React.createElement('span', { style: { fontSize: '8px', color: '#60a5fa', fontWeight: 700, background: 'rgba(96,165,250,0.15)', borderRadius: '4px', padding: '1px 4px' } }, dur + (lang === 'ar' ? ' أيام' : 'd')),
        qty > 1 && React.createElement('span', { style: { fontSize: '9px', color: '#9ca3af', fontWeight: 700 } }, '\u00d7' + qty),
        isLimited && React.createElement('span', { style: { fontSize: '7px', background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '3px', padding: '1px 3px' } }, lang === 'ar' ? 'حصري' : 'Exclusive')
        );
      })
      ),
      Object.keys(liveDrops).length > 0 && React.createElement('div', null,
      React.createElement('div', { style: { fontSize: '10px', fontWeight: 800, color: '#9ca3af', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' } },
      '👥 ' + (lang === 'ar' ? 'الأعضاء في الصندوق' : 'Members in Chest') + ' (' + Object.keys(liveDrops).length + ')'
      ),
      Object.entries(liveDrops).map(function (entry) {
        var uid2 = entry[0];var drop = entry[1];
        var hasClaimed2 = !!liveClaimedBy[uid2];
        var isCurrentUser = uid2 === currentUID;
        var memberName = msg.assignedMemberNames && msg.assignedMemberNames[uid2] || (familyMembers.find(function (m) {return m.id === uid2;}) || {}).displayName || uid2.slice(0, 8);
        // Build reward pills for currency/coins/charisma
        var pills = [];
        if (drop.currency > 0) pills.push({ lbl: drop.currency.toLocaleString() + ' 🧠', color: '#00f2ff', bg: 'rgba(0,242,255,0.12)', bdr: 'rgba(0,242,255,0.3)' });
        if (drop.coins > 0) pills.push({ lbl: drop.coins.toLocaleString() + ' ' + (FAMILY_COINS_SYMBOL || '🏅'), color: '#ffd700', bg: 'rgba(255,215,0,0.12)', bdr: 'rgba(255,215,0,0.3)' });
        if (drop.charisma > 0) pills.push({ lbl: drop.charisma.toLocaleString() + ' ⭐', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', bdr: 'rgba(167,139,250,0.3)' });
        // Build mini item cards
        var itemCards = (drop.items || []).map(function (it, iti) {
          var res = typeof window.resolveRewardItem === 'function' ? window.resolveRewardItem(it) : it;
          var iSrc = res.imageURL || res.imageUrl || null;
          var fp = res.preview || null;
          var isIP = fp && (fp.startsWith('http') || fp.startsWith('icos'));
          return React.createElement('div', { key: iti, style: { display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '6px', padding: '2px 5px' } },
          iSrc ? React.createElement('img', { src: iSrc, alt: '', style: { width: '14px', height: '14px', objectFit: 'contain', borderRadius: '2px' } }) :
          isIP ? React.createElement('img', { src: fp, alt: '', style: { width: '14px', height: '14px', objectFit: 'contain', borderRadius: '2px' } }) :
          React.createElement('span', { style: { fontSize: '12px', lineHeight: 1 } }, res.icon || it.icon || '🎁'),
          React.createElement('span', { style: { fontSize: '8px', color: '#d1d5db', maxWidth: '55px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, lang === 'ar' ? res.label_ar || '' : res.label_en || ''),
          (it.qty || 1) > 1 && React.createElement('span', { style: { fontSize: '8px', color: '#9ca3af', fontWeight: 700 } }, '\u00d7' + (it.qty || 1))
          );
        });
        var hasRewards = pills.length > 0 || itemCards.length > 0;
        return React.createElement('div', { key: uid2, style: { display: 'flex', flexDirection: 'column', gap: '5px', padding: '7px 8px', marginBottom: '4px', borderRadius: '9px', background: hasClaimed2 ? 'rgba(16,185,129,0.1)' : isCurrentUser ? 'rgba(0,242,255,0.07)' : 'rgba(255,255,255,0.03)', border: '1px solid ' + (hasClaimed2 ? 'rgba(16,185,129,0.25)' : isCurrentUser ? 'rgba(0,242,255,0.25)' : 'rgba(255,255,255,0.07)') } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
        React.createElement('span', { style: { fontSize: '14px', flexShrink: 0 } }, hasClaimed2 ? '✅' : '⏳'),
        React.createElement('span', { style: { fontSize: '10px', color: hasClaimed2 ? '#10b981' : '#e2e8f0', fontWeight: 700, flex: 1 } }, memberName + (isCurrentUser ? lang === 'ar' ? ' (أنت)' : ' (You)' : ''))
        ),
        hasClaimed2 && hasRewards && React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '4px', paddingLeft: '20px' } },
        pills.map(function (p, pi) {return React.createElement('span', { key: 'p' + pi, style: { fontSize: '9px', color: p.color, background: p.bg, border: '1px solid ' + p.bdr, borderRadius: '5px', padding: '2px 6px', fontWeight: 700 } }, p.lbl);}).concat(itemCards)
        ),
        !hasClaimed2 && React.createElement('div', { style: { fontSize: '9px', color: '#6b7280', paddingLeft: '20px' } }, lang === 'ar' ? 'لم يستلم بعد' : 'Not claimed yet')
        );
      }),
      React.createElement('div', { style: { marginTop: '8px', padding: '5px 8px', borderRadius: '7px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '10px', color: '#9ca3af', display: 'flex', justifyContent: 'space-between' } },
      React.createElement('span', null, (lang === 'ar' ? 'استلموا ' : 'Claimed ') + totalClaimed + (lang === 'ar' ? ' من ' : ' of ') + totalAssigned),
      React.createElement('span', { style: { color: totalClaimed < totalAssigned ? '#fbbf24' : '#10b981' } }, totalClaimed < totalAssigned ? totalAssigned - totalClaimed + (lang === 'ar' ? ' متبقي' : ' remaining') : lang === 'ar' ? 'اكتمل ✅' : 'Complete ✅')
      )
      )
      ),
      React.createElement('div', { style: { fontSize: '8px', color: '#4b5563', marginTop: '2px' } }, fmtTime(msg.timestamp))
      )
      );
    }
    // 🧧 Red Packet message
    if (msg.type === 'red_packet') return React.createElement('div', { key: msg.id, style: { display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-end' } },
    React.createElement('div', {
      onClick: function () {openFamilyChatMiniProfile(msg.senderId, { name: msg.senderName, photo: msg.senderPhoto });},
      style: { width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.1)', cursor: 'pointer' }
    }, msg.senderPhoto ? React.createElement('img', { src: msg.senderPhoto, alt: '', style: { width: '100%', height: '100%', objectFit: 'cover' } }) : React.createElement('div', { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' } }, '😎')),
    React.createElement('div', { style: { maxWidth: 'min(220px,calc(100vw-90px))' } },
    !isMe && React.createElement('div', { style: { fontSize: '9px', color: '#a78bfa', fontWeight: 700, marginBottom: '3px', paddingLeft: '4px', cursor: 'pointer' }, onClick: function () {openFamilyChatMiniProfile(msg.senderId, { name: msg.senderName, photo: msg.senderPhoto });} }, msg.senderName),
    RedPacketCard && React.createElement(RedPacketCard, {
      rpId: msg.rpId, rpAmount: msg.rpAmount, maxClaims: msg.maxClaims, senderName: msg.senderName,
      currentUID: currentUID, user: { uid: currentUID }, currentUser: userData || currentUserData, lang: lang,
      onClaim: async function (rpId) {
        try {
          var rpDoc = await redPacketsCollection.doc(rpId).get();
          if (!rpDoc.exists) return;
          var rp = rpDoc.data();
          if (rp.claimedBy && rp.claimedBy.includes(currentUID)) {
            if (window.showToast) window.showToast(lang === 'ar' ? '❌ استلمته من قبل' : '❌ Already claimed');else
            if (onNotification) onNotification(lang === 'ar' ? '❌ استلمته من قبل' : '❌ Already claimed');
            return;
          }
          if ((rp.claimedBy && rp.claimedBy.length || 0) >= (rp.maxClaims || 1)) {
            if (window.showToast) window.showToast(lang === 'ar' ? '❌ نفد المغلف' : '❌ Exhausted');else
            if (onNotification) onNotification(lang === 'ar' ? '❌ نفد المغلف' : '❌ Exhausted');
            return;
          }
          var perClaim = Math.floor(rp.amount / (rp.maxClaims || 1));
          var bonus = Math.floor(Math.random() * Math.floor(perClaim * 0.5));
          var claim = Math.min(perClaim + bonus, rp.remaining || rp.amount);

          var myName = currentUserData?.displayName || userData?.displayName || 'User';

          await redPacketsCollection.doc(rpId).update({
            claimedBy: firebase.firestore.FieldValue.arrayUnion(currentUID),
            claimerNames: firebase.firestore.FieldValue.arrayUnion(myName),
            remaining: firebase.firestore.FieldValue.increment(-claim),
            status: (rp.claimedBy && rp.claimedBy.length || 0) + 1 >= (rp.maxClaims || 1) ? 'exhausted' : 'active'
          });
          // 🛡️ SECURITY: Use centralized service for Red Packet claim
          await window.SecurityService.applyCurrencyTransaction(currentUID, claim, `Family Red Packet Claim: ${rp.id}`, { familyId: familyId, rpId: rp.id });
          onNotification(lang === 'ar' ? `✅ تم استلام ${claim} 🧠` : `✅ Claimed ${claim} 🧠`);
          await familiesCollection.doc(familyId).collection('messages').add({
            type: 'system',
            text: lang === 'ar' ? '🎉 ' + myName + ' استلم ' + claim + ' 🧠 من مغلف ' + rp.senderName : '🎉 ' + myName + ' claimed ' + claim + ' 🧠 from ' + rp.senderName + "'s packet",
            senderId: 'system',
            timestamp: TS()
          });
        } catch (e) {
          console.error(e);
          if (window.showToast) window.showToast(lang === 'ar' ? '❌ خطأ' : '❌ Error');
        }
      }
    }),
    React.createElement('div', { style: { fontSize: '9px', color: '#d1d5db', marginTop: '2px', textAlign: isMe ? 'right' : 'left', paddingLeft: '4px' } }, fmtTime(msg.timestamp))
    )
    );
    if (isSystem) return React.createElement('div', { key: msg.id, style: { textAlign: 'center', padding: '4px 12px' } },
    React.createElement('span', { style: { fontSize: '10px', color: '#6b7280', background: 'rgba(255,255,255,0.04)', padding: '3px 10px', borderRadius: '20px' } }, msg.text)
    );
    if (isDonation) return React.createElement('div', { key: msg.id, style: { display: 'flex', justifyContent: 'center', padding: '4px 0' } },
    React.createElement('div', { style: { background: 'linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,140,0,0.1))', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '12px', padding: '8px 14px', maxWidth: '90%', textAlign: 'center' } },
    React.createElement('div', { style: { fontSize: '12px', color: '#ffd700', fontWeight: 800 } }, msg.text),
    React.createElement('div', { style: { fontSize: '10px', color: '#6b7280', marginTop: '2px' } }, fmtTime(msg.timestamp))
    )
    );
    var isAnnouncement = msg.type === 'announcement';
    if (isAnnouncement) return React.createElement('div', { key: msg.id, style: { display: 'flex', justifyContent: 'center', padding: '6px 0' } },
    React.createElement('div', {
      style: { width: '100%', background: 'linear-gradient(135deg,rgba(255,165,0,0.2),rgba(255,80,0,0.12))', border: '1.5px solid rgba(255,165,0,0.5)', borderRadius: '14px', padding: '10px 14px', position: 'relative', overflow: 'hidden', boxShadow: '0 0 18px rgba(255,140,0,0.18)' }
    },
    React.createElement('div', { style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'linear-gradient(180deg,#ffd700,#ff8800)', borderRadius: '14px 0 0 14px' } }),
    React.createElement('div', { style: { paddingLeft: '8px' } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' } },
    React.createElement('span', { style: { fontSize: '16px' } }, '📢'),
    React.createElement('span', { style: { fontSize: '10px', fontWeight: 900, color: '#fbbf24', letterSpacing: '1px', textTransform: 'uppercase' } }, lang === 'ar' ? 'إعلان رسمي' : 'OFFICIAL ANNOUNCEMENT'),
    React.createElement('span', { style: { marginLeft: 'auto', fontSize: '9px', color: '#6b7280' } }, fmtTime(msg.timestamp))
    ),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' } },
    msg.senderPhoto ? React.createElement('img', { src: msg.senderPhoto, alt: '', style: { width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(255,215,0,0.5)' } }) :
    React.createElement('div', { style: { width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' } }, '👤'),
    React.createElement('span', { style: { fontSize: '10px', fontWeight: 700, color: '#fde68a' } }, msg.senderName)
    ),
    React.createElement('div', { style: { fontSize: '13px', color: '#fef3c7', lineHeight: 1.6, fontWeight: 600, wordBreak: 'break-word' } }, msg.text)
    )
    )
    );
    return React.createElement('div', { key: msg.id, style: { display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-end' } },
    React.createElement('div', {
      onClick: function () {openFamilyChatMiniProfile(msg.senderId, { name: msg.senderName, photo: msg.senderPhoto });},
      style: { width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.1)', cursor: 'pointer' }
    }, msg.senderPhoto ? React.createElement('img', { src: msg.senderPhoto, alt: '', style: { width: '100%', height: '100%', objectFit: 'cover' } }) :
    React.createElement('div', { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' } }, '😎')),
    React.createElement('div', { style: { maxWidth: 'min(72%, calc(100vw - 100px))' } },
    React.createElement('div', {
      onClick: function () {openFamilyChatMiniProfile(msg.senderId, { name: msg.senderName, photo: msg.senderPhoto });},
      style: { fontSize: '10px', color: isMe ? '#00f2ff' : '#9ca3af', marginBottom: '3px', fontWeight: 700, paddingLeft: isMe ? '0' : '4px', paddingRight: isMe ? '4px' : '0', cursor: 'pointer', textAlign: isMe ? 'right' : 'left' },
      onMouseEnter: function (e) {e.currentTarget.style.color = '#00f2ff';},
      onMouseLeave: function (e) {e.currentTarget.style.color = isMe ? '#00f2ff' : '#9ca3af';}
    }, msg.senderName),
    msg.type === 'image' && msg.imageUrl ?
    React.createElement('img', { src: msg.imageUrl, alt: '', style: { width: 'min(240px,calc(100vw - 80px))', maxHeight: '240px', borderRadius: '12px', display: 'block', objectFit: 'cover', cursor: 'pointer' }, onClick: function () {var w = window.open();w.document.write('<body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="' + msg.imageUrl + '" style="max-width:100vw;max-height:100vh;object-fit:contain"></body>');} }) :
    React.createElement('div', { style: { padding: '8px 12px', borderRadius: isMe ? '14px 4px 14px 14px' : '4px 14px 14px 14px', background: isMe ? 'linear-gradient(135deg,rgba(0,242,255,0.2),rgba(112,0,255,0.2))' : 'rgba(255,255,255,0.07)', border: isMe ? '1px solid rgba(0,242,255,0.3)' : '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: '#e2e8f0', lineHeight: 1.5, wordBreak: 'break-word' } }, renderMsgText(msg.text)),
    React.createElement('div', { style: { fontSize: '9px', color: '#4b5563', marginTop: '2px', textAlign: isMe ? 'right' : 'left', paddingLeft: '4px', paddingRight: '4px' } }, fmtTime(msg.timestamp))
    )
    );
  }),
  React.createElement('div', { ref: chatEndRef })
  ),

  // ── @ Mention list ──
  showMentionList && mentionMembers.length > 0 && React.createElement('div', {
    style: { background: '#0e1020', border: '1px solid rgba(0,242,255,0.2)', borderRadius: '12px', margin: '0 8px 4px', overflow: 'hidden', maxHeight: '160px', overflowY: 'auto', flexShrink: 0 }
  },
  mentionMembers.map(function (m) {
    return React.createElement('div', {
      key: m.id,
      onClick: function () {selectMention(m);},
      style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', cursor: 'pointer', transition: 'background 0.12s' },
      onMouseEnter: function (e) {e.currentTarget.style.background = 'rgba(0,242,255,0.08)';},
      onMouseLeave: function (e) {e.currentTarget.style.background = 'transparent';}
    },
    React.createElement('div', { style: { width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.08)' } },
    m.photoURL ? React.createElement('img', { src: m.photoURL, alt: '', style: { width: '100%', height: '100%', objectFit: 'cover' } }) :
    React.createElement('span', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '12px' } }, '😎')),
    React.createElement('span', { style: { fontSize: '12px', fontWeight: 700, color: 'white' } }, '@' + m.displayName),
    m.id === currentUID && React.createElement('span', { style: { fontSize: '10px', color: '#6b7280' } }, lang === 'ar' ? '(أنت)' : '(you)')
    );
  })
  ),
  // Input bar
  React.createElement('div', {
    style: { padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.3)', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, boxSizing: 'border-box', width: '100%' }
  },
  React.createElement('input', { ref: imgInputRef, type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: handleImageUpload }),
  React.createElement('button', {
    onClick: function () {if (imgInputRef.current) imgInputRef.current.click();},
    style: { width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
  }, '📷'),

  onSendGift && React.createElement('button', {
    onClick: function () {setGiftTarget(userData || currentUserData);setShowChatGiftModal(true);},
    title: lang === 'ar' ? 'أرسل هدية لعضو' : 'Send gift to a member',
    style: { width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.22)', color: '#9ca3af', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
  }, '🎁'),
  React.createElement('button', {
    onClick: function () {setShowFamRPModal(true);},
    title: lang === 'ar' ? 'أرسل مغلف' : 'Send Packet',
    style: { width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
  }, '🧧'),
  React.createElement('input', {
    ref: chatInputRef,
    value: chatInput,
    onChange: handleInputChange,
    onKeyDown: function (e) {
      if (e.key === 'Escape') setShowMentionList(false);
      if (e.key === 'Enter' && !e.shiftKey && !showMentionList) {e.preventDefault();sendMessage(chatInput);}
    },
    maxLength: 400,
    style: { flex: 1, padding: '9px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', outline: 'none', minWidth: 0, width: '100%', boxSizing: 'border-box', wordBreak: 'break-word', overflowWrap: 'break-word' },
    placeholder: lang === 'ar' ? 'اكتب رسالة... أو @ للمنشن' : 'Type a message... or @ to mention'
  }),
  React.createElement('button', {
    onClick: function () {sendMessage(chatInput);},
    disabled: !chatInput.trim() || sendingMsg,
    style: { width: '40px', height: '40px', borderRadius: '12px', border: 'none', flexShrink: 0, background: chatInput.trim() ? 'linear-gradient(135deg,#00f2ff,#7000ff)' : 'rgba(255,255,255,0.06)', color: chatInput.trim() ? 'white' : '#6b7280', fontSize: '18px', cursor: chatInput.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  }, sendingMsg ? '⏳' : '➤')
  ),
  // 🧧 Red Packet Modal
  showFamRPModal && React.createElement('div', {
    style: { position: 'fixed', inset: 0, zIndex: Z.OVERLAY, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }
  },
  React.createElement('div', {
    style: { width: '100%', maxWidth: 'min(440px,100vw)', background: 'linear-gradient(160deg,#0e0e22,#13122a)', borderRadius: '20px 20px 0 0', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }
  },
  React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' } },
  React.createElement('div', { style: { fontSize: '14px', fontWeight: 800, color: '#ef4444' } }, '🧧 ' + (lang === 'ar' ? 'مغلف أحمر للقبيلة' : 'Family Red Packet')),
  React.createElement('button', { onClick: function () {setShowFamRPModal(false);}, style: { background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer' } }, '✕')
  ),
  React.createElement('div', { style: { padding: '14px', overflowY: 'auto', maxHeight: '60vh' } },
  React.createElement('div', { style: { fontSize: '11px', color: '#6b7280', marginBottom: '12px', textAlign: 'center' } },
  (lang === 'ar' ? 'رصيدك:' : 'Balance:') + ' ',
  React.createElement('span', { style: { color: '#ffd700', fontWeight: 700 } }, ((userData || currentUserData)?.currency || 0).toLocaleString() + ' 🧠')
  ),
  typeof RED_PACKETS_CONFIG !== 'undefined' && RED_PACKETS_CONFIG.map(function (rp) {
    var balance = (userData || currentUserData)?.currency || 0;
    var canBuy = balance >= rp.amount;
    return React.createElement('button', {
      key: rp.id,
      disabled: sendingFamRP || !canBuy,
      onClick: async function () {
        if (sendingFamRP || !canBuy) return;
        setSendingFamRP(true);
        try {
          var sender = userData || currentUserData;
          var rpRef = await redPacketsCollection.add({
            configId: rp.id, amount: rp.amount,
            senderId: currentUID, senderName: sender.displayName || 'User', senderPhoto: sender.photoURL || null,
            targetType: 'family', targetId: familyId, targetName: familyData && familyData.name || 'Family',
            claimedBy: [], maxClaims: rp.maxClaims, remaining: rp.amount,
            createdAt: TS(), status: 'active'
          });
          // 🛡️ SECURITY: Use centralized service for Red Packet creation
          await window.SecurityService.applyCurrencyTransaction(currentUID, -rp.amount, `Family Red Packet Send: ${rp.type}`, { familyId: familyId, rpType: rp.type });
          onNotification(lang === 'ar' ? '✅ تم إرسال العيدية' : '✅ Red Packet Sent');
          await familiesCollection.doc(familyId).collection('messages').add({
            type: 'red_packet', rpId: rpRef.id, rpAmount: rp.amount, rpConfigId: rp.id,
            senderId: currentUID, senderName: sender.displayName || 'User', senderPhoto: sender.photoURL || null,
            text: '🧧 ' + rp.amount, timestamp: TS(), maxClaims: rp.maxClaims
          });
          await publicChatCollection.add({
            type: 'red_packet_announce', senderId: currentUID, senderName: sender.displayName || 'User',
            amount: rp.amount, targetType: 'family', targetName: familyData && familyData.name || 'Family',
            text: lang === 'ar' ? '🧧 ' + (sender.displayName || 'User') + ' أرسل مغلف ' + rp.amount + ' في قبيلة ' + (familyData && familyData.name || 'Family') : '🧧 ' + (sender.displayName || 'User') + ' sent a ' + rp.amount + ' packet in family ' + (familyData && familyData.name || 'Family'),
            createdAt: TS()
          });
          setShowFamRPModal(false);
          if (onNotification) onNotification(lang === 'ar' ? '✅ تم إرسال المغلف!' : '✅ Packet sent!');
        } catch (e) {if (onNotification) onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error');}
        setSendingFamRP(false);
      },
      style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '14px', background: rp.bg, border: '1px solid ' + rp.border, cursor: canBuy ? 'pointer' : 'not-allowed', opacity: canBuy ? 1 : 0.4, textAlign: 'left', width: '100%', marginBottom: '8px', boxSizing: 'border-box' }
    },
    rp.imageURL ? React.createElement('img', { src: rp.imageURL, style: { width: '40px', height: '40px', objectFit: 'contain' } }) : React.createElement('div', { style: { width: '40px', height: '40px', borderRadius: '10px', background: rp.color + '20', border: '1px solid ' + rp.color + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' } }, '🧧'),
    React.createElement('div', { style: { flex: 1 } },
    React.createElement('div', { style: { fontSize: '13px', fontWeight: 800, color: rp.color } }, lang === 'ar' ? rp.name_ar : rp.name_en),
    React.createElement('div', { style: { fontSize: '10px', color: '#9ca3af', marginTop: '2px' } }, lang === 'ar' ? rp.desc_ar : rp.desc_en)
    ),
    React.createElement('div', { style: { fontSize: '13px', fontWeight: 800, color: rp.color } }, rp.amount.toLocaleString() + ' 🧠')
    );
  })
  )
  )
  ),
  // Gift modal
  showChatGiftModal && onSendGift && SendGiftModal && React.createElement(SendGiftModal, {
    show: showChatGiftModal,
    onClose: function () {setShowChatGiftModal(false);setGiftTarget(null);},
    targetUser: giftTarget,
    currentUser: userData || currentUserData,
    lang: lang,
    onSendGift: async function (gift, target, qty) {
      if (target && target.uid) {
        var targetDoc = target.uid === currentUID ?
        { uid: target.uid, ...target } :
        await usersCollection.doc(target.uid).get().then((d) => d.exists ? { uid: target.uid, ...d.data() } : target).catch(() => target);
        await onSendGift(gift, targetDoc, qty || 1, false, familyId);
      }
      setShowChatGiftModal(false);
      setGiftTarget(null);
    },
    currency: (userData || currentUserData)?.currency || 0,
    friendsData: familyMembers.filter(function (m) {return m.id !== currentUID;}).map(function (m) {return Object.assign({}, m, { uid: m.id });})
  })
  )
  )
  );
};

window.FamilyChatModal = FamilyChatModal;
// No export default.
