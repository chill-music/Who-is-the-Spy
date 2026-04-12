# Tasks: Multi-Game Lobby Redesign

**Input**: Design documents from `/specs/019-multi-game-lobby/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Register `GAMES_CONFIG` in `src/01-config.js` with metadata for active and placeholder games

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Refactor `useGameActions.js` in `src/app/hooks/useGameActions.js` to accept `gameId` parameters for creation and joining
- [x] T003 Update `RoomService` in `src/features/room/RoomState.js` to dynamically resolve Firestore collection references using the `Game Namespace` context

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Game Selection & Visual Feedback (Priority: P1) 🎯 MVP

**Goal**: Enable users to switch between games and see immediate visual feedback on the lobby card.

**Independent Test**: Click different game icons and verify the Hero Card's title and theme color change correctly.

### Implementation for User Story 1

- [x] T004 [P] [US1] Create the `GameSelector` component logic in `src/features/app/components/LobbyView.js`
- [x] T005 [P] [US1] Implement dynamic styling/theme mapping for the hero card AND grayscale/lock treatments for inactive games in `src/features/app/components/LobbyView.js`
- [x] T006 [US1] Integrate `selectedGameId` state and selection logic in `src/features/app/components/LobbyView.js`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Game-Aware Room Creation (Priority: P1)

**Goal**: Ensure room creation targets the correct game-specific collection.

**Independent Test**: Create a room with "Spy" selected and verify it appears in `spy_rooms`.

### Implementation for User Story 2

- [x] T007 [US2] Update CREATE GAME button and modal triggers in `src/features/app/components/LobbyView.js` to pass the `selectedGameId` context

**Checkpoint**: User Stories 1 AND 2 should now work together

---

## Phase 5: User Story 3 - Game-Aware Room Joining (Priority: P2)

**Goal**: Ensure room joining searches the correct game-specific collection.

**Independent Test**: Try to join a Spy room while having "Draw" selected; it should fail as expected.

### Implementation for User Story 3

- [x] T008 [US3] Update JOIN input handler in `src/features/app/components/LobbyView.js` to pass `selectedGameId` to the join action

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T009 Add "Coming Soon" interactive feedback/toasts for inactive games in `src/features/app/components/LobbyView.js`
- [x] T010 [P] Ensure horizontal scroll responsiveness for `GameSelector` on mobile widths in `src/features/app/components/LobbyView.js`
- [x] T011 Run final validation of the multi-game flow across all `Game Namespaces` (Acceptance: UI transition < 200ms on mid-tier devices)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: Depends on Setup (T001) - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational completion.
- **Polish (Final Phase)**: Depends on all user stories being complete.

### Parallel Opportunities

- T004 and T005 can be worked on in parallel within US1.
- Once Foundation is done, US1 work can proceed while US2 and US3 logic is prepared.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (`GAMES_CONFIG`).
2. Complete Phase 2: Foundational (Generic `RoomService` using `Game Namespace`).
3. Complete Phase 3: User Story 1 (Visual Switching).
4. **STOP and VALIDATE**: Verify UI updates.

### Incremental Delivery

1. Add US2: Creation logic.
2. Add US3: Joining logic.
3. Each step ensures "Are You the Spy?" remains 100% functional within its `Game Namespace`.
