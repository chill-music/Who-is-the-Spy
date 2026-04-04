# src/features/app Directory Map

Contains the main structural views and global components that form the application's shell.

## Components

| File | Purpose |
| :--- | :--- |
| **`LobbyView.js`** | The main dashboard seen after login. Displays active rooms, public chat, and feature entry points (VIP, Tribe, etc.). |
| **`RoomView.js`** | The interface for an active game session. Displays players, audio controls, and the game board. |
| **`RankingView.js`** | A dedicated view for global and regional leaderboards. |
| **`BannedScreen.js`** | A forced overlay shown to users who are currently restricted from access. |
| **`GlobalModals.js`** | A container component that manages the rendering and state of all system-wide modals (Settings, Shop, Profile, etc.). |

## Subdirectories

### `components/`
Additional UI building blocks used within these primary views.
