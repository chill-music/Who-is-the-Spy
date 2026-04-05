(function() {
const { useState, useEffect, useRef } = React;// ── Constants ───────────────────────────────────────────────────
const BET_SECS = 16;
const TICK_MS  = 70;

// ── Helpers ─────────────────────────────────────────────────────
function genCrash() {
  const r = Math.random();
  if (r < 0.04) return 1.00;
  return Math.max(1.01, Math.round((0.96 / (1 - r)) * 100) / 100);
}
function fmt(v) { return v.toFixed(2) + "x"; }
function multColor(v, crashed) {
  if (crashed) return "#f87171";
  if (v >= 10) return "#c084fc";
  if (v >= 5)  return "#fb923c";
  if (v >= 2)  return "#22d3ee";
  return "#fcd34d";
}
function histColor(v) {
  if (v >= 10) return { bg:"rgba(124,58,237,0.25)", bd:"#a855f7", tx:"#c084fc" };
  if (v >= 5)  return { bg:"rgba(217,119,6,0.25)",  bd:"#f59e0b", tx:"#fcd34d" };
  if (v >= 2)  return { bg:"rgba(14,116,163,0.25)", bd:"#0ea5e9", tx:"#38bdf8" };
  return          { bg:"rgba(22,101,52,0.25)",  bd:"#16a34a", tx:"#4ade80" };
}

// ── Stars (static seed) ─────────────────────────────────────────
const STARS = Array.from({ length: 50 }, (_, i) => ({
  id:  i,
  x:   (i * 41.7) % 100,
  y:   (i * 67.3) % 100,
  sz:  ((i * 13)  % 1.5) + 0.5,
  dur: ((i * 7.9) % 2.2) + 1.4,
  del: (i * 0.37) % 3.2,
}));

// ── Sound System (singleton) ────────────────────────────────────
const SFX = (() => {
  let ac          = null;
  let on          = true;
  let flightOsc   = null;
  let flightGain  = null;
  let tickCounter = 0;

  function getAC() {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === "suspended") ac.resume();
    return ac;
  }

  function tone(freq, dur, vol = 0.2, type = "sine", delay = 0, freqTo = null) {
    if (!on) return;
    try {
      const c = getAC();
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.value = freq;
      const t = c.currentTime + delay;
      if (freqTo) o.frequency.exponentialRampToValueAtTime(freqTo, t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (_) {}
  }

  function noiseBurst(dur, vol, freqCut) {
    if (!on) return;
    try {
      const c   = getAC();
      const len = Math.floor(c.sampleRate * dur);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 0.55);
      const src = c.createBufferSource(); src.buffer = buf;
      const flt = c.createBiquadFilter(); flt.type = "lowpass"; flt.frequency.value = freqCut;
      const g   = c.createGain();         g.gain.value = vol;
      src.connect(flt); flt.connect(g); g.connect(c.destination);
      src.start();
    } catch (_) {}
  }

  return {
    isOn() { return on; },

    toggle() {
      on = !on;
      if (!on && flightOsc) {
        try {
          flightGain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.1);
          flightOsc.stop(ac.currentTime + 0.1);
        } catch (_) {}
        flightOsc = null; flightGain = null;
      }
      return on;
    },

    // 1 per second countdown beep
    countdown(n) {
      if (n <= 3) tone(n === 1 ? 900 : 700, 0.1, 0.3, "square");
      else        tone(340, 0.07, 0.14, "square");
    },

    // Whoosh + rumble on launch
    launch() {
      tone(90,  0.75, 0.38, "sawtooth", 0,    560);
      tone(180, 0.5,  0.2,  "sine",     0.05, 920);
      tone(440, 0.2,  0.15, "sine",     0.12);
    },

    // Start continuous flight hum
    startHum() {
      if (!on) return;
      try {
        const c = getAC();
        if (flightOsc) return;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = "sine"; o.frequency.value = 110;
        g.gain.value = 0.07;
        o.connect(g); g.connect(c.destination);
        o.start();
        flightOsc = o; flightGain = g;
      } catch (_) {}
    },

    // Update hum pitch as multiplier rises
    updateHum(m) {
      if (!flightOsc || !on) return;
      try {
        const c = getAC();
        flightOsc.frequency.setTargetAtTime(100 + m * 13, c.currentTime, 0.25);
        flightGain.gain.setTargetAtTime(Math.min(0.13, 0.05 + m * 0.006), c.currentTime, 0.25);
      } catch (_) {}
    },

    stopHum() {
      if (!flightOsc) return;
      try {
        const c = getAC();
        flightGain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.18);
        flightOsc.stop(c.currentTime + 0.18);
      } catch (_) {}
      flightOsc = null; flightGain = null;
    },

    // Subtle tick every N updates (pitch rises with multiplier)
    tick(m) {
      tickCounter++;
      if (tickCounter % 5 !== 0) return;
      tone(280 + m * 22, 0.034, 0.055, "square");
    },

    // Big crash boom + noise
    crash() {
      this.stopHum();
      noiseBurst(0.75, 0.65, 380);
      tone(260, 0.65, 0.55, "sawtooth", 0,    22);
      tone(80,  0.4,  0.3,  "sine",     0.06, 25);
    },

    // Win arpeggio on successful claim
    win() {
      [523, 659, 784, 1047, 1319].forEach((f, i) =>
        tone(f, 0.45, 0.22, "sine", i * 0.11));
    },

    // Claim button hit
    claim() {
      tone(880,  0.06, 0.32, "square");
      tone(1100, 0.1,  0.26, "sine",   0.06);
      tone(1320, 0.18, 0.2,  "sine",   0.13);
    },

    // Bet placed confirmation blip
    bet() {
      tone(440, 0.09, 0.22, "sine");
      tone(550, 0.09, 0.16, "sine", 0.09);
    },
  };
})();

