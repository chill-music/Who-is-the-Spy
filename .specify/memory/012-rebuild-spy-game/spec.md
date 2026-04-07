# Feature Specification: Rebuild Spy Game

**Feature Branch**: `012-rebuild-spy-game`  
**Created**: 2026-04-07  
**Status**: Draft  
**Input**: User description: "Rebuild the Who is the Spy game from scratch based on Spyfall rules. Normal Mode is offline/same-room. Advanced Mode (6+) is online."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start an Offline Game (Pass & Play) (Priority: P1)

As a group of friends in the same room, we want to play "Who is the Spy" using a single device so we can enjoy the game without everyone needing to login.

**Why this priority**: Core MVP functionality for "Normal Mode". Allows immediate play for local groups.

**Independent Test**: Can be fully tested by selecting "Normal Mode" on the main device, entering player names, and verifying that each player can see their role/location one-by-one by passing the device.

**Acceptance Scenarios**:

1. **Given** the home page, **When** I click "CREATE GAME" and select "NORMAL MODE", **Then** I am prompted to enter the number of players and their names.
2. **Given** names are entered, **When** I start the game, **Then** the screen shows "Player 1: Tap to see role", and reveals role/location only while held (to prevent accidental leaks).
3. **Given** all players have seen their roles, **When** the timer starts, **Then** the group can proceed with questions.

---

### User Story 2 - Start an Online Game (Priority: P2)

As a remote group, we want to join a shared digital room so we can play together from different locations.

**Why this priority**: Essential for "Advanced Mode" (Online). Leverages the existing Firebase infrastructure.

**Independent Test**: Can be fully tested by selecting "Advanced Mode", creating a room with a code, and having 6+ players join from different browser windows to start the round.

**Acceptance Scenarios**:

1. **Given** the home page, **When** I click "CREATE GAME" and select "ADVANCED MODE (6+)", **Then** a lobby with a unique join code is created.
2. **Given** a lobby, **When** fewer than 6 players join, **Then** the "START GAME" button is disabled.
3. **Given** 6 or more players are in the lobby, **When** the admin starts the game, **Then** each player receives their role/location on their own device.

---

### User Story 3 - Role & Location Reveal (Priority: P1)

As a player, I want to clearly see if I am the Spy or an Agent so I know how to play the round.

**Why this priority**: Core game mechanic. If the Spy knows the location or an Agent doesn't, the game is broken.

**Independent Test**: Verify that in any round, exactly one player is assigned the "Spy" role with "Unknown Location", while others see the specific location and a unique role from that location's role list.

**Acceptance Scenarios**:

1. **Given** I am an Agent, **When** I open my card, **Then** I see the name of the Location (e.g., "Airport") and my Role (e.g., "Pilot").
2. **Given** I am the Spy, **When** I open my card, **Then** I see "YOU ARE THE SPY" and "Location: Unknown".

---

### Edge Cases

- **Connectivity Drop (Online)**: How does the system handle a player disconnecting during a round? (Assumption: Player is marked as "Inactive", but the round continues).
- **Minimum/Maximum Players**: What happens if the group tries to start with 2 players? (Acceptance: Error message "Min 3 players required for Normal Mode").
- **Exhausting Roles**: If there are more players than roles in a location? (Acceptance: Roles are randomly duplicated or a "Generic Staff" role is assigned).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST show two distinct options after clicking "CREATE GAME": "NORMAL MODE" (Offline) and "ADVANCED MODE (6+)" (Online).
- **FR-002**: "NORMAL MODE" MUST support local Pass-and-Play logic, requiring names to be entered on one device.
- **FR-003**: "ADVANCED MODE" MUST use Firebase Firestore for real-time synchronization of player statuses and game state.
- **FR-004**: System MUST assign exactly one Spy per round.
- **FR-005**: System MUST pull from a library of Locations, each containing at least 8 unique roles.
- **FR-006**: System MUST include a countdown timer (default 8 minutes) visible to all players.
- **FR-007**: Agents MUST be able to "Cast Vote" against a suspected Spy.
- **FR-008**: The Spy MUST be able to "Identify Location" at any time to end the game and potentially win.

### Key Entities

- **Location**: Represents a setting (e.g., "Submarine"). Attributes: `name_en`, `name_ar`, `roles[]`.
- **GameSession**: The state of an active match. Attributes: `mode` (offline/online), `status`, `location`, `spyUID`, `startTime`, `roomId`.
- **Player**: Participant details. Attributes: `uid`, `name`, `role`, `status` (active/disconnected).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can transition from "Home" to "First player revealed" in under 30 seconds for Offline mode.
- **SC-002**: Real-time role reveal in Online mode occurs within 500ms of the admin clicking "Start".
- **SC-003**: 100% of game rounds must have exactly one spy and a shared location for non-spies.
- **SC-004**: System handles up to 10 players in a single room without UI overlap or performance lag.

## Assumptions

- **Offline Mode**: Assumption: "Offline" refers to a "Pass and Play" experience on a single device, rather than a local-network peer-to-peer setup.
- **Platform**: Rebuild will continue to use React and Firebase (Firestore/Auth) as the primary stack.
- **Data Source**: Existing `SCENARIOS` array will be expanded or restructured to match the Spyfall location/role requirement.
- **Permissions**: "Advanced Mode" (Online) requires the creator to have an account (Guest or Google), whereas Offline mode requires no authentication.
