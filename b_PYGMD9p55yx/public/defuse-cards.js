/**
 * Defuse Master - Card System
 * IIFE pattern - exposes window.DefuseCards
 */
(function() {
  'use strict';

  /**
   * Card type definitions with metadata
   */
  var CARD_TYPES = {
    bomb: {
      name: 'BOMB',
      type: 'hazard',
      color: '#E74C3C',
      bgColor: '#FFEBEE',
      icon: 'bomb',
      description: 'Eliminates player unless Disable is used'
    },
    disable: {
      name: 'Disable',
      type: 'reaction',
      color: '#27AE60',
      bgColor: '#E8F5E9',
      icon: 'shield',
      description: 'Defuses a bomb - place it back secretly'
    },
    xray: {
      name: 'X-Ray',
      type: 'action',
      color: '#8E44AD',
      bgColor: '#F3E5F5',
      icon: 'eye',
      description: 'View the top 3 cards privately'
    },
    prophecy: {
      name: 'Prophecy',
      type: 'action',
      color: '#F1C40F',
      bgColor: '#FFFDE7',
      icon: 'lightbulb',
      description: 'Shows the nearest bomb position'
    },
    shuffle: {
      name: 'Shuffle',
      type: 'action',
      color: '#2ECC71',
      bgColor: '#E8F5E9',
      icon: 'shuffle',
      description: 'Reshuffles the entire draw pile'
    },
    bottom: {
      name: 'Bottom',
      type: 'action',
      color: '#F1C40F',
      bgColor: '#FFFDE7',
      icon: 'download',
      description: 'Draw from the bottom of the deck'
    },
    trap: {
      name: 'Trap',
      type: 'attack',
      color: '#E67E22',
      bgColor: '#FFF3E0',
      icon: 'target',
      description: 'Target must draw 2x cards (stacks)'
    },
    re: {
      name: 'Re',
      type: 'action',
      color: '#3498DB',
      bgColor: '#E3F2FD',
      icon: 'skip',
      description: 'Skip your turn'
    },
    pro: {
      name: 'Pro',
      type: 'defense',
      color: '#9B59B6',
      bgColor: '#F3E5F5',
      icon: 'shield-check',
      description: 'Immunity from Trap for 1 round'
    },
    bo: {
      name: 'Bo',
      type: 'action',
      color: '#E91E63',
      bgColor: '#FCE4EC',
      icon: 'double',
      description: 'Draw 2 cards immediately'
    }
  };

  /**
   * Deck composition based on player count
   */
  var DECK_CONFIG = {
    bomb: function(playerCount) { return playerCount - 1; },
    disable: function() { return 6; },
    xray: function() { return 4; },
    prophecy: function() { return 4; },
    shuffle: function() { return 4; },
    bottom: function() { return 4; },
    trap: function() { return 6; },
    re: function() { return 6; },
    pro: function() { return 4; },
    bo: function() { return 4; }
  };

  /**
   * Generate a UUID v4
   */
  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  function shuffle(array) {
    var result = array.slice();
    for (var i = result.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }
    return result;
  }

  /**
   * Build a new deck based on player count
   * @param {number} playerCount - Number of players (2-5 for FFA)
   * @returns {Array} Shuffled deck of cards
   */
  function buildDeck(playerCount) {
    var deck = [];
    
    Object.keys(DECK_CONFIG).forEach(function(cardType) {
      var count = DECK_CONFIG[cardType](playerCount);
      for (var i = 0; i < count; i++) {
        deck.push({
          id: uuid(),
          type: cardType
        });
      }
    });

    return shuffle(deck);
  }

  /**
   * Build deck without bombs (for initial dealing)
   * @param {number} playerCount
   * @returns {{ dealDeck: Array, bombs: Array }}
   */
  function buildDeckForDealing(playerCount) {
    var fullDeck = buildDeck(playerCount);
    var bombs = fullDeck.filter(function(card) { return card.type === 'bomb'; });
    var dealDeck = fullDeck.filter(function(card) { return card.type !== 'bomb'; });
    
    return {
      dealDeck: dealDeck,
      bombs: bombs
    };
  }

  /**
   * Deal initial hands to players
   * Each player gets 1 Disable card + 4 random cards = 5 cards total
   * @param {Array} dealDeck - Deck without bombs
   * @param {number} playerCount
   * @returns {{ hands: Object, remainingDeck: Array }}
   */
  function dealHands(dealDeck, playerCount) {
    var deck = dealDeck.slice();
    var hands = {};
    
    // We need to deal 4 cards per player (they each get 1 Disable separately)
    // But first, remove Disable cards that will be given to each player
    var disableCards = deck.filter(function(c) { return c.type === 'disable'; });
    var otherCards = deck.filter(function(c) { return c.type !== 'disable'; });
    
    // Shuffle other cards
    otherCards = shuffle(otherCards);
    
    for (var i = 0; i < playerCount; i++) {
      var hand = [];
      
      // Give 1 Disable card
      if (disableCards.length > 0) {
        hand.push(disableCards.pop());
      }
      
      // Deal 4 more cards
      for (var j = 0; j < 4; j++) {
        if (otherCards.length > 0) {
          hand.push(otherCards.pop());
        }
      }
      
      hands['player_' + i] = hand;
    }
    
    // Remaining deck = unused disable cards + unused other cards
    var remainingDeck = disableCards.concat(otherCards);
    
    return {
      hands: hands,
      remainingDeck: remainingDeck
    };
  }

  /**
   * Insert bombs back into deck at random positions
   * @param {Array} deck - Current deck
   * @param {Array} bombs - Bomb cards to insert
   * @returns {Array} Deck with bombs inserted
   */
  function insertBombs(deck, bombs) {
    var result = deck.slice();
    
    bombs.forEach(function(bomb) {
      var position = Math.floor(Math.random() * (result.length + 1));
      result.splice(position, 0, bomb);
    });
    
    return result;
  }

  /**
   * Insert a single bomb at a specific position
   * @param {Array} deck - Current deck
   * @param {Object} bomb - Bomb card
   * @param {number} position - Position to insert (0 = top, deck.length = bottom)
   * @returns {Array} New deck with bomb inserted
   */
  function insertBombAtPosition(deck, bomb, position) {
    var result = deck.slice();
    var safePosition = Math.max(0, Math.min(position, result.length));
    result.splice(safePosition, 0, bomb);
    return result;
  }

  /**
   * Find the position of the nearest bomb in the deck
   * @param {Array} deck - Current deck
   * @returns {number|null} Position of nearest bomb (0 = top) or null if no bombs
   */
  function findNearestBomb(deck) {
    for (var i = 0; i < deck.length; i++) {
      if (deck[i].type === 'bomb') {
        return i;
      }
    }
    return null;
  }

  /**
   * Get top N cards from deck (for X-Ray)
   * @param {Array} deck
   * @param {number} count
   * @returns {Array}
   */
  function peekTopCards(deck, count) {
    return deck.slice(0, Math.min(count, deck.length));
  }

  /**
   * Draw card from top of deck
   * @param {Array} deck
   * @returns {{ card: Object|null, remainingDeck: Array }}
   */
  function drawFromTop(deck) {
    if (deck.length === 0) {
      return { card: null, remainingDeck: [] };
    }
    return {
      card: deck[0],
      remainingDeck: deck.slice(1)
    };
  }

  /**
   * Draw card from bottom of deck
   * @param {Array} deck
   * @returns {{ card: Object|null, remainingDeck: Array }}
   */
  function drawFromBottom(deck) {
    if (deck.length === 0) {
      return { card: null, remainingDeck: [] };
    }
    return {
      card: deck[deck.length - 1],
      remainingDeck: deck.slice(0, -1)
    };
  }

  /**
   * Get card metadata by type
   * @param {string} cardType
   * @returns {Object}
   */
  function getCardInfo(cardType) {
    return CARD_TYPES[cardType] || null;
  }

  /**
   * Remove a card from hand by ID
   * @param {Array} hand
   * @param {string} cardId
   * @returns {Array} New hand without the card
   */
  function removeCardFromHand(hand, cardId) {
    return hand.filter(function(card) {
      return card.id !== cardId;
    });
  }

  /**
   * Add a card to hand
   * @param {Array} hand
   * @param {Object} card
   * @returns {Array} New hand with the card
   */
  function addCardToHand(hand, card) {
    return hand.concat([card]);
  }

  // Expose to window
  window.DefuseCards = {
    CARD_TYPES: CARD_TYPES,
    uuid: uuid,
    shuffle: shuffle,
    buildDeck: buildDeck,
    buildDeckForDealing: buildDeckForDealing,
    dealHands: dealHands,
    insertBombs: insertBombs,
    insertBombAtPosition: insertBombAtPosition,
    findNearestBomb: findNearestBomb,
    peekTopCards: peekTopCards,
    drawFromTop: drawFromTop,
    drawFromBottom: drawFromBottom,
    getCardInfo: getCardInfo,
    removeCardFromHand: removeCardFromHand,
    addCardToHand: addCardToHand
  };

})();
