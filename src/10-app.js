function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); } (function () {
  var { useState, useEffect, useRef, useMemo, useCallback } = React;
  // Use AppHooks namespace if available for robust handling of missing scripts (e.g. 503 errors)
  var registry = window.AppHooks || window;
  var {
    useAuthState, usePresence, useNotifications, useRoom,
    useLeaderboards, useSocial, useGameAutomation, useBots,
    useLoginRewards, useBanningLogic,
    useAppUIState, useOnboarding,
    OWNER_UID
  } = registry;

  // ── PWA Install Popup Component (separate so useState follows Rules of Hooks) ──
  function PWAInstallPopup({ lang, onClose }) {
    var [neverShow, setNeverShow] = useState(false);
    return (/*#__PURE__*/
      React.createElement("div", {
        style: {
          position: 'fixed', bottom: '88px', left: '12px', right: '12px', zIndex: 2000,
          background: 'linear-gradient(135deg,rgba(10,10,30,0.97),rgba(15,5,40,0.97))',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(0,242,255,0.3)', borderRadius: '20px',
          padding: '18px 18px 14px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,242,255,0.08)'
        }
      }, /*#__PURE__*/

        React.createElement("div", { style: { display: 'flex', gap: '12px', alignItems: 'flex-start', flexDirection: lang === 'ar' ? 'row-reverse' : 'row' } }, /*#__PURE__*/
          React.createElement("div", { style: { width: '46px', height: '46px', background: 'linear-gradient(135deg,rgba(0,242,255,0.15),rgba(112,0,255,0.15))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0, border: '1px solid rgba(0,242,255,0.2)' } }, "\uD83D\uDE80"), /*#__PURE__*/
          React.createElement("div", { style: { flex: 1 } }, /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '15px', fontWeight: 800, color: 'white', marginBottom: '3px' } }, lang === 'ar' ? 'ثبّت التطبيق!' : 'Install App Now!'), /*#__PURE__*/
            React.createElement("div", { style: { fontSize: '11px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.4' } }, lang === 'ar' ? 'تجربة أسرع من الشاشة الرئيسية.' : 'Faster experience from your home screen.')
          ), /*#__PURE__*/
          React.createElement("button", {
            onClick: () => {
              if (neverShow && window.markInstallNeverShow) window.markInstallNeverShow();
              onClose();
            },
            style: { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', padding: 0, cursor: 'pointer', fontSize: '14px', borderRadius: '8px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
          },
            "\u2715")
        ), /*#__PURE__*/


        React.createElement("div", { style: { marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' } }, /*#__PURE__*/

          React.createElement("label", { style: { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flexDirection: lang === 'ar' ? 'row-reverse' : 'row' } }, /*#__PURE__*/
            React.createElement("div", {
              onClick: () => setNeverShow((v) => !v),
              style: {
                width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                border: neverShow ? '2px solid #00f2ff' : '2px solid rgba(255,255,255,0.25)',
                background: neverShow ? 'rgba(0,242,255,0.2)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s', cursor: 'pointer'
              }
            },

              neverShow && /*#__PURE__*/React.createElement("span", { style: { fontSize: '10px', color: '#00f2ff', fontWeight: 900, lineHeight: 1 } }, "\u2713")
            ), /*#__PURE__*/
            React.createElement("span", { style: { fontSize: '10px', color: 'rgba(255,255,255,0.45)', userSelect: 'none' } }, lang === 'ar' ? 'لا تُظهر مجدداً' : "Don't show again")
          ), /*#__PURE__*/


          React.createElement("button", {
            onClick: () => {
              if (window.triggerPWAInstall) window.triggerPWAInstall();
              if (window.markInstallNeverShow) window.markInstallNeverShow();
              onClose();
            },
            style: { padding: '9px 22px', borderRadius: '12px', background: 'linear-gradient(135deg,#00f2ff,#7000ff)', border: 'none', color: 'white', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,242,255,0.3)', flexShrink: 0 }
          },
            lang === 'ar' ? 'تثبيت' : 'Install')
        )
      ));

  }

  function App() {
    // ── Global States ──
    var uiState = useAppUIState();
    var {
      lang, setLang, room, setRoom, roomId, setRoomId, inputCode, setInputCode,
      nickname, setNickname, loading, setLoading, turnTimer, setTurnTimer,
      votingTimer, setVotingTimer, wordSelTimer, setWordSelTimer, showSetupModal, setShowSetupModal,
      setupMode, setSetupMode, isPrivate, setIsPrivate, password, setPassword,
      showPassword, setShowPassword, activeView, setActiveView, showDropdown, setShowDropdown,
      joinError, setJoinError, alertMessage, setAlertMessage, leaderboardData, setLeaderboardData,
      charismaLeaderboard, setCharismaLeaderboard, familyLeaderboard, setFamilyLeaderboard,
      leaderboardTab, setLeaderboardTab, friendsData, setFriendsData, addFriendId, setAddFriendId,
      friendSearchMsg, setFriendSearchMsg, friendRequests, setFriendRequests,
      showMyAccount, setShowMyAccount, showUserProfile, setShowUserProfile,
      targetProfileUID, setTargetProfileUID, chatsMeta, setChatsMeta, totalUnread, setTotalUnread,
      openChatId, setOpenChatId, showBrowseRooms, setShowBrowseRooms, copied, setCopied,
      notification, setNotification, showSummary, setShowSummary,
      showShop, setShowShop, showInventory, setShowInventory, showPrivateChat, setShowPrivateChat,
      showSelfChat, setShowSelfChat, showFunPass, setShowFunPass, chatFriend, setChatFriend,
      showLoginAlert, setShowLoginAlert, guestData, setGuestData,
      showLobbyPassword, setShowLobbyPassword, showNotifications, setShowNotifications,
      notifications, setNotifications, unreadNotifications, setUnreadNotifications,
      notificationBellRef, historyWrittenRooms, lastAchievementCheck, showSettings, setShowSettings,
      showLuckyGames, setShowLuckyGames,
      soundMuted, setSoundMuted, showAdminPanel, setShowAdminPanel, showFriendsMoments, setShowFriendsMoments,
      showFamilyModal, setShowFamilyModal, viewFamilyId, setViewFamilyId, userFamily, setUserFamily,
      showFamilyChat, setShowFamilyChat, hasNewMoments, setHasNewMoments, coupleData, setCoupleData,
      partnerData, setPartnerData, showCoupleCard, setShowCoupleCard, showProposalModal, setShowProposalModal,
      proposalRing, setProposalRing, incomingProposal, setIncomingProposal,
      incomingProposalFrom, setIncomingProposalFrom, showIncomingProposal, setShowIncomingProposal,
      showWeddingHall, setShowWeddingHall, showBFFModal, setShowBFFModal, bffInitialTab, setBffInitialTab,
      bffUnreadCount, setBffUnreadCount, showDetectiveBot, setShowDetectiveBot, showLoveBot, setShowLoveBot,
      detectiveBotUnread, setDetectiveBotUnread, loveBotUnread, setLoveBotUnread,
      showVIPCenter, setShowVIPCenter, showHelpCenter, setShowHelpCenter, showPublicChat, setShowPublicChat,
      showGuestMenu, setShowGuestMenu, gameChatInput, setGameChatInput,
      showGameChat, setShowGameChat, gameChatRef,
      showSendGiftModal, setShowSendGiftModal, sendGiftTarget, setSendGiftTarget
    } = uiState;

    // ── Auth & Logic Hooks ──
    var [onboardingStates, setOnboardingStates] = useState({ googleUser: null, pendingRef: null, show: false });
    var [chatSubTab, setChatSubTab] = useState('friends'); // ✅ Fix: replaces DOM manipulation for chat tab switching
    var { user, userData, authLoading, isLoggedIn, setUser, setUserData, setAuthLoading } = useAuthState({
      setLang, setNickname,
      setOnboardingGoogleUser: (u) => setOnboardingStates((prev) => ({ ...prev, googleUser: u })),
      setPendingNewUserRef: (r) => setOnboardingStates((prev) => ({ ...prev, pendingRef: r })),
      setShowOnboarding: (s) => setOnboardingStates((prev) => ({ ...prev, show: s }))
    });

    var {
      showOnboarding, setShowOnboarding, setOnboardingGoogleUser, setPendingNewUserRef,
      showTutorial, setShowTutorial, showPWAInstall, setShowPWAInstall,
      onboardingGoogleUser, handleOnboardingComplete
    } = useOnboarding({
      user, userData, isLoggedIn, authLoading, setUser, setUserData,
      setNickname, setGuestData, lang, setNotification, playSound: window.playSound
    });

    useEffect(() => {
      if (onboardingStates.googleUser) setOnboardingGoogleUser(onboardingStates.googleUser);
      if (onboardingStates.pendingRef) setPendingNewUserRef(onboardingStates.pendingRef);
      if (onboardingStates.show) setShowOnboarding(onboardingStates.show);
    }, [onboardingStates]);

    // ── Logic Variables & Helpers ──
    var t = TRANSLATIONS[lang];
    var isGuest = useMemo(() => guestData !== null, [guestData]);
    var currentUID = useMemo(() => { if (user && !user.isAnonymous) return user.uid; if (guestData) return guestData.uid; return null; }, [user, guestData]);
    var currentUserData = useMemo(() => { if (isLoggedIn) return userData; if (isGuest) return guestData; return null; }, [isLoggedIn, userData, isGuest, guestData]);

    var { showLoginRewards, setShowLoginRewards, sessionClaimedToday, setSessionClaimedToday, handleClaimLoginReward } = window.useLoginRewards({ user, isLoggedIn, userData, lang, setNotification });

    // Expose global functions to window
    useEffect(() => {
      window.setGlobalNotification = (msg) => {
        if (typeof setNotification === 'function') setNotification(msg);
      };
      window.onOpenFamily = (fid) => {
        if (typeof setShowMyAccount === 'function') setShowMyAccount(false);
        if (typeof setShowUserProfile === 'function') setShowUserProfile(false);
        if (typeof setShowFamilyChat === 'function') setShowFamilyChat(false);
        setViewFamilyId((typeof fid === 'string' && fid) ? fid : null);
        setShowFamilyModal(true);
      };
      window.openGiftModal = (target) => {
        if (typeof setSendGiftTarget === 'function') setSendGiftTarget(target);
        if (typeof setShowSendGiftModal === 'function') setShowSendGiftModal(true);
      };
      window.handleBlockUser = async (targetUID) => {
        if (!currentUID || !targetUID || isGuest) return;
        if (targetUID === currentUID) return;
        try {
          await usersCollection.doc(currentUID).update({
            blockedUsers: firebase.firestore.FieldValue.arrayUnion(targetUID)
          });
          setNotification(lang === 'ar' ? 'تم حظر المستخدم' : 'User blocked');
        } catch (e) {
          console.error('[PRO SPY] Block error:', e);
          setNotification(lang === 'ar' ? 'حدث خطأ أثناء الحظر' : 'Block failed');
        }
      };
      window.handleUnblockUser = async (targetUID) => {
        if (!currentUID || !targetUID || isGuest) return;
        try {
          await usersCollection.doc(currentUID).update({
            blockedUsers: firebase.firestore.FieldValue.arrayRemove(targetUID)
          });
          setNotification(lang === 'ar' ? 'تم إلغاء الحظر' : 'User unblocked');
        } catch (e) {
          console.error('[PRO SPY] Unblock error:', e);
        }
      };
      return () => {
        delete window.setGlobalNotification;
        delete window.onOpenFamily;
        delete window.openGiftModal;
        delete window.handleBlockUser;
        delete window.handleUnblockUser;
      };
    }, [setNotification, setViewFamilyId, setShowFamilyModal, setShowMyAccount, setShowUserProfile, setShowFamilyChat, currentUID, isGuest, lang]);

    // ── Specialized Listeners ──
    usePresence({ user, isLoggedIn, userData, isGuest: !!guestData });
    useNotifications({ user, isLoggedIn, userData, notificationBellRef, setNotifications, setUnreadNotifications });
    useSocial({ user, isLoggedIn, userData, setFriendsData, setFriendRequests, setChatsMeta, setTotalUnread });
    useLeaderboards({ activeView, leaderboardTab, setLeaderboardData, setCharismaLeaderboard, setFamilyLeaderboard });
    var { isBanned } = useBanningLogic({ userData, isLoggedIn });

    // ── Modular Hooks ──
    window.useUserListeners({
      currentUID, isLoggedIn, lang,
      setUserFamily, setNotification, setDetectiveBotUnread, setLoveBotUnread, setBffUnreadCount,
      setCoupleData, setPartnerData, setIncomingProposal, setIncomingProposalFrom, setShowIncomingProposal
    });

    var gameActions = window.useGameActions({
      user, userData, isLoggedIn, isGuest, nickname, lang, t, currentUID, currentUserData,
      room, roomId, setRoom, setRoomId,
      guestData, setGuestData, setNickname, setAuthLoading,
      setNotification, playSound: window.playSound, setAlertMessage, setLoading,
      setShowSetupModal, setActiveView, setCopied, setShowSummary,
      setShowLoginAlert, setShowDropdown, setJoinError, setShowBrowseRooms,
      setFriendsData, setFriendRequests, setChatsMeta, setTotalUnread,
      setChatFriend, setShowPrivateChat, setOpenChatId, setShowUserProfile, setTargetProfileUID,
      setLeaderboardData, setCharismaLeaderboard, setFamilyLeaderboard,
      setIncomingProposal, setShowIncomingProposal,
      proposalRing, setSessionClaimedToday,
      isPrivate, password, setupMode, gameChatInput, setGameChatInput,
      userFamily, friendsData, notifications, setNotifications, setUnreadNotifications,
      OWNER_UID, addFriendId, setAddFriendId, setFriendSearchMsg
    });

    useRoom({
      roomId, user, isLoggedIn, userData, coupleData, historyWrittenRooms,
      setRoom, setRoomId, setShowSummary,
      incrementMissionProgress: gameActions.incrementMissionProgress,
      checkAndUnlockAchievements: gameActions.checkAndUnlockAchievements
    });

    // 🔔 [UI] Close notifications on click-outside
    useEffect(() => {
      var handleClickOutside = (event) => {
        if (showNotifications && notificationBellRef.current && !notificationBellRef.current.contains(event.target)) {
          setShowNotifications(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifications]);

    useGameAutomation({
      room, roomId, currentUID, setTurnTimer, setVotingTimer, setWordSelTimer,
      handleSkipTurn: gameActions.handleSkipTurn,
      triggerVoting: gameActions.triggerVoting
    });

    useBots({
      room, roomId, currentUID, OWNER_UID, lang,
      nextTurn: (r) => window.GameService.nextTurn(r)
    });

    // ── Click Outside to Close Notifications ──
    useEffect(() => {
      if (showNotifications) {
        var handleClickOutside = (event) => {
          if (notificationBellRef.current && !notificationBellRef.current.contains(event.target)) {
            setShowNotifications(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [showNotifications, notificationBellRef, setShowNotifications]);

    // Background Animation
    useEffect(() => {
      var cleanup = window.initBackgroundAnimation('bg-canvas');
      return cleanup;
    }, []);

    // ── App Rendering ──
    // 🔒 Critical components readiness guard
    var _criticalReady = window.LobbyView && window.GlobalModals && window.AvatarWithFrame && window.BannedScreen;
    if (!_criticalReady) {
      return (/*#__PURE__*/
        React.createElement("div", {
          style: {
            position: 'fixed', inset: 0, background: 'linear-gradient(160deg,#060612,#0a0a1e)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            zIndex: 999999, gap: '16px'
          }
        }, /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '48px', animation: 'gw-float 2s ease-in-out infinite' } }, "\uD83D\uDD75\uFE0F"), /*#__PURE__*/
          React.createElement("div", { style: { width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(0,242,255,0.15)', borderTop: '3px solid #00f2ff', animation: 'spin 0.8s linear infinite' } }), /*#__PURE__*/
          React.createElement("style", null, `@keyframes spin{to{transform:rotate(360deg)}}@keyframes gw-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`)
        ));

    }

    // 🔒 authLoading screen
    if (authLoading) {
      return (/*#__PURE__*/
        React.createElement("div", { style: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg,#060612,#0a0a1e)', flexDirection: 'column', gap: '16px' } }, /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '48px', animation: 'gw-float 2s ease-in-out infinite' } }, "\uD83D\uDD75\uFE0F"), /*#__PURE__*/
          React.createElement("div", { style: { width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(0,242,255,0.15)', borderTop: '3px solid #00f2ff', animation: 'spin 0.8s linear infinite' } }), /*#__PURE__*/
          React.createElement("style", null, `@keyframes spin{to{transform:rotate(360deg)}}@keyframes gw-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`)
        ));

    }

    if (isBanned) return /*#__PURE__*/React.createElement(window.BannedScreen, { userData: userData, lang: lang });

    // ── Computed values needed for render ──
    var fmtNum = window.fmtNum || ((n) => (n || 0).toLocaleString());
    var isMyTurn = room?.currentTurnUID === currentUID;
    var me = room?.players?.find((p) => p.uid === currentUID);
    var myRole = me?.role;
    var isSpectator = me?.status === 'spectator' || me?.status === 'ghost';
    var hasVoted = room?.votes?.[currentUID];
    var hasVotedWord = room?.wordVotes?.[currentUID];
    var totalFriendsUnread = (totalUnread || 0) + (friendRequests?.length || 0);

    return (/*#__PURE__*/
      React.createElement("div", { className: "app-shell", dir: lang === 'ar' ? 'rtl' : 'ltr' }, /*#__PURE__*/

        React.createElement("div", { className: "bg-blobs" }, /*#__PURE__*/
          React.createElement("div", { className: "bg-blob-item bg-blob-1" }), /*#__PURE__*/
          React.createElement("div", { className: "bg-blob-item bg-blob-2" }), /*#__PURE__*/
          React.createElement("div", { className: "bg-blob-item bg-blob-3" })
        ), /*#__PURE__*/
        React.createElement(window.NotificationToast, { message: notification, onClose: () => setNotification(null) }), /*#__PURE__*/

        React.createElement(window.GlobalModals, _extends({},
          gameActions, {
          user: user, userData: userData, currentUID: currentUID, currentUserData: currentUserData,
          isLoggedIn: isLoggedIn, isGuest: isGuest, lang: lang, setLang: setLang, t: t,
          friendsData: friendsData, coupleData: coupleData, partnerData: partnerData, userFamily: userFamily,
          sessionClaimedToday: sessionClaimedToday,
          setNotification: setNotification,
          showSendGiftModal: showSendGiftModal, setShowSendGiftModal: setShowSendGiftModal,
          sendGiftTarget: sendGiftTarget, setSendGiftTarget: setSendGiftTarget,
          openProfile: gameActions.openProfile,
          showOnboarding: showOnboarding, setShowOnboarding: setShowOnboarding,
          onboardingGoogleUser: onboardingGoogleUser, handleOnboardingComplete: handleOnboardingComplete,
          showLoginAlert: showLoginAlert, setShowLoginAlert: setShowLoginAlert,
          showTutorial: showTutorial, setShowTutorial: setShowTutorial,
          showLoginRewards: showLoginRewards, setShowLoginRewards: setShowLoginRewards, handleClaimLoginReward: handleClaimLoginReward,
          showSummary: showSummary, setShowSummary: setShowSummary,
          showFriendsMoments: showFriendsMoments, setShowFriendsMoments: setShowFriendsMoments,
          showFamilyModal: showFamilyModal, setShowFamilyModal: setShowFamilyModal, viewFamilyId: viewFamilyId, setViewFamilyId: setViewFamilyId,
          showFamilyChat: showFamilyChat, setShowFamilyChat: setShowFamilyChat,
          showBFFModal: showBFFModal, setShowBFFModal: setShowBFFModal,
          showDetectiveBot: showDetectiveBot, setShowDetectiveBot: setShowDetectiveBot,
          showLoveBot: showLoveBot, setShowLoveBot: setShowLoveBot,
          showMyAccount: showMyAccount, setShowMyAccount: setShowMyAccount,
          showUserProfile: showUserProfile, setShowUserProfile: setShowUserProfile, targetProfileUID: targetProfileUID, setTargetProfileUID: setTargetProfileUID,
          showBrowseRooms: showBrowseRooms, setShowBrowseRooms: setShowBrowseRooms,
          showPrivateChat: showPrivateChat, closePrivateChat: gameActions.closePrivateChat, chatFriend: chatFriend,
          showSelfChat: showSelfChat, setShowSelfChat: setShowSelfChat,
          showFunPass: showFunPass, setShowFunPass: setShowFunPass,
          alertMessage: alertMessage, setAlertMessage: setAlertMessage,
          showSetupModal: showSetupModal, setShowSetupModal: setShowSetupModal,
          showShop: showShop, setShowShop: setShowShop,
          showInventory: showInventory, setShowInventory: setShowInventory,
          showSettings: showSettings, setShowSettings: setShowSettings,
          showLuckyGames: showLuckyGames, setShowLuckyGames: setShowLuckyGames,
          showVIPCenter: showVIPCenter, setShowVIPCenter: setShowVIPCenter,
          showHelpCenter: showHelpCenter, setShowHelpCenter: setShowHelpCenter,
          showPublicChat: showPublicChat, setShowPublicChat: setShowPublicChat,
          showWeddingHall: showWeddingHall, setShowWeddingHall: setShowWeddingHall,
          showProposalModal: showProposalModal, setShowProposalModal: setShowProposalModal,
          proposalRing: proposalRing, setProposalRing: setProposalRing,
          showCoupleCard: showCoupleCard, setShowCoupleCard: setShowCoupleCard,
          showIncomingProposal: showIncomingProposal, setShowIncomingProposal: setShowIncomingProposal,
          incomingProposal: incomingProposal, incomingProposalFrom: incomingProposalFrom,
          showAdminPanel: showAdminPanel, setShowAdminPanel: setShowAdminPanel,
          nickname: nickname, setNickname: setNickname, setupMode: setupMode, setSetupMode: setSetupMode,
          isPrivate: isPrivate, setIsPrivate: setIsPrivate, password: password, setPassword: setPassword,
          showPassword: showPassword, setShowPassword: setShowPassword, loading: loading,
          bffInitialTab: bffInitialTab, setBffInitialTab: setBffInitialTab,
          room: room, roomId: roomId, notificationBellRef: notificationBellRef,
          showNotifications: showNotifications, setShowNotifications: setShowNotifications,
          notifications: notifications, unreadNotifications: unreadNotifications
        })
        ), /*#__PURE__*/


        React.createElement("header", { className: "new-header" }, /*#__PURE__*/
          React.createElement("div", { className: "new-logo" }, "PRO SPY"), /*#__PURE__*/
          React.createElement("div", { className: "new-header-right" },

            (isLoggedIn || isGuest) && currentUserData && /*#__PURE__*/
            React.createElement("div", {
              onClick: () => setShowShop(true),
              style: {
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', borderRadius: '20px', cursor: 'pointer',
                background: 'linear-gradient(135deg,rgba(0,242,255,0.12),rgba(112,0,255,0.10))',
                border: '1px solid rgba(0,242,255,0.25)',
                boxShadow: '0 0 8px rgba(0,242,255,0.12)',
                transition: 'all 0.2s'
              },
              title: lang === 'ar' ? 'رصيدك' : 'Your Intel'
            }, /*#__PURE__*/

              React.createElement("span", { style: { fontSize: '14px' } }, "\uD83E\uDDE0"), /*#__PURE__*/
              React.createElement("span", { style: { fontSize: '12px', fontWeight: 900, color: '#00f2ff', letterSpacing: '0.3px' } },
                fmtNum(currentUserData?.currency || 0)
              )
            ),


            isLoggedIn && /*#__PURE__*/
            React.createElement("button", {
              className: "new-hbtn", onClick: () => { if (!sessionClaimedToday) setShowLoginRewards(true); },
              title: lang === 'ar' ? 'مكافآت الدخول' : 'Login Rewards',
              style: { position: 'relative', opacity: sessionClaimedToday ? 0.5 : 1 }
            }, "\uD83C\uDF81",

              !sessionClaimedToday && /*#__PURE__*/React.createElement("span", { style: { position: 'absolute', top: '-3px', right: '-3px', width: '8px', height: '8px', background: '#f97316', borderRadius: '50%', border: '1.5px solid var(--bg-main)' } })
            ),


            isLoggedIn && /*#__PURE__*/
            React.createElement("div", { className: "new-notif-center notification-center", ref: notificationBellRef }, /*#__PURE__*/
              React.createElement("div", { className: "new-notif-bell notification-bell", onClick: () => setShowNotifications(!showNotifications) }, "\uD83D\uDD14",
                unreadNotifications > 0 && /*#__PURE__*/React.createElement("span", { className: "notification-badge" }, unreadNotifications > 9 ? '9+' : unreadNotifications)
              ), /*#__PURE__*/
              React.createElement(window.NotificationDropdown, { show: showNotifications, onClose: () => setShowNotifications(false), notifications: notifications, onMarkRead: gameActions.markNotificationRead, onClearAll: gameActions.clearAllNotifications, onNotificationClick: gameActions.handleNotificationClick, lang: lang })
            ),


            isLoggedIn && /*#__PURE__*/
            React.createElement("div", { className: "new-hbtn", onClick: () => setShowShop(true), title: t.shop }, "\uD83D\uDED2"), /*#__PURE__*/


            React.createElement("div", { style: { position: 'relative' } }, /*#__PURE__*/
              React.createElement("div", {
                className: "new-avatar-btn",
                onClick: () => {
                  if (isLoggedIn) { setShowMyAccount(true); } else
                    if (isGuest) { setShowMyAccount(true); } else { gameActions.handleGoogleLogin(); }
                },
                title: lang === 'ar' ? 'ملفي الشخصي' : 'My Profile'
              },
                (isLoggedIn || isGuest) && (currentUserData?.photoURL || currentUserData?.photo) ? /*#__PURE__*/
                  React.createElement("img", { src: currentUserData.photoURL || currentUserData.photo, style: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }, alt: "" }) : /*#__PURE__*/
                  React.createElement("span", { style: { fontSize: '16px' } }, "\uD83D\uDE0E")

              )
            )
          )
        ), /*#__PURE__*/


        React.createElement("div", { className: "new-page-content" },


          !room && (activeView === 'lobby' || activeView === 'ranking') && /*#__PURE__*/
          React.createElement("div", {
            style: {
              display: 'flex', gap: '4px', padding: '10px 16px 0', marginBottom: '2px',
              borderBottom: '1px solid rgba(255,255,255,0.06)'
            }
          }, /*#__PURE__*/
            React.createElement("button", {
              onClick: () => setActiveView('lobby'),
              style: {
                flex: 1, padding: '9px 0', borderRadius: '10px 10px 0 0', border: 'none',
                background: activeView === 'lobby' ? 'rgba(0,242,255,0.1)' : 'rgba(255,255,255,0.03)',
                color: activeView === 'lobby' ? '#00f2ff' : '#6b7280',
                borderBottom: activeView === 'lobby' ? '2px solid #00f2ff' : '2px solid transparent',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
              }
            },
              "\uD83C\uDFE0 ", lang === 'ar' ? 'اللوبي' : 'Lobby'), /*#__PURE__*/
            React.createElement("button", {
              onClick: () => setActiveView('ranking'),
              style: {
                flex: 1, padding: '9px 0', borderRadius: '10px 10px 0 0', border: 'none',
                background: activeView === 'ranking' ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.03)',
                color: activeView === 'ranking' ? '#ffd700' : '#6b7280',
                borderBottom: activeView === 'ranking' ? '2px solid #ffd700' : '2px solid transparent',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
              }
            },
              "\uD83D\uDCCA ", lang === 'ar' ? 'رانكينج' : 'Ranking')
          ),



          !room && activeView === 'lobby' && /*#__PURE__*/
          React.createElement(window.LobbyView, {
            currentUserData: currentUserData, user: user, lang: lang, t: t,
            isLoggedIn: isLoggedIn, isGuest: isGuest,
            nickname: nickname, setNickname: setNickname,
            showFunPass: showFunPass, setShowFunPass: setShowFunPass,
            inputCode: inputCode, setInputCode: setInputCode,
            loading: loading, joinError: joinError,
            handleJoinGame: gameActions.handleJoinGame,
            handleCreateGame: gameActions.handleCreateGame,
            setShowSetupModal: setShowSetupModal,
            setShowBrowseRooms: setShowBrowseRooms,
            setShowMyAccount: setShowMyAccount,
            setShowPublicChat: setShowPublicChat,
            setShowLuckyGames: setShowLuckyGames,
            setNotification: setNotification,
            currentUID: currentUID,
            sessionClaimedToday: sessionClaimedToday,
            requireLogin: () => setShowLoginAlert(true)
          }
          ),




          !room && activeView === 'ranking' && window.RankingView && /*#__PURE__*/
          React.createElement(window.RankingView, {
            leaderboardTab: leaderboardTab, setLeaderboardTab: setLeaderboardTab,
            leaderboardData: leaderboardData, charismaLeaderboard: charismaLeaderboard, familyLeaderboard: familyLeaderboard,
            lang: lang, t: t, openProfile: gameActions.openProfile,
            setViewFamilyId: setViewFamilyId, setShowFamilyModal: setShowFamilyModal,
            userFamily: userFamily, isLoggedIn: isLoggedIn
          }
          ),



          !room && activeView === 'chat' && /*#__PURE__*/
          React.createElement("div", { style: { paddingBottom: '8px' } },

            isGuest && !isLoggedIn && /*#__PURE__*/
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '16px', textAlign: 'center' } }, /*#__PURE__*/
              React.createElement("div", { style: { fontSize: '48px' } }, "\uD83D\uDD10"), /*#__PURE__*/
              React.createElement("div", { style: { fontSize: '16px', fontWeight: 800, color: '#e5e7eb' } }, lang === 'ar' ? 'سجّل دخولك أولاً' : 'Login Required'), /*#__PURE__*/
              React.createElement("div", { style: { fontSize: '12px', color: '#6b7280', maxWidth: '240px' } }, lang === 'ar' ? 'سجّل الدخول بجوجل للوصول للأصدقاء والجروبات' : 'Sign in with Google to access friends & groups'), /*#__PURE__*/
              React.createElement("button", { onClick: gameActions.handleGoogleLogin, style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 24px', borderRadius: '14px', background: 'linear-gradient(135deg,#4285f4,#1a73e8)', border: 'none', color: '#fff', fontWeight: 800, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(66,133,244,0.4)' } }, /*#__PURE__*/
                React.createElement("span", { style: { fontSize: '18px' } }, "\uD83D\uDD11"), " ", lang === 'ar' ? 'تسجيل الدخول بجوجل' : 'Sign in with Google'
              )
            ),


            (!isGuest || isLoggedIn) && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/
              React.createElement("div", { style: { display: 'flex', gap: '4px', padding: '10px 16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '10px' } }, /*#__PURE__*/
                React.createElement("button", {
                  onClick: () => setChatSubTab('friends'),
                  style: { flex: 1, padding: '8px 0', borderRadius: '10px 10px 0 0', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, background: 'transparent', color: chatSubTab === 'friends' ? '#00f2ff' : '#6b7280', borderBottom: chatSubTab === 'friends' ? '2px solid #00f2ff' : '2px solid transparent', transition: 'all 0.2s' }
                }, "\uD83D\uDC65 ",
                  lang === 'ar' ? 'الأصدقاء' : t.tabFriends,
                  friendRequests.length > 0 && /*#__PURE__*/React.createElement("span", { style: { marginLeft: '4px', fontSize: '9px', background: 'var(--accent)', color: '#fff', borderRadius: '10px', padding: '1px 5px', fontWeight: 700 } }, friendRequests.length)
                ), /*#__PURE__*/
                React.createElement("button", {
                  onClick: () => setChatSubTab('groups'),
                  style: { flex: 1, padding: '8px 0', borderRadius: '10px 10px 0 0', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, background: 'transparent', color: chatSubTab === 'groups' ? '#a78bfa' : '#6b7280', borderBottom: chatSubTab === 'groups' ? '2px solid #a78bfa' : '2px solid transparent', transition: 'all 0.2s' }
                }, "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67 ",
                  lang === 'ar' ? 'الجروبات' : 'Groups'
                )
              ), /*#__PURE__*/


              React.createElement("div", { style: { display: chatSubTab === 'friends' ? 'block' : 'none' } }, /*#__PURE__*/

                React.createElement("div", { style: { margin: '0 16px 10px', display: 'flex', gap: '8px' } }, /*#__PURE__*/
                  React.createElement("input", { type: "text", className: "hero-input", style: { flex: 1, padding: '9px 13px', fontSize: '12px' }, value: addFriendId, onChange: (e) => setAddFriendId(e.target.value), placeholder: t.friendIdPlaceholder }), /*#__PURE__*/
                  React.createElement("button", { onClick: gameActions.handleAddFriendById, disabled: !addFriendId.trim(), className: "hero-btn-primary", style: { padding: '9px 14px', fontSize: '12px' } }, "+ ", lang === 'ar' ? 'أضف' : 'Add')
                ),
                friendSearchMsg && /*#__PURE__*/React.createElement("p", { style: { fontSize: '11px', textAlign: 'center', padding: '0 16px 8px', color: friendSearchMsg.includes('تم') || friendSearchMsg.includes('Sent') ? '#4ade80' : '#ff4d4d' } }, friendSearchMsg),


                isLoggedIn && /*#__PURE__*/
                React.createElement("div", { style: { margin: '0 16px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' } }, /*#__PURE__*/
                  React.createElement("div", { style: { fontSize: '9px', fontWeight: 700, color: '#6b7280', padding: '6px 14px 4px', textTransform: 'uppercase', letterSpacing: '1px' } }, "\uD83E\uDD16 ", lang === 'ar' ? 'قنوات رسمية' : 'Official Channels'), /*#__PURE__*/

                  React.createElement("div", { onClick: () => setShowDetectiveBot(true), style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: detectiveBotUnread > 0 ? 'rgba(0,212,255,0.05)' : 'transparent' }, className: "me-friend-row" }, /*#__PURE__*/
                    React.createElement("div", { style: { position: 'relative', flexShrink: 0 } }, /*#__PURE__*/
                      React.createElement("div", { style: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(0,212,255,0.25),rgba(0,212,255,0.1))', border: '1.5px solid rgba(0,212,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' } }, "\uD83D\uDD75\uFE0F"),
                      detectiveBotUnread > 0 && /*#__PURE__*/React.createElement("div", { style: { position: 'absolute', top: '-2px', right: '-2px', width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', border: '1.5px solid var(--bg-main)' } })
                    ), /*#__PURE__*/
                    React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
                      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '5px' } }, /*#__PURE__*/
                        React.createElement("span", { style: { fontSize: '13px', fontWeight: detectiveBotUnread > 0 ? 800 : 600, color: detectiveBotUnread > 0 ? '#e2e8f0' : '#9ca3af' } }, lang === 'ar' ? 'المحقق' : 'The Detective'), /*#__PURE__*/
                        React.createElement("span", { style: { fontSize: '8px', fontWeight: 900, background: '#00d4ff', color: '#000', padding: '1px 4px', borderRadius: '3px' } }, "OFFICIAL")
                      ), /*#__PURE__*/
                      React.createElement("div", { style: { fontSize: '11px', color: '#6b7280' } }, lang === 'ar' ? 'البلاغات والردود' : 'Reports & Responses')
                    )
                  ), /*#__PURE__*/

                  React.createElement("div", { onClick: () => setShowLoveBot(true), style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: loveBotUnread > 0 ? 'rgba(249,168,212,0.05)' : 'transparent' }, className: "me-friend-row" }, /*#__PURE__*/
                    React.createElement("div", { style: { position: 'relative', flexShrink: 0 } }, /*#__PURE__*/
                      React.createElement("div", { style: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(249,168,212,0.25),rgba(249,168,212,0.1))', border: '1.5px solid rgba(249,168,212,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' } }, "\uD83D\uDC8C"),
                      (loveBotUnread > 0 || bffUnreadCount > 0) && /*#__PURE__*/React.createElement("div", { style: { position: 'absolute', top: '-2px', right: '-2px', width: '10px', height: '10px', borderRadius: '50%', background: '#ec4899', border: '1.5px solid var(--bg-main)' } })
                    ), /*#__PURE__*/
                    React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
                      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '5px' } }, /*#__PURE__*/
                        React.createElement("span", { style: { fontSize: '13px', fontWeight: loveBotUnread > 0 || bffUnreadCount > 0 ? 800 : 600, color: loveBotUnread > 0 || bffUnreadCount > 0 ? '#e2e8f0' : '#9ca3af' } }, lang === 'ar' ? 'دواء بوت' : 'Dawa Bot'), /*#__PURE__*/
                        React.createElement("span", { style: { fontSize: '8px', fontWeight: 900, background: '#f9a8d4', color: '#000', padding: '1px 4px', borderRadius: '3px' } }, "OFFICIAL")
                      ), /*#__PURE__*/
                      React.createElement("div", { style: { fontSize: '11px', color: '#6b7280' } }, lang === 'ar' ? 'إشعارات الزواج و BFF' : 'Wedding & BFF Notifications')
                    )
                  )
                ),



                friendRequests.length > 0 && /*#__PURE__*/
                React.createElement("div", { style: { margin: '0 16px 10px', background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: '12px', overflow: 'hidden' } }, /*#__PURE__*/
                  React.createElement("div", { style: { fontSize: '10px', fontWeight: 700, color: 'var(--gold)', padding: '8px 14px 4px', textTransform: 'uppercase', letterSpacing: '1px' } }, "\u23F3 ", lang === 'ar' ? 'طلبات صداقة' : 'Friend Requests', " (", friendRequests.length, ")"),
                  friendRequests.map((req) => /*#__PURE__*/
                    React.createElement("div", { key: req.id, style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.04)' } }, /*#__PURE__*/
                      React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                        window.PlayerNameTag ? /*#__PURE__*/
                          React.createElement(window.PlayerNameTag, { player: req, lang: lang, size: "sm" }) : /*#__PURE__*/
                          React.createElement("span", { style: { fontSize: '13px', color: '#e2e8f0' } }, req.displayName || req.name)
                      ), /*#__PURE__*/
                      React.createElement("button", { onClick: () => gameActions.handleAcceptRequest && gameActions.handleAcceptRequest(req.id), style: { padding: '4px 10px', borderRadius: '8px', background: '#00ff88', color: '#000', fontSize: '11px', fontWeight: 700, border: 'none', cursor: 'pointer' } }, t.accept, " \u2713"), /*#__PURE__*/
                      React.createElement("button", { onClick: () => gameActions.handleRejectRequest && gameActions.handleRejectRequest(req.id), style: { padding: '4px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.07)', color: 'var(--text-muted)', fontSize: '11px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' } }, "\u2715")
                    )
                  )
                ), /*#__PURE__*/



                React.createElement("div", { style: { margin: '0 16px', background: 'var(--new-card)', border: '1px solid var(--new-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' } },

                  isLoggedIn && currentUserData && /*#__PURE__*/
                  React.createElement("div", { onClick: () => setShowSelfChat(true), style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: '1px solid var(--new-border)', cursor: 'pointer' }, className: "me-friend-row" }, /*#__PURE__*/
                    React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                      window.PlayerNameTag ? /*#__PURE__*/
                        React.createElement(window.PlayerNameTag, { player: currentUserData, lang: lang, size: "sm" }) : /*#__PURE__*/
                        React.createElement("span", { style: { fontSize: '13px', fontWeight: 700, color: '#e2e8f0' } }, currentUserData.displayName)
                    ), /*#__PURE__*/
                    React.createElement("div", { style: { fontSize: '9px', fontWeight: 700, color: 'var(--primary)', background: 'rgba(0,242,255,0.1)', border: '1px solid rgba(0,242,255,0.25)', borderRadius: '6px', padding: '2px 7px', flexShrink: 0 } }, "\uD83D\uDCAC ", lang === 'ar' ? 'شاتي' : 'My Chat')
                  ),


                  isLoggedIn && userFamily && (() => {
                    var readAt = userFamily.chatReadBy?.[currentUID];
                    var lastChatAt = userFamily.lastChatAt;
                    var hasUnread = lastChatAt && readAt ?
                      (lastChatAt.toDate ? lastChatAt.toDate() : new Date(lastChatAt.seconds * 1000)) > (readAt.toDate ? readAt.toDate() : new Date(readAt.seconds * 1000)) && userFamily.lastChatSenderId !== currentUID :
                      !!lastChatAt && userFamily.lastChatSenderId !== currentUID;
                    var familyWeeklyAct = userFamily.lastWeekActiveness !== undefined ? userFamily.lastWeekActiveness : userFamily.weeklyActiveness || 0;
                    var getFamilySignLvlData = window.FamilyConstants ? window.FamilyConstants.getFamilySignLevelData : null;
                    var signData = getFamilySignLvlData ? getFamilySignLvlData(familyWeeklyAct) : { level: 1, color: '#6b7280', imageURL: 'icos/Family Sign1.png' };
                    var signImageURL = signData ? signData.imageURL : null;
                    return (/*#__PURE__*/
                      React.createElement("div", { onClick: () => setShowFamilyChat(true), style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: '1px solid var(--new-border)', cursor: 'pointer', background: hasUnread ? 'linear-gradient(135deg,rgba(255,136,0,0.06),rgba(255,80,0,0.04))' : 'transparent' }, className: "me-friend-row" }, /*#__PURE__*/
                        React.createElement("div", { style: { position: 'relative', flexShrink: 0 } }, /*#__PURE__*/
                          React.createElement("div", { style: { width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,rgba(255,136,0,0.2),rgba(255,80,0,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '1.5px solid rgba(255,136,0,0.3)' } },
                            userFamily.photoURL ? /*#__PURE__*/React.createElement("img", { src: userFamily.photoURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover' } }) : userFamily.emblem || '🏠'
                          ),
                          hasUnread && /*#__PURE__*/React.createElement("div", { style: { position: 'absolute', top: '-2px', right: '-2px', width: '10px', height: '10px', borderRadius: '50%', background: '#f97316', border: '1.5px solid var(--bg-main)' } })
                        ), /*#__PURE__*/
                        React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
                          React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } }, /*#__PURE__*/
                            React.createElement("span", { style: { fontSize: '13px', fontWeight: hasUnread ? 800 : 600, color: hasUnread ? '#f97316' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' } }, userFamily.name),
                            window.FamilySignBadge && signData ? /*#__PURE__*/
                              React.createElement("div", { style: { transform: 'scale(0.85)', transformOrigin: 'left center' } }, /*#__PURE__*/
                                React.createElement(window.FamilySignBadge, { tag: userFamily.tag || 'FAM', color: signData.color, signLevel: signData.level, imageURL: signImageURL, small: true })
                              ) :
                              signData && /*#__PURE__*/React.createElement("span", { style: { fontSize: '9px', fontWeight: 800, color: signData.color, background: `${signData.color}20`, border: `1px solid ${signData.color}44`, borderRadius: '4px', padding: '1px 5px' } }, userFamily.tag || 'FAM')
                          ), /*#__PURE__*/
                          React.createElement("div", { style: { fontSize: '11px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, userFamily.lastChatMessage || (lang === 'ar' ? 'شات العائلة' : 'Family Chat'))
                        ), /*#__PURE__*/
                        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 } }, /*#__PURE__*/
                          React.createElement("div", { style: { fontSize: '9px', fontWeight: 700, color: '#f97316', background: 'rgba(255,136,0,0.1)', border: '1px solid rgba(255,136,0,0.25)', borderRadius: '6px', padding: '2px 7px', cursor: 'pointer' }, onClick: (e) => { e.stopPropagation(); setShowFamilyModal(true); } }, "\uD83C\uDFE0 ", lang === 'ar' ? 'عائلة' : 'Family')
                        )
                      ));

                  })(),

                  friendsData.length === 0 ? /*#__PURE__*/
                    React.createElement("div", { style: { padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' } }, "\uD83D\uDC65 ", t.noFriends) :
                    (() => {
                      var online = friendsData.filter((f) => f.onlineStatus === 'online');
                      var away = friendsData.filter((f) => f.onlineStatus === 'away');
                      var offline = friendsData.filter((f) => !f.onlineStatus || f.onlineStatus === 'offline');
                      var statusColor = (f) => f.onlineStatus === 'online' ? '#4ade80' : f.onlineStatus === 'away' ? '#facc15' : '#6b7280';
                      var renderFriend = (friend) => {
                        var fVipLevel = typeof window.getVIPLevel === 'function' ? window.getVIPLevel(friend) || 0 : 0;
                        var fVipCfg = window.getVIPConfig ? window.getVIPConfig(fVipLevel) : null;
                        var fEquipped = friend.equipped || {};
                        var fBadgeIds = (fEquipped.badges || []).slice(0, 3);
                        var fTitleId = fEquipped.titles || null;
                        var fTitleItem = fTitleId && typeof SHOP_ITEMS !== 'undefined' ? SHOP_ITEMS.titles?.find((tt) => tt.id === fTitleId) : null;
                        var sc = statusColor(friend);
                        return (/*#__PURE__*/
                          React.createElement("div", { key: friend.id, onClick: () => gameActions.openProfile(friend.id), style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: '1px solid var(--new-border)', cursor: 'pointer' }, className: "me-friend-row" }, /*#__PURE__*/
                            React.createElement("div", { style: { position: 'relative', flexShrink: 0 } }, /*#__PURE__*/
                              React.createElement(window.AvatarWithFrame, {
                                photoURL: friend.photoURL,
                                equipped: friend.equipped || { frames: friend.equippedFrame },
                                size: "sm",
                                lang: lang,
                                status: friend.onlineStatus || 'offline'
                              }),
                              React.createElement("div", { style: { position: 'absolute', bottom: '0px', right: '0px', width: '9px', height: '9px', borderRadius: '50%', background: sc, border: '1.5px solid #0a0a14', zIndex: 11 } })
                            ), /*#__PURE__*/
                            React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
                              React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'nowrap', marginBottom: fBadgeIds.length > 0 || fTitleItem ? '2px' : '0' } }, /*#__PURE__*/
                                React.createElement("span", { style: { fontSize: '13px', fontWeight: 700, color: fVipCfg ? fVipCfg.nameColor : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '130px', textShadow: fVipCfg ? `0 0 8px ${fVipCfg.nameColor}55` : 'none' } }, friend.displayName || friend.name || '—'),
                                fVipLevel > 0 && fVipCfg && /*#__PURE__*/React.createElement("span", { style: { fontSize: '7px', fontWeight: 900, background: fVipCfg.nameColor, color: '#000', padding: '1px 3px', borderRadius: '2px', flexShrink: 0 } }, "VIP", fVipLevel),
                                friend.staffRole?.role && window.StaffRoleBadge && /*#__PURE__*/React.createElement(window.StaffRoleBadge, { userData: friend, uid: friend.id, lang: lang, size: "sm" })
                              ),
                              fBadgeIds.length > 0 && typeof SHOP_ITEMS !== 'undefined' && /*#__PURE__*/
                              React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '2px' } },
                                fBadgeIds.map((bid, idx) => {
                                  var b = SHOP_ITEMS.badges?.find((b) => b.id === bid);
                                  if (!b) return null;
                                  return b.imageUrl && b.imageUrl.trim() !== '' ? /*#__PURE__*/React.createElement("img", { key: idx, src: b.imageUrl, alt: "", style: { width: '13px', height: '13px', objectFit: 'contain' } }) : /*#__PURE__*/React.createElement("span", { key: idx, style: { fontSize: '11px', lineHeight: 1 } }, b.preview);
                                })
                              ),

                              fTitleItem && /*#__PURE__*/
                              React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '2px' } },
                                fTitleItem.imageUrl && fTitleItem.imageUrl.trim() !== '' ? /*#__PURE__*/React.createElement("img", { src: fTitleItem.imageUrl, alt: "", style: { maxWidth: '70px', maxHeight: '12px', objectFit: 'contain' } }) : /*#__PURE__*/React.createElement("span", { style: { fontSize: '9px', color: '#a78bfa', lineHeight: 1, whiteSpace: 'nowrap' } }, "\uD83C\uDF10 ", lang === 'ar' ? fTitleItem.name_ar : fTitleItem.name_en)
                              )

                            ), /*#__PURE__*/
                            React.createElement("button", { onClick: (e) => { e.stopPropagation(); gameActions.openPrivateChat && gameActions.openPrivateChat(friend); }, className: "btn-ghost", style: { padding: '5px 8px', borderRadius: '8px', fontSize: '12px', flexShrink: 0 } }, "\uD83D\uDCAC")
                          ));

                      };
                      return /*#__PURE__*/React.createElement(React.Fragment, null,
                        online.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", { style: { fontSize: '9px', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', padding: '8px 14px 4px', display: 'flex', alignItems: 'center', gap: '5px' } }, /*#__PURE__*/React.createElement("span", { style: { width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' } }), t.online, " (", online.length, ")"), online.map(renderFriend)),
                        away.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", { style: { fontSize: '9px', fontWeight: 700, color: '#facc15', textTransform: 'uppercase', padding: '8px 14px 4px', display: 'flex', alignItems: 'center', gap: '5px' } }, /*#__PURE__*/React.createElement("span", { style: { width: '6px', height: '6px', borderRadius: '50%', background: '#facc15', display: 'inline-block' } }), lang === 'ar' ? 'بعيد' : 'Away', " (", away.length, ")"), away.map(renderFriend)),
                        offline.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", { style: { fontSize: '9px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', padding: '8px 14px 4px', display: 'flex', alignItems: 'center', gap: '5px' } }, /*#__PURE__*/React.createElement("span", { style: { width: '6px', height: '6px', borderRadius: '50%', background: '#6b7280', display: 'inline-block' } }), t.offline, " (", offline.length, ")"), offline.map(renderFriend))
                      );
                    })()
                )
              ), /*#__PURE__*/


              React.createElement("div", { style: { display: chatSubTab === 'groups' ? 'block' : 'none' } },
                window.GroupsSection && /*#__PURE__*/
                React.createElement(window.GroupsSection, {
                  currentUser: user,
                  currentUserData: currentUserData,
                  currentUID: currentUID,
                  friendsData: friendsData,
                  lang: lang,
                  onNotification: setNotification,
                  isLoggedIn: isLoggedIn,
                  onOpenProfile: gameActions.openProfile
                }
                )

              )
            )
          ),



          !room && activeView === 'discover' && /*#__PURE__*/
          React.createElement("div", { style: { paddingBottom: '8px' } }, /*#__PURE__*/
            React.createElement("div", { className: "sec-head-new", style: { paddingTop: '14px' } }, /*#__PURE__*/
              React.createElement("span", { className: "sec-title-new" }, "\uD83D\uDD25 ", lang === 'ar' ? 'اكتشف' : 'Discover')
            ), /*#__PURE__*/
            React.createElement("div", { className: "discover-grid", style: { gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' } }, /*#__PURE__*/

              React.createElement("div", {
                className: "discover-sq",
                style: {
                  '--dsq-bg': 'linear-gradient(145deg,rgba(0,242,255,0.12),rgba(112,0,255,0.08))',
                  '--dsq-border': 'rgba(0,242,255,0.3)',
                  padding: '18px 12px',
                  gridColumn: 'span 2',
                  aspectRatio: '2 / 1.2'
                },
                onClick: () => { setShowFriendsMoments(true); setHasNewMoments(false); localStorage.setItem('last_moments_view', Date.now().toString()); }
              },

                hasNewMoments && /*#__PURE__*/React.createElement("div", { className: "dsq-dot", style: { background: '#ff4b4b', boxShadow: '0 0 10px #ff4b4b', width: '10px', height: '10px' } }), /*#__PURE__*/
                React.createElement("div", { className: "dsq-icon", style: { background: 'linear-gradient(135deg,rgba(0,242,255,0.25),rgba(112,0,255,0.2))', width: '56px', height: '56px', fontSize: '28px' } }, "\uD83D\uDCF8"), /*#__PURE__*/
                React.createElement("div", { className: "dsq-label", style: { fontSize: '14px' } }, lang === 'ar' ? 'مومنت الأصدقاء' : 'Friends Moments'), /*#__PURE__*/
                React.createElement("div", { style: { fontSize: '10px', color: 'var(--text-muted)', marginTop: '-4px' } }, lang === 'ar' ? 'شارك لحظاتك مع أصدقائك' : 'Share moments with friends')
              ), /*#__PURE__*/


              React.createElement("div", {
                className: "discover-sq",
                style: {
                  '--dsq-bg': 'linear-gradient(145deg,rgba(236,72,153,0.12),rgba(168,85,247,0.08))',
                  '--dsq-border': 'rgba(236,72,153,0.3)',
                  padding: '18px 12px'
                },
                onClick: () => {
                  if (!isLoggedIn) { setShowLoginAlert(true); return; }
                  setShowWeddingHall(true);
                }
              },

                coupleData && /*#__PURE__*/React.createElement("div", { className: "dsq-dot", style: { background: '#ec4899' } }), /*#__PURE__*/
                React.createElement("div", { className: "dsq-icon", style: { background: 'linear-gradient(135deg,rgba(236,72,153,0.25),rgba(168,85,247,0.2))' } },
                  coupleData && partnerData?.photoURL ? /*#__PURE__*/
                    React.createElement("img", { src: partnerData.photoURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' } }) :
                    '💍'

                ), /*#__PURE__*/
                React.createElement("div", { className: "dsq-label" }, lang === 'ar' ? 'الكابلز' : 'Couples'),
                coupleData && partnerData && /*#__PURE__*/
                React.createElement("div", { style: { fontSize: '9px', color: '#f9a8d4', textAlign: 'center', fontWeight: 600, maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, partnerData.displayName)

              ), /*#__PURE__*/


              React.createElement("div", {
                className: "discover-sq",
                style: {
                  '--dsq-bg': 'linear-gradient(145deg,rgba(255,136,0,0.1),rgba(255,80,0,0.06))',
                  '--dsq-border': 'rgba(255,136,0,0.28)',
                  padding: '18px 12px'
                },
                onClick: () => setShowFamilyModal(true)
              },

                userFamily && /*#__PURE__*/React.createElement("div", { className: "dsq-dot", style: { background: '#f97316' } }), /*#__PURE__*/
                React.createElement("div", { className: "dsq-icon", style: { background: 'linear-gradient(135deg,rgba(255,136,0,0.22),rgba(255,80,0,0.12))' } },
                  userFamily?.photoURL ? /*#__PURE__*/
                    React.createElement("img", { src: userFamily.photoURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' } }) :
                    userFamily?.emblem || '🏠'

                ), /*#__PURE__*/
                React.createElement("div", { className: "dsq-label" }, lang === 'ar' ? 'العائلة' : 'Family'),
                userFamily && /*#__PURE__*/
                React.createElement("div", { style: { fontSize: '9px', color: '#fb923c', textAlign: 'center', fontWeight: 600, maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, userFamily.name)

              )
            )
          ),



          !room && activeView === 'me' && /*#__PURE__*/
          React.createElement("div", { style: { paddingBottom: '8px' } },

            (isLoggedIn || isGuest) && currentUserData ? /*#__PURE__*/
              React.createElement("div", { className: "me-hero-card", onClick: () => setShowMyAccount(true) }, /*#__PURE__*/
                React.createElement("div", { className: "me-hero-avatar" },
                  currentUserData.photoURL || currentUserData.photo ? /*#__PURE__*/
                    React.createElement("img", { src: currentUserData.photoURL || currentUserData.photo, alt: "", style: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' } }) : /*#__PURE__*/
                    React.createElement("span", { style: { fontSize: '36px' } }, "\uD83D\uDE0E")

                ), /*#__PURE__*/
                React.createElement("div", { className: "me-hero-info" }, /*#__PURE__*/
                  React.createElement("div", { className: "me-hero-name" }, currentUserData.displayName || currentUserData.name || (lang === 'ar' ? 'مستخدم' : 'User')), /*#__PURE__*/
                  React.createElement("div", { className: "me-hero-id" }, currentUserData?.customId ? `#${currentUserData.customId}` : `ID: ${currentUID?.slice(0, 8) || '—'}`), /*#__PURE__*/
                  React.createElement("div", { className: "me-hero-stats-row" }, /*#__PURE__*/
                    React.createElement("span", null, "\uD83C\uDFC6 ", currentUserData?.stats?.wins || 0), /*#__PURE__*/
                    React.createElement("span", null, "\u2B50 ", fmtNum(currentUserData?.charisma || 0)), /*#__PURE__*/
                    React.createElement("span", null, "\uD83E\uDDE0 ", fmtNum(currentUserData?.currency || 0))
                  )
                ), /*#__PURE__*/
                React.createElement("div", { style: { fontSize: '16px', color: 'var(--text-muted)', flexShrink: 0 } }, "\u203A")
              ) : /*#__PURE__*/

              React.createElement("div", { className: "me-hero-card", onClick: () => gameActions.handleGoogleLogin() }, /*#__PURE__*/
                React.createElement("div", { className: "me-hero-avatar", style: { background: 'rgba(255,255,255,0.06)' } }, /*#__PURE__*/
                  React.createElement("span", { style: { fontSize: '28px' } }, "\uD83D\uDD10")
                ), /*#__PURE__*/
                React.createElement("div", { className: "me-hero-info" }, /*#__PURE__*/
                  React.createElement("div", { className: "me-hero-name" }, lang === 'ar' ? 'سجّل دخول' : 'Sign In'), /*#__PURE__*/
                  React.createElement("div", { className: "me-hero-id" }, lang === 'ar' ? 'للاستمتاع بكل الميزات' : 'Unlock all features')
                ), /*#__PURE__*/
                React.createElement("div", { style: { fontSize: '16px', color: 'var(--primary)', flexShrink: 0 } }, "\u203A")
              ),



            isGuest && !isLoggedIn && /*#__PURE__*/
            React.createElement("div", { style: { margin: '10px 16px 4px', padding: '14px 16px', borderRadius: '16px', background: 'linear-gradient(135deg,rgba(66,133,244,0.13),rgba(26,115,232,0.08))', border: '1px solid rgba(66,133,244,0.28)', display: 'flex', alignItems: 'center', gap: '12px' } }, /*#__PURE__*/
              React.createElement("span", { style: { fontSize: '28px', flexShrink: 0 } }, "\uD83D\uDD11"), /*#__PURE__*/
              React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
                React.createElement("div", { style: { fontSize: '13px', fontWeight: 800, color: '#e5e7eb', marginBottom: '2px' } }, lang === 'ar' ? 'سجّل دخولك بجوجل' : 'Sign in with Google'), /*#__PURE__*/
                React.createElement("div", { style: { fontSize: '11px', color: '#6b7280' } }, lang === 'ar' ? 'احفظ تقدمك واستمتع بكل الميزات' : 'Save progress & unlock all features')
              ), /*#__PURE__*/
              React.createElement("button", { onClick: gameActions.handleGoogleLogin, style: { flexShrink: 0, padding: '8px 14px', borderRadius: '10px', background: 'linear-gradient(135deg,#4285f4,#1a73e8)', border: 'none', color: '#fff', fontWeight: 800, fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' } },
                lang === 'ar' ? 'دخول' : 'Login'
              )
            ), /*#__PURE__*/



            React.createElement("div", { className: "sec-head-new", style: { paddingTop: '14px' } }, /*#__PURE__*/
              React.createElement("span", { className: "sec-title-new" }, lang === 'ar' ? 'الإعدادات والأدوات' : 'Settings & Tools')
            ), /*#__PURE__*/
            React.createElement("div", { className: "me-actions-grid" },

              isLoggedIn && /*#__PURE__*/
              React.createElement("div", {
                className: "me-action-card", onClick: () => setShowLuckyGames(true),
                style: { background: 'linear-gradient(135deg,rgba(123,63,255,0.14),rgba(255,140,0,0.09))', border: '1px solid rgba(255,215,0,0.28)' }
              }, /*#__PURE__*/
                React.createElement("div", { className: "me-action-icon", style: { background: 'rgba(123,63,255,0.2)' } }, "\uD83C\uDFB0"), /*#__PURE__*/
                React.createElement("div", { className: "me-action-label", style: { color: '#FFD700' } }, lang === 'ar' ? 'ألعاب الحظ' : 'Lucky Games')
              ),

              isLoggedIn && /*#__PURE__*/
              React.createElement("div", { className: "me-action-card", onClick: () => setShowInventory(true) }, /*#__PURE__*/
                React.createElement("div", { className: "me-action-icon", style: { background: 'rgba(112,0,255,0.15)' } }, "\uD83D\uDCE6"), /*#__PURE__*/
                React.createElement("div", { className: "me-action-label" }, lang === 'ar' ? 'حقيبتي' : t.inventory)
              ),

              isLoggedIn && /*#__PURE__*/
              React.createElement("div", { className: "me-action-card", onClick: () => setShowShop(true) }, /*#__PURE__*/
                React.createElement("div", { className: "me-action-icon", style: { background: 'rgba(255,215,0,0.12)' } }, "\uD83D\uDED2"), /*#__PURE__*/
                React.createElement("div", { className: "me-action-label" }, lang === 'ar' ? 'المتجر' : t.shop)
              ),

              isLoggedIn && /*#__PURE__*/
              React.createElement("div", {
                className: "me-action-card", onClick: () => setShowVIPCenter(true),
                style: { background: 'linear-gradient(135deg,rgba(255,215,0,0.08),rgba(255,140,0,0.05))', border: '1px solid rgba(255,215,0,0.2)' }
              }, /*#__PURE__*/
                React.createElement("div", { className: "me-action-icon", style: { background: 'rgba(255,215,0,0.15)' } }, "\uD83D\uDC51"), /*#__PURE__*/
                React.createElement("div", { className: "me-action-label", style: { color: '#ffd700' } }, lang === 'ar' ? 'VIP سنتر' : 'VIP Center')
              ), /*#__PURE__*/

              React.createElement("div", { className: "me-action-card", onClick: () => setShowHelpCenter(true) }, /*#__PURE__*/
                React.createElement("div", { className: "me-action-icon", style: { background: 'rgba(0,242,255,0.1)' } }, "\uD83D\uDCAC"), /*#__PURE__*/
                React.createElement("div", { className: "me-action-label" }, lang === 'ar' ? 'مركز المساعدة' : 'Help Center')
              ), /*#__PURE__*/
              React.createElement("div", { className: "me-action-card", onClick: () => setShowSettings(true) }, /*#__PURE__*/
                React.createElement("div", { className: "me-action-icon", style: { background: 'rgba(255,255,255,0.07)' } }, "\u2699\uFE0F"), /*#__PURE__*/
                React.createElement("div", { className: "me-action-label" }, lang === 'ar' ? 'الإعدادات' : t.settings || 'Settings')
              )
            ),


            (isLoggedIn || isGuest) && /*#__PURE__*/
            React.createElement("div", { style: { margin: '14px 16px 0' } }, /*#__PURE__*/
              React.createElement("button", { onClick: gameActions.handleLogout, style: { width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,0,85,0.1)', border: '1px solid rgba(255,0,85,0.25)', color: '#ff4d6d', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: '.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' } }, "\uD83D\uDEAA ",
                lang === 'ar' ? 'تسجيل الخروج' : t.logout || 'Sign Out'
              )
            ),

            !isLoggedIn && !isGuest && /*#__PURE__*/
            React.createElement("div", { style: { margin: '14px 16px 0' } }, /*#__PURE__*/
              React.createElement("button", { onClick: gameActions.handleGoogleLogin, style: { width: '100%', padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', border: 'none', color: '#000', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' } }, "\uD83D\uDD11 ",
                lang === 'ar' ? 'تسجيل الدخول بجوجل' : t.loginGoogle
              )
            ), /*#__PURE__*/

            React.createElement("div", { style: { height: '8px' } })
          ),



          room && window.RoomView && /*#__PURE__*/
          React.createElement(window.RoomView, _extends({},
            gameActions, {
            room: room, roomId: roomId, currentUID: currentUID, OWNER_UID: OWNER_UID, lang: lang, t: t,
            myRole: window.GameService ? window.GameService.getMyRole(room, currentUID) : myRole,
            isMyTurn: isMyTurn,
            isSpectator: !room.players.find((p) => p.uid === currentUID),
            me: me,
            turnTimer: turnTimer, wordSelTimer: wordSelTimer, votingTimer: votingTimer,
            hasVoted: hasVoted,
            hasVotedWord: hasVotedWord,
            showLobbyPassword: showLobbyPassword, setShowLobbyPassword: setShowLobbyPassword,
            copied: copied, handleCopy: gameActions.handleCopy,
            gameChatInput: gameChatInput, setGameChatInput: setGameChatInput,
            showGameChat: showGameChat, setShowGameChat: setShowGameChat,
            currentUserData: currentUserData
          })
          )


        ),


        !room && /*#__PURE__*/
        React.createElement("nav", { className: "bottom-nav-new", style: { gridTemplateColumns: 'repeat(4,1fr)' } }, /*#__PURE__*/
          React.createElement("div", { className: `nav-item-new ${activeView === 'lobby' || activeView === 'ranking' ? 'active' : ''}`, onClick: () => setActiveView('lobby') }, /*#__PURE__*/
            React.createElement("div", { className: "nav-icon-new" }, "\uD83C\uDFE0"), /*#__PURE__*/
            React.createElement("div", { className: "nav-label-new" }, lang === 'ar' ? 'اللوبي' : t.tabLobby)
          ), /*#__PURE__*/
          React.createElement("div", { className: `nav-item-new ${activeView === 'chat' ? 'active' : ''}`, onClick: () => setActiveView('chat') }, /*#__PURE__*/
            React.createElement("div", { className: "nav-icon-new" }, "\uD83D\uDCAC"), /*#__PURE__*/
            React.createElement("div", { className: "nav-label-new" }, lang === 'ar' ? 'شات' : 'Chat'),
            totalFriendsUnread > 0 && /*#__PURE__*/React.createElement("div", { className: "nav-pip-new" })
          ), /*#__PURE__*/
          React.createElement("div", { className: `nav-item-new ${activeView === 'discover' ? 'active' : ''}`, onClick: () => setActiveView('discover') }, /*#__PURE__*/
            React.createElement("div", { className: "nav-icon-new" }, "\uD83D\uDD25"), /*#__PURE__*/
            React.createElement("div", { className: "nav-label-new" }, lang === 'ar' ? 'اكتشف' : 'Discover')
          ), /*#__PURE__*/
          React.createElement("div", {
            className: `nav-item-new ${activeView === 'me' ? 'active' : ''}`,
            onClick: () => setActiveView('me')
          }, /*#__PURE__*/
            React.createElement("div", { className: "nav-icon-new" },
              (isLoggedIn || isGuest) && (currentUserData?.photoURL || currentUserData?.photo) ? /*#__PURE__*/
                React.createElement("img", { src: currentUserData.photoURL || currentUserData.photo, alt: "", style: { width: '24px', height: '24px', objectFit: 'cover', borderRadius: '50%', border: `2px solid ${activeView === 'me' ? 'var(--primary)' : 'rgba(255,255,255,0.2)'}` } }) :
                '👤'

            ), /*#__PURE__*/
            React.createElement("div", { className: "nav-label-new" }, lang === 'ar' ? 'أنا' : 'Me')
          )
        ),



        showPWAInstall && /*#__PURE__*/
        React.createElement(PWAInstallPopup, { lang: lang, onClose: () => setShowPWAInstall(false) })

      ));

  }

  window.App = App;
})();
