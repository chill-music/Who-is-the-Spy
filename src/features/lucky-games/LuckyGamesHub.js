/* ============================================================
   LuckyGamesHub.js — Lucky Games Hub Modal
   - 7 game slots (1 active: Lucky Fruit, 6 Coming Soon)
   - Full-screen modal like Shop (same size/feel)
   - Reads identity from window.useAuthState()
   - Exports: window.LuckyGamesHubModal
   ============================================================ */
(function () {
  'use strict';

  var { useState, useEffect, useRef, useCallback } = React;

  /* ── Game definitions ── */
  var GAMES = [
    {
      id: 'lucky_fruit',
      nameAr: 'فاكهة الحظ',
      nameEn: 'Lucky Fruit',
      descAr: 'سلوتس الفاكهة — لف واربح!',
      descEn: 'Fruit Slots — Spin & Win!',
      emoji: '🍒',
      imgKey: 'lucky_fruit',
      active: true,
      gradient: 'linear-gradient(135deg, #3A1A8A, #7B3FFF)',
      glowColor: 'rgba(123,63,255,0.5)'
    },
    {
      id: 'super_777',
      nameAr: 'سوبر 777',
      nameEn: 'Super 777',
      descAr: 'شبارة الحظ — 777 واكسب الجائزة!',
      descEn: 'Lucky Slots — Hit 777 & Win Big!',
      emoji: '7️⃣',
      active: true,
      gradient: 'linear-gradient(135deg, #1A0A00, #8A5200)',
      glowColor: 'rgba(212,175,55,0.5)'
    },
    {
      id: 'soccer_star',
      nameAr: 'نجم الكرة',
      nameEn: 'Soccer Star',
      descAr: 'توقع الفائز — واربط نقاطك!',
      descEn: 'Pick the winner — Win Big!',
      emoji: '⚽',
      active: true,
      gradient: 'linear-gradient(135deg, #0d5123, #1db954)',
      glowColor: 'rgba(29,185,84,0.5)'
    },
    {
      id: 'greedy_cat',
      nameAr: 'القط الجائع',
      nameEn: 'Greedy Cat',
      descAr: 'عجلة الطعام — راهن واربح!',
      descEn: 'Food Wheel — Bet & Win!',
      emoji: '😸',
      active: true,
      gradient: 'linear-gradient(135deg, #29bde8, #1a9ec7)',
      glowColor: 'rgba(26,158,199,0.5)'
    },
    { id: 'crash_game', nameAr: 'صاروخ الحظ', nameEn: 'Rocket Crash', emoji: '🚀', active: true, gradient: 'linear-gradient(135deg,#4A00E0,#8E2DE2)', glowColor: 'rgba(142,45,226,0.5)' },
    { id: 'game5', nameAr: 'قريباً', nameEn: 'Coming Soon', emoji: '🎯', active: false, gradient: 'linear-gradient(135deg,#1a1a2e,#16213e)', glowColor: 'rgba(255,255,255,0.05)' },
    { id: 'game6', nameAr: 'قريباً', nameEn: 'Coming Soon', emoji: '🏆', active: false, gradient: 'linear-gradient(135deg,#1a1a2e,#16213e)', glowColor: 'rgba(255,255,255,0.05)' },
    { id: 'game7', nameAr: 'قريباً', nameEn: 'Coming Soon', emoji: '⚡', active: false, gradient: 'linear-gradient(135deg,#1a1a2e,#16213e)', glowColor: 'rgba(255,255,255,0.05)' }];


  /* ── Single Game Slot Card ── */
  var GameSlotCard = function (props) {
    var game = props.game;
    var lang = props.lang;
    var onClick = props.onClick;
    var [hovered, setHovered] = useState(false);

    var name = lang === 'ar' ? game.nameAr : game.nameEn;
    var desc = lang === 'ar' ? game.descAr || '' : game.descEn || '';

    return (
      React.createElement('div', {
        onClick: game.active ? onClick : null,
        onMouseEnter: function () { if (game.active) setHovered(true); },
        onMouseLeave: function () { setHovered(false); },
        style: {
          background: game.gradient,
          borderRadius: '16px',
          border: game.active ?
            '1.5px solid ' + (hovered ? '#FFD700' : 'rgba(255,215,0,0.4)') :
            '1.5px solid rgba(255,255,255,0.07)',
          padding: '16px 10px 14px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          cursor: game.active ? 'pointer' : 'default',
          transition: 'all 0.2s',
          transform: hovered && game.active ? 'translateY(-3px) scale(1.02)' : 'none',
          boxShadow: hovered && game.active ?
            '0 8px 28px ' + game.glowColor :
            '0 2px 10px rgba(0,0,0,0.3)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '120px',
          justifyContent: 'center'
        }
      },
        /* Shimmer overlay for active */
        game.active && React.createElement('div', {
          style: {
            position: 'absolute', top: 0, left: '-100%',
            width: '60%', height: '100%',
            background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)',
            animation: 'lg-shimmer 2.5s infinite',
            pointerEvents: 'none'
          }
        }),

        /* Game image or emoji */
        React.createElement('div', {
          style: {
            width: '60px', height: '60px', borderRadius: '14px',
            background: game.active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
            border: game.active ? '1.5px solid rgba(255,215,0,0.4)' : '1.5px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px',
            boxShadow: game.active ? '0 0 14px ' + game.glowColor : 'none',
            flexShrink: 0
          }
        }, game.emoji),

        /* Name */
        React.createElement('div', {
          style: {
            fontSize: '12px', fontWeight: 900, color: game.active ? '#fff' : 'rgba(255,255,255,0.3)',
            textAlign: 'center', lineHeight: 1.2
          }
        }, name),

        /* Desc / Coming Soon badge */
        game.active && desc ?
          React.createElement('div', {
            style: { fontSize: '10px', color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 1.3 }
          }, desc) :
          !game.active && React.createElement('div', {
            style: {
              fontSize: '9px', fontWeight: 700, letterSpacing: '1px',
              padding: '2px 8px', borderRadius: '20px',
              background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.25)',
              border: '1px solid rgba(255,255,255,0.1)'
            }
          }, lang === 'ar' ? 'قريباً' : 'COMING SOON'),

        /* PLAY button for active game */
        game.active && React.createElement('div', {
          style: {
            marginTop: '4px',
            padding: '5px 16px', borderRadius: '20px',
            background: hovered ?
              'linear-gradient(135deg,#FFD700,#FF8C00)' :
              'linear-gradient(135deg,rgba(255,215,0,0.8),rgba(255,140,0,0.7))',
            color: '#1a0a3b',
            fontSize: '11px', fontWeight: 900,
            transition: 'all 0.2s',
            boxShadow: hovered ? '0 4px 14px rgba(255,215,0,0.5)' : 'none'
          }
        }, lang === 'ar' ? '▶ العب' : '▶ PLAY')
      ));

  };

  /* ══════════════════════════════════════════════════════════
     MAIN LUCKY GAMES HUB MODAL
  ══════════════════════════════════════════════════════════ */
  var LuckyGamesHubModal = function (props) {
    var show = props.show;
    var onClose = props.onClose;
    var lang = props.lang || 'en';
    var userData = props.userData;

    var [activeGame, setActiveGame] = useState(null); // 'lucky_fruit' | null
    var [miniProfile, setMiniProfile] = useState(null);
    var gameContainerRef = useRef(null);

    /* Connectivity Heartbeat */
    useEffect(function() {
      if (!window.db) return;
      var uid = window.auth && window.auth.currentUser ? window.auth.currentUser.uid : 'guest';
      var heartbeatRef = window.usersCollection ? window.usersCollection.doc(uid) : null;
      if (!heartbeatRef) return;
      
      window._activeListeners = (window._activeListeners || 0) + 1;
      var unsubHeartbeat = heartbeatRef.onSnapshot(
        function() { window._firestoreOnline = true; },
        function(err) {
          if (err.code === 'unavailable') window._firestoreOnline = false;
          console.error('[PRO SPY ERROR] Firestore heartbeat error:', err);
        }
      );
      return function() { 
        unsubHeartbeat(); 
        window._activeListeners = Math.max(0, (window._activeListeners || 0) - 1);
        window._firestoreOnline = undefined; 
      };
    }, []);

    /* Expose mini profile trigger safely for games to call */
    useEffect(function () {
      window.openLuckyGamesMiniProfile = async function (uid) {
        setMiniProfile({ uid: uid, loading: true });
        if (window.fetchMiniProfileData) {
          var friends = userData && userData.friends ? userData.friends : [];
          var data = await window.fetchMiniProfileData(uid, friends);
          if (data) setMiniProfile(data);
        }
      };
      return function () { delete window.openLuckyGamesMiniProfile; };
    }, [userData]);

    /* Start / stop Lucky Fruit when activeGame changes */
    useEffect(function () {
      if (activeGame === 'lucky_fruit') {
        var timer = setTimeout(function () {
          if (window.LuckyFruitGame && gameContainerRef.current) {
            window.lfGameUserData = props.userData || null;
            window.currentUserData = props.userData || null;
            window.LuckyFruitGame.start(gameContainerRef.current);
          }
        }, 80);
        return function () { clearTimeout(timer); };
      } else {
        if (window.LuckyFruitGame) { try { window.LuckyFruitGame.stop(); } catch (e) { } }
      }
    }, [activeGame]);

    /* Start / stop Super 777 when activeGame changes */
    useEffect(function () {
      if (activeGame === 'super_777') {
        var timer2 = setTimeout(function () {
          if (window.Super777Game && gameContainerRef.current) {
            window.s7GameUserData = props.userData || null;
            window.currentUserData = props.userData || null;
            window.Super777Game.start(gameContainerRef.current);
            if (lang && typeof window.Super777Game.setLanguage === 'function') {
              window.Super777Game.setLanguage(lang);
            }
          }
        }, 80);
        return function () { clearTimeout(timer2); };
      } else {
        if (window.Super777Game) { try { window.Super777Game.stop(); } catch (e) { } }
      }
    }, [activeGame]);

    /* Start / stop Greedy Cat when activeGame changes */
    useEffect(function () {
      if (activeGame === 'greedy_cat') {
        var timer3 = setTimeout(function () {
          if (window.GreedyCatGame && gameContainerRef.current) {
            window.gcGameUserData = props.userData || null;
            window.currentUserData = props.userData || null;
            window.GreedyCatGame.start(gameContainerRef.current, { lang: lang, user: props.userData });
            if (lang && typeof window.GreedyCatGame.setLanguage === 'function') {
              window.GreedyCatGame.setLanguage(lang);
            }
          }
        }, 80);
        return function () { clearTimeout(timer3); };
      } else {
        if (window.GreedyCatGame) { try { window.GreedyCatGame.stop(); } catch (e) { } }
      }
    }, [activeGame]);

    /* Start / stop Soccer Star when activeGame changes */
    useEffect(function () {
      if (activeGame === 'soccer_star') {
        var timer4 = setTimeout(function () {
          if (window.SoccerStarGame && gameContainerRef.current) {
            window.ssGameUserData = props.userData || null;
            window.currentUserData = props.userData || null;
            window.SoccerStarGame.start(gameContainerRef.current, { lang: lang, user: props.userData });
            if (lang && typeof window.SoccerStarGame.setLanguage === 'function') {
              window.SoccerStarGame.setLanguage(lang);
            }
          }
        }, 80);
        return function () { clearTimeout(timer4); };
      } else {
        if (window.SoccerStarGame) { try { window.SoccerStarGame.stop(); } catch (e) { } }
      }
    }, [activeGame]);

    /* Stop ALL games on modal close */
    useEffect(function () {
      if (!show) {
        if (window.LuckyFruitGame) { try { window.LuckyFruitGame.stop(); } catch (e) { } }
        if (window.Super777Game) { try { window.Super777Game.stop(); } catch (e) { } }
        if (window.GreedyCatGame) { try { window.GreedyCatGame.stop(); } catch (e) { } }
        if (window.SoccerStarGame) { try { window.SoccerStarGame.stop(); } catch (e) { } }
        window.currentUserData = null;
        setActiveGame(null);
      }
    }, [show]);

    if (!show) return null;

    var coins = userData && typeof userData.coins === 'number' ? userData.coins : 0;

    return (
      React.createElement(window.PortalModal || React.Fragment, {},
        React.createElement('div', {
          style: {
            position: 'fixed', inset: 0, zIndex: 10500,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
          },
          onClick: function (e) { if (e.target === e.currentTarget) { if (activeGame) { setActiveGame(null); } else { onClose(); } } }
        },
          React.createElement('div', {
            style: {
              width: '100%', maxWidth: '480px',
              background: 'linear-gradient(180deg,#0f0624 0%,#07020f 100%)',
              borderRadius: '24px 24px 0 0',
              border: '1px solid rgba(255,255,255,0.10)',
              borderBottom: 'none',
              boxShadow: activeGame === 'super_777' ?
                '0 -8px 48px rgba(212,175,55,0.35)' :
                '0 -8px 48px rgba(112,0,255,0.25)',
              maxHeight: '92vh', overflowY: 'auto',
              position: 'relative'
            },
            onClick: function (e) { e.stopPropagation(); }
          },

            /* ── HEADER ── */
            React.createElement('div', {
              style: {
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 16px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                position: 'sticky', top: 0,
                background: 'linear-gradient(180deg,#0f0624,#0a0418)',
                zIndex: 10
              }
            },
              /* Left: back button (when in game) OR title */
              activeGame ?
                React.createElement('button', {
                  onClick: function () {
                    setActiveGame(null);
                    if (window.LuckyFruitGame) { try { window.LuckyFruitGame.stop(); } catch (e) { } }
                    if (window.Super777Game) { try { window.Super777Game.stop(); } catch (e) { } }
                    if (window.GreedyCatGame) { try { window.GreedyCatGame.stop(); } catch (e) { } }
                    if (window.SoccerStarGame) { try { window.SoccerStarGame.stop(); } catch (e) { } }
                  },
                  style: {
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 800,
                    padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }
                }, '← ' + (lang === 'ar' ? 'الألعاب' : 'Games')) :
                React.createElement('div', {
                  style: { display: 'flex', alignItems: 'center', gap: '10px' }
                },
                  React.createElement('div', {
                    style: {
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: 'linear-gradient(135deg,#7B3FFF,#FF8C00)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                      boxShadow: '0 0 14px rgba(123,63,255,0.5)'
                    }
                  }, '🎰'),
                  React.createElement('div', {},
                    React.createElement('div', {
                      style: { fontSize: '15px', fontWeight: 900, color: '#fff' }
                    }, lang === 'ar' ? '🎮 ألعاب الحظ' : '🎮 Lucky Games'),
                    React.createElement('div', {
                      style: { fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }
                    }, lang === 'ar' ? '7 ألعاب • 4 متاح الآن' : '7 Games • 4 Available Now')
                  )
                ),

              /* Right: close only */
              React.createElement('button', {
                onClick: onClose,
                style: {
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px', color: '#9ca3af', fontSize: '15px',
                  width: '32px', height: '32px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }
              }, '✕')
            ),

            /* ── GAME VIEWS ── */
            activeGame === 'lucky_fruit' &&
            React.createElement('div', {
              id: 'lf-root-hub',
              ref: gameContainerRef,
              style: { width: '100%', minHeight: '60vh', position: 'relative' }
            }),


            activeGame === 'super_777' &&
            React.createElement('div', {
              id: 's7-root-hub',
              ref: gameContainerRef,
              style: { width: '100%', minHeight: '60vh', position: 'relative' }
            }),

            activeGame === 'greedy_cat' &&
            React.createElement('div', {
              id: 'gc-root-hub-parent',
              ref: gameContainerRef,
              style: { width: '100%', minHeight: '60vh', position: 'relative' }
            }),

            activeGame === 'soccer_star' &&
            React.createElement('div', {
              id: 'ss-root-hub-parent',
              ref: gameContainerRef,
              style: { width: '100%', minHeight: '60vh', position: 'relative' }
            }),

            activeGame === 'crash_game' && window.CrashGame &&
            React.createElement('div', { style: { position: 'relative', width: '100%', height: 'calc(100vh - 120px)' } },
              React.createElement(window.CrashGame, {})
            ),

            /* ── GAMES GRID (hub view) ── */
            !activeGame &&
            React.createElement('div', { style: { padding: '14px 14px 24px' } },

              /* Grid: 2 columns */
              React.createElement('div', {
                style: {
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }
              },
                GAMES.map(function (game) {
                  return React.createElement(GameSlotCard, {
                    key: game.id,
                    game: game,
                    lang: lang,
                    onClick: function () { if (game.active) setActiveGame(game.id); }
                  });
                })
              ),

              /* Footer note */
              React.createElement('div', {
                style: {
                  marginTop: '18px', textAlign: 'center',
                  fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: 600,
                  letterSpacing: '0.5px'
                }
              }, lang === 'ar' ?
                '🎮 ستُضاف ألعاب جديدة قريباً — تابع التحديثات!' :
                '🎮 More games coming soon — stay tuned!')
            ),


            /* ── MINI PROFILE POPUP ── */
            miniProfile && window.MiniProfilePopup &&
            React.createElement(window.MiniProfilePopup, {
              profile: miniProfile,
              onClose: function () { setMiniProfile(null); },
              currentUID: props.currentUID || userData?.uid,
              lang: lang,
              onOpenProfile: function (uid) {
                setMiniProfile(null);
                /* Open full profile above the game — use global setters exposed by GlobalModals */
                setTimeout(function () {
                  if (window.setTargetProfileUID) window.setTargetProfileUID(uid);
                  if (window.setShowUserProfile) window.setShowUserProfile(true);
                }, 50);
              },
              onAddFriend: window.handleSendRequest,
              onMessage: function (u) { setMiniProfile(null); if (window.setShowPrivateChat) window.setShowPrivateChat(true); },
              isFriend: userData?.friends?.some(function (f) { return f.id === miniProfile.uid; }),
              zIndex: window.Z && window.Z.OVERLAY || 99999
            })

          )
        )
      ));

  };

  window.LuckyGamesHubModal = LuckyGamesHubModal;

})();
