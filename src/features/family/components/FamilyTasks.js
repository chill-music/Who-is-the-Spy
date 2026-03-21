/**
 * FamilyTasks.js - Component for family daily and weekly tasks.
 */

var { 
    FAMILY_TASKS_CONFIG, 
    DAILY_TASKS_MILESTONES 
} = window.FamilyConstants;
var FamilyService = window.FamilyService;
var { useState, useEffect } = React;

var FamilyTasks = ({ 
    family, 
    currentUserData, 
    currentUID, 
    lang, 
    onNotification,
    S
}) => {
    if (!family) return null;
    
    var taskProgress = family.taskProgress || {};
    var today = new Date().toDateString();
    var dailyPtsKey = `dailyPts_${today}_${currentUID}`;
    var myDailyPoints = family[dailyPtsKey] || 0;
    var FAMILY_COINS_SYMBOL = '🏅';

    // ── Claim Daily Milestone Chest ──
    var handleClaimDailyChest = async (msIdx, ms) => {
        await window.FamilyService.claimDailyMilestoneChest({
            family,
            currentUID,
            msIdx,
            ms,
            lang,
            onNotification
        });
    };

    // ── Claim Task ──
    var claimTask = async (task) => {
        await window.FamilyService.claimTask({
            family,
            currentUID,
            task,
            lang,
            onNotification
        });
    };

    // ── Daily Check-in ──
    var handleCheckIn = async () => {
        await window.FamilyService.handleCheckIn({
            family,
            currentUID,
            lang,
            onNotification
        });
    };

    var maxPts = DAILY_TASKS_MILESTONES[DAILY_TASKS_MILESTONES.length - 1]?.points || 1600;
    var barWidth = Math.min(100, (myDailyPoints / maxPts) * 100);

    return (
        <div style={{flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:'10px'}}>
            {/* ── HEADER: Family Fund | Family Coins | Shop Coins ── */}
            <div style={{...S.card, background:'linear-gradient(90deg, rgba(16,185,129,0.05), rgba(0,242,255,0.05))', border:'1px solid rgba(255,255,255,0.1)', padding:'12px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div style={{textAlign:'center', flex:1, borderRight:'1px solid rgba(255,255,255,0.05)'}}>
                    <div style={{fontSize:'10px', color:'#6b7280', marginBottom:'2px'}}>🛡️ {lang==='ar'?'صندوق القبيلة':'Family Fund'}</div>
                    <div style={{fontSize:'15px', fontWeight:900, color:'#10b981'}}>{window.fmtFamilyNum(family.treasury||0)}</div>
                </div>
                <div style={{textAlign:'center', flex:1, borderRight:'1px solid rgba(255,255,255,0.05)'}}>
                    <div style={{fontSize:'10px', color:'#6b7280', marginBottom:'2px'}}>🏅 {lang==='ar'?'عملات القبيلة':'Family Coins'}</div>
                    <div style={{fontSize:'15px', fontWeight:900, color:'#fbbf24'}}>{window.fmtFamilyNum(family.familyCoins||0)}</div>
                </div>
                <div style={{textAlign:'center', flex:1}}>
                    <div style={{fontSize:'10px', color:'#6b7280', marginBottom:'2px'}}>🧠 {lang==='ar'?'عملات المتجر':'Shop Coins'}</div>
                    <div style={{fontSize:'15px', fontWeight:900, color:'#00f2ff'}}>{window.fmtFamilyNum(currentUserData?.currency||0)}</div>
                </div>
            </div>

            {/* ── DAILY ACTIVITY BAR & CHESTS ── */}
            <div style={{...S.card, padding:'14px 14px 24px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', position:'relative'}}>
                <div style={{fontSize:'12px', fontWeight:800, color:'#e2e8f0', marginBottom:'16px', display:'flex', justifyContent:'space-between'}}>
                    <span>{lang==='ar'?'النشاط اليومي':'Daily Activity'}</span>
                    <span style={{color:'#f97316'}}>{myDailyPoints} ✨</span>
                </div>
                
                {/* The Bar */}
                <div style={{position:'relative', height:'8px', background:'rgba(255,255,255,0.08)', borderRadius:'4px', margin:'0 10px'}}>
                    <div style={{position:'absolute', top:0, left:lang==='ar'?'auto':0, right:lang==='ar'?0:'auto', height:'100%', width:`${barWidth}%`, background:'linear-gradient(90deg, #f59e0b, #f97316)', borderRadius:'4px', transition:'width 0.4s ease-out'}}/>
                    
                    {/* The Chest Nodes */}
                    {DAILY_TASKS_MILESTONES.map((ms, idx) => {
                        var nodePct = (ms.points / maxPts) * 100;
                        var isReached = myDailyPoints >= ms.points;
                        var claimKey = `dailyChestClaim_${today}_${currentUID}_${idx}`;
                        var isClaimed = family[claimKey] === true;
                        
                        return (
                            <div key={idx} 
                                 onClick={() => (isReached && !isClaimed) && handleClaimDailyChest(idx, ms)}
                                 style={{
                                    position:'absolute', 
                                    top:'50%', 
                                    left:lang==='ar'?'auto':`${nodePct}%`, 
                                    right:lang==='ar'?`${nodePct}%`:'auto', 
                                    transform:'translate(-50%, -50%)', 
                                    cursor: (isReached && !isClaimed) ? 'pointer' : 'default',
                                    display:'flex', flexDirection:'column', alignItems:'center'
                                 }}>
                                <div style={{
                                    width:'28px', height:'28px', borderRadius:'50%', 
                                    background: isClaimed ? '#10b981' : isReached ? '#f97316' : '#374151',
                                    border:'2px solid #0d0d1f', display:'flex', alignItems:'center', justifyContent:'center',
                                    boxShadow: (isReached && !isClaimed) ? '0 0 10px rgba(249,115,22,0.8)' : 'none'
                                }}>
                                    <span style={{fontSize:'14px'}}>{isClaimed ? '✅' : '🎁'}</span>
                                </div>
                                <div style={{position:'absolute', top:'32px', fontSize:'10px', fontWeight:800, color:isReached?'#f97316':'#9ca3af', whiteSpace:'nowrap'}}>
                                    {ms.points}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Info ── */}
            <div style={{fontSize:'10px', color:'#6b7280', textAlign:'center', padding:'4px', background:'rgba(255,255,255,0.03)', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.06)'}}>
                {lang==='ar'
                    ? '📌 المهام والنقاط شخصية — وتتجدد يومياً'
                    : '📌 Tasks and points are personal — reset daily'}
            </div>

            {/* Task List */}
            {FAMILY_TASKS_CONFIG.map(task => {
                var key = `${task.id}_${currentUID}`;
                var prog = taskProgress[key] || { current: 0, claimed: false };

                // Daily task reset logic
                var isDaily = task.daily;
                var effectiveProg = isDaily && prog.lastCheckIn !== today ? { current: 0, claimed: false } : prog;

                var pct = Math.min(100, Math.round((effectiveProg.current / task.target) * 100));
                var isDone = effectiveProg.current >= task.target;
                var isClaimed = effectiveProg.claimed;

                // ft4 special check-in state
                var isFt4 = task.id === 'ft4';
                var alreadyCheckedIn = isFt4 && prog.lastCheckIn === today;

                return (
                    <div key={task.id} style={{...S.card, border:`1px solid ${isClaimed?'rgba(16,185,129,0.25)':isDone?'rgba(0,242,255,0.2)':'rgba(255,255,255,0.07)'}`}}>
                        <div style={{display:'flex', alignItems:'flex-start', gap:'10px'}}>
                            <div style={{width:'42px', height:'42px', borderRadius:'12px', background:isClaimed?'rgba(16,185,129,0.15)':isDone?'rgba(0,242,255,0.12)':'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0, border:`1px solid ${isClaimed?'rgba(16,185,129,0.3)':isDone?'rgba(0,242,255,0.3)':'rgba(255,255,255,0.08)'}`}}>
                                {isClaimed ? '✅' : isDone ? '🎯' : task.icon}
                            </div>
                            <div style={{flex:1, minWidth:0}}>
                                <div style={{display:'flex', alignItems:'center', gap:'5px', marginBottom:'2px'}}>
                                    <div style={{fontSize:'12px', fontWeight:700, color:isClaimed?'#10b981':isDone?'#00f2ff':'#e2e8f0'}}>
                                        {lang==='ar' ? task.title_ar : task.title_en}
                                    </div>
                                    {isDaily && (
                                        <span style={{fontSize:'8px', fontWeight:800, color:'#f97316', background:'rgba(249,115,22,0.15)', border:'1px solid rgba(249,115,22,0.3)', padding:'1px 5px', borderRadius:'6px'}}>
                                            {lang==='ar'?'يومي':'DAILY'}
                                        </span>
                                    )}
                                </div>
                                <div style={{fontSize:'10px', color:'#6b7280', marginBottom:'6px'}}>{lang==='ar' ? task.sub_ar : task.sub_en}</div>
                                {!isClaimed && (
                                    <div>
                                        <div style={{display:'flex', justifyContent:'space-between', fontSize:'9px', color:'#4b5563', marginBottom:'3px'}}>
                                            <span>{effectiveProg.current}/{task.target}</span>
                                            <span>{pct}%</span>
                                        </div>
                                        <div style={{height:'4px', borderRadius:'2px', background:'rgba(255,255,255,0.07)', overflow:'hidden'}}>
                                            <div style={{height:'100%', borderRadius:'2px', width:`${pct}%`, background:isDone?'linear-gradient(90deg,#00f2ff,#7000ff)':'linear-gradient(90deg,#6b7280,#9ca3af)', transition:'width 0.5s'}} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'6px', flexShrink:0}}>
                                <div style={{fontSize:'10px', fontWeight:800, color:'#fbbf24'}}>
                                    +{task.reward.intel||task.reward.amount||0}🧠
                                </div>
                                <div style={{fontSize:'9px', fontWeight:700, color:'#00f2ff'}}>
                                    +{task.reward.xp||0} XP
                                </div>
                                <div style={{fontSize:'9px', fontWeight:700, color:'#a78bfa'}}>
                                    +{task.reward.coins||0} {FAMILY_COINS_SYMBOL}
                                </div>
                                {/* Action Button */}
                                {isFt4 ? (
                                    <button
                                        onClick={alreadyCheckedIn ? () => {} : handleCheckIn}
                                        style={{...S.btn, padding:'5px 10px', fontSize:'10px',
                                            background: isClaimed?'rgba(16,185,129,0.15)':alreadyCheckedIn&&!isClaimed?'linear-gradient(135deg,#00f2ff,#7000ff)':isDone?'linear-gradient(135deg,#00f2ff,#7000ff)':'rgba(249,115,22,0.2)',
                                            color: isClaimed?'#10b981':alreadyCheckedIn||isDone?'white':'#f97316',
                                            cursor: isClaimed?'not-allowed':'pointer',
                                            border: isClaimed?'none':alreadyCheckedIn||isDone?'none':'1px solid rgba(249,115,22,0.4)',
                                        }}>
                                        {isClaimed?(lang==='ar'?'تم':'Done'):alreadyCheckedIn?(lang==='ar'?'اجمع':'Claim'):(lang==='ar'?'تسجيل':'Check-in')}
                                    </button>
                                ) : (
                                    <button
                                        disabled={isClaimed || !isDone}
                                        onClick={() => claimTask(task)}
                                        style={{...S.btn, padding:'5px 12px', fontSize:'11px', background:isClaimed?'rgba(16,185,129,0.15)':isDone?'linear-gradient(135deg,#00f2ff,#7000ff)':'rgba(255,255,255,0.06)', color:isClaimed?'#10b981':isDone?'white':'#4b5563', cursor:isDone&&!isClaimed?'pointer':'not-allowed', border:'none'}}>
                                        {isClaimed ? (lang==='ar'?'تم':'Done') : isDone ? (lang==='ar'?'اجمع':'Claim') : (lang==='ar'?'ابدأ':'Go')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

window.FamilyTasks = FamilyTasks;
