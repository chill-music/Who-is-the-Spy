# Implementation Plan: PWA Codebase Bug Fixes & Stability Hardening

**Branch**: `003-codebase-bug-fixes` | **Date**: 2026-04-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-codebase-bug-fixes/spec.md`

---

## Summary

This plan addresses 9 functional requirements across 5 source files. The fixes cover: (1) eliminating an orphaned `onSnapshot` listener in `useOnboarding.js`, (2) ensuring `window.currentUserData` is synchronised before games start, (3) enabling Firestore offline persistence for refund write queuing, (4) adding a pre-write UID safety guard to `SecurityService`, (5) adding a Firestore connectivity-state flag and spin-block check, (6) cleaning up orphaned `onSnapshot` handles inside `GreedyCatGame.subscribeSync`, and (7) persisting `lastWheelSpin` to Firestore after bonus wheel spins. No architectural refactoring is introduced; React hook edits are allowed only where directly required by a listed FR.

---

## Technical Context

**Language/Version**: JavaScript ES2020 (no transpilation for game IIFE modules); React 17 via CDN global for hook-based files  
**Primary Dependencies**: Firebase JS SDK v8 compat (CDN), React 17, ReactDOM  
**Storage**: Firestore (Cloud Firestore v8 compat)  
**Testing**: Manual QA via browser DevTools + Firestore console; no automated test suite in scope  
**Target Platform**: Mobile and desktop web (PWA — service worker registered)  
**Performance Goals**: Timer cleanup within 500ms of hub close (SC-004); currency deductions verified within a normal spin cycle  
**Constraints**: IIFE + window-global architecture; React hook edits limited to files directly touched by FRs; no new hooks or components  
**Scale/Scope**: Single-session, single-user game module; no concurrent session concurrency concerns for this pass

---

## Constitution Check

*GATE: Must pass before implementation.*

| Principle | Status | Notes |
|---|---|---|
| 🔴 Dead Code Prevention | ✅ PASS | Removing the duplicate `onSnapshot` call in `useOnboarding.js` eliminates dead listener code |
| 🟠 Logic & Async Accountability | ✅ PASS | All new writes are properly `await`ed; all `catch` blocks log `console.error` |
| 🟡 Structural Discipline (SOLID) | ✅ PASS | `_assertUID` helper centralised in `SecurityService`; no function bloat |
| 🔵 Dependency Sanitization | ✅ PASS | No new imports; no new packages |
| ⚪ Type & Null Robustness | ✅ PASS | All null checks on `firebase.auth().currentUser` and `window._firestoreOnline` are explicit |

**Complexity justification**: One `useEffect` cleanup addition in `useOnboarding.js` constitutes the only React change — directly required by FR-001. No new hooks or components are introduced.

---

## Project Structure

### Documentation (this feature)

```
specs/003-codebase-bug-fixes/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks)
```

### Source Files Modified

```
src/
├── 01-config.js                          ← enablePersistence, SecurityService UID guard (FR-003, FR-008, FR-009)
├── app/
│   └── useOnboarding.js                  ← Remove duplicate onSnapshot (FR-001)
└── features/
    └── lucky-games/
        ├── LuckyGamesHub.js              ← window.currentUserData sync, heartbeat listener, spin block (FR-002, FR-007)
        ├── LuckyFruitGame.js             ← lastWheelSpin → Firestore, empty catch fixes (FR-004, FR-006)
        └── GreedyCatGame.js              ← Store & clean up currency/results onSnapshot handles (FR-005, FR-006)
