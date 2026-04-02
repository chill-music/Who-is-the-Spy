# Folder: Project Root (/)

## Overview
The root directory contains the application entry point, global configuration, high-level styling, and architectural documentation. It defines how the project is loaded and how it interacts with the Firebase backend.

## Files

### [index.html](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/index.html)
- **Purpose**: Main entry point and script registry.
- **Logic**: Orchestrates the loading order of all `defer` scripts. It includes the boot-screen UI and the polling mechanism that waits for React components to be globally defined.
- **Dependencies**: Loads every file in `src/` and references `style.css`.

### [01-config.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/01-config.js)
- **Purpose**: Global configuration and Firebase initialization.
- **Logic**: Initializes Firestore, Auth, and Storage. Definess collection paths, Z-index constants, and core security/data helpers.
- **Dependencies**: Interacts with Firebase SDK (v10) and is consumed by almost every feature script.

### [sw.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/sw.js)
- **Purpose**: PWA Service Worker.
- **Logic**: Implements a "Split Caching" strategy. `CRITICAL` files are cached during installation for fast PWA compliance, while `LAZY` files (assets, features) are cached in the background after activation.
- **Dependencies**: Manages caching for all files listed in its internal `CRITICAL` and `LAZY` arrays.

### [style.css](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/style.css)
- **Purpose**: Primary stylesheet for the application.
- **Logic**: Contains the "Cyber-Luxury" design system, global variables (--primary, --accent), and complex layout rules for the Lobby and Game views.
- **Dependencies**: Loaded by `index.html`.

### [firebase.txt](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/firebase.txt)
- **Purpose**: Firestore Security Rules.
- **Logic**: Defines granular read/write access for users, guests, and staff. Protects sensitive collections like `users` and `staff_activity_log` while allowing public/guest access to `rooms` and `public_chat`.
- **Dependencies**: Controls interaction between the frontend and the Firestore database.

### [DEVELOPER_REFERENCE.md](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/DEVELOPER_REFERENCE.md)
- **Purpose**: Technical source of truth.
- **Logic**: Documents global variables, currency conversion rates, badge systems, and Z-index hierarchies.
- **Dependencies**: Reference guide for all developers/AI sessions.

### [manifest.json](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/manifest.json)
- **Purpose**: PWA Web App Manifest.
- **Logic**: Defines the app name, icons, theme colors, and standalone display mode for installation on mobile/desktop.
- **Dependencies**: Referenced in `index.html`.

### [vip.css](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/vip.css)
- **Purpose**: Specialized styles for VIP users.
- **Logic**: Contains animations, glow effects, and unique card designs for VIP tiers (including the V10 "Light Streak" effect).
- **Dependencies**: Imported after `style.css`.

### [mini-profile.css](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/mini-profile.css)
- **Purpose**: Specialized styles for the MiniProfilePopup.
- **Logic**: Handles the layout and animations of the interactive player card used across the app.
- **Dependencies**: Used by `MiniProfilePopup` in `06-components-base.js`.

### [resize_icons.ps1](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/resize_icons.ps1)
- **Purpose**: Asset management utility.
- **Logic**: A PowerShell script that automates the resizing of icons in the `icos/` folder to standard PWA sizes.
- **Dependencies**: Acts on the `icos/` directory.

### [skills-lock.json](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/skills-lock.json)
- **Purpose**: Metadata for custom AI skills.
- **Logic**: Tracks the versions and states of the skills located in the `skills/` directory.
- **Dependencies**: Linked to the `skills/` folder.
