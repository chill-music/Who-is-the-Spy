(function() {
  'use strict';

  const { React, ReactDOM } = window;
  const { state } = window.SpyGameCore;

  /**
   * 1. GOOGLE FONTS INJECTION
   */
  const injectFonts = () => {
    if (document.getElementById('spy-game-fonts')) return;
    const link = document.createElement('link');
    link.id = 'spy-game-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  };

  /**
   * 2. SOUND ENGINE (Web Audio API Synth)
   */
  const SoundEngine = (function() {
    let ctx = null;
    const initCtx = () => {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    };

    const playTone = (freq, type, duration, vol = 0.1) => {
      if (!state.soundEnabled()) return;
      initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    };

    return {
      playClick: () => playTone(800, 'sine', 0.1, 0.05),
      playChime: () => {
        playTone(600, 'sine', 0.5, 0.1);
        setTimeout(() => playTone(900, 'sine', 0.5, 0.1), 100);
      },
      playSuccess: () => {
        playTone(500, 'sine', 0.3, 0.1);
        setTimeout(() => playTone(700, 'sine', 0.3, 0.1), 100);
        setTimeout(() => playTone(1000, 'sine', 0.5, 0.1), 200);
      },
      playFail: () => {
        playTone(300, 'triangle', 0.4, 0.1);
        setTimeout(() => playTone(200, 'triangle', 0.4, 0.1), 150);
      },
      playPulse: () => playTone(150, 'sine', 0.8, 0.03),
      playVictory: () => {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.6, 0.1), i * 150));
      }
    };
  })();

  /**
   * T030: Confetti System (Canvas-based)
   */
  const ConfettiSystem = (() => {
    let canvas, ctx, particles = [];
    const colors = ['#F5A623', '#00D4AA', '#FF4D6D', '#7B61FF', '#FFFFFF'];

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height - canvas.height;
            this.size = Math.random() * 8 + 4;
            this.speedX = Math.random() * 3 - 1.5;
            this.speedY = Math.random() * 3 + 2;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 10 - 5;
        }
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.rotation += this.rotationSpeed;
            if (this.y > canvas.height) {
                this.y = -20;
                this.x = Math.random() * canvas.width;
            }
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            ctx.restore();
        }
    }

    return {
        init: (container) => {
            if (canvas) return;
            canvas = document.createElement('canvas');
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '9999';
            container.appendChild(canvas);
            ctx = canvas.getContext('2d');
            window.addEventListener('resize', () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            });
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            for(let i=0; i<100; i++) particles.push(new Particle());
        },
        start: () => {
            const animate = () => {
                if (!canvas) return;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => { p.update(); p.draw(); });
                requestAnimationFrame(animate);
            };
            animate();
            setTimeout(() => {
                if (canvas) { canvas.remove(); canvas = null; particles = []; }
            }, 5000);
        }
    };
  })();


  /**
   * 3. BASE UI COMPONENTS & ROUTER
   */
  const Router = (props) => {
    const { initialRoomCode, onClose } = props;
    const [view, setView] = React.useState(initialRoomCode ? 'ONLINE_LOBBY' : 'HOME');
    const [params, setParams] = React.useState({ roomId: initialRoomCode || null });
    const [isExiting, setIsExiting] = React.useState(false);
    const [showModePicker, setShowModePicker] = React.useState(false);

    React.useEffect(() => {
        window.SpyGameCore.navigate = (newView, newParams) => {
            setIsExiting(true);
            setTimeout(() => {
                setView(newView);
                setParams(newParams || {});
                setIsExiting(false);
                setShowModePicker(false);
                window.scrollTo(0, 0);
            }, 300);
        };
    }, []);

    const renderScreen = () => {
      switch(view) {
        case 'HOME': return React.createElement(window.SpyGameCore.components.HomeScreen, {
            setShowBrowseRooms: props.setShowBrowseRooms || (window.AppUI && window.AppUI.setShowBrowseRooms),
            openModePicker: () => setShowModePicker(true)
        });
        case 'JOIN': return React.createElement(window.SpyGameCore.components.JoinRoomScreen);
        case 'OFFLINE_SETUP': return React.createElement(window.SpyGameCore.components.OfflineSetupScreen);
        case 'OFFLINE_PLAY': return React.createElement(window.SpyGameCore.components.OfflinePlayScreen);
        case 'ONLINE_LOBBY': return React.createElement(window.SpyGameCore.components.OnlineLobbyScreen, { roomId: params.roomId });
        case 'ONLINE_PLAY': return React.createElement(window.SpyGameCore.components.OnlinePlayScreen, { roomId: params.roomId });
        default: return React.createElement('div', { className: "p-10 text-white" }, "Screen Not Implemented: " + view);
      }
    };

    return React.createElement('div', {
      className: `fixed inset-0 z-[100] bg-[#0a0a1a] flex flex-col overflow-y-auto transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`,
      style: { direction: state.currentLang() === 'ar' ? 'rtl' : 'ltr', fontFamily: state.currentLang() === 'ar' ? 'Cairo' : 'Inter' }
    },
      React.createElement('button', {
        onClick: async () => {
          SoundEngine.playClick();
          if (showModePicker) { setShowModePicker(false); return; }
          if (params.roomId) {
              const uid = window.auth?.currentUser?.uid;
              if (uid) await window.SpyGameCore.services.leaveRoom(params.roomId, uid);
          }
          if (onClose) onClose();
          else window.SpyGameCore.navigate('HOME');
        },
        className: "fixed top-6 left-6 z-[110] w-12 h-12 flex items-center justify-center bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-white rounded-2xl transition-all border border-[rgba(255,255,255,0.1)] shadow-2xl backdrop-blur-md active:scale-90"
      }, showModePicker ? "←" : "✕"),
      renderScreen(),
      showModePicker && React.createElement(window.SpyGameCore.components.GameModePickerDialog, {
        onClose: () => setShowModePicker(false)
      })
    );
  };

  /**
   * 4. GLOBAL MOUNT / UNMOUNT
   */
  let root = null;

  window.SpyGame = function() {};
  window.SpyGame.mount = function(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      injectFonts();
      
      // Initialize React Root
      root = ReactDOM.createRoot(container);
      root.render(React.createElement(Router));
    };

 
  window.SpyGame.unmount = function() {
      if (root) {
        root.unmount();
        root = null;
      }
    };

  window.SpyGameRebuild = Router;


  // Expose components/services to Core
  window.SpyGameCore.components = window.SpyGameCore.components || {};
  window.SpyGameCore.services = window.SpyGameCore.services || {};
  window.SpyGameCore.utils = { SoundEngine, ConfettiSystem };
  
  /**
   * T021: HOME SCREEN
   */
  window.SpyGameCore.components.HomeScreen = ({ setShowBrowseRooms, openModePicker }) => {
    const el = React.createElement;
    return el('div', { className: "flex flex-col items-center justify-center min-h-screen p-6 text-center animate-in fade-in duration-500" },
        el('div', { className: "mb-12" },
            el('div', { className: "text-8xl mb-6 drop-shadow-2xl animate-bounce" }, "🕵️"),
            el('h1', { className: "text-4xl font-black tracking-tighter text-white uppercase italic" }, "Who is the Spy?"),
            el('div', { className: "text-[10px] text-[var(--spy-gold)] uppercase tracking-[0.5em] font-black mt-2" }, "Covert Intelligence • Online")
        ),
        el('div', { className: "w-full max-w-xs space-y-4" },
            el('button', {
                onClick: () => { SoundEngine.playClick(); openModePicker && openModePicker(); },
                className: "w-full py-6 bg-[var(--spy-gold)] text-black font-black rounded-3xl uppercase tracking-widest shadow-[var(--spy-glow-gold)] active:scale-95 transition-transform"
            }, "+ Create Game"),
            el('button', {
                onClick: () => { SoundEngine.playClick(); window.SpyGameCore.navigate('JOIN'); },
                className: "w-full py-5 bg-transparent border-2 border-[rgba(255,255,255,0.1)] text-white font-black rounded-3xl uppercase tracking-widest hover:border-[var(--spy-gold)] active:scale-95 transition-transform"
            }, "JOIN OPS"),
            el('div', { className: "grid grid-cols-2 gap-4" },
                el('button', {
                    onClick: () => { SoundEngine.playClick(); window.SpyGameCore.navigate('OFFLINE_SETUP'); },
                    className: "py-4 bg-[var(--spy-card)] text-[var(--spy-muted)] font-black rounded-3xl uppercase tracking-widest text-[10px] active:scale-95 transition-transform"
                }, "🎭 Party Mode"),
                el('button', {
                    onClick: () => { SoundEngine.playClick(); if (setShowBrowseRooms) setShowBrowseRooms(true); },
                    className: "py-4 bg-[var(--spy-card)] text-[var(--spy-muted)] font-black rounded-3xl uppercase tracking-widest text-[10px] active:scale-95 transition-transform"
                }, "🔎 Rooms")
            )
        ),
        el('div', { className: "mt-20 text-[var(--spy-muted)] text-[9px] uppercase tracking-widest font-bold" },
            "v" + (window.PRO_SPY_VERSION || '2.7') + " • Online Ready"
        )
    );
  };


  // High-Fidelity Components
  window.SpyGameCore.components.PlayerCard = ({ name, photoURL, equipped, role, isCurrent, isDead, isVIP, onClick }) => {
    const el = React.createElement;
    const avatarEl = (photoURL && window.AvatarWithFrame)
        ? el(window.AvatarWithFrame, { photoURL, equipped: equipped || {}, size: 'sm', lang: state.currentLang() })
        : el('div', { className: `w-12 h-12 rounded-full flex items-center justify-center text-lg font-black bg-gradient-to-br ${isCurrent ? 'from-[var(--spy-gold)] to-[#FFD700] text-black' : 'from-[#2a2a3a] to-[#1a1a2a] text-white'}` }, (name || '?').charAt(0).toUpperCase());
    return el('div', {
        onClick,
        className: `relative group p-4 rounded-3xl border transition-all duration-300 ${isCurrent ? 'bg-[rgba(245,166,35,0.1)] border-[var(--spy-gold)] shadow-[var(--spy-glow-gold)]' : 'bg-[var(--spy-card)] border-[var(--spy-border)]'} ${isDead ? 'opacity-40 grayscale' : 'hover:border-[var(--spy-muted)] cursor-pointer'}`
    },
        el('div', { className: "flex items-center gap-4" },
            el('div', { style: { flexShrink: 0 } }, avatarEl),
            el('div', { className: "flex-1 min-w-0" },
                el('div', { className: "text-base font-bold truncate" }, name),
                el('div', { className: "text-xs text-[var(--spy-muted)] uppercase tracking-widest" },
                    isDead ? "Eliminated" : (isVIP ? "👑 Host" : "Operator")
                )
            ),
            isCurrent && el('div', { className: "w-2 h-2 rounded-full bg-[var(--spy-teal)] animate-pulse" })
        )
    );
  };

  window.SpyGameCore.components.HoldToReveal = ({ onComplete }) => {
    const [progress, setProgress] = React.useState(0);
    const timerRef = React.useRef(null);
    const start = () => {
        const startTime = Date.now();
        timerRef.current = setInterval(() => {
            const delta = (Date.now() - startTime) / 3000; // 3 seconds hold
            if (delta >= 1) {
                clearInterval(timerRef.current);
                setProgress(1);
                onComplete();
            } else {
                setProgress(delta);
            }
        }, 30);
    };
    const stop = () => {
        clearInterval(timerRef.current);
        setProgress(0);
    };
 
    React.useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);


    return React.createElement('div', {
        className: "relative w-48 h-48 flex items-center justify-center",
        onMouseDown: start, onMouseUp: stop, onMouseLeave: stop,
        onTouchStart: start, onTouchEnd: stop
    },
        React.createElement('svg', { className: "absolute inset-0 w-full h-full -rotate-90" },
            React.createElement('circle', { cx: 24*4, cy: 24*4, r: 85, fill: "none", stroke: "rgba(255,255,255,0.1)", strokeWidth: 8 }),
            React.createElement('circle', { 
                cx: 24*4, cy: 24*4, r: 85, fill: "none", stroke: "var(--spy-gold)", strokeWidth: 8,
                strokeDasharray: 534, strokeDashoffset: 534 - (534 * progress),
                strokeLinecap: "round", className: "transition-all duration-30"
            })
        ),
        React.createElement('div', { className: "text-center z-10 select-none pointer-events-none" },
            React.createElement('div', { className: "text-3xl" }, "🔒"),
            React.createElement('div', { className: "mt-2 text-sm font-bold uppercase tracking-widest text-[var(--spy-gold)]" }, "Hold to Reveal")
        )
    );
  };

  window.SpyGameCore.components.CountdownRing = ({ initialSeconds, onComplete }) => {
    const [seconds, setSeconds] = React.useState(initialSeconds);
    const total = initialSeconds;

    React.useEffect(() => {
        const timer = setInterval(() => {
            setSeconds(s => {
                if (s <= 1) {
                    clearInterval(timer);
                    onComplete && onComplete();
                    return 0;
                }
                if (s <= 10) window.SpyGameCore.utils.SoundEngine.playPulse();
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const progress = seconds / total;
    const dash = 534;

    return React.createElement('div', { className: "relative w-48 h-48 flex items-center justify-center" },
        React.createElement('svg', { className: "absolute inset-0 w-full h-full -rotate-90" },
            React.createElement('circle', { cx: 96, cy: 96, r: 85, fill: "none", stroke: "rgba(255,255,255,0.05)", strokeWidth: 4 }),
            React.createElement('circle', { 
                cx: 96, cy: 96, r: 85, fill: "none", stroke: seconds <= 10 ? "var(--spy-danger)" : "var(--spy-teal)", strokeWidth: 6,
                strokeDasharray: dash, strokeDashoffset: dash - (dash * progress),
                strokeLinecap: "round", className: "transition-all duration-1000 linear"
            })
        ),
        React.createElement('div', { className: "text-center" },
            React.createElement('div', { className: `text-5xl font-black ${seconds <= 10 ? 'text-[var(--spy-danger)] animate-pulse' : 'text-white'}` }, seconds),
            React.createElement('div', { className: "text-[10px] uppercase tracking-widest text-[var(--spy-muted)] mt-1" }, "Seconds Left")
        )
    );
  };

  /**
   * T029: CountUp Animation Helper
   */
  const CountUp = ({ end, duration = 1000 }) => {
    const [count, setCount] = React.useState(0);
    React.useEffect(() => {
        let startTime;
        let active = true;
        const animate = (timestamp) => {
            if (!active) return;
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        return () => { active = false; };
    }, [end]);
    return React.createElement('span', null, count);
  };


  /**
   * T022: ONLINE LOBBY SCREEN
   */
  window.SpyGameCore.components.OnlineLobbyScreen = ({ roomId }) => {
    const { room, players, chatMessages, typingUsers, error } = window.SpyGameCore.online.useRoom(roomId);
    const user = window.auth.currentUser;
    const el = React.createElement;

    React.useEffect(() => {
        if (room && (room.status === 'DISTRIBUTING' || room.status === 'PLAYING')) {
            window.SpyGameCore.navigate('ONLINE_PLAY', { roomId: room.id });
        }
    }, [room?.status, room?.id]);

    if (error) return el('div', { className: "p-20 text-center text-red-500 font-bold" }, "⚠️ " + error);
    if (!room) return el('div', { className: "p-20 text-center animate-pulse text-[var(--spy-gold)]" }, "Establishing Secure Channel...");

    const isHost = room.hostUid === user.uid;
    const categories = state.WORD_BANK ? Object.keys(state.WORD_BANK) : [];

    // Copy room code
    const copyCode = () => { navigator.clipboard?.writeText(room.id); SoundEngine.playChime(); };

    return el('div', { className: "flex flex-col min-h-screen max-w-lg mx-auto" },
        // ── Header ──
        el('div', { className: "text-center pt-20 pb-6 px-6" },
            el('div', { className: "text-[10px] uppercase tracking-[0.4em] text-[var(--spy-muted)] mb-2 font-black" }, "Secure Mission Code"),
            el('button', { onClick: copyCode, className: "text-5xl font-black text-white hover:text-[var(--spy-gold)] transition-colors tracking-widest" }, room.id),
            el('div', { className: "text-[9px] text-[var(--spy-muted)] mt-1" }, "Tap to copy • Share this code")
        ),

        // ── Room type badge ──
        room.isPrivate && el('div', { className: "mx-6 mb-4 py-2 px-4 bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.3)] rounded-2xl text-center text-xs text-purple-400 font-bold" },
            "🔒 Private Room"
        ),

        // ── Host Settings ──
        isHost && el('div', { className: "mx-6 mb-6 animate-in slide-in-from-top duration-500" },
            el('div', { className: "p-4 bg-[var(--spy-card)] border border-[var(--spy-border)] rounded-3xl" },
                el('div', { className: "text-[9px] uppercase tracking-widest text-[var(--spy-gold)] mb-3 font-black" }, "⚙️ Mission Parameters"),
                el('div', { className: "flex gap-3" },
                    el('select', {
                        value: room.category || 'animals',
                        onChange: (e) => window.SpyGameCore.services.updateRoom(roomId, { category: e.target.value }),
                        className: "flex-1 bg-[var(--spy-bg-deep)] text-white text-sm font-bold outline-none rounded-xl p-2 border border-[var(--spy-border)] cursor-pointer"
                    }, categories.map(k => el('option', { key: k, value: k, className: "bg-[#0a0a1a]" }, k.replace(/_/g, ' ').toUpperCase()))),
                    el('select', {
                        value: room.difficulty || 'normal',
                        onChange: (e) => window.SpyGameCore.services.updateRoom(roomId, { difficulty: e.target.value }),
                        className: "bg-[var(--spy-bg-deep)] text-white text-sm font-bold outline-none rounded-xl p-2 border border-[var(--spy-border)] cursor-pointer"
                    },
                        el('option', { value: 'easy', className: "bg-[#0a0a1a]" }, 'EASY'),
                        el('option', { value: 'normal', className: "bg-[#0a0a1a]" }, 'NORMAL'),
                        el('option', { value: 'hard', className: "bg-[#0a0a1a]" }, 'HARD')
                    )
                )
            )
        ),

        // ── Players ──
        el('div', { className: "px-6 mb-4" },
            el('div', { className: "text-[9px] uppercase tracking-widest text-[var(--spy-muted)] mb-3 font-black" }, `Operators (${players.length}/12)`),
            el('div', { className: "grid grid-cols-2 gap-3 max-h-[32vh] overflow-y-auto" },
                players.map(p => el(window.SpyGameCore.components.PlayerCard, {
                    key: p.uid || p.id,
                    name: p.name,
                    photoURL: p.photoURL,
                    equipped: p.equipped,
                    isVIP: p.uid === room.hostUid,
                    isCurrent: p.uid === user.uid
                }))
            )
        ),

        // ── Chat ──
        el(window.SpyGameCore.components.InGameChat, {
            roomId, user, chatMessages, typingUsers, compact: false
        }),

        // ── Action ──
        el('div', { className: "px-6 pb-8 pt-4" },
            isHost
                ? el('button', {
                    onClick: () => { SoundEngine.playClick(); window.SpyGameCore.services.startGame(roomId, players); },
                    disabled: players.length < 3,
                    className: `w-full py-6 font-black rounded-[2.5rem] uppercase tracking-widest transition-all active:scale-95 ${
                        players.length >= 3 ? 'bg-[var(--spy-gold)] text-black shadow-[var(--spy-glow-gold)]' : 'bg-[var(--spy-card)] text-[var(--spy-muted)] opacity-50 cursor-not-allowed'
                    }`
                  }, players.length < 3 ? `Awaiting Intel (${players.length}/3 min)` : "🚀 Deploy Mission")
                : el('div', { className: "p-5 bg-[rgba(245,166,35,0.05)] border border-dashed border-[var(--spy-gold)] rounded-[2.5rem] text-center" },
                    el('div', { className: "text-[var(--spy-gold)] font-bold animate-pulse text-sm" }, "⏳ Waiting for host to deploy...")
                  )
        )
    );
  };

  /**
   * T022: ONLINE PLAY SCREEN
   */
  window.SpyGameCore.components.OnlinePlayScreen = ({ roomId }) => {
    const { room, players, myRole, chatMessages, typingUsers, error } = window.SpyGameCore.online.useRoom(roomId);
    const user = window.auth.currentUser;
    const [revealProgress, setRevealProgress] = React.useState(false);
    const [chatVisible, setChatVisible] = React.useState(false);

    if (!room) return null;
    const isHost = room.hostUid === user.uid;

    // Phase: DISTRIBUTING
    if (room.status === 'DISTRIBUTING') {
      return React.createElement('div', { className: "flex flex-col items-center justify-center min-h-screen p-6 text-center" },
          !revealProgress ? React.createElement(window.SpyGameCore.components.HoldToReveal, { onComplete: () => setRevealProgress(true) })
          : React.createElement('div', { className: "animate-in zoom-in duration-500" },
              React.createElement('div', { className: "text-xs text-[var(--spy-muted)] mb-4 font-black uppercase" }, "Your Identity"),
              React.createElement('div', { className: "text-6xl font-black text-[var(--spy-gold)] drop-shadow-xl" }, 
                  myRole ? myRole.word : "Decrypting..."
              ),
              React.createElement('p', { className: "mt-8 text-sm text-[var(--spy-muted)]" }, 
                myRole?.role === 'SPY' ? "You are the SPY. Blend in and don't get caught." : "You are a VILLAGER. Find the anomaly."
              ),
              isHost && React.createElement('button', {
                onClick: () => window.SpyGameCore.services.updateRoom(roomId, { status: 'DISCUSSING' }),
                className: "mt-12 px-12 py-4 bg-white text-black font-black rounded-full"
              }, "READY")
          )
      );
    }

    // Phase: DISCUSSING
    if (room.status === 'DISCUSSING') {
        const isSpy = myRole?.role === 'SPY';
        const el = React.createElement;

        return el('div', { className: "relative flex flex-col min-h-screen" },
            // Spy indicator (only visible to spy)
            isSpy && el('div', { className: "px-6 pt-20" },
                el(window.SpyGameCore.components.SpyRoleIndicator)
            ),
            el('div', { className: "flex flex-col items-center justify-center flex-1 p-6 text-center" },
                el(window.SpyGameCore.components.CountdownRing, {
                    initialSeconds: room.timer || 120,
                    onComplete: () => isHost && window.SpyGameCore.services.updateRoom(roomId, { status: 'VOTING' })
                }),
                el('h2', { className: "text-3xl font-black mt-8 mb-2 text-white" }, "Analyzing Comms"),
                el('p', { className: "text-[var(--spy-muted)] max-w-sm font-medium text-sm" }, isSpy ? "Blend in. Deflect. Survive." : "Expose the mole before the intel drops."),
                el('div', { className: "mt-6 p-3 rounded-2xl text-xs font-black uppercase tracking-widest", style: { background: isSpy ? 'rgba(239,68,68,0.08)' : 'rgba(0,212,170,0.08)', color: isSpy ? 'var(--spy-danger)' : 'var(--spy-teal)', border: isSpy ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(0,212,170,0.2)' } },
                    isSpy ? "Your Word: " + (myRole?.word || '???') : "Your Word: " + (myRole?.word || '???')
                ),
                isHost && el('button', {
                    onClick: () => { SoundEngine.playClick(); window.SpyGameCore.services.updateRoom(roomId, { status: 'VOTING' }); },
                    className: "mt-10 px-10 py-4 bg-[var(--spy-danger)] text-white font-black rounded-full shadow-[var(--spy-glow-danger)] active:scale-95 transition-transform uppercase text-xs tracking-widest"
                }, "TERMINATE DISCUSSION")
            ),
            // Chat toggle button
            !chatVisible && el('button', {
                onClick: () => setChatVisible(true),
                className: "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform",
                style: { background: 'linear-gradient(135deg,var(--spy-gold),#f59e0b)' }
            }, el('span', { className: "text-black text-xl" }, "💬")),
            // Chat panel
            chatVisible && el(window.SpyGameCore.components.InGameChat, {
                roomId, user, chatMessages, typingUsers, compact: true
            }),
            chatVisible && el('button', {
                onClick: () => setChatVisible(false),
                className: "fixed bottom-[calc(env(safe-area-inset-bottom,0px)+12px)] right-4 z-[60] w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] text-white flex items-center justify-center text-xs font-bold"
            }, "✕")
        );
    }

    // Phase: VOTING
    if (room.status === 'VOTING') {
        const votes = room.votes || {};
        const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
        const el = React.createElement;

        return el('div', { className: "p-6 max-w-md mx-auto" },
            el('div', { className: "text-center pt-16 mb-8" },
                el('h2', { className: "text-3xl font-black text-[var(--spy-danger)] uppercase tracking-tighter" }, "Execute Elimination"),
                el('div', { className: "text-[10px] text-[var(--spy-muted)] mt-2 font-black uppercase tracking-widest" },
                    `Votes cast: ${totalVotes} / ${players.length}`
                )
            ),
            el('div', { className: "space-y-4" },
                players.map(p => el('div', { key: p.uid, className: "relative" },
                    el(window.SpyGameCore.components.PlayerCard, {
                        name: p.name,
                        photoURL: p.photoURL,
                        equipped: p.equipped,
                        onClick: () => {
                            window.SpyGameCore.utils.SoundEngine.playFail();
                            window.SpyGameCore.services.submitVote(roomId, p.uid);
                        }
                    }),
                    votes[p.uid] > 0 && el('div', { className: "absolute -top-2 -right-2 w-8 h-8 bg-[var(--spy-danger)] rounded-full flex items-center justify-center text-xs font-black shadow-lg animate-in zoom-in" },
                        votes[p.uid]
                    )
                ))
            ),
            isHost && el('button', {
                onClick: () => {
                    const topVotedId = Object.keys(votes).sort((a,b) => votes[b] - votes[a])[0];
                    if (topVotedId) {
                        window.SpyGameCore.services.updateRoom(roomId, {
                            status: 'REVEALING',
                            accusedUid: topVotedId
                        });
                    }
                },
                className: "mt-10 w-full py-5 bg-[var(--spy-card)] border border-[var(--spy-border)] text-white font-black rounded-[2rem] active:scale-95 transition-transform"
            }, "ANALYZE RESULTS"),
            // Chat available during voting too
            el('div', { style: { marginTop: '2rem' } },
                el(window.SpyGameCore.components.InGameChat, {
                    roomId, user, chatMessages, typingUsers, compact: false
                })
            )
        );
    }

    // Phase: REVEALING
    if (room.status === 'REVEALING') {
        const accused = players.find(p => p.uid === room.accusedUid);
        const isCorrect = room.spyUids?.includes(room.accusedUid);

        return React.createElement('div', { className: "flex flex-col items-center justify-center min-h-screen p-6 text-center" },
            React.createElement('div', { className: `w-32 h-32 rounded-full flex items-center justify-center text-5xl mb-8 ${isCorrect ? 'bg-[rgba(0,212,170,0.1)] text-[var(--spy-teal)] border border-[var(--spy-teal)]' : 'bg-[rgba(255,77,109,0.1)] text-[var(--spy-danger)] border border-[var(--spy-danger)]'}` }, 
                isCorrect ? "🕵️" : "❌"
            ),
            React.createElement('h2', { className: "text-5xl font-black mb-4 tracking-tighter" }, accused?.name || "Target"),
            React.createElement('div', { className: `text-2xl font-bold uppercase tracking-[0.3em] ${isCorrect ? 'text-[var(--spy-teal)]' : 'text-[var(--spy-danger)]'}` }, 
                isCorrect ? "WAS THE SPY" : "WAS INNOCENT"
            ),
            isHost && React.createElement('button', {
                onClick: () => {
                    if (isCorrect) {
                        window.SpyGameCore.services.updateRoom(roomId, { status: 'SPY_GUESSING' });
                    } else {
                        window.SpyGameCore.services.updateRoom(roomId, { status: 'BONUS_VOTE' });
                    }
                },
                className: "mt-16 px-14 py-5 bg-white text-black font-black rounded-full shadow-2xl active:scale-90 transition-transform"
            }, "CONTINUE MISSION")
        );
    }

    // Phase: SPY_GUESSING (New Phase)
    if (room.status === 'SPY_GUESSING') {
        const isCaughtSpy = room.accusedUid === user.uid;
        const [guess, setGuess] = React.useState('');

        return React.createElement('div', { className: "flex flex-col items-center justify-center min-h-screen p-6 text-center" },
            React.createElement(window.SpyGameCore.components.CountdownRing, { 
                initialSeconds: 15,
                onComplete: () => isHost && window.SpyGameCore.services.updateRoom(roomId, { status: 'BONUS_VOTE' })
            }),
            React.createElement('h2', { className: "text-3xl font-black mt-10 mb-4 text-[var(--spy-gold)]" }, isCaughtSpy ? "LAST CHANCE" : "INTERCEPTING..."),
            isCaughtSpy ? React.createElement('div', null,
                React.createElement('p', { className: "text-[var(--spy-muted)] mb-8" }, "Intercept the citizen intel word to steal the victory."),
                React.createElement('input', {
                    value: guess,
                    onChange: (e) => setGuess(e.target.value),
                    placeholder: "ENTER WORD",
                    className: "w-full p-5 bg-[var(--spy-bg-mid)] border border-[var(--spy-gold)] rounded-2xl text-center text-2xl font-black text-white outline-none mb-6 uppercase"
                }),
                React.createElement('button', {
                    onClick: () => window.SpyGameCore.services.submitSpyGuess(roomId, guess),
                    className: "w-full py-5 bg-[var(--spy-gold)] text-black font-black rounded-2xl shadow-[var(--spy-glow-gold)]"
                }, "TRANSMIT")
            ) : React.createElement('div', { className: "p-8 border border-dashed border-[var(--spy-border)] rounded-3xl" },
                React.createElement('div', { className: "text-[var(--spy-muted)] animate-pulse" }, "The Spy is attempting to decrypt the intel word...")
            )
        );
    }

    // Phase: BONUS_VOTE (Most Convincing Clue)
    if (room.status === 'BONUS_VOTE' || room.status === 'SCORING') {
        const convincingVotes = room.convincingClueVotes || {};
        return React.createElement('div', { className: "p-6 max-w-md mx-auto min-h-screen flex flex-col" },
            React.createElement('div', { className: "text-center mb-10" },
                React.createElement('h2', { className: "text-2xl font-black text-[var(--spy-gold)] tracking-widest uppercase" }, "Clue Commendation"),
                React.createElement('p', { className: "text-xs text-[var(--spy-muted)] mt-2" }, "Who provided the most convincing intel this round?")
            ),
            React.createElement('div', { className: "space-y-4 mb-20" },
                players.map(p => React.createElement('div', { 
                    key: p.uid, 
                    onClick: () => window.SpyGameCore.services.submitConvincingClueVote(roomId, p.uid),
                    className: `p-4 rounded-2xl border transition-all ${convincingVotes[user.uid] === p.uid ? 'bg-[var(--spy-gold)] text-black border-[var(--spy-gold)] shadow-[var(--spy-glow-gold)]' : 'bg-[var(--spy-card)] border-[var(--spy-border)] text-white'}` 
                }, 
                    React.createElement('div', { className: "flex justify-between items-center" },
                        React.createElement('span', { className: "font-bold text-lg" }, p.name),
                        convincingVotes[user.uid] === p.uid && React.createElement('span', null, "✓")
                    )
                ))
            ),
            isHost && React.createElement('button', {
                onClick: () => window.SpyGameCore.services.calculateAndWriteScores(roomId),
                className: "mt-auto w-full py-6 bg-white text-black font-black rounded-full"
            }, room.status === 'SCORING' ? "CALCULATING..." : "GENERATE DOSSIER")
        );
    }

    // Phase: RESULTS (Round Summary)
    if (room.status === 'RESULTS') {
        const lastRound = room.rounds ? room.rounds[room.rounds.length - 1] : null;
        const currentScore = room.scores ? room.scores[user.uid] : 0;
        const delta = lastRound && lastRound.results ? lastRound.results[user.uid] : 0;

        return React.createElement('div', { className: "flex flex-col items-center justify-center min-h-screen p-6 text-center animate-in fade-in duration-700" },
            React.createElement('div', { className: "mb-10" },
                React.createElement('div', { className: "text-[10px] text-[var(--spy-muted)] uppercase tracking-[0.4em] font-black mb-2" }, "Mission Result"),
                React.createElement('h2', { className: `text-6xl font-black ${lastRound?.isSpyCaught && !lastRound?.spyGuessedCorrectly ? 'text-[var(--spy-teal)]' : 'text-[var(--spy-danger)]'}` }, 
                    lastRound?.isSpyCaught ? (lastRound?.spyGuessedCorrectly ? "STEAL" : "CAUGHT") : "ESCAPED"
                )
            ),
            
            React.createElement('div', { className: "grid grid-cols-2 gap-4 w-full max-w-sm mb-10" },
                React.createElement('div', { className: "bg-[var(--spy-card)] p-6 rounded-3xl border border-[var(--spy-border)]" },
                    React.createElement('div', { className: "text-[10px] text-[var(--spy-muted)] uppercase font-bold mb-1" }, "Points Gained"),
                    React.createElement('div', { className: "text-3xl font-black text-[var(--spy-gold)]" }, delta > 0 ? `+${delta}` : delta)
                ),
                React.createElement('div', { className: "bg-[var(--spy-card)] p-6 rounded-3xl border border-[var(--spy-border)]" },
                    React.createElement('div', { className: "text-[10px] text-[var(--spy-muted)] uppercase font-bold mb-1" }, "Total Score"),
                    React.createElement('div', { className: "text-3xl font-black text-white" }, currentScore)
                )
            ),

            React.createElement('div', { className: "space-y-4 w-full max-w-sm" },
                React.createElement('button', {
                    onClick: () => window.SpyGameCore.services.updateRoom(roomId, { status: 'LOBBY' }),
                    className: "w-full py-6 bg-[var(--spy-gold)] text-black font-black rounded-[2rem] uppercase tracking-widest active:scale-95 transition-transform"
                }, "NEXT MISSION"),
                React.createElement('button', {
                    onClick: () => window.SpyGameCore.services.updateRoom(roomId, { status: 'FINAL_LEADERBOARD' }),
                    className: "w-full py-5 bg-[rgba(255,255,255,0.05)] text-white border border-[var(--spy-border)] font-black rounded-[2rem] uppercase tracking-widest active:scale-95 transition-transform"
                }, "END COMMAND")
            )
        );
    }

    // Phase: FINAL_LEADERBOARD (Premium Final Screen)
    if (room.status === 'FINAL_LEADERBOARD') {
        const sortedPlayers = [...players].sort((a,b) => (room.scores[b.uid] || 0) - (room.scores[a.uid] || 0));
        const winner = sortedPlayers[0];
        
        React.useEffect(() => {
            if (winner.uid === user.uid) {
                ConfettiSystem.init(document.body);
                ConfettiSystem.start();
                utils.SoundEngine.playVictory();
            }
        }, []);

        return React.createElement('div', { className: "p-6 max-w-md mx-auto min-h-screen flex flex-col" },
            React.createElement('div', { className: "text-center mb-12 pt-16 animate-in slide-in-from-top duration-1000" },
                React.createElement('div', { className: "text-[10px] text-[var(--spy-gold)] uppercase tracking-[0.6em] font-black mb-6" }, "Hall of Shadow"),
                winner.uid === user.uid && React.createElement('div', { className: "text-6xl mb-4" }, "👑"),
                React.createElement('h2', { className: "text-4xl font-black text-white uppercase tracking-tighter" }, "Command Performance"),
                React.createElement('p', { className: "text-sm text-[var(--spy-muted)] mt-2" }, "The final intel has been decrypted.")
            ),

            React.createElement('div', { className: "space-y-3 mb-12 flex-1" },
                sortedPlayers.map((p, idx) => React.createElement('div', {
                    key: p.uid,
                    style: { animationDelay: `${idx * 100}ms` },
                    className: `group p-5 rounded-[2rem] border transition-all animate-in slide-in-from-bottom duration-500 fill-mode-backwards ${idx === 0 ? 'bg-[rgba(245,166,35,0.1)] border-[var(--spy-gold)] shadow-[0_0_30px_rgba(245,166,35,0.1)]' : 'bg-[var(--spy-card)] border-[var(--spy-border)]'}`
                },
                    React.createElement('div', { className: "flex items-center gap-4" },
                        React.createElement('div', { className: `w-10 h-10 rounded-full flex items-center justify-center font-black ${idx === 0 ? 'bg-[var(--spy-gold)] text-black' : 'bg-[var(--spy-bg-deep)] text-[var(--spy-muted)]'}` }, idx + 1),
                        React.createElement('div', { className: "flex-1 font-bold text-lg" }, p.name),
                        React.createElement('div', { className: "text-2xl font-black" }, 
                            React.createElement(CountUp, { end: room.scores[p.uid] || 0 })
                        )
                    )
                ))
            ),

            React.createElement('button', {
                onClick: () => window.SpyGameCore.navigate('HOME'),
                className: "py-6 bg-white text-black font-black rounded-full uppercase tracking-widest shadow-2xl active:scale-95 transition-transform"
            }, "RETIRE TO SAFETY")
        );
    }


    return React.createElement('div', { className: "p-20 text-center" }, "Phase: " + room.status);
  };

  /**
   * JOIN SCREEN — with password support
   */
  window.SpyGameCore.components.JoinRoomScreen = () => {
    const [code, setCode] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [needsPassword, setNeedsPassword] = React.useState(false);
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const el = React.createElement;

    const handleJoin = async () => {
        if (code.length < 4) return;
        setLoading(true);
        setError('');
        try {
            await window.SpyGameCore.online.joinAndGo(code, needsPassword ? password : undefined);
        } catch(e) {
            if (e.message === 'WRONG_PASSWORD') {
                setNeedsPassword(true);
                setError('Wrong password. Try again.');
            } else if (e.message && e.message.includes('password')) {
                setNeedsPassword(true);
            } else {
                setError(e.message || 'Join failed');
            }
        } finally { setLoading(false); }
    };

    return el('div', { className: "p-6 flex flex-col items-center justify-center min-h-screen text-center" },
        el('div', { className: "text-6xl mb-6" }, "🔑"),
        el('h2', { className: "text-3xl font-black mb-2 text-[var(--spy-gold)]" }, "Join Mission"),
        el('p', { className: "text-[var(--spy-muted)] text-xs mb-8" }, "Enter your room code to infiltrate"),
        el('input', {
            maxLength: 6, placeholder: "ROOM CODE", value: code,
            onChange: (e) => { setCode(e.target.value.toUpperCase()); setNeedsPassword(false); setError(''); },
            className: "w-full max-w-xs p-5 bg-[var(--spy-card)] border border-[var(--spy-border)] rounded-[2rem] text-3xl text-center font-black text-white focus:border-[var(--spy-gold)] outline-none mb-4 uppercase letterSpacing-widest"
        }),
        needsPassword && el('div', { className: "w-full max-w-xs mb-4 animate-in slide-in-from-top duration-300" },
            el('div', { className: "text-[10px] text-purple-400 font-black uppercase mb-2" }, "🔒 Password Required"),
            el('input', {
                type: "password", placeholder: "Enter Password", value: password,
                onChange: (e) => setPassword(e.target.value),
                className: "w-full p-4 bg-[var(--spy-card)] border border-purple-500/50 rounded-2xl text-center font-bold text-white focus:border-purple-400 outline-none text-lg"
            })
        ),
        error && el('div', { className: "text-red-400 text-xs font-bold mb-4" }, error),
        el('button', {
            onClick: handleJoin, disabled: loading || code.length < 4,
            className: `w-full max-w-xs py-6 font-black rounded-[2.5rem] uppercase tracking-widest transition-all active:scale-95 ${code.length >= 4 ? 'bg-[var(--spy-gold)] text-black shadow-[var(--spy-glow-gold)]' : 'bg-[var(--spy-card)] text-[var(--spy-muted)] opacity-50'}`
        }, loading ? "Connecting..." : "ENTER"),
        el('button', {
            onClick: () => { SoundEngine.playClick(); window.SpyGameCore.navigate('HOME'); },
            className: "mt-8 text-[var(--spy-muted)] uppercase tracking-[0.3em] font-black hover:text-white transition-colors text-xs"
        }, "← BACK")
    );
  };

  // ═══════════════════════════════════════════
  //  GAME MODE PICKER DIALOG
  // ═══════════════════════════════════════════
  window.SpyGameCore.components.GameModePickerDialog = ({ onClose }) => {
    const [showPrivate, setShowPrivate] = React.useState(false);
    const [privatePassword, setPrivatePassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const el = React.createElement;
    const { createAndGo } = window.SpyGameCore.online;

    const handleCreate = async (isPrivate) => {
        setLoading(true);
        SoundEngine.playChime();
        try {
            await createAndGo({ isPrivate, password: isPrivate ? privatePassword : null });
        } catch(e) { alert(e.message); }
        finally { setLoading(false); }
    };

    return el('div', {
        className: "fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200",
        style: { background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' },
        onClick: (e) => { if(e.target === e.currentTarget) onClose(); }
    },
        el('div', {
            className: "w-full max-w-sm animate-in zoom-in-95 duration-300",
            style: { background: 'linear-gradient(145deg,rgba(20,20,40,0.95),rgba(10,10,25,0.98))', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '2.5rem', padding: '2rem', boxShadow: '0 40px 80px rgba(0,0,0,0.8)' }
        },
            el('div', { className: "text-center mb-8" },
                el('div', { className: "text-5xl mb-4" }, "🕵️"),
                el('h2', { className: "text-2xl font-black text-white uppercase tracking-tighter" }, "Choose Your Cover"),
                el('p', { className: "text-[var(--spy-muted)] text-xs mt-2" }, "Select how you want to run this operation")
            ),
            !showPrivate ? el('div', { className: "space-y-4" },
                el('button', {
                    onClick: () => handleCreate(false),
                    disabled: loading,
                    className: "w-full p-6 rounded-3xl text-left transition-all active:scale-95 group",
                    style: { background: 'linear-gradient(135deg,rgba(0,212,170,0.15),rgba(0,212,170,0.05))', border: '1px solid rgba(0,212,170,0.3)' }
                },
                    el('div', { className: "flex items-center gap-4" },
                        el('div', { className: "text-4xl" }, "🌐"),
                        el('div', null,
                            el('div', { className: "text-white font-black text-lg uppercase" }, "Online"),
                            el('div', { className: "text-[var(--spy-muted)] text-xs mt-0.5" }, "Public room — anyone with the code can join")
                        ),
                        el('div', { className: "ml-auto text-[var(--spy-teal)] text-xl" }, "→")
                    )
                ),
                el('button', {
                    onClick: () => setShowPrivate(true),
                    className: "w-full p-6 rounded-3xl text-left transition-all active:scale-95",
                    style: { background: 'linear-gradient(135deg,rgba(168,85,247,0.15),rgba(168,85,247,0.05))', border: '1px solid rgba(168,85,247,0.3)' }
                },
                    el('div', { className: "flex items-center gap-4" },
                        el('div', { className: "text-4xl" }, "🔒"),
                        el('div', null,
                            el('div', { className: "text-white font-black text-lg uppercase" }, "Private"),
                            el('div', { className: "text-[var(--spy-muted)] text-xs mt-0.5" }, "Password-protected — invite only")
                        ),
                        el('div', { className: "ml-auto text-purple-400 text-xl" }, "→")
                    )
                )
            ) : el('div', { className: "animate-in slide-in-from-right duration-300 space-y-4" },
                el('div', { className: "text-[10px] text-purple-400 font-black uppercase mb-2" }, "🔑 Set a Password"),
                el('input', {
                    type: "text", placeholder: "Room Password", value: privatePassword, maxLength: 20,
                    onChange: (e) => setPrivatePassword(e.target.value),
                    className: "w-full p-4 bg-[var(--spy-bg-deep)] border border-purple-500/40 rounded-2xl text-center font-bold text-white focus:border-purple-400 outline-none text-lg mb-2"
                }),
                el('button', {
                    onClick: () => handleCreate(true),
                    disabled: loading || !privatePassword.trim(),
                    className: `w-full py-5 font-black rounded-3xl uppercase tracking-widest active:scale-95 transition-all ${privatePassword.trim() ? 'bg-purple-600 text-white' : 'bg-[var(--spy-card)] text-[var(--spy-muted)] opacity-50'}`
                }, loading ? "Creating..." : "🔒 Create Private Room"),
                el('button', { onClick: () => setShowPrivate(false), className: "w-full text-[var(--spy-muted)] text-xs font-bold hover:text-white" }, "← Back")
            )
        )
    );
  };

  // ═══════════════════════════════════════════
  //  IN-GAME CHAT
  // ═══════════════════════════════════════════
  window.SpyGameCore.components.InGameChat = ({ roomId, user, chatMessages, typingUsers, compact }) => {
    const [msg, setMsg] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(!compact);
    const bottomRef = React.useRef(null);
    const typingTimerRef = React.useRef(null);
    const el = React.createElement;

    React.useEffect(() => {
        if (isOpen && bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages.length, isOpen]);

    const handleTyping = (val) => {
        setMsg(val);
        if (!roomId || !user) return;
        window.SpyGameCore.services.setTyping(roomId, user.uid, true);
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
            window.SpyGameCore.services.setTyping(roomId, user.uid, false);
        }, 4000);
    };

    const sendMsg = () => {
        if (!msg.trim() || !user) return;
        const userData = window._currentUserDataCache || {};
        window.SpyGameCore.services.sendChatMessage(roomId, {
            uid: user.uid, name: user.displayName || 'Agent',
            photoURL: user.photoURL || null, equipped: userData.equipped || null, text: msg
        });
        window.SpyGameCore.services.setTyping(roomId, user.uid, false);
        clearTimeout(typingTimerRef.current);
        setMsg('');
        SoundEngine.playClick();
    };

    const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } };

    const unreadCount = chatMessages.length;

    if (compact && !isOpen) {
        return el('div', {
            onClick: () => setIsOpen(true),
            className: "fixed bottom-24 right-4 z-[50] w-14 h-14 rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-transform shadow-2xl",
            style: { background: 'linear-gradient(135deg,var(--spy-gold),#f59e0b)' }
        },
            el('span', { className: "text-black text-xl" }, "💬"),
            unreadCount > 0 && el('div', {
                className: "absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center"
            }, unreadCount > 9 ? '9+' : unreadCount)
        );
    }

    return el('div', {
        className: compact ? "fixed bottom-0 left-0 right-0 z-[50] animate-in slide-in-from-bottom duration-300" : "mx-6 mb-2",
        style: compact ? { background: 'rgba(10,10,26,0.97)', borderTop: '1px solid rgba(245,166,35,0.15)', paddingBottom: 'env(safe-area-inset-bottom,0)' } : {}
    },
        compact && el('div', { className: "flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)]" },
            el('div', { className: "text-xs font-black text-[var(--spy-gold)] uppercase tracking-widest" }, "💬 Mission Chat"),
            el('button', { onClick: () => setIsOpen(false), className: "text-[var(--spy-muted)] text-lg hover:text-white" }, "✕")
        ),
        el('div', {
            className: compact ? "overflow-y-auto px-4 py-2 space-y-2" : "bg-[var(--spy-card)] border border-[var(--spy-border)] rounded-3xl overflow-hidden",
            style: { maxHeight: compact ? '35vh' : '180px', overflowY: 'auto' }
        },
            !compact && el('div', { className: "px-4 pt-3 pb-1 text-[9px] font-black text-[var(--spy-muted)] uppercase tracking-widest" }, "💬 Mission Chat"),
            chatMessages.length === 0 && el('div', { className: "text-center text-[var(--spy-muted)] text-xs py-4" }, "No messages yet. Say something!"),
            chatMessages.map((m, i) => {
                const isMe = m.uid === user?.uid;
                const avatarEl = (m.photoURL && window.AvatarWithFrame)
                    ? el(window.AvatarWithFrame, { photoURL: m.photoURL, equipped: m.equipped || {}, size: 'xs', lang: state.currentLang() })
                    : el('div', { className: "w-7 h-7 rounded-full flex items-center justify-center text-xs font-black", style: { background: 'rgba(245,166,35,0.2)', color: 'var(--spy-gold)' } }, (m.name || '?').charAt(0));
                return el('div', { key: m.id || i, className: `flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}` },
                    el('div', { style: { flexShrink: 0 } }, avatarEl),
                    el('div', { className: `max-w-[70%] px-3 py-2 rounded-2xl text-sm ${ isMe ? 'bg-[var(--spy-gold)] text-black font-bold rounded-br-none' : 'bg-[rgba(255,255,255,0.08)] text-white rounded-bl-none' }` },
                        !isMe && el('div', { className: "text-[9px] font-black uppercase mb-0.5", style: { color: 'var(--spy-gold)' } }, m.name),
                        el('div', null, m.text)
                    )
                );
            }),
            el('div', { ref: bottomRef })
        ),
        // Typing indicator
        typingUsers.length > 0 && el('div', { className: compact ? "px-4 py-1" : "px-4 py-1 border-t border-[var(--spy-border)]" },
            el('div', { className: "flex items-center gap-2" },
                el('div', { className: "flex gap-1 items-center" },
                    [0,1,2].map(i => el('div', {
                        key: i, className: "w-1.5 h-1.5 rounded-full bg-[var(--spy-gold)]",
                        style: { animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }
                    }))
                ),
                el('span', { className: "text-[10px] text-[var(--spy-muted)] font-bold" },
                    typingUsers.map(u => u.name).join(', ') + ` ${typingUsers.length === 1 ? 'is' : 'are'} typing…`
                )
            )
        ),
        el('div', { className: compact ? "flex items-center gap-2 px-4 py-3" : "flex items-center gap-2 p-3 border-t border-[var(--spy-border)]" },
            el('input', {
                value: msg, onChange: (e) => handleTyping(e.target.value), onKeyDown: handleKey,
                placeholder: "Type a message…", maxLength: 200,
                className: "flex-1 bg-transparent text-white text-sm outline-none placeholder:text-[var(--spy-muted)]"
            }),
            el('button', {
                onClick: sendMsg, disabled: !msg.trim(),
                className: `w-9 h-9 rounded-full flex items-center justify-center transition-all ${ msg.trim() ? 'bg-[var(--spy-gold)] text-black active:scale-90' : 'bg-[rgba(255,255,255,0.05)] text-[var(--spy-muted)]' }`
            }, "↑")
        )
    );
  };

  // ═══════════════════════════════════════════
  //  SPY ROLE INDICATOR
  // ═══════════════════════════════════════════
  window.SpyGameCore.components.SpyRoleIndicator = () => {
    return React.createElement('div', {
        className: "flex items-center justify-center gap-3 py-3 px-6 rounded-3xl mb-6 animate-pulse",
        style: { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.5)', boxShadow: '0 0 30px rgba(239,68,68,0.3)' }
    },
        React.createElement('div', { className: "text-2xl" }, "🕵️"),
        React.createElement('div', null,
            React.createElement('div', { className: "text-red-400 font-black uppercase text-sm tracking-widest" }, "YOU ARE THE SPY"),
            React.createElement('div', { className: "text-red-300/70 text-[9px] font-bold uppercase" }, "Blend in — don't get caught")
        ),
        React.createElement('div', { className: "w-2 h-2 rounded-full bg-red-500 animate-ping" })
    );
  };

})();