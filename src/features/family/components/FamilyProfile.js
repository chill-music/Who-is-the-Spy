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
    var onNotification = window.showNotification || (() => {});

    // ── Activeness modal state ──
    var [showActModal, setShowActModal] = React.useState(false);
    var [buyingAct, setBuyingAct] = React.useState(false);
    var [upgradingClan, setUpgradingClan] = React.useState(false);
    var [weeklyChestBusy, setWeeklyChestBusy] = React.useState(false);

    var fmtFamilyNum = window.fmtFamilyNum || ((n) => (n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n)));
    var fLvl = window.FamilyConstants.getFamilyLevelConfig(family.level || 1);
    var myRole = window.FamilyConstants.getFamilyRole(family, currentUID);
    var canManage = myRole === 'owner' || myRole === 'admin';

    // ── Sign data: based on lastWeekActiveness ──
    var SIGN_FALLBACK = { level: 0, color: '#4b5563', glow: 'rgba(75,85,99,0.3)', defaultIcon: '🏠', bg: 'rgba(75,85,99,0.1)', name_ar: 'بدون ساين', name_en: 'No Sign', threshold: 0 };
    var lastWeekAct = family.lastWeekActiveness !== undefined ? family.lastWeekActiveness : (family.weeklyActiveness || 0);
    var signData = window.FamilyConstants.getFamilySignLevelData(lastWeekAct) || SIGN_FALLBACK;

    // ── Activeness progress ──
    var totalActiveness = family.activeness || 0;
    var weeklyActiveness = family.weeklyActiveness || 0;
    var ORIGINAL_MILESTONES = window.ACTIVENESS_MILESTONES || [
        { threshold: 8000,   chestType: 'normal',   icon: '📦', name_en: 'Normal Chest',   name_ar: 'صندوق عادي' },
        { threshold: 24000,  chestType: 'advanced', icon: '🎁', name_en: 'Advanced Chest', name_ar: 'صندوق متقدم' },
        { threshold: 60000,  chestType: 'rare',     icon: '💠', name_en: 'Rare Chest',     name_ar: 'صندوق نادر' },
        { threshold: 120000, chestType: 'epic',     icon: '💎', name_en: 'Epic Chest',     name_ar: 'صندوق ملحمي' },
        { threshold: 280000, chestType: 'super',    icon: '👑', name_en: 'Super Chest',    name_ar: 'صندوق أسطوري' },
    ];
    // Create sorted version for display while keeping original indices for functionality
    var WEEKLY_MILESTONES = ORIGINAL_MILESTONES.map((ms, originalIdx) => ({ ...ms, originalIdx })).sort((a, b) => a.threshold - b.threshold);

    // Level progress
    var FAMILY_LEVEL_CONFIGS = window.FamilyConstants?.FAMILY_LEVEL_CONFIG || window.FAMILY_LEVEL_CONFIG || [];
    var nextLevelCfg = FAMILY_LEVEL_CONFIGS.find(c => c.level === (fLvl.level + 1));
    var lvlProgress = nextLevelCfg
        ? Math.min(100, Math.round(((totalActiveness - fLvl.activeness) / (nextLevelCfg.activeness - fLvl.activeness)) * 100))
        : 100;
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
        var h = Math.floor((diff % 86400000) / 3600000);
        if (d > 0) return lang === 'ar' ? `${d} يوم ${h} ساعة` : `${d}d ${h}h`;
        return lang === 'ar' ? `${h} ساعة` : `${h}h`;
    };

    // Treasury chests claimed
    var treasuryInv = family.treasuryInventory || [];
    var familyTreasury = family.treasury || 0;
    var myIntel = (currentUserData && currentUserData.currency) || 0;

    // ── Photo upload ──
    var handlePhotoUpload = async (e) => {
        var file = e.target.files[0];
        if (!file) return;
        try {
            var dataUrl = await window.FamilyService.handleImageUpload(file);
            await window.FamilyService.saveInfo({ family, updates: { photoURL: dataUrl }, currentUID });
            onNotification(lang === 'ar' ? '✅ تم تحديث الصورة' : '✅ Photo updated');
        } catch (err) { console.error(err); }
    };

    // ── Buy activeness gift ──
    var ACTIVENESS_GIFTS = [
        { label_ar: 'هدية نشاط صغيرة',  label_en: 'Small Activity Gift',  activeness: 50,   cost: 500,   icon: '🎁',  color: '#4ade80' },
        { label_ar: 'هدية نشاط متوسطة', label_en: 'Medium Activity Gift', activeness: 500,  cost: 5000,  icon: '🎀',  color: '#60a5fa' },
        { label_ar: 'هدية نشاط كبيرة',  label_en: 'Large Activity Gift',  activeness: 5000, cost: 50000, icon: '🏆',  color: '#fbbf24' },
    ];

    var handleBuyActiveness = async (gift) => {
        if (buyingAct) return;
        if (myIntel < gift.cost) {
            onNotification(lang === 'ar' ? '❌ إنتل غير كافٍ' : '❌ Not enough Intel');
            return;
        }
        setBuyingAct(true);
        try {
            var { firebase, familiesCollection, usersCollection } = window;
            var uid = currentUID;
            var fid = family.id;
            await usersCollection.doc(uid).update({
                currency: firebase.firestore.FieldValue.increment(-gift.cost),
            });
            await familiesCollection.doc(fid).update({
                activeness: firebase.firestore.FieldValue.increment(gift.activeness),
                weeklyActiveness: firebase.firestore.FieldValue.increment(gift.activeness),
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
            onNotification(lang === 'ar' ? '❌ خزينة القبيلة غير كافية' : '❌ Clan treasury too low');
            return;
        }
        setUpgradingClan(true);
        try {
            var firebase = window.firebase;
            var familiesCollection = window.familiesCollection;
            var newLevel = (fLvl.level || 1) + 1;
            await familiesCollection.doc(family.id).update({
                treasury: firebase.firestore.FieldValue.increment(-(nextLevelCfg.upgradeCost || 0)),
                level: newLevel,
            });
            if (window.FamilyService?.postNews) {
                try {
                    await window.FamilyService.postNews(family.id, 'level_up',
                        lang === 'ar'
                            ? `⬆️ ترقية للمستوى ${newLevel}: ${nextLevelCfg.name_ar}`
                            : `⬆️ Leveled up to ${newLevel}: ${nextLevelCfg.name_en}`,
                        0,
                        { uid: currentUID, name: currentUserData?.displayName, photo: currentUserData?.photoURL }
                    );
                } catch (e) {
                    console.warn('postNews after level up failed', e);
                }
            }
            onNotification(`🆙 ${lang === 'ar' ? 'مبروك! ارتفع مستوى القبيلة!' : 'Congrats! Clan leveled up!'}`);
        } catch (e) {
            console.error(e);
            onNotification(lang === 'ar' ? '❌ فشل الترقية' : '❌ Upgrade failed');
        }
        setUpgradingClan(false);
    };

    // ── Chest status ──
    var getChestStatus = (chestType) => {
        var myItems = treasuryInv.filter(inv => inv.chestType === chestType);
        var myAssigned = myItems.find(inv => (inv.assignedTo || []).includes(currentUID));
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
            var reachedTotal = totalActiveness >= ms.threshold;

            if (canManage && reachedTotal && !milestoneClaimed) {
                var res = await window.FamilyService.handleClaimChest({
                    family, chestIdx: originalIdx, currentUID, lang, onNotification,
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
                    onNotification,
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
                onNotification(lang === 'ar' ? '⏳ لم يصل النشاط الكلي للحد بعد' : '⏳ Total activeness not at threshold yet');
            }
        } catch (e) {
            console.error(e);
            onNotification(lang === 'ar' ? '❌ حدث خطأ' : '❌ Something went wrong');
        } finally {
            setWeeklyChestBusy(false);
        }
    };

    return (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', background: '#0d0d1f' }}>

            {/* ══ HEADER ══ */}
            <div style={{
                background: family.photoURL
                    ? `linear-gradient(rgba(0,0,0,0.5),rgba(13,13,31,0.95)),url(${family.photoURL}) center/cover no-repeat`
                    : 'linear-gradient(160deg,#1a1040 0%,#0a0a2e 100%)',
                padding: '16px 16px 14px',
                position: 'relative',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Photo */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: '62px', height: '62px', borderRadius: '16px', border: `3px solid ${fLvl.color}`, overflow: 'hidden', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', boxShadow: `0 0 18px ${fLvl.color}66` }}>
                            {family.photoURL ? <img src={family.photoURL} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : (family.emblem || '🏠')}
                        </div>
                        {canManage && <button onClick={() => photoFileRef.current?.click()} style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,242,255,0.9)', border: '2px solid #0d0d1f', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}>📷</button>}
                        <input ref={photoFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Name + Sign */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '3px' }}>
                            <span style={{ fontSize: '18px', fontWeight: 900, color: 'white', fontStyle: 'italic', fontFamily: "'Outfit',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>{family.name}</span>
                            {signData.level > 0 && window.FamilySignBadge && <window.FamilySignBadge tag={family.tag} color={signData.color} small signLevel={signData.level} imageURL={family.signImageURL} />}
                        </div>
                        {/* Level badge + Member count */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '3px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: `${fLvl.color}22`, border: `1px solid ${fLvl.color}66`, borderRadius: '20px', padding: '2px 8px' }}>
                                {fLvl.imageURL
                                    ? <img src={fLvl.imageURL} alt="" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                                    : <span style={{ fontSize: '12px' }}>{fLvl.icon}</span>}
                                <span style={{ color: fLvl.color, fontSize: '10px', fontWeight: 900 }}>LV.{fLvl.level} {lang === 'ar' ? fLvl.name_ar : fLvl.name_en}</span>
                            </div>
                            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.45)' }}>👥 {family.members?.length || 0}/{fLvl.maxMembers}</span>
                        </div>
                        {/* ID + Weekly Rank */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>ID · {family.id?.slice(-6).toUpperCase()}</span>
                            {family.weeklyRank && (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.4)', borderRadius: '20px', padding: '1px 7px', fontSize: '9px', fontWeight: 800, color: '#ffd700' }}>
                                    🏅 #{family.weeklyRank}
                                </div>
                            )}
                            {myRole && window.FamilyRoleBadge && <window.FamilyRoleBadge role={myRole} lang={lang} small />}
                        </div>
                    </div>
                </div>

                {/* Level progress bar */}
                {nextLevelCfg && (
                    <div style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '9px', color: fLvl.color, fontWeight: 700 }}>{lang === 'ar' ? 'تقدم المستوى' : 'Level Progress'}</span>
                            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>{totalActiveness.toLocaleString()} / {nextLevelCfg.activeness.toLocaleString()}</span>
                        </div>
                        <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${lvlProgress}%`, background: `linear-gradient(90deg,${fLvl.color},${fLvl.color}bb)`, borderRadius: '10px', transition: 'width 0.5s ease' }} />
                        </div>
                    </div>
                )}
            </div>

            {/* ══ ACTIVENESS SECTION ══ */}
            <div style={{ margin: '10px 12px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px' }}>⚡</span>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#00f2ff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{lang === 'ar' ? 'النشاط الكلي' : 'Activeness'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>{totalActiveness.toLocaleString()}</span>
                        {nextLevelCfg && <span style={{ fontSize: '9px', color: '#6b7280' }}>/ {nextLevelCfg.activeness.toLocaleString()}</span>}
                        {!isReadOnly && (
                            <button
                                onClick={() => setShowActModal(true)}
                                style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg,#00f2ff,#7000ff)', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, lineHeight: 1, flexShrink: 0 }}
                            >+</button>
                        )}
                    </div>
                </div>
                {/* Progress bar */}
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden', marginBottom: nextLevelCfg ? '12px' : 0 }}>
                    <div style={{ height: '100%', width: `${nextLevelCfg ? lvlProgress : 100}%`, background: 'linear-gradient(90deg,#00f2ff,#7000ff)', borderRadius: '10px', transition: 'width 0.6s ease', boxShadow: '0 0 8px rgba(0,242,255,0.5)' }} />
                </div>

                {/* Next level requirements (inside Activeness card) */}
                {nextLevelCfg && (
                    <div style={{ padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '6px' }}>
                            🔒 {lang === 'ar' ? 'متطلبات المستوى التالي' : 'Next Level Requirements'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '10px', color: '#6b7280' }}>🔥 {lang === 'ar' ? 'النشاط الكلي' : 'Total Activeness'}</span>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: totalActiveness >= nextLevelCfg.activeness ? '#10b981' : '#f97316' }}>
                                {fmtFamilyNum(totalActiveness)} / {fmtFamilyNum(nextLevelCfg.activeness)} {totalActiveness >= nextLevelCfg.activeness ? '✅' : ''}
                            </span>
                        </div>
                        {nextLevelCfg.upgradeCost > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '10px', color: '#6b7280' }}>🏅 {lang === 'ar' ? 'خزينة القبيلة' : 'Treasury'}</span>
                                <span style={{ fontSize: '10px', fontWeight: 800, color: familyTreasury >= nextLevelCfg.upgradeCost ? '#10b981' : '#f97316' }}>
                                    {fmtFamilyNum(familyTreasury)} / {fmtFamilyNum(nextLevelCfg.upgradeCost)} {familyTreasury >= nextLevelCfg.upgradeCost ? '✅' : ''}
                                </span>
                            </div>
                        )}
                        {canManage && totalActiveness >= nextLevelCfg.activeness && familyTreasury >= (nextLevelCfg.upgradeCost || 0) && (
                            <button type="button" onClick={upgradeClan} disabled={upgradingClan} style={{ width: '100%', padding: '9px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#00f2ff,#7000ff)', color: 'white', fontSize: '12px', fontWeight: 900, cursor: upgradingClan ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: upgradingClan ? 0.7 : 1 }}>
                                🆙 {lang === 'ar' ? 'ترقية القبيلة' : 'Upgrade Clan'} → {lang === 'ar' ? nextLevelCfg.name_ar : nextLevelCfg.name_en}
                            </button>
                        )}
                        {canManage && (totalActiveness < nextLevelCfg.activeness || familyTreasury < (nextLevelCfg.upgradeCost || 0)) && (
                            <div style={{ fontSize: '10px', color: '#4b5563', textAlign: 'center', fontStyle: 'italic' }}>
                                {lang === 'ar' ? 'أكمل متطلبات النشاط والخزينة للترقية' : 'Meet activeness & treasury to upgrade'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ══ WEEKLY ACTIVENESS + TOTAL MILESTONE CHESTS ══ */}
            <div style={{ margin: '10px 12px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '12px 14px' }}>
                <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#00f2ff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        📅 {lang === 'ar' ? 'النشاط الأسبوعي وصناديق الإنجاز' : 'Weekly & milestone chests'}
                    </div>
                    <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '4px' }}>
                        {lang === 'ar' ? 'الصناديق حسب النشاط الكلي للقبيلة — اضغط للمطالبة أو الاستلام' : 'Chests unlock by total clan activeness — tap to claim to treasury or open your share'}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(0,242,255,0.06)', border: '1px solid rgba(0,242,255,0.2)', borderRadius: '12px', padding: '8px 10px', minWidth: '70px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'center' }}>
                        <div style={{ fontSize: '8px', color: '#9ca3af', fontWeight: 700 }}>{lang === 'ar' ? 'أسبوعي' : 'Weekly'}</div>
                        <div style={{ fontSize: '16px', fontWeight: 900, color: '#00f2ff', letterSpacing: '-0.5px' }}>{weeklyActiveness.toLocaleString()}</div>
                        <div style={{ fontSize: '7px', color: '#6b7280', lineHeight: 1.2 }}>{lang === 'ar' ? '🔄 إعادة:' : '🔄 Reset:'}</div>
                        <div style={{ fontSize: '8px', color: '#9ca3af', fontWeight: 700 }}>{getNextSunday()}</div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '6px', alignContent: 'start' }}>
                        {WEEKLY_MILESTONES.map((ms, idx) => {
                            var reached = totalActiveness >= ms.threshold;
                            var status = getChestStatus(ms.chestType);
                            var isClaimed = status === 'claimed';
                            var isUnclaimed = status === 'unclaimed';
                            var milestoneDone = (family.activenessClaimedMilestones || []).includes(ms.originalIdx);
                            var chestCfg = (window.CHEST_CONFIG && window.CHEST_CONFIG[ms.chestType]) || {};
                            var accent = chestCfg.color || '#f97316';
                            // Dynamic sizing based on threshold - smaller chests for lower thresholds
                            var chestSize = ms.threshold <= 24000 ? 'small' : ms.threshold <= 120000 ? 'medium' : 'large';
                            var iconSize = chestSize === 'small' ? '20px' : chestSize === 'medium' ? '26px' : '32px';
                            var minHeight = chestSize === 'small' ? '76px' : chestSize === 'medium' ? '84px' : '92px';
                            var fontSize = chestSize === 'small' ? '7px' : chestSize === 'medium' ? '8px' : '9px';
                            return (
                                <button
                                    type="button"
                                    key={ms.chestType + '-' + idx}
                                    onClick={() => onWeeklyChestClick(ms, idx)}
                                    disabled={weeklyChestBusy}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '6px 3px',
                                        minHeight: minHeight, borderRadius: '12px', border: `1.5px solid ${isClaimed ? '#10b981' : reached ? accent + '99' : 'rgba(255,255,255,0.1)'}`,
                                        background: isClaimed ? 'rgba(16,185,129,0.1)' : reached ? accent + '18' : 'rgba(255,255,255,0.03)',
                                        cursor: weeklyChestBusy ? 'wait' : 'pointer',
                                        filter: !reached ? 'grayscale(0.75) opacity(0.45)' : 'none',
                                        position: 'relative', boxShadow: isUnclaimed ? '0 0 12px rgba(255,215,0,0.35)' : 'none',
                                        transform: chestSize === 'large' ? 'scale(1.05)' : 'scale(1)',
                                    }}
                                >
                                    <div style={{ fontSize: '20px', lineHeight: 1, width: iconSize, height: iconSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {ms.imageURL ? <img src={ms.imageURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : ms.icon}
                                    </div>
                                    <div style={{ fontSize: fontSize, fontWeight: 800, color: reached ? accent : '#6b7280', textAlign: 'center', lineHeight: 1.15 }}>
                                        {ms.threshold >= 1000 ? (ms.threshold / 1000) + 'K' : ms.threshold}
                                    </div>
                                    <div style={{ fontSize: '6px', color: '#6b7280', textAlign: 'center', lineHeight: 1.2, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {lang === 'ar' ? (chestCfg.name_ar || ms.name_ar) : (chestCfg.name_en || ms.name_en)}
                                    </div>
                                    {canManage && reached && !milestoneDone && (
                                        <div style={{ fontSize: '6px', color: '#22d3ee', fontWeight: 800 }}>{lang === 'ar' ? 'لمّ للخزينة' : 'Claim'}</div>
                                    )}
                                    {isUnclaimed && (
                                        <div style={{ position: 'absolute', top: '2px', right: '2px', width: chestSize === 'small' ? '12px' : '14px', height: chestSize === 'small' ? '12px' : '14px', borderRadius: '50%', background: '#ffd700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: chestSize === 'small' ? '6px' : '8px', fontWeight: 900, color: '#111' }}>!</div>
                                    )}
                                    {isClaimed && (
                                        <div style={{ position: 'absolute', top: '2px', right: '2px', width: chestSize === 'small' ? '12px' : '14px', height: chestSize === 'small' ? '12px' : '14px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: chestSize === 'small' ? '6px' : '8px', color: '#fff' }}>✓</div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ══ TREASURY ══ */}
            <div style={{ margin: '10px 12px 0' }}>
                {window.FamilyTreasury
                    ? <window.FamilyTreasury
                        family={family}
                        familyMembers={familyMembers}
                        currentUID={currentUID}
                        currentUserData={currentUserData}
                        lang={lang}
                        canManage={canManage}
                        onNotification={onNotification}
                        isReadOnly={isReadOnly}
                        showDonatePanel={showDonatePanel}
                        setShowDonatePanel={setShowDonatePanel}
                      />
                    : null}
            </div>

            {/* ══ ANNOUNCEMENT ══ */}
            {family.announcement && (
                <div style={{ margin: '10px 12px', background: 'linear-gradient(135deg,rgba(255,165,0,0.12),rgba(255,80,0,0.08))', border: '1px solid rgba(255,165,0,0.35)', borderRadius: '14px', padding: '12px 14px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'linear-gradient(180deg,#ffd700,#ff8800)', borderRadius: '14px 0 0 14px' }} />
                    <div style={{ paddingLeft: '8px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '5px' }}>
                            📢 {lang === 'ar' ? 'إعلان' : 'Announcement'}
                            {family.announcementBy && <span style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 400, marginRight: '4px' }}> · {lang === 'ar' ? 'بواسطة:' : 'By:'} {family.announcementBy}</span>}
                        </div>
                        <div style={{ fontSize: '12px', color: '#fde68a', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: 600 }}>
                            {family.announcement}
                        </div>
                    </div>
                </div>
            )}

            {/* ══ JOIN (read-only) ══ */}
            {isReadOnly && !currentUserData?.familyId && (
                <div style={{ margin: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '18px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏠</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#e2e8f0', marginBottom: '12px' }}>{lang === 'ar' ? 'انضم لهذه العائلة' : 'Join this Family'}</div>
                    <button style={{ padding: '10px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#00f2ff,#7000ff)', color: 'white', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
                        ➕ {lang === 'ar' ? 'انضم الآن' : 'Join Now'}
                    </button>
                </div>
            )}

            <div style={{ height: '12px' }} />

            {/* ══ ACTIVENESS PURCHASE MODAL ══ */}
            {showActModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
                    onClick={() => setShowActModal(false)}>
                    <div style={{ width: '100%', maxWidth: '480px', background: 'linear-gradient(160deg,#0e0e22,#13122a)', borderRadius: '20px 20px 0 0', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}
                        onClick={e => e.stopPropagation()}>
                        {/* Modal header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#00f2ff' }}>⚡ {lang === 'ar' ? 'شراء نشاط' : 'Buy Activeness'}</div>
                            <button onClick={() => setShowActModal(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
                        </div>
                        {/* Balance */}
                        <div style={{ textAlign: 'center', padding: '10px 16px 4px', fontSize: '11px', color: '#9ca3af' }}>
                            {lang === 'ar' ? 'رصيدك (إنتل):' : 'Your Intel:'} <span style={{ color: '#00f2ff', fontWeight: 800 }}>{myIntel.toLocaleString()} 🧠</span>
                        </div>
                        {/* Gift options */}
                        <div style={{ padding: '12px 14px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {ACTIVENESS_GIFTS.map((gift, i) => {
                                var canAfford = myIntel >= gift.cost;
                                return (
                                    <button
                                        key={i}
                                        disabled={!canAfford || buyingAct}
                                        onClick={() => handleBuyActiveness(gift)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 16px', borderRadius: '14px', background: canAfford ? `${gift.color}14` : 'rgba(255,255,255,0.03)', border: `1px solid ${canAfford ? gift.color + '44' : 'rgba(255,255,255,0.06)'}`, cursor: canAfford ? 'pointer' : 'not-allowed', opacity: canAfford ? 1 : 0.45, textAlign: 'left', width: '100%', boxSizing: 'border-box', transition: 'all 0.15s' }}
                                    >
                                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${gift.color}20`, border: `1px solid ${gift.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{gift.icon}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', fontWeight: 800, color: gift.color }}>{lang === 'ar' ? gift.label_ar : gift.label_en}</div>
                                            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>⚡ +{gift.activeness.toLocaleString()} {lang === 'ar' ? 'نشاط' : 'Activeness'}</div>
                                        </div>
                                        <div style={{ fontSize: '13px', fontWeight: 800, color: gift.color, flexShrink: 0 }}>{gift.cost.toLocaleString()} 🧠</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

window.FamilyProfile = FamilyProfile;