```

---

## Implementation Phases

### Phase A — Foundation (01-config.js)

**Files**: `src/01-config.js`

**A1 — Enable Firestore Offline Persistence** *(FR-008)*

Immediately after `var db = firebase.firestore();` (line 48):

```javascript
// Enable offline persistence — queues writes (including refunds) across sessions via IndexedDB
db.enablePersistence({ synchronizeTabs: true }).catch(function(err) {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open — persistence only works in one tab at a time
    console.warn('[PRO SPY] Firestore persistence limited to one tab');
  } else if (err.code === 'unimplemented') {
    console.warn('[PRO SPY] Firestore persistence not available in this browser');
  }
});
```

**A2 — UID Guard in SecurityService** *(FR-009, SC-006)*

At the top of `applyCurrencyTransaction`, before the sanity check:

```javascript
// UID validation: abort if window global UID diverges from authenticated user
var authUID = firebase.auth().currentUser && firebase.auth().currentUser.uid;
if (authUID && uid !== authUID) {
  console.error('[SEC] UID mismatch — write aborted. Supplied:', uid, '| Auth:', authUID);
  return { success: false, error: 'UID mismatch' };
}
```

---

### Phase B — React Hook Fix (useOnboarding.js)

**Files**: `src/app/useOnboarding.js`

**B1 — Remove Duplicate onSnapshot Listener** *(FR-001, SC-001)*

Delete lines 88–95 of `useOnboarding.js` (the `// Start listening to user doc (inline sync)` block and its `pendingNewUserRef.onSnapshot(...)` call).

**Rationale**: `useAuthState.js` already establishes a properly-cleaned `unsubSnap = userRef.onSnapshot(...)` listener for every authenticated user. The duplicate listener in `handleOnboardingComplete` creates a competing second listener for the same document with no cleanup handle, causing racing `setUserData` calls.

No replacement is needed — the existing `useAuthState` listener handles all subsequent sync.

---

### Phase C — Hub Synchronisation (LuckyGamesHub.js)

**Files**: `src/features/lucky-games/LuckyGamesHub.js`

**C1 — Sync window.currentUserData Before Game Start** *(FR-002, FR-003)*

In each of the four game-start `useEffect` blocks (lines 192–258), add immediately before the game's `start()` call:

```javascript
window.currentUserData = props.userData || null;
```

The existing game-specific assignments (`window.lfGameUserData`, `window.s7GameUserData`, etc.) remain unchanged. This gives all game modules a consistent fallback in their three-level chains.

**C2 — Firestore Connectivity Heartbeat** *(FR-007, SC-002)*

Add a new `useEffect` inside `LuckyGamesHubModal` that runs once on mount:

```javascript
useEffect(function() {
  if (!window.db || !window.appId) return;
  var heartbeatRef = window.db.collection('artifacts').doc(window.appId)
    .collection('public').doc('data');
  var unsubHeartbeat = heartbeatRef.onSnapshot(
    function() { window._firestoreOnline = true; },
    function(err) {
      if (err.code === 'unavailable') window._firestoreOnline = false;
    }
  );
  return function() {
    unsubHeartbeat();
    window._firestoreOnline = undefined;
  };
}, []);
```

---

### Phase D — Game Module Fixes

#### D1 — GreedyCatGame: Store & Clean onSnapshot Handles (FR-005, SC-004)

**File**: `src/features/lucky-games/GreedyCatGame.js`

In `subscribeSync()` (lines 141–183), store the two additional `onSnapshot` return values:

```javascript
// Replace untracked call:
window.usersCollection.doc(S.currentUser.uid).onSnapshot(function(d) { ... });
// With tracked:
var currencyUnsub = window.usersCollection.doc(S.currentUser.uid).onSnapshot(function(d) { ... });

// Replace:
sessDoc.collection('results').orderBy(...).onSnapshot(function(snap) { ... });
// With:
var resultsUnsub = sessDoc.collection('results').orderBy(...).onSnapshot(function(snap) { ... });
```

Declare `var currencyUnsub = null; var resultsUnsub = null;` at module scope (joining `var unsubscribeSync = null`).

In `stop()`, add cleanup:

```javascript
window.GreedyCatGame.stop = function() {
  if (unsubscribeSync) { unsubscribeSync(); unsubscribeSync = null; }
  if (currencyUnsub)   { currencyUnsub();   currencyUnsub = null; }
  if (resultsUnsub)    { resultsUnsub();    resultsUnsub = null; }
  if (window.GreedyCatGame._ticker) {
    clearInterval(window.GreedyCatGame._ticker);
    window.GreedyCatGame._ticker = null;
  }
  if (rootEl) rootEl.innerHTML = '';
};
```

