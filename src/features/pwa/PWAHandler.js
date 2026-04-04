(function() {
    var deferredPrompt = null;
    var pwaEventFired  = false;

    // ── helpers ──
    window.canShowInstallPopup = function() {
        var neverShow = localStorage.getItem('pro_spy_pwa_never') === 'true';
        return !neverShow && !!deferredPrompt;
    };

    // Called when user clicks ✕ WITHOUT the checkbox
    window.markInstallPopupDismissed = function() {
        // Only temporary — will show again next session unless neverShow is set
    };

    // Called when user checks "don't show again"
    window.markInstallNeverShow = function() {
        localStorage.setItem('pro_spy_pwa_never', 'true');
    };

    window.triggerPWAInstall = function() {
        if (!deferredPrompt) return Promise.resolve('no-prompt');
        deferredPrompt.prompt();
        return deferredPrompt.userChoice.then(function(choiceResult) {
            deferredPrompt = null;
            return choiceResult.outcome; // 'accepted' | 'dismissed'
        });
    };

    // Capture the browser install event
    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt   = e;
        pwaEventFired    = true;

        var neverShow = localStorage.getItem('pro_spy_pwa_never') === 'true';
        if (!neverShow) {
            // Delay slightly so React's useEffect listeners are ready
            setTimeout(function() {
                window.dispatchEvent(new CustomEvent('pwa-available'));
            }, 1500);
        }
    });

    window.addEventListener('appinstalled', function() {
        deferredPrompt = null;
    });

    // If React mounts after the event already fired, re-dispatch on demand
    window.recheckPWAAvailable = function() {
        var neverShow = localStorage.getItem('pro_spy_pwa_never') === 'true';
        if (pwaEventFired && deferredPrompt && !neverShow) {
            window.dispatchEvent(new CustomEvent('pwa-available'));
        }
    };

    // Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('./sw.js').then(function(reg) {
                reg.addEventListener('updatefound', function() {
                    var newWorker = reg.installing;
                    newWorker.addEventListener('statechange', function() {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('New update available. Calling skipWaiting...');
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                        }
                    });
                });
            }).catch(function(err) {
                console.warn('SW registration failed:', err);
            });
        });

        // Automatically reload when a new service worker takes over
        var refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', function() {
            if (refreshing) return;
            refreshing = true;
            
            // Wait for auth to be ready before reloading
            var unsubscribe = firebase.auth().onAuthStateChanged(function(user) {
                unsubscribe(); // Stop listening
                window.location.reload();
            });
        });
    }
})();
