# Folder: Interactive Hooks (src/app/hooks)

## Overview
This directory contains complex React hooks that handle user-initiated actions (like joining a game or sending a gift) and real-time listeners for account-specific data like currency and social relationships.

## Files

### [useGameActions.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/app/hooks/useGameActions.js)
- **Purpose**: Interactive Game Actions hub.
- **Logic**: Orchestrates high-level routines for `handleCreateGame`, `handleJoinGame`, `handleVote`, and `triggerVoting`. It also manages the logic for missions, login rewards, and friend management.
- **Dependencies**: Consumed by `App` in `10-app.js`.

### [useUserListeners.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/app/hooks/useUserListeners.js)
- **Purpose**: Account Data Sync.
- **Logic**: Subscribes to changes in the current user's profile, couple data, family status, and BFF relationships. It updates the state whenever a partner proposes or a gift is received.
- **Dependencies**: Performs real-time subscriptions to the `users`, `couples`, and `bff_relationships` collections.
