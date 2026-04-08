# Data Model: Defuse Master Integration

## Firestore Collections

### `rooms` Collection
Existing collection used for "Spy" games, extended for "Defuse Master".

| Field | Type | Description |
|-------|------|-------------|
| `gameType` | string | Identifier: `"spy"` or `"defuse_master"`. |
| `status` | string | Room lifecycle: `"lobby"`, `"playing"`, `"results"`. |
| `players` | map | Keyed by `userId`. Values contain `name`, `active`, `ready`. |
| `gameState` | map | **Game-specific state**. |
| `gameState.turn` | string | Current player ID whose turn it is. |
| `gameState.deck` | array | IDs/Indices of remaining cards. |
| `gameState.discardPile` | array | IDs of discarded cards. |
| `gameState.playerHands` | map | Map of `userId` to array of card IDs. |

## State Transitions

### 1. Creation
- **Trigger**: Host clicks "+ CREATE GAME" with "Defuse Master" selected.
- **Action**: Create document with `gameType: "defuse_master"`, `status: "lobby"`.

### 2. Game Start
- **Trigger**: Host clicks "START GAME" in `DefuseLobby`.
- **Action**: Update `status: "playing"`, initialize `gameState.deck` and deal `playerHands`.

### 3. Conclusion
- **Trigger**: Final explosion or last player survives.
- **Action**: Update `status: "results"`, trigger reward processing for winner.

## Validation rules
- `gameType` must be one of `["spy", "defuse_master"]`.
- `gameState` must be initialized only when transition to `playing` happens.
