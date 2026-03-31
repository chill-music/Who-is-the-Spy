/* ================================================================
   SOCCER STAR — GAME ENGINE
   soccer-star.js
================================================================ */

/* ================================================================
   ★  DEVELOPER VARIABLES — wire your backend here  ★
================================================================ */

/**
 * Set currentWinner to a team ID to force a result (testing).
 * Set to null to use the probability-weighted random engine.
 * REPLACE with your backend API response.
 */
let currentWinner = null;   // null | 'manchester' | 'acmilan' | 'bayernmunich' | 'juventus' | 'liverpool' | 'psg' | 'realmadrid' | 'barcelona'

/**
 * User's current coin balance.
 * REPLACE with your real user balance from backend.
 */
let userCoins = 10000;

/**
 * Records array — populated locally; replace with API call in renderRecords().
 */
let gameRecords = [];

/* ================================================================
   TEAM DEFINITIONS
================================================================ */
const TEAMS = {
  barcelona:    { name: 'Barcelona',         mult: 45, emoji: '⚽', bg: 'radial-gradient(circle, #A50044 0%, #003DA5 100%)', prob: 2.160  },
  manchester:   { name: 'Manchester United', mult: 5,  emoji: '🔴', bg: 'radial-gradient(circle, #DA291C 0%, #FBE122 100%)', prob: 19.438 },
  acmilan:      { name: 'AC Milan',          mult: 5,  emoji: '🔴', bg: 'radial-gradient(circle, #E32221 0%, #000 100%)',    prob: 19.438 },
  bayernmunich: { name: 'Bayern Munich',     mult: 5,  emoji: '🔵', bg: 'radial-gradient(circle, #DC052D 0%, #0066B2 100%)', prob: 19.438 },
  juventus:     { name: 'Juventus',          mult: 5,  emoji: '⬛', bg: 'radial-gradient(circle, #232323 0%, #555 100%)',    prob: 19.438 },
  liverpool:    { name: 'Liverpool',         mult: 10, emoji: '🦅', bg: 'radial-gradient(circle, #C8102E 0%, #00B2A9 100%)', prob: 9.720  },
  psg:          { name: 'PSG',               mult: 15, emoji: '🗼', bg: 'radial-gradient(circle, #004170 0%, #DA291C 100%)', prob: 6.480  },
  realmadrid:   { name: 'Real Madrid',       mult: 25, emoji: '👑', bg: 'radial-gradient(circle, #FFFFFF 0%, #00529F 100%)', prob: 3.888  }
};

/* ================================================================
   GAME STATE
================================================================ */
let selectedChip      = 100;
let bets              = {};       // { teamId: totalAmount }
let totalBet          = 0;
let cumulativeWin     = 0;
let timerSeconds      = 30;
let timerInterval     = null;
let isResultPhase     = false;
let resultHistory     = [];       // last 10 winning team IDs
let resultCloseInterval = null;
let recordDateOffset  = 0;        // days offset from today

/* ================================================================
   INITIALISE
================================================================ */
function init() {
  spawnStars();
  updateCoinDisplay();
  renderResultsStrip();
  startRound();
}

/* ================================================================
   DECORATIVE STARS
================================================================ */
function spawnStars() {
  const game = document.getElementById('soccerStarGame');
  const positions = [
    [10,14,5], [88,12,5], [4,38,4], [94,32,5], [22,10,6],
    [78,18,4], [50,6,7],  [33,23,5],[67,20,4], [16,52,5],
    [84,46,4], [45,30,5], [60,8,4]
  ];
  positions.forEach(([l, t, size], i) => {
    const s = document.createElement('div');
    s.className = 'star-particle';
    s.style.cssText = `
      left:${l}%; top:${t}%;
      width:${size}px; height:${size}px;
      animation-delay:${(i * 0.23).toFixed(2)}s;
      animation-duration:${(2 + Math.random()).toFixed(2)}s;
    `;
    game.appendChild(s);
  });
}

