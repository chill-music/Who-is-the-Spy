# 📖 Game Developer Documentation & Architecture Guide
**Platform: Who is the Spy Pro**

Welcome! This document is intended for external Game Developers building new games or components to be integrated into our currently operating live platform. It outlines our tech stack, database structure, and the guidelines for handling users, coins, avatars, and avatar frames.

---

## 🛠️ 1. Tech Stack & Environment
This platform **does not use module bundlers** (No Webpack, No Vite, No NPM imports). The architecture relies entirely on:
*   **React 18** (loaded directly via CDN scripts).
*   **Firebase v8** (Firestore, Auth, Storage).
*   **Vanilla JS / CSS**: Everything is modularized into raw Javascript files which are loaded sequentially in the main `index.html`.

### ⚠️ Coding Constraint
Any new game or React component must be wrapped inside an IIFE (Immediately Invoked Function Expression) and exported globally to the `window` object. 
**Do not use `import` or `export` keywords.**

```javascript
(function() {
    var MyNewGame = function({ currentUser, currentUserData }) {
        // Your Game Logic Here
        return React.createElement('div', null, 'Hello Game!');
    };
    window.MyNewGame = MyNewGame; // Export globally for the website to pick it up
})();
```

---

## 🗄️ 2. Database Architecture (Firebase Firestore)
All collections within the platform are stored under a single, dedicated root path:
`/artifacts/{appId}/public/data/`
*(In the existing codebase, there are global shortcut variables predefined like `usersCollection` to access this automatically. Use them or stick to standard naming conventions for your new game's collections).*

### 👤 A. User Data Schema (Players)
You can retrieve a player's data from the document: `users/{userId}`.
Crucial fields you'll need for gaming integration:
*   `uid` (String): The player's unique ID.
*   `displayName` (String): The name displayed in the UI.
*   `photoURL` (String): The direct link to their **Avatar** image.
*   `gold` (Number): The user's Coin/Gold balance. **This is the main currency used for playing and betting.**
*   `equipped` (Object): Contains the user's equipped decorations.
    *   `equipped.frames`: The ID of their active **Avatar Frame**.
    *   *(Note: For some legacy users, the frame ID may also be tracked under a flat field called `equippedFrame`)*.

### 💰 B. Coin Balance Handling (Gold Usage)
When a user wins or loses a game, **DO NOT overwrite their balance with a fixed number.** Always use the `increment` function to avoid race conditions and concurrency exploits where a player might spam actions before the server updates the client:

```javascript
// To deduct 100 coins (a bet):
usersCollection.doc(currentUser.uid).update({
    gold: firebase.firestore.FieldValue.increment(-100)
});

// To add 500 coins (a win):
usersCollection.doc(currentUser.uid).update({
    gold: firebase.firestore.FieldValue.increment(500)
});
```
*(Optional Admin Strategy: Substantial transactions or jackpots should also be logged to a collection named `gold_transactions` for auditing).*

---

## 🎲 3. Multiplayer & Lucky Games Handling
If you are building a real-time multiplayer game or a "chance/luck" game, please follow the infrastructure model used by our existing games:

1.  **Game Sessions (Real-time sync):**
    Each round or game table should operate within its own document under a collection like:
    `lucky_games_sessions/{sessionId}`
    When a user places a bet or makes a move, update this document. All connected clients should mount a Firestore `onSnapshot` listener on this document so that React instantly rerenders the UI changes smoothly for everyone.

2.  **Cumulative Jackpots:**
    If the game includes progressive pools (losing bets feeding into a grand prize), manage the accumulated sum in a separate dedicated document collection like `lucky_fruit_jackpot`.

---

## 🎨 4. Avatars & Avatar Frames Scaling (UI/CSS)
Whenever drawing a player's profile bubble/node on the game board, follow our styling standard to ensure consistency across the platform:
*   **Avatar**: Rendered as an image with `borderRadius: 50%` and `object-fit: 'cover'`.
*   **Avatar Frame**: If the user owns a frame (`equipped.frames`), overlay it precisely on top of the avatar using `position: absolute`. It must be sized larger (around `120%`) to protrude outside the avatar's circular boundary.

```javascript
var frameId = currentUserData?.equipped?.frames || currentUserData?.equippedFrame;
var avatarUrl = currentUserData?.photoURL || 'default_avatar.png';

// Recommended skeleton for your React components:
/*
<div style={{ position: 'relative', width: '50px', height: '50px' }}>
    <img src={avatarUrl} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
    {frameId && (
        <img src={`https://...path_to_frames.../${frameId}.png`} 
             style={{ position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', zIndex: 2, pointerEvents: 'none' }} />
    )}
</div>
*/
```

---

## 📝 5. Delivery & Deployment Guidelines
When you finalize the game component:
1.  **Deliver a single Vanilla JS file** (or a set of well-named raw `.js` files) written entirely in Javascript utilizing React.createElement.
2.  Assign the main Entry Point to the global window: e.g., `window.MyNewGame = MyNewGame;`.
3.  Ensure your code dynamically accepts `currentUser` and `currentUserData` as props.
4.  **Security Notice**: Validate all high-valued rewards, jackpots, and withdrawals solely using Firestore Security Rules. Never trust client-side logic to determine huge payouts.
