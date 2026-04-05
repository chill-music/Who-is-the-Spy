(function () {
  var { useState, useEffect, useRef, useMemo, useCallback } = React;

  var ProfileV11 = ({
    show,
    onClose,
    targetUID,
    lang,
    currentUserUID,
    onSendFriendRequest,
    onSendGift,
    userData,
    currentUserFriends,
    currentUserFriendRequests,
    friendsData,
    isOwnProfileOverride = false,
    onOpenSettings,
    onOpenShop,
    onOpenInventory,
    onLogout,
    onLoginGoogle,
    isLoggedIn: isLoggedInProp,
    isGuest: isGuestProp,
    sessionClaimedToday,
    onOpenLoginRewards,
    currency: currencyProp,
    onOpenChat,
    onOpenProfile,
    currentViewerData, // logged-in viewer's user data (for couple gift sending)
    onOpenMarriage, // opens the marriage/wedding hall page
    onOpenFamily, // opens family modal (pass familyId to view any family)
    onOpenBFFModal, // opens BFF modal for own profile
    onOpenVIPCenter, // opens the VIP Center modal
    onNotification = () => {} // optional notification callback
  }) => {
    var t = TRANSLATIONS[lang] || {};

    var [targetData, setTargetData] = useState(null);
    var [loading, setLoading] = useState(true);
    var [showGiftModal, setShowGiftModal] = useState(false);
    var [requestSent, setRequestSent] = useState(false);
    var [showOptionsMenu, setShowOptionsMenu] = useState(false);
    var [isBlocked, setIsBlocked] = useState(false);
    var [blockedByTarget, setBlockedByTarget] = useState(false);
    var [showBlockConfirm, setShowBlockConfirm] = useState(false);
    var [gifts, setGifts] = useState([]);
    var [charismaRank, setCharismaRank] = useState(null);
    var [copiedId, setCopiedId] = useState(false);
    var [bannerURL, setBannerURL] = useState(null);
    var [bannerUploading, setBannerUploading] = useState(false);
    var bannerFileRef = useRef(null);
    var [showReportModal, setShowReportModal] = useState(false);
    var [reportReason, setReportReason] = useState('');
    var [reportDescription, setReportDescription] = useState('');
    var [reportImagePreview, setReportImagePreview] = useState(null); // base64
    var [reportSending, setReportSending] = useState(false);
    var [selfGift, setSelfGift] = useState(null);
    var [showSelfGiftModal, setShowSelfGiftModal] = useState(false);

    var [showBanModal, setShowBanModal] = useState(false);
    var [showRoleModal, setShowRoleModal] = useState(false);
    var [showRoleInfoPopup, setShowRoleInfoPopup] = useState(false);

    // 💍 Couple badge state
    var [profileCoupleDoc, setProfileCoupleDoc] = useState(null);
    var [profilePartnerData, setProfilePartnerData] = useState(null);
    var [showProfileCoupleCard, setShowProfileCoupleCard] = useState(false);

    // 🛡️ GUARD SYSTEM STATE
    var [guardData, setGuardData] = useState([]); // top guardians [{uid,name,photo,total}]
    var [showGuardModal, setShowGuardModal] = useState(false);
    var [guardGiven, setGuardGiven] = useState(false); // did viewer already give guard today?
    var [guardLockedUntil, setGuardLockedUntil] = useState(null); // timestamp of next unlock
    var guardCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('guard_log');

    var [activeTab, setActiveTab] = useState('about');
    var optionsRef = useRef(null);

    useEffect(() => {
      if (!show || !targetUID) {
        setLoading(false); // ← was setLoading(true) — caused permanent freeze when no targetUID
        return;
      }

      var isMounted = true;
      setLoading(true);
      setRequestSent(false);
      setShowOptionsMenu(false);

      // Safety timeout: never stay loading > 10 seconds
      var safetyTimer = setTimeout(() => {
        if (isMounted) {setLoading(false);}
      }, 10000);

      usersCollection.doc(targetUID).get().then((doc) => {
        if (!isMounted) return;
        clearTimeout(safetyTimer);
        if (doc.exists) {
          var data = doc.data();
          setTargetData({ id: doc.id, ...data, isGuest: false });
          setBannerURL(data.bannerURL || null);
          var theirBlockedUsers = data.blockedUsers || [];
          setBlockedByTarget(theirBlockedUsers.includes(currentUserUID));
          setLoading(false);
        } else {
          guestsCollection.doc(targetUID).get().then((guestDoc) => {
            if (!isMounted) return;
            if (guestDoc.exists) {
              setTargetData({ id: guestDoc.id, ...guestDoc.data(), isGuest: true });
            } else {
              setTargetData(null);
            }
            setLoading(false);
          }).catch((e) => {
            console.error('[PRO SPY ERROR] Guest fetch failed:', e);
            if (isMounted) {setTargetData(null);setLoading(false);}
          });
        }
      }).catch((e) => {
        console.error('[PRO SPY ERROR] User fetch failed:', e);
        if (isMounted) {setLoading(false);setTargetData(null);}
        clearTimeout(safetyTimer);
      });

      return () => {isMounted = false;clearTimeout(safetyTimer);};
    }, [show, targetUID, currentUserUID]);

    useEffect(() => {
      if (userData && targetUID) {
        var blocked = userData.blockedUsers || [];
        setIsBlocked(blocked.includes(targetUID));
      }
    }, [userData, targetUID]);

    // 💍 Real-time couple doc + real-time partner photo listener — MUTUAL (works for both uid1 and uid2)
    useEffect(() => {
      if (!show || !targetUID) {
        setProfileCoupleDoc(null);
        setProfilePartnerData(null);
        return;
      }
      var unsubPartner;
      var foundDoc = false; // track if we found a match from either query

      var attachPartnerListener = (partnerUID) => {
        if (unsubPartner) unsubPartner();
        unsubPartner = usersCollection.doc(partnerUID).
        onSnapshot((doc) => {
          if (doc.exists) setProfilePartnerData({ id: doc.id, ...doc.data() });
        }, (e) => console.error('[PRO SPY ERROR] Partner listener failed:', e));
      };

      // Query both directions simultaneously — first match wins
      var p1 = couplesCollection.
      where('uid1', '==', targetUID).where('status', '==', 'accepted').limit(1).
      get().catch((e) => { console.error('[PRO SPY ERROR] Couple P1 query failed:', e); return null; });

      var p2 = couplesCollection.
      where('uid2', '==', targetUID).where('status', '==', 'accepted').limit(1).
      get().catch((e) => { console.error('[PRO SPY ERROR] Couple P2 query failed:', e); return null; });

      Promise.all([p1, p2]).then(([snap1, snap2]) => {
        var snap = snap1 && !snap1.empty ? snap1 : snap2 && !snap2.empty ? snap2 : null;
        if (!snap || snap.empty) {
          setProfileCoupleDoc(null);
          setProfilePartnerData(null);
          return;
        }
        var d = { id: snap.docs[0].id, ...snap.docs[0].data() };
        setProfileCoupleDoc(d);
        foundDoc = true;
        // Partner is whichever uid is NOT the target
        var partnerUID = d.uid1 === targetUID ? d.uid2 : d.uid1;
        attachPartnerListener(partnerUID);
      });

      return () => {
        unsubPartner && unsubPartner();
      };
    }, [show, targetUID]);

    // Fetch gifts without orderBy to avoid Firebase index requirement
    useEffect(() => {
      if (!show || !targetUID) return;

      var unsub = giftsLogCollection.
      where('receiverId', '==', targetUID).
      limit(50).
      onSnapshot((snap) => {
        var giftData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort in memory instead of query
        giftData.sort((a, b) => {
          var timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds || 0;
          var timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds || 0;
          return timeB - timeA;
        });
        setGifts(giftData);
      }, (error) => {
        console.error("Error fetching gifts:", error);
      });

      return unsub;
    }, [show, targetUID]);

    useEffect(() => {
      var handleClickOutside = (e) => {
        if (optionsRef.current && !optionsRef.current.contains(e.target)) {
          setShowOptionsMenu(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calculate charisma rank - must be before early return
    useEffect(() => {
      if (!show || !targetUID || !targetData) return;
      // Optimized: limit to top 100 only, show rank only if user is in top 100
      usersCollection.orderBy('charisma', 'desc').limit(100).get().then((snap) => {
        var users = snap.docs.map((doc, idx) => ({ id: doc.id, rank: idx + 1 }));
        var userRank = users.find((u) => u.id === targetUID);
        setCharismaRank(userRank ? userRank.rank : '--');
      }).catch((e) => {
        console.error('[PRO SPY ERROR] Charisma rank fetch failed:', e);
        setCharismaRank('--');
      });
    }, [show, targetUID, targetData]);

    // 🛡️ Guard system — load top 100 guardians (ranked by charisma gifted to this user)
    useEffect(() => {
      if (!show || !targetUID) return;
      var unsub = guardCollection.
      where('receiverId', '==', targetUID).
      onSnapshot((snap) => {
        var logs = snap.docs.map((d) => d.data());
        // Aggregate charisma by senderId
        var map = {};
        logs.forEach((l) => {
          var sid = l.senderId;
          if (!sid) return;
          if (!map[sid]) map[sid] = { uid: sid, name: l.senderName || 'User', photo: l.senderPhoto || null, total: 0 };
          map[sid].total += l.amount || l.charisma || 0;
          if (l.senderName) map[sid].name = l.senderName;
          if (l.senderPhoto) map[sid].photo = l.senderPhoto;
        });
        // Sort descending, cap at 100
        var sorted = Object.values(map).sort((a, b) => b.total - a.total).slice(0, 100);
        setGuardData(sorted);
      }, (e) => console.error('[PRO SPY ERROR] Guard listener failed:', e));
      return () => unsub();
    }, [show, targetUID, currentUserUID]);

    // 🛡️ Check daily guard status from localStorage
    useEffect(() => {
      if (!show || !currentUserUID || !targetUID) return;
      var key = `guard_${currentUserUID}_${targetUID}`;
      var stored = localStorage.getItem(key);
      if (stored) {
        var { date } = JSON.parse(stored);
        var today = new Date().toDateString();
        if (date === today) {
          setGuardGiven(true);
          // Calculate unlock time (midnight)
          var now = new Date();
          var midnight = new Date(now);
          midnight.setDate(midnight.getDate() + 1);
          midnight.setHours(0, 0, 0, 0);
          setGuardLockedUntil(midnight);
        } else {
          setGuardGiven(false);
          setGuardLockedUntil(null);
        }
      } else {
        setGuardGiven(false);
        setGuardLockedUntil(null);
      }
    }, [show, currentUserUID, targetUID]);

    // 🛡️ Give Guard handler — friends only, once per day
    var handleGiveGuard = useCallback(async () => {
      if (!currentUserUID || !targetUID || guardGiven || !isLoggedInProp) return;
      // Only friends can give guard
      var isFriend = currentUserFriends?.includes(targetUID);
      if (!isFriend) return;
      var amount = 1;
      try {
        var viewerDoc = await usersCollection.doc(currentUserUID).get();
        if (viewerDoc.exists) {
          var vd = viewerDoc.data();
          var friends = vd.friends || [];
          var max = Math.min(friends.length, 70);
          amount = max > 0 ? Math.floor(Math.random() * max) + 1 : 1;
        }
      } catch (e) { console.error('[PRO SPY ERROR]', e); }
      try {
        await guardCollection.add({
          receiverId: targetUID,
          senderId: currentUserUID,
          senderName: userData?.displayName || 'User',
          senderPhoto: userData?.photoURL || null,
          amount,
          timestamp: TS()
        });
        // Save daily lock to localStorage
        var key = `guard_${currentUserUID}_${targetUID}`;
        localStorage.setItem(key, JSON.stringify({ date: new Date().toDateString() }));
        setGuardGiven(true);
        var midnight = new Date();
        midnight.setDate(midnight.getDate() + 1);
        midnight.setHours(0, 0, 0, 0);
        setGuardLockedUntil(midnight);
      } catch (e) { console.error('[PRO SPY ERROR]', e); }
    }, [currentUserUID, targetUID, guardGiven, isLoggedInProp, userData, currentUserFriends]);

    if (!show) return null;

    var isOwnProfile = isOwnProfileOverride || targetUID === currentUserUID;
    var isTargetGuest = targetData?.isGuest || targetData?.isAnonymous;
    var isGuestViewer = isGuestProp === true; // current user viewing is a guest
    var isAlreadyFriend = currentUserFriends?.includes(targetUID);
    var hasPendingRequest = currentUserFriendRequests?.includes(targetUID) || requestSent;

    var handleAddFriend = async () => {
      if (isAlreadyFriend || hasPendingRequest) return;
      await onSendFriendRequest(targetUID);
      setRequestSent(true);
    };

    var handleBlockUser = async () => {
      if (!userData || !targetUID) return;
      try {
        await usersCollection.doc(currentUserUID).update({
          blockedUsers: firebase.firestore.FieldValue.arrayUnion(targetUID)
        });
        setIsBlocked(true);
        setShowBlockConfirm(false);
        setShowOptionsMenu(false);
      } catch (error) {
        console.error("Block error:", error);
      }
    };

    var handleUnblockUser = async () => {
      if (!userData || !targetUID) return;
      try {
        await usersCollection.doc(currentUserUID).update({
          blockedUsers: firebase.firestore.FieldValue.arrayRemove(targetUID)
        });
        setIsBlocked(false);
        setShowOptionsMenu(false);
      } catch (error) {
        console.error("Unblock error:", error);
      }
    };

    var handleSendReport = async () => {
      if (!reportReason || !currentUserUID || !targetUID) return;
      setReportSending(true);
      try {
        var reporterSnap = await usersCollection.doc(currentUserUID).get();
        var reporterName = reporterSnap.exists ? reporterSnap.data()?.displayName || 'User' : 'User';
        var reportRef = await reportsCollection.add({
          reportedUID: targetUID,
          reportedName: targetData?.displayName || 'Unknown',
          reportedPhoto: targetData?.photoURL || '',
          reporterUID: currentUserUID,
          reporterName,
          reason: reportReason,
          description: reportDescription.trim(),
          imageBase64: reportImagePreview || null,
          timestamp: TS(),
          status: 'pending',
          type: 'user'
        });
        // Send detective bot message to reporter
        if (typeof botChatsCollection !== 'undefined') {
          await botChatsCollection.add({
            botId: 'detective_bot',
            toUserId: currentUserUID,
            type: 'report_received',
            message: lang === 'ar' ?
            `🕵️ تم استلام بلاغك بنجاح ضد "${targetData?.displayName || 'Unknown'}".\nالسبب: ${reportReason}\n\nسيتم مراجعته من قِبل الفريق. انتظر الرد هنا.` :
            `🕵️ Your report against "${targetData?.displayName || 'Unknown'}" was received successfully.\nReason: ${reportReason}\n\nOur team will review it. Watch for a response here.`,
            fromName: null,
            fromPhoto: null,
            reportId: reportRef.id,
            timestamp: TS(),
            read: false
          }).catch((e) => console.error('[PRO SPY ERROR] Detective bot report message failed:', e));
        }
        setShowReportModal(false);
        setReportReason('');
        setReportDescription('');
        setReportImagePreview(null);
        setShowOptionsMenu(false);
      } catch (e) {
        console.error("Report error:", e);
      }
      setReportSending(false);
    };

    var wins = targetData?.stats?.wins || 0;
    var losses = targetData?.stats?.losses || 0;
    var level = Math.floor((targetData?.stats?.xp || 0) / 100) + 1;

    return (/*#__PURE__*/
      React.createElement("div", { className: "modal-overlay", onClick: onClose, style: { zIndex: Z.MODAL } }, /*#__PURE__*/
      React.createElement("div", { className: "profile-glass-card animate-pop", style: { position: 'relative' }, onClick: (e) => e.stopPropagation() },

      targetData?.equipped?.profileEffects && /*#__PURE__*/
      React.createElement(ProfileEffectOverlay, { key: `fx-${targetUID}`, effectId: targetData.equipped.profileEffects }), /*#__PURE__*/


      React.createElement(ProfileHeader, {
        isOwnProfile: isOwnProfile,
        isTargetGuest: isTargetGuest,
        isGuestViewer: isGuestViewer,
        lang: lang,
        onClose: onClose,
        showOptionsMenu: showOptionsMenu,
        setShowOptionsMenu: setShowOptionsMenu,
        optionsRef: optionsRef,
        isBlocked: isBlocked,
        handleUnblockUser: handleUnblockUser,
        setShowBlockConfirm: setShowBlockConfirm,
        setShowReportModal: setShowReportModal,
        userData: userData,
        currentUserUID: currentUserUID,
        targetData: targetData,
        targetUID: targetUID,
        setShowBanModal: setShowBanModal,
        setShowRoleModal: setShowRoleModal,
        bannerURL: bannerURL,
        setBannerURL: setBannerURL,
        bannerFileRef: bannerFileRef,
        bannerUploading: bannerUploading,
        setBannerUploading: setBannerUploading,
        profileCoupleDoc: profileCoupleDoc,
        profilePartnerData: profilePartnerData,
        showProfileCoupleCard: showProfileCoupleCard,
        setShowProfileCoupleCard: setShowProfileCoupleCard,
        currentViewerData: currentViewerData,
        onOpenMarriage: onOpenMarriage,
        onOpenVIPCenter: onOpenVIPCenter,
        onOpenSettings: onOpenSettings,
        onOpenProfile: onOpenProfile }
      ),


      loading ? /*#__PURE__*/
      React.createElement("div", { className: "profile-loading" }, /*#__PURE__*/
      React.createElement("div", { className: "profile-loading-spinner" }), /*#__PURE__*/
      React.createElement("div", { className: "profile-loading-text" }, t.loading || 'Loading...')
      ) :
      !targetData ? /*#__PURE__*/
      React.createElement("div", { className: "profile-loading" }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '48px', marginBottom: '16px' } }, "\u274C"), /*#__PURE__*/
      React.createElement("div", { className: "profile-loading-text" }, t.friendNotFound || 'User not found')
      ) : /*#__PURE__*/

      React.createElement(React.Fragment, null,

      isBannedUser(targetData) && /*#__PURE__*/
      React.createElement("div", { style: {
          margin: '0 12px 6px',
          padding: '10px 14px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(220,0,0,0.18), rgba(139,0,0,0.12))',
          border: '1.5px solid rgba(239,68,68,0.5)',
          display: 'flex', alignItems: 'center', gap: '10px',
          boxShadow: '0 0 20px rgba(220,0,0,0.15)'
        } }, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '22px', flexShrink: 0, lineHeight: 1 } }, "\uD83D\uDEAB"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 900, color: '#f87171', letterSpacing: '0.3px' } },
      lang === 'ar' ? 'تم حظر هذا الحساب' : 'This Account is Banned'
      )
      ), /*#__PURE__*/


      React.createElement(ProfileIdentity, {
        targetData: targetData,
        targetUID: targetUID,
        lang: lang,
        onOpenFamily: onOpenFamily,
        onOpenProfile: onOpenProfile,
        onOpenVIPCenter: onOpenVIPCenter,
        setShowRoleInfoPopup: setShowRoleInfoPopup,
        copiedId: copiedId,
        setCopiedId: setCopiedId,
        userData: userData,
        isOwnProfile: isOwnProfile }
      ), /*#__PURE__*/

      React.createElement(ProfileTabs, { activeTab: activeTab, setActiveTab: setActiveTab, lang: lang }),

      activeTab === 'about' && /*#__PURE__*/
      React.createElement("div", { className: "profile-tab-content animate-fade-in" }, /*#__PURE__*/
      React.createElement(ProfileStats, { wins: wins, losses: losses, charismaRank: charismaRank, level: level, lang: lang }),
      !loading && targetData && /*#__PURE__*/
      React.createElement(BFFStripProfile, {
        targetUID: targetUID,
        currentUID: currentUserUID,
        currentUserData: userData,
        lang: lang,
        onNotification: onNotification,
        friendsData: null,
        onOpenBFFModal: onOpenBFFModal }
      ),

      !loading && targetData && /*#__PURE__*/
      React.createElement("div", {
        onClick: () => setShowGuardModal(true),
        style: {
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px',
          margin: '0',
          background: 'linear-gradient(135deg,rgba(0,212,255,0.05),rgba(112,0,255,0.05))',
          borderTop: '1px solid rgba(0,212,255,0.08)',
          borderBottom: '1px solid rgba(0,212,255,0.08)',
          cursor: 'pointer',
          transition: 'background 0.15s'
        },
        onMouseEnter: (e) => {e.currentTarget.style.background = 'linear-gradient(135deg,rgba(0,212,255,0.09),rgba(112,0,255,0.09))';},
        onMouseLeave: (e) => {e.currentTarget.style.background = 'linear-gradient(135deg,rgba(0,212,255,0.05),rgba(112,0,255,0.05))';} }, /*#__PURE__*/

      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', flex: 1 } }, /*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '12px', fontWeight: 800, color: '#e5e7eb', letterSpacing: '-0.2px' } }, "Guard"),
      !isOwnProfile && isLoggedInProp && currentUserFriends?.includes(targetUID) && /*#__PURE__*/
      React.createElement("div", {
        onClick: (e) => {e.stopPropagation();handleGiveGuard();},
        style: {
          display: 'inline-flex', alignItems: 'center', gap: '3px',
          fontSize: '9px', fontWeight: 700, marginTop: '2px',
          padding: '2px 7px', borderRadius: '5px', cursor: guardGiven ? 'default' : 'pointer',
          background: guardGiven ? 'rgba(107,114,128,0.15)' : 'linear-gradient(135deg,rgba(0,212,255,0.2),rgba(112,0,255,0.2))',
          border: guardGiven ? '1px solid rgba(107,114,128,0.2)' : '1px solid rgba(0,212,255,0.35)',
          color: guardGiven ? '#6b7280' : '#00f2ff',
          transition: 'all 0.15s'
        } },

      guardGiven ? /*#__PURE__*/React.createElement(React.Fragment, null, "\uD83D\uDD12 ", lang === 'ar' ? 'غداً' : 'Tomorrow') : /*#__PURE__*/React.createElement(React.Fragment, null, "\u2728 ", lang === 'ar' ? 'أعطِ حماية' : 'Give Guard')
      )

      )
      ), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px' } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', direction: 'ltr' } },
      [0, 1, 2].map((i) => {
        var g = guardData[i];
        var colors = ['#f5a623', '#b0b8c8', '#e07b9a'];
        return (/*#__PURE__*/
          React.createElement("div", { key: i, style: {
              width: '38px', height: '38px', borderRadius: '50%',
              border: `2.5px solid ${colors[i]}`,
              overflow: 'hidden', flexShrink: 0,
              marginLeft: i > 0 ? '-10px' : '0',
              background: '#1a1a2e',
              zIndex: 10 - i
            } },
          g?.photo ? /*#__PURE__*/React.createElement("img", { src: g.photo, style: { width: '100%', height: '100%', objectFit: 'cover' }, alt: "" }) : /*#__PURE__*/React.createElement("div", { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontSize: '14px' } }, "\uD83D\uDC64")
          ));

      })
      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '16px', color: '#6b7280', marginLeft: '4px' } }, "\u203A")
      )
      )

      ),


      activeTab === 'games' && /*#__PURE__*/
      React.createElement("div", { className: "profile-tab-content animate-fade-in" }, /*#__PURE__*/
      React.createElement(ProfileStats, { wins: wins, losses: losses, charismaRank: charismaRank, level: level, lang: lang }), /*#__PURE__*/
      React.createElement(AchievementsDisplayV11, { userData: targetData, lang: lang, showAll: true })
      ),


      activeTab === 'friends' && /*#__PURE__*/
      React.createElement("div", { className: "profile-tab-content animate-fade-in" }, /*#__PURE__*/
      React.createElement(ProfileFriendsSection, { targetData: targetData, friendsData: friendsData, lang: lang, onOpenProfile: onOpenProfile })
      ),


      activeTab === 'gifts' && /*#__PURE__*/
      React.createElement("div", { className: "profile-tab-content animate-fade-in" }, /*#__PURE__*/
      React.createElement(GiftWallV11, { gifts: gifts, lang: lang, isOwnProfile: isOwnProfile, userData: userData, onOpenProfile: onOpenProfile, onSendGiftToSelf: isGuestProp ? null : (gift) => {setSelfGift(gift);setShowSelfGiftModal(true);} })
      ),


      activeTab === 'moments' && /*#__PURE__*/
      React.createElement("div", { className: "profile-tab-content animate-fade-in" }, /*#__PURE__*/
      React.createElement(MomentsSection, { ownerUID: targetUID, ownerName: targetData?.displayName, ownerPhoto: targetData?.photoURL, currentUser: userData, isOwnProfile: isOwnProfile, lang: lang, onOpenProfile: onOpenProfile })
      ),



      showGuardModal && /*#__PURE__*/
      React.createElement(PortalModal, null, /*#__PURE__*/
      React.createElement("div", { style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: Z.MODAL_HIGH, padding: '16px' },
        onClick: () => setShowGuardModal(false) }, /*#__PURE__*/
      React.createElement("div", { style: {
          background: 'linear-gradient(160deg,#0d0d22,#131330)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '20px',
          width: '100%', maxWidth: '360px',
          maxHeight: '82vh', overflowY: 'auto',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)'
        }, onClick: (e) => e.stopPropagation() }, /*#__PURE__*/


      React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)' } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, /*#__PURE__*/
      React.createElement("div", { style: { width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.15)', flexShrink: 0 } },
      targetData?.photoURL ? /*#__PURE__*/
      React.createElement("img", { src: targetData.photoURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/
      React.createElement("div", { style: { width: '100%', height: '100%', background: '#1a1a3e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' } }, "\uD83D\uDC64")

      ), /*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 900, color: '#fff' } }, targetData?.displayName || ''), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: 600 } }, "\uD83D\uDEE1\uFE0F Guard Ranking")
      )
      ), /*#__PURE__*/
      React.createElement("button", { onClick: () => setShowGuardModal(false), style: { background: 'rgba(255,255,255,0.08)', border: 'none', color: '#9ca3af', fontSize: '16px', cursor: 'pointer', padding: '5px 9px', borderRadius: '8px', lineHeight: 1 } }, "\u2715")
      ),


      !isOwnProfile && isLoggedInProp && currentUserFriends?.includes(targetUID) && /*#__PURE__*/
      React.createElement("div", { style: { padding: '12px 14px 6px' } }, /*#__PURE__*/
      React.createElement("button", {
        onClick: (e) => {e.stopPropagation();handleGiveGuard();},
        disabled: guardGiven,
        style: {
          width: '100%', padding: '11px 16px',
          borderRadius: '12px', border: 'none',
          background: guardGiven ?
          'rgba(107,114,128,0.15)' :
          'linear-gradient(135deg,rgba(0,212,255,0.22),rgba(112,0,255,0.22))',
          border: guardGiven ?
          '1px solid rgba(107,114,128,0.18)' :
          '1px solid rgba(0,212,255,0.38)',
          color: guardGiven ? '#4b5563' : '#00f2ff',
          fontSize: '13px', fontWeight: 800,
          cursor: guardGiven ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          transition: 'all 0.18s',
          boxShadow: guardGiven ? 'none' : '0 0 18px rgba(0,212,255,0.15)'
        },
        onMouseEnter: (e) => {if (!guardGiven) {e.currentTarget.style.background = 'linear-gradient(135deg,rgba(0,212,255,0.32),rgba(112,0,255,0.32))';e.currentTarget.style.boxShadow = '0 0 24px rgba(0,212,255,0.28)';}},
        onMouseLeave: (e) => {if (!guardGiven) {e.currentTarget.style.background = 'linear-gradient(135deg,rgba(0,212,255,0.22),rgba(112,0,255,0.22))';e.currentTarget.style.boxShadow = '0 0 18px rgba(0,212,255,0.15)';}} },

      guardGiven ? /*#__PURE__*/
      React.createElement(React.Fragment, null, "\uD83D\uDD12 ", lang === 'ar' ? 'لقد أعطيت حماية اليوم — عُد غداً' : 'Already protected today — come back tomorrow') : /*#__PURE__*/

      React.createElement(React.Fragment, null, "\uD83D\uDEE1\uFE0F ", lang === 'ar' ? 'أعطِ حماية يومية' : 'Give Daily Protection')

      ),
      !guardGiven && /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '9px', color: 'rgba(255,255,255,0.28)', textAlign: 'center', marginTop: '5px' } },
      lang === 'ar' ?
      'كل يوم مرة واحدة — الحماية تعتمد على عدد أصدقائك (1–70)' :
      'Once per day — protection based on your friends count (1–70)'
      )

      ),



      (() => {
        var cfgMap = {
          1: { borderColor: '#f5a72a', bg: 'rgba(245,167,42,0.10)', nameColor: '#ffd166', scoreColor: '#ffc042', size: 78, borderW: 3, crown: '👑' },
          2: { borderColor: '#8da4c8', bg: 'rgba(141,164,200,0.10)', nameColor: '#b0c4de', scoreColor: '#90a8cc', size: 62, borderW: 2.5, crown: '🥈' },
          3: { borderColor: '#e07b9a', bg: 'rgba(224,123,154,0.10)', nameColor: '#f0a0bc', scoreColor: '#e07b9a', size: 62, borderW: 2.5, crown: '🥉' }
        };
        var fmtV = typeof fmtNum !== 'undefined' ? fmtNum : (n) => n;
        var ShieldCard = ({ gd, rank }) => {
          var cfg = cfgMap[rank];
          var s = cfg.size;
          var isEmpty = !gd;
          return (/*#__PURE__*/
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flex: rank === 1 ? 1.25 : 1 } }, /*#__PURE__*/
            React.createElement("span", { style: { fontSize: rank === 1 ? '20px' : '15px', marginBottom: '-2px' } }, cfg.crown), /*#__PURE__*/
            React.createElement("div", { style: { position: 'relative', width: `${s + 14}px`, height: `${s + 16}px` } }, /*#__PURE__*/
            React.createElement("svg", { width: s + 14, height: s + 18, viewBox: `0 0 ${s + 14} ${s + 18}`, style: { position: 'absolute', top: 0, left: 0 } }, /*#__PURE__*/
            React.createElement("path", { d: `M7,5 Q${(s + 14) / 2},1 ${s + 7},5 L${s + 7},${s * 0.66} Q${(s + 14) / 2},${s + 16} 7,${s * 0.66} Z`,
              fill: cfg.bg, stroke: isEmpty ? 'rgba(255,255,255,0.15)' : cfg.borderColor, strokeWidth: isEmpty ? 1.5 : cfg.borderW, strokeDasharray: isEmpty ? '4,3' : 'none', opacity: isEmpty ? 0.6 : 1 }), /*#__PURE__*/
            React.createElement("path", { d: `M13,10 Q${(s + 14) / 2},6 ${s + 1},10 L${s + 1},${s * 0.62} Q${(s + 14) / 2},${s + 9} 13,${s * 0.62} Z`,
              fill: "none", stroke: isEmpty ? 'rgba(255,255,255,0.08)' : cfg.borderColor, strokeWidth: "1", opacity: "0.35" })
            ), /*#__PURE__*/
            React.createElement("div", { style: {
                position: 'absolute', top: '11px', left: '11px',
                width: `${s - 8}px`, height: `${s - 8}px`,
                borderRadius: '50%', overflow: 'hidden',
                border: `2px solid ${isEmpty ? 'rgba(255,255,255,0.12)' : cfg.borderColor}`,
                background: isEmpty ? 'rgba(255,255,255,0.05)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              } },
            isEmpty ? /*#__PURE__*/
            React.createElement("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", opacity: "0.25" }, /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "8", r: "4", stroke: "#fff", strokeWidth: "1.5" }), /*#__PURE__*/React.createElement("path", { d: "M4 20c0-4 3.6-7 8-7s8 3 8 7", stroke: "#fff", strokeWidth: "1.5", strokeLinecap: "round" })) :
            gd.photo ? /*#__PURE__*/
            React.createElement("img", { src: gd.photo, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/
            React.createElement("div", { style: { width: '100%', height: '100%', background: '#1e1e3f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' } }, "\uD83D\uDC64")

            ),
            !isEmpty && /*#__PURE__*/
            React.createElement("div", { style: { position: 'absolute', bottom: '3px', right: '1px', width: '18px', height: '18px', borderRadius: '50%', background: cfg.borderColor, border: `2px solid #131330`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 900, color: '#fff' } },
            rank
            )

            ), /*#__PURE__*/
            React.createElement("span", { style: { fontSize: '11px', fontWeight: 800, color: isEmpty ? 'rgba(255,255,255,0.2)' : cfg.nameColor, maxWidth: '76px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' } }, isEmpty ? lang === 'ar' ? 'فارغ' : 'Empty' : gd.name), /*#__PURE__*/
            React.createElement("span", { style: { fontSize: '12px', fontWeight: 900, color: isEmpty ? 'rgba(255,255,255,0.15)' : cfg.scoreColor } }, isEmpty ? '—' : fmtV(gd.total)), /*#__PURE__*/
            React.createElement("span", { style: { fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.3px' } }, "Guard")
            ));

        };
        return (/*#__PURE__*/
          React.createElement("div", { style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '6px', padding: '18px 12px 16px', background: 'rgba(255,255,255,0.02)', margin: '14px 14px 6px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' } }, /*#__PURE__*/
          React.createElement(ShieldCard, { gd: guardData[1] || null, rank: 2 }), /*#__PURE__*/
          React.createElement("div", { style: { marginBottom: '14px' } }, /*#__PURE__*/React.createElement(ShieldCard, { gd: guardData[0] || null, rank: 1 })), /*#__PURE__*/
          React.createElement(ShieldCard, { gd: guardData[2] || null, rank: 3 })
          ));

      })(),


      guardData.length > 3 && /*#__PURE__*/
      React.createElement("div", { style: { margin: '6px 14px 14px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' } },
      guardData.slice(3).map((g, i) => /*#__PURE__*/
      React.createElement("div", { key: g.uid, style: {
          display: 'flex', alignItems: 'center', gap: '11px',
          padding: '10px 14px',
          background: i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.015)',
          borderBottom: i < guardData.length - 4 ? '1px solid rgba(255,255,255,0.05)' : 'none'
        } }, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', minWidth: '22px', textAlign: 'center' } }, i + 4), /*#__PURE__*/
      React.createElement("div", { style: { width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.12)', flexShrink: 0 } },
      g.photo ? /*#__PURE__*/
      React.createElement("img", { src: g.photo, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : /*#__PURE__*/
      React.createElement("div", { style: { width: '100%', height: '100%', background: '#1e1e3f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' } }, "\uD83D\uDC64")

      ), /*#__PURE__*/
      React.createElement("span", { style: { flex: 1, fontSize: '13px', fontWeight: 700, color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, g.name), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' } }, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '13px', color: '#f472b6', fontWeight: 800 } }, fmtNum(g.total)), /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 } }, "Guard")
      )
      )
      )
      ), /*#__PURE__*/


      React.createElement("div", { style: { height: '10px' } })
      )
      )
      ), /*#__PURE__*/


      React.createElement(AchievementsDisplayV11, { userData: targetData, lang: lang }),

      isBlocked && !isOwnProfile && /*#__PURE__*/
      React.createElement("div", { className: "profile-blocked-notice" }, /*#__PURE__*/
      React.createElement("span", null, "\uD83D\uDEAB"), /*#__PURE__*/
      React.createElement("span", null, lang === 'ar' ? 'لقد حظرت هذا المستخدم' : 'You have blocked this user')
      ),


      blockedByTarget && !isOwnProfile && /*#__PURE__*/
      React.createElement("div", { className: "profile-blocked-notice blocked-by-other" }, /*#__PURE__*/
      React.createElement("span", null, "\uD83D\uDEAB"), /*#__PURE__*/
      React.createElement("span", null, lang === 'ar' ? 'هذا المستخدم قد حظرك' : 'This user has blocked you')
      ),



      isOwnProfile && isGuestProp && onLoginGoogle && /*#__PURE__*/
      React.createElement("div", { style: { margin: '8px 12px', padding: '14px 16px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(185, 28, 28, 0.08))', border: '1px solid rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center', gap: '12px' } }, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '28px', flexShrink: 0 } }, "\u26A0\uFE0F"), /*#__PURE__*/
      React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 800, color: '#fca5a5', marginBottom: '2px' } }, lang === 'ar' ? 'تحذير مسح البيانات لزائر' : 'Guest Data Loss Warning'), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '11px', color: '#fecaca', lineHeight: 1.4 } }, lang === 'ar' ? 'أنت تلعب كزائر. مسح بيانات المتصفح سيؤدي إلى حذف حسابك وتقدمك نهائياً. اربط حسابك بجوجل للحفاظ على بياناتك آمنة.' : 'You are playing as a Guest. Clearing your browser data will permanently delete your account and progress. Link your account to Google to keep your data safe.')
      ), /*#__PURE__*/
      React.createElement("button", {
        onClick: onLoginGoogle,
        style: { flexShrink: 0, padding: '8px 14px', borderRadius: '10px', background: 'linear-gradient(135deg,#4285f4,#1a73e8)', border: 'none', color: '#fff', fontWeight: 800, fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(66,133,244,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } },
      React.createElement("span", null, lang === 'ar' ? 'دخول بحساب' : 'Link Google'),
      React.createElement("span", { style: { fontSize: '9px', opacity: 0.9, marginTop: '2px', fontWeight: 'bold' } }, lang === 'ar' ? 'لحفظ التقدم' : 'To Save Data')
      )
      ),



      isTargetGuest && /*#__PURE__*/
      React.createElement("div", { style: {
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '10px 16px', margin: '6px 0',
          background: 'linear-gradient(135deg,rgba(251,191,36,0.12),rgba(245,158,11,0.08))',
          border: '1px solid rgba(251,191,36,0.4)',
          borderRadius: '12px',
          boxShadow: '0 0 16px rgba(251,191,36,0.12)'
        } }, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '16px' } }, "\uD83D\uDC64"), /*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '12px', fontWeight: 900, color: '#fbbf24', letterSpacing: '0.5px' } },
      lang === 'ar' ? 'حساب ضيف' : 'GUEST ACCOUNT'
      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '9px', color: '#92400e', fontWeight: 600 } },
      lang === 'ar' ? 'لا يمكن إضافته كصديق أو إرسال هدايا' : 'Limited features — no friends or gifts'
      )
      )
      ),


      !isOwnProfile && !isTargetGuest && !isBlocked && !blockedByTarget && !isGuestViewer && /*#__PURE__*/
      React.createElement("div", { className: "profile-actions" },
      isAlreadyFriend ? /*#__PURE__*/
      /* Already friends → show Chat button */
      React.createElement("button", {
        onClick: () => {
          if (onOpenChat) {
            onOpenChat({ uid: targetUID, displayName: targetData?.displayName, photoURL: targetData?.photoURL, equipped: targetData?.equipped, id: targetUID });
          }
        },
        className: "profile-action-btn primary",
        style: { background: 'linear-gradient(135deg,rgba(0,242,255,0.25),rgba(112,0,255,0.2))', borderColor: 'rgba(0,242,255,0.4)' } }, /*#__PURE__*/

      React.createElement("span", null, "\uD83D\uDCAC"), /*#__PURE__*/
      React.createElement("span", null, lang === 'ar' ? 'محادثة' : 'Chat')
      ) :
      hasPendingRequest ? /*#__PURE__*/
      React.createElement("button", { disabled: true, className: "profile-action-btn secondary" }, /*#__PURE__*/
      React.createElement("span", null, "\u23F3"), /*#__PURE__*/
      React.createElement("span", null, lang === 'ar' ? 'تم الإرسال' : 'Sent')
      ) : /*#__PURE__*/

      React.createElement("button", { onClick: handleAddFriend, className: "profile-action-btn primary" }, /*#__PURE__*/
      React.createElement("span", null, "\uD83D\uDC64"), /*#__PURE__*/
      React.createElement("span", null, lang === 'ar' ? 'أضف صديق' : 'Add Friend')
      ), /*#__PURE__*/

      React.createElement("button", { onClick: () => setShowGiftModal(true), className: "profile-action-btn secondary" }, /*#__PURE__*/
      React.createElement("span", null, "\uD83C\uDF81"), /*#__PURE__*/
      React.createElement("span", null, lang === 'ar' ? 'أرسل هدية' : 'Send Gift')
      )
      ),



      isOwnProfile && /*#__PURE__*/
      React.createElement("div", { style: { padding: '0 12px 12px', display: 'flex', gap: '8px' } }, /*#__PURE__*/

      React.createElement("button", {
        onClick: () => onOpenChat && onOpenChat('self'),
        style: {
          flex: 1, padding: '11px', borderRadius: '12px',
          background: 'linear-gradient(135deg,rgba(0,242,255,0.12),rgba(112,0,255,0.1))',
          border: '1px solid rgba(0,242,255,0.3)', color: '#00f2ff',
          fontSize: '12px', fontWeight: 800, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          transition: 'all 0.2s'
        } }, /*#__PURE__*/

      React.createElement("span", { style: { fontSize: '16px' } }, "\uD83D\uDCAC"), /*#__PURE__*/
      React.createElement("span", null, lang === 'ar' ? 'شاتي' : 'My Chat')
      ), /*#__PURE__*/

      React.createElement("button", {
        onClick: () => setShowSelfGiftModal(true),
        style: {
          flex: 1, padding: '11px', borderRadius: '12px',
          background: GR.GOLD,
          border: '1px solid rgba(255,215,0,0.4)', color: '#facc15',
          fontSize: '12px', fontWeight: 800, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          transition: 'all 0.2s'
        } }, /*#__PURE__*/

      React.createElement("span", { style: { fontSize: '16px' } }, "\uD83C\uDF81"), /*#__PURE__*/
      React.createElement("span", null, lang === 'ar' ? 'هدية لنفسي' : 'Gift Myself')
      )
      )

      ),



      showReportModal && /*#__PURE__*/
      React.createElement("div", { style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: Z.MODAL, padding: '16px' }, onClick: () => {setShowReportModal(false);setReportReason('');setReportDescription('');setReportImagePreview(null);} }, /*#__PURE__*/
      React.createElement("div", { className: "profile-confirm-modal", onClick: (e) => e.stopPropagation(), style: { maxWidth: '320px', width: '100%', maxHeight: '85vh', overflowY: 'auto' } }, /*#__PURE__*/
      React.createElement("div", { className: "profile-confirm-icon" }, "\uD83D\uDEA8"), /*#__PURE__*/
      React.createElement("div", { className: "profile-confirm-title" }, lang === 'ar' ? 'إبلاغ عن مستخدم' : 'Report User'), /*#__PURE__*/


      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '8px 10px', marginBottom: '12px' } }, /*#__PURE__*/
      React.createElement("img", { src: targetData?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetData?.displayName || 'U')}&background=7000ff&color=fff&size=50`,
        style: { width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 } }), /*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '12px', fontWeight: 700, color: 'white' } }, targetData?.displayName), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '10px', color: '#6b7280', fontFamily: 'monospace' } }, targetUID?.slice(0, 16), "...")
      )
      ), /*#__PURE__*/


      React.createElement("div", { style: { fontSize: '11px', color: '#9ca3af', marginBottom: '8px', textAlign: 'start' } },
      lang === 'ar' ? 'سبب البلاغ:' : 'Reason:'
      ), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' } },
      [
      { key: 'abusive', icon: '🤬', ar: 'سلوك مسيء', en: 'Abusive Behavior' },
      { key: 'verbal_abuse', icon: '💬', ar: 'شتيمة لفظية', en: 'Verbal Abuse' },
      { key: 'cheating', icon: '🎮', ar: 'غش في اللعبة', en: 'Cheating' },
      { key: 'fraud', icon: '💰', ar: 'احتيال', en: 'Fraud' },
      { key: 'avatar', icon: '🖼️', ar: 'صورة أفاتار مسيئة', en: 'Inappropriate Avatar' },
      { key: 'spam', icon: '📢', ar: 'سبام', en: 'Spam' },
      { key: 'other', icon: '❓', ar: 'سبب آخر', en: 'Other' }].
      map((r) => /*#__PURE__*/
      React.createElement("button", { key: r.key, onClick: () => setReportReason(r.key), style: {
          padding: '7px 10px', borderRadius: '7px', fontSize: '12px',
          textAlign: 'start', cursor: 'pointer', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '8px',
          background: reportReason === r.key ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
          border: reportReason === r.key ? '1.5px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.1)',
          color: reportReason === r.key ? 'white' : '#9ca3af'
        } }, /*#__PURE__*/
      React.createElement("span", null, r.icon), /*#__PURE__*/
      React.createElement("span", null, lang === 'ar' ? r.ar : r.en)
      )
      )
      ), /*#__PURE__*/


      React.createElement("div", { style: { fontSize: '11px', color: '#9ca3af', marginBottom: '6px' } },
      lang === 'ar' ? 'وصف المشكلة (اختياري):' : 'Describe the issue (optional):'
      ), /*#__PURE__*/
      React.createElement("textarea", {
        value: reportDescription,
        onChange: (e) => setReportDescription(e.target.value),
        maxLength: 300,
        placeholder: lang === 'ar' ? 'اشرح ما حدث بالتفصيل...' : 'Explain what happened in detail...',
        style: {
          width: '100%', padding: '8px', borderRadius: '7px', fontSize: '11px', resize: 'vertical', minHeight: '55px',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'white', outline: 'none', marginBottom: '10px', boxSizing: 'border-box'
        } }), /*#__PURE__*/


      React.createElement("div", { style: { fontSize: '11px', color: '#9ca3af', marginBottom: '6px' } },
      lang === 'ar' ? 'إرفاق صورة (اختياري):' : 'Attach image (optional):'
      ),
      reportImagePreview ? /*#__PURE__*/
      React.createElement("div", { style: { position: 'relative', marginBottom: '10px' } }, /*#__PURE__*/
      React.createElement("img", { src: reportImagePreview, style: { width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.1)' } }), /*#__PURE__*/
      React.createElement("button", { onClick: () => setReportImagePreview(null),
        style: { position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, "\u2715"

      )
      ) : /*#__PURE__*/

      React.createElement("label", { style: {
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          padding: '8px', borderRadius: '7px', marginBottom: '10px', cursor: 'pointer',
          background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.2)', color: '#9ca3af', fontSize: '11px'
        } }, "\uD83D\uDCCE ",
      lang === 'ar' ? 'اضغط لإرفاق صورة' : 'Click to attach image', /*#__PURE__*/
      React.createElement("input", { type: "file", accept: "image/*", style: { display: 'none' }, onChange: (e) => {
          var file = e.target.files?.[0];
          if (!file) return;
          var reader = new FileReader();
          reader.onload = (ev) => {
            // Resize via canvas to max 600px
            var img = new Image();
            img.onload = () => {
              var canvas = document.createElement('canvas');
              var max = 600;
              var ratio = Math.min(max / img.width, max / img.height, 1);
              canvas.width = img.width * ratio;
              canvas.height = img.height * ratio;
              canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
              setReportImagePreview(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = ev.target.result;
          };
          reader.readAsDataURL(file);
          e.target.value = '';
        } })
      ), /*#__PURE__*/


      React.createElement("div", { className: "profile-confirm-actions" }, /*#__PURE__*/
      React.createElement("button", { onClick: () => {setShowReportModal(false);setReportReason('');setReportDescription('');setReportImagePreview(null);}, className: "cancel" },
      lang === 'ar' ? 'إلغاء' : 'Cancel'
      ), /*#__PURE__*/
      React.createElement("button", { onClick: handleSendReport, disabled: !reportReason || reportSending, className: "confirm",
        style: { opacity: !reportReason || reportSending ? 0.5 : 1, background: '#ef4444' } },
      reportSending ? '...' : lang === 'ar' ? 'إرسال البلاغ' : 'Submit Report'
      )
      )
      )
      ),


      showBlockConfirm && /*#__PURE__*/
      React.createElement("div", { className: "profile-confirm-overlay", onClick: () => setShowBlockConfirm(false) }, /*#__PURE__*/
      React.createElement("div", { className: "profile-confirm-modal", onClick: (e) => e.stopPropagation() }, /*#__PURE__*/
      React.createElement("div", { className: "profile-confirm-icon" }, "\uD83D\uDEAB"), /*#__PURE__*/
      React.createElement("div", { className: "profile-confirm-title" },
      lang === 'ar' ? 'حظر المستخدم' : 'Block User'
      ), /*#__PURE__*/
      React.createElement("div", { className: "profile-confirm-message" },
      lang === 'ar' ?
      `هل أنت متأكد من حظر ${targetData?.displayName || 'هذا المستخدم'}؟` :
      `Are you sure you want to block ${targetData?.displayName || 'this user'}?`
      ), /*#__PURE__*/
      React.createElement("div", { className: "profile-confirm-actions" }, /*#__PURE__*/
      React.createElement("button", { onClick: () => setShowBlockConfirm(false), className: "cancel" },
      lang === 'ar' ? 'إلغاء' : 'Cancel'
      ), /*#__PURE__*/
      React.createElement("button", { onClick: handleBlockUser, className: "confirm" },
      lang === 'ar' ? 'حظر' : 'Block'
      )
      )
      )
      ),



      showBanModal && isAdmin(currentUserUID) && /*#__PURE__*/
      React.createElement(AdminBanModal, {
        targetData: targetData,
        lang: lang,
        onClose: () => setShowBanModal(false),
        onBanApplied: (newBan) => {
          setTargetData((prev) => ({ ...prev, ban: newBan }));
        } }
      ),



      showRoleModal && canManageRoles(userData, currentUserUID) && /*#__PURE__*/
      React.createElement(AdminRoleModal, {
        targetData: targetData,
        viewerData: userData,
        viewerUID: currentUserUID,
        lang: lang,
        onClose: () => setShowRoleModal(false),
        onRoleApplied: (newRole) => {
          setTargetData((prev) => ({ ...prev, staffRole: newRole }));
        } }
      ),



      showRoleInfoPopup && /*#__PURE__*/
      React.createElement(RoleInfoPopup, {
        targetData: targetData,
        lang: lang,
        onClose: () => setShowRoleInfoPopup(false) }
      )

      ),

      showGiftModal && targetData && /*#__PURE__*/
      React.createElement(SendGiftModal, {
        show: showGiftModal,
        onClose: () => setShowGiftModal(false),
        targetUser: targetData,
        currentUser: userData,
        lang: lang,
        onSendGift: onSendGift,
        currency: userData?.currency || 0,
        friendsData: friendsData }
      ),


      showSelfGiftModal && userData && /*#__PURE__*/
      React.createElement(SendGiftModal, {
        show: showSelfGiftModal,
        onClose: () => setShowSelfGiftModal(false),
        targetUser: { uid: userData?.uid, displayName: userData?.displayName || (lang === 'ar' ? 'أنت' : 'You'), photoURL: userData?.photoURL },
        currentUser: userData,
        lang: lang,
        onSendGift: async (gift, targetUser) => {
          if (onSendGift) await onSendGift(gift, targetUser);
          setShowSelfGiftModal(false);
        },
        currency: userData?.currency || 0,
        friendsData: [] }
      )

      ));

  };

  window.ProfileV11 = ProfileV11;
})();