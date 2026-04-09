# Tasks: System Enhancement & Integrity Check

**Input**: Design documents from `/specs/016-system-integrity-enhancement/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: App registration and initialization

- [x] T001 [P] Register `ConnectivityMonitor` in `src/16-main.js` component loading arrays.
- [x] T002 [P] Update `src/01-config.js` to define default versioning constants if missing.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core logic containers for enhancements

- [x] T003 [P] Create `src/components/ui/ConnectivityMonitor.js` with base IIFE structure.
- [x] T004 Define `pro_spy_active_room_id` key in `localStorage` logic inside `useRoom`.

**Checkpoint**: Foundation ready - new components registered and ready for logic.

---

## Phase 3: User Story 1 - Forced Critical Updates (Priority: P1) 🎯 MVP

**Goal**: Force hard refresh when a critical update is detected in Firestore.

**Independent Test**: Manually update Firestore `config/versioning` with `critical: true` and a new version string. Verify app reloads automatically.

### Implementation for User Story 1

- [x] T005 Update `src/components/services/VersionManager.js` to parse the `critical` flag from the Firestore snapshot.
- [x] T006 Implement forced update logic in `VersionManager.js`: if versions mismatch and `critical: true`, show "System Updating" overlay and trigger `clearCacheAndReload()`.
- [x] T007 [P] Update `index.html` cache-busting interception to include `.css` and `icos/` paths explicitly.

**Checkpoint**: US1 functional - emergency updates now trigger forced reloads.

---

## Phase 4: User Story 2 - Auto-rejoin Last Room (Priority: P1)

**Goal**: Persist room ID to survive refreshes.

**Independent Test**: Join a room, refresh page, verify auto-reentry.

### Implementation for User Story 2

- [x] T008 [P] Implement `localStorage` setter in `src/app/useRoom.js`.
- [x] T009 Ensure `localStorage` is cleared in `useRoom.js` when game finishes or the room is deleted.
- [x] T010 Implement recovery check in `src/10-app.js` initialization `useEffect`: if `localStorage` has a room ID, trigger `setRoomId`.

**Checkpoint**: US2 functional - room sessions are now persistent across refreshes.

---

## Phase 5: User Story 3 - Connectivity Status UI (Priority: P2)

**Goal**: Display a "Reconnecting" banner when offline.

**Independent Test**: Toggle "Offline" in DevTools, verify banner appearance.

### Implementation for User Story 3

- [x] T011 [P] Implement `navigator.onLine` listeners in `src/components/ui/ConnectivityMonitor.js`.
- [x] T013 Integrate `ConnectivityMonitor` into `src/10-app.js` main render.

---

## Phase 6: User Story 4 - Lobby Scaling (Priority: P3)

**Goal**: Optimize room browsing performance.

**Independent Test**: Verify room list displays exactly 50 rooms when >50 are available.

### Implementation for User Story 4

- [x] T014 [P] Update `src/components/modals/BrowseRoomsModal.js` to add `.limit(50)` to the rooms snapshot query.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and styling

- [x] T015 [P] Verify styling of `ConnectivityMonitor` matches global design system.
- [x] T016 Ensure `localStorage` room ID is cleared if the room no longer exists (handle in `useRoom.js`).
- [x] T017 Final check of `VersionManager` to ensure standard `UpdateModal` snooze still works for non-critical updates.

---

## Phase 7: Performance Optimization & Regression Fixes

**Goal**: Restore Snappy Load Times and Stabilize Listeners

- [x] T018 [P] Optimize `index.html` interceptor: Fix XHR bug, exclude external APIs, handle `/src/` paths.
- [x] T019 [P] Stabilize `src/app/useRoom.js` listener: Remove `userData` dependency to stop listener thrashing.
- [x] T020 [P] Refactor `src/components/ui/ConnectivityMonitor.js`: Move style tag outside render.
- [x] T021 [P] Sync `PRO_SPY_VERSION` initialization in `src/01-config.js` with `localStorage`.
