# Data Model: PWA Codebase Bug Fixes & Stability Hardening

**Branch**: `003-codebase-bug-fixes` | **Generated**: 2026-04-01

---

## Entities

### UserSession *(pre-existing — changes only)*

The currently authenticated user's data object as held in React state and propagated to game modules via `window.lfGameUserData` / `window.currentUserData`.

```
UserSession {
  uid:           string   — Firestore document ID (authoritative identity key)
  displayName:   string
  photoURL:      string | null
  currency:      number   — game coin balance
  lastWheelSpin: Timestamp | null  — bonus wheel cooldown anchor
}
```

**Changed constraints**:
- `window.currentUserData` MUST be kept in sync with the React `currentUserData` value, set by `LuckyGamesHub.js` before each game `start()` call.
- Before any Firestore currency write, the `uid` from window globals MUST equal `firebase.auth().currentUser.uid`. If they diverge, the write is aborted.

---

### OnboardingListener *(new entity)*

A Firestore `onSnapshot` subscription handle created during `handleOnboardingComplete`.

```
OnboardingListener {
  unsubscribeFn:  Function | null  — stored in useRef; called on next invocation or hook cleanup
  target:         DocumentReference — the pendingNewUserRef document
  status:         'active' | 'cleaned_up'
}
```

**Lifecycle**:
- Created: end of `handleOnboardingComplete` (if kept at all — research proposes removing it entirely in favour of the existing `useAuthState` listener)
- Destroyed: component unmount OR next `handleOnboardingComplete` invocation

**Decision from research**: The inline `onSnapshot` at `useOnboarding.js:89` is a **duplicate** of the listener already established in `useAuthState.js`. It should be **deleted**, eliminating the entity entirely from this component.

---

### GameTimer *(pre-existing — formalised)*

Any `setInterval` or `setTimeout` handle created during a game session.

```
GameTimer {
  handle:   number   — return value of setInterval / setTimeout
  type:     'interval' | 'timeout'
  owner:    'GreedyCatGame' | 'LuckyFruitGame' | 'Super777Game' | 'SoccerStarGame'
  purpose:  string   — descriptive label (ticker, autoSpin, reelTick, etc.)
}
```

**Lifecycle**:
- Created: game `start()` or sub-function
- Destroyed: corresponding game `stop()` — MUST clear handle within 500ms of hub close (SC-004)

**Module-level handle variables (named by game):**

| Game | Timers to track in module scope |
|------|--------------------------------|
| GreedyCatGame | `_ticker` (interval) |
| LuckyFruitGame | `reelTickInterval` (interval), `autoTimer` (timeout) |
| Super777Game | `spinIntervalAudio` (interval), `autoTimer` (timeout) |
| SoccerStarGame | `timerInterval` (interval), `_rescueTimeout` (timeout) |

---

### FirestoreConnectionState *(new entity)*

A lightweight session-level flag that tracks whether Firestore is reachable.

```
FirestoreConnectionState {
  window._firestoreOnline:  boolean | undefined
    — undefined = not yet determined (treat as unknown, allow spin)
    — true      = Firestore reachable
    — false     = Firestore offline / unreachable → block spin, show error
}
```

**Lifecycle**:
- Created: `LuckyGamesHub.js` on modal open — attaches `onSnapshot` listener on public root doc
- Updated: on snapshot success → `true`; on snapshot error with code `'unavailable'` → `false`; on reconnect → `true`
- Destroyed: hub modal close — unsubscribe the heartbeat listener

---

### CurrencyTransaction *(unchanged shape — constraint additions only)*

Firestore document written to `goldLogCollection` by `SecurityService.applyCurrencyTransaction`.

**New constraints (from FR-008, FR-009)**:
- If mid-flight write fails, the amount MUST be locally refunded to `S.balance` before the error is shown to the user.
- Write is aborted (and `console.error` logged) if the supplied `uid` ≠ `firebase.auth().currentUser.uid`.
- Firestore offline persistence ensures any queued writes are flushed on reconnect automatically via IndexedDB.

---

## State Transitions

### Spin Action State Machine

```
[IDLE]
  │
  ▼ User taps spin
[CONNECTIVITY CHECK]
  │── window._firestoreOnline === false ──▶ [BLOCKED] → show error toast → [IDLE]
  │── window._firestoreOnline !== false
  ▼
[UID VALIDATION]
  │── uid mismatch ──▶ [ABORTED] → console.error → [IDLE]
  │── uid ok
  ▼
[DEDUCTING CURRENCY]
  │── SecurityService.applyCurrencyTransaction throws ──▶ [REFUND] → update S.balance + show error → [IDLE]
  │── success
  ▼
[SPINNING ANIMATION]
  │
  ▼ result resolved
[APPLYING WIN / LOSS]
  │
  ▼
[PERSISTING lastWheelSpin] (bonus wheel only)
  │── Firestore write fails ──▶ queued by offline persistence → auto-applied on reconnect
  │── success
  ▼
[IDLE]
```

### Listener Lifecycle (Onboarding)

```
Before fix:
  handleOnboardingComplete() → onSnapshot(A) [leaked]
                             → onSnapshot(B) [repeat call] [leaked]

After fix:
  handleOnboardingComplete() → delete inline onSnapshot entirely
  useAuthState.onAuthStateChanged() → onSnapshot(C) [properly unsubscribed on sign-out]
```
