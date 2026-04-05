# Data Model

## Users Collection
Target path: `users/{uid}`

**Fields Required for Integration**:
- `balance` (Number): The current amount of currency the user possesses. Automatically synced to the CrashGame balance.
- `avatar` (String): URL linking to the user's avatar picture, for display on the game UI (replacing the blue house icon).
- `customId` (String): Identifying tag for creating links to the mini-profile.
- `avatarFrame` (String|Optional): Used for decorating the avatar explicitly.

## Interactions

**Betting**:
- Updates user `balance` by utilizing Firebase `increment(-betAmount)`.
- Rejects if client-state has `< betAmount`.
- Database security rules verify `balance >= 0` post-transaction.

**Claiming**:
- Client computes `winnings = Math.round(betAmount * crashMultiplier)`.
- Fires update that uses `increment(winnings)` on the user document.

**Disconnect Recovery**:
- Client automatically deducts on bet. If a user disconnects, the money is lost unless they click claim prior to internet drop. Standard fallback for simple crash games.
