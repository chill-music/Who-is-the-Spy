/**
 * Defuse Master - Results Component
 * IIFE pattern - exposes window.DefuseResults
 * End-game results showing rankings and gold changes
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
      background: 'linear-gradient(160deg, #1E3A5F 0%, #0D1B2A 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '30px 20px',
      fontFamily: "'Nunito', sans-serif"
    },
    closeBtn: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'rgba(255,255,255,0.1)',
      border: 'none',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: 'white',
      fontSize: '20px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    title: {
      color: 'white',
      fontSize: '28px',
      fontWeight: '800',
      marginBottom: '5px'
    },
    subtitle: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: '14px'
    },
    resultsCard: {
      background: 'linear-gradient(180deg, #2D4A6A 0%, #1E3A5F 100%)',
      borderRadius: '24px',
      padding: '25px 20px',
      width: '100%',
      maxWidth: '360px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
    },
    tableHeader: {
      display: 'flex',
      padding: '0 10px 15px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      marginBottom: '15px'
    },
    headerCell: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase'
    },
    rankCol: {
      width: '50px'
    },
    playerCol: {
      flex: 1
    },
    goldCol: {
      width: '80px',
      textAlign: 'right'
    },
    playerRow: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 10px',
      borderRadius: '12px',
      marginBottom: '8px',
      transition: 'background 0.2s'
    },
    playerRowWinner: {
      background: 'rgba(255, 215, 0, 0.15)',
      border: '1px solid rgba(255, 215, 0, 0.3)'
    },
    playerRowYou: {
      background: 'rgba(59, 130, 246, 0.15)',
      border: '1px solid rgba(59, 130, 246, 0.3)'
    },
    rankBadge: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: '14px',
      marginRight: '12px'
    },
    rankFirst: {
      background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
      color: '#1a1a1a'
    },
    rankSecond: {
      background: 'linear-gradient(180deg, #C0C0C0 0%, #A0A0A0 100%)',
      color: '#1a1a1a'
    },
    rankThird: {
      background: 'linear-gradient(180deg, #CD7F32 0%, #A0522D 100%)',
      color: 'white'
    },
    rankOther: {
      background: 'rgba(255,255,255,0.1)',
      color: 'rgba(255,255,255,0.6)'
    },
    playerInfo: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '2px solid rgba(255,255,255,0.2)'
    },
    avatarWinner: {
      border: '2px solid #FFD700'
    },
    playerName: {
      color: 'white',
      fontSize: '15px',
      fontWeight: '600'
    },
    youBadge: {
      background: '#3B82F6',
      color: 'white',
      fontSize: '10px',
      fontWeight: '700',
      padding: '2px 6px',
      borderRadius: '6px',
      marginLeft: '6px'
    },
    goldChange: {
      fontSize: '16px',
      fontWeight: '700'
    },
    goldPositive: {
      color: '#4ADE80'
    },
    goldNegative: {
      color: '#EF4444'
    },
    goldNeutral: {
      color: 'rgba(255,255,255,0.6)'
    },
    trophyIcon: {
      width: '20px',
      height: '20px',
      marginRight: '5px'
    },
    buttonsContainer: {
      display: 'flex',
      gap: '12px',
      marginTop: '30px',
      width: '100%',
      maxWidth: '360px'
    },
    button: {
      flex: 1,
      padding: '16px',
      borderRadius: '16px',
      border: 'none',
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'transform 0.2s, opacity 0.2s'
    },
    playAgainBtn: {
      background: 'linear-gradient(180deg, #4ADE80 0%, #22C55E 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)'
    },
    leaveBtn: {
      background: 'rgba(255,255,255,0.1)',
      color: 'white'
    },
    statsContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '30px',
      marginTop: '25px',
      padding: '20px',
      background: 'rgba(0,0,0,0.2)',
      borderRadius: '16px',
      width: '100%',
      maxWidth: '360px'
    },
    statItem: {
      textAlign: 'center'
    },
    statValue: {
      color: 'white',
      fontSize: '24px',
      fontWeight: '800'
    },
    statLabel: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: '12px',
      marginTop: '4px'
    },
    confetti: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 100
    }
  };

  // Trophy SVG icon
  var TrophyIcon = function() {
    return React.createElement('svg', {
      style: styles.trophyIcon,
      viewBox: '0 0 24 24',
      fill: '#FFD700'
    },
      React.createElement('path', {
        d: 'M12 2C9.38 2 7.25 4.13 7.25 6.75c0 1.02.33 1.96.88 2.74L3 14.59V22h18v-7.41l-5.13-5.1c.55-.78.88-1.72.88-2.74C16.75 4.13 14.62 2 12 2zm0 2c1.52 0 2.75 1.23 2.75 2.75S13.52 9.5 12 9.5 9.25 8.27 9.25 6.75 10.48 4 12 4zM5 20v-4.41l4.38-4.38C10.17 11.68 11.05 12 12 12s1.83-.32 2.62-.79L19 15.59V20H5z'
      })
    );
  };

  function DefuseResults(props) {
    var roomId = props.roomId;
    var currentUser = props.currentUser;
    var onPlayAgain = props.onPlayAgain;
    var onLeave = props.onLeave;

    var _useState = useState(null);
    var room = _useState[0];
    var setRoom = _useState[1];

    var _useState2 = useState(false);
    var goldUpdated = _useState2[0];
    var setGoldUpdated = _useState2[1];

    // Fetch room data
    useEffect(function() {
      if (!roomId) return;

      db.collection('rooms').doc(roomId).get()
        .then(function(doc) {
          if (doc.exists) {
            setRoom(Object.assign({ id: doc.id }, doc.data()));
          }
        })
        .catch(function(error) {
          console.error('[DefuseResults] Error fetching room:', error);
        });
    }, [roomId]);

    // Update user gold in Firestore (once)
    useEffect(function() {
      if (!room || !currentUser || goldUpdated) return;
      if (!room.goldResults || !room.goldResults[currentUser.uid]) return;

      var goldChange = room.goldResults[currentUser.uid];
      
      // Update user's gold in their profile
      db.collection('users').doc(currentUser.uid).update({
        gold: firebase.firestore.FieldValue.increment(goldChange)
      }).then(function() {
        setGoldUpdated(true);
        console.log('[DefuseResults] Gold updated:', goldChange);
      }).catch(function(error) {
        console.error('[DefuseResults] Error updating gold:', error);
      });
    }, [room, currentUser, goldUpdated]);

    // Sort players by rank
    var sortedPlayers = React.useMemo(function() {
      if (!room || !room.players) return [];
      
      return room.players.slice().sort(function(a, b) {
        return (a.rank || 99) - (b.rank || 99);
      });
    }, [room]);

    // Get rank badge style
    var getRankStyle = function(rank) {
      switch(rank) {
        case 1: return styles.rankFirst;
        case 2: return styles.rankSecond;
        case 3: return styles.rankThird;
        default: return styles.rankOther;
      }
    };

    // Format gold change text
    var formatGold = function(gold) {
      if (gold > 0) return '+' + gold;
      if (gold < 0) return '' + gold;
      return '0';
    };

    // Get gold style
    var getGoldStyle = function(gold) {
      if (gold > 0) return styles.goldPositive;
      if (gold < 0) return styles.goldNegative;
      return styles.goldNeutral;
    };

    // Handle play again
    var handlePlayAgain = useCallback(function() {
      if (!room) return;

      // Reset room for new game
      var resetPlayers = room.players.map(function(p) {
        return Object.assign({}, p, {
          status: 'alive',
          rank: null,
          handCount: 5,
          trapMultiplier: 0,
          isProtected: false
        });
      });

      db.collection('rooms').doc(roomId).update({
        status: 'waiting',
        players: resetPlayers,
        deck: [],
        deckCount: 0,
        currentTurn: null,
        turnOrder: [],
        eliminationOrder: [],
        goldResults: {},
        lastAction: null
      }).then(function() {
        // Delete hand documents
        var batch = db.batch();
        room.players.forEach(function(p) {
          var handRef = db.collection('rooms').doc(roomId)
            .collection('hands').doc(p.uid);
          batch.delete(handRef);
        });
        return batch.commit();
      }).then(function() {
        if (onPlayAgain) onPlayAgain();
      }).catch(function(error) {
        console.error('[DefuseResults] Error resetting room:', error);
      });
    }, [room, roomId, onPlayAgain]);

    // Handle leave
    var handleLeave = useCallback(function() {
      if (!room || !currentUser) {
        if (onLeave) onLeave();
        return;
      }

      // Remove player from room
      var playerToRemove = room.players.find(function(p) {
        return p.uid === currentUser.uid;
      });

      if (playerToRemove) {
        db.collection('rooms').doc(roomId).update({
          players: firebase.firestore.FieldValue.arrayRemove(playerToRemove)
        }).then(function() {
          // Delete player's hand
          return db.collection('rooms').doc(roomId)
            .collection('hands').doc(currentUser.uid).delete();
        }).then(function() {
          if (onLeave) onLeave();
        }).catch(function(error) {
          console.error('[DefuseResults] Error leaving:', error);
          if (onLeave) onLeave();
        });
      } else {
        if (onLeave) onLeave();
      }
    }, [room, roomId, currentUser, onLeave]);

    // Loading state
    if (!room) {
      return React.createElement('div', { style: styles.container },
        React.createElement('p', { style: { color: 'white' } }, 'Loading results...')
      );
    }

    // Find winner
    var winner = sortedPlayers.find(function(p) { return p.rank === 1; });
    var isWinner = winner && winner.uid === currentUser.uid;
    var myGoldChange = room.goldResults ? room.goldResults[currentUser.uid] || 0 : 0;

    return React.createElement('div', { style: styles.container },
      // Close button
      React.createElement('button', {
        style: styles.closeBtn,
        onClick: handleLeave
      }, 'x'),

      // Header
      React.createElement('div', { style: styles.header },
        React.createElement('h1', { style: styles.title }, 'Results'),
        React.createElement('p', { style: styles.subtitle },
          room.players.length + ' Players'
        )
      ),

      // Results card
      React.createElement('div', { style: styles.resultsCard },
        // Table header
        React.createElement('div', { style: styles.tableHeader },
          React.createElement('span', { 
            style: Object.assign({}, styles.headerCell, styles.rankCol) 
          }, 'Rank'),
          React.createElement('span', { 
            style: Object.assign({}, styles.headerCell, styles.playerCol) 
          }, 'Player'),
          React.createElement('span', { 
            style: Object.assign({}, styles.headerCell, styles.goldCol) 
          }, 'Gold')
        ),

        // Player rows
        sortedPlayers.map(function(player) {
          var isYou = player.uid === currentUser.uid;
          var isFirst = player.rank === 1;
          var goldChange = room.goldResults ? room.goldResults[player.uid] || 0 : 0;

          return React.createElement('div', {
            key: player.uid,
            style: Object.assign({},
              styles.playerRow,
              isFirst ? styles.playerRowWinner : {},
              isYou && !isFirst ? styles.playerRowYou : {}
            )
          },
            // Rank badge
            React.createElement('div', {
              style: Object.assign({}, styles.rankBadge, getRankStyle(player.rank))
            },
              player.rank === 1 ? React.createElement(TrophyIcon) : player.rank
            ),

            // Player info
            React.createElement('div', { style: styles.playerInfo },
              React.createElement('img', {
                src: player.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + player.uid,
                alt: player.name,
                style: Object.assign({},
                  styles.avatar,
                  isFirst ? styles.avatarWinner : {}
                )
              }),
              React.createElement('span', { style: styles.playerName },
                player.name,
                isYou && React.createElement('span', { style: styles.youBadge }, 'You')
              )
            ),

            // Gold change
            React.createElement('span', {
              style: Object.assign({}, styles.goldChange, getGoldStyle(goldChange))
            }, formatGold(goldChange) + 'g')
          );
        })
      ),

      // Stats
      React.createElement('div', { style: styles.statsContainer },
        React.createElement('div', { style: styles.statItem },
          React.createElement('div', { style: styles.statValue }, room.stakeN || 0),
          React.createElement('div', { style: styles.statLabel }, 'Stake')
        ),
        React.createElement('div', { style: styles.statItem },
          React.createElement('div', {
            style: Object.assign({}, styles.statValue, getGoldStyle(myGoldChange))
          }, formatGold(myGoldChange)),
          React.createElement('div', { style: styles.statLabel }, 'Your Result')
        ),
        React.createElement('div', { style: styles.statItem },
          React.createElement('div', { style: styles.statValue }, 
            sortedPlayers.find(function(p) { return p.uid === currentUser.uid; })?.rank || '-'
          ),
          React.createElement('div', { style: styles.statLabel }, 'Your Rank')
        )
      ),

      // Buttons
      React.createElement('div', { style: styles.buttonsContainer },
        React.createElement('button', {
          style: Object.assign({}, styles.button, styles.playAgainBtn),
          onClick: handlePlayAgain
        }, 'Play Again'),
        React.createElement('button', {
          style: Object.assign({}, styles.button, styles.leaveBtn),
          onClick: handleLeave
        }, 'Leave')
      )
    );
  }

  // Expose to window
  window.DefuseResults = DefuseResults;

})();
