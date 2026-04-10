# Research: Defuse Master Refactor

## Decisions

### 1. Localization Dictionary Structure
- **Decision**: Use a flat mapping for simple UI strings and a nested object for complex card definitions.
- **Rationale**: Keeps common labels easy to access (`T[lang].start`) while allowing card data to be grouped naturally (`T[lang].cards.bomb.desc`).
- **Alternatives**: Using a third-party library (i18next) was rejected to avoid adding dependencies to the "No NPM" project.

### 2. Manual Language Toggle Placement
- **Decision**: A floating button with `position: fixed; bottom: 80px; right: 16px; z-index: 9999`.
- **Rationale**: Keeps it accessible through the Lobby and Game phases without interfering with the bottom "action bar" or hand navigation.
- **Alternatives**: Adding it to the Top Bar was considered but space is limited due to player avatars.

### 3. IIFE Packaging
- **Decision**: Standard IIFE wrapper: `(function(React, ReactDOM) { ... })(window.React, window.ReactDOM)`.
- **Rationale**: Explicitly injection of global dependencies makes the code easier to test and follow. Exposes `window.DefuseMasterApp` for the platform host to mount.
- **Alternatives**: Attaching directly to `window` inside the main function (messier).

## Findings
- **Card Descriptions**: Arabic text needs careful padding adjustments when converted to English as English strings are ~25% longer on average.
- **React Availability**: Project uses React 18 through a CDN script in `index.html`.
