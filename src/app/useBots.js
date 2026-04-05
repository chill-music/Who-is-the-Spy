(function() {
    var { useEffect } = React;

    /**
     * useBots Hook
     * Manages bot AI behavior: word voting, discussion turns, and final voting.
     * 
     * @param {Object} deps - Dependencies and state setters.
     */
    window.useBots = ({
        room,
        roomId,
        currentUID,
        OWNER_UID,
        lang,
        nextTurn
    }) => {
        useEffect(() => {
            if (!room || currentUID !== OWNER_UID) return;
            var bots = room.players.filter(p => p.isBot && p.status === 'active');
            if (bots.length === 0) return;

            // 1. Bot word voting
            if (room.status === 'word_selection') {
                var words = room.scenario?.words_en || [];
                if (words.length === 0) return;
                bots.forEach(bot => {
                    if (!room.wordVotes?.[bot.uid] && bot.role !== 'spy' && bot.role !== 'mrwhite') {
                        var w = words[Math.floor(Math.random() * words.length)];
                        var upd = {}; upd[`wordVotes.${bot.uid}`] = w;
                        setTimeout(async () => {
                            try {
                                await roomsCollection.doc(roomId).update(upd);
                            } catch (e) { console.error('[PRO SPY ERROR] bot word vote:', e); }
                        }, 1500 + Math.random() * 2000);
                    }
                });
            }

            // 2. Bot turn in discussion - auto skip with optional chat
            if (room.status === 'discussing' && room.currentTurnUID) {
                var currentBot = bots.find(b => b.uid === room.currentTurnUID);
                if (currentBot) {
                    var delay = 2000 + Math.random() * 3000;
                    var shouldChat = Math.random() > 0.4;
                    var msgs = lang === 'ar' ? 
                        ['هممم، مثير للاهتمام...', 'لدي شكوكي.', 'دعونا نفكر بعناية.', 'نقطة جيدة.', 'أراقب الجميع.', 'شيء ما غريب.', 'موافق.', 'لست متأكداً من ذلك.'] : 
                        ['Hmm, interesting...', 'I have my suspicions.', 'Let\'s think carefully.', 'That\'s a good point.', 'I\'m watching everyone.', 'Something seems off.', 'Agreed.', 'Not sure about that.'];
                    
                    var timer = setTimeout(async () => {
                        if (shouldChat) {
                            var msg = msgs[Math.floor(Math.random() * msgs.length)];
                            var chatMsg = { sender: currentBot.uid, name: currentBot.name, text: msg, time: Date.now(), isBot: true };
                            try {
                                await roomsCollection.doc(roomId).update({ messages: firebase.firestore.FieldValue.arrayUnion(chatMsg) });
                            } catch (e) { console.error('[PRO SPY ERROR] bot chat message:', e); }
                        }
                        if (typeof nextTurn === 'function') await nextTurn();
                    }, delay);
                    return () => clearTimeout(timer);
                }
            }

            // 3. Bot final voting
            if (room.status === 'voting') {
                var humanPlayers = room.players.filter(p => p.status === 'active' && !p.isBot);
                bots.forEach(bot => {
                    if (!room.votes?.[bot.uid] && humanPlayers.length > 0) {
                        var target = humanPlayers[Math.floor(Math.random() * humanPlayers.length)];
                        var upd = {}; upd[`votes.${bot.uid}`] = target.uid;
                        setTimeout(async () => {
                            try {
                                await roomsCollection.doc(roomId).update(upd);
                            } catch (e) { console.error('[PRO SPY ERROR] bot final vote:', e); }
                        }, 2000 + Math.random() * 3000);
                    }
                });
            }
        }, [room?.currentTurnUID, room?.status, room?.wordVotes, room?.votes, currentUID, roomId, lang, OWNER_UID, nextTurn]);
    };
})();
