// ==========================================
// PART 1: CONSTANTS, CONFIG & HELPERS
// ==========================================

const { useState, useEffect, useRef } = React;

// --- Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyApAJaNfF0YHupunLRlK3jRYvttxczWShY",
    authDomain: "who-is-the-spy-919b9.firebaseapp.com",
    projectId: "who-is-the-spy-919b9",
    storageBucket: "who-is-the-spy-919b9.firebasestorage.app",
    messagingSenderId: "607075438373",
    appId: "1:607075438373:web:a03e9fb8b243cd993e14cc"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const appId = 'pro_spy_v25_final_fix_complete';
const usersCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('users');
const reportsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('reports');
const chatsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('private_chats');
const roomsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('rooms');
const historyCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('game_history');

// --- Content & Constants ---
const CURRENCY_NAME = "Intel";
const CURRENCY_ICON = "🧠";

// ==========================================
// UPDATED SHOP ITEMS - FRAMES, TITLES, THEMES
// ==========================================
const SHOP_ITEMS = {
    frames: [
        { id: 'frame_gold', name_en: "Gold Frame", name_ar: "إطار ذهبي", cost: 500, type: 'frames', preview: 'linear-gradient(45deg, #f7ff00, #db9700)' },
        { id: 'frame_neon', name_en: "Neon Frame", name_ar: "إطار نيون", cost: 300, type: 'frames', preview: 'linear-gradient(45deg, #00f2ff, #7000ff)' },
        { id: 'frame_fire', name_en: "Fire Frame", name_ar: "إطار نار", cost: 400, type: 'frames', preview: 'linear-gradient(45deg, #ff0055, #ff8800)' },
        { id: 'frame_img', name_en: "Image Frame", name_ar: "إطار صورة", cost: 100, type: 'frames', preview: 'https://i.ibb.co/mVQTLr2D/Untitled-3.png' },
    ],
    titles: [
        { id: 'title_spy', name_en: "Mr. Spy", name_ar: "سيد جاسوس", cost: 600, type: 'titles' },
        { id: 'title_hunter', name_en: "Hunter", name_ar: "صياد", cost: 450, type: 'titles' },
        { id: 'title_ghost', name_en: "Ghost", name_ar: "شبح", cost: 800, type: 'titles' },
    ],
    themes: [
        { id: 'theme_dark', name_en: "Midnight", name_ar: "منتصف الليل", cost: 200, type: 'themes' },
    ],
    // ==========================================
    // NEW: GIFTS SYSTEM WITH CHARISMA & CASHBACK
    // ==========================================
    gifts: [
        { 
            id: 'gift_rose', 
            name_en: "Rose", 
            name_ar: "وردة", 
            cost: 1, 
            type: 'gifts',
            charisma: 10, 
            cashback: 1, 
            desc_ar: "عبّر عن مشاعرك بوردة رقيقة",
            desc_en: "Express your feelings with a delicate rose",
            emoji: "🌹"
        },
        { 
            id: 'gift_icecream', 
            name_en: "Ice Cream", 
            name_ar: "آيس كريم", 
            cost: 5, 
            type: 'gifts',
            charisma: 55, 
            cashback: 1.5, 
            desc_ar: "برّد على قلب أصدقائك",
            desc_en: "Cool down your friends' hearts",
            emoji: "🍦"
        },
        { 
            id: 'gift_heart', 
            name_en: "Heart", 
            name_ar: "قلب", 
            cost: 10, 
            type: 'gifts',
            charisma: 120, 
            cashback: 2, 
            desc_ar: "نبض الحب في هدية واحدة",
            desc_en: "The pulse of love in one gift",
            emoji: "❤️"
        },
        { 
            id: 'gift_pizza', 
            name_en: "Pizza", 
            name_ar: "بيتزا", 
            cost: 20, 
            type: 'gifts',
            charisma: 250, 
            cashback: 2.5, 
            desc_ar: "وليمة لأغلى الناس",
            desc_en: "A feast for the dearest people",
            emoji: "🍕"
        },
        { 
            id: 'gift_ring', 
            name_en: "Ring", 
            name_ar: "خاتم", 
            cost: 100, 
            type: 'gifts',
            charisma: 1200, 
            cashback: 3, 
            desc_ar: "خاتم الأناقة والتميز",
            desc_en: "Ring of elegance and distinction",
            emoji: "💍"
        },
        { 
            id: 'gift_motorbike', 
            name_en: "Motorbike", 
            name_ar: "موتوسيكل", 
            cost: 250, 
            type: 'gifts',
            charisma: 3200, 
            cashback: 3.5, 
            desc_ar: "سرعة وكاريزما لا تُقاوم",
            desc_en: "Irresistible speed and charisma",
            emoji: "🏍️"
        },
        { 
            id: 'gift_racecar', 
            name_en: "Race Car", 
            name_ar: "سيارة سباق", 
            cost: 500, 
            type: 'gifts',
            charisma: 7000, 
            cashback: 4, 
            desc_ar: "انطلق كالمحترفين في الساحة",
            desc_en: "Race like a pro in the arena",
            emoji: "🏎️"
        },
        { 
            id: 'gift_yacht', 
            name_en: "Yacht", 
            name_ar: "يخت", 
            cost: 1000, 
            type: 'gifts',
            charisma: 15000, 
            cashback: 5, 
            desc_ar: "فخامة الملوك فوق الأمواج",
            desc_en: "Royal luxury over the waves",
            emoji: "🛥️"
        },
        { 
            id: 'gift_jet', 
            name_en: "Private Jet", 
            name_ar: "طائرة خاصة", 
            cost: 5000, 
            type: 'gifts',
            charisma: 85000, 
            cashback: 7, 
            desc_ar: "حلّق في سماء الكاريزما",
            desc_en: "Soar in the skies of charisma",
            emoji: "✈️"
        },
        { 
            id: 'gift_island', 
            name_en: "Private Island", 
            name_ar: "جزيرة خاصة", 
            cost: 10000, 
            type: 'gifts',
            charisma: 180000, 
            cashback: 10, 
            desc_ar: "أمتلك عالمك الخاص والفريد",
            desc_en: "Own your own unique world",
            emoji: "🏝️"
        },
    ]
};

const ACHIEVEMENTS = [ 
    { id: 'first_win', name_en: "First Blood", name_ar: "أول دم", icon: "🩸", desc_en: "Win your first game.", desc_ar: "افوز اول لعبة لك.", hidden: false }, 
    { id: 'wins_5', name_en: "Rookie Spy", name_ar: "جاسوس مبتدئ", icon: "🔰", desc_en: "Win 5 games.", desc_ar: "افوز 5 مرات.", hidden: false },
    { id: 'wins_10', name_en: "Field Agent", name_ar: "عميل ميداني", icon: "🔫", desc_en: "Win 10 games.", desc_ar: "افوز 10 مرات.", hidden: false }, 
    { id: 'wins_20', name_en: "Master of Disguise", name_ar: "سيد التنكر", icon: "🎭", desc_en: "Win 20 games.", desc_ar: "افوز 20 مرة.", hidden: false }, 
    { id: 'wins_50', name_en: "Shadow Legend", name_ar: "أسطورة الظل", icon: "👁️", desc_en: "Win 50 games.", desc_ar: "افوز 50 مرة.", hidden: false }, 
    { id: 'wins_100', name_en: "Immortal", name_ar: "خالد", icon: "👑", special: true, desc_en: "Win 100 games.", desc_ar: "افوز 100 مرة.", hidden: false },
    { id: 'level_5', name_en: "Rising Star", name_ar: "نجم صاعد", icon: "⭐", desc_en: "Reach Level 5.", desc_ar: "الوصول للمستوى 5.", hidden: false },
    { id: 'level_10', name_en: "Veteran", name_ar: "محارب قديم", icon: "🛡️", desc_en: "Reach Level 10.", desc_ar: "الوصول للمستوى 10.", hidden: false },
    { id: 'ghost_protocol', name_en: "Ghost Protocol", name_ar: "بروتوكول الشبح", icon: "👻", desc_en: "Win a game without anyone voting for you.", desc_ar: "اربح لعبة دون أن يصوت عليك أحد.", hidden: true },
    { id: 'mr_white_lucky', name_en: "Lucky Guess", name_ar: "تخمين محظوظ", icon: "🎲", desc_en: "Win as Mr. White by guessing correctly.", desc_ar: "اربح كالسيد أبيض عن طريق التخمين الصحيح.", hidden: true },
    // NEW: Charisma Achievements
    { id: 'charisma_1000', name_en: "Charming", name_ar: "ساحر", icon: "✨", desc_en: "Reach 1000 Charisma.", desc_ar: "الوصول لـ 1000 كاريزما.", hidden: false },
    { id: 'charisma_10000', name_en: "Celebrity", name_ar: "مشهور", icon: "🌟", desc_en: "Reach 10000 Charisma.", desc_ar: "الوصول لـ 10000 كاريزما.", hidden: false },
    { id: 'charisma_100000', name_en: "Icon", name_ar: "أيقونة", icon: "💎", desc_en: "Reach 100000 Charisma.", desc_ar: "الوصول لـ 100000 كاريزما.", hidden: false },
];

const SCENARIOS = [ 
    { loc_ar: "محطة فضاء", words_ar: ["فضاء", "صاروخ", "zero-g", "قمر"], loc_en: "Space Station", words_en: ["Space", "Rocket", "Zero-g", "Moon"] }, 
    { loc_ar: "غواصة نووية", words_ar: ["عمق", "ماء", "ضغط", "سونار"], loc_en: "Nuclear Submarine", words_en: ["Depth", "Water", "Pressure", "Sonar"] }, 
    { loc_ar: "قصر ملكي", words_ar: ["تاج", "حراس", "عروش", "خدم"], loc_en: "Royal Palace", words_en: ["Crown", "Guards", "Throne", "Servants"] }, 
    { loc_ar: "بنك مركزي", words_ar: ["خزنة", "مال", "رصاص", "مفتاح"], loc_en: "Central Bank", words_en: ["Vault", "Money", "Lead", "Key"] }, 
    { loc_ar: "مستشفى مهجور", words_ar: ["أشباح", "أطباء", "ظلام", "حقن"], loc_en: "Abandoned Hospital", words_en: ["Ghosts", "Doctors", "Dark", "Syringe"] }, 
    { loc_ar: "قطار ليلي", words_ar: ["درجات", "تذاكر", "نوم", "ممر"], loc_en: "Night Train", words_en: ["Bunks", "Tickets", "Sleep", "Aisle"] }, 
    { loc_ar: "جزيرة كنز", words_ar: ["خريطة", "حفر", "ذهب", "قراصنة"], loc_en: "Treasure Island", words_en: ["Map", "Dig", "Gold", "Pirates"] }, 
    { loc_ar: "مصنع روبوتات", words_ar: ["أسلاك", "صيانة", "برمجة", "معادن"], loc_en: "Robot Factory", words_en: ["Wires", "Maintenance", "Coding", "Metal"] } 
];

const EMOJI_LIST = ['😀', '😂', '😍', '🤔', '😎', '🤫', '😡', '🤢', '😴', '🤯', '😤', '🥺', '😱', '🤬', '💀', '👻', '👾', '🤖', '💩', '😈', '👁️', '🧠', '🦷', '🦴', '👀', '👊', '✌️', '🤞', '🤟', '👌', '🤙', '👈', '👉', '☝️', '👆', '👇', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏', '💪'];
const MAX_ROUNDS = 3;

// --- Helpers ---
const generateUID = () => Math.floor(100000 + Math.random() * 900000).toString();
const calculateLevel = (xp) => Math.floor(xp / 100) + 1;
const calculateXPProgress = (xp) => (xp % 100);
const getChatId = (id1, id2) => [id1, id2].sort().join('_');
const formatTime = (timestamp) => { if (!timestamp) return ''; const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp); return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
const formatDate = (timestamp) => { if (!timestamp) return 'N/A'; const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp); return date.toLocaleDateString() + ' ' + date.toLocaleTimeString(); };
const getTimeRemaining = (lastChanged) => { if (!lastChanged) return "0d 0h"; const lastChangeDate = lastChanged.toDate ? lastChanged.toDate() : new Date(lastChanged); const nextChangeDate = new Date(lastChangeDate); nextChangeDate.setMonth(nextChangeDate.getMonth() + 1); const now = new Date(); const diff = nextChangeDate - now; if (diff <= 0) return "0d 0h"; const days = Math.floor(diff / (1000 * 60 * 60 * 24)); const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); return `${days}d ${hours}h`; };
const formatDuration = (ms) => { const totalSeconds = Math.floor(ms / 1000); const minutes = Math.floor(totalSeconds / 60); const seconds = totalSeconds % 60; return `${minutes}m ${seconds}s`; };

// NEW: Format Charisma with K/M suffix
const formatCharisma = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

