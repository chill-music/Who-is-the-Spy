var logStaffAction = async (staffUID, staffName, action, targetUID = null, targetName = null, details = '') => {
    try {
        await db.collection('staff_logs').add({
            staffUID,
            staffName,
            action,
            targetUID,
            targetName,
            details,
            timestamp: TS()
        });
    } catch(e) { console.error('[StaffLog] Error:', e); }
};

window.logStaffAction = logStaffAction;
