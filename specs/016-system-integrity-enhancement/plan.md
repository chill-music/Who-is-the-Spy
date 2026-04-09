# Implementation Plan: System Enhancement & Integrity Check

**Branch**: `016-system-integrity-enhancement` | **Date**: 2024-04-09 | **Spec**: [spec.md](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/specs/016-system-integrity-enhancement/spec.md)
**Input**: Feature specification from `/specs/016-system-integrity-enhancement/spec.md`

## Summary
Implement critical stability enhancements to the "Who is the Spy" platform. This includes a **Forced Update** mechanism for breaking changes, **Room State Persistence** to survive page refreshes, and a **Connectivity Monitor** UI to provide real-time network feedback. We will leverage `localStorage` for session persistence and Firestore `onSnapshot` for live version monitoring.

## Technical Context

**Language/Version**: JavaScript (ES6), React (CDN)  
**Primary Dependencies**: Firebase Firestore, Browser Web APIs (Caches, LocalStorage)  
**Storage**: Firestore (`config/versioning`), `localStorage` (`pro_spy_active_room_id`)  
**Testing**: Manual DevTools (Network Offline emulation), browser refresh cycles.  
**Target Platform**: Progressive Web App (Mobile/Desktop)
**Project Type**: Multiplayer Web Game  
**Performance Goals**: 60fps UI, <1s auto-rejoin trigger.  
**Constraints**: No-Bundler architecture (CDN scripts), offline-aware.  
**Scale/Scope**: 50+ concurrent rooms, guest-heavy user base.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **🔴 Dead Code Prevention**: Ensure all interception logic in `index.html` is reused or pruned.
- [x] **🟠 Logic & Async Accountability**: Await `window.caches.delete` during forced reloads. Handle Firestore listener errors gracefully.
- [x] **🟡 Structural Discipline (SOLID)**: Keep state recovery logic in `10-app.js` and `useRoom.js` separated by concern.
- [x] **🔵 Dependency Sanitization**: No new external NPM packages (remain CDN only).
- [x] **⚪ Type & Null Robustness**: Add JSDoc to `VersionManager` and `ConnectivityMonitor`.

## Project Structure

### Documentation (this feature)

```text
specs/016-system-integrity-enhancement/
├── plan.md              # This file
├── spec.md              # Feature specification
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # Implementation tasks
```

### Source Code

```text
index.html               # Updated cache-interception for assets/
src/
├── 10-app.js            # Injected auto-rejoin initialization
├── app/
│   └── useRoom.js       # localStorage persistence logic
├── components/
│   ├── services/
│   │   └── VersionManager.js    # Forced update logic (critical flag)
│   └── ui/
│       └── ConnectivityMonitor.js # [NEW] Network status banner
└── features/
    └── app/
        └── components/
            └── GlobalModals.js  # ConnectivityMonitor integration
```

## Technical Design

### 1. Forced Update Mechanism
- **Firestore Schema**: `config/versioning` -> `{ remote_version: string, critical: boolean }`.
- **Logic**: In `VersionManager.js`, when a version mismatch is detected:
  - If `critical === true`:
    - Display a non-dismissible `SystemUpdatingOverlay`.
    - Call `clearCacheAndReload()` after 2 seconds.
  - Else:
    - Trigger `UpdateModal` (standard snooze behavior).

### 2. Room Recovery (Auto-rejoin)
- **Persistence**: 
  - `useRoom.js`: Whenever `roomId` is defined, `localStorage.setItem('pro_spy_active_room_id', roomId)`.
  - `useRoom.js`: On `setRoomId('')`, clear the storage.
- **Initialization**:
  - `10-app.js`: In the `useEffect` that runs on mount, if `localStorage` has a room ID, call `setRoomId(savedId)`.

### 3. Connectivity Bar
- **State**: Use a simple local state in a top-level component or a new service.
- **Implementation**:
  - Use `window.addEventListener('online')` and `window.addEventListener('offline')`.
  - Check Firestore's `_firestore._delegate._persistenceKey` (or similar) or simply wrap the global `onSnapshot` listeners to catch `code: "unavailable"`.

### 4. Lobby Scaling
- **Constraint**: `BrowseRoomsModal.js` snapshot query.
- **Change**: Add `.limit(50)` to the Firestore collection reference.
