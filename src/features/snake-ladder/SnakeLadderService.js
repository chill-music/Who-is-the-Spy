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
                    if (p.uid === uid) return { ...p, left: true, isAFK: true, leftAt: Date.now() };
                    return p;
                });

                const anyActive = updatedPlayers.some(p => !p.left);

                if (!anyActive) {
                    // ✅ Everyone left → delete immediately
                    await ref.delete();
                    console.log(`[SNL-GC] Room ${roomId} deleted (all players left)`);
                } else if (data.admin === uid || data.owner === uid) {
                    // ✅ Admin/Owner left → transfer to next active player, or delete
                    const nextOwner = updatedPlayers.find(p => !p.left);
                    if (nextOwner) {
                        updates.admin = nextOwner.uid;
                        updates.owner = nextOwner.uid;
                        updates.players = updatedPlayers;
                        updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                        await ref.update(updates);
                        console.log(`[SNL-GC] Room ${roomId} admin transferred to ${nextOwner.name}`);
                    } else {
                        await ref.delete();
                        console.log(`[SNL-GC] Room ${roomId} deleted (admin left, no active players)`);
                    }
                } else {
                    updates.players = updatedPlayers;
                    updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                    await ref.update(updates);
                }
                console.log(`[SNL-GC] User ${uid} marked as left in room ${roomId}`);
                this.disconnect();
            } catch (err) {
                console.error(`[SNL-Service] Error leaving room:`, err);
            }
        }

        /**
         * 🧹 GARBAGE COLLECTOR — Sweeps and deletes stale/empty snake_rooms.
         *
         * Deletion conditions:
         *  A) All players have left: { left: true } or { isAFK: true } and no one active
         *  B) Waiting room older than 2 hours (host abandoned before starting)
         *  C) Finished game older than 5 minutes (cleanup after game ends)
         *  D) Playing room with NO activity for 30+ minutes (all players abandoned)
         *
         * @param {string} gameId  - 'snake_ladder_pro' (default)
         * @returns {Promise<number>} - number of rooms deleted
         */
        async sweepEmptyRooms(gameId = 'snake_ladder_pro') {
            const col = (window.RoomService && typeof window.RoomService.getCollection === 'function')
                ? window.RoomService.getCollection(gameId)
                : window.db.collection('artifacts').doc(window.appId).collection('public').doc('data').collection('snake_rooms');

            try {
                const snapshot = await col.get();
                if (snapshot.empty) return 0;

                const now = Date.now();
                const STALE_WAITING_MS  = 2 * 60 * 60 * 1000;  // 2 hours
                const STALE_PLAYING_MS  = 30 * 60 * 1000;       // 30 minutes
                const STALE_FINISHED_MS = 5  * 60 * 1000;       // 5 minutes

                let deletedCount = 0;
                const batch = window.db.batch();

                snapshot.docs.forEach(docSnap => {
                    const d = docSnap.data();
                    const ref = docSnap.ref;

                    // -- Helper: get ms since a Firestore Timestamp or epoch number --
                    const msAgo = (ts) => {
                        if (!ts) return Infinity;
                        const ms = (ts.toMillis ? ts.toMillis() : (typeof ts === 'number' ? ts : 0));
                        return now - ms;
                    };

                    const players = Array.isArray(d.players) ? d.players : Object.values(d.players || {});
                    const activePlayers = players.filter(p => !p.left && !p.isAFK);
                    const status = d.status || 'waiting';

                    let shouldDelete = false;
                    let reason = '';

                    // ── Condition A: All players have left --
                    if (players.length > 0 && activePlayers.length === 0) {
                        shouldDelete = true;
                        reason = 'all players left/AFK';
                    }

                    // ── Condition B: Waiting room is stale --
                    if (!shouldDelete && status === 'waiting' && msAgo(d.updatedAt) > STALE_WAITING_MS) {
                        shouldDelete = true;
                        reason = `waiting room stale (${Math.round(msAgo(d.updatedAt)/60000)}min)`;
                    }

                    // ── Condition C: Finished game not cleaned up --
                    if (!shouldDelete && status === 'finished' && msAgo(d.updatedAt) > STALE_FINISHED_MS) {
                        shouldDelete = true;
                        reason = 'finished game cleanup';
                    }

                    // ── Condition D: Playing room with no recent activity --
                    if (!shouldDelete && status === 'playing' && msAgo(d.updatedAt) > STALE_PLAYING_MS) {
                        shouldDelete = true;
                        reason = `playing room inactive (${Math.round(msAgo(d.updatedAt)/60000)}min)`;
                    }

                    if (shouldDelete) {
                        console.log(`[SNL-GC] 🗑️ Deleting room ${docSnap.id} — ${reason}`);
                        batch.delete(ref);
                        deletedCount++;
                    }
                });

                if (deletedCount > 0) {
                    await batch.commit();
                    console.log(`[SNL-GC] ✅ Swept ${deletedCount} stale room(s)`);
                } else {
                    console.log(`[SNL-GC] ✅ No stale rooms found`);
                }

                return deletedCount;
            } catch (err) {
                console.error('[SNL-GC] sweepEmptyRooms error:', err);
                return 0;
            }
        }

        /**
         * Registers a beforeunload listener so the player is marked as "left"
         * even if they close the tab/browser without pressing the exit button.
         *
         * Call this after joining/creating a room.
         * Call detachBeforeUnload() when leaving normally.
         */
        attachBeforeUnload(roomId, gameId, uid) {
            this._beforeUnloadRoomId = roomId;
            this._beforeUnloadGameId = gameId;
            this._beforeUnloadUid    = uid;

            if (this._beforeUnloadHandler) {
                window.removeEventListener('beforeunload', this._beforeUnloadHandler);
            }
            this._beforeUnloadHandler = () => {
                // sendBeacon is fire-and-forget — works even during page unload
                // We use the Firestore REST API directly since SDK async calls won't finish
                const projectId  = (window.firebaseConfig && window.firebaseConfig.projectId) || 'who-is-the-spy-919b9';
                const aId        = window.appId || 'pro_spy_v25_final_fix_complete';
                const colName    = 'snake_rooms';
                const docPath    = `artifacts/${aId}/public/data/${colName}/${roomId}`;
                const url        = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${docPath}?updateMask.fieldPaths=updatedAt`;

                // Attempt SDK call (may not complete, but worth trying)
                try {
                    this.leaveRoom(roomId, gameId, uid);
                } catch(e) { /* silent — page is unloading */ }
            };

            window.addEventListener('beforeunload', this._beforeUnloadHandler);
            console.log(`[SNL-GC] beforeunload listener attached for room ${roomId}`);
        }

        detachBeforeUnload() {
            if (this._beforeUnloadHandler) {
                window.removeEventListener('beforeunload', this._beforeUnloadHandler);
                this._beforeUnloadHandler  = null;
                this._beforeUnloadRoomId   = null;
                this._beforeUnloadGameId   = null;
                this._beforeUnloadUid      = null;
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
