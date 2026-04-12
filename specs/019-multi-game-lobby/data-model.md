# Data Model: Multi-Game Lobby (`Game Namespace`)

**Feature**: Multi-Game Lobby Redesign
**Date**: 2026-04-12

## Entities

### 1. GameConfig (Object)
The core configuration for a game entry.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier (e.g., 'spy'). |
| `name` | `object` | `{ en: string, ar: string }` translated names. |
| `icon` | `string` | Emoji or FontAwesome class. |
| `status` | `string` | 'active' \| 'coming_soon'. |
| `theme` | `object` | `{ color: hex, bgGradient: string, glow: string }`. |
| `collection` | `string` | Firestore collection path. |

### 2. Room (Document)
Historically `spy_rooms`. Now dynamic.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | 5-char code (e.g., "ABCDE"). |
| `mode` | `string` | Game-specific setup (e.g., 'offline', 'online'). |
| `gameType` | `string` | [NEW] ID of the game from config. |
| `...` | `any` | Existing room fields (players, status, etc.). |

## State Transitions (Lobby)

1. **Initial State**: `selectedGameId = 'spy'` (retrieved from config).
2. **Transition**: User clicks `game.id` in `GameSelector`.
   - Update `selectedGameId`.
   - Re-render `LobbyHero` with `GAMES_CONFIG.find(g => g.id === selectedGameId)`.
3. **Action (Create)**:
   - Call `handleCreateGame(mode, { gameId: selectedGameId })`.
   - `RoomService` uses `db.collection(gameConfig.collection)`.

## Integration Flow

```mermaid
graph TD
    A[LobbyView] -->|Select Game| B(selectedGameId State)
    B -->|Update UI| C[Hero Card]
    B -->|Pass to Actions| D[useGameActions]
    D -->|Param: gameId| E[RoomService]
    E -->|Resolve Collection| F[(Firestore: {game}_rooms)]
```
