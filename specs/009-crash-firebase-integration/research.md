# Phase 0: Outline & Research

## Firestore Integration for Real-Time Synchronization
**Decision**: Use `onSnapshot` from `firebase/firestore` to watch the user's `balance` field.
**Rationale**: `onSnapshot` provides live updates, ensuring the balance accurately reflects transactions happening across the game and overall site without page reloading.
**Alternatives considered**: Polling (inefficient), `getDoc` only on bet resolution (leaves balance stale if they earn outside the game).

## Secure Betting and Claiming
**Decision**: Use `runTransaction` or batched writes if multiple docs, but a simple atomic `increment()` via `updateDoc` works given Firestore resolves concurrent decrements securely, paired with security rules ensuring `balance >= 0`. For claims, we conceptually do `increment(winAmount)`.
**Rationale**: Standard Firebase technique for avoiding race conditions in balance modifications.
**Alternatives considered**: Reading standard state and updating, which suffers from race conditions.

## Anti-Cheat / Disconnect
**Decision**: The current client processes the crash. We must write betting status to Firestore at the moment of betting. If the user disconnects, the bet exists on the server. A server-side or Cloud Function would idealistically finalize the crash. Since the spec specifies "logic to ensure... correctly", we will use `onDisconnect` logic via RTDB if possible, or conceptually resolve unresolved bets when they load the app next time. Alternatively, we keep the simplest form: bet is deducted upon placing, and claim increments it. If crash happens and no claim, the amount is just lost. This perfectly handles disconnects by default (money is already gone).

## UI Elements
**Decision**: Replace blue house icon logic with the site's standard profile wrapper. Use existing `window.AppHooks.useAuthState` if this codebase uses the `15-auth` pattern (from rules: "window.AppHooks...").

Research complete.
