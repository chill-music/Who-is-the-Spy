# Tasks: PWA Codebase Bug Fixes & Stability Hardening

**Input**: Design documents from `/specs/003-codebase-bug-fixes/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — manual QA checklist in quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths are included in all task descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm all planning artifacts are ready and the feature branch is active.

- [x] T001 Confirm active branch is `003-codebase-bug-fixes` and all spec artifacts (plan.md, research.md, data-model.md) are present in `specs/003-codebase-bug-fixes/`
- [x] T002 Open and read `specs/003-codebase-bug-fixes/plan.md` — review all phase A–D change details before touching source files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Changes to `src/01-config.js` that all other phases depend on — Firestore offline persistence and the UID guard in `SecurityService`. Must be complete before any game-level changes.

**⚠️ CRITICAL**: Phases 3–6 all depend on `SecurityService` and should not be modified until Phase 2 is complete.

- [x] T003 Enable Firestore offline persistence in `src/01-config.js` — add `db.enablePersistence({ synchronizeTabs: true }).catch(...)` immediately after `var db = firebase.firestore();` on line 48, before any collection declarations
- [x] T004 Add UID mismatch guard in `src/01-config.js` inside `window.SecurityService.applyCurrencyTransaction` — at the top of the function body, before the sanity check, validate `uid === firebase.auth().currentUser?.uid`; if they diverge, log `console.error` and return `{ success: false, error: 'UID mismatch' }`

**Checkpoint**: `01-config.js` saves cleanly, console shows no errors on page load, and `SecurityService` guard is reachable via DevTools (`window.SecurityService.applyCurrencyTransaction('bad-uid', -100, 'test')`).

---

## Phase 3: User Story 1 — Unsubscribed Firestore Listener After Onboarding (Priority: P1) 🎯 MVP

**Goal**: Eliminate the duplicate `onSnapshot` listener created inside `handleOnboardingComplete`, preventing session-level listener leaks and racing `setUserData` calls.

**Independent Test**: Complete onboarding as a new user → log out → re-authenticate as a different account → no `setUserData` call fires for the first user's document. Verifiable through DevTools → Sources → breakpoint on `setUserData`.

### Implementation for User Story 1

- [x] T005 [US1] In `src/app/useOnboarding.js`, delete the `// Start listening to user doc (inline sync)` comment block and the entire `pendingNewUserRef.onSnapshot(snap => { ... })` call (lines 88–95) — the `useAuthState` hook already establishes the correct listener with proper cleanup
- [x] T006 [US1] Verify `src/app/useOnboarding.js` still compiles: confirm `handleOnboardingComplete` returns cleanly after the `setNotification(...)` call, with no orphaned dangling reference to `pendingNewUserRef` after `setPendingNewUserRef(null)`

**Checkpoint**: After onboarding a new user and logging out, opening DevTools → Network → Firestore WebSocket shows no further traffic destined to the first user's `users/{uid}` document.

---

## Phase 4: User Story 2 — window.userData / window.currentUserData Never Written (Priority: P1)

**Goal**: Ensure `window.currentUserData` is always populated before any Lucky Games module starts, so the fallback chain in game modules resolves correctly.

**Independent Test**: Open a Lucky Game immediately after cold page load (before auth fully resolves) — all currency deductions execute correctly or the spin button is disabled. The `window.currentUserData` property is non-null when a game is active.

### Implementation for User Story 2

