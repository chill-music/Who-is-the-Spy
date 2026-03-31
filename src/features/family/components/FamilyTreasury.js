/**
 * FamilyTreasury - Component for managing family funds, chests, and upgrades.
 */
var MIN_DONATE_INTEL = 10;

var FamilyTreasury = ({
  family,
  currentUID,
  currentUserData,
  lang,
  show,
  onClose,
  onNotification,
  canManage,
  isReadOnly,
  familyMembers,
  showDonatePanel,
  setShowDonatePanel
}) => {
  // ─── Late-Binding Dependencies ───
  var {
    CHEST_CONFIG = {},
    ACTIVENESS_MILESTONES = [],
    Z = { MODAL_TOP: 10000 },
    PortalModal,
    FAMILY_COINS_SYMBOL = '🏅',
    FamilyService = window.FamilyService || {},
    fmtFamilyNum = window.fmtFamilyNum || ((n) => n?.toLocaleString() || '0')
  } = window;

  // ─── State ───
  var [activeTab, setActiveTab] = React.useState('vault');
  var [depositing, setDepositing] = React.useState(false);
  var [upgradeLoading, setUpgradeLoading] = React.useState(null);
  var [openingChest, setOpeningChest] = React.useState(false);
  var [showHistory, setShowHistory] = React.useState(false);
  var [history, setHistory] = React.useState([]);
  var [historyLoading, setHistoryLoading] = React.useState(false);
  var [internalShowDonate, setInternalShowDonate] = React.useState(false);
  var showDonate = typeof showDonatePanel !== 'undefined' ? showDonatePanel : internalShowDonate;
  var setShowDonate = setShowDonatePanel || setInternalShowDonate;

  var [donateAmount, setDonateAmount] = React.useState('');
  var [showChestModal, setShowChestModal] = React.useState(false);
  var [selectedChest, setSelectedChest] = React.useState(null);
  var [chestResult, setChestResult] = React.useState(null);
  var [showAssignModal, setShowAssignModal] = React.useState(false);
  var [assigningChest, setAssigningChest] = React.useState(null);
  var [selectedAssignees, setSelectedAssignees] = React.useState([]);
  var [assigningLoading, setAssigningLoading] = React.useState(false);

  var { treasury, treasuryInventory, level } = family || {};
  var fLvl = FamilyService.getFamilyLevelConfig(level || 1);

  var handleDonate = async () => {
    var amt = parseInt(donateAmount, 10);
    if (isNaN(amt) || amt < MIN_DONATE_INTEL) {
      onNotification(lang === 'ar' ? `❌ أقل تبرع ${MIN_DONATE_INTEL} إنتل` : `❌ Minimum donation is ${MIN_DONATE_INTEL} Intel`);
      return;
    }
    if ((currentUserData?.currency || 0) < amt) {
      onNotification(lang === 'ar' ? '❌ رصيدك غير كافٍ' : '❌ Insufficient balance');
      return;
    }
    try {
      await FamilyService.handleDonate({ family, amount: amt, currentUID, currentUserData, lang });
      setDonateAmount('');
      setShowDonate(false);
      onNotification(lang === 'ar' ? '✅ تم التبرع بنجاح' : '✅ Donation successful');
    } catch (e) {
      console.error(e);
      onNotification(lang === 'ar' ? '❌ فشل التبرع' : '❌ Donation failed');
    }
  };

  var assignChest = async () => {
    if (!assigningChest || selectedAssignees.length === 0) return;
    setAssigningLoading(true);
    try {
      await FamilyService.assignChestToMembers({
        family,
        chestIdx: assigningChest.inventoryIdx,
        selectedUIDs: selectedAssignees,
        currentUID,
        lang
      });
      setShowAssignModal(false);
      setAssigningChest(null);
      setSelectedAssignees([]);
      onNotification(lang === 'ar' ? '✅ تم توزيع الصندوق بنجاح' : '✅ Chest assigned successfully');
    } catch (e) {
      console.error('assignChest', e);
      onNotification(lang === 'ar' ? '❌ فشل التوزيع' : '❌ Assignment failed');
    } finally {
      setAssigningLoading(false);
    }
  };

  var openAssignedChest = async (idx) => {
    try {
      var res = await FamilyService.openAssignedChest({
        family,
        currentUID,
        currentUserData,
        inventoryIdx: idx,
        lang,
        onNotification
      });
      if (res) {
        setChestResult(res.myBundle);
        setSelectedChest({ cfg: res.cfg });
        setShowChestModal(true);
      }
    } catch (e) {
      onNotification(lang === 'ar' ? '❌ حدث خطأ أثناء فتح الصندوق' : '❌ Error opening chest');
    }
  };

  return (/*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/

    React.createElement("div", { style: { background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.4)', marginTop: '14px' } }, /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '14px', fontWeight: 800, color: '#e2e8f0', borderLeft: '3px solid #10b981', paddingLeft: '8px' } }, "\uD83D\uDEE1\uFE0F ", lang === 'ar' ? 'الخزينة' : 'Treasury'), /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px', padding: '3px 10px' } }, /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '13px' } }, "\uD83C\uDFC5"), /*#__PURE__*/
    React.createElement("span", { style: { fontSize: '12px', fontWeight: 800, color: '#10b981' } }, fmtFamilyNum(treasury)),
    !isReadOnly && /*#__PURE__*/React.createElement("button", { onClick: () => setShowDonate(!showDonate), style: { background: 'rgba(16,185,129,0.2)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontWeight: 900, lineHeight: 1 } }, "+")
    )
    )
    ),


    showDonate && /*#__PURE__*/
    React.createElement("div", { style: { marginBottom: '12px', padding: '12px', borderRadius: '12px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '11px', color: '#9ca3af', marginBottom: '8px' } }, lang === 'ar' ? 'تبرع بالبصيرة للقبيلة' : 'Donate Intel to Family'), /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '10px', color: '#6b7280', marginBottom: '8px' } }, lang === 'ar' ? `الحد الأدنى ${MIN_DONATE_INTEL} إنتل 🧠` : `Minimum ${MIN_DONATE_INTEL} Intel 🧠`), /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', gap: '8px' } }, /*#__PURE__*/
    React.createElement("input", { type: "number", value: donateAmount, onChange: (e) => setDonateAmount(e.target.value), min: MIN_DONATE_INTEL, placeholder: String(MIN_DONATE_INTEL), style: { flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', padding: '8px', fontSize: '13px' } }), /*#__PURE__*/
    React.createElement("button", { onClick: handleDonate, style: { background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '0 16px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' } },
    lang === 'ar' ? 'تبرع' : 'Donate'
    )
    )
    ),



    (() => {
      var visibleInventory = (treasuryInventory || []).map((item, i) => ({ item, i }));
      return visibleInventory.length > 0 ? /*#__PURE__*/
      React.createElement("div", { style: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' } },
      visibleInventory.map(({ item, i }) => {
        var cfg = CHEST_CONFIG[item.chestType];
        if (!cfg) return null;
        var ms = ACTIVENESS_MILESTONES.find((m) => m.chestType === item.chestType);
        var chestImg = ms?.imageURL || null;
        var myAssigned = (item.assignedTo || []).includes(currentUID);
        var myClaimCount = (item.claimedBy || {})[currentUID] || 0;
        var canClaim = myAssigned && myClaimCount < (item.maxClaimsPerMember || 1);
        var remainingClaims = myAssigned ? Math.max(0, (item.maxClaimsPerMember || 1) - myClaimCount) : 0;
        return (/*#__PURE__*/
          React.createElement("div", { key: i, style: { flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '72px', padding: '8px 4px', borderRadius: '12px', background: `${cfg.color}14`, border: `1px solid ${cfg.color}44`, cursor: 'pointer', position: 'relative' },
            onClick: () => {
              if (canManage && !canClaim && (!item.assignedTo || item.assignedTo.length === 0)) {
                setAssigningChest({ inventoryIdx: i, cfg, item });
                setShowAssignModal(true);
              } else {
                setSelectedChest({ cfg, item, inventoryIdx: i, canClaim, remainingClaims });
                setChestResult(null);
                setShowChestModal(true);
              }
            } },
          chestImg ? /*#__PURE__*/React.createElement("img", { src: chestImg, alt: "", style: { width: '44px', height: '44px', objectFit: 'contain' } }) : /*#__PURE__*/React.createElement("div", { style: { fontSize: '32px' } }, ms?.icon || '📦'), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: '9px', fontWeight: 700, color: cfg.color, textAlign: 'center' } }, lang === 'ar' ? cfg.name_ar : cfg.name_en),
          canClaim && /*#__PURE__*/
          React.createElement("div", { style: { position: 'absolute', top: '-5px', right: '-5px', width: '18px', height: '18px', borderRadius: '50%', background: '#ef4444', border: '2px solid #0d0d1f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 900, color: 'white' } },
          remainingClaims
          ), /*#__PURE__*/

          React.createElement("div", { style: { fontSize: '8px', color: '#9ca3af', textAlign: 'center' } },
          canManage && (!item.assignedTo || item.assignedTo.length === 0) ? lang === 'ar' ? 'توزيع' : 'Assign' : canClaim ? lang === 'ar' ? 'افتح' : 'Open' : lang === 'ar' ? 'تفاصيل' : 'Details'
          )
          ));

      })
      ) : /*#__PURE__*/

      React.createElement("div", { style: { textAlign: 'center', padding: '16px', color: '#6b7280', fontSize: '11px' } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: '28px', marginBottom: '6px' } }, "\uD83D\uDCE6"),
      lang === 'ar' ? 'لا توجد صناديق متاحة في الخزينة بعد' : 'No chests available in treasury yet'
      );

    })()
    ),


    showChestModal && selectedChest && /*#__PURE__*/
    React.createElement(PortalModal, null, /*#__PURE__*/
    React.createElement("div", { className: "modal-overlay", style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: Z.MODAL_TOP, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }, onClick: () => setShowChestModal(false) }, /*#__PURE__*/
    React.createElement("div", { className: "modal-content animate-pop", style: { background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '360px', overflow: 'hidden', pointerEvents: 'auto' }, onClick: (e) => e.stopPropagation() }, /*#__PURE__*/
    React.createElement("div", { style: { padding: '24px', textAlign: 'center' } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '64px', marginBottom: '16px' } }, selectedChest.cfg.icon), /*#__PURE__*/
    React.createElement("h3", { style: { fontSize: '20px', fontWeight: 900, color: 'white', marginBottom: '8px' } }, lang === 'ar' ? selectedChest.cfg.name_ar : selectedChest.cfg.name_en), /*#__PURE__*/
    !chestResult && selectedChest.canClaim && /*#__PURE__*/ React.createElement("div", { style: { fontSize: '13px', color: '#10b981', marginBottom: '12px', fontWeight: 800, padding: '6px 16px', background: 'rgba(16,185,129,0.1)', borderRadius: '20px', display: 'inline-block' } }, lang === 'ar' ? `\uD83C\uDF81 لديك فرصة للسحب من هذا الصندوق!` : `\uD83C\uDF81 You have a claim available!`), /*#__PURE__*/
    React.createElement("p", { style: { fontSize: '12px', color: '#9ca3af', marginBottom: '24px' } }, lang === 'ar' ? 'محتويات الصندوق المحتملة' : 'Potential chest contents'),

    chestResult ? /*#__PURE__*/
    React.createElement("div", { style: { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '16px', marginBottom: '24px' } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '14px', fontWeight: 800, color: '#10b981', marginBottom: '12px' } }, "\uD83C\uDF89 ", lang === 'ar' ? 'لقد ربحت!' : 'You Won!'), /*#__PURE__*/
    React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
    chestResult.currency > 0 && /*#__PURE__*/React.createElement("div", { style: { fontSize: '13px', color: '#e5e7eb' } }, "\uD83E\uDDE0 ", chestResult.currency, " ", lang === 'ar' ? 'إنتل' : 'Intel'),
    chestResult.coins > 0 && /*#__PURE__*/React.createElement("div", { style: { fontSize: '13px', color: '#e5e7eb' } }, FAMILY_COINS_SYMBOL, " ", chestResult.coins, " ", lang === 'ar' ? 'عملة' : 'Coins'),
    chestResult.charisma > 0 && /*#__PURE__*/React.createElement("div", { style: { fontSize: '13px', color: '#e5e7eb' } }, "\u2B50 ", chestResult.charisma, " ", lang === 'ar' ? 'كاريزما' : 'Charisma'),
    (chestResult.items || []).map((it, idx) => /*#__PURE__*/
    React.createElement("div", { key: idx, style: { fontSize: '13px', color: '#e5e7eb' } }, it.icon, " ", it.qty || 1, "\xD7 ", lang === 'ar' ? it.label_ar : it.label_en)
    )
    )
    ) : /*#__PURE__*/

    React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '24px' } },
    (selectedChest.item?.availableRewards || selectedChest.cfg.rewards).map((r, idx) => {
      var resolved = typeof window.resolveRewardItem === 'function' ? window.resolveRewardItem(r) : r;
      var qText = '1×';
      if (resolved.amountRemaining !== undefined) qText = fmtFamilyNum(resolved.amountRemaining);
      else if (resolved.amount) qText = fmtFamilyNum(resolved.amount);
      else if (resolved.qty) qText = resolved.qty + '×';
      var normalizedType = (resolved.type === 'titles') ? 'title' : (resolved.type === 'badges') ? 'badge' : resolved.type;
      if (['frame','title','badge'].includes(normalizedType)) {
          var dur = resolved.duration !== undefined ? resolved.duration : resolved.durationDays;
          if (dur) qText = dur + 'd';
      }
      return (/*#__PURE__*/
        React.createElement("div", { key: idx, style: { padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' } }, /*#__PURE__*/
        React.createElement("span", { style: { fontSize: '18px' } }, resolved.icon), /*#__PURE__*/
        React.createElement("div", { style: { textAlign: 'left' } }, /*#__PURE__*/
        React.createElement("div", { style: { fontSize: '11px', fontWeight: 800, color: 'white' } }, qText), /*#__PURE__*/
        React.createElement("div", { style: { fontSize: '9px', color: '#6b7280' } }, lang === 'ar' ? resolved.label_ar : resolved.label_en)
        )
        ));

    })
    ), /*#__PURE__*/


    React.createElement("div", { style: { display: 'flex', gap: '10px' } }, /*#__PURE__*/
    React.createElement("button", { onClick: () => setShowChestModal(false), style: { flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: '14px', fontWeight: 800, cursor: 'pointer' } },
    lang === 'ar' ? 'إغلاق' : 'Close'
    ),
    selectedChest.canClaim && !chestResult && /*#__PURE__*/ React.createElement("button", { 
        onClick: () => {
            openAssignedChest(selectedChest.inventoryIdx);
        }, 
        style: { flex: 2, padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontSize: '14px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' } },
        lang === 'ar' ? `استلام (${selectedChest.remainingClaims} متبقي)` : `Claim Reward (${selectedChest.remainingClaims} left)`
    )
    )
    )
    )
    )
    ),



    showAssignModal && assigningChest && /*#__PURE__*/
    React.createElement(PortalModal, null, /*#__PURE__*/
    React.createElement("div", { className: "modal-overlay", style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: Z.MODAL_TOP, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' } }, /*#__PURE__*/
    React.createElement("div", { className: "modal-content animate-pop", style: { background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '360px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', pointerEvents: 'auto' } }, /*#__PURE__*/
    React.createElement("div", { style: { padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' } }, /*#__PURE__*/
    React.createElement("div", { style: { fontSize: '40px', marginBottom: '8px' } }, assigningChest.cfg.icon), /*#__PURE__*/
    React.createElement("h3", { style: { fontSize: '16px', fontWeight: 900, color: 'white' } }, lang === 'ar' ? 'توزيع الصندوق' : 'Assign Chest'), /*#__PURE__*/
    React.createElement("p", { style: { fontSize: '11px', color: '#9ca3af' } }, lang === 'ar' ? `اختر الأعضاء للحصول على نصيب من ${assigningChest.cfg.name_ar}` : `Select members to share ${assigningChest.cfg.name_en}`)
    ), /*#__PURE__*/

    React.createElement("div", { style: { flex: 1, overflowY: 'auto', padding: '10px' } },
    (familyMembers || []).map((m) => {
      var isSelected = selectedAssignees.includes(m.id);
      return (/*#__PURE__*/
        React.createElement("div", { key: m.id, onClick: () => {
            if (isSelected) setSelectedAssignees(selectedAssignees.filter((id) => id !== m.id));else
            setSelectedAssignees([...selectedAssignees, m.id]);
          }, style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '12px', background: isSelected ? 'rgba(16,185,129,0.1)' : 'transparent', cursor: 'pointer', marginBottom: '4px' } }, /*#__PURE__*/
        React.createElement("img", { src: m.photoURL || 'icos/default_avatar.png', alt: "", style: { width: '32px', height: '32px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' } }), /*#__PURE__*/
        React.createElement("div", { style: { flex: 1, fontSize: '13px', color: isSelected ? '#10b981' : '#e5e7eb', fontWeight: isSelected ? 800 : 400 } }, m.displayName), /*#__PURE__*/
        React.createElement("div", { style: { width: '20px', height: '20px', borderRadius: '6px', border: '2px solid', borderColor: isSelected ? '#10b981' : 'rgba(255,255,255,0.2)', background: isSelected ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        isSelected && /*#__PURE__*/React.createElement("span", { style: { color: 'white', fontSize: '12px', fontWeight: 900 } }, "\u2713")
        )
        ));

    })
    ), /*#__PURE__*/

    React.createElement("div", { style: { padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px' } }, /*#__PURE__*/
    React.createElement("button", { onClick: () => {setShowAssignModal(false);setAssigningChest(null);setSelectedAssignees([]);}, style: { flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: '13px', fontWeight: 800, cursor: 'pointer' } },
    lang === 'ar' ? 'إلغاء' : 'Cancel'
    ), /*#__PURE__*/
    React.createElement("button", { onClick: assignChest, disabled: assigningLoading || selectedAssignees.length === 0, style: { flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontSize: '13px', fontWeight: 800, cursor: selectedAssignees.length ? 'pointer' : 'not-allowed', opacity: selectedAssignees.length ? 1 : 0.5 } },
    assigningLoading ? '...' : lang === 'ar' ? 'توزيع' : 'Assign'
    )
    )
    )
    )
    )

    ));

};

window.FamilyTreasury = FamilyTreasury;
// No export default.