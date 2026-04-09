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
        clearCacheAndReload: async function (newVersion, majorMsg) {
            console.log("[VersionManager] Initiating cache clear for version:", newVersion || "manual");
            try {
                // 0. Persist the new version so index.html picks it up on next load
                if (newVersion) {
                    localStorage.setItem('pro_spy_version', String(newVersion));
                    
                    // 🚩 [CRITICAL] Store apology info for post-reload display
                    if (majorMsg) {
                        localStorage.setItem('pro_spy_post_crit_msg', majorMsg);
                        localStorage.setItem('pro_spy_post_crit_ver', String(newVersion));
                    }
                }

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
            
            console.log("[VersionManager] Monitoring remote version... (Active: " + (window.PRO_SPY_VERSION || '...') + ")");
            
            try {
                this._unsubscribe = window.versioningCollection.doc('versioning').onSnapshot((doc) => {
                    if (doc.exists) {
                        const data = doc.data();
                        const remote = data.remote_version;
                        const notes = data.update_notes || "";
                        const isCritical = data.critical === true;
                        
                        // Always update the UI state for the Settings footer
                        if (window.setRemoteVersion) {
                            window.setRemoteVersion(remote);
                        }

                        // SELF-SEED: If the app has no stored version yet, adopt the DB version immediately
                        if (!localStorage.getItem('pro_spy_version') || window.PRO_SPY_VERSION === '...') {
                            localStorage.setItem('pro_spy_version', remote);
                            window.PRO_SPY_VERSION = remote;
                            console.log("[VersionManager] Initialized session version from database:", remote);
                        }

                        if (this.shouldUpdate(window.PRO_SPY_VERSION, remote)) {
                            if (isCritical) {
                                console.warn("[VersionManager] CRITICAL UPDATE DETECTED. Forcing reload...");
                                window.PRO_SPY_CRITICAL = true;
                                this.clearCacheAndReload(remote, notes || "Maintenance update.");
                            } else {
                                this.triggerUpdateModal(remote, notes);
                            }
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
         * Triggers the UI Update Modal, respecting session-based silencing and snooze.
         */
        triggerUpdateModal: function (remoteVersion, updateNotes) {
            // 1. Check if already applied this session
            const attempted = sessionStorage.getItem('pro_spy_update_attempted');
            if (attempted === String(remoteVersion)) {
                console.log("[VersionManager] Update silenced: already attempted this session.");
                return;
            }

            // 2. Check if snoozed
            const snoozeUntil = sessionStorage.getItem('pro_spy_update_snooze');
            if (snoozeUntil && Date.now() < parseInt(snoozeUntil)) {
                const remaining = Math.ceil((parseInt(snoozeUntil) - Date.now()) / 1000);
                console.log("[VersionManager] Update snoozed. Remaining seconds:", remaining);
                return;
            }

            // 3. Trigger Modal
            if (typeof window.showGlobalUpdateModal === 'function') {
                window.showGlobalUpdateModal(remoteVersion, updateNotes);
            } else {
                setTimeout(() => this.triggerUpdateModal(remoteVersion, updateNotes), 2000);
            }
        },

        /**
         * Snoozes the current update notification for a specific duration.
         */
        snoozeUpdate: function (minutes) {
            const snoozeUntil = Date.now() + (minutes * 60 * 1000);
            sessionStorage.setItem('pro_spy_update_snooze', snoozeUntil);
            console.log("[VersionManager] Update snoozed for " + minutes + " mins until:", new Date(snoozeUntil).toLocaleTimeString());
            
            // Set a timer to automatically re-trigger the check when snooze expires
            setTimeout(() => {
                console.log("[VersionManager] Snooze expired. Re-checking version...");
                // We re-trigger the listener logic or wait for next snapshot
                // For immediate effect, we can force a re-eval if we have the data
                if (this._lastData) {
                    this.initListener(); // This will re-trigger the snapshot logic
                }
            }, minutes * 60 * 1000);
        }
    };

    // Expose to global scope
    window.VersionManager = VersionManager;
})();
