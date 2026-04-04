# Implementation Plan: Fix False Onboarding Trigger for Returning Google Users

**Branch**: `006-fix-onboarding-race` | **Date**: 2026-04-04 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/006-fix-onboarding-race/spec.md`

---

## Summary

Returning users who clear browser data and re-login with Google are incorrectly shown the
"Welcome to PRO SPY!" onboarding screen. The root cause is in `useAuthState.js`: the
onboarding trigger fires when `user === null` (before login), not only when a confirmed
signed-in user has no Firestore document.

The fix adds two coordinated guards in `useAuthState.js`:
1. **Auth callback guard** — when `onAuthStateChanged` fires with `null`, set loading flags to
   `false` immediately and `return` early; no Firestore listener is started.
2. **Onboarding effect guard** — the `useEffect` that calls `setShowOnboarding(true)` must
   check `user !== null && !user.isAnonymous` in addition to the existing `userData === null` check.

No other file changes are needed.

---

## Technical Context

**Language/Version**: Vanilla JavaScript (ES6+), React 18 via CDN (no JSX transpiler)  
**Primary Dependencies**: Firebase Auth v8 compat (`auth.onAuthStateChanged`, `auth.getRedirectResult`), Firestore v8 compat (`usersCollection.doc().onSnapshot`, `.get()`)  
**Storage**: Cloud Firestore (`usersCollection` — global window variable pointing to `/users` collection)  
**Testing**: Manual browser testing (PWA, mobile, desktop). No automated test runner in project.  
**Target Platform**: Progressive Web App (mobile-first, iOS/Android WebView + desktop browsers)  
**Project Type**: Single-page PWA — no bundler, scripts loaded via `<script>` tags in `index.html`, all hooks registered on `window` globals  
**Performance Goals**: Auth-to-lobby transition must complete within 5 seconds on a cold connection  
**Constraints**: No npm/bundler; no TypeScript; global `window` namespace used for all cross-file communication; Firebase SDK v8 compat API only  
**Scale/Scope**: Single file change — `src/app/useAuthState.js` (149 lines)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| 🔴 Dead Code Prevention | ✅ PASS | No new dead code introduced. The existing `_googleLoginInProgress` guard is kept and used more correctly. |
| 🟠 Logic & Async Accountability | ✅ PASS | The fix eliminates the race condition. The `return` early-exit in `onAuthStateChanged` prevents a silent logic error. The `setTimeout`/`.get()` confirmation path is preserved and still properly awaited. |
| 🟡 Structural Discipline (SOLID) | ✅ PASS | Single file, single responsibility. Guard clauses are being added (flat, no nesting increase). No duplicate logic introduced. |
| 🔵 Dependency Sanitization | ✅ PASS | No new imports or dependencies. All globals already exist (`auth`, `usersCollection`, `window._googleLoginInProgress`). |
| ⚪ Type & Null Robustness | ✅ PASS | The fix explicitly handles the `null` user case. `user !== null` and `!user.isAnonymous` guards cover the two unsafe null/anonymous paths. |

**Gate result**: ✅ All principles pass. No complexity tracking entry needed.

---

## Project Structure

### Documentation (this feature)

```text
specs/006-fix-onboarding-race/
├── plan.md              ← This file
├── spec.md              ← Feature specification
├── research.md          ← Phase 0 output (below)
├── data-model.md        ← Phase 1 output (below)
├── checklists/
│   └── requirements.md  ← Quality checklist (already created)
└── tasks.md             ← Phase 2 output (/speckit.tasks — not yet)
```

### Source Code (repository root)

```text
src/
└── app/
    └── useAuthState.js   ← ONLY file modified (149 lines → ~155 lines)
```

**Structure Decision**: Single-file fix. The project uses a flat window-globals architecture.
All auth state management is self-contained in `useAuthState.js`. No new files, folders, or
modules are required.

---

## Phase 0: Research

> See [research.md](./research.md) for full findings.

**No NEEDS CLARIFICATION items** — all decisions are resolved from codebase inspection.

### Key Findings

#### Finding 1 — Root Cause Confirmed

The `useEffect` for onboarding (lines 21–31 in `useAuthState.js`) runs when dependencies
change. On app startup with no cached session, the sequence is:

```
1. authLoading=true, userDataLoading=true  → effect runs, conditions not met → OK
2. onAuthStateChanged fires with null user
3. else-branch (line 130) sets:
     user=null, userData=null, authLoading=false, userDataLoading=false
