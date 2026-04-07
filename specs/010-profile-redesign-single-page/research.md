# Research: Profile Single-Page Redesign

## Tab System Removal
The current `ProfileV11` uses a `useState('about')` for `activeTab`. This will be removed. The `ProfileTabs` component will no longer be rendered.

## Component Reordering
The user requested a specific order:
1. **User ID (ProfileIdentity)**: Already at the top.
2. **Moments Box**: Move `MomentsSection` to follow `ProfileIdentity`.
3. **Gift Wall Box**: Move `GiftWallV11` to follow `MomentsSection`.
4. **Stats**: `ProfileStats` and other "About" content will follow.

## Scrolling Layout
The `profile-glass-card` in `ProfileV11.js` likely needs `overflow-y: auto` to support the now-tall content. I will wrap the content in a scrollable div if necessary to keep the header fixed, or allow the whole card to scroll.

## Cleanup
- **Friends Section**: `ProfileFriendsSection` will be removed.
- **Games Section**: Redundant with "About", so its specific tab content will be removed.
- **Scripts**: Remove `ProfileTabs.js` from `index.html`.
