/**
 * Who-Is-The-Spy-og | ChatManager.js
 * Modularised Chat & Social Service (IIFE + Global Scope)
 * 
 * Part of Phase 4: Modularization
 * Handles: Private Chat, Friends, Gifts, Shop
 * Preserves: window.ChatManager, var, UTF-8
 */

(function() {
    var ChatManager = {
        /**
         * Extracted from openPrivateChat in 10-app.js
         */
        openPrivateChat: function(context, friend) {
            var user = context.user;
            var setChatFriend = context.setChatFriend;
            var setShowPrivateChat = context.setShowPrivateChat;
            var setOpenChatId = context.setOpenChatId;
            
            if (typeof setChatFriend === 'function') setChatFriend(friend);
            if (typeof setShowPrivateChat === 'function') setShowPrivateChat(true);
            
            if (user && friend) { 
                var cId = [user.uid, friend.uid].sort().join('_'); 
                if (typeof setOpenChatId === 'function') setOpenChatId(cId); 
                
                // Dependency: chatsCollection (global)
                if (typeof chatsCollection !== 'undefined') {
                    var updateData = {};
                    updateData["unread." + user.uid] = 0;
                    chatsCollection.doc(cId).update(updateData).catch(function() {}); 
                }
            }
        },

        /**
         * Extracted from closePrivateChat in 10-app.js
         */
        closePrivateChat: function(context) {
            var setShowPrivateChat = context.setShowPrivateChat;
            var setChatFriend = context.setChatFriend;
            var setOpenChatId = context.setOpenChatId;
            
            if (typeof setShowPrivateChat === 'function') setShowPrivateChat(false);
            if (typeof setChatFriend === 'function') setChatFriend(null);
            if (typeof setOpenChatId === 'function') setOpenChatId(null);
        },

        /**
         * Extracted from handleSendRequest in 10-app.js
         */
        handleSendRequest: async function(context, targetUid) {
            var user = context.user;
            var isLoggedIn = context.isLoggedIn;
            var userData = context.userData;
            var t = context.t;
            var createNotification = context.createNotification;

            if (!targetUid || !isLoggedIn) return;
            if (userData.friends?.includes(targetUid)) return;
            if (userData.friendRequests?.includes(targetUid)) return;
            
            try {
                // Dependency: usersCollection, firebase (global)
                await usersCollection.doc(targetUid).update({ 
                    friendRequests: firebase.firestore.FieldValue.arrayUnion(user.uid) 
                });
                
                if (typeof createNotification === 'function') {
                    await createNotification(
                        targetUid, 
                        'friend_request', 
                        userData.displayName + " " + t.friendRequest, 
                        user.uid, 
                        userData.displayName
                    );
                }
            } catch (e) {
                console.error("Friend Request Error:", e);
            }
        },

        /**
         * Extracted from handleAddFriendById in 10-app.js
         */
        handleAddFriendById: async function(context) {
            var addFriendId = context.addFriendId;
            var isLoggedIn = context.isLoggedIn;
            var user = context.user;
            var userData = context.userData;
            var t = context.t;
            var lang = context.lang;
            var setFriendSearchMsg = context.setFriendSearchMsg;
            var setAddFriendId = context.setAddFriendId;

            if (!addFriendId.trim() || !isLoggedIn) return;
            if (typeof setFriendSearchMsg === 'function') setFriendSearchMsg('');
            
            try {
                var userQuery = await usersCollection.where('customId', '==', addFriendId.trim()).get();
                if (userQuery.empty) { 
                    if (typeof setFriendSearchMsg === 'function') setFriendSearchMsg(t.friendNotFound); 
                    return; 
                }
                
                var targetUid = userQuery.docs[0].id;
                if (targetUid === user.uid) { 
                    if (typeof setFriendSearchMsg === 'function') setFriendSearchMsg(lang === 'ar' ? 'لا يمكنك إضافة نفسك' : 'Cannot add yourself'); 
                    return; 
                }
                if (userData.friends?.includes(targetUid)) { 
                    if (typeof setFriendSearchMsg === 'function') setFriendSearchMsg(lang === 'ar' ? 'صديق بالفعل' : 'Already a friend'); 
                    return; 
                }
                if (userData.friendRequests?.includes(targetUid)) { 
                    if (typeof setFriendSearchMsg === 'function') setFriendSearchMsg(lang === 'ar' ? 'لديك طلب من هذا المستخدم' : 'You have a request from this user'); 
                    return; 
                }
                
                await this.handleSendRequest(context, targetUid);
                
                if (typeof setFriendSearchMsg === 'function') setFriendSearchMsg(t.requestSent);
                if (typeof setAddFriendId === 'function') setAddFriendId('');
            } catch (e) { 
                console.error('addFriend error:', e); 
                if (typeof setFriendSearchMsg === 'function') setFriendSearchMsg(lang === 'ar' ? '❌ خطأ' : '❌ Error'); 
            }
        },

        /**
         * Extracted from handleAcceptRequest in 10-app.js
         */
        handleAcceptRequest: async function(context, fromUid) {
            var user = context.user;
            var isLoggedIn = context.isLoggedIn;
            var userData = context.userData;
            var t = context.t;
            var lang = context.lang;
            var createNotification = context.createNotification;
            var setNotification = context.setNotification;
            var incrementMissionProgress = context.incrementMissionProgress;
            var checkAndUnlockAchievements = context.checkAndUnlockAchievements;

            if (!user || !isLoggedIn) return;
            
            try {
                await usersCollection.doc(user.uid).update({ 
                    friends: firebase.firestore.FieldValue.arrayUnion(fromUid), 
                    friendRequests: firebase.firestore.FieldValue.arrayRemove(fromUid) 
                });
                await usersCollection.doc(fromUid).update({ 
                    friends: firebase.firestore.FieldValue.arrayUnion(user.uid) 
                });
                
                if (typeof createNotification === 'function') {
                    await createNotification(
                        fromUid, 
                        'friend_request_accepted', 
                        userData.displayName + " " + (lang === 'ar' ? 'قبل طلب صداقتك!' : 'accepted your friend request!'), 
                        user.uid, 
                        userData.displayName
                    );
                }
                
                if (typeof setNotification === 'function') setNotification(t.friendAdded);
                
                if (typeof incrementMissionProgress === 'function') {
                    await incrementMissionProgress('friendsAdded', 1);
                }
                
                var updDoc = await usersCollection.doc(user.uid).get();
                if (updDoc.exists && typeof checkAndUnlockAchievements === 'function') {
                    await checkAndUnlockAchievements(updDoc.data());
                }
            } catch (e) {
                console.error("Accept Friend Request Error:", e);
            }
        },

        /**
         * Extracted from handleRejectRequest in 10-app.js
         */
        handleRejectRequest: async function(context, fromUid) {
            var user = context.user;
            var isLoggedIn = context.isLoggedIn;
            if (!user || !isLoggedIn) return;
            
            try {
                await usersCollection.doc(user.uid).update({ 
                    friendRequests: firebase.firestore.FieldValue.arrayRemove(fromUid) 
                });
            } catch (e) {
                console.error("Reject Friend Request Error:", e);
            }
        },

        /**
         * Extracted from handleSendGiftToUser in 10-app.js
         */
        handleSendGiftToUser: async function(context, gift, targetUser, qty, fromInventory, familyScopeId) {
            if (qty === undefined) qty = 1;
            if (fromInventory === undefined) fromInventory = false;
            
            var user = context.user;
            var isLoggedIn = context.isLoggedIn;
            var userData = context.userData;
            var lang = context.lang;
            var t = context.t;
            var setNotification = context.setNotification;
            var incrementMissionProgress = context.incrementMissionProgress;
            var checkAndUnlockAchievements = context.checkAndUnlockAchievements;
            var createNotification = context.createNotification;

            if (!user || !isLoggedIn) return;
            var currency = userData?.currency || 0;
            var totalCost = fromInventory ? 0 : gift.cost * qty;

            if (!fromInventory && currency < totalCost) {
                if (typeof setNotification === 'function') setNotification(lang === 'ar' ? '❌ رصيدك غير كافي' : '❌ Insufficient balance');
                return;
            }

            if (fromInventory) {
                var giftCounts = userData?.inventory?.giftCounts || {};
                var currentCount = giftCounts[gift.id] || 0;
                if (currentCount <= 0) {
                    if (typeof setNotification === 'function') setNotification(lang === 'ar' ? '❌ ليس لديك هذه الهدية في المخزون' : '❌ Gift not in inventory');
                    return;
                }
                var newCount = currentCount - 1;
                var invUpdates = {};
                invUpdates["inventory.giftCounts." + gift.id] = newCount;
                if (newCount <= 0) invUpdates['inventory.gifts'] = firebase.firestore.FieldValue.arrayRemove(gift.id);
                try { await usersCollection.doc(user.uid).update(invUpdates); } catch(e) {}
            }

            var isSelfSend = !targetUser || targetUser.uid === 'self' || targetUser.uid === user.uid;
            var giftName = lang === 'ar' ? gift.name_ar : gift.name_en;

            var bonuses = [];
            var totalBonus = 0;
            for (var i = 0; i < qty; i++) {
                var b = Math.floor(
                    (gift.minBonus || 1) +
                    Math.random() * ((gift.maxBonus || Math.floor(gift.cost * 0.1)) - (gift.minBonus || 1))
                );
                bonuses.push(b);
                totalBonus += b;
            }
            var totalCharisma = gift.charisma * qty;

            try {
                // Step 1: Sender deduction
                var senderUpdate = {
                    currency:   firebase.firestore.FieldValue.increment(-totalCost),
                    giftsSent:  firebase.firestore.FieldValue.increment(qty),
                };
                if (typeof hasVIP === 'function' && hasVIP(userData)) {
                    senderUpdate['vip.xp'] = firebase.firestore.FieldValue.increment((gift.vipXP || 0) * qty);
                }
                await usersCollection.doc(user.uid).update(senderUpdate);

                // Step 2: Receiver credit
                var receiverUpdates = {
                    charisma:      firebase.firestore.FieldValue.increment(totalCharisma),
                    currency:      firebase.firestore.FieldValue.increment(totalBonus),
                    giftsReceived: firebase.firestore.FieldValue.increment(qty),
                };
                if (isSelfSend) {
                    await usersCollection.doc(user.uid).update(receiverUpdates);
                } else {
                    await usersCollection.doc(targetUser.uid).update(receiverUpdates);
                }

                // Step 3: Logs & Messages
                var parallelOps = [];
                for (var j = 0; j < qty; j++) {
                    parallelOps.push(giftsLogCollection.add({
                        senderId:     user.uid,
                        senderName:   userData?.displayName || 'User',
                        senderPhoto:  userData?.photoURL || null,
                        receiverId:   isSelfSend ? user.uid : targetUser.uid,
                        receiverName: isSelfSend ? (userData?.displayName || 'User') : (targetUser.displayName || 'User'),
                        giftId:       gift.id,
                        giftName:     giftName,
                        giftEmoji:    gift.emoji,
                        giftImageUrl: gift.imageUrl || '',
                        charisma:     gift.charisma,
                        bonus:        bonuses[j],
                        cost:         gift.cost,
                        timestamp:    firebase.firestore.FieldValue.serverTimestamp(),
                    }));
                }

                var chatMsgBase = {
                    senderId:      user.uid,
                    senderName:    userData?.displayName || 'User',
                    senderPhoto:   userData?.photoURL || null,
                    senderVipLevel: window.getVIPLevel ? (window.getVIPLevel(userData) || 0) : 0,
                    type:          'gift',
                    giftId:        gift.id,
                    giftName:      giftName,
                    giftEmoji:     gift.emoji,
                    giftImageUrl:  gift.imageUrl || '',
                    giftCharisma:  totalCharisma,
                    giftBonus:     totalBonus,
                    giftCost:      totalCost,
                    giftQty:       qty,
                    text:          "🎁 " + (qty > 1 ? ("×" + qty + " ") : "") + (lang === 'ar' ? 'أرسل هدية' : 'Sent a gift') + ": " + gift.emoji,
                    timestamp:     firebase.firestore.FieldValue.serverTimestamp(),
                };

                if (isSelfSend) {
                    var selfChatId  = user.uid + "_self";
                    var selfChatRef = chatsCollection.doc(selfChatId);
                    parallelOps.push(selfChatRef.set({
                        participants: [user.uid, user.uid],
                        type:         'self',
                        lastMessage:  "🎁 " + giftName + (qty > 1 ? (" ×" + qty) : ""),
                        lastAt:       firebase.firestore.FieldValue.serverTimestamp(),
                    }, { merge: true }));
                    parallelOps.push(selfChatRef.collection('messages').add(chatMsgBase));
                } else {
                    var chatId = [user.uid, targetUser.uid].sort().join('_');
                    parallelOps.push(chatsCollection.doc(chatId).collection('messages').add(chatMsgBase));
                    var chatUpdate = {
                        members:                    [user.uid, targetUser.uid],
                        lastMessage:                "🎁 " + giftName + (qty > 1 ? (" ×" + qty) : ""),
                        timestamp:                  firebase.firestore.FieldValue.serverTimestamp(),
                    };
                    chatUpdate["unread." + targetUser.uid] = firebase.firestore.FieldValue.increment(1);
                    parallelOps.push(chatsCollection.doc(chatId).set(chatUpdate, { merge: true }));
                    
                    if (typeof createNotification === 'function') {
                        parallelOps.push(createNotification(
                            targetUser.uid,
                            'gift',
                            (userData?.displayName || 'User') + " " + t.sentAGift + ": " + gift.emoji + (qty > 1 ? (" ×" + qty) : "") + " (+" + totalCharisma + " ⭐, +" + totalBonus + " 🧠)",
                            user.uid,
                            userData?.displayName || 'User'
                        ));
                    }
                }

                if (typeof incrementMissionProgress === 'function') {
                    parallelOps.push(incrementMissionProgress('giftsSent', qty));
                }

                if (familyScopeId && totalCharisma > 0 && typeof familiesCollection !== 'undefined') {
                    var famBonus = Math.floor(totalCharisma * 0.5);
                    if (famBonus > 0) {
                        parallelOps.push(familiesCollection.doc(familyScopeId).update({
                            activeness: firebase.firestore.FieldValue.increment(famBonus),
                            weeklyActiveness: firebase.firestore.FieldValue.increment(famBonus)
                        }).catch(function(){})); 
                    }
                }

                await Promise.all(parallelOps);
                
                if (typeof setNotification === 'function') {
                    setNotification(qty > 1 ? ("🎁 " + t.giftSent + " ×" + qty + "!") : ("🎁 " + t.giftSent + "!"));
                }
                
                var finalDoc = await usersCollection.doc(user.uid).get();
                if (finalDoc.exists && typeof checkAndUnlockAchievements === 'function') {
                    await checkAndUnlockAchievements(finalDoc.data());
                }

            } catch(error) {
                console.error('Gift send error:', error);
                if (typeof setNotification === 'function') {
                    setNotification(lang === 'ar' ? '❌ خطأ في الإرسال' : '❌ Send error');
                }
            }
        },

        /**
         * Extracted from handlePurchase in 10-app.js
         */
        handlePurchase: async function(context, item, targetUser, qty) {
            if (qty === undefined) qty = 1;
            
            var user = context.user;
            var isLoggedIn = context.isLoggedIn;
            var userData = context.userData;
            var lang = context.lang;
            var t = context.t;
            var setNotification = context.setNotification;
            var setShowLoginAlert = context.setShowLoginAlert;
            var playSound = context.playSound;

            if (!user || !isLoggedIn) { 
                if (typeof setShowLoginAlert === 'function') setShowLoginAlert(true); 
                return; 
            }
            
            var currency = userData?.currency || 0;
            if (currency < item.cost) { 
                if (typeof setNotification === 'function') setNotification(t.purchaseFail); 
                return; 
            }

            // ✅ VIP Gift Lock
            if (item.vipMinLevel && item.vipMinLevel > 0) {
                var userVipLevel = window.getVIPLevel ? window.getVIPLevel(userData) : 0;
                if (userVipLevel < item.vipMinLevel) {
                    if (typeof setNotification === 'function') {
                        setNotification(lang === 'ar'
                            ? "🔒 يتطلب VIP " + item.vipMinLevel + " على الأقل"
                            : "🔒 Requires VIP " + item.vipMinLevel + "+"
                        );
                    }
                    return;
                }
            }

            // 🧧 Red Packets
            if (item.type === 'red_packets') {
                try {
                    await usersCollection.doc(user.uid).update({
                        currency: firebase.firestore.FieldValue.increment(-item.cost),
                        'inventory.red_packets': firebase.firestore.FieldValue.arrayUnion(item.id),
                    });
                    if (typeof setNotification === 'function') {
                        setNotification(lang === 'ar' ? '✅ تم شراء المغلف! موجود في حقيبتك' : '✅ Packet purchased! Check your inventory');
                    }
                } catch(e) { 
                    if (typeof setNotification === 'function') setNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); 
                }
                return;
            }

            // 🎁 Gifts
            if (item.type === 'gifts' || item.type === 'gifts_vip') {
                if (targetUser && targetUser.uid !== 'self' && targetUser.uid !== user?.uid) {
                    await this.handleSendGiftToUser(context, item, targetUser, qty || 1);
                    return;
                }
                
                var giftCounts = userData?.inventory?.giftCounts || {};
                var currentCount = giftCounts[item.id] || 0;
                try {
                    var updateData = {
                        currency: firebase.firestore.FieldValue.increment(-item.cost),
                        'inventory.gifts': firebase.firestore.FieldValue.arrayUnion(item.id)
                    };
                    updateData["inventory.giftCounts." + item.id] = currentCount + 1;
                    
                    if (item.durationDays && item.durationDays > 0) {
                        var expiresAt = Date.now() + item.durationDays * 86400000;
                        var existingExpiry = userData?.inventory?.expiry?.[item.id];
                        if (!existingExpiry || existingExpiry < Date.now()) {
                            updateData["inventory.expiry." + item.id] = expiresAt;
                        }
                    }
                    await usersCollection.doc(user.uid).update(updateData);
                    if (typeof playSound === 'function') playSound('success');
                    
                    var giftName = lang === 'ar' ? item.name_ar : item.name_en;
                    if (typeof setNotification === 'function') {
                        setNotification("🎁 " + giftName + " " + (lang === 'ar' ? 'أُضيفت للمخزون!' : 'added to inventory!'));
                    }
                } catch (e) { 
                    if (typeof setNotification === 'function') setNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); 
                }
                return;
            }

            // 🤝 BFF Tokens
            if (item.cardType !== undefined) {
                try {
                    await usersCollection.doc(user.uid).update({
                        currency: firebase.firestore.FieldValue.increment(-item.cost),
                        'inventory.bff_tokens': firebase.firestore.FieldValue.arrayUnion(item.id),
                    });
                    if (typeof playSound === 'function') playSound('success');
                    var tokenName = lang === 'ar' ? item.name_ar : item.name_en;
                    if (typeof setNotification === 'function') {
                        setNotification("🤝 " + tokenName + " " + (lang === 'ar' ? 'أُضيف للمخزون!' : 'added to inventory!'));
                    }
                } catch (e) { 
                    if (typeof setNotification === 'function') setNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); 
                }
                return;
            }

            // 🛠️ Generic Inventory Items (Frames, Badges, Titles, etc.)
            var inventory = userData?.inventory || {};
            var alreadyOwned = inventory[item.type]?.includes(item.id);

            if (alreadyOwned) {
                if (item.durationDays && item.durationDays > 0) {
                    try {
                        var existingExpiry = userData?.inventory?.expiry?.[item.id];
                        var baseTime = existingExpiry && existingExpiry > Date.now() ? existingExpiry : Date.now();
                        var newExpiry = baseTime + item.durationDays * 86400000;
                        await usersCollection.doc(user.uid).update({
                            currency: firebase.firestore.FieldValue.increment(-item.cost),
                            ["inventory.expiry." + item.id]: newExpiry,
                        });
                        if (typeof playSound === 'function') playSound('success');
                        var itemName = lang === 'ar' ? item.name_ar : item.name_en;
                        if (typeof setNotification === 'function') {
                            setNotification("✅ " + itemName + " (⏳ +" + item.durationDays + " " + (lang === 'ar' ? 'يوم' : 'days') + ")");
                        }
                    } catch(e) { 
                        if (typeof setNotification === 'function') setNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); 
                    }
                    return;
                }
                if (typeof setNotification === 'function') setNotification(t.alreadyOwned);
                return;
            }

            try {
                var updateData = {
                    currency: firebase.firestore.FieldValue.increment(-item.cost),
                };
                updateData["inventory." + item.type] = firebase.firestore.FieldValue.arrayUnion(item.id);
                
                if (item.durationDays && item.durationDays > 0) {
                    updateData["inventory.expiry." + item.id] = Date.now() + item.durationDays * 86400000;
                }
                
                await usersCollection.doc(user.uid).update(updateData);
                if (typeof playSound === 'function') playSound('success');
                
                var itemName = lang === 'ar' ? item.name_ar : item.name_en;
                var timerMsg = item.durationDays ? (" (⏳ " + item.durationDays + " " + (lang === 'ar' ? 'يوم' : 'days') + ")") : '';
                if (typeof setNotification === 'function') {
                    setNotification(t.purchaseSuccess + " " + itemName + timerMsg);
                }
            } catch (error) { 
                if (typeof setNotification === 'function') setNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error'); 
            }
        },

        /**
         * Extracted from handleBuyVIP in 10-app.js
         */
        handleBuyVIP: async function(context) {
            var user = context.user;
            var isLoggedIn = context.isLoggedIn;
            var userData = context.userData;
            var lang = context.lang;
            var setNotification = context.setNotification;
            var setShowLoginAlert = context.setShowLoginAlert;
            var playSound = context.playSound;

            if (!user || !isLoggedIn) { 
                if (typeof setShowLoginAlert === 'function') setShowLoginAlert(true); 
                return; 
            }
            
            var VIP_SHOP_COST = 50000;
            var VIP_SHOP_XP   = 5000;   
            var currency = userData?.currency || 0;
            
            if (currency < VIP_SHOP_COST) {
                if (typeof setNotification === 'function') {
                    setNotification(lang === 'ar' 
                        ? "❌ تحتاج " + VIP_SHOP_COST.toLocaleString() + " 🧠" 
                        : "❌ Need " + VIP_SHOP_COST.toLocaleString() + " 🧠"
                    );
                }
                return;
            }

            try {
                var isFirstPurchase = !userData?.vip?.xp || userData.vip.xp === 0;
                var now = new Date();
                var currentExpiry = userData?.vip?.expiresAt?.toDate ? userData.vip.expiresAt.toDate() : null;
                var baseDate = (userData?.vip?.isActive && currentExpiry && currentExpiry > now)
                    ? new Date(currentExpiry.getTime())
                    : new Date(now.getTime());
                baseDate.setDate(baseDate.getDate() + 30);

                var updates = {
                    currency:            firebase.firestore.FieldValue.increment(-VIP_SHOP_COST),
                    'vip.isActive':      true,
                    'vip.expiresAt':     firebase.firestore.Timestamp.fromDate(baseDate),
                    'vip.purchasedAt':   TS(), 
                };

                if (isFirstPurchase) {
                    updates['vip.xp'] = firebase.firestore.FieldValue.increment(VIP_SHOP_XP);
                    var newLevel   = window.getVIPLevelFromXP ? window.getVIPLevelFromXP(VIP_SHOP_XP) : 1;
                    var levelCfg   = window.VIP_CONFIG ? window.VIP_CONFIG.find(function(v) { return v.level === newLevel; }) : null;
                    var vipItems   = levelCfg?.vipItems || [];
                    for (var i = 0; i < vipItems.length; i++) {
                        var item = vipItems[i];
                        if (item.type === 'frames')  updates['inventory.frames']  = firebase.firestore.FieldValue.arrayUnion(item.id);
                        if (item.type === 'badges')  updates['inventory.badges']  = firebase.firestore.FieldValue.arrayUnion(item.id);
                        if (item.type === 'titles')  updates['inventory.titles']  = firebase.firestore.FieldValue.arrayUnion(item.id);
                    }
                }

                await usersCollection.doc(user.uid).update(updates);
                if (typeof playSound === 'function') playSound('success');
                
                if (typeof setNotification === 'function') {
                    if (isFirstPurchase) {
                        setNotification(lang === 'ar'
                            ? "👑 تم شراء VIP! +" + VIP_SHOP_XP.toLocaleString() + " XP — صالح 30 يوم"
                            : "👑 VIP Purchased! +" + VIP_SHOP_XP.toLocaleString() + " XP — Valid 30 days"
                        );
                    } else {
                        setNotification(lang === 'ar'
                            ? "👑 تم تجديد VIP! +30 يوم إضافية"
                            : "👑 VIP Renewed! +30 days added"
                        );
                    }
                }
            } catch(e) {
                console.error("VIP Purchase Error:", e);
                if (typeof setNotification === 'function') {
                    setNotification(lang === 'ar' ? '❌ خطأ، حاول مرة أخرى' : '❌ Error, try again');
                }
            }
        },

        /**
         * Extracted from handleEquip in 10-app.js
         */
        handleEquip: async function(context, item) {
            var user = context.user;
            var isLoggedIn = context.isLoggedIn;
            var userData = context.userData;
            var lang = context.lang;
            var setNotification = context.setNotification;
            var playSound = context.playSound;
            var MAX_BADGES = context.MAX_BADGES || 3;

            if (!user || !isLoggedIn) return;
            
            try {
                var equipped = userData?.equipped || { badges: [] };
                if (item.type === 'badges') {
                    var currentBadges = equipped.badges || []; 
                    if (!Array.isArray(currentBadges)) currentBadges = currentBadges ? [currentBadges] : [];
                    if (currentBadges.length >= MAX_BADGES) { 
                        if (typeof setNotification === 'function') setNotification(lang === 'ar' ? "الحد الأقصى " + MAX_BADGES + " شارات" : "Maximum " + MAX_BADGES + " badges"); 
                        return; 
                    }
                    if (!currentBadges.includes(item.id)) currentBadges.push(item.id);
                    await usersCollection.doc(user.uid).update({ equipped: { ...equipped, badges: currentBadges } });
                } else { 
                    var updateData = {};
                    updateData["equipped." + item.type] = item.id;
                    await usersCollection.doc(user.uid).update(updateData); 
                }
                
                if (typeof playSound === 'function') playSound('click');
                if (typeof setNotification === 'function') setNotification(lang === 'ar' ? 'تم التزيين!' : 'Equipped!');
            } catch (error) {
                console.error("Equip Error:", error);
            }
        },

        /**
         * Extracted from handleUnequip in 10-app.js
         */
        handleUnequip: async function(context, type, itemId) {
            var user = context.user;
            var isLoggedIn = context.isLoggedIn;
            var userData = context.userData;
            var lang = context.lang;
            var setNotification = context.setNotification;
            var playSound = context.playSound;

            if (!user || !isLoggedIn) return;
            
            try {
                var equipped = userData?.equipped || { badges: [] };
                if (type === 'badges') {
                    var currentBadges = equipped.badges || []; 
                    if (!Array.isArray(currentBadges)) currentBadges = currentBadges ? [currentBadges] : [];
                    currentBadges = currentBadges.filter(function(id) { return id !== itemId; });
                    await usersCollection.doc(user.uid).update({ equipped: { ...equipped, badges: currentBadges } });
                } else {
                    var newEquipped = { ...equipped }; 
                    delete newEquipped[type];
                    await usersCollection.doc(user.uid).update({ equipped: newEquipped });
                }
                
                if (typeof playSound === 'function') playSound('click');
                if (typeof setNotification === 'function') setNotification(lang === 'ar' ? 'تمت الإزالة!' : 'Unequipped!');
            } catch (error) {
                console.error("Unequip Error:", error);
            }
        }
    };

    // Export to global scope
    window.ChatManager = ChatManager;
})();
