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
            // Only log + act when all conditions for a new-user are potentially met
            if (!authLoading && !userDataLoading && user !== null && user && !user.isAnonymous && !userData && !window._googleLoginInProgress) {
                console.log("[Auth] Confirmed new user — showing onboarding (uid=" + user.uid + ")");
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
                // Debug logs removed for cleanliness
                if (u === null && window._googleLoginInProgress) {
                    console.log("Ignored null auth state because Google Login is in progress");
                    return;
                }

                if (u && !u.isAnonymous) {
                    window._googleLoginInProgress = false;
                    setUser(u);
                    setAuthLoading(false);
                    setUserDataLoading(true); // ← CRITICAL: reset before async server read;
                                              //   the null-auth branch may have set this false,
                                              //   which would let the onboarding effect fire
                                              //   immediately before we get the real answer.
                    var userRef = usersCollection.doc(u.uid);

                    if (unsubSnapGlobal) { unsubSnapGlobal(); unsubSnapGlobal = null; }

                    /* ── 3. Two-phase user data load ──────────────────────────────────
                       Phase A — Force server read ({ source: 'server' }):
                         After clearing browser data, Firestore's local cache is empty.
                         Both onSnapshot() and get() without { source: 'server' } hit
                         that empty cache first and return doc.exists=false — even when
                         the document EXISTS on the server. This caused returning users
                         to be treated as new users and shown the onboarding screen.
                         Forcing { source: 'server' } bypasses the cache completely.

                       Phase B — Real-time listener (onSnapshot):
                         Set up AFTER the authoritative server read, so live profile
                         updates (avatar changes, currency, etc.) are still reflected.
                         Also fires when a genuine new user finishes onboarding and
                         the document is created for the first time.
                    ─────────────────────────────────────────────────────────────── */

                    /* Helper: write user data fields into React state */
                    var applyUserData = function(data) {
                        setUserData(data);
                        if (data.displayName) setNickname(data.displayName);
                        if (data.lang && (data.lang === 'ar' || data.lang === 'en')) {
                            setLang(data.lang);
                            localStorage.setItem('pro_spy_lang', data.lang);
                        }
                        if (typeof checkLoginRewardsCycle === 'function' && checkLoginRewardsCycle(data)) {
                            userRef.update({
                                'loginRewards.currentDay': 0,
                                'loginRewards.streak': 0,
                                'loginRewards.cycleMonth': getCurrentCycleMonth()
                            }).catch(() => {});
                        }
                    };

                    /* Helper: activate real-time listener for live profile updates */
                    var setupRealtimeListener = function(isNewUser) {
                        unsubSnapGlobal = userRef.onSnapshot(function(snap) {
                            if (snap.exists) {
                                var data = snap.data();
                                // Ignore stale ghost accounts from local cache
                                if (isNewUser && !data.customId && !data.displayName) {
                                    console.warn('[Auth] Ignoring stale cached ghost document.');
                                    return;
                                }
                                applyUserData(data);
                            }
                        }, function(error) {
                            console.error('[Auth] Firestore listener error:', error);
                        });
                    };

                    /* Phase A: server-forced read — the definitive existence check */
                    userRef.get({ source: 'server' })
                        .then(function(serverDoc) {
                            if (serverDoc.exists) {
                                var existingData = serverDoc.data();
                                applyUserData(existingData);
                                setUserDataLoading(false);
                                if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();
                                setupRealtimeListener(false);
                            } else {
                                // Confirmed absent on server — genuinely new user
                                setUserData(null);
                                setUserDataLoading(false);
                                if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();
                                // Phase B: real-time listener (also fires when onboarding creates the doc)
                                setupRealtimeListener(true);
                            }
                        })
                        .catch(function(err) {
                            // Server unreachable (offline / network error) — fall back to default read
                            console.warn('[Auth] Server read failed, falling back to default source:', err.message);
                            userRef.get()
                                .then(function(fallbackDoc) {
                                    if (fallbackDoc.exists) {
                                        var fallbackData = fallbackDoc.data();
                                        // Ignore if fallback is an old ghost account
                                        if (!fallbackData.customId && !fallbackData.displayName) {
                                            console.log('userData received (fallback): ghost document ignored');
                                            setUserData(null);
                                            setUserDataLoading(false);
                                            if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();
                                            setupRealtimeListener(true);
                                        } else {
                                            console.log('userData received (fallback): ' + JSON.stringify(fallbackData).slice(0, 100) + '...');
                                            applyUserData(fallbackData);
                                            setUserDataLoading(false);
                                            if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();
                                            setupRealtimeListener(false);
                                        }
                                    } else {
                                        console.log('userData received (fallback): null');
                                        setUserData(null);
                                        setUserDataLoading(false);
                                        if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();
                                        setupRealtimeListener(true);
                                    }
                                })
                                .catch(function(fallbackErr) {
                                    console.error('[Auth] Fallback read also failed:', fallbackErr);
                                    setUserDataLoading(false);
                                    if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();
                                });
                        });

                } else if (u === null) {
                    // Not authenticated — show login screen only, never trigger onboarding
                    console.log('[Auth] No user session — showing login screen');
                    setUser(null);
                    setUserData(null);
                    setAuthLoading(false);
                    setUserDataLoading(false);
                    if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();
                    return; // Stop here — do not fall through to any further logic
                } else {
                    // Anonymous / guest user — no Firestore listener needed
                    setUser(null);
                    setUserData(null);
                    setAuthLoading(false);
                    setUserDataLoading(false);
                    if (typeof window.__hideBootScreen === 'function') window.__hideBootScreen();
                }
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
