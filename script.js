// ==========================================
// PRO SPY - COMPLETE SCRIPT PART 1 - FIXED
// All Issues Resolved
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
const notificationsCollection = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('notifications');

// --- Constants ---
const CURRENCY_NAME = "Intel";
const CURRENCY_ICON = "🧠";
const MAX_ROUNDS = 3;

// ==========================================
// CHARISMA LEVELS - FIXED (Last level open, icon can be image or emoji)
// ==========================================
const CHARISMA_LEVELS = [
    { level: 1, threshold: 0, icon: 'star1.png', iconType: 'emoji', iconUrl: 'https://i.ibb.co/rRdQzRnR/1.png', name_en: 'Rising Star', name_ar: 'نجم صاعد', color: '#ffd700', badge_class: 'level-1-3' },
    { level: 2, threshold: 4000, icon: '⭐', iconType: 'emoji', name_en: 'Shining Star', name_ar: 'نجم ساطع', color: '#ffd700', badge_class: 'level-1-3' },
    { level: 3, threshold: 12000, icon: '⭐', iconType: 'emoji', name_en: 'Bright Star', name_ar: 'نجم مضيء', color: '#ffd700', badge_class: 'level-1-3' },
    { level: 4, threshold: 30000, icon: '💎', iconType: 'emoji', name_en: 'Diamond I', name_ar: 'ماسة 1', color: '#3b82f6', badge_class: 'level-4-6' },
    { level: 5, threshold: 80000, icon: '💎', iconType: 'emoji', name_en: 'Diamond II', name_ar: 'ماسة 2', color: '#3b82f6', badge_class: 'level-4-6' },
    { level: 6, threshold: 160000, icon: '💎', iconType: 'emoji', name_en: 'Diamond III', name_ar: 'ماسة 3', color: '#3b82f6', badge_class: 'level-4-6' },
    { level: 7, threshold: 300000, icon: '👑', iconType: 'emoji', name_en: 'Crown I', name_ar: 'تاج 1', color: '#ffd700', badge_class: 'level-7-9' },
    { level: 8, threshold: 500000, icon: '👑', iconType: 'emoji', name_en: 'Crown II', name_ar: 'تاج 2', color: '#ffd700', badge_class: 'level-7-9' },
    { level: 9, threshold: 1000000, icon: '👑', iconType: 'emoji', name_en: 'Crown III', name_ar: 'تاج 3', color: '#ffd700', badge_class: 'level-7-9' },
    { level: 10, threshold: 2000000, icon: '👑', iconType: 'emoji', name_en: 'Royal Crown I', name_ar: 'تاج ملكي 1', color: '#f97316', badge_class: 'level-10-12' },
    { level: 11, threshold: 3500000, icon: '👑', iconType: 'emoji', name_en: 'Royal Crown II', name_ar: 'تاج ملكي 2', color: '#f97316', badge_class: 'level-10-12' },
    { level: 12, threshold: 6000000, icon: '👑', iconType: 'emoji', name_en: 'Royal Crown III', name_ar: 'تاج ملكي 3', color: '#f97316', badge_class: 'level-10-12' },
    { level: 13, threshold: 8500000, icon: '👑', iconType: 'emoji', name_en: 'Purple Crown I', name_ar: 'تاج بنفسجي 1', color: '#8b5cf6', badge_class: 'level-13-15' },
    { level: 14, threshold: 12000000, icon: '👑', iconType: 'emoji', name_en: 'Purple Crown II', name_ar: 'تاج بنفسجي 2', color: '#8b5cf6', badge_class: 'level-13-15' },
    { level: 15, threshold: 16000000, icon: '👑', iconType: 'emoji', name_en: 'Purple Crown III', name_ar: 'تاج بنفسجي 3', color: '#8b5cf6', badge_class: 'level-13-15' },
    { level: 16, threshold: 26000000, icon: '🌟', iconType: 'emoji', name_en: 'Legend I', name_ar: 'أسطورة 1', color: '#f97316', badge_class: 'level-16-21' },
    { level: 17, threshold: 48000000, icon: '🌟', iconType: 'emoji', name_en: 'Legend II', name_ar: 'أسطورة 2', color: '#f97316', badge_class: 'level-16-21' },
    { level: 18, threshold: 86000000, icon: '🌟', iconType: 'emoji', name_en: 'Legend III', name_ar: 'أسطورة 3', color: '#f97316', badge_class: 'level-16-21' },
    { level: 19, threshold: 120000000, icon: '🌟', iconType: 'emoji', name_en: 'Legend IV', name_ar: 'أسطورة 4', color: '#f97316', badge_class: 'level-16-21' },
    { level: 20, threshold: 240000000, icon: '🌟', iconType: 'emoji', name_en: 'Legend V', name_ar: 'أسطورة 5', color: '#f97316', badge_class: 'level-16-21' },
    // Last level - Open ended (no next level, always shows progress to max)
    { level: 21, threshold: 360000000, icon: '🌟', iconType: 'emoji', name_en: 'Ultimate Legend', name_ar: 'الأسطورة المطلقة', color: '#f97316', badge_class: 'level-16-21', isMaxLevel: true },
];

// Get charisma level info
const getCharismaLevel = (charisma) => {
    let currentLevel = CHARISMA_LEVELS[0];
    let nextLevel = null;
    
    for (let i = CHARISMA_LEVELS.length - 1; i >= 0; i--) {
        if (charisma >= CHARISMA_LEVELS[i].threshold) {
            currentLevel = CHARISMA_LEVELS[i];
            nextLevel = CHARISMA_LEVELS[i + 1] || null;
            break;
        }
    }
    
    return { currentLevel, nextLevel };
};

