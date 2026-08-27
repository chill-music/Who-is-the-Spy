;(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════
  // PHOENIX WHEEL — Pro Spy Casino Game Module
  // Single self-contained file. No imports. No external deps.
  // ═══════════════════════════════════════════════════════════════════

  // ── State ──────────────────────────────────────────────────────────
  var container = null;
  var options = null;
  var currentLang = 'en';
  var balance = 0;
  var currentBet = 100;
  var isSpinning = false;
  var currentAngle = 0;
  var winAmount = 0;
  var winMultiplier = 0;
  var rafId = null;
  var timers = [];
  var listeners = [];
  var canvas = null;
  var ctx = null;
  var canvasSize = 300;
  var segmentAngle = (2 * Math.PI) / 8;
  var pointerAngle = -Math.PI / 2;

  // ── Segment Definitions (8 segments) ──────────────────────────────
  var segments = [
    { label: '0x',  mult: 0,    color: '#2d0a0a', weight: 30 },
    { label: '1.5x', mult: 1.5, color: '#ee5a24', weight: 20 },
    { label: '2x',   mult: 2,   color: '#ff6b6b', weight: 18 },
    { label: '3x',   mult: 3,   color: '#e74c3c', weight: 12 },
    { label: '5x',   mult: 5,   color: '#c0392b', weight: 8 },
    { label: '10x',  mult: 10,  color: '#ff8c00', weight: 5 },
    { label: '25x',  mult: 25,  color: '#ffd700', weight: 4 },
    { label: '50x',  mult: 50,  color: '#fff8dc', weight: 3 }
  ];

  // ── Labels (EN / AR) ──────────────────────────────────────────────
  var LABELS = {
    en: {
      title: 'PHOENIX WHEEL \uD83D\uDD25',
      spin: 'SPIN \uD83D\uDD25',
      collect: 'COLLECT',
      intel: 'Intel',
      bet: 'Bet',
      maxWin: 'Max Win',
      youWin: 'YOU WIN',
      burned: 'BURNED!',
      betInfo: function(b, m) { return 'Bet: ' + b + ' \uD83E\uDDE0 | Max Win: ' + m + ' \uD83E\uDDE0'; }
    },
    ar: {
      title: '\u0639\u062C\u0644\u0629 \u0627\u0644\u0641\u064A\u0646\u064A\u0642 \uD83D\uDD25',
      spin: '\u062F\u0648\u0631\u0627\u0646 \uD83D\uDD25',
      collect: '\u0627\u062C\u0645\u0639',
      intel: '\u0625\u0646\u062A\u0644',
      bet: '\u0627\u0644\u0631\u0647\u0627\u0646',
      maxWin: '\u0623\u0642\u0635\u0649 \u0631\u0628\u062D',
      youWin: '\u0641\u0632\u062A',
      burned: '\u0627\u062D\u062A\u0631\u0642!',
      betInfo: function(b, m) { return '\u0627\u0644\u0631\u0647\u0627\u0646: ' + b + ' \uD83E\uDDE0 | \u0623\u0642\u0635\u0649 \u0631\u0628\u062D: ' + m + ' \uD83E\uDDE0'; }
    }
  };

  var BET_CHIPS = [100, 500, 1000, 5000, 10000, 50000];
  var CHIP_LABELS = ['100', '500', '1K', '5K', '10K', '50K'];

  // ── Utilities ──────────────────────────────────────────────────────
  function fmtNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }

  function fmtNumFull(n) {
    return n.toLocaleString('en-US');
  }

  function l() { return LABELS[currentLang] || LABELS.en; }

  function pickWeightedSegment() {
    var totalWeight = 0;
    for (var i = 0; i < segments.length; i++) totalWeight += segments[i].weight;
    var r = Math.random() * totalWeight;
    var acc = 0;
    for (var j = 0; j < segments.length; j++) {
      acc += segments[j].weight;
      if (r < acc) return j;
    }
    return 0;
  }

  // ── MOCK CURRENCY ──────────────────────────────────────────────────
  function mockBet(amount) {
    // ══ MOCK: wire to SecurityService.applyCurrencyTransaction(uid, -amount, 'Phoenix Wheel Bet: spin') ══
    var uid = options && options.user ? options.user.uid : 'anon';
    var idemKey = uid + '_pwspin_' + Date.now();
    // Real call: window.SecurityService.applyCurrencyTransaction(uid, -amount, 'Phoenix Wheel Bet: spin', null, { idemKey: idemKey });
    balance -= amount;
    updateBalanceDisplay();
  }

  function mockWin(amount) {
    // ══ MOCK: wire to SecurityService.applyCurrencyTransaction(uid, amount, 'Phoenix Wheel Win: x...') ══
    var uid = options && options.user ? options.user.uid : 'anon';
    var idemKey = uid + '_pwwin_' + Date.now();
    // Real call: window.SecurityService.applyCurrencyTransaction(uid, amount, 'Phoenix Wheel Win: x' + winMultiplier, null, { idemKey: idemKey });
    balance += amount;
    updateBalanceDisplay();
  }

  function el(id) { return container ? container.querySelector('#' + id) : null; }

  function updateBalanceDisplay() {
    var e = el('pw-balance');
    if (!e) return;
    e.innerHTML = '\uD83E\uDDE0 <span class="pw-balance-amt">' + fmtNum(balance) + '</span> ' + l().intel;
  }

  // ── CSS (scoped under .pw-game) ────────────────────────────────────
  function getCSS() {
    return [
      '.pw-game {',
      '  position: relative;',
      '  width: 100%;',
      '  min-height: 100vh;',
      '  background: linear-gradient(180deg, #1a0505 0%, #2d0a0a 30%, #3d1510 50%, #1a0805 100%);',
      '  font-family: "Outfit", sans-serif;',
      '  color: #fff;',
      '  overflow: hidden;',
      '  box-sizing: border-box;',
      '  padding: 0 0 24px 0;',
      '  direction: ltr;',
      '}',
      '.pw-game *, .pw-game *::before, .pw-game *::after { box-sizing: border-box; margin: 0; padding: 0; }',
      '',
      '/* Magma glow at bottom */',
      '.pw-game::before {',
      '  content: "";',
      '  position: absolute;',
      '  bottom: -40px;',
      '  left: 50%;',
      '  transform: translateX(-50%);',
      '  width: 140%;',
      '  height: 320px;',
      '  background: radial-gradient(ellipse at center, rgba(238,90,36,0.22) 0%, rgba(192,57,43,0.10) 40%, transparent 72%);',
      '  pointer-events: none;',
      '  z-index: 0;',
      '}',
      '/* Heat-haze overlay */',
      '.pw-game::after {',
      '  content: "";',
      '  position: absolute;',
      '  inset: 0;',
      '  background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,107,107,0.015) 3px, rgba(255,107,107,0.015) 4px);',
      '  pointer-events: none;',
      '  z-index: 0;',
      '}',
      '',
      '/* Top bar */',
      '.pw-game .pw-topbar {',
      '  position: relative;',
      '  z-index: 10;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  padding: 14px 16px 6px 16px;',
      '}',
      '.pw-game .pw-title {',
      '  font-size: 20px;',
      '  font-weight: 900;',
      '  letter-spacing: 2px;',
      '  background: linear-gradient(135deg, #ff6b6b, #ffd700);',
      '  -webkit-background-clip: text;',
      '  -webkit-text-fill-color: transparent;',
      '  background-clip: text;',
      '}',
      '.pw-game .pw-avatar-wrap {',
      '  cursor: pointer;',
      '  width: 50px;',
      '  height: 50px;',
      '  border-radius: 50%;',
      '  border: 2px solid #ee5a24;',
      '  overflow: hidden;',
      '  flex-shrink: 0;',
      '  box-shadow: 0 0 10px rgba(238,90,36,0.35);',
      '}',
      '.pw-game .pw-avatar-wrap img {',
      '  width: 100%;',
      '  height: 100%;',
      '  object-fit: cover;',
      '  display: block;',
      '}',
      '.pw-game .pw-accent-line {',
      '  height: 2px;',
      '  margin: 0 16px 10px 16px;',
      '  background: linear-gradient(90deg, transparent, #ee5a24, #ff6b6b, #ee5a24, transparent);',
      '  position: relative;',
      '  z-index: 10;',
      '}',
      '',
      '/* Wheel area */',
      '.pw-game .pw-wheel-area {',
      '  position: relative;',
      '  z-index: 5;',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  padding: 8px 0 4px 0;',
      '}',
      '.pw-game .pw-wheel-container {',
      '  position: relative;',
      '  width: 300px;',
      '  height: 300px;',
      '  box-shadow: 0 0 30px rgba(238,90,36,0.4);',
      '  border-radius: 50%;',
      '  animation: pw-glow-pulse 3s ease-in-out infinite;',
      '}',
      '.pw-game .pw-wheel-container canvas {',
      '  display: block;',
      '  width: 300px;',
      '  height: 300px;',
      '}',
      '/* Pointer triangle */',
      '.pw-game .pw-pointer {',
      '  position: absolute;',
      '  top: -14px;',
      '  left: 50%;',
      '  transform: translateX(-50%);',
      '  width: 0;',
      '  height: 0;',
      '  border-left: 16px solid transparent;',
      '  border-right: 16px solid transparent;',
      '  border-top: 28px solid #ffd700;',
      '  filter: drop-shadow(0 0 6px rgba(255,215,0,0.6));',
      '  z-index: 20;',
      '}',
      '.pw-game .pw-pointer::after {',
      '  content: "";',
      '  position: absolute;',
      '  top: -30px;',
      '  left: -14px;',
      '  width: 0;',
      '  height: 0;',
      '  border-left: 14px solid transparent;',
      '  border-right: 14px solid transparent;',
      '  border-top: 26px solid #b8860b;',
      '}',
      '',
      '/* Bet chips */',
      '.pw-game .pw-bet-section {',
      '  position: relative;',
      '  z-index: 10;',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  gap: 10px;',
      '  padding: 10px 12px 0 12px;',
      '}',
      '.pw-game .pw-chips-row {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  justify-content: center;',
      '  gap: 8px;',
      '}',
      '.pw-game .pw-chip {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 4px;',
      '  padding: 8px 14px;',
      '  border-radius: 20px;',
      '  background: rgba(238,90,36,0.15);',
      '  border: 1.5px solid rgba(238,90,36,0.4);',
      '  color: #ff6b6b;',
      '  font-size: 13px;',
      '  font-weight: 700;',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '  font-family: "Outfit", sans-serif;',
      '  user-select: none;',
      '}',
      '.pw-game .pw-chip:hover {',
      '  transform: translateY(-2px);',
      '  box-shadow: 0 4px 12px rgba(238,90,36,0.3);',
      '}',
      '.pw-game .pw-chip.pw-chip-active {',
      '  background: linear-gradient(135deg, #ff6b6b, #ee5a24);',
      '  color: #fff;',
      '  border-color: #ee5a24;',
      '  box-shadow: 0 0 12px rgba(238,90,36,0.5);',
      '}',
      '.pw-game .pw-chip:disabled {',
      '  opacity: 0.4;',
      '  cursor: not-allowed;',
      '  transform: none;',
      '  box-shadow: none;',
      '}',
      '',
      '/* Spin button */',
      '.pw-game .pw-spin-btn {',
      '  background: linear-gradient(135deg, #ff6b6b, #ee5a24);',
      '  color: #fff;',
      '  font-weight: 900;',
      '  font-size: 18px;',
      '  padding: 14px 48px;',
      '  border-radius: 25px;',
      '  border: none;',
      '  cursor: pointer;',
      '  letter-spacing: 1px;',
      '  text-transform: uppercase;',
      '  font-family: "Outfit", sans-serif;',
      '  transition: all 0.2s ease;',
      '  animation: pw-fire-pulse 2.5s ease-in-out infinite;',
      '  position: relative;',
      '  z-index: 10;',
      '}',
      '.pw-game .pw-spin-btn:hover:not(:disabled) {',
      '  transform: translateY(-3px) scale(1.03);',
      '  box-shadow: 0 8px 24px rgba(238,90,36,0.5);',
      '}',
      '.pw-game .pw-spin-btn:active:not(:disabled) {',
      '  transform: translateY(0) scale(0.98);',
      '}',
      '.pw-game .pw-spin-btn:disabled {',
      '  opacity: 0.5;',
      '  cursor: not-allowed;',
      '  transform: none;',
      '  box-shadow: none;',
      '  animation: none;',
      '}',
      '',
      '/* Result display */',
      '.pw-game .pw-result-area {',
      '  position: relative;',
      '  z-index: 10;',
      '  text-align: center;',
      '  min-height: 60px;',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  justify-content: center;',
      '  padding: 8px 16px;',
      '}',
      '.pw-game .pw-result-win {',
      '  font-size: 22px;',
      '  font-weight: 900;',
      '  color: #ffd700;',
      '  text-shadow: 0 0 16px rgba(255,215,0,0.5);',
      '  animation: pw-result-pop 0.4s ease-out;',
      '}',
      '.pw-game .pw-result-burn {',
      '  font-size: 22px;',
      '  font-weight: 900;',
      '  color: #c0392b;',
      '  animation: pw-burn-fade 1.5s ease-out forwards;',
      '}',
      '.pw-game .pw-mult-badge {',
      '  display: inline-block;',
      '  padding: 4px 14px;',
      '  border-radius: 10px;',
      '  background: linear-gradient(135deg, #ffd700, #ff8c00);',
      '  color: #1a0505;',
      '  font-size: 20px;',
      '  font-weight: 900;',
      '  margin-bottom: 4px;',
      '  box-shadow: 0 0 16px rgba(255,215,0,0.5);',
      '}',
      '',
      '/* Collect button */',
      '.pw-game .pw-collect-btn {',
      '  background: linear-gradient(90deg, #10b981, #22c55e);',
      '  color: #fff;',
      '  border: none;',
      '  border-radius: 20px;',
      '  padding: 10px 32px;',
      '  font-weight: 700;',
      '  font-size: 15px;',
      '  cursor: pointer;',
      '  font-family: "Outfit", sans-serif;',
      '  margin-top: 6px;',
      '  transition: all 0.2s ease;',
      '  z-index: 10;',
      '  position: relative;',
      '}',
      '.pw-game .pw-collect-btn:hover {',
      '  transform: translateY(-2px);',
      '  box-shadow: 0 4px 16px rgba(16,185,129,0.4);',
      '}',
      '',
      '/* Bet info */',
      '.pw-game .pw-bet-info {',
      '  text-align: center;',
      '  color: rgba(255,255,255,0.55);',
      '  font-size: 12px;',
      '  padding: 2px 16px;',
      '  position: relative;',
      '  z-index: 10;',
      '}',
      '',
      '/* Balance bar */',
      '.pw-game .pw-balance-bar {',
      '  position: relative;',
      '  z-index: 10;',
      '  display: flex;',
      '  justify-content: center;',
      '  padding: 14px 16px 6px 16px;',
      '}',
      '.pw-game #pw-balance {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 5px;',
      '  border-radius: 20px;',
      '  background: linear-gradient(135deg, rgba(0,242,255,0.12), rgba(112,0,255,0.10));',
      '  border: 1px solid rgba(0,242,255,0.25);',
      '  box-shadow: 0 0 8px rgba(0,242,255,0.12);',
      '  padding: 6px 16px;',
      '  font-size: 12px;',
      '  color: rgba(255,255,255,0.7);',
      '}',
      '.pw-game .pw-balance-amt {',
      '  color: #00f2ff;',
      '  font-weight: 900;',
      '  letter-spacing: 0.3px;',
      '}',
      '',
      '/* Ember particles */',
      '.pw-game .pw-ember {',
      '  position: absolute;',
      '  border-radius: 50%;',
      '  pointer-events: none;',
      '  z-index: 1;',
      '  animation: pw-ember linear infinite;',
      '}',
      '',
      '/* Confetti particles */',
      '.pw-game .pw-confetti {',
      '  position: absolute;',
      '  pointer-events: none;',
      '  z-index: 50;',
      '  animation: pw-confetti-fall ease-out forwards;',
      '}',
      '',
      '/* Phoenix rise for high wins */',
      '.pw-game .pw-phoenix-rise {',
      '  position: absolute;',
      '  left: 50%;',
      '  top: 40%;',
      '  transform: translate(-50%, -50%) scale(0);',
      '  font-size: 64px;',
      '  z-index: 60;',
      '  pointer-events: none;',
      '  animation: pw-phoenix-emerge 1.8s ease-out forwards;',
      '}',
      '',
      '/* Screen flash for high wins */',
      '.pw-game .pw-screen-flash {',
      '  position: absolute;',
      '  inset: 0;',
      '  background: radial-gradient(ellipse at center, rgba(238,90,36,0.45) 0%, transparent 70%);',
      '  z-index: 55;',
      '  pointer-events: none;',
      '  animation: pw-flash-fade 1s ease-out forwards;',
      '}',
      '',
      '/* Flame burst glow */',
      '.pw-game .pw-flame-burst {',
      '  position: absolute;',
      '  left: 50%;',
      '  top: 50%;',
      '  transform: translate(-50%, -50%);',
      '  width: 340px;',
      '  height: 340px;',
      '  border-radius: 50%;',
      '  background: radial-gradient(circle, rgba(255,215,0,0.35) 0%, rgba(238,90,36,0.15) 40%, transparent 70%);',
      '  z-index: 4;',
      '  pointer-events: none;',
      '  animation: pw-flame-burst-anim 0.8s ease-out forwards;',
      '}',
      '',
      '/* Keyframes */',
      '@keyframes pw-glow-pulse {',
      '  0%, 100% { box-shadow: 0 0 30px rgba(238,90,36,0.4); }',
      '  50% { box-shadow: 0 0 50px rgba(238,90,36,0.65); }',
      '}',
      '@keyframes pw-fire-pulse {',
      '  0%, 100% { box-shadow: 0 4px 16px rgba(238,90,36,0.3); }',
      '  50% { box-shadow: 0 6px 28px rgba(255,107,107,0.55); }',
      '}',
      '@keyframes pw-ember {',
      '  0% { transform: translateY(600px); opacity: 0; }',
      '  10% { opacity: 0.6; }',
      '  80% { opacity: 0.3; }',
      '  100% { transform: translateY(-20px); opacity: 0; }',
      '}',
      '@keyframes pw-confetti-fall {',
      '  0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }',
      '  100% { transform: translateY(-220px) rotate(720deg) scale(0.2); opacity: 0; }',
      '}',
      '@keyframes pw-result-pop {',
      '  0% { transform: scale(0.3); opacity: 0; }',
      '  60% { transform: scale(1.15); }',
      '  100% { transform: scale(1); opacity: 1; }',
      '}',
      '@keyframes pw-burn-fade {',
      '  0% { transform: scale(0.5); opacity: 1; }',
      '  30% { transform: scale(1.1); opacity: 1; }',
      '  100% { transform: scale(0.9); opacity: 0; }',
      '}',
      '@keyframes pw-phoenix-emerge {',
      '  0% { transform: translate(-50%, -50%) scale(0) rotate(-20deg); opacity: 0; }',
      '  40% { transform: translate(-50%, -50%) scale(1.4) rotate(10deg); opacity: 1; }',
      '  70% { transform: translate(-50%, -50%) scale(1.2) rotate(0deg); opacity: 1; }',
      '  100% { transform: translate(-50%, -60%) scale(0.8); opacity: 0; }',
      '}',
      '@keyframes pw-flash-fade {',
      '  0% { opacity: 1; }',
      '  100% { opacity: 0; }',
      '}',
      '@keyframes pw-flame-burst-anim {',
      '  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }',
      '  100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }',
      '}'
    ].join('\n');
  }

  // ── Draw Wheel on Canvas ───────────────────────────────────────────
  function drawWheel(angle) {
    if (!ctx) return;
    var dpr = window.devicePixelRatio || 1;
    var cx = canvasSize / 2;
    var cy = canvasSize / 2;
    var outerR = canvasSize / 2 - 4;
    var innerR = 32;

    ctx.clearRect(0, 0, canvasSize * dpr, canvasSize * dpr);
    ctx.save();
    ctx.scale(dpr, dpr);

    // Outer rim glow ring
    ctx.beginPath();
    ctx.arc(cx, cy, outerR + 2, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw segments (rotated)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    for (var i = 0; i < 8; i++) {
      var startA = i * segmentAngle - Math.PI / 2;
      var endA = startA + segmentAngle;
      var seg = segments[i];

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, outerR - 3, startA, endA);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();

      // Radial depth overlay (darken toward edges)
      var grad = ctx.createRadialGradient(0, 0, innerR, 0, 0, outerR - 3);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, outerR - 3, startA, endA);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Gold segment separator line
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(startA) * (outerR - 3), Math.sin(startA) * (outerR - 3));
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Multiplier text
      var midA = startA + segmentAngle / 2;
      var textR = outerR * 0.62;
      ctx.save();
      ctx.translate(Math.cos(midA) * textR, Math.sin(midA) * textR);
      ctx.rotate(midA + Math.PI / 2);
      ctx.fillStyle = seg.mult === 0 ? '#666' : (i >= 6 ? '#1a0505' : '#fff');
      ctx.font = '900 ' + (i >= 6 ? '18' : '15') + 'px Outfit';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = seg.mult === 0 ? 'transparent' : 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 3;
      ctx.fillText(seg.label, 0, 0);
      ctx.shadowBlur = 0;
      ctx.restore();

      // Special glow on 50x segment
      if (i === 7) {
        ctx.beginPath();
        ctx.arc(0, 0, outerR - 3, startA, endA);
        ctx.closePath();
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 14;
        ctx.strokeStyle = 'rgba(255,215,0,0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore(); // un-rotate

    // Inner dark circle
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
    var innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
    innerGrad.addColorStop(0, '#3d1510');
    innerGrad.addColorStop(1, '#1a0505');
    ctx.fillStyle = innerGrad;
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Phoenix fire emoji center
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\uD83D\uDD25', cx, cy);

    ctx.restore(); // un-scale
  }

  // ── Spin Animation ─────────────────────────────────────────────────
  function spinWheel() {
    if (isSpinning) return;
    if (balance < currentBet) return;

    isSpinning = true;
    setBettingEnabled(false);

    // Clear previous result
    var resultEl = el('pw-result');
    if (resultEl) resultEl.innerHTML = '';
    var collectEl = el('pw-collect-btn');
    if (collectEl) collectEl.style.display = 'none';

    // Deduct bet
    mockBet(currentBet);

    // Pick target segment
    var targetIdx = pickWeightedSegment();
    var seg = segments[targetIdx];
    winMultiplier = seg.mult;
    winAmount = currentBet * seg.mult;

    // Calculate target angle so pointer lands on target segment
    var segCenter = targetIdx * segmentAngle + segmentAngle / 2;
    var randomOffset = (Math.random() - 0.5) * segmentAngle * 0.7;
    var targetAngle = -(segCenter + randomOffset);
    targetAngle = ((targetAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    // Add 5-7 full rotations
    var fullSpins = (5 + Math.floor(Math.random() * 3)) * 2 * Math.PI;
    var totalRotation = fullSpins + targetAngle - (currentAngle % (2 * Math.PI));
    if (totalRotation < fullSpins) totalRotation += 2 * Math.PI;

    var startAngle = currentAngle;
    var endAngle = startAngle + totalRotation;
    var duration = 4500 + Math.random() * 1500;
    var startTime = null;
    var lastSegIdx = -1;

    function animate(ts) {
      if (!startTime) startTime = ts;
      var elapsed = ts - startTime;
      var progress = Math.min(elapsed / duration, 1);

      // Cubic ease-out
      var eased = 1 - Math.pow(1 - progress, 3);

      var angle = startAngle + totalRotation * eased;
      currentAngle = angle;
      drawWheel(angle);

      // Tick pulse when crossing segment boundaries
      var normAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      var currentSegAtPointer = Math.floor(normAngle / segmentAngle) % 8;
      if (currentSegAtPointer !== lastSegIdx && lastSegIdx !== -1) {
        var wc = container.querySelector('.pw-wheel-container');
        if (wc) {
          wc.style.boxShadow = '0 0 50px rgba(255,215,0,0.6)';
          setTimeout(function() { if (wc) wc.style.boxShadow = ''; }, 80);
        }
      }
      lastSegIdx = currentSegAtPointer;

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        onSpinComplete(targetIdx);
      }
    }

    rafId = requestAnimationFrame(animate);
  }

  // ── On Spin Complete ───────────────────────────────────────────────
  function onSpinComplete(segIdx) {
    isSpinning = false;
    var seg = segments[segIdx];

    // Flash the wheel
    var wc = container.querySelector('.pw-wheel-container');
    if (wc) {
      wc.style.boxShadow = '0 0 60px rgba(255,215,0,0.7)';
      setTimeout(function() { if (wc) wc.style.boxShadow = ''; }, 600);
    }

    // Flame burst
    showFlameBurst();

    var resultEl = el('pw-result');
    if (!resultEl) return;

    if (seg.mult > 0) {
      var winAmtStr = fmtNumFull(winAmount);
      resultEl.innerHTML =
        '<div class="pw-mult-badge">' + seg.label + '</div>' +
        '<div class="pw-result-win">' + l().youWin + ' +' + winAmtStr + ' \uD83E\uDDE0</div>';

      var collectEl = el('pw-collect-btn');
      if (collectEl) collectEl.style.display = 'inline-block';

      spawnConfetti(30);

      // High multiplier special effects (10x+)
      if (seg.mult >= 10) {
        spawnScreenFlash();
        spawnPhoenixRise();
        setTimeout(function() { spawnConfetti(25); }, 300);
      }

      // Auto-dim result after 3s
      var t = setTimeout(function() {
        if (resultEl) {
          var rw = resultEl.querySelector('.pw-result-win');
          var mb = resultEl.querySelector('.pw-mult-badge');
          if (rw) rw.style.opacity = '0.5';
          if (mb) mb.style.opacity = '0.5';
        }
      }, 3000);
      timers.push(t);
    } else {
      resultEl.innerHTML = '<div class="pw-result-burn">' + l().burned + '</div>';
      var t2 = setTimeout(function() { if (resultEl) resultEl.innerHTML = ''; }, 2000);
      timers.push(t2);
    }

    setBettingEnabled(true);
  }

  // ── Celebration Effects ────────────────────────────────────────────
  function spawnConfetti(count) {
    if (!container) return;
    var colors = ['#ff6b6b', '#ee5a24', '#ffd700', '#ff8c00', '#e74c3c', '#fff8dc', '#ff4757'];
    var rect = container.getBoundingClientRect();
    for (var i = 0; i < count; i++) {
      var el = document.createElement('div');
      el.className = 'pw-game pw-confetti';
      var size = 4 + Math.random() * 6;
      var isCircle = Math.random() > 0.5;
      el.style.cssText =
        'width:' + size + 'px;' +
        'height:' + (isCircle ? size : size * 2.5) + 'px;' +
        'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
        'border-radius:' + (isCircle ? '50%' : '2px') + ';' +
        'left:' + (rect.width * 0.3 + Math.random() * rect.width * 0.4) + 'px;' +
        'top:' + (rect.height * 0.35 + Math.random() * rect.height * 0.15) + 'px;' +
        'animation-duration:' + (1.2 + Math.random() * 1.0) + 's;' +
        'animation-delay:' + (Math.random() * 0.3) + 's;';
      container.appendChild(el);
      (function(e) {
        var t = setTimeout(function() { if (e.parentNode) e.parentNode.removeChild(e); }, 2500);
        timers.push(t);
      })(el);
    }
  }

  function showFlameBurst() {
    if (!container) return;
    var el = document.createElement('div');
    el.className = 'pw-game pw-flame-burst';
    container.appendChild(el);
    var t = setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 900);
    timers.push(t);
  }

  function spawnScreenFlash() {
    if (!container) return;
    var el = document.createElement('div');
    el.className = 'pw-game pw-screen-flash';
    container.appendChild(el);
    var t = setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 1100);
    timers.push(t);
  }

  function spawnPhoenixRise() {
    if (!container) return;
    var el = document.createElement('div');
    el.className = 'pw-game pw-phoenix-rise';
    el.textContent = '\uD83D\uDC51\uD83D\uDD25';
    container.appendChild(el);
    var t = setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 2000);
    timers.push(t);
  }

  function createEmbers() {
    if (!container) return;
    var colors = ['#ff6b6b', '#ee5a24', '#ffd700'];
    for (var i = 0; i < 18; i++) {
      var el = document.createElement('div');
      el.className = 'pw-game pw-ember';
      var size = 2 + Math.random() * 2.5;
      el.style.cssText =
        'width:' + size + 'px;' +
        'height:' + size + 'px;' +
        'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
        'left:' + (Math.random() * 100) + '%;' +
        'animation-duration:' + (6 + Math.random() * 6) + 's;' +
        'animation-delay:' + (Math.random() * 8) + 's;';
      container.appendChild(el);
    }
  }

  // ── Betting State ──────────────────────────────────────────────────
  function setBettingEnabled(enabled) {
    var chips = container.querySelectorAll('.pw-chip');
    for (var i = 0; i < chips.length; i++) chips[i].disabled = !enabled;
    var spinBtn = el('pw-spin-btn');
    if (spinBtn) spinBtn.disabled = !enabled;
  }

  function updateBetInfo() {
    var betInfoEl = el('pw-bet-info');
    if (!betInfoEl) return;
    var maxWin = currentBet * 50;
    betInfoEl.textContent = l().betInfo(fmtNumFull(currentBet), fmtNumFull(maxWin));
  }

  function selectChip(idx) {
    currentBet = BET_CHIPS[idx];
    var chips = container.querySelectorAll('.pw-chip');
    for (var i = 0; i < chips.length; i++) {
      chips[i].classList.toggle('pw-chip-active', i === idx);
    }
    updateBetInfo();
  }

  // ── Collect Handler ────────────────────────────────────────────────
  function onCollect() {
    if (winAmount <= 0) return;
    mockWin(winAmount);
    winAmount = 0;
    winMultiplier = 0;
    var collectEl = el('pw-collect-btn');
    if (collectEl) collectEl.style.display = 'none';
    var resultEl = el('pw-result');
    if (resultEl) resultEl.innerHTML = '';
  }

  // ── Avatar Click (Mini Profile) ────────────────────────────────────
  function onAvatarClick() {
    var uid = options && options.user ? options.user.uid : null;
    if (!uid) return;
    if (typeof window.openLuckyGamesMiniProfile === 'function') {
      window.openLuckyGamesMiniProfile(uid);
    } else if (typeof window.openMiniProfile === 'function') {
      window.openMiniProfile(uid);
    } else if (typeof window.setMiniProfileUID !== 'undefined') {
      window.setMiniProfileUID(uid);
      window.setShowMiniProfile(true);
    }
  }

  // ── Build DOM ──────────────────────────────────────────────────────
  function buildDOM() {
    if (!container) return;
    var isRTL = currentLang === 'ar';

    container.innerHTML = '';
    container.className = 'pw-game';
    container.dir = isRTL ? 'rtl' : 'ltr';

    // Inject scoped style
    var styleEl = document.createElement('style');
    styleEl.textContent = getCSS();
    container.appendChild(styleEl);

    // Top bar
    var topbar = document.createElement('div');
    topbar.className = 'pw-topbar';

    var titleDiv = document.createElement('div');
    titleDiv.className = 'pw-title';
    titleDiv.textContent = l().title;
    topbar.appendChild(titleDiv);

    var avatarWrap = document.createElement('div');
    avatarWrap.className = 'pw-avatar-wrap';
    var avatarImg = document.createElement('img');
    avatarImg.alt = 'avatar';
    avatarImg.src = (options && options.user && options.user.photoURL) ||
      'https://ui-avatars.com/api/?name=User&background=1e293b&color=fff&size=100';
    avatarImg.onerror = function() {
      this.src = 'https://ui-avatars.com/api/?name=User&background=1e293b&color=fff&size=100';
    };
    avatarWrap.appendChild(avatarImg);
    avatarWrap.addEventListener('click', onAvatarClick);
    listeners.push({ el: avatarWrap, evt: 'click', fn: onAvatarClick });
    topbar.appendChild(avatarWrap);

    container.appendChild(topbar);

    // Accent line
    var accentLine = document.createElement('div');
    accentLine.className = 'pw-accent-line';
    container.appendChild(accentLine);

    // Wheel area
    var wheelArea = document.createElement('div');
    wheelArea.className = 'pw-wheel-area';
    wheelArea.id = 'pw-wheel';

    var wheelContainer = document.createElement('div');
    wheelContainer.className = 'pw-wheel-container';

    // Canvas
    canvas = document.createElement('canvas');
    canvas.id = 'pw-segments';
    var dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = canvasSize + 'px';
    canvas.style.height = canvasSize + 'px';
    ctx = canvas.getContext('2d');
    wheelContainer.appendChild(canvas);

    // Pointer
    var pointer = document.createElement('div');
    pointer.className = 'pw-pointer';
    wheelContainer.appendChild(pointer);

    wheelArea.appendChild(wheelContainer);
    container.appendChild(wheelArea);

    // Draw initial wheel
    drawWheel(currentAngle);

    // Bet section
    var betSection = document.createElement('div');
    betSection.className = 'pw-bet-section';

    // Chips
    var chipsRow = document.createElement('div');
    chipsRow.className = 'pw-chips-row';
    chipsRow.id = 'pw-bet-btns';
    for (var i = 0; i < BET_CHIPS.length; i++) {
      (function(idx) {
        var chip = document.createElement('button');
        chip.className = 'pw-chip' + (idx === 0 ? ' pw-chip-active' : '');
        chip.innerHTML = '\uD83E\uDDE0 ' + CHIP_LABELS[idx];
        chip.addEventListener('click', function() { selectChip(idx); });
        listeners.push({ el: chip, evt: 'click', fn: function() { selectChip(idx); } });
        chipsRow.appendChild(chip);
      })(i);
    }
    betSection.appendChild(chipsRow);

    // Spin button
    var spinBtn = document.createElement('button');
    spinBtn.id = 'pw-spin-btn';
    spinBtn.className = 'pw-spin-btn';
    spinBtn.textContent = l().spin;
    spinBtn.addEventListener('click', spinWheel);
    listeners.push({ el: spinBtn, evt: 'click', fn: spinWheel });
    betSection.appendChild(spinBtn);

    container.appendChild(betSection);

    // Result area
    var resultArea = document.createElement('div');
    resultArea.className = 'pw-result-area';
    var resultDiv = document.createElement('div');
    resultDiv.id = 'pw-result';
    resultArea.appendChild(resultDiv);

    // Collect button
    var collectBtn = document.createElement('button');
    collectBtn.id = 'pw-collect-btn';
    collectBtn.className = 'pw-collect-btn';
    collectBtn.textContent = l().collect;
    collectBtn.style.display = 'none';
    collectBtn.addEventListener('click', onCollect);
    listeners.push({ el: collectBtn, evt: 'click', fn: onCollect });
    resultArea.appendChild(collectBtn);

    container.appendChild(resultArea);

    // Bet info
    var betInfoDiv = document.createElement('div');
    betInfoDiv.className = 'pw-bet-info';
    betInfoDiv.id = 'pw-bet-info';
    container.appendChild(betInfoDiv);
    updateBetInfo();

    // Balance bar
    var balanceBar = document.createElement('div');
    balanceBar.className = 'pw-balance-bar';
    var balanceEl = document.createElement('div');
    balanceEl.id = 'pw-balance';
    balanceEl.innerHTML = '\uD83E\uDDE0 <span class="pw-balance-amt">' + fmtNum(balance) + '</span> ' + l().intel;
    balanceBar.appendChild(balanceEl);
    container.appendChild(balanceBar);

    // Ambient embers
    createEmbers();
  }

  // ── PUBLIC API ─────────────────────────────────────────────────────
  function start(c, opts) {
    container = c;
    options = opts || {};
    currentLang = (opts && opts.lang) || 'en';
    balance = (opts && opts.user && opts.user.currency) || 0;
    currentBet = 100;
    currentAngle = 0;
    isSpinning = false;
    winAmount = 0;
    winMultiplier = 0;
    canvas = null;
    ctx = null;
    buildDOM();
  }

  function stop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    for (var j = 0; j < listeners.length; j++) {
      listeners[j].el.removeEventListener(listeners[j].evt, listeners[j].fn);
    }
    listeners = [];
    if (container) container.innerHTML = '';
    container = null;
    options = null;
    canvas = null;
    ctx = null;
  }

  function setLanguage(lang) {
    if (!lang) return;
    currentLang = lang;
    if (!container) return;
    var savedAngle = currentAngle;
    buildDOM();
    currentAngle = savedAngle;
    if (ctx) drawWheel(currentAngle);
  }

  // ── Export ──────────────────────────────────────────────────────────
  window.PhoenixWheelGame = { start: start, stop: stop, setLanguage: setLanguage };

})();
