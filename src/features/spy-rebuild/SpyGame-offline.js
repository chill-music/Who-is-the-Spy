(function() {
  'use strict';

  const { state } = window.SpyGameCore;

  /**
   * OFFLINE STATE MANAGER (window.SpyGameCore.offline)
   */
  window.SpyGameCore.offline = {
    // Local State (Single Device)
    game: {
        players: [],
        category: null,
        difficulty: 'medium',
        villagerWord: null,
        spyWord: null,
        currentDistributeIdx: 0,
        timer: 0,
        accusedUid: null,
        winner: null,
        status: 'IDLE' 
    },

    /**
     * Start a new offline game
     */
    initGame: function(playerNames, categoryKey, difficulty) {
      const { shuffle, pickByDifficulty, WORD_BANK } = state;
      const words = WORD_BANK[categoryKey] || WORD_BANK.animals;
      const pair = pickByDifficulty(words, difficulty);
      
      let players = playerNames.map(name => ({
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        role: 'VILLAGER'
      }));
      
      players = shuffle(players);
      players[0].role = 'SPY';
      
      this.game = {
        players: shuffle(players),
        category: categoryKey,
        difficulty: difficulty,
        villagerWord: pair.word_en,
        spyWord: pair.decoy_en,
        currentDistributeIdx: 0,
        timer: state.GAME_CONFIG.DEFAULT_TIMER,
        accusedUid: null,
        winner: null,
        status: 'DISTRIBUTING'
      };

      window.SpyGameCore.navigate('OFFLINE_PLAY');
    },

    acknowledgeWord: function() {
        if (this.game.currentDistributeIdx < this.game.players.length - 1) {
            this.game.currentDistributeIdx++;
        } else {
            this.game.status = 'DISCUSSING';
        }
    },

    submitVote: function(uid) {
        this.game.accusedUid = uid;
        const accused = this.game.players.find(p => p.id === uid);
        this.game.winner = (accused.role === 'SPY') ? 'VILLAGERS' : 'SPY';
        this.game.status = 'REVEALING';
    },

    getWordForPlayer: function(player) {
        return player.role === 'SPY' ? this.game.spyWord : this.game.villagerWord;
    }
  };

  /**
   * UI COMPONENTS (Offline Mode)
   */
  const { React } = window;
  const { components } = window.SpyGameCore;

  /**
   * 1. OFFLINE SETUP SCREEN
   */
  window.SpyGameCore.components.OfflineSetupScreen = () => {
    const [players, setPlayers] = React.useState(["", "", ""]);
    const [category, setCategory] = React.useState('animals');
    const [difficulty, setDifficulty] = React.useState('medium');

    const handleStart = () => {
        const validPlayers = players.filter(p => p.trim().length > 0);
        if (validPlayers.length < 3) return alert("Min 3 players required");
        window.SpyGameCore.utils.SoundEngine.playSuccess();
        window.SpyGameCore.offline.initGame(validPlayers, category, difficulty);
    };

    return React.createElement('div', { className: "p-6 max-w-md mx-auto" },
        React.createElement('h2', { className: "text-3xl font-bold mb-8 text-[var(--spy-gold)] uppercase tracking-tight" }, state.t('setup_game')),
        
        React.createElement('div', { className: "space-y-3 mb-8" },
            players.map((p, i) => React.createElement('input', {
                key: i,
                placeholder: `Player Name ${i+1}`,
                value: p,
                onChange: (e) => {
                    const newP = [...players];
                    newP[i] = e.target.value;
                    setPlayers(newP);
                },
                className: "w-full p-5 bg-[var(--spy-card)] border border-[var(--spy-border)] rounded-[1.5rem] focus:border-[var(--spy-gold)] outline-none transition-all text-white font-medium"
            })),
            React.createElement('button', {
                onClick: () => setPlayers([...players, ""]),
                className: "w-full p-4 text-[var(--spy-gold)] border border-dashed border-[var(--spy-gold)] opacity-40 rounded-[1.5rem] hover:opacity-100 transition-opacity font-bold uppercase text-xs tracking-widest"
            }, "+ Add Operator")
        ),

        React.createElement('div', { className: "mb-8 text-left" },
            React.createElement('label', { className: "text-[10px] uppercase tracking-widest text-[var(--spy-muted)] mb-3 block font-bold" }, "Select Intelligence Category"),
            React.createElement('select', {
                value: category,
                onChange: (e) => setCategory(e.target.value),
                className: "w-full p-5 bg-[var(--spy-bg-mid)] border border-[var(--spy-border)] rounded-[1.5rem] outline-none text-white font-bold appearance-none cursor-pointer hover:border-[var(--spy-gold)] transition-colors"
            }, Object.keys(state.WORD_BANK).map(k => React.createElement('option', { key: k, value: k }, k.replace(/_/g, ' ').toUpperCase())))
        ),

        React.createElement('div', { className: "mb-10 text-left" },
            React.createElement('label', { className: "text-[10px] uppercase tracking-widest text-[var(--spy-muted)] mb-3 block font-bold" }, "Tactical Difficulty"),
            React.createElement('div', { className: "flex gap-2" },
                ['easy', 'medium', 'hard'].map(d => React.createElement('button', {
                    key: d,
                    onClick: () => setDifficulty(d),
                    className: `flex-1 py-3 rounded-xl border text-xs font-black uppercase tracking-tighter transition-all ${difficulty === d ? 'bg-[var(--spy-gold)] border-[var(--spy-gold)] text-black shadow-[var(--spy-glow-gold)]' : 'bg-[var(--spy-card)] border-[var(--spy-border)] text-[var(--spy-muted)] hover:border-white'}`
                }, d))
            )
        ),

        React.createElement('button', {
            onClick: handleStart,
            className: "w-full py-6 bg-[var(--spy-gold)] text-black font-black rounded-[2.5rem] shadow-[var(--spy-glow-gold)] active:scale-95 transition-transform uppercase tracking-widest"
        }, "Initiate Briefing")
    );
  };

  /**
   * 2. OFFLINE PLAY SCREEN
   */
  window.SpyGameCore.components.OfflinePlayScreen = () => {
    const offline = window.SpyGameCore.offline;
    const [localStatus, setLocalStatus] = React.useState(offline.game.status);
    const [showWord, setShowWord] = React.useState(false);
    const [accused, setAccused] = React.useState(null);

    const onRevealComplete = () => {
        window.SpyGameCore.utils.SoundEngine.playChime();
        setShowWord(true);
    };

    if (localStatus === 'DISTRIBUTING') {
        const currentPlayer = offline.game.players[offline.game.currentDistributeIdx];
        return React.createElement('div', { className: "flex flex-col items-center justify-center min-h-screen p-6 text-center" },
            React.createElement('div', { className: "mb-16" },
                React.createElement('div', { className: "text-xs text-[var(--spy-muted)] uppercase tracking-[0.4em] mb-4 font-bold" }, "Operator Identification"),
                React.createElement('h2', { className: "text-6xl font-black text-white tracking-tight" }, currentPlayer.name)
            ),
            
            !showWord ? React.createElement(components.HoldToReveal, { onComplete: onRevealComplete })
            : React.createElement('div', { className: "animate-in fade-in slide-in-from-bottom duration-700" },
                React.createElement('div', { className: "text-sm text-[var(--spy-muted)] mb-4 font-bold uppercase tracking-widest" }, "Your Intelligence:"),
                React.createElement('div', { className: "text-6xl font-black text-[var(--spy-gold)]" }, 
                    offline.getWordForPlayer(currentPlayer)
                ),
                React.createElement('button', {
                    onClick: () => {
                        setShowWord(false);
                        offline.acknowledgeWord();
                        setLocalStatus(offline.game.status);
                    },
                    className: "mt-16 px-14 py-5 bg-white text-black font-black rounded-full active:scale-90 transition-transform uppercase tracking-widest text-sm"
                }, "CONFIRMED")
            ),

            React.createElement('div', { className: "mt-auto text-[var(--spy-muted)] text-[10px] uppercase tracking-[0.2em] font-medium opacity-50" }, 
                `Visual Privacy Required`
            )
        );
    }

    if (localStatus === 'DISCUSSING') {
        return React.createElement('div', { className: "flex flex-col items-center justify-center min-h-screen p-6 text-center" },
            React.createElement(components.CountdownRing, { 
                initialSeconds: state.GAME_CONFIG.DEFAULT_TIMER,
                onComplete: () => {
                    offline.game.status = 'VOTING';
                    setLocalStatus('VOTING');
                }
            }),
            React.createElement('h2', { className: "text-4xl font-black mt-12 mb-4 text-white" }, "INFILTRATION ALERT"),
            React.createElement('p', { className: "text-[var(--spy-muted)] font-medium max-w-sm" }, "Analyze all operators. Identify the anomaly before intelligence is leaked."),
            React.createElement('button', {
                onClick: () => { 
                    window.SpyGameCore.utils.SoundEngine.playClick();
                    offline.game.status = 'VOTING'; 
                    setLocalStatus('VOTING'); 
                },
                className: "mt-12 px-12 py-4 bg-[var(--spy-card)] border border-[var(--spy-border)] rounded-full text-xs font-black tracking-widest hover:border-[var(--spy-danger)] transition-all"
            }, "TERMINATE DISCUSSION")
        );
    }

    if (localStatus === 'VOTING') {
        return React.createElement('div', { className: "p-6 max-w-md mx-auto" },
            React.createElement('div', { className: "text-center mb-10" },
                React.createElement('h2', { className: "text-3xl font-black text-[var(--spy-danger)] uppercase tracking-tighter" }, "Execute Elimination"),
                React.createElement('p', { className: "text-sm text-[var(--spy-muted)] mt-2" }, "Select the operator suspected of being the Spy")
            ),
            React.createElement('div', { className: "space-y-4" },
                offline.game.players.map(p => React.createElement(components.PlayerCard, {
                    key: p.id,
                    name: p.name,
                    onClick: () => {
                        window.SpyGameCore.utils.SoundEngine.playFail();
                        setAccused(p);
                        offline.submitVote(p.id);
                        setTimeout(() => setLocalStatus('REVEALING'), 500);
                    }
                }))
            )
        );
    }

    if (localStatus === 'REVEALING') {
        const accused = offline.game.players.find(p => p.id === offline.game.accusedUid);
        const isCorrect = accused.role === 'SPY';

        return React.createElement('div', { className: "flex flex-col items-center justify-center min-h-screen p-6 text-center animate-in zoom-in duration-700" },
            React.createElement('div', { className: `w-32 h-32 rounded-full flex items-center justify-center text-5xl mb-8 ${isCorrect ? 'bg-[rgba(0,212,170,0.1)] text-[var(--spy-teal)]' : 'bg-[rgba(255,77,109,0.1)] text-[var(--spy-danger)]'}` }, 
                isCorrect ? "👤" : "❌"
            ),
            React.createElement('h2', { className: "text-5xl font-black mb-4 tracking-tighter" }, accused.name),
            React.createElement('div', { className: `text-2xl font-bold uppercase tracking-[0.3em] ${isCorrect ? 'text-[var(--spy-teal)]' : 'text-[var(--spy-danger)]'}` }, 
                isCorrect ? "WAS THE SPY" : "WAS INNOCENT"
            ),
            React.createElement('button', {
                onClick: () => {
                    window.SpyGameCore.utils.SoundEngine.playSuccess();
                    setLocalStatus('RESULTS');
                },
                className: "mt-16 px-10 py-4 bg-white text-black font-black rounded-full"
            }, "FINAL REPORT")
        );
    }

    if (localStatus === 'RESULTS') {
        const win = offline.game.winner === 'VILLAGERS';
        return React.createElement('div', { className: "flex flex-col items-center justify-center min-h-screen p-6 text-center" },
            React.createElement('div', { className: "mb-12" },
                React.createElement('div', { className: "text-sm text-[var(--spy-muted)] uppercase tracking-widest font-black mb-2" }, "Mission Outcome"),
                React.createElement('h2', { className: `text-7xl font-black ${win ? 'text-[var(--spy-teal)]' : 'text-[var(--spy-danger)]'}` }, 
                    win ? "SURVIVED" : "COMPROMISED"
                )
            ),
            React.createElement('div', { className: "bg-[var(--spy-card)] p-8 rounded-[2rem] border border-[var(--spy-border)] w-full max-w-sm mb-12" },
                React.createElement('div', { className: "text-xs text-[var(--spy-muted)] uppercase mb-4 font-bold" }, "Intelligence Profile"),
                React.createElement('div', { className: "flex justify-between items-center px-4" },
                    React.createElement('div', { className: "text-left" },
                        React.createElement('div', { className: "text-[10px] text-[var(--spy-muted)] uppercase font-bold" }, "Villager Word"),
                        React.createElement('div', { className: "text-xl font-bold" }, offline.game.villagerWord)
                    ),
                    React.createElement('div', { className: "text-right" },
                        React.createElement('div', { className: "text-[10px] text-[var(--spy-muted)] uppercase font-bold" }, "Spy Word"),
                        React.createElement('div', { className: "text-xl font-bold text-[var(--spy-gold)]" }, offline.game.spyWord)
                    )
                )
            ),
            React.createElement('button', {
                onClick: () => window.SpyGameCore.navigate('HOME'),
                className: "w-full max-w-sm py-6 bg-[var(--spy-gold)] text-black font-black rounded-[2.5rem] shadow-[var(--spy-glow-gold)] uppercase tracking-widest"
            }, "EXIT TO COMMAND")
        );
    }

    return React.createElement('div', { className: "p-20 text-center" }, "Phase: " + localStatus);
  };

})();