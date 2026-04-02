# Task List - 004 UI Enhancement & Bug Fixes

## Phase 1: Setup & CSS Foundations
- [x] **T001**: Audit `style.css` and `mini-profile.css` for transparency artifacts.
- [x] **T002**: Set `.mp-avatar-pic` background to `transparent` in `mini-profile.css`.
- [x] **T003**: Ensure `.vip-name-animated` and `.vip-name-gradient-overlay` are globally defined.

## Phase 2: Component Refinement (Mini-Profile)
- [x] **T004**: Refactor `MiniProfilePopup` in `06-components-base.js` to use `window.VIPName`.
- [x] **T005**: Reposition `.mp-cp-label` in `mini-profile.css` (move right).
- [x] **T006**: Replace house emoji with `coupleRingImageUrl` in `MiniProfilePopup`.

## Phase 3: Avatar & Frame Transparency
- [x] **T007**: Fix `AvatarWithFrame` transparency in `06-components-base.js`.
- [x] **T008**: Fix `AvatarWithFrameV11` transparency in `ProfileIdentityElements.js`.
- [x] **T009**: Verify "My Chat" avatar frame transparency in `src/10-app.js`.

## Phase 4: Profile Title Logic
- [x] **T010**: Implement conditional `is-text` class in `UserTitleV11` (`ProfileIdentityElements.js`).
- [x] **T011**: Update CSS to apply yellow background box only to `.profile-user-title.is-text`.

## Phase 5: VIP 1-10 Parity Check
- [x] **T012**: Verify Name color/glow for Levels 1-5 (Red).
- [x] **T013**: Verify Name color/glow for Levels 6-8 (Yellow).
- [x] **T014**: Verify Name color/glow/streak for Levels 9-10 (Red Animated).
- [x] **T015**: Final visual parity check between Mini and Full profile names.

## Phase 6: Sprint 004 Extension - UI Refinements
- [x] **T018**: Fix missing name regression in `MiniProfilePopup` (`06-components-base.js`).
- [x] **T019**: Reposition `.mp-cp-label` further right in `mini-profile.css`.
- [x] **T020**: Overhaul `UserTitleV11` in `ProfileIdentityElements.js` with Image+Name patterns.
- [x] **T021**: Refactor `style.css` to support transparent titles and overlay typography.
- [x] **T022**: Final verification of name visibility and title overlay.
- [x] **T023**: Refactor `UserTitleV11` in `ProfileIdentityElements.js` with dynamic width and absolute centering.
- [x] **T024**: Update `style.css` to support absolute centering and `object-fit: fill` for titles.
- [x] **T025**: Final visual verification of precision centering.
