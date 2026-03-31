/**
 * Who-Is-The-Spy-og | useBanningLogic.js
 * Modularised Banning System (IIFE + Global Scope)
 * 
 * Part of Phase 4: Modularization
 * Handles: Ban checks and the useBanningLogic hook.
 */

(function() {
    var { useMemo } = React;

    /**
     * Hook: useBanningLogic
     * Encapsulates the ban check logic.
     */
    window.useBanningLogic = function({ userData, isLoggedIn }) {
        var isBanned = useMemo(() => {
            if (!isLoggedIn || !userData) return false;
            return window.isBannedUser ? window.isBannedUser(userData) : false;
        }, [isLoggedIn, userData]);

        return { isBanned };
    };

})();
