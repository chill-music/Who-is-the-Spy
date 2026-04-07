# Data Model: Spy Game Rebuild

This model defines the Firestore structure for the real-time online multiplayer mode.

## 1. Collection: `${window.appId}/rooms/{roomId}`

**Entity: Room**

| Field | Type | Description |
|-------|------|-------------|
| roomId | string | 6-char uppercase code |
| gameType | string | Constant "spy" |
| createdAt | Timestamp | - |
| updatedAt | Timestamp | - |
| hostUid | string | UID of current host |
| settings | object | Game configuration (spies, timer, categories) |
| status | string | waiting, starting, distributing, discussing, voting, revealing, results, finished |
| players | map | Keyed by UID: `{ uid, displayName, photoURL, isGuest, isVIP, isHost, isReady, joinedAt, isOnline, lastHeartbeat }` |
| currentRound | number | 1 to totalRounds |
| currentWord | string | Real word (villager word) |
| currentCategory| string | - |
| spyUids | array[string]| List of spy UIDs for the current round |
| turnOrder | array[string]| Shuffled list of UIDs for discussion |
| currentTurnIndex| number | Index into turnOrder (0-based) |
| timerEndsAt | Timestamp | Future timestamp for discussion end |
| votingDeadline | Timestamp | Future timestamp for voting end |
| votes | map | `{ voterUid: accusedUid }` |
| scores | map | Cumulative scores `{ uid: number }` |
| rounds | array[object]| History of rounds: `{ roundNumber, word, spyUids, votes, accusedUid, accusedWasSpy, spyGuess, spyGuessedWord, pointsAwarded }` |

## 2. Subcollection: `${window.appId}/rooms/{roomId}/wordAssignments/{uid}`

**Entity: WordAssignment**

| Field | Type | Description |
|-------|------|-------------|
| uid | string | Player UID |
| word | string | Assigned word (real or decoy) |
| isSpy | boolean | - |
| category | string | - |
| hasAcknowledged| boolean | True once "I've seen it" is tapped |
| revealedAt | Timestamp | - |

**Security Constraint**: Read-only for the authenticated user whose `uid` matches the document ID.

## 3. State Transitions

| Current Status | Trigger Action | Target Status |
|----------------|----------------|---------------|
| waiting | Host taps "Start Game" | starting |
| starting | System generates words/roles | distributing |
| distributing | All players acknowledge words | discussing |
| discussing | Timer ends or all speak | voting |
| voting | Timer ends or all vote | revealing |
| revealing | Reveal animations complete | results or finished |
| results | Host taps "Next Round" | starting |
| results | Host taps "End Game" | finished |
