# Folder: Main Source (src)

## Overview
The `src` directory contains the core logic, data services, and global components of the application. The files are numbered to indicate their historical or logical loading sequence.

## Subdirectories

### [app/](./app/FOLDER_MAP.md)
- **Purpose**: Global hooks and technical utilities.

### [components/](./components/FOLDER_MAP.md)
- **Purpose**: Reusable UI components (Modals, Admin sections).

### [features/](./features/FOLDER_MAP.md)
- **Purpose**: Feature-specific logic (BFF, Couples, Family, etc.).

## Files

### [01-config.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/01-config.js)
- **Purpose**: Firebase & Global Configuration.
- **Logic**: Initializes Firebase services, defines collection paths, and sets global constants.
- **Dependencies**: Referenced by almost every file in the project.

### [02-audio.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/02-audio.js)
- **Purpose**: Audio Management.
- **Logic**: Handles sound effects and background music with a global `window.playSound` function.
- **Dependencies**: Consumed by game events and UI interactions.

### [03-data-funpass.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/03-data-funpass.js)
- **Purpose**: FunPass Data.
- **Logic**: Defines the tiers, costs, and rewards for the seasonal pass.
- **Dependencies**: Used by `12-modal-funpass.js`.

### [04-data-game.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/04-data-game.js)
- **Purpose**: Game Logic & Missions.
- **Logic**: Contains the mission system, achievement definitions, and core game rules.
- **Dependencies**: Consumed by `useRoom.js` and `useGameActions.js`.

### [05-translations.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/05-translations.js)
- **Purpose**: Localization.
- **Logic**: Provides AR/EN translation strings via the `TRANSLATIONS` object.
- **Dependencies**: Used across all UI components for multi-language support.

### [06-components-base.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/06-components-base.js)
- **Purpose**: Core UI Components.
- **Logic**: Exports `AvatarWithFrame`, `MiniProfilePopup`, `NotificationToast`, and `ErrorBoundary`.
- **Dependencies**: Foundational components used in every view.

### [07-components-gifts.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/07-components-gifts.js)
- **Purpose**: Gift System.
- **Logic**: Handles the selection, cost calculation, and sending of virtual gifts.
- **Dependencies**: Integrated with the Shop and Profile systems.

### [08-components-shop.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/08-components-shop.js)
- **Purpose**: Shop & Inventory.
- **Logic**: Manages item purchasing, inventory display, and currency verification.
- **Dependencies**: Manages Firestore updates for the `users` collection.

### [09-components-user.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/09-components-user.js)
- **Purpose**: User Data Helpers.
- **Logic**: Light helpers to fetch and format user profile summaries.

### [10-app.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/10-app.js)
- **Purpose**: Main App Controller.
- **Logic**: The root React component. Manages top-level state, navigation, and global listeners.
- **Dependencies**: Orchestrates all features and components.

### [11-modal-selfchat.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/11-modal-selfchat.js)
- **Purpose**: Personal Notebook.
- **Logic**: A private chat features for users to save notes or test messages.

### [12-modal-funpass.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/12-modal-funpass.js)
- **Purpose**: FunPass UI.
- **Logic**: Progress bars, reward claiming animations, and purchase logic.

### [13-modal-chat.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/13-modal-chat.js)
- **Purpose**: Social Hub.
- **Logic**: Manages friends list, incoming requests, and private chat portals.

### [16-main.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/16-main.js)
- **Purpose**: Bootstrapper.
- **Logic**: Uses a polling loop to ensure all global components are ready before mounting the application.

### [17-vip.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/17-vip.js)
- **Purpose**: VIP System Logic.
- **Logic**: Calculates VIP level progression based on cumulative currency spent. Handles V10 verification.

### [18-admin-panel.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/18-admin-panel.js)
- **Purpose**: Moderation Interface.
- **Logic**: Provides tools for staff to manage reports, bans, and system-wide broadcasts.

### [19-family.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/19-family.js)
- **Purpose**: Family System Controller.
- **Logic**: Orchestrates family creation, membership, and activity rewards.
