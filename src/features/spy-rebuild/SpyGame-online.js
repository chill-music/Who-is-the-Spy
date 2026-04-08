(function() {
  'use strict';

  const { state, services } = window.SpyGameCore;
  const { useState, useEffect, useRef } = window.React;
  const appId = window.appId || 'pro_spy_v25_final_fix_complete';

  // Helper to get collection ref (after firebase.js has set it up)
  const getSpyRooms = () => window.SpyGameCore._spyRoomsCollection ||
    window.db.collection('artifacts').doc(appId).collection('public').doc('data').collection('spy_rooms');

  /**
   * T021: ONLINE STATE HOOK (window.SpyGameCore.online)
   */
  window.SpyGameCore.online = {

    /**
     * useRoom: Real-time synchronization hook
     * Exposes: room, players, myRole, chatMessages, typingUsers, error
     */
    useRoom: (roomId) => {
        const [room, setRoom] = useState(null);
        const [players, setPlayers] = useState([]);
        const [myRoleDoc, setMyRoleDoc] = useState(null);
        const [chatMessages, setChatMessages] = useState([]);
        const [typingUsers, setTypingUsers] = useState([]); // Array of {uid, name}
        const [error, setError] = useState(null);
        const user = window.auth.currentUser;
        const playersRef = useRef([]); // Keep latest players for typing name lookup

        useEffect(() => {
            playersRef.current = players;
        }, [players]);

        useEffect(() => {
            if (!roomId || !user) return;

            const spyRooms = getSpyRooms();
            const roomRef = spyRooms.doc(roomId);

            // 1. Listen to Room Doc
            const unsubRoom = roomRef.onSnapshot(snap => {
                if (!snap.exists) {
                    setError("Room Deleted");
                    return;
                }
                const data = snap.data();

                // SECURITY ENFORCEMENT: Shield spyUids from non-hosts
                if (data.hostUid !== user.uid) {
                    delete data.spyUids;
                    delete data.spyWord;
                }

                setRoom({ id: snap.id, ...data });

                // Derive typing users (exclude self, exclude stale >5s entries)
                if (data.typingUsers) {
                    const now = Date.now();
                    const activeTyping = [];
                    Object.entries(data.typingUsers).forEach(([uid, ts]) => {
                        if (uid === user.uid) return; // Don't show self
                        const tsMs = ts && ts.toMillis ? ts.toMillis() : (ts && ts.seconds ? ts.seconds * 1000 : 0);
                        if (tsMs && (now - tsMs) < 6000) { // 6s stale threshold
                            const playerInfo = playersRef.current.find(p => p.uid === uid);
                            activeTyping.push({ uid, name: playerInfo ? playerInfo.name : 'Someone' });
                        }
                    });
                    setTypingUsers(activeTyping);
                } else {
                    setTypingUsers([]);
                }

            }, err => setError(err.message));

            // 2. Listen to Players Subcollection
            const unsubPlayers = roomRef.collection('players').orderBy('joinedAt', 'asc').onSnapshot(snap => {
                setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            }, err => setError(err.message));

            // 3. Listen to My Private Role (Security)
            const unsubRole = roomRef.collection('roles').doc(user.uid).onSnapshot(snap => {
                if (snap.exists) setMyRoleDoc(snap.data());
            });

            // 4. Listen to Chat Messages
            const unsubChat = services.subscribeToChat(roomId, (messages) => {
                setChatMessages(messages);
            });

            // 5. Presence Heartbeat (15s)
            const hbInterval = setInterval(() => {
                services.heartbeat(roomId, user.uid);
            }, 15000);

            // 6. Host-side Ghost Removal (60s check)
            let maintenanceInterval;
            // Access latest room/players via closure update
            maintenanceInterval = setInterval(async () => {
                const latestRoomSnap = await getSpyRooms().doc(roomId).get().catch(() => null);
                if (!latestRoomSnap || !latestRoomSnap.exists) return;
                if (latestRoomSnap.data().hostUid !== user.uid) return;

                const latestPlayersSnap = await roomRef.collection('players').get().catch(() => null);
                if (!latestPlayersSnap) return;
                const now = Date.now();
                latestPlayersSnap.docs.forEach(pSnap => {
                    const p = pSnap.data();
                    const lastSeenMs = p.lastSeen?.toMillis ? p.lastSeen.toMillis() : (p.lastSeen?.seconds ? p.lastSeen.seconds * 1000 : 0);
                    if (pSnap.id !== user.uid && lastSeenMs > 0 && (now - lastSeenMs > 60000)) {
                        services.leaveRoom(roomId, pSnap.id);
                    }
                });
            }, 30000);

            return () => {
                unsubRoom();
                unsubPlayers();
                unsubRole();
                if (typeof unsubChat === 'function') unsubChat();
                clearInterval(hbInterval);
                if (maintenanceInterval) clearInterval(maintenanceInterval);

                // Clear our own typing indicator on cleanup
                services.setTyping(roomId, user.uid, false);
            };
        }, [roomId, user?.uid]);

        return { room, players, myRole: myRoleDoc, chatMessages, typingUsers, error };
    }
  };

  /**
   * Online Logic Helpers
   */
  window.SpyGameCore.online.createAndGo = async (settings = {}) => {
    try {
        const code = await services.createRoom(settings);
        window.SpyGameCore.navigate('ONLINE_LOBBY', { roomId: code });
    } catch (e) {
        alert("Operation Failed: " + e.message);
    }
  };

  window.SpyGameCore.online.joinAndGo = async (code, password) => {
    try {
        const uppercaseCode = code.toUpperCase();
        await services.joinRoom(uppercaseCode, password);
        if (typeof window.SpyGameCore.navigate === 'function') {
            window.SpyGameCore.navigate('ONLINE_LOBBY', { roomId: uppercaseCode });
        } else {
            window._spyGamePendingNav = { view: 'ONLINE_LOBBY', params: { roomId: uppercaseCode } };
        }
    } catch (e) {
        if (e.message === 'WRONG_PASSWORD') {
            throw e; // Re-throw so UI can handle
        }
        alert("Join Failed: " + e.message);
    }
  };

  // Helper: expose a method to cache current user data for profile enrichment
  window.SpyGameCore.online.cacheUserData = (userData) => {
      window._currentUserDataCache = userData;
  };

})();