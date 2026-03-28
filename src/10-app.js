(function() {
    var { useState, useEffect, useRef, useMemo, useCallback } = React;
    var { 
        useAuthState, usePresence, useNotifications, useRoom, 
        useLeaderboards, useSocial, useGameAutomation, useBots,
        useLoginRewards, useBanningLogic,
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
        // 🔒 Critical components readiness guard
        var _criticalReady = window.LobbyView && window.GlobalModals && window.AvatarWithFrame && window.BannedScreen;
        if (!_criticalReady) {
            return (
                <div style={{
                    position:'fixed', inset:0, background:'linear-gradient(160deg,#060612,#0a0a1e)',
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                    zIndex:999999, gap:'16px'
                }}>
                    <div style={{ fontSize:'48px', animation:'gw-float 2s ease-in-out infinite' }}>🕵️</div>
                    <div style={{ width:'40px', height:'40px', borderRadius:'50%', border:'3px solid rgba(0,242,255,0.15)', borderTop:'3px solid #00f2ff', animation:'spin 0.8s linear infinite' }}/>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes gw-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
                </div>
            );
        }

        // 🔒 authLoading screen
        if (authLoading) {
            return (
                <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(160deg,#060612,#0a0a1e)',flexDirection:'column',gap:'16px'}}>
                    <div style={{fontSize:'48px',animation:'gw-float 2s ease-in-out infinite'}}>🕵️</div>
                    <div style={{width:'40px',height:'40px',borderRadius:'50%',border:'3px solid rgba(0,242,255,0.15)',borderTop:'3px solid #00f2ff',animation:'spin 0.8s linear infinite'}}/>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes gw-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
                </div>
            );
        }

        if (isBanned) return <window.BannedScreen userData={userData} lang={lang} />;

        // ── Computed values needed for render ──
        var fmtNum = window.fmtNum || ((n) => (n||0).toLocaleString());
        var isMyTurn = room?.currentTurnUID === currentUID;
        var me = room?.players?.find(p => p.uid === currentUID);
        var myRole = me?.role;
        var isSpectator = me?.status === 'spectator' || me?.status === 'ghost';
        var hasVoted = room?.votes?.[currentUID];
        var hasVotedWord = room?.wordVotes?.[currentUID];
        var totalFriendsUnread = (totalUnread || 0) + (friendRequests?.length || 0);

        return (
            <div className="app-shell" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {/* Background blobs */}
                <div className="bg-blobs">
                    <div className="bg-blob-item bg-blob-1"></div>
                    <div className="bg-blob-item bg-blob-2"></div>
                    <div className="bg-blob-item bg-blob-3"></div>
                </div>
                <window.NotificationToast message={notification} onClose={() => setNotification(null)} />

                {/* 🛡️ All Global Modals */}
                <window.GlobalModals
                    {...gameActions}
                    user={user} userData={userData} currentUID={currentUID} currentUserData={currentUserData}
                    isLoggedIn={isLoggedIn} isGuest={isGuest} lang={lang} t={t}
                    friendsData={friendsData} coupleData={coupleData} partnerData={partnerData} userFamily={userFamily}
                    sessionClaimedToday={sessionClaimedToday}
                    setNotification={setNotification}
                    openProfile={gameActions.openProfile}
                    showOnboarding={showOnboarding} setShowOnboarding={setShowOnboarding}
                    showLoginAlert={showLoginAlert} setShowLoginAlert={setShowLoginAlert}
                    showTutorial={showTutorial} setShowTutorial={setShowTutorial}
                    showLoginRewards={showLoginRewards} setShowLoginRewards={setShowLoginRewards}
                    showSummary={showSummary} setShowSummary={setShowSummary}
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
                    showShop={showShop} setShowShop={setShowShop}
                    showInventory={showInventory} setShowInventory={setShowInventory}
                    showSettings={showSettings} setShowSettings={setShowSettings}
                    showVIPCenter={showVIPCenter} setShowVIPCenter={setShowVIPCenter}
                    showHelpCenter={showHelpCenter} setShowHelpCenter={setShowHelpCenter}
                    showPublicChat={showPublicChat} setShowPublicChat={setShowPublicChat}
                    showWeddingHall={showWeddingHall} setShowWeddingHall={setShowWeddingHall}
                    showProposalModal={showProposalModal} setShowProposalModal={setShowProposalModal}
                    proposalRing={proposalRing} setProposalRing={setProposalRing}
                    showCoupleCard={showCoupleCard} setShowCoupleCard={setShowCoupleCard}
                    showIncomingProposal={showIncomingProposal} setShowIncomingProposal={setShowIncomingProposal}
                    incomingProposal={incomingProposal} incomingProposalFrom={incomingProposalFrom}
                    showAdminPanel={showAdminPanel} setShowAdminPanel={setShowAdminPanel}
                    nickname={nickname} setNickname={setNickname} setupMode={setupMode} setSetupMode={setSetupMode}
                    isPrivate={isPrivate} setIsPrivate={setIsPrivate} password={password} setPassword={setPassword}
                    showPassword={showPassword} setShowPassword={setShowPassword} loading={loading}
                    bffInitialTab={bffInitialTab} setBffInitialTab={setBffInitialTab}
                    room={room} roomId={roomId} notificationBellRef={notificationBellRef}
                    showNotifications={showNotifications} setShowNotifications={setShowNotifications}
                    notifications={notifications} unreadNotifications={unreadNotifications}
                />

                {/* ── NEW HEADER ── */}
                <header className="new-header">
                    <div className="new-logo">PRO SPY</div>
                    <div className="new-header-right">
                        {/* 🧠 Intel (currency) pill */}
                        {(isLoggedIn || isGuest) && currentUserData && (
                            <div
                                onClick={() => setShowShop(true)}
                                style={{
                                    display:'flex', alignItems:'center', gap:'4px',
                                    padding:'4px 10px', borderRadius:'20px', cursor:'pointer',
                                    background:'linear-gradient(135deg,rgba(0,242,255,0.12),rgba(112,0,255,0.10))',
                                    border:'1px solid rgba(0,242,255,0.25)',
                                    boxShadow:'0 0 8px rgba(0,242,255,0.12)',
                                    transition:'all 0.2s',
                                }}
                                title={lang==='ar'?'رصيدك':'Your Intel'}
                            >
                                <span style={{fontSize:'14px'}}>🧠</span>
                                <span style={{fontSize:'12px',fontWeight:900,color:'#00f2ff',letterSpacing:'0.3px'}}>
                                    {fmtNum(currentUserData?.currency||0)}
                                </span>
                            </div>
                        )}
                        {/* Login Rewards */}
                        {isLoggedIn && (
                            <button className="new-hbtn" onClick={() => { if(!sessionClaimedToday) setShowLoginRewards(true); }}
                                title={lang==='ar'?'مكافآت الدخول':'Login Rewards'}
                                style={{position:'relative', opacity: sessionClaimedToday ? 0.5 : 1}}>
                                🎁
                                {!sessionClaimedToday && <span style={{position:'absolute',top:'-3px',right:'-3px',width:'8px',height:'8px',background:'#f97316',borderRadius:'50%',border:'1.5px solid var(--bg-main)'}}></span>}
                            </button>
                        )}
                        {/* Notifications */}
                        {isLoggedIn && (
                            <div className="new-notif-center notification-center" ref={notificationBellRef}>
                                <div className="new-notif-bell notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
                                    🔔{unreadNotifications > 0 && <span className="notification-badge">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>}
                                </div>
                                <window.NotificationDropdown show={showNotifications} onClose={() => setShowNotifications(false)} notifications={notifications} onMarkRead={gameActions.markNotificationRead} onClearAll={gameActions.clearAllNotifications} onNotificationClick={gameActions.handleNotificationClick} lang={lang} />
                            </div>
                        )}
                        {/* Shop */}
                        {isLoggedIn && (
                            <div className="new-hbtn" onClick={() => setShowShop(true)} title={t.shop}>🛒</div>
                        )}
                        {/* Avatar */}
                        <div style={{position:'relative'}}>
                            <div className="new-avatar-btn"
                                onClick={() => {
                                    if (isLoggedIn) { setShowMyAccount(true); }
                                    else if (isGuest) { setShowMyAccount(true); }
                                    else { gameActions.handleGoogleLogin(); }
                                }}
                                title={lang==='ar'?'ملفي الشخصي':'My Profile'}>
                                {(isLoggedIn || isGuest) && (currentUserData?.photoURL || currentUserData?.photo)
                                    ? <img src={currentUserData.photoURL || currentUserData.photo} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} alt="" />
                                    : <span style={{fontSize:'16px'}}>😎</span>
                                }
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── NEW PAGE CONTENT ── */}
                <div className="new-page-content">

                {/* ── LOBBY / LEADERBOARD TABS ── */}
                {!room && (activeView === 'lobby' || activeView === 'ranking') && (
                    <div style={{
                        display:'flex', gap:'4px', padding:'10px 16px 0', marginBottom:'2px',
                        borderBottom:'1px solid rgba(255,255,255,0.06)',
                    }}>
                        <button
                            onClick={() => setActiveView('lobby')}
                            style={{
                                flex:1, padding:'9px 0', borderRadius:'10px 10px 0 0', border:'none',
                                background: activeView==='lobby' ? 'rgba(0,242,255,0.1)' : 'rgba(255,255,255,0.03)',
                                color: activeView==='lobby' ? '#00f2ff' : '#6b7280',
                                borderBottom: activeView==='lobby' ? '2px solid #00f2ff' : '2px solid transparent',
                                fontSize:'12px', fontWeight:700, cursor:'pointer', transition:'all 0.2s',
                            }}
                        >🏠 {lang==='ar' ? 'اللوبي' : 'Lobby'}</button>
                        <button
                            onClick={() => setActiveView('ranking')}
                            style={{
                                flex:1, padding:'9px 0', borderRadius:'10px 10px 0 0', border:'none',
                                background: activeView==='ranking' ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.03)',
                                color: activeView==='ranking' ? '#ffd700' : '#6b7280',
                                borderBottom: activeView==='ranking' ? '2px solid #ffd700' : '2px solid transparent',
                                fontSize:'12px', fontWeight:700, cursor:'pointer', transition:'all 0.2s',
                            }}
                        >📊 {lang==='ar' ? 'رانكينج' : 'Ranking'}</button>
                    </div>
                )}

                {/* ══ LOBBY VIEW ══ */}
                {!room && activeView === 'lobby' && (
                    <window.LobbyView
                        currentUserData={currentUserData} user={user} lang={lang} t={t}
                        isLoggedIn={isLoggedIn} isGuest={isGuest}
                        nickname={nickname} setNickname={setNickname}
                        showFunPass={showFunPass} setShowFunPass={setShowFunPass}
                        inputCode={inputCode} setInputCode={setInputCode}
                        loading={loading} joinError={joinError}
                        handleJoinGame={gameActions.handleJoinGame}
                        handleCreateGame={gameActions.handleCreateGame}
                        setShowSetupModal={setShowSetupModal}
                        setShowBrowseRooms={setShowBrowseRooms}
                        setShowMyAccount={setShowMyAccount}
                        setShowPublicChat={setShowPublicChat}
                        setNotification={setNotification}
                        currentUID={currentUID}
                        sessionClaimedToday={sessionClaimedToday}
                        requireLogin={() => setShowLoginAlert(true)}
                    />
                )}

                {/* ══ RANKING VIEW ══ */}
                {!room && activeView === 'ranking' && window.RankingView && (
                    <window.RankingView
                        leaderboardTab={leaderboardTab} setLeaderboardTab={setLeaderboardTab}
                        leaderboardData={leaderboardData} charismaLeaderboard={charismaLeaderboard} familyLeaderboard={familyLeaderboard}
                        lang={lang} t={t} openProfile={gameActions.openProfile}
                        setViewFamilyId={setViewFamilyId} setShowFamilyModal={setShowFamilyModal}
                        userFamily={userFamily} isLoggedIn={isLoggedIn}
                    />
                )}

                {/* ══ CHAT / GROUPS VIEW ══ */}
                {!room && activeView === 'chat' && window.GroupsSection && (
                    <window.GroupsSection
                        lang={lang} t={t}
                        user={user} userData={currentUserData}
                        onOpenFamily={() => setShowFamilyModal(true)}
                        onOpenFamilyChat={() => setShowFamilyChat(true)}
                        onNotification={(msg) => setNotification(msg)}
                        onOpenProfile={gameActions.openProfile}
                        friendsData={friendsData}
                        coupleData={coupleData}
                        partnerData={partnerData}
                        totalUnread={totalFriendsUnread}
                        userFamily={userFamily}
                        bffUnreadCount={bffUnreadCount}
                        detectiveBotUnread={detectiveBotUnread}
                        loveBotUnread={loveBotUnread}
                        setShowBFFModal={(v) => { setShowBFFModal(v); }}
                        setShowDetectiveBot={setShowDetectiveBot}
                        setShowLoveBot={setShowLoveBot}
                        chatsMeta={chatsMeta}
                        setOpenChatId={setOpenChatId}
                        openChatId={openChatId}
                        setChatFriend={setChatFriend}
                        setShowPrivateChat={setShowPrivateChat}
                        isLoggedIn={isLoggedIn}
                        currentUID={currentUID}
                    />
                )}

                {/* ══ DISCOVER VIEW ══ */}
                {!room && activeView === 'discover' && (
                    <div style={{paddingBottom:'8px'}}>
                        {/* Friends Moments */}
                        <div className="discover-sq"
                            style={{
                                '--dsq-bg':'linear-gradient(145deg,rgba(0,242,255,0.09),rgba(112,0,255,0.06))',
                                '--dsq-border':'rgba(0,242,255,0.22)',
                                padding:'18px 12px',
                                margin:'12px 16px 0',
                                borderRadius:'16px',
                                background:'var(--dsq-bg)',
                                border:'1px solid var(--dsq-border)',
                                cursor:'pointer',
                                display:'flex',
                                flexDirection:'column',
                                alignItems:'center',
                                gap:'6px',
                            }}
                            onClick={() => {
                                if (!isLoggedIn) { setShowLoginAlert(true); return; }
                                setShowFriendsMoments(true);
                            }}
                        >
                            {hasNewMoments && <div className="dsq-dot" style={{background:'#00f2ff'}}/>}
                            <div className="dsq-icon" style={{background:'linear-gradient(135deg,rgba(0,242,255,0.2),rgba(112,0,255,0.15))',width:'54px',height:'54px',borderRadius:'14px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px'}}>📸</div>
                            <div className="dsq-label" style={{fontSize:'14px'}}>{'مومنت الأصدقاء'}</div>
                            <div style={{fontSize:'10px', color:'var(--text-muted)', marginTop:'-4px'}}>{'شارك لحظاتك مع أصدقائك'}</div>
                        </div>

                        {/* Social squares grid */}
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',margin:'12px 16px 0'}}>
                            {/* Couples */}
                            <div className="discover-sq"
                                style={{
                                    background:'linear-gradient(145deg,rgba(236,72,153,0.12),rgba(168,85,247,0.08))',
                                    border:'1px solid rgba(236,72,153,0.3)',
                                    borderRadius:'16px', padding:'18px 12px',
                                    cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'6px',
                                    position:'relative',
                                }}
                                onClick={() => {
                                    if (!isLoggedIn) { setShowLoginAlert(true); return; }
                                    setShowWeddingHall(true);
                                }}
                            >
                                {coupleData && <div className="dsq-dot" style={{background:'#ec4899', position:'absolute',top:'8px',right:'8px',width:'8px',height:'8px',borderRadius:'50%'}}/>}
                                <div style={{width:'54px',height:'54px',borderRadius:'14px',background:'linear-gradient(135deg,rgba(236,72,153,0.25),rgba(168,85,247,0.2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',overflow:'hidden'}}>
                                    {coupleData && partnerData?.photoURL
                                        ? <img src={partnerData.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'14px'}}/>
                                        : '💍'
                                    }
                                </div>
                                <div style={{fontSize:'13px',fontWeight:700,color:'rgba(255,255,255,0.85)'}}>{lang==='ar'?'الكابلز':'Couples'}</div>
                                {coupleData && partnerData && (
                                    <div style={{fontSize:'9px',color:'#f9a8d4',textAlign:'center',fontWeight:600,maxWidth:'80px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                                        {partnerData.displayName}
                                    </div>
                                )}
                            </div>

                            {/* Family */}
                            <div className="discover-sq"
                                style={{
                                    background:'linear-gradient(145deg,rgba(255,136,0,0.1),rgba(255,80,0,0.06))',
                                    border:'1px solid rgba(255,136,0,0.28)',
                                    borderRadius:'16px', padding:'18px 12px',
                                    cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'6px',
                                    position:'relative',
                                }}
                                onClick={()=>setShowFamilyModal(true)}
                            >
                                {userFamily && <div style={{position:'absolute',top:'8px',right:'8px',width:'8px',height:'8px',background:'#f97316',borderRadius:'50%'}}/>}
                                <div style={{width:'54px',height:'54px',borderRadius:'14px',background:'linear-gradient(135deg,rgba(255,136,0,0.22),rgba(255,80,0,0.12))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',overflow:'hidden'}}>
                                    {userFamily?.photoURL
                                        ? <img src={userFamily.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'14px'}}/>
                                        : (userFamily?.emblem || '🏠')
                                    }
                                </div>
                                <div style={{fontSize:'13px',fontWeight:700,color:'rgba(255,255,255,0.85)'}}>{lang==='ar'?'العائلة':'Family'}</div>
                                {userFamily && (
                                    <div style={{fontSize:'9px',color:'#fb923c',textAlign:'center',fontWeight:600,maxWidth:'80px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                                        {userFamily.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ ME VIEW ══ */}
                {!room && activeView === 'me' && (
                    <div style={{paddingBottom:'8px'}}>
                        {/* Profile Hero Card */}
                        {(isLoggedIn || isGuest) && currentUserData ? (
                            <div className="me-hero-card" onClick={() => setShowMyAccount(true)}>
                                <div className="me-hero-avatar">
                                    {currentUserData.photoURL || currentUserData.photo
                                        ? <img src={currentUserData.photoURL || currentUserData.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
                                        : <span style={{fontSize:'36px'}}>😎</span>
                                    }
                                </div>
                                <div className="me-hero-info">
                                    <div className="me-hero-name">{currentUserData.displayName || currentUserData.name || (lang==='ar'?'مستخدم':'User')}</div>
                                    <div className="me-hero-id">{currentUserData?.customId ? `#${currentUserData.customId}` : `ID: ${currentUID?.slice(0,8)||'—'}`}</div>
                                    <div className="me-hero-stats-row">
                                        <span>🏆 {currentUserData?.stats?.wins || 0}</span>
                                        <span>⭐ {fmtNum(currentUserData?.charisma||0)}</span>
                                        <span>🧠 {fmtNum(currentUserData?.currency||0)}</span>
                                    </div>
                                </div>
                                <div style={{fontSize:'16px',color:'var(--text-muted)',flexShrink:0}}>›</div>
                            </div>
                        ) : (
                            <div className="me-hero-card" onClick={() => gameActions.handleGoogleLogin()}>
                                <div className="me-hero-avatar" style={{background:'rgba(255,255,255,0.06)'}}>
                                    <span style={{fontSize:'28px'}}>🔐</span>
                                </div>
                                <div className="me-hero-info">
                                    <div className="me-hero-name">{lang==='ar'?'سجّل دخول':'Sign In'}</div>
                                    <div className="me-hero-id">{lang==='ar'?'للاستمتاع بكل الميزات':'Unlock all features'}</div>
                                </div>
                                <div style={{fontSize:'16px',color:'var(--primary)',flexShrink:0}}>›</div>
                            </div>
                        )}

                        {/* Guest login banner */}
                        {isGuest && !isLoggedIn && (
                            <div style={{margin:'10px 16px 4px',padding:'14px 16px',borderRadius:'16px',background:'linear-gradient(135deg,rgba(66,133,244,0.13),rgba(26,115,232,0.08))',border:'1px solid rgba(66,133,244,0.28)',display:'flex',alignItems:'center',gap:'12px'}}>
                                <span style={{fontSize:'28px',flexShrink:0}}>🔑</span>
                                <div style={{flex:1,minWidth:0}}>
                                    <div style={{fontSize:'13px',fontWeight:800,color:'#e5e7eb',marginBottom:'2px'}}>{lang==='ar'?'سجّل دخولك بجوجل':'Sign in with Google'}</div>
                                    <div style={{fontSize:'11px',color:'#6b7280'}}>{lang==='ar'?'احفظ تقدمك واستمتع بكل الميزات':'Save progress & unlock all features'}</div>
                                </div>
                                <button onClick={gameActions.handleGoogleLogin} style={{flexShrink:0,padding:'8px 14px',borderRadius:'10px',background:'linear-gradient(135deg,#4285f4,#1a73e8)',border:'none',color:'#fff',fontWeight:800,fontSize:'12px',cursor:'pointer',whiteSpace:'nowrap'}}>
                                    {lang==='ar'?'دخول':'Login'}
                                </button>
                            </div>
                        )}

                        {/* Quick Actions Grid */}
                        <div className="sec-head-new" style={{paddingTop:'14px'}}>
                            <span className="sec-title-new">{lang==='ar'?'الإعدادات والأدوات':'Settings & Tools'}</span>
                        </div>
                        <div className="me-actions-grid">
                            {isLoggedIn && (
                                <div className="me-action-card" onClick={() => setShowInventory(true)}>
                                    <div className="me-action-icon" style={{background:'rgba(112,0,255,0.15)'}}>📦</div>
                                    <div className="me-action-label">{lang==='ar'?'حقيبتي':t.inventory}</div>
                                </div>
                            )}
                            {isLoggedIn && (
                                <div className="me-action-card" onClick={() => setShowShop(true)}>
                                    <div className="me-action-icon" style={{background:'rgba(255,215,0,0.12)'}}>🛒</div>
                                    <div className="me-action-label">{lang==='ar'?'المتجر':t.shop}</div>
                                </div>
                            )}
                            {isLoggedIn && (
                                <div className="me-action-card" onClick={() => setShowVIPCenter(true)}
                                    style={{background:'linear-gradient(135deg,rgba(255,215,0,0.08),rgba(255,140,0,0.05))',border:'1px solid rgba(255,215,0,0.2)'}}>
                                    <div className="me-action-icon" style={{background:'rgba(255,215,0,0.15)'}}>👑</div>
                                    <div className="me-action-label" style={{color:'#ffd700'}}>{lang==='ar'?'VIP سنتر':'VIP Center'}</div>
                                </div>
                            )}
                            <div className="me-action-card" onClick={() => setShowHelpCenter(true)}>
                                <div className="me-action-icon" style={{background:'rgba(0,242,255,0.1)'}}>💬</div>
                                <div className="me-action-label">{lang==='ar'?'مركز المساعدة':'Help Center'}</div>
                            </div>
                            <div className="me-action-card" onClick={() => setShowSettings(true)}>
                                <div className="me-action-icon" style={{background:'rgba(255,255,255,0.07)'}}>⚙️</div>
                                <div className="me-action-label">{lang==='ar'?'الإعدادات':t.settings||'Settings'}</div>
                            </div>
                        </div>

                        {/* Logout */}
                        {(isLoggedIn || isGuest) && (
                            <div style={{margin:'14px 16px 0'}}>
                                <button onClick={gameActions.handleLogout} style={{width:'100%',padding:'12px',borderRadius:'12px',background:'rgba(255,0,85,0.1)',border:'1px solid rgba(255,0,85,0.25)',color:'#ff4d6d',fontSize:'13px',fontWeight:700,cursor:'pointer',transition:'.2s',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                                    🚪 {lang==='ar'?'تسجيل الخروج':t.logout||'Sign Out'}
                                </button>
                            </div>
                        )}
                        {!isLoggedIn && !isGuest && (
                            <div style={{margin:'14px 16px 0'}}>
                                <button onClick={gameActions.handleGoogleLogin} style={{width:'100%',padding:'12px',borderRadius:'12px',background:'linear-gradient(135deg,var(--primary),var(--secondary))',border:'none',color:'#000',fontSize:'13px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                                    🔑 {lang==='ar'?'تسجيل الدخول بجوجل':t.loginGoogle}
                                </button>
                            </div>
                        )}
                        <div style={{height:'8px'}}></div>
                    </div>
                )}

                {/* ── ROOM VIEW ── */}
                {room && window.RoomView && (
                    <window.RoomView
                        {...gameActions}
                        room={room} roomId={roomId} currentUID={currentUID} OWNER_UID={OWNER_UID} lang={lang} t={t}
                        myRole={window.GameService ? window.GameService.getMyRole(room, currentUID) : myRole}
                        isMyTurn={isMyTurn}
                        isSpectator={!room.players.find(p => p.uid === currentUID)}
                        me={me}
                        turnTimer={turnTimer} wordSelTimer={wordSelTimer} votingTimer={votingTimer}
                        hasVoted={hasVoted}
                        hasVotedWord={hasVotedWord}
                        showLobbyPassword={showLobbyPassword} setShowLobbyPassword={setShowLobbyPassword}
                        copied={copied} handleCopy={gameActions.handleCopy}
                        gameChatInput={gameChatInput} setGameChatInput={setGameChatInput}
                        showGameChat={showGameChat} setShowGameChat={setShowGameChat}
                        currentUserData={currentUserData}
                    />
                )}

                </div>{/* end new-page-content */}

                {/* ── BOTTOM NAV (only when not in a room) ── */}
                {!room && (
                    <nav className="bottom-nav-new" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
                        <div className={`nav-item-new ${activeView==='lobby'||activeView==='ranking'?'active':''}`} onClick={() => setActiveView('lobby')}>
                            <div className="nav-icon-new">🏠</div>
                            <div className="nav-label-new">{lang==='ar'?'اللوبي':t.tabLobby}</div>
                        </div>
                        <div className={`nav-item-new ${activeView==='chat'?'active':''}`} onClick={() => setActiveView('chat')}>
                            <div className="nav-icon-new">💬</div>
                            <div className="nav-label-new">{lang==='ar'?'شات':'Chat'}</div>
                            {totalFriendsUnread > 0 && <div className="nav-pip-new"></div>}
                        </div>
                        <div className={`nav-item-new ${activeView==='discover'?'active':''}`} onClick={() => setActiveView('discover')}>
                            <div className="nav-icon-new">🔥</div>
                            <div className="nav-label-new">{lang==='ar'?'اكتشف':'Discover'}</div>
                        </div>
                        <div className={`nav-item-new ${activeView==='me'?'active':''}`}
                            onClick={() => setActiveView('me')}>
                            <div className="nav-icon-new">
                                {(isLoggedIn || isGuest) && (currentUserData?.photoURL || currentUserData?.photo)
                                    ? <img src={currentUserData.photoURL || currentUserData.photo} alt="" style={{width:'24px',height:'24px',objectFit:'cover',borderRadius:'50%',border:`2px solid ${activeView==='me'?'var(--primary)':'rgba(255,255,255,0.2)'}`}} />
                                    : '👤'
                                }
                            </div>
                            <div className="nav-label-new">{lang==='ar'?'أنا':'Me'}</div>
                        </div>
                    </nav>
                )}

                {/* ── PWA Install Popup ── */}
                {showPWAInstall && (
                    <div style={{
                        position:'fixed', bottom:'80px', left:'16px', right:'16px', zIndex:2000,
                        background:'rgba(20,20,30,0.95)', backdropFilter:'blur(12px)',
                        border:'1px solid rgba(0,242,255,0.3)', borderRadius:'20px',
                        padding:'20px', boxShadow:'0 10px 40px rgba(0,0,0,0.5)',
                    }}>
                        <div style={{display:'flex', gap:'15px', alignItems:'start', flexDirection: lang === 'ar' ? 'row-reverse' : 'row'}}>
                            <div style={{width:'50px', height:'50px', background:'rgba(0,242,255,0.1)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', flexShrink:0}}>🚀</div>
                            <div style={{flex:1}}>
                                <div style={{fontSize:'16px', fontWeight:800, color:'white', marginBottom:'4px'}}>{lang === 'ar' ? 'ثبّت التطبيق الآن!' : 'Install App Now!'}</div>
                                <div style={{fontSize:'12px', color:'rgba(255,255,255,0.6)', lineHeight:'1.4'}}>{lang === 'ar' ? 'استمتع بتجربة أسرع من الشاشة الرئيسية.' : 'Enjoy a faster experience from your home screen.'}</div>
                            </div>
                            <button onClick={() => setShowPWAInstall(false)} style={{background:'none', border:'none', color:'rgba(255,255,255,0.4)', padding:0, cursor:'pointer', fontSize:'18px'}}>✕</button>
                        </div>
                        <div style={{marginTop:'20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px'}}>
                            <button
                                onClick={() => {
                                    if (window.triggerPWAInstall) window.triggerPWAInstall();
                                    setShowPWAInstall(false);
                                }}
                                style={{padding:'10px 24px', borderRadius:'12px', background:'linear-gradient(135deg,#00f2ff,#7000ff)', border:'none', color:'white', fontSize:'14px', fontWeight:800, cursor:'pointer'}}
                            >{lang === 'ar' ? 'تثبيت' : 'Install'}</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    window.App = App;
})();
