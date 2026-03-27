(function() {
    var { useState, useEffect, useRef, useMemo, useCallback } = React;
    var { 
        useAuthState, usePresence, useNotifications, useRoom, 
        useLeaderboards, useSocial, useGameAutomation, useBots,
        OWNER_UID
    } = window;

    function App() {
        var state = window.useAppState();
        var { 
            lang, user, userData, isLoggedIn, isGuest, currentUID,
            notification, showOnboarding, onboardingGoogleUser,
            handleCreateGame, handleJoinGame, handleLeaveRoom, startGame, 
            sendMessage, handleOnboardingComplete, handleGoogleLogin, 
            handleClaimLoginReward, resetGame, handlePurchase, handleEquip, 
            handleUnequip, handleBuyVIP, handleSendProposal, handleAcceptProposal, 
            handleDeclineProposal, openProfile, handleSendGiftToUser, handleLogout, 
            closePrivateChat, createNotification, markNotificationRead, 
            clearAllNotifications, handleNotificationClick, handleAddFriendById, 
            handleAcceptRequest, handleRejectRequest, formatBanExpiry,
            activeRooms, submitVote, submitWordVote,
            handleSkipTurn, nextTurn, requestVoting, agreeToVote, declineVote,
            triggerVoting, submitSpyWordGuess, submitMrWhiteLocationGuess, spyVoluntaryDeclare,
            addBotToRoom, removeBotFromRoom, openPrivateChat, openProfile
        } = state;

        return (
            <window.AppView
                {...state}
            />
        );
    }

    // Set App as global so index.html can call ReactDOM.render
    window.App = App;
})();