- [x] T007 [P] [US2] In `src/features/lucky-games/LuckyGamesHub.js`, in the `lucky_fruit` start `useEffect` (around line 195), add `window.currentUserData = props.userData || null;` immediately before `window.LuckyFruitGame.start(...)` — keep the existing `window.lfGameUserData = props.userData || null;` assignment
- [x] T008 [P] [US2] In `src/features/lucky-games/LuckyGamesHub.js`, in the `super_777` start `useEffect` (around line 211), add `window.currentUserData = props.userData || null;` immediately before `window.Super777Game.start(...)`
- [x] T009 [P] [US2] In `src/features/lucky-games/LuckyGamesHub.js`, in the `greedy_cat` start `useEffect` (around line 229), add `window.currentUserData = props.userData || null;` immediately before `window.GreedyCatGame.start(...)`
- [x] T010 [P] [US2] In `src/features/lucky-games/LuckyGamesHub.js`, in the `soccer_star` start `useEffect` (around line 247), add `window.currentUserData = props.userData || null;` immediately before `window.SoccerStarGame.start(...)`
- [x] T011 [US2] In `src/features/lucky-games/LuckyGamesHub.js`, in the `stop ALL games on modal close` `useEffect` (around line 261), add `window.currentUserData = null;` after all game `stop()` calls and before `setActiveGame(null)` — prevents stale data leaking between sessions

**Checkpoint**: `console.log(window.currentUserData)` inside any game module during a spin returns a valid user object with a `uid` property. `console.log(window.currentUserData)` after closing the hub returns `null`.

---

## Phase 5: User Story 3 — Orphaned onSnapshot in useOnboarding After pendingNewUserRef Reset (Priority: P2)

**Goal**: Remove the remaining competing listener pathway that could cause `setUserData` to fire twice per update, and confirm no secondary listener is created for the onboarding doc.

**Independent Test**: After onboarding completes, add a `console.log` before `setUserData` calls — each Firestore update should trigger the call exactly once.

### Implementation for User Story 3

> **Note**: The core fix (deleting the duplicate `onSnapshot`) was implemented in Phase 3 (T005). This phase addresses the Firestore connectivity state guard and the Greedy Cat untracked listener — the remaining sources of competing listener callbacks.

- [x] T012 [US3] In `src/features/lucky-games/GreedyCatGame.js`, declare two module-scope variables at the top of the IIFE alongside `var unsubscribeSync = null;` — add `var currencyUnsub = null;` and `var resultsUnsub = null;`
- [x] T013 [US3] In `src/features/lucky-games/GreedyCatGame.js`, in `subscribeSync()` around line 163 — replace the untracked `window.usersCollection.doc(S.currentUser.uid).onSnapshot(...)` call with `currencyUnsub = window.usersCollection.doc(S.currentUser.uid).onSnapshot(...)`
- [x] T014 [US3] In `src/features/lucky-games/GreedyCatGame.js`, in `subscribeSync()` around line 169 — replace `sessDoc.collection('results').orderBy(...).onSnapshot(...)` with `resultsUnsub = sessDoc.collection('results').orderBy(...).onSnapshot(...)`
- [x] T015 [US3] In `src/features/lucky-games/GreedyCatGame.js`, in `window.GreedyCatGame.stop` (around line 794) — add cleanup for both new handles:
  ```
  if (currencyUnsub) { currencyUnsub(); currencyUnsub = null; }
  if (resultsUnsub)  { resultsUnsub();  resultsUnsub = null; }
  ```
  Place these before the existing `_ticker` clearInterval block

**Checkpoint**: Open Greedy Cat → play one round → close hub → DevTools → Firestore WebSocket shows no further traffic for the `users/{uid}` currency doc. No "Cannot set properties of undefined" errors in console.

---

## Phase 6: User Story 4 — LuckyFruitGame Writes Window Globals Mutably (Priority: P2)

**Goal**: Persist `lastWheelSpin` to Firestore after each bonus wheel spin, enforce Firestore connectivity checks before any spin, and implement mid-flight refund for failed deductions.

**Independent Test**: Spin the bonus wheel in LuckyFruitGame → refresh the page → wheel is locked for the full cooldown period. Spin while network is throttled to offline → error toast appears, balance unchanged.

### Implementation for User Story 4

- [x] T016 [US4] In `src/features/lucky-games/LuckyFruitGame.js`, find the bonus wheel spin handler around line 1174 — after `if (window.lfGameUserData) window.lfGameUserData.lastWheelSpin = tsNow;`, add an async IIFE to persist `lastWheelSpin` to Firestore:
  ```javascript
  (async function() {
    try {
      var authUser = firebase.auth().currentUser;
      if (authUser && authUser.uid) {
        await window.usersCollection.doc(authUser.uid)
          .update({ lastWheelSpin: tsNow });
      }
    } catch(e) {
      console.error('[PRO SPY ERROR] Failed to persist lastWheelSpin:', e);
    }
  })();
  ```

