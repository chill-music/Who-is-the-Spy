(function() {
    /**
     * GlobalModals — All app-level modals matching the original OG 10-app.js.
     * Receives ALL modal state via props from App and renders each conditionally.
     */
    window.GlobalModals = function(props) {
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

            // Social
            showFriendsMoments, setShowFriendsMoments,
            showFamilyModal, setShowFamilyModal, viewFamilyId, setViewFamilyId,
            showFamilyChat, setShowFamilyChat,
            showBFFModal, setShowBFFModal, bffInitialTab, setBffInitialTab,
            showDetectiveBot, setShowDetectiveBot,
            showLoveBot, setShowLoveBot,
            showBrowseRooms, setShowBrowseRooms,
            showPrivateChat, closePrivateChat, chatFriend,
            showSelfChat, setShowSelfChat,

            // Game
            showSetupModal, setShowSetupModal,
            showFunPass, setShowFunPass,
            alertMessage, setAlertMessage,
            nickname, setNickname, setupMode, setSetupMode,
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
        } = props;

        // Re-export some setters to window so non-React code can use them
        window.setTargetProfileUID = setTargetProfileUID;
        window.setShowUserProfile = setShowUserProfile;

        return (
            <div className="global-modals-container" style={{position:'relative',zIndex:9999}}>

                {/* ── ONBOARDING ── */}
                {showOnboarding && window.OnboardingModal && (
                    <window.OnboardingModal
                        show={showOnboarding}
                        googleUser={props.onboardingGoogleUser}
                        onComplete={props.handleOnboardingComplete}
                        lang={lang}
                    />
                )}

                {/* ── LOGIN ALERT ── */}
                {showLoginAlert && !isLoggedIn && (
                    <div className="modal-overlay" onClick={() => setShowLoginAlert(false)}>
                        <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '320px' }}>
                            <div className="modal-header">
                                <h2 className="modal-title">{t.loginRequired}</h2>
                                {window.ModalCloseBtn && <window.ModalCloseBtn onClose={() => setShowLoginAlert(false)} />}
                            </div>
                            <div className="modal-body text-center">
                                <div className="text-4xl mb-4">🔐</div>
                                <p className="text-sm text-gray-300 mb-4">{t.guestDesc}</p>
                                <button
                                    onClick={() => { setShowLoginAlert(false); if(handleGoogleLogin) handleGoogleLogin(); }}
                                    className="btn-google w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                                >
                                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />{t.loginGoogle}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TUTORIAL ── */}
                {window.TutorialModal && (
                    <window.TutorialModal
                        show={showTutorial}
                        onClose={() => { if(setShowTutorial) setShowTutorial(false); localStorage.setItem('pro_spy_tutorial_v2', 'true'); }}
                        lang={lang}
                    />
                )}

                {/* ── LOGIN REWARDS ── */}
                {window.LoginRewards && (
                    <window.LoginRewards
                        show={showLoginRewards}
                        onClose={() => setShowLoginRewards(false)}
                        userData={userData}
                        onClaim={handleClaimLoginReward}
                        lang={lang}
                        onOpenInventory={() => { setShowLoginRewards(false); setShowInventory(true); }}
                    />
                )}

                {/* ── GAME SUMMARY MODAL ── */}
                {showSummary && room && (
                    <div className="modal-overlay" onClick={() => setShowSummary(false)}>
                        <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">{t.summaryTitle}</h2>
                                {window.ModalCloseBtn && <window.ModalCloseBtn onClose={() => setShowSummary(false)} />}
                            </div>
                            <div className="modal-body text-center">
                                <div className="text-4xl mb-3">{room.status === 'finished_spy_caught' ? '🎉' : room.status === 'finished_mrwhite_wins' ? '👻' : '🕵️'}</div>
                                <h2 className="text-xl font-bold mb-3">{room.status === 'finished_spy_caught' ? t.agentsWin : room.status === 'finished_mrwhite_wins' ? t.mrWhiteWin : t.spyWin}</h2>
                                {room.chosenWord && <div className="text-xs text-cyan-400 mb-3">🔑 {t.selectedWord}: <strong>{room.chosenWord}</strong></div>}
                                <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'10px',padding:'10px',marginBottom:'8px',textAlign:'left'}}>
                                    <div className="text-xs font-bold text-gray-300 mb-2">📋 {t.rolesRevealTitle}</div>
                                    {room.players.filter(p => p.role).map(p => (
                                        <div key={p.uid} className="flex items-center justify-between gap-2 mb-1" style={{fontSize:'11px'}}>
                                            <span className="text-gray-300 truncate">{p.name}{p.uid===currentUID?' (You)':''}</span>
                                            <span style={{color:p.role==='spy'?'#ef4444':p.role==='mrwhite'?'#8b5cf6':p.role==='informant'?'#a78bfa':'#10b981',fontWeight:700,flexShrink:0}}>
                                                {p.role==='spy'?'🕵️ '+t.statusSpy:p.role==='mrwhite'?'👻 '+t.statusMrWhite:p.role==='informant'?'👁️ '+t.statusInformant:'🤵 '+t.statusAgent}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer">
                                {room.admin === currentUID && <button onClick={resetGame} className="btn-neon w-full py-2 rounded-lg text-sm font-bold mb-2">{t.playAgain}</button>}
                                <button onClick={handleLeaveRoom} className="btn-ghost w-full py-2 rounded-lg text-sm">{t.leaveRoom}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── SHOP ── */}
                {window.ShopModal && (
                    <window.ShopModal
                        show={showShop}
                        onClose={() => setShowShop(false)}
                        userData={isLoggedIn ? userData : props.guestData}
                        lang={lang}
                        onPurchase={handlePurchase}
                        onEquip={handleEquip}
                        onUnequip={handleUnequip}
                        onBuyVIP={handleBuyVIP}
                        onOpenInventory={() => { setShowShop(false); setShowInventory(true); }}
                        currentUID={currentUID}
                        onPropose={(ring) => { if(setProposalRing) setProposalRing(ring); setShowShop(false); if(setShowProposalModal) setShowProposalModal(true); }}
                        coupleData={coupleData}
                        onOpenCoupleCard={() => { setShowShop(false); if(setShowCoupleCard) setShowCoupleCard(true); }}
                    />
                )}

                {/* ── INVENTORY ── */}
                {window.InventoryModal && (
                    <window.InventoryModal
                        show={showInventory}
                        onClose={() => setShowInventory(false)}
                        userData={isLoggedIn ? userData : props.guestData}
                        lang={lang}
                        onEquip={handleEquip}
                        onUnequip={handleUnequip}
                        onSendGift={(gift, target) => handleSendGiftToUser && handleSendGiftToUser(gift, target, 1, true)}
                        friendsData={friendsData}
                        isLoggedIn={isLoggedIn}
                        currentUserData={currentUserData}
                        user={user}
                        coupleData={coupleData}
                        onOpenCoupleCard={() => { setShowInventory(false); if(setShowCoupleCard) setShowCoupleCard(true); }}
                        onPropose={(ring) => { if(setProposalRing) setProposalRing(ring); setShowInventory(false); if(setShowProposalModal) setShowProposalModal(true); }}
                    />
                )}

                {/* ── SETTINGS ── */}
                {window.SettingsModal && (
                    <window.SettingsModal
                        show={showSettings}
                        onClose={() => setShowSettings(false)}
                        lang={lang}
                        onSetLang={(nl) => {
                            if(props.setLang) props.setLang(nl);
                            localStorage.setItem('pro_spy_lang', nl);
                            if(user) window.usersCollection?.doc(user.uid).update({lang:nl}).catch(()=>{});
                        }}
                        userData={userData}
                        user={user}
                        onNotification={setNotification}
                        isGuest={isGuest}
                        onLoginGoogle={handleGoogleLogin}
                        onOpenAdminPanel={() => setShowAdminPanel && setShowAdminPanel(true)}
                    />
                )}

                {/* ── VIP CENTER ── */}
                {showVIPCenter && window.VIPCenterModal && (
                    <window.VIPCenterModal
                        show={showVIPCenter}
                        onClose={() => setShowVIPCenter(false)}
                        userData={userData}
                        user={user}
                        lang={lang}
                        onNotification={setNotification}
                        onOpenShop={() => { setShowVIPCenter(false); setShowShop(true); }}
                    />
                )}

                {/* ── HELP CENTER ── */}
                {showHelpCenter && window.HelpCenterModal && (
                    <window.HelpCenterModal
                        show={showHelpCenter}
                        onClose={() => setShowHelpCenter(false)}
                        user={user}
                        userData={userData}
                        lang={lang}
                        onNotification={setNotification}
                        isLoggedIn={isLoggedIn}
                    />
                )}

                {/* ── PUBLIC CHAT ── */}
                {showPublicChat && window.PublicChatModal && (
                    <window.PublicChatModal
                        show={showPublicChat}
                        onClose={() => setShowPublicChat(false)}
                        currentUser={userData}
                        user={user}
                        lang={lang}
                        onNotification={setNotification}
                        isLoggedIn={isLoggedIn}
                        onOpenProfile={(uid) => { if(setTargetProfileUID) setTargetProfileUID(uid); if(setShowUserProfile) setShowUserProfile(true); }}
                        currentUID={currentUID}
                    />
                )}

                {/* ── WEDDING HALL ── */}
                {window.WeddingHallModal && (
                    <window.WeddingHallModal
                        show={showWeddingHall}
                        onClose={() => setShowWeddingHall && setShowWeddingHall(false)}
                        lang={lang}
                        currentUID={currentUID}
                        currentUserData={userData}
                        coupleData={coupleData}
                        partnerData={partnerData}
                        onOpenPropose={() => { if(setShowWeddingHall) setShowWeddingHall(false); setShowShop(true); }}
                        onOpenCoupleCard={() => { if(setShowWeddingHall) setShowWeddingHall(false); if(setShowCoupleCard) setShowCoupleCard(true); }}
                        onDivorce={() => {}}
                        onNotification={setNotification}
                    />
                )}

                {/* ── PROPOSAL MODAL ── */}
                {window.ProposalModal && (
                    <window.ProposalModal
                        show={showProposalModal}
                        onClose={() => setShowProposalModal && setShowProposalModal(false)}
                        ring={proposalRing}
                        currentUserData={userData}
                        currentUID={currentUID}
                        lang={lang}
                        onSend={handleSendProposal}
                        friendsData={friendsData}
                    />
                )}

                {/* ── COUPLE CARD ── */}
                {window.CoupleCardModal && (
                    <window.CoupleCardModal
                        show={showCoupleCard}
                        onClose={() => setShowCoupleCard && setShowCoupleCard(false)}
                        coupleDoc={coupleData}
                        currentUID={currentUID}
                        selfData={userData}
                        partnerData={partnerData}
                        lang={lang}
                        onNotification={setNotification}
                        currentUserData={userData}
                        onOpenProfile={(uid) => { if(setShowCoupleCard) setShowCoupleCard(false); if(setTargetProfileUID) setTargetProfileUID(uid); if(setShowUserProfile) setShowUserProfile(true); }}
                    />
                )}

                {/* ── INCOMING PROPOSAL ── */}
                {window.IncomingProposalModal && (
                    <window.IncomingProposalModal
                        show={showIncomingProposal}
                        coupleDoc={incomingProposal}
                        fromData={incomingProposalFrom}
                        currentUID={currentUID}
                        lang={lang}
                        onAccept={handleAcceptProposal}
                        onDecline={handleDeclineProposal}
                    />
                )}

                {/* ── ADMIN PANEL ── */}
                {window.AdminPanel && (
                    <window.AdminPanel
                        show={showAdminPanel}
                        onClose={() => setShowAdminPanel && setShowAdminPanel(false)}
                        currentUser={user}
                        currentUserData={userData}
                        lang={lang}
                        onOpenProfile={(uid) => { if(setShowAdminPanel) setShowAdminPanel(false); openProfile && openProfile(uid); }}
                    />
                )}

                {/* ── FRIENDS MOMENTS ── */}
                {showFriendsMoments && window.FriendsMomentsModal && (
                    <window.FriendsMomentsModal
                        show={showFriendsMoments}
                        onClose={() => setShowFriendsMoments(false)}
                        currentUser={user}
                        currentUserData={currentUserData}
                        currentUID={currentUID}
                        friendsData={friendsData}
                        lang={lang}
                        onOpenProfile={(uid) => { setShowFriendsMoments(false); openProfile && openProfile(uid); }}
                    />
                )}

                {/* ── FAMILY MODAL ── */}
                {showFamilyModal && window.FamilyModal && (
                    <window.FamilyModal
                        show={showFamilyModal}
                        onClose={() => { setShowFamilyModal(false); setViewFamilyId(null); }}
                        currentUser={user}
                        currentUserData={currentUserData}
                        currentUID={currentUID}
                        lang={lang}
                        isLoggedIn={isLoggedIn}
                        onNotification={setNotification}
                        viewFamilyId={viewFamilyId}
                        onSendGift={handleSendGiftToUser}
                        userData={currentUserData}
                        onOpenChat={() => { setShowFamilyModal(false); setViewFamilyId(null); setTimeout(() => { if(setShowFamilyChat) setShowFamilyChat(true); }, 100); }}
                    />
                )}

                {/* ── FAMILY CHAT ── */}
                {showFamilyChat && userFamily && window.FamilyChatModal && (
                    <window.FamilyChatModal
                        show={showFamilyChat}
                        onClose={() => setShowFamilyChat(false)}
                        familyId={userFamily.id}
                        familyData={userFamily}
                        currentUID={currentUID}
                        currentUserData={currentUserData}
                        lang={lang}
                        onOpenFamily={() => { setShowFamilyChat(false); setShowFamilyModal(true); }}
                        onSendGift={handleSendGiftToUser}
                        userData={currentUserData}
                        onNotification={setNotification}
                        onOpenProfile={(uid) => { setShowFamilyChat(false); setTimeout(() => { if(setTargetProfileUID) setTargetProfileUID(uid); if(setShowUserProfile) setShowUserProfile(true); }, 80); }}
                    />
                )}

                {/* ── BFF MODAL ── */}
                {showBFFModal && window.BFFModal && (
                    <window.BFFModal
                        show={showBFFModal}
                        onClose={() => setShowBFFModal(false)}
                        lang={lang}
                        currentUID={currentUID}
                        currentUserData={currentUserData}
                        onNotification={setNotification}
                        friendsData={friendsData}
                        coupleData={coupleData}
                        couplePartnerData={partnerData}
                    />
                )}

                {/* ── DETECTIVE BOT ── */}
                {showDetectiveBot && window.BotChatModal && (
                    <window.BotChatModal
                        show={showDetectiveBot}
                        onClose={() => setShowDetectiveBot(false)}
                        botId="detective_bot"
                        currentUID={currentUID}
                        currentUserData={currentUserData}
                        lang={lang}
                    />
                )}

                {/* ── LOVE BOT ── */}
                {showLoveBot && window.BotChatModal && (
                    <window.BotChatModal
                        show={showLoveBot}
                        onClose={() => setShowLoveBot(false)}
                        botId="love_bot"
                        currentUID={currentUID}
                        currentUserData={currentUserData}
                        lang={lang}
                        onOpenWeddingHall={(tab) => { setShowLoveBot(false); if(setShowWeddingHall) setShowWeddingHall(true); }}
                        onOpenBFFModal={(tab) => { setShowLoveBot(false); setShowBFFModal(true); if(setBffInitialTab) setBffInitialTab(tab || 'requests'); }}
                    />
                )}

                {/* ── MY ACCOUNT (own profile) ── */}
                {showMyAccount && currentUID && window.ProfileV11 && (
                    <window.ProfileV11
                        show={showMyAccount}
                        onClose={() => setShowMyAccount(false)}
                        targetUID={currentUID}
                        lang={lang}
                        currentUserUID={currentUID}
                        onSendFriendRequest={handleSendRequest}
                        onSendGift={handleSendGiftToUser}
                        userData={currentUserData}
                        currentUserFriends={userData?.friends}
                        currentUserFriendRequests={userData?.friendRequests}
                        friendsData={friendsData}
                        isOwnProfileOverride={true}
                        onOpenSettings={() => { setShowMyAccount(false); setShowSettings(true); }}
                        onOpenShop={() => { setShowMyAccount(false); setShowShop(true); }}
                        onOpenInventory={() => { setShowMyAccount(false); setShowInventory(true); }}
                        onOpenLuckyGames={() => { setShowMyAccount(false); if(setShowLuckyGames) setShowLuckyGames(true); }}
                        onLogout={handleLogout}
                        onLoginGoogle={() => { setShowMyAccount(false); handleGoogleLogin && handleGoogleLogin(); }}
                        isLoggedIn={isLoggedIn}
                        isGuest={isGuest}
                        sessionClaimedToday={sessionClaimedToday}
                        onOpenLoginRewards={() => { if(!sessionClaimedToday) setShowLoginRewards(true); }}
                        currency={currentUserData?.currency || 0}
                        onOpenProfile={(uid) => { setShowMyAccount(false); openProfile && openProfile(uid); }}
                        onOpenMarriage={() => { setShowMyAccount(false); if(setShowWeddingHall) setShowWeddingHall(true); }}
                        onOpenFamily={(fid) => { setShowMyAccount(false); setViewFamilyId(fid || null); setShowFamilyModal(true); }}
                        onOpenBFFModal={() => { setShowMyAccount(false); setShowBFFModal(true); }}
                        onNotification={setNotification}
                        onOpenChat={(target) => {
                            setShowMyAccount(false);
                            if (target === 'self') { if(setShowSelfChat) setShowSelfChat(true); }
                            else { openPrivateChat && openPrivateChat(target); }
                        }}
                    />
                )}

                {/* ── USER PROFILE (others) ── */}
                {window.ProfileV11 && (
                    <window.ProfileV11
                        show={showUserProfile}
                        onClose={() => setShowUserProfile(false)}
                        targetUID={targetProfileUID}
                        lang={lang}
                        currentUserUID={currentUID}
                        onSendFriendRequest={handleSendRequest}
                        onSendGift={handleSendGiftToUser}
                        userData={currentUserData}
                        currentUserFriends={userData?.friends}
                        currentUserFriendRequests={userData?.friendRequests}
                        friendsData={friendsData}
                        isGuest={isGuest}
                        currentViewerData={userData}
                        onOpenProfile={(uid) => { if(setTargetProfileUID) setTargetProfileUID(uid); setShowUserProfile(true); }}
                        onOpenFamily={(fid) => { setShowUserProfile(false); setViewFamilyId(fid || null); setShowFamilyModal(true); }}
                        onNotification={setNotification}
                        onOpenChat={(friendData) => { openPrivateChat && openPrivateChat(friendData); setShowUserProfile(false); }}
                    />
                )}

                {/* ── BROWSE ROOMS ── */}
                {window.BrowseRoomsModal && (
                    <window.BrowseRoomsModal
                        show={showBrowseRooms}
                        onClose={() => setShowBrowseRooms(false)}
                        onJoin={handleJoinGame}
                        nickname={nickname}
                        currentUID={currentUID}
                        currentUserData={currentUserData}
                        lang={lang}
                    />
                )}

                {/* ── PRIVATE CHAT ── */}
                {showPrivateChat && chatFriend && user && window.PrivateChatModal && (
                    <window.PrivateChatModal
                        show={showPrivateChat}
                        onClose={closePrivateChat}
                        friend={chatFriend}
                        currentUser={currentUserData}
                        user={user}
                        lang={lang}
                        onSendNotification={createNotification}
                        onSendGift={handleSendGiftToUser}
                        currency={userData?.currency || 0}
                        friendsData={friendsData}
                        onOpenProfile={openProfile}
                    />
                )}

                {/* ── SELF CHAT ── */}
                {showSelfChat && user && window.SelfChatModal && (
                    <window.SelfChatModal
                        show={showSelfChat}
                        onClose={() => setShowSelfChat && setShowSelfChat(false)}
                        currentUser={currentUserData}
                        userData={currentUserData}
                        lang={lang}
                        currency={userData?.currency || 0}
                    />
                )}

                {/* ── FUN PASS ── */}
                {showFunPass && window.FunPassModal && (
                    <window.FunPassModal
                        show={showFunPass}
                        onClose={() => setShowFunPass(false)}
                        userData={userData || currentUserData}
                        user={user}
                        lang={lang}
                        onNotification={setNotification}
                        onOpenInventory={() => { setShowFunPass(false); setShowInventory(true); }}
                    />
                )}

                {/* ── ALERT MESSAGE ── */}
                {alertMessage && (
                    <div className="alert-modal" onClick={() => setAlertMessage(null)}>
                        <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <span></span>
                                {window.ModalCloseBtn && <window.ModalCloseBtn onClose={() => setAlertMessage(null)} />}
                            </div>
                            <div className="modal-body text-center">
                                <div className="text-2xl mb-2">🚫</div>
                                <p className="font-bold mb-4">{alertMessage}</p>
                                <button onClick={() => setAlertMessage(null)} className="btn-ghost px-4 py-2 rounded-lg text-sm">{t.ok}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── SETUP ROOM MODAL ── */}
                {showSetupModal && (
                    <div className="modal-overlay" onClick={() => setShowSetupModal(false)}>
                        <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">{t.create}</h2>
                                {window.ModalCloseBtn && <window.ModalCloseBtn onClose={() => setShowSetupModal(false)} />}
                            </div>
                            <div className="modal-body">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] text-gray-400 block mb-1">{t.nickname}</label>
                                        <input
                                            className="input-dark w-full p-2 rounded font-bold text-sm"
                                            value={nickname}
                                            onChange={e => { setNickname(e.target.value); localStorage.setItem('pro_spy_nick', e.target.value); }}
                                            placeholder={t.nickname}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setSetupMode('normal')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${setupMode === 'normal' ? 'btn-neon' : 'btn-ghost'}`}>{t.normalMode}</button>
                                        <button onClick={() => setSetupMode('advanced')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${setupMode === 'advanced' ? 'btn-neon' : 'btn-ghost'}`}>{t.advancedMode}</button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 text-center">{setupMode === 'normal' ? t.modeNormalDesc : t.modeAdvDesc}</p>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} id="privateCheck" />
                                        <label htmlFor="privateCheck" className="text-xs">{t.privateRoom}</label>
                                    </div>
                                    {isPrivate && (
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                placeholder={t.password}
                                                className="input-dark w-full p-2 pr-10 rounded text-sm"
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                                                {showPassword ? '🙈' : '👁️'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    onClick={handleCreateGame}
                                    disabled={loading || !nickname.trim()}
                                    className="btn-neon w-full py-2 rounded-lg text-sm font-bold"
                                >
                                    {loading ? t.loading : t.create}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* ── LUCKY GAMES HUB ── */}
                {showLuckyGames && window.LuckyGamesHubModal && (
                    <window.LuckyGamesHubModal
                        show={showLuckyGames}
                        onClose={() => setShowLuckyGames && setShowLuckyGames(false)}
                        lang={lang}
                        userData={currentUserData}
                    />
                )}

            </div>
        );
    };
})();
