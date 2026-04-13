(function () {
  /**
   * GlobalModals — All app-level modals matching the original OG 10-app.js.
   * Receives ALL modal state via props from App and renders each conditionally.
   */
  window.GlobalModals = function (props) {
    var {
      // Core
      lang, t, user, userData, currentUID, currentUserData,
      isLoggedIn, isGuest, friendsData, coupleData, partnerData, userFamily,
      sessionClaimedToday, setNotification, openProfile,

      // Onboarding
      showOnboarding, setShowOnboarding,
      showLoginAlert, setShowLoginAlert,
      showTutorial, setShowTutorial,
      showLoginRewards, setShowLoginRewards,
      showSummary, setShowSummary, room, roomId,

      // Account & Profile
      showMyAccount, setShowMyAccount,
      showUserProfile, setShowUserProfile, targetProfileUID, setTargetProfileUID,
      showSendGiftModal, setShowSendGiftModal, sendGiftTarget, setSendGiftTarget,
      showMiniProfile, setShowMiniProfile, miniProfileUID, miniProfileData,

      // Social
      showFriendsMoments, setShowFriendsMoments,
      showFamilyModal, setShowFamilyModal, viewFamilyId, setViewFamilyId,
      showFamilyChat, setShowFamilyChat,
      showBFFModal, setShowBFFModal, bffInitialTab, setBffInitialTab,
      showDetectiveBot, setShowDetectiveBot,
      showLoveBot, setShowLoveBot,
      showStaffCommandBot, setShowStaffCommandBot,
      showProSpyBot, setShowProSpyBot,
      showBrowseRooms, setShowBrowseRooms,
      showPrivateChat, closePrivateChat, chatFriend,
      showSelfChat, setShowSelfChat,

      // Game
      showSetupModal, setShowSetupModal,
      showFunPass, setShowFunPass,
      alertMessage, setAlertMessage,
      nickname, setNickname, setupGameId, setSetupGameId, browseGameId, setBrowseGameId, setupMode, setSetupMode,
      isPrivate, setIsPrivate, password, setPassword,
      showPassword, setShowPassword, loading,

      // Commerce
      showShop, setShowShop,
      showInventory, setShowInventory,
      showVIPCenter, setShowVIPCenter,
      showPublicChat, setShowPublicChat,
      showHelpCenter, setShowHelpCenter,
      showSettings, setShowSettings,
      showLuckyGames, setShowLuckyGames,

      // Wedding / Couples
      showWeddingHall, setShowWeddingHall,
      showProposalModal, setShowProposalModal,
      proposalRing, setProposalRing,
      showCoupleCard, setShowCoupleCard,
      showIncomingProposal, setShowIncomingProposal,
      incomingProposal, incomingProposalFrom,

      // Admin
      showAdminPanel, setShowAdminPanel,

      // Notifications (header uses these but we may also need them in modals)
      notificationBellRef, showNotifications, setShowNotifications,
      notifications, unreadNotifications,

      // Game actions (spread from gameActions)
      handleClaimLoginReward, handleCreateGame, handleJoinGame, handleGoogleLogin,
      handleLogout, handleSendRequest, handleSendGiftToUser, handleSendProposal,
      handleAcceptProposal, handleDeclineProposal, handlePurchase, handleEquip, handleUnequip,
      handleBuyVIP, markNotificationRead, clearAllNotifications, handleNotificationClick,
      createNotification, openPrivateChat, setShowPrivateChat: setShowPrivateChatFn,
      resetGame, handleLeaveRoom,
      // Marriage Actions
      handleAcceptProposal, handleDeclineProposal, handleDivorce,
      shopInitialTab, setShopInitialTab,
      // Missing setters for game flow
      setActiveView, setRoomId, setActiveGameId,
      // SNL Rejoin
      showRejoinSNL, setShowRejoinSNL, rejoinSNLRoomId, setRejoinSNLRoomId,
      setRejoinDeclined
    } = props;

    // --- [VERSION UPDATE STATE] ---
    var [showUpdateModal, setShowUpdateModal] = useState(false);
    var [remoteVersion, setRemoteVersion] = useState('');
    var [updateNotes, setUpdateNotes] = useState('');

    // --- [POST-CRITICAL APOLOGY STATE] ---
    var [showApologyModal, setShowApologyModal] = useState(false);
    var [postCritVer, setPostCritVer] = useState('');
    var [postCritMsg, setPostCritMsg] = useState('');

    useEffect(() => {
      window.showGlobalUpdateModal = (v, notes) => {
        setRemoteVersion(v);
        setUpdateNotes(notes);
        setShowUpdateModal(true);
      };
      window.setRemoteVersion = (v) => {
        setRemoteVersion(v);
      };

      // 🚩 Check for pending critical update apology
      const pendingMsg = localStorage.getItem('pro_spy_post_crit_msg');
      const pendingVer = localStorage.getItem('pro_spy_post_crit_ver');
      if (pendingMsg && pendingVer) {
          setPostCritMsg(pendingMsg);
          setPostCritVer(pendingVer);
          setShowApologyModal(true);
          // Don't clear yet, clear when modal is confirmed
      }
    }, []);

    // Re-export some setters to window so non-React code can use them
    window.setTargetProfileUID = setTargetProfileUID;
    window.setShowUserProfile = setShowUserProfile;
    window.setAlertMessage = setAlertMessage;
    window.setNotification = setNotification;
    // Allow non-React game code (e.g. SoccerStarGame exitBtn) to close the hub
    window.closeLuckyGamesHub = function () { if (setShowLuckyGames) setShowLuckyGames(false); };

    return (/*#__PURE__*/
      React.createElement("div", { className: "global-modals-container", style: { position: 'relative', zIndex: 9999 } },


      showOnboarding && window.OnboardingModal && /*#__PURE__*/
      React.createElement(window.OnboardingModal, {
        show: showOnboarding,
        googleUser: props.onboardingGoogleUser,
        onComplete: props.handleOnboardingComplete,
        lang: lang }
      ),



      showLoginAlert && !isLoggedIn && /*#__PURE__*/
      React.createElement("div", { className: "modal-overlay", onClick: () => setShowLoginAlert(false) }, /*#__PURE__*/
      React.createElement("div", { className: "modal-content animate-pop", onClick: (e) => e.stopPropagation(), style: { maxWidth: '320px' } }, /*#__PURE__*/
      React.createElement("div", { className: "modal-header" }, /*#__PURE__*/
      React.createElement("h2", { className: "modal-title" }, t.loginRequired),
      window.ModalCloseBtn && /*#__PURE__*/React.createElement(window.ModalCloseBtn, { onClose: () => setShowLoginAlert(false) })
      ), /*#__PURE__*/
      React.createElement("div", { className: "modal-body text-center" }, /*#__PURE__*/
      React.createElement("div", { className: "text-4xl mb-4" }, "\uD83D\uDD10"), /*#__PURE__*/
      React.createElement("p", { className: "text-sm text-gray-300 mb-4" }, t.guestDesc), /*#__PURE__*/
      React.createElement("button", {
        onClick: () => {setShowLoginAlert(false);if (handleGoogleLogin) handleGoogleLogin();},
        className: "btn-google w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2" }, /*#__PURE__*/

      React.createElement("img", { src: "https://www.google.com/favicon.ico", alt: "Google", className: "w-5 h-5" }), t.loginGoogle
      )
      )
      )
      ),



      window.TutorialModal && /*#__PURE__*/
      React.createElement(window.TutorialModal, {
        show: showTutorial,
        onClose: () => {
          if (setShowTutorial) setShowTutorial(false);
          localStorage.setItem('pro_spy_tutorial_v2', 'true');
          if (user && !user.isAnonymous && window.usersCollection) {
            window.usersCollection.doc(user.uid).update({ tutorial_v2_done: true }).catch(() => {});
          }
        },
        lang: lang }
      ),



      window.LoginRewards && /*#__PURE__*/
      React.createElement(window.LoginRewards, {
        show: showLoginRewards,
        onClose: () => setShowLoginRewards(false),
        userData: userData,
        onClaim: handleClaimLoginReward,
        lang: lang,
        onOpenInventory: () => {setShowLoginRewards(false);setShowInventory(true);} }
      ),



      showSummary && room && /*#__PURE__*/
      React.createElement("div", { className: "modal-overlay", onClick: () => setShowSummary(false) }, /*#__PURE__*/
      React.createElement("div", { className: "modal-content animate-pop relative overflow-hidden", onClick: (e) => e.stopPropagation() }, /*#__PURE__*/
      
      // Master Reveal Sweep Animation
      React.createElement("div", { className: "winning-team-sweep" }),

      React.createElement("div", { className: "modal-header" }, /*#__PURE__*/
      React.createElement("h2", { className: "modal-title" }, t.summaryTitle),
      window.ModalCloseBtn && /*#__PURE__*/React.createElement(window.ModalCloseBtn, { onClose: () => setShowSummary(false) })
      ), /*#__PURE__*/
      React.createElement("div", { className: "modal-body text-center z-10" }, /*#__PURE__*/
      React.createElement("div", { className: "text-5xl mb-4 drop-shadow-lg" }, room.status === 'finished_spy_caught' ? '🎉' : room.status === 'finished_mrwhite_wins' ? '👻' : '🕵️'), /*#__PURE__*/
      React.createElement("h2", { className: `summary-title ${room.status === 'finished_spy_caught' ? 'winner-glow-agent' : room.status === 'finished_mrwhite_wins' ? 'winner-glow-white' : 'winner-glow-spy'}` }, 
        room.status === 'finished_spy_caught' ? t.agentsWin : room.status === 'finished_mrwhite_wins' ? t.mrWhiteWin : t.spyWin
      ),
      room.chosenWord && /*#__PURE__*/React.createElement("div", { className: "text-sm text-primary/70 mb-4 font-tech uppercase tracking-widest" }, 
        t.selectedWord, ": ", /*#__PURE__*/React.createElement("span", { className: "text-white font-bold" }, room.chosenWord)
      ), /*#__PURE__*/
      
      React.createElement("div", { className: "summary-roles-panel" }, /*#__PURE__*/
      React.createElement("div", { className: "text-xs font-black text-white/40 uppercase tracking-widest mb-3" }, "📋 " + t.rolesRevealTitle),
      room.players.filter((p) => p.role).map((p) => /*#__PURE__*/
      React.createElement("div", { key: p.uid, className: "flex items-center justify-between gap-2 mb-2 p-1.5 rounded-lg border border-white/5 bg-white/5" }, /*#__PURE__*/
      React.createElement("span", { className: "text-[11px] font-bold text-white/80 truncate" }, p.name, p.uid === currentUID ? ' (You)' : ''), /*#__PURE__*/
      React.createElement("span", { 
        className: "text-[11px] font-black uppercase flex items-center gap-1",
        style: { color: p.role === 'spy' ? '#ff0055' : p.role === 'mrwhite' ? '#ffd700' : p.role === 'informant' ? '#a78bfa' : '#00f2ff' } 
      },
        p.role === 'spy' ? '🕵️ ' + t.statusSpy : p.role === 'mrwhite' ? '👻 ' + t.statusMrWhite : p.role === 'informant' ? '👁️ ' + t.statusInformant : '🤵 ' + t.statusAgent
      )
      )
      )
      )
      ), /*#__PURE__*/
      React.createElement("div", { className: "modal-footer flex-col gap-2" },
      room.admin === currentUID && /*#__PURE__*/React.createElement("button", { onClick: resetGame, className: "btn-neon w-full py-3 rounded-xl text-sm font-black uppercase tracking-wider" }, t.playAgain), /*#__PURE__*/
      React.createElement("button", { onClick: handleLeaveRoom, className: "btn-ghost w-full py-3 rounded-xl text-sm font-bold text-white/60" }, t.leaveRoom)
      )
      )
      ),



      window.ShopModal && /*#__PURE__*/
      React.createElement(window.ShopModal, {
        show: showShop,
        onClose: () => setShowShop(false),
        userData: isLoggedIn ? userData : props.guestData,
        lang: lang,
        initialTab: shopInitialTab,
        onPurchase: handlePurchase,
        onEquip: handleEquip,
        onUnequip: handleUnequip,
        onOpenInventory: () => {setShowShop(false);setShowInventory(true);},
        currentUID: currentUID,
        onPropose: (ring) => {if (setProposalRing) setProposalRing(ring);setShowShop(false);if (setShowProposalModal) setShowProposalModal(true);},
        coupleData: coupleData,
        onOpenCoupleCard: () => {setShowShop(false);if (setShowCoupleCard) setShowCoupleCard(true);} }
      ),



      window.InventoryModal && /*#__PURE__*/
      React.createElement(window.InventoryModal, {
        show: showInventory,
        onClose: () => setShowInventory(false),
        userData: isLoggedIn ? userData : props.guestData,
        lang: lang,
        onEquip: handleEquip,
        onUnequip: handleUnequip,
        onSendGift: (gift, target) => handleSendGiftToUser && handleSendGiftToUser(gift, target, 1, true),
        friendsData: friendsData,
        isLoggedIn: isLoggedIn,
        currentUserData: currentUserData,
        user: user,
        coupleData: coupleData,
        onOpenCoupleCard: () => {setShowInventory(false);if (setShowCoupleCard) setShowCoupleCard(true);},
        onPropose: (ring) => {if (setProposalRing) setProposalRing(ring);setShowInventory(false);if (setShowProposalModal) setShowProposalModal(true);} }
      ),



      window.SettingsModal && /*#__PURE__*/
      React.createElement(window.SettingsModal, {
        show: showSettings,
        onClose: () => setShowSettings(false),
        lang: lang,
        onSetLang: (nl) => {
          if (props.setLang) props.setLang(nl);
          localStorage.setItem('pro_spy_lang', nl);
          if (user) window.usersCollection?.doc(user.uid).update({ lang: nl }).catch(() => {});
        },
        userData: userData,
        user: user,
        remoteVersion: remoteVersion,
        onNotification: setNotification,
        isGuest: isGuest,
        onLoginGoogle: handleGoogleLogin,
        onOpenAdminPanel: () => setShowAdminPanel && setShowAdminPanel(true) }
      ),



      showVIPCenter && window.VIPCenterModal && /*#__PURE__*/
      React.createElement(window.VIPCenterModal, {
        show: showVIPCenter,
        onClose: () => setShowVIPCenter(false),
        userData: userData,
        user: user,
        lang: lang,
        onNotification: setNotification,
        onOpenShop: () => {setShowVIPCenter(false);setShowShop(true);} }
      ),



      showHelpCenter && window.HelpCenterModal && /*#__PURE__*/
      React.createElement(window.HelpCenterModal, {
        show: showHelpCenter,
        onClose: () => setShowHelpCenter(false),
        user: user,
        userData: userData,
        lang: lang,
        onNotification: setNotification,
        isLoggedIn: isLoggedIn }
      ),



      showPublicChat && window.PublicChatModal && /*#__PURE__*/
      React.createElement(window.PublicChatModal, {
        show: showPublicChat,
        onClose: () => setShowPublicChat(false),
        currentUser: userData,
        user: user,
        lang: lang,
        onNotification: setNotification,
        isLoggedIn: isLoggedIn,
        onOpenProfile: (uid) => {if (setTargetProfileUID) setTargetProfileUID(uid);if (setShowUserProfile) setShowUserProfile(true);},
        currentUID: currentUID }
      ),



      window.WeddingHallModal && /*#__PURE__*/
      React.createElement(window.WeddingHallModal, {
        show: showWeddingHall,
        onClose: () => setShowWeddingHall && setShowWeddingHall(false),
        lang: lang,
        currentUID: currentUID,
        currentUserData: userData,
        coupleData: coupleData,
        partnerData: partnerData,
        partnerData: partnerData,
        onOpenPropose: () => {
          if (setShowWeddingHall) setShowWeddingHall(false);
          if (setShopInitialTab) setShopInitialTab('rings');
          setShowShop(true);
        },
        onOpenCoupleCard: () => {if (setShowWeddingHall) setShowWeddingHall(false);if (setShowCoupleCard) setShowCoupleCard(true);},
        onAccept: handleAcceptProposal,
        onDecline: handleDeclineProposal,
        onDivorce: handleDivorce,
        onNotification: setNotification }
      ),



      window.ProposalModal && /*#__PURE__*/
      React.createElement(window.ProposalModal, {
        show: showProposalModal,
        onClose: () => setShowProposalModal && setShowProposalModal(false),
        ring: proposalRing,
        currentUserData: userData,
        currentUID: currentUID,
        lang: lang,
        onSend: handleSendProposal,
        friendsData: friendsData }
      ),



      window.CoupleCardModal && /*#__PURE__*/
      React.createElement(window.CoupleCardModal, {
        show: showCoupleCard,
        onClose: () => setShowCoupleCard && setShowCoupleCard(false),
        coupleDoc: coupleData,
        currentUID: currentUID,
        selfData: userData,
        partnerData: partnerData,
        lang: lang,
        onNotification: setNotification,
        currentUserData: userData,
        onOpenProfile: (uid) => {if (setShowCoupleCard) setShowCoupleCard(false);if (setTargetProfileUID) setTargetProfileUID(uid);if (setShowUserProfile) setShowUserProfile(true);} }
      ),



      window.IncomingProposalModal && /*#__PURE__*/
      React.createElement(window.IncomingProposalModal, {
        show: showIncomingProposal,
        coupleDoc: incomingProposal,
        fromData: incomingProposalFrom,
        currentUID: currentUID,
        lang: lang,
        onAccept: handleAcceptProposal,
        onDecline: handleDeclineProposal }
      ),



      window.AdminPanel && /*#__PURE__*/
      React.createElement(window.AdminPanel, {
        show: showAdminPanel,
        onClose: () => setShowAdminPanel && setShowAdminPanel(false),
        currentUser: user,
        currentUserData: userData,
        lang: lang,
        onOpenProfile: (uid) => {if (setShowAdminPanel) setShowAdminPanel(false);openProfile && openProfile(uid);} }
      ),



      showFriendsMoments && window.FriendsMomentsModal && /*#__PURE__*/
      React.createElement(window.FriendsMomentsModal, {
        show: showFriendsMoments,
        onClose: () => setShowFriendsMoments(false),
        currentUser: user,
        currentUserData: currentUserData,
        currentUID: currentUID,
        friendsData: friendsData,
        lang: lang,
        onOpenProfile: (uid) => {setShowFriendsMoments(false);openProfile && openProfile(uid);} }
      ),



      showFamilyModal && window.FamilyModal && /*#__PURE__*/
      React.createElement(window.FamilyModal, {
        show: showFamilyModal,
        onClose: () => {setShowFamilyModal(false);setViewFamilyId(null);},
        currentUser: user,
        currentUserData: currentUserData,
        currentUID: currentUID,
        lang: lang,
        isLoggedIn: isLoggedIn,
        onNotification: setNotification,
        viewFamilyId: viewFamilyId,
        onSendGift: handleSendGiftToUser,
        userData: currentUserData,
        onOpenChat: () => {setShowFamilyModal(false);setViewFamilyId(null);setTimeout(() => {if (setShowFamilyChat) setShowFamilyChat(true);}, 100);} }
      ),



      showFamilyChat && userFamily && window.FamilyChatModal && /*#__PURE__*/
      React.createElement(window.FamilyChatModal, {
        show: showFamilyChat,
        onClose: () => setShowFamilyChat(false),
        familyId: userFamily.id,
        familyData: userFamily,
        currentUID: currentUID,
        currentUserData: currentUserData,
        lang: lang,
        onOpenFamily: () => {setShowFamilyChat(false);setShowFamilyModal(true);},
        onSendGift: handleSendGiftToUser,
        userData: currentUserData,
        onNotification: setNotification,
        onOpenProfile: (uid) => {setShowFamilyChat(false);setTimeout(() => {if (setTargetProfileUID) setTargetProfileUID(uid);if (setShowUserProfile) setShowUserProfile(true);}, 80);} }
      ),



      showBFFModal && window.BFFModal && /*#__PURE__*/
      React.createElement(window.BFFModal, {
        show: showBFFModal,
        onClose: () => setShowBFFModal(false),
        lang: lang,
        currentUID: currentUID,
        currentUserData: currentUserData,
        onNotification: setNotification,
        friendsData: friendsData,
        coupleData: coupleData,
        couplePartnerData: partnerData }
      ),



      showDetectiveBot && window.BotChatModal && /*#__PURE__*/
      React.createElement(window.BotChatModal, {
        show: showDetectiveBot,
        onClose: () => setShowDetectiveBot(false),
        botId: "detective_bot",
        currentUID: currentUID,
        currentUserData: currentUserData,
        lang: lang }
      ),



      showLoveBot && window.BotChatModal && /*#__PURE__*/
      React.createElement(window.BotChatModal, {
        show: showLoveBot,
        onClose: () => setShowLoveBot(false),
        botId: "love_bot",
        currentUID: currentUID,
        currentUserData: currentUserData,
        lang: lang,
        onOpenWeddingHall: (tab) => {setShowLoveBot(false);if (setShowWeddingHall) setShowWeddingHall(true);},
        onOpenBFFModal: (tab) => {setShowLoveBot(false);setShowBFFModal(true);if (setBffInitialTab) setBffInitialTab(tab || 'requests');} }
      ),



      // 🕵️ PRO SPY Bot — broadcast & system messages (all users)
      showProSpyBot && window.BotChatModal && /*#__PURE__*/
      React.createElement(window.BotChatModal, {
        show: showProSpyBot,
        onClose: () => setShowProSpyBot(false),
        botId: "pro_spy_bot",
        currentUID: currentUID,
        currentUserData: currentUserData,
        lang: lang }
      ),



      // 🔒 ADMIN HQ — Staff-only bot: only renders for admin / moderator / owner
      showStaffCommandBot && window.BotChatModal &&
      (['owner','admin','moderator'].includes(currentUserData?.role) ||
       ['owner','admin','moderator'].includes(currentUserData?.staffRole?.role) ||
       (window.OWNER_UID && currentUID === window.OWNER_UID)) && /*#__PURE__*/
      React.createElement(window.BotChatModal, {
        show: showStaffCommandBot,
        onClose: () => setShowStaffCommandBot(false),
        botId: "staff_command_bot",
        currentUID: currentUID,
        currentUserData: currentUserData,
        lang: lang }
      ),



      showMyAccount && currentUID && window.ProfileV11 && /*#__PURE__*/
      React.createElement(window.ProfileV11, {
        show: showMyAccount,
        onClose: () => setShowMyAccount(false),
        targetUID: currentUID,
        lang: lang,
        currentUserUID: currentUID,
        onSendFriendRequest: handleSendRequest,
        onSendGift: handleSendGiftToUser,
        userData: currentUserData,
        currentUserFriends: userData?.friends,
        currentUserFriendRequests: userData?.friendRequests,
        friendsData: friendsData,
        isOwnProfileOverride: true,
        onOpenSettings: () => {setShowMyAccount(false);setShowSettings(true);},
        onOpenShop: () => {setShowMyAccount(false);setShowShop(true);},
        onOpenInventory: () => {setShowMyAccount(false);setShowInventory(true);},
        onLogout: handleLogout,
        onLoginGoogle: () => {setShowMyAccount(false);handleGoogleLogin && handleGoogleLogin();},
        isLoggedIn: isLoggedIn,
        isGuest: isGuest,
        sessionClaimedToday: sessionClaimedToday,
        onOpenLoginRewards: () => {if (!sessionClaimedToday) setShowLoginRewards(true);},
        currency: currentUserData?.currency || 0,
        onOpenProfile: (uid) => {setShowMyAccount(false);openProfile && openProfile(uid);},
        onOpenMarriage: () => {setShowMyAccount(false);if (setShowWeddingHall) setShowWeddingHall(true);},
        onOpenFamily: (fid) => {setShowMyAccount(false);setViewFamilyId(fid || null);setShowFamilyModal(true);},
        onOpenBFFModal: () => {setShowMyAccount(false);setShowBFFModal(true);},
        onOpenVIPCenter: () => {setShowMyAccount(false);setShowVIPCenter(true);},
        onNotification: setNotification,
        onOpenChat: (target) => {
          setShowMyAccount(false);
          if (target === 'self') {if (setShowSelfChat) setShowSelfChat(true);} else
          {openPrivateChat && openPrivateChat(target);}
        } }
      ),



      showUserProfile && window.ProfileV11 && /*#__PURE__*/
      React.createElement(window.ProfileV11, {
        show: showUserProfile,
        onClose: () => setShowUserProfile(false),
        targetUID: targetProfileUID,
        lang: lang,
        currentUserUID: currentUID,
        onSendFriendRequest: handleSendRequest,
        onSendGift: handleSendGiftToUser,
        userData: currentUserData,
        currentUserFriends: userData?.friends,
        currentUserFriendRequests: userData?.friendRequests,
        friendsData: friendsData,
        isGuest: isGuest,
        currentViewerData: userData,
        onOpenProfile: (uid) => {if (setTargetProfileUID) setTargetProfileUID(uid);setShowUserProfile(true);},
        onOpenFamily: (fid) => {setShowUserProfile(false);setViewFamilyId(fid || null);setShowFamilyModal(true);},
        onOpenVIPCenter: () => {setShowUserProfile(false);setShowVIPCenter(true);},
        onNotification: setNotification,
        onOpenChat: (friendData) => {openPrivateChat && openPrivateChat(friendData);setShowUserProfile(false);} }
      ),



      showMiniProfile && window.MiniProfilePopup && /*#__PURE__*/
      React.createElement(window.MiniProfilePopup, {
        show: showMiniProfile,
        onClose: () => setShowMiniProfile(false),
        uid: miniProfileUID,
        data: miniProfileData,
        lang: lang,
        t: t,
        currentUID: currentUID,
        currentUserData: currentUserData,
        onNotification: setNotification,
        onOpenFullProfile: (uid) => {
          setShowMiniProfile(false);
          setTargetProfileUID(uid);
          setShowUserProfile(true);
        },
        onOpenChat: openPrivateChat,
        onSendGift: handleSendGiftToUser }
      ),



      window.BrowseRoomsModal && /*#__PURE__*/
      React.createElement(window.BrowseRoomsModal, {
        show: showBrowseRooms,
        onClose: () => setShowBrowseRooms(false),
        onJoin: (id, pwd, opts) => handleJoinGame(id, pwd, { ...opts, gameId: browseGameId }),
        nickname: nickname,
        currentUID: currentUID,
        currentUserData: currentUserData,
        lang: lang,
        gameId: browseGameId }
      ),



      showPrivateChat && chatFriend && user && window.PrivateChatModal && /*#__PURE__*/
      React.createElement(window.PrivateChatModal, {
        show: showPrivateChat,
        onClose: closePrivateChat,
        friend: chatFriend,
        currentUser: currentUserData,
        user: user,
        lang: lang,
        onSendNotification: createNotification,
        onSendGift: handleSendGiftToUser,
        currency: userData?.currency || 0,
        friendsData: friendsData,
        onOpenProfile: openProfile }
      ),



      showSelfChat && user && window.SelfChatModal && /*#__PURE__*/
      React.createElement(window.SelfChatModal, {
        show: showSelfChat,
        onClose: () => setShowSelfChat && setShowSelfChat(false),
        currentUser: currentUserData,
        userData: currentUserData,
        lang: lang,
        currency: userData?.currency || 0 }
      ),



      showFunPass && window.FunPassModal && /*#__PURE__*/
      React.createElement(window.FunPassModal, {
        show: showFunPass,
        onClose: () => setShowFunPass(false),
        userData: userData || currentUserData,
        user: user,
        lang: lang,
        onNotification: setNotification,
        onOpenInventory: () => {setShowFunPass(false);setShowInventory(true);} }
      ),



      alertMessage && /*#__PURE__*/
      React.createElement("div", { className: "alert-modal", onClick: () => setAlertMessage(null) }, /*#__PURE__*/
      React.createElement("div", { className: "modal-content animate-pop", onClick: (e) => e.stopPropagation() }, /*#__PURE__*/
      React.createElement("div", { className: "modal-header" }, /*#__PURE__*/
      React.createElement("span", null),
      window.ModalCloseBtn && /*#__PURE__*/React.createElement(window.ModalCloseBtn, { onClose: () => setAlertMessage(null) })
      ), /*#__PURE__*/
      React.createElement("div", { className: "modal-body text-center" }, /*#__PURE__*/
      React.createElement("div", { className: "text-2xl mb-2" }, "\uD83D\uDEAB"), /*#__PURE__*/
      React.createElement("p", { className: "font-bold mb-4" }, alertMessage), /*#__PURE__*/
      React.createElement("button", { onClick: () => setAlertMessage(null), className: "btn-ghost px-4 py-2 rounded-lg text-sm" }, t.ok)
      )
      )
      ),



      showSetupModal && (function() {
        // Dynamic Setup Modal Registry
        const SetupComponent = (setupGameId === 'snake_ladder_pro' || setupGameId === 'snake-ladder') 
          ? window.SnakeLadderModeSelector 
          : window.SpyModeSelector;

        if (!SetupComponent) return null;

        return React.createElement(SetupComponent, {
          user: user,
          nickname: nickname,
          gameId: setupGameId,
          lang: lang,
          t: t,
          isLoggedIn: isLoggedIn,
          isGuest: isGuest,
          loading: loading,
          requireLogin: typeof props.requireLogin === 'function' ? props.requireLogin : () => setShowLoginAlert(true),
          onClose: () => setShowSetupModal(false),
          onSelectMode: (mode, options) => {
            if ((setupGameId === 'snake_ladder_pro' || setupGameId === 'snake-ladder') && mode === 'online' && !options.isPrivate && !options.isCustomRoom) {
              // Trigger matchmaking flow: Just go to game view without a roomId
              console.log("[SNL-Setup] Starting matchmaking flow...");
              // ✅ Allow rejoin prompt for future sessions of THIS new game
              sessionStorage.removeItem('snl_rejoin_declined');
              if (typeof setActiveGameId === 'function') setActiveGameId('snake_ladder_pro');
              if (typeof setRoomId === 'function') setRoomId(null);
              if (typeof setActiveView === 'function') setActiveView('game');
              setShowSetupModal(false);
            } else {
              // Private Online, Public Custom Online, Offline Party, or Vs Computer
              sessionStorage.removeItem('snl_rejoin_declined');
              handleCreateGame(mode, { ...options, gameId: setupGameId });
            }
          }
        });
      })(),


      showLuckyGames && window.LuckyGamesHubModal && /*#__PURE__*/
      React.createElement(window.LuckyGamesHubModal, {
        show: showLuckyGames,
        onClose: () => setShowLuckyGames && setShowLuckyGames(false),
        lang: lang,
        userData: currentUserData,
        currentUID: currentUID }
      ),


      showSendGiftModal && window.SendGiftModal && /*#__PURE__*/
      React.createElement(window.SendGiftModal, {
        show: showSendGiftModal,
        onClose: () => setShowSendGiftModal(false),
        targetUser: sendGiftTarget,
        currentUser: currentUserData,
        lang: lang,
        onSendGift: handleSendGiftToUser,
        friendsData: friendsData }
      ),


      window.UpdateModal && React.createElement(window.UpdateModal, {
        show: showUpdateModal,
        remoteVersion: remoteVersion,
        updateNotes: updateNotes,
        lang: lang,
        onUpdate: () => {
          if (window.VersionManager) {
            window.VersionManager.markUpdateAttempted(remoteVersion);
            window.VersionManager.clearCacheAndReload(remoteVersion);
          }
        },
        onSnooze: () => {
          if (window.VersionManager) {
            window.VersionManager.snoozeUpdate(5);
            setShowUpdateModal(false);
          }
        }
      }),

      window.ApologyModal && React.createElement(window.ApologyModal, {
        show: showApologyModal,
        remoteVersion: postCritVer,
        adminMessage: postCritMsg,
        lang: lang,
        onConfirm: () => {
          localStorage.removeItem('pro_spy_post_crit_msg');
          localStorage.removeItem('pro_spy_post_crit_ver');
          setShowApologyModal(false);
        }
      }),

      // --- [SNL REJOIN MODAL] ---
      showRejoinSNL && React.createElement("div", {
        // ✅ FIX: Use modal-overlay (standard class) which has flexbox centering built in
        className: "modal-overlay animate-fadeIn",
        style: { zIndex: 3000 },
        onClick: () => {
          // Clicking outside = same as "No Thanks"
          localStorage.removeItem('last_snl_room_id');
          if (setRejoinDeclined) setRejoinDeclined(true);
          setShowRejoinSNL(false);
        }
      }, React.createElement("div", {
        className: "modal-content animate-pop",
        style: { maxWidth: '340px', textAlign: 'center', padding: '30px 20px' },
        onClick: (e) => e.stopPropagation() // prevent close on inner click
      },
        React.createElement("div", { style: { fontSize: '40px', marginBottom: '15px' } }, "🐍"),
        React.createElement("h2", { style: { fontSize: '18px', fontWeight: 900, marginBottom: '10px' } },
          lang === 'ar' ? 'لديك لعبة قائمة!' : 'Active Game Found!'),
        React.createElement("p", { style: { fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '25px', lineHeight: '1.5' } },
          lang === 'ar' ? 'هل تريد العودة ومواصلة اللعب في غرفتك السابقة؟' : 'Would you like to return and continue playing in your previous room?'),
        React.createElement("div", { style: { display: 'flex', gap: '10px', flexDirection: 'column' } },
          React.createElement("button", {
            className: "btn-neon w-full py-3",
            onClick: () => {
              setRoomId(rejoinSNLRoomId);
              setActiveGameId('snake_ladder_pro');
              setActiveView('game');
              setShowRejoinSNL(false);
            }
          }, lang === 'ar' ? 'نعم، عودة' : 'Yes, Rejoin'),
          React.createElement("button", {
            className: "btn-ghost w-full py-2",
            onClick: () => {
              localStorage.removeItem('last_snl_room_id');
              // ✅ FIX: Also set rejoinDeclined so useEffect never re-fires
              if (setRejoinDeclined) setRejoinDeclined(true);
              setShowRejoinSNL(false);
            }
          }, lang === 'ar' ? 'لا، شكراً' : 'No, Thanks')
        )
      ))

      ));

  };
})();
