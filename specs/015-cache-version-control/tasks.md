# Tasks: Cache Management & Version Control System

**Input**: Design documents from `/specs/015-cache-version-control/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: App registration and initialization

- [x] T001 Register `UpdateModal` and `VersionManager` in `src/16-main.js` component loading arrays.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core versioning configuration and logic container

**⚠️ CRITICAL**: Must be complete before user stories can begin

- [x] T002 Update `src/01-config.js` to define `window.PRO_SPY_VERSION` and ensure it's reactive if needed.
- [x] T003 [P] Create `src/components/services/VersionManager.js` with base IIFE structure and global exposure.

**Checkpoint**: Foundation ready - version state is now accessible globally.

---

## Phase 3: User Story 1 - Manual Cache Clearing (Priority: P1) 🎯 MVP

**Goal**: Allow users to manually clear asset cache from Settings without logging out.

**Independent Test**: Click "Clear Cache" in Settings, verify browser cache is purged, verify page reloads, verify Firebase Auth session persists.

### Implementation for User Story 1

- [x] T004 [P] [US1] Implement `clearCacheAndReload` in `src/components/services/VersionManager.js`: iterate over `window.caches.keys()` and delete all entries (MUST NOT touch `localStorage` or `IndexedDB`).
- [x] T005 [US1] Inject "Clear Cache" button into the bottom section of `src/components/modals/SettingsModal.js`.
- [x] T006 [US1] Connect Settings button to `VersionManager.clearCacheAndReload()` in `src/components/modals/SettingsModal.js`.

**Checkpoint**: User Story 1 functional - manual clearing is possible.

---

## Phase 4: User Story 2 - Automated Update Notification (Priority: P1)

**Goal**: Automatically prompt user to update when a new version is pushed to Firebase.

**Independent Test**: Change `remote_version` in Firestore and verify the `UpdateModal` appears on active clients.

### Implementation for User Story 2

- [x] T007 [P] [US2] Create `src/components/modals/UpdateModal.js` with "Update" button and hard refresh trigger.
- [x] T008 [US2] Implement Firestore `onSnapshot` for `config/versioning` in `src/components/services/VersionManager.js`.
- [x] T009 [US2] Add version comparison logic to trigger `UpdateModal` visibility in `VersionManager.js`.

**Checkpoint**: User Story 2 functional - live updates are working.

---

## Phase 5: User Story 3 - Viewing Update Announcements (Priority: P2)

**Goal**: Display feature notes in the update modal.

**Independent Test**: Verify `update_notes` string from Firebase correctly renders in `UpdateModal`.

### Implementation for User Story 3

- [x] T010 [US3] Update `src/components/modals/UpdateModal.js` to render the `update_notes` field content as an announcement.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Visual consistency and hardening

- [x] T011 [P] Ensure "Clear Cache" button style matches the "Logout" or "Save" buttons in `SettingsModal.js`.
- [x] T012 Add a hard-reload fallback `location.href = location.origin + '?v=' + Date.now()` if cache clearing fails.
- [x] T013 Verify Constitution Gate 🟠 Logic & Async: All cache deletions are awaited before reload.
- [x] T014 [US2] Handle Firestore connectivity issues in `VersionManager.js` (e.g., wrap `onSnapshot` in try/catch or handle the `error` callback) to ensure silent fail in offline mode.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on T001.
- **User Stories (Phase 3+)**: All depend on Phase 2 completion.
  - US1 and US2 can proceed in parallel once `VersionManager` exists.
- **Polish (Final Phase)**: Depends on US1, US2, US3.

### Parallel Opportunities

- T003, T004, and T007 can be drafted in parallel as they are separate files.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup + Foundational.
2. Complete US1 (Manual Cache Clear).
3. **STOP and VALIDATE**: Verify manual clear works without logging out.

### Incremental Delivery

1. Foundation ready.
2. US1 integrated.
3. US2 + US3 added to provide the complete versioning experience.
