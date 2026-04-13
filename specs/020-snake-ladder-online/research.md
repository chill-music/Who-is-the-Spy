# Research: Snake & Ladder Pro Integration

## Decision Log

### Decision: Authoritative Client-Side Movement
- **Decision**: The "Current Player" (or Host for bots) will calculate the movement and broadcast the event to Firestore.
- **Rationale**: Minimal latency for the active player. Other clients will see the animation play out based on the broadcasted state.
- **Alternatives considered**: 
    - Server-side calculation (requires Cloud Functions, too much overhead for this project).
    - Collaborative state (prone to race conditions).

### Decision: State-Based Bot Simulation
- **Decision**: Bots will run as simple timer-based state updates.
- **Rationale**: The game doesn't require "smart" AI (dice is random). This keeps the code lightweight and modular.

### Decision: Generic Matchmaking Service
- **Decision**: Create a `MatchmakingService` that uses a `global_queues` collection.
- **Rationale**: This can be reused for other games in the Lucky Games Hub.

## Technical Patterns

### Firestore Schema
```text
snl_rooms/ (collection)
  {room_id}/ (document)
    players: [{uid, name, avatar, type: "human|bot"}]
    state: "waiting|playing|finished"
    currentTurn: {uid}
    lastAction: {type: "roll", value: 4, timestamp}
    positions: {uid1: 15, uid2: 32...}
```

### Audio Integration
Use the project's `window.playSound` utility from [02-audio.js](file:///C:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/02-audio.js) to ensure consistent volume and initialization handling.
