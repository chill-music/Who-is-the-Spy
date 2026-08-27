;(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // SECTION: STATE
  // ═══════════════════════════════════════════════════════════════
  var _container = null;
  var _lang = 'en';
  var _user = null;
  var _balance = 0;
  var _selectedBet = null;   // 'low','high','even','odd','triple'
  var _selectedChip = null;  // number
  var _isRolling = false;
  var _pendingWinAmount = 0;
  var _pendingWinReason = '';
  var _pendingWinMultiplier = 0;
  var _timers = [];
  var _intervals = [];
  var _rafIds = [];
  var _listeners = [];       // {el, evt, fn}
  var _diceEls = [];
  var _faceCycleInterval = null;

  var CHIP_VALUES = [100, 500, 1000, 5000, 10000, 50000];
  var CHIP_LABELS = ['100', '500', '1K', '5K', '10K', '50K'];
  var BET_TYPES = ['low', 'high', 'even', 'odd', 'triple'];
  var DICE_DURATION = [850, 1000, 1150]; // stagger in ms

  // Pip positions in a 3x3 grid (1-indexed cells)
  var PIP_MAP = {
    1: [5],
    2: [3, 7],
    3: [3, 5, 7],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION: LOCALIZATION
  // ═══════════════════════════════════════════════════════════════
  var I18N = {
    title:        { en: 'CROWN DICE ♔', ar: 'نرد التاج ♔' },
    currency:     { en: 'Intel', ar: 'إنتل' },
    roll:         { en: 'ROLL ♔', ar: 'رمي ♔' },
    collect:      { en: 'COLLECT', ar: 'اجمع' },
    youWin:       { en: 'YOU WIN!', ar: 'فزت!' },
    tryAgain:     { en: 'TRY AGAIN', ar: 'حاول مرة أخرى' },
    royalTriple:  { en: 'ROYAL TRIPLE!', ar: 'ثلاثية ملكية!' },
    betLow:       { en: 'LOW', ar: 'منخفض' },
    betHigh:      { en: 'HIGH', ar: 'مرتفع' },
    betEven:      { en: 'EVEN', ar: 'زوجي' },
    betOdd:       { en: 'ODD', ar: 'فردي' },
    betTriple:    { en: 'TRIPLE', ar: 'ثلاثي' },
    infoLow:      { en: 'Low: Sum 3-10', ar: 'منخفض: المجموع 3-10' },
    infoHigh:     { en: 'High: Sum 11-18', ar: 'مرتفع: المجموع 11-18' },
    infoEven:     { en: 'Even: Sum is even', ar: 'زوجي: المجموع زوجي' },
    infoOdd:      { en: 'Odd: Sum is odd', ar: 'فردي: المجموع فردي' },
    infoTriple:   { en: 'Triple: All same (30x)', ar: 'ثلاثي: كل النرد متساوي (30x)' },
    selectBet:    { en: 'Select your bet', ar: 'اختر رهانك' },
    selectChip:   { en: 'Select bet amount', ar: 'اختر مقدار الرهان' }
  };

  function t(key) {
    return (I18N[key] && I18N[key][_lang]) || (I18N[key] && I18N[key].en) || key;
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: HELPERS
  // ═══════════════════════════════════════════════════════════════
  function fmtNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(Math.floor(n));
  }

  function $(id) {
    return _container ? _container.querySelector('#' + id) : null;
  }

  function $cls(cls) {
    return _container ? _container.querySelector('.' + cls) : null;
  }

  function $clsAll(cls) {
    return _container ? _container.querySelectorAll('.' + cls) : [];
  }

  function addListener(el, evt, fn) {
    if (el) { el.addEventListener(evt, fn); _listeners.push({ el: el, evt: evt, fn: fn }); }
  }

  function safeTimeout(fn, ms) {
    var id = setTimeout(fn, ms);
    _timers.push(id);
    return id;
  }

  function safeInterval(fn, ms) {
    var id = setInterval(fn, ms);
    _intervals.push(id);
    return id;
  }

  function clearAllTimers() {
    for (var i = 0; i < _timers.length; i++) clearTimeout(_timers[i]);
    for (var i = 0; i < _intervals.length; i++) clearInterval(_intervals[i]);
    for (var i = 0; i < _rafIds.length; i++) cancelAnimationFrame(_rafIds[i]);
    _timers = [];
    _intervals = [];
    _rafIds = [];
  }

  function removeAllListeners() {
    for (var i = 0; i < _listeners.length; i++) {
      _listeners[i].el.removeEventListener(_listeners[i].evt, _listeners[i].fn);
    }
    _listeners = [];
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: MOCK CURRENCY
  // ═══════════════════════════════════════════════════════════════
  function mockBet(amount) {
    _balance -= amount;
    updateBalanceDisplay();
    // ══ MOCK: wire to SecurityService.applyCurrencyTransaction(uid, -amount, 'Crown Dice Bet: ' + getBetLabel()) ══
    // Real call will be: window.SecurityService.applyCurrencyTransaction(uid, -amount, 'Crown Dice Bet: ' + getBetLabel(), null, { idemKey: _user.uid + '_crownbet_' + Date.now() })
  }

  function mockWin(amount, multiplier) {
    _balance += amount;
    updateBalanceDisplay();
    // ══ MOCK: wire to SecurityService.applyCurrencyTransaction(uid, amount, 'Crown Dice Win: x' + multiplier) ══
    // Real call will be: window.SecurityService.applyCurrencyTransaction(uid, amount, 'Crown Dice Win: x' + multiplier, null, { idemKey: _user.uid + '_crownwin_' + Date.now() })
  }

  function getBetLabel() {
    var labels = { low: 'Low', high: 'High', even: 'Even', odd: 'Odd', triple: 'Triple' };
    return labels[_selectedBet] || 'Unknown';
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: CSS STYLES (scoped under .cd-game)
  // ═══════════════════════════════════════════════════════════════
  function getStyles() {
    return [
      '/* ══ Crown Dice Game — Scoped Styles ══ */',
      '.cd-game {',
      '  position: relative;',
      '  min-height: 640px;',
      '  background: linear-gradient(180deg, #1a0533 0%, #2d0a3e 30%, #3d1052 50%, #1a0a20 100%);',
      '  font-family: "Outfit", sans-serif;',
      '  color: #fff;',
      '  overflow: hidden;',
      '  border-radius: 16px;',
      '  box-sizing: border-box;',
      '  padding: 16px 12px 20px;',
      '}',

      /* Damask / diamond pattern overlay */
      '.cd-game::before {',
      '  content: "";',
      '  position: absolute;',
      '  top: 0; left: 0; right: 0; bottom: 0;',
      '  background-image:',
      '    linear-gradient(45deg, rgba(255,215,0,0.025) 25%, transparent 25%),',
      '    linear-gradient(-45deg, rgba(255,215,0,0.025) 25%, transparent 25%),',
      '    linear-gradient(45deg, transparent 75%, rgba(255,215,0,0.025) 75%),',
      '    linear-gradient(-45deg, transparent 75%, rgba(255,215,0,0.025) 75%);',
      '  background-size: 40px 40px;',
      '  background-position: 0 0, 0 20px, 20px -20px, -20px 0px;',
      '  pointer-events: none;',
      '  z-index: 0;',
      '}',

      /* Chandelier gold glow */
      '.cd-game::after {',
      '  content: "";',
      '  position: absolute;',
      '  top: -60px; left: 50%;',
      '  transform: translateX(-50%);',
      '  width: 400px; height: 300px;',
      '  background: radial-gradient(ellipse at center, rgba(255,215,0,0.10) 0%, transparent 70%);',
      '  pointer-events: none;',
      '  z-index: 0;',
      '}',

      '.cd-game > * { position: relative; z-index: 2; }',

      /* ── Top Bar ── */
      '.cd-game .cd-top-bar {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  margin-bottom: 4px;',
      '  padding: 0 4px;',
      '}',
      '.cd-game .cd-title {',
      '  font-size: 22px;',
      '  font-weight: 900;',
      '  color: #ffd700;',
      '  letter-spacing: 2px;',
      '  text-shadow: 0 0 12px rgba(255,215,0,0.3), 0 2px 4px rgba(0,0,0,0.5);',
      '  line-height: 1.2;',
      '}',
      '.cd-game .cd-avatar {',
      '  width: 50px; height: 50px;',
      '  border-radius: 50%;',
      '  border: 2px solid #ffd700;',
      '  box-shadow: 0 0 12px rgba(255,215,0,0.3);',
      '  cursor: pointer;',
      '  object-fit: cover;',
      '  transition: transform 0.2s ease, box-shadow 0.2s ease;',
      '  flex-shrink: 0;',
      '}',
      '.cd-game .cd-avatar:hover {',
      '  transform: scale(1.08);',
      '  box-shadow: 0 0 20px rgba(255,215,0,0.5);',
      '}',
      '.cd-game .cd-divider {',
      '  height: 1px;',
      '  background: linear-gradient(90deg, transparent, rgba(255,215,0,0.4), rgba(155,39,176,0.3), rgba(255,215,0,0.4), transparent);',
      '  margin: 8px 0 14px;',
      '}',

      /* ── Dice Area ── */
      '.cd-game .cd-dice-area {',
      '  display: flex;',
      '  justify-content: center;',
      '  align-items: center;',
      '  gap: 20px;',
      '  margin: 10px 0 18px;',
      '  perspective: 600px;',
      '  min-height: 100px;',
      '}',
      '.cd-game .cd-die-wrapper {',
      '  width: 80px; height: 80px;',
      '  perspective: 500px;',
      '}',
      '.cd-game .cd-die {',
      '  width: 80px; height: 80px;',
      '  background: #fffde8;',
      '  border: 2px solid #ffd700;',
      '  border-radius: 12px;',
      '  box-shadow: 0 4px 16px rgba(0,0,0,0.4), 0 0 8px rgba(255,215,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5);',
      '  display: grid;',
      '  grid-template-columns: repeat(3, 1fr);',
      '  grid-template-rows: repeat(3, 1fr);',
      '  padding: 10px;',
      '  box-sizing: border-box;',
      '  transform-style: preserve-3d;',
      '  transition: box-shadow 0.3s ease;',
      '}',
      '.cd-game .cd-die.cd-rolling {',
      '  animation: cd-tumble 1s ease-out forwards;',
      '  box-shadow: 0 4px 16px rgba(0,0,0,0.4), 0 0 24px rgba(255,215,0,0.7), 0 0 48px rgba(155,39,176,0.5);',
      '}',
      '.cd-game .cd-die.cd-landed {',
      '  animation: cd-land-flash 0.4s ease-out;',
      '}',
      '.cd-game .cd-pip-cell {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '}',
      '.cd-game .cd-pip {',
      '  width: 14px; height: 14px;',
      '  border-radius: 50%;',
      '  background: #2d1052;',
      '  box-shadow: inset 0 2px 3px rgba(0,0,0,0.3);',
      '}',

      /* ── Bet Buttons ── */
      '.cd-game .cd-bet-row {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  justify-content: center;',
      '  gap: 8px;',
      '  margin-bottom: 8px;',
      '}',
      '.cd-game .cd-bet-btn {',
      '  border-radius: 20px;',
      '  padding: 8px 16px;',
      '  background: rgba(155, 39, 176, 0.2);',
      '  border: 1px solid rgba(155, 39, 176, 0.4);',
      '  color: #d4a0e0;',
      '  font-family: "Outfit", sans-serif;',
      '  font-size: 13px;',
      '  font-weight: 700;',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '  letter-spacing: 0.5px;',
      '}',
      '.cd-game .cd-bet-btn:hover:not(.cd-active):not(.cd-disabled) {',
      '  border-color: #9b27b0;',
      '  color: #fff;',
      '  transform: translateY(-2px);',
      '  box-shadow: 0 4px 12px rgba(155, 39, 176, 0.3);',
      '}',
      '.cd-game .cd-bet-btn.cd-active {',
      '  background: linear-gradient(135deg, #9b27b0, #c2185b);',
      '  color: #fff;',
      '  border-color: #c2185b;',
      '  box-shadow: 0 0 16px rgba(155, 39, 176, 0.5);',
      '  transform: translateY(-1px);',
      '}',
      '.cd-game .cd-bet-btn.cd-disabled {',
      '  opacity: 0.4;',
      '  cursor: not-allowed;',
      '  pointer-events: none;',
      '}',

      /* ── Bet Info ── */
      '.cd-game .cd-bet-info-text {',
      '  text-align: center;',
      '  font-size: 12px;',
      '  color: #b08cc4;',
      '  margin-bottom: 12px;',
      '  min-height: 18px;',
      '  letter-spacing: 0.3px;',
      '}',

      /* ── Chip Row ── */
      '.cd-game .cd-chip-row {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  justify-content: center;',
      '  gap: 8px;',
      '  margin-bottom: 16px;',
      '}',
      '.cd-game .cd-chip {',
      '  border-radius: 20px;',
      '  padding: 6px 14px;',
      '  background: rgba(255, 215, 0, 0.1);',
      '  border: 1.5px solid rgba(255, 215, 0, 0.4);',
      '  color: #ffd700;',
      '  font-family: "Outfit", sans-serif;',
      '  font-size: 13px;',
      '  font-weight: 700;',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '  white-space: nowrap;',
      '}',
      '.cd-game .cd-chip:hover:not(.cd-active):not(.cd-disabled) {',
      '  transform: translateY(-2px);',
      '  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);',
      '}',
      '.cd-game .cd-chip.cd-active {',
      '  background: linear-gradient(135deg, #FFD700, #FF8C00);',
      '  color: #1a0a3b;',
      '  border-color: #ffd700;',
      '  box-shadow: 0 0 12px rgba(255, 215, 0, 0.4);',
      '}',
      '.cd-game .cd-chip.cd-disabled {',
      '  opacity: 0.4;',
      '  cursor: not-allowed;',
      '  pointer-events: none;',
      '}',

      /* ── Roll Button ── */
      '.cd-game .cd-roll-wrap {',
      '  display: flex;',
      '  justify-content: center;',
      '  margin-bottom: 12px;',
      '}',
      '.cd-game .cd-roll-btn {',
      '  background: linear-gradient(135deg, #FFD700, #FF8C00);',
      '  color: #1a0a3b;',
      '  font-family: "Outfit", sans-serif;',
      '  font-weight: 900;',
      '  font-size: 18px;',
      '  padding: 14px 48px;',
      '  border-radius: 25px;',
      '  border: none;',
      '  cursor: pointer;',
      '  letter-spacing: 1px;',
      '  text-transform: uppercase;',
      '  transition: all 0.2s ease;',
      '  box-shadow: 0 4px 16px rgba(255,215,0,0.3);',
      '}',
      '.cd-game .cd-roll-btn:hover:not(.cd-disabled) {',
      '  transform: translateY(-3px) scale(1.03);',
      '  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.5);',
      '}',
      '.cd-game .cd-roll-btn:active:not(.cd-disabled) {',
      '  transform: translateY(0) scale(0.98);',
      '}',
      '.cd-game .cd-roll-btn.cd-disabled {',
      '  opacity: 0.5;',
      '  cursor: not-allowed;',
      '  transform: none;',
      '  box-shadow: none;',
      '}',

      /* ── Result ── */
      '.cd-game .cd-result-area {',
      '  text-align: center;',
      '  min-height: 48px;',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  justify-content: center;',
      '  margin-bottom: 8px;',
      '}',
      '.cd-game .cd-result-text {',
      '  font-size: 24px;',
      '  font-weight: 900;',
      '  letter-spacing: 1px;',
      '}',
      '.cd-game .cd-result-text.cd-win {',
      '  color: #ffd700;',
      '  text-shadow: 0 0 20px rgba(255,215,0,0.6), 0 0 40px rgba(255,215,0,0.3);',
      '}',
      '.cd-game .cd-result-text.cd-lose {',
      '  color: #8b8b9e;',
      '}',
      '.cd-game .cd-result-amount {',
      '  font-size: 16px;',
      '  font-weight: 700;',
      '  color: #ffd700;',
      '  margin-top: 4px;',
      '}',

      /* ── Collect Button ── */
      '.cd-game .cd-collect-btn {',
      '  background: linear-gradient(90deg, #10b981, #22c55e);',
      '  color: #fff;',
      '  border-radius: 20px;',
      '  padding: 10px 32px;',
      '  font-family: "Outfit", sans-serif;',
      '  font-weight: 700;',
      '  font-size: 15px;',
      '  border: none;',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);',
      '  letter-spacing: 0.5px;',
      '  display: none;',
      '}',
      '.cd-game .cd-collect-btn:hover {',
      '  transform: translateY(-2px) scale(1.03);',
      '  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);',
      '}',
      '.cd-game .cd-collect-btn:active {',
      '  transform: translateY(0) scale(0.97);',
      '}',

      /* ── Balance Bar ── */
      '.cd-game .cd-balance-bar {',
      '  display: flex;',
      '  justify-content: center;',
      '  margin-top: 10px;',
      '}',
      '.cd-game .cd-balance {',
      '  border-radius: 20px;',
      '  background: linear-gradient(135deg, rgba(0,242,255,0.12), rgba(112,0,255,0.10));',
      '  border: 1px solid rgba(0,242,255,0.25);',
      '  box-shadow: 0 0 8px rgba(0,242,255,0.12);',
      '  padding: 6px 16px;',
      '  font-size: 12px;',
      '  font-weight: 900;',
      '  letter-spacing: 0.3px;',
      '  white-space: nowrap;',
      '}',
      '.cd-game .cd-balance .cd-bal-icon { color: inherit; }',
      '.cd-game .cd-balance .cd-bal-amount { color: #00f2ff; }',
      '.cd-game .cd-balance .cd-bal-label { color: rgba(255,255,255,0.6); margin-left: 4px; }',

      /* ── Gold Dust Particles ── */
      '.cd-game .cd-gold-dust {',
      '  position: absolute;',
      '  width: 3px; height: 3px;',
      '  background: #ffd700;',
      '  border-radius: 50%;',
      '  pointer-events: none;',
      '  z-index: 1;',
      '  animation: cd-gold-drift linear infinite;',
      '  opacity: 0;',
      '  box-shadow: 0 0 4px rgba(255,215,0,0.5);',
      '}',

      /* ── Confetti ── */
      '.cd-game .cd-confetti {',
      '  position: absolute;',
      '  pointer-events: none;',
      '  z-index: 100;',
      '  border-radius: 2px;',
      '}',

      /* ── Gold Flourish ── */
      '.cd-game .cd-flourish {',
      '  position: absolute;',
      '  top: 25%; left: 50%;',
      '  transform: translate(-50%, -50%);',
      '  width: 300px; height: 200px;',
      '  background: radial-gradient(ellipse, rgba(255,215,0,0.25) 0%, transparent 70%);',
      '  pointer-events: none;',
      '  z-index: 1;',
      '  animation: cd-flourish-pulse 0.8s ease-out forwards;',
      '}',

      /* ── Crown Float (triple win) ── */
      '.cd-game .cd-crown-float {',
      '  position: absolute;',
      '  top: 30%; left: 50%;',
      '  transform: translate(-50%, -50%) scale(0);',
      '  font-size: 64px;',
      '  pointer-events: none;',
      '  z-index: 101;',
      '  animation: cd-crown-appear 1.5s ease-out forwards;',
      '}',

      /* ── Screen Edge Flash ── */
      '.cd-game .cd-edge-flash {',
      '  position: absolute;',
      '  top: 0; left: 0; right: 0; bottom: 0;',
      '  border: 3px solid rgba(255,215,0,0.6);',
      '  border-radius: 16px;',
      '  pointer-events: none;',
      '  z-index: 99;',
      '  animation: cd-edge-glow 1s ease-out forwards;',
      '}',

      /* ══ KEYFRAMES ══ */
      '@keyframes cd-tumble {',
      '  0%   { transform: rotateX(0deg) rotateZ(0deg) scale(0.85); }',
      '  15%  { transform: rotateX(540deg) rotateZ(270deg) scale(1.1); }',
      '  35%  { transform: rotateX(1260deg) rotateZ(630deg) scale(0.92); }',
      '  55%  { transform: rotateX(1980deg) rotateZ(900deg) scale(1.06); }',
      '  75%  { transform: rotateX(2700deg) rotateZ(1260deg) scale(0.97); }',
      '  88%  { transform: rotateX(3100deg) rotateZ(1440deg) scale(1.02); }',
      '  100% { transform: rotateX(3240deg) rotateZ(1620deg) scale(1); }',
      '}',
      '@keyframes cd-land-flash {',
      '  0%   { box-shadow: 0 4px 16px rgba(0,0,0,0.4), 0 0 30px rgba(255,215,0,0.9), 0 0 60px rgba(155,39,176,0.5); }',
      '  100% { box-shadow: 0 4px 16px rgba(0,0,0,0.4), 0 0 8px rgba(255,215,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5); }',
      '}',
      '@keyframes cd-gold-drift {',
      '  0%   { transform: translateY(-10px); opacity: 0; }',
      '  10%  { opacity: 0.6; }',
      '  90%  { opacity: 0.4; }',
      '  100% { transform: translateY(600px); opacity: 0; }',
      '}',
      '@keyframes cd-flourish-pulse {',
      '  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }',
      '  30%  { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }',
      '  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }',
      '}',
      '@keyframes cd-crown-appear {',
      '  0%   { transform: translate(-50%, -50%) scale(0); opacity: 0; }',
      '  25%  { transform: translate(-50%, -50%) scale(1.4); opacity: 1; }',
      '  60%  { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }',
      '  100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }',
      '}',
      '@keyframes cd-edge-glow {',
      '  0%   { opacity: 1; border-color: rgba(255,215,0,0.8); }',
      '  100% { opacity: 0; border-color: rgba(255,215,0,0); }',
      '}',

      /* RTL adjustments */
      '.cd-game[dir="rtl"] .cd-balance .cd-bal-label { margin-left: 0; margin-right: 4px; }'
    ].join('\n');
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: DICE FACE RENDERING
  // ═══════════════════════════════════════════════════════════════
  function renderDieFace(dieEl, value) {
    var v = Math.max(1, Math.min(6, value));
    var pips = PIP_MAP[v];
    dieEl.innerHTML = '';
    for (var i = 1; i <= 9; i++) {
      var cell = document.createElement('div');
      cell.className = 'cd-pip-cell';
      if (pips.indexOf(i) !== -1) {
        var dot = document.createElement('div');
        dot.className = 'cd-pip';
        cell.appendChild(dot);
      }
      dieEl.appendChild(cell);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: GOLD DUST PARTICLES (ambient)
  // ═══════════════════════════════════════════════════════════════
  function createGoldDust() {
    var game = _container.querySelector('.cd-game');
    if (!game) return;
    for (var i = 0; i < 18; i++) {
      var dot = document.createElement('div');
      dot.className = 'cd-gold-dust';
      var size = 2 + Math.random() * 2;
      dot.style.width = size + 'px';
      dot.style.height = size + 'px';
      dot.style.left = (Math.random() * 100) + '%';
      dot.style.top = '-10px';
      dot.style.animationDuration = (6 + Math.random() * 6) + 's';
      dot.style.animationDelay = (Math.random() * 10) + 's';
      game.appendChild(dot);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: CONFETTI BURST
  // ═══════════════════════════════════════════════════════════════
  function spawnConfetti(isTriple) {
    var game = _container.querySelector('.cd-game');
    if (!game) return;
    var count = isTriple ? 55 : 32;
    var colors = ['#ffd700', '#9b27b0', '#c2185b', '#ffffff', '#ff6b6b', '#7c3aed', '#fbbf24'];
    var particles = [];
    var startTime = Date.now();
    var duration = isTriple ? 3000 : 2200;

    for (var i = 0; i < count; i++) {
      var piece = document.createElement('div');
      piece.className = 'cd-confetti';
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = '50%';
      piece.style.top = '35%';
      var size = 4 + Math.random() * 8;
      piece.style.width = size + 'px';
      piece.style.height = (size * (0.5 + Math.random() * 0.8)) + 'px';
      piece.style.borderRadius = Math.random() > 0.4 ? '50%' : '2px';
      game.appendChild(piece);

      var angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.8;
      var speed = 150 + Math.random() * 300;
      particles.push({
        el: piece,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 200,
        gravity: 500 + Math.random() * 400,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 900
      });
    }

    function animate() {
      var now = Date.now();
      var elapsed = (now - startTime) / 1000;
      var progress = elapsed / (duration / 1000);

      if (progress >= 1) {
        for (var i = 0; i < particles.length; i++) {
          if (particles[i].el.parentNode) particles[i].el.parentNode.removeChild(particles[i].el);
        }
        return;
      }

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var x = p.vx * elapsed;
        var y = p.vy * elapsed + 0.5 * p.gravity * elapsed * elapsed;
        var rot = p.rot + p.rotSpeed * elapsed;
        p.el.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + rot + 'deg)';
        if (progress > 0.6) {
          p.el.style.opacity = Math.max(0, 1 - (progress - 0.6) / 0.4);
        }
      }

      var raf = requestAnimationFrame(animate);
      _rafIds.push(raf);
    }

    var raf = requestAnimationFrame(animate);
    _rafIds.push(raf);
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: GOLD FLOURISH EFFECT
  // ═══════════════════════════════════════════════════════════════
  function goldFlourish() {
    var game = _container.querySelector('.cd-game');
    if (!game) return;
    var glow = document.createElement('div');
    glow.className = 'cd-flourish';
    game.appendChild(glow);
    safeTimeout(function() {
      if (glow.parentNode) glow.parentNode.removeChild(glow);
    }, 900);
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: TRIPLE WIN SPECIAL EFFECTS
  // ═══════════════════════════════════════════════════════════════
  function tripleSpecialEffects() {
    var game = _container.querySelector('.cd-game');
    if (!game) return;

    // Crown float
    var crown = document.createElement('div');
    crown.className = 'cd-crown-float';
    crown.textContent = '👑';
    game.appendChild(crown);
    safeTimeout(function() {
      if (crown.parentNode) crown.parentNode.removeChild(crown);
    }, 1600);

    // Screen edge flash
    var flash = document.createElement('div');
    flash.className = 'cd-edge-flash';
    game.appendChild(flash);
    safeTimeout(function() {
      if (flash.parentNode) flash.parentNode.removeChild(flash);
    }, 1100);

    // Extra confetti burst
    safeTimeout(function() { spawnConfetti(true); }, 300);
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: BALANCE DISPLAY
  // ═══════════════════════════════════════════════════════════════
  function updateBalanceDisplay() {
    var balEl = $('cd-balance');
    if (!balEl) return;
    var iconSpan = balEl.querySelector('.cd-bal-icon');
    var amtSpan = balEl.querySelector('.cd-bal-amount');
    var lblSpan = balEl.querySelector('.cd-bal-label');
    if (iconSpan) iconSpan.textContent = '\uD83E\uDDE0 ';
    if (amtSpan) amtSpan.textContent = fmtNum(_balance);
    if (lblSpan) lblSpan.textContent = t('currency');
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: BET SELECTION
  // ═══════════════════════════════════════════════════════════════
  function updateBetInfo() {
    var infoEl = $('cd-bet-info');
    if (!infoEl) return;
    if (!_selectedBet) {
      infoEl.textContent = t('selectBet');
      return;
    }
    var key = 'info' + _selectedBet.charAt(0).toUpperCase() + _selectedBet.slice(1);
    infoEl.textContent = t(key);
  }

  function selectBet(type) {
    if (_isRolling) return;
    _selectedBet = type;
    var btns = $clsAll('cd-bet-btn');
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].getAttribute('data-bet') === type) {
        btns[i].classList.add('cd-active');
      } else {
        btns[i].classList.remove('cd-active');
      }
    }
    updateBetInfo();
  }

  function selectChip(value) {
    if (_isRolling) return;
    _selectedChip = value;
    var chips = $clsAll('cd-chip');
    for (var i = 0; i < chips.length; i++) {
      if (parseInt(chips[i].getAttribute('data-value'), 10) === value) {
        chips[i].classList.add('cd-active');
      } else {
        chips[i].classList.remove('cd-active');
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: GAME LOGIC
  // ═══════════════════════════════════════════════════════════════
  function rollDice() {
    if (_isRolling) return;
    if (!_selectedBet) { updateBetInfo(); return; }
    if (!_selectedChip) return;
    if (_balance < _selectedChip) return;

    _isRolling = true;
    setBettingEnabled(false);

    // Hide previous result and collect
    var resultEl = $('cd-result');
    if (resultEl) resultEl.innerHTML = '';
    var collectEl = $('cd-collect-btn');
    if (collectEl) collectEl.style.display = 'none';

    // Deduct bet
    mockBet(_selectedChip);

    // Generate final values
    var d1 = Math.floor(Math.random() * 6) + 1;
    var d2 = Math.floor(Math.random() * 6) + 1;
    var d3 = Math.floor(Math.random() * 6) + 1;
    var finalValues = [d1, d2, d3];

    // Animate dice
    animateDiceRoll(finalValues, function() {
      evaluateResult(finalValues);
    });
  }

  function animateDiceRoll(finalValues, callback) {
    var settled = [false, false, false];
    var settledCount = 0;

    // Start face cycling
    _faceCycleInterval = safeInterval(function() {
      for (var i = 0; i < 3; i++) {
        if (!settled[i] && _diceEls[i]) {
          renderDieFace(_diceEls[i], Math.floor(Math.random() * 6) + 1);
        }
      }
    }, 70);

    for (var i = 0; i < 3; i++) {
      (function(idx) {
        var dieEl = _diceEls[idx];
        if (!dieEl) return;
        dieEl.classList.remove('cd-landed');
        dieEl.classList.add('cd-rolling');
        // Vary animation duration for stagger
        dieEl.style.animationDuration = DICE_DURATION[idx] + 'ms';

        function onEnd() {
          dieEl.removeEventListener('animationend', onEnd);
          settled[idx] = true;
          settledCount++;
          dieEl.classList.remove('cd-rolling');
          renderDieFace(dieEl, finalValues[idx]);
          // Brief landing flash
          dieEl.classList.add('cd-landed');
          safeTimeout(function() { dieEl.classList.remove('cd-landed'); }, 500);

          if (settledCount === 3) {
            clearInterval(_faceCycleInterval);
            _faceCycleInterval = null;
            safeTimeout(callback, 200);
          }
        }
        dieEl.addEventListener('animationend', onEnd);
      })(i);
    }
  }

  function evaluateResult(dice) {
    var sum = dice[0] + dice[1] + dice[2];
    var isTriple = (dice[0] === dice[1] && dice[1] === dice[2]);
    var won = false;
    var multiplier = 0;
    var winAmount = 0;

    switch (_selectedBet) {
      case 'low':
        won = (sum >= 3 && sum <= 10);
        multiplier = 2;
        break;
      case 'high':
        won = (sum >= 11 && sum <= 18);
        multiplier = 2;
        break;
      case 'even':
        won = (sum % 2 === 0);
        multiplier = 2;
        break;
      case 'odd':
        won = (sum % 2 === 1);
        multiplier = 2;
        break;
      case 'triple':
        won = isTriple;
        multiplier = 30;
        break;
    }

    if (won) {
      winAmount = _selectedChip * multiplier;
      _pendingWinAmount = winAmount;
      _pendingWinMultiplier = multiplier;
      showResult(true, winAmount, isTriple);
    } else {
      _pendingWinAmount = 0;
      showResult(false, 0, false);
    }
  }

  function showResult(won, amount, isTriple) {
    var resultEl = $('cd-result');
    if (!resultEl) return;
    resultEl.innerHTML = '';

    if (won) {
      var title = isTriple ? t('royalTriple') : t('youWin');
      var titleDiv = document.createElement('div');
      titleDiv.className = 'cd-result-text cd-win';
      titleDiv.textContent = title;
      resultEl.appendChild(titleDiv);

      var amtDiv = document.createElement('div');
      amtDiv.className = 'cd-result-amount';
      amtDiv.textContent = '+' + fmtNum(amount) + ' \uD83E\uDDE0';
      resultEl.appendChild(amtDiv);

      // Animations
      goldFlourish();
      if (isTriple) {
        tripleSpecialEffects();
      } else {
        spawnConfetti(false);
      }

      // Show collect button
      var collectEl = $('cd-collect-btn');
      if (collectEl) {
        collectEl.textContent = t('collect');
        collectEl.style.display = 'inline-block';
      }
    } else {
      var loseDiv = document.createElement('div');
      loseDiv.className = 'cd-result-text cd-lose';
      loseDiv.textContent = t('tryAgain');
      resultEl.appendChild(loseDiv);
    }

    // Auto-fade result text after 3s (but keep collect button)
    safeTimeout(function() {
      var texts = resultEl.querySelectorAll('.cd-result-text');
      for (var i = 0; i < texts.length; i++) {
        texts[i].style.transition = 'opacity 0.5s ease';
        texts[i].style.opacity = '0';
      }
      var amt = resultEl.querySelector('.cd-result-amount');
      if (amt) {
        amt.style.transition = 'opacity 0.5s ease';
        amt.style.opacity = '0';
      }
      safeTimeout(function() { resultEl.innerHTML = ''; }, 600);
    }, 3000);

    // Re-enable betting
    _isRolling = false;
    setBettingEnabled(true);
  }

  function collectWinnings() {
    if (_pendingWinAmount <= 0) return;
    mockWin(_pendingWinAmount, _pendingWinMultiplier);
    var collectEl = $('cd-collect-btn');
    if (collectEl) collectEl.style.display = 'none';
    _pendingWinAmount = 0;
    _pendingWinMultiplier = 0;
  }

  function setBettingEnabled(enabled) {
    var betBtns = $clsAll('cd-bet-btn');
    for (var i = 0; i < betBtns.length; i++) {
      if (enabled) betBtns[i].classList.remove('cd-disabled');
      else betBtns[i].classList.add('cd-disabled');
    }
    var chips = $clsAll('cd-chip');
    for (var i = 0; i < chips.length; i++) {
      if (enabled) chips[i].classList.remove('cd-disabled');
      else chips[i].classList.add('cd-disabled');
    }
    var rollBtn = $('cd-roll-btn');
    if (rollBtn) {
      if (enabled) rollBtn.classList.remove('cd-disabled');
      else rollBtn.classList.add('cd-disabled');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: DOM BUILDING
  // ═══════════════════════════════════════════════════════════════
  function buildUI() {
    // Inject scoped styles
    var styleEl = document.createElement('style');
    styleEl.textContent = getStyles();
    _container.appendChild(styleEl);

    // Root wrapper
    var game = document.createElement('div');
    game.className = 'cd-game';
    if (_lang === 'ar') game.setAttribute('dir', 'rtl');
    _container.appendChild(game);

    // ── Gold Dust Particles ──
    createGoldDust();

    // ── Top Bar ──
    var topBar = document.createElement('div');
    topBar.className = 'cd-top-bar';

    var titleEl = document.createElement('div');
    titleEl.className = 'cd-title';
    titleEl.textContent = t('title');
    topBar.appendChild(titleEl);

    var avatarImg = document.createElement('img');
    avatarImg.className = 'cd-avatar';
    avatarImg.src = (_user.photoURL) || 'https://ui-avatars.com/api/?name=User&background=1e293b&color=fff&size=100';
    avatarImg.alt = 'Avatar';
    avatarImg.onerror = function() {
      this.src = 'https://ui-avatars.com/api/?name=User&background=1e293b&color=fff&size=100';
    };
    addListener(avatarImg, 'click', function() {
      var uid = _user.uid;
      if (typeof window.openLuckyGamesMiniProfile === 'function') window.openLuckyGamesMiniProfile(uid);
      else if (typeof window.openMiniProfile === 'function') window.openMiniProfile(uid);
      else if (typeof window.setMiniProfileUID !== 'undefined') { window.setMiniProfileUID(uid); window.setShowMiniProfile(true); }
    });
    topBar.appendChild(avatarImg);
    game.appendChild(topBar);

    // Divider
    var divider = document.createElement('div');
    divider.className = 'cd-divider';
    game.appendChild(divider);

    // ── Dice Area ──
    var diceArea = document.createElement('div');
    diceArea.id = 'cd-faces';
    diceArea.className = 'cd-dice-area';
    _diceEls = [];
    for (var i = 0; i < 3; i++) {
      var wrapper = document.createElement('div');
      wrapper.className = 'cd-die-wrapper';
      var die = document.createElement('div');
      die.className = 'cd-die';
      renderDieFace(die, 1); // initial face
      wrapper.appendChild(die);
      diceArea.appendChild(wrapper);
      _diceEls.push(die);
    }
    game.appendChild(diceArea);

    // ── Bet Type Buttons ──
    var betRow = document.createElement('div');
    betRow.id = 'cd-bet-btns';
    betRow.className = 'cd-bet-row';
    var betKeys = ['low', 'high', 'even', 'odd', 'triple'];
    var betI18nKeys = ['betLow', 'betHigh', 'betEven', 'betOdd', 'betTriple'];
    for (var i = 0; i < betKeys.length; i++) {
      (function(key, i18nKey) {
        var btn = document.createElement('button');
        btn.className = 'cd-bet-btn';
        btn.setAttribute('data-bet', key);
        btn.textContent = t(i18nKey);
        addListener(btn, 'click', function() { selectBet(key); });
        betRow.appendChild(btn);
      })(betKeys[i], betI18nKeys[i]);
    }
    game.appendChild(betRow);

    // ── Bet Info ──
    var betInfo = document.createElement('div');
    betInfo.id = 'cd-bet-info';
    betInfo.className = 'cd-bet-info-text';
    betInfo.textContent = t('selectBet');
    game.appendChild(betInfo);

    // ── Chip Row ──
    var chipRow = document.createElement('div');
    chipRow.className = 'cd-chip-row';
    for (var i = 0; i < CHIP_VALUES.length; i++) {
      (function(val, label) {
        var chip = document.createElement('button');
        chip.className = 'cd-chip';
        chip.setAttribute('data-value', String(val));
        chip.textContent = '\uD83E\uDDE0 ' + label;
        addListener(chip, 'click', function() { selectChip(val); });
        chipRow.appendChild(chip);
      })(CHIP_VALUES[i], CHIP_LABELS[i]);
    }
    game.appendChild(chipRow);

    // ── Roll Button ──
    var rollWrap = document.createElement('div');
    rollWrap.id = 'cd-spin-btn';
    rollWrap.className = 'cd-roll-wrap';
    rollWrap.style.display = 'inline-block';
    var rollBtn = document.createElement('button');
    rollBtn.id = 'cd-roll-btn';
    rollBtn.className = 'cd-roll-btn';
    rollBtn.textContent = t('roll');
    addListener(rollBtn, 'click', rollDice);
    rollWrap.appendChild(rollBtn);
    game.appendChild(rollWrap);

    // ── Result Area ──
    var resultArea = document.createElement('div');
    resultArea.id = 'cd-result';
    resultArea.className = 'cd-result-area';
    game.appendChild(resultArea);

    // ── Collect Button ──
    var collectBtn = document.createElement('button');
    collectBtn.id = 'cd-collect-btn';
    collectBtn.className = 'cd-collect-btn';
    collectBtn.textContent = t('collect');
    addListener(collectBtn, 'click', collectWinnings);
    game.appendChild(collectBtn);

    // ── Balance Bar ──
    var balanceBar = document.createElement('div');
    balanceBar.className = 'cd-balance-bar';
    var balanceEl = document.createElement('div');
    balanceEl.id = 'cd-balance';
    balanceEl.className = 'cd-balance';
    var iconSpan = document.createElement('span');
    iconSpan.className = 'cd-bal-icon';
    iconSpan.textContent = '\uD83E\uDDE0 ';
    var amtSpan = document.createElement('span');
    amtSpan.className = 'cd-bal-amount';
    amtSpan.textContent = fmtNum(_balance);
    var lblSpan = document.createElement('span');
    lblSpan.className = 'cd-bal-label';
    lblSpan.textContent = t('currency');
    balanceEl.appendChild(iconSpan);
    balanceEl.appendChild(amtSpan);
    balanceEl.appendChild(lblSpan);
    balanceBar.appendChild(balanceEl);
    game.appendChild(balanceBar);
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: RE-RENDER LABELS (language switch)
  // ═══════════════════════════════════════════════════════════════
  function reRenderLabels() {
    var game = _container.querySelector('.cd-game');
    if (!game) return;

    if (_lang === 'ar') game.setAttribute('dir', 'rtl');
    else game.removeAttribute('dir');

    // Title
    var titleEl = game.querySelector('.cd-title');
    if (titleEl) titleEl.textContent = t('title');

    // Bet buttons
    var betI18nKeys = ['betLow', 'betHigh', 'betEven', 'betOdd', 'betTriple'];
    var betBtns = game.querySelectorAll('.cd-bet-btn');
    for (var i = 0; i < betBtns.length && i < betI18nKeys.length; i++) {
      betBtns[i].textContent = t(betI18nKeys[i]);
    }

    // Bet info
    updateBetInfo();

    // Roll button
    var rollBtn = $('cd-roll-btn');
    if (rollBtn) rollBtn.textContent = t('roll');

    // Collect button
    var collectBtn = $('cd-collect-btn');
    if (collectBtn && collectBtn.style.display !== 'none') collectBtn.textContent = t('collect');

    // Balance label
    updateBalanceDisplay();
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: PUBLIC API
  // ═══════════════════════════════════════════════════════════════

  /**
   * start(container, options)
   * - container: DOM element (#cd-root-hub)
   * - options: { lang: 'en'|'ar', user: { uid, photoURL, currency } }
   */
  function start(container, options) {
    if (!container) return;
    _container = container;
    _lang = (options && options.lang) || 'en';
    _user = (options && options.user) || { uid: '', photoURL: '', currency: 0 };
    _balance = (_user.currency != null) ? Number(_user.currency) : 0;
    _selectedBet = null;
    _selectedChip = null;
    _isRolling = false;
    _pendingWinAmount = 0;
    _pendingWinMultiplier = 0;
    _diceEls = [];

    // Clear previous content
    _container.innerHTML = '';

    // Build the full UI
    buildUI();
  }

  /**
   * stop()
   * - Kill all timers/intervals/listeners, wipe container
   */
  function stop() {
    clearAllTimers();
    if (_faceCycleInterval) { clearInterval(_faceCycleInterval); _faceCycleInterval = null; }
    removeAllListeners();
    if (_container) _container.innerHTML = '';
    _container = null;
    _user = null;
    _diceEls = [];
    _selectedBet = null;
    _selectedChip = null;
    _isRolling = false;
    _pendingWinAmount = 0;
  }

  /**
   * setLanguage(lang)
   * - lang: 'en' | 'ar'
   * - Re-render all text labels
   */
  function setLanguage(lang) {
    if (!lang || (lang !== 'en' && lang !== 'ar')) return;
    _lang = lang;
    reRenderLabels();
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION: MODULE EXPORT
  // ═══════════════════════════════════════════════════════════════
  window.CrownDiceGame = {
    start: start,
    stop: stop,
    setLanguage: setLanguage
  };

})();
