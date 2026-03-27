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
            formatBanExpiry, activeRooms, submitVote, submitWordVote
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
                        {isLoggedIn && (
                            <div className="new-notif-center" ref={notificationBellRef}>
                                <div className="new-notif-bell" onClick={() => setShowNotifications(!showNotifications)}>
                                    <i className="fas fa-bell"></i>
                                    {unreadNotifications > 0 && <span className="badge-dot"></span>}
                                </div>
                                {showNotifications && <window.NotificationDropdown show={showNotifications} onClose={() => setShowNotifications(false)} notifications={notifications} onMarkRead={markNotificationRead} onClearAll={clearAllNotifications} onNotificationClick={handleNotificationClick} lang={lang} />}
                            </div>
                        )}
                        <div className="new-hbtn" onClick={() => setShowSettings(true)} title={t.settings}>
                            <i className="fas fa-cog"></i>
                        </div>
                        <div className="new-avatar-btn"
                            onClick={() => {
                                if (isLoggedIn || isGuest) { setActiveView('me'); }
                                else { handleGoogleLogin(); }
                            }}
                            title={lang==='ar'?'ملفي الشخصي':'My Profile'}>
                            {(isLoggedIn || isGuest) && (currentUserData?.photoURL || currentUserData?.photo)
                                ? <img src={currentUserData.photoURL || currentUserData.photo} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} alt="" />
                                : <i className="fas fa-user-circle"></i>
                            }
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
                                    <div className="stats-strip-new">
                                        <div className="stat-pill-new">
                                            <i className="fas fa-coins" style={{ color: '#ffd700' }}></i>
                                            <span className="sval gold">{window.fmtNum ? window.fmtNum(currentUserData?.currency||0) : (currentUserData?.currency||0)}</span>
                                        </div>
                                        <div className="stat-pill-new">
                                            <i className="fas fa-gem" style={{ color: '#00f2ff' }}></i>
                                            <span className="sval">{currentUserData?.gems || 0}</span>
                                        </div>
                                        <div className="stat-pill-new">
                                            <i className="fas fa-star" style={{ color: '#00ff88' }}></i>
                                            <span className="sval green">LVL {currentUserData?.level || 1}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Fun Pass Promo */}
                                <div className="fp-promo-new" onClick={() => { if(isLoggedIn) setShowFunPass(true); else handleGoogleLogin(); }}>
                                    <div className="fp-promo-emoji">🎟️</div>
                                    <div className="fp-promo-body">
                                        <div className="fp-promo-title">{lang==='ar'?'Fun Pass — الموسم الجديد!':'Fun Pass — New Season!'}</div>
                                        <div className="fp-promo-sub">{lang==='ar'?'أكمل المهام واكسب مكافآت حصرية':'Complete tasks and earn exclusive rewards'}</div>
                                    </div>
                                    <div className="fp-promo-arr"><i className="fas fa-chevron-right"></i></div>
                                </div>

                                {/* Lobby Hero */}
                                <div className="lobby-hero-new">
                                    <div className="hero-label-new">{lang==='ar'?'انضم لأوضة':t.codePlaceholder}</div>
                                    <div className="hero-title-new">{lang==='ar'?'من هو الجاسوس؟':'WHO IS THE SPY?'}</div>
                                    <div className="hero-input-row">
                                        <input 
                                            className="hero-input hero-code-input" 
                                            value={inputCode} 
                                            onChange={e => setInputCode(e.target.value.toUpperCase())} 
                                            placeholder={t.codePlaceholder} 
                                            maxLength={6} 
                                        />
                                        <button className="hero-btn-primary" onClick={() => handleJoinGame(inputCode, '')} disabled={loading || !inputCode.trim()}>
                                            {loading ? '...' : t.join}
                                        </button>
                                    </div>
                                    <button className="hero-btn-ghost" style={{width:'100%'}} onClick={() => setShowSetupModal(true)}>
                                        <i className="fas fa-plus" style={{marginRight:'8px'}}></i>
                                        {t.create}
                                    </button>
                                </div>

                                {/* Active Rooms */}
                                <div className="sec-head-new">
                                    <span className="sec-title-new"> غرف مباشرة - Live Rooms</span>
                                    <button className="sec-action-new" onClick={() => setActiveView('discover')}>{lang==='ar'?'الكل':'All'}</button>
                                </div>
                                <div className="rooms-scroll-new">
                                    {activeRooms && activeRooms.map(r => (
                                        <div key={r.id} className="room-card-new" onClick={() => handleJoinGame(r.id)}>
                                            <div className="live-badge">LIVE</div>
                                            <div className="rc-mode">🕵️</div>
                                            <div className="rc-name">{r.name || 'Game Room'}</div>
                                            <div className="rc-info">{(r.players||[]).length}/12 Players</div>
                                        </div>
                                    ))}
                                    <div className="rooms-browse-btn" onClick={() => setActiveView('discover')}>
                                        <i className="fas fa-plus"></i>
                                        <span>Browse All</span>
                                    </div>
                                </div>

                                {/* Daily Tasks */}
                                {isLoggedIn && currentUserData && window.DailyTasksComponent && (
                                    <>
                                        <div className="sec-head-new">
                                            <span className="sec-title-new">المهام اليومية - Daily Tasks</span>
                                        </div>
                                        <div className="tasks-card-new">
                                            <window.DailyTasksComponent
                                                userData={currentUserData}
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
                                <div className="lb-tabs-new">
                                    <div className={`lb-tab-new ${leaderboardTab==='wins'?'active':''}`} onClick={() => setLeaderboardTab('wins')}>{lang==='ar'?'الفوز':'Wins'}</div>
                                    <div className={`lb-tab-new ${leaderboardTab==='charisma'?'active':''}`} onClick={() => setLeaderboardTab('charisma')}>{lang==='ar'?'كاريزما':'Charisma'}</div>
                                    <div className={`lb-tab-new ${leaderboardTab==='family'?'active':''}`} onClick={() => setLeaderboardTab('family')}>{lang==='ar'?'عائلة':'Family'}</div>
                                </div>

                                <div className="podium-new">
                                    {leaderboardData && leaderboardData[1] && (
                                        <div className="podium-slot-new ps-2" onClick={() => openProfile(leaderboardData[1].uid)}>
                                            <div className="p-avatar-new">
                                                {leaderboardData[1].photoURL ? <img src={leaderboardData[1].photoURL} alt="" /> : <i className="fas fa-user"></i>}
                                            </div>
                                            <div className="p-name-new">{leaderboardData[1].displayName || '—'}</div>
                                            <div className="p-score-new">{leaderboardTab==='wins' ? leaderboardData[1].stats?.wins : (window.fmtNum ? window.fmtNum(leaderboardData[1].charisma) : leaderboardData[1].charisma)}</div>
                                            <div className="p-stand-new">2nd</div>
                                        </div>
                                    )}
                                    {leaderboardData && leaderboardData[0] && (
                                        <div className="podium-slot-new ps-1" onClick={() => openProfile(leaderboardData[0].uid)}>
                                            <div className="p-avatar-new">
                                                {leaderboardData[0].photoURL ? <img src={leaderboardData[0].photoURL} alt="" /> : <i className="fas fa-crown" style={{color:'#ffd700'}}></i>}
                                            </div>
                                            <div className="p-name-new">{leaderboardData[0].displayName || '—'}</div>
                                            <div className="p-score-new">{leaderboardTab==='wins' ? leaderboardData[0].stats?.wins : (window.fmtNum ? window.fmtNum(leaderboardData[0].charisma) : leaderboardData[0].charisma)}</div>
                                            <div className="p-stand-new">1st</div>
                                        </div>
                                    )}
                                    {leaderboardData && leaderboardData[2] && (
                                        <div className="podium-slot-new ps-3" onClick={() => openProfile(leaderboardData[2].uid)}>
                                            <div className="p-avatar-new">
                                                {leaderboardData[2].photoURL ? <img src={leaderboardData[2].photoURL} alt="" /> : <i className="fas fa-user"></i>}
                                            </div>
                                            <div className="p-name-new">{leaderboardData[2].displayName || '—'}</div>
                                            <div className="p-score-new">{leaderboardTab==='wins' ? leaderboardData[2].stats?.wins : (window.fmtNum ? window.fmtNum(leaderboardData[2].charisma) : leaderboardData[2].charisma)}</div>
                                            <div className="p-stand-new">3rd</div>
                                        </div>
                                    )}
                                </div>

                                <div className="lb-list-new">
                                    {leaderboardTab !== 'family' ? (
                                        leaderboardData && leaderboardData.slice(3, 30).map((p, i) => (
                                            <div key={p.uid} className="lb-row-new" onClick={() => openProfile(p.uid)}>
                                                <div className="lb-num-new">{i + 4}</div>
                                                <div className="lb-av-new">
                                                    {p.photoURL ? <img src={p.photoURL} alt="" /> : <i className="fas fa-user"></i>}
                                                </div>
                                                <div className="lb-info-new">
                                                    <div className="lb-name-new">{p.displayName || '—'}</div>
                                                    <div className="lb-sub-new">ID: {p.uid.slice(0,8)}</div>
                                                </div>
                                                <div className="lb-val-new">
                                                    {leaderboardTab==='wins' ? p.stats?.wins : (window.fmtNum ? window.fmtNum(p.charisma||0) : (p.charisma||0))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        familyLeaderboard && familyLeaderboard.map((f, i) => (
                                            <div key={f.id} className="lb-row-new" onClick={() => { setViewFamilyId(f.id); setShowFamilyModal(true); }}>
                                                <div className="lb-num-new">{i + 1}</div>
                                                <div className="lb-av-new">
                                                    {f.iconUrl ? <img src={f.iconUrl} alt="" /> : <i className="fas fa-home"></i>}
                                                </div>
                                                <div className="lb-info-new">
                                                    <div className="lb-name-new">{f.name}</div>
                                                    <div className="lb-sub-new">{f.totalPoints || 0} pts</div>
                                                </div>
                                                <div className="lb-val-new">{f.totalPoints || 0}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ══ CHAT VIEW ══ */}
                        {activeView === 'chat' && (
                            <div className="animate-push" style={{paddingBottom:'88px'}}>
                                <div className="sec-head-new">
                                    <span className="sec-title-new">الرسائل - Messages</span>
                                    <button className="sec-action-new">{lang==='ar'?'قراءة الكل':'Mark All Read'}</button>
                                </div>
                                <div className="lb-list-new" style={{margin:'0 16px', borderRadius:'16px', borderTop:'1px solid var(--new-border)'}}>
                                    <div className="lb-row-new" style={{background:'rgba(0,242,255,0.05)'}}>
                                        <div className="lb-av-new" style={{background:'var(--accent)'}}><i className="fas fa-bullhorn"></i></div>
                                        <div className="lb-info-new">
                                            <div className="lb-name-new">Official Announcements</div>
                                            <div className="lb-sub-new" style={{color:'var(--primary)'}}>New update is live!</div>
                                        </div>
                                    </div>
                                    {friendsData && friendsData.filter(f => f.isOnline).map(f => (
                                        <div key={f.uid} className="lb-row-new" onClick={() => window.openChatWith && window.openChatWith(f.uid)}>
                                            <div className="lb-av-new">
                                                {f.photoURL ? <img src={f.photoURL} alt="" /> : <i className="fas fa-user"></i>}
                                            </div>
                                            <div className="lb-info-new">
                                                <div className="lb-name-new">{f.displayName}</div>
                                                <div className="lb-sub-new">{lang==='ar'?'نشط الآن':'Online'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ══ DISCOVER VIEW ══ */}
                        {activeView === 'discover' && (
                            <div className="animate-push" style={{paddingBottom:'88px'}}>
                                <div className="sec-head-new">
                                    <span className="sec-title-new">استكشف - Explore</span>
                                </div>
                                <div className="discover-grid">
                                    <div className="discover-sq" style={{'--dsq-bg': 'rgba(112,0,255,0.1)', '--dsq-border': 'rgba(112,0,255,0.2)'}} onClick={() => setNotification(lang==='ar'?'قريباً!':'Coming Soon!')}>
                                        <div className="dsq-icon" style={{background: 'rgba(112,0,255,0.2)'}}>🎪</div>
                                        <div className="dsq-label">Events<br/>فعالية</div>
                                        <div className="dsq-dot"></div>
                                    </div>
                                    <div className="discover-sq" style={{'--dsq-bg': 'rgba(0,242,255,0.1)', '--dsq-border': 'rgba(0,242,255,0.2)'}} onClick={() => setNotification(lang==='ar'?'قريباً!':'Coming Soon!')}>
                                        <div className="dsq-icon" style={{background: 'rgba(0,242,255,0.2)'}}>🏆</div>
                                        <div className="dsq-label">Leagues<br/>البطولات</div>
                                    </div>
                                    <div className="discover-sq" style={{'--dsq-bg': 'rgba(255,0,85,0.1)', '--dsq-border': 'rgba(255,0,85,0.2)'}} onClick={() => setShowVIPCenter(true)}>
                                        <div className="dsq-icon" style={{background: 'rgba(255,0,85,0.2)'}}>👑</div>
                                        <div className="dsq-label">VIP Center<br/>مركز الـ VIP</div>
                                    </div>
                                    <div className="discover-sq" style={{'--dsq-bg': 'rgba(255,215,0,0.1)', '--dsq-border': 'rgba(255,215,0,0.2)'}} onClick={() => setNotification(lang==='ar'?'قريباً!':'Coming Soon!')}>
                                        <div className="dsq-icon" style={{background: 'rgba(255,215,0,0.2)'}}>🎰</div>
                                        <div className="dsq-label">Lucky Spin<br/>عجلة الحظ</div>
                                    </div>
                                    <div className="discover-sq" style={{'--dsq-bg': 'rgba(0,255,136,0.1)', '--dsq-border': 'rgba(0,255,136,0.2)'}} onClick={() => setNotification(lang==='ar'?'قريباً!':'Coming Soon!')}>
                                        <div className="dsq-icon" style={{background: 'rgba(0,255,136,0.2)'}}>👫</div>
                                        <div className="dsq-label">Clans<br/>القبائل</div>
                                    </div>
                                    <div className="discover-sq" style={{'--dsq-bg': 'rgba(255,255,255,0.05)', '--dsq-border': 'rgba(255,255,255,0.1)'}} onClick={() => setShowShop(true)}>
                                        <div className="dsq-icon" style={{background: 'rgba(255,255,255,0.1)'}}>🎁</div>
                                        <div className="dsq-label">Rewards<br/>الجوائز</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ══ ME VIEW ══ */}
                        {activeView === 'me' && (
                            <div className="animate-push" style={{paddingBottom:'88px'}}>
                                {currentUserData && (
                                    <>
                                        <div className="me-hero-card" onClick={() => openProfile(currentUID)}>
                                            <div className="me-hero-avatar">
                                                {(currentUserData.photoURL || currentUserData.photo) ? <img src={currentUserData.photoURL || currentUserData.photo} alt="" /> : <i className="fas fa-user"></i>}
                                            </div>
                                            <div className="me-hero-info">
                                                <div className="me-hero-name">{currentUserData.displayName || 'Elite Player'}</div>
                                                <div className="me-hero-id">ID: {currentUID.slice(0,8)}</div>
                                                <div className="me-hero-stats-row">
                                                    <span>{currentUserData.stats?.wins || 0}</span> {lang==='ar'?'فوز':'Wins'}
                                                    <span>{currentUserData.level || 1}</span> {lang==='ar'?'مستوى':'Lvl'}
                                                </div>
                                            </div>
                                            <div className="me-hero-arr"><i className="fas fa-chevron-right"></i></div>
                                        </div>

                                        <div className="me-actions-grid" style={{marginTop:'16px'}}>
                                            <div className="me-action-card" onClick={() => setShowInventory(true)}>
                                                <div className="me-action-icon" style={{background:'rgba(0,242,255,0.1)', color:'var(--primary)'}}><i className="fas fa-briefcase"></i></div>
                                                <div className="me-action-label">{lang==='ar'?'الحقيبة':'Inventory'}</div>
                                            </div>
                                            <div className="me-action-card" onClick={() => setShowShop(true)}>
                                                <div className="me-action-icon" style={{background:'rgba(255,215,0,0.1)', color:'var(--gold)'}}><i className="fas fa-shopping-bag"></i></div>
                                                <div className="me-action-label">{lang==='ar'?'المتجر':'Shop'}</div>
                                            </div>
                                            <div className="me-action-card" onClick={() => window.FriendSystem?.show()}>
                                                <div className="me-action-icon" style={{background:'rgba(0,255,136,0.1)', color:'#00ff88'}}><i className="fas fa-users"></i></div>
                                                <div className="me-action-label">{lang==='ar'?'الأصدقاء':'Friends'}</div>
                                            </div>
                                            <div className="me-action-card" onClick={() => setShowSettings(true)}>
                                                <div className="me-action-icon" style={{background:'rgba(255,255,255,0.05)', color:'#fff'}}><i className="fas fa-cog"></i></div>
                                                <div className="me-action-label">{lang==='ar'?'الإعدادات':'Settings'}</div>
                                            </div>
                                            <div className="me-action-card logout" onClick={handleLogout}>
                                                <div className="me-action-icon" style={{background:'rgba(255,0,85,0.1)', color:'var(--accent)'}}><i className="fas fa-sign-out-alt"></i></div>
                                                <div className="me-action-label">{lang==='ar'?'خروج':'Logout'}</div>
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
