(function() {
    const { useState, useEffect, useRef, useCallback } = React;
    const el = React.createElement;

    /**
     * SnakeLadderView
     * Professional React implementation for Snake & Ladder Pro.
     */
    const SnakeLadderView = ({ roomId, gameId, user, onExit, lang = 'ar' }) => {
        const [roomData, setRoomData] = useState(null);
        const [engine, setEngine] = useState(null);
        const [isRolling, setIsRolling] = useState(false);
        const [diceValue, setDiceValue] = useState(1);
        const [diceOffset, setDiceOffset] = useState(380); // Default for '1'
        const [showMatchmaking, setShowMatchmaking] = useState(!roomId);
        const [viewRoomId, setViewRoomId] = useState(roomId);
        const [showInviteModal, setShowInviteModal] = useState(false);
        const [showSettingsModal, setShowSettingsModal] = useState(false);
        const [isMyTurn, setIsMyTurn] = useState(false);

        useEffect(() => {
            if (roomData && roomData.players) {
                const curPlayer = roomData.players[roomData.currentTurnIndex];
                const isHost = roomData.players.length > 0 && roomData.players[0].uid === user?.uid;
                
                const isMyActualTurn = curPlayer && curPlayer.uid === user?.uid;
                // If it's a party mode guest (type: human, but uid is guest...), allow the host device to roll for them.
                const isGuestTurnAsHost = isHost && curPlayer && curPlayer.uid.startsWith('guest_');
                
                setIsMyTurn(isMyActualTurn || isGuestTurnAsHost);
            }
        }, [roomData, user?.uid]);
        
        const service = window.SnakeLadderService;
        const AUDIO_BASE = './audio/snake-ladder/';
        const DICE_OFFSETS = [380, 318, 256, 195, 133, 71]; // Original Positive Offsets

        const [codeCopied, setCodeCopied] = useState(false);

        const t = {
            ar: {
                turn: 'دور:',
                roll: 'رمي النرد',
                exit: 'خروج',
                waiting: 'في انتظار اللاعبين...',
                waitingForHost: 'في انتظار مضيف اللعبة...',
                you: 'أنت',
                win: 'لقد فزت! 🎉',
                lose: 'خسرت 😢',
                gameFinished: 'انتهت اللعبة!',
                insufficient: 'رصيد غير كافٍ للعب',
                roomCode: 'كود الغرفة',
                copyCode: 'نسخ',
                copied: 'تم النسخ ✓',
                startGame: 'ابدأ اللعبة',
                shareInvite: 'شارك الكود مع أصدقائك للانضمام',
                minPlayers: 'ادعُ لاعباً على الأقل قبل البداية',
                players: 'اللاعبون'
            },
            en: {
                turn: 'Turn:',
                roll: 'Roll Dice',
                exit: 'Exit',
                waiting: 'Waiting for players...',
                waitingForHost: 'Waiting for host to start...',
                you: 'You',
                win: 'You Won! 🎉',
                lose: 'You Lost 😢',
                gameFinished: 'Game Finished!',
                insufficient: 'Insufficient balance to play',
                roomCode: 'Room Code',
                copyCode: 'Copy',
                copied: 'Copied ✓',
                startGame: 'Start Game',
                shareInvite: 'Share code with friends to join',
                minPlayers: 'Invite at least 1 player before starting',
                players: 'Players'
            }
        }[lang];

        // --- 🔊 Audio System ---
        const audioRef = useRef({
            bgm: null,
            sfxVolume: parseFloat(localStorage.getItem('snl_sfx_volume')) || 0.5,
            bgmVolume: parseFloat(localStorage.getItem('snl_bgm_volume')) || 0.5,
            isMuted: localStorage.getItem('snl_audio_muted') === 'true',
            tracks: [AUDIO_BASE + 'bg.mp3', AUDIO_BASE + 'bg1.mp3'],
            currentTrackIdx: 0
        });

        const initBGM = useCallback(() => {
            if (audioRef.current.bgm) return;
            const bgm = new Audio(audioRef.current.tracks[audioRef.current.currentTrackIdx]);
            bgm.loop = false; // We cycle manually
            bgm.volume = audioRef.current.isMuted ? 0 : audioRef.current.bgmVolume;
            
            bgm.onended = () => {
                audioRef.current.currentTrackIdx = (audioRef.current.currentTrackIdx + 1) % audioRef.current.tracks.length;
                bgm.src = audioRef.current.tracks[audioRef.current.currentTrackIdx];
                bgm.play().catch(e => console.warn('[SNL] BGM recovery failed:', e));
            };
            
            audioRef.current.bgm = bgm;
            bgm.play().catch(e => {
                console.warn('[SNL] BGM play blocked by browser. Awaiting interaction.');
                const playOnInteraction = () => {
                    bgm.play();
                    window.removeEventListener('click', playOnInteraction);
                };
                window.addEventListener('click', playOnInteraction);
            });
        }, []);

        useEffect(() => {
            if (!showMatchmaking) {
                initBGM();
            }
            return () => {
                if (audioRef.current.bgm) {
                    audioRef.current.bgm.pause();
                    audioRef.current.bgm = null;
                }
            };
        }, [initBGM, showMatchmaking]);

        const playAudio = (file) => {
            if (audioRef.current.isMuted) return;
            const sfx = new Audio(AUDIO_BASE + file);
            sfx.volume = audioRef.current.sfxVolume * 0.8; // SFX padding
            sfx.play().catch(() => {});
        };

        const updateAudioSettings = (musicVol, sfxVol, muted) => {
            audioRef.current.bgmVolume = musicVol;
            audioRef.current.sfxVolume = sfxVol;
            audioRef.current.isMuted = muted;
            
            localStorage.setItem('snl_bgm_volume', musicVol);
            localStorage.setItem('snl_sfx_volume', sfxVol);
            localStorage.setItem('snl_audio_muted', muted);
            
            if (audioRef.current.bgm) {
                audioRef.current.bgm.volume = muted ? 0 : musicVol;
                if (muted) audioRef.current.bgm.pause();
                else if (audioRef.current.bgm.paused) audioRef.current.bgm.play().catch(() => {});
            }
        };

        // 2. State & References for Animations
        const [animatedPositions, setAnimatedPositions] = useState({});
        const isAnimatingRef = useRef(false);
        const [enteringPlayers, setEnteringPlayers] = useState({}); // { uid: true } when entering

        useEffect(() => {
            if (viewRoomId) {
                localStorage.setItem('last_snl_room_id', viewRoomId);
                service.connect(viewRoomId, gameId, (data) => {
                    setRoomData(data);
                    
                    if (!isAnimatingRef.current) {
                        setAnimatedPositions(data.playerPositions || {});
                    }

                    const updatedState = {
                        players: (data.players || []).map(p => ({ 
                            ...p, 
                            position: (data.playerPositions && data.playerPositions[p.uid]) || 0,
                            left: p.left || false
                        })).sort((a, b) => (a.slot || 0) - (b.slot || 0)),
                        currentTurnIndex: data.currentTurnIndex || 0,
                        status: data.status || 'playing',
                        winners: data.winners || [],
                        lastAction: data.lastAction || null
                    };

                    if (!engine) {
                        const newEngine = new window.SnakeLadderEngine();
                        newEngine.setState(updatedState);
                        setEngine(newEngine);
                    } else {
                        engine.setState(updatedState);
                        
                        // Handle Remote Action Sync (for animations)
                        if (data.lastAction && data.lastAction.playerUid !== user?.uid) {
                            handleRemoteAction(data.lastAction);
                        }
                    }
                });
                return () => service.disconnect();
            }
        }, [viewRoomId]);

        const lastActionRef = useRef(null);
        const handleRemoteAction = async (action) => {
            if (!action.timestamp || action.timestamp === lastActionRef.current) return;
            lastActionRef.current = action.timestamp;

            if (action.roll) {
                setDiceValue(action.roll);
                setDiceOffset(DICE_OFFSETS[action.roll - 1]);
            }
            if (action.sequence) {
                await playActionSequence(action.sequence, action.playerUid, action.startPos || 0);
            }
        };


        // 4. Timer & Auto-Roll Handler
        const [secondsLeft, setSecondsLeft] = useState(5);
        useEffect(() => {
            if (!roomData || roomData.status !== 'playing' || isRolling || isAnimatingRef.current) return;
            
            const timerInterval = setInterval(() => {
                const now = Date.now();
                const startTime = roomData.turnStartTime || (roomData.updatedAt?.toMillis ? roomData.updatedAt.toMillis() : now);
                const elapsed = now - startTime;
                const remaining = Math.max(0, 5 - Math.floor(elapsed / 1000));
                setSecondsLeft(remaining);

                if (elapsed >= 5000) {
                    clearInterval(timerInterval);
                    handleAutoTimeout();
                }
            }, 500);

            return () => clearInterval(timerInterval);
        }, [roomData?.currentTurnIndex, roomData?.turnStartTime, roomData?.status, isRolling]);

        const handleAutoTimeout = async () => {
            if (isRolling || isAnimatingRef.current || !engine) return;
            
            const currentPlayer = roomData.players[roomData.currentTurnIndex];
            const isHost = roomData.players[0].uid === user?.uid;
            const isMyTurnActual = currentPlayer?.uid === user?.uid;

            // Only the owner (host) triggers auto-rolls for others/bots.
            // But if it's MY turn and I timed out, I definitely trigger it for myself too.
            if (isHost || isMyTurnActual) {
                console.log(`[SNL] Auto-timeout roll for ${currentPlayer?.name}`);
                
                // If it's a human (non-bot) timing out, mark them AFK
                if (currentPlayer.type !== 'bot' && !currentPlayer.isAFK) {
                    await service.updatePlayerStatus(currentPlayer.uid, { isAFK: true });
                }
                
                handleRoll();
            }
        };

        // 4. Bot Turn Handler (Handled now by handleAutoTimeout logic or kept for speed)
        // Original bot logic was faster (500ms), let's keep it for snappy bots
        useEffect(() => {
            if (!roomData || roomData.status !== 'playing' || isRolling || isAnimatingRef.current) return;
            const currentPlayer = roomData.players[roomData.currentTurnIndex];
            const isHost = roomData.players[0].uid === user?.uid;
            if (isHost && currentPlayer?.type === 'bot') {
                const botDelay = setTimeout(() => handleRoll(), 1000);
                return () => clearTimeout(botDelay);
            }
        }, [roomData?.currentTurnIndex, roomData?.status, isRolling]);

        // 4. Game Actions
        const playActionSequence = async (sequence, playerUid, startPos = 0) => {
            isAnimatingRef.current = true;
            const currentPositions = { ...(animatedPositions || roomData?.playerPositions || {}) };
            const targetUid = playerUid || roomData?.players[roomData.currentTurnIndex]?.uid;
            
            // Handle entry animation: player moving from 0 to 1
            const isEntry = startPos === 0 && sequence && sequence[0]?.pos === 1;
            
            if (isEntry && targetUid) {
                // Show token entering - briefly show it in HUD, then animate to board
                setEnteringPlayers(prev => ({ ...prev, [targetUid]: true }));
                playAudio('bonus.mp3');
                await new Promise(r => setTimeout(r, 500)); // Brief pause to show entry
                setEnteringPlayers(prev => ({ ...prev, [targetUid]: false }));
            }
            
            for (const step of sequence) {
                if (step.type === 'move') {
                    playAudio('move.mp3');
                    currentPositions[step.playerUid || targetUid] = step.pos;
                    setAnimatedPositions({ ...currentPositions });
                    await new Promise(r => setTimeout(r, 200));
                } else if (step.type === 'snake') {
                    playAudio('fall.mp3');
                    currentPositions[step.playerUid || targetUid] = step.pos;
                    setAnimatedPositions({ ...currentPositions });
                    await new Promise(r => setTimeout(r, 400));
                } else if (step.type === 'ladder') {
                    playAudio('rise.mp3');
                    currentPositions[step.playerUid || targetUid] = step.pos;
                    setAnimatedPositions({ ...currentPositions });
                    await new Promise(r => setTimeout(r, 400));
                } else if (step.type === 'captured') {
                    playAudio('fall.mp3');
                    currentPositions[step.targetUid] = step.newPos;
                    setAnimatedPositions({ ...currentPositions });
                    await new Promise(r => setTimeout(r, 300));
                }
            }
            isAnimatingRef.current = false;
            // Sync final state safely
            if (engine) {
               setAnimatedPositions(engine.getState().players.reduce((acc, p) => ({ ...acc, [p.uid]: p.position }), {}));
            }
        };

        const handleRoll = async () => {
            if (isRolling || !engine || roomData.status !== 'playing') return;

            const currentPlayer = roomData.players[roomData.currentTurnIndex];
            const playerStartPos = currentPlayer?.position || 0;

            // If player rolls manually, clear AFK status
            if (currentPlayer.uid === user?.uid && currentPlayer.isAFK) {
                service.updatePlayerStatus(user.uid, { isAFK: false });
            }

            setIsRolling(true);
            playAudio('roll.mp3');
            
            // Dice jitter animation (simulated)
            let jitterCount = 0;
            const jitterInterval = setInterval(() => {
                setDiceOffset(DICE_OFFSETS[Math.floor(Math.random() * 6)]);
                jitterCount++;
                if (jitterCount > 10) clearInterval(jitterInterval);
            }, 80);

            // Execute locally in engine
            const result = await engine.executeTurn();
            
            setTimeout(async () => {
                setDiceValue(result.roll);
                // Use original parity logic for background position
                setDiceOffset(DICE_OFFSETS[result.roll - 1]);

                if (result.roll === 6) playAudio('bonus.mp3');

                // Sync to Firestore
                const newState = engine.getState();
                await service.submitMove(
                    result.roll, 
                    Object.fromEntries(newState.players.map(p => [p.uid, p.position])), 
                    newState.currentTurnIndex,
                    result.sequence,
                    playerStartPos
                );
                
                await playActionSequence(result.sequence, result.playerUid, playerStartPos);
                setIsRolling(false);
            }, 1000);
        };

        const handleExit = () => {
            const confirmMsg = lang === 'ar' ? 'هل أنت متأكد أنك تريد الخروج من اللعبة؟' : 'Are you sure you want to leave the game?';
            if (window.confirm(confirmMsg)) {
                // 1. Clear saved room so rejoin prompt never appears
                localStorage.removeItem('last_snl_room_id');
                // 2. Disconnect Firestore listener immediately
                service.disconnect();
                // 3. Go back to lobby immediately (UI is snappy)
                if (typeof onExit === 'function') onExit();
                
                // 4. Fire-and-forget: mark player as left in Firestore (background)
                if (viewRoomId) {
                    service.leaveRoom(viewRoomId, gameId, user?.uid).catch(e => {
                        console.warn('[SNL] leaveRoom background error:', e);
                    });
                }
            }
        };

        /**
         * handleStartGame — called by room admin to start the game.
         * Transitions status: 'waiting' → 'playing'
         */
        const handleStartGame = async () => {
            if (!viewRoomId || !service) return;
            await service.startGame(viewRoomId, gameId);
        };

        /**
         * handleCopyCode — copies room ID to clipboard with 2s feedback.
         */
        const handleCopyCode = async () => {
            const ok = await service.copyRoomCode(viewRoomId);
            if (ok) {
                setCodeCopied(true);
                setTimeout(() => setCodeCopied(false), 2000);
            }
        };

        const getCellCoords = (pos, index = 0, overlappingIdx = 0, totalOverlap = 1) => {
            if (pos <= 0) {
                // Return grass area coordinates (starts outside board)
                // We'll place 4 spots nicely in the grass above the HUD
                const startX = 15;
                const spacingX = 23.3;
                return { x: startX + (index * spacingX), y: 110 }; 
            }
            const p = pos;
            const row = Math.floor((p - 1) / 10);
            let col = (p - 1) % 10;
            if (row % 2 === 1) col = 9 - col;
            let baseX = (col * 10) + 5;
            let baseY = 95 - (row * 10);
            
            if (totalOverlap > 1) {
                // Add staggered offset so they stack nicely
                const offsetX = (overlappingIdx % 2 === 0 ? 1 : -1) * (1.8 * Math.floor((overlappingIdx + 1) / 2));
                const offsetY = -2.5 * overlappingIdx; // Stack upwards slightly
                baseX += offsetX;
                baseY += offsetY;
            }
            return { x: baseX, y: baseY };
        };

        const getPieceBgPos = (index) => {
            const positions = [{ x: 0, y: -70 }, { x: -70, y: -70 }, { x: -145, y: 0 }, { x: -144, y: -70 }];
            const pos = positions[index % 4];
            return `${pos.x}px ${pos.y}px`;
        };

        const handleMatchFound = React.useCallback((id) => {
            setViewRoomId(id);
            setShowMatchmaking(false);
        }, []);

        const handleCancelMatchmaking = React.useCallback(() => {
            if (typeof onExit === 'function') onExit();
        }, [onExit]);

        if (showMatchmaking) {
            return el(window.MatchmakingOverlay, {
                gameId, user, lang, 
                onCancel: handleCancelMatchmaking,
                onMatchFound: handleMatchFound
            });
        }

        if (!roomData) return el('div', { className: 'snl-loading' }, t.waiting);

        // ── Waiting Room UI ─────────────────────────────────────────────────────
        // Shown when game status is 'waiting' — before host starts the game.
        if (roomData.status === 'waiting') {
            const players = Array.isArray(roomData.players) ? roomData.players : Object.values(roomData.players || {});
            const isAdmin = roomData.admin === user?.uid;
            const hasEnoughPlayers = players.filter(p => !p.left).length >= 2;

            return el('div', { className: 'snl-waiting-room animate-fadeIn' },

                // Exit header
                el('div', { className: 'snl-wr-header' },
                    el('button', { onClick: handleExit, className: 'snl-wr-exit-btn' }, '← ' + t.exit)
                ),

                // Room code card
                el('div', { className: 'snl-wr-code-card' },
                    el('div', { className: 'snl-wr-code-label' }, '🎲 ' + t.roomCode),
                    el('div', { className: 'snl-wr-code-value' }, viewRoomId),
                    el('button', {
                        className: `snl-wr-copy-btn ${codeCopied ? 'copied' : ''}`,
                        onClick: handleCopyCode
                    }, codeCopied ? t.copied : '📋 ' + t.copyCode),
                    el('div', { className: 'snl-wr-share-hint' }, t.shareInvite)
                ),

                // Players list
                el('div', { className: 'snl-wr-players' },
                    el('div', { className: 'snl-wr-players-label' },
                        '👥 ' + t.players + ' (' + players.filter(p => !p.left).length + ')'
                    ),
                    el('div', { className: 'snl-wr-players-list' },
                        players.filter(p => !p.left).map((p, i) =>
                            el('div', { key: p.uid, className: 'snl-wr-player-row' },
                                el('div', { className: `snl-wr-player-dot dot-${i}` }),
                                el('span', { className: 'snl-wr-player-name' },
                                    p.name,
                                    p.uid === user?.uid && el('span', { className: 'snl-wr-you-tag' }, ' (' + t.you + ')'),
                                    p.uid === roomData.admin && el('span', { className: 'snl-wr-host-tag' }, ' 👑')
                                )
                            )
                        )
                    )
                ),

                // Start / Waiting action area
                el('div', { className: 'snl-wr-actions' },
                    isAdmin
                        ? el('div', null,
                            !hasEnoughPlayers && el('div', { className: 'snl-wr-min-hint' }, '⚠️ ' + (lang === 'ar' ? 'تحتاج إلى لاعبين على الأقل' : 'Minimum 2 players required')),
                            el('div', { style: { display: 'flex', gap: '10px', width: '100%' } },
                                el('button', {
                                    className: `snl-wr-start-btn ${hasEnoughPlayers ? '' : 'solo-allowed'}`,
                                    onClick: hasEnoughPlayers ? handleStartGame : undefined,
                                    style: { flex: 2 }
                                }, '🚀 ' + (lang === 'ar' ? 'بدء اللعبة' : 'Start Game')),
                                el('button', {
                                    className: 'snl-wr-start-btn',
                                    onClick: () => setShowInviteModal(true),
                                    style: { flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', fontSize: '13px' }
                                }, '📨 ' + (lang === 'ar' ? 'دعوة' : 'Invite'))
                            )
                          )
                        : el('div', { className: 'snl-wr-waiting-msg' },
                            el('div', { className: 'snl-wr-spinner' }),
                            t.waitingForHost
                          )
                ),
                showInviteModal && el(window.SNLFriendInviteModal, {
                    room: roomData, user, lang, onClose: () => setShowInviteModal(false)
                })
            );
        }
        // ────────────────────────────────────────────────────────────────────────

        const players = Array.isArray(roomData.players) ? roomData.players : Object.values(roomData.players || {});
        const curIdx = roomData.currentTurnIndex;
        const activePlayer = players[curIdx];

        return el('div', { id: 'snl-game-container', className: 'animate-fadeIn' },
            // Header
            el('div', { className: 'snl-header flex justify-between items-center p-4' },
                el('div', { className: 'flex items-center gap-2' },
                    el('button', {
                        onClick: () => setShowSettingsModal(true),
                        className: 'w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-90',
                        style: { background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }
                    }, el('span', { style: { fontSize: '20px' } }, '⚙️')),
                    el('button', { 
                        onClick: handleExit, 
                        className: 'px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/10',
                        style: { background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }
                    }, t.exit)
                ),
                el('div', { 
                    className: 'snl-game-status',
                    style: { background: 'rgba(0,0,0,0.6)', padding: '6px 16px', borderRadius: '99px', backdropFilter: 'blur(8px)', border: '1px solid rgba(16, 185, 129, 0.2)' }
                },
                    el('span', { className: 'text-xs font-black uppercase tracking-widest text-[#10b981]' }, 
                        `${t.turn} ${activePlayer?.name || '...'} ${isMyTurn ? ` (${t.you})` : ''}`
                    )
                )
            ),

            // Settings Modal
            showSettingsModal && el(SNLSettingsModal, {
                settings: audioRef.current,
                lang, t,
                onClose: () => setShowSettingsModal(false),
                onUpdate: updateAudioSettings
            }),

            // Playground (10x10 Grid)
            el('div', { id: 'snl-playground', className: 'relative' },
                el('div', { id: 'snl-board-wrapper' },
                    el('div', { id: 'snl-game-board' }),
                    (() => {
                        const posCounts = {};
                        players.forEach(p => {
                            const pos = animatedPositions?.[p.uid] || 0;
                            posCounts[pos] = (posCounts[pos] || 0) + 1;
                        });
                        const currentPosIndex = {};
                        
                        return players.map((p, i) => {
                            const pos = animatedPositions?.[p.uid] || 0;
                            const isInGrass = pos <= 0;
                            
                            let overlapIdx = 0;
                            let totalOver = 1;
                            if (posCounts[pos]) {
                                overlapIdx = currentPosIndex[pos] || 0;
                                currentPosIndex[pos] = overlapIdx + 1;
                                totalOver = posCounts[pos];
                            }
                            
                            const finalCoords = getCellCoords(pos, i, overlapIdx, totalOver);
                            
                            return el('div', {
                                key: p.uid,
                                className: `snl-player piece-${i} ${curIdx === i ? 'active' : ''} ${isInGrass ? 'snl-piece-in-grass' : ''} ${p.left ? 'snl-piece-left' : ''}`,
                                style: {
                                    left: `${finalCoords.x}%`,
                                    top: `${finalCoords.y}%`,
                                    backgroundPosition: getPieceBgPos(i),
                                    zIndex: (curIdx === i) ? 20 : (10 + overlapIdx),
                                    transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)', // Snappy spring move
                                    opacity: (p.left || p.isAFK) ? 0.7 : 1
                                }
                            }, 
                                el('div', { className: 'snl-player-name' }, p.name),
                                (p.isAFK || p.left) && el('div', { className: 'snl-piece-afk-tag' }, 'AFK')
                            );
                        });
                    })()
                )
            ),

            el('div', { className: 'snl-footer-hud', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' } },
                el('div', { className: 'snl-hud-players', style: { display: 'flex', gap: '8px', flex: 1, overflowX: 'auto', padding: '0 10px', alignItems: 'center' } },
                    players.map((p, i) => {
                        const pos = animatedPositions?.[p.uid] || 0;
                        const hasEntered = pos > 0;
                        return el('div', { 
                            key: p.uid, 
                            className: `snl-hud-player-mini ${curIdx === i ? 'active' : ''}`,
                            onClick: () => {
                                if (p.type !== 'bot' && !p.uid.startsWith('guest_')) {
                                    if (window.openMiniProfile) window.openMiniProfile(p.uid);
                                    else if (window.parent?.openMiniProfile) window.parent.openMiniProfile(p.uid);
                                }
                            },
                            style: { 
                                display: 'flex', flexDirection: 'column', alignItems: 'center', 
                                opacity: p.left ? 0.4 : 1, cursor: p.type === 'bot' ? 'default' : 'pointer',
                                transform: curIdx === i ? 'scale(1.1)' : 'scale(1)',
                                transition: 'all 0.2s'
                            } 
                        },
                            el('div', { 
                                className: 'snl-hud-avatar-box', 
                                style: { 
                                    width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', 
                                    marginBottom: '4px', border: curIdx === i ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.1)', 
                                    borderRadius: '50%', padding: '2px', overflow: 'hidden', background: '#000',
                                    position: 'relative' 
                                } 
                            },
                                (p.isAFK || p.left) && el('div', { 
                                    className: 'snl-afk-badge',
                                    style: {
                                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#ff4b4b', fontSize: '9px', fontWeight: '900', zIndex: 15
                                    }
                                }, 'AFK'),
                                (!hasEntered || enteringPlayers[p.uid]) && el('div', {
                                    className: enteringPlayers[p.uid] ? 'snl-entry-animation' : '',
                                    style: {
                                        position: 'absolute',
                                        top: '-8px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: '24px',
                                        height: '24px',
                                        backgroundImage: 'url("/icos/snake-ladder/pieces.jpg")',
                                        backgroundSize: '195px 120px',
                                        backgroundPosition: getPieceBgPos(i),
                                        borderRadius: '50%',
                                        border: '2px solid #fff',
                                        zIndex: 10,
                                        boxShadow: '0 0 10px rgba(16,185,129,0.8)'
                                    }
                                }),
                                p.type === 'bot' 
                                    ? el('img', { src: p.photo, className: 'w-full h-full object-cover rounded-full' })
                                    : el(window.AvatarWithFrame, { photoURL: p?.photo, size: 'xs', lang })
                            ),
                            el('div', { 
                                className: 'snl-hud-name-label', 
                                style: { 
                                    fontSize: '9px', fontWeight: '900', width: '56px', overflow: 'hidden', 
                                    textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center', 
                                    color: curIdx === i ? '#10b981' : '#fff',
                                    background: 'rgba(0,0,0,0.6)', padding: '2px 4px', borderRadius: '4px'
                                } 
                            }, p?.name),
                            curIdx === i && el('div', { className: 'snl-turn-countdown' }, secondsLeft + 's')
                        );
                    })
                ),
                
                el('div', { className: 'snl-hud-controls' },
                    el('div', { 
                        className: `snl-play-btn ${(isMyTurn && !isRolling && roomData.status === 'playing') ? '' : 'disabled'}`,
                        onClick: (isMyTurn && !isRolling && roomData.status === 'playing') ? handleRoll : null
                    }, '▶'),
                    el('div', { 
                        className: `snl-dice-box ${isMyTurn && !isRolling ? 'clickable' : ''}`,
                        onClick: (isMyTurn && !isRolling) ? handleRoll : null
                    },
                        el('div', { 
                            className: 'snl-dice-visual', 
                            style: { backgroundPositionX: `${diceOffset}px` } 
                        })
                    )
                )
            ),

            // Winner Overlay (Podium)
            roomData.status === 'finished' && el('div', { className: 'snl-podium-overlay' },
                el('div', { className: 'snl-podium-content animate-bounceIn' },
                    el('h2', { className: 'snl-winner-title text-3xl font-black mb-6' }, t.gameFinished),
                    el('div', { className: 'snl-podium-ranks flex justify-center items-end gap-4 h-48' },
                        roomData.winners.slice(0, 3).map((uid, i) => {
                            const p = players.find(player => player.uid === uid);
                            const rankClass = ['winner-1st', 'winner-2nd', 'winner-3rd'][i];
                            return el('div', { key: uid, className: `podium-rank ${rankClass}` },
                                el('div', { className: 'rank-avatar' }, 
                                    el(window.AvatarWithFrame, { photoURL: p?.photo, size: 'md' })
                                ),
                                el('div', { className: 'rank-pedestal' }, 
                                    el('span', { className: 'rank-name' }, p?.name),
                                    el('span', { className: 'rank-number' }, i + 1)
                                )
                            );
                        })
                    ),
                    el('button', { onClick: onExit, className: 'btn-neon mt-10 px-10' }, t.exit)
                )
            )
        );
    };

    window.SnakeLadderView = SnakeLadderView;

    // ── Settings Modal ───────────────────────────────────────────────────────
    const SNLSettingsModal = ({ settings, lang, t, onClose, onUpdate }) => {
        const el = React.createElement;
        const [mVol, setMVol] = React.useState(settings.bgmVolume);
        const [sVol, setSVol] = React.useState(settings.sfxVolume);
        const [muted, setMuted] = React.useState(settings.isMuted);

        const handleSave = () => {
            onUpdate(mVol, sVol, muted);
        };

        return el('div', { 
            className: 'snl-settings-overlay fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-fadeIn',
            style: { background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' },
            onClick: (e) => { if (e.target === e.currentTarget) onClose(); }
        },
            el('div', { 
                className: 'snl-settings-modal w-full max-w-sm animate-popIn',
                style: { background: 'rgba(25,25,45,0.95)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '24px', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' },
                onClick: (e) => e.stopPropagation()
            },
                el('div', { className: 'flex justify-between items-center mb-8' },
                    el('h2', { className: 'text-2xl font-black text-white italic tracking-tighter' }, 'GAME SETTINGS'),
                    el('button', { onClick: onClose, className: 'text-white/40 hover:text-white transition-colors' }, '✕')
                ),

                el('div', { className: 'space-y-8' },
                    // Mute Toggle
                    el('div', { className: 'flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5' },
                        el('div', null,
                            el('div', { className: 'text-sm font-black text-white' }, lang === 'ar' ? 'كتم الصوت' : 'Mute All'),
                            el('div', { className: 'text-[10px] text-white/40 font-bold' }, muted ? (lang === 'ar' ? 'الصوت متوقف' : 'Sound disabled') : (lang === 'ar' ? 'الصوت يعمل' : 'Sound active'))
                        ),
                        el('button', {
                            onClick: () => { const n = !muted; setMuted(n); onUpdate(mVol, sVol, n); },
                            className: `w-14 h-8 rounded-full relative transition-all duration-300 ${muted ? 'bg-red-500/30' : 'bg-[#10b981]/30'}`,
                            style: { border: muted ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(16,185,129,0.3)' }
                        },
                            el('div', { 
                                className: `absolute top-1 w-6 h-6 rounded-full shadow-lg transition-all duration-300 ${muted ? 'left-1 bg-red-500' : 'left-7 bg-[#10b981]'}`
                            })
                        )
                    ),

                    // Music Slider
                    el('div', null,
                        el('div', { className: 'flex justify-between items-center mb-3' },
                            el('div', { className: 'text-xs font-black text-white/60 tracking-widest uppercase' }, lang === 'ar' ? 'الموسيقى' : 'Music Volume'),
                            el('div', { className: 'text-xs font-black text-[#10b981]' }, Math.round(mVol * 100) + '%')
                        ),
                        el('input', {
                            type: 'range', min: 0, max: 1, step: 0.01, value: mVol,
                            onChange: (e) => { const v = parseFloat(e.target.value); setMVol(v); onUpdate(v, sVol, muted); },
                            className: 'snl-range-slider'
                        })
                    ),

                    // SFX Slider
                    el('div', null,
                        el('div', { className: 'flex justify-between items-center mb-3' },
                            el('div', { className: 'text-xs font-black text-white/60 tracking-widest uppercase' }, lang === 'ar' ? 'المؤثرات' : 'Sound Effects'),
                            el('div', { className: 'text-xs font-black text-[#10b981]' }, Math.round(sVol * 100) + '%')
                        ),
                        el('input', {
                            type: 'range', min: 0, max: 1, step: 0.01, value: sVol,
                            onChange: (e) => { const v = parseFloat(e.target.value); setSVol(v); onUpdate(mVol, v, muted); },
                            className: 'snl-range-slider'
                        })
                    )
                ),

                el('button', {
                    onClick: onClose,
                    className: 'w-full mt-10 py-4 bg-[#10b981] text-white font-black rounded-2xl shadow-[0_10px_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all'
                }, lang === 'ar' ? 'تم' : 'CLOSE')
            )
        );
    };

    // ═══════════════════════════════════════════
    //  FRIEND INVITE MODAL (SNAKE LADDER)
    // ═══════════════════════════════════════════
    window.SNLFriendInviteModal = ({ room, user, lang, onClose }) => {
        const { useState, useEffect } = React;
        const el = React.createElement;
        const [friends, setFriends] = useState([]);
        const [loading, setLoading] = useState(true);
        const [sentTo, setSentTo] = useState({});

        useEffect(() => {
            if (!user) return;
            const db = window.db || (window.firebase && window.firebase.firestore && window.firebase.firestore());
            if (!db) { setLoading(false); return; }
            const usersRef = window.usersCollection || db.collection('artifacts').doc(window.appId).collection('public').doc('data').collection('users');
            
            usersRef.doc(user.uid).get().then(snap => {
                const data = snap.data() || {};
                const friendIds = data.friends || data.bffs || [];
                if (!friendIds.length) { setLoading(false); return; }
                const chunks = friendIds.slice(0, 20); // Limit to 20 for now
                usersRef.where(window.firebase.firestore.FieldPath.documentId(), 'in', chunks).get()
                    .then(qs => {
                        setFriends(qs.docs.map(d => ({ uid: d.id, ...d.data() })));
                    })
                    .catch(() => {})
                    .finally(() => setLoading(false));
            }).catch(() => setLoading(false));
        }, [user]);

        const sendInvite = async (friend) => {
            if (!user || !room) return;
            const db = window.db || (window.firebase && window.firebase.firestore && window.firebase.firestore());
            if (!db) return;
            const chatsRef = window.chatsCollection || db.collection('artifacts').doc(window.appId).collection('public').doc('data').collection('private_chats');
            const chatId = [user.uid, friend.uid].sort().join('_');
            const msgRef = chatsRef.doc(chatId).collection('messages').doc();
            
            await msgRef.set({
                type: 'snl_room_invite',
                text: `🐍 ${user.displayName || 'A friend'} invites you to play Snake & Ladder Pro!`,
                roomId: room.id || room.roomId,
                roomCode: room.id || room.roomId,
                isPrivate: room.isPrivate || false,
                password: room.password || null,
                senderId: user.uid,
                senderName: user.displayName || 'Guest',
                senderPhoto: user.photoURL || null,
                timestamp: window.firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            });
            await chatsRef.doc(chatId).set({
                members: [user.uid, friend.uid],
                lastMessage: `🐍 Snake & Ladder Invitation`,
                timestamp: window.firebase.firestore.FieldValue.serverTimestamp(),
                [`unread.${friend.uid}`]: window.firebase.firestore.FieldValue.increment(1)
            }, { merge: true });
            
            setSentTo(prev => ({ ...prev, [friend.uid]: true }));
            if (window.SnakeLadderCore?.utils?.SoundEngine?.playChime) {
                window.SnakeLadderCore.utils.SoundEngine.playChime();
            }
        };

        return el('div', {
            className: "fixed inset-0 z-[300] flex items-end justify-center animate-in fade-in duration-200",
            style: { background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)' },
            onClick: (e) => { if (e.target === e.currentTarget) onClose(); }
        },
            el('div', {
                className: "w-full max-w-md animate-in slide-in-from-bottom duration-300",
                style: { background: 'linear-gradient(180deg,rgba(14,14,30,0.98),rgba(8,8,20,1))', borderRadius: '2rem 2rem 0 0', border: '1px solid rgba(16, 185, 129, 0.15)', borderBottom: 'none', paddingBottom: 'env(safe-area-inset-bottom,16px)', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }
            },
                el('div', { className: "flex justify-center pt-3 pb-2" },
                    el('div', { className: "w-10 h-1 rounded-full bg-[rgba(255,255,255,0.15)]" })
                ),
                el('div', { className: "px-6 pb-4 flex items-center justify-between" },
                    el('div', null,
                        el('div', { className: "text-white font-black text-lg" }, lang === 'ar' ? "📨 دعوة الأصدقاء" : "📨 Invite Friends"),
                        el('div', { className: "text-gray-400 text-xs mt-0.5" }, lang === 'ar' ? "تم إرسال الدعوة إلى المحادثة الخاصة" : "Sent to private chat")
                    ),
                    el('button', { onClick: onClose, className: "w-8 h-8 rounded-full bg-[rgba(255,255,255,0.08)] text-white flex items-center justify-center" }, "✕")
                ),
                el('div', { className: "flex-1 overflow-y-auto px-6 pb-4 space-y-3" },
                    loading && el('div', { className: "text-center text-gray-500 py-8 animate-pulse" }, lang === 'ar' ? "جاري التحميل..." : "Loading..."),
                    !loading && friends.length === 0 && el('div', { className: "text-center py-8" },
                        el('div', { className: "text-[gray-500] text-sm font-bold" }, lang === 'ar' ? "لا يوجد أصدقاء" : "No friends")
                    ),
                    friends.map(f => el('div', {
                        key: f.uid, className: "flex items-center gap-3 p-3 rounded-2xl",
                        style: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }
                    },
                        (f.photoURL && window.AvatarWithFrame)
                            ? el(window.AvatarWithFrame, { photoURL: f.photoURL, equipped: f.equipped || {}, size: 'sm', lang })
                            : el('div', { className: "w-10 h-10 rounded-full flex items-center justify-center font-black text-sm", style: { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' } }, (f.displayName || f.name || '?').charAt(0)),
                        el('div', { className: "flex-1 min-w-0" },
                            el('div', { className: "text-white font-bold text-sm truncate" }, f.displayName || f.name || 'User')
                        ),
                        el('button', {
                            onClick: () => sendInvite(f),
                            disabled: !!sentTo[f.uid],
                            className: `px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                sentTo[f.uid]
                                    ? 'bg-[rgba(16,185,129,0.15)] text-[#10b981] cursor-default'
                                    : 'bg-[#10b981] text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95 cursor-pointer'
                            }`
                        }, sentTo[f.uid] ? (lang === 'ar' ? '✓ تم' : '✓ Sent') : (lang === 'ar' ? 'دعوة' : 'Invite'))
                    ))
                )
            )
        );
    };

})();
