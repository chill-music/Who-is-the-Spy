# Quickstart: Spy Game Rebuild

This guide helps you set up and run the "Who is the Spy?" game locally for development and testing.

## Prerequisites

1.  A standard web server (e.g., `npx http-server` or `python -m http.server`).
2.  A valid Firebase project with Firestore enabled.
3.  Pre-initialized Firebase globals (`window.db`, `window.auth`, `window.appId`) in your main `index.html`.

## Local Development (Offline Mode)

1.  Open your browser to the local server URL.
2.  Ensure `all 5 SpyGame-*.js` files are loaded.
3.  Execute `window.SpyGame.mount("container-id")` in the console or your main app script.
4.  Select **"Play Together 🃏"**.
5.  Add at least 3 names and tap **"Let's Play"**.
6.  The offline state machine will handle the game loop without any Firestore interactions.

## Online Multiplayer (Firestore)

1.  Follow the mount steps above.
2.  Select **"Play Online 🌐"**.
3.  **Host**: Tap "Create Room", copy the code.
4.  **Guest**: Open a new tab (or another device), join with the same room code.
5.  Wait for the host to tap **"Start Game"**.
6.  The `OnlineService` in `-firebase.js` and `-online.js` will handle all real-time sync via `onSnapshot`.

## Testing RTL (Arabic)

1.  Tap the **AR** toggle in the Top Bar.
2.  Verify:
    -   `dir="rtl"` is applied to the container.
    -   Font changes to "Cairo".
    -   Layout mirrors correctly (logical properties).
    -   All strings are translated via `I18N`.
