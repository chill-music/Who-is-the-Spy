# Folder: Room Session Logic (src/features/room)

## Overview
This directory contains the technical logic for synchronizing the state of an active game room between all connected players and the Firestore database.

## Files

### [RoomState.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/room/RoomState.js)
- **Purpose**: Real-time State Synchronization.
- **Logic**: Orchestrates the membership of the room. It handles "Joining," "Leaving," and "AFK" detection. It ensures that the player grid is always updated when a player connects or disconnects.
- **Dependencies**: Integrated with the `useRoom.js` hook.
