# Folder: Lobby Components (src/components/lobby)

## Overview
This directory contains UI components specific to the main Lobby view of the application.

## Files

### [LobbyPublicChatBox.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/lobby/LobbyPublicChatBox.js)
- **Purpose**: Inline Lobby Chat.
- **Logic**: A lightweight, real-time feed of the latest messages from the `public_chat` collection. It supports quick emojis and basic text interaction without opening the full-screen modal.
- **Dependencies**: Subscribes to the same Firestore collection as `PublicChatModal.js`.
