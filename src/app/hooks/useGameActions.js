(function () {
    var { useCallback } = React;

    /**
     * useGameActions — Consolidates core business logic and interaction handlers:
     * - Authentication (Login/Logout)
     * - Room/Game management
     * - Social (Friends/Gifts)
     * - Shop/VIP/Inventory
     * - Achievements/Missions
     */
    window.useGameActions = function ({
        user, userData, isLoggedIn, isGuest, nickname, lang, t, currentUID, currentUserData,
        room, roomId, setRoom, setRoomId,
        guestData, setGuestData, setNickname, setAuthLoading,
        setNotification, playSound, setAlertMessage, setLoading,
        setShowSetupModal, setActiveView, setCopied, setShowSummary,
        setShowLoginAlert, setShowDropdown, setJoinError, setShowBrowseRooms,
        setFriendsData, setFriendRequests, setChatsMeta, setTotalUnread,
        setChatFriend, setShowPrivateChat, setOpenChatId, setShowUserProfile, setTargetProfileUID,
        setLeaderboardData, setCharismaLeaderboard, setFamilyLeaderboard,
        setIncomingProposal, setShowIncomingProposal,
        proposalRing, setSessionClaimedToday,
        isPrivate, password, setupMode, gameChatInput, setGameChatInput,
        userFamily, friendsData, notifications, setNotifications, setUnreadNotifications,
        incrementMissionProgress, checkAndUnlockAchievements, // recursive or cross-ref
        OWNER_UID, addFriendId, setAddFriendId, setFriendSearchMsg
    }) {

        // ── Auth Functions ──
        var handleGoogleLogin = useCallback(async () => {
            var provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });

            /* ────────────────────────────────────────────────────────────────
               signInWithPopup — used for ALL devices (desktop & mobile).

               WHY NOT signInWithRedirect on mobile?
               → On PWA/standalone mode, Firebase redirects through an external
                 browser window. When the user comes back, the app loses the
                 sessionStorage context so getRedirectResult() returns null.
               → signInWithPopup stays entirely within the same browser context
                 and is reliable even on Android Chrome.
            ──────────────────────────────────────────────────────────────── */
            try {
                window._googleLoginInProgress = true;
                /* Ensure token survives app restarts / page refreshes */
                await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                var result = await auth.signInWithPopup(provider);
                if (result && result.user) {
                    setShowDropdown && setShowDropdown(false);
                }
                window._googleLoginInProgress = false; // Reset on success
            } catch (e) {
                window._googleLoginInProgress = false;
                /* Ignore user-cancelled interactions */
                if (e.code === 'auth/popup-closed-by-user'
                    || e.code === 'auth/cancelled-popup-request') {
                    return;
                }
                /* Only as last resort: popup was hard-blocked by browser */
                if (e.code === 'auth/popup-blocked') {
                    try {
                        window._googleLoginInProgress = true;
                        await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                        await auth.signInWithRedirect(provider);
                    } catch (_) {
                        window._googleLoginInProgress = false;
                        console.error("[Auth] Redirect fallback failed:", _);
                    }
                } else {
                    console.error("[Auth] Login error:", e);
                }
            }
        }, [setShowDropdown]);

        var handleLogout = useCallback(async () => {
            if (user) await auth.signOut();
            setShowDropdown && setShowDropdown(false);
            setNickname && setNickname('');
            setGuestData && setGuestData(null);
            localStorage.removeItem('pro_spy_guest_uid');
            localStorage.removeItem('pro_spy_nick');
        }, [user, setShowDropdown, setNickname, setGuestData]);

        // ── Notification Functions ──
        var createNotification = useCallback(async (toUserId, type, message, fromUserId, fromName, giftData = null) => {
            try { await notificationsCollection.add({ toUserId, fromUserId, fromName, type, message, giftData, timestamp: TS(), read: false }); } catch (e) { }
        }, []);

        var markNotificationRead = useCallback(async (notifId) => {
            try { await notificationsCollection.doc(notifId).update({ read: true }); } catch (e) { }
        }, []);

        var clearAllNotifications = useCallback(async () => {
            try {
                var batch = db.batch();
                notifications.forEach(n => { batch.delete(notificationsCollection.doc(n.id)); });
                await batch.commit();
                setNotifications && setNotifications([]);
                setUnreadNotifications && setUnreadNotifications(0);
            } catch (e) { }
        }, [notifications, setNotifications, setUnreadNotifications]);

        var handleNotificationClick = useCallback((notif) => {
            if (notif.type === 'friend_request') { setActiveView && setActiveView('friends'); }
            else if (notif.type === 'gift') { setNotification && setNotification(notif.message); }
            else if (notif.type === 'couple_proposal') { setActiveView && setActiveView('discover'); }
            else if (notif.type === 'couple_accepted') { window.setShowCoupleCard && window.setShowCoupleCard(true); }
            else if (notif.type === 'message') {
                if (notif.fromUserId && notif.fromName) {
                    var friend = { uid: notif.fromUserId, displayName: notif.fromName, photoURL: notif.fromPhoto };
                    setChatFriend && setChatFriend(friend);
                    setShowPrivateChat && setShowPrivateChat(true);
                }
            }
        }, [setActiveView, setNotification, setChatFriend, setShowPrivateChat]);

        // ── Achievement & Mission Logic ──
        var unlockAchievement = useCallback(async (badgeId) => {
            if (!isLoggedIn || !user) return;
            try {
                var achievement = ACHIEVEMENTS.find(a => a.id === badgeId);
                if (!achievement) return;
                var currentAchs = userData?.achievements || [];
                if (currentAchs.includes(badgeId)) return;
                await usersCollection.doc(user.uid).update({
                    achievements: firebase.firestore.FieldValue.arrayUnion(badgeId)
                });
            } catch (error) { console.error('Achievement unlock error:', error); }
        }, [isLoggedIn, user, userData]);

        var checkAndUnlockAchievements = useCallback(async (latestUserData) => {
            if (!isLoggedIn || !user || !latestUserData) return;
            var data = latestUserData;
            var currentAchs = Array.isArray(data.achievements) ? data.achievements : [];
            var stats = data.stats || {};
            var gamesPlayed = (stats.wins || 0) + (stats.losses || 0);

            var getValue = (type) => {
                switch (type) {
                    case 'wins': return stats.wins || 0;
                    case 'losses': return stats.losses || 0;
                    case 'games_played': return gamesPlayed;
                    case 'spy_wins': return stats.spy_wins || 0;
                    case 'agent_wins': return stats.agent_wins || 0;
                    case 'win_streak': return stats.win_streak || 0;
                    case 'gifts_received': return data.giftsReceived || 0;
                    case 'gifts_sent': return data.giftsSent || 0;
                    case 'charisma': return data.charisma || 0;
                    case 'friends': return (data.friends || []).length;
                    case 'login_streak': return data.loginRewards?.streak || 0;
                    case 'total_logins': return data.loginRewards?.totalClaims || 0;
                    default: return 0;
                }
            };

            var toUnlock = [];
            for (var ach of ACHIEVEMENTS) {
                if (currentAchs.includes(ach.id)) continue;
                var current = getValue(ach.condition.type);
                if (current >= ach.condition.value) toUnlock.push(ach.id);
            }

            if (toUnlock.length > 0) {
                try {
                    await usersCollection.doc(user.uid).update({
                        achievements: firebase.firestore.FieldValue.arrayUnion(...toUnlock)
                    });
                } catch (e) {
                    for (var id of toUnlock) { try { await unlockAchievement(id); } catch { } }
                }
            }
        }, [isLoggedIn, user, unlockAchievement]);

        var incrementMissionProgress = useCallback(async (key, amount = 1) => {
            if (!isLoggedIn || !user) return;
            try {
                var today = new Date().toDateString();
                var now = new Date();
                var startOfYear = new Date(now.getFullYear(), 0, 1);
                var weekNum = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
                var weekStr = `${now.getFullYear()}-W${weekNum}`;

                var dailyProgress = userData?.missionProgress?.daily || {};
                var weeklyProgress = userData?.missionProgress?.weekly || {};
                var updates = {};

                if (dailyProgress.resetDate !== today) {
                    updates['missionProgress.daily.resetDate'] = today;
                    ['gamesPlayed', 'gamesWon', 'spyGames', 'giftsSent', 'friendsAdded', 'momentsPosted', 'commentsPosted'].forEach(k => {
                        updates[`missionProgress.daily.${k}`] = 0;
                    });
                    updates[`missionProgress.daily.${key}`] = amount;
                } else {
                    updates[`missionProgress.daily.${key}`] = firebase.firestore.FieldValue.increment(amount);
                }

                if (weeklyProgress.resetWeek !== weekStr) {
                    updates['missionProgress.weekly.resetWeek'] = weekStr;
                    ['gamesPlayed', 'gamesWon', 'giftsSent', 'momentsPosted', 'friendsAdded'].forEach(k => {
                        updates[`missionProgress.weekly.${k}`] = 0;
                    });
                    updates[`missionProgress.weekly.${key}`] = amount;
                } else {
                    updates[`missionProgress.weekly.${key}`] = firebase.firestore.FieldValue.increment(amount);
                }
                await usersCollection.doc(user.uid).update(updates);
            } catch (error) { console.error('Mission increment error:', error); }
        }, [isLoggedIn, user, userData]);

        // ── Room & Game Actions ──
        var handleCreateGame = useCallback(async (mode, options = {}) => {
            window.RoomService.handleCreateGame({
                nickname, 
                isPrivate: options.isPrivate !== undefined ? options.isPrivate : isPrivate, 
                password: (options.isPasswordProtected && options.password) ? options.password : (isPrivate ? password : null), 
                currentUID, currentUserData, 
                setupMode: mode || setupMode, 
                t, lang,
                setAlertMessage, setLoading, setRoomId, setShowSetupModal, setActiveView, setCopied, playSound
            });
        }, [nickname, isPrivate, password, currentUID, currentUserData, setupMode, t, lang, setAlertMessage, setLoading, setRoomId, setShowSetupModal, setActiveView, setCopied, playSound]);

        var handleJoinGame = useCallback(async (id, pwd) => {
            window.RoomService.handleJoinGame({
                id, pwd, nickname, currentUID, currentUserData, t, lang,
                setJoinError, setLoading, setAlertMessage, setRoomId, setActiveView, setShowBrowseRooms, playSound
            });
        }, [nickname, currentUID, currentUserData, t, lang, setJoinError, setLoading, setAlertMessage, setRoomId, setActiveView, setShowBrowseRooms, playSound]);

        var handleLeaveRoom = useCallback(async () => {
            window.RoomService.handleLeaveRoom({
                room, roomId, currentUID, setRoom, setRoomId, setShowSummary, playSound
            });
        }, [room, currentUID, roomId, setRoom, setRoomId, setShowSummary, playSound]);

        var startGame = useCallback(async () => {
            window.GameService.startGame({ room, currentUID, roomId, t, playSound, setAlertMessage });
        }, [room, currentUID, roomId, t, playSound, setAlertMessage]);

        var submitWordVote = useCallback(async (word) => {
            window.GameService.submitWordVote({ currentUID, room, roomId, playSound }, word);
        }, [currentUID, room, roomId, playSound]);

        var handleSkipTurn = useCallback(async (forced = false) => {
            window.GameService.handleSkipTurn({ room, currentUID, roomId, playSound }, forced);
        }, [room, currentUID, roomId, playSound]);

        var nextTurn = useCallback(async () => {
            window.GameService.nextTurn({ room, roomId });
        }, [room, roomId]);

        var requestVoting = useCallback(async () => {
            window.GameService.requestVoting({ room, currentUID, roomId, t, playSound });
        }, [room, currentUID, roomId, t, playSound]);

        var agreeToVote = useCallback(async () => {
            window.GameService.agreeToVote({ room, currentUID, roomId, t, playSound });
        }, [room, currentUID, roomId, t, playSound]);

        var declineVote = useCallback(async () => {
            window.GameService.declineVote({ room, currentUID, roomId, playSound });
        }, [room, currentUID, roomId, playSound]);

        var triggerVoting = useCallback(async () => {
            window.GameService.triggerVoting({ roomId, t, playSound });
        }, [roomId, t, playSound]);

        var submitVote = useCallback(async (targetUID) => {
            window.GameService.submitVote({ room, currentUID, roomId, playSound }, targetUID);
        }, [room, currentUID, roomId, playSound]);

        var resetGame = useCallback(async () => {
            window.GameService.resetGame({ room, roomId, playSound, setShowSummary });
        }, [room, roomId, playSound, setShowSummary]);

        var sendGameMessage = useCallback(async () => {
            window.GameService.sendGameMessage({
                gameChatInput, room, currentUID, roomId, nickname, userFamily, setGameChatInput
            });
        }, [gameChatInput, room, currentUID, roomId, nickname, userFamily, setGameChatInput]);

        var submitSpyWordGuess = useCallback(async (guessedWord) => {
            window.GameService.submitSpyWordGuess({ room, currentUID, roomId, playSound }, guessedWord);
        }, [room, currentUID, roomId, playSound]);

        var submitMrWhiteLocationGuess = useCallback(async (guessedLocation) => {
            window.GameService.submitMrWhiteLocationGuess({ room, currentUID, roomId, playSound }, guessedLocation);
        }, [room, currentUID, roomId, playSound]);

        var spyVoluntaryDeclare = useCallback(async () => {
            window.GameService.spyVoluntaryDeclare({ room, currentUID, roomId, playSound });
        }, [room, currentUID, roomId, playSound]);

        var addBotToRoom = useCallback(async () => {
            window.GameService.addBotToRoom({ room, currentUID, roomId, OWNER_UID, setAlertMessage, playSound });
        }, [room, currentUID, roomId, OWNER_UID, setAlertMessage, playSound]);

        var removeBotFromRoom = useCallback(async (botUID) => {
            window.GameService.removeBotFromRoom({ room, currentUID, roomId, OWNER_UID, playSound }, botUID);
        }, [room, currentUID, roomId, OWNER_UID, playSound]);

        // ── Social Actions ──
        var openProfile = useCallback((uid) => { if (!uid) return; setTargetProfileUID && setTargetProfileUID(uid); setShowUserProfile && setShowUserProfile(true); }, [setTargetProfileUID, setShowUserProfile]);

        var openPrivateChat = useCallback((friend) => {
            window.ChatManager.openPrivateChat({ user, setChatFriend, setShowPrivateChat, setOpenChatId }, friend);
        }, [user, setChatFriend, setShowPrivateChat, setOpenChatId]);

        var closePrivateChat = useCallback(() => {
            window.ChatManager.closePrivateChat({ setShowPrivateChat, setChatFriend, setOpenChatId });
        }, [setShowPrivateChat, setChatFriend, setOpenChatId]);

        var handleSendRequest = useCallback(async (targetUid) => {
            window.ChatManager.handleSendRequest({ user, isLoggedIn, userData, t, createNotification }, targetUid);
        }, [user, isLoggedIn, userData, t, createNotification]);

        var handleAddFriendById = useCallback(async () => {
            window.ChatManager.handleAddFriendById({
                addFriendId, isLoggedIn, user, userData, t, lang, setFriendSearchMsg, setAddFriendId
            });
        }, [addFriendId, isLoggedIn, user, userData, t, lang, setFriendSearchMsg, setAddFriendId]);

        var handleAcceptRequest = useCallback(async (fromUid) => {
            window.ChatManager.handleAcceptRequest({
                user, isLoggedIn, userData, t, lang, createNotification, setNotification, incrementMissionProgress, checkAndUnlockAchievements
            }, fromUid);
        }, [user, isLoggedIn, userData, t, lang, createNotification, setNotification, incrementMissionProgress, checkAndUnlockAchievements]);

        var handleRejectRequest = useCallback(async (fromUid) => {
            window.ChatManager.handleRejectRequest({ user, isLoggedIn }, fromUid);
        }, [user, isLoggedIn]);

        // ── Shop & Inventory Actions ──
        var handlePurchase = useCallback(async (item, targetUser = null, qty = 1) => {
            window.ChatManager.handlePurchase({
                user, isLoggedIn, userData, lang, t, setNotification, setShowLoginAlert, playSound
            }, item, targetUser, qty);
        }, [user, isLoggedIn, userData, lang, t, setNotification, setShowLoginAlert, playSound]);

        var handleBuyVIP = useCallback(async () => {
            window.ChatManager.handleBuyVIP({
                user, isLoggedIn, userData, lang, setNotification, setShowLoginAlert, playSound
            });
        }, [user, isLoggedIn, userData, lang, setNotification, setShowLoginAlert, playSound]);

        var handleEquip = useCallback(async (item) => {
            window.ChatManager.handleEquip({
                user, isLoggedIn, userData, lang, setNotification, playSound, MAX_BADGES: window.MAX_BADGES || 3
            }, item);
        }, [user, isLoggedIn, userData, lang, setNotification, playSound]);

        var handleUnequip = useCallback(async (type, itemId) => {
            window.ChatManager.handleUnequip({
                user, isLoggedIn, userData, lang, setNotification, playSound
            }, type, itemId);
        }, [user, isLoggedIn, userData, lang, setNotification, playSound]);

        var handleSendGiftToUser = useCallback(async (gift, targetUser, qty = 1, fromInventory = false, familyScopeId = null) => {
            window.ChatManager.handleSendGiftToUser({
                user, isLoggedIn, userData, lang, t, setNotification, incrementMissionProgress, checkAndUnlockAchievements, createNotification
            }, gift, targetUser, qty, fromInventory, familyScopeId);
        }, [user, isLoggedIn, userData, lang, t, setNotification, incrementMissionProgress, checkAndUnlockAchievements, createNotification]);

        // ── Couple Actions ──
        var handleSendProposal = useCallback(async ({ toUID, toData, giftId, message }) => {
            if (!user || !isLoggedIn || !proposalRing) return;
            await window.sendProposal({
                fromUID: user.uid,
                toUID,
                fromData: userData,
                ringId: proposalRing.id,
                giftId,
                message,
                onNotification: setNotification,
                lang,
            });
        }, [user, isLoggedIn, userData, proposalRing, lang, setNotification]);

        var handleAcceptProposal = useCallback(async (coupleDoc) => {
            await window.acceptProposal({
                coupleDocId: coupleDoc.id,
                uid1: coupleDoc.uid1,
                uid2: coupleDoc.uid2,
                onNotification: setNotification,
                lang,
            });
            setShowIncomingProposal && setShowIncomingProposal(false);
        }, [lang, setNotification, setShowIncomingProposal]);

        var handleDeclineProposal = useCallback(async (coupleDoc) => {
            var ring = window.RINGS_DATA?.find(r => r.id === coupleDoc.ringId);
            var gift = window.PROPOSAL_GIFTS?.find(g => g.id === coupleDoc.giftId);
            await window.declineProposal({
                coupleDocId: coupleDoc.id,
                fromUID: coupleDoc.uid1,
                toUID: coupleDoc.uid2,
                ringCost: ring?.cost || 0,
                giftCost: gift?.cost || 0,
                onNotification: setNotification,
                lang,
            });
            setShowIncomingProposal && setShowIncomingProposal(false);
        }, [lang, setNotification, setShowIncomingProposal]);

        var handleDivorce = useCallback(async (coupleDoc) => {
            if (!coupleDoc) return;
            await window.divorceCouple({
                coupleDocId: coupleDoc.id,
                uid1: coupleDoc.uid1,
                uid2: coupleDoc.uid2,
                onNotification: setNotification,
                lang,
            });
        }, [lang, setNotification]);

        return {
            handleGoogleLogin, handleLogout,
            createNotification, markNotificationRead, clearAllNotifications, handleNotificationClick,
            unlockAchievement, checkAndUnlockAchievements, incrementMissionProgress,
            handleCreateGame, handleJoinGame, handleLeaveRoom,
            startGame, submitWordVote, handleSkipTurn, nextTurn, requestVoting, agreeToVote, declineVote, triggerVoting, submitVote, resetGame, sendGameMessage,
            submitSpyWordGuess, submitMrWhiteLocationGuess, spyVoluntaryDeclare, addBotToRoom, removeBotFromRoom,
            openProfile, openPrivateChat, closePrivateChat, handleSendRequest, handleAddFriendById, handleAcceptRequest, handleRejectRequest,
            handlePurchase, handleBuyVIP, handleEquip, handleUnequip, handleSendGiftToUser,
            handleSendProposal, handleAcceptProposal, handleDeclineProposal, handleDivorce
        };
    };
})();
