# Folder: App Perspective Components (src/features/app/components)

## Overview
This directory contains the primary top-level views that build the application's user interface. These components are toggled by the `activeView` state in `10-app.js`.

## Files

### [LobbyView.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/app/components/LobbyView.js)
- **Purpose**: Application Homepage.
- **Logic**: Provides the interface for creating or joining a game room. It handles the display of public rooms and the entry of private room codes.
- **Dependencies**: Integrated with `window.GameService`.

### [RoomView.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/app/components/RoomView.js)
- **Purpose**: Active Game Screen.
- **Logic**: The UI for a live game room. It displays the player grid, turn timers, and the shared game board. It updates in real-time as the room state changes in Firestore.
- **Dependencies**: Reacts to state from the `useRoom` hook.

### [RankingView.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/app/components/RankingView.js)
- **Purpose**: Global Leaderboards.
- **Logic**: A multi-tab interface showing the top players and families by currency, charisma, and level.
- **Dependencies**: Fetches data via the `useLeaderboards` hook.

### [GlobalModals.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/app/components/GlobalModals.js)
- **Purpose**: Modal Orchestrator.
- **Logic**: A single component that conditionally renders every system modal based on the state in `useAppUIState`. This prevents z-index issues and centralizes modal management.
- **Dependencies**: Dynamically imports/renders modules from `src/components/modals/`.

### [BannedScreen.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/app/components/BannedScreen.js)
- **Purpose**: Security Guard View.
- **Logic**: A full-screen overlay for users with an active `ban` flag. It provides contact information for appeals.
- **Dependencies**: Triggered by the `useBanningLogic` hook.
