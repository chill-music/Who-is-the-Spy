(function() {
    var { useState, useEffect, useRef, useMemo, useCallback } = React;
    var { 
        useAuthState, usePresence, useNotifications, useRoom, 
        useLeaderboards, useSocial, useGameAutomation, useBots,
        useLoginRewards, useBanningLogic,
        useAppUIState, useOnboarding,
        OWNER_UID
    } = window;

    // ── PWA Install Popup Component (separate so useState follows Rules of Hooks) ──
    function PWAInstallPopup({ lang, onClose }) {
        var [neverShow, setNeverShow] = useState(false);
        return (
            <div style={{
                position:'fixed', bottom:'88px', left:'12px', right:'12px', zIndex:2000,
                background:'linear-gradient(135deg,rgba(10,10,30,0.97),rgba(15,5,40,0.97))',
                backdropFilter:'blur(14px)',
                border:'1px solid rgba(0,242,255,0.3)', borderRadius:'20px',
                padding:'18px 18px 14px',
                boxShadow:'0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,242,255,0.08)',
            }}>
                {/* Header row */}
                <div style={{display:'flex', gap:'12px', alignItems:'flex-start', flexDirection: lang==='ar'?'row-reverse':'row'}}>
                    <div style={{width:'46px', height:'46px', background:'linear-gradient(135deg,rgba(0,242,255,0.15),rgba(112,0,255,0.15))', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0, border:'1px solid rgba(0,242,255,0.2)'}}>🚀</div>
                    <div style={{flex:1}}>
                        <div style={{fontSize:'15px', fontWeight:800, color:'white', marginBottom:'3px'}}>{lang==='ar'?'ثبّت التطبيق!':'Install App Now!'}</div>
                        <div style={{fontSize:'11px', color:'rgba(255,255,255,0.55)', lineHeight:'1.4'}}>{lang==='ar'?'تجربة أسرع من الشاشة الرئيسية.':'Faster experience from your home screen.'}</div>
                    </div>
                    <button
                        onClick={() => {
                            if (neverShow && window.markInstallNeverShow) window.markInstallNeverShow();
                            onClose();
                        }}
                        style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.6)', padding:0, cursor:'pointer', fontSize:'14px', borderRadius:'8px', width:'26px', height:'26px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}
                    >✕</button>
                </div>

                {/* Action row */}
                <div style={{marginTop:'14px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px'}}>
                    {/* Checkbox */}
                    <label style={{display:'flex', alignItems:'center', gap:'6px', cursor:'pointer', flexDirection: lang==='ar'?'row-reverse':'row'}}>
                        <div
                            onClick={() => setNeverShow(v => !v)}
                            style={{
                                width:'16px', height:'16px', borderRadius:'4px', flexShrink:0,
                                border: neverShow ? '2px solid #00f2ff' : '2px solid rgba(255,255,255,0.25)',
                                background: neverShow ? 'rgba(0,242,255,0.2)' : 'transparent',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                transition:'all 0.15s', cursor:'pointer'
                            }}
                        >
                            {neverShow && <span style={{fontSize:'10px', color:'#00f2ff', fontWeight:900, lineHeight:1}}>✓</span>}
                        </div>
                        <span style={{fontSize:'10px', color:'rgba(255,255,255,0.45)', userSelect:'none'}}>{lang==='ar'?'لا تُظهر مجدداً':"Don't show again"}</span>
                    </label>

                    {/* Install button */}
                    <button
                        onClick={() => {
                            if (window.triggerPWAInstall) window.triggerPWAInstall();
                            if (window.markInstallNeverShow) window.markInstallNeverShow();
                            onClose();
                        }}
                        style={{padding:'9px 22px', borderRadius:'12px', background:'linear-gradient(135deg,#00f2ff,#7000ff)', border:'none', color:'white', fontSize:'13px', fontWeight:800, cursor:'pointer', boxShadow:'0 4px 16px rgba(0,242,255,0.3)', flexShrink:0}}
                    >{lang==='ar'?'تثبيت':'Install'}</button>
                </div>
            </div>
        );
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

                {/* ══ CHAT VIEW (OG Faithful) ══ */}
                {!room && activeView === 'chat' && (
                    <div style={{paddingBottom:'8px'}}>
                        {/* Guest gate */}
                        {isGuest && !isLoggedIn && (
                            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'48px 24px',gap:'16px',textAlign:'center'}}>
                                <div style={{fontSize:'48px'}}>🔐</div>
                                <div style={{fontSize:'16px',fontWeight:800,color:'#e5e7eb'}}>{lang==='ar'?'سجّل دخولك أولاً':'Login Required'}</div>
                                <div style={{fontSize:'12px',color:'#6b7280',maxWidth:'240px'}}>{lang==='ar'?'سجّل الدخول بجوجل للوصول للأصدقاء والجروبات':'Sign in with Google to access friends & groups'}</div>
                                <button onClick={gameActions.handleGoogleLogin} style={{display:'flex',alignItems:'center',gap:'10px',padding:'11px 24px',borderRadius:'14px',background:'linear-gradient(135deg,#4285f4,#1a73e8)',border:'none',color:'#fff',fontWeight:800,fontSize:'14px',cursor:'pointer',boxShadow:'0 4px 16px rgba(66,133,244,0.4)'}}>
                                    <span style={{fontSize:'18px'}}>🔑</span> {lang==='ar'?'تسجيل الدخول بجوجل':'Sign in with Google'}
                                </button>
                            </div>
                        )}
                        {/* Logged-in content: Friends + Groups tabs */}
                        {(!isGuest || isLoggedIn) && (<>
                        <div style={{display:'flex',gap:'4px',padding:'10px 16px 0',borderBottom:'1px solid rgba(255,255,255,0.06)',marginBottom:'10px'}}>
                            <button id="chat-tab-friends"
                                onClick={() => {
                                    var fs = document.getElementById('chat-section-friends');
                                    var gs = document.getElementById('chat-section-groups');
                                    var tf = document.getElementById('chat-tab-friends');
                                    var tg = document.getElementById('chat-tab-groups');
                                    if(fs) fs.style.display='block';
                                    if(gs) gs.style.display='none';
                                    if(tf){ tf.style.color='#00f2ff'; tf.style.borderBottom='2px solid #00f2ff'; }
                                    if(tg){ tg.style.color='#6b7280'; tg.style.borderBottom='2px solid transparent'; }
                                }}
                                style={{flex:1,padding:'8px 0',borderRadius:'10px 10px 0 0',border:'none',cursor:'pointer',fontSize:'12px',fontWeight:700,background:'transparent',color:'#00f2ff',borderBottom:'2px solid #00f2ff',transition:'all 0.2s'}}>
                                👥 {lang==='ar'?'الأصدقاء':t.tabFriends}
                                {friendRequests.length > 0 && <span style={{marginLeft:'4px',fontSize:'9px',background:'var(--accent)',color:'#fff',borderRadius:'10px',padding:'1px 5px',fontWeight:700}}>{friendRequests.length}</span>}
                            </button>
                            <button id="chat-tab-groups"
                                onClick={() => {
                                    var fs = document.getElementById('chat-section-friends');
                                    var gs = document.getElementById('chat-section-groups');
                                    var tf = document.getElementById('chat-tab-friends');
                                    var tg = document.getElementById('chat-tab-groups');
                                    if(fs) fs.style.display='none';
                                    if(gs) gs.style.display='block';
                                    if(tg){ tg.style.color='#a78bfa'; tg.style.borderBottom='2px solid #a78bfa'; }
                                    if(tf){ tf.style.color='#6b7280'; tf.style.borderBottom='2px solid transparent'; }
                                }}
                                style={{flex:1,padding:'8px 0',borderRadius:'10px 10px 0 0',border:'none',cursor:'pointer',fontSize:'12px',fontWeight:700,background:'transparent',color:'#6b7280',borderBottom:'2px solid transparent',transition:'all 0.2s'}}>
                                👨‍👩‍👧 {lang==='ar'?'الجروبات':'Groups'}
                            </button>
                        </div>

                        {/* ── Friends Section ── */}
                        <div id="chat-section-friends">
                            {/* Add Friend */}
                            <div style={{margin:'0 16px 10px',display:'flex',gap:'8px'}}>
                                <input type="text" className="hero-input" style={{flex:1,padding:'9px 13px',fontSize:'12px'}} value={addFriendId} onChange={e => setAddFriendId(e.target.value)} placeholder={t.friendIdPlaceholder} />
                                <button onClick={gameActions.handleAddFriendById} disabled={!addFriendId.trim()} className="hero-btn-primary" style={{padding:'9px 14px',fontSize:'12px'}}>+ {lang==='ar'?'أضف':'Add'}</button>
                            </div>
                            {friendSearchMsg && <p style={{fontSize:'11px',textAlign:'center',padding:'0 16px 8px',color:friendSearchMsg.includes('تم')||friendSearchMsg.includes('Sent')?'#4ade80':'#ff4d4d'}}>{friendSearchMsg}</p>}

                            {/* Official Bot Chats */}
                            {isLoggedIn && (
                                <div style={{margin:'0 16px 10px',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'12px',overflow:'hidden'}}>
                                    <div style={{fontSize:'9px',fontWeight:700,color:'#6b7280',padding:'6px 14px 4px',textTransform:'uppercase',letterSpacing:'1px'}}>🤖 {lang==='ar'?'قنوات رسمية':'Official Channels'}</div>
                                    {/* Detective Bot */}
                                    <div onClick={()=>setShowDetectiveBot(true)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderTop:'1px solid rgba(255,255,255,0.04)',cursor:'pointer',background:detectiveBotUnread>0?'rgba(0,212,255,0.05)':'transparent'}} className="me-friend-row">
                                        <div style={{position:'relative',flexShrink:0}}>
                                            <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,rgba(0,212,255,0.25),rgba(0,212,255,0.1))',border:'1.5px solid rgba(0,212,255,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>🕵️</div>
                                            {detectiveBotUnread>0&&<div style={{position:'absolute',top:'-2px',right:'-2px',width:'10px',height:'10px',borderRadius:'50%',background:'#ef4444',border:'1.5px solid var(--bg-main)'}}/>}
                                        </div>
                                        <div style={{flex:1,minWidth:0}}>
                                            <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
                                                <span style={{fontSize:'13px',fontWeight:detectiveBotUnread>0?800:600,color:detectiveBotUnread>0?'#e2e8f0':'#9ca3af'}}>{lang==='ar'?'المحقق':'The Detective'}</span>
                                                <span style={{fontSize:'8px',fontWeight:900,background:'#00d4ff',color:'#000',padding:'1px 4px',borderRadius:'3px'}}>OFFICIAL</span>
                                            </div>
                                            <div style={{fontSize:'11px',color:'#6b7280'}}>{lang==='ar'?'البلاغات والردود':'Reports & Responses'}</div>
                                        </div>
                                    </div>
                                    {/* Love Bot */}
                                    <div onClick={()=>setShowLoveBot(true)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderTop:'1px solid rgba(255,255,255,0.04)',cursor:'pointer',background:loveBotUnread>0?'rgba(249,168,212,0.05)':'transparent'}} className="me-friend-row">
                                        <div style={{position:'relative',flexShrink:0}}>
                                            <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,rgba(249,168,212,0.25),rgba(249,168,212,0.1))',border:'1.5px solid rgba(249,168,212,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>💌</div>
                                            {(loveBotUnread>0||bffUnreadCount>0)&&<div style={{position:'absolute',top:'-2px',right:'-2px',width:'10px',height:'10px',borderRadius:'50%',background:'#ec4899',border:'1.5px solid var(--bg-main)'}}/>}
                                        </div>
                                        <div style={{flex:1,minWidth:0}}>
                                            <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
                                                <span style={{fontSize:'13px',fontWeight:loveBotUnread>0||bffUnreadCount>0?800:600,color:loveBotUnread>0||bffUnreadCount>0?'#e2e8f0':'#9ca3af'}}>{lang==='ar'?'دواء بوت':'Dawa Bot'}</span>
                                                <span style={{fontSize:'8px',fontWeight:900,background:'#f9a8d4',color:'#000',padding:'1px 4px',borderRadius:'3px'}}>OFFICIAL</span>
                                            </div>
                                            <div style={{fontSize:'11px',color:'#6b7280'}}>{lang==='ar'?'إشعارات الزواج و BFF':'Wedding & BFF Notifications'}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Friend Requests */}
                            {friendRequests.length > 0 && (
                                <div style={{margin:'0 16px 10px',background:'rgba(255,215,0,0.05)',border:'1px solid rgba(255,215,0,0.15)',borderRadius:'12px',overflow:'hidden'}}>
                                    <div style={{fontSize:'10px',fontWeight:700,color:'var(--gold)',padding:'8px 14px 4px',textTransform:'uppercase',letterSpacing:'1px'}}>⏳ {lang==='ar'?'طلبات صداقة':'Friend Requests'} ({friendRequests.length})</div>
                                    {friendRequests.map(req => (
                                        <div key={req.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 14px',borderTop:'1px solid rgba(255,255,255,0.04)'}}>
                                            <div style={{flex:1,minWidth:0}}>
                                                {window.PlayerNameTag
                                                    ? <window.PlayerNameTag player={req} lang={lang} size="sm" />
                                                    : <span style={{fontSize:'13px',color:'#e2e8f0'}}>{req.displayName || req.name}</span>}
                                            </div>
                                            <button onClick={() => gameActions.handleAcceptRequest && gameActions.handleAcceptRequest(req.id)} style={{padding:'4px 10px',borderRadius:'8px',background:'#00ff88',color:'#000',fontSize:'11px',fontWeight:700,border:'none',cursor:'pointer'}}>{t.accept} ✓</button>
                                            <button onClick={() => gameActions.handleRejectRequest && gameActions.handleRejectRequest(req.id)} style={{padding:'4px 8px',borderRadius:'8px',background:'rgba(255,255,255,0.07)',color:'var(--text-muted)',fontSize:'11px',border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer'}}>✕</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Friends List Card */}
                            <div style={{margin:'0 16px',background:'var(--new-card)',border:'1px solid var(--new-border)',borderRadius:'var(--radius-lg)',overflow:'hidden'}}>
                                {/* Self Chat */}
                                {isLoggedIn && currentUserData && (
                                    <div onClick={() => setShowSelfChat(true)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderBottom:'1px solid var(--new-border)',cursor:'pointer'}} className="me-friend-row">
                                        <div style={{flex:1,minWidth:0}}>
                                            {window.PlayerNameTag
                                                ? <window.PlayerNameTag player={currentUserData} lang={lang} size="sm" />
                                                : <span style={{fontSize:'13px',fontWeight:700,color:'#e2e8f0'}}>{currentUserData.displayName}</span>}
                                        </div>
                                        <div style={{fontSize:'9px',fontWeight:700,color:'var(--primary)',background:'rgba(0,242,255,0.1)',border:'1px solid rgba(0,242,255,0.25)',borderRadius:'6px',padding:'2px 7px',flexShrink:0}}>💬 {lang==='ar'?'شاتي':'My Chat'}</div>
                                    </div>
                                )}
                                {/* Family Chat Entry */}
                                {isLoggedIn && userFamily && (() => {
                                    var readAt = userFamily.chatReadBy?.[currentUID];
                                    var lastChatAt = userFamily.lastChatAt;
                                    var hasUnread = lastChatAt && readAt
                                        ? (lastChatAt.toDate ? lastChatAt.toDate() : new Date(lastChatAt.seconds*1000)) > (readAt.toDate ? readAt.toDate() : new Date(readAt.seconds*1000)) && userFamily.lastChatSenderId !== currentUID
                                        : !!lastChatAt && userFamily.lastChatSenderId !== currentUID;
                                    var familyWeeklyAct = userFamily.lastWeekActiveness !== undefined ? userFamily.lastWeekActiveness : (userFamily.weeklyActiveness || 0);
                                    var getFamilySignLvlData = window.FamilyConstants ? window.FamilyConstants.getFamilySignLevelData : null;
                                    var signData = getFamilySignLvlData ? getFamilySignLvlData(familyWeeklyAct) : { level:1, color:'#6b7280', imageURL:'icos/Family Sign1.png' };
                                    var signImageURL = signData ? signData.imageURL : null;
                                    return (
                                        <div onClick={()=>setShowFamilyChat(true)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderBottom:'1px solid var(--new-border)',cursor:'pointer',background:hasUnread?'linear-gradient(135deg,rgba(255,136,0,0.06),rgba(255,80,0,0.04))':'transparent'}} className="me-friend-row">
                                            <div style={{position:'relative',flexShrink:0}}>
                                                <div style={{width:'36px',height:'36px',borderRadius:'50%',overflow:'hidden',background:'linear-gradient(135deg,rgba(255,136,0,0.2),rgba(255,80,0,0.1))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',border:'1.5px solid rgba(255,136,0,0.3)'}}>
                                                    {userFamily.photoURL ? <img src={userFamily.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : (userFamily.emblem||'🏠')}
                                                </div>
                                                {hasUnread && <div style={{position:'absolute',top:'-2px',right:'-2px',width:'10px',height:'10px',borderRadius:'50%',background:'#f97316',border:'1.5px solid var(--bg-main)'}}/>}
                                            </div>
                                            <div style={{flex:1,minWidth:0}}>
                                                <div style={{display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
                                                    <span style={{fontSize:'13px',fontWeight:hasUnread?800:600,color:hasUnread?'#f97316':'#e2e8f0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'120px'}}>{userFamily.name}</span>
                                                    {window.FamilySignBadge && signData ? (
                                                        <div style={{transform:'scale(0.85)',transformOrigin:'left center'}}>
                                                            <window.FamilySignBadge tag={userFamily.tag||'FAM'} color={signData.color} signLevel={signData.level} imageURL={signImageURL} small={true} />
                                                        </div>
                                                    ) : signData && <span style={{fontSize:'9px',fontWeight:800,color:signData.color,background:`${signData.color}20`,border:`1px solid ${signData.color}44`,borderRadius:'4px',padding:'1px 5px'}}>{userFamily.tag||'FAM'}</span>}
                                                </div>
                                                <div style={{fontSize:'11px',color:'#6b7280',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{userFamily.lastChatMessage||(lang==='ar'?'شات العائلة':'Family Chat')}</div>
                                            </div>
                                            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'4px',flexShrink:0}}>
                                                <div style={{fontSize:'9px',fontWeight:700,color:'#f97316',background:'rgba(255,136,0,0.1)',border:'1px solid rgba(255,136,0,0.25)',borderRadius:'6px',padding:'2px 7px',cursor:'pointer'}} onClick={(e)=>{e.stopPropagation();setShowFamilyModal(true);}}>🏠 {lang==='ar'?'عائلة':'Family'}</div>
                                            </div>
                                        </div>
                                    );
                                })()}
                                {/* Friends */}
                                {friendsData.length === 0 ? (
                                    <div style={{padding:'24px',textAlign:'center',color:'var(--text-muted)',fontSize:'12px'}}>👥 {t.noFriends}</div>
                                ) : (() => {
                                    var online  = friendsData.filter(f => f.onlineStatus === 'online');
                                    var away    = friendsData.filter(f => f.onlineStatus === 'away');
                                    var offline = friendsData.filter(f => !f.onlineStatus || f.onlineStatus === 'offline');
                                    var statusColor = (f) => f.onlineStatus==='online' ? '#4ade80' : f.onlineStatus==='away' ? '#facc15' : '#6b7280';
                                    var renderFriend = (friend) => {
                                        var fVipLevel = typeof window.getVIPLevel === 'function' ? (window.getVIPLevel(friend)||0) : 0;
                                        var fVipCfg = window.getVIPConfig ? window.getVIPConfig(fVipLevel) : null;
                                        var fEquipped = friend.equipped || {};
                                        var fBadgeIds = (fEquipped.badges || []).slice(0, 3);
                                        var fTitleId = fEquipped.titles || null;
                                        var fTitleItem = fTitleId && typeof SHOP_ITEMS !== 'undefined' ? SHOP_ITEMS.titles?.find(tt => tt.id === fTitleId) : null;
                                        var sc = statusColor(friend);
                                        return (
                                            <div key={friend.id} onClick={() => gameActions.openProfile(friend.id)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderBottom:'1px solid var(--new-border)',cursor:'pointer'}} className="me-friend-row">
                                                <div style={{position:'relative',flexShrink:0}}>
                                                    <div style={{width:'38px',height:'38px',borderRadius:'50%',overflow:'hidden',border:fVipCfg?`2px solid ${fVipCfg.nameColor}`:'2px solid rgba(255,255,255,0.1)',boxShadow:fVipCfg?`0 0 8px ${fVipCfg.nameColor}44`:'none'}}>
                                                        {friend.photoURL
                                                            ? <img src={friend.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                                                            : <div style={{width:'100%',height:'100%',background:'rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',color:'#6b7280',fontWeight:700}}>{(friend.displayName||'U')[0].toUpperCase()}</div>}
                                                    </div>
                                                    <div style={{position:'absolute',bottom:'0px',right:'0px',width:'9px',height:'9px',borderRadius:'50%',background:sc,border:'1.5px solid #0a0a14'}}/>
                                                </div>
                                                <div style={{flex:1,minWidth:0}}>
                                                    <div style={{display:'flex',alignItems:'center',gap:'4px',flexWrap:'nowrap',marginBottom:fBadgeIds.length>0||fTitleItem?'2px':'0'}}>
                                                        <span style={{fontSize:'13px',fontWeight:700,color:fVipCfg?fVipCfg.nameColor:'#e2e8f0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'130px',textShadow:fVipCfg?`0 0 8px ${fVipCfg.nameColor}55`:'none'}}>{friend.displayName||friend.name||'—'}</span>
                                                        {fVipLevel>0&&fVipCfg&&<span style={{fontSize:'7px',fontWeight:900,background:fVipCfg.nameColor,color:'#000',padding:'1px 3px',borderRadius:'2px',flexShrink:0}}>VIP{fVipLevel}</span>}
                                                        {friend.staffRole?.role && window.StaffRoleBadge && <window.StaffRoleBadge userData={friend} uid={friend.id} lang={lang} size="sm" />}
                                                    </div>
                                                    {fBadgeIds.length>0 && typeof SHOP_ITEMS !== 'undefined' && (
                                                        <div style={{display:'flex',alignItems:'center',gap:'2px',marginBottom:'2px'}}>
                                                            {fBadgeIds.map((bid,idx)=>{
                                                                var b = SHOP_ITEMS.badges?.find(b=>b.id===bid);
                                                                if(!b) return null;
                                                                return b.imageUrl&&b.imageUrl.trim()!==''?<img key={idx} src={b.imageUrl} alt="" style={{width:'13px',height:'13px',objectFit:'contain'}}/>:<span key={idx} style={{fontSize:'11px',lineHeight:1}}>{b.preview}</span>;
                                                            })}
                                                        </div>
                                                    )}
                                                    {fTitleItem && (
                                                        <div style={{display:'flex',alignItems:'center',gap:'2px'}}>
                                                            {fTitleItem.imageUrl&&fTitleItem.imageUrl.trim()!==''?<img src={fTitleItem.imageUrl} alt="" style={{maxWidth:'70px',maxHeight:'12px',objectFit:'contain'}}/>:<span style={{fontSize:'9px',color:'#a78bfa',lineHeight:1,whiteSpace:'nowrap'}}>🌐 {lang==='ar'?fTitleItem.name_ar:fTitleItem.name_en}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                                <button onClick={(e)=>{e.stopPropagation(); gameActions.openPrivateChat && gameActions.openPrivateChat(friend);}} className="btn-ghost" style={{padding:'5px 8px',borderRadius:'8px',fontSize:'12px',flexShrink:0}}>💬</button>
                                            </div>
                                        );
                                    };
                                    return (<>
                                        {online.length>0&&(<><div style={{fontSize:'9px',fontWeight:700,color:'#4ade80',textTransform:'uppercase',padding:'8px 14px 4px',display:'flex',alignItems:'center',gap:'5px'}}><span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#4ade80',display:'inline-block'}}/>{t.online} ({online.length})</div>{online.map(renderFriend)}</>)}
                                        {away.length>0&&(<><div style={{fontSize:'9px',fontWeight:700,color:'#facc15',textTransform:'uppercase',padding:'8px 14px 4px',display:'flex',alignItems:'center',gap:'5px'}}><span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#facc15',display:'inline-block'}}/>{lang==='ar'?'بعيد':'Away'} ({away.length})</div>{away.map(renderFriend)}</>)}
                                        {offline.length>0&&(<><div style={{fontSize:'9px',fontWeight:700,color:'#6b7280',textTransform:'uppercase',padding:'8px 14px 4px',display:'flex',alignItems:'center',gap:'5px'}}><span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#6b7280',display:'inline-block'}}/>{t.offline} ({offline.length})</div>{offline.map(renderFriend)}</>)}
                                    </>);
                                })()}
                            </div>
                        </div>{/* end friends section */}

                        {/* ── Groups Section ── */}
                        <div id="chat-section-groups" style={{display:'none'}}>
                            {window.GroupsSection && (
                                <window.GroupsSection
                                    currentUser={user}
                                    currentUserData={currentUserData}
                                    currentUID={currentUID}
                                    friendsData={friendsData}
                                    lang={lang}
                                    onNotification={setNotification}
                                    isLoggedIn={isLoggedIn}
                                    onOpenProfile={gameActions.openProfile}
                                />
                            )}
                        </div>
                        </>)}
                    </div>
                )}

                {/* ══ DISCOVER VIEW (OG Faithful) ══ */}
                {!room && activeView === 'discover' && (
                    <div style={{paddingBottom:'8px'}}>
                        <div className="sec-head-new" style={{paddingTop:'14px'}}>
                            <span className="sec-title-new">🔥 {lang==='ar'?'اكتشف':'Discover'}</span>
                        </div>
                        <div className="discover-grid" style={{gridTemplateColumns:'repeat(2,1fr)', gap:'12px'}}>
                            {/* Moments — full width */}
                            <div
                                className="discover-sq"
                                style={{
                                    '--dsq-bg':'linear-gradient(145deg,rgba(0,242,255,0.12),rgba(112,0,255,0.08))',
                                    '--dsq-border':'rgba(0,242,255,0.3)',
                                    padding:'18px 12px',
                                    gridColumn:'span 2',
                                    aspectRatio:'2 / 1.2',
                                }}
                                onClick={() => { setShowFriendsMoments(true); setHasNewMoments(false); localStorage.setItem('last_moments_view', Date.now().toString()); }}
                            >
                                {hasNewMoments && <div className="dsq-dot" style={{background:'#ff4b4b',boxShadow:'0 0 10px #ff4b4b',width:'10px',height:'10px'}}/>}
                                <div className="dsq-icon" style={{background:'linear-gradient(135deg,rgba(0,242,255,0.25),rgba(112,0,255,0.2))',width:'56px',height:'56px',fontSize:'28px'}}>📸</div>
                                <div className="dsq-label" style={{fontSize:'14px'}}>{lang==='ar'?'مومنت الأصدقاء':'Friends Moments'}</div>
                                <div style={{fontSize:'10px',color:'var(--text-muted)',marginTop:'-4px'}}>{lang==='ar'?'شارك لحظاتك مع أصدقائك':'Share moments with friends'}</div>
                            </div>

                            {/* Couples */}
                            <div
                                className="discover-sq"
                                style={{
                                    '--dsq-bg':'linear-gradient(145deg,rgba(236,72,153,0.12),rgba(168,85,247,0.08))',
                                    '--dsq-border':'rgba(236,72,153,0.3)',
                                    padding:'18px 12px',
                                }}
                                onClick={() => {
                                    if (!isLoggedIn) { setShowLoginAlert(true); return; }
                                    setShowWeddingHall(true);
                                }}
                            >
                                {coupleData && <div className="dsq-dot" style={{background:'#ec4899'}}/>}
                                <div className="dsq-icon" style={{background:'linear-gradient(135deg,rgba(236,72,153,0.25),rgba(168,85,247,0.2))'}}>
                                    {coupleData && partnerData?.photoURL
                                        ? <img src={partnerData.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'14px'}}/>
                                        : '💍'
                                    }
                                </div>
                                <div className="dsq-label">{lang==='ar'?'الكابلز':'Couples'}</div>
                                {coupleData && partnerData && (
                                    <div style={{fontSize:'9px',color:'#f9a8d4',textAlign:'center',fontWeight:600,maxWidth:'80px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{partnerData.displayName}</div>
                                )}
                            </div>

                            {/* Family */}
                            <div
                                className="discover-sq"
                                style={{
                                    '--dsq-bg':'linear-gradient(145deg,rgba(255,136,0,0.1),rgba(255,80,0,0.06))',
                                    '--dsq-border':'rgba(255,136,0,0.28)',
                                    padding:'18px 12px',
                                }}
                                onClick={()=>setShowFamilyModal(true)}
                            >
                                {userFamily && <div className="dsq-dot" style={{background:'#f97316'}}/>}
                                <div className="dsq-icon" style={{background:'linear-gradient(135deg,rgba(255,136,0,0.22),rgba(255,80,0,0.12))'}}>
                                    {userFamily?.photoURL
                                        ? <img src={userFamily.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'14px'}}/>
                                        : (userFamily?.emblem || '🏠')
                                    }
                                </div>
                                <div className="dsq-label">{lang==='ar'?'العائلة':'Family'}</div>
                                {userFamily && (
                                    <div style={{fontSize:'9px',color:'#fb923c',textAlign:'center',fontWeight:600,maxWidth:'80px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{userFamily.name}</div>
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
                    <PWAInstallPopup lang={lang} onClose={() => setShowPWAInstall(false)} />
                )}
            </div>
        );
    }

    window.App = App;
})();
