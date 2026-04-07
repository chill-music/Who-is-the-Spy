# Feature Specification: Profile Redesign: Single Page Layout

**Feature Branch**: `010-profile-redesign-single-page`
**Created**: 2026-04-06
**Status**: Draft
**Input**: User description: "In the main profile, we have a tab system consisting of 'About, Games, Friends, Gifts, and Moments.' We want to remove these tabs entirely and have the content of the profile displayed directly on one page. First, the Moments box should be placed directly underneath the User ID. Second, the 🎁 Gift Wall box should be placed immediately below the Moments box. We want to completely remove the Friends box from the profile as it is unnecessary. We also want to delete the Games box since that information is already included in the About section."

## User Scenarios & Testing *(mandatory)*

### Scenario 1: Initial Profile View
**User Flow**:
1. User opens their own profile or another user's profile.
2. The profile layout displays all information on a single page without tabs.
3. User sees their avatar, name, and User ID at the top.
4. User sees stats (Level, Rank, Win%, Losses, Wins) clearly visible.
5. User scrolls down and sees the Moments box directly beneath the header/stats.
6. User scrolls further and sees the Gift Wall box immediately below the Moments box.
7. User finds the "About" content (inclusive of gameplay info previously in "Games") at the bottom of the scrollable area.

### Scenario 2: Verification of Removed Elements
**User Flow**:
1. User examines the profile page for any tab-switching UI.
2. User confirms that "About, Games, Friends, Gifts, Moments" tabs are gone.
3. User confirms that the "Friends" list/box is no longer present on the profile page.
4. User confirms that a separate "Games" section is removed, with its data merged into "About".

## Functional Requirements

### 1. Tab System Removal
- The `TabSystem` (or equivalent component) currently managing "About, Games, Friends, Gifts, Moments" must be entirely removed from the Profile view.
- All content previously housed within these tabs must be rendered sequentially in the main profile container.

### 2. Layout Restructuring
- **User ID/Stats**: Must remain at the top of the profile, visible immediately upon opening.
- **Moments Box**: Must be positioned immediately following the User ID/Stats header.
- **Gift Wall Box**: Must be positioned immediately follows the Moments box.
- **About/Info Section**: Should follow the Gift Wall, containing user details and stats previously spread across "About" and "Games".

### 3. Element Removal
- **Friends Box**: The component displaying the friends list on the profile must be completely removed from the DOM and layout.
- **Games Box**: The specific "Games" box/tab content should be removed if it's redundant. If specific stats only existed there, they should be merged into the "About" section or general stats view.

### 4. Responsive & Scrolling
- The profile container must support vertical scrolling if the combined content exceeds the viewport height.
- Ensure transitions/loading states for the profile content (Moments, Gifts) handle the vertical layout smoothly.

## Success Criteria

- **Zero Tabs**: The profile page contains no tab-switching buttons or navigation for "About, Games, Friends, Gifts, Moments".
- **Visual Accuracy**: Moments box and Gift Wall box are correctly ordered underneath the User ID header.
- **Data Integrity**: Level, Rank, and Win/Loss stats are visible and accurate.
- **Cleanup**: The Friends list is nowhere to be found on the profile page.
- **Performance**: The single-page profile loads efficiently without layout jumps.

## Key Entities *(if data involved)*

- **UserProfile**: The core data structure containing user information, stats, moments, and gifts.

## Assumptions

- The stats mentioned ("⚡ Level, 🎖️ Rank, Win%, 💀 Losses, 🏆 Wins") are currently part of the profile header or a persistent stats bar and do not need to be moved, only preserved.
- Merging "Games" into "About" means that if there were game-specific stats in the Games tab that aren't in About, they should be moved to the About section. If it's already an exact duplicate, simple deletion of the Games component is sufficient.

## Dependencies

- Existing `MomentsComponent`, `GiftWallComponent`, and `AboutComponent` (or their equivalents) must be compatible with being rendered together in a scrollable list.
