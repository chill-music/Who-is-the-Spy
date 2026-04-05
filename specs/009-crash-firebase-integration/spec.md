# Feature Specification: Crash Game Firebase Integration

**Feature Branch**: `009-crash-firebase-integration`
**Created**: 2026-04-05
**Status**: Refined
**Input**: Integrate crash game with Firebase. Requirements expanding to real-time balance sync, global 16-second round loop, anti-cheat, high-fidelity Jackpot system matching reference, History Array logic, and tilted canvas rendering.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time Balance Synchronization (Priority: P1)
As a player, I want to see my actual account balance updated in real-time within the Crash game so that I always know exactly how much I have available to bet.
**Acceptance**
1. Given a logged-in user, their exact Firebase `balance` is actively displayed and reacts instantly to remote changes.

### User Story 2 - Secure Betting and Claiming (Priority: P1)
As a player, I want to securely place bets and claim my winnings using atomic Firebase functionality.
**Acceptance**
1. Betting triggers an `increment(-bet)` operation to deduct balance safely.
2. An insufficient balance prevents the bet.
3. Claiming winnings accurately adds `increment(winAmount)` to the DB.

### User Story 3 - Anti-Cheat and Disconnect Protection (Priority: P1)
As a player, I want my active bets accurately resolved if I disconnect, so that I cannot exploit it to skip losses.
**Acceptance**
1. Deductions happen universally right when the bet is placed.
2. If connection is lost during a flight and the user never claims, the game accurately registers it mathematically as a loss.

### User Story 4 - Global 16-Second Timer & Round Sync (Priority: P1)
As a player, I want to participate in a synchronized worldwide game loop where the rocket starts and crashes at the precise exact coordinated time for everyone.
**Acceptance**
1. The game references a central db state representing a deterministic 16-second countdown.
2. `crash_multiplier` is respected universally.

### User Story 5 - High-Fidelity Jackpot System (Priority: P2)
As a community member, I want to contribute to and potentially win a massive global Jackpot pool that accumulates as we play.
**Acceptance**
1. Clicking "Jackpot" opens a modal perfectly matching the provided reference image (UI/design layout).
2. Users see their `jackpot_progress` accumulate (e.g. +0.68x) aiming towards 80,000x.
3. The system maps the 10%, 30%, 70% bet distribution bounds accurately to the prize pools.

### User Story 6 - Historical Records Viewer (Priority: P2)
As a strategist, I want a log of the last 20 outcomes clearly tagged with the newest events.
**Acceptance**
1. Clicking the `↗` arrow successfully parses the `crash_game/history` DB route and displays the top 20 items.
2. The most recent log receives a distinct "NEW" tag exactly matching requirements.

### User Story 7 - Tilted Rocket Visual Overhaul (Priority: P2)
As an immersed player, I expect the rocket to physically tilt along its calculated trajectory rather than moving horizontally.
**Acceptance**
1. Canvas computes tangential arc paths so the rocket rotates diagonally upwards.
2. The exhaust flames strictly align behind the rotated nose vector.

### User Story 8 - Consistent Player Immersion and Avatar Integration (Priority: P3)
As a user, I want my active platform Avatar and Avatar-Frame substituted into the game removing legacy static elements.
**Acceptance**
1. Global `16-main.js` Luck Games routing injects safely to Crash.
2. Static "309MS" design string and `🏠` icon are deleted.
3. `<Avatar>` component loads with frame logic and triggers `openProfile()` on click.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST sync user balance via `onSnapshot` incrementing natively.
- **FR-002**: System MUST deduct bet amounts before accepting a bet.
- **FR-003**: System MUST reject bets if funds are insufficient via UI toast error.
- **FR-004**: System MUST calculate winnings and atomic increments safely.
- **FR-005**: System MUST implicitly enforce a round loss upon user disconnect (by tracking upfront deduction without requiring a cleanup mechanism).
- **FR-006**: System MUST bind identically to a globally broadcasted `16-second` database loop determining crash logic simultaneously.
- **FR-007**: System MUST render exactly the Jackpot UX constraints (Modals, Math tracking, Progress bars, Distribution ratios).
- **FR-008**: System MUST rotate the graphic via `atan2` Math on the `<canvas>`.
- **FR-009**: System MUST display an array of up to 20 database Historical entries, marking the head index as "NEW".

## Success Criteria *(mandatory)*
- All 8 User Stories operate independently.
- Jackpot rules match image rules word-for-word.
- Crash logic synchronization operates safely alongside the new Avatar overrides.
