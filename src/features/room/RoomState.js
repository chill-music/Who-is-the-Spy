/**
 * Who-Is-The-Spy-og | RoomState.js
 * Modularised Room Management Service (IIFE + Global Scope)
 * 
 * Part of Phase 4: Modularization
 * Handles: Create Room, Join Room, Leave Room
 * Preserves: window.RoomService, var, UTF-8
 */

(function() {
    var RoomService = {
        /**
         * Generates the default avatar URL if none exists.
         */
        getDefaultPhoto: function(uData, name) {
            return uData?.photoURL || `https://ui-avatars.com/api/?name=${name || 'Guest'}&background=random`;
        },

        /**
         * Extracted from handleCreateGame in 10-app.js
         */
        handleCreateGame: async function(context) {
            var nickname = context.nickname;
            var isPrivate = context.isPrivate;
            var password = context.password;
            var currentUID = context.currentUID;
            var currentUserData = context.currentUserData;
            var setupMode = context.setupMode;
            var t = context.t;
            var lang = context.lang;
            
            // UI Callbacks
            var setAlertMessage = context.setAlertMessage;
            var setLoading = context.setLoading;
            var setRoomId = context.setRoomId;
            var setShowSetupModal = context.setShowSetupModal;
            var setActiveView = context.setActiveView;
            var setCopied = context.setCopied;
            var playSound = context.playSound;

            if (!nickname.trim()) return;
            if (isPrivate && !password.trim()) { 
                if (typeof setAlertMessage === 'function') setAlertMessage(t.privateRoomError); 
                return; 
            }
            
            if (typeof playSound === 'function') playSound('click');
            if (typeof setLoading === 'function') setLoading(true);
            
            var uid = currentUID; 
            var tempUserData = currentUserData;
            if (!uid) { 
                if (typeof setLoading === 'function') setLoading(false); 
                if (typeof setAlertMessage === 'function') setAlertMessage(lang === 'ar' ? 'حدث خطأ' : 'Error'); 
                return; 
            }
            
            // 5-character random uppercase ID
            var id = Math.random().toString(36).substring(2, 7).toUpperCase();
            
            try {
                // Dependency: roomsCollection (global in 01-config.js)
                await roomsCollection.doc(id).set({ 
                    id: id, 
                    admin: uid, 
                    status: 'waiting', 
                    players: [{ 
                        uid: uid, 
                        name: nickname, 
                        status: 'active', 
                        photo: this.getDefaultPhoto(tempUserData, nickname), 
                        role: null, 
                        equipped: tempUserData?.equipped || {}, 
                        vip: tempUserData?.vip || {} 
                    }], 
                    scenario: null, 
                    spyId: null, 
                    currentTurnUID: null, 
                    turnEndTime: null, 
                    votingEndTime: null, 
                    currentRound: 0, 
                    messages: [], 
                    votes: {}, 
                    usedLocations: [], 
                    wordVotes: {}, 
                    chosenWord: null, 
                    wordSelEndTime: null, 
                    votingRequest: null, 
                    mode: setupMode, 
                    isPrivate: isPrivate, 
                    password: isPrivate ? password : null, 
                    maxPlayers: 8, 
                    startedAt: null, 
                    summaryShown: false 
                });
                
                if (typeof setRoomId === 'function') setRoomId(id);
                if (typeof setLoading === 'function') setLoading(false);
                if (typeof setShowSetupModal === 'function') setShowSetupModal(false);
                if (typeof setActiveView === 'function') setActiveView('lobby');
                
                // Clipboard integration
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(id).then(function() {
                        if (typeof setCopied === 'function') {
                            setCopied(true);
                            setTimeout(function() { setCopied(false); }, 2000);
                        }
                    }).catch(function(e) { console.error('[PRO SPY ERROR] Clipboard write failed:', e); });
                }
            } catch (e) {
                console.error('[PRO SPY ERROR] Room Creation Error:', e);
                if (typeof setLoading === 'function') setLoading(false);
                if (typeof setAlertMessage === 'function') {
                    setAlertMessage(lang === 'ar' ? 'فشل إنشاء الغرفة' : 'Failed to create room');
                }
            }
        },

        /**
         * Extracted from handleJoinGame in 10-app.js
         */
        handleJoinGame: async function(context) {
            var id = context.id;
            var pwd = context.pwd;
            var nickname = context.nickname;
            var currentUID = context.currentUID;
            var currentUserData = context.currentUserData;
            var t = context.t;
            var lang = context.lang;
            
            // UI Callbacks
            var setJoinError = context.setJoinError;
            var setLoading = context.setLoading;
            var setAlertMessage = context.setAlertMessage;
            var setRoomId = context.setRoomId;
            var setActiveView = context.setActiveView;
            var setShowBrowseRooms = context.setShowBrowseRooms;
            var playSound = context.playSound;

            if (!id || id.trim() === "") { 
                if (typeof setJoinError === 'function') setJoinError(t.enterCodeError); 
                return; 
            }
            if (!nickname.trim()) return;
            
            if (typeof playSound === 'function') playSound('click');
            if (typeof setLoading === 'function') setLoading(true);
            if (typeof setJoinError === 'function') setJoinError('');
            
            var uid = currentUID; 
            var tempUserData = currentUserData;
            if (!uid) { 
                if (typeof setLoading === 'function') setLoading(false); 
                if (typeof setAlertMessage === 'function') setAlertMessage(lang === 'ar' ? 'حدث خطأ' : 'Error'); 
                return; 
            }
            
            var roomIdClean = id.toUpperCase();
            var ref = roomsCollection.doc(roomIdClean);
            
            try {
                var snap = await ref.get();
                if (snap.exists) {
                    var data = snap.data();
                    if(data.isPrivate && data.password !== pwd) { 
                        if (typeof setJoinError === 'function') {
                            setJoinError(lang === 'ar' ? 'كلمة السر غير صحيحة' : "Incorrect Password"); 
                        }
                        if (typeof setLoading === 'function') setLoading(false);
                        return; 
                    }
                    
                    // Normalize players list for search (Compatible with Array or Object)
                    var playersData = data.players || {};
                    var playersArray = Array.isArray(playersData) ? playersData : Object.values(playersData);
                    var exists = playersArray.find(function(p) { return p.uid === uid; });
                    
                    if (!exists) { 
                        var newPlayerData = { 
                            uid: uid, 
                            name: nickname, 
                            status: 'active', 
                            photo: this.getDefaultPhoto(tempUserData, nickname), 
                            role: null, 
                            equipped: tempUserData?.equipped || {}, 
                            vip: tempUserData?.vip || {} 
                        };

                        if (Array.isArray(playersData)) {
                            // Legacy Array update
                            await ref.update({ 
                                players: firebase.firestore.FieldValue.arrayUnion(newPlayerData) 
                            }); 
                        } else {
                            // Rebuild Object (Map) update
                            await ref.update({
                                [`players.${uid}`]: newPlayerData,
                                playerOrder: firebase.firestore.FieldValue.arrayUnion(uid)
                            });
                        }
                    }
                    
                    if (typeof setRoomId === 'function') setRoomId(roomIdClean);
                    if (typeof setActiveView === 'function') setActiveView('lobby');
                    if (typeof setShowBrowseRooms === 'function') setShowBrowseRooms(false);
                } else { 
                    if (typeof setJoinError === 'function') {
                        setJoinError(lang === 'ar' ? 'الغرفة غير موجودة' : "Room not found"); 
                    }
                }
            } catch (e) {
                console.error("Join Room Error:", e);
                if (typeof setJoinError === 'function') {
                    setJoinError(lang === 'ar' ? 'خطأ في الانضمام' : "Error joining room");
                }
            }
            
            if (typeof setLoading === 'function') setLoading(false);
        },

        /**
         * Extracted from handleLeaveRoom in 10-app.js
         */
        handleLeaveRoom: async function(context) {
            var room = context.room;
            var roomId = context.roomId;
            var currentUID = context.currentUID;
            
            // UI Callbacks
            var setRoom = context.setRoom;
            var setRoomId = context.setRoomId;
            var setShowSummary = context.setShowSummary;
            var playSound = context.playSound;

            if (!room || !currentUID) return;
            if (typeof playSound === 'function') playSound('click');
            
            var isRoomAdmin = room.admin === currentUID;
            try {
                if (isRoomAdmin) { 
                    // Admin leaves → delete room
                    await roomsCollection.doc(roomId).delete(); 
                } else { 
                    // Member leaves → remove from players structure
                    var playersData = room.players || {};
                    if (Array.isArray(playersData)) {
                        // Legacy Array remove
                        var updatedPlayers = playersData.filter(function(p) { 
                            return p.uid !== currentUID; 
                        });
                        await roomsCollection.doc(roomId).update({ 
                            players: updatedPlayers 
                        }); 
                    } else {
                        // Rebuild Object (Map) remove
                        await roomsCollection.doc(roomId).update({
                            [`players.${currentUID}`]: firebase.firestore.FieldValue.delete(),
                            playerOrder: firebase.firestore.FieldValue.arrayRemove(currentUID)
                        });
                    }
                }
                
                if (typeof setRoom === 'function') setRoom(null);
                if (typeof setRoomId === 'function') setRoomId('');
                if (typeof setShowSummary === 'function') setShowSummary(false);
            } catch (e) {
                console.error("Leave Room Error:", e);
            }
        }
    };

    // Export to global scope
    window.RoomService = RoomService;
})();