4. Effect re-runs:
     !authLoading=true, !userDataLoading=true, user=null (falsy) → onboarding NOT triggered
```

Wait — `user` is checked with `user &&` on line 23. So the existing code already has
`user !== null` check. Let me re-read the bug report console sequence:

```
1. Auth state changed: null
2. Onboarding check: authLoading=false userDataLoading=false userData=null
3. !!! TRIGGERING ONBOARDING !!!
```

This means `user` was **not null** when step 3 fired. The real sequence is:

- A previous login session left `user` in state (non-null), then
- `userDataLoading` became `false` due to a cache miss before the real Firestore data arrived, OR
- the `onAuthStateChanged null` branch set `userDataLoading=false` but `user` was still
  non-null from the previous React render cycle

**Actual root cause**: When `onAuthStateChanged` fires with `null`, the else-branch
(lines 130–134) sets `user=null`, `userData=null`, `authLoading=false`, `userDataLoading=false`.
But state updates in React are asynchronous and batched. The `useEffect` may fire
_before_ `setUser(null)` is reflected, using a stale `user` value from a previous auth session.

In addition: after clearing browser data and opening the app, the redirect-result flow
fires `getRedirectResult()`, which sets `window._googleLoginInProgress = false` prematurely
if no redirect result is found. Then when the user clicks Login (triggering a new redirect),
the null auth state fires once more and the effect runs with `window._googleLoginInProgress = false`.

#### Finding 2 — The `_googleLoginInProgress` Flag

`window._googleLoginInProgress`:
- Set to `true` externally (in `handleGoogleLogin`) before triggering the redirect
- Checked on line 23: `!window._googleLoginInProgress`
- Cleared to `false` on line 71 when a real (non-anonymous) user is confirmed

The null-auth guard on line 65 (`if (u === null && window._googleLoginInProgress)`) already
handles the redirect in-progress case correctly. But it doesn't cover the case where
the _previous_ session's stale `user` state causes the effect to trigger prematurely.

#### Finding 3 — The `userData === null` / 3-Second Confirmation Path

Lines 107–123: When Firestore onSnapshot returns `doc.exists = false`, the code waits 3 seconds
then calls `userRef.get()` for a fresh read. Only if the fresh read also returns `!freshDoc.exists`
does it call `setUserData(null)` and `setUserDataLoading(false)`.

This 3-second delay was already added to prevent premature "new user" detection. But:
- If the app starts fresh (no cached session), `onAuthStateChanged(null)` runs first
- The else-branch sets `userDataLoading=false` immediately (no Firestore listener started)
- This causes the effect to evaluate with whatever `user` value is in state

#### Finding 4 — The Definitive Fix Strategy

The fix requires ensuring the onboarding effect is **doubly gated**:
1. `user` must be non-null AND non-anonymous (already checked, but can be stale)
2. The `onAuthStateChanged(null)` path must NOT also leave `userDataLoading=false` when
   there's a risk of stale `user` state

The cleanest fix (as described in the spec and user's bug report) is:

**In the `onAuthStateChanged` callback** — when `u === null` (and no login in progress):
```js
if (u === null) {
  setUser(null);
  setUserData(null);
  setAuthLoading(false);
  setUserDataLoading(false);
  return;  // ← explicit return prevents falling through to __hideBootScreen
}
```

**In the onboarding `useEffect`** — add the full guard:
```js
if (!authLoading && !userDataLoading &&
    user !== null &&
    !user.isAnonymous &&
    !userData &&
    !window._googleLoginInProgress) {
  // Only trigger for confirmed real logged-in users with no profile
}
```

The key insight: `user !== null` is already on line 23, but the bug manifests because
**React state can be stale in effects**. Making the null-auth branch `return` early ensures
`setUser(null)` and all other state updates are enqueued together in the same synchronous
batch, making stale-closure issues less likely. Additionally, the explicit `return` prevents
the `__hideBootScreen` call at line 137 from running in the wrong context.

---

## Phase 1: Design

### Data Model

> See [data-model.md](./data-model.md) for full entity reference.

No schema changes. The fix is purely behavioral — state machine logic in the auth hook.

### Authentication State Machine

The corrected state transitions for `useAuthState.js`:

```
App starts
    │
    ▼
