# Tasks: Fix False Onboarding Trigger for Returning Google Users

**Input**: Design documents from `/specs/006-fix-onboarding-race/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅  
**Branch**: `006-fix-onboarding-race`  
**Target file**: `src/app/useAuthState.js` (only file modified)

**Tests**: Not explicitly requested — no automated test tasks generated. Manual verification via browser console is documented in plan.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and verification.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files / no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to
- No [P] markers in this feature — all tasks target the same single file and must be applied sequentially

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the working branch and baseline code are ready for editing.

- [x] T001 Verify current branch is `006-fix-onboarding-race` (run `git branch --show-current` and confirm output)
- [x] T002 Read `src/app/useAuthState.js` in full to establish line-number baseline before any edits

**Checkpoint**: Branch confirmed, file baseline captured. Ready to implement.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No shared infrastructure changes needed — this fix is self-contained in one file. The foundational phase is satisfied by understanding the two confirmed root causes from research.md:

1. The `onAuthStateChanged` null-user `else` branch does not `return` early, leaving a timing window where the onboarding effect can evaluate with stale `user` state.
2. The `__hideBootScreen()` call lives unconditionally after the if/else block rather than inside each branch.

**⚠️ CRITICAL**: Both changes in Phase 3 and Phase 5 must be applied to `src/app/useAuthState.js` in sequence. Do NOT apply them out of order.

**Checkpoint**: Root cause understood, no infrastructure changes required. User story implementation can begin.

---

## Phase 3: User Story 1 — Returning User Sees Lobby, Not Onboarding (Priority: P1) 🎯 MVP

**Goal**: Ensure returning Google users with existing Firestore profiles never see the onboarding screen after clearing browser data and re-authenticating.

**Independent Test**: Clear browser data → open app → sign in with existing Google account → verify lobby appears and zero "TRIGGERING ONBOARDING" console logs fire.

### Implementation for User Story 1

- [x] T003 [US1] In `src/app/useAuthState.js` lines 130–137: split the unified `else` branch into two explicit sub-cases. Replace the current block:

  ```js
  } else {
      setUser(null);
      setUserData(null);
      setAuthLoading(false);
      setUserDataLoading(false);
  }
  /* ── Hide boot screen (guest or no user) ── */
  if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();
  ```

  With:

  ```js
  } else if (u === null) {
      // Not authenticated — show login screen only, never trigger onboarding
      console.log('[Auth] No user session — showing login screen');
      setUser(null);
      setUserData(null);
      setAuthLoading(false);
      setUserDataLoading(false);
      if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();
      return; // Stop here — do not fall through to any further logic
  } else {
      // Anonymous / guest user — no Firestore listener needed
      setUser(null);
      setUserData(null);
      setAuthLoading(false);
      setUserDataLoading(false);
      if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();
  }
  ```

  Also remove the now-redundant unconditional `__hideBootScreen` call that was at line 137 (since it is now inlined into each branch above).

- [x] T004 [US1] In `src/app/useAuthState.js` line 22: update the onboarding `useEffect` log statement to include the user UID for debugging clarity. Replace:

  ```js
  console.log("Onboarding check: authLoading=" + authLoading + " userDataLoading=" + userDataLoading + " userData=" + (userData ? JSON.stringify(userData).slice(0, 50) + "..." : "null"));
  ```

  With:

  ```js
  console.log("Onboarding check: authLoading=" + authLoading + " userDataLoading=" + userDataLoading + " user=" + (user ? user.uid : "null") + " userData=" + (userData ? JSON.stringify(userData).slice(0, 50) + "..." : "null"));
  ```

- [x] T005 [US1] In `src/app/useAuthState.js` line 23: strengthen the onboarding condition by adding an explicit `user !== null &&` guard before the existing `user &&` check, to match FR-003 exactly and make intent unmistakable. Replace:

  ```js
  if (!authLoading && !userDataLoading && user && !user.isAnonymous && !userData && !window._googleLoginInProgress) {
  ```

  With:

  ```js
  if (!authLoading && !userDataLoading && user !== null && user && !user.isAnonymous && !userData && !window._googleLoginInProgress) {
  ```

**Checkpoint**: US1 implementation complete. Verify by running T1 in plan.md verification table: clear browser data, open app, sign in with existing Google account — lobby must appear, zero "TRIGGERING ONBOARDING" console entries.

---

## Phase 4: User Story 2 — New User Correctly Sees Onboarding (Priority: P2)

**Goal**: Verify (not implement — no code changes needed) that brand-new Google users still trigger the onboarding screen correctly. The existing 3-second confirmation path (lines 111–123 of `useAuthState.js`) is already correct and is preserved untouched.

**Independent Test**: Sign in with a Google account that has no existing profile → verify onboarding screen appears after the 3-second Firestore confirmation delay.

### Implementation for User Story 2

- [x] T006 [US2] Read lines 107–123 of `src/app/useAuthState.js` and confirm the "doc does not exist" timeout path is fully intact and unchanged after the T003–T005 edits. No code change required — this is a verification-only task.

  Expected lines 107–123 (unchanged):
  ```js
  } else {
      console.log("userData snapshot says doc does not exist. Waiting 3 seconds to confirm...");
      setTimeout(() => {
          userRef.get().then((freshDoc) => {
              if (!freshDoc.exists) {
                  console.log("userData received: null (confirmed doc does not exist after 3s)");
                  setUserData(null);
                  setUserDataLoading(false);
                  console.log("userDataLoading set to false (confirmed new user)");
                  if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();
              }
          });
      }, 3000);
  }
  ```

**Checkpoint**: US2 verified by running T2 in plan.md: sign in with new Google account → onboarding screen appears after ≤4 seconds. US1 is not broken.

---

## Phase 5: User Story 3 — Unauthenticated App State Shows Login Screen Only (Priority: P3)

**Goal**: Close the specific edge case where a transient null-auth state (e.g., during Google redirect) could momentarily be misread as "confirmed unauthenticated" and trigger login-screen flicker or premature state transitions.

**Independent Test**: Open app with no cached session, do NOT click login — only login screen renders. Navigate away and back — still login screen, no flicker, no onboarding.

### Implementation for User Story 3

- [x] T007 [US3] In `src/app/useAuthState.js` lines 65–68: confirm the existing guard for active Google redirects is intact after the Phase 3 edits:

  ```js
  if (u === null && window._googleLoginInProgress) {
      console.log("Ignored null auth state because Google Login is in progress");
      return;
  }
  ```

  No code change needed — this is a verification-only task confirming the guard is still present and runs before the new `else if (u === null)` branch added in T003.

- [x] T008 [US3] Verify the full logical flow of the `onAuthStateChanged` callback now reads correctly in order (top to bottom):

  1. `if (u === null && window._googleLoginInProgress)` → ignore, `return`
  2. `if (u && !u.isAnonymous)` → real user → start Firestore listener
  3. `else if (u === null)` → unauthenticated → set state, `return` ← **new**
  4. `else` → anonymous user → clear state

  This ordering must be confirmed by reading the final state of `src/app/useAuthState.js` after all edits. No code change if order is correct.

**Checkpoint**: US3 verified by running T3 in plan.md: open app cold with no cached session → only login screen. T1 and T2 remain unaffected.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, consistency check, and commit.

- [x] T009 Read `src/app/useAuthState.js` in full one final time and confirm:
  - No dead code or unreachable blocks introduced (🔴 Dead Code Prevention ✅)
  - No empty catch blocks (🟠 Logic & Async Accountability ✅)
  - No new function complexity — guard clauses are flat (🟡 Structural Discipline ✅)
  - No new imports or globals introduced (🔵 Dependency Sanitization ✅)
  - `user !== null` is checked before `.isAnonymous` access (⚪ Type & Null Robustness ✅)

- [x] T010 [P] Check console output for each of the 6 test scenarios in plan.md verification table (T1–T6) and confirm zero unexpected "TRIGGERING ONBOARDING" log lines

- [x] T011 Stage and commit changes to `src/app/useAuthState.js` with message:
  `fix: prevent false onboarding trigger for returning Google users (#006)`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1
- **Phase 3 (US1 — P1)**: Depends on Phase 2 — **BLOCKS US2 and US3 verification**
- **Phase 4 (US2 — P2)**: Depends on Phase 3 completion (reads the same file)
- **Phase 5 (US3 — P3)**: Depends on Phase 3 completion (reads the same file)
- **Phase 6 (Polish)**: Depends on Phases 3, 4, 5 all complete

### User Story Dependencies

- **US1 (P1)**: Primary code change — all other stories depend on this completing first
- **US2 (P2)**: Verification-only — depends on US1 edits being in place
- **US3 (P3)**: Verification-only — depends on US1 edits being in place

### Within Each Story

All tasks in this feature target `src/app/useAuthState.js` and must run sequentially (no parallel execution possible within the same file). The [P] marker is intentionally absent from all tasks.

### Parallel Opportunities

No parallel opportunities within this feature (single-file change). Future separate features may proceed in parallel on independent files.

---

## Implementation Strategy

### MVP First (User Story 1 Only — Minimum to fix the bug)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (confirm root causes)
3. Complete Phase 3: US1 — T003, T004, T005 (the actual code edits)
4. **STOP and VALIDATE**: Clear browser data → sign in → confirm lobby appears, no onboarding
5. Deploy hotfix if validated

### Full Delivery (All 3 User Stories)

1. Complete MVP above
2. Phase 4: T006 — verify new user flow unbroken
3. Phase 5: T007–T008 — verify unauthenticated login-screen-only behavior
4. Phase 6: T009–T011 — polish, constitution check, commit

### Solo Developer Flow

Since this is a 3-task code change (T003, T004, T005), a solo developer can complete the entire feature in a single focused session:

```
T001 → T002 → T003 → T004 → T005 → [validate T1] → T006 → [validate T2] → T007 → T008 → [validate T3] → T009 → T010 → T011
```

---

## Notes

- All 3 code-changing tasks (T003, T004, T005) target `src/app/useAuthState.js` — apply them in order
- T006, T007, T008 are read/verification-only — they confirm no regressions but make zero edits
- The 3-second Firestore confirmation delay (lines 111–123) is intentionally preserved — it is correct behavior for slow connections
- The `window._googleLoginInProgress` flag is set externally (in `handleGoogleLogin`) — `useAuthState.js` only reads it
- After T003, the unconditional `__hideBootScreen` call at the bottom of the `onAuthStateChanged` callback (old line 137) must be removed — each branch now manages its own call
