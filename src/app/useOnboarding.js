/**
 * Who-Is-The-Spy-og | useOnboarding.js
 * Modularised Onboarding, Tutorial, and PWA Hook (IIFE + Global Scope)
 * 
 * Part of Phase 4: Modularization
 * Handles: User onboarding (signup), Tutorial triggers, and PWA install events.
 */

(function() {
    var { useState, useEffect, useCallback } = React;

    window.useOnboarding = function(context) {
        var { 
            user, userData, isLoggedIn, authLoading,
            setUser, setUserData, setNickname, setGuestData,
            lang, setNotification, playSound 
        } = context;

        // ── Onboarding & Tutorial States ──
        var [showOnboarding, setShowOnboarding] = useState(false);
        var [onboardingGoogleUser, setOnboardingGoogleUser] = useState(null);
        var [pendingNewUserRef, setPendingNewUserRef] = useState(null);
        var [showTutorial, setShowTutorial] = useState(false);
        var [showPWAInstall, setShowPWAInstall] = useState(false);

        // ── PWA Install Listener ──
        useEffect(() => {
            var handler = () => setShowPWAInstall(true);
            window.addEventListener('pwa-available', handler);
            return () => window.removeEventListener('pwa-available', handler);
        }, []);

        // ── Tutorial Auto-Trigger ──
        useEffect(() => { 
            var tutorialDone = localStorage.getItem('pro_spy_tutorial_v2'); 
            if (!tutorialDone && isLoggedIn) {
                setShowTutorial(true); 
            }
        }, [isLoggedIn]);

        // ── Onboarding Complete Handler ──
        var handleOnboardingComplete = useCallback(async ({ displayName, gender, country, photoURL }) => {
            if (!onboardingGoogleUser || !pendingNewUserRef) return;
            
            // Dependencies: TS, getCurrentCycleMonth, usersCollection (global)
            var u = onboardingGoogleUser;
            var finalPhoto = photoURL || u.photoURL || null;
            
            var newUserData = {
                uid: u.uid,
                email: u.email || null,
                displayName: displayName,
                photoURL: finalPhoto,
                gender: gender,
                country: country ? { code: country.code, flag: country.flag, name_ar: country.name_ar, name_en: country.name_en } : null,
                customId: Math.floor(100000000 + Math.random() * 900000000).toString(),
                stats: { wins: 0, losses: 0, xp: 0 },
                achievements: [],
                friends: [],
                friendRequests: [],
                createdAt: TS(),
                lastChangedName: null,
                lastActive: TS(),
                isAnonymous: false,
                currency: 100,
                inventory: { frames: [], titles: [], themes: [], badges: [], gifts: [] },
                equipped: { badges: [] },
                charisma: 0,
                bannerURL: null,
                loginRewards: { currentDay: 0, lastClaimDate: null, streak: 0, totalClaims: 0, cycleMonth: getCurrentCycleMonth() },
            };

            try {
                await pendingNewUserRef.set(newUserData);
                setUserData(newUserData);
                setNickname(displayName);
                setUser(u);
                setGuestData(null);
                setShowOnboarding(false);
                setOnboardingGoogleUser(null);
                setPendingNewUserRef(null);
                
                // Start listening to user doc (inline sync)
                pendingNewUserRef.onSnapshot(snap => {
                    if (snap.exists) { 
                        var d = snap.data();
                        setUserData(d); 
                        if (d.displayName) setNickname(d.displayName); 
                    }
                });

                if (typeof playSound === 'function') playSound('success');
                setNotification(lang === 'ar' ? '🎉 مرحباً بك!' : '🎉 Welcome aboard!');
            } catch (error) {
                console.error("Onboarding Error:", error);
                setNotification(lang === 'ar' ? '❌ حدث خطأ' : '❌ Error');
            }
        }, [onboardingGoogleUser, pendingNewUserRef, lang, setUser, setUserData, setNickname, setGuestData, setNotification, playSound]);

        return {
            showOnboarding, setShowOnboarding,
            onboardingGoogleUser, setOnboardingGoogleUser,
            pendingNewUserRef, setPendingNewUserRef,
            showTutorial, setShowTutorial,
            showPWAInstall, setShowPWAInstall,
            handleOnboardingComplete
        };
    };
})();
