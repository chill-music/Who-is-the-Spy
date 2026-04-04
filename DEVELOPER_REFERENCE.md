# Developer Reference Guide

This document provides technical details for developers and AI agents working on the Who-is-the-Spy PWA.

## Tech Stack

The application is built using a modern but "no-bundler" approach:
- **Core Library**: React 18 (loaded via Unpkg CDN).
- **Styling**: Tailwind CSS (loaded via Play CDN) + Vanilla CSS.
- **Backend/Database**: Firebase 10 (Compat versions for App, Auth, Firestore, and Storage).
- **Languages**: HTML5, Vanilla JavaScript (ES6+), and CSS3.

## Architecture Patterns

### Global Namespace Integration
To maintain a cohesive application across multiple scripts without a bundler, the project relies on the **`window` global object**.
- **Modules**: Each script typically wraps its logic in an Immediately Invoked Function Expression (IIFE) and exposes its main functions or components to `window`.
- **Global Constants**: `window.Z` (Z-index), `window.GR` (Gradients), and various configuration objects are defined early in `src/01-config.js`.

### Hook Management (`AppHooks.js`)
Since React hooks are split across multiple files, `src/app/AppHooks.js` acts as a centralized registry. It provides a `window.AppHooks` namespace and a `window.__hooksReady` flag to ensure components don't attempt to use hooks before they are fully loaded.

## Boot & Initialization Sequence

1. **`index.html`** is loaded.
2. **`window.PRO_SPY_VERSION`** is set, and cache-busting logic intercepts `fetch` and `XHR`.
3. **`#app-boot-screen`** is displayed to the user while scripts load in the background.
4. **Firebase** scripts load and initialize.
5. **Source Scripts** load in the order defined in `index.html` (using `defer`).
6. **`src/16-main.js`** initiates a polling loop, waiting for all critical and secondary components to be defined on `window`.
7. Once all components are ready, **React mounts** to the `#root` element.
8. The boot screen is hidden, and the app is ready for interaction.

## State Management

The application state is managed primary through **Custom React Hooks** located in `src/app/`.
- **`useAuthState.js`**: Manages Google login, guest access, and user profile data.
- **`useRoom.js` / `RoomState.js`**: Handles room creation, joining, and real-time game state synchronization via Firestore listeners.
- **`AppHooks.js`**: Consolidates these hooks and exposes them to the main application via `window.AppHooks`.

## Firebase Collections

The database follows a structured collection hierarchy under a single `appId` document:
- **`users`**: Persistent user profiles and stats.
- **`guests`**: Temporary guest sessions.
- **`rooms`**: Active and historic game rooms.
- **`private_chats`**: One-on-one messaging.
- **`group_chats`**: Tribe/Family and public chat sessions.
- **`families`**: Tribe/Family system data.
- **`couples` / `bff_relationships`**: Relationship system data.
- **`notifications`**: Real-time user alerts.
- **`moments`**: Social feed and comments.

## CSS & Styling System

The project uses a hybrid approach:
- **`style.css`**: Contains the core "Cyber-Luxury" theme (dark mode, neon glows, glassmorphism) and global layout rules.
- **Tailwind CSS**: Used for quick utility styling directly in components.
- **Specific Feature CSS**: Files like `vip.css` and `mini-profile.css` handle complex or isolated styling for specific UI modules.
- **Animations**: Many UI components utilize CSS-based animations or the `bgAnimation.js` utility for dynamic effects.
