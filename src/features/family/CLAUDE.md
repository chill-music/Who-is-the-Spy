# Who-is-the-Spy: src/features/family/ Directory

## Module Purpose
The `family/` submodule governs all mechanics related to the Clan/Family system inside "Who-is-the-Spy". It specifically manages database transactions for Gacha pulls, Family News logging, Clan Chest generation, member tracking, and modularized data manipulation divorced from the older `19-family.js` monolithic approach.

## Core Features
*   **FamilyService.js:** The true backbone for database interactions. Contains complex logic executing Firebase Transactions for operations like: Purchasing Items, Opening Clan Chests (with duplicate array checking), generating real-time News logs, and awarding rewards.
*   **FamilyConstants.js:** Houses essential enums and lookup tables mapping Level requirements to XP (e.g., LVL 1 -> LVL 10 arrays), mapping string identifiers to item properties (VIP flags, crowns, IDs, profile effects), and UI image paths.
*   **FamilyUtils.js:** A helper class specific exclusively to `family` functionality, used primarily to synthesize readable UI strings out of raw DB snapshots or calculate derived numbers (like remaining chest slots).
*   **components/:** Houses logic dedicated to isolating complex rendering operations (like drawing the modal or handling the Family tasks interface) into structured DOM components.

## Logic & Data Flow
1.  **Trigger (e.g., Buy Chest Button Click):** Invokes `FamilyService.buyClanChest()`.
2.  **Data Isolation:** The Service relies on `FamilyConstants` for pricing information rather than hardcoding it.
3.  **Firebase Execution:** Modifies `familyData` nodes, deducts currency from `userData`, dynamically updates `clan_chests_shared` collection, and inherently writes a log to `familyNews`.
4.  **UI Redraw:** Emits or callbacks to the main `19-family.js` or `components/` to refresh the Chest Modal via snapshot synchronization.

## Dependencies
*   **Global Database Instance:** Strictly dependent on `window.db`.
*   **Current User State:** Assumes `window.currentUserId` translates into the active acting member for logging purposes.
*   **Translations:** References global `TRANSLATIONS` extensively for compiling localized log messages (e.g., translation keys mapping 'bought', 'awarded', 'joined').

## Technical Constraints
*   **Firebase Transaction Safety:** Because Family resources are pooled (e.g., an open Clan Chest containing 6 items shared among 20 members), operations like `openAssignedChest` require strict atomic Transaction executions to prevent race conditions (over-claiming).
*   **Dual Existence:** Parts of the UI drawing code still reside in `src/19-family.js`. This module bridges modern service-layer logic with the legacy main application hook loops. Modifying functions requires checking where the legacy app bindings terminate.
