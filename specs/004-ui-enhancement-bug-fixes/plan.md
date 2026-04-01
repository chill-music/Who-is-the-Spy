# Implementation Plan - 004 UI Enhancement & Bug Fixes

**Branch**: `004-ui-enhancement-bug-fixes` | **Date**: 2026-04-01 | **Spec**: [spec.md](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/specs/004-ui-enhancement-bug-fixes/spec.md)

## Summary
Comprehensive UI enhancement and bug fix package across the PWA. Technical approach involves refactoring the Mini Profile for responsiveness, implementing a global percentage-based Avatar Frame system, linking the Gift Wall to the central game data, and adding persistent Tribe Box counters.

## Technical Context
**Language/Version**: Javascript (ES6+) / React 18+
**Primary Dependencies**: React, Firebase Firestore
**Storage**: Firebase Firestore (Persistent Tribe Box counters, Gift Log entries)
**Testing**: Manual verification on mobile/desktop
**Target Platform**: Web PWA (Mobile/Desktop)
**Project Type**: Web Application
**Performance Goals**: Instant UI updates via Firestore snapshots, smooth animations

## Constitution Check
*GATE: Passes. Adheres to "Dead Code Prevention" and "Structural Discipline".*

## Project Structure

### Documentation (this feature)
```text
specs/004-ui-enhancement-bug-fixes/
├── plan.md              # This file
├── spec.md              # Feature specification
└── tasks.md             # Task breakdown (to be generated)
```

### Source Code
```text
src/
├── 06-components-base.js    # MiniProfilePopup, AvatarWithFrame
├── 17-vip.js                # VIPBadge, VIPName
├── 01-config.js             # Global styles and constants
├── 04-data-game.js          # Gift definitions
└── features/
    ├── profile/
    │   └── GiftWall.js       # Gift Wall implementation
    └── family/
        └── components/
            ├── FamilyChatModal.js  # Tribe Box counter
            ├── FamilySignBadge.js # Family Sign size
            └── FamilySignBadge.js
```

## Proposed Changes

### 1. Mini Profile Overhaul
- **File**: `src/06-components-base.js`
- **Changes**: 
    - Update `MiniProfilePopup` CSS to use flexbox for responsiveness.
    - Rename "His CP" to "Our Home 🏠" and ensure it opens the marriage modal.
    - Replace text ID with `VIPBadge` images.
    - Unify gender icons.

### 2. Global Avatar Frame
- **File**: `src/06-components-base.js`
- **Changes**: Update `AvatarWithFrame` to use `width: 100%`, `height: 100%` and `object-fit: contain` for the frame image.

### 3. Dynamic Gift Wall
- **File**: `src/features/profile/GiftWall.js`
- **Changes**: 
    - Update `GiftWallV11` to pull from all gift keys in `window.SHOP_ITEMS`.
    - Implement `isPrivate` check to hide gifts from public view.

### 4. Social & Family Enhancements
- **Files**: 
    - `src/features/family/components/FamilyChatModal.js`: Add `treasuryInventory.length` counter.
    - `src/features/family/components/FamilySignBadge.js`: Increase base size by 1.7x.
