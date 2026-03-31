(function () {
  var FunPassModal = ({ show, onClose, userData, user, lang, onNotification, onOpenInventory }) => {
    var [activeTab, setActiveTab] = useState('pass'); // 'pass' | 'missions'
    var [buying, setBuying] = useState(false);
    var [claiming, setClaiming] = useState(null);

    // All hooks before early return
    // Season-aware: data is stored under funPass.seasons[SEASON_ID]
    var fpAll = userData?.funPass || {};
    var fp = fpAll.seasons?.[FUN_PASS_SEASON_ID] || {};
    var hasPremium = fp.premium === true;
    var currentXP = fp.xp || 0;
    var claimedFree = fp.claimedFree || [];
    var claimedPremium = fp.claimedPremium || [];
    var currency = userData?.currency || 0;
    var missions = fp.missions || {};

    // Helper: today string
    var todayStr = new Date().toDateString();
    // Helper: current week string (year-week)
    var now = new Date();
    var startOfYear = new Date(now.getFullYear(), 0, 1);
    var weekNum = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    var weekStr = `${now.getFullYear()}-W${weekNum}`;

    // Find current level (last level where xp >= xpRequired)
    var currentLevel = FUN_PASS_LEVELS.reduce((acc, lv) => currentXP >= lv.xp ? lv.level : acc, 0);
    var nextLevel = FUN_PASS_LEVELS.find((lv) => lv.level === currentLevel + 1);
    var xpForNext = nextLevel ? nextLevel.xp : null;
    var progressPct = xpForNext ? Math.min(100, Math.round((currentXP - (FUN_PASS_LEVELS[currentLevel - 1]?.xp || 0)) / (xpForNext - (FUN_PASS_LEVELS[currentLevel - 1]?.xp || 0)) * 100)) : 100;

    if (!show) return null;

    // ══════════════════════════════════════════
    // MISSIONS SYSTEM - CLEAN REBUILD
    // ══════════════════════════════════════════
    // Required values per mission
    var MISSION_REQUIRED = {
      d1: 1, d2: 1, d3: 1, d4: 1, d5: 1, d6: 1, d7: 1,
      w1: 10, w2: 5, w3: 5, w4: 3, w5: 3
    };

    // Get live progress value for a mission key
    var getMissionCurrentVal = (mKey, type) => {
      var prog = userData?.missionProgress || {};
      if (type === 'daily') {
        var dp = prog.daily || {};
        var today = new Date().toDateString();
        if (dp.resetDate !== today) return 0; // day changed → reset
        var map = { d1: dp.gamesPlayed || 0, d2: dp.gamesWon || 0, d3: dp.spyGames || 0,
          d4: dp.giftsSent || 0, d5: dp.friendsAdded || 0,
          d6: dp.momentsPosted || 0, d7: dp.commentsPosted || 0 };
        return map[mKey] || 0;
      } else {
        var now = new Date();
        var startOfYear = new Date(now.getFullYear(), 0, 1);
        var weekNum = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
        var currentWeek = `${now.getFullYear()}-W${weekNum}`;
        var wp = prog.weekly || {};
        if (wp.resetWeek !== currentWeek) return 0; // week changed → reset
        var map = { w1: wp.gamesPlayed || 0, w2: wp.gamesWon || 0, w3: wp.giftsSent || 0,
          w4: wp.momentsPosted || 0, w5: wp.friendsAdded || 0 };
        return map[mKey] || 0;
      }
    };

    // Check if mission already claimed today/this week
    var isMissionAlreadyClaimed = (mKey, type) => {
      var mData = missions[mKey] || {};
      if (type === 'daily') return mData.lastCompleted === todayStr;
      return mData.lastWeekCompleted === weekStr;
    };

    var handleClaimMission = async (mission, type) => {
      if (!user || claiming) return;
      var mKey = mission.id;

      // Double check - already claimed?
      if (isMissionAlreadyClaimed(mKey, type)) {
        onNotification(lang === 'ar' ? '✅ تم الاستلام بالفعل' : '✅ Already claimed');
        return;
      }

      // Check completion
      var currentVal = getMissionCurrentVal(mKey, type);
      var requiredVal = MISSION_REQUIRED[mKey] || 1;
      if (currentVal < requiredVal) {
        onNotification(lang === 'ar' ? '❌ لم تكمل المهمة بعد' : '❌ Mission not completed yet');
        return;
      }

      setClaiming(mKey);
      try {
        var updates = {};
        // Add XP with VIP multiplier
        var vipMult = window.getVIPXPMultiplier(userData);
        var finalXP = Math.round(mission.xp * vipMult);
        updates[`funPass.seasons.${FUN_PASS_SEASON_ID}.xp`] = firebase.firestore.FieldValue.increment(finalXP);
        // Mark claimed with date
        if (type === 'daily') {
          updates[`funPass.seasons.${FUN_PASS_SEASON_ID}.missions.${mKey}.lastCompleted`] = todayStr;
        } else {
          updates[`funPass.seasons.${FUN_PASS_SEASON_ID}.missions.${mKey}.lastWeekCompleted`] = weekStr;
        }
        await usersCollection.doc(user.uid).update(updates);
        onNotification(`🎉 +${finalXP} XP${vipMult > 1 ? ` (×${vipMult} VIP)` : ''} ${lang === 'ar' ? 'تم الاستلام!' : 'Claimed!'}`);
      } catch (e) {
        console.error('Mission claim error:', e);
        onNotification(lang === 'ar' ? '❌ حدث خطأ، حاول مجدداً' : '❌ Error, please try again');
      }
      setClaiming(null);
    };

    var handleBuyPremium = async () => {
      if (!user || hasPremium || buying) return;
      if (currency < FUN_PASS_PRICE) {onNotification(lang === 'ar' ? 'إنتل غير كافٍ!' : 'Not enough Intel!');return;}
      setBuying(true);
      try {
        // 🛡️ SECURITY: Fun Pass Purchase
        // 🛡️ SECURITY: Fun Pass Purchase
        if (window.SecurityService) {
          await window.SecurityService.applyCurrencyTransaction(user.uid, -FUN_PASS_PRICE, `Purchase Fun Pass: Season ${FUN_PASS_SEASON_ID}`);
        } else {
          await usersCollection.doc(user.uid).update({ currency: firebase.firestore.FieldValue.increment(-FUN_PASS_PRICE) });
        }
        await usersCollection.doc(user.uid).update({
          [`funPass.seasons.${FUN_PASS_SEASON_ID}.premium`]: true,
          [`funPass.seasons.${FUN_PASS_SEASON_ID}.purchasedDate`]: TS()
        });
        onNotification(lang === 'ar' ? '🎫 تم شراء Fun Pass!' : '🎫 Fun Pass purchased!');
      } catch (e) {onNotification(lang === 'ar' ? 'خطأ' : 'Error');}
      setBuying(false);
    };

    var handleClaim = async (level, type) => {
      if (!user || claiming) return;
      var key = `${type}_${level}`;
      var alreadyClaimed = type === 'free' ? claimedFree.includes(level) : claimedPremium.includes(level);
      if (alreadyClaimed) return;
      if (type === 'premium' && !hasPremium) {onNotification(lang === 'ar' ? 'اشترِ Fun Pass أولاً' : 'Buy Fun Pass first');return;}
      if (currentLevel < level) {onNotification(lang === 'ar' ? 'لم تصل لهذا المستوى بعد' : 'Level not reached yet');return;}
      var lvData = FUN_PASS_LEVELS.find((l) => l.level === level);
      var reward = type === 'free' ? lvData.free : lvData.premium;
      setClaiming(key);
      try {
        var updates = {};
        if (reward.type === 'currency' && reward.amount > 0) {
          // 🛡️ SECURITY: Fun Pass Reward Claim
          // 🛡️ SECURITY: Fun Pass Reward
          if (window.SecurityService) {
            await window.SecurityService.applyCurrencyTransaction(user.uid, reward.amount, `Fun Pass Reward: Level ${level} (${type})`);
          } else {
            await usersCollection.doc(user.uid).update({ currency: firebase.firestore.FieldValue.increment(reward.amount) });
          }
        } else if (reward.type === 'frame') {
          updates['inventory.frames'] = firebase.firestore.FieldValue.arrayUnion(reward.itemId);
        } else if (reward.type === 'badge') {
          updates['inventory.badges'] = firebase.firestore.FieldValue.arrayUnion(reward.itemId);
        } else if (reward.type === 'title') {
          updates['inventory.titles'] = firebase.firestore.FieldValue.arrayUnion(reward.itemId);
        } else if (reward.type === 'gift') {
          // ✅ إضافة الهدية لـ inventory.gifts مع عداد الكمية
          var giftCounts = userData?.inventory?.giftCounts || {};
          var currentCount = giftCounts[reward.itemId] || 0;
          updates['inventory.gifts'] = firebase.firestore.FieldValue.arrayUnion(reward.itemId);
          updates[`inventory.giftCounts.${reward.itemId}`] = currentCount + (reward.amount || 1);
        }
        if (type === 'free') {
          updates[`funPass.seasons.${FUN_PASS_SEASON_ID}.claimedFree`] = firebase.firestore.FieldValue.arrayUnion(level);
        } else {
          updates[`funPass.seasons.${FUN_PASS_SEASON_ID}.claimedPremium`] = firebase.firestore.FieldValue.arrayUnion(level);
        }
        await usersCollection.doc(user.uid).update(updates);
        onNotification(`${lang === 'ar' ? 'تم استلام' : 'Claimed'} ${lang === 'ar' ? reward.name_ar : reward.name_en}! 🎉`);
        // 📦 If reward is an item (frame/badge/title/gift), go to inventory
        if (reward.type === 'frame' || reward.type === 'badge' || reward.type === 'title' || reward.type === 'gift') {
          setTimeout(() => {onClose();if (onOpenInventory) onOpenInventory();}, 400);
        }
      } catch (e) {}
      setClaiming(null);
    };

    var getRarityStyle = (rarity) => {
      var r = RARITY_CONFIG[rarity] || RARITY_CONFIG['Common'];
      return { border: `1px solid ${r.border}`, background: r.bg, color: r.color };
    };
    var isMythic = (rarity) => rarity === 'Mythic';

    return (/*#__PURE__*/
      React.createElement("div", { className: "modal-overlay", onClick: onClose, style: { zIndex: Z.MODAL_HIGH } }, /*#__PURE__*/
      React.createElement("div", { className: "animate-pop", onClick: (e) => e.stopPropagation(), style: {
          background: 'linear-gradient(180deg,#0a0a1a,#0f0f1e)',
          border: '1px solid rgba(255,215,0,0.25)',
          borderRadius: '18px', width: '100%', maxWidth: '420px',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 40px rgba(255,215,0,0.05)'
        } }, /*#__PURE__*/

      React.createElement("div", { style: {
          padding: '14px 16px',
          background: GR.GOLD_SOFT,
          borderBottom: '1px solid rgba(255,215,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '28px' } }, "\uD83C\uDFAB"), /*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '16px', fontWeight: 900, background: 'linear-gradient(135deg,#ffd700,#ff8800)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } }, "FUN PASS"

      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '9px', color: '#fbbf24', fontWeight: 700 } },
      lang === 'ar' ? FUN_PASS_SEASON_NAME_AR : FUN_PASS_SEASON_NAME_EN
      ), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '8px', color: '#6b7280' } },
      lang === 'ar' ? 'مستوى' : 'Lv', " ", currentLevel, "/50 \xB7 ", currentXP, " XP \xB7 ", lang === 'ar' ? 'ينتهي' : 'Ends', " ", FUN_PASS_SEASON_END
      )
      )
      ), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
      !hasPremium && /*#__PURE__*/
      React.createElement("button", { onClick: handleBuyPremium, disabled: buying || currency < FUN_PASS_PRICE, style: {
          padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', border: 'none',
          background: currency >= FUN_PASS_PRICE ? 'linear-gradient(135deg,#ffd700,#ff8800)' : 'rgba(100,100,100,0.2)',
          color: currency >= FUN_PASS_PRICE ? '#000' : '#6b7280',
          opacity: buying ? 0.6 : 1
        } },
      buying ? '...' : `🎫 ${FUN_PASS_PRICE}🧠`
      ),

      hasPremium && /*#__PURE__*/
      React.createElement("div", { style: { background: GR.GOLD, border: '1px solid rgba(255,215,0,0.4)', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', color: '#ffd700', fontWeight: 800 } }, "\u2713 PREMIUM"

      ), /*#__PURE__*/

      React.createElement("button", { onClick: onClose, style: { background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '8px', color: '#9ca3af', fontSize: '16px', width: '28px', height: '28px', cursor: 'pointer' } }, "\u2715")
      )
      ), /*#__PURE__*/


      React.createElement("div", { style: { padding: '8px 16px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)' } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#6b7280', marginBottom: '4px' } }, /*#__PURE__*/
      React.createElement("span", null, "XP: ", currentXP), /*#__PURE__*/
      React.createElement("span", null, xpForNext ? `${lang === 'ar' ? 'التالي:' : 'Next:'} ${xpForNext} XP` : lang === 'ar' ? 'المستوى الأقصى!' : 'Max Level!')
      ), /*#__PURE__*/
      React.createElement("div", { style: { height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' } }, /*#__PURE__*/
      React.createElement("div", { style: {
          height: '100%', borderRadius: '3px', transition: 'width 0.5s ease',
          width: `${xpForNext ? progressPct : 100}%`,
          background: 'linear-gradient(90deg,#ffd700,#ff8800)'
        } })
      )
      ), /*#__PURE__*/


      React.createElement("div", { style: { display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' } },
      [
      { id: 'pass', icon: '🎫', ar: 'التمرير', en: 'Pass' },
      { id: 'missions', icon: '📋', ar: 'المهمات', en: 'Missions' }].
      map((tab) => /*#__PURE__*/
      React.createElement("button", { key: tab.id, onClick: () => setActiveTab(tab.id), style: {
          flex: 1, padding: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none',
          background: activeTab === tab.id ? 'rgba(255,215,0,0.1)' : 'transparent',
          color: activeTab === tab.id ? '#ffd700' : '#6b7280',
          borderBottom: activeTab === tab.id ? '2px solid #ffd700' : '2px solid transparent'
        } },
      tab.icon, " ", lang === 'ar' ? tab.ar : tab.en
      )
      )
      ), /*#__PURE__*/


      React.createElement("div", { style: { flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' } },
      activeTab === 'pass' && /*#__PURE__*/
      React.createElement(React.Fragment, null, /*#__PURE__*/

      React.createElement("div", { style: { display: 'flex', gap: '10px', padding: '6px 0', fontSize: '9px', color: '#6b7280' } }, /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px' } }, /*#__PURE__*/React.createElement("div", { style: { width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' } }), /*#__PURE__*/React.createElement("span", null, lang === 'ar' ? 'مجاني' : 'Free')), /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px' } }, /*#__PURE__*/React.createElement("div", { style: { width: '8px', height: '8px', borderRadius: '2px', background: GR.GOLD_SOFT, border: '1px solid rgba(255,215,0,0.4)' } }), /*#__PURE__*/React.createElement("span", null, lang === 'ar' ? 'مميز' : 'Premium'))
      ),
      FUN_PASS_LEVELS.map((lv) => {
        var isReached = currentLevel >= lv.level;
        var isCurrent = currentLevel === lv.level - 1 && lv.level <= 50;
        var freeClaimable = isReached && !claimedFree.includes(lv.level);
        var premClaimable = isReached && hasPremium && !claimedPremium.includes(lv.level);
        var freeKey = `free_${lv.level}`;
        var premKey = `premium_${lv.level}`;
        var freeRarity = lv.free.rarity || 'Common';
        var premRarity = lv.premium.rarity || 'Common';

        return (/*#__PURE__*/
          React.createElement("div", { key: lv.level, style: {
              display: 'flex', gap: '6px', alignItems: 'stretch',
              opacity: !isReached && !isCurrent ? 0.55 : 1
            } }, /*#__PURE__*/

          React.createElement("div", { style: {
              width: '32px', minWidth: '32px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '2px'
            } }, /*#__PURE__*/
          React.createElement("div", { style: {
              width: '28px', height: '28px', borderRadius: '50%',
              background: isCurrent ? 'rgba(59,130,246,0.3)' : isReached ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
              border: isCurrent ? '2px solid #3b82f6' : isReached ? '2px solid rgba(255,215,0,0.5)' : '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', fontWeight: 900,
              color: isCurrent ? '#60a5fa' : isReached ? '#ffd700' : '#6b7280',
              boxShadow: isCurrent ? '0 0 8px rgba(59,130,246,0.5)' : isReached ? '0 0 6px rgba(255,215,0,0.2)' : 'none'
            } }, lv.level),
          lv.level < 50 && /*#__PURE__*/
          React.createElement("div", { style: { width: '1px', height: '8px', background: 'rgba(255,255,255,0.08)' } })

          ), /*#__PURE__*/


          React.createElement("div", { style: {
              flex: 1, padding: '7px 10px', borderRadius: '10px', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between', gap: '6px',
              ...(freeRarity === 'Mythic' ? {
                background: 'rgba(255,0,85,0.1)', border: '1px solid rgba(255,0,85,0.4)',
                animation: 'mythic-pulse 2s ease-in-out infinite'
              } : freeRarity === 'Legendary' ? {
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.35)'
              } : freeRarity === 'Epic' ? {
                background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)'
              } : {
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)'
              })
            } }, /*#__PURE__*/
          React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 } },
          lv.free.imageUrl ? /*#__PURE__*/
          React.createElement("img", { src: lv.free.imageUrl, alt: "", style: { width: '24px', height: '24px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 } }) : /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '16px', flexShrink: 0 } }, lv.free.icon), /*#__PURE__*/
          React.createElement("div", { style: { minWidth: 0 } }, /*#__PURE__*/
          React.createElement("div", { className: "marquee-container", style: { height: '14px' } }, /*#__PURE__*/
          React.createElement("div", { className: "marquee-content", style: { fontSize: '10px', fontWeight: 700, color: freeRarity === 'Mythic' ? '#ff4488' : freeRarity === 'Legendary' ? '#fbbf24' : freeRarity === 'Epic' ? '#c084fc' : '#e2e8f0' } },
          lang === 'ar' ? lv.free.name_ar : lv.free.name_en
          )
          ), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '8px', color: '#4ade80', fontWeight: 600 } }, "FREE")
          )
          ),
          claimedFree.includes(lv.level) ? /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '9px', color: '#4ade80', fontWeight: 700, flexShrink: 0 } }, "\u2713") : /*#__PURE__*/

          React.createElement("button", { onClick: () => handleClaim(lv.level, 'free'), disabled: !freeClaimable || claiming === freeKey, style: {
              width: '54px', height: '22px', borderRadius: '6px', fontSize: '9px', fontWeight: 700, cursor: freeClaimable ? 'pointer' : 'default', border: 'none', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: freeClaimable ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.04)',
              color: freeClaimable ? '#4ade80' : '#374151',
              opacity: claiming === freeKey ? 0.6 : 1
            } },
          claiming === freeKey ? '...' : freeClaimable ? lang === 'ar' ? 'استلم' : 'Claim' : '🔒'
          )

          ), /*#__PURE__*/


          React.createElement("div", { style: {
              flex: 1, padding: '7px 10px', borderRadius: '10px', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between', gap: '6px',
              ...(premRarity === 'Mythic' ? {
                background: 'rgba(255,0,85,0.12)', border: '1px solid rgba(255,0,85,0.5)',
                animation: 'mythic-pulse 2s ease-in-out infinite'
              } : premRarity === 'Legendary' ? {
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.4)'
              } : premRarity === 'Epic' ? {
                background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)'
              } : {
                background: hasPremium ? 'rgba(255,215,0,0.05)' : 'rgba(255,255,255,0.02)',
                border: hasPremium ? '1px solid rgba(255,215,0,0.2)' : '1px dashed rgba(255,255,255,0.08)'
              })
            } }, /*#__PURE__*/
          React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, opacity: hasPremium ? 1 : 0.4 } },
          hasPremium && lv.premium.imageUrl ? /*#__PURE__*/
          React.createElement("img", { src: lv.premium.imageUrl, alt: "", style: { width: '24px', height: '24px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 } }) : /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '16px', flexShrink: 0 } }, hasPremium ? lv.premium.icon : '🔒'), /*#__PURE__*/
          React.createElement("div", { style: { minWidth: 0 } }, /*#__PURE__*/
          React.createElement("div", { className: "marquee-container", style: { height: '14px' } }, /*#__PURE__*/
          React.createElement("div", { className: "marquee-content", style: { fontSize: '10px', fontWeight: 700, color: premRarity === 'Mythic' ? '#ff4488' : premRarity === 'Legendary' ? '#fbbf24' : premRarity === 'Epic' ? '#c084fc' : '#9ca3af' } },
          hasPremium ? lang === 'ar' ? lv.premium.name_ar : lv.premium.name_en : '???'
          )
          ), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '8px', color: '#ffd700', fontWeight: 600 } }, "\uD83C\uDFAB PASS")
          )
          ),
          claimedPremium.includes(lv.level) ? /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '9px', color: '#4ade80', fontWeight: 700, flexShrink: 0 } }, "\u2713") : /*#__PURE__*/

          React.createElement("button", { onClick: () => handleClaim(lv.level, 'premium'), disabled: !premClaimable || claiming === premKey, style: {
              width: '54px', height: '22px', borderRadius: '6px', fontSize: '9px', fontWeight: 700, cursor: premClaimable ? 'pointer' : 'default', border: 'none', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: premClaimable ? 'linear-gradient(135deg,rgba(255,215,0,0.3),rgba(255,136,0,0.2))' : 'rgba(255,255,255,0.03)',
              color: premClaimable ? '#ffd700' : '#374151',
              opacity: claiming === premKey ? 0.6 : 1
            } },
          claiming === premKey ? '...' : premClaimable ? lang === 'ar' ? 'استلم' : 'Claim' : hasPremium ? '🔒' : '🎫'
          )

          )
          ));

      })
      ),


      activeTab === 'missions' && /*#__PURE__*/
      React.createElement(React.Fragment, null, /*#__PURE__*/

      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0 4px' } }, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '14px' } }, "\u2600\uFE0F"), /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '12px', fontWeight: 900, color: '#fbbf24', letterSpacing: '0.5px' } },
      lang === 'ar' ? 'المهمات اليومية' : 'DAILY MISSIONS'
      ), /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '9px', color: '#6b7280', marginLeft: 'auto' } },
      lang === 'ar' ? 'تتجدد كل يوم' : 'Resets daily'
      )
      ),
      FUN_PASS_DAILY_MISSIONS.map((m) => {
        var done = isMissionAlreadyClaimed(m.id, 'daily');
        var isLoading = claiming === m.id;
        var cur = getMissionCurrentVal(m.id, 'daily');
        var req = MISSION_REQUIRED[m.id] || 1;
        var pct = Math.min(100, Math.round(cur / req * 100));
        var ready = !done && cur >= req;
        return (/*#__PURE__*/
          React.createElement("div", { key: m.id, style: {
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '12px', marginBottom: '4px',
              background: done ? 'rgba(74,222,128,0.06)' :
              ready ? 'rgba(251,191,36,0.08)' :
              'rgba(255,255,255,0.03)',
              border: done ? '1px solid rgba(74,222,128,0.3)' :
              ready ? '1px solid rgba(251,191,36,0.35)' :
              '1px solid rgba(255,255,255,0.07)',
              transition: 'all 0.2s'
            } }, /*#__PURE__*/

          React.createElement("span", { style: { fontSize: '20px', flexShrink: 0, filter: done ? 'grayscale(70%)' : 'none' } }, m.icon), /*#__PURE__*/

          React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
          React.createElement("div", { className: "marquee-container", style: { height: '14px', marginBottom: '2px' } }, /*#__PURE__*/
          React.createElement("div", { className: "marquee-content", style: { fontSize: '11px', fontWeight: 700,
              color: done ? '#6b7280' : ready ? '#fde68a' : '#e2e8f0'
            } },
          lang === 'ar' ? m.name_ar : m.name_en
          )
          ), /*#__PURE__*/
          React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/

          React.createElement("div", { style: { flex: 1, height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', maxWidth: '80px' } }, /*#__PURE__*/
          React.createElement("div", { style: {
              height: '100%', borderRadius: '2px', transition: 'width 0.4s ease',
              width: `${done ? 100 : pct}%`,
              background: done ? 'linear-gradient(90deg,#4ade80,#22c55e)' :
              ready ? 'linear-gradient(90deg,#fbbf24,#f59e0b)' :
              'linear-gradient(90deg,#7000ff,#00f2ff)'
            } })
          ), /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '9px', color: done ? '#4ade80' : ready ? '#fbbf24' : '#6b7280', fontWeight: 700 } },
          done ? `${req}/${req}` : `${cur}/${req}`
          ), /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '9px', color: '#fbbf24', fontWeight: 800, marginLeft: '2px' } }, "+",
          m.xp, " XP"
          )
          )
          ),

          done ? /*#__PURE__*/
          React.createElement("div", { style: {
              width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
              background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 900, color: '#4ade80'
            } }, "\u2713") :
          ready ? /*#__PURE__*/
          React.createElement("button", {
            onClick: () => handleClaimMission(m, 'daily'),
            disabled: isLoading,
            style: {
              width: '58px', height: '28px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
              color: '#000', fontSize: '10px', fontWeight: 800, flexShrink: 0,
              opacity: isLoading ? 0.6 : 1,
              boxShadow: '0 0 12px rgba(251,191,36,0.4)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            } },
          isLoading ? '...' : lang === 'ar' ? 'استلم' : 'Claim') : /*#__PURE__*/

          React.createElement("div", { style: {
              width: '58px', height: '28px', borderRadius: '8px', flexShrink: 0,
              background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.15)',
              fontSize: '9px', fontWeight: 700, color: '#4b5563',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            } }, lang === 'ar' ? 'جارٍ' : 'Pending')

          ));

      }), /*#__PURE__*/


      React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0 4px' } }, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '14px' } }, "\uD83D\uDCC5"), /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '12px', fontWeight: 900, color: '#c084fc', letterSpacing: '0.5px' } },
      lang === 'ar' ? 'المهمات الأسبوعية' : 'WEEKLY MISSIONS'
      ), /*#__PURE__*/
      React.createElement("span", { style: { fontSize: '9px', color: '#6b7280', marginLeft: 'auto' } },
      lang === 'ar' ? 'تتجدد كل أسبوع' : 'Resets weekly'
      )
      ),
      FUN_PASS_WEEKLY_MISSIONS.map((m) => {
        var done = isMissionAlreadyClaimed(m.id, 'weekly');
        var isLoading = claiming === m.id;
        var cur = getMissionCurrentVal(m.id, 'weekly');
        var req = MISSION_REQUIRED[m.id] || 1;
        var pct = Math.min(100, Math.round(cur / req * 100));
        var ready = !done && cur >= req;
        return (/*#__PURE__*/
          React.createElement("div", { key: m.id, style: {
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '12px', marginBottom: '4px',
              background: done ? 'rgba(192,132,252,0.06)' :
              ready ? 'rgba(192,132,252,0.12)' :
              'rgba(168,85,247,0.04)',
              border: done ? '1px solid rgba(192,132,252,0.28)' :
              ready ? '1px solid rgba(192,132,252,0.4)' :
              '1px solid rgba(168,85,247,0.12)',
              transition: 'all 0.2s'
            } }, /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '20px', flexShrink: 0, filter: done ? 'grayscale(70%)' : 'none' } }, m.icon), /*#__PURE__*/
          React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
          React.createElement("div", { className: "marquee-container", style: { height: '14px', marginBottom: '2px' } }, /*#__PURE__*/
          React.createElement("div", { className: "marquee-content", style: { fontSize: '11px', fontWeight: 700,
              color: done ? '#6b7280' : ready ? '#e9d5ff' : '#e2e8f0'
            } },
          lang === 'ar' ? m.name_ar : m.name_en
          )
          ), /*#__PURE__*/
          React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/
          React.createElement("div", { style: { flex: 1, height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', maxWidth: '80px' } }, /*#__PURE__*/
          React.createElement("div", { style: {
              height: '100%', borderRadius: '2px', transition: 'width 0.4s ease',
              width: `${done ? 100 : pct}%`,
              background: done ? 'linear-gradient(90deg,#a78bfa,#7c3aed)' :
              ready ? 'linear-gradient(90deg,#c084fc,#8b5cf6)' :
              'linear-gradient(90deg,#6d28d9,#c084fc)'
            } })
          ), /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '9px', color: done ? '#a78bfa' : ready ? '#c084fc' : '#6b7280', fontWeight: 700 } },
          done ? `${req}/${req}` : `${cur}/${req}`
          ), /*#__PURE__*/
          React.createElement("span", { style: { fontSize: '9px', color: '#c084fc', fontWeight: 800, marginLeft: '2px' } }, "+",
          m.xp, " XP"
          )
          )
          ),
          done ? /*#__PURE__*/
          React.createElement("div", { style: {
              width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
              background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 900, color: '#a78bfa'
            } }, "\u2713") :
          ready ? /*#__PURE__*/
          React.createElement("button", {
            onClick: () => handleClaimMission(m, 'weekly'),
            disabled: isLoading,
            style: {
              width: '58px', height: '28px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#c084fc,#8b5cf6)',
              color: '#fff', fontSize: '10px', fontWeight: 800, flexShrink: 0,
              opacity: isLoading ? 0.6 : 1,
              boxShadow: '0 0 12px rgba(192,132,252,0.4)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            } },
          isLoading ? '...' : lang === 'ar' ? 'استلم' : 'Claim') : /*#__PURE__*/

          React.createElement("div", { style: {
              width: '58px', height: '28px', borderRadius: '8px', flexShrink: 0,
              background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.15)',
              fontSize: '9px', fontWeight: 700, color: '#4b5563',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            } }, lang === 'ar' ? 'جارٍ' : 'Pending')

          ));

      })
      )

      )
      )
      ));

  };

  window.FunPassModal = FunPassModal;

})();