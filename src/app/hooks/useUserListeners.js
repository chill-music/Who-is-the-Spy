(function() {
    var { useEffect } = React;

    /**
     * useUserListeners — Manages real-time Firestore listeners for secondary user data:
     * - Family membership
     * - Bot chat unreads (Detective/Love)
     * - BFF unreads
     * - Couple relationship status
     */
    window.useUserListeners = function({
        currentUID, isLoggedIn, lang,
        setUserFamily,
        setDetectiveBotUnread, setLoveBotUnread,
        setBffUnreadCount,
        setCoupleData, setPartnerData,
        setIncomingProposal, setIncomingProposalFrom, setShowIncomingProposal,
        setNotification, playNotificationSound
    }) {

        // ── Family listener ──
        useEffect(() => {
            if (!currentUID || !isLoggedIn) { setUserFamily && setUserFamily(null); return; }
            var unsub = familiesCollection
                .where('members', 'array-contains', currentUID)
                .limit(1)
                .onSnapshot(snap => {
                    if (!snap.empty) {
                        var doc = snap.docs[0];
                        setUserFamily && setUserFamily({ id: doc.id, ...doc.data() });
                    } else {
                        setUserFamily && setUserFamily(null);
                    }
                }, () => {});
            return () => unsub();
        }, [currentUID, isLoggedIn]);

        // ── Bot chat & BFF unread listeners ──
        useEffect(() => {
            if (!currentUID || !isLoggedIn) return;
            var prevDetective = -1;
            var prevLove = -1;
            var unsub1 = botChatsCollection
                .where('toUserId', '==', currentUID)
                .onSnapshot(snap => {
                    var docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    var newDetective = docs.filter(d => d.botId === 'detective_bot' && !d.read).length;
                    var newLove = docs.filter(d => d.botId === 'love_bot' && !d.read).length;
                    
                    // Sound alert if new messages arrive
                    if (prevDetective !== -1 && newDetective > prevDetective) {
                        playNotificationSound && playNotificationSound();
                        setNotification && setNotification(lang === 'ar' ? '🕵️ رسالة جديدة من المحقق' : '🕵️ New message from The Detective');
                    }
                    if (prevLove !== -1 && newLove > prevLove) {
                        playNotificationSound && playNotificationSound();
                        setNotification && setNotification(lang === 'ar' ? '💌 رسالة جديدة من دواء بوت' : '💌 New message from Dawa Bot');
                    }
                    prevDetective = newDetective;
                    prevLove = newLove;
                    setDetectiveBotUnread && setDetectiveBotUnread(newDetective);
                    setLoveBotUnread && setLoveBotUnread(newLove);
                }, () => {});

            var unsub2 = bffCollection
                .where('uid2', '==', currentUID)
                .onSnapshot(snap => {
                    setBffUnreadCount && setBffUnreadCount(snap.docs.filter(d => d.data().status === 'pending').length);
                }, () => {});
            return () => { unsub1(); unsub2(); };
        }, [currentUID, isLoggedIn]);

        // ── Couple doc listener (accepted or pending for me) ──
        useEffect(() => {
            if (!currentUID || !isLoggedIn) { 
                setCoupleData && setCoupleData(null); 
                setPartnerData && setPartnerData(null); 
                return; 
            }
            var unsub1 = couplesCollection
                .where('uid1', '==', currentUID)
                .where('status', 'in', ['pending','accepted'])
                .limit(1)
                .onSnapshot(async snap => {
                    if (!snap.empty) {
                        var doc = { id: snap.docs[0].id, ...snap.docs[0].data() };
                        if (doc.status === 'accepted') {
                            setCoupleData && setCoupleData(doc);
                            var pd = await usersCollection.doc(doc.uid2).get();
                            if (pd.exists) setPartnerData && setPartnerData({ id: pd.id, ...pd.data() });
                            setIncomingProposal && setIncomingProposal(null); 
                            setShowIncomingProposal && setShowIncomingProposal(false);
                        }
                    } else {
                        setCoupleData && setCoupleData(prev => (prev?.uid1 === currentUID ? null : prev));
                        setPartnerData && setPartnerData(prev => (prev?.uid1 === currentUID ? null : prev));
                    }
                }, () => {});

            var unsub2 = couplesCollection
                .where('uid2', '==', currentUID)
                .where('status', 'in', ['pending','accepted'])
                .limit(1)
                .onSnapshot(async snap => {
                    if (!snap.empty) {
                        var doc = { id: snap.docs[0].id, ...snap.docs[0].data() };
                        if (doc.status === 'accepted') {
                            setCoupleData && setCoupleData(doc);
                            var pd = await usersCollection.doc(doc.uid1).get();
                            if (pd.exists) setPartnerData && setPartnerData({ id: pd.id, ...pd.data() });
                            setIncomingProposal && setIncomingProposal(null); 
                            setShowIncomingProposal && setShowIncomingProposal(false);
                        } else if (doc.status === 'pending' && doc.uid2 === currentUID) {
                            setIncomingProposal && setIncomingProposal(doc);
                            var fd = await usersCollection.doc(doc.uid1).get();
                            if (fd.exists) setIncomingProposalFrom && setIncomingProposalFrom({ id: fd.id, ...fd.data() });
                            setShowIncomingProposal && setShowIncomingProposal(true);
                        }
                    } else {
                        setCoupleData && setCoupleData(prev => (prev?.uid2 === currentUID ? null : prev));
                        setPartnerData && setPartnerData(prev => (prev?.uid2 === currentUID ? null : prev));
                        setIncomingProposal && setIncomingProposal(null); 
                        setShowIncomingProposal && setShowIncomingProposal(false);
                    }
                }, () => {});
            return () => { unsub1(); unsub2(); };
        }, [currentUID, isLoggedIn]);
    };

})();
