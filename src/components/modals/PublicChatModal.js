(function () {
  var { useState, useEffect, useRef, createElement } = React;
  var Z = window.Z || { MODAL: 10000, MODAL_HIGH: 12000, MODAL_TOP: 15000 };

  var PublicChatModal = ({ show, onClose, currentUser, user, lang, onNotification, isLoggedIn, onOpenProfile, currentUID }) => {
    var [messages, setMessages] = useState([]);
    var [msgText, setMsgText] = useState('');
    var [sending, setSending] = useState(false);
    var [editingMsgId, setEditingMsgId] = useState(null);
    var [editText, setEditText] = useState('');
    var [uploadingImg, setUploadingImg] = useState(false);
    var [showEmojiPicker, setShowEmojiPicker] = useState(false);
    var [showRPModal, setShowRPModal] = useState(false);
    var [sendingRP, setSendingRP] = useState(false);
    var [menuMsgId, setMenuMsgId] = useState(null);
    // ── Mini Profile state ──
    var [miniProfilePub, setMiniProfilePub] = useState(null);
    var [miniMenuPub, setMiniMenuPub] = useState(false);
    // ── Report modal ──
    var [showReportModal, setShowReportModal] = useState(false);
    var [reportReason, setReportReason] = useState('');
    var [isCheckingReport, setIsCheckingReport] = useState(false);
    var [alreadyReported, setAlreadyReported] = useState(false);
    var [selectedMsg, setSelectedMsg] = useState(null);
    var [submittingReport, setSubmittingReport] = useState(false);
    var messagesEndRef = useRef(null);
    var inputRef = useRef(null);
    var fileInputRef = useRef(null);

    useEffect(() => {
      if (!show) return;
      var unsub = publicChatCollection.
        orderBy('createdAt', 'asc').
        limitToLast(100).
        onSnapshot((snap) => {
          setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }, () => { });
      return () => unsub();
    }, [show]);

    var sendMsg = async () => {
      if (!msgText.trim() || !user || !isLoggedIn || sending) return;
      var text = msgText.trim(); setMsgText(''); setSending(true);
      try {
        var vipLevel = typeof window.getVIPLevel === 'function' ? window.getVIPLevel(currentUser) || 0 : 0;
        await publicChatCollection.add({
          type: 'text', text,
          senderId: user.uid,
          senderName: currentUser?.displayName || 'User',
          senderPhoto: currentUser?.photoURL || null,
          senderVipLevel: vipLevel,
          senderTitle: currentUser?.activeTitle || null,
          senderFrame: currentUser?.equipped?.frames || null,
          senderBadges: (currentUser?.equipped?.badges || []).slice(0, 3),
          senderFamilyName: null,
          createdAt: TS()
        });
      } catch (e) { setMsgText(text); }
      setSending(false);
    };

    var handleImgUpload = async (e) => {
      var file = e.target.files?.[0];
      if (!file || !file.type.startsWith('image/') || !user || uploadingImg) return;
      setUploadingImg(true);
      try {
        var base64 = await compressImageToBase64(file);
        await publicChatCollection.add({
          type: 'image', imageData: base64, text: '📷',
          senderId: user.uid, senderName: currentUser?.displayName || 'User',
          senderPhoto: currentUser?.photoURL || null,
          createdAt: TS()
        });
      } catch (e) { onNotification(lang === 'ar' ? '❌ فشل رفع الصورة' : '❌ Image upload failed'); }
      setUploadingImg(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    var handleDeleteMsg = async (msgId) => {
      if (!msgId) return;
      try { await publicChatCollection.doc(msgId).delete(); }
      catch (e) { onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
      setMenuMsgId(null);
    };

    var handleEditMsg = async (msgId) => {
      if (!editText.trim() || !msgId) return;
      try { await publicChatCollection.doc(msgId).update({ text: editText.trim(), edited: true }); }
      catch (e) { onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
      setEditingMsgId(null); setEditText('');
    };

    var handleReportTrigger = async (msg) => {
      if (!user) return;
      setSelectedMsg(msg);
      setReportReason('');
      setAlreadyReported(false);
      setIsCheckingReport(true);
      setShowReportModal(true);
      setMenuMsgId(null);
      try {
        var snap = await reportsCollection.where('reporterUID', '==', user.uid).where('resolved', '==', false).get();
        var isDuplicate = snap.docs.some((doc) => {
          var data = doc.data();
          return data.msgId === msg.id && data.type === 'public_chat';
        });
        if (isDuplicate) setAlreadyReported(true);
      } catch (e) {
        console.error('Check report error:', e);
      } finally {
        setIsCheckingReport(false);
      }
    };

    var handleSubmitReport = async () => {
      if (!user || !selectedMsg || !reportReason || submittingReport) return;
      setSubmittingReport(true);
      try {
        await reportsCollection.add({
          type: 'public_chat',
          msgId: selectedMsg.id,
          msgText: selectedMsg.text,
          reason: reportReason,
          reporterUID: user.uid,
          reporterName: currentUser?.displayName || 'User',
          reportedUID: selectedMsg.senderId,
          reportedName: selectedMsg.senderName,
          createdAt: TS(),
          status: 'pending',
          resolved: false
        });
        setShowReportModal(false);
        onNotification(lang === 'ar' ? '✅ تم إرسال البلاغ' : '✅ Report sent');
      } catch (e) {
        onNotification(lang === 'ar' ? '❌ فشل إرسال البلاغ' : '❌ Failed to send report');
      }
      setSubmittingReport(false);
    };

    var sendPublicRP = async (rp) => {
      if (!user || !currentUser || sendingRP) return;
      if ((currentUser?.currency || 0) < rp.amount) { onNotification(lang === 'ar' ? '❌ رصيد غير كافٍ' : '❌ Insufficient balance'); return; }
      setSendingRP(true);
      try {
        var rpRef = await redPacketsCollection.add({
          configId: rp.id, amount: rp.amount,
          senderId: user.uid, senderName: currentUser.displayName || 'User', senderPhoto: currentUser.photoURL || null,
          targetType: 'public', targetId: 'public', targetName: 'Public',
          claimedBy: [], maxClaims: rp.maxClaims, remaining: rp.amount,
          createdAt: TS(), status: 'active'
        });
        // 🛡️ SECURITY: Public Red Packet Creation
        if (window.SecurityService) {
          await window.SecurityService.applyCurrencyTransaction(user.uid, -rp.amount, `Public Red Packet Send: ${rp.id}`, { rpId: rp.id });
        } else {
          await usersCollection.doc(user.uid).update({ currency: firebase.firestore.FieldValue.increment(-rp.amount) });
        }

        await publicChatCollection.add({
          type: 'red_packet', rpId: rpRef.id, rpAmount: rp.amount, rpConfigId: rp.id,
          senderId: user.uid, senderName: currentUser.displayName || 'User', senderPhoto: currentUser.photoURL || null,
          text: `🧧 ${rp.amount}`, createdAt: TS(), maxClaims: rp.maxClaims
        });
        setShowRPModal(false);
        onNotification(lang === 'ar' ? '✅ تم إرسال المغلف!' : '✅ Packet sent!');
      } catch (e) { onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
      setSendingRP(false);
    };

    var claimPublicRP = async (rpId) => {
      if (!rpId || !user) return;
      try {
        var rpDoc = await redPacketsCollection.doc(rpId).get();
        if (!rpDoc.exists) return;
        var rp = rpDoc.data();
        // ❌ المرسل لا يستطيع الاستلام من مغلفه في الشات العام
        if (rp.senderId === user.uid) {
          if (window.showToast) window.showToast(lang === 'ar' ? '❌ لا يمكنك استلام مغلفك الخاص' : '❌ You cannot claim your own packet'); else
            onNotification(lang === 'ar' ? '❌ لا يمكنك استلام مغلفك الخاص' : '❌ You cannot claim your own packet');
          return;
        }
        if (rp.claimedBy?.includes(user.uid)) {
          if (window.showToast) window.showToast(lang === 'ar' ? '❌ استلمته من قبل' : '❌ Already claimed'); else
            onNotification(lang === 'ar' ? '❌ استلمته من قبل' : '❌ Already claimed');
          return;
        }
        if ((rp.claimedBy?.length || 0) >= rp.maxClaims) {
          if (window.showToast) window.showToast(lang === 'ar' ? '❌ نفد المغلف' : '❌ Exhausted'); else
            onNotification(lang === 'ar' ? '❌ نفد المغلف' : '❌ Exhausted');
          return;
        }
        var perClaim = Math.floor(rp.amount / (rp.maxClaims || 1));
        var bonus = Math.floor(Math.random() * Math.floor(perClaim * 0.5));
        var claim = Math.min(perClaim + bonus, rp.remaining || rp.amount);

        var myName = currentUser?.displayName || 'User';

        await redPacketsCollection.doc(rpId).update({
          claimedBy: firebase.firestore.FieldValue.arrayUnion(user.uid),
          claimerNames: firebase.firestore.FieldValue.arrayUnion(myName),
          remaining: firebase.firestore.FieldValue.increment(-claim),
          status: (rp.claimedBy?.length || 0) + 1 >= (rp.maxClaims || 1) ? 'exhausted' : 'active'
        });
        // 🛡️ SECURITY: Public Red Packet Claim
        if (window.SecurityService) {
          await window.SecurityService.applyCurrencyTransaction(user.uid, claim, `Public Red Packet Claim: ${rpId}`, { rpId: rpId });
        } else {
          await usersCollection.doc(user.uid).update({ currency: firebase.firestore.FieldValue.increment(claim) });
        }

        await publicChatCollection.add({
          type: 'system',
          text: lang === 'ar' ? `🎉 ${myName} استلم ${claim} 🧠 من مغلف ${rp.senderName}` : `🎉 ${myName} claimed ${claim} 🧠 from ${rp.senderName}'s packet`,
          createdAt: TS(), senderId: 'system'
        });
        if (window.showToast) window.showToast(lang === 'ar' ? `🎉 استلمت ${claim} Intel!` : `🎉 You got ${claim} Intel!`); else
          onNotification(lang === 'ar' ? `🎉 استلمت ${claim} Intel!` : `🎉 You got ${claim} Intel!`);
      } catch (e) {
        console.error(e);
        if (window.showToast) window.showToast(lang === 'ar' ? '❌ خطأ' : '❌ Error'); else
          onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error');
      }
    };

    var fmtTs = (ts) => {
      if (!ts) return '';
      var d = ts?.toDate ? ts.toDate() : new Date(ts?.seconds * 1000 || ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // ── Open Mini Profile (instead of full profile) ──
    var openMiniProfilePub = async (uid, basicData) => {
      if (!uid) return;
      setMiniMenuPub(false);
      setMiniProfilePub({ uid, name: basicData?.name || '...', photo: basicData?.photo || null, loading: true });
      var friends = user ? (currentUser?.friends || []).concat([]) : [];
      var data = await fetchMiniProfileData(uid, friends);
      if (data) setMiniProfilePub(data);
    };

    var handleBlock = async (uid) => {
      if (!user?.uid || !uid) return;
      try {
        await usersCollection.doc(user.uid).update({
          blockedUsers: firebase.firestore.FieldValue.arrayUnion(uid)
        });
        if (onNotification) onNotification(lang === 'ar' ? '🚫 تم حظر المستخدم' : '🚫 User blocked');
      } catch (e) { console.error('Block error:', e); }
    };

    var handleUnblock = async (uid) => {
      if (!user?.uid || !uid) return;
      try {
        await usersCollection.doc(user.uid).update({
          blockedUsers: firebase.firestore.FieldValue.arrayRemove(uid)
        });
        if (onNotification) onNotification(lang === 'ar' ? '✅ تم إلغاء الحظر' : '✅ User unblocked');
      } catch (e) { console.error('Unblock error:', e); }
    };

    if (!show) return null;

    return (/*#__PURE__*/
      React.createElement(PortalModal, null, /*#__PURE__*/
        React.createElement("input", { ref: fileInputRef, type: "file", accept: "image/*", style: { display: 'none' }, onChange: handleImgUpload }), /*#__PURE__*/
        React.createElement("div", { style: { position: 'fixed', inset: 0, zIndex: Z.MODAL_HIGH, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }, onClick: onClose }, /*#__PURE__*/
          React.createElement("div", {
            onClick: (e) => e.stopPropagation(), style: {
              width: '100%', maxWidth: 'min(480px, calc(100vw - 8px))',
              height: 'min(92vh, 720px)',
              minHeight: '400px',
              background: 'linear-gradient(160deg,rgba(5,5,18,0.99),rgba(9,8,26,0.99))',
              border: '1px solid rgba(74,222,128,0.15)', borderRadius: '16px', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', boxShadow: '0 28px 80px rgba(0,0,0,0.9)',
              boxSizing: 'border-box', position: 'relative'
            }
          }, /*#__PURE__*/

            React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, background: 'rgba(0,0,0,0.3)' } }, /*#__PURE__*/
              React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, /*#__PURE__*/
                React.createElement("div", { style: { width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(74,222,128,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' } }, "\uD83C\uDF0D"), /*#__PURE__*/
                React.createElement("div", null, /*#__PURE__*/
                  React.createElement("div", { style: { fontSize: '15px', fontWeight: 800, color: '#e2e8f0' } }, lang === 'ar' ? 'الشات العام' : 'Public Chat'), /*#__PURE__*/
                  React.createElement("div", { style: { fontSize: '10px', color: '#6b7280', marginTop: '1px' } }, lang === 'ar' ? 'الجميع هنا' : 'Everyone is here')
                )
              ), /*#__PURE__*/
              React.createElement("button", { onClick: onClose, style: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '6px 10px', color: '#9ca3af', fontSize: '16px', cursor: 'pointer' } }, "\u2715")
            ), /*#__PURE__*/


            React.createElement("div", { style: { flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' } },
              messages.map((msg, i) => {
                if (msg.type === 'system' || msg.type === 'red_packet_announce') return (/*#__PURE__*/
                  React.createElement("div", { key: msg.id || i, style: { textAlign: 'center', fontSize: '10px', color: '#6b7280', padding: '3px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '20px', alignSelf: 'center', maxWidth: '90%' } }, msg.text));

                if (msg.type === 'red_packet') {
                  var isMe = msg.senderId === currentUID;
                  return (/*#__PURE__*/
                    React.createElement("div", { key: msg.id || i, style: { display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-end' } }, /*#__PURE__*/
                      React.createElement("div", { style: { width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', flexShrink: 0, cursor: 'pointer', border: '2px solid rgba(239,68,68,0.4)' }, onClick: () => openMiniProfilePub(msg.senderId, { name: msg.senderName, photo: msg.senderPhoto }) },
                        msg.senderPhoto ? /*#__PURE__*/React.createElement("img", { src: msg.senderPhoto, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/React.createElement("span", { style: { fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' } }, "\uD83D\uDE0E")
                      ), /*#__PURE__*/
                      React.createElement("div", null, /*#__PURE__*/
                        React.createElement("div", { style: { fontSize: '10px', fontWeight: 700, marginBottom: '3px', paddingLeft: isMe ? 0 : '4px', paddingRight: isMe ? '4px' : 0, textAlign: isMe ? 'right' : 'left', cursor: 'pointer', color: '#fca5a5' }, onClick: () => openMiniProfilePub(msg.senderId, { name: msg.senderName, photo: msg.senderPhoto }) }, isMe ? lang === 'ar' ? 'أنت' : 'You' : msg.senderName), /*#__PURE__*/
                        React.createElement(RedPacketCard, { rpId: msg.rpId, rpAmount: msg.rpAmount, maxClaims: msg.maxClaims, senderId: msg.senderId, senderName: msg.senderName, currentUID: currentUID, user: user, currentUser: currentUser, lang: lang, onClaim: claimPublicRP }), /*#__PURE__*/
                        React.createElement("div", { style: { fontSize: '9px', color: '#374151', marginTop: '2px', textAlign: isMe ? 'right' : 'left', paddingLeft: '4px' } }, fmtTs(msg.createdAt))
                      )
                    ));

                }
                var isMe = msg.senderId === currentUID;
                var isImg = msg.type === 'image';
                var vipCfg = window.getVIPConfig(msg.senderVipLevel);
                var nameColor = vipCfg ? vipCfg.nameColor : isMe ? '#00f2ff' : '#a78bfa';
                return (/*#__PURE__*/
                  React.createElement("div", { key: msg.id || i, style: { display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-end' } }, /*#__PURE__*/

                    React.createElement("div", { style: { position: 'relative', width: '34px', height: '34px', flexShrink: 0 } }, /*#__PURE__*/
                      React.createElement("div", {
                        onClick: () => openMiniProfilePub(msg.senderId, { name: msg.senderName, photo: msg.senderPhoto }),
                        style: { width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', cursor: 'pointer', border: vipCfg ? `2px solid ${vipCfg.nameColor}` : '2px solid rgba(255,255,255,0.12)', boxShadow: vipCfg ? `0 0 8px ${vipCfg.nameColor}55` : 'none', position: 'relative' }
                      },
                        msg.senderPhoto ? /*#__PURE__*/React.createElement("img", { src: msg.senderPhoto, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/React.createElement("span", { style: { fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' } }, "\uD83D\uDE0E"),
                        msg.senderFrame && /*#__PURE__*/React.createElement("img", { src: msg.senderFrame, alt: "", onError: (e) => e.target.style.display = 'none', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' } })
                      )
                    ), /*#__PURE__*/
                    React.createElement("div", { style: { maxWidth: 'min(72%, calc(100vw - 80px))', minWidth: 0 } }, /*#__PURE__*/

                      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px', paddingLeft: isMe ? 0 : '2px', paddingRight: isMe ? '2px' : 0, justifyContent: isMe ? 'flex-end' : 'flex-start', flexWrap: 'wrap', cursor: 'pointer' }, onClick: () => openMiniProfilePub(msg.senderId, { name: msg.senderName, photo: msg.senderPhoto }) }, /*#__PURE__*/
                        React.createElement("span", { style: { fontSize: '10px', color: nameColor, fontWeight: 800 } }, isMe ? lang === 'ar' ? 'أنت' : 'You' : msg.senderName),
                        vipCfg && /*#__PURE__*/React.createElement("span", { style: { fontSize: '8px', fontWeight: 900, background: vipCfg.nameColor, color: '#000', padding: '1px 4px', borderRadius: '3px' } }, "VIP", msg.senderVipLevel),
                        msg.senderVipLevel > 0 && typeof VIP_CHAT_TITLE_URLS !== 'undefined' && VIP_CHAT_TITLE_URLS?.[msg.senderVipLevel] && /*#__PURE__*/React.createElement("img", { src: VIP_CHAT_TITLE_URLS[msg.senderVipLevel], alt: "", style: { height: '13px', objectFit: 'contain' } }),

                        (msg.senderBadges || []).slice(0, 3).map((b, bi) => {
                          if (!b) return null;
                          var badge = typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS.find((a) => a.id === b) : null;
                          if (!badge) return null;
                          return badge.imageUrl ? /*#__PURE__*/
                            React.createElement("img", { key: bi, src: badge.imageUrl, alt: "", onError: (e) => e.target.style.display = 'none', style: { width: '13px', height: '13px', objectFit: 'contain', flexShrink: 0 } }) : /*#__PURE__*/
                            React.createElement("span", { key: bi, style: { fontSize: '11px' } }, badge.icon || '🏅');
                        })
                      ),
                      editingMsgId === msg.id ? /*#__PURE__*/
                        React.createElement("div", { style: { display: 'flex', gap: '4px', alignItems: 'center' } }, /*#__PURE__*/
                          React.createElement("input", {
                            autoFocus: true, value: editText, onChange: (e) => setEditText(e.target.value), onKeyDown: (e) => { if (e.key === 'Enter') handleEditMsg(msg.id); if (e.key === 'Escape') { setEditingMsgId(null); setEditText(''); } },
                            style: { flex: 1, padding: '7px 10px', background: 'rgba(0,242,255,0.08)', border: '1px solid rgba(0,242,255,0.3)', borderRadius: '10px', color: 'white', fontSize: '12px', outline: 'none' }
                          }), /*#__PURE__*/
                          React.createElement("button", { onClick: () => handleEditMsg(msg.id), style: { background: 'rgba(0,242,255,0.2)', border: '1px solid rgba(0,242,255,0.4)', borderRadius: '7px', padding: '5px 8px', color: '#00f2ff', cursor: 'pointer', fontSize: '12px', fontWeight: 800 } }, "\u2713"), /*#__PURE__*/
                          React.createElement("button", { onClick: () => { setEditingMsgId(null); setEditText(''); }, style: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', padding: '5px 7px', color: '#9ca3af', cursor: 'pointer', fontSize: '11px' } }, "\u2715")
                        ) :
                        isImg ? /*#__PURE__*/
                          React.createElement("div", { style: { borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.09)', cursor: 'pointer', width: 'min(240px, calc(100vw - 80px))' }, onClick: () => { var w = window.open(); w.document.write(`<body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${msg.imageData}" style="max-width:100vw;max-height:100vh;object-fit:contain"></body>`); } }, /*#__PURE__*/
                            React.createElement("img", { src: msg.imageData, alt: "\uD83D\uDCF7", style: { display: 'block', width: '100%', maxHeight: '240px', objectFit: 'cover' } })
                          ) : /*#__PURE__*/

                          React.createElement("div", { style: { padding: '8px 12px', borderRadius: isMe ? '14px 4px 14px 14px' : '4px 14px 14px 14px', background: isMe ? 'linear-gradient(135deg,rgba(112,0,255,0.4),rgba(0,242,255,0.18))' : 'rgba(255,255,255,0.07)', border: isMe ? '1px solid rgba(0,242,255,0.18)' : '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: '#e2e8f0', lineHeight: 1.5, wordBreak: 'break-word' } },
                            msg.text,
                            msg.edited && /*#__PURE__*/React.createElement("span", { style: { fontSize: '9px', color: '#4b5563', marginLeft: '6px', fontStyle: 'italic' } }, lang === 'ar' ? '(معدّل)' : '(edited)')
                          ), /*#__PURE__*/

                      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', justifyContent: isMe ? 'flex-end' : 'flex-start', paddingLeft: '4px', paddingRight: '4px' } }, /*#__PURE__*/
                        React.createElement("span", { style: { fontSize: '9px', color: '#374151' } }, fmtTs(msg.createdAt)), /*#__PURE__*/

                        React.createElement("button", { onClick: () => setMenuMsgId(menuMsgId === msg.id ? null : msg.id), style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', color: '#4b5563', padding: '0 2px', lineHeight: 1 } }, "\u2022\u2022\u2022"),
                        menuMsgId === msg.id && /*#__PURE__*/
                        React.createElement("div", { style: { position: 'absolute', background: 'linear-gradient(160deg,#0e0e22,#13122a)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '5px', zIndex: 999, boxShadow: '0 8px 24px rgba(0,0,0,0.9)', minWidth: '120px', right: isMe ? '0' : 'auto', left: isMe ? 'auto' : '0' } },
                          isMe && !editingMsgId && /*#__PURE__*/
                          React.createElement("button", {
                            onClick: () => { setEditingMsgId(msg.id); setEditText(msg.text || ''); setMenuMsgId(null); }, style: { width: '100%', padding: '7px 10px', borderRadius: '7px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#00f2ff', fontWeight: 700, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' },
                            onMouseEnter: (e) => e.currentTarget.style.background = 'rgba(0,242,255,0.1)',
                            onMouseLeave: (e) => e.currentTarget.style.background = 'none'
                          }, "\u270F\uFE0F ", lang === 'ar' ? 'تعديل' : 'Edit'),

                          isMe && /*#__PURE__*/
                          React.createElement("button", {
                            onClick: () => handleDeleteMsg(msg.id), style: { width: '100%', padding: '7px 10px', borderRadius: '7px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#f87171', fontWeight: 700, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' },
                            onMouseEnter: (e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)',
                            onMouseLeave: (e) => e.currentTarget.style.background = 'none'
                          }, "\uD83D\uDDD1\uFE0F ", lang === 'ar' ? 'حذف' : 'Delete'), /*#__PURE__*/

                          React.createElement("button", {
                            onClick: () => handleReportTrigger(msg), style: { width: '100%', padding: '7px 10px', borderRadius: '7px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#9ca3af', fontWeight: 700, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' },
                            onMouseEnter: (e) => e.currentTarget.style.background = 'rgba(255,255,255,0.07)',
                            onMouseLeave: (e) => e.currentTarget.style.background = 'none'
                          }, "\uD83D\uDEA8 ", lang === 'ar' ? 'إبلاغ' : 'Report')
                        )

                      )
                    )
                  ));

              }),
              messages.length === 0 && /*#__PURE__*/React.createElement("div", { style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: '#4b5563', paddingTop: '40px' } }, /*#__PURE__*/React.createElement("div", { style: { fontSize: '32px' } }, "\uD83C\uDF0D"), /*#__PURE__*/React.createElement("div", { style: { fontSize: '12px' } }, lang === 'ar' ? 'ابدأ المحادثة!' : 'Start chatting!')), /*#__PURE__*/
              React.createElement("div", { ref: messagesEndRef })
            ),


            showRPModal && /*#__PURE__*/
            React.createElement("div", {
              style: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' },
              onClick: () => setShowRPModal(false)
            }, /*#__PURE__*/
              React.createElement("div", {
                style: { width: '100%', background: 'linear-gradient(160deg,#0e0e22,#13122a)', borderRadius: '20px 20px 0 0', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', maxHeight: '60%', boxSizing: 'border-box' },
                onClick: (e) => e.stopPropagation()
              }, /*#__PURE__*/
                React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' } }, /*#__PURE__*/
                  React.createElement("div", { style: { fontSize: '13px', fontWeight: 800, color: '#ef4444' } }, "\uD83E\uDDE7 ", lang === 'ar' ? 'أرسل مغلف للعموم' : 'Send Public Red Packet'), /*#__PURE__*/
                  React.createElement("button", { onClick: () => setShowRPModal(false), style: { background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer' } }, "\u2715")
                ), /*#__PURE__*/
                React.createElement("div", { style: { padding: '12px', overflowY: 'auto' } }, /*#__PURE__*/
                  React.createElement("div", { style: { fontSize: '11px', color: '#6b7280', marginBottom: '10px', textAlign: 'center' } }, lang === 'ar' ? 'رصيدك' : 'Balance', ": ", /*#__PURE__*/React.createElement("span", { style: { color: '#ffd700', fontWeight: 700 } }, (currentUser?.currency || 0).toLocaleString(), " \uD83E\uDDE0")), /*#__PURE__*/
                  React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '7px' } },
                    (typeof RED_PACKETS_CONFIG !== 'undefined' ? RED_PACKETS_CONFIG : []).map((rp) => /*#__PURE__*/
                      React.createElement("button", {
                        key: rp.id, onClick: () => sendPublicRP(rp), disabled: sendingRP || (currentUser?.currency || 0) < rp.amount,
                        style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '12px', background: rp.bg, border: `1px solid ${rp.border}`, cursor: (currentUser?.currency || 0) < rp.amount ? 'not-allowed' : 'pointer', opacity: (currentUser?.currency || 0) < rp.amount ? 0.4 : 1, textAlign: 'left' }
                      },
                        rp.imageURL ? /*#__PURE__*/React.createElement("img", { src: rp.imageURL, alt: "", style: { width: '36px', height: '36px', objectFit: 'contain' } }) : /*#__PURE__*/React.createElement("div", { style: { width: '36px', height: '36px', borderRadius: '10px', background: `${rp.color}20`, border: `1px solid ${rp.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' } }, "\uD83E\uDDE7"), /*#__PURE__*/
                        React.createElement("div", { style: { flex: 1 } }, /*#__PURE__*/
                          React.createElement("div", { style: { fontSize: '12px', fontWeight: 800, color: rp.color } }, lang === 'ar' ? rp.name_ar : rp.name_en), /*#__PURE__*/
                          React.createElement("div", { style: { fontSize: '10px', color: '#9ca3af', marginTop: '1px' } }, lang === 'ar' ? rp.desc_ar : rp.desc_en)
                        ), /*#__PURE__*/
                        React.createElement("div", { style: { fontSize: '12px', fontWeight: 800, color: rp.color } }, rp.amount.toLocaleString(), " \uD83E\uDDE0")
                      )
                    )
                  )
                )
              )
            ),



            miniProfilePub && /*#__PURE__*/
            React.createElement(MiniProfilePopup, {
              profile: miniProfilePub,
              onClose: () => { setMiniProfilePub(null); setMiniMenuPub(false); },
              currentUID: user?.uid,
              lang: lang,
              onOpenProfile: onOpenProfile,
              onBlock: handleBlock,
              onUnblock: handleUnblock,
              isBlocked: currentUser?.blockedUsers?.includes(miniProfilePub.uid),
              zIndex: Z.MODAL_HIGH + 10
            }
            ),



            isLoggedIn ? /*#__PURE__*/
              React.createElement("div", { style: { display: 'flex', gap: '5px', padding: '8px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, background: 'rgba(0,0,0,0.4)', position: 'relative', boxSizing: 'border-box', width: '100%' } },

                showEmojiPicker && /*#__PURE__*/
                React.createElement("div", { style: { position: 'absolute', bottom: '58px', left: 0, right: 0, background: '#0e1020', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '14px 14px 0 0', padding: '10px', zIndex: 10, boxShadow: '0 -14px 44px rgba(0,0,0,0.8)', maxHeight: '200px', overflowY: 'auto' } }, /*#__PURE__*/
                  React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' } }, /*#__PURE__*/
                    React.createElement("span", { style: { fontSize: '11px', fontWeight: 700, color: '#00f2ff' } }, lang === 'ar' ? 'إيموجي' : 'Emoji'), /*#__PURE__*/
                    React.createElement("button", { onClick: () => setShowEmojiPicker(false), style: { background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px' } }, "\u2715")
                  ),
                  createElement(EmojiPicker, { show: true, onClose: () => setShowEmojiPicker(false), onSelect: (e) => { setMsgText((p) => p + e); setShowEmojiPicker(false); inputRef.current?.focus(); }, lang, inline: true })
                ), /*#__PURE__*/

                React.createElement("button", { onClick: () => setShowEmojiPicker((v) => !v), style: { width: '36px', height: '36px', borderRadius: '10px', border: `1px solid ${showEmojiPicker ? 'rgba(0,242,255,0.3)' : 'rgba(255,255,255,0.08)'}`, background: showEmojiPicker ? 'rgba(0,242,255,0.12)' : 'rgba(255,255,255,0.05)', cursor: 'pointer', fontSize: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, "\uD83D\uDE00"), /*#__PURE__*/
                React.createElement("button", { onClick: () => fileInputRef.current?.click(), disabled: uploadingImg, style: { width: '36px', height: '36px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: uploadingImg ? 0.5 : 1 } }, uploadingImg ? '⏳' : '🖼️'), /*#__PURE__*/
                React.createElement("button", { onClick: () => setShowRPModal(true), style: { width: '36px', height: '36px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', cursor: 'pointer', fontSize: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }, title: lang === 'ar' ? 'مغلف أحمر' : 'Red Packet' }, "\uD83E\uDDE7"), /*#__PURE__*/
                React.createElement("input", {
                  ref: inputRef, value: msgText, onChange: (e) => setMsgText(e.target.value), onKeyDown: (e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMsg()),
                  style: { flex: 1, padding: '9px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', outline: 'none', minWidth: 0 },
                  placeholder: lang === 'ar' ? 'اكتب رسالة للعموم...' : 'Write a public message...'
                }), /*#__PURE__*/
                React.createElement("button", { onClick: sendMsg, disabled: !msgText.trim() || sending, style: { width: '38px', height: '38px', borderRadius: '12px', border: 'none', cursor: 'pointer', flexShrink: 0, background: msgText.trim() ? 'linear-gradient(135deg,#7000ff,#00f2ff)' : 'rgba(255,255,255,0.06)', color: msgText.trim() ? 'white' : '#6b7280', fontSize: '16px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, "\u27A4")
              ) : /*#__PURE__*/

              React.createElement("div", { style: { padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center', color: '#6b7280', fontSize: '12px', flexShrink: 0 } }, "\uD83D\uDD10 ",
                lang === 'ar' ? 'سجّل دخول للكتابة' : 'Login to chat'
              )

          ),


          showReportModal && /*#__PURE__*/
          React.createElement("div", {
            style: {
              position: 'fixed', inset: 0, zIndex: Z.MODAL_HIGH + 20,
              background: 'rgba(0,0,0,0.88)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '16px'
            }, onClick: () => setShowReportModal(false)
          }, /*#__PURE__*/
            React.createElement("div", {
              style: {
                background: 'linear-gradient(160deg,#0d0d1f,#0a0a18)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '20px', padding: '24px',
                maxWidth: '340px', width: '100%',
                boxShadow: '0 24px 60px rgba(0,0,0,0.9)'
              }, onClick: (e) => e.stopPropagation()
            }, /*#__PURE__*/

              React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' } }, /*#__PURE__*/
                React.createElement("span", { style: { fontSize: '22px' } }, alreadyReported ? '🕵️' : '🚨'), /*#__PURE__*/
                React.createElement("div", { style: { flex: 1 } }, /*#__PURE__*/
                  React.createElement("div", { style: { fontSize: '14px', fontWeight: 900, color: alreadyReported ? '#9ca3af' : '#f87171' } },
                    alreadyReported ? lang === 'ar' ? 'بلاغ مكرر' : 'Duplicate Report' :
                      lang === 'ar' ? 'إبلاغ عن محتوى' : 'Report Content'
                  ), /*#__PURE__*/
                  React.createElement("div", { style: { fontSize: '11px', color: '#6b7280' } }, selectedMsg?.senderName)
                ), /*#__PURE__*/
                React.createElement("button", {
                  onClick: () => setShowReportModal(false),
                  style: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '16px' }
                }, "\u2715")
              ),

              alreadyReported ? /*#__PURE__*/
                React.createElement("div", { style: { textAlign: 'center', padding: '10px 0' } }, /*#__PURE__*/
                  React.createElement("div", { style: { fontSize: '12px', color: '#9ca3af', marginBottom: '20px', lineHeight: 1.6 } },
                    lang === 'ar' ?
                      'لقد قمت بالإبلاغ عن هذا المحتوى مسبقاً. الفريق يراجع طلبك بالفعل.' :
                      'You have already reported this content. The team is currently reviewing your request.'
                  ), /*#__PURE__*/
                  React.createElement("button", {
                    onClick: () => setShowReportModal(false),
                    style: { width: '100%', padding: '12px', background: 'linear-gradient(135deg,rgba(0,242,255,0.2),rgba(112,0,255,0.2))', border: '1px solid rgba(0,242,255,0.3)', borderRadius: '12px', color: '#00f2ff', fontWeight: 800, cursor: 'pointer' }
                  },
                    lang === 'ar' ? 'حسناً' : 'Got it'
                  )
                ) :

                isCheckingReport ? /*#__PURE__*/
                  React.createElement("div", { style: { textAlign: 'center', padding: '30px 0' } }, /*#__PURE__*/
                    React.createElement("div", { style: { width: '30px', height: '30px', border: '3px solid rgba(0,242,255,0.1)', borderTop: '3px solid #00f2ff', borderRadius: '50%', margin: '0 auto 15px', animation: 'mp-spin 1s linear infinite' } }), /*#__PURE__*/
                    React.createElement("div", { style: { fontSize: '13px', color: '#9ca3af' } }, lang === 'ar' ? 'جاري التحقق...' : 'Checking...'), /*#__PURE__*/
                    React.createElement("style", null, `
          @keyframes mp-spin { to { transform: rotate(360deg); } }
        `)
                  ) : /*#__PURE__*/

                  React.createElement(React.Fragment, null, /*#__PURE__*/
                    React.createElement("div", { style: { fontSize: '12px', color: '#9ca3af', marginBottom: '10px' } },
                      lang === 'ar' ? 'حدد سبب الإبلاغ:' : 'Select reason for report:'
                    ),
                    [
                      { en: 'Harassment / Bullying', ar: 'مضايقة / تنمر' },
                      { en: 'Inappropriate content', ar: 'محتوى غير لائق' },
                      { en: 'Spam / Advertising', ar: 'سبام / إعلانات' },
                      { en: 'Other', ar: 'أخرى' }].
                      map((r) => /*#__PURE__*/
                        React.createElement("button", {
                          key: r.en, onClick: () => setReportReason(lang === 'ar' ? r.ar : r.en),
                          style: {
                            width: '100%', padding: '10px 13px', marginBottom: '6px', borderRadius: '10px',
                            background: reportReason === (lang === 'ar' ? r.ar : r.en) ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                            border: reportReason === (lang === 'ar' ? r.ar : r.en) ? '1px solid rgba(239,68,68,0.45)' : '1px solid rgba(255,255,255,0.08)',
                            color: reportReason === (lang === 'ar' ? r.ar : r.en) ? '#f87171' : '#d1d5db',
                            fontSize: '12px', fontWeight: 600, cursor: 'pointer', textAlign: 'left'
                          }
                        },
                          lang === 'ar' ? r.ar : r.en
                        )
                      ), /*#__PURE__*/
                    React.createElement("div", { style: { display: 'flex', gap: '8px', marginTop: '15px' } }, /*#__PURE__*/
                      React.createElement("button", {
                        onClick: () => setShowReportModal(false),
                        style: { flex: 1, padding: '11px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }
                      },
                        lang === 'ar' ? 'إلغاء' : 'Cancel'
                      ), /*#__PURE__*/
                      React.createElement("button", {
                        onClick: handleSubmitReport, disabled: !reportReason || submittingReport,
                        style: { flex: 1.5, padding: '11px', borderRadius: '10px', background: reportReason ? 'linear-gradient(135deg,#dc2626,#991b1b)' : 'rgba(255,255,255,0.03)', border: 'none', color: reportReason ? 'white' : '#374151', fontSize: '13px', fontWeight: 800, cursor: reportReason ? 'pointer' : 'not-allowed', opacity: submittingReport ? 0.7 : 1 }
                      },
                        submittingReport ? '⏳' : lang === 'ar' ? 'إرسال' : 'Submit'
                      )
                    )
                  )
            )
          )
        )
      )
    );

  };

  window.PublicChatModal = PublicChatModal;
})();