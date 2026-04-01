# Tasks for UI Enhancements and Bug Fixes (004)

## Phase 1: Setup
- [x] T001 Verify project structure and branch `004-ui-enhancement-bug-fixes`

## Phase 2: Foundational Tasks
- [x] T002 [P] Establish unified gender icon assets in `src/01-config.js` or CSS

## Phase 3: [US1] Premium Mini Profile Experience (P1)
**Goal**: Polished, responsive mini profile with VIP images and functional "Our Home" button.
- [x] T003 [P] [US1] Refactor `MiniProfilePopup` CSS for full responsiveness in `src/06-components-base.js`
- [x] T004 [US1] Fix "His CP" button label to "Our Home 🏠" in `src/06-components-base.js` (Replaced by T039)
- [x] T005 [US1] Integrate `VIPBadge` images next to user ID in `src/06-components-base.js`
- [x] T006 [US1] Implement unified gender icons in `src/06-components-base.js`
- [x] T007 [US1] Update `VIPName` to support transparent background in `src/17-vip.js`
- [x] T017 [US1] Wire "Our Home 🏠" to open `CoupleCardModal` in `src/06-components-base.js`
- [x] T018 [US1] Fix "Our Home 🏠" desktop overflow/clipping in `src/06-components-base.js`
- [x] T019 [US1] Implement VIP 10 transparent name style in `style.css`
- [/] T020 [US1] Fix "Send Gift" button (Replaced by T042)
- [/] T021 [US1] Add "Block" and "Report" buttons to three-dots menu (Replaced by T043, T044)

## Phase 4: [US2] Global Avatar Personalization (P1)
- [x] T008 [P] [US2] Modify `AvatarWithFrame` in `src/06-components-base.js` to use percentage-based sizing

## Phase 5: [US3] Dynamic Gift Wall & Privacy (P2)
- [x] T009 [P] [US3] Update `GiftWallV11` in `src/features/profile/GiftWall.js` to fetch all gifts
- [x] T010 [US3] Implement `isPrivate` check in `src/features/profile/GiftWall.js`

## Phase 6: [US4] Tribe Interactions (P3)
- [x] T011 [P] [US4] Add Tribe Box counter to `FamilyChatModal.js`
- [x] T012 [P] [US4] Increase `FamilySignBadge` dimensions (1.7x)

## Phase 7: Polish & Cleanup
- [x] T013 UI consistency audit
- [x] T014 Clean up debug logs

- [x] Phase 8: Mini Profile Refinements
    - [x] T039: Localize "Our Home" to His/Her Home based on gender
    - [x] T040: Remove yellow conic-gradient (flame ring) around avatar
    - [x] T041: Perfect Avatar Frame centering/scaling
    - [x] T042: Fix Send Gift button to trigger global modal
    - [x] T043: Fix Options Menu Z-Index (badges overlap)
    - [x] T044: Finalize Block functionality with feedback
- [x] Phase 9: Family Gacha Polish
    - [x] T025: Fix 600-coin Gacha spin "Insufficient Funds" check
    - [x] T026: Move "Today: X/50" under Cost Button with better design
    - [x] T034: Show won gift name in result box
    - [x] T036: Support Avatar Frame images/GIFs in rewards grid
    - [x] T037: Apply rarity-based glow to gift cards in grid
    - [x] T038: Add blue highlights/glow for 600-coin spins
- [x] Phase 10: Lobby Enhancement
    - [x] T030: Add Lucky Games shortcut box under "Are You the Spy?"
- [/] Phase 11: Final Verification & Testing
    - [ ] T045: Cross-browser testing for new UI elements
    - [ ] T046: Verify mobile responsiveness for Mini Profile
    - [ ] T047: Final walkthrough presentation

- [x] Phase 12: Mini Profile UX Refinements (P0)
    - [x] T048: Fix "Send Gift" button to call `window.openGiftModal(profile)`
    - [x] T049: Resolve User Name visibility issues (hidden/transparent text)
    - [x] T050: Implement VIP 10 red glow and animated light streak effect
    - [x] T051: Align "His/Her Home" and partner avatar for desktop consistency
