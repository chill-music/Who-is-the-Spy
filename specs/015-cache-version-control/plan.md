# Implementation Plan: Cache Management & Version Control System

**Branch**: `015-cache-version-control` | **Date**: 2026-04-08 | **Spec**: [spec.md](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/specs/015-cache-version-control/spec.md)
**Input**: Feature specification from `/specs/015-cache-version-control/spec.md`

## Summary

Implement a manual cache clearing mechanism in the Settings menu and an automated version update system using Firebase. This involves adding a "Clear Cache" button that purges browser asset caches (Scripts/CSS) while preserving Firebase Auth sessions, and a background listener that compares the local version (`window.PRO_SPY_VERSION`) with a remote version in Firebase.

## Technical Context

**Language/Version**: JavaScript (ES6+), No-Build CDN React  
**Primary Dependencies**: React (UMD), Firebase (v9+), Browser `caches` API  
**Storage**: Firestore (Version Tracking), Browser Cache Storage  
**Testing**: Manual Browser Testing & Console Verification  
**Target Platform**: PWA (Mobile/Desktop Browsers)
**Project Type**: Single Page Web Application (No-NPM/No-Bundler)  
**Performance Goals**: Update check < 5s after startup, Cache clearing < 2s  
**Constraints**: Must NOT use `npm`, `import`, or `export`. Auth session MUST be preserved.  
**Scale/Scope**: Modifies `SettingsModal.js`, `16-main.js`, and adds a new update listener component.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] **🔴 Dead Code Prevention**: Ensure all new utility functions and UI components are actively used. Remove any temporary debugging code before shipping.
- [ ] **🟠 Logic & Async Accountability**: Properly await `caches.delete()` and Firebase version fetches. No silent failures during update check.
- [ ] **🟡 Structural Discipline**: Use camelCase for all new variables. Centralize version-related constants. Avoid deeply nested `if` statements in the update modal logic.
- [ ] **🔵 Dependency Sanitization**: Strictly no `npm install`. Only use existing UMD-wrapped libraries.
- [ ] **⚪ Type & Null Robustness**: Add JSDoc to new helpers. Handle cases where `remote_version` is missing or malformed in Firebase.

## Project Structure

### Documentation (this feature)

```text
specs/015-cache-version-control/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code

```text
src/
├── 01-config.js         # Version configuration (PRO_SPY_VERSION)
├── 16-main.js           # Injection point for update listener
├── components/
│   ├── modals/
│   │   ├── SettingsModal.js   # "Clear Cache" button injection
│   │   └── UpdateModal.js     # [NEW] Mandatory update UI
│   └── services/
│       └── VersionManager.js  # [NEW] Logic for cache clearing and version polling
```

**Structure Decision**: A new `VersionManager.js` will encapsulate the logic to keep the React components clean. `UpdateModal.js` will handle the UI for the update prompt.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
