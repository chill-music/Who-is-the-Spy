# Implementation Plan: Who is the Spy? Game Rebuild

**Branch**: `013-spy-game-rebuild` | **Date**: 2026-04-07 | **Spec**: [spec.md](file:///C:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/specs/013-spy-game-rebuild/spec.md)
**Input**: Feature specification for the Spy Game rebuild, focusing on a 5-file architecture (config, firebase, offline, online, ui) with React/Firebase CDNs.

## Summary

The goal is to rebuild the "Who is the Spy?" game into a production-ready, high-fidelity party game. The implementation will use a unique "bundler-less" architecture where 5 separate IIFE-wrapped files share a global `window.SpyGameCore` object. This approach satisfies the project's constraints of no npm/bundler while maintaining modularity. The game features a robust offline mode for same-device play and a real-time Firestore-backed online mode with host migration and presence tracking.

## Technical Context

**Language/Version**: JavaScript (ES6+), React 18 (CDN)  
**Primary Dependencies**: Firebase 10 Compat (CDN), Tailwind CSS (Play CDN), Web Audio API  
**Storage**: Firestore (Online mode), Local state & LocalStorage (Offline mode/Settings)  
**Testing**: Manual cross-device verification (Mobile-first, RTL support)  
**Target Platform**: Web (Responsive 375px to 1024px, PWA optimized)
**Project Type**: Web Application (Social Deduction Party Game)  
**Performance Goals**: Consistent 60 FPS animations, < 500ms real-time sync latency for online events  
**Constraints**: NO npm, NO bundler, NO import/export. Split into exactly 5 files. IIFE-wrapped. Prefixed Firestore paths.  
**Scale/Scope**: 2 distinct game modes, 9 screens, 15 categories with 600 total word entries.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **🔴 Dead Code Prevention**: All logic in the 5 files will be strictly mapped to functional requirements. No "todo" or placeholder placeholders will be permitted.
- [x] **🟠 Logic & Async Accountability**: Firestore listeners and Web Audio context will be properly unsubscribed/suspended on unmount.
- [x] **🟡 Structural Discipline (SOLID)**: Each of the 5 files has a clear, single responsibility (Config, Data, Offline, Online, UI). CamelCase used exclusively.
- [x] **🔵 Dependency Sanitization**: Strictly zero npm dependencies. Only verified CDN globals (`window.React`, `window.firebase`, etc.).
- [x] **⚪ Type & Null Robustness**: JSDoc annotations will be used for core utilities and Firebase helper functions.

## Project Structure

### Documentation (this feature)

```text
specs/013-spy-game-rebuild/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

The implementation will be located in the `src/features/spy-rebuild/` directory, following the 5-file technical requirement.

```text
src/features/spy-rebuild/
├── SpyGame-config.js     # Constants, I18N, Word Bank
├── SpyGame-firebase.js   # Firestore helpers & Room logic
├── SpyGame-offline.js    # Offline state & UI
├── SpyGame-online.js     # Online hooks & Presence
└── SpyGame-ui.js         # Shared components, Router, Global Mount
```

**Structure Decision**: The 5-file split is a hard constraint from the user. We will use `window.SpyGameCore` as a shared bus to bridge these files without using `import/export`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Levenshtein Distance | Fuzzy matching for spy guess | Simple strict equality fails on minor typos in a high-pressure party game. |
| Custom Canvas Confetti | Winner celebration without libraries | External libraries like `canvas-confetti` are not allowed due to "no npm" constraint. |
| Global bus `SpyGameCore` | Inter-file communication without ESM | Module bundlers and `import/export` are explicitly forbidden. |
