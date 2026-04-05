# Tasks: 007-shop-leaderboard-redesign

**Input**: Design documents from `/specs/007-shop-leaderboard-redesign/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create CSS structure for `.shop-standard-item` in `vip.css`
- [x] T002 Define `.portrait-effect-container` with 9:16 aspect ratio in `vip.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T003 [P] Implement base rarity glow animations in `vip.css`
- [x] T004 [P] Create shared CSS variables for shop item dimensions and padding in `vip.css`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Unified Shop & Effects Experience (Priority: P1) 🎯 MVP

**Goal**: Align BFF Effects UI with the main Shop design for consistency.

**Independent Test**: Navigate between Shop and BFF Effects; both should use the same card styles and hover effects.

### Implementation for User Story 1

- [x] T005 [US1] Refactor `ShopModal` grid items to use `.shop-standard-item` class in `src/08-components-shop.js`
- [x] T006 [US1] Apply `.shop-standard-item` to BFF Tokens tab in `src/08-components-shop.js`
- [x] T007 [US1] Update `BFFModal.js` to use `.shop-standard-item` for relationship/effect cards in `src/features/bff/BFFModal.js`

**Checkpoint**: Shop and BFF UI unified.

---

## Phase 4: User Story 3 - Premium "Top 3" Leaderboard (Priority: P1)

**Goal**: Implement a side-by-side Top 3 podium with layered assets.

**Independent Test**: Open any ranking view (Wins/Charisma/Family) and verify the 2-1-3 layout with frame overlays.

### Implementation for User Story 3

- [x] T008 [US3] Implement `podium-new` side-by-side (2-1-3) layout in `src/features/app/components/RankingView.js`
- [x] T009 [US3] Integrate leaderboard top frame assets as absolute-positioned overlays in `src/features/app/components/RankingView.js`
- [x] T010 [US3] Configure z-index layering for avatars behind podium frames in `src/features/app/components/RankingView.js`
- [x] T011 [US3] Add 1st place scaling logic (1.25x) in `src/features/app/components/RankingView.js`
- [x] T012 [US3] Implement medal icons and rank-specific styling in `src/features/app/components/RankingView.js`

**Checkpoint**: Ranking podium implemented.

---

## Phase 5: User Story 2 - Portrait Support (Priority: P2)

**Goal**: Support high-resolution vertical animated effects in the shop grid.

**Independent Test**: View a vertical effect in the shop; it should fit without cropping in a 9:16 container.

### Implementation for User Story 2

- [x] T013 [US2] Update `profileEffects` tab parsing to detect vertical animations in `src/08-components-shop.js`
- [x] T014 [US2] Wrap animated profile effects in `.portrait-effect-container` in `src/08-components-shop.js`
- [x] T015 [US2] Ensure `object-fit: contain` is applied to portrait GIF/video previews in `src/08-components-shop.js`

**Checkpoint**: Portrait support complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements and mobile responsiveness.

- [x] T016 [P] Add mobile responsiveness media queries for the new podium in `vip.css`
- [x] T017 [P] Clean up deprecated inline styles in `src/08-components-shop.js`
- [x] T018 Run `quickstart.md` validation scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
- **Polish (Final Phase)**: Depends on all user stories being complete.

---

## Implementation Strategy

### MVP First (User Story 1 & 3 Only)

1. Complete Phase 1 & 2 (Setup & Foundational).
2. Complete Phase 3 (US1: Unified Shop).
3. Complete Phase 4 (US3: Ranking Podium).
4. **STOP and VALIDATE**: Test US1 and US3 independently.

### Incremental Delivery

1. Foundation ready.
2. Add Unified Shop → Test → Demo.
3. Add Ranking Podium → Test → Demo.
4. Add Portrait Support → Test → Demo.
