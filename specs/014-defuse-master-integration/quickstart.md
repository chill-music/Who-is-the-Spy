# Quickstart: Defuse Master Integration

## Development Setup
1. Ensure `index.html` has the following scripts registered:
   - `src/features/defuse/defuse-rules.js`
   - `src/features/defuse/defuse-cards.js`
   - `src/features/defuse/DefuseLobby.js`
   - `src/features/defuse/DefuseGame.js`
   - `src/features/defuse/DefuseResults.js`
   - `src/features/defuse/DefuseMaster.js`
2. Update `src/16-main.js` to include `DefuseMaster` in the `_secondaryComponents` list.

## Verification Checklist

### 1. Lobby Setup
- [ ] Open the lobby.
- [ ] Verify the "Game Mode" selection exists under "+ CREATE GAME".
- [ ] Toggle between modes and ensure the UI reflects the choice.

### 2. Room Creation
- [ ] Select "Defuse Master" and click "+ CREATE GAME".
- [ ] Verify you are redirected to the Defuse Master lobby view.
- [ ] Verify that the room code is displayed correctly.

### 3. Multiplayer Join
- [ ] Open another browser tab.
- [ ] Enter the room code.
- [ ] Verify that the second player appears in the Defuse Master lobby.

### 4. Basic Round
- [ ] Start the game as host.
- [ ] Verify cards are dealt and the turn system is active.
- [ ] Draw a card and ensure the deck count decrements for all players.

## Troubleshooting
- **Game doesn't load**: Check the console for script loading errors or missing `window.DefuseMaster` registration.
- **Sync issues**: Check the `rooms` collection in Firestore to ensure all players are writing to the same `gameState` object.
