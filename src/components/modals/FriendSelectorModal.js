(function () {
  const { useState, useEffect } = React;

  /**
   * FriendSelectorModal — Modular friend selector for game invitations.
   */
  const FriendSelectorModal = ({ show, onClose, friendsData, onSelect, lang }) => {
    const [search, setSearch] = useState('');
    const t = TRANSLATIONS[lang] || {};

    if (!show) return null;

    const filtered = (friendsData || [])
      .filter(f => (f.displayName || f.name || '').toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (a.isOnline === b.isOnline) return (a.displayName || '').localeCompare(b.displayName || '');
        return a.isOnline ? -1 : 1;
      });

    return (
      React.createElement("div", { className: "modal-overlay", onClick: onClose },
        React.createElement("div", { className: "modal-content animate-pop", onClick: (e) => e.stopPropagation(), style: { maxWidth: '380px' } },
          React.createElement("div", { className: "modal-header" },
            React.createElement("h2", { className: "modal-title" }, lang === 'ar' ? 'دعوة صديق' : 'Invite Friend'),
            React.createElement(window.ModalCloseBtn, { onClose: onClose })
          ),
          React.createElement("div", { className: "modal-body" },
            React.createElement("div", { className: "search-box mb-4" },
              React.createElement("input", {
                type: "text",
                placeholder: lang === 'ar' ? 'بحث عن صديق...' : 'Search friends...',
                value: search,
                onChange: (e) => setSearch(e.target.value),
                className: "input-dark w-full p-2.5 rounded-xl text-sm border border-white/10 bg-white/5",
                autoFocus: true
              })
            ),
            React.createElement("div", { 
              className: "friends-list overflow-y-auto pr-1", 
              style: { maxHeight: '320px', display: 'flex', flexDirection: 'column', gap: '8px' } 
            },
              filtered.length === 0 ? 
                React.createElement("p", { className: "text-center text-gray-500 py-8 text-sm" }, lang === 'ar' ? 'لا يوجد أصدقاء' : 'No friends found') 
                : filtered.map(friend => (
                React.createElement("div", { 
                  key: friend.uid || friend.id, 
                  className: "friend-item flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5" 
                },
                  React.createElement(window.AvatarWithFrame, {
                    photoURL: friend.photoURL || friend.photo,
                    equipped: friend.equipped,
                    size: 'xs',
                    lang: lang
                  }),
                  React.createElement("div", { className: "flex-1 min-w-0" },
                    React.createElement("div", { className: "text-sm font-bold text-white truncate" }, friend.displayName || friend.name || 'User'),
                    React.createElement("div", { className: "text-[10px] text-green-500 flex items-center gap-1" }, 
                      React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-green-500" }),
                      friend.isOnline ? (lang === 'ar' ? 'متصل' : 'Online') : (lang === 'ar' ? 'نشط' : 'Active')
                    )
                  ),
                  React.createElement("button", {
                    onClick: () => { onSelect(friend); onClose(); },
                    className: "btn-neon px-3 py-1.5 rounded-lg text-[11px] font-black uppercase"
                  }, lang === 'ar' ? 'إرسال' : 'Invite')
                )
              )))
          )
        )
      )
    );
  };

  window.FriendSelectorModal = FriendSelectorModal;
})();
