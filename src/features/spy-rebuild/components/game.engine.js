'use strict';

/* ═══════════════════════════════════════════════════════════════
   WHO IS THE SPY — game.engine.js
   State management · Game logic · Firebase hooks · Room manager
   ═══════════════════════════════════════════════════════════════ */

window.SPY_ENGINE = (function () {

  /* ─────────────────────────────────────────────────────────────
     GLOBAL GAME STATE
  ───────────────────────────────────────────────────────────── */
  var _state = {
    appMode          : null,      /* 'online' | 'offline'          */
    gameMode         : null,      /* 'description' | 'question'    */
    phase            : null,      /* PHASES enum                   */
    players          : [],        /* Array<PlayerObj>              */
    spyIds           : [],        /* Array<playerId>               */
    villagerWord     : null,
    category         : null,
    currentRound     : 0,
    speakerIndex     : 0,         /* index in active players       */
    roundStartIndex  : 0,
    votes            : {},        /* { voterId: targetId }         */
    eliminated       : [],        /* Array<playerId>               */
    winner           : null,      /* 'villagers' | 'spies'         */
    winReason        : null,
    roleRevealCursor : 0,         /* offline: which player is next */
    timerValue       : 0,
    room             : null,      /* online room object            */
    localPlayerId    : null,
    questionPairs    : [],        /* question mode ask/answer pairs */
    freeQAActive     : false
  };

  /* ─────────────────────────────────────────────────────────────
     FIREBASE HOOKS  (replace bodies when integrating Firebase)
  ───────────────────────────────────────────────────────────── */
  var Firebase = {

    _getCollection: function () {
      if (!_state._col) {
        var db = window.db;
        var appId = window.appId || 'pro_spy_v25_final_fix_complete';
        if (db) {
          _state._col = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('spy_rooms');
        }
      }
      return _state._col;
    },

    /* Call once on app start */
    init: function () {
      console.log('[Firebase] integrated via window.db');
    },

    /* Create a new matchmaking / room-code room */
    createRoom: function (roomData, cb) {
      console.log('[Firebase] createRoom', roomData.code);
      var col = this._getCollection();
      if (!col) return cb(new Error('No DB'));
      col.doc(roomData.code).set(roomData)
        .then(function(){ cb(null, roomData); })
        .catch(cb);
    },

    /* Join existing room by code */
    joinRoom: function (code, playerData, password, cb) {
      console.log('[Firebase] joinRoom', code, password ? '(with password)' : '(no password)');
      var col = this._getCollection();
      if (!col) return cb(new Error('No DB'));

      col.doc(code).get().then(function(snap) {
        if (!snap.exists) return cb(new Error('ROOM_NOT_FOUND'));
        var data = snap.data();
        
        // Check password if required
        if (data.hasPassword && data.password !== password) {
          return cb(new Error('WRONG_PASSWORD'));
        }

        var updateObj = {};
        updateObj['players.' + playerData.id] = playerData;
        return col.doc(code).update(updateObj);
      })
      .then(function() { cb(null); })
      .catch(cb);
    },

    _unsubRoom: null,
    /* Real-time listener on a room */
    onRoomChange: function (code, cb) {
      console.log('[Firebase] onRoomChange listen', code);
      var col = this._getCollection();
      if (!col) return;
      if (typeof this._unsubRoom === 'function') this._unsubRoom();
      this._unsubRoom = col.doc(code).onSnapshot(function (snapshot) {
        console.log('[Firebase] Snapshot update for ' + code + ' (exists: ' + snapshot.exists + ')');
        if (snapshot.exists) {
          cb(snapshot.data());
        } else {
          cb(null);
        }
      }, function (err) {
        console.error('[Firebase] Room listener error for ' + code + ':', err);
      });
    },

    /* Push a state delta with 3-player start constraint */
    pushState: function (code, delta, cb) {
      console.log('[Firebase] pushState', code, delta);
      var col = this._getCollection();
      if (!col) return;

      /* Constraint: Minimum 3 players to start game */
      if (delta.status === 'playing') {
        var room = _state.room;
        var pCount = room && room.players ? Object.keys(room.players).length : 0;
        if (pCount < 3) {
          if (cb) cb(new Error('MIN_PLAYERS_3'));
          return;
        }

        /* Assign Roles */
        var players = room.players ? Object.values(room.players) : [];
        var n = players.length;
        var spyCount = window.SPY_CONFIG.SPY_COUNT[n] || 1;
        
        /* Shuffle player IDs for random assignment */
        var ids = players.map(function(p) { return p.id; });
        for (var i = ids.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = ids[i]; ids[i] = ids[j]; ids[j] = t;
        }

        var spyIds = ids.slice(0, spyCount);
        players.forEach(function(p) {
            delta['players.' + p.id + '.role'] = spyIds.indexOf(p.id) !== -1 ? 'spy' : 'villager';
        });

        delta.villagerWord = WordManager.pick(room.category || 'random');
      }

      col.doc(code).update(delta)
        .then(function() { cb && cb(); })
        .catch(function(e) { cb && cb(e); });
    },

    /* Record a single vote */
    submitVote: function (code, voterId, targetId, cb) {
      console.log('[Firebase] submitVote', voterId, '->', targetId);
      var col = this._getCollection();
      if (!col) return;
      var updateObj = {};
      updateObj['votes.' + voterId] = targetId;
      col.doc(code).update(updateObj)
        .then(function() { cb && cb(); })
        .catch(cb);
    },

    /* Toggle player ready status */
    toggleReady: function (code, playerId, isReady, cb) {
      console.log('[Firebase] toggleReady', code, playerId, isReady);
      var col = this._getCollection();
      if (!col) return cb && cb(new Error('No DB'));
      var updateObj = {};
      updateObj['players.' + playerId + '.isReady'] = isReady;
      col.doc(code).update(updateObj)
        .then(function() { cb && cb(null); })
        .catch(cb);
    },

    /* Mark player as confirmed role */
    confirmRole: function (code, playerId, cb) {
      console.log('[Firebase] confirmRole', code, playerId);
      var col = this._getCollection();
      if (!col) return cb && cb();
      var updateObj = {};
      updateObj['players.' + playerId + '.isConfirmed'] = true;
      col.doc(code).update(updateObj)
        .then(function() { cb && cb(null); })
        .catch(cb);
    },

    /* Find an open room for quick-match */
    quickMatch: function (gameMode, cb) {
      console.log('[Firebase] quickMatch mode=', gameMode);
      var col = this._getCollection();
      if (!col) return cb(new Error('No DB'));
      col.where('status', '==', 'waiting')
         .limit(1).get()
         .then(function(snap) {
           if (!snap.empty) {
             cb(null, snap.docs[0].data());
           } else {
             cb(null, null);
           }
         }).catch(cb);
    },

    /* Remove player from room + Cleanup if empty + Host Migration (FIX-005) */
    leaveRoom: function (code, playerId, cb) {
      console.log('[Firebase] leaveRoom', code, playerId);
      var col = this._getCollection();
      if (!col) return cb && cb();
      
      if (playerId === _state.localPlayerId && typeof this._unsubRoom === 'function') {
         this._unsubRoom();
         this._unsubRoom = null;
      }
      
      var room = _state.room;
      var players = room && room.players ? Object.values(room.players) : [];
      var remaining = players.filter(function(p) { return p.id !== playerId; });
      
      /* 1. If no one else is left → Delete room */
      if (remaining.length === 0) {
          this.deleteRoom(code, cb);
          return;
      }

      var updateObj = {};
      
      /* 2. If the leaving player is the Host → Migrate leadership */
      if (room && room.hostId === playerId) {
          var newHost = remaining[0];
          updateObj.hostId = newHost.id;
          updateObj['players.' + newHost.id + '.isHost'] = true;
          console.log('[Firebase] Host migrated to:', newHost.id);
          
          /* Append system message about migration */
          if (window.firebase && firebase.firestore && firebase.firestore.FieldValue) {
              updateObj.chat = firebase.firestore.FieldValue.arrayUnion({
                  text: (newHost.name || 'A player') + (window.currentLang === 'ar' ? ' هو القائد الجديد للغرفة' : ' is now the host'),
                  type: 'system',
                  at: Date.now()
              });
          }
      }

      /* 3. Remove the player */
      if (window.firebase && firebase.firestore && firebase.firestore.FieldValue) {
        updateObj['players.' + playerId] = firebase.firestore.FieldValue.delete();
      } else {
        updateObj['players.' + playerId] = null;
      }
      
      col.doc(code).update(updateObj)
        .then(function() { cb && cb(); })
        .catch(function() { cb && cb(); });
    },

    /* Explicitly delete an inactive or empty room */
    deleteRoom: function (code, cb) {
      console.log('[Firebase] deleteRoom', code);
      var col = this._getCollection();
      if (!col) return cb && cb();
      col.doc(code).delete()
        .then(function() { cb && cb(); })
        .catch(function() { cb && cb(); });
    },

    /* Generate a short room code */
    genCode: function () {
      var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      var code = '';
      for (var i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    },

    /* Generate a simple guest ID */
    genId: function () {
      return 'uid_' + Date.now() + '_' + Math.floor(Math.random() * 9999);
    },

    /* Send a chat message to the room's chat array */
    sendChat: function (msg, cb) {
      console.log('[Firebase] sendChat', msg);
      var col = this._getCollection();
      var code = _state.roomId;
      if (!col || !code) return;

      var updateObj = {};
      if (window.firebase && firebase.firestore && firebase.firestore.FieldValue) {
        updateObj.chat = firebase.firestore.FieldValue.arrayUnion({
          uid: _state.localPlayerId,
          name: _state.userData ? (_state.userData.displayName || 'Guest') : 'Guest',
          text: msg,
          type: 'user',
          at: Date.now()
        });
      } else {
        /* Fallback for local testing or cases where FieldValue is not found */
        var room = _state.room || {};
        var chat = room.chat || [];
        chat.push({
          uid: _state.localPlayerId,
          name: 'Guest',
          text: msg,
          type: 'user',
          at: Date.now()
        });
        updateObj.chat = chat;
      }

      col.doc(code).update(updateObj)
        .then(function() { cb && cb(null); })
        .catch(function(e){ cb && cb(e); });
    },

    /* Send a system message to the room's chat array */
    sendSystemMessage: function (text, cb) {
      console.log('[Firebase] sendSystemMessage', text);
      var col = this._getCollection();
      var code = _state.roomId;
      if (!col || !code) return;

      var updateObj = {};
      if (window.firebase && firebase.firestore && firebase.firestore.FieldValue) {
        updateObj.chat = firebase.firestore.FieldValue.arrayUnion({
          text: text,
          type: 'system',
          at: Date.now()
        });
      } else {
        /* Fallback */
        var room = _state.room || {};
        var chat = room.chat || [];
        chat.push({
          text: text,
          type: 'system',
          at: Date.now()
        });
        updateObj.chat = chat;
      }

      col.doc(code).update(updateObj)
        .then(function() { cb && cb(null); })
        .catch(function(e){ cb && cb(e); });
    }
  };

  /* ─────────────────────────────────────────────────────────────
     WORD MANAGER
  ───────────────────────────────────────────────────────────── */
  var WordManager = {

    _all: null,

    _getAll: function () {
      if (this._all) return this._all;
      var cats = window.SPY_CONFIG.CATEGORIES;
      var pool = [];
      Object.keys(cats).forEach(function (k) {
        if (k !== 'random') pool = pool.concat(cats[k].words);
      });
      this._all = pool;
      return pool;
    },

    pick: function (category) {
      var pool;
      if (category === 'random') {
        pool = this._getAll();
      } else {
        var cat = window.SPY_CONFIG.CATEGORIES[category];
        pool = cat ? cat.words : this._getAll();
      }
      return pool[Math.floor(Math.random() * pool.length)];
    },

    /* 6 options for the spy-guess screen, including the correct word */
    guessOptions: function (correct, category, n) {
      n = n || 6;
      var pool;
      if (category === 'random') {
        pool = this._getAll().slice();
      } else {
        var cat = window.SPY_CONFIG.CATEGORIES[category];
        pool = cat ? cat.words.slice() : this._getAll().slice();
      }
      pool = pool.filter(function (w) { return w !== correct; });
      pool = WordManager.shuffle(pool).slice(0, n - 1);
      pool.push(correct);
      return WordManager.shuffle(pool);
    },

    shuffle: function (arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }
  };

  /* ─────────────────────────────────────────────────────────────
     ROOM MANAGER  (online)
  ───────────────────────────────────────────────────────────── */
  var RoomManager = {

    createRoom: function (opts) {
      var playerId = (opts.profile && opts.profile.uid) ? opts.profile.uid : Firebase.genId();
      var code     = Firebase.genCode();

      var room = {
        code       : code,
        hostId     : playerId,
        gameMode   : opts.gameMode,
        maxPlayers : opts.maxPlayers || 8,
        hasPassword: opts.hasPassword || false,
        password   : opts.password   || null,
        status     : 'waiting',
        players    : {},
        createdAt  : Date.now()
      };

      room.players[playerId] = {
        id          : playerId,
        name        : opts.playerName || (opts.profile && opts.profile.playerName) || 'Player',
        avatarIndex : opts.avatarIndex || 0,
        photoURL    : (opts.profile && opts.profile.photoURL) || null,
        equipped    : (opts.profile && opts.profile.equipped) || null,
        isHost      : true,
        isReady     : false,
        joinedAt    : Date.now()
      };

      _state.room          = room;
      _state.localPlayerId = playerId;
      _state.appMode       = 'online';

      // Save room ID for reconnection
      localStorage.setItem('last_spy_room_id', code);

      Firebase.createRoom(room, function (err) {
        if (err) { opts.onError && opts.onError(err); return; }
        // ✅ FIX: Call onSuccess only AFTER the first Firestore snapshot arrives
        // so that _state.room is guaranteed to be populated.
        var successFired = false;
        Firebase.onRoomChange(code, function (roomData) {
          RoomManager._onRoomUpdate(roomData);
          if (!successFired) {
            successFired = true;
            RoomManager.startPresenceInterval(code, playerId);
            opts.onSuccess && opts.onSuccess(room);
          }
        });
      });
    },

    resumeGame: function(opts) {
        if (!opts.code) return;
        _state.appMode = 'online';
        RoomManager.joinRoom(opts);
    },

    _presenceInterval: null,
    startPresenceInterval: function(code, uid) {
        this.stopPresenceInterval();
        this._presenceInterval = setInterval(function() {
            var now = Date.now();
            
            // Auto-Sweep: Maintain room health
            var room = _state.room;
            if (room && room.players) {
                if (room.hostId === uid) {
                    // Host sweeps AFK players
                    Object.values(room.players).forEach(function(p) {
                        if (p.id !== uid && p.lastSeen && (now - p.lastSeen > 90000)) {
                            console.warn('[GC] Auto-kicking AFK player:', p.name);
                            Firebase.leaveRoom(code, p.id, function(){});
                        }
                    });
                } else {
                    // Guests check if Host is AFK
                    var host = room.players[room.hostId];
                    if (host && host.lastSeen && (now - host.lastSeen > 95000)) {
                        console.warn('[GC] Host is AFK. Forcing host migration.');
                        Firebase.leaveRoom(code, room.hostId, function(){});
                    }
                }
            }

            Firebase.pushState(code, {
                ['players.' + uid + '.lastSeen']: now,
                ['players.' + uid + '.isAFK']: document.hidden || false
            });
        }, 30000);
    },

    stopPresenceInterval: function() {
        if (this._presenceInterval) {
            clearInterval(this._presenceInterval);
            this._presenceInterval = null;
        }
    },

    joinRoom: function (opts) {
      var playerId = (opts.profile && opts.profile.uid) ? opts.profile.uid : Firebase.genId();
      var player   = {
        id          : playerId,
        name        : opts.playerName || (opts.profile && opts.profile.playerName) || 'Player',
        avatarIndex : opts.avatarIndex || 0,
        photoURL    : (opts.profile && opts.profile.photoURL) || null,
        equipped    : (opts.profile && opts.profile.equipped) || null,
        isHost      : false,
        isReady     : false,
        joinedAt    : Date.now()
      };

      _state.localPlayerId = playerId;
      _state.appMode       = 'online';
      
      // Save room ID for reconnection
      localStorage.setItem('last_spy_room_id', opts.code);

      Firebase.joinRoom(opts.code, player, opts.password, function (err) {
        if (err) { opts.onError && opts.onError(err); return; }
        // ✅ FIX: Call onSuccess only AFTER the first Firestore snapshot arrives
        // so that _state.room is guaranteed to be populated.
        var successFired = false;
        Firebase.onRoomChange(opts.code, function (roomData) {
          console.log('[RoomManager] Snapshot arrived, successFired=' + successFired);
          RoomManager._onRoomUpdate(roomData);
          if (!successFired) {
            successFired = true;
            RoomManager.startPresenceInterval(opts.code, playerId);
            console.log('[RoomManager] Joining completed, firing onSuccess');
            opts.onSuccess && opts.onSuccess(player);
          }
        });
      });
    },

    quickMatch: function (opts) {
      Firebase.quickMatch(opts.gameMode, function (err, room) {
        // ✅ FIX: Propagate query errors — don't silently create a room on DB failure
        if (err) {
          console.error('[RoomManager.quickMatch] Firebase query failed:', err);
          opts.onError && opts.onError(err);
          return;
        }

        if (room) {
          // Found an existing waiting room — try to join it
          var joinOpts = Object.assign({}, opts, {
            code: room.code,
            onError: function (joinErr) {
              // ✅ FIX: If join fails (race condition — room was taken/deleted),
              // fall back to creating a new room instead of showing an error
              console.warn('[RoomManager.quickMatch] Join failed, creating new room:', joinErr);
              RoomManager.createRoom(opts);
            }
          });
          RoomManager.joinRoom(joinOpts);
        } else {
          // No waiting rooms found — create a new one
          RoomManager.createRoom(opts);
        }
      });
    },

    leaveRoom: function () {
      if (!_state.room || !_state.localPlayerId) return;
      var code = _state.room.code;
      var playerId = _state.localPlayerId;
      var room = _state.room;
      
      this.stopPresenceInterval();
      localStorage.removeItem('last_spy_room_id');

      // Delegate to Firebase layer which handles Host Migration or Room Deletion (FIX-005)
      Firebase.leaveRoom(code, playerId, function () {});

      // ✅ Clear local state AFTER notifying Firebase
      _state.room = null;
      _state.localPlayerId = null;
    },
    
    _onRoomUpdate: function (roomData) {
      _state.room = roomData;
      if (window.SPY_UI && window.SPY_UI.onRoomUpdate) {
        SPY_UI.onRoomUpdate(roomData);
      }
    }
  };



  /* ─────────────────────────────────────────────────────────────
     OFFLINE GAME ENGINE
  ───────────────────────────────────────────────────────────── */
  var OfflineEngine = {

    setup: function (cfg) {
      /* cfg: { playerCount, gameMode, category } */
      var CFG      = window.SPY_CONFIG;
      var n        = cfg.playerCount;
      var spyCount = CFG.SPY_COUNT[n] || 1;
      var word     = WordManager.pick(cfg.category);

      /* Build players */
      var players  = [];
      for (var i = 0; i < n; i++) {
        players.push({
          id         : i + 1,
          name       : 'Player ' + (i + 1),
          number     : i + 1,
          role       : CFG.ROLES.VILLAGER,
          isEliminated: false,
          votes      : 0
        });
      }

      /* Assign spies */
      var indices = WordManager.shuffle(
        Array.from({ length: n }, function (_, k) { return k; })
      ).slice(0, spyCount);

      var spyIds = [];
      indices.forEach(function (idx) {
        players[idx].role = CFG.ROLES.SPY;
        spyIds.push(players[idx].id);
      });

      /* Random first speaker */
      var start = Math.floor(Math.random() * n);

      _state.appMode          = 'offline';
      _state.gameMode         = cfg.gameMode;
      _state.players          = players;
      _state.spyIds           = spyIds;
      _state.villagerWord     = word;
      _state.category         = cfg.category;
      _state.currentRound     = 1;
      _state.speakerIndex     = start;
      _state.roundStartIndex  = start;
      _state.votes            = {};
      _state.eliminated       = [];
      _state.winner           = null;
      _state.winReason        = null;
      _state.roleRevealCursor = 0;
      _state.phase            = CFG.PHASES.ROLE_REVEAL;
      _state.questionPairs    = [];
      _state.freeQAActive     = false;

      return _state;
    },

    activePlayers: function () {
      var players = (_state.appMode === 'online' && _state.room)
        ? Object.values(_state.room.players || {}).sort(function(a,b) { return (a.joinedAt || 0) - (b.joinedAt || 0); })
        : _state.players;
      
      var filtered = players.filter(function (p) { return !p.isEliminated; });
      
      /* Safety fallback: ensure every player has a number for the UI */
      filtered.forEach(function(p, i) {
          p.number = i + 1; // Always re-assign based on active list to keep 1..N
      });
      
      return filtered;
    },

    activeSpeaker: function () {
      var active = OfflineEngine.activePlayers();
      if (!active.length) return null;
      var idx = (_state.appMode === 'online' && _state.room)
        ? (_state.room.speakerIndex || 0)
        : (_state.speakerIndex || 0);
      return active[idx % active.length];
    },

    advanceSpeaker: function () {
      var active = OfflineEngine.activePlayers();
      if (!active.length) return;
      _state.speakerIndex = (_state.speakerIndex + 1) % active.length;
    },

    hasCompletedRound: function () {
      var active = OfflineEngine.activePlayers();
      /* Round complete when every active player has spoken */
      return _state.speakerIndex % active.length === _state.roundStartIndex % active.length
          && _state.speakerIndex !== _state.roundStartIndex;
    },

    castVote: function (voterId, targetId) {
      _state.votes[voterId] = targetId;
    },

    processVotes: function () {
      var counts = {};
      Object.keys(_state.votes).forEach(function (vid) {
        var t = _state.votes[vid];
        counts[t] = (counts[t] || 0) + 1;
      });

      var max  = 0;
      var tops = [];
      Object.keys(counts).forEach(function (pid) {
        if (counts[pid] > max)  { max = counts[pid]; tops = [+pid]; }
        else if (counts[pid] === max) { tops.push(+pid); }
      });

      return { counts: counts, max: max, candidates: tops, isTie: tops.length > 1 };
    },

    eliminate: function (playerId) {
      _state.players.forEach(function (p) {
        if (p.id === playerId) { p.isEliminated = true; }
      });
      _state.eliminated.push(playerId);
    },

    checkWin: function () {
      var CFG     = window.SPY_CONFIG;
      var active  = OfflineEngine.activePlayers();
      var spies   = active.filter(function (p) { return p.role === CFG.ROLES.SPY; });
      var village = active.filter(function (p) { return p.role === CFG.ROLES.VILLAGER; });

      if (spies.length === 0) {
        return { winner: 'villagers', reason: 'all_spies_eliminated' };
      }
      if (active.length <= 2) {
        return { winner: 'spies', reason: 'survived_to_final' };
      }
      if (spies.length >= village.length) {
        return { winner: 'spies', reason: 'outnumbered' };
      }
      return null;
    },

    spyGuess: function (guess) {
      if (guess === _state.villagerWord) {
        return { winner: 'spies', reason: 'correct_guess' };
      }
      return { winner: 'villagers', reason: 'wrong_guess' };
    },

    nextRound: function () {
      _state.currentRound++;
      _state.votes            = {};
      _state.roundStartIndex  = _state.speakerIndex;
      _state.phase            = window.SPY_CONFIG.PHASES.SPEAKING;
    }
  };

  /* ─────────────────────────────────────────────────────────────
     TIMER
  ───────────────────────────────────────────────────────────── */
  var Timer = {
    _handle  : null,
    _onTick  : null,
    _onDone  : null,

    start: function (secs, onTick, onDone) {
      Timer.stop();
      _state.timerValue = secs;
      Timer._onTick = onTick;
      Timer._onDone = onDone;

      Timer._handle = setInterval(function () {
        _state.timerValue = Math.max(0, _state.timerValue - 1);
        Timer._onTick && Timer._onTick(_state.timerValue);
        if (_state.timerValue <= 0) {
          Timer.stop();
          Timer._onDone && Timer._onDone();
        }
      }, 1000);
    },

    stop: function () {
      if (Timer._handle) {
        clearInterval(Timer._handle);
        Timer._handle = null;
      }
    },

    value: function () { return _state.timerValue; }
  };

  /* ─────────────────────────────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────────────────────────────── */
  return {
    /* State accessors */
    state          : function ()      { 
      if (_state.appMode === 'online' && _state.room) {
        /* Sync critical room props to top-level for UI compatibility */
        _state.currentRound = _state.room.currentRound || _state.currentRound || 1;
        _state.gameMode = _state.room.gameMode || _state.gameMode;
        _state.phase = _state.room.phase || _state.phase;
        _state.spyIds = _state.room.spyIds || _state.spyIds;
        _state.villagerWord = _state.room.villagerWord || _state.villagerWord;
        _state.speakerIndex = (_state.room.speakerIndex !== undefined) ? _state.room.speakerIndex : _state.speakerIndex;
      }
      return _state; 
    },
    set            : function (k, v)  { _state[k] = v; },

    /* Sub-systems */
    Firebase       : Firebase,
    WordManager    : WordManager,
    RoomManager    : RoomManager,
    OfflineEngine  : OfflineEngine,
    Timer          : Timer,

    /* Bootstrap */
    init: function () {
      Firebase.init();
      /* Pre-compute random word pool */
      var cats = window.SPY_CONFIG.CATEGORIES;
      var pool = [];
      Object.keys(cats).forEach(function (k) {
        if (k !== 'random') pool = pool.concat(cats[k].words);
      });
      cats.random.words = pool;
      console.log('[SPY_ENGINE] ready — v' + window.SPY_CONFIG.VERSION);
    }
  };

}());
