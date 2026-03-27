(function() {
    var { TRANSLATIONS } = window;

    window.AppView = function(props) {
        var {
            activeView, room, roomId, currentUID, userData, isLoggedIn, isGuest,
            t, lang, nickname, loading, handleCreateGame, handleJoinGame, 
            handleLeaveRoom, startGame, sendGameMessage, gameChatInput, setGameChatInput,
            notification, setNotification, showOnboarding, onboardingGoogleUser,
            handleOnboardingComplete, showLoginAlert, setShowLoginAlert, handleGoogleLogin,
            showTutorial, setShowTutorial, showLoginRewards, setShowLoginRewards,
            userData, handleClaimLoginReward, setShowInventory, showSummary,
            setShowSummary, resetGame, showShop, setShowShop, handlePurchase,
            handleEquip, handleUnequip, handleBuyVIP, showInventory, setShowInventory,
            friendsData, currentUserData, user, coupleData, setShowCoupleCard,
            setShowProposalModal, setProposalRing, showSettings, setShowSettings,
            usersCollection, setLang, showVIPCenter, setShowVIPCenter, showHelpCenter,
            setShowHelpCenter, showPublicChat, setShowPublicChat, setTargetProfileUID,
            setShowUserProfile, showWeddingHall, setShowWeddingHall, partnerData,
            showProposalModal, setShowProposalModal, proposalRing, handleSendProposal,
            showCoupleCard, setShowCoupleCard, showIncomingProposal, incomingProposal,
            incomingProposalFrom, handleAcceptProposal, handleDeclineProposal,
            showAdminPanel, setShowAdminPanel, openProfile, showFriendsMoments,
            setShowFriendsMoments, showFamilyModal, setShowFamilyModal, setViewFamilyId,
            viewFamilyId, handleSendGiftToUser, setShowFamilyChat, showFamilyChat,
            userFamily, showBFFModal, setShowBFFModal, showDetectiveBot,
            setShowDetectiveBot, detectiveBotUnread, showLoveBot, setShowLoveBot,
            loveBotUnread, setBffInitialTab, bffUnreadCount, showMyAccount,
            setShowMyAccount, handleLogout, sessionClaimedToday, showUserProfile,
            targetProfileUID, showBrowseRooms, setShowBrowseRooms, showPrivateChat,
            chatFriend, closePrivateChat, createNotification, showSelfChat,
            setShowSelfChat, showFunPass, setShowFunPass, alertMessage, setAlertMessage,
            showSetupModal, setShowSetupModal, setSetupMode, setupMode, setIsPrivate,
            isPrivate, setPassword, password, showPassword, setShowPassword,
            unreadNotifications, showNotifications, setShowNotifications,
            notifications, markNotificationRead, clearAllNotifications,
            handleNotificationClick, notificationBellRef, setActiveView,
            leaderboardTab, setLeaderboardTab, familyLeaderboard, 
            leaderboardData, charismaLeaderboard, inputCode, setInputCode,
            addFriendId, setAddFriendId, handleAddFriendById, friendSearchMsg,
            friendRequests, handleAcceptRequest, handleRejectRequest,
            formatBanExpiry
        } = props;

        if (userData?.ban?.active) {
            return (
                <div style={{
                    minHeight:'100vh', background:'#0a0a0c', display:'flex', alignItems:'center', justifyContent:'center',
                    padding:'20px', fontFamily:'"Cairo", sans-serif', textAlign:'center', color:'#fff'
                }}>
                    <div className="animate-pop" style={{
                        width:'100%', maxWidth:'420px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)',
                        borderRadius:'28px', padding:'40px 30px', boxShadow:'0 20px 50px rgba(0,0,0,0.5)',
                    }}>
                        <div style={{ fontSize:'64px', marginBottom:'20px' }}>🚫</div>
                        <h1 style={{ fontSize:'24px', fontWeight:900, marginBottom:'10px', color:'#f87171' }}>
                            {lang === 'ar' ? 'تم إيقاف حسابك' : 'Account Suspended'}
                        </h1>
                        <p style={{ fontSize:'15px', color:'#9ca3af', lineHeight:'1.6', marginBottom:'25px' }}>
                            {lang === 'ar' ? `السبب: ${userData.ban.reason || 'مخالفة القوانين'}` : `Reason: ${userData.ban.reason || 'Policy Violation'}`}
                        </p>
                        <div style={{
                            background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.2)',
                            borderRadius:'16px', padding:'15px', marginBottom:'30px', display:'flex', alignItems:'center', gap:'12px', justifyContent:'center'
                        }}>
                            <span style={{ fontSize:'18px' }}>⏳</span>
                            {userData?.ban?.expiresAt && (
                                <div>
                                    <span style={{ fontSize:'10px', color:'#6b7280', fontWeight:700, display:'block', marginBottom:'2px' }}>
                                        {lang === 'ar' ? 'ينتهي الإيقاف' : 'SUSPENSION ENDS'}
                                    </span>
                                    <span style={{ fontSize:'13px', color: userData?.ban?.expiresAt ? '#fbbf24' : '#f87171', fontWeight:900 }}>
                                        {formatBanExpiry(userData, lang)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => auth.signOut()}
                            style={{
                                padding:'11px 28px', borderRadius:'12px', fontSize:'13px', fontWeight:800, cursor:'pointer',
                                background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)',
                                color:'#9ca3af', letterSpacing:'0.3px',
                            }}
                        >
                            {lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="app-shell" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {/* Background blobs */}
                <div className="bg-blobs">
                    <div className="bg-blob-item bg-blob-1"></div>
                    <div className="bg-blob-item bg-blob-2"></div>
                    <div className="bg-blob-item bg-blob-3"></div>
                </div>
                <window.NotificationToast message={notification} onClose={() => setNotification(null)} />

                {/* Main App Container */}
                <div className="app-container">
                    {!room && (
                        <div className="main-content">
                            {/* ══ LOBBY / الردهة VIEW ══ */}
                            {activeView === 'lobby' && (
                                <div className="lobby-content">
                                    <div className="hero-section">
                                        <div className="hero-bg"></div>
                                        <div className="hero-content">
                                            <div className="hero-title">{t.welcomeTitle}</div>
                                            <div className="hero-subtitle">{t.welcomeSubtitle}</div>
                                        </div>
                                    </div>

                                    <div className="lobby-actions">
                                        <button className="lobby-btn create-btn" onClick={() => handleCreateGame()}>
                                            <div className="btn-icon">🎮</div>
                                            <div className="btn-text">
                                                <div className="btn-title">{t.createGame}</div>
                                                <div className="btn-desc">{t.createGameDesc}</div>
                                            </div>
                                        </button>

                                        <div className="join-container">
                                            <div className="join-input-wrapper">
                                                <input
                                                    type="text"
                                                    placeholder={t.enterCode}
                                                    value={inputCode}
                                                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                                    className="join-input"
                                                />
                                                <button className="join-btn" onClick={() => handleJoinGame(inputCode)}>
                                                    <span>{t.joinGame}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Access Grid */}
                                    <div className="quick-access-grid">
                                        <div className="quick-card" onClick={() => setShowBrowseRooms(true)}>
                                            <div className="quick-icon" style={{background:'rgba(0,242,255,0.1)'}}>🌍</div>
                                            <div className="quick-label">{t.browseRooms}</div>
                                        </div>
                                        <div className="quick-card" onClick={() => setActiveView('leaderboard')}>
                                            <div className="quick-icon" style={{background:'rgba(255,215,0,0.1)'}}>🏆</div>
                                            <div className="quick-label">{t.leaderboard}</div>
                                        </div>
                                        <div className="quick-card" onClick={() => setShowShop(true)}>
                                            <div className="quick-icon" style={{background:'rgba(255,112,0,0.1)'}}>🛒</div>
                                            <div className="quick-label">{t.shop}</div>
                                        </div>
                                        <div className="quick-card" onClick={() => setShowFamilyModal(true)}>
                                            <div className="quick-icon" style={{background:'rgba(168,85,247,0.1)'}}>🏠</div>
                                            <div className="quick-label">{t.family}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ══ DISCOVER / اكتشف VIEW ══ */}
                            {activeView === 'discover' && (
                                <div className="discover-content" style={{paddingBottom:'8px'}}>
                                    <div className="sec-head-new" style={{paddingTop:'14px'}}>
                                        <span className="sec-title-new">🔥 {lang === 'ar' ? 'اكتشف' : 'Discover'}</span>
                                    </div>

                                    <div className="discover-grid" style={{gridTemplateColumns:'repeat(2,1fr)', gap:'12px'}}>
                                        <div
                                            className="discover-sq"
                                            style={{
                                                '--dsq-bg':'linear-gradient(145deg,rgba(0,242,255,0.12),rgba(112,0,255,0.08))',
                                                '--dsq-border':'rgba(0,242,255,0.3)',
                                                padding:'18px 12px',
                                                gridColumn: 'span 2',
                                                aspectRatio: '2 / 1.2',
                                            }}
                                            onClick={() => setShowFriendsMoments(true)}
                                        >
                                            <div className="dsq-icon" style={{background:'linear-gradient(135deg,rgba(0,242,255,0.25),rgba(112,0,255,0.2))', width:'56px', height:'56px', fontSize:'28px'}}>📸</div>
                                            <div className="dsq-label" style={{fontSize:'14px'}}>{lang === 'ar' ? 'مومنت الأصدقاء' : 'Friends Moments'}</div>
                                            <div style={{fontSize:'10px', color:'var(--text-muted)', marginTop:'-4px'}}>{lang === 'ar' ? 'شارك لحظاتك مع أصدقائك' : 'Share moments with friends'}</div>
                                        </div>

                                        <div
                                            className="discover-sq"
                                            style={{
                                                '--dsq-bg':'linear-gradient(145deg,rgba(236,72,153,0.12),rgba(168,85,247,0.08))',
                                                '--dsq-border':'rgba(236,72,153,0.3)',
                                                padding:'18px 12px',
                                            }}
                                            onClick={() => { if (!isLoggedIn) { setShowLoginAlert(true); return; } setShowWeddingHall(true); }}
                                        >
                                            <div className="dsq-icon" style={{background:'linear-gradient(135deg,rgba(236,72,153,0.25),rgba(168,85,247,0.2))'}}>💍</div>
                                            <div className="dsq-label">{lang === 'ar' ? 'الكابلز' : 'Couples'}</div>
                                        </div>

                                        <div
                                            className="discover-sq"
                                            style={{
                                                '--dsq-bg':'linear-gradient(145deg,rgba(255,136,0,0.1),rgba(255,80,0,0.06))',
                                                '--dsq-border':'rgba(255,136,0,0.28)',
                                                padding:'18px 12px',
                                            }}
                                            onClick={() => setShowFamilyModal(true)}
                                        >
                                            <div className="dsq-icon" style={{background:'linear-gradient(135deg,rgba(255,136,0,0.22),rgba(255,80,0,0.12))'}}>🏠</div>
                                            <div className="dsq-label">{lang === 'ar' ? 'العائلة' : 'Family'}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ══ ME / أنا VIEW ══ */}
                            {activeView === 'me' && (
                                <div className="me-content" style={{paddingBottom:'8px'}}>
                                    {(isLoggedIn || isGuest) && userData ? (
                                        <div className="me-hero-card" onClick={() => setShowMyAccount(true)}>
                                            <div className="me-hero-avatar">
                                                {userData.photoURL ? <img src={userData.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} /> : <span style={{fontSize:'36px'}}>😎</span>}
                                            </div>
                                            <div className="me-hero-info">
                                                <div className="me-hero-name">{userData.displayName || (lang === 'ar' ? 'مستخدم' : 'User')}</div>
                                                <div className="me-hero-id">ID: {currentUID?.slice(0,8) || '—'}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="me-hero-card" onClick={() => handleGoogleLogin()}>
                                            <div className="me-hero-avatar">🔐</div>
                                            <div className="me-hero-info">
                                                <div className="me-hero-name">{lang === 'ar' ? 'سجّل دخول' : 'Sign In'}</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="me-actions-grid">
                                        <div className="me-action-card" onClick={() => setShowInventory(true)}>
                                            <div className="me-action-icon">📦</div>
                                            <div className="me-action-label">{t.inventory}</div>
                                        </div>
                                        <div className="me-action-card" onClick={() => setShowShop(true)}>
                                            <div className="me-action-icon">🛒</div>
                                            <div className="me-action-label">{t.shop}</div>
                                        </div>
                                        <div className="me-action-card" onClick={() => handleLogout()}>
                                            <div className="me-action-icon">🚪</div>
                                            <div className="me-action-label">{t.logout}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Bottom Navigation ── */}
                    {!room && (
                        <div className="bottom-nav">
                            <div className={`nav-item ${activeView === 'lobby' ? 'active' : ''}`} onClick={() => setActiveView('lobby')}>
                                <div className="nav-icon">🎮</div>
                                <div className="nav-label">{t.lobby}</div>
                                {activeView === 'lobby' && <div className="nav-indicator"></div>}
                            </div>
                            <div className={`nav-item ${activeView === 'discover' ? 'active' : ''}`} onClick={() => setActiveView('discover')}>
                                <div className="nav-icon">🔥</div>
                                <div className="nav-label">{lang === 'ar' ? 'اكتشف' : 'Discover'}</div>
                                {activeView === 'discover' && <div className="nav-indicator"></div>}
                            </div>
                            <div className={`nav-item ${activeView === 'social' ? 'active' : ''}`} onClick={() => setActiveView('social')}>
                                <div className="nav-icon">💬</div>
                                <div className="nav-label">{t.social}</div>
                                {(unreadNotifications > 0 || bffUnreadCount > 0) && <div className="nav-badge">{unreadNotifications + bffUnreadCount}</div>}
                                {activeView === 'social' && <div className="nav-indicator"></div>}
                            </div>
                            <div className={`nav-item ${activeView === 'me' ? 'active' : ''}`} onClick={() => setActiveView('me')}>
                                <div className="nav-icon">👤</div>
                                <div className="nav-label">{t.me}</div>
                                {activeView === 'me' && <div className="nav-indicator"></div>}
                            </div>
                        </div>
                    )}
                {/* Navigation and Main Content above here ... */}

                {/* ══ MODALS ══ */}
                {showShop && (
                    <window.ShopModal
                        show={showShop}
                        onClose={() => setShowShop(false)}
                        userData={userData}
                        onPurchase={handlePurchase}
                        lang={lang}
                    />
                )}
                {showInventory && (
                    <window.InventoryModal
                        show={showInventory}
                        onClose={() => setShowInventory(false)}
                        userData={userData}
                        onEquip={handleEquip}
                        onUnequip={handleUnequip}
                        lang={lang}
                    />
                )}
                {showSettings && (
                    <window.SettingsModal
                        show={showSettings}
                        onClose={() => setShowSettings(false)}
                        userData={userData}
                        setLang={setLang}
                        lang={lang}
                    />
                )}
                {showVIPCenter && (
                    <window.VIPCenter
                        show={showVIPCenter}
                        onClose={() => setShowVIPCenter(false)}
                        userData={userData}
                        onBuyVIP={handleBuyVIP}
                        lang={lang}
                    />
                )}
                {/* Add other modals similarly ... */}

                {showLoginAlert && (
                    <window.LoginAlertModal
                        show={showLoginAlert}
                        onClose={() => setShowLoginAlert(false)}
                        onLogin={handleGoogleLogin}
                        lang={lang}
                    />
                )}
                </div>
            </div>
        );
    };
})();