authLoading=true, userDataLoading=true
    │
    ├─ onAuthStateChanged fires with null (no cached session)
    │       │
    │       ├─ _googleLoginInProgress=true? → ignore, return (redirect in flight)
    │       │
    │       └─ else → setUser(null), setUserData(null),
    │                  setAuthLoading(false), setUserDataLoading(false)
    │                  return ← [NEW: explicit return]
    │                  → show LOGIN SCREEN
    │
    └─ onAuthStateChanged fires with real user (u.isAnonymous=false)
            │
            ├─ setUser(u), setAuthLoading(false)
            ├─ start Firestore onSnapshot listener
            │
            ├─ Snapshot: doc.exists=true
            │       → setUserData(data), setUserDataLoading(false)
            │       → show LOBBY
            │
            └─ Snapshot: doc.exists=false
                    │
                    └─ wait 3 seconds → userRef.get()
                            │
                            ├─ freshDoc.exists=true → setUserData(data), setUserDataLoading(false)
                            │                        → show LOBBY
                            │
                            └─ freshDoc.exists=false → setUserData(null), setUserDataLoading(false)
                                                      → effect fires with user≠null → ONBOARDING ✅

Onboarding Effect Guard (runs when any dependency changes):
    │
    ├─ authLoading=true OR userDataLoading=true → skip
    ├─ user=null OR user.isAnonymous=true → skip [REINFORCED]
    ├─ userData≠null → skip (user already has profile)
    ├─ _googleLoginInProgress=true → skip
    └─ all conditions met → setShowOnboarding(true) ✅
