/**
 * Who-Is-The-Spy | AppHooks.js
 * ─────────────────────────────────────────────────────────────────
 * Centralized Hooks Registry (no bundler required)
 *
 * PURPOSE:
 *   • Collects all window.useXxx hooks into a single namespace
 *   • Adds window.__hooksReady flag so 10-app.js can guard against
 *     calling hooks before they are defined (race condition fix)
 *   • Provides a null-safe proxy so stale call sites never throw
 *
 * BACKWARD COMPAT:
 *   • window.useXxx references are NOT removed — existing code keeps working
 *   • window.AppHooks.useXxx is the new canonical access point
 *
 * LOAD ORDER:
 *   Must be loaded AFTER all use*.js files but BEFORE 10-app.js
 * ─────────────────────────────────────────────────────────────────
 */

(function () {
    // ── List of all hooks expected to be registered on window ────
    var HOOK_NAMES = [
        'useAuthState',
        'useAppUIState',
        'useBanningLogic',
        'useBots',
        'useGameAutomation',
        'useLeaderboards',
        'useLoginRewards',
        'useNotifications',
        'useOnboarding',
        'usePresence',
        'useRoom',
        'useSocial'
    ];

    // ── Build the AppHooks namespace ─────────────────────────────
    var AppHooks = {};

    HOOK_NAMES.forEach(function (name) {
        // Live getter: always reads from window at call time,
        // so late-registration still works.
        Object.defineProperty(AppHooks, name, {
            get: function () {
                if (typeof window[name] === 'function') {
                    return window[name];
                }
                // Null-safe fallback: log a warning, return a no-op function
                // so React won't crash if the hook isn't loaded yet.
                console.warn('[AppHooks] Hook not ready: window.' + name + ' — returning no-op');
                return function () { return {}; };
            },
            enumerable: true,
            configurable: true
        });
    });

    // ── Expose registry ──────────────────────────────────────────
    window.AppHooks = AppHooks;

    // ── Ready flag ───────────────────────────────────────────────
    // Set immediately so 10-app.js knows this file executed.
    // Individual hooks may still be pending (they load after this file
    // in normal <script defer> order), but the live-getter handles that.
    window.__hooksReady = true;

    // ── Validate after DOMContentLoaded ─────────────────────────
    // Check that all expected hooks got registered. Logs warnings for
    // any that are still missing once the full page has loaded.
    window.addEventListener('DOMContentLoaded', function () {
        var missing = HOOK_NAMES.filter(function (n) {
            return typeof window[n] !== 'function';
        });
        if (missing.length > 0) {
            console.warn('[AppHooks] The following hooks were never registered:', missing.join(', '));
        } else {
            console.info('[AppHooks] \u2705 All ' + HOOK_NAMES.length + ' hooks registered successfully.');
        }
    });

})();
