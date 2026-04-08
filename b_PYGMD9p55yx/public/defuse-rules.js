/**
 * Defuse Master - Game Rules & Gold Calculation
 * IIFE pattern - exposes window.DefuseRules
 */
(function() {
  'use strict';

  /**
   * Gold reward multipliers based on player count and rank
   * Rank 1 = winner (last standing), higher rank = earlier elimination
   * Values are multipliers of stake N
   */
  var GOLD_REWARDS = {
    5: { 1: 1.5, 2: 0.5, 3: 0, 4: -0.5, 5: -1 },
    4: { 1: 1, 2: 0.5, 3: -0.5, 4: -1 },
    3: { 1: 1, 2: 0, 3: -1 },
    2: { 1: 1, 2: -1 }
  };

  /**
   * Game mode configurations
   */
  var GAME_MODES = {
    ffa: {
      name: 'Free For All',
      minPlayers: 2,
      maxPlayers: 5,
      teamCount: 0
    },
    '1v1': {
      name: '1v1 Duel',
      minPlayers: 2,
      maxPlayers: 2,
      teamCount: 0
    },
    team2v2v2: {
      name: 'Team Battle (2v2v2)',
      minPlayers: 6,
      maxPlayers: 6,
      teamCount: 3
    },
    team2v2v2v2: {
      name: 'Team Battle (2v2v2v2)',
      minPlayers: 8,
      maxPlayers: 8,
      teamCount: 4
    }
  };

  /**
   * Default stake amounts
   */
  var STAKE_OPTIONS = [50, 100, 200, 500, 1000];

  /**
   * Calculate gold rewards for all players at end of game
   * @param {Array} players - Array of player objects with uid and rank
   * @param {number} stakeN - The gold stake amount
   * @returns {Object} Map of uid -> gold change (positive or negative)
   */
  function calculateGoldRewards(players, stakeN) {
    var playerCount = players.length;
    var rewards = GOLD_REWARDS[playerCount];
    
    if (!rewards) {
      console.error('[DefuseRules] Invalid player count for rewards:', playerCount);
      return {};
    }

    var results = {};
    
    players.forEach(function(player) {
      var multiplier = rewards[player.rank] || 0;
      results[player.uid] = Math.round(multiplier * stakeN);
    });

    return results;
  }

  /**
   * Check if a player has enough gold to join a game
   * @param {number} userGold - User's current gold
   * @param {number} stakeN - Required stake
   * @returns {boolean}
   */
  function canAffordStake(userGold, stakeN) {
    return userGold >= stakeN;
  }

  /**
   * Check win condition - returns winner if only one player remains
   * @param {Array} players - Array of player objects with status field
   * @returns {{ isGameOver: boolean, winner: Object|null, alivePlayers: Array }}
   */
  function checkWinCondition(players) {
    var alivePlayers = players.filter(function(p) {
      return p.status === 'alive';
    });

    if (alivePlayers.length === 1) {
      return {
        isGameOver: true,
        winner: alivePlayers[0],
        alivePlayers: alivePlayers
      };
    }

    if (alivePlayers.length === 0) {
      // Edge case: everyone eliminated (shouldn't happen normally)
      return {
        isGameOver: true,
        winner: null,
        alivePlayers: []
      };
    }

    return {
      isGameOver: false,
      winner: null,
      alivePlayers: alivePlayers
    };
  }

  /**
   * Get next player in turn order (skipping eliminated players)
   * @param {Array} turnOrder - Array of uids in turn order
   * @param {string} currentUid - Current player's uid
   * @param {Array} players - Array of player objects with status
   * @returns {string|null} Next player's uid or null if game over
   */
  function getNextPlayer(turnOrder, currentUid, players) {
    var alivePlayers = players.filter(function(p) {
      return p.status === 'alive';
    });
    
    if (alivePlayers.length <= 1) {
      return null; // Game over
    }

    var aliveUids = alivePlayers.map(function(p) { return p.uid; });
    var currentIndex = turnOrder.indexOf(currentUid);
    
    // Find next alive player in turn order
    for (var i = 1; i <= turnOrder.length; i++) {
      var nextIndex = (currentIndex + i) % turnOrder.length;
      var nextUid = turnOrder[nextIndex];
      
      if (aliveUids.indexOf(nextUid) !== -1) {
        return nextUid;
      }
    }

    return null;
  }

  /**
   * Assign ranks to players based on elimination order
   * First eliminated = last rank, last standing = rank 1
   * @param {Array} eliminationOrder - Array of uids in order of elimination
   * @param {string} winnerUid - The winner's uid
   * @param {number} playerCount - Total player count
   * @returns {Object} Map of uid -> rank
   */
  function assignRanks(eliminationOrder, winnerUid, playerCount) {
    var ranks = {};
    
    // Winner is rank 1
    ranks[winnerUid] = 1;
    
    // Eliminated players get ranks based on when they were eliminated
    // Last eliminated = rank 2, first eliminated = last rank
    var elimCount = eliminationOrder.length;
    
    for (var i = 0; i < elimCount; i++) {
      var uid = eliminationOrder[i];
      // First eliminated gets highest rank number (playerCount)
      // Last eliminated gets rank 2
      ranks[uid] = playerCount - i;
    }

    return ranks;
  }

  /**
   * Validate if a card can be played in current game state
   * @param {string} cardType - Type of card being played
   * @param {Object} gameState - Current game state
   * @param {string} playerUid - Player attempting to play
   * @returns {{ valid: boolean, reason: string|null }}
   */
  function canPlayCard(cardType, gameState, playerUid) {
    // Check if it's the player's turn (for most cards)
    var isPlayerTurn = gameState.currentTurn === playerUid;
    
    // Some cards can be played out of turn
    var outOfTurnCards = ['disable']; // Disable can be played in response to bomb
    
    if (!isPlayerTurn && outOfTurnCards.indexOf(cardType) === -1) {
      return { valid: false, reason: 'Not your turn' };
    }

    // Card-specific validations
    switch (cardType) {
      case 'bomb':
        return { valid: false, reason: 'Cannot play a bomb' };
      
      case 'disable':
        // Can only play when a bomb is drawn
        if (!gameState.pendingBomb) {
          return { valid: false, reason: 'No bomb to disable' };
        }
        return { valid: true, reason: null };
      
      case 'trap':
        // Need a target player
        if (!gameState.targetUid) {
          return { valid: false, reason: 'Select a target player' };
        }
        // Check if target is protected
        var targetPlayer = gameState.players.find(function(p) { 
          return p.uid === gameState.targetUid; 
        });
        if (targetPlayer && targetPlayer.isProtected) {
          return { valid: false, reason: 'Target is protected' };
        }
        return { valid: true, reason: null };
      
      default:
        return { valid: true, reason: null };
    }
  }

  /**
   * Calculate trap multiplier (stacks: 2, 4, 6)
   * @param {number} currentMultiplier
   * @returns {number}
   */
  function addTrapMultiplier(currentMultiplier) {
    return currentMultiplier + 2;
  }

  /**
   * Get game mode configuration
   * @param {string} mode
   * @returns {Object|null}
   */
  function getGameMode(mode) {
    return GAME_MODES[mode] || null;
  }

  /**
   * Validate player count for a game mode
   * @param {string} mode
   * @param {number} playerCount
   * @returns {boolean}
   */
  function isValidPlayerCount(mode, playerCount) {
    var config = GAME_MODES[mode];
    if (!config) return false;
    return playerCount >= config.minPlayers && playerCount <= config.maxPlayers;
  }

  /**
   * Get initial player state
   * @param {string} uid
   * @param {string} name
   * @param {string} avatar
   * @returns {Object}
   */
  function createPlayerState(uid, name, avatar) {
    return {
      uid: uid,
      name: name,
      avatar: avatar || '',
      teamId: null,
      status: 'alive',
      rank: null,
      handCount: 5,
      isConnected: true,
      trapMultiplier: 0,
      isProtected: false
    };
  }

  // Expose to window
  window.DefuseRules = {
    GOLD_REWARDS: GOLD_REWARDS,
    GAME_MODES: GAME_MODES,
    STAKE_OPTIONS: STAKE_OPTIONS,
    calculateGoldRewards: calculateGoldRewards,
    canAffordStake: canAffordStake,
    checkWinCondition: checkWinCondition,
    getNextPlayer: getNextPlayer,
    assignRanks: assignRanks,
    canPlayCard: canPlayCard,
    addTrapMultiplier: addTrapMultiplier,
    getGameMode: getGameMode,
    isValidPlayerCount: isValidPlayerCount,
    createPlayerState: createPlayerState
  };

})();