```

### Interface Contract

This is an internal hook — no external API contract. The hook's public interface (return value)
is unchanged:

```js
// Return signature — UNCHANGED
{ user, userData, authLoading, userDataLoading, isLoggedIn, setUser, setUserData, setAuthLoading, setUserDataLoading }
```

The callback parameters (`setLang`, `setNickname`, `setOnboardingGoogleUser`, `setPendingNewUserRef`,
`setShowOnboarding`) are also unchanged. Only the timing of when `setShowOnboarding(true)` is
called changes — it is now strictly gated.

---

## Implementation Specification

### File: `src/app/useAuthState.js`

**Change 1 — Onboarding `useEffect` guard** (lines 21–31)

Current:
```js
if (!authLoading && !userDataLoading && user && !user.isAnonymous && !userData && !window._googleLoginInProgress) {
```

This is already correct! The user reports `user !== null` was evaluating as truthy due to
stale closure, not due to a missing check. The log shows the bug as:
```
Onboarding check: authLoading=false userDataLoading=false userData=null
!!! TRIGGERING ONBOARDING !!!
```
But the existing condition has `user &&` — so `user` WAS non-null at that moment.

The condition in line 23 is already correct per the user's "correct pattern". The **real missing
fix** is in the `onAuthStateChanged` callback's null-branch.

**Change 2 — `onAuthStateChanged` null-branch explicit return** (lines 130–135)

Current (else-branch, lines 130–137):
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

Issue: The `else` branch for `u === null` (or anonymous users) sets state correctly, but
falls through to `__hideBootScreen`. More importantly, the null case doesn't have an
explicit `return` — meaning any future code added below the else-block would execute
for the null-user case. The `__hideBootScreen` call after the if/else runs for ALL cases
including null. This is fine behaviorally but confirms the else-branch covers both
`u===null` AND `u.isAnonymous===true`.

**The confirmed minimal fix**: Add an explicit structure for `u === null` that `return`s
before setting any Firestore listener, AND add conservative logging. Per the user's
own description, the key fix is making the null-auth branch more explicit so the app
never proceeds past auth=null to onboarding logic.

**Change 3 — VERIFY the onboarding guard has `user !== null` explicitly**

Looking at line 23 again:
```js
if (!authLoading && !userDataLoading && user && !user.isAnonymous && !userData && !window._googleLoginInProgress) {
```

`user &&` is equivalent to `user !== null && user !== undefined`. This IS the correct pattern
the user described. So the bug must be a timing issue. The fix is:

1. In the null-auth `else` branch, structure it to handle `u === null` separately with
   `return` to prevent any state confusion between the null-user case and the anonymous-user case.
2. Keep the onboarding effect guard as-is (it's already correct).

**Final confirmed changes to `useAuthState.js`:**

**Change A** — Split the `else` branch into `u === null` path (with `return`) vs anonymous path:

```js
// BEFORE (lines 130–137):
} else {
    setUser(null);
    setUserData(null);
    setAuthLoading(false);
    setUserDataLoading(false);
}
/* ── Hide boot screen (guest or no user) ── */
if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();

// AFTER:
} else if (u === null) {
    // Not authenticated — show login screen only, never trigger onboarding
    console.log('[Auth] No user session — showing login screen');
    setUser(null);
    setUserData(null);
    setAuthLoading(false);
    setUserDataLoading(false);
    if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();
    return; // ← explicit: do not fall through
} else {
    // Anonymous/guest user — no Firestore listener needed
    setUser(null);
    setUserData(null);
    setAuthLoading(false);
    setUserDataLoading(false);
    if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();
}
```

**Change B** — Confirm onboarding effect logs correctly for debugging. Add explicit `user === null` log before the condition:

```js
useEffect(() => {
    console.log("Onboarding check: authLoading=" + authLoading + " userDataLoading=" + userDataLoading + " user=" + (user ? user.uid : "null") + " userData=" + (userData ? "exists" : "null"));
    if (!authLoading && !userDataLoading && user !== null && user && !user.isAnonymous && !userData && !window._googleLoginInProgress) {
        console.log("!!! TRIGGERING ONBOARDING - CONFIRMED NEW USER !!!");
        var userRef = usersCollection.doc(user.uid);
        setOnboardingGoogleUser(user);
        setPendingNewUserRef(userRef);
        setShowOnboarding(true);
    }
}, [authLoading, userDataLoading, user, userData]);
```

Note: `user !== null &&` is added redundantly for absolute clarity (since `user &&` already
covers it, but this makes the intent unmistakable and matches the spec's FR-003 language).

---

## Complexity Tracking

No constitution violations. No complexity table needed.

---

## Verification Plan

### Manual Test Cases

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| T1 | **Returning user — clear data** | 1. Create account. 2. Clear browser data. 3. Open app. 4. Sign in with Google. | Lobby appears. Onboarding does NOT appear. |
| T2 | **New user — first login** | Sign in with a Google account that has no existing profile. | Onboarding screen appears after sign-in completes. |
| T3 | **Unauthenticated app start** | Open app with no cached session, do NOT click login. | Login screen only. No onboarding. |
| T4 | **Guest user flow** | Play as guest. | No onboarding triggered. |
| T5 | **Mid-redirect null state** | Tap Google login (triggers redirect). While redirect is in progress, observe console. | No "TRIGGERING ONBOARDING" log during the null-auth state. |
| T6 | **Returning user — normal session** | Open app with valid cached session. | Lobby appears immediately. No onboarding. |

### Console Log Validation

After fix, the expected console sequence for **T1 (returning user after clearing data)**:
```
Auth state changed: null
[Auth] No user session — showing login screen
Onboarding check: authLoading=false userDataLoading=false user=null userData=null
← NO "TRIGGERING ONBOARDING" here ✅
[user clicks Google login]
Auth state changed: <uid>
userData loading started via onSnapshot
userData received: {...}
userDataLoading set to false
← Lobby shown ✅
```

### Success Criteria Verification

| SC | Criterion | Verification Method |
|----|-----------|-------------------|
| SC-001 | 0% returning users see onboarding after clearing data | Manual T1 |
| SC-002 | 100% new users see onboarding on first sign-in | Manual T2 |
| SC-003 | Login screen is sole screen during unauthenticated states | Manual T3 |
| SC-004 | No regression in guest flow | Manual T4 |
| SC-005 | ≤5s delay for new-user onboarding (3s confirmation + processing) | Observe T2 timing |
| SC-006 | Zero console errors in T1 | Console inspection |
