(function() {
  const { useState, useEffect, useCallback } = React;

  /**
   * SpyGameRebuild - Main Controller for the Spy Game Rebuild
   */
  const ADMIN_UID = window.OWNER_UID || 'PfZAViU4swQdbBZOfqJDnPZSs9l2';

  const SpyGameRebuild = ({ user, userData, initialMode = 'selection', initialRoomCode = null, onClose }) => {
    const [mode, setMode] = useState(initialRoomCode ? 'advanced' : initialMode); 
    const [gameStatus, setGameStatus] = useState('lobby'); 
    
    // Cache user data for profile enrichment in firebase services
    useEffect(() => {
      if (userData && window.SpyGameCore?.online?.cacheUserData) {
        window.SpyGameCore.online.cacheUserData(userData);
      } else if (userData) {
        window._currentUserDataCache = userData;
      }
    }, [userData]);

    // Normal Mode Local State
    const [localPlayers, setLocalPlayers] = useState([]);
    const [currentScenario, setCurrentScenario] = useState(null);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [showCard, setShowCard] = useState(false);
    const [votes, setVotes] = useState({}); // { targetUID: count }
    const [history, setHistory] = useState([]);

    // Advanced Mode (Online) State
    const [roomCode, setRoomCode] = useState(initialRoomCode);
    const [roomData, setRoomData] = useState(null);
    const [isJoining, setIsJoining] = useState(false);
    
    const isArabic = user && user.language === 'ar'; 
    
    const STRINGS = {
      playerOf: isArabic ? 'لاعب {0} من {1}' : 'PLAYER {0} OF {1}',
      accusation: isArabic ? 'الاتهام' : 'THE ACCUSATION',
      pickSuspect: isArabic ? 'اختر المشتبه به الرئيسي' : 'Pick your prime suspect',
      suspect: isArabic ? 'مشتبه به' : 'Suspect',
      caseClosed: isArabic ? 'أغلقت القضية' : 'CASE CLOSED',
      opResult: isArabic ? 'نتيجة العملية' : 'Operation Result',
      theSpy: isArabic ? 'الجاسوس' : 'THE SPY',
      newOp: isArabic ? 'عملية جديدة' : 'New Operation',
      initRoom: isArabic ? 'جاري تجهيز غرفة الإحاطة...' : 'Initializing Briefing Room...'
    };

    // Advanced Mode Firestore Listener
    const prevDataRef = React.useRef(null);
    useEffect(() => {
      if (mode === 'advanced' && roomCode) {
        const unsubscribe = window.roomsCollection.doc(roomCode).onSnapshot(doc => {
          if (doc.exists) {
            const data = doc.data();
            const prevData = prevDataRef.current;
            
            setRoomData(data);
            
            const prevStatus = prevData ? prevData.status : 'waiting';
            if (data.status === 'waiting') setGameStatus('lobby');
            if (data.status === 'reveal') {
              setGameStatus('reveal');
            }
            if (data.status === 'playing') {
              setGameStatus('playing');
              if (prevStatus === 'reveal') setShowCard(false);
            }
            if (data.status === 'ended') {
              setGameStatus('ended');
            }
            if (data.status === 'voting') setGameStatus('voting');

            // Audio for new messages
            if (prevData && data.messages && data.messages.length > (prevData.messages?.length || 0)) {
              window.playSound?.('notification');
            }
            
            prevDataRef.current = data;

            if (user && !data.players[data.hostUID]) {
               window.OnlineService.handleHostMigration(roomCode, data.hostUID, data.players, data.playerOrder);
            }

            if (user && user.uid === ADMIN_UID && data.status === 'playing') {
              window.OnlineService.simulateBotActions(roomCode, data.players, data.status);
            }
          }
        });
        return () => unsubscribe();
      }
    }, [mode, roomCode, user]);

    const handleSelectMode = async (selectedMode, options = {}) => {
      setMode(selectedMode);
      setGameStatus('lobby');

      if (selectedMode === 'advanced') {
        setIsJoining(true);
        try {
          if (!roomCode) {
            const newCode = await window.OnlineService.createRoom(user, options);
            setRoomCode(newCode);
          }
        } catch (err) {
          console.error("Failed to create room:", err);
          setMode('selection');
        } finally {
          setIsJoining(false);
        }
      }
    };

    const handleStartNormalGame = (playerNames) => {
      const players = playerNames.map(function(name) { 
        return { name: name, id: Math.random().toString(36).substr(2, 9) }; 
      });
      const scenario = window.RoleEngine.assignRoles(players, 'fruits');
      setLocalPlayers(scenario.players);
      setCurrentScenario(scenario);
      setCurrentPlayerIndex(0);
      setShowCard(false);
      setGameStatus('reveal');
      setMode('normal');
    };

    const handleConfirmSeen = () => {
      if (currentPlayerIndex < localPlayers.length - 1) {
        setShowCard(false);
        setCurrentPlayerIndex(function(prev) { return prev + 1; });
      } else {
        setGameStatus('playing');
        setCurrentPlayerIndex(0);
      }
    };

    const handleLeaveRoom = async () => {
      if (mode === 'advanced' && roomCode) {
        await window.OnlineService.leaveRoom(roomCode, user.uid, roomData ? roomData.players : {}, roomData ? roomData.playerOrder : []);
      }
      setRoomCode(null);
      setRoomData(null);
      setMode('selection');
    };

    const handleCastVote = (suspectUID) => {
      setGameStatus('ended');
      setVotes({ [suspectUID]: 1 });
    };

    const el = React.createElement;

    const isSmallBox = mode === 'selection' || gameStatus === 'lobby';

    return el("div", {
      dir: isArabic ? 'rtl' : 'ltr',
      className: "fixed inset-0 z-[10000] overflow-y-auto flex flex-col items-center justify-start sm:justify-center bg-zinc-950 transition-all duration-500 " + 
                (isSmallBox ? "p-4 py-10 bg-zinc-950/40 backdrop-blur-md" : "p-0")
    },

      /* Full-Screen Container - Adaptive Sizing (800px for setup, Full Page for gameplay) */
      el("div", { 
        className: "w-full mx-auto relative bg-zinc-950 transition-all duration-500 flex flex-col " + 
                  (isSmallBox ? "max-w-[800px] border border-white/5 rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.8)] max-h-[min(95vh,1200px)]" : "max-w-none h-screen rounded-0 border-0")
      },
        el("div", { className: "w-full overflow-y-auto custom-scrollbar " + (isSmallBox ? "p-0" : "p-6 md:p-12") },


        mode === 'selection' && el(window.SpyModeSelector, { 
          user: user,
          onSelectMode: handleSelectMode,
          onClose: onClose 
        }),

        mode === 'normal' && el("div", { className: "w-full" },
          gameStatus === 'lobby' && el(window.SpyPassPlayView, { 
            onStartGame: handleStartNormalGame,
            onClose: onClose 
          }),
          
          gameStatus === 'reveal' && el("div", { className: "flex flex-col items-center gap-8 w-full" },
            !showCard ? el(window.SpyTransitionScreen, {
              playerName: localPlayers[currentPlayerIndex] ? localPlayers[currentPlayerIndex].name : "",
              onReady: function() { setShowCard(true); }
            }) : el("div", { className: "flex flex-col items-center gap-4 w-full" },
              el("p", { className: "text-zinc-500 font-bold uppercase tracking-widest text-[10px]" },
                STRINGS.playerOf.replace('{0}', currentPlayerIndex + 1).replace('{1}', localPlayers.length)
              ),
              el(window.SpyRoleCard, {
                player: localPlayers[currentPlayerIndex],
                onConfirmSeen: handleConfirmSeen
              })
            )
          ),
          
          gameStatus === 'playing' && el(window.SpyGamePanel, {
            player: localPlayers[currentPlayerIndex],
            onVoteTriggered: function() { setGameStatus('voting'); }
          }),

          gameStatus === 'voting' && el("div", { className: "flex flex-col gap-8 w-full py-8 animate-in zoom-in duration-500" },
            el("div", { className: "text-center" },
              el("h2", { className: "text-4xl font-black text-white italic tracking-widest uppercase" }, STRINGS.accusation),
              el("p", { className: "text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2" }, STRINGS.pickSuspect)
            ),
            el("div", { className: "grid grid-cols-2 gap-4" },
              localPlayers.map(function(p) {
                return el("button", {
                  key: p.id,
                  onClick: function() { handleCastVote(p.id); },
                  className: "p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:bg-zinc-800 transition-all active:scale-95 text-left rtl:text-right"
                },
                  el("p", { className: "text-zinc-500 font-bold uppercase text-[9px] mb-1" }, STRINGS.suspect),
                  el("h3", { className: "text-xl font-black text-white truncate" }, p.name)
                );
              })
            )
          ),

          gameStatus === 'ended' && el("div", { className: "flex flex-col items-center gap-12 py-12 animate-in slide-in-from-bottom-8 duration-700" },
            el("div", { className: "text-center" },
              el("h2", { className: "text-6xl font-black text-white italic uppercase tracking-tighter" }, STRINGS.caseClosed),
              el("p", { className: "text-zinc-500 font-bold uppercase tracking-widest text-xs mt-2" }, STRINGS.opResult)
            ),
            
            el("div", { className: "w-full space-y-6" },
              localPlayers.map(function(p) {
                return el("div", {
                  key: p.id,
                  className: "p-6 rounded-3xl border flex items-center justify-between " + (p.isSpy ? 'bg-red-950/20 border-red-500/50' : 'bg-zinc-900 border-zinc-800')
                },
                  el("div", null,
                    el("h4", { className: "text-2xl font-black text-white" }, p.name),
                    el("p", { className: (p.isSpy ? 'text-red-500' : 'text-emerald-500') + " font-bold uppercase text-xs" },
                      p.isSpy ? STRINGS.theSpy : (isArabic ? p.roleAr : p.roleEn)
                    )
                  ),
                  p.isSpy && el("div", { className: "w-12 h-12 rounded-full bg-red-500 text-zinc-950 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]" },
                    el("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                      el("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" })
                    )
                  )
                );
              })
            ),

            el("button", {
              onClick: function() { handleSelectMode('selection'); },
              className: "w-full py-6 rounded-[32px] bg-emerald-600 text-zinc-950 font-black text-xl hover:bg-emerald-500 transition-all uppercase tracking-widest shadow-xl active:scale-95"
            }, STRINGS.newOp)
          )
        ),

        mode === 'advanced' && el("div", { className: "w-full" },
          isJoining ? el("div", { className: "flex flex-col items-center gap-6 animate-pulse py-20" },
            el("div", { className: "w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" }),
            el("p", { className: "text-zinc-500 font-bold uppercase tracking-widest text-[10px]" }, STRINGS.initRoom)
          ) : el(React.Fragment, null,
            gameStatus === 'lobby' && el(window.SpyLobbyView, {
              user: user,
              roomCode: roomCode,
              players: roomData ? roomData.players : {},
              messages: roomData ? roomData.messages : [],
              userFamily: window.currentUserFamily,
              isHost: roomData ? roomData.hostUID === user.uid : false,
              isAdmin: user && window.ADMIN_UIDS && window.ADMIN_UIDS.includes(user.uid),
              currentCategory: roomData ? roomData.category : 'fruits',
              isPasswordProtected: roomData ? roomData.isPasswordProtected : false,
              password: roomData ? roomData.password : null,
              onAddBot: function() { window.OnlineService.addBot(roomCode, user.uid); },
              onLeave: handleLeaveRoom,
              onClose: onClose,
              onStartGame: function() { 
                const cat = roomData ? roomData.category : 'fruits';
                window.OnlineService.startGame(roomCode, cat); 
              }
            }),

            gameStatus === 'reveal' && el("div", { className: "flex flex-col items-center gap-8 w-full" },
              !showCard ? el(window.SpyTransitionScreen, {
                playerName: user.displayName || "Agent",
                onReady: function() { setShowCard(true); }
              }) : el("div", { className: "flex flex-col items-center gap-4 w-full" },
                el(window.SpyRoleCard, {
                  player: roomData.players[user.uid],
                  onConfirmSeen: function() {
                    window.OnlineService.togglePlayerReady(roomCode, user.uid, true);
                    
                    // Host can still advance mode to playing if they want to force start
                    if (roomData.hostUID === user.uid) {
                      const allReady = Object.values(roomData.players).every(p => p.isReady || p.isBot);
                      if (allReady) {
                        window.roomsCollection.doc(roomCode).update({ status: 'playing' });
                      }
                    }
                  }
                })
              )
            ),

            gameStatus === 'playing' && el(window.SpyGamePanel, {
              player: roomData.players[user.uid],
              startTime: roomData.startTime,
              duration: roomData.duration || 480,
              isArabic: isArabic,
              onVoteTriggered: function() {
                if (roomData.hostUID === user.uid) {
                  window.roomsCollection.doc(roomCode).update({ status: 'voting' });
                }
              }
            }),

            gameStatus === 'voting' && el("div", { className: "flex flex-col gap-8 w-full py-8 px-8 animate-in zoom-in duration-500" },
              el("div", { className: "text-center" },
                el("h2", { className: "text-4xl font-black text-white italic tracking-widest uppercase" }, STRINGS.accusation),
                el("p", { className: "text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2" }, 
                  roomData.hostUID === user.uid ? STRINGS.pickSuspect : "WATING FOR SELECTION..."
                )
              ),
              el("div", { className: "grid grid-cols-2 lg:grid-cols-3 gap-4" },
                Object.values(roomData.players).map(function(p) {
                  const isHost = roomData.hostUID === user.uid;
                  return el("button", {
                    key: p.uid,
                    onClick: function() { if (isHost) window.OnlineService.endGame(roomCode, p.uid); },
                    disabled: !isHost,
                    className: "p-6 rounded-3xl bg-zinc-900 border border-zinc-800 transition-all active:scale-95 text-left rtl:text-right " + (isHost ? "hover:border-red-500/50 hover:bg-zinc-800 cursor-pointer" : "opacity-50 cursor-default")
                  },
                    el("p", { className: "text-zinc-500 font-bold uppercase text-[9px] mb-1" }, STRINGS.suspect),
                    el("h3", { className: "text-xl font-black text-white truncate" }, p.name)
                  );
                })
              )
            ),

            gameStatus === 'ended' && el("div", { className: "flex flex-col items-center gap-12 py-12 px-8 animate-in slide-in-from-bottom-8 duration-700" },
              el("div", { className: "text-center" },
                el("h2", { className: "text-6xl font-black text-white italic uppercase tracking-tighter" }, STRINGS.caseClosed),
                el("p", { className: "text-zinc-500 font-bold uppercase tracking-widest text-xs mt-2" }, STRINGS.opResult)
              ),
              
              el("div", { className: "w-full grid grid-cols-1 md:grid-cols-2 gap-6" },
                Object.values(roomData.players).map(function(p) {
                  return el("div", {
                    key: p.uid,
                    className: "p-6 rounded-3xl border flex items-center justify-between " + (p.isSpy ? 'bg-red-950/20 border-red-500/50' : 'bg-zinc-900 border-zinc-800')
                  },
                    el("div", null,
                      el("h3", { className: "text-2xl font-black text-white" }, p.name),
                      el("p", { className: (p.isSpy ? 'text-red-500' : 'text-emerald-500') + " font-bold uppercase text-xs" },
                        p.isSpy ? STRINGS.theSpy : (isArabic ? p.roleAr : p.roleEn)
                      )
                    ),
                    p.isSpy && el("div", { className: "w-12 h-12 rounded-full bg-red-500 text-zinc-950 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]" },
                      el("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                        el("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" })
                      )
                    )
                  );
                })
              ),

              roomData.hostUID === user.uid && el("button", {
                onClick: function() { window.roomsCollection.doc(roomCode).update({ status: 'waiting' }); },
                className: "w-full py-6 rounded-[32px] bg-emerald-600 text-zinc-950 font-black text-xl hover:bg-emerald-500 transition-all uppercase tracking-widest shadow-xl active:scale-95"
              }, STRINGS.newOp)
            )
          )
        )
      ),
    ),

    /* Footer / Branding */
      el("div", { className: "mt-12 opacity-20 pointer-events-none select-none" },
        el("p", { className: "text-xs tracking-widest uppercase font-bold text-zinc-400 italic" }, "Who Is The Spy v2.0")
      )
    );
  };

  window.SpyGameRebuild = SpyGameRebuild;
})();
