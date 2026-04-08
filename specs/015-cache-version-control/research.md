# Research: Cache Management & Version Control

## Summary
The research confirms that the browser's `caches` API is the most effective way to manually clear assets (JS, CSS, Images) in a PWA/CDN-based app without affecting the user's login session (which resides in IndexedDB).

## Key Findings

### 1. Cache Clearing Technique
- **Technique**: Use `window.caches` (Storage API).
- **Command**: `caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))))`.
- **Scope**: This only deletes entries in the "Cache Storage" (used by Service Workers and potentially the browser for cached scripts).
- **Preservation**: This does **not** touch `localStorage`, `sessionStorage`, or `IndexedDB`.
- **Firebase Auth**: Firebase Auth v9+ uses `IndexedDB` for token storage. Thus, clearing `caches` will **not** log the user out.

### 2. Hard Refresh Implementation
- **Issue**: `location.reload(true)` is deprecated in many browsers and may still serve from memory cache.
- **Solution**: 
    1. Clear Cache Storage via API.
    2. Optional: Unregister Service Worker (if one exists).
    3. `window.location.reload()`.
- **Verdict**: In our architecture (No SW mentioned yet, but PWA logic often uses SW), clearing caches + `location.reload()` is sufficient for most modern browsers.

### 3. Version Tracking Strategy
- **Service**: Firebase Firestore (already used in project).
- **Path**: `config/versioning` document.
- **Fields**:
  - `remote_version`: (string) e.g., "2.5.0".
  - `update_notes`: (string) Announcement text.
- **Client implementation**: 
  - Compare `remote_version` against `window.PRO_SPY_VERSION`.
  - Use `onSnapshot` for real-time updates while the app is open (minimal overhead for a single doc).

### 4. Browser Compatibility
- `caches` API is supported in all modern browsers (Chrome, Safari 11+, Firefox, Edge).
- Fallback for legacy browsers: None needed as the app already requires modern JS for React/Firebase.

## Decision Table

| Requirement | Chosen Approach | Rationale |
|-------------|-----------------|-----------|
| Clear Cache | `caches.delete()` | Safely purges assets without affecting Auth (IndexedDB). |
| Hard Refresh | `location.reload()` after delay | Standard and reliable once cache storage is cleared. |
| Version Check | Firestore `onSnapshot` | Provides "live" update notifications without polling loops. |
| Configuration | `window.PRO_SPY_VERSION` | Simple, persistent constant handled by admin at deploy time. |
