(function() {
  'use strict';

  const { state, services } = window.SpyGameCore;
  const db = window.db; // From 01-config.js
  const appId = window.appId || 'pro_spy_v25_final_fix_complete';
  const spyRoomsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('spy_rooms');

  /**
   * Internal Helper: _withRetry
   * Retries an async function up to maxAttempts times with exponential backoff.
   */
  const _withRetry = async (fn, maxAttempts = 3, delay = 1000) => {
    let attempt = 0;
    while (attempt < maxAttempts) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
        if (attempt >= maxAttempts) throw err;
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  };

  // Helper: Generate Alphanumeric 6-char code
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous O, 0, I, 1
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Helper: Get current user's profile data (photo, equipped items)
  const _getUserProfile = () => {
    const user = window.auth.currentUser;
    if (!user) return null;
    // Try to get equipped from the global user data store
    const userData = window._currentUserDataCache || {};
    return {
      uid: user.uid,
      name: user.displayName || userData.displayName || 'Agent ' + user.uid.substr(0,4),
      photoURL: user.photoURL || userData.photoURL || null,
      equipped: userData.equipped || null,
      customId: userData.customId || null
    };
  };

  /**
   * FIREBASE SERVICES (window.SpyGameCore.services)
   */
  window.SpyGameCore.services = {
    ...services,

    /**
     * T018: Create Room (Alphanumeric 6-char)
     * Now supports: isPrivate, password, and custom settings
     */
    createRoom: async (settings = {}) => {
        const code = generateRoomCode();
        const user = window.auth.currentUser;
        if (!user) throw new Error("Authentication Required");

        const profile = _getUserProfile();
        const roomRef = spyRoomsCollection.doc(code);

        await roomRef.set({
            status: 'LOBBY',
            hostUid: user.uid,
            category: settings.category || 'animals',
            difficulty: settings.difficulty || 'normal',
            isPrivate: settings.isPrivate || false,
            password: settings.isPrivate ? (settings.password || '') : null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            spyUids: [],
            villagerWord: null,
            spyWord: null,
            timer: settings.timer || state.GAME_CONFIG?.DEFAULT_TIMER || 300,
            accusedUid: null,
            typingUsers: {},
            scores: {},
            rounds: [],
            chatCount: 0
        });

        // Add creator as first player with full profile
        await roomRef.collection('players').doc(user.uid).set({
            uid: user.uid,
            name: profile.name,
            photoURL: profile.photoURL,
            equipped: profile.equipped,
            customId: profile.customId,
            isReady: true,
            joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        });

        return code;
    },

    /**
     * T018: Join Room — now with password verification + profile enrichment
     */
    joinRoom: async (roomId, password) => {
        const user = window.auth.currentUser;
        if (!user) throw new Error("Authentication Required");

        const roomRef = spyRoomsCollection.doc(roomId.toUpperCase());
        const snap = await roomRef.get();

        if (!snap.exists) throw new Error("Room Not Found");
        const data = snap.data();
        if (data.status !== 'LOBBY') throw new Error("Mission Already In Progress");

        // Password check
        if (data.isPrivate && data.password) {
            if (!password || password !== data.password) {
                throw new Error("WRONG_PASSWORD");
            }
        }

        const profile = _getUserProfile();

        await roomRef.collection('players').doc(user.uid).set({
            uid: user.uid,
            name: profile.name,
            photoURL: profile.photoURL,
            equipped: profile.equipped,
            customId: profile.customId,
            isReady: false,
            joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        });

        return roomId.toUpperCase();
    },

    /**
     * T019: Start Game (Host-only Batch Write)
     */
    startGame: async (roomId, players) => {
        const roomRef = spyRoomsCollection.doc(roomId);
        const snap = await roomRef.get();
        const { category, difficulty } = snap.data();

        // 1. Pick Words
        const words = state.WORD_BANK[category] || state.WORD_BANK.animals;
        const pair = state.pickByDifficulty(words, difficulty);

        // 2. Assign Roles
        const shuffled = state.shuffle([...players]);
        const spyCount = Math.max(1, Math.floor(players.length / 5)); // 1 spy per 5 players
        const spies = shuffled.slice(0, spyCount);
        const spyUids = spies.map(s => s.uid);

        const batch = db.batch();

        // Update Room Doc
        batch.update(roomRef, {
            status: 'DISTRIBUTING',
            spyUids: spyUids,
            villagerWord: pair.word_en,
            spyWord: pair.decoy_en,
            votes: {},
            playerVotes: {},
            convincingClueVotes: {},
            accusedUid: null,
            spyGuessedCorrectly: null,
            spyGuess: null,
            spyWordAr: pair.word_ar || pair.word_en,
            villagerWordAr: pair.decoy_ar || pair.decoy_en,
            startTime: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Assign secret roles to subcollection roles/{uid}
        players.forEach(p => {
            const isSpy = spyUids.includes(p.uid);
            const roleRef = roomRef.collection('roles').doc(p.uid);
            batch.set(roleRef, {
                role: isSpy ? 'SPY' : 'VILLAGER',
                word: isSpy ? pair.decoy_en : pair.word_en,
                wordAr: isSpy ? (pair.decoy_ar || pair.decoy_en) : (pair.word_ar || pair.word_en),
                assignedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        await batch.commit();
    },

    /**
     * T020: Heartbeat (Updates presence)
     */
    heartbeat: async (roomId, uid) => {
        if (!roomId || !uid) return;
        return spyRoomsCollection.doc(roomId)
            .collection('players').doc(uid)
            .update({ lastSeen: firebase.firestore.FieldValue.serverTimestamp() })
            .catch(e => console.warn("Presence lost", e));
    },

    /**
     * T020: Transactional Host Election
     */
    electNewHost: async (roomId) => {
        const roomRef = spyRoomsCollection.doc(roomId);

        return db.runTransaction(async (transaction) => {
            const roomSnap = await transaction.get(roomRef);
            if (!roomSnap.exists) return;

            const playersSnap = await roomRef.collection('players').orderBy('joinedAt', 'asc').get();
            const activePlayers = playersSnap.docs.filter(d => {
                const data = d.data();
                if (!data.lastSeen) return false;
                const lastSeenMs = data.lastSeen.toMillis ? data.lastSeen.toMillis() : (data.lastSeen.seconds * 1000);
                const idleSeconds = (Date.now() - lastSeenMs) / 1000;
                return idleSeconds < 45;
            });

            if (activePlayers.length > 0) {
                const nextHost = activePlayers[0].id;
                if (roomSnap.data().hostUid !== nextHost) {
                    transaction.update(roomRef, { hostUid: nextHost });
                }
            }
        });
    },

    /**
     * T027: submitVote (Individual tracking for +3 bonus)
     */
    submitVote: async (roomId, targetUid) => {
        const user = window.auth.currentUser;
        if (!user) return;
        const roomRef = spyRoomsCollection.doc(roomId);

        return _withRetry(() => roomRef.update({
            [`playerVotes.${user.uid}`]: targetUid,
            [`votes.${targetUid}`]: firebase.firestore.FieldValue.increment(1)
        }));
    },

    /**
     * submitConvincingClueVote
     */
    submitConvincingClueVote: async (roomId, targetUid) => {
        const user = window.auth.currentUser;
        if (!user) return;
        const roomRef = spyRoomsCollection.doc(roomId);
        return roomRef.update({
            [`convincingClueVotes.${user.uid}`]: targetUid
        });
    },

    /**
     * T026: submitSpyGuess (Fuzzy matching)
     */
    submitSpyGuess: async (roomId, guess) => {
        const roomRef = spyRoomsCollection.doc(roomId);
        const snap = await _withRetry(() => roomRef.get());
        const { villagerWord } = snap.data();

        const isCorrect = state.checkFuzzyMatch(guess, villagerWord);

        return _withRetry(() => roomRef.update({
            spyGuessedCorrectly: isCorrect,
            spyGuess: guess,
            status: 'SCORING'
        }));
    },

    calculateAndWriteScores: async (roomId) => {
        const roomRef = spyRoomsCollection.doc(roomId);
        const roomSnap = await _withRetry(() => roomRef.get());
        const roomData = roomSnap.data();
        const { spyUids, playerVotes, convincingClueVotes, villagerWord, spyGuessedCorrectly } = roomData;

        const playersSnap = await _withRetry(() => roomRef.collection('players').get());
        const players = playersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const accusedUid = roomData.accusedUid;
        const isSpyCaught = accusedUid && spyUids.includes(accusedUid);

        // Aggregate Convincing Clue Votes
        const clueTallies = {};
        Object.values(convincingClueVotes || {}).forEach(uid => {
            clueTallies[uid] = (clueTallies[uid] || 0) + 1;
        });
        const maxClueVotes = Math.max(0, ...Object.values(clueTallies));
        const clueWinnerUids = Object.keys(clueTallies).filter(uid => clueTallies[uid] === maxClueVotes && maxClueVotes > 0);

        const roundResults = {};
        players.forEach(p => {
            let points = 0;
            const isSpy = spyUids.includes(p.id);

            if (isSpy) {
                if (!isSpyCaught) points += 5;
                else if (spyGuessedCorrectly) points += 3;
            } else {
                const playerVote = playerVotes ? playerVotes[p.id] : null;
                const votedForASpy = spyUids.includes(playerVote);

                if (isSpyCaught && playerVote === accusedUid) points += 3;
                else if (votedForASpy) points += 1;
                else if (playerVote && !votedForASpy) points -= 1;
            }

            if (clueWinnerUids.includes(p.id)) points += 1;
            roundResults[p.id] = points;
        });

        const batch = db.batch();
        const currentScores = roomData.scores || {};
        const newScores = { ...currentScores };
        players.forEach(p => {
            newScores[p.id] = (newScores[p.id] || 0) + (roundResults[p.id] || 0);
        });

        const roundObject = {
            roundNumber: (roomData.rounds ? roomData.rounds.length : 0) + 1,
            results: roundResults,
            villagerWord,
            spyUids,
            isSpyCaught,
            spyGuessedCorrectly,
            timestamp: Date.now()
        };

        batch.update(roomRef, {
            status: 'RESULTS',
            scores: newScores,
            rounds: firebase.firestore.FieldValue.arrayUnion(roundObject),
            votes: {},
            playerVotes: {},
            convincingClueVotes: {},
            accusedUid: null,
            spyGuessedCorrectly: null,
            spyGuess: null
        });

        await _withRetry(() => batch.commit());
    },

    /**
     * T019: Leave Room (deletes room if empty)
     */
    leaveRoom: async (roomId, uid) => {
        if (!roomId || !uid) return;
        const roomRef = spyRoomsCollection.doc(roomId);
        
        const roomDoc = await roomRef.get().catch(() => null);
        if (!roomDoc || !roomDoc.exists) return;
        const isHost = roomDoc.data().hostUid === uid;
        const status = roomDoc.data().status;

        await roomRef.collection('players').doc(uid).delete().catch(e => console.warn("Player removal failed", e));

        // Check if room is now empty
        const snap = await roomRef.collection('players').limit(1).get().catch(() => null);
        if ((snap && snap.empty) || (isHost && status === 'LOBBY')) {
            // Delete room, chat, and any remaining players (cleanup)
            const chatSnap = await roomRef.collection('chat').limit(50).get().catch(() => null);
            const playersSnap = await roomRef.collection('players').limit(50).get().catch(() => null);
            const batch = db.batch();
            if (chatSnap) chatSnap.docs.forEach(d => batch.delete(d.ref));
            if (playersSnap) playersSnap.docs.forEach(d => batch.delete(d.ref));
            batch.delete(roomRef);
            await batch.commit().catch(e => console.warn("Room cleanup failed", e));
        } else {
            return window.SpyGameCore.services.electNewHost(roomId);
        }
    },

    /**
     * updateRoom: Generic helper for UI updates
     */
    updateRoom: (roomId, data) => {
        return _withRetry(() => spyRoomsCollection.doc(roomId).update(data));
    },
    /**
     * Toggles player ready status in the lobby
     */
    togglePlayerReadyStatus: async (roomId, uid, currentStatus) => {
        if (!roomId || !uid) return;
        return spyRoomsCollection.doc(roomId)
            .collection('players').doc(uid)
            .update({ isReady: !currentStatus });
    },

    // ═══════════════════════════════════════════
    //  CHAT SERVICES (New - Feature 3)
    // ═══════════════════════════════════════════

    /**
     * Send a chat message to the room's chat subcollection
     */
    sendChatMessage: async (roomId, { uid, name, photoURL, text, equipped }) => {
        if (!roomId || !text || !text.trim()) return;
        const chatRef = spyRoomsCollection.doc(roomId).collection('chat');
        return chatRef.add({
            uid,
            name: name || 'Agent',
            photoURL: photoURL || null,
            equipped: equipped || null,
            text: text.trim().slice(0, 200), // Max 200 chars
            ts: firebase.firestore.FieldValue.serverTimestamp()
        });
    },

    /**
     * Update typing indicator for the current user
     */
    setTyping: async (roomId, uid, isTyping) => {
        if (!roomId || !uid) return;
        const roomRef = spyRoomsCollection.doc(roomId);
        const update = isTyping
            ? { [`typingUsers.${uid}`]: firebase.firestore.FieldValue.serverTimestamp() }
            : { [`typingUsers.${uid}`]: firebase.firestore.FieldValue.delete() };
        return roomRef.update(update).catch(() => {}); // Silent fail ok
    },

    /**
     * Subscribe to chat messages (real-time)
     */
    subscribeToChat: (roomId, callback) => {
        if (!roomId) return () => {};
        return spyRoomsCollection
            .doc(roomId)
            .collection('chat')
            .orderBy('ts', 'asc')
            .limitToLast(60)
            .onSnapshot(snap => {
                const messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                callback(messages);
            }, err => console.warn('Chat subscription error', err));
    },

    /**
     * React Emoji on a message (bonus engagement feature)
     */
    reactToMessage: async (roomId, msgId, emoji, uid) => {
        if (!roomId || !msgId || !emoji || !uid) return;
        const msgRef = spyRoomsCollection.doc(roomId).collection('chat').doc(msgId);
        return msgRef.update({
            [`reactions.${emoji}.${uid}`]: true
        }).catch(() => {});
    }
  };

  // Expose spyRoomsCollection for useRoom hook
  window.SpyGameCore._spyRoomsCollection = spyRoomsCollection;

})();