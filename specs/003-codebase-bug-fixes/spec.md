# Feature Specification: PWA Codebase Bug Fixes & Stability Hardening

**Feature Branch**: `003-codebase-bug-fixes`  
**Created**: 2026-04-01  
**Status**: Draft  
**Input**: User description: "Fix remaining bugs, silent failures, listener leaks, and dead code across the PWA codebase"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unsubscribed Firestore Listener After Onboarding (Priority: P1)

After a brand-new user completes the onboarding flow (picks name, gender, country), a Firestore `onSnapshot` listener is attached to their user document — but the unsubscribe function is never captured or called. This means the listener is permanently active for the rest of the browser session, receiving every future document update even when the user logs out or changes. If onboarding is triggered again (e.g., the user logs out and back into a new account in the same session), a second competing listener is created on top of the first.

**Why this priority**: This is a session-level memory/listener leak that can cause stale data writes (`setUserData`) to fire on a React component that may have already been unmounted or re-initialised with a different user's state.

**Independent Test**: Can be fully tested by (1) completing onboarding as a new user, (2) logging out, then (3) re-authenticating as a different account. The old listener should NOT emit any further updates for the first user's document.

**Acceptance Scenarios**:

1. **Given** a user completes onboarding, **When** the `handleOnboardingComplete` function runs, **Then** the returned `onSnapshot` unsubscribe function is stored and called on any subsequent re-run or on component unmount.
2. **Given** a user logs out, **When** a new session begins, **Then** no listener from the previous session continues to fire `setUserData`.

---

### User Story 2 - window.currentUserData / window.userData Are Never Written (Priority: P1)

The Lucky Games suite (LuckyFruitGame, Super777Game, GreedyCatGame, SoccerStarGame) all access user identity via a three-part fallback chain: `window.lfGameUserData || window.userData || window.currentUserData`. The `window.lfGameUserData` / `window.s7GameUserData` globals are correctly set by `LuckyGamesHub.js` at game start. However, `window.userData` and `window.currentUserData` are **never assigned anywhere in the app** — `currentUserData` is a computed `useMemo` inside the React closure and never exported to `window`. This means the fallback to the second and third globals always resolves to `undefined`, making the fallback chain provide zero protection if `lfGameUserData` is stale or absent.

**Why this priority**: If a game starts before `LuckyGamesHub` can set `window.lfGameUserData` (e.g. on rapid open), all currency transactions will find no UID and silently skip the Firestore deduction. The user gets a free spin.

**Independent Test**: Can be tested by opening a Lucky Game immediately after a cold page load (before auth fully resolves). All currency deductions should still execute correctly, or the spin button should be disabled until UID is available.

**Acceptance Scenarios**:

1. **Given** a logged-in user opens Lucky Games, **When** any game's currency deduction runs, **Then** a valid UID is always resolved and the deduction is applied.
2. **Given** the hub sets `window.lfGameUserData`, **When** a game module reads it, **Then** the UID from that object is the same as the authenticated user's UID.

---

### User Story 3 - Orphaned onSnapshot in useOnboarding After pendingNewUserRef Reset (Priority: P2)

Inside `handleOnboardingComplete`, after the new user document is written, `setPendingNewUserRef(null)` is called to clear the ref from state — but then *immediately after*, the code creates a new inline `pendingNewUserRef.onSnapshot(...)` listener using the ref that was just nulled out. This listener has no associated unsubscribe handle exposed to the component's cleanup cycle. The listener is permanent for the session.

**Why this priority**: Creates a secondary competing user-data listener that fires in parallel with the main listener set up in `useAuthState`, potentially causing race conditions when both call `setUserData` at different times.

**Acceptance Scenarios**:

1. **Given** onboarding completes, **When** the new user's document is updated by any system, **Then** `setUserData` is called exactly once per update (not twice from competing listeners).
2. **Given** the onboarding listener is created, **When** the user logs out, **Then** the listener is unsubscribed without throwing an error.

---

### User Story 4 - LuckyFruitGame Writes to window.currentUserData & window.userData Mutably (Priority: P2)

`LuckyFruitGame.js` lines 1174–1176 directly mutate `window.lfGameUserData.lastWheelSpin`, `window.userData.lastWheelSpin`, and `window.currentUserData.lastWheelSpin`. Since `window.userData` and `window.currentUserData` don't exist (see Story 2), these assignments silently fail or write to undefined. More critically, directly mutating a shared global object that may reference the same object as React's `userData` state will cause silent, non-reactive state mutations — meaning components that depend on `lastWheelSpin` to gate the bonus wheel won't re-render, and the wheel could be spun multiple times without the cooldown enforcing correctly.

**Why this priority**: The bonus wheel cooldown is a monetisation guard, not just a UX detail. Silent failures here mean users can abuse free spins.

**Acceptance Scenarios**:

1. **Given** a user spins the bonus wheel, **When** they close and reopen the game, **Then** the wheel is correctly locked for the cooldown period.
2. **Given** `window.lfGameUserData` is set, **When** `lastWheelSpin` is updated, **Then** the update is also persisted to Firestore and not just to the in-memory object.

---

### Edge Cases

