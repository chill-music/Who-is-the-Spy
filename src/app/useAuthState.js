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
        var [userDataLoading, setUserDataLoading] = useState(true);

        useEffect(() => {
            console.log("Onboarding check: authLoading=" + authLoading + " userDataLoading=" + userDataLoading + " userData=" + (userData ? JSON.stringify(userData).slice(0, 50) + "..." : "null"));
            if (!authLoading && !userDataLoading && user && !user.isAnonymous && !userData && !window._googleLoginInProgress) {
                // Only NOW show onboarding - confirmed new user
                console.log("!!! TRIGGERING ONBOARDING - CONFIRMED NEW USER !!!");
                var userRef = usersCollection.doc(user.uid);
                setOnboardingGoogleUser(user);
                setPendingNewUserRef(userRef);
                setShowOnboarding(true);
            }
        }, [authLoading, userDataLoading, user, userData]);

        useEffect(() => {
            setAuthLoading(true);
            setUserDataLoading(true);

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
            var unsubSnapGlobal = null;

            /* ── 2. Primary auth state listener ────────────────────────────── */
            var unsubAuth = auth.onAuthStateChanged(async (u) => {
                console.log("Auth state changed: " + (u ? u.uid : "null"));
                
                if (u === null && window._googleLoginInProgress) {
                    console.log("Ignored null auth state because Google Login is in progress");
                    return;
                }

                if (u && !u.isAnonymous) {
                    window._googleLoginInProgress = false;
                    setUser(u);
                    setAuthLoading(false);
                    var userRef = usersCollection.doc(u.uid);
                    
                    console.log("userData loading started via onSnapshot");
                    
                    if (unsubSnapGlobal) unsubSnapGlobal();
                    
                    unsubSnapGlobal = userRef.onSnapshot((doc) => {
                        if (doc.exists) {
                            var existingData = doc.data();
                            console.log("userData received: " + JSON.stringify(existingData).slice(0, 100) + "...");
                            setUserData(existingData);
                            if (existingData.displayName) setNickname(existingData.displayName);
                            
                            // Load saved language from Firestore
                            if (existingData.lang && (existingData.lang === 'ar' || existingData.lang === 'en')) {
                                setLang(existingData.lang);
                                localStorage.setItem('pro_spy_lang', existingData.lang);
                            }

                            // Check login rewards cycle
                            if (typeof checkLoginRewardsCycle === 'function' && checkLoginRewardsCycle(existingData)) {
                                userRef.update({ 
                                    'loginRewards.currentDay': 0, 
                                    'loginRewards.streak': 0, 
                                    'loginRewards.cycleMonth': getCurrentCycleMonth() 
                                }).catch(()=>{});
                            }
                            
                            setUserDataLoading(false);
                            console.log("userDataLoading set to false");
                            
                            /* ── Hide boot screen when user data is ready ── */
                            if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();
                        } else {
                            console.log("userData snapshot says doc does not exist. Waiting 3 seconds to confirm...");
                            // Wait 3 seconds before concluding new user
                            // (gives Firestore time to fully connect)
                            setTimeout(() => {
                                // Check one more time before showing onboarding
                                userRef.get().then((freshDoc) => {
                                    if (!freshDoc.exists) {
                                        console.log("userData received: null (confirmed doc does not exist after 3s)");
                                        setUserData(null);
                                        setUserDataLoading(false);
                                        console.log("userDataLoading set to false (confirmed new user)");
                                        /* ── Hide boot screen ── */
                                        if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();
                                    }
                                });
                            }, 3000);
                        }
                    }, (error) => {
                        console.error('Firestore connection error:', error);
                        setUserDataLoading(false);
                        if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();
                    });
                } else {
                    setUser(null);
                    setUserData(null);
                    setAuthLoading(false);
                    setUserDataLoading(false);
                }
                /* ── Hide boot screen (guest or no user) ── */
                if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();
            });
            return () => {
                unsubAuth();
                if (unsubSnapGlobal) unsubSnapGlobal();
            };
        }, []);

        var isLoggedIn = !!user;
        return { user, userData, authLoading, userDataLoading, isLoggedIn, setUser, setUserData, setAuthLoading, setUserDataLoading };
    };
})();
