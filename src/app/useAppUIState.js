/**
 * Who-Is-The-Spy-og | useAppUIState.js
 * Modularised UI State Hook (IIFE + Global Scope)
 * 
 * Part of Phase 4: Modularization
 * Consolidates the massive block of useState and useRef declarations from 10-app.js.
 */

(function () {
    var { useState, useRef, useEffect } = React;

    window.useAppUIState = function () {
        // ── Global States ──
        var [lang, setLang] = useState(localStorage.getItem('pro_spy_lang') || 'en');

        useEffect(() => {
            document.documentElement.lang = lang;
            document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
            window.proSpyAppLang = lang;
        }, [lang]);
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
        var [showSummary, setShowSummary] = useState(false);
        var [showShop, setShowShop] = useState(false);
        var [shopInitialTab, setShopInitialTab] = useState('frames');
        var [showInventory, setShowInventory] = useState(false);
        var [showPrivateChat, setShowPrivateChat] = useState(false);
        var [showSelfChat, setShowSelfChat] = useState(false);
        var [showFunPass, setShowFunPass] = useState(false);
        var [chatFriend, setChatFriend] = useState(null);
        var [showLoginAlert, setShowLoginAlert] = useState(false);
        var [guestData, setGuestData] = useState(null);
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
        var [showStaffCommandBot, setShowStaffCommandBot] = useState(false);
        var [detectiveBotUnread, setDetectiveBotUnread] = useState(0);
        var [loveBotUnread, setLoveBotUnread] = useState(0);
        var [staffCommandBotUnread, setStaffCommandBotUnread] = useState(0);

        var [showVIPCenter, setShowVIPCenter] = useState(false);
        var [showHelpCenter, setShowHelpCenter] = useState(false);
        var [showPublicChat, setShowPublicChat] = useState(false);

        var [showGuestMenu, setShowGuestMenu] = useState(false);
        var [gameChatInput, setGameChatInput] = useState('');
        var [showGameChat, setShowGameChat] = useState(true);
        var gameChatRef = useRef(null);
        var [showLuckyGames, setShowLuckyGames] = useState(false);
        var [showSendGiftModal, setShowSendGiftModal] = useState(false);
        var [sendGiftTarget, setSendGiftTarget] = useState(null);

        return {
            lang, setLang,
            room, setRoom,
            roomId, setRoomId,
            inputCode, setInputCode,
            nickname, setNickname,
            loading, setLoading,
            turnTimer, setTurnTimer,
            votingTimer, setVotingTimer,
            wordSelTimer, setWordSelTimer,
            showSetupModal, setShowSetupModal,
            setupMode, setSetupMode,
            isPrivate, setIsPrivate,
            password, setPassword,
            showPassword, setShowPassword,
            activeView, setActiveView,
            showDropdown, setShowDropdown,
            joinError, setJoinError,
            alertMessage, setAlertMessage,
            leaderboardData, setLeaderboardData,
            charismaLeaderboard, setCharismaLeaderboard,
            familyLeaderboard, setFamilyLeaderboard,
            leaderboardTab, setLeaderboardTab,
            friendsData, setFriendsData,
            addFriendId, setAddFriendId,
            friendSearchMsg, setFriendSearchMsg,
            friendRequests, setFriendRequests,
            showMyAccount, setShowMyAccount,
            showUserProfile, setShowUserProfile,
            targetProfileUID, setTargetProfileUID,
            chatsMeta, setChatsMeta,
            totalUnread, setTotalUnread,
            openChatId, setOpenChatId,
            showBrowseRooms, setShowBrowseRooms,
            copied, setCopied,
            notification, setNotification,
            showSummary, setShowSummary,
            showShop, setShowShop,
            shopInitialTab, setShopInitialTab,
            showInventory, setShowInventory,
            showPrivateChat, setShowPrivateChat,
            showSelfChat, setShowSelfChat,
            showFunPass, setShowFunPass,
            chatFriend, setChatFriend,
            showLoginAlert, setShowLoginAlert,
            guestData, setGuestData,
            showLobbyPassword, setShowLobbyPassword,
            showNotifications, setShowNotifications,
            notifications, setNotifications,
            unreadNotifications, setUnreadNotifications,
            notificationBellRef,
            historyWrittenRooms,
            lastAchievementCheck,
            showSettings, setShowSettings,
            soundMuted, setSoundMuted,
            showAdminPanel, setShowAdminPanel,
            showFriendsMoments, setShowFriendsMoments,
            showFamilyModal, setShowFamilyModal,
            viewFamilyId, setViewFamilyId,
            userFamily, setUserFamily,
            showFamilyChat, setShowFamilyChat,
            hasNewMoments, setHasNewMoments,
            coupleData, setCoupleData,
            partnerData, setPartnerData,
            showCoupleCard, setShowCoupleCard,
            showProposalModal, setShowProposalModal,
            proposalRing, setProposalRing,
            incomingProposal, setIncomingProposal,
            incomingProposalFrom, setIncomingProposalFrom,
            showIncomingProposal, setShowIncomingProposal,
            showWeddingHall, setShowWeddingHall,
            showBFFModal, setShowBFFModal,
            bffInitialTab, setBffInitialTab,
            bffUnreadCount, setBffUnreadCount,
            showDetectiveBot, setShowDetectiveBot,
            showLoveBot, setShowLoveBot,
            showStaffCommandBot, setShowStaffCommandBot,
            detectiveBotUnread, setDetectiveBotUnread,
            loveBotUnread, setLoveBotUnread,
            staffCommandBotUnread, setStaffCommandBotUnread,
            showVIPCenter, setShowVIPCenter,
            showHelpCenter, setShowHelpCenter,
            showPublicChat, setShowPublicChat,
            showGuestMenu, setShowGuestMenu,
            gameChatInput, setGameChatInput,
            showGameChat, setShowGameChat,
            gameChatRef,
            showLuckyGames, setShowLuckyGames,
            showSendGiftModal, setShowSendGiftModal,
            sendGiftTarget, setSendGiftTarget
        };
    };
})();
