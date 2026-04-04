# Data Model: Fix False Onboarding Trigger — 006-fix-onboarding-race

**Created**: 2026-04-04  
**Branch**: 006-fix-onboarding-race

---

## Overview

No Firestore schema changes. No new entities. This fix is purely behavioral —
it corrects the authentication state machine transitions inside `useAuthState.js`.

---

## Authentication State Machine

### States

| State Name | `authLoading` | `userDataLoading` | `user` | `userData` | Screen Shown |
|------------|:---:|:---:|:---:|:---:|---|
| `INITIALIZING` | `true` | `true` | `null` | `null` | Boot splash / loading spinner |
| `UNAUTHENTICATED` | `false` | `false` | `null` | `null` | Login screen |
| `AUTH_IN_PROGRESS` | `true` | `true` | `null`* | `null` | Loading spinner (redirect in flight) |
| `PROFILE_LOADING` | `false` | `true` | User object | `null` | Loading spinner (Firestore pending) |
| `AUTHENTICATED` | `false` | `false` | User object | Profile object | Lobby |
| `NEW_USER` | `false` | `false` | User object | `null` | Onboarding screen |

*During redirect, `window._googleLoginInProgress = true` suppresses null-auth handling.

### Transition Rules (corrected)

```
INITIALIZING
  → UNAUTHENTICATED      when onAuthStateChanged fires with null AND !_googleLoginInProgress
  → AUTH_IN_PROGRESS     when onAuthStateChanged fires with null AND _googleLoginInProgress=true
  → PROFILE_LOADING      when onAuthStateChanged fires with real user (non-anonymous)

AUTH_IN_PROGRESS
  → PROFILE_LOADING      when redirect resolves with real user

PROFILE_LOADING
  → AUTHENTICATED        when onSnapshot returns doc.exists=true
  → NEW_USER             when onSnapshot + 3s confirmation returns doc.exists=false

UNAUTHENTICATED
  → AUTH_IN_PROGRESS     when user clicks Google Login (sets _googleLoginInProgress=true)

NEW_USER
  → AUTHENTICATED        when onboarding completes and profile doc is created
```

### Onboarding Trigger Invariant (FR-003)

Onboarding triggers if and only if ALL of the following are simultaneously true:

```
authLoading       === false    (auth resolution complete)
userDataLoading   === false    (Firestore check complete)
user              !== null     (a user session exists)
user.isAnonymous  === false    (real user, not guest)
userData          === null     (no Firestore profile found)
_googleLoginInProgress === false  (not mid-redirect)
```

If any condition is false, the onboarding screen must NOT appear.

---

## Existing Entities (unchanged)

### Authenticated User (Firebase Auth)

| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Unique user identifier (Firestore document key) |
| `displayName` | string \| null | Google account display name |
| `photoURL` | string \| null | Google profile photo URL |
| `isAnonymous` | boolean | `true` for guest/anonymous sessions |
| `email` | string \| null | User email address |

### User Profile (Firestore `/users/{uid}`)

| Field | Type | Description |
|-------|------|-------------|
| `displayName` | string | In-app nickname |
| `photoURL` | string | Avatar URL |
| `lang` | `'ar' \| 'en'` | Preferred language |
| `currency` | number | In-game currency balance |
| `equipped` | object | Equipped cosmetics (frames, badges, titles) |
| `loginRewards` | object | Login reward cycle tracking |

**Note**: The profile document's _presence_ vs _absence_ is the decision point for new vs returning user. No schema changes are made to this document.

---

## Window Global Variables (referenced in fix)

| Variable | Type | Set By | Read By | Purpose |
|----------|------|--------|---------|---------|
| `window._googleLoginInProgress` | boolean | `handleGoogleLogin()` (external) | `useAuthState.js` | Prevents null-auth from triggering during redirect |
| `window.__hideBootScreen` | function | Boot splash script | `useAuthState.js` | Dismisses the initial splash overlay |
| `window.usersCollection` | Firestore CollectionReference | Firebase init script | `useAuthState.js` | Reference to `/users` Firestore collection |
| `window.auth` | Firebase Auth instance | Firebase init script | `useAuthState.js` | Firebase Authentication singleton |
