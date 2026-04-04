/**
 * FamilyProfile.js - Redesigned family profile tab.
 * Sections: Header → Activeness → Weekly Activeness → Treasury → Announcement
 */
var FamilyProfile = ({
  family,
  familyMembers,
  currentUID,
  currentUserData,
  userData,
  lang,
  onUpdateInfo,
  isReadOnly,
  showDonatePanel,
  setShowDonatePanel
}) => {
  if (!family) return null;
  if (!familyMembers) familyMembers = family.members || [];
  if (isReadOnly === undefined) isReadOnly = false;

  var photoFileRef = React.useRef(null);
  var onNotification = window.showNotification || window.showToast || ((msg) => console.info('[FamilyProfile]', msg));

  // ── Activeness modal state ──
  var [showActModal, setShowActModal] = React.useState(false);
  var [buyingAct, setBuyingAct] = React.useState(false);
  var [upgradingClan, setUpgradingClan] = React.useState(false);
  var [weeklyChestBusy, setWeeklyChestBusy] = React.useState(false);

  var fmtFamilyNum = window.fmtFamilyNum || ((n) => n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n));
  var {
    getFamilyLevelConfig = () => ({}),
    getFamilyRole = () => 'member',
    getFamilySignLevelData = () => ({ level: 0 }),
    FAMILY_LEVEL_CONFIG = []
  } = window.FamilyConstants || {};

  var fLvl = getFamilyLevelConfig(family.level || 1);
  var myRole = getFamilyRole(family, currentUID);
  var canManage = myRole === 'owner' || myRole === 'admin';

  // ── Sign data: based on lastWeekActiveness ──
  var SIGN_FALLBACK = { level: 1, color: '#4b5563', glow: 'rgba(75,85,99,0.3)', defaultIcon: '🏠', bg: 'rgba(75,85,99,0.1)', name_ar: 'العائلة', name_en: 'Family', threshold: 0 };
  var lastWeekAct = family.lastWeekActiveness !== undefined ? family.lastWeekActiveness : family.weeklyActiveness || 0;
  var signData = getFamilySignLevelData(lastWeekAct) || SIGN_FALLBACK;

  // ── Activeness progress ──
  var totalActiveness = family.activeness || 0;
  var weeklyActiveness = family.weeklyActiveness || 0;
  var ORIGINAL_MILESTONES = window.ACTIVENESS_MILESTONES || [];
  // Create sorted version for display while keeping original indices for functionality
  var WEEKLY_MILESTONES = ORIGINAL_MILESTONES.map((ms, originalIdx) => ({ ...ms, originalIdx })).sort((a, b) => a.threshold - b.threshold);

  // Level progress
  var nextLevelCfg = FAMILY_LEVEL_CONFIG.find((c) => c.level === fLvl.level + 1);
  var lvlProgress = nextLevelCfg ?
  Math.min(100, Math.round((totalActiveness - fLvl.activeness) / (nextLevelCfg.activeness - fLvl.activeness) * 100)) :
  100;
  var nextLevelAt = nextLevelCfg ? nextLevelCfg.activeness : null;

  // ── Next weekly reset (Sunday) ──
  var getNextSunday = () => {
    var now = new Date();
    var daysUntilSun = (7 - now.getDay()) % 7 || 7;
    var next = new Date(now);
    next.setDate(now.getDate() + daysUntilSun);
    next.setHours(0, 0, 0, 0);
    var diff = next - now;
    var d = Math.floor(diff / 86400000);
    var h = Math.floor(diff % 86400000 / 3600000);
    if (d > 0) return lang === 'ar' ? `${d} يوم ${h} ساعة` : `${d}d ${h}h`;
    return lang === 'ar' ? `${h} ساعة` : `${h}h`;
  };

  // Treasury chests claimed
  var treasuryInv = family.treasuryInventory || [];
  var familyTreasury = family.treasury || 0;
  var myIntel = currentUserData && currentUserData.currency || 0;

  // ── Photo upload ──
  var handlePhotoUpload = async (e) => {
    var file = e.target.files[0];
    if (!file) return;
    try {
      var dataUrl = await window.FamilyService.handleImageUpload(file);
      await window.FamilyService.saveInfo({ family, updates: { photoURL: dataUrl }, currentUID });
      if (window.FamilyService?.postNews) {
        await window.FamilyService.postNews(
          family.id,
          'settings_change',
          lang === 'ar' ?
          `${currentUserData?.displayName || 'المسؤول'} عدّل صورة القبيلة 🖼️` :
          `${currentUserData?.displayName || 'Admin'} updated the family photo 🖼️`,
          0,
          { uid: currentUID, name: currentUserData?.displayName, photo: currentUserData?.photoURL }
        );
      }
      onNotification(lang === 'ar' ? '✅ تم تحديث الصورة' : '✅ Photo updated');
    } catch (err) {console.error(err);}
  };

  // ── Buy activeness gift ──
  var ACTIVENESS_GIFTS = [
  { label_ar: 'هدية نشاط صغيرة', label_en: 'Small Activity Gift', activeness: 50, cost: 500, icon: '🎁', color: '#4ade80' },
  { label_ar: 'هدية نشاط متوسطة', label_en: 'Medium Activity Gift', activeness: 500, cost: 5000, icon: '🎀', color: '#60a5fa' },
  { label_ar: 'هدية نشاط كبيرة', label_en: 'Large Activity Gift', activeness: 5000, cost: 50000, icon: '🏆', color: '#fbbf24' }];


  var handleBuyActiveness = async (gift) => {
    if (buyingAct) return;
    if (myIntel < gift.cost) {
      onNotification(lang === 'ar' ? '❌ إنتل غير كافٍ' : '❌ Not enough Intel');
      return;
    }
    setBuyingAct(true);
    try {
      var { firebase, familiesCollection } = window;
      var familyId = family.id;
      // 🛡️ SECURITY: Family Gift purchase
      await window.SecurityService.applyCurrencyTransaction(currentUID, -gift.cost, `Family Gift: ${gift.id}`, { familyId: familyId, giftId: gift.id });
      await familiesCollection.doc(familyId).update({
        activeness: firebase.firestore.FieldValue.increment(gift.activeness),
        weeklyActiveness: firebase.firestore.FieldValue.increment(gift.activeness)
      });
      onNotification(`✅ +${gift.activeness} ${lang === 'ar' ? 'نشاط!' : 'Activeness!'}`);
      setShowActModal(false);
    } catch (e) {
      console.error('Buy activeness error:', e);
      onNotification(lang === 'ar' ? '❌ خطأ في الشراء' : '❌ Purchase failed');
    }
    setBuyingAct(false);
  };

  var upgradeClan = async () => {
    if (!family?.id || !canManage || !nextLevelCfg || upgradingClan) return;
    if (totalActiveness < nextLevelCfg.activeness) {
      onNotification(lang === 'ar' ? `❌ تحتاج ${fmtFamilyNum(nextLevelCfg.activeness)} نشاطاً` : `❌ Need ${fmtFamilyNum(nextLevelCfg.activeness)} activeness`);
      return;
    }
    if ((nextLevelCfg.upgradeCost || 0) > 0 && familyTreasury < nextLevelCfg.upgradeCost) {
      onNotification(lang === 'ar' ? '❌ خزينة العائلة غير كافية' : '❌ Family treasury too low');
      return;
    }
    setUpgradingClan(true);
    try {
      var firebase = window.firebase;
      var familiesCollection = window.familiesCollection;
      var newLevel = parseInt(fLvl.level || 1, 10) + 1;
      // Build update object — only deduct cost if > 0
      var updateData = { level: newLevel };
      var cost = parseInt(nextLevelCfg.upgradeCost || 0, 10);
      if (cost > 0) {
        updateData.treasury = firebase.firestore.FieldValue.increment(-cost);
      }
      await familiesCollection.doc(family.id).update(updateData);
      if (window.FamilyService?.postNews) {
        try {
          await window.FamilyService.postNews(family.id, 'level_up',
          lang === 'ar' ?
          `⬆️ ترقية للمستوى ${newLevel}: ${nextLevelCfg.name_ar}` :
          `⬆️ Leveled up to ${newLevel}: ${nextLevelCfg.name_en}`,
          0,
          { uid: currentUID, name: currentUserData?.displayName, photo: currentUserData?.photoURL }
          );
        } catch (e) {
          console.warn('postNews after level up failed', e);
        }
      }
      onNotification(`🆙 ${lang === 'ar' ? 'مبروك! ارتفع مستوى العائلة!' : 'Congrats! Family leveled up!'}`);
    } catch (e) {
      console.error('[upgradeClan]', e);
      onNotification(lang === 'ar' ? '❌ فشل الترقية' : '❌ Upgrade failed');
    }
    setUpgradingClan(false);
  };

  // ── Chest status ──
  var getChestStatus = (chestType) => {
    var myItems = treasuryInv.filter((inv) => inv.chestType === chestType);
    var myAssigned = myItems.find((inv) => (inv.assignedTo || []).includes(currentUID));
    if (!myAssigned) return 'none';
    var claimedCount = (myAssigned.claimedBy || {})[currentUID] || 0;
    var maxClaims = myAssigned.maxClaimsPerMember || 1;
    if (claimedCount >= maxClaims) return 'claimed';
    return 'unclaimed';
  };

  var onWeeklyChestClick = async (ms, milestoneIdx) => {
    if (weeklyChestBusy || isReadOnly) return;
    setWeeklyChestBusy(true);
    try {
      var claimedList = family.activenessClaimedMilestones || [];
      var originalIdx = ms.originalIdx !== undefined ? ms.originalIdx : milestoneIdx;
      var milestoneClaimed = claimedList.includes(originalIdx);
      var reachedTotal = weeklyActiveness >= ms.threshold;

      if (canManage && reachedTotal && !milestoneClaimed) {
        var res = await window.FamilyService.handleClaimChest({
          family, chestIdx: originalIdx, currentUID, lang, onNotification
        });
        if (res) {
          onNotification(lang === 'ar' ? `🎁 ${res.cfg.name_ar} في الخزينة` : `🎁 ${res.cfg.name_en} added to treasury`);
        }
        return;
      }

      var inv = family.treasuryInventory || [];
      for (var i = 0; i < inv.length; i++) {
        if (inv[i].chestType !== ms.chestType) continue;
        var assigned = inv[i].assignedTo || [];
        if (!assigned.includes(currentUID)) continue;
        var claimedN = (inv[i].claimedBy || {})[currentUID] || 0;
        if (claimedN >= (inv[i].maxClaimsPerMember || 1)) continue;
        var openRes = await window.FamilyService.openAssignedChest({
          family,
          currentUID,
          currentUserData,
          inventoryIdx: i,
          lang,
          onNotification
        });
        if (openRes && openRes.receiptText) {
          onNotification(openRes.receiptText);
        } else if (openRes) {
          onNotification(lang === 'ar' ? '✅ تم الاستلام' : '✅ Claimed');
        }
        return;
      }

      if (reachedTotal && milestoneClaimed) {
        onNotification(lang === 'ar' ? '📦 الصندوق في الخزينة — اطلب من المسؤول التوزيع' : '📦 Chest is in treasury — ask admin to assign');
      } else if (!reachedTotal) {
        onNotification(lang === 'ar' ? '⏳ لم يصل النشاط الأسبوعي للحد بعد' : '⏳ Weekly activeness not at threshold yet');
      }
    } catch (e) {
      console.error(e);
      onNotification(lang === 'ar' ? '❌ حدث خطأ' : '❌ Something went wrong');
    } finally {
      setWeeklyChestBusy(false);
    }
  };

  return (/*#__PURE__*/
    React.createElement("div", { style: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', background: '#0d0d1f', paddingBottom: '80px' } }, /*#__PURE__*/


    React.createElement("div", { style: {
        background: family.photoURL ?
        `linear-gradient(rgba(0,0,0,0.5),rgba(13,13,31,0.95)),url(${family.photoURL}) center/cover no-repeat` :
        'linear-gradient(160deg,#1a1040 0%,#0a0a2e 100%)',
        padding: '16px 16px 14px',
        position: 'relative'
      } }, /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' } }, /*#__PURE__*/

    React.createElement("div", { style: { position: 'relative', flexShrink: 0 } }, /*#__PURE__*/
    React.createElement("div", { style: { width: '62px', height: '62px', borderRadius: '16px', border: `3px solid ${fLvl.color}`, overflow: 'hidden', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', boxShadow: `0 0 18px ${fLvl.color}66` } },
    family.photoURL ? /*#__PURE__*/React.createElement("img", { src: family.photoURL, style: { width: '100%', height: '100%', objectFit: 'cover' }, alt: "" }) : family.emblem || '🏠'
    ),
    canManage && /*#__PURE__*/React.createElement("button", { onClick: () => photoFileRef.current?.click(), style: { position: 'absolute', bottom: '-4px', right: '-4px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,242,255,0.9)', border: '2px solid #0d0d1f', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' } }, "\uD83D\uDCF7"), /*#__PURE__*/
    React.createElement("input", { ref: photoFileRef, type: "file", accept: "image/*", style: { display: 'none' }, onChange: handlePhotoUpload })
    ), /*#__PURE__*/


    React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/

    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '3px' } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '18px', fontWeight: 900, color: 'white', fontStyle: 'italic', fontFamily: "'Outfit',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' } }, family.name),
    signData.level >= 1 && window.FamilySignBadge && /*#__PURE__*/React.createElement(window.FamilySignBadge, { tag: family.tag, color: signData.color, small: true, signLevel: signData.level, imageURL: signData.imageURL })
    ), /*#__PURE__*/

    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '3px' } }, /*#__PURE__*/
    React.createElement("div", { style: { display: 'inline-flex', alignItems: 'center', gap: '4px', background: `${fLvl.color}22`, border: `1px solid ${fLvl.color}66`, borderRadius: '20px', padding: '2px 8px' } },
    fLvl.imageURL ? /*#__PURE__*/
    React.createElement("img", { src: fLvl.imageURL, alt: "", style: { width: '14px', height: '14px', objectFit: 'contain' } }) : /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '12px' } }, fLvl.icon), /*#__PURE__*/
    React.createElement("span", { style: { color: fLvl.color, fontSize: '10px', fontWeight: 900 } }, "LV.", fLvl.level, " ", lang === 'ar' ? fLvl.name_ar : fLvl.name_en)
    ), /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '9px', color: 'rgba(255,255,255,0.45)' } }, "\uD83D\uDC65 ", family.members?.length || 0, "/", fLvl.maxMembers)
    ), /*#__PURE__*/

    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '9px', color: 'rgba(255,255,255,0.4)' } }, "ID \xB7 ", family.id?.slice(-6).toUpperCase()),
    family.weeklyRank && /*#__PURE__*/
    React.createElement("div", { style: { display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.4)', borderRadius: '20px', padding: '1px 7px', fontSize: '9px', fontWeight: 800, color: '#ffd700' } }, "\uD83C\uDFC5 #",
    family.weeklyRank
    ),

    myRole && window.FamilyRoleBadge && /*#__PURE__*/React.createElement(window.FamilyRoleBadge, { role: myRole, lang: lang, small: true })
    )
    )
    ),


    nextLevelCfg && /*#__PURE__*/
    React.createElement("div", { style: { marginTop: '10px' } }, /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '9px', color: fLvl.color, fontWeight: 700 } }, lang === 'ar' ? 'تقدم المستوى' : 'Level Progress'), /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '9px', color: 'rgba(255,255,255,0.5)' } }, totalActiveness.toLocaleString(), " / ", nextLevelCfg.activeness.toLocaleString())
    ), /*#__PURE__*/
    React.createElement("div", { style: { height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' } }, /*#__PURE__*/
    React.createElement("div", { style: { height: '100%', width: `${lvlProgress}%`, background: `linear-gradient(90deg,${fLvl.color},${fLvl.color}bb)`, borderRadius: '10px', transition: 'width 0.5s ease' } })
    )
    )

    ), /*#__PURE__*/


    React.createElement("div", { style: { margin: '10px 12px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '12px 14px' } }, /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' } }, /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '14px' } }, "\u26A1"), /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '11px', fontWeight: 800, color: '#00f2ff', textTransform: 'uppercase', letterSpacing: '0.5px' } }, lang === 'ar' ? 'النشاط الكلي' : 'Activeness')
    ), /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '13px', fontWeight: 800, color: 'white' } }, totalActiveness.toLocaleString()),
    nextLevelCfg && /*#__PURE__*/React.createElement("span", { style: { fontSize: '9px', color: '#6b7280' } }, "/ ", nextLevelCfg.activeness.toLocaleString()),
    !isReadOnly && /*#__PURE__*/
    React.createElement("button", {
      onClick: () => setShowActModal(true),
      style: { width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg,#00f2ff,#7000ff)', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, lineHeight: 1, flexShrink: 0 } },
    "+")

    )
    ), /*#__PURE__*/

    React.createElement("div", { style: { height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden', marginBottom: nextLevelCfg ? '12px' : 0 } }, /*#__PURE__*/
    React.createElement("div", { style: { height: '100%', width: `${nextLevelCfg ? lvlProgress : 100}%`, background: 'linear-gradient(90deg,#00f2ff,#7000ff)', borderRadius: '10px', transition: 'width 0.6s ease', boxShadow: '0 0 8px rgba(0,242,255,0.5)' } })
    ),


    nextLevelCfg && /*#__PURE__*/
    React.createElement("div", { style: { padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '10px', color: '#9ca3af', marginBottom: '6px' } }, "\uD83D\uDD12 ",
    lang === 'ar' ? 'متطلبات المستوى التالي' : 'Next Level Requirements'
    ), /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '10px', color: '#6b7280' } }, "\uD83D\uDD25 ", lang === 'ar' ? 'النشاط الكلي' : 'Total Activeness'), /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '10px', fontWeight: 800, color: totalActiveness >= nextLevelCfg.activeness ? '#10b981' : '#f97316' } },
    fmtFamilyNum(totalActiveness), " / ", fmtFamilyNum(nextLevelCfg.activeness), " ", totalActiveness >= nextLevelCfg.activeness ? '✅' : ''
    )
    ),
    nextLevelCfg.upgradeCost > 0 && /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '10px', color: '#6b7280' } }, "\uD83C\uDFC5 ", lang === 'ar' ? 'خزينة القبيلة' : 'Treasury'), /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '10px', fontWeight: 800, color: familyTreasury >= nextLevelCfg.upgradeCost ? '#10b981' : '#f97316' } },
    fmtFamilyNum(familyTreasury), " / ", fmtFamilyNum(nextLevelCfg.upgradeCost), " ", familyTreasury >= nextLevelCfg.upgradeCost ? '✅' : ''
    )
    ),

    canManage && totalActiveness >= nextLevelCfg.activeness && familyTreasury >= (nextLevelCfg.upgradeCost || 0) && /*#__PURE__*/
    React.createElement("button", { type: "button", onClick: upgradeClan, disabled: upgradingClan, style: { width: '100%', padding: '9px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#00f2ff,#7000ff)', color: 'white', fontSize: '12px', fontWeight: 900, cursor: upgradingClan ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: upgradingClan ? 0.7 : 1 } }, "\uD83C\uDD99 ",
    lang === 'ar' ? 'ترقية العائلة' : 'Upgrade Family', " \u2192 ", lang === 'ar' ? nextLevelCfg.name_ar : nextLevelCfg.name_en
    ),

    canManage && (totalActiveness < nextLevelCfg.activeness || familyTreasury < (nextLevelCfg.upgradeCost || 0)) && /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '10px', color: '#4b5563', textAlign: 'center', fontStyle: 'italic' } },
    lang === 'ar' ? 'أكمل متطلبات النشاط والخزينة للترقية' : 'Meet activeness & treasury to upgrade'
    )

    )

    ), /*#__PURE__*/


    React.createElement("div", { style: { flexShrink: 0, margin: '10px 12px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '10px', display: 'flex', alignItems: 'center', gap: '14px', overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none' } }, /*#__PURE__*/

    React.createElement("div", { style: { background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, minWidth: '90px' } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '10px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 } },
    lang === 'ar' ? 'النشاط الأسبوعي' : 'Weekly Activeness', /*#__PURE__*/
    React.createElement("div", { style: { width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#fff' } }, "i")
    ), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '20px', fontWeight: 900, color: '#fff', margin: '4px 0', letterSpacing: '-0.5px' } },
    weeklyActiveness >= 1000 ? (weeklyActiveness / 1000).toFixed(1) + 'K' : weeklyActiveness
    ), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '9px', color: '#9ca3af', opacity: 0.8 } },
    lang === 'ar' ? 'إعادة يوم الأحد' : 'Refresh on Sun'
    )
    ), /*#__PURE__*/


    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '14px' } },
    WEEKLY_MILESTONES.map((ms, idx) => {
      var reached = weeklyActiveness >= ms.threshold;
      var status = getChestStatus(ms.chestType);
      var isClaimed = status === 'claimed';
      var isUnclaimed = status === 'unclaimed';
      var milestoneDone = (family.activenessClaimedMilestones || []).includes(ms.originalIdx);
      var showDone = milestoneDone || isClaimed;

      // Scale chests: first 3 are smaller, last 2 are bigger
      var chestSize = idx < 3 ? 32 : 44;

      return (/*#__PURE__*/
        React.createElement("button", {
          type: "button",
          key: ms.chestType + '-' + idx,
          onClick: () => onWeeklyChestClick(ms, idx),
          disabled: weeklyChestBusy,
          style: {
            background: 'transparent', border: 'none', padding: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
            cursor: weeklyChestBusy ? 'wait' : 'pointer',
            filter: !reached ? 'grayscale(0.8) opacity(0.5)' : 'none',
            position: 'relative',
            flexShrink: 0
          } }, /*#__PURE__*/

        React.createElement("div", { style: { position: 'relative', width: `${chestSize}px`, height: `${chestSize}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        ms.imageURL ? /*#__PURE__*/React.createElement("img", { src: ms.imageURL, alt: "", style: { width: '100%', height: '100%', objectFit: 'contain' } }) : /*#__PURE__*/React.createElement("span", { style: { fontSize: `${chestSize - 4}px` } }, ms.icon),

        showDone && /*#__PURE__*/
        React.createElement("div", { style: { position: 'absolute', bottom: idx < 3 ? '-2px' : '0px', right: idx < 3 ? '-2px' : '0px', width: '14px', height: '14px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#fff', border: '1.5px solid #1a1a2e' } }, "\u2713"),

        isUnclaimed && !showDone && reached && /*#__PURE__*/
        React.createElement("div", { style: { position: 'absolute', bottom: '-2px', right: '-4px', width: '14px', height: '14px', borderRadius: '50%', background: '#ffd700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900, color: '#111', border: '1.5px solid #1a1a2e' } }, "!")

        ), /*#__PURE__*/

        React.createElement("div", { style: { fontSize: '11px', fontWeight: 600, color: '#9ca3af' } },
        ms.threshold >= 1000 ? (ms.threshold / 1000).toFixed(1) + 'K' : ms.threshold
        )
        ));

    })
    )
    ), /*#__PURE__*/


    React.createElement("div", { style: { margin: '10px 12px 0' } },
    window.FamilyTreasury ? /*#__PURE__*/
    React.createElement(window.FamilyTreasury, {
      family: family,
      familyMembers: familyMembers,
      currentUID: currentUID,
      currentUserData: currentUserData,
      lang: lang,
      canManage: canManage,
      onNotification: onNotification,
      isReadOnly: isReadOnly,
      showDonatePanel: showDonatePanel,
      setShowDonatePanel: setShowDonatePanel }
    ) :
    null
    ),


    family.announcement && /*#__PURE__*/
    React.createElement("div", { style: { margin: '10px 12px', background: 'linear-gradient(135deg,rgba(255,165,0,0.12),rgba(255,80,0,0.08))', border: '1px solid rgba(255,165,0,0.35)', borderRadius: '14px', padding: '12px 14px', position: 'relative', overflow: 'hidden' } }, /*#__PURE__*/
    React.createElement("div", { style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'linear-gradient(180deg,#ffd700,#ff8800)', borderRadius: '14px 0 0 14px' } }), /*#__PURE__*/
    React.createElement("div", { style: { paddingLeft: '8px' } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '10px', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '5px' } }, "\uD83D\uDCE2 ",
    lang === 'ar' ? 'إعلان' : 'Announcement',
    family.announcementBy && /*#__PURE__*/React.createElement("span", { style: { fontSize: '9px', color: '#9ca3af', fontWeight: 400, marginRight: '4px' } }, " \xB7 ", lang === 'ar' ? 'بواسطة:' : 'By:', " ", family.announcementBy)
    ), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '12px', color: '#fde68a', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: 600 } },
    family.announcement
    )
    )
    ),





    React.createElement("div", { style: { height: '12px' } }),


    showActModal && /*#__PURE__*/
    React.createElement("div", { style: { position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
      onClick: () => setShowActModal(false) }, /*#__PURE__*/
    React.createElement("div", { style: { width: '100%', maxWidth: '480px', background: 'linear-gradient(160deg,#0e0e22,#13122a)', borderRadius: '20px 20px 0 0', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' },
      onClick: (e) => e.stopPropagation() }, /*#__PURE__*/

    React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '14px', fontWeight: 800, color: '#00f2ff' } }, "\u26A1 ", lang === 'ar' ? 'شراء نشاط' : 'Buy Activeness'), /*#__PURE__*/
    React.createElement("button", { onClick: () => setShowActModal(false), style: { background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer', lineHeight: 1 } }, "\u2715")
    ), /*#__PURE__*/

    React.createElement("div", { style: { textAlign: 'center', padding: '10px 16px 4px', fontSize: '11px', color: '#9ca3af' } },
    lang === 'ar' ? 'رصيدك (إنتل):' : 'Your Intel:', " ", /*#__PURE__*/React.createElement("span", { style: { color: '#00f2ff', fontWeight: 800 } }, myIntel.toLocaleString(), " \uD83E\uDDE0")
    ), /*#__PURE__*/

    React.createElement("div", { style: { padding: '12px 14px 20px', display: 'flex', flexDirection: 'column', gap: '10px' } },
    ACTIVENESS_GIFTS.map((gift, i) => {
      var canAfford = myIntel >= gift.cost;
      return (/*#__PURE__*/
        React.createElement("button", {
          key: i,
          disabled: !canAfford || buyingAct,
          onClick: () => handleBuyActiveness(gift),
          style: { display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 16px', borderRadius: '14px', background: canAfford ? `${gift.color}14` : 'rgba(255,255,255,0.03)', border: `1px solid ${canAfford ? gift.color + '44' : 'rgba(255,255,255,0.06)'}`, cursor: canAfford ? 'pointer' : 'not-allowed', opacity: canAfford ? 1 : 0.45, textAlign: 'left', width: '100%', boxSizing: 'border-box', transition: 'all 0.15s' } }, /*#__PURE__*/

        React.createElement("div", { style: { width: '42px', height: '42px', borderRadius: '12px', background: `${gift.color}20`, border: `1px solid ${gift.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 } }, gift.icon), /*#__PURE__*/
        React.createElement("div", { style: { flex: 1 } }, /*#__PURE__*/
        React.createElement("div", { style: { fontSize: '13px', fontWeight: 800, color: gift.color } }, lang === 'ar' ? gift.label_ar : gift.label_en), /*#__PURE__*/
        React.createElement("div", { style: { fontSize: '10px', color: '#9ca3af', marginTop: '2px' } }, "\u26A1 +", gift.activeness.toLocaleString(), " ", lang === 'ar' ? 'نشاط' : 'Activeness')
        ), /*#__PURE__*/
        React.createElement("div", { style: { fontSize: '13px', fontWeight: 800, color: gift.color, flexShrink: 0 } }, gift.cost.toLocaleString(), " \uD83E\uDDE0")
        ));

    })
    )
    )
    )

    ));

};

window.FamilyProfile = FamilyProfile;
