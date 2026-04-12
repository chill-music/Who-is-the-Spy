# Feature Specification: Multi-Game Lobby Redesign

**Feature Branch**: `019-multi-game-lobby`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "Redesign lobby card to support multiple games with a game selector"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Game Selection & Visual Feedback (Priority: P1)

As a player, I want to browse through different game options in the lobby so that I can see what games are available and prepare to play them. When I select a game, the lobby interface should instantly update its appearance to match that game's atmosphere.

**Why this priority**: Correct selection and visual feedback are the foundation of the multi-game ecosystem. Without this, the user cannot accurately know which game they are interacting with.

**Independent Test**: Can be tested by clicking different game icons in the carousel and verifying that the Title, Icon, and Color Theme of the hero card update accordingly.

**Acceptance Scenarios**:

1. **Given** I am in the lobby, **When** I click the "Draw & Guess" icon in the selector, **Then** the hero card title changes to "Draw & Guess" and the theme color shifts to Purple.
2. **Given** a game is marked as "Coming Soon", **When** I view it in the selector, **Then** it appears dimmed with a lock icon, and the "CREATE GAME" button is disabled or visually indicates unavailability.

---

### User Story 2 - Game-Aware Room Creation (Priority: P1)

As a host, I want to create a room for a specific game type so that I can invite my friends to play that exact game.

**Why this priority**: Essential for multi-game functionality. Creating a room in the wrong "namespace" (collection) would prevent players from finding it.

**Independent Test**: Can be tested by selecting "Are You the Spy?" and creating a game, then verifying in the Firestore console that the room document was created in the `spy_rooms` collection.

**Acceptance Scenarios**:

1. **Given** "Are You the Spy?" is selected, **When** I click "CREATE GAME", **Then** a new room is created in the game-specific collection (`spy_rooms`).
2. **Given** a future game is selected, **When** I click "CREATE GAME", **Then** the system directs me to the correct game-specific creation flow.

---

### User Story 3 - Game-Aware Room Joining (Priority: P2)

As a player, I want to join a specific game room using a code so that I can play the game my friends have started.

**Why this priority**: Necessary for multiplayer interaction across different games.

**Independent Test**: Can be tested by attempting to join a "Spy" room code while the "Spy" game is selected, and then repeating with the wrong game selected to ensure isolation.

**Acceptance Scenarios**:

1. **Given** "Are You the Spy?" is selected and a valid spy room code is entered, **When** I click "JOIN", **Then** I am successfully admitted to the room.
2. **Given** "Draw & Guess" is selected and a valid spy room code is entered, **When** I click "JOIN", **Then** the system reports "Room not found" because it only searches the `Game Namespace` for the selected game.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a horizontal game selection row or carousel below the main lobby card.
- **FR-002**: Selected game MUST update the hero card's Title, Subtitle, Icon, and Visual Theme (CSS gradients/shadows).
- **FR-003**: System MUST clearly distinguish between "Active" and "Coming Soon" games using visual treatments like grayscale filters and lock icons.
- **FR-004**: Room creation logic MUST be dynamic, using a collection name derived from the currently selected game's configuration.
- **FR-005**: Room joining logic MUST search only the Firestore collection associated with the selected game.
- **FR-006**: The game list MUST be configuration-driven (e.g., a `GAMES_CONFIG` array) to allow for easy addition of new games without deep code changes.

### Key Entities *(include if feature involves data)*

- **GameConfig**: Represents a game's metadata (id, names, icons, status, theme, collection).
- **Room**: Represents a game session, now scoped by the game-specific collection.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Switching between games in the selector updates the UI in under 200ms (perceived as instantaneous).
- **SC-002**: 100% of room creation and join requests target the correct collection specified in the game's metadata.
- **SC-003**: The lobby layout remains consistent and functional on mobile screens as narrow as 320px (no horizontal overflow except for the intended carousel).

## Assumptions

- **A-001**: The system will initially only have one active game ("Are You the Spy?"); others will be placeholders.
- **A-002**: Existing global game actions (`handleCreateGame`, `handleJoinGame`) can be safely modified to accept a `gameId` parameter.
- **A-003**: All games will follow a similar "room-based" multiplayer structure initially.
- **A-004**: The `GAMES_CONFIG` will be stored in `src/01-config.js` or a dedicated feature-config file.
