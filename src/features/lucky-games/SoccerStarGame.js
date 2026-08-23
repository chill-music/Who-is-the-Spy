(function () {
  "use strict";

  /**
   * SOCCER STAR - High-Fidelity Restoration
   * Integrated into LuckyGamesHub
   */

  const TEAMS = {
    barcelona: { id: 'barcelona', name: 'Barcelona', mult: 45, bg: 'radial-gradient(circle,#A50044,#003DA5)', logo: 'icos/FootballClubLogo/Fc_barcelona.png' },
    realmadrid: { id: 'realmadrid', name: 'Real Madrid', mult: 25, bg: 'radial-gradient(circle,#fff,#00529F)', logo: 'icos/FootballClubLogo/Real_Madrid_CF.png' },
    psg: { id: 'psg', name: 'PSG', mult: 15, bg: 'radial-gradient(circle,#004170,#DA291C)', logo: 'icos/FootballClubLogo/Paris_Saint-Germain_FC.png' },
    liverpool: { id: 'liverpool', name: 'Liverpool', mult: 10, bg: 'radial-gradient(circle,#C8102E,#00B2A9)', logo: 'icos/FootballClubLogo/Liverpool_FC.png' },
    manchester: { id: 'manchester', name: 'Man United', mult: 5, bg: 'radial-gradient(circle,#DA291C,#FBE122)', logo: 'icos/FootballClubLogo/Manchester_United_FC-Logo.png' },
    acmilan: { id: 'acmilan', name: 'AC Milan', mult: 5, bg: 'radial-gradient(circle,#E32221,#111)', logo: 'icos/FootballClubLogo/AC_Milan.png' },
    bayernmunich: { id: 'bayernmunich', name: 'Bayern Munich', mult: 5, bg: 'radial-gradient(circle,#DC052D,#0066B2)', logo: 'icos/FootballClubLogo/FC_Bayern_MÃ¼nchen.png' },
    juventus: { id: 'juventus', name: 'Juventus', mult: 5, bg: 'radial-gradient(circle,#232323,#555)', logo: 'icos/FootballClubLogo/Juventus_FC_2017.png' }
  };

  const CHIPS = [100, 1000, 10000, 100000];
  const RECORDS_PER_PAGE = 10;

  /* â”€â”€ R-5 SECURITY CONSTANTS (SECURITY_AUDIT.md G-4) â”€â”€
     Weighted winner draw matching the odds table shown in HOW TO PLAY:
     every team returns ~97.2% RTP (house edge ~2.8%). Weights sum to 100000.
     Fixes the uniform-draw exploit that gave Barcelona EV 5.63x. */
  const TEAM_WEIGHTS = {
    barcelona: 2160, realmadrid: 3888, psg: 6480, liverpool: 9720,
    manchester: 19438, acmilan: 19438, bayernmunich: 19438, juventus: 19438
  };
  const TEAM_IDS = Object.keys(TEAMS);

  /* FNV-1a 32-bit â€” deterministic across all clients */
  function _fnv1a(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  }
  function _pickWeightedTeam(rand) {
    const total = TEAM_IDS.reduce((a, id) => a + TEAM_WEIGHTS[id], 0);
    let acc = 0;
    const x = rand * total;
    for (const id of TEAM_IDS) {
      acc += TEAM_WEIGHTS[id];
      if (x < acc) return id;
    }
    return TEAM_IDS[TEAM_IDS.length - 1];
  }
  /* Deterministic outcome shared by every client from server entropy */
  function _computeSoccerOutcome(revealMillis, saltStr) {
    const s1 = _fnv1a(saltStr + '#' + revealMillis);
    return _pickWeightedTeam((s1 % 100000) / 100000);
  }

  /* Canonical session doc path (was a bare root-level collection â€”
     normalized to artifacts/<appId>/public/data to match security rules). */
  function ssSessionRef() {
    return window.db.collection('artifacts').doc(window.appId)
      .collection('public').doc('data')
      .collection('lucky_games_sessions').doc('soccer_star');
  }

  let containerEl = null;
  let authUser = null;
  let lang = 'en';

  // Game State
  let userCoins = 0;
  let currentChip = 100;
  let myBets = {}; // { teamId: amount }
  let lastTotalWin = 0;
  let status = 'betting'; // 'betting' | 'reveal'
  let timeLeft = 30;
  let hasRevealed = false;

  // Firebase Refs & Unsubs
  let sessionUnsub = null;
  let winnersUnsub = null;
  let currencyUnsub = null;

  // Local Records
  let recordsPage = 0;

  // Local timer loop
  let timerInterval = null;

  /**
   * HTML TEMPLATE (Strict parity with OG-soccer-star/soccer-star.html)
   */
  const HTML_TEMPLATE = `
  <div id="soccerStarGame">
    <div class="field-bg"></div>
    <div class="field-line-inner"></div>

    <div class="header-bar">
      <div class="ctrl-btns">
        <button class="ctrl-btn" id="exitBtn" title="Exit">
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
        <button class="ctrl-btn" id="rulesBtn" title="How to Play">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
        </button>
        <button class="ctrl-btn" id="recordsBtn" title="Records">
          <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>
        </button>
      </div>
      <div id="userAvatarContainer" style="position: absolute; right: 16px; top: 12px; width: 44px; height: 44px; cursor: pointer;"></div>
    </div>

    <div class="game-title">SOCCER STAR</div>
    <div class="trophy-wrap"><div class="trophy-icon">ðŸ†</div></div>

    <div class="betting-area">
      <div class="team-grid">
        ${renderTeamCard('barcelona')}
        ${renderTeamCard('manchester')}
        ${renderTeamCard('acmilan')}
        
        ${renderTeamCard('realmadrid')}
        <div class="timer-cell">
          <div class="timer-box">
            <div class="timer-label">Time Left:</div>
            <div class="timer-count" id="timerDisplay">30s</div>
          </div>
        </div>
        ${renderTeamCard('bayernmunich')}

        ${renderTeamCard('psg')}
        ${renderTeamCard('liverpool')}
        ${renderTeamCard('juventus')}
      </div>
    </div>

    <div class="cups-row">
      <div class="cup-item">
        <div class="cup-icon">ðŸ¥ˆ</div>
        <div class="cup-label silver">Silver</div>
      </div>
      <div class="select-hint" id="hintText">Select The Amount Of Gold > Select Team</div>
      <div class="cup-item">
        <div class="cup-icon">ðŸ†</div>
        <div class="cup-label gold">Gold</div>
      </div>
    </div>

    <div class="results-strip-wrap">
      <div class="results-strip-box">
        <span class="results-label">Results :</span>
        <div id="resultsStrip" style="display:contents"></div>
      </div>
    </div>

    <div class="bottom-bar">
      <div class="bottom-stats">
        <div>
          <div class="win-label">Win: <span id="totalWinDisplay">0</span></div>
          <div class="coin-display">
            <span class="coin-icon">ðŸ§ </span>
            <span id="coinDisplay">0</span>
            <span style="font-size:11px;opacity:.6"> â€º</span>
          </div>
        </div>
        <button class="clear-btn" id="clearBetsBtn">Clear</button>
      </div>
      <div class="chips-row">
        ${CHIPS.map(val => `
          <button class="chip-btn ${val === currentChip ? 'active' : ''}" data-value="${val}">
            <span class="chip-coin">ðŸ§ </span>
            <span class="chip-amount">${val.toLocaleString()}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Modals -->
    <div class="ss-modal-overlay" id="howToPlayModal">
      <div class="ss-modal-box">
        <div class="ss-modal-header">
          <button class="ss-modal-back" data-close="howToPlay">&#9664;</button>
          <div class="ss-modal-title">HOW TO PLAY</div>
        </div>
        <div class="ss-modal-body">
          <div class="rules-section">
            <h3>01. Gameplay Instructions:</h3>
            <div class="rule-item">
              <div class="rule-num">1</div>
              <div class="rule-text">Each round has <strong>30 seconds</strong> to select, during which you can choose your favorite team and invest coins.</div>
            </div>
            <div class="rule-item">
              <div class="rule-num">2</div>
              <div class="rule-text">The probability of each team being selected is as follows:</div>
            </div>
            <table class="prob-table">
              <thead><tr><th>Team Name</th><th>Multiplier</th><th>Win Probability</th></tr></thead>
              <tbody>
                <tr><td>Manchester United</td><td>x5</td><td>19.438%</td></tr>
                <tr><td>AC Milan</td><td>x5</td><td>19.438%</td></tr>
                <tr><td>Bayern Munich</td><td>x5</td><td>19.438%</td></tr>
                <tr><td>Juventus</td><td>x5</td><td>19.438%</td></tr>
                <tr><td>Liverpool</td><td>x10</td><td>9.720%</td></tr>
                <tr><td>PSG</td><td>x15</td><td>6.480%</td></tr>
                <tr><td>Real Madrid</td><td>x25</td><td>3.888%</td></tr>
                <tr><td>Barcelona</td><td>x45</td><td>2.160%</td></tr>
              </tbody>
            </table>
            <div class="rule-item" style="margin-top:12px">
              <div class="rule-num">3</div>
              <div class="rule-text">Max team types per round: <strong>8</strong>. Max investment per round: <strong>1,000,000</strong>.</div>
            </div>
            <div class="rule-item">
              <div class="rule-num">4</div>
              <div class="rule-text">If your selected team wins, you receive the reward multiplier for that team.</div>
            </div>
            <div class="rule-item">
              <div class="rule-num">5</div>
              <div class="rule-text">If your selected team does not win, you may still receive a random item reward.</div>
            </div>
            <div class="rule-item">
              <div class="rule-num">6</div>
              <div class="rule-text">If the <strong>Silver Cup</strong> is selected, all users who bet on the Silver team receive a reward.</div>
            </div>
            <div class="rule-item">
              <div class="rule-num">7</div>
              <div class="rule-text">If the <strong>Gold Cup</strong> is selected, all users who bet on the Gold team receive a reward.</div>
            </div>
          </div>
          <div class="rules-section">
            <h3>02. Important Notes:</h3>
            <div class="rule-item">
              <div class="rule-num">1</div>
              <div class="rule-text">Coins obtained through the game are for in-platform use only and cannot be exchanged for fiat currency.</div>
            </div>
            <div class="rule-item">
              <div class="rule-num">2</div>
              <div class="rule-text">Random probability features are for entertainment only. Usage for gambling or fraud is strictly prohibited.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="ss-modal-overlay" id="gameRecordsModal">
      <div class="ss-modal-box">
        <div class="ss-modal-header">
          <button class="ss-modal-back" data-close="gameRecords">&#9664;</button>
          <div class="ss-modal-title">GAME RECORDS</div>
        </div>
        <div class="ss-modal-body">
          <div class="date-nav">
             <!-- Simplified date nav for now -->
             <span id="recordDateDisplay">Today</span>
          </div>
          <div class="records-table-wrap">
            <div class="records-header">
              <span>Time</span><span>Input</span><span>Results</span>
            </div>
            <div class="records-body" id="recordsBody"></div>
            <div class="pagination-controls">
               <button class="page-btn" id="prevPageBtn" disabled>&#8249; Prev</button>
               <button class="page-btn" id="nextPageBtn">Next &#8250;</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="resultPopup">
      <div class="result-box">
        <div class="result-header-bar">
          <span style="font-size:18px">ðŸ†</span>
          <div class="result-title">RESULT</div>
          <span style="font-size:18px">ðŸ†</span>
          <div class="result-close-timer" id="resultCloseBtn">5s âœ•</div>
        </div>
        <div class="result-content">
          <div class="winning-card">
            <div class="winning-badge">Winning Results</div>
            <div class="winning-inner">
              <div class="winner-photo-wrap" id="resultWinnerPhoto">
                <img src="" alt="" id="resultWinnerImg">
              </div>
              <div class="winning-info">
                <p id="resTeamLabel">Result: <img src="" class="win-club-logo" id="resClubLogo"> <strong id="resClubName">â€”</strong></p>
                <p id="resBetLabel">My Input: <strong id="resBetAmt">0</strong> ðŸ§ </p>
                <p id="resWinLabel">Bonus: <strong id="resWinAmt">0</strong> ðŸ§ </p>
              </div>
            </div>
          </div>
          <div class="top3-winners-area">
            <div class="top3-title">Top Three Winners For This Round</div>
            <div id="topRoundWinnersList">
               <div class="empty-state" style="padding:10px">ðŸ“¦ No Data</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="phase-flash" id="phaseFlash"></div>
    <div class="toast" id="toast"></div>
  </div>
  `;

  function renderTeamCard(id) {
    const t = TEAMS[id];
    return `
      <div class="team-card" data-team="${id}" data-mult="${t.mult}">
        <div class="pennant-outer">
          <div class="pennant">
            <div class="me-label" id="me-${id}">me: 0</div>
            <div class="logo-circle">
              <img src="${t.logo}" alt="${t.name}">
            </div>
            <div class="mult-badge">x${t.mult}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * CORE LOGIC
   */
  const SoccerStarGame = {
    gameHistory: [],
    sessionUnsub: null,
    start: function (container, options = {}) {
      containerEl = container;
      const stateObj = window.s7GameUserData || window.userData || window.currentUserData;
      const firebaseAuth = window.firebase && window.firebase.auth && window.firebase.auth().currentUser;
      authUser = options.user || firebaseAuth || stateObj;
      lang = options.lang || 'en';

      if (!containerEl) return;
      containerEl.innerHTML = HTML_TEMPLATE;

      this.initEventListeners();
      this.subscribeAll();
      this.updateUIStrings();
      this.loadLocalRecords();

      if (authUser) {
        const avatarContainer = document.getElementById('userAvatarContainer');
        if (avatarContainer && window.ReactDOM && window.React && window.AvatarWithFrameV11) {
          window.ReactDOM.render(
            window.React.createElement(window.AvatarWithFrameV11, {
              photoURL: authUser.photoURL || 'icos/idon.png',
              equipped: authUser.equipped,
              size: 'sm',
              lang: lang,
              banData: authUser.banData
            }),
            avatarContainer
          );

          /* Click â†’ MiniProfile: Enhanced capture logic for both frame and image */
          const openUser = (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            const currentUid = (authUser && authUser.uid) ? authUser.uid : null;
            if (!currentUid) {
              console.warn("[SoccerStar] Cannot open Mini-Profile: No UID detected.", authUser);
              return;
            }
            if (typeof window.openLuckyGamesMiniProfile === 'function') {
              window.openLuckyGamesMiniProfile(currentUid);
            } else if (typeof window.openMiniProfile === 'function') {
              window.openMiniProfile(currentUid);
            } else if (typeof window.setMiniProfileUID !== 'undefined') {
              window.setMiniProfileUID(currentUid);
              if (window.setShowMiniProfile) window.setShowMiniProfile(true);
            }
          };
          avatarContainer.onclick = openUser;
          avatarContainer.style.zIndex = "999";
          avatarContainer.style.pointerEvents = "auto";
          console.log("[SoccerStar] Click-to-profile enabled for:", authUser ? authUser.uid : "unknown");
        }
      }
      console.log("[SoccerStar] Game started for:", authUser ? authUser.uid : "Guest");
    },

    stop: function () {
      this.unsubscribeAll();
      containerEl = null;
    },

    setLanguage: function (newLang) {
      lang = newLang;
      this.updateUIStrings();
    },

    initEventListeners: function () {
      // Exit
      document.getElementById('exitBtn').onclick = () => window.closeLuckyGamesHub?.();

      // Modals
      document.getElementById('rulesBtn').onclick = () => openModal('howToPlay');
      document.getElementById('recordsBtn').onclick = () => { recordsPage = 0; this.renderRecords(); openModal('gameRecords'); };

      document.querySelectorAll('.ss-modal-back').forEach(btn => {
        btn.onclick = () => closeModal(btn.dataset.close);
      });

      // Chips
      document.querySelectorAll('.chip-btn').forEach(btn => {
        btn.onclick = () => {
          document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentChip = parseInt(btn.dataset.value);
        };
      });

      // Team Cards (Betting)
      document.querySelectorAll('.team-card').forEach(card => {
        card.onclick = () => this.placeBet(card.dataset.team);
      });

      // Clear Bets
      document.getElementById('clearBetsBtn').onclick = () => this.clearAllBets();

      // Pagination
      document.getElementById('prevPageBtn').onclick = () => { if (recordsPage > 0) { recordsPage--; this.renderRecords(); } };
      document.getElementById('nextPageBtn').onclick = () => { recordsPage++; this.renderRecords(); };

      // MVP / Winner Profile
      document.getElementById('resultWinnerPhoto').onclick = () => {
        const winnerId = document.getElementById('resultWinnerPhoto').dataset.uid;
        if (!winnerId) return;
        if (typeof window.openLuckyGamesMiniProfile === 'function') {
          window.openLuckyGamesMiniProfile(winnerId);
        } else if (typeof window.openMiniProfile === 'function') {
          window.openMiniProfile(winnerId);
        } else if (typeof window.setMiniProfileUID !== 'undefined') {
          window.setMiniProfileUID(winnerId);
          if (window.setShowMiniProfile) window.setShowMiniProfile(true);
        }
      };

      // Result close
      document.getElementById('resultCloseBtn').onclick = () => document.getElementById('resultPopup').classList.remove('show');
    },

    subscribeAll: function () {
      const sessionRef = ssSessionRef();

      console.log("[SoccerStar] Connecting to VERIFIED root path: lucky_games_sessions/soccer_star");

      sessionUnsub = sessionRef.onSnapshot(doc => {
        if (!doc.exists) {
          console.warn("[SoccerStar] Session document not found even at root path.");
          status = 'betting'; // Default fallback
          return;
        }
        const data = doc.data();
        this.handleSessionUpdate(data);
      }, err => {
        console.error("[SoccerStar] Snapshot error:", err);
      });

      if (authUser) {
        currencyUnsub = window.usersCollection.doc(authUser.uid).onSnapshot(doc => {
          if (doc.exists) {
            userCoins = doc.data().currency || 0;
            const coinDisp = document.getElementById('coinDisplay');
            if (coinDisp) coinDisp.textContent = userCoins.toLocaleString();
          }
        });
      }
    },

    unsubscribeAll: function () {
      if (sessionUnsub) sessionUnsub();
      if (winnersUnsub) winnersUnsub();
      if (currencyUnsub) currencyUnsub();
      if (timerInterval) clearInterval(timerInterval);
    },

    /* ── R-5 COMMIT-REVEAL ENGINE ──
       1. Transaction: once timerEndsAt has passed and nothing is revealed,
          commit `revealTs` = Firestore server timestamp (unpredictable —
          no client, not even the fastest racer, can choose the outcome).
       2. Deterministically derive winner = weightedPick(hash(revealTs, salt)).
       3. Publish status/lastWinnerId/history for late joiners, then open the
          next betting round after an 8s pause. */
    triggerReveal: async function () {
      const sessRef = ssSessionRef();
      try {
        await window.db.runTransaction(async t => {
          const snap = await t.get(sessRef);
          if (!snap.exists) return;
          const d = snap.data();
          const endMs = d.timerEndsAt ? (d.timerEndsAt.toMillis ? d.timerEndsAt.toMillis() : d.timerEndsAt) : 0;
          if (!endMs || Date.now() < endMs - 1000) return;   /* round still open */
          if (d.revealTs || d.lastWinnerId) return;          /* already revealed */
          t.set(sessRef, { revealTs: window.firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
        });
      } catch (e) { /* race lost — another client is revealing */ }

      const millis = await this._waitForRevealTs(sessRef);
      if (!millis) return;

      let saltMs = 0, hist = [];
      try {
        const snap2 = await sessRef.get({ source: 'server' });
        if (!snap2.exists) return;
        const d = snap2.data();
        saltMs = d.timerEndsAt ? (d.timerEndsAt.toMillis ? d.timerEndsAt.toMillis() : d.timerEndsAt) : 0;
        if (!saltMs) return;
        hist = Array.isArray(d.history) ? d.history.slice() : [];
        /* Already published correctly? nothing to do except round advance */
        if (d.lastWinnerId && d.revealTs) return;
      } catch (e) { return; }

      const rw = _computeSoccerOutcome(millis, String(saltMs));
      if (hist.length > 20) hist.shift();
      hist.push(rw);

      sessRef.update({
        status: 'reveal',
        lastWinnerId: rw,
        timer: 0,
        history: hist
      }).catch(err => console.warn("[SoccerStar] publish:", err.message));

      setTimeout(() => {
        sessRef.update({
          status: 'betting',
          timer: 30,
          lastWinnerId: null,
          revealTs: window.firebase.firestore.FieldValue.delete(),
          timerEndsAt: (window.firebase && window.firebase.firestore) ? window.firebase.firestore.Timestamp.fromMillis(Date.now() + 30000) : (Date.now() + 30000)
        }).catch(() => {});
      }, 8000);
    },

    _waitForRevealTs: async function (sessRef, tries) {
      tries = tries || 12;
      for (let i = 0; i < tries; i++) {
        try {
          const snap = await sessRef.get({ source: 'server' });
          if (snap.exists) {
            const ts = snap.data().revealTs;
            if (ts && typeof ts.toMillis === 'function') return ts.toMillis();
          }
        } catch (e) { /* retry */ }
        await new Promise(r => setTimeout(r, 350));
      }
      return 0;
    },

    handleSessionUpdate: function (data) {
      status = data.status || 'betting';
      const newTime = data.timer !== undefined ? data.timer : (data.timeLeft !== undefined ? data.timeLeft : data.time);
      if (newTime !== undefined) timeLeft = newTime;

      const timerDisp = document.getElementById('timerDisplay');
      const updateTimerUI = () => {
        if (timerDisp) {
          timerDisp.textContent = timeLeft + 's';
          timerDisp.classList.toggle('urgent', timeLeft <= 5);
        }
      };

      if (timerInterval) clearInterval(timerInterval);
      updateTimerUI();

      // History Strip
      if (data.history) this.renderResultsStrip(data.history);

      // Betting vs Reveal
      const area = document.querySelector('.betting-area');
      if (status === 'betting') {
        if (this._rescueTimeout) {
          clearTimeout(this._rescueTimeout);
          this._rescueTimeout = null;
        }
        hasRevealed = false; // Reset lock for new round
        if (area) area.classList.remove('disabled');

        // REAL-TIME SYNC LOGIC
        const now = Date.now();
        let endsAt = 0;
        
        if (data.timerEndsAt) {
          endsAt = (data.timerEndsAt.toMillis) ? data.timerEndsAt.toMillis() : (typeof data.timerEndsAt === 'number' ? data.timerEndsAt : now + 30000);
        } else {
          // If no timerEndsAt exists, this client acts as a master for this round if it was just loaded
          // We set it to (now + timeLeft in seconds) or default 30
          const initialSecs = timeLeft > 0 ? timeLeft : 30;
          endsAt = now + (initialSecs * 1000);
          const sessRef = ssSessionRef();
          sessRef.update({ 
            timerEndsAt: (window.firebase && window.firebase.firestore) ? window.firebase.firestore.Timestamp.fromMillis(endsAt) : endsAt
          }).catch(e => console.warn("[SoccerStar] Failed to set timerEndsAt:", e));
        }

        const syncTimer = () => {
          const currentNow = Date.now();
          timeLeft = Math.max(0, Math.round((endsAt - currentNow) / 1000));
          updateTimerUI();

          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            status = 'reveal';
            if (area) area.classList.add('disabled');

            /* R-5 COMMIT-REVEAL: no client picks the winner. The first client
               to react commits an unpredictable server timestamp; every client
               derives the same deterministic winner from it, publishes it, and
               advances the round. */
            this.triggerReveal();
            this.revealResult(data);
          }
        };

        if (timeLeft > 0 || endsAt > now) {
          timerInterval = setInterval(syncTimer, 1000);
          syncTimer(); // Immediate first run
        }
      } else {
        if (area) area.classList.add('disabled');
        if (timeLeft <= 0 || status === 'reveal') {
          this.revealResult(data);

          // Rescue Mechanism: In case client gets stuck at 0 due to an aborted process
          if (!this._rescueTimeout) {
            this._rescueTimeout = setTimeout(() => {
              const sessRef = ssSessionRef();
              sessRef.get().then(snap => {
                if (snap.exists && snap.data().status === 'reveal') {
                  /* R-5: also clear reveal state so the new round starts clean */
                  sessRef.update({
                    status: 'betting',
                    timer: 30,
                    lastWinnerId: null,
                    revealTs: window.firebase.firestore.FieldValue.delete(),
                    timerEndsAt: (window.firebase && window.firebase.firestore) ? window.firebase.firestore.Timestamp.fromMillis(Date.now() + 30000) : (Date.now() + 30000)
                  });
                }
              }).catch(err => console.log('Rescue Error:', err));
              this._rescueTimeout = null;
            }, 10000);
          }
        }
      }
    },

    placeBet: function (teamId) {
      if (window._firestoreOnline === false) return this.showToast(lang === 'ar' ? 'âš ï¸ Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø§ØªØµØ§Ù„' : 'âš ï¸ No connection');
      if (status !== 'betting') return this.showToast(lang === 'ar' ? 'Ø§Ù†ØªØ¸Ø± Ø§Ù„Ø¬ÙˆÙ„Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©' : 'Wait for next round');
      if (userCoins < currentChip) return this.showToast(lang === 'ar' ? 'Ø±ØµÙŠØ¯ ØºÙŠØ± ÙƒØ§ÙÙ' : 'Insufficient Intel');

      myBets[teamId] = (myBets[teamId] || 0) + currentChip;
      userCoins -= currentChip;

      document.getElementById(`me-${teamId}`).textContent = `me: ${myBets[teamId].toLocaleString()}`;
      document.getElementById('coinDisplay').textContent = userCoins.toLocaleString();

      // Actual transaction logic
      window.SecurityService.applyCurrencyTransaction(authUser.uid, -currentChip, 'Soccer Star: Bet', { teamId })
        .catch(err => console.error(err));
    },

    clearAllBets: function () {
      // Logic for clearing is tricky with real currency. Usually you can't "clear" after the TX is sent.
      // For this build, we'll keep the OG 'Clear' button but maybe notify user it's for the current session's visual?
      // Actually, if it's already deducted, Clear won't refund. 
      // User said "Make it work as OG", but OG was local coins.
      this.showToast(lang === 'ar' ? 'Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ø³ØªØ±Ø¯Ø§Ø¯ Ø§Ù„Ø±Ù‡Ø§Ù† Ø§Ù„Ù…Ø±Ø³Ù„' : 'Cannot refund sent bets');
    },

    revealResult: function (sessionData) {
      if (hasRevealed) return; // Prevent double trigger

      /* R-5: the locally computed outcome is authoritative. If the published
         lastWinnerId was tampered with or is missing, we derive it again from
         the committed server timestamp and repair the doc. */
      let winnerId = sessionData.lastWinnerId || null;
      const rTs = sessionData.revealTs;
      const saltMs = sessionData.timerEndsAt
        ? (sessionData.timerEndsAt.toMillis ? sessionData.timerEndsAt.toMillis() : sessionData.timerEndsAt)
        : 0;

      if (rTs && typeof rTs.toMillis === 'function' && saltMs) {
        const computed = _computeSoccerOutcome(rTs.toMillis(), String(saltMs));
        if (computed !== winnerId) {
          winnerId = computed;   // never pay out on an untrusted value
          ssSessionRef().update({ lastWinnerId: computed })
            .catch(() => {});
        }
      }

      if (!winnerId) return; // No winner yet

      const winnerTeam = TEAMS[winnerId];
      if (!winnerTeam) return;

      hasRevealed = true; // Lock execution for this round

      const myInput = myBets[winnerId] || 0;
      const bonus = myInput * winnerTeam.mult;

      // 🛡️ SECURITY: win payout via SecurityService, idempotent per round
      if (bonus > 0 && authUser && window.SecurityService) {
        (async () => {
          try {
            await window.SecurityService.applyCurrencyTransaction(
              authUser.uid, bonus, 'Soccer Star: Win',
              { input: myInput, teamId: winnerId },
              { idemKey: `${authUser.uid}_sswin_${saltMs || sessionData.timer}` }
            );
          } catch (e) {
            console.error('[PRO SPY ERROR] Soccer Star payout failed:', e);
          }
        })();
      }

      // Save local transaction records
      if (Object.keys(myBets).length > 0) {
        this.addLocalRecord(winnerId, myBets, bonus);
        myBets = {};
        document.querySelectorAll('.me-label').forEach(el => el.textContent = 'me: 0');
      }

      // Automatically register the winning to the global recent_winners board if the user won
      if (bonus > 0 && authUser) {
        ssSessionRef()
          .collection('recent_winners').doc(authUser.uid).set({
            name: authUser.displayName || 'Player',
            photo: authUser.photoURL || 'icos/idon.png',
            amount: bonus,
            input: myInput,
            uid: authUser.uid,
            timestamp: new Date().getTime()
          }).catch(err => console.error(err));
      }

      // Show Popup — pass the verified winner, never a tampered published value
      this.showWinPopup(Object.assign({}, sessionData, { lastWinnerId: winnerId }), bonus, myInput);

      // Confetti if won
      if (bonus > 0) this.spawnConfetti();
    },

    showWinPopup: function (session, myBonus, myInput = 0) {
      const popup = document.getElementById('resultPopup');
      if (!popup) return;

      const winnerId = session.lastWinnerId;
      const team = TEAMS[winnerId];

      // Temporary fallback until DB load finishes
      const winnerImg = document.getElementById('resultWinnerImg');
      if (winnerImg) {
        winnerImg.src = session.winnerPhoto || (authUser ? authUser.photoURL : 'icos/idon.png');
      }
      const winnerPhoto = document.getElementById('resultWinnerPhoto');
      if (winnerPhoto) winnerPhoto.dataset.uid = session.winnerUid || (authUser ? authUser.uid : '');

      document.getElementById('resClubLogo').src = team.logo;
      document.getElementById('resClubName').textContent = team.name;

      // Total bet on this specific winning team
      const myInputOnTeam = myBonus > 0 ? (myBonus / team.mult) : 0;
      document.getElementById('resBetAmt').textContent = myInputOnTeam.toLocaleString();
      document.getElementById('resWinAmt').textContent = myBonus.toLocaleString();
      document.getElementById('resWinAmt').style.color = myBonus > 0 ? '#4CAF50' : '#fff';

      // Top winners of the round
      this.fetchRoundWinners(session.id || 'current', myBonus, myInput);

      popup.classList.add('show');

      let cd = 5;
      const btn = document.getElementById('resultCloseBtn');
      btn.textContent = `${cd}s âœ•`;
      const itv = setInterval(() => {
        cd--;
        btn.textContent = `${cd}s âœ•`;
        if (cd <= 0) {
          clearInterval(itv);
          popup.classList.remove('show');
        }
      }, 1000);
    },

    fetchRoundWinners: async function (roundId, myBonus = 0, myInput = 0) {
      const listEl = document.getElementById('topRoundWinnersList');
      if (!listEl) return;

      // Fetch up to 5 to easily find MVP + runners up
      const snap = await ssSessionRef().collection('recent_winners')
        .orderBy('timestamp', 'desc').limit(5).get();

      let winners = [];
      if (!snap.empty) {
        winners = snap.docs.map(doc => doc.data());
      }

      // Ensure the current user's locally committed win is included just in case the query was slightly too fast
      if (myBonus > 0 && authUser) {
        if (!winners.find(w => w.uid === authUser.uid)) {
          winners.push({
            name: authUser.displayName || 'Player',
            photo: authUser.photoURL || 'icos/idon.png',
            amount: myBonus,
            input: myInput,
            uid: authUser.uid,
            timestamp: new Date().getTime()
          });
        }
      }

      if (winners.length === 0) {
        listEl.innerHTML = `<div class="empty-state" style="padding:10px">ðŸ“¦ No Data Yet</div>`;
        return;
      }

      // Sort globally by highest amount won
      winners.sort((a, b) => b.amount - a.amount);

      // Set the absolute #1 MVP in the winner circle photo
      const mvp = winners[0];
      if (mvp) {
        document.getElementById('resultWinnerImg').src = mvp.photo || 'icos/idon.png';
        if (mvp.uid) document.getElementById('resultWinnerPhoto').dataset.uid = mvp.uid;
      }

      // The rest of the winners go into the Top 3 list below
      const runnersUp = winners.slice(1, 4);

      if (runnersUp.length === 0) {
        listEl.innerHTML = `<div class="empty-state" style="padding:10px">No Other Winners This Round</div>`;
        return;
      }

      listEl.innerHTML = runnersUp.map(d => `
          <div class="round-winner-row ${authUser && d.uid === authUser.uid ? 'winner-me' : ''}">
            <div class="round-winner-info">
              <img src="${d.photo || 'icos/idon.png'}" class="round-winner-avatar" onerror="this.src='icos/idon.png'">
              <span class="round-winner-name">${d.name || 'User'}</span>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end;">
               <div class="round-winner-amt" style="font-size:10px; color:#aaa; margin-bottom: 2px;">In: ${(d.input || 0).toLocaleString()} ðŸ§ </div>
               <div class="round-winner-amt" style="color:#4CAF50">+${(d.amount || 0).toLocaleString()} ðŸ§ </div>
            </div>
          </div>
      `).join('');
    },

    renderResultsStrip: function (history) {
      const strip = document.getElementById('resultsStrip');
      if (!strip) return;
      strip.innerHTML = '';

      // Clone array and reverse it so the newest elements rendering first (on the left side next to 'New')
      const reversedHistory = [...history].reverse();

      reversedHistory.forEach((tid, i) => {
        const t = TEAMS[tid];
        if (!t) return;
        const tag = document.createElement('div');
        tag.className = 'result-tag';
        if (i === 0) tag.innerHTML = `<div class="new-badge">New</div>`;
        tag.innerHTML += `<div class="result-logo" title="${t.name}"><img src="${t.logo}"></div>`;
        strip.appendChild(tag);
      });
    },

    /**
     * RECORDS LOGIC (localStorage + 10-item pagination)
     */
    loadLocalRecords: function () {
      if (!authUser) return;
      const key = `soccer_star_records_${authUser.uid}`;
      this.gameHistory = JSON.parse(localStorage.getItem(key) || '[]');
    },

    addLocalRecord: function (winnerId, bets, bonus) {
      if (!authUser) return;
      const now = new Date();
      const rec = {
        time: now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'),
        input: Object.values(bets).reduce((a, b) => a + b, 0),
        result: winnerId,
        bonus: bonus,
        timestamp: now.getTime()
      };
      this.gameHistory.unshift(rec);
      // Keep only last 100 for storage sanity
      if (this.gameHistory.length > 100) this.gameHistory.pop();
      localStorage.setItem(`soccer_star_records_${authUser.uid}`, JSON.stringify(this.gameHistory));
    },

    renderRecords: function () {
      const body = document.getElementById('recordsBody');
      if (!body) return;

      const history = this.gameHistory || [];
      const start = recordsPage * RECORDS_PER_PAGE;
      const end = start + RECORDS_PER_PAGE;
      const pageData = history.slice(start, end);

      if (pageData.length === 0) {
        body.innerHTML = `<div class="empty-state"><div class="empty-icon">ðŸ“¦</div><div>Empty List</div></div>`;
      } else {
        body.innerHTML = pageData.map(rec => {
          const t = TEAMS[rec.result] || {};
          return `
            <div class="record-row">
              <span>${rec.time}</span>
              <span>${rec.input.toLocaleString()}</span>
              <span class="win-col">${rec.bonus > 0 ? '+' + rec.bonus.toLocaleString() : '0'}</span>
            </div>
          `;
        }).join('');
      }

      document.getElementById('prevPageBtn').disabled = (recordsPage === 0);
      document.getElementById('nextPageBtn').disabled = (end >= this.gameHistory.length);
    },

    updateUIStrings: function () {
      const isAr = lang === 'ar';

      const hint = document.getElementById('hintText');
      if (hint) {
        hint.textContent = isAr ? 'Ø§Ø®ØªØ± Ù…Ø¨Ù„Øº Ø§Ù„Ø°Ù‡Ø¨ > Ø§Ø®ØªØ± Ø§Ù„ÙØ±ÙŠÙ‚' : 'Select The Amount Of Intel > Select Team';
      }

      const label = document.querySelector('.results-label');
      if (label) {
        label.textContent = isAr ? 'Ø§Ù„Ù†ØªØ§Ø¦Ø¬ :' : 'Results :';
      }

      // Removed rule-specific IDs to match the updated static template
    },

    showToast: function (msg) {
      const el = document.getElementById('toast');
      el.textContent = msg;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 2500);
    },

    spawnConfetti: function () {
      const colors = ['#FFD700', '#FF5722', '#4CAF50', '#2196F3', '#9C27B0', '#FF4081', '#00BCD4'];
      for (let i = 0; i < 35; i++) {
        setTimeout(() => {
          const p = document.createElement('div');
          p.className = 'confetti-piece';
          p.style.cssText = `
            position: absolute; top: -10px; left: ${Math.random() * 100}%;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            width: ${6 + Math.random() * 6}px; height: ${6 + Math.random() * 6}px;
            animation: confettiFall ${2 + Math.random() * 1.5}s linear forwards;
            z-index: 12000;
          `;
          containerEl.appendChild(p);
          setTimeout(() => p.remove(), 4000);
        }, i * 55);
      }
    }
  };

  function openModal(id) { document.getElementById(id + 'Modal').classList.add('show'); }
  function closeModal(id) { document.getElementById(id + 'Modal').classList.remove('show'); }

  // Inject animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes confettiFall {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(600px) rotate(720deg); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  window.SoccerStarGame = SoccerStarGame;
})();
