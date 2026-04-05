(function () {
  var { useState, useEffect, useMemo, useRef } = React;

  var MomentsModerationSection = ({ currentUser, currentUserData, lang, onNotification, onOpenProfile }) => {
    var [moments, setMoments] = useState([]);
    var [loading, setLoading] = useState(true);
    var [banningUID, setBanningUID] = useState(null); // moment.id of the one being banned

    useEffect(() => {
      var unsub = momentsCollection.orderBy('timestamp', 'desc').limit(50).onSnapshot((snap) => {
        setMoments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }, () => setLoading(false));
      return unsub;
    }, []);

    var toggleHideMoment = async (id, userId, userName, currentHidden) => {
      try {
        await momentsCollection.doc(id).update({ hidden: !currentHidden });
        if (window.logStaffAction) await window.logStaffAction(currentUser.uid, currentUserData?.displayName, 'HIDE_MOMENT', userId, userName, `Moment ${id} — ${!currentHidden ? 'hidden' : 'restored'}`);
        onNotification(`✅ ${!currentHidden ? (lang === 'ar' ? 'تم إخفاء المنشور' : 'Moment Hidden') : (lang === 'ar' ? 'تم إظهار المنشور' : 'Moment Restored')}`);
      } catch (e) { onNotification('❌ Error'); }
    };

    var deleteMoment = async (id, userId, userName) => {
      if (!confirm(lang === 'ar' ? 'حذف هذا المنشور نهائياً؟' : 'Delete this moment permanently?')) return;
      try {
        await momentsCollection.doc(id).delete();
        if (window.logStaffAction) await window.logStaffAction(currentUser.uid, currentUserData?.displayName, 'DELETE_MOMENT', userId, userName, `Deleted moment ${id}`);
        onNotification('✅ Success');
      } catch (e) { onNotification('❌ Error'); }
    };

    return (/*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 700, color: '#8b5cf6' } }, "\uD83D\uDCF8 ", lang === 'ar' ? 'مراجعة اللحظات' : 'Moments Moderation'), /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '11px', color: '#6b7280' } }, `${moments.length} ${lang === 'ar' ? 'منشور' : 'posts'} • ${moments.filter(m => m.hidden).length} ${lang === 'ar' ? 'مخفي' : 'hidden'}`)      
      ),
      loading ? /*#__PURE__*/React.createElement("div", { style: { textAlign: 'center', padding: '20px' } }, "\u23F3") : /*#__PURE__*/
      React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' } },
      moments.map((m) => /*#__PURE__*/
      React.createElement("div", { key: m.id, style: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px', opacity: m.hidden ? 0.5 : 1 } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } }, /*#__PURE__*/
      React.createElement("img", { src: m.userPhoto || 'https://via.placeholder.com/30', style: { width: '24px', height: '24px', borderRadius: '50%' } }), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 } }, m.userName),
      m.hidden && /*#__PURE__*/React.createElement("span", { style: { fontSize: '9px', color: '#ef4444' } }, "[HIDDEN]")
      ),

      m.imageUrl ? /*#__PURE__*/
      React.createElement("img", { src: m.imageUrl, style: { width: '100%', aspectRatio: '1', borderRadius: '8px', objectFit: 'cover', marginBottom: '8px', cursor: 'pointer' }, onClick: () => window.open(m.imageUrl) }) : /*#__PURE__*/

      React.createElement("div", { style: { background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', fontSize: '10px', color: '#9ca3af', minHeight: '60px', marginBottom: '8px' } }, m.text),


      banningUID === m.id ? /*#__PURE__*/
      React.createElement(window.BanPanelInline, {
        reportedUID: m.userId,
        reportedName: m.userName,
        reportId: null,
        currentUser: currentUser,
        currentUserData: currentUserData,
        lang: lang,
        onDone: (msg) => {setBanningUID(null);onNotification(msg);},
        onCancel: () => setBanningUID(null) }
      ) : /*#__PURE__*/

      React.createElement("div", { style: { display: 'flex', gap: '5px' } }, /*#__PURE__*/
      React.createElement("button", { onClick: () => toggleHideMoment(m.id, m.userId, m.userName, m.hidden),
        style: { flex: 1, padding: '5px', borderRadius: '6px', border: 'none', fontSize: '10px', cursor: 'pointer', background: 'rgba(245,158,11,0.2)', color: '#f59e0b' } },
      m.hidden ? '👁️' : '🚫'
      ), /*#__PURE__*/
      React.createElement("button", { onClick: () => deleteMoment(m.id, m.userId, m.userName),
        style: { flex: 1, padding: '5px', borderRadius: '6px', border: 'none', fontSize: '10px', cursor: 'pointer', background: 'rgba(239,68,68,0.2)', color: '#ef4444' } }, "\uD83D\uDDD1\uFE0F"

      ), /*#__PURE__*/
      React.createElement("button", { onClick: () => setBanningUID(m.id),
        style: { flex: 1, padding: '5px', borderRadius: '6px', border: 'none', fontSize: '10px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', color: '#fff' } }, "\uD83D\uDD28"

      )
      )

      )
      )
      )

      ));

  };

  window.MomentsModerationSection = MomentsModerationSection;
})();