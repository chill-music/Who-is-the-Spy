/**
 * Defuse Master - Lobby Component
 * IIFE pattern - exposes window.DefuseLobby
 * Circular VS layout with player avatars
 */
(function() {
  'use strict';

  var React = window.React;
  var useState = React.useState;
  var useEffect = React.useEffect;
  var useCallback = React.useCallback;
  var firebase = window.firebase;
  var db = firebase.firestore();

  // Styles
  var styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #5B2D8E 0%, #3A1A6E 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      fontFamily: "'Nunito', sans-serif"
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      maxWidth: '400px',
      marginBottom: '20px'
    },
    title: {
      color: '#FFFFFF',
      fontSize: '20px',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    badge: {
      background: '#4CAF50',
      color: 'white',
      fontSize: '12px',
      padding: '2px 8px',
      borderRadius: '12px'
    },
    subtitle: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: '14px'
    },
    headerIcons: {
      display: 'flex',
      gap: '12px'
    },
    iconBtn: {
      background: 'rgba(255,255,255,0.1)',
      border: 'none',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: 'white'
    },
    vsContainer: {
      position: 'relative',
      width: '300px',
      height: '300px',
      marginBottom: '30px'
    },
    vsCenter: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '28px',
      fontWeight: '800',
      color: 'rgba(255,255,255,0.8)',
      boxShadow: '0 0 40px rgba(255,255,255,0.1)'
    },
    playerSlot: {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px'
    },
    avatar: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      border: '3px solid #4CAF50',
      objectFit: 'cover',
      background: '#2D1B4E'
    },
    avatarEmpty: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      border: '3px dashed rgba(255,255,255,0.3)',
      background: 'rgba(255,255,255,0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    },
    plusIcon: {
      fontSize: '24px',
      color: 'rgba(255,255,255,0.5)'
    },
    playerName: {
      color: 'white',
      fontSize: '12px',
      fontWeight: '600',
      maxWidth: '70px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      textAlign: 'center'
    },
    checkBadge: {
      position: 'absolute',
      bottom: '20px',
      left: '0',
      background: '#4CAF50',
      borderRadius: '50%',
      width: '18px',
      height: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    inviteBtn: {
      background: 'linear-gradient(180deg, #4ADE80 0%, #22C55E 100%)',
      border: 'none',
      borderRadius: '30px',
      padding: '14px 60px',
      fontSize: '18px',
      fontWeight: '700',
      color: 'white',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
      marginBottom: '12px',
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    cancelBtn: {
      background: 'linear-gradient(180deg, #E8B86D 0%, #D4A84A 100%)',
      border: 'none',
      borderRadius: '30px',
      padding: '14px 60px',
      fontSize: '18px',
      fontWeight: '700',
      color: 'white',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(232, 184, 109, 0.3)',
      transition: 'transform 0.2s'
    },
    stakeContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '20px',
      background: 'rgba(255,255,255,0.1)',
      padding: '10px 20px',
      borderRadius: '20px'
    },
    stakeLabel: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: '14px'
    },
    stakeValue: {
      color: '#FFD700',
      fontSize: '18px',
      fontWeight: '700'
    },
    stakeSelector: {
      display: 'flex',
      gap: '8px',
      marginBottom: '20px'
    },
    stakeOption: {
      background: 'rgba(255,255,255,0.1)',
      border: '2px solid transparent',
      borderRadius: '12px',
      padding: '8px 16px',
      color: 'white',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    stakeOptionActive: {
      background: 'rgba(255, 215, 0, 0.2)',
      borderColor: '#FFD700'
    },
    connectionLine: {
      position: 'absolute',
      background: 'rgba(255,255,255,0.1)',
      height: '2px'
    }
  };

  // Player slot positions for circular layout (5 positions)
  var SLOT_POSITIONS = [
    { top: '10%', left: '50%', transform: 'translate(-50%, 0)' },     // Top
    { top: '30%', left: '90%', transform: 'translate(-50%, 0)' },     // Top-right
    { top: '70%', left: '85%', transform: 'translate(-50%, 0)' },     // Bottom-right
    { top: '70%', left: '15%', transform: 'translate(-50%, 0)' },     // Bottom-left
    { top: '30%', left: '10%', transform: 'translate(-50%, 0)' }      // Top-left
  ];

  function DefuseLobby(props) {
    var roomId = props.roomId;
    var currentUser = props.currentUser;
    var onStartGame = props.onStartGame;
    var onCancel = props.onCancel;
    var onInvite = props.onInvite;

    var _useState = useState(null);
    var room = _useState[0];
    var setRoom = _useState[1];

    var _useState2 = useState(100);
    var stake = _useState2[0];
    var setStake = _useState2[1];

    var _useState3 = useState(false);
    var isLoading = _useState3[0];
    var setIsLoading = _useState3[1];

    var isHost = room && room.hostId === currentUser.uid;
    var playerCount = room ? room.players.length : 0;
    var canStart = isHost && playerCount >= 2;

    // Subscribe to room updates
    useEffect(function() {
      if (!roomId) return;

      var unsubscribe = db.collection('rooms').doc(roomId)
        .onSnapshot(function(doc) {
          if (doc.exists) {
            setRoom(Object.assign({ id: doc.id }, doc.data()));
          }
        }, function(error) {
          console.error('[DefuseLobby] Room subscription error:', error);
        });

      return function() {
        unsubscribe();
      };
    }, [roomId]);

    // Create a new room
    var createRoom = useCallback(function() {
      if (!currentUser) return;

      setIsLoading(true);
      
      var newRoom = {
        gameType: 'defuse_master',
        status: 'waiting',
        mode: 'ffa',
        stakeN: stake,
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
        lastAction: null,
        eliminationOrder: [],
        goldResults: {},
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      db.collection('rooms').add(newRoom)
        .then(function(docRef) {
          console.log('[DefuseLobby] Room created:', docRef.id);
          setIsLoading(false);
        })
        .catch(function(error) {
          console.error('[DefuseLobby] Error creating room:', error);
          setIsLoading(false);
        });
    }, [currentUser, stake]);

    // Join existing room
    var joinRoom = useCallback(function() {
      if (!roomId || !currentUser || !room) return;

      // Check if already in room
      var isInRoom = room.players.some(function(p) {
        return p.uid === currentUser.uid;
      });

      if (isInRoom) return;

      // Check if room is full
      if (room.players.length >= 5) {
        alert('Room is full');
        return;
      }

      var newPlayer = window.DefuseRules.createPlayerState(
        currentUser.uid,
        currentUser.displayName || 'Player',
        currentUser.photoURL || ''
      );

      db.collection('rooms').doc(roomId).update({
        players: firebase.firestore.FieldValue.arrayUnion(newPlayer)
      }).catch(function(error) {
        console.error('[DefuseLobby] Error joining room:', error);
      });
    }, [roomId, currentUser, room]);

    // Leave room
    var leaveRoom = useCallback(function() {
      if (!roomId || !currentUser || !room) return;

      var playerToRemove = room.players.find(function(p) {
        return p.uid === currentUser.uid;
      });

      if (!playerToRemove) return;

      // If host leaves, delete the room
      if (room.hostId === currentUser.uid) {
        db.collection('rooms').doc(roomId).delete()
          .then(function() {
            if (onCancel) onCancel();
          })
          .catch(function(error) {
            console.error('[DefuseLobby] Error deleting room:', error);
          });
      } else {
        // Regular player leaves
        db.collection('rooms').doc(roomId).update({
          players: firebase.firestore.FieldValue.arrayRemove(playerToRemove)
        }).then(function() {
          if (onCancel) onCancel();
        }).catch(function(error) {
          console.error('[DefuseLobby] Error leaving room:', error);
        });
      }
    }, [roomId, currentUser, room, onCancel]);

    // Start game
    var handleStartGame = useCallback(function() {
      if (!canStart || !room) return;

      setIsLoading(true);

      // Build deck and deal hands
      var playerCount = room.players.length;
      var deckData = window.DefuseCards.buildDeckForDealing(playerCount);
      var dealResult = window.DefuseCards.dealHands(deckData.dealDeck, playerCount);
      
      // Assign hands to player UIDs
      var handsByUid = {};
      room.players.forEach(function(player, index) {
        handsByUid[player.uid] = dealResult.hands['player_' + index];
      });

      // Insert bombs back into deck
      var finalDeck = window.DefuseCards.insertBombs(dealResult.remainingDeck, deckData.bombs);

      // Create turn order (shuffle players)
      var turnOrder = window.DefuseCards.shuffle(room.players.map(function(p) { return p.uid; }));

      // Update room
      var batch = db.batch();
      var roomRef = db.collection('rooms').doc(roomId);

      // Update room state
      batch.update(roomRef, {
        status: 'playing',
        deck: finalDeck,
        deckCount: finalDeck.length,
        turnOrder: turnOrder,
        currentTurn: turnOrder[0],
        players: room.players.map(function(p) {
          return Object.assign({}, p, { handCount: 5 });
        })
      });

      // Create hand documents for each player
      Object.keys(handsByUid).forEach(function(uid) {
        var handRef = roomRef.collection('hands').doc(uid);
        batch.set(handRef, { cards: handsByUid[uid] });
      });

      batch.commit()
        .then(function() {
          console.log('[DefuseLobby] Game started');
          setIsLoading(false);
          if (onStartGame) onStartGame();
        })
        .catch(function(error) {
          console.error('[DefuseLobby] Error starting game:', error);
          setIsLoading(false);
        });
    }, [canStart, room, roomId, onStartGame]);

    // Update stake
    var handleStakeChange = function(newStake) {
      setStake(newStake);
      if (isHost && roomId) {
        db.collection('rooms').doc(roomId).update({ stakeN: newStake });
      }
    };

    // Render player slot
    var renderPlayerSlot = function(index) {
      var player = room && room.players[index];
      var position = SLOT_POSITIONS[index];

      if (!player) {
        return React.createElement('div', {
          key: 'slot-' + index,
          style: Object.assign({}, styles.playerSlot, position)
        },
          React.createElement('div', {
            style: styles.avatarEmpty,
            onClick: onInvite
          },
            React.createElement('span', { style: styles.plusIcon }, '+')
          )
        );
      }

      return React.createElement('div', {
        key: 'slot-' + index,
        style: Object.assign({}, styles.playerSlot, position)
      },
        React.createElement('div', { style: { position: 'relative' } },
          React.createElement('img', {
            src: player.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + player.uid,
            alt: player.name,
            style: styles.avatar
          }),
          React.createElement('div', { style: styles.checkBadge },
            React.createElement('svg', {
              width: '12',
              height: '12',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'white',
              strokeWidth: '3',
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            },
              React.createElement('polyline', { points: '20 6 9 17 4 12' })
            )
          )
        ),
        React.createElement('span', { style: styles.playerName }, player.name)
      );
    };

    return React.createElement('div', { style: styles.container },
      // Header
      React.createElement('div', { style: styles.header },
        React.createElement('div', null,
          React.createElement('div', { style: styles.title },
            'Defuse Master',
            React.createElement('span', { style: styles.badge }, 'FFA')
          ),
          React.createElement('div', { style: styles.subtitle },
            room ? 'Room ' + (room.id || '').slice(0, 6) : 'Creating room...'
          )
        ),
        React.createElement('div', { style: styles.headerIcons },
          React.createElement('button', { style: styles.iconBtn },
            React.createElement('svg', {
              width: '20',
              height: '20',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              strokeWidth: '2'
            },
              React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
              React.createElement('path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }),
              React.createElement('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' })
            )
          )
        )
      ),

      // Stake selector (host only)
      isHost && React.createElement('div', { style: styles.stakeSelector },
        window.DefuseRules.STAKE_OPTIONS.map(function(option) {
          return React.createElement('button', {
            key: option,
            style: Object.assign({}, 
              styles.stakeOption, 
              stake === option ? styles.stakeOptionActive : {}
            ),
            onClick: function() { handleStakeChange(option); }
          }, option + 'G');
        })
      ),

      // Stake display (non-host)
      !isHost && room && React.createElement('div', { style: styles.stakeContainer },
        React.createElement('span', { style: styles.stakeLabel }, 'Stake:'),
        React.createElement('span', { style: styles.stakeValue }, room.stakeN + ' Gold')
      ),

      // VS Container with circular player layout
      React.createElement('div', { style: styles.vsContainer },
        // Center VS bubble
        React.createElement('div', { style: styles.vsCenter }, 'VS'),
        
        // Player slots
        [0, 1, 2, 3, 4].map(renderPlayerSlot)
      ),

      // Action buttons
      isHost ? React.createElement('button', {
        style: Object.assign({}, 
          styles.inviteBtn,
          (!canStart || isLoading) ? { opacity: 0.6, cursor: 'not-allowed' } : {}
        ),
        onClick: canStart ? handleStartGame : null,
        disabled: !canStart || isLoading
      }, isLoading ? 'Starting...' : (canStart ? 'Start Game' : 'Waiting for players...'))
      : React.createElement('button', {
        style: styles.inviteBtn,
        onClick: onInvite
      }, 'Invite'),

      React.createElement('button', {
        style: styles.cancelBtn,
        onClick: leaveRoom
      }, 'Cancel')
    );
  }

  // Expose to window
  window.DefuseLobby = DefuseLobby;

})();
