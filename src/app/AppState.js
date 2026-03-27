(function () {
    var { useState, useEffect, useRef, useMemo, useCallback } = React;
    var {
        useAuthState, usePresence, useNotifications, useRoom,
        useLeaderboards, useSocial, useGameAutomation, useBots,
        OWNER_UID, TRANSLATIONS, ACHIEVEMENTS, firebase,
        usersCollection, familiesCollection, botChatsCollection, bffCollection, couplesCollection,
        roomsCollection, guestsCollection, notificationsCollection, chatsCollection,
        giftsLogCollection, guardLogCollection, momentsCollection,
        RINGS_DATA, PROPOSAL_GIFTS, SCENARIOS, LOGIN_REWARDS, VIP_CONFIG,
        TS, getCurrentCycleMonth, getVIPLevel, getVIPLevelFromXP, hasVIP, getGiftVIPXP, formatCharisma,
        playSound, playNotificationSound, playRewardSound,
        sendProposal, acceptProposal, declineProposal,
        isBannedUser, getCurrentCycleMonth, getVIPLevelFromXP,
        FUN_PASS_SEASON_ID, LOGIN_REWARDS_CONFIG, MAX_BADGES
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
        var [profileInitialTab, setProfileInitialTab] = useState('about');
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
            if (playSound) playSound('click');
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
                scenario: null, spyId: null, mrwhiteId: null, informantId: null,
                currentTurnUID: null, turnEndTime: null, votingEndTime: null,
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
            if (playSound) playSound('click');
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
            if (playSound) playSound('click');
            var isAdmin = room.admin === currentUID;
            if (isAdmin) { await roomsCollection.doc(roomId).delete(); }
            else { await roomsCollection.doc(roomId).update({ players: room.players.filter(p => p.uid !== currentUID) }); }
            setRoom(null); setRoomId(''); setShowSummary(false);
        }, [room, currentUID, roomId]);

        // ── Game Logic Functions ──
        var startGame = useCallback(async () => {
            if (!room || room.admin !== currentUID) return;
            if (playSound) playSound('success');
            var activePlayers = room.players.filter(p => p.status === 'active');
            var playerCount = activePlayers.length;
            if (playerCount < 3) { setNotification(t.needPlayers); return; }
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
            if (playSound) playSound('click');
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
            if (playSound) playSound('click');
            var voteUpdate = {};
            voteUpdate[`votes.${currentUID}`] = targetUID;
            await roomsCollection.doc(roomId).update(voteUpdate);
        }, [room, currentUID, roomId]);

        var submitWordVote = useCallback(async (word) => {
            if (!currentUID || !room || room.status !== 'word_selection') return;
            var myPlayer = room.players.find(p => p.uid === currentUID);
            if (myPlayer?.role === 'spy' || myPlayer?.role === 'mrwhite') return;
            if (playSound) playSound('click');
            var voteUpdate = {};
            voteUpdate[`wordVotes.${currentUID}`] = word;
            await roomsCollection.doc(roomId).update(voteUpdate);
        }, [currentUID, room, roomId]);

        var handleSkipTurn = useCallback(async (forced = false) => {
            if (!room) return;
            if (!forced && room.currentTurnUID !== currentUID) return;
            nextTurn();
        }, [room, currentUID]);

        var nextTurn = useCallback(async () => {
            if (!room) return;
            var activePlayers = room.players.filter(p => p.status === 'active');
            var currentIndex = activePlayers.findIndex(p => p.uid === room.currentTurnUID);
            var nextIndex = (currentIndex + 1) % activePlayers.length;
            await roomsCollection.doc(roomId).update({ currentTurnUID: activePlayers[nextIndex].uid, turnEndTime: Date.now() + 30000 });
        }, [room, roomId]);

        var requestVoting = useCallback(async () => {
            if (!room || room.status !== 'discussing') return;
            if (playSound) playSound('click');
            if (room.admin === currentUID) { await triggerVoting(); return; }
            await roomsCollection.doc(roomId).update({ votingRequest: { requestedBy: currentUID, votes: { [currentUID]: true } } });
        }, [room, currentUID, roomId]);

        var agreeToVote = useCallback(async () => {
            if (!room || !room.votingRequest) return;
            if (playSound) playSound('click');
            var currentVotes = room.votingRequest.votes || {};
            var newVotes = { ...currentVotes, [currentUID]: true };
            var activePlayers = room.players.filter(p => p.status === 'active');
            if (currentUID === room.admin) { await triggerVoting(); return; }
            var agreeCount = Object.values(newVotes).filter(v => v === true).length;
            var majorityCount = Math.floor(activePlayers.length / 2) + 1;
            if (agreeCount >= majorityCount) { await triggerVoting(); }
            else { await roomsCollection.doc(roomId).update({ "votingRequest.votes": newVotes }); }
        }, [room, currentUID, roomId]);

        var declineVote = useCallback(async () => {
            if (!room || !room.votingRequest) return;
            if (playSound) playSound('click');
            var currentVotes = room.votingRequest.votes || {};
            var newVotes = { ...currentVotes, [currentUID]: false };
            var declineCount = Object.values(newVotes).filter(v => v === false).length;
            var majorityCount = Math.floor(activePlayers.length / 2) + 1;
            if (declineCount >= majorityCount) { await roomsCollection.doc(roomId).update({ votingRequest: null }); }
            else { await roomsCollection.doc(roomId).update({ "votingRequest.votes": newVotes }); }
        }, [room, currentUID, roomId]);

        var triggerVoting = useCallback(async () => {
            if (playSound) playSound('click');
            var sysMsg = { sender: 'system', name: 'SYSTEM', text: t.votingStarted, time: Date.now() };
            await roomsCollection.doc(roomId).update({
                status: 'voting', currentTurnUID: null, turnEndTime: null,
                votingEndTime: Date.now() + 30000, messages: firebase.firestore.FieldValue.arrayUnion(sysMsg),
                votingRequest: null
            });
        }, [roomId, t]);

        var sendMessage = useCallback(async () => {
            var text = gameChatInput.trim();
            if (!text || !room || !currentUID) return;
            var senderName = room.players.find(p => p.uid === currentUID)?.name || nickname || 'Player';
            var familyWeeklyAct = userFamily?.lastWeekActiveness !== undefined ? userFamily.lastWeekActiveness : (userFamily?.weeklyActiveness || 0);
            var signLevel = userFamily ? (window.FamilyConstants?.getFamilySignLevelData?.(familyWeeklyAct)?.level || 1) : null;
            var msg = {
                sender: currentUID, name: senderName, text, time: Date.now(),
                familyTag: userFamily?.tag || null, familySignLevel: signLevel,
            };
            setGameChatInput('');
            await roomsCollection.doc(roomId).update({ messages: firebase.firestore.FieldValue.arrayUnion(msg) });
        }, [gameChatInput, room, currentUID, roomId, nickname, userFamily]);

        var submitSpyWordGuess = useCallback(async (guessedWord) => {
            if (!room || room.status !== 'spy_guessing') return;
            if (currentUID !== room.ejectedUID && currentUID !== room.spyId) return;
            if (playSound) playSound('click');
            var correct = guessedWord.trim().toLowerCase() === (room.chosenWord || '').trim().toLowerCase();
            var sysMsg = { sender: 'system', name: 'SYSTEM', text: correct ? '🎯 Spy guessed correctly!' : '❌ Wrong guess!', time: Date.now() };
            await roomsCollection.doc(roomId).update({
                status: correct ? 'finished_spy_escaped' : 'finished_spy_caught',
                spyGuessWord: guessedWord, messages: firebase.firestore.FieldValue.arrayUnion(sysMsg)
            });
        }, [room, currentUID, roomId]);

        var submitMrWhiteLocationGuess = useCallback(async (guessedLocation) => {
            if (!room || room.status !== 'mrwhite_guessing') return;
            if (currentUID !== room.ejectedUID && currentUID !== room.mrwhiteId) return;
            if (playSound) playSound('click');
            var locEn = (room.scenario?.loc_en || '').toLowerCase();
            var locAr = (room.scenario?.loc_ar || '').toLowerCase();
            var guess = guessedLocation.trim().toLowerCase();
            var correct = guess === locEn || guess === locAr || locEn.includes(guess) || locAr.includes(guess);
            var sysMsg = { sender: 'system', name: 'SYSTEM', text: correct ? '🎯 Mr. White guessed correctly!' : '❌ Wrong guess!', time: Date.now() };
            await roomsCollection.doc(roomId).update({
                status: correct ? 'finished_mrwhite_wins' : 'finished_spy_caught',
                mrwhiteGuessLocation: guessedLocation, messages: firebase.firestore.FieldValue.arrayUnion(sysMsg)
            });
        }, [room, currentUID, roomId]);

        var spyVoluntaryDeclare = useCallback(async () => {
            if (!room || room.status !== 'discussing') return;
            var myPlayer = room?.players?.find(p => p.uid === currentUID);
            if (myPlayer?.role !== 'spy') return;
            if (playSound) playSound('click');
            var sysMsg = { sender: 'system', name: 'SYSTEM', text: '🕵️ Spy revealed themselves!', time: Date.now() };
            await roomsCollection.doc(roomId).update({
                status: 'spy_guessing', ejectedUID: currentUID,
                messages: firebase.firestore.FieldValue.arrayUnion(sysMsg),
                votingEndTime: null, turnEndTime: null
            });
        }, [room, currentUID, roomId]);

        var addBotToRoom = useCallback(async () => {
            if (!room || currentUID !== OWNER_UID) return;
            var bots = room.players.filter(p => p.isBot);
            if (bots.length >= 5) { setNotification(lang === 'ar' ? 'الحد الأقصى 5 بوتات!' : 'Max 5 bots allowed!'); return; }
            if (room.players.length >= 10) { setNotification(lang === 'ar' ? 'الغرفة ممتلئة!' : 'Room is full!'); return; }
            var BOT_NAMES = ['Shadow', 'Ghost', 'Cipher', 'Viper', 'Nova', 'Hex', 'Raven', 'Storm', 'Blaze', 'Frost', 'Echo', 'Spectre'];
            var botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)] + '_' + Math.floor(Math.random() * 99);
            var botUID = 'bot_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            var newBot = { uid: botUID, name: botName, status: 'active', photo: null, role: null, equipped: {}, vip: {}, isBot: true, botUID };
            await roomsCollection.doc(roomId).update({ players: firebase.firestore.FieldValue.arrayUnion(newBot) });
            if (playSound) playSound('success');
        }, [room, currentUID, roomId, lang, OWNER_UID]);

        var removeBotFromRoom = useCallback(async (botUID) => {
            if (!room || currentUID !== OWNER_UID) return;
            await roomsCollection.doc(roomId).update({ players: room.players.filter(p => p.uid !== botUID) });
            if (playSound) playSound('click');
        }, [room, currentUID, roomId, OWNER_UID]);

        // ── Social & Profile Functions ──
        var openProfile = useCallback((uid, tab = 'about') => {
            if (!uid) return;
            setTargetProfileUID(uid);
            setProfileInitialTab(tab);
            setShowUserProfile(true);
        }, []);

        var openPrivateChat = useCallback((friend) => {
            setChatFriend(friend);
            setShowPrivateChat(true);
            if (user) {
                var cId = [user.uid, friend.uid].sort().join('_');
                setOpenChatId(cId);
                chatsCollection.doc(cId).update({ [`unread.${user.uid}`]: 0 }).catch(() => { });
            }
        }, [user]);

        var closePrivateChat = useCallback(() => {
            setShowPrivateChat(false);
            setChatFriend(null);
            setOpenChatId(null);
        }, []);

        var handleSendRequest = useCallback(async (targetUid) => {
            if (!targetUid || !isLoggedIn) return;
            if (userData.friends?.includes(targetUid)) return;
            if (userData.friendRequests?.includes(targetUid)) return;
            await usersCollection.doc(targetUid).update({ friendRequests: firebase.firestore.FieldValue.arrayUnion(user.uid) });
            await createNotification(targetUid, 'friend_request', `${userData.displayName} ${t.friendRequest}`, user.uid, userData.displayName);
        }, [userData, user, isLoggedIn, t]);

        var handleAddFriendById = useCallback(async () => {
            if (!addFriendId.trim() || !isLoggedIn) return;
            setFriendSearchMsg('');
            try {
                var userQuery = await usersCollection.where('customId', '==', addFriendId.trim()).get();
                if (userQuery.empty) { setFriendSearchMsg(t.friendNotFound); return; }
                var targetUid = userQuery.docs[0].id;
                if (targetUid === user.uid) { setFriendSearchMsg(lang === 'ar' ? 'لا يمكنك إضافة نفسك' : 'Cannot add yourself'); return; }
                if (userData.friends?.includes(targetUid)) { setFriendSearchMsg(lang === 'ar' ? 'صديق بالفعل' : 'Already a friend'); return; }
                if (userData.friendRequests?.includes(targetUid)) { setFriendSearchMsg(lang === 'ar' ? 'لديك طلب من هذا المستخدم' : 'You have a request from this user'); return; }
                await handleSendRequest(targetUid);
                setFriendSearchMsg(t.requestSent);
                setAddFriendId('');
            } catch (e) { console.error('addFriend error:', e); setFriendSearchMsg(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
        }, [addFriendId, isLoggedIn, userData, user, t, lang, handleSendRequest]);

        var handleAcceptRequest = useCallback(async (fromUid) => {
            if (!user || !isLoggedIn) return;
            await usersCollection.doc(user.uid).update({ friends: firebase.firestore.FieldValue.arrayUnion(fromUid), friendRequests: firebase.firestore.FieldValue.arrayRemove(fromUid) });
            await usersCollection.doc(fromUid).update({ friends: firebase.firestore.FieldValue.arrayUnion(user.uid) });
            await createNotification(fromUid, 'friend_request_accepted', `${userData.displayName} ${lang === 'ar' ? 'قبل طلب صداقتك!' : 'accepted your friend request!'}`, user.uid, userData.displayName);
            setNotification(t.friendAdded);
            await incrementMissionProgress('friendsAdded', 1);
            var updDoc = await usersCollection.doc(user.uid).get();
            if (updDoc.exists) await checkAndUnlockAchievements(updDoc.data());
        }, [user, isLoggedIn, t, userData, lang, incrementMissionProgress, checkAndUnlockAchievements]);

        var handleRejectRequest = useCallback(async (fromUid) => {
            if (!user || !isLoggedIn) return;
            await usersCollection.doc(user.uid).update({ friendRequests: firebase.firestore.FieldValue.arrayRemove(fromUid) });
        }, [user, isLoggedIn]);

        // ── Notification Functions ──
        var createNotification = useCallback(async (toUserId, type, message, fromUserId, fromName, giftData = null) => {
            try { await notificationsCollection.add({ toUserId, fromUserId, fromName, type, message, giftData, timestamp: TS(), read: false }); } catch (e) { }
        }, []);

        var markNotificationRead = useCallback(async (notifId) => {
            try { await notificationsCollection.doc(notifId).update({ read: true }); } catch (e) { }
        }, []);

        var clearAllNotifications = useCallback(async () => {
            try {
                var batch = firebase.firestore().batch();
                notifications.forEach(n => { batch.delete(notificationsCollection.doc(n.id)); });
                await batch.commit(); setNotifications([]); setUnreadNotifications(0);
            } catch (e) { }
        }, [notifications]);

        var handleNotificationClick = useCallback((notif) => {
            if (notif.type === 'friend_request') { setActiveView('friends'); }
            else if (notif.type === 'gift') { setNotification(notif.message); }
            else if (notif.type === 'couple_proposal') { setActiveView('discover'); }
            else if (notif.type === 'couple_accepted') { setShowCoupleCard(true); }
            else if (notif.type === 'message') {
                if (notif.fromUserId && notif.fromName) {
                    var friend = { uid: notif.fromUserId, displayName: notif.fromName, photoURL: notif.fromPhoto };
                    setChatFriend(friend); setShowPrivateChat(true);
                }
            }
        }, []);

        // ── Proposal Functions ──
        var handleSendProposal = useCallback(async ({ toUID, toData, giftId, message }) => {
            if (!user || !isLoggedIn || !proposalRing) return;
            await sendProposal({
                fromUID: user.uid, toUID, fromData: userData,
                ringId: proposalRing.id, giftId, message,
                onNotification: setNotification, lang,
            });
        }, [user, isLoggedIn, userData, proposalRing, lang]);

        var handleAcceptProposal = useCallback(async (coupleDoc) => {
            await acceptProposal({
                coupleDocId: coupleDoc.id, uid1: coupleDoc.uid1, uid2: coupleDoc.uid2,
                onNotification: setNotification, lang,
            });
            setShowIncomingProposal(false);
        }, [lang]);

        var handleDeclineProposal = useCallback(async (coupleDoc) => {
            var ring = RINGS_DATA.find(r => r.id === coupleDoc.ringId);
            var gift = PROPOSAL_GIFTS.find(g => g.id === coupleDoc.giftId);
            await declineProposal({
                coupleDocId: coupleDoc.id, fromUID: coupleDoc.uid1, toUID: coupleDoc.uid2,
                ringCost: ring?.cost || 0, giftCost: gift?.cost || 0,
                onNotification: setNotification, lang,
            });
            setShowIncomingProposal(false);
        }, [lang]);

        // ── Shop & Inventory Functions ──
        var handlePurchase = useCallback(async (item, targetUser = null, qty = 1) => {
            if (!user || !isLoggedIn) { setShowLoginAlert(true); return; }
            var currency = userData?.currency || 0;
            if (currency < item.cost) { setNotification(t.purchaseFail); return; }
            var inventory = userData?.inventory || { frames: [], titles: [], themes: [], badges: [], gifts: [] };

            if (item.vipMinLevel && item.vipMinLevel > 0) {
                var userVipLevel = getVIPLevel ? getVIPLevel(userData) : 0;
                if (userVipLevel < item.vipMinLevel) {
                    setNotification(lang === 'ar' ? `🔒 يتطلب VIP ${item.vipMinLevel} على الأقل` : `🔒 Requires VIP ${item.vipMinLevel}+`);
                    return;
                }
            }

            if (item.type === 'gifts' || item.type === 'gifts_vip') {
                if (targetUser && targetUser.uid !== 'self' && targetUser.uid !== user?.uid) {
                    await handleSendGiftToUser(item, targetUser, qty || 1);
                    return;
                }
                var giftCounts = userData?.inventory?.giftCounts || {};
                var currentCount = giftCounts[item.id] || 0;
                try {
                    var updateData = {
                        currency: firebase.firestore.FieldValue.increment(-item.cost),
                        'inventory.gifts': firebase.firestore.FieldValue.arrayUnion(item.id),
                        [`inventory.giftCounts.${item.id}`]: currentCount + 1,
                    };
                    if (item.durationDays && item.durationDays > 0) {
                        var expiresAt = Date.now() + item.durationDays * 86400000;
                        var existingExpiry = userData?.inventory?.expiry?.[item.id];
                        if (!existingExpiry || existingExpiry < Date.now()) updateData[`inventory.expiry.${item.id}`] = expiresAt;
                    }
                    await usersCollection.doc(user.uid).update(updateData);
                    if (playSound) playSound('success');
                    var giftName = lang === 'ar' ? item.name_ar : item.name_en;
                    setNotification(`🎁 ${giftName} ${lang === 'ar' ? 'أُضيفت للمخزون!' : 'added to inventory!'}`);
                } catch (e) { setNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
                return;
            }

            if (inventory[item.type]?.includes(item.id)) {
                if (item.durationDays && item.durationDays > 0) {
                    try {
                        var existingExpiry = userData?.inventory?.expiry?.[item.id];
                        var baseTime = existingExpiry && existingExpiry > Date.now() ? existingExpiry : Date.now();
                        var newExpiry = baseTime + item.durationDays * 86400000;
                        await usersCollection.doc(user.uid).update({
                            currency: firebase.firestore.FieldValue.increment(-item.cost),
                            [`inventory.expiry.${item.id}`]: newExpiry,
                        });
                        if (playSound) playSound('success');
                        setNotification(`✅ ${lang === 'ar' ? item.name_ar : item.name_en} (⏳ +${item.durationDays} ${lang === 'ar' ? 'يوم' : 'days'})`);
                    } catch (e) { setNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
                    return;
                }
                setNotification(t.alreadyOwned); return;
            }
            try {
                var updateData = { currency: firebase.firestore.FieldValue.increment(-item.cost), [`inventory.${item.type}`]: firebase.firestore.FieldValue.arrayUnion(item.id) };
                if (item.durationDays && item.durationDays > 0) updateData[`inventory.expiry.${item.id}`] = Date.now() + item.durationDays * 86400000;
                await usersCollection.doc(user.uid).update(updateData);
                if (playSound) playSound('success');
                setNotification(`${t.purchaseSuccess} ${lang === 'ar' ? item.name_ar : item.name_en}`);
            } catch (error) { setNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
        }, [user, userData, isLoggedIn, t, lang, handleSendGiftToUser]);

        var handleBuyVIP = useCallback(async () => {
            if (!user || !isLoggedIn) { setShowLoginAlert(true); return; }
            var VIP_SHOP_COST = 50000;
            var VIP_SHOP_XP = 5000;
            if ((userData?.currency || 0) < VIP_SHOP_COST) { setNotification(lang === 'ar' ? `❌ تحتاج ${VIP_SHOP_COST.toLocaleString()} 🧠` : `❌ Need ${VIP_SHOP_COST.toLocaleString()} 🧠`); return; }
            try {
                var isFirstPurchase = !userData?.vip?.xp || userData.vip.xp === 0;
                var now = new Date();
                var currentExpiry = userData?.vip?.expiresAt?.toDate ? userData.vip.expiresAt.toDate() : null;
                var baseDate = (userData?.vip?.isActive && currentExpiry && currentExpiry > now) ? new Date(currentExpiry.getTime()) : new Date(now.getTime());
                baseDate.setDate(baseDate.getDate() + 30);
                var updates = { currency: firebase.firestore.FieldValue.increment(-VIP_SHOP_COST), 'vip.isActive': true, 'vip.expiresAt': firebase.firestore.Timestamp.fromDate(baseDate), 'vip.purchasedAt': TS() };
                if (isFirstPurchase) {
                    updates['vip.xp'] = firebase.firestore.FieldValue.increment(VIP_SHOP_XP);
                    var newLevel = getVIPLevelFromXP(VIP_SHOP_XP);
                    var levelCfg = VIP_CONFIG.find(v => v.level === newLevel);
                    (levelCfg?.vipItems || []).forEach(item => { if (item.type === 'frames' || item.type === 'badges' || item.type === 'titles') updates[`inventory.${item.type}`] = firebase.firestore.FieldValue.arrayUnion(item.id); });
                }
                await usersCollection.doc(user.uid).update(updates);
                if (playSound) playSound('success');
                setNotification(lang === 'ar' ? '👑 تم شراء VIP!' : '👑 VIP Purchased!');
            } catch (e) { setNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
        }, [user, userData, isLoggedIn, lang]);

        var handleEquip = useCallback(async (item) => {
            if (!user || !isLoggedIn) return;
            try {
                var equipped = userData?.equipped || { badges: [] };
                if (item.type === 'badges') {
                    var currentBadges = Array.isArray(equipped.badges) ? [...equipped.badges] : [];
                    if (currentBadges.length >= MAX_BADGES) { setNotification(lang === 'ar' ? `الحد الأقصى ${MAX_BADGES} شارات` : `Maximum ${MAX_BADGES} badges`); return; }
                    if (!currentBadges.includes(item.id)) currentBadges.push(item.id);
                    await usersCollection.doc(user.uid).update({ 'equipped.badges': currentBadges });
                } else { await usersCollection.doc(user.uid).update({ [`equipped.${item.type}`]: item.id }); }
                if (playSound) playSound('click');
                setNotification(lang === 'ar' ? 'تم التزيين!' : 'Equipped!');
            } catch (error) { }
        }, [user, userData, isLoggedIn, lang]);

        var handleUnequip = useCallback(async (type, itemId) => {
            if (!user || !isLoggedIn) return;
            try {
                if (type === 'badges') {
                    var currentBadges = (userData?.equipped?.badges || []).filter(id => id !== itemId);
                    await usersCollection.doc(user.uid).update({ 'equipped.badges': currentBadges });
                } else { await usersCollection.doc(user.uid).update({ [`equipped.${type}`]: firebase.firestore.FieldValue.delete() }); }
                if (playSound) playSound('click');
                setNotification(lang === 'ar' ? 'تمت الإزالة!' : 'Unequipped!');
            } catch (error) { }
        }, [user, userData, isLoggedIn, lang]);

        var handleClaimLoginReward = useCallback(async (day) => {
            if (!user || !isLoggedIn) return;
            try {
                var freshDoc = await usersCollection.doc(user.uid).get();
                var freshLoginData = freshDoc.data()?.loginRewards || {};
                var freshDay = freshLoginData.currentDay || 0;
                var expectedNextDay = freshDay + 1;
                if (day !== expectedNextDay) day = expectedNextDay;
                var reward = LOGIN_REWARDS[day - 1];
                if (!reward) return;
                var updates = { 'loginRewards.currentDay': day, 'loginRewards.lastClaimDate': TS(), 'loginRewards.streak': firebase.firestore.FieldValue.increment(1), 'loginRewards.totalClaims': firebase.firestore.FieldValue.increment(1) };
                if (reward.type === 'currency') updates.currency = firebase.firestore.FieldValue.increment(reward.amount);
                else updates[`inventory.${reward.type}s`] = firebase.firestore.FieldValue.arrayUnion(reward.itemId);
                await usersCollection.doc(user.uid).update(updates);
                if (playRewardSound) playRewardSound();
                setShowLoginRewards(false); setSessionClaimedToday(true);
                setNotification(lang === 'ar' ? 'تم الاستلام!' : 'Claimed!');
            } catch (error) { setNotification(lang === 'ar' ? 'حدث خطأ!' : 'An error occurred!'); }
        }, [user, isLoggedIn, lang]);

        var handleSendGiftToUser = useCallback(async (gift, targetUser, qty = 1, fromInventory = false, familyScopeId = null) => {
            if (!user || !isLoggedIn) return;
            var totalCost = fromInventory ? 0 : gift.cost * qty;
            if (!fromInventory && (userData?.currency || 0) < totalCost) { setNotification(lang === 'ar' ? '❌ رصيدك غير كافي' : '❌ Insufficient balance'); return; }
            if (fromInventory) {
                var currentCount = userData?.inventory?.giftCounts?.[gift.id] || 0;
                if (currentCount <= 0) { setNotification(lang === 'ar' ? '❌ ليس لديك هذه الهدية' : '❌ Gift not in inventory'); return; }
                var invUpdates = { [`inventory.giftCounts.${gift.id}`]: currentCount - 1 };
                if (currentCount <= 1) invUpdates['inventory.gifts'] = firebase.firestore.FieldValue.arrayRemove(gift.id);
                await usersCollection.doc(user.uid).update(invUpdates);
            }
            var isSelf = !targetUser || targetUser.uid === 'self' || targetUser.uid === user.uid;
            var totalCharisma = (gift.charisma || 0) * qty;
            var totalBonus = Math.floor(totalCost * 0.1); // Simple 10% bonus
            try {
                await usersCollection.doc(user.uid).update({ currency: firebase.firestore.FieldValue.increment(-totalCost), giftsSent: firebase.firestore.FieldValue.increment(qty) });
                var targetId = isSelf ? user.uid : targetUser.uid;
                await usersCollection.doc(targetId).update({ charisma: firebase.firestore.FieldValue.increment(totalCharisma), currency: firebase.firestore.FieldValue.increment(totalBonus), giftsReceived: firebase.firestore.FieldValue.increment(qty) });
                await createNotification(targetId, 'gift', `${userData.displayName} sent a gift!`, user.uid, userData.displayName);
                setNotification(lang === 'ar' ? 'تم الإرسال!' : 'Gift Sent!');
            } catch (e) { console.error('Gift error:', e); }
        }, [user, userData, isLoggedIn, lang, createNotification]);

        var handleLogout = useCallback(async () => {
            if (firebase.auth) await firebase.auth().signOut();
            setShowDropdown(false); setNickname(''); setGuestData(null);
            localStorage.removeItem('pro_spy_guest_uid'); localStorage.removeItem('pro_spy_nick');
        }, []);

        var handleGoogleLogin = useCallback(async () => {
            if (!firebase.auth) return;
            var provider = new firebase.auth.GoogleAuthProvider();
            try { await firebase.auth().signInWithPopup(provider); setShowDropdown(false); } catch (e) { }
        }, []);

        var handleOnboardingComplete = useCallback(async ({ displayName, gender, country, photoURL }) => {
            if (!onboardingGoogleUser || !pendingNewUserRef) return;
            var u = onboardingGoogleUser;
            var newUserData = {
                uid: u.uid, email: u.email || null, displayName, photoURL: photoURL || u.photoURL, gender, country,
                customId: Math.floor(100000000 + Math.random() * 900000000).toString(),
                stats: { wins: 0, losses: 0, xp: 0 }, achievements: [], friends: [], friendRequests: [],
                createdAt: TS(), lastActive: TS(), currency: 100, inventory: { frames: [], titles: [], themes: [], badges: [], gifts: [] },
                equipped: { badges: [] }, charisma: 0, loginRewards: { currentDay: 0, lastClaimDate: null, streak: 0, totalClaims: 0, cycleMonth: getCurrentCycleMonth() },
            };
            await pendingNewUserRef.set(newUserData);
            setUserData(newUserData); setNickname(displayName); setUser(u); setShowOnboarding(false);
        }, [onboardingGoogleUser, pendingNewUserRef]);

        var handleCopy = useCallback(() => {
            if (navigator.clipboard) { navigator.clipboard.writeText(roomId); setCopied(true); setTimeout(() => setCopied(false), 2000); }
        }, [roomId]);

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
            profileInitialTab, setProfileInitialTab,
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
            submitVote, submitWordVote, handleSkipTurn, nextTurn, requestVoting, agreeToVote, declineVote,
            triggerVoting, sendMessage, submitSpyWordGuess, submitMrWhiteLocationGuess, spyVoluntaryDeclare,
            addBotToRoom, removeBotFromRoom, openProfile, openPrivateChat, closePrivateChat,
            handleSendRequest, handleAddFriendById, handleAcceptRequest, handleRejectRequest,
            createNotification, markNotificationRead, clearAllNotifications, handleNotificationClick,
            handleSendProposal, handleAcceptProposal, handleDeclineProposal,
            handlePurchase, handleBuyVIP, handleEquip, handleUnequip, handleClaimLoginReward,
            handleSendGiftToUser, handleLogout, handleGoogleLogin, handleOnboardingComplete, handleCopy,
            handleSendRequest, handleAcceptRequest, handleRejectRequest, friendsData
        };
    };
})();
