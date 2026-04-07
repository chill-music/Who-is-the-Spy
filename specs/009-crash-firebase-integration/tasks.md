# Tasks: Crash Game Firebase Integration

**Input**: Design documents from `/specs/009-crash-firebase-integration/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Organization**: Tasks are grouped by user story logically expanded from the updated Implementation Plan priorities to enable independent implementation and testing of each conceptual block.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Open `CrashGame.jsx` and identify structural components to inject Firebase hooks via `window.AppHooks`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 Remove the static `309MS` text and the blue `🏠` icon to clean up the workspace in `CrashGame.jsx`.

**Checkpoint**: Foundation ready - Firebase logic and layout cleanup are primed.

---

## Phase 3: User Story 1 - Real-Time Validation & Balance Sync (Priority: P1)

**Goal**: Seamlessly bind the game module to the global database user account object using correct Firebase increments.

### Implementation for User Story 1

- [ ] T003 [US1] Apply `onSnapshot` to listen to `users/{uid}` directly inside a `useEffect` inside `CrashGame.jsx`.
- [ ] T004 [US1] Update local UI labels to display dynamic Firebase balance strictly instead of React context variables.

**Checkpoint**: Account syncing functions precisely.

---

## Phase 4: User Story 2 - Secure Betting and Claiming (Priority: P1)

**Goal**: Atomically deduct and add funds correctly using backend increments.

### Implementation for User Story 2

- [x] T005 [US2] Update `placeBet` to deduct balance securely using `increment(-betInput)`.
- [x] T006 [US2] Append strict logic rejecting play if the user has insufficient balance, injecting a user toast/feedback UI.
- [x] T007 [US2] Update `doClaimRef.current` logic to increment user account securely with `increment(winAmount)`.

---

## Phase 5: User Story 3 - Anti-Cheat & Disconnect Protection (Priority: P1)

**Goal**: Secure betting resolution upon dropped connections.

### Implementation for User Story 3

- [ ] T008 [US3] Verify client state machine unconditionally forfeits the bet locally if un-claimed upon component unmount (`useEffect` cleanup handling to lock DB increment states accurately on exit).

---

## Phase 6: User Story 4 - Global Round States & 16-Second Timer (Priority: P1)

**Goal**: Bind all players to a single deterministic 16-second round loop pulled directly from a DB source.

### Implementation for User Story 4

- [x] T009 [P] [US4] Implement a master listener for `crash_game/state` (or equivalent global store) inside `CrashGame.jsx`.
- [x] T010 [US4] Override local timeout logic so that the `countdown` strictly binds to the globally broadcasted timestamps matching the exact 16-second loop.
- [x] T011 [US4] Extract `crash_multiplier` securely from the synchronized round object.

---

## Phase 7: User Story 5 - High-fidelity Jackpot System Modal (Priority: P2)

**Goal**: Introduce a community accumulating Jackpot UI matching the user's uploaded snapshot, tethered to the DB.

### Implementation for User Story 5

- [x] T012 [P] [US5] Build the exact Jackpot dialog (`<JackpotModal />`) capturing text definitions, standard percentage distribution boxes (10%, 30%, 70%), and layout logic identically as outlined in the image reference.
- [x] T013 [US5] Bind the Jackpot top bar counter functionally to `crash_game/jackpot`.
- [x] T014 [US5] Program mathematical accumulator (`+0.68x` logic) into user success claims, saving to `users/{uid}/jackpot_progress`.
- [ ] T015 [US5] Build the dynamic `Leaderboard` UI component by replacing placeholders (#1 Ninja2, etc.) and fetch the real top 3 highest-multiplier winners from a new database section.

---

## Phase 8: User Story 6 - Historical Records Array (Priority: P2)

**Goal**: Add history lookups for players mapping real crashes.

### Implementation for User Story 6

- [x] T016 [P] [US6] Listen to `crash_game/history` resolving an array of up to 20 past multipliers.
- [x] T017 [US6] Make the `↗` arrow clickable, firing a modal that lists these 20 Historical results correctly assigning the "NEW" ping tag to index 0.

---

## Phase 9: User Story 7 - Visual Upgrade & Tilted Rocket (Priority: P2)

**Goal**: Rotate the rocket so it physically points upwards along the plotted vector while rendering the exhaust fire appropriately.

### Implementation for User Story 7

- [x] T018 [P] [US7] Modify `drawScene()` mathematically to calculate the tangential arc slope `Math.atan2(dy, dx)`.
- [x] T019 [US7] Update stroke translation `ctx.rotate(angle)` so the rocket nose perfectly tracks the rising trajectory line.
- [x] T020 [US7] Adjust exhaust and `halo` gradient renders locally strictly onto `lx, ly` reflecting fire shooting backward relative to trajectory.
- [ ] T020a [US7] Adjust canvas translation coordinates to ensure the rocket draws exactly on top of the path line (not sideways) matching the image.

---

## Phase 10: User Story 8 - Avatar & External Navigation (Priority: P3)

**Goal**: Solidify UX immersion with centralized navigation and profile rendering.

### Implementation for User Story 8

- [x] T021 [P] [US8] Update global routing in `16-main.js` (or appropriate layout file) to link the `CrashGame` naturally into the 'Luck Games' unified UI panel.
- [x] T022 [P] [US8] Embed `Avatar` component (or `img`) bound to `user.avatar` with their explicit `avatarFrame` mapping clicking behavior natively to `openProfile(uid)` inside `CrashGame`.

---

## Phase 11: User Story 9 - Arabic Language Localization (Priority: P2)

**Goal**: Support real-time Arabic text switching using the `lang` prop.

### Implementation for User Story 9

- [ ] T023 [US9] Audit all English strings in `CrashGame` and replace with ternary `lang === 'ar' ? '...' : '...'` logic, without causing data loss or modifying active logic.
