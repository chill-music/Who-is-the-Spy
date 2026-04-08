# Implementation Plan: Integrating Defuse Master Game

**Branch**: `014-defuse-master-integration` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-defuse-master-integration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

This feature involves integrating the standalone "Defuse Master" game into the "Who is the Spy?" platform. The technical approach centers on maintaining the project's **No-Bundler/IIFE** architecture. The core game logic will be moved to a dedicated feature folder, registered in the main HTML entry point, and accessed through a new game mode selector in the main lobby. The application router will be updated to handle the `gameType` attribute for room-based navigation.

## Technical Context

**Language/Version**: JavaScript (ES6+)  
**Primary Dependencies**: React (Global CDN), Cloud Firestore SDK  
**Storage**: Firestore (Centralized `rooms` and `users` collections)  
**Testing**: Manual Browser-based functional testing & Multi-client sync verification  
**Target Platform**: Web PWA (Safari/Chrome/Firefox/Mobile Web)  
**Project Type**: Multiplayer Web Application  
**Performance Goals**: <500ms room transition, Stable 60FPS UI animations  
**Constraints**: NO NPM, NO Build step, NO `import`/`export`, Must use global `window.AppHooks`  
**Scale/Scope**: Support for 2-10 players per game room  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 🔴 Dead Code Prevention
- [ ] Move game files to `src/features/defuse/` and ensure the old `b_PYGMD9p55yx` folder is ready for deletion post-integration.
- [ ] Prune any unused local assets or duplicate config values in moved scripts.

### 🟠 Logic & Async Accountability
- [ ] Verify that all Firestore subscriptions in `DefuseMaster.js` have dedicated `useEffect` cleanup handlers.
- [ ] Ensure `try-catch` blocks around room creation log errors to the console.

### 🟡 Structural Discipline (SOLID)
- [ ] Refactor localized component logic to rely on the global `window.AppHooks`.
- [ ] Maintain consistent `camelCase` for all new state variables and props.

### 🔵 Dependency Sanitization
- [ ] Use `<script defer>` in `index.html` exclusively for loading game-specific logic.
- [ ] Avoid adding new external dependencies; reuse existing platform utilities.

### ⚪ Type & Null Robustness
- [ ] Add JSDoc annotations to the main `DefuseMaster` entry point.
- [ ] Implement explicit null checks for `roomData` before rendering game sub-components.

## Project Structure

### Source Code (repository root)

```text
index.html                     # Register Defuse scripts
src/
├── features/
│   ├── defuse/                # Defuse Master sub-system
│   │   ├── defuse-rules.js    # Game logic engine
│   │   ├── defuse-cards.js    # Card definitions
│   │   ├── DefuseLobby.js     # Internal lobby UI
│   │   ├── DefuseGame.js      # Main gameplay loop
│   │   ├── DefuseResults.js   # Scoring and rankings
│   │   └── DefuseMaster.js   # Orchestrator component
│   └── app/
│       └── components/
│           └── LobbyView.js   # Added game type selector
├── 01-config.js               # Shared Firestore references
├── 10-app.js                  # Routing for gameType
└── 16-main.js                 # Critical component registry
```

**Structure Decision**: Option 1 (Single project) was selected as it aligns with the existing feature-based organization (`features/spy-rebuild`). The new game logic resides in `src/features/defuse/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |
