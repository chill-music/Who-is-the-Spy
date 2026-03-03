// ==========================================
// PRO SPY - COMPLETE SCRIPT PART 1 - FIXED
// Constants, Translations, Components
// ==========================================

const { useState, useEffect, useRef } = React;

// --- Firebase Configuration ---
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

// --- Constants ---
const CURRENCY_NAME = "Intel";
const CURRENCY_ICON = "🧠";
const MAX_ROUNDS = 3;

// --- Shop Items (Frames, Titles, Themes, Gifts) ---
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
    gifts: [
        { id: 'gift_rose', name_en: "Rose", name_ar: "وردة", cost: 1, type: 'gifts', charisma: 10, cashback: 1, desc_ar: "عبّر عن مشاعرك بوردة رقيقة", desc_en: "Express your feelings with a delicate rose", emoji: "🌹" },
        { id: 'gift_icecream', name_en: "Ice Cream", name_ar: "آيس كريم", cost: 5, type: 'gifts', charisma: 55, cashback: 1.5, desc_ar: "برّد على قلب أصدقائك", desc_en: "Cool down your friends' hearts", emoji: "🍦" },
        { id: 'gift_heart', name_en: "Heart", name_ar: "قلب", cost: 10, type: 'gifts', charisma: 120, cashback: 2, desc_ar: "نبض الحب في هدية واحدة", desc_en: "The pulse of love in one gift", emoji: "❤️" },
        { id: 'gift_pizza', name_en: "Pizza", name_ar: "بيتزا", cost: 20, type: 'gifts', charisma: 250, cashback: 2.5, desc_ar: "وليمة لأغلى الناس", desc_en: "A feast for the dearest people", emoji: "🍕" },
        { id: 'gift_ring', name_en: "Ring", name_ar: "خاتم", cost: 100, type: 'gifts', charisma: 1200, cashback: 3, desc_ar: "خاتم الأناقة والتميز", desc_en: "Ring of elegance and distinction", emoji: "💍" },
        { id: 'gift_motorbike', name_en: "Motorbike", name_ar: "موتوسيكل", cost: 250, type: 'gifts', charisma: 3200, cashback: 3.5, desc_ar: "سرعة وكاريزما لا تُقاوم", desc_en: "Irresistible speed and charisma", emoji: "🏍️" },
        { id: 'gift_racecar', name_en: "Race Car", name_ar: "سيارة سباق", cost: 500, type: 'gifts', charisma: 7000, cashback: 4, desc_ar: "انطلق كالمحترفين في الساحة", desc_en: "Race like a pro in the arena", emoji: "🏎️" },
        { id: 'gift_yacht', name_en: "Yacht", name_ar: "يخت", cost: 1000, type: 'gifts', charisma: 15000, cashback: 5, desc_ar: "فخامة الملوك فوق الأمواج", desc_en: "Royal luxury over the waves", emoji: "🛥️" },
        { id: 'gift_jet', name_en: "Private Jet", name_ar: "طائرة خاصة", cost: 5000, type: 'gifts', charisma: 85000, cashback: 7, desc_ar: "حلّق في سماء الكاريزما", desc_en: "Soar in the skies of charisma", emoji: "✈️" },
        { id: 'gift_island', name_en: "Private Island", name_ar: "جزيرة خاصة", cost: 10000, type: 'gifts', charisma: 180000, cashback: 10, desc_ar: "أمتلك عالمك الخاص والفريد", desc_en: "Own your own unique world", emoji: "🏝️" },
    ]
};

// --- Achievements ---
const ACHIEVEMENTS = [ 
    { id: 'first_win', name_en: "First Blood", name_ar: "أول دم", icon: "🩸", desc_en: "Win your first game.", desc_ar: "افوز اول لعبة لك.", hidden: false }, 
    { id: 'wins_5', name_en: "Rookie Spy", name_ar: "جاسوس مبتدئ", icon: "🔰", desc_en: "Win 5 games.", desc_ar: "افوز 5 مرات.", hidden: false },
    { id: 'wins_10', name_en: "Field Agent", name_ar: "عميل ميداني", icon: "🔫", desc_en: "Win 10 games.", desc_ar: "افوز 10 مرات.", hidden: false }, 
    { id: 'wins_20', name_en: "Master of Disguise", name_ar: "سيد التنكر", icon: "🎭", desc_en: "Win 20 games.", desc_ar: "افوز 20 مرة.", hidden: false }, 
    { id: 'wins_50', name_en: "Shadow Legend", name_ar: "أسطورة الظل", icon: "👁️", desc_en: "Win 50 games.", desc_ar: "افوز 50 مرة.", hidden: false }, 
    { id: 'wins_100', name_en: "Immortal", name_ar: "خالد", icon: "👑", special: true, desc_en: "Win 100 games.", desc_ar: "افوز 100 مرة.", hidden: false },
    { id: 'charisma_1000', name_en: "Charming", name_ar: "ساحر", icon: "✨", desc_en: "Reach 1000 Charisma.", desc_ar: "الوصول لـ 1000 كاريزما.", hidden: false },
    { id: 'charisma_10000', name_en: "Celebrity", name_ar: "مشهور", icon: "🌟", desc_en: "Reach 10000 Charisma.", desc_ar: "الوصول لـ 10000 كاريزما.", hidden: false },
    { id: 'charisma_100000', name_en: "Icon", name_ar: "أيقونة", icon: "💎", desc_en: "Reach 100000 Charisma.", desc_ar: "الوصول لـ 100000 كاريزما.", hidden: false },
];

// --- Scenarios ---
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

// --- Helper Functions ---
const generateUID = () => Math.floor(100000 + Math.random() * 900000).toString();
const calculateLevel = (xp) => Math.floor(xp / 100) + 1;
const calculateXPProgress = (xp) => (xp % 100);
const getChatId = (id1, id2) => [id1, id2].sort().join('_');
const formatTime = (timestamp) => { if (!timestamp) return ''; const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp); return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
const formatDate = (timestamp) => { if (!timestamp) return 'N/A'; const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp); return date.toLocaleDateString() + ' ' + date.toLocaleTimeString(); };
const formatCharisma = (num) => { if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'; if (num >= 1000) return (num / 1000).toFixed(1) + 'K'; return num.toString(); };

// --- Audio ---
const AudioCtx = window.AudioContext || window.webkitAudioContext; 
let audioCtx = null;
const initAudio = () => { if (!audioCtx) audioCtx = new AudioCtx(); };
const playSound = (type) => { 
    if (!audioCtx) return; 
    if (audioCtx.state === 'suspended') audioCtx.resume(); 
    const osc = audioCtx.createOscillator(); 
    const gainNode = audioCtx.createGain(); 
    osc.connect(gainNode); 
    gainNode.connect(audioCtx.destination); 
    if (type === 'click') { 
        osc.frequency.value = 800; 
        osc.type = 'sine'; 
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); 
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1); 
        osc.start(); 
        osc.stop(audioCtx.currentTime + 0.1); 
    } else if (type === 'success') { 
        osc.frequency.value = 600; 
        osc.type = 'sine'; 
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); 
        osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.15); 
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3); 
        osc.start(); 
        osc.stop(audioCtx.currentTime + 0.3); 
    } 
};

// --- Translations ---
const TRANSLATIONS = { 
    en: { 
        appName: "PRO SPY", tagline: "COVERT ARENA", nickname: "OPERATOR NAME", create: "CREATE GAME", join: "JOIN OPS", browse: "BROWSE ROOMS", codePlaceholder: "ENTER CODE", players: "OPERATIVES", start: "LAUNCH MISSION", langBtn: "العربية", loading: "PROCESSING...", you: "YOU", statusSpy: "SPY", statusAgent: "AGENT", statusInformant: "INFORMANT", statusMrWhite: "MR. WHITE", statusGhost: "GHOST", round: "ROUND", skip: "SKIP TURN", vote: "VOTE TO EJECT", chatPlaceholder: "Type message...", send: "SEND", waiting: "Awaiting host...", location: "LOCATION", spectator: "SPECTATOR", confirm: "CONFIRM VOTE", spyWin: "SPY WINS!", agentsWin: "AGENTS WIN!", mrWhiteWin: "MR. WHITE WINS!", playAgain: "PLAY AGAIN", connecting: "Connecting...", startVoting: "START VOTING", votingStarted: "VOTING INITIATED", voteRequestTitle: "VOTING REQUEST", voteRequestDesc: "wants to start voting.", agree: "AGREE", decline: "DECLINE", endVoting: "END VOTING NOW", votesTitle: "VOTES:", roundsFormat: (c, m) => `ROUND ${c}/${m}`, wordSelectionTitle: "SELECT KEYWORD", wordSelectionDesc: "Choose a keyword for this round", finishSelection: "FINISH SELECTION", selectedWord: "Selected Keyword", loginGoogle: "Login", myAccount: "My Account", logout: "Logout", profile: "Profile", guest: "Guest", linkGuessCard: "GUESS MY CARD", level: "Level", wins: "Wins", losses: "Losses", winRate: "Win Rate", totalGames: "Games", achievements: "Achievements", id: "ID", enterCodeError: "Please enter a room code.", changeName: "Change Name", nameChangeLimit: "Once a month", copied: "Copied!", save: "Save", or: "OR", needPlayers: "Minimum players not met!", ok: "OK", tabLobby: "Lobby", tabLeaderboard: "Leaderboard", tabFriends: "Friends", addFriend: "Add Friend", friendIdPlaceholder: "Enter Friend ID", online: "Online", offline: "Offline", noFriends: "No friends yet.", friendAdded: "Friend Added!", friendNotFound: "User not found.", requestSent: "Request Sent!", incomingRequests: "Incoming Requests", noRequests: "No pending requests.", accept: "Accept", reject: "Reject", sendMessage: "Send", inviteBtn: "Invite", invitedYou: "invited you to play.", joinInvite: "Join?", inviteFriends: "Invite Friends", accountInfo: "Account Information", email: "Email", memberSince: "Member Since", nameChangeCountdown: "Name Change In", canChangeNow: "Can change now!", selectEmoji: "Emoji", guestTitle: "GUEST ACCOUNT", guestDesc: "Register to save progress and add friends.", kd: "K/D Ratio", stats: "Stats", noPermission: "Feature unavailable for guests.", normalMode: "NORMAL MODE", advancedMode: "ADVANCED MODE (6+)", modeNormalDesc: "Classic Spy vs Agents. 3-10 Players.", modeAdvDesc: "Special Roles included! 6-10 Players.", privateRoom: "Private Room", password: "Password", publicRoom: "Public Room", noRooms: "No active games found.", lobbyTitle: "GAME LOBBY", mrWhiteInstruction: "Guess the location to win!", informantInstruction: "You know a neighbor!", ghostInstruction: "You are now a Ghost. You can watch but cannot act.", guessLocation: "GUESS LOCATION", leaveRoom: "LEAVE", closeRoom: "CLOSE ROOM", showPassword: "Show Password", guestAccountLabel: "GUEST ACCOUNT", guestProfileMsg: "Guests cannot receive friend requests.", reportUser: "Report User", reportSent: "Report sent successfully!", reportTitle: "Report User", reportDesc: "Please select a reason for reporting this user.", reportReasonAbusive: "Abusive Behavior", reportReasonCheating: "Cheating", reportReasonSpam: "Spam", reportReasonOther: "Other", reportSubmit: "Submit Report", reportCancel: "Cancel", privateRoomError: "Private rooms require a password.",
        shop: "Shop", currency: "Intel", buy: "Buy", owned: "Owned", equip: "Equip", equipped: "Equipped", unequip: "UnEquip", inventory: "Inventory", frames: "Frames", titles: "Titles", themes: "Themes", purchaseSuccess: "Purchase Successful!", purchaseFail: "Not enough Intel!", alreadyOwned: "Already Owned", useGift: "Use Gift", sendGift: "Send Gift",
        tutorialTitle: "Welcome, Agent", tutorialStep1: "Your goal is to find the Spy (or blend in if you are the Spy).", tutorialStep2: "Each round, discuss and vote to eject a suspect.", tutorialStep3: "Win matches to earn Intel and buy items in the Shop!", skipTutorial: "Skip", next: "Next", startGame: "Start Game",
        matchSummary: "Match Summary", matchDuration: "Duration", mvp: "MVP", correctVotes: "Correct Votes", summaryTitle: "Game Over!",
        notifTitle: "Notification", achUnlock: "Achievement Unlocked!", newFriend: "New Friend Added!", hiddenAch: "Hidden Achievement", tabMain: "Main", tabInv: "Inventory", tabAch: "Achievements",
        charisma: "Charisma", charismaDesc: "Your influence in the arena", gifts: "Gifts", sendGift: "Send Gift", giftSent: "Gift Sent!", giftReceived: "You received a gift!", selectGift: "Select a Gift", giftPreview: "Gift Preview", cashback: "Cashback", willReceive: "You'll receive", charismaGain: "Charisma Gain", playerLeft: "Player Left", spyLeftAgentsWin: "Spy left! Agents Win!", agentLeftSpyWins: "Agent left! Spy Wins!", myGifts: "My Gifts", receivedGifts: "Received Gifts", noGifts: "No gifts yet.", fromPlayer: "From", toPlayer: "To", buyGift: "Buy Gift", sendToFriend: "Send to Friend", selectFriend: "Select Friend",
    }, 
    ar: { 
        appName: "برو جاسوس", tagline: "ساحة العمليات", nickname: "اسم العميل", create: "إنشاء لعبة", join: "انضمام", browse: "استعراض الغرف", codePlaceholder: "أدخل الكود", players: "العملاء", start: "بدء المهمة", langBtn: "English", loading: "جاري التحميل...", you: "أنت", statusSpy: "جاسوس", statusAgent: "عميل", statusInformant: "المخبر", statusMrWhite: "السيد", statusGhost: "شبح", round: "الجولة", skip: "تخطي الدور", vote: "تصويت للطرد", chatPlaceholder: "اكتب رسالة...", send: "إرسال", waiting: "بانتظار المضيف...", location: "الموقع", spectator: "مشاهد", confirm: "تأكيد التصويت", spyWin: "فاز الجاسوس!", agentsWin: "فاز العملاء!", mrWhiteWin: "فاز السيد!", playAgain: "لعب مجدداً", connecting: "جاري التأمين...", startVoting: "بدء التصويت", votingStarted: "بدأ التصويت", voteRequestTitle: "طلب تصويت", voteRequestDesc: "يريد بدء التصويت.", agree: "موافق", decline: "رفض", endVoting: "إنهاء التصويت الآن", votesTitle: "الأصوات:", roundsFormat: (c, m) => `الجولة ${c}/${m}`, wordSelectionTitle: "اختر كلمة السر", wordSelectionDesc: "اختر كلمة سر لهذه الجولة", finishSelection: "إنهاء الاختيار", selectedWord: "كلمة السر", loginGoogle: "دخول", myAccount: "حسابي", logout: "تسجيل الخروج", profile: "الملف الشخصي", guest: "زائر", linkGuessCard: "خمن كرتي", level: "المستوى", wins: "فوز", losses: "خسارة", winRate: "نسبة الفوز", totalGames: "المباريات", achievements: "الإنجازات", id: "الرقم", enterCodeError: "برجاء إدخال كود الغرفة.", changeName: "تغيير الاسم", nameChangeLimit: "مرة شهرياً", copied: "تم النسخ!", save: "حفظ", or: "أو", needPlayers: "اللاعبين غير كافيين!", ok: "حسناً", tabLobby: "الرئيسية", tabLeaderboard: "المتصدرين", tabFriends: "الأصدقاء", addFriend: "أضافة صديق", friendIdPlaceholder: "أدخل ID الصديق", online: "متصل", offline: "غير متصل", noFriends: "لا يوجد أصدقاء.", friendAdded: "تمت الإضافة!", friendNotFound: "المستخدم غير موجود.", requestSent: "تم إرسال الطلب!", incomingRequests: "طلبات الصداقة", noRequests: "لا توجد طلبات.", accept: "قبول", reject: "رفض", sendMessage: "إرسال", inviteBtn: "دعوة", invitedYou: "دعاك للعب.", joinInvite: "انضمام؟", inviteFriends: "دعوة أصدقاء", accountInfo: "معلومات الحساب", email: "البريد الإلكتروني", memberSince: "عضو منذ", nameChangeCountdown: "تغيير الاسم بعد", canChangeNow: "يمكن التغيير الآن!", selectEmoji: "إيموجي", guestTitle: "حساب زائر", guestDesc: "سجل لحفظ تقدمك وإضافة أصدقاء.", kd: "نسبة الـ KD", stats: "الإحصائيات", noPermission: "غير متاح للزوار.", normalMode: "الوضع العادي", advancedMode: "الوضع المتقدم (6+)", modeNormalDesc: "جاسوس ضد عملاء. 3-10 لاعبين.", modeAdvDesc: "أدوار خاصة! 6-10 لاعبين.", privateRoom: "غرفة خاصة", password: "كلمة السر", publicRoom: "غرفة عامة", noRooms: "لا توجد ألعاب نشطة.", lobbyTitle: "غرفة الانتظار", mrWhiteInstruction: "خمن المكان لتفوز!", informantInstruction: "تعرف على جارك!", ghostInstruction: "أنت الآن شبح. يمكنك المشاهدة فقط.", guessLocation: "خمن المكان", leaveRoom: "خروج", closeRoom: "إغلاق الغرفة", showPassword: "إظهار الباسورد", guestAccountLabel: "حساب زائر", guestProfileMsg: "لا يمكن إرسال طلبات صداقة للحسابات الزائرة.", reportUser: "إبلاغ عن المستخدم", reportSent: "تم إرسال البلاغ بنجاح!", reportTitle: "الإبلاغ عن مستخدم", reportDesc: "برجاء اختيار سبب الإبلاغ.", reportReasonAbusive: "سلوك مسيء", reportReasonCheating: "غش", reportReasonSpam: "بريد مزعج", reportReasonOther: "سبب آخر", reportSubmit: "إرسال البلاغ", reportCancel: "إلغاء", privateRoomError: "الغرف الخاصة تتطلب كلمة سر!",
        shop: "المتجر", currency: "إنتل", buy: "شراء", owned: "مملوك", equip: "تزيين", equipped: "مُزين", unequip: "إزالة", inventory: "المخزون", frames: "إطارات", titles: "ألقاب", themes: "سمات", purchaseSuccess: "تم الشراء!", purchaseFail: "لا تملك إنتل كافي!", alreadyOwned: "مملوك مسبقاً", useGift: "استخدام", sendGift: "إرسال هدية",
        tutorialTitle: "مرحباً أيها العميل", tutorialStep1: "هدفك هو العثور على الجاسوس (أو التخفي إن كنت الجاسوس).", tutorialStep2: "في كل جولة، ناقش وصوّت لطرد المشتبه به.", tutorialStep3: "اربح المباريات لتحصل على إنتل واشتري من المتجر!", skipTutorial: "تخطي", next: "التالي", startGame: "ابدأ اللعبة",
        matchSummary: "ملخص المباراة", matchDuration: "المدة", mvp: "الأفضل", correctVotes: "أصوات صحيحة", summaryTitle: "انتهت اللعبة!",
        notifTitle: "إشعار", achUnlock: "تم فتح إنجاز!", newFriend: "صديق جديد!", hiddenAch: "إنجاز سري", tabMain: "الرئيسية", tabInv: "المخزون", tabAch: "الإنجازات",
        charisma: "الكاريزما", charismaDesc: "تأثيرك في الساحة", gifts: "الهدايا", sendGift: "إرسال هدية", giftSent: "تم إرسال الهدية!", giftReceived: "لقد استلمت هدية!", selectGift: "اختر هدية", giftPreview: "معاينة الهدية", cashback: "استرداد", willReceive: "ستستلم", charismaGain: "زيادة الكاريزما", playerLeft: "لاعب غادر", spyLeftAgentsWin: "الجاسوس غادر! فاز العملاء!", agentLeftSpyWins: "عميل غادر! فاز الجاسوس!", myGifts: "هداياي", receivedGifts: "الهدايا المستلمة", noGifts: "لا توجد هدايا بعد.", fromPlayer: "من", toPlayer: "إلى", buyGift: "شراء هدية", sendToFriend: "إرسال لصديق", selectFriend: "اختر صديق",
    } 
};

// ==========================================
// COMPONENTS
// ==========================================

// Notification Toast
const NotificationToast = ({ message, onClose }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => { onClose(); }, 2000);
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);
    
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

// Guest Banner
const GuestBanner = ({ lang }) => { 
    const t = TRANSLATIONS[lang]; 
    return ( <div className="guest-banner bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 text-center mb-2"> <h3 className="text-sm font-bold text-yellow-400">{t.guestTitle}</h3> <p className="text-[10px] text-gray-400">{t.guestDesc}</p> </div> ); 
};

// Tutorial Modal with Close Button
const TutorialModal = ({ show, onClose, lang }) => {
    const t = TRANSLATIONS[lang];
    const [step, setStep] = useState(0);
    if(!show) return null;
    const steps = [ { text: t.tutorialStep1, img: "🕵️" }, { text: t.tutorialStep2, img: "🗳️" }, { text: t.tutorialStep3, img: "🛒" } ];
    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="glass-panel rounded-2xl p-6 w-full max-w-sm text-center animate-pop relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl font-bold">&times;</button>
                <div className="text-6xl mb-6 animate-bounce">{steps[step].img}</div>
                <p className="text-base mb-6 text-gray-200">{steps[step].text}</p>
                <div className="flex justify-center gap-2 mb-4"> {steps.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full transition ${i === step ? 'bg-cyan-400 w-4' : 'bg-gray-600'}`}></div>)} </div>
                <div className="flex gap-3">
                    {step > 0 && <button onClick={() => setStep(s => s-1)} className="btn-ghost flex-1 py-2 rounded-lg text-sm">Back</button>}
                    {step < steps.length - 1 ? ( <button onClick={() => setStep(s => s+1)} className="btn-neon flex-1 py-2 rounded-lg text-sm">{t.next}</button> ) : ( <button onClick={onClose} className="btn-neon flex-1 py-2 rounded-lg text-sm">{t.startGame}</button> )}
                </div>
                <button onClick={onClose} className="text-xs text-gray-500 mt-4 hover:text-white">{t.skipTutorial}</button>
            </div>
        </div>
    );
};

// Gift Preview Modal with Close Button
const GiftPreviewModal = ({ show, onClose, gift, lang, onBuy, currency }) => { 
    const t = TRANSLATIONS[lang]; 
    if(!show || !gift) return null; 
    const cashbackAmount = Math.floor(gift.cost * (gift.cashback / 100)); 
    return ( 
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={onClose}> 
            <div className="glass-panel rounded-2xl p-5 w-full max-w-xs text-center animate-pop border border-yellow-500/30 relative" onClick={e => e.stopPropagation()}> 
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl font-bold">&times;</button>
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
                <div className="text-sm text-yellow-400 mb-3">{t.willReceive}: {cashbackAmount} Intel ({gift.cashback}%)</div> 
                <div className="flex gap-2"> 
                    <button onClick={onClose} className="btn-ghost flex-1 py-2 rounded-lg text-sm">{t.reportCancel}</button> 
                    <button onClick={() => onBuy(gift)} disabled={currency < gift.cost} className={`flex-1 py-2 rounded-lg text-sm font-bold ${currency >= gift.cost ? 'btn-gold' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>{t.buy} ({gift.cost} 🧠)</button> 
                </div> 
            </div> 
        </div> 
    ); 
};

// Send Gift Modal with Close Button
const SendGiftModal = ({ show, onClose, targetUser, currentUser, lang, onSendGift, currency }) => { 
    const t = TRANSLATIONS[lang]; 
    const [selectedGift, setSelectedGift] = useState(null); 
    const [showPreview, setShowPreview] = useState(false); 
    if(!show || !targetUser) return null; 
    const gifts = SHOP_ITEMS.gifts; 
    const handleSend = async (gift) => { 
        if (onSendGift) { await onSendGift(gift, targetUser); } 
        onClose(); 
    }; 
    return ( 
        <> 
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={onClose}> 
                <div className="glass-panel rounded-2xl p-4 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col animate-pop relative" onClick={e => e.stopPropagation()}> 
                    <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-white text-xl">&times;</button>
                    <div className="flex justify-between items-center mb-3"> 
                        <h2 className="text-lg font-bold text-primary">{t.sendGift}</h2> 
                    </div> 
                    <div className="flex items-center gap-2 mb-3 p-2 bg-white/5 rounded-lg"> 
                        <img src={targetUser.photoURL} className="w-10 h-10 rounded-full border-2 border-cyan-400" alt=""/> 
                        <div> <div className="font-bold text-sm">{targetUser.displayName}</div> <div className="text-[10px] text-gray-400">{t.charisma}: {formatCharisma(targetUser.charisma || 0)}</div> </div> 
                    </div> 
                    <div className="flex items-center gap-2 mb-3 text-xs text-yellow-400"><span>🧠 {currency} {CURRENCY_NAME}</span></div> 
                    <div className="flex-1 overflow-y-auto grid grid-cols-5 gap-2"> 
                        {gifts.map(gift => ( 
                            <button key={gift.id} onClick={() => { setSelectedGift(gift); setShowPreview(true); }} disabled={currency < gift.cost} className={`gift-card flex flex-col items-center justify-center p-2 rounded-lg transition ${currency >= gift.cost ? 'hover:border-yellow-400 hover:bg-yellow-500/10' : 'opacity-40 cursor-not-allowed'}`}> 
                                <span className="text-2xl">{gift.emoji}</span> 
                                <span className="text-[10px] font-bold text-yellow-400">{gift.cost}</span> 
                            </button> 
                        ))} 
                    </div> 
                </div> 
            </div> 
            <GiftPreviewModal show={showPreview} onClose={() => setShowPreview(false)} gift={selectedGift} lang={lang} onBuy={(gift) => handleSend(gift)} currency={currency} /> 
        </> 
    ); 
};

// Select Friend Modal for Gift
const SelectFriendModal = ({ show, onClose, friends, lang, onSelectFriend, gift }) => {
    const t = TRANSLATIONS[lang];
    if (!show || !gift) return null;
    
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="glass-panel rounded-2xl p-4 w-full max-w-sm max-h-[60vh] overflow-hidden flex flex-col animate-pop relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-white text-xl">&times;</button>
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl">{gift.emoji}</span>
                    <div>
                        <h2 className="text-lg font-bold text-primary">{t.selectFriend}</h2>
                        <p className="text-[10px] text-gray-400">{lang === 'ar' ? gift.name_ar : gift.name_en}</p>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {friends && friends.length > 0 ? (
                        friends.map(friend => (
                            <div 
                                key={friend.uid}
                                onClick={() => { onSelectFriend(friend); onClose(); }}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 cursor-pointer mb-1"
                            >
                                <img src={friend.photoURL} className="w-8 h-8 rounded-full" alt=""/>
                                <div>
                                    <div className="font-bold text-sm">{friend.displayName}</div>
                                    <div className="text-[10px] text-gray-400">✨ {formatCharisma(friend.charisma || 0)}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-400 text-sm py-8">{t.noFriends}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// KD Circle
const KDCircle = ({ wins, losses, lang }) => { 
    const t = TRANSLATIONS[lang]; 
    const total = wins + losses; 
    const ratio = total > 0 ? wins / total : 0; 
    const percentage = Math.round(ratio * 100); 
    const size = 100; const strokeWidth = 6; 
    const radius = (size - strokeWidth) / 2; 
    const circumference = 2 * Math.PI * radius; 
    const offset = circumference - (ratio * circumference); 
    return ( 
        <div className="kd-circle-container" style={{ width: size, height: size }}> 
            <svg width={size} height={size}> 
                <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="var(--secondary)" /><stop offset="100%" stopColor="var(--primary)" /></linearGradient></defs> 
                <circle className="kd-circle-bg" cx={size/2} cy={size/2} r={radius} /> 
                <circle className="kd-circle-progress" cx={size/2} cy={size/2} r={radius} strokeDasharray={circumference} strokeDashoffset={offset} /> 
            </svg> 
            <div className="kd-text"><span className="kd-value">{percentage}%</span><span className="kd-label">{t.winRate}</span></div> 
        </div> 
    ); 
};

// Charisma Bar - Shows actual charisma number
const CharismaBar = ({ charisma, lang }) => { 
    const t = TRANSLATIONS[lang]; 
    const level = Math.floor(charisma / 1000) + 1; 
    const progress = (charisma % 1000) / 1000 * 100; 
    return ( 
        <div className="charisma-container"> 
            <div className="flex justify-between items-center mb-1"> 
                <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">✨ {t.charisma}</span> 
                <span className="text-xs text-gray-400">Lv.{level}</span> 
            </div> 
            <div className="charisma-bar-bg"><div className="charisma-bar-fill" style={{ width: `${progress}%` }}></div></div> 
            <div className="text-center text-sm font-bold text-yellow-300 mt-1">{formatCharisma(charisma)}</div> 
        </div> 
    ); 
};

// Shop Modal - IMPROVED with UnEquip and Use Gift
const ShopModal = ({ show, onClose, userData, lang, onUpdate, friends, onUseGift }) => { 
    const t = TRANSLATIONS[lang]; 
    const [tab, setTab] = useState('frames'); 
    const [msg, setMsg] = useState(''); 
    const [selectedGift, setSelectedGift] = useState(null); 
    const [showGiftPreview, setShowGiftPreview] = useState(false);
    const [showSelectFriend, setShowSelectFriend] = useState(false);
    const [giftToUse, setGiftToUse] = useState(null);
    
    if(!show || !userData) return null; 
    const currency = userData.currency || 0; 
    const inventory = userData.inventory || { frames: [], titles: [], themes: [], gifts: [] }; 
    const equipped = userData.equipped || {}; 
    
    const handleBuy = async (item) => { 
        if(inventory[item.type]?.includes(item.id)) { setMsg(t.alreadyOwned); setTimeout(() => setMsg(''), 2000); return; } 
        if(currency < item.cost) { setMsg(t.purchaseFail); setTimeout(() => setMsg(''), 2000); return; } 
        const newCurrency = currency - item.cost; 
        const newInventory = { ...inventory }; 
        newInventory[item.type] = [...(newInventory[item.type] || []), item.id]; 
        await usersCollection.doc(userData.uid).update({ currency: newCurrency, inventory: newInventory }); 
        setMsg(t.purchaseSuccess); setTimeout(() => setMsg(''), 2000); if(onUpdate) onUpdate(); 
    }; 
    
    const handleBuyGift = async (gift) => { 
        if(currency < gift.cost) { setMsg(t.purchaseFail); setTimeout(() => setMsg(''), 2000); return; } 
        const cashbackAmount = Math.floor(gift.cost * (gift.cashback / 100)); 
        const newCurrency = currency - gift.cost + cashbackAmount; 
        const newInventory = { ...inventory }; 
        // Add gift to inventory with count
        const existingGiftIndex = (newInventory.gifts || []).findIndex(g => g.id === gift.id);
        if (existingGiftIndex >= 0) {
            newInventory.gifts[existingGiftIndex].count += 1;
        } else {
            newInventory.gifts = [...(newInventory.gifts || []), { id: gift.id, count: 1 }];
        }
        // Only sender gets charisma when BUYING gift (not receiver)
        const newCharisma = (userData.charisma || 0) + gift.charisma; 
        await usersCollection.doc(userData.uid).update({ currency: newCurrency, inventory: newInventory, charisma: newCharisma }); 
        setMsg(`${t.purchaseSuccess} +${formatCharisma(gift.charisma)} ✨`); setTimeout(() => setMsg(''), 2000); setShowGiftPreview(false); if(onUpdate) onUpdate(); 
    }; 
    
    const handleEquip = async (type, id) => { 
        const newEquipped = { ...equipped, [type]: id }; 
        await usersCollection.doc(userData.uid).update({ equipped: newEquipped }); 
        if(onUpdate) onUpdate(); 
    }; 
    
    const handleUnequip = async (type) => {
        const newEquipped = { ...equipped };
        delete newEquipped[type];
        await usersCollection.doc(userData.uid).update({ equipped: newEquipped });
        if(onUpdate) onUpdate();
    };
    
    const handleUseGift = (gift) => {
        setGiftToUse(gift);
        setShowSelectFriend(true);
    };
    
    const items = SHOP_ITEMS[tab] || [];
    
    // Get owned gifts with counts
    const getOwnedGifts = () => {
        return (inventory.gifts || []).filter(g => g.count > 0);
    };
    
    return ( 
        <> 
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-2" onClick={onClose}> 
                <div className="glass-panel rounded-2xl p-4 w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col animate-pop relative" onClick={e => e.stopPropagation()}> 
                    <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-white text-xl">&times;</button>
                    <div className="flex justify-between items-center mb-3"> 
                        <h2 className="text-lg font-bold text-primary">{t.shop}</h2> 
                        <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm"><span>{CURRENCY_ICON} {currency}</span></div> 
                    </div> 
                    <div className="flex gap-1 mb-3 border-b border-white/10 pb-2 overflow-x-auto"> 
                        {['frames', 'titles', 'themes', 'gifts'].map(k => ( <button key={k} onClick={() => setTab(k)} className={`px-3 py-1 rounded-t-lg text-xs whitespace-nowrap ${tab === k ? 'bg-white/10 text-white' : 'text-gray-500'}`}>{t[k]}</button> ))} 
                    </div> 
                    {msg && <div className="text-center text-xs text-cyan-400 mb-2 animate-pop">{msg}</div>}
                    
                    {/* Show owned gifts in gifts tab */}
                    {tab === 'gifts' && getOwnedGifts().length > 0 && (
                        <div className="mb-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <div className="text-[10px] text-green-400 font-bold mb-1">{t.myGifts}:</div>
                            <div className="flex flex-wrap gap-1">
                                {getOwnedGifts().map(ownedGift => {
                                    const giftInfo = SHOP_ITEMS.gifts.find(g => g.id === ownedGift.id);
                                    if (!giftInfo) return null;
                                    return (
                                        <div key={ownedGift.id} className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded">
                                            <span>{giftInfo.emoji}</span>
                                            <span className="text-[10px] text-white">x{ownedGift.count}</span>
                                            <button 
                                                onClick={() => handleUseGift(giftInfo)}
                                                className="text-[8px] bg-cyan-500 text-black px-1 rounded font-bold"
                                            >
                                                {t.useGift}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    
                    <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 pr-1"> 
                        {items.map(item => { 
                            const owned = item.type !== 'gifts' && inventory[item.type]?.includes(item.id); 
                            const isEquipped = equipped[item.type] === item.id; 
                            return ( 
                                <div key={item.id} className="bg-black/30 rounded-xl p-3 flex flex-col items-center justify-between h-36"> 
                                    <div className="text-xs font-bold mb-1 text-center">{lang === 'ar' ? item.name_ar : item.name_en}</div> 
                                    {item.type === 'frames' && ( 
                                        <div className="w-10 h-10 rounded-full mb-1 relative overflow-hidden flex-shrink-0"> 
                                            <div className="absolute inset-0 bg-gray-700 rounded-full"></div> 
                                            {item.preview?.startsWith('http') ? ( 
                                                <img src={item.preview} className="absolute inset-0 w-full h-full object-cover rounded-full" alt="frame" /> 
                                            ) : ( 
                                                <div className="absolute inset-0 rounded-full" style={{ background: item.preview, padding: '2px' }}><div className="w-full h-full rounded-full bg-gray-800"></div></div> 
                                            )} 
                                        </div> 
                                    )} 
                                    {item.type === 'titles' && <div className="text-base font-bold mb-1 text-center" style={{ color: 'var(--primary)' }}>{item.name_en}</div>} 
                                    {item.type === 'themes' && <div className="text-2xl mb-1">🎨</div>} 
                                    {item.type === 'gifts' && ( <> <div className="text-2xl mb-1">{item.emoji}</div> <div className="text-[10px] text-yellow-400">+{formatCharisma(item.charisma)} ✨</div> </> )} 
                                    {item.type === 'gifts' ? ( 
                                        <button onClick={() => { setSelectedGift(item); setShowGiftPreview(true); }} disabled={currency < item.cost} className={`w-full py-1 rounded text-[10px] font-bold ${currency >= item.cost ? 'btn-gold' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>{t.buy} ({item.cost})</button> 
                                    ) : owned ? ( 
                                        isEquipped ? (
                                            <button onClick={() => handleUnequip(item.type)} className="w-full py-1 rounded text-[10px] btn-ghost border-red-500/50 text-red-400">{t.unequip}</button>
                                        ) : (
                                            <button onClick={() => handleEquip(item.type, item.id)} className="w-full py-1 rounded text-[10px] btn-ghost border-white/20">{t.equip}</button>
                                        )
                                    ) : ( 
                                        <button onClick={() => handleBuy(item)} className="btn-gold w-full py-1 rounded text-[10px]">{t.buy} ({item.cost})</button> 
                                    )} 
                                </div> 
                            ); 
                        })} 
                    </div> 
                </div> 
            </div> 
            <GiftPreviewModal show={showGiftPreview} onClose={() => setShowGiftPreview(false)} gift={selectedGift} lang={lang} onBuy={handleBuyGift} currency={currency} />
            <SelectFriendModal 
                show={showSelectFriend} 
                onClose={() => setShowSelectFriend(false)} 
                friends={friends} 
                lang={lang} 
                gift={giftToUse}
                onSelectFriend={(friend) => {
                    if (onUseGift && giftToUse) {
                        onUseGift(giftToUse, friend);
                    }
                }}
            />
        </> 
    ); 
};

// Match Summary Modal
const MatchSummaryModal = ({ show, onClose, room, players, lang }) => { 
    const t = TRANSLATIONS[lang]; 
    if(!show || !room) return null; 
    const duration = room.finishedAt && room.startedAt ? formatDuration(room.finishedAt - room.startedAt) : "N/A"; 
    return ( 
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4" onClick={onClose}> 
            <div className="glass-panel rounded-2xl p-6 w-full max-w-sm text-center animate-pop relative" onClick={e => e.stopPropagation()}> 
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl">&times;</button>
                <h2 className="text-2xl font-black mb-4 text-primary">{t.summaryTitle}</h2> 
                <div className="grid grid-cols-2 gap-3 mb-4 text-left text-xs"> 
                    <div className="bg-black/30 p-2 rounded-lg"><span className="text-gray-400">{t.matchDuration}</span><div className="text-lg font-bold text-white">{duration}</div></div> 
                    <div className="bg-black/30 p-2 rounded-lg"><span className="text-gray-400">{t.mvp}</span><div className="text-lg font-bold text-primary truncate">{room.status === 'finished_spy_caught' ? 'Agents' : 'Spy'}</div></div> 
                </div> 
                <div className="max-h-32 overflow-y-auto mb-4 space-y-1"> {players && players.map(p => ( <div key={p.uid} className="flex justify-between items-center bg-white/5 px-2 py-1 rounded text-xs"><span>{p.name}</span><span className={p.status === 'active' ? 'text-green-400' : 'text-red-400'}>{p.status === 'active' ? 'Survived' : 'Out'}</span></div> ))} </div> 
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
    const reasons = [ { id: 'abusive', label: t.reportReasonAbusive }, { id: 'cheating', label: t.reportReasonCheating }, { id: 'spam', label: t.reportReasonSpam }, { id: 'other', label: t.reportReasonOther } ]; 
    const handleSubmit = async () => { 
        if (!selectedReason) return; 
        setSubmitting(true); 
        try { 
            await reportsCollection.add({ reporterId: currentUser.uid, reporterName: currentUser.displayName, reportedId: targetUser.uid, reportedName: targetUser.displayName, reason: selectedReason, details: details, timestamp: firebase.firestore.FieldValue.serverTimestamp(), status: 'pending' }); 
            setMsg(t.reportSent); 
            setTimeout(() => { onClose(); setMsg(''); setSelectedReason(null); setDetails(''); }, 1500); 
        } catch (err) { console.error(err); } finally { setSubmitting(false); } 
    }; 
    return ( 
        <div className="report-modal-overlay" onClick={onClose}> 
            <div className="report-modal-content animate-pop" onClick={e => e.stopPropagation()}> 
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl">&times;</button>
                <h2 className="text-lg font-bold text-red-400 mb-3">{t.reportTitle}</h2> 
                <p className="text-xs text-gray-400 mb-3">{t.reportDesc}</p> 
                <div className="space-y-2 mb-3"> {reasons.map(r => ( <div key={r.id} onClick={() => setSelectedReason(r.id)} className={`report-reason-option ${selectedReason === r.id ? 'selected' : ''}`}> <div className={`w-3 h-3 rounded-full border-2 ${selectedReason === r.id ? 'border-red-500 bg-red-500' : 'border-gray-500'}`}></div> <span className="text-xs">{r.label}</span> </div> ))} </div> 
                <textarea className="input-dark w-full p-2 rounded text-xs h-16 resize-none" placeholder={t.reportReasonOther} value={details} onChange={e => setDetails(e.target.value)} disabled={submitting}></textarea> 
                {msg && <div className="text-center text-green-400 text-xs my-2">{msg}</div>} 
                <div className="flex gap-2 mt-3"> 
                    <button onClick={onClose} className="btn-ghost flex-1 py-2 rounded text-xs" disabled={submitting}>{t.reportCancel}</button> 
                    <button onClick={handleSubmit} disabled={!selectedReason || submitting} className="btn-danger flex-1 py-2 rounded font-bold text-xs">{submitting ? t.loading : t.reportSubmit}</button> 
                </div> 
            </div> 
        </div> 
    ); 
};

// User Profile Modal
const UserProfileModal = ({ show, onClose, targetUID, lang, isFriend, currentUserData, onSendRequest, onSendGift }) => { 
    const t = TRANSLATIONS[lang]; 
    const [profileData, setProfileData] = useState(null); 
    const [msg, setMsg] = useState(''); 
    const [showReport, setShowReport] = useState(false); 
    const [showSendGift, setShowSendGift] = useState(false); 
    
    useEffect(() => { 
        if (show && targetUID) { 
            usersCollection.doc(targetUID).get().then(doc => { 
                if (doc.exists) setProfileData(doc.data()); 
            }); 
        } 
    }, [show, targetUID]); 
    
    if (!show || !profileData) return null; 
    
    const level = calculateLevel(profileData.stats?.xp || 0); 
    const wins = profileData.stats?.wins || 0; 
    const losses = profileData.stats?.losses || 0; 
    const totalGames = wins + losses; 
    const charisma = profileData.charisma || 0; 
    const isTargetGuest = profileData.isAnonymous; 
    const equippedTitle = profileData.equipped?.titles ? SHOP_ITEMS.titles.find(i => i.id === profileData.equipped.titles) : null; 
    const isMe = targetUID === currentUserData.uid; 
    const frameItem = profileData.equipped?.frames ? SHOP_ITEMS.frames.find(f=>f.id===profileData.equipped.frames) : null; 
    const isFrameUrl = frameItem?.preview?.startsWith('http'); 
    const avatarSize = 48; 
    const frameScale = 1.18; 
    
    const handleAddClick = async () => { 
        if (isFriend || currentUserData.isAnonymous) return; 
        await onSendRequest(targetUID); 
        setMsg(t.requestSent); 
        setTimeout(() => setMsg(''), 2000); 
    }; 
    
    return ( 
        <> 
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4" onClick={onClose}> 
                <div className="glass-panel rounded-2xl p-5 w-full max-w-sm animate-pop relative" onClick={e => e.stopPropagation()}> 
                    <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl">&times;</button>
                    <div className="profile-header text-center"> 
                        <div className="relative inline-block mb-2 mx-auto" style={{ width: avatarSize, height: avatarSize }}> 
                            {isFrameUrl && frameItem && ( <img src={frameItem.preview} className="absolute pointer-events-none z-20 rounded-full" style={{ width: avatarSize * frameScale, height: avatarSize * frameScale, top: -(avatarSize * (frameScale - 1) / 2), left: -(avatarSize * (frameScale - 1) / 2) }} alt="" /> )} 
                            {!isFrameUrl && frameItem && ( <div className="absolute rounded-full z-0" style={{ width: avatarSize * frameScale, height: avatarSize * frameScale, top: -(avatarSize * (frameScale - 1) / 2), left: -(avatarSize * (frameScale - 1) / 2), background: frameItem.preview, padding: 3 }}><div className="w-full h-full rounded-full bg-gray-900"></div></div> )} 
                            <img src={profileData.photoURL || `https://ui-avatars.com/api/?name=${profileData.displayName}&background=random`} className="profile-avatar-sm relative z-10 mx-auto" style={{ width: avatarSize, height: avatarSize }} alt=""/> 
                        </div> 
                        <div className="profile-name text-lg"> 
                            {equippedTitle && <span className="equipped-title text-[8px]">{lang === 'ar' ? equippedTitle.name_ar : equippedTitle.name_en}</span>} 
                            {profileData.displayName} 
                        </div> 
                        {isTargetGuest && ( <div className="guest-badge-profile text-[10px]"><span>⚠️</span> {t.guestAccountLabel}</div> )} 
                        <div className="profile-id-box mt-1" onClick={() => { navigator.clipboard.writeText(profileData.customId); setMsg(t.copied); setTimeout(()=>setMsg(''),1500) }}> <span className="profile-id-text text-[10px]">ID: #{profileData.customId}</span> </div> 
                    </div> 
                    {msg && <div className="text-center text-[10px] text-cyan-400 mb-2">{msg}</div>} 
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
                                    <button onClick={handleAddClick} disabled={msg || isFriend} className={`flex-1 py-2 rounded-lg font-bold text-xs mt-3 ${isFriend ? 'bg-gray-700 text-gray-400' : 'btn-neon'}`}>{isFriend ? "Friends" : (msg || t.addFriend)}</button> 
                                    <button onClick={() => setShowSendGift(true)} className="btn-gold py-2 rounded-lg font-bold text-xs mt-3 px-3">🎁</button> 
                                </div> 
                            ) : ( <div className="text-center text-[10px] text-yellow-400 bg-yellow-500/10 p-2 rounded-lg mt-3">{t.guestProfileMsg}</div> ) 
                        ) : (<div className="text-center text-[10px] text-gray-500 mt-3">{t.noPermission}</div>) 
                    )} 
                    {currentUserData && !currentUserData.isAnonymous && !isMe && ( 
                        <button onClick={() => setShowReport(true)} className="btn-ghost w-full py-1 mt-2 rounded text-[10px] text-gray-400 hover:text-red-400">{t.reportUser}</button> 
                    )} 
                </div> 
            </div> 
            <ReportModal show={showReport} onClose={() => setShowReport(false)} targetUser={profileData} currentUser={currentUserData} lang={lang} />
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

// Export components
window.PRO_SPY_COMPONENTS = {
    NotificationToast,
    GuestBanner,
    TutorialModal,
    GiftPreviewModal,
    SendGiftModal,
    SelectFriendModal,
    KDCircle,
    CharismaBar,
    ShopModal,
    MatchSummaryModal,
    ReportModal,
    UserProfileModal,
    SHOP_ITEMS,
    ACHIEVEMENTS,
    SCENARIOS,
    EMOJI_LIST,
    TRANSLATIONS,
    CURRENCY_NAME,
    CURRENCY_ICON,
    MAX_ROUNDS,
    generateUID,
    calculateLevel,
    calculateXPProgress,
    getChatId,
    formatTime,
    formatDate,
    formatCharisma,
    playSound,
    initAudio
};
// ==========================================
// PRO SPY - COMPLETE SCRIPT PART 2 - FIXED
// App Component with ALL Systems Fixed
// ==========================================

// Import from Part 1
const { 
    NotificationToast, GuestBanner, TutorialModal, GiftPreviewModal, SendGiftModal, 
    SelectFriendModal, KDCircle, CharismaBar, ShopModal, MatchSummaryModal, 
    ReportModal, UserProfileModal, SHOP_ITEMS, ACHIEVEMENTS, SCENARIOS, EMOJI_LIST, 
    TRANSLATIONS, CURRENCY_NAME, CURRENCY_ICON, MAX_ROUNDS, generateUID, calculateLevel, 
    calculateXPProgress, getChatId, formatTime, formatDate, formatCharisma, playSound, initAudio 
} = window.PRO_SPY_COMPONENTS;

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
    const [showShop, setShowShop] = useState(false);
    
    const t = TRANSLATIONS[lang];
    const isLoggedIn = user && !user.isAnonymous;
    const isGuest = user && user.isAnonymous;

    // Firebase references
    const appId = 'pro_spy_v25_final_fix_complete';
    const usersCollection = firebase.firestore().collection('artifacts').doc(appId).collection('public').doc('data').collection('users');
    const reportsCollection = firebase.firestore().collection('artifacts').doc(appId).collection('public').doc('data').collection('reports');
    const chatsCollection = firebase.firestore().collection('artifacts').doc(appId).collection('public').doc('data').collection('private_chats');
    const roomsCollection = firebase.firestore().collection('artifacts').doc(appId).collection('public').doc('data').collection('rooms');
    const historyCollection = firebase.firestore().collection('artifacts').doc(appId).collection('public').doc('data').collection('game_history');
    const db = firebase.firestore();
    const auth = firebase.auth();

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
    // AUTH STATE LISTENER
    // ==========================================
    useEffect(() => {
        const unsubAuth = auth.onAuthStateChanged(async (u) => {
            if (u) { 
                setUser(u); 
                const userRef = usersCollection.doc(u.uid); 
                const doc = await userRef.get();
                if (!doc.exists) { 
                    const newUserData = { 
                        uid: u.uid, email: u.email, displayName: u.displayName || u.uid.substring(0,5), photoURL: u.photoURL, customId: generateUID(), 
                        stats: { wins: 0, losses: 0, xp: 0 }, achievements: [], friends: [], friendRequests: [], 
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(), lastChangedName: null, lastActive: firebase.firestore.FieldValue.serverTimestamp(), 
                        isAnonymous: u.isAnonymous, currency: 100, inventory: {frames: [], titles: [], themes: [], gifts: []}, equipped: {}, charisma: 0
                    }; 
                    await userRef.set(newUserData); setUserData(newUserData); if (u.displayName) setNickname(u.displayName); 
                }
                const unsubSnap = userRef.onSnapshot(snap => { if (snap.exists) { setUserData(snap.data()); if (snap.data().displayName) setNickname(snap.data().displayName); } }); 
                return () => unsubSnap();
            } else { setUser(null); setUserData(null); }
        }); return unsubAuth;
    }, []);

    useEffect(() => { const tutorialDone = localStorage.getItem('pro_spy_tutorial_v2'); if(!tutorialDone && !isGuest) setShowTutorial(true); }, [isGuest]);
    useEffect(() => { if (!user) return; const interval = setInterval(() => { usersCollection.doc(user.uid).update({ lastActive: firebase.firestore.FieldValue.serverTimestamp() }); }, 60000); return () => clearInterval(interval); }, [user]);

    // ==========================================
    // ROOM LISTENER
    // ==========================================
    useEffect(() => { 
        if (!user || !roomId) return; 
        const unsub = roomsCollection.doc(roomId).onSnapshot(async doc => { 
            if (doc.exists) { 
                const data = doc.data(); 
                setRoom(data);
                
                if (data.status !== 'waiting' && data.status !== 'finished_spy_caught' && data.status !== 'finished_spy_wins' && data.status !== 'finished_mrwhite_wins') {
                    const activePlayers = data.players.filter(p => p.status === 'active');
                    if (activePlayers.length <= 1 && data.mode === 'normal') {
                        if (activePlayers.length === 1) {
                            const lastPlayer = activePlayers[0];
                            if (lastPlayer.uid === data.spyId) { await endGameDueToLeave(false, data); } 
                            else { await endGameDueToLeave(true, data); }
                        } else if (activePlayers.length === 0) {
                            await roomsCollection.doc(roomId).update({ status: 'finished_spy_caught', finishedAt: firebase.firestore.FieldValue.serverTimestamp() });
                        }
                    }
                }
                
                if(data.status?.includes('finished') && !data.summaryShown) { 
                    setShowSummary(true); historyCollection.add({ ...data, finishedAt: firebase.firestore.FieldValue.serverTimestamp() }); 
                    roomsCollection.doc(roomId).update({summaryShown: true}); 
                } 
            } else { setRoom(null); setRoomId(''); } 
        }); 
        return unsub; 
    }, [user, roomId]);

    const endGameDueToLeave = async (agentsWin, roomData) => {
        if (!roomData) return;
        let status = agentsWin ? 'finished_spy_caught' : 'finished_spy_wins';
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
                "charisma": firebase.firestore.FieldValue.increment(isWinner ? 100 : 20)
            });
        });
        await batch.commit();
        await roomsCollection.doc(roomId).update({ status, turnEndTime: null, votingEndTime: null, finishedAt: firebase.firestore.FieldValue.serverTimestamp() });
        setAlertMessage(agentsWin ? t.spyLeftAgentsWin : t.agentLeftSpyWins);
    };

    // ==========================================
    // OTHER LISTENERS
    // ==========================================
    useEffect(() => { if (activeView === 'leaderboard') { usersCollection.orderBy('stats.wins', 'desc').limit(100).get().then(snap => { const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => !d.isAnonymous); setLeaderboardData(data); }); } }, [activeView]);
    useEffect(() => { if (activeView === 'friends' && userData) { if (userData.friends?.length > 0) { usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', userData.friends).get().then(snap => { setFriendsData(snap.docs.map(d => ({ id: d.id, ...d.data() }))); }); } else { setFriendsData([]); } if (userData.friendRequests?.length > 0) { usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', userData.friendRequests).get().then(snap => { setFriendRequests(snap.docs.map(d => ({ id: d.id, ...d.data() }))); }); } else { setFriendRequests([]); } } }, [activeView, userData?.friends, userData?.friendRequests]);
    useEffect(() => { if (!user) return; const unsub = chatsCollection.where('members', 'array-contains', user.uid).onSnapshot(snap => { let total = 0; const meta = {}; snap.docs.forEach(doc => { const d = doc.data(); meta[doc.id] = d; const myUnread = d.unread?.[user.uid] || 0; total += myUnread; }); setChatsMeta(meta); setTotalUnread(total); }); return unsub; }, [user, openChatId]);
    useEffect(() => { if (room?.status === 'discussing' && room?.turnEndTime) { const interval = setInterval(() => { const remaining = Math.max(0, Math.floor((room.turnEndTime - Date.now()) / 1000)); setTurnTimer(remaining); if (remaining <= 0) { handleSkipTurn(true); clearInterval(interval); } }, 1000); return () => clearInterval(interval); } else setTurnTimer(30); }, [room?.status, room?.turnEndTime]);
    useEffect(() => { if (room?.status === 'voting' && room?.votingEndTime) { const interval = setInterval(() => { const remaining = Math.max(0, Math.floor((room.votingEndTime - Date.now()) / 1000)); setVotingTimer(remaining); if (remaining <= 0) { resolveVotes(true); clearInterval(interval); } }, 1000); return () => clearInterval(interval); } else setVotingTimer(30); }, [room?.status, room?.votingEndTime]);
    useEffect(() => { if (room?.status === 'word_selection' && room?.wordSelEndTime) { const interval = setInterval(() => { const remaining = Math.max(0, Math.floor((room.wordSelEndTime - Date.now()) / 1000)); setWordSelTimer(remaining); if (remaining <= 0) { finishWordSelection(); clearInterval(interval); } }, 1000); return () => clearInterval(interval); } else setWordSelTimer(30); }, [room?.status, room?.wordSelEndTime]);

    // ==========================================
    // AUTH FUNCTIONS
    // ==========================================
    const handleGoogleLogin = async () => { const provider = new firebase.auth.GoogleAuthProvider(); try { await auth.signInWithPopup(provider); } catch (e) { console.error(e); } };
    const handleLogout = async () => { await auth.signOut(); setShowDropdown(false); setNickname(''); localStorage.removeItem('pro_spy_nick'); };
    const getDefaultPhoto = (uData, name) => uData?.photoURL || `https://ui-avatars.com/api/?name=${name || 'Guest'}&background=random`;

    // ==========================================
    // ROOM FUNCTIONS
    // ==========================================
    const handleCreateGame = async () => { 
        if (!nickname.trim()) return; 
        if (isPrivate && !password.trim()) { setAlertMessage(t.privateRoomError); return; }
        playSound('click'); setLoading(true); 
        let uid = user?.uid; 
        if (!uid) { const anon = await auth.signInAnonymously(); uid = anon.user.uid; setUser(anon.user); } 
        const id = Math.random().toString(36).substring(2, 7).toUpperCase(); 
        await roomsCollection.doc(id).set({ 
            id, admin: uid, status: 'waiting', 
            players: [{ uid: uid, name: nickname, status: 'active', photo: getDefaultPhoto(userData, nickname), role: null, equipped: userData?.equipped || {} }], 
            scenario: null, spyId: null, currentTurnUID: null, turnEndTime: null, votingEndTime: null, currentRound: 0, messages: [], votes: {}, 
            usedLocations: [], wordVotes: {}, chosenWord: null, wordSelEndTime: null, votingRequest: null, mode: setupMode, 
            isPrivate: isPrivate, password: isPrivate ? password : null, startedAt: null, summaryShown: false 
        }); 
        setRoomId(id); setLoading(false); setShowSetupModal(false); setActiveView('lobby'); 
    };
    
    const handleJoinGame = async (id, pwd) => {
        if (!id || id.trim() === "") { setJoinError(t.enterCodeError); return; }
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
            if (!exists) { await ref.update({ players: [...data.players, { uid: uid, name: nickname, status: 'active', photo: getDefaultPhoto(userData, nickname), role: null, equipped: userData?.equipped || {} }] }); } 
            setRoomId(id.toUpperCase()); setActiveView('lobby'); 
        } else { setJoinError("Room not found"); } 
        setLoading(false); 
    };

    const handleLeaveRoom = async (isUnload = false) => { 
        if (!room || !user) return; 
        if (!isUnload) playSound('click'); 
        const isAdmin = room.admin === user.uid;
        const isActive = room.players.find(p => p.uid === user.uid)?.status === 'active';
        
        if (room.status !== 'waiting' && room.status !== 'finished_spy_caught' && room.status !== 'finished_spy_wins' && room.status !== 'finished_mrwhite_wins' && isActive && room.mode === 'normal') {
            const newPlayers = room.players.map(p => { if (p.uid === user.uid) return { ...p, status: 'spectator' }; return p; });
            await roomsCollection.doc(roomId).update({ players: newPlayers });
        } else if (isAdmin) { await roomsCollection.doc(roomId).delete(); } 
        else { await roomsCollection.doc(roomId).update({ players: room.players.filter(p => p.uid !== user.uid) }); }
        
        if (!isUnload) { setRoom(null); setRoomId(''); setShowSummary(false); } 
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
            status: 'word_selection', scenario, spyId: spy.uid, currentTurnUID: firstPlayer.uid, 
            turnEndTime: null, currentRound: 1, 
            players: room.players.map(p => ({ ...p, vote: null, role: roles[p.uid] || 'agent' })), 
            usedLocations: firebase.firestore.FieldValue.arrayUnion(scenario.loc_en), 
            messages: [], votes: {}, wordVotes: {}, chosenWord: null, 
            wordSelEndTime: Date.now() + 30000, votingRequest: null, 
            startedAt: firebase.firestore.FieldValue.serverTimestamp() 
        }); 
    };

    const submitWordVote = async (word) => { if (!user || !room || room.status !== 'word_selection') return; playSound('click'); const voteUpdate = {}; voteUpdate[`wordVotes.${user.uid}`] = word; await roomsCollection.doc(roomId).update(voteUpdate); };
    const finishWordSelection = async () => { if (!room || room.status !== 'word_selection') return; const freshSnap = await roomsCollection.doc(roomId).get(); const freshData = freshSnap.data(); const counts = {}; Object.values(freshData.wordVotes || {}).forEach(v => counts[v] = (counts[v] || 0) + 1); let maxCount = 0; let chosenWord = (lang === 'ar' ? freshData.scenario.words_ar[0] : freshData.scenario.words_en[0]); for (const w in counts) { if (counts[w] > maxCount) { maxCount = counts[w]; chosenWord = w; } } await roomsCollection.doc(roomId).update({ status: 'discussing', turnEndTime: Date.now() + 30000, chosenWord: chosenWord, wordSelEndTime: null }); };
    const handleSkipTurn = async (forced = false) => { if (!room) return; if (!forced && room.currentTurnUID !== user?.uid) return; if (forced && room.status !== 'discussing') return; nextTurn(); };
    const nextTurn = async () => { if (!room) return; const activePlayers = room.players.filter(p => p.status === 'active'); const currentIndex = activePlayers.findIndex(p => p.uid === room.currentTurnUID); const nextIndex = (currentIndex + 1) % activePlayers.length; await roomsCollection.doc(roomId).update({ currentTurnUID: activePlayers[nextIndex].uid, turnEndTime: Date.now() + 30000 }); };
    const requestVoting = async () => { if (!room || room.status !== 'discussing') return; playSound('click'); if (room.admin === user?.uid) { await triggerVoting(); return; } await roomsCollection.doc(roomId).update({ votingRequest: { requestedBy: user.uid, votes: { [user.uid]: true } } }); };
    const agreeToVote = async () => { if (!room || !room.votingRequest) return; playSound('click'); const currentVotes = room.votingRequest.votes || {}; const newVotes = { ...currentVotes, [user.uid]: true }; const activePlayers = room.players.filter(p => p.status === 'active'); if (user?.uid === room.admin) { await triggerVoting(); return; } const agreeCount = Object.values(newVotes).filter(v => v === true).length; const majorityCount = Math.floor(activePlayers.length / 2) + 1; if (agreeCount >= majorityCount) { await triggerVoting(); } else { await roomsCollection.doc(roomId).update({ "votingRequest.votes": newVotes }); } };
    const declineVote = async () => { if (!room || !room.votingRequest) return; playSound('click'); const currentVotes = room.votingRequest.votes || {}; const newVotes = { ...currentVotes, [user.uid]: false }; const activePlayers = room.players.filter(p => p.status === 'active'); const declineCount = Object.values(newVotes).filter(v => v === false).length; const majorityCount = Math.floor(activePlayers.length / 2) + 1; if (declineCount >= majorityCount) { await roomsCollection.doc(roomId).update({ votingRequest: null }); } else { await roomsCollection.doc(roomId).update({ "votingRequest.votes": newVotes }); } };
    const triggerVoting = async () => { playSound('click'); const sysMsg = { sender: 'system', name: 'SYSTEM', text: t.votingStarted, time: Date.now() }; await roomsCollection.doc(roomId).update({ status: 'voting', currentTurnUID: null, turnEndTime: null, votingEndTime: Date.now() + 30000, messages: firebase.firestore.FieldValue.arrayUnion(sysMsg), votingRequest: null }); };
    const sendMessage = async (text) => { if (!text.trim() || !user) return; playSound('click'); const msg = { sender: user.uid, name: nickname, text: text, time: Date.now() }; await roomsCollection.doc(roomId).update({ messages: firebase.firestore.FieldValue.arrayUnion(msg) }); setChatMsg(''); };
    const submitVote = async (targetUID) => { if (!targetUID || !user || (room.votes && room.votes[user.uid])) return; playSound('click'); const voteUpdate = {}; voteUpdate[`votes.${user.uid}`] = targetUID; await roomsCollection.doc(roomId).update(voteUpdate); };
    const endVotingNow = async () => { if (room.admin !== user?.uid) return; await resolveVotes(true); };
    
    const resolveVotes = async (forced = false) => { 
        if (!room || room.status !== 'voting') return; 
        const freshSnap = await roomsCollection.doc(roomId).get(); const freshData = freshSnap.data(); if (freshData.status !== 'voting') return; 
        const activePlayers = freshData.players.filter(p => p.status === 'active'); const votes = freshData.votes || {}; const voteCounts = {}; 
        Object.values(votes).forEach(v => voteCounts[v] = (voteCounts[v] || 0) + 1); 
        let maxVotes = 0; let ejectedUID = null; let isTie = false; 
        for (const uid in voteCounts) { if (voteCounts[uid] > maxVotes) { maxVotes = voteCounts[uid]; ejectedUID = uid; isTie = false; } else if (voteCounts[uid] === maxVotes) { isTie = true; } } 
        const majorityNeeded = Math.floor(activePlayers.length / 2) + 1; 
        if (isTie || maxVotes < majorityNeeded) { 
            const nextRound = (freshData.currentRound || 1) + 1; 
            if (nextRound > MAX_ROUNDS) { await endGame(false); } 
            else { const firstPlayer = activePlayers.find(p => freshData.players.find(fp=>fp.uid===p.uid)?.role !== 'spy') || activePlayers[0]; await roomsCollection.doc(roomId).update({ status: 'word_selection', votes: {}, currentRound: nextRound, currentTurnUID: firstPlayer.uid, turnEndTime: null, votingEndTime: null, wordVotes: {}, chosenWord: null, wordSelEndTime: Date.now() + 30000 }); } 
        } else { 
            const newPlayers = freshData.players.map(p => { if (p.uid === ejectedUID) return { ...p, status: freshData.mode === 'advanced' && p.role !== 'spy' ? 'ghost' : 'spectator' }; return p; }); 
            const isSpy = ejectedUID === freshData.spyId; const mrWhite = freshData.players.find(p => p.role === 'mrwhite'); 
            if (mrWhite && ejectedUID === mrWhite.uid) { await endGame(false, true); await roomsCollection.doc(roomId).update({ players: newPlayers, finishedAt: firebase.firestore.FieldValue.serverTimestamp() }); } 
            else if (isSpy) { await updateGameStats(freshData.players, freshData.spyId, true); await roomsCollection.doc(roomId).update({ players: newPlayers, status: 'finished_spy_caught', finishedAt: firebase.firestore.FieldValue.serverTimestamp() }); } 
            else { 
                const remainingAgents = newPlayers.filter(p => p.status === 'active' && p.role !== 'spy'); 
                if (remainingAgents.length <= 1) { await endGame(false); await roomsCollection.doc(roomId).update({ players: newPlayers, finishedAt: firebase.firestore.FieldValue.serverTimestamp() }); } 
                else { const nextRound = (freshData.currentRound || 1) + 1; if (nextRound > MAX_ROUNDS) { await endGame(false); await roomsCollection.doc(roomId).update({ players: newPlayers, finishedAt: firebase.firestore.FieldValue.serverTimestamp() }); } 
                else { const firstPlayer = newPlayers.filter(p => p.status === 'active').find(p => p.role !== 'spy') || newPlayers.filter(p => p.status === 'active')[0]; await roomsCollection.doc(roomId).update({ players: newPlayers, status: 'word_selection', votes: {}, currentTurnUID: firstPlayer.uid, turnEndTime: null, votingEndTime: null, currentRound: nextRound, wordVotes: {}, chosenWord: null, wordSelEndTime: Date.now() + 30000 }); return; } } 
            } 
        } 
    };

    const updateGameStats = async (players, spyId, agentsWin) => { 
        const batch = db.batch(); const spyWin = !agentsWin;
        players.forEach(p => { 
            if(!p.uid) return; const userRef = usersCollection.doc(p.uid); const isWinner = (p.uid === spyId && spyWin) || (p.uid !== spyId && !spyWin); 
            batch.update(userRef, { 
                "stats.wins": firebase.firestore.FieldValue.increment(isWinner ? 1 : 0), 
                "stats.losses": firebase.firestore.FieldValue.increment(!isWinner ? 1 : 0), 
                "stats.xp": firebase.firestore.FieldValue.increment(isWinner ? 50 : 10), 
                "currency": firebase.firestore.FieldValue.increment(isWinner ? 50 : 10), 
                "charisma": firebase.firestore.FieldValue.increment(isWinner ? 100 : 20) 
            }); 
        }); 
        await batch.commit(); 
    };

    const endGame = async (agentsWin, mrWhiteWin = false) => { 
        let status = agentsWin ? 'finished_spy_caught' : 'finished_spy_wins'; 
        if(mrWhiteWin) status = 'finished_mrwhite_wins'; 
        await roomsCollection.doc(roomId).update({ status, turnEndTime: null, votingEndTime: null, finishedAt: firebase.firestore.FieldValue.serverTimestamp() }); 
    };
    
    const resetGame = async () => { 
        playSound('click'); 
        await roomsCollection.doc(roomId).update({ 
            status: 'waiting', scenario: null, spyId: null, currentTurnUID: null, currentRound: 0, 
            votes: {}, messages: [], votingEndTime: null, turnEndTime: null, 
            players: room.players.map(p => ({ uid: p.uid, name: p.name, status: 'active', photo: p.photo, role: null })), 
            wordVotes: {}, chosenWord: null, wordSelEndTime: null, votingRequest: null, startedAt: null, finishedAt: null, summaryShown: false 
        }); 
        setShowSummary(false); 
    };

    // ==========================================
    // FRIEND FUNCTIONS
    // ==========================================
    const openProfile = (uid) => { if(!uid) return; setTargetProfileUID(uid); setShowUserProfile(true); setShowDropdown(false); };
    const openChat = (friend) => { setChatFriend(friend); setShowChat(true); const cId = getChatId(user.uid, friend.uid); setOpenChatId(cId); };
    const closeChat = () => { setShowChat(false); setChatFriend(null); setOpenChatId(null); };
    const handleSendRequest = async (targetUid) => { if (!targetUid || isGuest) return; if (userData.friends?.includes(targetUid)) return; await usersCollection.doc(targetUid).update({ friendRequests: firebase.firestore.FieldValue.arrayUnion(user.uid) }); setNotification(t.requestSent); };
    const handleSearchRequest = async () => { if (!addFriendId || addFriendId === userData.customId || isGuest) return; const snap = await usersCollection.where('customId', '==', addFriendId).get(); if (snap.empty) { setFriendSearchMsg(t.friendNotFound); return; } const friendDoc = snap.docs[0]; const friendUid = friendDoc.id; if (userData.friends?.includes(friendUid)) { setFriendSearchMsg("Already friends!"); return; } if (userData.friendRequests?.includes(friendUid)) { setFriendSearchMsg("Request already pending!"); return; } await usersCollection.doc(friendUid).update({ friendRequests: firebase.firestore.FieldValue.arrayUnion(user.uid) }); setFriendSearchMsg(t.requestSent); setAddFriendId(''); setNotification(t.requestSent); };
    const handleAcceptRequest = async (fromUid) => { const batch = db.batch(); const currentUserRef = usersCollection.doc(user.uid); batch.update(currentUserRef, { friends: firebase.firestore.FieldValue.arrayUnion(fromUid), friendRequests: firebase.firestore.FieldValue.arrayRemove(fromUid) }); const senderRef = usersCollection.doc(fromUid); batch.update(senderRef, { friends: firebase.firestore.FieldValue.arrayUnion(user.uid) }); await batch.commit(); setNotification(t.newFriend); };
    const handleRejectRequest = async (fromUid) => { await usersCollection.doc(user.uid).update({ friendRequests: firebase.firestore.FieldValue.arrayRemove(fromUid) }); };

    // ==========================================
    // GIFT FUNCTIONS - FIXED
    // Only sender gets charisma when BUYING gift
    // Both get charisma when SENDING gift
    // ==========================================
    
    // Use gift from inventory
    const handleUseGiftFromInventory = async (gift, targetFriend) => {
        if (!gift || !targetFriend) return;
        
        const inventory = userData.inventory || { gifts: [] };
        const giftIndex = (inventory.gifts || []).findIndex(g => g.id === gift.id);
        
        if (giftIndex < 0) return;
        
        const charismaGain = gift.charisma;
        
        try {
            // Decrease gift count in sender's inventory
            const newInventory = { ...inventory };
            if (newInventory.gifts[giftIndex].count > 1) {
                newInventory.gifts[giftIndex].count -= 1;
            } else {
                newInventory.gifts = newInventory.gifts.filter((_, i) => i !== giftIndex);
            }
            
            // Update sender: decrease inventory, add charisma
            await usersCollection.doc(user.uid).update({
                inventory: newInventory,
                charisma: firebase.firestore.FieldValue.increment(charismaGain)
            });
            
            // Update receiver: add charisma only
            await usersCollection.doc(targetFriend.uid).update({
                charisma: firebase.firestore.FieldValue.increment(charismaGain)
            });
            
            // Send notification to receiver
            await chatsCollection.doc(getChatId(user.uid, targetFriend.uid)).collection('messages').add({
                senderId: user.uid,
                senderName: userData.displayName,
                text: `${gift.emoji} ${lang === 'ar' ? gift.name_ar : gift.name_en}`,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                type: 'gift',
                giftId: gift.id
            });
            
            await chatsCollection.doc(getChatId(user.uid, targetFriend.uid)).set({
                members: [user.uid, targetFriend.uid],
                lastMessage: `🎁 ${t.giftSent}`,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                [`unread.${targetFriend.uid}`]: firebase.firestore.FieldValue.increment(1)
            }, { merge: true });
            
            playSound('gift');
            setNotification(`${t.giftSent} +${formatCharisma(charismaGain)} ✨`);
        } catch (error) {
            console.error("Use gift error:", error);
        }
    };
    
    // Send gift directly (from profile or gift modal) - FIX: Only add charisma ONCE per person
    const handleSendGiftToUser = async (gift, targetUser) => {
        const currency = userData?.currency || 0;
        if (currency < gift.cost) return;
        
        const cashbackAmount = Math.floor(gift.cost * (gift.cashback / 100));
        const newCurrency = currency - gift.cost + cashbackAmount;
        const charismaGain = gift.charisma;
        
        try {
            // Update sender: decrease currency, ADD charisma (for sending)
            await usersCollection.doc(user.uid).update({
                currency: newCurrency,
                charisma: firebase.firestore.FieldValue.increment(charismaGain)
            });
            
            // Update receiver: ADD charisma (for receiving)
            await usersCollection.doc(targetUser.uid).update({
                charisma: firebase.firestore.FieldValue.increment(charismaGain)
            });
            
            playSound('gift');
            setNotification(`${t.giftSent} +${formatCharisma(charismaGain)} ✨`);
        } catch (error) {
            console.error("Gift error:", error);
        }
    };

    // ==========================================
    // COMPUTED VALUES
    // ==========================================
    const isMyTurn = room?.currentTurnUID === user?.uid;
    const me = room?.players?.find(p => p.uid === user?.uid);
    const myRole = me?.role;
    const isSpectator = me?.status === 'spectator' || me?.status === 'ghost';
    const hasVoted = room?.votes?.[user?.uid];
    const hasVotedWord = room?.wordVotes?.[user?.uid];
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
    // RENDER
    // ==========================================
    return (
        <div className="min-h-screen flex flex-col items-center p-2 md:p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}> 
            <canvas id="bg-canvas"></canvas>
            
            <NotificationToast message={notification} onClose={() => setNotification(null)} />
            <TutorialModal show={showTutorial} onClose={() => { setShowTutorial(false); localStorage.setItem('pro_spy_tutorial_v2', 'true'); }} lang={lang} />
            <MatchSummaryModal show={showSummary} onClose={() => setShowSummary(false)} room={room} players={room?.players} lang={lang} />
            <ShopModal 
                show={showShop} 
                onClose={() => setShowShop(false)} 
                userData={userData} 
                lang={lang} 
                onUpdate={() => {}} 
                friends={friendsData}
                onUseGift={handleUseGiftFromInventory}
            />
            
            {alertMessage && ( 
                <div className="alert-modal" onClick={() => setAlertMessage(null)}> 
                    <div className="glass-panel rounded-xl p-4 w-full max-w-xs animate-pop text-center border border-pink-500 relative" onClick={e => e.stopPropagation()}> 
                        <button onClick={() => setAlertMessage(null)} className="absolute top-2 right-2 text-gray-400 hover:text-white text-lg">&times;</button>
                        <div className="text-2xl mb-2">🚫</div> 
                        <p className="font-bold mb-2">{alertMessage}</p> 
                        <button onClick={() => setAlertMessage(null)} className="btn-ghost px-4 py-1 rounded border border-white/20 text-xs">{t.ok}</button> 
                    </div> 
                </div> 
            )}
            
            {/* Setup Modal */}
            {showSetupModal && ( 
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-2" onClick={()=>setShowSetupModal(false)}> 
                    <div className="glass-panel rounded-xl p-4 w-full max-w-sm animate-pop relative" onClick={e => e.stopPropagation()}> 
                        <button onClick={()=>setShowSetupModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl">&times;</button>
                        <h2 className="text-lg font-bold text-primary mb-3">{t.create}</h2> 
                        <div className="space-y-3"> 
                            <div> 
                                <label className="text-[10px] text-gray-400 block mb-1">{t.nickname}</label> 
                                <input 
                                    className={`${isLoggedIn ? 'input-locked' : 'input-dark'} w-full p-2 rounded font-bold text-sm`} 
                                    value={nickname} 
                                    onChange={e => { setNickname(e.target.value); localStorage.setItem('pro_spy_nick', e.target.value); }} 
                                    disabled={isLoggedIn} 
                                /> 
                            </div> 
                            <div className="grid grid-cols-2 gap-2"> 
                                <button onClick={() => setSetupMode('normal')} className={`p-2 rounded-lg border-2 text-xs ${setupMode === 'normal' ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10'}`}>
                                    <div className="font-bold">{t.normalMode}</div>
                                    <div className="text-[8px] text-gray-400">{t.modeNormalDesc}</div>
                                </button> 
                                <button onClick={() => setSetupMode('advanced')} className={`p-2 rounded-lg border-2 text-xs ${setupMode === 'advanced' ? 'border-purple-400 bg-purple-500/10' : 'border-white/10'}`}>
                                    <div className="font-bold">{t.advancedMode}</div>
                                    <div className="text-[8px] text-gray-400">{t.modeAdvDesc}</div>
                                </button> 
                            </div> 
                            <div className="flex items-center gap-2"> 
                                <input type="checkbox" id="privateCheck" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="w-3 h-3"/> 
                                <label htmlFor="privateCheck" className="text-xs">{t.privateRoom}</label> 
                            </div> 
                            {isPrivate && ( 
                                <div className="relative">
                                    <input 
                                        className="input-dark w-full p-2 rounded text-xs pr-8" 
                                        placeholder={t.password} 
                                        value={password} 
                                        onChange={e => setPassword(e.target.value)}
                                        type={showPwd ? "text" : "password"}
                                    /> 
                                    <button 
                                        type="button"
                                        onClick={() => setShowPwd(!showPwd)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showPwd ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            )} 
                            <button onClick={handleCreateGame} disabled={loading || !nickname} className="btn-neon w-full py-2 rounded-lg font-bold text-sm">{loading ? t.loading : t.create}</button> 
                        </div> 
                    </div> 
                </div> 
            )}
            
            {/* MyAccount Page */}
            {showMyAccount && (
                <MyAccountPage 
                    show={showMyAccount} 
                    onClose={() => setShowMyAccount(false)} 
                    userData={userData} 
                    user={user} 
                    lang={lang} 
                    onUpdate={async () => {
                        if(user){
                            const d = await usersCollection.doc(user.uid).get();
                            setUserData(d.data());
                        }
                    }} 
                />
            )}
            
            {/* User Profile Modal */}
            <UserProfileModal 
                show={showUserProfile} 
                onClose={() => setShowUserProfile(false)} 
                targetUID={targetProfileUID} 
                lang={lang} 
                onSendRequest={handleSendRequest} 
                isFriend={userData?.friends?.includes(targetProfileUID)} 
                currentUserData={userData} 
                onSendGift={handleSendGiftToUser} 
            />
            
            {/* Private Chat Modal */}
            <PrivateChatModal 
                show={showChat} 
                onClose={closeChat} 
                friendData={chatFriend} 
                currentUser={userData} 
                lang={lang} 
                roomId={roomId} 
                onJoinInvite={(id) => handleJoinGame(id, '')}
                onSendGift={handleSendGiftToUser}
            />
            
            {/* Lobby Browser */}
            <LobbyBrowserModal 
                show={showLobby} 
                onClose={() => setShowLobby(false)} 
                lang={lang} 
                onJoinRoom={(id, pwd) => handleJoinGame(id, pwd)} 
                password={password}
                setPassword={setPassword}
                showPwd={showPwd}
                setShowPwd={setShowPwd}
                isPrivate={isPrivate}
            />
            
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
                    <div className="logo-container"> 
                        <div className="logo-border"></div> 
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"> <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/> </svg> 
                    </div> 
                    <div> 
                        <h1 className="game-title text-lg">{t.appName}</h1> 
                        <p className="text-[8px] text-gray-500 tracking-widest font-tech hidden md:block">{t.tagline}</p> 
                    </div> 
                </div> 
                <nav className="hidden md:flex gap-1 glass-panel rounded-full p-1 items-center text-xs"> 
                    <button onClick={() => setActiveView('lobby')} className={`nav-tab rounded-full ${activeView === 'lobby' ? 'active' : ''}`}>{t.tabLobby}</button> 
                    <button onClick={() => setActiveView('leaderboard')} className={`nav-tab rounded-full ${activeView === 'leaderboard' ? 'active' : ''}`}>{t.tabLeaderboard}</button> 
                    <button onClick={() => setActiveView('friends')} className={`nav-tab rounded-full relative ${activeView === 'friends' ? 'active' : ''}`}> {t.tabFriends} {totalUnread > 0 && <span className="notification-badge text-[8px]">{totalUnread}</span>} </button> 
                </nav> 
                <div className="flex gap-1 items-center">
                    <a href="https://guessmycard.mooo.info/" target="_blank" rel="noopener noreferrer" className="btn-ghost px-2 py-1 rounded text-[10px] font-bold border-gray-700 hover:text-pink-400 hover:border-pink-400 hidden sm:block">{t.linkGuessCard}</a>
                    <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="btn-ghost px-2 py-1 rounded text-[10px] font-bold border-gray-700">{t.langBtn}</button>
                    <div className="relative"> 
                        {isLoggedIn ? ( 
                            <> 
                                <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-1 btn-ghost px-2 py-1 rounded-full border-gray-700"> 
                                    <img src={userData?.photoURL || `https://ui-avatars.com/api/?name=${userData?.displayName}`} className="w-5 h-5 rounded-full" alt=""/> 
                                    <span className="text-[10px] font-bold hidden lg:block">{t.myAccount}</span> 
                                </button> 
                                {showDropdown && ( 
                                    <div className="dropdown-menu glass-panel rounded-lg py-1 animate-fade-in text-xs"> 
                                        <button onClick={() => { setShowMyAccount(true); setShowDropdown(false); }} className="w-full text-right px-3 py-1 hover:bg-white/10">{t.profile}</button> 
                                        <button onClick={() => { setShowShop(true); setShowDropdown(false); }} className="w-full text-right px-3 py-1 hover:bg-white/10">{t.shop}</button>
                                        <button onClick={handleLogout} className="w-full text-right px-3 py-1 text-red-400 hover:bg-white/10">{t.logout}</button> 
                                    </div> 
                                )} 
                            </> 
                        ) : ( 
                            <button onClick={handleGoogleLogin} className="btn-google px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"> 
                                <svg className="w-3 h-3" viewBox="0 0 21 20" fill="none"><path d="M20.3087 10.2242C20.3087 9.46273 20.2446 8.74991 20.1273 8.08594H10.5V11.9392H15.9715C15.7353 13.1916 15.0216 14.2518 13.9444 14.9582V17.4635H17.2543C19.1883 15.7262 20.3087 13.1977 20.3087 10.2242Z" fill="#4285F4"/><path d="M10.5 19.875C13.1617 19.875 15.3983 18.9749 17.2545 17.4636L13.9446 14.9582C12.9389 15.6222 11.7015 16.0092 10.5 16.0092C7.93332 16.0092 5.72548 14.2615 4.93682 11.9136H1.51758V14.4934C3.3629 18.0879 7.13889 19.875 10.5 19.875Z" fill="#34A853"/><path d="M4.93672 11.9136C4.73672 11.2496 4.62266 10.5469 4.62266 9.82357C4.62266 9.10026 4.73672 8.39751 4.93672 7.73354V5.15375H1.51748C0.774766 6.61518 0.351562 8.20361 0.351562 9.82357C0.351562 11.4435 0.774766 13.0319 1.51748 14.4934L4.93672 11.9136Z" fill="#FBBC05"/><path d="M10.5 3.63864C11.8379 3.63864 13.0392 4.09256 13.9864 4.98477L17.3199 1.65131C15.3941 -0.131629 13.1575 -0.124985 10.5 -0.124985C7.13889 -0.124985 3.3629 1.66216 1.51758 5.25668L4.93682 7.83647C5.72548 5.48861 7.93332 3.63864 10.5 3.63864Z" fill="#EA4335"/></svg> 
                                {t.loginGoogle} 
                            </button> 
                        )} 
                    </div> 
                </div> 
            </header>
            
            {/* Mobile Nav */}
            <nav className="md:hidden w-full max-w-4xl flex justify-around glass-panel rounded-lg p-1 mb-2 text-[10px]"> 
                <button onClick={() => setActiveView('lobby')} className={`nav-tab flex-1 text-center ${activeView === 'lobby' ? 'active' : ''}`}>{t.tabLobby}</button> 
                <button onClick={() => setActiveView('leaderboard')} className={`nav-tab flex-1 text-center ${activeView === 'leaderboard' ? 'active' : ''}`}>{t.tabLeaderboard}</button> 
                <button onClick={() => setActiveView('friends')} className={`nav-tab flex-1 text-center relative ${activeView === 'friends' ? 'active' : ''}`}> {t.tabFriends} {totalUnread > 0 && <span className="notification-badge text-[8px]">{totalUnread}</span>} </button> 
            </nav>
            
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
                        {isGuest ? (<div className="text-center py-6"><p className="text-gray-400 text-xs">{t.noPermission}</p></div>) : ( 
                            <> 
                                <div className="flex gap-1"> 
                                    <input className="input-dark flex-1 p-1 rounded text-xs" placeholder={t.friendIdPlaceholder} value={addFriendId} onChange={e => setAddFriendId(e.target.value)} /> 
                                    <button onClick={handleSearchRequest} className="btn-neon px-2 rounded text-[10px]">{t.addFriend}</button> 
                                </div> 
                                {friendSearchMsg && <div className="text-[10px] text-center text-cyan-400">{friendSearchMsg}</div>} 
                                {friendRequests.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 mb-1">{t.incomingRequests}</h3>
                                        {friendRequests.map(req => (
                                            <div key={req.id} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg mb-1">
                                                <img src={req.photoURL} className="w-6 h-6 rounded-full"/>
                                                <span className="flex-1 text-xs">{req.displayName}</span>
                                                <button onClick={() => handleAcceptRequest(req.id)} className="btn-success px-2 py-1 rounded text-[10px]">{t.accept}</button>
                                                <button onClick={() => handleRejectRequest(req.id)} className="btn-danger px-2 py-1 rounded text-[10px]">{t.reject}</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <h3 className="text-xs font-bold text-gray-400">{t.tabFriends} ({friendsData.length})</h3>
                                <div className="space-y-1 max-h-60 overflow-y-auto">
                                    {friendsData.length === 0 ? (
                                        <p className="text-center text-gray-500 text-xs py-4">{t.noFriends}</p>
                                    ) : (
                                        sortedFriends.map(friend => {
                                            const chatMeta = chatsMeta[getChatId(user?.uid, friend.uid)];
                                            const unreadCount = chatMeta?.unread?.[user.uid] || 0;
                                            const isOnline = friend.lastActive && (Date.now() - friend.lastActive.toMillis() < 120000);
                                            return (
                                                <div key={friend.id} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg relative">
                                                    <img 
                                                        src={friend.photoURL} 
                                                        className="w-8 h-8 rounded-full cursor-pointer" 
                                                        onClick={() => openProfile(friend.id)}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs font-medium truncate">{friend.displayName}</span>
                                                            <span className={isOnline ? 'status-online' : 'status-offline'}></span>
                                                        </div>
                                                        <div className="text-[10px] text-gray-400">✨ {formatCharisma(friend.charisma || 0)}</div>
                                                    </div>
                                                    {unreadCount > 0 && <span className="friend-unread-badge">{unreadCount}</span>}
                                                    <button onClick={() => openChat(friend)} className="btn-ghost px-2 py-1 rounded text-[10px]">💬</button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </> 
                        )} 
                    </div> 
                )}
                
                {/* Lobby View */}
                {activeView === 'lobby' && !room && (
                    <div className="md:col-span-3 glass-panel rounded-xl p-4 animate-fade-in">
                        {isGuest && <GuestBanner lang={lang} />}
                        
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] text-gray-400 block mb-1">{t.nickname}</label>
                                <input
                                    className={`${isLoggedIn ? 'input-locked' : 'input-dark'} w-full p-2 rounded font-bold text-sm`}
                                    value={nickname}
                                    onChange={e => { setNickname(e.target.value); localStorage.setItem('pro_spy_nick', e.target.value); }}
                                    disabled={isLoggedIn}
                                />
                            </div>
                            
                            <div className="flex gap-2">
                                <button onClick={() => setShowSetupModal(true)} disabled={!nickname.trim()} className="btn-neon flex-1 py-3 rounded-lg font-bold text-sm">{t.create}</button>
                                <button onClick={() => setShowLobby(true)} className="btn-ghost px-4 py-3 rounded-lg text-sm">{t.browse}</button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <input
                                    className="input-dark flex-1 p-2 rounded text-center font-mono uppercase tracking-wider text-sm"
                                    value={inputCode}
                                    onChange={e => setInputCode(e.target.value.toUpperCase())}
                                    placeholder={t.codePlaceholder}
                                    maxLength={6}
                                />
                                <button
                                    onClick={() => handleJoinGame(inputCode, '')}
                                    disabled={loading || !inputCode.trim() || !nickname.trim()}
                                    className="btn-neon px-4 py-2 rounded-lg font-bold text-sm"
                                >
                                    {loading ? '...' : t.join}
                                </button>
                            </div>
                            
                            {joinError && <p className="text-xs text-red-400 text-center">{joinError}</p>}
                        </div>
                    </div>
                )}
                
                {/* Game Room */}
                {room && (
                    <div className="md:col-span-3 glass-panel rounded-xl p-4">
                        {/* Room Header */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleCopy()} className="bg-white/10 px-2 py-1 rounded text-xs font-mono">
                                    {copied ? t.copied : roomId}
                                </button>
                                {room.isPrivate && <span className="text-[10px] text-yellow-400">🔒 {room.password}</span>}
                            </div>
                            <div className="text-xs text-gray-400">{t.roundsFormat(room.currentRound || 0, MAX_ROUNDS)}</div>
                        </div>
                        
                        {/* Waiting Room */}
                        {room.status === 'waiting' && (
                            <div>
                                <h3 className="text-sm font-bold mb-3 text-center">{t.lobbyTitle}</h3>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {room.players.map(p => (
                                        <div 
                                            key={p.uid} 
                                            className="player-card flex items-center gap-2"
                                            onClick={() => openProfile(p.uid)}
                                        >
                                            <img src={p.photo} className="w-8 h-8 rounded-full"/>
                                            <span className="text-xs truncate">{p.name}</span>
                                            {p.uid === room.admin && <span className="text-[8px] bg-yellow-500/20 text-yellow-400 px-1 rounded">HOST</span>}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    {room.admin === user?.uid ? (
                                        <button onClick={startGame} className="btn-neon flex-1 py-2 rounded-lg text-sm font-bold">{t.start}</button>
                                    ) : (
                                        <p className="text-xs text-gray-400 text-center flex-1">{t.waiting}</p>
                                    )}
                                    <button onClick={() => handleLeaveRoom()} className="btn-danger px-4 py-2 rounded-lg text-sm">{t.leaveRoom}</button>
                                </div>
                            </div>
                        )}
                        
                        {/* Word Selection */}
                        {room.status === 'word_selection' && !isSpectator && (
                            <div>
                                <h3 className="text-sm font-bold mb-2 text-center">{t.wordSelectionTitle}</h3>
                                <div className="text-center text-xs text-yellow-400 mb-3">⏱️ {wordSelTimer}s</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {(lang === 'ar' ? room.scenario?.words_ar : room.scenario?.words_en)?.map((word, i) => (
                                        <button
                                            key={i}
                                            onClick={() => submitWordVote(word)}
                                            className={`word-vote-card ${hasVotedWord === word ? 'selected' : ''}`}
                                        >
                                            <span className="font-bold">{word}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Discussion */}
                        {room.status === 'discussing' && (
                            <div>
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    {room.players.filter(p => p.status === 'active').map(p => (
                                        <div
                                            key={p.uid}
                                            className={`player-card ${room.currentTurnUID === p.uid ? 'active' : ''}`}
                                            onClick={() => openProfile(p.uid)}
                                        >
                                            <img src={p.photo} className="w-6 h-6 rounded-full"/>
                                            <span className="text-[10px] truncate">{p.name}</span>
                                            {room.currentTurnUID === p.uid && <span className="text-[8px] text-primary">Speaking</span>}
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Identity */}
                                {!isSpectator && me && (
                                    <div className={`identity-square identity-${myRole === 'spy' ? 'spy' : myRole === 'mrwhite' ? 'mrwhite' : myRole === 'informant' ? 'informant' : 'agent'}`}>
                                        <div className="text-4xl mb-2">
                                            {myRole === 'spy' ? '🕵️' : myRole === 'mrwhite' ? '👻' : myRole === 'informant' ? '👁️' : '🤵'}
                                        </div>
                                        <div className="text-lg font-bold">
                                            {myRole === 'spy' ? t.statusSpy : myRole === 'mrwhite' ? t.statusMrWhite : myRole === 'informant' ? t.statusInformant : t.statusAgent}
                                        </div>
                                        {myRole === 'spy' && (
                                            <div className="text-xs text-gray-300 mt-1">{t.location}: {lang === 'ar' ? room.scenario?.loc_ar : room.scenario?.loc_en}</div>
                                        )}
                                        {myRole !== 'spy' && room.chosenWord && (
                                            <div className="text-xs text-gray-300 mt-1">{t.selectedWord}: {room.chosenWord}</div>
                                        )}
                                    </div>
                                )}
                                
                                {/* Timer & Actions */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="timer-bar-container">
                                        <div className="timer-bar-fill" style={{ width: `${(turnTimer / 30) * 100}%` }}></div>
                                    </div>
                                    <span className="text-xs text-gray-400">{turnTimer}s</span>
                                </div>
                                
                                <div className="flex gap-2">
                                    {isMyTurn && <button onClick={() => handleSkipTurn()} className="btn-ghost flex-1 py-2 rounded-lg text-xs">{t.skip}</button>}
                                    <button onClick={requestVoting} className="btn-vote flex-1 py-2 rounded-lg text-xs font-bold">{t.vote}</button>
                                </div>
                            </div>
                        )}
                        
                        {/* Voting */}
                        {room.status === 'voting' && (
                            <div>
                                <h3 className="text-sm font-bold mb-2 text-center">{t.vote}</h3>
                                <div className="text-center text-xs text-yellow-400 mb-3">⏱️ {votingTimer}s</div>
                                
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {room.players.filter(p => p.status === 'active').map(p => (
                                        <button
                                            key={p.uid}
                                            onClick={() => submitVote(p.uid)}
                                            disabled={hasVoted}
                                            className={`player-card ${hasVoted === p.uid ? 'border-primary bg-primary/10' : ''}`}
                                        >
                                            <img src={p.photo} className="w-6 h-6 rounded-full"/>
                                            <span className="text-xs truncate">{p.name}</span>
                                        </button>
                                    ))}
                                </div>
                                
                                {room.admin === user?.uid && (
                                    <button onClick={endVotingNow} className="btn-danger w-full py-2 rounded-lg text-xs">{t.endVoting}</button>
                                )}
                            </div>
                        )}
                        
                        {/* Finished */}
                        {room.status?.includes('finished') && (
                            <div className="text-center">
                                <div className="text-4xl mb-4">
                                    {room.status === 'finished_spy_caught' ? '🎉' : room.status === 'finished_mrwhite_wins' ? '👻' : '🕵️'}
                                </div>
                                <h2 className="text-xl font-bold mb-4">
                                    {room.status === 'finished_spy_caught' ? t.agentsWin : room.status === 'finished_mrwhite_wins' ? t.mrWhiteWin : t.spyWin}
                                </h2>
                                
                                {room.admin === user?.uid && (
                                    <button onClick={resetGame} className="btn-neon w-full py-2 rounded-lg text-sm font-bold">{t.playAgain}</button>
                                )}
                                <button onClick={() => handleLeaveRoom()} className="btn-ghost w-full py-2 rounded-lg text-sm mt-2">{t.leaveRoom}</button>
                            </div>
                        )}
                    </div>
                )}
            </main>
            
            {/* Click outside to close dropdown */}
            {showDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>}
        </div>
    );
}

// MyAccountPage Component
function MyAccountPage({ show, onClose, userData, user, lang, onUpdate }) {
    const t = TRANSLATIONS[lang];
    const [newName, setNewName] = useState('');
    const [msg, setMsg] = useState('');
    
    useEffect(() => {
        if (show && userData) setNewName(userData.displayName || '');
    }, [show, userData]);
    
    if (!show || !userData) return null;
    
    const level = calculateLevel(userData.stats?.xp || 0);
    const wins = userData.stats?.wins || 0;
    const losses = userData.stats?.losses || 0;
    const charisma = userData.charisma || 0;
    const totalGames = wins + losses;
    
    const canChangeName = !userData.lastChangedName || (Date.now() - (userData.lastChangedName.toMillis ? userData.lastChangedName.toMillis() : 0) > 30 * 24 * 60 * 60 * 1000);
    
    const handleSaveName = async () => {
        if (!newName.trim()) return;
        if (!canChangeName) return;
        await usersCollection.doc(user.uid).update({ displayName: newName, lastChangedName: firebase.firestore.FieldValue.serverTimestamp() });
        setMsg(t.copied);
        setTimeout(() => setMsg(''), 2000);
        if (onUpdate) onUpdate();
    };
    
    const equippedTitle = userData.equipped?.titles ? SHOP_ITEMS.titles.find(i => i.id === userData.equipped.titles) : null;
    const frameItem = userData.equipped?.frames ? SHOP_ITEMS.frames.find(f => f.id === userData.equipped.frames) : null;
    const isFrameUrl = frameItem?.preview?.startsWith('http');
    const avatarSize = 64;
    const frameScale = 1.25;
    
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="glass-panel rounded-2xl p-5 w-full max-w-sm animate-pop relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl">&times;</button>
                
                <div className="text-center mb-4">
                    <div className="relative inline-block mb-2" style={{ width: avatarSize, height: avatarSize }}>
                        {isFrameUrl && frameItem && (
                            <img src={frameItem.preview} className="absolute pointer-events-none z-20 rounded-full" style={{ width: avatarSize * frameScale, height: avatarSize * frameScale, top: -(avatarSize * (frameScale - 1) / 2), left: -(avatarSize * (frameScale - 1) / 2) }} alt="" />
                        )}
                        {!isFrameUrl && frameItem && (
                            <div className="absolute rounded-full z-0" style={{ width: avatarSize * frameScale, height: avatarSize * frameScale, top: -(avatarSize * (frameScale - 1) / 2), left: -(avatarSize * (frameScale - 1) / 2), background: frameItem.preview, padding: 3 }}>
                                <div className="w-full h-full rounded-full bg-gray-900"></div>
                            </div>
                        )}
                        <img src={userData.photoURL || `https://ui-avatars.com/api/?name=${userData.displayName}`} className="relative z-10 rounded-full" style={{ width: avatarSize, height: avatarSize }} alt=""/>
                    </div>
                    
                    {equippedTitle && <div className="text-[10px] text-primary mb-1">{lang === 'ar' ? equippedTitle.name_ar : equippedTitle.name_en}</div>}
                    <h2 className="text-lg font-bold">{userData.displayName}</h2>
                    <div className="text-[10px] text-gray-400">ID: #{userData.customId}</div>
                </div>
                
                {/* Charisma - Shows actual number */}
                <CharismaBar charisma={charisma} lang={lang} />
                
                <KDCircle wins={wins} losses={losses} lang={lang} />
                
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="bg-black/30 p-2 rounded-lg text-center">
                        <div className="text-gray-400">{t.level}</div>
                        <div className="text-lg font-bold text-primary">{level}</div>
                    </div>
                    <div className="bg-black/30 p-2 rounded-lg text-center">
                        <div className="text-gray-400">{t.totalGames}</div>
                        <div className="text-lg font-bold">{totalGames}</div>
                    </div>
                    <div className="bg-black/30 p-2 rounded-lg text-center">
                        <div className="text-gray-400">{t.wins}</div>
                        <div className="text-lg font-bold text-green-400">{wins}</div>
                    </div>
                    <div className="bg-black/30 p-2 rounded-lg text-center">
                        <div className="text-gray-400">{t.losses}</div>
                        <div className="text-lg font-bold text-red-400">{losses}</div>
                    </div>
                </div>
                
                {/* Change Name */}
                <div className="mb-3">
                    <label className="text-[10px] text-gray-400 block mb-1">{t.changeName}</label>
                    <div className="flex gap-2">
                        <input
                            className="input-dark flex-1 p-2 rounded text-xs"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            disabled={!canChangeName}
                        />
                        <button onClick={handleSaveName} disabled={!canChangeName || !newName.trim()} className="btn-neon px-3 rounded text-xs">{t.save}</button>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">
                        {canChangeName ? t.canChangeNow : `${t.nameChangeCountdown}: ${getTimeRemaining(userData.lastChangedName)}`}
                    </div>
                </div>
                
                {msg && <div className="text-center text-xs text-cyan-400">{msg}</div>}
                
                <button onClick={() => { setShowShop(true); onClose(); }} className="btn-gold w-full py-2 rounded-lg text-sm font-bold">{t.shop}</button>
            </div>
        </div>
    );
}

// LobbyBrowserModal Component
function LobbyBrowserModal({ show, onClose, lang, onJoinRoom, password, setPassword, showPwd, setShowPwd, isPrivate }) {
    const t = TRANSLATIONS[lang];
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joinPwd, setJoinPwd] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);
    
    useEffect(() => {
        if (show) {
            setLoading(true);
            const appId = 'pro_spy_v25_final_fix_complete';
            const roomsCollection = firebase.firestore().collection('artifacts').doc(appId).collection('public').doc('data').collection('rooms');
            roomsCollection.where('status', '==', 'waiting').get().then(snap => {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => !r.isPrivate || r.password);
                setRooms(data);
                setLoading(false);
            });
        }
    }, [show]);
    
    if (!show) return null;
    
    const handleJoin = (room) => {
        if (room.isPrivate) {
            setSelectedRoom(room);
        } else {
            onJoinRoom(room.id, '');
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="glass-panel rounded-xl p-4 w-full max-w-md animate-pop relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl">&times;</button>
                <h2 className="text-lg font-bold mb-3">{t.browse}</h2>
                
                {loading ? (
                    <div className="text-center py-8 text-gray-400">{t.loading}</div>
                ) : rooms.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">{t.noRooms}</div>
                ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {rooms.map(r => (
                            <div key={r.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                                <div>
                                    <div className="font-mono text-sm">{r.id}</div>
                                    <div className="text-[10px] text-gray-400">{r.players?.length || 0} {t.players} | {r.mode === 'advanced' ? '⚔️' : '🎯'}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {r.isPrivate && <span className="text-yellow-400">🔒</span>}
                                    <button onClick={() => handleJoin(r)} className="btn-neon px-3 py-1 rounded text-xs">{t.join}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Password Modal for private room */}
                {selectedRoom && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110]" onClick={() => setSelectedRoom(null)}>
                        <div className="glass-panel rounded-xl p-4 w-72 animate-pop" onClick={e => e.stopPropagation()}>
                            <h3 className="text-sm font-bold mb-2">{t.privateRoom}</h3>
                            <div className="relative mb-2">
                                <input
                                    type={showPwd ? "text" : "password"}
                                    className="input-dark w-full p-2 rounded text-xs pr-8"
                                    placeholder={t.password}
                                    value={joinPwd}
                                    onChange={e => setJoinPwd(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd(!showPwd)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    {showPwd ? '🙈' : '👁️'}
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setSelectedRoom(null)} className="btn-ghost flex-1 py-2 rounded text-xs">{t.reportCancel}</button>
                                <button onClick={() => { onJoinRoom(selectedRoom.id, joinPwd); setSelectedRoom(null); }} className="btn-neon flex-1 py-2 rounded text-xs">{t.join}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// PrivateChatModal Component
function PrivateChatModal({ show, onClose, friendData, currentUser, lang, roomId, onJoinInvite, onSendGift }) {
    const t = TRANSLATIONS[lang];
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [showSendGift, setShowSendGift] = useState(false);
    const messagesEndRef = useRef(null);
    
    const appId = 'pro_spy_v25_final_fix_complete';
    const chatsCollection = firebase.firestore().collection('artifacts').doc(appId).collection('public').doc('data').collection('private_chats');
    
    useEffect(() => {
        if (show && currentUser && friendData) {
            const chatId = getChatId(currentUser.uid, friendData.uid);
            const unsub = chatsCollection.doc(chatId).collection('messages').orderBy('timestamp', 'desc').limit(100).onSnapshot(snap => {
                const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
                setMessages(msgs);
                // Mark as read
                chatsCollection.doc(chatId).update({ [`unread.${currentUser.uid}`]: 0 });
            });
            return unsub;
        }
    }, [show, currentUser, friendData]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleSend = async () => {
        if (!newMsg.trim() || !currentUser || !friendData) return;
        const chatId = getChatId(currentUser.uid, friendData.uid);
        const msg = {
            senderId: currentUser.uid,
            senderName: currentUser.displayName,
            text: newMsg,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        await chatsCollection.doc(chatId).collection('messages').add(msg);
        await chatsCollection.doc(chatId).set({
            members: [currentUser.uid, friendData.uid],
            lastMessage: newMsg,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            [`unread.${friendData.uid}`]: firebase.firestore.FieldValue.increment(1)
        }, { merge: true });
        setNewMsg('');
    };
    
    if (!show || !friendData) return null;
    
    return (
        <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col" onClick={onClose}>
            <div className="glass-panel flex-1 flex flex-col max-w-md w-full mx-auto" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center gap-2 p-3 border-b border-white/10">
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">&times;</button>
                    <img src={friendData.photoURL} className="w-8 h-8 rounded-full"/>
                    <span className="font-bold flex-1">{friendData.displayName}</span>
                    <button onClick={() => setShowSendGift(true)} className="btn-gold px-2 py-1 rounded text-xs">🎁</button>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {messages.map(m => (
                        <div key={m.id} className={`flex ${m.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-2 rounded-lg text-xs ${m.senderId === currentUser?.uid ? 'bg-primary/20 border border-primary/30' : 'bg-white/10'}`}>
                                {m.type === 'gift' ? (
                                    <div className="text-center py-2">
                                        <span className="text-3xl">{m.text.split(' ')[0]}</span>
                                        <div className="text-[10px] text-yellow-400">{m.text.split(' ').slice(1).join(' ')}</div>
                                    </div>
                                ) : m.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                
                {/* Input */}
                <div className="p-2 border-t border-white/10 flex gap-2 relative">
                    <button onClick={() => setShowEmoji(!showEmoji)} className="text-lg">😀</button>
                    <input
                        className="input-dark flex-1 p-2 rounded text-xs"
                        value={newMsg}
                        onChange={e => setNewMsg(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder={t.chatPlaceholder}
                    />
                    <button onClick={handleSend} className="btn-neon px-3 rounded text-xs">{t.send}</button>
                    
                    {showEmoji && (
                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-black/90 border border-white/20 rounded-lg p-2 grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
                            {EMOJI_LIST.map((e, i) => (
                                <button key={i} onClick={() => { setNewMsg(newMsg + e); setShowEmoji(false); }} className="text-lg hover:scale-125 transition">{e}</button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            <SendGiftModal
                show={showSendGift}
                onClose={() => setShowSendGift(false)}
                targetUser={friendData}
                currentUser={currentUser}
                lang={lang}
                onSendGift={onSendGift}
                currency={currentUser?.currency || 0}
            />
        </div>
    );
}

// Render the app
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
