# Folder: Family System (src/features/family)

## Overview
The "Family" system is the most complex social layer in the project, allowing players to form large, persistent tribes with shared resources, exclusive chat, and collective progression.

## Logic & Configuration

### [FamilyConstants.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/family/FamilyConstants.js)
- **Purpose**: Global Family Rules.
- **Logic**: Defines levels, activity point thresholds, emblems, and the mapping for "Family Sign" tiers.
- **Dependencies**: Referenced by all family-related components.

### [FamilyService.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/family/FamilyService.js)
- **Purpose**: Family State Controller.
- **Logic**: A large service that handles the creation, membership transitions, and mission logic for families. It manages complex transactions like collective level-ups and role assignments.
- **Dependencies**: Subscribes to the `families` collection.

### [FamilyUtils.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/family/FamilyUtils.js)
- **Purpose**: Data Helpers.
- **Logic**: Shared utility functions for formatting family tags and checking permissions.

## Subdirectories

### [components/](./components/FOLDER_MAP.md)
- **Purpose**: Modular UI implementations for the family dashboard and interactions.
