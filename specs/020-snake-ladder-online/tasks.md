# Task Breakdown: Snake & Ladder Pro Integration

## Phase 1: Environment & Integration Fixes
- [x] Create folder structure.
- [x] Update `GAMES_CONFIG` logo path in `src/01-config.js`.
- [x] **[FIX] Global Registry**: Modify `GlobalModals.js` for dynamic setup.
- [x] **[NEW] Mode Selector**: Create `SnakeLadderModeSelector.js`.
- [x] Update `src/16-main.js` to include the new selector.

## Phase 2: Game Logic & Service Setup
- [ ] Refine `src/features/snake-ladder/SnakeLadderEngine.js`:
    - [x] Base class implementation.
    - [ ] Update snakes/ladders map to `SNAKES_AND_LADDERS_01`.
    - [ ] Implement "6 gives another turn" logic in `executeTurn`.
    - [ ] Implement "Capture" logic (reset opponent on same square to 0).
    - [ ] Improve Bot AI execution (handle automatic rolls).
- [ ] Refine `src/features/snake-ladder/SnakeLadderService.js`:
    - [ ] Implement `submitMove` with event logs for sound triggers.
    - [ ] Ensure `findActiveMatch` supports re-joining rooms.

## Phase 3: Matchmaking System
- [ ] Refine `src/components/services/MatchmakingService.js`:
    - [ ] Implement `discoverAndMatch` for `snake_ladder_pro`.
    - [ ] Add 15s timeout for "Add Bots" button in overlay.
- [ ] Update `src/features/app/components/LobbyView.js` to ensure fee check before queue.

## Phase 4: UI Development (Grid & Animations)
- [ ] Implement `src/features/snake-ladder/SnakeLadderView.js`:
    - [ ] 10x10 responsive grid layout using CSS Grid.
    - [ ] Z-pattern position mapping for pieces.
    - [ ] Dice roll animation (3D effect or sprite map).
    - [ ] Token "bouncing" animation for movement.
    - [ ] Audio integration for roll, move, snake, and ladder.

## Phase 5: Verification & Polish
- [ ] **G1: Security**: Implement entry fee deduction via `SecurityService`.
- [ ] Multi-player verification (Sync test).
- [ ] Bot vs Human balance check.
- [ ] Responsive design audit for mobile.