// --- Audio ---
const AudioCtx = window.AudioContext || window.webkitAudioContext; let audioCtx = null;
const initAudio = () => { if (!audioCtx) audioCtx = new AudioCtx(); };
const playSound = (type) => { if (!audioCtx) return; if (audioCtx.state === 'suspended') audioCtx.resume(); const osc = audioCtx.createOscillator(); const gainNode = audioCtx.createGain(); osc.connect(gainNode); gainNode.connect(audioCtx.destination); if (type === 'click') { osc.frequency.value = 800; osc.type = 'sine'; gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1); osc.start(); osc.stop(audioCtx.currentTime + 0.1); } else if (type === 'success') { osc.frequency.value = 600; osc.type = 'sine'; gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.15); gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3); osc.start(); osc.stop(audioCtx.currentTime + 0.3); } };
// ==========================================
// PART 2: TRANSLATIONS (Updated with Gifts & Charisma)
// ==========================================
const TRANSLATIONS = { 
    en: { 
        appName: "PRO SPY", tagline: "COVERT ARENA", nickname: "OPERATOR NAME", create: "CREATE GAME", join: "JOIN OPS", browse: "BROWSE ROOMS", codePlaceholder: "ENTER CODE", players: "OPERATIVES", start: "LAUNCH MISSION", langBtn: "العربية", loading: "PROCESSING...", you: "YOU", statusSpy: "SPY", statusAgent: "AGENT", statusInformant: "INFORMANT", statusMrWhite: "MR. WHITE", statusGhost: "GHOST", round: "ROUND", skip: "SKIP TURN", vote: "VOTE TO EJECT", chatPlaceholder: "Type message...", send: "SEND", waiting: "Awaiting host...", location: "LOCATION", spectator: "SPECTATOR", confirm: "CONFIRM VOTE", spyWin: "SPY WINS!", agentsWin: "AGENTS WIN!", mrWhiteWin: "MR. WHITE WINS!", playAgain: "PLAY AGAIN", connecting: "Connecting...", startVoting: "START VOTING", votingStarted: "VOTING INITIATED", voteRequestTitle: "VOTING REQUEST", voteRequestDesc: "wants to start voting.", agree: "AGREE", decline: "DECLINE", endVoting: "END VOTING NOW", votesTitle: "VOTES:", roundsFormat: (c, m) => `ROUND ${c}/${m}`, wordSelectionTitle: "SELECT KEYWORD", wordSelectionDesc: "Choose a keyword for this round", finishSelection: "FINISH SELECTION", selectedWord: "Selected Keyword", loginGoogle: "Login", myAccount: "My Account", logout: "Logout", profile: "Profile", guest: "Guest", linkGuessCard: "GUESS MY CARD", level: "Level", wins: "Wins", losses: "Losses", winRate: "Win Rate", totalGames: "Games", achievements: "Achievements", id: "ID", enterCodeError: "Please enter a room code.", changeName: "Change Name", nameChangeLimit: "Once a month", copied: "Copied!", save: "Save", or: "OR", needPlayers: "Minimum players not met!", ok: "OK", tabLobby: "Lobby", tabLeaderboard: "Leaderboard", tabFriends: "Friends", addFriend: "Add Friend", friendIdPlaceholder: "Enter Friend ID", online: "Online", offline: "Offline", noFriends: "No friends yet.", friendAdded: "Friend Added!", friendNotFound: "User not found.", requestSent: "Request Sent!", incomingRequests: "Incoming Requests", noRequests: "No pending requests.", accept: "Accept", reject: "Reject", sendMessage: "Send", inviteBtn: "Invite", invitedYou: "invited you to play.", joinInvite: "Join?", inviteFriends: "Invite Friends", accountInfo: "Account Information", email: "Email", memberSince: "Member Since", nameChangeCountdown: "Name Change In", canChangeNow: "Can change now!", selectEmoji: "Emoji", guestTitle: "GUEST ACCOUNT", guestDesc: "Register to save progress and add friends.", kd: "K/D Ratio", stats: "Stats", noPermission: "Feature unavailable for guests.", normalMode: "NORMAL MODE", advancedMode: "ADVANCED MODE (6+)", modeNormalDesc: "Classic Spy vs Agents. 3-10 Players.", modeAdvDesc: "Special Roles included! 6-10 Players.", privateRoom: "Private Room", password: "Password", publicRoom: "Public Room", noRooms: "No active games found.", lobbyTitle: "GAME LOBBY", mrWhiteInstruction: "Guess the location to win!", informantInstruction: "You know a neighbor!", ghostInstruction: "You are now a Ghost. You can watch but cannot act.", guessLocation: "GUESS LOCATION", leaveRoom: "LEAVE", closeRoom: "CLOSE ROOM", showPassword: "Show Password", guestAccountLabel: "GUEST ACCOUNT", guestProfileMsg: "Guests cannot receive friend requests.", reportUser: "Report User", reportSent: "Report sent successfully!", reportTitle: "Report User", reportDesc: "Please select a reason for reporting this user.", reportReasonAbusive: "Abusive Behavior", reportReasonCheating: "Cheating", reportReasonSpam: "Spam", reportReasonOther: "Other", reportSubmit: "Submit Report", reportCancel: "Cancel", privateRoomError: "Private rooms require a password.",
        shop: "Shop", currency: "Intel", buy: "Buy", owned: "Owned", equip: "Equip", equipped: "Equipped", inventory: "Inventory", frames: "Frames", titles: "Titles", themes: "Themes", purchaseSuccess: "Purchase Successful!", purchaseFail: "Not enough Intel!", alreadyOwned: "Already Owned",
        tutorialTitle: "Welcome, Agent", tutorialStep1: "Your goal is to find the Spy (or blend in if you are the Spy).", tutorialStep2: "Each round, discuss and vote to eject a suspect.", tutorialStep3: "Win matches to earn Intel and buy items in the Shop!", skipTutorial: "Skip", next: "Next", startGame: "Start Game",
        matchSummary: "Match Summary", matchDuration: "Duration", mvp: "MVP", correctVotes: "Correct Votes", summaryTitle: "Game Over!",
        notifTitle: "Notification", achUnlock: "Achievement Unlocked!", newFriend: "New Friend Added!",
        hiddenAch: "Hidden Achievement",
        tabMain: "Main", tabInv: "Inventory", tabAch: "Achievements",
        // NEW: Charisma & Gifts
        charisma: "Charisma",
        charismaDesc: "Your influence in the arena",
        gifts: "Gifts",
        sendGift: "Send Gift",
        giftSent: "Gift Sent!",
        giftReceived: "You received a gift!",
        selectGift: "Select a Gift",
        giftPreview: "Gift Preview",
        cashback: "Cashback",
        willReceive: "You'll receive",
        charismaGain: "Charisma Gain",
        playerLeft: "Player Left",
        spyLeftAgentsWin: "Spy left! Agents Win!",
        agentLeftSpyWins: "Agent left! Spy Wins!",
        myGifts: "My Gifts",
        receivedGifts: "Received Gifts",
        noGifts: "No gifts yet.",
        fromPlayer: "From",
        toPlayer: "To",
        buyGift: "Buy Gift",
        sendToFriend: "Send to Friend",
    }, 
    ar: { 
        appName: "برو جاسوس", tagline: "ساحة العمليات", nickname: "اسم العميل", create: "إنشاء لعبة", join: "انضمام", browse: "استعراض الغرف", codePlaceholder: "أدخل الكود", players: "العملاء", start: "بدء المهمة", langBtn: "English", loading: "جاري التحميل...", you: "أنت", statusSpy: "جاسوس", statusAgent: "عميل", statusInformant: "المخبر", statusMrWhite: "السيد", statusGhost: "شبح", round: "الجولة", skip: "تخطي الدور", vote: "تصويت للطرد", chatPlaceholder: "اكتب رسالة...", send: "إرسال", waiting: "بانتظار المضيف...", location: "الموقع", spectator: "مشاهد", confirm: "تأكيد التصويت", spyWin: "فاز الجاسوس!", agentsWin: "فاز العملاء!", mrWhiteWin: "فاز السيد!", playAgain: "لعب مجدداً", connecting: "جاري التأمين...", startVoting: "بدء التصويت", votingStarted: "بدأ التصويت", voteRequestTitle: "طلب تصويت", voteRequestDesc: "يريد بدء التصويت.", agree: "موافق", decline: "رفض", endVoting: "إنهاء التصويت الآن", votesTitle: "الأصوات:", roundsFormat: (c, m) => `الجولة ${c}/${m}`, wordSelectionTitle: "اختر كلمة السر", wordSelectionDesc: "اختر كلمة سر لهذه الجولة", finishSelection: "إنهاء الاختيار", selectedWord: "كلمة السر", loginGoogle: "دخول", myAccount: "حسابي", logout: "تسجيل الخروج", profile: "الملف الشخصي", guest: "زائر", linkGuessCard: "خمن كرتي", level: "المستوى", wins: "فوز", losses: "خسارة", winRate: "نسبة الفوز", totalGames: "المباريات", achievements: "الإنجازات", id: "الرقم", enterCodeError: "برجاء إدخال كود الغرفة.", changeName: "تغيير الاسم", nameChangeLimit: "مرة شهرياً", copied: "تم النسخ!", save: "حفظ", or: "أو", needPlayers: "اللاعبين غير كافيين!", ok: "حسناً", tabLobby: "الرئيسية", tabLeaderboard: "المتصدرين", tabFriends: "الأصدقاء", addFriend: "أضافة صديق", friendIdPlaceholder: "أدخل ID الصديق", online: "متصل", offline: "غير متصل", noFriends: "لا يوجد أصدقاء.", friendAdded: "تمت الإضافة!", friendNotFound: "المستخدم غير موجود.", requestSent: "تم إرسال الطلب!", incomingRequests: "طلبات الصداقة", noRequests: "لا توجد طلبات.", accept: "قبول", reject: "رفض", sendMessage: "إرسال", inviteBtn: "دعوة", invitedYou: "دعاك للعب.", joinInvite: "انضمام؟", inviteFriends: "دعوة أصدقاء", accountInfo: "معلومات الحساب", email: "البريد الإلكتروني", memberSince: "عضو منذ", nameChangeCountdown: "تغيير الاسم بعد", canChangeNow: "يمكن التغيير الآن!", selectEmoji: "إيموجي", guestTitle: "حساب زائر", guestDesc: "سجل لحفظ تقدمك وإضافة أصدقاء.", kd: "نسبة الـ KD", stats: "الإحصائيات", noPermission: "غير متاح للزوار.", normalMode: "الوضع العادي", advancedMode: "الوضع المتقدم (6+)", modeNormalDesc: "جاسوس ضد عملاء. 3-10 لاعبين.", modeAdvDesc: "أدوار خاصة! 6-10 لاعبين.", privateRoom: "غرفة خاصة", password: "كلمة السر", publicRoom: "غرفة عامة", noRooms: "لا توجد ألعاب نشطة.", lobbyTitle: "غرفة الانتظار", mrWhiteInstruction: "خمن المكان لتفوز!", informantInstruction: "تعرف على جارك!", ghostInstruction: "أنت الآن شبح. يمكنك المشاهدة فقط.", guessLocation: "خمن المكان", leaveRoom: "خروج", closeRoom: "إغلاق الغرفة", showPassword: "إظهار الباسورد", guestAccountLabel: "حساب زائر", guestProfileMsg: "لا يمكن إرسال طلبات صداقة للحسابات الزائرة.", reportUser: "إبلاغ عن المستخدم", reportSent: "تم إرسال البلاغ بنجاح!", reportTitle: "الإبلاغ عن مستخدم", reportDesc: "برجاء اختيار سبب الإبلاغ.", reportReasonAbusive: "سلوك مسيء", reportReasonCheating: "غش", reportReasonSpam: "بريد مزعج", reportReasonOther: "سبب آخر", reportSubmit: "إرسال البلاغ", reportCancel: "إلغاء", privateRoomError: "الغرف الخاصة تتطلب كلمة سر!",
        shop: "المتجر", currency: "إنتل", buy: "شراء", owned: "مملوك", equip: "تزيين", equipped: "مزين", inventory: "المخزون", frames: "إطارات", titles: "ألقاب", themes: "سمات", purchaseSuccess: "تم الشراء!", purchaseFail: "لا تملك إنتل كافي!", alreadyOwned: "مملوك مسبقاً",
        tutorialTitle: "مرحباً أيها العميل", tutorialStep1: "هدفك هو العثور على الجاسوس (أو التخفي إن كنت الجاسوس).", tutorialStep2: "في كل جولة، ناقش وصوّت لطرد المشتبه به.", tutorialStep3: "اربح المباريات لتحصل على إنتل واشتري من المتجر!", skipTutorial: "تخطي", next: "التالي", startGame: "ابدأ اللعبة",
        matchSummary: "ملخص المباراة", matchDuration: "المدة", mvp: "الأفضل", correctVotes: "أصوات صحيحة", summaryTitle: "انتهت اللعبة!",
        notifTitle: "إشعار", achUnlock: "تم فتح إنجاز!", newFriend: "صديق جديد!",
        hiddenAch: "إنجاز سري",
        tabMain: "الرئيسية", tabInv: "المخزون", tabAch: "الإنجازات",
        // NEW: Charisma & Gifts (Arabic)
        charisma: "الكاريزما",
        charismaDesc: "تأثيرك في الساحة",
        gifts: "الهدايا",
        sendGift: "إرسال هدية",
        giftSent: "تم إرسال الهدية!",
        giftReceived: "لقد استلمت هدية!",
        selectGift: "اختر هدية",
        giftPreview: "معاينة الهدية",
        cashback: "استرداد",
        willReceive: "ستستلم",
        charismaGain: "زيادة الكاريزما",
        playerLeft: "لاعب غادر",
        spyLeftAgentsWin: "الجاسوس غادر! فاز العملاء!",
        agentLeftSpyWins: "عميل غادر! فاز الجاسوس!",
        myGifts: "هداياي",
        receivedGifts: "الهدايا المستلمة",
        noGifts: "لا توجد هدايا بعد.",
        fromPlayer: "من",
        toPlayer: "إلى",
        buyGift: "شراء هدية",
        sendToFriend: "إرسال لصديق",
    } 
};
// ==========================================
// PART 3: COMPONENTS - Basic Components & Modals
// ==========================================

// Guest Banner
const GuestBanner = ({ lang }) => { 
    const t = TRANSLATIONS[lang]; 
    return ( 
        <div className="guest-banner bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 text-center mb-2"> 
            <h3 className="text-sm font-bold text-yellow-400">{t.guestTitle}</h3> 
            <p className="text-[10px] text-gray-400">{t.guestDesc}</p> 
        </div> 
    ); 
};

// Notification Toast
const NotificationToast = ({ message, onClose }) => {
    if(!message) return null;
    return (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] animate-pop px-4 w-full max-w-sm pointer-events-none flex justify-center">
            <div className="glass-panel px-6 py-3 rounded-xl border border-cyan-400 text-white flex items-center gap-3 shadow-lg pointer-events-auto">
                <span className="text-lg">🎉</span>
                <span className="text-sm font-bold text-center flex-1">{message}</span>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-lg font-bold">&times;</button>
            </div>
        </div>
    );
};

// Tutorial Modal
const TutorialModal = ({ show, onClose, lang }) => {
    const t = TRANSLATIONS[lang];
    const [step, setStep] = useState(0);
    if(!show) return null;
    
    const steps = [
        { text: t.tutorialStep1, img: "🕵️" },
        { text: t.tutorialStep2, img: "🗳️" },
        { text: t.tutorialStep3, img: "🛒" }
    ];

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
            <div className="glass-panel rounded-2xl p-6 w-full max-w-sm text-center animate-pop">
                <div className="text-6xl mb-6 animate-bounce">{steps[step].img}</div>
                <p className="text-base mb-6 text-gray-200">{steps[step].text}</p>
                <div className="flex justify-center gap-2 mb-4">
                    {steps.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full transition ${i === step ? 'bg-cyan-400 w-4' : 'bg-gray-600'}`}></div>)}
                </div>
                <div className="flex gap-3">
                    {step > 0 && <button onClick={() => setStep(s => s-1)} className="btn-ghost flex-1 py-2 rounded-lg text-sm">Back</button>}
                    {step < steps.length - 1 ? (
                        <button onClick={() => setStep(s => s+1)} className="btn-neon flex-1 py-2 rounded-lg text-sm">{t.next}</button>
                    ) : (
                        <button onClick={onClose} className="btn-neon flex-1 py-2 rounded-lg text-sm">{t.startGame}</button>
                    )}
                </div>
                <button onClick={onClose} className="text-xs text-gray-500 mt-4 hover:text-white">{t.skipTutorial}</button>
            </div>
        </div>
    );
};

// ==========================================
// NEW: GIFT PREVIEW MODAL
// ==========================================
const GiftPreviewModal = ({ show, onClose, gift, lang, onBuy, currency }) => {
    const t = TRANSLATIONS[lang];
    if(!show || !gift) return null;
    
    const cashbackAmount = Math.floor(gift.cost * (gift.cashback / 100));
    
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="glass-panel rounded-2xl p-5 w-full max-w-xs text-center animate-pop border border-yellow-500/30" onClick={e => e.stopPropagation()}>
                <div className="text-6xl mb-3">{gift.emoji}</div>
                <h3 className="text-lg font-bold text-white mb-1">{lang === 'ar' ? gift.name_ar : gift.name_en}</h3>
                <p className="text-xs text-gray-400 mb-4">{lang === 'ar' ? gift.desc_ar : gift.desc_en}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2">
                        <div className="text-[10px] text-gray-400">{t.charismaGain}</div>
                        <div className="text-lg font-bold text-purple-400">+{formatCharisma(gift.charisma)}</div>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2">
                        <div className="text-[10px] text-gray-400">{t.cashback}</div>
                        <div className="text-lg font-bold text-green-400">+{cashbackAmount} 🧠</div>
                    </div>
                </div>
                
                <div className="text-sm text-yellow-400 mb-3">
                    {t.willReceive}: {cashbackAmount} Intel ({gift.cashback}%)
                </div>
                
                <div className="flex gap-2">
                    <button onClick={onClose} className="btn-ghost flex-1 py-2 rounded-lg text-sm">{t.reportCancel}</button>
                    <button 
                        onClick={() => onBuy(gift)} 
                        disabled={currency < gift.cost}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold ${currency >= gift.cost ? 'btn-gold' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                    >
                        {t.buy} ({gift.cost} 🧠)
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// NEW: SEND GIFT MODAL
// ==========================================
const SendGiftModal = ({ show, onClose, targetUser, currentUser, lang, onSendGift, currency }) => {
    const t = TRANSLATIONS[lang];
    const [selectedGift, setSelectedGift] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    
    if(!show || !targetUser) return null;
    
    const gifts = SHOP_ITEMS.gifts;
    
    const handleSend = async (gift) => {
        await onSendGift(gift, targetUser);
        onClose();
    };
    
    return (
        <>
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={onClose}>
                <div className="glass-panel rounded-2xl p-4 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col animate-pop" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-bold text-primary">{t.sendGift}</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">&times;</button>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3 p-2 bg-white/5 rounded-lg">
                        <img src={targetUser.photoURL} className="w-10 h-10 rounded-full border-2 border-cyan-400" alt=""/>
                        <div>
                            <div className="font-bold text-sm">{targetUser.displayName}</div>
                            <div className="text-[10px] text-gray-400">{t.charisma}: {formatCharisma(targetUser.charisma || 0)}</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3 text-xs text-yellow-400">
                        <span>🧠 {currency} {CURRENCY_NAME}</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto grid grid-cols-5 gap-2">
                        {gifts.map(gift => (
                            <button 
                                key={gift.id} 
                                onClick={() => { setSelectedGift(gift); setShowPreview(true); }}
                                disabled={currency < gift.cost}
                                className={`gift-card flex flex-col items-center justify-center p-2 rounded-lg transition ${currency >= gift.cost ? 'hover:border-yellow-400 hover:bg-yellow-500/10' : 'opacity-40 cursor-not-allowed'}`}
                            >
                                <span className="text-2xl">{gift.emoji}</span>
                                <span className="text-[10px] font-bold text-yellow-400">{gift.cost}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <GiftPreviewModal 
                show={showPreview} 
                onClose={() => setShowPreview(false)} 
                gift={selectedGift} 
                lang={lang} 
                onBuy={(gift) => handleSend(gift)}
                currency={currency}
            />
        </>
    );
};

// ==========================================
// UPDATED: KDCIRCLE with Charisma
// ==========================================
const KDCircle = ({ wins, losses, lang }) => {
    const t = TRANSLATIONS[lang];
    const total = wins + losses;
    const ratio = total > 0 ? wins / total : 0;
    const percentage = Math.round(ratio * 100);
    
    const size = 100; 
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (ratio * circumference);

    return (
        <div className="kd-circle-container" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--secondary)" />
                        <stop offset="100%" stopColor="var(--primary)" />
                    </linearGradient>
                </defs>
                <circle className="kd-circle-bg" cx={size/2} cy={size/2} r={radius} />
                <circle 
                    className="kd-circle-progress" 
                    cx={size/2} 
                    cy={size/2} 
                    r={radius} 
                    strokeDasharray={circumference} 
                    strokeDashoffset={offset}
                />
            </svg>
            <div className="kd-text">
                <span className="kd-value">{percentage}%</span>
                <span className="kd-label">{t.winRate}</span>
            </div>
        </div>
    );
};

// ==========================================
// NEW: CHARISMA BAR COMPONENT
// ==========================================
const CharismaBar = ({ charisma, lang }) => {
    const t = TRANSLATIONS[lang];
    const level = Math.floor(charisma / 1000) + 1;
    const progress = (charisma % 1000) / 1000 * 100;
    
    return (
        <div className="charisma-container">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                    ✨ {t.charisma}
                </span>
                <span className="text-xs text-gray-400">Lv.{level}</span>
            </div>
            <div className="charisma-bar-bg">
                <div className="charisma-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="text-center text-sm font-bold text-yellow-300 mt-1">
                {formatCharisma(charisma)} XP
            </div>
        </div>
    );
};

// ==========================================
// UPDATED: SHOP MODAL with GIFTS TAB
// ==========================================
const ShopModal = ({ show, onClose, userData, lang, onUpdate }) => {
    const t = TRANSLATIONS[lang];
    const [tab, setTab] = useState('frames');
    const [msg, setMsg] = useState('');
    const [selectedGift, setSelectedGift] = useState(null);
    const [showGiftPreview, setShowGiftPreview] = useState(false);
    
    if(!show || !userData) return null;

    const currency = userData.currency || 0;
    const inventory = userData.inventory || { frames: [], titles: [], themes: [], gifts: [] };
    const equipped = userData.equipped || {};

    const handleBuy = async (item) => {
        if(inventory[item.type]?.includes(item.id)) {
            setMsg(t.alreadyOwned);
            setTimeout(() => setMsg(''), 2000);
            return;
        }

        if(currency < item.cost) {
            setMsg(t.purchaseFail);
            setTimeout(() => setMsg(''), 2000);
            return;
        }
        
        const newCurrency = currency - item.cost;
        const newInventory = { ...inventory };
        newInventory[item.type] = [...(newInventory[item.type] || []), item.id];

        await usersCollection.doc(userData.uid).update({
            currency: newCurrency,
            inventory: newInventory
        });
        
        setMsg(t.purchaseSuccess);
        setTimeout(() => setMsg(''), 2000);
        if(onUpdate) onUpdate();
    };
    
    const handleBuyGift = async (gift) => {
        if(currency < gift.cost) {
            setMsg(t.purchaseFail);
            setTimeout(() => setMsg(''), 2000);
            return;
        }
        
        // Calculate cashback
        const cashbackAmount = Math.floor(gift.cost * (gift.cashback / 100));
        const newCurrency = currency - gift.cost + cashbackAmount;
        
        // Add to inventory
        const newInventory = { ...inventory };
        newInventory.gifts = [...(newInventory.gifts || []), { id: gift.id, count: 1 }];
        
        // Add charisma
        const newCharisma = (userData.charisma || 0) + gift.charisma;
        
        await usersCollection.doc(userData.uid).update({
            currency: newCurrency,
            inventory: newInventory,
            charisma: newCharisma
        });
        
        setMsg(`${t.purchaseSuccess} +${formatCharisma(gift.charisma)} ✨`);
        setTimeout(() => setMsg(''), 2000);
        setShowGiftPreview(false);
        if(onUpdate) onUpdate();
    };

    const handleEquip = async (type, id) => {
        const newEquipped = { ...equipped, [type]: id };
        await usersCollection.doc(userData.uid).update({ equipped: newEquipped });
        if(onUpdate) onUpdate();
    };

    const items = SHOP_ITEMS[tab] || [];

    return (
        <>
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-2" onClick={onClose}>
                <div className="glass-panel rounded-2xl p-4 w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col animate-pop" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-bold text-primary">{t.shop}</h2>
                        <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
                            <span>{CURRENCY_ICON} {currency}</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-1 mb-3 border-b border-white/10 pb-2 overflow-x-auto">
                        {['frames', 'titles', 'themes', 'gifts'].map(k => (
                            <button key={k} onClick={() => setTab(k)} className={`px-3 py-1 rounded-t-lg text-xs whitespace-nowrap ${tab === k ? 'bg-white/10 text-white' : 'text-gray-500'}`}>{t[k]}</button>
                        ))}
                    </div>

                    {msg && <div className="text-center text-xs text-cyan-400 mb-2 animate-pop">{msg}</div>}

                    <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 pr-1">
                        {items.map(item => {
                            const owned = item.type !== 'gifts' && inventory[item.type]?.includes(item.id);
                            const isEquipped = equipped[item.type] === item.id;
                            const isUrl = item.preview?.startsWith('http') || item.emoji;
                            
                            // For gifts
                            const giftOwned = item.type === 'gifts' ? inventory.gifts?.find(g => g.id === item.id)?.count || 0 : 0;
                            
                            return (
                                <div key={item.id} className="bg-black/30 rounded-xl p-3 flex flex-col items-center justify-between h-36">
                                    <div className="text-xs font-bold mb-1 text-center">{lang === 'ar' ? item.name_ar : item.name_en}</div>
                                    
                                    {item.type === 'frames' && (
                                        <div className="w-10 h-10 rounded-full mb-1 relative overflow-hidden flex-shrink-0">
                                            <div className="absolute inset-0 bg-gray-700 rounded-full"></div>
                                            {isUrl && item.preview?.startsWith('http') ? (
                                                <img src={item.preview} className="absolute inset-0 w-full h-full object-cover rounded-full" alt="frame" />
                                            ) : (
                                                <div className="absolute inset-0 rounded-full" style={{ background: item.preview, padding: '2px' }}>
                                                    <div className="w-full h-full rounded-full bg-gray-800"></div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {item.type === 'titles' && <div className="text-base font-bold mb-1 text-center" style={{ color: 'var(--primary)' }}>{item.name_en}</div>}
                                    
                                    {item.type === 'themes' && <div className="text-2xl mb-1">🎨</div>}
                                    
                                    {item.type === 'gifts' && (
                                        <>
                                            <div className="text-2xl mb-1">{item.emoji}</div>
                                            <div className="text-[10px] text-yellow-400">+{formatCharisma(item.charisma)} ✨</div>
                                        </>
                                    )}
                                    
                                    {item.type === 'gifts' ? (
                                        <button 
                                            onClick={() => { setSelectedGift(item); setShowGiftPreview(true); }} 
                                            disabled={currency < item.cost}
                                            className={`w-full py-1 rounded text-[10px] font-bold ${currency >= item.cost ? 'btn-gold' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                                        >
                                            {t.buy} ({item.cost})
                                        </button>
                                    ) : owned ? (
                                        <button onClick={() => handleEquip(item.type, item.id)} className={`w-full py-1 rounded text-[10px] ${isEquipped ? 'btn-neon' : 'btn-ghost border-white/20'}`}>
                                            {isEquipped ? t.equipped : t.equip}
                                        </button>
                                    ) : (
                                        <button onClick={() => handleBuy(item)} className="btn-gold w-full py-1 rounded text-[10px]">{t.buy} ({item.cost})</button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            <GiftPreviewModal 
                show={showGiftPreview} 
                onClose={() => setShowGiftPreview(false)} 
                gift={selectedGift} 
                lang={lang} 
                onBuy={handleBuyGift}
                currency={currency}
            />
        </>
    );
};
// ==========================================
// PART 4: PROFILE & ACCOUNT COMPONENTS (Updated with Charisma & Gifts)
// ==========================================

// Match Summary Modal
const MatchSummaryModal = ({ show, onClose, room, players, lang }) => {
    const t = TRANSLATIONS[lang];
    if(!show || !room) return null;

    const duration = room.finishedAt && room.startedAt ? formatDuration(room.finishedAt - room.startedAt) : "N/A";
    
    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="glass-panel rounded-2xl p-6 w-full max-w-sm text-center animate-pop" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-black mb-4 text-primary">{t.summaryTitle}</h2>
                
                <div className="grid grid-cols-2 gap-3 mb-4 text-left text-xs">
                    <div className="bg-black/30 p-2 rounded-lg">
                        <span className="text-gray-400">{t.matchDuration}</span>
                        <div className="text-lg font-bold text-white">{duration}</div>
                    </div>
                    <div className="bg-black/30 p-2 rounded-lg">
                        <span className="text-gray-400">{t.mvp}</span>
                        <div className="text-lg font-bold text-primary truncate">{room.status === 'finished_spy_caught' ? 'Agents' : 'Spy'}</div>
                    </div>
                </div>

                <div className="max-h-32 overflow-y-auto mb-4 space-y-1">
                    {players && players.map(p => (
                        <div key={p.uid} className="flex justify-between items-center bg-white/5 px-2 py-1 rounded text-xs">
                            <span>{p.name}</span>
                            <span className={p.status === 'active' ? 'text-green-400' : 'text-red-400'}>{p.status === 'active' ? 'Survived' : 'Out'}</span>
                        </div>
                    ))}
                </div>

                <button onClick={onClose} className="btn-neon w-full py-2 rounded-lg text-sm">{t.ok}</button>
            </div>
        </div>
    );
};

