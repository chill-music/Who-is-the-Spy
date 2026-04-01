# Research: PWA Codebase Bug Fixes & Stability Hardening

**Branch**: `003-codebase-bug-fixes` | **Generated**: 2026-04-01

---

## 1. Firestore Listener Lifecycle (FR-001, FR-002 — useOnboarding.js)

**Decision**: Capture the `onSnapshot` return value into a `ref` inside `useOnboarding`'s `handleOnboardingComplete` callback and store it in a module-level variable (or a `useRef`) that is cleaned up on the next invocation and in the hook's `useEffect` cleanup.

**Rationale**: The current code at `useOnboarding.js:89` calls `pendingNewUserRef.onSnapshot(...)` after `setPendingNewUserRef(null)`, discarding the unsubscribe handle entirely. Since `pendingNewUserRef` is still in closure scope at time of call (state setter is async), the call executes — but the returned unsubscribe function is never stored. A `useRef` for the handle is the idiomatic React pattern that survives re-renders and is accessible from cleanup.

**Alternatives considered**:
- *Re-raise to parent hook via return value*: overly complex, unnecessary prop drilling.
- *Listen only from `useAuthState`*: already establishes `unsubSnap` in `useAuthState.js:79` — but this is a separate listener for the **new** user's doc created during onboarding. The cleanest fix is to remove the inline `onSnapshot` entirely and rely on the existing `useAuthState` listener, which already calls `setUserData`.

**Finding**: `useAuthState.js:79` already attaches `var unsubSnap = userRef.onSnapshot(...)` inside its `onAuthStateChanged` callback, which IS returned as a cleanup. The onboarding inline `onSnapshot` at `useOnboarding.js:89` is therefore **a duplicate listener** — it can be deleted entirely. The `useAuthState` listener handles ongoing sync.

---

## 2. window.userData / window.currentUserData Never Assigned (FR-002, FR-003)

**Decision**: In `LuckyGamesHub.js`, immediately before calling each game's `start()`, assign `window.currentUserData = props.userData` (in addition to the existing game-specific assignments). This gives all game modules a reliable fallback for the second slot in their three-way chain without requiring changes to individual game files.

**Rationale**: The hub is already the single entry point for all four games. Adding one line per `useEffect` block is minimally invasive and aligns with the architecture assumption.

**Alternatives considered**:
- *Modify each game module to remove fallback chain*: requires editing 4 large IIFE files; higher risk for this pass.
- *Use a shared module export*: architectural refactor forbidden in this pass.

**Finding**: `window.currentUserData` is referenced in fallback chains in `LuckyFruitGame.js` at lines 304, 348, 606, 885, 1048. Setting it in the Hub before `start()` covers all of them.

---

## 3. Firestore Offline Persistence Enablement (FR-008 — Refund Queue)

**Decision**: Enable Firestore offline persistence via `firebase.firestore().enablePersistence({ synchronizeTabs: true })` in `01-config.js`, immediately after `var db = firebase.firestore()` on line 48.

**Rationale**: This is the SDK-level feature that queues pending writes to IndexedDB when offline and flushes them on reconnect. It must be called exactly once before any Firestore reads/writes. `synchronizeTabs: true` ensures multi-tab awareness. If persistence is already enabled (second call), the SDK throws a harmless `failed-precondition` that must be caught and ignored.

**Alternatives considered**:
- *localStorage queue*: more code, browser-storage limits, manual flush required.
- *Modular SDK `persistentLocalCache`*: not applicable — this project uses the compat SDK (CDN script, `firebase.firestore()`).

**Finding**: No `enablePersistence` call exists anywhere in the codebase. The `db` variable is declared in `01-config.js:48`. Persistence must be enabled immediately on that same line's scope before any collection reference is set up.

---

## 4. Pre-write UID Validation Against firebase.auth().currentUser.uid (FR-009)

**Decision**: Create a shared utility function `_assertUID(uid)` that compares `uid` with `firebase.auth().currentUser?.uid` and throws if they diverge. Attach it to `window.SecurityService` so all game modules can call it before any Firestore write.

**Rationale**: `window.SecurityService.applyCurrencyTransaction` is already the central write path for all currency changes in GreedyCat and Super777. Adding the check there means all four games benefit without needing individual changes to game files.

**Finding**: `SecurityService.applyCurrencyTransaction` at `01-config.js:754` is the write bottleneck. Adding a UID guard at the top of this function (before the batch) covers GreedyCat (`toggleBet`, `toggleSpecial`, `resolveRound`) and Super777. For LuckyFruitGame direct Firestore writes (outside SecurityService), the check must be added inline in those write call sites.

---

## 5. Firestore Connection State Guard for Spin Block (FR-007)

**Decision**: Use `firebase.firestore().enableNetwork()` status is not directly queryable. Instead, use the `.onSnapshot` error callback pattern: detect `code === 'unavailable'` and store a `window._firestoreOnline` boolean flag, updated by a lightweight heartbeat `onSnapshot` on a known always-present doc. Gate spin buttons by checking `window._firestoreOnline !== false`.

**Rationale**: Firestore does not expose a synchronous `isOnline()` API. The `navigator.onLine` browser property is unreliable (true even when Firestore is unreachable). Using an `onSnapshot` error handler provides the most accurate signal.

**Alternatives considered**:
- *`navigator.onLine`*: unreliable.
- *Disable network and catch errors*: not a read-before-spin approach; adds latency.
- *Heartbeat `.get()` with timeout*: adds round-trip latency on every spin attempt.

**Finding**: `LuckyGamesHub.js` initializes when the modal opens — a good point to attach a session-lifetime heartbeat listener on a Firestore doc (e.g., the app's public root doc). The listener sets `window._firestoreOnline = true/false` based on snapshot vs error. All game spin functions check this flag before deducting.

---

## 6. Timer Cleanup Audit (FR-005)

**Finding**: Audit of all four game `stop()` methods:

| Game | stop() clears timers | Orphaned timers |
|------|---------------------|-----------------|
| GreedyCatGame | `_ticker` interval only | `subscribeSync` creates 2 additional `onSnapshot` listeners (currency, results) with no stored unsub handles |
| LuckyFruitGame | `autoTimer`, `reelTickInterval` in `stop()` | `spinInterval` is a local var inside `spin()` — not stored; `bonusTimer` unnamed `setTimeout` |
| Super777Game | `spinIntervalAudio`, `autoTimer` | Anonymous `setTimeout` on win animation |
| SoccerStarGame | `timerInterval` in stop-like functions | `_rescueTimeout` partially tracked; `itv` in animation is local scope |

**Decision**: Reconcile all timer handles to module-level variables with a cleanup sweep in each `stop()` method. Only timers that live beyond a single function call scope need explicit tracking.

---

## 7. Silent Error Handler Replacement (FR-006)

**Finding**: `GreedyCatGame.js:264` has an empty `catch(e) {}` on `initNewRound` transactions (intentional — race condition guard documented with comment). This is an acceptable justified exception per constitution and should be documented rather than changed. All other empty catches in `toggleBet:674`, `toggleSpecial:693` already have `console.error` calls. `_writeRoundWinner:370` also has `console.error`. 

**Action**: Scan remaining games (LuckyFruitGame, Super777) for empty catches without logging — these need `console.error` added.
