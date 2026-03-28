(function() {
    var deferredPrompt;
    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Check if user has already dismissed the popup
    window.canShowInstallPopup = function() {
        var dismissed = localStorage.getItem('pro_spy_pwa_dismissed') === 'true';
        return isMobile && !dismissed && deferredPrompt;
    };

    window.markInstallPopupDismissed = function() {
        localStorage.setItem('pro_spy_pwa_dismissed', 'true');
    };

    window.triggerPWAInstall = function() {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function(choiceResult) {
            if (choiceResult.outcome === 'accepted') {
                // User accepted the PWA install prompt
            } else {
                // User dismissed the PWA install prompt
            }
            deferredPrompt = null;
        });
    };

    window.addEventListener('beforeinstallprompt', function(e) {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        
        // Dispatch custom event to notify React components
        window.dispatchEvent(new CustomEvent('pwa-available'));
    });

    window.addEventListener('appinstalled', function(evt) {
        // PWA was installed
        deferredPrompt = null;
    });

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('./sw.js').then(function(registration) {
                // Service worker registered
            }, function(err) {
                console.error('SW registration failed: ', err);
            });
        });
    }
})();
