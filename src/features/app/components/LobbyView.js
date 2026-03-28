(function() {
    /**
     * LobbyView — The main lobby interface.
     */
    window.LobbyView = function({
        lang, t, currentUserData, isLoggedIn, isGuest,
        nickname, setNickname, inputCode, setInputCode,
        loading, joinError, sessionClaimedToday,
        setShowMyAccount, setShowShop, setShowLoginRewards, setShowSetupModal,
        setShowFunPass, setShowBrowseRooms, setShowPublicChat, setShowUserProfile,
        handleJoinGame, handleCreateGame, setNotification, requireLogin,
        currentUID, user
    }) {
        var fmtNum = window.fmtNum || ((n) => n.toLocaleString());

        return (
            <div className="lobby-view-container" style={{paddingBottom:'8px'}}>
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
                                    var { currentLevel } = window.getCharismaLevel ? window.getCharismaLevel(ch) : { currentLevel: {} };
                                    return currentLevel?.iconUrl
                                        ? <img src={currentLevel.iconUrl} alt="" style={{width:'18px',height:'18px',objectFit:'contain', filter: currentLevel.hasGlow?`drop-shadow(0 0 4px ${currentLevel.color})`:'none'}} />
                                        : <span style={{color: currentLevel?.color||'#ffd700'}}>⭐</span>;
                                })()}
                                <span className="sval gold">{fmtNum(currentUserData?.charisma||0)}</span>
                                <span>{lang==='ar'?'كاريزما':'Charisma'}</span>
                            </div>
                            <div className="stat-pill-new"><span>🔥</span><span className="sval green">{currentUserData?.loginRewards?.streak || 0}</span><span>Streak</span></div>
                        </div>
                    </>
                )}

                {/* Fun Pass Promo */}
                <div className="fp-promo-new" onClick={() => { if(isLoggedIn) setShowFunPass(true); else requireLogin(); }}>
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
                    {joinError && <p style={{fontSize:'11px',color:'#ff4d4d',textAlign:'center',marginTop:'6px'}}>{joinError}</p>}
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
                {isLoggedIn && currentUserData && (
                    <>
                        <div className="sec-head-new">
                            <span className="sec-title-new">📦 {lang==='ar'?'مهام اليوم':'Daily Tasks'}</span>
                        </div>
                        <div style={{margin:'0 16px', padding:'16px', background:'linear-gradient(135deg,rgba(0,242,255,0.05),rgba(112,0,255,0.04))', borderRadius:'14px', border:'1px solid rgba(0,242,255,0.12)'}}>
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

                {/* Public Chat Box */}
                <div className="sec-head-new" style={{marginTop:'8px'}}>
                    <span className="sec-title-new">🌍 {lang==='ar'?'الشات العام':'Public Chat'}</span>
                    <button className="sec-action-new" onClick={() => setShowPublicChat(true)}>{lang==='ar'?'فتح':'Open'}</button>
                </div>
                <div style={{overflowX:'hidden',width:'100%',boxSizing:'border-box',contain:'layout'}}>
                    <window.LobbyPublicChatBox
                        currentUser={isLoggedIn ? currentUserData : null}
                        user={user}
                        lang={lang}
                        isLoggedIn={isLoggedIn}
                        onOpenProfile={(uid) => { window.setTargetProfileUID && window.setTargetProfileUID(uid); window.setShowUserProfile && window.setShowUserProfile(true); }}
                        currentUID={currentUID}
                        onOpenFull={() => setShowPublicChat(true)}
                    />
                </div>
            </div>
        );
    };
})();
