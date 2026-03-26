(function() {
    var { useEffect } = React;

    /**
     * useNotifications Hook
     * Manages real-time notifications for the logged-in user.
     * 
     * @param {Object} deps - Dependencies and state setters.
     */
    window.useNotifications = ({ 
        user, 
        isLoggedIn, 
        userData, 
        notificationBellRef, 
        setNotifications, 
        setUnreadNotifications 
    }) => {
        useEffect(() => {
            if (!user || !isLoggedIn || !userData) return;

            var previousCount = -1;
            var unsub = notificationsCollection.where('toUserId', '==', user.uid).limit(50).onSnapshot(snap => {
                var notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                
                // Sort by timestamp descending
                notifs.sort((a, b) => { 
                    var timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds || 0; 
                    var timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds || 0; 
                    return timeB - timeA; 
                });

                var newUnread = notifs.filter(n => !n.read).length;

                // UI Feedback on new notification
                if (previousCount !== -1 && newUnread > previousCount) {
                    if (typeof playNotificationSound === 'function') playNotificationSound();
                    
                    if (notificationBellRef.current) {
                        notificationBellRef.current.classList.add('ringing');
                        setTimeout(() => {
                            if (notificationBellRef.current) {
                                notificationBellRef.current.classList.remove('ringing');
                            }
                        }, 500);
                    }
                }

                previousCount = newUnread;
                setNotifications(notifs);
                setUnreadNotifications(newUnread);
            }, error => {
                console.error('Notifications listener error:', error);
            });

            return () => unsub();
        }, [user?.uid, isLoggedIn, userData?.uid]);
    };
})();
