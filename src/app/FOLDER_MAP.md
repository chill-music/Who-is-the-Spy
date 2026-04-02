# Folder: Application Logic & Hooks (src/app)

## Overview
This directory contains the custom React hooks that manage the application's global and feature-specific states. It also includes the `AppHooks.js` registry, which is critical for making these hooks available to the CDN-based components.

## Subdirectories

### [hooks/](./hooks/FOLDER_MAP.md)
- **Purpose**: Action-oriented and listener-based hooks.

### [utils/](./utils/FOLDER_MAP.md)
- **Purpose**: Low-level technical utility functions.

## Files

### [AppHooks.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/app/AppHooks.js)
- **Purpose**: Global Hook Registry.
- **Logic**: Consolidates all hooks (useAuthState, useRoom, etc.) into the `window.AppHooks` object. This ensures that even if individual hook scripts fail to load, the main application has a fallback.
- **Dependencies**: Imports and re-exports all secondary hooks in this directory.

### [useAppUIState.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/app/useAppUIState.js)
- **Purpose**: UI Manifest State.
- **Logic**: Manages the open/closed states of dozens of modals and views (Lobby, Profile, Shop, etc.).
- **Dependencies**: Used by `10-app.js` to coordinate the entire application shell.

### [useAuthState.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/app/useAuthState.js)
- **Purpose**: Authentication Manager.
- **Logic**: Handles Google OAuth and Guest user sessions. Syncs the current user's profile from the `users` or `guests` collection.
- **Dependencies**: Interacts with `window.auth` and `window.db`.

### [useRoom.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/app/useRoom.js)
- **Purpose**: Real-time Room Sync.
- **Logic**: Subscribes to the specific `rooms/{roomId}` document. Handles player joining, leaving, and mission progress updates.
- **Dependencies**: Reacts to changes in the Firestore room document.

### [useGameAutomation.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/app/useGameAutomation.js)
- **Purpose**: Automated Game Timers.
- **Logic**: Syncs local countdowns with server-side timestamps for turns, voting, and word selection.
- **Dependencies**: Triggers actions in `useGameActions.js`.

### [useSocial.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/app/useSocial.js)
- **Purpose**: Social Relationship Sync.
- **Logic**: Manages real-time listeners for friends, chat metadata, and unread message counts across private and group chats.
- **Dependencies**: Subscribes to `friends`, `chats_meta`, and `friend_requests`.

### [useNotifications.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/app/useNotifications.js)
- **Purpose**: System Notifications.
- **Logic**: Listens for new documents in the `notifications` collection and updates the global bell counter and toast system.

### [usePresence.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/app/usePresence.js)
- **Purpose**: User Online Status.
- **Logic**: Updates the user's `lastActive` timestamp and `onlineStatus` in Firestore.
- **Dependencies**: Interacts with the `users` collection.

### [useLeaderboards.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/app/useLeaderboards.js)
- **Purpose**: Global Rankings.
- **Logic**: Fetches top performers by currency, charisma, or family level.
- **Dependencies**: Performs queries on the `users` and `families` collections.

### [useBanningLogic.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/app/useBanningLogic.js)
- **Purpose**: Moderation Security.
- **Logic**: Checks the current user's `ban` status. If a ban is active, it forces the UI to the `BannedScreen`.
- **Dependencies**: Part of the application's root security guard.

### [useOnboarding.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/app/useOnboarding.js)
- **Purpose**: New User Welcome.
- **Logic**: Manages the first-time tutorial flow and PWA installation prompt logic.

### [useBots.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/app/useBots.js)
- **Purpose**: NPC Integration.
- **Logic**: Handles the automated behaviors of bots within a game room (simulated delays, random choices).
