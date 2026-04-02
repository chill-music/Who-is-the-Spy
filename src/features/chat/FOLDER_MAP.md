# Folder: Real-time Communication (src/features/chat)

## Overview
This directory contains the core logic for the application's real-time messaging system, handling private chats, friend requests, and social connectivity.

## Files

### [ChatManager.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/chat/ChatManager.js)
- **Purpose**: Unified Messaging Controller.
- **Logic**: A massive central service that handles:
    1.  **Private Messaging**: Syncing the `private_chats` collection.
    2.  **Unread Counters**: Real-time aggregation of message status.
    3.  **Media Assets**: Image and emoji transmission.
    4.  **Security**: Permission checks for cross-user messaging.
- **Dependencies**: Deeply integrated with `useSocial.js` and `01-config.js`.
