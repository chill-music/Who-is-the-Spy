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
    const [forcedLogoutMsg, setForcedLogoutMsg] = useState(false);

    // Single-session token: unique per browser tab/session
    const SESSION_TOKEN = React.useRef(
        (() => { let t = sessionStorage.getItem('pro_spy_st'); if(!t){ t=Math.random().toString(36).slice(2)+Date.now(); sessionStorage.setItem('pro_spy_st',t); } return t; })()
    ).current;
    const [guestData, setGuestData] = useState(null);
    const [showEmail, setShowEmail] = useState(false);
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
    const [showSettings, setShowSettings] = useState(false);
    const [soundMuted, setSoundMuted] = useState(() => localStorage.getItem('pro_spy_sound_muted') === 'true');

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
                lastActive: firebase.firestore.FieldValue.serverTimestamp()
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
                [`funPass.seasons.${FUN_PASS_SEASON_ID}.purchasedDate`]: firebase.firestore.FieldValue.serverTimestamp(),
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
                'loginRewards.lastClaimDate': firebase.firestore.FieldValue.serverTimestamp(),
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
            updates[`dailyTasks.boxes.${boxId - 1}.claimedAt`] = firebase.firestore.FieldValue.serverTimestamp();

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
                    // Write session token (single-session enforcement)
                    userRef.update({ activeSession: SESSION_TOKEN }).catch(() => {});
                    if (checkLoginRewardsCycle(existingData)) {
                        await userRef.update({ 'loginRewards.currentDay': 0, 'loginRewards.streak': 0, 'loginRewards.cycleMonth': getCurrentCycleMonth() });
                    }
                    const unsubSnap = userRef.onSnapshot(snap => {
                        if (snap.exists) {
                            const d = snap.data();
                            setUserData(d);
                            if (d.displayName) setNickname(d.displayName);
                            // Single-session: if activeSession changed by another device, force logout
                            if (d.activeSession && d.activeSession !== SESSION_TOKEN) {
                                setForcedLogoutMsg(true);
                                auth.signOut();
                            }
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
    useEffect(() => {
        if (!user || isGuest) return;

        // Set online immediately on login
        usersCollection.doc(user.uid).update({
            lastActive: firebase.firestore.FieldValue.serverTimestamp(),
            onlineStatus: 'online'
        }).catch(() => {});

        // Heartbeat every 3 minutes
        const interval = setInterval(() => {
            usersCollection.doc(user.uid).update({
                lastActive: firebase.firestore.FieldValue.serverTimestamp(),
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
                    lastActive: firebase.firestore.FieldValue.serverTimestamp()
                }).catch(() => {});
            } else {
                usersCollection.doc(user.uid).update({
                    onlineStatus: 'online',
                    lastActive: firebase.firestore.FieldValue.serverTimestamp()
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
                'dailyTasks.sessionStartTime': firebase.firestore.FieldValue.serverTimestamp(),
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

    // Notifications Listener
    useEffect(() => {
        if (!user || !isLoggedIn) return;
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
    }, [user, isLoggedIn]);

    // Room Listener
    useEffect(() => { if (!roomId) return; const unsub = roomsCollection.doc(roomId).onSnapshot(async doc => { if (doc.exists) { const data = doc.data(); setRoom(data); if(data.status?.includes('finished') && !data.summaryShown) { setShowSummary(true); historyCollection.add({ ...data, finishedAt: firebase.firestore.FieldValue.serverTimestamp() }); roomsCollection.doc(roomId).update({summaryShown: true});
        // ✅ Update stats, missions, achievements when game ends
        if (isLoggedIn && user) {
            try {
                const me = data.players?.find(p => p.uid === user.uid);
                if (me) {
                    const isSpy = me.role === 'spy' || me.role === 'mrwhite';
                    const spyCaught = data.status === 'finished_spy_caught';
                    const spyEscaped = data.status === 'finished_spy_wins' || data.status === 'finished_spy_escaped';
                    const mrwhiteWon = data.status === 'finished_mrwhite_win' || data.status === 'finished_mrwhite_wins';
                    const agentsWon = spyCaught;

                    // Determine if this player won
                    let iWon = false;
                    if (isSpy && (spyEscaped || mrwhiteWon)) iWon = true;
                    if (!isSpy && agentsWon) iWon = true;

                    // Stats updates — apply VIP XP multiplier
                    const vipXpMult = getVIPXPMultiplier(userData);
                    const gameXP = Math.round((iWon ? 20 : 5) * vipXpMult);
                    const statUpdates = {
                        'stats.losses': firebase.firestore.FieldValue.increment(iWon ? 0 : 1),
                        'stats.wins': firebase.firestore.FieldValue.increment(iWon ? 1 : 0),
                        'stats.xp': firebase.firestore.FieldValue.increment(gameXP),
                    };
                    if (isSpy && iWon) statUpdates['stats.spy_wins'] = firebase.firestore.FieldValue.increment(1);
                    if (!isSpy && iWon) statUpdates['stats.agent_wins'] = firebase.firestore.FieldValue.increment(1);
                    // Win streak
                    if (iWon) {
                        statUpdates['stats.win_streak'] = firebase.firestore.FieldValue.increment(1);
                    } else {
                        statUpdates['stats.win_streak'] = 0;
                    }

                    await usersCollection.doc(user.uid).update(statUpdates);

                    // Mission progress
                    await incrementMissionProgress('gamesPlayed', 1);
                    if (iWon) await incrementMissionProgress('gamesWon', 1);
                    if (isSpy) await incrementMissionProgress('spyGames', 1);

                    // Fetch updated user data and check achievements
                    const updatedDoc = await usersCollection.doc(user.uid).get();
                    if (updatedDoc.exists) {
                        await checkAndUnlockAchievements(updatedDoc.data());
                    }
                }
            } catch (e) { console.error('Game end stats error:', e); }
        }
    } } else { setRoom(null); setRoomId(''); } }); return unsub; }, [roomId, isLoggedIn, user, incrementMissionProgress, checkAndUnlockAchievements]);

    // Leaderboard - Real-time
    useEffect(() => { if (activeView === 'leaderboard') { const unsub = usersCollection.orderBy('stats.wins', 'desc').limit(100).onSnapshot(snap => { let data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => !d.isAnonymous); setLeaderboardData(data); }, error => { usersCollection.limit(100).get().then(snap => { let data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => !d.isAnonymous); data.sort((a, b) => (b.stats?.wins || 0) - (a.stats?.wins || 0)); setLeaderboardData(data); }); }); return unsub; } }, [activeView]);

    // Charisma Leaderboard - Real-time
    useEffect(() => {
        if (activeView === 'leaderboard' && leaderboardTab === 'charisma') {
            const unsub = usersCollection.orderBy('charisma', 'desc').limit(100).onSnapshot(snap => {
                let data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => !d.isAnonymous);
                setCharismaLeaderboard(data);
            }, error => {
                usersCollection.limit(100).get().then(snap => {
                    let data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => !d.isAnonymous);
                    data.sort((a, b) => (b.charisma || 0) - (a.charisma || 0));
                    setCharismaLeaderboard(data);
                });
            });
            return unsub;
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

    // Chats Meta - Real-time
    useEffect(() => { if (!user || !isLoggedIn) return; const unsub = chatsCollection.where('members', 'array-contains', user.uid).onSnapshot(snap => { let total = 0; const meta = {}; snap.docs.forEach(doc => { const d = doc.data(); meta[doc.id] = d; const myUnread = d.unread?.[user.uid] || 0; total += myUnread; }); setChatsMeta(meta); setTotalUnread(total); }); return unsub; }, [user, isLoggedIn]);

    // Timers
    useEffect(() => { if (room?.status === 'discussing' && room?.turnEndTime) { const interval = setInterval(() => { const remaining = Math.max(0, Math.floor((room.turnEndTime - Date.now()) / 1000)); setTurnTimer(remaining); if (remaining <= 0) { handleSkipTurn(true); clearInterval(interval); } }, 1000); return () => clearInterval(interval); } else setTurnTimer(30); }, [room?.status, room?.turnEndTime]);
    useEffect(() => { if (room?.status === 'voting' && room?.votingEndTime) { const interval = setInterval(() => { const remaining = Math.max(0, Math.floor((room.votingEndTime - Date.now()) / 1000)); setVotingTimer(remaining); if (remaining <= 0) { clearInterval(interval); } }, 1000); return () => clearInterval(interval); } else setVotingTimer(30); }, [room?.status, room?.votingEndTime]);
    useEffect(() => { if (room?.status === 'word_selection' && room?.wordSelEndTime) { const interval = setInterval(() => { const remaining = Math.max(0, Math.floor((room.wordSelEndTime - Date.now()) / 1000)); setWordSelTimer(remaining); if (remaining <= 0) { clearInterval(interval); } }, 1000); return () => clearInterval(interval); } else setWordSelTimer(30); }, [room?.status, room?.wordSelEndTime]);

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
            customId: Math.floor(100000 + Math.random() * 900000).toString(),
            stats: { wins: 0, losses: 0, xp: 0 },
            achievements: [],
            friends: [],
            friendRequests: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastChangedName: null,
            lastActive: firebase.firestore.FieldValue.serverTimestamp(),
            isAnonymous: false,
            currency: 100,
            inventory: { frames: [], titles: [], themes: [], badges: [], gifts: [] },
            equipped: { badges: [] },
            charisma: 0,
            bannerURL: null,
            loginRewards: { currentDay: 0, lastClaimDate: null, streak: 0, totalClaims: 0, cycleMonth: getCurrentCycleMonth() },
            activeSession: SESSION_TOKEN
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
            const newGuestData = { uid: guestUID, displayName: guestNick, photoURL: null, customId: Math.floor(100000 + Math.random() * 900000).toString(), stats: { wins: 0, losses: 0, xp: 0 }, currency: 0, charisma: 0, equipped: { badges: [] }, inventory: { frames: [], titles: [], themes: [], badges: [], gifts: [] }, isAnonymous: true, isGuest: true, createdAt: firebase.firestore.FieldValue.serverTimestamp(), lastActive: firebase.firestore.FieldValue.serverTimestamp() };
            try { await guestsCollection.doc(guestUID).set(newGuestData); setGuestData(newGuestData); setNickname(guestNick); localStorage.setItem('pro_spy_guest_uid', guestUID); localStorage.setItem('pro_spy_nick', guestNick); } catch (e) { }
        };
        initGuest();
    }, [authLoading, user]);

    useEffect(() => { if (!guestData?.uid) return; const unsub = guestsCollection.doc(guestData.uid).onSnapshot(snap => { if (snap.exists) setGuestData({ id: snap.id, ...snap.data() }); }); return unsub; }, [guestData?.uid]);

    const getDefaultPhoto = useCallback((uData, name) => uData?.photoURL || `https://ui-avatars.com/api/?name=${name || 'Guest'}&background=random`, []);

    // Notification Functions
    const createNotification = useCallback(async (toUserId, type, message, fromUserId, fromName, giftData = null) => { try { await notificationsCollection.add({ toUserId, fromUserId, fromName, type, message, giftData, timestamp: firebase.firestore.FieldValue.serverTimestamp(), read: false }); } catch (e) { } }, []);
    const markNotificationRead = useCallback(async (notifId) => { try { await notificationsCollection.doc(notifId).update({ read: true }); } catch (e) { } }, []);
    const clearAllNotifications = useCallback(async () => { try { const batch = db.batch(); notifications.forEach(n => { batch.delete(notificationsCollection.doc(n.id)); }); await batch.commit(); setNotifications([]); setUnreadNotifications(0); } catch (e) { } }, [notifications]);
    const handleNotificationClick = useCallback((notif) => { if (notif.type === 'friend_request') { setActiveView('friends'); } else if (notif.type === 'gift') { setNotification(notif.message); } else if (notif.type === 'message') { if (notif.fromUserId && notif.fromName) { const friend = { uid: notif.fromUserId, displayName: notif.fromName, photoURL: notif.fromPhoto }; setChatFriend(friend); setShowPrivateChat(true); } } }, []);

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
            updates['loginRewards.lastClaimDate'] = firebase.firestore.FieldValue.serverTimestamp();
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
        await roomsCollection.doc(id).set({ id, admin: uid, status: 'waiting', players: [{ uid: uid, name: nickname, status: 'active', photo: getDefaultPhoto(tempUserData, nickname), role: null, equipped: tempUserData?.equipped || {} }], scenario: null, spyId: null, currentTurnUID: null, turnEndTime: null, votingEndTime: null, currentRound: 0, messages: [], votes: {}, usedLocations: [], wordVotes: {}, chosenWord: null, wordSelEndTime: null, votingRequest: null, mode: setupMode, isPrivate: isPrivate, password: isPrivate ? password : null, startedAt: null, summaryShown: false });
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
            if (!exists) { await ref.update({ players: [...data.players, { uid: uid, name: nickname, status: 'active', photo: getDefaultPhoto(tempUserData, nickname), role: null, equipped: tempUserData?.equipped || {} }] }); }
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
    const startGame = useCallback(async () => { if (room.admin !== currentUID) return; playSound('success'); const activePlayers = room.players.filter(p => p.status === 'active'); const playerCount = activePlayers.length; if (room.mode === 'advanced' && playerCount < 6) { setAlertMessage("Advanced mode requires 6+ players!"); return; } if (playerCount < 3) { setAlertMessage(t.needPlayers); return; } if (playerCount > 10) { setAlertMessage("Max 10 players."); return; } const used = room.usedLocations || []; const avail = SCENARIOS.filter(s => !used.includes(s.loc_en)); const scenario = (avail.length > 0 ? avail : SCENARIOS)[Math.floor(Math.random() * (avail.length || SCENARIOS.length))]; const spy = activePlayers[Math.floor(Math.random() * activePlayers.length)]; let roles = {}; if (room.mode === 'advanced') { roles[spy.uid] = 'spy'; let potentialWhites = activePlayers.filter(p => p.uid !== spy.uid); if(potentialWhites.length > 0) { const mrWhite = potentialWhites[Math.floor(Math.random() * potentialWhites.length)]; roles[mrWhite.uid] = 'mrwhite'; potentialWhites = potentialWhites.filter(p => p.uid !== mrWhite.uid); } if(potentialWhites.length > 0) { const informant = potentialWhites[Math.floor(Math.random() * potentialWhites.length)]; roles[informant.uid] = 'informant'; } activePlayers.forEach(p => { if(!roles[p.uid]) roles[p.uid] = 'agent'; }); } else { activePlayers.forEach(p => roles[p.uid] = p.uid === spy.uid ? 'spy' : 'agent'); } let potentialStarters = activePlayers.filter(p => roles[p.uid] !== 'spy'); if (potentialStarters.length === 0) potentialStarters = activePlayers; const firstPlayer = potentialStarters[Math.floor(Math.random() * potentialStarters.length)]; await roomsCollection.doc(roomId).update({ status: 'word_selection', scenario, spyId: spy.uid, currentTurnUID: firstPlayer.uid, turnEndTime: null, currentRound: 1, players: room.players.map(p => ({ ...p, vote: null, role: roles[p.uid] || 'agent' })), usedLocations: firebase.firestore.FieldValue.arrayUnion(scenario.loc_en), messages: [], votes: {}, wordVotes: {}, chosenWord: null, wordSelEndTime: Date.now() + 30000, votingRequest: null, startedAt: firebase.firestore.FieldValue.serverTimestamp() }); }, [room, currentUID, roomId, t]);
    const submitWordVote = useCallback(async (word) => { if (!currentUID || !room || room.status !== 'word_selection') return; playSound('click'); const voteUpdate = {}; voteUpdate[`wordVotes.${currentUID}`] = word; await roomsCollection.doc(roomId).update(voteUpdate); }, [currentUID, room, roomId]);
    const handleSkipTurn = useCallback(async (forced = false) => { if (!room) return; if (!forced && room.currentTurnUID !== currentUID) return; if (forced && room.status !== 'discussing') return; nextTurn(); }, [room, currentUID]);
    const nextTurn = useCallback(async () => { if (!room) return; const activePlayers = room.players.filter(p => p.status === 'active'); const currentIndex = activePlayers.findIndex(p => p.uid === room.currentTurnUID); const nextIndex = (currentIndex + 1) % activePlayers.length; await roomsCollection.doc(roomId).update({ currentTurnUID: activePlayers[nextIndex].uid, turnEndTime: Date.now() + 30000 }); }, [room, roomId]);
    const requestVoting = useCallback(async () => { if (!room || room.status !== 'discussing') return; playSound('click'); if (room.admin === currentUID) { await triggerVoting(); return; } await roomsCollection.doc(roomId).update({ votingRequest: { requestedBy: currentUID, votes: { [currentUID]: true } } }); }, [room, currentUID, roomId]);
    const agreeToVote = useCallback(async () => { if (!room || !room.votingRequest) return; playSound('click'); const currentVotes = room.votingRequest.votes || {}; const newVotes = { ...currentVotes, [currentUID]: true }; const activePlayers = room.players.filter(p => p.status === 'active'); if (currentUID === room.admin) { await triggerVoting(); return; } const agreeCount = Object.values(newVotes).filter(v => v === true).length; const majorityCount = Math.floor(activePlayers.length / 2) + 1; if (agreeCount >= majorityCount) { await triggerVoting(); } else { await roomsCollection.doc(roomId).update({ "votingRequest.votes": newVotes }); } }, [room, currentUID, roomId]);
    const declineVote = useCallback(async () => { if (!room || !room.votingRequest) return; playSound('click'); const currentVotes = room.votingRequest.votes || {}; const newVotes = { ...currentVotes, [currentUID]: false }; const activePlayers = room.players.filter(p => p.status === 'active'); const declineCount = Object.values(newVotes).filter(v => v === false).length; const majorityCount = Math.floor(activePlayers.length / 2) + 1; if (declineCount >= majorityCount) { await roomsCollection.doc(roomId).update({ votingRequest: null }); } else { await roomsCollection.doc(roomId).update({ "votingRequest.votes": newVotes }); } }, [room, currentUID, roomId]);
    const triggerVoting = useCallback(async () => { playSound('click'); const sysMsg = { sender: 'system', name: 'SYSTEM', text: t.votingStarted, time: Date.now() }; await roomsCollection.doc(roomId).update({ status: 'voting', currentTurnUID: null, turnEndTime: null, votingEndTime: Date.now() + 30000, messages: firebase.firestore.FieldValue.arrayUnion(sysMsg), votingRequest: null }); }, [roomId, t]);
    const submitVote = useCallback(async (targetUID) => { if (!targetUID || !currentUID || (room.votes && room.votes[currentUID])) return; playSound('click'); const voteUpdate = {}; voteUpdate[`votes.${currentUID}`] = targetUID; await roomsCollection.doc(roomId).update(voteUpdate); }, [room, currentUID, roomId]);
    const resetGame = useCallback(async () => { playSound('click'); await roomsCollection.doc(roomId).update({ status: 'waiting', scenario: null, spyId: null, currentTurnUID: null, currentRound: 0, votes: {}, messages: [], votingEndTime: null, turnEndTime: null, players: room.players.map(p => ({ uid: p.uid, name: p.name, status: 'active', photo: p.photo, role: null })), wordVotes: {}, chosenWord: null, wordSelEndTime: null, votingRequest: null, startedAt: null, finishedAt: null, summaryShown: false }); setShowSummary(false); }, [room, roomId]);

    // Friend Functions
    const openProfile = useCallback((uid) => { if(!uid) return; setTargetProfileUID(uid); setShowUserProfile(true); }, []);
    const openPrivateChat = useCallback((friend) => { setChatFriend(friend); setShowPrivateChat(true); if (user) { const cId = [user.uid, friend.uid].sort().join('_'); setOpenChatId(cId); chatsCollection.doc(cId).update({ [`unread.${user.uid}`]: 0 }).catch(() => {}); } }, [user]);
    const closePrivateChat = useCallback(() => { setShowPrivateChat(false); setChatFriend(null); setOpenChatId(null); }, []);
    const handleSendRequest = useCallback(async (targetUid) => { if (!targetUid || !isLoggedIn) return; if (userData.friends?.includes(targetUid)) return; if (userData.friendRequests?.includes(targetUid)) return; await usersCollection.doc(targetUid).update({ friendRequests: firebase.firestore.FieldValue.arrayUnion(user.uid) }); await createNotification(targetUid, 'friend_request', `${userData.displayName} ${t.friendRequest}`, user.uid, userData.displayName); }, [userData, user, isLoggedIn, t, createNotification]);
    const handleAddFriendById = useCallback(async () => {
        if (!addFriendId.trim() || !isLoggedIn) return;
        setFriendSearchMsg('');
        const userQuery = await usersCollection.where('customId', '==', addFriendId.trim()).get();
        if (userQuery.empty) { const uidQuery = await usersCollection.where(firebase.firestore.FieldPath.documentId(), '>=', addFriendId.trim()).where(firebase.firestore.FieldPath.documentId(), '<=', addFriendId.trim() + '\uf8ff').get(); if (uidQuery.empty) { setFriendSearchMsg(t.friendNotFound); return; } const targetUid = uidQuery.docs[0].id; if (targetUid === user.uid) { setFriendSearchMsg(lang === 'ar' ? 'لا يمكنك إضافة نفسك' : 'Cannot add yourself'); return; } if (userData.friends?.includes(targetUid)) { setFriendSearchMsg(lang === 'ar' ? 'صديق بالفعل' : 'Already a friend'); return; } await handleSendRequest(targetUid); setFriendSearchMsg(t.requestSent); setAddFriendId(''); return; }
        const targetUid = userQuery.docs[0].id;
        if (targetUid === user.uid) { setFriendSearchMsg(lang === 'ar' ? 'لا يمكنك إضافة نفسك' : 'Cannot add yourself'); return; }
        if (userData.friends?.includes(targetUid)) { setFriendSearchMsg(lang === 'ar' ? 'صديق بالفعل' : 'Already a friend'); return; }
        if (userData.friendRequests?.includes(targetUid)) { setFriendSearchMsg(lang === 'ar' ? 'لديك طلب من هذا المستخدم' : 'You have a request from this user'); return; }
        await handleSendRequest(targetUid);
        setFriendSearchMsg(t.requestSent);
        setAddFriendId('');
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

    // 🎁 GIFT FUNCTIONS - NO CASHBACK, BONUS FOR RECEIVER ONLY
    const handleSendGiftToUser = useCallback(async (gift, targetUser, qty = 1) => {
        const currency = userData?.currency || 0;
        const totalCost = gift.cost * qty;
        if (currency < totalCost) return;

        // ✅ For multi-qty: send qty times
        const sendOnce = async () => {
        // ✅ Generate bonus for RECEIVER only
        const minBonus = gift.minBonus || 1;
        const maxBonus = gift.maxBonus || Math.floor(gift.cost * 0.1);
        const bonusForReceiver = generateRandomBonus(minBonus, maxBonus);

        const giftName = lang === 'ar' ? gift.name_ar : gift.name_en;

        try {
            // Deduct from sender (NO cashback)
            await usersCollection.doc(user.uid).update({
                currency: firebase.firestore.FieldValue.increment(-gift.cost)
            });

            if (targetUser?.uid === 'self' || targetUser?.uid === user.uid) {
                // Sending to self
                const vipXpGain = getGiftVIPXP(gift);
                await usersCollection.doc(user.uid).update({
                    charisma: firebase.firestore.FieldValue.increment(gift.charisma),
                    currency: firebase.firestore.FieldValue.increment(bonusForReceiver),
                    'vip.xp': firebase.firestore.FieldValue.increment(vipXpGain),
                });

                // ✅ Log self-sent gift to gifts_log collection too
                await giftsLogCollection.add({
                    senderId: user.uid,
                    senderName: userData?.displayName || 'User',
                    senderPhoto: userData?.photoURL || null,
                    receiverId: user.uid,
                    receiverName: userData?.displayName || 'User',
                    giftId: gift.id,
                    giftName: giftName,
                    giftNameEn: gift.name_en,
                    giftNameAr: gift.name_ar,
                    giftEmoji: gift.emoji,
                    giftImageUrl: gift.imageUrl || '',
                    charisma: gift.charisma,
                    bonus: bonusForReceiver,
                    cost: gift.cost,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

                // 📝 Also log gift card to SelfChat
                try {
                    const selfChatId = `${user.uid}_self`;
                    const selfChatRef = chatsCollection.doc(selfChatId);
                    await selfChatRef.set({
                        participants: [user.uid, user.uid],
                        type: 'self',
                        lastMessage: `🎁 ${giftName}`,
                        lastAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                    await selfChatRef.collection('messages').add({
                        type: 'gift',
                        giftEmoji: gift.emoji || '🎁',
                        giftName: `${gift.name_en} / ${gift.name_ar}`,
                        giftCost: gift.cost,
                        charismaGain: gift.charisma,
                        bonusIntel: bonusForReceiver,
                        senderId: user.uid,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } catch(e) { }
            } else {
                // Sending to another person - add charisma AND bonus
                const vipXpGain = getGiftVIPXP(gift);
                await usersCollection.doc(user.uid).update({
                    'vip.xp': firebase.firestore.FieldValue.increment(vipXpGain),
                });
                await usersCollection.doc(targetUser.uid).update({
                    charisma: firebase.firestore.FieldValue.increment(gift.charisma),
                    currency: firebase.firestore.FieldValue.increment(bonusForReceiver)
                });

                const chatId = [user.uid, targetUser.uid].sort().join('_');

                // Add gift message to chat
                await chatsCollection.doc(chatId).collection('messages').add({
                    senderId: user.uid,
                    senderName: userData?.displayName || 'User',
                    senderPhoto: userData?.photoURL || null,
                    type: 'gift',
                    giftId: gift.id,
                    giftName: giftName,
                    giftNameEn: gift.name_en,
                    giftNameAr: gift.name_ar,
                    giftEmoji: gift.emoji,
                    giftCharisma: gift.charisma,
                    giftBonus: bonusForReceiver,
                    text: `🎁 ${lang === 'ar' ? 'أرسل هدية' : 'Sent a gift'}: ${gift.emoji}`,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Update chat metadata
                await chatsCollection.doc(chatId).set({
                    members: [user.uid, targetUser.uid],
                    lastMessage: `🎁 ${giftName}`,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    [`unread.${targetUser.uid}`]: firebase.firestore.FieldValue.increment(1)
                }, { merge: true });

                // ✅ Log gift to gifts_log collection
                await giftsLogCollection.add({
                    senderId: user.uid,
                    senderName: userData?.displayName || 'User',
                    senderPhoto: userData?.photoURL || null,
                    receiverId: targetUser.uid,
                    receiverName: targetUser.displayName || 'User',
                    giftId: gift.id,
                    giftName: giftName,
                    giftNameEn: gift.name_en,
                    giftNameAr: gift.name_ar,
                    giftEmoji: gift.emoji,
                    giftImageUrl: gift.imageUrl || '',
                    charisma: gift.charisma,
                    bonus: bonusForReceiver,
                    cost: gift.cost,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Send notification to receiver
                await createNotification(
                    targetUser.uid,
                    'gift',
                    `${userData?.displayName || 'User'} ${t.sentAGift}: ${gift.emoji} (+${formatCharisma(gift.charisma)} ⭐, +${bonusForReceiver} 🧠)`,
                    user.uid,
                    userData?.displayName || 'User',
                    { giftId: gift.id, giftEmoji: gift.emoji, giftName, charisma: gift.charisma, bonus: bonusForReceiver }
                );
            }

            // ✅ Mission: giftsSent + giftsSent stat for achievements
            await incrementMissionProgress('giftsSent', 1);
            await usersCollection.doc(user.uid).update({
                giftsSent: firebase.firestore.FieldValue.increment(1)
            });
            // ✅ giftsReceived for the receiver
            if (targetUser?.uid && targetUser.uid !== 'self' && targetUser.uid !== user.uid) {
                await usersCollection.doc(targetUser.uid).update({
                    giftsReceived: firebase.firestore.FieldValue.increment(1)
                });
            } else {
                await usersCollection.doc(user.uid).update({
                    giftsReceived: firebase.firestore.FieldValue.increment(1)
                });
            }
        }; // end sendOnce

        try {
            // ✅ Send qty times (for multi-quantity support)
            for (let i = 0; i < qty; i++) {
                await sendOnce();
            }
            // ✅ Gift sound removed — only notification toast
            setNotification(qty > 1
                ? `🎁 ${t.giftSent} ×${qty}!`
                : `🎁 ${t.giftSent}!`
            );
            // ✅ Check achievements after gifting
            const updDoc = await usersCollection.doc(user.uid).get();
            if (updDoc.exists) await checkAndUnlockAchievements(updDoc.data());
        } catch (error) {
            }
    }, [userData, user, t, createNotification, lang, incrementMissionProgress, checkAndUnlockAchievements]);

    // Shop Functions
    const handlePurchase = useCallback(async (item, targetUser = null, qty = 1) => {
        if (!user || !isLoggedIn) { setShowLoginAlert(true); return; }
        const currency = userData?.currency || 0;
        if (currency < item.cost) { setNotification(t.purchaseFail); return; }
        const inventory = userData?.inventory || { frames: [], titles: [], themes: [], badges: [], gifts: [] };

        if (item.type === 'gifts') {
            // ✅ FIX: if targetUser is specified (send to friend) → keep old flow
            // If buying for self (no target or target=self) → add to inventory instead of instant charisma
            if (targetUser && targetUser.uid !== 'self' && targetUser.uid !== user?.uid) {
                await handleSendGiftToUser(item, targetUser, qty || 1);
                return;
            }
            // Buying for self → add to inventory
            const currency = userData?.currency || 0;
            if (currency < item.cost) { setNotification(t.purchaseFail); return; }
            const inventory = userData?.inventory || { frames: [], titles: [], themes: [], badges: [], gifts: [] };
            try {
                await usersCollection.doc(user.uid).update({
                    currency: firebase.firestore.FieldValue.increment(-item.cost),
                    'inventory.gifts': firebase.firestore.FieldValue.arrayUnion(item.id)
                });
                playSound('success');
                const giftName = lang === 'ar' ? item.name_ar : item.name_en;
                setNotification(`🎁 ${giftName} ${lang === 'ar' ? 'أُضيفت للمخزون!' : 'added to inventory!'}`);
            } catch (e) { setNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); }
            return;
        }

        if (inventory[item.type]?.includes(item.id)) { setNotification(t.alreadyOwned); return; }
        try {
            const newInventory = { ...inventory, [item.type]: [...(inventory[item.type] || []), item.id] };
            await usersCollection.doc(user.uid).update({ currency: currency - item.cost, inventory: newInventory });
            playSound('success');
            setNotification(t.purchaseSuccess);
        } catch (error) { }
    }, [user, userData, isLoggedIn, t, handleSendGiftToUser]);

    // 👑 شراء VIP من الشوب
    const handleBuyVIP = useCallback(async () => {
        if (!user || !isLoggedIn) { setShowLoginAlert(true); return; }
        const VIP_SHOP_COST = 50000;
        const VIP_SHOP_XP   = 5000;   // XP الممنوحة عند الشراء
        const currency = userData?.currency || 0;
        if (currency < VIP_SHOP_COST) {
            setNotification(lang === 'ar' ? `❌ تحتاج ${VIP_SHOP_COST.toLocaleString()} 🧠` : `❌ Need ${VIP_SHOP_COST.toLocaleString()} 🧠`);
            return;
        }
        try {
            // ✅ Subscription: 30 days from now
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            // ✅ Get current VIP level + vipItems for that level
            const currentXP  = (userData?.vip?.xp || 0) + VIP_SHOP_XP;
            const newLevel   = getVIPLevelFromXP(currentXP);
            const levelCfg   = VIP_CONFIG.find(v => v.level === newLevel);
            const vipItems   = levelCfg?.vipItems || [];

            const updates = {
                currency:        firebase.firestore.FieldValue.increment(-VIP_SHOP_COST),
                'vip.xp':        firebase.firestore.FieldValue.increment(VIP_SHOP_XP),
                'vip.isActive':  true,
                'vip.expiresAt': firebase.firestore.Timestamp.fromDate(expiresAt),
                'vip.purchasedAt': firebase.firestore.FieldValue.serverTimestamp(),
            };

            // ✅ Add vipItems to inventory
            for (const item of vipItems) {
                if (item.type === 'frames')  updates['inventory.frames']  = firebase.firestore.FieldValue.arrayUnion(item.id);
                if (item.type === 'badges')  updates['inventory.badges']  = firebase.firestore.FieldValue.arrayUnion(item.id);
                if (item.type === 'titles')  updates['inventory.titles']  = firebase.firestore.FieldValue.arrayUnion(item.id);
            }

            await usersCollection.doc(user.uid).update(updates);
            playSound('success');
            setNotification(lang === 'ar'
                ? `👑 تم شراء VIP! +${VIP_SHOP_XP.toLocaleString()} XP — صالح 30 يوم`
                : `👑 VIP Purchased! +${VIP_SHOP_XP.toLocaleString()} XP — Valid 30 days`
            );
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
    if (authLoading) { return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="text-4xl animate-bounce mb-4">🕵️</div><div className="text-lg font-bold">{t.loading}</div></div></div>; }

    return (
        <div className="main-wrapper" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <NotificationToast message={notification} onClose={() => setNotification(null)} />

            {showOnboarding && (
                <OnboardingModal
                    show={showOnboarding}
                    googleUser={onboardingGoogleUser}
                    onComplete={handleOnboardingComplete}
                    lang={lang}
                />
            )}

            {forcedLogoutMsg && (
                <div className="modal-overlay" style={{zIndex:Z.FORCED}}>
                    <div className="animate-pop" onClick={e => e.stopPropagation()} style={{
                        background:'linear-gradient(180deg,#1a0a0a,#0f0f1a)',
                        border:'1px solid rgba(239,68,68,0.4)',
                        borderRadius:'18px', width:'100%', maxWidth:'340px',
                        padding:'28px 24px', textAlign:'center',
                        boxShadow:'0 0 40px rgba(239,68,68,0.2)'
                    }}>
                        <div style={{fontSize:'44px', marginBottom:'12px'}}>⚠️</div>
                        <div style={{fontSize:'15px', fontWeight:900, color:'#ef4444', marginBottom:'8px'}}>
                            {lang === 'ar' ? 'تم تسجيل خروجك' : 'Signed Out'}
                        </div>
                        <div style={{fontSize:'12px', color:'#9ca3af', marginBottom:'20px', lineHeight:1.6}}>
                            {lang === 'ar'
                                ? 'تم فتح حسابك على جهاز آخر. لا يمكن تسجيل الدخول في مكانين في نفس الوقت.'
                                : 'Your account was opened on another device. You cannot be logged in on two devices simultaneously.'}
                        </div>
                        <button onClick={() => setForcedLogoutMsg(false)} style={{
                            background:GR.NEON,
                            border:'none', borderRadius:'10px', color:'white',
                            fontWeight:700, fontSize:'13px', padding:'10px 24px', cursor:'pointer', width:'100%'
                        }}>
                            {lang === 'ar' ? 'حسناً' : 'OK'}
                        </button>
                    </div>
                </div>
            )}
            {showLoginAlert && (
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
                        <div className="modal-body text-center"><div className="text-4xl mb-4">{room.status === 'finished_spy_caught' ? '🎉' : '🕵️'}</div><h2 className="text-xl font-bold mb-4">{room.status === 'finished_spy_caught' ? t.agentsWin : t.spyWin}</h2></div>
                        <div className="modal-footer">{room.admin === currentUID && (<button onClick={resetGame} className="btn-neon w-full py-2 rounded-lg text-sm font-bold mb-2">{t.playAgain}</button>)}<button onClick={handleLeaveRoom} className="btn-ghost w-full py-2 rounded-lg text-sm">{t.leaveRoom}</button></div>
                    </div>
                </div>
            )}

            <ShopModal show={showShop} onClose={() => setShowShop(false)} userData={isLoggedIn ? userData : guestData} lang={lang} onPurchase={handlePurchase} onEquip={handleEquip} onUnequip={handleUnequip} onBuyVIP={handleBuyVIP} />
            <InventoryModal show={showInventory} onClose={() => setShowInventory(false)} userData={isLoggedIn ? userData : guestData} lang={lang} onEquip={handleEquip} onUnequip={handleUnequip} onSendGift={handleSendGiftToUser} friendsData={friendsData} isLoggedIn={isLoggedIn} currentUserData={currentUserData} user={user} />
            <SettingsModal show={showSettings} onClose={() => setShowSettings(false)} lang={lang} userData={userData} user={user} onNotification={setNotification} isGuest={isGuest} onLoginGoogle={handleGoogleLogin} />

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
                onOpenProfile={(uid) => { setTargetProfileUID(uid); }}
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

            {/* Header */}
            <header className="site-header">
                <div className="logo-container">
                    <div className="logo-icon">🕵️</div>
                    <div>
                        <h1 className="game-title">{t.appName}</h1>
                        <p className="text-[8px] text-gray-400 uppercase tracking-widest">{t.tagline}</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button onClick={() => { if(isLoggedIn) setShowFunPass(true); else requireLogin(); }} title="Fun Pass" style={{background:GR.GOLD,border:'1px solid rgba(255,215,0,0.35)',color:'#ffd700',fontWeight:900,borderRadius:'6px',padding:'4px 8px',fontSize:'12px',cursor:'pointer'}}>🎫</button>
                    <button onClick={() => { const nl = lang==='en'?'ar':'en'; setLang(nl); localStorage.setItem('pro_spy_lang', nl); }} className="text-xs bg-white/10 px-2 py-1 rounded">{t.langBtn}</button>
                    {isLoggedIn && (
                        <div className="notification-center">
                            <div ref={notificationBellRef} className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}><span className="notification-bell-icon">🔔</span>{unreadNotifications > 0 && <span className="notification-badge">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>}</div>
                            <NotificationDropdown show={showNotifications} onClose={() => setShowNotifications(false)} notifications={notifications} onMarkRead={markNotificationRead} onClearAll={clearAllNotifications} onNotificationClick={handleNotificationClick} lang={lang} />
                        </div>
                    )}
                    <div className="relative">
                        <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
                            {isLoggedIn || isGuest ? (<><AvatarWithFrame photoURL={currentUserData?.photoURL} equipped={currentUserData?.equipped} size="sm" /><span className="text-[10px] text-gray-300 max-w-[60px] truncate">{currentUserData?.displayName}</span></>) : (<span className="text-xs px-2 py-1">{t.loginGoogle}</span>)}
                        </button>
                        {showDropdown && (
                            <div className="dropdown-menu glass-panel rounded-lg p-1 min-w-[160px]">
                                {isLoggedIn || isGuest ? (<>
                                    <button onClick={() => { setShowMyAccount(true); setShowDropdown(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2"><span>👤</span> {t.myAccount}</button>
                                    {isLoggedIn && (<>
                                        <button onClick={() => { setShowShop(true); setShowDropdown(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2"><span>🛒</span> {t.shop}</button>
                                        <button onClick={() => { setShowInventory(true); setShowDropdown(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2"><span>📦</span> {t.inventory}</button>
                                        <button onClick={() => { if(!sessionClaimedToday) setShowLoginRewards(true); setShowDropdown(false); }} className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2 ${sessionClaimedToday ? 'opacity-50' : ''}`}><span>🎁</span> {t.loginRewards} {sessionClaimedToday && <span className="text-[8px] text-green-400">✓</span>}</button>
                                    </>)}
                                    <button onClick={() => { setShowSettings(true); setShowDropdown(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2"><span>⚙️</span> {t.settings}</button>
                                    <button onClick={() => { handleLogout(); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2 text-red-400"><span>🚪</span> {t.logout}</button>
                                </>) : (<button onClick={() => { handleGoogleLogin(); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2"><span>🔑</span> {t.loginGoogle}</button>)}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            {!room && (
                <main className="main-content">
                    <div className="tab-container mb-3">
                        <button onClick={() => setActiveView('lobby')} className={`tab-button ${activeView === 'lobby' ? 'active' : ''}`}>{t.tabLobby}</button>
                        <button onClick={() => setActiveView('leaderboard')} className={`tab-button ${activeView === 'leaderboard' ? 'active' : ''}`}>{t.tabLeaderboard}</button>
                        <button onClick={() => { if(isLoggedIn) setActiveView('friends'); else requireLogin(); }} className={`tab-button relative ${activeView === 'friends' ? 'active' : ''}`}>{t.tabFriends}{totalFriendsUnread > 0 && <span className="friends-tab-badge">{totalFriendsUnread > 9 ? '9+' : totalFriendsUnread}</span>}</button>
                    </div>

                    {activeView === 'lobby' && (
                        <div className="card-container">
                            {isGuest && <GuestBanner lang={lang} />}
                            <div className="space-y-3">
                                <div><label className="text-[10px] text-gray-400 block mb-1">{t.nickname}</label><input className="input-dark w-full p-3 rounded-lg font-bold" value={nickname} onChange={e => { setNickname(e.target.value); localStorage.setItem('pro_spy_nick', e.target.value); }} placeholder={t.nickname} /></div>
                                <div className="flex gap-2"><button onClick={() => setShowSetupModal(true)} disabled={!nickname.trim()} className="btn-neon flex-1 py-3 rounded-lg font-bold text-sm">{t.create}</button><button onClick={() => setShowBrowseRooms(true)} className="btn-ghost px-4 py-3 rounded-lg text-sm">{t.browse}</button></div>
                                <div className="flex items-center gap-2"><input className="input-dark flex-1 p-3 rounded-lg text-center font-mono uppercase tracking-wider" value={inputCode} onChange={e => setInputCode(e.target.value.toUpperCase())} placeholder={t.codePlaceholder} maxLength={6} /><button onClick={() => handleJoinGame(inputCode, '')} disabled={loading || !inputCode.trim() || !nickname.trim()} className="btn-neon px-4 py-3 rounded-lg font-bold text-sm">{loading ? '...' : t.join}</button></div>
                                {joinError && <p className="text-xs text-red-400 text-center">{joinError}</p>}
                            </div>
                            {/* Daily Tasks - only for logged in users */}
                            {isLoggedIn && userData && (
                                <DailyTasksComponent
                                    userData={userData}
                                    user={user}
                                    lang={lang}
                                    onClaim={() => {}}
                                    onNotification={setNotification}
                                />
                            )}
                        </div>
                    )}

                    {activeView === 'leaderboard' && (
                        <div className="card-container">
                            {/* Leaderboard Tabs */}
                            <div className="leaderboard-tabs">
                                <button
                                    onClick={() => setLeaderboardTab('wins')}
                                    className={`leaderboard-tab ${leaderboardTab === 'wins' ? 'active' : ''}`}
                                >
                                    🏆 {t.wins}
                                </button>
                                <button
                                    onClick={() => setLeaderboardTab('charisma')}
                                    className={`leaderboard-tab gold ${leaderboardTab === 'charisma' ? 'active' : ''}`}
                                >
                                    ⭐ {t.charismaRank}
                                </button>
                            </div>

                            <div className="overflow-y-auto max-h-[60vh]">
                                {(leaderboardTab === 'charisma' ? charismaLeaderboard : leaderboardData).map((player, i) => {
                                    const rank = i + 1;
                                    const isTop3 = rank <= 3;
                                    return (
                                        <div
                                            key={player.id}
                                            onClick={() => openProfile(player.id)}
                                            className={`leaderboard-row cursor-pointer ${isTop3 && leaderboardTab === 'charisma' ? 'rank-' + rank : ''}`}
                                        >
                                            {isTop3 && leaderboardTab === 'charisma' ? (
                                                <div className="charisma-rank-position">
                                                    {rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉'}
                                                </div>
                                            ) : (
                                                <span className="w-6 text-xs font-bold text-gray-500">{rank}</span>
                                            )}
                                            <AvatarWithFrame photoURL={player.photoURL} equipped={player.equipped} size="sm" />
                                            <span className="flex-1 text-sm font-medium truncate">{player.displayName}</span>
                                            <div className="text-right">
                                                {leaderboardTab === 'charisma' ? (
                                                    <div className="text-xs font-bold text-yellow-400">⭐ {formatCharisma(player.charisma || 0)}</div>
                                                ) : (
                                                    <div className="text-xs font-bold text-primary">{player.stats?.wins || 0} {t.wins}</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeView === 'friends' && (
                        <div className="card-container friends-container">
                            <div className="add-friend-section">
                                <div className="add-friend-title">{t.addFriend}</div>
                                <div className="add-friend-input-row"><input type="text" className="add-friend-input" value={addFriendId} onChange={e => setAddFriendId(e.target.value)} placeholder={t.friendIdPlaceholder} /><button onClick={handleAddFriendById} disabled={!addFriendId.trim()} className="btn-neon px-4 py-2 rounded-lg text-xs">{t.addFriend}</button></div>
                                {friendSearchMsg && <p className={`text-xs mt-2 text-center ${friendSearchMsg.includes('تم') || friendSearchMsg.includes('Sent') ? 'text-green-400' : 'text-red-400'}`}>{friendSearchMsg}</p>}
                            </div>
                            {friendRequests.length > 0 && (
                                <div className="friend-requests-section">
                                    <div className="friend-requests-header">{t.incomingRequests}</div>
                                    {friendRequests.map(req => (
                                        <div key={req.id} className="friend-request-item">
                                            <AvatarWithFrame photoURL={req.photoURL} equipped={req.equipped} size="sm" />
                                            <div className="friend-request-info"><div className="friend-request-name">{req.displayName}</div></div>
                                            <div className="friend-request-actions"><button onClick={() => handleAcceptRequest(req.id)} className="btn-success px-3 py-1 rounded text-xs">{t.accept}</button><button onClick={() => handleRejectRequest(req.id)} className="btn-danger px-3 py-1 rounded text-xs">{t.reject}</button></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="friends-list-section">
                                {friendsData.length === 0 ? (
                                    <div className="text-center py-6"><div className="text-4xl mb-2">👥</div><p className="text-gray-400">{t.noFriends}</p></div>
                                ) : (() => {
                                    const online = friendsData.filter(f => f.onlineStatus === 'online');
                                    const away = friendsData.filter(f => f.onlineStatus === 'away');
                                    const offline = friendsData.filter(f => !f.onlineStatus || f.onlineStatus === 'offline');
                                    const renderFriend = (friend) => (
                                        <div key={friend.id} className="friend-item">
                                            <div style={{position:'relative'}}>
                                                <AvatarWithFrame photoURL={friend.photoURL} equipped={friend.equipped} size="sm" />
                                                <div style={{
                                                    position:'absolute', bottom:'-1px', right:'-1px',
                                                    width:'10px', height:'10px', borderRadius:'50%',
                                                    background: friend.onlineStatus==='online' ? '#4ade80' : friend.onlineStatus==='away' ? '#facc15' : '#6b7280',
                                                    border:'2px solid #0a0a14'
                                                }} />
                                            </div>
                                            <div className="friend-info">
                                                <div className="friend-name">{friend.displayName}</div>
                                                <div className="friend-status">
                                                    {friend.onlineStatus === 'online'
                                                        ? <span style={{color:'#4ade80'}}>● {t.online}</span>
                                                        : friend.onlineStatus === 'away'
                                                            ? <span style={{color:'#facc15'}}>● {lang==='ar'?'بعيد':'Away'}</span>
                                                            : <span style={{color:'#6b7280'}}>● {t.offline}</span>
                                                    }
                                                </div>
                                            </div>
                                            <div className="friend-actions">
                                                <button onClick={() => openPrivateChat(friend)} className="btn-ghost px-2 py-1 rounded text-xs">💬</button>
                                                <button onClick={() => openProfile(friend.id)} className="btn-ghost px-2 py-1 rounded text-xs">👤</button>
                                            </div>
                                        </div>
                                    );
                                    return (
                                        <>
                                            {online.length > 0 && (
                                                <>
                                                    <div style={{fontSize:'9px',fontWeight:700,color:'#4ade80',textTransform:'uppercase',padding:'4px 0 6px',display:'flex',alignItems:'center',gap:'5px'}}>
                                                        <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#4ade80',display:'inline-block'}}/>
                                                        {t.online} ({online.length})
                                                    </div>
                                                    {online.map(renderFriend)}
                                                </>
                                            )}
                                            {away.length > 0 && (
                                                <>
                                                    <div style={{fontSize:'9px',fontWeight:700,color:'#facc15',textTransform:'uppercase',padding:'8px 0 6px',display:'flex',alignItems:'center',gap:'5px',borderTop:'1px solid rgba(255,255,255,0.06)',marginTop:'6px'}}>
                                                        <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#facc15',display:'inline-block'}}/>
                                                        {lang==='ar'?'بعيد':'Away'} ({away.length})
                                                    </div>
                                                    {away.map(renderFriend)}
                                                </>
                                            )}
                                            {offline.length > 0 && (
                                                <>
                                                    <div style={{fontSize:'9px',fontWeight:700,color:'#6b7280',textTransform:'uppercase',padding:'8px 0 6px',display:'flex',alignItems:'center',gap:'5px',borderTop:(online.length||away.length)?'1px solid rgba(255,255,255,0.06)':'none',marginTop:(online.length||away.length)?'6px':0}}>
                                                        <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#6b7280',display:'inline-block'}}/>
                                                        {t.offline} ({offline.length})
                                                    </div>
                                                    {offline.map(renderFriend)}
                                                </>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </main>
            )}

            {/* Room View */}
            {room && (
                <main className="main-content">
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
                            <div className="grid grid-cols-2 gap-2 mb-4">{room.players.map(p => (<div key={p.uid} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg cursor-pointer hover:bg-white/10" onClick={() => openProfile(p.uid)}><AvatarWithFrame photoURL={p.photo} equipped={p.equipped} size="sm" /><span className="text-xs truncate">{p.name}</span>{p.uid === room.admin && <span className="text-[8px] bg-yellow-500/20 text-yellow-400 px-1 rounded">HOST</span>}</div>))}</div>
                            <div className="flex gap-2">{room.admin === currentUID ? (<button onClick={startGame} className="btn-neon flex-1 py-2 rounded-lg text-sm font-bold">{t.start}</button>) : (<p className="text-xs text-gray-400 text-center flex-1">{t.waiting}</p>)}<button onClick={handleLeaveRoom} className="btn-danger px-4 py-2 rounded-lg text-sm">{t.leaveRoom}</button></div>
                        </div>
                    )}

                    {room.status === 'word_selection' && !isSpectator && (
                        <div className="card-container">
                            <h3 className="text-sm font-bold mb-2 text-center">{t.wordSelectionTitle}</h3>
                            <p className="text-xs text-gray-400 text-center mb-3">{t.wordSelectionDesc}</p>
                            <div className="text-center text-xs text-yellow-400 mb-3">⏱️ {wordSelTimer}s</div>
                            <div className="grid grid-cols-2 gap-2">{(lang === 'ar' ? room.scenario?.words_ar : room.scenario?.words_en)?.map((word, i) => (<button key={i} onClick={() => submitWordVote(word)} className={`word-vote-card ${hasVotedWord === word ? 'selected' : ''}`}><span className="font-bold">{word}</span></button>))}</div>
                        </div>
                    )}

                    {room.status === 'discussing' && (
                        <div className="flex-1 flex flex-col gap-2">
                            <div className="card-container"><div className="grid grid-cols-3 gap-2">{room.players.filter(p => p.status === 'active').map(p => (<div key={p.uid} className={`player-card ${room.currentTurnUID === p.uid ? 'active' : ''} ${p.uid === currentUID ? 'border-primary' : ''}`} onClick={() => openProfile(p.uid)}><AvatarWithFrame photoURL={p.photo} equipped={p.equipped} size="sm" /><span className="text-[10px] truncate mt-1">{p.name}</span>{room.currentTurnUID === p.uid && <span className="text-[8px] text-primary">Speaking</span>}</div>))}</div></div>
                            {!isSpectator && me && (
                                <div className={`identity-square identity-${myRole === 'spy' ? 'spy' : myRole === 'mrwhite' ? 'mrwhite' : myRole === 'informant' ? 'informant' : 'agent'}`}>
                                    <div className="text-4xl mb-2">{myRole === 'spy' ? '🕵️' : myRole === 'mrwhite' ? '👻' : myRole === 'informant' ? '👁️' : '🤵'}</div>
                                    <div className="text-lg font-bold">{myRole === 'spy' ? t.statusSpy : myRole === 'mrwhite' ? t.statusMrWhite : myRole === 'informant' ? t.statusInformant : t.statusAgent}</div>
                                    {myRole === 'spy' && (<div className="text-xs text-gray-300 mt-1">{t.location}: {lang === 'ar' ? room.scenario?.loc_ar : room.scenario?.loc_en}</div>)}
                                    {myRole !== 'spy' && room.chosenWord && (<div className="text-xs text-gray-300 mt-1">{t.selectedWord}: {room.chosenWord}</div>)}
                                </div>
                            )}
                            <div className="card-container">
                                <div className="flex items-center justify-between mb-2"><div className="timer-bar-container"><div className="timer-bar-fill" style={{ width: `${(turnTimer / 30) * 100}%` }}></div></div><span className="text-xs text-gray-400">{turnTimer}s</span></div>
                                <div className="flex gap-2">{isMyTurn && (<button onClick={() => handleSkipTurn()} className="btn-ghost flex-1 py-2 rounded-lg text-xs">{t.skip}</button>)}<button onClick={requestVoting} className="btn-vote flex-1 py-2 rounded-lg text-xs font-bold">{t.vote}</button></div>
                            </div>
                        </div>
                    )}

                    {room.status === 'voting' && (
                        <div className="card-container">
                            <h3 className="text-sm font-bold mb-2 text-center">{t.vote}</h3>
                            <div className="text-center text-xs text-yellow-400 mb-3">⏱️ {votingTimer}s</div>
                            <div className="grid grid-cols-2 gap-2 mb-4">{room.players.filter(p => p.status === 'active').map(p => (<button key={p.uid} onClick={() => submitVote(p.uid)} disabled={hasVoted} className={`player-card ${hasVoted === p.uid ? 'border-primary bg-primary/10' : ''}`}><AvatarWithFrame photoURL={p.photo} equipped={p.equipped} size="sm" /><span className="text-xs truncate mt-1">{p.name}</span></button>))}</div>
                        </div>
                    )}

                    {(room.status === 'finished_spy_caught' || room.status === 'finished_spy_wins' || room.status === 'finished_mrwhite_wins') && (
                        <div className="card-container text-center">
                            <div className="text-4xl mb-4">{room.status === 'finished_spy_caught' ? '🎉' : '🕵️'}</div>
                            <h2 className="text-xl font-bold mb-4">{room.status === 'finished_spy_caught' ? t.agentsWin : t.spyWin}</h2>
                            {room.admin === currentUID && (<button onClick={resetGame} className="btn-neon w-full py-2 rounded-lg text-sm font-bold">{t.playAgain}</button>)}
                            <button onClick={handleLeaveRoom} className="btn-ghost w-full py-2 rounded-lg text-sm mt-2">{t.leaveRoom}</button>
                        </div>
                    )}
                </main>
            )}

            {showDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>}
        </div>
    );
}
