# Implementation Plan: 007-shop-leaderboard-redesign

**Branch**: `007-shop-leaderboard-redesign` | **Date**: 2026-04-04 | **Spec**: [spec.md](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/specs/007-shop-leaderboard-redesign/spec.md)
**Input**: Feature specification from `/specs/007-shop-leaderboard-redesign/spec.md`

## Summary

Modernize the Shop and Leaderboard UI by unifying the design with a new `.shop-standard-item` class and implementing a side-by-side Top 3 podium. The approach involves refactoring `ShopModal` and `BFFModal` to use shared styles, supporting 9:16 portrait containers for animated effects, and redesigning `RankingView` to incorporate custom podium assets.

## Technical Context

**Language/Version**: HTML / Javascript (ES6, No Bundler/NPM)  
**Primary Dependencies**: React 18.2, Firebase 10.7 (Firestore, Auth, Storage)  
**Storage**: Firebase Firestore (users, bff_relationships collections)  
**Testing**: Manual Browser Verification (PWA)  
**Target Platform**: Responsive Web / PWA (Mobile focus)
**Project Type**: Web Application (Single Page Application)  
**Performance Goals**: 60fps animations for profile effects  
**Constraints**: No ES6 imports/exports, Global namespace usage, Minimal bundle impact  
**Scale/Scope**: ~1M users (Firestore read/write costs considered)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **🔴 Dead Code Prevention**: All new classes will be utilized. Existing inline styles in Shop/BFF will be removed in favor of `.shop-standard-item`.
- **🟠 Logic & Async Accountability**: Standard Firestore error handling will be maintained.
- **🟡 Structural Discipline**: Naming will follow camelCase. CSS classes will be centralized in `vip.css`.
- **🔵 Dependency Sanitization**: No new external dependencies will be added.
- **⚪ Type & Null Robustness**: Existing null checks for `userData` and `equipped` items will be preserved and extended to the new podium layout.

## Project Structure

### Documentation (this feature)

```text
specs/007-shop-leaderboard-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── app/components/RankingView.js     # Leaderboard redesign
│   ├── bff/BFFModal.js                  # BFF UI Unification
│   └── profile/ProfileEffects.js        # Effect rendering logic
├── 08-components-shop.js                # Shop UI Refactor
└── index.html                           # Entry point
vip.css                                  # Global styles for premium UI
```

**Structure Decision**: Single project structure with feature-based directory organization. This aligns with the existing architecture.

## Complexity Tracking

> **No violations identified.**
