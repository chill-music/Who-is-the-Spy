# Research finding: 007-shop-leaderboard-redesign

## Decision: BFF Effects Integration
- **Rationale**: The core of the BFF visual selection is managed via `BFF_TOKEN_ITEMS` and the Shop's `bff_tokens` tab. There isn't a standalone "BFF Effects" page; the user likely refers to the selection UI within the Shop and the relationship rendering in the BFF profiles.
- **Alternatives considered**: Creating a new specialized modal. Rejected because it would deviate from the existing "Shop" workflow.

## Decision: Podium Asset Implementation
- **Rationale**: Assets found in `icos/leaderboard tops/` (1.png, 2.png, 3.png) are high-resolution frames. We will use them as absolute-positioned overlays on top of the avatar circular container.
- **Alternatives considered**: Using SVGs or pure CSS frames. Rejected because the provided PNGs contain intricate artistic details that match the branding.

## Decision: CSS Token Standardization
- **Rationale**: All modernizing styles will be added to `vip.css` to keep the minified `style.css` untouched and preserve "Premium" feature isolation.
- **Alternatives considered**: Creating a new `shop.css`. Rejected to minimize the number of `<link>` tags in `index.html`.
