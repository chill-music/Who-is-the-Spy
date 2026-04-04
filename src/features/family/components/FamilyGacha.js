// Lazy access — avoids crash if PortalModal / Z not yet on window at parse time
var getZ = () => window.Z || {};
var getPortalModal = () => window.PortalModal || (({ children }) => children);
var fmtFamilyNum = (...args) => (window.fmtFamilyNum || ((n) => String(n)))(...args);

/**
 * FamilyGacha - Modal component for family gacha spins.
 */
var FamilyGacha = ({ family, currentUID, currentUserData, lang, onNotification, show, onClose }) => {
  var [spinning, setSpinning] = React.useState(false);
  var [result, setResult] = React.useState(null);
  var [spinMode, setSpinMode] = React.useState('free'); // 'free' or 'paid'
  var [showAllRewards, setShowAllRewards] = React.useState(false);

  // Use modern CSS from newly created gacha-modern.css
  React.useEffect(() => {
    const linkId = 'gacha-modern-css';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'src/features/family/gacha-modern.css';
      document.head.appendChild(link);
    }
  }, []);

  if (!show) return null;

  var cBasic = window.FamilyConstants?.GACHA_CONFIG_BASIC || window.GACHA_CONFIG_BASIC || window.GACHA_CONFIG || {};
  var cPrem = window.FamilyConstants?.GACHA_CONFIG_PREMIUM || window.GACHA_CONFIG_PREMIUM || window.GACHA_CONFIG || {};
  var cMax = window.FamilyConstants?.GACHA_CONFIG_MAX || window.GACHA_CONFIG_MAX || {};

  var currentGachaConfig = cBasic;
  if (family?.level >= 10) currentGachaConfig = cMax;
  else if (family?.level >= 5) currentGachaConfig = cPrem;

  var rewards = currentGachaConfig.rewards || [];

  var gachaCost = currentGachaConfig.paidCostPerSpin || 600;
  var gachaMax = currentGachaConfig.maxPaidSpinsDaily || 50;

  // 🔍 Helper to get metadata from SHOP_ITEMS in 04-data-game.js
  const getGachaItemMetadata = (reward) => {
    if (!reward || reward.type === 'currency' || reward.type === 'charisma' || reward.type === 'coins' || reward.type === 'chest') {
      return {
        label_ar: reward.label_ar || (reward.type === 'currency' ? `${reward.amount} إنتل` : (reward.type === 'charisma' ? `${reward.amount} كاريزما` : (reward.type === 'coins' ? `${reward.amount} عملة` : (reward.type === 'chest' ? (reward.chestType === 'bronze' ? 'صندوق برونزي' : 'صندوق') : 'جائزة')))),
        label_en: reward.label_en || (reward.type === 'currency' ? `${reward.amount} Intel` : (reward.type === 'charisma' ? `${reward.amount} Charisma` : (reward.type === 'coins' ? `${reward.amount} Coins` : (reward.type === 'chest' ? 'Chest' : 'Reward')))),
        icon: reward.icon || (reward.type === 'currency' ? '💰' : (reward.type === 'charisma' ? '⭐' : (reward.type === 'coins' ? '🏅' : '📦'))),
        imageUrl: null
      };
    }

    const shop = window.SHOP_ITEMS || {};
    const categories = ['frames', 'badges', 'titles', 'rings', 'profileEffects', 'gifts', 'gifts_vip', 'gifts_family', 'gifts_special'];
    
    for (const cat of categories) {
      if (shop[cat]) {
        const found = shop[cat].find(item => item.id === reward.id);
        if (found) {
          const img = found.preview?.startsWith('http') ? found.preview : (found.imageUrl || null);
          return {
            label_ar: found.name_ar,
            label_en: found.name_en,
            icon: !img ? (found.preview || found.emoji || '🎁') : null,
            imageUrl: img
          };
        }
      }
    }
    return { label_ar: '؟؟؟', label_en: '???', icon: '❓', imageUrl: null };
  };

  var handleSpin = async (mode) => {
    if (spinning) return;
    if (mode === 'paid') {
      if (spinsToday >= gachaMax) {
        onNotification(lang === 'ar' ? `⚠️ وصلت للحد الأقصى اليوم (${gachaMax})` : `⚠️ Daily limit reached (${gachaMax})`);
        return;
      }
      var userCurrency = currentUserData?.currency || 0;
      if (userCurrency < gachaCost) {
        onNotification(lang === 'ar' ? `❌ رصيدك غير كافٍ (تحتاج ${gachaCost} 💰)` : `❌ Insufficient funds (Need ${gachaCost} 💰)`);
        return;
      }
    }

    setSpinMode(mode);
    setSpinning(true);
    setResult(null);

    try {
      // Simulation delay for animation
      await new Promise((r) => setTimeout(r, 2000));

      var res = await window.FamilyService.handleGachaRoll({
        family,
        currentUID,
        currentUserData,
        mode,
        lang,
        onNotification
      });

      if (res) setResult(res);
    } catch (e) {
      console.error(e);
      onNotification(lang === 'ar' ? '❌ فشل السحب' : '❌ Spin failed');
    } finally {
      setSpinning(false);
    }
  };

  var PortalModal = getPortalModal();
  var Z = getZ();
  var today = new Date().toDateString();
  var userTodayKey = `${currentUID}_${today}`;
  var spinsToday = family?.gachaPaidSpins?.[userTodayKey] || 0;

  /* Helper to get rarity class */
  const getRarityClass = (rarity) => {
    if (rarity === 'legendary') return 'legendary';
    if (rarity === 'epic') return 'epic';
    if (rarity === 'rare') return 'rare';
    return '';
  };

  return (
    React.createElement(PortalModal, null,
      React.createElement("div", { 
        className: `modal-overlay ${family?.level >= 10 ? 'is-max-gacha' : ''}`, 
        onClick: onClose, 
        style: { 
          zIndex: (Z.MODAL_HIGH || 1000) + 10, 
          background: 'rgba(0,0,0,0.45)', 
          backdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '40px 0',
          overflowY: 'auto'
        } 
      },
        React.createElement("div", { className: `gacha-terminal-modal ${family?.level >= 10 ? 'is-max-gacha' : ''}`, onClick: (e) => e.stopPropagation() },
          
          /* ── Header Stats ── */
          React.createElement("div", { className: "gacha-header-stats" },
            React.createElement("div", { className: "gacha-stat-chip" },
              React.createElement("div", { className: "gacha-stat-icon" }, "💰"),
              React.createElement("div", null,
                React.createElement("div", { className: "gacha-stat-label" }, lang === 'ar' ? 'صندوق القبيلة' : 'Family Fund'),
                React.createElement("div", { className: "gacha-stat-value" }, fmtFamilyNum(family?.treasury || 0))
              )
            ),
            React.createElement("div", { className: "gacha-stat-chip" },
              React.createElement("div", { className: "gacha-stat-icon", style: { background: 'var(--gacha-cyan)' } }, "🧠"),
              React.createElement("div", null,
                React.createElement("div", { className: "gacha-stat-label" }, lang === 'ar' ? 'رصيدك إنتل' : 'Your Intel'),
                React.createElement("div", { className: "gacha-stat-value" }, fmtFamilyNum(currentUserData?.currency || 0))
              )
            )
          ),

          /* ── Machine Terminal ── */
          React.createElement("div", { className: "gacha-machine-container" },
            React.createElement("div", { className: "gacha-machine-frame" },
              
              /* Gacha Header / Type Badge */
              React.createElement("div", { className: `gacha-tier-badge ${family?.level >= 10 ? 'max' : (family?.level >= 5 ? 'premium' : 'basic')}` }, 
                family?.level >= 10
                  ? (lang === 'ar' ? '🌌 ماكس جاتشه' : '🌌 MAX GACHA')
                  : (family?.level >= 5 
                    ? (lang === 'ar' ? '🎰 الجاتشه المميزة' : '🎰 PREMIUM GACHA') 
                    : (lang === 'ar' ? '🎰 الجاتشه العادية' : '🎰 BASIC GACHA'))
              ),

              /* Upper Chamber (Floating Gems) */
              React.createElement("div", { className: "gacha-chamber" },
                React.createElement("div", { className: "gacha-chamber-light" }),
                
                /* Spinning Logic Visualization */
                spinning ? (
                  // Multiple capsules floating during spin
                  [1,2,3,4,5].map(i => (
                    React.createElement("div", { 
                      key: i, 
                      className: "gacha-capsule",
                      style: { 
                        '--curr-gem-color': i % 2 === 0 ? 'var(--gacha-cyan)' : 'var(--gacha-gold)',
                        left: `${15 + (i * 15)}%`,
                        top: `${20 + (Math.random() * 40)}%`,
                        animationDelay: `${i * 0.2}s`
                      } 
                    })
                  ))
                ) : result ? (
                  /* Result Reveal Area */
                  React.createElement("div", { className: "gacha-win-overlay", style: { textAlign: 'center' } },
                    (() => {
                      const meta = getGachaItemMetadata(result);
                      return React.Fragment ? React.createElement(React.Fragment, null,
                        meta.imageUrl ? 
                          React.createElement("img", { src: meta.imageUrl, style: { width: '80px', height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 0 15px var(--gacha-cyan))', marginBottom: '10px' } }) :
                          React.createElement("div", { style: { fontSize: '70px', filter: 'drop-shadow(0 0 25px var(--gacha-cyan))', marginBottom: '10px' } }, meta.icon),
                        React.createElement("div", { style: { fontSize: '18px', fontWeight: 900, color: '#fff', textTransform: 'uppercase' } }, 
                          lang === 'ar' ? meta.label_ar : meta.label_en
                        )
                      ) : null;
                    })()
                  )
                ) : (
                  /* Idle State (One giant gem) */
                  React.createElement("div", { className: "gacha-capsule", style: { width: '80px', height: '80px', '--curr-gem-color': 'var(--gacha-gold)' } })
                )
              ),

              /* Base / Dispenser */
              React.createElement("div", { className: "gacha-base" },
                React.createElement("div", { className: "gacha-dispenser-slot" }),
                React.createElement("div", { style: { fontSize: '9px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', fontWeight: 800 } },
                  lang === 'ar' ? 'جرب حظك الآن' : 'Test Your Luck'
                )
              )
            )
          ),

          /* ── Roll Actions ── */
          React.createElement("div", { className: "gacha-actions" },
            React.createElement("button", { 
              className: `gacha-btn free ${family?.level >= 10 ? 'max' : ''}`, 
              onClick: () => handleSpin('free'),
              disabled: spinning,
              style: { opacity: spinning ? 0.3 : 1 }
            },
              React.createElement("span", { className: "gacha-btn-label" }, lang === 'ar' ? 'سحبة مجانية' : 'FREE ROLL'),
              React.createElement("span", { className: "gacha-btn-sub" }, lang === 'ar' ? 'مرة يومياً' : 'Daily Reset')
            ),
            React.createElement("button", { 
              className: `gacha-btn gold ${family?.level >= 10 ? 'max' : ''}`, 
              onClick: () => handleSpin('paid'),
              disabled: spinning || spinsToday >= gachaMax,
              style: { opacity: (spinning || spinsToday >= gachaMax) ? 0.3 : 1 }
            },
              React.createElement("span", { className: "gacha-btn-label" }, lang === 'ar' ? `${gachaCost} كوينز` : `${gachaCost} ROLL`),
              React.createElement("span", { className: "gacha-btn-sub" }, lang === 'ar' ? `اليوم: ${spinsToday}/${gachaMax}` : `Today: ${spinsToday}/${gachaMax}`)
            )
          ),

          /* ── Reward Preview ── */
          React.createElement("div", { className: "gacha-reward-preview" },
            React.createElement("div", { className: "gacha-reward-header" },
              React.createElement("span", { className: "gacha-reward-title" }, lang === 'ar' ? 'الجوائز المتاحة' : 'Reward Pool'),
              React.createElement("span", { style: { fontSize: '9px', color: 'rgba(255,255,255,0.3)' } }, 'Service Fee: 1800/d')
            ),
            React.createElement("div", { className: "gacha-reward-grid" },
              rewards.slice(0, showAllRewards ? undefined : 8).map((r, i) => {
                const totalW = rewards.reduce((s, x) => s + (x.weight || 0), 0);
                const prob = totalW > 0 ? ((r.weight || 0) / totalW * 100).toFixed(1) : '0';
                const meta = getGachaItemMetadata(r);
                return React.createElement("div", { key: i, className: `gacha-reward-item tier-${family?.level >= 10 ? 'max' : 'normal'} ${getRarityClass(r.rarity)}` },
                  React.createElement("div", { className: "gacha-item-prob" }, prob, "%"),
                  meta.imageUrl ? 
                    React.createElement("img", { src: meta.imageUrl, className: "gacha-item-img", style: { width: '40px', height: '40px', objectFit: 'contain' } }) :
                    React.createElement("div", { className: "gacha-item-icon" }, meta.icon),
                  React.createElement("div", { className: "gacha-item-label" }, lang === 'ar' ? meta.label_ar : meta.label_en)
                );
              })
            ),
            /* Toggle Button */
            rewards.length > 8 && React.createElement("button", { 
              className: `gacha-toggle-btn ${showAllRewards ? 'expanded' : ''}`, 
              onClick: () => setShowAllRewards(!showAllRewards) 
            },
              React.createElement("span", null, showAllRewards ? 
                (lang === 'ar' ? 'عرض أقل' : 'SHOW LESS') : 
                (lang === 'ar' ? 'عرض الكل' : 'SHOW ALL')
              ),
              React.createElement("span", { className: "gacha-toggle-icon" }, "▼")
            )
          ),

          /* ── Close Footer ── */
          React.createElement("div", { style: { textAlign: 'center', paddingBottom: '20px' } },
            React.createElement("button", { 
              onClick: onClose,
              style: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: '11px', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase' }
            }, lang === 'ar' ? 'إغلاق' : 'Close Terminal')
          )
        )
      )
    )
  );
};

// No export default. Access via window.FamilyGacha.
window.FamilyGacha = FamilyGacha;
