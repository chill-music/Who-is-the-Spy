# Who-is-the-Spy: src/core/ Directory

## Module Purpose
The `src/core/` directory contains critical foundation initialization logic upon which the entire frontend relies. It structures application-level configuration, centralized static text mapping (translations), Firebase initialization bootstrapping, and global sound orchestration.

## Core Features
*   **Firebase Initializer:** `firebase.js` establishes the connection via Firebase 8.x compat SDK, initializing `window.db`, `window.auth`, and cloud storage instances.
*   **Configuration Baseline:** `config.js` sets default system settings, environment flags, and global constants required before UI rendering.
*   **Translation Dictionary:** `translations.js` (often bound to `window.TRANSLATIONS`) defines Arabic language strings used across the UI, functioning as a lightweight i18n implementation.
*   **Audio Orchestration:** `audio.js` preloads, manages, and executes sound effects (e.g., clicks, chat pings, game cues) universally.

## Logic & Data Flow
*   Files in this directory must execute *before* any files in the parent `src/` directory (e.g., before `10-app.js`).
*   The initialization routines here explicitly attach core SDK objects to the global `window` object for downstream consumptio n.
*   The Translation layer acts as a static lookup; dynamic components ask this layer for the correct strings during render phases.

## Dependencies
*   **External Core Libraries:** `firebase.js` strictly requires Firebase 8.x scripts attached in `index.html`.
*   **Asset References:** `audio.js` directly references audio files hosted either locally or via configured storage URIs.

## Technical Constraints
*   **Strict Load Order:** This directory cannot have cyclical dependencies with the main `src/` modules. It is the absolute foundational layer.
*   **RTL Static Strings:** `translations.js` contains hundreds of Arabic strings; any modifications must respect strict UTF-8 saving, or the UI text will render corrupted.
*   **Caching & Execution:** Loading these scripts asynchronously or deferring them incorrectly in the DOM header will lead to catastrophic `db is undefined` faults in the main app lifecycle.
