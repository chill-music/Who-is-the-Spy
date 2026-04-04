# src/app Directory Map

Contains the "brain" of the React application — hooks and state management logic.

## Files

| File | Purpose | Key Hooks |
| :--- | :--- | :--- |
| `AppHooks.js` | Centralizes all hooks into `window.AppHooks`. | (Consolidator) |
| `useAppUIState.js` | Manages global UI states (Active modals, language). | `useAppUIState` |
| `useAuthState.js` | Authentication (Firebase Auth), Profile loading, and Guest logic. | `useAuthState` |
| `useBanningLogic.js` | Hook for handling ban checks and enforcement. | `useBanningLogic` |
| `useBots.js` | Logic for handling AI bot interactions and presence. | `useBots` |
| `useGameAutomation.js`| Automated game triggers and transitions. | `useGameAutomation` |
| `useLeaderboards.js` | Logic for fetching and displaying game rankings. | `useLeaderboards` |
| `useLoginRewards.js` | Daily login bonus tracking and collection UI logic. | `useLoginRewards` |
| `useNotifications.js` | Logic for real-time app notifications. | `useNotifications` |
| `useOnboarding.js` | Controls the newcomer onboarding flow and registration. | `useOnboarding` |
| `usePresence.js` | Real-time user online/offline status management. | `usePresence` |
| `useRoom.js` | Main lobby and game room management (Join/Create/Leave). | `useRoom` |
| `useSocial.js` | Social features (Friends, Requests, Block/Unblock). | `useSocial` |

## Subdirectories

### `hooks/`
Contains additional specialized logic hooks.
- **`useGameActions.js`**: Specific actions within a game session.
- **`useUserListeners.js`**: Handles Firebase listeners for user document updates.

### `utils/`
Contains utility scripts used by the core app.
- **`bgAnimation.js`**: Logic for driving the dynamic "Cyber" background animation.
