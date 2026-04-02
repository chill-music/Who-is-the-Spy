# Folder: Marriage System (src/features/couples)

## Overview
This directory contains the logic and UI for the "Couples" system, allowing players to marry, display shared status, and track anniversaries.

## Logic & Configuration

### [CoupleConfig.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/couples/CoupleConfig.js)
- **Purpose**: Marriage Tiers.
- **Logic**: Defines calculations for the wedding date, anniversary level, and the physical asset mapping for different ring types.
- **Dependencies**: Used by `CoupleCardModal.js`.

### [CoupleService.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/couples/CoupleService.js)
- **Purpose**: Relationship State Controller.
- **Logic**: Handles the state transitions for marriage (Sending a proposal, accepting, the wedding ceremony, and divorce).
- **Dependencies**: Acts on the `couples` collection.

## UI Components

### [CoupleCardModal.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/couples/CoupleCardModal.js)
- **Purpose**: Shared Identity Card.
- **Logic**: A premium, dual-avatar modal displayed when clicking on a married user's "Couple" badge. Shows rings, anniversary, and a shared bio.

### [ProposalModal.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/couples/ProposalModal.js)
- **Purpose**: Marriage Request.
- **Logic**: Interface for selecting a partner and purchasing a ring to send a proposal.
- **Dependencies**: Consumes data from `RingsShopSection.js`.

### [IncomingProposalModal.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/couples/IncomingProposalModal.js)
- **Purpose**: Proposal Response.
- **Logic**: UI for a user to accept or reject a marriage proposal in real-time.

### [WeddingHallModal.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/couples/WeddingHallModal.js)
- **Purpose**: Marriage Registry.
- **Logic**: A leaderboard-style view showing the top couples by anniversary level and recently married pairs.

### [RingsShopSection.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/couples/RingsShopSection.js)
- **Purpose**: Asset Purchase.
- **Logic**: A specialized shop section for buying marriage rings of different tiers (Silver, Gold, Diamond, Special).

### [CoupleUIComponents.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/couples/CoupleUIComponents.js)
- **Purpose**: Shared Visuals.
- **Logic**: Smaller Reusable React elements for anniversary counters and ring icons.
