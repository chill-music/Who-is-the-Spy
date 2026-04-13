/**
 * MatchmakingOverlay.js
 * React component for the "Finding Players..." state.
 */

(function() {
    const { useState, useEffect, useRef } = React;

    const MatchmakingOverlay = ({ gameId, user, onCancel, onMatchFound, lang = 'ar' }) => {
        const [playersInQueue, setPlayersInQueue] = useState([]);
        const [elapsedTime, setElapsedTime] = useState(0);
        const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting' | 'connected' | 'disconnected'
        const t = {
            ar: {
                finding: 'جاري البحث عن لاعبين...',
                wait: 'الرجاء الانتظار قليلاً',
                cancel: 'إلغاء البحث',
                players: 'لاعبين في الانتظار',
                sec: 'ثانية',
                startBots: 'بدء مع بوتات 🤖'
            },
            en: {
                finding: 'Finding players...',
                wait: 'Please wait a moment',
                cancel: 'Cancel Search',
                players: 'Players in queue',
                sec: 'seconds',
                startBots: 'Start with Bots 🤖'
            }
        }[lang];

        const matchFoundRef = useRef(onMatchFound);
        const cancelRef = useRef(onCancel);
        const failCountRef = useRef(0);

        useEffect(() => {
            matchFoundRef.current = onMatchFound;
            cancelRef.current = onCancel;
        }, [onMatchFound, onCancel]);

        useEffect(() => {
            let isMounted = true;
            let checkInterval;
            let tickCount = 0;

            const startMatchmaking = async () => {
                try {
                    setConnectionStatus('connecting');
                    
                    // 1. Join the queue with heartbeat
                    if (window.MatchmakingService && typeof window.MatchmakingService.joinQueue === 'function') {
                        window.MatchmakingService.joinQueue(user.uid, gameId, {
                            name: user.displayName,
                            photo: user.photoURL,
                            vipLevel: user.vipLevel || 0
                        }).then(roomId => {
                            if (isMounted && roomId) {
                                setConnectionStatus('connected');
                                if (matchFoundRef.current) matchFoundRef.current(roomId);
                            }
                        }).catch(err => {
                            console.error('[Matchmaking] Join error:', err);
                            failCountRef.current++;
                            if (isMounted && failCountRef.current >= 3) {
                                setConnectionStatus('disconnected');
                            }
                        });
                    }

                    // 2. Poll for queue size and validation
                    checkInterval = setInterval(async () => {
                        try {
                            if (!window.MatchmakingService || !window.db) return;
                            
                            tickCount++;
                            // Cleanup stale entries (every 10s)
                            if (tickCount % 10 === 0 && typeof window.MatchmakingService.cleanupStaleEntries === 'function') {
                                await window.MatchmakingService.cleanupStaleEntries(user.uid).catch(() => {});
                            }
                            
                            // Coordinator logic: Check if we can start a match
                            const minPlayers = gameId === 'snake_ladder_pro' ? 4 : 2;
                            let roomId = null;
                            if (typeof window.MatchmakingService.discoverAndMatch === 'function') {
                                roomId = await window.MatchmakingService.discoverAndMatch(gameId, minPlayers, 4).catch(() => null);
                            }
                            
                            if (roomId && isMounted) {
                                if (matchFoundRef.current) matchFoundRef.current(roomId);
                                return;
                            }

                            // Get active players in queue
                            const snapshot = await window.db.collection('artifacts').doc(window.appId).collection('public').doc('data').collection('global_queues')
                                .where('gameId', '==', gameId)
                                .get();
                            
                            const now = Date.now();
                            const staleThreshold = now - 15000;
                            
                            if (isMounted) {
                                const activePlayers = snapshot.docs
                                    .map(doc => doc.data())
                                    .filter(p => {
                                        if (p.roomId) return false;
                                        let lastHeartbeat = 0;
                                        try {
                                            if (p.lastHeartbeat && typeof p.lastHeartbeat.toMillis === 'function') {
                                                lastHeartbeat = p.lastHeartbeat.toMillis();
                                            } else if (typeof p.lastHeartbeat === 'number') {
                                                lastHeartbeat = p.lastHeartbeat;
                                            }
                                        } catch (e) { lastHeartbeat = 0; }
                                        return lastHeartbeat >= staleThreshold && p.isActive !== false;
                                    });
                                
                                setPlayersInQueue(activePlayers);
                                setElapsedTime(prev => prev + 1);
                                
                                // ✅ SUCCESS: Reset failure count and set connected
                                failCountRef.current = 0;
                                setConnectionStatus('connected');
                            }
                        } catch (err) {
                            failCountRef.current++;
                            console.warn('[Matchmaking] Poll attempt failed:', failCountRef.current, err);
                            if (isMounted && failCountRef.current >= 3) {
                                setConnectionStatus('disconnected');
                            }
                        }
                    }, 1000);

                } catch (err) {
                    console.error('[Matchmaking] Critical Error:', err);
                    if (isMounted) setConnectionStatus('disconnected');
                }
            };

            startMatchmaking();

            return () => {
                isMounted = false;
                clearInterval(checkInterval);
                if (window.MatchmakingService && typeof window.MatchmakingService.leaveQueue === 'function') {
                    window.MatchmakingService.leaveQueue();
                }
            };
        }, [gameId, user.uid]); // Removed onMatchFound to prevent flickering

        return React.createElement('div', {
            className: 'matchmaking-overlay animate-pop',
            style: {
                position: 'fixed',
                inset: 0,
                zIndex: 20000,
                background: 'rgba(13, 13, 31, 0.95)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                textAlign: 'center'
            }
        },
            // Connection Status Indicator
            React.createElement('div', {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                    padding: '6px 14px',
                    background: connectionStatus === 'connected' ? 'rgba(16,185,129,0.15)' : connectionStatus === 'disconnected' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                    borderRadius: '20px',
                    border: `1px solid ${connectionStatus === 'connected' ? 'rgba(16,185,129,0.3)' : connectionStatus === 'disconnected' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}`
                }
            },
                React.createElement('div', {
                    style: {
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: connectionStatus === 'connected' ? '#10b981' : connectionStatus === 'disconnected' ? '#ef4444' : '#fbbf24',
                        animation: connectionStatus === 'connected' ? 'none' : 'pulse 1s infinite'
                    }
                }),
                React.createElement('span', {
                    style: {
                        fontSize: '11px',
                        fontWeight: '700',
                        color: connectionStatus === 'connected' ? '#10b981' : connectionStatus === 'disconnected' ? '#ef4444' : '#fbbf24'
                    }
                }, connectionStatus === 'connected' ? (lang === 'ar' ? 'متصل' : 'Connected') : connectionStatus === 'disconnected' ? (lang === 'ar' ? 'انقطع الاتصال' : 'Disconnected') : (lang === 'ar' ? 'جاري الاتصال...' : 'Connecting...'))
            ),
            
            // Loader
            React.createElement('div', { className: 'matchmaking-loader-ring' }),
            
            // Title
            React.createElement('h2', {
                style: {
                    fontSize: '28px',
                    fontWeight: '900',
                    background: 'linear-gradient(135deg, #00f2ff, #7000ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '8px'
                }
            }, t.finding),

            React.createElement('p', { style: { color: 'rgba(255,255,255,0.6)', marginBottom: '32px' } }, t.wait),

            // Queue Status
            React.createElement('div', {
                style: {
                    background: 'rgba(255,255,255,0.05)',
                    padding: '20px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    width: '90%',
                    maxWidth: '400px',
                    marginBottom: '40px'
                }
            },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '16px' } },
                    playersInQueue.map((p, i) => React.createElement('div', { 
                        key: p.userId || i, 
                        style: { 
                            position: 'relative',
                            opacity: p.isActive !== false ? 1 : 0.5
                        },
                        title: p.name
                    },
                        window.AvatarWithFrame 
                            ? React.createElement(window.AvatarWithFrame, { photoURL: p.photo, size: 'sm', lang })
                            : React.createElement('div', { 
                                style: { width: '44px', height: '44px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                              }, (p.name || '?').charAt(0))
                    )),
                    // Empty slots
                    Array.from({ length: 4 - playersInQueue.length }).map((_, i) => React.createElement('div', {
                        key: `empty-${i}`,
                        style: {
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)',
                            border: '2px dashed rgba(255,255,255,0.2)'
                        }
                    }))
                ),
                React.createElement('div', { style: { fontSize: '14px', fontWeight: 'bold' } }, 
                    `${playersInQueue.length} / 4 ${t.players}`
                ),
                React.createElement('div', { style: { fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' } },
                    `${elapsedTime} ${t.sec}`
                ),
                // Show inactive warning if any players in queue
                playersInQueue.some(p => !p.isActive) && React.createElement('div', {
                    style: {
                        marginTop: '12px',
                        padding: '8px 12px',
                        background: 'rgba(239,68,68,0.1)',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#ef4444',
                        fontWeight: '600'
                    }
                }, lang === 'ar' ? '■ بعض اللاعبين غير نشطين' : '■ Some players are inactive')
                )
            ,

            // Cancel Button
            React.createElement('button', {
                onClick: onCancel,
                className: 'btn-ghost',
                style: {
                    padding: '12px 32px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#ff4444'
                }
            }, t.cancel),

            // Start with Bots Button (Appears after 15s)
            elapsedTime >= 15 && window.MatchmakingService && typeof window.MatchmakingService.startFullMatchWithBots === 'function' && React.createElement('button', {
                onClick: async () => {
                    try {
                        const roomId = await window.MatchmakingService.startFullMatchWithBots(gameId, playersInQueue);
                        if (roomId) onMatchFound(roomId);
                    } catch (e) { console.error(e); }
                },
                className: 'btn-neon animate-pulse',
                style: {
                    marginTop: '20px',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '900',
                    background: '#10b981',
                    boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
                }
            }, t.startBots)
        );
    };

    window.MatchmakingOverlay = MatchmakingOverlay;
})();
