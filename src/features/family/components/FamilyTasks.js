/**
 * FamilyTasks.js — Complete redesign. All 7 tasks functional.
 *
 * Tasks (from FamilyConstants.FAMILY_TASKS_CONFIG):
 *  ft1 – Daily Check-in    (daily, target:1, points:20) — handled by check-in button
 *  ft2 – Daily Like        (daily, target:1, points:10) — "Go" → members tab
 *  ft3 – Donate to Clan    (weekly, target:1, points:20) — auto-tracked by handleDonate
 *  ft4 – Send 3 Gifts      (weekly, target:3, points:20) — "Go" → gifts UI
 *  ft5 – Send 10 Gifts     (weekly, target:10, points:30) — "Go" → gifts UI
 *  ft6 – Play 5 Games      (weekly, target:5, points:20) — "Go" → game lobby
 *  ft7 – Win 3 Games       (weekly, target:3, points:30) — "Go" → game lobby
 *
 * Daily activity bar: 20 / 60 / 100 pts → chest at each milestone.
 */

var { useState, useEffect } = React;

var FamilyTasks = ({
    family,
    currentUserData,
    currentUID,
    lang,
    onNotification,
    S,
    setActiveTab,   // for "Go" actions to switch tab
    onOpenChat,     // optional
}) => {
    var { FAMILY_TASKS_CONFIG = [], DAILY_TASKS_MILESTONES = [] } = window.FamilyConstants || {};
    if (!family) return null;

    var [previewMs, setPreviewMs] = useState(null);

    var isAr = lang === 'ar';
    var today = new Date().toDateString();
    var taskProgress = family.taskProgress || {};
    var dailyPtsKey  = `dailyPts_${today}_${currentUID}`;
    var myDailyPts   = family[dailyPtsKey] || 0;
    var maxPts       = DAILY_TASKS_MILESTONES[DAILY_TASKS_MILESTONES.length - 1]?.points || 100;
    var barPct       = Math.min(100, (myDailyPts / maxPts) * 100);

    // ── Claim Daily Chesem ──────────────────────────
    var handleClaimDailyChest = async (msIdx, ms) => {
        await window.FamilyService.claimDailyMilestoneChest({
            family, currentUID, msIdx, ms, lang, onNotification,
        });
    };

    // ── Claim Task Reward ────────────────────────────
    var claimTask = async (task) => {
        await window.FamilyService.claimTask({
            family, currentUID, task, lang, onNotification,
        });
    };

    // ── Daily Check-in ───────────────────────────────
    var handleCheckIn = async () => {
        await window.FamilyService.handleCheckIn({
            family, currentUID, currentUserData, lang, onNotification,
        });
    };

    // ── Action button handler ────────────────────────
    var handleAction = (action) => {
        if (!action) return;
        if (action === 'like' && setActiveTab)   { setActiveTab('members'); return; }
        if (action === 'donate' && setActiveTab) { setActiveTab('profile'); return; }
        // gifts / games — navigate to home where user can trigger the action
        if (setActiveTab) setActiveTab('profile');
    };

    // ── Helpers ─────────────────────────────────────
    var getTaskState = (task) => {
        var key  = `${task.id}_${currentUID}`;
        var prog = taskProgress[key] || { current: 0, claimed: false };

        // Daily tasks: reset check if last check-in was not today
        if (task.daily) {
            var lastCI = prog.lastCheckIn;
            if (lastCI !== today) {
                prog = { current: 0, claimed: false };
            }
        }

        var pct     = Math.min(100, Math.round((prog.current / task.target) * 100));
        var isDone  = prog.current >= task.target;
        var claimed = prog.claimed;
        return { prog, pct, isDone, claimed };
    };

    // ── Styles ───────────────────────────────────────
    var cardBase = {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        padding: '12px',
        transition: 'border-color 0.3s',
    };

    return (
        <div style={{ flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:'10px' }}>

            {/* ── Balance Header ── */}
            <div style={{ display:'flex', gap:'8px' }}>
                {[
                    { label_ar:'صندوق القبيلة', label_en:'Family Fund',   icon:'🛡️', val: window.fmtFamilyNum(family.treasury||0),       color:'#10b981' },
                    { label_ar:'عملات القبيلة', label_en:'Family Coins',  icon:'🏅', val: window.fmtFamilyNum(family.familyCoins||0),     color:'#fbbf24' },
                    { label_ar:'رصيدك',          label_en:'My Intel',      icon:'🧠', val: window.fmtFamilyNum(currentUserData?.currency||0), color:'#00f2ff' },
                ].map((item, i) => (
                    <div key={i} style={{ flex:1, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'8px 6px', textAlign:'center' }}>
                        <div style={{ fontSize:'9px', color:'#6b7280', marginBottom:'2px' }}>{item.icon} {isAr ? item.label_ar : item.label_en}</div>
                        <div style={{ fontSize:'14px', fontWeight:900, color:item.color }}>{item.val}</div>
                    </div>
                ))}
            </div>

            {/* ── Daily Activity Bar ── */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'14px 14px 28px', position:'relative' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                    <span style={{ fontSize:'12px', fontWeight:800, color:'#e2e8f0' }}>
                        {isAr ? '🌟 النشاط اليومي' : '🌟 Daily Activity'}
                    </span>
                    <span style={{ fontSize:'13px', fontWeight:900, color:'#f97316' }}>
                        {myDailyPts} <span style={{ fontSize:'10px', color:'#6b7280' }}>/ {maxPts} pts</span>
                    </span>
                </div>

                {/* Bar track */}
                <div style={{ position:'relative', height:'8px', background:'rgba(255,255,255,0.08)', borderRadius:'4px', margin:'0 12px' }}>
                    {/* Filled */}
                    <div style={{ position:'absolute', top:0, left:0, height:'100%', width:`${barPct}%`, background:'linear-gradient(90deg,#f59e0b,#f97316)', borderRadius:'4px', transition:'width 0.5s ease-out', boxShadow: barPct > 0 ? '0 0 8px rgba(249,115,22,0.5)' : 'none' }} />

                    {/* Milestone nodes */}
                    {DAILY_TASKS_MILESTONES.map((ms, idx) => {
                        var nodePct   = (ms.points / maxPts) * 100;
                        var isReached = myDailyPts >= ms.points;
                        var claimKey  = `dailyChestClaim_${today}_${currentUID}_${idx}`;
                        var isClaimed = family[claimKey] === true;
                        return (
                            <div key={idx}
                                onClick={() => setPreviewMs({ ms, idx, isReached, isClaimed })}
                                title={`${ms.points} pts`}
                                style={{ position:'absolute', top:'50%', left:`${nodePct}%`, transform:'translate(-50%,-50%)', display:'flex', flexDirection:'column', alignItems:'center', cursor: 'pointer' }}>
                                <div style={{
                                    width:'30px', height:'30px', borderRadius:'50%',
                                    background: isClaimed ? '#10b981' : isReached ? '#f97316' : '#1f2937',
                                    border: `2px solid ${isClaimed ? '#10b981' : isReached ? '#fb923c' : '#374151'}`,
                                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px',
                                    boxShadow: isReached && !isClaimed ? '0 0 14px rgba(249,115,22,0.9)' : 'none',
                                    transition:'all 0.3s',
                                }}>
                                    {isClaimed ? '✅' : '🎁'}
                                </div>
                                <div style={{ position:'absolute', top:'34px', fontSize:'9px', fontWeight:800, color: isReached ? '#f97316' : '#6b7280', whiteSpace:'nowrap' }}>
                                    {ms.points}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ marginTop:'16px', textAlign:'center', fontSize:'9px', color:'#4b5563' }}>
                    {isAr ? '💡 اضغط الصندوق لمعاينة المحتوى والاستلام' : '💡 Tap a chest to preview & claim'}
                </div>
            </div>

            {previewMs && (
                <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }} onClick={() => setPreviewMs(null)}>
                    <div style={{ background:'#111827', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.1)', maxWidth:'340px', width:'100%', padding:'16px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize:'14px', fontWeight:800, color:'#f97316', marginBottom:'8px' }}>🎁 {isAr ? 'محتوى الصندوق' : 'Chest contents'}</div>
                        <div style={{ fontSize:'11px', color:'#9ca3af', marginBottom:'12px' }}>
                            {isAr ? `عند ${previewMs.ms.points} نقطة يومية` : `At ${previewMs.ms.points} daily points`}
                            {previewMs.isClaimed ? (isAr ? ' · تم الاستلام' : ' · Claimed') : !previewMs.isReached ? (isAr ? ' · لم تصل بعد' : ' · Not reached yet') : ''}
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                            {(previewMs.ms.rewards || []).map((r, ri) => (
                                <div key={ri} style={{ fontSize:'12px', color:'#e5e7eb', display:'flex', justifyContent:'space-between' }}>
                                    <span>{r.type === 'currency' ? '🧠 Intel' : r.type === 'coins' ? '🏅 ' + (isAr ? 'عملة قبيلة' : 'Family Coins') : r.type}</span>
                                    <span style={{ color:'#fbbf24', fontWeight:700 }}>+{r.amount}</span>
                                </div>
                            ))}
                        </div>
                        {previewMs.isReached && !previewMs.isClaimed && (
                            <button type="button" onClick={async () => { await handleClaimDailyChest(previewMs.idx, previewMs.ms); setPreviewMs(null); }} style={{ marginTop:'12px', width:'100%', padding:'10px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#00f2ff,#7000ff)', color:'#fff', fontWeight:800, cursor:'pointer' }}>
                                {isAr ? 'استلام' : 'Claim'}
                            </button>
                        )}
                        <button type="button" onClick={() => setPreviewMs(null)} style={{ marginTop:'10px', width:'100%', padding:'10px', borderRadius:'10px', border:'none', background:'rgba(255,255,255,0.08)', color:'#fff', fontWeight:800, cursor:'pointer' }}>{isAr ? 'إغلاق' : 'Close'}</button>
                    </div>
                </div>
            )}

            {/* ── Info strip ── */}
            <div style={{ fontSize:'9px', color:'#6b7280', textAlign:'center', padding:'5px', background:'rgba(255,255,255,0.02)', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.05)' }}>
                {isAr ? '📌 جميع المهام يومية — تتجدد كل يوم في منتصف الليل' : '📌 All tasks are daily — reset every midnight'}
            </div>

            {/* ── SECTION: Daily Tasks ── */}
            <div style={{ fontSize:'10px', fontWeight:800, color:'#f97316', textTransform:'uppercase', letterSpacing:'0.5px', paddingTop:'4px' }}>
                📅 {isAr ? 'مهام اليوم' : 'Today\'s Tasks'}
            </div>

            {FAMILY_TASKS_CONFIG.map(task => {
                var { prog, pct, isDone, claimed } = getTaskState(task);
                var isCheckIn = task.id === 'ft1';
                var checkedInToday = isCheckIn && taskProgress[`ft1_${currentUID}`]?.lastCheckIn === today;

                return (
                    <TaskCard key={task.id}
                        task={task} prog={prog} pct={pct} isDone={isDone} claimed={claimed}
                        isAr={isAr} cardBase={cardBase}
                        onClaim={() => claimTask(task)}
                        onCheckIn={isCheckIn ? handleCheckIn : null}
                        onAction={!isCheckIn ? () => handleAction(task.action) : null}
                        checkedInToday={checkedInToday}
                    />
                );
            })}

            <div style={{ height:'12px' }} />
        </div>
    );
};

// ── Sub-component: Task Card ──────────────────────────────────────────────────
var TaskCard = ({ task, prog, pct, isDone, claimed, isAr, cardBase, onClaim, onCheckIn, onAction, checkedInToday }) => {
    var borderColor = claimed ? 'rgba(16,185,129,0.35)'
                    : isDone  ? 'rgba(0,242,255,0.3)'
                    : 'rgba(255,255,255,0.07)';
    var bgGrad = claimed ? 'linear-gradient(120deg,rgba(16,185,129,0.06),rgba(0,0,0,0))'
               : isDone  ? 'linear-gradient(120deg,rgba(0,242,255,0.06),rgba(0,0,0,0))'
               : 'rgba(255,255,255,0.02)';
    var iconBg = claimed ? 'rgba(16,185,129,0.15)'
               : isDone  ? 'rgba(0,242,255,0.12)'
               : 'rgba(255,255,255,0.05)';

    return (
        <div style={{ ...cardBase, border:`1px solid ${borderColor}`, background:bgGrad }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:'10px' }}>
                {/* Icon */}
                <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:iconBg, border:`1px solid ${borderColor}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>
                    {claimed ? '✅' : isDone ? '🎯' : task.icon}
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'2px', flexWrap:'wrap' }}>
                        <div style={{ fontSize:'12px', fontWeight:800, color: claimed ? '#10b981' : isDone ? '#00f2ff' : '#e2e8f0' }}>
                            {isAr ? task.title_ar : task.title_en}
                        </div>
                        {task.daily && (
                            <span style={{ fontSize:'8px', fontWeight:800, color:'#f97316', background:'rgba(249,115,22,0.15)', border:'1px solid rgba(249,115,22,0.3)', padding:'1px 5px', borderRadius:'6px' }}>
                                {isAr ? 'يومي' : 'DAILY'}
                            </span>
                        )}
                    </div>
                    <div style={{ fontSize:'10px', color:'#6b7280', marginBottom:'6px' }}>
                        {isAr ? task.sub_ar : task.sub_en}
                    </div>

                    {/* Progress bar */}
                    {!claimed && (
                        <div>
                            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'9px', color:'#4b5563', marginBottom:'3px' }}>
                                <span>{prog.current} / {task.target}</span>
                                <span>{pct}%</span>
                            </div>
                            <div style={{ height:'4px', borderRadius:'2px', background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
                                <div style={{ height:'100%', borderRadius:'2px', width:`${pct}%`, background: isDone ? 'linear-gradient(90deg,#00f2ff,#7000ff)' : 'linear-gradient(90deg,#374151,#6b7280)', transition:'width 0.5s' }} />
                            </div>
                        </div>
                    )}
                    {claimed && (
                        <div style={{ fontSize:'10px', color:'#10b981', fontWeight:700 }}>
                            ✅ {isAr ? 'تم الاستلام' : 'Claimed'}
                        </div>
                    )}
                </div>

                {/* Right column: rewards + action */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px', flexShrink:0, minWidth:'64px' }}>
                    <div style={{ fontSize:'10px', fontWeight:800, color:'#fbbf24' }}>+{((task.reward.coins || 0) + (task.reward.intel || 0))} 🏅</div>
                    <div style={{ fontSize:'9px', fontWeight:700, color:'#6b7280' }}>+{task.reward.xp} XP</div>
                    <div style={{ fontSize:'8px', color:'#374151' }}>+{task.points}pt</div>

                    {/* Action buttons */}
                    {onCheckIn ? (
                        /* Check-in task: shows check-in button if not yet done, claim if done */
                        claimed ? (
                            <div style={{ fontSize:'9px', color:'#10b981', fontWeight:700, textAlign:'center' }}>✅</div>
                        ) : checkedInToday ? (
                            <button onClick={onClaim} style={{ padding:'5px 9px', borderRadius:'8px', border:'none', cursor:'pointer', fontSize:'10px', fontWeight:800, background:'linear-gradient(135deg,#00f2ff,#7000ff)', color:'white' }}>
                                {isAr ? 'اجمع' : 'Claim'}
                            </button>
                        ) : (
                            <button onClick={onCheckIn} style={{ padding:'5px 9px', borderRadius:'8px', border:'1px solid rgba(249,115,22,0.4)', cursor:'pointer', fontSize:'10px', fontWeight:800, background:'rgba(249,115,22,0.15)', color:'#f97316' }}>
                                {isAr ? 'تسجيل' : 'Check-in'}
                            </button>
                        )
                    ) : claimed ? (
                        <div style={{ fontSize:'9px', color:'#10b981', fontWeight:700, textAlign:'center' }}>✅</div>
                    ) : isDone ? (
                        <button onClick={onClaim} style={{ padding:'5px 9px', borderRadius:'8px', border:'none', cursor:'pointer', fontSize:'10px', fontWeight:800, background:'linear-gradient(135deg,#00f2ff,#7000ff)', color:'white' }}>
                            {isAr ? 'اجمع' : 'Claim'}
                        </button>
                    ) : (
                        onAction && (
                            <button onClick={onAction} style={{ padding:'5px 9px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.12)', cursor:'pointer', fontSize:'10px', fontWeight:700, background:'rgba(255,255,255,0.05)', color:'#9ca3af' }}>
                                {isAr ? 'ابدأ ←' : 'Go →'}
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

window.FamilyTasks = FamilyTasks;
