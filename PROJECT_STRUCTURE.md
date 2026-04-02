# PROJECT_STRUCTURE.md: Who is the Spy?

Welcome to the internal documentation for **Who is the Spy?**, a premium PWA social game. This document serves as the master entry point for understanding the application's architecture and logic.

## 🔄 Core Game Flow

The application follows a strict sequential lifecycle to ensure all dependencies and Firebase services are active before the UI renders.

1.  **Boot & Loading (`index.html`)**: Scripts are loaded in a specific order (01-config -> 16-main).
2.  **Global Registry (`01-config.js`)**: All services (Firestore, Auth, Storage) and helper functions are registered to the global `window` object.
3.  **Authentication (`useAuthState.js`)**: Handles Google and Guest login, persisting session data.
4.  **Component Polling (`16-main.js`)**: A `_waitForComponents` loop ensures that critical React components are defined before calling `ReactDOM.render`.
5.  **Main App Shell (`10-app.js`)**: The heart of the application, managing global state (Lobby, Room, Game) and routing.
6.  **Real-time Game Loop (`useRoom.js` / `useGameAutomation.js`)**: Syncs game states, timers, and bot actions across all connected players.

---

## 🏗️ Technical Architecture

-   **Frontend**: React 18 (CDN-based) using `React.createElement` (no JSX compilation).
-   **State Management**: Custom React Hooks registry (`window.AppHooks`).
-   **Database**: Firebase Firestore v10 (Modular SDK).
-   **Styling**: Vanilla CSS with a **Cyber-Luxury** design system (Neon accents, Glassmorphism).
-   **PWA**: Offline-first via `sw.js` with a split caching strategy (Critical vs. Lazy).

---

## 📂 Directory Index

Every directory in this project contains a `FOLDER_MAP.md` describing its specific contents and logic.

| Directory | Role | Map Link |
| :--- | :--- | :--- |
| **Root (/)** | Config, Entry Point, Global Styles | [Root Map](./FOLDER_MAP.md) |
| **src/** | Main Source Code (Logic & Components) | [src Map](./src/FOLDER_MAP.md) |
| **src/app/** | Global Hooks & Technical Utilities | [app Map](./src/app/FOLDER_MAP.md) |
| **src/features/** | Game Features (BFF, Chat, Family, etc.) | [features Map](./src/features/FOLDER_MAP.md) |
| **src/components/** | Reusable UI Elements | [components Map](./src/components/FOLDER_MAP.md) |
| **skills/** | AI Development Standards & Workflows | [skills Map](./skills/FOLDER_MAP.md) |
| **specs/** | Feature Requirements & Design Specs | [specs Map](./specs/FOLDER_MAP.md) |
| **icos/** | Asset Library (Icons, Rings, Badges) | [icos Map](./icos/FOLDER_MAP.md) |
| **.agents/** | AI Agent Coordination & Context | [.agents Map](./.agents/FOLDER_MAP.md) |

---

## 🔑 Key Architectural Concepts

### 1. The Global Namespace Pattern
Due to the CDN-based React approach, this project uses the global `window` object as a service bus. Components and hooks register themselves (e.g., `window.LobbyView = ...`) to be consumed by elsewhere.

### 2. The Hook Registry (`window.AppHooks`)
All custom hooks are aggregated in `AppHooks.js`. If a feature script fails to load, `10-app.js` falls back to this registry to prevent a total crash.

### 3. Z-Index Management
Strict adherence to `window.Z_INDEX` constants is required to manage the complex layering of modals, toasts, and overlays.
