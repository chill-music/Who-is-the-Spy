(function() {
    var { useState, useEffect } = React;

    // ── SHARED COMPONENTS ──

    var BlockedUserItem = ({ uid, onUnblock, lang }) => {
        var [userData, setUserData] = useState(null);

        useEffect(() => {
            usersCollection.doc(uid).get().then(doc => {
                if (doc.exists) {
                    setUserData({ id: doc.id, ...doc.data() });
                }
            });
        }, [uid]);

        return (
            <div className="blocked-user-item">
                <AvatarWithFrame photoURL={userData?.photoURL} equipped={userData?.equipped} size="sm" />
                <span className="blocked-user-name">{userData?.displayName || uid.substring(0, 8)}</span>
                <button onClick={onUnblock} className="btn-ghost px-2 py-1 rounded text-xs">
                    {lang === 'ar' ? 'إلغاء' : 'Unblock'}
                </button>
            </div>
        );
    };

    // Exports
    window.BlockedUserItem = BlockedUserItem;

    // Note: OnboardingModal, DailyTasksComponent, and GroupsSection 
    // have been moved to features/ directory for better performance and maintainability.
})();
