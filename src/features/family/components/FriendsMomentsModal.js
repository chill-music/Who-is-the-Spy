var FriendsMomentsModal = ({ show, onClose, currentUser, currentUserData, currentUID, friendsData, lang, onOpenProfile }) => {
  // Late-binding: قراءة الـ globals داخل الكومبوننت لضمان توفرها
  var { momentsCollection, notificationsCollection, reportsCollection, botChatsCollection, TS, firebase, Z, PortalModal } = window;

  var [moments, setMoments] = React.useState([]);
  var [loading, setLoading] = React.useState(true);
  var [selectedMoment, setSelectedMoment] = React.useState(null);
  var [commentText, setCommentText] = React.useState('');
  var [comments, setComments] = React.useState([]);
  var [submittingComment, setSubmittingComment] = React.useState(false);
  var [likingId, setLikingId] = React.useState(null);
  var [showBell, setShowBell] = React.useState(false);
  var [bellNotifs, setBellNotifs] = React.useState([]);
  var [showCreatePost, setShowCreatePost] = React.useState(false);
  var [createText, setCreateText] = React.useState('');
  var [createImage, setCreateImage] = React.useState(null);
  var [createImageFile, setCreateImageFile] = React.useState(null);
  var [creating, setCreating] = React.useState(false);
  var fileRef = React.useRef(null);

  // Reporting state
  var [showReportModal, setShowReportModal] = React.useState(false);
  var [reportType, setReportType] = React.useState('moment'); // 'moment' or 'comment'
  var [reportTarget, setReportTarget] = React.useState(null); // the moment or comment object
  var [reportReason, setReportReason] = React.useState('');
  var [reportSending, setReportSending] = React.useState(false);
  var [isCheckingReport, setIsCheckingReport] = React.useState(false);
  var [alreadyReported, setAlreadyReported] = React.useState(false);

  var REASONS = [
    { key: 'language', icon: '🔇', ar: 'ألفاظ مسيئة', en: 'Inappropriate Language' },
    { key: 'content', icon: '🔞', ar: 'محتوى غير لائق / صورة مخلة', en: 'Inappropriate Content' },
    { key: 'spam', icon: '📢', ar: 'سبام', en: 'Spam' },
    { key: 'harassment', icon: '🤝', ar: 'مضايقات', en: 'Harassment' },
    { key: 'other', icon: '❓', ar: 'سبب آخر', en: 'Other' }
  ];

  React.useEffect(() => {
    if (!show || !currentUID) return;
    setLoading(true);
    // Unified Feed: Include current user's UID in the list of authors to fetch
    var friendUIDs = (friendsData || []).map((f) => f.id || f.uid).filter(Boolean);
    var allUIDs = [...new Set([...friendUIDs, currentUID])].filter(Boolean);

    if (allUIDs.length === 0) { setMoments([]); setLoading(false); return; }

    var chunks = [];
    for (var i = 0; i < allUIDs.length; i += 10) chunks.push(allUIDs.slice(i, i + 10));

    Promise.all(chunks.map((chunk) =>
      momentsCollection.where('authorUID', 'in', chunk).limit(30).get().
        catch(() => ({ docs: [] }))
    )).then((results) => {
      var all = [];
      results.forEach((snap) => snap.docs && snap.docs.forEach((d) => {
        var data = d.data();
        all.push({ id: d.id, ...data });
      }));

      // Consistent sorting (Descending by createdAt)
      all.sort((a, b) => {
        var aT = a.createdAt?.toMillis?.() || (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        var bT = b.createdAt?.toMillis?.() || (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return bT - aT;
      });

      setMoments(all.slice(0, 60));
      setLoading(false);
    }).catch(() => { setMoments([]); setLoading(false); });
  }, [show, currentUID, JSON.stringify((friendsData || []).map((f) => f.id || f.uid).filter(Boolean).sort())]);

  // Real-time update for selected moment + Comments subcollection
  React.useEffect(() => {
    if (!selectedMoment?.id) {
      setComments([]);
      return;
    }

    // 1. Listen to the moment doc itself for likes/counts
    var unsubDoc = momentsCollection.doc(selectedMoment.id).onSnapshot((snap) => {
      if (snap.exists) {
        var updated = { id: snap.id, ...snap.data() };
        setSelectedMoment(updated);
        setMoments((prev) => prev.map((m) => m.id === updated.id ? updated : m));
      }
    }, () => { });

    // 2. Listen to the comments subcollection (New Schema)
    var unsubComments = momentsCollection.doc(selectedMoment.id).
      collection('comments').
      orderBy('createdAt', 'desc').
      onSnapshot((snap) => {
        setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }, (err) => console.error('Comments listener error:', err));

    return () => {
      unsubDoc();
      unsubComments();
    };
  }, [selectedMoment?.id]);

  var handleLike = async (moment, e) => {
    e?.stopPropagation();
    if (!currentUID || likingId === moment.id) return;
    setLikingId(moment.id);

    try {
      // Updated schema: likedBy (array) and likesCount (number)
      var likedBy = moment.likedBy || [];
      var alreadyLiked = likedBy.includes(currentUID);

      var ref = momentsCollection.doc(moment.id);
      await ref.update({
        likesCount: firebase.firestore.FieldValue.increment(alreadyLiked ? -1 : 1),
        likedBy: alreadyLiked ?
          firebase.firestore.FieldValue.arrayRemove(currentUID) :
          firebase.firestore.FieldValue.arrayUnion(currentUID)
      });

      // Local state update for immediate UI feedback
      var updatedLikedBy = alreadyLiked ? likedBy.filter((id) => id !== currentUID) : [...likedBy, currentUID];
      var updatedLikesCount = (moment.likesCount || 0) + (alreadyLiked ? -1 : 1);

      setMoments((prev) => prev.map((m) => m.id === moment.id ? {
        ...m,
        likedBy: updatedLikedBy,
        likesCount: updatedLikesCount
      } : m));

      if (selectedMoment?.id === moment.id) {
        setSelectedMoment((prev) => ({
          ...prev,
          likedBy: updatedLikedBy,
          likesCount: updatedLikesCount
        }));
      }
    } catch (e) {
      console.error('Like error:', e);
    }
    setLikingId(null);
  };

  var handleComment = async () => {
    if (!commentText.trim() || !selectedMoment?.id || !currentUID || submittingComment) return;
    setSubmittingComment(true);
    try {
      var momentRef = momentsCollection.doc(selectedMoment.id);

      // 1. Add to subcollection (New Schema)
      await momentRef.collection('comments').add({
        authorUID: currentUID,
        authorName: currentUserData?.displayName || (lang === 'ar' ? 'مستخدم' : 'User'),
        authorPhoto: currentUserData?.photoURL || null,
        content: commentText.trim(), // 'content' matches MomentsSystem.js
        createdAt: TS()
      });

      // 2. Increment count on main doc
      await momentRef.update({
        commentsCount: firebase.firestore.FieldValue.increment(1)
      });

      setCommentText('');
    } catch (e) {
      console.error('Comment error:', e);
    }
    setSubmittingComment(false);
  };

  var handleReportMoment = async (moment, reason) => {
    if (!currentUID || moment.authorUID === currentUID || !reason) return;
    setReportSending(true);
    try {
      var reportRef = await reportsCollection.add({
        type: 'moment',
        momentId: moment.id,
        contentPreview: moment.content?.slice(0, 100),
        reportedUID: moment.authorUID,
        reportedName: moment.authorName,
        reporterUID: currentUID,
        reporterName: (currentUserData && currentUserData.displayName) || 'User',
        reason: reason,
        status: 'pending',
        resolved: false,
        originLabelAr: 'لحظات الأصدقاء',
        originLabelEn: 'Friends Moments',
        createdAt: TS()
      });

      if (typeof botChatsCollection !== 'undefined') {
        var reasonText = REASONS.find(r => r.key === reason)?.[lang] || reason;
        await botChatsCollection.add({
          botId: 'detective_bot',
          toUserId: currentUID,
          type: 'report_received',
          message: lang === 'ar' ?
            `🕵️ تم استلام بلاغك بنجاح ضد لحظة "${moment.authorName}".\nالسبب: ${reasonText}\nسيتم مراجعته من قِبل الفريق. انتظر الرد هنا.` :
            `🕵️ Your report against "${moment.authorName}" moment was received successfully.\nReason: ${reasonText}\nOur team will review it. Watch for a response here.`,
          fromName: null,
          fromPhoto: null,
          reportId: reportRef.id,
          timestamp: TS(),
          read: false
        });
      }
      if (window.onNotification) window.onNotification(lang === 'ar' ? '✅ تم إرسال البلاغ' : '✅ Report sent');
      setShowReportModal(false);
      setReportReason('');
    } catch (e) {
      console.error('Report error:', e);
    } finally {
      setReportSending(false);
    }
  };

  var handleReportComment = async (comment, reason) => {
    if (!currentUID || comment.authorUID === currentUID || !reason) return;
    setReportSending(true);
    try {
      var reportRef = await reportsCollection.add({
        type: 'moment_comment',
        momentId: selectedMoment.id,
        commentId: comment.id,
        contentPreview: comment.content?.slice(0, 100),
        reportedUID: comment.authorUID,
        reportedName: comment.authorName,
        reporterUID: currentUID,
        reporterName: (currentUserData && currentUserData.displayName) || 'User',
        reason: reason,
        status: 'pending',
        resolved: false,
        originLabelAr: 'تعليق في اللحظات',
        originLabelEn: 'Comment in Moments',
        createdAt: TS()
      });

      if (typeof botChatsCollection !== 'undefined') {
        var reasonText = REASONS.find(r => r.key === reason)?.[lang] || reason;
        await botChatsCollection.add({
          botId: 'detective_bot',
          toUserId: currentUID,
          type: 'report_received',
          message: lang === 'ar' ?
            `🕵️ تم استلام بلاغك بنجاح ضد تعليق "${comment.authorName}".\nالسبب: ${reasonText}\nسيتم مراجعته من قِبل الفريق. انتظر الرد هنا.` :
            `🕵️ Your report against "${comment.authorName}" comment was received successfully.\nReason: ${reasonText}\nOur team will review it. Watch for a response here.`,
          fromName: null,
          fromPhoto: null,
          reportId: reportRef.id,
          timestamp: TS(),
          read: false
        });
      }
      if (window.onNotification) window.onNotification(lang === 'ar' ? '✅ تم إرسال البلاغ' : '✅ Report sent');
      setShowReportModal(false);
      setReportReason('');
    } catch (e) {
      console.error('Report error:', e);
    } finally {
      setReportSending(false);
    }
  };

  var openReportModal = async (type, target, e) => {
    e?.stopPropagation();
    if (!currentUID || !target?.id) return;

    // 1. Open instantly for 100% responsiveness
    setReportType(type);
    setReportTarget(target);
    setShowReportModal(true);

    // 2. Reset states
    setAlreadyReported(false);
    setReportReason('');
    setIsCheckingReport(true);

    try {
      // 3. Simple query that doesn't need composite indexes
      var snap = await reportsCollection
        .where('reporterUID', '==', currentUID)
        .where('resolved', '==', false)
        .get();

      // 4. Local filter for scalability and robustness
      var checkField = type === 'moment' ? 'momentId' : 'commentId';
      var isDuplicate = snap.docs.some(doc => doc.data()[checkField] === target.id);

      if (isDuplicate) {
        setAlreadyReported(true);
      }
    } catch (e) {
      console.error('Check report error:', e);
      // Fallback: If check fails, we allow them to see the report UI 
      // rather than showing a 'already reported' screen incorrectly.
    } finally {
      setIsCheckingReport(false);
    }
  };

  var fmtMomentTime = (ts) => {
    if (!ts) return '';
    var d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
    var diff = Date.now() - d.getTime();
    if (diff < 60000) return lang === 'ar' ? 'الآن' : 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}${lang === 'ar' ? 'د' : 'm'}`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}${lang === 'ar' ? 'س' : 'h'}`;
    return `${Math.floor(diff / 86400000)}${lang === 'ar' ? 'ي' : 'd'}`;
  };

  // Load bell notifications (moment likes/comments for current user)
  React.useEffect(() => {
    if (!show || !currentUID || !showBell) return;
    notificationsCollection.
      where('recipientUID', '==', currentUID).
      where('type', 'in', ['moment_like', 'moment_comment']).
      orderBy('createdAt', 'desc').
      limit(20).
      get().
      then((snap) => setBellNotifs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))).
      catch(() => { });
  }, [show, currentUID, showBell]);

  var handleCreateMoment = async () => {
    if (creating || !createText.trim() && !createImageFile) return;
    setCreating(true);
    try {
      var mediaUrl = null;
      if (createImageFile) {
        // No longer using Firebase Storage to avoid Blaze plan/CORS.
        // We save the compressed base64 directly to mediaUrl.
        mediaUrl = createImage;
      }

      await momentsCollection.add({
        authorUID: currentUID,
        authorName: currentUserData?.displayName || (lang === 'ar' ? 'مستخدم' : 'User'),
        authorPhoto: currentUserData?.photoURL || null,
        authorVipLevel: window.getVIPLevel ? window.getVIPLevel(currentUserData) : (currentUserData?.vipLevel || 0),
        type: mediaUrl ? 'image' : 'text',
        content: createText.trim(),
        mediaUrl: mediaUrl || null,
        likedBy: [],
        likesCount: 0,
        commentsCount: 0,
        createdAt: TS()
      });

      setCreateText('');
      setCreateImage(null);
      setCreateImageFile(null);
      setShowCreatePost(false);
    } catch (e) {
      console.error('Create moment error:', e);
    }
    setCreating(false);
  };

  if (!show) return null;

  var authorInfo = selectedMoment ? ((selectedMoment.authorUID === currentUID) ? currentUserData : (friendsData || []).find(f => (f.id || f.uid) === selectedMoment.authorUID)) : null;

  return (/*#__PURE__*/
    React.createElement(PortalModal, null, /*#__PURE__*/
      React.createElement("div", { className: "modal-overlay", onClick: onClose, style: { zIndex: Z.MODAL_HIGH } }, /*#__PURE__*/
        React.createElement("div", {
          className: "animate-pop", onClick: (e) => e.stopPropagation(), style: {
            background: 'linear-gradient(180deg,#0f0f1e,#0a0a14)', border: '1px solid rgba(0,242,255,0.2)',
            borderRadius: '18px', width: '100%', maxWidth: '440px', maxHeight: '90vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.9)'
          }
        }, /*#__PURE__*/
          React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' } }, /*#__PURE__*/
            React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, /*#__PURE__*/
              React.createElement("span", { style: { fontSize: '18px' } }, "\uD83D\uDCF8"), /*#__PURE__*/
              React.createElement("div", null, /*#__PURE__*/
                React.createElement("div", { style: { fontSize: '14px', fontWeight: 800, color: 'white' } }, lang === 'ar' ? 'مومنت الأصدقاء' : 'Friends Moments'), /*#__PURE__*/
                React.createElement("div", { style: { fontSize: '10px', color: '#6b7280' } }, moments.length, " ", lang === 'ar' ? 'لحظة' : 'moments')
              )
            ), /*#__PURE__*/
            React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } },

              currentUID && /*#__PURE__*/
              React.createElement("div", { style: { position: 'relative' } }, /*#__PURE__*/
                React.createElement("button", {
                  onClick: () => setShowBell((v) => !v),
                  style: { width: '30px', height: '30px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: showBell ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)', color: bellNotifs.some((n) => !n.read) ? '#fbbf24' : '#6b7280', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                },
                  "\uD83D\uDD14"),
                bellNotifs.some((n) => !n.read) && /*#__PURE__*/
                React.createElement("div", { style: { position: 'absolute', top: '-3px', right: '-3px', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', border: '1.5px solid #0f0f1e' } })

              ),


              currentUID && currentUser && !currentUser.isGuest && /*#__PURE__*/
              React.createElement("button", {
                onClick: () => setShowCreatePost((v) => !v),
                style: { width: '30px', height: '30px', borderRadius: '8px', border: '1px solid rgba(0,242,255,0.3)', background: showCreatePost ? 'rgba(0,242,255,0.15)' : 'rgba(0,242,255,0.07)', color: '#00f2ff', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
              },
                "\uD83D\uDCF7"), /*#__PURE__*/

              React.createElement("input", {
                type: "file", ref: fileRef, accept: "image/*", style: { display: 'none' }, onChange: (e) => {
                  var f = e.target.files[0];
                  if (!f) return;

                  // Add image compression matching MomentsSystem.js
                  var reader = new FileReader();
                  reader.onload = (ev) => {
                    var img = new Image();
                    img.onload = () => {
                      var canvas = document.createElement('canvas');
                      var MAX_W = 800, MAX_H = 800;
                      var w = img.width, h = img.height;
                      if (w > MAX_W || h > MAX_H) {
                        var ratio = Math.min(MAX_W / w, MAX_H / h);
                        w = Math.round(w * ratio);
                        h = Math.round(h * ratio);
                      }
                      canvas.width = w; canvas.height = h;
                      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                      var compressed = canvas.toDataURL('image/jpeg', 0.6);
                      setCreateImage(compressed);
                      setCreateImageFile(f);
                    };
                    img.src = ev.target.result;
                  };
                  reader.readAsDataURL(f);
                }
              }), /*#__PURE__*/
              React.createElement("button", { onClick: onClose, style: { background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '8px', color: '#9ca3af', fontSize: '16px', width: '30px', height: '30px', cursor: 'pointer' } }, "\u2715")
            )
          ),


          showBell && /*#__PURE__*/
          React.createElement("div", { style: { padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.35)', maxHeight: '180px', overflowY: 'auto' } }, /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '10px', fontWeight: 800, color: '#fbbf24', marginBottom: '6px' } }, "\uD83D\uDD14 ", lang === 'ar' ? 'إشعارات اللحظات' : 'Moments Alerts'),
            bellNotifs.length === 0 ? /*#__PURE__*/
              React.createElement("div", { style: { fontSize: '10px', color: '#4b5563', textAlign: 'center', padding: '6px 0' } }, lang === 'ar' ? 'لا إشعارات' : 'No alerts yet') :
              bellNotifs.map((n) => /*#__PURE__*/
                React.createElement("div", { key: n.id, style: { display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' } },
                  n.senderPhoto ? /*#__PURE__*/
                    React.createElement("img", { src: n.senderPhoto, alt: "", style: { width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' } }) : /*#__PURE__*/
                    React.createElement("div", { style: { width: '22px', height: '22px', borderRadius: '50%', background: '#374151', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, "\uD83D\uDC64"), /*#__PURE__*/

                  React.createElement("div", { style: { flex: 1, fontSize: '10px', color: n.read ? '#6b7280' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, /*#__PURE__*/
                    React.createElement("span", { style: { fontWeight: 700, color: '#00f2ff' } }, n.senderName),
                    ' ', n.type === 'moment_like' ? lang === 'ar' ? 'أعجب بلحظتك' : 'liked your moment' : lang === 'ar' ? 'علّق على لحظتك' : 'commented on your moment'
                  ),
                  !n.read && /*#__PURE__*/React.createElement("div", { style: { width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 } })
                )
              )

          ),



          showCreatePost && currentUID && /*#__PURE__*/
          React.createElement("div", { style: { padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,242,255,0.04)' } }, /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '11px', fontWeight: 700, color: '#00f2ff', marginBottom: '8px' } },
              lang === 'ar' ? '📷 أضف لحظة جديدة' : '📷 Add a New Moment'
            ),
            createImage && /*#__PURE__*/
            React.createElement("div", { style: { marginBottom: '8px', position: 'relative', display: 'inline-block' } }, /*#__PURE__*/
              React.createElement("img", { src: createImage, alt: "", style: { height: '80px', borderRadius: '8px', objectFit: 'cover' } }), /*#__PURE__*/
              React.createElement("button", {
                onClick: () => { setCreateImage(null); setCreateImageFile(null); },
                style: { position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
              }, "\u2715")
            ), /*#__PURE__*/

            React.createElement("div", { style: { display: 'flex', gap: '6px' } }, /*#__PURE__*/
              React.createElement("input", {
                value: createText, onChange: (e) => setCreateText(e.target.value),
                placeholder: lang === 'ar' ? 'اكتب شيئاً...' : 'Write something...',
                style: { flex: 1, padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '12px', outline: 'none', direction: lang === 'ar' ? 'rtl' : 'ltr' }
              }
              ), /*#__PURE__*/
              React.createElement("button", { onClick: () => fileRef.current?.click(), style: { width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(0,242,255,0.3)', background: 'rgba(0,242,255,0.08)', color: '#00f2ff', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, "\uD83D\uDDBC\uFE0F"), /*#__PURE__*/
              React.createElement("button", {
                onClick: handleCreateMoment, disabled: creating || !createText.trim() && !createImageFile,
                style: { width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: creating || !createText.trim() && !createImageFile ? 'rgba(255,255,255,0.07)' : 'linear-gradient(135deg,#7000ff,#00f2ff)', color: 'white', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
              },
                creating ? '⏳' : '➤'
              )
            )
          ), /*#__PURE__*/

          React.createElement("div", { style: { flex: 1, overflowY: 'auto', padding: '12px' } },
            loading ? /*#__PURE__*/React.createElement("div", { style: { textAlign: 'center', padding: '40px', color: '#6b7280' } }, "\u23F3") :
              moments.length === 0 ? /*#__PURE__*/
                React.createElement("div", { style: { textAlign: 'center', padding: '40px' } }, /*#__PURE__*/
                  React.createElement("div", { style: { fontSize: '40px', marginBottom: '12px' } }, "\uD83D\uDCED"), /*#__PURE__*/
                  React.createElement("div", { style: { fontSize: '13px', color: '#6b7280' } }, lang === 'ar' ? 'لا مومنتات من أصدقائك بعد' : 'No moments from friends yet'), /*#__PURE__*/
                  React.createElement("div", { style: { fontSize: '11px', color: '#4b5563', marginTop: '6px' } }, lang === 'ar' ? 'أضف أصدقاء لتشاهد لحظاتهم' : 'Add friends to see their moments')
                ) : /*#__PURE__*/

                React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
                  moments.map((moment) => {
                    var likedBy = moment.likedBy || [];
                    var isLiked = likedBy.includes(currentUID);
                    var commentsCount = moment.commentsCount || 0;

                    // 👑 VIP Logic Layer (Prioritize current status & Real Name for consistency)
                    var authorInfo = (moment.authorUID === currentUID) ? currentUserData : (friendsData || []).find(f => (f.id || f.uid) === moment.authorUID);
                    var currentLevel = window.getVIPLevel ? window.getVIPLevel(authorInfo) : (authorInfo?.vipLevel || 0);
                    var vipLevel = (authorInfo && currentLevel !== undefined) ? currentLevel : (moment.authorVipLevel || 0);
                    var vipBgUrl = (window.VIP_MOMENT_BG_URLS && window.VIP_MOMENT_BG_URLS[vipLevel]) || null;
                    var hasVipBg = vipBgUrl && vipBgUrl.trim() !== '';

                    return (/*#__PURE__*/
                      React.createElement("div", {
                        key: moment.id,
                        style: {
                          background: hasVipBg ? `url(${vipBgUrl}) center/cover no-repeat` : 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '14px',
                          overflow: 'hidden',
                          position: 'relative'
                        }
                      },
                        // Dark overlay for VIP backgrounds
                        hasVipBg && React.createElement("div", { style: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 0 } }),

                        React.createElement("div", {
                          onClick: () => onOpenProfile && onOpenProfile(moment.authorUID),
                          style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px 8px', position: 'relative', zIndex: 1, cursor: 'pointer' }
                        }, /*#__PURE__*/
                          React.createElement("div", { style: { width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.1)' } },
                            moment.authorPhoto ? /*#__PURE__*/React.createElement("img", { src: moment.authorPhoto, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/React.createElement("div", { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' } }, "\uD83D\uDE0E")
                          ), /*#__PURE__*/
                          React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
                            React.createElement("div", { style: { fontSize: '12px', fontWeight: 700, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 1px 3px rgba(0,0,0,0.8)' } },
                              window.VIPName ? React.createElement(window.VIPName, {
                                userData: authorInfo || { uid: moment.authorUID, displayName: moment.authorName, vipLevel: vipLevel },
                                displayName: authorInfo?.displayName || authorInfo?.name || moment.authorName,
                                lang: lang,
                                style: { fontSize: '12px', fontWeight: 700 }
                              }) : (authorInfo?.displayName || authorInfo?.name || moment.authorName)
                            ), /*#__PURE__*/
                            React.createElement("div", { style: { fontSize: '10px', color: '#6b7280' } }, fmtMomentTime(moment.createdAt))
                          ),
                          React.createElement("div", { style: { display: 'flex', gap: '4px' } },
                            moment.authorUID !== currentUID && /*#__PURE__*/React.createElement("button", {
                              onClick: (e) => openReportModal('moment', moment, e),
                              disabled: isCheckingReport,
                              title: lang === 'ar' ? 'إبلاغ' : 'Report',
                              style: { background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '6px', padding: '3px 6px', color: '#ef4444', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: isCheckingReport ? 0.5 : 1 }
                            }, isCheckingReport ? '⏳' : "\uD83D\uDEA9"),

                            onOpenProfile && /*#__PURE__*/React.createElement("button", { onClick: (e) => { e.stopPropagation(); onOpenProfile(moment.authorUID); }, style: { background: 'rgba(0,242,255,0.1)', border: '1px solid rgba(0,242,255,0.2)', borderRadius: '6px', padding: '3px 8px', color: '#00f2ff', fontSize: '10px', cursor: 'pointer' } }, "\uD83D\uDC64")
                          )
                        ),

                        moment.type === 'image' && moment.mediaUrl && /*#__PURE__*/React.createElement("div", { style: { maxHeight: '260px', overflow: 'hidden', cursor: 'pointer', position: 'relative', zIndex: 1 }, onClick: () => setSelectedMoment(moment) }, /*#__PURE__*/React.createElement("img", { src: moment.mediaUrl, alt: "", style: { width: '100%', objectFit: 'cover', display: 'block' } })),

                        moment.content && /*#__PURE__*/React.createElement("div", { style: { padding: '8px 12px', fontSize: '12px', color: '#d1d5db', lineHeight: 1.5, cursor: 'pointer', position: 'relative', zIndex: 1 }, onClick: () => setSelectedMoment(moment) }, moment.content), /*#__PURE__*/

                        React.createElement("div", { style: { padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 } }, /*#__PURE__*/
                          React.createElement("button", { onClick: (e) => handleLike(moment, e), style: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: isLiked ? '#f87171' : '#6b7280', fontSize: '12px', fontWeight: isLiked ? 700 : 400, padding: '3px 0', transition: 'color 0.2s' } },
                            isLiked ? '❤️' : '🤍', " ", /*#__PURE__*/React.createElement("span", null, moment.likesCount || 0)
                          ), /*#__PURE__*/
                          React.createElement("button", { onClick: () => setSelectedMoment(moment), style: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '12px', padding: '3px 0' } }, "\uD83D\uDCAC ", /*#__PURE__*/
                            React.createElement("span", null, commentsCount)
                          )
                        )
                      )
                    );

                  })
                )

          )
        ),
      ),

      showReportModal && /*#__PURE__*/
      React.createElement(PortalModal, null, /*#__PURE__*/
        React.createElement("div", { style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: Z.MODAL_HIGH + 30, padding: '16px' }, onClick: () => setShowReportModal(false) }, /*#__PURE__*/
          React.createElement("div", { style: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '20px', width: '100%', maxWidth: '300px', boxShadow: '0 15px 40px rgba(0,0,0,0.5)' }, onClick: (e) => e.stopPropagation() },

            alreadyReported ? /*#__PURE__*/
              React.createElement("div", { style: { textAlign: 'center' } },
                React.createElement("div", { style: { fontSize: '40px', marginBottom: '12px' } }, "🕵️"),
                React.createElement("div", { style: { fontSize: '15px', fontWeight: 800, color: 'white', marginBottom: '8px' } }, lang === 'ar' ? 'بلاغ مكرر' : 'Duplicate Report'),
                React.createElement("div", { style: { fontSize: '13px', color: '#9ca3af', lineHeight: 1.5, marginBottom: '20px' } },
                  lang === 'ar' ? 'لقد قمت بالإبلاغ عن هذا مسبقاً. الفريق يراجع طلبك بالفعل.' : 'You have already reported this. The team is currently reviewing your request.'
                ),
                React.createElement("button", { onClick: () => setShowReportModal(false), style: { width: '100%', padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg,#7000ff,#00f2ff)', border: 'none', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer' } }, lang === 'ar' ? 'حسناً' : 'Got it')
              ) :

              isCheckingReport ? /*#__PURE__*/
                React.createElement("div", { style: { textAlign: 'center', padding: '20px 0' } },
                  React.createElement("div", { className: "profile-loading-spinner", style: { margin: '0 auto 16px' } }),
                  React.createElement("div", { style: { fontSize: '13px', color: '#9ca3af' } }, lang === 'ar' ? 'جاري التحقق...' : 'Checking...'),
                  React.createElement("button", { onClick: () => setShowReportModal(false), style: { marginTop: '20px', background: 'none', border: 'none', color: '#6b7280', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' } }, lang === 'ar' ? 'إلغاء' : 'Cancel')
                ) : /*#__PURE__*/

                React.createElement(React.Fragment, null,
                  React.createElement("div", { style: { textAlign: 'center', marginBottom: '16px' } }, /*#__PURE__*/
                    React.createElement("div", { style: { fontSize: '24px', marginBottom: '8px' } }, "\uD83D\uDEA9"), /*#__PURE__*/
                    React.createElement("div", { style: { fontSize: '15px', fontWeight: 800, color: 'white' } }, lang === 'ar' ? `إبلاغ عن ${reportType === 'moment' ? 'لحظة' : 'تعليق'}` : `Report ${reportType === 'moment' ? 'Moment' : 'Comment'}`)
                  ), /*#__PURE__*/
                  React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' } },
                    REASONS.map((r) => /*#__PURE__*/
                      React.createElement("button", {
                        key: r.key,
                        onClick: () => setReportReason(r.key),
                        style: {
                          padding: '10px 14px', borderRadius: '10px', fontSize: '13px', background: reportReason === r.key ? 'rgba(0,242,255,0.15)' : 'rgba(255,255,255,0.04)',
                          border: reportReason === r.key ? '1px solid #00f2ff' : '1px solid rgba(255,255,255,0.1)', color: reportReason === r.key ? '#00f2ff' : 'white', cursor: 'pointer', textAlign: 'start', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
                        }
                      }, /*#__PURE__*/
                        React.createElement("span", null, r.icon), /*#__PURE__*/
                        React.createElement("span", null, lang === 'ar' ? r.ar : r.en)
                      )
                    )
                  ), /*#__PURE__*/
                  React.createElement("div", { style: { display: 'flex', gap: '8px' } }, /*#__PURE__*/
                    React.createElement("button", { onClick: () => setShowReportModal(false), style: { flex: 1, padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#9ca3af', fontSize: '13px', fontWeight: 700, cursor: 'pointer' } }, lang === 'ar' ? 'إلغاء' : 'Cancel'), /*#__PURE__*/
                    React.createElement("button", {
                      onClick: () => reportType === 'moment' ? handleReportMoment(reportTarget, reportReason) : handleReportComment(reportTarget, reportReason),
                      disabled: !reportReason || reportSending,
                      style: { flex: 1, padding: '10px', borderRadius: '10px', background: !reportReason ? 'rgba(239,68,68,0.1)' : '#ef4444', border: 'none', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: !reportReason || reportSending ? 0.5 : 1 }
                    }, reportSending ? '...' : lang === 'ar' ? 'إبلاغ' : 'Report')
                  )
                )
          )
        )
      ),

      selectedMoment && /*#__PURE__*/
      React.createElement("div", { className: "modal-overlay", onClick: () => { setSelectedMoment(null); setCommentText(''); }, style: { zIndex: Z.MODAL_HIGH + 1 } }, /*#__PURE__*/
        React.createElement("div", {
          className: "animate-pop", onClick: (e) => e.stopPropagation(), style: {
            background: 'linear-gradient(180deg,#0d0d1f,#08080f)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
            maxWidth: '420px', width: '95%', overflow: 'hidden', maxHeight: '88vh',
            display: 'flex', flexDirection: 'column', position: 'relative'
          }
        }, /*#__PURE__*/
          // 👑 VIP Background Resolver for Detail View
          (() => {
            var authorInfo = (selectedMoment.authorUID === currentUID) ? currentUserData : (friendsData || []).find(f => (f.id || f.uid) === selectedMoment.authorUID);
            var currentLevel = window.getVIPLevel ? window.getVIPLevel(authorInfo) : (authorInfo?.vipLevel || 0);
            var vipLevel = (authorInfo && currentLevel !== undefined) ? currentLevel : (selectedMoment.authorVipLevel || 0);
            var vipBgUrl = (window.VIP_MOMENT_BG_URLS && window.VIP_MOMENT_BG_URLS[vipLevel]) || null;
            if (vipBgUrl && vipBgUrl.trim() !== '') {
              return React.createElement(React.Fragment, null,
                React.createElement("div", { style: { position: 'absolute', inset: 0, background: `url(${vipBgUrl}) center/cover no-repeat`, zIndex: 0 } }),
                React.createElement("div", { style: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 0 } })
              );
            }
            return null;
          })(),

          React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, position: 'relative', zIndex: 1 } }, /*#__PURE__*/
            React.createElement("div", {
              onClick: () => onOpenProfile && onOpenProfile(selectedMoment.authorUID),
              style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }
            }, /*#__PURE__*/
              React.createElement("div", { style: { width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.1)' } },
                selectedMoment.authorPhoto ? /*#__PURE__*/React.createElement("img", { src: selectedMoment.authorPhoto, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/React.createElement("span", { style: { fontSize: '14px', lineHeight: '28px', display: 'block', textAlign: 'center' } }, "\uD83D\uDE0E")
              ), /*#__PURE__*/
              React.createElement("div", null, /*#__PURE__*/
                React.createElement("div", { style: { fontSize: '12px', fontWeight: 700, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.8)' } },
                  window.VIPName ? React.createElement(window.VIPName, {
                    userData: authorInfo || { uid: selectedMoment.authorUID, displayName: selectedMoment.authorName, vipLevel: selectedMoment.authorVipLevel || 0 },
                    displayName: authorInfo?.displayName || authorInfo?.name || selectedMoment.authorName,
                    lang: lang,
                    style: { fontSize: '12px', fontWeight: 700 }
                  }) : (authorInfo?.displayName || authorInfo?.name || selectedMoment.authorName)
                ), /*#__PURE__*/
                React.createElement("div", { style: { fontSize: '10px', color: '#9ca3af', textShadow: '0 1px 2px rgba(0,0,0,0.8)' } }, fmtMomentTime(selectedMoment.createdAt))
              )
            ), /*#__PURE__*/
            React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
              selectedMoment.authorUID !== currentUID && /*#__PURE__*/
              React.createElement("button", {
                onClick: (e) => openReportModal('moment', selectedMoment, e),
                disabled: isCheckingReport,
                title: lang === 'ar' ? 'إبلاغ' : 'Report',
                style: { background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isCheckingReport ? 0.5 : 1 }
              }, isCheckingReport ? '⏳' : "\uD83D\uDEA9"),

              React.createElement("button", { onClick: () => { setSelectedMoment(null); setCommentText(''); }, style: { background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' } }, "\u2715")
            )
          ), /*#__PURE__*/

          React.createElement("div", { style: { overflowY: 'auto', flex: 1, position: 'relative', zIndex: 1 } },
            selectedMoment.type === 'image' && selectedMoment.mediaUrl && /*#__PURE__*/React.createElement("img", { src: selectedMoment.mediaUrl, alt: "", style: { width: '100%', display: 'block' } }),
            selectedMoment.content && /*#__PURE__*/React.createElement("div", { style: { padding: '12px 14px', fontSize: '13px', color: '#e2e8f0', lineHeight: 1.6 } }, selectedMoment.content), /*#__PURE__*/

            React.createElement("div", { style: { padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' } }, /*#__PURE__*/
              React.createElement("button", { onClick: (e) => handleLike(selectedMoment, e), style: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: (selectedMoment.likedBy || []).includes(currentUID) ? '#f87171' : '#6b7280', fontSize: '13px', fontWeight: (selectedMoment.likedBy || []).includes(currentUID) ? 700 : 400, padding: '4px 0' } },
                (selectedMoment.likedBy || []).includes(currentUID) ? '❤️' : '🤍', " ", selectedMoment.likesCount || 0
              ), /*#__PURE__*/
              React.createElement("span", { style: { fontSize: '13px', color: '#6b7280' } }, "\uD83D\uDCAC ", selectedMoment.commentsCount || 0)
            ), /*#__PURE__*/

            React.createElement("div", { style: { padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '10px' } },
              comments.length === 0 && /*#__PURE__*/
              React.createElement("div", { style: { textAlign: 'center', padding: '24px', color: '#e2e8f0', fontSize: '12px', fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.5)' } }, lang === 'ar' ? 'لا تعليقات بعد' : 'No comments yet'),

              comments.map((c, i) => /*#__PURE__*/
                React.createElement("div", { key: c.id || i, style: { display: 'flex', gap: '8px', alignItems: 'flex-start' } }, /*#__PURE__*/
                  React.createElement("div", { style: { width: '26px', height: '26px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.08)' } },
                    c.authorPhoto ? /*#__PURE__*/React.createElement("img", { src: c.authorPhoto, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/React.createElement("span", { style: { fontSize: '12px', lineHeight: '26px', display: 'block', textAlign: 'center' } }, "\uD83D\uDE0E")
                  ), /*#__PURE__*/
                  React.createElement("div", { style: { flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '9px 12px', position: 'relative' } }, /*#__PURE__*/
                    React.createElement("div", { style: { fontSize: '11px', fontWeight: 700, color: '#a78bfa', marginBottom: '3px' } }, c.authorName), /*#__PURE__*/
                    React.createElement("div", { style: { fontSize: '13px', color: '#f8fafc', lineHeight: 1.5 } }, c.content),
                    c.authorUID !== currentUID && /*#__PURE__*/
                    React.createElement("div", {
                      onClick: (e) => openReportModal('comment', c, e),
                      style: { position: 'absolute', top: '7px', right: '10px', fontSize: '10px', color: '#ef4444', cursor: 'pointer', opacity: 0.6 },
                      title: lang === 'ar' ? 'إبلاغ' : 'Report'
                    }, "\uD83D\uDEA9")
                  )
                )
              )
            )
          ),

          currentUID && /*#__PURE__*/
          React.createElement("div", { style: { display: 'flex', gap: '8px', padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, background: 'rgba(0,0,0,0.3)', position: 'relative', zIndex: 1 } }, /*#__PURE__*/
            React.createElement("input", {
              value: commentText,
              onChange: (e) => setCommentText(e.target.value),
              onKeyDown: (e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleComment()),
              placeholder: lang === 'ar' ? 'اكتب تعليقاً...' : 'Write a comment...',
              style: { flex: 1, padding: '9px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '12px', outline: 'none' }
            }
            ), /*#__PURE__*/
            React.createElement("button", { onClick: handleComment, disabled: !commentText.trim() || submittingComment, style: { width: '36px', height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: commentText.trim() ? 'linear-gradient(135deg,#7000ff,#00f2ff)' : 'rgba(255,255,255,0.07)', color: commentText.trim() ? 'white' : '#4b5563', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              submittingComment ? '⏳' : '➤'
            )
          )
        )
      )
    )
  );

};

window.FriendsMomentsModal = FriendsMomentsModal;