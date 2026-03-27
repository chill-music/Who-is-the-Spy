(function() {
    var { useState, useEffect, useRef, useMemo, useCallback } = React;
    var { 
        useAuthState, usePresence, useNotifications, useRoom, 
        useLeaderboards, useSocial, useGameAutomation, useBots,
        OWNER_UID
    } = window;

    function App() {
        // Use the new extracted state hook
        var state = window.useAppState();

        var { 
            lang, user, userData, isLoggedIn, isGuest, currentUID,
            notification, showOnboarding, onboardingGoogleUser,
            handleCreateGame, handleJoinGame, handleLeaveRoom, startGame, 
            sendGameMessage, handleOnboardingComplete, handleGoogleLogin, 
            handleClaimLoginReward, resetGame, handlePurchase, handleEquip, 
            handleUnequip, handleBuyVIP, handleSendProposal, handleAcceptProposal, 
            handleDeclineProposal, openProfile, handleSendGiftToUser, handleLogout, 
            closePrivateChat, createNotification, markNotificationRead, 
            clearAllNotifications, handleNotificationClick, handleAddFriendById, 
            handleAcceptRequest, handleRejectRequest, formatBanExpiry
        } = state;

    
        return (
            <window.AppView
                {...state}
                handleCreateGame={handleCreateGame}
                handleJoinGame={handleJoinGame}
                handleLeaveRoom={handleLeaveRoom}
                startGame={startGame}
                sendGameMessage={sendGameMessage}
                handleOnboardingComplete={handleOnboardingComplete}
                handleGoogleLogin={handleGoogleLogin}
                handleClaimLoginReward={handleClaimLoginReward}
                resetGame={resetGame}
                handlePurchase={handlePurchase}
                handleEquip={handleEquip}
                handleUnequip={handleUnequip}
                handleBuyVIP={handleBuyVIP}
                handleSendProposal={handleSendProposal}
                handleAcceptProposal={handleAcceptProposal}
                handleDeclineProposal={handleDeclineProposal}
                openProfile={openProfile}
                handleSendGiftToUser={handleSendGiftToUser}
                handleLogout={handleLogout}
                closePrivateChat={closePrivateChat}
                createNotification={createNotification}
                markNotificationRead={markNotificationRead}
                clearAllNotifications={clearAllNotifications}
                handleNotificationClick={handleNotificationClick}
                handleAddFriendById={handleAddFriendById}
                handleAcceptRequest={handleAcceptRequest}
                handleRejectRequest={handleRejectRequest}
                formatBanExpiry={formatBanExpiry}
            />
        );
    }

    // Set App as global so index.html can call ReactDOM.render
    window.App = App;
})();
