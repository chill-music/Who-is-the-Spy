# src/features/profile Directory Map

Contains the core user profile system, achievements, and social feed ("Moments").

## Profile Views

| File | Purpose |
| :--- | :--- |
| **`ProfileV11.js`** | The main full-screen profile layout. |
| **`ProfileHeader.js`** | Top section (Banner, Avatar, Frames, and IDs). |
| **`ProfileIdentity.js`** | Display of user relationships, tribe signs, and gender. |
| **`ProfileStats.js`** | Detailed view of wins, losses, and game activity. |
| **`ProfileTabs.js`** | Navigation between Stats, Moments, Friends, and Admin tools. |

## Feature Modules

| File | Purpose |
| :--- | :--- |
| **`GiftWall.js`** | Visual gallery of gifts received from other players. |
| **`GiftWallDetailModal.js`** | Detailed view of a specific gift or sender. |
| **`MomentsSystem.js`** | Social feed for posting updates, photos, and comments. |
| **`AchievementsDisplay.js`** | Grid representing unlocked user milestones and badges. |
| **`ProfileAdmin.js`** | Management tools for staff (Banning, Warn, etc.) within a profile context. |
| **`ProfileFriendsSection.js`** | List of friends and pending relationship indicators. |

## Components & Helpers

| File | Purpose |
| :--- | :--- |
| **`ProfileHelpers.js`** | Utility functions for checking roles (Admin/Owner) and status. |
| **`ProfileIdentityElements.js`** | UI parts for relationship indicators (BFF, Couple). |
| **`ProfileFamilySignBadge.js`** | UI for tribal "Sign" markers. |
| **`ProfileEffects.js`** | Decorative effects like Sakura petals or Heart bursts. |
| **`WinRateCircle.js`** | Visual chart representing the user's winning percentage. |