// Report Modal
const ReportModal = ({ show, onClose, targetUser, currentUser, lang }) => {
    const t = TRANSLATIONS[lang]; 
    const [selectedReason, setSelectedReason] = useState(null);
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState('');

    if (!show || !targetUser) return null;

    const reasons = [
        { id: 'abusive', label: t.reportReasonAbusive },
        { id: 'cheating', label: t.reportReasonCheating },
        { id: 'spam', label: t.reportReasonSpam },
        { id: 'other', label: t.reportReasonOther }
    ];

    const handleSubmit = async () => {
        if (!selectedReason) return;
        setSubmitting(true);
        
        try {
            await reportsCollection.add({
                reporterId: currentUser.uid,
                reporterName: currentUser.displayName,
                reportedId: targetUser.uid,
                reportedName: targetUser.displayName,
                reason: selectedReason,
                details: details,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            });
            setMsg(t.reportSent);
            setTimeout(() => { onClose(); setMsg(''); setSelectedReason(null); setDetails(''); }, 1500);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="report-modal-overlay" onClick={onClose}>
            <div className="report-modal-content animate-pop" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-red-400 mb-3">{t.reportTitle}</h2>
                <p className="text-xs text-gray-400 mb-3">{t.reportDesc}</p>
                
                <div className="space-y-2 mb-3">
                    {reasons.map(r => (
                        <div 
                            key={r.id}
                            onClick={() => setSelectedReason(r.id)}
                            className={`report-reason-option ${selectedReason === r.id ? 'selected' : ''}`}
                        >
                            <div className={`w-3 h-3 rounded-full border-2 ${selectedReason === r.id ? 'border-red-500 bg-red-500' : 'border-gray-500'}`}></div>
                            <span className="text-xs">{r.label}</span>
                        </div>
                    ))}
                </div>

                <textarea 
                    className="input-dark w-full p-2 rounded text-xs h-16 resize-none"
                    placeholder={t.reportReasonOther}
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    disabled={submitting}
                ></textarea>

                {msg && <div className="text-center text-green-400 text-xs my-2">{msg}</div>}

                <div className="flex gap-2 mt-3">
                    <button onClick={onClose} className="btn-ghost flex-1 py-2 rounded text-xs" disabled={submitting}>{t.reportCancel}</button>
                    <button onClick={handleSubmit} disabled={!selectedReason || submitting} className="btn-danger flex-1 py-2 rounded font-bold text-xs">
                        {submitting ? t.loading : t.reportSubmit}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// UPDATED: USER PROFILE MODAL with Charisma & Gifts
// ==========================================
const UserProfileModal = ({ show, onClose, targetUID, lang, isFriend, currentUserData, onSendRequest, onSendGift }) => { 
    const t = TRANSLATIONS[lang]; 
    const [profileData, setProfileData] = useState(null); 
    const [msg, setMsg] = useState(''); 
    const [showReport, setShowReport] = useState(false);
    const [showSendGift, setShowSendGift] = useState(false);

    useEffect(() => { if (show && targetUID) { usersCollection.doc(targetUID).get().then(doc => { if (doc.exists) setProfileData(doc.data()); }); } }, [show, targetUID]); 

    if (!show || !profileData) return null; 

    const level = calculateLevel(profileData.stats?.xp || 0); 
    const wins = profileData.stats?.wins || 0; 
    const losses = profileData.stats?.losses || 0; 
    const totalGames = wins + losses; 
    const charisma = profileData.charisma || 0;
    const isTargetGuest = profileData.isAnonymous; 
    const equippedTitle = profileData.equipped?.titles ? SHOP_ITEMS.titles.find(i => i.id === profileData.equipped.titles) : null;
    const isMe = targetUID === currentUserData.uid;
    
    // Frame check
    const frameItem = profileData.equipped?.frames ? SHOP_ITEMS.frames.find(f=>f.id===profileData.equipped.frames) : null;
    const isFrameUrl = frameItem?.preview?.startsWith('http');

    const handleAddClick = async () => {
        if (isFriend || currentUserData.isAnonymous) return;
        await onSendRequest(targetUID); 
        setMsg(t.requestSent);
        setTimeout(() => setMsg(''), 2000);
    };

    // Avatar frame dimensions - FIXED: 48px avatar needs 118% frame
    const avatarSize = 48;
    const frameScale = 1.18; // 118% of avatar size

    return ( 
        <>
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4" onClick={onClose}> 
                <div className="glass-panel rounded-2xl p-5 w-full max-w-sm animate-pop" onClick={e => e.stopPropagation()}> 
                    {/* Profile Header with Fixed Frame */}
                    <div className="profile-header text-center"> 
                        <div className="relative inline-block mb-2 mx-auto" style={{ width: avatarSize, height: avatarSize }}>
                            {/* Frame Image (if URL) */}
                            {isFrameUrl && frameItem && (
                                <img 
                                    src={frameItem.preview} 
                                    className="absolute pointer-events-none z-20 rounded-full"
                                    style={{
                                        width: avatarSize * frameScale,
                                        height: avatarSize * frameScale,
                                        top: -(avatarSize * (frameScale - 1) / 2),
                                        left: -(avatarSize * (frameScale - 1) / 2),
                                    }}
                                    alt=""
                                />
                            )}
                            {/* Gradient Frame (if not URL) */}
                            {!isFrameUrl && frameItem && (
                                <div 
                                    className="absolute rounded-full z-0"
                                    style={{
                                        width: avatarSize * frameScale,
                                        height: avatarSize * frameScale,
                                        top: -(avatarSize * (frameScale - 1) / 2),
                                        left: -(avatarSize * (frameScale - 1) / 2),
                                        background: frameItem.preview,
                                        padding: 3
                                    }}
                                >
                                    <div className="w-full h-full rounded-full bg-gray-900"></div>
                                </div>
                            )}
                            {/* Avatar Image */}
                            <img 
                                src={profileData.photoURL || `https://ui-avatars.com/api/?name=${profileData.displayName}&background=random`} 
                                className="profile-avatar-sm relative z-10 mx-auto" 
                                style={{ width: avatarSize, height: avatarSize }}
                                alt=""
                            />
                        </div>
                        
                        <div className="profile-name text-lg">
                            {equippedTitle && <span className="equipped-title text-[8px]">{lang === 'ar' ? equippedTitle.name_ar : equippedTitle.name_en}</span>}
                            {profileData.displayName}
                        </div> 
                        
                        {isTargetGuest && (
                            <div className="guest-badge-profile text-[10px]">
                                <span>⚠️</span> {t.guestAccountLabel}
                            </div>
                        )}

                        <div className="profile-id-box mt-1" onClick={() => { navigator.clipboard.writeText(profileData.customId); setMsg(t.copied); setTimeout(()=>setMsg(''),1500) }}> 
                            <span className="profile-id-text text-[10px]">ID: #{profileData.customId}</span> 
                        </div> 
                    </div> 
                    
                    {msg && <div className="text-center text-[10px] text-cyan-400 mb-2">{msg}</div>}
                    
                    {/* NEW: Charisma Display */}
                    <CharismaBar charisma={charisma} lang={lang} />
                    
                    <KDCircle wins={wins} losses={losses} lang={lang} />
                    
                    <div className="info-grid text-xs"> 
                        <div className="info-box"><span className="info-label">{t.level}</span><span className="info-value text-primary">{level}</span></div> 
                        <div className="info-box"><span className="info-label">{t.totalGames}</span><span className="info-value">{totalGames}</span></div>
                        <div className="info-box"><span className="info-label">{t.wins}</span><span className="info-value text-green-400">{wins}</span></div> 
                        <div className="info-box"><span className="info-label">{t.losses}</span><span className="info-value text-red-400">{losses}</span></div> 
                    </div> 
                    
                    {!isMe && ( 
                        !currentUserData.isAnonymous ? (
                            !isTargetGuest ? (
                                <div className="flex gap-2">
                                    <button onClick={handleAddClick} disabled={msg || isFriend} className={`flex-1 py-2 rounded-lg font-bold text-xs mt-3 ${isFriend ? 'bg-gray-700 text-gray-400' : 'btn-neon'}`}> 
                                        {isFriend ? "Friends" : (msg || t.addFriend)} 
                                    </button>
                                    <button onClick={() => setShowSendGift(true)} className="btn-gold py-2 rounded-lg font-bold text-xs mt-3 px-3">
                                        🎁
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center text-[10px] text-yellow-400 bg-yellow-500/10 p-2 rounded-lg mt-3">{t.guestProfileMsg}</div>
                            )
                        ) : (<div className="text-center text-[10px] text-gray-500 mt-3">{t.noPermission}</div>) 
                    )} 
                    
                    {currentUserData && !currentUserData.isAnonymous && !isMe && (
                        <button onClick={() => setShowReport(true)} className="btn-ghost w-full py-1 mt-2 rounded text-[10px] text-red-400 border-red-400/50 hover:bg-red-500/10">
                            {t.reportUser}
                        </button>
                    )}
                </div> 
            </div> 
            <ReportModal 
                show={showReport} 
                onClose={() => setShowReport(false)} 
                targetUser={profileData} 
                currentUser={currentUserData} 
                lang={lang} 
            />
            <SendGiftModal 
                show={showSendGift} 
                onClose={() => setShowSendGift(false)} 
                targetUser={profileData} 
                currentUser={currentUserData} 
                lang={lang} 
                onSendGift={onSendGift}
                currency={currentUserData?.currency || 0}
            />
        </> 
    ); 
};

// ==========================================
// UPDATED: MY ACCOUNT PAGE with Gifts Inventory
// ==========================================
const MyAccountPage = ({ show, onClose, userData, user, lang, onUpdate }) => { 
    const t = TRANSLATIONS[lang]; 
    const [newName, setNewName] = useState(''); 
    const [msg, setMsg] = useState(''); 
    const [showEmail, setShowEmail] = useState(false);
    const [showShop, setShowShop] = useState(false);
    const [activeTab, setActiveTab] = useState('main');
    
    useEffect(() => { if (userData) setNewName(userData.displayName || ''); }, [userData]);
    
    useEffect(() => {
        if(userData && !userData.isAnonymous) {
            const level = calculateLevel(userData.stats?.xp || 0);
            const currentAch = userData.achievements || [];
            let newAch = [...currentAch];
            if(level >= 5 && !currentAch.includes('level_5')) newAch.push('level_5');
            if(level >= 10 && !currentAch.includes('level_10')) newAch.push('level_10');
            
            // NEW: Charisma achievements
            const charisma = userData.charisma || 0;
            if(charisma >= 1000 && !currentAch.includes('charisma_1000')) newAch.push('charisma_1000');
            if(charisma >= 10000 && !currentAch.includes('charisma_10000')) newAch.push('charisma_10000');
            if(charisma >= 100000 && !currentAch.includes('charisma_100000')) newAch.push('charisma_100000');
            
            if(newAch.length > currentAch.length) {
                usersCollection.doc(userData.uid).update({ achievements: newAch });
            }
        }
    }, [userData?.stats?.xp, userData?.charisma]);

    if (!show || !userData || !user) return null; 
    
    const isGuest = userData?.isAnonymous; 
    const level = calculateLevel(userData.stats?.xp || 0); 
    const xpProgress = calculateXPProgress(userData.stats?.xp || 0); 
    const timeRemaining = getTimeRemaining(userData.lastChangedName); 
    const canChange = timeRemaining === "0d 0h"; 
    const charisma = userData.charisma || 0;
    
    const handleChangeName = async () => { 
        if(!newName.trim()) return; 
        if (!canChange) { setMsg(t.nameChangeLimit); return; } 
        await usersCollection.doc(userData.uid).update({ displayName: newName, lastChangedName: firebase.firestore.FieldValue.serverTimestamp() }); 
        setMsg("Updated!"); 
        if (onUpdate) onUpdate(); 
    }; 

    const email = user?.email || '';
    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, "$1***$3");
    const currency = userData.currency || 0;
    const inventory = userData.inventory || { frames: [], titles: [], themes: [], gifts: [] };
    
    // Frame check with FIXED dimensions
    const equippedFrameItem = userData.equipped?.frames ? SHOP_ITEMS.frames.find(f=>f.id===userData.equipped.frames) : null;
    const isEqFrameUrl = equippedFrameItem?.preview?.startsWith('http');
    const avatarSize = 56;
    const frameScale = 1.18;

    return ( 
        <>
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-2 overflow-y-auto" onClick={onClose}> 
                <div className="glass-panel rounded-2xl p-4 w-full max-w-md animate-pop my-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}> 
                    <div className="flex justify-between items-center mb-3 flex-shrink-0"> 
                        <h2 className="text-lg font-bold text-primary">{t.myAccount}</h2> 
                        <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">&times;</button>
                    </div> 
                    
                    {isGuest && <GuestBanner lang={lang} />} 
                    
                    {/* Currency & Shop */}
                    <div className="mb-3 p-2 rounded-lg bg-gradient-to-r from-yellow-900/30 to-yellow-500/10 border border-yellow-500/30 flex justify-between items-center cursor-pointer hover:bg-yellow-500/20 transition flex-shrink-0" onClick={() => setShowShop(true)}>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{CURRENCY_ICON}</span>
                            <div>
                                <div className="text-base font-bold text-yellow-400">{currency}</div>
                                <div className="text-[8px] text-gray-400 uppercase">{CURRENCY_NAME}</div>
                            </div>
                        </div>
                        <button className="btn-gold px-3 py-1 rounded text-[10px]">{t.shop}</button>
                    </div>

                    {/* Profile Header with FIXED Frame */}
                    <div className="flex items-center gap-3 mb-3 flex-shrink-0">
                        <div className="relative" style={{ width: avatarSize, height: avatarSize }}>
                            {/* Frame */}
                            {isEqFrameUrl && equippedFrameItem && (
                                <img 
                                    src={equippedFrameItem.preview} 
                                    className="absolute pointer-events-none z-20 rounded-full"
                                    style={{
                                        width: avatarSize * frameScale,
                                        height: avatarSize * frameScale,
                                        top: -(avatarSize * (frameScale - 1) / 2),
                                        left: -(avatarSize * (frameScale - 1) / 2),
                                    }}
                                    alt=""
                                />
                            )}
                            {!isEqFrameUrl && equippedFrameItem && (
                                <div 
                                    className="absolute rounded-full z-0"
                                    style={{
                                        width: avatarSize * frameScale,
                                        height: avatarSize * frameScale,
                                        top: -(avatarSize * (frameScale - 1) / 2),
                                        left: -(avatarSize * (frameScale - 1) / 2),
                                        background: equippedFrameItem.preview,
                                        padding: 3
                                    }}
                                >
                                    <div className="w-full h-full rounded-full bg-gray-900"></div>
                                </div>
                            )}
                            <img 
                                src={userData.photoURL || `https://ui-avatars.com/api/?name=${userData.displayName}&background=random`} 
                                className="rounded-full border-2 border-white/20 relative z-10" 
                                style={{ width: avatarSize, height: avatarSize }}
                                alt=""
                            />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold">
                                {userData.equipped?.titles && <span className="equipped-title text-[8px]">{lang === 'ar' ? SHOP_ITEMS.titles.find(t=>t.id===userData.equipped.titles)?.name_ar : SHOP_ITEMS.titles.find(t=>t.id===userData.equipped.titles)?.name_en}</span>}
                                {userData.displayName}
                            </div>
                            <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                                <span>{t.level} {level}</span>
                                <span className="opacity-50">|</span>
                                <span>{t.wins}: {userData.stats?.wins || 0}</span>
                                <span className="opacity-50">|</span>
                                <span className="text-yellow-400">✨ {formatCharisma(charisma)}</span>
                            </div>
                            <div className="w-full h-1 xp-bar-bg rounded-full overflow-hidden mt-1"> 
                                <div className="h-full xp-bar-fill" style={{ width: `${xpProgress}%` }}></div> 
                            </div> 
                        </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex gap-1 mb-2 border-b border-white/10 pb-2 text-xs flex-shrink-0">
                        <button onClick={() => setActiveTab('main')} className={`flex-1 py-1 rounded ${activeTab === 'main' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>{t.tabMain}</button>
                        <button onClick={() => setActiveTab('inv')} className={`flex-1 py-1 rounded ${activeTab === 'inv' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>{t.tabInv}</button>
                        <button onClick={() => setActiveTab('ach')} className={`flex-1 py-1 rounded ${activeTab === 'ach' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>{t.tabAch}</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 min-h-0">
                        {/* Main Tab */}
                        {activeTab === 'main' && (
                            <div className="space-y-3">
                                {/* Charisma Bar */}
                                <div className="glass-panel p-2 rounded-lg border border-yellow-500/30 bg-gradient-to-r from-yellow-900/20 to-transparent">
                                    <CharismaBar charisma={charisma} lang={lang} />
                                </div>

                                <div className="glass-panel p-2 rounded-lg border border-white/10 text-[10px]">
                                    <span className="text-gray-400 uppercase">{t.email}</span>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="font-mono text-xs">{showEmail ? email : maskedEmail}</span>
                                        <button onClick={() => setShowEmail(!showEmail)} className="text-cyan-400 text-[10px]">{showEmail ? "Hide" : "Show"}</button>
                                    </div>
                                </div>

                                {!isGuest && ( 
                                    <div className="glass-panel p-2 rounded-lg border border-white/10"> 
                                        <label className="text-[9px] text-gray-400 uppercase">{t.changeName}</label> 
                                        <div className="flex gap-1 mt-1"> 
                                            <input className="input-dark flex-1 p-1 rounded text-xs" value={newName} onChange={e => setNewName(e.target.value)} /> 
                                            <button onClick={handleChangeName} disabled={!canChange} className={`px-2 rounded text-[10px] font-bold ${canChange ? 'btn-neon' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>{t.save}</button> 
                                        </div> 
                                        <p className="text-[8px] text-gray-500 mt-1">{canChange ? t.canChangeNow : `${t.nameChangeCountdown}: ${timeRemaining}`}</p> 
                                    </div> 
                                )} 
                                {msg && !msg.includes('Copied') && <div className="text-center text-[10px] text-cyan-400">{msg}</div>}
                            </div>
                        )}

                        {/* Inventory Tab - UPDATED with Themes & Gifts */}
                        {activeTab === 'inv' && (
                            <div className="space-y-3">
                                {inventory.frames?.length === 0 && inventory.titles?.length === 0 && inventory.themes?.length === 0 && inventory.gifts?.length === 0 && <p className="text-center text-gray-500 text-xs py-4">No items yet.</p>}
                                
                                {/* Titles */}
                                {inventory.titles?.length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-gray-400 mb-1">{t.titles}</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {inventory.titles.map(id => {
                                                const item = SHOP_ITEMS.titles.find(i => i.id === id);
                                                const isEq = userData.equipped?.titles === id;
                                                if(!item) return null;
                                                return <button key={id} onClick={() => { usersCollection.doc(userData.uid).update({"equipped.titles": id}); if(onUpdate) onUpdate(); }} className={`px-2 py-1 rounded text-[10px] ${isEq ? 'btn-neon' : 'btn-ghost'}`}>{lang === 'ar' ? item.name_ar : item.name_en}</button>
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Frames */}
                                {inventory.frames?.length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-gray-400 mb-1">{t.frames}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {inventory.frames.map(id => {
                                                const item = SHOP_ITEMS.frames.find(i => i.id === id);
                                                const isEq = userData.equipped?.frames === id;
                                                if(!item) return null;
                                                
                                                const isUrl = item.preview?.startsWith('http');
                                                
                                                return (
                                                    <button 
                                                        key={id} 
                                                        onClick={() => { usersCollection.doc(userData.uid).update({"equipped.frames": id}); if(onUpdate) onUpdate(); }} 
                                                        className={`w-10 h-10 rounded-full overflow-hidden relative transition ${isEq ? 'ring-2 ring-cyan-400 scale-110' : 'opacity-70 hover:opacity-100'}`}
                                                    >
                                                        {isUrl ? (
                                                            <img src={item.preview} className="absolute inset-0 w-full h-full object-cover rounded-full" alt=""/>
                                                        ) : (
                                                            <div className="absolute inset-0 rounded-full" style={{ background: item.preview, padding: '3px' }}>
                                                                <div className="w-full h-full rounded-full bg-gray-800"></div>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* NEW: Themes */}
                                {inventory.themes?.length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-gray-400 mb-1">{t.themes}</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {inventory.themes.map(id => {
                                                const item = SHOP_ITEMS.themes.find(i => i.id === id);
                                                const isEq = userData.equipped?.themes === id;
                                                if(!item) return null;
                                                return <button key={id} onClick={() => { usersCollection.doc(userData.uid).update({"equipped.themes": id}); if(onUpdate) onUpdate(); }} className={`px-2 py-1 rounded text-[10px] ${isEq ? 'btn-neon' : 'btn-ghost'}`}>{lang === 'ar' ? item.name_ar : item.name_en}</button>
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* NEW: Gifts */}
                                {inventory.gifts?.length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-gray-400 mb-1">{t.gifts}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {inventory.gifts.map(g => {
                                                const item = SHOP_ITEMS.gifts.find(i => i.id === g.id);
                                                if(!item) return null;
                                                return (
                                                    <div key={g.id} className="relative flex flex-col items-center">
                                                        <span className="text-2xl">{item.emoji}</span>
                                                        <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">{g.count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Achievements Tab */}
                        {activeTab === 'ach' && (
                            <div className="grid grid-cols-3 gap-1"> 
                                {ACHIEVEMENTS.map(ach => { 
                                    const isUnlocked = (userData.achievements || []).includes(ach.id);
                                    const isHidden = ach.hidden && !isUnlocked;
                                    if(isHidden) return <div key={ach.id} className="achievement-card locked rounded p-1 text-center opacity-50"><div className="text-lg">❓</div><div className="text-[8px]">{t.hiddenAch}</div></div>;
                                    return ( 
                                        <div key={ach.id} className={`achievement-card rounded p-1 text-center ${isUnlocked ? 'unlocked' : 'locked'}`}> 
                                            <div className="text-lg">{ach.icon}</div> 
                                            <div className="text-[8px] font-bold truncate">{lang === 'ar' ? ach.name_ar : ach.name_en}</div> 
                                        </div> 
                                    ); 
                                })} 
                            </div> 
                        )}
                    </div>
                </div> 
            </div>
            <ShopModal show={showShop} onClose={() => setShowShop(false)} userData={userData} lang={lang} onUpdate={onUpdate} />
        </> 
    ); 
};
// ==========================================
// PART 5: CHAT & LOBBY COMPONENTS
// ==========================================

// Private Chat Modal
const PrivateChatModal = ({ show, onClose, friendData, currentUser, lang, onInvite, roomId, onJoinInvite, onSendGift }) => { 
    const t = TRANSLATIONS[lang]; 
    const [messages, setMessages] = useState([]); 
    const [newMsg, setNewMsg] = useState(''); 
    const [showEmojis, setShowEmojis] = useState(false); 
    const [showGiftModal, setShowGiftModal] = useState(false);
    const chatId = (friendData && currentUser) ? getChatId(currentUser.uid, friendData.uid) : null; 
    
    useEffect(() => { 
        if(show && chatId) { 
            const unsub = chatsCollection.doc(chatId).collection('messages').orderBy('timestamp', 'asc').onSnapshot(snap => { 
                setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() }))); 
            }); 
            chatsCollection.doc(chatId).set({ [`unread.${currentUser.uid}`]: 0 }, { merge: true }); 
            return unsub; 
        } 
    }, [show, chatId]); 
    
    const handleSend = async (text) => { 
        const msgText = text || newMsg; 
        if(!msgText.trim() || !chatId) return; 
        const msg = { senderId: currentUser.uid, senderName: currentUser.displayName, text: msgText, timestamp: firebase.firestore.FieldValue.serverTimestamp(), type: 'text' }; 
        const batch = db.batch(); 
        const msgRef = chatsCollection.doc(chatId).collection('messages').doc(); 
        batch.set(msgRef, msg); 
        const chatRef = chatsCollection.doc(chatId); 
        batch.set(chatRef, { members: [currentUser.uid, friendData.uid], lastMessage: msgText, timestamp: firebase.firestore.FieldValue.serverTimestamp(), [`unread.${friendData.uid}`]: firebase.firestore.FieldValue.increment(1) }, { merge: true }); 
        await batch.commit(); 
        setNewMsg(''); 
        setShowEmojis(false); 
    }; 
    
    const handleInvite = async () => { 
        if(!chatId) return; 
        const inviteMsg = { senderId: currentUser.uid, senderName: currentUser.displayName, text: `${currentUser.displayName} ${t.invitedYou}`, timestamp: firebase.firestore.FieldValue.serverTimestamp(), type: 'invite', roomId: roomId }; 
        const batch = db.batch(); 
        const msgRef = chatsCollection.doc(chatId).collection('messages').doc(); 
        batch.set(msgRef, inviteMsg); 
        const chatRef = chatsCollection.doc(chatId); 
        batch.set(chatRef, { members: [currentUser.uid, friendData.uid], lastMessage: t.inviteBtn, timestamp: firebase.firestore.FieldValue.serverTimestamp(), [`unread.${friendData.uid}`]: firebase.firestore.FieldValue.increment(1) }, { merge: true }); 
        await batch.commit(); 
    }; 
    
    // Handle gift sending in chat
    const handleSendGiftInChat = async (gift, targetUser) => {
        const currency = currentUser?.currency || 0;
        if (currency < gift.cost) return;
        
        const cashbackAmount = Math.floor(gift.cost * (gift.cashback / 100));
        const newCurrency = currency - gift.cost + cashbackAmount;
        
        // Update sender's data
        await usersCollection.doc(currentUser.uid).update({
            currency: newCurrency,
            charisma: firebase.firestore.FieldValue.increment(gift.charisma)
        });
        
        // Update receiver's charisma
        await usersCollection.doc(targetUser.uid).update({
            charisma: firebase.firestore.FieldValue.increment(gift.charisma)
        });
        
        // Send gift message in chat
        const giftMsg = { 
            senderId: currentUser.uid, 
            senderName: currentUser.displayName, 
            text: `${gift.emoji} ${lang === 'ar' ? gift.name_ar : gift.name_en}`, 
            timestamp: firebase.firestore.FieldValue.serverTimestamp(), 
            type: 'gift',
            giftId: gift.id
        };
        
        const batch = db.batch();
        const msgRef = chatsCollection.doc(chatId).collection('messages').doc();
        batch.set(msgRef, giftMsg);
        const chatRef = chatsCollection.doc(chatId);
        batch.set(chatRef, { 
            members: [currentUser.uid, friendData.uid], 
            lastMessage: `🎁 ${t.giftSent}`, 
            timestamp: firebase.firestore.FieldValue.serverTimestamp(), 
            [`unread.${friendData.uid}`]: firebase.firestore.FieldValue.increment(1) 
        }, { merge: true });
        await batch.commit();
        
        setShowGiftModal(false);
    };
    
    if(!show || !friendData || !currentUser) return null; 
    
    return ( 
        <>
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-2" onClick={()=>{onClose(); setShowEmojis(false);}}> 
                <div className="glass-panel rounded-2xl w-full max-w-lg h-[550px] flex flex-col animate-pop relative" onClick={e => e.stopPropagation()}> 
                    <div className="p-3 border-b border-white/10 flex justify-between items-center flex-shrink-0"> 
                        <div className="flex items-center gap-2"> 
                            <img src={friendData.photoURL} className="w-8 h-8 rounded-full border-2 border-cyan-400"/> 
                            <div> 
                                <h3 className="font-bold text-sm">{friendData.displayName}</h3>
                                <span className="text-[10px] text-yellow-400">✨ {formatCharisma(friendData.charisma || 0)}</span>
                            </div> 
                        </div> 
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowGiftModal(true)} className="btn-gold px-2 py-1 rounded text-[10px]">🎁</button>
                            <button onClick={onClose} className="text-xl text-gray-400 hover:text-white">&times;</button>
                        </div>
                    </div> 
                    <div className="flex-1 overflow-y-auto p-3 space-y-3"> 
                        {messages.map(m => ( 
                            <div key={m.id} className={`chat-msg-row ${m.senderId === currentUser.uid ? 'flex-row-reverse' : ''}`}> 
                                <img src={m.senderId === currentUser.uid ? currentUser.photoURL : friendData.photoURL} className="chat-avatar-sm" alt=""/> 
                                <div className="chat-content"> 
                                    <div className={`chat-header ${m.senderId === currentUser.uid ? 'justify-end' : ''}`}> 
                                        <span className="chat-username">{m.senderName}</span> 
                                        <span className="chat-timestamp">{formatTime(m.timestamp)}</span> 
                                    </div> 
                                    <div className={`chat-bubble ${m.senderId === currentUser.uid ? 'chat-bubble-me' : 'chat-bubble-other'}`}> 
                                        {m.type === 'invite' ? ( 
                                            <div className="invite-bubble"> 
                                                <p className="text-xs">{m.text}</p> 
                                                {m.senderId !== currentUser.uid && m.roomId && ( 
                                                    <button onClick={() => onJoinInvite(m.roomId)} className="btn-neon px-3 py-1 rounded text-[10px] mt-1">{t.joinInvite}</button> 
                                                )} 
                                            </div> 
                                        ) : m.type === 'gift' ? (
                                            <div className="text-center py-1">
                                                <span className="text-3xl">{m.text.split(' ')[0]}</span>
                                                <p className="text-[10px] text-yellow-400 mt-1">{t.giftReceived}</p>
                                            </div>
                                        ) : ( 
                                            <p className="text-sm">{m.text}</p> 
                                        )} 
                                    </div> 
                                </div> 
                            </div> 
                        ))} 
                    </div> 
                    {showEmojis && ( 
                        <div className="emoji-picker-container"> 
                            <div className="flex justify-between items-center mb-1"> 
                                <span className="text-[10px] text-gray-400">{t.selectEmoji}</span> 
                                <button onClick={() => setShowEmojis(false)} className="text-[10px] text-gray-500 hover:text-white">&times;</button> 
                            </div> 
                            <div className="emoji-grid"> 
                                {EMOJI_LIST.map(emoji => ( 
                                    <span key={emoji} onClick={() => handleSend(emoji)} className="emoji-item">{emoji}</span> 
                                ))} 
                            </div> 
                        </div> 
                    )} 
                    <div className="p-3 border-t border-white/10 relative flex-shrink-0"> 
                        {roomId && !currentUser.isAnonymous && (<button onClick={handleInvite} className="btn-success w-full py-1 rounded text-[10px] mb-1">{t.inviteBtn}</button>)} 
                        <div className="flex gap-1 items-center"> 
                            <button onClick={() => setShowEmojis(!showEmojis)} className="btn-ghost p-1 rounded-full text-lg">😀</button> 
                            <input className="input-dark flex-1 p-2 rounded-full text-xs" placeholder={t.chatPlaceholder} value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} /> 
                            <button onClick={() => handleSend()} className="btn-neon px-3 rounded-full text-xs">{t.send}</button> 
                        </div> 
                    </div> 
                </div> 
            </div>
            <SendGiftModal 
                show={showGiftModal} 
                onClose={() => setShowGiftModal(false)} 
                targetUser={friendData} 
                currentUser={currentUser} 
                lang={lang} 
                onSendGift={handleSendGiftInChat}
                currency={currentUser?.currency || 0}
            />
        </> 
    ); 
};

// Game Chat Message
const GameChatMessage = ({ msg, currentUser, players, onAvatarClick }) => { 
    const sender = players.find(p => p.uid === msg.sender); 
    const isMe = msg.sender === currentUser.uid; 
    if(msg.sender === 'system') return <div className="text-center text-[9px] text-gray-500 my-1">{msg.text}</div>; 
    return ( 
        <div className={`chat-msg-row ${isMe ? 'flex-row-reverse' : ''}`}> 
            <img src={sender?.photo || `https://ui-avatars.com/api/?name=${sender?.name}`} className="chat-avatar-sm" alt="" onClick={() => onAvatarClick(msg.sender)} /> 
            <div className="chat-content"> 
                <div className={`chat-header ${isMe ? 'justify-end' : ''}`}> 
                    <span className="chat-username">{msg.name}</span> 
                    <span className="chat-timestamp">{formatTime(msg.time)}</span> 
                </div> 
                <div className={`chat-bubble ${isMe ? 'chat-bubble-me' : 'chat-bubble-other'}`}><p>{msg.text}</p></div> 
            </div> 
        </div> 
    ); 
};

// Lobby Browser Modal
const LobbyBrowserModal = ({ show, onClose, lang, onJoinRoom }) => { 
    const t = TRANSLATIONS[lang]; 
    const [rooms, setRooms] = useState([]); 
    const [passwordInput, setPasswordInput] = useState(''); 
    const [selectedRoom, setSelectedRoom] = useState(null); 
    
    useEffect(() => { 
        if(show) { 
            const unsub = roomsCollection.where('status', '==', 'waiting').onSnapshot(snap => { 
                setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() }))); 
            }); 
            return unsub; 
        } 
    }, [show]); 
    
    const handleJoinClick = (room) => { 
        if(room.isPrivate) { 
            setSelectedRoom(room); 
        } else { 
            onJoinRoom(room.id, null); 
            onClose(); 
        } 
    }; 
    
    const handlePasswordSubmit = () => { 
        if(selectedRoom && selectedRoom.password === passwordInput) { 
            onJoinRoom(selectedRoom.id, passwordInput); 
            onClose(); 
        } else { 
            alert("Wrong Password!"); 
        } 
    }; 
    
    if(!show) return null; 
    
    return ( 
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-2" onClick={onClose}> 
            <div className="glass-panel rounded-2xl p-4 w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col animate-pop" onClick={e => e.stopPropagation()}> 
                <div className="flex justify-between items-center mb-3"> 
                    <h2 className="text-lg font-bold text-primary">{t.lobbyTitle}</h2> 
                    <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">&times;</button> 
                </div> 
                {selectedRoom && ( 
                    <div className="mb-3 p-3 border border-white/10 rounded-lg bg-black/20"> 
                        <p className="text-xs mb-2">Password for <span className="font-bold">{selectedRoom.id}</span></p> 
                        <div className="flex gap-2"> 
                            <input type="password" className="input-dark flex-1 p-2 rounded text-xs" placeholder="Password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} /> 
                            <button onClick={handlePasswordSubmit} className="btn-neon px-3 rounded text-xs">{t.join}</button> 
                            <button onClick={() => setSelectedRoom(null)} className="btn-ghost px-2 rounded">&times;</button> 
                        </div> 
                    </div> 
                )} 
                <div className="flex-1 overflow-y-auto space-y-1"> 
                    {rooms.length === 0 && <div className="text-center text-gray-500 py-10 text-xs">{t.noRooms}</div>} 
                    {rooms.map(r => ( 
                        <div key={r.id} className="flex justify-between items-center p-2 bg-white/5 rounded-lg hover:bg-white/10 transition"> 
                            <div> 
                                <div className="flex items-center gap-1"> 
                                    <span className="font-mono text-primary font-bold text-xs">{r.id}</span> 
                                    {r.isPrivate && <span className="text-[8px] bg-yellow-500/20 text-yellow-400 px-1 rounded">🔒</span>} 
                                    <span className={`text-[8px] ${r.mode === 'advanced' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'} px-1 rounded`}>{r.mode === 'advanced' ? t.advancedMode : t.normalMode}</span> 
                                </div> 
                                <div className="text-[10px] text-gray-400">{r.players?.length || 0}/10</div> 
                            </div> 
                            <button onClick={() => handleJoinClick(r)} className="btn-neon px-3 py-1 rounded text-[10px]">{t.join}</button> 
                        </div> 
                    ))} 
                </div> 
            </div> 
        </div> 
    ); 
};
// ==========================================
// PART 6: APP COMPONENT - Main Application Logic
// Includes: Player Leave System, Gift Functions, Game Logic
// ==========================================