// Calculate progress to next level
const getCharismaProgress = (charisma) => {
    const { currentLevel, nextLevel } = getCharismaLevel(charisma);
    // If max level, always show 100% or keep progressing
    if (!nextLevel || currentLevel.isMaxLevel) return 100;
    const currentThreshold = currentLevel.threshold;
    const nextThreshold = nextLevel.threshold;
    const progress = ((charisma - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(100, Math.max(0, progress));
};

// --- Shop Items ---
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
    { id: 'level_5', name_en: "Rising Star", name_ar: "نجم صاعد", icon: "⭐", desc_en: "Reach Level 5.", desc_ar: "الوصول للمستوى 5.", hidden: false },
    { id: 'level_10', name_en: "Veteran", name_ar: "محارب قديم", icon: "🛡️", desc_en: "Reach Level 10.", desc_ar: "الوصول للمستوى 10.", hidden: false },
    { id: 'ghost_protocol', name_en: "Ghost Protocol", name_ar: "بروتوكول الشبح", icon: "👻", desc_en: "Win a game without anyone voting for you.", desc_ar: "اربح لعبة دون أن يصوت عليك أحد.", hidden: true },
    { id: 'mr_white_lucky', name_en: "Lucky Guess", name_ar: "تخمين محظوظ", icon: "🎲", desc_en: "Win as Mr. White by guessing correctly.", desc_ar: "اربح كالسيد أبيض عن طريق التخمين الصحيح.", hidden: true },
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
const getTimeRemaining = (lastChanged) => { if (!lastChanged) return "0d 0h"; const lastChangeDate = lastChanged.toDate ? lastChanged.toDate() : new Date(lastChanged); const nextChangeDate = new Date(lastChangeDate); nextChangeDate.setMonth(nextChangeDate.getMonth() + 1); const now = new Date(); const diff = nextChangeDate - now; if (diff <= 0) return "0d 0h"; const days = Math.floor(diff / (1000 * 60 * 60 * 24)); const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); return `${days}d ${hours}h`; };
const formatDuration = (ms) => { const totalSeconds = Math.floor(ms / 1000); const minutes = Math.floor(totalSeconds / 60); const seconds = totalSeconds % 60; return `${minutes}m ${seconds}s`; };
const formatCharisma = (num) => { if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'; if (num >= 1000) return (num / 1000).toFixed(1) + 'K'; return num.toString(); };

// --- Audio System ---
const AudioCtx = window.AudioContext || window.webkitAudioContext; let audioCtx = null;
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
    } else if (type === 'message') {
        osc.frequency.value = 880;
        osc.type = 'sine';
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(1100, audioCtx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
        
        setTimeout(() => {
            if (!audioCtx) return;
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.frequency.value = 1100;
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            osc2.start();
            osc2.stop(audioCtx.currentTime + 0.15);
        }, 100);
    } else if (type === 'gift') {
        osc.frequency.value = 523;
        osc.type = 'sine';
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(784, audioCtx.currentTime + 0.15);
        osc.frequency.linearRampToValueAtTime(1047, audioCtx.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    }
};

// --- Translations ---
const TRANSLATIONS = { 
    en: { 
        appName: "PRO SPY", tagline: "COVERT ARENA", nickname: "OPERATOR NAME", create: "CREATE GAME", join: "JOIN OPS", browse: "BROWSE ROOMS", players: "OPERATIVES", start: "LAUNCH MISSION", langBtn: "العربية", loading: "PROCESSING...", you: "YOU", statusSpy: "SPY", statusAgent: "AGENT", statusInformant: "INFORMANT", statusMrWhite: "MR. WHITE", statusGhost: "GHOST", round: "ROUND", skip: "SKIP TURN", vote: "VOTE TO EJECT", chatPlaceholder: "Type message...", send: "SEND", waiting: "Awaiting host...", location: "LOCATION", spectator: "SPECTATOR", confirm: "CONFIRM VOTE", spyWin: "SPY WINS!", agentsWin: "AGENTS WIN!", mrWhiteWin: "MR. WHITE WINS!", playAgain: "PLAY AGAIN", connecting: "Connecting...", startVoting: "START VOTING", votingStarted: "VOTING INITIATED", voteRequestTitle: "VOTING REQUEST", voteRequestDesc: "wants to start voting.", agree: "AGREE", decline: "DECLINE", endVoting: "END VOTING NOW", votesTitle: "VOTES:", roundsFormat: (c, m) => `ROUND ${c}/${m}`, wordSelectionTitle: "SELECT KEYWORD", wordSelectionDesc: "Choose a keyword for this round", finishSelection: "FINISH SELECTION", selectedWord: "Selected Keyword", loginGoogle: "Login", myAccount: "My Account", logout: "Logout", profile: "Profile", guest: "Guest", linkGuessCard: "GUESS MY CARD", level: "Level", wins: "Wins", losses: "Losses", winRate: "Win Rate", totalGames: "Games", achievements: "Achievements", id: "ID", enterCodeError: "Please enter a room code.", changeName: "Change Name", nameChangeLimit: "Once a month", copied: "Copied!", save: "Save", or: "OR", needPlayers: "Minimum players not met!", ok: "OK", tabLobby: "Lobby", tabLeaderboard: "Leaderboard", tabFriends: "Friends", addFriend: "Add Friend", friendIdPlaceholder: "Enter Friend ID", online: "Online", offline: "Offline", noFriends: "No friends yet.", friendAdded: "Friend Added!", friendNotFound: "User not found.", requestSent: "Request Sent!", incomingRequests: "Incoming Requests", noRequests: "No pending requests.", accept: "Accept", reject: "Reject", sendMessage: "Send", inviteBtn: "Invite", invitedYou: "invited you to play.", joinInvite: "Join?", inviteFriends: "Invite Friends", accountInfo: "Account Information", email: "Email", memberSince: "Member Since", nameChangeCountdown: "Name Change In", canChangeNow: "Can change now!", selectEmoji: "Emoji", guestTitle: "GUEST ACCOUNT", guestDesc: "Register to save progress and add friends.", kd: "K/D Ratio", stats: "Stats", noPermission: "Feature unavailable for guests.", normalMode: "NORMAL MODE", advancedMode: "ADVANCED MODE (6+)", modeNormalDesc: "Classic Spy vs Agents. 3-10 Players.", modeAdvDesc: "Special Roles included! 6-10 Players.", privateRoom: "Private Room", password: "Password", publicRoom: "Public Room", noRooms: "No active games found.", lobbyTitle: "GAME LOBBY", mrWhiteInstruction: "Guess the location to win!", informantInstruction: "You know a neighbor!", ghostInstruction: "You are now a Ghost. You can watch but cannot act.", guessLocation: "GUESS LOCATION", leaveRoom: "LEAVE", closeRoom: "CLOSE ROOM", showPassword: "Show Password", guestAccountLabel: "GUEST ACCOUNT", guestProfileMsg: "Guests cannot receive friend requests.", reportUser: "Report User", reportSent: "Report sent successfully!", reportTitle: "Report User", reportDesc: "Please select a reason for reporting this user.", reportReasonAbusive: "Abusive Behavior", reportReasonCheating: "Cheating", reportReasonSpam: "Spam", reportReasonOther: "Other", reportSubmit: "Submit Report", reportCancel: "Cancel", privateRoomError: "Private rooms require a password.",
        shop: "Shop", currency: "Intel", buy: "Buy", owned: "Owned", equip: "Equip", equipped: "Equipped", unequip: "UnEquip", inventory: "Inventory", frames: "Frames", titles: "Titles", themes: "Themes", purchaseSuccess: "Purchase Successful!", purchaseFail: "Not enough Intel!", alreadyOwned: "Already Owned",
        tutorialTitle: "Welcome, Agent", tutorialStep1: "Your goal is to find the Spy (or blend in if you are the Spy).", tutorialStep2: "Each round, discuss and vote to eject a suspect.", tutorialStep3: "Win matches to earn Intel and buy items in the Shop!", skipTutorial: "Skip", next: "Next", startGame: "Start Game",
        matchSummary: "Match Summary", matchDuration: "Duration", mvp: "MVP", correctVotes: "Correct Votes", summaryTitle: "Game Over!",
        notifTitle: "Notification", achUnlock: "Achievement Unlocked!", newFriend: "New Friend Added!", hiddenAch: "Hidden Achievement", tabMain: "Main", tabInv: "Inventory", tabAch: "Achievements",
        charisma: "Charisma", charismaDesc: "Your influence in the arena", gifts: "Gifts", sendGift: "Send Gift", giftSent: "Gift Sent!", giftReceived: "You received a gift!", selectGift: "Select a Gift", giftPreview: "Gift Preview", cashback: "Cashback", willReceive: "You'll receive", charismaGain: "Charisma Gain", playerLeft: "Player Left", spyLeftAgentsWin: "Spy left! Agents Win!", agentLeftSpyWins: "Agent left! Spy Wins!", myGifts: "My Gifts", receivedGifts: "Received Gifts", noGifts: "No gifts yet.", fromPlayer: "From", toPlayer: "To", buyGift: "Buy Gift", sendToFriend: "Send to Friend",
        notifications: "Notifications", clearAll: "Clear All", noNotifications: "No notifications", friendRequest: "sent you a friend request", giftNotification: "sent you a gift", messageNotification: "sent you a message", nextLevel: "Next level", close: "Close",
        sendTo: "Send to", noFriendsToSend: "No friends to send gifts to.", selectFriend: "Select a friend", myInventory: "My Inventory", maxLevel: "MAX LEVEL",
        privateChat: "Private Chat", typeMessage: "Type a message...", noMessages: "No messages yet.",
    }, 
    ar: { 
        appName: "برو جاسوس", tagline: "ساحة العمليات", nickname: "اسم العميل", create: "إنشاء لعبة", join: "انضمام", browse: "استعراض الغرف", players: "العملاء", start: "بدء المهمة", langBtn: "English", loading: "جاري التحميل...", you: "أنت", statusSpy: "جاسوس", statusAgent: "عميل", statusInformant: "المخبر", statusMrWhite: "السيد", statusGhost: "شبح", round: "الجولة", skip: "تخطي الدور", vote: "تصويت للطرد", chatPlaceholder: "اكتب رسالة...", send: "إرسال", waiting: "بانتظار المضيف...", location: "الموقع", spectator: "مشاهد", confirm: "تأكيد التصويت", spyWin: "فاز الجاسوس!", agentsWin: "فاز العملاء!", mrWhiteWin: "فاز السيد!", playAgain: "لعب مجدداً", connecting: "جاري التأمين...", startVoting: "بدء التصويت", votingStarted: "بدأ التصويت", voteRequestTitle: "طلب تصويت", voteRequestDesc: "يريد بدء التصويت.", agree: "موافق", decline: "رفض", endVoting: "إنهاء التصويت الآن", votesTitle: "الأصوات:", roundsFormat: (c, m) => `الجولة ${c}/${m}`, wordSelectionTitle: "اختر كلمة السر", wordSelectionDesc: "اختر كلمة سر لهذه الجولة", finishSelection: "إنهاء الاختيار", selectedWord: "كلمة السر", loginGoogle: "دخول", myAccount: "حسابي", logout: "تسجيل الخروج", profile: "الملف الشخصي", guest: "زائر", linkGuessCard: "خمن كرتي", level: "المستوى", wins: "فوز", losses: "خسارة", winRate: "نسبة الفوز", totalGames: "المباريات", achievements: "الإنجازات", id: "الرقم", enterCodeError: "برجاء إدخال كود الغرفة.", changeName: "تغيير الاسم", nameChangeLimit: "مرة شهرياً", copied: "تم النسخ!", save: "حفظ", or: "أو", needPlayers: "اللاعبين غير كافيين!", ok: "حسناً", tabLobby: "الرئيسية", tabLeaderboard: "المتصدرين", tabFriends: "الأصدقاء", addFriend: "أضافة صديق", friendIdPlaceholder: "أدخل ID الصديق", online: "متصل", offline: "غير متصل", noFriends: "لا يوجد أصدقاء.", friendAdded: "تمت الإضافة!", friendNotFound: "المستخدم غير موجود.", requestSent: "تم إرسال الطلب!", incomingRequests: "طلبات الصداقة", noRequests: "لا توجد طلبات.", accept: "قبول", reject: "رفض", sendMessage: "إرسال", inviteBtn: "دعوة", invitedYou: "دعاك للعب.", joinInvite: "انضمام؟", inviteFriends: "دعوة أصدقاء", accountInfo: "معلومات الحساب", email: "البريد الإلكتروني", memberSince: "عضو منذ", nameChangeCountdown: "تغيير الاسم بعد", canChangeNow: "يمكن التغيير الآن!", selectEmoji: "إيموجي", guestTitle: "حساب زائر", guestDesc: "سجل لحفظ تقدمك وإضافة أصدقاء.", kd: "نسبة الـ KD", stats: "الإحصائيات", noPermission: "غير متاح للزوار.", normalMode: "الوضع العادي", advancedMode: "الوضع المتقدم (6+)", modeNormalDesc: "جاسوس ضد عملاء. 3-10 لاعبين.", modeAdvDesc: "أدوار خاصة! 6-10 لاعبين.", privateRoom: "غرفة خاصة", password: "كلمة السر", publicRoom: "غرفة عامة", noRooms: "لا توجد ألعاب نشطة.", lobbyTitle: "غرفة الانتظار", mrWhiteInstruction: "خمن المكان لتفوز!", informantInstruction: "تعرف على جارك!", ghostInstruction: "أنت الآن شبح. يمكنك المشاهدة فقط.", guessLocation: "خمن المكان", leaveRoom: "خروج", closeRoom: "إغلاق الغرفة", showPassword: "إظهار الباسورد", guestAccountLabel: "حساب زائر", guestProfileMsg: "لا يمكن إرسال طلبات صداقة للحسابات الزائرة.", reportUser: "إبلاغ عن المستخدم", reportSent: "تم إرسال البلاغ بنجاح!", reportTitle: "الإبلاغ عن مستخدم", reportDesc: "برجاء اختيار سبب الإبلاغ.", reportReasonAbusive: "سلوك مسيء", reportReasonCheating: "غش", reportReasonSpam: "بريد مزعج", reportReasonOther: "سبب آخر", reportSubmit: "إرسال البلاغ", reportCancel: "إلغاء", privateRoomError: "الغرف الخاصة تتطلب كلمة سر!",
        shop: "المتجر", currency: "إنتل", buy: "شراء", owned: "مملوك", equip: "تزيين", equipped: "مُزين", unequip: "إزالة", inventory: "المخزون", frames: "إطارات", titles: "ألقاب", themes: "سمات", purchaseSuccess: "تم الشراء!", purchaseFail: "لا تملك إنتل كافي!", alreadyOwned: "مملوك مسبقاً",
        tutorialTitle: "مرحباً أيها العميل", tutorialStep1: "هدفك هو العثور على الجاسوس (أو التخفي إن كنت الجاسوس).", tutorialStep2: "في كل جولة، ناقش وصوّت لطرد المشتبه به.", tutorialStep3: "اربح المباريات لتحصل على إنتل واشتري من المتجر!", skipTutorial: "تخطي", next: "التالي", startGame: "ابدأ اللعبة",
        matchSummary: "ملخص المباراة", matchDuration: "المدة", mvp: "الأفضل", correctVotes: "أصوات صحيحة", summaryTitle: "انتهت اللعبة!",
        notifTitle: "إشعار", achUnlock: "تم فتح إنجاز!", newFriend: "صديق جديد!", hiddenAch: "إنجاز سري", tabMain: "الرئيسية", tabInv: "المخزون", tabAch: "الإنجازات",
        charisma: "الكاريزما", charismaDesc: "تأثيرك في الساحة", gifts: "الهدايا", sendGift: "إرسال هدية", giftSent: "تم إرسال الهدية!", giftReceived: "لقد استلمت هدية!", selectGift: "اختر هدية", giftPreview: "معاينة الهدية", cashback: "استرداد", willReceive: "ستستلم", charismaGain: "زيادة الكاريزما", playerLeft: "لاعب غادر", spyLeftAgentsWin: "الجاسوس غادر! فاز العملاء!", agentLeftSpyWins: "عميل غادر! فاز الجاسوس!", myGifts: "هداياي", receivedGifts: "الهدايا المستلمة", noGifts: "لا توجد هدايا بعد.", fromPlayer: "من", toPlayer: "إلى", buyGift: "شراء هدية", sendToFriend: "إرسال لصديق",
        notifications: "الإشعارات", clearAll: "حذف الكل", noNotifications: "لا توجد إشعارات", friendRequest: "أرسل لك طلب صداقة", giftNotification: "أرسل لك هدية", messageNotification: "أرسل لك رسالة", nextLevel: "المستوى التالي", close: "إغلاق",
        sendTo: "إرسال إلى", noFriendsToSend: "لا يوجد أصدقاء لإرسال الهدايا.", selectFriend: "اختر صديق", myInventory: "مخزوني", maxLevel: "المستوى الأقصى",
        privateChat: "محادثة خاصة", typeMessage: "اكتب رسالة...", noMessages: "لا توجد رسائل بعد.",
    } 
};

// ==========================================
// COMPONENTS
// ==========================================

// Guest Banner
const GuestBanner = ({ lang }) => { 
    const t = TRANSLATIONS[lang]; 
    return ( <div className="guest-banner"> <h3 className="text-sm font-bold text-yellow-400">{t.guestTitle}</h3> <p className="text-[10px] text-gray-400">{t.guestDesc}</p> </div> ); 
};

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
        <div className="notification-toast">
            <div className="notification-content">
                <span className="notification-icon">🎉</span>
                <span className="notification-text">{message}</span>
                <button onClick={onClose} className="notification-close">&times;</button>
            </div>
        </div>
    );
};

// Modal Close Button
const ModalCloseBtn = ({ onClose }) => (
    <button onClick={onClose} className="modal-close-btn" aria-label="Close">&times;</button>
);

// Charisma Display Component - FIXED (supports image or emoji icons)
const CharismaDisplay = ({ charisma, lang, showDetails = true }) => {
    const t = TRANSLATIONS[lang];
    const { currentLevel, nextLevel } = getCharismaLevel(charisma || 0);
    const progress = getCharismaProgress(charisma || 0);
    const neededForNext = nextLevel ? nextLevel.threshold - (charisma || 0) : 0;
    const isMaxLevel = currentLevel.isMaxLevel;
    
    // Render icon (image or emoji)
    const renderIcon = () => {
        if (currentLevel.iconType === 'image' && currentLevel.iconUrl) {
            return <img src={currentLevel.iconUrl} alt="level" className="w-5 h-5" />;
        }
        return <span className="charisma-icon">{currentLevel.icon}</span>;
    };
    
    return (
        <div className="charisma-container">
            <div className="charisma-header">
                <span className="charisma-label">
                    {renderIcon()}
                    {t.charisma}
                </span>
                <span className={`charisma-level-badge ${currentLevel.badge_class}`}>
                    {renderIcon()} Lv.{currentLevel.level}
                </span>
            </div>
            <div className="charisma-bar-bg">
                <div className="charisma-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="charisma-info">
                <span className="charisma-current">{formatCharisma(charisma || 0)}</span>
                {isMaxLevel ? (
                    <span className="charisma-next text-yellow-400 font-bold">{t.maxLevel}</span>
                ) : nextLevel && showDetails && (
                    <span className="charisma-next">{t.nextLevel}: {formatCharisma(neededForNext)}</span>
                )}
            </div>
        </div>
    );
};

