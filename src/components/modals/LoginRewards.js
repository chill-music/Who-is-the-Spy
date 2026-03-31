(function () {
  var { useState, useEffect } = React;
  var LoginRewards = ({ show, onClose, userData, onClaim, lang, onOpenInventory }) => {
    var t = TRANSLATIONS[lang];
    var [claiming, setClaiming] = useState(false);
    var [countdown, setCountdown] = useState('');

    // ALL computations before any hooks - Rules of Hooks compliance
    var loginData = userData?.loginRewards || { currentDay: 0, lastClaimDate: null, streak: 0, totalClaims: 0 };

    var getLastClaimDate = () => {
      var lcd = loginData.lastClaimDate;
      if (!lcd) return null;
      if (lcd?.toDate) return lcd.toDate();
      if (lcd instanceof Date) return lcd;
      var d = new Date(lcd);
      return isNaN(d.getTime()) ? null : d;
    };

    var lastClaimDate = getLastClaimDate();
    var todayStr = new Date().toDateString();
    var lastClaimStr = lastClaimDate ? lastClaimDate.toDateString() : null;
    var canClaimToday = lastClaimStr !== todayStr;
    var currentDay = loginData.currentDay || 0;
    var currentReward = LOGIN_REWARDS[currentDay];

    // Countdown timer - MUST be before any conditional returns
    useEffect(() => {
      if (!show || canClaimToday || !lastClaimDate) {setCountdown('');return;}
      var calcCountdown = () => {
        var now = new Date();
        var nextMidnight = new Date(now);
        nextMidnight.setHours(24, 0, 0, 0);
        var diff = nextMidnight - now;
        if (diff <= 0) {setCountdown('');return;}
        var h = Math.floor(diff / 3600000);
        var m = Math.floor(diff % 3600000 / 60000);
        var s = Math.floor(diff % 60000 / 1000);
        setCountdown(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      };
      calcCountdown();
      var timer = setInterval(calcCountdown, 1000);
      return () => clearInterval(timer);
    }, [show, canClaimToday, lastClaimDate]);

    // Early return AFTER all hooks
    if (!show) return null;

    var handleClaim = async () => {
      if (!canClaimToday || claiming) return;
      setClaiming(true);
      if (typeof playRewardSound === 'function') playRewardSound();
      await onClaim(currentDay + 1);
      // 📦 If reward is an item (frame/badge/title), go to inventory
      if (currentReward && (currentReward.type === 'frame' || currentReward.type === 'badge' || currentReward.type === 'title')) {
        setTimeout(() => {onClose();if (onOpenInventory) onOpenInventory();}, 500);
      }
      setClaiming(false);
    };

    var renderRewardIcon = (reward, size = 16) => {
      if (!reward) return /*#__PURE__*/React.createElement("span", { style: { fontSize: size + 'px' } }, "\u2753");
      return /*#__PURE__*/React.createElement("span", { style: { fontSize: size + 'px' } }, reward.icon || '🎁');
    };

    var getRewardName = (reward) => {
      if (!reward) return '';
      return lang === 'ar' ? reward.name_ar : reward.name_en;
    };

    return (/*#__PURE__*/
      React.createElement("div", { className: "modal-overlay", onClick: onClose }, /*#__PURE__*/
      React.createElement("div", { className: "modal-content animate-pop", onClick: (e) => e.stopPropagation(), style: { maxWidth: '380px', maxHeight: '90vh', width: '95%' } }, /*#__PURE__*/
      React.createElement("div", { className: "modal-header" }, /*#__PURE__*/
      React.createElement("h2", { className: "modal-title" }, "\uD83C\uDF81 ", t.loginRewards), /*#__PURE__*/
      React.createElement(ModalCloseBtn, { onClose: onClose })
      ), /*#__PURE__*/
      React.createElement("div", { className: "modal-body", style: { padding: '12px' } }, /*#__PURE__*/
      React.createElement("div", { className: "login-rewards-container" }, /*#__PURE__*/
      React.createElement("div", { className: "login-rewards-header" }, /*#__PURE__*/
      React.createElement("span", { className: "login-rewards-title" }, "\uD83D\uDD25 ", t.dailyStreak), /*#__PURE__*/
      React.createElement("span", { className: "login-rewards-streak" }, currentDay, "/30")
      ), /*#__PURE__*/
      React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', width: '100%', padding: '8px 0' } },
      LOGIN_REWARDS.map((reward, index) => {
        var dayNum = index + 1;
        var isClaimed = dayNum <= currentDay;
        var isCurrent = dayNum === currentDay + 1 && canClaimToday;
        var isSpecial = reward.special === true;
        var isFinal = reward.final === true;

        var bgColor = 'rgba(255, 255, 255, 0.03)';
        var borderColor = 'rgba(255, 255, 255, 0.1)';
        var textColor = 'rgba(255, 255, 255, 0.5)';
        var extraStyles = {};

        if (isClaimed) {
          bgColor = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(34, 197, 94, 0.1))';
          borderColor = '#10b981';
          textColor = '#10b981';
        } else if (isCurrent) {
          bgColor = 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 136, 0, 0.1))';
          borderColor = '#ffd700';
          textColor = '#ffd700';
          extraStyles = { animation: 'pulse-badge 2s infinite', boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)' };
        } else if (isSpecial) {
          bgColor = 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.1))';
          borderColor = '#8b5cf6';
          textColor = '#a855f7';
        } else if (isFinal) {
          bgColor = 'linear-gradient(135deg, rgba(255, 0, 85, 0.2), rgba(255, 51, 102, 0.1))';
          borderColor = '#ff0055';
          textColor = '#ff0055';
          extraStyles = { animation: 'glow-pulse 2s infinite' };
        }

        return (/*#__PURE__*/
          React.createElement("div", { key: dayNum, title: getRewardName(reward), style: { aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: `2px solid ${borderColor}`, background: bgColor, padding: '4px', gap: '2px', position: 'relative', cursor: isCurrent ? 'pointer' : 'default', transition: 'all 0.2s ease', ...extraStyles } }, /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '11px', fontWeight: '700', color: textColor, lineHeight: 1 } }, dayNum), /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '14px', lineHeight: 1 } }, renderRewardIcon(reward, 14)),

          isClaimed && /*#__PURE__*/
          React.createElement("div", { style: { position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.15)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '14px', color: '#10b981', fontWeight: 900 } }, "\u2713")
          ),


          isCurrent && !isClaimed && /*#__PURE__*/
          React.createElement("div", { style: { position: 'absolute', inset: '-2px', borderRadius: '10px', border: '2px solid #ffd700', boxShadow: '0 0 10px rgba(255,215,0,0.5)', pointerEvents: 'none' } })

          ));

      })
      ),
      canClaimToday && currentReward && /*#__PURE__*/
      React.createElement("div", { style: { marginTop: '12px', padding: '12px', background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 136, 0, 0.05))', border: '1px solid rgba(255, 215, 0, 0.3)', borderRadius: '12px', textAlign: 'center' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' } }, lang === 'ar' ? 'مكافأة اليوم' : "Today's Reward"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '14px', fontWeight: '700', color: 'white' } }, renderRewardIcon(currentReward, 18), " ", getRewardName(currentReward)),
      currentReward.special && /*#__PURE__*/React.createElement("div", { style: { fontSize: '10px', color: '#ffd700', marginTop: '4px' } }, "\u2B50 ", lang === 'ar' ? 'مكافأة خاصة!' : 'Special Reward!')
      ),


      !canClaimToday && countdown && /*#__PURE__*/
      React.createElement("div", { style: { textAlign: 'center', marginTop: '10px', padding: '8px 12px', background: 'rgba(0,242,255,0.06)', border: '1px solid rgba(0,242,255,0.15)', borderRadius: '10px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '9px', color: '#64748b', marginBottom: '3px' } },
      lang === 'ar' ? '⏳ الوقت المتبقي لليوم التالي' : '⏳ Next reward in'
      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '18px', fontWeight: 900, color: '#00f2ff', fontFamily: 'monospace', letterSpacing: '2px' } },
      countdown
      )
      ), /*#__PURE__*/

      React.createElement("button", { onClick: handleClaim, disabled: !canClaimToday || claiming, style: { width: '100%', padding: '10px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: canClaimToday && !claiming ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease', background: canClaimToday ? 'linear-gradient(135deg, #ffd700, #ff8800)' : 'rgba(107, 114, 128, 0.5)', color: canClaimToday ? '#000' : 'rgba(255, 255, 255, 0.5)', marginTop: '10px' } },
      claiming ? t.loading : canClaimToday ? t.claimReward : t.alreadyClaimed
      )
      )
      )
      )
      ));

  };

  window.LoginRewards = LoginRewards;
})();