// ── Canvas: draw rocket scene with trail from exhaust ───────────
function drawScene(canvas, pts, phase) {
  if (!canvas || pts.length < 1) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const last = pts[pts.length - 1];
  const maxT = Math.max(12, last.t + 2);
  const maxM = Math.max(2.4, last.m * 1.35);

  const px = (t) => W * 0.07 + (t / maxT) * W * 0.87;
  const py = (m) => H * 0.91 - ((m - 1) / (maxM - 1)) * H * 0.83;

  // Grid
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  const step = maxM > 8 ? 2 : maxM > 4 ? 1 : 0.5;
  for (let m = 1; m <= maxM + step; m += step) {
    const y = py(m); if (y < 0) break;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.font = "9px monospace";
    ctx.fillText(m % 1 === 0 ? m + "x" : m.toFixed(1) + "x", 3, y - 2);
  }
  for (let t = 0; t <= maxT; t += 2) {
    const x = px(t);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    ctx.font = "9px monospace";
    ctx.fillText(t + "s", x - 7, H - 3);
  }

  if (pts.length < 2) return;

  // Gradient fill under trail
  const grd = ctx.createLinearGradient(0, py(maxM), 0, py(1));
  grd.addColorStop(0, phase === "crashed" ? "rgba(239,68,68,0.2)" : "rgba(168,85,247,0.2)");
  grd.addColorStop(1, "transparent");
  ctx.fillStyle = grd;
  ctx.beginPath();
  pts.forEach((p, i) => { const [x, y] = [px(p.t), py(p.m)]; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
  ctx.lineTo(px(last.t), py(1)); ctx.lineTo(px(pts[0].t), py(1)); ctx.closePath(); ctx.fill();

  // Trail line with glow — ends at the rocket exhaust
  const tc = phase === "crashed" ? "#ef4444" : "#a855f7";
  ctx.save();
  ctx.strokeStyle = tc; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.shadowColor = tc; ctx.shadowBlur = 16;
  ctx.beginPath();
  pts.forEach((p, i) => { const [x, y] = [px(p.t), py(p.m)]; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
  ctx.stroke(); ctx.restore();

  // ── Rocket tip (exhaust at trail end, nose ahead) ─────────────
  const lx = px(last.t);
  const ly = py(last.m);

  if (phase === "flying") {
    // Travel angle from recent trail history
    let angle = -Math.PI / 4;
    if (pts.length > 4) {
      const prev = pts[Math.max(0, pts.length - 6)];
      const dx = px(last.t) - px(prev.t);
      const dy = py(last.m) - py(prev.m);
      angle = Math.atan2(dy, dx);
    }

    // ── Exhaust glow halo exactly at trail tip ────────────────
    const halo = ctx.createRadialGradient(lx, ly, 0, lx, ly, 24);
    halo.addColorStop(0,    "rgba(255,248,130,1)");
    halo.addColorStop(0.18, "rgba(255,150,20,0.88)");
    halo.addColorStop(0.5,  "rgba(230,55,10,0.5)");
    halo.addColorStop(1,    "transparent");
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(lx, ly, 24, 0, Math.PI * 2); ctx.fill();

    // Flame streaks radiating backward (opposite to travel direction)
    const backAngle = angle + Math.PI;
    ctx.save();
    ctx.translate(lx, ly);
    [
      { spread: 0,      len: 18, w: 3.5, col: "rgba(255,235,70,0.92)"  },
      { spread:  0.30,  len: 12, w: 2.2, col: "rgba(255,110,20,0.72)"  },
      { spread: -0.30,  len: 12, w: 2.2, col: "rgba(255,110,20,0.72)"  },
      { spread:  0.58,  len:  7, w: 1.5, col: "rgba(200,50,10,0.45)"   },
      { spread: -0.58,  len:  7, w: 1.5, col: "rgba(200,50,10,0.45)"   },
    ].forEach(({ spread, len, w, col }) => {
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round";
      ctx.shadowColor = "#f97316"; ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(backAngle + spread) * len, Math.sin(backAngle + spread) * len);
      ctx.stroke();
    });
    ctx.restore();

    // ── Rocket body: nose faces travel direction, exhaust at lx,ly
    // 🚀 emoji default: nose = UP (screen -Y, angle = -π/2 from +X axis)
    // To make nose point at `angle`: rotate by (angle + π/2)
    // Rocket center is placed 0.72×RSIZE ahead of the exhaust point
    const RSIZE = 27;
    const rcx   = lx + Math.cos(angle) * RSIZE * 0.72;
    const rcy   = ly + Math.sin(angle) * RSIZE * 0.72;
    ctx.save();
    ctx.translate(rcx, rcy);
    ctx.rotate(angle + Math.PI / 2);       // nose → travel direction
    ctx.font        = RSIZE + "px serif";
    ctx.shadowColor = "rgba(255,255,255,0.45)";
    ctx.shadowBlur  = 7;
    ctx.fillText("🚀", -RSIZE / 2, RSIZE / 2);
    ctx.restore();

  } else if (phase === "crashed") {
    ctx.save();
    ctx.font = "34px serif"; ctx.shadowColor = "#ef4444"; ctx.shadowBlur = 30;
    ctx.fillText("💥", lx - 17, ly + 17);
    ctx.restore();
  }
}

// ── CSS ─────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Exo+2:wght@400;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
.cr-root{font-family:'Exo 2',sans-serif;background:#060115;min-height:100vh;display:flex;align-items:center;justify-content:center;}
.cr-wrap{width:100%;max-width:430px;height:100vh;max-height:900px;background:linear-gradient(175deg,#180840 0%,#0c0430 45%,#060115 100%);display:flex;flex-direction:column;position:relative;overflow:hidden;border-left:1px solid rgba(139,92,246,0.1);border-right:1px solid rgba(139,92,246,0.1);}
.cr-stars{position:absolute;inset:0;pointer-events:none;}
.cr-star{position:absolute;background:white;border-radius:50%;animation:twinkle linear infinite;}
@keyframes twinkle{0%,100%{opacity:.12;transform:scale(1);}50%{opacity:.95;transform:scale(1.4);}}
@keyframes orb-shake{0%,100%{transform:translate(0,0);}10%{transform:translate(-9px,-5px);}20%{transform:translate(8px,5px);}30%{transform:translate(-6px,-4px);}40%{transform:translate(6px,4px);}50%{transform:translate(-4px,-2px);}60%{transform:translate(4px,2px);}70%{transform:translate(-2px,-1px);}80%{transform:translate(2px,1px);}90%{transform:translate(-1px,0);}}
.cr-shake{animation:orb-shake 0.55s ease-in-out;}
@keyframes multPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.05);}}
@keyframes countPulse{0%,100%{box-shadow:0 0 12px rgba(6,182,212,0.4);}50%{box-shadow:0 0 30px rgba(6,182,212,0.9);}}
@keyframes betGlow{0%,100%{box-shadow:0 0 10px rgba(34,197,94,0.4);}50%{box-shadow:0 0 28px rgba(34,197,94,0.85);}}
@keyframes claimGlow{0%,100%{box-shadow:0 0 16px rgba(220,38,38,0.55);}50%{box-shadow:0 0 38px rgba(220,38,38,0.95);}}
@keyframes slideIn{from{opacity:0;transform:translateX(-22px);}to{opacity:1;transform:translateX(0);}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
@keyframes crashFlash{0%,100%{background:transparent;}18%,58%{background:rgba(239,68,68,0.22);}38%,78%{background:rgba(239,68,68,0.06);}}
@keyframes sWave{0%,100%{transform:scaleY(1);}50%{transform:scaleY(0.25);}}
.cr-mult{font-family:'Orbitron',monospace;animation:multPulse 0.7s ease-in-out infinite;}
.cr-count{animation:countPulse 1s ease-in-out infinite;}
.cr-bet-btn{animation:betGlow 1.8s ease-in-out infinite;}
.cr-claim-btn{animation:claimGlow 0.65s ease-in-out infinite;}
.cr-crash-flash{animation:crashFlash 0.7s ease-in-out;}
.cr-hist-new{animation:slideIn 0.35s ease-out;}
.cr-fadein{animation:fadeUp 0.3s ease-out;}
.cr-press{transition:transform .11s,filter .11s;}
.cr-press:active{transform:scale(0.93);filter:brightness(0.86);}
.cr-scroll::-webkit-scrollbar{height:3px;}
.cr-scroll::-webkit-scrollbar-thumb{background:rgba(139,92,246,0.45);border-radius:2px;}
input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
input[type=number]{-moz-appearance:textfield;}
.sw{display:inline-block;width:3px;border-radius:2px;background:#a855f7;margin:0 1.5px;animation:sWave 0.5s ease-in-out infinite;}
.sw:nth-child(1){height:7px;animation-delay:0s;}
.sw:nth-child(2){height:13px;animation-delay:.14s;}
.sw:nth-child(3){height:8px;animation-delay:.28s;}
.sw:nth-child(4){height:12px;animation-delay:.09s;}
`;

// ── Help page content ────────────────────────────────────────────
const HELP_PAGES = [
  {
    title: "How to Bet",
    content: (
      <div style={{ color:"rgba(255,255,255,0.72)", fontSize:13, lineHeight:1.85 }}>
        <p style={{ textAlign:"center", marginBottom:14, color:"rgba(255,255,255,0.88)" }}>
          Select the bet amount first, then click on the betting area to place a bet
        </p>
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:12, flexWrap:"wrap" }}>
          {[["10","#16a34a","#22c55e"],["100","#991b1b","#ef4444"],["1K","#1e3a8a","#3b82f6"],["10K","#6b21a8","#a855f7"]].map(([l,bg,bd])=>(
            <div key={l} style={{ padding:"5px 10px", borderRadius:7, background:bg+"55", border:`1px solid ${bd}`, color:"#fff", fontFamily:"'Orbitron',monospace", fontSize:11 }}>⛽ {l}</div>
          ))}
        </div>
        <p>Choose your fuel amount from the presets and confirm during the betting countdown phase.</p>
      </div>
    ),
  },
  {
    title: "Flight & Claim",
    content: (
      <div style={{ color:"rgba(255,255,255,0.72)", fontSize:13, lineHeight:1.85 }}>
        <p style={{ textAlign:"center", marginBottom:14, color:"rgba(255,255,255,0.88)" }}>
          Track the rocket and click CLAIM before it explodes
        </p>
        <div style={{ background:"rgba(0,0,0,0.3)", borderRadius:10, padding:12, border:"1px solid rgba(255,255,255,0.08)" }}>
          <p>🚀 <b style={{color:"#c084fc"}}>Launch</b> — rocket lifts off after countdown</p>
          <p>📈 <b style={{color:"#fcd34d"}}>Multiplier</b> — rises exponentially over time</p>
          <p>⚡ <b style={{color:"#4ade80"}}>CLAIM</b> — tap the red button to lock in winnings</p>
          <p>💥 <b style={{color:"#f87171"}}>Crash</b> — rocket explodes at a random point</p>
        </div>
      </div>
    ),
  },
  {
    title: "Auto Claim",
    content: (
      <div style={{ color:"rgba(255,255,255,0.72)", fontSize:13, lineHeight:1.85 }}>
        <p style={{ textAlign:"center", marginBottom:14, color:"rgba(255,255,255,0.88)" }}>
          Auto-claim prizes when the rocket reaches your target multiplier
        </p>
        <div style={{ background:"rgba(0,0,0,0.3)", borderRadius:10, padding:12, border:"1px solid rgba(255,255,255,0.08)" }}>
          <p>✅ Enable the <b style={{color:"#818cf8"}}>Auto claim</b> checkbox below</p>
          <p>🎯 Set your target multiplier with the +/− buttons</p>
          <p>🤖 The game auto-claims when the target is reached</p>
          <p>💡 Lower targets are safer but give smaller rewards</p>
        </div>
      </div>
    ),
  },
  {
    title: "Other Instructions",
    content: (
      <div style={{ color:"rgba(255,255,255,0.68)", fontSize:13, lineHeight:1.9 }}>
        <p>• When using auto-claim, you must remain online. Offline users cannot claim rewards.</p>
        <p style={{ marginTop:8 }}>• You can modify the auto-claim value only while it is <b style={{color:"#fcd34d"}}>not enabled</b>. Once enabled it is locked.</p>
        <p style={{ marginTop:8 }}>• Decide whether to use auto-claim <b style={{color:"#fcd34d"}}>before the rocket launches</b>. You cannot toggle it mid-flight.</p>
      </div>
    ),
  },
];

// ── Sound Toggle Button ──────────────────────────────────────────
function SoundBtn({ soundOn, onToggle }) {
  return (
    <button
      className="cr-press"
      onClick={onToggle}
      title={soundOn ? "Sound ON — click to mute" : "Sound OFF — click to unmute"}
      style={{
        width:32, height:32, borderRadius:"50%",
        background: soundOn ? "rgba(168,85,247,0.22)" : "rgba(255,255,255,0.07)",
        border:`1px solid ${soundOn ? "rgba(168,85,247,0.55)" : "rgba(255,255,255,0.12)"}`,
        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow: soundOn ? "0 0 10px rgba(168,85,247,0.35)" : "none",
        transition:"all .2s",
      }}
    >
      {soundOn ? (
        <span style={{ display:"flex", alignItems:"flex-end" }}>
          <span className="sw" />
          <span className="sw" />
          <span className="sw" />
          <span className="sw" />
        </span>
      ) : (
        <span style={{ fontSize:14, filter:"grayscale(1)", opacity:0.4 }}>🔇</span>
      )}
    </button>
  );
}

// ── Main Component ───────────────────────────────────────────────
function CrashGame() {
  // T001: Firebase hooks
  const useAuthState = window.AppHooks?.useAuthState || (() => ({ user: null }));
  const { user } = useAuthState();
  const db = window.db;

  const [phase,     setPhase]     = useState("betting");
  const [countdown, setCd]        = useState(BET_SECS);
  const [mult,      setMult]      = useState(1.00);
  const [balance,   setBalance]   = useState(0);
  const [betInput,  setBetInput]  = useState(100);
  const [curBet,    setCurBet]    = useState(0);
  const [hasBet,    setHasBet]    = useState(false);
  const [claimed,   setClaimed]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [history,   setHistory]   = useState([3.66, 2.70, 1.29, 3.61, 1.36, 2.52, 2.61, 4.94, 2.82]);
  const [round,     setRound]     = useState(641);
  const rRound                    = useRef(641);
  const [autoOn,    setAutoOn]    = useState(false);
  const [autoVal,   setAutoVal]   = useState(1.10);
  const [showHist,  setShowHist]  = useState(false);
  const [showJackpot,  setShowJackpot]  = useState(false);
  const [jackpot,   setJackpot]   = useState(10615785);
  const [showHelp,  setShowHelp]  = useState(false);
  const [helpPage,  setHelpPage]  = useState(1);
  const [shaking,   setShaking]   = useState(false);
  const [isCrashing,setIsCrashing]= useState(false);
  const [soundOn,   setSoundOn]   = useState(true);

  // Game-loop refs (prevent stale closures)
  const canvasRef = useRef(null);
  const rPhase    = useRef("betting");
  const rCrash    = useRef(genCrash());
  const rMult     = useRef(1.00);
  const rStart    = useRef(null);
  const rPts      = useRef([]);
  const rHasBet   = useRef(false);
  const rCurBet   = useRef(0);
  const rClaimed  = useRef(false);
  const rBal      = useRef(0);
  const rAutoOn   = useRef(false);
  const rAutoVal  = useRef(1.10);
  const loopTmr   = useRef(null);
  const cdTmr     = useRef(null);
  const prevCd    = useRef(BET_SECS);

  // Sync state → refs
  useEffect(() => { rHasBet.current  = hasBet;  }, [hasBet]);

  // T003 & T004: Real-time Firebase Balance Sync
  useEffect(() => {
    if (!user?.uid || !db || !window.usersCollection) return;
    const unsub = window.usersCollection.doc(user.uid).onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        const fbBalance = typeof data.coins === 'number' ? data.coins : 0;
        setBalance(fbBalance);
        rBal.current = fbBalance;
      }
    }, (err) => {
      console.error("[CrashGame] Balance sync error:", err);
    });
    return () => unsub();
  }, [user, db]);
  useEffect(() => { rCurBet.current  = curBet;  }, [curBet]);
  useEffect(() => { rClaimed.current = claimed; }, [claimed]);
  useEffect(() => { rBal.current     = balance; }, [balance]);
  useEffect(() => { rAutoOn.current  = autoOn;  }, [autoOn]);
  useEffect(() => { rAutoVal.current = autoVal; }, [autoVal]);

  // Stable handlers via ref
  const doClaimRef = useRef();
  doClaimRef.current = (atMult) => {
    if (rClaimed.current || !rHasBet.current) return;
    rClaimed.current = true;
    setClaimed(true);
    const won = Math.round(rCurBet.current * atMult);

    // T007: Atomically add winnings to Firebase
    // T014: Increment jackpot progress per successful claim
    if (user?.uid && db && window.usersCollection) {
      const increment = window.firebase?.firestore?.FieldValue?.increment || db.FieldValue?.increment;
      if (increment) {
        window.usersCollection.doc(user.uid).update({
          coins: increment(won),
          crash_jackpot_prog: increment(Math.round(atMult * 100) / 100)
        }).catch(err => console.error("[CrashGame] Claim error:", err));

        // Add 0.5% of bet to the global jackpot
        const jpRef = db.collection('artifacts').doc(window.appId || 'default').collection('public').doc('data').collection('crash_game').doc('jackpot');
        jpRef.update({ amount: increment(Math.round(rCurBet.current * 0.005)) }).catch(()=>{});
      }
    }

    const nb  = rBal.current + won;
    rBal.current = nb;
    setBalance(nb);
    setResult({ win: true, amount: won, at: atMult });
    SFX.claim();
    SFX.win();
  };

  const resetRef = useRef();
  resetRef.current = () => {
    clearTimeout(loopTmr.current);
    clearTimeout(cdTmr.current);
    rPhase.current   = "betting";
    rCrash.current   = genCrash();
    rMult.current    = 1.00;
    rPts.current     = [];
    rHasBet.current  = false;
    rCurBet.current  = 0;
    rClaimed.current = false;
    prevCd.current   = BET_SECS;
    setPhase("betting");
    setMult(1.00);
    setCd(BET_SECS);
    setHasBet(false);
    setCurBet(0);
    setClaimed(false);
    setResult(null);
    setIsCrashing(false);
    const cvs = canvasRef.current;
    if (cvs) cvs.getContext("2d").clearRect(0, 0, cvs.width, cvs.height);
  };

  const loopRef = useRef();
  loopRef.current = () => {
    if (rPhase.current !== "flying") return;
    const elapsed = (Date.now() - rStart.current) / 1000;
    const m       = Math.round(Math.pow(Math.E, 0.075 * elapsed) * 100) / 100;
    rMult.current = m;
    setMult(m);
    rPts.current = [...rPts.current, { t: elapsed, m }];
    drawScene(canvasRef.current, rPts.current, "flying");
    SFX.updateHum(m);
    SFX.tick(m);

    // Auto cashout
    if (rAutoOn.current && m >= rAutoVal.current && rHasBet.current && !rClaimed.current) {
      doClaimRef.current(m);
    }

    // Crash check
    if (m >= rCrash.current) {
      rPhase.current = "crashed";
      const finalPts = [...rPts.current, { t: elapsed + 0.05, m: rCrash.current }];
      drawScene(canvasRef.current, finalPts, "crashed");
      if (rHasBet.current && !rClaimed.current) {
        setResult({ win: false, amount: rCurBet.current });
      }
      SFX.crash();
      setPhase("crashed");
      setMult(rCrash.current);
      setIsCrashing(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
      // Note: We leave history and round increment to the global sync listener
      return;
      loopTmr.current = setTimeout(() => resetRef.current(), 3200);
      return;
    }
    loopTmr.current = setTimeout(() => loopRef.current(), TICK_MS);
  };

  // Countdown + launch
  // Global Synchronization (T009 & T010)
  useEffect(() => {
    if (!db) return;
    const stateRef = db.collection('artifacts').doc(window.appId || 'default').collection('public').doc('data').collection('crash_game').doc('state');
    const historyRef = db.collection('artifacts').doc(window.appId || 'default').collection('public').doc('data').collection('crash_game').doc('history');

    const checkAndRepairState = (data) => {
      const now = Date.now();
      if (data.phase === 'betting' && now > data.betEndTime + 2000) {
        setTimeout(() => {
          stateRef.get().then(d => {
            if (d.data().phase === 'betting') {
               const start = Date.now();
               const flyMs = Math.log(data.crashMult) / 0.075 * 1000;
               stateRef.update({ phase: 'flying', flyStartTime: start, flyEndTime: start + flyMs }).catch(()=>{});
            }
          }).catch(()=>{});
        }, Math.random() * 1000);
      }
      else if (data.phase === 'flying' && now > data.flyEndTime + 1500) {
        setTimeout(() => {
          stateRef.get().then(d => {
            if (d.data().phase === 'flying') {
               stateRef.update({ phase: 'crashed', crashedAt: Date.now() }).catch(()=>{});
            }
          }).catch(()=>{});
        }, Math.random() * 1000);
      }
      else if (data.phase === 'crashed' && now > data.crashedAt + 3200 + 1500) {
        setTimeout(() => {
          stateRef.get().then(async d => {
            if (d.data().phase === 'crashed') {
               const nextMult = genCrash();
               await stateRef.update({ phase: 'betting', roundNo: data.roundNo + 1, betEndTime: Date.now() + 16000, crashMult: nextMult });
               // Synchronize history (T011)
               const hDoc = await historyRef.get();
               let results = hDoc.exists ? hDoc.data().results || [] : [];
               results.unshift(data.crashMult);
               if (results.length > 20) results = results.slice(0, 20);
               historyRef.set({ results }).catch(()=>{});
            }
          }).catch(()=>{});
        }, Math.random() * 1000);
      }
    };

    const unsub = stateRef.onSnapshot(doc => {
      if (!doc.exists) {
        stateRef.set({ phase: 'betting', roundNo: rRound.current || 641, betEndTime: Date.now() + 16000, crashMult: genCrash() }).catch(()=>{});
        return;
      }
      const data = doc.data();
      checkAndRepairState(data);

      const now = Date.now();
      if (data.phase === 'betting') {
        const remain = Math.max(0, Math.ceil((data.betEndTime - now) / 1000));
        setCd(remain);
        if (rPhase.current !== 'betting') {
          setRound(data.roundNo || 641); rRound.current = data.roundNo || 641;
          resetRef.current(); 
        }
      } else if (data.phase === 'flying') {
        if (rPhase.current !== 'flying') {
          rPhase.current = "flying";
          setPhase("flying");
          rStart.current = data.flyStartTime;
          rCrash.current = data.crashMult;
          rPts.current   = [{ t: 0, m: 1.00 }];
          SFX.launch();
          setTimeout(() => SFX.startHum(), 260);
          loopTmr.current = setTimeout(() => loopRef.current(), TICK_MS);
        }
      } else if (data.phase === 'crashed') {
        if (rPhase.current !== 'crashed') {
          rCrash.current = data.crashMult;
        }
      }
    });

    // History Listener (T011)
    const unsubHist = historyRef.onSnapshot(doc => {
      if (doc.exists) setHistory(doc.data().results || []);
    });

    // Jackpot Listener (T013)
    const jpRef = db.collection('artifacts').doc(window.appId || 'default').collection('public').doc('data').collection('crash_game').doc('jackpot');
    const unsubJp = jpRef.onSnapshot(doc => {
      if (doc.exists) setJackpot(doc.data().amount || 0);
    });

    return () => { unsub(); unsubHist(); unsubJp(); };
  }, [db]);

  // Visual local timer decrement without triggering transitions
  useEffect(() => {
    if (phase !== "betting") return;
    if (countdown > 0 && countdown !== prevCd.current) { 
      SFX.countdown(countdown); 
      prevCd.current = countdown; 
    }
    if (countdown > 0) {
      cdTmr.current = setTimeout(() => setCd(c => c - 1), 1000);
    }
    return () => clearTimeout(cdTmr.current);
  }, [phase, countdown]);

  useEffect(() => () => { clearTimeout(loopTmr.current); clearTimeout(cdTmr.current); }, []);

  const toggleSound = () => { const s = SFX.toggle(); setSoundOn(s); };

  const placeBet = () => {
    if (phase !== "betting" || hasBet || betInput <= 0) return;
    // T006: Client-side prevention
    if (betInput > balance) {
      if (window.showToast) window.showToast("لا يوجد رصيد كافي", "error");
      else alert("لا يوجد رصيد كافي");
      return;
    }
    
    const input = betInput;
    // T005: Atomically deduct bet from Firebase
    if (user?.uid && db && window.usersCollection) {
      const increment = window.firebase?.firestore?.FieldValue?.increment || db.FieldValue?.increment;
      if (increment) {
        window.usersCollection.doc(user.uid).update({
          coins: increment(-input)
        }).catch(err => console.error("[CrashGame] Bet error:", err));
      }
    }

    const nb = balance - input;
    setBalance(nb); rBal.current = nb;
    setCurBet(input); rCurBet.current = input;
    setHasBet(true);  rHasBet.current = true;
    SFX.bet();
  };

  const claimNow = () => {
    if (phase !== "flying" || !hasBet || claimed) return;
    doClaimRef.current(rMult.current);
  };

  const adjustBet = (d) => {
    if (phase !== "betting" || hasBet) return;
    setBetInput(v => Math.max(10, Math.min(v + d, balance)));
  };

  const setPreset = (v) => { if (phase !== "betting" || hasBet) return; setBetInput(v); };

  const mc        = multColor(mult, phase === "crashed");
  const isBetting = phase === "betting";
  const isFlying  = phase === "flying";
  const isCrashed = phase === "crashed";

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div className="cr-root">
        <div className={`cr-wrap${shaking ? " cr-shake" : ""}`}>

          {/* Stars */}
          <div className="cr-stars">
            {STARS.map(s => (
              <div key={s.id} className="cr-star" style={{ left:s.x+"%", top:s.y+"%", width:s.sz*2, height:s.sz*2, animationDuration:s.dur+"s", animationDelay:s.del+"s" }} />
            ))}
          </div>

          {/* ── Header ── */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px 4px", position:"relative", zIndex:5 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {/* Avatar injected per T022 */}
              <div 
                onClick={() => { if(user?.uid && window.openLuckyGamesMiniProfile) window.openLuckyGamesMiniProfile(user.uid); }}
                style={{ 
                  width:36, height:36, borderRadius:"50%", cursor:"pointer",
                  backgroundImage: user?.avatar ? `url(${user.avatar})` : 'none', 
                  backgroundColor: "rgba(255,255,255,0.1)",
                  backgroundSize:"cover", backgroundPosition:"center", border:"2px solid rgba(255,255,255,0.2)",
                  position: "relative"
                }}
              >
                {user?.frame && <img src={user.frame} style={{position:"absolute", top:-5, left:-5, width:46, height:46, pointerEvents:"none"}} alt=""/>}
              </div>
              <div>
                <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11 }}>Round {round}</div>
                <div style={{ color:"#fcd34d", fontSize:12, fontWeight:"bold" }}>{balance.toLocaleString()}</div>
              </div>
            </div>
            <div style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", textAlign:"center" }}>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:26, fontWeight:900, background:"linear-gradient(180deg,#fde047 0%,#f59e0b 55%,#b45309 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", filter:"drop-shadow(0 0 10px rgba(251,191,36,0.6))", letterSpacing:3, lineHeight:1 }}>CRASH</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", letterSpacing:2, marginTop:1 }}>🚀 ROCKET</div>
            </div>
            <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#d97706,#92400e)", display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid rgba(255,255,255,0.18)", fontSize:18 }}>🏆</div>
          </div>

          {/* Jackpot */}
          <div className="cr-press" onClick={() => setShowJackpot(true)} style={{ cursor: "pointer", margin:"2px 12px", background:"linear-gradient(90deg,#7c1d0e,#c2410c 40%,#ea580c 50%,#c2410c 60%,#7c1d0e)", borderRadius:7, padding:"5px 0", textAlign:"center", border:"1px solid rgba(249,115,22,0.6)", boxShadow:"0 0 14px rgba(249,115,22,0.3)" }}>
            <span style={{ fontFamily:"'Orbitron',monospace", color:"#fde047", fontSize:13, fontWeight:700, letterSpacing:1.5, textShadow:"0 0 10px rgba(253,224,71,0.6)" }}>JACKPOT {jackpot.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
          </div>

          {/* ── Toolbar: People · Sound · Chart · Help ── */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"4px 12px" }}>
            <div style={{ display:"flex", gap:8 }}>
              <button style={{ width:32, height:32, borderRadius:"50%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>👥</button>
              {/* ── Sound toggle ── */}
              <SoundBtn soundOn={soundOn} onToggle={toggleSound} />
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setShowHist(true)} style={{ width:32, height:32, borderRadius:"50%", background:"rgba(6,182,212,0.12)", border:"1px solid rgba(6,182,212,0.35)", cursor:"pointer", fontSize:14, color:"#22d3ee", display:"flex", alignItems:"center", justifyContent:"center" }}>📊</button>
              <button onClick={() => { setShowHelp(true); setHelpPage(1); }} style={{ width:32, height:32, borderRadius:"50%", background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.45)", cursor:"pointer", fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:700, color:"#c4b5fd", display:"flex", alignItems:"center", justifyContent:"center" }}>?</button>
            </div>
          </div>

          {/* History bar */}
          <div className="cr-scroll" style={{ overflowX:"auto", padding:"2px 10px 8px", zIndex:5, position:"relative" }}>
            <div style={{ display:"flex", gap:5, minWidth:"max-content", alignItems:"center" }}>
              {history.map((h, i) => {
                const { bg, bd, tx } = histColor(h);
                return (
                  <div key={i} className={i===0?"cr-hist-new":""} style={{ position:"relative" }}>
                    <div style={{ padding:"3px 8px", borderRadius:5, background:bg, border:`1px solid ${bd}`, color:tx, fontSize:11, fontFamily:"'Orbitron',monospace", fontWeight:700 }}>{fmt(h)}</div>
                    {i===0 && <div style={{ position:"absolute", bottom:-11, left:"50%", transform:"translateX(-50%)", fontSize:8, color:"#fcd34d", fontWeight:800, whiteSpace:"nowrap" }}>NEW</div>}
                  </div>
                );
              })}
              <button onClick={()=>setShowHist(true)} style={{ width:26, height:26, borderRadius:"50%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.15)", cursor:"pointer", color:"#4ade80", fontSize:12, flexShrink:0 }}>↗</button>
            </div>
          </div>

          {/* ── Main arena ── */}
          <div style={{ flex:1, margin:"0 10px", position:"relative", display:"flex", flexDirection:"column", minHeight:0 }}>
            {isBetting ? (
              <div style={{ flex:1, display:"flex", background:"rgba(0,0,0,0.25)", borderRadius:14, border:"1px solid rgba(139,92,246,0.15)", overflow:"hidden" }}>
                {/* Countdown */}
                <div style={{ width:150, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, padding:"16px 10px", borderRight:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ color:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:600, letterSpacing:1 }}>NEXT ROUND</div>
                  <div className="cr-count" style={{ width:80, height:80, borderRadius:"50%", border:"3px solid #06b6d4", background:"radial-gradient(circle,rgba(6,182,212,0.12),transparent)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontFamily:"'Orbitron',monospace", fontSize:32, fontWeight:900, color:"#22d3ee" }}>{countdown}</span>
                  </div>
                  {hasBet
                    ? <div style={{ padding:"5px 12px", borderRadius:20, background:"rgba(34,197,94,0.15)", border:"1px solid #16a34a", color:"#4ade80", fontSize:12, fontWeight:700 }}>✓ BET: {curBet}</div>
                    : <div style={{ color:"rgba(255,255,255,0.3)", fontSize:11 }}>Place your bet!</div>}
                </div>
                {/* Bet panel */}
                <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, padding:14 }}>
                  {!hasBet ? (
                    <>
                      <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11, letterSpacing:1.5 }}>BET AMOUNT</div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(0,0,0,0.35)", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", padding:"6px 10px" }}>
                        <button className="cr-press" onClick={() => adjustBet(-10)} style={{ background:"rgba(239,68,68,0.2)", border:"1px solid rgba(239,68,68,0.5)", borderRadius:6, color:"#f87171", fontWeight:900, width:28, height:28, cursor:"pointer", fontSize:16 }}>−</button>
                        <input type="number" value={betInput} onChange={e => setBetInput(Math.max(0,parseInt(e.target.value)||0))} style={{ width:80, textAlign:"center", background:"none", border:"none", color:"#fcd34d", fontFamily:"'Orbitron',monospace", fontSize:16, fontWeight:700, outline:"none" }} />
                        <button className="cr-press" onClick={() => adjustBet(10)} style={{ background:"rgba(34,197,94,0.2)", border:"1px solid rgba(34,197,94,0.5)", borderRadius:6, color:"#4ade80", fontWeight:900, width:28, height:28, cursor:"pointer", fontSize:16 }}>+</button>
                      </div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"center" }}>
                        {[[10,"#16a34a","#22c55e"],[100,"#991b1b","#ef4444"],[1000,"#1e3a8a","#3b82f6"],[10000,"#581c87","#a855f7"]].map(([v,bg,bd])=>(
                          <button key={v} className="cr-press" onClick={() => setPreset(v)} style={{ padding:"4px 10px", borderRadius:6, background:betInput===v?bd+"33":bg+"44", border:`1.5px solid ${betInput===v?bd:"rgba(255,255,255,0.1)"}`, color:betInput===v?bd:"rgba(255,255,255,0.6)", fontFamily:"'Orbitron',monospace", fontSize:11, cursor:"pointer", fontWeight:700, boxShadow:betInput===v?`0 0 8px ${bd}55`:"none" }}>
                            {v>=1000?(v/1000)+"K":v}
                          </button>
                        ))}
                      </div>
                      <button className="cr-press cr-bet-btn" onClick={placeBet} style={{ width:"100%", padding:"10px", borderRadius:10, background:"linear-gradient(135deg,#16a34a,#15803d)", border:"1.5px solid #22c55e", color:"white", fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:700, cursor:"pointer", letterSpacing:2 }}>
                        🚀 PLACE BET
                      </button>
                    </>
                  ) : (
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:36, marginBottom:8 }}>🎯</div>
                      <div style={{ fontFamily:"'Orbitron',monospace", color:"#4ade80", fontWeight:700, fontSize:15, marginBottom:4 }}>BET CONFIRMED!</div>
                      <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12, marginBottom:10 }}>Awaiting launch...</div>
                      <div style={{ padding:"6px 16px", borderRadius:22, background:"rgba(251,191,36,0.12)", border:"1.5px solid #fcd34d", color:"#fcd34d", fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:900, display:"inline-block" }}>{curBet.toLocaleString()}</div>
                      <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10, marginTop:4, letterSpacing:1 }}>COINS AT STAKE</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Canvas flight view */
              <div className={isCrashing?"cr-crash-flash":""} style={{ flex:1, position:"relative", background:"rgba(5,2,20,0.85)", borderRadius:14, border:`1px solid ${isCrashed?"rgba(239,68,68,0.3)":"rgba(139,92,246,0.22)"}`, overflow:"hidden", boxShadow:isCrashed?"0 0 30px rgba(239,68,68,0.15) inset":"0 0 20px rgba(139,92,246,0.08) inset" }}>
                {/* Multiplier overlay */}
                <div style={{ position:"absolute", top:"42%", left:"50%", transform:"translate(-50%,-50%)", zIndex:10, textAlign:"center", pointerEvents:"none" }}>
                  <div className={isFlying&&!claimed?"cr-mult":""} style={{ fontFamily:"'Orbitron',monospace", fontSize:52, fontWeight:900, color:mc, textShadow:`0 0 30px ${mc}99, 0 0 60px ${mc}44`, lineHeight:1, letterSpacing:-1 }}>{fmt(mult)}</div>
                  {isCrashed && <div className="cr-fadein" style={{ color:"#f87171", fontFamily:"'Orbitron',monospace", fontSize:14, fontWeight:700, letterSpacing:4, marginTop:4, textShadow:"0 0 14px rgba(248,113,113,0.7)" }}>CRASHED!</div>}
                  {isFlying && hasBet && !claimed && <div style={{ color:"rgba(255,255,255,0.45)", fontSize:13, marginTop:3, fontWeight:600 }}>= <span style={{ color:"#4ade80", fontWeight:700 }}>{Math.round(curBet*mult)}</span></div>}
                  {isFlying && claimed && <div className="cr-fadein" style={{ marginTop:6, padding:"4px 14px", borderRadius:20, background:"rgba(34,197,94,0.18)", border:"1.5px solid #22c55e", color:"#4ade80", fontSize:12, fontWeight:700, display:"inline-block" }}>✓ LOCKED IN</div>}
                </div>
                <canvas ref={canvasRef} width={420} height={220} style={{ width:"100%", height:"100%", display:"block" }} />
              </div>
            )}
          </div>

          {/* Action button */}
          <div style={{ padding:"6px 10px 4px" }}>
            {isFlying && hasBet && !claimed ? (
              <button className="cr-press cr-claim-btn" onClick={claimNow} style={{ width:"100%", padding:"13px", borderRadius:12, background:"linear-gradient(135deg,#dc2626,#b91c1c)", border:"2px solid #f87171", color:"white", fontFamily:"'Orbitron',monospace", fontSize:17, fontWeight:900, cursor:"pointer", letterSpacing:3 }}>
                CLAIM  {Math.round(curBet*mult).toLocaleString()}
              </button>
            ) : isFlying && !hasBet ? (
              <div style={{ textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:12, padding:"10px 0", letterSpacing:1 }}>NO BET THIS ROUND</div>
            ) : isFlying && claimed ? (
              <div style={{ textAlign:"center", color:"#4ade80", fontSize:13, fontWeight:700, padding:"10px 0" }}>✓ Cashed out at {result?.at?.toFixed(2)}x — waiting for round end</div>
            ) : isCrashed && result ? (
              <div className="cr-fadein" style={{ padding:"9px 14px", borderRadius:10, textAlign:"center", background:result.win?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)", border:`1.5px solid ${result.win?"#22c55e":"#ef4444"}` }}>
                <span style={{ fontFamily:"'Orbitron',monospace", fontWeight:700, color:result.win?"#4ade80":"#f87171", fontSize:14 }}>
                  {result.win?`🎉 WON ${result.amount.toLocaleString()} @ ${result.at?.toFixed(2)}x`:`💸 LOST ${result.amount.toLocaleString()} COINS`}
                </span>
              </div>
            ) : null}
          </div>

          {/* ── Bottom bar ── */}
          <div style={{ padding:"4px 10px 10px", background:"rgba(0,0,0,0.35)", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:18 }}>⭐</span>
                <span style={{ fontFamily:"'Orbitron',monospace", color:"#fcd34d", fontWeight:700, fontSize:15 }}>{balance.toLocaleString()}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <label style={{ display:"flex", alignItems:"center", gap:5, cursor:"pointer" }}>
                  <input type="checkbox" checked={autoOn} onChange={e => setAutoOn(e.target.checked)} disabled={isFlying} style={{ accentColor:"#818cf8", width:14, height:14 }} />
                  <span style={{ color:"rgba(255,255,255,0.55)", fontSize:11, letterSpacing:0.5 }}>Auto claim</span>
                </label>
                <div style={{ display:"flex", alignItems:"center", gap:3, background:"rgba(220,38,38,0.18)", borderRadius:8, border:"1px solid rgba(220,38,38,0.5)", padding:"3px 6px" }}>
                  <button onClick={() => setAutoVal(v => Math.max(1.01, Math.round((v-0.05)*100)/100))} disabled={autoOn&&isFlying} style={{ background:"none", border:"none", color:"#f87171", cursor:"pointer", fontSize:13, fontWeight:700, padding:"0 2px" }}>−</button>
                  <span style={{ fontFamily:"'Orbitron',monospace", color:"white", fontSize:11, minWidth:42, textAlign:"center" }}>{autoVal.toFixed(2)}x</span>
                  <button onClick={() => setAutoVal(v => Math.round((v+0.05)*100)/100)} disabled={autoOn&&isFlying} style={{ background:"none", border:"none", color:"#4ade80", cursor:"pointer", fontSize:13, fontWeight:700, padding:"0 2px" }}>+</button>
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {[{label:"10",val:10,from:"#14532d",to:"#166534",bd:"#22c55e"},{label:"100",val:100,from:"#7f1d1d",to:"#991b1b",bd:"#ef4444"},{label:"1K",val:1000,from:"#1e3a8a",to:"#1d4ed8",bd:"#3b82f6"},{label:"10K",val:10000,from:"#3b0764",to:"#6b21a8",bd:"#a855f7"}].map(({label,val,from,to,bd})=>{
                const active=betInput===val, disabled=!isBetting||hasBet;
                return (
                  <button key={val} className="cr-press" onClick={()=>setPreset(val)} disabled={disabled} style={{ flex:1, padding:"7px 4px", borderRadius:10, background:`linear-gradient(175deg,${from},${to}88)`, border:`2px solid ${active?bd:"rgba(255,255,255,0.08)"}`, color:"white", cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.45:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2, boxShadow:active?`0 0 14px ${bd}55`:"none", transition:"border-color .15s,box-shadow .15s" }}>
                    <span style={{ fontSize:22 }}>⛽</span>
                    <span style={{ fontFamily:"'Orbitron',monospace", fontSize:10, fontWeight:700, color:active?bd:"rgba(255,255,255,0.7)" }}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── History Modal ── */}
          {showHist && (
            <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }} onClick={()=>setShowHist(false)}>
              <div className="cr-fadein" style={{ width:"92%", maxWidth:380, background:"linear-gradient(160deg,#1e0a4e,#0d0430)", borderRadius:18, border:"2px solid rgba(99,102,241,0.4)", boxShadow:"0 0 50px rgba(99,102,241,0.25)", overflow:"hidden" }} onClick={e=>e.stopPropagation()}>
                <div style={{ background:"linear-gradient(90deg,#7c3aed,#4f46e5)", padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontFamily:"'Orbitron',monospace", fontWeight:700, fontSize:14, color:"white" }}>Historical Records</span>
                  <button onClick={()=>setShowHist(false)} style={{ background:"rgba(255,255,255,0.18)", border:"1.5px solid rgba(255,255,255,0.3)", borderRadius:7, color:"white", cursor:"pointer", padding:"2px 10px", fontSize:16, fontWeight:700 }}>✕</button>
                </div>
                <div style={{ padding:16 }}>
                  <div style={{ display:"flex", borderBottom:"1px solid rgba(255,255,255,0.08)", paddingBottom:8, marginBottom:6, color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:700, letterSpacing:1 }}>
                    <span style={{ flex:1 }}>ROUND</span><span style={{ flex:1, textAlign:"center" }}>RESULT</span><span style={{ flex:1, textAlign:"right" }}>TIER</span>
                  </div>
                  <div style={{ maxHeight:320, overflowY:"auto" }}>
                    {history.map((h,i)=>{ const{tx}=histColor(h); return (
                      <div key={i} style={{ display:"flex", alignItems:"center", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ flex:1, color:"rgba(255,255,255,0.4)", fontSize:12, position:"relative", display:"inline-flex", alignItems:"center", gap:6 }}>
                          #{round-i-1}
                          {i===0 && phase==="crashed" && <span style={{ background:"#f43f5e", color:"white", fontSize:9, padding:"1px 4px", borderRadius:4, fontWeight:900 }}>NEW</span>}
                        </span>
                        <span style={{ flex:1, textAlign:"center", fontFamily:"'Orbitron',monospace", fontSize:14, fontWeight:700, color:tx }}>{fmt(h)}</span>
                        <span style={{ flex:1, textAlign:"right", fontSize:11, color:h>=10?"#fcd34d":h>=5?"#22d3ee":"#4ade80" }}>{h>=10?"MEGA":h>=5?"HIGH":h>=2?"MED":"LOW"}</span>
                      </div>
                    );})}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Jackpot Modal ── */}
          {showJackpot && (
            <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.85)", zIndex:300, display:"flex", flexDirection:"column", padding:20, overflow:"hidden" }} onClick={()=>setShowJackpot(false)}>
              <div className="cr-fadein" style={{ width:"100%", maxWidth:380, margin:"auto", background:"linear-gradient(160deg,#2a0c4f,#120625)", borderRadius:18, border:"2px solid rgba(249,115,22,0.4)", boxShadow:"0 0 40px rgba(249,115,22,0.2)", display:"flex", flexDirection:"column" }} onClick={e=>e.stopPropagation()}>
                <div style={{ background:"linear-gradient(90deg,#ea580c,#c2410c)", padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", borderTopLeftRadius:16, borderTopRightRadius:16 }}>
                  <span style={{ fontFamily:"'Orbitron',monospace", fontWeight:700, fontSize:15, color:"white", letterSpacing:1 }}>Global Jackpot</span>
                  <button onClick={()=>setShowJackpot(false)} style={{ background:"rgba(255,255,255,0.18)", border:"1.5px solid rgba(255,255,255,0.3)", borderRadius:7, color:"white", cursor:"pointer", padding:"2px 10px", fontSize:16, fontWeight:700 }}>✕</button>
                </div>
                
                <div style={{ padding:20, flex:1, overflowY:"auto", color:"#fff" }}>
                  <div style={{ textAlign:"center", fontSize:32, fontWeight:900, color:"#fde047", fontFamily:"'Orbitron',monospace", letterSpacing:2, marginBottom:5, textShadow:"0 0 16px rgba(253,224,71,0.5)" }}>
                    {jackpot.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
                  </div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", textAlign:"center", marginBottom:20, letterSpacing:1 }}>Total Prize Pool</div>
                  
                  {/* Top 3 Players Leaderboard (T015) */}
                  <div style={{ background:"rgba(0,0,0,0.3)", borderRadius:10, padding:14, border:"1px solid rgba(255,255,255,0.06)", marginBottom:20 }}>
                    <h3 style={{ color:"#fde047", fontSize:13, fontFamily:"'Orbitron',monospace", marginBottom:10 }}>🏆 Top Explorers</h3>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {[{n:"Ninja2",p:79201.5},{n:"AhmedGaming",p:64512.2},{n:"RocketKing",p:41120.9}].map((lb, idx) => (
                        <div key={idx} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(255,255,255,0.03)", padding:"6px 12px", borderRadius:6 }}>
                          <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>#{idx+1} {lb.n}</span>
                          <span style={{ fontFamily:"'Orbitron',monospace", fontSize:12, color:"#4ade80", fontWeight:700 }}>{lb.p.toLocaleString()}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Payout Distribution Boxes */}
                  <div style={{ display:"flex", gap:8, marginBottom:20 }}>
                    <div style={{ flex:1, background:"rgba(52,211,153,0.1)", borderRadius:8, padding:10, textAlign:"center", border:"1px solid rgba(52,211,153,0.3)" }}>
                      <div style={{ fontSize:18, fontWeight:900, color:"#34d399", fontFamily:"'Orbitron',monospace" }}>10%</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.6)", marginTop:4 }}>Bet 10 ~ 1K</div>
                    </div>
                    <div style={{ flex:1, background:"rgba(96,165,250,0.1)", borderRadius:8, padding:10, textAlign:"center", border:"1px solid rgba(96,165,250,0.3)" }}>
                      <div style={{ fontSize:18, fontWeight:900, color:"#60a5fa", fontFamily:"'Orbitron',monospace" }}>30%</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.6)", marginTop:4 }}>Bet 1K ~ 100K</div>
                    </div>
                    <div style={{ flex:1, background:"rgba(192,132,252,0.1)", borderRadius:8, padding:10, textAlign:"center", border:"1px solid rgba(192,132,252,0.3)" }}>
                      <div style={{ fontSize:18, fontWeight:900, color:"#c084fc", fontFamily:"'Orbitron',monospace" }}>70%</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.6)", marginTop:4 }}>Bet ≥ 100K</div>
                    </div>
                  </div>

                  <div style={{ background:"rgba(0,0,0,0.3)", borderRadius:10, padding:14, border:"1px solid rgba(255,255,255,0.06)", fontSize:12, lineHeight:1.6, color:"rgba(255,255,255,0.8)" }}>
                    <h3 style={{ color:"#fde047", marginBottom:6, fontSize:14, fontFamily:"'Orbitron',monospace" }}>Rules</h3>
                    <ul style={{ paddingLeft:16 }}>
                      <li style={{ marginBottom:4 }}>Accumulate multipliers by successfully cashing out your rocket flights. Total progress is the sum of every claimed multiplier.</li>
                      <li style={{ marginBottom:4 }}>When your total progress hits <b style={{color:"white"}}>80,000x</b>, you automatically claim the jackpot tier corresponding to your average bet size.</li>
                      <li>Leaderboard ranks players based on who is closest to the 80,000x milestone!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Help Modal ── */}
          {showHelp && (
            <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }} onClick={()=>setShowHelp(false)}>
              <div className="cr-fadein" style={{ width:"92%", maxWidth:380, background:"linear-gradient(160deg,#1e0a4e,#0d0430)", borderRadius:18, border:"2px solid rgba(99,102,241,0.4)", boxShadow:"0 0 50px rgba(99,102,241,0.25)", overflow:"hidden" }} onClick={e=>e.stopPropagation()}>
                <div style={{ background:"linear-gradient(90deg,#7c3aed,#4f46e5)", padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontFamily:"'Orbitron',monospace", fontWeight:700, fontSize:14, color:"white" }}>Game Instructions</span>
                  <button onClick={()=>setShowHelp(false)} style={{ background:"rgba(255,255,255,0.18)", border:"1.5px solid rgba(255,255,255,0.3)", borderRadius:8, color:"white", cursor:"pointer", padding:"2px 10px", fontSize:16, fontWeight:700 }}>✕</button>
                </div>
                <div style={{ padding:"20px 20px 10px" }}>
                  <div style={{ fontFamily:"'Orbitron',monospace", color:"#c4b5fd", fontSize:12, textAlign:"center", marginBottom:14, letterSpacing:1 }}>{HELP_PAGES[helpPage-1].title.toUpperCase()}</div>
                  <div key={helpPage} className="cr-fadein">{HELP_PAGES[helpPage-1].content}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:20, padding:"12px 20px 20px" }}>
                  <button className="cr-press" onClick={()=>setHelpPage(p=>Math.max(1,p-1))} disabled={helpPage===1} style={{ background:"rgba(6,182,212,0.12)", border:"none", borderRadius:8, color:helpPage===1?"rgba(255,255,255,0.15)":"#22d3ee", cursor:helpPage===1?"default":"pointer", padding:"5px 16px", fontSize:18 }}>◀</button>
                  <div style={{ display:"flex", gap:6 }}>
                    {[1,2,3,4].map(p=>(
                      <button key={p} onClick={()=>setHelpPage(p)} style={{ width:8, height:8, borderRadius:"50%", background:p===helpPage?"#a855f7":"rgba(255,255,255,0.2)", border:"none", cursor:"pointer", padding:0, transition:"background .2s" }} />
                    ))}
                  </div>
                  <button className="cr-press" onClick={()=>setHelpPage(p=>Math.min(4,p+1))} disabled={helpPage===4} style={{ background:"rgba(6,182,212,0.12)", border:"none", borderRadius:8, color:helpPage===4?"rgba(255,255,255,0.15)":"#22d3ee", cursor:helpPage===4?"default":"pointer", padding:"5px 16px", fontSize:18 }}>▶</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

window.CrashGame = CrashGame;
})();
