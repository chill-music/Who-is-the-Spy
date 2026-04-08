(function () {
    /**
     * VersionManager Service
     * Manages client-side cache clearing and live version polling.
     */
    var VersionManager = {
        _unsubscribe: null,

        /**
         * Clears all browser asset caches, unregisters service workers, and reloads the page.
         * Specifically targets window.caches without touching localStorage or IndexedDB.
         */
        clearCacheAndReload: async function () {
            console.log("[VersionManager] Initiating cache clear and SW unregistration...");
            try {
                // 1. Unregister Service Workers to bypass sw.js caching
                if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (const registration of registrations) {
                        await registration.unregister();
                        console.log("[VersionManager] SW unregistered:", registration.scope);
                    }
                }

                // 2. Purge Cache API buckets
                if ('caches' in window) {
                    const keys = await window.caches.keys();
                    await Promise.all(keys.map(key => window.caches.delete(key)));
                    console.log("[VersionManager] Caches purged successfully.");
                }

                // 3. Force hard reload from server with timestamp bust
                const bust = '?v=' + Date.now();
                const currentUrl = window.location.origin + window.location.pathname;
                
                console.log("[VersionManager] Reloading page to apply latest version...");
                window.location.href = currentUrl + bust;
            } catch (error) {
                console.error("[VersionManager] Cache clear failed:", error);
                window.location.reload(true);
            }
        },

        /**
         * Marks a version as 'dismissed' for the current session to prevent refresh loops.
         */
        markUpdateAttempted: function(version) {
            if (!version) return;
            sessionStorage.setItem('pro_spy_update_attempted', version);
            console.log("[VersionManager] Update attempt recorded for version:", version);
        },

        /**
         * Initializes the Firestore listener for remote versioning.
         */
        initListener: function () {
            if (!window.firebase || !window.versioningCollection) {
                console.warn("[VersionManager] Firebase or versioningCollection not ready.");
                return;
            }

            if (this._unsubscribe) return;
            
            console.log("[VersionManager] Monitoring remote version... (Local: " + (window.PRO_SPY_VERSION || 'unknown') + ")");
            
            try {
                this._unsubscribe = window.versioningCollection.doc('versioning').onSnapshot((doc) => {
                    if (doc.exists) {
                        const data = doc.data();
                        const remote = data.remote_version;
                        const notes = data.update_notes || "";
                        
                        if (this.shouldUpdate(window.PRO_SPY_VERSION, remote)) {
                            this.triggerUpdateModal(remote, notes);
                        }
                    }
                }, (error) => {
                    console.error("[VersionManager] Version listener error:", error);
                });
            } catch (err) {
                console.error("[VersionManager] Exception in listener setup:", err);
            }
        },

        /**
         * Version comparison logic.
         */
        shouldUpdate: function (local, remote) {
            if (!local || !remote) return false;
            const localNum = parseFloat(local);
            const remoteNum = parseFloat(remote);
            
            if (isNaN(localNum) || isNaN(remoteNum)) {
                return remote > local;
            }
            return remoteNum > localNum;
        },

        /**
         * Triggers the UI Update Modal, respecting session-based silencing.
         */
        triggerUpdateModal: function (remoteVersion, updateNotes) {
            // SILENCER: Check if we've already tried to update this version in this session
            const attempted = sessionStorage.getItem('pro_spy_update_attempted');
            if (attempted === String(remoteVersion)) {
                console.log("[VersionManager] Update modal silenced for version " + remoteVersion + " (already attempted this session)");
                return;
            }

            if (typeof window.showGlobalUpdateModal === 'function') {
                window.showGlobalUpdateModal(remoteVersion, updateNotes);
            } else {
                setTimeout(() => this.triggerUpdateModal(remoteVersion, updateNotes), 2000);
            }
        }
    };

    // Expose to global scope
    window.VersionManager = VersionManager;
})();
