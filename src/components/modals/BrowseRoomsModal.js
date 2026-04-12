(function () {
  var { useState, useEffect } = React;
  var BrowseRoomsModal = ({ show, onClose, onJoin, nickname, currentUID, currentUserData, lang, gameId }) => {
    var t = TRANSLATIONS[lang];
    var [rooms, setRooms] = useState([]);
    var [loading, setLoading] = useState(true);
    var [joinPassword, setJoinPassword] = useState('');
    var [selectedRoom, setSelectedRoom] = useState(null);
    var [showPasswordInput, setShowPasswordInput] = useState(false);
    var [passwordError, setPasswordError] = useState('');

    useEffect(() => {
      if (!show) return;
      setLoading(true);
      setPasswordError('');
      
      var col = window.RoomService?.getCollection ? window.RoomService.getCollection(gameId || 'spy') : null;
      
      if (!col) {
        setLoading(false);
        return;
      }
      
      var unsub = col.where('status', '==', 'waiting').limit(50).onSnapshot((snap) => {
        var roomsData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRooms(roomsData);
        setLoading(false);
      }, (error) => { setLoading(false); });
      
      return unsub;
    }, [show, gameId]);

    if (!show) return null;

    var handleJoinClick = (room) => {
      if (room.isPrivate) {
        setSelectedRoom(room);
        setShowPasswordInput(true);
        setPasswordError('');
      } else {
        onJoin(room.id, '');
      }
    };

    var handlePasswordJoin = () => {
      if (selectedRoom && joinPassword) {
        if (joinPassword !== selectedRoom.password) {
          setPasswordError(lang === 'ar' ? 'كلمة السر غير صحيحة!' : 'Incorrect password!');
          return;
        }
        onJoin(selectedRoom.id, joinPassword);
        setShowPasswordInput(false);
        setSelectedRoom(null);
        setJoinPassword('');
        setPasswordError('');
      }
    };

    return (/*#__PURE__*/
      React.createElement("div", { className: "modal-overlay", onClick: onClose }, /*#__PURE__*/
      React.createElement("div", { className: "modal-content animate-pop", onClick: (e) => e.stopPropagation(), style: { maxWidth: '400px' } }, /*#__PURE__*/
      React.createElement("div", { className: "modal-header" }, /*#__PURE__*/React.createElement("h2", { className: "modal-title" }, t.browse), /*#__PURE__*/React.createElement(ModalCloseBtn, { onClose: onClose })), /*#__PURE__*/
      React.createElement("div", { className: "modal-body" },
      loading ? /*#__PURE__*/React.createElement("div", { className: "text-center py-8" }, /*#__PURE__*/React.createElement("div", { className: "text-2xl animate-pulse" }, "\u23F3"), /*#__PURE__*/React.createElement("p", { className: "text-gray-400 mt-2" }, t.loading)) : rooms.length === 0 ? /*#__PURE__*/React.createElement("div", { className: "text-center py-8 text-gray-400" }, /*#__PURE__*/React.createElement("div", { className: "text-4xl mb-2" }, "\uD83D\uDD0D"), /*#__PURE__*/React.createElement("p", null, t.noRooms)) : /*#__PURE__*/
      React.createElement("div", { className: "browse-rooms-container" },
      rooms.map((room) => /*#__PURE__*/
      React.createElement("div", { key: room.id, className: "room-card" }, /*#__PURE__*/
      React.createElement("div", { className: "room-card-header" }, /*#__PURE__*/React.createElement("span", { className: "room-card-code" }, room.id), /*#__PURE__*/React.createElement("span", { className: "room-card-mode" }, room.category === 'custom' ? (lang === 'ar' ? 'مخصص' : 'Custom') : (lang === 'ar' ? 'عادي' : 'Normal'))), /*#__PURE__*/
      React.createElement("div", { className: "room-card-info" }, /*#__PURE__*/
      React.createElement("div", { className: "room-card-players" }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDC65 ", "?", "/10"), room.isPrivate && /*#__PURE__*/React.createElement("span", { className: "room-card-private ml-2" }, "\uD83D\uDD12")), /*#__PURE__*/
      React.createElement("button", { onClick: () => handleJoinClick(room), className: "room-card-join-btn" }, t.join)
      )
      )
      )
      )

      ),
      showPasswordInput && selectedRoom && /*#__PURE__*/
      React.createElement("div", { className: "p-3 bg-white/5 border-t border-white/10" }, /*#__PURE__*/
      React.createElement("div", { className: "text-xs text-gray-400 mb-2" }, "\uD83D\uDD12 ", lang === 'ar' ? 'أدخل كلمة السر' : 'Enter password', " - Room: ", selectedRoom.id), /*#__PURE__*/
      React.createElement("div", { className: "flex gap-2" }, /*#__PURE__*/
      React.createElement("input", { type: "password", value: joinPassword, onChange: (e) => {setJoinPassword(e.target.value);setPasswordError('');}, placeholder: t.password, className: "input-dark flex-1 p-2 rounded text-sm" }), /*#__PURE__*/
      React.createElement("button", { onClick: handlePasswordJoin, className: "btn-neon px-4 py-2 rounded text-sm" }, t.join), /*#__PURE__*/
      React.createElement("button", { onClick: () => {setShowPasswordInput(false);setSelectedRoom(null);setPasswordError('');}, className: "btn-ghost px-3 py-2 rounded text-sm" }, "\u2715")
      ),
      passwordError && /*#__PURE__*/React.createElement("div", { className: "text-xs text-red-400 mt-2 text-center flex items-center justify-center gap-1" }, /*#__PURE__*/React.createElement("span", null, "\u274C"), " ", passwordError)
      )

      )
      ));

  };

  window.BrowseRoomsModal = BrowseRoomsModal;
})();