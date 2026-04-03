# Task List - 005 Marriage & Wedding Hall Restoration

Breakdown of implementation tasks to restore and enhance the marriage features.

## Phase 1: Global Connections
- [x] **T001**: Update `GlobalModals.js` to correctly pass `onAccept`, `onDecline`, and `onDivorce` props to `WeddingHallModal`.
- [x] **T002**: Connect "Propose" button in `WeddingHallModal` to navigate directly to the Rings category in `ShopModal`.

## Phase 2: Proposals UI (Received & Sent)
- [ ] **T003**: Implement `rendering` for `tab === 'proposals'` in `WeddingHallModal.js`.
- [ ] **T004**: Add "Received Proposals" list with user avatars, messages, and Accept/Decline actions.
- [ ] **T005**: Add "Sent Proposals" status section (pending/outgoing).

## Phase 3: Relationship Management (Divorce)
- [ ] **T006**: Implement `rendering` for `tab === 'divorce'` in `WeddingHallModal.js`.
- [ ] **T007**: Show current partner details and a "Break Up" button with confirmation.
- [ ] **T008**: Ensure the "Break Up" button triggers `divorceCouple` service correctly.

## Phase 4: Premium Wedding Feed
- [ ] **T009**: Complete the `tab === 'feed'` rendering in `WeddingHallModal.js`.
- [ ] **T010**: Design a premium card for each couple with their avatars, glowing ring emoji, and marriage date.
- [ ] **T011**: Add glassmorphism effects and smooth tab-switching animations.

## Phase 5: Polish & Final Verification
- [ ] **T012**: Comprehensive verification of Proposal -> Accept/Decline -> Divorce lifecycle.
- [ ] **T013**: Verify localized text for Arabic/English.
- [ ] **T014**: Cleanup any legacy console logs or unfinished UI elements.
