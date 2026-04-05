# src/features Directory Map

This directory contains standalone modules representing the main user-facing features of the app.

## Feature Modules

| Module | Description |
| :--- | :--- |
| **`app/`** | Global application views (Lobby, Room, Rankings) and the modal shell. |
| **`bff/`** | Bonding features and private bot chat systems. |
| **`chat/`** | Core real-time messaging management between users. |
| **`couples/`** | The marriage/relationship system and wedding hall. |
| **`family/`** | Tribe/Clan system, including sign levels and gacha. |
| **`game/`** | Core game session logic (Spy roles, voting, results). |
| **`groups/`** | Tribal/Public group chat rooms and channel management. |
| **`lucky-games/`** | Secondary arcade mini-games (Soccer, Cat, Fruit). |
| **`onboarding/`** | New user registration and avatar selection flow. |
| **`profile/`** | Comprehensive user profiles, stats, and gift walls. |
| **`pwa/`** | PWA-specific logic (Install prompts, update handling). |
| **`room/`** | Real-time state orchestration for active game rooms. |
| **`tasks/`** | Daily mission and achievement tracking UI. |

## Structure within Modules
Each feature typically follows a consistent internal structure:
- **`[Feature]Service.js`**: Data fetchers and Firestore update operations.
- **`[Feature]Config.js`**: Constants and local configurations.
- **`components/`**: React components specific to this feature.
- **`FOLDER_MAP.md`**: Detailed breakdown of the module's contents.
