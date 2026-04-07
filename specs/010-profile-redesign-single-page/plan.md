# Implementation Plan: Profile Redesign: Single Page Layout

**Branch**: `010-profile-redesign-single-page` | **Date**: 2026-04-06 | **Spec**: [spec.md](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/specs/010-profile-redesign-single-page/spec.md)
**Input**: Feature specification from `/specs/010-profile-redesign-single-page/spec.md`

## Summary
The user profile is currently organized into tabs: "About, Games, Friends, Gifts, and Moments." We will remove this tab system and display all relevant content on a single, scrollable profile page. Components will be reordered to prioritize social interaction (Moments, Gifts) immediately after the user identity.

## Technical Context

**Language/Version**: JavaScript (ES6, Vanilla React, No JSX/Babel)
**Primary Dependencies**: React (Global `window.React`), Firestore (Global `window.db`), CSS Modules (standard `.css`)
**Storage**: Firestore (read-only for this UI change, uses existing collections: `users`, `gifts_log`, `moments`)
**Testing**: Manual browser verification
**Target Platform**: Web/Mobile PWA
**Project Type**: Single-page JavaScript application (No bundler)
**Performance Goals**: 60 fps scrolling for profile sections
**Constraints**: NO npm, NO modules, NO bundler.
**Scale/Scope**: ~1100 line `ProfileV11.js` refactor.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Dead Code Prevention**: `ProfileTabs.js` will be removed once confirmed unused elsewhere.
- [x] **Logic & Async Accountability**: Uses existing `useEffect` listeners for data fetching. No new async logic introduced.
- [x] **Dependency Sanitization**: No new external libraries added. Uses existing window-global React/Firebase.

## Project Structure

### Documentation (this feature)

```text
specs/010-profile-redesign-single-page/
├── plan.md              # This file
├── research.md          # Visual order and scroll logic findings
├── data-model.md        # Order and section requirements
├── quickstart.md        # User-facing summary
└── tasks.md             # Implementation steps
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── profile/
│   │   ├── ProfileV11.js         # Modified (Main layout refactor)
│   │   ├── ProfileTabs.js        # Deprecated
│   │   ├── ProfileFriendsSection.js # Unused (in this view)
│   │   └── ProfileStats.js       # Reused
index.html                     # Modified (Removed ProfileTabs.js script)
```

**Structure Decision**: Single component refactor within `features/profile`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |
