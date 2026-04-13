# Implementation Plan - Snake & Ladder Pro (Engine & Matchmaking)

This plan covers the transition from the legacy "web-game-snake-ladder" to a professional-grade React + Firestore implementation integrated into the "Who is the Spy" lobby.

## User Review Required

> [!IMPORTANT]
> **Traditional Rules Implementation**: 
> - A roll of **6** grants an extra turn.
> - Landing on an opponent's square **resets their position to 0** (Capture).
> - Matchmaking requires a minimum of 2 players but will auto-fill with **Bots** if the queue takes too long (configured to 15s in this plan).

## Proposed Changes

### [Core Logic] SnakeLadderEngine.js

#### [MODIFY] [SnakeLadderEngine.js](file:///C:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/snake-ladder/SnakeLadderEngine.js)
- Update the `snakesAndLadders` map to match the original `SNAKES_AND_LADDERS_01` (15 items) for a richer game experience.
- Implement the "Double Turn" logic: If roll is 6, `currentTurnIndex` does not increment unless the player won.
- Implement "Capture" logic: Reset any other player on the same square to 0.
- Enhance the `executeTurn` to be fully asynchronous for smoother animation staging.

---

### [Services] Matchmaking & Synchronization

#### [MODIFY] [MatchmakingService.js](file:///C:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/services/MatchmakingService.js)
- Ensure the `discoverAndMatch` logic handles `snake_ladder_pro` specific room naming conventions.
- Implement "Bot Auto-fill": If a player is the host and alone in the queue for > 15s, they can choose to start with bots.

#### [MODIFY] [SnakeLadderService.js](file:///C:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/snake-ladder/SnakeLadderService.js)
- Update `submitMove` to include `event` types (move, snake, ladder, capture) to trigger specific sounds on all clients.

---

### [UI Components] SnakeLadderView.js

#### [MODIFY] [SnakeLadderView.js](file:///C:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/snake-ladder/SnakeLadderView.js)
- **Grid Rendering**: Implement a 10x10 grid using CSS Grid. 
- **Z-Pattern Logic**: Map positions 1-100 to [x, y] coordinates correctly (bottom-left to top-right, alternating row directions).
- **Animations**: Use CSS transitions for "bouncing" piece movement.
- **Game Loop**: Connect the `ExecuteTurn` logic to `handleRoll` and sync with Firestore.
- **Audio Integration**: 
    - `audio/snake-ladder/roll.mp3` on roll.
    - `audio/snake-ladder/move.mp3` for each step.
    - `audio/snake-ladder/rise.mp3` for ladders.
    - `audio/snake-ladder/fall.mp3` for snakes/captures.

---

### [Assets & Configuration]

#### [NEW] `icos/snake-ladder/board_bg.jpg`
- Copy `web-game-snake-ladder-main/web-game-snake-ladder-main/img/bg2.jpg` to the project icons folder.

## Verification Plan

### Automated/Unit Tests
- Testing `SnakeLadderEngine` independently to verify:
    - Position 100 ends the game.
    - Snakes move position DOWN, Ladders move position UP.
    - 6 gives another turn.
    - Landing on same square resets other player.

### Manual Verification
- **Quick Match Test**: Join matchmaking, wait 15s, verify "Add Bots" button or auto-fill works.
- **Private Room Test**: Create a room with a password, join from another tab using the code, verify real-time movement sync.
- **Party Mode Test**: Select "Party Mode", verify 4 players can play on the same device.
- **UI/UX Audit**: Ensure the 10x10 grid aligns with the background image and pieces move smoothly.
