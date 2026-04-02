# Folder: Social Groups (src/features/groups)

## Overview
This directory contains the logic and UI for the "Groups" system, which allows players to form smaller, self-managed social circles with dedicated chat and moderation.

## Logic & Configuration

### [GroupConfig.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/groups/GroupConfig.js)
- **Purpose**: Group Definitions.
- **Logic**: Constants for group member limits, creation costs, and permission levels.
- **Dependencies**: Used globally across all group components.

## UI Components

### [GroupsSection.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/groups/GroupsSection.js)
- **Purpose**: Group Entry Point.
- **Logic**: Displays the user's current groups and provides an interface for searching or creating new ones.

### [GroupsList.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/groups/GroupsList.js)
- **Purpose**: Group Discovery.
- **Logic**: A searchable list of public groups currently active in the project.

### [GroupDetailsModal.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/groups/GroupDetailsModal.js)
- **Purpose**: Group Profile & Settings.
- **Logic**: Profile card for a group, showing member lists, group bio, and providing controls for admins to edit settings or manage members.

### [GroupChatModal.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/groups/GroupChatModal.js)
- **Purpose**: Group Real-time Messaging.
- **Logic**: Implements a dedicated chat room for group members. Handles synchronization with the `group_chats` collection.
- **Dependencies**: Integrated with `ChatManager.js`.
