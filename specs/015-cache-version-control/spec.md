# Feature Specification: Cache Management & Version Control System

**Feature Branch**: `015-cache-version-control`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "Technical Specifications: Cache Management & Version Control System"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manual Cache Clearing (Priority: P1)

As a user, I want to be able to manually clear the app's cache from the settings menu so that I can resolve potential file corruption or loading issues without having to log out and log back in.

**Why this priority**: High value for support and debugging. Allows users to "fix" their app easily without technical knowledge.

**Independent Test**: User clicks "Clear Cache" in Settings, app performs a specialized reload, user verifies they are still logged in and files are re-fetched.

**Acceptance Scenarios**:

1. **Given** the user is logged in, **When** they navigate to Settings and click "Clear Cache", **Then** the browser's script/asset cache is purged and the page reloads.
2. **Given** the app has reloaded after clearing cache, **When** the user checks their account status, **Then** they should still be logged in (session/Auth tokens preserved).

---

### User Story 2 - Automated Update Notification (Priority: P1)

As a user, I want to be notified when a new version of the app is available so that I can update to the latest features and fixes immediately.

**Why this priority**: Essential for ensuring all users are on the same version, especially for multiplayer games where version mismatch can break game logic or API compatibility.

**Independent Test**: Admin updates `remote_version` in Firebase, user sees the update modal/banner automatically.

**Acceptance Scenarios**:

1. **Given** a newer version is deployed (`remote_version > local_version`), **When** the user opens the app or is active, **Then** a UI Update Modal/Banner appears.
2. **Given** the update modal is visible, **When** the user clicks "Update", **Then** the app triggers a hard refresh/cache clear and loads the new JavaScript files.

---

### User Story 3 - Viewing Update Announcements (Priority: P2)

As a user, I want to see what's new in the update before I click the update button so that I understand what changed (e.g., new features, bug fixes).

**Why this priority**: Improves user experience and engagement by explaining the value of the update and "selling" the new version to the user.

**Independent Test**: Modal displays the `update_notes` string fetched from Firebase.

**Acceptance Scenarios**:

1. **Given** an update is available, **When** the update modal appears, **Then** it should display the "Announcement" text fetched from the `update_notes` field in Firebase.

---

### Edge Cases

- **Offline Mode**: What happens when the version check fails due to no connectivity?
- **Auth Token Expiry**: Does the cache clear accidentally trigger an auth token refresh that might fail if the user's connection is spotty?
- **Concurrent Updates**: If multiple versions are pushed in quick succession, how does the modal handle the most recent `update_notes`?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "Clear Cache" button labeled "Clear Cache" in the Settings Menu at the bottom.
- **FR-002**: System MUST integrate with Firebase Realtime Database or Firestore to store and fetch `remote_version` and `update_notes`.
- **FR-003**: System MUST compare `window.PRO_SPY_VERSION` (local) with `remote_version` on app startup.
- **FR-004**: System MUST display a UI Update Modal/Banner when `remote_version > local_version`.
- **FR-005**: The "Update" button in the modal MUST trigger a hard refresh and client-side cache clear specifically for scripts and assets.
- **FR-006**: The update/cache-clearing process MUST NOT invalidate the user’s session or log them out (Auth tokens MUST remain intact).
- **FR-007**: System MUST fetch the `update_notes` field from Firebase and display it as an "Announcement" within the update modal.

### Key Entities *(include if feature involves data)*

- **AppVersionConfig**: Metadata stored in Firebase containing `remote_version` (Number/String) and `update_notes` (String).
- **ClientVersionState**: The current version of the code running on the client, defined by `window.PRO_SPY_VERSION`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of users who click "Clear Cache" remain logged in after the app reloads.
- **SC-002**: The Update Modal appears for 100% of active clients within 60 seconds of a `remote_version` increase in Firebase.
- **SC-003**: 100% of "Update" clicks result in the client executing the most recent JavaScript files deployed to the server.

## Assumptions

- **Assumption 1**: Firebase Authentication handles token persistence in a way that is resistant to standard asset cache clearing (e.g., using IndexedDB or secure cookies).
- **Assumption 2**: The project architecture (No NPM/No Builder) relies on browser cache for `.js` and `.css` files, which can be managed via the `caches` API or cache-busting headers.
- **Assumption 3**: The administrator will have access to the Firebase console to update the version numbers and notes.
- **Assumption 4**: Users have browsers that support the `caches` API (Standard in modern PWAs).
