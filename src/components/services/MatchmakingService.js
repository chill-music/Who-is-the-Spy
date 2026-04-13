/**
 * MatchmakingService.js
 * Generic service for queuing players into multiplayer rooms.
 * Uses Firestore 'global_queues' and 'rooms' collections.
 * 
 * Features:
 * - Heartbeat mechanism for connection monitoring
 * - Automatic stale entry cleanup
 * - Match validation before room creation
 * - Session timeout handling
 */

class MatchmakingService {
    constructor() {
        this.queueCollection = window.db.collection('artifacts').doc(window.appId).collection('public').doc('data').collection('global_queues');
        this.roomsCollection = window.db.collection('artifacts').doc(window.appId).collection('public').doc('data').collection('rooms');
        this.currentQueueRef = null;
        this.currentRoomListener = null;
        this.pendingRoomCreation = null;
        this.lastQueueCheck = 0;
        
        // Heartbeat & Timeout Configuration
        this.HEARTBEAT_INTERVAL = 3000;      // Send heartbeat every 3 seconds
        this.STALE_TIMEOUT = 15000;          // Remove if no heartbeat for 15 seconds
        this.MAX_QUEUE_TIME = 120000;        // Max 2 minutes in queue before auto-removal
        this.heartbeatInterval = null;
        this.staleCheckInterval = null;
        this.joinQueuePending = false;
    }

    /**
     * Joins the queue for a specific game
     * @param {string} userId 
     * @param {string} gameId 
     * @param {Object} userData { name, photo, vipLevel }
     */
    async joinQueue(userId, gameId, userData) {
        if (this.joinQueuePending) {
            console.log('[Matchmaking] Join already in progress, skipping...');
            return;
        }

        if (this.currentQueueRef) await this.leaveQueue();
        this.joinQueuePending = true;

        try {
            // Check if already in queue for this game
            const existingDoc = await this.queueCollection.doc(userId).get();
            if (existingDoc.exists && existingDoc.data().gameId === gameId && !existingDoc.data().roomId) {
                console.log(`[Matchmaking] User ${userId} already in queue`);
                this.startHeartbeat(userId);
                this.currentQueueRef = this.queueCollection.doc(userId); // Restore ref
                this.joinQueuePending = false;
                return this.listenForRoom(userId, gameId);
            }
    
            console.log(`[Matchmaking] User ${userId} joining queue for ${gameId}`);
            
            const queueEntry = {
                userId,
                gameId,
                name: userData.name,
                photo: userData.photo,
                vipLevel: userData.vipLevel || 0,
                joinedAt: Date.now(), // Fixed: Use number instead of FieldValue in array-like contexts if needed, but here it's a doc root
                lastHeartbeat: Date.now(),
                isActive: true,
                clientId: this.generateClientId()
            };
    
            this.currentQueueRef = this.queueCollection.doc(userId);
            await this.currentQueueRef.set(queueEntry);
    
            // Start heartbeat mechanism
            this.startHeartbeat(userId);
            
            // Start listening for room assignments
            this.joinQueuePending = false;
            return this.listenForRoom(userId, gameId);
        } catch (err) {
            this.joinQueuePending = false;
            throw err;
        }
    }

    /**
     * Generates a unique client ID for this session
     */
    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Starts the heartbeat mechanism to keep connection alive
     */
    startHeartbeat(userId) {
        // Clear any existing heartbeat
        this.stopHeartbeat();

        // Send heartbeat every 3 seconds
        this.heartbeatInterval = setInterval(async () => {
            if (!this.currentQueueRef) return;
            
            try {
                await this.currentQueueRef.update({
                    lastHeartbeat: Date.now(),
                    isActive: true,
                    clientId: this.currentQueueRef.id // Verify document still exists
                });
                console.log(`[Matchmaking] Heartbeat sent for ${userId}`);
            } catch (err) {
                console.warn(`[Matchmaking] Heartbeat failed for ${userId}:`, err);
                // If update fails, connection might be lost - try to rejoin
                await this.handleConnectionLost(userId);
            }
        }, this.HEARTBEAT_INTERVAL);

        // Check for stale entries every 5 seconds
        this.staleCheckInterval = setInterval(async () => {
            await this.cleanupStaleEntries(userId);
        }, 5000);
    }

    /**
     * Stops the heartbeat mechanism
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        if (this.staleCheckInterval) {
            clearInterval(this.staleCheckInterval);
            this.staleCheckInterval = null;
        }
    }

    /**
     * Handles connection lost scenario
     */
    async handleConnectionLost(userId) {
        console.log(`[Matchmaking] Connection lost for ${userId}, attempting reconnection...`);
        
        // Try to update isActive flag
        if (this.currentQueueRef) {
            try {
                await this.currentQueueRef.update({
                    isActive: false,
                    disconnectedAt: Date.now()
                });
            } catch (err) {
                // Document might have been deleted
                console.log(`[Matchmaking] Queue entry already removed for ${userId}`);
            }
        }
    }

