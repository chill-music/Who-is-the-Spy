# Tasks: Defuse Master Initialization & Localization

**Input**: Design documents from `/specs/017-defuse-master-localization/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 (Manual Language Switching), US2 (Architectural Alignment)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the conversion environment.

- [ ] T001 [P] Create backup of original `Defusemaster/DefuseMaster.jsx` if not version-controlled
- [ ] T002 Initialize `TRANSLATIONS` dictionary at the top of `Defusemaster/DefuseMaster.jsx`
- [ ] T003 [P] Add JSDoc to document global dependencies (React, ReactDOM)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish localization state and IIFE structure that blocks story implementation.

- [ ] T004 Wrap the entire content of `Defusemaster/DefuseMaster.jsx` in an IIFE
- [ ] T005 Remove all `import` and `export` statements from `Defusemaster/DefuseMaster.jsx`
- [ ] T006 Expose `DefuseMasterApp` to `window.DefuseMasterApp`
- [ ] T007 Implement the `t(key)` helper function within the main component

---

## Phase 3: User Story 1 - Manual Language Switching (Priority: P1) 🎯 MVP

**Goal**: Allow players to toggle between Arabic and English.

**Independent Test**: Mount the component and click the "Toggle Language" button; verify UI strings change instantly.

### Implementation for User Story 1

- [ ] T008 [US1] Inject `lang` and `setLang` state into `DefuseMasterApp` in `Defusemaster/DefuseMaster.jsx`
- [ ] T009 [US1] Add floating language toggle button (fixed position) to the Lobby UI
- [ ] T010 [US1] Add floating language toggle button to the Game Phase UI
- [ ] T011 [P] [US1] Replace Lobby hardcoded strings (Players, Stake, Start) with `t()` lookups
- [ ] T012 [P] [US1] Replace Game Log hardcoded strings with `t()` lookups
- [ ] T013 [P] [US1] Replace Modal hardcoded strings (Bomb, X-Ray, Prophecy) with `t()` lookups
- [ ] T014 [P] [US1] Replace Results Screen hardcoded strings with `t()` lookups
- [ ] T015 [US1] Adjust layout padding for English text in `CardUI` inside `Defusemaster/DefuseMaster.jsx`

**Checkpoint**: User Story 1 is functional; manual toggle works.

---

## Phase 4: User Story 2 - Architectural Alignment (Priority: P1)

**Goal**: Ensure the game runs specifically in the project's global window environment.

**Independent Test**: Load the file in `index.html` and verify the game initiates via `window.React` without ESM errors.

### Implementation for User Story 2

- [ ] T016 [US2] Destructure `useState`, `useEffect`, etc., from `window.React` inside `Defusemaster/DefuseMaster.jsx`
- [ ] T017 [US2] Ensure all image/icon references (SVG paths) remain intact after the refactor
- [ ] T018 [US2] Verify `Baloo 2` font loading in the `<style>` block

**Checkpoint**: User Story 2 is functional; ESM is fully purged.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T019 Final review of translation dictionary coverage
- [ ] T020 Code cleanup: Remove all console.logs used during refactor
- [ ] T021 Run `quickstart.md` validation steps

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Initial preparation.
- **Foundational (Phase 2)**: MUST be completed before US1 or US2 can be tested in-browser.
- **User Stories (Phase 3-4)**: Can mostly be worked on in parallel once the foundation is laid.

### Parallel Opportunities
- Translation replacements (T011 to T014) can be done in parallel across different code sections.
- Polish tasks can run after story completion.
