(function() {
    var { useState, useEffect } = React;

    /**
     * useAuthState Hook
     * Manages Firebase authentication state and user data synchronization.
     * 
     * @param {Object} setters - Setters for App-level state that need to be updated during auth.
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
                        return () => unsubSnap();
                    }
                } else {
                    setUser(null);
                    setUserData(null);
                }
                setAuthLoading(false);
            });
            return unsubAuth;
        }, []);

        var isLoggedIn = !!user;
        return { user, userData, authLoading, isLoggedIn, setUser, setUserData, setAuthLoading };
    };
})();