// Avatar with Frame Component
const AvatarWithFrame = ({ photoURL, equipped, size = 'md', onClick }) => {
    const sizeClasses = {
        sm: 'avatar-wrapper size-sm',
        md: 'avatar-wrapper size-md', 
        lg: 'avatar-wrapper size-lg',
        xl: 'avatar-wrapper size-xl'
    };
    const frameStyle = equipped?.frames || null;
    const frameItem = SHOP_ITEMS.frames.find(f => f.id === frameStyle);
    
    return (
        <div className={sizeClasses[size]} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
            <img src={photoURL || `https://ui-avatars.com/api/?name=User&background=random`} className="avatar-image" alt="avatar" />
            {frameItem && (
                frameItem.preview.startsWith('http') ? (
                    <img src={frameItem.preview} className="avatar-frame" alt="frame" />
                ) : (
                    <div className="avatar-frame-gradient" style={{ background: frameItem.preview }} />
                )
            )}
        </div>
    );
};

// Tutorial Modal
const TutorialModal = ({ show, onClose, lang }) => {
    const t = TRANSLATIONS[lang];
    const [step, setStep] = useState(0);
    if(!show) return null;
    const steps = [ { text: t.tutorialStep1, img: "🕵️" }, { text: t.tutorialStep2, img: "🗳️" }, { text: t.tutorialStep3, img: "🛒" } ];
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '360px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">{t.tutorialTitle}</h2>
                    <ModalCloseBtn onClose={onClose} />
                </div>
                <div className="modal-body text-center">
                    <div className="text-6xl mb-6 animate-bounce">{steps[step].img}</div>
                    <p className="text-base mb-6 text-gray-200">{steps[step].text}</p>
                    <div className="flex justify-center gap-2 mb-4"> 
                        {steps.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full transition ${i === step ? 'bg-cyan-400 w-4' : 'bg-gray-600'}`}></div>)} 
                    </div>
                    <div className="flex gap-3">
                        {step > 0 && <button onClick={() => setStep(s => s-1)} className="btn-ghost flex-1 py-2 rounded-lg text-sm">Back</button>}
                        {step < steps.length - 1 ? ( <button onClick={() => setStep(s => s+1)} className="btn-neon flex-1 py-2 rounded-lg text-sm">{t.next}</button> ) : ( <button onClick={onClose} className="btn-neon flex-1 py-2 rounded-lg text-sm">{t.startGame}</button> )}
                    </div>
                    <button onClick={onClose} className="text-xs text-gray-500 mt-4 hover:text-white">{t.skipTutorial}</button>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// PRIVATE CHAT MODAL - FIXED
// ==========================================
const PrivateChatModal = ({ show, onClose, friend, currentUser, user, lang }) => {
    const t = TRANSLATIONS[lang];
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    
    const chatId = friend && user ? getChatId(user.uid, friend.uid) : null;
    
    // Listen to messages
    useEffect(() => {
        if (!show || !chatId) return;
        
        const unsub = chatsCollection.doc(chatId).collection('messages')
            .onSnapshot(snap => {
                let msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // Sort by timestamp in client side
                msgs.sort((a, b) => {
                    const timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds || 0;
                    const timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds || 0;
                    return timeA - timeB;
                });
                setMessages(msgs);
                
                // Mark as read
                chatsCollection.doc(chatId).update({
                    [`unread.${user.uid}`]: 0
                }).catch(() => {});
            });
        
        return unsub;
    }, [show, chatId, user?.uid]);
    
    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    // Send message
    const handleSend = async () => {
        if (!newMsg.trim() || sending) return;
        setSending(true);
        
        try {
            const msgData = {
                senderId: user.uid,
                senderName: currentUser?.displayName || 'User',
                text: newMsg.trim(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await chatsCollection.doc(chatId).collection('messages').add(msgData);
            
            await chatsCollection.doc(chatId).set({
                members: [user.uid, friend.uid],
                lastMessage: newMsg.trim(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                [`unread.${friend.uid}`]: firebase.firestore.FieldValue.increment(1)
            }, { merge: true });
            
            // Create notification
            await notificationsCollection.add({
                toUserId: friend.uid,
                fromUserId: user.uid,
                fromName: currentUser?.displayName,
                type: 'message',
                message: `${currentUser?.displayName} ${t.messageNotification}`,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            });
            
            setNewMsg('');
            playSound('message');
        } catch (e) {
            console.error('Send message error:', e);
        }
        
        setSending(false);
    };
    
    if (!show || !friend) return null;
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', height: '80vh' }}>
                <div className="modal-header">
                    <div className="flex items-center gap-2">
                        <AvatarWithFrame photoURL={friend.photoURL} equipped={friend.equipped} size="sm" />
                        <div>
                            <h2 className="modal-title text-sm">{friend.displayName}</h2>
                            <span className="text-[10px] text-gray-400">{t.privateChat}</span>
                        </div>
                    </div>
                    <ModalCloseBtn onClose={onClose} />
                </div>
                <div className="modal-body flex-1 overflow-y-auto p-3" style={{ maxHeight: 'calc(80vh - 140px)' }}>
                    {messages.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">{t.noMessages}</div>
                    ) : (
                        messages.map(msg => {
                            const isMine = msg.senderId === user?.uid;
                            return (
                                <div key={msg.id} className={`flex mb-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] ${isMine ? 'chat-bubble-me' : 'chat-bubble-other'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                        <span className="text-[10px] text-gray-400 block mt-1">{formatTime(msg.timestamp)}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="modal-footer p-3 border-t border-white/10">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="input-dark flex-1 p-2 rounded-lg text-sm"
                            placeholder={t.typeMessage}
                            value={newMsg}
                            onChange={e => setNewMsg(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend} disabled={sending || !newMsg.trim()} className="btn-neon px-4 py-2 rounded-lg text-sm">
                            {t.send}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// My Account Modal
const MyAccountModal = ({ show, onClose, userData, user, lang, onLogout, onOpenShop }) => {
    const t = TRANSLATIONS[lang];
    const [newName, setNewName] = useState('');
    const [nameMsg, setNameMsg] = useState('');
    
    if(!show || !userData) return null;
    
    const isGuest = user?.isAnonymous;
    const stats = userData.stats || { wins: 0, losses: 0, xp: 0 };
    const level = calculateLevel(stats.xp || 0);
    const xpProgress = calculateXPProgress(stats.xp || 0);
    
    const handleChangeName = async () => {
        if (!newName.trim()) return;
        const lastChanged = userData.lastChangedName?.toDate ? userData.lastChangedName.toDate() : null;
        const now = new Date();
        if (lastChanged) {
            const oneMonthLater = new Date(lastChanged);
            oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
            if (now < oneMonthLater) { setNameMsg(t.nameChangeLimit); return; }
        }
        try {
            await usersCollection.doc(user.uid).update({ displayName: newName.trim(), lastChangedName: firebase.firestore.FieldValue.serverTimestamp() });
            localStorage.setItem('pro_spy_nick', newName.trim());
            setNameMsg(t.copied);
            setNewName('');
        } catch (e) { console.error(e); }
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{t.myAccount}</h2>
                    <ModalCloseBtn onClose={onClose} />
                </div>
                <div className="modal-body">
                    <div className="profile-header">
                        <div className="profile-avatar-container">
                            <AvatarWithFrame photoURL={userData.photoURL} equipped={userData.equipped} size="lg" />
                        </div>
                        <h3 className="profile-name">{userData.displayName}</h3>
                        {userData.equipped?.titles && (
                            <span className="profile-title bg-gradient-to-r from-purple-500 to-cyan-500 text-white">
                                {SHOP_ITEMS.titles.find(t => t.id === userData.equipped.titles)?.name_en || ''}
                            </span>
                        )}
                        <div className="profile-id" onClick={() => { navigator.clipboard.writeText(userData.customId); }}>
                            <span>ID: {userData.customId}</span>
                            <span className="text-[10px]">📋</span>
                        </div>
                    </div>
                    <CharismaDisplay charisma={userData.charisma} lang={lang} />
                    <div className="profile-stats">
                        <div className="profile-stat">
                            <div className="profile-stat-value">{stats.wins || 0}</div>
                            <div className="profile-stat-label">{t.wins}</div>
                        </div>
                        <div className="profile-stat">
                            <div className="profile-stat-value">{stats.losses || 0}</div>
                            <div className="profile-stat-label">{t.losses}</div>
                        </div>
                        <div className="profile-stat">
                            <div className="profile-stat-value">{level}</div>
                            <div className="profile-stat-label">{t.level}</div>
                        </div>
                    </div>
                    <KDCircle wins={stats.wins || 0} losses={stats.losses || 0} lang={lang} />
                    <div className="mb-4">
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1"><span>XP</span><span>{xpProgress}/100</span></div>
                        <div className="xp-bar-bg h-2 rounded-full overflow-hidden">
                            <div className="xp-bar-fill h-full rounded-full" style={{ width: `${xpProgress}%` }}></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-4 p-2 bg-yellow-500/10 rounded-lg">
                        <span className="text-2xl">{CURRENCY_ICON}</span>
                        <span className="text-lg font-bold text-yellow-400">{userData.currency || 0} {CURRENCY_NAME}</span>
                    </div>
                    {!isGuest && (
                        <div className="text-xs text-gray-400 mb-4">
                            <div className="flex justify-between mb-1"><span>{t.email}:</span><span>{userData.email || 'N/A'}</span></div>
                            <div className="flex justify-between"><span>{t.memberSince}:</span><span>{formatDate(userData.createdAt)}</span></div>
                        </div>
                    )}
                    {!isGuest && (
                        <div className="mb-4">
                            <label className="text-[10px] text-gray-400 block mb-1">{t.changeName} ({t.nameChangeLimit})</label>
                            <div className="flex gap-2">
                                <input className="input-dark flex-1 p-2 rounded text-sm" value={newName} onChange={e => setNewName(e.target.value)} placeholder={t.changeName} />
                                <button onClick={handleChangeName} className="btn-ghost px-3 py-2 rounded text-sm">{t.save}</button>
                            </div>
                            {nameMsg && <p className="text-[10px] text-cyan-400 mt-1">{nameMsg}</p>}
                        </div>
                    )}
                    {isGuest && <GuestBanner lang={lang} />}
                </div>
                <div className="modal-footer">
                    <div className="flex gap-2">
                        <button onClick={onOpenShop} className="btn-gold flex-1 py-2 rounded-lg text-sm font-bold">🛒 {t.shop}</button>
                        {!isGuest && <button onClick={onLogout} className="btn-danger flex-1 py-2 rounded-lg text-sm">{t.logout}</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Browse Rooms Modal
const BrowseRoomsModal = ({ show, onClose, nickname, userData, lang, onJoin, isGuest }) => {
    const t = TRANSLATIONS[lang];
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [joinPwd, setJoinPwd] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);
    
    useEffect(() => {
        if (show) {
            setLoading(true);
            const unsub = roomsCollection.where('status', '==', 'waiting').onSnapshot(snap => {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setRooms(data);
                setLoading(false);
            });
            return unsub;
        }
    }, [show]);
    
    if(!show) return null;
    
    const handleJoinRoom = async (room, pwd) => {
        if (!nickname.trim()) return;
        playSound('click');
        let uid = auth.currentUser?.uid;
        if (!uid) { const anon = await auth.signInAnonymously(); uid = anon.user.uid; }
        const ref = roomsCollection.doc(room.id);
        const snap = await ref.get();
        if (snap.exists) {
            const data = snap.data();
            if (data.isPrivate && data.password !== pwd) { alert(t.privateRoomError); return; }
            const exists = data.players.find(p => p.uid === uid);
            if (!exists) {
                await ref.update({ players: [...data.players, { uid: uid, name: nickname, status: 'active', photo: userData?.photoURL || `https://ui-avatars.com/api/?name=${nickname}&background=random`, role: null, equipped: userData?.equipped || {} }] });
            }
            onJoin(room.id);
            onClose();
        }
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">{t.browse}</h2>
                    <ModalCloseBtn onClose={onClose} />
                </div>
                <div className="modal-body">
                    {loading ? (
                        <div className="text-center py-8"><div className="animate-spin text-3xl mb-2">⏳</div><p className="text-sm text-gray-400">{t.loading}</p></div>
                    ) : rooms.length === 0 ? (
                        <div className="text-center py-8"><div className="text-4xl mb-2">🎮</div><p className="text-sm text-gray-400">{t.noRooms}</p></div>
                    ) : (
                        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                            {rooms.map(room => (
                                <div key={room.id} className="bg-white/5 p-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm font-bold text-primary">{room.id}</span>
                                            {room.isPrivate && <span className="text-xs text-yellow-400">🔒</span>}
                                        </div>
                                        <div className="text-xs text-gray-400">{room.players?.length || 0}/10 {t.players}</div>
                                    </div>
                                    <div className="flex items-center gap-1 mb-2">
                                        {room.players?.slice(0, 5).map((p, i) => (<AvatarWithFrame key={i} photoURL={p.photo} equipped={p.equipped} size="sm" />))}
                                        {(room.players?.length || 0) > 5 && (<span className="text-xs text-gray-400">+{(room.players?.length || 0) - 5}</span>)}
                                    </div>
                                    <div className="text-[10px] text-gray-500 mb-2">{room.mode === 'advanced' ? t.advancedMode : t.normalMode}</div>
                                    {selectedRoom?.id === room.id && room.isPrivate ? (
                                        <div className="flex gap-2">
                                            <input type="password" className="input-dark flex-1 p-2 rounded text-sm" placeholder={t.password} value={joinPwd} onChange={e => setJoinPwd(e.target.value)} />
                                            <button onClick={() => handleJoinRoom(room, joinPwd)} className="btn-neon px-3 py-2 rounded text-xs">{t.join}</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => { if (room.isPrivate) { setSelectedRoom(room); } else { handleJoinRoom(room, ''); } }} className="btn-neon w-full py-2 rounded text-xs font-bold">{t.join}</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// User Profile Modal
const UserProfileModal = ({ show, onClose, targetUID, currentUser, lang, onSendGift, onAddFriend }) => {
    const t = TRANSLATIONS[lang];
    const [targetData, setTargetData] = useState(null);
    const [showSendGift, setShowSendGift] = useState(false);
    const [showReport, setShowReport] = useState(false);
    
    useEffect(() => {
        if (targetUID && show) {
            usersCollection.doc(targetUID).get().then(doc => {
                if (doc.exists) { setTargetData({ id: doc.id, ...doc.data() }); }
            });
        }
    }, [targetUID, show]);
    
    if (!show || !targetData) return null;
    
    const stats = targetData.stats || { wins: 0, losses: 0, xp: 0 };
    const level = calculateLevel(stats.xp || 0);
    const isOwnProfile = currentUser?.uid === targetUID;
    const isGuest = currentUser?.isAnonymous;
    const isFriend = currentUser?.friends?.includes(targetUID);
    
    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2 className="modal-title">{t.profile}</h2>
                        <ModalCloseBtn onClose={onClose} />
                    </div>
                    <div className="modal-body">
                        <div className="profile-header">
                            <div className="profile-avatar-container">
                                <AvatarWithFrame photoURL={targetData.photoURL} equipped={targetData.equipped} size="lg" />
                            </div>
                            <h3 className="profile-name">{targetData.displayName}</h3>
                            {targetData.equipped?.titles && (
                                <span className="profile-title bg-gradient-to-r from-purple-500 to-cyan-500 text-white">
                                    {SHOP_ITEMS.titles.find(t => t.id === targetData.equipped.titles)?.name_en || ''}
                                </span>
                            )}
                            <div className="profile-id"><span>ID: {targetData.customId}</span></div>
                        </div>
                        <CharismaDisplay charisma={targetData.charisma} lang={lang} />
                        <div className="profile-stats">
                            <div className="profile-stat"><div className="profile-stat-value">{stats.wins || 0}</div><div className="profile-stat-label">{t.wins}</div></div>
                            <div className="profile-stat"><div className="profile-stat-value">{stats.losses || 0}</div><div className="profile-stat-label">{t.losses}</div></div>
                            <div className="profile-stat"><div className="profile-stat-value">{level}</div><div className="profile-stat-label">{t.level}</div></div>
                        </div>
                        <KDCircle wins={stats.wins || 0} losses={stats.losses || 0} lang={lang} />
                        <div className="mb-4">
                            <h4 className="text-xs font-bold text-gray-400 mb-2">{t.achievements} ({targetData.achievements?.length || 0})</h4>
                            <div className="flex flex-wrap gap-1">
                                {(targetData.achievements || []).slice(0, 6).map(achId => {
                                    const ach = ACHIEVEMENTS.find(a => a.id === achId);
                                    if (!ach) return null;
                                    return (<span key={achId} className="text-lg" title={ach.name_en}>{ach.icon}</span>);
                                })}
                                {(targetData.achievements?.length || 0) > 6 && (<span className="text-xs text-gray-400">+{(targetData.achievements?.length || 0) - 6}</span>)}
                            </div>
                        </div>
                        <div className="text-xs text-gray-400 text-center mb-4">{t.memberSince}: {formatDate(targetData.createdAt)}</div>
                    </div>
                    {!isOwnProfile && !isGuest && (
                        <div className="modal-footer">
                            <div className="flex gap-2">
                                <button onClick={() => setShowSendGift(true)} className="btn-gold flex-1 py-2 rounded-lg text-sm font-bold">🎁 {t.sendGift}</button>
                                {!isFriend && (<button onClick={() => onAddFriend(targetUID)} className="btn-neon flex-1 py-2 rounded-lg text-sm">👋 {t.addFriend}</button>)}
                            </div>
                            <button onClick={() => setShowReport(true)} className="btn-ghost w-full py-2 rounded-lg text-xs text-red-400 mt-2">⚠️ {t.reportUser}</button>
                        </div>
                    )}
                    {isGuest && !isOwnProfile && (<div className="modal-footer"><p className="text-xs text-gray-400 text-center">{t.noPermission}</p></div>)}
                </div>
            </div>
            <SendGiftModal show={showSendGift} onClose={() => setShowSendGift(false)} targetUser={targetData} currentUser={currentUser} lang={lang} onSendGift={onSendGift} currency={currentUser?.currency || 0} />
            <ReportModal show={showReport} onClose={() => setShowReport(false)} targetUser={targetData} currentUser={currentUser} lang={lang} />
        </>
    );
};

// Gift Preview Modal
const GiftPreviewModal = ({ show, onClose, gift, lang, onBuy, currency, isSending = false }) => { 
    const t = TRANSLATIONS[lang]; 
    if(!show || !gift) return null; 
    const cashbackAmount = Math.floor(gift.cost * (gift.cashback / 100)); 
    return ( 
        <div className="modal-overlay" onClick={onClose}> 
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '320px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">{t.giftPreview}</h2>
                    <ModalCloseBtn onClose={onClose} />
                </div>
                <div className="modal-body text-center">
                    <div className="text-6xl mb-3">{gift.emoji}</div> 
                    <h3 className="text-lg font-bold text-white mb-1">{lang === 'ar' ? gift.name_ar : gift.name_en}</h3> 
                    <p className="text-xs text-gray-400 mb-4">{lang === 'ar' ? gift.desc_ar : gift.desc_en}</p> 
                    <div className="grid grid-cols-2 gap-2 mb-4"> 
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2"><div className="text-[10px] text-gray-400">{t.charismaGain}</div><div className="text-lg font-bold text-purple-400">+{formatCharisma(gift.charisma)}</div></div> 
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2"><div className="text-[10px] text-gray-400">{t.cashback}</div><div className="text-lg font-bold text-green-400">+{cashbackAmount} 🧠</div></div> 
                    </div> 
                    <div className="text-sm text-yellow-400 mb-3">{t.willReceive}: {cashbackAmount} Intel ({gift.cashback}%)</div> 
                </div>
                <div className="modal-footer">
                    <div className="flex gap-2">
                        <button onClick={onClose} className="btn-ghost flex-1 py-2 rounded-lg text-sm">{t.reportCancel}</button> 
                        <button onClick={() => onBuy(gift)} disabled={currency < gift.cost} className={`flex-1 py-2 rounded-lg text-sm font-bold ${currency >= gift.cost ? 'btn-gold' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>{isSending ? t.sendToFriend : t.buy} ({gift.cost} 🧠)</button> 
                    </div>
                </div>
            </div>
        </div> 
    ); 
};

// Send Gift Modal
const SendGiftModal = ({ show, onClose, targetUser, currentUser, lang, onSendGift, currency }) => { 
    const t = TRANSLATIONS[lang]; 
    const [selectedGift, setSelectedGift] = useState(null); 
    const [showPreview, setShowPreview] = useState(false); 
    if(!show || !targetUser) return null; 
    const gifts = SHOP_ITEMS.gifts; 
    const handleSend = async (gift) => { if (onSendGift) { await onSendGift(gift, targetUser); } onClose(); }; 
    return ( 
        <> 
            <div className="modal-overlay" onClick={onClose}> 
                <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                    <div className="modal-header"><h2 className="modal-title">{t.sendGift}</h2><ModalCloseBtn onClose={onClose} /></div> 
                    <div className="modal-body">
                        <div className="flex items-center gap-2 mb-3 p-2 bg-white/5 rounded-lg"> 
                            <AvatarWithFrame photoURL={targetUser.photoURL} equipped={targetUser.equipped} size="sm" />
                            <div><div className="font-bold text-sm">{targetUser.displayName}</div><div className="text-[10px] text-gray-400">{t.charisma}: {formatCharisma(targetUser.charisma || 0)}</div></div> 
                        </div> 
                        <div className="flex items-center gap-2 mb-3 text-xs text-yellow-400"><span>🧠 {currency} {CURRENCY_NAME}</span></div> 
                        <div className="grid grid-cols-5 gap-2"> 
                            {gifts.map(gift => ( 
                                <button key={gift.id} onClick={() => { setSelectedGift(gift); setShowPreview(true); }} disabled={currency < gift.cost} className={`gift-card flex flex-col items-center justify-center p-2 rounded-lg transition ${currency >= gift.cost ? 'hover:border-yellow-400 hover:bg-yellow-500/10' : 'opacity-40 cursor-not-allowed'}`}> 
                                    <span className="text-2xl">{gift.emoji}</span><span className="text-[10px] font-bold text-yellow-400">{gift.cost}</span> 
                                </button> 
                            ))} 
                        </div>
                    </div> 
                </div> 
            </div> 
            <GiftPreviewModal show={showPreview} onClose={() => setShowPreview(false)} gift={selectedGift} lang={lang} onBuy={(gift) => handleSend(gift)} currency={currency} isSending={true} /> 
        </> 
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

// Shop Modal
const ShopModal = ({ show, onClose, userData, lang, onUpdate, onSendInventoryGift, friendsData }) => { 
    const t = TRANSLATIONS[lang]; 
    const [tab, setTab] = useState('frames'); 
    const [msg, setMsg] = useState(''); 
    const [selectedGift, setSelectedGift] = useState(null); 
    const [showGiftPreview, setShowGiftPreview] = useState(false); 
    const [showSendToFriend, setShowSendToFriend] = useState(false);
    const [selectedInventoryGift, setSelectedInventoryGift] = useState(null);
    
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
    
    const handleBuyGiftForSelf = async (gift) => { 
        if(currency < gift.cost) { setMsg(t.purchaseFail); setTimeout(() => setMsg(''), 2000); return; } 
        const cashbackAmount = Math.floor(gift.cost * (gift.cashback / 100)); 
        const newCurrency = currency - gift.cost + cashbackAmount; 
        const newInventory = { ...inventory }; 
        const existingGiftIndex = (newInventory.gifts || []).findIndex(g => g.id === gift.id);
        if (existingGiftIndex >= 0) { newInventory.gifts[existingGiftIndex].count += 1; }
        else { newInventory.gifts = [...(newInventory.gifts || []), { id: gift.id, count: 1 }]; }
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
    
    const openSendToFriend = (gift) => { setSelectedInventoryGift(gift); setShowSendToFriend(true); };
    const items = SHOP_ITEMS[tab] || []; 
    const inventoryGifts = (inventory.gifts || []).map(g => { const giftDetails = SHOP_ITEMS.gifts.find(gd => gd.id === g.id); return { ...giftDetails, count: g.count }; }).filter(g => g.id);
    
    return ( 
        <> 
            <div className="modal-overlay" onClick={onClose}> 
                <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                    <div className="modal-header"><h2 className="modal-title">{t.shop}</h2><div className="flex items-center gap-2"><span className="text-yellow-400 font-bold text-sm">{CURRENCY_ICON} {currency}</span><ModalCloseBtn onClose={onClose} /></div></div> 
                    <div className="modal-body">
                        <div className="tab-container">{['frames', 'titles', 'themes', 'gifts'].map(k => (<button key={k} onClick={() => setTab(k)} className={`tab-button ${tab === k ? 'active' : ''}`}>{t[k]}</button>))}</div>
                        {msg && <div className="text-center text-xs text-cyan-400 mb-2 animate-pop">{msg}</div>} 
                        {tab === 'gifts' && inventoryGifts.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-xs font-bold text-gray-400 mb-2">{t.myInventory} ({inventoryGifts.reduce((acc, g) => acc + g.count, 0)})</h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {inventoryGifts.map(gift => (
                                        <div key={gift.id} className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                                            <span className="text-2xl">{gift.emoji}</span><div className="text-[10px] text-gray-400">x{gift.count}</div>
                                            <button onClick={() => openSendToFriend(gift)} className="btn-neon w-full py-1 rounded text-[10px] mt-1">{t.sendToFriend}</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="inventory-grid"> 
                            {items.map(item => { 
                                const owned = item.type !== 'gifts' && inventory[item.type]?.includes(item.id); 
                                const isEquipped = equipped[item.type] === item.id; 
                                return ( 
                                    <div key={item.id} className={`inventory-item ${isEquipped ? 'equipped' : ''}`}> 
                                        <div className="inventory-item-preview">
                                            {item.type === 'frames' && (<div className="w-10 h-10 rounded-full relative"><div className="absolute inset-0 bg-gray-700 rounded-full"></div>{item.preview?.startsWith('http') ? (<img src={item.preview} className="absolute inset-0 w-full h-full object-cover rounded-full" alt="frame" />) : (<div className="absolute inset-0 rounded-full" style={{ background: item.preview, padding: '2px' }}><div className="w-full h-full rounded-full bg-gray-800"></div></div>)}</div>)}
                                            {item.type === 'titles' && <span className="text-base font-bold text-primary">{item.name_en}</span>}
                                            {item.type === 'themes' && <span className="text-2xl">🎨</span>}
                                            {item.type === 'gifts' && (<><span className="text-2xl">{item.emoji}</span><span className="text-[10px] text-yellow-400">+{formatCharisma(item.charisma)} ✨</span></>)}
                                        </div>
                                        <div className="inventory-item-name">{lang === 'ar' ? item.name_ar : item.name_en}</div>
                                        <div className="inventory-item-actions">
                                            {item.type === 'gifts' ? (<button onClick={() => { setSelectedGift(item); setShowGiftPreview(true); }} disabled={currency < item.cost} className={currency >= item.cost ? 'btn-gold' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}>{t.buy} ({item.cost})</button>) : owned ? (isEquipped ? (<button onClick={() => handleUnequip(item.type)} className="btn-unequip">{t.unequip}</button>) : (<button onClick={() => handleEquip(item.type, item.id)} className="btn-ghost border-white/20">{t.equip}</button>)) : (<button onClick={() => handleBuy(item)} className="btn-gold">{t.buy} ({item.cost})</button>)}
                                        </div>
                                    </div> 
                                ); 
                            })} 
                        </div>
                    </div> 
                </div> 
            </div> 
            <GiftPreviewModal show={showGiftPreview} onClose={() => setShowGiftPreview(false)} gift={selectedGift} lang={lang} onBuy={handleBuyGiftForSelf} currency={currency} />
            <SendInventoryGiftModal show={showSendToFriend} onClose={() => setShowSendToFriend(false)} gift={selectedInventoryGift} friendsData={friendsData} userData={userData} lang={lang} onSend={onSendInventoryGift} onUpdate={onUpdate} />
        </> 
    ); 
};

// Send Inventory Gift Modal
const SendInventoryGiftModal = ({ show, onClose, gift, friendsData, userData, lang, onSend, onUpdate }) => {
    const t = TRANSLATIONS[lang];
    const [sending, setSending] = useState(false);
    
    if (!show || !gift) return null;
    
    const handleSend = async (friend) => {
        setSending(true);
        try {
            const inventory = userData.inventory || { gifts: [] };
            const newInventory = { ...inventory };
            const giftIndex = newInventory.gifts.findIndex(g => g.id === gift.id);
            if (giftIndex >= 0) {
                if (newInventory.gifts[giftIndex].count > 1) { newInventory.gifts[giftIndex].count -= 1; }
                else { newInventory.gifts.splice(giftIndex, 1); }
            }
            await usersCollection.doc(userData.uid).update({ inventory: newInventory });
            await usersCollection.doc(friend.uid).update({ charisma: firebase.firestore.FieldValue.increment(gift.charisma) });
            await notificationsCollection.add({ toUserId: friend.uid, fromUserId: userData.uid, fromName: userData.displayName, type: 'gift', message: `${userData.displayName} ${t.giftNotification}: ${gift.emoji}`, timestamp: firebase.firestore.FieldValue.serverTimestamp(), read: false });
            playSound('gift');
            if (onUpdate) onUpdate();
            onClose();
        } catch (e) { console.error('Send gift error:', e); }
        setSending(false);
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '350px' }}>
                <div className="modal-header"><h2 className="modal-title">{t.sendToFriend}</h2><ModalCloseBtn onClose={onClose} /></div>
                <div className="modal-body">
                    <div className="text-center mb-4 p-3 bg-white/5 rounded-lg"><span className="text-4xl">{gift.emoji}</span><div className="text-sm font-bold mt-1">{lang === 'ar' ? gift.name_ar : gift.name_en}</div><div className="text-xs text-purple-400">+{formatCharisma(gift.charisma)} {t.charisma}</div></div>
                    <h4 className="text-xs font-bold text-gray-400 mb-2">{t.selectFriend}</h4>
                    {!friendsData || friendsData.length === 0 ? (<p className="text-xs text-gray-500 text-center py-4">{t.noFriendsToSend}</p>) : (
                        <div className="max-h-[200px] overflow-y-auto space-y-1">
                            {friendsData.map(friend => (
                                <button key={friend.uid} onClick={() => handleSend(friend)} disabled={sending} className="w-full flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition">
                                    <AvatarWithFrame photoURL={friend.photoURL} equipped={friend.equipped} size="sm" />
                                    <div className="flex-1 text-left"><div className="text-sm font-medium">{friend.displayName}</div><div className="text-[10px] text-gray-400">✨ {formatCharisma(friend.charisma || 0)}</div></div>
                                    <span className="text-lg">📤</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Match Summary Modal
const MatchSummaryModal = ({ show, onClose, room, players, lang }) => { 
    const t = TRANSLATIONS[lang]; 
    if(!show || !room) return null; 
    const duration = room.finishedAt && room.startedAt ? formatDuration(room.finishedAt - room.startedAt) : "N/A"; 
    return ( 
        <div className="modal-overlay" onClick={onClose}> 
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h2 className="modal-title">{t.summaryTitle}</h2><ModalCloseBtn onClose={onClose} /></div>
                <div className="modal-body text-center">
                    <div className="grid grid-cols-2 gap-3 mb-4"><div className="bg-black/30 p-2 rounded-lg"><span className="text-gray-400">{t.matchDuration}</span><div className="text-lg font-bold text-white">{duration}</div></div><div className="bg-black/30 p-2 rounded-lg"><span className="text-gray-400">{t.mvp}</span><div className="text-lg font-bold text-primary truncate">{room.status === 'finished_spy_caught' ? 'Agents' : 'Spy'}</div></div></div> 
                    <div className="max-h-32 overflow-y-auto mb-4 space-y-1">{players && players.map(p => (<div key={p.uid} className="flex justify-between items-center bg-white/5 px-2 py-1 rounded text-xs"><span>{p.name}</span><span className={p.status === 'active' ? 'text-green-400' : 'text-red-400'}>{p.status === 'active' ? 'Survived' : 'Out'}</span></div>))}</div>
                </div>
                <div className="modal-footer"><button onClick={onClose} className="btn-neon w-full py-2 rounded-lg text-sm">{t.ok}</button></div>
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
            await reportsCollection.add({ reporterId: currentUser.uid, reporterName: currentUser.displayName, reportedId: targetUser.uid, reportedName: targetUser.displayName, reason: selectedReason, details: details, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
            setMsg(t.reportSent);
            setTimeout(() => { setMsg(''); onClose(); }, 1500);
        } catch (e) { setMsg("Error submitting report"); }
        setSubmitting(false);
    };
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h2 className="modal-title">{t.reportTitle}</h2><ModalCloseBtn onClose={onClose} /></div>
                <div className="modal-body">
                    <p className="text-xs text-gray-400 mb-3">{t.reportDesc}</p>
                    {reasons.map(r => (<div key={r.id} onClick={() => setSelectedReason(r.id)} className={`report-reason-option ${selectedReason === r.id ? 'selected' : ''}`}><span>{r.label}</span></div>))}
                    <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Additional details (optional)" className="input-dark w-full mt-3 text-xs" rows={2} />
                </div>
                <div className="modal-footer">
                    {msg && <div className="text-center text-xs text-cyan-400 mb-2">{msg}</div>}
                    <div className="flex gap-2">
                        <button onClick={onClose} className="btn-ghost flex-1 py-2 rounded-lg text-sm">{t.reportCancel}</button>
                        <button onClick={handleSubmit} disabled={!selectedReason || submitting} className="btn-danger flex-1 py-2 rounded-lg text-sm">{t.reportSubmit}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Notification Center Component - FIXED (shows all content)
const NotificationCenter = ({ show, onClose, notifications, onClearAll, onMarkRead, lang }) => {
    const t = TRANSLATIONS[lang];
    if (!show) return null;
    
    return (
        <div className="notification-dropdown animate-pop">
            <div className="notification-dropdown-header">
                <span className="notification-dropdown-title">{t.notifications}</span>
                {notifications.length > 0 && (<button onClick={onClearAll} className="notification-clear-all">{t.clearAll}</button>)}
            </div>
            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="notification-empty">{t.noNotifications}</div>
                ) : (
                    notifications.map(notif => (
                        <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`} onClick={() => onMarkRead(notif.id)}>
                            <div className="flex items-center">
                                <span className="notification-item-icon">{notif.type === 'friend_request' ? '👋' : notif.type === 'gift' ? '🎁' : notif.type === 'message' ? '💬' : '🔔'}</span>
                                <div className="notification-item-content">
                                    <div className="notification-item-title">{notif.message}</div>
                                    <div className="notification-item-time">{formatTime(notif.timestamp)}</div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// ==========================================
// PRO SPY - COMPLETE SCRIPT PART 2 - FIXED
// App Component with ALL Fixes
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
    const [turnTimer, setTurnTimer] = useState(30);
    const [votingTimer, setVotingTimer] = useState(30);
    const [wordSelTimer, setWordSelTimer] = useState(30);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [setupMode, setSetupMode] = useState('normal');
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // NEW: Password visibility
    const [activeView, setActiveView] = useState('lobby');
    const [showDropdown, setShowDropdown] = useState(false);
    const [joinError, setJoinError] = useState('');
    const [alertMessage, setAlertMessage] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState([]);
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
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    
    // NEW: Private Chat Modal State
    const [showPrivateChat, setShowPrivateChat] = useState(false);
    const [chatFriend, setChatFriend] = useState(null);
    
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
    // NOTIFICATIONS LISTENER - FIXED (No orderBy)
    // ==========================================
    useEffect(() => {
        if (!user || isGuest) return;
        
        const unsub = notificationsCollection
            .where('toUserId', '==', user.uid)
            .limit(50)
            .onSnapshot(snap => {
                let notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // Sort in client side
                notifs.sort((a, b) => {
                    const timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds || 0;
                    const timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds || 0;
                    return timeB - timeA;
                });
                setNotifications(notifs);
                setUnreadNotifications(notifs.filter(n => !n.read).length);
            });
        
        return unsub;
    }, [user, isGuest]);

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
    // OTHER LISTENERS - FIXED (Real-time friends, No orderBy)
    // ==========================================
    
    // Leaderboard - Fixed (no orderBy on server, sort in client)
    useEffect(() => { 
        if (activeView === 'leaderboard') { 
            usersCollection.limit(100).get().then(snap => { 
                let data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => !d.isAnonymous);
                // Sort by wins in client side
                data.sort((a, b) => (b.stats?.wins || 0) - (a.stats?.wins || 0));
                setLeaderboardData(data); 
            }); 
        } 
    }, [activeView]);
    
    // Friends & Requests - FIXED (Real-time listeners)
    useEffect(() => { 
        if (activeView === 'friends' && userData && user) { 
            // Real-time listener for friends data
            if (userData.friends?.length > 0) {
                const unsub = usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', userData.friends)
                    .onSnapshot(snap => {
                        setFriendsData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                    });
                return unsub;
            } else { 
                setFriendsData([]); 
            }
        } 
    }, [activeView, userData?.friends, user]);
    
    // Friend Requests - FIXED (Real-time listener)
    useEffect(() => { 
        if (userData && user && !isGuest) {
            if (userData.friendRequests?.length > 0) {
                const unsub = usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', userData.friendRequests)
                    .onSnapshot(snap => {
                        setFriendRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                    });
                return unsub;
            } else { 
                setFriendRequests([]); 
            }
        } 
    }, [userData?.friendRequests, user, isGuest]);
    
    // Chats Meta Listener
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
    
    useEffect(() => { if (room?.status === 'discussing' && room?.turnEndTime) { const interval = setInterval(() => { const remaining = Math.max(0, Math.floor((room.turnEndTime - Date.now()) / 1000)); setTurnTimer(remaining); if (remaining <= 0) { handleSkipTurn(true); clearInterval(interval); } }, 1000); return () => clearInterval(interval); } else setTurnTimer(30); }, [room?.status, room?.turnEndTime]);
    useEffect(() => { if (room?.status === 'voting' && room?.votingEndTime) { const interval = setInterval(() => { const remaining = Math.max(0, Math.floor((room.votingEndTime - Date.now()) / 1000)); setVotingTimer(remaining); if (remaining <= 0) { resolveVotes(true); clearInterval(interval); } }, 1000); return () => clearInterval(interval); } else setVotingTimer(30); }, [room?.status, room?.votingEndTime]);
    useEffect(() => { if (room?.status === 'word_selection' && room?.wordSelEndTime) { const interval = setInterval(() => { const remaining = Math.max(0, Math.floor((room.wordSelEndTime - Date.now()) / 1000)); setWordSelTimer(remaining); if (remaining <= 0) { finishWordSelection(); clearInterval(interval); } }, 1000); return () => clearInterval(interval); } else setWordSelTimer(30); }, [room?.status, room?.wordSelEndTime]);
    useEffect(() => { const handleBeforeUnload = async (e) => { if (room && user) { handleLeaveRoom(true); } }; window.addEventListener('beforeunload', handleBeforeUnload); return () => window.removeEventListener('beforeunload', handleBeforeUnload); }, [room, user]);

    // ==========================================
    // AUTH FUNCTIONS
    // ==========================================
    const handleGoogleLogin = async () => { const provider = new firebase.auth.GoogleAuthProvider(); try { await auth.signInWithPopup(provider); } catch (e) { console.error(e); } };
    const handleLogout = async () => { await auth.signOut(); setShowDropdown(false); setNickname(''); localStorage.removeItem('pro_spy_nick'); };
    const getDefaultPhoto = (uData, name) => uData?.photoURL || `https://ui-avatars.com/api/?name=${name || 'Guest'}&background=random`;

    // ==========================================
    // NOTIFICATION FUNCTIONS
    // ==========================================
    const createNotification = async (toUserId, type, message, fromUserId, fromName) => {
        try {
            await notificationsCollection.add({
                toUserId, fromUserId, fromName, type, message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            });
            playSound('message');
        } catch (e) { console.error('Notification error:', e); }
    };

    const markNotificationRead = async (notifId) => {
        try { await notificationsCollection.doc(notifId).update({ read: true }); } 
        catch (e) { console.error('Mark read error:', e); }
    };

    const clearAllNotifications = async () => {
        try {
            const batch = db.batch();
            notifications.forEach(n => { batch.delete(notificationsCollection.doc(n.id)); });
            await batch.commit();
            setNotifications([]);
            setUnreadNotifications(0);
        } catch (e) { console.error('Clear notifications error:', e); }
    };

    // ==========================================
    // ROOM FUNCTIONS
    // ==========================================
    const handleCreateGame = async () => { 
        if (!nickname.trim()) return; if (isPrivate && !password.trim()) { setAlertMessage(t.privateRoomError); return; }
        playSound('click'); setLoading(true); 
        let uid = user?.uid; 
        if (!uid) { const anon = await auth.signInAnonymously(); uid = anon.user.uid; setUser(anon.user); } 
        const id = Math.random().toString(36).substring(2, 7).toUpperCase(); 
        await roomsCollection.doc(id).set({ id, admin: uid, status: 'waiting', players: [{ uid: uid, name: nickname, status: 'active', photo: getDefaultPhoto(userData, nickname), role: null, equipped: userData?.equipped || {} }], scenario: null, spyId: null, currentTurnUID: null, turnEndTime: null, votingEndTime: null, currentRound: 0, messages: [], votes: {}, usedLocations: [], wordVotes: {}, chosenWord: null, wordSelEndTime: null, votingRequest: null, mode: setupMode, isPrivate: isPrivate, password: isPrivate ? password : null, startedAt: null, summaryShown: false }); 
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
            roles[spy.uid] = 'spy'; let potentialWhites = activePlayers.filter(p => p.uid !== spy.uid); 
            if(potentialWhites.length > 0) { const mrWhite = potentialWhites[Math.floor(Math.random() * potentialWhites.length)]; roles[mrWhite.uid] = 'mrwhite'; potentialWhites = potentialWhites.filter(p => p.uid !== mrWhite.uid); } 
            if(potentialWhites.length > 0) { const informant = potentialWhites[Math.floor(Math.random() * potentialWhites.length)]; roles[informant.uid] = 'informant'; } 
            activePlayers.forEach(p => { if(!roles[p.uid]) roles[p.uid] = 'agent'; }); 
        } else { activePlayers.forEach(p => roles[p.uid] = p.uid === spy.uid ? 'spy' : 'agent'); } 
        let potentialStarters = activePlayers.filter(p => roles[p.uid] !== 'spy'); if (potentialStarters.length === 0) potentialStarters = activePlayers; 
        const firstPlayer = potentialStarters[Math.floor(Math.random() * potentialStarters.length)]; 
        await roomsCollection.doc(roomId).update({ status: 'word_selection', scenario, spyId: spy.uid, currentTurnUID: firstPlayer.uid, turnEndTime: null, currentRound: 1, players: room.players.map(p => ({ ...p, vote: null, role: roles[p.uid] || 'agent' })), usedLocations: firebase.firestore.FieldValue.arrayUnion(scenario.loc_en), messages: [], votes: {}, wordVotes: {}, chosenWord: null, wordSelEndTime: Date.now() + 30000, votingRequest: null, startedAt: firebase.firestore.FieldValue.serverTimestamp() }); 
    };

    const submitWordVote = async (word) => { if (!user || !room || room.status !== 'word_selection') return; playSound('click'); const voteUpdate = {}; voteUpdate[`wordVotes.${user.uid}`] = word; await roomsCollection.doc(roomId).update(voteUpdate); };
    const finishWordSelection = async () => { if (!room || room.status !== 'word_selection') return; const freshSnap = await roomsCollection.doc(roomId).get(); const freshData = freshSnap.data(); const counts = {}; Object.values(freshData.wordVotes || {}).forEach(v => counts[v] = (counts[v] || 0) + 1); let maxCount = 0; let chosenWord = (lang === 'ar' ? freshData.scenario.words_ar[0] : freshData.scenario.words_en[0]); for (const w in counts) { if (counts[w] > maxCount) { maxCount = counts[w]; chosenWord = w; } } await roomsCollection.doc(roomId).update({ status: 'discussing', turnEndTime: Date.now() + 30000, chosenWord: chosenWord, wordSelEndTime: null }); };
    const handleSkipTurn = async (forced = false) => { if (!room) return; if (!forced && room.currentTurnUID !== user?.uid) return; if (forced && room.status !== 'discussing') return; nextTurn(); };
    const nextTurn = async () => { if (!room) return; const activePlayers = room.players.filter(p => p.status === 'active'); const currentIndex = activePlayers.findIndex(p => p.uid === room.currentTurnUID); const nextIndex = (currentIndex + 1) % activePlayers.length; await roomsCollection.doc(roomId).update({ currentTurnUID: activePlayers[nextIndex].uid, turnEndTime: Date.now() + 30000 }); };
    const requestVoting = async () => { if (!room || room.status !== 'discussing') return; playSound('click'); if (room.admin === user?.uid) { await triggerVoting(); return; } await roomsCollection.doc(roomId).update({ votingRequest: { requestedBy: user.uid, votes: { [user.uid]: true } } }); };
    const agreeToVote = async () => { if (!room || !room.votingRequest) return; playSound('click'); const currentVotes = room.votingRequest.votes || {}; const newVotes = { ...currentVotes, [user.uid]: true }; const activePlayers = room.players.filter(p => p.status === 'active'); if (user?.uid === room.admin) { await triggerVoting(); return; } const agreeCount = Object.values(newVotes).filter(v => v === true).length; const majorityCount = Math.floor(activePlayers.length / 2) + 1; if (agreeCount >= majorityCount) { await triggerVoting(); } else { await roomsCollection.doc(roomId).update({ "votingRequest.votes": newVotes }); } };
    const declineVote = async () => { if (!room || !room.votingRequest) return; playSound('click'); const currentVotes = room.votingRequest.votes || {}; const newVotes = { ...currentVotes, [user.uid]: false }; const activePlayers = room.players.filter(p => p.status === 'active'); const declineCount = Object.values(newVotes).filter(v => v === false).length; const majorityCount = Math.floor(activePlayers.length / 2) + 1; if (declineCount >= majorityCount) { await roomsCollection.doc(roomId).update({ votingRequest: null }); } else { await roomsCollection.doc(roomId).update({ "votingRequest.votes": newVotes }); } };
    const triggerVoting = async () => { playSound('click'); const sysMsg = { sender: 'system', name: 'SYSTEM', text: t.votingStarted, time: Date.now() }; await roomsCollection.doc(roomId).update({ status: 'voting', currentTurnUID: null, turnEndTime: null, votingEndTime: Date.now() + 30000, messages: firebase.firestore.FieldValue.arrayUnion(sysMsg), votingRequest: null }); };
    const sendMessage = async (text) => { if (!text.trim() || !user) return; playSound('click'); const msg = { sender: user.uid, name: nickname, text: text, time: Date.now() }; await roomsCollection.doc(roomId).update({ messages: firebase.firestore.FieldValue.arrayUnion(msg) }); };
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

    const handleMrWhiteGuess = async (guess) => { if(!room || !user) return; const me = room.players.find(p => p.uid === user.uid); if(me.role !== 'mrwhite') return; const correct = (lang === 'ar' ? room.scenario?.loc_ar : room.scenario?.loc_en); if(guess === correct) { playSound('success'); await endGame(false, true, true); } else { setAlertMessage("Wrong guess!"); } };

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
        await batch.commit(); checkGameAchievements(players, spyId, spyWin); 
    };

    const checkGameAchievements = async (players, spyId, spyWin) => { 
        await Promise.all(players.map(async (p) => { 
            if(!p || !p.uid || p.isAnonymous) return; const userRef = usersCollection.doc(p.uid); const doc = await userRef.get(); if(!doc.exists) return; 
            const data = doc.data(); const wins = (data.stats?.wins || 0); const charisma = (data.charisma || 0); const currentAch = data.achievements || []; let newAch = [...currentAch]; 
            if(wins >= 1 && !currentAch.includes('first_win')) newAch.push('first_win'); 
            if(wins >= 5 && !currentAch.includes('wins_5')) newAch.push('wins_5'); 
            if(wins >= 10 && !currentAch.includes('wins_10')) newAch.push('wins_10'); 
            if(wins >= 20 && !currentAch.includes('wins_20')) newAch.push('wins_20'); 
            if(wins >= 50 && !currentAch.includes('wins_50')) newAch.push('wins_50'); 
            if(wins >= 100 && !currentAch.includes('wins_100')) newAch.push('wins_100');
            if(charisma >= 1000 && !currentAch.includes('charisma_1000')) newAch.push('charisma_1000'); 
            if(charisma >= 10000 && !currentAch.includes('charisma_10000')) newAch.push('charisma_10000'); 
            if(charisma >= 100000 && !currentAch.includes('charisma_100000')) newAch.push('charisma_100000');
            if(!spyWin){ const votesAgainstMe = Object.values(room.votes || {}).filter(v => v === p.uid).length; if(votesAgainstMe === 0 && !currentAch.includes('ghost_protocol')) newAch.push('ghost_protocol'); } 
            if(newAch.length > currentAch.length) { try { await userRef.update({ achievements: newAch }); setNotification(`${t.achUnlock}`); } catch(err) { console.error("Ach err", err); } } 
        })); 
    };

    const endGame = async (agentsWin, mrWhiteWin = false) => { let status = agentsWin ? 'finished_spy_caught' : 'finished_spy_wins'; if(mrWhiteWin) status = 'finished_mrwhite_wins'; await roomsCollection.doc(roomId).update({ status, turnEndTime: null, votingEndTime: null, finishedAt: firebase.firestore.FieldValue.serverTimestamp() }); };
    const resetGame = async () => { playSound('click'); await roomsCollection.doc(roomId).update({ status: 'waiting', scenario: null, spyId: null, currentTurnUID: null, currentRound: 0, votes: {}, messages: [], votingEndTime: null, turnEndTime: null, players: room.players.map(p => ({ uid: p.uid, name: p.name, status: 'active', photo: p.photo, role: null })), wordVotes: {}, chosenWord: null, wordSelEndTime: null, votingRequest: null, startedAt: null, finishedAt: null, summaryShown: false }); setShowSummary(false); };

    // ==========================================
    // FRIEND FUNCTIONS
    // ==========================================
    const openProfile = (uid) => { if(!uid) return; setTargetProfileUID(uid); setShowUserProfile(true); };
    
    // NEW: Open Private Chat
    const openPrivateChat = (friend) => { 
        setChatFriend(friend); 
        setShowPrivateChat(true);
        const cId = getChatId(user.uid, friend.uid);
        setOpenChatId(cId);
        // Mark as read
        chatsCollection.doc(cId).update({
            [`unread.${user.uid}`]: 0
        }).catch(() => {});
    };
    
    const closePrivateChat = () => { 
        setShowPrivateChat(false); 
        setChatFriend(null); 
        setOpenChatId(null); 
    };
    
    const handleSendRequest = async (targetUid) => { 
        if (!targetUid || targetUid === userData.customId || isGuest) return; 
        const friendUid = targetUid; 
        if (userData.friends?.includes(friendUid)) return; 
        if (userData.friendRequests?.includes(friendUid)) return; 
        await usersCollection.doc(friendUid).update({ friendRequests: firebase.firestore.FieldValue.arrayUnion(user.uid) });
        await createNotification(friendUid, 'friend_request', `${userData.displayName} ${t.friendRequest}`, user.uid, userData.displayName);
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
        const friendData = friendDoc.data();
        await createNotification(friendUid, 'friend_request', `${userData.displayName} ${t.friendRequest}`, user.uid, userData.displayName);
        setFriendSearchMsg(t.requestSent); setAddFriendId(''); 
    };
    
    const handleAcceptRequest = async (fromUid) => { 
        const batch = db.batch(); 
        const currentUserRef = usersCollection.doc(user.uid); 
        batch.update(currentUserRef, { friends: firebase.firestore.FieldValue.arrayUnion(fromUid), friendRequests: firebase.firestore.FieldValue.arrayRemove(fromUid) }); 
        const senderRef = usersCollection.doc(fromUid); 
        batch.update(senderRef, { friends: firebase.firestore.FieldValue.arrayUnion(user.uid) }); 
        await batch.commit(); 
        setNotification(t.newFriend); 
    };
    
    const handleRejectRequest = async (fromUid) => { await usersCollection.doc(user.uid).update({ friendRequests: firebase.firestore.FieldValue.arrayRemove(fromUid) }); };

    // ==========================================
    // GIFT FUNCTIONS
    // ==========================================
    const handleSendGiftToUser = async (gift, targetUser) => {
        const currency = userData?.currency || 0;
        if (currency < gift.cost) return;
        const cashbackAmount = Math.floor(gift.cost * (gift.cashback / 100));
        const newCurrency = currency - gift.cost + cashbackAmount;
        try {
            await usersCollection.doc(user.uid).update({ currency: newCurrency });
            await usersCollection.doc(targetUser.uid).update({ charisma: firebase.firestore.FieldValue.increment(gift.charisma) });
            await createNotification(targetUser.uid, 'gift', `${userData.displayName} ${t.giftNotification}: ${gift.emoji}`, user.uid, userData.displayName);
            playSound('gift');
            setNotification(`${t.giftSent}`);
        } catch (error) { console.error("Gift error:", error); }
    };

    const handleSendInventoryGift = async (gift, friend) => {
        try {
            const inventory = userData.inventory || { gifts: [] };
            const newInventory = { ...inventory };
            const giftIndex = newInventory.gifts.findIndex(g => g.id === gift.id);
            if (giftIndex >= 0) {
                if (newInventory.gifts[giftIndex].count > 1) { newInventory.gifts[giftIndex].count -= 1; }
                else { newInventory.gifts.splice(giftIndex, 1); }
            }
            await usersCollection.doc(user.uid).update({ inventory: newInventory });
            await usersCollection.doc(friend.uid).update({ charisma: firebase.firestore.FieldValue.increment(gift.charisma) });
            await notificationsCollection.add({ toUserId: friend.uid, fromUserId: user.uid, fromName: userData.displayName, type: 'gift', message: `${userData.displayName} ${t.giftNotification}: ${gift.emoji}`, timestamp: firebase.firestore.FieldValue.serverTimestamp(), read: false });
            playSound('gift');
            setNotification(`${t.giftSent}`);
        } catch (e) { console.error('Send inventory gift error:', e); }
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
    
    // Total unread = chat unread + friend requests + notifications
    const totalFriendsUnread = totalUnread + (friendRequests?.length || 0);
    
    const handleCopy = () => { navigator.clipboard.writeText(roomId); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <div className="min-h-screen flex flex-col items-center p-2 md:p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}> 
            <NotificationToast message={notification} onClose={() => setNotification(null)} />
            <TutorialModal show={showTutorial} onClose={() => { setShowTutorial(false); localStorage.setItem('pro_spy_tutorial_v2', 'true'); }} lang={lang} />
            <MatchSummaryModal show={showSummary} onClose={() => setShowSummary(false)} room={room} players={room?.players} lang={lang} />
            <ShopModal show={showShop} onClose={() => setShowShop(false)} userData={userData} lang={lang} onUpdate={() => {}} onSendInventoryGift={handleSendInventoryGift} friendsData={friendsData} />
            <MyAccountModal show={showMyAccount} onClose={() => setShowMyAccount(false)} userData={userData} user={user} lang={lang} onLogout={handleLogout} onOpenShop={() => { setShowMyAccount(false); setShowShop(true); }} />
            <BrowseRoomsModal show={showBrowseRooms} onClose={() => setShowBrowseRooms(false)} nickname={nickname} userData={userData} lang={lang} onJoin={(id) => { setRoomId(id); }} isGuest={isGuest} />
            <UserProfileModal show={showUserProfile} onClose={() => setShowUserProfile(false)} targetUID={targetProfileUID} currentUser={userData} lang={lang} onSendGift={handleSendGiftToUser} onAddFriend={handleSendRequest} />
            
            {/* NEW: Private Chat Modal */}
            <PrivateChatModal show={showPrivateChat} onClose={closePrivateChat} friend={chatFriend} currentUser={userData} user={user} lang={lang} />
            
            {alertMessage && ( 
                <div className="alert-modal" onClick={() => setAlertMessage(null)}> 
                    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><span></span><ModalCloseBtn onClose={() => setAlertMessage(null)} /></div>
                        <div className="modal-body text-center"><div className="text-2xl mb-2">🚫</div><p className="font-bold mb-4">{alertMessage}</p><button onClick={() => setAlertMessage(null)} className="btn-ghost px-4 py-2 rounded-lg text-sm">{t.ok}</button></div>
                    </div> 
                </div> 
            )}
            
            {/* Setup Modal */}
            {showSetupModal && ( 
                <div className="modal-overlay" onClick={()=>setShowSetupModal(false)}> 
                    <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}> 
                        <div className="modal-header"><h2 className="modal-title">{t.create}</h2><ModalCloseBtn onClose={() => setShowSetupModal(false)} /></div>
                        <div className="modal-body">
                            <div className="space-y-3"> 
                                <div><label className="text-[10px] text-gray-400 block mb-1">{t.nickname}</label><input className={`${isLoggedIn ? 'input-locked' : 'input-dark'} w-full p-2 rounded font-bold text-sm`} value={nickname} onChange={e => { setNickname(e.target.value); localStorage.setItem('pro_spy_nick', e.target.value); }} disabled={isLoggedIn} /></div>
                                <div className="flex gap-2">
                                    <button onClick={() => setSetupMode('normal')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${setupMode === 'normal' ? 'btn-neon' : 'btn-ghost'}`}>{t.normalMode}</button>
                                    <button onClick={() => setSetupMode('advanced')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${setupMode === 'advanced' ? 'btn-neon' : 'btn-ghost'}`}>{t.advancedMode}</button>
                                </div>
                                <p className="text-[10px] text-gray-400 text-center">{setupMode === 'normal' ? t.modeNormalDesc : t.modeAdvDesc}</p>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} id="privateCheck" />
                                    <label htmlFor="privateCheck" className="text-xs">{t.privateRoom}</label>
                                </div>
                                {isPrivate && (
                                    // NEW: Password field with eye icon
                                    <div className="relative">
                                        <input 
                                            type={showPassword ? 'text' : 'password'} 
                                            value={password} 
                                            onChange={e => setPassword(e.target.value)} 
                                            placeholder={t.password} 
                                            className="input-dark w-full p-2 pr-10 rounded text-sm" 
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                        >
                                            {showPassword ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer"><button onClick={handleCreateGame} disabled={loading || !nickname.trim()} className="btn-neon w-full py-2 rounded-lg text-sm font-bold">{loading ? t.loading : t.create}</button></div>
                    </div> 
                </div> 
            )}
            
            {/* Main Header */}
            <header className="w-full max-w-md flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <div className="logo-container"><div className="logo-border"></div><span className="text-xl">🕵️</span></div>
                    <div><h1 className="game-title text-lg font-tech">{t.appName}</h1><p className="text-[8px] text-gray-500 uppercase tracking-wider">{t.tagline}</p></div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Notification Bell - FIXED with badge */}
                    {isLoggedIn && (
                        <div className="notification-center relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="notification-bell">
                                <span className="notification-bell-icon">🔔</span>
                                {unreadNotifications > 0 && (<span className="notification-badge">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>)}
                            </button>
                            <NotificationCenter show={showNotifications} onClose={() => setShowNotifications(false)} notifications={notifications} onClearAll={clearAllNotifications} onMarkRead={markNotificationRead} lang={lang} />
                        </div>
                    )}
                    <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="text-xs bg-white/10 px-2 py-1 rounded">{t.langBtn}</button>
                    <div className="relative">
                        <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
                            <AvatarWithFrame photoURL={userData?.photoURL} equipped={userData?.equipped} size="sm" onClick={() => { setShowMyAccount(true); setShowDropdown(false); }} />
                            <span className="text-[10px] text-gray-300 max-w-[60px] truncate">{userData?.displayName || t.guest}</span>
                        </button>
                        {showDropdown && (
                            <div className="dropdown-menu glass-panel rounded-lg p-1">
                                {isGuest ? (
                                    <button onClick={handleGoogleLogin} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2"><span>🔑</span> {t.loginGoogle}</button>
                                ) : (
                                    <>
                                        <button onClick={() => { setShowMyAccount(true); setShowDropdown(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2"><span>👤</span> {t.myAccount}</button>
                                        <button onClick={() => { setShowShop(true); setShowDropdown(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2"><span>🛒</span> {t.shop}</button>
                                        <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 rounded flex items-center gap-2 text-red-400"><span>🚪</span> {t.logout}</button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>
            
            {/* Main Content - Not in Room */}
            {!room && (
                <main className="w-full max-w-md flex-1 flex flex-col">
                    <div className="tab-container mb-3">
                        <button onClick={() => setActiveView('lobby')} className={`tab-button ${activeView === 'lobby' ? 'active' : ''}`}>{t.tabLobby}</button>
                        <button onClick={() => setActiveView('leaderboard')} className={`tab-button ${activeView === 'leaderboard' ? 'active' : ''}`}>{t.tabLeaderboard}</button>
                        <button onClick={() => setActiveView('friends')} className={`tab-button relative ${activeView === 'friends' ? 'active' : ''}`}>
                            {t.tabFriends}
                            {/* FIXED: Badge shows chat unread + friend requests */}
                            {totalFriendsUnread > 0 && <span className="friends-tab-badge">{totalFriendsUnread > 9 ? '9+' : totalFriendsUnread}</span>}
                        </button>
                    </div>
                    
                    {/* Lobby View */}
                    {activeView === 'lobby' && (
                        <div className="glass-panel rounded-xl p-4 flex-1">
                            <div className="space-y-3">
                                <div><label className="text-[10px] text-gray-400 block mb-1">{t.nickname}</label><input className={`${isLoggedIn ? 'input-locked' : 'input-dark'} w-full p-3 rounded-lg font-bold`} value={nickname} onChange={e => { setNickname(e.target.value); localStorage.setItem('pro_spy_nick', e.target.value); }} disabled={isLoggedIn} placeholder={t.nickname} /></div>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowSetupModal(true)} disabled={!nickname.trim()} className="btn-neon flex-1 py-3 rounded-lg font-bold text-sm">{t.create}</button>
                                    <button onClick={() => setShowBrowseRooms(true)} className="btn-ghost px-4 py-3 rounded-lg text-sm">{t.browse}</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input className="input-dark flex-1 p-3 rounded-lg text-center font-mono uppercase tracking-wider" value={inputCode} onChange={e => setInputCode(e.target.value.toUpperCase())} placeholder={t.codePlaceholder} maxLength={6} />
                                    <button onClick={() => handleJoinGame(inputCode, '')} disabled={loading || !inputCode.trim() || !nickname.trim()} className="btn-neon px-4 py-3 rounded-lg font-bold text-sm">{loading ? '...' : t.join}</button>
                                </div>
                                {joinError && <p className="text-xs text-red-400 text-center">{joinError}</p>}
                            </div>
                        </div>
                    )}
                    
                    {/* Leaderboard View */}
                    {activeView === 'leaderboard' && (
                        <div className="glass-panel rounded-xl p-3 flex-1 overflow-hidden">
                            <div className="overflow-y-auto max-h-[60vh]">
                                {leaderboardData.map((player, i) => (
                                    <div key={player.id} onClick={() => openProfile(player.id)} className="leaderboard-row cursor-pointer">
                                        <span className="w-6 text-xs font-bold text-gray-500">{i + 1}</span>
                                        <AvatarWithFrame photoURL={player.photoURL} equipped={player.equipped} size="sm" onClick={() => openProfile(player.id)} />
                                        <span className="flex-1 text-sm font-medium truncate">{player.displayName}</span>
                                        <div className="text-right"><div className="text-xs font-bold text-primary">{player.stats?.wins || 0} {t.wins}</div><div className="text-[10px] text-gray-500">✨ {formatCharisma(player.charisma || 0)}</div></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Friends View */}
                    {activeView === 'friends' && (
                        <div className="glass-panel rounded-xl p-3 flex-1 overflow-hidden">
                            {isGuest ? (
                                <div className="text-center py-8"><p className="text-xs text-gray-400">{t.noPermission}</p></div>
                            ) : (
                                <>
                                    <div className="flex gap-2 mb-3">
                                        <input className="input-dark flex-1 p-2 rounded text-xs" value={addFriendId} onChange={e => setAddFriendId(e.target.value)} placeholder={t.friendIdPlaceholder} />
                                        <button onClick={handleSearchRequest} className="btn-neon px-3 py-2 rounded text-xs">{t.addFriend}</button>
                                    </div>
                                    {friendSearchMsg && <p className="text-xs text-cyan-400 text-center mb-2">{friendSearchMsg}</p>}
                                    {friendRequests.length > 0 && (
                                        <div className="mb-3">
                                            <h4 className="text-xs font-bold text-gray-400 mb-2">{t.incomingRequests}</h4>
                                            {friendRequests.map(req => (
                                                <div key={req.id} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg mb-1">
                                                    <AvatarWithFrame photoURL={req.photoURL} equipped={req.equipped} size="sm" onClick={() => openProfile(req.id)} />
                                                    <span className="flex-1 text-xs truncate">{req.displayName}</span>
                                                    <button onClick={() => handleAcceptRequest(req.id)} className="btn-success px-2 py-1 rounded text-[10px]">{t.accept}</button>
                                                    <button onClick={() => handleRejectRequest(req.id)} className="btn-danger px-2 py-1 rounded text-[10px]">{t.reject}</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <h4 className="text-xs font-bold text-gray-400 mb-2">{t.tabFriends} ({friendsData.length})</h4>
                                    <div className="overflow-y-auto max-h-[40vh]">
                                        {friendsData.length === 0 ? (
                                            <p className="text-xs text-gray-500 text-center py-4">{t.noFriends}</p>
                                        ) : (
                                            friendsData.map(friend => {
                                                const chatMeta = chatsMeta[getChatId(user?.uid, friend.uid)];
                                                const unreadCount = chatMeta?.unread?.[user.uid] || 0;
                                                const isOnline = friend.lastActive && (Date.now() - friend.lastActive.toMillis() < 120000);
                                                return (
                                                    <div key={friend.id} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg mb-1">
                                                        <AvatarWithFrame photoURL={friend.photoURL} equipped={friend.equipped} size="sm" onClick={() => openProfile(friend.id)} />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1"><span className="text-xs font-medium truncate">{friend.displayName}</span><span className={isOnline ? 'status-online' : 'status-offline'}></span></div>
                                                            <div className="text-[10px] text-gray-500">✨ {formatCharisma(friend.charisma || 0)}</div>
                                                        </div>
                                                        {unreadCount > 0 && <span className="friend-unread-badge">{unreadCount}</span>}
                                                        {/* FIXED: Chat button opens PrivateChatModal */}
                                                        <button onClick={() => openPrivateChat(friend)} className="btn-ghost px-2 py-1 rounded text-[10px]">💬</button>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </main>
            )}
            
            {/* Room View */}
            {room && (
                <main className="w-full max-w-md flex-1 flex flex-col">
                    <div className="glass-panel rounded-lg p-2 mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleCopy()} className="bg-white/10 px-2 py-1 rounded text-xs font-mono">{copied ? t.copied : roomId}</button>
                            {room.isPrivate && <span className="text-[10px] text-yellow-400">🔒</span>}
                        </div>
                        <div className="text-xs text-gray-400">{t.roundsFormat(room.currentRound || 0, MAX_ROUNDS)}</div>
                    </div>
                    
                    {room.status === 'waiting' && (
                        <div className="glass-panel rounded-xl p-4 flex-1">
                            <h3 className="text-sm font-bold mb-3 text-center">{t.lobbyTitle}</h3>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {room.players.map(p => (
                                    <div key={p.uid} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg cursor-pointer hover:bg-white/10" onClick={() => openProfile(p.uid)}>
                                        <AvatarWithFrame photoURL={p.photo} equipped={p.equipped} size="sm" />
                                        <span className="text-xs truncate">{p.name}</span>
                                        {p.uid === room.admin && <span className="text-[8px] bg-yellow-500/20 text-yellow-400 px-1 rounded">HOST</span>}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                {room.admin === user?.uid ? (<button onClick={startGame} className="btn-neon flex-1 py-2 rounded-lg text-sm font-bold">{t.start}</button>) : (<p className="text-xs text-gray-400 text-center flex-1">{t.waiting}</p>)}
                                <button onClick={() => handleLeaveRoom()} className="btn-danger px-4 py-2 rounded-lg text-sm">{t.leaveRoom}</button>
                            </div>
                            {/* NEW: Show password with eye icon */}
                            {room.isPrivate && room.admin === user?.uid && (
                                <div className="mt-3 p-2 bg-yellow-500/10 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400">{t.password}:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-mono">{showPassword ? room.password : '••••••'}</span>
                                            <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-white">{showPassword ? '🙈' : '👁️'}</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {room.status === 'word_selection' && !isSpectator && (
                        <div className="glass-panel rounded-xl p-4 flex-1">
                            <h3 className="text-sm font-bold mb-2 text-center">{t.wordSelectionTitle}</h3>
                            <p className="text-xs text-gray-400 text-center mb-3">{t.wordSelectionDesc}</p>
                            <div className="text-center text-xs text-yellow-400 mb-3">⏱️ {wordSelTimer}s</div>
                            <div className="grid grid-cols-2 gap-2">
                                {(lang === 'ar' ? room.scenario?.words_ar : room.scenario?.words_en)?.map((word, i) => (
                                    <button key={i} onClick={() => submitWordVote(word)} className={`word-vote-card ${hasVotedWord === word ? 'selected' : ''}`}><span className="font-bold">{word}</span></button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {room.status === 'discussing' && (
                        <div className="flex-1 flex flex-col gap-2">
                            <div className="glass-panel rounded-xl p-3">
                                <div className="grid grid-cols-3 gap-2">
                                    {room.players.filter(p => p.status === 'active').map(p => (
                                        <div key={p.uid} className={`player-card ${room.currentTurnUID === p.uid ? 'active' : ''} ${p.uid === user?.uid ? 'border-primary' : ''}`} onClick={() => openProfile(p.uid)}>
                                            <AvatarWithFrame photoURL={p.photo} equipped={p.equipped} size="sm" />
                                            <span className="text-[10px] truncate mt-1">{p.name}</span>
                                            {room.currentTurnUID === p.uid && <span className="text-[8px] text-primary">Speaking</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {!isSpectator && me && (
                                <div className={`identity-square identity-${myRole === 'spy' ? 'spy' : myRole === 'mrwhite' ? 'mrwhite' : myRole === 'informant' ? 'informant' : 'agent'}`}>
                                    <div className="text-4xl mb-2">{myRole === 'spy' ? '🕵️' : myRole === 'mrwhite' ? '👻' : myRole === 'informant' ? '👁️' : '🤵'}</div>
                                    <div className="text-lg font-bold">{myRole === 'spy' ? t.statusSpy : myRole === 'mrwhite' ? t.statusMrWhite : myRole === 'informant' ? t.statusInformant : t.statusAgent}</div>
                                    {myRole === 'spy' && (<div className="text-xs text-gray-300 mt-1">{t.location}: {lang === 'ar' ? room.scenario?.loc_ar : room.scenario?.loc_en}</div>)}
                                    {myRole !== 'spy' && room.chosenWord && (<div className="text-xs text-gray-300 mt-1">{t.selectedWord}: {room.chosenWord}</div>)}
                                    {myRole === 'mrwhite' && <p className="text-[10px] text-yellow-400 mt-2">{t.mrWhiteInstruction}</p>}
                                    {myRole === 'informant' && <p className="text-[10px] text-blue-400 mt-2">{t.informantInstruction}</p>}
                                </div>
                            )}
                            <div className="glass-panel rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="timer-bar-container"><div className="timer-bar-fill" style={{ width: `${(turnTimer / 30) * 100}%` }}></div></div>
                                    <span className="text-xs text-gray-400">{turnTimer}s</span>
                                </div>
                                <div className="flex gap-2">
                                    {isMyTurn && (<button onClick={() => handleSkipTurn()} className="btn-ghost flex-1 py-2 rounded-lg text-xs">{t.skip}</button>)}
                                    <button onClick={requestVoting} className="btn-vote flex-1 py-2 rounded-lg text-xs font-bold">{t.vote}</button>
                                </div>
                            </div>
                            {voteReq && (
                                <div className="vote-request-banner glass-panel rounded-lg p-3">
                                    <p className="text-xs text-center mb-2"><span className="font-bold">{room.players.find(p => p.uid === voteReq.requestedBy)?.name}</span> {t.voteRequestDesc}</p>
                                    {!hasIAgreed && !hasIDeclined && (<div className="flex gap-2"><button onClick={agreeToVote} className="btn-success flex-1 py-2 rounded-lg text-xs">{t.agree}</button><button onClick={declineVote} className="btn-danger flex-1 py-2 rounded-lg text-xs">{t.decline}</button></div>)}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {room.status === 'voting' && (
                        <div className="glass-panel rounded-xl p-4 flex-1">
                            <h3 className="text-sm font-bold mb-2 text-center">{t.vote}</h3>
                            <div className="text-center text-xs text-yellow-400 mb-3">⏱️ {votingTimer}s</div>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {room.players.filter(p => p.status === 'active').map(p => (
                                    <button key={p.uid} onClick={() => submitVote(p.uid)} disabled={hasVoted} className={`player-card ${hasVoted === p.uid ? 'border-primary bg-primary/10' : ''}`}>
                                        <AvatarWithFrame photoURL={p.photo} equipped={p.equipped} size="sm" />
                                        <span className="text-xs truncate mt-1">{p.name}</span>
                                        {room.votes && Object.values(room.votes).filter(v => v === p.uid).length > 0 && (<span className="text-[10px] text-red-400">{room.votes && Object.values(room.votes).filter(v => v === p.uid).length} votes</span>)}
                                    </button>
                                ))}
                            </div>
                            {room.admin === user?.uid && (<button onClick={endVotingNow} className="btn-danger w-full py-2 rounded-lg text-xs">{t.endVoting}</button>)}
                        </div>
                    )}
                    
                    {(room.status === 'finished_spy_caught' || room.status === 'finished_spy_wins' || room.status === 'finished_mrwhite_wins') && (
                        <div className="glass-panel rounded-xl p-4 flex-1 text-center">
                            <div className="text-4xl mb-4">{room.status === 'finished_spy_caught' ? '🎉' : room.status === 'finished_mrwhite_wins' ? '👻' : '🕵️'}</div>
                            <h2 className="text-xl font-bold mb-4">{room.status === 'finished_spy_caught' ? t.agentsWin : room.status === 'finished_mrwhite_wins' ? t.mrWhiteWin : t.spyWin}</h2>
                            {room.admin === user?.uid && (<button onClick={resetGame} className="btn-neon w-full py-2 rounded-lg text-sm font-bold">{t.playAgain}</button>)}
                            <button onClick={() => handleLeaveRoom()} className="btn-ghost w-full py-2 rounded-lg text-sm mt-2">{t.leaveRoom}</button>
                        </div>
                    )}
                    
                    {isSpectator && room.status !== 'waiting' && !room.status.includes('finished') && (
                        <div className="glass-panel rounded-xl p-4 flex-1 text-center">
                            <div className="text-4xl mb-2">👻</div>
                            <p className="text-sm text-gray-400">{t.spectator}</p>
                            <p className="text-xs text-gray-500 mt-2">{me?.status === 'ghost' ? t.ghostInstruction : t.playerLeft}</p>
                        </div>
                    )}
                </main>
            )}
            
            {showDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>}
            {showNotifications && <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

