(function() {

    // Send a proposal: creates a couple doc with status='pending', deducts cost, sends notification
    var sendProposal = async ({ fromUID, toUID, fromData, ringId, giftId, message, onNotification, lang }) => {
        var ring = window.RINGS_DATA.find(r => r.id === ringId);
        var gift = window.PROPOSAL_GIFTS.find(g => g.id === giftId);
        if (!ring) return { ok: false, err: 'No ring selected' };

        var totalCost = ring.cost + (gift?.cost || 0);
        var currency  = fromData?.currency || 0;
        if (currency < totalCost) {
            onNotification && onNotification(lang==='ar' ? `❌ تحتاج ${totalCost} 🧠` : `❌ Need ${totalCost} 🧠`);
            return { ok: false, err: 'Not enough currency' };
        }

        try {
            // Check for existing active couple or pending request
            var existingCouple = await couplesCollection
                .where('uid1', 'in', [fromUID, toUID])
                .where('status', 'in', ['pending','accepted'])
                .get();
            var existingCouple2 = await couplesCollection
                .where('uid2', 'in', [fromUID, toUID])
                .where('status', 'in', ['pending','accepted'])
                .get();
            if (!existingCouple.empty || !existingCouple2.empty) {
                onNotification && onNotification(lang==='ar' ? '❌ يوجد طلب أو ارتباط نشط بالفعل' : '❌ An active proposal or couple already exists');
                return { ok: false, err: 'Already exists' };
            }

            var batch = db.batch();
            // Deduct currency
            batch.update(usersCollection.doc(fromUID), {
                currency: firebase.firestore.FieldValue.increment(-totalCost),
            });
            // Create couple doc
            var coupleRef = couplesCollection.doc();
            batch.set(coupleRef, {
                uid1: fromUID,
                uid2: toUID,
                status: 'pending',
                ringId,
                giftId: giftId || null,
                proposalMessage: message || '',
                marriageDate: null,
                intimacyPoints: 0,
                couplePhotoUrl: null,
                sharedBio: '',
                createdAt: TS(),
                proposedBy: fromUID,
            });
            await batch.commit();

            // Notification
            await notificationsCollection.add({
                toUserId: toUID,
                fromUserId: fromUID,
                fromName: fromData?.displayName || 'Someone',
                fromPhoto: fromData?.photoURL || null,
                type: 'couple_proposal',
                message: lang==='ar'
                    ? `💍 ${fromData?.displayName} أرسل لك طلب ارتباط!`
                    : `💍 ${fromData?.displayName} sent you a proposal!`,
                ringId,
                giftId: giftId || null,
                proposalMessage: message || '',
                coupleDocId: coupleRef.id,
                timestamp: TS(),
                read: false,
            });

            // Love Bot notification
            if (typeof window.sendLoveBotMessage === 'function') {
                await window.sendLoveBotMessage(toUID, {
                    type: 'proposal',
                    fromName: fromData?.displayName || 'Someone',
                    fromPhoto: fromData?.photoURL || null,
                    fromUID,
                    coupleDocId: coupleRef.id,
                    lang,
                });
            }

            onNotification && onNotification(lang==='ar' ? '💍 تم إرسال الطلب!' : '💍 Proposal sent!');
            return { ok: true, coupleDocId: coupleRef.id };
        } catch(e) {
            console.error('sendProposal error', e);
            onNotification && onNotification(lang==='ar' ? '❌ خطأ' : '❌ Error');
            return { ok: false, err: e.message };
        }
    };

    var acceptProposal = async ({ coupleDocId, uid1, uid2, onNotification, lang }) => {
        try {
            var batch = db.batch();
            batch.update(couplesCollection.doc(coupleDocId), {
                status: 'accepted',
                marriageDate: TS(),
            });
            batch.update(usersCollection.doc(uid1), { partnerId: uid2, isMarried: true });
            batch.update(usersCollection.doc(uid2), { partnerId: uid1, isMarried: true });
            await batch.commit();

            // Notification to proposer
            await notificationsCollection.add({
                toUserId: uid1,
                fromUserId: uid2,
                type: 'couple_accepted',
                message: lang==='ar' ? '💖 قبلوا طلب ارتباطك!' : '💖 Your proposal was accepted!',
                timestamp: TS(),
                read: false,
            });

            onNotification && onNotification(lang==='ar' ? '💖 قبلت الطلب!' : '💖 Proposal accepted!');
            return { ok: true };
        } catch(e) {
            return { ok: false };
        }
    };

    var declineProposal = async ({ coupleDocId, fromUID, toUID, ringCost, giftCost, onNotification, lang }) => {
        try {
            var batch = db.batch();
            batch.delete(couplesCollection.doc(coupleDocId));
            // Refund ring cost to proposer
            batch.update(usersCollection.doc(fromUID), {
                currency: firebase.firestore.FieldValue.increment(ringCost + (giftCost || 0)),
            });
            await batch.commit();
            onNotification && onNotification(lang==='ar' ? 'تم الرفض وإعادة الإنتل' : 'Proposal declined & Intel refunded');
            return { ok: true };
        } catch(e) {
            return { ok: false };
        }
    };

    var divorceCouple = async ({ coupleDocId, uid1, uid2, onNotification, lang }) => {
        try {
            var batch = db.batch();
            batch.delete(couplesCollection.doc(coupleDocId));
            batch.update(usersCollection.doc(uid1), { partnerId: null, isMarried: false });
            batch.update(usersCollection.doc(uid2), { partnerId: null, isMarried: false });
            await batch.commit();
            onNotification && onNotification(lang==='ar' ? '💔 تم إنهاء الارتباط' : '💔 Relationship ended');
            return { ok: true };
        } catch(e) {
            return { ok: false };
        }
    };

    // Global exports
    window.sendProposal = sendProposal;
    window.acceptProposal = acceptProposal;
    window.declineProposal = declineProposal;
    window.divorceCouple = divorceCouple;

})();
