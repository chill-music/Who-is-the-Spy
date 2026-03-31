(function() {
    var { useState, useEffect } = React;

    /**
     * useAuthState Hook
     * Manages Firebase authentication state and user data synchronization.
     * Also handles signInWithRedirect result (mobile/PWA flow).
     */
    window.useAuthState = ({
        setLang,
        setNickname,
        setOnboardingGoogleUser,
        setPendingNewUserRef,
        setShowOnboarding
    }) => {
        var [user, setUser] = useState(null);
        var [userData, setUserData] = useState(null);
        var [authLoading, setAuthLoading] = useState(true);

        useEffect(() => {
            setAuthLoading(true);

            /* ── 1. Handle Google Redirect Result (mobile / PWA) ─────────────
               Must be called INSIDE React so onAuthStateChanged fires first
               and then the redirect result confirms/completes the auth.
               Errors like auth/invalid-action (stale state after logout+relogin)
               are silently swallowed — they don't prevent the next login attempt.
            ──────────────────────────────────────────────────────────────────── */
            auth.getRedirectResult()
                .then(function(result) {
                    if (result && result.user) {
                        console.log('[Auth] Redirect sign-in OK:', result.user.displayName);
                    }
                })
                .catch(function(err) {
                    /* Silently ignore all redirect errors:
                       - auth/invalid-action  → stale state after logout+relogin (most common)
                       - auth/unauthorized-domain → domain not added in Firebase Console
                       These errors do NOT block the next signInWithRedirect attempt. */
                    if (err.code === 'auth/unauthorized-domain') {
                        console.error('[Auth] Add', window.location.hostname, 'to Firebase Authorized Domains');
                    }
                    /* All other errors (including auth/invalid-action) are safe to ignore */
                });

            /* ── 2. Primary auth state listener ────────────────────────────── */
            var unsubAuth = auth.onAuthStateChanged(async (u) => {
                if (u && !u.isAnonymous) {
                    setUser(u);
                    var userRef = usersCollection.doc(u.uid);
                    var doc = await userRef.get();
                    if (!doc.exists) {
                        // New user - show onboarding modal
                        setOnboardingGoogleUser(u);
                        setPendingNewUserRef(userRef);
                        setAuthLoading(false);
                        setShowOnboarding(true);
                    } else {
                        var existingData = doc.data();
                        setUserData(existingData);
                        if (existingData.displayName) setNickname(existingData.displayName);
                        
                        // Load saved language from Firestore
                        if (existingData.lang && (existingData.lang === 'ar' || existingData.lang === 'en')) {
                            setLang(existingData.lang);
                            localStorage.setItem('pro_spy_lang', existingData.lang);
                        }

                        // Check login rewards cycle
                        if (typeof checkLoginRewardsCycle === 'function' && checkLoginRewardsCycle(existingData)) {
                            await userRef.update({ 
                                'loginRewards.currentDay': 0, 
                                'loginRewards.streak': 0, 
                                'loginRewards.cycleMonth': getCurrentCycleMonth() 
                            });
                        }

                        // Real-time user data sync
                        var unsubSnap = userRef.onSnapshot(snap => {
                            if (snap.exists) {
                                var d = snap.data();
                                setUserData(d);
                                if (d.displayName) setNickname(d.displayName);
                            }
                        });
                        setAuthLoading(false);
                        /* ── Hide boot screen when user data is ready ── */
                        if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();
                        return () => unsubSnap();
                    }
                } else {
                    setUser(null);
                    setUserData(null);
                }
                setAuthLoading(false);
                /* ── Hide boot screen (guest or no user) ── */
                if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();
            });
            return unsubAuth;
        }, []);

        var isLoggedIn = !!user;
        return { user, userData, authLoading, isLoggedIn, setUser, setUserData, setAuthLoading };
    };
})();
