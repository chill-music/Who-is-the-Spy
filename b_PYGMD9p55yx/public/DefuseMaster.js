/**
 * Defuse Master - Main Entry Component
 * IIFE pattern - exposes window.DefuseMaster
 * Routes between Lobby, Game, and Results screens
 */
(function() {
  'use strict';

  var React = window.React;
  var useState = React.useState;
  var useEffect = React.useEffect;
  var useCallback = React.useCallback;
  var firebase = window.firebase;
  var db = firebase.firestore();

  // Game screens
  var SCREENS = {
    LOBBY: 'lobby',
    GAME: 'game',
    RESULTS: 'results'
  };

  // Styles
  var styles = {
    container: {
      minHeight: '100vh',
      fontFamily: "'Nunito', sans-serif"
    },
    loadingContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #5B2D8E 0%, #3A1A6E 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    },
    loadingSpinner: {
      width: '50px',
      height: '50px',
      border: '4px solid rgba(255,255,255,0.2)',
      borderTopColor: 'white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '20px'
    },
    errorContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #5B2D8E 0%, #3A1A6E 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      color: 'white',
      textAlign: 'center'
    },
    errorTitle: {
      fontSize: '24px',
      fontWeight: '700',
      marginBottom: '10px'
    },
    errorText: {
      opacity: 0.8,
      marginBottom: '20px'
    },
    retryBtn: {
      background: 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)',
      border: 'none',
      borderRadius: '20px',
      padding: '12px 30px',
      color: 'white',
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer'
    }
  };

  // Add keyframes for loading spinner
  var styleSheet = document.createElement('style');
  styleSheet.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(styleSheet);

  function DefuseMaster(props) {
    var initialRoomId = props.roomId || null;
    var currentUser = props.currentUser;
    var onExit = props.onExit;

    // State
    var _useState1 = useState(SCREENS.LOBBY);
    var screen = _useState1[0];
    var setScreen = _useState1[1];

    var _useState2 = useState(initialRoomId);
    var roomId = _useState2[0];
    var setRoomId = _useState2[1];

    var _useState3 = useState(null);
    var room = _useState3[0];
    var setRoom = _useState3[1];

    var _useState4 = useState(true);
    var isLoading = _useState4[0];
    var setIsLoading = _useState4[1];

    var _useState5 = useState(null);
    var error = _useState5[0];
    var setError = _useState5[1];

    // Subscribe to room updates to determine current screen
    useEffect(function() {
      if (!roomId) {
        setIsLoading(false);
        setScreen(SCREENS.LOBBY);
        return;
      }

      var unsubscribe = db.collection('rooms').doc(roomId)
        .onSnapshot(function(doc) {
          if (doc.exists) {
            var roomData = Object.assign({ id: doc.id }, doc.data());
            setRoom(roomData);
            setIsLoading(false);

            // Determine screen based on room status
            switch (roomData.status) {
              case 'waiting':
                setScreen(SCREENS.LOBBY);
                break;
              case 'playing':
                setScreen(SCREENS.GAME);
                break;
              case 'finished':
                setScreen(SCREENS.RESULTS);
                break;
              default:
                setScreen(SCREENS.LOBBY);
            }
          } else {
            // Room doesn't exist - go back to lobby
            setRoomId(null);
            setRoom(null);
            setScreen(SCREENS.LOBBY);
            setIsLoading(false);
          }
        }, function(err) {
          console.error('[DefuseMaster] Room subscription error:', err);
          setError('Failed to connect to game room');
          setIsLoading(false);
        });

      return function() {
        unsubscribe();
      };
    }, [roomId]);

    // Create a new room
    var createRoom = useCallback(function(stake) {
      if (!currentUser) {
        setError('Please sign in to play');
        return;
      }

      setIsLoading(true);
      setError(null);

      var newRoom = {
        gameType: 'defuse_master',
        status: 'waiting',
        mode: 'ffa',
        stakeN: stake || 100,
        hostId: currentUser.uid,
        players: [
          window.DefuseRules.createPlayerState(
            currentUser.uid,
            currentUser.displayName || 'Player',
            currentUser.photoURL || ''
          )
        ],
        turnOrder: [],
        deck: [],
        deckCount: 0,
        currentTurn: null,
        lastAction: null,
        eliminationOrder: [],
        goldResults: {},
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      db.collection('rooms').add(newRoom)
        .then(function(docRef) {
          setRoomId(docRef.id);
          console.log('[DefuseMaster] Room created:', docRef.id);
        })
        .catch(function(err) {
          console.error('[DefuseMaster] Error creating room:', err);
          setError('Failed to create game room');
          setIsLoading(false);
        });
    }, [currentUser]);

    // Join an existing room
    var joinRoom = useCallback(function(targetRoomId) {
      if (!currentUser) {
        setError('Please sign in to play');
        return;
      }

      setIsLoading(true);
      setError(null);

      // First check if room exists and has space
      db.collection('rooms').doc(targetRoomId).get()
        .then(function(doc) {
          if (!doc.exists) {
            throw new Error('Room not found');
          }

          var roomData = doc.data();
          
          if (roomData.status !== 'waiting') {
            throw new Error('Game already in progress');
          }

          if (roomData.players.length >= 5) {
            throw new Error('Room is full');
          }

          // Check if already in room
          var isInRoom = roomData.players.some(function(p) {
            return p.uid === currentUser.uid;
          });

          if (isInRoom) {
            setRoomId(targetRoomId);
            return;
          }

          // Add player to room
          var newPlayer = window.DefuseRules.createPlayerState(
            currentUser.uid,
            currentUser.displayName || 'Player',
            currentUser.photoURL || ''
          );

          return db.collection('rooms').doc(targetRoomId).update({
            players: firebase.firestore.FieldValue.arrayUnion(newPlayer)
          }).then(function() {
            setRoomId(targetRoomId);
          });
        })
        .catch(function(err) {
          console.error('[DefuseMaster] Error joining room:', err);
          setError(err.message || 'Failed to join room');
          setIsLoading(false);
        });
    }, [currentUser]);

    // Handle game start (from lobby)
    var handleGameStart = useCallback(function() {
      console.log('[DefuseMaster] Game started');
      setScreen(SCREENS.GAME);
    }, []);

    // Handle game end (from game)
    var handleGameEnd = useCallback(function(winner) {
      console.log('[DefuseMaster] Game ended, winner:', winner);
      setScreen(SCREENS.RESULTS);
    }, []);

    // Handle play again (from results)
    var handlePlayAgain = useCallback(function() {
      console.log('[DefuseMaster] Play again');
      setScreen(SCREENS.LOBBY);
    }, []);

    // Handle leave/cancel
    var handleLeave = useCallback(function() {
      setRoomId(null);
      setRoom(null);
      setScreen(SCREENS.LOBBY);
      if (onExit) onExit();
    }, [onExit]);

    // Handle invite (share room code)
    var handleInvite = useCallback(function() {
      if (!roomId) return;

      var roomCode = roomId.slice(0, 6).toUpperCase();
      var shareText = 'Join my Defuse Master game! Room code: ' + roomCode;

      if (navigator.share) {
        navigator.share({
          title: 'Defuse Master',
          text: shareText,
          url: window.location.origin + '/defuse?room=' + roomId
        }).catch(function(err) {
          console.log('[DefuseMaster] Share cancelled:', err);
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText)
          .then(function() {
            alert('Room code copied to clipboard!');
          })
          .catch(function() {
            alert('Room code: ' + roomCode);
          });
      }
    }, [roomId]);

    // Handle error retry
    var handleRetry = function() {
      setError(null);
      setIsLoading(false);
    };

    // Loading screen
    if (isLoading) {
      return React.createElement('div', { style: styles.loadingContainer },
        React.createElement('div', { style: styles.loadingSpinner }),
        React.createElement('p', null, 'Loading Defuse Master...')
      );
    }

    // Error screen
    if (error) {
      return React.createElement('div', { style: styles.errorContainer },
        React.createElement('h2', { style: styles.errorTitle }, 'Oops!'),
        React.createElement('p', { style: styles.errorText }, error),
        React.createElement('button', {
          style: styles.retryBtn,
          onClick: handleRetry
        }, 'Try Again')
      );
    }

    // Render current screen
    return React.createElement('div', { style: styles.container },
      screen === SCREENS.LOBBY && React.createElement(window.DefuseLobby, {
        roomId: roomId,
        currentUser: currentUser,
        onStartGame: handleGameStart,
        onCancel: handleLeave,
        onInvite: handleInvite,
        onCreateRoom: createRoom,
        onJoinRoom: joinRoom
      }),

      screen === SCREENS.GAME && React.createElement(window.DefuseGame, {
        roomId: roomId,
        currentUser: currentUser,
        onGameEnd: handleGameEnd
      }),

      screen === SCREENS.RESULTS && React.createElement(window.DefuseResults, {
        roomId: roomId,
        currentUser: currentUser,
        onPlayAgain: handlePlayAgain,
        onLeave: handleLeave
      })
    );
  }

  /**
   * Quick start helper - creates room and returns component
   * Usage: DefuseMaster.quickStart(containerEl, currentUser)
   */
  DefuseMaster.quickStart = function(containerEl, currentUser, options) {
    options = options || {};
    
    var root = window.ReactDOM.createRoot 
      ? window.ReactDOM.createRoot(containerEl)
      : null;

    var element = React.createElement(DefuseMaster, {
      currentUser: currentUser,
      roomId: options.roomId || null,
      onExit: options.onExit || function() {
        console.log('[DefuseMaster] Game exited');
      }
    });

    if (root) {
      root.render(element);
    } else {
      window.ReactDOM.render(element, containerEl);
    }

    return {
      unmount: function() {
        if (root) {
          root.unmount();
        } else {
          window.ReactDOM.unmountComponentAtNode(containerEl);
        }
      }
    };
  };

  /**
   * Get room ID from URL params
   */
  DefuseMaster.getRoomIdFromUrl = function() {
    var params = new URLSearchParams(window.location.search);
    return params.get('room') || null;
  };

  // Expose to window
  window.DefuseMaster = DefuseMaster;

})();
