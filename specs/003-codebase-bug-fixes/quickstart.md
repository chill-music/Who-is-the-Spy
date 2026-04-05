# Quickstart: 003-codebase-bug-fixes

**Branch**: `003-codebase-bug-fixes`  
**Next step**: Run `/speckit-tasks` to generate the task breakdown

---

## What this plan fixes

| FR | File | Change |
|---|---|---|
| FR-001 | `useOnboarding.js` | Delete duplicate `pendingNewUserRef.onSnapshot(...)` — useAuthState already handles sync |
| FR-002 | `LuckyGamesHub.js` | Add `window.currentUserData = props.userData` before each game `start()` |
| FR-003 | `LuckyGamesHub.js` | Same as FR-002 (consolidated in C1) |
| FR-004 | `LuckyFruitGame.js` | Persist `lastWheelSpin` to Firestore after bonus wheel spin |
| FR-005 | `GreedyCatGame.js` | Store `currencyUnsub` & `resultsUnsub` handles; clean in `stop()` |
| FR-006 | `LuckyFruitGame.js`, `Super777Game.js` | Replace empty/silent catches with `console.error` |
| FR-007 | `LuckyGamesHub.js` | Heartbeat `onSnapshot` sets `window._firestoreOnline`; all spin entry points check flag |
| FR-008 | All game files | Snapshot balance before deduction; refund `S.balance` on `SecurityService` failure |
| FR-009 | `01-config.js` | Add UID ≠ `auth().currentUser.uid` guard at top of `applyCurrencyTransaction` |

---

## Files touched

```
src/01-config.js                          ← Phase A (enablePersistence + UID guard)
src/app/useOnboarding.js                  ← Phase B (remove duplicate listener)
src/features/lucky-games/LuckyGamesHub.js ← Phase C (currentUserData sync + heartbeat)
src/features/lucky-games/LuckyFruitGame.js ← Phase D (lastWheelSpin → Firestore, spin block, refund, empty catches)
src/features/lucky-games/GreedyCatGame.js  ← Phase D (onSnapshot handle tracking, refund)
```

---

## Key architectural decisions

- **No new hooks or components** introduced. One `useEffect` in `LuckyGamesHub.js` is added for the heartbeat.
- **Firestore offline persistence** is enabled at SDK initialisation level — covers all write queuing automatically, no custom retry logic needed.
- **Duplicate listener deleted** rather than refactored — `useAuthState` already provides the correct listener with proper cleanup.
- **SecurityService is the UID guard chokepoint** — validating `uid` there covers all `SecurityService`-routed writes without touching each game file's logic.
