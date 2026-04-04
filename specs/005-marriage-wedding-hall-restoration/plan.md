# Implementation Plan: Marriage & Wedding Hall Restoration

Restore the core architecture and UI components for the "Add Partner" and "Wedding Hall" features.

## 1. Technical Strategy
- **Orchestration**: `GlobalModals.js` maintains the visibility state for `showWeddingHall`, `showProposalModal`, and `showCoupleCard`.
- **State Management**: `WeddingHallModal.js` will handle its own tab-state and fetch current proposals/weddings from Firestore.
- **Service Integration**: Use `window.acceptProposal`, `window.declineProposal`, and `window.divorceCouple` from `CoupleService.js`.

## 2. Proposed Changes

### [Wedding Hall]
#### [MODIFY] [WeddingHallModal.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/couples/WeddingHallModal.js)
- Implement `tab === 'proposals'` UI block to list incoming and outgoing requests.
- Implement `tab === 'divorce'` UI block to show current partner and divorce management.
- Update `tab === 'feed'` UI block for premium results (couple cards).
- Enhance aesthetic with glow effects, backdrop blur, and smooth tab transitions.

### [Proposal Journey]
#### [MODIFY] [GlobalModals.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/app/components/GlobalModals.js)
- Ensure all callback props (`onDivorce`, `onAccept`, `onDecline`) are properly wired to the relevant `CoupleService` functions.

#### [MODIFY] [ProposalModal.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/couples/ProposalModal.js)
- Ensure "Recently Interacted" users are displayed for easier partner selection.
- Fix user search results display.

## 3. UI/UX Refinement
- **Color Palette**: Hot Pink (#ec4899), Purple (#a855f7), and Dark Navy (#0d0d1a).
- **Glassmorphism**: Use `backdrop-filter: blur(8px)` and semi-transparent backgrounds for cards.
- **Animations**: Use `animate-pop` and `mythic-pulse` for premium elements.

## 4. Verification Plan
- [x] **V1**: Send a proposal -> verify it appears in recipient's `proposals` tab.
- [x] **V2**: Accept proposal -> verify both users are `isMarried: true`.
- [x] **V3**: Decline proposal -> verify ring cost is refunded to sender.
- [x] **V4**: Break up (Divorce) -> verify both users are `isMarried: false`.
- [x] **V5**: Visual check of "Weddings" feed to ensure cards render nicely.
