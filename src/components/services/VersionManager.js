(function () {
    /**
     * VersionManager Service
     * Manages client-side cache clearing and live version polling.
     */
    var VersionManager = {
        _unsubscribe: null,
        _lastData: null,

        /**
         * Clears all browser asset caches, unregisters service workers, and reloads the page.
         * Specifically targets window.caches without touching localStorage or IndexedDB (Auth).
         */
        clearCacheAndReload: async function (newVersion, majorMsg) {
            console.log("[VersionManager] 🚨 Hard Reset Initiated for version:", newVersion || "manual");
            try {
                // 1. Persist the new version immediately
                if (newVersion) {
                    localStorage.setItem('pro_spy_version', String(newVersion));
                    if (majorMsg) {
                        localStorage.setItem('pro_spy_post_crit_msg', majorMsg);
                        localStorage.setItem('pro_spy_post_crit_ver', String(newVersion));
                    }
                }

                // 2. Kill Service Workers
                if ('serviceWorker' in navigator) {
                    try {
                        const regs = await navigator.serviceWorker.getRegistrations();
                        await Promise.all(regs.map(r => r.unregister()));
                        console.log("[VersionManager] ServiceWorkers cleared.");
                    } catch (e) { console.warn("SW Clear fail", e); }
                }

                // 3. Purge Cache API (Assets)
                if ('caches' in window) {
                    try {
                        const keys = await window.caches.keys();
                        await Promise.all(keys.map(key => window.caches.delete(key)));
                        console.log("[VersionManager] Cache API cleared.");
                    } catch (e) { console.warn("Cache Clear fail", e); }
                }

                // 4. Clear update attempts to allow fresh start
                sessionStorage.removeItem('pro_spy_update_attempted');
                sessionStorage.removeItem('pro_spy_fvc_check_running');

                // 5. Force hard reload from server with timestamp bust
                const bust = '?v=' + Date.now();
                const currentUrl = window.location.origin + window.location.pathname;

                console.log("[VersionManager] Finalizing reload...");
                setTimeout(function () {
                    window.location.href = currentUrl + bust;
                }, 100);
            } catch (error) {
                console.error("[VersionManager] Reset failed, falling back to basic reload:", error);
                window.location.reload(true);
            }
        },

        /**
         * Marks a version as 'dismissed' for the current session to prevent refresh loops.
         */
        markUpdateAttempted: function (version) {
            if (!version) return;
            sessionStorage.setItem('pro_spy_update_attempted', String(version));
            console.log("[VersionManager] Update silenced for session:", version);
        },

        /**
         * Initializes the Firestore listener for remote versioning.
         */
        initListener: function () {
            // Prevent initialization if bootstrapper is still active or already listening
            if (window.PRO_SPY_FVC_ACTIVE || this._unsubscribe) return;

            if (!window.firebase || !window.versioningCollection) {
                console.warn("[VersionManager] Firebase dependencies not ready for versioning.");
                return;
            }

            console.log("[VersionManager] Real-time monitoring enabled.");

            try {
                this._unsubscribe = window.versioningCollection.doc('versioning').onSnapshot((doc) => {
                    if (doc.exists) {
                        const data = doc.data();
                        this._lastData = data; // Store for snooze re-eval

                        const remote = data.remote_version;
                        const notes = data.update_notes || "";
                        const isCritical = data.critical === true;

                        // PWA Maintenance Props
                        window.UNDER_MAINTENANCE = data.under_maintenance === true;
                        window.MAINTENANCE_BYPASS = Array.isArray(data.maintenance_bypass) ? data.maintenance_bypass : [];
                        window.MAINTENANCE_MSG_AR = data.maintenance_msg_ar || "";
                        window.MAINTENANCE_MSG_EN = data.maintenance_msg_en || "";

                        if (window.setRemoteVersion) window.setRemoteVersion(remote);
                        if (window.refreshAppMaintenance) window.refreshAppMaintenance();

                        // 🔍 First load check
                        var currentLocal = localStorage.getItem('pro_spy_version');
                        if (!currentLocal || currentLocal === '...') {
                            localStorage.setItem('pro_spy_version', remote);
                            window.PRO_SPY_VERSION = remote;
                            console.log("[VersionManager] Local version synchronized to:", remote);
                        }

                        // 🚀 Evaluate Update Need
                        if (this.shouldUpdate(window.PRO_SPY_VERSION, remote)) {
                            if (isCritical) {
                                console.warn("[VersionManager] 🛑 CRITICAL version detected. Resetting now.");
                                window.PRO_SPY_CRITICAL = true;
                                this.clearCacheAndReload(remote, notes);
                            } else {
                                this.triggerUpdateModal(remote, notes);
                            }
                        }
                    }
                }, (error) => {
                    console.error("[VersionManager] Firestore connection lost:", error);
                });
            } catch (err) {
                console.error("[VersionManager] Init failed:", err);
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