    /**
     * Cleans up stale entries from the queue
     * @param {string} excludeUserId - User ID to exclude from cleanup
     */
    async cleanupStaleEntries(excludeUserId = null) {
        try {
            const snapshot = await this.queueCollection
                .where('isActive', '==', false)
                .get();
            
            const staleThreshold = Date.now() - this.STALE_TIMEOUT;
            let cleanedCount = 0;

            for (const doc of snapshot.docs) {
                const data = doc.data();
                const lastHeartbeat = (data.lastHeartbeat && typeof data.lastHeartbeat.toMillis === 'function') 
                    ? data.lastHeartbeat.toMillis() 
                    : (data.lastHeartbeat || 0);
                
                // Check if entry is stale (no heartbeat for too long)
                if (lastHeartbeat < staleThreshold || data.disconnectedAt) {
                    console.log(`[Matchmaking] Removing stale entry: ${data.userId}`);
                    await doc.ref.delete();
                    cleanedCount++;
                }
            }

            // Also clean up entries that have been in queue too long
            const oldSnapshot = await this.queueCollection.get();
            for (const doc of oldSnapshot.docs) {
                const data = doc.data();
                const joinedAt = (data.joinedAt && typeof data.joinedAt.toMillis === 'function')
                    ? data.joinedAt.toMillis()
                    : (data.joinedAt || 0);
                const queueAge = Date.now() - joinedAt;

                // Remove if in queue too long and not matched
                if (queueAge > this.MAX_QUEUE_TIME && !data.roomId && data.userId !== excludeUserId) {
                    console.log(`[Matchmaking] Removing expired queue entry: ${data.userId}`);
                    await doc.ref.delete();
                    cleanedCount++;
                }
            }

            if (cleanedCount > 0) {
                console.log(`[Matchmaking] Cleaned up ${cleanedCount} stale entries`);
            }
        } catch (err) {
            console.warn('[Matchmaking] Cleanup error:', err);
        }
    }

    /**
     * Leaves the current queue - IMMEDIATE cleanup
     */
    async leaveQueue() {
        // Stop heartbeat first to prevent race conditions
        this.stopHeartbeat();

        if (this.currentQueueRef) {
            try {
                // Immediate deletion - no delay
                await this.currentQueueRef.delete();
                console.log('[Matchmaking] Queue entry removed immediately');
            } catch (err) {
                console.warn('[Matchmaking] Queue cleanup error:', err);
            }
            this.currentQueueRef = null;
        }
        if (this.currentRoomListener) {
            this.currentRoomListener();
            this.currentRoomListener = null;
        }
    }

