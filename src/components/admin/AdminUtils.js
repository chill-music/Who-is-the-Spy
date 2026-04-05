(function() {

// ─── Log a staff action ──────────────────────────────────────────────────
var logStaffAction = async (staffUID, staffName, action, targetUID, targetName, details) => {
    targetUID  = targetUID  || null;
    targetName = targetName || null;
    details    = details    || '';
    try {
        await staffLogCollection.add({
            staffUID, staffName, action, targetUID, targetName, details,
            timestamp: TS()
        });
    } catch(e) { console.error('[StaffLog]', e); }
};

// ─── Fetch all staff (admin + owner) from Firestore + ADMIN_UIDS fallback ──
// Returns array of { id, uid, displayName, photoURL, role, ... }
var fetchStaffList = async (minRoles) => {
    if (!minRoles) minRoles = ['admin', 'owner'];
    try {
        var snap = await usersCollection.where('role', 'in', minRoles).get();
        var list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Fallback: include OWNER_UID even if role field is missing in Firestore
        var ownerUID = window.OWNER_UID || (window.ADMIN_UIDS && window.ADMIN_UIDS[0]);
        if (ownerUID && !list.find((s) => s.uid === ownerUID || s.id === ownerUID)) {
            try {
                var ownerDoc = await usersCollection.doc(ownerUID).get();
                if (ownerDoc.exists) {
                    var od = ownerDoc.data();
                    od.role = od.role || 'owner';
                    list.push({ id: ownerDoc.id, ...od });
                }
            } catch (_) {}
        }

        // Sort: owner → admin → moderator
        var order = { owner: 0, admin: 1, moderator: 2 };
        list.sort((a, b) => (order[a.role] ?? 9) - (order[b.role] ?? 9));
        return list;
    } catch (e) {
        console.warn('[fetchStaffList]', e);
        return [];
    }
};

// ─── Search a user by Firestore doc ID (=uid), OR by customId, OR by displayName ─
var searchUser = async (term) => {
    term = (term || '').trim();
    if (!term) return null;
    try {
        // 1. Try Firestore doc ID (doc ID == Firebase UID)
        var byDocId = await usersCollection.doc(term).get();
        if (byDocId.exists) return { id: byDocId.id, ...byDocId.data() };

        // 2. Try customId field (the player-facing numeric ID)
        var byCustomId = await usersCollection.where('customId', '==', term).limit(1).get();
        if (!byCustomId.empty) return { id: byCustomId.docs[0].id, ...byCustomId.docs[0].data() };

        // 3. Try uid field (stored inside the document)
        var byUid = await usersCollection.where('uid', '==', term).limit(1).get();
        if (!byUid.empty) return { id: byUid.docs[0].id, ...byUid.docs[0].data() };

        // 4. Try displayName
        var byName = await usersCollection.where('displayName', '==', term).limit(1).get();
        if (!byName.empty) return { id: byName.docs[0].id, ...byName.docs[0].data() };

    } catch (e) { console.warn('[searchUser]', e); }
    return null;
};

window.logStaffAction  = logStaffAction;
window.fetchStaffList  = fetchStaffList;
window.searchUser      = searchUser;

// ─── Send a bot message to a specific user ────────────────────────────────
/**
 * @param {string} botId       - The bot ID (e.g. 'pro_spy_bot', 'staff_command_bot')
 * @param {string} toUserId    - The recipient's Firestore UID
 * @param {string} message     - The message body text
 * @param {Object} [options]   - Optional overrides: { fromName, type, imageURL }
 * @returns {Promise<void>}
 */
var sendBotMessage = async (botId, toUserId, message, options) => {
    if (!botId || !toUserId || !message) return;
    options = options || {};
    try {
        await botChatsCollection.add({
            botId:     botId,
            toUserId:  toUserId,
            message:   message,
            fromName:  options.fromName  || botId,
            type:      options.type      || 'system',
            imageURL:  options.imageURL  || null,
            read:      false,
            timestamp: TS()
        });
    } catch (e) {
        console.error('[sendBotMessage] failed for botId=' + botId + ' toUserId=' + toUserId, e);
    }
};

/** Wrapper: PRO SPY bot — broadcast & feedback acknowledgements */
var sendProSpyBotMessage = function (toUserId, message, options) {
    return sendBotMessage('pro_spy_bot', toUserId, message, Object.assign({}, options, { fromName: 'PRO SPY' }));
};

/** Wrapper: Admin HQ bot — staff-only escalation alerts */
var sendStaffCommandBotMessage = function (toUserId, message, options) {
    return sendBotMessage('staff_command_bot', toUserId, message, Object.assign({}, options, { fromName: '🔒 Admin HQ' }));
};

window.sendBotMessage            = sendBotMessage;
window.sendProSpyBotMessage      = sendProSpyBotMessage;
window.sendStaffCommandBotMessage = sendStaffCommandBotMessage;

})();
