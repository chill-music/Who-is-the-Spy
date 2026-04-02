# Folder: BFF System (src/features/bff)

## Overview
This directory contains the logic and UI for the "Best Friends Forever" (BFF) social system. It allows users to form exclusive, high-status pairs with shared profile cards and unique interactions.

## Logic & Services

### [BFFService.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/bff/BFFService.js)
- **Purpose**: Relationship Logic engine.
- **Logic**: Handles the state transitions for BFF requests (Propose, Accept, Reject, End). It manages the Firestore subscriptions for the `bff_relationships` collection.
- **Dependencies**: Interacts with the `users` and `bff_relationships` collections.

### UI Components
- **[BFFModal.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/bff/BFFModal.js)**: The primary dashboard for checking BFF status and sending new requests.
- **[BFFCardModal.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/bff/BFFCardModal.js)**: A premium, shared visual card displayed on both partners' profiles.
- **[BFFRequestItem.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/bff/BFFRequestItem.js)**: A specialized list item for pending relationship requests.
- **[BFFProfileListModal.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/bff/BFFProfileListModal.js)**: A search results view for finding potential BFFs.
- **[BFFStripProfile.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/bff/BFFStripProfile.js)**: A condensed profile component used within BFF lists.

### Special Channels
- **[BotChatModal.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/bff/BotChatModal.js)**: The UI for the "Official Bot" channels (Detective / Love Bot). These bots send system-level notifications about social events.
- **Dependencies**: Listens to the `bot_chats` collection.
