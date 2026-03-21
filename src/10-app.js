function App() {
    const [lang, setLang] = useState(() => localStorage.getItem('pro_spy_lang') || 'en');

    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [room, setRoom] = useState(null);
    const [roomId, setRoomId] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [nickname, setNickname] = useState(() => localStorage.getItem('pro_spy_nick') || '');
    const [loading, setLoading] = useState(false);
    const [turnTimer, setTurnTimer] = useState(30);
    const [votingTimer, setVotingTimer] = useState(30);
    const [wordSelTimer, setWordSelTimer] = useState(30);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [setupMode, setSetupMode] = useState('normal');
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [activeView, setActiveView] = useState('lobby');
    const [showDropdown, setShowDropdown] = useState(false);
    const [joinError, setJoinError] = useState('');
    const [alertMessage, setAlertMessage] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [charismaLeaderboard, setCharismaLeaderboard] = useState([]);
    const [familyLeaderboard, setFamilyLeaderboard] = useState([]);
    const [leaderboardTab, setLeaderboardTab] = useState('wins');
    const [friendsData, setFriendsData] = useState([]);
    const [addFriendId, setAddFriendId] = useState('');
    const [friendSearchMsg, setFriendSearchMsg] = useState('');
    const [friendRequests, setFriendRequests] = useState([]);
    const [showMyAccount, setShowMyAccount] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [targetProfileUID, setTargetProfileUID] = useState(null);
    const [chatsMeta, setChatsMeta] = useState({});
    const [totalUnread, setTotalUnread] = useState(0);
    const [openChatId, setOpenChatId] = useState(null);
    const [showBrowseRooms, setShowBrowseRooms] = useState(false);
    const [copied, setCopied] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [showShop, setShowShop] = useState(false);
    const [showInventory, setShowInventory] = useState(false);
    const [showPrivateChat, setShowPrivateChat] = useState(false);
    const [showSelfChat, setShowSelfChat] = useState(false);
    const [showFunPass, setShowFunPass] = useState(false);
    const [chatFriend, setChatFriend] = useState(null);
    const [showLoginAlert, setShowLoginAlert] = useState(false);
    const [guestData, setGuestData] = useState(null);
    const [showLoginRewards, setShowLoginRewards] = useState(false);
    const [sessionClaimedToday, setSessionClaimedToday] = useState(false); // Track if claimed in this session
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [onboardingGoogleUser, setOnboardingGoogleUser] = useState(null);
    const [pendingNewUserRef, setPendingNewUserRef] = useState(null);
    const [showLobbyPassword, setShowLobbyPassword] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const notificationBellRef = useRef(null);
    // 🛡️ Prevents double-write to game_history when onSnapshot fires multiple times
    const historyWrittenRooms = useRef(new Set());
    const [showSettings, setShowSettings] = useState(false);
    const [soundMuted, setSoundMuted] = useState(() => localStorage.getItem('pro_spy_sound_muted') === 'true');
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [showFriendsMoments, setShowFriendsMoments] = useState(false);
    const [showFamilyModal, setShowFamilyModal] = useState(false);
    const [viewFamilyId, setViewFamilyId] = useState(null); // for viewing external families
    const [userFamily, setUserFamily] = useState(null);
    const [showFamilyChat, setShowFamilyChat] = useState(false);

    // ── 💍 COUPLES SYSTEM STATE ──
    const [coupleData, setCoupleData]                   = useState(null); // my active couple doc
    const [partnerData, setPartnerData]                 = useState(null); // partner's user doc
    const [showCoupleCard, setShowCoupleCard]           = useState(false);
    const [showProposalModal, setShowProposalModal]     = useState(false);
    const [proposalRing, setProposalRing]               = useState(null);
    const [incomingProposal, setIncomingProposal]       = useState(null); // pending couple doc for me
    const [incomingProposalFrom, setIncomingProposalFrom] = useState(null); // proposer data
    const [showIncomingProposal, setShowIncomingProposal] = useState(false);
    const [showWeddingHall, setShowWeddingHall]         = useState(false);

    // ── 🤝 BFF SYSTEM STATE ──
    const [showBFFModal, setShowBFFModal]               = useState(false);
    const [bffInitialTab, setBffInitialTab]             = useState('relationships');
    const [bffUnreadCount, setBffUnreadCount]           = useState(0);

    // ── 🤖 BOT CHATS STATE ──
    const [showDetectiveBot, setShowDetectiveBot]       = useState(false);
    const [showLoveBot, setShowLoveBot]                 = useState(false);
    const [detectiveBotUnread, setDetectiveBotUnread]   = useState(0);
    const [loveBotUnread, setLoveBotUnread]             = useState(0);

    // ── 🆕 NEW: VIP Center, Help Center, Public Chat ──
    const [showVIPCenter, setShowVIPCenter]             = useState(false);
    const [showHelpCenter, setShowHelpCenter]           = useState(false);
    const [showPublicChat, setShowPublicChat]           = useState(false);

    // ── 👤 GUEST AVATAR MENU ──
    const [showGuestMenu, setShowGuestMenu]             = useState(false);

    // ── 💬 GAME ROOM CHAT STATE ──
    const [gameChatInput, setGameChatInput]             = useState('');
    const [showGameChat, setShowGameChat]               = useState(true);
    const gameChatRef                                   = useRef(null);

    // Close guest menu when clicking outside
    useEffect(() => {
        if (!showGuestMenu) return;
        const handler = (e) => setShowGuestMenu(false);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [showGuestMenu]);

    // Click outside handler for notification dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showNotifications && notificationBellRef.current && !notificationBellRef.current.contains(e.target)) {
                const dropdown = document.querySelector('.notification-dropdown');
                if (dropdown && !dropdown.contains(e.target)) {
                    setShowNotifications(false);
                }
            }
        };
        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    const t = TRANSLATIONS[lang];
    const isLoggedIn = useMemo(() => user && !user.isAnonymous, [user]);
    const isGuest = useMemo(() => guestData !== null, [guestData]);
    const isNotLoggedIn = useMemo(() => user === null && guestData === null, [user, guestData]);
    const currentUID = useMemo(() => { if (user && !user.isAnonymous) return user.uid; if (guestData) return guestData.uid; return null; }, [user, guestData]);
    const currentUserData = useMemo(() => { if (isLoggedIn) return userData; if (isGuest) return guestData; return null; }, [isLoggedIn, userData, isGuest, guestData]);

    // ── Listen to current user's family ──
    useEffect(() => {
        if (!currentUID || !isLoggedIn) { setUserFamily(null); return; }
        const unsub = familiesCollection
            .where('members', 'array-contains', currentUID)
            .limit(1)
            .onSnapshot(snap => {
                if (!snap.empty) {
                    const doc = snap.docs[0];
                    setUserFamily({ id: doc.id, ...doc.data() });
                } else {
                    setUserFamily(null);
                }
            }, () => {});
        return () => unsub();
    }, [currentUID, isLoggedIn]);

    // ── 🤖 Bot chat unread listeners ──
    useEffect(() => {
        if (!currentUID || !isLoggedIn) return;
        let prevDetective = -1;
        let prevLove = -1;
        const unsub1 = botChatsCollection
            .where('toUserId', '==', currentUID)
            .onSnapshot(snap => {
                const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                const newDetective = docs.filter(d => d.botId === 'detective_bot' && !d.read).length;
                const newLove = docs.filter(d => d.botId === 'love_bot' && !d.read).length;
                // صوت + نوتيفيكيشن لما تيجي رسالة جديدة من البوت
                if (prevDetective !== -1 && newDetective > prevDetective) {
                    playNotificationSound();
                    setNotification(lang === 'ar' ? '🕵️ رسالة جديدة من المحقق' : '🕵️ New message from The Detective');
                }
                if (prevLove !== -1 && newLove > prevLove) {
                    playNotificationSound();
                    setNotification(lang === 'ar' ? '💌 رسالة جديدة من دواء بوت' : '💌 New message from Dawa Bot');
                }
                prevDetective = newDetective;
                prevLove = newLove;
                setDetectiveBotUnread(newDetective);
                setLoveBotUnread(newLove);
            }, () => {});
        const unsub2 = bffCollection
            .where('uid2', '==', currentUID)
            .onSnapshot(snap => {
                setBffUnreadCount(snap.docs.filter(d => d.data().status === 'pending').length);
            }, () => {});
        return () => { unsub1(); unsub2(); };
    }, [currentUID, isLoggedIn]);

    // ── 💍 Listen to couple doc (accepted or pending for me) ──
    useEffect(() => {
        if (!currentUID || !isLoggedIn) { setCoupleData(null); setPartnerData(null); return; }
        // Listen to any couple doc where I am uid1 or uid2 and status is accepted/pending
        const unsub1 = couplesCollection
            .where('uid1', '==', currentUID)
            .where('status', 'in', ['pending','accepted'])
            .limit(1)
            .onSnapshot(async snap => {
                if (!snap.empty) {
                    const doc = { id: snap.docs[0].id, ...snap.docs[0].data() };
                    if (doc.status === 'accepted') {
                        setCoupleData(doc);
                        // load partner
                        const pd = await usersCollection.doc(doc.uid2).get();
                        if (pd.exists) setPartnerData({ id: pd.id, ...pd.data() });
                        setIncomingProposal(null); setShowIncomingProposal(false);
                    }
                    // if pending and I'm the proposer — nothing special needed
                } else {
                    // Doc removed — clear couple state for uid1 side
                    setCoupleData(prev => (prev?.uid1 === currentUID ? null : prev));
                    setPartnerData(prev => (prev?.uid1 === currentUID ? null : prev));
                }
            }, () => {});
        const unsub2 = couplesCollection
            .where('uid2', '==', currentUID)
            .where('status', 'in', ['pending','accepted'])
            .limit(1)
            .onSnapshot(async snap => {
                if (!snap.empty) {
                    const doc = { id: snap.docs[0].id, ...snap.docs[0].data() };
                    if (doc.status === 'accepted') {
                        setCoupleData(doc);
                        const pd = await usersCollection.doc(doc.uid1).get();
                        if (pd.exists) setPartnerData({ id: pd.id, ...pd.data() });
                        setIncomingProposal(null); setShowIncomingProposal(false);
                    } else if (doc.status === 'pending' && doc.uid2 === currentUID) {
                        // Someone proposed to me!
                        setIncomingProposal(doc);
                        const fd = await usersCollection.doc(doc.uid1).get();
                        if (fd.exists) setIncomingProposalFrom({ id: fd.id, ...fd.data() });
                        setShowIncomingProposal(true);
                    }
                } else {
                    // Doc was removed — clear couple state for uid2 side
                    setCoupleData(prev => (prev?.uid2 === currentUID ? null : prev));
                    setPartnerData(prev => (prev?.uid2 === currentUID ? null : prev));
                    setIncomingProposal(null); setShowIncomingProposal(false);
                }
            }, () => {});
        return () => { unsub1(); unsub2(); };
    }, [currentUID, isLoggedIn]);

    // Saves achievement IDs as simple strings in userData.achievements[]
    const unlockAchievement = useCallback(async (badgeId) => {
        if (!isLoggedIn || !user) return;
        try {
            const achievement = ACHIEVEMENTS.find(a => a.id === badgeId);
            if (!achievement) return;
            const currentAchs = userData?.achievements || [];
            // Already unlocked - skip
            if (currentAchs.includes(badgeId)) return;
            await usersCollection.doc(user.uid).update({
                achievements: firebase.firestore.FieldValue.arrayUnion(badgeId)
            });
        } catch (error) {
            console.error('Achievement unlock error:', error);
        }
    }, [isLoggedIn, user, userData]);

    // Check all achievements against current user data and unlock any earned ones
    const checkAndUnlockAchievements = useCallback(async (latestUserData) => {
        if (!isLoggedIn || !user || !latestUserData) return;
        const data = latestUserData;
        const currentAchs = Array.isArray(data.achievements) ? data.achievements : [];
        const stats = data.stats || {};
        const gamesPlayed = (stats.wins || 0) + (stats.losses || 0);

        const getValue = (type) => {
            switch (type) {
                case 'wins':           return stats.wins || 0;
                case 'losses':         return stats.losses || 0;
                case 'games_played':   return gamesPlayed;
                case 'spy_wins':       return stats.spy_wins || 0;
                case 'agent_wins':     return stats.agent_wins || 0;
                case 'win_streak':     return stats.win_streak || 0;
                case 'gifts_received': return data.giftsReceived || 0;
                case 'gifts_sent':     return data.giftsSent || 0;
                case 'charisma':       return data.charisma || 0;
                case 'friends':        return (data.friends || []).length;
                case 'login_streak':   return data.loginRewards?.streak || 0;
                case 'total_logins':   return data.loginRewards?.totalClaims || 0;
                default:               return 0;
            }
        };

        const toUnlock = [];
        for (const ach of ACHIEVEMENTS) {
            if (currentAchs.includes(ach.id)) continue; // already unlocked
            const current = getValue(ach.condition.type);
            if (current >= ach.condition.value) {
                toUnlock.push(ach.id);
            }
        }

        if (toUnlock.length > 0) {
            try {
                // Add all at once
                await usersCollection.doc(user.uid).update({
                    achievements: firebase.firestore.FieldValue.arrayUnion(...toUnlock)
                });
            } catch (e) {
                console.error('Batch achievement error:', e);
                // Fallback: unlock one by one
                for (const id of toUnlock) {
                    try { await unlockAchievement(id); } catch {}
                }
            }
        }
    }, [isLoggedIn, user, userData, unlockAchievement]);

    const incrementMissionProgress = useCallback(async (key, amount = 1) => {
        if (!isLoggedIn || !user) return;
        try {
            const today = new Date().toDateString();
            const now = new Date();
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const weekNum = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
            const weekStr = `${now.getFullYear()}-W${weekNum}`;

            // Reset daily if needed
            const dailyProgress = userData?.missionProgress?.daily || {};
            const weeklyProgress = userData?.missionProgress?.weekly || {};

            const updates = {};

            // Reset daily counters if day changed
            if (dailyProgress.resetDate !== today) {
                updates['missionProgress.daily.resetDate'] = today;
                updates['missionProgress.daily.gamesPlayed']    = 0;
                updates['missionProgress.daily.gamesWon']       = 0;
                updates['missionProgress.daily.spyGames']       = 0;
                updates['missionProgress.daily.giftsSent']      = 0;
                updates['missionProgress.daily.friendsAdded']   = 0;
                updates['missionProgress.daily.momentsPosted']  = 0;
                updates['missionProgress.daily.commentsPosted'] = 0;
                // After reset, set the specific key to amount
                updates[`missionProgress.daily.${key}`] = amount;
            } else {
                updates[`missionProgress.daily.${key}`] = firebase.firestore.FieldValue.increment(amount);
            }

            // Reset weekly counters if week changed
            if (weeklyProgress.resetWeek !== weekStr) {
                updates['missionProgress.weekly.resetWeek']       = weekStr;
                updates['missionProgress.weekly.gamesPlayed']     = 0;
                updates['missionProgress.weekly.gamesWon']        = 0;
                updates['missionProgress.weekly.giftsSent']       = 0;
                updates['missionProgress.weekly.momentsPosted']   = 0;
                updates['missionProgress.weekly.friendsAdded']    = 0;
                updates[`missionProgress.weekly.${key}`] = amount;
            } else {
                updates[`missionProgress.weekly.${key}`] = firebase.firestore.FieldValue.increment(amount);
            }

            await usersCollection.doc(user.uid).update(updates);
        } catch (error) {
            console.error('Mission increment error:', error);
        }
    }, [isLoggedIn, user, userData]);

    const updateLastActive = async () => {
        if (!isLoggedIn || !user) return;
        try {
            await usersCollection.doc(user.uid).update({
                lastActive: TS()
            });
        } catch (error) {
            console.error('LastActive update error:', error);
        }
    };

    const purchaseFunPass = async () => {
        if (!isLoggedIn || !user || !userData) return;
        const FUN_PASS_PRICE = 2000;
        if (userData.currency < FUN_PASS_PRICE) {
            setNotification(lang === 'ar' ? '❌ إنتل غير كافٍ' : '❌ Not enough Intel');
            return false;
        }
        try {
            await usersCollection.doc(user.uid).update({
                [`funPass.seasons.${FUN_PASS_SEASON_ID}.premium`]: true,
                [`funPass.seasons.${FUN_PASS_SEASON_ID}.purchasedDate`]: TS(),
                'currency': firebase.firestore.FieldValue.increment(-FUN_PASS_PRICE)
            });
            setNotification(lang === 'ar' ? '✅ تم الشراء!' : '✅ Purchased!');
            return true;
        } catch (error) {
            setNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error');
            return false;
        }
    };

    const claimLoginReward = async (day) => {
        if (!isLoggedIn || !user) return;
        try {
            const rewardData = LOGIN_REWARDS_CONFIG.dailyRewards.find(r => r.day === day);
            await usersCollection.doc(user.uid).update({
                'loginRewards.currentDay': day,
                'loginRewards.lastClaimDate': TS(),
                'loginRewards.claimedDays': firebase.firestore.FieldValue.arrayUnion(day),
                'currency': firebase.firestore.FieldValue.increment(rewardData?.reward || 100)
            });
            setNotification(`✅ +${rewardData?.reward} ${lang === 'ar' ? 'تم الاستلام!' : 'Claimed!'}`);
        } catch (error) {
            setNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error');
        }
    };

    const claimDailyTask = async (boxId, reward) => {
        if (!isLoggedIn || !user) return;
        try {
            const updates = {};
            updates[`dailyTasks.boxes.${boxId - 1}.status`] = 'claimed';
            updates[`dailyTasks.boxes.${boxId - 1}.claimedAt`] = TS();

            if (reward.type === 'currency') {
                updates['currency'] = firebase.firestore.FieldValue.increment(reward.amount);
            }

            await usersCollection.doc(user.uid).update(updates);
            setNotification(`✅ +${reward.amount} ${lang === 'ar' ? 'تم الاستلام!' : 'Claimed!'}`);
        } catch (error) {
            setNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error');
        }
    };

    // Background Animation
    useEffect(() => {
        const canvas = document.getElementById('bg-canvas'); if (!canvas) return;
        const ctx = canvas.getContext('2d'); let width, height, particles = []; let mouse = { x: null, y: null };
        const resize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };
        const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
        window.addEventListener('resize', resize); window.addEventListener('mousemove', handleMouseMove); resize();
        class Particle { constructor() { this.x = Math.random() * width; this.y = Math.random() * height; this.vx = (Math.random() - 0.5) * 0.5; this.vy = (Math.random() - 0.5) * 0.5; this.size = Math.random() * 2; }
            update() { this.x += this.vx; this.y += this.vy; if (this.x < 0 || this.x > width) this.vx *= -1; if (this.y < 0 || this.y > height) this.vy *= -1; if (mouse.x != null) { let dx = mouse.x - this.x; let dy = mouse.y - this.y; let dist = Math.sqrt(dx*dx + dy*dy); if (dist < 150) { const force = (150 - dist) / 150; this.x -= dx * force * 0.02; this.y -= dy * force * 0.02; } } }
            draw() { ctx.fillStyle = 'rgba(0, 242, 255, 0.5)'; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); } }
        for(let i=0; i<40; i++) particles.push(new Particle());
        let animId; const animate = () => { ctx.clearRect(0, 0, width, height); ctx.strokeStyle = 'rgba(112, 0, 255, 0.1)'; ctx.lineWidth = 1;
            for (let i = 0; i < particles.length; i++) { particles[i].update(); particles[i].draw(); for (let j = i; j < particles.length; j++) { let dx = particles[i].x - particles[j].x; let dy = particles[i].y - particles[j].y; let dist = Math.sqrt(dx*dx + dy*dy); if (dist < 120) { ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke(); } } }
            animId = requestAnimationFrame(animate); }; animate();
        return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', handleMouseMove); };
    }, []);

    // ── Global: open family by ID from ranking ──
    useEffect(() => {
        const handler = (e) => {
            const fid = e.detail?.familyId;
            if (fid) { setViewFamilyId(fid); setShowFamilyModal(true); }
        };
        window.addEventListener('openFamilyById', handler);
        return () => window.removeEventListener('openFamilyById', handler);
    }, []);

    // Auth State Listener
    useEffect(() => {
        setAuthLoading(true);
        const unsubAuth = auth.onAuthStateChanged(async (u) => {
            if (u && !u.isAnonymous) {
                setUser(u); setGuestData(null);
                const userRef = usersCollection.doc(u.uid);
                const doc = await userRef.get();
                if (!doc.exists) {
                    // New user - show onboarding modal
                    setOnboardingGoogleUser(u);
                    setPendingNewUserRef(userRef);
                    setAuthLoading(false);
                    setShowOnboarding(true);
                } else {
                    const existingData = doc.data();
                    setUserData(existingData);
                    if (existingData.displayName) setNickname(existingData.displayName);
                    // ✅ Load saved language from Firestore
                    if (existingData.lang && (existingData.lang === 'ar' || existingData.lang === 'en')) {
                        setLang(existingData.lang);
                        localStorage.setItem('pro_spy_lang', existingData.lang);
                    }

                    if (checkLoginRewardsCycle(existingData)) {
                        await userRef.update({ 'loginRewards.currentDay': 0, 'loginRewards.streak': 0, 'loginRewards.cycleMonth': getCurrentCycleMonth() });
                    }
                    const unsubSnap = userRef.onSnapshot(snap => {
                        if (snap.exists) {
                            const d = snap.data();
                            setUserData(d);
                            if (d.displayName) setNickname(d.displayName);
                        }
                    });
                    setAuthLoading(false);
                    return () => unsubSnap();
                }
            } else { setUser(null); setUserData(null); }
            setAuthLoading(false);
        });
        return unsubAuth;
    }, []);

    // ✅ Auto-check achievements whenever relevant stats change (e.g. manual Firestore update)
    useEffect(() => {
        if (!isLoggedIn || !user || !userData) return;
        checkAndUnlockAchievements(userData);
    }, [
        userData?.stats?.wins,
        userData?.stats?.losses,
        userData?.stats?.spy_wins,
        userData?.stats?.agent_wins,
        userData?.stats?.win_streak,
        userData?.giftsReceived,
        userData?.giftsSent,
        userData?.charisma,
        userData?.friends?.length,
        userData?.loginRewards?.streak,
        userData?.loginRewards?.totalClaims,
    ]);

    // ✅ VIP Expiry Check — يتحقق كل دقيقة إذا انتهت صلاحية الـ VIP
    useEffect(() => {
        if (!user || !isLoggedIn || !userData) return;
        const checkVIPExpiry = async () => {
            const vip = userData?.vip;
            if (!vip?.isActive) return; // not active, nothing to do
            const expiresAt = vip.expiresAt?.toDate?.();
            if (!expiresAt) return;
            if (new Date() < expiresAt) return; // still valid

            // VIP expired — remove benefits but keep level/xp/customId
            const levelCfg = VIP_CONFIG.find(v => v.level === getVIPLevelFromXP(vip.xp || 0));
            const vipItems = levelCfg?.vipItems || [];

            const updates = {
                'vip.isActive': false,
            };

            // ✅ Remove vipItems from inventory (keep customId forever)
            const inv = userData?.inventory || {};
            for (const item of vipItems) {
                if (item.type === 'frames') {
                    const arr = (inv.frames || []).filter(id => id !== item.id);
                    updates['inventory.frames'] = arr;
                }
                if (item.type === 'badges') {
                    const arr = (inv.badges || []).filter(id => id !== item.id);
                    updates['inventory.badges'] = arr;
                }
                if (item.type === 'titles') {
                    const arr = (inv.titles || []).filter(id => id !== item.id);
                    updates['inventory.titles'] = arr;
                }
            }

            try { await usersCollection.doc(user.uid).update(updates); } catch(e) {}
        };
        checkVIPExpiry();
        const interval = setInterval(checkVIPExpiry, 60000);
        return () => clearInterval(interval);
    }, [userData?.vip?.isActive, userData?.vip?.expiresAt, user, isLoggedIn]);
    useEffect(() => { const tutorialDone = localStorage.getItem('pro_spy_tutorial_v2'); if(!tutorialDone && isLoggedIn) setShowTutorial(true); }, [isLoggedIn]);

    // ✅ Fix 9: Inventory expiry checker — runs periodically to remove expired timed items
    useEffect(() => {
        if (!user || !isLoggedIn || !userData) return;
        const checkInventoryExpiry = async () => {
            const expiry = userData?.inventory?.expiry || {};
            const now = Date.now();
            const expired = Object.entries(expiry).filter(([id, ts]) => ts && ts < now).map(([id]) => id);
            if (expired.length === 0) return;
            const inv = userData?.inventory || {};
            const updates = {};
            for (const id of expired) {
                // Remove from all possible inventory arrays
                ['frames', 'badges', 'titles', 'effects', 'profileEffects', 'gifts'].forEach(type => {
                    if (Array.isArray(inv[type]) && inv[type].includes(id)) {
                        updates[`inventory.${type}`] = (inv[type] || []).filter(x => x !== id);
                    }
                });
                // Also remove giftCounts if it's a gift
                if (inv.giftCounts?.[id]) updates[`inventory.giftCounts.${id}`] = firebase.firestore.FieldValue.delete();
                updates[`inventory.expiry.${id}`] = firebase.firestore.FieldValue.delete();
                // Unequip if currently equipped
                const equipped = userData?.equipped || {};
                if (equipped.frames === id) updates['equipped.frames'] = firebase.firestore.FieldValue.delete();
                if (equipped.effects === id) updates['equipped.effects'] = firebase.firestore.FieldValue.delete();
                if (equipped.profileEffects === id) updates['equipped.profileEffects'] = firebase.firestore.FieldValue.delete();
                if (Array.isArray(equipped.badges) && equipped.badges.includes(id)) {
                    updates['equipped.badges'] = equipped.badges.filter(b => b !== id);
                }
                if (Array.isArray(equipped.titles) && equipped.titles.includes(id)) {
                    updates['equipped.titles'] = equipped.titles.filter(t => t !== id);
                }
            }
            if (Object.keys(updates).length > 0) {
                try { await usersCollection.doc(user.uid).update(updates); } catch(e) {}
            }
        };
        checkInventoryExpiry();
        const interval = setInterval(checkInventoryExpiry, 60000);
        return () => clearInterval(interval);
    }, [userData?.inventory?.expiry, user, isLoggedIn]);
    useEffect(() => {
        if (!user || isGuest) return;

        // Set online immediately on login
        usersCollection.doc(user.uid).update({
            lastActive: TS(),
            onlineStatus: 'online'
        }).catch(() => {});

        // Heartbeat every 3 minutes
        const interval = setInterval(() => {
            usersCollection.doc(user.uid).update({
                lastActive: TS(),
                onlineStatus: 'online'
            }).catch(() => {});
        }, 180000);

        // Set offline immediately when page closes
        const handleOffline = () => {
            try {
                navigator.sendBeacon && navigator.sendBeacon(
                    `https://firestore.googleapis.com/v1/projects/who-is-the-spy-919b9/databases/(default)/documents/users/${user.uid}`,
                    JSON.stringify({ fields: { onlineStatus: { stringValue: 'offline' } } })
                );
            } catch(e) {}
            // Also try direct update (works when tab not fully closed)
            usersCollection.doc(user.uid).update({ onlineStatus: 'offline' }).catch(() => {});
        };

        // Set "away" when page hidden (user switched tab)
        const handleVisibility = () => {
            if (document.visibilityState === 'hidden') {
                usersCollection.doc(user.uid).update({
                    onlineStatus: 'away',
                    lastActive: TS()
                }).catch(() => {});
            } else {
                usersCollection.doc(user.uid).update({
                    onlineStatus: 'online',
                    lastActive: TS()
                }).catch(() => {});
            }
        };

        window.addEventListener('beforeunload', handleOffline);
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            clearInterval(interval);
            window.removeEventListener('beforeunload', handleOffline);
            document.removeEventListener('visibilitychange', handleVisibility);
            // Set offline on component unmount (logout)
            usersCollection.doc(user.uid).update({ onlineStatus: 'offline' }).catch(() => {});
        };
    }, [user, isGuest]);

    useEffect(() => {
        if (!isLoggedIn || !user || !userData) return;

        // Initialize session start time if not set today
        const sessionStart = userData.dailyTasks?.sessionStartTime?.toDate?.();
        const today = new Date().toDateString();
        const sessionDay = sessionStart ? sessionStart.toDateString() : null;

        if (sessionDay !== today) {
            // New day - reset boxes and set session start
            usersCollection.doc(user.uid).update({
                'dailyTasks.sessionStartTime': TS(),
                'dailyTasks.boxes': Array(8).fill(null).map(() => ({ status: 'unclaimed' }))
            }).catch(() => {});
        }
    }, [isLoggedIn, user?.uid, userData?.uid]);

    useEffect(() => {
        if (isLoggedIn && userData && !sessionClaimedToday) {
            const loginData = userData.loginRewards || { currentDay: 0, lastClaimDate: null };
            const lcd = loginData.lastClaimDate;
            let lastClaimDate = null;
            if (lcd?.toDate) lastClaimDate = lcd.toDate();
            else if (lcd instanceof Date) lastClaimDate = lcd;
            else if (lcd) { const d = new Date(lcd); if (!isNaN(d.getTime())) lastClaimDate = d; }
            const todayStr = new Date().toDateString();
            const lastClaimStr = lastClaimDate ? lastClaimDate.toDateString() : null;
            const canClaim = lastClaimStr !== todayStr;
            if (canClaim && loginData.currentDay < 30) setShowLoginRewards(true);
        }
    }, [isLoggedIn, userData?.loginRewards?.lastClaimDate, sessionClaimedToday]);

    // Notifications Listener — deferred after userData is ready
    useEffect(() => {
        if (!user || !isLoggedIn || !userData) return;
        let previousCount = -1;
        const unsub = notificationsCollection.where('toUserId', '==', user.uid).limit(50).onSnapshot(snap => {
            let notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            notifs.sort((a, b) => { const timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds || 0; const timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds || 0; return timeB - timeA; });
            const newUnread = notifs.filter(n => !n.read).length;
            if (previousCount !== -1 && newUnread > previousCount) { playNotificationSound(); if (notificationBellRef.current) { notificationBellRef.current.classList.add('ringing'); setTimeout(() => notificationBellRef.current?.classList.remove('ringing'), 500); } }
            previousCount = newUnread;
            setNotifications(notifs);
            setUnreadNotifications(newUnread);
        }, error => { });
        return () => unsub();
    }, [user, isLoggedIn, userData?.uid]);

    // Room Listener
    useEffect(() => {
        if (!roomId) return;
        const unsub = roomsCollection.doc(roomId).onSnapshot(async doc => {
            if (doc.exists) {
                const data = doc.data();
                setRoom(data);

                // 🛡️ Guard: only write history ONCE per room per session
                const alreadyWritten = historyWrittenRooms.current.has(roomId);

                if (data.status?.includes('finished') && !data.summaryShown && !alreadyWritten) {
                    // Mark immediately in memory — prevents any subsequent snapshot from re-entering
                    historyWrittenRooms.current.add(roomId);

                    setShowSummary(true);
                    historyCollection.add({ ...data, finishedAt: TS() });
                    roomsCollection.doc(roomId).update({ summaryShown: true });

                    // ✅ Update stats, missions, achievements when game ends
                    if (isLoggedIn && user) {
                        try {
                            const me = data.players?.find(p => p.uid === user.uid);
                            if (me) {
                                const isSpy = me.role === 'spy' || me.role === 'mrwhite';
                                const isInformant = me.role === 'informant';
                                const spyCaught = data.status === 'finished_spy_caught';
                                const spyEscaped = data.status === 'finished_spy_wins' || data.status === 'finished_spy_escaped';
                                const mrwhiteWon = data.status === 'finished_mrwhite_win' || data.status === 'finished_mrwhite_wins';
                                const agentsWon = spyCaught;

                                let iWon = false;
                                if (isSpy && (spyEscaped || mrwhiteWon)) iWon = true;
                                if (isInformant && (spyEscaped || mrwhiteWon)) iWon = true;
                                if (!isSpy && !isInformant && agentsWon) iWon = true;

                                const vipXpMult = getVIPXPMultiplier(userData);
                                const partnerInRoom = coupleData && data.players?.some(p => p.uid === (coupleData.uid1 === user.uid ? coupleData.uid2 : coupleData.uid1));
                                const coupleBonus = partnerInRoom ? 1.10 : 1.0;
                                const gameXP = Math.round((iWon ? 20 : 5) * vipXpMult * coupleBonus);
                                const statUpdates = {
                                    'stats.losses': firebase.firestore.FieldValue.increment(iWon ? 0 : 1),
                                    'stats.wins':   firebase.firestore.FieldValue.increment(iWon ? 1 : 0),
                                    'stats.xp':     firebase.firestore.FieldValue.increment(gameXP),
                                };
                                if (isSpy && iWon) statUpdates['stats.spy_wins']   = firebase.firestore.FieldValue.increment(1);
                                if (!isSpy && iWon) statUpdates['stats.agent_wins'] = firebase.firestore.FieldValue.increment(1);
                                statUpdates['stats.win_streak'] = iWon
                                    ? firebase.firestore.FieldValue.increment(1)
                                    : 0;

                                await usersCollection.doc(user.uid).update(statUpdates);
                                await incrementMissionProgress('gamesPlayed', 1);
                                if (iWon) await incrementMissionProgress('gamesWon', 1);
                                if (isSpy) await incrementMissionProgress('spyGames', 1);

                                const updatedDoc = await usersCollection.doc(user.uid).get();
                                if (updatedDoc.exists) await checkAndUnlockAchievements(updatedDoc.data());
                            }
                        } catch (e) { console.error('Game end stats error:', e); }
                    }
                }
            } else {
                setRoom(null);
                setRoomId('');
            }
        });
        return unsub;
    }, [roomId, isLoggedIn, user, incrementMissionProgress, checkAndUnlockAchievements]);

    // Leaderboard - Real-time
    useEffect(() => { if (activeView === 'leaderboard' || activeView === 'ranking') { const unsub = usersCollection.orderBy('stats.wins', 'desc').limit(100).onSnapshot(snap => { let data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => !d.isAnonymous).filter(d => !getUserRole(d, d.id)); setLeaderboardData(data); }, error => { usersCollection.limit(100).get().then(snap => { let data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => !d.isAnonymous).filter(d => !getUserRole(d, d.id)); data.sort((a, b) => (b.stats?.wins || 0) - (a.stats?.wins || 0)); setLeaderboardData(data); }); }); return unsub; } }, [activeView]);

    // Charisma Leaderboard - Real-time
    useEffect(() => {
        if ((activeView === 'leaderboard' || activeView === 'ranking') && leaderboardTab === 'charisma') {
            const unsub = usersCollection.orderBy('charisma', 'desc').limit(100).onSnapshot(snap => {
                let data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => !d.isAnonymous).filter(d => !getUserRole(d, d.id));
                setCharismaLeaderboard(data);
            }, error => {
                usersCollection.limit(100).get().then(snap => {
                    let data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => !d.isAnonymous).filter(d => !getUserRole(d, d.id));
                    data.sort((a, b) => (b.charisma || 0) - (a.charisma || 0));
                    setCharismaLeaderboard(data);
                });
            });
            return unsub;
        }
    }, [activeView, leaderboardTab]);

    // Family Leaderboard — by activeness
    useEffect(() => {
        if ((activeView === 'leaderboard' || activeView === 'ranking') && leaderboardTab === 'family') {
            const familiesCol = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('families');
            familiesCol.orderBy('activeness', 'desc').limit(50).get()
                .then(snap => setFamilyLeaderboard(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
                .catch(() => {
                    familiesCol.limit(50).get().then(snap => {
                        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                        data.sort((a, b) => (b.activeness || 0) - (a.activeness || 0));
                        setFamilyLeaderboard(data);
                    }).catch(() => {});
                });
        }
    }, [activeView, leaderboardTab]);

    // ✅ FIXED: Friends - Real-time with online status
    // ✅ REALTIME friends - always active (not just when tab is open)
    useEffect(() => {
        if (userData && user && isLoggedIn) {
            if (userData.friends?.length > 0) {
                const unsub = usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', userData.friends).onSnapshot(snap => {
                    const friends = snap.docs.map(d => {
                        const data = d.data();
                        const lastActive = data.lastActive?.toDate?.() || new Date(0);
                        const timeSinceActive = Date.now() - lastActive.getTime();
                        const dbStatus = data.onlineStatus;

                        // ✅ Real-time status: use both DB onlineStatus field AND lastActive timestamp
                        let onlineStatus = 'offline';
                        if (dbStatus === 'online' && timeSinceActive < 600000) { // DB says online + seen < 10min
                            onlineStatus = 'online';
                        } else if (dbStatus === 'away' || (dbStatus === 'online' && timeSinceActive < 1800000)) {
                            onlineStatus = 'away'; // DB says away OR online but not seen for 10-30min
                        } else if (timeSinceActive < 300000) {
                            onlineStatus = 'online'; // seen < 5min regardless of DB
                        }

                        return { id: d.id, ...data, isOnline: onlineStatus === 'online', onlineStatus };
                    });
                    setFriendsData(friends);
                });
                return unsub;
            } else { setFriendsData([]); }
        }
    }, [userData?.friends, user, isLoggedIn]);

    // Friend Requests - Real-time
    useEffect(() => { if (userData && user && isLoggedIn) { if (userData.friendRequests?.length > 0) { const unsub = usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', userData.friendRequests).onSnapshot(snap => { setFriendRequests(snap.docs.map(d => ({ id: d.id, ...d.data() }))); }); return unsub; } else { setFriendRequests([]); } } }, [userData?.friendRequests, user, isLoggedIn]);

    // Chats Meta - Real-time with notification sound
    useEffect(() => {
        if (!user || !isLoggedIn) return;
        let prevTotal = -1;
        const unsub = chatsCollection.where('members', 'array-contains', user.uid).onSnapshot(snap => {
            let total = 0;
            const meta = {};
            snap.docs.forEach(doc => {
                const d = doc.data();
                meta[doc.id] = d;
                const myUnread = d.unread?.[user.uid] || 0;
                total += myUnread;
            });
            // صوت + نوتيفيكيشن لو جاء مسج جديد
            if (prevTotal !== -1 && total > prevTotal) {
                playNotificationSound();
                // عرض notification بدون نص طويل
            }
            prevTotal = total;
            setChatsMeta(meta);
            setTotalUnread(total);
        });
        return unsub;
    }, [user, isLoggedIn]);

    // Timers
    useEffect(() => { if (room?.status === 'discussing' && room?.turnEndTime) { const interval = setInterval(() => { const remaining = Math.max(0, Math.floor((room.turnEndTime - Date.now()) / 1000)); setTurnTimer(remaining); if (remaining <= 0) { handleSkipTurn(true); clearInterval(interval); } }, 1000); return () => clearInterval(interval); } else setTurnTimer(30); }, [room?.status, room?.turnEndTime]);
    useEffect(() => { if (room?.status === 'voting' && room?.votingEndTime) { const interval = setInterval(() => { const remaining = Math.max(0, Math.floor((room.votingEndTime - Date.now()) / 1000)); setVotingTimer(remaining); if (remaining <= 0) { clearInterval(interval); } }, 1000); return () => clearInterval(interval); } else setVotingTimer(30); }, [room?.status, room?.votingEndTime]);
    useEffect(() => { if (room?.status === 'word_selection' && room?.wordSelEndTime) { const interval = setInterval(() => { const remaining = Math.max(0, Math.floor((room.wordSelEndTime - Date.now()) / 1000)); setWordSelTimer(remaining); if (remaining <= 0) { clearInterval(interval); } }, 1000); return () => clearInterval(interval); } else setWordSelTimer(30); }, [room?.status, room?.wordSelEndTime]);

    // ── Auto-resolve word votes (admin only) ──
    useEffect(() => {
        if (!room || room.status !== 'word_selection' || currentUID !== room.admin) return;
        const activePlayers = room.players.filter(p => p.status === 'active');
        // Only agents and informants vote; spy and mrwhite are excluded
        const voters = activePlayers.filter(p => p.role !== 'spy' && p.role !== 'mrwhite');
        if (voters.length === 0) return;
        const allVoted = voters.every(p => room.wordVotes?.[p.uid]);
        if (!allVoted) return;
        // Count votes & pick majority word
        const voteCounts = {};
        voters.forEach(p => {
            const w = room.wordVotes[p.uid];
            if (w) voteCounts[w] = (voteCounts[w] || 0) + 1;
        });
        const chosenWord = Object.entries(voteCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
        if (!chosenWord) return;
        roomsCollection.doc(roomId).update({
            chosenWord, status: 'discussing',
            wordSelEndTime: null, turnEndTime: Date.now() + 30000,
        }).catch(() => {});
    }, [room?.wordVotes, room?.status, currentUID, room?.admin, room?.players, roomId]);

    // ── Auto-resolve final votes (admin only) ──
    useEffect(() => {
        if (!room || room.status !== 'voting' || currentUID !== room.admin) return;
        const activePlayers = room.players.filter(p => p.status === 'active');
        const allVoted = activePlayers.length > 0 && activePlayers.every(p => room.votes?.[p.uid]);
        if (!allVoted) return;
        // Tally votes
        const voteCounts = {};
        Object.values(room.votes).forEach(v => { voteCounts[v] = (voteCounts[v] || 0) + 1; });
        const maxVotes = Math.max(...Object.values(voteCounts));
        const topVoted = Object.entries(voteCounts).filter(([, count]) => count === maxVotes);
        if (topVoted.length > 1) {
            // Tie → spy escapes
            roomsCollection.doc(roomId).update({ status: 'finished_spy_escaped', votingEndTime: null }).catch(() => {});
            return;
        }
        const ejectedUID = topVoted[0][0];
        const ejectedPlayer = activePlayers.find(p => p.uid === ejectedUID);
        const ejectedRole = ejectedPlayer?.role;
        const sysMsg = { sender: 'system', name: 'SYSTEM', text: `🚨 ${ejectedPlayer?.name || ejectedUID} was ejected!`, time: Date.now() };
        if (ejectedRole === 'spy') {
            roomsCollection.doc(roomId).update({ status: 'spy_guessing', ejectedUID, votingEndTime: null, messages: firebase.firestore.FieldValue.arrayUnion(sysMsg) }).catch(() => {});
        } else if (ejectedRole === 'mrwhite') {
            roomsCollection.doc(roomId).update({ status: 'mrwhite_guessing', ejectedUID, votingEndTime: null, messages: firebase.firestore.FieldValue.arrayUnion(sysMsg) }).catch(() => {});
        } else {
            // Innocent ejected
            roomsCollection.doc(roomId).update({ status: 'finished_spy_escaped', ejectedUID, votingEndTime: null, messages: firebase.firestore.FieldValue.arrayUnion(sysMsg) }).catch(() => {});
        }
    }, [room?.votes, room?.status, currentUID, room?.admin, room?.players, roomId]);

    // ── Bot automation (owner only) ──
    useEffect(() => {
        if (!room || currentUID !== OWNER_UID) return;
        const bots = room.players.filter(p => p.isBot && p.status === 'active');
        if (bots.length === 0) return;
        // Bot word voting
        if (room.status === 'word_selection') {
            const words = room.scenario?.words_en || [];
            if (words.length === 0) return;
            bots.forEach(bot => {
                if (!room.wordVotes?.[bot.uid] && bot.role !== 'spy' && bot.role !== 'mrwhite') {
                    const w = words[Math.floor(Math.random() * words.length)];
                    const upd = {}; upd[`wordVotes.${bot.uid}`] = w;
                    setTimeout(() => roomsCollection.doc(roomId).update(upd).catch(() => {}), 1500 + Math.random() * 2000);
                }
            });
        }
        // Bot turn in discussion - auto skip with optional chat
        if (room.status === 'discussing' && room.currentTurnUID) {
            const currentBot = bots.find(b => b.uid === room.currentTurnUID);
            if (currentBot) {
                const delay = 2000 + Math.random() * 3000;
                const shouldChat = Math.random() > 0.4;
                const msgs = lang === 'ar' ? ['هممم، مثير للاهتمام...', 'لدي شكوكي.', 'دعونا نفكر بعناية.', 'نقطة جيدة.', 'أراقب الجميع.', 'شيء ما غريب.', 'موافق.', 'لست متأكداً من ذلك.'] : ['Hmm, interesting...', 'I have my suspicions.', 'Let\'s think carefully.', 'That\'s a good point.', 'I\'m watching everyone.', 'Something seems off.', 'Agreed.', 'Not sure about that.'];
                const timer = setTimeout(async () => {
                    if (shouldChat) {
                        const msg = msgs[Math.floor(Math.random() * msgs.length)];
                        const chatMsg = { sender: currentBot.uid, name: currentBot.name, text: msg, time: Date.now(), isBot: true };
                        await roomsCollection.doc(roomId).update({ messages: firebase.firestore.FieldValue.arrayUnion(chatMsg) }).catch(() => {});
                    }
                    await nextTurn();
                }, delay);
                return () => clearTimeout(timer);
            }
        }
        // Bot final voting
        if (room.status === 'voting') {
            const humanPlayers = room.players.filter(p => p.status === 'active' && !p.isBot);
            bots.forEach(bot => {
                if (!room.votes?.[bot.uid] && humanPlayers.length > 0) {
                    const target = humanPlayers[Math.floor(Math.random() * humanPlayers.length)];
                    const upd = {}; upd[`votes.${bot.uid}`] = target.uid;
                    setTimeout(() => roomsCollection.doc(roomId).update(upd).catch(() => {}), 2000 + Math.random() * 3000);
                }
            });
        }
    }, [room?.currentTurnUID, room?.status, room?.wordVotes, room?.votes, currentUID, roomId, lang]);

    // Auth Functions
    const handleGoogleLogin = useCallback(async () => { const provider = new firebase.auth.GoogleAuthProvider(); try { await auth.signInWithPopup(provider); setShowDropdown(false); } catch (e) { } }, []);
    const handleLogout = useCallback(async () => { if (user) await auth.signOut(); setShowDropdown(false); setNickname(''); setGuestData(null); localStorage.removeItem('pro_spy_guest_uid'); localStorage.removeItem('pro_spy_nick'); }, [user]);

    // Onboarding Complete Handler
    const handleOnboardingComplete = useCallback(async ({ displayName, gender, country, photoURL }) => {
        if (!onboardingGoogleUser || !pendingNewUserRef) return;
        const u = onboardingGoogleUser;
        const finalPhoto = photoURL || u.photoURL || null;
        const newUserData = {
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
        await pendingNewUserRef.set(newUserData);
        setUserData(newUserData);
        setNickname(displayName);
        setUser(u);
        setGuestData(null);
        setShowOnboarding(false);
        setOnboardingGoogleUser(null);
        setPendingNewUserRef(null);
        // Start listening to user doc
        pendingNewUserRef.onSnapshot(snap => {
            if (snap.exists) { setUserData(snap.data()); if (snap.data().displayName) setNickname(snap.data().displayName); }
        });
        playSound('success');
        setNotification(lang === 'ar' ? '🎉 مرحباً بك!' : '🎉 Welcome aboard!');
    }, [onboardingGoogleUser, pendingNewUserRef, lang]);

    // Guest System
    useEffect(() => {
        const initGuest = async () => {
            if (authLoading) return; if (user && !user.isAnonymous) return;
            const savedGuestUID = localStorage.getItem('pro_spy_guest_uid');
            if (savedGuestUID) { try { const doc = await guestsCollection.doc(savedGuestUID).get(); if (doc.exists) { setGuestData({ id: doc.id, ...doc.data() }); if (doc.data().displayName) setNickname(doc.data().displayName); return; } } catch (e) { } }
            const savedNick = localStorage.getItem('pro_spy_nick');
            const guestNick = savedNick || ('Player_' + Math.random().toString(36).substring(2, 6));
            const guestUID = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
            const newGuestData = { uid: guestUID, displayName: guestNick, photoURL: null, customId: Math.floor(100000 + Math.random() * 900000).toString(), stats: { wins: 0, losses: 0, xp: 0 }, currency: 0, charisma: 0, equipped: { badges: [] }, inventory: { frames: [], titles: [], themes: [], badges: [], gifts: [] }, isAnonymous: true, isGuest: true, createdAt: TS(), lastActive: TS() };
            try { await guestsCollection.doc(guestUID).set(newGuestData); setGuestData(newGuestData); setNickname(guestNick); localStorage.setItem('pro_spy_guest_uid', guestUID); localStorage.setItem('pro_spy_nick', guestNick); } catch (e) { }
        };
        initGuest();
    }, [authLoading, user]);

    useEffect(() => { if (!guestData?.uid) return; const unsub = guestsCollection.doc(guestData.uid).onSnapshot(snap => { if (snap.exists) setGuestData({ id: snap.id, ...snap.data() }); }); return unsub; }, [guestData?.uid]);

    const getDefaultPhoto = useCallback((uData, name) => uData?.photoURL || `https://ui-avatars.com/api/?name=${name || 'Guest'}&background=random`, []);

    // Notification Functions
    const createNotification = useCallback(async (toUserId, type, message, fromUserId, fromName, giftData = null) => { try { await notificationsCollection.add({ toUserId, fromUserId, fromName, type, message, giftData, timestamp: TS(), read: false }); } catch (e) { } }, []);
    const markNotificationRead = useCallback(async (notifId) => { try { await notificationsCollection.doc(notifId).update({ read: true }); } catch (e) { } }, []);
    const clearAllNotifications = useCallback(async () => { try { const batch = db.batch(); notifications.forEach(n => { batch.delete(notificationsCollection.doc(n.id)); }); await batch.commit(); setNotifications([]); setUnreadNotifications(0); } catch (e) { } }, [notifications]);
    const handleNotificationClick = useCallback((notif) => {
        if (notif.type === 'friend_request') { setActiveView('friends'); }
        else if (notif.type === 'gift') { setNotification(notif.message); }
        else if (notif.type === 'couple_proposal') { setActiveView('discover'); }
        else if (notif.type === 'couple_accepted') { setShowCoupleCard(true); }
        else if (notif.type === 'message') { if (notif.fromUserId && notif.fromName) { const friend = { uid: notif.fromUserId, displayName: notif.fromName, photoURL: notif.fromPhoto }; setChatFriend(friend); setShowPrivateChat(true); } }
    }, []);

    // 💍 Couple proposal send handler
    const handleSendProposal = useCallback(async ({ toUID, toData, giftId, message }) => {
        if (!user || !isLoggedIn || !proposalRing) return;
        await sendProposal({
            fromUID: user.uid,
            toUID,
            fromData: userData,
            ringId: proposalRing.id,
            giftId,
            message,
            onNotification: setNotification,
            lang,
        });
    }, [user, isLoggedIn, userData, proposalRing, lang]);

    // 💍 Accept incoming proposal
    const handleAcceptProposal = useCallback(async (coupleDoc) => {
        await acceptProposal({
            coupleDocId: coupleDoc.id,
            uid1: coupleDoc.uid1,
            uid2: coupleDoc.uid2,
            onNotification: setNotification,
            lang,
        });
        setShowIncomingProposal(false);
    }, [lang]);

    // 💍 Decline incoming proposal
    const handleDeclineProposal = useCallback(async (coupleDoc) => {
        const ring = RINGS_DATA.find(r => r.id === coupleDoc.ringId);
        const gift = PROPOSAL_GIFTS.find(g => g.id === coupleDoc.giftId);
        await declineProposal({
            coupleDocId: coupleDoc.id,
            fromUID: coupleDoc.uid1,
            toUID: coupleDoc.uid2,
            ringCost: ring?.cost || 0,
            giftCost: gift?.cost || 0,
            onNotification: setNotification,
            lang,
        });
        setShowIncomingProposal(false);
    }, [lang]);

    // Claim Login Reward
    const handleClaimLoginReward = useCallback(async (day) => {
        if (!user || !isLoggedIn) return;
        // Safety: re-read current day from Firestore to avoid stale data
        const freshDoc = await usersCollection.doc(user.uid).get();
        const freshData = freshDoc.data();
        const freshLoginData = freshData?.loginRewards || {};
        const freshDay = freshLoginData.currentDay || 0;
        // The next day to claim must match what we expect
        const expectedNextDay = freshDay + 1;
        if (day !== expectedNextDay) {
            day = expectedNextDay; // Fix stale day
        }
        const reward = LOGIN_REWARDS[day - 1];
        if (!reward) return;
        try {
            const userRef = usersCollection.doc(user.uid);
            const userDoc = await userRef.get();
            const userData = userDoc.data();
            const inventory = userData?.inventory || { frames: [], titles: [], badges: [], gifts: [] };
            const updates = {};

            switch (reward.type) {
                case 'currency':
                    updates.currency = firebase.firestore.FieldValue.increment(reward.amount);
                    setNotification(`${lang === 'ar' ? 'حصلت على' : 'You received'} +${reward.amount} 🧠!`);
                    break;
                case 'frame':
                    if (!inventory.frames?.includes(reward.itemId)) { updates['inventory.frames'] = firebase.firestore.FieldValue.arrayUnion(reward.itemId); setNotification(`${lang === 'ar' ? '🎉 حصلت على إطار!' : '🎉 You received a frame!'} ${lang === 'ar' ? reward.name_ar : reward.name_en}`); }
                    else { updates.currency = firebase.firestore.FieldValue.increment(500); setNotification(`${lang === 'ar' ? 'الإطار مملوك! +500 إنتل' : 'Frame owned! +500 Intel'}! 🧠`); }
                    break;
                case 'badge':
                    if (!inventory.badges?.includes(reward.itemId)) { updates['inventory.badges'] = firebase.firestore.FieldValue.arrayUnion(reward.itemId); setNotification(`${lang === 'ar' ? '🎉 حصلت على شارة!' : '🎉 You received a badge!'} ${lang === 'ar' ? reward.name_ar : reward.name_en}`); }
                    else { updates.currency = firebase.firestore.FieldValue.increment(500); setNotification(`${lang === 'ar' ? 'الشارة مملوكة! +500 إنتل' : 'Badge owned! +500 Intel'}! 🧠`); }
                    break;
                case 'title':
                    if (!inventory.titles?.includes(reward.itemId)) { updates['inventory.titles'] = firebase.firestore.FieldValue.arrayUnion(reward.itemId); setNotification(`${lang === 'ar' ? '🎉 حصلت على لقب!' : '🎉 You received a title!'} ${lang === 'ar' ? reward.name_ar : reward.name_en}`); }
                    else { updates.currency = firebase.firestore.FieldValue.increment(500); setNotification(`${lang === 'ar' ? 'اللقب مملوك! +500 إنتل' : 'Title owned! +500 Intel'}! 🧠`); }
                    break;
            }
            updates['loginRewards.currentDay'] = day;
            updates['loginRewards.lastClaimDate'] = TS();
            updates['loginRewards.streak'] = firebase.firestore.FieldValue.increment(1);
            updates['loginRewards.totalClaims'] = firebase.firestore.FieldValue.increment(1);
            updates['loginRewards.cycleMonth'] = getCurrentCycleMonth();
            await userRef.update(updates);
            playRewardSound();
            setShowLoginRewards(false);
            setSessionClaimedToday(true); // Mark as claimed for this session
        } catch (error) { setNotification(lang === 'ar' ? 'حدث خطأ!' : 'An error occurred!'); }
    }, [user, isLoggedIn, lang]);

    // Room Functions
    const handleCreateGame = useCallback(async () => {
        if (!nickname.trim()) return;
        if (isPrivate && !password.trim()) { setAlertMessage(t.privateRoomError); return; }
        playSound('click'); setLoading(true);
        const uid = currentUID; const tempUserData = currentUserData;
        if (!uid) { setLoading(false); setAlertMessage(lang === 'ar' ? 'حدث خطأ' : 'Error'); return; }
        const id = Math.random().toString(36).substring(2, 7).toUpperCase();
        await roomsCollection.doc(id).set({ id, admin: uid, status: 'waiting', players: [{ uid: uid, name: nickname, status: 'active', photo: getDefaultPhoto(tempUserData, nickname), role: null, equipped: tempUserData?.equipped || {}, vip: tempUserData?.vip || {} }], scenario: null, spyId: null, currentTurnUID: null, turnEndTime: null, votingEndTime: null, currentRound: 0, messages: [], votes: {}, usedLocations: [], wordVotes: {}, chosenWord: null, wordSelEndTime: null, votingRequest: null, mode: setupMode, isPrivate: isPrivate, password: isPrivate ? password : null, startedAt: null, summaryShown: false });
        setRoomId(id); setLoading(false); setShowSetupModal(false); setActiveView('lobby');
        navigator.clipboard.writeText(id); setCopied(true); setTimeout(() => setCopied(false), 2000);
    }, [nickname, isPrivate, password, currentUID, currentUserData, setupMode, t, lang, getDefaultPhoto]);

    const handleJoinGame = useCallback(async (id, pwd) => {
        if (!id || id.trim() === "") { setJoinError(t.enterCodeError); return; }
        if (!nickname.trim()) return;
        playSound('click'); setLoading(true); setJoinError('');
        const uid = currentUID; const tempUserData = currentUserData;
        if (!uid) { setLoading(false); setAlertMessage(lang === 'ar' ? 'حدث خطأ' : 'Error'); return; }
        const ref = roomsCollection.doc(id.toUpperCase());
        const snap = await ref.get();
        if (snap.exists) {
            const data = snap.data();
            if(data.isPrivate && data.password !== pwd) { setJoinError(lang === 'ar' ? 'كلمة السر غير صحيحة' : "Incorrect Password"); setLoading(false); return; }
            const exists = data.players.find(p => p.uid === uid);
            if (!exists) { await ref.update({ players: [...data.players, { uid: uid, name: nickname, status: 'active', photo: getDefaultPhoto(tempUserData, nickname), role: null, equipped: tempUserData?.equipped || {}, vip: tempUserData?.vip || {} }] }); }
            setRoomId(id.toUpperCase()); setActiveView('lobby'); setShowBrowseRooms(false);
        } else { setJoinError(lang === 'ar' ? 'الغرفة غير موجودة' : "Room not found"); }
        setLoading(false);
    }, [nickname, currentUID, currentUserData, t, lang, getDefaultPhoto]);

    const handleLeaveRoom = useCallback(async () => {
        if (!room || !currentUID) return;
        playSound('click');
        const isAdmin = room.admin === currentUID;
        if (isAdmin) { await roomsCollection.doc(roomId).delete(); } else { await roomsCollection.doc(roomId).update({ players: room.players.filter(p => p.uid !== currentUID) }); }
        setRoom(null); setRoomId(''); setShowSummary(false);
    }, [room, currentUID, roomId]);

    // Game Logic Functions
    const startGame = useCallback(async () => {
        if (room.admin !== currentUID) return;
        playSound('success');
        const activePlayers = room.players.filter(p => p.status === 'active');
        const playerCount = activePlayers.length;
        if (room.mode === 'advanced' && playerCount < 6) { setAlertMessage("Advanced mode requires 6+ players!"); return; }
        if (playerCount < 3) { setAlertMessage(t.needPlayers); return; }
        if (playerCount > 10) { setAlertMessage("Max 10 players."); return; }
        const used = room.usedLocations || [];
        const avail = SCENARIOS.filter(s => !used.includes(s.loc_en));
        const scenario = (avail.length > 0 ? avail : SCENARIOS)[Math.floor(Math.random() * (avail.length || SCENARIOS.length))];
        const spy = activePlayers[Math.floor(Math.random() * activePlayers.length)];
        let roles = {};
        let mrwhiteId = null;
        let informantId = null;
        if (room.mode === 'advanced') {
            roles[spy.uid] = 'spy';
            let remaining = activePlayers.filter(p => p.uid !== spy.uid);
            if (remaining.length > 0) {
                const mrWhite = remaining[Math.floor(Math.random() * remaining.length)];
                roles[mrWhite.uid] = 'mrwhite';
                mrwhiteId = mrWhite.uid;
                remaining = remaining.filter(p => p.uid !== mrWhite.uid);
            }
            if (remaining.length > 0) {
                const informant = remaining[Math.floor(Math.random() * remaining.length)];
                roles[informant.uid] = 'informant';
                informantId = informant.uid;
            }
            activePlayers.forEach(p => { if (!roles[p.uid]) roles[p.uid] = 'agent'; });
        } else {
            activePlayers.forEach(p => roles[p.uid] = p.uid === spy.uid ? 'spy' : 'agent');
        }
        let potentialStarters = activePlayers.filter(p => roles[p.uid] !== 'spy');
        if (potentialStarters.length === 0) potentialStarters = activePlayers;
        const firstPlayer = potentialStarters[Math.floor(Math.random() * potentialStarters.length)];
        await roomsCollection.doc(roomId).update({
            status: 'word_selection',
            scenario,
            spyId: spy.uid,
            mrwhiteId,
            informantId,
            currentTurnUID: firstPlayer.uid,
            turnEndTime: null,
            currentRound: 1,
            players: room.players.map(p => ({ ...p, vote: null, role: roles[p.uid] || 'agent' })),
            usedLocations: firebase.firestore.FieldValue.arrayUnion(scenario.loc_en),
            messages: [],
            votes: {},
            wordVotes: {},
            chosenWord: null,
            wordSelEndTime: Date.now() + 45000,
            votingRequest: null,
            ejectedUID: null,
            startedAt: TS()
        });
    }, [room, currentUID, roomId, t]);
    const submitWordVote = useCallback(async (word) => {
        if (!currentUID || !room || room.status !== 'word_selection') return;
        // Spy and MrWhite don't vote for words - compute role inline
        const myPlayer = room?.players?.find(p => p.uid === currentUID);
        if (myPlayer?.role === 'spy' || myPlayer?.role === 'mrwhite') return;
        playSound('click');
        const voteUpdate = {};
        voteUpdate[`wordVotes.${currentUID}`] = word;
        await roomsCollection.doc(roomId).update(voteUpdate);
    }, [currentUID, room, roomId]);
    const handleSkipTurn = useCallback(async (forced = false) => { if (!room) return; if (!forced && room.currentTurnUID !== currentUID) return; if (forced && room.status !== 'discussing') return; nextTurn(); }, [room, currentUID]);
    const nextTurn = useCallback(async () => { if (!room) return; const activePlayers = room.players.filter(p => p.status === 'active'); const currentIndex = activePlayers.findIndex(p => p.uid === room.currentTurnUID); const nextIndex = (currentIndex + 1) % activePlayers.length; await roomsCollection.doc(roomId).update({ currentTurnUID: activePlayers[nextIndex].uid, turnEndTime: Date.now() + 30000 }); }, [room, roomId]);
    const requestVoting = useCallback(async () => { if (!room || room.status !== 'discussing') return; playSound('click'); if (room.admin === currentUID) { await triggerVoting(); return; } await roomsCollection.doc(roomId).update({ votingRequest: { requestedBy: currentUID, votes: { [currentUID]: true } } }); }, [room, currentUID, roomId]);
    const agreeToVote = useCallback(async () => { if (!room || !room.votingRequest) return; playSound('click'); const currentVotes = room.votingRequest.votes || {}; const newVotes = { ...currentVotes, [currentUID]: true }; const activePlayers = room.players.filter(p => p.status === 'active'); if (currentUID === room.admin) { await triggerVoting(); return; } const agreeCount = Object.values(newVotes).filter(v => v === true).length; const majorityCount = Math.floor(activePlayers.length / 2) + 1; if (agreeCount >= majorityCount) { await triggerVoting(); } else { await roomsCollection.doc(roomId).update({ "votingRequest.votes": newVotes }); } }, [room, currentUID, roomId]);
    const declineVote = useCallback(async () => { if (!room || !room.votingRequest) return; playSound('click'); const currentVotes = room.votingRequest.votes || {}; const newVotes = { ...currentVotes, [currentUID]: false }; const activePlayers = room.players.filter(p => p.status === 'active'); const declineCount = Object.values(newVotes).filter(v => v === false).length; const majorityCount = Math.floor(activePlayers.length / 2) + 1; if (declineCount >= majorityCount) { await roomsCollection.doc(roomId).update({ votingRequest: null }); } else { await roomsCollection.doc(roomId).update({ "votingRequest.votes": newVotes }); } }, [room, currentUID, roomId]);
    const triggerVoting = useCallback(async () => { playSound('click'); const sysMsg = { sender: 'system', name: 'SYSTEM', text: t.votingStarted, time: Date.now() }; await roomsCollection.doc(roomId).update({ status: 'voting', currentTurnUID: null, turnEndTime: null, votingEndTime: Date.now() + 30000, messages: firebase.firestore.FieldValue.arrayUnion(sysMsg), votingRequest: null }); }, [roomId, t]);
    const submitVote = useCallback(async (targetUID) => { if (!targetUID || !currentUID || (room.votes && room.votes[currentUID])) return; playSound('click'); const voteUpdate = {}; voteUpdate[`votes.${currentUID}`] = targetUID; await roomsCollection.doc(roomId).update(voteUpdate); }, [room, currentUID, roomId]);
    const resetGame = useCallback(async () => {
        playSound('click');
        await roomsCollection.doc(roomId).update({
            status: 'waiting', scenario: null, spyId: null, mrwhiteId: null, informantId: null,
            currentTurnUID: null, currentRound: 0, votes: {}, messages: [], votingEndTime: null,
            turnEndTime: null, ejectedUID: null,
            players: room.players.map(p => ({ uid: p.uid, name: p.name, status: 'active', photo: p.photo, role: null, equipped: p.equipped || {}, vip: p.vip || {}, isBot: p.isBot || false, botUID: p.botUID || null })),
            wordVotes: {}, chosenWord: null, wordSelEndTime: null, votingRequest: null,
            startedAt: null, finishedAt: null, summaryShown: false
        });
        setShowSummary(false);
    }, [room, roomId]);

    // ── 💬 SEND GAME CHAT MESSAGE ──
    const sendGameMessage = useCallback(async () => {
        const text = gameChatInput.trim();
        if (!text || !room || !currentUID) return;
        const senderName = room.players.find(p => p.uid === currentUID)?.name || nickname || 'Player';
        const msg = {
            sender: currentUID,
            name: senderName,
            text,
            time: Date.now(),
        };
        setGameChatInput('');
        await roomsCollection.doc(roomId).update({
            messages: firebase.firestore.FieldValue.arrayUnion(msg)
        });
    }, [gameChatInput, room, currentUID, roomId, nickname]);

    // Auto-scroll chat to bottom when new messages arrive
    useEffect(() => {
        if (gameChatRef.current) {
            gameChatRef.current.scrollTop = gameChatRef.current.scrollHeight;
        }
    }, [room?.messages?.length]);

    // ── Spy guesses the chosen WORD when caught ──
    const submitSpyWordGuess = useCallback(async (guessedWord) => {
        if (!room || room.status !== 'spy_guessing') return;
        if (currentUID !== room.ejectedUID && currentUID !== room.spyId) return;
        playSound('click');
        const correct = guessedWord.trim().toLowerCase() === (room.chosenWord || '').trim().toLowerCase();
        const sysMsg = { sender: 'system', name: 'SYSTEM', text: correct ? '🎯 Spy guessed correctly!' : '❌ Wrong guess!', time: Date.now() };
        await roomsCollection.doc(roomId).update({
            status: correct ? 'finished_spy_escaped' : 'finished_spy_caught',
            spyGuessWord: guessedWord,
            messages: firebase.firestore.FieldValue.arrayUnion(sysMsg)
        });
    }, [room, currentUID, roomId]);

    // ── MrWhite guesses the LOCATION when caught ──
    const submitMrWhiteLocationGuess = useCallback(async (guessedLocation) => {
        if (!room || room.status !== 'mrwhite_guessing') return;
        if (currentUID !== room.ejectedUID && currentUID !== room.mrwhiteId) return;
        playSound('click');
        const locEn = (room.scenario?.loc_en || '').toLowerCase();
        const locAr = (room.scenario?.loc_ar || '').toLowerCase();
        const guess = guessedLocation.trim().toLowerCase();
        const correct = guess === locEn || guess === locAr || locEn.includes(guess) || locAr.includes(guess);
        const sysMsg = { sender: 'system', name: 'SYSTEM', text: correct ? '🎯 Mr. White guessed correctly!' : '❌ Wrong guess!', time: Date.now() };
        await roomsCollection.doc(roomId).update({
            status: correct ? 'finished_mrwhite_wins' : 'finished_spy_caught',
            mrwhiteGuessLocation: guessedLocation,
            messages: firebase.firestore.FieldValue.arrayUnion(sysMsg)
        });
    }, [room, currentUID, roomId]);

    // ── Spy voluntarily declares and goes to guessing phase ──
    const spyVoluntaryDeclare = useCallback(async () => {
        if (!room || room.status !== 'discussing') return;
        const myPlayer = room?.players?.find(p => p.uid === currentUID);
        if (myPlayer?.role !== 'spy') return;
        playSound('click');
        const sysMsg = { sender: 'system', name: 'SYSTEM', text: '🕵️ Spy revealed themselves!', time: Date.now() };
        await roomsCollection.doc(roomId).update({
            status: 'spy_guessing',
            ejectedUID: currentUID,
            messages: firebase.firestore.FieldValue.arrayUnion(sysMsg),
            votingEndTime: null, turnEndTime: null
        });
    }, [room, currentUID, roomId]);

    // ── BOT SYSTEM (Owner only) ──
    const BOT_NAMES = ['Shadow', 'Ghost', 'Cipher', 'Viper', 'Nova', 'Hex', 'Raven', 'Storm', 'Blaze', 'Frost', 'Echo', 'Spectre'];
    const BOT_PHOTOS = ['🤖', '👾', '🦾', '🎭', '🕶️', '🦿'];
    const BOT_CHAT_MSGS_EN = ['Hmm, interesting...', 'I have my suspicions.', 'Let\'s think carefully.', 'That\'s a good point.', 'I\'m watching everyone.', 'Something seems off.', 'My instinct says...', 'Agreed.', 'Not sure about that.', 'Fascinating.'];
    const BOT_CHAT_MSGS_AR = ['هممم، مثير للاهتمام...', 'لدي شكوكي.', 'دعونا نفكر بعناية.', 'نقطة جيدة.', 'أراقب الجميع.', 'شيء ما غريب.', 'حدسي يقول...', 'موافق.', 'لست متأكداً.', 'رائع.'];

    const addBotToRoom = useCallback(async () => {
        if (!room || currentUID !== OWNER_UID) return;
        const bots = room.players.filter(p => p.isBot);
        if (bots.length >= 5) { setAlertMessage('Max 5 bots allowed!'); return; }
        if (room.players.length >= 10) { setAlertMessage('Room is full!'); return; }
        const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)] + '_' + Math.floor(Math.random() * 99);
        const botUID = 'bot_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        const newBot = { uid: botUID, name: botName, status: 'active', photo: null, role: null, equipped: {}, vip: {}, isBot: true, botUID };
        await roomsCollection.doc(roomId).update({ players: firebase.firestore.FieldValue.arrayUnion(newBot) });
        playSound('success');
    }, [room, currentUID, roomId]);

    const removeBotFromRoom = useCallback(async (botUID) => {
        if (!room || currentUID !== OWNER_UID) return;
        await roomsCollection.doc(roomId).update({ players: room.players.filter(p => p.uid !== botUID) });
        playSound('click');
    }, [room, currentUID, roomId]);

    // Friend Functions
    const openProfile = useCallback((uid) => { if(!uid) return; setTargetProfileUID(uid); setShowUserProfile(true); }, []);
    const openPrivateChat = useCallback((friend) => { setChatFriend(friend); setShowPrivateChat(true); if (user) { const cId = [user.uid, friend.uid].sort().join('_'); setOpenChatId(cId); chatsCollection.doc(cId).update({ [`unread.${user.uid}`]: 0 }).catch(() => {}); } }, [user]);
    const closePrivateChat = useCallback(() => { setShowPrivateChat(false); setChatFriend(null); setOpenChatId(null); }, []);
    const handleSendRequest = useCallback(async (targetUid) => { if (!targetUid || !isLoggedIn) return; if (userData.friends?.includes(targetUid)) return; if (userData.friendRequests?.includes(targetUid)) return; await usersCollection.doc(targetUid).update({ friendRequests: firebase.firestore.FieldValue.arrayUnion(user.uid) }); await createNotification(targetUid, 'friend_request', `${userData.displayName} ${t.friendRequest}`, user.uid, userData.displayName); }, [userData, user, isLoggedIn, t, createNotification]);
    const handleAddFriendById = useCallback(async () => {
        if (!addFriendId.trim() || !isLoggedIn) return;
        setFriendSearchMsg('');
        try {
            const userQuery = await usersCollection.where('customId', '==', addFriendId.trim()).get();
            if (userQuery.empty) { setFriendSearchMsg(t.friendNotFound); return; }
            const targetUid = userQuery.docs[0].id;
            if (targetUid === user.uid) { setFriendSearchMsg(lang === 'ar' ? 'لا يمكنك إضافة نفسك' : 'Cannot add yourself'); return; }
            if (userData.friends?.includes(targetUid)) { setFriendSearchMsg(lang === 'ar' ? 'صديق بالفعل' : 'Already a friend'); return; }
            if (userData.friendRequests?.includes(targetUid)) { setFriendSearchMsg(lang === 'ar' ? 'لديك طلب من هذا المستخدم' : 'You have a request from this user'); return; }
            await handleSendRequest(targetUid);
            setFriendSearchMsg(t.requestSent);
            setAddFriendId('');
        } catch (e) { console.error('addFriend error:', e); setFriendSearchMsg(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
    }, [addFriendId, isLoggedIn, userData, user, t, lang, handleSendRequest]);
    const handleAcceptRequest = useCallback(async (fromUid) => {
        if (!user || !isLoggedIn) return;
        await usersCollection.doc(user.uid).update({ friends: firebase.firestore.FieldValue.arrayUnion(fromUid), friendRequests: firebase.firestore.FieldValue.arrayRemove(fromUid) });
        await usersCollection.doc(fromUid).update({ friends: firebase.firestore.FieldValue.arrayUnion(user.uid) });
        await createNotification(fromUid, 'friend_request_accepted', `${userData.displayName} ${lang === 'ar' ? 'قبل طلب صداقتك!' : 'accepted your friend request!'}`, user.uid, userData.displayName);
        setNotification(t.friendAdded);
        // ✅ Mission + Achievement
        await incrementMissionProgress('friendsAdded', 1);
        const updDoc = await usersCollection.doc(user.uid).get();
        if (updDoc.exists) await checkAndUnlockAchievements(updDoc.data());
    }, [user, isLoggedIn, t, userData, createNotification, lang]);
    const handleRejectRequest = useCallback(async (fromUid) => { if (!user || !isLoggedIn) return; await usersCollection.doc(user.uid).update({ friendRequests: firebase.firestore.FieldValue.arrayRemove(fromUid) }); }, [user, isLoggedIn]);

    // 🎁 GIFT FUNCTIONS — BATCHED (one write per step, parallel logs)
    const handleSendGiftToUser = useCallback(async (gift, targetUser, qty = 1, fromInventory = false, familyScopeId = null) => {
        if (!user || !isLoggedIn) return;
        const currency = userData?.currency || 0;
        const totalCost = fromInventory ? 0 : gift.cost * qty;

        // ✅ Currency check
        if (!fromInventory && currency < totalCost) {
            setNotification(lang === 'ar' ? '❌ رصيدك غير كافي' : '❌ Insufficient balance');
            return;
        }

        // ✅ Inventory: deduct ONE item (qty ignored for inventory sends)
        if (fromInventory) {
            const giftCounts = userData?.inventory?.giftCounts || {};
            const currentCount = giftCounts[gift.id] || 0;
            if (currentCount <= 0) {
                setNotification(lang === 'ar' ? '❌ ليس لديك هذه الهدية في المخزون' : '❌ Gift not in inventory');
                return;
            }
            const newCount = currentCount - 1;
            const invUpdates = { [`inventory.giftCounts.${gift.id}`]: newCount };
            if (newCount <= 0) invUpdates['inventory.gifts'] = firebase.firestore.FieldValue.arrayRemove(gift.id);
            try { await usersCollection.doc(user.uid).update(invUpdates); } catch(e) {}
        }

        const isSelfSend = !targetUser || targetUser.uid === 'self' || targetUser.uid === user.uid;
        const giftName = lang === 'ar' ? gift.name_ar : gift.name_en;

        // ✅ Pre-calculate bonuses for each send
        const bonuses = [];
        let totalBonus = 0;
        for (let i = 0; i < qty; i++) {
            const b = Math.floor(
                (gift.minBonus || 1) +
                Math.random() * ((gift.maxBonus || Math.floor(gift.cost * 0.1)) - (gift.minBonus || 1))
            );
            bonuses.push(b);
            totalBonus += b;
        }
        const totalCharisma = gift.charisma * qty;

        try {
            // ═══ STEP 1: Deduct sender (ONE write) ═══
            const senderUpdate = {
                currency:   firebase.firestore.FieldValue.increment(-totalCost),
                giftsSent:  firebase.firestore.FieldValue.increment(qty),
            };
            if (hasVIP(userData)) {
                senderUpdate['vip.xp'] = firebase.firestore.FieldValue.increment(getGiftVIPXP(gift) * qty);
            }
            await usersCollection.doc(user.uid).update(senderUpdate);

            // ═══ STEP 2: Credit receiver (ONE write) ═══
            const receiverUpdates = {
                charisma:      firebase.firestore.FieldValue.increment(totalCharisma),
                currency:      firebase.firestore.FieldValue.increment(totalBonus),
                giftsReceived: firebase.firestore.FieldValue.increment(qty),
            };
            if (isSelfSend) {
                // self-send: merge receiver update into same doc
                await usersCollection.doc(user.uid).update(receiverUpdates);
            } else {
                await usersCollection.doc(targetUser.uid).update(receiverUpdates);
            }

            // ═══ STEP 3: Parallel log writes ═══
            const parallelOps = [];

            // Gift logs (one per qty)
            for (let i = 0; i < qty; i++) {
                parallelOps.push(giftsLogCollection.add({
                    senderId:     user.uid,
                    senderName:   userData?.displayName || 'User',
                    senderPhoto:  userData?.photoURL || null,
                    receiverId:   isSelfSend ? user.uid : targetUser.uid,
                    receiverName: isSelfSend ? (userData?.displayName || 'User') : (targetUser.displayName || 'User'),
                    giftId:       gift.id,
                    giftName,
                    giftNameEn:   gift.name_en,
                    giftNameAr:   gift.name_ar,
                    giftEmoji:    gift.emoji,
                    giftImageUrl: gift.imageUrl || '',
                    charisma:     gift.charisma,
                    bonus:        bonuses[i],
                    cost:         gift.cost,
                    timestamp:    TS(),
                }));
            }

            // Chat message
            const chatMsgBase = {
                senderId:      user.uid,
                senderName:    userData?.displayName || 'User',
                senderPhoto:   userData?.photoURL || null,
                senderVipLevel: getVIPLevel(userData) || 0,
                type:          'gift',
                giftId:        gift.id,
                giftName,
                giftNameEn:    gift.name_en,
                giftNameAr:    gift.name_ar,
                giftEmoji:     gift.emoji,
                giftImageUrl:  gift.imageUrl || '',
                giftCharisma:  totalCharisma,
                giftBonus:     totalBonus,
                giftCost:      totalCost,
                giftQty:       qty,
                text:          `🎁 ${qty > 1 ? `×${qty} ` : ''}${lang === 'ar' ? 'أرسل هدية' : 'Sent a gift'}: ${gift.emoji}`,
                timestamp:     TS(),
            };

            if (isSelfSend) {
                const selfChatId  = `${user.uid}_self`;
                const selfChatRef = chatsCollection.doc(selfChatId);
                parallelOps.push(selfChatRef.set({
                    participants: [user.uid, user.uid],
                    type:         'self',
                    lastMessage:  `🎁 ${giftName}${qty > 1 ? ` ×${qty}` : ''}`,
                    lastAt:       TS(),
                }, { merge: true }));
                parallelOps.push(selfChatRef.collection('messages').add(chatMsgBase));
            } else {
                const chatId = [user.uid, targetUser.uid].sort().join('_');
                parallelOps.push(chatsCollection.doc(chatId).collection('messages').add(chatMsgBase));
                parallelOps.push(chatsCollection.doc(chatId).set({
                    members:                    [user.uid, targetUser.uid],
                    lastMessage:                `🎁 ${giftName}${qty > 1 ? ` ×${qty}` : ''}`,
                    timestamp:                  TS(),
                    [`unread.${targetUser.uid}`]: firebase.firestore.FieldValue.increment(1),
                }, { merge: true }));
                // Notification
                parallelOps.push(createNotification(
                    targetUser.uid,
                    'gift',
                    `${userData?.displayName || 'User'} ${t.sentAGift}: ${gift.emoji}${qty > 1 ? ` ×${qty}` : ''} (+${formatCharisma(totalCharisma)} ⭐, +${totalBonus} 🧠)`,
                    user.uid,
                    userData?.displayName || 'User',
                    { giftId: gift.id, giftEmoji: gift.emoji, giftName, charisma: totalCharisma, bonus: totalBonus, qty },
                ));
            }

            // Mission progress
            parallelOps.push(incrementMissionProgress('giftsSent', qty));

            // Family Activeness Bonus (50% of total Charisma)
            if (familyScopeId && totalCharisma > 0 && typeof familiesCollection !== 'undefined') {
                const famBonus = Math.floor(totalCharisma * 0.5);
                if (famBonus > 0) {
                    parallelOps.push(familiesCollection.doc(familyScopeId).update({
                        activeness: firebase.firestore.FieldValue.increment(famBonus),
                        weeklyActiveness: firebase.firestore.FieldValue.increment(famBonus)
                    }).catch(()=>{})); // Catch error silently so it doesn't break gift flow
                }
            }

            // ═══ STEP 4: Run all parallel ops ═══
            await Promise.all(parallelOps);

            // ── BFF gift points update (non-blocking, best-effort) ──
            if (!isSelfSend && typeof updateBFFGiftPoints === 'function') {
                updateBFFGiftPoints(user.uid, targetUser.uid, totalCharisma).catch(() => {});
            }

            // ✅ FIX: Guard Ranking — write charisma gift amount to guard_log
            // This populates the Guard Ranking on the receiver's profile
            if (!isSelfSend && typeof guardLogCollection !== 'undefined') {
                guardLogCollection.add({
                    receiverId:   targetUser.uid,
                    senderId:     user.uid,
                    senderName:   userData?.displayName || 'User',
                    senderPhoto:  userData?.photoURL || null,
                    amount:       totalCharisma,
                    charisma:     totalCharisma,
                    giftId:       gift.id,
                    qty,
                    timestamp:    TS(),
                }).catch(() => {});
            }

            // ✅ Notification toast
            setNotification(qty > 1 ? `🎁 ${t.giftSent} ×${qty}!` : `🎁 ${t.giftSent}!`);

            // ✅ Achievements check
            const updDoc = await usersCollection.doc(user.uid).get();
            if (updDoc.exists) await checkAndUnlockAchievements(updDoc.data());

        } catch(error) {
            console.error('Gift send error:', error);
            setNotification(lang === 'ar' ? '❌ خطأ في الإرسال، حاول مرة أخرى' : '❌ Send error, try again');
        }
    }, [userData, user, t, createNotification, lang, incrementMissionProgress, checkAndUnlockAchievements, isLoggedIn]);

    // Shop Functions
    const handlePurchase = useCallback(async (item, targetUser = null, qty = 1) => {
        if (!user || !isLoggedIn) { setShowLoginAlert(true); return; }
        const currency = userData?.currency || 0;
        if (currency < item.cost) { setNotification(t.purchaseFail); return; }
        const inventory = userData?.inventory || { frames: [], titles: [], themes: [], badges: [], gifts: [] };

        // ✅ VIP Gift Lock — حد أدنى من مستوى VIP
        if (item.vipMinLevel && item.vipMinLevel > 0) {
            const userVipLevel = getVIPLevel(userData);
            if (userVipLevel < item.vipMinLevel) {
                setNotification(lang === 'ar'
                    ? `🔒 يتطلب VIP ${item.vipMinLevel} على الأقل`
                    : `🔒 Requires VIP ${item.vipMinLevel}+`
                );
                return;
            }
        }

        // 🧧 Red Packets purchase
        if (item.type === 'red_packets') {
            try {
                await usersCollection.doc(user.uid).update({
                    currency: firebase.firestore.FieldValue.increment(-item.cost),
                    'inventory.red_packets': firebase.firestore.FieldValue.arrayUnion(item.id),
                });
                setNotification(lang === 'ar' ? '✅ تم شراء المغلف! موجود في حقيبتك' : '✅ Packet purchased! Check your inventory');
            } catch(e) { setNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
            return;
        }

        if (item.type === 'gifts' || item.type === 'gifts_vip') {
            // ✅ If targetUser is specified (send to friend) → direct send
            if (targetUser && targetUser.uid !== 'self' && targetUser.uid !== user?.uid) {
                await handleSendGiftToUser(item, targetUser, qty || 1);
                return;
            }
            // Buying for self → add to inventory with quantity counter
            const giftCounts = userData?.inventory?.giftCounts || {};
            const currentCount = giftCounts[item.id] || 0;
            try {
                const updateData = {
                    currency: firebase.firestore.FieldValue.increment(-item.cost),
                    'inventory.gifts': firebase.firestore.FieldValue.arrayUnion(item.id),
                    [`inventory.giftCounts.${item.id}`]: currentCount + 1,
                };
                // ✅ FIX 4: Store expiry timestamp for timed gifts (durationDays)
                if (item.durationDays && item.durationDays > 0) {
                    const expiresAt = Date.now() + item.durationDays * 86400000;
                    // Only set expiry if not already set (first purchase) or extend it
                    const existingExpiry = userData?.inventory?.expiry?.[item.id];
                    if (!existingExpiry || existingExpiry < Date.now()) {
                        updateData[`inventory.expiry.${item.id}`] = expiresAt;
                    }
                }
                await usersCollection.doc(user.uid).update(updateData);
                playSound('success');
                const giftName = lang === 'ar' ? item.name_ar : item.name_en;
                const timerMsg = item.durationDays
                    ? (lang === 'ar' ? ` (⏳ ${item.durationDays} أيام)` : ` (⏳ ${item.durationDays} days)`)
                    : '';
                setNotification(`🎁 ${giftName}${timerMsg} ${lang === 'ar' ? 'أُضيفت للمخزون!' : 'added to inventory!'}`);
            } catch (e) { setNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
            return;
        }

        // ✅ BFF Token purchase — stackable in inventory
        if (item.cardType !== undefined) {
            try {
                await usersCollection.doc(user.uid).update({
                    currency: firebase.firestore.FieldValue.increment(-item.cost),
                    'inventory.bff_tokens': firebase.firestore.FieldValue.arrayUnion(item.id),
                });
                playSound('success');
                const tokenName = lang === 'ar' ? item.name_ar : item.name_en;
                setNotification(`🤝 ${tokenName} ${lang === 'ar' ? 'أُضيف للمخزون!' : 'added to inventory!'}`);
            } catch (e) { setNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
            return;
        }

        if (inventory[item.type]?.includes(item.id)) {
            // If item already owned but has durationDays — extend/renew expiry
            if (item.durationDays && item.durationDays > 0) {
                try {
                    const existingExpiry = userData?.inventory?.expiry?.[item.id];
                    const baseTime = existingExpiry && existingExpiry > Date.now() ? existingExpiry : Date.now();
                    const newExpiry = baseTime + item.durationDays * 86400000;
                    await usersCollection.doc(user.uid).update({
                        currency: firebase.firestore.FieldValue.increment(-item.cost),
                        [`inventory.expiry.${item.id}`]: newExpiry,
                    });
                    playSound('success');
                    const itemName = lang === 'ar' ? item.name_ar : item.name_en;
                    setNotification(`✅ ${itemName} (⏳ +${item.durationDays} ${lang === 'ar' ? 'يوم' : 'days'})`);
                } catch(e) { setNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
                return;
            }
            setNotification(t.alreadyOwned);
            return;
        }
        try {
            const updateData = {
                currency: firebase.firestore.FieldValue.increment(-item.cost),
                [`inventory.${item.type}`]: firebase.firestore.FieldValue.arrayUnion(item.id),
            };
            // ✅ Fix 9: durationDays for ALL item types (frames, badges, titles, effects, etc.)
            if (item.durationDays && item.durationDays > 0) {
                updateData[`inventory.expiry.${item.id}`] = Date.now() + item.durationDays * 86400000;
            }
            await usersCollection.doc(user.uid).update(updateData);
            playSound('success');
            const itemName = lang === 'ar' ? item.name_ar : item.name_en;
            const timerMsg = item.durationDays ? ` (⏳ ${item.durationDays} ${lang === 'ar' ? 'يوم' : 'days'})` : '';
            setNotification(`${t.purchaseSuccess} ${itemName}${timerMsg}`);
        } catch (error) { setNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
    }, [user, userData, isLoggedIn, t, lang, handleSendGiftToUser]);

    // 👑 شراء VIP من الشوب
    const handleBuyVIP = useCallback(async () => {
        if (!user || !isLoggedIn) { setShowLoginAlert(true); return; }
        const VIP_SHOP_COST = 50000;
        const VIP_SHOP_XP   = 5000;   // XP الممنوحة فقط عند أول شراء
        const currency = userData?.currency || 0;
        if (currency < VIP_SHOP_COST) {
            setNotification(lang === 'ar' ? `❌ تحتاج ${VIP_SHOP_COST.toLocaleString()} 🧠` : `❌ Need ${VIP_SHOP_COST.toLocaleString()} 🧠`);
            return;
        }
        try {
            // ✅ هل هذه أول مرة يشتري فيها VIP؟ (XP يُعطى مرة واحدة فقط)
            const isFirstPurchase = !userData?.vip?.xp || userData.vip.xp === 0;

            // ✅ تمديد من تاريخ الانتهاء الحالي لو لسه نشط، غير كده من اليوم
            const now = new Date();
            const currentExpiry = userData?.vip?.expiresAt?.toDate ? userData.vip.expiresAt.toDate() : null;
            const baseDate = (userData?.vip?.isActive && currentExpiry && currentExpiry > now)
                ? new Date(currentExpiry.getTime())
                : new Date(now.getTime());
            baseDate.setDate(baseDate.getDate() + 30);

            const updates = {
                currency:            firebase.firestore.FieldValue.increment(-VIP_SHOP_COST),
                'vip.isActive':      true,
                'vip.expiresAt':     firebase.firestore.Timestamp.fromDate(baseDate),
                'vip.purchasedAt':   TS(),
            };

            if (isFirstPurchase) {
                // ✅ أول شراء: أضف XP وafItems الـ VIP 1
                updates['vip.xp'] = firebase.firestore.FieldValue.increment(VIP_SHOP_XP);
                const newLevel   = getVIPLevelFromXP(VIP_SHOP_XP);
                const levelCfg   = VIP_CONFIG.find(v => v.level === newLevel);
                const vipItems   = levelCfg?.vipItems || [];
                for (const item of vipItems) {
                    if (item.type === 'frames')  updates['inventory.frames']  = firebase.firestore.FieldValue.arrayUnion(item.id);
                    if (item.type === 'badges')  updates['inventory.badges']  = firebase.firestore.FieldValue.arrayUnion(item.id);
                    if (item.type === 'titles')  updates['inventory.titles']  = firebase.firestore.FieldValue.arrayUnion(item.id);
                }
            }
            // ❌ تجديد: بدون XP — فقط تمديد الأيام

            await usersCollection.doc(user.uid).update(updates);
            playSound('success');
            if (isFirstPurchase) {
                setNotification(lang === 'ar'
                    ? `👑 تم شراء VIP! +${VIP_SHOP_XP.toLocaleString()} XP — صالح 30 يوم`
                    : `👑 VIP Purchased! +${VIP_SHOP_XP.toLocaleString()} XP — Valid 30 days`
                );
            } else {
                setNotification(lang === 'ar'
                    ? `👑 تم تجديد VIP! +30 يوم إضافية`
                    : `👑 VIP Renewed! +30 days added`
                );
            }
        } catch(e) {
            setNotification(lang === 'ar' ? '❌ خطأ، حاول مرة أخرى' : '❌ Error, try again');
        }
    }, [user, userData, isLoggedIn, lang]);

    const handleEquip = useCallback(async (item) => {
        if (!user || !isLoggedIn) return;
        try {
            const equipped = userData?.equipped || { badges: [] };
            if (item.type === 'badges') {
                let currentBadges = equipped.badges || []; if (!Array.isArray(currentBadges)) currentBadges = currentBadges ? [currentBadges] : [];
                if (currentBadges.length >= MAX_BADGES) { setNotification(lang === 'ar' ? `الحد الأقصى ${MAX_BADGES} شارات` : `Maximum ${MAX_BADGES} badges`); return; }
                if (!currentBadges.includes(item.id)) currentBadges.push(item.id);
                await usersCollection.doc(user.uid).update({ equipped: { ...equipped, badges: currentBadges } });
            } else { await usersCollection.doc(user.uid).update({ equipped: { ...equipped, [item.type]: item.id } }); }
            playSound('click'); setNotification(lang === 'ar' ? 'تم التزيين!' : 'Equipped!');
        } catch (error) { }
    }, [user, userData, isLoggedIn, lang]);

    const handleUnequip = useCallback(async (type, itemId) => {
        if (!user || !isLoggedIn) return;
        try {
            const equipped = userData?.equipped || { badges: [] };
            if (type === 'badges') {
                let currentBadges = equipped.badges || []; if (!Array.isArray(currentBadges)) currentBadges = currentBadges ? [currentBadges] : [];
                currentBadges = currentBadges.filter(id => id !== itemId);
                await usersCollection.doc(user.uid).update({ equipped: { ...equipped, badges: currentBadges } });
            } else {
                const newEquipped = { ...equipped }; delete newEquipped[type];
                await usersCollection.doc(user.uid).update({ equipped: newEquipped });
            }
            playSound('click'); setNotification(lang === 'ar' ? 'تمت الإزالة!' : 'Unequipped!');
        } catch (error) { }
    }, [user, userData, isLoggedIn, lang]);

    // Computed Values
    const isMyTurn = useMemo(() => room?.currentTurnUID === currentUID, [room?.currentTurnUID, currentUID]);
    const me = useMemo(() => room?.players?.find(p => p.uid === currentUID), [room?.players, currentUID]);
    const myRole = me?.role;
    const isSpectator = me?.status === 'spectator' || me?.status === 'ghost';
    const hasVoted = room?.votes?.[currentUID];
    const hasVotedWord = room?.wordVotes?.[currentUID];
    const voteReq = room?.votingRequest;
    const hasIAgreed = voteReq?.votes?.[currentUID] === true;
    const hasIDeclined = voteReq?.votes?.[currentUID] === false;
    const totalFriendsUnread = useMemo(() => totalUnread + (friendRequests?.length || 0), [totalUnread, friendRequests]);
    const handleCopy = useCallback(() => { navigator.clipboard.writeText(roomId); setCopied(true); setTimeout(() => setCopied(false), 2000); }, [roomId]);
    const requireLogin = useCallback(() => { setShowLoginAlert(true); }, []);

    // RENDER
    if (authLoading) {
        return (
            <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(160deg,#060612,#0a0a1e)',flexDirection:'column',gap:'16px'}}>
                <div style={{fontSize:'48px',animation:'gw-float 2s ease-in-out infinite'}}>🕵️</div>
                <div style={{
                    width:'40px',height:'40px',borderRadius:'50%',
                    border:'3px solid rgba(0,242,255,0.15)',
                    borderTop:'3px solid #00f2ff',
                    animation:'spin 0.8s linear infinite'
                }}/>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes gw-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
            </div>
        );
    }

    // 🚫 BANNED USER SCREEN
    if (isLoggedIn && userData && isBannedUser(userData)) {
        return (
            <div style={{
                minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
                background:'linear-gradient(160deg,#1a0005,#0a000a,#060612)', flexDirection:'column',
                gap:'0', padding:'24px', textAlign:'center',
            }}>
                <canvas id="bg-canvas" style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',zIndex:0,opacity:0.3}}/>
                <div style={{ position:'relative', zIndex:1, maxWidth:'380px', width:'100%' }}>
                    {/* Red glow circle */}
                    <div style={{
                        width:'100px', height:'100px', borderRadius:'50%', margin:'0 auto 20px',
                        background:'rgba(220,0,0,0.15)', border:'3px solid rgba(239,68,68,0.6)',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:'48px',
                        boxShadow:'0 0 40px rgba(220,0,0,0.3), 0 0 80px rgba(220,0,0,0.1)',
                        animation:'ban-pulse 2s ease-in-out infinite',
                    }}>🚫</div>
                    <style>{`@keyframes ban-pulse{0%,100%{box-shadow:0 0 40px rgba(220,0,0,0.3),0 0 80px rgba(220,0,0,0.1)}50%{box-shadow:0 0 60px rgba(220,0,0,0.5),0 0 120px rgba(220,0,0,0.2)}}`}</style>
                    <h1 style={{ fontSize:'22px', fontWeight:900, color:'#f87171', marginBottom:'8px', letterSpacing:'0.5px' }}>
                        {lang === 'ar' ? '🔒 حسابك موقوف' : '🔒 Account Suspended'}
                    </h1>
                    <p style={{ fontSize:'13px', color:'#9ca3af', marginBottom:'20px', lineHeight:1.6 }}>
                        {lang === 'ar'
                            ? 'تم إيقاف حسابك من قِبَل الإدارة. لا يمكنك الدخول إلى اللعبة خلال هذه الفترة.'
                            : 'Your account has been suspended by the admin. You cannot access the game during this period.'}
                    </p>
                    {/* Ban details card */}
                    <div style={{
                        background:'linear-gradient(135deg,rgba(220,0,0,0.12),rgba(0,0,0,0.4))',
                        border:'1px solid rgba(239,68,68,0.35)', borderRadius:'14px', padding:'16px 18px',
                        textAlign: lang==='ar'?'right':'left', marginBottom:'20px',
                    }}>
                        {userData?.ban?.reason && (
                            <div style={{ marginBottom:'8px' }}>
                                <span style={{ fontSize:'10px', color:'#6b7280', fontWeight:700, display:'block', marginBottom:'2px' }}>
                                    {lang === 'ar' ? 'سبب الإيقاف' : 'REASON'}
                                </span>
                                <span style={{ fontSize:'13px', color:'#fca5a5', fontWeight:700 }}>{userData.ban.reason}</span>
                            </div>
                        )}
                        <div>
                            <span style={{ fontSize:'10px', color:'#6b7280', fontWeight:700, display:'block', marginBottom:'2px' }}>
                                {lang === 'ar' ? 'ينتهي الإيقاف' : 'SUSPENSION ENDS'}
                            </span>
                            <span style={{ fontSize:'13px', color: userData?.ban?.expiresAt ? '#fbbf24' : '#f87171', fontWeight:900 }}>
                                {formatBanExpiry(userData, lang)}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => auth.signOut()}
                        style={{
                            padding:'11px 28px', borderRadius:'12px', fontSize:'13px', fontWeight:800, cursor:'pointer',
                            background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)',
                            color:'#9ca3af', letterSpacing:'0.3px',
                        }}
                    >
                        {lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-shell" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {/* Background blobs */}
            <div className="bg-blobs">
                <div className="bg-blob-item bg-blob-1"></div>
                <div className="bg-blob-item bg-blob-2"></div>
                <div className="bg-blob-item bg-blob-3"></div>
            </div>
            <NotificationToast message={notification} onClose={() => setNotification(null)} />

            {showOnboarding && (
                <OnboardingModal
                    show={showOnboarding}
                    googleUser={onboardingGoogleUser}
                    onComplete={handleOnboardingComplete}
                    lang={lang}
                />
            )}


            {showLoginAlert && !isLoggedIn && (
                <div className="modal-overlay" onClick={() => setShowLoginAlert(false)}>
                    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '320px' }}>
                        <div className="modal-header"><h2 className="modal-title">{t.loginRequired}</h2><ModalCloseBtn onClose={() => setShowLoginAlert(false)} /></div>
                        <div className="modal-body text-center">
                            <div className="text-4xl mb-4">🔐</div>
                            <p className="text-sm text-gray-300 mb-4">{t.guestDesc}</p>
                            <button onClick={() => { setShowLoginAlert(false); handleGoogleLogin(); }} className="btn-google w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />{t.loginGoogle}</button>
                        </div>
                    </div>
                </div>
            )}

            <TutorialModal show={showTutorial} onClose={() => { setShowTutorial(false); localStorage.setItem('pro_spy_tutorial_v2', 'true'); }} lang={lang} />
            <LoginRewards show={showLoginRewards} onClose={() => setShowLoginRewards(false)} userData={userData} onClaim={handleClaimLoginReward} lang={lang} onOpenInventory={() => { setShowLoginRewards(false); setShowInventory(true); }} />

            {showSummary && room && (
                <div className="modal-overlay" onClick={() => setShowSummary(false)}>
                    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2 className="modal-title">{t.summaryTitle}</h2><ModalCloseBtn onClose={() => setShowSummary(false)} /></div>
                        <div className="modal-body text-center">
                            <div className="text-4xl mb-3">{room.status === 'finished_spy_caught' ? '🎉' : room.status === 'finished_mrwhite_wins' ? '👻' : '🕵️'}</div>
                            <h2 className="text-xl font-bold mb-3">{room.status === 'finished_spy_caught' ? t.agentsWin : room.status === 'finished_mrwhite_wins' ? t.mrWhiteWin : t.spyWin}</h2>
                            {room.chosenWord && <div className="text-xs text-cyan-400 mb-3">🔑 {t.selectedWord}: <strong>{room.chosenWord}</strong></div>}
                            <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'10px',padding:'10px',marginBottom:'8px',textAlign:'left'}}>
                                <div className="text-xs font-bold text-gray-300 mb-2">📋 {t.rolesRevealTitle}</div>
                                {room.players.filter(p => p.role).map(p => (
                                    <div key={p.uid} className="flex items-center justify-between gap-2 mb-1" style={{fontSize:'11px'}}>
                                        <span className="text-gray-300 truncate">{p.name}{p.uid===currentUID?' (You)':''}</span>
                                        <span style={{color:p.role==='spy'?'#ef4444':p.role==='mrwhite'?'#8b5cf6':p.role==='informant'?'#a78bfa':'#10b981',fontWeight:700,flexShrink:0}}>
                                            {p.role==='spy'?'🕵️ '+t.statusSpy:p.role==='mrwhite'?'👻 '+t.statusMrWhite:p.role==='informant'?'👁️ '+t.statusInformant:'🤵 '+t.statusAgent}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">{room.admin === currentUID && (<button onClick={resetGame} className="btn-neon w-full py-2 rounded-lg text-sm font-bold mb-2">{t.playAgain}</button>)}<button onClick={handleLeaveRoom} className="btn-ghost w-full py-2 rounded-lg text-sm">{t.leaveRoom}</button></div>
                    </div>
                </div>
            )}

            <ShopModal show={showShop} onClose={() => setShowShop(false)} userData={isLoggedIn ? userData : guestData} lang={lang} onPurchase={handlePurchase} onEquip={handleEquip} onUnequip={handleUnequip} onBuyVIP={handleBuyVIP} onOpenInventory={() => { setShowShop(false); setShowInventory(true); }} currentUID={currentUID} onPropose={(ring) => { setProposalRing(ring); setShowShop(false); setShowProposalModal(true); }} coupleData={coupleData} onOpenCoupleCard={() => { setShowShop(false); setShowCoupleCard(true); }} />
            <InventoryModal show={showInventory} onClose={() => setShowInventory(false)} userData={isLoggedIn ? userData : guestData} lang={lang} onEquip={handleEquip} onUnequip={handleUnequip} onSendGift={(gift, target) => handleSendGiftToUser(gift, target, 1, true)} friendsData={friendsData} isLoggedIn={isLoggedIn} currentUserData={currentUserData} user={user} coupleData={coupleData} onOpenCoupleCard={() => { setShowInventory(false); setShowCoupleCard(true); }} onPropose={(ring) => { setProposalRing(ring); setShowInventory(false); setShowProposalModal(true); }} />
            <SettingsModal show={showSettings} onClose={() => setShowSettings(false)} lang={lang} onSetLang={(nl) => { setLang(nl); localStorage.setItem('pro_spy_lang', nl); if(user) usersCollection.doc(user.uid).update({lang:nl}).catch(()=>{}); }} userData={userData} user={user} onNotification={setNotification} isGuest={isGuest} onLoginGoogle={handleGoogleLogin} onOpenAdminPanel={() => setShowAdminPanel(true)} />

            {/* 👑 VIP Center Modal */}
            {showVIPCenter && (
                <VIPCenterModal
                    show={showVIPCenter}
                    onClose={() => setShowVIPCenter(false)}
                    userData={userData}
                    user={user}
                    lang={lang}
                    onNotification={setNotification}
                    onOpenShop={() => { setShowVIPCenter(false); setShowShop(true); }}
                />
            )}

            {/* 💬 Help Center Modal */}
            {showHelpCenter && (
                <HelpCenterModal
                    show={showHelpCenter}
                    onClose={() => setShowHelpCenter(false)}
                    user={user}
                    userData={userData}
                    lang={lang}
                    onNotification={setNotification}
                    isLoggedIn={isLoggedIn}
                />
            )}

            {/* 🌍 Public Chat Modal */}
            {showPublicChat && (
                <PublicChatModal
                    show={showPublicChat}
                    onClose={() => setShowPublicChat(false)}
                    currentUser={userData}
                    user={user}
                    lang={lang}
                    onNotification={setNotification}
                    isLoggedIn={isLoggedIn}
                    onOpenProfile={(uid) => { setTargetProfileUID(uid); setShowUserProfile(true); }}
                    currentUID={currentUID}
                />
            )}

            {/* 💒 Wedding Hall Modal */}
            <WeddingHallModal
                show={showWeddingHall}
                onClose={() => setShowWeddingHall(false)}
                lang={lang}
                currentUID={currentUID}
                currentUserData={userData}
                coupleData={coupleData}
                partnerData={partnerData}
                onOpenPropose={() => { setShowWeddingHall(false); setShowShop(true); }}
                onOpenCoupleCard={() => { setShowWeddingHall(false); setShowCoupleCard(true); }}
                onDivorce={() => {}}
                onNotification={setNotification}
            />

            {/* 💍 Proposal Modal */}
            <ProposalModal
                show={showProposalModal}
                onClose={() => setShowProposalModal(false)}
                ring={proposalRing}
                currentUserData={userData}
                currentUID={currentUID}
                lang={lang}
                onSend={handleSendProposal}
                friendsData={friendsData}
            />

            {/* 💑 Couple Card Modal */}
            <CoupleCardModal
                show={showCoupleCard}
                onClose={() => setShowCoupleCard(false)}
                coupleDoc={coupleData}
                currentUID={currentUID}
                selfData={userData}
                partnerData={partnerData}
                lang={lang}
                onNotification={setNotification}
                currentUserData={userData}
                onOpenProfile={(uid) => { setShowCoupleCard(false); setTargetProfileUID(uid); setShowUserProfile(true); }}
            />

            {/* 💌 Incoming Proposal Modal */}
            <IncomingProposalModal
                show={showIncomingProposal}
                coupleDoc={incomingProposal}
                fromData={incomingProposalFrom}
                currentUID={currentUID}
                lang={lang}
                onAccept={handleAcceptProposal}
                onDecline={handleDeclineProposal}
            />

            {/* 🛡️ Admin Panel */}
            <AdminPanel
                show={showAdminPanel}
                onClose={() => setShowAdminPanel(false)}
                currentUser={user}
                currentUserData={userData}
                lang={lang}
                onOpenProfile={(uid) => { setShowAdminPanel(false); openProfile(uid); }}
            />

            {/* 📸 Friends Moments Modal */}
            {showFriendsMoments && (
                <FriendsMomentsModal
                    show={showFriendsMoments}
                    onClose={() => setShowFriendsMoments(false)}
                    currentUser={user}
                    currentUserData={currentUserData}
                    currentUID={currentUID}
                    friendsData={friendsData}
                    lang={lang}
                    onOpenProfile={(uid) => { setShowFriendsMoments(false); openProfile(uid); }}
                />
            )}

            {/* 🏠 Family Modal */}
            {showFamilyModal && (
                <FamilyModal
                    show={showFamilyModal}
                    onClose={() => { setShowFamilyModal(false); setViewFamilyId(null); }}
                    currentUser={user}
                    currentUserData={currentUserData}
                    currentUID={currentUID}
                    lang={lang}
                    isLoggedIn={isLoggedIn}
                    onNotification={setNotification}
                    viewFamilyId={viewFamilyId}
                    onSendGift={handleSendGiftToUser}
                    userData={currentUserData}
                    onOpenChat={() => { setShowFamilyModal(false); setViewFamilyId(null); setTimeout(() => setShowFamilyChat(true), 100); }}
                />
            )}

            {/* Family Chat (from friends list) */}
            {showFamilyChat && userFamily && (
                <FamilyChatModal
                    show={showFamilyChat}
                    onClose={() => setShowFamilyChat(false)}
                    familyId={userFamily.id}
                    familyData={userFamily}
                    currentUID={currentUID}
                    currentUserData={currentUserData}
                    lang={lang}
                    onOpenFamily={() => { setShowFamilyChat(false); setShowFamilyModal(true); }}
                    onSendGift={handleSendGiftToUser}
                    userData={currentUserData}
                    onNotification={setNotification}
                    onOpenProfile={(uid) => { setShowFamilyChat(false); setTimeout(() => { setTargetProfileUID(uid); setShowUserProfile(true); }, 80); }}
                />
            )}

            {/* 🤝 BFF Modal */}
            {showBFFModal && (
                <BFFModal
                    show={showBFFModal}
                    onClose={() => setShowBFFModal(false)}
                    lang={lang}
                    currentUID={currentUID}
                    currentUserData={currentUserData}
                    onNotification={setNotification}
                    friendsData={friendsData}
                    coupleData={coupleData}
                    couplePartnerData={partnerData}
                />
            )}

            {/* 🕵️ Detective Bot Chat */}
            {showDetectiveBot && (
                <BotChatModal
                    show={showDetectiveBot}
                    onClose={() => setShowDetectiveBot(false)}
                    botId="detective_bot"
                    currentUID={currentUID}
                    currentUserData={currentUserData}
                    lang={lang}
                />
            )}

            {/* 💌 Love Bot Chat */}
            {showLoveBot && (
                <BotChatModal
                    show={showLoveBot}
                    onClose={() => setShowLoveBot(false)}
                    botId="love_bot"
                    currentUID={currentUID}
                    currentUserData={currentUserData}
                    lang={lang}
                    onOpenWeddingHall={(tab) => { setShowLoveBot(false); setShowWeddingHall(true); }}
                    onOpenBFFModal={(tab) => { setShowLoveBot(false); setShowBFFModal(true); setBffInitialTab(tab || 'requests'); }}
                />
            )}

            {showMyAccount && currentUID && (
                <ProfileV11
                    show={showMyAccount}
                    onClose={() => setShowMyAccount(false)}
                    targetUID={currentUID}
                    lang={lang}
                    currentUserUID={currentUID}
                    onSendFriendRequest={handleSendRequest}
                    onSendGift={handleSendGiftToUser}
                    userData={currentUserData}
                    currentUserFriends={userData?.friends}
                    currentUserFriendRequests={userData?.friendRequests}
                    friendsData={friendsData}
                    isOwnProfileOverride={true}
                    onOpenSettings={() => { setShowMyAccount(false); setShowSettings(true); }}
                    onOpenShop={() => { setShowMyAccount(false); setShowShop(true); }}
                    onOpenInventory={() => { setShowMyAccount(false); setShowInventory(true); }}
                    onLogout={handleLogout}
                    onLoginGoogle={() => { setShowMyAccount(false); handleGoogleLogin(); }}
                    isLoggedIn={isLoggedIn}
                    isGuest={isGuest}
                    sessionClaimedToday={sessionClaimedToday}
                    onOpenLoginRewards={() => { if(!sessionClaimedToday) setShowLoginRewards(true); }}
                    currency={currentUserData?.currency || 0}
                    onOpenProfile={(uid) => { setShowMyAccount(false); openProfile(uid); }}
                    onOpenMarriage={() => { setShowMyAccount(false); setShowWeddingHall(true); }}
                    onOpenFamily={(fid) => { setShowMyAccount(false); setViewFamilyId(fid || null); setShowFamilyModal(true); }}
                    onOpenBFFModal={() => { setShowMyAccount(false); setShowBFFModal(true); }}
                    onNotification={setNotification}
                    onOpenChat={(target) => {
                        setShowMyAccount(false);
                        if (target === 'self') {
                            setShowSelfChat(true);
                        } else {
                            openPrivateChat(target);
                        }
                    }}
                />
            )}

            <ProfileV11
                show={showUserProfile}
                onClose={() => setShowUserProfile(false)}
                targetUID={targetProfileUID}
                lang={lang}
                currentUserUID={currentUID}
                onSendFriendRequest={handleSendRequest}
                onSendGift={handleSendGiftToUser}
                userData={currentUserData}
                currentUserFriends={userData?.friends}
                currentUserFriendRequests={userData?.friendRequests}
                friendsData={friendsData}
                isGuest={isGuest}
                currentViewerData={userData}
                onOpenProfile={(uid) => { setTargetProfileUID(uid); setShowUserProfile(true); }}
                onOpenFamily={(fid) => { setShowUserProfile(false); setViewFamilyId(fid || null); setShowFamilyModal(true); }}
                onNotification={setNotification}
                onOpenChat={(friendData) => {
                    openPrivateChat(friendData);
                    setShowUserProfile(false);
                }}
            />
            <BrowseRoomsModal show={showBrowseRooms} onClose={() => setShowBrowseRooms(false)} onJoin={handleJoinGame} nickname={nickname} currentUID={currentUID} currentUserData={currentUserData} lang={lang} />

            {showPrivateChat && chatFriend && user && (
                <PrivateChatModal
                    show={showPrivateChat}
                    onClose={closePrivateChat}
                    friend={chatFriend}
                    currentUser={currentUserData}
                    user={user}
                    lang={lang}
                    onSendNotification={createNotification}
                    onSendGift={handleSendGiftToUser}
                    currency={userData?.currency || 0}
                    friendsData={friendsData}
                    onOpenProfile={openProfile}
                />
            )}

            {showSelfChat && user && (
                <SelfChatModal
                    show={showSelfChat}
                    onClose={() => setShowSelfChat(false)}
                    currentUser={currentUserData}
                    userData={currentUserData}
                    lang={lang}
                    currency={userData?.currency || 0}
                />
            )}

            {showFunPass && (
                <FunPassModal
                    show={showFunPass}
                    onClose={() => setShowFunPass(false)}
                    userData={userData || currentUserData}
                    user={user}
                    lang={lang}
                    onNotification={setNotification}
                    onOpenInventory={() => { setShowFunPass(false); setShowInventory(true); }}
                />
            )}

            {alertMessage && (<div className="alert-modal" onClick={() => setAlertMessage(null)}><div className="modal-content animate-pop" onClick={e => e.stopPropagation()}><div className="modal-header"><span></span><ModalCloseBtn onClose={() => setAlertMessage(null)} /></div><div className="modal-body text-center"><div className="text-2xl mb-2">🚫</div><p className="font-bold mb-4">{alertMessage}</p><button onClick={() => setAlertMessage(null)} className="btn-ghost px-4 py-2 rounded-lg text-sm">{t.ok}</button></div></div></div>)}

            {showSetupModal && (
                <div className="modal-overlay" onClick={()=>setShowSetupModal(false)}>
                    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2 className="modal-title">{t.create}</h2><ModalCloseBtn onClose={() => setShowSetupModal(false)} /></div>
                        <div className="modal-body">
                            <div className="space-y-3">
                                <div><label className="text-[10px] text-gray-400 block mb-1">{t.nickname}</label><input className="input-dark w-full p-2 rounded font-bold text-sm" value={nickname} onChange={e => { setNickname(e.target.value); localStorage.setItem('pro_spy_nick', e.target.value); }} placeholder={t.nickname} /></div>
                                <div className="flex gap-2"><button onClick={() => setSetupMode('normal')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${setupMode === 'normal' ? 'btn-neon' : 'btn-ghost'}`}>{t.normalMode}</button><button onClick={() => setSetupMode('advanced')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${setupMode === 'advanced' ? 'btn-neon' : 'btn-ghost'}`}>{t.advancedMode}</button></div>
                                <p className="text-[10px] text-gray-400 text-center">{setupMode === 'normal' ? t.modeNormalDesc : t.modeAdvDesc}</p>
                                <div className="flex items-center gap-2"><input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} id="privateCheck" /><label htmlFor="privateCheck" className="text-xs">{t.privateRoom}</label></div>
                                {isPrivate && (<div className="relative"><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={t.password} className="input-dark w-full p-2 pr-10 rounded text-sm" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? '🙈' : '👁️'}</button></div>)}
                            </div>
                        </div>
                        <div className="modal-footer"><button onClick={handleCreateGame} disabled={loading || !nickname.trim()} className="btn-neon w-full py-2 rounded-lg text-sm font-bold">{loading ? t.loading : t.create}</button></div>
                    </div>
                </div>
            )}

            {/* ── NEW HEADER ── */}
            <header className="new-header">
                <div className="new-logo">PRO SPY</div>
                <div className="new-header-right">
                    {/* 🧠 Intel (currency) pill — always visible when logged in */}
                    {(isLoggedIn || isGuest) && currentUserData && (
                        <div
                            onClick={() => setShowShop(true)}
                            style={{
                                display:'flex', alignItems:'center', gap:'4px',
                                padding:'4px 10px', borderRadius:'20px', cursor:'pointer',
                                background:'linear-gradient(135deg,rgba(0,242,255,0.12),rgba(112,0,255,0.10))',
                                border:'1px solid rgba(0,242,255,0.25)',
                                boxShadow:'0 0 8px rgba(0,242,255,0.12)',
                                transition:'all 0.2s',
                            }}
                            title={lang==='ar'?'رصيدك':'Your Intel'}
                        >
                            <span style={{fontSize:'14px'}}>🧠</span>
                            <span style={{fontSize:'12px',fontWeight:900,color:'#00f2ff',letterSpacing:'0.3px'}}>
                                {fmtNum(currentUserData?.currency||0)}
                            </span>
                        </div>
                    )}
                    {/* Login Rewards */}
                    {isLoggedIn && (
                        <button className="new-hbtn" onClick={() => { if(!sessionClaimedToday) setShowLoginRewards(true); }}
                            title={lang==='ar'?'مكافآت الدخول':'Login Rewards'}
                            style={{position:'relative', opacity: sessionClaimedToday ? 0.5 : 1}}>
                            🎁
                            {!sessionClaimedToday && <span style={{position:'absolute',top:'-3px',right:'-3px',width:'8px',height:'8px',background:'#f97316',borderRadius:'50%',border:'1.5px solid var(--bg-main)'}}></span>}
                        </button>
                    )}
                    {/* Notifications */}
                    {isLoggedIn && (
                        <div className="new-notif-center notification-center" ref={notificationBellRef}>
                            <div className="new-notif-bell notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
                                🔔{unreadNotifications > 0 && <span className="notification-badge">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>}
                            </div>
                            <NotificationDropdown show={showNotifications} onClose={() => setShowNotifications(false)} notifications={notifications} onMarkRead={markNotificationRead} onClearAll={clearAllNotifications} onNotificationClick={handleNotificationClick} lang={lang} />
                        </div>
                    )}
                    {/* Shop */}
                    {isLoggedIn && (
                        <div className="new-hbtn" onClick={() => setShowShop(true)} title={t.shop}>🛒</div>
                    )}
                    {/* Avatar — opens profile (logged-in) or guest menu */}
                    <div style={{position:'relative'}}>
                        <div className="new-avatar-btn"
                            onClick={() => {
                                if (isLoggedIn) { setShowMyAccount(true); }
                                else if (isGuest) { setShowMyAccount(true); }
                                else { handleGoogleLogin(); }
                            }}
                            title={lang==='ar'?'ملفي الشخصي':'My Profile'}>
                            {(isLoggedIn || isGuest) && (currentUserData?.photoURL || currentUserData?.photo)
                                ? <img src={currentUserData.photoURL || currentUserData.photo} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} alt="" />
                                : <span style={{fontSize:'16px'}}>😎</span>
                            }
                        </div>

                    </div>
                </div>
            </header>

            {/* ── NEW PAGE CONTENT ── */}
            <div className="new-page-content">

            {/* ── LOBBY / LEADERBOARD / FRIENDS / EXPLORE views ── */}
            {!room && (
                <>
                    {/* ══ LOBBY / RANKING TABS ══ */}
                    {(activeView === 'lobby' || activeView === 'ranking') && (
                        <div style={{
                            display:'flex', gap:'4px', padding:'10px 16px 0', marginBottom:'2px',
                            borderBottom:'1px solid rgba(255,255,255,0.06)',
                        }}>
                            <button
                                onClick={() => setActiveView('lobby')}
                                style={{
                                    flex:1, padding:'9px 0', borderRadius:'10px 10px 0 0', border:'none',
                                    background: activeView==='lobby' ? 'rgba(0,242,255,0.1)' : 'rgba(255,255,255,0.03)',
                                    color: activeView==='lobby' ? '#00f2ff' : '#6b7280',
                                    borderBottom: activeView==='lobby' ? '2px solid #00f2ff' : '2px solid transparent',
                                    fontSize:'12px', fontWeight:700, cursor:'pointer', transition:'all 0.2s',
                                }}
                            >🏠 {lang==='ar' ? 'اللوبي' : 'Lobby'}</button>
                            <button
                                onClick={() => setActiveView('ranking')}
                                style={{
                                    flex:1, padding:'9px 0', borderRadius:'10px 10px 0 0', border:'none',
                                    background: activeView==='ranking' ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.03)',
                                    color: activeView==='ranking' ? '#ffd700' : '#6b7280',
                                    borderBottom: activeView==='ranking' ? '2px solid #ffd700' : '2px solid transparent',
                                    fontSize:'12px', fontWeight:700, cursor:'pointer', transition:'all 0.2s',
                                }}
                            >📊 {lang==='ar' ? 'رانكينج' : 'Ranking'}</button>
                        </div>
                    )}

                    {/* ══ LOBBY VIEW ══ */}
                    {activeView === 'lobby' && (
                        <div style={{paddingBottom:'8px'}}>
                            {/* Stats Strip */}
                            {(isLoggedIn || isGuest) && currentUserData && (
                                <>
                                    <div className="sec-head-new">
                                        <span className="sec-title-new">{lang==='ar' ? `مرحباً، ${currentUserData.displayName || currentUserData.name || ''}` : `Hi, ${currentUserData.displayName || currentUserData.name || ''}`} 👋</span>
                                        <button className="sec-action-new" onClick={() => setShowMyAccount(true)}>{lang==='ar'?'ملفي':'Profile'}</button>
                                    </div>
                                    <div className="stats-strip-new">
                                        <div className="stat-pill-new"><span>🏆</span><span className="sval">{currentUserData?.stats?.wins || 0}</span><span>{lang==='ar'?'انتصار':t.wins}</span></div>
                                        <div className="stat-pill-new" style={{cursor:'pointer'}} onClick={() => setShowMyAccount(true)}>
                                            {(() => {
                                                const ch = currentUserData?.charisma || 0;
                                                const { currentLevel } = getCharismaLevel(ch);
                                                return currentLevel?.iconUrl
                                                    ? <img src={currentLevel.iconUrl} alt="" style={{width:'18px',height:'18px',objectFit:'contain', filter: currentLevel.hasGlow?`drop-shadow(0 0 4px ${currentLevel.color})`:'none'}} />
                                                    : <span style={{color: currentLevel?.color||'#ffd700'}}>⭐</span>;
                                            })()}
                                            <span className="sval gold">{fmtNum(currentUserData?.charisma||0)}</span>
                                            <span>{lang==='ar'?'كاريزما':'Charisma'}</span>
                                        </div>
                                        <div className="stat-pill-new"><span>🔥</span><span className="sval green">{currentUserData?.loginRewards?.streak || 0}</span><span>Streak</span></div>
                                    </div>
                                </>
                            )}

                            {/* Fun Pass Promo */}
                            <div className="fp-promo-new" onClick={() => { if(isLoggedIn) setShowFunPass(true); else requireLogin(); }}>
                                <div className="fp-promo-emoji">🎟️</div>
                                <div className="fp-promo-body">
                                    <div className="fp-promo-title">{lang==='ar'?'Fun Pass — الموسم الجديد!':'Fun Pass — New Season!'}</div>
                                    <div className="fp-promo-sub">{lang==='ar'?'أكمل المهام واكسب مكافآت حصرية':'Complete tasks and earn exclusive rewards'}</div>
                                </div>
                                <div className="fp-promo-arr">→</div>
                            </div>

                            {/* Lobby Hero */}
                            <div className="sec-head-new"><span className="sec-title-new">{lang==='ar'?'العب دلوقتي':t.tabLobby}</span></div>
                            <div className="lobby-hero-new">
                                <div className="hero-label-new">{lang==='ar'?'ابدأ أو انضم لأوضة':t.codePlaceholder}</div>
                                <div className="hero-title-new">{lang==='ar'?'أنت الجاسوس؟':'Are You the Spy?'}</div>
                                {isGuest && <GuestBanner lang={lang} />}
                                <div className="hero-input-row">
                                    <input className="hero-input" value={nickname} onChange={e => { setNickname(e.target.value); localStorage.setItem('pro_spy_nick', e.target.value); }} placeholder={t.nickname} />
                                    <button className="hero-btn-primary" onClick={() => setShowSetupModal(true)} disabled={!nickname.trim()}>+ {t.create}</button>

                                </div>
                                <div className="hero-join-row">
                                    <input className="hero-input hero-code-input" style={{flex:1}} value={inputCode} onChange={e => setInputCode(e.target.value.toUpperCase())} placeholder={t.codePlaceholder} maxLength={6} />
                                    <button className="hero-btn-primary" onClick={() => handleJoinGame(inputCode, '')} disabled={loading || !inputCode.trim() || !nickname.trim()}>{loading ? '...' : t.join}</button>
                                </div>
                                {joinError && <p style={{fontSize:'11px',color:'#ff4d4d',textAlign:'center',marginTop:'6px'}}>{joinError}</p>}
                            </div>

                            {/* Active Rooms */}
                            <div className="sec-head-new">
                                <span className="sec-title-new">🟢 {lang==='ar'?'الأوض المفتوحة':'Open Rooms'}</span>
                                <button className="sec-action-new" onClick={() => setShowBrowseRooms(true)}>{lang==='ar'?'الكل':'All'}</button>
                            </div>
                            <div className="rooms-scroll-new">
                                <div className="room-card-new" onClick={() => setShowBrowseRooms(true)}>
                                    <div className="rc-mode">🕵️</div>
                                    <div className="rc-name">{lang==='ar'?'تصفّح الأوض':'Browse Rooms'}</div>
                                    <div className="rc-info" style={{color:'var(--primary)',marginTop:'6px',fontSize:'11px'}}>→ {lang==='ar'?'عرض الكل':'View all'}</div>
                                </div>
                                <div className="room-card-new" onClick={() => setShowSetupModal(true)} style={{border:'1px dashed rgba(0,242,255,0.3)'}}>
                                    <div className="rc-mode">➕</div>
                                    <div className="rc-name">{t.create}</div>
                                    <div className="rc-info" style={{marginTop:'6px',fontSize:'10px',color:'var(--text-muted)'}}>{lang==='ar'?'أوضة جديدة':'New room'}</div>
                                </div>
                            </div>

                            {/* Daily Tasks */}
                            {isLoggedIn && userData && (
                                <>
                                    <div className="sec-head-new">
                                        <span className="sec-title-new">📦 {lang==='ar'?'مهام اليوم':'Daily Tasks'}</span>
                                    </div>
                                    <div style={{margin:'0 16px', padding:'16px', background:'linear-gradient(135deg,rgba(0,242,255,0.05),rgba(112,0,255,0.04))', borderRadius:'14px', border:'1px solid rgba(0,242,255,0.12)'}}>
                                        <DailyTasksComponent
                                            userData={userData}
                                            user={user}
                                            lang={lang}
                                            onClaim={() => {}}
                                            onNotification={setNotification}
                                        />
                                    </div>
                                </>
                            )}

                            {/* ── 🌍 INLINE PUBLIC CHAT in Lobby ── */}
                            <div className="sec-head-new" style={{marginTop:'8px'}}>
                                <span className="sec-title-new">🌍 {lang==='ar'?'الشات العام':'Public Chat'}</span>
                                <button className="sec-action-new" onClick={() => setShowPublicChat(true)}>{lang==='ar'?'فتح':'Open'}</button>
                            </div>
                            <div style={{overflowX:'hidden',width:'100%',boxSizing:'border-box',contain:'layout'}}>
                            <LobbyPublicChatBox
                                currentUser={isLoggedIn ? userData : null}
                                user={user}
                                lang={lang}
                                isLoggedIn={isLoggedIn}
                                onOpenProfile={(uid) => { setTargetProfileUID(uid); setShowUserProfile(true); }}
                                currentUID={currentUID}
                                onOpenFull={() => setShowPublicChat(true)}
                            />
                            </div>
                        </div>
                    )}

                    {/* ══ RANKING VIEW ══ */}
                    {activeView === 'ranking' && (
                        <div style={{paddingBottom:'8px'}}>
                            {/* Tabs */}
                            <div className="lb-tabs-new" style={{margin:'12px 16px 0'}}>
                                <button className={`lb-tab-new ${leaderboardTab==='wins'?'active':''}`} onClick={() => setLeaderboardTab('wins')}>🏆 {t.wins}</button>
                                <button className={`lb-tab-new ${leaderboardTab==='charisma'?'active':''}`} onClick={() => setLeaderboardTab('charisma')}>⭐ {t.charismaRank}</button>
                                <button className={`lb-tab-new ${leaderboardTab==='family'?'active':''}`} onClick={() => setLeaderboardTab('family')}>🏠 {lang==='ar'?'عائلة':'Family'}</button>
                            </div>
                            {/* Family Rank */}
                            {leaderboardTab === 'family' && (() => {
                                const data = familyLeaderboard;
                                const top3 = data.slice(0, 3);
                                const rest = data.slice(3);
                                return (
                                    <>
                                        {top3.length > 0 && (
                                            <div className="podium-new">
                                                {[
                                                    top3[1] ? {p:top3[1], cls:'ps-2', medal:'🥈'} : null,
                                                    top3[0] ? {p:top3[0], cls:'ps-1', medal:'👑', crown:true} : null,
                                                    top3[2] ? {p:top3[2], cls:'ps-3', medal:'🥉'} : null,
                                                ].filter(Boolean).map((slot, i) => (
                                                    <div key={i} className={`podium-slot-new ${slot.cls}`}
                                                        onClick={() => { setViewFamilyId(slot.p.id); setShowFamilyModal(true); }}
                                                        style={{cursor:'pointer'}}>
                                                        {slot.crown && <div style={{fontSize:'18px',marginBottom:'2px'}}>👑</div>}
                                                        <div className="p-avatar-new">
                                                            {slot.p.photoURL
                                                                ? <img src={slot.p.photoURL} alt="" />
                                                                : <span style={{fontSize:'22px'}}>{slot.p.emblem || '🏠'}</span>}
                                                        </div>
                                                        <div className="p-name-new">{slot.p.name || slot.p.tag}</div>
                                                        <div className="p-score-new">{(slot.p.activeness || 0).toLocaleString()}</div>
                                                        <div className="p-stand-new">{slot.medal}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                        <div className="lb-list-new">
                                            {rest.map((fam, i) => (
                                                <div key={fam.id} className="lb-row-new"
                                                    onClick={() => { setViewFamilyId(fam.id); setShowFamilyModal(true); }}
                                                    style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderBottom:'1px solid var(--new-border)',cursor:'pointer'}}
                                                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                                                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                                                    <div className="lb-num-new">#{i+4}</div>
                                                    <div className="lb-av-new">
                                                        {fam.photoURL ? <img src={fam.photoURL} alt="" /> : <span style={{fontSize:'18px'}}>{fam.emblem||'🏠'}</span>}
                                                    </div>
                                                    <div className="lb-info-new" style={{flex:1}}>
                                                        <div className="lb-name-new">{fam.name}</div>
                                                        <div className="lb-sub-new">{fam.tag} · {fam.memberCount||0} {lang==='ar'?'عضو':'members'}</div>
                                                    </div>
                                                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                                                        <div style={{fontSize:'12px',fontWeight:800,color:'#f97316'}}>{(fam.activeness||0).toLocaleString()} ⚡</div>
                                                        {!userFamily && isLoggedIn && <span style={{fontSize:'9px',padding:'2px 7px',borderRadius:'8px',background:'rgba(74,222,128,0.12)',border:'1px solid rgba(74,222,128,0.3)',color:'#4ade80',fontWeight:700}}>{lang==='ar'?'انضم':'Join'}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                            {data.length === 0 && <div style={{padding:'24px',textAlign:'center',color:'var(--text-muted)',fontSize:'12px'}}>🏠 {lang==='ar'?'لا توجد عائلات بعد':'No families yet'}</div>}
                                        </div>
                                    </>
                                );
                            })()}
                            {/* Podium + List for wins/charisma */}
                            {leaderboardTab !== 'family' && (() => {
                                const data = leaderboardTab === 'charisma' ? charismaLeaderboard : leaderboardData;
                                const top3 = data.slice(0,3);
                                const rest = data.slice(3);
                                const getVal = (p) => leaderboardTab === 'charisma' ? (p.charisma || 0) : (p.stats?.wins || 0);
                                const fmt = fmtNum; // unified — defined in 01-config.js
                                const getAvatar = (p) => p.photoURL || p.photo || null;
                                const getEmoji = (i) => ['😎','🦊','🐺'][i] || '👤';
                                const slots = top3.length >= 3
                                    ? [{p:top3[1],cls:'ps-2',medal:'🥈'},{p:top3[0],cls:'ps-1',medal:'👑',crown:true},{p:top3[2],cls:'ps-3',medal:'🥉'}]
                                    : top3.map((p,i)=>[{cls:'ps-1',medal:'👑',crown:true},{cls:'ps-2',medal:'🥈'},{cls:'ps-3',medal:'🥉'}][i] ? {...[{cls:'ps-1',medal:'👑',crown:true},{cls:'ps-2',medal:'🥈'},{cls:'ps-3',medal:'🥉'}][i], p} : null).filter(Boolean);
                                return (
                                    <>
                                        {top3.length > 0 && (
                                            <div className="podium-new">
                                                {slots.map((slot,i) => slot && (
                                                    <div key={i} className={`podium-slot-new ${slot.cls}`} onClick={() => openProfile(slot.p.id)}>
                                                        {slot.crown && <div style={{fontSize:'18px',marginBottom:'2px'}}>👑</div>}
                                                        <div className="p-avatar-new">
                                                            {getAvatar(slot.p) ? <img src={getAvatar(slot.p)} alt="" /> : <span>{getEmoji(top3.indexOf(slot.p))}</span>}
                                                        </div>
                                                        <div className="p-name-new">{slot.p.displayName || slot.p.name}</div>
                                                        <div className="p-score-new">{fmt(getVal(slot.p))}</div>
                                                        <div className="p-stand-new">{slot.medal}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="lb-list-new">
                                            {rest.map((player,i) => {
                                                const rank = i + 4;
                                                const isMe = player.id === currentUID;
                                                return (
                                                    <div key={player.id} className={`lb-row-new ${isMe?'me-row':''}`} onClick={() => openProfile(player.id)}>
                                                        <div className="lb-num-new">#{rank}</div>
                                                        <div className="lb-av-new">
                                                            {getAvatar(player) ? <img src={getAvatar(player)} alt="" /> : <span>{getEmoji(rank-1)}</span>}
                                                        </div>
                                                        <div className="lb-info-new">
                                                            <div className="lb-name-new">{player.displayName || player.name}{isMe && <span className="lb-me-tag">{lang==='ar'?'أنت':'You'}</span>}</div>
                                                            <div className="lb-sub-new">{player.stats?.wins||0} {t.wins} · {Math.round((player.stats?.wins||0)/Math.max(1,(player.stats?.wins||0)+(player.stats?.losses||0))*100)}% {lang==='ar'?'فوز':'wr'}</div>
                                                        </div>
                                                        <div className={`lb-val-new ${leaderboardTab==='charisma'?'gold':''}`}>{fmt(getVal(player))}</div>
                                                    </div>
                                                );
                                            })}
                                            {data.length === 0 && <div style={{padding:'24px',textAlign:'center',color:'var(--text-muted)',fontSize:'12px'}}>🏆 {lang==='ar'?'لا توجد بيانات بعد':'No data yet'}</div>}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    {/* ══ CHAT / شات VIEW (Friends) ══ */}
                    {activeView === 'chat' && (
                        <div style={{paddingBottom:'8px'}}>
                            {/* ── Guest gate — must log in to use friends/groups ── */}
                            {isGuest && !isLoggedIn && (
                                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'48px 24px',gap:'16px',textAlign:'center'}}>
                                    <div style={{fontSize:'48px'}}>🔐</div>
                                    <div style={{fontSize:'16px',fontWeight:800,color:'#e5e7eb'}}>{lang==='ar'?'سجّل دخولك أولاً':'Login Required'}</div>
                                    <div style={{fontSize:'12px',color:'#6b7280',maxWidth:'240px'}}>{lang==='ar'?'سجّل الدخول بجوجل للوصول للأصدقاء والجروبات':'Sign in with Google to access friends & groups'}</div>
                                    <button onClick={handleGoogleLogin} style={{display:'flex',alignItems:'center',gap:'10px',padding:'11px 24px',borderRadius:'14px',background:'linear-gradient(135deg,#4285f4,#1a73e8)',border:'none',color:'#fff',fontWeight:800,fontSize:'14px',cursor:'pointer',boxShadow:'0 4px 16px rgba(66,133,244,0.4)'}}>
                                        <span style={{fontSize:'18px'}}>🔑</span> {lang==='ar'?'تسجيل الدخول بجوجل':'Sign in with Google'}
                                    </button>
                                </div>
                            )}
                            {/* ── Chat Tabs: Friends / Groups (only for logged-in) ── */}
                            {(!isGuest || isLoggedIn) && (<>
                            <div style={{display:'flex',gap:'4px',padding:'10px 16px 0',borderBottom:'1px solid rgba(255,255,255,0.06)',marginBottom:'10px'}}>
                                <button id="chat-tab-friends" onClick={() => { document.getElementById('chat-section-friends').style.display='block'; document.getElementById('chat-section-groups').style.display='none'; document.getElementById('chat-tab-friends').style.color='#00f2ff'; document.getElementById('chat-tab-friends').style.borderBottom='2px solid #00f2ff'; document.getElementById('chat-tab-groups').style.color='#6b7280'; document.getElementById('chat-tab-groups').style.borderBottom='2px solid transparent'; }} style={{flex:1,padding:'8px 0',borderRadius:'10px 10px 0 0',border:'none',cursor:'pointer',fontSize:'12px',fontWeight:700,background:'transparent',color:'#00f2ff',borderBottom:'2px solid #00f2ff',transition:'all 0.2s'}}>
                                    👥 {lang==='ar'?'الأصدقاء':t.tabFriends}
                                    {friendRequests.length > 0 && <span style={{marginLeft:'4px',fontSize:'9px',background:'var(--accent)',color:'#fff',borderRadius:'10px',padding:'1px 5px',fontWeight:700}}>{friendRequests.length}</span>}
                                </button>
                                <button id="chat-tab-groups" onClick={() => { document.getElementById('chat-section-friends').style.display='none'; document.getElementById('chat-section-groups').style.display='block'; document.getElementById('chat-tab-groups').style.color='#a78bfa'; document.getElementById('chat-tab-groups').style.borderBottom='2px solid #a78bfa'; document.getElementById('chat-tab-friends').style.color='#6b7280'; document.getElementById('chat-tab-friends').style.borderBottom='2px solid transparent'; }} style={{flex:1,padding:'8px 0',borderRadius:'10px 10px 0 0',border:'none',cursor:'pointer',fontSize:'12px',fontWeight:700,background:'transparent',color:'#6b7280',borderBottom:'2px solid transparent',transition:'all 0.2s'}}>
                                    👨‍👩‍👧 {lang==='ar'?'الجروبات':'Groups'}
                                </button>
                            </div>

                            {/* ── Friends Section ── */}
                            <div id="chat-section-friends">
                            {/* Add Friend */}
                            <div style={{margin:'0 16px 10px',display:'flex',gap:'8px'}}>
                                <input type="text" className="hero-input" style={{flex:1,padding:'9px 13px',fontSize:'12px'}} value={addFriendId} onChange={e => setAddFriendId(e.target.value)} placeholder={t.friendIdPlaceholder} />
                                <button onClick={handleAddFriendById} disabled={!addFriendId.trim()} className="hero-btn-primary" style={{padding:'9px 14px',fontSize:'12px'}}>+ {lang==='ar'?'أضف':'Add'}</button>
                            </div>
                            {friendSearchMsg && <p style={{fontSize:'11px',textAlign:'center',padding:'0 16px 8px',color:friendSearchMsg.includes('تم')||friendSearchMsg.includes('Sent')?'#4ade80':'#ff4d4d'}}>{friendSearchMsg}</p>}

                            {/* ── Official Bot Chats ── */}
                            {isLoggedIn && (
                                <div style={{margin:'0 16px 10px',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'12px',overflow:'hidden'}}>
                                    <div style={{fontSize:'9px',fontWeight:700,color:'#6b7280',padding:'6px 14px 4px',textTransform:'uppercase',letterSpacing:'1px'}}>🤖 {lang==='ar'?'قنوات رسمية':'Official Channels'}</div>
                                    {/* Detective Bot */}
                                    <div onClick={()=>setShowDetectiveBot(true)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderTop:'1px solid rgba(255,255,255,0.04)',cursor:'pointer',background:detectiveBotUnread>0?'rgba(0,212,255,0.05)':'transparent'}} className="me-friend-row">
                                        <div style={{position:'relative',flexShrink:0}}>
                                            <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,rgba(0,212,255,0.25),rgba(0,212,255,0.1))',border:'1.5px solid rgba(0,212,255,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',overflow:'hidden'}}>
                                                {BOT_CHATS_CONFIG[0]?.photoURL?<img src={BOT_CHATS_CONFIG[0].photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'🕵️'}
                                            </div>
                                            {detectiveBotUnread>0&&<div style={{position:'absolute',top:'-2px',right:'-2px',width:'10px',height:'10px',borderRadius:'50%',background:'#ef4444',border:'1.5px solid var(--bg-main)',boxShadow:'0 0 6px rgba(239,68,68,0.8)'}}/>}
                                        </div>
                                        <div style={{flex:1,minWidth:0}}>
                                            <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
                                                <span style={{fontSize:'13px',fontWeight:detectiveBotUnread>0?800:600,color:detectiveBotUnread>0?'#e2e8f0':'#9ca3af'}}>{lang==='ar'?'المحقق':'The Detective'}</span>
                                                <span style={{fontSize:'8px',fontWeight:900,background:'#00d4ff',color:'#000',padding:'1px 4px',borderRadius:'3px'}}>OFFICIAL</span>
                                            </div>
                                            <div style={{fontSize:'11px',color:'#6b7280'}}>{lang==='ar'?'البلاغات والردود':'Reports & Responses'}</div>
                                        </div>
                                    </div>
                                    {/* Love Bot */}
                                    <div onClick={()=>setShowLoveBot(true)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderTop:'1px solid rgba(255,255,255,0.04)',cursor:'pointer',background:loveBotUnread>0?'rgba(249,168,212,0.05)':'transparent'}} className="me-friend-row">
                                        <div style={{position:'relative',flexShrink:0}}>
                                            <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,rgba(249,168,212,0.25),rgba(249,168,212,0.1))',border:'1.5px solid rgba(249,168,212,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',overflow:'hidden'}}>
                                                {BOT_CHATS_CONFIG[1]?.photoURL?<img src={BOT_CHATS_CONFIG[1].photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'💌'}
                                            </div>
                                            {(loveBotUnread>0||bffUnreadCount>0)&&<div style={{position:'absolute',top:'-2px',right:'-2px',width:'10px',height:'10px',borderRadius:'50%',background:'#ec4899',border:'1.5px solid var(--bg-main)',boxShadow:'0 0 6px rgba(236,72,153,0.8)'}}/>}
                                        </div>
                                        <div style={{flex:1,minWidth:0}}>
                                            <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
                                                <span style={{fontSize:'13px',fontWeight:loveBotUnread>0||bffUnreadCount>0?800:600,color:loveBotUnread>0||bffUnreadCount>0?'#e2e8f0':'#9ca3af'}}>{lang==='ar'?'دواء بوت':'Dawa Bot'}</span>
                                                <span style={{fontSize:'8px',fontWeight:900,background:'#f9a8d4',color:'#000',padding:'1px 4px',borderRadius:'3px'}}>OFFICIAL</span>
                                            </div>
                                            <div style={{fontSize:'11px',color:'#6b7280'}}>{lang==='ar'?'إشعارات الزواج و BFF':'Wedding & BFF Notifications'}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Friend Requests */}
                            {friendRequests.length > 0 && (
                                <div style={{margin:'0 16px 10px',background:'rgba(255,215,0,0.05)',border:'1px solid rgba(255,215,0,0.15)',borderRadius:'12px',overflow:'hidden'}}>
                                    <div style={{fontSize:'10px',fontWeight:700,color:'var(--gold)',padding:'8px 14px 4px',textTransform:'uppercase',letterSpacing:'1px'}}>⏳ {lang==='ar'?'طلبات صداقة':'Friend Requests'} ({friendRequests.length})</div>
                                    {friendRequests.map(req => (
                                        <div key={req.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 14px',borderTop:'1px solid rgba(255,255,255,0.04)'}}>
                                            <div style={{flex:1,minWidth:0}}><PlayerNameTag player={req} lang={lang} size="sm" /></div>
                                            <button onClick={() => handleAcceptRequest(req.id)} style={{padding:'4px 10px',borderRadius:'8px',background:'#00ff88',color:'#000',fontSize:'11px',fontWeight:700,border:'none',cursor:'pointer'}}>{t.accept} ✓</button>
                                            <button onClick={() => handleRejectRequest(req.id)} style={{padding:'4px 8px',borderRadius:'8px',background:'rgba(255,255,255,0.07)',color:'var(--text-muted)',fontSize:'11px',border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer'}}>✕</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Friends List */}
                            <div style={{margin:'0 16px',background:'var(--new-card)',border:'1px solid var(--new-border)',borderRadius:'var(--radius-lg)',overflow:'hidden'}}>
                                {isLoggedIn && currentUserData && (
                                    <div onClick={() => setShowSelfChat(true)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderBottom:'1px solid var(--new-border)',cursor:'pointer'}} className="me-friend-row">
                                        <div style={{flex:1,minWidth:0}}><PlayerNameTag player={currentUserData} lang={lang} size="sm" /></div>
                                        <div style={{fontSize:'9px',fontWeight:700,color:'var(--primary)',background:'rgba(0,242,255,0.1)',border:'1px solid rgba(0,242,255,0.25)',borderRadius:'6px',padding:'2px 7px',flexShrink:0}}>💬 {lang==='ar'?'شاتي':'My Chat'}</div>
                                    </div>
                                )}
                                {/* ── Family Chat Entry ── */}
                                {isLoggedIn && userFamily && (() => {
                                    const signLevel = userFamily.activeness || 0;
                                    const signData = typeof getFamilySignLevelData === 'function' ? getFamilySignLevelData(signLevel) : null;
                                    const readAt = userFamily.chatReadBy?.[currentUID];
                                    const lastChatAt = userFamily.lastChatAt;
                                    const hasUnread = lastChatAt && readAt
                                        ? (lastChatAt.toDate ? lastChatAt.toDate() : new Date(lastChatAt.seconds*1000)) > (readAt.toDate ? readAt.toDate() : new Date(readAt.seconds*1000)) && userFamily.lastChatSenderId !== currentUID
                                        : !!lastChatAt && userFamily.lastChatSenderId !== currentUID;
                                    return (
                                        <div onClick={()=>setShowFamilyChat(true)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderBottom:'1px solid var(--new-border)',cursor:'pointer',background:hasUnread?'linear-gradient(135deg,rgba(255,136,0,0.06),rgba(255,80,0,0.04))':'transparent'}} className="me-friend-row">
                                            <div style={{position:'relative',flexShrink:0}}>
                                                <div style={{width:'36px',height:'36px',borderRadius:'50%',overflow:'hidden',background:'linear-gradient(135deg,rgba(255,136,0,0.2),rgba(255,80,0,0.1))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',border:'1.5px solid rgba(255,136,0,0.3)'}}>
                                                    {userFamily.photoURL ? <img src={userFamily.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : (userFamily.emblem||'🏠')}
                                                </div>
                                                {hasUnread && <div style={{position:'absolute',top:'-2px',right:'-2px',width:'10px',height:'10px',borderRadius:'50%',background:'#f97316',border:'1.5px solid var(--bg-main)',boxShadow:'0 0 6px rgba(249,115,22,0.8)'}}/>}
                                            </div>
                                            <div style={{flex:1,minWidth:0}}>
                                                <div style={{display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
                                                    <span style={{fontSize:'13px',fontWeight:hasUnread?800:600,color:hasUnread?'#f97316':'#e2e8f0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'120px'}}>{userFamily.name}</span>
                                                    {typeof FamilySignBadge !== 'undefined' ? (
                                                        <div style={{transform:'scale(0.85)',transformOrigin:'left center'}}>
                                                            <FamilySignBadge family={{name: userFamily.name, tag: userFamily.tag||'FAM', signLevel: signLevel, signColor: signData?.color || '#00f2ff', signImageURL: userFamily.signImageURL || (typeof getFamilySignURL === 'function' ? getFamilySignURL({familySignLevel: signLevel, familySignColor: signData?.color}) : null)}} />
                                                        </div>
                                                    ) : signData && <span style={{fontSize:'9px',fontWeight:800,color:signData.color,background:`${signData.color}20`,border:`1px solid ${signData.color}44`,borderRadius:'4px',padding:'1px 5px'}}>{userFamily.tag||'FAM'}</span>}
                                                </div>
                                                <div style={{fontSize:'11px',color:'#6b7280',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{userFamily.lastChatMessage||(lang==='ar'?'شات العائلة':'Family Chat')}</div>
                                            </div>
                                            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'4px',flexShrink:0}}>
                                                <div style={{fontSize:'9px',fontWeight:700,color:'#f97316',background:'rgba(255,136,0,0.1)',border:'1px solid rgba(255,136,0,0.25)',borderRadius:'6px',padding:'2px 7px',cursor:'pointer'}} onClick={(e)=>{e.stopPropagation();setShowFamilyModal(true);}}>🏠 {lang==='ar'?'عائلة':'Family'}</div>
                                            </div>
                                        </div>
                                    );
                                })()}
                                {friendsData.length === 0 ? (
                                    <div style={{padding:'24px',textAlign:'center',color:'var(--text-muted)',fontSize:'12px'}}>👥 {t.noFriends}</div>
                                ) : (() => {
                                    const online = friendsData.filter(f => f.onlineStatus === 'online');
                                    const away = friendsData.filter(f => f.onlineStatus === 'away');
                                    const offline = friendsData.filter(f => !f.onlineStatus || f.onlineStatus === 'offline');
                                    const statusColor = (f) => f.onlineStatus==='online' ? '#4ade80' : f.onlineStatus==='away' ? '#facc15' : '#6b7280';
                                    const renderFriend = (friend) => {
                                        const fVipLevel = (typeof getVIPLevel === 'function') ? (getVIPLevel(friend) || 0) : 0;
                                        const fVipCfg = getVIPConfig(fVipLevel);
                                        const fEquipped = friend.equipped || {};
                                        const fBadgeIds = (fEquipped.badges || []).slice(0, 3);
                                        const fTitleId = fEquipped.titles || null;
                                        const fTitleItem = fTitleId && typeof SHOP_ITEMS !== 'undefined' ? SHOP_ITEMS.titles?.find(t => t.id === fTitleId) : null;
                                        const sc = statusColor(friend);
                                        return (
                                            <div key={friend.id} onClick={() => openProfile(friend.id)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderBottom:'1px solid var(--new-border)',cursor:'pointer'}} className="me-friend-row">
                                                {/* Avatar with status dot */}
                                                <div style={{position:'relative',flexShrink:0}}>
                                                    <div style={{
                                                        width:'38px', height:'38px', borderRadius:'50%', overflow:'hidden',
                                                        border: fVipCfg ? `2px solid ${fVipCfg.nameColor}` : '2px solid rgba(255,255,255,0.1)',
                                                        boxShadow: fVipCfg ? `0 0 8px ${fVipCfg.nameColor}44` : 'none',
                                                    }}>
                                                        {friend.photoURL
                                                            ? <img src={friend.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                                                            : <div style={{width:'100%',height:'100%',background:'rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',color:'#6b7280',fontWeight:700}}>{(friend.displayName||'U')[0].toUpperCase()}</div>
                                                        }
                                                    </div>
                                                    {/* Online status dot */}
                                                    <div style={{position:'absolute',bottom:'0px',right:'0px',width:'9px',height:'9px',borderRadius:'50%',background:sc,border:'1.5px solid #0a0a14'}}/>
                                                </div>
                                                {/* Info */}
                                                <div style={{flex:1,minWidth:0}}>
                                                    {/* Row 1: name + VIP badge */}
                                                    <div style={{display:'flex',alignItems:'center',gap:'4px',flexWrap:'nowrap',marginBottom: (fBadgeIds.length>0||fTitleItem) ? '2px' : '0'}}>
                                                        <span style={{
                                                            fontSize:'13px', fontWeight:700,
                                                            color: fVipCfg ? fVipCfg.nameColor : '#e2e8f0',
                                                            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'130px',
                                                            textShadow: fVipCfg ? `0 0 8px ${fVipCfg.nameColor}55` : 'none',
                                                        }}>{friend.displayName || friend.name || '—'}</span>
                                                        {fVipLevel > 0 && fVipCfg && (
                                                            <span style={{fontSize:'7px',fontWeight:900,background:fVipCfg.nameColor,color:'#000',padding:'1px 3px',borderRadius:'2px',flexShrink:0}}>VIP{fVipLevel}</span>
                                                        )}
                                                        {/* Staff role badge */}
                                                        {friend.staffRole?.role && typeof StaffRoleBadge !== 'undefined' && (
                                                            <StaffRoleBadge userData={friend} uid={friend.id} lang={lang} size="sm" />
                                                        )}
                                                    </div>
                                                    {/* Row 2: Badges (max 3) */}
                                                    {fBadgeIds.length > 0 && typeof SHOP_ITEMS !== 'undefined' && (
                                                        <div style={{display:'flex',alignItems:'center',gap:'2px',marginBottom:'2px'}}>
                                                            {fBadgeIds.map((bid, idx) => {
                                                                const b = SHOP_ITEMS.badges?.find(b => b.id === bid);
                                                                if (!b) return null;
                                                                return b.imageUrl && b.imageUrl.trim() !== '' ? (
                                                                    <img key={idx} src={b.imageUrl} alt="" style={{width:'13px',height:'13px',objectFit:'contain'}}/>
                                                                ) : (
                                                                    <span key={idx} style={{fontSize:'11px',lineHeight:1}}>{b.preview}</span>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                    {/* Row 3: Title */}
                                                    {fTitleItem && (
                                                        <div style={{display:'flex',alignItems:'center',gap:'2px'}}>
                                                            {fTitleItem.imageUrl && fTitleItem.imageUrl.trim() !== '' ? (
                                                                <img src={fTitleItem.imageUrl} alt="" style={{maxWidth:'70px',maxHeight:'12px',objectFit:'contain'}}/>
                                                            ) : (
                                                                <span style={{fontSize:'9px',color:'#a78bfa',lineHeight:1,whiteSpace:'nowrap'}}>🌐 {lang==='ar'?fTitleItem.name_ar:fTitleItem.name_en}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Chat button */}
                                                <button onClick={(e)=>{e.stopPropagation();openPrivateChat(friend);}} className="btn-ghost" style={{padding:'5px 8px',borderRadius:'8px',fontSize:'12px',flexShrink:0}}>💬</button>
                                            </div>
                                        );
                                    };
                                    return (<>
                                        {online.length > 0 && (<><div style={{fontSize:'9px',fontWeight:700,color:'#4ade80',textTransform:'uppercase',padding:'8px 14px 4px',display:'flex',alignItems:'center',gap:'5px'}}><span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#4ade80',display:'inline-block'}}/>{t.online} ({online.length})</div>{online.map(renderFriend)}</>)}
                                        {away.length > 0 && (<><div style={{fontSize:'9px',fontWeight:700,color:'#facc15',textTransform:'uppercase',padding:'8px 14px 4px',display:'flex',alignItems:'center',gap:'5px'}}><span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#facc15',display:'inline-block'}}/>{lang==='ar'?'بعيد':'Away'} ({away.length})</div>{away.map(renderFriend)}</>)}
                                        {offline.length > 0 && (<><div style={{fontSize:'9px',fontWeight:700,color:'#6b7280',textTransform:'uppercase',padding:'8px 14px 4px',display:'flex',alignItems:'center',gap:'5px'}}><span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#6b7280',display:'inline-block'}}/>{t.offline} ({offline.length})</div>{offline.map(renderFriend)}</>)}
                                    </>);
                                })()}
                            </div>
                            </div>{/* end friends section */}

                            {/* ── Groups Section ── */}
                            <div id="chat-section-groups" style={{display:'none'}}>
                                <GroupsSection
                                    currentUser={user}
                                    currentUserData={currentUserData}
                                    currentUID={currentUID}
                                    friendsData={friendsData}
                                    lang={lang}
                                    onNotification={setNotification}
                                    isLoggedIn={isLoggedIn}
                                    onOpenProfile={openProfile}
                                />
                            </div>
                        </>)}
                        </div>
                    )}

                    {/* ══ DISCOVER / اكتشف VIEW ══ */}
                    {activeView === 'discover' && (
                        <div style={{paddingBottom:'8px'}}>
                            <div className="sec-head-new" style={{paddingTop:'14px'}}>
                                <span className="sec-title-new">🔥 {lang==='ar'?'اكتشف':'Discover'}</span>
                            </div>

                            {/* Moments — wide banner card */}
                            <div className="discover-card-cs" style={{'--dc-color':'rgba(0,242,255,0.08)','--dc-border':'rgba(0,242,255,0.18)',cursor:'pointer'}} onClick={()=>setShowFriendsMoments(true)}>
                                <div className="dc-left">
                                    <div className="dc-icon" style={{background:'linear-gradient(135deg,rgba(0,242,255,0.2),rgba(112,0,255,0.15))', fontSize:'22px'}}>📸</div>
                                </div>
                                <div className="dc-body">
                                    <div className="dc-title">{lang==='ar'?'مومنت الأصدقاء':'Friends Moments'}</div>
                                    <div className="dc-desc">{lang==='ar'?'شارك لحظاتك مع أصدقائك':'Share moments with friends'}</div>
                                </div>
                                <div style={{fontSize:'16px',color:'#00f2ff',flexShrink:0}}>›</div>
                            </div>

                            {/* Square grid — Couples + Family */}
                            <div className="discover-grid" style={{gridTemplateColumns:'repeat(2,1fr)'}}>

                                {/* Couples square */}
                                <div
                                    className="discover-sq"
                                    style={{
                                        '--dsq-bg':'linear-gradient(145deg,rgba(236,72,153,0.12),rgba(168,85,247,0.08))',
                                        '--dsq-border':'rgba(236,72,153,0.3)',
                                        padding:'18px 12px',
                                    }}
                                    onClick={() => {
                                        if (!isLoggedIn) { setShowLoginAlert(true); return; }
                                        setShowWeddingHall(true);
                                    }}
                                >
                                    {coupleData && <div className="dsq-dot" style={{background:'#ec4899'}}/>}
                                    <div className="dsq-icon" style={{background:'linear-gradient(135deg,rgba(236,72,153,0.25),rgba(168,85,247,0.2))'}}>
                                        {coupleData && partnerData?.photoURL
                                            ? <img src={partnerData.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'14px'}}/>
                                            : '💍'
                                        }
                                    </div>
                                    <div className="dsq-label">{lang==='ar'?'الكابلز':'Couples'}</div>
                                    {coupleData && partnerData && (
                                        <div style={{fontSize:'9px',color:'#f9a8d4',textAlign:'center',fontWeight:600,maxWidth:'80px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                                            {partnerData.displayName}
                                        </div>
                                    )}
                                </div>

                                {/* Family square */}
                                <div
                                    className="discover-sq"
                                    style={{
                                        '--dsq-bg':'linear-gradient(145deg,rgba(255,136,0,0.1),rgba(255,80,0,0.06))',
                                        '--dsq-border':'rgba(255,136,0,0.28)',
                                        padding:'18px 12px',
                                    }}
                                    onClick={()=>setShowFamilyModal(true)}
                                >
                                    {userFamily && <div className="dsq-dot" style={{background:'#f97316'}}/>}
                                    <div className="dsq-icon" style={{background:'linear-gradient(135deg,rgba(255,136,0,0.22),rgba(255,80,0,0.12))'}}>
                                        {userFamily?.photoURL
                                            ? <img src={userFamily.photoURL} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'14px'}}/>
                                            : (userFamily?.emblem || '🏠')
                                        }
                                    </div>
                                    <div className="dsq-label">{lang==='ar'?'العائلة':'Family'}</div>
                                    {userFamily && (
                                        <div style={{fontSize:'9px',color:'#fb923c',textAlign:'center',fontWeight:600,maxWidth:'80px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                                            {userFamily.name}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    )}

                    {/* ══ ME / أنا VIEW ══ */}
                    {activeView === 'me' && (
                        <div style={{paddingBottom:'8px'}}>

                            {/* ── Profile Hero Card ── */}
                            {(isLoggedIn || isGuest) && currentUserData ? (
                                <div className="me-hero-card" onClick={() => setShowMyAccount(true)}>
                                    <div className="me-hero-avatar">
                                        {currentUserData.photoURL || currentUserData.photo
                                            ? <img src={currentUserData.photoURL || currentUserData.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
                                            : <span style={{fontSize:'36px'}}>😎</span>
                                        }
                                    </div>
                                    <div className="me-hero-info">
                                        <div className="me-hero-name">{currentUserData.displayName || currentUserData.name || (lang==='ar'?'مستخدم':'User')}</div>
                                        <div className="me-hero-id">{currentUserData?.customId ? `#${currentUserData.customId}` : `ID: ${currentUID?.slice(0,8)||'—'}`}</div>
                                        <div className="me-hero-stats-row">
                                            <span>🏆 {currentUserData?.stats?.wins || 0}</span>
                                            <span>⭐ {fmtNum(currentUserData?.charisma||0)}</span>
                                            <span>🧠 {fmtNum(currentUserData?.currency||0)}</span>
                                        </div>
                                    </div>
                                    <div style={{fontSize:'16px',color:'var(--text-muted)',flexShrink:0}}>›</div>
                                </div>
                            ) : (
                                <div className="me-hero-card" onClick={() => handleGoogleLogin()}>
                                    <div className="me-hero-avatar" style={{background:'rgba(255,255,255,0.06)'}}>
                                        <span style={{fontSize:'28px'}}>🔐</span>
                                    </div>
                                    <div className="me-hero-info">
                                        <div className="me-hero-name">{lang==='ar'?'سجّل دخول':'Sign In'}</div>
                                        <div className="me-hero-id">{lang==='ar'?'للاستمتاع بكل الميزات':'Unlock all features'}</div>
                                    </div>
                                    <div style={{fontSize:'16px',color:'var(--primary)',flexShrink:0}}>›</div>
                                </div>
                            )}

                            {/* ── Guest login banner in Me view ── */}
                            {isGuest && !isLoggedIn && (
                                <div style={{margin:'10px 16px 4px',padding:'14px 16px',borderRadius:'16px',background:'linear-gradient(135deg,rgba(66,133,244,0.13),rgba(26,115,232,0.08))',border:'1px solid rgba(66,133,244,0.28)',display:'flex',alignItems:'center',gap:'12px'}}>
                                    <span style={{fontSize:'28px',flexShrink:0}}>🔑</span>
                                    <div style={{flex:1,minWidth:0}}>
                                        <div style={{fontSize:'13px',fontWeight:800,color:'#e5e7eb',marginBottom:'2px'}}>{lang==='ar'?'سجّل دخولك بجوجل':'Sign in with Google'}</div>
                                        <div style={{fontSize:'11px',color:'#6b7280'}}>{lang==='ar'?'احفظ تقدمك واستمتع بكل الميزات':'Save progress & unlock all features'}</div>
                                    </div>
                                    <button onClick={handleGoogleLogin} style={{flexShrink:0,padding:'8px 14px',borderRadius:'10px',background:'linear-gradient(135deg,#4285f4,#1a73e8)',border:'none',color:'#fff',fontWeight:800,fontSize:'12px',cursor:'pointer',whiteSpace:'nowrap'}}>
                                        {lang==='ar'?'دخول':'Login'}
                                    </button>
                                </div>
                            )}

                            {/* ── Quick Actions Grid ── */}
                            <div className="sec-head-new" style={{paddingTop:'14px'}}>
                                <span className="sec-title-new">{lang==='ar'?'الإعدادات والأدوات':'Settings & Tools'}</span>
                            </div>
                            <div className="me-actions-grid">
                                {/* Inventory */}
                                {isLoggedIn && (
                                    <div className="me-action-card" onClick={() => setShowInventory(true)}>
                                        <div className="me-action-icon" style={{background:'rgba(112,0,255,0.15)'}}>📦</div>
                                        <div className="me-action-label">{lang==='ar'?'حقيبتي':t.inventory}</div>
                                    </div>
                                )}
                                {/* Shop */}
                                {isLoggedIn && (
                                    <div className="me-action-card" onClick={() => setShowShop(true)}>
                                        <div className="me-action-icon" style={{background:'rgba(255,215,0,0.12)'}}>🛒</div>
                                        <div className="me-action-label">{lang==='ar'?'المتجر':t.shop}</div>
                                    </div>
                                )}
                                {/* VIP Center */}
                                {isLoggedIn && (
                                    <div className="me-action-card" onClick={() => setShowVIPCenter(true)}
                                        style={{background:'linear-gradient(135deg,rgba(255,215,0,0.08),rgba(255,140,0,0.05))',border:'1px solid rgba(255,215,0,0.2)'}}>
                                        <div className="me-action-icon" style={{background:'rgba(255,215,0,0.15)'}}>👑</div>
                                        <div className="me-action-label" style={{color:'#ffd700'}}>{lang==='ar'?'VIP سنتر':'VIP Center'}</div>
                                    </div>
                                )}
                                {/* Help Center */}
                                <div className="me-action-card" onClick={() => setShowHelpCenter(true)}>
                                    <div className="me-action-icon" style={{background:'rgba(0,242,255,0.1)'}}>💬</div>
                                    <div className="me-action-label">{lang==='ar'?'مركز المساعدة':'Help Center'}</div>
                                </div>
                                {/* Settings */}
                                <div className="me-action-card" onClick={() => setShowSettings(true)}>
                                    <div className="me-action-icon" style={{background:'rgba(255,255,255,0.07)'}}>⚙️</div>
                                    <div className="me-action-label">{lang==='ar'?'الإعدادات':t.settings||'Settings'}</div>
                                </div>
                            </div>

                            {/* ── Logout ── */}
                            {(isLoggedIn || isGuest) && (
                                <div style={{margin:'14px 16px 0'}}>
                                    <button onClick={handleLogout} style={{width:'100%',padding:'12px',borderRadius:'12px',background:'rgba(255,0,85,0.1)',border:'1px solid rgba(255,0,85,0.25)',color:'#ff4d6d',fontSize:'13px',fontWeight:700,cursor:'pointer',transition:'.2s',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                                        🚪 {lang==='ar'?'تسجيل الخروج':t.logout||'Sign Out'}
                                    </button>
                                </div>
                            )}
                            {!isLoggedIn && !isGuest && (
                                <div style={{margin:'14px 16px 0'}}>
                                    <button onClick={handleGoogleLogin} style={{width:'100%',padding:'12px',borderRadius:'12px',background:'linear-gradient(135deg,var(--primary),var(--secondary))',border:'none',color:'#000',fontSize:'13px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                                        🔑 {lang==='ar'?'تسجيل الدخول بجوجل':t.loginGoogle}
                                    </button>
                                </div>
                            )}
                            <div style={{height:'8px'}}></div>
                        </div>
                    )}
                </>
            )}

            {/* ── ROOM VIEW ── */}
            {room && (
                <div className="new-room-content">
                    <div className="glass-panel rounded-lg p-2 mb-2 flex items-center justify-between">
                        <div className="lobby-code-container">
                            <button onClick={handleCopy} className={`lobby-code-btn ${copied ? 'copied' : ''}`}><span className="font-mono">{roomId}</span><span>{copied ? '✓' : '📋'}</span></button>
                            {copied && <span className="text-[10px] text-green-400 ml-1">{t.codeCopied}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            {room.isPrivate && (<button onClick={() => setShowLobbyPassword(!showLobbyPassword)} className="lobby-password-toggle">{showLobbyPassword ? '🙈' : '👁️'}</button>)}
                            {room.isPrivate && showLobbyPassword && <span className="text-xs text-yellow-400 font-mono">{room.password}</span>}
                            <div className="text-xs text-gray-400">{t.roundsFormat(room.currentRound || 0, 3)}</div>
                        </div>
                    </div>

                    {room.status === 'waiting' && (
                        <div className="card-container">
                            <h3 className="text-sm font-bold mb-3 text-center">{t.lobbyTitle}</h3>
                            <div className="flex flex-col gap-2 mb-4">{room.players.map(p => (<div key={p.uid} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg cursor-pointer hover:bg-white/10" onClick={() => !p.isBot && openProfile(p.uid)}><div className="flex-1" style={{minWidth:0}}><PlayerNameTag player={{...p, photoURL:p.photo, displayName:p.name + (p.isBot?' 🤖':'')}} lang={lang} size="sm" /></div>{p.uid === room.admin && <span className="text-[8px] bg-yellow-500/20 text-yellow-400 px-1 rounded flex-shrink-0">HOST</span>}{p.isBot && currentUID === OWNER_UID && <button onClick={e=>{e.stopPropagation();removeBotFromRoom(p.uid);}} style={{background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',color:'#ef4444',borderRadius:'5px',padding:'2px 6px',fontSize:'10px',cursor:'pointer',flexShrink:0}}>{t.removeBot}</button>}</div>))}</div>
                            {/* Bot Manager - Owner Only */}
                            {currentUID === OWNER_UID && (
                                <div style={{background:'rgba(0,242,255,0.04)',border:'1px solid rgba(0,242,255,0.15)',borderRadius:'8px',padding:'8px 10px',marginBottom:'10px'}}>
                                    <div style={{fontSize:'11px',fontWeight:700,color:'#00f2ff',marginBottom:'6px'}}>{t.botManager} {room.players.filter(p=>p.isBot).length > 0 && <span style={{background:'rgba(0,242,255,0.15)',borderRadius:'10px',padding:'1px 7px',fontSize:'10px'}}>{t.botsCount(room.players.filter(p=>p.isBot).length)}</span>}</div>
                                    <div style={{fontSize:'10px',color:'#9ca3af',marginBottom:'6px'}}>{lang==='ar'?'أضف بوتات للتجربة (مرئية للجميع كلاعبين)':'Add bots for testing (visible to all as players)'}</div>
                                    <button onClick={addBotToRoom} disabled={room.players.filter(p=>p.isBot).length>=5||room.players.length>=10} style={{background:'rgba(0,242,255,0.12)',border:'1px solid rgba(0,242,255,0.3)',color:'#00f2ff',borderRadius:'7px',padding:'5px 12px',fontSize:'11px',fontWeight:700,cursor:'pointer',opacity:room.players.filter(p=>p.isBot).length>=5||room.players.length>=10?0.4:1}}>
                                        {t.addBot}
                                    </button>
                                </div>
                            )}
                            <div className="flex gap-2">{room.admin === currentUID ? (<button onClick={startGame} className="btn-neon flex-1 py-2 rounded-lg text-sm font-bold">{t.start}</button>) : (<p className="text-xs text-gray-400 text-center flex-1">{t.waiting}</p>)}<button onClick={handleLeaveRoom} className="btn-danger px-4 py-2 rounded-lg text-sm">{t.leaveRoom}</button></div>
                        </div>
                    )}

                    {room.status === 'word_selection' && !isSpectator && (
                        <div className="card-container">
                            {(myRole === 'spy') ? (
                                <div className="identity-square identity-spy" style={{margin:'0 0 8px'}}>
                                    <div className="text-4xl mb-2">🕵️</div>
                                    <div className="text-lg font-bold">{t.statusSpy}</div>
                                    <div className="text-xs text-yellow-300 mt-1">{lang==='ar'?'أنت الجاسوس — لا تحتاج للتصويت على الكلمة':'You are the spy — no word vote needed'}</div>
                                    <div className="text-xs text-gray-300 mt-2 opacity-70">{lang==='ar'?'الموقع: ':'Location: '}<span className="text-yellow-400 font-bold">{lang==='ar'?room.scenario?.loc_ar:room.scenario?.loc_en}</span></div>
                                    <div className="text-xs text-cyan-300 mt-1 opacity-80">{t.spyKnowsLocation}</div>
                                </div>
                            ) : (myRole === 'mrwhite') ? (
                                <div className="identity-square identity-mrwhite" style={{margin:'0 0 8px'}}>
                                    <div className="text-4xl mb-2">👻</div>
                                    <div className="text-lg font-bold">{t.statusMrWhite}</div>
                                    <div className="text-xs text-gray-300 mt-1">{lang==='ar'?'لا تعرف الموقع ولا الكلمة — استمع بعناية!':'You know neither location nor word — listen carefully!'}</div>
                                    <div className="text-xs text-purple-300 mt-2">{t.myWordNotAvailable}</div>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-sm font-bold mb-2 text-center">{t.wordSelectionTitle}</h3>
                                    <p className="text-xs text-gray-400 text-center mb-3">{t.wordSelectionDesc}</p>
                                    <div className="text-center text-xs text-yellow-400 mb-3">⏱️ {wordSelTimer}s</div>
                                    {myRole === 'informant' && room.spyId && (
                                        <div style={{background:'rgba(168,85,247,0.12)',border:'1px solid rgba(168,85,247,0.3)',borderRadius:'8px',padding:'8px 12px',marginBottom:'10px',textAlign:'center'}}>
                                            <div className="text-xs font-bold text-purple-300">{t.informantRevealTitle}</div>
                                            <div className="text-xs text-gray-300 mt-1">{t.informantSpyIs} <span className="text-red-400 font-bold">{room.players.find(p=>p.uid===room.spyId)?.name || '?'}</span></div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2">
                                        {(lang === 'ar' ? room.scenario?.words_ar : room.scenario?.words_en)?.map((word, i) => (
                                            <button key={i} onClick={() => submitWordVote(word)} className={`word-vote-card ${hasVotedWord === word ? 'selected' : ''}`}>
                                                <span className="font-bold">{word}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {hasVotedWord && <div className="text-xs text-center text-green-400 mt-2">✓ {lang==='ar'?'صوّتت على:':'You voted for:'} <strong>{hasVotedWord}</strong> — {lang==='ar'?'في انتظار الآخرين...':'waiting for others...'}</div>}
                                </>
                            )}
                        </div>
                    )}

                    {room.status === 'discussing' && (
                        <div className="flex flex-col gap-2">
                            <div className="card-container"><div className="flex flex-col gap-2">{room.players.filter(p => p.status === 'active').map(p => (<div key={p.uid} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer bg-white/5 ${room.currentTurnUID === p.uid ? 'border border-primary bg-primary/5' : ''} ${p.uid === currentUID ? 'border border-primary/50' : ''}`} onClick={() => openProfile(p.uid)}><div className="flex-1" style={{minWidth:0}}><PlayerNameTag player={{...p, photoURL:p.photo, displayName:p.name}} lang={lang} size="sm" /></div>{room.currentTurnUID === p.uid && <span className="text-[8px] text-primary flex-shrink-0">🎙 {lang==='ar'?'يتكلم':'Speaking'}</span>}</div>))}</div></div>
                            {!isSpectator && me && (
                                <div className={`identity-square identity-${myRole === 'spy' ? 'spy' : myRole === 'mrwhite' ? 'mrwhite' : myRole === 'informant' ? 'informant' : 'agent'}`}>
                                    <div className="text-4xl mb-2">{myRole === 'spy' ? '🕵️' : myRole === 'mrwhite' ? '👻' : myRole === 'informant' ? '👁️' : '🤵'}</div>
                                    <div className="text-lg font-bold">{myRole === 'spy' ? t.statusSpy : myRole === 'mrwhite' ? t.statusMrWhite : myRole === 'informant' ? t.statusInformant : t.statusAgent}</div>
                                    {myRole === 'spy' && (<div className="text-xs text-yellow-300 mt-1">{lang==='ar'?'الموقع: ':'Location: '}<span className="font-bold">{lang === 'ar' ? room.scenario?.loc_ar : room.scenario?.loc_en}</span></div>)}
                                    {myRole !== 'spy' && room.chosenWord && (<div className="text-xs text-cyan-300 mt-1">{t.selectedWord}: <span className="font-bold">{room.chosenWord}</span></div>)}
                                    {myRole === 'mrwhite' && (<div className="text-xs text-purple-300 mt-1 opacity-80">{lang==='ar'?'لا تعرف الكلمة — استمع بعناية!':'No keyword — listen carefully!'}</div>)}
                                    {myRole === 'informant' && room.spyId && (
                                        <div style={{marginTop:'8px',padding:'6px 10px',background:'rgba(168,85,247,0.18)',borderRadius:'6px',border:'1px solid rgba(168,85,247,0.3)'}}>
                                            <div className="text-xs text-purple-300 font-bold">{t.informantRevealTitle}</div>
                                            <div className="text-xs text-red-400 mt-1">{t.informantSpyIs} <span className="font-bold">{room.players.find(p=>p.uid===room.spyId)?.name || '?'}</span></div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="card-container">
                                <div className="flex items-center justify-between mb-2"><div className="timer-bar-container"><div className="timer-bar-fill" style={{ width: `${(turnTimer / 30) * 100}%` }}></div></div><span className="text-xs text-gray-400">{turnTimer}s</span></div>
                                <div className="flex gap-2">
                                    {isMyTurn && (<button onClick={() => handleSkipTurn()} className="btn-ghost flex-1 py-2 rounded-lg text-xs">{t.skip}</button>)}
                                    <button onClick={requestVoting} className="btn-vote flex-1 py-2 rounded-lg text-xs font-bold">{t.vote}</button>
                                    {myRole === 'spy' && (
                                        <button onClick={spyVoluntaryDeclare} style={{background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.4)',color:'#ef4444',borderRadius:'8px',padding:'0 10px',fontSize:'11px',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}} title={t.spyDeclareDesc}>
                                            {t.spyDeclare}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {room.status === 'voting' && (
                        <div className="card-container">
                            <h3 className="text-sm font-bold mb-2 text-center">{t.vote}</h3>
                            <div className="text-center text-xs text-yellow-400 mb-3">⏱️ {votingTimer}s</div>
                            <div className="flex flex-col gap-2 mb-4">
                                {room.players.filter(p => p.status === 'active').map(p => {
                                    const voteCount = Object.values(room.votes || {}).filter(v => v === p.uid).length;
                                    return (
                                        <button key={p.uid} onClick={() => submitVote(p.uid)} disabled={!!hasVoted} className={`flex items-center gap-2 p-2 rounded-lg w-full text-left bg-white/5 hover:bg-white/10 border ${hasVoted === p.uid ? 'border-primary bg-primary/10' : 'border-transparent'}`}>
                                            <div className="flex-1" style={{minWidth:0}}><PlayerNameTag player={{...p, photoURL:p.photo, displayName:p.name}} lang={lang} size="sm" /></div>
                                            {voteCount > 0 && <span style={{background:'rgba(255,68,68,0.2)',color:'#ef4444',borderRadius:'10px',padding:'1px 7px',fontSize:'11px',fontWeight:700,flexShrink:0}}>🗳 {voteCount}</span>}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="text-xs text-center text-gray-400">{lang==='ar'?`صوّت ${Object.keys(room.votes||{}).length} من ${room.players.filter(p=>p.status==='active').length}`:`${Object.keys(room.votes||{}).length}/${room.players.filter(p=>p.status==='active').length} voted`}</div>
                        </div>
                    )}

                    {/* ── Spy Guessing Phase ── */}
                    {room.status === 'spy_guessing' && (() => {
                        const isGuesser = currentUID === room.ejectedUID || currentUID === room.spyId;
                        const words = lang === 'ar' ? room.scenario?.words_ar : room.scenario?.words_en;
                        return (
                            <div className="card-container text-center">
                                <div className="text-4xl mb-3">🕵️</div>
                                <h2 className="text-base font-bold mb-1" style={{color:'#ef4444'}}>{t.spyGuessTitle}</h2>
                                <p className="text-xs text-gray-400 mb-4">{t.spyGuessDesc}</p>
                                <div className="text-xs text-gray-400 mb-2">{lang==='ar'?'الموقع:':'Location:'} <span className="text-yellow-400 font-bold">{lang==='ar'?room.scenario?.loc_ar:room.scenario?.loc_en}</span></div>
                                {isGuesser ? (
                                    <>
                                        <p className="text-xs text-cyan-300 mb-3">{lang==='ar'?'اختر كلمة السر الصحيحة:':'Pick the correct keyword:'}</p>
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            {words?.map((word, i) => (
                                                <button key={i} onClick={() => submitSpyWordGuess(word)} className="word-vote-card" style={{border:'1px solid rgba(239,68,68,0.3)'}}>
                                                    <span className="font-bold">{word}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-sm text-yellow-400 py-4 animate-pulse">{lang==='ar'?'الجاسوس يختار...':'Spy is choosing...'}</div>
                                )}
                            </div>
                        );
                    })()}

                    {/* ── Mr. White Guessing Phase ── */}
                    {room.status === 'mrwhite_guessing' && (() => {
                        const isGuesser = currentUID === room.ejectedUID || currentUID === room.mrwhiteId;
                        const allLocations = SCENARIOS.map(s => lang==='ar' ? s.loc_ar : s.loc_en);
                        return (
                            <div className="card-container text-center">
                                <div className="text-4xl mb-3">👻</div>
                                <h2 className="text-base font-bold mb-1" style={{color:'#8b5cf6'}}>{t.mrWhiteGuessTitle}</h2>
                                <p className="text-xs text-gray-400 mb-4">{t.mrWhiteGuessDesc}</p>
                                {isGuesser ? (
                                    <>
                                        <p className="text-xs text-purple-300 mb-3">{lang==='ar'?'اختر الموقع الصحيح:':'Pick the correct location:'}</p>
                                        <div className="flex flex-col gap-2 mb-3" style={{maxHeight:'220px',overflowY:'auto'}}>
                                            {SCENARIOS.map((s, i) => (
                                                <button key={i} onClick={() => submitMrWhiteLocationGuess(lang==='ar'?s.loc_ar:s.loc_en)} className="word-vote-card" style={{border:'1px solid rgba(139,92,246,0.3)'}}>
                                                    <span className="font-bold">{lang==='ar'?s.loc_ar:s.loc_en}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-sm text-purple-400 py-4 animate-pulse">{lang==='ar'?'السيد الأبيض يختار...':'Mr. White is choosing...'}</div>
                                )}
                            </div>
                        );
                    })()}

                    {/* ── Game Over ── */}
                    {(room.status === 'finished_spy_caught' || room.status === 'finished_spy_wins' || room.status === 'finished_spy_escaped' || room.status === 'finished_mrwhite_wins') && (
                        <div className="card-container text-center">
                            <div className="text-4xl mb-3">
                                {room.status === 'finished_spy_caught' ? '🎉' : room.status === 'finished_mrwhite_wins' ? '👻' : '🕵️'}
                            </div>
                            <h2 className="text-xl font-bold mb-1">
                                {room.status === 'finished_spy_caught' ? t.agentsWin : room.status === 'finished_mrwhite_wins' ? t.mrWhiteWin : t.spyWin}
                            </h2>
                            {room.ejectedUID && (
                                <div className="text-xs text-gray-400 mb-3">{lang==='ar'?'تم طرد:':'Ejected:'} <span className="text-red-400 font-bold">{room.players.find(p=>p.uid===room.ejectedUID)?.name || room.ejectedUID}</span></div>
                            )}
                            {/* Roles revealed */}
                            <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'10px',padding:'10px',marginBottom:'12px'}}>
                                <div className="text-xs font-bold text-gray-300 mb-2">📋 {t.rolesRevealTitle}</div>
                                <div className="flex flex-col gap-1">
                                    {room.players.filter(p => p.role).map(p => (
                                        <div key={p.uid} className="flex items-center justify-between gap-2" style={{fontSize:'11px'}}>
                                            <span className="text-gray-300 truncate">{p.name}</span>
                                            <span style={{color: p.role==='spy'?'#ef4444':p.role==='mrwhite'?'#8b5cf6':p.role==='informant'?'#a78bfa':'#10b981', fontWeight:700, flexShrink:0}}>
                                                {p.role==='spy'?('🕵️ '+t.statusSpy):p.role==='mrwhite'?('👻 '+t.statusMrWhite):p.role==='informant'?('👁️ '+t.statusInformant):('🤵 '+t.statusAgent)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {room.chosenWord && <div className="text-xs text-cyan-400 mt-2">🔑 {t.selectedWord}: <strong>{room.chosenWord}</strong></div>}
                            </div>
                            {room.admin === currentUID && (<button onClick={resetGame} className="btn-neon w-full py-2 rounded-lg text-sm font-bold mb-2">{t.playAgain}</button>)}
                            <button onClick={handleLeaveRoom} className="btn-ghost w-full py-2 rounded-lg text-sm">{t.leaveRoom}</button>
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════
                        💬 GAME ROOM CHAT — يظهر في كل مراحل اللعبة
                    ══════════════════════════════════════════════════════ */}
                    {room.status !== 'waiting' && (
                        <div style={{
                            marginTop: '8px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                        }}>
                            {/* Chat Header */}
                            <div
                                onClick={() => setShowGameChat(v => !v)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '8px 12px', cursor: 'pointer',
                                    background: showGameChat ? 'rgba(0,242,255,0.05)' : 'rgba(255,255,255,0.02)',
                                    borderBottom: showGameChat ? '1px solid rgba(255,255,255,0.07)' : 'none',
                                    userSelect: 'none',
                                }}
                            >
                                <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                                    <span style={{fontSize:'13px'}}>💬</span>
                                    <span style={{fontSize:'11px',fontWeight:700,color:'rgba(255,255,255,0.7)'}}>
                                        {lang==='ar' ? 'شات الغرفة' : 'Room Chat'}
                                    </span>
                                    {(room.messages||[]).filter(m => m.sender !== 'system').length > 0 && (
                                        <span style={{
                                            background:'rgba(0,242,255,0.2)', color:'#00f2ff',
                                            borderRadius:'20px', padding:'1px 7px', fontSize:'9px', fontWeight:700,
                                        }}>
                                            {(room.messages||[]).filter(m => m.sender !== 'system').length}
                                        </span>
                                    )}
                                </div>
                                <span style={{fontSize:'10px',color:'rgba(255,255,255,0.3)',transition:'transform 0.2s',display:'inline-block',transform:showGameChat?'rotate(180deg)':'rotate(0deg)'}}>▼</span>
                            </div>

                            {showGameChat && (
                                <>
                                    {/* Messages list */}
                                    <div
                                        ref={gameChatRef}
                                        style={{
                                            maxHeight: '180px',
                                            overflowY: 'auto',
                                            padding: '8px 10px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '5px',
                                        }}
                                    >
                                        {(!room.messages || room.messages.length === 0) && (
                                            <div style={{textAlign:'center',color:'rgba(255,255,255,0.2)',fontSize:'11px',padding:'12px 0'}}>
                                                {lang==='ar' ? '... ابدأ المحادثة' : 'No messages yet...'}
                                            </div>
                                        )}
                                        {(room.messages || []).map((msg, i) => {
                                            const isSystem = msg.sender === 'system';
                                            const isMe = msg.sender === currentUID;
                                            const isBot = msg.isBot;
                                            return (
                                                <div key={i} style={{
                                                    display: 'flex',
                                                    flexDirection: isMe ? 'row-reverse' : 'row',
                                                    alignItems: 'flex-end',
                                                    gap: '5px',
                                                }}>
                                                    {isSystem ? (
                                                        <div style={{
                                                            width:'100%', textAlign:'center',
                                                            fontSize:'10px', color:'rgba(255,215,0,0.7)',
                                                            background:'rgba(255,215,0,0.06)',
                                                            borderRadius:'8px', padding:'4px 8px',
                                                            fontStyle:'italic',
                                                        }}>
                                                            {msg.text}
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {/* Avatar */}
                                                            {!isMe && (
                                                                <div style={{
                                                                    width:'22px', height:'22px', borderRadius:'50%',
                                                                    background: isBot ? 'rgba(124,58,237,0.4)' : 'rgba(0,242,255,0.15)',
                                                                    display:'flex', alignItems:'center', justifyContent:'center',
                                                                    fontSize:'11px', flexShrink:0,
                                                                    border: isBot ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(0,242,255,0.2)',
                                                                }}>
                                                                    {isBot ? '🤖' : (msg.name?.[0]?.toUpperCase() || '?')}
                                                                </div>
                                                            )}
                                                            <div style={{maxWidth:'72%'}}>
                                                                {!isMe && (
                                                                    <div style={{
                                                                        fontSize:'9px', fontWeight:700,
                                                                        color: isBot ? '#a78bfa' : 'rgba(0,242,255,0.7)',
                                                                        marginBottom:'2px',
                                                                        paddingLeft:'2px',
                                                                    }}>
                                                                        {msg.name}
                                                                    </div>
                                                                )}
                                                                <div style={{
                                                                    background: isMe
                                                                        ? 'linear-gradient(135deg,rgba(0,242,255,0.25),rgba(112,0,255,0.2))'
                                                                        : isBot
                                                                            ? 'rgba(124,58,237,0.15)'
                                                                            : 'rgba(255,255,255,0.07)',
                                                                    border: isMe
                                                                        ? '1px solid rgba(0,242,255,0.3)'
                                                                        : 'none',
                                                                    borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                                                    padding: '6px 10px',
                                                                    fontSize: '12px',
                                                                    color: 'rgba(255,255,255,0.88)',
                                                                    lineHeight: '1.4',
                                                                    wordBreak: 'break-word',
                                                                }}>
                                                                    {msg.text}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Input */}
                                    {!isSpectator && (
                                        <div style={{
                                            display: 'flex', gap: '6px',
                                            padding: '8px 10px',
                                            borderTop: '1px solid rgba(255,255,255,0.06)',
                                            background: 'rgba(0,0,0,0.2)',
                                        }}>
                                            <input
                                                value={gameChatInput}
                                                onChange={e => setGameChatInput(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendGameMessage(); } }}
                                                placeholder={lang==='ar' ? 'اكتب رسالة...' : 'Type a message...'}
                                                maxLength={200}
                                                style={{
                                                    flex: 1,
                                                    background: 'rgba(255,255,255,0.06)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '10px',
                                                    padding: '7px 12px',
                                                    color: 'white',
                                                    fontSize: '12px',
                                                    outline: 'none',
                                                    minWidth: 0,
                                                }}
                                            />
                                            <button
                                                onClick={sendGameMessage}
                                                disabled={!gameChatInput.trim()}
                                                style={{
                                                    padding: '7px 14px',
                                                    borderRadius: '10px',
                                                    background: gameChatInput.trim()
                                                        ? 'linear-gradient(135deg,rgba(0,242,255,0.3),rgba(112,0,255,0.25))'
                                                        : 'rgba(255,255,255,0.05)',
                                                    border: gameChatInput.trim()
                                                        ? '1px solid rgba(0,242,255,0.4)'
                                                        : '1px solid rgba(255,255,255,0.08)',
                                                    color: gameChatInput.trim() ? '#00f2ff' : 'rgba(255,255,255,0.25)',
                                                    fontSize: '13px',
                                                    fontWeight: 700,
                                                    cursor: gameChatInput.trim() ? 'pointer' : 'not-allowed',
                                                    flexShrink: 0,
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                {lang==='ar' ? '↑' : '↑'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            </div>{/* end new-page-content */}

            {/* ── BOTTOM NAV (only when not in a room) ── */}
            {!room && (
                <nav className="bottom-nav-new" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
                    <div className={`nav-item-new ${activeView==='lobby'||activeView==='ranking'?'active':''}`} onClick={() => setActiveView('lobby')}>
                        <div className="nav-icon-new">🏠</div>
                        <div className="nav-label-new">{lang==='ar'?'اللوبي':t.tabLobby}</div>
                    </div>
                    <div className={`nav-item-new ${activeView==='chat'?'active':''}`} onClick={() => setActiveView('chat')}>
                        <div className="nav-icon-new">💬</div>
                        <div className="nav-label-new">{lang==='ar'?'شات':'Chat'}</div>
                        {(totalFriendsUnread > 0 || friendRequests.length > 0) && <div className="nav-pip-new"></div>}
                    </div>
                    <div className={`nav-item-new ${activeView==='discover'?'active':''}`} onClick={() => setActiveView('discover')}>
                        <div className="nav-icon-new">🔥</div>
                        <div className="nav-label-new">{lang==='ar'?'اكتشف':'Discover'}</div>
                    </div>
                    <div className={`nav-item-new ${activeView==='me'?'active':''}`}
                        onClick={() => setActiveView('me')}>
                        <div className="nav-icon-new">
                            {(isLoggedIn || isGuest) && (currentUserData?.photoURL || currentUserData?.photo)
                                ? <img src={currentUserData.photoURL || currentUserData.photo} alt="" style={{width:'24px',height:'24px',objectFit:'cover',borderRadius:'50%',border:`2px solid ${activeView==='me'?'var(--primary)':'rgba(255,255,255,0.2)'}`}} />
                                : '👤'
                            }
                        </div>
                        <div className="nav-label-new">{lang==='ar'?'أنا':'Me'}</div>
                    </div>
                </nav>
            )}
        </div>
    );
}
