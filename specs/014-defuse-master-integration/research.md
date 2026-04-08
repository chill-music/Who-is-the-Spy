# Research: Defuse Master Integration

## Unknowns & Decisions

### 1. Data Schema Extension
- **Question**: How to distinguish between "Spy" rooms and "Defuse Master" rooms in Firestore?
- **Decision**: Add a `gameType` string field to the root of the `room` document.
- **Rationale**: This is a non-destructive change that allows the main `App` component to switch rendering logic before the specific game engine takes control of the room state.
- **Alternatives considered**: Separate collections (Rejected because it complicates the global "Join Room" lookup and active room discovery).

### 2. Component Orchestration
- **Question**: Where should the game switching logic reside?
- **Decision**: In `10-app.js`, within the main `App` component's render switch.
- **Rationale**: `10-app.js` already manages the transition between `LobbyView` and `GameView`. Adding a third state for `DefuseMaster` is the cleanest architectural fit.
- **Implementation**: `if (room?.gameType === 'defuse_master') return <DefuseMaster ... />`.

### 3. Dependency Management
- **Question**: How to ensure Defuse Master scripts are available when needed?
- **Decision**: Register all 6 game scripts as `secondaryComponents` in `16-main.js` and add them to `index.html`.
- **Rationale**: This ensures the platform's loading screen waits for these scripts to be cached and parsed before allowing room creation, preventing "Component not found" errors.

### 4. Hook Standardization
- **Question**: Defuse Master uses standard `React.useState`. Should it be changed?
- **Decision**: Yes, refactor to `const { useState, useEffect } = window.AppHooks`.
- **Rationale**: This follows the project's "Logic Accountability" principle and ensures components are using the specific React version/wrapper provided by the platform.

## Integration Patterns

- **UI Injection**: The game mode selector will be a `segmented-control` or `toggle` component added to `LobbyView.js`.
- **Global Event Bus**: The game will use the existing `roomsCollection` and `usersCollection` from `01-config.js` to stay in sync with the platform's data models.
