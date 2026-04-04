# Who-is-the-Spy Project Structure

This document provides a high-level overview of the repository's organization.

## Directory Tree

```
Who-is-the-Spy-og/
├── .agent/                  # Agent-specific configurations
├── .agents/                 # Agent-specific workflows and skills
├── .git/                    # Git repository data
├── .github/                 # GitHub actions and workflows
├── .specify/                # Formatting and linting rules
├── .vscode/                 # VS Code settings and launch configs
├── icos/                    # App icons (PWA manifests)
├── specs/                   # Technical specifications and design docs
├── src/                     # Source code (see below for details)
│   ├── app/                 # Core logic hooks and state management
│   ├── components/          # Generic UI components and shared modals
│   └── features/            # Module-based features (profile, family, etc.)
├── firebase.txt             # Firebase-related notes or snippets
├── index.html               # Main entry point (PWA container)
├── manifest.json            # PWA manifest
├── mini-profile.css         # Mini-profile specific styling
├── resize_icons.ps1         # Utility script for icon resizing
├── skills-lock.json         # Skills versioning
├── style.css                # Global project styling and themes
├── sw.js                    # Service Worker (offline and caching)
└── vip.css                  # VIP-specific styling
```

## Folder Descriptions

### Root Directory
- **`index.html`**: The single-page entry point. It loads all libraries (React, Firebase, Tailwind) via CDN and all source scripts in a specific order using `defer`.
- **`style.css`**: The main stylesheet, containing the "Cyber-Luxury" theme, layout utilities, and component styles.
- **`sw.js`**: Handles the Service Worker logic, including caching strategies and offline support.

### `src/` Directory
Contains the application's JavaScript source code.
- **`01-config.js` to `19-family.js`**: Core global scripts that are loaded in sequence in `index.html`. These define constants, Firebase collections, base components, and major feature modules.
- **`app/`**: Contains React hooks that manage global state (Auth, UI, Presence, Rooms, etc.).
- **`features/`**: Contains specialized modules such as Profile, Family, Couples, and Lucky Games.
- **`components/`**: Reusable UI parts like Admin panels, Lobby boxes, and generic Modals.

### `specs/` Directory
Used for planning and tracking features. Each subdirectory represents a specific feature or fix with its own plan and task list.
