# Research: Fix False Onboarding Trigger — 006-fix-onboarding-race

**Created**: 2026-04-04  
**Branch**: 006-fix-onboarding-race  
**Method**: Direct codebase inspection of `useAuthState.js` (149 lines) and `10-app.js` (useAuthState call site)

---

## Resolved Decisions

### Decision 1: Root Cause

**Decision**: The bug is caused by a race condition between React state batching and the `onAuthStateChanged` callback's null-user branch. When the null-user branch runs, it sets `user=null`, `userData=null`, `authLoading=false`, `userDataLoading=false` — but React may re-render (and re-run the onboarding `useEffect`) with a _stale_ non-null `user` value before the `setUser(null)` update is reflected.

**Rationale**: The onboarding `useEffect` already has `user && !user.isAnonymous` in its condition (line 23). The fact that the bug still triggers means `user` was non-null in the effect closure at the time it ran — meaning stale state from a previous auth session was present. The Firebase null-user event fired, but React hadn't yet committed `setUser(null)` when the effect re-evaluated.

**Alternatives considered**:
- ~~Missing `user !== null` check~~ (already exists as `user &&`)
- ~~Firestore cache miss causing premature `userDataLoading=false`~~ (partial cause in some scenarios)
- ✅ React async state batching stale closure (confirmed root cause)

---

### Decision 2: Fix Strategy — Explicit `null` Branch with `return`

**Decision**: Split the `else` branch in `onAuthStateChanged` into two sub-cases: one for `u === null` (unauthenticated) and one for anonymous users. The `u === null` case gets an explicit `return` to prevent any fall-through and to ensure all state updates are batched together in a single synchronous scope.

**Rationale**: Returning early from the callback after setting state ensures React can batch the four state updates (`setUser`, `setUserData`, `setAuthLoading`, `setUserDataLoading`) atomically. This minimizes the window during which the effect sees inconsistent state (e.g., `user` still truthy but `authLoading=false`).

**Alternatives considered**:
- ~~`useRef` to track auth state and consult it inside the effect~~ — adds complexity, violates SRP
- ~~Moving onboarding check inside the onSnapshot callback~~ — appropriate but more invasive, harder to reason about
- ✅ Explicit `return` in null-auth branch (minimal, targeted, reversible)

---

### Decision 3: Redundant `user !== null` in Onboarding Effect

**Decision**: Add explicit `user !== null` check alongside the existing `user &&` in the onboarding effect condition as a belt-and-suspenders defense, and update the log to include `user` UID or `"null"` for clearer debugging.

**Rationale**: While `user &&` is logically equivalent to `user !== null && user !== undefined`, the explicit check:
1. Matches the language of FR-003 exactly ("user !== null")
2. Prevents any future refactor from accidentally dropping the null gate
3. Makes intent unmistakably clear in code review

**Alternatives considered**:
- ~~Leave as `user &&`~~ — correct but less explicit; past conversation shows it wasn't enough to prevent the bug in all cases
- ✅ Add `user !== null &&` for clarity (no runtime cost)

---

### Decision 4: Scope — Single File Only

**Decision**: Only `src/app/useAuthState.js` is modified.

**Rationale**: The user explicitly confirmed "The fix targets `useAuthState.js` only." Code inspection confirms all the fix logic is isolated to this file. The call site in `10-app.js` (lines 121–126) passes callbacks and consumes the return value — no changes needed there. The `useOnboarding` hook is a consumer of `showOnboarding` state but is not involved in setting it.

**Alternatives considered**:
- ~~Also guard in `10-app.js`'s `useEffect` that proxies `onboardingStates.show`~~ — defensible, but would duplicate guard logic
- ✅ Fix at the source (useAuthState) — single point of truth

---

### Decision 5: `__hideBootScreen` Call Placement

**Decision**: Move `__hideBootScreen()` call inside the null-auth branch (before `return`) rather than leaving it after the if/else block.

**Rationale**: The current code has `__hideBootScreen()` unconditionally at line 137 (after the if/else block). This works but is fragile — it runs regardless of which branch executed. Moving it inside the explicit `u === null` branch and inside the anonymous branch makes the call explicit and auditable, consistent with the 🟠 Logic & Async Accountability principle.

**Alternatives considered**:
- ~~Leave at line 137~~: functional but fragile
- ✅ Move inside each branch: explicit, clear intent

---

## No NEEDS CLARIFICATION Items

All unknowns resolved through direct codebase inspection. Implementation can proceed immediately.
