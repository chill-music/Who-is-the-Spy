(function() {
    var { useEffect } = React;

    /**
     * useLeaderboards Hook
     * Manages real-time data for various leaderboards (Wins, Charisma, Family).
     * 
     * @param {Object} deps - Dependencies and state setters.
     */
    window.useLeaderboards = ({ 
        activeView, 
        leaderboardTab, 
        setLeaderboardData, 
        setCharismaLeaderboard, 
        setFamilyLeaderboard 
    }) => {
        // 1. Wins Leaderboard - Real-time
        useEffect(() => {
            if ((activeView === 'leaderboard' || activeView === 'ranking') && leaderboardTab === 'wins') {
                var unsub = usersCollection.orderBy('stats.wins', 'desc').limit(100).onSnapshot(snap => {
                    var data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
                        .filter(d => (d.id && String(d.id).startsWith('bot_')) || d.isAnonymous !== true)
                        .filter(d => (d.id && String(d.id).startsWith('bot_')) ? true : (typeof getUserRole === 'function' ? !getUserRole(d, d.id) : true));
                    setLeaderboardData(data);
                }, error => {
                    // Fallback to static fetch if snapshot fails
                    usersCollection.limit(100).get().then(snap => {
                        var data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
                            .filter(d => (d.id && String(d.id).startsWith('bot_')) || d.isAnonymous !== true)
                            .filter(d => (d.id && String(d.id).startsWith('bot_')) ? true : (typeof getUserRole === 'function' ? !getUserRole(d, d.id) : true));
                        data.sort((a, b) => (b.stats?.wins || 0) - (a.stats?.wins || 0));
                        setLeaderboardData(data);
                    });
                });
                return unsub;
            }
        }, [activeView, leaderboardTab]);

        // 2. Charisma Leaderboard - Real-time
        useEffect(() => {
            if ((activeView === 'leaderboard' || activeView === 'ranking') && leaderboardTab === 'charisma') {
                var unsub = usersCollection.orderBy('charisma', 'desc').limit(100).onSnapshot(snap => {
                    var data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
                        .filter(d => (d.id && String(d.id).startsWith('bot_')) || d.isAnonymous !== true)
                        .filter(d => (d.id && String(d.id).startsWith('bot_')) ? true : (typeof getUserRole === 'function' ? !getUserRole(d, d.id) : true));
                    setCharismaLeaderboard(data);
                }, error => {
                    usersCollection.limit(100).get().then(snap => {
                        var data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
                            .filter(d => (d.id && String(d.id).startsWith('bot_')) || d.isAnonymous !== true)
                            .filter(d => (d.id && String(d.id).startsWith('bot_')) ? true : (typeof getUserRole === 'function' ? !getUserRole(d, d.id) : true));
                        data.sort((a, b) => (b.charisma || 0) - (a.charisma || 0));
                        setCharismaLeaderboard(data);
                    });
                });
                return unsub;
            }
        }, [activeView, leaderboardTab]);

        // 3. Family Leaderboard — by activeness
        useEffect(() => {
            if ((activeView === 'leaderboard' || activeView === 'ranking') && leaderboardTab === 'family') {
                var familiesCol = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('families');
                familiesCol.orderBy('activeness', 'desc').limit(50).get()
                    .then(snap => setFamilyLeaderboard(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
                    .catch(() => {
                        familiesCol.limit(50).get().then(snap => {
                            var data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                            data.sort((a, b) => (b.activeness || 0) - (a.activeness || 0));
                            setFamilyLeaderboard(data);
                        }).catch(() => {});
                    });
            }
        }, [activeView, leaderboardTab]);
    };
})();
// v2.1-cache-bust-2026-03-31
