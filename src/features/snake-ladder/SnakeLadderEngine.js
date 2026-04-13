/**
 * SnakeLadderEngine.js
 * CORE LOGIC ONLY — NO DOM MANIPULATION
 * This class handles the math and rules of the game.
 * Multi-player and Bot-ready.
 */

class SnakeLadderEngine {
    constructor(config = {}) {
        this.boardSize = config.boardSize || 100;
        this.snakesAndLadders = config.snakesAndLadders || {
            // SNAKES_AND_LADDERS_02 from original constant.js (Garden 2 theme)
            5: 58, 14: 49, 53: 72, 64: 83,      // Ladders
            38: 20, 51: 10, 76: 54, 91: 73, 97: 61 // Snakes
        };

        this.players = []; // { uid, name, type: 'human'|'bot', position: 0 }
        this.currentTurnIndex = 0;
        this.status = 'waiting'; // waiting, playing, finished
        this.winners = [];
        this.lastAction = null; // { type, playerUid, roll, oldPos, newPos, isSpecial }

        this.onStateChange = config.onStateChange || (() => {});
        this.onEvent = config.onEvent || (() => {}); // For sounds/animations
    }

    /**
     * Initializes a new game state
     */
    init(players) {
        this.players = players.map(p => ({
            ...p,
            position: 0,
            isFinished: false
        }));
        this.currentTurnIndex = 0;
        this.status = 'playing';
        this.winners = [];
        this.notify();
    }

    /**
     * Executes a turn for the current player
     * @returns {Object} Action results for animation
     */
    async executeTurn() {
        if (this.status !== 'playing') return null;

        const player = this.players[this.currentTurnIndex];
        if (player.isFinished) return this.nextTurn();

        const rollResult = Math.floor(Math.random() * 6) + 1;
        const oldPos = player.position;
        let newPos = oldPos + rollResult;
        let bonusTurn = false;

        const result = {
            playerUid: player.uid,
            roll: rollResult,
            sequence: [] // Array of steps for animation
        };

        // 1. ORIGINAL RULE: Must roll 6 to start (from 0 to 1)
        if (oldPos === 0) {
            if (rollResult === 6) {
                player.position = 1;
                result.sequence.push({ pos: 1, type: 'move' });
                bonusTurn = true; // Bonus for rolling 6
            } else {
                result.sequence.push({ pos: 0, type: 'stay' });
            }
        } 
        // 2. Normal Movement
        else if (newPos <= this.boardSize) {
            // Generate square-by-square movement sequence for parity animation
            for (let i = oldPos + 1; i <= newPos; i++) {
                result.sequence.push({ pos: i, type: 'move' });
            }
            player.position = newPos;

            // Check for snake/ladder
            if (this.snakesAndLadders[newPos]) {
                const boostPos = this.snakesAndLadders[newPos];
                const type = boostPos > newPos ? 'ladder' : 'snake';
                player.position = boostPos;
                result.sequence.push({ pos: boostPos, type });
            }

            // Check for Capture (traditional rule from source)
            this.players.forEach(other => {
                if (other.uid !== player.uid && !other.isFinished && other.position === player.position && player.position !== 0) {
                    const captureOldPos = other.position;
                    other.position = 0;
                    result.sequence.push({ 
                        targetUid: other.uid, 
                        oldPos: captureOldPos, 
                        newPos: 0, 
                        type: 'captured' 
                    });
                    bonusTurn = true; // Bonus for capturing
                }
            });

            if (rollResult === 6) bonusTurn = true;
        } else {
            // Overjump stays at old pos
            result.sequence.push({ pos: oldPos, type: 'stay' });
        }

        // Check if finished
        if (player.position === this.boardSize) {
            player.isFinished = true;
            this.winners.push(player.uid);
            result.isWinner = true;
            bonusTurn = false; // No bonus for finishing
        }

        this.lastAction = { ...result, timestamp: Date.now() };

        if (!bonusTurn) {
            this.nextTurn();
            result.isDoubleTurn = true;
        }

        return result;
    }

    nextTurn() {
        let attempts = 0;
        do {
            this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
            attempts++;
        } while (this.players[this.currentTurnIndex].isFinished && attempts < this.players.length);

        if (this.winners.length >= this.players.length - 1 || (this.players.length === 1 && this.players[0].isFinished)) {
            this.status = 'finished';
        }

        this.notify();
    }

    notify() {
        this.onStateChange(this.getState());
    }

    getState() {
        return {
            players: JSON.parse(JSON.stringify(this.players)),
            currentTurnIndex: this.currentTurnIndex,
            status: this.status,
            winners: [...this.winners],
            lastAction: this.lastAction
        };
    }

    // Set state from external source (Firestore sync)
    setState(state) {
        this.players = state.players;
        this.currentTurnIndex = state.currentTurnIndex;
        this.status = state.status;
        this.winners = state.winners;
        this.lastAction = state.lastAction;
        this.notify();
    }
}

// Global export for script-based loading
window.SnakeLadderEngine = SnakeLadderEngine;
