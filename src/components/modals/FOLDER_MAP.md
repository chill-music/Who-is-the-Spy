# Folder: System Modals (src/components/modals)

## Overview
This directory contains the standalone React components for the application's global modals. These modals use the Glassmorphism / Cyber-Luxury aesthetic and are triggered via the `useAppUIState` hook.

## Files

### [BrowseRoomsModal.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/modals/BrowseRoomsModal.js)
- **Purpose**: Lobby Room List.
- **Logic**: Fetches and filters active room documents from Firestore, allowing users to join public games directly.
- **Dependencies**: Integrated with `window.GameService`.

### [HelpCenterModal.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/modals/HelpCenterModal.js)
- **Purpose**: Support Dashboard.
- **Logic**: Provides access to the `help_faq` collection and coordinates with `SupportTicketSection.js`.

### [LoginRewards.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/modals/LoginRewards.js)
- **Purpose**: Daily Rewards.
- **Logic**: Visualizes check-in progress and performs the "Claim" transaction for daily currency rewards.
- **Dependencies**: Managed by the `useLoginRewards` hook.

### [PublicChatModal.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/modals/PublicChatModal.js)
- **Purpose**: Global Communication.
- **Logic**: Dual-mode component. Functions as a bottom-sheet modal on mobile and an embedded sidebar/persistent chat on desktop.
- **Dependencies**: Listens to the `public_chat` collection.

### [SettingsModal.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/modals/SettingsModal.js)
- **Purpose**: User Preferences.
- **Logic**: Handles language switching (EN/AR), sound toggles, and provides links to social media and support.
- **Dependencies**: Updates the global `lang` and `soundMuted` states.

### [SupportTicketSection.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/modals/SupportTicketSection.js)
- **Purpose**: Issue Reporting.
- **Logic**: Logic for creating, listing, and tracking the status of player-submitted support tickets.
- **Dependencies**: Interacts with the `support_tickets` collection.

### [TutorialModal.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/modals/TutorialModal.js)
- **Purpose**: Onboarding Guide.
- **Logic**: A paginated tutorial for new players to understand the "Who is the Spy" game rules.

### [VIPCenterModal.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/modals/VIPCenterModal.js)
- **Purpose**: VIP Dashboard.
- **Logic**: Shows the user's progress towards the next VIP tier and describes the perks of each level.
- **Dependencies**: Consumes data from `17-vip.js`.
