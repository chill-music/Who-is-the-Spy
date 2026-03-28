/**
 * Who-Is-The-Spy-og | useLoginRewards.js
 * Modularised Login Rewards Hook (IIFE + Global Scope)
 * 
 * Part of Phase 4: Modularization
 * Handles: Daily claim logic, modal visibility, streak management
 * Preserves: window.useLoginRewards, var, UTF-8
 */

(function() {
    var { useState, useEffect, useCallback } = React;

    window.useLoginRewards = function(context) {
        var user = context.user;
        var isLoggedIn = context.isLoggedIn;
        var userData = context.userData;
        var lang = context.lang;
        var setNotification = context.setNotification;

        var [showLoginRewards, setShowLoginRewards] = useState(false);
        var [sessionClaimedToday, setSessionClaimedToday] = useState(false);

        // 📅 Trigger logic to show modal if not claimed today
        useEffect(() => {
            if (isLoggedIn && userData && !sessionClaimedToday) {
                var loginData = userData.loginRewards || { currentDay: 0, lastClaimDate: null };
                var lcd = loginData.lastClaimDate;
                var lastClaimDate = null;
                
                if (lcd?.toDate) lastClaimDate = lcd.toDate();
                else if (lcd instanceof Date) lastClaimDate = lcd;
                else if (lcd) { var d = new Date(lcd); if (!isNaN(d.getTime())) lastClaimDate = d; }
                
                var todayStr = new Date().toDateString();
                var lastClaimStr = lastClaimDate ? lastClaimDate.toDateString() : null;
                var canClaim = lastClaimStr !== todayStr;
                
                if (canClaim && loginData.currentDay < 30) {
                    setShowLoginRewards(true);
                }
            }
        }, [isLoggedIn, userData?.loginRewards?.lastClaimDate, sessionClaimedToday]);

        // 🎁 Claim Callback
        var handleClaimLoginReward = useCallback(async (day) => {
            if (!user || !isLoggedIn) return;
            
            // Dependencies: usersCollection, LOGIN_REWARDS, firebase, TS, getCurrentCycleMonth, playRewardSound (global)
            try {
                // Safety: re-read current day from Firestore to avoid stale data
                var freshDoc = await usersCollection.doc(user.uid).get();
                var freshData = freshDoc.data();
                var freshLoginData = freshData?.loginRewards || {};
                var freshDay = freshLoginData.currentDay || 0;
                
                // The next day to claim must match what we expect
                var expectedNextDay = freshDay + 1;
                if (day !== expectedNextDay) {
                    day = expectedNextDay; // Fix stale day
                }
                
                var reward = LOGIN_REWARDS[day - 1];
                if (!reward) return;

                var userRef = usersCollection.doc(user.uid);
                var inventory = freshData?.inventory || { frames: [], titles: [], badges: [], gifts: [] };
                var updates = {};

                switch (reward.type) {
                    case 'currency':
                        updates.currency = firebase.firestore.FieldValue.increment(reward.amount);
                        setNotification(`${lang === 'ar' ? 'حصلت على' : 'You received'} +${reward.amount} 🧠!`);
                        break;
                    case 'frame':
                        if (!inventory.frames?.includes(reward.itemId)) { 
                            updates['inventory.frames'] = firebase.firestore.FieldValue.arrayUnion(reward.itemId); 
                            setNotification(`${lang === 'ar' ? '🎉 حصلت على إطار!' : '🎉 You received a frame!'} ${lang === 'ar' ? reward.name_ar : reward.name_en}`); 
                        } else { 
                            updates.currency = firebase.firestore.FieldValue.increment(500); 
                            setNotification(`${lang === 'ar' ? 'الإطار مملوك! +500 إنتل' : 'Frame owned! +500 Intel'}! 🧠`); 
                        }
                        break;
                    case 'badge':
                        if (!inventory.badges?.includes(reward.itemId)) { 
                            updates['inventory.badges'] = firebase.firestore.FieldValue.arrayUnion(reward.itemId); 
                            setNotification(`${lang === 'ar' ? '🎉 حصلت على شارة!' : '🎉 You received a badge!'} ${lang === 'ar' ? reward.name_ar : reward.name_en}`); 
                        } else { 
                            updates.currency = firebase.firestore.FieldValue.increment(500); 
                            setNotification(`${lang === 'ar' ? 'الشارة مملوكة! +500 إنتل' : 'Badge owned! +500 Intel'}! 🧠`); 
                        }
                        break;
                    case 'title':
                        if (!inventory.titles?.includes(reward.itemId)) { 
                            updates['inventory.titles'] = firebase.firestore.FieldValue.arrayUnion(reward.itemId); 
                            setNotification(`${lang === 'ar' ? '🎉 حصلت على لقب!' : '🎉 You received a title!'} ${lang === 'ar' ? reward.name_ar : reward.name_en}`); 
                        } else { 
                            updates.currency = firebase.firestore.FieldValue.increment(500); 
                            setNotification(`${lang === 'ar' ? 'اللقب مملوك! +500 إنتل' : 'Title owned! +500 Intel'}! 🧠`); 
                        }
                        break;
                }
                
                updates['loginRewards.currentDay'] = day;
                updates['loginRewards.lastClaimDate'] = TS();
                updates['loginRewards.streak'] = firebase.firestore.FieldValue.increment(1);
                updates['loginRewards.totalClaims'] = firebase.firestore.FieldValue.increment(1);
                updates['loginRewards.cycleMonth'] = getCurrentCycleMonth();
                
                await userRef.update(updates);
                
                if (typeof playRewardSound === 'function') playRewardSound();
                
                setShowLoginRewards(false);
                setSessionClaimedToday(true); // Mark as claimed for this session
            } catch (error) { 
                console.error("Login Reward Claim Error:", error);
                setNotification(lang === 'ar' ? 'حدث خطأ!' : 'An error occurred!'); 
            }
        }, [user, isLoggedIn, lang, setNotification]);

        return {
            showLoginRewards,
            setShowLoginRewards,
            sessionClaimedToday,
            handleClaimLoginReward
        };
    };
})();
