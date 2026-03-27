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
                {notification && <window.NotificationToast message={notification} onClose={() => setNotification(null)} />}

                {/* ── NEW HEADER ── */}
                <header className="new-header">
                    <div className="new-logo" onClick={() => setActiveView('lobby')} style={{cursor:'pointer'}}>PRO SPY</div>
                    <div className="new-header-right">
                        {/* 🧠 Intel (currency) pill — always visible when logged in */}
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
                                    {window.fmtNum ? window.fmtNum(currentUserData?.currency||0) : (currentUserData?.currency||0)}
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
                                {showNotifications && <window.NotificationDropdown show={showNotifications} onClose={() => setShowNotifications(false)} notifications={notifications} onMarkRead={markNotificationRead} onClearAll={clearAllNotifications} onNotificationClick={handleNotificationClick} lang={lang} />}
                            </div>
                        )}
                        {/* Shop */}
                        {isLoggedIn && (
                            <div className="new-hbtn" onClick={() => setShowShop(true)} title={lang==='ar'?'المتجر':t.shop}>🛒</div>
                        )}
                        {/* Avatar — opens profile (logged-in) or guest menu */}
                        <div style={{position:'relative'}}>
                            <div className="new-avatar-btn"
                                onClick={() => {
                                    if (isLoggedIn || isGuest) { setShowMyAccount(true); }
                                    else { handleGoogleLogin(); }
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

                {/* ── LOBBY / LEADERBOARD / FRIENDS / EXPLORE views ── */}
                {!room && (
                    <>
                        {/* ══ LOBBY / RANKING TABS ══ */}
                        {(activeView === 'lobby' || activeView === 'ranking') && (
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
                        {activeView === 'lobby' && (
                            <div style={{paddingBottom:'8px'}}>
                                {/* Stats Strip */}
                                {(isLoggedIn || isGuest) && currentUserData && (
                                    <>
                                        <div className="sec-head-new">
                                            <span className="sec-title-new">{lang==='ar' ? `مرحباً، ${currentUserData.displayName || currentUserData.name || ''}` : `Hi, ${currentUserData.displayName || currentUserData.name || ''}`} 👋</span>
                                            <button className="sec-action-new" onClick={() => setShowMyAccount(true)}>{lang==='ar'?'ملفي':'Profile'}</button>
                                        </div>
                                        <div className="stats-strip-new">
                                            <div className="stat-pill-new"><span>🏆</span><span className="sval">{currentUserData?.stats?.wins || 0}</span><span>{lang==='ar'?'انتصار':t.wins}</span></div>
                                            <div className="stat-pill-new" style={{cursor:'pointer'}} onClick={() => setShowMyAccount(true)}>
                                                {(() => {
                                                    var ch = currentUserData?.charisma || 0;
                                                    var { currentLevel } = window.getCharismaLevel ? window.getCharismaLevel(ch) : { currentLevel: null };
                                                    return currentLevel?.iconUrl
                                                        ? <img src={currentLevel.iconUrl} alt="" style={{width:'18px',height:'18px',objectFit:'contain', filter: currentLevel.hasGlow?`drop-shadow(0 0 4px ${currentLevel.color})`:'none'}} />
                                                        : <span style={{color: currentLevel?.color||'#ffd700'}}>⭐</span>;
                                                })()}
                                                <span className="sval gold">{window.fmtNum ? window.fmtNum(currentUserData?.charisma||0) : (currentUserData?.charisma||0)}</span>
                                                <span>{lang==='ar'?'كاريزما':'Charisma'}</span>
                                            </div>
                                            <div className="stat-pill-new"><span>🔥</span><span className="sval green">{currentUserData?.loginRewards?.streak || 0}</span><span>Streak</span></div>
                                        </div>
                                    </>
                                )}

                                {/* Fun Pass Promo */}
                                <div className="fp-promo-new" onClick={() => { if(isLoggedIn) setShowFunPass(true); else setShowLoginAlert(true); }}>
                                    <div className="fp-promo-emoji">🎟️</div>
                                    <div className="fp-promo-body">
                                        <div className="fp-promo-title">{lang==='ar'?'Fun Pass — الموسم الجديد!':'Fun Pass — New Season!'}</div>
                                        <div className="fp-promo-sub">{lang==='ar'?'أكمل المهام واكسب مكافآت حصرية':'Complete tasks and earn exclusive rewards'}</div>
                                    </div>
                                    <div className="fp-promo-arr">→</div>
                                </div>

                                {/* Lobby Hero */}
                                <div className="sec-head-new"><span className="sec-title-new">{lang==='ar'?'العب دلوقتي':t.tabLobby}</span></div>
                                <div className="lobby-hero-new">
                                    <div className="hero-label-new">{lang==='ar'?'ابدأ أو انضم لأوضة':t.codePlaceholder}</div>
                                    <div className="hero-title-new">{lang==='ar'?'أنت الجاسوس؟':'Are You the Spy?'}</div>
                                    {isGuest && <window.GuestBanner lang={lang} />}
                                    <div className="hero-input-row">
                                        <input className="hero-input" value={nickname} onChange={e => { setNickname(e.target.value); localStorage.setItem('pro_spy_nick', e.target.value); }} placeholder={t.nickname} />
                                        <button className="hero-btn-primary" onClick={() => setShowSetupModal(true)} disabled={!nickname.trim()}>+ {t.create}</button>
                                    </div>
                                    <div className="hero-join-row">
                                        <input className="hero-input hero-code-input" style={{flex:1}} value={inputCode} onChange={e => setInputCode(e.target.value.toUpperCase())} placeholder={t.codePlaceholder} maxLength={6} />
                                        <button className="hero-btn-primary" onClick={() => handleJoinGame(inputCode, '')} disabled={loading || !inputCode.trim() || !nickname.trim()}>{loading ? '...' : t.join}</button>
                                    </div>
                                    {props.joinError && <p style={{fontSize:'11px',color:'#ff4d4d',textAlign:'center',marginTop:'6px'}}>{props.joinError}</p>}
                                </div>

                                {/* Active Rooms */}
                                <div className="sec-head-new">
                                    <span className="sec-title-new">🟢 {lang==='ar'?'الأوض المفتوحة':'Open Rooms'}</span>
                                    <button className="sec-action-new" onClick={() => setShowBrowseRooms(true)}>{lang==='ar'?'الكل':'All'}</button>
                                </div>
                                <div className="rooms-scroll-new">
                                    <div className="room-card-new" onClick={() => setShowBrowseRooms(true)}>
                                        <div className="rc-mode">🕵️</div>
                                        <div className="rc-name">{lang==='ar'?'تصفّح الأوض':'Browse Rooms'}</div>
                                        <div className="rc-info" style={{color:'var(--primary)',marginTop:'6px',fontSize:'11px'}}>→ {lang==='ar'?'عرض الكل':'View all'}</div>
                                    </div>
                                    <div className="room-card-new" onClick={() => setShowSetupModal(true)} style={{border:'1px dashed rgba(0,242,255,0.3)'}}>
                                        <div className="rc-mode">➕</div>
                                        <div className="rc-name">{t.create}</div>
                                        <div className="rc-info" style={{marginTop:'6px',fontSize:'10px',color:'var(--text-muted)'}}>{lang==='ar'?'أوضة جديدة':'New room'}</div>
                                    </div>
                                </div>

                                {/* Daily Tasks */}
                                {isLoggedIn && userData && window.DailyTasksComponent && (
                                    <>
                                        <div className="sec-head-new">
                                            <span className="sec-title-new">📦 {lang==='ar'?'مهام اليوم':'Daily Tasks'}</span>
                                        </div>
                                        <div style={{margin:'0 16px', padding:'16px', background:'linear-gradient(135deg,rgba(0,242,255,0.05),rgba(112,0,255,0.04))', borderRadius:'14px', border:'1px solid rgba(0,242,255,0.12)'}}>
                                            <window.DailyTasksComponent
                                                userData={userData}
                                                user={user}
                                                lang={lang}
                                                onClaim={() => {}}
                                                onNotification={setNotification}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* ── 🌍 INLINE PUBLIC CHAT in Lobby ── */}
                                <div className="sec-head-new" style={{marginTop:'8px'}}>
                                    <span className="sec-title-new">🌍 {lang==='ar'?'الشات العام':'Public Chat'}</span>
                                    <button className="sec-action-new" onClick={() => setShowPublicChat(true)}>{lang==='ar'?'فتح':'Open'}</button>
                                </div>
                                <div style={{overflowX:'hidden',width:'100%',boxSizing:'border-box',contain:'layout'}}>
                                    {window.LobbyPublicChatBox && (
                                        <window.LobbyPublicChatBox
                                            currentUser={isLoggedIn ? userData : null}
                                            user={user}
                                            lang={lang}
                                            isLoggedIn={isLoggedIn}
                                            onOpenProfile={(uid) => { setTargetProfileUID(uid); setShowUserProfile(true); }}
                                            currentUID={currentUID}
                                            onOpenFull={() => setShowPublicChat(true)}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ══ RANKING VIEW ══ */}
                        {activeView === 'ranking' && (
                            <div className="animate-push" style={{paddingBottom:'88px'}}>
                                <div className="lb-tabs-new" style={{margin:'12px 16px 0'}}>
                                    <button className={`lb-tab-new ${leaderboardTab==='wins'?'active':''}`} onClick={() => setLeaderboardTab('wins')}>🏆 {t.wins}</button>
                                    <button className={`lb-tab-new ${leaderboardTab==='charisma'?'active':''}`} onClick={() => setLeaderboardTab('charisma')}>⭐ {t.charismaRank}</button>
                                    <button className={`lb-tab-new ${leaderboardTab==='family'?'active':''}`} onClick={() => setLeaderboardTab('family')}>🏠 {lang==='ar'?'عائلة':'Family'}</button>
                                </div>

                                <div className="lb-list-new">
                                    {/* Podium (Top 3) */}
                                    {leaderboardData && leaderboardData.length >= 3 && (
                                        <div className="lb-podium-new">
                                            {[1, 0, 2].map((idx) => {
                                                const p = leaderboardData[idx];
                                                if (!p) return null;
                                                const isFirst = idx === 0;
                                                return (
                                                    <div key={p.uid} className={`lb-pod-item-new ${isFirst?'first':''}`} onClick={() => openProfile(p.uid)}>
                                                        <div className="lb-pod-avatar">
                                                            {p.photoURL ? <img src={p.photoURL} alt="" /> : <span>👤</span>}
                                                            <div className="lb-pod-rank">{idx + 1}</div>
                                                        </div>
                                                        <div className="lb-pod-name">{p.displayName || '—'}</div>
                                                        <div className="lb-pod-val">
                                                            {leaderboardTab==='wins' ? `${p.stats?.wins||0} 🏆` : `${window.fmtNum ? window.fmtNum(p.charisma||0) : (p.charisma||0)} ⭐`}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Scrollable List (Rank 4+) */}
                                    <div className="lb-scroll-new">
                                        {leaderboardData && leaderboardData.slice(3, 30).map((p, i) => (
                                            <div key={p.uid} className="lb-row-new" onClick={() => openProfile(p.uid)}>
                                                <div className="lb-row-rank">{i + 4}</div>
                                                <div className="lb-row-avatar">
                                                    {p.photoURL ? <img src={p.photoURL} alt="" /> : <span>👤</span>}
                                                </div>
                                                <div className="lb-row-info">
                                                    <div className="lb-row-name">{p.displayName || '—'}</div>
                                                    <div className="lb-row-val">
                                                        {leaderboardTab==='wins' ? `${p.stats?.wins||0} ${t.wins}` : `${window.fmtNum ? window.fmtNum(p.charisma||0) : (p.charisma||0)} ${lang==='ar'?'كاريزما':'Charisma'}`}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {leaderboardTab === 'family' && familyLeaderboard && familyLeaderboard.map((f, i) => (
                                            <div key={f.id} className="lb-row-new" onClick={() => { setViewFamilyId(f.id); setShowFamilyModal(true); }}>
                                                <div className="lb-row-rank">{i + 1}</div>
                                                <div className="lb-row-avatar">
                                                    {f.iconUrl ? <img src={f.iconUrl} alt="" /> : <span>🏠</span>}
                                                </div>
                                                <div className="lb-row-info">
                                                    <div className="lb-row-name">{f.name}</div>
                                                    <div className="lb-row-val">{f.totalPoints || 0} pts</div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {(!leaderboardData || leaderboardData.length === 0) && (
                                            <div style={{padding:'40px',textAlign:'center',color:'var(--text-muted)',fontSize:'12px',opacity:0.5}}>
                                                <div style={{fontSize:'24px',marginBottom:'10px'}}>📊</div>
                                                {lang==='ar' ? 'لا يوجد بيانات حالياً' : 'No data available'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ══ CHAT / شات VIEW ══ */}
                        {activeView === 'chat' && (
                            <div className="chat-content animate-push" style={{paddingBottom:'88px'}}>
                                <div className="sec-head-new" style={{paddingTop:'14px'}}>
                                    <span className="sec-title-new">💬 {lang==='ar' ? 'المحادثات' : 'Chat'}</span>
                                    {friendRequests && friendRequests.length > 0 && (
                                        <button className="sec-action-new" onClick={() => setActiveView('social')}>
                                            {friendRequests.length} {lang==='ar' ? 'طلبات' : 'Requests'}
                                        </button>
                                    )}
                                </div>

                                {/* Search / Add Friend */}
                                <div style={{margin:'0 16px 12px'}}>
                                    <div style={{position:'relative', display:'flex', gap:'8px'}}>
                                        <input 
                                            className="hero-input" 
                                            style={{flex:1, height:'42px', fontSize:'13px'}} 
                                            placeholder={lang==='ar' ? 'ابحث عن صديق بالـ ID...' : 'Search friend by ID...'}
                                            value={addFriendId}
                                            onChange={e => setAddFriendId(e.target.value)}
                                        />
                                        <button 
                                            className="hero-btn-primary" 
                                            style={{width:'42px', padding:0, borderRadius:'12px'}}
                                            onClick={handleAddFriendById}
                                        >🔍</button>
                                    </div>
                                    {friendSearchMsg && <p style={{fontSize:'10px', color:'#00f2ff', marginTop:'4px', padding:'0 4px'}}>{friendSearchMsg}</p>}
                                </div>

                                {/* Friends List */}
                                <div className="friends-list-new" style={{padding:'0 16px'}}>
                                    {friendsData && friendsData.length > 0 ? (
                                        friendsData.map(f => (
                                            <div key={f.uid} className="friend-row-new" onClick={() => openProfile(f.uid)}>
                                                <div className="friend-avatar-new">
                                                    {f.photoURL ? <img src={f.photoURL} alt="" /> : <span>👤</span>}
                                                    {f.isOnline && <div className="online-dot"></div>}
                                                </div>
                                                <div className="friend-info-new">
                                                    <div className="friend-name-new">{f.displayName || '—'}</div>
                                                    <div className="friend-stat-new">
                                                        {f.isOnline ? (lang==='ar'?'متصل الآن':'Online') : (f.lastSeen ? (lang==='ar'?'نشط مؤخراً':'Recently active') : '')}
                                                    </div>
                                                </div>
                                                <div className="friend-actions-new">
                                                    <button className="f-action-btn" onClick={(e) => { e.stopPropagation(); window.openChatWith && window.openChatWith(f.uid); }}>💬</button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{padding:'60px 20px', textAlign:'center', opacity:0.4}}>
                                            <div style={{fontSize:'32px', marginBottom:'12px'}}>👥</div>
                                            <div style={{fontSize:'13px', fontWeight:700}}>{lang==='ar' ? 'لا يوجد أصدقاء بعد' : 'No friends yet'}</div>
                                            <div style={{fontSize:'10px', marginTop:'4px'}}>{lang==='ar' ? 'أضف أصدقاء للعب سوا!' : 'Add friends to play together!'}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ══ DISCOVER / اكتشف VIEW ══ */}
                        {activeView === 'discover' && (
                            <div className="discover-content animate-push" style={{paddingBottom:'88px'}}>
                                <div className="sec-head-new" style={{paddingTop:'14px'}}>
                                    <span className="sec-title-new">🔥 {lang==='ar' ? 'اكتشف' : 'Discover'}</span>
                                </div>
                                <div className="discover-grid-new" style={{padding:'0 16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                                    <div className="disc-card-new" onClick={() => setShowWeddingHall(true)}>
                                        <div className="disc-icon">💍</div>
                                        <div className="disc-label">{lang==='ar' ? 'قاعة الأفراح' : 'Wedding Hall'}</div>
                                    </div>
                                    <div className={`disc-card-new ${userFamily?'':'locked'}`} onClick={() => userFamily ? setShowFamilyChat(true) : setNotification(lang==='ar'?'يجب الانضمام لعائلة أولاً':'Join a family first')}>
                                        <div className="disc-icon">🏠</div>
                                        <div className="disc-label">{lang==='ar' ? 'شات العائلة' : 'Family Chat'}</div>
                                    </div>
                                    <div className="disc-card-new" onClick={() => setShowVIPCenter(true)}>
                                        <div className="disc-icon">👑</div>
                                        <div className="disc-label">{lang==='ar' ? 'مركز الـ VIP' : 'VIP Center'}</div>
                                    </div>
                                    <div className="disc-card-new" onClick={() => setShowBFFModal(true)}>
                                        <div className="disc-icon">💕</div>
                                        <div className="disc-label">{lang==='ar' ? 'نادي الـ BFF' : 'BFF Club'}</div>
                                    </div>
                                </div>
                                
                                {window.MomentsFeed && (
                                    <div style={{marginTop:'24px'}}>
                                        <div className="sec-head-new">
                                            <span className="sec-title-new">📸 {lang==='ar' ? 'اللحظات' : 'Moments'}</span>
                                            <button className="sec-action-new" onClick={() => setShowFriendsMoments(true)}>{lang==='ar'?'الكل':'All'}</button>
                                        </div>
                                        <window.MomentsFeed lang={lang} limit={5} onOpenProfile={openProfile} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══ ME / الملف الشخصي VIEW ══ */}
                        {activeView === 'me' && (
                            <div className="profile-content animate-push" style={{paddingBottom:'88px'}}>
                                {currentUserData && (
                                    <>
                                        <div className="prof-header-new">
                                            <div className="prof-avatar-wrap">
                                                <div className="prof-avatar-new shadow-xl">
                                                    {(currentUserData.photoURL || currentUserData.photo) ? <img src={currentUserData.photoURL || currentUserData.photo} alt="" /> : <span>👤</span>}
                                                </div>
                                                <div className="prof-level-tag">{lang==='ar'?'مستوي':'LVL'} {currentUserData.level || 1}</div>
                                            </div>
                                            <div className="prof-name-new">{currentUserData.displayName || currentUserData.name || 'Guest'}</div>
                                            <div className="prof-id-new" onClick={() => { navigator.clipboard.writeText(currentUID); setNotification(t.codeCopied); }}>ID: {currentUID} 📋</div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="prof-stats-grid">
                                            <div className="prof-stat-card">
                                                <div className="stat-val">{currentUserData.stats?.wins || 0}</div>
                                                <div className="stat-lbl">{t.wins}</div>
                                            </div>
                                            <div className="prof-stat-card">
                                                <div className="stat-val">{window.fmtNum ? window.fmtNum(currentUserData.charisma || 0) : (currentUserData.charisma || 0)}</div>
                                                <div className="stat-lbl">{lang==='ar'?'كاريزما':'Charisma'}</div>
                                            </div>
                                            <div className="prof-stat-card">
                                                <div className="stat-val">{(currentUserData.stats?.games || 0)}</div>
                                                <div className="stat-lbl">{lang==='ar'?'لعبة':'Games'}</div>
                                            </div>
                                        </div>

                                        {/* Level & XP */}
                                        <div style={{margin:'0 20px 24px'}}>
                                            <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1 px-1">
                                                <span>{lang==='ar'?'الخبرة':'Experience'}</span>
                                                <span>{currentUserData.exp || 0} / {(currentUserData.level || 1) * 1000}</span>
                                            </div>
                                            <div className="prof-xp-bar-new">
                                                <div className="prof-xp-fill-new" style={{width: `${Math.min(100, ((currentUserData.exp || 0) / ((currentUserData.level || 1) * 1000)) * 100)}%`}}></div>
                                            </div>
                                        </div>

                                        {/* Settings / Actions */}
                                        <div className="settings-list-new">
                                            <div className="set-item-new" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
                                                <div className="set-icon">🌍</div>
                                                <div className="set-label">{lang === 'ar' ? 'اللغة (English)' : 'Language (العربية)'}</div>
                                            </div>
                                            <div className="set-item-new" onClick={() => { window.toggleMusic && window.toggleMusic(); setNotification(lang==='ar'?'تم تغيير إعدادات الصوت':'Sound settings updated'); }}>
                                                <div className="set-icon">🎵</div>
                                                <div className="set-label">{lang === 'ar' ? 'الموسيقى والصوت' : 'Music & Sound'}</div>
                                            </div>
                                            <div className="set-item-new" onClick={() => setActiveView('social')}>
                                                <div className="set-icon">🤝</div>
                                                <div className="set-label">{lang === 'ar' ? 'نادي الأصدقاء' : 'Friends Club'}</div>
                                            </div>
                                            <div className="set-item-new logout" onClick={() => { firebase.auth().signOut(); }}>
                                                <div className="set-icon">🚪</div>
                                                <div className="set-label">{lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}</div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* ── ROOM VIEW ── */}
                {room && (
                    <div className="new-room-content">
                        {/* Status bar */}
                        <div className="glass-panel rounded-xl p-3 mb-4 flex items-center justify-between border border-white/10 shadow-xl">
                            <div className="flex items-center gap-3">
                                <div className="lobby-code-container">
                                    <button onClick={() => { navigator.clipboard.writeText(roomId); setNotification(t.codeCopied); }} className="lobby-code-btn px-3 py-1.5 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors border border-primary/30 flex items-center gap-2">
                                        <span className="font-mono font-black text-primary text-sm tracking-widest">{roomId}</span>
                                        <span className="text-xs">📋</span>
                                    </button>
                                </div>
                                <div className="h-6 w-px bg-white/10"></div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                    {t.roundsFormat ? t.roundsFormat(room.currentRound || 0, 3) : `Round ${room.currentRound || 0}`}
                                </div>
                            </div>
                            <button onClick={handleLeaveRoom} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group">
                                <span className="text-gray-400 group-hover:text-red-400 text-xs font-bold">{lang==='ar'?'خروج':'Exit'} 🚪</span>
                            </button>
                        </div>

                        {/* Waiting Lobby */}
                        {room.status === 'waiting' && (
                            <div className="animate-pop">
                                <div className="card-container p-6 bg-gradient-to-b from-white/10 to-transparent rounded-3xl border border-white/10">
                                    <h3 className="text-xl font-black mb-6 text-center text-white flex items-center justify-center gap-2">
                                        <span className="text-2xl">⏳</span> {t.lobbyTitle}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3 mb-8">
                                        {room.players.map(p => (
                                            <div key={p.uid} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-all border border-white/5 group cursor-pointer" onClick={() => !p.isBot && openProfile(p.uid)}>
                                                <div className="flex-1" style={{minWidth:0}}>
                                                    {window.PlayerNameTag && <window.PlayerNameTag player={{...p, photoURL:p.photo, displayName:p.name + (p.isBot?' 🤖':'')}} lang={lang} size="md" />}
                                                </div>
                                                {p.uid === room.admin && (
                                                    <span className="text-[8px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30 uppercase">Host</span>
                                                )}
                                            </div>
                                        ))}
                                        {Array.from({length: Math.max(0, 3 - room.players.length)}).map((_, i) => (
                                            <div key={`empty-${i}`} className="h-14 border border-dashed border-white/10 rounded-2xl flex items-center justify-center opacity-40">
                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Waiting...</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {room.admin === currentUID ? (
                                            <button 
                                                onClick={startGame} 
                                                disabled={room.players.length < 3}
                                                className={`w-full py-4 rounded-2xl text-base font-black transition-all shadow-2xl ${room.players.length >= 3 ? 'bg-primary text-black hover:scale-[1.02] hover:shadow-primary/20 cursor-pointer' : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}
                                            >
                                                {room.players.length < 3 ? (lang==='ar' ? 'يحتاج ٣ لاعبين على الأقل' : 'Need 3+ Players') : t.start}
                                            </button>
                                        ) : (
                                            <div className="py-4 text-center bg-white/5 rounded-2xl border border-white/10">
                                                <span className="text-xs text-gray-400 font-bold animate-pulse">{lang==='ar' ? 'في انتظار الأدمن ليبدأ...' : 'Waiting for host...'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Word Reveal / Selection */}
                        {room.status === 'word_selection' && (
                            <div className="animate-pop text-center">
                                <div className="py-12 px-6 rounded-3xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/20 mb-6">
                                    <div className="text-4xl mb-4">🤫</div>
                                    <h3 className="text-2xl font-black text-white mb-2">{lang==='ar' ? 'كلمتك هي' : 'Your Word is'}</h3>
                                    <div className="text-4xl font-black text-primary tracking-tight mb-4">{room.players.find(p => p.uid === currentUID)?.word || '???'}</div>
                                    <div className="text-xs text-gray-400 px-8 leading-relaxed">
                                        {lang==='ar' ? 'لا تخبر أحداً! حاول وصف الكلمة بدون ما كشفها للجاسوس.' : "Don't tell anyone! Describe it without revealing it to the spy."}
                                    </div>
                                </div>
                                <div className="text-sm font-bold text-primary animate-pulse">{t.discussing}</div>
                            </div>
                        )}

                        {/* Gaming States (Discussing / Voting) */}
                        {(room.status === 'discussing' || room.status === 'voting') && (
                            <div className="space-y-4">
                                <div className={`p-4 rounded-3xl border text-center transition-all ${room.status === 'voting' ? 'bg-red-500/10 border-red-500/30' : 'bg-primary/10 border-primary/30'}`}>
                                    <div className="text-xs font-black uppercase tracking-widest mb-1 text-gray-400">
                                        {room.status === 'voting' ? (lang==='ar' ? 'وقت التصويت!' : 'VOTING TIME!') : (lang==='ar' ? 'وقت المناقشة' : 'DISCUSSING')}
                                    </div>
                                    <div className="text-lg font-black text-white">{room.status === 'voting' ? t.voteNow : t.discussing}</div>
                                    {room.timer && <div className="text-2xl font-black text-primary mt-1">{room.timer}s</div>}
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {room.players.map(p => {
                                        const isTarget = p.uid === (room.players.find(me => me.uid === currentUID)?.targetUID);
                                        const isEliminated = p.isVotedOut;
                                        return (
                                            <div 
                                                key={p.uid} 
                                                onClick={() => { if(room.status === 'voting' && !isEliminated && p.uid !== currentUID) window.vote && window.vote(p.uid); }}
                                                className={`relative flex items-center gap-3 p-3 rounded-2xl border transition-all ${isEliminated ? 'opacity-40 filter grayscale scale-95' : 'bg-white/5 active:scale-95 cursor-pointer'} ${isTarget ? 'border-primary/50 bg-primary/10' : 'border-white/5'}`}
                                            >
                                                <div className="flex-1" style={{minWidth:0}}>
                                                    {window.PlayerNameTag ? <window.PlayerNameTag player={p} lang={lang} size="sm" /> : <span>{p.name}</span>}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {p.voteCount > 0 && (
                                                        <div className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            🗳️ {p.voteCount}
                                                        </div>
                                                    )}
                                                    {isEliminated && <span className="text-[10px] font-black text-red-500 uppercase">Eliminated</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Game Over / Results */}
                        {room.status === 'game_results' && (
                            <div className="animate-pop text-center space-y-6">
                                <div className={`py-10 px-6 rounded-3xl bg-gradient-to-b border-2 ${room.winner === 'civil' ? 'from-primary/20 to-transparent border-primary/30' : 'from-red-500/20 to-transparent border-red-500/30'}`}>
                                    <div className="text-5xl mb-4">{room.winner === 'civil' ? '🏆' : '👺'}</div>
                                    <h2 className="text-3xl font-black text-white mb-2">{room.winner === 'civil' ? (lang==='ar'?'المواطنين كسبوا!':'Civilians Win!') : (lang==='ar'?'الجاسوس كسب!':'Spy Wins!')}</h2>
                                    <div className="h-px w-20 bg-white/20 mx-auto my-6"></div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400 font-bold">{lang==='ar'?'كلمة المواطنين':'Civilian Word'}</span>
                                            <span className="text-primary font-black uppercase text-lg">{room.word}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400 font-bold">{lang==='ar'?'كلمة الجاسوس':'Spy Word'}</span>
                                            <span className="text-red-400 font-black uppercase text-lg">{room.spyWord || '???'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {room.admin === currentUID && (
                                        <button onClick={resetGame} className="w-full py-4 rounded-2xl bg-white text-black font-black hover:scale-[1.02] transition-transform">{t.playAgain}</button>
                                    )}
                                    <button onClick={handleLeaveRoom} className="w-full py-4 rounded-2xl bg-white/10 text-white border border-white/10 font-black">{t.leaveRoom}</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                </div>{/* end new-page-content */}

                {/* ── BOTTOM NAV ── */}
                {!room && (
                    <nav className="bottom-nav-new" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
                        <div className={`nav-item-new ${activeView==='lobby'||activeView==='ranking'?'active':''}`} onClick={() => setActiveView('lobby')}>
                            <div className="nav-icon-new">🏠</div>
                            <div className="nav-label-new">{lang==='ar'?'اللوبي':t.tabLobby}</div>
                        </div>
                        <div className={`nav-item-new ${activeView==='chat'?'active':''}`} onClick={() => setActiveView('chat')}>
                            <div className="nav-icon-new">💬</div>
                            <div className="nav-label-new">{lang==='ar'?'شات':'Chat'}</div>
                        </div>
                        <div className={`nav-item-new ${activeView==='discover'?'active':''}`} onClick={() => setActiveView('discover')}>
                            <div className="nav-icon-new">🔥</div>
                            <div className="nav-label-new">{lang==='ar'?'اكتشف':'Discover'}</div>
                        </div>
                        <div className={`nav-item-new ${activeView==='me'?'active':''}`} onClick={() => setActiveView('me')}>
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

                {/* ══ MODALS ══ */}
                {/* (Modal injection remains similar but using window references for components) */}
                {showShop && window.ShopModal && <window.ShopModal show={showShop} onClose={() => setShowShop(false)} userData={userData} onPurchase={handlePurchase} lang={lang} />}
                {showInventory && window.InventoryModal && <window.InventoryModal show={showInventory} onClose={() => setShowInventory(false)} userData={userData} onEquip={handleEquip} onUnequip={handleUnequip} lang={lang} />}
                {showSettings && window.SettingsModal && <window.SettingsModal show={showSettings} onClose={() => setShowSettings(false)} userData={userData} setLang={setLang} lang={lang} />}
                {showVIPCenter && window.VIPCenter && <window.VIPCenter show={showVIPCenter} onClose={() => setShowVIPCenter(false)} userData={userData} onBuyVIP={handleBuyVIP} lang={lang} />}
                {showLoginAlert && window.LoginAlertModal && <window.LoginAlertModal show={showLoginAlert} onClose={() => setShowLoginAlert(false)} onLogin={handleGoogleLogin} lang={lang} />}
                {showSetupModal && (
                    <div className="modal-overlay" onClick={()=>setShowSetupModal(false)}>
                        <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                            <div className="modal-header"><h2 className="modal-title">{t.create}</h2><window.ModalCloseBtn onClose={() => setShowSetupModal(false)} /></div>
                            <div className="modal-body">
                                <div className="space-y-3">
                                    <div><label className="text-[10px] text-gray-400 block mb-1">{t.nickname}</label><input className="input-dark w-full p-2 rounded font-bold text-sm" value={nickname} onChange={e => { setNickname(e.target.value); localStorage.setItem('pro_spy_nick', e.target.value); }} placeholder={t.nickname} /></div>
                                    <div className="flex gap-2"><button onClick={() => setSetupMode('normal')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${setupMode === 'normal' ? 'btn-neon' : 'btn-ghost'}`}>{t.normalMode}</button><button onClick={() => setSetupMode('advanced')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${setupMode === 'advanced' ? 'btn-neon' : 'btn-ghost'}`}>{t.advancedMode}</button></div>
                                </div>
                            </div>
                            <div className="modal-footer"><button onClick={handleCreateGame} disabled={loading || !nickname.trim()} className="btn-neon w-full py-2 rounded-lg text-sm font-bold">{loading ? t.loading : t.create}</button></div>
                        </div>
                    </div>
                )}
            </div>
        );
    };
})();
