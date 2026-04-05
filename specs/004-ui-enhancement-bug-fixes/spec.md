# Feature Specification: UI Enhancements and Bug Fixes Package

**Feature Branch**: `004-ui-enhancement-bug-fixes`  
**Created**: 2026-04-01  
**Status**: Draft  
**Input**: User description: "Comprehensive UI enhancement and bug fix package across the PWA covering Mini Profile, Avatar Frames, Rankings, Shop, Family, and Tribe systems."

## Clarifications

### Session 2026-04-01

- **Q**: On which edge does the "His CP" (Plus) button overflow, and what is its function? → **A**: Right edge; clicking it opens the "**Our Home 🏠**" view. Everyone can see it.
- **Q**: How is gift privacy (Public/Private) implemented? → **A**: Per-gift choice (Stored on each **Gift Log Entry**).
- **Q**: Is the Tribe Box counter persistent or session-only? → **A**: Persistent (Stored in Firebase/Database per user).
- **Q**: What happens to the ID badge for Level 0 / Non-VIP users? → **A**: Hide badge for Level 0 (Show only the ID number).
- **Q**: What is the target size for the Family Sign in the Full Profile? → **A**: 1.5x to 2x current size.

### Session 2026-04-01 (Refinements)

- **Q**: Which icons should be in the Mini Profile menu? → **A**: Add **Block** and **Report** buttons under the three dots.
- **Q**: Where should the "Send Gift" button lead? → **A**: It should open the **Gift Box** (Inventory).
- **Q**: What are the Family Gacha changes? → **A**: Price 600 coins, limit 50/day, velvet UI theme with square cards and a content reveal arrow.
- **Q**: How should the VIP 10 name look? → **A**: Transparent text with a red glow and an animated red line moving left-to-right.
- **Q**: Where should the Family Sign stay large? → **A**: Only in the **Full Profile**. Everywhere else (Rankings, Mini Profile) it returns to original (1x) size.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Premium Mini Profile Experience (Priority: P1)

As a user, I want a polished and responsive mini profile where all elements (especially technical ones like CP and VIP level) are correctly aligned, visually appealing, and functional across all my devices.

**Why this priority**: The Mini Profile is a high-traffic component that represents user identity. Visual bugs or broken buttons here significantly degrade the perceived quality of the app.

**Independent Test**: Can be fully tested by opening any user's mini profile on mobile and desktop: verify "His CP" visibility, VIP badge image, unified gender icon style, and working Gift button.

**Acceptance Scenarios**:

1. **Given** a user is on a narrow mobile device, **When** they open a Mini Profile, **Then** all elements including "Our Home 🏠" MUST be fully visible within the viewport.
2. **Given** a user has VIP level 5, **When** their profile is viewed, **Then** the VIP 5 badge image MUST be displayed instead of the plain "ID" text.
3. **Given** a VIP 10 user, **When** their name is displayed, **Then** it MUST show as transparent with a red glow and a repeating red line animation moving across it.
4. **Given** a Mini Profile, **When** the "Send Gift" button is tapped, **Then** the global **Gift Box / Inventory** MUST open.
5. **Given** any profile, **When** the "Our Home 🏠" icon is clicked, **Then** it MUST open the couple's shared marriage house modal.

---

### User Story 2 - Global Avatar Personalization (Priority: P1)

As a user with an avatar frame, I want my personalization to be consistently visible and perfectly sized in every circular avatar display across the app (Rankings, Profiles, Chat).

**Why this priority**: Personalization is a core driver for Shop engagement. If frames look "broken" or inconsistent, users are less likely to value or purchase them.

**Independent Test**: Equipping a frame and checking Lobby Rankings (Win/Charisma) and the Mini Profile to confirm perfect circular alignment.

**Acceptance Scenarios**:

1. **Given** a user has an animated GIF frame equipped, **When** they appear in the Win Ranking list, **Then** the frame MUST render animated and scale perfectly to the ranking's avatar circle size.
2. **Given** any circular avatar in the app, **When** a frame is present, **Then** it MUST match the avatar's size automatically without location-specific CSS overrides.

---

### User Story 3 - Dynamic Gift Wall & Privacy (Priority: P2)

As a user, I want to showcase my collection of gifts on my profile, while maintaining control over which specific gifts are visible to the public.

**Why this priority**: This connects the data layer (gifts) to the social layer (wall) and adds a necessary privacy control.

**Independent Test**: Sending a gift as "Private" and verifying it does not appear on the recipient's wall for other users, while "Public" gifts appear and match the list in `04-data-game.js`.

**Acceptance Scenarios**:

1. **Given** a new gift is added to `04-data-game.js`, **When** the Gift Wall is opened, **Then** the new gift MUST appear automatically without code changes.
2. **Given** a gift is sent with the "Private" toggle enabled, **When** a visitor views the recipient's Gift Wall, **Then** that specific gift MUST NOT be visible.

---

### User Story 4 - Tribe Interactions & Box Tracking (Priority: P3)

