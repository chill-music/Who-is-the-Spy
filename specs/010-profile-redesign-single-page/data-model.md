# Data Model: Profile Redesign: Single Page Layout

This redesign changes how data is *displayed*, not saved in Firebase.

## Profile Layout Data Structure

- **UserHeader**: Basic identifiers (Avatar, DisplayName, UserID).
- **MomentsList**: Array of social posts for the target user.
- **GiftsCollection**: Array of received gifts record.
- **BasicStats**: Win/Loss count, Win percentage, XP/Level.
- **Achievements**: List of unlocked badges.

## Order Logic
The renderer in `ProfileV11.js` will render these sequentially in a common scrollable container:
1. `ProfileHeader`
2. `ProfileIdentity`
3. `MomentsSection`
4. `GiftWallV11`
5. `ProfileStats`
6. `BFFStripProfile`
7. `GuardSummary`
8. `AchievementsDisplayV11`
