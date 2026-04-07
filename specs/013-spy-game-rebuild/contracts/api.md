# API Contract: Spy Game Rebuild

The Spy Game exists as a standalone module that can be mounted into any container.

## 1. Global Entry Point: `window.SpyGame`

```javascript
window.SpyGame = {
  /**
   * Mounts the game into the specified container.
   * @param {string} containerId - The ID of the HTML element to mount into.
   */
  mount: function(containerId) { ... },

  /**
   * Unmounts the game and performs cleanup (listeners, intervals).
   */
  unmount: function() { ... }
};
```

## 2. Shared Bus: `window.SpyGameCore`

Used for inter-file communication between the 5 bundled files.

```javascript
window.SpyGameCore = {
  // Shared state (for offline or local caching)
  state: {},
  
  // Shared services (populated by -firebase.js)
  services: {
    createRoom: async (settings) => { ... },
    joinRoom: async (roomId) => { ... },
    // ...
  },
  
  // Shared UI components (populated by -ui.js)
  components: {
    PlayerCard: (props) => { ... },
    // ...
  }
};
```

## 3. Initialization Model

1.  Scripts are loaded in order: `config` -> `firebase` -> `offline` -> `online` -> `ui`.
2.  `SpyGame.mount(id)` is called by the host application.
3.  The React root is created at the target container.
4.  Standard global variables (`window.db`, `window.auth`, `window.appId`) are used for Firebase operations.
