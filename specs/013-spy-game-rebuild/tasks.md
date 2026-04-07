# Tasks: Who is the Spy? Game Rebuild

**Input**: Design documents from `/specs/013-spy-game-rebuild/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create directory `src/features/spy-rebuild/`
- [x] T002 [P] Create 5 skeleton files with IIFE patterns and `SpyGameCore` initialization in `src/features/spy-rebuild/`
- [x] T003 Implement `window.SpyGame.mount` & `unmount` logic with Google Fonts injection in `src/features/spy-rebuild/SpyGame-ui.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core configuration, word bank, and shared utility logic

- [x] T004: Initialize `SpyGame-config.js` with global bus (IIFE)
- [x] T005: Implement `GAME_CONFIG` constants and CSS variables
- [x] T006: Implement complete 600-word bank (15 categories x 40 words)
- [x] T007: Implement core helpers (`shuffle`, `fuzzyMatch`, `roomCode`, etc.)
- [x] T008: Implement `I18N` translations for EN and AR
- [x] T009: Verify `SpyGameCore.state` exposure and initialization logs
- [x] T010: Setup `SpyGame-firebase.js` with Firestore collection refs
- [x] T011: Implement `SoundEngine` with high-fidelity asset mapping (PWA synth methods) in `src/features/spy-rebuild/SpyGame-ui.js`
- [x] T012 [P] Implement the base `Router` and Page Transition container in `src/features/spy-rebuild/SpyGame-ui.js`

---

## Phase 3: User Story 1 - Offline MVP Mode (Priority: P1) 🎯 MVP

**Goal**: Complete "Play Together" loop on a single device without internet

- [x] T013 [US1] Implement offline state machine logic: `initGame`, `nextDistribute`, `acknowledgeWord` in `src/features/spy-rebuild/SpyGame-offline.js`
- [x] T014 [P] [US1] Build shared UI components: `PlayerCard` and `HoldToReveal` (4s timer) in `src/features/spy-rebuild/SpyGame-ui.js`
- [x] T015 [US1] Implement `OfflineSetupScreen` and `OfflineDistributeScreen` in `src/features/spy-rebuild/SpyGame-offline.js`
- [x] T016 [US1] Implement `HomeScreen` with AR/EN toggle and How to Play BottomSheet in `src/features/spy-rebuild/SpyGame-ui.js`
- [x] T017 [US1] Implement `OfflineDiscussScreen`, `OfflineVoteScreen`, and `OfflineRevealScreen` logic.

---

## Phase 4 · Online Multiplayer (Firestore)

**Goal**: Full real-time multiplayer with secure role distribution and host migration.

- [x] T018 [US2] Implement room lifecycle services: `createRoom` (alphanumeric 6-char), `joinRoom`, `leaveRoom` in `SpyGame-firebase.js`
- [x] T019 [P] [US2] Implement `startGame` logic (Host-only): word distribution and batch write to `roles` subcollection.
- [x] T020 [US2] Implement `Presence` system: `heartbeat` (15s) and `electNewHost` (via `db.runTransaction`) in `SpyGame-firebase.js`
- [x] T021 [US2] Implement `useRoom` hook in `SpyGame-online.js` with client-side `spyUids` shielding.
- [x] T022 [US2] Build Online UI Screens: `OnlineLobbyScreen`, `OnlinePlayScreen` (Distribute/Discuss/Vote/Reveal) in `SpyGame-ui.js`
- [x] T023 [P] [US2] Implement real-time voting sync and host-driven phase transitions.

---

## Phase 5: User Story 4 - Voting & Reveal (Priority: P1)

**Goal**: Dramatic voting sequence and animated spy reveal

- [x] T023 [US4] Implement `submitVote` and `triggerReveal` (accusedUid logic) in `src/features/spy-rebuild/SpyGame-firebase.js`
- [x] T024 [P] [US4] Build `CountdownRing` (SVG), `VoteBar`, and `SpyRevealCard` (flip) components in `src/features/spy-rebuild/SpyGame-ui.js`
- [x] T025 [US4] Implement `OnlineVoteScreen` and `OnlineRevealScreen` (sync reveal sequence) in `src/features/spy-rebuild/SpyGame-online.js`

---

## Phase 5: Scoring, Polish & Confetti

**Goal**: Atomic scoring, Spy guessing, and animated final leaderboard.

- [x] T026 [US5] Implement `calculateAndVoteScores` (Batch write) and `submitSpyGuess` (fuzzy match) in `SpyGame-firebase.js`
- [x] T027 [US5] Update `submitVote` to store individual voter choices for accurate bonus calculation.
- [x] T028 [US5] Build `SpyLastChanceGuess` UI and `BonusVoteScreen` (Most Convincing Clue) in `SpyGame-ui.js`
- [x] T029 [US5] Implement `FinalLeaderboardScreen` (slide-in animations, count-up numbers, crown) in `SpyGame-ui.js`
- [x] T030 [P] [US5] Develop `ConfettiManager` (Canvas-based) and trigger only on winner's device.
- [ ] T031 [P] [Manual] Verify all scoring rules and tie-breaking logic.
- [x] T031 [P] [Manual] Verify all scoring rules and tie-breaking logic.


---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Refinement, resilience, and final compliance checks.

- [x] T032: [Audit] RTL Mirror Review (verify flex layout gap and Cairo inheritance) in `SpyGame-ui.js`
- [x] T033: [Logic] Implement `_withRetry` (3 attempts) utility and wrap `submitVote` and `submitSpyGuess`.
- [x] T034: [Performance] Fix `useRoom` effect dependencies and host-side maintenance logic in `SpyGame-online.js`.
- [x] T035: [Hygiene] Final Constitutional Hygiene: Remove diagnostic `console.log` and verify zero unused code.
- [ ] T036: [P] Final Manual Validation Lifecycle on 3 simulated clients.



---

## Dependencies & Execution Order

- **Phase 1-2**: Foundation must be laid first.
- **Phase 3 (Offline MVP)**: High priority. Playable locally.
- **Phase 4-5 (Online)**: Requires Phase 1-2.
- **Phase 6 (Scoring)**: Final step.

### Parallel Opportunities
- Offline vs Online development.
- Component building while logic is being written.
- SoundEngine and I18N setup are independent.

