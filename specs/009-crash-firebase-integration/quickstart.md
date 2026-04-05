# Crash Firebase Integration Quickstart

This document serves as a brief guide to the changes introduced in the Crash Firebase integration branch.

## Implementation Overview

### Location
The changes are isolated entirely within `CrashGame/CrashGame.jsx` and an overarching navigation link in the `Luck Games` file (likely `16-main.js` or the appropriate router file for Luck Games). 

### Firebase Changes
- **Balance Watcher**: Replaces the local `useState` for balance with a `useEffect` wrapped `onSnapshot(doc(db, "users", user.uid))`.
- **Bet Execution**: Instead of subtracting local balance, `updateDoc` triggers with `increment(-betAmount)`.
- **Claim Execution**: `updateDoc` triggers with `increment(winAmount)`.

### UI Changes
- The `309MS` ping label and the generic blue house icon have been systematically removed.
- In their place, the `AvatarIcon` (or similar standard profile wrapper component) fetches and displays the user's avatar.
- Clicking the `AvatarIcon` opens the `<MiniProfile />` or triggers `openProfile(uid)` as per the project's standard global conventions.