    /**
     * Internal listener to detect when a player is moved from queue to a room
     */
    listenForRoom(userId, gameId) {
        return new Promise((resolve, reject) => {
            this.currentRoomListener = this.currentQueueRef.onSnapshot(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    
                    // Priority 1: Match found! (Regardless of isActive, which is set to false upon match)
                    if (data.roomId) {
                        console.log(`[Matchmaking] Match found! Room ID: ${data.roomId}`);
                        this.leaveQueue(); // Clean up heartbeat and listeners
                        resolve(data.roomId);
                    } 
                    // Priority 2: Inactive without a room = Error/Cancel
                    else if (data.isActive === false) {
                        console.log(`[Matchmaking] Match rejected - player inactive`);
                        reject(new Error('Player is not active'));
                    }
                }
            }, reject);
        });
    }

    /**
     * Validates that all players are still connected before creating a room
     * @param {Array} players - Array of player objects
     * @returns {Promise<Object>} Validation result
     */
    async validatePlayers(players) {
        const validation = {
            valid: true,
            invalidPlayers: [],
            activeCount: 0
        };

        for (const player of players) {
            if (player.type === 'bot') {
                validation.activeCount++;
                continue;
            }

            try {
                const doc = await this.queueCollection.doc(player.userId).get();
                
                if (!doc.exists) {
                    validation.valid = false;
                    validation.invalidPlayers.push({
                        userId: player.userId,
                        reason: 'not_in_queue'
                    });
                } else {
                    const data = doc.data();
                    
                    // Check if player is active and connected
                    if (data.isActive === false) {
                        validation.valid = false;
                        validation.invalidPlayers.push({
                            userId: player.userId,
                            reason: 'inactive'
                        });
                    } else {
                        // Check last heartbeat
                        const lastHeartbeat = (data.lastHeartbeat && typeof data.lastHeartbeat.toMillis === 'function')
                            ? data.lastHeartbeat.toMillis()
                            : (data.lastHeartbeat || 0);
                        const timeSinceHeartbeat = Date.now() - lastHeartbeat;
                        
                        if (timeSinceHeartbeat > this.STALE_TIMEOUT) {
                            validation.valid = false;
                            validation.invalidPlayers.push({
                                userId: player.userId,
                                reason: 'stale_connection',
                                timeSinceHeartbeat
                            });
                        } else {
                            validation.activeCount++;
                        }
                    }
                }
            } catch (err) {
                console.warn(`[Matchmaking] Validation error for ${player.userId}:`, err);
            }
        }

        console.log('[Matchmaking] Validation result:', validation);
        return validation;
    }

    /**
     * Logic for 'Host' to bundle players into a room
     * Now includes validation before room creation
     */
    async discoverAndMatch(gameId, minPlayers = 2, maxPlayers = 4) {
        const now = Date.now();
        
        // Rate limit: Only check once per 2 seconds
        if (now - this.lastQueueCheck < 2000) return null;
        this.lastQueueCheck = now;

        // Mutex: Prevent multiple room creation attempts
        if (this.pendingRoomCreation) return null;

        try {
            // Clean up stale entries first
            await this.cleanupStaleEntries();

            // Query oldest players in queue for this game
            const snapshot = await this.queueCollection
                .where('gameId', '==', gameId)
                .orderBy('joinedAt', 'asc')
                .limit(maxPlayers)
                .get();

            if (snapshot.size > 0) {
                // Filter to only active players with valid heartbeats
                const activeThreshold = now - this.STALE_TIMEOUT;
                const players = snapshot.docs
                    .map(doc => ({ ...doc.data(), _docId: doc.id }))
                    .filter(p => {
                        // Must not be assigned to a room
                        if (p.roomId) return false;
                        // Must have a valid userId
                        if (!p.userId) return false;
                        // Must have recent heartbeat (active connection)
                        const lastHeartbeat = (p.lastHeartbeat && typeof p.lastHeartbeat.toMillis === 'function')
                            ? p.lastHeartbeat.toMillis()
                            : (p.lastHeartbeat || 0);
                        if (lastHeartbeat < activeThreshold) return false;
                        // Must be marked as active
                        if (p.isActive === false) return false;
                        return true;
                    })
                    .slice(0, maxPlayers);
                
                if (players.length >= minPlayers) {
                    // Validate ALL players before creating room
                    const validation = await this.validatePlayers(players);
                    
                    if (!validation.valid) {
                        console.log('[Matchmaking] Validation failed, retrying...');
                        // Remove invalid players from queue and retry
                        for (const invalid of validation.invalidPlayers) {
                            await this.queueCollection.doc(invalid.userId).delete();
                        }
                        return null;
                    }

                    console.log(`[Matchmaking] All ${validation.activeCount} players validated successfully`);

                    // The oldest player creates the room
                    if (players[0].userId === window.auth?.currentUser?.uid) {
                        this.pendingRoomCreation = true;
                        try {
                            const roomId = await this.createRoom(gameId, players);
                            return roomId;
                        } finally {
                            this.pendingRoomCreation = null;
                        }
                    }
                }
            }
        } catch (err) {
            console.warn('[Matchmaking] discoverAndMatch error:', err);
            this.pendingRoomCreation = null;
        }
        return null;
    }

    /**
     * Creates a room after all players are validated
     */
    async createRoom(gameId, players) {
        const roomId = `snl_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const col = (window.RoomService && typeof window.RoomService.getCollection === 'function')
            ? window.RoomService.getCollection(gameId)
            : this.roomsCollection.doc(gameId).collection('players');
        const roomRef = col.doc(roomId);

        const roomData = {
            roomId,
            gameId,
            status: 'playing',
            players: players.map(p => ({
                uid: p.userId || p.uid,
                name: p.name,
                photo: p.photo,
                type: p.type || 'human',
                joinedAt: Date.now()
            })),
            currentTurnIndex: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            validatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await roomRef.set(roomData);

        // Update all players in queue to point to this room (and mark as inactive)
        const batch = window.db.batch();
        players.forEach(p => {
            if (p.type !== 'bot') {
                const pRef = this.queueCollection.doc(p.userId || p.uid);
                batch.update(pRef, { 
                    roomId: roomId,
                    isActive: false,
                    matchedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        });
        await batch.commit();

        return roomId;
    }

    /**
     * Force-starts a room by filling empty slots with bots
     */
    async startFullMatchWithBots(gameId, currentPlayers) {
        // Validate current players first
        if (currentPlayers && currentPlayers.length > 0) {
            const validation = await this.validatePlayers(currentPlayers);
            
            if (!validation.valid) {
                console.log('[Matchmaking] Removing invalid players before bot fill:', validation.invalidPlayers);
                // Filter out invalid players
                const validPlayers = currentPlayers.filter(p => 
                    !validation.invalidPlayers.some(inv => inv.userId === p.userId)
                );
                currentPlayers = validPlayers;
            }
        }

        const botsNeeded = 4 - (currentPlayers?.length || 0);
        if (botsNeeded <= 0) return null;
        
        const bots = Array.from({ length: botsNeeded }).map((_, i) => ({
            userId: `bot_${Date.now()}_${i}`,
            name: `Bot ${i + 1} 🤖`,
            photo: '/icos/snake-ladder/bot_avatar.png',
            type: 'bot',
            isActive: true
        }));

        const allParticipants = [...(currentPlayers || []), ...bots];
        const roomId = await this.createRoom(gameId, allParticipants);
        return roomId;
    }
}

// Global Injection
window.MatchmakingService = new MatchmakingService();