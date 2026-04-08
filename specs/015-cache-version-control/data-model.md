# Data Model: Cache & Versioning

## Entities

### 1. AppVersionConfig (Firestore)
**Path**: `config/versioning`

| Field | Type | Description |
|-------|------|-------------|
| `remote_version` | String | Semantic version of the latest stable release (e.g., "1.2.3"). |
| `update_notes` | String | Markdown or plain text describing what's new in this version. |
| `last_updated` | Timestamp | Server-side timestamp for record keeping. |

### 2. ClientVersionState (Global)
**Source**: `window.PRO_SPY_VERSION`

| Property | Type | Description |
|----------|------|-------------|
| `PRO_SPY_VERSION` | String | Injected version string in `src/01-config.js`. |

## Key Logic Flows

### Version Check Procedure
1. Initialize `VersionManager` on app start.
2. Subscribe to `config/versioning` via `onSnapshot`.
3. If `remote_version` from Firestore > `PRO_SPY_VERSION`:
    - Display `UpdateModal`.
    - Pass `update_notes` to the modal.

### Cache Purge Procedure
1. User clicks "Update" or "Clear Cache".
2. `VersionManager.clearCacheAndReload()` is called.
3. Iterate over `window.caches.keys()`.
4. Delete each cache found.
5. Wait for all deletions to complete.
6. Trigger `window.location.reload()`.
