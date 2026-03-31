(function () {
  var { useState, useEffect } = React;

  var DailyTasksComponent = ({ userData, user, lang, onClaim, onNotification }) => {
    var [tick, setTick] = useState(0);
    useEffect(() => {
      var t = setInterval(() => setTick((p) => p + 1), 30000);
      return () => clearInterval(t);
    }, []);

    var userTasks = userData?.dailyTasks || {};
    var sessionStart = userTasks.sessionStartTime?.toDate?.() || new Date();
    var minutesOnline = Math.floor((Date.now() - sessionStart.getTime()) / 60000);

    var claimedCount = DAILY_TASKS_CONFIG.filter((box) => userTasks.boxes?.[box.id - 1]?.status === 'claimed').length;
    var availableCount = DAILY_TASKS_CONFIG.filter((box) => {
      if (userTasks.boxes?.[box.id - 1]?.status === 'claimed') return false;
      if (box.comingSoon) {
        if (!window.hasVIPDailyTasks(userData)) return false;
        if (!box.duration) return true;
        return minutesOnline >= Math.ceil(box.duration / 60000);
      }
      if (!box.duration) return false;
      return minutesOnline >= Math.ceil(box.duration / 60000);
    }).length;

    var getTaskStatus = (box) => {
      var claimed = userTasks.boxes?.[box.id - 1]?.status === 'claimed';
      if (claimed) return 'claimed';
      if (box.comingSoon) {
        if (!window.hasVIPDailyTasks(userData)) return 'vip_locked';
        if (!box.duration) return 'available';
        if (minutesOnline >= Math.ceil(box.duration / 60000)) return 'available';
        return 'locked';
      }
      if (!box.duration) return 'locked';
      if (minutesOnline >= Math.ceil(box.duration / 60000)) return 'available';
      return 'locked';
    };

    var handleClaimTask = async (box) => {
      var status = getTaskStatus(box);
      if (status === 'claimed') {onNotification(lang === 'ar' ? '✅ استلمت بالفعل' : '✅ Already claimed');return;}
      if (status === 'vip_locked') {onNotification(lang === 'ar' ? '👑 حصري لـ VIP' : '👑 VIP Exclusive');return;}
      if (status === 'locked') {
        var requiredMin = Math.ceil(box.duration / 60000);
        var remaining = requiredMin - minutesOnline;
        onNotification(lang === 'ar' ? `⏳ بعد ${remaining} دقيقة` : `⏳ In ${remaining} min`);
        return;
      }
      try {
        var updates = {};
        updates[`dailyTasks.boxes.${box.id - 1}.status`] = 'claimed';
        updates[`dailyTasks.boxes.${box.id - 1}.claimedAt`] = window.TS();
        
        // 🛡️ SECURITY: Use centralized service for Daily Task rewards
        if (box.reward.type === 'currency') {
            if (window.SecurityService) {
                await window.SecurityService.applyCurrencyTransaction(user.uid, box.reward.amount, `Daily Task ID: ${box.id}`, { box: box });
            } else {
                await usersCollection.doc(user.uid).update({ currency: firebase.firestore.FieldValue.increment(box.reward.amount) });
            }
        }
        
        await usersCollection.doc(user.uid).update(updates);
        onNotification(`✅ +${box.reward.amount} 🧠`);
      } catch (err) {onNotification(lang === 'ar' ? '❌ خطأ' : '❌ Error');}
    };

    return (/*#__PURE__*/
      React.createElement("div", { style: { padding: '0' } }, /*#__PURE__*/

      React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, /*#__PURE__*/
      React.createElement("div", { style: { width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg,rgba(0,242,255,0.2),rgba(112,0,255,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' } }, "\uD83D\uDCE6"), /*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '13px', fontWeight: 800, color: '#e2e8f0' } }, lang === 'ar' ? 'مهام اليوم' : 'Daily Tasks'), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '10px', color: '#64748b', marginTop: '1px' } },
      lang === 'ar' ? `${minutesOnline} دقيقة أون لاين` : `${minutesOnline} min online`
      )
      )
      ), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
      availableCount > 0 && /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '9px', fontWeight: 800, background: 'rgba(0,242,255,0.15)', border: '1px solid rgba(0,242,255,0.35)', color: '#00f2ff', borderRadius: '20px', padding: '2px 8px' } },
      availableCount, " ", lang === 'ar' ? 'متاح' : 'ready'
      ), /*#__PURE__*/

      React.createElement("div", { style: { fontSize: '10px', color: '#6b7280' } }, claimedCount, "/", DAILY_TASKS_CONFIG.length)
      )
      ), /*#__PURE__*/


      React.createElement("div", { style: { height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', marginBottom: '14px', overflow: 'hidden' } }, /*#__PURE__*/
      React.createElement("div", { style: { height: '100%', width: `${claimedCount / DAILY_TASKS_CONFIG.length * 100}%`, background: 'linear-gradient(90deg,#00f2ff,#7000ff)', transition: 'width 0.6s ease' } })
      ), /*#__PURE__*/


      React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' } },
      DAILY_TASKS_CONFIG.map((box) => {
        var status = getTaskStatus(box);
        var isAvailable = status === 'available';
        var isClaimed = status === 'claimed';
        var isVipLocked = status === 'vip_locked';
        var isLocked = status === 'locked';
        var isVip = box.comingSoon;
        var reqMin = box.duration ? Math.ceil(box.duration / 60000) : null;
        var progress = isLocked && reqMin ? Math.min(100, Math.floor(minutesOnline / reqMin * 100)) : 0;
        var timeLabel = reqMin ? reqMin >= 60 ? `${reqMin / 60}h` : `${reqMin}m` : '';

        return (/*#__PURE__*/
          React.createElement("button", {
            key: box.id,
            onClick: () => handleClaimTask(box),
            style: {
              position: 'relative', padding: '10px 4px 8px', borderRadius: '12px',
              border: isClaimed ? '1.5px solid rgba(74,222,128,0.45)' :
              isAvailable ? '1.5px solid rgba(0,242,255,0.7)' :
              isVipLocked ? '1.5px solid rgba(239,68,68,0.35)' :
              '1.5px solid rgba(255,255,255,0.07)',
              background: isClaimed ? 'linear-gradient(160deg,rgba(74,222,128,0.12),rgba(16,185,129,0.06))' :
              isAvailable ? 'linear-gradient(160deg,rgba(0,242,255,0.14),rgba(112,0,255,0.09))' :
              isVipLocked ? 'rgba(239,68,68,0.05)' :
              'rgba(255,255,255,0.03)',
              cursor: isAvailable ? 'pointer' : 'default',
              textAlign: 'center', overflow: 'hidden', transition: 'all 0.2s',
              boxShadow: isAvailable ? '0 0 14px rgba(0,242,255,0.2)' :
              isClaimed ? '0 0 8px rgba(74,222,128,0.1)' : 'none'
            } }, /*#__PURE__*/


          React.createElement("div", { style: { fontSize: '22px', lineHeight: 1, marginBottom: '5px' } },
          isClaimed ? '📭' : isAvailable ? '📬' : isVipLocked ? '🔒' : '📪'
          ), /*#__PURE__*/


          React.createElement("div", { style: {
              fontSize: '9px', fontWeight: 900, marginBottom: '2px',
              color: isClaimed ? '#4ade80' : isAvailable ? '#00f2ff' : isVipLocked ? '#f87171' : '#4b5563'
            } },
          isClaimed ? '✓' : isVipLocked ? 'VIP' : `+${box.reward.amount}`
          ), /*#__PURE__*/


          React.createElement("div", { style: { fontSize: '8px', color: isClaimed ? '#4ade8099' : isAvailable ? '#00f2ff88' : '#374151' } },
          isClaimed ? box.reward.icon : isVipLocked ? '👑' : timeLabel || box.reward.icon
          ),


          isAvailable && /*#__PURE__*/
          React.createElement("div", { style: {
              position: 'absolute', top: '5px', right: '5px',
              width: '9px', height: '9px', borderRadius: '50%',
              background: '#00f2ff',
              boxShadow: '0 0 6px #00f2ff',
              animation: 'dtPulse 1.4s ease-in-out infinite'
            } }),



          isLocked && !isVip && progress > 0 && /*#__PURE__*/
          React.createElement("div", { style: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.06)' } }, /*#__PURE__*/
          React.createElement("div", { style: { height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#7000ff,#00f2ff)', transition: 'width 0.5s' } })
          )

          ));

      })
      ), /*#__PURE__*/

      React.createElement("style", null, `
                    @keyframes dtPulse {
                        0%,100% { opacity:1; transform:scale(1); }
                        50%      { opacity:0.6; transform:scale(1.3); }
                    }
                `)
      ));

  };

  // Exports
  window.DailyTasksComponent = DailyTasksComponent;

})();