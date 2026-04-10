/**
 * @file DefuseMaster.jsx — v3 – All fixes applied
 */
(function (React, ReactDOM) {
  if (!React || !ReactDOM) { console.error("DefuseMaster: React/ReactDOM missing"); return; }

  const { useState, useEffect, useCallback, useRef } = React;

  /* ══════════════════════════ LOCALIZATION ═════════════════════════════ */
  const T = {
    ar: {
      gameTitle:"Defuse Master", juniorRoom:"غرفة المبتدئين · ذهب",
      players:"عدد اللاعبين", stake:"الرهان", startBtn:"🎮 ابدأ اللعبة!",
      inviteBtn:"📤 دعوة صديق", you:"أنت",
      swapTitle:"استبدال الكروت", swapDesc:"اضغط على أي كرت لاستبداله بـ {cost} ذهب",
      swapAllBtn:"🔀 استبدل الكل", availableGold:"💰 {gold} ذهب متاح",
      readyBtn:"✅ جاهز!", swapLog:"بدّلت {n} كرت · خُصم {total}",
      played:"لعبت", drawLog:"سحبت {label}", botDrawLog:"🤖 {name} سحب كرت",
      botDisableLog:"🔑 {name} استخدم Disable!", botExplodeLog:"💥 {name} فجّر!",
      playerExplodeLog:"💥 {name} خرج!", shuffleLog:"🔀 الكروت اتخلطت!",
      botShuffleLog:"🔀 {name} خلط الكروت", skipLog:"⏭️ تخطيت دورك",
      botSkipLog:"⏭️ {name} تخطّى", reverseLog:"🔁 عُكس الاتجاه!",
      botReverseLog:"🔁 {name} عكس الاتجاه", trapLog:"🍳 Trap ×{n} على {name}!",
      demandLog:"🫴 {name} أعطاك {label}!", demandEmpty:"🫴 ليس معهم كروت!",
      exchangeLog:"🔄 بدّلت يدك مع {name}!", bottomLog:"⬇️ من الأسفل: {label}",
      rank:" المركز", winning:" الفائز!", playAgain:"🎮 العب مجدداً", home:"🏠 الرئيسية",
      loseMsg:"خرجت 💥", defusePrompt:"مفيش Disable... خرجت! 💀",
      surrenderBtn:"لا، استسلم 😢", useDisablePrompt:"قنبلة! 💣 تستخدم Disable؟",
      yesDisable:"نعم، فكّكها! 🔑", autoDrawMsg:"⏰ انتهى الوقت — سحب تلقائي!",
      placeBomb:"اختر مكان القنبلة:",
    },
    en: {
      gameTitle:"Defuse Master", juniorRoom:"Junior Room · Gold",
      players:"Players", stake:"Stake", startBtn:"🎮 Start Game!",
      inviteBtn:"📤 Invite Friend", you:"You",
      swapTitle:"Card Exchange", swapDesc:"Tap a card to swap it for {cost} Gold",
      swapAllBtn:"🔀 Swap All", availableGold:"💰 {gold} Gold Available",
      readyBtn:"✅ Ready!", swapLog:"Swapped {n} · Deducted {total}",
      played:"Played", drawLog:"Drew {label}", botDrawLog:"🤖 {name} drew a card",
      botDisableLog:"🔑 {name} used Disable!", botExplodeLog:"💥 {name} exploded!",
      playerExplodeLog:"💥 {name} is out!", shuffleLog:"🔀 Deck shuffled!",
      botShuffleLog:"🔀 {name} shuffled", skipLog:"⏭️ Skipped your turn",
      botSkipLog:"⏭️ {name} skipped", reverseLog:"🔁 Direction reversed!",
      botReverseLog:"🔁 {name} reversed", trapLog:"🍳 Trap ×{n} on {name}!",
      demandLog:"🫴 {name} gave you {label}!", demandEmpty:"🫴 They have no cards!",
      exchangeLog:"🔄 Exchanged hand with {name}!", bottomLog:"⬇️ Drew bottom: {label}",
      rank:" Rank", winning:" Winner!", playAgain:"🎮 Play Again", home:"🏠 Home",
      loseMsg:"You exploded! 💥", defusePrompt:"No Disable... Out! 💀",
      surrenderBtn:"No, I surrender 😢", useDisablePrompt:"Bomb! 💣 Use Disable?",
      yesDisable:"Yes, defuse it! 🔑", autoDrawMsg:"⏰ Time's up — auto draw!",
      placeBomb:"Choose bomb position:",
    }
  };

  /* ═══════════════════════════ CARD DEFINITIONS ════════════════════════ */
  const CD = {
    bomb:    { label:"Bomb",     emoji:"💣", bg:"linear-gradient(135deg,#FF3B30,#C0392B)",
               desc_ar:"تُفجّرك إن لم يكن معك Disable!", desc_en:"Explodes you unless you have Disable!" },
    disable: { label:"Disable",  emoji:"🔑", bg:"linear-gradient(135deg,#30D158,#27AE60)",
               desc_ar:"فكّك القنبلة. لا يُلعب كورقة عادية!", desc_en:"Defuse the bomb. Cannot be played normally!" },
    xray:    { label:"X-Ray",    emoji:"🔮", bg:"linear-gradient(135deg,#BF5AF2,#8E44AD)",
               desc_ar:"شاهد أعلى 3 كروت سراً ثم العب مجدداً", desc_en:"Peek at top 3 cards, then play again" },
    prophecy:{ label:"Prophecy", emoji:"💡", bg:"linear-gradient(135deg,#FFD60A,#F39C12)",
               desc_ar:"اعرف موضع القنبلة ثم العب مجدداً", desc_en:"See bomb position, then play again" },
    shuffle: { label:"Shuffle",  emoji:"🔀", bg:"linear-gradient(135deg,#34C759,#2ECC71)",
               desc_ar:"اخلط جميع الكروت عشوائياً", desc_en:"Shuffle all cards in the deck" },
    bottom:  { label:"Bottom",   emoji:"⬇️", bg:"linear-gradient(135deg,#FFD60A,#E67E22)",
               desc_ar:"اسحب الكرت من الأسفل وينتهي دورك", desc_en:"Draw bottom card, ends your turn" },
    demand:  { label:"Demand",   emoji:"🫴", bg:"linear-gradient(135deg,#0A84FF,#2980B9)",
               desc_ar:"اطلب كرتاً من خصم ثم العب مجدداً", desc_en:"Demand a card from opponent, then play again" },
    exchange:{ label:"Exchange", emoji:"🔄", bg:"linear-gradient(135deg,#FF375F,#C0392B)",
               desc_ar:"بادل يدك كاملاً مع لاعب ثم العب", desc_en:"Exchange full hand with player, then play" },
    skip:    { label:"Skip",     emoji:"⏭️", bg:"linear-gradient(135deg,#64D2FF,#0A84FF)",
               desc_ar:"تخطَّ دورك · يُزيل Trap", desc_en:"Skip your turn · Removes Trap" },
    reverse: { label:"Reverse",  emoji:"🔁", bg:"linear-gradient(135deg,#BF5AF2,#9B59B6)",
               desc_ar:"اعكس الاتجاه · يُزيل Trap", desc_en:"Reverse direction · Removes Trap" },
    trap:    { label:"Trap",     emoji:"🍳", bg:"linear-gradient(135deg,#FF9F0A,#E67E22)",
               desc_ar:"أجبر لاعباً على سحب كروت إضافية! العب على نفسك لتحتفظ بدورك",
               desc_en:"Force player to draw extra cards! Play on self to keep your turn" },
  };

  const GOLD_REWARDS = { 5:[1.5,0.5,0,-0.5,-1], 4:[1.2,0.3,-0.5,-1], 3:[1,0,-1], 2:[1,-1] };
  const BOT_NAMES   = ["Mona 🌸","Kareem ⚡","Sara 🌙","Ahmed 🔥","Layla ✨"];
  const BOT_AVATARS = ["👩‍🦰","👨‍🦱","👩","👨‍🦲","👩‍🦳"];
  const SWAP_COST   = 5;
  const TURN_SECS   = 10;
  const BOMB_SECS   = 7;

  /* ═══════════════════════════════ UTILS ═══════════════════════════════ */
  const uuid = () => Math.random().toString(36).slice(2,10);
  const rnd  = n  => Math.floor(Math.random()*n);

  function shuffle(arr) {
    const a=[...arr];
    for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}
    return a;
  }

  /* Build deck — NO bombs in the deal/swap deck; bombs kept separate */
  function buildDeck(pc) {
    const cards=[];
    const add=(t,n)=>{for(let i=0;i<n;i++)cards.push({id:uuid(),type:t});};
    add("disable",6);add("xray",5);add("prophecy",5);add("shuffle",5);
    add("bottom",5);add("demand",6);add("exchange",5);add("skip",6);
    add("reverse",4);add("trap",6);
    const bombs=Array.from({length:pc-1},()=>({id:uuid(),type:"bomb"}));
    return { nonBombDeck:shuffle(cards), bombs };
  }

  /* Deal hands: 1 disable + 4 random, guaranteed NO bombs */
  function dealHands(nonBombDeck, players) {
    const deck=[...nonBombDeck];
    const hands={};
    players.forEach(p=>{
      const di=deck.findIndex(c=>c.type==="disable");
      const hand=[deck.splice(di!==-1?di:0,1)[0]];
      for(let i=0;i<4&&deck.length;i++) hand.push(deck.shift());
      hands[p.id]=hand;
    });
    return { hands, swapDeck:deck }; // swapDeck has NO bombs
  }

  /* ══════════════════════ LOBBY POSITIONS ═════════════════════════════ */
  function getLobbyPositions(pc) {
    const cx=150,cy=148,rx=118,ry=102,step=360/pc;
    return Array.from({length:pc},(_,i)=>{
      const rad=(-90+i*step)*Math.PI/180;
      return { left:cx+rx*Math.cos(rad), top:cy-ry*Math.sin(rad) };
    });
  }

  /* ═══════════════════════════ CARD UI ════════════════════════════════ */
  function CardUI({ card, lang='ar', w=68, onClick, selected, disabled, faceDown, trapStack=0, dragging=false }) {
    const h = Math.round(w*1.41);
    const font = Math.round(w*0.35);
    const lbl  = Math.round(w*0.155);
    const def  = CD[card?.type]||{};
    const isD  = card?.type==="disable";
    return (
      <div onClick={!disabled?onClick:undefined}
        title={lang==='ar'?def.desc_ar:def.desc_en}
        style={{
          width:w, height:h, borderRadius:Math.round(w*0.18),
          background:faceDown?"linear-gradient(135deg,#2C1654,#1A0A3C)":def.bg,
          border:selected?"3px solid #FFD60A":faceDown?"2px solid #4A2080":isD?"2px solid #30D158":"2px solid rgba(255,255,255,0.2)",
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          cursor:disabled?"default":"pointer",
          boxShadow:selected?"0 0 22px #FFD60A88,0 6px 20px #0008":isD?"0 0 14px rgba(48,209,88,0.45)":"0 6px 20px #0006",
          transform:selected?"translateY(-12px) scale(1.08)":dragging?"translateY(-24px) scale(1.12) rotate(-6deg)":"none",
          transition:"all 0.18s ease",
          flexShrink:0, position:"relative", overflow:"hidden",
          opacity:disabled?0.4:1,
        }}>
        {!faceDown && <>
          <div style={{position:"absolute",inset:0,background:"rgba(255,255,255,0.06)"}}/>
          <div style={{fontSize:font,lineHeight:1}}>{def.emoji}</div>
          <div style={{fontSize:lbl,fontWeight:800,color:"white",textShadow:"0 1px 4px #0008",marginTop:4,fontFamily:"'Baloo 2',cursive",textAlign:"center",padding:"0 2px"}}>{def.label}</div>
          {isD && <div style={{fontSize:Math.max(7,lbl-2),color:"rgba(255,255,255,0.55)",marginTop:1}}>🔒</div>}
          {card?.type==="trap"&&trapStack>1&&<div style={{position:"absolute",top:3,right:3,background:"#FF3B30",borderRadius:7,padding:"1px 4px",fontSize:8,fontWeight:900,color:"white"}}>×{trapStack}</div>}
        </>}
        {faceDown&&<div style={{fontSize:font*0.7,opacity:0.2}}>🂠</div>}
      </div>
    );
  }

  /* ═══════════════════════════ MODAL ══════════════════════════════════ */
  function Modal({ children, onClose, danger }) {
    return (
      <div style={{position:"fixed",inset:0,zIndex:1000,background:danger?"rgba(255,59,48,0.25)":"rgba(0,0,0,0.75)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{background:"linear-gradient(160deg,#2C1654,#1A0A3C)",border:danger?"2px solid #FF3B30":"2px solid rgba(255,255,255,0.15)",borderRadius:24,padding:26,maxWidth:340,width:"100%",boxShadow:danger?"0 0 60px rgba(255,59,48,0.5)":"0 20px 60px #0009",animation:"modalIn 0.3s ease",position:"relative"}}>
          {children}
          {onClose&&<button onClick={onClose} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,0.1)",border:"none",borderRadius:"50%",width:32,height:32,color:"white",cursor:"pointer",fontSize:16}}>✕</button>}
        </div>
      </div>
    );
  }

  /* ════════════════════ PROFESSIONAL 3-ARROW SPINNER ═════════════════ */
  function ArrowSpinner({ direction }) {
    return (
      <div style={{width:62,height:62,animation:"spin 2.8s linear infinite",animationDirection:direction===1?"normal":"reverse",flexShrink:0}}>
        <svg width="62" height="62" viewBox="0 0 62 62" fill="none">
          <circle cx="31" cy="31" r="27" stroke="rgba(255,255,255,0.07)" strokeWidth="2"/>
          {/* 3 arrows at 0°, 120°, 240° */}
          {[0,120,240].map(rot=>(
            <g key={rot} transform={`rotate(${rot} 31 31)`}>
              {/* curved arc segment ~90° */}
              <path d="M31,6 A25,25 0 0,1 53,43.5" stroke="rgba(255,214,10,0.88)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
              {/* arrowhead */}
              <path d="M53,43.5 L47,41 L51.5,35" stroke="rgba(255,214,10,0.95)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </g>
          ))}
        </svg>
      </div>
    );
  }

  /* ════════════════════ SHUFFLE OVERLAY ANIMATION ═════════════════════ */
  function ShuffleOverlay({ visible }) {
    if (!visible) return null;
    const colors=["#BF5AF2","#30D158","#FFD60A","#FF3B30","#0A84FF","#FF9F0A"];
    return (
      <div style={{position:"fixed",inset:0,zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",background:"rgba(0,0,0,0.35)"}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
          <div style={{position:"relative",width:180,height:130}}>
            {colors.map((bg,i)=>(
              <div key={i} style={{
                position:"absolute",left:"50%",top:"50%",
                width:54,height:74,borderRadius:10,
                background:`linear-gradient(135deg,${bg},#1A0A3C)`,
                border:"2px solid rgba(255,255,255,0.25)",
                animation:`cardFly${i} 1.3s cubic-bezier(0.25,0.46,0.45,0.94) both`,
              }}/>
            ))}
          </div>
          <div style={{fontSize:28,fontWeight:900,color:"#FFD60A",textShadow:"0 0 24px rgba(255,214,10,0.8)",fontFamily:"'Baloo 2',cursive",animation:"shuffleText 1.5s ease both",letterSpacing:2}}>
            🔀 SHUFFLE!
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════ LOBBY SCREEN ══════════════════════════════ */
  function LobbyScreen({ lang, t, onStart }) {
    const [botCount,setBotCount]=useState(2);
    const [stake,setStake]=useState(100);
    const pc=botCount+1;
    const positions=getLobbyPositions(pc);
    const players=[
      {id:"you",name:t('you'),avatar:"😎",isYou:true},
      ...Array.from({length:botCount},(_,i)=>({id:`bot${i}`,name:BOT_NAMES[i],avatar:BOT_AVATARS[i],isYou:false})),
    ];

    return (
      <div style={{minHeight:"100vh",fontFamily:"'Baloo 2',cursive",background:"linear-gradient(160deg,#5B2D8E 0%,#3A1A6E 50%,#1A0A3C 100%)",display:"flex",flexDirection:"column",alignItems:"center",padding:"20px 16px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,opacity:0.05,backgroundImage:"radial-gradient(circle,white 1px,transparent 1px)",backgroundSize:"30px 30px"}}/>

        <div style={{zIndex:10,textAlign:"center",marginBottom:8}}>
          <div style={{fontSize:36}}>💣</div>
          <h1 style={{fontSize:28,fontWeight:900,color:"white",margin:0,textShadow:"0 0 30px rgba(255,214,10,0.5)",letterSpacing:1}}>{t('gameTitle')}</h1>
          <p style={{color:"rgba(255,255,255,0.5)",fontSize:13,margin:0}}>{t('juniorRoom')}</p>
        </div>

        {/* VS Arena — fixed 300×300 */}
        <div style={{position:"relative",width:300,height:300,margin:"8px auto",zIndex:10,flexShrink:0}}>
          <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",overflow:"visible",pointerEvents:"none"}}>
            <ellipse cx="150" cy="148" rx="118" ry="102" fill="none" stroke="rgba(255,214,10,0.18)" strokeWidth="2" strokeDasharray="10 6"/>
          </svg>
          <div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:54,height:54,borderRadius:"50%",background:"#1A0A3C",border:"3px solid rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:5}}>
            <span style={{color:"white",fontWeight:900,fontSize:13}}>VS</span>
          </div>
          {players.map((p,i)=>{
            const pos=positions[i];
            return (
              <div key={p.id} style={{position:"absolute",left:pos.left,top:pos.top,width:70,height:70,transform:"translate(-50%,-50%)",animation:`circleIn 0.8s ease ${i*0.12}s both`,zIndex:100}}>
                <div style={{width:"100%",height:"100%",borderRadius:"50%",background:p.isYou?"linear-gradient(135deg,#FFD60A,#FF9F0A)":"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,border:p.isYou?"3px solid rgba(255,255,255,0.4)":"2px solid rgba(255,255,255,0.18)",boxShadow:p.isYou?"0 0 28px rgba(255,214,10,0.5)":"0 4px 12px #0006"}}>
                  {p.avatar}
                </div>
                <div style={{textAlign:"center",marginTop:3,fontSize:11,fontWeight:700,color:p.isYou?"#FFD60A":"rgba(255,255,255,0.75)",position:"absolute",left:"50%",transform:"translateX(-50%)",whiteSpace:"nowrap"}}>
                  {p.isYou?t('you'):p.name.split(" ")[0]}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{zIndex:10,width:"100%",maxWidth:320,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:24,padding:"16px 14px",marginBottom:14}}>
          <p style={{color:"rgba(255,255,255,0.45)",fontSize:11,fontWeight:700,margin:"0 0 8px",textTransform:"uppercase",letterSpacing:1}}>{t('players')} ({pc})</p>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[1,2,3,4].map(bc=>(
              <button key={bc} onClick={()=>setBotCount(bc)} style={{flex:1,padding:"8px 0",borderRadius:12,background:botCount===bc?"linear-gradient(135deg,#BF5AF2,#8E44AD)":"rgba(255,255,255,0.08)",border:"none",color:"white",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'Baloo 2',cursive"}}>
                {bc+1}P
              </button>
            ))}
          </div>
          <p style={{color:"rgba(255,255,255,0.45)",fontSize:11,fontWeight:700,margin:"0 0 8px",textTransform:"uppercase",letterSpacing:1}}>{t('stake')} (Gold)</p>
          <div style={{display:"flex",gap:8}}>
            {[50,100,500,1000].map(s=>(
              <button key={s} onClick={()=>setStake(s)} style={{flex:1,padding:"8px 0",borderRadius:12,background:stake===s?"linear-gradient(135deg,#FFD60A,#FF9F0A)":"rgba(255,255,255,0.08)",border:"none",color:stake===s?"#1A0A3C":"white",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"'Baloo 2',cursive"}}>{s}</button>
            ))}
          </div>
        </div>

        <div style={{zIndex:10,width:"100%",maxWidth:320,display:"flex",flexDirection:"column",gap:10}}>
          <button onClick={()=>onStart({botCount,stake,playerCount:pc})} style={{width:"100%",padding:"16px 0",borderRadius:50,background:"linear-gradient(135deg,#30D158,#27AE60)",border:"none",color:"white",fontSize:18,fontWeight:900,cursor:"pointer",letterSpacing:1,boxShadow:"0 8px 24px rgba(48,209,88,0.4)",fontFamily:"'Baloo 2',cursive"}}>
            🎮 {t('startBtn')}
          </button>
          <button style={{width:"100%",padding:"13px 0",borderRadius:50,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.7)",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'Baloo 2',cursive"}}>
            📤 {t('inviteBtn')}
          </button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════ SWAP PHASE ═════════════════════════════════ */
  function SwapPhase({ lang, t, hands, swapDeck, onComplete, stake }) {
    const [countdown,setCountdown]=useState(15);
    const [yourHand,setYourHand]=useState([...hands["you"]]);
    const [deck,setDeck]=useState([...swapDeck]); // NO bombs guaranteed
    const [gold,setGold]=useState(stake);
    const [swaps,setSwaps]=useState(0);
    const doneRef=useRef(false);

    const finish=useCallback((h,d)=>{ if(doneRef.current)return; doneRef.current=true; onComplete({...hands,you:h},d); },[hands,onComplete]);

    useEffect(()=>{
      if(countdown<=0){finish(yourHand,deck);return;}
      const tmr=setTimeout(()=>setCountdown(c=>c-1),1000);
      return()=>clearTimeout(tmr);
    },[countdown,yourHand,deck,finish]);

    const swapOne=(idx)=>{
      if(gold<SWAP_COST||!deck.length||yourHand[idx]?.type==="disable")return;
      const d=[...deck]; const nc=d.shift();
      const nh=[...yourHand]; d.push(nh[idx]); nh[idx]=nc;
      setYourHand(nh); setDeck(shuffle(d)); setGold(g=>g-SWAP_COST); setSwaps(s=>s+1);
    };

    const swapAll=()=>{
      const cost=4*SWAP_COST; if(gold<cost||deck.length<4)return;
      const d=[...deck]; const dis=yourHand.find(c=>c.type==="disable");
      const olds=yourHand.filter(c=>c.type!=="disable"); const news=d.splice(0,4);
      d.push(...olds); setYourHand(dis?[dis,...news]:news);
      setDeck(shuffle(d)); setGold(g=>g-cost); setSwaps(s=>s+4);
    };

    const pct=(countdown/15)*100; const r=34; const circ=2*Math.PI*r;

    return (
      <div style={{minHeight:"100vh",fontFamily:"'Baloo 2',cursive",background:"linear-gradient(160deg,#5B2D8E 0%,#3A1A6E 50%,#1A0A3C 100%)",display:"flex",flexDirection:"column",alignItems:"center",padding:"28px 20px"}}>
        <div style={{position:"relative",width:80,height:80,marginBottom:14}}>
          <svg width="80" height="80" style={{transform:"rotate(-90deg)"}}>
            <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6"/>
            <circle cx="40" cy="40" r={r} fill="none" stroke={countdown<=5?"#FF3B30":"#FFD60A"} strokeWidth="6" strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} strokeLinecap="round" style={{transition:"stroke-dashoffset 0.9s linear,stroke 0.3s"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:26,fontWeight:900,color:countdown<=5?"#FF3B30":"#FFD60A"}}>{countdown}</span>
          </div>
        </div>

        <h2 style={{color:"white",fontWeight:900,margin:"0 0 4px",fontSize:22}}>{t('swapTitle')}</h2>
        <p style={{color:"rgba(255,255,255,0.5)",fontSize:13,margin:"0 0 6px",textAlign:"center"}}>{t('swapDesc',{cost:SWAP_COST})}</p>
        <p style={{color:"#FFD60A",fontSize:12,fontWeight:700,margin:"0 0 18px"}}>{t('availableGold',{gold})}</p>

        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:10,width:"100%",maxWidth:360,marginBottom:18}}>
          {yourHand.map((c,i)=>(
            <div key={i} style={{animation:`slideUp 0.3s ease ${i*0.08}s both`,position:"relative"}}>
              <CardUI card={c} lang={lang} w={68} onClick={()=>swapOne(i)} disabled={c.type==="disable"}/>
              {c.type==="disable"&&<div style={{position:"absolute",bottom:-15,left:"50%",transform:"translateX(-50%)",fontSize:9,color:"#30D158",fontWeight:800,whiteSpace:"nowrap"}}>🔒 Fixed</div>}
            </div>
          ))}
        </div>

        <button onClick={swapAll} disabled={gold<4*SWAP_COST||deck.length<4} style={{padding:"11px 24px",borderRadius:50,background:gold>=4*SWAP_COST?"linear-gradient(135deg,#BF5AF2,#8E44AD)":"rgba(255,255,255,0.08)",border:"none",color:"white",fontWeight:800,fontSize:13,cursor:gold>=4*SWAP_COST?"pointer":"default",fontFamily:"'Baloo 2',cursive",marginBottom:10,opacity:gold>=4*SWAP_COST?1:0.5}}>
          {t('swapAllBtn')} ({4*SWAP_COST}G)
        </button>
        <button onClick={()=>finish(yourHand,deck)} style={{padding:"14px 44px",borderRadius:50,background:"linear-gradient(135deg,#30D158,#27AE60)",border:"none",color:"white",fontSize:16,fontWeight:900,cursor:"pointer",fontFamily:"'Baloo 2',cursive",boxShadow:"0 8px 24px rgba(48,209,88,0.4)"}}>
          {t('readyBtn')}
        </button>
        {swaps>0&&<p style={{color:"rgba(255,255,255,0.35)",fontSize:12,marginTop:10}}>{t('swapLog',{n:swaps,total:swaps*SWAP_COST})}</p>}
      </div>
    );
  }

  /* ══════════════════════ BOMB PLACEMENT BOXES ════════════════════════ */
  function BombPlacement({ lang, t, deckSize, onConfirm }) {
    const [sel,setSel]=useState(null);
    const internal=Math.min(deckSize,7);
    const positions=[
      {label:lang==='ar'?"⬆️ أعلى":"⬆️ Top",pos:0},
      ...Array.from({length:internal},(_,i)=>({label:`${i+1}`,pos:i+1})),
      {label:lang==='ar'?"⬇️ أسفل":"⬇️ Bot",pos:deckSize},
    ];
    return (
      <div style={{marginBottom:10}}>
        <p style={{color:"rgba(255,255,255,0.6)",fontSize:12,margin:"0 0 10px",textAlign:"center"}}>{t('placeBomb')}</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginBottom:12}}>
          {positions.map(({label,pos})=>(
            <button key={pos} onClick={()=>setSel(pos)} style={{minWidth:44,padding:"7px 9px",borderRadius:10,border:sel===pos?"2px solid #FFD60A":"2px solid rgba(255,255,255,0.15)",background:sel===pos?"rgba(255,214,10,0.2)":"rgba(255,255,255,0.07)",color:sel===pos?"#FFD60A":"rgba(255,255,255,0.75)",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"'Baloo 2',cursive",transition:"all 0.15s"}}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={()=>sel!==null&&onConfirm(sel)} disabled={sel===null} style={{width:"100%",padding:"13px 0",borderRadius:50,background:sel!==null?"linear-gradient(135deg,#30D158,#27AE60)":"rgba(255,255,255,0.1)",border:"none",color:"white",fontWeight:900,fontSize:15,cursor:sel!==null?"pointer":"default",fontFamily:"'Baloo 2',cursive",opacity:sel!==null?1:0.5}}>
          {t('yesDisable')}
        </button>
      </div>
    );
  }

  /* ══════════════════════ BOMB MODAL WITH 7-SEC TIMER ═════════════════ */
  function BombModal({ lang, t, modal, gs, onResponse }) {
    const [timer,setTimer]=useState(BOMB_SECS);
    const firedRef=useRef(false);

    useEffect(()=>{
      if(timer<=0&&!firedRef.current){ firedRef.current=true; onResponse(false); return; }
      const tmr=setTimeout(()=>setTimer(n=>n-1),1000);
      return()=>clearTimeout(tmr);
    },[timer]);

    const fire=(useD,pos)=>{ if(firedRef.current)return; firedRef.current=true; onResponse(useD,pos); };

    const pct=(timer/BOMB_SECS)*100;
    const r=24; const circ=2*Math.PI*r;
    const tc=timer<=2?"#FF3B30":timer<=4?"#FF9F0A":"#FFD60A";

    return (
      <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(200,10,10,0.22)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div style={{background:"linear-gradient(160deg,#2C1654,#1A0A3C)",border:"2px solid #FF3B30",borderRadius:24,padding:22,maxWidth:320,width:"100%",textAlign:"center",boxShadow:"0 0 80px rgba(255,59,48,0.6)",animation:"shake 0.5s ease,pulse 1s 0.5s infinite",position:"relative"}}>

          {/* Countdown ring top-left */}
          <div style={{position:"absolute",top:14,left:14,width:56,height:56}}>
            <svg width="56" height="56" style={{transform:"rotate(-90deg)"}}>
              <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5"/>
              <circle cx="28" cy="28" r={r} fill="none" stroke={tc} strokeWidth="5" strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} strokeLinecap="round" style={{transition:"stroke-dashoffset 0.9s linear,stroke 0.3s"}}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:15,fontWeight:900,color:tc}}>{timer}</span>
              <span style={{fontSize:7,color:"rgba(255,255,255,0.45)"}}>sec</span>
            </div>
          </div>

          {/* Bomb visual */}
          <div style={{position:"relative",display:"inline-block",marginBottom:8,marginTop:4}}>
            <div style={{fontSize:72,lineHeight:1,opacity:0.58,filter:"drop-shadow(0 0 24px rgba(255,59,48,0.9))",animation:"float 0.7s ease-in-out infinite"}}>💣</div>
            <div style={{position:"absolute",inset:0,background:"radial-gradient(circle,rgba(255,59,48,0.28) 0%,transparent 70%)",animation:"pulse 0.8s infinite"}}/>
          </div>

          <h2 style={{color:"#FF3B30",fontSize:26,fontWeight:900,margin:"0 0 4px",textShadow:"0 0 20px rgba(255,59,48,0.8)"}}>BOMB! 💥</h2>
          <p style={{color:"rgba(255,255,255,0.7)",fontSize:13,marginBottom:12}}>
            {lang==='ar'?"سحبت قنبلة!":"You drew a Bomb!"}
          </p>

          {modal.hasDisable ? (
            <>
              <p style={{color:"#30D158",fontWeight:800,marginBottom:12,fontSize:13}}>{t('useDisablePrompt')}</p>
              <BombPlacement lang={lang} t={t} deckSize={gs.deck.length} onConfirm={pos=>fire(true,pos)}/>
              <button onClick={()=>fire(false)} style={{width:"100%",padding:"11px 0",marginTop:8,borderRadius:50,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.55)",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Baloo 2',cursive"}}>
                {t('surrenderBtn')}
              </button>
            </>
          ) : (
            <>
              <p style={{color:"#FF3B30",fontWeight:800,marginBottom:14}}>{t('defusePrompt')}</p>
              <button onClick={()=>fire(false)} style={{width:"100%",padding:"14px 0",borderRadius:50,background:"linear-gradient(135deg,#FF3B30,#C0392B)",border:"none",color:"white",fontWeight:900,fontSize:15,cursor:"pointer",fontFamily:"'Baloo 2',cursive"}}>
                {t('loseMsg')}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ══════════════════════════ GAME SCREEN ═════════════════════════════ */
  function GameScreen({ lang, t, config, onEnd }) {
    const { botCount, stake, playerCount } = config||{botCount:2,stake:100,playerCount:3};

    const makePlayers=()=>{
      const ps=[{id:"you",name:t('you'),avatar:"😎",isBot:false}];
      for(let i=0;i<botCount;i++) ps.push({id:`bot${i}`,name:BOT_NAMES[i],avatar:BOT_AVATARS[i],isBot:true});
      return ps;
    };

    const setupGame=()=>{
      const players=makePlayers().map(p=>({...p,status:"alive",rank:null,trapMultiplier:0}));
      const {nonBombDeck,bombs}=buildDeck(playerCount);
      const {hands,swapDeck}=dealHands(nonBombDeck,players);
      const turnOrder=shuffle(players.map(p=>p.id));
      return {players,hands,swapDeck,bombs,turnOrder,currentTurn:turnOrder[0],direction:1};
    };

    const [phase,setPhase]=useState("swap");
    const [base]=useState(setupGame);
    const [gs,setGs]=useState(null);
    const [selCard,setSelCard]=useState(null);
    const [selFor,setSelFor]=useState(null);
    const [modal,setModal]=useState(null);
    const [lastPlayed,setLastPlayed]=useState(null);
    const [log,setLog]=useState([]);
    const [turnTimer,setTurnTimer]=useState(TURN_SECS);
    const [dragCard,setDragCard]=useState(null);
    const [disableInfo,setDisableInfo]=useState(false);
    const [shuffleAnim,setShuffleAnim]=useState(false);
    const botTimerRef=useRef(null);
    const dragStartY=useRef(null);

    const addLog=msg=>setLog(l=>[msg,...l].slice(0,8));
    const alivePs=g=>g.players.filter(p=>p.status==="alive");
    const curP=g=>g.players.find(p=>p.id===g.currentTurn);
    const isYourTurn=gs?gs.currentTurn==="you":false;
    const yourTrap=gs?(gs.players.find(p=>p.id==="you")?.trapMultiplier||0):0;

    /* ── Clear selection whenever turn changes ──────────────────────── */
    const turnId=gs?.currentTurn;
    useEffect(()=>{ setSelCard(null); setSelFor(null); },[turnId]);

    /* ── Advance Turn ───────────────────────────────────────────────── */
    const advanceTurn=useCallback(g=>{
      const alive=alivePs(g).map(p=>p.id);
      if(alive.length<=1){endGame(g,alive[0]);return g;}
      const order=g.turnOrder.filter(id=>alive.includes(id));
      const idx=order.indexOf(g.currentTurn);
      const dir=g.direction||1;
      const next=order[((idx+dir)%order.length+order.length)%order.length];
      setTurnTimer(TURN_SECS);
      return{...g,currentTurn:next};
    },[]);

    /* ── End Game ───────────────────────────────────────────────────── */
    const endGame=useCallback((g,winnerId)=>{
      const allPs=g.players.map((p,i)=>({...p,rank:p.id===winnerId?1:(p.rank||g.players.length-i)}));
      const rewards=GOLD_REWARDS[playerCount]||GOLD_REWARDS[2];
      const sorted=[...allPs].sort((a,b)=>a.rank-b.rank);
      const goldMap={};
      sorted.forEach((p,i)=>{goldMap[p.id]=(rewards[i]||0)*stake;});
      setTimeout(()=>onEnd({players:allPs,goldMap,winnerId,stake}),600);
    },[playerCount,stake,onEnd]);

    /* ── Eliminate Player ───────────────────────────────────────────── */
    const elimPlayer=useCallback((g,uid,bomb)=>{
      const alive=alivePs(g).filter(p=>p.id!==uid);
      const rank=alive.length+1;
      const newDeck=shuffle([...g.deck,bomb]);
      const newPs=g.players.map(p=>p.id===uid?{...p,status:"eliminated",rank}:p);
      addLog(t('playerExplodeLog',{name:g.players.find(p=>p.id===uid)?.name}));
      const ng={...g,players:newPs,deck:newDeck};
      if(alive.length<=1){endGame(ng,alive[0]?.id);return ng;}
      return advanceTurn({...ng,currentTurn:uid});
    },[advanceTurn,endGame]);

    /* ── Swap Complete — inject bombs NOW ───────────────────────────── */
    const handleSwapComplete=(newHands,newSwapDeck)=>{
      const finalDeck=shuffle([...newSwapDeck,...base.bombs]);
      setGs({...base,hands:newHands,deck:finalDeck});
      setPhase("play");
    };

    /* ── Turn Timer ─────────────────────────────────────────────────── */
    useEffect(()=>{
      if(!gs||!isYourTurn||modal||phase!=="play"){
        if(!isYourTurn) setTurnTimer(TURN_SECS);
        return;
      }
      if(turnTimer<=0){
        addLog(t('autoDrawMsg'));
        setGs(prev=>{
          if(!prev||!prev.deck.length)return advanceTurn(prev);
          const deck=[...prev.deck]; const card=deck.shift();
          if(card.type==="bomb"){
            const hasD=(prev.hands["you"]||[]).some(c=>c.type==="disable");
            setModal({type:"bomb",card,hasDisable:hasD});
            return{...prev,deck};
          }
          addLog(t('drawLog',{label:CD[card.type]?.label}));
          return advanceTurn({...prev,deck,hands:{...prev.hands,you:[...(prev.hands["you"]||[]),card]}});
        });
        setTurnTimer(TURN_SECS);
        return;
      }
      const tmr=setTimeout(()=>setTurnTimer(n=>n-1),1000);
      return()=>clearTimeout(tmr);
    },[isYourTurn,turnTimer,modal,phase,gs?.currentTurn]);

    /* ── Draw Card ──────────────────────────────────────────────────── */
    const drawCard=useCallback((fromBottom=false)=>{
      if(!isYourTurn||modal)return;
      setGs(prev=>{
        if(!prev.deck.length)return advanceTurn(prev);
        const deck=[...prev.deck];
        const card=fromBottom?deck.pop():deck.shift();
        if(card.type==="bomb"){
          const hasD=(prev.hands["you"]||[]).some(c=>c.type==="disable");
          setModal({type:"bomb",card,hasDisable:hasD});
          return{...prev,deck};
        }
        addLog(t('drawLog',{label:CD[card.type]?.label}));
        return advanceTurn({...prev,deck,hands:{...prev.hands,you:[...(prev.hands["you"]||[]),card]}});
      });
      setTurnTimer(TURN_SECS);
    },[isYourTurn,modal,advanceTurn]);

    /* ── Play Card ──────────────────────────────────────────────────── */
    const playCard=useCallback((cardId,targetId)=>{
      if(!isYourTurn||modal)return;
      setGs(prev=>{
        const hand=prev.hands["you"]||[];
        const card=hand.find(c=>c.id===cardId);
        if(!card||card.type==="disable")return prev;
        const newHand=hand.filter(c=>c.id!==cardId);
        let ng={...prev,hands:{...prev.hands,you:newHand}};
        setLastPlayed({card});
        addLog(`${t('played')} ${CD[card.type]?.label}`);

        switch(card.type){
          case"xray":{setModal({type:"xray",cards:ng.deck.slice(0,3)});return ng;}
          case"prophecy":{setModal({type:"prophecy",pos:ng.deck.findIndex(c=>c.type==="bomb")});return ng;}
          case"shuffle":{
            addLog(t('shuffleLog'));
            setShuffleAnim(true); setTimeout(()=>setShuffleAnim(false),1500);
            return advanceTurn({...ng,deck:shuffle(ng.deck)});
          }
          case"bottom":{
            if(!ng.deck.length)return advanceTurn(ng);
            const btm=ng.deck[ng.deck.length-1]; const deck=ng.deck.slice(0,-1);
            if(btm.type==="bomb"){const hasD=newHand.some(c=>c.type==="disable");setModal({type:"bomb",card:btm,hasDisable:hasD});return{...ng,deck};}
            addLog(t('bottomLog',{label:CD[btm.type]?.label}));
            return advanceTurn({...ng,deck,hands:{...ng.hands,you:[...newHand,btm]}});
          }
          case"demand":{
            if(!targetId){setSelFor("demand");setSelCard(cardId);return{...prev};}
            const tH=ng.hands[targetId]||[];
            if(!tH.length){addLog(t('demandEmpty'));return ng;}
            const gi=rnd(tH.length); const given=tH[gi];
            addLog(t('demandLog',{name:ng.players.find(p=>p.id===targetId)?.name,label:CD[given.type]?.label}));
            return{...ng,hands:{...ng.hands,[targetId]:tH.filter((_,i)=>i!==gi),you:[...newHand,given]}};
          }
          case"exchange":{
            if(!targetId){setSelFor("exchange");setSelCard(cardId);return{...prev};}
            const tH=ng.hands[targetId]||[];
            addLog(t('exchangeLog',{name:ng.players.find(p=>p.id===targetId)?.name}));
            return{...ng,hands:{...ng.hands,you:tH,[targetId]:newHand}};
          }
          case"skip":{
            addLog(t('skipLog'));
            return advanceTurn({...ng,players:ng.players.map(p=>p.id==="you"?{...p,trapMultiplier:0}:p)});
          }
          case"reverse":{
            addLog(t('reverseLog'));
            return advanceTurn({...ng,direction:-(ng.direction||1),players:ng.players.map(p=>p.id==="you"?{...p,trapMultiplier:0}:p)});
          }
          case"trap":{
            if(!targetId){setSelFor("trap");setSelCard(cardId);return{...prev};}
            const myTrap=ng.players.find(p=>p.id==="you")?.trapMultiplier||0;
            const stack=myTrap+1;
            addLog(t('trapLog',{name:ng.players.find(p=>p.id===targetId)?.name,n:stack}));
            const ps=ng.players.map(p=>{
              if(p.id===targetId)return{...p,trapMultiplier:(p.trapMultiplier||0)+stack};
              if(p.id==="you")return{...p,trapMultiplier:0};
              return p;
            });
            if(targetId==="you")return{...ng,players:ps}; // self trap: keep turn
            return advanceTurn({...ng,players:ps});
          }
          default: return advanceTurn(ng);
        }
      });
      setSelCard(null); setSelFor(null); setTurnTimer(TURN_SECS);
    },[isYourTurn,modal,advanceTurn]);

    /* ── Bomb Response ──────────────────────────────────────────────── */
    const handleBombResponse=(useDisable,placement)=>{
      const bomb=modal.card; setModal(null);
      setGs(prev=>{
        if(useDisable){
          const hand=prev.hands["you"]||[];
          const di=hand.findIndex(c=>c.type==="disable");
          const newH=hand.filter((_,i)=>i!==di);
          const pos=placement!==undefined?placement:rnd(prev.deck.length+1);
          const deck=[...prev.deck]; deck.splice(pos,0,bomb);
          addLog(lang==='ar'?"🔑 فككت القنبلة!":"🔑 Bomb defused!");
          return advanceTurn({...prev,deck,hands:{...prev.hands,you:newH}});
        }
        return elimPlayer(prev,"you",bomb);
      });
      setTurnTimer(TURN_SECS);
    };

    /* ── Bot Turn ───────────────────────────────────────────────────── */
    useEffect(()=>{
      if(!gs||modal||isYourTurn||phase!=="play")return;
      const botId=gs.currentTurn;
      const bot=gs.players.find(p=>p.id===botId);
      if(!bot||bot.status!=="alive"||!bot.isBot)return;

      botTimerRef.current=setTimeout(()=>{
        setGs(prev=>{
          if(prev.currentTurn!==botId)return prev;
          const hand=prev.hands[botId]||[];
          const trap=prev.players.find(p=>p.id===botId)?.trapMultiplier||0;

          if(trap>0){
            let ng={...prev};
            for(let i=0;i<trap&&ng.deck.length;i++){
              const deck=[...ng.deck]; const card=deck.shift();
              if(card.type==="bomb"){
                const hasD=(ng.hands[botId]||[]).some(c=>c.type==="disable");
                if(hasD){
                  const h=(ng.hands[botId]||[]).filter(c=>c.type!=="disable");
                  const pos=rnd(deck.length+1); deck.splice(pos,0,card);
                  addLog(t('botDisableLog',{name:bot.name}));
                  ng={...ng,deck,hands:{...ng.hands,[botId]:h}};
                } else {
                  addLog(t('botExplodeLog',{name:bot.name}));
                  const newPs=ng.players.map(p=>p.id===botId?{...p,status:"eliminated",rank:alivePs(ng).filter(x=>x.id!==botId).length+1}:p);
                  ng={...ng,deck,players:newPs};
                  const alive=alivePs(ng);
                  if(alive.length<=1){endGame(ng,alive[0]?.id);return ng;}
                  return advanceTurn({...ng,players:newPs});
                }
                break;
              } else {
                ng={...ng,deck,hands:{...ng.hands,[botId]:[...(ng.hands[botId]||[]),card]}};
              }
            }
            return advanceTurn({...ng,players:ng.players.map(p=>p.id===botId?{...p,trapMultiplier:0}:p)});
          }

          const shuffC=hand.find(c=>c.type==="shuffle");
          const trapC=hand.find(c=>c.type==="trap");
          const skipC=hand.find(c=>c.type==="skip");
          const revC=hand.find(c=>c.type==="reverse");

          if(shuffC&&Math.random()<0.25){
            addLog(t('botShuffleLog',{name:bot.name})); setLastPlayed({card:shuffC});
            setShuffleAnim(true); setTimeout(()=>setShuffleAnim(false),1500);
            return advanceTurn({...prev,deck:shuffle(prev.deck),hands:{...prev.hands,[botId]:hand.filter(c=>c.id!==shuffC.id)}});
          }
          if(trapC&&Math.random()<0.22){
            const targets=alivePs(prev).filter(p=>p.id!==botId);
            if(targets.length){
              const tgt=targets[rnd(targets.length)];
              addLog(t('trapLog',{name:tgt.name,n:(tgt.trapMultiplier||0)+1})); setLastPlayed({card:trapC});
              const ps=prev.players.map(p=>p.id===tgt.id?{...p,trapMultiplier:(p.trapMultiplier||0)+1}:p);
              return advanceTurn({...prev,players:ps,hands:{...prev.hands,[botId]:hand.filter(c=>c.id!==trapC.id)}});
            }
          }
          if(skipC&&Math.random()<0.12){addLog(t('botSkipLog',{name:bot.name}));setLastPlayed({card:skipC});return advanceTurn({...prev,hands:{...prev.hands,[botId]:hand.filter(c=>c.id!==skipC.id)}});}
          if(revC&&Math.random()<0.10){addLog(t('botReverseLog',{name:bot.name}));setLastPlayed({card:revC});return advanceTurn({...prev,direction:-(prev.direction||1),hands:{...prev.hands,[botId]:hand.filter(c=>c.id!==revC.id)}});}

          if(!prev.deck.length)return advanceTurn(prev);
          const deck=[...prev.deck]; const card=deck.shift();
          addLog(t('botDrawLog',{name:bot.name}));
          if(card.type==="bomb"){
            const hasD=hand.some(c=>c.type==="disable");
            if(hasD){
              const h=hand.filter(c=>c.type!=="disable");
              const pos=rnd(deck.length+1); deck.splice(pos,0,card);
              addLog(t('botDisableLog',{name:bot.name}));
              return advanceTurn({...prev,deck,hands:{...prev.hands,[botId]:h}});
            }
            addLog(t('botExplodeLog',{name:bot.name}));
            return elimPlayer({...prev,deck},botId,card);
          }
          return advanceTurn({...prev,deck,hands:{...prev.hands,[botId]:[...hand,card]}});
        });
      }, 800+rnd(600));

      return()=>clearTimeout(botTimerRef.current);
    },[gs?.currentTurn,modal,isYourTurn,phase,advanceTurn,elimPlayer,endGame]);

    /* ── Drag handlers ──────────────────────────────────────────────── */
    const onDragStart=(e,card)=>{
      if(!isYourTurn||card.type==="disable")return;
      dragStartY.current=e.touches?e.touches[0].clientY:e.clientY;
      setDragCard(card.id);
    };
    const onDragEnd=(e,card)=>{
      if(!isYourTurn||card.type==="disable"){setDragCard(null);return;}
      const endY=e.changedTouches?e.changedTouches[0].clientY:e.clientY;
      const dy=(dragStartY.current||0)-endY;
      setDragCard(null); dragStartY.current=null;
      if(dy>50){
        if(["trap","demand","exchange"].includes(card.type)){setSelCard(card.id);setSelFor(card.type);}
        else playCard(card.id);
      }
    };

    if(phase==="swap"){
      return <SwapPhase lang={lang} t={t} hands={base.hands} swapDeck={base.swapDeck} onComplete={handleSwapComplete} stake={stake}/>;
    }
    if(!gs)return null;

    const yourHand=gs.hands["you"]||[];
    const currentPl=curP(gs);
    const bombCount=gs.deck.filter(c=>c.type==="bomb").length;
    const bombPct=gs.deck.length>0?Math.round(bombCount/gs.deck.length*100):0;
    const direction=gs.direction||1;
    const R=38,CIRC=2*Math.PI*R;
    const isTrapped=yourTrap>0;
    const trapEscape=new Set(["skip","reverse","trap"]);
    const cardAllowed=c=>!isTrapped||trapEscape.has(c.type);
    const tc=turnTimer<=3?"#FF3B30":turnTimer<=5?"#FF9F0A":"#FFD60A";

    // Auto-compress hand cards when too many
    const hc=Math.max(yourHand.length,1);
    const cardW=hc<=5?68:Math.max(44,Math.floor(68-(hc-5)*5));
    const cardGap=hc<=5?6:Math.max(2,6-(hc-5));

    return (
      <div style={{height:"100vh",fontFamily:"'Baloo 2',cursive",background:"linear-gradient(160deg,#5B2D8E 0%,#3A1A6E 50%,#1A0A3C 100%)",display:"flex",flexDirection:"column",overflow:"hidden",userSelect:"none"}}>

        <ShuffleOverlay visible={shuffleAnim}/>

        {/* TOP BAR */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-around",padding:"8px 6px 4px",flexShrink:0,background:"rgba(0,0,0,0.28)"}}>
          {gs.players.map(p=>(
            <div key={p.id} style={{display:"flex",flexDirection:"column",alignItems:"center",opacity:p.status==="eliminated"?0.3:1,filter:p.status==="eliminated"?"grayscale(1)":"none",transition:"all 0.5s",flex:1}}>
              <div style={{width:42,height:42,borderRadius:"50%",background:p.id==="you"?"linear-gradient(135deg,#FFD60A,#FF9F0A)":"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,border:gs.currentTurn===p.id?"3px solid #FFD60A":"2px solid rgba(255,255,255,0.12)",boxShadow:gs.currentTurn===p.id?"0 0 14px rgba(255,214,10,0.65)":"none",animation:gs.currentTurn===p.id&&p.status==="alive"?"glow 1.5s infinite":"none",position:"relative"}}>
                {p.avatar}
                {p.status==="eliminated"&&<div style={{position:"absolute",inset:0,borderRadius:"50%",background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>💀</div>}
                {p.trapMultiplier>0&&<div style={{position:"absolute",top:-4,right:-4,background:"#FF9F0A",borderRadius:8,padding:"1px 5px",fontSize:9,fontWeight:900,color:"white"}}>×{p.trapMultiplier}</div>}
              </div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.55)",marginTop:2,maxWidth:50,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name.split(" ")[0]}</div>
              <div style={{background:"#BF5AF2",borderRadius:7,padding:"1px 6px",fontSize:10,fontWeight:800,color:"white",marginTop:1}}>{(gs.hands[p.id]||[]).length}</div>
            </div>
          ))}
        </div>

        {/* LOG */}
        {log[0]&&<div style={{textAlign:"center",padding:"3px 12px",color:"rgba(255,255,255,0.65)",fontSize:11,background:"rgba(0,0,0,0.18)",flexShrink:0}}>{log[0]}</div>}

        {/* MIDDLE */}
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"space-around",padding:"0 10px",gap:8}}>

          {/* Draw Pile */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
            <div style={{position:"relative",width:82,height:82}}>
              <svg width="82" height="82" style={{position:"absolute",top:0,left:0,transform:"rotate(-90deg)"}}>
                <circle cx="41" cy="41" r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6"/>
                <circle cx="41" cy="41" r={R} fill="none" stroke={bombPct>40?"#FF3B30":bombPct>20?"#FF9F0A":"#FFD60A"} strokeWidth="6" strokeDasharray={CIRC} strokeDashoffset={CIRC*(1-bombPct/100)} strokeLinecap="round" style={{transition:"stroke-dashoffset 0.5s,stroke 0.3s"}}/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontSize:14,fontWeight:900,color:bombPct>40?"#FF3B30":bombPct>20?"#FF9F0A":"#FFD60A"}}>{bombPct}%</div>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",fontWeight:700}}>💣</div>
              </div>
            </div>
            <div onClick={()=>{if(!isYourTurn||isTrapped)return;drawCard(false);}} style={{position:"relative",cursor:isYourTurn&&!isTrapped?"pointer":"default",animation:"float 3s ease-in-out infinite"}}>
              {[...Array(Math.min(3,gs.deck.length))].map((_,i)=>(
                <div key={i} style={{position:"absolute",top:-(i*3),left:i*2,width:68,height:96,borderRadius:12,background:"linear-gradient(135deg,#2C1654,#1A0A3C)",border:"2px solid rgba(255,255,255,0.08)"}}/>
              ))}
              <div style={{position:"relative",width:68,height:96,borderRadius:12,background:"linear-gradient(135deg,#3D1F73,#2C1654)",border:`2px solid ${isYourTurn&&!isTrapped?"#FFD60A":"rgba(255,255,255,0.18)"}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:isYourTurn&&!isTrapped?"0 0 22px rgba(255,214,10,0.35)":"0 6px 20px #0006"}}>
                <div style={{fontSize:24}}>🂠</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.6)",fontWeight:800}}>{gs.deck.length} left</div>
              </div>
            </div>
            {isTrapped&&<div style={{background:"#FF3B30",borderRadius:12,padding:"3px 8px",color:"white",fontSize:11,fontWeight:800,animation:"pulse 1s infinite"}}>⚠️ ×{yourTrap}</div>}
            {isYourTurn&&!isTrapped&&(
              <div style={{textAlign:"center"}}>
                <div style={{color:"rgba(255,214,10,0.8)",fontSize:10,fontWeight:800}}>{lang==='ar'?'اضغط للسحب':'Tap to Draw'}</div>
                <div style={{color:tc,fontSize:12,fontWeight:900}}>⏱ {turnTimer}s</div>
              </div>
            )}
          </div>

          {/* Center spinner + turn */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            <ArrowSpinner direction={direction}/>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",fontWeight:700,textAlign:"center"}}>{direction===1?"↻":"↺"} {lang==='ar'?'الاتجاه':'Direction'}</div>
            <div style={{background:"rgba(0,0,0,0.4)",borderRadius:16,padding:"6px 12px",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:16}}>{currentPl?.avatar}</span>
              <span style={{color:isYourTurn?"#FFD60A":"white",fontWeight:800,fontSize:12}}>
                {isYourTurn?(lang==='ar'?'دورك!':'Your Turn!'):currentPl?.name?.split(" ")[0]}
              </span>
            </div>
          </div>

          {/* Last Played */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
            {lastPlayed?.card?(
              <div style={{animation:"slideUp 0.3s ease"}}>
                <CardUI card={lastPlayed.card} lang={lang} w={100}/>
              </div>
            ):(
              <div style={{width:100,height:141,borderRadius:12,border:"2px dashed rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:26,opacity:0.15}}>🃏</span>
              </div>
            )}
            <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",textAlign:"center",maxWidth:110}}>
              {lastPlayed?.card?(lang==='ar'?CD[lastPlayed.card.type]?.desc_ar:CD[lastPlayed.card.type]?.desc_en):(lang==='ar'?"آخر كرت":"Last Played")}
            </div>
          </div>
        </div>

        {/* HAND AREA */}
        <div style={{flexShrink:0,background:"rgba(0,0,0,0.22)",borderTop:"1px solid rgba(255,255,255,0.06)"}}>

          <div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 14px 2px"}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#FFD60A,#FF9F0A)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,border:isYourTurn?"2px solid #FFD60A":"2px solid rgba(255,255,255,0.2)"}}>😎</div>
            <div>
              <div style={{color:isYourTurn?"#FFD60A":"rgba(255,255,255,0.8)",fontWeight:800,fontSize:12}}>
                {t('you')} {isYourTurn&&<span style={{color:tc,fontSize:11}}>⏱{turnTimer}s</span>}
              </div>
              <div style={{color:"rgba(255,255,255,0.35)",fontSize:9}}>{lang==='ar'?'↑ اسحب للأعلى للعب':'↑ Drag up to play'}</div>
            </div>
          </div>

          {/* Cards row — auto-compressed */}
          <div style={{overflowX:"auto",display:"flex",gap:cardGap,padding:`5px 14px 7px`,scrollbarWidth:"none",alignItems:"flex-end"}}>
            {yourHand.map(card=>{
              const isDis=card.type==="disable";
              return (
                <div
                  key={card.id}
                  onMouseDown={e=>onDragStart(e,card)}
                  onMouseUp={e=>onDragEnd(e,card)}
                  onTouchStart={e=>onDragStart(e,card)}
                  onTouchEnd={e=>onDragEnd(e,card)}
                  style={{flexShrink:0,touchAction:"pan-x"}}
                >
                  <CardUI
                    card={card} lang={lang} w={cardW}
                    selected={selCard===card.id}
                    disabled={!isYourTurn||(!cardAllowed(card)&&!isDis)}
                    dragging={dragCard===card.id}
                    onClick={()=>{
                      if(!isYourTurn)return;
                      if(isDis){setDisableInfo(true);return;}
                      if(!cardAllowed(card))return;
                      if(["trap","demand","exchange"].includes(card.type)){setSelCard(card.id);setSelFor(card.type);}
                      else if(selCard===card.id){playCard(card.id);}
                      else{setSelCard(card.id);setSelFor(null);}
                    }}
                  />
                </div>
              );
            })}
            {yourHand.length===0&&<div style={{color:"rgba(255,255,255,0.3)",fontSize:13,padding:"26px 20px"}}>{lang==='ar'?"لا توجد كروت":"No cards"}</div>}
          </div>

          {/* Action bar — Play only shown when it's your turn */}
          <div style={{display:"flex",gap:8,padding:"0 14px 8px",alignItems:"center",overflowX:"auto",scrollbarWidth:"none"}}>
            {selCard&&!selFor&&isYourTurn&&(
              <button onClick={()=>playCard(selCard)} style={{padding:"10px 20px",borderRadius:50,background:"linear-gradient(135deg,#30D158,#27AE60)",border:"none",color:"white",fontWeight:800,fontSize:14,cursor:"pointer",flexShrink:0,fontFamily:"'Baloo 2',cursive",boxShadow:"0 4px 12px rgba(48,209,88,0.4)"}}>
                {lang==='ar'?"▶ العب":"▶ Play"}
              </button>
            )}
            {selFor&&isYourTurn&&<div style={{color:"#FFD60A",fontWeight:800,fontSize:12,padding:"8px",flexShrink:0,background:"rgba(255,214,10,0.12)",borderRadius:12}}>{lang==='ar'?"← اختر الهدف":"Select Target →"}</div>}
            {selCard&&<button onClick={()=>{setSelCard(null);setSelFor(null);}} style={{padding:"10px 14px",borderRadius:50,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"white",fontWeight:700,fontSize:12,cursor:"pointer",flexShrink:0,fontFamily:"'Baloo 2',cursive"}}>{lang==='ar'?"إلغاء":"Cancel"}</button>}
            {isYourTurn&&isTrapped&&!selFor&&<button onClick={()=>drawCard(false)} style={{padding:"10px 20px",borderRadius:50,background:"linear-gradient(135deg,#FF3B30,#C0392B)",border:"none",color:"white",fontWeight:800,fontSize:13,cursor:"pointer",flexShrink:0,fontFamily:"'Baloo 2',cursive",animation:"pulse 1s infinite"}}>💥 {lang==='ar'?`اسحب ×${yourTrap}`:`Draw ×${yourTrap}`}</button>}
          </div>

          {/* Target selection */}
          {selFor&&isYourTurn&&(
            <div style={{display:"flex",gap:8,padding:"0 14px 8px",overflowX:"auto",scrollbarWidth:"none"}}>
              {alivePs(gs).filter(p=>p.id!=="you").map(p=>(
                <button key={p.id} onClick={()=>playCard(selCard,p.id)} style={{padding:"8px 14px",borderRadius:50,flexShrink:0,background:"linear-gradient(135deg,#FF9F0A,#E67E22)",border:"none",color:"white",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"'Baloo 2',cursive",display:"flex",alignItems:"center",gap:6}}>
                  <span>{p.avatar}</span>{p.name.split(" ")[0]}
                </button>
              ))}
              {selFor==="trap"&&<button onClick={()=>playCard(selCard,"you")} style={{padding:"8px 14px",borderRadius:50,flexShrink:0,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"white",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"'Baloo 2',cursive",display:"flex",alignItems:"center",gap:6}}><span>😎</span>{t('you')}</button>}
            </div>
          )}
        </div>

        {/* BOMB MODAL */}
        {modal?.type==="bomb"&&<BombModal lang={lang} t={t} modal={modal} gs={gs} onResponse={handleBombResponse}/>}

        {/* DISABLE INFO */}
        {disableInfo&&(
          <Modal onClose={()=>setDisableInfo(false)}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:48,marginBottom:8}}>🔑</div>
              <h3 style={{color:"#30D158",fontWeight:900,marginBottom:10}}>Disable</h3>
              <div style={{background:"rgba(48,209,88,0.1)",border:"1px solid rgba(48,209,88,0.3)",borderRadius:14,padding:14,marginBottom:12}}>
                <p style={{color:"rgba(255,255,255,0.85)",fontSize:14,margin:0,lineHeight:1.6}}>
                  {lang==='ar'
                    ?"🔒 هذا الكرت مخصص فقط لتفكيك القنابل!\n\nعندما تسحب قنبلة يمكنك استخدامه لتفكيكها واختيار مكان إعادتها في الكوتشة."
                    :"🔒 This card is ONLY for defusing bombs!\n\nWhen you draw a bomb you can use it to defuse and choose where to place it back."}
                </p>
              </div>
              <p style={{color:"rgba(255,255,255,0.4)",fontSize:12}}>{lang==='ar'?"لا يمكن لعبه بشكل عادي.":"Cannot be played as a normal card."}</p>
            </div>
          </Modal>
        )}

        {/* XRAY */}
        {modal?.type==="xray"&&(
          <Modal onClose={()=>setModal(null)}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:32,marginBottom:8}}>🔮</div>
              <h3 style={{color:"white",fontWeight:900,marginBottom:4}}>X-Ray</h3>
              <p style={{color:"rgba(255,255,255,0.5)",fontSize:12,marginBottom:16}}>{lang==='ar'?"أعلى 3 كروت · أنت فقط تراها":"Top 3 cards · Only you see them"}</p>
              <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:18}}>
                {modal.cards.length?modal.cards.map((c,i)=>(
                  <div key={i} style={{animation:`slideUp 0.3s ease ${i*0.1}s both`}}><CardUI card={c} lang={lang} w={68}/></div>
                )):<p style={{color:"rgba(255,255,255,0.4)"}}>{lang==='ar'?"الكوتشة فارغة!":"Deck is empty!"}</p>}
              </div>
              <button onClick={()=>setModal(null)} style={{width:"100%",padding:"12px 0",borderRadius:50,background:"linear-gradient(135deg,#BF5AF2,#8E44AD)",border:"none",color:"white",fontWeight:800,cursor:"pointer",fontFamily:"'Baloo 2',cursive"}}>{lang==='ar'?"سألعب مجدداً!":"Okay, play again!"}</button>
            </div>
          </Modal>
        )}

        {/* PROPHECY */}
        {modal?.type==="prophecy"&&(
          <Modal onClose={()=>setModal(null)}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:32,marginBottom:8}}>💡</div>
              <h3 style={{color:"white",fontWeight:900,marginBottom:14}}>Prophecy</h3>
              {modal.pos===-1||modal.pos===undefined?(
                <p style={{color:"#30D158",fontWeight:800,fontSize:16}}>🎉 {lang==='ar'?"لا قنابل في الكوتشة!":"No bombs in deck!"}</p>
              ):(
                <div style={{background:"rgba(255,214,10,0.1)",border:"1px solid rgba(255,214,10,0.3)",borderRadius:16,padding:16,marginBottom:14}}>
                  <p style={{color:"rgba(255,255,255,0.6)",fontSize:13,margin:0}}>{lang==='ar'?"القنبلة في الموضع":"Bomb at position"}</p>
                  <p style={{color:"#FFD60A",fontWeight:900,fontSize:38,margin:"4px 0"}}>#{modal.pos+1}</p>
                  <p style={{color:"rgba(255,255,255,0.4)",fontSize:12,margin:0}}>{lang==='ar'?`من أعلى (${gs.deck.length} كرت)`:`From top (${gs.deck.length} cards)`}</p>
                </div>
              )}
              <button onClick={()=>setModal(null)} style={{width:"100%",padding:"12px 0",borderRadius:50,background:"linear-gradient(135deg,#FFD60A,#F39C12)",border:"none",color:"#1A0A3C",fontWeight:900,cursor:"pointer",fontFamily:"'Baloo 2',cursive",marginTop:8}}>{lang==='ar'?"سألعب مجدداً!":"Okay, play again!"}</button>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  /* ══════════════════════════ RESULTS SCREEN ══════════════════════════ */
  function ResultsScreen({ lang, t, result, onPlayAgain, onHome }) {
    const {players,goldMap,winnerId,stake}=result;
    const sorted=[...players].sort((a,b)=>(a.rank||99)-(b.rank||99));
    const winner=players.find(p=>p.id===winnerId);
    const medals=["🥇","🥈","🥉","4️⃣","5️⃣"];
    return (
      <div style={{minHeight:"100vh",fontFamily:"'Baloo 2',cursive",background:"linear-gradient(160deg,#5B2D8E 0%,#3A1A6E 50%,#1A0A3C 100%)",display:"flex",flexDirection:"column",alignItems:"center",padding:"30px 20px",position:"relative",overflow:"hidden"}}>
        {[...Array(20)].map((_,i)=>(<div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:-20,fontSize:20,animation:`confetti ${2+Math.random()*3}s ease ${Math.random()*2}s both`,opacity:0}}>{["🎉","⭐","💥","🎊","✨"][i%5]}</div>))}
        <div style={{zIndex:10,textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:64}}>🏆</div>
          <h1 style={{color:"#FFD60A",fontSize:26,fontWeight:900,margin:"8px 0 4px",textShadow:"0 0 30px rgba(255,214,10,0.6)"}}>{winner?.id==="you"?t('winning'):`${winner?.name} ${t('winning')}`}</h1>
          <p style={{color:"rgba(255,255,255,0.5)",fontSize:13,margin:0}}>{t('stake')}: {stake} Gold</p>
        </div>
        <div style={{width:"100%",maxWidth:340,zIndex:10,background:"rgba(255,255,255,0.06)",borderRadius:20,border:"1px solid rgba(255,255,255,0.1)",overflow:"hidden",marginBottom:24}}>
          <div style={{display:"grid",gridTemplateColumns:"40px 1fr 80px",background:"rgba(0,0,0,0.2)",padding:"10px 16px",color:"rgba(255,255,255,0.4)",fontSize:11,fontWeight:800}}>
            <span>#</span><span>{lang==='ar'?"اسم":"Name"}</span><span style={{textAlign:"right"}}>Gold</span>
          </div>
          {sorted.map((p,i)=>{
            const gold=goldMap[p.id]||0;
            return (
              <div key={p.id} style={{display:"grid",gridTemplateColumns:"40px 1fr 80px",padding:"12px 16px",alignItems:"center",background:p.id==="you"?"rgba(255,214,10,0.08)":"transparent",borderTop:"1px solid rgba(255,255,255,0.06)",animation:`slideUp 0.4s ease ${i*0.1}s both`}}>
                <span style={{fontSize:20}}>{medals[i]||"👤"}</span>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:22}}>{p.avatar}</span>
                  <div>
                    <div style={{color:"white",fontWeight:800,fontSize:14}}>{p.name}</div>
                    {p.id==="you"&&<div style={{color:"#FFD60A",fontSize:10,fontWeight:700}}>{t('you')}</div>}
                  </div>
                </div>
                <div style={{textAlign:"right",fontWeight:900,fontSize:16,color:gold>0?"#30D158":gold<0?"#FF3B30":"rgba(255,255,255,0.4)"}}>{gold>0?"+":""}{gold}</div>
              </div>
            );
          })}
        </div>
        <div style={{zIndex:10,width:"100%",maxWidth:340,display:"flex",flexDirection:"column",gap:10}}>
          <button onClick={onPlayAgain} style={{width:"100%",padding:"16px 0",borderRadius:50,background:"linear-gradient(135deg,#30D158,#27AE60)",border:"none",color:"white",fontSize:18,fontWeight:900,cursor:"pointer",fontFamily:"'Baloo 2',cursive",boxShadow:"0 8px 24px rgba(48,209,88,0.4)"}}>{t('playAgain')}</button>
          <button onClick={onHome} style={{width:"100%",padding:"13px 0",borderRadius:50,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.7)",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'Baloo 2',cursive"}}>{t('home')}</button>
        </div>
      </div>
    );
  }

  /* ════════════════════════════ MAIN APP ══════════════════════════════ */
  function DefuseMasterApp() {
    const [lang,setLang]=useState('ar');
    const [screen,setScreen]=useState("lobby");
    const [config,setConfig]=useState(null);
    const [result,setResult]=useState(null);

    const t=useCallback((key,params={})=>{
      let text=(T[lang][key]||key);
      Object.keys(params).forEach(p=>{text=text.replace(`{${p}}`,params[p]);});
      return text;
    },[lang]);

    return (
      <div style={{maxWidth:430,margin:"0 auto",position:"relative",direction:lang==='ar'?'rtl':'ltr',fontFamily:"'Baloo 2',cursive"}}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800;900&display=swap');
          @keyframes circleIn  { from{opacity:0;transform:translate(-50%,-50%) scale(0.4)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
          @keyframes modalIn   { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
          @keyframes shake     { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
          @keyframes pulse     { 0%,100%{box-shadow:0 0 18px rgba(255,59,48,0.4)} 50%{box-shadow:0 0 55px rgba(255,59,48,0.9)} }
          @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
          @keyframes glow      { 0%,100%{box-shadow:0 0 10px rgba(255,214,10,0.3)} 50%{box-shadow:0 0 28px rgba(255,214,10,0.8)} }
          @keyframes slideUp   { from{transform:translateY(28px);opacity:0} to{transform:translateY(0);opacity:1} }
          @keyframes spin      { to{transform:rotate(360deg)} }
          @keyframes confetti  { 0%{transform:translateY(-10px) rotate(0);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
          @keyframes shuffleAnim { 0%{opacity:0;transform:scale(0.4)} 25%{opacity:1;transform:scale(1.08)} 75%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(1.15)} }
          @keyframes shuffleText { 0%{opacity:0;transform:translateY(16px) scale(0.8)} 30%{opacity:1;transform:translateY(0) scale(1)} 75%{opacity:1} 100%{opacity:0} }
          @keyframes cardFly0  { 0%{transform:translate(-50%,-50%) scale(0) rotate(0)} 60%{transform:translate(-160%,-160%) rotate(-40deg) scale(1)} 100%{transform:translate(-170%,-170%) rotate(-50deg) scale(0.7);opacity:0} }
          @keyframes cardFly1  { 0%{transform:translate(-50%,-50%) scale(0)} 60%{transform:translate(60%,-160%) rotate(20deg) scale(1)} 100%{transform:translate(70%,-175%) rotate(30deg) scale(0.7);opacity:0} }
          @keyframes cardFly2  { 0%{transform:translate(-50%,-50%) scale(0)} 60%{transform:translate(120%,-60%) rotate(50deg) scale(1)} 100%{transform:translate(135%,-70%) rotate(65deg) scale(0.7);opacity:0} }
          @keyframes cardFly3  { 0%{transform:translate(-50%,-50%) scale(0)} 60%{transform:translate(80%,70%) rotate(-25deg) scale(1)} 100%{transform:translate(95%,85%) rotate(-35deg) scale(0.7);opacity:0} }
          @keyframes cardFly4  { 0%{transform:translate(-50%,-50%) scale(0)} 60%{transform:translate(-40%,90%) rotate(12deg) scale(1)} 100%{transform:translate(-55%,105%) rotate(20deg) scale(0.7);opacity:0} }
          @keyframes cardFly5  { 0%{transform:translate(-50%,-50%) scale(0)} 60%{transform:translate(-150%,30%) rotate(-40deg) scale(1)} 100%{transform:translate(-165%,45%) rotate(-55deg) scale(0.7);opacity:0} }
          * { -webkit-tap-highlight-color:transparent; box-sizing:border-box; }
          ::-webkit-scrollbar { display:none; }
        `}</style>

        <button onClick={()=>setLang(l=>l==='ar'?'en':'ar')} style={{position:"fixed",bottom:20,right:20,zIndex:9999,background:"rgba(0,0,0,0.65)",color:"white",border:"1px solid rgba(255,255,255,0.3)",borderRadius:12,padding:"8px 12px",fontSize:13,fontWeight:800,cursor:"pointer",backdropFilter:"blur(5px)"}}>
          {lang==='ar'?'EN':'AR'}
        </button>

        {screen==="lobby"&&<LobbyScreen lang={lang} t={t} onStart={cfg=>{setConfig(cfg);setScreen("game");}}/>}
        {screen==="game"&&config&&<GameScreen lang={lang} t={t} config={config} onEnd={res=>{setResult(res);setScreen("results");}}/>}
        {screen==="results"&&result&&<ResultsScreen lang={lang} t={t} result={result} onPlayAgain={()=>{setResult(null);setScreen("game");}} onHome={()=>{setResult(null);setConfig(null);setScreen("lobby");}}/>}
      </div>
    );
  }

  window.DefuseMasterApp = DefuseMasterApp;
})(window.React, window.ReactDOM);
