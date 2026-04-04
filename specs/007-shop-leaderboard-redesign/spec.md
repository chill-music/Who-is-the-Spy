# Feature Specification: Shop and Leaderboard Redesign

**Feature Branch**: `007-shop-leaderboard-redesign`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "تحديث تصميم الـ Shop و الـ Leaderboard. توحيد تصميم الـ Shop و BFF Effects مع دعم الصور المتحركة الطولية. تطوير الـ Leaderboard (Ranking) لعرض المراكز الثلاثة الأولى بشكل مميز باستخدام صور الـ Tops."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unified Shop & Effects Experience (Priority: P1)

As a user, I want the BFF Effects section to look and feel exactly like the main Shop, so that my shopping experience is seamless and familiar across different item categories.

**Why this priority**: Core UI consistency is critical for a premium feel. The BFF section currently feels disconnected from the main Shop.

**Independent Test**: Can be tested by navigating between Shop and BFF Effects; both should use the same grid layout, card styles, and hover effects.

**Acceptance Scenarios**:

1. **Given** the user is in the Shop modal, **When** they switch to the BFF Effects tab, **Then** the item cards should have the same structure and design as the main Shop items.
2. **Given** the user hovers over an effect card, **When** they interact with it, **Then** it should show the same "Selection" and "Hover" glows as Shop items.

---

### User Story 2 - Portrait Portrait Support (Priority: P2)

As a user, I want to see animated portrait effects displayed in their full vertical glory without being cropped or stretched, so I can see the full detail of the animation.

**Why this priority**: Portraits are high-value items. Poor display quality directly impacts sales and user satisfaction.

**Independent Test**: View a "Portrait" type effect in the item list; the image should fit vertically within its container using `object-fit: contain`.

**Acceptance Scenarios**:

1. **Given** a portrait-style animated image, **When** it is rendered in the effect card, **Then** it must maintain its original aspect ratio within the prescribed container.
2. **Given** the item card, **When** the image is tall, **Then** the container should adapt to a vertical aspect ratio (e.g., 2:3 or 9:16).

---

### User Story 3 - Premium "Top 3" Leaderboard (Priority: P1)

As a competitive player, I want to see the top 3 rankings displayed on a high-visibility podium at the top of the leaderboard, so that winners feel truly celebrated.

**Why this priority**: Driving engagement through competition is a core mechanic. A premium "Top 3" UI increases the prestige of ranking.

**Independent Test**: Open any ranking view (Family, Charisma, Wins); the top 3 players should appear at the top in a 2-1-3 layout with medals.

**Acceptance Scenarios**:

1. **Given** the rankings are loaded, **When** looking at the top of the list, **Then** the player in 1st place should be in the center and larger than 2nd and 3rd.
2. **Given** the Top 3 players, **When** their avatars are rendered, **Then** the corresponding "leaderboard top" png frame should be overlaid on top of the avatar.

---

### Edge Cases

- **Loading States**: What happens if the leaderboard top images (png) fail to load? (Assumption: Fallback to standard rank numbers).
- **Empty Rankings**: How does the podium look if there are fewer than 3 players? (Assumption: Show empty frame placeholders).
- **Long Names**: How are player names handled on the podium containers? (Assumption: Truncate with ellipsis).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement a unified CSS class `.shop-standard-item` shared between `src/08-components-shop.js` and the BFF Effects component.
- **FR-002**: System MUST add a container for portrait effects with `aspect-ratio` support and `object-fit: contain`.
- **FR-003**: System MUST redesign the top section of `RankingView.js` to support a side-by-side "Podium" layout (Indices 0, 1, 2).
- **FR-004**: System MUST use `icos/leaderboard tops/leaderboard top 1.png` (and 2, 3) as transparent overlays for the Top 3 avatars.
- **FR-005**: Avatars in the Ranking Podium MUST have a lower `z-index` than the medal/frame overlays.
- **FR-006**: Existing purchase/equip/owned logic MUST remain unchanged and fully functional.

### Key Entities *(include if feature involves data)*

- **Shop Item**: Represents a purchasable asset (Frame, Entry, Portrait, BFF Effect).
- **Ranking Entry**: Represents a user's position in a specific leaderboard category.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% visual consistency in grid spacing and card borders between Shop and BFF Effects.
- **SC-002**: Portrait images show 0% cropping when rendered in the new vertical containers (9:16 aspect ratio).
- **SC-003**: The Top 3 podium is implemented in at least 3 ranking categories (Family, Charisma, Wins).
- **SC-004**: Page load performance for RankingView remains under 2 seconds even with new image overlays.

## Assumptions

- **Portrait Aspect Ratio**: Use a fixed 9:16 aspect ratio for portrait containers to match high-resolution mobile mobile vertical standards.
- **1st Place Scaling**: 1st place player avatar will be 1.25x larger than 2nd/3rd places.
- **Image Paths**: Assets in `icos/leaderboard tops/` are correctly named and accessible via the PWA's static path.
- **BFF Effects Location**: The BFF effects UI is currently located in `src/features/bff/` or handled as a category in the main Shop logic.
