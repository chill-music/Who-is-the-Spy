(function () {
  /**
   * LobbyView — The main lobby interface.
   * ⚡ OVERDRIVE + POLISHED EDITION
   */
  window.LobbyView = function ({
    lang, t, currentUserData, isLoggedIn, isGuest,
    nickname, setNickname, inputCode, setInputCode,
    loading, joinError, sessionClaimedToday,
    setShowMyAccount, setShowShop, setShowLoginRewards, setShowSetupModal,
    setShowFunPass, setShowPublicChat, setShowUserProfile,
    setShowLuckyGames,
    handleJoinGame, handleCreateGame, setNotification, requireLogin,
    currentUID, user
  }) {
    var { useState, useMemo, useEffect, useRef } = React;
    var [selectedGameId, setSelectedGameId] = useState('spy');
    
    // --- ⚡ OVERDRIVE: CountUp Hook ---
    function useCountUp(targetValue, duration = 1800) {
      const [count, setCount] = useState(0);
      const startTimeRef = useRef(null);

      useEffect(() => {
        startTimeRef.current = null;
        let animationFrame;

        const step = (timestamp) => {
          if (!startTimeRef.current) startTimeRef.current = timestamp;
          const progress = timestamp - startTimeRef.current;
          const percentage = Math.min(progress / duration, 1);
          
          // Quart Out Easing for smoother deceleration
          const easedProgress = 1 - Math.pow(1 - percentage, 4);
          setCount(Math.floor(easedProgress * targetValue));

          if (progress < duration) {
            animationFrame = requestAnimationFrame(step);
          } else {
            setCount(targetValue);
          }
        };

        animationFrame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animationFrame);
      }, [targetValue, duration]);

      return count;
    }

    var games = window.GAMES_CONFIG || [];
    var selectedGame = useMemo(() => {
        return games.find(g => g.id === selectedGameId) || games[0];
    }, [selectedGameId, games]);

    var fmtNum = window.fmtNum || ((n) => n.toLocaleString());

    // Stats Counters
    const animatedWins = useCountUp(currentUserData?.stats?.wins || 0);
    const animatedCharisma = useCountUp(currentUserData?.charisma || 0);
    const animatedStreak = useCountUp(currentUserData?.loginRewards?.streak || 0);

    return (/*#__PURE__*/
      React.createElement("div", { className: "lobby-view-container", style: { paddingBottom: 'var(--spacing-sm)' } },

      (isLoggedIn || isGuest) && currentUserData && /*#__PURE__*/
      React.createElement(React.Fragment, null, /*#__PURE__*/
      React.createElement("div", { className: "lobby-reveal delay-1" }, /*#__PURE__*/
      React.createElement("div", { className: "sec-head-new" }, /*#__PURE__*/
      React.createElement("span", { className: "sec-title-new" }, lang === 'ar' ? `مرحباً، ${currentUserData.displayName || currentUserData.name || ''}` : `Hi, ${currentUserData.displayName || currentUserData.name || ''}`, " \uD83D\uDC4B"), /*#__PURE__*/
      React.createElement("button", { className: "sec-action-new hover-lift", onClick: () => setShowMyAccount(true) }, lang === 'ar' ? 'ملفي' : 'Profile')
      ), /*#__PURE__*/
      React.createElement("div", { className: "stats-strip-new", style: { gap: 'var(--spacing-sm)' } }, /*#__PURE__*/
      React.createElement("div", { className: "stat-pill-new hover-lift shimmer-premium", style: { borderRadius: 'var(--radius-md)' } }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDFC6"), /*#__PURE__*/React.createElement("span", { className: "sval" }, animatedWins), /*#__PURE__*/React.createElement("span", null, lang === 'ar' ? 'انتصار' : t.wins)), /*#__PURE__*/
      React.createElement("div", { className: "stat-pill-new hover-lift shimmer-premium", style: { cursor: 'pointer', borderRadius: 'var(--radius-md)' }, onClick: () => setShowMyAccount(true) },
      (() => {
        var ch = currentUserData?.charisma || 0;
        var { currentLevel } = window.getCharismaLevel ? window.getCharismaLevel(ch) : { currentLevel: {} };
        return currentLevel?.iconUrl ? /*#__PURE__*/
        React.createElement("img", { src: currentLevel.iconUrl, alt: "", style: { width: '18px', height: '18px', objectFit: 'contain', filter: currentLevel.hasGlow ? `drop-shadow(0 0 4px ${currentLevel.color})` : 'none' } }) : /*#__PURE__*/
        React.createElement("span", { style: { color: currentLevel?.color || '#ffd700' } }, "\u2B50");
      })(), /*#__PURE__*/
      React.createElement("span", { className: "sval gold" }, fmtNum(animatedCharisma)), /*#__PURE__*/
      React.createElement("span", null, lang === 'ar' ? 'كاريزما' : 'Charisma')
      ), /*#__PURE__*/
      React.createElement("div", { className: "stat-pill-new hover-lift", style: { borderRadius: 'var(--radius-md)' } }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDD25"), /*#__PURE__*/React.createElement("span", { className: "sval green" }, animatedStreak), /*#__PURE__*/React.createElement("span", null, "Streak"))
      )
      )
      ), /*#__PURE__*/

      /* Fun Pass promo — hidden when disabled */
      !window.FUN_PASS_DISABLED && /*#__PURE__*/
      React.createElement("div", { className: "lobby-reveal delay-2" }, /*#__PURE__*/
      React.createElement("div", { className: "fp-promo-new hover-lift pulse-subtle shimmer-premium", style: { borderRadius: 'var(--radius-lg)' }, onClick: () => {if (isLoggedIn) setShowFunPass(true);else requireLogin();} }, /*#__PURE__*/
      React.createElement("div", { className: "fp-promo-emoji" }, "\uD83C\uDF9F\uFE0F"), /*#__PURE__*/
      React.createElement("div", { className: "fp-promo-body" }, /*#__PURE__*/
      React.createElement("div", { className: "fp-promo-title" }, lang === 'ar' ? 'Fun Pass — الموسم الجديد!' : 'Fun Pass — New Season!'), /*#__PURE__*/
      React.createElement("div", { className: "fp-promo-sub" }, lang === 'ar' ? 'أكمل المهام واكسب مكافآت حصرية' : 'Complete tasks and earn exclusive rewards')
      ), /*#__PURE__*/
      React.createElement("div", { className: "fp-promo-arr" }, "\u2192")
      )
      ), /*#__PURE__*/

      React.createElement("div", { className: "lobby-reveal delay-3" }, /*#__PURE__*/
      React.createElement("div", { className: "sec-head-new" }, /*#__PURE__*/React.createElement("span", { className: "sec-title-new" }, lang === 'ar' ? 'العب دلوقتي' : t.tabLobby)), /*#__PURE__*/
      
      /* 🎮 GAME SELECTOR ROW */
      React.createElement("div", { className: "game-selector-row", style: {
          display: 'flex', gap: 'var(--spacing-md)', overflowX: 'auto', padding: '0 var(--spacing-lg) var(--spacing-lg)',
          scrollbarWidth: 'none', msOverflowStyle: 'none'
      }}, 
        games.map(game => {
            var isActive = game.status === 'active';
            var isSelected = selectedGameId === game.id;
            return React.createElement("div", {
                key: game.id,
                className: `game-option hover-lift ${isSelected ? 'selected' : ''} ${!isActive ? 'coming-soon' : ''}`,
                onClick: () => {
                    if (isActive) setSelectedGameId(game.id);
                    else window.showToast ? window.showToast(lang === 'ar' ? 'قريباً...' : 'Coming Soon...', 'info') : null;
                },
                style: {
                    minWidth: '82px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-sm)',
                    padding: 'var(--spacing-md) var(--spacing-sm)', borderRadius: 'var(--radius-lg)', cursor: isActive ? 'pointer' : 'default',
                    background: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? (game.theme?.color || 'var(--primary)') : 'rgba(255,255,255,0.1)'}`,
                    opacity: isActive ? 1 : 0.6,
                    filter: !isActive ? 'grayscale(1)' : 'none',
                    transition: 'all 0.4s var(--spring-soft)',
                    position: 'relative',
                    boxShadow: isSelected ? `0 0 15px ${(game.theme?.color || 'var(--primary)')}33` : 'none'
                }
            },
                React.createElement("div", { className: "game-icon-container", style: { width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                    (game.theme?.iconUrl || game.iconUrl) ? 
                    React.createElement("img", { src: game.theme?.iconUrl || game.iconUrl, style: { width: '100%', height: '100%', objectFit: 'contain' } }) :
                    React.createElement("span", { style: { fontSize: '24px' } }, game.icon)
                ),
                React.createElement("span", { style: { fontSize: '10px', fontWeight: 800, whiteSpace: 'nowrap', color: isSelected ? '#fff' : 'rgba(255,255,255,0.7)' } }, game.name[lang] || game.name.en),
                !isActive && React.createElement("div", { style: {
                    position: 'absolute', top: '-4px', right: '-4px', background: '#333',
                    borderRadius: '50%', width: '18px', height: '18px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '10px',
                    border: '1px solid #555', zIndex: 2
                }}, "🔒")
            );
        })
      )
      ), /*#__PURE__*/

      /* 🏎️ DYNAMIC HERO CARD */
      React.createElement("div", { className: "lobby-reveal delay-4" }, /*#__PURE__*/
      React.createElement("div", { 
          className: "lobby-hero-new shimmer-premium",
          style: {
              background: selectedGame?.theme?.bgGradient || 'var(--bg-card)',
              boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 15px ${selectedGame?.theme?.glow ? selectedGame.theme.glow.replace('0.5', '0.2') : 'rgba(0,0,0,0.1)'}`,
              borderColor: selectedGame?.theme?.color || 'rgba(255,255,255,0.1)',
              '--hero-logo': selectedGame?.theme?.logoUrl ? `url("${selectedGame.theme.logoUrl}")` : 'none',
              transition: 'all 0.6s var(--spring-ease)',
              borderRadius: 'var(--radius-lg)'
          }
      }, /*#__PURE__*/
      React.createElement("div", { className: "hero-label-new" }, lang === 'ar' ? 'ابدأ أو انضم لأوضة' : t.codePlaceholder), /*#__PURE__*/
      React.createElement("div", { className: "hero-title-new", style: { color: selectedGame?.theme?.color || '#fff' } }, 
        React.createElement("span", { className: "hero-icon-fix" }, 
            selectedGame?.theme?.iconUrl ? 
            React.createElement("img", { src: selectedGame.theme.iconUrl, style: { width: '32px', height: '32px', objectFit: 'contain' } }) :
            selectedGame?.icon
        ),
        " ",
        React.createElement("span", { className: "hero-text-gradient" }, selectedGame?.name[lang] || selectedGame?.name?.en)
      ),
      React.createElement("p", { style: { 
          fontSize: '12px', color: 'rgba(255,255,255,0.7)', textAlign: 'center', 
          margin: '-10px 0 var(--spacing-lg)', padding: '0 var(--spacing-xl)', lineHeight: '1.4' 
      }}, selectedGame?.description[lang] || selectedGame?.description?.en),
 
      isGuest && /*#__PURE__*/React.createElement(window.GuestBanner, { lang: lang }), /*#__PURE__*/
      React.createElement("div", { className: "hero-input-row", style: { gap: 'var(--spacing-sm)' } }, /*#__PURE__*/
      React.createElement("input", { className: "hero-input", style: { borderRadius: 'var(--radius-md)' }, value: nickname, onChange: (e) => {setNickname(e.target.value);localStorage.setItem('pro_spy_nick', e.target.value);}, placeholder: t.nickname }), /*#__PURE__*/
      React.createElement("button", { 
          className: "hero-btn-primary hover-lift", 
          style: { background: selectedGame?.theme?.color || 'var(--primary)', borderRadius: 'var(--radius-md)' },
          onClick: () => setShowSetupModal(true, { gameId: selectedGameId }), 
          disabled: !nickname.trim() 
      }, "+ ", t.create)
      ), /*#__PURE__*/
      React.createElement("div", { className: "hero-join-row", style: { gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' } }, /*#__PURE__*/
      React.createElement("input", { className: "hero-input hero-code-input", style: { flex: 1, borderRadius: 'var(--radius-md)' }, value: inputCode, onChange: (e) => setInputCode(e.target.value.toUpperCase()), placeholder: t.codePlaceholder, maxLength: 6 }), /*#__PURE__*/
      React.createElement("button", { 
          className: "hero-btn-primary hover-lift", 
          style: { background: selectedGame?.theme?.color || 'var(--primary)', borderRadius: 'var(--radius-md)' },
          onClick: () => handleJoinGame(inputCode, '', { gameId: selectedGameId }), 
          disabled: loading || !inputCode.trim() || !nickname.trim() 
      }, loading ? '...' : t.join)
      ),
      joinError && /*#__PURE__*/React.createElement("p", { style: { fontSize: '11px', color: '#ff4d4d', textAlign: 'center', marginTop: 'var(--spacing-xs)' } }, joinError)
      )
      ), /*#__PURE__*/
      
      /* 🎰 LUCKY GAMES SHORTCUT BOX */
      React.createElement("div", { className: "lobby-reveal delay-5" }, /*#__PURE__*/
      React.createElement("div", { 
        className: "lucky-games-shortcut-new hover-lift pulse-subtle shimmer-premium", 
        onClick: () => { if (isLoggedIn) setShowLuckyGames(true); else requireLogin(); },
        style: {
          margin: '0 var(--spacing-lg) var(--spacing-md)',
          padding: 'var(--spacing-lg)',
          background: 'linear-gradient(135deg, rgba(112,0,255,0.15), rgba(0,242,255,0.05))',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(0,242,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-md)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          transition: 'all 0.3s var(--spring-ease)'
        } 
      }, 
        /* Neon Glow Effect BG */
        React.createElement("div", { style: { position: 'absolute', top: '-50%', left: '-20%', width: '100%', height: '200%', background: 'radial-gradient(circle, rgba(0,242,255,0.1) 0%, transparent 70%)', transform: 'rotate(-25deg)', pointerEvents: 'none' } }),
        
        /* Icon Wrapper */
        React.createElement("div", { 
          style: { 
            width: '44px', height: '44px', borderRadius: 'var(--radius-md)', 
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
      )
      ),

      isLoggedIn && currentUserData && /*#__PURE__*/
      React.createElement("div", { className: "lobby-reveal delay-6" }, /*#__PURE__*/
      React.createElement(React.Fragment, null, /*#__PURE__*/
      React.createElement("div", { className: "sec-head-new" }, /*#__PURE__*/
      React.createElement("span", { className: "sec-title-new" }, "\uD83D\uDCE6 ", lang === 'ar' ? 'مهام اليوم' : 'Daily Tasks')
      ), /*#__PURE__*/
      React.createElement("div", { className: "hover-lift shimmer-premium", style: { margin: '0 var(--spacing-lg)', padding: 'var(--spacing-lg)', background: 'linear-gradient(135deg,rgba(0,242,255,0.05),rgba(112,0,255,0.04))', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(0,242,255,0.12)' } }, /*#__PURE__*/
      React.createElement(window.DailyTasksComponent, {
        userData: currentUserData,
        user: user,
        lang: lang,
        onClaim: () => {},
        onNotification: setNotification }
      )
      )
      )
      ), /*#__PURE__*/

      React.createElement("div", { className: "lobby-reveal delay-7" }, /*#__PURE__*/
      React.createElement("div", { className: "sec-head-new", style: { marginTop: 'var(--spacing-sm)' } }, /*#__PURE__*/
      React.createElement("span", { className: "sec-title-new" }, "\uD83C\uDF0D ", lang === 'ar' ? 'الشات العام' : 'Public Chat'), /*#__PURE__*/
      React.createElement("button", { className: "sec-action-new hover-lift", onClick: () => setShowPublicChat(true) }, lang === 'ar' ? 'فتح' : 'Open')
      ), /*#__PURE__*/
      React.createElement("div", { className: "hover-lift shimmer-premium", style: { overflowX: 'hidden', width: '100%', boxSizing: 'border-box', contain: 'layout', borderRadius: 'var(--radius-lg)' } }, /*#__PURE__*/
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
      )
      ));

  };
})();
