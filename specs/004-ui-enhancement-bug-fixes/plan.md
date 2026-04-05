# Implementation Plan - 004 UI Enhancement & Bug Fixes

**Branch**: `004-ui-enhancement-bug-fixes` | **Date**: 2026-04-02 | **Spec**: [spec.md](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/specs/004-ui-enhancement-bug-fixes/spec.md)

## Summary
Comprehensive UI enhancement and bug fix package targeting transparency artifacts, VIP visual parity across all levels (1-10), and profile title rendering logic. This sprint ensures the "Cyber-Luxury" aesthetic is consistent across both Full and Mini profiles.

## User Review Required

> [!IMPORTANT]
> **VIP Parity (Levels 1-10)**: I will verify and synchronize the `VIPName` rendering in the Mini Profile to match the Main Profile exactly for all 10 levels, ensuring colors and animations (like the VIP 9-10 red streak) are consistent.

> [!NOTE]
> **Title Backgrounds**: The "yellow box" background will be removed for **image-based** titles but preserved for **text-based** titles to maintain readability and premium feel.

## Proposed Changes

### 1. Avatar & Frame Transparency
- **File**: `src/06-components-base.js`
    - Update `AvatarWithFrame` and `AvatarWithFrameV11` to ensure containers have `background: transparent`.
- **File**: `mini-profile.css`
    - Remove `background: #0d0d1f` from `.mp-avatar-pic`.
- **File**: `src/10-app.js`
    - Verify "My Chat" section transparency.

### 2. VIP Visual Parity (1-10)
- **File**: `src/06-components-base.js`
    - Refactor `MiniProfilePopup` to use the global `window.VIPName` component correctly for the user's name.
    - Ensure `VIPBadge` images are correctly scaled.
- **File**: `src/17-vip.js`
    - Audit `VIPName` component to ensure it handles all `VIP_CONFIG` levels consistently for both large and small contexts.
- **File**: `style.css` / `mini-profile.css`
    - Ensure `.vip-name-animated` and `.vip-name-gradient-overlay` styles are globally accessible and identical.

### 3. Mini Profile Layout & Social
- **File**: `mini-profile.css`
    - Reposition `.mp-cp-label` ("His Home") by adjusting the `right` property to move it slightly towards the right edge.
- **File**: `src/06-components-base.js`
    - In `MiniProfilePopup`, replace the house emoji with the actual `coupleRingImageUrl` or asset from the profile data.

### 4. Profile Title Refinement
- **File**: `src/features/profile/ProfileIdentityElements.js`
    - Update `UserTitleV11` to add an `is-text` class for text titles and ensure `has-image` titles are transparent.
- **File**: `style.css` (or relevant profile CSS)
    - Update `.profile-user-title` to be transparent.
    - Add `.profile-user-title.is-text` to apply the yellow background box.

## Verification Plan

### Automated Verification
- Manual CSS audit of transparency artifacts in "My Chat" and "Mini-Profile".
- Visual comparison of Name styling for experimental VIP 1, 6, and 10 users in both Full and Mini views.

### Manual Verification
- Confirm "His Home" label positioning on iPhone SE (mobile) and Desktop.
- Check title rendering for both image-based and text-based titles in the main profile.
