/**
 * SnakeLadderEngine.js
 * CORE LOGIC ONLY — NO DOM MANIPULATION
 * This class handles the math and rules of the game.
 * Multi-player and Bot-ready.
 */

class SnakeLadderEngine {
    constructor(config = {}) {
        this.config = config; // store for randomizeSnakesAndLadders seed
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

    /* T-SP6: generate a random valid snakes-and-ladders config for this game.
       - Creates exactly `numLadders` ladders (start < dest) and `numSnakes` snakes (start > dest).
       - All start squares are unique; all destination squares are unique.
       - No square appears both as a start and as a destination.
       - Falls back to the classic hardcoded config if randomization fails after attempts.
       - Use before starting a new game: engine.randomizeSnakesAndLadders();
       - Optional seed for reproducible random boards (passed as config.seed). */
    randomizeSnakesAndLadders() {
        const boardSize = this.boardSize;
        const numLadders = 5;
        const numSnakes = 5;
        const total = numLadders + numSnakes;

        // Use seeded PRNG for reproducibility across rooms
        const seed = this.config?.seed || Date.now();
        let rng = (s) => { let x = Math.sin(s) * 10000; return x - Math.floor(x); };
        let random = (lo, hi) => {
            const seedVal = ((seed | 0) * 9301 + 49297) | 0;
            seed = seedVal;
            return Math.floor(lo + (seed % (hi - lo + 1)));
        };

        // Collect all used squares (starts + dests) to avoid collisions
        const used = new Set();
        const config = {};

        // Generate ladders (start < dest)
        for (let i = 0; i < numLadders; i++) {
            let start, dest;
            let attempts = 0;
            do {
                // Start: any square from 1 to boardSize-1 that's not used
                start = random(1, boardSize - 1);
                attempts++;
                if (attempts > 200) { /* fallback */ break; }
            } while (used.has(start));
            used.add(start);

            // Dest: any square from start+1 to boardSize that's not used
            dest = random(start + 1, boardSize);
            attempts = 0;
            while (used.has(dest) && attempts < 200) {
                dest = random(start + 1, boardSize);
                attempts++;
            }
            if (used.has(dest)) { /* fallback */ break; }
            used.add(dest);

            config[start] = dest;
        }

        // Generate snakes (start > dest)
        for (let i = 0; i < numSnakes; i++) {
            let start, dest;
            let attempts = 0;
            do {
                // Start: any square from 2 to boardSize that's not used
                start = random(2, boardSize);
                attempts++;
                if (attempts > 200) { /* fallback */ break; }
            } while (used.has(start));
            used.add(start);

            // Dest: any square from 1 to start-1 that's not used
            dest = random(1, start - 1);
            attempts = 0;
            while (used.has(dest) && attempts < 200) {
                dest = random(1, start - 1);
                attempts++;
            }
            if (used.has(dest)) { /* fallback */ break; }
            used.add(dest);

            config[start] = dest;
        }

        // If we didn't get all ladders+snakes, fallback to classic config
        if (Object.keys(config).length < total) {
            this.snakesAndLadders = {
                5: 58, 14: 49, 53: 72, 64: 83,
                38: 20, 51: 10, 76: 54, 91: 73, 97: 61
            };
            return;
        }

        this.snakesAndLadders = config;
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
     * @param {number} [explicitRoll] - T-S1: verified dice value (1-6) derived
     *        from the commit-reveal server timestamp (online mode). When omitted
     *        (offline/local rooms only), falls back to local randomness.
     * @returns {Object} Action results for animation
     */
    async executeTurn(explicitRoll) {
        if (this.status !== 'playing') return null;

        const player = this.players[this.currentTurnIndex];
        if (player.isFinished) return this.nextTurn();

        // T-S1 (S-BUG-2): online rolls MUST be passed in by the caller, derived
        // from a Firestore server timestamp via SnakeLadderFair.deriveRoll().
        // Local Math.random remains ONLY for offline/pass-and-play rooms.
        const rollResult = (explicitRoll >= 1 && explicitRoll <= 6)
            ? Math.floor(explicitRoll)
            : Math.floor(Math.random() * 6) + 1;
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
                    other.position = Math.max(1, other.position - 10);
                    result.sequence.push({ 
                        targetUid: other.uid, 
                        oldPos: captureOldPos, 
                        newPos: other.position, 
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

        /* T-S1 FIX (S-BUG-1): the old code set result.isDoubleTurn = true when
           the turn PASSED to the next player — inverted semantics that broke
           any consumer keying off it. Corrected: isDoubleTurn/isBonusTurn are
           true ONLY when the current player earned an extra roll (6, capture,
           or starting). */
        if (!bonusTurn) {
            this.nextTurn();
        }
        result.isBonusTurn = bonusTurn;
        result.isDoubleTurn = bonusTurn;

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
