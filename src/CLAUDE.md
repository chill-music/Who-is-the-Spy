# Who-is-the-Spy: src/ Directory

## Module Purpose
The `src/` directory stands as the monolithic nexus of frontend execution for the game environment. Most application logic, DOM binding definitions, major components, profile management, and global event listeners live directly in this directory as a sequenced collection of JS files (`01` through `21`), acting as the primary execution runtime.

## Core Features
*   **Sequenced Application Logic:** Execution is strictly ordered numerically. Files range from configuration overrides (`01-config.js`) up through game loops (`04-data-game.js`), component rendering (`06-14`), and complex system logic (`15-profile.js`, `19-family.js`, `20-couples.js`, `21-bff.js`).
*   **Modal Management:** Massive files dictating UI behavior such as `13-modal-chat.js`, `14-modals-misc.js`, and `11-modal-selfchat.js`.
*   **Major Subsystems:** Houses the principal logic for the Shop (`08`), Admin Panels (`18`), Profiles (`15`), and VIP privileges (`17`).
*   **Hybrid Transition:** Initiates the bridging from monolithic files down into the `core/`, `features/`, and `utils/` modular subdirectories.

## Logic & Data Flow
*   The architecture heavily implies Asynchronous State Management binding Firebase Listeners to vanilla DOM Manipulation.
*   Variables and logic established in sequentially lower-numbered scripts are expected to be available to higher-numbered scripts via the `window` scope.
*   Firebase triggers generally update local maps or arrays, subsequently calling UI rendering redraw functions defined within these monolithic modules.

## Dependencies
*   **Global Variables Context:** Relies utterly on variables generated in `src/core/` (like `db`, `auth`, `config`) or loaded globally via external CDN tags.
*   **Data Models:** Heavy assumptions are made regarding Firebase collections structure (e.g., users, family data, chat nodes).
*   **Isolated Modules:** Frequently invokes helper functions situated in `src/utils/` and newer features imported from `src/features/`.

## Technical Constraints
*   **Legacy Monoliths:** Many files here are 'Legacy Monoliths' (e.g., `10-app.js`, `15-profile.js`, `19-family.js`) containing mixed business logic and DOM manipulation. They must eventually be refactored.
*   **Global Pollution:** Due to missing scoped bundlers, functions defined in these files act as global namespaces, requiring careful collision avoidance.
*   **Arabic UTF-8 Editing:** As with all project files containing direct Arabic strings used in string interpolation or UI updates, editing requires strict UTF-8 preservation to prevent mojibake.
