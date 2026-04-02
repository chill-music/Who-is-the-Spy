(function () {
  /**
   * RoomView — The in-game room interface.
   * Refactored for Cyber-Luxury adaptation and full gameplay visibility.
   */
  window.RoomView = function (props) {
    var {
      room, roomId, currentUID, OWNER_UID, lang, t,
      turnTimer, wordSelTimer, votingTimer,
      hasVoted, hasVotedWord, showLobbyPassword, setShowLobbyPassword,
      copied, handleCopy, gameChatInput, setGameChatInput,
      showGameChat, setShowGameChat,
      startGame, handleLeaveRoom, submitWordVote, handleSkipTurn,
      requestVoting, triggerVoting, submitVote, resetGame,
      submitSpyWordGuess, submitMrWhiteLocationGuess, spyVoluntaryDeclare,
      addBotToRoom, removeBotFromRoom, openProfile, sendGameMessage
    } = props;

    if (!room) return null;

    var myRole = window.GameService ? window.GameService.getMyRole(room, currentUID) : null;
    var isMyTurn = room.currentTurnUID === currentUID;
    var isSpectator = !room.players.find((p) => p.uid === currentUID);
    var isWaiting = room.status === 'waiting';

    // Helper to render individual player cards
    var renderPlayer = (p, index) => {
      var isEliminated = p.status === 'eliminated';
      var isSpeaking = room.currentTurnUID === p.uid;
      var hasVotedThisRound = (room.votes || {})[p.uid];
      var canVoteForThisPlayer = room.status === 'voting' && !hasVoted && p.uid !== currentUID && !isEliminated && !isSpectator;

      return React.createElement("div", { 
        key: p.uid || index, 
        className: `arena-pcard ${isSpeaking ? 'active' : ''} ${isEliminated ? 'eliminated' : ''}`,
        onClick: () => openProfile(p.uid)
      }, 
        // King Crown for Room Owner
        p.uid === OWNER_UID && React.createElement("span", { className: "absolute -top-2 -right-1 text-base drop-shadow-md z-10" }, "👑"),
        
        // Voted Badge
        (room.votes && room.votes[p.uid]) && React.createElement("div", { className: "voted-badge" }, "✓"),

        // Avatar Section
        React.createElement("div", { className: "relative pointer-events-none" },
          window.AvatarWithFrame ? 
            React.createElement(window.AvatarWithFrame, { photoURL: p.photoURL, equipped: p.equipped, size: 'md' }) :
            React.createElement("img", { src: p.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.displayName || 'U')}&background=random`, style: { width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' } })
        ),

        // Name Label
        React.createElement("div", { className: "p-name" }, p.displayName || p.name),

        // Vote Action Button (Displayed only during voting phase for valid targets)
        canVoteForThisPlayer && React.createElement("div", { className: "arena-vote-bar" }, 
          React.createElement("button", { 
            className: "arena-vote-btn",
            onClick: (e) => { e.stopPropagation(); submitVote(p.uid); }
          }, t.vote || (lang === 'ar' ? 'تصويت' : 'Vote'))
        )
      );
    };

    /* Potentially Redundant: Legacy RoomView logic (v1.0)
    return (
      React.createElement("div", { className: "room-view-container animate-fade-in relative z-10 p-4" },
        ... [truncated for brevity in comment] ...
      )
    );
    */

    return React.createElement("div", { className: "room-view-container animate-fade-in relative z-10 p-4" },
      
      /* --- Arena Header --- */
      React.createElement("div", { className: "flex items-center justify-between mb-4 glass-panel p-3 rounded-xl border-primary/20" },
        React.createElement("div", { className: "flex items-center gap-3" },
          React.createElement("button", { onClick: handleLeaveRoom, className: "p-2 hover:bg-white/10 rounded-lg transition-colors", title: t.leave }, "🚪"),
          React.createElement("div", null,
            React.createElement("div", { className: "text-[10px] text-primary font-bold tracking-widest uppercase mb-0.5" }, isWaiting ? t.waiting : t.inGame),
            React.createElement("div", { className: "flex items-center gap-2" },
              React.createElement("h2", { className: "text-sm font-black tracking-tight" }, "#", roomId),
              React.createElement("button", { onClick: () => handleCopy(roomId), className: "text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold hover:bg-primary/30 transition-colors uppercase" },
                copied ? t.copied : t.copy
              )
            )
          )
        ),
        React.createElement("div", { className: "flex items-center gap-4" },
          React.createElement("div", { className: "text-center" },
            React.createElement("div", { className: "text-[10px] text-gray-500 font-bold uppercase mb-0.5" }, t.players),
            React.createElement("div", { className: "text-sm font-black text-primary" }, room.players.length, "/", room.maxPlayers)
          ),
          room.password && React.createElement("div", { className: "relative group cursor-help", onClick: () => setShowLobbyPassword(!showLobbyPassword) },
            React.createElement("span", { className: "text-xl" }, "🔐"),
            showLobbyPassword && React.createElement("div", { className: "absolute top-full right-0 mt-2 glass-panel p-2 rounded-lg border-primary/30 z-50 animate-pop" },
              React.createElement("div", { className: "text-[10px] text-gray-400 mb-1 uppercase font-bold" }, t.password),
              React.createElement("div", { className: "text-xs font-mono font-bold text-primary" }, room.password)
            )
          )
        )
      ),

      /* --- Arena Main Content --- */
      React.createElement("main", { className: "game-main-content" },

        // Status Bar
        !isWaiting && React.createElement("div", { className: "game-status-bar p-4 mb-4 rounded-2xl flex items-center justify-between text-center" },
          React.createElement("div", { className: "flex-1" },
            React.createElement("div", { className: "text-[10px] text-primary font-black tracking-widest uppercase mb-1" }, 
              room.status === 'wordSelection' ? t.wordSel : room.status === 'voting' ? t.voting : t.discussion
            ),
            React.createElement("div", { className: "text-3xl font-black text-primary font-mono tabular-nums leading-none" },
              room.status === 'wordSelection' ? wordSelTimer : room.status === 'voting' ? votingTimer : turnTimer
            )
          )
        ),

        // Word Card
        (!isWaiting && myRole) && React.createElement("div", { className: "word-card-container" },
          React.createElement("div", { className: `word-card-v2 ${myRole.role}` },
            React.createElement("div", { className: "wc-role" }, myRole.roleName),
            React.createElement("div", { className: "wc-word font-bold text-white text-xl" }, myRole.word)
          )
        ),

        // Player Grid
        React.createElement("div", { className: "arena-grid mb-6" },
          room.players.map((p, i) => renderPlayer(p, i)),
          isWaiting && Array.from({ length: Math.max(0, room.maxPlayers - room.players.length) }).map((_, i) =>
            React.createElement("div", { key: 'empty-' + i, className: "arena-pcard border-dashed opacity-25" },
              React.createElement("div", { className: "w-[60px] h-[60px] rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-xs font-black text-white/20" }, 
                i + room.players.length + 1
              )
            )
          )
        ),

        // Lobby Actions
        isWaiting && currentUID === OWNER_UID && React.createElement("div", { className: "flex gap-2" },
          React.createElement("button", { 
            onClick: startGame, 
            disabled: room.players.length < 3, 
            className: "btn-neon flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale" 
          },
            room.players.length < 3 ? (lang === 'ar' ? 'تحتاج 3 لاعبين' : 'Need 3 Players') : t.start
          ),
          React.createElement("button", { 
            onClick: addBotToRoom, 
            className: "btn-ghost px-5 py-4 rounded-xl font-bold text-lg", 
            title: lang === 'ar' ? 'إضافة بوت' : 'Add Bot' 
          }, "🤖")
        )
      ),

      /* --- Arena Footer --- */
      React.createElement("div", { className: "game-chat-dock mt-6" },
        React.createElement("div", { className: "flex items-center gap-2 mb-2" },
          React.createElement("span", { className: "text-[10px] font-black text-primary uppercase tracking-widest" }, "💬 " + t.chat)
        ),
        React.createElement("div", { className: "glass-panel rounded-xl border-white/10 p-2" },
          React.createElement("div", { className: "flex gap-2" },
            React.createElement("input", {
              className: "input-dark flex-1 px-4 py-2 border-none rounded-lg text-sm bg-black/40 focus:bg-black/60 transition-all",
              value: gameChatInput,
              onChange: (e) => setGameChatInput(e.target.value),
              onKeyPress: (e) => e.key === 'Enter' && sendGameMessage(),
              placeholder: lang === 'ar' ? 'اكتب رسالة...' : 'Type message...'
            }),
            React.createElement("button", { onClick: sendGameMessage, className: "btn-neon px-5 py-2 rounded-lg font-bold text-sm" },
              lang === 'ar' ? 'إرسال' : 'Send'
            )
          )
        )
      )
    );
  };
})();