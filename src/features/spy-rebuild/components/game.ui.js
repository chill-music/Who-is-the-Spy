'use strict';

/* ═══════════════════════════════════════════════════════════════
   WHO IS THE SPY — game.ui.js
   Screen management · Rendering · Events · Animations
   ═══════════════════════════════════════════════════════════════ */

window.SPY_UI = (function () {
  /* --- INJECTED UI TEMPLATE --- */
  var UI_TEMPLATE = `
<canvas id="bg-canvas"></canvas>
<div class="grid-overlay"></div>

<div id="app">

  <!-- SPLASH ──────────────────────────────────────────────── -->
  <div id="screen-splash" class="screen screen--active">
    <div class="splash-logo">
      <img src="icos/games logos/spylogo.png" class="game-logo-img splash-logo-anim">
      <div class="logo-text">
        <div class="logo-who">WHO</div>
        <div class="logo-is">IS THE</div>
        <div class="logo-spy">SPY</div>
      </div>
      <div class="splash-loading">
        <div class="splash-dot"></div>
        <div class="splash-dot"></div>
        <div class="splash-dot"></div>
      </div>
    </div>
  </div>

  <!-- MAIN MENU ───────────────────────────────────────────── -->
  <div id="screen-main" class="screen">
    <div class="main-hero">
      <img src="icos/games logos/spylogo.png" class="game-logo-img main-hero-anim">
      <div class="main-hero__who">WHO</div>
      <div class="main-hero__is">IS THE</div>
      <div class="main-hero__spy">SPY</div>
      <div class="main-hero__the">— THE GAME —</div>
    </div>
    <div class="main-divider"></div>
    <div class="main-actions">
      <div class="mode-card mode-card--online" id="btn-online" role="button" tabindex="0">
        <div class="mode-card__icon">🌐</div>
        <div class="mode-card__body">
          <div class="mode-card__title">Online Mode</div>
          <div class="mode-card__desc">Play with friends — quick match or private room codes</div>
        </div>
        <div class="mode-card__arrow">›</div>
      </div>
      <div class="mode-card mode-card--offline" id="btn-offline" role="button" tabindex="0">
        <div class="mode-card__icon">📱</div>
        <div class="mode-card__body">
          <div class="mode-card__title">Offline Mode</div>
          <div class="mode-card__desc">Pass the phone — no internet, perfect for parties</div>
        </div>
        <div class="mode-card__arrow">›</div>
      </div>
    </div>
    <div class="main-rules-btn" id="btn-main-rules">📖 View Game Rules</div>
  </div>

  <!-- ONLINE HUB ──────────────────────────────────────────── -->
  <div id="screen-online-hub" class="screen">
    <div class="screen-inner">
      <div class="hub-header">
        <div class="hub-back" id="btn-online-back">‹</div>
        <div><div class="hub-title">Online Mode</div><div class="hub-subtitle">Multiplayer — 4 to 12 players</div></div>
      </div>
      <div class="online-options">
        <div class="online-opt" id="btn-quick-match" role="button" tabindex="0">
          <div class="online-opt__icon">⚡</div>
          <div><div class="online-opt__title">Quick Match</div><div class="online-opt__desc">Auto-match with available rooms instantly</div></div>
          <div class="online-opt__arrow">›</div>
        </div>
        <div class="online-opt" id="btn-create-online" role="button" tabindex="0">
          <div class="online-opt__icon">🏠</div>
          <div><div class="online-opt__title">Create Room</div><div class="online-opt__desc">Set up a private room with a shareable code</div></div>
          <div class="online-opt__arrow">›</div>
        </div>
        <div class="online-opt" id="btn-join-room" role="button" tabindex="0">
          <div class="online-opt__icon">🔑</div>
          <div><div class="online-opt__title">Join Room</div><div class="online-opt__desc">Enter a 6-letter code to join a friend's room</div></div>
          <div class="online-opt__arrow">›</div>
        </div>
      </div>
      <div style="margin-top:auto;padding-top:20px;text-align:center">
        <button class="btn btn--ghost btn--sm" onclick="window.SPY_UI.openRules('characters')">📖 Game Rules</button>
      </div>
    </div>
  </div>

  <!-- JOIN ROOM ───────────────────────────────────────────── -->
  <div id="screen-join-room" class="screen">
    <div class="screen-inner">
      <div class="hub-header">
        <div class="hub-back" id="btn-join-back">‹</div>
        <div><div class="hub-title">Join Room</div><div class="hub-subtitle">Enter the 6-letter room code</div></div>
      </div>
      <div class="join-illustration">🔐</div>
      <p class="join-instruction">Ask the room host for their code and enter it below to join the game.</p>
      <div class="field">
        <div class="field__label">Room Code</div>
        <input class="input input--code" id="input-room-code" placeholder="ABCD12" maxlength="6">
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px">
        <button class="btn btn--primary btn--full" id="btn-join-confirm">JOIN GAME</button>
      </div>
    </div>
  </div>

  <!-- OFFLINE HUB ─────────────────────────────────────────── -->
  <div id="screen-offline-hub" class="screen">
    <div class="offline-hero">
      <div class="spy-figure">🕵️</div>
      <div class="logo-text" style="margin-top:10px">
        <div class="logo-who" style="font-size:13px">WHO IS THE</div>
        <div class="logo-spy" style="font-size:38px">SPY</div>
      </div>
      <div class="offline-badge">Offline Mode</div>
    </div>
    <div class="offline-actions">
      <button class="btn btn--primary btn--full" id="btn-create-offline" style="padding:18px;font-size:14px">CREATE ROOM</button>
      <button class="btn btn--ghost btn--full" id="btn-offline-rules">📖 GAME RULES</button>
      <button class="btn btn--ghost btn--full" id="btn-offline-back" style="opacity:0.5">‹ Back</button>
    </div>
  </div>

  <!-- CREATE ROOM ─────────────────────────────────────────── -->
  <div id="screen-create-room" class="screen">
    <div class="screen-inner">
      <div class="hub-header">
        <div class="hub-back" id="btn-create-back">‹</div>
        <div><div class="hub-title">Create Room</div><div class="hub-subtitle">Configure your game</div></div>
      </div>
      <p class="section-label" style="margin-top:16px">Game Mode</p>
      <div class="mode-tabs">
        <div class="mode-tab mode-tab--active" data-mode="description">Spy – Description</div>
        <div class="mode-tab" data-mode="question">Spy – Question</div>
      </div>
      <p class="section-label">Players</p>
      <div class="player-slider-wrap">
        <div class="player-count-display">
          <span class="player-count-num" id="display-players">6 people</span>
        </div>
        <input type="range" id="slider-players" min="4" max="12" value="6">
      </div>
      <div class="role-preview">
        <div class="role-mini-card role-mini-card--villager">
          <div class="role-mini-card__icon">🏘️</div>
          <div class="role-mini-card__name">Villager</div>
          <div class="role-mini-card__count" id="villager-count">× 5</div>
        </div>
        <div class="role-mini-card role-mini-card--spy">
          <div class="role-mini-card__icon">🕵️</div>
          <div class="role-mini-card__name">Spy</div>
          <div class="role-mini-card__count" id="spy-count">× 1</div>
        </div>
      </div>
      <div id="create-online-fields" style="display:none">
        <div class="toggle-row">
          <span class="toggle-label">🔒 Password Protected</span>
          <label class="toggle-switch">
            <input type="checkbox" id="toggle-password">
            <div class="toggle-track"></div>
          </label>
        </div>
        <div id="pw-field" class="field" style="display:none">
          <div class="field__label">Room Password</div>
          <input class="input" id="input-password" type="password" placeholder="Enter password…">
        </div>
      </div>
      <div class="cat-header">
        <p class="section-label" style="margin:0">Word Category</p>
        <button class="btn btn--ghost btn--sm" id="btn-cat-refresh">🔀 Shuffle</button>
      </div>
      <div class="category-grid" id="category-grid"></div>
      <button class="btn btn--primary btn--full" id="btn-create-confirm" style="margin-bottom:8px">CONFIRM &amp; START</button>
    </div>
  </div>

  <!-- ROOM LOBBY ──────────────────────────────────────────── -->
  <div id="screen-room-lobby" class="screen">
    <div class="screen-inner">
      <div class="hub-header">
        <div class="hub-back" id="btn-lobby-back">✕</div>
        <button class="btn btn--ghost btn--sm" id="btn-lobby-rules">📖 Rules</button>
      </div>
      <div class="lobby-header-card glass-card" style="margin-top:12px">
        <div class="lobby-code-row">
          <div>
            <div class="lobby-code-label">Room Code</div>
            <div class="lobby-code-value" id="lobby-room-code">------</div>
          </div>
          <div style="text-align:right">
            <div class="lobby-mode-badge" id="lobby-game-mode">Description Mode</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:5px" id="lobby-player-count">0 / 8 Players</div>
          </div>
        </div>
      </div>
      <div id="lobby-slots" class="lobby-slots"></div>
      <div class="lobby-chat" id="lobby-chat">
        <span class="system-msg">Waiting for players to join…</span>
      </div>
      <div class="lobby-actions">
        <button class="btn btn--ghost" id="btn-invite" style="flex:1">📤 Invite</button>
        <button class="btn btn--primary" id="btn-start-game" style="flex:2">GET READY</button>
      </div>
    </div>
  </div>

  <!-- ROLE REVEAL ─────────────────────────────────────────── -->
  <div id="screen-role-reveal" class="screen">
    <div id="role-reveal-wrap" style="width:100%;display:flex;align-items:center;justify-content:center;flex:1;padding:20px">
      <!-- rendered by JS -->
    </div>
  </div>

  <!-- GAME SCREEN ─────────────────────────────────────────── -->
  <div id="screen-game" class="screen">
    <div class="game-topbar">
      <div class="game-round-tag" id="game-round">Round 1</div>
      <div class="game-timer-display" id="game-timer">30s</div>
      <div class="game-mode-chip" id="game-mode-tag">Description</div>
    </div>
    <div class="player-ring-wrap">
      <div id="player-ring"></div>
    </div>
    <div class="game-center">
      <div class="game-center-label" id="game-center-label">Get ready…</div>
      <div class="game-center-sub"   id="game-center-sub">Game starting</div>
    </div>
    <div id="game-chat-wrapper" style="width:100%; max-width:var(--screen-max); padding: 0 16px; flex: 1; display: flex; flex-direction: column; justify-content: flex-end;"></div>
    <div class="game-actions" style="margin-top: 10px;">
      <button class="btn btn--danger btn--full" id="btn-start-vote">⚡ Start Vote</button>
    </div>
  </div>

  <!-- VOTING ──────────────────────────────────────────────── -->
  <div id="screen-voting" class="screen">
    <div class="voting-header" style="width:100%;max-width:var(--screen-max)">
      <div class="voting-title" id="voting-title">Who Is The Spy?</div>
      <div class="voting-sub"   id="voting-sub">Vote to eliminate a player</div>
    </div>
    <div class="voter-prompt" id="voter-label" style="width:100%;max-width:var(--screen-max);padding:0 16px"></div>
    <div class="voting-grid" id="voting-grid"></div>
    <div class="vote-result-banner" id="vote-result-banner"></div>
  </div>

  <!-- SPY GUESS ───────────────────────────────────────────── -->
  <div id="screen-spy-guess" class="screen">
    <div class="spy-guess-header">
      <div class="spy-guess-icon">🕵️‍♂️</div>
      <div class="spy-guess-player" id="spy-guess-player">Spy revealed!</div>
      <div class="spy-guess-title">Guess the Word</div>
      <div class="spy-guess-sub"   id="spy-guess-sub">One chance. Choose wisely.</div>
      <div class="spy-guess-timer" id="spy-guess-timer">15s</div>
    </div>
    <div class="spy-guess-grid" id="spy-guess-grid"></div>
  </div>

  <!-- RESULTS ─────────────────────────────────────────────── -->
  <div id="screen-results" class="screen">
    <div class="results-hero">
      <div class="results-title"  id="results-title">Game Over!</div>
      <div class="results-reason" id="results-reason"></div>
    </div>
    <div class="results-players" id="results-players"></div>
    <div class="results-actions" style="width:100%;max-width:var(--screen-max)">
      <button class="btn btn--primary btn--full" id="btn-play-again">PLAY AGAIN</button>
      <button class="btn btn--ghost   btn--full" id="btn-change-settings">⚙ Change Settings</button>
    </div>
  </div>

  <!-- RECONNECT MODAL ────────────────────────────────────── -->
  <div id="modal-reconnect" class="modal">
    <div class="modal-overlay"></div>
    <div class="modal-content glass-card" style="text-align:center;padding:30px">
      <div class="modal-reconnect-icon" style="font-size:50px;margin-bottom:15px">🔄</div>
      <h3 style="margin:0 0 10px;color:var(--text-bright)">Mission Detected</h3>
      <p style="margin:0 0 25px;color:var(--text-muted);font-size:14px;line-height:1.6">
        We found an active game session for you.<br/>Would you like to return to your mission?
      </p>
      <div style="display:flex;flex-direction:column;gap:12px">
        <button class="btn btn--primary btn--full" id="btn-reconnect-join">RETURN TO ROOM</button>
        <button class="btn btn--ghost btn--full" id="btn-reconnect-clear" style="opacity:0.7">START FRESH</button>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════
       MODAL: GAME RULES
  ══════════════════════════════════════════════════════════ -->
  <div id="modal-rules" class="modal">
    <div class="modal-sheet">
      <div class="modal-handle"></div>

    <div class="modal-header">
      <div class="modal-title">Game Rules</div>
      <button class="btn-modal-close" id="btn-rules-close">✕</button>
    </div>

    <div class="rules-tabs">
      <div class="rules-tab rules-tab--active" data-tab="characters">Characters</div>
      <div class="rules-tab" data-tab="description">Description</div>
      <div class="rules-tab" data-tab="question">Question</div>
    </div>

    <div class="rules-body">

      <!-- ── CHARACTERS ─────────────────────────────────── -->
      <div class="rules-panel rules-panel--show" data-panel="characters">

        <div class="rule-section">
          <div class="rule-section__title">The Two Roles</div>
          <p>
            Every player knows <strong>only their own identity</strong> — not others'.
            The challenge is to expose hidden roles through clever clues and careful observation.
          </p>
        </div>

        <div class="role-info-card role-info-card--villager">
          <div class="role-info-card__icon">🏘️</div>
          <div>
            <div class="role-info-card__name">Villager</div>
            <div class="role-info-card__desc">
              All villagers share the <strong>same secret word</strong>.
              Describe it carefully — give away too much and the spy wins!
            </div>
            <div class="role-info-card__target">🎯 Goal: Identify and vote out the Spy</div>
          </div>
        </div>

        <div class="role-info-card role-info-card--spy">
          <div class="role-info-card__icon">🕵️</div>
          <div>
            <div class="role-info-card__name">Spy</div>
            <div class="role-info-card__desc">
              The spy has <strong>no word</strong>. Listen carefully to others' descriptions,
              blend in, and deduce the villagers' word.
            </div>
            <div class="role-info-card__target">🎯 Goal: Survive voting &amp; guess the word</div>
          </div>
        </div>

        <div class="rule-section" style="margin-top:8px">
          <div class="rule-section__title">Number of Spies per Game</div>
          <table class="spy-count-table">
            <thead><tr><th>Players</th><th>Spies</th></tr></thead>
            <tbody>
              <tr><td>4 – 8 players</td><td>🕵️ 1 Spy</td></tr>
              <tr><td>9 – 12 players</td><td>🕵️🕵️ 2 Spies</td></tr>
            </tbody>
          </table>
        </div>

      </div>

      <!-- ── DESCRIPTION ────────────────────────────────── -->
      <div class="rules-panel" data-panel="description">

        <div class="rule-section">
          <div class="rule-section__title">How Description Mode Works</div>
          <p>
            Players take turns giving a <strong>one-sentence clue</strong> about their word.
            Villagers must hint cleverly — the spy has no word but must fake a description.
          </p>
        </div>

        <div class="step-list">
          <div class="step-item">
            <div class="step-num">1</div>
            <div class="step-text">Players are secretly assigned roles. Villagers get the same word — the spy gets nothing.</div>
          </div>
          <div class="step-item">
            <div class="step-num">2</div>
            <div class="step-text">A random player speaks first. Going around, each player gives one description of their word.</div>
          </div>
          <div class="step-item">
            <div class="step-num">3</div>
            <div class="step-text">Before each round ends, the spy may attempt to <strong>reveal the villagers' word</strong> to win immediately.</div>
          </div>
          <div class="step-item">
            <div class="step-num">4</div>
            <div class="step-text">After all descriptions, everyone votes. The player with the most votes is eliminated.</div>
          </div>
          <div class="step-item">
            <div class="step-num">5</div>
            <div class="step-text">If a spy is eliminated, they get <strong>one final guess</strong> at the villagers' word to still win.</div>
          </div>
          <div class="step-item">
            <div class="step-num">6</div>
            <div class="step-text"><strong>Tie vote?</strong> Tied players describe again. If still tied, no one is eliminated this round.</div>
          </div>
        </div>

        <div class="rule-section" style="margin-top:18px">
          <div class="rule-section__title">Victory Conditions</div>
          <div class="win-row">
            <div class="win-card win-card--spy">
              <div class="win-card__icon">🕵️</div>
              <div class="win-card__title">Spies Win</div>
              <div class="win-card__desc">Survive to the final 2 players, or correctly guess the villagers' word</div>
            </div>
            <div class="win-card win-card--villager">
              <div class="win-card__icon">🏆</div>
              <div class="win-card__title">Villagers Win</div>
              <div class="win-card__desc">Eliminate all spies before the spy guesses the word correctly</div>
            </div>
          </div>
        </div>

        <div class="rule-section">
          <div class="rule-section__title">💡 Pro Tip</div>
          <p>
            Be vague enough to prove you know the word, but not so direct the spy can steal it.
            <strong>Inexperienced players who describe too literally make it easy for the spy to win.</strong>
          </p>
        </div>

      </div>

      <!-- ── QUESTION ───────────────────────────────────── -->
      <div class="rules-panel" data-panel="question">

        <div class="rule-section">
          <div class="rule-section__title">How Question Mode Works</div>
          <p>
            Instead of free descriptions, players <strong>ask and answer questions</strong> about their word.
            Vague answers are key — give away too much and the spy wins.
          </p>
        </div>

        <div class="step-list">
          <div class="step-item">
            <div class="step-num">1</div>
            <div class="step-text">Player A asks Player B a question. B answers about their word — then B asks C, and so on around the table.</div>
          </div>
          <div class="step-item">
            <div class="step-num">2</div>
            <div class="step-text">After one full Q&amp;A round, a <strong>free session</strong> begins — anyone can ask anyone, or call for a vote.</div>
          </div>
          <div class="step-item">
            <div class="step-num">3</div>
            <div class="step-text">To start a vote: someone must call for it, and <strong>more than half</strong> of players must agree.</div>
          </div>
          <div class="step-item">
            <div class="step-num">4</div>
            <div class="step-text">Villagers vote for who they believe is the spy — there is only <strong>one chance</strong> to guess correctly.</div>
          </div>
          <div class="step-item">
            <div class="step-num">5</div>
            <div class="step-text">After voting, the eliminated spy must <strong>guess the villagers' word</strong>. Correct guess = spy wins!</div>
          </div>
        </div>

        <div class="rule-section" style="margin-top:18px">
          <div class="rule-section__title">Victory Conditions</div>
          <div class="win-row">
            <div class="win-card win-card--spy">
              <div class="win-card__icon">🕵️</div>
              <div class="win-card__title">Spies Win</div>
              <div class="win-card__desc">Correctly guess the word after being voted out, or survive to the final round</div>
            </div>
            <div class="win-card win-card--villager">
              <div class="win-card__icon">🏆</div>
              <div class="win-card__title">Villagers Win</div>
              <div class="win-card__desc">Vote out all spies and the spy fails to guess the correct word</div>
            </div>
          </div>
        </div>

        <div class="rule-section">
          <div class="rule-section__title">💡 Strategy</div>
          <p>
            Collect information in every Q&amp;A round. The villagers who voted correctly
            <strong>and</strong> the spy who guesses the word correctly are the final winners.
          </p>
        </div>

      </div>

    </div><!-- .rules-body -->
    </div><!-- .modal-sheet -->
  </div><!-- #modal-rules -->

</div><!-- #app -->

<!-- TOAST ──────────────────────────────────────────────────── -->
<div class="toast" id="toast"></div>
`;


  /* ─── Internal state ───────────────────────────────────────── */
  var _activeScreen = 'screen-splash';
  var _timerInterval = null;
  var _votesCast = {};
  var _lastLobbyPlayers = null;
  var _splashTimeout = null;

  /* ─── DOM helpers ──────────────────────────────────────────── */
  function $(id) { return document.getElementById(id); }
  function $$(sel) { return document.querySelectorAll(sel); }

  function html(el, markup) {
    if (typeof el === 'string') el = $(el);
    if (el) el.innerHTML = markup;
  }

  function show(id) {
    var el = $(id);
    if (el) { el.style.display = ''; el.classList.remove('hidden'); }
  }
  function hide(id) {
    var el = $(id);
    if (el) { el.style.display = 'none'; }
  }

  /* ─── Screen transitions ───────────────────────────────────── */
  function goTo(screenId) {
    var screens = $$('.screen');
    
    // ✅ CRITICAL FIX: Ensure ALL screens are stripped of active/out states immediately 
    // to prevent multiple active screens during transition (T007)
    screens.forEach(function (s) {
      s.classList.remove('screen--active');
      s.classList.remove('screen--out');
    });

    var next = $(screenId);
    if (!next) return;

    // ✅ OPTIMIZATION: Update state immediately to prevent race conditions (T005)
    _activeScreen = screenId;

    if (screenId !== 'screen-splash' && _splashTimeout) {
      clearTimeout(_splashTimeout);
      _splashTimeout = null;
    }

    setTimeout(function () {
      screens.forEach(function (s) { s.classList.remove('screen--out'); });
      next.classList.add('screen--active');

      /* Scroll to top */
      next.scrollTop = 0;
    }, 220);
  }

  /* ─── Toast notifications ──────────────────────────────────── */
  function toast(msg, type) {
    type = type || 'info';
    var el = $('toast');
    if (!el) return;
    el.className = 'toast toast--' + type + ' toast--show';
    el.textContent = msg;
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.classList.remove('toast--show');
    }, 2800);
  }

  /* ─── Player avatar badge ──────────────────────────────────── */
  function avatarBadge(player, size) {
    size = size || 48;
    var colors = window.SPY_CONFIG.AVATAR_COLORS;
    var color = colors[((player.id || player.number) - 1) % colors.length];

    var photoUrl = player.photoURL || null;
    var frameAsset = null;
    if (player.equipped && player.equipped.frames && player.equipped.frames.length > 0) {
      var fId = player.equipped.frames[0];
      if (window.SHOP_ITEMS && window.SHOP_ITEMS.frames) {
        var fObj = window.SHOP_ITEMS.frames.find(function (f) { return f.id === fId; });
        if (fObj) frameAsset = fObj.imageUrl || fObj.preview;
      }
    }

    var num = player.number || player.id;
    var label = player.name ? player.name.charAt(0).toUpperCase() : ('P' + num);

    var innerHtml = '';
    if (photoUrl) {
      innerHtml += '<img src="' + photoUrl + '" style="position:relative; z-index:2; width:100%; height:100%; border-radius:50%; object-fit:cover;" />';
    } else {
      innerHtml += '<span class="avatar-badge__num">' + num + '</span>';
      innerHtml += '<span class="avatar-badge__init">' + label + '</span>';
    }

    if (frameAsset) {
      innerHtml += '<img src="' + frameAsset + '" style="position:absolute; width:135%; height:135%; top:-17.5%; left:-17.5%; z-index:10; pointer-events:none;" />';
    }

    return (
      '<div class="avatar-badge" style="--av-color:' + color + ';width:' + size + 'px;height:' + size + 'px">' +
      innerHtml +
      (player.isHost ? '<div style="position:absolute;top:-4px;right:-4px;background:#ffd700;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px;z-index:15;box-shadow:0 2px 4px rgba(0,0,0,0.3);border:1px solid #000">👑</div>' : '') +
      '</div>'
    );
  }

  /* ═══════════════════════════════════════════════════════════
     SCREEN: SPLASH
  ═══════════════════════════════════════════════════════════ */
  function initSplash(opts) {
    // ✅ FIX: Respect initialScreen and bypass the auto-main transition (T006)
    var initialScreen = opts && opts.initialScreen;
    if (initialScreen && initialScreen !== 'screen-splash') {
        console.log('[SPY_UI] Skipping splash timeout, initialScreen requested:', initialScreen);
        
        // Ensure splash is hidden if we are jumping ahead
        var splash = $('screen-splash');
        if (splash) splash.classList.remove('screen--active');
        
        // Actually trigger the jump to the requested screen
        goTo(initialScreen);
        return;
    }

    _splashTimeout = setTimeout(function () { 
        if (_activeScreen === 'screen-splash' || !_activeScreen) {
            goTo('screen-main'); 
        }
    }, 2200);
  }


  /* ═══════════════════════════════════════════════════════════
     SCREEN: MAIN MENU
  ═══════════════════════════════════════════════════════════ */
  function initMain() {
    var btnOnline = $('btn-online');
    var btnOffline = $('btn-offline');
    var btnRules = $('btn-main-rules');

    if (btnOnline) btnOnline.addEventListener('click', function () { goTo('screen-online-hub'); });
    if (btnOffline) btnOffline.addEventListener('click', function () { goTo('screen-offline-hub'); });
    if (btnRules) btnRules.addEventListener('click', function () { openRules('description'); });
  }

  /* ═══════════════════════════════════════════════════════════
     SCREEN: ONLINE HUB
  ═══════════════════════════════════════════════════════════ */
  function initOnlineHub() {
    $('btn-quick-match').addEventListener('click', function () {
      // ✅ FIX: Prevent double-click / concurrent requests
      var btn = $('btn-quick-match');
      if (btn && btn.disabled) return;
      if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }

      var profile = _buildPlayerProfile(true);

      // ✅ FIX: Save to named var so onSuccess/onError can reference it
      var qmOpts = {
        gameMode: 'description',
        playerName: profile.playerName,
        profile: profile,
        onSuccess: function (player) {
          if (btn) { btn.disabled = false; btn.style.opacity = ''; }
          // ✅ _state.room is guaranteed to be populated at this point
          // (onSuccess is called only after the first Firestore snapshot)
          var roomData = SPY_ENGINE.state().room;
          if (roomData) {
            var localId = SPY_ENGINE.state().localPlayerId;
            var isHost  = roomData.hostId === localId;
            renderRoomLobby(roomData, isHost);
            goTo('screen-room-lobby');
            toast((window.currentLang === 'ar' ? 'الغرفة جاهزة: ' : 'Room ready: ') + roomData.code, 'success');
          } else {
            // Should never reach here after the snapshot fix, but log just in case
            console.error('[QuickMatch] onSuccess fired but _state.room is still null — unexpected.');
            toast(window.currentLang === 'ar' ? 'حدث خطأ في تحميل الغرفة' : 'Failed to load room', 'error');
          }
        },
        onError: function (err) {
          if (btn) { btn.disabled = false; btn.style.opacity = ''; }
          console.error('[QuickMatch] Error:', err);
          toast(window.currentLang === 'ar' ? 'فشل الاتصال جرب مرة ثانية' : 'Connection failed — please try again', 'error');
        }
      };

      SPY_ENGINE.RoomManager.quickMatch(qmOpts);
    });

    $('btn-create-online').addEventListener('click', function () {
      _fillCreateRoom('online');
      goTo('screen-create-room');
    });

    $('btn-join-room').addEventListener('click', function () {
      goTo('screen-join-room');
    });

    $('btn-online-back').addEventListener('click', function () { goTo('screen-main'); });
  }

  /* ═══════════════════════════════════════════════════════════
     SCREEN: JOIN ROOM (online)
  ═══════════════════════════════════════════════════════════ */
  function initJoinRoom() {
    $('btn-join-confirm').addEventListener('click', function () {
      var code = $('input-room-code').value.trim().toUpperCase();
      if (code.length < 4) { toast('Enter a valid room code', 'warn'); return; }

      var profile = _buildPlayerProfile(true);
      SPY_ENGINE.RoomManager.joinRoom({
        code: code,
        playerName: profile.playerName,
        profile: profile,
        onSuccess: function (player) {
          /* FIX: Render lobby immediately to avoid 'undefined' code */
          var roomData = SPY_ENGINE.state().room;
          renderRoomLobby(roomData, false);
          
          goTo('screen-room-lobby');
          toast('Joined room ' + code, 'success');
        },
        onError: function () { toast('Room not found', 'error'); }
      });
    });

    $('btn-join-back').addEventListener('click', function () { goTo('screen-online-hub'); });
  }

  /* ═══════════════════════════════════════════════════════════
     SCREEN: OFFLINE HUB
  ═══════════════════════════════════════════════════════════ */
  function initOfflineHub() {
    $('btn-create-offline').addEventListener('click', function () {
      _fillCreateRoom('offline');
      goTo('screen-create-room');
    });

    $('btn-offline-rules').addEventListener('click', function () { openRules('description'); });
    $('btn-offline-back').addEventListener('click', function () { goTo('screen-main'); });
  }

  /* ═══════════════════════════════════════════════════════════
     SCREEN: CREATE ROOM  (online + offline shared)
  ═══════════════════════════════════════════════════════════ */
  var _createMode = 'offline';   /* 'online' | 'offline' */

  function _fillCreateRoom(mode) {
    _createMode = mode;

    /* Show/hide online-only fields */
    var onlineFields = $('create-online-fields');
    if (onlineFields) onlineFields.style.display = mode === 'online' ? '' : 'none';

    /* Reset player count */
    _updatePlayerCount(6);

    /* Render categories */
    _renderCategories();
  }

  function _updatePlayerCount(n) {
    var cfg = window.SPY_CONFIG;
    n = Math.max(cfg.MIN_PLAYERS, Math.min(cfg.MAX_PLAYERS, n));

    var slider = $('slider-players');
    var display = $('display-players');
    var spyCnt = cfg.SPY_COUNT[n] || 1;
    var vilCnt = n - spyCnt;

    if (slider) slider.value = n;
    if (display) display.textContent = n + ' people';

    var vNum = $('villager-count');
    var sNum = $('spy-count');
    if (vNum) vNum.textContent = '× ' + vilCnt;
    if (sNum) sNum.textContent = '× ' + spyCnt;
  }

  function _renderCategories() {
    var cats = window.SPY_CONFIG.CATEGORIES;
    var wrap = $('category-grid');
    if (!wrap) return;

    var markup = '';
    Object.keys(cats).forEach(function (k) {
      var c = cats[k];
      markup +=
        '<button class="cat-btn" data-cat="' + c.id + '">' +
        '<span class="cat-btn__icon">' + c.icon + '</span>' +
        '<span class="cat-btn__name">' + c.name + '</span>' +
        '<span class="cat-btn__name-ar">' + c.nameAr + '</span>' +
        '</button>';
    });
    wrap.innerHTML = markup;

    /* default select */
    var first = wrap.querySelector('.cat-btn');
    if (first) first.classList.add('cat-btn--active');

    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.cat-btn');
      if (!btn) return;
      $$('.cat-btn').forEach(function (b) { b.classList.remove('cat-btn--active'); });
      btn.classList.add('cat-btn--active');
    });
  }

  function initCreateRoom() {
    /* Mode tabs */
    $$('.mode-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        $$('.mode-tab').forEach(function (t) { t.classList.remove('mode-tab--active'); });
        tab.classList.add('mode-tab--active');
      });
    });

    /* Player slider */
    var slider = $('slider-players');
    if (slider) {
      slider.addEventListener('input', function () {
        _updatePlayerCount(+this.value);
      });
    }

    /* Category refresh */
    $('btn-cat-refresh').addEventListener('click', function () {
      $$('.cat-btn--active').forEach(function (b) { b.classList.remove('cat-btn--active'); });
      var all = $$('.cat-btn');
      var rnd = all[Math.floor(Math.random() * all.length)];
      if (rnd) rnd.classList.add('cat-btn--active');
    });

    /* Password toggle */
    var pwToggle = $('toggle-password');
    var pwField = $('pw-field');
    if (pwToggle && pwField) {
      pwToggle.addEventListener('change', function () {
        pwField.style.display = this.checked ? '' : 'none';
      });
    }

    /* Confirm */
    $('btn-create-confirm').addEventListener('click', function () {
      var activeModeTab = document.querySelector('.mode-tab--active');
      var gameMode = activeModeTab ? activeModeTab.dataset.mode : 'description';
      var activeCat = document.querySelector('.cat-btn--active');
      var category = activeCat ? activeCat.dataset.cat : 'random';
      var playerCount = +($('slider-players').value || 6);

      if (_createMode === 'offline') {
        var st = SPY_ENGINE.OfflineEngine.setup({
          playerCount: playerCount,
          gameMode: gameMode,
          category: category
        });
        goTo('screen-role-reveal');
        renderRoleReveal();
      } else {
        var pwEnabled = $('toggle-password') && $('toggle-password').checked;
        var pw = pwEnabled ? ($('input-password').value || '') : null;
        var profile = _buildPlayerProfile(true);
        SPY_ENGINE.RoomManager.createRoom({
          gameMode: gameMode,
          maxPlayers: playerCount,
          hasPassword: pwEnabled,
          password: pw,
          playerName: profile.playerName,
          profile: profile,
          onSuccess: function (room) {
            renderRoomLobby(room, true);
            goTo('screen-room-lobby');
          },
          onError: function () { toast('Could not create room', 'error'); }
        });
      }
    });

    $('btn-create-back').addEventListener('click', function () {
      goTo(_createMode === 'online' ? 'screen-online-hub' : 'screen-offline-hub');
    });
  }

  /* ═══════════════════════════════════════════════════════════
     SCREEN: ROOM LOBBY  (online)
  ═══════════════════════════════════════════════════════════ */
  function renderRoomLobby(room, isHost) {
    var players = room && room.players ? Object.values(room.players) : [];
    var max = room ? room.maxPlayers : 8;
    var code = (room && room.code) ? room.code : 'SYNCHRONIZING...';
    var localId = SPY_ENGINE.state().localPlayerId;

    // ✅ CRASH PROTECTION: Safer map that handles null players or malformed slots
    var safePlayers = players.filter(function(p) { return p && typeof p === 'object'; });

    var diffState = code + "||" + JSON.stringify(safePlayers.map(p => ({
      id: p.id, 
      isReady: p.isReady, 
      isHost: p.isHost, 
      isAFK: p.isAFK,
      name: p.name || (p.profile && p.profile.playerName)
    })));

    if (_lastLobbyPlayers === diffState) return;
    _lastLobbyPlayers = diffState;
    console.log('[Lobby] Rendering list change:', safePlayers.length, 'players');

    /* Header */
    var codeEl = $('lobby-room-code');
    if (codeEl) {
        codeEl.textContent = code;
        codeEl.style.letterSpacing = (code === 'SYNCHRONIZING...') ? '1px' : '4px';
        codeEl.style.opacity = (code === 'SYNCHRONIZING...') ? '0.5' : '1';
    }
    html('lobby-game-mode', (room && room.gameMode === 'question') ? 'Q&A Mode' : 'Description Mode');
    html('lobby-player-count', (room ? players.length : 0) + ' / ' + max + ' Players');

    /* Slots */
    var slots = $('lobby-slots');
    if (!slots) return;
    var markup = '';
    for (var i = 0; i < max; i++) {
      var p = players[i];
      if (p) {
        var pName = p.name || (p.profile && p.profile.playerName) || 'Player ' + (i + 1);
        var isLocal = p.id === localId;
        markup +=
          '<div class="lobby-slot lobby-slot--filled ' + (p.isReady ? 'lobby-slot--ready' : '') + '">' +
          avatarBadge(p, 52) +
          '<div class="lobby-slot__info">' +
          '<span class="lobby-slot__name">' + pName + (isLocal ? ' (YOU)' : '') + '</span>' +
          (p.isHost ? '<span class="lobby-slot__badge badge--host">HOST</span>' : '') +
          (p.isReady ? '<span class="lobby-slot__badge badge--ready">READY</span>' : '<span class="lobby-slot__badge badge--wait">WAITING</span>') +
          '</div>' +
          // ✅ SELF-KICK FIX: Never show kick button on the local player
          (isHost && p.id !== localId ? '<button class="lobby-slot__kick" data-uid="' + p.id + '" title="Kick Player">×</button>' : '') +
          '</div>';
      } else {
        markup += '<div class="lobby-slot lobby-slot--empty"><span class="lobby-slot__plus">+</span><span class="lobby-slot__label">Empty</span></div>';
      }
    }
    slots.innerHTML = markup;

    /* Host & Player controls */
    var startBtn = $('btn-start-game');
    if (startBtn) {
      if (isHost) {
        var others = players.filter(function(p) { return p.id !== room.hostId; });
        var everyoneReady = others.length > 0 && others.every(function(p) { return p.isReady; });
        var canStart = players.length >= 3 && everyoneReady;

        startBtn.style.display = '';
        startBtn.textContent = 'START GAME';
        startBtn.disabled = !canStart;
        startBtn.style.opacity = canStart ? '1' : '0.5';
        startBtn.className = 'btn btn--primary btn--lg w-full mt-4';
      } else {
        var me = (room && room.players) ? room.players[localId] : null;
        var ready = me ? me.isReady : false;
        startBtn.style.display = '';
        startBtn.textContent = ready ? 'UNREADY' : 'I AM READY!';
        startBtn.disabled = !me;
        startBtn.style.opacity = me ? '1' : '0.5';
        startBtn.className = ready ? 'btn btn--ghost btn--lg w-full mt-4' : 'btn btn--primary btn--lg w-full mt-4';
      }
    }
  }

  function initRoomLobby() {
    $('btn-invite').addEventListener('click', function () {
      var code = ($('lobby-room-code') || {}).textContent || '';
      var roomData = SPY_ENGINE.state().room;
      var mode = roomData ? roomData.gameMode : 'normal';

      console.log("[SPY-Lobby] Invite clicked, checking components...");

      /* Final Fix: Internal platform messaging only */
      if (window.ChatManager && window.ChatManager.handleSendSpyInvite && window.openPrivateChatWithFriendSelector) {
        console.log("[SPY-Lobby] Using Branch A: External Chat System");
        window.openPrivateChatWithFriendSelector(function(friend) {
          var context = {
              user: firebase.auth().currentUser,
              isLoggedIn: true,
              userData: window._currentUserDataCache || window.currentUserData || window.currentUser,
              friend: friend,
              lang: window.currentLang || 'en',
              createNotification: window.createNotification
          };
          window.ChatManager.handleSendSpyInvite(context, code, mode);
          toast(window.currentLang === 'ar' ? 'تم إرسال الدعوة!' : 'Invitation sent!', 'success');
        });
      } else if (navigator.share) {
          console.log("[SPY-Lobby] Using Branch B: Native OS Share");
          navigator.share({
              title: window.currentLang === 'ar' ? 'انضم إلى لعبة سباي!' : 'Join Spy Game!',
              text: (window.currentLang === 'ar' ? 'الرمز هو: ' : 'Join code: ') + code,
              url: window.location.href
          }).catch(function(e) { console.error("[SPY-Lobby] Share failed:", e); });
      } else {
          console.log("[SPY-Lobby] Using Branch C: Clipboard Copy");
          if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(code).then(function() {
                  toast(window.currentLang === 'ar' ? 'تم نسخ الرمز: ' + code : 'Code copied: ' + code, 'success');
              });
          } else {
              var dummy = document.createElement('input');
              document.body.appendChild(dummy);
              dummy.value = code;
              dummy.select();
              document.execCommand('copy');
              document.body.removeChild(dummy);
              toast(window.currentLang === 'ar' ? 'تم نسخ الرمز: ' + code : 'Code copied: ' + code, 'success');
          }
      }
    });

    $('btn-lobby-rules').addEventListener('click', function () { openRules('description'); });

    $('btn-start-game').addEventListener('click', function () {
      var state = SPY_ENGINE.state();
      var roomData = state.room;
      var players = roomData && roomData.players ? Object.values(roomData.players) : [];
      var isHost = state.localPlayerId === roomData.hostId;

      if (!isHost) {
        /* Player Toggle Ready */
        var me = roomData.players[state.localPlayerId];
        var newReady = me ? !me.isReady : true;
        SPY_ENGINE.Firebase.toggleReady(roomData.code, state.localPlayerId, newReady);
        return;
      }
      
      /* Host Start Game */
      if (players.length < 3) {
        toast(window.currentLang === 'ar' ? 'تحتاج إلى 3 لاعبين على الأقل للبدء!' : 'Need at least 3 players to start!', 'error');
        return;
      }

      toast('Starting game…', 'info');
      
      /* New Host Initialization Logic */
      var playerCount = players.length;
      var spyCount = window.SPY_CONFIG.SPY_COUNT[playerCount] || 1;
      var word = SPY_ENGINE.WordManager.pick(roomData.category || 'random');
      var speakerIndex = Math.floor(Math.random() * playerCount);

      /* Assign roles */
      var pIds = players.map(function(p) { return p.id; });
      var shuffledIds = SPY_ENGINE.WordManager.shuffle(pIds);
      var spyIds = shuffledIds.slice(0, spyCount);

      var updates = {
          status: 'playing',
          phase: 'revealing',
          currentRound: 1,
          villagerWord: word,
          spyIds: spyIds,
          speakerIndex: speakerIndex,
          roundStartIndex: speakerIndex,
          serverStartTime: firebase.firestore.FieldValue.serverTimestamp()
      };

      /* Add role and elimination state to each player */
      /* Sort players by joinedAt to assign consistent numbers */
      var sortedPlayers = players.sort(function(a, b) { return (a.joinedAt || 0) - (b.joinedAt || 0); });

      sortedPlayers.forEach(function(p, idx) {
          var isSpy = spyIds.indexOf(p.id) !== -1;
          updates['players.' + p.id + '.role'] = isSpy ? 'spy' : 'villager';
          updates['players.' + p.id + '.number'] = idx + 1; // Assign player number
          updates['players.' + p.id + '.isEliminated'] = false;
          updates['players.' + p.id + '.isConfirmed'] = false; // Reset for new game
      });

      if (SPY_ENGINE.Firebase && SPY_ENGINE.Firebase.pushState) {
        SPY_ENGINE.Firebase.pushState(roomData.code, updates, function(err) {
            if (err) {
                toast('Error starting game', 'error');
            }
        });
      }
    });

    /* Kick functionality (Event Delegation) */
    $('lobby-slots').addEventListener('click', function (e) {
      if (e.target.classList.contains('lobby-slot__kick')) {
        var targetUid = e.target.getAttribute('data-uid');
        var roomData = SPY_ENGINE.state().room;
        if (roomData && targetUid) {
          SPY_ENGINE.Firebase.leaveRoom(roomData.code, targetUid, function() {
            toast('Player kicked', 'info');
          });
        }
      }
    });

    $('btn-lobby-back').addEventListener('click', function () {
      SPY_ENGINE.RoomManager.leaveRoom();
      goTo('screen-main');
    });
  }

  function onRoomUpdate(roomData) {
    if (!roomData) {
        if (_activeScreen === 'screen-room-lobby' || _activeScreen === 'screen-game' || _activeScreen === 'screen-voting') {
            toast('Mission terminated', 'info');
            goTo('screen-main');
        }
        return;
    }
    var state = SPY_ENGINE.state();
    
    /* Kick detection: if we are in a room but no longer in the player list */
    if (state.localPlayerId && roomData.players && !roomData.players[state.localPlayerId]) {
        toast('Expelled from mission', 'warn');
        SPY_ENGINE.RoomManager.leaveRoom(); 
        goTo('screen-main');
        return;
    }

    var isHost = state.localPlayerId === roomData.hostId;

    /* Handle game start transition */
    if (roomData.status === 'playing') {
        if (roomData.phase === 'revealing' && _activeScreen === 'screen-room-lobby') {
            goTo('screen-role-reveal');
            renderRoleReveal(roomData);
            return;
        }

        /* Transition from speaking to voting */
        if (roomData.phase === 'voting' && _activeScreen !== 'screen-voting') {
            goTo('screen-voting');
            renderVoting(roomData);
            return;
        }

        /* Transition to elimination reveal */
        if (roomData.phase === 'elimination_reveal' && _activeScreen !== 'screen-elimination-reveal') {
            renderEliminationReveal(roomData);
            return;
        }

        /* Transition to speaking (Game Start) */
        if (roomData.phase === 'speaking' && _activeScreen !== 'screen-game') {
            goTo('screen-game');
            renderGameScreen(roomData);
            _renderGameChat();
            return;
        }

        /* Refresh game screen if already there but room data changed */
        if (roomData.phase === 'speaking' && _activeScreen === 'screen-game') {
            var oldChatLen = (state.room && state.room.chat) ? state.room.chat.length : 0;
            var newChatLen = (roomData.chat) ? roomData.chat.length : 0;
            
            renderGameScreen(roomData);
            
            // Re-render chat only if new messages arrived
            if (newChatLen !== oldChatLen) {
                _renderGameChat();
            }
        }

        /* Refresh voting screen if active */
        if (roomData.phase === 'voting' && _activeScreen === 'screen-voting') {
            renderVoting(roomData);
        }

        /* Auto-advance phase if everyone confirmed role */
        if (roomData.phase === 'revealing' && isHost) {
            var playersArr = roomData.players ? Object.values(roomData.players) : [];
            // Robust check: Only check players who exist and have a role
            var activePlayers = playersArr.filter(function(p) { return !p.isEliminated; });
            var confirmedCount = activePlayers.filter(function(p) { return p.isConfirmed === true; }).length;
            
            console.log('[SPY-Engine] Readiness Check:', confirmedCount, '/', activePlayers.length);

            if (confirmedCount >= activePlayers.length && activePlayers.length >= 3) {
                console.log('[SPY-Engine] All confirmed! Advancing to speaking...');
                SPY_ENGINE.Firebase.sendSystemMessage('All players ready! Round 1 begins.');
                SPY_ENGINE.Firebase.pushState(roomData.code, { 
                    phase: 'speaking',
                    speakerIndex: 0,
                    currentRound: 1
                });
            }
        }
    }

    if (_activeScreen === 'screen-room-lobby') {
      renderRoomLobby(roomData, isHost);
    }
  }

  /* ═══════════════════════════════════════════════════════════
     SCREEN: ROLE REVEAL  (offline)
  ═══════════════════════════════════════════════════════════ */
  function renderRoleReveal(roomData) {
    var st = SPY_ENGINE.state();
    var isOnline = !!roomData;
    var player;

    if (isOnline) {
      player = roomData.players[st.localPlayerId];
    } else {
      var cursor = st.roleRevealCursor;
      player = st.players[cursor];
    }

    if (!player) return;

    _revealShown = false;

    var wrap = $('role-reveal-wrap');
    if (!wrap) return;

    var playerName = isOnline ? (player.name || 'YOU') : ('Player ' + player.number);
    var timerHtml = isOnline ? '<div class="reveal-timer" id="reveal-countdown">Confirming in 5s...</div>' : '';

    wrap.innerHTML =
      '<div class="reveal-prompt">' +
      timerHtml +
      '<div class="reveal-player-num">' + playerName + '</div>' +
      '<p class="reveal-instruction">Tap the card to see your role</p>' +
      '<div class="role-card" id="role-card">' +
      '<div class="role-card__face role-card__front">' +
      '<div class="role-card__spy-icon">🕵️</div>' +
      '<p>TAP TO REVEAL</p>' +
      '</div>' +
      '<div class="role-card__face role-card__back" id="role-card-back"></div>' +
      '</div>' +
      (isOnline ? 
        '<button class="btn btn--primary btn--lg w-full mt-6" id="btn-role-confirm" style="display:none">I UNDERSTAND</button>' :
        '<button class="btn btn--ghost btn--sm" id="btn-role-next" style="display:none">Pass to next player →</button>'
      ) +
      '</div>';

    var card = $('role-card');
    var back = $('role-card-back');

    /* Online Timer Logic */
    var countdownInterval = null;
    if (isOnline) {
       var timeLeft = 5;
       var timerEl = $('reveal-countdown');
       countdownInterval = setInterval(function() {
         timeLeft--;
         if (timerEl) timerEl.textContent = 'Confirming in ' + timeLeft + 's...';
         if (timeLeft <= 0) {
           clearInterval(countdownInterval);
           confirmOnlineRole();
         }
       }, 1000);
    }

    function confirmOnlineRole() {
      if (countdownInterval) clearInterval(countdownInterval);
      if (isOnline) {
        SPY_ENGINE.Firebase.confirmRole(roomData.code, st.localPlayerId);
        wrap.innerHTML = 
          '<div class="waiting-reveal">' +
          '<div class="spy-figure main-hero-anim">🕵️</div>' +
          '<h2 style="margin-top:20px">Role Confirmed!</h2>' +
          '<p style="color:var(--text-muted)">Waiting for other players to be ready...</p>' +
          '</div>';
      }
    }

    card.addEventListener('click', function () {
      if (_revealShown) return;
      _revealShown = true;
      card.classList.add('role-card--flipped');

      var role = player.role;
      var word = '';
      var desc = '';

      if (isOnline) {
        word = (role === 'spy') ? '???' : roomData.villagerWord;
      } else {
        word = (role === 'spy') ? '???' : st.villagerWord;
      }

      if (role === 'spy') {
        desc = '<span class="role-name role-name--spy">YOU ARE THE SPY!</span>' +
               '<p>Try to figure out the secret word without being caught.</p>';
      } else {
        desc = '<span class="role-name role-name--villager">YOU ARE AN AGENT</span>' +
               '<p>The secret word is: <br><strong>' + word + '</strong></p>';
      }

      back.innerHTML = desc;

      if (isOnline) {
        setTimeout(function() { $('btn-role-confirm') && ($('btn-role-confirm').style.display = ''); }, 600);
      } else {
        setTimeout(function() { $('btn-role-next') && ($('btn-role-next').style.display = ''); }, 600);
      }
    });

    if (isOnline) {
      $('btn-role-confirm').addEventListener('click', confirmOnlineRole);
    } else {
      $('btn-role-next').addEventListener('click', function () {
        st.roleRevealCursor++;
        if (st.roleRevealCursor >= st.players.length) {
          SPY_ENGINE.nextRound();
          goTo('screen-game');
          renderGame();
        } else {
          renderRoleReveal();
        }
      });
    }
  }

  function _advanceRoleReveal() {
    var st = SPY_ENGINE.state();
    st.roleRevealCursor++;
    if (st.roleRevealCursor >= st.players.length) {
      /* All players have seen their roles — start game */
      st.phase = window.SPY_CONFIG.PHASES.SPEAKING;
      goTo('screen-game');
      renderGameScreen();
    } else {
      renderRoleReveal();
    }
  }

  function initRoleReveal() {
    $('btn-skip-reveal') && $('btn-skip-reveal').addEventListener('click', function () {
      var st = SPY_ENGINE.state();
      st.roleRevealCursor = st.players.length;
      st.phase = window.SPY_CONFIG.PHASES.SPEAKING;
      goTo('screen-game');
      renderGameScreen();
    });
  }

  /* ═══════════════════════════════════════════════════════════
     SCREEN: GAME (speaking / Q&A)
  ═══════════════════════════════════════════════════════════ */
  function renderGameScreen() {
    var st = SPY_ENGINE.state();
    var OE = SPY_ENGINE.OfflineEngine;
    var active = OE.activePlayers();
    var speaker = OE.activeSpeaker();
    if (!speaker) return;

    /* Header */
    html('game-round', 'Round ' + st.currentRound);
    html('game-mode-tag', st.gameMode === 'question' ? 'Q&A Mode' : 'Description Mode');

    /* Player ring */
    _renderPlayerRing(active, speaker.id);

    /* Center info */
    var isSelf = (speaker.id === st.localPlayerId);
    if (isSelf) {
        html('game-center-label', 'YOUR TURN!');
        html('game-center-sub', 'Describe your word naturally...');
    } else {
        html('game-center-label', (speaker.name || 'Player') + "'s Turn");
        html('game-center-sub', 'Listen carefully to their clues');
    }

    /* Timer */
    var dur = window.SPY_CONFIG.TIMERS.SPEAKING;
    _updateTimerDisplay(dur); // Reset display
    SPY_ENGINE.Timer.start(dur, _updateTimerDisplay, function () {
      _onSpeakerDone();
    });

    /* Vote button */
    var voteBtn = $('btn-start-vote');
    if (voteBtn) {
      voteBtn.addEventListener('click', function () {
        SPY_ENGINE.Timer.stop();
        _openVotingPhase();
      });
    }

    /* Chat System - Online only */
    if (st.appMode === 'online') {
      _renderGameChat();
    } else {
      $('game-chat-wrapper') && ($('game-chat-wrapper').innerHTML = '');
    }
  }

  function _renderGameChat() {
    var st = SPY_ENGINE.state();
    var chatWrap = $('game-chat-wrapper');
    if (!chatWrap) return;

    var room = st.room;
    var messages = (room && room.chat) ? room.chat : [];

    var markup = '<div class="game-chat">';
    markup += '<div class="game-chat__messages" id="game-chat-msgs">';
    
    if (messages.length === 0) {
      markup += '<div class="chat-msg chat-msg--system">Discuss and find the spy!</div>';
    }

    messages.forEach(function(msg) {
      var isSelf = msg.uid === st.localPlayerId;
      var isSystem = msg.type === 'system';
      
      if (isSystem) {
        markup += '<div class="chat-msg chat-msg--system">' + msg.text + '</div>';
      } else {
        markup += '<div class="chat-msg ' + (isSelf ? 'chat-msg--self' : 'chat-msg--other') + '">';
        if (!isSelf) markup += '<span class="chat-msg__sender">' + (msg.name || 'Player') + '</span>';
        markup += msg.text;
        markup += '</div>';
      }
    });

    markup += '</div>';
    
    markup += '<div class="game-chat__input-area">';
    markup += '<input type="text" id="game-chat-input" class="game-chat__input" placeholder="Say something...">';
    markup += '<button id="btn-send-chat" class="game-chat__send">🚀</button>';
    markup += '</div>';
    
    markup += '</div>';
    
    chatWrap.innerHTML = markup;

    // Scroll to bottom
    var msgBox = $('game-chat-msgs');
    if (msgBox) msgBox.scrollTop = msgBox.scrollHeight;

    // Event listeners
    var input = $('game-chat-input');
    var sendBtn = $('btn-send-chat');
    
    if (sendBtn && input) {
      var send = function() {
        var txt = input.value.trim();
        if (!txt) return;
        SPY_ENGINE.Firebase.sendChat(txt);
        input.value = '';
      };
      sendBtn.onclick = send;
      input.onkeypress = function(e) { if (e.key === 'Enter') send(); };
    }
  }

  function _renderPlayerRing(players, activeSpeakerId) {
    var ring = $('player-ring');
    if (!ring) return;

    /* Calculate positions in a circle */
    var n = players.length;
    var r = Math.min(ring.clientWidth, ring.clientHeight) / 2 - 44;
    r = Math.max(r, 80);
    var cx = ring.clientWidth / 2 || 160;
    var cy = ring.clientHeight / 2 || 160;
    var markup = '';

    players.forEach(function (p, i) {
      var angle = (2 * Math.PI * i / n) - Math.PI / 2;
      var x = cx + r * Math.cos(angle) - 36;
      var y = cy + r * Math.sin(angle) - 36;
      var isActive = (p.id === activeSpeakerId);
      
      // Online status indicators
      var statusClass = 'status--online';
      var isAFK = false;
      if (SPY_ENGINE.state().appMode === 'online' && SPY_ENGINE.state().room) {
        var roomP = SPY_ENGINE.state().room.players[p.id];
        if (roomP) {
          if (roomP.isAFK) {
             statusClass = 'status--afk';
             isAFK = true;
          } else if (Date.now() - (roomP.lastSeen || 0) > 15000) {
             statusClass = 'status--offline';
          }
        }
      }

      markup +=
        '<div class="ring-player ' + (isActive ? 'ring-player--active' : '') + (isAFK ? ' player-card--afk' : '') + '"' +
        ' style="left:' + x.toFixed(1) + 'px;top:' + y.toFixed(1) + 'px">' +
        '<div class="player-status-dot ' + statusClass + '"></div>' +
        (isAFK ? '<div class="afk-label">AFK</div>' : '') +
        avatarBadge(p, 52) +
        (isActive ? '<div class="ring-mic"><span>🎤</span></div>' : '') +
        '<div class="ring-name">' + p.name + '</div>' +
        '</div>';
    });

    ring.innerHTML = markup;
  }

  function _updateTimerDisplay(val) {
    var el = $('game-timer');
    if (!el) return;
    el.textContent = val + 's';
    el.classList.toggle('timer--urgent', val <= 5);
  }

  function _onSpeakerDone() {
    var st = SPY_ENGINE.state();
    var isOnline = st.appMode === 'online';
    
    if (isOnline) {
       var isHost = st.localPlayerId === st.room.hostId;
       if (isHost) {
           var OE = SPY_ENGINE.OfflineEngine;
           OE.advanceSpeaker();
           
           if (OE.hasCompletedRound()) {
               if (st.gameMode === 'question') {
                   SPY_ENGINE.Firebase.sendSystemMessage('Description round complete. Free Q&A begins!');
                   // Free QA state handled by Host
                   SPY_ENGINE.Firebase.pushState(st.room.code, { freeQAActive: true });
               } else {
                   SPY_ENGINE.Firebase.sendSystemMessage('Description round complete. Time to vote!');
                   SPY_ENGINE.Firebase.pushState(st.room.code, { phase: 'voting', votes: {} });
               }
           } else {
               var nextSpeaker = OE.activeSpeaker();
               SPY_ENGINE.Firebase.sendSystemMessage('Turn ended. ' + (nextSpeaker.name || 'Next player') + ' is speaking.');
               SPY_ENGINE.Firebase.pushState(st.room.code, { speakerIndex: st.speakerIndex });
           }
       }
       return;
    }

    var OE = SPY_ENGINE.OfflineEngine;
    OE.advanceSpeaker();

    /* Check if round complete — if question mode, start free Q&A */
    var active = OE.activePlayers();

    if (OE.hasCompletedRound && typeof OE.hasCompletedRound === 'function' && OE.hasCompletedRound()) {
      if (st.gameMode === 'question') {
        st.freeQAActive = true;
        html('game-center-label', 'Free Q&A');
        html('game-center-sub', 'Anyone can ask anyone — or vote!');
        _updateTimerDisplay(window.SPY_CONFIG.TIMERS.FREE_QA);
        SPY_ENGINE.Timer.start(window.SPY_CONFIG.TIMERS.FREE_QA, _updateTimerDisplay, function () {
          _openVotingPhase();
        });
      } else {
        _openVotingPhase();
      }
    } else {
      renderGameScreen();
    }
  }

  /* ═══════════════════════════════════════════════════════════
     SCREEN: VOTING
  ═══════════════════════════════════════════════════════════ */
  function _openVotingPhase() {
    _votesCast = {};
    goTo('screen-voting');
    renderVoting();
  }

  function renderVoting(roomData) {
    var st = SPY_ENGINE.state();
    var isOnline = !!roomData;
    var active = SPY_ENGINE.OfflineEngine.activePlayers();
    var isHost = isOnline && (st.localPlayerId === roomData.hostId);

    html('voting-title', 'Who Is The Spy?');
    html('voting-sub', isOnline ? 'Collective Voting Phase' : 'Vote to eliminate a player');

    var grid = $('voting-grid');
    if (!grid) return;

    var markup = '';
    active.forEach(function (p) {
      // Live vote counts for online mode
      var vCount = 0;
      if (isOnline && roomData.votes) {
          vCount = Object.values(roomData.votes).filter(function(vid) { return vid === p.id; }).length;
      }

      var hasVoted = isOnline && (roomData.votes && roomData.votes[st.localPlayerId] !== undefined);
      var isSelf = isOnline && (p.id === st.localPlayerId);

      markup +=
        '<div class="vote-card ' + (isSelf ? 'vote-card--disabled' : '') + '" data-pid="' + p.id + '">' +
        avatarBadge(p, 56) +
        '<div class="vote-card__name">' + p.name + (isSelf ? ' (You)' : '') + '</div>' +
        '<div class="vote-card__votes" id="vcount-' + p.id + '">' + vCount + ' vote' + (vCount !== 1 ? 's' : '') + '</div>' +
        (!hasVoted && !isSelf ? '<button class="btn btn--vote" data-pid="' + p.id + '">VOTE</button>' : '') +
        '</div>';
    });
    grid.innerHTML = markup;

    var voterLabel = $('voter-label');
    if (!isOnline) {
      /* Track votes — offline: all votes shown sequentially */
      var voterIdx = 0;
      function updateVoterLabel() {
        if (voterIdx >= active.length) {
          _processVotingResult();
          return;
        }
        if (voterLabel) voterLabel.textContent = active[voterIdx].name + ', cast your vote';
      }
      updateVoterLabel();

      grid.onclick = function (e) {
        var btn = e.target.closest('.btn--vote');
        if (!btn) return;
        if (voterIdx >= active.length) return;

        var targetId = btn.dataset.pid;
        var voterId = active[voterIdx].id;
        SPY_ENGINE.OfflineEngine.castVote(voterId, targetId);
        voterIdx++;
        updateVoterLabel();
      };
    } else {
       /* Online collective logic */
       if (voterLabel) {
           var hasVoted = (roomData.votes && roomData.votes[st.localPlayerId] !== undefined);
           voterLabel.textContent = hasVoted ? 'Waiting for others to vote...' : 'Analyze the clues and cast your vote!';
       }

       grid.onclick = function (e) {
         var btn = e.target.closest('.btn--vote');
         if (!btn) return;
         var targetId = btn.dataset.pid;
         SPY_ENGINE.Firebase.submitVote(roomData.code, st.localPlayerId, targetId);
         toast('Vote cast!', 'success');
       };

       /* Host auto-process when everyone has voted */
       if (isHost) {
           var votesArr = roomData.votes ? Object.keys(roomData.votes) : [];
           var activeIds = active.map(function(p) { return p.id; });
           var everyoneVoted = activeIds.every(function(id) { return roomData.votes && roomData.votes[id] !== undefined; });
           
           if (everyoneVoted && votesArr.length >= active.length) {
               setTimeout(function() {
                   _processOnlineVotingResult(roomData);
               }, 2000);
           }
       }
    }
  }

  function _processOnlineVotingResult(roomData) {
    if (!roomData.votes) return;
    var counts = {};
    Object.values(roomData.votes).forEach(function(pid) {
      counts[pid] = (counts[pid] || 0) + 1;
    });

    var max = 0;
    var candidates = [];
    Object.keys(counts).forEach(function(pid) {
      if (counts[pid] > max) { max = counts[pid]; candidates = [pid]; }
      else if (counts[pid] === max) { candidates.push(pid); }
    });

    if (candidates.length > 1) {
        SPY_ENGINE.Firebase.sendSystemMessage("Tie detected! Resetting votes for a tie-breaker.");
        SPY_ENGINE.Firebase.pushState(roomData.code, { votes: {} }); 
        return;
    }

    var eliminatedId = candidates[0];
    var eliminated = roomData.players[eliminatedId];
    if (!eliminated) return;

    var updates = {
      phase: 'elimination_reveal',
      lastEliminatedId: eliminatedId,
      votes: {}
    };
    updates['players.' + eliminatedId + '.isEliminated'] = true;
    
    SPY_ENGINE.Firebase.pushState(roomData.code, updates);
  }

  function renderEliminationReveal(roomData) {
    var st = SPY_ENGINE.state();
    var eliminated = roomData.players[roomData.lastEliminatedId];
    if (!eliminated) return;

    var isSpy = eliminated.role === 'spy';
    var banner = $('vote-result-banner');
    
    if (banner) {
      banner.innerHTML =
        '<div class="vote-result">' +
        '<div class="vote-result__icon">' + (isSpy ? '🕵️' : '🏘️') + '</div>' +
        '<div class="vote-result__name">' + (eliminated.name || 'Player') + ' eliminated</div>' +
        '<div class="vote-result__role role--' + (isSpy ? 'spy' : 'villager') + '">' +
        (isSpy ? 'They were the SPY!' : 'They were a VILLAGER…') +
        '</div>' +
        '</div>';
      banner.classList.add('vote-result-banner--show');
    }

    /* Auto-advance after reveal */
    setTimeout(function() {
        banner.classList.remove('vote-result-banner--show');
        if (st.localPlayerId === roomData.hostId) {
            _checkOnlineWin(roomData, isSpy);
        }
    }, 4000);
  }

  function _checkOnlineWin(roomData, justEliminatedSpy) {
     var players = Object.values(roomData.players).filter(function(p) { return !p.isEliminated; });
     var spies = players.filter(function(p) { return p.role === 'spy'; });
     
     if (spies.length === 0) {
         // Villagers win or Spy Guess? 
         // In standard rules, if last spy eliminated, villagers win. 
         // But some rules allow spy to guess if they are eliminated.
         goTo('screen-spy-guess');
         renderSpyGuess(roomData.lastEliminatedId, roomData);
         return;
     }

     if (players.length <= 2 || spies.length >= (players.length - spies.length)) {
         // Spies win
         _onlineGameOver(roomData, 'spies');
         return;
     }

     // Continue game
     SPY_ENGINE.Firebase.pushState(roomData.code, {
         phase: 'speaking',
         currentRound: (roomData.currentRound || 1) + 1,
         speakerIndex: 0
     });
  }

  function _onlineGameOver(roomData, winner) {
      SPY_ENGINE.Firebase.pushState(roomData.code, {
          status: 'finished',
          winner: winner,
          phase: 'results'
      });
  }
  function _processVotingResult() {
    var result = SPY_ENGINE.OfflineEngine.processVotes();
    var st = SPY_ENGINE.state();
    var active = SPY_ENGINE.OfflineEngine.activePlayers();

    if (result.isTie) {
      toast('It\'s a tie! Those players vote again.', 'warn');
      /* Re-vote among tied candidates only */
      setTimeout(function () {
        st.votes = {};
        _openVotingPhase(); /* simplified: re-run full vote */
      }, 1500);
      return;
    }

    var eliminatedId = result.candidates[0];
    
    /* Fix: Guard against undefined/null eliminated player (e.g. no votes cast) */
    if (eliminatedId === undefined || eliminatedId === null) {
        var banner = $('vote-result-banner');
        if (banner) {
          banner.innerHTML = '<div class="banner-content banner-draw">NO ONE ELIMINATED</div>';
          banner.classList.add('vote-result-banner--show');
          setTimeout(function () {
            banner.classList.remove('vote-result-banner--show');
            /* Transition back to game screen for next round */
            goTo('screen-game');
            renderRoundStart();
          }, 2500);
        }
        return;
    }

    var eliminated = active.find(function (p) { return p.id === eliminatedId; }) || {};
    var isSpy = st.spyIds.indexOf(eliminatedId) !== -1;

    SPY_ENGINE.OfflineEngine.eliminate(eliminatedId);

    /* Show result banner */
    var banner = $('vote-result-banner');
    if (banner) {
      banner.innerHTML =
        '<div class="vote-result">' +
        '<div class="vote-result__icon">' + (isSpy ? '🕵️' : '🏘️') + '</div>' +
        '<div class="vote-result__name">' + (eliminated.name || 'Player') + ' eliminated</div>' +
        '<div class="vote-result__role role--' + (isSpy ? 'spy' : 'villager') + '">' +
        (isSpy ? 'They were the SPY!' : 'They were a VILLAGER…') +
        '</div>' +
        '</div>';
      banner.classList.add('vote-result-banner--show');
    }

    /* If spy eliminated → spy can guess */
    if (isSpy) {
      setTimeout(function () {
        goTo('screen-spy-guess');
        renderSpyGuess(eliminatedId);
      }, 2000);
    } else {
      /* Check win */
      setTimeout(function () {
        var win = SPY_ENGINE.OfflineEngine.checkWin();
        if (win) {
          _showResults(win);
        } else {
          SPY_ENGINE.OfflineEngine.nextRound();
          goTo('screen-game');
          renderGameScreen();
        }
      }, 2000);
    }
  }

  /* ═══════════════════════════════════════════════════════════
     SCREEN: SPY GUESS
  ═══════════════════════════════════════════════════════════ */
  function renderSpyGuess(spyId, roomData) {
    var st = SPY_ENGINE.state();
    var isOnline = !!roomData;
    var spy;

    if (isOnline) {
        spy = roomData.players[spyId];
    } else {
        spy = st.players.find(function (p) { return p.id === spyId; }) || {};
    }

    var options = SPY_ENGINE.WordManager.guessOptions(st.villagerWord, st.category, 6);

    html('spy-guess-player', (spy.name || 'YOU') + ' — you\'re the Spy!');
    html('spy-guess-sub', 'Guess the villagers\' word to win. One chance only!');

    var grid = $('spy-guess-grid');
    var markup = '';
    options.forEach(function (w) {
      markup += '<button class="guess-btn" data-word="' + w + '">' + w + '</button>';
    });
    grid.innerHTML = markup;

    /* Timer */
    SPY_ENGINE.Timer.start(window.SPY_CONFIG.TIMERS.SPY_GUESS, function (v) {
      var te = $('spy-guess-timer');
      if (te) te.textContent = v + 's';
      if (v <= 0) {
        var res = { winner: 'villagers', reason: 'timeout' };
        _showResults(res);
      }
    }, null);

    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.guess-btn');
      if (!btn) return;
      SPY_ENGINE.Timer.stop();
      var guess = btn.dataset.word;
      btn.classList.add('guess-btn--chosen');

      var res = SPY_ENGINE.OfflineEngine.spyGuess(guess);

      /* Reveal correct */
      $$('.guess-btn').forEach(function (b) {
        if (b.dataset.word === st.villagerWord) b.classList.add('guess-btn--correct');
      });

      setTimeout(function () {
        _showResults(res);
      }, 1800);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     SCREEN: RESULTS
  ═══════════════════════════════════════════════════════════ */
  function _showResults(win) {
    var st = SPY_ENGINE.state();
    SPY_ENGINE.set('winner', win.winner);
    SPY_ENGINE.set('winReason', win.reason);

    var isVillagerWin = win.winner === 'villagers';

    html('results-title', isVillagerWin ? '🏆 VILLAGERS WIN!' : '🕵️ SPIES WIN!');

    var reasonMap = {
      'all_spies_eliminated': 'All spies were eliminated!',
      'survived_to_final': 'Spies survived to the final round!',
      'correct_guess': 'The Spy guessed the correct word!',
      'wrong_guess': 'The Spy guessed wrong!',
      'outnumbered': 'Spies outnumbered the villagers!',
      'timeout': 'Time ran out — the Spy failed to guess!'
    };
    html('results-reason', reasonMap[win.reason] || '');

    /* Player role reveal */
    var list = $('results-players');
    var markup = '';
    st.players.forEach(function (p) {
      var isSpy = st.spyIds.indexOf(p.id) !== -1;
      markup +=
        '<div class="result-player ' + (isSpy ? 'result-player--spy' : 'result-player--villager') + '">' +
        avatarBadge(p, 44) +
        '<div class="result-player__info">' +
        '<span class="result-player__name">' + p.name + '</span>' +
        '<span class="result-player__role">' + (isSpy ? '🕵️ Spy' : '🏘️ Villager') + '</span>' +
        (p.role !== window.SPY_CONFIG.ROLES.SPY
          ? '<span class="result-player__word">Word: ' + st.villagerWord + '</span>'
          : '') +
        '</div>' +
        '</div>';
    });
    list.innerHTML = markup;

    goTo('screen-results');
  }

  function initResults() {
    $('btn-play-again').addEventListener('click', function () {
      goTo('screen-main');
    });

    $('btn-change-settings').addEventListener('click', function () {
      _fillCreateRoom('offline');
      goTo('screen-create-room');
    });
  }

  /* ═══════════════════════════════════════════════════════════
     MODAL: GAME RULES
  ═══════════════════════════════════════════════════════════ */
  function openRules(defaultTab) {
    var modal = $('modal-rules');
    if (!modal) return;
    modal.classList.add('modal--open');
    switchRulesTab(defaultTab || 'characters');
  }

  function closeRules() {
    var modal = $('modal-rules');
    if (modal) modal.classList.remove('modal--open');
  }

  function switchRulesTab(tab) {
    /* Tabs */
    $$('.rules-tab').forEach(function (t) {
      t.classList.toggle('rules-tab--active', t.dataset.tab === tab);
    });
    /* Panels — use class, not style.display, so CSS controls visibility */
    $$('.rules-panel').forEach(function (p) {
      var isActive = p.dataset.panel === tab;
      p.classList.toggle('rules-panel--show', isActive);
      /* Also clear any leftover inline style from old code */
      p.style.display = '';
    });
  }

  function initRulesModal() {
    $('btn-rules-close').addEventListener('click', closeRules);

    $$('.rules-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        switchRulesTab(this.dataset.tab);
      });
    });

    $('modal-rules').addEventListener('click', function (e) {
      if (e.target === this) closeRules();
    });
  }

  /* ─── Helper: get player profile ────────────────────────────── */
  function _buildPlayerProfile(isOnline) {
    var cached = window._currentUserDataCache || {};
    var authUser = (window.auth && window.auth.currentUser) ? window.auth.currentUser : null;

    /* Combine data sources */
    var uid = (authUser && authUser.uid) || (cached && cached.uid) || ('guest_' + Math.random().toString(36).substr(2, 9));
    var name = (cached && (cached.playerName || cached.displayName || cached.name)) 
            || (authUser && (authUser.displayName)) 
            || 'Player';

    if (isOnline) {
      return {
        uid: uid,
        playerName: name,
        photoURL: (cached && (cached.photoURL || cached.photo)) || (authUser && authUser.photoURL) || null,
        equipped: cached.equipped || null,
        customId: cached.customId || null,
        avatarIndex: 0
      };
    }

    return {
      playerName: name,
      avatarIndex: 0
    };
  }

  /* ─── Particles background — enhanced cyber nodes ─────────── */
  function initParticles() {
    var canvas = $('bg-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var pts = [], shoots = [], tick = 0;
    var W, H, mouseX = -999, mouseY = -999;

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', function (e) { mouseX = e.clientX; mouseY = e.clientY; });
    window.addEventListener('touchmove', function (e) {
      if (e.touches[0]) { mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY; }
    }, { passive: true });

    var N = Math.min(70, Math.floor(window.innerWidth * window.innerHeight / 13000));
    for (var i = 0; i < N; i++) {
      pts.push({
        x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
        a: Math.random() * Math.PI * 2, da: (Math.random() - 0.5) * 0.008,
        hue: Math.random() > 0.68 ? 'cyan' : 'gold'
      });
    }

    function spawnShoot() {
      shoots.push({
        x: Math.random() * W, y: 0,
        len: Math.random() * 90 + 40, spd: Math.random() * 5 + 3,
        ang: Math.PI * 0.36 + (Math.random() - 0.5) * 0.28, life: 1
      });
    }

    function loop() {
      tick++;
      ctx.clearRect(0, 0, W, H);

      var grd = ctx.createRadialGradient(W * .5, H * .38, 0, W * .5, H * .38, W * .44);
      grd.addColorStop(0, 'rgba(18,8,55,0.16)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

      pts.forEach(function (p, i) {
        var dx = mouseX - p.x, dy = mouseY - p.y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < 190) { p.vx += dx / dist * 0.004; p.vy += dy / dist * 0.004; }
        p.vx *= 0.994; p.vy *= 0.994;
        p.x = (p.x + p.vx + W) % W; p.y = (p.y + p.vy + H) % H; p.a += p.da;
        var alpha = 0.22 + 0.38 * Math.sin(p.a);
        var r = p.r * (0.8 + 0.2 * Math.sin(p.a * 0.9));
        ctx.fillStyle = p.hue === 'cyan' ? 'rgba(0,212,255,' + alpha + ')' : 'rgba(212,168,67,' + alpha + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], ddx = p.x - q.x, ddy = p.y - q.y;
          var d2 = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d2 < 100) {
            var la = (1 - d2 / 100) * 0.14;
            ctx.strokeStyle = p.hue === 'cyan' ? 'rgba(0,212,255,' + la + ')' : 'rgba(212,168,67,' + la + ')';
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      });

      if (tick % 190 === 0 && Math.random() > 0.35) spawnShoot();
      shoots = shoots.filter(function (s) { return s.life > 0; });
      shoots.forEach(function (s) {
        s.x += Math.cos(s.ang) * s.spd; s.y += Math.sin(s.ang) * s.spd; s.life -= 0.02;
        var ta = s.life * 0.9;
        var g = ctx.createLinearGradient(s.x, s.y, s.x - Math.cos(s.ang) * s.len, s.y - Math.sin(s.ang) * s.len);
        g.addColorStop(0, 'rgba(240,200,120,' + ta + ')'); g.addColorStop(1, 'rgba(240,200,120,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - Math.cos(s.ang) * s.len, s.y - Math.sin(s.ang) * s.len); ctx.stroke();
      });
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ═══════════════════════════════════════════════════════════
     BOOTSTRAP
  ═══════════════════════════════════════════════════════════ */
  function init(container, opts) {
    // ✅ FIX: Check if #app is inside THIS container, not anywhere in the document.
    // The old check (document.getElementById('app')) would prevent re-init when
    // a stale #app existed in a previously detached container (e.g. after closing
    // and reopening the game from Browse Rooms).
    var existingApp = container ? container.querySelector('#app') : document.getElementById('app');
    if (existingApp) {
      console.log('[SPY_UI] Already initialized in this container, skipping template injection');
      return;
    }

    // ✅ CLEANUP: Remove any stale #app from detached DOM trees to prevent
    // getElementById('app') conflicts elsewhere in the codebase.
    var staleApp = document.getElementById('app');
    if (staleApp && staleApp.parentNode) {
      console.log('[SPY_UI] Removing stale #app from previous session');
      staleApp.parentNode.removeChild(staleApp);
    }

    opts = opts || {};

    if (container) {
      container.innerHTML = ''; /* Ensure no duplicate injection (T003) */
      container.innerHTML = UI_TEMPLATE;
    }
    
    /* Global Reset: Ensure no ghost modals block the interaction (T004) */
    $$('.modal').forEach(function(m) { m.classList.remove('modal--open'); });
    
    SPY_ENGINE.init();
    initParticles();
    initMain();
    initOnlineHub();
    initJoinRoom();
    initOfflineHub();
    initCreateRoom();
    initRoomLobby();
    initRoleReveal();
    initResults();
    initRulesModal();
    initSplash(opts);

    console.log('[SPY_UI] ready');
  }

  /* ─── Public ───────────────────────────────────────────────── */
  return {
    init: init,
    goTo: goTo,
    toast: toast,
    onRoomUpdate: onRoomUpdate,
    openRules: openRules,
    renderGameScreen: renderGameScreen,
    initJoinRoom: function (code, pass) {
        if (!code) return;
        
        console.log('[SPY_UI] initJoinRoom triggered for:', code);

        // Immediate Cleanup: Remove any stale modal or overlay artifacts
        var reconnectModal = document.getElementById('modal-reconnect');
        if (reconnectModal) reconnectModal.classList.remove('modal--open');
        
        // Preemptive State Fix: Ensure incoming Firestore updates are not rejected during transition
        _activeScreen = 'screen-room-lobby';
        
        // Visual Transition First: Don't stall on the Online Hub
        renderRoomLobby(null, false); // Show 'SYNCHRONIZING...'
        goTo('screen-room-lobby');

        var profile = _buildPlayerProfile(true);
        SPY_ENGINE.RoomManager.joinRoom({
            code: code,
            password: pass,
            playerName: profile.playerName,
            profile: profile,
            onSuccess: function (player) {
                var roomData = SPY_ENGINE.state().room;
                console.log('[SPY_UI] Join success, updating lobby UI');
                renderRoomLobby(roomData, false);
                goTo('screen-room-lobby'); // ✅ FIX: Ensure screen transition after DOM is ready
                
                // Final Sync: Catch any updates that happened during the animation
                setTimeout(function() {
                  var currentRoom = SPY_ENGINE.state().room;
                  renderRoomLobby(currentRoom, false);
                }, 250);

                toast((window.currentLang === 'ar' ? 'تم الانضمام للغرفة ' : 'Joined room ') + code, 'success');
            },
            onError: function (err) { 
                _activeScreen = 'screen-online-hub';
                goTo('screen-online-hub');
                toast(window.currentLang === 'ar' ? 'فشل الانضمام' : 'Join failed', 'error'); 
            }
        });
    },
    renderRoomLobby: renderRoomLobby
  };

}());