/* ================================================================
   CHIP SELECTION
================================================================ */
function selectChip(amount, btn) {
  selectedChip = amount;
  document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/* ================================================================
   BETTING LOGIC
   — swap the body of placeBet() with your API call later —
================================================================ */
function placeBet(teamId) {
  if (isResultPhase) { showToast('⏳ Wait for the next round!'); return; }
  if (!(teamId in TEAMS)) return;

  const cost     = selectedChip;
  const newTotal = totalBet + cost;

  if (cost > userCoins)    { showToast('❌ Not enough coins!');       return; }
  if (newTotal > 1_000_000){ showToast('❌ Max bet is 1,000,000!'); return; }

  /* ── REPLACE THIS BLOCK with your API call ── */
  userCoins      -= cost;
  bets[teamId]    = (bets[teamId] || 0) + cost;
  totalBet        = newTotal;
  /* ─────────────────────────────────────────── */

  updateMeLabel(teamId);
  updateCoinDisplay();

  const card = document.querySelector(`[data-team="${teamId}"]`);
  if (card) {
    card.classList.remove('bet-placed');
    void card.offsetWidth; // reflow trick
    card.classList.add('bet-placed', 'selected');
  }

  showToast(`✅ +${cost.toLocaleString()} on ${TEAMS[teamId].name}`);
}

function updateMeLabel(teamId) {
  const el = document.getElementById('me-' + teamId);
  if (!el) return;
  const val = bets[teamId] || 0;
  el.textContent = val > 0 ? `me: ${val.toLocaleString()}` : 'me: 0';
}

function clearAllBets() {
  if (isResultPhase) return;
  userCoins += totalBet;
  bets       = {};
  totalBet   = 0;
  Object.keys(TEAMS).forEach(id => updateMeLabel(id));
  document.querySelectorAll('.team-card').forEach(c => c.classList.remove('selected'));
  updateCoinDisplay();
  showToast('🔄 Bets cleared');
}

/* ================================================================
   DISPLAY HELPERS
================================================================ */
function updateCoinDisplay() {
  document.getElementById('coinDisplay').textContent      = userCoins.toLocaleString();
  document.getElementById('totalWinDisplay').textContent  = cumulativeWin.toLocaleString();
}

/* ================================================================
   ROUND / TIMER ENGINE
================================================================ */
function startRound() {
  isResultPhase = false;
  timerSeconds  = 30;

  document.querySelectorAll('.team-card').forEach(c => c.classList.remove('disabled'));
  updateTimerDisplay();

  clearInterval(timerInterval);
  timerInterval = setInterval(tickTimer, 1000);
}

function tickTimer() {
  timerSeconds--;
  updateTimerDisplay();
  if (timerSeconds <= 0) {
    clearInterval(timerInterval);
    triggerResult();
  }
}

function updateTimerDisplay() {
  const el = document.getElementById('timerDisplay');
  if (!el) return;
  el.textContent = timerSeconds + 's';
  el.classList.toggle('urgent', timerSeconds <= 10);
}

/* ================================================================
   RESULT ENGINE
   — replace pickWinner() with your backend response —
================================================================ */
function triggerResult() {
  isResultPhase = true;
  document.querySelectorAll('.team-card').forEach(c => c.classList.add('disabled'));

  const winner = pickWinner();
  processResult(winner);
}

/**
 * pickWinner()
 * Returns a team ID string.
 * Priority: currentWinner variable → weighted random.
 * REPLACE with: const winner = await fetchWinnerFromAPI();
 */
function pickWinner() {
  if (currentWinner && TEAMS[currentWinner]) return currentWinner;

  const entries = Object.entries(TEAMS);
  const total   = entries.reduce((s, [, t]) => s + t.prob, 0);
  let   rand    = Math.random() * total;
  for (const [id, team] of entries) {
    rand -= team.prob;
    if (rand <= 0) return id;
  }
  return entries[0][0];
}

function processResult(winnerId) {
  const team          = TEAMS[winnerId];
  const myBet         = bets[winnerId] || 0;
  const bonus         = myBet * team.mult;
  cumulativeWin      += bonus;

  if (bonus > 0) {
    userCoins += bonus;
    spawnConfetti();
  }

  /* ── Save record (replace with API call) ── */
  const now = new Date();
  gameRecords.unshift({
    time:   now.toTimeString().slice(0, 8),
    input:  totalBet,
    result: winnerId,
    bonus
  });

  /* Update history strip */
  resultHistory.unshift(winnerId);
  if (resultHistory.length > 10) resultHistory.pop();
  renderResultsStrip();

  showResultPopup(winnerId, totalBet, bonus);
  updateTickerWithWin(winnerId, bonus);

  /* Reset bets for next round */
  bets     = {};
  totalBet = 0;
  Object.keys(TEAMS).forEach(id => updateMeLabel(id));
  document.querySelectorAll('.team-card.selected').forEach(c => c.classList.remove('selected'));
  updateCoinDisplay();
}

/* ================================================================
   RESULT POPUP
================================================================ */
function showResultPopup(winnerId, myInput, bonus) {
  const team = TEAMS[winnerId];

  const logoEl = document.getElementById('resultTeamLogo');
  logoEl.textContent  = team.emoji;
  logoEl.style.background = team.bg || '#1B5E20';

  document.getElementById('resultTeamIcon').textContent  = team.emoji;
  document.getElementById('resultTeamName').textContent  = team.name;
  document.getElementById('resultMyInput').textContent   = myInput.toLocaleString();
  document.getElementById('resultBonus').textContent     = bonus.toLocaleString();
  document.getElementById('resultBonus').style.color     = bonus > 0 ? '#4CAF50' : '#fff';

  const popup = document.getElementById('resultPopup');
  popup.classList.add('show');

  /* Countdown auto-close */
  let cd = 5;
  const btn = document.getElementById('resultCloseBtn');
  btn.textContent = cd + 's ✕';
  clearInterval(resultCloseInterval);
  resultCloseInterval = setInterval(() => {
    cd--;
    btn.textContent = cd + 's ✕';
    if (cd <= 0) closeResult();
  }, 1000);
}

function closeResult() {
  clearInterval(resultCloseInterval);
  document.getElementById('resultPopup').classList.remove('show');
  setTimeout(startRound, 700);
}

/* ================================================================
   RESULTS STRIP
================================================================ */
function renderResultsStrip() {
  const strip = document.getElementById('resultsStrip');
  /* Remove old tags */
  strip.querySelectorAll('.result-tag').forEach(e => e.remove());

  resultHistory.forEach((tid, i) => {
    const t = TEAMS[tid];
    if (!t) return;

    const tag  = document.createElement('div');
    tag.className = 'result-tag';

    if (i === 0) {
      const badge = document.createElement('div');
      badge.className = 'new-badge';
      badge.textContent = 'New';
      tag.appendChild(badge);
    }

    const logo = document.createElement('div');
    logo.className    = 'result-logo';
    logo.textContent  = t.emoji;
    logo.style.background = t.bg || '#333';
    logo.title        = t.name;
    tag.appendChild(logo);

    strip.appendChild(tag);
  });
}

/* ================================================================
   TICKER
================================================================ */
function updateTickerWithWin(winnerId, bonus) {
  if (!bonus) return;
  const team = TEAMS[winnerId];
  const el   = document.getElementById('tickerText');
  const msg  = `🏆 ${team.name} correctly, getting the bonus of ${bonus.toLocaleString()} 🪙    `;
  el.textContent = msg + el.textContent;
}

/* ================================================================
   CONFETTI
================================================================ */
function spawnConfetti() {
  const colors = ['#FFD700','#FF5722','#4CAF50','#2196F3','#9C27B0','#FF4081','#00BCD4'];
  for (let i = 0; i < 35; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.cssText = `
        left: ${Math.random() * 100}vw;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        width:  ${6 + Math.random() * 6}px;
        height: ${6 + Math.random() * 6}px;
        animation-duration: ${2 + Math.random() * 1.5}s;
      `;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 4000);
    }, i * 55);
  }
}

