(function () {
  /**
   * LobbyView — The main lobby interface.
   */
  window.LobbyView = function ({
    lang, t, currentUserData, isLoggedIn, isGuest,
    nickname, setNickname, inputCode, setInputCode,
    loading, joinError, sessionClaimedToday,
    setShowMyAccount, setShowShop, setShowLoginRewards, setShowSetupModal,
    setShowFunPass, setShowBrowseRooms, setShowPublicChat, setShowUserProfile,
    setShowLuckyGames,
    handleJoinGame, handleCreateGame, setNotification, requireLogin,
    currentUID, user
  }) {

    var fmtNum = window.fmtNum || ((n) => n.toLocaleString());

    return (/*#__PURE__*/
      React.createElement("div", { className: "lobby-view-container", style: { paddingBottom: '8px' } },

      (isLoggedIn || isGuest) && currentUserData && /*#__PURE__*/
      React.createElement(React.Fragment, null, /*#__PURE__*/
      React.createElement("div", { className: "sec-head-new" }, /*#__PURE__*/
      React.createElement("span", { className: "sec-title-new" }, lang === 'ar' ? `مرحباً، ${currentUserData.displayName || currentUserData.name || ''}` : `Hi, ${currentUserData.displayName || currentUserData.name || ''}`, " \uD83D\uDC4B"), /*#__PURE__*/
      React.createElement("button", { className: "sec-action-new", onClick: () => setShowMyAccount(true) }, lang === 'ar' ? 'ملفي' : 'Profile')
      ), /*#__PURE__*/
      React.createElement("div", { className: "stats-strip-new" }, /*#__PURE__*/
      React.createElement("div", { className: "stat-pill-new" }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDFC6"), /*#__PURE__*/React.createElement("span", { className: "sval" }, currentUserData?.stats?.wins || 0), /*#__PURE__*/React.createElement("span", null, lang === 'ar' ? 'انتصار' : t.wins)), /*#__PURE__*/
      React.createElement("div", { className: "stat-pill-new", style: { cursor: 'pointer' }, onClick: () => setShowMyAccount(true) },
      (() => {
        var ch = currentUserData?.charisma || 0;
        var { currentLevel } = window.getCharismaLevel ? window.getCharismaLevel(ch) : { currentLevel: {} };
        return currentLevel?.iconUrl ? /*#__PURE__*/
        React.createElement("img", { src: currentLevel.iconUrl, alt: "", style: { width: '18px', height: '18px', objectFit: 'contain', filter: currentLevel.hasGlow ? `drop-shadow(0 0 4px ${currentLevel.color})` : 'none' } }) : /*#__PURE__*/
        React.createElement("span", { style: { color: currentLevel?.color || '#ffd700' } }, "\u2B50");
      })(), /*#__PURE__*/
      React.createElement("span", { className: "sval gold" }, fmtNum(currentUserData?.charisma || 0)), /*#__PURE__*/
      React.createElement("span", null, lang === 'ar' ? 'كاريزما' : 'Charisma')
      ), /*#__PURE__*/
      React.createElement("div", { className: "stat-pill-new" }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDD25"), /*#__PURE__*/React.createElement("span", { className: "sval green" }, currentUserData?.loginRewards?.streak || 0), /*#__PURE__*/React.createElement("span", null, "Streak"))
      )
      ), /*#__PURE__*/



      React.createElement("div", { className: "fp-promo-new", onClick: () => {if (isLoggedIn) setShowFunPass(true);else requireLogin();} }, /*#__PURE__*/
      React.createElement("div", { className: "fp-promo-emoji" }, "\uD83C\uDF9F\uFE0F"), /*#__PURE__*/
      React.createElement("div", { className: "fp-promo-body" }, /*#__PURE__*/
      React.createElement("div", { className: "fp-promo-title" }, lang === 'ar' ? 'Fun Pass — الموسم الجديد!' : 'Fun Pass — New Season!'), /*#__PURE__*/
      React.createElement("div", { className: "fp-promo-sub" }, lang === 'ar' ? 'أكمل المهام واكسب مكافآت حصرية' : 'Complete tasks and earn exclusive rewards')
      ), /*#__PURE__*/
      React.createElement("div", { className: "fp-promo-arr" }, "\u2192")
      ), /*#__PURE__*/


      React.createElement("div", { className: "sec-head-new" }, /*#__PURE__*/React.createElement("span", { className: "sec-title-new" }, lang === 'ar' ? 'العب دلوقتي' : t.tabLobby)), /*#__PURE__*/
      React.createElement("div", { className: "lobby-hero-new" }, /*#__PURE__*/
      React.createElement("div", { className: "hero-label-new" }, lang === 'ar' ? 'ابدأ أو انضم لأوضة' : t.codePlaceholder), /*#__PURE__*/
      React.createElement("div", { className: "hero-title-new" }, lang === 'ar' ? 'أنت الجاسوس؟' : 'Are You the Spy?'),
      isGuest && /*#__PURE__*/React.createElement(window.GuestBanner, { lang: lang }), /*#__PURE__*/
      React.createElement("div", { className: "hero-input-row" }, /*#__PURE__*/
      React.createElement("input", { className: "hero-input", value: nickname, onChange: (e) => {setNickname(e.target.value);localStorage.setItem('pro_spy_nick', e.target.value);}, placeholder: t.nickname }), /*#__PURE__*/
      React.createElement("button", { className: "hero-btn-primary", onClick: () => setShowSetupModal(true), disabled: !nickname.trim() }, "+ ", t.create)
      ), /*#__PURE__*/
      React.createElement("div", { className: "hero-join-row" }, /*#__PURE__*/
      React.createElement("input", { className: "hero-input hero-code-input", style: { flex: 1 }, value: inputCode, onChange: (e) => setInputCode(e.target.value.toUpperCase()), placeholder: t.codePlaceholder, maxLength: 6 }), /*#__PURE__*/
      React.createElement("button", { className: "hero-btn-primary", onClick: () => handleJoinGame(inputCode, ''), disabled: loading || !inputCode.trim() || !nickname.trim() }, loading ? '...' : t.join)
      ),
      joinError && /*#__PURE__*/React.createElement("p", { style: { fontSize: '11px', color: '#ff4d4d', textAlign: 'center', marginTop: '6px' } }, joinError)
      ), /*#__PURE__*/
      
      /* 🎰 LUCKY GAMES SHORTCUT BOX */
      React.createElement("div", { 
        className: "lucky-games-shortcut-new", 
        onClick: () => { if (isLoggedIn) setShowLuckyGames(true); else requireLogin(); },
        style: {
          margin: '0 16px 12px',
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(112,0,255,0.15), rgba(0,242,255,0.05))',
          borderRadius: '16px',
          border: '1px solid rgba(0,242,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        } 
      }, 
        /* Neon Glow Effect BG */
        React.createElement("div", { style: { position: 'absolute', top: '-50%', left: '-20%', width: '100%', height: '200%', background: 'radial-gradient(circle, rgba(0,242,255,0.1) 0%, transparent 70%)', transform: 'rotate(-25deg)', pointerEvents: 'none' } }),
        
        /* Icon Wrapper */
        React.createElement("div", { 
          style: { 
            width: '44px', height: '44px', borderRadius: '12px', 
            background: 'var(--bg-card)', border: '1px solid rgba(0,242,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', boxShadow: '0 0 12px rgba(0,242,255,0.2)' 
          } 
        }, "🎮"),
        
        /* Text Body */
        React.createElement("div", { style: { flex: 1 } }, 
          React.createElement("div", { style: { fontSize: '15px', fontWeight: 900, color: '#fff', letterSpacing: '0.5px', textShadow: '0 0 8px rgba(0,242,255,0.3)' } }, 
            lang === 'ar' ? 'ألعاب الحرب ⚔️' : 'Lucky & War Games 🎰'
          ),
          React.createElement("div", { style: { fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' } }, 
            lang === 'ar' ? 'العب العاب الحظ واكسب مكافآت ضخمة!' : 'Play games of luck and win massive rewards!'
          )
        ),
        
        /* Action Arrow */
        React.createElement("div", { 
          style: { 
            width: '28px', height: '28px', borderRadius: '50%', 
            background: 'rgba(0,242,255,0.1)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', 
            color: 'var(--primary)', fontSize: '16px', fontWeight: 700 
          } 
        }, "→")
      ),



      React.createElement("div", { className: "sec-head-new" }, /*#__PURE__*/
      React.createElement("span", { className: "sec-title-new" }, "\uD83D\uDFE2 ", lang === 'ar' ? 'الأوض المفتوحة' : 'Open Rooms'), /*#__PURE__*/
      React.createElement("button", { className: "sec-action-new", onClick: () => setShowBrowseRooms(true) }, lang === 'ar' ? 'الكل' : 'All')
      ), /*#__PURE__*/
      React.createElement("div", { className: "rooms-scroll-new" }, /*#__PURE__*/
      React.createElement("div", { className: "room-card-new", onClick: () => setShowBrowseRooms(true) }, /*#__PURE__*/
      React.createElement("div", { className: "rc-mode" }, "\uD83D\uDD75\uFE0F"), /*#__PURE__*/
      React.createElement("div", { className: "rc-name" }, lang === 'ar' ? 'تصفّح الأوض' : 'Browse Rooms'), /*#__PURE__*/
      React.createElement("div", { className: "rc-info", style: { color: 'var(--primary)', marginTop: '6px', fontSize: '11px' } }, "\u2192 ", lang === 'ar' ? 'عرض الكل' : 'View all')
      ), /*#__PURE__*/
      React.createElement("div", { className: "room-card-new", onClick: () => setShowSetupModal(true), style: { border: '1px dashed rgba(0,242,255,0.3)' } }, /*#__PURE__*/
      React.createElement("div", { className: "rc-mode" }, "\u2795"), /*#__PURE__*/
      React.createElement("div", { className: "rc-name" }, t.create), /*#__PURE__*/
      React.createElement("div", { className: "rc-info", style: { marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)' } }, lang === 'ar' ? 'أوضة جديدة' : 'New room')
      )
      ),


      isLoggedIn && currentUserData && /*#__PURE__*/
      React.createElement(React.Fragment, null, /*#__PURE__*/
      React.createElement("div", { className: "sec-head-new" }, /*#__PURE__*/
      React.createElement("span", { className: "sec-title-new" }, "\uD83D\uDCE6 ", lang === 'ar' ? 'مهام اليوم' : 'Daily Tasks')
      ), /*#__PURE__*/
      React.createElement("div", { style: { margin: '0 16px', padding: '16px', background: 'linear-gradient(135deg,rgba(0,242,255,0.05),rgba(112,0,255,0.04))', borderRadius: '14px', border: '1px solid rgba(0,242,255,0.12)' } }, /*#__PURE__*/
      React.createElement(window.DailyTasksComponent, {
        userData: currentUserData,
        user: user,
        lang: lang,
        onClaim: () => {},
        onNotification: setNotification }
      )
      )
      ), /*#__PURE__*/



      React.createElement("div", { className: "sec-head-new", style: { marginTop: '8px' } }, /*#__PURE__*/
      React.createElement("span", { className: "sec-title-new" }, "\uD83C\uDF0D ", lang === 'ar' ? 'الشات العام' : 'Public Chat'), /*#__PURE__*/
      React.createElement("button", { className: "sec-action-new", onClick: () => setShowPublicChat(true) }, lang === 'ar' ? 'فتح' : 'Open')
      ), /*#__PURE__*/
      React.createElement("div", { style: { overflowX: 'hidden', width: '100%', boxSizing: 'border-box', contain: 'layout' } }, /*#__PURE__*/
      React.createElement(window.LobbyPublicChatBox, {
        currentUser: isLoggedIn ? currentUserData : null,
        user: user,
        lang: lang,
        isLoggedIn: isLoggedIn,
        onOpenProfile: (uid) => {window.setTargetProfileUID && window.setTargetProfileUID(uid);window.setShowUserProfile && window.setShowUserProfile(true);},
        currentUID: currentUID,
        onOpenFull: () => setShowPublicChat(true) }
      )
      )
      ));

  };
})();
