(function() {
    var { useEffect } = React;

    /**
     * useGameAutomation Hook
     * Manages game timers (discussion, voting, word selection) and 
     * admin-side auto-resolution of game phases.
     * 
     * @param {Object} deps - Dependencies and state setters.
     */
    window.useGameAutomation = ({
        room,
        roomId,
        currentUID,
        setTurnTimer,
        setVotingTimer,
        setWordSelTimer,
        handleSkipTurn,
        triggerVoting
    }) => {
        // 1. Timers logic
        useEffect(() => { 
            if (room?.status === 'discussing' && room?.turnEndTime) { 
                var interval = setInterval(() => { 
                    var remaining = Math.max(0, Math.floor((room.turnEndTime - Date.now()) / 1000)); 
                    setTurnTimer(remaining); 
                    if (remaining <= 0) { 
                        if (typeof handleSkipTurn === 'function') handleSkipTurn(true); 
                        clearInterval(interval); 
                    } 
                }, 1000); 
                return () => clearInterval(interval); 
            } else setTurnTimer(30); 
        }, [room?.status, room?.turnEndTime, handleSkipTurn]);

        useEffect(() => { 
            if (room?.status === 'voting' && room?.votingEndTime) { 
                var interval = setInterval(() => { 
                    var remaining = Math.max(0, Math.floor((room.votingEndTime - Date.now()) / 1000)); 
                    setVotingTimer(remaining); 
                    if (remaining <= 0) { clearInterval(interval); } 
                }, 1000); 
                return () => clearInterval(interval); 
            } else setVotingTimer(30); 
        }, [room?.status, room?.votingEndTime]);

        useEffect(() => { 
            if (room?.status === 'word_selection' && room?.wordSelEndTime) { 
                var interval = setInterval(() => { 
                    var remaining = Math.max(0, Math.floor((room.wordSelEndTime - Date.now()) / 1000)); 
                    setWordSelTimer(remaining); 
                    if (remaining <= 0) { clearInterval(interval); } 
                }, 1000); 
                return () => clearInterval(interval); 
            } else setWordSelTimer(30); 
        }, [room?.status, room?.wordSelEndTime]);

        // 2. Auto-resolve word votes (admin only)
        useEffect(() => {
            if (!room || room.status !== 'word_selection' || currentUID !== room.admin) return;
            var activePlayers = room.players.filter(p => p.status === 'active');
            var voters = activePlayers.filter(p => p.role !== 'spy' && p.role !== 'mrwhite');
            if (voters.length === 0) return;
            
            var allVoted = voters.every(p => room.wordVotes?.[p.uid]);
            if (!allVoted) return;

            var voteCounts = {};
            voters.forEach(p => {
                var w = room.wordVotes[p.uid];
                if (w) voteCounts[w] = (voteCounts[w] || 0) + 1;
            });
            var chosenWord = Object.entries(voteCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
            if (!chosenWord) return;

            roomsCollection.doc(roomId).update({
                chosenWord, 
                status: 'discussing',
                wordSelEndTime: null, 
                turnEndTime: Date.now() + 30000,
            }).catch(() => {});
        }, [room?.wordVotes, room?.status, currentUID, room?.admin, room?.players, roomId]);

        // 3. Auto-resolve final votes (admin only)
        useEffect(() => {
            if (!room || room.status !== 'voting' || currentUID !== room.admin) return;
            var activePlayers = room.players.filter(p => p.status === 'active');
            var allVoted = activePlayers.length > 0 && activePlayers.every(p => room.votes?.[p.uid]);
            if (!allVoted) return;

            var voteCounts = {};
            Object.values(room.votes).forEach(v => { voteCounts[v] = (voteCounts[v] || 0) + 1; });
            var maxVotes = Math.max(...Object.values(voteCounts));
            var topVoted = Object.entries(voteCounts).filter(([, count]) => count === maxVotes);
            
            if (topVoted.length > 1) {
                // Tie → spy escapes
                roomsCollection.doc(roomId).update({ status: 'finished_spy_escaped', votingEndTime: null }).catch(() => {});
                return;
            }
            
            var ejectedUID = topVoted[0][0];
            var ejectedPlayer = activePlayers.find(p => p.uid === ejectedUID);
            var ejectedRole = ejectedPlayer?.role;
            var sysMsg = { sender: 'system', name: 'SYSTEM', text: `🚨 ${ejectedPlayer?.name || ejectedUID} was ejected!`, time: Date.now() };
            
            if (ejectedRole === 'spy') {
                roomsCollection.doc(roomId).update({ status: 'spy_guessing', ejectedUID, votingEndTime: null, messages: firebase.firestore.FieldValue.arrayUnion(sysMsg) }).catch(() => {});
            } else if (ejectedRole === 'mrwhite') {
                roomsCollection.doc(roomId).update({ status: 'mrwhite_guessing', ejectedUID, votingEndTime: null, messages: firebase.firestore.FieldValue.arrayUnion(sysMsg) }).catch(() => {});
            } else {
                roomsCollection.doc(roomId).update({ status: 'finished_spy_escaped', ejectedUID, votingEndTime: null, messages: firebase.firestore.FieldValue.arrayUnion(sysMsg) }).catch(() => {});
            }
        }, [room?.votes, room?.status, currentUID, room?.admin, room?.players, roomId]);
    };
})();