/* ================================================================
   MODAL SYSTEM
================================================================ */
function openModal(which) {
  if (which === 'howToPlay')    document.getElementById('howToPlayModal').classList.add('show');
  if (which === 'gameRecords')  { renderRecords(); document.getElementById('gameRecordsModal').classList.add('show'); }
}

function closeModal(which) {
  if (which === 'howToPlay')   document.getElementById('howToPlayModal').classList.remove('show');
  if (which === 'gameRecords') document.getElementById('gameRecordsModal').classList.remove('show');
}

/* ================================================================
   RECORDS
================================================================ */
function changeRecordDate(dir) {
  recordDateOffset += dir;
  renderRecords();
}

function getRecordDateStr() {
  const d = new Date();
  d.setDate(d.getDate() + recordDateOffset);
  const y   = d.getFullYear();
  const mo  = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${mo}.${day}`;
}

function renderRecords() {
  document.getElementById('recordDateDisplay').textContent = getRecordDateStr();
  const body = document.getElementById('recordsBody');
  body.innerHTML = '';

  /* Only today for now — replace with API fetch per date */
  const rows = recordDateOffset === 0 ? gameRecords : [];

  if (rows.length === 0) {
    body.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><div>Empty List</div></div>`;
    return;
  }

  rows.forEach(rec => {
    const t = TEAMS[rec.result] || {};
    const row = document.createElement('div');
    row.className = 'record-row';
    row.innerHTML = `
      <span>${rec.time}</span>
      <span>${rec.input.toLocaleString()}</span>
      <span class="win-col">${t.emoji || '?'} ${rec.bonus > 0 ? '+' + rec.bonus.toLocaleString() : '0'}</span>`;
    body.appendChild(row);
  });
}

/* ================================================================
   TOAST
================================================================ */
let _toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

/* ================================================================
   CLOSE GAME
   Hide overlay and fire an event your site can listen to.
================================================================ */
function closeGame() {
  clearInterval(timerInterval);
  clearInterval(resultCloseInterval);
  document.getElementById('soccerStarGame').style.display = 'none';
  window.dispatchEvent(new CustomEvent('soccerStarClosed', { detail: { coins: userCoins } }));
}

/* ================================================================
   PUBLIC API  — call from your site to launch / configure
================================================================

  openSoccerStar({
    coins:     50000,                          // user balance
    avatarSrc: 'https://yoursite.com/user.jpg', // avatar URL
    winner:    null                            // force winner or null
  });

  window.addEventListener('soccerStarClosed', e => {
    console.log('Final balance:', e.detail.coins);
  });

================================================================ */
function openSoccerStar(config = {}) {
  if (config.coins    !== undefined) userCoins     = config.coins;
  if (config.winner   !== undefined) currentWinner = config.winner;
  if (config.avatarSrc) {
    const av = document.getElementById('userAvatar');
    av.innerHTML = `<img src="${config.avatarSrc}" alt="avatar">`;
  }
  document.getElementById('soccerStarGame').style.display = 'flex';
  updateCoinDisplay();
}

/* ================================================================
   AUTO-START (remove if embedding)
================================================================ */
window.addEventListener('DOMContentLoaded', init);
