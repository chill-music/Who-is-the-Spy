(function() {
    /**
     * RoomView — The in-game room interface.
     */
    window.RoomView = function(props) {
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
        var isSpectator = !room.players.find(p => p.uid === currentUID);
        var me = room.players.find(p => p.uid === currentUID);

        return (
            <div className="room-view-container animate-fade-in relative z-10 p-4">
                {/* 🏠 Room Header */}
                <div className="flex items-center justify-between mb-4 glass-panel p-3 rounded-xl border-primary/20">
                    <div className="flex items-center gap-3">
                        <button onClick={handleLeaveRoom} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title={t.leave}>🚪</button>
                        <div>
                            <div className="text-[10px] text-primary font-bold tracking-widest uppercase mb-0.5">{room.status === 'waiting' ? t.waiting : t.inGame}</div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-black tracking-tight">#{roomId}</h2>
                                <button onClick={() => handleCopy(roomId)} className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold hover:bg-primary/30 transition-colors uppercase">
                                    {copied ? t.copied : t.copy}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">{t.players}</div>
                            <div className="text-sm font-black text-primary">{room.players.length}/{room.maxPlayers}</div>
                        </div>
                        {room.password && (
                            <div className="relative group cursor-help" onClick={() => setShowLobbyPassword(!showLobbyPassword)}>
                                <span className="text-lg">🔐</span>
                                {showLobbyPassword && (
                                    <div className="absolute top-full right-0 mt-2 glass-panel p-2 rounded-lg border-primary/30 z-50 animate-pop">
                                        <div className="text-[10px] text-gray-400 mb-1 uppercase font-bold">{t.password}</div>
                                        <div className="text-xs font-mono font-bold text-primary">{room.password}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 🎮 Game Logic Container */}
                <main className="game-main-content">
                    {/* Phase: Waiting */}
                    {room.status === 'waiting' && (
                        <div className="waiting-lobby space-y-4">
                            <div className="grid grid-cols-4 gap-3">
                                {room.players.map((p, i) => (
                                    <div key={p.uid || i} className="player-slot relative group" onClick={() => openProfile(p.uid)}>
                                        <div className="aspect-square rounded-xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center p-1.5 transition-all group-hover:border-primary/50 group-hover:bg-primary/5">
                                            <window.AvatarComponent userData={p} size={64} />
                                        </div>
                                        <div className="text-[10px] font-bold mt-1 text-center truncate text-gray-400 group-hover:text-primary transition-colors">{p.displayName || p.name}</div>
                                        {p.uid === OWNER_UID && <span className="absolute -top-1 -right-1 text-sm drop-shadow-lg">👑</span>}
                                    </div>
                                ))}
                                {Array.from({ length: Math.max(0, room.maxPlayers - room.players.length) }).map((_, i) => (
                                    <div key={'empty-' + i} className="aspect-square rounded-xl border-2 border-dashed border-white/5 flex items-center justify-center text-white/5 text-xl font-black">
                                        {i + room.players.length + 1}
                                    </div>
                                ))}
                            </div>
                            
                            {currentUID === OWNER_UID && (
                                <div className="flex gap-2">
                                    <button onClick={startGame} disabled={room.players.length < 3} className="btn-neon flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale">
                                        {(room.players.length < 3) ? (lang==='ar'?'تحتاج 3 لاعبين':'Need 3 Players') : t.start}
                                    </button>
                                    <button onClick={addBotToRoom} className="btn-ghost px-4 py-3 rounded-xl font-bold text-sm" title={lang==='ar'?'إضافة بوت':'Add Bot'}>🤖</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Phase: Discussion / Word Selection / Voting */}
                    {room.status !== 'waiting' && (
                        <div className="in-game-ui space-y-4">
                             {/* Timer & Status */}
                             <div className="game-status-bar glass-panel p-4 rounded-2xl border-primary/20 flex items-center justify-between text-center overflow-hidden relative">
                                <div className="absolute inset-0 bg-primary/5 -z-10"></div>
                                <div className="flex-1">
                                    <div className="text-[10px] text-primary font-black tracking-widest uppercase mb-1">{room.status === 'wordSelection' ? t.wordSel : room.status === 'voting' ? t.voting : t.discussion}</div>
                                    <div className="text-3xl font-black text-primary font-mono tabular-nums leading-none">
                                        {room.status === 'wordSelection' ? wordSelTimer : room.status === 'voting' ? votingTimer : turnTimer}
                                    </div>
                                </div>
                             </div>

                             {/* Word Tip */}
                             {myRole && (
                                <div className="word-card-container">
                                    <div className={`word-card-v2 ${myRole.role}`}>
                                        <div className="wc-role text-[10px] font-black uppercase tracking-widest">{myRole.roleName}</div>
                                        <div className="wc-word text-xl font-black tracking-tight">{myRole.word}</div>
                                    </div>
                                </div>
                             )}
                        </div>
                    )}
                </main>

                {/* 💬 Integrated Game Chat */}
                <div className="game-chat-dock mt-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                             <span className="text-xs font-bold text-primary">💬 {t.chat}</span>
                        </div>
                    </div>
                    <div className="glass-panel rounded-xl border-white/10 p-2">
                        <div className="flex gap-2">
                            <input
                                className="input-dark flex-1 px-4 py-2 border-none rounded-lg text-sm bg-black/40 focus:bg-black/60 transition-all"
                                value={gameChatInput}
                                onChange={e => setGameChatInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && sendGameMessage()}
                                placeholder={lang==='ar'?'اكتب هنا...':'Type here...'}
                            />
                            <button onClick={sendGameMessage} className="btn-neon px-5 py-2 rounded-lg font-bold text-sm">
                                {lang === 'ar' ? 'إرسال' : 'Send'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
})();
