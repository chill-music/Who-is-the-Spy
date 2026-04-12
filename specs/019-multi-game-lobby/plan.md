# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

This feature transforms the current "Are You the Spy?" lobby into a dynamic multi-game ecosystem. We will implement a centralized `GAMES_CONFIG` array to drive the lobby UI, allowing users to switch between games via a horizontal carousel. The architecture shifts from a hardcoded single-collection room model to a `Game Namespace` model, where each game targets its own Firestore collection. This ensures scalability, zero room-code collisions across different games, and a future-proof way to toggle "Coming Soon" states for upcoming titles like "Draw & Guess".

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: JavaScript (ES6+) / React 18.2.0 (CDN)  
**Primary Dependencies**: Firebase 9 (CDN), FontAwesome (Icons)  
**Storage**: Google Cloud Firestore (`Game Namespace` isolation)  
**Testing**: Browser-based manual verification  
**Target Platform**: Web / PWA (Mobile-first, optimized for 320px-430px)
**Project Type**: Multiplayer Web Game Lobby  
**Performance Goals**: <200ms UI response for selection; <2s load for game state  
**Constraints**: Zero room collisions; Offline-ready placeholders for coming soon games
**Scale/Scope**: Support for 10+ games via config; 100k+ concurrent room mappings via Firestore

### 🔴 Dead Code Prevention
- [ ] No unused properties in `GAMES_CONFIG`.
- [ ] Prune legacy single-game card CSS if fully replaced.

### 🟠 Logic & Async Accountability
- [ ] Ensure `useGameActions` correctly awaits room validation across collections.
- [ ] Add explicit error logging for room-not-found across namespaces.

### 🟡 Structural Discipline (SOLID)
- [ ] Centralize game list in `GAMES_CONFIG` (01-config.js).
- [ ] Flatten the lobby card component logic into smaller, game-agnostic sub-components.

### 🔵 Dependency Sanitization
- [ ] Reuse existing `window.db` and `window.RoomService`; avoid new global instances.

### ⚪ Type & Null Robustness
- [ ] Validate `gameId` existence before attempting Firestore reference creation.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── 01-config.js                # Centralized GAMES_CONFIG
├── 10-app.js                   # App shell update for game-aware joining
├── app/
│   └── hooks/
│       └── useGameActions.js   # Game context injection
└── features/
    └── app/
        └── components/
            └── LobbyView.js    # Multi-game hero and selector UI
```

**Structure Decision**: Using the existing Flat Script architecture with the recently established Feature directory structure for UI components.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
