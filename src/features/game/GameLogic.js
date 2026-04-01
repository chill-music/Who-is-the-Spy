/**
 * Who-Is-The-Spy-og | GameLogic.js
 * Modularised Game Logic Service (IIFE + Global Scope)
 * 
 * Part of Phase 4: Modularization
 * Handles: Start, Reset, Votes, Turns, Chat, Bots, Guesses
 * Preserves: window.GameService, var, UTF-8
 */

(function() {
    var GameService = {
        /**
         * Returns the role of the current player in the room.
         */
        getMyRole: function(room, currentUID) {
            if (!room || !room.players || !currentUID) return null;
            var p = room.players.find(function(player) { return player.uid === currentUID; });
            return p ? p.role : null;
        },

        /**
         * Extracted from startGame in 10-app.js
         */

        startGame: async function(context) {
            var room = context.room;
            var currentUID = context.currentUID;
            var roomId = context.roomId;
            var t = context.t;
            var playSound = context.playSound;
            var setAlertMessage = context.setAlertMessage;

            if (!room || room.admin !== currentUID) return;
            if (typeof playSound === 'function') playSound('success');

            var activePlayers = (room.players || []).filter(function(p) { return p.status === 'active'; });
            var playerCount = activePlayers.length;

            if (room.mode === 'advanced' && playerCount < 6) { 
                if (typeof setAlertMessage === 'function') setAlertMessage("Advanced mode requires 6+ players!"); 
                return; 
            }
            if (playerCount < 3) { 
                if (typeof setAlertMessage === 'function') setAlertMessage(t.needPlayers); 
                return; 
            }
            if (playerCount > 10) { 
                if (typeof setAlertMessage === 'function') setAlertMessage("Max 10 players."); 
                return; 
            }

            var used = room.usedLocations || [];
            // SCENARIOS is global from 04-data-game.js
            var avail = SCENARIOS.filter(function(s) { return !used.includes(s.loc_en); });
            var scenario = (avail.length > 0 ? avail : SCENARIOS)[Math.floor(Math.random() * (avail.length || SCENARIOS.length))];
            
            var spy = activePlayers[Math.floor(Math.random() * activePlayers.length)];
            var roles = {};
            var mrwhiteId = null;
            var informantId = null;

            if (room.mode === 'advanced') {
                roles[spy.uid] = 'spy';
                var remaining = activePlayers.filter(function(p) { return p.uid !== spy.uid; });
                if (remaining.length > 0) {
                    var mrWhite = remaining[Math.floor(Math.random() * remaining.length)];
                    roles[mrWhite.uid] = 'mrwhite';
                    mrwhiteId = mrWhite.uid;
                    remaining = remaining.filter(function(p) { return p.uid !== mrWhite.uid; });
                }
                if (remaining.length > 0) {
                    var informant = remaining[Math.floor(Math.random() * remaining.length)];
                    roles[informant.uid] = 'informant';
                    informantId = informant.uid;
                }
                activePlayers.forEach(function(p) { if (!roles[p.uid]) roles[p.uid] = 'agent'; });
            } else {
                activePlayers.forEach(function(p) { roles[p.uid] = (p.uid === spy.uid ? 'spy' : 'agent'); });
            }

            var potentialStarters = activePlayers.filter(function(p) { return roles[p.uid] !== 'spy'; });
            if (potentialStarters.length === 0) potentialStarters = activePlayers;
            var firstPlayer = potentialStarters[Math.floor(Math.random() * potentialStarters.length)];

            try {
                // Dependency: roomsCollection, firebase (global)
                await roomsCollection.doc(roomId).update({
                    status: 'word_selection',
                    scenario: scenario,
                    spyId: spy.uid,
                    mrwhiteId: mrwhiteId,
                    informantId: informantId,
                    currentTurnUID: firstPlayer.uid,
                    turnEndTime: null,
                    currentRound: 1,
                    players: room.players.map(function(p) { 
                        return Object.assign({}, p, { vote: null, role: roles[p.uid] || 'agent' }); 
                    }),
                    usedLocations: firebase.firestore.FieldValue.arrayUnion(scenario.loc_en),
                    messages: [],
                    votes: {},
                    wordVotes: {},
                    chosenWord: null,
                    wordSelEndTime: Date.now() + 45000,
                    votingRequest: null,
                    ejectedUID: null,
                    startedAt: firebase.firestore.FieldValue.serverTimestamp() // Using TS helper context or global
                });
            } catch (e) {
                console.error("Start Game Error:", e);
            }
        },

        /**
         * Extracted from submitWordVote in 10-app.js
         */
        submitWordVote: async function(context, word) {
            var currentUID = context.currentUID;
            var room = context.room;
            var roomId = context.roomId;
            var playSound = context.playSound;

            if (!currentUID || !room || room.status !== 'word_selection') return;
            
            var myPlayer = room.players?.find(function(p) { return p.uid === currentUID; });
            if (myPlayer?.role === 'spy' || myPlayer?.role === 'mrwhite') return;
            
            if (typeof playSound === 'function') playSound('click');
            
            var voteUpdate = {};
            voteUpdate["wordVotes." + currentUID] = word;
            
            try {
                await roomsCollection.doc(roomId).update(voteUpdate);
            } catch (e) {
                console.error("Submit Word Vote Error:", e);
            }
        },

        /**
         * Extracted from handleSkipTurn in 10-app.js
         */
        handleSkipTurn: async function(context, forced) {
            var room = context.room;
            var currentUID = context.currentUID;
            
            if (!room) return;
            if (!forced && room.currentTurnUID !== currentUID) return;
            if (forced && room.status !== 'discussing') return;
            
            await this.nextTurn(context);
        },

        /**
         * Extracted from nextTurn in 10-app.js
         */
        nextTurn: async function(context) {
            var room = context.room;
            var roomId = context.roomId;
            
            if (!room) return;
            var activePlayers = room.players.filter(function(p) { return p.status === 'active'; });
            var currentIndex = activePlayers.findIndex(function(p) { return p.uid === room.currentTurnUID; });
            var nextIndex = (currentIndex + 1) % activePlayers.length;
            
            try {
                await roomsCollection.doc(roomId).update({ 
                    currentTurnUID: activePlayers[nextIndex].uid, 
                    turnEndTime: Date.now() + 30000 
                });
            } catch (e) {
                console.error("Next Turn Error:", e);
            }
        },

        /**
         * Extracted from requestVoting in 10-app.js
         */
        requestVoting: async function(context) {
            var room = context.room;
            var currentUID = context.currentUID;
            var roomId = context.roomId;
            var playSound = context.playSound;

            if (!room || room.status !== 'discussing') return;
            if (typeof playSound === 'function') playSound('click');
            
            if (room.admin === currentUID) { 
                await this.triggerVoting(context); 
                return; 
            }
            
            try {
                var updateData = {};
                updateData["votingRequest"] = { requestedBy: currentUID, votes: { [currentUID]: true } };
                await roomsCollection.doc(roomId).update(updateData);
            } catch (e) {
                console.error("Request Voting Error:", e);
            }
        },

        /**
         * Extracted from agreeToVote in 10-app.js
         */
        agreeToVote: async function(context) {
            var room = context.room;
            var currentUID = context.currentUID;
            var roomId = context.roomId;
            var playSound = context.playSound;

            if (!room || !room.votingRequest) return;
            if (typeof playSound === 'function') playSound('click');
            
            var currentVotes = room.votingRequest.votes || {};
            var newVotes = Object.assign({}, currentVotes, { [currentUID]: true });
            var activePlayers = room.players.filter(function(p) { return p.status === 'active'; });
            
            if (currentUID === room.admin) { 
                await this.triggerVoting(context); 
                return; 
            }
            
            var agreeCount = Object.values(newVotes).filter(function(v) { return v === true; }).length;
            var majorityCount = Math.floor(activePlayers.length / 2) + 1;
            
            try {
                if (agreeCount >= majorityCount) { 
                    await this.triggerVoting(context); 
                } else { 
                    await roomsCollection.doc(roomId).update({ "votingRequest.votes": newVotes }); 
                }
            } catch (e) {
                console.error("Agree to Vote Error:", e);
            }
        },

        /**
         * Extracted from declineVote in 10-app.js
         */
        declineVote: async function(context) {
            var room = context.room;
            var currentUID = context.currentUID;
            var roomId = context.roomId;
            var playSound = context.playSound;

            if (!room || !room.votingRequest) return;
            if (typeof playSound === 'function') playSound('click');
            
            var currentVotes = room.votingRequest.votes || {};
            var newVotes = Object.assign({}, currentVotes, { [currentUID]: false });
            var activePlayers = room.players.filter(function(p) { return p.status === 'active'; });
            
            var declineCount = Object.values(newVotes).filter(function(v) { return v === false; }).length;
            var majorityCount = Math.floor(activePlayers.length / 2) + 1;
            
            try {
                if (declineCount >= majorityCount) { 
                    await roomsCollection.doc(roomId).update({ votingRequest: null }); 
                } else { 
                    await roomsCollection.doc(roomId).update({ "votingRequest.votes": newVotes }); 
                }
            } catch (e) {
                console.error("Decline Vote Error:", e);
            }
        },

        /**
         * Extracted from triggerVoting in 10-app.js
         */
        triggerVoting: async function(context) {
            var roomId = context.roomId;
            var t = context.t;
            var playSound = context.playSound;

            if (typeof playSound === 'function') playSound('click');
            
            var sysMsg = { 
                sender: 'system', 
                name: 'SYSTEM', 
                text: t.votingStarted, 
                time: Date.now() 
            };
            
            try {
                await roomsCollection.doc(roomId).update({ 
                    status: 'voting', 
                    currentTurnUID: null, 
                    turnEndTime: null, 
                    votingEndTime: Date.now() + 30000, 
                    messages: firebase.firestore.FieldValue.arrayUnion(sysMsg), 
                    votingRequest: null 
                });
            } catch (e) {
                console.error("Trigger Voting Error:", e);
            }
        },

        /**
         * Extracted from submitVote in 10-app.js
         */
        submitVote: async function(context, targetUID) {
            var room = context.room;
            var currentUID = context.currentUID;
            var roomId = context.roomId;
            var playSound = context.playSound;

            if (!targetUID || !currentUID || (room.votes && room.votes[currentUID])) return;
            if (typeof playSound === 'function') playSound('click');
            
            var voteUpdate = {};
            voteUpdate["votes." + currentUID] = targetUID;
            
            try {
                await roomsCollection.doc(roomId).update(voteUpdate);
            } catch (e) {
                console.error("Submit Vote Error:", e);
            }
        },

        /**
         * Extracted from resetGame in 10-app.js
         */
        resetGame: async function(context) {
            var room = context.room;
            var roomId = context.roomId;
            var playSound = context.playSound;
            var setShowSummary = context.setShowSummary;

            if (typeof playSound === 'function') playSound('click');
            
            try {
                await roomsCollection.doc(roomId).update({
                    status: 'waiting', 
                    scenario: null, 
                    spyId: null, 
                    mrwhiteId: null, 
                    informantId: null,
                    currentTurnUID: null, 
                    currentRound: 0, 
                    votes: {}, 
                    messages: [], 
                    votingEndTime: null,
                    turnEndTime: null, 
                    ejectedUID: null,
                    players: room.players.map(function(p) { 
                        return { 
                            uid: p.uid, 
                            name: p.name, 
                            status: 'active', 
                            photo: p.photo, 
                            role: null, 
                            equipped: p.equipped || {}, 
                            vip: p.vip || {}, 
                            isBot: p.isBot || false, 
                            botUID: p.botUID || null 
                        }; 
                    }),
                    wordVotes: {}, 
                    chosenWord: null, 
                    wordSelEndTime: null, 
                    votingRequest: null,
                    startedAt: null, 
                    finishedAt: null, 
                    summaryShown: false
                });
                
                if (typeof setShowSummary === 'function') setShowSummary(false);
            } catch (e) {
                console.error("Reset Game Error:", e);
            }
        },

        /**
         * Extracted from sendGameMessage in 10-app.js
         */
        sendGameMessage: async function(context) {
            var gameChatInput = context.gameChatInput;
            var room = context.room;
            var currentUID = context.currentUID;
            var roomId = context.roomId;
            var nickname = context.nickname;
            var userFamily = context.userFamily;
            var setGameChatInput = context.setGameChatInput;

            var text = gameChatInput.trim();
            if (!text || !room || !currentUID) return;
            
            var senderName = room.players?.find(function(p) { return p.uid === currentUID; })?.name || nickname || 'Player';
            
            var familyWeeklyAct = userFamily?.lastWeekActiveness !== undefined ? userFamily.lastWeekActiveness : (userFamily?.weeklyActiveness || 0);
            var signLevel = userFamily ? (window.FamilyConstants?.getFamilySignLevelData?.(familyWeeklyAct)?.level || 1) : null;

            var msg = {
                sender: currentUID,
                name: senderName,
                text: text,
                time: Date.now(),
                familyTag: userFamily?.tag || null,
                familySignLevel: signLevel,
            };
            
            if (typeof setGameChatInput === 'function') setGameChatInput('');
            
            try {
                await roomsCollection.doc(roomId).update({
                    messages: firebase.firestore.FieldValue.arrayUnion(msg)
                });
            } catch (e) {
                console.error("Send Game Message Error:", e);
            }
        },

        /**
         * Extracted from submitSpyWordGuess in 10-app.js
         */
        submitSpyWordGuess: async function(context, guessedWord) {
            var room = context.room;
            var currentUID = context.currentUID;
            var roomId = context.roomId;
            var playSound = context.playSound;

            if (!room || room.status !== 'spy_guessing') return;
            if (currentUID !== room.ejectedUID && currentUID !== room.spyId) return;
            
            if (typeof playSound === 'function') playSound('click');
            
            var correct = guessedWord.trim().toLowerCase() === (room.chosenWord || '').trim().toLowerCase();
            var sysMsg = { sender: 'system', name: 'SYSTEM', text: correct ? '🎯 Spy guessed correctly!' : '❌ Wrong guess!', time: Date.now() };
            
            try {
                await roomsCollection.doc(roomId).update({
                    status: correct ? 'finished_spy_escaped' : 'finished_spy_caught',
                    spyGuessWord: guessedWord,
                    messages: firebase.firestore.FieldValue.arrayUnion(sysMsg)
                });
            } catch (e) {
                console.error("Submit Spy Word Guess Error:", e);
            }
        },

        /**
         * Extracted from submitMrWhiteLocationGuess in 10-app.js
         */
        submitMrWhiteLocationGuess: async function(context, guessedLocation) {
            var room = context.room;
            var currentUID = context.currentUID;
            var roomId = context.roomId;
            var playSound = context.playSound;

            if (!room || room.status !== 'mrwhite_guessing') return;
            if (currentUID !== room.ejectedUID && currentUID !== room.mrwhiteId) return;
            
            if (typeof playSound === 'function') playSound('click');
            
            var locEn = (room.scenario?.loc_en || '').toLowerCase();
            var locAr = (room.scenario?.loc_ar || '').toLowerCase();
            var guess = guessedLocation.trim().toLowerCase();
            var correct = guess === locEn || guess === locAr || locEn.includes(guess) || locAr.includes(guess);
            
            var sysMsg = { sender: 'system', name: 'SYSTEM', text: correct ? '🎯 Mr. White guessed correctly!' : '❌ Wrong guess!', time: Date.now() };
            
            try {
                await roomsCollection.doc(roomId).update({
                    status: correct ? 'finished_mrwhite_wins' : 'finished_spy_caught',
                    mrwhiteGuessLocation: guessedLocation,
                    messages: firebase.firestore.FieldValue.arrayUnion(sysMsg)
                });
            } catch (e) {
                console.error("Submit Mr White Guess Error:", e);
            }
        },

        /**
         * Extracted from spyVoluntaryDeclare in 10-app.js
         */
        spyVoluntaryDeclare: async function(context) {
            var room = context.room;
            var currentUID = context.currentUID;
            var roomId = context.roomId;
            var playSound = context.playSound;

            if (!room || room.status !== 'discussing') return;
            var myPlayer = room.players?.find(function(p) { return p.uid === currentUID; });
            if (myPlayer?.role !== 'spy') return;
            
            if (typeof playSound === 'function') playSound('click');
            
            var sysMsg = { sender: 'system', name: 'SYSTEM', text: '🕵️ Spy revealed themselves!', time: Date.now() };
            
            try {
                await roomsCollection.doc(roomId).update({
                    status: 'spy_guessing',
                    ejectedUID: currentUID,
                    messages: firebase.firestore.FieldValue.arrayUnion(sysMsg),
                    votingEndTime: null, 
                    turnEndTime: null
                });
            } catch (e) {
                console.error("Spy Voluntary Declare Error:", e);
            }
        },

        /**
         * Extracted from addBotToRoom in 10-app.js
         */
        addBotToRoom: async function(context) {
            var room = context.room;
            var currentUID = context.currentUID;
            var roomId = context.roomId;
            var OWNER_UID = context.OWNER_UID;
            var setAlertMessage = context.setAlertMessage;
            var playSound = context.playSound;

            if (!room || currentUID !== OWNER_UID) return;
            
            var bots = room.players.filter(function(p) { return p.isBot; });
            if (bots.length >= 5) { 
                if (typeof setAlertMessage === 'function') setAlertMessage('Max 5 bots allowed!'); 
                return; 
            }
            if (room.players.length >= 10) { 
                if (typeof setAlertMessage === 'function') setAlertMessage('Room is full!'); 
                return; 
            }
            
            // BOT Names/Photos from 10-app.js
            var BOT_NAMES = ['Shadow', 'Ghost', 'Cipher', 'Viper', 'Nova', 'Hex', 'Raven', 'Storm', 'Blaze', 'Frost', 'Echo', 'Spectre'];
            var botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)] + '_' + Math.floor(Math.random() * 99);
            var botUID = 'bot_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            
            var newBot = { 
                uid: botUID, 
                name: botName, 
                status: 'active', 
                photo: null, 
                role: null, 
                equipped: {}, 
                vip: {}, 
                isBot: true, 
                botUID: botUID 
            };
            
            try {
                await roomsCollection.doc(roomId).update({ 
                    players: firebase.firestore.FieldValue.arrayUnion(newBot) 
                });
                if (typeof playSound === 'function') playSound('success');
            } catch (e) {
                console.error("Add Bot Error:", e);
            }
        },

        /**
         * Extracted from removeBotFromRoom in 10-app.js
         */
        removeBotFromRoom: async function(context, botUID) {
            var room = context.room;
            var currentUID = context.currentUID;
            var roomId = context.roomId;
            var OWNER_UID = context.OWNER_UID;
            var playSound = context.playSound;

            if (!room || currentUID !== OWNER_UID) return;
            
            try {
                await roomsCollection.doc(roomId).update({ 
                    players: room.players.filter(function(p) { return p.uid !== botUID; }) 
                });
                if (typeof playSound === 'function') playSound('click');
            } catch (e) {
                console.error("Remove Bot Error:", e);
            }
        }
    };

    // Export to global scope with safety merge
    window.GameService = Object.assign(window.GameService || {}, GameService);
})();
