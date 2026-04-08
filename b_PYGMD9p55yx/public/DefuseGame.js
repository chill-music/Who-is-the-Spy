/**
 * Defuse Master - Game Component
 * IIFE pattern - exposes window.DefuseGame
 * Main gameplay screen with draw pile, player hands, and card actions
 */
(function() {
  'use strict';

  var React = window.React;
  var useState = React.useState;
  var useEffect = React.useEffect;
  var useCallback = React.useCallback;
  var useMemo = React.useMemo;
  var firebase = window.firebase;
  var db = firebase.firestore();

  // Card Icons as inline SVG paths
  var CARD_ICONS = {
    bomb: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-2h-2v2zm0-4h2V7h-2v6z',
    disable: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-1.5-5.5l7-7-1.5-1.5-5.5 5.5-2.5-2.5-1.5 1.5 4 4z',
    xray: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
    prophecy: 'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z',
    shuffle: 'M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z',
    bottom: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
    trap: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z',
    re: 'M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z',
    pro: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z',
    bo: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'
  };

  // Styles
  var styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #5B2D8E 0%, #3A1A6E 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Nunito', sans-serif",
      overflow: 'hidden'
    },
    topBar: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '15px 10px',
      gap: '8px',
      flexWrap: 'wrap'
    },
    playerBubble: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transition: 'transform 0.3s'
    },
    playerBubbleActive: {
      transform: 'scale(1.1)'
    },
    avatarContainer: {
      position: 'relative'
    },
    avatar: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      border: '3px solid transparent',
      objectFit: 'cover',
      background: '#2D1B4E'
    },
    avatarActive: {
      border: '3px solid #FFD700',
      boxShadow: '0 0 15px rgba(255, 215, 0, 0.6)'
    },
    avatarEliminated: {
      opacity: 0.4,
      filter: 'grayscale(100%)'
    },
    cardCount: {
      color: 'white',
      fontSize: '16px',
      fontWeight: '700',
      marginTop: '4px'
    },
    trapBadge: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      background: '#E67E22',
      color: 'white',
      fontSize: '10px',
      fontWeight: '700',
      padding: '2px 6px',
      borderRadius: '8px'
    },
    centerArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      gap: '20px'
    },
    deckArea: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '30px'
    },
    drawPile: {
      position: 'relative',
      width: '100px',
      height: '140px',
      cursor: 'pointer',
      transition: 'transform 0.2s'
    },
    drawPileCard: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(180deg, #F5A623 0%, #D4880F 100%)',
      borderRadius: '16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    },
    drawPileIcon: {
      width: '40px',
      height: '40px',
      opacity: 0.8
    },
    drawPileCount: {
      color: 'rgba(0,0,0,0.6)',
      fontSize: '14px',
      fontWeight: '600',
      marginTop: '4px'
    },
    progressRing: {
      position: 'absolute',
      top: '-15px',
      left: '-15px',
      width: '45px',
      height: '45px'
    },
    progressText: {
      position: 'absolute',
      top: '-15px',
      left: '-15px',
      width: '45px',
      height: '45px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#3498DB',
      borderRadius: '50%',
      color: 'white',
      fontSize: '11px',
      fontWeight: '700'
    },
    activeCard: {
      width: '120px',
      height: '160px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px'
    },
    activeCardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginBottom: '8px'
    },
    activeCardBadge: {
      background: '#E67E22',
      color: 'white',
      fontSize: '10px',
      fontWeight: '700',
      padding: '2px 6px',
      borderRadius: '6px'
    },
    activeCardIcon: {
      width: '50px',
      height: '50px'
    },
    activeCardMultiplier: {
      color: '#E67E22',
      fontSize: '24px',
      fontWeight: '800',
      marginTop: '8px'
    },
    turnIndicator: {
      background: 'rgba(255,255,255,0.1)',
      padding: '12px 24px',
      borderRadius: '20px',
      color: 'white',
      fontSize: '14px',
      fontWeight: '600',
      textAlign: 'center'
    },
    turnIndicatorYou: {
      background: 'rgba(76, 175, 80, 0.3)',
      border: '2px solid #4CAF50'
    },
    handContainer: {
      padding: '15px',
      background: 'rgba(0,0,0,0.2)',
      borderTopLeftRadius: '24px',
      borderTopRightRadius: '24px'
    },
    handLabel: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: '12px',
      fontWeight: '600',
      marginBottom: '10px',
      textAlign: 'center'
    },
    handCards: {
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      overflowX: 'auto',
      padding: '5px'
    },
    handCard: {
      width: '70px',
      height: '95px',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      flexShrink: 0,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      padding: '8px'
    },
    handCardSelected: {
      transform: 'translateY(-10px)',
      boxShadow: '0 8px 24px rgba(255, 215, 0, 0.5)'
    },
    handCardIcon: {
      width: '28px',
      height: '28px',
      marginBottom: '4px'
    },
    handCardName: {
      fontSize: '10px',
      fontWeight: '700',
      textAlign: 'center'
    },
    actionButtons: {
      display: 'flex',
      gap: '10px',
      padding: '10px 15px',
      justifyContent: 'center'
    },
    actionBtn: {
      padding: '12px 24px',
      borderRadius: '20px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'transform 0.2s, opacity 0.2s'
    },
    drawBtn: {
      background: 'linear-gradient(180deg, #3498DB 0%, #2980B9 100%)',
      color: 'white'
    },
    playBtn: {
      background: 'linear-gradient(180deg, #4ADE80 0%, #22C55E 100%)',
      color: 'white'
    },
    disabledBtn: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    // Modal styles
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)',
      borderRadius: '24px',
      padding: '30px',
      maxWidth: '320px',
      width: '90%',
      textAlign: 'center',
      color: 'white'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: '800',
      marginBottom: '15px'
    },
    modalText: {
      fontSize: '16px',
      marginBottom: '20px',
      opacity: 0.9
    },
    modalCards: {
      display: 'flex',
      justifyContent: 'center',
      gap: '15px',
      marginBottom: '20px'
    },
    modalCard: {
      width: '80px',
      height: '110px',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
    },
    modalClose: {
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      position: 'absolute',
      top: '15px',
      right: '15px',
      cursor: 'pointer',
      color: 'white',
      fontSize: '18px'
    },
    bombModal: {
      background: 'linear-gradient(180deg, #EF4444 0%, #B91C1C 100%)'
    },
    bombIcon: {
      width: '80px',
      height: '80px',
      marginBottom: '15px'
    },
    placementOptions: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      justifyContent: 'center',
      marginTop: '15px'
    },
    placementBtn: {
      width: '45px',
      height: '45px',
      borderRadius: '12px',
      background: 'rgba(255,255,255,0.2)',
      border: '2px solid transparent',
      color: 'white',
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    placementBtnHover: {
      background: 'rgba(255,255,255,0.3)',
      borderColor: 'white'
    },
    targetSelector: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '15px',
      justifyContent: 'center',
      marginTop: '15px'
    },
    targetOption: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'pointer',
      padding: '10px',
      borderRadius: '12px',
      background: 'rgba(255,255,255,0.1)',
      transition: 'background 0.2s'
    }
  };

  // Card component
  function Card(props) {
    var card = props.card;
    var selected = props.selected;
    var onClick = props.onClick;
    var size = props.size || 'normal';
    
    var cardInfo = window.DefuseCards.getCardInfo(card.type);
    if (!cardInfo) return null;

    var sizeStyles = size === 'small' 
      ? { width: '70px', height: '95px' }
      : size === 'modal'
      ? { width: '80px', height: '110px' }
      : { width: '70px', height: '95px' };

    var cardStyle = Object.assign({}, 
      styles.handCard, 
      sizeStyles,
      { background: cardInfo.bgColor },
      selected ? styles.handCardSelected : {}
    );

    return React.createElement('div', {
      style: cardStyle,
      onClick: onClick
    },
      React.createElement('svg', {
        style: styles.handCardIcon,
        viewBox: '0 0 24 24',
        fill: cardInfo.color
      },
        React.createElement('path', { d: CARD_ICONS[card.type] || CARD_ICONS.bomb })
      ),
      React.createElement('span', {
        style: Object.assign({}, styles.handCardName, { color: cardInfo.color })
      }, cardInfo.name)
    );
  }

  // Bomb Modal component
  function BombModal(props) {
    var onDisable = props.onDisable;
    var onEliminate = props.onEliminate;
    var hasDisable = props.hasDisable;
    var deckCount = props.deckCount;
    var onPlaceBomb = props.onPlaceBomb;
    var showPlacement = props.showPlacement;

    var _useState = useState(null);
    var selectedPosition = _useState[0];
    var setSelectedPosition = _useState[1];

    if (showPlacement) {
      return React.createElement('div', { style: styles.modalOverlay },
        React.createElement('div', { 
          style: Object.assign({}, styles.modalContent, { position: 'relative' })
        },
          React.createElement('div', { style: styles.modalTitle }, 'Place the Bomb'),
          React.createElement('p', { style: styles.modalText }, 
            'Choose where to secretly place the bomb back in the deck'
          ),
          React.createElement('div', { style: styles.placementOptions },
            Array.from({ length: Math.min(deckCount + 1, 10) }, function(_, i) {
              return React.createElement('button', {
                key: i,
                style: Object.assign({}, 
                  styles.placementBtn,
                  selectedPosition === i ? { borderColor: '#FFD700', background: 'rgba(255,215,0,0.3)' } : {}
                ),
                onClick: function() { setSelectedPosition(i); }
              }, i === 0 ? 'Top' : (i === deckCount ? 'Bot' : i));
            })
          ),
          React.createElement('button', {
            style: Object.assign({}, styles.actionBtn, styles.playBtn, { marginTop: '20px' }),
            onClick: function() { 
              if (selectedPosition !== null) onPlaceBomb(selectedPosition); 
            },
            disabled: selectedPosition === null
          }, 'Confirm')
        )
      );
    }

    return React.createElement('div', { style: styles.modalOverlay },
      React.createElement('div', { 
        style: Object.assign({}, styles.modalContent, styles.bombModal) 
      },
        React.createElement('svg', {
          style: styles.bombIcon,
          viewBox: '0 0 24 24',
          fill: '#FFCDD2'
        },
          React.createElement('path', { d: CARD_ICONS.bomb })
        ),
        React.createElement('div', { style: styles.modalTitle }, 'BOMB!'),
        React.createElement('p', { style: styles.modalText },
          hasDisable 
            ? 'You drew a bomb! Use your Disable card to survive.'
            : 'You drew a bomb and have no Disable card!'
        ),
        hasDisable 
          ? React.createElement('button', {
              style: Object.assign({}, styles.actionBtn, styles.playBtn),
              onClick: onDisable
            }, 'Use Disable')
          : React.createElement('button', {
              style: Object.assign({}, styles.actionBtn, { background: '#666' }),
              onClick: onEliminate
            }, 'Accept Fate')
      )
    );
  }

  // X-Ray Modal component
  function XRayModal(props) {
    var cards = props.cards;
    var onClose = props.onClose;

    return React.createElement('div', { style: styles.modalOverlay },
      React.createElement('div', { 
        style: Object.assign({}, styles.modalContent, { position: 'relative' }) 
      },
        React.createElement('button', {
          style: styles.modalClose,
          onClick: onClose
        }, 'x'),
        React.createElement('div', { style: styles.modalTitle }, 'X-Ray Vision'),
        React.createElement('p', { style: styles.modalText }, 'Top 3 cards in the deck:'),
        React.createElement('div', { style: styles.modalCards },
          cards.map(function(card, index) {
            return React.createElement(Card, {
              key: card.id,
              card: card,
              size: 'modal'
            });
          })
        ),
        React.createElement('p', { style: { fontSize: '12px', opacity: 0.7 } }, 
          'Left = Top of deck'
        )
      )
    );
  }

  // Prophecy Modal component
  function ProphecyModal(props) {
    var bombPosition = props.bombPosition;
    var onClose = props.onClose;

    return React.createElement('div', { style: styles.modalOverlay },
      React.createElement('div', { 
        style: Object.assign({}, styles.modalContent, { position: 'relative' }) 
      },
        React.createElement('button', {
          style: styles.modalClose,
          onClick: onClose
        }, 'x'),
        React.createElement('svg', {
          style: { width: '60px', height: '60px', marginBottom: '15px' },
          viewBox: '0 0 24 24',
          fill: '#F1C40F'
        },
          React.createElement('path', { d: CARD_ICONS.prophecy })
        ),
        React.createElement('div', { style: styles.modalTitle }, 'Prophecy'),
        bombPosition !== null
          ? React.createElement('p', { style: styles.modalText },
              'The nearest BOMB is at position ',
              React.createElement('strong', { style: { color: '#EF4444' } }, bombPosition + 1),
              ' from the top.'
            )
          : React.createElement('p', { style: styles.modalText },
              'There are no bombs in the deck!'
            )
      )
    );
  }

  // Target Selector Modal
  function TargetModal(props) {
    var players = props.players;
    var currentUid = props.currentUid;
    var onSelect = props.onSelect;
    var onClose = props.onClose;
    var title = props.title || 'Select Target';

    var targets = players.filter(function(p) {
      return p.uid !== currentUid && p.status === 'alive';
    });

    return React.createElement('div', { style: styles.modalOverlay },
      React.createElement('div', { 
        style: Object.assign({}, styles.modalContent, { position: 'relative' }) 
      },
        React.createElement('button', {
          style: styles.modalClose,
          onClick: onClose
        }, 'x'),
        React.createElement('div', { style: styles.modalTitle }, title),
        React.createElement('div', { style: styles.targetSelector },
          targets.map(function(player) {
            return React.createElement('div', {
              key: player.uid,
              style: styles.targetOption,
              onClick: function() { onSelect(player.uid); }
            },
              React.createElement('img', {
                src: player.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + player.uid,
                alt: player.name,
                style: Object.assign({}, styles.avatar, { width: '50px', height: '50px' })
              }),
              React.createElement('span', { 
                style: { color: 'white', fontSize: '12px', marginTop: '5px' } 
              }, player.name)
            );
          })
        )
      )
    );
  }

  // Main DefuseGame component
  function DefuseGame(props) {
    var roomId = props.roomId;
    var currentUser = props.currentUser;
    var onGameEnd = props.onGameEnd;

    // State
    var _useState1 = useState(null);
    var room = _useState1[0];
    var setRoom = _useState1[1];

    var _useState2 = useState([]);
    var myHand = _useState2[0];
    var setMyHand = _useState2[1];

    var _useState3 = useState(null);
    var selectedCard = _useState3[0];
    var setSelectedCard = _useState3[1];

    var _useState4 = useState(null);
    var modal = _useState4[0];
    var setModal = _useState4[1];

    var _useState5 = useState(null);
    var drawnBomb = _useState5[0];
    var setDrawnBomb = _useState5[1];

    var _useState6 = useState(false);
    var showPlacement = _useState6[0];
    var setShowPlacement = _useState6[1];

    var _useState7 = useState(false);
    var isProcessing = _useState7[0];
    var setIsProcessing = _useState7[1];

    // Computed values
    var isMyTurn = room && room.currentTurn === currentUser.uid;
    var myPlayer = room && room.players.find(function(p) { return p.uid === currentUser.uid; });
    var amAlive = myPlayer && myPlayer.status === 'alive';
    var hasDisable = myHand.some(function(c) { return c.type === 'disable'; });
    var trapMultiplier = myPlayer ? myPlayer.trapMultiplier : 0;

    // Subscribe to room updates
    useEffect(function() {
      if (!roomId) return;

      var unsubscribe = db.collection('rooms').doc(roomId)
        .onSnapshot(function(doc) {
          if (doc.exists) {
            var roomData = Object.assign({ id: doc.id }, doc.data());
            setRoom(roomData);

            // Check for game end
            var winCheck = window.DefuseRules.checkWinCondition(roomData.players);
            if (winCheck.isGameOver && roomData.status === 'playing') {
              // Game is over
              if (onGameEnd) onGameEnd(winCheck.winner);
            }
          }
        });

      return function() { unsubscribe(); };
    }, [roomId, onGameEnd]);

    // Subscribe to my hand
    useEffect(function() {
      if (!roomId || !currentUser) return;

      var unsubscribe = db.collection('rooms').doc(roomId)
        .collection('hands').doc(currentUser.uid)
        .onSnapshot(function(doc) {
          if (doc.exists) {
            setMyHand(doc.data().cards || []);
          }
        });

      return function() { unsubscribe(); };
    }, [roomId, currentUser]);

    // Draw card from deck
    var handleDraw = useCallback(function() {
      if (!isMyTurn || !amAlive || isProcessing || !room) return;
      
      setIsProcessing(true);

      var drawCount = trapMultiplier > 0 ? trapMultiplier : 1;
      var deck = room.deck.slice();
      var drawnCards = [];
      var foundBomb = null;

      // Draw cards
      for (var i = 0; i < drawCount && deck.length > 0; i++) {
        var card = deck.shift();
        if (card.type === 'bomb') {
          foundBomb = card;
          break;
        }
        drawnCards.push(card);
      }

      if (foundBomb) {
        // Show bomb modal
        setDrawnBomb(foundBomb);
        setModal('bomb');
        setIsProcessing(false);
        return;
      }

      // No bomb - add cards to hand and end turn
      var roomRef = db.collection('rooms').doc(roomId);
      var handRef = roomRef.collection('hands').doc(currentUser.uid);

      var batch = db.batch();

      // Update hand
      var newHand = myHand.concat(drawnCards);
      batch.update(handRef, { cards: newHand });

      // Update room
      var nextPlayer = window.DefuseRules.getNextPlayer(
        room.turnOrder, 
        currentUser.uid, 
        room.players
      );

      var updatedPlayers = room.players.map(function(p) {
        if (p.uid === currentUser.uid) {
          return Object.assign({}, p, { 
            handCount: newHand.length,
            trapMultiplier: 0 // Clear trap after drawing
          });
        }
        return p;
      });

      batch.update(roomRef, {
        deck: deck,
        deckCount: deck.length,
        currentTurn: nextPlayer,
        players: updatedPlayers,
        lastAction: {
          type: 'draw',
          byUid: currentUser.uid,
          cardCount: drawCount,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }
      });

      batch.commit()
        .then(function() {
          setIsProcessing(false);
        })
        .catch(function(error) {
          console.error('[DefuseGame] Draw error:', error);
          setIsProcessing(false);
        });
    }, [isMyTurn, amAlive, isProcessing, room, roomId, currentUser, myHand, trapMultiplier]);

    // Use Disable card after bomb
    var handleDisable = useCallback(function() {
      if (!drawnBomb || !hasDisable) return;
      
      // Find and remove disable card from hand
      var disableCard = myHand.find(function(c) { return c.type === 'disable'; });
      if (!disableCard) return;

      var newHand = window.DefuseCards.removeCardFromHand(myHand, disableCard.id);
      
      // Update local hand
      setMyHand(newHand);
      
      // Show placement modal
      setModal('placement');
      setShowPlacement(true);
    }, [drawnBomb, hasDisable, myHand]);

    // Place bomb back in deck
    var handlePlaceBomb = useCallback(function(position) {
      if (!drawnBomb || !room) return;

      setIsProcessing(true);

      var deck = room.deck.slice();
      var newDeck = window.DefuseCards.insertBombAtPosition(deck, drawnBomb, position);

      var roomRef = db.collection('rooms').doc(roomId);
      var handRef = roomRef.collection('hands').doc(currentUser.uid);

      var batch = db.batch();

      // Get next player
      var nextPlayer = window.DefuseRules.getNextPlayer(
        room.turnOrder,
        currentUser.uid,
        room.players
      );

      // Find disable card to remove
      var disableCard = myHand.find(function(c) { return c.type === 'disable'; });
      var newHand = disableCard 
        ? window.DefuseCards.removeCardFromHand(myHand, disableCard.id)
        : myHand;

      // Update hand
      batch.update(handRef, { cards: newHand });

      // Update room
      var updatedPlayers = room.players.map(function(p) {
        if (p.uid === currentUser.uid) {
          return Object.assign({}, p, { 
            handCount: newHand.length,
            trapMultiplier: 0
          });
        }
        return p;
      });

      batch.update(roomRef, {
        deck: newDeck,
        deckCount: newDeck.length,
        currentTurn: nextPlayer,
        players: updatedPlayers,
        lastAction: {
          type: 'disable',
          byUid: currentUser.uid,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }
      });

      batch.commit()
        .then(function() {
          setDrawnBomb(null);
          setShowPlacement(false);
          setModal(null);
          setIsProcessing(false);
        })
        .catch(function(error) {
          console.error('[DefuseGame] Place bomb error:', error);
          setIsProcessing(false);
        });
    }, [drawnBomb, room, roomId, currentUser, myHand]);

    // Get eliminated (no disable card)
    var handleEliminate = useCallback(function() {
      if (!drawnBomb || !room) return;

      setIsProcessing(true);

      var roomRef = db.collection('rooms').doc(roomId);

      // Add bomb back to deck at random position
      var deck = room.deck.slice();
      var position = Math.floor(Math.random() * (deck.length + 1));
      deck.splice(position, 0, drawnBomb);

      // Get next player
      var nextPlayer = window.DefuseRules.getNextPlayer(
        room.turnOrder,
        currentUser.uid,
        room.players
      );

      // Calculate rank for eliminated player
      var aliveCount = room.players.filter(function(p) { 
        return p.status === 'alive' && p.uid !== currentUser.uid; 
      }).length;
      var myRank = aliveCount + 1;

      // Update players
      var updatedPlayers = room.players.map(function(p) {
        if (p.uid === currentUser.uid) {
          return Object.assign({}, p, { 
            status: 'eliminated',
            rank: myRank,
            trapMultiplier: 0
          });
        }
        return p;
      });

      // Check win condition
      var winCheck = window.DefuseRules.checkWinCondition(updatedPlayers);
      var updateData = {
        deck: deck,
        deckCount: deck.length,
        currentTurn: nextPlayer,
        players: updatedPlayers,
        eliminationOrder: firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
        lastAction: {
          type: 'bomb',
          byUid: currentUser.uid,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }
      };

      if (winCheck.isGameOver && winCheck.winner) {
        // Assign winner rank
        updateData.players = updatedPlayers.map(function(p) {
          if (p.uid === winCheck.winner.uid) {
            return Object.assign({}, p, { rank: 1 });
          }
          return p;
        });
        updateData.status = 'finished';
        
        // Calculate gold rewards
        var goldResults = window.DefuseRules.calculateGoldRewards(
          updateData.players, 
          room.stakeN
        );
        updateData.goldResults = goldResults;
      }

      roomRef.update(updateData)
        .then(function() {
          setDrawnBomb(null);
          setModal(null);
          setIsProcessing(false);
        })
        .catch(function(error) {
          console.error('[DefuseGame] Eliminate error:', error);
          setIsProcessing(false);
        });
    }, [drawnBomb, room, roomId, currentUser]);

    // Play a card from hand
    var handlePlayCard = useCallback(function() {
      if (!selectedCard || !isMyTurn || !amAlive || isProcessing || !room) return;

      var card = myHand.find(function(c) { return c.id === selectedCard; });
      if (!card) return;

      // Handle different card types
      switch (card.type) {
        case 'xray':
          // Show top 3 cards
          var topCards = window.DefuseCards.peekTopCards(room.deck, 3);
          setModal({ type: 'xray', cards: topCards });
          removeCardAndEndTurn(card);
          break;

        case 'prophecy':
          // Show nearest bomb position
          var bombPos = window.DefuseCards.findNearestBomb(room.deck);
          setModal({ type: 'prophecy', position: bombPos });
          removeCardAndEndTurn(card);
          break;

        case 'shuffle':
          // Shuffle deck
          shuffleDeck(card);
          break;

        case 'bottom':
          // Draw from bottom
          drawFromBottom(card);
          break;

        case 'trap':
          // Need to select target
          setModal({ type: 'target', card: card, action: 'trap' });
          break;

        case 're':
          // Skip turn
          skipTurn(card);
          break;

        case 'pro':
          // Set protection
          setProtection(card);
          break;

        case 'bo':
          // Draw 2 cards
          drawMultiple(card, 2);
          break;

        default:
          console.warn('[DefuseGame] Unknown card type:', card.type);
      }

      setSelectedCard(null);
    }, [selectedCard, isMyTurn, amAlive, isProcessing, room, myHand]);

    // Helper: Remove card from hand and update
    var removeCardAndEndTurn = function(card) {
      var newHand = window.DefuseCards.removeCardFromHand(myHand, card.id);
      
      var roomRef = db.collection('rooms').doc(roomId);
      var handRef = roomRef.collection('hands').doc(currentUser.uid);

      var batch = db.batch();
      batch.update(handRef, { cards: newHand });
      
      var updatedPlayers = room.players.map(function(p) {
        if (p.uid === currentUser.uid) {
          return Object.assign({}, p, { handCount: newHand.length });
        }
        return p;
      });

      batch.update(roomRef, {
        players: updatedPlayers,
        lastAction: {
          type: card.type,
          byUid: currentUser.uid,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }
      });

      batch.commit();
    };

    // Shuffle deck
    var shuffleDeck = function(card) {
      setIsProcessing(true);

      var shuffledDeck = window.DefuseCards.shuffle(room.deck);
      var newHand = window.DefuseCards.removeCardFromHand(myHand, card.id);

      var roomRef = db.collection('rooms').doc(roomId);
      var handRef = roomRef.collection('hands').doc(currentUser.uid);

      var batch = db.batch();
      batch.update(handRef, { cards: newHand });

      var updatedPlayers = room.players.map(function(p) {
        if (p.uid === currentUser.uid) {
          return Object.assign({}, p, { handCount: newHand.length });
        }
        return p;
      });

      batch.update(roomRef, {
        deck: shuffledDeck,
        players: updatedPlayers,
        lastAction: {
          type: 'shuffle',
          byUid: currentUser.uid,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }
      });

      batch.commit().then(function() {
        setIsProcessing(false);
      });
    };

    // Draw from bottom
    var drawFromBottom = function(card) {
      setIsProcessing(true);

      var result = window.DefuseCards.drawFromBottom(room.deck);
      if (!result.card) {
        setIsProcessing(false);
        return;
      }

      // Check if bomb
      if (result.card.type === 'bomb') {
        // Remove the card from hand first
        var newHand = window.DefuseCards.removeCardFromHand(myHand, card.id);
        setMyHand(newHand);
        
        // Update deck in Firestore
        db.collection('rooms').doc(roomId).update({
          deck: result.remainingDeck,
          deckCount: result.remainingDeck.length
        }).then(function() {
          setDrawnBomb(result.card);
          setModal('bomb');
          setIsProcessing(false);
        });
        return;
      }

      // Add drawn card to hand, remove played card
      var newHand = window.DefuseCards.removeCardFromHand(myHand, card.id);
      newHand = window.DefuseCards.addCardToHand(newHand, result.card);

      var roomRef = db.collection('rooms').doc(roomId);
      var handRef = roomRef.collection('hands').doc(currentUser.uid);

      var nextPlayer = window.DefuseRules.getNextPlayer(
        room.turnOrder,
        currentUser.uid,
        room.players
      );

      var batch = db.batch();
      batch.update(handRef, { cards: newHand });

      var updatedPlayers = room.players.map(function(p) {
        if (p.uid === currentUser.uid) {
          return Object.assign({}, p, { handCount: newHand.length, trapMultiplier: 0 });
        }
        return p;
      });

      batch.update(roomRef, {
        deck: result.remainingDeck,
        deckCount: result.remainingDeck.length,
        currentTurn: nextPlayer,
        players: updatedPlayers,
        lastAction: {
          type: 'bottom',
          byUid: currentUser.uid,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }
      });

      batch.commit().then(function() {
        setIsProcessing(false);
      });
    };

    // Skip turn (Re card)
    var skipTurn = function(card) {
      setIsProcessing(true);

      var newHand = window.DefuseCards.removeCardFromHand(myHand, card.id);
      var nextPlayer = window.DefuseRules.getNextPlayer(
        room.turnOrder,
        currentUser.uid,
        room.players
      );

      var roomRef = db.collection('rooms').doc(roomId);
      var handRef = roomRef.collection('hands').doc(currentUser.uid);

      var batch = db.batch();
      batch.update(handRef, { cards: newHand });

      var updatedPlayers = room.players.map(function(p) {
        if (p.uid === currentUser.uid) {
          return Object.assign({}, p, { handCount: newHand.length, trapMultiplier: 0 });
        }
        return p;
      });

      batch.update(roomRef, {
        currentTurn: nextPlayer,
        players: updatedPlayers,
        lastAction: {
          type: 're',
          byUid: currentUser.uid,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }
      });

      batch.commit().then(function() {
        setIsProcessing(false);
      });
    };

    // Set protection (Pro card)
    var setProtection = function(card) {
      setIsProcessing(true);

      var newHand = window.DefuseCards.removeCardFromHand(myHand, card.id);

      var roomRef = db.collection('rooms').doc(roomId);
      var handRef = roomRef.collection('hands').doc(currentUser.uid);

      var batch = db.batch();
      batch.update(handRef, { cards: newHand });

      var updatedPlayers = room.players.map(function(p) {
        if (p.uid === currentUser.uid) {
          return Object.assign({}, p, { 
            handCount: newHand.length, 
            isProtected: true 
          });
        }
        return p;
      });

      batch.update(roomRef, {
        players: updatedPlayers,
        lastAction: {
          type: 'pro',
          byUid: currentUser.uid,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }
      });

      batch.commit().then(function() {
        setIsProcessing(false);
      });
    };

    // Draw multiple cards (Bo card)
    var drawMultiple = function(card, count) {
      setIsProcessing(true);

      var deck = room.deck.slice();
      var drawnCards = [];
      var foundBomb = null;

      for (var i = 0; i < count && deck.length > 0; i++) {
        var drawn = deck.shift();
        if (drawn.type === 'bomb') {
          foundBomb = drawn;
          break;
        }
        drawnCards.push(drawn);
      }

      var newHand = window.DefuseCards.removeCardFromHand(myHand, card.id);
      drawnCards.forEach(function(c) {
        newHand = window.DefuseCards.addCardToHand(newHand, c);
      });

      if (foundBomb) {
        setMyHand(newHand);
        db.collection('rooms').doc(roomId).update({
          deck: deck,
          deckCount: deck.length
        }).then(function() {
          setDrawnBomb(foundBomb);
          setModal('bomb');
          setIsProcessing(false);
        });
        return;
      }

      var roomRef = db.collection('rooms').doc(roomId);
      var handRef = roomRef.collection('hands').doc(currentUser.uid);

      var batch = db.batch();
      batch.update(handRef, { cards: newHand });

      var updatedPlayers = room.players.map(function(p) {
        if (p.uid === currentUser.uid) {
          return Object.assign({}, p, { handCount: newHand.length });
        }
        return p;
      });

      batch.update(roomRef, {
        deck: deck,
        deckCount: deck.length,
        players: updatedPlayers,
        lastAction: {
          type: 'bo',
          byUid: currentUser.uid,
          cardCount: count,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }
      });

      batch.commit().then(function() {
        setIsProcessing(false);
      });
    };

    // Play trap on target
    var handleTrapTarget = function(targetUid) {
      if (!modal || modal.type !== 'target' || !modal.card) return;

      setIsProcessing(true);
      setModal(null);

      var card = modal.card;
      var newHand = window.DefuseCards.removeCardFromHand(myHand, card.id);

      var roomRef = db.collection('rooms').doc(roomId);
      var handRef = roomRef.collection('hands').doc(currentUser.uid);

      var batch = db.batch();
      batch.update(handRef, { cards: newHand });

      var updatedPlayers = room.players.map(function(p) {
        if (p.uid === currentUser.uid) {
          return Object.assign({}, p, { handCount: newHand.length });
        }
        if (p.uid === targetUid) {
          // Check if protected
          if (p.isProtected) {
            return Object.assign({}, p, { isProtected: false });
          }
          return Object.assign({}, p, { 
            trapMultiplier: window.DefuseRules.addTrapMultiplier(p.trapMultiplier)
          });
        }
        return p;
      });

      batch.update(roomRef, {
        players: updatedPlayers,
        lastAction: {
          type: 'trap',
          byUid: currentUser.uid,
          targetUid: targetUid,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }
      });

      batch.commit().then(function() {
        setIsProcessing(false);
      });
    };

    // Close modal
    var closeModal = function() {
      setModal(null);
    };

    // Calculate bomb percentage
    var bombPercentage = useMemo(function() {
      if (!room || room.deckCount === 0) return 0;
      var bombCount = room.players.length - 1 - room.eliminationOrder.length;
      return Math.round((bombCount / room.deckCount) * 100);
    }, [room]);

    // Render loading state
    if (!room) {
      return React.createElement('div', { style: styles.container },
        React.createElement('div', { 
          style: { 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white'
          } 
        }, 'Loading...')
      );
    }

    // Get current turn player name
    var currentTurnPlayer = room.players.find(function(p) { 
      return p.uid === room.currentTurn; 
    });
    var turnText = isMyTurn 
      ? (trapMultiplier > 0 ? 'Draw ' + trapMultiplier + ' cards!' : 'Your Turn - Draw or Play')
      : (currentTurnPlayer ? currentTurnPlayer.name + "'s turn" : 'Waiting...');

    return React.createElement('div', { style: styles.container },
      // Top bar with player avatars
      React.createElement('div', { style: styles.topBar },
        room.players.map(function(player) {
          var isActive = player.uid === room.currentTurn;
          var isEliminated = player.status === 'eliminated';
          
          return React.createElement('div', {
            key: player.uid,
            style: Object.assign({}, 
              styles.playerBubble,
              isActive ? styles.playerBubbleActive : {}
            )
          },
            React.createElement('div', { style: styles.avatarContainer },
              React.createElement('img', {
                src: player.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + player.uid,
                alt: player.name,
                style: Object.assign({},
                  styles.avatar,
                  isActive ? styles.avatarActive : {},
                  isEliminated ? styles.avatarEliminated : {}
                )
              }),
              player.trapMultiplier > 0 && React.createElement('div', { style: styles.trapBadge },
                'x' + player.trapMultiplier
              )
            ),
            React.createElement('span', { style: styles.cardCount },
              isEliminated ? 'OUT' : player.handCount
            )
          );
        })
      ),

      // Center area with deck and active card
      React.createElement('div', { style: styles.centerArea },
        React.createElement('div', { style: styles.deckArea },
          // Draw pile
          React.createElement('div', {
            style: styles.drawPile,
            onClick: isMyTurn && amAlive && !isProcessing ? handleDraw : null
          },
            React.createElement('div', { style: styles.drawPileCard },
              React.createElement('svg', {
                style: styles.drawPileIcon,
                viewBox: '0 0 24 24',
                fill: 'rgba(0,0,0,0.5)'
              },
                React.createElement('path', { d: CARD_ICONS.bomb })
              ),
              React.createElement('span', { style: styles.drawPileCount },
                room.deckCount + ' cards left'
              )
            ),
            // Bomb percentage indicator
            React.createElement('div', { style: styles.progressText }, bombPercentage + '%')
          ),

          // Last action / active card display
          room.lastAction && React.createElement('div', { style: styles.activeCard },
            room.lastAction.type === 'trap' && room.lastAction.targetUid && 
              React.createElement('div', { style: styles.activeCardHeader },
                React.createElement('span', { style: styles.activeCardBadge }, 'Trap')
              ),
            React.createElement('svg', {
              style: styles.activeCardIcon,
              viewBox: '0 0 24 24',
              fill: window.DefuseCards.CARD_TYPES[room.lastAction.type]
                ? window.DefuseCards.CARD_TYPES[room.lastAction.type].color
                : '#666'
            },
              React.createElement('path', { 
                d: CARD_ICONS[room.lastAction.type] || CARD_ICONS.bomb 
              })
            ),
            room.lastAction.type === 'trap' && React.createElement('span', { 
              style: styles.activeCardMultiplier 
            }, 'x2')
          )
        ),

        // Turn indicator
        React.createElement('div', {
          style: Object.assign({},
            styles.turnIndicator,
            isMyTurn ? styles.turnIndicatorYou : {}
          )
        }, turnText)
      ),

      // Hand area
      amAlive && React.createElement('div', { style: styles.handContainer },
        React.createElement('div', { style: styles.handLabel },
          'Your Hand (' + myHand.length + ' cards)'
        ),
        React.createElement('div', { style: styles.handCards },
          myHand.map(function(card) {
            return React.createElement(Card, {
              key: card.id,
              card: card,
              selected: selectedCard === card.id,
              onClick: function() { 
                setSelectedCard(selectedCard === card.id ? null : card.id); 
              }
            });
          })
        ),
        
        // Action buttons
        isMyTurn && React.createElement('div', { style: styles.actionButtons },
          React.createElement('button', {
            style: Object.assign({},
              styles.actionBtn,
              styles.drawBtn,
              isProcessing ? styles.disabledBtn : {}
            ),
            onClick: handleDraw,
            disabled: isProcessing
          }, trapMultiplier > 0 ? 'Draw ' + trapMultiplier : 'Draw'),
          
          selectedCard && React.createElement('button', {
            style: Object.assign({},
              styles.actionBtn,
              styles.playBtn,
              isProcessing ? styles.disabledBtn : {}
            ),
            onClick: handlePlayCard,
            disabled: isProcessing
          }, 'Play Card')
        )
      ),

      // Eliminated overlay
      !amAlive && React.createElement('div', {
        style: {
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(0,0,0,0.8)',
          padding: '20px',
          textAlign: 'center'
        }
      },
        React.createElement('p', { style: { color: 'white', fontSize: '18px' } },
          'You have been eliminated! Watching the game...'
        )
      ),

      // Modals
      modal === 'bomb' && React.createElement(BombModal, {
        hasDisable: hasDisable,
        onDisable: handleDisable,
        onEliminate: handleEliminate,
        deckCount: room.deckCount,
        onPlaceBomb: handlePlaceBomb,
        showPlacement: showPlacement
      }),

      modal && modal.type === 'xray' && React.createElement(XRayModal, {
        cards: modal.cards,
        onClose: closeModal
      }),

      modal && modal.type === 'prophecy' && React.createElement(ProphecyModal, {
        bombPosition: modal.position,
        onClose: closeModal
      }),

      modal && modal.type === 'target' && React.createElement(TargetModal, {
        players: room.players,
        currentUid: currentUser.uid,
        title: 'Select target for Trap',
        onSelect: handleTrapTarget,
        onClose: closeModal
      })
    );
  }

  // Expose to window
  window.DefuseGame = DefuseGame;

})();