- [x] T017 [US4] Add the Firestore connectivity heartbeat `useEffect` in `src/features/lucky-games/LuckyGamesHub.js` inside the `LuckyGamesHubModal` component, between the existing `useEffect` blocks — runs once on mount, subscribes to the app public root doc, sets `window._firestoreOnline = true` on success and `false` on `'unavailable'` error, and clears `window._firestoreOnline = undefined` and unsubscribes on unmount:
  ```javascript
  useEffect(function() {
    if (!window.db || !window.appId) return;
    var heartbeatRef = window.db.collection('artifacts').doc(window.appId)
      .collection('public').doc('data');
    var unsubHeartbeat = heartbeatRef.onSnapshot(
      function() { window._firestoreOnline = true; },
      function(err) {
        if (err.code === 'unavailable') window._firestoreOnline = false;
        console.error('[PRO SPY ERROR] Firestore heartbeat error:', err);
      }
    );
    return function() { unsubHeartbeat(); window._firestoreOnline = undefined; };
  }, []);
  ```

- [x] T018 [P] [US4] In `src/features/lucky-games/LuckyFruitGame.js`, find the main `spin()` function entry point — add an offline guard at the very top (before balance checks):
  ```javascript
  if (window._firestoreOnline === false) {
    if (window.showToast) window.showToast(
      typeof lang !== 'undefined' && lang === 'ar'
        ? '⚠️ لا يوجد اتصال — يرجى المحاولة لاحقاً'
        : '⚠️ No connection — please try again'
    );
    return;
  }
  ```

- [x] T019 [P] [US4] In `src/features/lucky-games/GreedyCatGame.js`, in `window.GreedyCatGame.toggleBet` (around line 659) — add the same offline guard at the top of the function, before the `S.phase !== 'betting'` check:
  ```javascript
  if (window._firestoreOnline === false) {
    if (window.showToast) window.showToast(T('NO_COINS').replace
      ? (lang === 'ar' ? '⚠️ لا يوجد اتصال' : '⚠️ No connection') : '⚠️ No connection');
    return;
  }
  ```

- [x] T020 [P] [US4] In `src/features/lucky-games/Super777Game.js`, find the `spin()` or bet initiation entry point — add the same offline guard pattern (`window._firestoreOnline === false` → show toast → return)

- [x] T021 [P] [US4] In `src/features/lucky-games/SoccerStarGame.js`, find the bet/prediction submission entry point — add the same offline guard pattern

- [x] T022 [US4] In `src/features/lucky-games/GreedyCatGame.js`, in `window.GreedyCatGame.toggleBet` — implement pre-deduction balance snapshot and post-failure refund:
  ```javascript
  var prevBalance = S.balance;
  // ... existing SecurityService call ...
  // On failure path (result.success === false or catch):
  S.balance = prevBalance;
  updateUI();
  ```
  Ensure the `catch` block at line 674 restores `S.balance = prevBalance` and calls `updateUI()` in addition to the existing `console.error`

- [x] T023 [US4] In `src/features/lucky-games/LuckyFruitGame.js`, find the currency deduction call site (uses `SecurityService.applyCurrencyTransaction`) — snapshot `var prevBalance` before the call and restore + show toast on any failure path (catch block or `result.success === false`)

**Checkpoint**: Toggle offline in DevTools Network → attempt spin in any game → toast appears, balance unchanged. Go back online → spin succeeds → refresh page → wheel cooldown remains locked.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Silent error handler hardening across all game modules (FR-006).