- **Offline / Firestore unreachable during spin**: The spin action is blocked before executing; the user sees a user-facing error message explaining that the game is temporarily unavailable. No currency is deducted and no spin result is shown. (See FR-007)
- How does the system handle a new user completing onboarding when the Firestore write fails (e.g. permissions error)?
- What happens if a user rapidly opens and closes the Lucky Games hub — are old game setInterval/setTimeout timers cleaned up?
- How does the app behave if `window.useUserListeners` or `window.useGameActions` is not yet defined when `10-app.js` runs?
- **Mid-flight Firestore write failure**: If the spin has been initiated and the Firestore currency deduction call fails after execution begins, the deducted currency MUST be refunded to the player and an error message displayed. (See FR-008)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `handleOnboardingComplete` function MUST capture the return value of `pendingNewUserRef.onSnapshot(...)` and expose it for cleanup when the component unmounts or the user logs out.
- **FR-002**: `window.currentUserData` MUST be kept in sync with the React `currentUserData` computed value at all times during a session, so that non-React game modules can reliably read the current authenticated user's data.
- **FR-003**: All Lucky Games modules MUST resolve the current user's UID through a single, authoritative source rather than a three-level window-global fallback chain, to eliminate silent UID-missing failures.
- **FR-004**: The bonus wheel cooldown timestamp (`lastWheelSpin`) MUST be persisted to Firestore immediately after a spin, not just written to an in-memory window object.
- **FR-005**: All `setInterval` and `setTimeout` handles created by game modules (LuckyFruitGame, Super777Game, SoccerStarGame, GreedyCatGame) MUST be cleared when the game's `stop()` function is called, to prevent timers firing on unmounted UI.
- **FR-006**: Silent `.catch(() => {})` handlers on critical Firestore write operations (currency deductions, history writes, stat updates) MUST log the error to the browser console at minimum, so failures are observable during QA.
- **FR-007**: Before initiating any spin action, all Lucky Games modules MUST verify Firestore reachability (or connection state). If Firestore is unreachable, the spin MUST be blocked and a user-facing error message MUST be displayed. No currency deduction or spin result is generated.
- **FR-008**: If a Firestore currency deduction write fails after the spin has been initiated (mid-flight error), the deducted amount MUST be refunded to the player's local balance immediately, and a user-facing error message MUST be displayed. The refund write MUST be queued via Firestore offline persistence (IndexedDB), which will automatically apply it to Firestore once connectivity is restored — even across browser sessions.
- **FR-009**: Immediately before every Firestore write that involves currency, history, or stat updates, all Lucky Games modules MUST validate that the UID read from the window global matches `firebase.auth().currentUser.uid`. If they diverge, the write MUST be aborted and a `console.error` logged.

### Key Entities

- **UserSession**: The currently authenticated user's data object, currency balance, and UID — must be consistent between React state and the window globals read by game modules.
- **GameTimer**: Any `setInterval` or `setTimeout` handle created during a game session — must have a lifecycle tied to the game session and be cleared on stop.
- **OnboardingListener**: The Firestore `onSnapshot` subscription created after new-user document creation — must have an explicit unsubscribe lifecycle.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero orphaned Firestore listeners remain active after a user logs out and back in, as measurable by the Firestore console's active listener count.
- **SC-002**: Currency deductions execute successfully (verified in Firestore) for 100% of spins when the game is opened within 3 seconds of page load.
- **SC-003**: The bonus wheel cooldown is enforced correctly across 100% of reopens and refreshes — no user can spin more than once per cooldown period.
- **SC-004**: All `setInterval` timers created by Lucky Games are cleared within 500ms of the hub being closed, with zero console errors referencing unmounted DOM elements.
- **SC-005**: Any Firestore write failure during gameplay produces at minimum a `console.error` log visible during QA sessions.
- **SC-006**: No Firestore write involving currency, history, or stats executes using a UID that does not match the currently authenticated user's UID; any mismatch aborts the write and logs a `console.error`.

## Assumptions

- All fixes operate primarily within the existing IIFE + window-global architecture. React hook or component edits are permitted **only** when directly required by a listed Functional Requirement (e.g. FR-001 listener cleanup inside `useOnboarding`). No new hooks, contexts, or components may be introduced in this pass.
- `LuckyGamesHub.js` is the authoritative point where `currentUserData` should be synced to the window globals before any game module starts.
- The Firestore security rules correctly reject transactions from unauthenticated users — the fixes focus on ensuring the client-side code never silently skips a transaction due to a missing UID.
- `setInterval`/`setTimeout` cleanup is the responsibility of each individual game's `stop()` method, not the hub.
- Mobile performance requirements apply: timer management and listener cleanup are important on low-memory devices where background processes may be aggressively terminated.
- Firestore offline persistence (via `enableIndexedDbPersistence` or the modular `persistentLocalCache` option) is enabled in the Firebase SDK initialisation, allowing queued writes (including refunds) to survive browser close and be applied on reconnection.

## Clarifications

### Session 2026-04-01

- Q: What should happen when Firestore is unreachable during a spin action? → A: Block the spin entirely; show a user-facing error message. No currency is deducted and no spin result is generated.
- Q: What should happen if a Firestore write fails mid-flight after a spin is initiated? → A: Show an error message and refund the deducted currency to the player.
- Q: How should pending refund writes be persisted if the user closes the browser before reconnecting? → A: Use Firestore offline persistence (IndexedDB) to queue writes automatically; they apply on reconnection across sessions.
- Q: Should game modules have client-side protection against window global UID spoofing? → A: Yes — validate the UID from the window global against `firebase.auth().currentUser.uid` immediately before every Firestore write; abort and log if they diverge.
- Q: Is React hook/component editing allowed in this fix pass? → A: Limited — React edits are permitted only when directly required by a listed FR; no new hooks or components may be introduced.
