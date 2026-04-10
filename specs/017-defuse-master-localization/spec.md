# Feature Specification: Defuse Master Initialization & Localization

**Feature Branch**: `017-defuse-master-localization`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: User description: "تناسب المشروع بتاعنا يشتغل بنظام IIFE وايضا ضيف زر للغه مؤقتا لغايه لما نصلح المشاكل كلها اللي في اللعبه وبعد كده نبقى نربطها بالموقع ونشغلها"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manual Language Switching (Priority: P1)

As a player, I want to be able to manually toggle the game language between Arabic and English at any time (Lobby or during a match) so that I can interact with the game in my preferred language.

**Why this priority**: Essential for the "localization" requirement and testing the bilingual support before full site integration.

**Independent Test**: Can be fully tested by clicking the "EN/AR" toggle button and verifying that all UI text (buttons, descriptions, logs) updates instantly.

**Acceptance Scenarios**:

1. **Given** the player is in the game lobby in Arabic, **When** they click the "EN" toggle, **Then** all labels (Players, Stake, Card names) must switch to English.
2. **Given** the player is in the middle of a match, **When** they toggle the language, **Then** the action log and card descriptions must update to the new language without resetting the game state.

---

### User Story 2 - Architectural Alignment (Priority: P1)

As a developer, I want the Defuse Master game to be packaged as a single script using the IIFE pattern so that it can be loaded via standard `<script>` tags in the existing project infrastructure without needing `import/export` support.

**Why this priority**: Technically mandatory; the project does not support ESM (modules). Without this, the game will not run in the project's environment.

**Independent Test**: The game loads and displays the Lobby screen without console errors after being added as a `<script>` tag in `index.html`.

**Acceptance Scenarios**:

1. **Given** the game script is loaded in the browser, **When** `window.DefuseMasterApp` is accessed, **Then** it should return the React component function.
2. **Given** the environment has no build step, **When** the browser executes the script, **Then** it must successfully find `React` and `ReactDOM` on the global window object.

---

### Edge Cases

- **Long Text Overflow**: English translations are often longer than Arabic. The UI must handle longer strings without breaking the layout or overlapping buttons.
- **RTL/LTR Switch**: When switching to English (LTR), icons or counts (like card counts) might need alignment adjustments to feel natural.
- **Bot Logs during switch**: If a bot makes a move exactly when the player switches language, the log entry should ideally be in the newly selected language.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a manual language toggle button (e.g., "AR/EN") accessible in both the Lobby and the active game UI.
- **FR-002**: System MUST use a centralized `TRANSLATIONS` dictionary to manage all UI strings, card descriptions, and log messages.
- **FR-003**: System MUST support instant UI updates when the language is toggled, without refreshing the page or losing game progress.
- **FR-004**: The entire codebase MUST be wrapped in an IIFE (Immediately Invoked Function Expression).
- **FR-005**: All `import` and `export` statements MUST be removed.
- **FR-006**: React hooks (useState, useEffect, etc.) MUST be accessed via the global `React` object.
- **FR-007**: The game MUST expose its main component function to the global `window` object as `window.DefuseMasterApp`.

### Key Entities

- **LanguageState**: A state variable within the main component tracking the user's current choice ('ar' or 'en').
- **TranslationDictionary**: A static object mapping keys to bilingual strings.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of hardcoded Arabic strings are moved to the translation dictionary.
- **SC-002**: Zero console errors related to "Uncaught SyntaxError: Cannot use import statement outside a module" upon loading.
- **SC-003**: Language toggle response time is under 100ms (instant UI update).
- **SC-004**: The game remains 100% functional (shuffling, bot turns, win conditions) after the refactor.

## Assumptions

- **React Availability**: `React` and `ReactDOM` are assumed to be pre-loaded and available on the `window` object.
- **Mobile-First Layout**: UI will continue to target a mobile-first aspect ratio (width ~430px).
- **Temporary State**: Language preference is kept in local component state for now and is not yet synced with external Firestore profiles.
