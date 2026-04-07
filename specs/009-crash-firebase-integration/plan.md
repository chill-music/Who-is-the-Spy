# Implementation Plan: Crash Game Firebase Integration

**Branch**: `009-crash-firebase-integration` | **Date**: 2026-04-05 | **Spec**: [spec.md](../spec.md)

## Summary

Integrate the currently isolated CrashGame client with the unified Firebase stack. This involves replacing static client-side states with synchronized Firebase Data for User Balances, Game Rounds (16-second synced timer), Historical Records, and a new Jackpot System. The game will seamlessly link from the central "Luck Games" entrypoint. Additionally, the canvas drawing logic will be enhanced so the rocket graphically tilts upward matching its trajectory with the exhaust flame perfectly aligned.

## Technical Context

**Language/Version**: JavaScript (ES5/ES6 without modules, executed globally via IIFE)
**Primary Dependencies**: React (Global window.React), Firebase (window.db, window.auth, window.AppHooks)
**Storage**: Google Cloud Firestore (`users/{uid}` and `crash_game/{docs}`)
**Testing**: Manual E2E Validation
**Target Platform**: Progressive Web App (PWA) / Browser
**Project Type**: Web Application Game Module
**Constraints**: Modules cannot utilize `import` / `export` syntax or npm build steps. The components must map to the `window` Object and be added to standard execution arrays.

## Proposed Changes

### 1. Global Game State & Server Sync (Rounds)
- **Database Path**: `crash_game/state`
- Track the current `round_number`, `status` (betting, flying, crashed), `crash_multiplier`, and timestamps.
- **16-Second Timer**: A strictly synchronized 16-second betting phase timer that polls from the global database so that all players start and see the exact same synchronized countdown and launch sequence.

### 2. Historical Records System
- **Database Path**: `crash_game/history` (or an array in the `state` document)
- Store the last 20 round crash multipliers.
- When a user clicks the `↗` arrow on the far right of the history bar, the History Modal will open.
- The UI will fetch and display these 20 results, automatically marking the newest entry with a "NEW" tag.

### 3. Jackpot System & UI Modal
- **Database Path**: `crash_game/jackpot` (pool balance, historical winners) and `users/{uid}` (accumulated multiplier).
- Maintain a global jackpot amount that increases organically as players place bets.
- Maintain a `jackpot_progress` for each player (e.g. +0.68 when claiming at 1.68x). The goal is to reach 80,000x.
- **UI Exact Match**: Clicking the Jackpot value will open a new modal exactly matching the provided image:
  - Header: "jackpot" with a blue gradient and close X.
  - Multiplier Track: Progress bar showing x2, x40, x280, x1000, x10000, x80000 with a rocket icon.
  - Top Players: Real users fetched from a new database section tracking the top three highest-multiplier winners, replacing placeholders (e.g., #1 Ninja2). When a player wins with a high multiplier, they populate this list.
  - Rules Text: Word-for-word copy of the accumulation rules provided in the image.
  - Prize Distribution Boxes: 
    - 10% (Bet 10~1000)
    - 30% (Bet 1000~100000)
    - 70% (Bet 100000 ≥)
  - Records Table: "Historical Winning Records" with Time, Player Information, and Prize.

### 4. User Balance & Secure Betting
- **Database Path**: `users/{uid}`
- Import globally exposed `window.AppHooks`, Firebase `onSnapshot` / `updateDoc` methods.
- Watch user balance via `useEffect`.
- Update `placeBet` to trigger `updateDoc` with `increment(-betInput)`.
- Update `claimNow` to trigger `updateDoc` with `increment(winAmount)`.
- *Disconnect Protection:* Bets are deducted instantly. A disconnect mid-flight resolves implicitly as a loss because the bet amount is already safely captured.

### 5. Canvas Graphics Upgrade (Tilted Rocket)
- Modify the `drawScene` function inside `CrashGame.jsx` to dynamically calculate the tangential angle of the curve path.
- Rotate the rocket image/graphic `Math.atan2(dy, dx)` so the nose points along the travel vector.
- Apply a translation offset so the rocket appears physically *on top of* the drawn trajectory line, not below or sideways, precisely matching the uploaded reference image.
- Align the exhaust glow and flame streaks precisely linearly behind the rocket.

### 6. Immersion & Navigation updates
- Replace the static text `309MS` and the `🏠` icon with the avatar component pointing to `user.avatar` and `user.avatarFrame`. 
- Clicking the avatar fires the `openProfile` modal.
- Append CrashGame routing to the standard `Luck Games` entrypoint.

### 7. Arabic Language Localization
- Map all hardcoded English strings in the UI to ternary expressions checking the `lang` prop (e.g., `lang === 'ar' ? 'العربية' : 'English'`).
- Ensure NO logic is deleted or altered; only the textual presentation is translated dynamically.

## User Review Required

> [!IMPORTANT]
> Since we are creating a fully synchronized global 16-second loop, the server needs to determine the crash point automatically (or one trusted client spins the game for everyone). Does this platform rely on a scheduled Cloud Function to write `crash_multiplier` at the start of a round to the DB, which all clients read? Or should the client evaluate if `status === 'waiting'` and determine the crash randomly locally and push it for everyone else?

## Open Questions

> [!WARNING]
> Is the Luck Games panel defined inside `16-main.js` or is there a specific component where I should append the route to link the game? Additionally, how does the site typically render user avatars (e.g. `window.AppComponents.Avatar` or direct `<img>` tags)?

## Verification Plan

### Manual Verification
- Verify the canvas rocket graphic rotates upward dynamically and flames shoot backward correctly along the path.
- Verify the 16s timer matches DB timestamps and coordinates uniformly across double-logged accounts.
- Verify that opening the `↗` arrow successfully displays the 20 real database history entries with "NEW" applied correctly.
- Click the Jackpot amount and verify the modal perfectly matches the provided reference screenshot down to layout, colors, and text rules.
