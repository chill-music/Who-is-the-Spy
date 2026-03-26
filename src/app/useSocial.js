(function() {
    var { useEffect } = React;

    /**
     * useSocial Hook
     * Manages real-time social data: Friends (with status), Requests, and Chat Meta.
     * 
     * @param {Object} deps - Dependencies and state setters.
     */
    window.useSocial = ({ 
        user, 
        isLoggedIn, 
        userData, 
        setFriendsData, 
        setFriendRequests, 
        setChatsMeta, 
        setTotalUnread 
    }) => {
        // 1. Friends List - Real-time with online status detection
        useEffect(() => {
            if (userData && user && isLoggedIn) {
                if (userData.friends?.length > 0) {
                    var unsub = usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', userData.friends).onSnapshot(snap => {
                        var friends = snap.docs.map(d => {
                            var data = d.data();
                            var lastActive = data.lastActive?.toDate?.() || new Date(0);
                            var timeSinceActive = Date.now() - lastActive.getTime();
                            var dbStatus = data.onlineStatus;

                            // Real-time status logic: combination of DB field and lastActive heartbeat
                            var onlineStatus = 'offline';
                            if (dbStatus === 'online' && timeSinceActive < 600000) { // online + seen < 10min
                                onlineStatus = 'online';
                            } else if (dbStatus === 'away' || (dbStatus === 'online' && timeSinceActive < 1800000)) {
                                onlineStatus = 'away'; // away OR online but stale (10-30min)
                            } else if (timeSinceActive < 300000) {
                                onlineStatus = 'online'; // seen < 5min regardless of DB
                            }

                            return { 
                                id: d.id, 
                                ...data, 
                                isOnline: onlineStatus === 'online', 
                                onlineStatus 
                            };
                        });
                        setFriendsData(friends);
                    });
                    return unsub;
                } else { 
                    setFriendsData([]); 
                }
            }
        }, [userData?.friends, user?.uid, isLoggedIn]);

        // 2. Friend Requests - Real-time
        useEffect(() => {
            if (userData && user && isLoggedIn && userData.friendRequests?.length > 0) {
                var unsub = usersCollection.where(firebase.firestore.FieldPath.documentId(), 'in', userData.friendRequests).onSnapshot(snap => {
                    setFriendRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                });
                return unsub;
            } else {
                setFriendRequests([]);
            }
        }, [userData?.friendRequests, user?.uid, isLoggedIn]);

        // 3. Chats Meta - Real-time with notification feedback
        useEffect(() => {
            if (!user || !isLoggedIn) return;
            var prevTotal = -1;
            var unsub = chatsCollection.where('members', 'array-contains', user.uid).onSnapshot(snap => {
                var total = 0;
                var meta = {};
                snap.docs.forEach(doc => {
                    var d = doc.data();
                    meta[doc.id] = d;
                    var myUnread = d.unread?.[user.uid] || 0;
                    total += myUnread;
                });
                
                // Audio feedback on new message
                if (prevTotal !== -1 && total > prevTotal) {
                    if (typeof playNotificationSound === 'function') playNotificationSound();
                }
                
                prevTotal = total;
                setChatsMeta(meta);
                setTotalUnread(total);
            }, error => {
                console.error('Social/Chats listener error:', error);
            });
            return unsub;
        }, [user?.uid, isLoggedIn]);
    };
})();
