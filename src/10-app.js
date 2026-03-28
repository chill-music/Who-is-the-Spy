(function() {
    var { useState, useEffect, useRef, useMemo, useCallback } = React;
    var { 
        useAuthState, usePresence, useNotifications, useRoom, 
        useLeaderboards, useSocial, useGameAutomation, useBots,
        useLoginRewards, useBanningLogic, BannedScreen,
        useAppUIState, useOnboarding,
        OWNER_UID
    } = window;

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
            showGameChat, setShowGameChat, gameChatRef
        } = uiState;
        
        // ── Auth & Logic Hooks ──
        var [onboardingStates, setOnboardingStates] = useState({ googleUser: null, pendingRef: null, show: false });
        var { user, userData, authLoading, isLoggedIn, setUser, setUserData, setAuthLoading } = useAuthState({
            setLang, setNickname,
            setOnboardingGoogleUser: (u) => setOnboardingStates(prev => ({...prev, googleUser: u})),
            setPendingNewUserRef: (r) => setOnboardingStates(prev => ({...prev, pendingRef: r})),
            setShowOnboarding: (s) => setOnboardingStates(prev => ({...prev, show: s}))
        });

        var { 
            showOnboarding, setShowOnboarding, setOnboardingGoogleUser, setPendingNewUserRef,
            showTutorial, setShowTutorial, showPWAInstall, setShowPWAInstall
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
        
        var { showLoginRewards, setShowLoginRewards, sessionClaimedToday, setSessionClaimedToday } = window.useLoginRewards({ user, isLoggedIn, userData, lang, setNotification });

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

        useGameAutomation({
            room, roomId, currentUID, setTurnTimer, setVotingTimer, setWordSelTimer,
            handleSkipTurn: gameActions.handleSkipTurn,
            triggerVoting: gameActions.triggerVoting
        });

        useBots({
            room, roomId, currentUID, OWNER_UID, lang,
            nextTurn: (r) => window.GameService.nextTurn(r)
        });

        // Background Animation
        useEffect(() => {
            var cleanup = window.initBackgroundAnimation('bg-canvas');
            return cleanup;
        }, []);

        // ── App Rendering ──
        if (isBanned) return <BannedScreen userData={userData} />;

        return (
            <div className={`app-container ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
                <canvas id="bg-canvas" className="fixed inset-0 pointer-events-none z-[-1]"></canvas>

                {!room ? (
                    <div className="main-layout animate-fade-in relative z-10">
                        {/* 💎 Header */}
                        <header className="main-header mb-4">
                            <div className="flex items-center gap-3">
                                <div className="logo-container">
                                    <h1 className="logo-text">PRO SPY</h1>
                                    <div className="logo-scanner"></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="btn-lang">
                                    {lang === 'ar' ? '🇺🇸 EN' : '🇪🇬 AR'}
                                </button>
                                <div className="flex items-center gap-1.5 currency-badge group">
                                    <span className="text-primary text-sm animate-pulse-slow">💎</span>
                                    <span className="font-bold text-xs">{currentUserData?.currency || 0}</span>
                                </div>
                                <div ref={notificationBellRef} className="relative cursor-pointer hover:scale-110 transition-transform" onClick={() => setShowNotifications(!showNotifications)}>
                                    <span className="text-lg">🔔</span>
                                    {unreadNotifications > 0 && <span className="notification-badge-dot"></span>}
                                    {showNotifications && <window.NotificationDropdown notifications={notifications} onClose={() => setShowNotifications(false)} t={t} />}
                                </div>
                                <div className="user-mini-profile" onClick={() => setShowMyAccount(true)}>
                                    <div className="avatar-square-40">
                                        <window.AvatarComponent userData={currentUserData} size={40} />
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* 📱 Sub-Navigation */}
                        <nav className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
                            <button onClick={() => setActiveView('lobby')} className={`nav-tab ${activeView === 'lobby' ? 'active' : ''}`}>{t.tabLobby || 'Lobby'}</button>
                            <button onClick={() => setActiveView('chat')} className={`nav-tab ${activeView === 'chat' ? 'active' : ''}`}>{t.tabChat || 'Chat'}</button>
                            <button onClick={() => setActiveView('ranking')} className={`nav-tab ${activeView === 'ranking' ? 'active' : ''}`}>{t.tabLeaderboard || 'Ranking'}</button>
                            <button onClick={() => setShowBrowseRooms(true)} className="nav-tab browse-btn">{t.browse}</button>
                        </nav>

                        {/* 📈 Main View Content */}
                        <main className="view-content">
                            {activeView === 'ranking' && window.RankingView && (
                                <window.RankingView
                                    leaderboardTab={leaderboardTab} setLeaderboardTab={setLeaderboardTab}
                                    leaderboardData={leaderboardData} charismaLeaderboard={charismaLeaderboard} familyLeaderboard={familyLeaderboard}
                                    lang={lang} t={t} openProfile={gameActions.openProfile}
                                />
                            )}

                            {activeView === 'chat' && window.GroupsSection && (
                                <window.GroupsSection
                                    lang={lang} t={t}
                                    user={user} userData={currentUserData}
                                    onOpenFamily={() => setShowFamilyModal(true)}
                                    onOpenFamilyChat={() => setShowFamilyChat(true)}
                                    onNotification={(msg) => setNotification({ type:'info', message: msg })}
                                    onOpenProfile={gameActions.openProfile}
                                />
                            )}

                            {activeView === 'lobby' && (
                                <window.LobbyView
                                    currentUserData={currentUserData} user={user} lang={lang} t={t}
                                    showFunPass={showFunPass} setShowFunPass={setShowFunPass}
                                    inputCode={inputCode} setInputCode={setInputCode}
                                    handleJoinGame={gameActions.handleJoinGame}
                                    setShowSetupModal={setShowSetupModal}
                                    handleClaimDailyTask={gameActions.handleClaimDailyTask}
                                />
                            )}
                        </main>
                    </div>
                ) : (
                    <window.RoomView
                        {...gameActions}
                        room={room} roomId={roomId} currentUID={currentUID} OWNER_UID={OWNER_UID} lang={lang} t={t}
                        myRole={window.GameService.getMyRole(room, currentUID)}
                        isMyTurn={room.currentTurnUID === currentUID}
                        isSpectator={!room.players.find(p => p.uid === currentUID)}
                        me={room.players.find(p => p.uid === currentUID)}
                        turnTimer={turnTimer} wordSelTimer={wordSelTimer} votingTimer={votingTimer}
                        hasVoted={room.votes?.[currentUID]}
                        hasVotedWord={room.playerWordVotes?.[currentUID]}
                        showLobbyPassword={showLobbyPassword} setShowLobbyPassword={setShowLobbyPassword}
                        copied={copied} handleCopy={gameActions.handleCopy}
                        gameChatInput={gameChatInput} setGameChatInput={setGameChatInput}
                        showGameChat={showGameChat} setShowGameChat={setShowGameChat}
                    />
                )}

                {/* 🛡️ Global Components & Modals */}
                <window.GlobalModals
                    {...gameActions}
                    user={user} userData={userData} currentUID={currentUID} currentUserData={currentUserData}
                    isLoggedIn={isLoggedIn} isGuest={isGuest} lang={lang} t={t}
                    friendsData={friendsData} coupleData={coupleData} partnerData={partnerData} userFamily={userFamily}
                    sessionClaimedToday={sessionClaimedToday}
                    showFriendsMoments={showFriendsMoments} setShowFriendsMoments={setShowFriendsMoments}
                    showFamilyModal={showFamilyModal} setShowFamilyModal={setShowFamilyModal} viewFamilyId={viewFamilyId} setViewFamilyId={setViewFamilyId}
                    showFamilyChat={showFamilyChat} setShowFamilyChat={setShowFamilyChat}
                    showBFFModal={showBFFModal} setShowBFFModal={setShowBFFModal}
                    showDetectiveBot={showDetectiveBot} setShowDetectiveBot={setShowDetectiveBot}
                    showLoveBot={showLoveBot} setShowLoveBot={setShowLoveBot}
                    showMyAccount={showMyAccount} setShowMyAccount={setShowMyAccount}
                    showUserProfile={showUserProfile} setShowUserProfile={setShowUserProfile} targetProfileUID={targetProfileUID} setTargetProfileUID={setTargetProfileUID}
                    showBrowseRooms={showBrowseRooms} setShowBrowseRooms={setShowBrowseRooms}
                    showPrivateChat={showPrivateChat} closePrivateChat={gameActions.closePrivateChat} chatFriend={chatFriend}
                    showSelfChat={showSelfChat} setShowSelfChat={setShowSelfChat}
                    showFunPass={showFunPass} setShowFunPass={setShowFunPass}
                    alertMessage={alertMessage} setAlertMessage={setAlertMessage}
                    showSetupModal={showSetupModal} setShowSetupModal={setShowSetupModal}
                    showLoginRewards={showLoginRewards} setShowLoginRewards={setShowLoginRewards}
                    showShop={showShop} setShowShop={setShowShop}
                    showInventory={showInventory} setShowInventory={setShowInventory}
                    showSettings={showSettings} setShowSettings={setShowSettings}
                    showVIPCenter={showVIPCenter} setShowVIPCenter={setShowVIPCenter}
                    showHelpCenter={showHelpCenter} setShowHelpCenter={setShowHelpCenter}
                    nickname={nickname} setNickname={setNickname} setupMode={setupMode} setSetupMode={setSetupMode}
                    isPrivate={isPrivate} setIsPrivate={setIsPrivate} password={password} setPassword={setPassword}
                    showPassword={showPassword} setShowPassword={setShowPassword} loading={loading}
                    bffInitialTab={bffInitialTab} setBffInitialTab={setBffInitialTab} setShowWeddingHall={setShowWeddingHall}
                />

                {/* Notification Toast */}
                {notification && <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[200] animate-bounce-in"><div className="glass-panel px-6 py-3 rounded-full border-primary/30 text-sm font-bold shadow-2xl shadow-primary/20">{notification}</div></div>}
                {showTutorial && <window.TutorialModal show={showTutorial} onClose={() => setShowTutorial(false)} lang={lang} t={t} />}
                {showPWAInstall && <div className="fixed bottom-4 right-4 z-[100] animate-bounce-in"><button onClick={() => { window.PWAHandler.install(); setShowPWAInstall(false); }} className="btn-neon px-4 py-2 rounded-lg text-xs font-bold shadow-2xl">📱 {lang==='ar'?'تثبيت التطبيق':'Install App'}</button></div>}
                {showIncomingProposal && incomingProposal && incomingProposalFrom && <window.IncomingProposalModal show={showIncomingProposal} onClose={() => setShowIncomingProposal(false)} proposal={incomingProposal} fromUser={incomingProposalFrom} lang={lang} onNotification={setNotification} />}

                {/* 🛡️ Admin Panel */}
                <window.AdminPanel
                    show={showAdminPanel} onClose={() => setShowAdminPanel(false)}
                    currentUID={currentUID} currentUserData={currentUserData} lang={lang} t={t}
                    onOpenProfile={gameActions.openProfile}
                />

                {/* 🔍 Global Scripts & Background Handlers */}
                <window.PWAHandler />
            </div>
        );
    }

    window.App = App;
})();
