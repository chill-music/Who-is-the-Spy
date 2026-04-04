(function() {
    var { useEffect } = React;

    /**
     * usePresence Hook
     * Handles user online status, heartbeat, and session reset.
     * Uses .set({ merge: true }) instead of .update() everywhere so it never
     * crashes with "No document to update" on fresh databases or first logins.
     *
     * @param {Object} deps - Dependencies from App state.
     */
    window.usePresence = ({ user, isLoggedIn, userData, isGuest }) => {
        // Presence / Heartbeat Logic
        useEffect(() => {
            // CRITICAL: Must wait for userData to exist. If we write to Firestore
            // before the user finishes onboarding, we create a "ghost" document that
            // causes useAuthState to bypass the onboarding screen for new users!
            if (!user || !userData || isGuest) return;

            // Set online immediately on login
            (async () => {
                try {
                    await usersCollection.doc(user.uid).set({
                        lastActive: TS(),
                        onlineStatus: 'online'
                    }, { merge: true });
                } catch (e) { console.error('[PRO SPY ERROR] usePresence initial online:', e); }
            })();

            // Heartbeat every 3 minutes
            var interval = setInterval(async () => {
                try {
                    await usersCollection.doc(user.uid).set({
                        lastActive: TS(),
                        onlineStatus: 'online'
                    }, { merge: true });
                } catch (e) { console.error('[PRO SPY ERROR] usePresence heartbeat:', e); }
            }, 180000);

            // Set offline immediately when page closes
            var handleOffline = async () => {
                try {
                    if (navigator.sendBeacon && user.uid && window.appId) {
                        var url = `https://firestore.googleapis.com/v1/projects/who-is-the-spy-919b9/databases/(default)/documents:commit`;
                        var data = JSON.stringify({
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
                } catch (e) { console.error('[PRO SPY ERROR] handleOffline beacon:', e); }
                try {
                    await usersCollection.doc(user.uid).set({ onlineStatus: 'offline' }, { merge: true });
                } catch (e) { console.error('[PRO SPY ERROR] handleOffline update:', e); }
            };

            // Set "away" when page hidden (user switched tab)
            var handleVisibility = async () => {
                try {
                    if (document.visibilityState === 'hidden') {
                        await usersCollection.doc(user.uid).set({
                            onlineStatus: 'away',
                            lastActive: TS()
                        }, { merge: true });
                    } else {
                        await usersCollection.doc(user.uid).set({
                            onlineStatus: 'online',
                            lastActive: TS()
                        }, { merge: true });
                    }
                } catch (e) { console.error('[PRO SPY ERROR] handleVisibility:', e); }
            };

            window.addEventListener('beforeunload', handleOffline);
            document.addEventListener('visibilitychange', handleVisibility);

            return () => {
                clearInterval(interval);
                window.removeEventListener('beforeunload', handleOffline);
                document.removeEventListener('visibilitychange', handleVisibility);
                // Set offline on component unmount (logout)
                (async () => {
                    try {
                        var currentUser = firebase.auth().currentUser;
                        if (!currentUser) return; // Don't update if logged out
                        await usersCollection.doc(user.uid).set({ onlineStatus: 'offline' }, { merge: true });
                    } catch (e) { console.error('[PRO SPY ERROR] usePresence unmount:', e); }
                })();
            };
        }, [user?.uid, isGuest, userData?.uid]);

        // Daily Session Start Reset
        useEffect(() => {
            if (!isLoggedIn || !user || !userData) return;

            // Initialize session start time if not set today
            var sessionStart = userData.dailyTasks?.sessionStartTime?.toDate?.();
            var today = new Date().toDateString();
            var sessionDay = sessionStart ? sessionStart.toDateString() : null;

            if (sessionDay !== today) {
                // New day - reset boxes and set session start
                (async () => {
                    try {
                        await usersCollection.doc(user.uid).set({
                            'dailyTasks.sessionStartTime': TS(),
                            'dailyTasks.boxes': Array(8).fill(null).map(() => ({ status: 'unclaimed' }))
                        }, { merge: true });
                    } catch (e) { console.error('[PRO SPY ERROR] daily session reset:', e); }
                })();
            }
        }, [isLoggedIn, user?.uid, userData?.uid]);
    };
})();