- [x] T024 [P] In `src/features/lucky-games/LuckyFruitGame.js` — scan for any `.catch(() => {})` or `.catch(function(){})` patterns on Firestore write operations (currency, history, stats); replace with `.catch(function(e) { console.error('[PRO SPY ERROR] <context>:', e); })`
- [x] T025 [P] In `src/features/lucky-games/Super777Game.js` — same silent catch replacement audit as T024
- [x] T026 [P] In `src/features/lucky-games/SoccerStarGame.js` — same silent catch replacement audit
- [x] T027 Verify the intentional empty catch in `src/features/lucky-games/GreedyCatGame.js` around line 263 (inside `initNewRound`) has its existing explanatory comment intact — **do not add logging here** (intentional race-condition guard)
- [x] T028 Manual QA pass using the checklist in `specs/003-codebase-bug-fixes/quickstart.md` — verify all 8 checkpoint scenarios pass in the browser

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundation)**: Depends on Phase 1 — edits `01-config.js` which underpins all Firestore writes; **blocks Phases 3–7**
- **Phase 3 (US1)**: Depends on Phase 2 — edits `useOnboarding.js`; independent of other story phases
- **Phase 4 (US2)**: Depends on Phase 2 — edits `LuckyGamesHub.js`; can run in parallel with Phase 3
- **Phase 5 (US3)**: Depends on Phase 2 — edits `GreedyCatGame.js`; can run in parallel with Phases 3 & 4
- **Phase 6 (US4)**: Depends on Phases 2 and 4 (T017 modifies `LuckyGamesHub.js` that Phase 4 also touches — coordinate)
- **Phase 7 (Polish)**: Depends on all previous phases

### User Story Dependencies

| Story | Depends on | Files |
|---|---|---|
| US1 (onboarding listener) | Phase 2 | `useOnboarding.js` |
| US2 (window.currentUserData) | Phase 2 | `LuckyGamesHub.js` |
| US3 (untracked listeners) | Phase 2 | `GreedyCatGame.js` |
| US4 (lastWheelSpin + offline) | Phase 2 + Phase 4 complete | `LuckyFruitGame.js`, `LuckyGamesHub.js`, `Super777Game.js`, `SoccerStarGame.js`, `GreedyCatGame.js` |

### Within Each Story

- T007–T011 (Phase 4) are all `[P]` — they touch separate `useEffect` blocks and can be done in one pass
- T012–T014 (Phase 5) must be sequential — declare variables → assign → clean up
- T018–T021 (Phase 6) are all `[P]` — add offline guard to 4 separate game files simultaneously

### Parallel Opportunities

```
After Phase 2 completes:
  ┌── Phase 3 (T005, T006) ──────────────── useOnboarding.js
  ├── Phase 4 (T007–T011) ──────────────── LuckyGamesHub.js
  └── Phase 5 (T012–T015) ──────────────── GreedyCatGame.js

After Phases 3 & 4 complete:
  Phase 6: T016 (LuckyFruitGame.js) + T017 (LuckyGamesHub.js — coordinate with Phase 4 author)
  Then T018–T021 [P] all four game files simultaneously
  Then T022, T023 sequentially within their files

Phase 7 (T024–T027) [P] — all four separate game files simultaneously
```

---

## Implementation Strategy

### MVP First (User Story 1 + Foundation only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundation (`01-config.js` — persistence + UID guard)
3. Complete Phase 3: US1 (delete duplicate onboarding listener)
4. **STOP and VALIDATE**: Log out and back in — confirm no stale listener fires
5. Optionally stop and demo

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready (persistence + UID guard live for all subsequent fixes)
2. Phase 3 → US1: Onboarding listener leak fixed
3. Phase 4 → US2: `window.currentUserData` sync fixed
4. Phase 5 → US3: Greedy Cat listener handles tracked
5. Phase 6 → US4: `lastWheelSpin` persisted, offline spin blocked, mid-flight refund
6. Phase 7 → Polish: Silent catches logged, full QA pass

---

## Notes

- `[P]` tasks = different files or independent code blocks, no conflicting edits
- `[Story]` label maps task to spec.md user story for traceability
- The intentional empty `catch` in `GreedyCatGame.js:263` (`initNewRound`) MUST NOT be replaced — it is a documented race-condition guard
- Commit after each Phase checkpoint
- Use `specs/003-codebase-bug-fixes/quickstart.md` for the final QA checklist after Phase 7
