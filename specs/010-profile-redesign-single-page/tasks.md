# Tasks: Profile Redesign: Single Page Layout

**Feature Name**: Profile Redesign: Single Page Layout
**Status**: Draft
**Implementation Strategy**: MVP first - merge basic sections (Moments/Gifts) then clean up tabs and friends.

## Phase 1: Setup

- [X] T001 Verify project structure and locate `ProfileV11.js` at `src/features/profile/ProfileV11.js`

## Phase 2: Foundational

- [X] T002 Research `ProfileV11.js` for existing tab state management (`activeTab`) and layout containers

## Phase 3: [US1] Unified Profile Layout

**Goal**: Transform the tabbed interface into a single, scrollable vertical view.
**Independent Test Criteria**: All sections (Moments, Gifts, Stats) visible simultaneously on scroll.

- [X] T003 [P] [US1] Remove `activeTab` state and `ProfileTabs` component from `src/features/profile/ProfileV11.js`
- [X] T004 [US1] Convert conditional tab rendering into a sequential component list in `src/features/profile/ProfileV11.js`
- [X] T005 [US1] Reorder logic: Position `MomentsSection` after `ProfileIdentity` in `src/features/profile/ProfileV11.js`
- [X] T006 [US1] Position `GiftWallV11` immediately after `MomentsSection` in `src/features/profile/ProfileV11.js`
- [X] T007 [US1] Ensure `ProfileStats`, `BFFStripProfile`, and Guard Section are rendered after the Gift Wall in `src/features/profile/ProfileV11.js`
- [X] T008 [US1] Apply vertical layout styling and scrollable container properties to `src/features/profile/ProfileV11.js`

## Phase 4: [US2: Removal of Excess Elements]

**Goal**: Clean up unused tabs and components (Friends, redundant Games info).
**Independent Test Criteria**: Tabs are gone; Friends list is gone; redundant achievements are removed.

- [X] T009 [US2] Remove `ProfileFriendsSection` component from the profile view in `src/features/profile/ProfileV11.js`
- [X] T010 [US2] Consolidate `AchievementsDisplayV11` to remove redundant "Games" tab duplication in `src/features/profile/ProfileV11.js`
- [X] T011 [US2] Remove `ProfileTabs.js` script tag from `index.html`

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T012 Verify all stats (Level, Rank, Win/Loss) remain visible and accurate after layout change
- [X] T013 Perform manual UI/UX pass to ensure spacing between the new vertical sections is consistent

## Dependencies
- US1 is the core; US2 can be done in parallel or immediately after US1.

## Implementation Strategy
1. Modify `ProfileV11.js` to render all sections at once.
2. Adjust CSS/Layout to handle scrolling.
3. Remove tabs and redundant sections once they are verified in the main flow.
