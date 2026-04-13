# Data Model: Snake & Ladder Pro Integration

## Entities

### `SnakeLadderRoom`
Represents an active or finished game instance.
- `id`: (string) Unique ID for the room.
- `players`: (array) List of player objects:
    - `uid`: (string) User ID or "bot_1...".
    - `name`: (string) Profile name.
    - `avatar`: (string) Profile photo URL.
    - `type`: (string) "human" | "bot".
- `currentTurnIndex`: (number) Index of the player whose turn it is.
- `status`: (string) "waiting" | "playing" | "finished".
- `positions`: (map) Keyed by user UID, value is the current square (1-100).
- `lastRoll`: (number) The most recent dice roll value.
- `updatedAt`: (timestamp) Last server update time.

### `MatchmakingQueue`
Represents users waiting for a game.
- `uid`: (string) User ID.
- `gameId`: (string) "snake_ladder_pro".
- `joinedAt`: (timestamp) When the user started waiting.

## State Transitions

### Game Start
1. User joins queue → `MatchmakingQueue` entry created.
2. System detects 4 players (or timeout + bots) → Creates `SnakeLadderRoom`.
3. Sets `status` to "playing".

### Dice Roll
1. Active player triggers `rollDice` animation.
2. Position updated with animation latency.
3. If square is a Snake or Ladder → secondary animation to endpoint.
4. `currentTurnIndex` incremented.

### Victory
1. Player reaches square 100.
2. `status` set to "finished".
3. `window.SecurityService` rewards winner.
