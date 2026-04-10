# Implementation Plan: Defuse Master Initialization & Localization

**Branch**: `017-defuse-master-localization` | **Date**: 2026-04-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-defuse-master-localization/spec.md`

## Summary

The primary objective is to refactor the standalone `DefuseMaster.jsx` game to align with the project's architectural constraints (IIFE, no bundler, global React) and implement a robust bilingual (Arabic/English) localization system with a manual toggle button for testing.

## Technical Context

**Language/Version**: Javascript (ES2022+ compatible, but refactored to IIFE for global script loading)  
**Primary Dependencies**: React 18 (Global), Baloo 2 (Google Font)  
**Storage**: Local Component State (initial), potential future integration with `spy_rooms` collection.  
**Testing**: Manual Browser Testing (Chrome/Safari) via the project's local dev server.  
**Target Platform**: PWA (Mobile-first, target width ~430px).  
**Project Type**: Web Application Component.  
**Performance Goals**: 60 FPS animations; instant language switching (<100ms).  
**Constraints**: **NO NPM**, **NO BUNDLER**, **NO ESM IMPORT/EXPORT**. Global `React` object only.  
**Scale/Scope**: Refactoring ~1300 lines of complex game logic while adding ~200 lines of localization data.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **🔴 Dead Code Prevention**: All `import` and `export` statements will be removed as they are non-functional in the target environment.
- [x] **🟠 Logic & Async Accountability**: Existing `useEffect` and `useCallback` hooks must be preserved and correctly managed.
- [x] **🟡 Structural Discipline**: Variable naming will strictly follow `camelCase`. Logic will be wrapped in a single IIFE to prevent global namespace pollution.
- [x] **🔵 Dependency Sanitization**: Instead of importing React, the component will use destructured assignments from `window.React`.
- [x] **⚪ Type & Null Robustness**: Explicit handling of the `lang` state to default to 'ar' if undefined.

## Project Structure

### Documentation (this feature)

```text
specs/017-defuse-master-localization/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
Defusemaster/
└── DefuseMaster.jsx     # Target file for refactor
```

**Structure Decision**: Single project component refactor. The file will remain in `Defusemaster/` but will be registered in `index.html` eventually.

## Complexity Tracking

*No constitution violations detected.*
