# src Directory Map

This directory contains the primary JavaScript source code for the Who-is-the-Spy application. 

## Files

| File | Purpose | Key Exports (Global) |
| :--- | :--- | :--- |
| `01-config.js` | Core configuration, constants, and Firebase initialization. | `Z`, `GR`, `auth`, `db`, `usersCollection`, etc. |
| `02-audio.js` | Audio system management for sounds and music. | `AudioService` |
| `03-data-funpass.js` | Data structures for the FunPass/Season pass system. | `FUNPASS_LEVELS` |
| `04-data-game.js` | Main game data including shop items, achievements, and scenarios. | `SHOP_ITEMS`, `ACHIEVEMENTS`, `SCENARIOS` |
| `05-translations.js` | Multi-language support (Arabic & English). | `T`, `useTranslation` |
| `06-components-base.js` | Fundamental UI components (Buttons, Inputs, Cards). | `RetroButton`, `NeonCard`, `AvatarComponent` |
| `07-components-gifts.js` | UI components for the gift-giving system. | `GiftsPanel`, `GiftItem` |
| `08-components-shop.js` | Shop and inventory UI components. | `ShopModal`, `InventoryModal` |
| `09-components-user.js` | Components related to user interactions (Mini-profile triggers). | `UserClickHandler` |
| `10-app.js` | Main application shell and layout orchestration. | `App` |
| `11-modal-selfchat.js` | Personal notepad/Self-chat modal. | `SelfChatModal` |
| `12-modal-funpass.js` | UI for the FunPass system. | `FunPassModal` |
| `13-modal-chat.js` | Private messaging (1-on-1) UI modal. | `PrivateChatModal` |
| `16-main.js` | Application entry point and component loader. | (Mounts React) |
| `17-vip.js` | VIP status system and configurations. | `VIP_CONFIG`, `getVIPLevel` |
| `18-admin-panel.js` | Staff management and statistics dashboard. | `AdminPanel` |
| `19-family.js` | Tribe/Family system UI and management. | `FamilyModal` |

## Subdirectories

- **`app/`**: Core logic hooks, state management, and utility functions that power the application shell.
- **`components/`**: Houses specialized UI components such as the Admin dashboard, Lobby elements, and various generic modals.
- **`features/`**: Contains modular business logic and views for specific application features like Games, Profile, and Social systems.