As a tribe member, I want to clearly see how many unopened tribe boxes I have waiting for me directly within the chat stream.

**Why this priority**: Improves the UX for tribe features by providing immediate feedback on pending actions.

**Independent Test**: Sending multiple boxes to a user and verifying the counter increments in the chat message, then opening one and verifying it decrements.

**Acceptance Scenarios**:

1. **Given** a tribe box message in chat, **When** a user has 3 unopened boxes, **Then** a counter in the top-right of the message MUST display "3".
2. **Given** a counter is displayed, **When** the user opens a box, **Then** the counter MUST update to reflect the new unopened total immediately.

---

### User Story 5 - Family Gacha Redesign (Priority: P2)

As a family member, I want an exciting, modern gacha experience with clear limits and rewards visualization.

**Acceptance Scenarios**:
1. **Given** the Family Gacha is open, **When** seeking rewards, **Then** gifts MUST be displayed as squares in an organized grid.
2. **Given** the reward list, **When** the arrow at the bottom is clicked, **Then** all items inside the Gacha pool MUST be revealed.
3. **Given** a user has performed 50 spins today, **When** they attempt another, **Then** the system MUST prevent the spin and notify them of the daily limit.
4. **Given** a paid spin, **When** initiated, **Then** it MUST cost 600 coins.

---

### Edge Cases

- **Mixed Asset Types**: How does the Avatar Frame system handle a static frame on an animated GIF avatar (and vice-versa)? (System should support all combinations transparently).
- **VIP Level 0**: What badge should show for users with no VIP level? (Fallback to a default "User" or hidden badge).
- **Empty Gift Wall**: How is the wall displayed when no gifts have been received or all are private? (Empty state message or empty grid).
- **Data Mismatch**: What happens if a gift in `04-data-game.js` has a broken image path? (Fallback to a placeholder gift icon).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Mini Profile MUST be fully responsive across mobile, tablet, and desktop (no clipping).
- **FR-002**: "Our Home 🏠" icon MUST stay within viewport bounds on desktop and mobile.
- **FR-003**: Clicking the "Our Home 🏠" icon MUST open the marriage/couple modal.
- **FR-004**: VIP Badge images MUST replace "ID" labels for level 1+; VIP 10 users MUST have an animated red-line transparent name style.
- **FR-005**: "Send Gift" button MUST open the Inventory/Gift Box system.
- **FR-006**: Mini Profile 3-dots menu MUST include "Block" and "Report" actions.
- **FR-007**: Family Sign size MUST be 1x everywhere EXCEPT the Full Profile where it is 1.7x.
- **FR-008**: Family Gacha MUST cost 600 coins per paid spin.
- **FR-009**: Family Gacha MUST enforce a 50-spin daily limit per user.
- **FR-010**: Family Gacha UI MUST use a "Velvet" theme with square rewards and a content-reveal arrow.
- **FR-008**: Three-dots menu MUST be wired to existing Block and Report logic.
- **FR-009**: Gift Wall MUST iterate through all items in `04-data-game.js` as its source of truth.
- **FR-010**: Gift Wall MUST filter out gifts tagged as "Private" for public visitors.
- **FR-011**: Shop title badges MUST support transparency and GIF animation.
- **FR-013**: Family Sign size MUST be increased (~1.5x to 2x current size) and centered in the Full Profile.
- **FR-013**: Family Chat header MUST reflect the current family level (not max level).
- **FR-014**: Tribe Box chat messages MUST include an incrementing/decrementing counter for unopened boxes.

### Key Entities *(include if feature involves data)*

- **Avatar Frame**: Entity representing the visual border around a user's photo. Attributes: `id`, `imageSource` (Static/GIF), `ownerId`.
- **Gift**: Entity defined in `04-data-game.js`. Attributes: `id`, `name`, `icon`, `type` (Static/GIF/Emoji).
- **Gift Log Entry**: Record of a sent gift. Attributes: `senderId`, `receiverId`, `giftId`, `isPrivate` (Boolean). This flag determines visibility on the recipient's Wall.
- **Tribe Box Counter**: Persistent database state tracking unopened boxes for a specific user. Updates in real-time when a box is received or opened.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Verification that 100% of circular avatars in "Win Ranking" and "Charisma Ranking" display frames correctly when equipped.
- **SC-002**: Zero "His CP" overflow issues reported on common mobile aspect ratios (20:9, 16:9).
- **SC-003**: Gift Wall loads all 100%+ gifts from data file without performance lag on low-end mobile devices.
- **SC-004**: Box counter accuracy: Counter MUST match the underlying data count exactly after 10+ rapid gift/open events.

## Assumptions

- VIP badge image assets already exist in the codebase following a naming convention (e.g., `vip_badge_1.png`).
- The Block/Report functions are globally accessible via the existing PWA framework logic.
- `04-data-game.js` contains a standard array or object of gift definitions that can be iterated.
- Tribe box "opening" event is tracked in a way that can trigger a UI refresh for the counter.
- Family Level data is available in the Family state/object currently passed to the Chat component.
