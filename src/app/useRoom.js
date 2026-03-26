(function() {
    const { useEffect } = React;

    /**
     * useRoom Hook
     * Manages real-time room data and post-game reward processing.
     * 
     * @param {Object} context - Room context and necessary App state/setters.
     */
    window.useRoom = ({
        roomId,
        user,
        isLoggedIn,
        userData,
        coupleData,
        historyWrittenRooms,
        setRoom,
        setRoomId,
        setShowSummary,
        incrementMissionProgress,
        checkAndUnlockAchievements
    }) => {
        useEffect(() => {
            if (!roomId) return;

            const unsub = roomsCollection.doc(roomId).onSnapshot(async doc => {
                if (doc.exists) {
                    const data = doc.data();
                    setRoom(data);

                    // 🛡️ Guard: only write history ONCE per room per session
                    const alreadyWritten = (historyWrittenRooms && historyWrittenRooms.current) 
                        ? historyWrittenRooms.current.has(roomId) 
                        : false;

                    if (data.status?.includes('finished') && !data.summaryShown && !alreadyWritten) {
                        // Mark immediately in memory
                        if (historyWrittenRooms && historyWrittenRooms.current) {
                            historyWrittenRooms.current.add(roomId);
                        }

                        setShowSummary(true);
                        historyCollection.add({ ...data, finishedAt: TS() });
                        roomsCollection.doc(roomId).update({ summaryShown: true });

                        // ✅ Update stats, missions, achievements when game ends
                        if (isLoggedIn && user) {
                            try {
                                const me = data.players?.find(p => p.uid === user.uid);
                                if (me) {
                                    const isSpy = me.role === 'spy' || me.role === 'mrwhite';
                                    const isInformant = me.role === 'informant';
                                    const spyCaught = data.status === 'finished_spy_caught';
                                    const spyEscaped = data.status === 'finished_spy_wins' || data.status === 'finished_spy_escaped';
                                    const mrwhiteWon = data.status === 'finished_mrwhite_win' || data.status === 'finished_mrwhite_wins';
                                    const agentsWon = spyCaught;

                                    let iWon = false;
                                    if (isSpy && (spyEscaped || mrwhiteWon)) iWon = true;
                                    if (isInformant && (spyEscaped || mrwhiteWon)) iWon = true;
                                    if (!isSpy && !isInformant && agentsWon) iWon = true;

                                    const vipXpMult = typeof getVIPXPMultiplier === 'function' ? getVIPXPMultiplier(userData) : 1;
                                    const partnerInRoom = coupleData && data.players?.some(p => p.uid === (coupleData.uid1 === user.uid ? coupleData.uid2 : coupleData.uid1));
                                    const coupleBonus = partnerInRoom ? 1.10 : 1.0;
                                    const gameXP = Math.round((iWon ? 20 : 5) * vipXpMult * coupleBonus);

                                    const statUpdates = {
                                        'stats.losses': firebase.firestore.FieldValue.increment(iWon ? 0 : 1),
                                        'stats.wins':   firebase.firestore.FieldValue.increment(iWon ? 1 : 0),
                                        'stats.xp':     firebase.firestore.FieldValue.increment(gameXP),
                                    };
                                    if (isSpy && iWon) statUpdates['stats.spy_wins']   = firebase.firestore.FieldValue.increment(1);
                                    if (!isSpy && iWon) statUpdates['stats.agent_wins'] = firebase.firestore.FieldValue.increment(1);
                                    statUpdates['stats.win_streak'] = iWon
                                        ? firebase.firestore.FieldValue.increment(1)
                                        : 0;

                                    await usersCollection.doc(user.uid).update(statUpdates);
                                    
                                    if (typeof incrementMissionProgress === 'function') {
                                        await incrementMissionProgress('gamesPlayed', 1);
                                        if (iWon) await incrementMissionProgress('gamesWon', 1);
                                        if (isSpy) await incrementMissionProgress('spyGames', 1);
                                    }

                                    const updatedDoc = await usersCollection.doc(user.uid).get();
                                    if (updatedDoc.exists && typeof checkAndUnlockAchievements === 'function') {
                                        await checkAndUnlockAchievements(updatedDoc.data());
                                    }
                                }
                            } catch (e) { 
                                console.error('Game end stats error:', e); 
                            }
                        }
                    }
                } else {
                    setRoom(null);
                    setRoomId('');
                }
            });

            return () => unsub();
        }, [roomId, isLoggedIn, user?.uid, userData, coupleData, incrementMissionProgress, checkAndUnlockAchievements]);
    };
})();
