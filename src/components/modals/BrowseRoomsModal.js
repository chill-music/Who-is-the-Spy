(function() {
    var { useState, useEffect } = React;
var BrowseRoomsModal = ({ show, onClose, onJoin, nickname, currentUID, currentUserData, lang }) => {
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
        var unsub = roomsCollection.where('status', '==', 'waiting').onSnapshot(snap => {
            var roomsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(room => room.players?.length < 10);
            setRooms(roomsData);
            setLoading(false);
        }, error => { setLoading(false); });
        return unsub;
    }, [show]);

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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="modal-header"><h2 className="modal-title">{t.browse}</h2><ModalCloseBtn onClose={onClose} /></div>
                <div className="modal-body">
                    {loading ? <div className="text-center py-8"><div className="text-2xl animate-pulse">⏳</div><p className="text-gray-400 mt-2">{t.loading}</p></div> : rooms.length === 0 ? <div className="text-center py-8 text-gray-400"><div className="text-4xl mb-2">🔍</div><p>{t.noRooms}</p></div> : (
                        <div className="browse-rooms-container">
                            {rooms.map(room => (
                                <div key={room.id} className="room-card">
                                    <div className="room-card-header"><span className="room-card-code">{room.id}</span><span className="room-card-mode">{room.mode === 'advanced' ? (lang === 'ar' ? 'متقدم' : 'Advanced') : (lang === 'ar' ? 'عادي' : 'Normal')}</span></div>
                                    <div className="room-card-info">
                                        <div className="room-card-players"><span>👥 {room.players?.length || 0}/10</span>{room.isPrivate && <span className="room-card-private ml-2">🔒</span>}</div>
                                        <button onClick={() => handleJoinClick(room)} className="room-card-join-btn">{t.join}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {showPasswordInput && selectedRoom && (
                    <div className="p-3 bg-white/5 border-t border-white/10">
                        <div className="text-xs text-gray-400 mb-2">🔒 {lang === 'ar' ? 'أدخل كلمة السر' : 'Enter password'} - Room: {selectedRoom.id}</div>
                        <div className="flex gap-2">
                            <input type="password" value={joinPassword} onChange={e => { setJoinPassword(e.target.value); setPasswordError(''); }} placeholder={t.password} className="input-dark flex-1 p-2 rounded text-sm" />
                            <button onClick={handlePasswordJoin} className="btn-neon px-4 py-2 rounded text-sm">{t.join}</button>
                            <button onClick={() => { setShowPasswordInput(false); setSelectedRoom(null); setPasswordError(''); }} className="btn-ghost px-3 py-2 rounded text-sm">✕</button>
                        </div>
                        {passwordError && <div className="text-xs text-red-400 mt-2 text-center flex items-center justify-center gap-1"><span>❌</span> {passwordError}</div>}
                    </div>
                )}
            </div>
        </div>
    );
};

window.BrowseRoomsModal = BrowseRoomsModal;
})();

