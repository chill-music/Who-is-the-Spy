/**
 * SnakeLadderService.js
 * Synchronizes Snake & Ladder game state using Firestore.
 * Listens to rooms/{gameId}/players/{roomId}
 */

(function() {
    class SnakeLadderService {
        constructor() {
            this.roomRef = null;
            this.unsub = null;
            this.onStateChange = null;
        }

        /**
         * Connects to a specific game room and listens for real-time updates
         * @param {string} roomId 
         * @param {string} gameId 
         * @param {Function} callback 
         */
        connect(roomId, gameId, callback) {
            this.onStateChange = callback;
            var col = (window.RoomService && typeof window.RoomService.getCollection === 'function')
                ? window.RoomService.getCollection(gameId)
                : window.db.collection('artifacts').doc(window.appId).collection('public').doc('data').collection('snake_rooms');

            this.roomRef = col.doc(roomId);

            console.log(`[SNL-Service] Connecting to room: ${roomId}`);
            
            this.unsub = this.roomRef.onSnapshot(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    if (this.onStateChange) this.onStateChange(data);
                } else {
                    console.warn(`[SNL-Service] Room ${roomId} does not exist.`);
                }
            }, err => {
                console.error(`[SNL-Service] Snapshot error:`, err);
            });
        }

        disconnect() {
            if (this.unsub) {
                this.unsub();
                this.unsub = null;
            }
            this.roomRef = null;
        }

        /**
         * Submits a move action to Firestore.
         * Authoritative player (turn owner) sends the action.
         */
        async submitMove(diceRoll, newPositions, nextTurnIndex, resultSequence = [], startPos = 0) {
            if (!this.roomRef) return;

            try {
                await this.roomRef.update({
                    lastAction: {
                        type: 'move',
                        playerUid: firebase.auth().currentUser.uid,
                        roll: diceRoll,
                        sequence: resultSequence,
                        startPos: startPos,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    },
                    playerPositions: newPositions, // Map of uid -> position
                    currentTurnIndex: nextTurnIndex,
                    turnStartTime: Date.now(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (err) {
                console.error(`[SNL-Service] Failed to submit move:`, err);
            }
        }

        /**
         * Heartbeat/Rejoin: Checks for active match for current user
         */
        async leaveRoom(roomId, gameId, uid) {
            // ✅ FIX: Capture a LOCAL ref so concurrent disconnect() calls can't null it out
            let ref = this.roomRef;
            
            if (!ref && roomId) {
                var col = (window.RoomService && typeof window.RoomService.getCollection === 'function')
                    ? window.RoomService.getCollection(gameId)
                    : window.db.collection('artifacts').doc(window.appId).collection('public').doc('data').collection('snake_rooms');
                ref = col.doc(roomId);
            }
            if (!ref) return;

            try {
                const doc = await ref.get();
                if (!doc.exists) return;
                const data = doc.data();
                
                let updates = {};
                const players = data.players || [];
                const updatedPlayers = players.map(p => {
                    if (p.uid === uid) return { ...p, left: true, isAFK: true };
                    return p;
                });

                if (data.owner === uid) {
                    const nextOwner = updatedPlayers.find(p => !p.left && p.uid !== uid);
                    if (nextOwner) {
                        updates.owner = nextOwner.uid;
                    }
                }

                updates.players = updatedPlayers;
                updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

                await ref.update(updates);
                console.log(`[SNL-Service] User ${uid} left room ${roomId}`);
                this.disconnect();
            } catch (err) {
                console.error(`[SNL-Service] Error leaving room:`, err);
            }
        }

        /**
         * Starts the game — transitions room status from 'waiting' → 'playing'.
         * Only the room admin should call this.
         * @param {string} roomId
         * @param {string} gameId
         */
        async startGame(roomId, gameId) {
            let ref = this.roomRef;

            if (!ref && roomId) {
                var col = (window.RoomService && typeof window.RoomService.getCollection === 'function')
                    ? window.RoomService.getCollection(gameId)
                    : window.db.collection('artifacts').doc(window.appId).collection('public').doc('data').collection('snake_rooms');
                ref = col.doc(roomId);
            }
            if (!ref) return;

            try {
                const doc = await ref.get();
                if (!doc.exists) return;
                const data = doc.data();

                // Build initial playerPositions map
                const players = Array.isArray(data.players) ? data.players : Object.values(data.players || {});
                const positions = {};
                players.forEach(p => { positions[p.uid] = 0; });

                await ref.update({
                    status: 'playing',
                    playerPositions: positions,
                    currentTurnIndex: 0,
                    turnStartTime: Date.now(),
                    startedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log(`[SNL-Service] Game started for room ${roomId}`);
            } catch (err) {
                console.error(`[SNL-Service] Error starting game:`, err);
            }
        }

        /**
         * Copies room code to clipboard and returns a success flag.
         * @param {string} roomId
         * @returns {Promise<boolean>}
         */
        async copyRoomCode(roomId) {
            try {
                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(roomId);
                    return true;
                }
            } catch (e) {
                console.warn('[SNL-Service] Clipboard copy failed:', e);
            }
            return false;
        }

        /**
         * Updates a specific player's data in the players array.
         * Used for setting AFK status.
         */
        async updatePlayerStatus(uid, updates) {
            if (!this.roomRef) return;
            try {
                const doc = await this.roomRef.get();
                if (!doc.exists) return;
                const data = doc.data();
                const players = data.players || [];
                
                const updatedPlayers = players.map(p => {
                    if (p.uid === uid) return { ...p, ...updates };
                    return p;
                });

                await this.roomRef.update({
                    players: updatedPlayers,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (err) {
                console.error(`[SNL-Service] Error updating player status:`, err);
            }
        }

        async findActiveMatch(uid, gameId) {
            const col = (window.RoomService && typeof window.RoomService.getCollection === 'function')
                ? window.RoomService.getCollection(gameId)
                : window.db.collection('artifacts').doc(window.appId).collection('public').doc('data').collection('snake_rooms');

            const query = col.where('status', '==', 'playing');

            const snapshot = await query.get();
            // Filter client-side because where('players', 'array-contains') depends on schema
            const activeRoom = snapshot.docs.find(doc => {
                const data = doc.data();
                return data.players.some(p => p.uid === uid);
            });

            return activeRoom ? activeRoom.id : null;
        }
    }

    // Global Injection
    window.SnakeLadderService = new SnakeLadderService();
})();
