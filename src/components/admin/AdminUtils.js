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

})();
