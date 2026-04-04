# Feature Specification: Fix False Onboarding Trigger for Returning Google Users

**Feature Branch**: `006-fix-onboarding-race`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "Fix false onboarding trigger for existing Google users on re-login after clearing browser data"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Returning User Sees Lobby, Not Onboarding (Priority: P1)

As a returning player who has previously created an account and completed onboarding, I should land directly in the game lobby after logging in with Google — even if I cleared my browser data before the session.

**Why this priority**: This is the core defect. Returning users with valid cloud-stored accounts are incorrectly presented with the new-user onboarding flow. This causes confusion, potential data loss if they re-submit onboarding, and loss of trust in the app.

**Independent Test**: Can be fully tested by: (1) creating a user account, (2) clearing browser data, (3) reopening the app and signing in with the same Google account — and verifying the lobby appears with the user's existing profile intact.

**Acceptance Scenarios**:

1. **Given** a user has an existing account in the cloud, **When** they clear browser data and log in with Google, **Then** their existing profile and lobby screen are shown — the "Welcome to PRO SPY!" onboarding screen must NOT appear.
2. **Given** a user has an existing account, **When** the app is loading and the sign-in process is still in progress, **Then** no onboarding screen appears prematurely during any loading phase.
3. **Given** a user has an existing account, **When** their cloud profile data loads successfully after sign-in, **Then** they see the lobby with their existing nickname, avatar, and stats intact.

---

### User Story 2 - New User Correctly Sees Onboarding (Priority: P2)

As a brand-new player who has never created an account, I should see the "Welcome to PRO SPY!" onboarding screen after signing in with Google for the first time, so I can set up my profile.

**Why this priority**: The fix must not break legitimate new-user onboarding. This story validates that the corrected logic still triggers onboarding exactly when it should.

**Independent Test**: Can be fully tested by signing in with a Google account that has never been used in the app and verifying that the onboarding screen appears.

**Acceptance Scenarios**:

1. **Given** a Google account with no existing app profile, **When** the user signs in for the first time, **Then** the onboarding screen appears after sign-in and cloud data retrieval are both complete.
2. **Given** a user has completed onboarding once, **When** they log out and log back in, **Then** the onboarding screen does NOT appear again.

---

### User Story 3 - Unauthenticated App State Shows Login Screen Only (Priority: P3)

As any visitor to the app before logging in, I should see the login screen — and nothing else — until I actively choose to authenticate.

**Why this priority**: The root cause of the bug is that the onboarding logic fires during the brief moment when the app has no authenticated user yet. This story validates that the unauthenticated state is handled cleanly.

**Independent Test**: Can be fully tested by opening the app without any cached session and verifying only the login screen renders — no onboarding, no lobby.

**Acceptance Scenarios**:

1. **Given** the app has just started with no cached session, **When** the authentication system reports no current user, **Then** the login screen is shown and no onboarding or lobby screen appears.
2. **Given** the app is in the middle of authenticating a Google sign-in via redirect, **When** a transient "no user" state is briefly observed, **Then** the onboarding screen does NOT trigger during this period.

---

### Edge Cases

- What happens when the cloud profile data retrieval fails due to a brief network interruption right after sign-in — does the app retry and confirm before deciding the user is new?
- What happens when a user clears browser data mid-session and the app detects authentication loss — does it show the login screen cleanly without accidentally triggering onboarding?
- What happens if sign-in via Google redirect produces a transient null-user state before the redirect result resolves — is this period treated as "not yet authenticated" rather than "confirmed unauthenticated"?
- What happens when a user signs in on a device that has slow connectivity and the cloud profile takes longer than usual to arrive — does the onboarding only appear after a confirmed cloud absence, not a timeout guess?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST NOT display the onboarding screen at any point when no authenticated user session is active (i.e., before login).
- **FR-002**: The system MUST wait for both sign-in completion AND cloud profile retrieval to finish before evaluating whether to show onboarding.
- **FR-003**: The onboarding screen MUST only be shown when: (a) a real, non-guest user is confirmed as signed in, AND (b) their cloud profile is confirmed to not exist after retrieval.
- **FR-004**: When the authentication system reports no user initially (app startup without cached session), the system MUST route to the login screen, not to onboarding.
- **FR-005**: When a sign-in process is ongoing (e.g., after a Google redirect but before the user object is confirmed), the system MUST hold all routing decisions until the process resolves.
- **FR-006**: After sign-in completes, the system MUST attempt cloud profile retrieval before concluding the user is new.
- **FR-007**: Cloud profile retrieval MUST include a confirmation step that tolerates brief delays (e.g., cold connection startup) before concluding no profile exists.
- **FR-008**: If cloud profile retrieval confirms no profile exists for a signed-in, non-guest user, the system MUST then (and only then) trigger the onboarding screen.
- **FR-009**: Guest/anonymous users MUST never trigger the onboarding flow, regardless of whether their cloud profile exists.
- **FR-010**: The login screen MUST remain the default state for any unauthenticated or mid-authentication period.

### Key Entities

- **Authenticated User**: A confirmed, non-anonymous user session returned by the sign-in system. Has a unique identifier that links to a cloud profile.
- **Cloud Profile**: The user's stored profile data in the cloud, keyed by the authenticated user's unique identifier. May not exist for brand-new users.
- **Authentication State**: The current state of the sign-in process — one of: loading/pending, signed in (real user), signed in (guest), or signed out.
- **Onboarding State**: A boolean condition that, once set to true, presents the profile setup screen to the user. Must only be triggered by confirmed new real users.
- **Login-in-Progress Flag**: A transient signal indicating a Google sign-in redirect is underway and intermediate null-auth states should be ignored.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0% of returning users (with existing cloud profiles) see the onboarding screen after clearing browser data and re-authenticating with Google.
- **SC-002**: 100% of brand-new users (no existing cloud profile) still see the onboarding screen correctly on their first sign-in.
- **SC-003**: The login screen is the sole screen shown during all unauthenticated states — confirmed via manual and automated testing across sign-in flows.
- **SC-004**: No regression in the guest/anonymous user flow — anonymous users continue to access the app without onboarding.
- **SC-005**: The onboarding trigger delay (waiting for cloud profile retrieval confirmation) adds no more than 5 seconds to the new-user first-time experience.
- **SC-006**: Zero console errors related to premature onboarding trigger in the returning-user flow.

---

## Assumptions

- The app uses a cloud-based profile store (not local storage) as the source of truth for user profiles, so clearing browser data does not delete the user's account.
- Google sign-in via redirect is the primary authentication method affected; email/password or other providers are either not used or share the same state-management logic.
- The fix is scoped to the authentication state management logic only — no changes to the onboarding UI content, profile schema, or other app flows are required.
- A returning user is defined as any user whose unique cloud identifier already has a profile document in the cloud profile store.
- The 3-second delay before concluding "no profile exists" is a reasonable tolerance window for cloud connectivity; this assumption may need revision based on observed real-world latency.
- The "Login-in-Progress Flag" mechanism already exists in the codebase and only needs its usage extended to guard the onboarding condition check.
