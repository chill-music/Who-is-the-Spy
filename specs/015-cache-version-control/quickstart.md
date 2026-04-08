# Quickstart: Cache & Versioning

## For Developers

### Adding a new version
1. Update `window.PRO_SPY_VERSION` in `src/01-config.js`.
2. Deploy the new code to the CDN.
3. Open Firebase Console → Firestore.
4. Update `config/versioning` document with the new `remote_version` and `update_notes`.

### Testing Cache Clearing
1. Open the app and log in.
2. Open Browser DevTools → Application Tab → Cache Storage.
3. Verify there are entries there.
4. In the app Settings, click "Clear Cache".
5. App should reload.
6. Verify Cache Storage is now empty.
7. Verify you are still logged in.

## For Administrators

### Triggering an "Update Available" notification
1. Go to Firestore → `config/versioning`.
2. Change `remote_version` to a value greater than the current deployed version.
3. All active users will see the update modal within seconds.