#### D2 — LuckyFruitGame: Firestore Persist lastWheelSpin (FR-004, SC-003)

**File**: `src/features/lucky-games/LuckyFruitGame.js`

At line 1174 (bonus wheel spin handler), after the in-memory mutation, add a Firestore write:

```javascript
if (window.lfGameUserData) window.lfGameUserData.lastWheelSpin = tsNow;
// Persist to Firestore so cooldown survives refreshes (FR-004)
(async function() {
  try {
    var authUser = firebase.auth().currentUser;
    if (authUser && authUser.uid) {
      await window.usersCollection.doc(authUser.uid).update({ lastWheelSpin: tsNow });
    }
  } catch(e) {
    console.error('[PRO SPY ERROR] Failed to persist lastWheelSpin:', e);
  }
})();
```

#### D3 — Spin Block for Firestore Offline (FR-007)

**File**: `src/features/lucky-games/LuckyFruitGame.js` (spin entry point) and equivalents in Super777Game, SoccerStarGame, GreedyCatGame (`toggleBet`).

At each spin/bet initiation point, add at the top:

```javascript
if (window._firestoreOnline === false) {
  if (window.showToast) window.showToast(lang === 'ar'
    ? '⚠️ لا يوجد اتصال — يرجى المحاولة لاحقاً'
    : '⚠️ No connection — please try again');
  return;
}
```

#### D4 — Mid-flight Failure Refund (FR-008)

**File**: All games' currency deduction call sites.

In `GreedyCatGame.toggleBet` (already uses `SecurityService`), wrap with refund logic:

```javascript
var prevBalance = S.balance;
try {
  var result = await window.SecurityService.applyCurrencyTransaction(...);
  if (!result.success) {
    S.balance = prevBalance; // refund immediately
    updateUI();
    if (window.showToast) window.showToast(T('ERROR_WRITE_FAILED'));
    return;
  }
  S.bets[name] = current + cost;
  ...
} catch (e) {
  S.balance = prevBalance; // refund on exception
  updateUI();
  console.error('[PRO SPY ERROR] toggleBet failed:', e);
}
```

#### D5 — Empty Catch Fixes (FR-006)

**Files**: `LuckyFruitGame.js`, `Super777Game.js` — any `.catch(() => {})` on critical write operations.

Replace empty catches with:

```javascript
.catch(function(e) { console.error('[PRO SPY ERROR] <context>:', e); });
```

Exception: `GreedyCatGame.js:264` empty catch in `initNewRound` is intentional (race condition guard, documented with comment) — leave as-is.

---

## Complexity Tracking

No constitution violations requiring justification. All changes are minimal surgical edits to existing files. One `useEffect` cleanup (`useOnboarding.js`) is a React change directly required by FR-001.

---

## Verification Plan

### Automated
- None (no test suite in scope for this pass).

### Manual QA Checklist

| Check | How to verify | Target SC |
|---|---|---|
| No orphaned listeners after logout | DevTools → Firestore console → active listeners drop to 0 after logout+re-login | SC-001 |
| Currency deduction at cold load (3s) | Open hub within 3s of page load → spin → check Firestore for deduction | SC-002 |
| Bonus wheel cooldown persists | Spin bonus wheel → refresh → wheel must be locked | SC-003 |
| Timer cleanup | Open game → close hub → DevTools console → no "setState on unmounted" errors | SC-004 |
| Firestore error visibility | Block Firestore in DevTools Network → attempt spin → verify `console.error` | SC-005 |
| UID validation | Manually overwrite `window.lfGameUserData.uid` → attempt spin → verify abort + `console.error` | SC-006 |
| Offline spin block | Toggle offline in DevTools → attempt spin → verify error toast shown, balance unchanged | FR-007 |
| Mid-flight refund | Throttle to 1 bps in DevTools while spinning → verify balance refunded on failure | FR-008 |
