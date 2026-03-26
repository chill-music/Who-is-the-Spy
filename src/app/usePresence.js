(function() {
    const { useEffect } = React;

    /**
     * usePresence Hook
     * Handles user online status, heartbeat, and session reset.
     * 
     * @param {Object} deps - Dependencies from App state.
     */
    window.usePresence = ({ user, isLoggedIn, userData, isGuest }) => {
        // Presence / Heartbeat Logic
        useEffect(() => {
            if (!user || isGuest) return;

            // Set online immediately on login
            usersCollection.doc(user.uid).update({
                lastActive: TS(),
                onlineStatus: 'online'
            }).catch(() => {});

            // Heartbeat every 3 minutes
            const interval = setInterval(() => {
                usersCollection.doc(user.uid).update({
                    lastActive: TS(),
                    onlineStatus: 'online'
                }).catch(() => {});
            }, 180000);

            // Set offline immediately when page closes
            const handleOffline = () => {
                try {
                    if (navigator.sendBeacon && user.uid && window.appId) {
                        const url = `https://firestore.googleapis.com/v1/projects/who-is-the-spy-919b9/databases/(default)/documents:commit`;
                        const data = JSON.stringify({
                            writes: [{
                                update: {
                                    name: `projects/who-is-the-spy-919b9/databases/(default)/documents/artifacts/${window.appId}/public/data/users/${user.uid}`,
                                    fields: { onlineStatus: { stringValue: 'offline' } }
                                },
                                updateMask: { fieldPaths: ['onlineStatus'] }
                            }]
                        });
                        navigator.sendBeacon(url, data);
                    }
                } catch (e) {}
                usersCollection.doc(user.uid).update({ onlineStatus: 'offline' }).catch(() => {});
            };

            // Set "away" when page hidden (user switched tab)
            const handleVisibility = () => {
                if (document.visibilityState === 'hidden') {
                    usersCollection.doc(user.uid).update({
                        onlineStatus: 'away',
                        lastActive: TS()
                    }).catch(() => {});
                } else {
                    usersCollection.doc(user.uid).update({
                        onlineStatus: 'online',
                        lastActive: TS()
                    }).catch(() => {});
                }
            };

            window.addEventListener('beforeunload', handleOffline);
            document.addEventListener('visibilitychange', handleVisibility);

            return () => {
                clearInterval(interval);
                window.removeEventListener('beforeunload', handleOffline);
                document.removeEventListener('visibilitychange', handleVisibility);
                // Set offline on component unmount (logout)
                usersCollection.doc(user.uid).update({ onlineStatus: 'offline' }).catch(() => {});
            };
        }, [user?.uid, isGuest]);

        // Daily Session Start Reset
        useEffect(() => {
            if (!isLoggedIn || !user || !userData) return;

            // Initialize session start time if not set today
            const sessionStart = userData.dailyTasks?.sessionStartTime?.toDate?.();
            const today = new Date().toDateString();
            const sessionDay = sessionStart ? sessionStart.toDateString() : null;

            if (sessionDay !== today) {
                // New day - reset boxes and set session start
                usersCollection.doc(user.uid).update({
                    'dailyTasks.sessionStartTime': TS(),
                    'dailyTasks.boxes': Array(8).fill(null).map(() => ({ status: 'unclaimed' }))
                }).catch(() => {});
            }
        }, [isLoggedIn, user?.uid, userData?.uid]);
    };
})();
