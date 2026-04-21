(function() {
  const { useEffect, useRef } = React;

  const SpyGameRebuild = ({ user, userData, initialRoomCode, initialPassword, onClose }) => {
    const containerRef = useRef(null);

    // Sync React profile to window for Vanilla logic
    useEffect(() => {
      if (userData) {
        window._currentUserDataCache = userData;
      } else if (user) {
        window._currentUserDataCache = {
          uid: user.uid,
          playerName: user.displayName || 'Agent ' + user.uid.substr(0,4),
          photoURL: user.photoURL,
          avatarIndex: 0
        };
      }
    }, [userData, user]);

    useEffect(() => {
      let isMounted = true;
      
      // Ensure the DOM has painted before vanilla execution
      const initVanillaBridge = () => {
        if (!isMounted) return;
        
        // Hook the exit functionality seamlessly
        window.exitSpyGame = () => {
          if (onClose) onClose();
        };

        if (window.SPY_UI && containerRef.current) {
          const opts = {};
          
          // ✅ AC_JOIN_01: Determine if this is a specific room join or a fresh start.
          //
          // PRIORITY ORDER (highest → lowest):
          //   1. window._pendingSpyRoomCode — set SYNCHRONOUSLY in the router right before
          //      setShowSpyRebuild(true) fires. Always the most accurate signal for joins.
          //   2. initialRoomCode — React prop, may arrive late or hold the game tag 'spy'
          //      (from browseGameId) instead of an actual room code.
          //
          // We prefer _pendingSpyRoomCode so that Browse Rooms joins are never mis-classified
          // as fresh starts just because browseGameId='spy' leaked into initialRoomCode.
          const activeCode = window._pendingSpyRoomCode || initialRoomCode;
          const isExplicitJoin = activeCode && activeCode !== 'spy';
          const isFreshGame = !isExplicitJoin && (activeCode === 'spy' || !activeCode || window._autoOpenGameModePicker);

          // 🔍 DEBUG (025) — Remove when confirmed working
          console.log('[DEBUG-025] initVanillaBridge values:', {
            _pendingSpyRoomCode: window._pendingSpyRoomCode,
            initialRoomCode,
            activeCode,
            isExplicitJoin,
            isFreshGame,
            _autoOpenGameModePicker: window._autoOpenGameModePicker
          });
          
          if (isFreshGame) {
            opts.initialScreen = 'screen-main';
            console.log('[PRO_SPY] Fresh start detected, opening main menu');
            // Clear flag immediately after use to prevent re-triggering on state updates
            window._autoOpenGameModePicker = false;
          } else if (isExplicitJoin) {
            opts.initialScreen = 'screen-room-lobby';
            console.log('[PRO_SPY] Join detected, prioritizing lobby screen');
          }

          // Boot UI only once
          if (!containerRef.current.querySelector('#app')) {
            window.SPY_UI.init(containerRef.current, opts);
          } else if (isExplicitJoin) {
            // UI already booted in this container — just move to the lobby screen
            // and trigger the actual Firestore join via initJoinRoom.
            window.SPY_UI.goTo('screen-room-lobby');
          }

          // Connect Matchmaking only if it is a valid room code (not the 'spy' tag)
          if (isExplicitJoin && window.SPY_UI && typeof window.SPY_UI.initJoinRoom === 'function') {
            console.log('[PRO_SPY] Auto-joining room from mount:', activeCode);
            window.SPY_UI.initJoinRoom(activeCode, initialPassword || null);
            window._pendingSpyRoomCode = null; // Clear after use
          } else if (isExplicitJoin && window.SPY_ENGINE) {
            window.SPY_ENGINE.RoomManager.joinRoom({
              code: activeCode,
              profile: window._currentUserDataCache
            });
            window._pendingSpyRoomCode = null; // Clear after use
          }
        }
      };

      // Minor timeout guarantees React node ref is completely flushed to DOM
      const timer = setTimeout(initVanillaBridge, 50);

      return () => {
        isMounted = false;
        clearTimeout(timer);
        if (window.exitSpyGame) delete window.exitSpyGame;
        // ✅ FIX: Explicitly remove #app from the DOM on unmount.
        // If we only clear containerRef.current.innerHTML, React's reconciler
        // may have already detached the node, leaving a stale #app in the document.
        // game.ui.js init() checks for #app existence — if stale, it skips init entirely.
        var appEl = document.getElementById('app');
        if (appEl && appEl.parentNode) {
          appEl.parentNode.removeChild(appEl);
        }
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      };
    }, [initialRoomCode, onClose]);

    const handleClose = () => {
      if (window.SPY_ENGINE && window.SPY_ENGINE.RoomManager) {
         window.SPY_ENGINE.RoomManager.leaveRoom();
      }
      if (onClose) onClose();
    };

    return React.createElement(
      'div',
      { 
        style: { 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100000, 
          pointerEvents: 'auto',
          backgroundColor: '#050510',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        },
        dir: "ltr"
      },
      React.createElement(
        'button',
        {
          onClick: handleClose,
          className: "absolute top-4 left-4 bg-white/10 hover:bg-red-500/80 backdrop-blur-md transition-all text-white rounded-full w-12 h-12 flex items-center justify-center font-bold shadow-xl border border-white/20 active:scale-95 cursor-pointer",
          style: { zIndex: 51, pointerEvents: 'auto' },
          'aria-label': "Exit Game"
        },
        '\u2715' // "X" symbol
      ),
      React.createElement('div', {
        id: "spy-game-container",
        ref: containerRef,
        className: "w-full h-full relative",
        style: { zIndex: 10, pointerEvents: 'auto' }
      })
    );
  };

  // Expose to window for the React Bootloader `16-main.js` and `10-app.js`
  window.SpyGame = SpyGameRebuild;
  window.SpyGameRebuild = SpyGameRebuild;

  // 🏥 HYDRATION BRIDGE: Defined to fix broken joinAndGo flow in 10-app.js
  window.SpyGameCore = {
    online: {
      /**
       * Primary join handler used by BrowseRoomsModal and Chat logic.
       * Bridges the legacy React UI with the new Vanilla engine.
       */
      joinAndGo: async (code, password) => {
        console.log('[SpyGameCore] joinAndGo triggered for room:', code);
        
        // 1. Activate the Rebuild UI overlay
        if (typeof window.setShowSpyRebuild === 'function') {
          window.setShowSpyRebuild(true);
        }
        
        // 2. Set the room code for the Rebuild component's initial state
        window._pendingSpyRoomCode = code; // Heavy lifting hydration bridge

        // 3. Use an internal flag to prevent "Fresh Start" overrides during this specific sequence
        window._autoOpenGameModePicker = false;

        // 4. If the UI is already initialized, trigger its internal join logic
        if (window.SPY_UI && typeof window.SPY_UI.initJoinRoom === 'function') {
          window.SPY_UI.initJoinRoom(code, password);
        }
      }
    }
  };

})();
