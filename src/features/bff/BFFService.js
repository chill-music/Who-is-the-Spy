(function() {
    // ─────────────────────────────────────────────
    // 🎨 RARITY COLORS
    // ─────────────────────────────────────────────
    var BFF_RARITY_COLORS = {
        Common: '#9ca3af', Uncommon: '#4ade80', Rare: '#60a5fa',
        Epic: '#a78bfa', Legendary: '#ffd700', Mythic: '#f0abfc',
    };

    var BFF_RARITY_TO_LEVEL = {
        Common: 1, Uncommon: 2, Rare: 3, Epic: 4, Legendary: 5, Mythic: 6,
    };

    // ─────────────────────────────────────────────
    // ⭐ BFF LEVEL SYSTEM — gift-point based
    // ─────────────────────────────────────────────
    var BFF_LEVELS = [
        { level: 1, minPts: 0,     name_en: 'Friends',        name_ar: 'أصدقاء',          color: '#60a5fa', glow: 'rgba(96,165,250,0.5)',   icon: '🤝', stars: 1 },
        { level: 2, minPts: 500,   name_en: 'Close Friends',  name_ar: 'أصدقاء مقربون',   color: '#4ade80', glow: 'rgba(74,222,128,0.5)',   icon: '💚', stars: 2 },
        { level: 3, minPts: 2000,  name_en: 'Best Friends',   name_ar: 'أعز الأصدقاء',    color: '#f59e0b', glow: 'rgba(245,158,11,0.5)',   icon: '⭐', stars: 3 },
        { level: 4, minPts: 6000,  name_en: 'Soulmates',      name_ar: 'أرواح توأم',       color: '#a78bfa', glow: 'rgba(167,139,250,0.5)', icon: '💜', stars: 4 },
        { level: 5, minPts: 15000, name_en: 'Legendary Bond', name_ar: 'رابطة أسطورية',   color: '#ffd700', glow: 'rgba(255,215,0,0.6)',    icon: '👑', stars: 5 },
        { level: 6, minPts: 40000, name_en: 'Eternal Bond',   name_ar: 'رابطة أبدية',     color: '#f0abfc', glow: 'rgba(240,171,252,0.7)', icon: '💎', stars: 6 },
    ];

    var getBFFLevel = (giftPoints = 0) => {
        var lv = BFF_LEVELS[0];
        for (var l of BFF_LEVELS) { if (giftPoints >= l.minPts) lv = l; else break; }
        var nextIdx = BFF_LEVELS.findIndex(l => l.level === lv.level) + 1;
        var next = BFF_LEVELS[nextIdx] || null;
        var pct = next
            ? Math.min(100, Math.round(((giftPoints - lv.minPts) / (next.minPts - lv.minPts)) * 100))
            : 100;
        return { ...lv, pct, nextMinPts: next?.minPts || null, giftPoints };
    };

    // ─────────────────────────────────────────────
    // 🎁 Update BFF gift points when gift is sent
    // ─────────────────────────────────────────────
    var updateBFFGiftPoints = async (senderUID, receiverUID, charismaPoints) => {
        try {
            var [snap1, snap2] = await Promise.all([
                bffCollection.where('uid1', '==', senderUID).where('uid2', '==', receiverUID).where('status', '==', 'active').limit(1).get(),
                bffCollection.where('uid1', '==', receiverUID).where('uid2', '==', senderUID).where('status', '==', 'active').limit(1).get(),
            ]);
            var doc = snap1.docs[0] || snap2.docs[0];
            if (!doc) return;
            var current = doc.data();
            var newPts = (current.giftPoints || 0) + (charismaPoints || 1);
            var newLevel = getBFFLevel(newPts).level;
            await bffCollection.doc(doc.id).update({
                giftPoints: newPts,
                level: newLevel,
            });
        } catch (e) {
            console.warn('BFF gift points update failed', e);
        }
    };

    // ─────────────────────────────────────────────
    // 🔧 FIRESTORE HELPERS
    // ─────────────────────────────────────────────
    var sendBFFRequest = async ({ fromUID, toUID, fromData, tokenId, onNotification, lang }) => {
        var token = BFF_TOKEN_ITEMS.find(t => t.id === tokenId);
        if (!token) return { ok: false, err: 'No token selected' };

        // Check token in inventory
        var myBffTokens = fromData?.inventory?.bff_tokens || [];
        if (!myBffTokens.includes(tokenId)) {
            onNotification && onNotification(lang === 'ar' ? '❌ ليس لديك هذا التوكن' : '❌ You do not have this token');
            return { ok: false };
        }

        try {
            // ── Simple single-field queries only (no composite index needed) ──
            var [myAsUid1, myAsUid2] = await Promise.all([
                bffCollection.where('uid1', '==', fromUID).get(),
                bffCollection.where('uid2', '==', fromUID).get(),
            ]);
            var allMyDocs = [
                ...myAsUid1.docs.map(d => ({ id: d.id, ...d.data() })),
                ...myAsUid2.docs.map(d => ({ id: d.id, ...d.data() })),
            ];

            // Check existing relationship with toUID
            var alreadyExists = allMyDocs.some(r =>
                (r.uid1 === toUID || r.uid2 === toUID) &&
                (r.status === 'pending' || r.status === 'active')
            );
            if (alreadyExists) {
                onNotification && onNotification(lang === 'ar' ? '❌ يوجد علاقة نشطة بالفعل' : '❌ Relationship already exists');
                return { ok: false };
            }

            // Check slot limit (count active only)
            var totalActive = allMyDocs.filter(r => r.status === 'active').length;
            var extraSlots = fromData?.bffExtraSlots || 0;
            var maxSlots = BFF_CONFIG.freeSlots + extraSlots;
            if (totalActive >= maxSlots) {
                onNotification && onNotification(lang === 'ar'
                    ? `❌ وصلت للحد الأقصى (${maxSlots} علاقات). اشترِ خانة جديدة بـ ${BFF_CONFIG.extraSlotCost} 🧠`
                    : `❌ Max relationships (${maxSlots}). Buy extra slot for ${BFF_CONFIG.extraSlotCost} 🧠`);
                return { ok: false };
            }

            // ── Write: update inventory + create BFF doc separately (no batch to avoid permission complexity) ──
            // Remove token from inventory
            var newTokens = [...myBffTokens];
            var idx = newTokens.indexOf(tokenId);
            if (idx > -1) newTokens.splice(idx, 1);
            await usersCollection.doc(fromUID).update({ 'inventory.bff_tokens': newTokens });

            // Create BFF doc
            var bffRef = await bffCollection.add({
                uid1: fromUID,
                uid2: toUID,
                status: 'pending',
                tokenId,
                cardType: token.cardType,
                requestedBy: fromUID,
                createdAt: TS(),
                acceptedAt: null,
            });

            // Notification to target
            await notificationsCollection.add({
                toUserId: toUID,
                fromUserId: fromUID,
                fromName: fromData?.displayName || 'Someone',
                fromPhoto: fromData?.photoURL || null,
                type: 'bff_request',
                message: lang === 'ar'
                    ? `🤝 ${fromData?.displayName} أرسل لك طلب صداقة ${token.name_ar}!`
                    : `🤝 ${fromData?.displayName} sent you a ${token.name_en} friendship request!`,
                tokenId,
                bffDocId: bffRef.id,
                timestamp: TS(),
                read: false,
            });

            // Love bot notification
            await sendLoveBotMessage(toUID, {
                type: 'bff_request',
                fromName: fromData?.displayName || 'Someone',
                fromPhoto: fromData?.photoURL || null,
                fromUID,
                tokenName_ar: token.name_ar,
                tokenName_en: token.name_en,
                bffDocId: bffRef.id,
                lang,
            });

            onNotification && onNotification(lang === 'ar' ? '🤝 تم إرسال طلب الصداقة!' : '🤝 Friendship request sent!');
            return { ok: true, bffDocId: bffRef.id };
        } catch (e) {
            console.error('sendBFFRequest error', e);
            onNotification && onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error');
            return { ok: false };
        }
    };

    var acceptBFFRequest = async ({ bffDocId, uid1, uid2, onNotification, lang }) => {
        try {
            await bffCollection.doc(bffDocId).update({
                status: 'active',
                acceptedAt: TS(),
            });
            onNotification && onNotification(lang === 'ar' ? '🤝 تم قبول طلب الصداقة!' : '🤝 Friendship accepted!');
            return { ok: true };
        } catch (e) {
            return { ok: false };
        }
    };

    var declineBFFRequest = async ({ bffDocId, fromUID, tokenId, onNotification, lang }) => {
        try {
            // Refund token
            var token = BFF_TOKEN_ITEMS.find(t => t.id === tokenId);
            if (token && fromUID) {
                await usersCollection.doc(fromUID).update({
                    'inventory.bff_tokens': firebase.firestore.FieldValue.arrayUnion(tokenId),
                }).catch(() => {});
            }
            await bffCollection.doc(bffDocId).delete();
            onNotification && onNotification(lang === 'ar' ? 'تم الرفض وإعادة التوكن' : 'Declined & token refunded');
            return { ok: true };
        } catch (e) {
            return { ok: false };
        }
    };

    var endBFFRelationship = async ({ bffDocId, onNotification, lang }) => {
        try {
            await bffCollection.doc(bffDocId).delete();
            onNotification && onNotification(lang === 'ar' ? '💔 تم إنهاء العلاقة' : '💔 Relationship ended');
            return { ok: true };
        } catch (e) {
            return { ok: false };
        }
    };

    var buyBFFExtraSlot = async ({ uid, userData, onNotification, lang }) => {
        var cost = BFF_CONFIG.extraSlotCost;
        if ((userData?.currency || 0) < cost) {
            onNotification && onNotification(lang === 'ar' ? `❌ تحتاج ${cost} 🧠` : `❌ Need ${cost} 🧠`);
            return { ok: false };
        }
        try {
            await usersCollection.doc(uid).update({
                currency: firebase.firestore.FieldValue.increment(-cost),
                bffExtraSlots: firebase.firestore.FieldValue.increment(1),
            });
            onNotification && onNotification(lang === 'ar' ? '✅ تم فتح خانة جديدة!' : '✅ New slot unlocked!');
            return { ok: true };
        } catch (e) {
            return { ok: false };
        }
    };

    // ─────────────────────────────────────────────
    // 🤖 Love Bot message sender
    // ─────────────────────────────────────────────
    var sendLoveBotMessage = async (toUID, data) => {
        try {
            await botChatsCollection.add({
                botId: 'love_bot',
                toUserId: toUID,
                type: data.type,
                fromName: data.fromName || '',
                fromPhoto: data.fromPhoto || null,
                fromUID: data.fromUID || null,
                message: data.type === 'bff_request'
                    ? (data.lang === 'ar'
                        ? `🤝 ${data.fromName} أرسل لك طلب علاقة "${data.tokenName_ar}"! اضغط للرد.`
                        : `🤝 ${data.fromName} sent you a "${data.tokenName_en}" relationship request! Tap to respond.`)
                    : (data.type === 'proposal'
                        ? (data.lang === 'ar'
                            ? `💍 ${data.fromName} أرسل لك طلب ارتباط! اضغط للرد.`
                            : `💍 ${data.fromName} sent you a marriage proposal! Tap to respond.`)
                        : (data.message || '')),
                bffDocId: data.bffDocId || null,
                coupleDocId: data.coupleDocId || null,
                timestamp: TS(),
                read: false,
            });
        } catch (e) {}
    };

    // 🌍 Global Exports
    window.BFF_RARITY_COLORS = BFF_RARITY_COLORS;
    window.BFF_RARITY_TO_LEVEL = BFF_RARITY_TO_LEVEL;
    window.BFF_LEVELS = BFF_LEVELS;
    window.getBFFLevel = getBFFLevel;
    window.updateBFFGiftPoints = updateBFFGiftPoints;
    window.sendBFFRequest = sendBFFRequest;
    window.acceptBFFRequest = acceptBFFRequest;
    window.declineBFFRequest = declineBFFRequest;
    window.endBFFRelationship = endBFFRelationship;
    window.buyBFFExtraSlot = buyBFFExtraSlot;
    window.sendLoveBotMessage = sendLoveBotMessage;

})();
