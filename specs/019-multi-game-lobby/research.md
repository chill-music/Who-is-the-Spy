# Research Report: Multi-Game Lobby Architecture

**Feature**: Multi-Game Lobby Redesign
**Date**: 2026-04-12

## Current State Analysis

### 1. Room Management (`RoomState.js`)
- **Status**: Hardcoded to `roomsCollection`.
- **Finding**: The `roomsCollection` is defined globally in `01-config.js`. For multi-game support, the `RoomService` handlers (`handleCreateGame`, `handleJoinGame`) must be updated to resolve the collection dynamically based on the `selectedGameId`.
- **Decision**: Update `useGameActions` to pass the `gameId` or the resolved `collectionRef` to `RoomService`.

### 2. Global Configuration (`01-config.js`)
- **Status**: Lacks game metadata.
- **Finding**: The project uses a flat global configuration pattern.
- **Decision**: Introduce `window.GAMES_CONFIG` in `01-config.js`. This will serve as the single source of truth for game availability, icons, colors, and Firestore collections.

### 3. UI Styling (`style.css` & Inline)
- **Status**: Hardcoded gradients and shadows.
- **Finding**: The current "Spy" card uses CSS classes like `.lobby-hero-new`.
- **Decision**: Use CSS variables or dynamic inline styles for the hero card theme. For the "Coming Soon" state, applying `filter: grayscale(1); opacity: 0.7;` to the game item is a standard "premium" treatment.

## Decision Log

| Decision | Rationale | Alternatives Considered |
| :--- | :--- | :--- |
| **Game Namespace via Collections** | Isolated data per game; avoids code collisions and simplifies rule management. | Field-based filtering in a single collection (would require complex indexing and shared schemas). |
| **Config in `01-config.js`** | Consistent with existing project architecture. | Separate `GameRegistry.js` (rejected to maintain low script count). |
| **P1 Multi-Game State** | Lifting state to `LobbyView` is sufficient for UI, but `10-app.js` is needed for join-handler context. | Redux/Context (rejected; project uses flat state/props). |

## Dependencies & Risks
- **Risk**: Room codes might be generated identically for different games (low probability).
- **Risk**: Adding many games might bloat the `index.html` script list.
- **Dependency**: FontAwesome or similar for the "Lock" icon. (Already present in project).