function App() {
    const [lang, setLang] = useState('en');
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [room, setRoom] = useState(null);
    const [roomId, setRoomId] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [nickname, setNickname] = useState(() => localStorage.getItem('pro_spy_nick') || '');
    const [loading, setLoading] = useState(false);
    const [chatMsg, setChatMsg] = useState('');
    const [turnTimer, setTurnTimer] = useState(30);
    const [votingTimer, setVotingTimer] = useState(30);
    const [wordSelTimer, setWordSelTimer] = useState(30);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [setupMode, setSetupMode] = useState('normal');
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState('');
    const [activeView, setActiveView] = useState('lobby');
    const [showDropdown, setShowDropdown] = useState(false);
    const [joinError, setJoinError] = useState('');
    const [alertMessage, setAlertMessage] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [friendsData, setFriendsData] = useState([]);
    const [addFriendId, setAddFriendId] = useState('');
    const [friendSearchMsg, setFriendSearchMsg] = useState('');
    const [friendRequests, setFriendRequests] = useState([]);
    const [showChat, setShowChat] = useState(false);
    const [chatFriend, setChatFriend] = useState(null);
    const [showMyAccount, setShowMyAccount] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [targetProfileUID, setTargetProfileUID] = useState(null);
    const [chatsMeta, setChatsMeta] = useState({});
    const [totalUnread, setTotalUnread] = useState(0);
    const [openChatId, setOpenChatId] = useState(null);
    const [showLobby, setShowLobby] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    
    const t = TRANSLATIONS[lang];
    const isLoggedIn = user && !user.isAnonymous;
    const isGuest = user && user.isAnonymous;

    // ==========================================
    // BACKGROUND CANVAS ANIMATION
    // ==========================================
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

    // ==========================================
    // AUTH & USER DATA LISTENERS
    // ==========================================
    useEffect(() => {
        const unsubAuth = auth.onAuthStateChanged(async (u) => {
            if (u) { 
                setUser(u); 
                const userRef = usersCollection.doc(u.uid); 
                const doc = await userRef.get();
                if (!doc.exists) { 
                    const newUserData = { 
                        uid: u.uid, 
                        email: u.email, 
                        displayName: u.displayName || u.uid.substring(0,5), 
                        photoURL: u.photoURL, 
                        customId: generateUID(), 
                        stats: { wins: 0, losses: 0, xp: 0 }, 
                        achievements: [], 
                        friends: [], 
                        friendRequests: [], 
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(), 
                        lastChangedName: null, 
                        lastActive: firebase.firestore.FieldValue.serverTimestamp(), 
                        isAnonymous: u.isAnonymous, 
                        currency: 100, 
                        inventory: {frames: [], titles: [], themes: [], gifts: []}, 
                        equipped: {},
                        charisma: 0 // NEW: Initialize charisma
                    }; 
                    await userRef.set(newUserData); 
                    setUserData(newUserData); 
                    if (u.displayName) setNickname(u.displayName); 
                }
                const unsubSnap = userRef.onSnapshot(snap => { 
                    if (snap.exists) { 
                        setUserData(snap.data()); 
                        if (snap.data().displayName) setNickname(snap.data().displayName); 
                    } 
                }); 
                return () => unsubSnap();
            } else { setUser(null); setUserData(null); }
        }); 
        return unsubAuth;
    }, []);

    useEffect(() => {
        const tutorialDone = localStorage.getItem('pro_spy_tutorial_v2');
        if(!tutorialDone && !isGuest) setShowTutorial(true);
    }, [isGuest]);

    useEffect(() => { 
        if (!user) return; 
        const interval = setInterval(() => { 
            usersCollection.doc(user.uid).update({ lastActive: firebase.firestore.FieldValue.serverTimestamp() }); 
        }, 60000); 
        return () => clearInterval(interval); 
    }, [user]);

    // ==========================================
    // ROOM LISTENER with PLAYER LEAVE DETECTION
    // ==========================================
    useEffect(() => { 
        if (!user || !roomId) return; 
        const unsub = roomsCollection.doc(roomId).onSnapshot(async doc => { 
            if (doc.exists) { 
                const data = doc.data(); 
                setRoom(data);
                
                // ==========================================
                // NEW: PLAYER LEAVE DETECTION FOR NORMAL MODE
                // ==========================================
                if (data.status !== 'waiting' && data.status !== 'finished_spy_caught' && data.status !== 'finished_spy_wins' && data.status !== 'finished_mrwhite_wins') {
                    const activePlayers = data.players.filter(p => p.status === 'active');
                    
                    // If only 1 or 0 active players left, end the game
                    if (activePlayers.length <= 1 && data.mode === 'normal') {
                        const leftPlayer = data.players.find(p => p.status !== 'active' && p.status !== 'spectator');
                        
                        // Determine winner based on who left
                        if (activePlayers.length === 1) {
                            const lastPlayer = activePlayers[0];
                            // Check if the remaining player is the spy
                            if (lastPlayer.uid === data.spyId) {
                                // Spy is alone - Spy wins!
                                await endGameDueToLeave(false, data);
                            } else {
                                // Agent is alone (spy left) - Agents win!
                                await endGameDueToLeave(true, data);
                            }
                        } else if (activePlayers.length === 0) {
                            // Everyone left - end game
                            await roomsCollection.doc(roomId).update({ 
                                status: 'finished_spy_caught',
                                finishedAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        }
                    }
                }
                
                // Check for game end summary
                if(data.status?.includes('finished') && !data.summaryShown) { 
                    setShowSummary(true); 
                    historyCollection.add({ ...data, finishedAt: firebase.firestore.FieldValue.serverTimestamp() }); 
                    roomsCollection.doc(roomId).update({summaryShown: true}); 
                } 
            } else {
                setRoom(null); 
                setRoomId('');
            } 
        }); 
        return unsub; 
    }, [user, roomId]);

    // NEW: End game when player leaves
    const endGameDueToLeave = async (agentsWin, roomData) => {
        if (!roomData) return;
        
        let status = agentsWin ? 'finished_spy_caught' : 'finished_spy_wins';
        
        // Update game stats for remaining players
        const batch = db.batch();
        roomData.players.forEach(p => {
            if(!p.uid) return;
            const userRef = usersCollection.doc(p.uid);
            const isWinner = (p.uid === roomData.spyId && !agentsWin) || (p.uid !== roomData.spyId && agentsWin);
            batch.update(userRef, { 
                "stats.wins": firebase.firestore.FieldValue.increment(isWinner ? 1 : 0), 
                "stats.losses": firebase.firestore.FieldValue.increment(!isWinner ? 1 : 0), 
                "stats.xp": firebase.firestore.FieldValue.increment(isWinner ? 50 : 10), 
                "currency": firebase.firestore.FieldValue.increment(isWinner ? 50 : 10),
                "charisma": firebase.firestore.FieldValue.increment(isWinner ? 100 : 20) // NEW: Charisma for game completion
            });
        });
        await batch.commit();
        
        await roomsCollection.doc(roomId).update({ 
            status, 
            turnEndTime: null, 
            votingEndTime: null, 
            finishedAt: firebase.firestore.FieldValue.serverTimestamp() 
        });
        
        setAlertMessage(agentsWin ? t.spyLeftAgentsWin : t.agentLeftSpyWins);
    };

    // Leaderboard & Friends listeners
    useEffect(() => { 
        if (activeView === 'leaderboard') { 
            usersCollection.orderBy('stats.wins', 'desc').limit(100).get().then(snap => { 
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => !d.isAnonymous); 
                setLeaderboardData(data); 
            }); 
        } 
    }, [activeView]);

    useEffect(() => { 
        if (activeView === 'friends' && userData) { 
            if (userData.friends?.length > 0) { 
                usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', userData.friends).get().then(snap => { 
                    setFriendsData(snap.docs.map(d => ({ id: d.id, ...d.data() }))); 
                }); 
            } else { setFriendsData([]); } 
            if (userData.friendRequests?.length > 0) { 
                usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', userData.friendRequests).get().then(snap => { 
                    setFriendRequests(snap.docs.map(d => ({ id: d.id, ...d.data() }))); 
                }); 
            } else { setFriendRequests([]); } 
        } 
    }, [activeView, userData?.friends, userData?.friendRequests]);

    useEffect(() => { 
        if (!user) return; 
        const unsub = chatsCollection.where('members', 'array-contains', user.uid).onSnapshot(snap => { 
            let total = 0; 
            const meta = {}; 
            snap.docs.forEach(doc => { 
                const d = doc.data(); 
                meta[doc.id] = d; 
                const myUnread = d.unread?.[user.uid] || 0; 
                total += myUnread; 
            }); 
            setChatsMeta(meta); 
            setTotalUnread(total); 
        }); 
        return unsub; 
    }, [user, openChatId]);

    // Timer effects
    useEffect(() => { 
        if (room?.status === 'discussing' && room?.turnEndTime) { 
            const interval = setInterval(() => { 
                const remaining = Math.max(0, Math.floor((room.turnEndTime - Date.now()) / 1000)); 
                setTurnTimer(remaining); 
                if (remaining <= 0) { handleSkipTurn(true); clearInterval(interval); } 
            }, 1000); 
            return () => clearInterval(interval); 
        } else setTurnTimer(30); 
    }, [room?.status, room?.turnEndTime]);

    useEffect(() => { 
        if (room?.status === 'voting' && room?.votingEndTime) { 
            const interval = setInterval(() => { 
                const remaining = Math.max(0, Math.floor((room.votingEndTime - Date.now()) / 1000)); 
                setVotingTimer(remaining); 
                if (remaining <= 0) { resolveVotes(true); clearInterval(interval); } 
            }, 1000); 
            return () => clearInterval(interval); 
        } else setVotingTimer(30); 
    }, [room?.status, room?.votingEndTime]);

    useEffect(() => { 
        if (room?.status === 'word_selection' && room?.wordSelEndTime) { 
            const interval = setInterval(() => { 
                const remaining = Math.max(0, Math.floor((room.wordSelEndTime - Date.now()) / 1000)); 
                setWordSelTimer(remaining); 
                if (remaining <= 0) { finishWordSelection(); clearInterval(interval); } 
            }, 1000); 
            return () => clearInterval(interval); 
        } else setWordSelTimer(30); 
    }, [room?.status, room?.wordSelEndTime]);

    useEffect(() => { 
        const handleBeforeUnload = async (e) => { 
            if (room && user) { handleLeaveRoom(true); } 
        }; 
        window.addEventListener('beforeunload', handleBeforeUnload); 
        return () => window.removeEventListener('beforeunload', handleBeforeUnload); 
    }, [room, user]);

    // ==========================================
    // AUTH FUNCTIONS
    // ==========================================
    const handleGoogleLogin = async () => { 
        const provider = new firebase.auth.GoogleAuthProvider(); 
        try { await auth.signInWithPopup(provider); } catch (e) { console.error(e); } 
    };
    
    const handleLogout = async () => { 
        await auth.signOut(); 
        setShowDropdown(false); 
        setNickname(''); 
        localStorage.removeItem('pro_spy_nick'); 
    };
    
    const getDefaultPhoto = (uData, name) => {
        return uData?.photoURL || `https://ui-avatars.com/api/?name=${name || 'Guest'}&background=random`;
    };

    // ==========================================
    // ROOM FUNCTIONS
    // ==========================================
    const handleCreateGame = async () => { 
        if (!nickname.trim()) return; 
        if (isPrivate && !password.trim()) {
            setAlertMessage(t.privateRoomError);
            return;
        }
        playSound('click'); setLoading(true); 
        let uid = user?.uid; 
        if (!uid) { const anon = await auth.signInAnonymously(); uid = anon.user.uid; setUser(anon.user); } 
        const id = Math.random().toString(36).substring(2, 7).toUpperCase(); 
        await roomsCollection.doc(id).set({ 
            id, 
            admin: uid, 
            status: 'waiting', 
            players: [{ uid: uid, name: nickname, status: 'active', photo: getDefaultPhoto(userData, nickname), role: null, equipped: userData?.equipped || {} }], 
            scenario: null, 
            spyId: null, 
            currentTurnUID: null, 
            turnEndTime: null, 
            votingEndTime: null, 
            currentRound: 0, 
            messages: [], 
            votes: {}, 
            usedLocations: [], 
            wordVotes: {}, 
            chosenWord: null, 
            wordSelEndTime: null, 
            votingRequest: null, 
            mode: setupMode, 
            isPrivate: isPrivate, 
            password: isPrivate ? password : null, 
            startedAt: null, 
            summaryShown: false 
        }); 
        setRoomId(id); setLoading(false); setShowSetupModal(false); setActiveView('lobby'); 
    };
    
    const handleJoinGame = async (id, pwd) => {
        if (!id || id.trim() === "") { 
            setJoinError(t.enterCodeError); 
            return; 
        }
        if (!nickname.trim()) return;
        playSound('click'); setLoading(true); setJoinError(''); 
        
        let uid = user?.uid; 
        if (!uid) { const anon = await auth.signInAnonymously(); uid = anon.user.uid; setUser(anon.user); } 
        
        const ref = roomsCollection.doc(id.toUpperCase()); 
        const snap = await ref.get(); 
        if (snap.exists) { 
            const data = snap.data(); 
            if(data.isPrivate && data.password !== pwd) { setJoinError("Incorrect Password"); setLoading(false); return; } 
            const exists = data.players.find(p => p.uid === uid); 
            if (!exists) { 
                await ref.update({ 
                    players: [...data.players, { 
                        uid: uid, 
                        name: nickname, 
                        status: 'active', 
                        photo: getDefaultPhoto(userData, nickname), 
                        role: null, 
                        equipped: userData?.equipped || {} 
                    }] 
                }); 
            } 
            setRoomId(id.toUpperCase()); setActiveView('lobby'); 
        } else { setJoinError("Room not found"); } 
        setLoading(false); 
    };
    
    const handleJoinFromInvite = async (rId) => { 
        setShowChat(false); 
        setInputCode(rId); 
        setLoading(true); 
        let uid = user?.uid; 
        if (!uid) { const anon = await auth.signInAnonymously(); uid = anon.user.uid; setUser(anon.user); } 
        const ref = roomsCollection.doc(rId); 
        const snap = await ref.get(); 
        if (snap.exists) { 
            const data = snap.data(); 
            const exists = data.players.find(p => p.uid === uid); 
            if (!exists) { 
                await ref.update({ 
                    players: [...data.players, { 
                        uid: uid, 
                        name: nickname, 
                        status: 'active', 
                        photo: getDefaultPhoto(userData, nickname), 
                        role: null, 
                        equipped: userData?.equipped || {} 
                    }] 
                }); 
            } 
            setRoomId(rId); setActiveView('lobby'); 
        } 
        setLoading(false); 
    };

    // ==========================================
    // UPDATED: LEAVE ROOM with PLAYER LEAVE LOGIC
    // ==========================================
    const handleLeaveRoom = async (isUnload = false) => { 
        if (!room || !user) return; 
        if (!isUnload) playSound('click'); 
        const isAdmin = room.admin === user.uid;
        const myRole = room.players.find(p => p.uid === user.uid)?.role;
        const isActive = room.players.find(p => p.uid === user.uid)?.status === 'active';
        
        // If game is in progress and player is active in NORMAL mode
        if (room.status !== 'waiting' && room.status !== 'finished_spy_caught' && room.status !== 'finished_spy_wins' && room.status !== 'finished_mrwhite_wins' && isActive && room.mode === 'normal') {
            // Mark player as spectator (left the game)
            const newPlayers = room.players.map(p => {
                if (p.uid === user.uid) return { ...p, status: 'spectator' };
                return p;
            });
            
            await roomsCollection.doc(roomId).update({ players: newPlayers });
            
            // The room listener will handle the game end logic
        } else if (isAdmin) {
            await roomsCollection.doc(roomId).delete(); 
        } else {
            await roomsCollection.doc(roomId).update({ players: room.players.filter(p => p.uid !== user.uid) }); 
        }
        
        if (!isUnload) { 
            setRoom(null); 
            setRoomId(''); 
            setShowSummary(false); 
        } 
    };

    // ==========================================
    // GAME FUNCTIONS
    // ==========================================
    const startGame = async () => { 
        if (room.admin !== user?.uid) return; 
        playSound('success'); 
        const activePlayers = room.players.filter(p => p.status === 'active'); 
        const playerCount = activePlayers.length; 
        if (room.mode === 'advanced' && playerCount < 6) { setAlertMessage("Advanced mode requires 6+ players!"); return; } 
        if (playerCount < 3) { setAlertMessage(t.needPlayers); return; } 
        if (playerCount > 10) { setAlertMessage("Max 10 players allowed."); return; } 
        const used = room.usedLocations || []; 
        const avail = SCENARIOS.filter(s => !used.includes(s.loc_en)); 
        const scenario = (avail.length > 0 ? avail : SCENARIOS)[Math.floor(Math.random() * (avail.length || SCENARIOS.length))]; 
        const spy = activePlayers[Math.floor(Math.random() * activePlayers.length)]; 
        let roles = {}; 
        if (room.mode === 'advanced') { 
            roles[spy.uid] = 'spy'; 
            let potentialWhites = activePlayers.filter(p => p.uid !== spy.uid); 
            if(potentialWhites.length > 0) { 
                const mrWhite = potentialWhites[Math.floor(Math.random() * potentialWhites.length)]; 
                roles[mrWhite.uid] = 'mrwhite'; 
                potentialWhites = potentialWhites.filter(p => p.uid !== mrWhite.uid); 
            } 
            if(potentialWhites.length > 0) { 
                const informant = potentialWhites[Math.floor(Math.random() * potentialWhites.length)]; 
                roles[informant.uid] = 'informant'; 
            } 
            activePlayers.forEach(p => { if(!roles[p.uid]) roles[p.uid] = 'agent'; }); 
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
            currentTurnUID: firstPlayer.uid, 
            turnEndTime: null, 
            currentRound: 1, 
            players: room.players.map(p => ({ ...p, vote: null, role: roles[p.uid] || 'agent' })), 
            usedLocations: firebase.firestore.FieldValue.arrayUnion(scenario.loc_en), 
            messages: [], 
            votes: {}, 
            wordVotes: {}, 
            chosenWord: null, 
            wordSelEndTime: Date.now() + 30000, 
            votingRequest: null, 
            startedAt: firebase.firestore.FieldValue.serverTimestamp() 
        }); 
    };

    const submitWordVote = async (word) => { 
        if (!user || !room || room.status !== 'word_selection') return; 
        playSound('click'); 
        const voteUpdate = {}; 
        voteUpdate[`wordVotes.${user.uid}`] = word; 
        await roomsCollection.doc(roomId).update(voteUpdate); 
    };

    const finishWordSelection = async () => { 
        if (!room || room.status !== 'word_selection') return; 
        const freshSnap = await roomsCollection.doc(roomId).get(); 
        const freshData = freshSnap.data(); 
        const counts = {}; 
        Object.values(freshData.wordVotes || {}).forEach(v => counts[v] = (counts[v] || 0) + 1); 
        let maxCount = 0; 
        let chosenWord = (lang === 'ar' ? freshData.scenario.words_ar[0] : freshData.scenario.words_en[0]); 
        for (const w in counts) { if (counts[w] > maxCount) { maxCount = counts[w]; chosenWord = w; } } 
        await roomsCollection.doc(roomId).update({ status: 'discussing', turnEndTime: Date.now() + 30000, chosenWord: chosenWord, wordSelEndTime: null }); 
    };

    const handleSkipTurn = async (forced = false) => { 
        if (!room) return; 
        if (!forced && room.currentTurnUID !== user?.uid) return; 
        if (forced && room.status !== 'discussing') return; 
        nextTurn(); 
    };

    const nextTurn = async () => { 
        if (!room) return; 
        const activePlayers = room.players.filter(p => p.status === 'active'); 
        const currentIndex = activePlayers.findIndex(p => p.uid === room.currentTurnUID); 
        const nextIndex = (currentIndex + 1) % activePlayers.length; 
        await roomsCollection.doc(roomId).update({ currentTurnUID: activePlayers[nextIndex].uid, turnEndTime: Date.now() + 30000 }); 
    };

    const requestVoting = async () => { 
        if (!room || room.status !== 'discussing') return; 
        playSound('click'); 
        if (room.admin === user?.uid) { await triggerVoting(); return; } 
        await roomsCollection.doc(roomId).update({ votingRequest: { requestedBy: user.uid, votes: { [user.uid]: true } } }); 
    };

    const agreeToVote = async () => { 
        if (!room || !room.votingRequest) return; 
        playSound('click'); 
        const currentVotes = room.votingRequest.votes || {}; 
        const newVotes = { ...currentVotes, [user.uid]: true }; 
        const activePlayers = room.players.filter(p => p.status === 'active'); 
        const majorityCount = Math.floor(activePlayers.length / 2) + 1; 
        if (user?.uid === room.admin) { await triggerVoting(); return; } 
        const agreeCount = Object.values(newVotes).filter(v => v === true).length; 
        if (agreeCount >= majorityCount) { await triggerVoting(); } else { await roomsCollection.doc(roomId).update({ "votingRequest.votes": newVotes }); } 
    };

    const declineVote = async () => { 
        if (!room || !room.votingRequest) return; 
        playSound('click'); 
        const currentVotes = room.votingRequest.votes || {}; 
        const newVotes = { ...currentVotes, [user.uid]: false }; 
        const activePlayers = room.players.filter(p => p.status === 'active'); 
        const majorityCount = Math.floor(activePlayers.length / 2) + 1; 
        const declineCount = Object.values(newVotes).filter(v => v === false).length; 
        if (declineCount >= majorityCount) { await roomsCollection.doc(roomId).update({ votingRequest: null }); } else { await roomsCollection.doc(roomId).update({ "votingRequest.votes": newVotes }); } 
    };

    const triggerVoting = async () => { 
        playSound('click'); 
        const sysMsg = { sender: 'system', name: 'SYSTEM', text: t.votingStarted, time: Date.now() }; 
        await roomsCollection.doc(roomId).update({ status: 'voting', currentTurnUID: null, turnEndTime: null, votingEndTime: Date.now() + 30000, messages: firebase.firestore.FieldValue.arrayUnion(sysMsg), votingRequest: null }); 
    };

    const sendMessage = async (text) => { 
        if (!text.trim() || !user) return; 
        playSound('click'); 
        const msg = { sender: user.uid, name: nickname, text: text, time: Date.now() }; 
        await roomsCollection.doc(roomId).update({ messages: firebase.firestore.FieldValue.arrayUnion(msg) }); 
        setChatMsg(''); 
    };

    const submitVote = async (targetUID) => { 
        if (!targetUID || !user || (room.votes && room.votes[user.uid])) return; 
        playSound('click'); 
        const voteUpdate = {}; 
        voteUpdate[`votes.${user.uid}`] = targetUID; 
        await roomsCollection.doc(roomId).update(voteUpdate); 
    };

    const endVotingNow = async () => { 
        if (room.admin !== user?.uid) return; 
        await resolveVotes(true); 
    };

    const resolveVotes = async (forced = false) => { 
        if (!room || room.status !== 'voting') return; 
        const freshSnap = await roomsCollection.doc(roomId).get(); 
        const freshData = freshSnap.data(); 
        if (freshData.status !== 'voting') return; 
        const activePlayers = freshData.players.filter(p => p.status === 'active'); 
        const votes = freshData.votes || {}; 
        const voteCounts = {}; 
        Object.values(votes).forEach(v => voteCounts[v] = (voteCounts[v] || 0) + 1); 
        let maxVotes = 0; let ejectedUID = null; let isTie = false; 
        for (const uid in voteCounts) { 
            if (voteCounts[uid] > maxVotes) { maxVotes = voteCounts[uid]; ejectedUID = uid; isTie = false; } 
            else if (voteCounts[uid] === maxVotes) { isTie = true; } 
        } 
        const majorityNeeded = Math.floor(activePlayers.length / 2) + 1; 
        if (isTie || maxVotes < majorityNeeded) { 
            const nextRound = (freshData.currentRound || 1) + 1; 
            if (nextRound > MAX_ROUNDS) { await endGame(false); } 
            else { 
                const firstPlayer = activePlayers.find(p => freshData.players.find(fp=>fp.uid===p.uid)?.role !== 'spy') || activePlayers[0]; 
                await roomsCollection.doc(roomId).update({ status: 'word_selection', votes: {}, currentRound: nextRound, currentTurnUID: firstPlayer.uid, turnEndTime: null, votingEndTime: null, wordVotes: {}, chosenWord: null, wordSelEndTime: Date.now() + 30000 }); 
            } 
        } else { 
            const newPlayers = freshData.players.map(p => { 
                if (p.uid === ejectedUID) return { ...p, status: freshData.mode === 'advanced' && p.role !== 'spy' ? 'ghost' : 'spectator' }; 
                return p; 
            }); 
            const isSpy = ejectedUID === freshData.spyId; 
            const mrWhite = freshData.players.find(p => p.role === 'mrwhite'); 
            if (mrWhite && ejectedUID === mrWhite.uid) { 
                await endGame(false, true); 
                await roomsCollection.doc(roomId).update({ players: newPlayers, finishedAt: firebase.firestore.FieldValue.serverTimestamp() }); 
            } else if (isSpy) { 
                await updateGameStats(freshData.players, freshData.spyId, true); 
                await roomsCollection.doc(roomId).update({ players: newPlayers, status: 'finished_spy_caught', finishedAt: firebase.firestore.FieldValue.serverTimestamp() }); 
            } else { 
                const remainingAgents = newPlayers.filter(p => p.status === 'active' && p.role !== 'spy'); 
                if (remainingAgents.length <= 1) { 
                    await endGame(false); 
                    await roomsCollection.doc(roomId).update({ players: newPlayers, finishedAt: firebase.firestore.FieldValue.serverTimestamp() }); 
                } else { 
                    const nextRound = (freshData.currentRound || 1) + 1; 
                    if (nextRound > MAX_ROUNDS) { 
                        await endGame(false); 
                        await roomsCollection.doc(roomId).update({ players: newPlayers, finishedAt: firebase.firestore.FieldValue.serverTimestamp() }); 
                    } else { 
                        const firstPlayer = newPlayers.filter(p => p.status === 'active').find(p => p.role !== 'spy') || newPlayers.filter(p => p.status === 'active')[0]; 
                        await roomsCollection.doc(roomId).update({ players: newPlayers, status: 'word_selection', votes: {}, currentTurnUID: firstPlayer.uid, turnEndTime: null, votingEndTime: null, currentRound: nextRound, wordVotes: {}, chosenWord: null, wordSelEndTime: Date.now() + 30000 }); 
                        return; 
                    } 
                } 
            } 
        } 
    };

    const handleMrWhiteGuess = async (guess) => { 
        if(!room || !user) return; 
        const me = room.players.find(p => p.uid === user.uid); 
        if(me.role !== 'mrwhite') return; 
        const correct = (lang === 'ar' ? room.scenario?.loc_ar : room.scenario?.loc_en); 
        if(guess === correct) { 
            playSound('success'); 
            await endGame(false, true, true); 
        } else { 
            setAlertMessage("Wrong guess!"); 
        } 
    };

    // ==========================================
    // UPDATED: GAME STATS with CHARISMA
    // ==========================================
    const updateGameStats = async (players, spyId, agentsWin) => { 
        const batch = db.batch(); 
        const spyWin = !agentsWin;
        players.forEach(p => { 
            if(!p.uid) return; 
            const userRef = usersCollection.doc(p.uid); 
            const isWinner = (p.uid === spyId && spyWin) || (p.uid !== spyId && !spyWin); 
            batch.update(userRef, { 
                "stats.wins": firebase.firestore.FieldValue.increment(isWinner ? 1 : 0), 
                "stats.losses": firebase.firestore.FieldValue.increment(!isWinner ? 1 : 0), 
                "stats.xp": firebase.firestore.FieldValue.increment(isWinner ? 50 : 10), 
                "currency": firebase.firestore.FieldValue.increment(isWinner ? 50 : 10),
                "charisma": firebase.firestore.FieldValue.increment(isWinner ? 100 : 20) // NEW: Charisma
            }); 
        }); 
        await batch.commit(); 
        checkGameAchievements(players, spyId, spyWin); 
    };

    const checkGameAchievements = async (players, spyId, spyWin) => { 
        await Promise.all(players.map(async (p) => { 
            if(!p || !p.uid || p.isAnonymous) return; 
            const userRef = usersCollection.doc(p.uid); 
            const doc = await userRef.get(); 
            if(!doc.exists) return; 
            const data = doc.data(); 
            const wins = (data.stats?.wins || 0); 
            const charisma = (data.charisma || 0);
            const currentAch = data.achievements || []; 
            let newAch = [...currentAch]; 
            if(wins >= 1 && !currentAch.includes('first_win')) newAch.push('first_win'); 
            if(wins >= 5 && !currentAch.includes('wins_5')) newAch.push('wins_5'); 
            if(wins >= 10 && !currentAch.includes('wins_10')) newAch.push('wins_10'); 
            if(wins >= 20 && !currentAch.includes('wins_20')) newAch.push('wins_20'); 
            if(wins >= 50 && !currentAch.includes('wins_50')) newAch.push('wins_50'); 
            if(wins >= 100 && !currentAch.includes('wins_100')) newAch.push('wins_100');
            // Charisma achievements
            if(charisma >= 1000 && !currentAch.includes('charisma_1000')) newAch.push('charisma_1000');
            if(charisma >= 10000 && !currentAch.includes('charisma_10000')) newAch.push('charisma_10000');
            if(charisma >= 100000 && !currentAch.includes('charisma_100000')) newAch.push('charisma_100000');
            if(!spyWin){ 
                const votesAgainstMe = Object.values(room.votes || {}).filter(v => v === p.uid).length; 
                if(votesAgainstMe === 0 && !currentAch.includes('ghost_protocol')) newAch.push('ghost_protocol'); 
            } 
            if(newAch.length > currentAch.length) { 
                try { 
                    await userRef.update({ achievements: newAch }); 
                    setNotification(`${t.achUnlock}`); 
                } catch(err) { console.error("Ach err", err); } 
            } 
        })); 
    };

    const endGame = async (agentsWin, mrWhiteWin = false) => { 
        playSound(agentsWin ? 'success' : 'fail'); 
        let status = agentsWin ? 'finished_spy_caught' : 'finished_spy_wins'; 
        if(mrWhiteWin) status = 'finished_mrwhite_wins'; 
        await roomsCollection.doc(roomId).update({ status, turnEndTime: null, votingEndTime: null, finishedAt: firebase.firestore.FieldValue.serverTimestamp() }); 
    };

    const resetGame = async () => { 
        playSound('click'); 
        await roomsCollection.doc(roomId).update({ 
            status: 'waiting', 
            scenario: null, 
            spyId: null, 
            currentTurnUID: null, 
            currentRound: 0, 
            votes: {}, 
            messages: [], 
            votingEndTime: null, 
            turnEndTime: null, 
            players: room.players.map(p => ({ uid: p.uid, name: p.name, status: 'active', photo: p.photo, role: null })), 
            wordVotes: {}, 
            chosenWord: null, 
            wordSelEndTime: null, 
            votingRequest: null, 
            startedAt: null, 
            finishedAt: null, 
            summaryShown: false 
        }); 
        setShowSummary(false); 
    };

    // ==========================================
    // FRIEND & SOCIAL FUNCTIONS
    // ==========================================
    const openProfile = (uid) => { if(!uid) return; setTargetProfileUID(uid); setShowUserProfile(true); };
    const openChat = (friend) => { setChatFriend(friend); setShowChat(true); const cId = getChatId(user.uid, friend.uid); setOpenChatId(cId); };
    const closeChat = () => { setShowChat(false); setChatFriend(null); setOpenChatId(null); };

    const handleSendRequest = async (targetUid) => { 
        if (!targetUid || targetUid === userData.customId || isGuest) return;
        const friendUid = targetUid; 
        if (userData.friends?.includes(friendUid)) return; 
        if (userData.friendRequests?.includes(friendUid)) return; 
        await usersCollection.doc(friendUid).update({ friendRequests: firebase.firestore.FieldValue.arrayUnion(user.uid) }); 
    };

    const handleSearchRequest = async () => {
        if (!addFriendId || addFriendId === userData.customId || isGuest) return;
        const snap = await usersCollection.where('customId', '==', addFriendId).get(); 
        if (snap.empty) { setFriendSearchMsg(t.friendNotFound); return; } 
        const friendDoc = snap.docs[0]; 
        const friendUid = friendDoc.id; 
        if (userData.friends?.includes(friendUid)) { setFriendSearchMsg("Already friends!"); return; } 
        if (userData.friendRequests?.includes(friendUid)) { setFriendSearchMsg("Request already pending!"); return; } 
        await usersCollection.doc(friendUid).update({ friendRequests: firebase.firestore.FieldValue.arrayUnion(user.uid) }); 
        setFriendSearchMsg(t.requestSent); 
        setAddFriendId(''); 
    };

    const handleAcceptRequest = async (fromUid) => { 
        const batch = db.batch();
        const currentUserRef = usersCollection.doc(user.uid);
        batch.update(currentUserRef, { 
            friends: firebase.firestore.FieldValue.arrayUnion(fromUid), 
            friendRequests: firebase.firestore.FieldValue.arrayRemove(fromUid) 
        });
        const senderRef = usersCollection.doc(fromUid);
        batch.update(senderRef, { friends: firebase.firestore.FieldValue.arrayUnion(user.uid) });
        await batch.commit();
        setNotification(t.newFriend); 
    };

    const handleRejectRequest = async (fromUid) => { 
        await usersCollection.doc(user.uid).update({ friendRequests: firebase.firestore.FieldValue.arrayRemove(fromUid) }); 
    };

    // ==========================================
    // NEW: GIFT SENDING FUNCTION
    // ==========================================
    const handleSendGiftToUser = async (gift, targetUser) => {
        const currency = userData?.currency || 0;
        if (currency < gift.cost) return;
        
        const cashbackAmount = Math.floor(gift.cost * (gift.cashback / 100));
        const newCurrency = currency - gift.cost + cashbackAmount;
        
        // Update sender
        await usersCollection.doc(user.uid).update({
            currency: newCurrency,
            charisma: firebase.firestore.FieldValue.increment(gift.charisma)
        });
        
        // Update receiver
        await usersCollection.doc(targetUser.uid).update({
            charisma: firebase.firestore.FieldValue.increment(gift.charisma)
        });
        
        setNotification(`${t.giftSent} +${formatCharisma(gift.charisma)} ✨`);
    };

    // Computed values
    const isMyTurn = room?.currentTurnUID === user?.uid;
    const me = room?.players?.find(p => p.uid === user?.uid);
    const myRole = me?.role;
    const isSpectator = me?.status === 'spectator' || me?.status === 'ghost';
    const hasVoted = room?.votes?.[user?.uid];
    const hasVotedWord = room?.wordVotes?.[user?.uid];
    const activePlayersCount = room?.players?.filter(p => p.status === 'active').length || 0;
    const voteReq = room?.votingRequest;
    const hasIAgreed = voteReq?.votes?.[user?.uid] === true;
    const hasIDeclined = voteReq?.votes?.[user?.uid] === false;
    const sortedFriends = React.useMemo(() => { 
        if (!friendsData) return []; 
        const sorted = [...friendsData].sort((a, b) => { 
            const chatA = chatsMeta[getChatId(user?.uid, a.uid)]; 
            const chatB = chatsMeta[getChatId(user?.uid, b.uid)]; 
            const timeA = chatA?.timestamp?.toMillis() || 0; 
            const timeB = chatB?.timestamp?.toMillis() || 0; 
            return timeB - timeA; 
        }); 
        return sorted; 
    }, [friendsData, chatsMeta, user?.uid]);
    
    const handleCopy = () => { navigator.clipboard.writeText(roomId); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    // ==========================================
    // RENDER - WILL BE IN PART 7
    // ==========================================
    // The render method is in the next part due to size

const renderApp = () => {
    return ( 
        <div className="min-h-screen flex flex-col items-center p-2 md:p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}> 
            <NotificationToast message={notification} onClose={() => setNotification(null)} />
            <TutorialModal show={showTutorial} onClose={() => { setShowTutorial(false); localStorage.setItem('pro_spy_tutorial_v2', 'true'); }} lang={lang} />
            <MatchSummaryModal show={showSummary} onClose={() => setShowSummary(false)} room={room} players={room?.players} lang={lang} />
            {alertMessage && ( 
                <div className="alert-modal" onClick={() => setAlertMessage(null)}> 
                    <div className="glass-panel rounded-xl p-4 w-full max-w-xs animate-pop text-center border border-pink-500 text-sm" onClick={e => e.stopPropagation()}> 
                        <div className="text-2xl mb-2">🚫</div> 
                        <p className="font-bold mb-2">{alertMessage}</p> 
                        <button onClick={() => setAlertMessage(null)} className="btn-ghost px-4 py-1 rounded border border-white/20 text-xs">{t.ok}</button> 
                    </div> 
                </div> 
            )}
            
            {/* Setup Modal */}
            {showSetupModal && ( 
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-2" onClick={()=>setShowSetupModal(false)}> 
                    <div className="glass-panel rounded-xl p-4 w-full max-w-sm animate-pop" onClick={e => e.stopPropagation()}> 
                        <h2 className="text-lg font-bold text-primary mb-3">{t.create}</h2> 
                        <div className="space-y-3"> 
                            <div> 
                                <label className="text-[10px] text-gray-400 block mb-1">{t.nickname}</label> 
                                <input className={`${isLoggedIn ? 'input-locked' : 'input-dark'} w-full p-2 rounded font-bold text-sm`} value={nickname} onChange={e => { setNickname(e.target.value); localStorage.setItem('pro_spy_nick', e.target.value); }} disabled={isLoggedIn} /> 
                            </div> 
                            <div className="grid grid-cols-2 gap-2"> 
                                <button onClick={() => setSetupMode('normal')} className={`p-2 rounded-lg border-2 text-xs ${setupMode === 'normal' ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10'}`}><div className="font-bold">{t.normalMode}</div><div className="text-[8px] text-gray-400">{t.modeNormalDesc}</div></button> 
                                <button onClick={() => setSetupMode('advanced')} className={`p-2 rounded-lg border-2 text-xs ${setupMode === 'advanced' ? 'border-purple-400 bg-purple-500/10' : 'border-white/10'}`}><div className="font-bold">{t.advancedMode}</div><div className="text-[8px] text-gray-400">{t.modeAdvDesc}</div></button> 
                            </div> 
                            <div className="flex items-center gap-2"> 
                                <input type="checkbox" id="privateCheck" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="w-3 h-3"/> 
                                <label htmlFor="privateCheck" className="text-xs">{t.privateRoom}</label> 
                            </div> 
                            {isPrivate && ( <input className="input-dark w-full p-2 rounded text-xs" placeholder={t.password} value={password} onChange={e => setPassword(e.target.value)} /> )} 
                            <button onClick={handleCreateGame} disabled={loading || !nickname} className="btn-neon w-full py-2 rounded-lg font-bold text-sm">{loading ? t.loading : t.create}</button> 
                        </div> 
                    </div> 
                </div> 
            )}
            
            {/* Modals */}
            <MyAccountPage show={showMyAccount} onClose={() => setShowMyAccount(false)} userData={userData} user={user} lang={lang} onUpdate={async () => { if(user){ const d = await usersCollection.doc(user.uid).get(); setUserData(d.data()); }} } />
            <UserProfileModal show={showUserProfile} onClose={() => setShowUserProfile(false)} targetUID={targetProfileUID} lang={lang} onSendRequest={handleSendRequest} isFriend={userData?.friends?.includes(targetProfileUID)} currentUserData={userData} onSendGift={handleSendGiftToUser} />
            <PrivateChatModal show={showChat} onClose={closeChat} friendData={chatFriend} currentUser={userData} lang={lang} roomId={roomId} onJoinInvite={handleJoinFromInvite} onSendGift={handleSendGiftToUser} />
            <LobbyBrowserModal show={showLobby} onClose={() => setShowLobby(false)} lang={lang} onJoinRoom={(id, pwd) => handleJoinGame(id, pwd)} />
            
            {/* Vote Request Banner */}
            {room?.status === 'discussing' && voteReq && ( 
                <div className="vote-request-banner glass-panel rounded-lg p-3 border border-pink-500 animate-pop"> 
                    <div className="flex flex-col gap-1"> 
                        <div className="text-center font-bold text-pink-400 text-sm">{t.voteRequestTitle}</div> 
                        <div className="text-center text-[10px] text-gray-300"> <span className="font-bold">{room.players.find(p=>p.uid === voteReq.requestedBy)?.name}</span> {t.voteRequestDesc} </div> 
                        <div className="flex justify-center gap-2 mt-1"> 
                            <button onClick={agreeToVote} disabled={hasIAgreed} className={`btn px-4 py-1 rounded text-[10px] font-bold ${hasIAgreed ? 'btn-ghost opacity-50' : 'btn-success'}`}>{t.agree}</button> 
                            <button onClick={declineVote} disabled={hasIDeclined} className={`btn px-4 py-1 rounded text-[10px] font-bold ${hasIDeclined ? 'btn-ghost opacity-50' : 'btn-danger'}`}>{t.decline}</button> 
                        </div> 
                    </div> 
                </div> 
            )}
            
            {/* Header */}
            <header className="w-full max-w-4xl flex justify-between items-center mb-3 animate-fade-in relative z-50 py-1"> 
                <div className="flex items-center gap-2"> 
                    <div className="logo-container"> <div className="logo-border"></div> <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"> <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/> </svg> </div> 
                    <div> <h1 className="game-title text-lg">{t.appName}</h1> <p className="text-[8px] text-gray-500 tracking-widest font-tech hidden md:block">{t.tagline}</p> </div> 
                </div> 
                <nav className="hidden md:flex gap-1 glass-panel rounded-full p-1 items-center text-xs"> <button onClick={() => setActiveView('lobby')} className={`nav-tab rounded-full ${activeView === 'lobby' ? 'active' : ''}`}>{t.tabLobby}</button> <button onClick={() => setActiveView('leaderboard')} className={`nav-tab rounded-full ${activeView === 'leaderboard' ? 'active' : ''}`}>{t.tabLeaderboard}</button> <button onClick={() => setActiveView('friends')} className={`nav-tab rounded-full relative ${activeView === 'friends' ? 'active' : ''}`}> {t.tabFriends} {totalUnread > 0 && <span className="notification-badge text-[8px]">{totalUnread}</span>} </button> </nav> 
                <div className="flex gap-1 items-center">
                    <a href="https://guessmycard.mooo.info/" target="_blank" rel="noopener noreferrer" className="btn-ghost px-2 py-1 rounded text-[10px] font-bold border-gray-700 hover:text-pink-400 hover:border-pink-400 hidden sm:block">{t.linkGuessCard}</a>
                    <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="btn-ghost px-2 py-1 rounded text-[10px] font-bold border-gray-700">{t.langBtn}</button>
                    <div className="relative"> {isLoggedIn ? ( <> <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-1 btn-ghost px-2 py-1 rounded-full border-gray-700"> <img src={userData?.photoURL || `https://ui-avatars.com/api/?name=${userData?.displayName}`} className="w-5 h-5 rounded-full" alt=""/> <span className="text-[10px] font-bold hidden lg:block">{t.myAccount}</span> </button> {showDropdown && ( <div className="dropdown-menu glass-panel rounded-lg py-1 animate-fade-in text-xs"> <button onClick={() => { setShowMyAccount(true); setShowDropdown(false); }} className="w-full text-right px-3 py-1 hover:bg-white/10">{t.profile}</button> <button onClick={handleLogout} className="w-full text-right px-3 py-1 text-red-400 hover:bg-white/10">{t.logout}</button> </div> )} </> ) : ( <button onClick={handleGoogleLogin} className="btn-google px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"> <svg className="w-3 h-3" viewBox="0 0 21 20" fill="none"><path d="M20.3087 10.2242C20.3087 9.46273 20.2446 8.74991 20.1273 8.08594H10.5V11.9392H15.9715C15.7353 13.1916 15.0216 14.2518 13.9444 14.9582V17.4635H17.2543C19.1883 15.7262 20.3087 13.1977 20.3087 10.2242Z" fill="#4285F4"/><path d="M10.5 19.875C13.1617 19.875 15.3983 18.9749 17.2545 17.4636L13.9446 14.9582C12.9389 15.6222 11.7015 16.0092 10.5 16.0092C7.93332 16.0092 5.72548 14.2615 4.93682 11.9136H1.51758V14.4934C3.3629 18.0879 7.13889 19.875 10.5 19.875Z" fill="#34A853"/><path d="M4.93672 11.9136C4.73672 11.2496 4.62266 10.5469 4.62266 9.82357C4.62266 9.10026 4.73672 8.39751 4.93672 7.73354V5.15375H1.51748C0.774766 6.61518 0.351562 8.20361 0.351562 9.82357C0.351562 11.4435 0.774766 13.0319 1.51748 14.4934L4.93672 11.9136Z" fill="#FBBC05"/><path d="M10.5 3.63864C11.8379 3.63864 13.0392 4.09256 13.9864 4.98477L17.3199 1.65131C15.3941 -0.131629 13.1575 -0.124985 10.5 -0.124985C7.13889 -0.124985 3.3629 1.66216 1.51758 5.25668L4.93682 7.83647C5.72548 5.48861 7.93332 3.63864 10.5 3.63864Z" fill="#EA4335"/></svg> {t.loginGoogle} </button> )} </div> </div> 
            </header>
            
            {/* Mobile Nav */}
            <nav className="md:hidden w-full max-w-4xl flex justify-around glass-panel rounded-lg p-1 mb-2 text-[10px]"> <button onClick={() => setActiveView('lobby')} className={`nav-tab flex-1 text-center ${activeView === 'lobby' ? 'active' : ''}`}>{t.tabLobby}</button> <button onClick={() => setActiveView('leaderboard')} className={`nav-tab flex-1 text-center ${activeView === 'leaderboard' ? 'active' : ''}`}>{t.tabLeaderboard}</button> <button onClick={() => setActiveView('friends')} className={`nav-tab flex-1 text-center relative ${activeView === 'friends' ? 'active' : ''}`}> {t.tabFriends} {totalUnread > 0 && <span className="notification-badge text-[8px]">{totalUnread}</span>} </button> </nav>
            
            {/* Main Content */}
            <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-2">
                {/* Leaderboard View */}
                {activeView === 'leaderboard' && ( 
                    <div className="md:col-span-3 glass-panel rounded-xl p-3 animate-fade-in overflow-x-auto"> 
                        <h2 className="text-base font-bold mb-2 text-primary">{t.tabLeaderboard}</h2> 
                        <div className="min-w-[400px]"> 
                            <div className="leaderboard-row border-b border-white/20 font-bold text-[10px] text-gray-400"> 
                                <div className="w-10">#</div> 
                                <div className="flex-1">{t.nickname}</div> 
                                <div className="w-10 text-center">{t.level}</div> 
                                <div className="w-12 text-center">{t.wins}</div> 
                                <div className="w-12 text-center">{t.losses}</div>
                                <div className="w-16 text-center">{t.charisma}</div>
                            </div> 
                            {leaderboardData.map((p, i) => ( 
                                <div key={p.uid} onClick={() => openProfile(p.uid)} className={`leaderboard-row cursor-pointer text-xs ${p.uid === user?.uid ? 'bg-cyan-500/10' : ''}`}> 
                                    <div className="w-10 font-bold"># {i + 1}</div> 
                                    <div className="flex-1 flex items-center gap-1"> 
                                        <img src={p.photoURL} className="w-4 h-4 rounded-full"/> 
                                        <span>{p.displayName}</span> 
                                        {p.uid === user?.uid && <span className="text-[6px] bg-blue-500 px-1 rounded">{t.you}</span>} 
                                    </div> 
                                    <div className="w-10 text-center">{calculateLevel(p.stats?.xp)}</div> 
                                    <div className="w-12 text-center text-green-400">{p.stats?.wins || 0}</div> 
                                    <div className="w-12 text-center text-red-400">{p.stats?.losses || 0}</div>
                                    <div className="w-16 text-center text-yellow-400">✨ {formatCharisma(p.charisma || 0)}</div>
                                </div> 
                            ))} 
                        </div> 
                    </div> 
                )}
                
                {/* Friends View */}
                {activeView === 'friends' && ( 
                    <div className="md:col-span-3 glass-panel rounded-xl p-3 animate-fade-in space-y-3"> 
                        <h2 className="text-base font-bold text-primary">{t.tabFriends}</h2> 
                        {isGuest ? (<div className="text-center py-6"><p className="text-gray-400 text-xs">{t.noPermission}</p></div>) : ( <> 
                            <div className="flex gap-1"> 
                                <input className="input-dark flex-1 p-1 rounded text-xs" placeholder={t.friendIdPlaceholder} value={addFriendId} onChange={e => setAddFriendId(e.target.value)} /> 
                                <button onClick={handleSearchRequest} className="btn-neon px-2 rounded text-[10px]">{t.addFriend}</button> 
                            </div> 
                            {friendSearchMsg && <div className="text-[10px] text-center text-cyan-400">{friendSearchMsg}</div>} 
                            {friendRequests.length > 0 && ( 
                                <div className="border-t border-white/10 pt-2"> 
                                    <h3 className="text-[10px] font-bold text-gray-400 mb-1">{t.incomingRequests}</h3> 
                                    <div className="space-y-1"> 
                                        {friendRequests.map(f => ( 
                                            <div key={f.uid} className="flex items-center justify-between p-1 bg-white/5 rounded text-[10px]"> 
                                                <div className="flex items-center gap-1"> 
                                                    <img src={f.photoURL} className="w-5 h-5 rounded-full"/> 
                                                    <span>{f.displayName}</span> 
                                                </div> 
                                                <div className="flex gap-1"> 
                                                    <button onClick={() => handleAcceptRequest(f.uid)} className="btn-success px-2 py-0.5 rounded text-[9px]">{t.accept}</button> 
                                                    <button onClick={() => handleRejectRequest(f.uid)} className="btn-danger px-2 py-0.5 rounded text-[9px]">{t.reject}</button> 
                                                </div> 
                                            </div> 
                                        ))} 
                                    </div> 
                                </div> 
                            )} 
                            <div className="border-t border-white/10 pt-2"> 
                                <h3 className="text-[10px] font-bold text-gray-400 mb-1">{t.tabFriends}</h3> 
                                <div className="space-y-1"> 
                                    {sortedFriends.length === 0 && <p className="text-center text-gray-500 text-[10px] py-2">{t.noFriends}</p>} 
                                    {sortedFriends.map(f => { 
                                        const isOnline = f.lastActive && (Date.now() - f.lastActive.toMillis() < 120000); 
                                        const chatId = getChatId(user?.uid, f.uid); 
                                        const meta = chatsMeta[chatId]; 
                                        const unread = meta?.unread?.[user?.uid] || 0; 
                                        const lastMsg = meta?.lastMessage; 
                                        return ( 
                                            <div key={f.uid} className="player-card flex items-center justify-between p-1"> 
                                                <div className="flex items-center gap-1 cursor-pointer relative flex-1 min-w-0" onClick={() => openProfile(f.uid)}> 
                                                    <div className="relative flex-shrink-0"> 
                                                        <img src={f.photoURL} className="w-6 h-6 rounded-full"/> 
                                                        {unread > 0 && <span className="friend-unread-badge text-[8px]">{unread}</span>} 
                                                    </div> 
                                                    <div className="truncate"> 
                                                        <div className="font-bold text-[10px] truncate">{f.displayName}</div> 
                                                        <div className="text-[8px] text-gray-400 truncate">{lastMsg ? (lastMsg.length > 15 ? lastMsg.substring(0,15)+'...' : lastMsg) : `Lvl ${calculateLevel(f.stats?.xp)}`}</div> 
                                                    </div> 
                                                </div> 
                                                <div className="flex items-center gap-1 flex-shrink-0 ml-1"> 
                                                    <span className={`${isOnline ? 'status-online' : 'status-offline'}`}></span> 
                                                    <button onClick={() => openChat(f)} className="btn-ghost px-2 py-0.5 rounded text-[8px] border-blue-500 text-blue-400">Chat</button> 
                                                </div> 
                                            </div> 
                                        ); 
                                    })} 
                                </div> 
                            </div> 
                        </> )} 
                    </div> 
                )}
                
                {/* Lobby View */}
                {activeView === 'lobby' && ( <> 
                    {room && ( 
                        <div className="md:col-span-3 flex justify-end mb-1"> 
                            <button onClick={() => setActiveView('friends')} className="btn-ghost px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 relative"> 
                                <span>👥</span> {t.inviteFriends} {totalUnread > 0 && <span className="notification-badge text-[8px]">{totalUnread}</span>} 
                            </button> 
                        </div> 
                    )} 
                    
                    {/* Players Panel */}
                    {room && ( 
                        <div className="glass-panel rounded-xl p-2 space-y-1 animate-fade-in delay-1"> 
                            <h3 className="text-[10px] font-bold text-gray-400 mb-1 border-b border-gray-800 pb-1 uppercase tracking-wider flex justify-between items-center"> 
                                <span>{t.players}</span> 
                                <span className="text-[8px] bg-white/5 px-1 rounded text-cyan-400">{t.roundsFormat(room.currentRound || 1, MAX_ROUNDS)}</span> 
                            </h3> 
                            <div className="space-y-1"> 
                                {room.players.map((p, i) => { 
                                    const isMe = p.uid === user?.uid; 
                                    const roleIcon = isMe ? (p.role === 'mrwhite' ? '⚪' : p.role === 'informant' ? '🛈' : p.role === 'spy' ? '🕵️' : '') : ''; 
                                    const equippedFrame = p.equipped?.frames ? SHOP_ITEMS.frames.find(f=>f.id===p.equipped.frames) : null; 
                                    const isFrameUrl = equippedFrame?.preview?.startsWith('http'); 
                                    const pSize = 32;
                                    return ( 
                                        <div key={i} onClick={() => openProfile(p.uid)} className={`player-card relative p-1 rounded flex items-center justify-between text-[10px] ${p.status === 'ghost' ? 'ghost' : p.status === 'spectator' ? 'eliminated' : ''}`}> 
                                            <div className="flex items-center gap-1 flex-1 min-w-0"> 
                                                <div className="relative flex-shrink-0" style={{ width: pSize, height: pSize }}> 
                                                    {/* Frame */}
                                                    {isFrameUrl && equippedFrame && (
                                                        <img src={equippedFrame.preview} className="absolute pointer-events-none z-20 rounded-full" style={{ width: pSize * 1.18, height: pSize * 1.18, top: -pSize * 0.09, left: -pSize * 0.09 }} alt=""/>
                                                    )}
                                                    {!isFrameUrl && equippedFrame && (
                                                        <div className="absolute rounded-full" style={{ width: pSize * 1.18, height: pSize * 1.18, top: -pSize * 0.09, left: -pSize * 0.09, background: equippedFrame.preview, padding: 2 }}>
                                                            <div className="w-full h-full rounded-full bg-gray-900"></div>
                                                        </div>
                                                    )}
                                                    <img src={p.photo || `https://ui-avatars.com/api/?name=${p.name}`} className="w-full h-full rounded-full object-cover relative z-10" alt=""/> 
                                                </div> 
                                                <span className="font-bold truncate">{p.name}</span> 
                                                <span className="text-[8px]">{roleIcon}</span> 
                                                {p.uid === user?.uid && <span className="text-[6px] bg-blue-500 px-0.5 rounded">{t.you}</span>} 
                                            </div> 
                                            {p.uid === room.currentTurnUID && room.status === 'discussing' && ( 
                                                <div className="flex items-center gap-0.5 ml-1"> 
                                                    <div className="timer-bar-container w-8"><div className="timer-bar-fill" style={{width: `${(turnTimer/30)*100}%`}}></div></div> 
                                                    <span className="text-[8px] font-mono text-cyan-400 w-4">{turnTimer}</span> 
                                                </div> 
                                            )} 
                                        </div> 
                                    )})} 
                            </div> 
                            {!isSpectator && room.status === 'discussing' && <button onClick={requestVoting} className="btn-vote w-full py-1 rounded font-bold text-[10px] mt-1 uppercase">{t.startVoting}</button>} 
                        </div> 
                    )} 
                    
                    <div className={`${room ? 'md:col-span-2' : 'md:col-span-3'} space-y-2`}>
                        {/* No Room - Create/Join */}
                        {!room && ( 
                            <div className="glass-panel rounded-xl p-4 text-center space-y-3 animate-fade-in mx-auto max-w-xs w-full"> 
                                <div className="space-y-1"> 
                                    <label className="text-[10px] text-gray-400 uppercase">{t.nickname}</label> 
                                    <input className={`${isLoggedIn ? 'input-locked' : 'input-dark'} w-full p-2 rounded text-center font-bold text-xs`} value={nickname} onChange={e => { setNickname(e.target.value); localStorage.setItem('pro_spy_nick', e.target.value); }} disabled={isLoggedIn} /> 
                                </div> 
                                <button onClick={() => setShowSetupModal(true)} disabled={loading || !nickname} className="btn-neon w-full py-2 rounded font-bold text-xs">{loading ? t.loading : t.create}</button> 
                                <div className="flex flex-col gap-1"> 
                                    <div className="flex gap-1"> 
                                        <input className="input-dark flex-1 p-2 rounded text-center font-mono text-xs" placeholder={t.codePlaceholder} value={inputCode} onChange={e => setInputCode(e.target.value)} /> 
                                        <button onClick={() => handleJoinGame(inputCode, null)} disabled={loading || !nickname} className="btn-ghost px-3 rounded font-bold text-xs">{t.join}</button> 
                                    </div> 
                                    <button onClick={() => setShowLobby(true)} className="btn-gold w-full py-1 rounded text-[10px] font-bold">{t.browse}</button> 
                                    {joinError && <div className="error-msg text-[10px]">{joinError}</div>} 
                                </div> 
                            </div> 
                        )} 
                        
                        {/* Room Info */}
                        {room && ( <> 
                            <div className="glass-panel rounded-lg p-2 space-y-1"> 
                                <div className="flex justify-between items-center text-[10px]"> 
                                    <div className="flex items-center gap-1"> 
                                        <span className="font-mono font-bold text-base tracking-widest text-cyan-400">{roomId}</span> 
                                        <button onClick={handleCopy} className={`btn-ghost p-0.5 rounded ${copied ? 'text-green-400' : 'text-gray-400'}`}> {copied ? '✓' : '📋'} </button> 
                                    </div> 
                                    <div className="flex items-center gap-1"> 
                                        <span className="font-bold bg-white/10 px-1 rounded text-cyan-400"> {activePlayersCount}/10 </span> 
                                        <span className={`px-1 rounded ${room.mode === 'advanced' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>{room.mode === 'advanced' ? t.advancedMode : t.normalMode}</span> 
                                    </div> 
                                </div> 
                                <div className="flex justify-between items-center border-t border-white/10 pt-1 flex-wrap-gap"> 
                                    <div className="flex items-center gap-1"> 
                                        <span className="font-bold bg-white/10 px-1 rounded text-cyan-400"> {room.status === 'word_selection' ? 'KEY' : room.status === 'discussing' ? 'TALK' : room.status.substring(0,4).toUpperCase()} </span> 
                                        {room.isPrivate && ( 
                                            <div className="flex items-center gap-0.5 bg-yellow-500/20 text-yellow-300 px-1 rounded text-[8px]"> 
                                                <span>🔒</span> 
                                                {room.admin === user?.uid && ( <button onClick={() => setShowPwd(!showPwd)} className="hover:text-white">{showPwd ? '👁️' : '👁️‍🗨️'}</button> )} 
                                                {room.admin === user?.uid && showPwd && ( <span className="font-mono">{room.password}</span> )} 
                                            </div> 
                                        )} 
                                    </div> 
                                    <div className="flex gap-1"> 
                                        {room.admin === user?.uid ? ( 
                                            <button onClick={() => handleLeaveRoom()} className="btn-danger px-1 py-0.5 rounded text-[8px]">{t.closeRoom}</button> 
                                        ) : ( 
                                            <button onClick={() => handleLeaveRoom()} className="btn-ghost px-1 py-0.5 rounded text-[8px]">{t.leaveRoom}</button> 
                                        )} 
                                    </div> 
                                </div> 
                            </div> 
                            
                            {/* Waiting Status */}
                            {room.status === 'waiting' && ( 
                                <div className="glass-panel rounded-xl p-3 text-center animate-fade-in"> 
                                    <div className="animate-pulse text-gray-400 text-[10px] mb-2">{t.waiting}</div> 
                                    {room.admin === user?.uid && (<button onClick={startGame} className="btn-neon w-full py-2 rounded font-bold text-xs">{t.start}</button>)} 
                                </div> 
                            )} 
                            
                            {/* Game Finished */}
                            {(room.status === 'finished_spy_caught' || room.status === 'finished_spy_wins' || room.status === 'finished_mrwhite_wins') && ( 
                                <div className="glass-panel rounded-xl p-4 text-center animate-fade-in border border-purple-500"> 
                                    <h2 className="text-xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"> {room.status === 'finished_mrwhite_wins' ? t.mrWhiteWin : (room.status === 'finished_spy_caught' ? t.agentsWin : t.spyWin)} </h2> 
                                    <p className="text-gray-400 mb-2 text-[10px]">Spy: <span className="text-white font-bold">{room.players.find(p => p.role === 'spy')?.name}</span></p> 
                                    {room.admin === user?.uid && (<button onClick={resetGame} className="btn-ghost border-white/20 text-white w-full py-1 rounded text-xs">{t.playAgain}</button>)} 
                                </div> 
                            )} 
                            
                            {/* Word Selection Phase */}
                            {room.status === 'word_selection' && ( 
                                <div className="space-y-2 animate-fade-in"> 
                                    <div className="glass-panel rounded-xl p-2 text-center relative overflow-hidden border border-cyan-500/30"> 
                                        <div className="absolute top-1 right-1 w-8 h-8"> 
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36"> 
                                                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3"></circle> 
                                                <circle cx="18" cy="18" r="16" fill="none" stroke="#00f2ff" strokeWidth="3" strokeDasharray={`${(wordSelTimer/30)*100} ${100-((wordSelTimer/30)*100)}`} strokeLinecap="round"></circle> 
                                            </svg> 
                                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-cyan-400">{wordSelTimer}</div> 
                                        </div> 
                                        <h3 className="text-sm font-black mb-1 uppercase text-cyan-400">{t.wordSelectionTitle}</h3> 
                                        <p className="text-[8px] text-gray-500 mb-2">{t.wordSelectionDesc}</p> 
                                        <div className="grid grid-cols-2 gap-1"> 
                                            {(() => { 
                                                const wordsToDisplay = myRole === 'spy' || myRole === 'mrwhite' ? ['?', '?', '?', '?'] : (lang === 'ar' ? room.scenario?.words_ar : room.scenario?.words_en); 
                                                return wordsToDisplay?.map((word, i) => { 
                                                    const voters = Object.entries(room.wordVotes || {}).filter(([uid, w]) => w === word).map(([uid]) => room.players.find(p => p.uid === uid)?.name); 
                                                    return ( 
                                                        <button key={i} onClick={() => submitWordVote(word)} disabled={myRole === 'spy' || myRole === 'mrwhite'} className={`word-vote-card p-2 rounded font-bold text-xs transition-all ${hasVotedWord === word ? 'selected' : 'bg-white/5 border border-white/10'} ${(myRole === 'spy' || myRole === 'mrwhite') ? 'opacity-50 cursor-not-allowed' : ''}`}> 
                                                            {word} 
                                                            {voters.length > 0 && (<div className="flex justify-center gap-0.5 mt-0.5 flex-wrap">{voters.map(v => <span key={v} className="voter-name relative text-[8px]">{v}</span>)}</div>)} 
                                                        </button> 
                                                    ); 
                                                }); 
                                            })()} 
                                        </div> 
                                        {room.admin === user?.uid && myRole !== 'spy' && myRole !== 'mrwhite' && (<button onClick={() => finishWordSelection(false)} className="btn-neon w-full py-1 rounded font-bold text-[10px] mt-2">{t.finishSelection}</button>)} 
                                    </div> 
                                    
                                    {/* Identity Square */}
                                    <div className={`identity-square glass-panel ${myRole === 'spy' ? 'identity-spy' : myRole === 'informant' ? 'identity-informant' : myRole === 'mrwhite' ? 'identity-mrwhite' : 'identity-agent'}`}> 
                                        <div className="relative z-10 p-2 flex flex-col items-center justify-center h-full"> 
                                            <span className={`text-[8px] font-bold uppercase tracking-widest mb-1 px-2 py-0.5 rounded-full ${ myRole === 'spy' ? 'bg-red-500/20 text-red-400' : myRole === 'informant' ? 'bg-blue-500/20 text-blue-400' : myRole === 'mrwhite' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400' }`}> {t[`status${myRole?.charAt(0).toUpperCase() + myRole?.slice(1) || 'Agent'}`]} </span> 
                                            {myRole === 'spy' && (<><div className="text-3xl mb-1">🕵️</div><h3 className="text-xl font-black tracking-wider text-red-500">???</h3></> )} 
                                            {myRole === 'mrwhite' && (<><div className="text-3xl mb-1">⚪</div><p className="text-[8px] text-gray-300">{t.mrWhiteInstruction}</p></>)} 
                                            {myRole === 'informant' && ( <> <div className="text-sm font-bold mt-1">{lang === 'ar' ? room.scenario?.loc_ar : room.scenario?.loc_en}</div> <p className="text-[8px] text-blue-300 mt-1">{t.informantInstruction}</p> </> )} 
                                            {myRole === 'agent' && (<><div className="text-lg font-black mt-1 text-center px-1">{lang === 'ar' ? room.scenario?.loc_ar : room.scenario?.loc_en}</div><p className="text-[8px] text-gray-400 mt-1">{t.location}</p></>)} 
                                        </div> 
                                    </div> 
                                    
                                    {myRole === 'mrwhite' && ( 
                                        <div className="mt-1"> 
                                            <button onClick={() => { const guess = prompt("Guess the location:"); if(guess) handleMrWhiteGuess(guess); }} className="btn-gold w-full py-1 rounded font-bold text-[10px]">{t.guessLocation}</button> 
                                        </div> 
                                    )} 
                                </div> 
                            )} 
                            
                            {/* Discussion Phase */}
                            {room.status === 'discussing' && ( 
                                <div className="space-y-2 animate-fade-in"> 
                                    {room.chosenWord && myRole !== 'spy' && myRole !== 'mrwhite' && ( 
                                        <div className="glass-panel rounded-lg p-1 text-center border border-cyan-500/50 text-[10px]"><span className="text-cyan-400 font-bold uppercase">{t.selectedWord}:</span><span className="ml-1 text-white">{room.chosenWord}</span></div> 
                                    )} 
                                    
                                    <div className={`identity-square glass-panel ${myRole === 'spy' ? 'identity-spy' : myRole === 'informant' ? 'identity-informant' : myRole === 'mrwhite' ? 'identity-mrwhite' : 'identity-agent'}`}> 
                                        <div className="relative z-10 p-2 flex flex-col items-center justify-center h-full"> 
                                            <span className={`text-[8px] font-bold uppercase tracking-widest mb-1 px-2 py-0.5 rounded-full ${ myRole === 'spy' ? 'bg-red-500/20 text-red-400' : myRole === 'informant' ? 'bg-blue-500/20 text-blue-400' : myRole === 'mrwhite' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400' }`}> {t[`status${myRole?.charAt(0).toUpperCase() + myRole?.slice(1) || 'Agent'}`]} </span> 
                                            {myRole === 'spy' ? ( <><div className="text-3xl mb-1">🕵️</div><h3 className="text-xl font-black tracking-wider text-red-500">???</h3></> ) : ( <><div className="text-lg font-black mt-1 text-center px-1">{lang === 'ar' ? room.scenario?.loc_ar : room.scenario?.loc_en}</div><p className="text-[8px] text-gray-400 mt-1">{t.location}</p></> )} 
                                        </div> 
                                    </div> 
                                    
                                    {myRole === 'mrwhite' && ( 
                                        <button onClick={() => { const guess = prompt("Guess the location:"); if(guess) handleMrWhiteGuess(guess); }} className="btn-gold w-full py-1 rounded font-bold text-[10px]">{t.guessLocation}</button> 
                                    )} 
                                    
                                    {/* Chat */}
                                    <div className="glass-panel rounded-xl p-2 flex flex-col overflow-hidden relative"> 
                                        <div className="flex-1 overflow-y-auto p-1 space-y-1 h-32 relative z-10"> 
                                            {room.messages?.slice(-15).map((m, i) => ( 
                                                <GameChatMessage key={i} msg={m} currentUser={user} players={room.players} onAvatarClick={openProfile} /> 
                                            ))} 
                                        </div> 
                                        {!isSpectator && isMyTurn ? ( 
                                            <div className="flex flex-col gap-1 mt-auto border-t border-white/10 pt-1 relative z-10"> 
                                                <div className="flex gap-0.5 mb-0.5">{EMOJI_LIST.slice(0, 6).map(emoji => (<span key={emoji} onClick={() => sendMessage(emoji)} className="emoji-btn text-base">{emoji}</span>))}</div> 
                                                <form onSubmit={(e) => { e.preventDefault(); sendMessage(chatMsg); }} className="flex gap-1"> 
                                                    <input className="input-dark flex-1 p-1 rounded text-[10px]" placeholder={t.chatPlaceholder} value={chatMsg} onChange={e => setChatMsg(e.target.value)} /> 
                                                    <button type="submit" className="btn-neon px-2 rounded text-[8px]">{t.send}</button> 
                                                    <button type="button" onClick={() => handleSkipTurn(false)} className="btn-ghost px-2 rounded text-[8px] border-orange-500 text-orange-400">{t.skip}</button> 
                                                </form> 
                                            </div> 
                                        ) : (<div className="text-center text-[8px] text-gray-600 py-1 border-t border-white/10 mt-1">{isSpectator ? (me?.status === 'ghost' ? t.ghostInstruction : t.spectator) : "..."}</div>)} 
                                    </div> 
                                </div> 
                            )} 
                            
                            {/* Voting Phase */}
                            {room.status === 'voting' && ( 
                                <div className="glass-panel rounded-xl p-3 animate-fade-in space-y-2"> 
                                    <div className="flex justify-between items-center"> 
                                        <h3 className="text-sm font-bold text-yellow-400">{t.vote}</h3> 
                                        <div className="relative w-8 h-8"> 
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36"> 
                                                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3"></circle> 
                                                <circle cx="18" cy="18" r="16" fill="none" stroke="#ff0055" strokeWidth="3" strokeDasharray={`${(votingTimer/30)*100} ${100-((votingTimer/30)*100)}`} strokeLinecap="round"></circle> 
                                            </svg> 
                                            <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-yellow-400">{votingTimer}</div> 
                                        </div> 
                                    </div> 
                                    <div className="bg-black/20 p-1 rounded text-[8px] space-y-0.5 mb-1 border border-white/5"> 
                                        <span className="text-gray-500 font-bold">{t.votesTitle}</span> 
                                        <div className="flex flex-wrap gap-0.5 mt-0.5"> 
                                            {Object.entries(room.votes || {}).map(([uid, target]) => { 
                                                const voter = room.players.find(p => p.uid === uid); 
                                                const targetName = room.players.find(p => p.uid === target)?.name; 
                                                return (<span key={uid} className="bg-white/5 px-1 py-0.5 rounded text-[8px]">{voter?.name}: <span className="text-cyan-400">{targetName}</span></span>); 
                                            })} 
                                        </div> 
                                    </div> 
                                    {!hasVoted ? ( 
                                        <div className="grid grid-cols-2 gap-1"> 
                                            {room.players.filter(p => p.status === 'active').map(p => ( 
                                                <button key={p.uid} onClick={() => submitVote(p.uid)} className="p-2 rounded border text-[10px] font-bold transition-all bg-white/5 border-white/10 hover:border-pink-400 hover:bg-pink-500/10">{p.name}</button> 
                                            ))} 
                                        </div> 
                                    ) : (<div className="text-center space-y-2 py-2"><div className="text-green-400 font-bold text-xs">{t.confirm}</div></div>)} 
                                    {room.admin === user?.uid && (<button onClick={endVotingNow} className="btn-danger w-full py-1 rounded font-bold text-[8px] uppercase mt-1">{t.endVoting}</button>)} 
                                </div> 
                            )} 
                        </> )} 
                    </div> 
                </> )} 
            </main>
        </div>
    );
};

// This line goes at the end of App function
return renderApp();


