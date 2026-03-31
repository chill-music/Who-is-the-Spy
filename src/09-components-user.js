(function () {
  var { useState, useEffect } = React;

  // ── SHARED COMPONENTS ──

  var BlockedUserItem = ({ uid, onUnblock, lang }) => {
    var [userData, setUserData] = useState(null);

    useEffect(() => {
      usersCollection.doc(uid).get().then((doc) => {
        if (doc.exists) {
          setUserData({ id: doc.id, ...doc.data() });
        }
      });
    }, [uid]);

    return (/*#__PURE__*/
      React.createElement("div", { className: "blocked-user-item" }, /*#__PURE__*/
      React.createElement(AvatarWithFrame, { photoURL: userData?.photoURL, equipped: userData?.equipped, size: "sm" }), /*#__PURE__*/
      React.createElement("span", { className: "blocked-user-name" }, userData?.displayName || uid.substring(0, 8)), /*#__PURE__*/
      React.createElement("button", { onClick: onUnblock, className: "btn-ghost px-2 py-1 rounded text-xs" },
      lang === 'ar' ? 'إلغاء' : 'Unblock'
      )
      ));

  };

  // Exports
  window.BlockedUserItem = BlockedUserItem;

  // Note: OnboardingModal, DailyTasksComponent, and GroupsSection 
  // have been moved to features/ directory for better performance and maintainability.
})();