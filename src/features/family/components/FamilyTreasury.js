var { 
    CHEST_CONFIG, 
    ACTIVENESS_MILESTONES, 
    Z, 
    PortalModal,
    FAMILY_COINS_SYMBOL
} = window;
var { getFamilyLevelConfig } = window.FamilyConstants || window;
var { 
    familiesCollection, 
    db, 
    firebase 
} = window;
var FamilyService = window.FamilyService;
var fmtFamilyNum = window.fmtFamilyNum || ((n) => n?.toLocaleString() || '0');
var S = window.FamilyShared?.S || {};

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
    // ─── State ───
    const [activeTab, setActiveTab] = React.useState('vault');
    const [depositing, setDepositing] = React.useState(false);
    const [upgradeLoading, setUpgradeLoading] = React.useState(null);
    const [openingChest, setOpeningChest] = React.useState(false);
    const [showHistory, setShowHistory] = React.useState(false);
    const [history, setHistory] = React.useState([]);
    const [historyLoading, setHistoryLoading] = React.useState(false);
    const [internalShowDonate, setInternalShowDonate] = React.useState(false);
    var showDonate = (typeof showDonatePanel !== 'undefined') ? showDonatePanel : internalShowDonate;
    var setShowDonate = setShowDonatePanel || setInternalShowDonate;
    
    const [donateAmount, setDonateAmount] = React.useState('');
    const [showChestModal, setShowChestModal] = React.useState(false);
    const [selectedChest, setSelectedChest] = React.useState(null);
    const [chestResult, setChestResult] = React.useState(null);
    const [showAssignModal, setShowAssignModal] = React.useState(false);
    const [assigningChest, setAssigningChest] = React.useState(null);
    const [selectedAssignees, setSelectedAssignees] = React.useState([]);
    const [assigningLoading, setAssigningLoading] = React.useState(false);

    const { treasury, treasuryInventory, level } = family || {};
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

    return (
        <React.Fragment>
            {/* ── Treasury Section (milestone chests are on Profile → Weekly & milestone chests) ── */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.4)', marginTop: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#e2e8f0', borderLeft: '3px solid #10b981', paddingLeft: '8px' }}>🛡️ {lang === 'ar' ? 'الخزينة' : 'Treasury'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px', padding: '3px 10px' }}>
                            <span style={{ fontSize: '13px' }}>🏅</span>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981' }}>{fmtFamilyNum(treasury)}</span>
                            {!isReadOnly && <button onClick={() => setShowDonate(!showDonate)} style={{ background: 'rgba(16,185,129,0.2)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontWeight: 900, lineHeight: 1 }}>+</button>}
                        </div>
                    </div>
                </div>

                {/* Donate Panel */}
                {showDonate && (
                    <div style={{ marginBottom: '12px', padding: '12px', borderRadius: '12px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px' }}>{lang === 'ar' ? 'تبرع بالبصيرة للقبيلة' : 'Donate Intel to Family'}</div>
                        <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '8px' }}>{lang === 'ar' ? `الحد الأدنى ${MIN_DONATE_INTEL} إنتل 🧠` : `Minimum ${MIN_DONATE_INTEL} Intel 🧠`}</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="number" value={donateAmount} onChange={(e) => setDonateAmount(e.target.value)} min={MIN_DONATE_INTEL} placeholder={String(MIN_DONATE_INTEL)} style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', padding: '8px', fontSize: '13px' }} />
                            <button onClick={handleDonate} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '0 16px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                                {lang === 'ar' ? 'تبرع' : 'Donate'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Chest inventory */}
                {(() => {
                    var visibleInventory = (treasuryInventory || []).map((item, i) => ({ item, i }));
                    return visibleInventory.length > 0 ? (
                        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                            {visibleInventory.map(({ item, i }) => {
                                var cfg = CHEST_CONFIG[item.chestType];
                                if (!cfg) return null;
                                var ms = ACTIVENESS_MILESTONES.find(m => m.chestType === item.chestType);
                                var chestImg = ms?.imageURL || null;
                                var myAssigned = (item.assignedTo || []).includes(currentUID);
                                var myClaimCount = (item.claimedBy || {})[currentUID] || 0;
                                var canClaim = myAssigned && myClaimCount < (item.maxClaimsPerMember || 1);
                                var remainingClaims = myAssigned ? Math.max(0, (item.maxClaimsPerMember || 1) - myClaimCount) : 0;
                                return (
                                    <div key={i} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '72px', padding: '8px 4px', borderRadius: '12px', background: `${cfg.color}14`, border: `1px solid ${cfg.color}44`, cursor: 'pointer', position: 'relative' }}
                                        onClick={() => {
                                            if (canManage && !canClaim && (!item.assignedTo || item.assignedTo.length === 0)) {
                                                setAssigningChest({ inventoryIdx: i, cfg, item });
                                                setShowAssignModal(true);
                                            } else if (canClaim) {
                                                openAssignedChest(i);
                                            } else {
                                                setSelectedChest({ cfg, item });
                                                setChestResult(null);
                                                setShowChestModal(true);
                                            }
                                        }}>
                                        {chestImg ? <img src={chestImg} alt="" style={{ width: '44px', height: '44px', objectFit: 'contain' }} /> : <div style={{ fontSize: '32px' }}>{ms?.icon || '📦'}</div>}
                                        <div style={{ fontSize: '9px', fontWeight: 700, color: cfg.color, textAlign: 'center' }}>{lang === 'ar' ? cfg.name_ar : cfg.name_en}</div>
                                        {canClaim && (
                                            <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '18px', height: '18px', borderRadius: '50%', background: '#ef4444', border: '2px solid #0d0d1f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 900, color: 'white' }}>
                                                {remainingClaims}
                                            </div>
                                        )}
                                        <div style={{ fontSize: '8px', color: '#9ca3af', textAlign: 'center' }}>
                                            {canManage && (!item.assignedTo || item.assignedTo.length === 0) ? (lang === 'ar' ? 'توزيع' : 'Assign') : canClaim ? (lang === 'ar' ? 'افتح' : 'Open') : (lang === 'ar' ? 'تفاصيل' : 'Details')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '16px', color: '#6b7280', fontSize: '11px' }}>
                            <div style={{ fontSize: '28px', marginBottom: '6px' }}>📦</div>
                            {lang === 'ar' ? 'لا توجد صناديق متاحة في الخزينة بعد' : 'No chests available in treasury yet'}
                        </div>
                    );
                })()}
            </div>

            {/* ── Chest Detail Modal ── */}
            {showChestModal && selectedChest && (
                <PortalModal>
                    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: Z.MODAL_TOP, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowChestModal(false)}>
                        <div className="modal-content animate-pop" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '360px', overflow: 'hidden', pointerEvents: 'auto' }} onClick={e => e.stopPropagation()}>
                            <div style={{ padding: '24px', textAlign: 'center' }}>
                                <div style={{ fontSize: '64px', marginBottom: '16px' }}>{selectedChest.cfg.icon}</div>
                                <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>{lang === 'ar' ? selectedChest.cfg.name_ar : selectedChest.cfg.name_en}</h3>
                                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '24px' }}>{lang === 'ar' ? 'محتويات الصندوق المحتملة' : 'Potential chest contents'}</p>

                                {chestResult ? (
                                    <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '16px', marginBottom: '24px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#10b981', marginBottom: '12px' }}>🎉 {lang === 'ar' ? 'لقد ربحت!' : 'You Won!'}</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {chestResult.currency > 0 && <div style={{ fontSize: '13px', color: '#e5e7eb' }}>🧠 {chestResult.currency} {lang === 'ar' ? 'إنتل' : 'Intel'}</div>}
                                            {chestResult.coins > 0 && <div style={{ fontSize: '13px', color: '#e5e7eb' }}>{FAMILY_COINS_SYMBOL} {chestResult.coins} {lang === 'ar' ? 'عملة' : 'Coins'}</div>}
                                            {chestResult.charisma > 0 && <div style={{ fontSize: '13px', color: '#e5e7eb' }}>⭐ {chestResult.charisma} {lang === 'ar' ? 'كاريزما' : 'Charisma'}</div>}
                                            {(chestResult.items || []).map((it, idx) => (
                                                <div key={idx} style={{ fontSize: '13px', color: '#e5e7eb' }}>{it.icon} {it.qty || 1}× {lang === 'ar' ? it.label_ar : it.label_en}</div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '24px' }}>
                                        {(selectedChest.item?.availableRewards || selectedChest.cfg.rewards).map((r, idx) => {
                                            const resolved = typeof window.resolveRewardItem === 'function' ? window.resolveRewardItem(r) : r;
                                            return (
                                                <div key={idx} style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '18px' }}>{resolved.icon}</span>
                                                    <div style={{ textAlign: 'left' }}>
                                                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'white' }}>{resolved.amountRemaining !== undefined ? fmtFamilyNum(resolved.amountRemaining) : (resolved.amount ? fmtFamilyNum(resolved.amount) : (resolved.qty ? resolved.qty + '×' : '1×'))}</div>
                                                        <div style={{ fontSize: '9px', color: '#6b7280' }}>{lang === 'ar' ? resolved.label_ar : resolved.label_en}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <button onClick={() => setShowChestModal(false)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>
                                    {lang === 'ar' ? 'إغلاق' : 'Close'}
                                </button>
                            </div>
                        </div>
                    </div>
                </PortalModal>
            )}

            {/* ── Assign Chest Modal ── */}
            {showAssignModal && assigningChest && (
                <PortalModal>
                    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: Z.MODAL_TOP, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div className="modal-content animate-pop" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '360px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', pointerEvents: 'auto' }}>
                            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                <div style={{ fontSize: '40px', marginBottom: '8px' }}>{assigningChest.cfg.icon}</div>
                                <h3 style={{ fontSize: '16px', fontWeight: 900, color: 'white' }}>{lang === 'ar' ? 'توزيع الصندوق' : 'Assign Chest'}</h3>
                                <p style={{ fontSize: '11px', color: '#9ca3af' }}>{lang === 'ar' ? `اختر الأعضاء للحصول على نصيب من ${assigningChest.cfg.name_ar}` : `Select members to share ${assigningChest.cfg.name_en}`}</p>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                                {(familyMembers || []).map(m => {
                                    var isSelected = selectedAssignees.includes(m.id);
                                    return (
                                        <div key={m.id} onClick={() => {
                                            if (isSelected) setSelectedAssignees(selectedAssignees.filter(id => id !== m.id));
                                            else setSelectedAssignees([...selectedAssignees, m.id]);
                                        }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '12px', background: isSelected ? 'rgba(16,185,129,0.1)' : 'transparent', cursor: 'pointer', marginBottom: '4px' }}>
                                            <img src={m.photoURL || 'https://raw.githubusercontent.com/chill-music/Who-is-the-Spy/refs/heads/main/icos/default_avatar.png'} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
                                            <div style={{ flex: 1, fontSize: '13px', color: isSelected ? '#10b981' : '#e5e7eb', fontWeight: isSelected ? 800 : 400 }}>{m.displayName}</div>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: '2px solid', borderColor: isSelected ? '#10b981' : 'rgba(255,255,255,0.2)', background: isSelected ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {isSelected && <span style={{ color: 'white', fontSize: '12px', fontWeight: 900 }}>✓</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px' }}>
                                <button onClick={() => { setShowAssignModal(false); setAssigningChest(null); setSelectedAssignees([]); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
                                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button onClick={assignChest} disabled={assigningLoading || selectedAssignees.length === 0} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontSize: '13px', fontWeight: 800, cursor: selectedAssignees.length ? 'pointer' : 'not-allowed', opacity: selectedAssignees.length ? 1 : 0.5 }}>
                                    {assigningLoading ? '...' : lang === 'ar' ? 'توزيع' : 'Assign'}
                                </button>
                            </div>
                        </div>
                    </div>
                </PortalModal>
            )}
        </React.Fragment>
    );
};

window.FamilyTreasury = FamilyTreasury;
// No export default.
