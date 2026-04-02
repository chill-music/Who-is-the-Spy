# Folder: User Identity & Profiles (src/features/profile)

## Overview
This directory contains the logic and UI for the application's comprehensive profile system. It handles user identity, social standings (VIP, achievements), and community interactions like "Moments."

## High-Level Logic

### [ProfileV11.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/profile/ProfileV11.js)
- **Purpose**: Master Profile View.
- **Logic**: The latest (v11) iteration of the player profile. It integrates every sub-component below into a single, cohesive, high-status card.
- **Dependencies**: Orchestrates all sub-components in this directory and consumes data from `window.fetchMiniProfileData`.

### Identity & Status
- **[ProfileHeader.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/profile/ProfileHeader.js)**: Top profile section containing the avatar, display name, and quick-action buttons.
- **[ProfileIdentity.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/profile/ProfileIdentity.js)**: Global identity logic used by multiple views.
- **[ProfileIdentityElements.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/profile/ProfileIdentityElements.js)**: Individual UI elements for badges, role labels, and VIP status indicators.
- **[ProfileEffects.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/profile/ProfileEffects.js)**: Technical logic for VIP animations (Glows, Light Streaks) and floating icon effects.

### Stats & Social
- **[ProfileStats.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/profile/ProfileStats.js)**: Displays cumulative performance counters (Wins/Losses, Charisma, Total Visits).
- **[WinRateCircle.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/profile/WinRateCircle.js)**: Radial chart component for performance visualization.
- **[AchievementsDisplay.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/profile/AchievementsDisplay.js)**: Fetches and displays unlocked milestones for the current user.
- **[ProfileFriendsSection.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/profile/ProfileFriendsSection.js)**: Integrated social management tool for checking mutual friends.

### Social Mechanisms
- **[GiftWall.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/profile/GiftWall.js)**: A persistent record of virtual gifts received by the user.
- **[GiftWallDetailModal.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/profile/GiftWallDetailModal.js)**: Shows exactly *who* sent *what*, with timestamps.
- **[MomentsSystem.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/profile/MomentsSystem.js)**: The community photo feed. Handles uploads, comments, and real-time social engagement.

### Helpers & Utilities
- **[ProfileAdmin.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/profile/ProfileAdmin.js)**: Private configuration tools for the user (Bio editing, ID change, Name changes).
- **[ProfileHelpers.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/profile/ProfileHelpers.js)**: Internal computational utilities for profile data extraction.
- **[ProfileTabs.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/profile/ProfileTabs.js)**: The navigation controller within the multi-tab profile system.
- **[ProfileFamilySignBadge.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/profile/ProfileFamilySignBadge.js)**: Logic for calculating and showing the appropriate "Family Sign" level badge.
