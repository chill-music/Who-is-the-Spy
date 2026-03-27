(function () {
    var { useState, useEffect, useRef, useMemo, useCallback } = React;
    var {
        useAuthState, usePresence, useNotifications, useRoom,
        useLeaderboards, useSocial, useGameAutomation, useBots,
        OWNER_UID, TRANSLATIONS, ACHIEVEMENTS, firebase,
        usersCollection, familiesCollection, botChatsCollection, bffCollection, couplesCollection,
        RINGS_DATA, PROPOSAL_GIFTS, TS, getCurrentCycleMonth
    } = window;

    window.useAppState = function () {
        // ── Global States ──
        var [lang, setLang] = useState(localStorage.getItem('pro_spy_lang') || 'ar');
        var [room, setRoom] = useState(null);
        var [roomId, setRoomId] = useState('');
        var [inputCode, setInputCode] = useState('');
        var [nickname, setNickname] = useState(() => localStorage.getItem('pro_spy_nick') || '');
        var [loading, setLoading] = useState(false);
        var [turnTimer, setTurnTimer] = useState(30);
        var [votingTimer, setVotingTimer] = useState(30);
        var [wordSelTimer, setWordSelTimer] = useState(30);
        var [showSetupModal, setShowSetupModal] = useState(false);
        var [setupMode, setSetupMode] = useState('normal');
        var [isPrivate, setIsPrivate] = useState(false);
        var [password, setPassword] = useState('');
        var [showPassword, setShowPassword] = useState(false);
        var [activeView, setActiveView] = useState('lobby');
        var [showDropdown, setShowDropdown] = useState(false);
        var [joinError, setJoinError] = useState('');
        var [alertMessage, setAlertMessage] = useState(null);
        var [leaderboardData, setLeaderboardData] = useState([]);
        var [charismaLeaderboard, setCharismaLeaderboard] = useState([]);
        var [familyLeaderboard, setFamilyLeaderboard] = useState([]);
        var [leaderboardTab, setLeaderboardTab] = useState('wins');
        var [friendsData, setFriendsData] = useState([]);
        var [addFriendId, setAddFriendId] = useState('');
        var [friendSearchMsg, setFriendSearchMsg] = useState('');
        var [friendRequests, setFriendRequests] = useState([]);
        var [showMyAccount, setShowMyAccount] = useState(false);
        var [showUserProfile, setShowUserProfile] = useState(false);
        var [targetProfileUID, setTargetProfileUID] = useState(null);
        var [chatsMeta, setChatsMeta] = useState({});
        var [totalUnread, setTotalUnread] = useState(0);
        var [openChatId, setOpenChatId] = useState(null);
        var [showBrowseRooms, setShowBrowseRooms] = useState(false);
        var [copied, setCopied] = useState(false);
        var [notification, setNotification] = useState(null);
        var [showTutorial, setShowTutorial] = useState(false);
        var [showSummary, setShowSummary] = useState(false);
        var [showShop, setShowShop] = useState(false);
        var [showInventory, setShowInventory] = useState(false);
        var [showPrivateChat, setShowPrivateChat] = useState(false);
        var [showSelfChat, setShowSelfChat] = useState(false);
        var [showFunPass, setShowFunPass] = useState(false);
        var [chatFriend, setChatFriend] = useState(null);
        var [showLoginAlert, setShowLoginAlert] = useState(false);
        var [guestData, setGuestData] = useState(null);
        var [showLoginRewards, setShowLoginRewards] = useState(false);
        var [sessionClaimedToday, setSessionClaimedToday] = useState(false);
        var [showOnboarding, setShowOnboarding] = useState(false);
        var [onboardingGoogleUser, setOnboardingGoogleUser] = useState(null);
        var [pendingNewUserRef, setPendingNewUserRef] = useState(null);
        var [showLobbyPassword, setShowLobbyPassword] = useState(false);
        var [showNotifications, setShowNotifications] = useState(false);
        var [notifications, setNotifications] = useState([]);
        var [unreadNotifications, setUnreadNotifications] = useState(0);
        var notificationBellRef = useRef(null);
        var historyWrittenRooms = useRef(new Set());
        var lastAchievementCheck = useRef(0);
        var [showSettings, setShowSettings] = useState(false);
        var [soundMuted, setSoundMuted] = useState(() => localStorage.getItem('pro_spy_sound_muted') === 'true');
        var [showAdminPanel, setShowAdminPanel] = useState(false);
        var [showFriendsMoments, setShowFriendsMoments] = useState(false);
        var [showFamilyModal, setShowFamilyModal] = useState(false);
        var [viewFamilyId, setViewFamilyId] = useState(null);
        var [userFamily, setUserFamily] = useState(null);
        var [showFamilyChat, setShowFamilyChat] = useState(false);
        var [hasNewMoments, setHasNewMoments] = useState(false);

        var [coupleData, setCoupleData] = useState(null);
        var [partnerData, setPartnerData] = useState(null);
        var [showCoupleCard, setShowCoupleCard] = useState(false);
        var [showProposalModal, setShowProposalModal] = useState(false);
        var [proposalRing, setProposalRing] = useState(null);
        var [incomingProposal, setIncomingProposal] = useState(null);
        var [incomingProposalFrom, setIncomingProposalFrom] = useState(null);
        var [showIncomingProposal, setShowIncomingProposal] = useState(false);
        var [showWeddingHall, setShowWeddingHall] = useState(false);

        var [showBFFModal, setShowBFFModal] = useState(false);
        var [bffInitialTab, setBffInitialTab] = useState('relationships');
        var [bffUnreadCount, setBffUnreadCount] = useState(0);

        var [showDetectiveBot, setShowDetectiveBot] = useState(false);
        var [showLoveBot, setShowLoveBot] = useState(false);
        var [detectiveBotUnread, setDetectiveBotUnread] = useState(0);
        var [loveBotUnread, setLoveBotUnread] = useState(0);

        var [showVIPCenter, setShowVIPCenter] = useState(false);
        var [showHelpCenter, setShowHelpCenter] = useState(false);
        var [showPublicChat, setShowPublicChat] = useState(false);
        var [showPWAInstall, setShowPWAInstall] = useState(false);

        var [showGuestMenu, setShowGuestMenu] = useState(false);
        var [activeRooms, setActiveRooms] = useState([]);
        var [gameChatInput, setGameChatInput] = useState('');
        var [showGameChat, setShowGameChat] = useState(true);
        var gameChatRef = useRef(null);

        // ── Auth & Logic Hooks ──
        var { user, userData, authLoading, isLoggedIn, setUser, setUserData, setAuthLoading } = useAuthState({
            setLang,
            setNickname,
            setOnboardingGoogleUser,
            setPendingNewUserRef,
            setShowOnboarding
        });

        // ── Logic Variables & Helpers ──
        var t = TRANSLATIONS[lang];
        var isGuest = useMemo(() => guestData !== null, [guestData]);
        var currentUID = useMemo(() => { if (user && !user.isAnonymous) return user.uid; if (guestData) return guestData.uid; return null; }, [user, guestData]);
        var isNotLoggedIn = useMemo(() => user === null && guestData === null, [user, guestData]);
        var currentUserData = useMemo(() => { if (isLoggedIn) return userData; if (isGuest) return guestData; return null; }, [isLoggedIn, userData, isGuest, guestData]);

        // Logic functions required by hooks
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
                    updates['missionProgress.daily.gamesPlayed'] = 0;
                    updates['missionProgress.daily.gamesWon'] = 0;
                    updates['missionProgress.daily.spyGames'] = 0;
                    updates['missionProgress.daily.giftsSent'] = 0;
                    updates['missionProgress.daily.friendsAdded'] = 0;
                    updates['missionProgress.daily.momentsPosted'] = 0;
                    updates['missionProgress.daily.commentsPosted'] = 0;
                    updates[`missionProgress.daily.${key}`] = amount;
                } else {
                    updates[`missionProgress.daily.${key}`] = firebase.firestore.FieldValue.increment(amount);
                }
                if (weeklyProgress.resetWeek !== weekStr) {
                    updates['missionProgress.weekly.resetWeek'] = weekStr;
                    updates['missionProgress.weekly.gamesPlayed'] = 0;
                    updates['missionProgress.weekly.gamesWon'] = 0;
                    updates['missionProgress.weekly.giftsSent'] = 0;
                    updates['missionProgress.weekly.momentsPosted'] = 0;
                    updates['missionProgress.weekly.friendsAdded'] = 0;
                    updates[`missionProgress.weekly.${key}`] = amount;
                } else {
                    updates[`missionProgress.weekly.${key}`] = firebase.firestore.FieldValue.increment(amount);
                }
                await usersCollection.doc(user.uid).update(updates);
            } catch (error) { console.error('Mission increment error:', error); }
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
                if (getValue(ach.condition.type) >= ach.condition.value) toUnlock.push(ach.id);
            }

            if (toUnlock.length > 0) {
                try {
                    await usersCollection.doc(user.uid).update({
                        achievements: firebase.firestore.FieldValue.arrayUnion(...toUnlock)
                    });
                } catch (e) { console.error('Batch achievement error:', e); }
            }
        }, [isLoggedIn, user, userData]);

        // ── Active Rooms Listener ──
        useEffect(() => {
            if (!isLoggedIn && !isGuest) return;
            var unsub = roomsCollection.where('status', '==', 'waiting').limit(20).onSnapshot(snap => {
                var list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setActiveRooms(list);
            });
            return () => unsub();
        }, [isLoggedIn, isGuest]);

        // ── Room Functions ──
        var handleCreateGame = useCallback(async () => {
            if (!nickname.trim()) return;
            if (isPrivate && !password.trim()) { setAlertMessage(t.privateRoomError); return; }
            setLoading(true);
            var uid = currentUID;
            var tempUserData = currentUserData;
            if (!uid) { setLoading(false); setNotification(lang === 'ar' ? 'حدث خطأ' : 'Error'); return; }
            var id = Math.random().toString(36).substring(2, 7).toUpperCase();
            await roomsCollection.doc(id).set({
                id, admin: uid, status: 'waiting',
                players: [{
                    uid: uid, name: nickname, status: 'active',
                    photo: tempUserData?.photoURL || tempUserData?.photo || `https://ui-avatars.com/api/?name=${nickname}&background=random`,
                    role: null, equipped: tempUserData?.equipped || {}, vip: tempUserData?.vip || {}
                }],
                scenario: null, spyId: null, currentTurnUID: null, turnEndTime: null, votingEndTime: null,
                currentRound: 0, messages: [], votes: {}, usedLocations: [], wordVotes: {},
                chosenWord: null, wordSelEndTime: null, votingRequest: null, mode: setupMode,
                isPrivate: isPrivate, password: isPrivate ? password : null, startedAt: null,
                summaryShown: false
            });
            setRoomId(id); setLoading(false); setShowSetupModal(false); setActiveView('lobby');
            if (navigator.clipboard) { navigator.clipboard.writeText(id); setCopied(true); setTimeout(() => setCopied(false), 2000); }
        }, [nickname, isPrivate, password, currentUID, currentUserData, setupMode, t, lang]);

        var handleJoinGame = useCallback(async (id, pwd) => {
            if (!id || id.trim() === "") { setJoinError(t.enterCodeError); return; }
            if (!nickname.trim()) return;
            setLoading(true); setJoinError('');
            var uid = currentUID;
            var tempUserData = currentUserData;
            if (!uid) { setLoading(false); setNotification(lang === 'ar' ? 'حدث خطأ' : 'Error'); return; }
            var ref = roomsCollection.doc(id.toUpperCase());
            var snap = await ref.get();
            if (snap.exists) {
                var data = snap.data();
                if (data.isPrivate && data.password !== pwd) { setJoinError(lang === 'ar' ? 'كلمة السر غير صحيحة' : "Incorrect Password"); setLoading(false); return; }
                var exists = data.players.find(p => p.uid === uid);
                if (!exists) {
                    await ref.update({
                        players: [...data.players, {
                            uid: uid, name: nickname, status: 'active',
                            photo: tempUserData?.photoURL || tempUserData?.photo || `https://ui-avatars.com/api/?name=${nickname}&background=random`,
                            role: null, equipped: tempUserData?.equipped || {}, vip: tempUserData?.vip || {}
                        }]
                    });
                }
                setRoomId(id.toUpperCase()); setActiveView('lobby'); setShowBrowseRooms(false);
            } else { setJoinError(lang === 'ar' ? 'الغرفة غير موجودة' : "Room not found"); }
            setLoading(false);
        }, [nickname, currentUID, currentUserData, t, lang]);

        var handleLeaveRoom = useCallback(async () => {
            if (!room || !currentUID) return;
            var isAdmin = room.admin === currentUID;
            if (isAdmin) { await roomsCollection.doc(roomId).delete(); }
            else { await roomsCollection.doc(roomId).update({ players: room.players.filter(p => p.uid !== currentUID) }); }
            setRoom(null); setRoomId(''); setShowSummary(false);
        }, [room, currentUID, roomId]);

        // ── Game Logic Functions ──
        var startGame = useCallback(async () => {
            if (!room || room.admin !== currentUID) return;
            var activePlayers = room.players.filter(p => p.status === 'active');
            var playerCount = activePlayers.length;
            if (playerCount < 3) { setNotification(t.needPlayers); return; }
            var SCENARIOS = window.SCENARIOS || [];
            var used = room.usedLocations || [];
            var avail = SCENARIOS.filter(s => !used.includes(s.loc_en));
            var scenario = (avail.length > 0 ? avail : SCENARIOS)[Math.floor(Math.random() * (avail.length || SCENARIOS.length))];
            var spy = activePlayers[Math.floor(Math.random() * activePlayers.length)];
            var roles = {};
            activePlayers.forEach(p => roles[p.uid] = p.uid === spy.uid ? 'spy' : 'agent');
            var potentialStarters = activePlayers.filter(p => roles[p.uid] !== 'spy');
            if (potentialStarters.length === 0) potentialStarters = activePlayers;
            var firstPlayer = potentialStarters[Math.floor(Math.random() * potentialStarters.length)];
            await roomsCollection.doc(roomId).update({
                status: 'word_selection', scenario, spyId: spy.uid,
                currentTurnUID: firstPlayer.uid, turnEndTime: null, currentRound: 1,
                players: room.players.map(p => ({ ...p, role: roles[p.uid] || 'agent' })),
                usedLocations: firebase.firestore.FieldValue.arrayUnion(scenario.loc_en),
                messages: [], votes: {}, wordVotes: {}, chosenWord: null,
                wordSelEndTime: Date.now() + 45000, votingRequest: null, startedAt: TS()
            });
        }, [room, currentUID, roomId, t]);

        var resetGame = useCallback(async () => {
            if (!room) return;
            await roomsCollection.doc(roomId).update({
                status: 'waiting', scenario: null, spyId: null, mrwhiteId: null, informantId: null,
                currentTurnUID: null, currentRound: 0, votes: {}, messages: [], votingEndTime: null,
                turnEndTime: null, ejectedUID: null,
                players: room.players.map(p => ({ uid: p.uid, name: p.name, status: 'active', photo: p.photo, role: null, equipped: p.equipped || {}, vip: p.vip || {} })),
                wordVotes: {}, chosenWord: null, wordSelEndTime: null, votingRequest: null,
                startedAt: null, finishedAt: null, summaryShown: false
            });
            setShowSummary(false);
        }, [room, roomId]);

        var submitVote = useCallback(async (targetUID) => {
            if (!targetUID || !currentUID || !room || (room.votes && room.votes[currentUID])) return;
            var voteUpdate = {};
            voteUpdate[`votes.${currentUID}`] = targetUID;
            await roomsCollection.doc(roomId).update(voteUpdate);
        }, [room, currentUID, roomId]);

        var submitWordVote = useCallback(async (word) => {
            if (!currentUID || !room || room.status !== 'word_selection') return;
            var myPlayer = room.players.find(p => p.uid === currentUID);
            if (myPlayer?.role === 'spy') return;
            var voteUpdate = {};
            voteUpdate[`wordVotes.${currentUID}`] = word;
            await roomsCollection.doc(roomId).update(voteUpdate);
        }, [currentUID, room, roomId]);

        return {
            lang, setLang, room, setRoom, roomId, setRoomId, inputCode, setInputCode,
            nickname, setNickname, loading, setLoading, turnTimer, setTurnTimer,
            votingTimer, setVotingTimer, wordSelTimer, setWordSelTimer,
            showSetupModal, setShowSetupModal, setupMode, setSetupMode,
            isPrivate, setIsPrivate, password, setPassword, showPassword, setShowPassword,
            activeView, setActiveView, showDropdown, setShowDropdown, joinError, setJoinError,
            alertMessage, setAlertMessage, leaderboardData, setLeaderboardData,
            charismaLeaderboard, setCharismaLeaderboard, familyLeaderboard, setFamilyLeaderboard,
            leaderboardTab, setLeaderboardTab, friendsData, setFriendsData,
            addFriendId, setAddFriendId, friendSearchMsg, setFriendSearchMsg,
            friendRequests, setFriendRequests, showMyAccount, setShowMyAccount,
            showUserProfile, setShowUserProfile, targetProfileUID, setTargetProfileUID,
            chatsMeta, setChatsMeta, totalUnread, setTotalUnread, openChatId, setOpenChatId,
            showBrowseRooms, setShowBrowseRooms, copied, setCopied, notification, setNotification,
            showTutorial, setShowTutorial, showSummary, setShowSummary, showShop, setShowShop,
            showInventory, setShowInventory, showPrivateChat, setShowPrivateChat,
            showSelfChat, setShowSelfChat, showFunPass, setShowFunPass, chatFriend, setChatFriend,
            showLoginAlert, setShowLoginAlert, guestData, setGuestData,
            showLoginRewards, setShowLoginRewards, sessionClaimedToday, setSessionClaimedToday,
            showOnboarding, setShowOnboarding, onboardingGoogleUser, setOnboardingGoogleUser,
            pendingNewUserRef, setPendingNewUserRef, showLobbyPassword, setShowLobbyPassword,
            showNotifications, setShowNotifications, notifications, setNotifications,
            unreadNotifications, setUnreadNotifications, notificationBellRef,
            historyWrittenRooms, lastAchievementCheck, showSettings, setShowSettings,
            soundMuted, setSoundMuted, showAdminPanel, setShowAdminPanel,
            showFriendsMoments, setShowFriendsMoments, showFamilyModal, setShowFamilyModal,
            viewFamilyId, setViewFamilyId, userFamily, setUserFamily,
            showFamilyChat, setShowFamilyChat, hasNewMoments, setHasNewMoments,
            coupleData, setCoupleData, partnerData, setPartnerData,
            showCoupleCard, setShowCoupleCard, showProposalModal, setShowProposalModal,
            proposalRing, setProposalRing, incomingProposal, setIncomingProposal,
            incomingProposalFrom, setIncomingProposalFrom, showIncomingProposal, setShowIncomingProposal,
            showWeddingHall, setShowWeddingHall, showBFFModal, setShowBFFModal,
            bffInitialTab, setBffInitialTab, bffUnreadCount, setBffUnreadCount,
            showDetectiveBot, setShowDetectiveBot, showLoveBot, setShowLoveBot,
            detectiveBotUnread, setDetectiveBotUnread, loveBotUnread, setLoveBotUnread,
            showVIPCenter, setShowVIPCenter, showHelpCenter, setShowHelpCenter,
            showPublicChat, setShowPublicChat, showPWAInstall, setShowPWAInstall,
            showGuestMenu, setShowGuestMenu, gameChatInput, setGameChatInput,
            showGameChat, setShowGameChat, gameChatRef,
            user, userData, authLoading, isLoggedIn, setUser, setUserData, setAuthLoading,
            t, isGuest, currentUID, isNotLoggedIn, currentUserData,
            incrementMissionProgress, checkAndUnlockAchievements, activeRooms,
            handleCreateGame, handleJoinGame, handleLeaveRoom, startGame, resetGame,
            submitVote, submitWordVote
        };
    };
})();
